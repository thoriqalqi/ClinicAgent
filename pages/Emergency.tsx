
import React, { useState } from 'react';
import { assessEmergency, findNearbyFacilities } from '../services/geminiService';
import { emergencyService } from '../services/emergencyService';
import { EmergencyAssessment, Hospital, EmergencyUnit } from '../types';
import { Siren, Activity, Phone, ShieldCheck, MapPin, Navigation, Ambulance, UserPlus, CheckCircle2, Locate, AlertTriangle } from 'lucide-react';

interface EmergencySession {
  stage: 'INPUT' | 'ANALYZING' | 'RESULTS' | 'DISPATCHED';
  symptoms: string;
  assessment: EmergencyAssessment | null;
  hospitals: Hospital[];
  dispatchedUnit: EmergencyUnit | null;
  doctorStatus: string;
  userLocation: {lat: number, lng: number} | null;
  locationStatus: 'IDLE' | 'REQUESTING' | 'GRANTED' | 'DENIED';
}

const DEFAULT_SESSION: EmergencySession = {
  stage: 'INPUT',
  symptoms: '',
  assessment: null,
  hospitals: [],
  dispatchedUnit: null,
  doctorStatus: '',
  userLocation: null,
  locationStatus: 'IDLE'
};

let emergencyCache: EmergencySession = { ...DEFAULT_SESSION };

