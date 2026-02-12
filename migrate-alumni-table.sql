-- Migrate alumni table to match app structure
-- This will add missing columns and keep existing ones

-- Add new columns that your app needs
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS batchYear INTEGER;
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS programOrGrade VARCHAR(255);
ALTER TABLE alumni ADD COLUMN IF NOT EXISTS achievements TEXT[];

-- Migrate data from old columns to new ones
UPDATE alumni 
SET name = COALESCE(TRIM(first_name || ' ' || COALESCE(middle_name || ' ', '') || last_name), '')
WHERE name IS NULL AND (first_name IS NOT NULL OR last_name IS NOT NULL);

UPDATE alumni 
SET batchYear = graduation_year 
WHERE batchYear IS NULL AND graduation_year IS NOT NULL;

UPDATE alumni 
SET programOrGrade = strand_track 
WHERE programOrGrade IS NULL AND strand_track IS NOT NULL;

-- Set old name columns to empty string instead of NULL (to satisfy NOT NULL constraint)
UPDATE alumni 
SET last_name = '' 
WHERE last_name IS NULL AND name IS NOT NULL;

UPDATE alumni 
SET first_name = '' 
WHERE first_name IS NULL AND name IS NOT NULL;

-- Optional: Drop old columns after migration (commented out for safety)
-- ALTER TABLE alumni DROP COLUMN IF EXISTS first_name;
-- ALTER TABLE alumni DROP COLUMN IF EXISTS last_name;
-- ALTER TABLE alumni DROP COLUMN IF EXISTS middle_name;
-- ALTER TABLE alumni DROP COLUMN IF EXISTS lrn;
-- ALTER TABLE alumni DROP COLUMN IF EXISTS graduation_year;
-- ALTER TABLE alumni DROP COLUMN IF EXISTS strand_track;

-- Verify the final structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'alumni' 
ORDER BY ordinal_position;
