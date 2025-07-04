-- Mevcut admin kullanıcısı için profil oluştur
DO $$
DECLARE
    admin_user_id UUID := '89853a4b-9c01-402a-81e8-cb53e75c9fc7';
BEGIN
    -- Önce mevcut profili sil (varsa)
    DELETE FROM user_profiles WHERE user_id = admin_user_id;
    
    -- Yeni admin profili oluştur
    INSERT INTO user_profiles (user_id, full_name, role, status)
    VALUES (admin_user_id, 'Sistem Yöneticisi', 'admin', 'active');
    
    RAISE NOTICE 'Admin profili oluşturuldu!';
END $$;
