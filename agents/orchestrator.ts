
import { consultationAgent } from './consultationAgent';
import { aiLoggingAgent } from './loggingAgent';
import { doctorSearchAgent } from './doctorSearchAgent';
import { consultationService } from '../services/consultationService';
import { ConsultationInput, ConsultationOutput, DoctorSearchOutput } from '../types';

export interface OrchestratorResult {
  consultation: ConsultationOutput;
  doctor_recommendations?: DoctorSearchOutput;
  session_id: string;
}

export const runMedicalConsultationFlow = async (
  userId: string,
  input: ConsultationInput
): Promise<OrchestratorResult> => {

  const sessionId = `SESS-${Date.now()}`;
  console.log(`[Orchestrator] Starting session ${sessionId}`);

  // --- STEP 1: VALIDATE INPUT ---
  // Strict validation as per Orchestrator requirements
  if (typeof input.age !== 'number') throw new Error("Validation Error: Age must be a number.");
  if (!Array.isArray(input.symptoms) || input.symptoms.length === 0) throw new Error("Validation Error: Symptoms must be a non-empty array.");
  if (typeof input.duration !== 'string' || !input.duration) throw new Error("Validation Error: Duration is required.");
  if (input.painLevel < 1 || input.painLevel > 10) throw new Error("Validation Error: Pain Level must be between 1-10.");

  // Ensure optional notes is at least a string
  if (!input.notes) input.notes = "";

  // Log Input
  await aiLoggingAgent.logInteraction('ConsultationAgent', userId, input, null, true);

  // --- STEP 2: CALL CONSULTATION AGENT ---
  let consultationResult: ConsultationOutput;
  try {
    consultationResult = await consultationAgent(input);
  } catch (error) {
    await aiLoggingAgent.logInteraction('ConsultationAgent', userId, input, { error }, false);
    throw error;
  }

  await aiLoggingAgent.logInteraction('ConsultationAgent', userId, null, consultationResult, true);

  // --- STEP 3: IF REFERRAL NEEDED -> CALL DOCTOR SEARCH ---
  let doctorRecommendations: DoctorSearchOutput | undefined;

  if (consultationResult.doctor_referral_needed && consultationResult.recommended_specialist) {

    console.log("[Orchestrator] Referral needed, calling DoctorSearchAgent...");

    const searchResult = await doctorSearchAgent.findMatchingDoctors({
      specialist: consultationResult.recommended_specialist
    });

    doctorRecommendations = searchResult;

    await aiLoggingAgent.logInteraction(
      'DoctorSearchAgent',
      userId,
      { specialist: consultationResult.recommended_specialist },
      searchResult,
      true
    );
  }

  // Save to DB (Legacy support for existing dashboards)
  const savedRecord = await consultationService.saveConsultation(
    userId,
    input,
    consultationResult,
    doctorRecommendations?.doctors || []
  );

  // --- STEP 4: FINAL OUTPUT ---
  const finalOutput: OrchestratorResult = {
    consultation: consultationResult,
    // Return the Database Record ID instead of the transient session ID
    // This allows the frontend to pass a valid ID to bookAppointment
    session_id: savedRecord.id
  };

  if (doctorRecommendations) {
    finalOutput.doctor_recommendations = doctorRecommendations;
  }

  return finalOutput;
};
