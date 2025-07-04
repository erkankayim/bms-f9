-- Mevcut kullanıcı için profil oluştur
DO $$
DECLARE
    current_user_id UUID;
    current_email TEXT;
BEGIN
    -- Mevcut auth kullanıcısını bul
    SELECT id, email INTO current_user_id, current_email
    FROM auth.users 
    WHERE email = 'admin@example.com'
    LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Profil varsa güncelle, yoksa oluştur
        INSERT INTO public.user_profiles (user_id, full_name, role, status)
        VALUES (current_user_id, 'Sistem Yöneticisi', 'admin', 'active')
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            full_name = 'Sistem Yöneticisi',
            role = 'admin',
            status = 'active',
            updated_at = NOW();
            
        RAISE NOTICE 'Admin profili oluşturuldu/güncellendi: %', current_email;
    ELSE
        -- Eğer admin@example.com yoksa, mevcut tüm kullanıcılar için admin profili oluştur
        INSERT INTO public.user_profiles (user_id, full_name, role, status)
        SELECT 
            id,
            COALESCE(raw_user_meta_data->>'full_name', email, 'Admin User'),
            'admin',
            'active'
        FROM auth.users
        WHERE id NOT IN (SELECT user_id FROM public.user_profiles)
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE 'Mevcut kullanıcılar için admin profilleri oluşturuldu';
    END IF;
END $$;
