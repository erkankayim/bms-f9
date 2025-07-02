-- Önceki trigger ve fonksiyonları kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- Önceki user_profiles tablosunu kaldır
DROP TABLE IF EXISTS public.user_profiles;

-- Kullanıcı rolleri için ENUM tipi
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'acc', 'tech');
    END IF;
END$$;

-- Kullanıcı durumu için ENUM tipi
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive');
    END IF;
END$$;


-- Yeni user_profiles tablosunu oluştur
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    role user_role NOT NULL DEFAULT 'tech',
    status user_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tablo için yorumlar
COMMENT ON TABLE public.user_profiles IS 'Stores public profile information for each user.';

-- RLS (Row Level Security) Aktifleştir
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view their own profile."
ON public.user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Adminler tüm profilleri görebilir
CREATE POLICY "Admins can view all profiles."
ON public.user_profiles FOR SELECT
USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update their own profile."
ON public.user_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Adminler tüm profilleri güncelleyebilir
CREATE POLICY "Admins can update any profile."
ON public.user_profiles FOR UPDATE
USING (
  (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) = 'admin'
);

-- Yeni kullanıcı eklendiğinde profil oluşturan trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Trigger'ı oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at sütununu güncelleyen trigger fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı user_profiles tablosuna ekle
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
