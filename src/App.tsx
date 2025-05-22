import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { InventoryProvider } from './contexts/InventoryContext';
import { ExtensionProvider } from './contexts/ExtensionContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import InventoryPage from './pages/InventoryPage';
import AdminPage from './pages/AdminPage';
import Header from './components/layout/Header';
import { useAuth } from './contexts/AuthContext';

const ProtectedRoute: React.FC<{ 
  element: React.ReactElement; 
  requireAdmin?: boolean;
}> = ({ element, requireAdmin = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/inventory" replace />;
  }

  return element;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route 
        path="/inventory" 
        element={<ProtectedRoute element={<InventoryPage />} />} 
      />
      <Route 
        path="/admin" 
        element={<ProtectedRoute element={<AdminPage />} requireAdmin={true} />} 
      />
      <Route path="/" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <InventoryProvider>
          <ExtensionProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main className="container mx-auto px-4 py-8">
                <AppRoutes />
              </main>
            </div>
          </ExtensionProvider>
        </InventoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;