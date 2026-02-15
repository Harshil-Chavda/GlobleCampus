-- ============================================================
-- MIGRATION V4: Fix Marketplace Status Constraint
-- Run this to allow 'pending' status for marketplace items
-- ============================================================

DO $$ 
BEGIN 
    -- 1. Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'marketplace_items_status_check') THEN
        ALTER TABLE marketplace_items DROP CONSTRAINT marketplace_items_status_check;
    END IF;

    -- 2. Add new constraint including 'pending' and 'removed'
    ALTER TABLE marketplace_items ADD CONSTRAINT marketplace_items_status_check 
    CHECK (status IN ('pending', 'active', 'sold', 'removed'));
    
END $$;
