import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Lock, ArrowRight, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { loginUser, getDemoCredentials } from '../services/authService';

const LoginPage: React.FC = () => {
  const [accountNumber, setAccountNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const demoCredentials = getDemoCredentials();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountNumber || !password) {
      toast.error('Please enter both account number and password');
      return;
    }

    setIsLoading(true);
    
    try {
      const userData = await loginUser({ accountNumber, password, role: 'customer' });
      login(userData);
      toast.success('Successfully logged in!');
      navigate('/customer/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid account number or password');
    } finally {
      setIsLoading(false);
    }
  };

  const useDemoCredentials = () => {
    setAccountNumber(demoCredentials.customer.accountNumber);
    setPassword(demoCredentials.customer.password);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Login</h2>
        <p className="text-gray-600 mt-1">Welcome back! Please enter your details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CreditCard className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="accountNumber"
              name="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter your account number"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              Login <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center space-y-4">
        <p className="text-sm text-gray-600">
          Are you a banker?{' '}
          <Link to="/banker/login" className="font-medium text-primary-600 hover:text-primary-500">
            Login here
          </Link>
        </p>

        <div>
          <button
            onClick={() => setShowDemo(!showDemo)}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <Info className="h-4 w-4 mr-1" />
            Show Demo Credentials
          </button>
          
          {showDemo && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-4 bg-gray-50 rounded-lg text-left"
            >
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-700">Demo Account:</p>
                <p className="text-sm text-gray-600">Account Number: {demoCredentials.customer.accountNumber}</p>
                <p className="text-sm text-gray-600">Password: {demoCredentials.customer.password}</p>
              </div>
              <button
                onClick={useDemoCredentials}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Use Demo Credentials
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;