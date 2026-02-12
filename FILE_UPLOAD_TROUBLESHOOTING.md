# 🚨 FILE UPLOAD TROUBLESHOOTING CHECKLIST

## Step 1: Check Database Table
Run this in Supabase SQL Editor:
```sql
SELECT 'sf10_documents table exists: ' || 
       CASE WHEN EXISTS (
           SELECT 1 FROM information_schema.tables 
           WHERE table_name = 'sf10_documents'
       ) THEN 'YES' ELSE 'NO' END as table_exists;
```

**Expected Result:** `sf10_documents table exists: YES`

---

## Step 2: Check Storage Bucket
In Supabase Dashboard → Storage:
1. **Is there a bucket named `sf10-documents`?**
2. **Bucket Policy:** Should be "Public" for read access
3. **Max File Size:** Should be 10MB or higher

**If bucket doesn't exist:**
- Click "New bucket"
- Name: `sf10-documents`
- Public bucket: ✅
- File size limit: 10485760 (10MB)
- Allowed file types: *

---

## Step 3: Test Simple Upload
Run this test SQL:
```sql
-- Run the test-document-upload.sql file
-- This will test if your table can accept documents
```

---

## Step 4: Check Browser Console
Open your app, try to upload a file, and check F12 console for:

### ✅ GOOD LOGS:
```
Files selected: [File]
Processing file: test.pdf application/pdf 204800
File added to upload list: test.pdf
Updating uploadedFiles state with: 1 files
New uploadedFiles state: [{id: "123", name: "test.pdf", ...}]
Starting upload of 1 files for student 123
Uploading to path: 123/test-123.pdf
File uploaded successfully to storage
Public URL: https://xxx.supabase.co/storage/v1/object/public/123/test-123.pdf
Document saved to database: {id: "456", ...}
Upload complete: 1 successful, 0 failed
✅ Uploaded 1 documents successfully
```

### ❌ BAD LOGS:
```
Upload error: Bucket not found
❌ Upload error: storage/bucket_not_found
❌ Database error: permission denied
❌ Error fetching documents: relation "sf10_documents" does not exist
```

---

## Step 5: Check RLS Policies
Run this to check if RLS is blocking:
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'sf10_documents';
```

**You should see:**
- `Users can manage their own student documents` (permissive: true)
- `Users can view all student documents` (permissive: true)

---

## Most Common Issues:

### 🚨 **"Bucket not found"**
- **Solution:** Create the `sf10-documents` bucket in Supabase Storage

### 🚨 **"Permission denied"**
- **Solution:** Check RLS policies, might be too restrictive

### 🚨 **"Relation does not exist"**
- **Solution:** Run the schema creation SQL first

### 🚨 **Files not showing in modal**
- **Solution:** Check if `handleViewDocuments` is being called
- **Solution:** Check if `studentDocuments` state is being set

---

## Quick Fix Test:
1. **Create bucket** `sf10-documents`
2. **Run schema** SQL file  
3. **Test upload** with a small PDF
4. **Check console** for debug logs

**If still not working, the issue is likely in Step 1 or 2!**
