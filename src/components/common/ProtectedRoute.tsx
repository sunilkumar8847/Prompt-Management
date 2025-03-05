//ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Add a check for token expiration
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // JWT tokens are in format: header.payload.signature
          const payload = token.split('.')[1];
          // Decode the base64 payload
          const decodedPayload = JSON.parse(atob(payload));
          
          // Check if token is expired
          if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
            // Token expired, clear localStorage and force logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
          // If there's an error parsing the token, better to logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    };

    checkTokenExpiration();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;