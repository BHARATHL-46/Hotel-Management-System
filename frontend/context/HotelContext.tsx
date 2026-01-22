import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Room, Reservation, User } from '../types';
import api from '../services/api';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface HotelContextType {
  rooms: Room[];
  reservations: Reservation[];
  staff: User[];
  toasts: Toast[];
  isLoading: boolean;
  addStaff: (user: User) => Promise<void>;
  updateStaff: (user: User) => Promise<void>;
  removeStaff: (userId: string) => Promise<void>;
  addRoom: (room: Room) => Promise<void>;
  addReservation: (res: any) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation['status']) => Promise<void>;
  updateRoomStatus: (roomId: string, status: Room['status']) => Promise<void>;
  assignRoomToCleaner: (roomId: string, staffId: string | undefined) => Promise<void>;
  notify: (message: string, type?: Toast['type']) => void;
  removeToast: (id: string) => void;
  resetSystem: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const [roomsRes, resRes, staffRes] = await Promise.allSettled([
        api.get('/rooms'),
        api.get('/reservations'),
        api.get('/users')
      ]);

      if (roomsRes.status === 'fulfilled') {
        setRooms(roomsRes.value.data.map((r: any) => ({
          ...r,
          id: r._id,
          number: r.roomNumber,
          status: r.status === 'AVAILABLE' ? 'Clean' : r.status === 'OCCUPIED' ? 'Dirty' : 'Cleaning'
        })));
      }

      if (resRes.status === 'fulfilled') {
        setReservations(resRes.value.data.map((r: any) => ({
          ...r,
          id: r._id,
          roomNumber: r.roomId?.roomNumber || 'N/A',
          checkIn: r.checkInDate,
          checkOut: r.checkOutDate,
          status: r.status === 'BOOKED' ? 'Pending' : r.status === 'CHECKED_IN' ? 'Checked-In' : 'Checked-Out'
        })));
      } else {
        setReservations([]);
      }

      if (staffRes.status === 'fulfilled') {
        setStaff(staffRes.value.data.map((s: any) => ({ ...s, id: s._id })));
      } else {
        setStaff([]);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [fetchData]);

  const notify = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const resetSystem = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    window.location.reload();
  };

  const addStaff = async (user: User) => {
    try {
      const res = await api.post('/users', user);
      setStaff(prev => [...prev, { ...res.data, id: res.data._id }]);
      notify(`Personnel ${user.name} onboarded successfully`, 'success');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to add staff', 'error');
    }
  };

  const updateStaff = async (updatedUser: User) => {
    try {
      const res = await api.put(`/users/${updatedUser.id}`, updatedUser);
      setStaff(prev => prev.map(s => s.id === updatedUser.id ? { ...res.data, id: res.data._id } : s));
      notify(`Profile updated for ${updatedUser.name}`, 'info');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to update staff', 'error');
    }
  };

  const removeStaff = async (userId: string) => {
    try {
      await api.delete(`/users/${userId}`);
      setStaff(prev => prev.filter(s => s.id !== userId));
      notify(`Access revoked`, 'error');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to remove staff', 'error');
    }
  };

  const addRoom = async (room: Room) => {
    try {
      const prices: Record<string, number> = { 'SUITE': 250, 'DOUBLE': 150, 'SINGLE': 100 };
      const res = await api.post('/rooms', {
        roomNumber: room.number,
        floor: room.floor,
        type: room.type,
        pricePerNight: prices[room.type] || 100,
        status: 'AVAILABLE'
      });
      setRooms(prev => [...prev, { ...res.data, id: res.data._id, number: res.data.roomNumber }]);
      notify(`Unit ${room.number} registered into system`, 'success');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to add room', 'error');
    }
  };

  const addReservation = async (res: any) => {
    try {
      const response = await api.post('/reservations', {
        guestName: res.guestName,
        phone: res.phone,
        roomId: rooms.find(rm => rm.number === res.roomNumber)?.id,
        checkInDate: res.checkIn,
        checkOutDate: res.checkOut,
        totalAmount: res.charge
      });
      fetchData(); // Refresh all data to get updated statuses
      notify(`Booking confirmed for ${res.guestName}`, 'success');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to add reservation', 'error');
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation['status']) => {
    try {
      const endpoint = status === 'Checked-In' ? 'checkin' : 'checkout';
      await api.patch(`/reservations/${id}/${endpoint}`);
      fetchData();
      notify(`Reservation updated to ${status}`, 'success');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to update reservation', 'error');
    }
  };

  const updateRoomStatus = async (roomId: string, status: Room['status']) => {
    try {
      const statusMap: Record<string, string> = {
        'Clean': 'AVAILABLE',
        'Dirty': 'OCCUPIED',
        'Cleaning': 'CLEANING'
      };
      await api.put(`/rooms/${roomId}`, { status: statusMap[status] });
      fetchData();
      notify(`Room status updated to ${status}`, 'info');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Failed to update room', 'error');
    }
  };

  const assignRoomToCleaner = async (roomId: string, staffId: string | undefined) => {
    try {
      await api.put(`/rooms/${roomId}`, { assignedTo: staffId || null });
      fetchData();
      notify('Room assignment updated', 'info');
    } catch (error: any) {
      notify(error.response?.data?.message || 'Assignment failed', 'error');
    }
  };

  return (
    <HotelContext.Provider value={{
      rooms, reservations, staff, toasts, isLoading, addStaff, updateStaff, removeStaff, addRoom, addReservation,
      updateReservationStatus, updateRoomStatus, assignRoomToCleaner, notify, removeToast, resetSystem
    }}>
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within HotelProvider');
  return context;
};
