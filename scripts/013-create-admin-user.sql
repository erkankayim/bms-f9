-- Admin kullanıcısı oluşturmak için script
-- Bu script'i çalıştırdıktan sonra admin@example.com / admin123 ile giriş yapabilirsiniz

-- Yeni admin kullanıcısı oluştur veya var olanı güncelle
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com';
    
    -- If admin doesn't exist, create it
    IF admin_user_id IS NULL THEN
        -- Insert admin user into auth.users
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
            '{"provider": "email", "providers": ["email"]}',
            '{"full_name": "System Admin"}',
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_user_id;
        
        -- Insert admin profile
        INSERT INTO user_profiles (user_id, full_name, role, status)
        VALUES (admin_user_id, 'System Admin', 'admin', 'active')
        ON CONFLICT (user_id) DO UPDATE SET
            role = 'admin',
            status = 'active';
            
        RAISE NOTICE 'Admin user created with email: admin@example.com and password: admin123';
    ELSE
        -- Update existing admin to ensure it has admin role
        UPDATE user_profiles 
        SET role = 'admin', status = 'active'
        WHERE user_id = admin_user_id;
        
        RAISE NOTICE 'Admin user already exists, role updated to admin';
    END IF;
END $$;
