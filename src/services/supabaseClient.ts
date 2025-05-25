import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getCurrentBalance = async (userId: string) => {
  const { data, error } = await supabase
    .rpc('get_current_balance', { user_id: userId });
    
  if (error) throw error;
  return data || 0;
};

export const getTransactions = async () => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const createTransaction = async ({
  type,
  amount,
  description
}: {
  type: 'deposit' | 'withdrawal';
  amount: number;
  description?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get current balance
  const currentBalance = await getCurrentBalance(user.id);
  
  // Calculate new balance
  const newBalance = type === 'deposit' 
    ? currentBalance + amount 
    : currentBalance - amount;
    
  // Validate withdrawal
  if (type === 'withdrawal' && amount > currentBalance) {
    throw new Error('Insufficient funds');
  }

  // Create transaction
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      type,
      amount,
      description,
      balance_after: newBalance
    })
    .select()
    .single();
    
  if (error) throw error;
  return { transaction: data, newBalance };
};