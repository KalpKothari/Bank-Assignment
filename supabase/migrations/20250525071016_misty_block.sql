/*
  # Banking Transactions Schema

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, either 'deposit' or 'withdrawal')
      - `amount` (numeric, transaction amount)
      - `description` (text, optional)
      - `balance_after` (numeric, balance after transaction)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on transactions table
    - Add policies for authenticated users to:
      - View their own transactions
      - Create new transactions

  3. Functions
    - `get_current_balance`: Returns the current balance for a user
*/

DO $$ BEGIN
  -- Create transactions table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL,
    type text NOT NULL,
    amount numeric NOT NULL,
    description text,
    balance_after numeric NOT NULL,
    created_at timestamptz DEFAULT now(),
    CONSTRAINT transactions_type_check CHECK (type IN ('deposit', 'withdrawal')),
    CONSTRAINT transactions_amount_check CHECK (amount > 0),
    CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) ON DELETE CASCADE
  );

  -- Enable RLS
  ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END $$;

-- Drop existing policies if they exist
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
  DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_current_balance(uuid);

-- Create function to get current balance
CREATE OR REPLACE FUNCTION public.get_current_balance(user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance numeric;
BEGIN
  SELECT COALESCE(
    (
      SELECT balance_after
      FROM public.transactions
      WHERE transactions.user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    ),
    0
  ) INTO current_balance;
  
  RETURN current_balance;
END;
$$;