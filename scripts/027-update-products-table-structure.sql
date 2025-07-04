-- Add new columns to products table (check if they exist first)
DO $$ 
BEGIN
    -- Add category_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='category_name') THEN
        ALTER TABLE products ADD COLUMN category_name TEXT;
    END IF;
    
    -- Add purchase_price_currency column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='purchase_price_currency') THEN
        ALTER TABLE products ADD COLUMN purchase_price_currency TEXT DEFAULT 'TRY';
    END IF;
    
    -- Add sale_price_currency column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sale_price_currency') THEN
        ALTER TABLE products ADD COLUMN sale_price_currency TEXT DEFAULT 'TRY';
    END IF;
    
    -- Add image_urls column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='image_urls') THEN
        ALTER TABLE products ADD COLUMN image_urls JSONB;
    END IF;
    
    -- Add variants column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='variants') THEN
        ALTER TABLE products ADD COLUMN variants JSONB;
    END IF;
END $$;

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
WHERE category_id IS NOT NULL AND (category_name IS NULL OR category_name = '');

-- Create storage bucket for product images (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
    END IF;
END $$;

-- Create storage policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

SELECT 'Ürünler tablosu başarıyla güncellendi!' as message;
