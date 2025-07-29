import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/UserContext';
import Login from './pages/auth/Login';
import CredentialingDashboard from './pages/CredentialingDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppRoutes = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading application..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <CredentialingDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Legacy redirects */}
      <Route path="/payer/*" element={<Navigate to="/dashboard" />} />
      <Route path="/provider/*" element={<Navigate to="/dashboard" />} />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
