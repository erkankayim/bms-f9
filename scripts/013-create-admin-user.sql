-- Admin kullanıcısı oluşturmak için script
-- Bu script'i çalıştırdıktan sonra admin@example.com / admin123 ile giriş yapabilirsiniz

-- Yeni admin kullanıcısı oluştur veya var olanı güncelle
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Insert into auth.users (this simulates user registration)
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
        '{"full_name": "Sistem Yöneticisi"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Insert into user_profiles
    INSERT INTO user_profiles (user_id, full_name, role, status)
    VALUES (admin_user_id, 'Sistem Yöneticisi', 'admin', 'active');

    RAISE NOTICE 'Admin user created with email: admin@example.com and password: admin123';
END $$;
