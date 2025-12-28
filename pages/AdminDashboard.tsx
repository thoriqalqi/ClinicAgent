import React, { useEffect, useState } from 'react';
import { Users, Stethoscope, Clock, Activity, ArrowUp, ArrowDown, MoreHorizontal, Search, Building2, Mail, BarChart3 } from 'lucide-react';
import { userService } from '../services/userService';
import { User, UserRole } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const chartData = [
  { name: 'Sen', visits: 40, emergency: 2 },
  { name: 'Sel', visits: 30, emergency: 5 },
  { name: 'Rab', visits: 55, emergency: 3 },
  { name: 'Kam', visits: 45, emergency: 8 },
  { name: 'Jum', visits: 60, emergency: 4 },
  { name: 'Sab', visits: 25, emergency: 1 },
  { name: 'Min', visits: 10, emergency: 0 },
];

const StatWidget = ({ title, value, trend, trendUp, icon: Icon, colorClass }: any) => (
  <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl hover:-translate-y-1 transition-transform duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg border ${trendUp ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
        {trendUp ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {trend}
      </div>
    </div>
    <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{title}</p>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalUsers: 0, activeDoctors: 0, pendingDocs: 0, todayTraffic: 142 });
  const [users, setUsers] = useState<User[]>([]);
  const [regTab, setRegTab] = useState<'PATIENTS' | 'DOCTORS'>('PATIENTS');

  useEffect(() => {
    const loadData = async () => {
      const allUsers = await userService.getUsers();
      setUsers(allUsers);
      setStats({
        totalUsers: allUsers.length,
        activeDoctors: allUsers.filter(u => u.role === UserRole.DOCTOR && u.status === 'ACTIVE').length,
        pendingDocs: allUsers.filter(u => u.role === UserRole.DOCTOR && u.status === 'PENDING').length,
        todayTraffic: 142
      });
    };
    loadData();
  }, []);

  const recentRegistrations = users
    .filter(u => u.role === (regTab === 'PATIENTS' ? UserRole.PATIENT : UserRole.DOCTOR))
    .slice(-5).reverse();

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12 space-y-8">

        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Ringkasan Admin</h1>
            <p className="text-slate-500 font-medium mt-1">Kinerja sistem & manajemen pengguna.</p>
          </div>
          {/* Button removed as per request */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatWidget title="Total Pengguna" value={stats.totalUsers} trend="12%" trendUp={true} icon={Users} colorClass="bg-blue-50 text-blue-600" />
          <StatWidget title="Dokter Aktif" value={stats.activeDoctors} trend="5%" trendUp={true} icon={Stethoscope} colorClass="bg-purple-50 text-purple-600" />
          <StatWidget title="Menunggu Verifikasi" value={stats.pendingDocs} trend="2" trendUp={false} icon={Clock} colorClass="bg-amber-50 text-amber-600" />
          <StatWidget title="Trafik Harian" value={stats.todayTraffic} trend="8%" trendUp={true} icon={Activity} colorClass="bg-emerald-50 text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Activity size={20} /></div>
                Tren Penggunaan
              </h3>
              <select className="bg-slate-50 border-none text-slate-600 text-xs font-bold rounded-lg py-1 px-3 outline-none cursor-pointer">
                <option>7 Hari Terakhir</option>
                <option>30 Hari Terakhir</option>
              </select>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl">
            <h3 className="font-bold text-lg text-slate-800 mb-8 flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Clock size={20} /></div>
              Tipe Aktivitas
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} dy={10} />
                  <Bar dataKey="emergency" fill="#0ea5e9" radius={[6, 6, 6, 6]} barSize={8} />
                  <Bar dataKey="visits" fill="#ddd6fe" radius={[6, 6, 6, 6]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <div className="p-2 bg-slate-50 text-slate-600 rounded-xl"><Users size={20} /></div>
              Pendaftaran Terbaru
            </h3>
            <div className="bg-slate-100 p-1 rounded-xl flex">
              <button onClick={() => setRegTab('PATIENTS')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${regTab === 'PATIENTS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Pasien</button>
              <button onClick={() => setRegTab('DOCTORS')} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${regTab === 'DOCTORS' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Dokter</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Profil Pengguna</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Detail</th>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRegistrations.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-sm text-slate-400 font-medium italic">Tidak ada pendaftaran terbaru.</td></tr>
                ) : (
                  recentRegistrations.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-md ${regTab === 'DOCTORS' ? 'bg-blue-500' : 'bg-emerald-500'}`}>
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-xs text-slate-400 block font-mono mt-0.5">{user.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        {regTab === 'DOCTORS' ? (
                          <div className="text-xs text-slate-600">
                            <span className="block font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-lg w-fit mb-1">{user.specialization || 'Umum'}</span>
                            <span className="text-slate-400 font-medium">{user.clinic || 'Belum Ditugaskan'}</span>
                          </div>
                        ) : (
                          <div className="text-sm text-slate-600 font-medium flex items-center gap-2">
                            <Mail size={14} className="text-slate-300" />
                            {user.email}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-extrabold uppercase tracking-wide border ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => alert(`Aksi untuk pengguna: ${user.name}\n(Fitur Edit/Hapus akan segera hadir)`)}
                          className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-xl transition-all"
                          title="Kelola Pengguna"
                        >
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
