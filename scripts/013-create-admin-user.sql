-- Admin kullanıcısı oluşturmak için script
-- Bu script'i çalıştırdıktan sonra admin@example.com / admin123 ile giriş yapabilirsiniz

-- Önce mevcut admin kullanıcısını kontrol et ve varsa sil
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Admin kullanıcısının ID'sini bul
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com';
    
    -- Eğer varsa sil
    IF admin_user_id IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = admin_user_id;
        RAISE NOTICE 'Existing admin user deleted';
    END IF;
END $$;

-- Yeni admin kullanıcısı oluştur
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sistem Yöneticisi"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
);

-- Admin kullanıcısının profil kaydını manuel olarak oluştur (trigger çalışmazsa)
INSERT INTO user_profiles (user_id, full_name, role, status)
SELECT 
    id,
    'Sistem Yöneticisi',
    'admin',
    'active'
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (user_id) DO UPDATE SET
    full_name = 'Sistem Yöneticisi',
    role = 'admin',
    status = 'active';

-- Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'Admin kullanıcısı başarıyla oluşturuldu!';
    RAISE NOTICE 'Email: admin@example.com';
    RAISE NOTICE 'Şifre: admin123';
END $$;
