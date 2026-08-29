-- ==============================================================================
-- Migration: 20240827_sprint4_rewards_redemptions.sql
-- Description: Extends rewards & redemptions schema for Sprint 4 (Cash, Tree Planting, 57357 Donation)
-- ==============================================================================

-- 1. Ensure metadata column exists on rewards and redemptions
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'rewards' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.rewards ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'redemptions' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE public.redemptions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'redemptions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.redemptions ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
END $$;

-- 2. Relax or update category & status constraints if they exist
ALTER TABLE public.rewards DROP CONSTRAINT IF EXISTS rewards_category_check;
ALTER TABLE public.rewards ADD CONSTRAINT rewards_category_check 
    CHECK (category IN ('cash', 'tree', 'donation', 'voucher', 'discount', 'cashback', 'product'));

ALTER TABLE public.redemptions DROP CONSTRAINT IF EXISTS redemptions_status_check;
ALTER TABLE public.redemptions ADD CONSTRAINT redemptions_status_check 
    CHECK (status IN ('pending', 'approved', 'completed', 'rejected', 'cancelled', 'used', 'expired'));

-- 3. Create synonym / view for reward_redemptions to match sprint naming
CREATE OR REPLACE VIEW public.reward_redemptions AS
SELECT 
    id,
    user_id,
    reward_id,
    points_spent AS points,
    status,
    voucher_code,
    expires_at,
    used_at,
    metadata,
    created_at,
    updated_at
FROM public.redemptions;

