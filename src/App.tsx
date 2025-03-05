// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <div className="flex-1 overflow-y-auto">
                      <Dashboard />
                    </div>
                  </>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;