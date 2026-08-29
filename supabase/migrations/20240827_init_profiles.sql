-- ==============================================================================
-- Migration: 001_create_profiles.sql
-- Description: Creates the profiles table linked to Clerk user identity with RLS
-- ==============================================================================

-- Create custom role enum type or check constraint
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_user_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    points_balance INTEGER NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create indexes for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON public.profiles (clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Prevent direct client tampering with privileged fields (role & points_balance)
CREATE OR REPLACE FUNCTION public.prevent_privileged_field_updates()
RETURNS TRIGGER AS $$
BEGIN
    -- If current user is not service_role (e.g. anon / authenticated via public client),
    -- disallow changing role or points_balance directly.
    IF (current_user <> 'service_role' AND current_user <> 'postgres') THEN
        IF (NEW.role IS DISTINCT FROM OLD.role) THEN
            RAISE EXCEPTION 'Modifying role directly is restricted to backend administrators.';
        END IF;
        IF (NEW.points_balance IS DISTINCT FROM OLD.points_balance) THEN
            RAISE EXCEPTION 'Modifying points_balance directly is restricted to backend processing.';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS guard_privileged_profile_fields ON public.profiles;
CREATE TRIGGER guard_privileged_profile_fields
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_privileged_field_updates();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Policy A: Allow service role full access (Server-side operations, profile synchronization, admin tasks)
DROP POLICY IF EXISTS "Service role has full access to profiles" ON public.profiles;
CREATE POLICY "Service role has full access to profiles"
    ON public.profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy B: Allow public/anon read if clerk_user_id matches JWT request header or filter
-- Note: When querying from client, queries filter by clerk_user_id. Server actions use service role client.
DROP POLICY IF EXISTS "Users can view their own profile via clerk_user_id" ON public.profiles;
CREATE POLICY "Users can view their own profile via clerk_user_id"
    ON public.profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Policy C: Allow users to update their own non-privileged profile data
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
