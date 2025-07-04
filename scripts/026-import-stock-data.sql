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
('1000 W 12/220 V Tam Sinüs İnverter', 'ELC-S29', 0, '', 0, '', 0, 0, 0),
('1000 W 12/220 V Tam Sinüs İnverter', 'ELC-S29', 0, '', 0, '', 0, 0, 0),
('1500 W 12/220 V Tam Sinüs İnverter', 'ELC-S30', 0, '', 0, '', 0, 0, 0),
('1500 W 12/220 V Tam Sinüs İnverter', 'ELC-S30', 0, '', 0, '', 0, 0, 0),
('18F4620 44TQFP', 'ELC-C240', 0, '', 0, '', 0, 0, 0),
('2.el ekm 1500', 'ELC-E01', 0, '', 0, '', 0, 0, 0),
('2.el ekm 1500', 'ELC-E011', 0, '', 0, '', 0, 0, 0),
('2.el ekm 1500', 'ELC-E01', 0, '', 0, '', 0, 0, 0),
('2.el ekm 2000', 'ELC-E02', 0, '', 0, '', 0, 0, 0),
('2.el ekm 2000', 'ELC-E02', 0, '', 0, '', 0, 0, 0),
('2.el ekm 2000sp', 'ELC-C387', 0, '', 0, '', 0, 0, 0),
('2.el ekm 2000sp', 'ELC-C387', 0, '', 0, '', 0, 0, 0),
('2.el ekm 3000', 'ELC-E03', 0, '', 0, '', 0, 0, 0),
('2.el ekm 3000', 'ELC-E03', 0, '', 0, '', 0, 0, 0),
('2.el ekm 3000 ( pro )', 'ELC-E07', 0, '', 0, '', 0, 0, 0),
('2.el ekm 3000 ( pro )', 'ELC-E07', 0, '', 0, '', 0, 0, 0),
('2.el ekm eco', 'ELC-C137', 0, '', 0, '', 0, 0, 0),
('2.el ekm eco', 'ELC-C137', 0, '', 0, '', 0, 0, 0),
('2.el ekm max', 'ELC-E05', 0, '', 0, '', 0, 0, 0),
('2.el ekm max', 'ELC-E05', 0, '', 0, '', 0, 0, 0),
('2.el ekm plus', 'ELC-E04', 0, '', 0, '', 0, 0, 0),
('2.el ekm plus', 'ELC-E04', 0, '', 0, '', 0, 0, 0),
('2.el osm 1500', 'ELC-C118', 0, '', 0, '', 0, 0, 0),
('2.el osm 1500', 'ELC-C118', 0, '', 0, '', 0, 0, 0),
('2.el rtc-1', 'ELC-E08', 0, '', 0, '', 0, 0, 0),
('2.el rtc-1', 'ELC-E08', 0, '', 0, '', 0, 0, 0),
('2.el rtc-2', 'ELC-E06', 0, '', 0, '', 0, 0, 0),
('2.el rtc-2', 'ELC-E06', 0, '', 0, '', 0, 0, 0),
('2000 W 12/220 V Tam Sinüs İnverter', 'ELC-S31', 0, '', 0, '', 0, 0, 0),
('2000 W 12/220 V Tam Sinüs İnverter', 'ELC-S31', 0, '', 0, '', 0, 0, 0),
('220v anahtar', 'ELC-C66', 2, '', 0, '', 2, 0, 0),
('220v anahtar', 'ELC-C66', 0, '', 0, '', 0, 0, 0),
('220v anahtarlı giriş soketi', 'ELC-S58', 0, '', 0, '', 0, 0, 0),
('220v anahtarlı giriş soketi', 'ELC-S58', 0, '', 0, '', 0, 0, 0),
('220v giriş soketi', 'ELC-C67', 6, '', 0, '', 6, 0, 0),
('220v giriş soketi', 'ELC-C67', 0, '', 0, '', 0, 0, 0),
('A.B. Port', 'MNY-PT-02', 55, '', 0, '', 55, 0, 0),
('A.B. Port Kapak', 'MNY PTK-34001', 130, '', 0, '', 130, 0, 0),
('A.B. Port Mercedes', 'MNY-PT-01', 2, '', 0, '', 2, 0, 0),
('a.b.saati (elci)', 'ELC-C193', 1, '', 0, '', 1, 0, 0),
('a.b.saati (elci)', 'ELC-C193', 0, '', 0, '', 0, 0, 0),
('a/c flush  (200 litre varil)', 'ELC-A78', 0, '', 0, '', 0, 0, 0),
('a/c flush  (200 litre varil)', 'ELC-A78', 0, '', 0, '', 0, 0, 0),
('a/c flush 4,5 litre', 'ELC-A70', 6, '', 0, '', 6, 0, 0),
('a/c flush 4,5 litre', 'ELC-A70', 0, '', 0, '', 0, 0, 0);

-- Önce kategori oluştur (eğer yoksa)
INSERT INTO categories (name, created_at, updated_at)
VALUES ('Elektronik', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Kategori ID'sini al ve ürünleri kontrol et
DO $$
DECLARE
    elektronik_category_id INTEGER;
    temp_record RECORD;
    existing_product_id INTEGER;
BEGIN
    SELECT id INTO elektronik_category_id FROM categories WHERE name = 'Elektronik';
    
    FOR temp_record IN SELECT DISTINCT stock_code, product_name FROM temp_stock_import LOOP
        SELECT id INTO existing_product_id 
        FROM products 
        WHERE stock_code = temp_record.stock_code;
        
        IF existing_product_id IS NOT NULL THEN
            UPDATE products SET
                name = temp_record.product_name,
                quantity_on_hand = (SELECT SUM(quantity) FROM temp_stock_import WHERE stock_code = temp_record.stock_code),
                minimum_stock_level = (SELECT MAX(min_stock) FROM temp_stock_import WHERE stock_code = temp_record.stock_code),
                purchase_price = 0.00,
                updated_at = NOW()
            WHERE id = existing_product_id;
            
            RAISE NOTICE 'Ürün güncellendi: % (%)', temp_record.product_name, temp_record.stock_code;
        ELSE
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
                0.00,
                0.00,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Yeni ürün eklendi: % (%)', temp_record.product_name, temp_record.stock_code;
        END IF;
    END LOOP;
END $$;

-- Geçici tabloyu sil
DROP TABLE temp_stock_import;

-- Sonuç raporu
SELECT 
    'Stok aktarımı tamamlandı!' as message,
    COUNT(*) as total_products
FROM products 
WHERE stock_code LIKE 'ELC-%' OR stock_code LIKE 'MNY-%';

-- Eklenen ürünleri listele
SELECT 
    stock_code,
    name,
    quantity_on_hand,
    minimum_stock_level,
    purchase_price,
    selling_price
FROM products 
WHERE stock_code LIKE 'ELC-%' OR stock_code LIKE 'MNY-%'
ORDER BY stock_code
LIMIT 20;
