import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { useHotel } from './HotelContext';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notify } = useHotel();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  // Initial load: Verify session
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUserString = localStorage.getItem('auth_user');

    if (savedToken && savedUserString) {
      try {
        const savedUser = JSON.parse(savedUserString) as User;
        setToken(savedToken);
        setUser(savedUser);
      } catch (e) {
        logout();
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userProfile } = response.data;

      // Map _id to id if necessary
      const user = { ...userProfile, id: userProfile.id || userProfile._id };

      setUser(user);
      setToken(token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      notify(`Welcome back, ${user.name}`, 'success');
      return true;
    } catch (error: any) {
      notify(error.response?.data?.message || 'Login failed', 'error');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
