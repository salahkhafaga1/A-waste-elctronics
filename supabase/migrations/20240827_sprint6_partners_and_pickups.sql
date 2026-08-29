-- ==============================================================================
-- Migration: 20240827_sprint6_partners_and_pickups.sql
-- Description: Creates partners & pickup_assignments tables and seeds Egyptian partners
-- ==============================================================================

-- 1. Create partners table
CREATE TABLE IF NOT EXISTS public.partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('recycler', 'collection_point', 'transport', 'business')),
    phone TEXT,
    email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'القاهرة',
    governorate TEXT NOT NULL DEFAULT 'القاهرة',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'busy')),
    capacity_kg INTEGER DEFAULT 1000,
    working_hours TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create pickup_assignments table
CREATE TABLE IF NOT EXISTS public.pickup_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.collection_requests(id) ON DELETE CASCADE,
    partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    scheduled_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('pending', 'assigned', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    driver_name TEXT,
    driver_phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_partners_type ON public.partners (type);
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners (status);
CREATE INDEX IF NOT EXISTS idx_partners_governorate ON public.partners (governorate);
CREATE INDEX IF NOT EXISTS idx_pickup_assignments_request_id ON public.pickup_assignments (request_id);
CREATE INDEX IF NOT EXISTS idx_pickup_assignments_partner_id ON public.pickup_assignments (partner_id);
CREATE INDEX IF NOT EXISTS idx_pickup_assignments_status ON public.pickup_assignments (status);

-- 4. Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_assignments ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Public / authenticated can read active collection points and partners
DROP POLICY IF EXISTS "Public can view active collection points and partners" ON public.partners;
CREATE POLICY "Public can view active collection points and partners"
    ON public.partners FOR SELECT
    TO anon, authenticated
    USING (status = 'active');

-- Service role has full access
DROP POLICY IF EXISTS "Service role full access to partners" ON public.partners;
CREATE POLICY "Service role full access to partners"
    ON public.partners FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to pickup_assignments" ON public.pickup_assignments;
CREATE POLICY "Service role full access to pickup_assignments"
    ON public.pickup_assignments FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Seed Initial Egyptian Partners across Categories
INSERT INTO public.partners (id, name, name_ar, type, phone, email, address, city, governorate, latitude, longitude, status, capacity_kg, working_hours)
VALUES
    -- 1. COLLECTION POINTS
    (
        'd1111111-1111-1111-1111-111111111111',
        'Cairo University Green Hub',
        'مركز جامعة القاهرة لتدوير الإلكترونيات',
        'collection_point',
        '0235678900',
        'greenhub@cu.edu.eg',
        'الحرم الجامعي الرئيسي، بجوار كلية الهندسة',
        'الجيزة',
        'الجيزة',
        30.0264,
        31.2118,
        'active',
        2000,
        'يومياً من 9 صباحاً حتى 4 مساءً (عدا الجمعة)'
    ),
    (
        'd1111111-2222-2222-2222-222222222222',
        'Smart Village Drop-off Hub',
        'نقطة تجميع القرية الذكية (Smart Village Hub)',
        'collection_point',
        '01099887766',
        'smartdrop@e-waste.eg',
        'مبنى B12، القرية الذكية، طريق مصر إسكندرية الصحراوي',
        '6 أكتوبر',
        'الجيزة',
        30.0766,
        31.0205,
        'active',
        3000,
        'الأحد إلى الخميس: 8:30 ص - 5:30 م'
    ),
    (
        'd1111111-3333-3333-3333-333333333333',
        'Resala Recycling Center Maadi',
        'مركز جمعية رسالة لإعادة التدوير - المعادي',
        'collection_point',
        '19450',
        'maadi@resala.org',
        'شارع النصر، تقاطع اللاسلكي، المعادي الجديدة',
        'المعادي',
        'القاهرة',
        29.9765,
        31.2825,
        'active',
        1500,
        'يومياً من 10 صباحاً حتى 9 مساءً'
    ),
    (
        'd1111111-4444-4444-4444-444444444444',
        'Alexandria Green Hub Smouha',
        'نقطة تجميع الإسكندرية الخضراء - سموحة',
        'collection_point',
        '034255100',
        'alexhub@e-waste.eg',
        'ميدان فيكتور عمانويل، سموحة',
        'سموحة',
        'الإسكندرية',
        31.2166,
        29.9567,
        'active',
        2500,
        'يومياً من 10 صباحاً حتى 8 مساءً'
    ),

    -- 2. TRANSPORT & LOGISTICS
    (
        'd2222222-1111-1111-1111-111111111111',
        'Green Express Logistics Fleet',
        'أسطول جرين إكسبريس للشحن الأخضر',
        'transport',
        '01011223344',
        'operations@greenexpress.eg',
        'المنطقة الصناعية، التجمع الخامس',
        'القاهرة الجديدة',
        'القاهرة',
        30.0150,
        31.4320,
        'active',
        10000,
        '24/7 خدمات الاستلام المجدول'
    ),
    (
        'd2222222-2222-2222-2222-222222222222',
        'Cairo Eco-Courier Network',
        'شبكة مندوبي تدوير القاهرة الكبرى',
        'transport',
        '01155443322',
        'fleet@cairoeco.eg',
        'شارع مصطفى النحاس، مدينة نصر',
        'مدينة نصر',
        'القاهرة',
        30.0560,
        31.3450,
        'active',
        8000,
        'يومياً من 8 صباحاً حتى 10 مساءً'
    ),

    -- 3. RECYCLING SMELTERS & PLANTS
    (
        'd3333333-1111-1111-1111-111111111111',
        'EGY-Recycle Metal Refining Plant',
        'مصنع إيجي ريسايكل لاستخلاص المعادن النفيسة',
        'recycler',
        '0238334455',
        'plant@egy-recycle.com',
        'المنطقة الصناعية الثالثة، مدينة 6 أكتوبر',
        '6 أكتوبر',
        'الجيزة',
        29.9288,
        30.9167,
        'active',
        50000,
        'خطوط إنتاج مستمرة معتمدة بيئياً'
    ),
    (
        'd3333333-2222-2222-2222-222222222222',
        'Delta Smelting & E-Waste Refining',
        'مجمع دلتا للصهر وإعادة تدوير البوردات الإلكترونية',
        'recycler',
        '01244332211',
        'info@deltasmelting.eg',
        'المنطقة الصناعية بقويسنا، المنوفية',
        'قويسنا',
        'المنوفية',
        30.5833,
        31.1500,
        'active',
        40000,
        'فصل البوردات والدوائر الإلكترونية'
    ),

    -- 4. BUSINESS PARTNERS
    (
        'd4444444-1111-1111-1111-111111111111',
        'TechFix E-Repair & Buyback Stores',
        'سلسلة فروع تك فيكس للصيانة واستبدال الأجهزة',
        'business',
        '01099112233',
        'partnerships@techfix.eg',
        'شارع مكرم عبيد، مدينة نصر',
        'مدينة نصر',
        'القاهرة',
        30.0600,
        31.3400,
        'active',
        2000,
        'يومياً من 11 صباحاً حتى 11 مساءً'
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    name_ar = EXCLUDED.name_ar,
    type = EXCLUDED.type,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    city = EXCLUDED.city,
    governorate = EXCLUDED.governorate,
    status = EXCLUDED.status,
    working_hours = EXCLUDED.working_hours;
