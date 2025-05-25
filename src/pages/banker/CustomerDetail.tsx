import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, TrendingDown, User, Wallet, Filter, Search, X } from 'lucide-react';
import { getCustomerDetails, getCustomerTransactions } from '../../services/bankerService';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Customer {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description?: string;
}

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        // Fetch customer details
        const customerData = await getCustomerDetails(id);
        setCustomer(customerData);
        
        // Fetch customer transactions
        const transactionsData = await getCustomerTransactions(id);
        setTransactions(transactionsData);
        setFilteredTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching customer details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

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
    
    // Sort by date (newest first)
    result = result.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setFilteredTransactions(result);
  }, [transactions, typeFilter, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-primary-700 text-xl">Loading...</div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-700">Customer not found</p>
        <Link
          to="/banker/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          to="/banker/dashboard"
          className="mr-4 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Customer Details</h1>
      </div>

      {/* Customer Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-lg shadow-card p-6"
      >
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0 flex justify-center md:justify-start">
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-10 w-10 text-primary-700" />
            </div>
          </div>
          <div className="md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer Name</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{customer.username}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{customer.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Customer Since</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">{formatDate(customer.createdAt)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Balance Card */}
      <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-primary-500">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-medium text-gray-700">Current Balance</h2>
          <Wallet className="h-6 w-6 text-primary-500" />
        </div>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(customer.balance)}
        </p>
      </div>

      {/* Transactions */}
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

        {/* Filters */}
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-4 border-b border-gray-200 pb-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </motion.div>
        )}

        {/* Transactions Table */}
        {filteredTransactions.length > 0 ? (
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
    </div>
  );
};

export default CustomerDetail;