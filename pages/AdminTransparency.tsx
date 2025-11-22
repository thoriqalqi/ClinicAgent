
import React, { useState, useEffect } from 'react';
import { ShieldAlert, Pill, Stethoscope, Activity, Eye, AlertTriangle, CheckCircle2, FileText, BarChart3 } from 'lucide-react';
import { userService } from '../services/userService';
import { medicalRecordService } from '../services/medicalRecordService';
import { consultationService } from '../services/consultationService';
import { User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DoctorActivity {
  doctorId: string;
  name: string;
  patientCount: number;
  prescriptionCount: number;
  referralCount: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const AdminTransparency: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [doctorStats, setDoctorStats] = useState<DoctorActivity[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'PROVIDERS' | 'MEDICINES' | 'REFERRALS'>('PROVIDERS');

  useEffect(() => {
    loadAuditData();
  }, []);

  const loadAuditData = async () => {
    setLoading(true);
    try {
        // 1. Fetch Doctors
        const users = await userService.getUsers();
        const doctors = users.filter(u => u.role === UserRole.DOCTOR);

        // 2. Fetch Records (Simulated aggregation)
        const stats: DoctorActivity[] = [];
        
        for (const doc of doctors) {
            // Fetch appointments for each doctor to gauge activity
            const appts = await consultationService.getDoctorAppointments(doc.id);
            const patients = new Set(appts.map(a => a.patient.id)).size;
            
            // Fetch prescriptions (Simulated filter from global runtime)
            const globalRecords = await medicalRecordService.getGlobalStats();
            const docPrescriptions = globalRecords.prescriptions.filter(p => p.provider === doc.name);
            
            // Calculate Mock Risk Score based on volume
            const volume = appts.length + docPrescriptions.length;
            let risk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
            if (volume > 50) risk = 'MEDIUM';
            if (volume > 100) risk = 'HIGH';

            stats.push({
                doctorId: doc.id,
                name: doc.name,
                patientCount: patients,
                prescriptionCount: docPrescriptions.length,
                referralCount: Math.floor(Math.random() * 5), // Mock referral count
                riskScore: risk
            });
        }
        setDoctorStats(stats);
        
        const globalStats = await medicalRecordService.getGlobalStats();
        setPrescriptions(globalStats.prescriptions);

    } catch (e) {
        console.error("Audit load failed", e);
    } finally {
        setLoading(false);
    }
  };

  // Chart Data Preparation
  const chartData = doctorStats.map(doc => ({
      name: doc.name.split(' ').pop(), // Last name only
      Consultations: doc.patientCount * 2, // Mock multiplier
      Prescriptions: doc.prescriptionCount
  }));

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
        
        <div className="flex items-end justify-between mb-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><ShieldAlert size={24} /></div>
                    Transparency & Audit
                </h1>
                <p className="text-slate-500 font-medium mt-1 ml-1">Monitor clinical activity, fraud detection, and medicine usage.</p>
            </div>
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 text-xs font-bold text-slate-500">
                <Activity size={16} className="text-emerald-500" />
                System Audit Log: Active
             </div>
        </div>

        {/* Risk Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fraud Risk Alerts</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">0</h3>
                    <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1"><CheckCircle2 size={12}/> System Healthy</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <ShieldAlert size={32} />
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Prescriptions</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{prescriptions.length}</h3>
                    <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1"><Activity size={12}/> +12% this week</p>
                </div>
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Pill size={32} />
                </div>
            </div>

             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex items-center justify-between">
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Consult Time</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">12m</h3>
                    <p className="text-xs text-slate-400 font-bold mt-2">Target: 15m</p>
                </div>
                <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                    <Stethoscope size={32} />
                </div>
            </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Data Tables */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Navigation Tabs */}
                <div className="bg-slate-100 p-1.5 rounded-2xl flex w-fit">
                    <button 
                        onClick={() => setViewMode('PROVIDERS')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'PROVIDERS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Provider Activity
                    </button>
                    <button 
                        onClick={() => setViewMode('MEDICINES')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'MEDICINES' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Medicine Usage
                    </button>
                     <button 
                        onClick={() => setViewMode('REFERRALS')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'REFERRALS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Referral Patterns
                    </button>
                </div>

                {viewMode === 'PROVIDERS' && (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="font-bold text-xl text-slate-800">Doctor Performance & Risk</h3>
                            <p className="text-slate-500 text-sm mt-1">Monitoring consultation volume vs prescription rate.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase">Doctor Name</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase">Unique Patients</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase">Rx Issued</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase">Risk Score</th>
                                        <th className="p-6 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {doctorStats.map(doc => (
                                        <tr key={doc.doctorId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="p-6 font-bold text-slate-800">{doc.name}</td>
                                            <td className="p-6 text-slate-600 font-medium">{doc.patientCount}</td>
                                            <td className="p-6 text-slate-600 font-medium">{doc.prescriptionCount}</td>
                                            <td className="p-6">
                                                <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border ${
                                                    doc.riskScore === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    doc.riskScore === 'MEDIUM' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                }`}>
                                                    {doc.riskScore}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {doctorStats.length === 0 && (
                                        <tr><td colSpan={5} className="p-8 text-center text-slate-400">No activity data recorded yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {viewMode === 'MEDICINES' && (
                     <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="font-bold text-xl text-slate-800">Prescription Audit</h3>
                            <p className="text-slate-500 text-sm mt-1">Track medicine distribution to prevent over-prescribing.</p>
                        </div>
                        <div className="p-8">
                            {prescriptions.length === 0 ? (
                                <div className="text-center text-slate-400 py-8">No prescriptions recorded in current session.</div>
                            ) : (
                                <div className="space-y-4">
                                    {prescriptions.map(rx => (
                                        <div key={rx.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Pill size={20}/></div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{rx.summary}</p>
                                                    <p className="text-xs text-slate-500">Prescribed by {rx.provider} on {new Date(rx.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">{rx.id}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                     </div>
                )}
                
                {viewMode === 'REFERRALS' && (
                     <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden animate-fade-in">
                        <div className="p-8 border-b border-slate-50">
                            <h3 className="font-bold text-xl text-slate-800">Referral Patterns</h3>
                            <p className="text-slate-500 text-sm mt-1">Analysis of outbound referrals.</p>
                        </div>
                        <div className="p-12 text-center">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border:'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                        <Legend />
                                        <Bar dataKey="Consultations" fill="#8b5cf6" radius={[4,4,4,4]} barSize={20} />
                                        <Bar dataKey="Prescriptions" fill="#0ea5e9" radius={[4,4,4,4]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                     </div>
                )}

            </div>

            {/* Right Column: Alerts */}
            <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
                    <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500"/> Recent Alerts
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <p className="text-sm font-bold text-amber-800 mb-1">Duplicate Claim Potential</p>
                            <p className="text-xs text-amber-700 leading-relaxed">Patient P001 has 2 consultations booked within 24 hours.</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-sm font-bold text-blue-800 mb-1">High Rx Volume</p>
                            <p className="text-xs text-blue-700 leading-relaxed">Dr. Sarah issued 15% more prescriptions than average this week.</p>
                        </div>
                    </div>
                </div>

                 <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-emerald-400"/> Compliance Report
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        System audit logs are automatically generated and stored for 7 years in compliance with medical data regulations.
                    </p>
                    <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
                        Download Full Report
                    </button>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};
