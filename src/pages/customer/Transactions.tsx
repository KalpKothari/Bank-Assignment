import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, X, Filter, ArrowDownAZ, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAccountBalance, getTransactions, makeTransaction } from '../../services/accountService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import TransactionModal from '../../components/TransactionModal';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description?: string;
}

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const CustomerTransactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalType, setModalType] = useState<'deposit' | 'withdrawal' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balance
        const balanceData = await getAccountBalance();
        setBalance(balanceData.balance);
        
        // Fetch transactions
        const transactionsData = await getTransactions();
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    // Apply filters and search
    let result = [...transactions];
    
    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }
    
    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.type.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term)) ||
        t.amount.toString().includes(term)
      );
    }
    
    // Sort
    result = sortTransactions(result, sortOrder);
    
    setFilteredTransactions(result);
  }, [transactions, typeFilter, searchTerm, sortOrder]);

  const sortTransactions = (items: Transaction[], order: SortOrder) => {
    return [...items].sort((a, b) => {
      if (order === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (order === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (order === 'amount-desc') {
        return b.amount - a.amount;
      } else { // amount-asc
        return a.amount - b.amount;
      }
    });
  };

  const handleTransactionSubmit = async (type: 'deposit' | 'withdrawal', amount: number) => {
    try {
      // Call API to make transaction
      const result = await makeTransaction({ type, amount });
      
      // Update balance
      setBalance(prevBalance => 
        type === 'deposit' 
          ? prevBalance + amount 
          : prevBalance - amount
      );
      
      // Add new transaction to the list
      const newTransaction: Transaction = {
        id: result.transactionId,
        type,
        amount,
        date: new Date().toISOString(),
      };
      
      setTransactions(prev => [newTransaction, ...prev]);
      
      // Close modal
      setModalType(null);
    } catch (error) {
      console.error('Transaction error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your deposits and withdrawals</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <motion.button
            onClick={() => setModalType('deposit')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-success-500 hover:bg-success-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Deposit
          </motion.button>
          <motion.button
            onClick={() => setModalType('withdrawal')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-error-500 hover:bg-error-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
          >
            <TrendingDown className="mr-2 h-4 w-4" />
            Withdraw
          </motion.button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <h2 className="text-lg font-medium text-gray-700 mb-3">Current Balance</h2>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(balance)}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <h2 className="text-lg font-medium text-gray-700 mb-2 sm:mb-0">Transaction History</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {showFilters ? <X className="h-4 w-4 ml-1" /> : null}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 border-b border-gray-200 pb-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Search transactions"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    id="type-filter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as 'all' | 'deposit' | 'withdrawal')}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits Only</option>
                    <option value="withdrawal">Withdrawals Only</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-1">
                    <ArrowDownAZ className="h-4 w-4 inline mr-1" />
                    Sort By
                  </label>
                  <select
                    id="sort-order"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="amount-desc">Amount (High to Low)</option>
                    <option value="amount-asc">Amount (Low to High)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transactions List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between py-4 border-b border-gray-200">
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
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-2 ${
                          transaction.type === 'deposit' 
                            ? 'bg-success-500/10 text-success-500' 
                            : 'bg-error-500/10 text-error-500'
                        }`}>
                          {transaction.type === 'deposit' 
                            ? <TrendingUp className="h-4 w-4" /> 
                            : <TrendingDown className="h-4 w-4" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span className={
                        transaction.type === 'deposit' 
                          ? 'text-success-500' 
                          : 'text-error-500'
                      }>
                        {transaction.type === 'deposit' ? '+' : '-'} 
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No transactions found</p>
            {(searchTerm || typeFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                }}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Transaction Modals */}
      <TransactionModal
        type={modalType}
        currentBalance={balance}
        onClose={() => setModalType(null)}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default CustomerTransactions;