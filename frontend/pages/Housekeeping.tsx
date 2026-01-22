
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { Room, UserRole } from '../types';

const Housekeeping: React.FC = () => {
  const { user } = useAuth();
  const { rooms, updateRoomStatus, staff, assignRoomToCleaner } = useHotel();

  // Management controls for both Admin and Receptionist
  const cleaners = staff.filter(s => s.role === UserRole.CLEANER);
  const visibleRooms = rooms.filter(room => room.status === 'Dirty' || room.status === 'Cleaning');

  const getStaffName = (staffId?: string) => {
    return staff.find(s => s.id === staffId)?.name || 'Unassigned';
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Housekeeping Operations</h1>
          <p className="text-slate-500 mt-2 text-lg">
            {user?.role === UserRole.ADMIN ? 'Administrator Control' : 'Reception Desk'}: Assign personnel and monitor progress.
          </p>
        </div>
        <div className="flex space-x-4">
           <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-black uppercase">
             Pending: {rooms.filter(r => r.status === 'Dirty').length}
           </div>
           <div className="bg-amber-50 border border-amber-100 text-amber-600 px-4 py-2 rounded-xl text-xs font-black uppercase">
             In Progress: {rooms.filter(r => r.status === 'Cleaning').length}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleRooms.map(room => (
          <div key={room.id} className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all shadow-xl ${
            room.status === 'Dirty' ? 'border-rose-100' : 'border-amber-100'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UNIT</span>
                <h3 className="text-3xl font-black text-slate-900">Room {room.number}</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{room.type}</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${
                room.status === 'Dirty' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>
                {room.status}
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Personnel</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm"
                  value={room.assignedTo || ''}
                  onChange={(e) => assignRoomToCleaner(room.id, e.target.value || undefined)}
                >
                  <option value="">Select Cleaner</option>
                  {cleaners.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                {room.status === 'Dirty' && (
                  <button 
                    onClick={() => updateRoomStatus(room.id, 'Cleaning')}
                    disabled={!room.assignedTo}
                    className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      room.assignedTo 
                        ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-100' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Set Cleaning
                  </button>
                )}
                {room.status === 'Cleaning' && (
                  <button 
                    onClick={() => updateRoomStatus(room.id, 'Clean')}
                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
              
              {room.assignedTo && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                    Assigned: {getStaffName(room.assignedTo)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {visibleRooms.length === 0 && (
          <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
            <div className="text-6xl mb-6">✨</div>
            <h3 className="text-2xl font-black text-slate-900">Spotless Property</h3>
            <p className="text-slate-400 font-bold mt-2">
              All units are currently maintained and verified.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Housekeeping;
