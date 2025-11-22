
import React, { useState, useEffect } from 'react';
import { MedicalTimelineItem, User, MedicalRecordType, UserRole } from '../types';
import { medicalRecordService } from '../services/medicalRecordService';
import { 
  FileText, 
  Search, 
  Calendar, 
  Filter, 
  Download, 
  Stethoscope, 
  Pill, 
  ChevronRight,
  X,
  CheckCircle2,
  ClipboardList,
  Clock,
  Activity,
  Ban,
  Users,
  ArrowLeft
} from 'lucide-react';

interface MedicalRecordsProps {
  currentUser: User;
}

export const MedicalRecords: React.FC<MedicalRecordsProps> = ({ currentUser }) => {
  const [records, setRecords] = useState<MedicalTimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isDoctor = currentUser.role === UserRole.DOCTOR;
  const [doctorPatients, setDoctorPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');

  const [selectedRecord, setSelectedRecord] = useState<MedicalTimelineItem | null>(null);

  useEffect(() => {
    if (isDoctor) {
        loadDoctorPatients();
    } else {
        loadPatientData(currentUser.id);
    }
  }, [currentUser.id, isDoctor]);

  useEffect(() => {
      if (isDoctor && selectedPatientId) {
          loadPatientData(selectedPatientId);
      }
  }, [selectedPatientId]);

  const loadDoctorPatients = async () => {
      setLoading(true);
      try {
          const patients = await medicalRecordService.getDoctorPatients(currentUser.id, currentUser.name);
          setDoctorPatients(patients);
      } catch(e) {
          console.error("Failed to load doctor patients", e);
      } finally {
          setLoading(false);
      }
  };

  const loadPatientData = async (pid: string) => {
    setLoading(true);
    try {
      const data = await medicalRecordService.getPatientTimeline(pid);
      setRecords(data || []);
    } catch (e) {
      console.error("Failed to load records", e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDirectory = () => {
      setSelectedPatientId(null);
      setRecords([]);
  };

  const years = Array.from(new Set(records.map(r => {
      try {
          const d = new Date(r.date);
          return isNaN(d.getTime()) ? '2024' : d.getFullYear().toString();
      } catch {
          return '2024';
      }
  }))).sort().reverse();

  const filteredRecords = records.filter(record => {
    if (!record) return false;
    const title = record.title || '';
    const summary = record.summary || '';
    const provider = record.provider || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          provider.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'ALL' || record.type === typeFilter;
    
    let recordYear = '2024';
    try {
        const d = new Date(record.date);
        if (!isNaN(d.getTime())) {
            recordYear = d.getFullYear().toString();
        }
    } catch (e) {}
    
    const matchesYear = yearFilter === 'ALL' || recordYear === yearFilter;
    
    return matchesSearch && matchesType && matchesYear;
  });

  const filteredDoctorPatients = doctorPatients.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'CONSULTATION': return <Stethoscope size={24} />;
      case 'PRESCRIPTION': return <Pill size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const getTypeColor = (type: MedicalRecordType) => {
    switch (type) {
      case 'CONSULTATION': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'PRESCRIPTION': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };
  
  const getStatusBadge = (status?: string) => {
      switch (status) {
        case 'COMPLETED': 
            return <span className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200"><CheckCircle2 size={12}/> Selesai</span>;
        case 'ACTIVE': 
            return <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200"><Activity size={12}/> Aktif</span>;
        case 'PENDING': 
            return <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200"><Clock size={12}/> Menunggu</span>;
        case 'CANCELLED': 
            return <span className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200"><Ban size={12}/> Batal</span>;
        default: 
            return <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
      }
  };

  const formatDate = (dateString: string) => {
      try {
          const d = new Date(dateString);
          if (isNaN(d.getTime())) return 'Tanggal Tidak Valid';
          return d.toLocaleDateString('id-ID', { 
             day: 'numeric', month: 'long', year: 'numeric' 
          });
      } catch {
          return 'Unknown Date';
      }
  };

  const renderRecordDetails = (record: MedicalTimelineItem) => {
      if (!record.details) return <p className="text-slate-500 italic">Tidak ada detail tambahan.</p>;

      let data: any;
      try {
          data = JSON.parse(record.details);
      } catch (e) {
          return <p className="text-slate-500">{record.details}</p>;
      }

      if (record.type === 'PRESCRIPTION') {
          return (
              <div className="space-y-6">
                  <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <h4 className="text-xs font-bold text-blue-700 uppercase mb-2">Diagnosis</h4>
                      <p className="text-slate-900 font-bold text-lg">{data.diagnosis || 'N/A'}</p>
                  </div>
                  
                  <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                          <Pill size={18} className="text-blue-500"/> Obat yang Diresepkan
                      </h4>
                      <div className="border border-slate-200 rounded-2xl overflow-hidden">
                          <table className="w-full text-left text-sm">
                              <thead className="bg-slate-50">
                                  <tr>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Obat</th>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Dosis</th>
                                      <th className="p-4 text-xs font-bold text-slate-500 uppercase">Frekuensi</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {data.items?.map((item: any, idx: number) => (
                                      <tr key={idx}>
                                          <td className="p-4 font-bold text-slate-800">{item.medicine}</td>
                                          <td className="p-4 text-slate-600 font-medium">{item.dosage}</td>
                                          <td className="p-4 text-slate-600">{item.frequency}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>

                  {data.advice && (
                      <div>
                          <h4 className="text-sm font-bold text-slate-700 mb-2">Saran Dokter</h4>
                          <p className="text-sm text-slate-600 bg-amber-50 p-4 rounded-2xl border border-amber-100 leading-relaxed">
                              {data.advice}
                          </p>
                      </div>
                  )}
              </div>
          );
      }

      if (record.type === 'CONSULTATION') {
          return (
              <div className="space-y-6">
                  <div className="p-5 bg-purple-50 rounded-2xl border border-purple-100">
                      <h4 className="text-xs font-bold text-purple-700 uppercase mb-2">Analisis AI</h4>
                      <p className="text-slate-900 text-sm leading-relaxed font-medium">{data.analysis}</p>
                  </div>

                  <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3">Kondisi yang Mungkin</h4>
                      <div className="flex flex-wrap gap-2">
                          {data.possible_conditions?.map((c: string, i: number) => (
                              <span key={i} className="px-3 py-1.5 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 border border-slate-200">
                                  {c}
                              </span>
                          ))}
                      </div>
                  </div>

                  <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-3">Tindakan yang Disarankan</h4>
                      <ul className="space-y-3">
                          {data.recommended_actions?.map((action: string, i: number) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                  {action}
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          );
      }

      return <div className="text-slate-500">Format detail tidak dikenali.</div>;
  };

  if (isDoctor && !selectedPatientId) {
      return (
        <div className="animate-fade-in relative pt-6">
          <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                    Direktori Pasien
                </h1>
                <p className="text-slate-500 font-medium mt-1 ml-1">Pilih pasien untuk melihat riwayat medis mereka.</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl mb-8">
                <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Cari nama atau ID pasien..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-900 font-bold transition-all"
                />
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-slate-400">Memuat pasien...</div>
            ) : filteredDoctorPatients.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-[2.5rem] border border-slate-100">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold text-slate-600">Pasien Tidak Ditemukan</h3>
                    <p className="text-slate-400">Anda belum memeriksa pasien mana pun.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDoctorPatients.map((patient) => (
                        <div 
                            key={patient.id} 
                            onClick={() => { setSelectedPatientId(patient.id); setSelectedPatientName(patient.name); }}
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xl">
                                    {patient.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{patient.email}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Kondisi Kunjungan Terakhir</p>
                                <p className="text-sm font-bold text-slate-800 truncate">{patient.condition}</p>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-xs font-bold text-slate-400">
                                <span>ID: {patient.id}</span>
                                <span className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                                    Lihat Rekam Medis <ChevronRight size={14} />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      );
  }

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
             {isDoctor && (
                 <button 
                    onClick={handleBackToDirectory}
                    className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors mr-2"
                 >
                     <ArrowLeft size={20} />
                 </button>
             )}
             <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><FileText size={24} /></div>
             <h1 className="text-3xl font-bold text-slate-900">
                 {isDoctor ? `Rekam Medis ${selectedPatientName}` : 'Riwayat Medis'}
             </h1>
          </div>
          <p className="text-slate-500 font-medium mt-1 ml-1">
             {isDoctor ? `Melihat riwayat lengkap untuk ${selectedPatientName}.` : 'Riwayat lengkap konsultasi dan resep obat.'}
          </p>
        </div>
        {!isDoctor && (
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2 transition-all text-sm">
            <Download size={18} /> Ekspor Data
            </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col md:flex-row gap-4 items-center mb-8">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan kondisi, dokter, atau klinik..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-900 font-medium transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={20} className="text-slate-300 hidden md:block" />
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-400 w-full md:w-44 text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="ALL">Semua Tipe</option>
            <option value="CONSULTATION">Konsultasi</option>
            <option value="PRESCRIPTION">Resep Obat</option>
          </select>

          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-400 w-full md:w-36 text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <option value="ALL">Semua Tgl</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block"></div>

        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Menyinkronkan rekam medis...</div>
          ) : filteredRecords.length === 0 ? (
             <div className="p-16 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="text-slate-300" size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Tidak ada rekam medis ditemukan</h3>
                <p className="text-slate-500">Coba sesuaikan filter pencarian Anda.</p>
             </div>
          ) : (
            filteredRecords.map((record) => (
              <div key={record.id} className="relative pl-0 md:pl-24 group animate-slide-up">
                
                <div className={`absolute left-6 top-8 w-6 h-6 rounded-full border-4 border-white shadow-md hidden md:block z-10 ${getTypeColor(record.type).split(' ')[0].replace('bg-', 'bg-').replace('-50', '-500')}`}></div>

                <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col gap-5 cursor-pointer" onClick={() => setSelectedRecord(record)}>
                   
                   <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-5">
                          <div className={`p-4 rounded-2xl border ${getTypeColor(record.type)}`}>
                             {getIcon(record.type)}
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{record.title}</h3>
                             <div className="flex items-center gap-3 text-sm text-slate-500 mt-1.5 font-medium">
                                <span className="text-slate-700">{record.provider}</span>
                                <span className="text-slate-300">•</span>
                                <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg">
                                   <Calendar size={14} /> 
                                   {formatDate(record.date)}
                                </span>
                             </div>
                          </div>
                      </div>
                      
                      {getStatusBadge(record.status)}
                   </div>

                   <div className="md:pl-[84px]">
                      <p className="text-slate-600 font-medium leading-relaxed line-clamp-2">{record.summary}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-5">
                        {record.tags && record.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] uppercase font-extrabold tracking-wide rounded-xl border border-slate-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                   </div>

                   <div className="md:pl-[84px] pt-4 mt-2 border-t border-slate-50 flex justify-end">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl transition-all"
                      >
                         Lihat Detail Lengkap <ChevronRight size={16} />
                      </button>
                   </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden flex flex-col max-h-[85vh] border border-white/20">
                  <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                      <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl border ${getTypeColor(selectedRecord.type)}`}>
                             {getIcon(selectedRecord.type)}
                          </div>
                          <div>
                             <h3 className="font-bold text-xl text-slate-900">{selectedRecord.title}</h3>
                             <p className="text-xs font-bold text-slate-400 uppercase mt-1">{selectedRecord.id} • {formatDate(selectedRecord.date)}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedRecord(null)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                          <X size={24} />
                      </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto custom-scrollbar">
                      {renderRecordDetails(selectedRecord)}
                  </div>

                  <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                      <button onClick={() => setSelectedRecord(null)} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-sm">
                          Tutup
                      </button>
                  </div>
              </div>
          </div>
      )}
      </div>
    </div>
  );
};
