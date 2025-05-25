import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import BankerLoginPage from './pages/BankerLoginPage';
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerTransactions from './pages/customer/Transactions';
import BankerDashboard from './pages/banker/Dashboard';
import CustomerDetail from './pages/banker/CustomerDetail';
import NotFoundPage from './pages/NotFoundPage';

// Auth provider
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/banker/login" element={<BankerLoginPage />} />
          </Route>

          {/* Customer Routes */}
          <Route 
            element={
              <ProtectedRoute role="customer">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/transactions" element={<CustomerTransactions />} />
          </Route>

          {/* Banker Routes */}
          <Route 
            element={
              <ProtectedRoute role="banker">
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/banker/dashboard" element={<BankerDashboard />} />
            <Route path="/banker/customers/:id" element={<CustomerDetail />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </AuthProvider>
  );
}

export default App;