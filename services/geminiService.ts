import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType } from "@google/generative-ai";
import { Message, PrescriptionItem, EmergencyAssessment, Hospital } from '../types';

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

const MODEL_FAST = 'gemini-2.0-flash';
const MODEL_REASONING = 'gemini-2.0-flash';

export const generatePrescriptionSuggestion = async (
  diagnosis: string,
  patientInfo: string
): Promise<{ items: PrescriptionItem[], advice: string }> => {
  try {
    const client = getGenAI();
    const model = client.getGenerativeModel({
      model: MODEL_FAST,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            items: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  medicine: { type: SchemaType.STRING, description: "Nama obat saja" },
                  dosage: { type: SchemaType.STRING, description: "Dosis (WAJIB DIISI)" },
                  frequency: { type: SchemaType.STRING, description: "Frekuensi (WAJIB DIISI)" },
                  duration: { type: SchemaType.STRING, description: "Durasi (WAJIB DIISI)" },
                  notes: { type: SchemaType.STRING, description: "Catatan tambahan" },
                },
                required: ["medicine", "dosage", "frequency", "duration"]
              }
            },
            advice: { type: SchemaType.STRING, description: "Saran dokter dalam bahasa indonesia" }
          },
          required: ["items", "advice"]
        }
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `Info Pasien: ${patientInfo}. Diagnosis: ${diagnosis}.
            Buatlah saran resep obat yang LENGKAP dan SPESIFIK dalam BAHASA INDONESIA.
            PENTING:
            1. Gunakan NAMA OBAT NYATA (Generik atau Paten).
            2. WAJIB MENGISI kolom "dosage", "frequency", dan "duration" secara terpisah. JANGAN dikosongkan.
            3. JANGAN menggabungkan dosis/frekuensi ke dalam nama obat.
            4. "dosage" contoh: "500mg", "10ml".
            5. "frequency" contoh: "3x sehari", "Tiap 8 jam".
            6. "duration" contoh: "5 hari", "3 hari".`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) throw new Error("No response from AI");
    const cleanText = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error: any) {
    console.error("Gemini Prescription Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { items: [], advice: `Gagal membuat saran resep. ERROR: ${errorMessage}` };
  }
};

export const chatWithMedicalExpert = async (
  history: Message[],
  currentInput: string
): Promise<string> => {
  try {
    const context = history.map(h => `${h.role === 'user' ? 'Doctor' : 'AI'}: ${h.text}`).join('\n');

    const client = getGenAI();
    const model = client.getGenerativeModel({
      model: MODEL_REASONING,
      generationConfig: {
        temperature: 0.4,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `Anda adalah Asisten Medis AI tingkat lanjut yang membantu dokter berlisensi.
          
          Riwayat Percakapan:
          ${context}
          
          Input Dokter: ${currentInput}
          
          Instruksi:
          1. Jawab sepenuhnya dalam BAHASA INDONESIA.
          2. Gunakan terminologi medis yang profesional.
          3. Berikan diagnosis banding, interaksi obat, atau pedoman klinis jika diminta.
          4. Bersikap ringkas dan berbasis bukti.
          5. Jika ditanya tentang kasus pasien tertentu, strukturkan jawaban dengan format "Subjektif", "Objektif", "Asesmen", "Plan" (SOAP) jika relevan.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || "Saya tidak dapat menghasilkan respon.";
  } catch (error) {
    console.error("Gemini Doctor Chat Error:", error);
    return "Koneksi Error: Tidak dapat menjangkau basis pengetahuan medis.";
  }
};

export const assessEmergency = async (
  symptoms: string
): Promise<EmergencyAssessment> => {
  try {
    const client = getGenAI();
    const model = client.getGenerativeModel({
      model: MODEL_REASONING,
      generationConfig: {
        // responseMimeType: "application/json",
        // responseSchema: { ... } // Relaxed schema
        temperature: 0.1,
        maxOutputTokens: 1000,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE }
      ]
    });

    const prompt = `Analisis gejala ini untuk triase darurat: "${symptoms}".
            Tentukan tingkat keparahan (LOW, MEDIUM, HIGH, CRITICAL).
            Berikan ringkasan singkat dan daftar tindakan yang dapat dilakukan dalam BAHASA INDONESIA.
            
            FORMAT JSON:
            {
              "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
              "summary": "Ringkasan...",
              "actionPlan": ["Langkah 1", "Langkah 2"]
            }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) throw new Error("No response");

    let cleanText = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();

    // Attempt to find the first '{' and last '}' to handle potential extra text
    const firstOpen = cleanText.indexOf('{');
    const lastClose = cleanText.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      cleanText = cleanText.substring(firstOpen, lastClose + 1);
    }

    const data = JSON.parse(cleanText);

    let color = 'bg-green-500';
    if (data.severity === 'MEDIUM') color = 'bg-yellow-500';
    if (data.severity === 'HIGH') color = 'bg-orange-600';
    if (data.severity === 'CRITICAL') color = 'bg-red-600 animate-pulse';

    return { ...data, color };
  } catch (error: any) {
    console.error("Emergency AI Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      severity: 'HIGH',
      summary: `Gagal melakukan penilaian AI: ${errorMessage}`,
      actionPlan: ['Segera hubungi nomor darurat manual'],
      color: 'bg-red-500'
    };
  }
};

export const findNearbyFacilities = async (
  lat: number,
  lng: number,
  symptoms: string
): Promise<Hospital[]> => {
  try {
    const client = getGenAI();
    // Note: Google Maps Grounding might need specific tool configuration in @google/generative-ai
    // For now, we'll try to use the tools config if supported, or fallback to standard generation
    // The @google/generative-ai SDK supports tools in getGenerativeModel

    const model = client.getGenerativeModel({
      model: MODEL_FAST,
      tools: [{ googleMaps: {} } as any], // Cast to any as googleMaps tool might be experimental/typed differently
    });

    const prompt = `Temukan 3 rumah sakit, klinik, atau puskesmas terdekat yang cocok untuk menangani: "${symptoms}".`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    // Grounding metadata handling
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = (groundingMetadata as any)?.groundingChunks;

    if (!groundingChunks || groundingChunks.length === 0) {
      return [];
    }

    const facilities: Hospital[] = [];

    groundingChunks.forEach((chunk: any, index: number) => {
      if (chunk.maps) {
        const mapData = chunk.maps;
        facilities.push({
          id: `MAP-${index}`,
          name: mapData.title || 'Fasilitas Medis',
          type: 'Hospital',
          distance: 'Dekat',
          eta: 'Cek Peta',
          availableBeds: undefined,
          googleMapsUri: mapData.mapLink || mapData.uri,
          address: mapData.address
        });
      }
    });

    return facilities;

  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return [];
  }
};
