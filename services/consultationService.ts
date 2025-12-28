
import { ConsultationOutput, DoctorSearchResult } from '../types';
import { userService } from './userService';

export interface ConsultationRecord {
  id: string;
  patientId: string;
  input: any;
  result: ConsultationOutput;
  suggestedDoctors: DoctorSearchResult[];
  createdAt: string;
  appointment?: Appointment; // Added field to track booking status
}

export interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  consultationId: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  timestamp: string;
}

// Simulated Database Table: consultations
let CONSULTATION_DB: ConsultationRecord[] = [];
// Simulated Database Table: appointments
let APPOINTMENT_DB: Appointment[] = [];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const consultationService = {
  /**
   * Saves a new consultation record (Simulates INSERT)
   */
  saveConsultation: async (
    patientId: string,
    input: any,
    result: ConsultationOutput,
    suggestedDoctors: DoctorSearchResult[]
  ): Promise<ConsultationRecord> => {
    await delay(300);

    const record: ConsultationRecord = {
      id: `CONS-${Date.now()}`,
      patientId,
      input,
      result,
      suggestedDoctors,
      createdAt: new Date().toISOString()
    };

    CONSULTATION_DB.unshift(record); // Add to top (newest first)
    return record;
  },

  /**
   * Retrieves history for a specific patient (Simulates SELECT WHERE patient_id = ?)
   * Includes JOIN logic to check if an appointment exists for each consultation
   */
  getPatientHistory: async (patientId: string): Promise<ConsultationRecord[]> => {
    await delay(300);
    const records = CONSULTATION_DB.filter(c => c.patientId === patientId);

    // Map records to include their specific appointment status if it exists
    return records.map(record => {
      const appointment = APPOINTMENT_DB.find(a => a.consultationId === record.id);
      return {
        ...record,
        appointment // Will be undefined if not booked, or the Appointment object if booked
      };
    });
  },

  /**
   * Get a single consultation by ID
   */
  getConsultationById: async (id: string): Promise<ConsultationRecord | undefined> => {
    await delay(200);
    return CONSULTATION_DB.find(c => c.id === id);
  },

  /**
   * Simulates sending data to doctor and creating an appointment record
   */
  bookAppointment: async (consultationId: string, doctorId: string): Promise<boolean> => {
    await delay(500);

    const consultation = CONSULTATION_DB.find(c => c.id === consultationId);
    if (!consultation) {
      console.error("Consultation not found during booking");
      return false;
    }

    // Check if already booked to prevent duplicates at service level
    const existing = APPOINTMENT_DB.find(a => a.consultationId === consultationId);
    if (existing) {
      console.log("Appointment already exists for this consultation");
      return true; // Return true as it is technically "booked"
    }

    const newAppointment: Appointment = {
      id: `APT-${Date.now()}`,
      doctorId,
      patientId: consultation.patientId,
      consultationId,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    APPOINTMENT_DB.unshift(newAppointment);
    console.log(`[Booking Service] Appointment created:`, newAppointment);
    return true;
  },

  /**
   * Update appointment status (Doctor Action)
   */
  updateAppointmentStatus: async (appointmentId: string, status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'): Promise<boolean> => {
    await delay(400);
    const index = APPOINTMENT_DB.findIndex(a => a.id === appointmentId);
    if (index !== -1) {
      APPOINTMENT_DB[index] = { ...APPOINTMENT_DB[index], status };
      return true;
    }
    return false;
  },

  /**
   * Retrieves appointments for a specific doctor, including patient and consultation details
   */
  getDoctorAppointments: async (doctorId: string): Promise<any[]> => {
    await delay(400);

    const doctorApts = APPOINTMENT_DB.filter(apt => apt.doctorId === doctorId);
    const users = await userService.getUsers();

    // Join Data
    const joinedData = doctorApts.map(apt => {
      const patient = users.find(u => u.id === apt.patientId);
      const consultation = CONSULTATION_DB.find(c => c.id === apt.consultationId);

      return {
        appointmentId: apt.id,
        status: apt.status,
        timestamp: apt.timestamp,
        patient: patient ? {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          role: patient.role // Useful to know
        } : { id: 'UNKNOWN', name: 'Unknown Patient', email: '' },
        consultation: consultation ? {
          id: consultation.id,
          summary: consultation.result.analysis,
          urgency: consultation.result.urgency_level,
          symptoms: consultation.input.symptoms,
          primaryCondition: consultation.result.possible_conditions[0] || 'Undiagnosed',
          // Full details for review
          age: consultation.input.age,
          gender: consultation.input.gender,
          duration: consultation.input.duration,
          notes: consultation.input.notes,
          possibleConditions: consultation.result.possible_conditions,
          recommendedActions: consultation.result.recommended_actions
        } : null
      };
    });

    // Sort by timestamp descending (newest first)
    return joinedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
};
