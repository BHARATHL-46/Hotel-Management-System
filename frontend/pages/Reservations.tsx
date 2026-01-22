
import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { canAccess } from '../services/permissions';
import { Reservation } from '../types';

const Reservations: React.FC = () => {
  const { user } = useAuth();
  const { rooms, reservations, addReservation, updateReservationStatus } = useHotel();

  // Form State
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    checkIn: new Date().toISOString().slice(0, 16),
    duration: '12h',
    roomNumber: ''
  });

  const [searchQuery, setSearchQuery] = useState('');

  const showActions = canAccess(user?.role, 'CHECK_IN_OUT');

  const calculateCheckOut = (checkIn: string, duration: string) => {
    const date = new Date(checkIn);
    if (duration === '12h') date.setHours(date.getHours() + 12);
    else if (duration === '1d') date.setDate(date.getDate() + 1);
    else if (duration === '2d') date.setDate(date.getDate() + 2);
    return date;
  };

  /**
   * REVISED RULE:
   * A room is allocatable ONLY if status === 'Clean' AND no active booking.
   */
  const allocatableRooms = useMemo(() => {
    const activeRoomNumbers = reservations
      .filter(r => r.status === 'Checked-In' || r.status === 'Pending')
      .map(r => r.roomNumber);

    return rooms.filter(room =>
      room.status === 'Clean' && !activeRoomNumbers.includes(room.number)
    );
  }, [rooms, reservations]);

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.guestName || !formData.roomNumber) {
      alert("Please provide guest name and select a CLEAN available room.");
      return;
    }

    const checkoutDate = calculateCheckOut(formData.checkIn, formData.duration);
    const charge = formData.duration === '12h' ? 1770 : (formData.duration === '1d' ? 3540 : 7080);

    const newRes: Reservation = {
      id: `R-${Math.floor(Math.random() * 10000)}`,
      guestName: formData.guestName,
      phone: formData.phone,
      roomNumber: formData.roomNumber,
      checkIn: new Date(formData.checkIn).toISOString(),
      checkOut: checkoutDate.toISOString(),
      status: 'Pending',
      stayTime: formData.duration,
      charge: charge
    };

    addReservation(newRes);
    setFormData({ guestName: '', phone: '', checkIn: new Date().toISOString().slice(0, 16), duration: '12h', roomNumber: '' });
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter(res =>
      res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.roomNumber.includes(searchQuery)
    );
  }, [reservations, searchQuery]);

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Royal Villa Reservations</h1>
          <p className="text-slate-500 mt-2 text-lg">Allocating only CLEAN rooms. Checked-out rooms require housekeeping.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100">
          <form onSubmit={handleConfirmReservation} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Guest Name</label>
              <input
                type="text"
                placeholder="Full Guest Name"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.guestName}
                onChange={e => setFormData({ ...formData, guestName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Phone</label>
              <input
                type="text"
                placeholder="+1..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Stay Duration</label>
              <select
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
              >
                <option value="12h">12 Hours</option>
                <option value="1d">1 Day</option>
                <option value="2d">2 Days</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Room (Clean Only)</label>
              <select
                className={`w-full px-5 py-4 rounded-2xl outline-none border ${allocatableRooms.length > 0 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'}`}
                value={formData.roomNumber}
                onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
              >
                <option value="">{allocatableRooms.length > 0 ? 'Select Room' : 'No Clean Rooms Available'}</option>
                {allocatableRooms.map(room => (
                  <option key={room.id} value={room.number}>Room {room.number} ({room.type})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={allocatableRooms.length === 0}
                className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:bg-slate-300"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-slate-100">
          <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Search</h2>
          <input
            type="text"
            placeholder="Search bookings..."
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b-2 border-slate-900">
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest">Guest</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Room</th>
              <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 text-right text-[11px] font-black text-slate-900 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {filteredReservations.map((res) => (
              <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-extrabold text-slate-900">{res.guestName}</div>
                  <div className="text-xs text-slate-400 font-bold">{res.phone}</div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full font-black text-sm">#{res.roomNumber}</span>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className={`px-4 py-2 rounded-2xl text-[10px] font-black inline-block uppercase tracking-widest ${res.status === 'Checked-In' ? 'bg-emerald-50 text-emerald-600' :
                    res.status === 'Checked-Out' ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                    {res.status}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  {showActions && (
                    <div className="flex justify-end space-x-2">
                      {res.status === 'Pending' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'Checked-In')}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-700"
                        >
                          Check In
                        </button>
                      )}
                      {res.status === 'Checked-In' && (
                        <button
                          onClick={() => updateReservationStatus(res.id, 'Checked-Out')}
                          className="bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-700"
                        >
                          Check Out
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;
