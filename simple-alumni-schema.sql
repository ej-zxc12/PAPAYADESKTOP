-- Simple Alumni Table Schema - Matches Your App Exactly
-- Run this in your Supabase SQL Editor

-- Drop existing alumni table to start fresh
DROP TABLE IF EXISTS alumni CASCADE;

-- Create alumni table with exact structure your app expects
CREATE TABLE alumni (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    batchYear INTEGER NOT NULL,
    programOrGrade VARCHAR(255) NOT NULL,
    achievements TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;

-- Create policies for alumni
CREATE POLICY "Users can manage alumni" ON alumni
  FOR ALL USING (auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public can read alumni" ON alumni
  FOR SELECT USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_alumni_batchyear ON alumni(batchYear);

-- Verify table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alumni' 
ORDER BY ordinal_position;
