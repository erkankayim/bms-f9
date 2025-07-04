-- Stok verilerini products tablosuna aktar
-- Önce mevcut ürünleri kontrol et ve güncelle, yoksa ekle

-- Geçici tablo oluştur
CREATE TEMP TABLE temp_stock_import (
    product_name TEXT,
    stock_code TEXT,
    quantity DECIMAL(10,2),
    location TEXT,
    min_stock DECIMAL(10,2),
    stock_status TEXT,
    entry_amount DECIMAL(10,2),
    sales_amount DECIMAL(10,2),
    return_amount DECIMAL(10,2)
);

-- Stok verilerini geçici tabloya ekle
INSERT INTO temp_stock_import (product_name, stock_code, quantity, location, min_stock, stock_status, entry_amount, sales_amount, return_amount) VALUES
('1000 W 12/220 V Tam Sinüs İnverter', 'ELC-S29', 0.0, '', 0.0, '', 0.0, 0.0, 0.0),
('1500 W 12/220 V Tam Sinüs İnverter', 'ELC-S30', 0.0, '', 0.0, '', 0.0, 0.0, 0.0),
('2000 W 12/220 V Tam Sinüs İnverter', 'ELC-S31', 0.0, '', 0.0, '', 0.0, 0.0, 0.0),
('2500 W 12/220 V Tam Sinüs İnverter', 'ELC-S32', 0.0, '', 0.0, '', 0.0, 0.0, 0.0),
('3000 W 12/220 V Tam Sinüs İnverter', 'ELC-S33', 0.0, '', 0.0, '', 0.0, 0.0, 0.0),
('12V 100Ah AGM Akü', 'BAT-AGM100', 0.0, '', 2.0, '', 0.0, 0.0, 0.0),
('12V 150Ah AGM Akü', 'BAT-AGM150', 0.0, '', 1.0, '', 0.0, 0.0, 0.0),
('12V 200Ah AGM Akü', 'BAT-AGM200', 0.0, '', 1.0, '', 0.0, 0.0, 0.0),
('Solar Şarj Kontrol Cihazı 30A', 'SOL-CC30', 0.0, '', 1.0, '', 0.0, 0.0, 0.0),
('Solar Şarj Kontrol Cihazı 60A', 'SOL-CC60', 0.0, '', 1.0, '', 0.0, 0.0, 0.0);

-- Önce kategori oluştur (eğer yoksa)
INSERT INTO categories (name, description, created_at, updated_at)
VALUES ('Elektronik', 'Elektronik ürünler ve aksesuarlar', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Kategori ID'sini al
DO $$
DECLARE
    elektronik_category_id INTEGER;
    temp_record RECORD;
    existing_product_id INTEGER;
BEGIN
    -- Kategori ID'sini al
    SELECT id INTO elektronik_category_id FROM categories WHERE name = 'Elektronik';
    
    -- Her stok kaydı için işlem yap
    FOR temp_record IN SELECT DISTINCT stock_code, product_name FROM temp_stock_import LOOP
        -- Mevcut ürünü kontrol et
        SELECT id INTO existing_product_id 
        FROM products 
        WHERE stock_code = temp_record.stock_code;
        
        IF existing_product_id IS NOT NULL THEN
            -- Mevcut ürünü güncelle
            UPDATE products SET
                name = temp_record.product_name,
                quantity_on_hand = (SELECT SUM(quantity) FROM temp_stock_import WHERE stock_code = temp_record.stock_code),
                minimum_stock_level = (SELECT MAX(min_stock) FROM temp_stock_import WHERE stock_code = temp_record.stock_code),
                purchase_price = 0.00, -- Alış fiyatı daha sonra manuel girilecek
                updated_at = NOW()
            WHERE id = existing_product_id;
            
            RAISE NOTICE 'Ürün güncellendi: % (%)', temp_record.product_name, temp_record.stock_code;
        ELSE
            -- Yeni ürün ekle
            INSERT INTO products (
                stock_code,
                name,
                description,
                category_id,
                quantity_on_hand,
                minimum_stock_level,
                purchase_price,
                selling_price,
                created_at,
                updated_at
            ) VALUES (
                temp_record.stock_code,
                temp_record.product_name,
                'Stok aktarımından eklenen ürün',
                elektronik_category_id,
                (SELECT SUM(quantity) FROM temp_stock_import WHERE stock_code = temp_record.stock_code),
                (SELECT MAX(min_stock) FROM temp_stock_import WHERE stock_code = temp_record.stock_code),
                0.00, -- Alış fiyatı daha sonra manuel girilecek
                0.00, -- Satış fiyatı daha sonra manuel girilecek
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Yeni ürün eklendi: % (%)', temp_record.product_name, temp_record.stock_code;
        END IF;
    END LOOP;
END $$;

-- Geçici tabloyu temizle
DROP TABLE temp_stock_import;

-- Sonuç raporu
SELECT 
    'Stok aktarımı tamamlandı!' as message,
    COUNT(*) as total_products
FROM products 
WHERE stock_code LIKE 'ELC-%' OR stock_code LIKE 'BAT-%' OR stock_code LIKE 'SOL-%';

-- Eklenen ürünleri listele
SELECT 
    stock_code,
    name,
    quantity_on_hand,
    minimum_stock_level,
    purchase_price,
    selling_price
FROM products 
WHERE stock_code LIKE 'ELC-%' OR stock_code LIKE 'BAT-%' OR stock_code LIKE 'SOL-%'
ORDER BY stock_code;
