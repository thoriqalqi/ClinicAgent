
export enum UserRole {
  PATIENT = 'PATIENT',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN'
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  password?: string; // Added for authentication
  // New Personal Details
  age?: number;
  gender?: 'Male' | 'Female';
  phone?: string;
  
  // Doctor specific fields
  clinic?: string;
  strNumber?: string; 
  specialization?: string;
  experienceYears?: number; // Added for Doctor Search Agent
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  bpjsNumber: string;
  lastVisit: string;
  history: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
}

export interface PrescriptionItem {
  medicine: string;
  dosage: string;
  frequency: string;
  duration: string;
  notes: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorName: string;
  date: string;
  items: PrescriptionItem[];
  diagnosis: string;
}

export interface EmergencyAssessment {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  color: string;
  actionPlan: string[];
  summary: string;
}

// New Interfaces for Emergency System
export interface Hospital {
  id: string;
  name: string;
  distance: string;
  eta: string;
  type: 'General' | 'Specialized' | 'Clinic' | 'Hospital';
  availableBeds?: number;
  coordinates?: { lat: number, lng: number };
  // Added for Maps Grounding
  googleMapsUri?: string;
  address?: string;
  rating?: string;
}

export interface EmergencyUnit {
  id: string;
  plateNumber: string;
  status: 'IDLE' | 'DISPATCHED' | 'ON_SITE';
  eta?: string;
  crew: string[];
}

export interface SystemSettings {
  clinicName: string;
  supportEmail: string;
  maintenanceMode: boolean;
  enableAiConsultation: boolean;
  enableNewRegistrations: boolean;
  globalAnnouncement: string;
  aiModel: string;
}

export type MedicalRecordType = 'CONSULTATION' | 'PRESCRIPTION' | 'LAB_RESULT' | 'VACCINATION';

export interface MedicalTimelineItem {
  id: string;
  date: string;
  type: MedicalRecordType;
  title: string;
  provider: string; // Doctor or Clinic name
  summary: string;
  tags: string[];
  status?: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'ACTIVE';
  attachmentUrl?: string;
  details?: string; // JSON string containing full details (items, advice, analysis etc)
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CONSULTATION = 'CONSULTATION',
  PRESCRIPTION = 'PRESCRIPTION',
  EMERGENCY = 'EMERGENCY',
  RECORDS = 'RECORDS',
  PROFILE = 'PROFILE', // New View
  ADMIN_DOCTORS = 'ADMIN_DOCTORS',
  ADMIN_PATIENTS = 'ADMIN_PATIENTS',
  ADMIN_SETTINGS = 'ADMIN_SETTINGS',
  ADMIN_TRANSPARENCY = 'ADMIN_TRANSPARENCY', // New View
  DOCTOR_ASSESSMENT = 'DOCTOR_ASSESSMENT',
  DOCTOR_PATIENTS = 'DOCTOR_PATIENTS'
}
