-- Delete existing admin users first
DELETE FROM auth.users WHERE email = 'admin@example.com';

-- Create admin user if not exists
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Check if admin user already exists
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
    
    IF admin_user_id IS NULL THEN
        -- Create admin user
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
        ) RETURNING id INTO admin_user_id;
        
        RAISE NOTICE 'Admin user created with ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user already exists with ID: %', admin_user_id;
    END IF;
    
    -- Create or update admin profile
    INSERT INTO user_profiles (user_id, full_name, role, status)
    VALUES (admin_user_id, 'Sistem Yöneticisi', 'admin', 'active')
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        full_name = 'Sistem Yöneticisi',
        role = 'admin',
        status = 'active',
        updated_at = NOW();
        
    RAISE NOTICE 'Admin profile created/updated';
END $$;
