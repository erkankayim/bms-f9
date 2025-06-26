-- Örnek Tedarikçi Verileri Ekleme

-- Tedarikçi 1
INSERT INTO suppliers (supplier_code, name, contact_name, email, phone, address, city, province, postal_code, country, tax_office, tax_number, iban, website, notes)
VALUES
(
  'SUP-KRT-001',
  'Kırtasiye Dünyası A.Ş.',
  'Ahmet Yılmaz',
  'ahmet.yilmaz@kirtasiyedunyasi.com',
  '+90 212 555 0101',
  'Merkez Mah. Kitap Sk. No:15',
  'İstanbul',
  'Şişli',
  '34380',
  'Türkiye',
  'Şişli Vergi Dairesi',
  '1234567890',
  'TR0000012345678901234567',
  'https://www.kirtasiyedunyasi.com',
  'Ofis malzemeleri ve kırtasiye ürünleri ana tedarikçisi.'
)
ON CONFLICT (supplier_code) DO NOTHING; -- Eğer supplier_code zaten varsa ekleme

-- Tedarikçi 2
INSERT INTO suppliers (name, contact_name, email, phone, address, city, country, notes)
VALUES
(
  'Tekno Market Elektronik',
  'Zeynep Kaya',
  'zeynep@teknomarket.com.tr',
  '+90 216 555 0202',
  'Elektronikçiler Çarşısı No: 42',
  'İstanbul',
  'Türkiye',
  'Bilgisayar bileşenleri ve elektronik aletler.'
);
-- ON CONFLICT (name) DO NOTHING; <-- Bu satır kaldırıldı

-- Tedarikçi 3
INSERT INTO suppliers (supplier_code, name, email, phone, city, country, website)
VALUES
(
  'SUP-MOB-003',
  'Ofis Mobilyaları Uzmanı',
  'info@ofismobilyalari.com',
  '+90 312 555 0303',
  'Ankara',
  'Türkiye',
  'https://www.ofismobilyalari.com'
)
ON CONFLICT (supplier_code) DO NOTHING;

-- Tedarikçi 4 (Arşivlenmiş olarak eklenebilir, test için)
INSERT INTO suppliers (supplier_code, name, contact_name, email, deleted_at)
VALUES
(
  'SUP-ARC-004',
  'Eski Tedarikçi Ltd.',
  'Mehmet Öztürk',
  'mehmet@eskitedarikci.com',
  NOW() - INTERVAL '1 month' -- Bir ay önce arşivlenmiş gibi
)
ON CONFLICT (supplier_code) DO NOTHING;

SELECT 'Örnek tedarikçiler eklendi (veya zaten vardı).' AS status;
