-- Debug: Mevcut durumu kontrol et
DO $$
DECLARE
    auth_user_record RECORD;
    profile_record RECORD;
BEGIN
    RAISE NOTICE '=== DEBUG: Auth Users ===';
    FOR auth_user_record IN 
        SELECT id, email, created_at, email_confirmed_at 
        FROM auth.users 
        WHERE email = 'admin@example.com'
    LOOP
        RAISE NOTICE 'Auth User - ID: %, Email: %, Created: %, Confirmed: %', 
            auth_user_record.id, 
            auth_user_record.email, 
            auth_user_record.created_at,
            auth_user_record.email_confirmed_at;
    END LOOP;

    RAISE NOTICE '=== DEBUG: User Profiles ===';
    FOR profile_record IN 
        SELECT up.id, up.user_id, up.full_name, up.role, up.status, au.email
        FROM public.user_profiles up
        JOIN auth.users au ON up.user_id = au.id
        WHERE au.email = 'admin@example.com'
    LOOP
        RAISE NOTICE 'Profile - ID: %, User ID: %, Name: %, Role: %, Status: %, Email: %', 
            profile_record.id, 
            profile_record.user_id, 
            profile_record.full_name, 
            profile_record.role, 
            profile_record.status,
            profile_record.email;
    END LOOP;

    -- Admin kullanıcısını bul ve profil oluştur/güncelle
    FOR auth_user_record IN 
        SELECT id, email 
        FROM auth.users 
        WHERE email = 'admin@example.com'
    LOOP
        -- Profil oluştur veya güncelle
        INSERT INTO public.user_profiles (user_id, full_name, role, status, created_at, updated_at)
        VALUES (
            auth_user_record.id, 
            'Sistem Yöneticisi', 
            'admin', 
            'active',
            NOW(),
            NOW()
        )
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            full_name = 'Sistem Yöneticisi',
            role = 'admin',
            status = 'active',
            updated_at = NOW();
            
        RAISE NOTICE 'Admin profili oluşturuldu/güncellendi: %', auth_user_record.email;
    END LOOP;

    -- Eğer admin@example.com yoksa oluştur
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
        RAISE NOTICE 'admin@example.com bulunamadı, oluşturuluyor...';
        
        -- Admin kullanıcısını oluştur
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
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
            false,
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Admin kullanıcısı oluşturuldu';
    END IF;

END $$;
