
export enum UserRole {
  ADMIN = 'ADMIN',
  RECEPTION = 'RECEPTION',
  CLEANER = 'CLEANER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export type ActionType = 
  | 'MANAGE_USERS' 
  | 'ASSIGN_CLEANERS' 
  | 'CHECK_IN_OUT' 
  | 'UPDATE_CLEANING_STATUS' 
  | 'VIEW_REPORTS';

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: 'SUITE' | 'DOUBLE' | 'SINGLE';
  status: 'Clean' | 'Dirty' | 'Cleaning';
  assignedTo?: string; // User ID
}

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  status: 'Pending' | 'Checked-In' | 'Checked-Out';
  stayTime: string;
  charge: number;
}
