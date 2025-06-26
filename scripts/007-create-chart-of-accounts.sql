-- Hesap Planı Tablosu
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'Cost of Goods Sold')),
    parent_account_id INTEGER REFERENCES chart_of_accounts(id) ON DELETE SET NULL, -- Hiyerarşik yapı için
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ana hesap türleri için örnekler (isteğe bağlı, başlangıç verisi olarak eklenebilir)
-- INSERT INTO chart_of_accounts (account_code, account_name, account_type) VALUES
-- ('1', 'Varlıklar', 'Asset'),
-- ('2', 'Yükümlülükler', 'Liability'),
-- ('3', 'Özkaynaklar', 'Equity'),
-- ('4', 'Gelirler', 'Revenue'),
-- ('5', 'Giderler', 'Expense'),
-- ('6', 'Satılan Malın Maliyeti', 'Cost of Goods Sold')
-- ON CONFLICT (account_code) DO NOTHING;

-- updated_at sütununu otomatik güncellemek için trigger
CREATE OR REPLACE FUNCTION update_chart_of_accounts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chart_of_accounts_updated_at
BEFORE UPDATE ON chart_of_accounts
FOR EACH ROW
EXECUTE FUNCTION update_chart_of_accounts_updated_at_column();

COMMENT ON TABLE chart_of_accounts IS 'İşletmenin mali hesaplarının yapılandırıldığı hesap planı.';
COMMENT ON COLUMN chart_of_accounts.account_type IS 'Hesap türü: Asset, Liability, Equity, Revenue, Expense, Cost of Goods Sold.';
COMMENT ON COLUMN chart_of_accounts.parent_account_id IS 'Bu hesabın bağlı olduğu üst hesap (hiyerarşi için).';
