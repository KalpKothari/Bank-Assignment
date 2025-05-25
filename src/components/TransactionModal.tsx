import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface TransactionModalProps {
  type: 'deposit' | 'withdrawal' | null;
  currentBalance: number;
  onClose: () => void;
  onSubmit: (type: 'deposit' | 'withdrawal', amount: number) => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  type,
  currentBalance,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (type) {
      setAmount('');
      setError('');
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    
    if (type === 'withdrawal' && numAmount > currentBalance) {
      setError('Insufficient funds');
      return;
    }

    setIsSubmitting(true);
    
    // Submit the transaction
    onSubmit(type as 'deposit' | 'withdrawal', numAmount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow only numbers and decimal point
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
      setError('');
    }
  };

  return (
    <AnimatePresence>
      {type && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden w-full max-w-md mx-4 z-10"
          >
            <div className={`p-4 ${
              type === 'deposit' ? 'bg-success-500' : 'bg-error-500'
            } text-white flex justify-between items-center`}>
              <div className="flex items-center">
                {type === 'deposit' ? (
                  <TrendingUp className="h-6 w-6 mr-2" />
                ) : (
                  <TrendingDown className="h-6 w-6 mr-2" />
                )}
                <h2 className="text-lg font-semibold capitalize">{type}</h2>
              </div>
              <button onClick={onClose} className="text-white hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(currentBalance)}
                </p>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                    {type === 'deposit' ? 'Deposit' : 'Withdrawal'} Amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">$</span>
                    </div>
                    <input
                      type="text"
                      id="amount"
                      value={amount}
                      onChange={handleAmountChange}
                      className={`block w-full pl-8 pr-12 py-2 border ${
                        error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                      } rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none sm:text-sm`}
                      placeholder="0.00"
                      autoFocus
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">USD</span>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mt-2 flex items-center text-error-500 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !amount}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      type === 'deposit' 
                        ? 'bg-success-500 hover:bg-success-600 focus:ring-success-500' 
                        : 'bg-error-500 hover:bg-error-600 focus:ring-error-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      isSubmitting || !amount ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <>
                        Confirm {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TransactionModal;