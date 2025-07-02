-- Create financial_entries table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.financial_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    entry_date DATE NOT NULL,
    category TEXT,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chart_of_accounts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense', 'cogs')),
    parent_id UUID REFERENCES chart_of_accounts(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'tech', 'acc')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Income entries table
CREATE TABLE IF NOT EXISTS income_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  customer_id TEXT REFERENCES customers(mid),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense entries table  
CREATE TABLE IF NOT EXISTS expense_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update user_profiles table structure if needed
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_entries_date ON income_entries(date);
CREATE INDEX IF NOT EXISTS idx_income_entries_customer ON income_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_expense_entries_date ON expense_entries(date);
CREATE INDEX IF NOT EXISTS idx_expense_entries_supplier ON expense_entries(supplier_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(id);

-- Insert some default chart of accounts
INSERT INTO public.chart_of_accounts (code, name, type, description) VALUES
('100', 'Kasa', 'asset', 'Nakit para'),
('101', 'Banka', 'asset', 'Banka hesapları'),
('120', 'Alıcılar', 'asset', 'Müşteri alacakları'),
('200', 'Satıcılar', 'liability', 'Tedarikçi borçları'),
('300', 'Sermaye', 'equity', 'Özkaynak'),
('400', 'Satış Gelirleri', 'revenue', 'Satış gelirleri'),
('500', 'Genel Giderler', 'expense', 'Genel işletme giderleri'),
('600', 'Satılan Malın Maliyeti', 'cogs', 'Satılan malın maliyeti')
ON CONFLICT (code) DO NOTHING;

-- Insert some sample data if tables are empty
INSERT INTO income_entries (amount, description, date, category)
SELECT 1500.00, 'Örnek Gelir Kaydı', CURRENT_DATE, 'Satış'
WHERE NOT EXISTS (SELECT 1 FROM income_entries LIMIT 1);

INSERT INTO expense_entries (amount, description, date, category)  
SELECT 500.00, 'Örnek Gider Kaydı', CURRENT_DATE, 'Ofis Giderleri'
WHERE NOT EXISTS (SELECT 1 FROM expense_entries LIMIT 1);
