-- Create financial_categories table
CREATE TABLE IF NOT EXISTS financial_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, type)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_financial_categories_type_active ON financial_categories(type, is_active);

-- Insert some default categories
INSERT INTO financial_categories (name, type, description) VALUES
-- Income categories
('Ürün Satışı', 'income', 'Ürün satışlarından elde edilen gelirler'),
('Hizmet Bedeli', 'income', 'Verilen hizmetlerden elde edilen gelirler'),
('Danışmanlık', 'income', 'Danışmanlık hizmetlerinden elde edilen gelirler'),
('Kira Geliri', 'income', 'Gayrimenkul kiralarından elde edilen gelirler'),
('Faiz Geliri', 'income', 'Banka faizlerinden elde edilen gelirler'),
('Diğer Gelirler', 'income', 'Diğer kaynaklardan elde edilen gelirler'),

-- Expense categories
('Ofis Giderleri', 'expense', 'Ofis ile ilgili genel giderler'),
('Pazarlama', 'expense', 'Pazarlama ve reklam giderleri'),
('Personel Giderleri', 'expense', 'Maaş, prim ve diğer personel giderleri'),
('Kira Gideri', 'expense', 'Ofis ve diğer gayrimenkul kira giderleri'),
('Ulaşım', 'expense', 'Ulaşım ve yakıt giderleri'),
('Teknoloji', 'expense', 'Yazılım, donanım ve teknoloji giderleri'),
('Vergi ve Harçlar', 'expense', 'Vergi, harç ve resmi giderler'),
('Diğer Giderler', 'expense', 'Diğer operasyonel giderler')
ON CONFLICT (name, type) DO NOTHING;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_financial_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_financial_categories_updated_at
    BEFORE UPDATE ON financial_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_financial_categories_updated_at();
