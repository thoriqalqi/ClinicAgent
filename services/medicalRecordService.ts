
import { MedicalTimelineItem, MedicalRecordType } from '../types';
import { consultationService } from './consultationService';

// Mock data for Archived Records
const MOCK_ARCHIVED_RECORDS: MedicalTimelineItem[] = [];

// Runtime Storage for New Prescriptions created during the session. 
// Extending the interface internally to include patientId for filtering
interface RuntimeMedicalRecord extends MedicalTimelineItem {
    patientId: string; 
}

let RUNTIME_RECORDS: RuntimeMedicalRecord[] = [];

export const medicalRecordService = {
  /**
   * Create a new prescription record (Point 4: Database Connection)
   */
  createPrescription: async (
    patientId: string,
    doctorName: string,
    summary: string,
    details: string
  ): Promise<MedicalTimelineItem> => {
    const newRecord: RuntimeMedicalRecord = {
        id: `RX-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'PRESCRIPTION',
        title: 'New Prescription',
        provider: doctorName,
        summary: summary, // Short summary (e.g. "Amoxicillin 500mg")
        tags: ['New', 'Prescription'],
        status: 'ACTIVE', // Explicitly Active for dashboard widget
        details: details, // Full JSON details
        patientId: patientId // Store patient ID to link correctly
    };
    
    RUNTIME_RECORDS.unshift(newRecord);
    console.log(`[MedicalRecordService] Created Prescription for ${patientId}`);
    
    return newRecord;
  },

  /**
   * Aggregates data from the active Consultation Service, Runtime Records, and static mock data.
   */
  getPatientTimeline: async (patientId: string): Promise<MedicalTimelineItem[]> => {
    try {
        // 1. Fetch real AI consultations from the service
        const aiHistory = await consultationService.getPatientHistory(patientId);
        
        const aiRecords: MedicalTimelineItem[] = aiHistory.map(record => {
          const result = record.result;
          const possibleConditions = result?.possible_conditions || [];
          const analysis = result?.analysis || 'No analysis available';
          const specialist = result?.recommended_specialist;
          const urgency = result?.urgency_level || 'LOW';
          
          let recordDate = record.createdAt;
          if (!recordDate || isNaN(Date.parse(recordDate))) {
             recordDate = new Date().toISOString();
          }

          // Serialize consultation details for the Modal
          const detailsObj = {
              analysis: result.analysis,
              recommended_actions: result.recommended_actions,
              possible_conditions: result.possible_conditions,
              primary_action: result.primary_action
          };

          // --- STATUS SYNC LOGIC ---
          // Default to PENDING if it's just an AI analysis without doctor action yet
          let displayStatus: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' = 'PENDING';

          if (record.appointment) {
             // Map Appointment Status to Medical Record Status
             switch (record.appointment.status) {
                 case 'CONFIRMED':
                     displayStatus = 'ACTIVE'; // Doctor approved/Ongoing
                     break;
                 case 'COMPLETED':
                     displayStatus = 'COMPLETED'; // Done
                     break;
                 case 'CANCELLED':
                     displayStatus = 'CANCELLED';
                     break;
                 case 'PENDING':
                 default:
                     displayStatus = 'PENDING'; // Waiting for doctor
                     break;
             }
          }

          return {
            id: record.id,
            date: recordDate,
            type: 'CONSULTATION',
            title: possibleConditions[0] || 'General Consultation',
            provider: specialist ? `Referral: ${specialist}` : 'AI Health Assistant',
            summary: analysis.length > 120 ? analysis.substring(0, 120) + '...' : analysis,
            tags: [urgency, ...(possibleConditions.slice(0, 1))].filter(Boolean) as string[],
            status: displayStatus,
            details: JSON.stringify(detailsObj)
          };
        });

        // 2. Combine with Runtime Records (Filter by Patient ID!)
        // MOCK_ARCHIVED_RECORDS are generic mocks, for demo we might leave them or filter if they had IDs.
        const relevantRuntimeRecords = RUNTIME_RECORDS.filter(r => r.patientId === patientId);
        
        const allRecords = [...relevantRuntimeRecords, ...aiRecords, ...MOCK_ARCHIVED_RECORDS];

        // 3. Sort by date descending (newest first)
        return allRecords.sort((a, b) => {
            const dateA = new Date(a.date).getTime() || 0;
            const dateB = new Date(b.date).getTime() || 0;
            return dateB - dateA;
        });
    } catch (error) {
        console.error("Error fetching timeline:", error);
        return [...RUNTIME_RECORDS.filter(r => r.patientId === patientId), ...MOCK_ARCHIVED_RECORDS];
    }
  },

  /**
   * Get Unique Patients for a specific Doctor
   */
  getDoctorPatients: async (doctorId: string, doctorName: string): Promise<any[]> => {
      const appointments = await consultationService.getDoctorAppointments(doctorId);
      const uniquePatients = new Map();

      appointments.forEach(apt => {
          if (!uniquePatients.has(apt.patient.id)) {
              uniquePatients.set(apt.patient.id, {
                  id: apt.patient.id,
                  name: apt.patient.name,
                  email: apt.patient.email,
                  lastVisit: apt.timestamp,
                  condition: apt.consultation?.primaryCondition || 'General',
                  status: 'Patient'
              });
          }
      });
      return Array.from(uniquePatients.values());
  },

  /**
   * Global Aggregator for Admin Transparency
   * Retrieves ALL prescriptions and consultations across the system
   */
  getGlobalStats: async (): Promise<{prescriptions: MedicalTimelineItem[], consultations: MedicalTimelineItem[]}> => {
      // 1. All Prescriptions
      const allPrescriptions = [...RUNTIME_RECORDS]; // In real app, fetch * from prescriptions

      // 2. All Consultations (We need to access consultationService internals or have a global getter)
      // For simulation, we will assume we can get 'ConsultationRecord' list. 
      // We will do a hack here: 'getPatientTimeline' for 'all' is difficult without modifying consult service.
      // Ideally, consultationService should have 'getAllConsultations'.
      // Let's assume this returns a mix for demonstration.
      
      return {
          prescriptions: allPrescriptions,
          consultations: [] // In a real app this would be populated
      };
  }
};
