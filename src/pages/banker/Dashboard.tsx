import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Users, ArrowRight, ArrowUpRight, UserCheck, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllCustomers, getBankStats } from '../../services/bankerService';
import { formatCurrency } from '../../utils/formatters';

interface Customer {
  id: string;
  username: string;
  email: string;
  balance: number;
}

interface BankStats {
  totalCustomers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBalance: number;
}

const BankerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<BankStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersData = await getAllCustomers();
        setCustomers(customersData);
        setFilteredCustomers(customersData);
        
        // Fetch bank stats
        const statsData = await getBankStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching banker dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const filtered = customers.filter(customer => 
        customer.username.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Management</h1>
          <p className="text-gray-600">Monitor customers and transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-card p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Total Customers */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-primary-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Total Customers</h2>
              <UserCheck className="h-6 w-6 text-primary-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {stats?.totalCustomers || 0}
            </p>
            <p className="text-sm text-gray-500">Active accounts</p>
          </div>

          {/* Total Balance */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-accent-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Total Balance</h2>
              <Users className="h-6 w-6 text-accent-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(stats?.totalBalance || 0)}
            </p>
            <p className="text-sm text-gray-500">All customer accounts</p>
          </div>

          {/* Total Deposits */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-success-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Total Deposits</h2>
              <ArrowUp className="h-6 w-6 text-success-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(stats?.totalDeposits || 0)}
            </p>
            <p className="text-sm text-gray-500">All time deposits</p>
          </div>

          {/* Total Withdrawals */}
          <div className="bg-white rounded-lg shadow-card p-6 border-l-4 border-error-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">Total Withdrawals</h2>
              <ArrowDown className="h-6 w-6 text-error-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {formatCurrency(stats?.totalWithdrawals || 0)}
            </p>
            <p className="text-sm text-gray-500">All time withdrawals</p>
          </div>
        </motion.div>
      )}

      {/* Customers List */}
      <div className="bg-white rounded-lg shadow-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-medium text-gray-700 mb-2 sm:mb-0">Customer Accounts</h2>
          <div className="w-full sm:w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search customers"
              />
            </div>
          </div>
        </div>

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
        ) : filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="font-medium text-primary-700">
                            {customer.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(customer.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/banker/customers/${customer.id}`}
                        className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                      >
                        View Details
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">No customers found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankerDashboard;