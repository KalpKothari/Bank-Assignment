import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, TrendingUp, TrendingDown, Wallet, CreditCard, ReceiptText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAccountBalance, getRecentTransactions } from '../../services/accountService';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceData = await getAccountBalance();
        setBalance(balanceData.balance);
        
        // Fetch recent transactions
        const transactions = await getRecentTransactions(5);
        setRecentTransactions(transactions);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}</h1>
          <p className="text-gray-600">Here's an overview of your account</p>
        </div>
        <Link
          to="/customer/transactions"
          className="mt-2 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          View All Transactions
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-card p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Current Balance</h2>
              <Wallet className="h-6 w-6 text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {balance !== null ? formatCurrency(balance) : '—'}
            </p>
            <p className="text-sm text-gray-500">Available to spend</p>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-accent-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Recent Activity</h2>
              <ReceiptText className="h-6 w-6 text-accent-500" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Last transaction</p>
                {recentTransactions.length > 0 ? (
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(recentTransactions[0].amount)}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      {recentTransactions[0].type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                    </span>
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-gray-900">No recent transactions</p>
                )}
              </div>
              {recentTransactions.length > 0 && (
                <div className={`p-2 rounded-full ${
                  recentTransactions[0].type === 'deposit' 
                    ? 'bg-success-500/10 text-success-500' 
                    : 'bg-error-500/10 text-error-500'
                }`}>
                  {recentTransactions[0].type === 'deposit' 
                    ? <TrendingUp className="h-5 w-5" /> 
                    : <TrendingDown className="h-5 w-5" />}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-gray-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Quick Actions</h2>
              <CreditCard className="h-6 w-6 text-gray-500" />
            </div>
            <div className="space-y-2">
              <Link 
                to="/customer/transactions"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Deposit Funds
              </Link>
              <Link 
                to="/customer/transactions"
                className="block w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Withdraw Funds
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-700">Recent Transactions</h2>
          <Link 
            to="/customer/transactions"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all
          </Link>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-1">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-200 hover:bg-gray-50 rounded-md px-2 transition-colors"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-full mr-3 ${
                    transaction.type === 'deposit' 
                      ? 'bg-success-500/10 text-success-500' 
                      : 'bg-error-500/10 text-error-500'
                  }`}>
                    {transaction.type === 'deposit' 
                      ? <TrendingUp className="h-5 w-5" /> 
                      : <TrendingDown className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {transaction.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-medium ${
                  transaction.type === 'deposit' 
                    ? 'text-success-500' 
                    : 'text-error-500'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'} 
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;