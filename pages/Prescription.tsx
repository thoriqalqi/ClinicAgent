import React, { useState, useEffect } from 'react';
import { generatePrescriptionSuggestion } from '../services/geminiService';
import { medicalRecordService } from '../services/medicalRecordService';
import { PrescriptionItem, User, UserRole, MedicalTimelineItem } from '../types';
import { Pill, Sparkles, Printer, Save, Calendar, User as UserIcon, Download, CheckCircle2, AlertCircle, Eye, X, FileText, Stethoscope, ChevronRight, Loader2, Activity } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PrescriptionProps {
  currentUser: User;
  preFilledData?: {
      patientId: string;
      patientName: string;
      diagnosis?: string;
  } | null;
  onClearPreFilledData?: () => void;
}

export const Prescription: React.FC<PrescriptionProps> = ({ currentUser, preFilledData, onClearPreFilledData }) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [patientInfo, setPatientInfo] = useState('');
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 

  const [history, setHistory] = useState<MedicalTimelineItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<MedicalTimelineItem | null>(null);

  const isDoctor = currentUser.role === UserRole.DOCTOR;

  useEffect(() => {
      if (isDoctor && preFilledData) {
          setPatientInfo(`${preFilledData.patientName} (ID: ${preFilledData.patientId})`);
          if (preFilledData.diagnosis) {
              setDiagnosis(preFilledData.diagnosis);
          }
      } else if (isDoctor && !preFilledData) {
          setPatientInfo('Laki-laki Dewasa, 75kg, Tidak ada alergi'); 
          setDiagnosis('');
      }
  }, [isDoctor, preFilledData]);

  useEffect(() => {
    if (!isDoctor) {
      const loadData = async () => {
        setLoadingHistory(true);
        try {
          const timeline = await medicalRecordService.getPatientTimeline(currentUser.id);
          const prescriptions = timeline.filter(item => item.type === 'PRESCRIPTION');
          setHistory(prescriptions);
        } catch (err) {
          console.error("Failed to load prescription history", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      loadData();
    }
  }, [currentUser.id, isDoctor]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setItems([]); 
    setAdvice('');
    const result = await generatePrescriptionSuggestion(diagnosis, patientInfo);
    setItems(result.items);
    setAdvice(result.advice);
    setIsLoading(false);
  };

  const handleSaveToRecord = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    
    const summary = items.map(i => `${i.medicine} ${i.dosage}`).join(', ');
    const details = JSON.stringify({ items, advice, diagnosis });
    const targetPatientId = preFilledData?.patientId || 'P001';

    await medicalRecordService.createPrescription(
        targetPatientId,
        currentUser.name,
        summary,
        details
    );
    
    setIsSaving(false);
    alert(`✅ Resep berhasil dikirim ke pasien (ID: ${targetPatientId}) dan disimpan ke rekam medis.`);
    
    setItems([]);
    setDiagnosis('');
    setAdvice('');
    if (onClearPreFilledData) onClearPreFilledData();
  };

  const handleDownload = (record: MedicalTimelineItem) => {
      try {
        const doc = new jsPDF();
        const details = record.details ? JSON.parse(record.details) : {};

        // --- Header ---
        doc.setFillColor(124, 58, 237); // Primary Purple
        doc.rect(0, 0, 210, 20, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("HealthTown Clinic", 15, 13);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Jl. Kesehatan No. 123, Jakarta Selatan | (021) 555-0199", 150, 13, { align: 'right' });

        // --- Prescription Title ---
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text("RESEP DIGITAL", 105, 40, { align: 'center' });

        // --- Info Section ---
        doc.setDrawColor(226, 232, 240); // Slate 200
        doc.line(15, 50, 195, 50);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Nomor Referensi:", 15, 60);
        doc.setFont("helvetica", "normal");
        doc.text(record.id, 60, 60);

        doc.setFont("helvetica", "bold");
        doc.text("Tanggal:", 15, 66);
        doc.setFont("helvetica", "normal");
        doc.text(new Date(record.date).toLocaleDateString('id-ID'), 60, 66);

        doc.setFont("helvetica", "bold");
        doc.text("Dokter Pemeriksa:", 15, 72);
        doc.setFont("helvetica", "normal");
        doc.text(record.provider, 60, 72);
        
        if (details.diagnosis) {
            doc.setFont("helvetica", "bold");
            doc.text("Diagnosis:", 120, 60);
            doc.setFont("helvetica", "normal");
            // Split text if too long
            const diagnosisLines = doc.splitTextToSize(details.diagnosis, 75);
            doc.text(diagnosisLines, 120, 66);
        }

        // --- Medicine Table Header ---
        let yPos = 90;
        doc.setFillColor(241, 245, 249); // Slate 100
        doc.rect(15, yPos - 5, 180, 10, 'F');
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("NAMA OBAT", 20, yPos + 1);
        doc.text("DOSIS", 90, yPos + 1);
        doc.text("FREKUENSI", 130, yPos + 1);
        doc.text("DURASI", 170, yPos + 1);

        yPos += 10;

        // --- Medicine Items ---
        if (details.items && Array.isArray(details.items)) {
            details.items.forEach((item: any, index: number) => {
                doc.setFont("helvetica", "bold");
                doc.text(item.medicine, 20, yPos);
                
                doc.setFont("helvetica", "normal");
                if (item.notes) {
                    doc.setFontSize(8);
                    doc.setTextColor(100, 116, 139); // Slate 500
                    doc.text(item.notes, 20, yPos + 4);
                    doc.setTextColor(30, 41, 59); // Reset
                    doc.setFontSize(9);
                }

                doc.text(item.dosage, 90, yPos);
                doc.text(item.frequency, 130, yPos);
                doc.text(item.duration, 170, yPos);
                
                doc.setDrawColor(241, 245, 249);
                doc.line(15, yPos + 6, 195, yPos + 6);
                
                yPos += 14;
            });
        }

        // --- Advice Section ---
        if (details.advice) {
            yPos += 10;
            doc.setFillColor(255, 251, 235); // Amber 50
            doc.setDrawColor(254, 243, 199); // Amber 100
            doc.roundedRect(15, yPos, 180, 25, 3, 3, 'FD');
            
            doc.setFont("helvetica", "bold");
            doc.setTextColor(180, 83, 9); // Amber 700
            doc.text("Saran & Catatan Dokter:", 20, yPos + 8);
            
            doc.setFont("helvetica", "normal");
            doc.setTextColor(30, 41, 59);
            const adviceLines = doc.splitTextToSize(details.advice, 170);
            doc.text(adviceLines, 20, yPos + 15);
            
            yPos += 35;
        } else {
            yPos += 20;
        }

        // --- Footer / Signature ---
        doc.setDrawColor(203, 213, 225);
        doc.line(130, yPos + 20, 190, yPos + 20);
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text("Tanda Tangan Dokter", 160, yPos + 25, { align: 'center' });
        doc.setFont("helvetica", "normal");
        doc.text("(Diverifikasi Secara Digital)", 160, yPos + 29, { align: 'center' });

        // Save
        doc.save(`Resep-${record.id}.pdf`);

      } catch (error) {
          console.error(error);
          alert("Gagal mengunduh PDF. Pastikan browser mendukung fitur ini.");
      }
  };

  const getPrescriptionDetails = (record: MedicalTimelineItem) => {
      try {
          return record.details ? JSON.parse(record.details) : null;
      } catch (e) {
          return null;
      }
  };

  if (!isDoctor) {
    return (
        <div className="animate-fade-in relative pt-6">
         <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-primary-100 text-primary-600 rounded-2xl">
                   <Pill size={32} />
               </div>
               <div>
                   <h1 className="text-3xl font-bold text-slate-900">Resep Saya</h1>
                   <p className="text-slate-500 font-medium">Obat aktif dan riwayat resep.</p>
               </div>
            </div>
            
            {loadingHistory ? (
                <div className="text-center p-12 text-slate-500 font-bold">Memuat resep...</div>
            ) : history.length === 0 ? (
                <div className="text-center p-16 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Pill size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Tidak Ada Resep Ditemukan</h3>
                    <p className="text-slate-500 mt-2">Riwayat resep obat Anda kosong.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {history.map((record) => (
                        <div key={record.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-lg relative overflow-hidden hover:shadow-xl transition-all animate-slide-up group">
                             <div className="absolute top-0 left-0 w-2 h-full bg-primary-500"></div>
                             <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 pl-4">
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900">{record.title}</h3>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 mt-2 font-medium">
                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><UserIcon size={14}/> {record.provider}</span>
                                        <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-lg"><Calendar size={14}/> {new Date(record.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className={`px-4 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${
                                        record.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-primary-100 text-primary-700'
                                    }`}>
                                        {record.status === 'COMPLETED' ? <CheckCircle2 size={14} /> : <Activity size={14} />}
                                        {record.status || 'Aktif'}
                                    </span>
                                </div>
                             </div>
                             
                             <div className="space-y-6 pl-4">
                                <div className="flex items-start gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-200/60">
                                     <div className="mt-1 bg-white p-2 rounded-xl text-primary-600 shadow-sm">
                                        <Pill size={20} />
                                     </div>
                                     <div className="flex-1">
                                        <p className="text-base text-slate-700 font-medium leading-relaxed">{record.summary}</p>
                                        {record.tags && record.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {record.tags.map((tag, i) => (
                                                    <span key={i} className="text-[10px] bg-white text-slate-500 px-3 py-1 rounded-lg border border-slate-200 uppercase font-bold shadow-sm">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                     </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button 
                                        onClick={() => setSelectedPrescription(record)}
                                        className="text-sm font-bold text-slate-700 flex items-center gap-2 bg-white hover:bg-slate-50 px-5 py-3 rounded-2xl transition-all border border-slate-200 shadow-sm"
                                    >
                                        <Eye size={16} /> Lihat Detail
                                    </button>
                                    <button 
                                        onClick={() => handleDownload(record)}
                                        className="text-sm font-bold text-white flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-5 py-3 rounded-2xl transition-all shadow-lg shadow-primary-600/20"
                                    >
                                        <Download size={16} /> Unduh PDF
                                    </button>
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedPrescription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden flex flex-col max-h-[85vh] border border-white/20">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary-100 text-primary-600 shadow-sm">
                                    <Pill size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl text-slate-900">Detail Resep</h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">{selectedPrescription.id} • {new Date(selectedPrescription.date).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedPrescription(null)} className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                            {(() => {
                                const details = getPrescriptionDetails(selectedPrescription);
                                if (!details) return <p className="text-slate-500 text-center">Tidak ada detail tambahan.</p>;
                                
                                return (
                                    <>
                                        {details.diagnosis && (
                                            <div className="p-6 bg-primary-50 rounded-[1.5rem] border border-primary-100">
                                                <h4 className="text-xs font-bold text-primary-700 uppercase mb-2">Diagnosis</h4>
                                                <p className="text-slate-900 font-bold text-xl">{details.diagnosis}</p>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                                <FileText size={20} className="text-primary-500" /> Daftar Obat
                                            </h4>
                                            <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-slate-50 border-b border-slate-200">
                                                        <tr>
                                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Obat</th>
                                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Dosis</th>
                                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Frekuensi</th>
                                                            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Durasi</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {details.items?.map((item: any, idx: number) => (
                                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                                <td className="p-4 font-bold text-slate-800">
                                                                    {item.medicine}
                                                                    {item.notes && <div className="text-xs text-slate-500 font-normal mt-1">{item.notes}</div>}
                                                                </td>
                                                                <td className="p-4 text-slate-600 font-medium">{item.dosage}</td>
                                                                <td className="p-4 text-slate-600">{item.frequency}</td>
                                                                <td className="p-4 text-slate-600">{item.duration}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {details.advice && (
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 mb-3">Saran Dokter</h4>
                                                <p className="text-sm text-slate-700 bg-amber-50 p-6 rounded-[1.5rem] border border-amber-100 leading-relaxed font-medium">
                                                    {details.advice}
                                                </p>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button onClick={() => setSelectedPrescription(null)} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-sm">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
         </div>
        </div>
    )
  }

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
      <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/3 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             <div className="p-2.5 bg-primary-100 text-primary-600 rounded-2xl"><Sparkles size={24}/></div>
             AI Prescription
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">Buat draft resep berdasarkan diagnosis.</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl space-y-6">
          {preFilledData && (
             <div className="bg-primary-50 p-5 rounded-2xl border border-primary-100 text-sm text-primary-700 flex items-start gap-3">
                 <CheckCircle2 size={20} className="shrink-0 mt-0.5" /> 
                 <div>
                    <span className="font-bold block mb-1">Pasien Terpilih</span>
                    Resep untuk {preFilledData.patientName}
                 </div>
             </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Detail Pasien</label>
            <input
              value={patientInfo}
              onChange={e => setPatientInfo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none text-slate-900 transition-all"
              placeholder="Nama, Umur, Berat..."
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Diagnosis / Kondisi</label>
            <textarea
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              placeholder="Cth: Sinusitis Bakteri Akut, Demam..."
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-primary-400 focus:border-primary-400 focus:outline-none resize-none text-slate-900 transition-all"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading || !diagnosis}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold shadow-xl shadow-primary-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none transform active:scale-[0.98]"
          >
            {isLoading ? <Sparkles className="animate-spin" /> : <Sparkles size={20} />}
            Buat Draft Resep
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl relative flex flex-col overflow-hidden min-h-[600px]">
        <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-primary-500 via-purple-500 to-indigo-600"></div>
        
        <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-8 mt-2">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary-50 rounded-2xl text-primary-600 flex items-center justify-center shadow-sm">
                   <Pill size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-bold text-slate-800">Draft Resep</h3>
                    <p className="text-xs text-slate-400 font-mono mt-1 font-bold">REF: {Date.now().toString().slice(-8)}</p>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all" title="Print">
                    <Printer size={20} />
                </button>
                <button 
                    onClick={handleSaveToRecord}
                    disabled={isSaving || items.length === 0}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:shadow-none" 
                    title="Save to Record"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {isSaving ? 'Mengirim...' : 'Tanda Tangan & Kirim'}
                </button>
            </div>
            </div>

            {items.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="border border-slate-200 rounded-2xl overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Obat</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Dosis</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Frekuensi</th>
                            <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map((item, idx) => (
                            <tr key={idx} className="group hover:bg-primary-50/30 transition-colors">
                                <td className="py-4 px-6">
                                    <div className="font-bold text-slate-800 text-sm">{item.medicine}</div>
                                    {item.notes && <div className="text-xs text-slate-500 mt-1 italic">{item.notes}</div>}
                                </td>
                                <td className="py-4 px-6 text-sm text-slate-600 font-medium">{item.dosage}</td>
                                <td className="py-4 px-6 text-sm text-slate-600">{item.frequency}</td>
                                <td className="py-4 px-6 text-sm text-slate-600">{item.duration}</td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {advice && (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-700 uppercase mb-2 flex items-center gap-2">
                         <Stethoscope size={16}/> Saran Dokter
                    </h4>
                    <p className="text-sm text-amber-900 leading-relaxed font-medium">{advice}</p>
                </div>
                )}
            </div>
            ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 mx-4 mb-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Pill size={36} className="text-slate-300" />
                </div>
                <p className="font-bold text-lg text-slate-500">Area resep kosong.</p>
                <p className="text-sm opacity-70 mt-1">Masukkan diagnosis dan klik 'Buat Draft Resep'.</p>
                
                {advice && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-3 max-w-md shadow-sm">
                        <AlertCircle size={20} className="shrink-0" />
                        <span className="font-medium">{advice}</span>
                    </div>
                )}
            </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-end px-2">
                <div>
                    <div className="h-12 w-40 border-b-2 border-slate-300 mb-2"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tanda Tangan Dokter</p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Diverifikasi Sistem</p>
                    <p className="text-base font-bold text-slate-800">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">Lisensi: {currentUser.strNumber || 'PENDING'}</p>
                </div>
            </div>
        </div>
      </div>
      </div>
    </div>
    </div>
  );
};