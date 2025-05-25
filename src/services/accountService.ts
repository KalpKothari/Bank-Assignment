import { v4 as uuidv4 } from 'uuid';
import { customers, updateCustomerBalance } from './bankerService';

// Get the customer ID for the logged-in user (in a real app, this would come from authentication)
const DEMO_CUSTOMER_ID = customers[0].id;

export const getAccountBalance = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const customer = customers.find(c => c.id === DEMO_CUSTOMER_ID);
  return { balance: customer?.balance || 0 };
};

export const getTransactions = async () => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const customer = customers.find(c => c.id === DEMO_CUSTOMER_ID);
  return customer?.transactions || [];
};

export const getRecentTransactions = async (limit: number) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const customer = customers.find(c => c.id === DEMO_CUSTOMER_ID);
  return (customer?.transactions || [])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

interface TransactionParams {
  type: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
}

export const makeTransaction = async (params: TransactionParams) => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { type, amount, description } = params;
  
  const customer = customers.find(c => c.id === DEMO_CUSTOMER_ID);
  if (!customer) {
    throw new Error('Customer not found');
  }
  
  // Validate transaction
  if (type === 'withdrawal' && amount > customer.balance) {
    throw new Error('Insufficient funds');
  }
  
  // Update balance
  const newBalance = type === 'deposit' 
    ? customer.balance + amount 
    : customer.balance - amount;
  
  // Create transaction record
  const transaction = {
    id: uuidv4(),
    type,
    amount,
    date: new Date().toISOString(),
    description
  };
  
  // Update customer data
  updateCustomerBalance(DEMO_CUSTOMER_ID, newBalance, transaction);
  
  return {
    success: true,
    transactionId: transaction.id,
    newBalance
  };
};