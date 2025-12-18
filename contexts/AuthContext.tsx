import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Appointment, Doctor, SiteSettings } from '../types';
import { DOCTORS as INITIAL_DOCTORS } from '../constants';

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
  appName: '康健獸醫診所',
  welcomeTitle: '守護毛孩的健康',
  welcomeSubtitle: '從智慧預約開始',
  description: '全天候線上掛號，整合 AI 症狀分析，為您的寵物精準推薦合適的醫療服務。'
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Simulated DB
  const [appointments, setAppointments] = useState<Appointment[]>([]); // Global appointments
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS); // Manage doctors in state
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  // Load data from localStorage on mount
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

    // Update users in local storage if we added defaults
    if (!storedUsers || loadedUsers.length > (JSON.parse(storedUsers || '[]')).length) {
       localStorage.setItem('hb_users', JSON.stringify(loadedUsers));
    }

    setUsers(loadedUsers);

    if (storedAppts) setAppointments(JSON.parse(storedAppts));
    if (storedDoctors) setDoctors(JSON.parse(storedDoctors));
    if (storedSettings) setSettings(JSON.parse(storedSettings));
    if (sessionUser) setUser(JSON.parse(sessionUser));
  }, []);

  // Sync users to localStorage
  useEffect(() => {
    if (users.length > 0) {
        localStorage.setItem('hb_users', JSON.stringify(users));
    }
  }, [users]);

  // Sync appointments to localStorage
  useEffect(() => {
    localStorage.setItem('hb_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Sync doctors to localStorage
  useEffect(() => {
    localStorage.setItem('hb_doctors', JSON.stringify(doctors));
  }, [doctors]);

  // Sync settings to localStorage
  useEffect(() => {
    localStorage.setItem('hb_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync session to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('hb_session_user', JSON.stringify(user));
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

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, ...updates } : apt));
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