-- Add achievements column to existing alumni table
-- Run this in your Supabase SQL Editor

-- Add achievements column if it doesn't exist
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS achievements TEXT[];

-- Enable RLS on alumni table (safe to run even if already enabled)
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- Create/replace policies for alumni table
DROP POLICY IF EXISTS "Users can manage alumni" ON alumni;
DROP POLICY IF EXISTS "Public can read alumni" ON alumni;

-- Allow authenticated users to manage alumni
CREATE POLICY "Users can manage alumni" ON alumni
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public can read alumni" ON alumni
  FOR SELECT USING (true);

-- Verify the alumni table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alumni' 
ORDER BY ordinal_position;
