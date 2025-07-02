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
