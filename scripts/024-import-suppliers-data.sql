-- JSON verisindeki tedarikçileri ekle
INSERT INTO suppliers (
    supplier_code,
    name,
    city,
    notes,
    created_at,
    updated_at
) VALUES
-- Tedarikçi 1: ELCİ Elektronik Klima
(
    'ELCI-ANKARA-KLIMA',
    'ELCİ Elektronik Klima',
    'Ankara',
    'Faaliyet: Klima | Bakiye: 0.00 TL | Vade: Yok | Orijinal Kod: ELCİ Elektronik Klima_Ankara_Klima',
    NOW(),
    NOW()
),

-- Tedarikçi 2: Can Oto Tedek Parça
(
    'CAN-ISTANBUL-YEDEK',
    'Can Oto Tedek Parça San. ve Tic. Ltd.Şti.',
    'İstanbul',
    'Faaliyet: Yedek Parça | Bakiye: 63,893.88 TL | Vade: 30 GÜN | Orijinal Kod: Can Oto Tedek Parça San. ve Tic. Ltd.Şti._İstanbul_Yedek Parça',
    NOW(),
    NOW()
),

-- Tedarikçi 3: Yaz Kış Otomotiv
(
    'YAZKIS-ANTALYA-YEDEK',
    'Yaz Kış Otomotiv Isıtma ve Soğutma Sistemleri Ltd.Şti.',
    'Antalya',
    'Faaliyet: Yedek Parça | Bakiye: 330,904.00 TL | Vade: Yok | Orijinal Kod: Yaz Kış Otomotiv Isıtma ve Soğutma Sistemleri Ltd.Şti._Antalya_Yedek Parça',
    NOW(),
    NOW()
),

-- Tedarikçi 4: Nemkar Otomotiv
(
    'NEMKAR-IZMIR-YEDEK',
    'Nemkar Otomotiv A.Ş.',
    'İzmir',
    'Faaliyet: Yedek Parça | Bakiye: 0.00 TL | Vade: Yok | Orijinal Kod: Nemkar Otomotiv A.Ş._İzmir_Yedek Parça',
    NOW(),
    NOW()
)

-- Eğer aynı supplier_code zaten varsa, güncelleme yap
ON CONFLICT (supplier_code) 
DO UPDATE SET
    name = EXCLUDED.name,
    city = EXCLUDED.city,
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- Sonuç mesajı
DO $$
DECLARE
    supplier_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO supplier_count FROM suppliers WHERE supplier_code IN (
        'ELCI-ANKARA-KLIMA',
        'CAN-ISTANBUL-YEDEK', 
        'YAZKIS-ANTALYA-YEDEK',
        'NEMKAR-IZMIR-YEDEK'
    );
    
    RAISE NOTICE '✅ Tedarikçi aktarımı tamamlandı!';
    RAISE NOTICE '📊 Toplam % tedarikçi işlendi', supplier_count;
    RAISE NOTICE '🏢 Aktarılan tedarikçiler:';
    RAISE NOTICE '   • ELCİ Elektronik Klima (Ankara - Klima)';
    RAISE NOTICE '   • Can Oto Tedek Parça San. ve Tic. Ltd.Şti. (İstanbul - Yedek Parça)';
    RAISE NOTICE '   • Yaz Kış Otomotiv Isıtma ve Soğutma Sistemleri Ltd.Şti. (Antalya - Yedek Parça)';
    RAISE NOTICE '   • Nemkar Otomotiv A.Ş. (İzmir - Yedek Parça)';
    RAISE NOTICE '';
    RAISE NOTICE '💡 Not: Bakiye ve vade bilgileri notlar alanına kaydedildi.';
    RAISE NOTICE '💡 Gelecekte bu bilgiler için ayrı tablolar oluşturulabilir.';
END $$;
