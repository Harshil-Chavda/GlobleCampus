-- =============================================
-- GLOBLECAMPUS — COMPLETE DATABASE SCHEMA v2
-- Includes: Profiles, Materials, GC-Tokens, Admin
-- Run this in Supabase SQL Editor
-- =============================================


-- ==========================================
-- 1. PROFILES TABLE (Users + Admin + Tokens)
-- ==========================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK (role IN ('student', 'professional')),
  about TEXT,
  country TEXT,
  state TEXT,
  
  -- Student fields
  college TEXT,
  specialization TEXT,
  skills TEXT,
  
  -- Professional fields
  company TEXT,
  job_role TEXT,
  
  -- Admin & Tokens
  is_admin BOOLEAN DEFAULT FALSE,
  gc_token_balance NUMERIC DEFAULT 15,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);


-- ==========================================
-- 2. MATERIALS TABLE (with approval status)
-- ==========================================

CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('Notes', 'Important Questions', 'Question Paper', 'Assignment', 'Lab Manual')),
  
  course TEXT NOT NULL,
  specialization TEXT NOT NULL,
  subject TEXT NOT NULL,
  university TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  
  uploaded_by TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  
  -- Approval system
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  gc_tokens_awarded INTEGER DEFAULT 0,
  admin_note TEXT,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "materials_select_approved" ON materials FOR SELECT USING (
  status = 'approved' OR auth.uid() = user_id
);
CREATE POLICY "materials_insert" ON materials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "materials_update" ON materials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "materials_delete" ON materials FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 3. BLOGS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "blogs_select" ON blogs FOR SELECT USING (true);
CREATE POLICY "blogs_insert" ON blogs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "blogs_update" ON blogs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "blogs_delete" ON blogs FOR DELETE USING (auth.uid() = user_id);


CREATE TABLE IF NOT EXISTS videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  category TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "videos_select" ON videos FOR SELECT USING (true);
CREATE POLICY "videos_insert" ON videos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "videos_update" ON videos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "videos_delete" ON videos FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 6. MARKETPLACE TABLE
-- ==========================================

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

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "marketplace_select" ON marketplace_items FOR SELECT USING (true);
CREATE POLICY "marketplace_insert" ON marketplace_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "marketplace_update" ON marketplace_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "marketplace_delete" ON marketplace_items FOR DELETE USING (auth.uid() = user_id);


-- ==========================================
-- 7. CONTACT QUERIES
-- ==========================================

CREATE TABLE IF NOT EXISTS contact_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact_insert" ON contact_queries FOR INSERT WITH CHECK (true);


-- ==========================================
-- 8. GC-TOKEN TRANSACTIONS
-- ==========================================

CREATE TABLE IF NOT EXISTS gc_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  amount NUMERIC NOT NULL,  -- supports decimals like 0.25, 0.50
  type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'bonus')),
  description TEXT,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE gc_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own" ON gc_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert" ON gc_transactions FOR INSERT WITH CHECK (true);


-- ==========================================
-- 4. SUPPORT QUERIES (GC Premium Pro)
-- ==========================================

CREATE TABLE IF NOT EXISTS support_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  
  subject TEXT NOT NULL,
  course TEXT,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'urgent')),
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'resolved')),
  admin_response TEXT,
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE support_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "queries_select_own" ON support_queries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "queries_insert" ON support_queries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_select_queries" ON support_queries FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));
CREATE POLICY "admin_update_queries" ON support_queries FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ==========================================
-- 5. ADMIN POLICIES (allow admins full access)
-- ==========================================

-- Admin can update any material (for approve/reject)
CREATE POLICY "admin_update_materials" ON materials FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Admin can view all profiles
CREATE POLICY "admin_update_profiles" ON profiles FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Admin can view all transactions
CREATE POLICY "admin_select_transactions" ON gc_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));


-- ==========================================
-- 6. STORAGE BUCKET (for file uploads)
-- ==========================================
-- NOTE: Create a storage bucket called "materials" manually in
-- Supabase Dashboard > Storage > New Bucket
-- Set it to PUBLIC so files can be downloaded


-- ==========================================
-- ✅ SCHEMA COMPLETE — v3
-- GC-Token Economy: 15 free on signup, 0.25/0.50 downloads
-- Premium Pro: Unlocked at 50+ GC, support query system
-- ==========================================

