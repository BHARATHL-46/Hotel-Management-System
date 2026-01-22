
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { UserRole, Reservation, Room } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { rooms, reservations, updateReservationStatus, updateRoomStatus } = useHotel();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const total = rooms.length;
    const occupiedCount = reservations.filter(res => res.status === 'Checked-In').length;
    const dirtyCount = rooms.filter(r => r.status === 'Dirty').length;
    const cleaningCount = rooms.filter(r => r.status === 'Cleaning').length;
    const pendingArrivals = reservations.filter(res => res.status === 'Pending').length;
    const availableCount = rooms.filter(r => 
      r.status === 'Clean' && 
      !reservations.some(res => res.roomNumber === r.number && (res.status === 'Checked-In' || res.status === 'Pending'))
    ).length;

    return { total, occupiedCount, dirtyCount, cleaningCount, availableCount, pendingArrivals };
  }, [rooms, reservations]);

  // --- RECEPTIONIST CONSOLE ---
  if (user?.role === UserRole.RECEPTION) {
    const checkOutsToday = reservations.filter(r => r.status === 'Checked-In');
    
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="flex justify-between items-end">
          <div>
            <span className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">Operational Authority</span>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">Reception Command</h1>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => navigate('/reservations')} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center">
              <span className="mr-2">+</span> NEW BOOKING
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <OperationalCard label="Pending Arrivals" value={metrics.pendingArrivals} color="indigo" icon="🛄" />
          <OperationalCard label="Checkouts Active" value={checkOutsToday.length} color="rose" icon="🔑" />
          <OperationalCard label="Ready Inventory" value={metrics.availableCount} color="emerald" icon="✅" />
          <OperationalCard label="Turnover Queue" value={metrics.dirtyCount} color="amber" icon="🧹" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <span className="mr-2">📅</span> Next Arrivals
            </h3>
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {reservations.filter(r => r.status === 'Pending').map(res => (
                <div key={res.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-indigo-200 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-slate-900">{res.guestName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Room {res.roomNumber} • {res.stayTime}</p>
                    </div>
                    <button 
                      onClick={() => updateReservationStatus(res.id, 'Checked-In')}
                      className="bg-white text-indigo-600 border border-indigo-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      Check In
                    </button>
                  </div>
                </div>
              ))}
              {reservations.filter(r => r.status === 'Pending').length === 0 && (
                <div className="text-center py-20 text-slate-300 font-bold italic">No pending arrivals.</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <span className="mr-2">🚪</span> Pending Checkouts
            </h3>
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar">
              {checkOutsToday.map(res => (
                <div key={res.id} className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-rose-200 transition-all group">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-black text-slate-900">{res.guestName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Room {res.roomNumber}</p>
                    </div>
                    <button 
                      onClick={() => updateReservationStatus(res.id, 'Checked-Out')}
                      className="bg-white text-rose-600 border border-rose-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              ))}
              {checkOutsToday.length === 0 && (
                <div className="text-center py-20 text-slate-300 font-bold italic">No active stays.</div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center">
              <span className="mr-2">🏢</span> Instant Inventory
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {rooms.slice(0, 24).map(room => {
                const isOccupied = reservations.some(res => res.roomNumber === room.number && res.status === 'Checked-In');
                let color = 'bg-slate-100 text-slate-400';
                if (isOccupied) color = 'bg-rose-500 text-white shadow-lg shadow-rose-100';
                else if (room.status === 'Clean') color = 'bg-emerald-500 text-white shadow-lg shadow-emerald-100';
                else if (room.status === 'Dirty') color = 'bg-amber-500 text-white shadow-lg shadow-amber-100';
                else if (room.status === 'Cleaning') color = 'bg-slate-800 text-white animate-pulse';

                return (
                  <div key={room.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-[10px] font-black ${color}`} title={`${room.number}: ${room.status}`}>
                    {room.number}
                  </div>
                );
              })}
            </div>
            <div className="mt-10 pt-6 border-t border-slate-50 flex flex-wrap gap-x-6 gap-y-3">
              <LegendItem color="bg-emerald-500" label="Clean/Ready" />
              <LegendItem color="bg-rose-500" label="Occupied" />
              <LegendItem color="bg-amber-500" label="Turnover" />
              <LegendItem color="bg-slate-800" label="In-Service" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- CLEANER DASHBOARD ---
  if (user?.role === UserRole.CLEANER) {
    const myRooms = rooms.filter(r => r.assignedTo === user.id);
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="text-center">
          <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[2.5rem] mx-auto flex items-center justify-center text-5xl mb-6 shadow-2xl shadow-indigo-100 text-white font-black">
            {user.name.charAt(0)}
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Daily Assignments</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Personal Service Queue</p>
        </header>

        <div className="grid grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl text-center">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">My Tasks</p>
             <h4 className="text-5xl font-black text-slate-900">{myRooms.filter(r => r.status !== 'Clean').length}</h4>
           </div>
           <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl text-center">
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Verified Clean</p>
             <h4 className="text-5xl font-black text-emerald-600">{myRooms.filter(r => r.status === 'Clean').length}</h4>
           </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
          <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight flex items-center">
            <span className="mr-3 p-3 bg-slate-50 rounded-2xl">📋</span> Service Queue
          </h3>
          <div className="space-y-8">
            {myRooms.filter(r => r.status !== 'Clean').map(room => (
              <div key={room.id} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-indigo-100 transition-all hover:shadow-xl">
                <div>
                   <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">{room.type}</span>
                   <h4 className="text-4xl font-black text-slate-900 mt-2">Room {room.number}</h4>
                   <p className="text-xs font-bold text-slate-400 mt-2 flex items-center">
                     <span className={`w-3 h-3 rounded-full mr-3 ${room.status === 'Dirty' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500 animate-spin-slow'}`}></span>
                     Priority: <span className="ml-1 text-slate-900 uppercase">{room.status}</span>
                   </p>
                </div>
                <div>
                  {room.status === 'Dirty' ? (
                    <button 
                      onClick={() => updateRoomStatus(room.id, 'Cleaning')}
                      className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-2xl shadow-indigo-100 transition-all transform active:scale-95"
                    >
                      Start Cleaning
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateRoomStatus(room.id, 'Clean')}
                      className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-2xl shadow-emerald-100 transition-all transform active:scale-95"
                    >
                      Verify Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
            {myRooms.filter(r => r.status !== 'Clean').length === 0 && (
              <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="text-7xl mb-6">🏁</div>
                <h4 className="text-2xl font-black text-slate-900">Queue Discharged</h4>
                <p className="text-slate-400 font-bold mt-2">All your assigned units are confirmed clean.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- ADMIN EXECUTIVE DASHBOARD ---
  const statusData = [
    { name: 'Clean', value: metrics.availableCount, color: '#10b981' },
    { name: 'Dirty', value: metrics.dirtyCount, color: '#f43f5e' },
    { name: 'Cleaning', value: metrics.cleaningCount, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <span className="text-rose-600 font-black text-xs uppercase tracking-[0.4em]">Strategic Control</span>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1">Executive Overview</h1>
        </div>
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Global Master Access</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Yield Potential" value={metrics.availableCount} color="emerald" sub="Units available for check-in" />
        <StatCard label="Live Occupancy" value={`${Math.round((metrics.occupiedCount / metrics.total) * 100)}%`} color="rose" sub="Asset utilization rate" />
        <StatCard label="Flow Velocity" value={reservations.length} color="indigo" sub="Total recorded lifecycle events" />
        <StatCard label="Service Burden" value={metrics.dirtyCount + metrics.cleaningCount} color="amber" sub="Maintenance turnaround load" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-12 flex items-center">
            <span className="mr-4 p-3 bg-slate-50 rounded-2xl">📊</span> Sanitation Matrix
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', shadow: 'none', fontWeight: 'bold' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={50}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-12 flex items-center">
            <span className="mr-4 p-3 bg-slate-50 rounded-2xl">🏬</span> Inventory Mix
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={[
                    { name: 'Suite', value: rooms.filter(r => r.type === 'SUITE').length },
                    { name: 'Double', value: rooms.filter(r => r.type === 'DOUBLE').length },
                    { name: 'Single', value: rooms.filter(r => r.type === 'SINGLE').length },
                  ]} 
                  cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={10} dataKey="value"
                >
                  {[ '#EAB308', '#2563EB', '#4B5563' ].map((color, index) => <Cell key={`cell-${index}`} fill={color} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontWeight: 'bold', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Components
const StatCard = ({ label, value, color, sub }: { label: string, value: string | number, color: string, sub: string }) => {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
    amber: 'text-amber-600',
  };
  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/30 group hover:-translate-y-2 transition-transform">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{label}</p>
      <h3 className={`text-5xl font-black ${colorMap[color]}`}>{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 mt-6 uppercase tracking-widest italic">{sub}</p>
    </div>
  );
};

const OperationalCard = ({ label, value, color, icon }: { label: string, value: number, color: string, icon: string }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group hover:scale-105 transition-all">
    <div className="absolute top-[-20%] right-[-10%] text-7xl opacity-5 group-hover:rotate-12 transition-transform">{icon}</div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <h4 className={`text-5xl font-black ${color === 'indigo' ? 'text-indigo-600' : color === 'rose' ? 'text-rose-600' : 'text-slate-900'}`}>{value}</h4>
  </div>
);

const LegendItem = ({ color, label }: { color: string, label: string }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-3 h-3 rounded-full ${color}`}></div>
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </div>
);

export default Dashboard;
