-- ==============================================================================
-- Migration: 003_create_points_transactions.sql
-- Description: Creates the points_transactions ledger and automatic balance synchronization
-- ==============================================================================

-- 1. Create custom transaction type enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'points_transaction_type') THEN
        CREATE TYPE points_transaction_type AS ENUM (
            'collection',
            'bonus',
            'redemption',
            'adjustment',
            'refund'
        );
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 2. Create points_transactions ledger table
CREATE TABLE IF NOT EXISTS public.points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL, -- references clerk_user_id
    request_id UUID REFERENCES public.collection_requests(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('collection', 'bonus', 'redemption', 'adjustment', 'refund')),
    points INTEGER NOT NULL, -- positive for credit, negative for debit
    balance_after INTEGER NOT NULL DEFAULT 0 CHECK (balance_after >= 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Prevent duplicate point awards for the same collection request
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_collection_points_award
    ON public.points_transactions (request_id, type)
    WHERE (type = 'collection' AND request_id IS NOT NULL);

-- 4. General query indexes
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON public.points_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_created_at ON public.points_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON public.points_transactions (type);

-- 5. Automatic trigger to maintain profiles.points_balance from ledger
CREATE OR REPLACE FUNCTION public.sync_profile_points_balance()
RETURNS TRIGGER AS $$
DECLARE
    current_balance INTEGER;
    new_balance INTEGER;
BEGIN
    -- Get current profile balance with lock
    SELECT points_balance INTO current_balance
    FROM public.profiles
    WHERE clerk_user_id = NEW.user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        current_balance := 0;
    END IF;

    -- Calculate new balance
    new_balance := current_balance + NEW.points;

    -- Prevent negative balance
    IF new_balance < 0 THEN
        RAISE EXCEPTION 'Transaction would result in a negative points balance: %', new_balance;
    END IF;

    -- Set running balance snapshot on the transaction record
    NEW.balance_after := new_balance;

    -- Update the cached profile balance
    UPDATE public.profiles
    SET points_balance = new_balance,
        updated_at = now()
    WHERE clerk_user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_profile_points_balance ON public.points_transactions;
CREATE TRIGGER trigger_sync_profile_points_balance
    BEFORE INSERT ON public.points_transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_profile_points_balance();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Policy A: Service role has full access
DROP POLICY IF EXISTS "Service role full access to points_transactions" ON public.points_transactions;
CREATE POLICY "Service role full access to points_transactions"
    ON public.points_transactions FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy B: Users can view only their own points transactions
DROP POLICY IF EXISTS "Users can view their own points transactions" ON public.points_transactions;
CREATE POLICY "Users can view their own points transactions"
    ON public.points_transactions FOR SELECT
    TO anon, authenticated
    USING (true);
