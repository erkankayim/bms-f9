-- Income entries table
CREATE TABLE IF NOT EXISTS income_entries (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    incoming_amount DECIMAL(10,2) NOT NULL,
    source TEXT,
    entry_date DATE NOT NULL,
    notes TEXT,
    payment_method TEXT DEFAULT 'cash',
    customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expense entries table
CREATE TABLE IF NOT EXISTS expense_entries (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    outgoing_amount DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    entry_date DATE NOT NULL,
    notes TEXT,
    payment_method TEXT DEFAULT 'cash',
    supplier_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        ALTER TABLE income_entries ADD CONSTRAINT fk_income_customer 
        FOREIGN KEY (customer_id) REFERENCES customers(mid);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'suppliers') THEN
        ALTER TABLE expense_entries ADD CONSTRAINT fk_expense_supplier 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_income_entries_date ON income_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_income_entries_customer ON income_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_expense_entries_date ON expense_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_expense_entries_supplier ON expense_entries(supplier_id);

-- Enable RLS (Row Level Security)
ALTER TABLE income_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY IF NOT EXISTS "Users can view all income entries" ON income_entries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can insert income entries" ON income_entries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update income entries" ON income_entries
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can delete income entries" ON income_entries
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can view all expense entries" ON expense_entries
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can insert expense entries" ON expense_entries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can update expense entries" ON expense_entries
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Users can delete expense entries" ON expense_entries
    FOR DELETE USING (auth.role() = 'authenticated');
