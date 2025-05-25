import { v4 as uuidv4 } from 'uuid';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  date: string;
  description?: string;
}

interface Customer {
  id: string;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  transactions: Transaction[];
}

// Mock data with transactions array inside each customer
export const customers: Customer[] = [
  {
    id: uuidv4(),
    username: 'johndoe',
    email: 'john.doe@example.com',
    balance: 5000,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    transactions: [
      {
        id: uuidv4(),
        type: 'deposit',
        amount: 2000,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Initial deposit'
      },
      {
        id: uuidv4(),
        type: 'withdrawal',
        amount: 500,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'ATM withdrawal'
      }
    ]
  },
  {
    id: uuidv4(),
    username: 'janedoe',
    email: 'jane.doe@example.com',
    balance: 7500,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    transactions: []
  }
];

export const getAllCustomers = async () => {
  await new Promise(resolve => setTimeout(resolve, 700));
  return [...customers];
};

export const getCustomerDetails = async (customerId: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const customer = customers.find(c => c.id === customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  return customer;
};

export const getCustomerTransactions = async (customerId: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const customer = customers.find(c => c.id === customerId);
  return customer?.transactions || [];
};

export const getBankStats = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const totalBalance = customers.reduce((sum, customer) => sum + customer.balance, 0);
  
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  
  customers.forEach(customer => {
    customer.transactions.forEach(transaction => {
      if (transaction.type === 'deposit') {
        totalDeposits += transaction.amount;
      } else {
        totalWithdrawals += transaction.amount;
      }
    });
  });
  
  return {
    totalCustomers: customers.length,
    totalBalance,
    totalDeposits,
    totalWithdrawals
  };
};

export const updateCustomerBalance = (
  customerId: string, 
  newBalance: number, 
  transaction: Transaction
) => {
  const customerIndex = customers.findIndex(c => c.id === customerId);
  if (customerIndex === -1) return;
  
  customers[customerIndex].balance = newBalance;
  customers[customerIndex].transactions.unshift(transaction);
};