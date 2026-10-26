import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import InspectorDashboard from '../pages/InspectorDashboard';
import OfficerDashboard from '../pages/OfficerDashboard';
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * AppRoutes - Central routing configuration for the entire application
 * All protected routes run through the ProtectedRoute component
 * which reads from AuthContext for authentication state
 */
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Field Inspector Dashboard */}
      <Route
        path="/inspector"
        element={
          <ProtectedRoute allowedRoles={['field_inspector', 'admin']}>
            <InspectorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Ward Officer Dashboard */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute allowedRoles={['ward_officer', 'admin']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
