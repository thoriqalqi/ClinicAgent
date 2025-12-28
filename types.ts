
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
  status?: 'COMPLETED' | 'PENDING' | 'CANCELLED' | 'ACTIVE' | 'SENT_TO_PHARMACY' | 'PENDING_VERIFICATION';
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

// --- Added Consultation Types ---

export interface ConsultationInput {
  patientId: string;
  age: number;
  gender: string;
  symptoms: string[];
  duration: string;
  painLevel: number;
  history: string[];
  notes: string;
  patientName?: string;
  weight?: number;
}

export interface PrimaryAction {
  category: 'SELF_CARE' | 'OTC_MEDICATION' | 'DOCTOR_CONSULT' | 'EMERGENCY';
  reason: string;
  next_step: string;
}

export interface ConsultationOutput {
  analysis: string;
  possible_conditions: string[];
  recommended_actions: string[];
  danger_signs: string[];
  doctor_referral_needed: boolean;
  recommended_specialist: string | null;
  urgency_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  primary_action: PrimaryAction;
}

// --- Added Doctor Search Types ---

export interface DoctorSearchInput {
  specialist: string;
}

export interface DoctorSearchResult {
  id: string;
  name: string;
  specialist: string;
  experience_years: number;
  is_verified: boolean;
  is_active: boolean;
  clinic?: string;
}

export interface DoctorSearchOutput {
  doctors: DoctorSearchResult[];
}

// --- Added Logging Types ---

export interface LogEntry {
  id: string;
  timestamp: string;
  agent_name: string;
  user_id: string;
  payload: any;
  response: any;
  status: 'SUCCESS' | 'FAILURE';
}

// --- Added Role Agent Types ---

export interface RoleAgentInput {
  role: string;
}

export interface RoleAgentOutput {
  role: string;
  permissions: string[];
  ui_config: {
    show_dashboard: boolean;
    show_records: boolean;
    show_admin_panel: boolean;
    can_prescribe: boolean;
  };
}
