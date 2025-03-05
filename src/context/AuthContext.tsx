//AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../Api/apiClient';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  username?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ email, password });
      const { access_token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Fetch user data from backend to get username
      // For now, we'll use the email as a fallback
      const userObj = { email, username: email };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await authApi.register({ username, email, password });
      // After successful registration, log the user in
      // We'll store the username provided during registration
      const userObj = { email, username };
      localStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
      
      // Now login to get the token
      const response = await authApi.login({ email, password });
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loading,
        error
      }}
    >
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