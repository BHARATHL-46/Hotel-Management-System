
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { Room } from '../types';

const Rooms: React.FC = () => {
  const { user } = useAuth();
  const { rooms, reservations, addRoom } = useHotel();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: '',
    floor: 1,
    type: 'DOUBLE' as Room['type']
  });

  // Group rooms by floor
  const floors = useMemo(() => {
    const floorMap: Record<number, Room[]> = {};
    rooms.forEach(room => {
      if (!floorMap[room.floor]) floorMap[room.floor] = [];
      floorMap[room.floor].push(room);
    });
    return Object.keys(floorMap).sort().map(Number);
  }, [rooms]);

  // Generate available room numbers for the selected floor that are NOT already in the system
  const availableRoomNumbers = useMemo(() => {
    const existingNumbers = rooms.map(r => r.number);
    const potentialNumbers = [];
    // Generating potential numbers for floor F: F01 to F20 (standard hotel sequence)
    for (let i = 1; i <= 20; i++) {
      const num = `${newRoom.floor}${i < 10 ? '0' + i : i}`;
      if (!existingNumbers.includes(num)) {
        potentialNumbers.push(num);
      }
    }
    return potentialNumbers;
  }, [rooms, newRoom.floor]);

  // Automatically select the first available number when floor changes
  React.useEffect(() => {
    if (availableRoomNumbers.length > 0 && !availableRoomNumbers.includes(newRoom.number)) {
      setNewRoom(prev => ({ ...prev, number: availableRoomNumbers[0] }));
    }
  }, [availableRoomNumbers]);

  const getRoomDisplayStatus = (room: Room) => {
    const isOccupied = reservations.some(r => r.roomNumber === room.number && r.status === 'Checked-In');
    if (isOccupied) return 'Occupied';
    if (room.status === 'Dirty' || room.status === 'Cleaning') return 'Cleaning';
    return 'Available';
  };

  const handleAddRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.number) return;
    addRoom({
      id: Date.now().toString(),
      number: newRoom.number,
      floor: Number(newRoom.floor),
      type: newRoom.type,
      status: 'Clean'
    });
    setShowAddModal(false);
  };

  const statusColors = {
    'Available': 'bg-emerald-500',
    'Occupied': 'bg-rose-500',
    'Cleaning': 'bg-slate-900'
  };

  const typeColors = {
    'SUITE': 'bg-[#EAB308]', // Gold/Yellow
    'DOUBLE': 'bg-[#2563EB]', // Blue
    'SINGLE': 'bg-[#4B5563]'  // Grey
  };

  const cardBorderColors = {
    'SUITE': 'border-[#EAB308]',
    'DOUBLE': 'border-[#2563EB]',
    'SINGLE': 'border-slate-300'
  };

  const cardShadowColors = {
    'SUITE': 'shadow-amber-100',
    'DOUBLE': 'shadow-blue-100',
    'SINGLE': 'shadow-slate-100'
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Rooms</h1>
          <p className="text-slate-500 mt-2">Click an available room to start a reservation.</p>
        </div>
        <div className="flex flex-col items-end space-y-4">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-slate-600">Available</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="text-xs font-bold text-slate-600">Occupied</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span>
              <span className="text-xs font-bold text-slate-600">Cleaning</span>
            </div>
          </div>
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all text-sm"
            >
              + REGISTER UNIT
            </button>
          )}
        </div>
      </div>

      <div className="space-y-16">
        {floors.map(floor => (
          <div key={floor} className="space-y-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-black text-slate-900">Floor {floor}</h2>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
              {rooms.filter(r => r.floor === floor).sort((a, b) => a.number.localeCompare(b.number)).map((room) => {
                const displayStatus = getRoomDisplayStatus(room);
                return (
                  <div
                    key={room.id}
                    onClick={() => displayStatus === 'Available' && navigate('/reservations')}
                    className={`bg-white p-3 rounded-xl border-2 shadow-sm transition-all cursor-pointer hover:scale-105 ${cardBorderColors[room.type]} ${cardShadowColors[room.type]}`}
                  >
                    <div className="text-center font-black text-slate-900 mb-2">{room.number}</div>

                    <div className="space-y-2">
                      <div className={`py-1 text-[10px] font-black text-white text-center rounded-lg uppercase tracking-wider ${typeColors[room.type]}`}>
                        {room.type}
                      </div>

                      <div className={`py-1 text-[10px] font-black text-white text-center rounded-lg uppercase tracking-wider ${statusColors[displayStatus]}`}>
                        {displayStatus}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Register New Unit</h3>
            <form onSubmit={handleAddRoom} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Floor</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={newRoom.floor}
                    onChange={e => setNewRoom({ ...newRoom, floor: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5, 6].map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Room Type</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    value={newRoom.type}
                    onChange={e => setNewRoom({ ...newRoom, type: e.target.value as Room['type'] })}
                  >
                    <option value="SUITE">Suite</option>
                    <option value="DOUBLE">Double</option>
                    <option value="SINGLE">Single</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Unregistered Room No.</label>
                <select
                  required
                  className={`w-full px-4 py-3 rounded-xl outline-none border ${availableRoomNumbers.length > 0 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}
                  value={newRoom.number}
                  onChange={e => setNewRoom({ ...newRoom, number: e.target.value })}
                >
                  {availableRoomNumbers.length > 0 ? (
                    availableRoomNumbers.map(num => (
                      <option key={num} value={num}>Room {num}</option>
                    ))
                  ) : (
                    <option value="">No Slots Available</option>
                  )}
                </select>
                <p className="mt-2 text-[10px] font-bold text-slate-400">Only showing numbers not yet added to Floor {newRoom.floor}.</p>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 font-bold text-slate-400">CANCEL</button>
                <button
                  type="submit"
                  disabled={availableRoomNumbers.length === 0}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:bg-slate-300 disabled:shadow-none transition-all"
                >
                  ADD ROOM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
