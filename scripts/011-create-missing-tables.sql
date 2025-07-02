CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'tech', 'acc')) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS income_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    incoming_amount DECIMAL(10,2) NOT NULL,
    source TEXT NOT NULL,
    invoice_number TEXT,
    payment_method TEXT NOT NULL,
    notes TEXT,
    customer_id TEXT REFERENCES customers(mid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expense_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    outgoing_amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT,
    supplier_id UUID REFERENCES suppliers(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense', 'cogs')) NOT NULL,
    parent_id INTEGER REFERENCES chart_of_accounts(id),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO chart_of_accounts (code, name, type, description) VALUES
('100', 'Kasa', 'asset', 'Nakit para'),
('101', 'Banka', 'asset', 'Banka hesapları'),
('120', 'Ticari Alacaklar', 'asset', 'Müşteri alacakları'),
('200', 'Ticari Borçlar', 'liability', 'Tedarikçi borçları'),
('300', 'Sermaye', 'equity', 'Şirket sermayesi'),
('600', 'Satış Gelirleri', 'income', 'Ürün ve hizmet satışları'),
('601', 'Hizmet Gelirleri', 'income', 'Sunulan hizmetler'),
('700', 'Genel Giderler', 'expense', 'Genel işletme giderleri'),
('701', 'Personel Giderleri', 'expense', 'Maaş ve personel maliyetleri')
ON CONFLICT (code) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_income_entries_date ON income_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_expense_entries_date ON expense_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view all profiles" ON user_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can view all income entries" ON income_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can view all expense entries" ON expense_entries FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can view all chart accounts" ON chart_of_accounts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can insert income entries" ON income_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can update income entries" ON income_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can delete income entries" ON income_entries FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can insert expense entries" ON expense_entries FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can update expense entries" ON expense_entries FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can delete expense entries" ON expense_entries FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can insert chart accounts" ON chart_of_accounts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can update chart accounts" ON chart_of_accounts FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can delete chart accounts" ON chart_of_accounts FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admins can manage user profiles" ON user_profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM user_profiles up 
        WHERE up.user_id = auth.uid() 
        AND up.role = 'admin'
    )
);
