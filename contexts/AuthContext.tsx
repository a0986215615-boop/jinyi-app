import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Appointment, Doctor, SiteSettings } from '../types';
import { DOCTORS as INITIAL_DOCTORS } from '../constants';
import { saveUserData, loadUserData, loadAllUsersData, isSupabaseConfigured, subscribeToUserData } from '../services/supabaseService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (user: Omit<User, 'id' | 'role'>) => Promise<boolean>;
  logout: () => void;

  // User Management (Admin)
  users: User[];
  deleteUser: (id: string) => void;
  updateUser: (id: string, updates: Partial<User>) => void;

  // Appointment Management
  appointments: Appointment[];
  userAppointments: Appointment[];
  addAppointment: (apt: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  cancelAppointment: (id: string, reason?: string) => void;
  deleteAppointment: (id: string) => void;

  // Doctor Management
  doctors: Doctor[];
  updateDoctor: (id: string, updates: Partial<Doctor>) => void;

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  appName: '近易動物醫院',
  welcomeTitle: '守護毛孩的健康',
  welcomeSubtitle: '從美好的一天開始',
  description: '全天候線上掛號，整合 AI 症狀分析，為您的寵物精準推薦合適的醫療服務。'
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Simulated DB
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Global appointments
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS); // Manage doctors in state
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Load data from localStorage on mount (Initial load)
  useEffect(() => {
    const storedUsers = localStorage.getItem('hb_users');
    const storedAppts = localStorage.getItem('hb_appointments');
    const storedDoctors = localStorage.getItem('hb_doctors');
    const storedSettings = localStorage.getItem('hb_settings');
    const sessionUser = localStorage.getItem('hb_session_user');

    let loadedUsers: User[] = [];
    if (storedUsers) {
      loadedUsers = JSON.parse(storedUsers);
    }

    // Initialize default admin if not exists
    const adminEmail = 'admin@clinic.com';
    if (!loadedUsers.find(u => u.email === adminEmail)) {
      const adminUser: User = {
        id: 'admin-001',
        name: '診所管理員',
        email: adminEmail,
        phone: '0000000000',
        password: 'admin',
        role: 'admin'
      };
      loadedUsers.push(adminUser);
    }

    // Initialize test user if not exists
    const testEmail = 'test@clinic.com';
    if (!loadedUsers.find(u => u.email === testEmail)) {
      const testUser: User = {
        id: 'test-001',
        name: '測試員',
        email: testEmail,
        phone: '0912345678',
        password: 'test',
        role: 'user'
      };
      loadedUsers.push(testUser);
    }

    setUsers(loadedUsers);
    if (storedAppts) setAppointments(JSON.parse(storedAppts));
    if (storedDoctors) setDoctors(JSON.parse(storedDoctors));
    if (storedSettings) setSettings(JSON.parse(storedSettings));

    // Auto-login from session
    if (sessionUser) {
      const parsedUser = JSON.parse(sessionUser);
      setUser(parsedUser);
      // If Supabase is configured, try to load fresh data
      if (isSupabaseConfigured()) {
        loadDataFromSupabase(parsedUser.id);
      }
    }
  }, []);

  // Helper to load data from Supabase
  const loadDataFromSupabase = async (userId: string) => {
    // Check if user is admin
    const isAdminUser = users.find(u => u.id === userId)?.role === 'admin' || userId === 'admin-001'; // Fallback check

    if (isAdminUser) {
      console.log('Admin logged in, loading all data...');
      const allData = await loadAllUsersData();

      let allAppointments: Appointment[] = [];

      allData.forEach(userData => {
        if (userData.appointments && Array.isArray(userData.appointments)) {
          allAppointments = [...allAppointments, ...userData.appointments];
        }
      });

      // Remove duplicates based on ID if any
      const uniqueAppointments = Array.from(new Map(allAppointments.map(item => [item.id, item])).values());

      if (uniqueAppointments.length > 0) {
        setAppointments(uniqueAppointments);
        console.log(`Loaded ${uniqueAppointments.length} appointments for admin.`);
      }

      // Load admin's own settings
      const adminData = await loadUserData(userId);
      if (adminData && adminData.settings) {
        setSettings(adminData.settings);
        console.log('Admin settings loaded from Supabase');
      }
    } else {
      // Normal user
      const data = await loadUserData(userId);
      if (data) {
        if (data.appointments) setAppointments(data.appointments);
        if (data.settings) setSettings(data.settings);
        console.log('Data loaded from Supabase for user');
      }
    }
  };

  // Helper to save data to Supabase
  const saveDataToSupabase = async () => {
    if (!user || !isSupabaseConfigured()) return;

    // We save the entire state relevant to the user
    const dataToSave = {
      appointments,
      // Only admins or specific users might manage global settings, 
      // but for this simple version, settings are synced per user.
      settings
    };

    await saveUserData(user.id, dataToSave);
  };

  // Sync to localStorage AND Supabase on changes
  useEffect(() => {
    if (users.length > 0) localStorage.setItem('hb_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('hb_appointments', JSON.stringify(appointments));
    saveDataToSupabase(); // Save to Supabase when appointments change
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('hb_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('hb_settings', JSON.stringify(settings));
    saveDataToSupabase(); // Save to Supabase when settings change
  }, [settings]);

  // Setup Real-time Subscription
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    if (user && isSupabaseConfigured()) {
      console.log('Enabling real-time sync for user:', user.id);
      subscription = subscribeToUserData(user.id, (newData) => {
        if (newData) {
          if (newData.appointments) {
            console.log('Real-time update received:', newData.appointments.length, 'appointments');
            // For admin, merge all appointments; for normal users, replace
            if (user.role === 'admin') {
              // Admin should see all appointments, so we might need to reload
              loadDataFromSupabase(user.id);
            } else {
              setAppointments(newData.appointments);
            }
          }
          if (newData.settings) {
            console.log('Real-time settings update received');
            setSettings(newData.settings);
          }
        }
      });
    }

    return () => {
      if (subscription) {
        console.log('Cleaning up real-time subscription');
        subscription.unsubscribe();
      }
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hb_session_user', JSON.stringify(user));
      loadDataFromSupabase(user.id); // Load initial data on login
    } else {
      localStorage.removeItem('hb_session_user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const register = async (newUser: Omit<User, 'id' | 'role'>) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const exists = users.some(u => u.email === newUser.email);
    if (exists) return false;

    const createdUser: User = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9),
      role: 'user' // Default role
    };
    setUsers(prev => [...prev, createdUser]);
    setUser(createdUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    // If the deleted user is the current logged in user (edge case), logout
    if (user && user.id === id) {
      logout();
    }
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    // If updating the currently logged in user, update session state as well
    if (user && user.id === id) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addAppointment = (apt: Appointment) => {
    const newApt = { ...apt, userId: user?.id, status: 'booked' as const };
    setAppointments(prev => [newApt, ...prev]);
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    // Update local state first for immediate UI feedback
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt));

    // If admin is logged in, we need to sync this change to the specific user's data in Supabase
    if (user?.role === 'admin' && isSupabaseConfigured()) {
      const targetAppointment = appointments.find(a => a.id === id);
      if (targetAppointment && targetAppointment.userId) {
        const targetUserId = targetAppointment.userId;

        try {
          // 1. Load target user's data
          const userData = await loadUserData(targetUserId);
          if (userData && userData.appointments) {
            // 2. Update the specific appointment in their data
            const updatedUserAppointments = userData.appointments.map((apt: Appointment) =>
              apt.id === id ? { ...apt, ...updates } : apt
            );

            // 3. Save back to Supabase
            await saveUserData(targetUserId, {
              ...userData,
              appointments: updatedUserAppointments
            });
            console.log(`Synced appointment update to user ${targetUserId}`);
          }
        } catch (error) {
          console.error("Failed to sync admin update to user:", error);
        }
      }
    }
  };

  const cancelAppointment = (id: string, reason: string = '醫師臨時行程異動') => {
    updateAppointment(id, {
      status: 'cancelled',
      cancellationReason: reason
    });
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const updateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors(prev => prev.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Filter appointments for the current user (exclude cancelled ones from the main view if desired, but showing history is good)
  const userAppointments = appointments.filter(apt => apt.userId === user?.id);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      users,
      deleteUser,
      updateUser,
      appointments,
      addAppointment,
      updateAppointment,
      cancelAppointment,
      deleteAppointment,
      userAppointments,
      doctors,
      updateDoctor,
      settings,
      updateSettings
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};