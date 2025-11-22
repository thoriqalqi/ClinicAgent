
import React, { useEffect, useState } from 'react';
import { consultationService } from '../services/consultationService';
import { User } from '../types';
import { Users, Clock, ChevronRight, AlertCircle, CheckCircle2, FileText, Activity, X, CalendarCheck, User as UserIcon, ClipboardCheck, Pill } from 'lucide-react';

interface DoctorPatientsProps {
  currentUser: User;
  onWritePrescription?: (data: { patientId: string; patientName: string; diagnosis?: string }) => void;
}

export const DoctorPatients: React.FC<DoctorPatientsProps> = ({ currentUser, onWritePrescription }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [currentUser.id]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const data = await consultationService.getDoctorAppointments(currentUser.id);
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load patients", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status: 'CONFIRMED' | 'COMPLETED') => {
      if (!selectedAppointment) return;
      setActionLoading(true);
      try {
          await consultationService.updateAppointmentStatus(selectedAppointment.appointmentId, status);
          await loadPatients();
          setSelectedAppointment(null);
          alert(`Status pasien diperbarui menjadi ${status}`);
      } catch (error) {
          alert("Gagal memperbarui status");
      } finally {
          setActionLoading(false);
      }
  };

  const handleWritePrescriptionClick = () => {
      if (!selectedAppointment || !onWritePrescription) return;
      
      onWritePrescription({
          patientId: selectedAppointment.patient.id,
          patientName: selectedAppointment.patient.name,
          diagnosis: selectedAppointment.consultation?.primaryCondition
      });
  };

  const getUrgencyColor = (level: string) => {
    switch(level) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'CONFIRMED': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'COMPLETED': return 'bg-slate-100 text-slate-600 border-slate-200';
          case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200';
          default: return 'bg-slate-100 text-slate-500';
      }
  };

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <Users size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pasien Saya</h1>
          <p className="text-slate-500 text-sm">Kelola permintaan konsultasi dan penilaian AI.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Memuat antrian pasien...</div>
      ) : appointments.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
           <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <Users className="text-slate-300" size={24} />
           </div>
           <h3 className="text-lg font-bold text-slate-700">Belum Ada Pasien</h3>
           <p className="text-slate-500 text-sm">Pasien yang membuat janji dengan Anda akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-4">
           {appointments.map((item) => (
             <div key={item.appointmentId} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all animate-slide-up">
               <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="flex items-start gap-4 min-w-[250px]">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-blue-100 text-primary-700 flex items-center justify-center font-bold text-lg relative">
                        {item.patient.name.charAt(0)}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${item.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                     </div>
                     <div>
                        <h3 className="font-bold text-slate-800 text-lg">{item.patient.name}</h3>
                        <p className="text-slate-500 text-sm">{item.patient.email}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                           <Clock size={12} />
                           {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                     </div>
                  </div>

                  {item.consultation && (
                     <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSelectedAppointment(item)}>
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                              <Activity size={16} className="text-primary-500" /> Penilaian AI
                           </h4>
                           <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide ${getUrgencyColor(item.consultation.urgency)}`}>
                              Prioritas {item.consultation.urgency}
                           </span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium mb-1">
                           Kemungkinan: {item.consultation.primaryCondition}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2">
                           {item.consultation.summary}
                        </p>
                     </div>
                  )}

                  <div className="flex flex-col justify-between min-w-[140px] gap-2">
                     <span className={`text-center text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${getStatusBadge(item.status)}`}>
                        {item.status}
                     </span>
                     
                     <button 
                        onClick={() => setSelectedAppointment(item)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20 transition-all"
                     >
                        Tinjau <ChevronRight size={16} />
                     </button>
                  </div>

               </div>
             </div>
           ))}
        </div>
      )}

      {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                      <div>
                          <h3 className="font-bold text-lg text-slate-800">Tinjauan Pasien</h3>
                          <p className="text-xs text-slate-500">ID: {selectedAppointment.patient.id} • Ref: {selectedAppointment.consultation?.id}</p>
                      </div>
                      <button onClick={() => setSelectedAppointment(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-200 rounded-full transition-all">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="p-6 overflow-y-auto space-y-6">
                      <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                              {selectedAppointment.patient.name.charAt(0)}
                          </div>
                          <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full">
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">Nama</p>
                                  <p className="font-bold text-slate-800">{selectedAppointment.patient.name}</p>
                              </div>
                              <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold">Kontak</p>
                                  <p className="font-medium text-slate-700">{selectedAppointment.patient.email}</p>
                              </div>
                              {selectedAppointment.consultation && (
                                  <>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Umur / Gender</p>
                                        <p className="font-medium text-slate-700">{selectedAppointment.consultation.age} / {selectedAppointment.consultation.gender}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold">Durasi Gejala</p>
                                        <p className="font-medium text-slate-700">{selectedAppointment.consultation.duration}</p>
                                    </div>
                                  </>
                              )}
                          </div>
                      </div>

                      {selectedAppointment.consultation ? (
                          <div className="space-y-4">
                              <div>
                                  <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                                      <Activity size={18} className="text-primary-600" /> Gejala yang Dilaporkan
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                      {selectedAppointment.consultation.symptoms.map((s: string, i: number) => (
                                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm border border-slate-200">
                                              {s}
                                          </span>
                                      ))}
                                  </div>
                                  {selectedAppointment.consultation.notes && (
                                      <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                                          " {selectedAppointment.consultation.notes} "
                                      </div>
                                  )}
                              </div>

                              <div>
                                  <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                                      <FileText size={18} className="text-primary-600" /> Analisis & Temuan AI
                                  </h4>
                                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed">
                                      {selectedAppointment.consultation.summary}
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                      {selectedAppointment.consultation.possibleConditions.map((c: string, i: number) => (
                                          <span key={i} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-bold border border-primary-100">
                                              Kemungkinan: {c}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="text-center p-6 text-slate-400 italic">Data Konsultasi AI tidak tersedia.</div>
                      )}
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-3">
                      <div className="flex gap-3">
                        {selectedAppointment.status === 'PENDING' && (
                            <button 
                                onClick={() => handleStatusUpdate('CONFIRMED')}
                                disabled={actionLoading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
                            >
                                {actionLoading ? 'Memproses...' : <><CalendarCheck size={18} /> Terima Janji Temu</>}
                            </button>
                        )}
                        
                        {selectedAppointment.status === 'CONFIRMED' && (
                            <button 
                                onClick={() => handleStatusUpdate('COMPLETED')}
                                disabled={actionLoading}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                {actionLoading ? 'Memproses...' : <><ClipboardCheck size={18} /> Tandai Selesai</>}
                            </button>
                        )}

                        {selectedAppointment.status === 'COMPLETED' && (
                            <div className="w-full p-3 text-center text-emerald-600 font-bold bg-emerald-50 rounded-xl border border-emerald-100">
                                <CheckCircle2 size={16} className="inline mr-2" /> Janji Temu Selesai
                            </div>
                        )}
                      </div>

                      {onWritePrescription && (
                          <button 
                            onClick={handleWritePrescriptionClick}
                            className="w-full py-3 bg-white border border-blue-200 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                          >
                              <Pill size={18} /> Tulis Resep untuk {selectedAppointment.patient.name.split(' ')[0]}
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
      </div>
    </div>
  );
};
