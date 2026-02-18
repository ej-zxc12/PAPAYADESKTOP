-- ONLY Fix Alumni Table - Don't Touch Other Tables
-- Run this in your Supabase SQL Editor

-- Drop existing alumni table
DROP TABLE IF EXISTS alumni CASCADE;

-- Create alumni table with correct structure
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

-- Create policies
CREATE POLICY "Users can manage alumni" ON alumni
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read alumni" ON alumni
  FOR SELECT USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_alumni_batchyear ON alumni(batchYear);

-- Create trigger
CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON alumni FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alumni' 
ORDER BY ordinal_position;
