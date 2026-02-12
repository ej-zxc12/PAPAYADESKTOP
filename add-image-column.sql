-- Add image_url column to alumni table
-- Run this in your Supabase SQL Editor

ALTER TABLE alumni ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alumni' AND column_name = 'image_url'
ORDER BY ordinal_position;
