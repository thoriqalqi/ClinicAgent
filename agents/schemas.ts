import { Type } from "@google/genai";

// --- 1. Consultation Agent Schemas ---

export interface ConsultationInput {
  patientId: string;
  age: number;
  gender: string;
  symptoms: string[]; // Strict Requirement: string array
  duration: string;
  painLevel: number; // 1-10
  history: string[];
  notes: string;
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
  primary_action: PrimaryAction; // New Field
}

// Gemini Schema for Consultation
export const CONSULTATION_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    analysis: { type: Type.STRING, description: "Detailed medical reasoning and analysis of symptoms." },
    possible_conditions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of potential conditions (hypotheses)." },
    recommended_actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of general advice." },
    danger_signs: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Critical symptoms requiring immediate ER attention." },
    doctor_referral_needed: { type: Type.BOOLEAN },
    recommended_specialist: { type: Type.STRING, description: "Type of specialist needed (e.g., Cardiologist), or null." },
    urgency_level: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
    primary_action: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, enum: ['SELF_CARE', 'OTC_MEDICATION', 'DOCTOR_CONSULT', 'EMERGENCY'] },
        reason: { type: Type.STRING, description: "Short explanation why this action was chosen." },
        next_step: { type: Type.STRING, description: "The single most important immediate step." }
      },
      required: ["category", "reason", "next_step"]
    }
  },
  required: ["analysis", "possible_conditions", "recommended_actions", "danger_signs", "doctor_referral_needed", "recommended_specialist", "urgency_level", "primary_action"]
};

// --- 2. Doctor Search Agent Schemas ---

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

// --- 3. Logging Agent Schemas ---

export interface LogEntry {
  id: string;
  timestamp: string;
  agent_name: string;
  user_id: string;
  payload: any;
  response: any;
  status: 'SUCCESS' | 'FAILURE';
}

// --- 4. Role Agent Schemas ---

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