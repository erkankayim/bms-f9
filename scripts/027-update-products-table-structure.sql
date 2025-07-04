-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_name TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS purchase_price_currency TEXT DEFAULT 'TRY';
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_price_currency TEXT DEFAULT 'TRY';
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB;

-- Update existing products with category names based on category_id
UPDATE products 
SET category_name = CASE 
    WHEN category_id = 0 THEN 'Elektronik'
    WHEN category_id = 1 THEN 'Bilgisayar & Teknoloji'
    WHEN category_id = 2 THEN 'Telefon & Aksesuar'
    WHEN category_id = 3 THEN 'Ev & Yaşam'
    WHEN category_id = 4 THEN 'Mutfak Gereçleri'
    WHEN category_id = 5 THEN 'Mobilya'
    WHEN category_id = 6 THEN 'Giyim & Aksesuar'
    WHEN category_id = 7 THEN 'Ayakkabı & Çanta'
    WHEN category_id = 8 THEN 'Kozmetik & Kişisel Bakım'
    WHEN category_id = 9 THEN 'Spor & Outdoor'
    WHEN category_id = 10 THEN 'Otomotiv'
    WHEN category_id = 11 THEN 'Bahçe & Yapı Market'
    WHEN category_id = 12 THEN 'Kitap & Kırtasiye'
    WHEN category_id = 13 THEN 'Oyuncak & Hobi'
    WHEN category_id = 14 THEN 'Sağlık & Medikal'
    WHEN category_id = 15 THEN 'Gıda & İçecek'
    WHEN category_id = 16 THEN 'Pet Shop'
    WHEN category_id = 17 THEN 'Bebek & Çocuk'
    WHEN category_id = 18 THEN 'Takı & Saat'
    ELSE 'Diğer'
END
WHERE category_id IS NOT NULL AND category_name IS NULL;

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY IF NOT EXISTS "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY IF NOT EXISTS "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

SELECT 'Ürünler tablosu başarıyla güncellendi!' as message;
