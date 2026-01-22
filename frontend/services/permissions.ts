
import { UserRole, ActionType } from '../types';

export const ROLE_DEFAULT_ROUTES: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/dashboard',
  [UserRole.RECEPTION]: '/dashboard',
  [UserRole.CLEANER]: '/dashboard', 
};

const PERMISSIONS: Record<UserRole, ActionType[]> = {
  [UserRole.ADMIN]: [
    'MANAGE_USERS',
    'VIEW_REPORTS',
    'CHECK_IN_OUT',
    'ASSIGN_CLEANERS',
    'UPDATE_CLEANING_STATUS'
  ],
  [UserRole.RECEPTION]: [
    'CHECK_IN_OUT',
    'ASSIGN_CLEANERS',
    'UPDATE_CLEANING_STATUS'
  ],
  [UserRole.CLEANER]: [
    'UPDATE_CLEANING_STATUS'
  ], 
};

export const canAccess = (role: UserRole | undefined, action: ActionType): boolean => {
  if (!role) return false;
  return PERMISSIONS[role].includes(action);
};

export const isRouteAllowed = (role: UserRole | undefined, path: string): boolean => {
  if (!role) return false;

  switch (path) {
    case '/dashboard':
      return true; // Everyone sees their own version of the dashboard
    case '/rooms':
    case '/reservations':
    case '/housekeeping':
      return role === UserRole.ADMIN || role === UserRole.RECEPTION;
    case '/users':
      return role === UserRole.ADMIN;
    default:
      return false;
  }
};
