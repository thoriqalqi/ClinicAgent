
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { userService } from '../services/userService';
import { ShieldCheck, Stethoscope, User as UserIcon, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'DOCTOR'>('PATIENT');
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [name, setName] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'PATIENT' && isRegistering) {
        const newUser = await userService.registerPatient(name, email, password);
        onLogin(newUser);
      } else {
        const role = activeTab === 'PATIENT' ? UserRole.PATIENT : UserRole.DOCTOR;
        const user = await userService.login(email, password, role);
        
        if (user) {
          onLogin(user);
        } else {
          setError('Email atau kata sandi salah.');
        }
      }
    } catch (err) {
      setError('Autentikasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminDemo = async () => {
    const admin = await userService.login('admin@healthtown.com', 'admin', UserRole.ADMIN);
    if (admin) onLogin(admin);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F4F7] p-4 relative overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-5 bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden min-h-[700px]">
        
        <div className="md:col-span-2 p-12 flex flex-col justify-between bg-gradient-to-br from-primary-700 to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path d="M0 0 L100 100 L0 100 Z" fill="white" />
              </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg">
                    <ShieldCheck size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Clinic Agent</h1>
            </div>
            <h2 className="text-4xl font-black mb-6 leading-tight">
              {activeTab === 'DOCTOR' ? 'Portal Medis Profesional' : 'Layanan Kesehatan Modern, Mudah.'}
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed font-medium opacity-90">
              {activeTab === 'DOCTOR' 
                ? 'Akses rekam medis pasien, kelola resep, dan tanggapi peringatan darurat melalui dasbor klinis terintegrasi AI.'
                : 'Konsultasi dengan AI, kelola resep obat, dan terhubung dengan dokter secara instan melalui sistem terintegrasi.'
              }
            </p>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-3 text-sm font-bold bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10 shadow-lg">
               <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                   <Sparkles size={18} />
               </div>
               <span>Didukung oleh Gemini 2.5 AI</span>
            </div>
            <p className="text-xs text-primary-200/60 text-center font-medium tracking-wider uppercase">© 2024 Sistem Klinik HealthTown</p>
          </div>
        </div>

        <div className="md:col-span-3 p-12 bg-white flex flex-col relative">
            
            <div className="flex bg-slate-100 p-2 rounded-[1.5rem] mb-10 w-fit mx-auto md:mx-0">
                <button 
                    onClick={() => { setActiveTab('PATIENT'); setIsRegistering(false); setError(''); setEmail(''); setPassword(''); }}
                    className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'PATIENT' ? 'bg-white text-primary-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Portal Pasien
                </button>
                <button 
                    onClick={() => { setActiveTab('DOCTOR'); setIsRegistering(false); setError(''); setEmail(''); setPassword(''); }}
                    className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'DOCTOR' ? 'bg-white text-primary-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Portal Dokter
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                <div className="mb-8">
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">
                        {activeTab === 'PATIENT' 
                           ? (isRegistering ? 'Buat Akun Baru' : 'Selamat Datang') 
                           : 'Login Dokter'
                        }
                    </h3>
                    <p className="text-slate-500 font-medium">
                        {activeTab === 'PATIENT' 
                            ? (isRegistering ? 'Masukkan data diri Anda untuk mendaftar.' : 'Masukkan email untuk mengakses data kesehatan Anda.')
                            : 'Silakan masuk dengan kredensial yang terverifikasi.'
                        }
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-3 animate-fade-in">
                        <AlertCircle size={20} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {isRegistering && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Nama Lengkap</label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input 
                                    type="text" 
                                    required 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all text-slate-900 font-bold"
                                    placeholder="cth. Budi Santoso"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">
                            {activeTab === 'DOCTOR' ? 'Email Medis / ID' : 'Alamat Email'}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="email" 
                                required 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all text-slate-900 font-bold"
                                placeholder={activeTab === 'DOCTOR' ? 'dr.nama@rumahsakit.com' : 'anda@email.com'}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Kata Sandi</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-400 focus:outline-none transition-all text-slate-900 font-bold"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                            Akun Demo
                        </p>
                        <p className="text-xs text-slate-600 font-mono mt-1">
                            {activeTab === 'DOCTOR' ? 'sarah@healthtown.com / password123' : 'budi@email.com / password'}
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary-600/30 transition-all flex items-center justify-center gap-3 hover:-translate-y-1 active:translate-y-0"
                    >
                        {loading ? 'Memproses...' : (
                            <>
                                {isRegistering ? 'Daftar' : 'Masuk'} <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    {activeTab === 'PATIENT' ? (
                        <p className="text-sm text-slate-500 font-medium">
                            {isRegistering ? 'Sudah punya akun?' : "Belum punya akun?"}{' '}
                            <button 
                                onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
                                className="font-bold text-primary-600 hover:text-primary-700 hover:underline"
                            >
                                {isRegistering ? 'Masuk' : 'Daftar Sekarang'}
                            </button>
                        </p>
                    ) : (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-xs text-amber-800 text-left flex items-start gap-3">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span className="font-medium">Akun dokter disediakan oleh Administrator Rumah Sakit. Hubungi Dukungan IT untuk akses.</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-6 flex justify-center">
                <button 
                    onClick={handleAdminDemo}
                    className="text-xs text-slate-300 font-bold hover:text-primary-600 transition-colors uppercase tracking-widest"
                >
                    Akses Admin
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
