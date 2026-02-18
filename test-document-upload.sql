-- TEST DOCUMENT UPLOAD
-- Run this to test if your sf10_documents table is working

-- 1. Check if table exists
SELECT 'sf10_documents table exists: ' || 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'sf10_documents'
       ) THEN 'YES' ELSE 'NO' END as table_exists;

-- 2. Check table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'sf10_documents'
ORDER BY ordinal_position;

-- 3. Check if any documents exist
SELECT COUNT(*) as total_documents,
       MAX(uploaded_at) as latest_upload
FROM sf10_documents;

-- 4. Test insert a sample document
INSERT INTO sf10_documents (
    student_id, 
    document_url, 
    document_name, 
    document_type, 
    file_size, 
    uploaded_at, 
    file_path, 
    is_required
) VALUES (
    (SELECT id FROM sf10_students LIMIT 1),  -- Use first student
    'https://test.com/test.pdf',
    'test-document.pdf',
    'application/pdf',
    1024,
    NOW(),
    'test/test.pdf',
    TRUE
);

-- 5. Verify the insert
SELECT 'Test document inserted with ID: ' || id 
FROM sf10_documents 
WHERE document_name = 'test-document.pdf';

-- 6. Clean up test document
DELETE FROM sf10_documents 
WHERE document_name = 'test-document.pdf';
