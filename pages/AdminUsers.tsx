
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, UserRole, UserStatus } from '../types';
import { Users, Search, Plus, Edit, Trash2, X, CheckCircle, Clock, Ban, Filter, Stethoscope, Building2, Lock } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [specFilter, setSpecFilter] = useState(''); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: UserRole.PATIENT,
    status: 'ACTIVE' as UserStatus,
    clinic: '',
    strNumber: '',
    specialization: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setSpecFilter('');
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
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
       const payload: any = { ...formData };
       // Don't send empty password on update
       if (editingUser && !payload.password) {
           delete payload.password;
       }
       // Default password on create if empty
       if (!editingUser && !payload.password) {
           payload.password = 'password123';
       }

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
      } else {
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
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.')) {
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
        password: '', // Empty for security/reset
        role: user.role,
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
        role: UserRole.PATIENT,
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

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'INACTIVE': return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-slate-600';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
    
    const matchesSpec = roleFilter === UserRole.DOCTOR && specFilter 
        ? user.specialization?.toLowerCase().includes(specFilter.toLowerCase())
        : true;

    return matchesSearch && matchesRole && matchesSpec;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-health-600" /> Manajemen Pengguna
          </h1>
          <p className="text-slate-500 text-sm">Kelola akses sistem, peran, dan verifikasi.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-health-600 hover:bg-health-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg shadow-health-600/20 flex items-center gap-2 transition-all"
        >
          <Plus size={18} /> Tambah Pengguna
        </button>
      </div>

      <div className="glass p-4 rounded-xl border border-white/60 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari nama atau email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-400 text-black"
          />
        </div>

        {roleFilter === UserRole.DOCTOR && (
          <div className="flex-1 relative min-w-[200px] animate-fade-in">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Filter Spesialisasi..." 
                value={specFilter}
                onChange={(e) => setSpecFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-blue-50/50 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-health-400 text-black"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-white/50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-400 min-w-[140px] text-black"
            >
                <option value="ALL">Semua Peran</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.DOCTOR}>Dokter</option>
                <option value={UserRole.PATIENT}>Pasien</option>
            </select>
        </div>
      </div>

      <div className="glass rounded-2xl border border-white/60 overflow-hidden">
        {loading && users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">Memuat pengguna...</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase w-1/4">Pengguna</th>
                
                {roleFilter === UserRole.DOCTOR ? (
                  <>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Spesialisasi</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Nomor STR</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Klinik</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Peran</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Detail</th>
                  </>
                )}

                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/60 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-health-100 to-blue-100 text-health-700 flex items-center justify-center font-bold border border-white shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  {roleFilter === UserRole.DOCTOR ? (
                      <>
                         <td className="py-4 px-6 text-sm text-slate-700">
                            <div className="flex items-center gap-2">
                                <Stethoscope size={14} className="text-health-500" />
                                {user.specialization || 'Umum'}
                            </div>
                         </td>
                         <td className="py-4 px-6 text-sm font-mono text-slate-600 bg-slate-50/50 rounded-lg">
                             {user.strNumber || <span className="text-amber-500 text-xs">STR Hilang</span>}
                         </td>
                         <td className="py-4 px-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Building2 size={14} className="text-slate-400" />
                                {user.clinic || '-'}
                            </div>
                         </td>
                      </>
                  ) : (
                      <>
                        <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                user.role === 'DOCTOR' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
                            {user.role}
                            </span>
                        </td>
                        <td className="py-4 px-6">
                            {user.role === 'DOCTOR' ? (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-slate-600 font-medium">{user.specialization || 'Umum'}</span>
                                    <span className="text-[10px] text-slate-400">{user.clinic}</span>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-300">-</span>
                            )}
                        </td>
                      </>
                  )}

                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                       {user.status === 'ACTIVE' && <CheckCircle size={10} />}
                       {user.status === 'PENDING' && <Clock size={10} />}
                       {user.status === 'INACTIVE' && <Ban size={10} />}
                       {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 text-slate-400 hover:text-health-600 hover:bg-health-50 rounded-lg transition-colors" 
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                    <td colSpan={roleFilter === UserRole.DOCTOR ? 6 : 5} className="py-12 text-center text-slate-500 text-sm bg-white/40">
                        <div className="flex flex-col items-center gap-2">
                            <Search size={32} className="opacity-20" />
                            <p>Tidak ada pengguna yang ditemukan.</p>
                        </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
              <h3 className="font-bold text-lg text-slate-800">
                {editingUser ? 'Edit Pengguna' : 'Buat Pengguna Baru'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Peran</label>
                    <select
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                    disabled={!!editingUser} 
                    >
                    <option value={UserRole.PATIENT}>Pasien</option>
                    <option value={UserRole.DOCTOR}>Dokter</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status Akun</label>
                    <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as UserStatus})}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                    >
                    <option value="ACTIVE">Aktif</option>
                    <option value="PENDING">Menunggu Verifikasi</option>
                    <option value="INACTIVE">Tidak Aktif</option>
                    </select>
                </div>
              </div>

              <div className="border-t border-slate-100 my-2"></div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                  placeholder="cth. Budi Santoso"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Alamat Email</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                  placeholder="user@healthtown.com"
                />
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
                          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                          placeholder={editingUser ? "Biarkan kosong jika tidak ingin mengubah..." : "min. 6 karakter"}
                      />
                  </div>
               </div>

              {formData.role === UserRole.DOCTOR && (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4 mt-2 animate-fade-in">
                    <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                        <Stethoscope size={16} /> Verifikasi Profesional
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor STR</label>
                            <input
                            type="text"
                            value={formData.strNumber}
                            onChange={(e) => setFormData({...formData, strNumber: e.target.value})}
                            className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                            placeholder="STR-xxxxxxxx"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Spesialisasi</label>
                            <input
                            type="text"
                            value={formData.specialization}
                            onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                            className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                            placeholder="cth. Kardiolog"
                            />
                        </div>
                    </div>

                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Klinik / Rumah Sakit</label>
                        <input
                            type="text"
                            value={formData.clinic}
                            onChange={(e) => setFormData({...formData, clinic: e.target.value})}
                            className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-health-500 text-black"
                            placeholder="cth. Klinik Sehat HealthTown"
                        />
                    </div>
                    
                    <p className="text-[10px] text-blue-600 italic">
                        * Kredensial akan dikirim ke email yang diberikan di atas setelah pembuatan.
                    </p>
                  </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-health-600 hover:bg-health-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-health-600/20 transition-all disabled:opacity-70"
                >
                  {loading ? 'Menyimpan...' : (editingUser ? 'Perbarui Pengguna' : 'Buat Pengguna')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
