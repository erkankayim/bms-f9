-- Products tablosuna alış fiyatı alanını ekle
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS purchase_price DECIMAL(10,2) DEFAULT 0.00;

-- Alış fiyatı alanına yorum ekle
COMMENT ON COLUMN products.purchase_price IS 'Ürünün alış fiyatı (KDV hariç)';

-- Index ekle performans için
CREATE INDEX IF NOT EXISTS idx_products_purchase_price ON products(purchase_price);

SELECT 'Products tablosuna purchase_price alanı eklendi.' as message;
