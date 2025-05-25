import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFoundPage: React.FC = () => {
  const { user } = useAuth();
  
  const getHomePath = () => {
    if (!user) return '/login';
    return user.role === 'customer' ? '/customer/dashboard' : '/banker/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-primary-500">404</h1>
        <h2 className="mt-4 text-3xl font-bold text-gray-900">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link
            to={getHomePath()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;