
import React, { useEffect, useState } from 'react';
import { Stethoscope, Pill, Siren, Calendar, ChevronRight, Activity, Clock, FileText, ShieldAlert, CheckCircle2, Edit, X, Save, Mail, User as UserIcon, Loader2, Plus, ArrowUpRight, HeartPulse } from 'lucide-react';
import { AppView, User } from '../types';
import { consultationService, ConsultationRecord } from '../services/consultationService';
import { medicalRecordService } from '../services/medicalRecordService';

interface PatientDashboardProps {
    currentUser: User;
    onChangeView: (view: AppView) => void;
    onProfileUpdate?: (user: User) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ currentUser, onChangeView, onProfileUpdate }) => {
  const [history, setHistory] = useState<ConsultationRecord[]>([]);
  const [activePrescription, setActivePrescription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await consultationService.getPatientHistory(currentUser.id);
        setHistory(data);
        const timeline = await medicalRecordService.getPatientTimeline(currentUser.id);
        const latestRx = timeline.find(t => t.type === 'PRESCRIPTION' && t.status === 'ACTIVE'); 
        const recentRx = latestRx || timeline.find(t => t.type === 'PRESCRIPTION');
        setActivePrescription(recentRx);
      } catch (error) {
        console.error("Failed to load patient dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentUser.id]);

  return (
    <div className="animate-fade-in relative pt-6">
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-xl flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group border border-slate-100">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>
                
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 p-1 shadow-inner shrink-0">
                    {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover rounded-[1.3rem]" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><UserIcon size={40} /></div>
                    )}
                    <button 
                        onClick={() => onChangeView(AppView.PROFILE)}
                        className="absolute -bottom-2 -right-2 bg-slate-900 text-white p-2 rounded-xl shadow-lg hover:bg-primary-600 transition-colors"
                    >
                        <Edit size={14} />
                    </button>
                </div>

                <div className="flex-1 relative text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
                            <p className="text-slate-500 font-medium">{currentUser.email}</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2 justify-center">
                             <span className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Anggota Aktif
                             </span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">ID Member</p>
                            <p className="text-lg font-bold text-slate-800 tracking-wider font-mono">{currentUser.id}</p>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Umur / Gender</p>
                            <p className="text-lg font-bold text-slate-800">{currentUser.age || '30'} / {currentUser.gender === 'Male' ? 'L' : 'P'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4">
                <button 
                    onClick={() => onChangeView(AppView.CONSULTATION)}
                    className="flex-1 bg-slate-900 text-white rounded-[2.5rem] p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                >
                     <div className="absolute right-4 top-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center group-hover:rotate-45 transition-transform">
                        <ArrowUpRight size={24} />
                     </div>
                     <div className="flex flex-col h-full justify-end">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-emerald-400">
                            <Stethoscope size={28} />
                        </div>
                        <h3 className="text-2xl font-bold">Konsultasi Baru</h3>
                        <p className="text-slate-400 font-medium mt-1">Mulai Analisis AI</p>
                     </div>
                </button>

                 <button 
                    onClick={() => onChangeView(AppView.EMERGENCY)}
                    className="h-24 bg-white text-red-600 rounded-[2rem] px-8 flex items-center justify-between shadow-lg hover:shadow-xl border border-red-50 hover:bg-red-50 transition-all group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-2xl group-hover:scale-110 transition-transform">
                            <Siren size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-slate-900">Darurat</h3>
                            <p className="text-xs font-bold opacity-60">Panggil Ambulans</p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/40">
                        <Plus size={20} />
                    </div>
                </button>
            </div>
         </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
          
          <div className="lg:col-span-8 space-y-8">
             
             <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-bold text-slate-800">Riwayat Aktivitas</h2>
                <button className="px-5 py-2 bg-white text-slate-600 rounded-full text-sm font-bold shadow-sm hover:bg-slate-50 border border-slate-200 transition-colors">
                   Lihat Semua
                </button>
             </div>

             <div className="space-y-4">
                 {loading ? (
                     <div className="text-center py-12"><Loader2 className="animate-spin mx-auto text-slate-400" /></div>
                 ) : history.length === 0 ? (
                     <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100">
                        <div className="w-20 h-20 bg-slate-50 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <FileText size={32} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-bold">Belum ada riwayat.</p>
                     </div>
                 ) : (
                     history.map((record) => (
                         <div key={record.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-lg transition-all flex flex-col md:flex-row items-center gap-6 group cursor-pointer">
                             <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 ${
                                 record.result.urgency_level === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                                 record.result.urgency_level === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                                 'bg-emerald-50 text-emerald-600'
                             }`}>
                                 {record.result.urgency_level === 'CRITICAL' ? <Siren size={28}/> : <Activity size={28}/>}
                             </div>
                             
                             <div className="flex-1 text-center md:text-left w-full">
                                 <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                                     <h3 className="text-lg font-bold text-slate-800">{record.result.possible_conditions?.[0]}</h3>
                                     <span className="text-xs font-bold text-slate-400 flex items-center justify-center gap-1">
                                        <Clock size={12}/> {new Date(record.createdAt).toLocaleDateString()}
                                     </span>
                                 </div>
                                 <p className="text-slate-500 font-medium text-sm line-clamp-1">{record.result.analysis}</p>
                             </div>

                             <div className="w-full md:w-auto flex md:flex-col items-center justify-between gap-2 min-w-[100px]">
                                 {record.appointment ? (
                                     <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold w-full text-center">Terjadwal</span>
                                 ) : record.result.doctor_referral_needed ? (
                                     <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-bold w-full text-center">Butuh Rujukan</span>
                                 ) : (
                                    <span className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold w-full text-center">Selesai</span>
                                 )}
                             </div>
                         </div>
                     ))
                 )}
             </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mt-10 -mr-10"></div>
                  <h3 className="text-xl font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
                      <Pill className="text-blue-500" /> Obat Aktif
                  </h3>

                  {activePrescription ? (
                      <div className="bg-blue-50 rounded-3xl p-6 relative z-10">
                          <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                                  <Pill size={20} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-800 text-lg">{activePrescription.title}</h4>
                                  <p className="text-blue-600 text-xs font-bold mt-1 uppercase">Harian • Sesudah Makan</p>
                              </div>
                          </div>
                          <p className="mt-4 text-slate-500 text-sm leading-relaxed">{activePrescription.summary}</p>
                          <button 
                            onClick={() => onChangeView(AppView.PRESCRIPTION)}
                            className="w-full mt-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all"
                          >
                              Lihat Resep
                          </button>
                      </div>
                  ) : (
                      <div className="text-center py-8 relative z-10">
                          <div className="w-16 h-16 bg-slate-50 rounded-full mx-auto mb-3 flex items-center justify-center">
                              <CheckCircle2 className="text-slate-300" size={24} />
                          </div>
                          <p className="text-slate-400 font-bold text-sm">Tidak ada obat aktif.</p>
                      </div>
                  )}
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Calendar className="text-purple-400" /> Kunjungan Berikutnya
                  </h3>
                  
                  {history.some(h => h.appointment) ? (
                       history.filter(h => h.appointment).slice(0,1).map(h => (
                          <div key={h.appointment?.id}>
                              <div className="text-3xl font-bold mb-1">
                                  {new Date(h.appointment?.timestamp || '').toLocaleDateString([], {day: 'numeric'})}
                              </div>
                              <div className="text-lg font-medium opacity-80 mb-4">
                                  {new Date(h.appointment?.timestamp || '').toLocaleDateString([], {month: 'long'})}
                              </div>
                              
                              <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold">
                                      Dr
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm">Dr. {h.suggestedDoctors.find(d => d.id === h.appointment?.doctorId)?.name.split(' ').pop()}</p>
                                      <p className="text-xs opacity-70 uppercase tracking-wider font-bold">{h.appointment?.status}</p>
                                  </div>
                              </div>
                          </div>
                      ))
                  ) : (
                      <div className="text-center py-6 opacity-50">
                          <p className="text-sm">Tidak ada jadwal kunjungan.</p>
                          <button onClick={() => onChangeView(AppView.CONSULTATION)} className="mt-2 text-xs font-bold text-purple-300 hover:text-white underline">Buat Janji</button>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
