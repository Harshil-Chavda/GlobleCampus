-- =============================================
-- MATERIALS TABLE SCHEMA
-- Run this in Supabase SQL Editor
-- =============================================

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Material Details
  title TEXT NOT NULL,
  description TEXT,
  material_type TEXT NOT NULL CHECK (material_type IN ('Notes', 'Important Questions', 'Question Paper', 'Assignment', 'Lab Manual')),
  
  -- Academic Info
  course TEXT NOT NULL,
  specialization TEXT NOT NULL,
  subject TEXT NOT NULL,
  university TEXT NOT NULL,
  language TEXT DEFAULT 'English',
  
  -- Meta
  uploaded_by TEXT NOT NULL,
  file_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read materials
CREATE POLICY "Materials are viewable by everyone" 
  ON materials FOR SELECT 
  USING (true);

-- Policy: Authenticated users can insert their own materials
CREATE POLICY "Users can insert their own materials" 
  ON materials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own materials
CREATE POLICY "Users can update their own materials" 
  ON materials FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own materials
CREATE POLICY "Users can delete their own materials" 
  ON materials FOR DELETE 
  USING (auth.uid() = user_id);
