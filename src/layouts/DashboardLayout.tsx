import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, LogOut, Menu, X, LayoutDashboard, ReceiptText, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCustomer = user?.role === 'customer';
  
  const navItems = isCustomer
    ? [
        { path: '/customer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/customer/transactions', label: 'Transactions', icon: <ReceiptText className="w-5 h-5" /> },
      ]
    : [
        { path: '/banker/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { path: '/banker/customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
      ];

  const isActive = (path: string) => {
    // Handle nested paths like /banker/customers/123
    if (path === '/banker/customers' && location.pathname.startsWith('/banker/customers/')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white shadow-nav">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Building2 className="h-8 w-8 text-primary-700" />
                <span className="ml-2 text-xl font-semibold text-primary-800">Modern Bank</span>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
              >
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-700">
                  Welcome, {user?.username}
                </div>
                <div className="h-6 border-l border-gray-300"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center text-sm font-medium text-gray-500 hover:text-primary-700 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <motion.div 
          className="md:hidden bg-white shadow-lg"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  isActive(item.path) 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } block px-3 py-2 rounded-md text-base font-medium flex items-center`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left flex items-center"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
              <div className="flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`${
                        isActive(item.path)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.label}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="p-4">
                <div className="bg-primary-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-primary-800">Logged in as:</div>
                  <div className="text-sm text-gray-600">{user?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;