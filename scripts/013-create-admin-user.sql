-- Delete existing admin user if exists
DELETE FROM auth.users WHERE email = 'admin@example.com';

-- Insert admin user directly into auth.users
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
);

-- Get the created user ID and insert profile
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
    
    INSERT INTO user_profiles (user_id, full_name, role, status)
    VALUES (admin_user_id, 'Sistem Yöneticisi', 'admin', 'active')
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = 'Sistem Yöneticisi',
        role = 'admin',
        status = 'active';
END $$;
