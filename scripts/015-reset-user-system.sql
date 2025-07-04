-- Mevcut kullanıcı sistemini tamamen sıfırla
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Auth kullanıcılarını temizle
DELETE FROM auth.users;

-- Yeni user_profiles tablosu oluştur
CREATE TABLE user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'acc', 'tech')) DEFAULT 'tech',
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS etkinleştir
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Basit politikalar
CREATE POLICY "Enable read access for all users" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON user_profiles FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Enable update for users based on user_id" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for users based on user_id" ON user_profiles FOR DELETE USING (auth.uid() = user_id);

-- İndeksler
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);

-- Yeni kullanıcı kaydı için trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name, role, status)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kullanıcı'),
        'tech',
        'active'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger oluştur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- İlk admin kullanıcısını oluştur
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Sistem Yöneticisi"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Admin profili oluştur (trigger otomatik çalışacak ama rolü güncelleyelim)
UPDATE user_profiles 
SET role = 'admin', full_name = 'Sistem Yöneticisi'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
