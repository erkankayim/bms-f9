-- Create financial_entries table to replace the old income_entries and expense_entries
CREATE TABLE IF NOT EXISTS financial_entries (
    id SERIAL PRIMARY KEY,
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('income', 'expense')),
    
    -- Common fields
    description TEXT NOT NULL,
    entry_date DATE NOT NULL,
    category_id INTEGER REFERENCES financial_categories(id),
    payment_method VARCHAR(50) NOT NULL,
    invoice_number VARCHAR(100),
    notes TEXT,
    
    -- Income specific fields
    incoming_amount DECIMAL(15,2),
    source VARCHAR(100),
    customer_id VARCHAR(50) REFERENCES customers(mid),
    
    -- Expense specific fields
    expense_amount DECIMAL(15,2),
    payment_amount DECIMAL(15,2),
    expense_title VARCHAR(200),
    expense_source VARCHAR(100),
    supplier_id INTEGER REFERENCES suppliers(id),
    receipt_url TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_entries_type ON financial_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_financial_entries_date ON financial_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_financial_entries_category ON financial_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_customer ON financial_entries(customer_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_supplier ON financial_entries(supplier_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_financial_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_entries_updated_at
    BEFORE UPDATE ON financial_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_entries_updated_at();

-- Migrate existing data if tables exist
DO $$
BEGIN
    -- Migrate income_entries if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'income_entries') THEN
        INSERT INTO financial_entries (
            entry_type, description, entry_date, category_id, payment_method, 
            invoice_number, notes, incoming_amount, source, customer_id, created_at
        )
        SELECT 
            'income', description, entry_date, category_id, payment_method,
            invoice_number, notes, incoming_amount, source, customer_id, created_at
        FROM income_entries
        WHERE NOT EXISTS (
            SELECT 1 FROM financial_entries fe 
            WHERE fe.entry_type = 'income' 
            AND fe.description = income_entries.description 
            AND fe.entry_date = income_entries.entry_date
        );
    END IF;
    
    -- Migrate expense_entries if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'expense_entries') THEN
        INSERT INTO financial_entries (
            entry_type, description, entry_date, category_id, payment_method,
            invoice_number, notes, expense_amount, payment_amount, expense_title,
            expense_source, supplier_id, receipt_url, created_at
        )
        SELECT 
            'expense', description, entry_date, category_id, payment_method,
            invoice_number, notes, expense_amount, payment_amount, expense_title,
            expense_source, supplier_id, receipt_url, created_at
        FROM expense_entries
        WHERE NOT EXISTS (
            SELECT 1 FROM financial_entries fe 
            WHERE fe.entry_type = 'expense' 
            AND fe.description = expense_entries.description 
            AND fe.entry_date = expense_entries.entry_date
        );
    END IF;
END $$;
