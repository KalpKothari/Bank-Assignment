import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex flex-col md:flex-row">
      {/* Left side - Brand */}
      <motion.div 
        className="md:w-1/2 p-8 flex flex-col justify-center items-center text-center md:text-left"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md mx-auto md:mx-0">
          <div className="flex justify-center md:justify-start mb-6">
            <div className="flex items-center">
              <Building2 className="h-10 w-10 text-primary-700" />
              <h1 className="text-3xl font-bold text-primary-800 ml-2">Modern Bank</h1>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Banking made simple</h2>
          <p className="text-gray-600 mb-8">
            Secure, fast, and reliable banking services for all your financial needs.
            Experience the next generation of banking with our intuitive platform.
          </p>
          
          <div className="hidden md:block">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-card">
              <div className="flex items-center mb-4">
                <div className="bg-primary-100 p-2 rounded-full">
                  <svg className="h-6 w-6 text-primary-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="ml-3 font-medium text-gray-800">Bank-grade Security</h3>
              </div>
              <p className="text-sm text-gray-600">Your data is encrypted and protected with the highest security standards.</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Right side - Auth Form */}
      <motion.div 
        className="flex-1 bg-white rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-card flex justify-center items-center p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;