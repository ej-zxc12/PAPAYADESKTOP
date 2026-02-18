-- Fix Alumni Table Structure
-- Run this in your Supabase SQL Editor

-- Add achievements column if it doesn't exist
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS achievements TEXT[];

-- Enable RLS if not already enabled
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage alumni" ON alumni;
DROP POLICY IF EXISTS "Public can read alumni" ON alumni;

-- Create new policies for authenticated users
CREATE POLICY "Users can manage alumni" ON alumni
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access (optional - remove if you want only authenticated users to see alumni)
CREATE POLICY "Public can read alumni" ON alumni
  FOR SELECT USING (true);

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alumni' 
ORDER BY ordinal_position;
