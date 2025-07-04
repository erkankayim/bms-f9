-- Mevcut giriş yapmış kullanıcı için admin profili oluştur
DO $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Mevcut admin@example.com kullanıcısının ID'sini bul
    SELECT id INTO current_user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF current_user_id IS NOT NULL THEN
        -- Önce mevcut profili sil (varsa)
        DELETE FROM user_profiles WHERE user_id = current_user_id;
        
        -- Yeni admin profili oluştur
        INSERT INTO user_profiles (user_id, full_name, role, status)
        VALUES (current_user_id, 'Sistem Yöneticisi', 'admin', 'active');
        
        RAISE NOTICE 'Admin profili oluşturuldu! User ID: %', current_user_id;
    ELSE
        RAISE NOTICE 'Admin kullanıcısı bulunamadı!';
    END IF;
END $$;
