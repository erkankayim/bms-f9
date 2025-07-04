-- user_profiles tablosuna email kolonu ekle
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Email için unique constraint ekle
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Mevcut kayıtlar için mock email ekle
UPDATE user_profiles 
SET email = 'user' || id || '@example.com' 
WHERE email IS NULL;

-- Email kolununu not null yap
ALTER TABLE user_profiles 
ALTER COLUMN email SET NOT NULL;

-- Test için birkaç kullanıcı ekle
INSERT INTO user_profiles (user_id, full_name, email, role, status, created_at, updated_at)
VALUES 
  ('mock_admin_001', 'Test Admin', 'testadmin@example.com', 'admin', 'active', NOW(), NOW()),
  ('mock_tech_001', 'Test Teknisyen', 'testtech@example.com', 'tech', 'active', NOW(), NOW()),
  ('mock_acc_001', 'Test Muhasebe', 'testacc@example.com', 'acc', 'active', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Debug: Mevcut kullanıcıları göster
SELECT id, user_id, full_name, email, role, status, created_at 
FROM user_profiles 
ORDER BY created_at DESC;
