
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from './context/HotelContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import Reservations from './pages/Reservations';
import Housekeeping from './pages/Housekeeping';
import Users from './pages/Users';

const App: React.FC = () => {
  return (
    <HotelProvider>
      <AuthProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/rooms" element={
              <ProtectedRoute>
                <Layout><Rooms /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/reservations" element={
              <ProtectedRoute>
                <Layout><Reservations /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/housekeeping" element={
              <ProtectedRoute>
                <Layout><Housekeeping /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <Layout><Users /></Layout>
              </ProtectedRoute>
            } />

            {/* Default Redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </HotelProvider>
  );
};

export default App;