-- 4. Seed / Update Core Sprint 4 Rewards: Cash, Tree, 57357 Donation, Vouchers
INSERT INTO public.rewards (id, title, title_ar, description, partner_name, category, points_cost, monetary_value, stock_quantity, expiry_days, is_active, metadata)
VALUES
    -- 1. CASH / WALLETS (Manual Approval MVP)
    (
        'c0000001-1111-1111-1111-111111111111', 
        'Vodafone Cash 50 EGP Payout', 
        'تحويل كاش 50 جنيه (فودافون كاش / إنستاباي)', 
        'تحويل نقدي مباشر إلى محفظتك الإلكترونية أو عبر إنستاباي خلال 24 ساعة بمجرد المراجعة.', 
        'فودافون كاش / إنستاباي (Cash)', 
        'cash', 
        500, 
        50.00, 
        500, 
        30, 
        true, 
        '{"requires_phone": true, "payout_type": "wallet"}'::jsonb
    ),
    (
        'c0000001-2222-2222-2222-222222222222', 
        'Vodafone Cash 100 EGP Payout', 
        'تحويل كاش 100 جنيه (فودافون كاش / إنستاباي)', 
        'تحويل نقدي مباشر لرقم محفظتك الإلكترونية أو حساب إنستاباي بدون أي خصومات أو رسوم.', 
        'فودافون كاش / إنستاباي (Cash)', 
        'cash', 
        950, 
        100.00, 
        500, 
        30, 
        true, 
        '{"requires_phone": true, "payout_type": "wallet"}'::jsonb
    ),
    (
        'c0000001-3333-3333-3333-333333333333', 
        'Cash Transfer 200 EGP Payout', 
        'تحويل كاش 200 جنيه (إنستاباي / محفظة بنكية)', 
        'سحب نقدي مباشر لأي محفظة بنكية أو إنستاباي في مصر بمراجعة فورية.', 
        'إنستاباي مصر (InstaPay)', 
        'cash', 
        1850, 
        200.00, 
        300, 
        30, 
        true, 
        '{"requires_phone": true, "payout_type": "instapay"}'::jsonb
    ),

    -- 2. TREE PLANTING (Environmental Impact)
    (
        't0000001-1111-1111-1111-111111111111', 
        'Plant an Olive or Fruit Tree in Egypt', 
        'زراعة شجرة زيتون أو فاكهة مثمرة باسمك', 
        'مساهمة بيئية حقيقية لغرس شجرة مثمرة في إحدى المحافظات المصرية باسمك أو إهدائها لمن تحب مع شهادة رقمية معتمدة.', 
        'مبادرة شجرها ومصر الخضراء (Green Egypt)', 
        'tree', 
        400, 
        40.00, 
        1000, 
        365, 
        true, 
        '{"requires_dedication_name": true, "impact_co2_kg": 25}'::jsonb
    ),
    (
        't0000001-2222-2222-2222-222222222222', 
        'Plant 3 Trees for Clean Air', 
        'غرس 3 أشجار لتنقية الهواء والحد من الانبعاثات', 
        'مشروع تشجير متكامل لغرس 3 أشجار في المناطق السكنية والمدارس لخفض البصمة الكربونية.', 
        'مبادرة شجرها ومصر الخضراء (Green Egypt)', 
        'tree', 
        1100, 
        120.00, 
        500, 
        365, 
        true, 
        '{"requires_dedication_name": true, "impact_co2_kg": 75}'::jsonb
    ),

    -- 3. DONATION TO 57357 & CHARITY
    (
        'd0000001-1111-1111-1111-111111111111', 
        '50 EGP Donation to 57357 Hospital', 
        'تبرع بقيمة 50 جنيه لمستشفى 57357 لعلاج سرطان الأطفال', 
        'تحويل نقاط إعادة التدوير لدعم علاج ورعاية أطفال مستشفى 57357 مع إصدار إيصال تبرع رقمي فوري.', 
        'مستشفى سرطان الأطفال 57357', 
        'donation', 
        450, 
        50.00, 
        9999, 
        365, 
        true, 
        '{"charity": "57357", "tax_deductible": true}'::jsonb
    ),
    (
        'd0000001-2222-2222-2222-222222222222', 
        '100 EGP Donation to 57357 Hospital', 
        'تبرع بقيمة 100 جنيه لمستشفى 57357 لعلاج سرطان الأطفال', 
        'مساهمة كريمة في توفير جرعات العلاج والأجهزة الطبية المتطورة بمستشفى 57357.', 
        'مستشفى سرطان الأطفال 57357', 
        'donation', 
        900, 
        100.00, 
        9999, 
        365, 
        true, 
        '{"charity": "57357", "tax_deductible": true}'::jsonb
    ),
    (
        'd0000001-3333-3333-3333-333333333333', 
        '50 EGP Donation to Resala Green Charity', 
        'تبرع بيئي واجتماعي بقيمة 50 جنيه لجمعية رسالة', 
        'دعم أنشطة جمعية رسالة في التنمية المجتمعية ومساعدة الأسر الأكثر احتياجاً وإعادة التدوير.', 
        'جمعية رسالة (Resala Charity)', 
        'donation', 
        450, 
        50.00, 
        9999, 
        365, 
        true, 
        '{"charity": "resala", "tax_deductible": true}'::jsonb
    ),

    -- 4. SHOPPING & VOUCHERS
    (
        'c1111111-1111-1111-1111-111111111111', 
        'Noon Egypt 50 EGP Voucher', 
        'قسيمة شراء نون مصر بقيمة 50 جنيه', 
        'قسيمة شراء صالحة لجميع المنتجات على منصة نون مصر بدون حد أدنى للطلب.', 
        'نون مصر (Noon)', 
        'voucher', 
        500, 
        50.00, 
        150, 
        45, 
        true, 
        '{}'::jsonb
    ),
    (
        'c2222222-1111-1111-1111-111111111111', 
        'Amazon Egypt 50 EGP Gift Card', 
        'بطاقة هدايا أمازون مصر 50 جنيه', 
        'رصيد يتم إضافته مباشرة إلى حسابك في أمازون مصر للشراء من ملايين المنتجات.', 
        'أمازون مصر (Amazon)', 
        'voucher', 
        500, 
        50.00, 
        120, 
        60, 
        true, 
        '{}'::jsonb
    ),
    (
        'c4444444-1111-1111-1111-111111111111', 
        'Carrefour Egypt 50 EGP Coupon', 
        'قسيمة خصم كارفور مصر 50 جنيه', 
        'صالحة للاستخدام في جميع فروع كارفور مصر أو عبر التطبيق الإلكتروني.', 
        'كارفور مصر (Carrefour)', 
        'discount', 
        480, 
        50.00, 
        100, 
        30, 
        true, 
        '{}'::jsonb
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    title_ar = EXCLUDED.title_ar,
    description = EXCLUDED.description,
    partner_name = EXCLUDED.partner_name,
    category = EXCLUDED.category,
    points_cost = EXCLUDED.points_cost,
    monetary_value = EXCLUDED.monetary_value,
    metadata = EXCLUDED.metadata,
    is_active = EXCLUDED.is_active;
