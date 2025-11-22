
import React, { useEffect, useState } from 'react';
import { Calendar, Clock, User as UserIcon, ChevronRight, Plus, MessageSquare, FileText, Video, Users, Activity, BarChart3, MapPin, BadgeCheck, Edit, Building2 } from 'lucide-react';
import { User, AppView } from '../types';
import { consultationService } from '../services/consultationService';

interface DashboardProps {
    currentUser: User;
    onChangeView?: (view: AppView) => void; 
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onChangeView }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, avgRating: 4.9 });
  const [weeklyData, setWeeklyData] = useState<number[]>([0,0,0,0,0,0,0]);
  
  const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchAppointments = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const data = await consultationService.getDoctorAppointments(currentUser.id);
            setAppointments(data);

            const uniquePatientIds = new Set(data.map(item => item.patient.id));
            setStats(prev => ({ ...prev, totalPatients: uniquePatientIds.size }));

            const dayCounts = [0, 0, 0, 0, 0, 0, 0];
            data.forEach(apt => {
                const date = new Date(apt.timestamp);
                let dayIndex = date.getDay() - 1;
                if (dayIndex < 0) dayIndex = 6; 
                dayCounts[dayIndex]++;
            });

            const maxVal = Math.max(...dayCounts, 1);
            const percentages = dayCounts.map(count => Math.round((count / maxVal) * 100));
            
            if (data.length === 0) {
                 setWeeklyData([0, 0, 0, 0, 0, 0, 0]);
            } else {
                 setWeeklyData(percentages);
            }

        } catch (error) {
            console.error("Failed to load dashboard data", error);
        } finally {
            setLoading(false);
        }
    };
    fetchAppointments();
  }, [currentUser]);

  const handleQueueClick = () => {
      if (onChangeView) {
          onChangeView(AppView.DOCTOR_PATIENTS);
      }
  };

  return (
    <div className="animate-fade-in relative pt-6">
      
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500"></div>

            <div className="relative w-28 h-28 rounded-[1.8rem] bg-gradient-to-br from-slate-100 to-slate-200 p-1 shadow-inner shrink-0">
                {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover rounded-[1.6rem]" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 bg-white rounded-[1.6rem]">
                        <UserIcon size={40} />
                    </div>
                )}
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-md">
                    <div className="bg-emerald-500 w-3 h-3 rounded-full animate-pulse border-2 border-white"></div>
                </div>
            </div>

            <div className="flex-1 relative text-center md:text-left z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">{currentUser.name}</h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 font-medium mb-4">
                            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                                <BadgeCheck size={14} /> {currentUser.specialization || 'Dokter Umum'}
                            </span>
                            <span className="flex items-center gap-1.5 text-sm">
                                <Building2 size={16} /> {currentUser.clinic || 'Klinik HealthTown'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="hidden md:block text-right">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Hari Ini</p>
                        <p className="text-slate-800 font-bold text-lg">{today}</p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start border-t border-slate-50 pt-4 mt-1">
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Nomor STR</p>
                        <p className="text-sm font-bold text-slate-700 font-mono">{currentUser.strNumber || 'N/A'}</p>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Pengalaman</p>
                         <p className="text-sm font-bold text-slate-700">{currentUser.experienceYears || 5}+ Tahun</p>
                    </div>
                     <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                         <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">Status</p>
                         <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                            Tersedia
                         </p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <div className="lg:col-span-8 space-y-8">
                
                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100">
                    <div className="flex justify-between items-end mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Antrian Pasien</h2>
                            <p className="text-slate-500 font-medium">Dijadwalkan untuk hari ini</p>
                        </div>
                        <div className="text-3xl font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-2xl">
                            {appointments.length} <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Menunggu</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-12 text-center text-slate-400">Sinkronisasi jadwal...</div>
                        ) : appointments.length === 0 ? (
                            <div className="py-16 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <Clock size={48} className="text-slate-300 mb-4" />
                                <p className="text-slate-500 font-bold">Belum ada janji temu.</p>
                            </div>
                        ) : (
                            appointments.map((apt, idx) => {
                                const timeSlot = new Date(apt.timestamp);
                                return (
                                    <div 
                                        key={apt.appointmentId} 
                                        onClick={handleQueueClick}
                                        className="group flex items-center gap-6 p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all cursor-pointer"
                                    >
                                        <div className="flex flex-col items-center justify-center min-w-[80px] py-2 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                                            <span className="text-lg font-bold text-slate-900">{timeSlot.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-xl text-slate-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                                            {apt.patient.name.charAt(0)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 truncate">{apt.patient.name}</h3>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${apt.consultation?.urgency === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {apt.consultation?.urgency || 'NORMAL'}
                                                </span>
                                                <span className="text-sm text-slate-500 truncate">{apt.consultation?.primaryCondition || 'Pemeriksaan Umum'}</span>
                                            </div>
                                        </div>

                                        <button className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                            <Users size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.totalPatients}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Total Pasien</div>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center hover:-translate-y-1 transition-transform">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3">
                            <Activity size={24} />
                        </div>
                        <div className="text-2xl font-bold text-slate-900">{stats.avgRating}</div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Rating</div>
                    </div>
                </div>

                 <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 h-full">
                     <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 text-sm">Kunjungan Mingguan</h3>
                        <BarChart3 size={16} className="text-slate-400" />
                     </div>
                     <div className="flex items-end justify-between h-40 gap-2 pb-2">
                         {weeklyData.map((h, i) => (
                             <div key={i} className="w-full bg-slate-100 rounded-t-lg hover:bg-indigo-500 transition-colors relative group" style={{height: `${h || 5}%`}}>
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                     {h > 0 ? `${h}% Aktivitas` : '0'}
                                 </div>
                             </div>
                         ))}
                     </div>
                     <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                         <span>Sen</span>
                         <span>Min</span>
                     </div>
                 </div>

            </div>
        </div>
      </div>
    </div>
  );
};
