
import React from 'react';
import Sidebar from './Sidebar';
import { useHotel } from '../context/HotelContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useHotel();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Management Panel</h2>
          <div className="flex items-center space-x-4">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Live Operations
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 relative">
          {children}
          
          {/* System Notification Bus */}
          <div className="fixed bottom-8 right-8 z-[100] flex flex-col space-y-3">
            {toasts.map((toast) => (
              <div 
                key={toast.id}
                onClick={() => removeToast(toast.id)}
                className={`flex items-center space-x-3 px-6 py-4 rounded-2xl shadow-2xl border cursor-pointer animate-in slide-in-from-right-10 duration-300 ${
                  toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
                  toast.type === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
                  'bg-indigo-900 border-indigo-800 text-white'
                }`}
              >
                <div className="text-lg">
                  {toast.type === 'success' ? '✓' : toast.type === 'error' ? '!' : 'i'}
                </div>
                <div className="text-sm font-black uppercase tracking-tight">
                  {toast.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
