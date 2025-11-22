
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, UserRole, UserStatus } from '../types';
import { Search, Plus, Edit, Trash2, X, CheckCircle, Clock, Ban, Stethoscope, Building2, Filter, Lock } from 'lucide-react';

export const AdminDoctors: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.DOCTOR,
    status: 'ACTIVE' as UserStatus,
    clinic: '',
    strNumber: '',
    specialization: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getUsers();
      setUsers(allUsers.filter(u => u.role === UserRole.DOCTOR));
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Logic untuk password: Jika edit dan kosong, hapus dari payload agar tidak tertimpa string kosong
      const payload: any = { ...formData };
      if (editingUser && !payload.password) {
          delete payload.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
      } else {
        // Jika create baru tapi password kosong, set default
        if (!payload.password) payload.password = 'doctor123';
        await userService.createUser(payload);
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      alert("Operasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus dokter ini?')) {
      setLoading(true);
      await userService.deleteUser(id);
      await fetchUsers();
      setLoading(false);
    }
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Kosongkan saat edit agar aman
        role: UserRole.DOCTOR,
        status: user.status,
        clinic: user.clinic || '',
        strNumber: user.strNumber || '',
        specialization: user.specialization || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: UserRole.DOCTOR,
        status: 'ACTIVE',
        clinic: '',
        strNumber: '',
        specialization: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpec = specFilter ? user.specialization?.toLowerCase().includes(specFilter.toLowerCase()) : true;
    return matchesSearch && matchesSpec;
  });

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Stethoscope size={24} /></div>
            Registri Dokter
          </h1>
          <p className="text-slate-500 font-medium mt-2 ml-1">Kelola verifikasi profesional dan penugasan klinik.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-primary-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Tambah Dokter Baru
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama, nomor STR atau email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-900 font-bold transition-all"
          />
        </div>
        <div className="flex-1 relative min-w-[200px]">
           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input 
              type="text" 
              placeholder="Filter Spesialisasi..." 
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-400 text-slate-900 font-bold transition-all"
           />
        </div>
        <div className="w-full md:w-auto">
            <button className="w-full md:w-auto h-full px-5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
                <Filter size={18} /> Lainnya
            </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Profil Dokter</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider">Spesialisasi</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider">Verifikasi STR</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider">Klinik</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Akun</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-blue-100 text-primary-700 flex items-center justify-center font-bold text-lg border border-white shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{user.name}</div>
                        <div className="text-xs text-slate-400 font-medium mt-0.5">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 w-fit px-3 py-1.5 rounded-lg border border-slate-100">
                        <Stethoscope size={16} className="text-primary-500" />
                        {user.specialization || 'Dokter Umum'}
                    </div>
                  </td>
                  <td className="py-5 px-8">
                      {user.strNumber ? (
                          <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                              {user.strNumber}
                          </span>
                      ) : (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 flex items-center gap-1 w-fit">
                              <Clock size={12} /> STR Hilang
                          </span>
                      )}
                  </td>
                  <td className="py-5 px-8 text-sm font-medium text-slate-600">
                     {user.clinic || <span className="text-slate-300 italic">Belum Ditugaskan</span>}
                  </td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border
                        ${user.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                          user.status === 'PENDING' ? 'text-amber-600 bg-amber-50 border-amber-100' : 
                          'text-slate-500 bg-slate-100 border-slate-200'}`}>
                       {user.status === 'ACTIVE' && <CheckCircle size={12} />}
                       {user.status === 'PENDING' && <Clock size={12} />}
                       {user.status === 'INACTIVE' && <Ban size={12} />}
                       {user.status}
                    </span>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors" 
                        title="Edit Dokter"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors" 
                        title="Hapus Dokter"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400 italic">Tidak ada dokter ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col border border-white/20">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <div className="p-1.5 bg-primary-100 text-primary-600 rounded-lg"><Plus size={18} /></div>
                {editingUser ? 'Edit Profil Dokter' : 'Registrasi Dokter Baru'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-5 overflow-y-auto custom-scrollbar">
              
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <h4 className="text-sm font-bold text-blue-800 mb-4 flex items-center gap-2">
                    <Stethoscope size={18} /> Informasi Profesional
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Spesialisasi</label>
                        <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                            placeholder="cth. Kardiolog"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor STR</label>
                        <input
                            type="text"
                            value={formData.strNumber}
                            onChange={(e) => setFormData({...formData, strNumber: e.target.value})}
                            className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                            placeholder="STR-xxxxxxxx"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Klinik / Rumah Sakit</label>
                    <input
                        type="text"
                        value={formData.clinic}
                        onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                        placeholder="cth. Klinik Utama HealthTown"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap & Gelar</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                    placeholder="cth. Dr. Budi Santoso, Sp.JP"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Medis</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                    placeholder="dokter@healthtown.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Akun</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as UserStatus})}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 cursor-pointer"
                    >
                        <option value="ACTIVE">Aktif</option>
                        <option value="PENDING">Pending Verifikasi</option>
                        <option value="INACTIVE">Non-Aktif</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        {editingUser ? 'Reset Password (Opsional)' : 'Password Awal'}
                    </label>
                    <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900"
                            placeholder={editingUser ? "Isi untuk ganti..." : "min. 6 karakter"}
                        />
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex gap-3 border-t border-slate-50 mt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-all disabled:opacity-70"
                >
                  {loading ? 'Menyimpan...' : (editingUser ? 'Simpan Perubahan' : 'Daftarkan Dokter')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
