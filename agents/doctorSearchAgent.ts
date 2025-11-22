import { DoctorSearchInput, DoctorSearchOutput, DoctorSearchResult } from './schemas';
import { MOCK_USERS } from '../constants';
import { UserRole } from '../types';

export const doctorSearchAgent = {
  /**
   * Searches for Verified, Active doctors matching the specialist using smart keyword matching.
   */
  findMatchingDoctors: async (input: DoctorSearchInput): Promise<DoctorSearchOutput> => {
    console.log(`[DoctorSearchAgent] Mencari: ${input.specialist}`);

    if (!input.specialist || input.specialist.toLowerCase() === 'null') {
      return { doctors: [] };
    }

    // Kata kunci pemetaan untuk menangani variasi bahasa (Synonym Mapping)
    // Key: Kata yang mungkin muncul dari AI atau Database
    // Value: Kata kunci standar untuk pencarian
    const KEYWORD_MAP: Record<string, string> = {
        'jantung': 'jantung',
        'kardiolog': 'jantung',
        'cardiologist': 'jantung',
        'cardio': 'jantung',
        'anak': 'anak',
        'pediatrician': 'anak',
        'pediatri': 'anak',
        'kulit': 'kulit',
        'dermatologist': 'kulit',
        'kelamin': 'kulit',
        'syaraf': 'syaraf',
        'neurolog': 'syaraf',
        'mata': 'mata',
        'umum': 'umum',
        'general': 'umum',
        'gp': 'umum'
    };

    const getStandardKeywords = (text: string): string[] => {
        const words = text.toLowerCase().split(/[\s,-]+/);
        const foundKeywords: string[] = [];
        
        words.forEach(w => {
            // Cek apakah kata ada di map
            for (const key in KEYWORD_MAP) {
                if (w.includes(key)) {
                    foundKeywords.push(KEYWORD_MAP[key]);
                }
            }
            // Tambahkan kata asli juga untuk pencarian langsung
            if (w.length > 3) foundKeywords.push(w); 
        });
        
        return [...new Set(foundKeywords)];
    };

    const searchKeywords = getStandardKeywords(input.specialist);
    console.log(`[DoctorSearchAgent] Keywords terdeteksi:`, searchKeywords);

    // Query Logic
    const matches = MOCK_USERS.filter(user => {
      if (user.role !== UserRole.DOCTOR) return false;
      if (user.status !== 'ACTIVE') return false; // Hanya dokter aktif
      
      const doctorSpec = (user.specialization || "").toLowerCase();
      const doctorKeywords = getStandardKeywords(doctorSpec);

      // Cek irisan keyword (Intersection)
      // Jika ada satu saja keyword penting yang sama, anggap match.
      const hasMatch = searchKeywords.some(k => doctorKeywords.includes(k));
      
      // Fallback: jika pencariannya "Dokter Umum" atau "General", tampilkan Dokter Umum
      if (searchKeywords.includes('umum') && doctorSpec.includes('umum')) return true;

      return hasMatch;
    });

    // Map to strict DoctorSearchResult schema
    const results: DoctorSearchResult[] = matches.map(doc => ({
      id: doc.id,
      name: doc.name,
      specialist: doc.specialization || 'Dokter Umum',
      experience_years: doc.experienceYears || 0,
      is_verified: !!doc.strNumber, 
      is_active: doc.status === 'ACTIVE',
      clinic: doc.clinic
    }));

    return {
      doctors: results
    };
  }
};