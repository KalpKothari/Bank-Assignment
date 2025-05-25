import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'customer' | 'banker';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-primary-700 text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user?.role !== role) {
    // Redirect to appropriate dashboard if role doesn't match
    const redirectPath = user?.role === 'customer' 
      ? '/customer/dashboard' 
      : '/banker/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;