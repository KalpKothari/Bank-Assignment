import { v4 as uuidv4 } from 'uuid';

interface LoginParams {
  accountNumber?: string;
  adminCode?: string;
  password: string;
  role: 'customer' | 'banker';
}

interface UserData {
  id: string;
  username: string;
  role: 'customer' | 'banker';
  token: string;
}

// Demo credentials
const DEMO_CREDENTIALS = {
  customers: [
    { accountNumber: '1001234567', password: 'customer123', username: 'John Doe' },
    { accountNumber: '1001234568', password: 'customer456', username: 'Jane Smith' }
  ],
  bankers: [
    { adminCode: 'ADMIN001', password: 'banker123', username: 'Bank Admin' },
    { adminCode: 'ADMIN002', password: 'banker456', username: 'Senior Manager' }
  ]
};

export const loginUser = async (params: LoginParams): Promise<UserData> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (params.role === 'customer') {
    const customer = DEMO_CREDENTIALS.customers.find(
      c => c.accountNumber === params.accountNumber && c.password === params.password
    );
    
    if (!customer) {
      throw new Error('Invalid account number or password');
    }
    
    return {
      id: uuidv4(),
      username: customer.username,
      role: 'customer',
      token: uuidv4()
    };
  } else {
    const banker = DEMO_CREDENTIALS.bankers.find(
      b => b.adminCode === params.adminCode && b.password === params.password
    );
    
    if (!banker) {
      throw new Error('Invalid admin code or password');
    }
    
    return {
      id: uuidv4(),
      username: banker.username,
      role: 'banker',
      token: uuidv4()
    };
  }
};

// Export demo credentials for display purposes
export const getDemoCredentials = () => ({
  customer: DEMO_CREDENTIALS.customers[0],
  banker: DEMO_CREDENTIALS.bankers[0]
});