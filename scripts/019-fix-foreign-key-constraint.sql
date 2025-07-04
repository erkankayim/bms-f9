-- Foreign key constraint sorununu çöz
-- Önce mevcut constraint'i kontrol et
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name='user_profiles';

-- Eğer constraint yanlışsa, düzelt
-- Önce constraint'i sil
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Doğru constraint'i ekle
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Mevcut orphan kayıtları temizle
DELETE FROM user_profiles 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Admin kullanıcısını kontrol et ve oluştur
DO $$
DECLARE
    admin_user_id UUID;
    admin_profile_exists BOOLEAN;
BEGIN
    -- Admin kullanıcısının ID'sini al
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com';
    
    -- Eğer kullanıcı yoksa oluştur
    IF admin_user_id IS NULL THEN
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
            '{"full_name":"Admin User"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
    END IF;
    
    -- Profil var mı kontrol et
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE user_id = admin_user_id) INTO admin_profile_exists;
    
    -- Profil yoksa oluştur
    IF NOT admin_profile_exists THEN
        INSERT INTO user_profiles (user_id, full_name, role, status)
        VALUES (admin_user_id, 'Admin User', 'admin', 'active');
    ELSE
        -- Varsa güncelle
        UPDATE user_profiles 
        SET full_name = 'Admin User', role = 'admin', status = 'active', updated_at = NOW()
        WHERE user_id = admin_user_id;
    END IF;
        
    RAISE NOTICE 'Admin user ID: %, Profile exists: %', admin_user_id, admin_profile_exists;
END $$;
