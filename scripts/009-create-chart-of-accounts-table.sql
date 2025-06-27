-- Hesap Planı Tablosu Oluşturma
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Varlık', 'Yükümlülük', 'Özkaynak', 'Gelir', 'Gider', 'Satılan Malın Maliyeti')),
    parent_id UUID REFERENCES chart_of_accounts(id) ON DELETE SET NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger fonksiyonu oluştur
CREATE OR REPLACE FUNCTION update_chart_of_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger oluştur
CREATE TRIGGER update_chart_of_accounts_updated_at
    BEFORE UPDATE ON chart_of_accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_chart_of_accounts_updated_at();

-- Örnek hesap verileri ekle
INSERT INTO chart_of_accounts (code, name, type, description) VALUES
('100', 'Kasa', 'Varlık', 'Nakit para kasası'),
('101', 'Banka', 'Varlık', 'Banka hesapları'),
('120', 'Ticari Alacaklar', 'Varlık', 'Müşterilerden alacaklar'),
('200', 'Ticari Borçlar', 'Yükümlülük', 'Tedarikçilere borçlar'),
('300', 'Sermaye', 'Özkaynak', 'İşletme sermayesi'),
('400', 'Satış Gelirleri', 'Gelir', 'Ürün ve hizmet satış gelirleri'),
('500', 'Genel Giderler', 'Gider', 'Genel işletme giderleri'),
('600', 'Satılan Malın Maliyeti', 'Satılan Malın Maliyeti', 'Satılan ürünlerin maliyeti')
ON CONFLICT (code) DO NOTHING;

-- İndeksler oluştur
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_code ON chart_of_accounts(code);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_type ON chart_of_accounts(type);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_parent_id ON chart_of_accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_is_active ON chart_of_accounts(is_active);

-- Tablo yorumları
COMMENT ON TABLE chart_of_accounts IS 'İşletmenin mali hesaplarının yapılandırıldığı hesap planı tablosu';
COMMENT ON COLUMN chart_of_accounts.code IS 'Hesap kodu (benzersiz)';
COMMENT ON COLUMN chart_of_accounts.name IS 'Hesap adı';
COMMENT ON COLUMN chart_of_accounts.type IS 'Hesap türü: Varlık, Yükümlülük, Özkaynak, Gelir, Gider, Satılan Malın Maliyeti';
COMMENT ON COLUMN chart_of_accounts.parent_id IS 'Üst hesap ID (hiyerarşi için)';
COMMENT ON COLUMN chart_of_accounts.is_active IS 'Hesabın aktif olup olmadığı';
