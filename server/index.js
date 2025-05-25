import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
let db;

async function setupDatabase() {
  // Open database
  db = await open({
    filename: './bank.db',
    driver: sqlite3.Database
  });
  
  // Create Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('customer', 'banker')) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create Accounts table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      balance REAL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Create Transactions table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      type TEXT CHECK(type IN ('deposit', 'withdrawal')) NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES accounts (id)
    )
  `);
  
  // Check if we need to seed initial data
  const userCount = await db.get('SELECT COUNT(*) as count FROM users');
  
  if (userCount.count === 0) {
    await seedInitialData();
  }
}

async function seedInitialData() {
  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);
  
  // Create banker user
  const bankerId = uuidv4();
  await db.run(
    'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [bankerId, 'banker', 'banker@bank.com', hashedPassword, 'banker']
  );
  
  // Create customer users
  const customers = [
    { username: 'johndoe', email: 'john@example.com' },
    { username: 'janedoe', email: 'jane@example.com' },
    { username: 'alice', email: 'alice@example.com' }
  ];
  
  for (const customer of customers) {
    const customerId = uuidv4();
    
    // Insert user
    await db.run(
      'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)',
      [customerId, customer.username, customer.email, hashedPassword, 'customer']
    );
    
    // Create account
    const accountId = uuidv4();
    await db.run(
      'INSERT INTO accounts (id, user_id, balance) VALUES (?, ?, ?)',
      [accountId, customerId, 5000]
    );
    
    // Add some initial transactions
    const transactions = [
      { type: 'deposit', amount: 5000, description: 'Initial deposit' }
    ];
    
    for (const transaction of transactions) {
      await db.run(
        'INSERT INTO transactions (id, account_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), accountId, transaction.type, transaction.amount, transaction.description]
      );
    }
  }
  
  console.log('Initial data seeded successfully');
}

// JWT Secret
const JWT_SECRET = 'banking-system-secret-key';

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Routes

// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Validate input
    if (!username || !password || !role) {
      return res.status(400).json({ error: 'Please provide username, password, and role' });
    }
    
    // Find user
    const user = await db.get(
      'SELECT * FROM users WHERE username = ? AND role = ?',
      [username, role]
    );
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    // Return user data and token
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get account balance (for customers)
app.get('/api/account/balance', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const account = await db.get(
      'SELECT * FROM accounts WHERE user_id = ?',
      [req.user.id]
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({ balance: account.balance });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get transactions (for customers)
app.get('/api/account/transactions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const account = await db.get(
      'SELECT * FROM accounts WHERE user_id = ?',
      [req.user.id]
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const transactions = await db.all(
      `SELECT id, type, amount, description, created_at as date
       FROM transactions 
       WHERE account_id = ? 
       ORDER BY created_at DESC`,
      [account.id]
    );
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Make a transaction (deposit/withdrawal)
app.post('/api/account/transaction', auth, async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { type, amount, description } = req.body;
    
    // Validate input
    if (!type || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid transaction data' });
    }
    
    if (type !== 'deposit' && type !== 'withdrawal') {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
    
    // Get account
    const account = await db.get(
      'SELECT * FROM accounts WHERE user_id = ?',
      [req.user.id]
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if sufficient funds for withdrawal
    if (type === 'withdrawal' && amount > account.balance) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }
    
    // Update balance
    const newBalance = type === 'deposit' 
      ? account.balance + amount 
      : account.balance - amount;
    
    // Start transaction
    await db.run('BEGIN TRANSACTION');
    
    // Update account balance
    await db.run(
      'UPDATE accounts SET balance = ? WHERE id = ?',
      [newBalance, account.id]
    );
    
    // Create transaction record
    const transactionId = uuidv4();
    await db.run(
      'INSERT INTO transactions (id, account_id, type, amount, description) VALUES (?, ?, ?, ?, ?)',
      [transactionId, account.id, type, amount, description || null]
    );
    
    // Commit transaction
    await db.run('COMMIT');
    
    res.json({
      success: true,
      transactionId,
      newBalance
    });
  } catch (error) {
    // Rollback in case of error
    await db.run('ROLLBACK');
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all customers (for bankers)
app.get('/api/banker/customers', auth, async (req, res) => {
  try {
    if (req.user.role !== 'banker') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const customers = await db.all(`
      SELECT u.id, u.username, u.email, a.balance, u.created_at as createdAt
      FROM users u
      JOIN accounts a ON u.id = a.user_id
      WHERE u.role = 'customer'
    `);
    
    res.json(customers);
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer details (for bankers)
app.get('/api/banker/customers/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'banker') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    
    const customer = await db.get(`
      SELECT u.id, u.username, u.email, a.balance, u.created_at as createdAt
      FROM users u
      JOIN accounts a ON u.id = a.user_id
      WHERE u.id = ? AND u.role = 'customer'
    `, [id]);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error getting customer details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer transactions (for bankers)
app.get('/api/banker/customers/:id/transactions', auth, async (req, res) => {
  try {
    if (req.user.role !== 'banker') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { id } = req.params;
    
    // Get account
    const account = await db.get(
      'SELECT * FROM accounts WHERE user_id = ?',
      [id]
    );
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const transactions = await db.all(
      `SELECT id, type, amount, description, created_at as date
       FROM transactions 
       WHERE account_id = ? 
       ORDER BY created_at DESC`,
      [account.id]
    );
    
    res.json(transactions);
  } catch (error) {
    console.error('Error getting customer transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get bank stats (for bankers)
app.get('/api/banker/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'banker') {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get total customers
    const customersCount = await db.get(
      "SELECT COUNT(*) as count FROM users WHERE role = 'customer'"
    );
    
    // Get total balance
    const totalBalance = await db.get(
      "SELECT SUM(balance) as total FROM accounts"
    );
    
    // Get total deposits
    const totalDeposits = await db.get(
      "SELECT SUM(amount) as total FROM transactions WHERE type = 'deposit'"
    );
    
    // Get total withdrawals
    const totalWithdrawals = await db.get(
      "SELECT SUM(amount) as total FROM transactions WHERE type = 'withdrawal'"
    );
    
    res.json({
      totalCustomers: customersCount.count,
      totalBalance: totalBalance.total || 0,
      totalDeposits: totalDeposits.total || 0,
      totalWithdrawals: totalWithdrawals.total || 0
    });
  } catch (error) {
    console.error('Error getting bank stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
async function startServer() {
  try {
    await setupDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();