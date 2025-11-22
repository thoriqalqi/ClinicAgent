import { GoogleGenAI } from "@google/genai";
import { ConsultationInput, ConsultationOutput, CONSULTATION_RESPONSE_SCHEMA } from './schemas';

// Initialize Gemini
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-pro-preview'; 

export const runConsultationAgent = async (input: ConsultationInput): Promise<ConsultationOutput> => {
  const prompt = `
    Profil Pasien:
    - Umur: ${input.age}
    - Jenis Kelamin: ${input.gender}
    - Riwayat: ${input.history.join(', ') || 'Tidak ada'}
    
    Keluhan Saat Ini:
    - Gejala: ${input.symptoms.join(', ')}
    - Durasi: ${input.duration}
    - Tingkat Nyeri: ${input.painLevel}/10
    - Catatan Tambahan: ${input.notes || 'Tidak ada'}

    TUGAS:
    Bertindaklah sebagai Asisten Medis AI Profesional. Analisis gejala yang diberikan dalam BAHASA INDONESIA.
    
    LOGIKA KEPUTUSAN UNTUK 'primary_action':
    1. EMERGENCY: Gejala mengancam jiwa (nyeri dada tembus ke belakang, tanda stroke, sesak napas berat).
    2. DOCTOR_CONSULT: Butuh resep, pemeriksaan fisik, atau diagnosis (infeksi, masalah kronis).
    3. OTC_MEDICATION: Gejala ringan yang bisa diobati obat warung/apotek (flu ringan, sakit kepala biasa).
    4. SELF_CARE: Istirahat atau hidrasi cukup (kelelahan, viral ringan).

    PERSYARATAN OUTPUT (JSON):
    Kembalikan objek JSON dengan field berikut:
    - analysis: Penjelasan medis detail tentang penilaian gejala (Bahasa Indonesia).
    - possible_conditions: Daftar kemungkinan kondisi/hipotesis (Bahasa Indonesia).
    - recommended_actions: Daftar saran langkah yang harus dilakukan pasien segera.
    - danger_signs: Gejala kritis yang menandakan bahaya jika muncul.
    - doctor_referral_needed: Boolean (true/false).
    - recommended_specialist: Nama spesialis yang tepat dalam Bahasa Indonesia baku. 
      CONTOH: Gunakan "Spesialis Jantung" (bukan Cardiologist), "Spesialis Anak", "Spesialis Kulit", "Dokter Umum", "Spesialis Syaraf", "Spesialis Mata". Jika ragu, gunakan "Dokter Umum".
    - urgency_level: Salah satu dari ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
    - primary_action: Object berisi:
        - category: Salah satu dari ["SELF_CARE", "OTC_MEDICATION", "DOCTOR_CONSULT", "EMERGENCY"]
        - reason: Alasan singkat pemilihan kategori ini.
        - next_step: Satu langkah paling penting yang harus dilakukan sekarang.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: CONSULTATION_RESPONSE_SCHEMA,
        temperature: 0.4 
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI Model");

    return JSON.parse(text) as ConsultationOutput;

  } catch (error) {
    console.error("[ConsultationAgent] Error:", error);
    
    return {
      analysis: "Agen AI tidak dapat memproses permintaan saat ini.",
      possible_conditions: ["Kesalahan Sistem"],
      recommended_actions: ["Silakan konsultasi ke dokter secara manual."],
      danger_signs: [],
      doctor_referral_needed: true,
      recommended_specialist: "Dokter Umum",
      urgency_level: 'MEDIUM',
      primary_action: {
        category: 'DOCTOR_CONSULT',
        reason: "Terjadi kesalahan sistem pada analisis AI.",
        next_step: "Kunjungi klinik terdekat."
      }
    };
  }
};