
import React, { useState } from 'react';
import { User } from '../types';
import { runMedicalConsultationFlow, OrchestratorResult } from '../agents/orchestrator';
import { ConsultationInput } from '../agents/schemas';
import { consultationService } from '../services/consultationService';
import { 
  Stethoscope, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  ShieldAlert,
  Pill,
  Heart,
  ArrowRight,
  Loader2,
  Check,
  BadgeCheck
} from 'lucide-react';

interface ConsultationProps {
  currentUser: User;
}

interface ConsultationSession {
  step: 'INPUT' | 'PROCESSING' | 'RESULT';
  age: number;
  gender: string;
  symptomsText: string;
  duration: string;
  painLevel: number;
  notes: string;
  result: OrchestratorResult | null;
  hasBooked: boolean;
  bookedDoctorName: string | null;
}

const DEFAULT_SESSION: ConsultationSession = {
  step: 'INPUT',
  age: 30,
  gender: 'Male',
  symptomsText: '',
  duration: '',
  painLevel: 1,
  notes: '',
  result: null,
  hasBooked: false,
  bookedDoctorName: null
};

let cachedSession: ConsultationSession = { ...DEFAULT_SESSION };

export const Consultation: React.FC<ConsultationProps> = ({ currentUser }) => {
  const [session, setSession] = useState<ConsultationSession>(cachedSession);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  const updateSession = (updates: Partial<ConsultationSession>) => {
    setSession(prev => {
      const newState = { ...prev, ...updates };
      cachedSession = newState;
      return newState;
    });
  };

  const handleReset = () => {
    const cleanState = { ...DEFAULT_SESSION };
    cachedSession = cleanState;
    setSession(cleanState);
  };

  const handleSubmit = async () => {
    if (!session.symptomsText.trim()) return;
    
    updateSession({ 
        step: 'PROCESSING',
        hasBooked: false,
        bookedDoctorName: null
    });
    
    const symptomsArray = session.symptomsText.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const inputPayload: ConsultationInput = {
        patientId: currentUser.id,
        age: session.age,
        gender: session.gender,
        symptoms: symptomsArray,
        duration: session.duration,
        painLevel: session.painLevel,
        history: [], 
        notes: session.notes
    };
    
    try {
      const data = await runMedicalConsultationFlow(currentUser.id, inputPayload);
      updateSession({
          result: data,
          step: 'RESULT'
      });
    } catch (error) {
      console.error(error);
      alert("Konsultasi AI Gagal. Silakan periksa input Anda atau coba lagi.");
      updateSession({ step: 'INPUT' });
    }
  };

  const handleBook = async (docId: string, docName: string) => {
    if (!session.result || session.hasBooked) return;
    
    setBookingDoctorId(docId);
    
    try {
        await consultationService.bookAppointment(session.result.session_id, docId);
        updateSession({
            hasBooked: true,
            bookedDoctorName: docName
        });
        alert(`✅ Data Berhasil Terkirim!\n\nHasil konsultasi Anda telah diteruskan ke Dr. ${docName}.`);
    } catch (error) {
        alert("Gagal membuat janji temu. Silakan coba lagi.");
    } finally {
        setBookingDoctorId(null);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-600 text-white shadow-red-200';
      case 'HIGH': return 'bg-orange-500 text-white shadow-orange-200';
      case 'MEDIUM': return 'bg-yellow-400 text-yellow-900 shadow-yellow-200';
      default: return 'bg-emerald-500 text-white shadow-emerald-200';
    }
  };

  const getPrimaryActionStyle = (category: string) => {
    switch (category) {
      case 'EMERGENCY': return 'bg-red-50 border-red-100 text-red-900';
      case 'DOCTOR_CONSULT': return 'bg-orange-50 border-orange-100 text-orange-900';
      case 'OTC_MEDICATION': return 'bg-blue-50 border-blue-100 text-blue-900';
      case 'SELF_CARE': return 'bg-emerald-50 border-emerald-100 text-emerald-900';
      default: return 'bg-slate-50 border-slate-100 text-slate-900';
    }
  };

  const getPrimaryActionIcon = (category: string) => {
     switch (category) {
      case 'EMERGENCY': return <ShieldAlert className="text-red-600" size={32} />;
      case 'DOCTOR_CONSULT': return <Stethoscope className="text-orange-600" size={32} />;
      case 'OTC_MEDICATION': return <Pill className="text-blue-600" size={32} />;
      case 'SELF_CARE': return <Heart className="text-emerald-600" size={32} />;
      default: return <Activity size={32} />;
    }
  };

  return (
    <div className="animate-fade-in relative pt-6">
       <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
          
          {session.step === 'INPUT' && (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary-600 to-purple-700 text-white mb-4 shadow-xl shadow-primary-600/30">
                    <Stethoscope size={32} />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analisis Kesehatan AI</h1>
                <p className="text-slate-500 font-medium mt-1">Jelaskan kondisi Anda untuk analisis awal.</p>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Umur</label>
                        <input 
                        type="number" 
                        value={session.age}
                        onChange={(e) => updateSession({ age: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Jenis Kelamin</label>
                        <select 
                        value={session.gender}
                        onChange={(e) => updateSession({ gender: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        >
                        <option>Male</option>
                        <option>Female</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Gejala Utama</label>
                    <textarea 
                    value={session.symptomsText}
                    onChange={(e) => updateSession({ symptomsText: e.target.value })}
                    placeholder="Cth: Sakit kepala hebat, sensitif terhadap cahaya, mual..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none h-32 resize-none transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Durasi</label>
                        <input 
                        type="text" 
                        value={session.duration}
                        onChange={(e) => updateSession({ duration: e.target.value })}
                        placeholder="Cth: 2 hari"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all placeholder:text-slate-400"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Tingkat Nyeri (1-10)</label>
                        <input 
                        type="number" 
                        min="1" 
                        max="10"
                        value={session.painLevel}
                        onChange={(e) => updateSession({ painLevel: parseInt(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Catatan Tambahan</label>
                    <input 
                    type="text" 
                    value={session.notes}
                    onChange={(e) => updateSession({ notes: e.target.value })}
                    placeholder="Alergi, riwayat penyakit, dll."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={!session.symptomsText}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none hover:-translate-y-1 active:translate-y-0"
                >
                    Analisis Gejala <ArrowRight size={22} />
                </button>
                </div>
            </div>
          )}

          {session.step === 'PROCESSING' && (
             <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="relative mb-8">
                    <div className="w-24 h-24 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Activity className="text-primary-600" size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Menganalisis Gejala...</h2>
                <p className="text-slate-500 mt-2 font-medium">Mengonsultasikan basis pengetahuan medis</p>
             </div>
          )}

          {session.step === 'RESULT' && session.result && (
              <div className="animate-fade-in">
                <div className="mb-8 flex flex-col md:flex-row items-end justify-between gap-6">
                    <div>
                    <button onClick={handleReset} className="text-slate-400 hover:text-primary-600 text-sm font-bold mb-3 flex items-center gap-1 transition-colors">← Kembali ke Penilaian</button>
                    <h1 className="text-3xl font-bold text-slate-900">Hasil Analisis</h1>
                    <p className="text-slate-500 font-medium">ID Sesi: <span className="font-mono text-slate-400">{session.result.session_id}</span></p>
                    </div>
                    <div className={`px-6 py-3 rounded-2xl text-sm font-extrabold tracking-wide shadow-lg ${getUrgencyColor(session.result.consultation.urgency_level)}`}>
                        URGENSI: {session.result.consultation.urgency_level}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <div className="lg:col-span-8 space-y-6">
                        
                        <div className={`p-8 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-start gap-6 ${getPrimaryActionStyle(session.result.consultation.primary_action.category)}`}>
                        <div className="p-4 bg-white rounded-2xl shadow-sm shrink-0">
                            {getPrimaryActionIcon(session.result.consultation.primary_action.category)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl mb-2">Rekomendasi: {session.result.consultation.primary_action.category.replace('_', ' ')}</h3>
                            <p className="text-lg font-bold opacity-90 mb-3">{session.result.consultation.primary_action.next_step}</p>
                            <p className="text-sm opacity-80 leading-relaxed max-w-xl">{session.result.consultation.primary_action.reason}</p>
                        </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><Activity size={20} /></div>
                            Analisis Klinis AI
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-base mb-8">{session.result.consultation.analysis}</p>
                        
                        <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Kemungkinan Kondisi</h4>
                            <div className="flex flex-wrap gap-3">
                                {session.result.consultation.possible_conditions.map((c, i) => (
                                    <span key={i} className="px-4 py-2 bg-white text-slate-700 rounded-xl text-sm font-bold border border-slate-200 shadow-sm">
                                    {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                        <h3 className="font-bold text-xl text-slate-900 mb-6 flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
                            Tindakan yang Disarankan
                        </h3>
                        <div className="space-y-4">
                            {session.result.consultation.recommended_actions.map((action, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 border border-emerald-200">
                                    {i + 1}
                                    </span>
                                    <p className="text-slate-700 font-medium pt-1">{action}</p>
                                </div>
                            ))}
                        </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        
                        {session.result.consultation.danger_signs.length > 0 && (
                        <div className="bg-red-50 p-8 rounded-[2.5rem] border border-red-100 relative overflow-hidden">
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-red-100 rounded-full blur-xl opacity-50"></div>
                            <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2 relative z-10">
                                <AlertTriangle size={20} /> Tanda Bahaya
                            </h3>
                            <ul className="space-y-3 relative z-10">
                                {session.result.consultation.danger_signs.map((sign, i) => (
                                    <li key={i} className="text-sm text-red-800 font-medium flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span> {sign}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        )}

                        {(session.result.consultation.doctor_referral_needed || (session.result.doctor_recommendations?.doctors && session.result.doctor_recommendations.doctors.length > 0)) && (
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-purple-600"></div>
                            
                            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 pt-2">
                                <Stethoscope size={20} className="text-primary-600" /> Spesialis
                            </h3>
                            <p className="text-xs font-bold text-slate-400 uppercase mb-6">Rujukan yang Disarankan</p>
                            
                            <div className="bg-primary-50 border border-primary-100 p-4 rounded-2xl mb-6 text-center">
                                <span className="text-primary-700 font-extrabold text-lg">{session.result.consultation.recommended_specialist || 'Dokter Umum'}</span>
                            </div>

                            {session.result.doctor_recommendations && session.result.doctor_recommendations.doctors.length > 0 ? (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dokter Tersedia</p>
                                    {session.result.doctor_recommendations.doctors.map((doc) => {
                                        const isThisDoctorBooked = session.hasBooked && session.bookedDoctorName === doc.name;
                                        
                                        return (
                                        <div key={doc.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all group">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-lg group-hover:bg-primary-100 group-hover:text-primary-600 transition-colors">
                                                {doc.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                                                <p className="text-xs text-slate-500 truncate font-medium">{doc.clinic}</p>
                                            </div>
                                            {doc.is_verified && <BadgeCheck size={16} className="text-blue-500" />}
                                        </div>
                                        
                                        <button 
                                            onClick={() => handleBook(doc.id, doc.name)}
                                            disabled={bookingDoctorId !== null || session.hasBooked}
                                            className={`w-full py-3 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg
                                                ${isThisDoctorBooked
                                                    ? 'bg-emerald-500 shadow-emerald-200 cursor-default'
                                                    : session.hasBooked 
                                                        ? 'bg-slate-300 shadow-none cursor-not-allowed'
                                                        : bookingDoctorId === doc.id 
                                                            ? 'bg-primary-400 cursor-wait' 
                                                            : 'bg-slate-900 hover:bg-primary-600 shadow-slate-300 hover:shadow-primary-200'
                                                } disabled:opacity-70`}
                                        >
                                            {isThisDoctorBooked ? (
                                                <> <Check size={16} /> Terkirim </>
                                            ) : bookingDoctorId === doc.id ? (
                                                <> <Loader2 size={16} className="animate-spin" /> Mengirim... </>
                                            ) : session.hasBooked ? (
                                                <> Terpesan </>
                                            ) : (
                                                <>Booking & Kirim <ChevronRight size={14} /></>
                                            )}
                                        </button>
                                        </div>
                                    )})}
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 text-sm py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    Tidak ada dokter spesifik di dekat sini.
                                    <button className="block w-full mt-3 text-primary-600 font-bold hover:underline text-xs">Cari di Direktori</button>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
              </div>
          )}
       </div>
    </div>
  );
};
