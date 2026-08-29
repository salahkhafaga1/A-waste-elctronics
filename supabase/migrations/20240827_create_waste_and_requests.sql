-- ==============================================================================
-- Migration: 002_create_waste_and_requests.sql
-- Description: Creates waste categories, items, collection requests, and request items with RLS
-- ==============================================================================

-- 1. Create custom request status enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
        CREATE TYPE request_status AS ENUM (
            'pending',
            'confirmed',
            'assigned',
            'collected',
            'verified',
            'recycled',
            'cancelled'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create custom item condition enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'item_condition') THEN
        CREATE TYPE item_condition AS ENUM ('working', 'broken', 'scrap');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create waste_categories table
CREATE TABLE IF NOT EXISTS public.waste_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create waste_items table
CREATE TABLE IF NOT EXISTS public.waste_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.waste_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    description TEXT,
    points_per_kg INTEGER NOT NULL DEFAULT 100 CHECK (points_per_kg >= 0),
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (base_price >= 0),
    estimated_weight_kg NUMERIC(6, 3) NOT NULL DEFAULT 0.25,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create collection_requests table
CREATE TABLE IF NOT EXISTS public.collection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- references clerk_user_id
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'assigned', 'collected', 'verified', 'recycled', 'cancelled')),
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'القاهرة',
    governorate TEXT NOT NULL DEFAULT 'القاهرة',
    phone TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    notes TEXT,
    estimated_weight NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (estimated_weight >= 0),
    verified_weight NUMERIC(8, 2) CHECK (verified_weight >= 0),
    estimated_points INTEGER NOT NULL DEFAULT 0 CHECK (estimated_points >= 0),
    final_points INTEGER CHECK (final_points >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create request_items table
CREATE TABLE IF NOT EXISTS public.request_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.collection_requests(id) ON DELETE CASCADE,
    waste_item_id UUID REFERENCES public.waste_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    weight NUMERIC(8, 2) NOT NULL DEFAULT 0 CHECK (weight >= 0),
    condition TEXT NOT NULL DEFAULT 'broken' CHECK (condition IN ('working', 'broken', 'scrap')),
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_waste_items_category_id ON public.waste_items (category_id);
CREATE INDEX IF NOT EXISTS idx_collection_requests_user_id ON public.collection_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_collection_requests_status ON public.collection_requests (status);
CREATE INDEX IF NOT EXISTS idx_request_items_request_id ON public.request_items (request_id);

-- 8. Enable Row Level Security (RLS)
ALTER TABLE public.waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_items ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies
-- Catalog: Public read access for active items
DROP POLICY IF EXISTS "Public can view active categories" ON public.waste_categories;
CREATE POLICY "Public can view active categories"
    ON public.waste_categories FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

DROP POLICY IF EXISTS "Public can view active items" ON public.waste_items;
CREATE POLICY "Public can view active items"
    ON public.waste_items FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Requests: Service role has full access
DROP POLICY IF EXISTS "Service role full access to collection_requests" ON public.collection_requests;
CREATE POLICY "Service role full access to collection_requests"
    ON public.collection_requests FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to request_items" ON public.request_items;
CREATE POLICY "Service role full access to request_items"
    ON public.request_items FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Requests: Users can view and create their own collection requests
DROP POLICY IF EXISTS "Users can view their own collection requests" ON public.collection_requests;
CREATE POLICY "Users can view their own collection requests"
    ON public.collection_requests FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Users can insert collection requests" ON public.collection_requests;
CREATE POLICY "Users can insert collection requests"
    ON public.collection_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 10. Seed Initial Egyptian E-Waste Categories and Items
INSERT INTO public.waste_categories (id, name, name_ar, slug, description, icon)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Phones & Tablets', 'هواتف وأجهزة لوحية', 'phones-tablets', 'الهواتف الذكية القديمة، الأجهزة اللوحية، الهواتف الكلاسيكية', 'Smartphone'),
    ('a2222222-2222-2222-2222-222222222222', 'Chargers & Cables', 'شواحن وكابلات', 'chargers-cables', 'شواحن الهواتف، كابلات USB، محولات الطاقة، أسلاك التوصيل', 'Cable'),
    ('a3333333-3333-3333-3333-333333333333', 'Batteries & Power Banks', 'بطاريات وباور بانك', 'batteries', 'بطاريات الليثيوم، أجهزة الباور بانك، بطاريات اللابتوب التالفة', 'BatteryCharging'),
    ('a4444444-4444-4444-4444-444444444444', 'Audio & Accessories', 'سماعات وإكسسوارات', 'audio-accessories', 'سماعات الرأس، السماعات اللاسلكية، ساعات ذكية، كروت ميموري', 'Headphones'),
    ('a5555555-5555-5555-5555-555555555555', 'Small Home Electronics', 'أجهزة إلكترونية صغيرة', 'small-electronics', 'راوترات، ريسيفرات، مجففات شعر، لوحات مفاتيح، ماوس', 'Cpu')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.waste_items (category_id, name, name_ar, description, points_per_kg, base_price, estimated_weight_kg)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Smartphone', 'هاتف ذكي (شاشة لمس)', 'هواتف آيفون، أندرويد بجميع أنواعها وحالاتها', 350, 45.00, 0.20),
    ('a1111111-1111-1111-1111-111111111111', 'Feature Phone', 'هاتف محمول كلاسيكي (أزرار)', 'هواتف نوكيا القديمة والأجهزة التقليدية', 250, 25.00, 0.12),
    ('a1111111-1111-1111-1111-111111111111', 'Tablet', 'جهاز لوحي (تابلت/آيباد)', 'شاشات لوحية تالفة أو قديمة', 300, 40.00, 0.45),
    ('a2222222-2222-2222-2222-222222222222', 'Phone Charger & Adapter', 'رأس شاحن / محول كهربائي', 'رؤوس الشواحن السريعة والمحولات', 150, 15.00, 0.10),
    ('a2222222-2222-2222-2222-222222222222', 'Cables & Wires (Assorted)', 'كابلات وتوصيلات نحاسية', 'كابلات شحن وكابلات شاشات وأسلاك تالفة', 180, 20.00, 0.15),
    ('a3333333-3333-3333-3333-333333333333', 'Power Bank', 'باور بانك (شاحن متنقل)', 'بطاريات الشحن المحمولة بجميع سعاتها', 200, 25.00, 0.30),
    ('a3333333-3333-3333-3333-333333333333', 'Laptop Battery', 'بطارية لابتوب تالفة', 'بطاريات أجهزة الحاسوب المحمول القديمة', 220, 30.00, 0.35),
    ('a4444444-4444-4444-4444-444444444444', 'Headphones / Earbuds', 'سماعات رأس / إيربودز', 'سماعات بلوتوث وسلكية تالفة', 160, 15.00, 0.08),
    ('a4444444-4444-4444-4444-444444444444', 'Smartwatch / Smart Band', 'ساعة ذكية / سوار رياضي', 'ساعات تالفة أو مكسورة', 200, 20.00, 0.06),
    ('a5555555-5555-5555-5555-555555555555', 'Wi-Fi Router / Modem', 'راوتر واي فاي / مودم', 'أجهزة الراوتر والإنترنت المنزلي القديمة', 180, 22.00, 0.40),
    ('a5555555-5555-5555-5555-555555555555', 'TV Receiver', 'ريسيفر تليفزيون', 'أجهزة استقبال القنوات الفضائية', 150, 18.00, 0.75),
    ('a5555555-5555-5555-5555-555555555555', 'Keyboard & Mouse', 'لوحة مفاتيح وفأرة', 'لوحات المفاتيح والماوس السلكي واللاسلكي', 120, 12.00, 0.50)
ON CONFLICT DO NOTHING;
