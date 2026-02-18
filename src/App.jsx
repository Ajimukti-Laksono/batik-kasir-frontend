import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import ReportsPage from './pages/ReportsPage';
import TransactionsPage from './pages/TransactionsPage';
import UsersPage from './pages/UsersPage';
import CategoriesPage from './pages/CategoriesPage';

// Protected Route component
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading, hasRole } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#423526] to-[#684F33]">
      <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !hasRole(roles)) return <Navigate to="/pos" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/pos" element={
        <ProtectedRoute>
          <POSPage />
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <ProductsPage />
        </ProtectedRoute>
      } />
      
      <Route path="/categories" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <CategoriesPage />
        </ProtectedRoute>
      } />

      <Route path="/transactions" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <TransactionsPage />
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['admin', 'manager']}>
          <ReportsPage />
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute roles={['admin']}>
          <UsersPage />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
