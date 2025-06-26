-- Tedarikçiler tablosunu oluştur
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code TEXT UNIQUE, -- Kullanıcı tarafından atanabilir, opsiyonel benzersiz kod
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    postal_code TEXT,
    country TEXT, -- Ülke bilgisi eklendi
    tax_office TEXT,
    tax_number TEXT,
    iban TEXT, -- IBAN bilgisi eklendi
    website TEXT, -- Web sitesi eklendi
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ -- Soft delete için
);

-- updated_at sütununu otomatik güncellemek için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_supplier_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- suppliers tablosu için trigger
CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION update_supplier_updated_at_column();

-- İndeksler (performans için)
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_suppliers_deleted_at ON suppliers(deleted_at);

COMMENT ON COLUMN suppliers.supplier_code IS 'Tedarikçiye atanmış benzersiz kod (örn: SUP-001)';
COMMENT ON COLUMN suppliers.deleted_at IS 'Tedarikçinin silinme (arşivlenme) zaman damgası';
