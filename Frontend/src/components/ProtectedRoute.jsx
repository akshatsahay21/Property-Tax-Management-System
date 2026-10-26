import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Wraps a route and redirects to login if:
 * 1. No valid token exists
 * 2. User's role is not in the allowedRoles list
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  // Wait until auth state is loaded from localStorage
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
   
    const redirectTo = (user?.role === 'ward_officer' || user?.role === 'admin') ? '/officer' : '/inspector';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default ProtectedRoute;
