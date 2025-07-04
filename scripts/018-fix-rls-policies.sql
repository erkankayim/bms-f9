-- RLS politikalarını sıfırla ve düzelt
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- Basit ve güvenli RLS politikaları
CREATE POLICY "Enable read access for authenticated users" ON user_profiles
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON user_profiles
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON user_profiles
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Admin kullanıcısını oluştur
DO $$
DECLARE
    admin_user_id UUID;
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
    
    -- Profil oluştur veya güncelle
    INSERT INTO user_profiles (user_id, full_name, role, status)
    VALUES (admin_user_id, 'Admin User', 'admin', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        full_name = 'Admin User',
        role = 'admin',
        status = 'active',
        updated_at = NOW();
        
    RAISE NOTICE 'Admin user created/updated with ID: %', admin_user_id;
END $$;
