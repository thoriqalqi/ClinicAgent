import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { User, UserRole, UserStatus } from '../types';
import { Search, Trash2, CheckCircle, Ban, Users, Edit, X, Plus, Mail, Calendar } from 'lucide-react';

export const AdminPatients: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    status: 'ACTIVE' as UserStatus,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getUsers();
      setUsers(allUsers.filter(u => u.role === UserRole.PATIENT));
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
      if (editingUser) {
        await userService.updateUser(editingUser.id, formData);
      } else {
        await userService.createUser({
          ...formData,
          role: UserRole.PATIENT
        });
      }
      await fetchUsers();
      closeModal();
    } catch (error) {
      alert("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this patient data?')) {
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
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in relative pt-6">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={24} /></div>
            Patient Database
          </h1>
          <p className="text-slate-500 font-medium mt-2 ml-1">View registered citizens and manage account status.</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold shadow-xl shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} /> Add Patient
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search patient name, ID, or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900 font-bold transition-all"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Patient Identity</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider">Account Status</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Date</th>
                <th className="py-5 px-8 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-5 px-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-white shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-base">{user.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                            <Mail size={12} /> {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-8">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border
                        ${user.status === 'ACTIVE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                       {user.status === 'ACTIVE' ? <CheckCircle size={12} /> : <Ban size={12} />}
                       {user.status}
                    </span>
                  </td>
                  <td className="py-5 px-8">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                          <Calendar size={16} className="text-slate-400" />
                          Oct 24, 2024
                      </div>
                  </td>
                  <td className="py-5 px-8 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openModal(user)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
               {filteredUsers.length === 0 && (
                <tr>
                    <td colSpan={4} className="py-16 text-center">
                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Users size={24} className="text-slate-300" />
                       </div>
                       <p className="text-slate-500 font-bold">No patients found.</p>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-scale-in overflow-hidden border border-white/20">
             <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                      <Users size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">
                    {editingUser ? 'Edit Patient' : 'Register Patient'}
                  </h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 transition-all ${editingUser ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Email</label>
                  <input 
                    required
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={`w-full border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 transition-all ${editingUser ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200'}`}
                    disabled={!!editingUser} 
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-2 pl-1">Account Status</label>
                   <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as UserStatus})}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 cursor-pointer"
                   >
                    <option value="ACTIVE">Active Account</option>
                    <option value="INACTIVE">Inactive / Banned</option>
                   </select>
                </div>
                <div className="pt-4 flex gap-4">
                    <button type="button" onClick={closeModal} className="flex-1 py-3.5 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={loading} className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-xl shadow-emerald-600/20 transition-all">
                      {loading ? 'Saving...' : (editingUser ? 'Update Status' : 'Create Account')}
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