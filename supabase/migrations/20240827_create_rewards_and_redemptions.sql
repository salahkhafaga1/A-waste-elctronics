-- ==============================================================================
-- Migration: 004_create_rewards_and_redemptions.sql
-- Description: Creates the rewards catalog, redemptions ledger, and seeds Egyptian partners
-- ==============================================================================

-- 1. Create custom reward category and redemption status enums
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reward_category') THEN
        CREATE TYPE reward_category AS ENUM (
            'voucher',
            'discount',
            'cashback',
            'donation',
            'product'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'redemption_status') THEN
        CREATE TYPE redemption_status AS ENUM (
            'pending',
            'completed',
            'used',
            'expired',
            'cancelled'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    title_ar TEXT NOT NULL,
    description TEXT,
    partner_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('voucher', 'discount', 'cashback', 'donation', 'product')),
    points_cost INTEGER NOT NULL CHECK (points_cost > 0),
    monetary_value NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (monetary_value >= 0),
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 100 CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    expiry_days INTEGER NOT NULL DEFAULT 30 CHECK (expiry_days > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create redemptions table
CREATE TABLE IF NOT EXISTS public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- references clerk_user_id
    reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
    points_spent INTEGER NOT NULL CHECK (points_spent > 0),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'used', 'expired', 'cancelled')),
    voucher_code TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Performance indexes
CREATE INDEX IF NOT EXISTS idx_rewards_category ON public.rewards (category);
CREATE INDEX IF NOT EXISTS idx_rewards_points_cost ON public.rewards (points_cost);
CREATE INDEX IF NOT EXISTS idx_rewards_is_active ON public.rewards (is_active);
CREATE INDEX IF NOT EXISTS idx_redemptions_user_id ON public.redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward_id ON public.redemptions (reward_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_voucher_code ON public.redemptions (voucher_code);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Rewards: Public read for active rewards with stock
DROP POLICY IF EXISTS "Public can view active rewards" ON public.rewards;
CREATE POLICY "Public can view active rewards"
    ON public.rewards FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Redemptions: Service role full access
DROP POLICY IF EXISTS "Service role full access to rewards" ON public.rewards;
CREATE POLICY "Service role full access to rewards"
    ON public.rewards FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to redemptions" ON public.redemptions;
CREATE POLICY "Service role full access to redemptions"
    ON public.redemptions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Redemptions: Users can view their own redemptions
DROP POLICY IF EXISTS "Users can view their own redemptions" ON public.redemptions;
CREATE POLICY "Users can view their own redemptions"
    ON public.redemptions FOR SELECT
    TO anon, authenticated
    USING (true);

-- 7. Seed Initial Egyptian Partner Rewards
INSERT INTO public.rewards (id, title, title_ar, description, partner_name, category, points_cost, monetary_value, stock_quantity, expiry_days)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Noon Egypt 50 EGP Voucher', 'قسيمة شراء نون مصر بقيمة 50 جنيه', 'قسيمة شراء صالحة لجميع المنتجات على منصة نون مصر بدون حد أدنى للطلب.', 'نون مصر (Noon)', 'voucher', 500, 50.00, 150, 45),
    ('c1111111-2222-2222-2222-222222222222', 'Noon Egypt 100 EGP Voucher', 'قسيمة شراء نون مصر بقيمة 100 جنيه', 'قسيمة شراء صالحة لجميع المنتجات الإلكترونية والمنزلية على نون مصر.', 'نون مصر (Noon)', 'voucher', 950, 100.00, 100, 45),
    ('c2222222-1111-1111-1111-111111111111', 'Amazon Egypt 50 EGP Gift Card', 'بطاقة هدايا أمازون مصر 50 جنيه', 'رصيد يتم إضافته مباشرة إلى حسابك في أمازون مصر للشراء من ملايين المنتجات.', 'أمازون مصر (Amazon)', 'voucher', 500, 50.00, 120, 60),
    ('c2222222-2222-2222-2222-222222222222', 'Amazon Egypt 150 EGP Gift Card', 'بطاقة هدايا أمازون مصر 150 جنيه', 'رصيد أمازون مصر للاستخدام في العروض والمنتجات الأصلية.', 'أمازون مصر (Amazon)', 'voucher', 1400, 150.00, 80, 60),
    ('c3333333-1111-1111-1111-111111111111', 'Vodafone Cash 30 EGP Top-up', 'شحن محفظة فودافون كاش 30 جنيه', 'تحويل فوري إلى رقم محفظتك في فودافون كاش للاستخدام في الفواتير والتسوق.', 'فودافون كاش (Vodafone)', 'cashback', 300, 30.00, 200, 15),
    ('c3333333-2222-2222-2222-222222222222', 'Vodafone Cash 100 EGP Top-up', 'شحن محفظة فودافون كاش 100 جنيه', 'تحويل مباشر لمحفظة فودافون كاش بدون أي مصاريف إدارية.', 'فودافون كاش (Vodafone)', 'cashback', 950, 100.00, 150, 15),
    ('c4444444-1111-1111-1111-111111111111', 'Carrefour Egypt 50 EGP Coupon', 'قسيمة خصم كارفور مصر 50 جنيه', 'صالحة للاستخدام في جميع فروع كارفور مصر أو عبر التطبيق الإلكتروني.', 'كارفور مصر (Carrefour)', 'discount', 480, 50.00, 100, 30),
    ('c4444444-2222-2222-2222-222222222222', 'Kazyon Market 40 EGP Voucher', 'قسيمة مشتريات كازيون ماركت 40 جنيه', 'قسيمة خصم مباشرة على مشترياتك في جميع فروع كازيون على مستوى الجمهورية.', 'كازيون ماركت (Kazyon)', 'discount', 380, 40.00, 100, 30),
    ('c5555555-1111-1111-1111-111111111111', 'WE Telecom Internet 50 EGP Credit', 'رصيد إنترنت منزلي WE بقيمة 50 جنيه', 'سداد جزئي أو شحن باقة إضافية للإنترنت المنزلي من وي (المصرية للاتصالات).', 'المصرية للاتصالات (WE)', 'voucher', 490, 50.00, 90, 30),
    ('c6666666-1111-1111-1111-111111111111', 'Resala Charity 50 EGP Green Donation', 'تبرع بيئي بقيمة 50 جنيه لجمعية رسالة', 'تحويل قيمة النقاط إلى مشروعات بيئية وتشجير ودعم الأسر الأكثر احتياجاً.', 'جمعية رسالة (Resala)', 'donation', 450, 50.00, 999, 365)
ON CONFLICT (id) DO NOTHING;
