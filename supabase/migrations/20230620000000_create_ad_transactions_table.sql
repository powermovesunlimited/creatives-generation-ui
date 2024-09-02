-- Create ad_transactions table
CREATE TABLE IF NOT EXISTS ad_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  transaction_id TEXT UNIQUE NOT NULL,
  ad_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ad_transactions_transaction_id ON ad_transactions(transaction_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ad_transactions_user_id ON ad_transactions(user_id);

-- Enable RLS
ALTER TABLE ad_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow insert for authenticated users
CREATE POLICY insert_own_transactions ON ad_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy to allow select for authenticated users
CREATE POLICY select_own_transactions ON ad_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create policy to allow all for service role
CREATE POLICY service_role_all ON ad_transactions
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);