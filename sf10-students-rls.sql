-- Add RLS policies for sf10_students table
-- Run this in your Supabase SQL Editor

-- Enable RLS on the table
ALTER TABLE sf10_students ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read students
CREATE POLICY "Allow authenticated users to read sf10_students" ON sf10_students
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert students
CREATE POLICY "Allow authenticated users to insert sf10_students" ON sf10_students
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update students
CREATE POLICY "Allow authenticated users to update sf10_students" ON sf10_students
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete students
CREATE POLICY "Allow authenticated users to delete sf10_students" ON sf10_students
  FOR DELETE USING (auth.role() = 'authenticated');

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'sf10_students';
