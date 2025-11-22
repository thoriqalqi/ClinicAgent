
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';
import { User as UserIcon, Mail, Phone, Calendar, Lock, Camera, Save, Loader2, CheckCircle2, Upload, ShieldCheck } from 'lucide-react';

interface ProfileProps {
  currentUser: User;
  onProfileUpdate: (user: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onProfileUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone || '',
    age: currentUser.age || '',
    gender: currentUser.gender || 'Male',
    avatar: currentUser.avatar || '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert("Ukuran gambar terlalu besar. Harap pilih gambar di bawah 2MB.");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            handleChange('avatar', base64String);
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg('');

    try {
      const updates: Partial<User> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        age: Number(formData.age),
        gender: formData.gender as 'Male' | 'Female',
        avatar: formData.avatar
      };

      if (passwords.new) {
          if (passwords.new !== passwords.confirm) {
              alert("Kata sandi baru tidak cocok!");
              setIsLoading(false);
              return;
          }
          if (currentUser.password && passwords.current !== currentUser.password) {
              alert("Kata sandi saat ini salah!");
              setIsLoading(false);
              return;
          }
          updates.password = passwords.new;
      }

      const updatedUser = await userService.updateUser(currentUser.id, updates);
      onProfileUpdate(updatedUser);
      setSuccessMsg('Profil berhasil diperbarui!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      alert("Gagal memperbarui profil.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
      <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Pengaturan Akun</h1>
            <p className="text-slate-500 font-medium mt-1">Kelola informasi pribadi dan keamanan Anda.</p>
          </div>
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-3 rounded-xl flex items-center gap-2 animate-fade-in shadow-sm font-bold">
                <CheckCircle2 size={20} /> {successMsg}
            </div>
          )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
                <div className="relative inline-block group">
                    <div className="w-40 h-40 rounded-[2rem] bg-slate-50 border-4 border-white shadow-lg overflow-hidden mx-auto mb-6 flex items-center justify-center">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={64} className="text-slate-300" />
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 p-3 bg-slate-900 text-white rounded-2xl shadow-xl hover:bg-primary-600 transition-all cursor-pointer hover:scale-110"
                        title="Unggah Foto"
                    >
                        <Camera size={20} />
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        accept="image/*"
                        className="hidden" 
                    />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{currentUser.name}</h2>
                <p className="text-sm font-bold text-primary-600 uppercase tracking-wide mb-4">{currentUser.role}</p>
                
                <div className="inline-flex px-4 py-2 bg-slate-50 rounded-xl text-xs font-mono font-bold text-slate-500 border border-slate-200">
                    ID: {currentUser.id}
                </div>
                
                <div className="mt-8 pt-6 border-t border-slate-50">
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <Upload size={16} /> Pilih dari Galeri
                    </button>
                    <p className="text-[10px] text-slate-400 mt-3 font-medium">Mendukung JPG, PNG (Maks 2MB)</p>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-xl"><UserIcon size={20} /></div> Detail Pribadi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Nama Lengkap</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                required
                                type="text" 
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm font-bold text-slate-900"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Alamat Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                required
                                type="email" 
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Nomor Telepon</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                placeholder="+62..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm font-bold text-slate-900"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Umur</label>
                            <input 
                                type="number" 
                                value={formData.age}
                                onChange={(e) => handleChange('age', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm font-bold text-slate-900"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Jenis Kelamin</label>
                            <select 
                                value={formData.gender}
                                onChange={(e) => handleChange('gender', e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-400 outline-none transition-all text-sm font-bold text-slate-900 cursor-pointer"
                            >
                                <option value="Male">Laki-laki</option>
                                <option value="Female">Perempuan</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><ShieldCheck size={20} /></div> Keamanan & Kata Sandi
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Kata Sandi Saat Ini</label>
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={passwords.current}
                                onChange={(e) => handlePasswordChange('current', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm font-bold text-slate-900 placeholder:font-normal"
                                placeholder="Masukkan kata sandi saat ini"
                            />
                         </div>
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Kata Sandi Baru</label>
                         <input 
                             type="password" 
                             value={passwords.new}
                             onChange={(e) => handlePasswordChange('new', e.target.value)}
                             className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm font-bold text-slate-900"
                             placeholder="••••••••"
                         />
                    </div>
                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Konfirmasi Kata Sandi Baru</label>
                         <input 
                             type="password" 
                             value={passwords.confirm}
                             onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                             className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm font-bold text-slate-900"
                             placeholder="••••••••"
                         />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-slate-900 hover:bg-primary-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 flex items-center gap-3 transition-all disabled:opacity-70 hover:-translate-y-1"
                >
                    {isLoading ? 'Menyimpan...' : <><Save size={20} /> Simpan Perubahan</>}
                </button>
            </div>
        </div>
      </form>
      </div>
    </div>
  );
};
