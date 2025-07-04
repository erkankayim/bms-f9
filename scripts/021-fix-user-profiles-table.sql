-- user_profiles tablosunu yeniden yapılandır
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Yeni user_profiles tablosu oluştur
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE, -- UUID yerine VARCHAR kullan
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'acc', 'tech')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS politikalarını ekle
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Basit RLS politikaları
CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON user_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON user_profiles FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON user_profiles FOR DELETE USING (true);

-- Test kullanıcıları ekle
INSERT INTO user_profiles (user_id, full_name, email, role, status)
VALUES 
  ('mock_admin_001', 'Test Admin', 'testadmin@example.com', 'admin', 'active'),
  ('mock_tech_001', 'Test Teknisyen', 'testtech@example.com', 'tech', 'active'),
  ('mock_acc_001', 'Test Muhasebe', 'testacc@example.com', 'acc', 'active'),
  ('current_admin', 'Admin Kullanıcı', 'admin@example.com', 'admin', 'active');

-- Mevcut kullanıcıları göster
SELECT id, user_id, full_name, email, role, status, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
