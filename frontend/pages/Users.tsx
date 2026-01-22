
import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { UserRole, User } from '../types';

const Users: React.FC = () => {
  const { staff, addStaff, updateStaff, removeStaff, resetSystem } = useHotel();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: UserRole.RECEPTION,
    password: ''
  });

  const handleOpenAddForm = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: UserRole.RECEPTION, password: '' });
    setShowForm(true);
  };

  const handleOpenEditForm = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: user.password || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateStaff({
        ...editingUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || editingUser.password
      });
    } else {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password || 'welcome123'
      };
      addStaff(newUser);
    }
    setShowForm(false);
  };

  const handlePermanentDeletion = (userId: string, userName: string) => {
    const confirmation = window.confirm(
      `CRITICAL ACTION: Are you sure you want to PERMANENTLY DELETE ${userName.toUpperCase()}?\n\n` +
      `This will immediately revoke their access, remove them from all service assignments, and terminate any active sessions.`
    );
    
    if (confirmation) {
      removeStaff(userId);
    }
  };

  const handleReset = () => {
    if (window.confirm("FATAL ACTION: Reset all property data to factory defaults? All current bookings and staff changes will be lost.")) {
      resetSystem();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Identity & Access</h1>
          <p className="text-rose-600 font-black text-xs uppercase tracking-widest mt-2 flex items-center">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full mr-2 animate-pulse"></span>
            Administrator Control Interface
          </p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleReset}
            className="text-slate-400 hover:text-rose-600 font-bold text-[10px] uppercase tracking-widest px-6 py-4 rounded-2xl transition-all"
          >
            Reset Property Data
          </button>
          <button 
            onClick={handleOpenAddForm}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 hover:shadow-indigo-200 transition-all active:scale-95 flex items-center"
          >
            <span className="mr-2 text-xl">+</span> ONBOARD NEW STAFF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Personnel Registry</h2>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{staff.length} TOTAL USERS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Credentials</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Security Tier</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Authority Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-7">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-lg leading-tight">{user.name}</div>
                        <div className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-1">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-7">
                    <div className="text-sm font-bold text-slate-600">{user.email}</div>
                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter mt-1 flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                      Verified & Authorized
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] ${
                      user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' :
                      user.role === UserRole.RECEPTION ? 'bg-sky-100 text-sky-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    {user.role !== UserRole.ADMIN ? (
                      <div className="flex justify-end items-center space-x-3">
                        <button 
                          onClick={() => handleOpenEditForm(user)}
                          className="text-indigo-600 hover:text-white font-black text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all border-2 border-indigo-50 hover:bg-indigo-600 hover:border-indigo-600 active:scale-95"
                        >
                          Edit User
                        </button>
                        <button 
                          onClick={() => handlePermanentDeletion(user.id, user.name)}
                          className="text-rose-500 hover:text-white font-black text-[10px] uppercase tracking-widest py-2.5 px-5 rounded-xl transition-all border-2 border-rose-50 hover:bg-rose-600 hover:border-rose-600 active:scale-95"
                        >
                          Delete User
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2 text-slate-300">
                        <span className="text-[10px] font-black uppercase tracking-widest">System Master</span>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 w-full max-w-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300 border border-slate-100">
            <header className="mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">
                {editingUser ? 'Update Profile' : 'Identity Provisioning'}
              </h3>
              <p className="text-slate-400 font-bold mt-2">
                {editingUser ? `Managing credentials for ${editingUser.name}` : 'Create a new staff account with specific privileges.'}
              </p>
            </header>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Name</label>
                  <input 
                    type="text" required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Role</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                    <option value={UserRole.RECEPTION}>Reception Desk</option>
                    <option value={UserRole.CLEANER}>Housekeeping</option>
                    <option value={UserRole.ADMIN}>Administrator</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Email</label>
                <input 
                  type="email" required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {editingUser ? 'Update Password (Optional)' : 'Initial Password'}
                </label>
                <input 
                  type="text" 
                  required={!editingUser}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none font-bold transition-all"
                  value={formData.password}
                  placeholder={editingUser ? 'Keep current if blank' : 'welcome123'}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-8">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-2xl transition-all"
                >
                  ABORT
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 font-black bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all transform active:scale-95"
                >
                  {editingUser ? 'SAVE CHANGES' : 'DEPLOY ACCOUNT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
