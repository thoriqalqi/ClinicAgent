
import { GoogleGenAI, Type } from "@google/genai";
import { PrescriptionItem, EmergencyAssessment, Hospital, Message } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_FAST = 'gemini-2.5-flash';
// Using Pro for complex medical reasoning
const MODEL_REASONING = 'gemini-3-pro-preview'; 

export const generateConsultationResponse = async (
  history: string, 
  currentInput: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: [
        {
          role: 'user',
          parts: [{ text: `Anda adalah asisten medis AI untuk klinik bernama "HealthTown". 
          Konteks percakapan: ${history}
          
          Input pasien saat ini: ${currentInput}
          
          Berikan respons yang membantu, profesional, dan empatik dalam BAHASA INDONESIA. 
          Jika gejala dijelaskan, ajukan pertanyaan klarifikasi untuk membantu dokter. 
          JANGAN memberikan diagnosis medis pasti, tetapi sarankan kemungkinan untuk ditinjau oleh dokter.` }]
        }
      ],
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "Maaf, saya tidak dapat memproses permintaan tersebut.";
  } catch (error) {
    console.error("Gemini Consultation Error:", error);
    return "Sistem Error: Tidak dapat terhubung ke agen AI.";
  }
};

export const chatWithMedicalExpert = async (
  history: Message[], 
  currentInput: string
): Promise<string> => {
  try {
    const context = history.map(h => `${h.role === 'user' ? 'Doctor' : 'AI'}: ${h.text}`).join('\n');

    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: [
        {
          role: 'user',
          parts: [{ text: `Anda adalah Asisten Medis AI tingkat lanjut yang membantu dokter berlisensi.
          
          Riwayat Percakapan:
          ${context}
          
          Input Dokter: ${currentInput}
          
          Instruksi:
          1. Jawab sepenuhnya dalam BAHASA INDONESIA.
          2. Gunakan terminologi medis yang profesional.
          3. Berikan diagnosis banding, interaksi obat, atau pedoman klinis jika diminta.
          4. Bersikap ringkas dan berbasis bukti.
          5. Jika ditanya tentang kasus pasien tertentu, strukturkan jawaban dengan format "Subjektif", "Objektif", "Asesmen", "Plan" (SOAP) jika relevan.` }]
        }
      ],
      config: {
        temperature: 0.4, 
      }
    });
    return response.text || "Saya tidak dapat menghasilkan respon.";
  } catch (error) {
    console.error("Gemini Doctor Chat Error:", error);
    return "Koneksi Error: Tidak dapat menjangkau basis pengetahuan medis.";
  }
};

export const generatePrescriptionSuggestion = async (
  diagnosis: string,
  patientInfo: string
): Promise<{ items: PrescriptionItem[], advice: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST, 
      contents: `Info Pasien: ${patientInfo}. Diagnosis: ${diagnosis}.
      Buatlah saran resep obat dan saran umum dalam BAHASA INDONESIA.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  medicine: { type: Type.STRING, description: "Nama obat" },
                  dosage: { type: Type.STRING, description: "Dosis (cth: 500mg)" },
                  frequency: { type: Type.STRING, description: "Frekuensi (cth: 3x sehari)" },
                  duration: { type: Type.STRING, description: "Durasi (cth: 5 hari)" },
                  notes: { type: Type.STRING, description: "Catatan tambahan (cth: sesudah makan)" },
                }
              }
            },
            advice: { type: Type.STRING, description: "Saran dokter dalam bahasa indonesia" }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Prescription Error:", error);
    return { items: [], advice: "Gagal membuat saran resep. Silakan coba lagi." };
  }
};

export const assessEmergency = async (
  symptoms: string
): Promise<EmergencyAssessment> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_REASONING,
      contents: `Analisis gejala ini untuk triase darurat: "${symptoms}".
      Tentukan tingkat keparahan (LOW, MEDIUM, HIGH, CRITICAL).
      Berikan ringkasan singkat dan daftar tindakan yang dapat dilakukan dalam BAHASA INDONESIA.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
            summary: { type: Type.STRING, description: "Ringkasan kondisi dalam bahasa indonesia" },
            actionPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING, description: "Langkah tindakan dalam bahasa indonesia" }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    const data = JSON.parse(text);
    
    let color = 'bg-green-500';
    if (data.severity === 'MEDIUM') color = 'bg-yellow-500';
    if (data.severity === 'HIGH') color = 'bg-orange-600';
    if (data.severity === 'CRITICAL') color = 'bg-red-600 animate-pulse';

    return { ...data, color };
  } catch (error) {
    console.error("Emergency AI Error:", error);
    return {
      severity: 'HIGH',
      summary: 'Gagal melakukan penilaian AI - Anggap sebagai potensi darurat',
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
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: `Temukan 3 rumah sakit, klinik, atau puskesmas terdekat yang cocok untuk menangani: "${symptoms}".`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
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
