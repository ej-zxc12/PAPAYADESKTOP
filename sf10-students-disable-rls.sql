-- Disable RLS for sf10_students table (for testing only)
-- Run this in your Supabase SQL Editor

ALTER TABLE sf10_students DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'sf10_students';
