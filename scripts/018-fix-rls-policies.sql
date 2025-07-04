-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.user_profiles;

-- RLS'yi geçici olarak kapat
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Tabloyu temizle ve yeniden oluştur
TRUNCATE TABLE public.user_profiles CASCADE;

-- Admin kullanıcısını bul ve profil oluştur
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Admin kullanıcısının ID'sini al
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@example.com' 
    LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Admin profili oluştur
        INSERT INTO public.user_profiles (
            user_id, 
            full_name, 
            role, 
            status, 
            created_at, 
            updated_at
        ) VALUES (
            admin_user_id,
            'Sistem Yöneticisi',
            'admin',
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin profili oluşturuldu: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin kullanıcısı bulunamadı!';
    END IF;
END $$;

-- Basit RLS politikaları oluştur (sonsuz döngü olmadan)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver (geçici olarak)
CREATE POLICY "Allow read access for all authenticated users" 
ON public.user_profiles FOR SELECT 
TO authenticated 
USING (true);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Yeni profil oluşturma izni
CREATE POLICY "Allow insert for authenticated users" 
ON public.user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Silme işlemi sadece kendi profili için
CREATE POLICY "Users can delete own profile" 
ON public.user_profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Kontrol et
SELECT 
    up.id,
    up.user_id,
    up.full_name,
    up.role,
    up.status,
    au.email
FROM public.user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email = 'admin@example.com';
