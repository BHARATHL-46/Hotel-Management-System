
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const role = user?.role;

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', roles: [UserRole.ADMIN, UserRole.RECEPTION, UserRole.CLEANER] },
    { name: 'Rooms', path: '/rooms', roles: [UserRole.ADMIN, UserRole.RECEPTION] },
    { name: 'Reservations', path: '/reservations', roles: [UserRole.ADMIN, UserRole.RECEPTION] },
    { name: 'Housekeeping', path: '/housekeeping', roles: [UserRole.ADMIN, UserRole.RECEPTION] },
    { name: 'Users', path: '/users', roles: [UserRole.ADMIN] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role as UserRole));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <aside className="w-72 bg-[#121212] text-white flex-shrink-0 flex flex-col shadow-2xl z-20 border-r border-slate-800/50">
      {/* Logo Section */}
      <div className="p-8 pb-4">
        <h1 className="text-2xl font-black tracking-widest text-[#EAB308] mb-1">
          ROYAL VILLAS
        </h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
          Hotel Management
        </p>
      </div>

      <div className="px-6 py-6 border-t border-slate-800/50">
        {/* User Profile Card */}
        <div className="bg-[#1e1e1e] p-4 rounded-2xl flex items-center space-x-4 border border-slate-800/50">
          <div className="w-12 h-12 rounded-xl bg-[#EAB308] flex items-center justify-center font-black text-black text-lg">
            {user ? getInitials(user.name) : '??'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold truncate text-white">
              {user?.name || 'Guest User'}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {user?.role.toLowerCase() || 'Role'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation Section */}
      <nav className="flex-1 mt-4">
        <div className="space-y-0.5">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-8 py-4 transition-all duration-200 group border-l-4 ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#1a1a1a] to-transparent text-[#EAB308] border-[#EAB308]' 
                    : 'text-slate-400 hover:text-white border-transparent'
                }`
              }
            >
              <span className="font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">
                {item.name}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
      
      {/* Logout Section */}
      <div className="p-8 border-t border-slate-800/50">
        <button 
          onClick={logout}
          className="w-full py-3.5 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800/50 hover:border-slate-700 rounded-xl font-bold text-sm transition-all active:scale-95"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
