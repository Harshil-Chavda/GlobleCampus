-- ============================================================
-- MIGRATION V3: Videos, Marketplace, Contact
-- Run this in Supabase SQL Editor to fix missing columns/tables
-- ============================================================

-- 1. Fix Videos Table (Add missing columns if they don't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'status') THEN
        ALTER TABLE videos ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'user_id') THEN
        ALTER TABLE videos ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'videos' AND column_name = 'thumbnail_url') THEN
        ALTER TABLE videos ADD COLUMN thumbnail_url TEXT;
    END IF;
END $$;

-- 2. Create Marketplace Items Table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sell', 'rent')),
  category TEXT,
  image_url TEXT,
  contact_info TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Marketplace
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'marketplace_select') THEN
        CREATE POLICY "marketplace_select" ON marketplace_items FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'marketplace_insert') THEN
        CREATE POLICY "marketplace_insert" ON marketplace_items FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'marketplace_update') THEN
        CREATE POLICY "marketplace_update" ON marketplace_items FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_items' AND policyname = 'marketplace_delete') THEN
        CREATE POLICY "marketplace_delete" ON marketplace_items FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Create Contact Queries Table
CREATE TABLE IF NOT EXISTS contact_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Contact Queries
ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'contact_queries' AND policyname = 'contact_insert') THEN
        CREATE POLICY "contact_insert" ON contact_queries FOR INSERT WITH CHECK (true);
    END IF;
END $$;
