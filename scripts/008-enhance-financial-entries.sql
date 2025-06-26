-- Add customer_id to income_entries table
ALTER TABLE income_entries 
ADD COLUMN customer_id VARCHAR REFERENCES customers(mid);

-- Create financial_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS financial_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default income categories
INSERT INTO financial_categories (name, type, description) VALUES
('Ürün Satışları', 'income', 'Ürün satışlarından elde edilen gelirler'),
('Hizmet Gelirleri', 'income', 'Sunulan hizmetlerden elde edilen gelirler'),
('Faiz Gelirleri', 'income', 'Banka faizleri ve yatırım gelirleri'),
('Kira Gelirleri', 'income', 'Gayrimenkul kira gelirleri'),
('Diğer Gelirler', 'income', 'Diğer çeşitli gelir kaynakları')
ON CONFLICT DO NOTHING;

-- Insert default expense categories
INSERT INTO financial_categories (name, type, description) VALUES
('Ofis Giderleri', 'expense', 'Ofis kirası, elektrik, su, internet vb.'),
('Personel Giderleri', 'expense', 'Maaş, SGK, vergi vb. personel maliyetleri'),
('Malzeme Giderleri', 'expense', 'Hammadde ve malzeme alımları'),
('Pazarlama Giderleri', 'expense', 'Reklam, tanıtım ve pazarlama faaliyetleri'),
('Ulaşım Giderleri', 'expense', 'Yakıt, araç bakım, ulaşım masrafları'),
('Vergi ve Harçlar', 'expense', 'Çeşitli vergi ve harç ödemeleri'),
('Diğer Giderler', 'expense', 'Diğer çeşitli gider kalemleri')
ON CONFLICT DO NOTHING;
