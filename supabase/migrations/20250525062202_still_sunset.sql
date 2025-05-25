/*
  # Create transactions schema

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, either 'deposit' or 'withdrawal')
      - `amount` (numeric, transaction amount)
      - `description` (text, optional)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on transactions table
    - Add policies for:
      - Users can read their own transactions
      - Users can insert their own transactions
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  type text CHECK (type IN ('deposit', 'withdrawal')) NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  description text,
  created_at timestamptz DEFAULT now(),
  
  -- Add a balance snapshot for each transaction
  balance_after numeric NOT NULL
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create function to get current balance
CREATE OR REPLACE FUNCTION get_current_balance(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
AS $$
DECLARE
  current_balance numeric;
BEGIN
  SELECT COALESCE(
    (
      SELECT balance_after
      FROM transactions
      WHERE transactions.user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    ),
    0
  ) INTO current_balance;
  
  RETURN current_balance;
END;
$$;