export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Doctor {
  id: string;
  name: string;
  departmentId: string;
  specialty: string;
  image: string;
  availableSlots?: string[];
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string; // 診斷
  treatment: string; // 處置/用藥
  notes?: string;    // 備註
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string; // In a real app, never store plain text passwords
  role: 'user' | 'admin';
  medicalHistory?: MedicalRecord[]; // New field for medical records
}

export interface Appointment {
  id: string;
  userId?: string; // Optional, allows for guest booking if needed in future
  departmentId: string;
  departmentName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  symptoms?: string;
  status?: 'booked' | 'cancelled' | 'completed';
  reminderSet?: boolean; // New field for notification status
  cancellationReason?: string; // New field
}

export interface SiteSettings {
  appName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  description: string;
}