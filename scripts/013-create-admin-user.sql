-- Admin kullanıcısı oluşturmak için script
-- Bu script'i çalıştırdıktan sonra admin@example.com / admin123 ile giriş yapabilirsiniz

-- Yeni admin kullanıcısı oluştur veya var olanı güncelle
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Insert into auth.users (this simulates user registration)
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        role
    ) VALUES (
        gen_random_uuid(),
        'admin@example.com',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Sistem Yöneticisi"}',
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO admin_user_id;

    -- If user already exists, get their ID
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
    END IF;

    -- Insert or update user profile
    INSERT INTO public.user_profiles (user_id, full_name, role, status)
    VALUES (admin_user_id, 'Sistem Yöneticisi', 'admin', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        full_name = 'Sistem Yöneticisi',
        role = 'admin',
        status = 'active';

    -- Başarı mesajı
    RAISE NOTICE 'Admin kullanıcısı başarıyla oluşturuldu veya güncellendi!';
    RAISE NOTICE 'Email: admin@example.com';
    RAISE NOTICE 'Şifre: admin123';
END $$;
