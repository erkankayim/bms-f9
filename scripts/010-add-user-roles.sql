-- Kullanıcı rolleri için enum oluştur
CREATE TYPE user_role AS ENUM ('admin', 'tech', 'acc');

-- Kullanıcı profilleri tablosu oluştur
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role DEFAULT 'admin',
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Mevcut kullanıcıları admin olarak ekle
INSERT INTO user_profiles (user_id, role, full_name)
SELECT 
  id,
  'admin'::user_role,
  COALESCE(raw_user_meta_data->>'full_name', email)
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET
  role = 'admin'::user_role,
  full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name);

-- Trigger fonksiyonu: yeni kullanıcı oluşturulduğunda profil oluştur
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, role, full_name)
  VALUES (
    NEW.id,
    'admin'::user_role,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
