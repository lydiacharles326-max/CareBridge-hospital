export interface Doctor {
  id: string;
  name: string;
  role: string;
  department: string;
  experience: string;
  rating: number;
  image: string;
  bio: string;
  schedule: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  iconName: string;
  department: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image: string;
  date: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  doctor: string;
  date: string;
  message?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'checked_in' | 'completed';
  createdAt: string;
  vitals?: Vitals;
  prescription?: Prescription;
  labRequest?: LabRequest;
}

export type UserRole = 'patient' | 'doctor' | 'admin' | 'nurse' | 'receptionist' | 'pharmacist' | 'lab';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string; // for doctors/staff
  createdAt: string;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  weight: string;
  registeredBy: string; // Nurse's name
  registeredAt: string;
}

export interface Prescription {
  medicineName: string;
  dosage: string;
  frequency: string;
  status: 'pending' | 'dispensed';
  prescribedBy: string; // Doctor's name
  prescribedAt: string;
}

export interface LabRequest {
  testType: string;
  instructions: string;
  result?: string;
  status: 'pending' | 'completed';
  requestedBy: string; // Doctor's name
  completedBy?: string; // Lab tech's name
  completedAt?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
}