export const Emergency: React.FC = () => {
  const [session, setSession] = useState<EmergencySession>(emergencyCache);

  const updateSession = (updates: Partial<EmergencySession>) => {
    setSession(prev => {
      const newState = { ...prev, ...updates };
      emergencyCache = newState;
      return newState;
    });
  };

  const handleReset = () => {
      const cleanState = { ...DEFAULT_SESSION };
      emergencyCache = cleanState;
      setSession(cleanState);
  };

  const handleEnableLocation = () => {
      if (!navigator.geolocation) {
          alert("Geolokasi tidak didukung oleh browser Anda.");
          return;
      }
      updateSession({ locationStatus: 'REQUESTING' });
      
      navigator.geolocation.getCurrentPosition(
          (position) => {
              updateSession({
                  userLocation: {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  },
                  locationStatus: 'GRANTED'
              });
          },
          (error) => {
              console.error("Location access denied", error);
              updateSession({ locationStatus: 'DENIED' });
              alert("Akses lokasi diperlukan untuk menemukan ambulans terdekat.");
          }
      );
  };

  const handleTriage = async () => {
    if (!session.symptoms.trim()) return;
    
    if (session.locationStatus !== 'GRANTED') {
        const proceed = window.confirm("Lokasi tidak aktif. Kami tidak dapat menemukan fasilitas terdekat secara akurat. Lanjutkan dengan data default?");
        if (!proceed) return;
    }

    updateSession({ stage: 'ANALYZING' });
    
    try {
        const aiPromise = assessEmergency(session.symptoms);
        let hospitalPromise;
        if (session.userLocation) {
            hospitalPromise = findNearbyFacilities(session.userLocation.lat, session.userLocation.lng, session.symptoms);
        } else {
            hospitalPromise = emergencyService.findNearbyHospitals();
        }

        const [aiResult, hospitalList] = await Promise.all([aiPromise, hospitalPromise]);

        let finalHospitals = hospitalList;
        if (hospitalList.length === 0) {
             const fallback = await emergencyService.findNearbyHospitals();
             finalHospitals = fallback;
        }

        updateSession({
            assessment: aiResult,
            hospitals: finalHospitals,
            stage: 'RESULTS'
        });

    } catch (error) {
        alert("Sistem Error. Silakan hubungi 112 segera.");
        updateSession({ stage: 'INPUT' });
    }
  };

  const handleSOS = async () => {
      if (!session.assessment) return;
      
      const confirm = window.confirm("KONFIRMASI DARURAT\n\nApakah Anda ingin memanggil 112 dan mengirim ambulans ke lokasi Anda?");
      if (!confirm) return;

      window.location.href = 'tel:112';
      updateSession({ stage: 'DISPATCHED' });
      
      try {
        const unit = await emergencyService.dispatchAmbulance();
        const docMsg = await emergencyService.notifyOnCallDoctor('Current User', session.assessment.summary);
        updateSession({
            dispatchedUnit: unit,
            doctorStatus: docMsg
        });
      } catch (e) {
          console.error("Internal dispatch sync failed, but phone call should have triggered.");
      }
  };

  return (
    <div className="animate-fade-in relative pt-6">
       <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
          {session.stage === 'INPUT' && (
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-red-50 text-red-600 mb-6 animate-pulse shadow-xl shadow-red-500/20 border-4 border-red-100">
                        <Siren size={48} />
                    </div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Respon Darurat</h1>
                    <p className="text-slate-500 text-lg mt-2 font-medium">Sistem Triase & Dispatch Bertenaga AI</p>
                </div>

                <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl">
                    
                    <div className={`mb-8 p-5 rounded-2xl border flex items-center justify-between ${session.locationStatus === 'GRANTED' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-blue-50 border-blue-100 text-blue-800'}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${session.locationStatus === 'GRANTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                <MapPin size={24} />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{session.locationStatus === 'GRANTED' ? 'Lokasi Aktif' : 'Aktifkan Layanan Lokasi'}</p>
                                <p className="text-sm opacity-80 font-medium">Diperlukan untuk menemukan ambulans & fasilitas terdekat.</p>
                            </div>
                        </div>
                        {session.locationStatus !== 'GRANTED' && (
                            <button 
                                onClick={handleEnableLocation}
                                className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
                            >
                                {session.locationStatus === 'REQUESTING' ? 'Mencari...' : <><Locate size={18} /> Aktifkan</>}
                            </button>
                        )}
                        {session.locationStatus === 'GRANTED' && <CheckCircle2 size={28} className="text-emerald-600" />}
                    </div>

                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider pl-1">Jelaskan Situasi / Gejala</label>
                    <div className="flex flex-col gap-6">
                    <textarea
                        rows={3}
                        value={session.symptoms}
                        onChange={(e) => updateSession({ symptoms: e.target.value })}
                        placeholder="Cth: Nyeri dada hebat, sesak napas, pendarahan..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 focus:ring-4 focus:ring-red-100 focus:border-red-400 focus:outline-none text-xl text-slate-900 placeholder:text-slate-400 resize-none font-medium transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleTriage()}
                    />
                    <button
                        onClick={handleTriage}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-[2rem] font-bold text-2xl shadow-xl shadow-red-600/30 transition-all flex items-center justify-center gap-4 active:scale-[0.98] hover:-translate-y-1"
                    >
                        <Activity size={28} /> CEK PRIORITAS
                    </button>
                    </div>
                    <p className="text-center text-sm text-slate-400 mt-6 font-medium">
                        Untuk keadaan darurat yang mengancam jiwa, selalu hubungi <span className="font-bold text-slate-700">112</span> secara langsung.
                    </p>
                </div>
            </div>
          )}

          {session.stage === 'ANALYZING' && (
            <div className="flex flex-col items-center justify-center h-[70vh]">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Siren size={56} className="text-red-600 animate-pulse" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-slate-800">Menganalisis Vital...</h2>
                <p className="text-slate-500 mt-2 text-lg font-medium">Memindai jaringan kesehatan terdekat berdasarkan gejala</p>
            </div>
          )}

          {session.stage === 'RESULTS' && session.assessment && (
             <div className="animate-fade-in">
                <div className={`p-10 rounded-[2.5rem] text-white shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-8 ${session.assessment.color}`}>
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center border border-white/30">
                            <Activity size={48} />
                        </div>
                        <div>
                            <p className="font-bold opacity-80 uppercase tracking-widest text-sm mb-1">Penilaian Triase</p>
                            <h2 className="text-6xl font-black tracking-tight">{session.assessment.severity}</h2>
                            <p className="mt-2 opacity-90 text-xl font-medium leading-snug max-w-xl">{session.assessment.summary}</p>
                        </div>
                    </div>
                    
                    {(session.assessment.severity === 'CRITICAL' || session.assessment.severity === 'HIGH') ? (
                        <button 
                            onClick={handleSOS}
                            className="bg-white text-red-600 px-8 py-5 rounded-2xl font-black text-2xl shadow-lg hover:scale-105 transition-transform flex items-center gap-3 animate-pulse shrink-0"
                        >
                            <Phone size={28} /> KIRIM SOS
                        </button>
                    ) : (
                        <div className="bg-white/20 px-8 py-4 rounded-2xl font-bold text-xl backdrop-blur-sm border border-white/30 shrink-0">
                            Pantau Ketat
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <h3 className="font-bold text-xl text-slate-800 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={24} /></div>
                                Rencana Tindakan Segera
                            </h3>
                            <div className="space-y-4">
                                {session.assessment.actionPlan.map((action, idx) => (
                                    <div key={idx} className="flex items-start gap-5 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-200/60">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-slate-800 font-bold text-lg pt-1.5">{action}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><MapPin size={24} /></div>
                                    Fasilitas Terdekat
                                </h3>
                                {session.userLocation && (
                                    <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-wide">
                                        Google Maps™ Grounded
                                    </span>
                                )}
                            </div>
                            <div className="space-y-4">
                                {session.hospitals.map((hospital, index) => (
                                    <div key={hospital.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-[1.5rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                                <Navigation size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-800">{hospital.name}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{hospital.type} • {hospital.distance}</p>
                                                {hospital.address && (
                                                    <p className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{hospital.address}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                                            <div>
                                                <p className="text-xl font-black text-emerald-600">{hospital.eta}</p>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Est. Tiba</p>
                                            </div>
                                            
                                            {hospital.googleMapsUri && (
                                                <a 
                                                    href={hospital.googleMapsUri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="mt-0 sm:mt-2 text-xs bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                                >
                                                    Buka Peta
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {session.hospitals.length === 0 && (
                                    <div className="text-center p-8 bg-slate-50 rounded-[1.5rem] text-slate-500 font-medium">
                                        <AlertTriangle className="mx-auto mb-3 opacity-40" size={32} />
                                        Tidak ada fasilitas terdekat ditemukan.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-700">
                            <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                                <Activity size={24} className="text-emerald-400" /> Analisis AI
                            </h3>
                            <p className="text-slate-300 leading-relaxed text-lg font-medium">
                                {session.assessment.summary}
                            </p>
                            <div className="mt-8 pt-6 border-t border-slate-700/50">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Sistem Live Aktif</p>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    Memantau vital dan kapasitas darurat lokal.
                                </p>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleReset}
                            className="w-full py-5 text-slate-500 font-bold hover:bg-white hover:text-slate-800 hover:shadow-lg rounded-[1.5rem] transition-all border border-transparent hover:border-slate-200"
                        >
                            Batal / Penilaian Baru
                        </button>
                    </div>
                </div>
             </div>
          )}

          {session.stage === 'DISPATCHED' && (
            <div className="max-w-2xl mx-auto animate-scale-in pt-8">
                <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
                    <div className="bg-emerald-500 p-10 text-center text-white">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight">Unit Dikirim</h2>
                        <p className="opacity-90 text-lg font-medium">Memanggil 112... Bantuan sedang menuju ke sana.</p>
                    </div>
                    
                    <div className="p-10 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center shrink-0 animate-pulse border border-slate-100">
                                <Ambulance size={40} className="text-slate-700" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-2xl text-slate-900">Ambulans {session.dispatchedUnit?.id || '...'}</h3>
                                    <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-extrabold tracking-wide">EN ROUTE</span>
                                </div>
                                <p className="text-slate-500 mt-1 font-medium">ETA: <span className="font-bold text-slate-900 text-xl">{session.dispatchedUnit?.eta || 'Menghitung...'}</span></p>
                                <p className="text-sm text-slate-400 mt-1 font-mono">Plat: {session.dispatchedUnit?.plateNumber}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-blue-50 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-blue-100">
                                <UserPlus size={40} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-slate-900">Dokter Jaga</h3>
                                <p className="text-slate-600 font-medium leading-snug mt-1">
                                    {session.doctorStatus || "Menghubungi petugas medis terdekat..."}
                                </p>
                            </div>
                        </div>

                        <div className="h-56 bg-slate-100 rounded-[2rem] border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                            <MapPin size={40} className="text-slate-300 mb-3" />
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <p className="absolute bottom-6 text-xs font-bold text-slate-600 bg-white/90 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm border border-slate-200">
                                Pelacakan Langsung Aktif
                            </p>
                        </div>
                        
                        <button 
                            onClick={handleReset}
                            className="w-full py-5 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
                        >
                            Kembali ke Beranda Darurat
                        </button>
                    </div>
                </div>
            </div>
          )}
        </div>
    </div>
  );
};
