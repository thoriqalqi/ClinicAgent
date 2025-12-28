import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { ConsultationInput, ConsultationOutput } from '../types';

let genAI: GoogleGenerativeAI | null = null;

const getGenAI = () => {
    if (!genAI) {
        const apiKey = import.meta.env.VITE_API_KEY;
        if (!apiKey) {
            console.error("VITE_API_KEY is missing!");
            throw new Error("API Key is missing");
        }
        genAI = new GoogleGenerativeAI(apiKey);
    }
    return genAI;
};

const MODEL_NAME = 'gemini-2.0-flash';

const CONSULTATION_RESPONSE_SCHEMA = {
    type: 'object',
    properties: {
        analysis: { type: 'string' },
        possible_conditions: { type: 'array', items: { type: 'string' } },
        recommended_actions: { type: 'array', items: { type: 'string' } },
        danger_signs: { type: 'array', items: { type: 'string' } },
        doctor_referral_needed: { type: 'boolean' },
        recommended_specialist: { type: 'string' },
        urgency_level: { type: 'string' },
        primary_action: {
            type: 'object',
            properties: {
                category: { type: 'string' },
                reason: { type: 'string' },
                next_step: { type: 'string' }
            }
        }
    },
    required: ['analysis', 'possible_conditions', 'recommended_actions', 'danger_signs', 'doctor_referral_needed', 'recommended_specialist', 'urgency_level', 'primary_action']
};

export const consultationAgent = async (input: ConsultationInput): Promise<ConsultationOutput> => {
    const prompt = `
    Data Pasien:
    - Nama: ${input.patientName}
    - Umur: ${input.age}
    - Jenis Kelamin: ${input.gender}
    - Berat Badan: ${input.weight} kg
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
        const client = getGenAI();
        const model = client.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: {
                // responseMimeType: "application/json",
                // responseSchema: CONSULTATION_RESPONSE_SCHEMA as any,
                temperature: 0.1, // Lower temperature for more deterministic output
                maxOutputTokens: 1000,
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
            ]
        });

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) throw new Error("Empty response from AI Model");

        // Clean markdown if present
        let cleanText = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();

        // Attempt to find the first '{' and last '}' to handle potential extra text
        const firstOpen = cleanText.indexOf('{');
        const lastClose = cleanText.lastIndexOf('}');
        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
            cleanText = cleanText.substring(firstOpen, lastClose + 1);
        }

        return JSON.parse(cleanText) as ConsultationOutput;

    } catch (error: any) {
        console.error("[ConsultationAgent] Error:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        return {
            analysis: `Agen AI tidak dapat memproses permintaan saat ini. ERROR: ${errorMessage}`,
            possible_conditions: ["Kesalahan Sistem"],
            recommended_actions: ["Silakan konsultasi ke dokter secara manual."],
            danger_signs: [],
            doctor_referral_needed: true,
            recommended_specialist: "Dokter Umum",
            urgency_level: 'MEDIUM',
            primary_action: {
                category: 'DOCTOR_CONSULT',
                reason: `Terjadi kesalahan sistem: ${errorMessage}`,
                next_step: "Kunjungi klinik terdekat."
            }
        };
    }
};
