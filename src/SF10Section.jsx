import React, { useMemo, useState, useEffect } from 'react'
import { FiFileText, FiDownload, FiPrinter, FiEdit2, FiTrash2, FiPlus, FiArrowLeft, FiUpload, FiX, FiUserPlus, FiSave, FiEye, FiRefreshCw, FiPaperclip, FiFolder, FiExternalLink, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { uiText } from './content/uiText'
import { formatPersonName, includesQuery } from './sf10Utils'
import { supabase } from './lib/supabase'

function downloadMockPdf({ filename, payload }) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function buildStudentSearchKey(student) {
  return [student.id, student.lrn, student.first_name, student.middle_name, student.last_name]
    .filter(Boolean)
    .join(' ')
}

export default function SF10Section({ students, sf10ByStudentId, onViewSf10, onRemoveStudent, onAddStudent, onEditSf10 }) {
  const [query, setQuery] = useState('')
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [addingStudent, setAddingStudent] = useState(false)
  const [addStudentError, setAddStudentError] = useState('')
  const [addStudentSuccess, setAddStudentSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDocuments, setStudentDocuments] = useState([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [fixingPaths, setFixingPaths] = useState(false)
  const [fixingUrls, setFixingUrls] = useState(false)

  // Add Student Form State
  const [studentForm, setStudentForm] = useState({
    lrn: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    name_extension: '',
    birth_date: '',
    sex: '',
    grade_level: '',
    section: '',
    school_year: new Date().getFullYear().toString(),
    status: 'Active',
    requires_sf10: false
  })

  const [uploadedFiles, setUploadedFiles] = useState([])

  const filtered = useMemo(() => {
    return students.filter((s) => includesQuery(buildStudentSearchKey(s), query))
  }, [students, query])

  // ============== CHECK DATABASE SCHEMA ==============
  const checkDatabaseSchema = async () => {
    try {
      setDebugInfo('🔍 Checking database schema...')
      
      const { data, error } = await supabase
        .from('sf10_documents')
        .select('*')
        .limit(1)
      
      if (error) {
        console.error('Schema check error:', error)
        
        if (error.code === '42P01') {
          setDebugInfo('❌ Table "sf10_documents" does not exist!')
          alert('❌ Table "sf10_documents" does not exist! Please run the database schema.')
        } else if (error.code === '42501') {
          setDebugInfo('❌ Permission denied for sf10_documents table')
          alert('❌ Permission denied. Check RLS policies.')
        } else {
          setDebugInfo(`❌ Schema error: ${error.message}`)
          alert(`Error: ${error.message}`)
        }
        return
      }
      
      const { count, error: countError } = await supabase
        .from('sf10_documents')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('Count error:', countError)
      }
      
      setDebugInfo(`✅ sf10_documents table exists with ${count || 0} records`)
      alert(`✅ sf10_documents table is ready!
━━━━━━━━━━━━━━━━━━━━━
Total documents: ${count || 0}
Table exists: ✓
RLS: ${error?.code === '42501' ? '⚠️ Enabled' : '✓ Configured'}`)
      
    } catch (err) {
      console.error('Schema check error:', err)
      setDebugInfo(`❌ Error: ${err.message}`)
      alert(`❌ Schema check failed: ${err.message}`)
    }
  }

  // ============== VERIFY DOCUMENTS IN DATABASE ==============
  const verifyDocumentsInDB = async () => {
    try {
      const { data, error } = await supabase
        .from('sf10_documents')
        .select('*, sf10_students(first_name, last_name, lrn)')
        .order('uploaded_at', { ascending: false })
        .limit(10)
      
      if (error) {
        console.error('Error verifying documents:', error)
        alert(`Error: ${error.message}`)
        return
      }
      
      console.log('Latest documents with students:', data)
      
      let message = `Found ${data?.length || 0} documents in database\n\n`
      data?.forEach((doc, i) => {
        const student = doc.sf10_students
        message += `${i+1}. ${doc.document_name} - ${student?.first_name || 'Unknown'} ${student?.last_name || ''}\n`
      })
      
      alert(message)
      setDebugInfo(`📄 Found ${data?.length || 0} total documents in database`)
    } catch (err) {
      console.error('Verification error:', err)
      alert(`Error: ${err.message}`)
    }
  }

  // ============== FIX EXISTING DOCUMENT PATHS ==============
  const fixExistingDocumentPaths = async () => {
    try {
      setFixingPaths(true)
      setDebugInfo('🔧 Fixing existing document paths...')
      
      const { data: docs, error: fetchError } = await supabase
        .from('sf10_documents')
        .select('*')
        .or('file_path.ilike.%sf10-documents/%,file_path.ilike.%sf10-documents%')
      
      if (fetchError) {
        console.error('Error fetching documents:', fetchError)
        setDebugInfo(`❌ Failed to fetch documents: ${fetchError.message}`)
        setFixingPaths(false)
        return
      }
      
      if (!docs || docs.length === 0) {
        setDebugInfo('✅ No documents need fixing!')
        setFixingPaths(false)
        return
      }
      
      console.log(`Found ${docs.length} documents to fix:`, docs)
      
      let fixed = 0
      for (const doc of docs) {
        // Remove any instance of sf10-documents/ from the path
        let correctPath = doc.file_path
        if (correctPath.includes('sf10-documents/')) {
          correctPath = correctPath.split('sf10-documents/').pop()
        }
        if (correctPath.includes('sf10-documents')) {
          correctPath = correctPath.replace('sf10-documents', '')
        }
        
        // Generate correct public URL
        const { data: { publicUrl } } = supabase.storage
          .from('sf10-documents')
          .getPublicUrl(correctPath)
        
        const { error: updateError } = await supabase
          .from('sf10_documents')
          .update({ 
            file_path: correctPath,
            document_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', doc.id)
        
        if (updateError) {
          console.error(`Failed to update document ${doc.id}:`, updateError)
        } else {
          fixed++
          console.log(`✅ Fixed: ${doc.file_path} -> ${correctPath}`)
        }
      }
      
      setDebugInfo(`✅ Fixed ${fixed} of ${docs.length} document paths and URLs! Refresh the page.`)
      alert(`Fixed ${fixed} document paths! Please refresh the page to see your documents.`)
      
    } catch (err) {
      console.error('Error fixing paths:', err)
      setDebugInfo(`❌ Error fixing paths: ${err.message}`)
    } finally {
      setFixingPaths(false)
    }
  }

  // ============== FIX MISSING DOCUMENT URLS ==============
  const fixMissingDocumentUrls = async () => {
    try {
      setFixingUrls(true)
      setDebugInfo('🔧 Fixing missing document_url fields...')
      
      // Get documents with missing document_url
      const { data: docs, error: fetchError } = await supabase
        .from('sf10_documents')
        .select('*')
        .is('document_url', null)
      
      if (fetchError) {
        console.error('Error fetching documents:', fetchError)
        setDebugInfo(`❌ Failed to fetch documents: ${fetchError.message}`)
        setFixingUrls(false)
        return
      }
      
      if (!docs || docs.length === 0) {
        setDebugInfo('✅ No documents missing document_url!')
        setFixingUrls(false)
        return
      }
      
      console.log(`Found ${docs.length} documents missing document_url:`, docs)
      
      let fixed = 0
      for (const doc of docs) {
        // Clean the file path
        let filePath = doc.file_path
        if (filePath.includes('sf10-documents/')) {
          filePath = filePath.split('sf10-documents/').pop()
        }
        
        // Generate public URL
        const { data: { publicUrl } } = supabase.storage
          .from('sf10-documents')
          .getPublicUrl(filePath)
        
        // Update the document
        const { error: updateError } = await supabase
          .from('sf10_documents')
          .update({ 
            document_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', doc.id)
        
        if (updateError) {
          console.error(`Failed to update document ${doc.id}:`, updateError)
        } else {
          fixed++
          console.log(`✅ Fixed: Added document_url for ${doc.document_name}`)
        }
      }
      
      setDebugInfo(`✅ Fixed ${fixed} of ${docs.length} missing document_url fields!`)
      alert(`Fixed ${fixed} document URLs!`)
      
    } catch (err) {
      console.error('Error fixing URLs:', err)
      setDebugInfo(`❌ Error fixing URLs: ${err.message}`)
    } finally {
      setFixingUrls(false)
    }
  }

  // ============== TEST CONNECTION FUNCTION ==============
  const testConnection = async () => {
    try {
      setDebugInfo('Testing connection...')
      
      if (!supabase) {
        setDebugInfo('Supabase not initialized')
        return false
      }
      
      const { count, error } = await supabase
        .from('sf10_students')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        setDebugInfo(`Connection error: ${error.message}`)
        console.error('Supabase connection test failed:', error)
        return false
      }
      
      setDebugInfo(`Connection successful! Found ${count} students`)
      return true
    } catch (err) {
      setDebugInfo(`Test failed: ${err.message}`)
      console.error('Connection test error:', err)
      return false
    }
  }

  // ============== TEST STORAGE BUCKET FUNCTION ==============
  const testStorageBucket = async () => {
    try {
      setDebugInfo('Testing storage bucket...')
      
      const { data, error } = await supabase.storage
        .from('sf10-documents')
        .list('', { limit: 1 })
      
      if (error) {
        console.error('Storage bucket error:', error)
        setDebugInfo(`❌ Storage bucket error: ${error.message}`)
        return false
      }
      
      setDebugInfo('✅ Storage bucket is accessible')
      return true
    } catch (err) {
      console.error('Storage test error:', err)
      setDebugInfo(`❌ Storage test failed: ${err.message}`)
      return false
    }
  }

  // ============== SIMPLE UPLOAD TEST ==============
  const testSimpleUpload = async () => {
    try {
      setDebugInfo('🧪 Testing simple upload...')
      
      // Create a test file
      const testContent = 'This is a test file';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
      
      // Create a test student first
      const { data: student, error: studentError } = await supabase
        .from('sf10_students')
        .insert({
          lrn: `TEST-${Date.now()}`,
          first_name: 'Test',
          last_name: 'Student',
          status: 'Active'
        })
        .select()
        .single()
      
      if (studentError) {
        setDebugInfo(`❌ Failed to create test student: ${studentError.message}`)
        alert(`❌ Test failed: ${studentError.message}`)
        return
      }
      
      console.log('Test student created:', student)
      
      // Try to upload
      const result = await uploadStudentDocuments(student.id, [testFile], false)
      
      if (result.success) {
        setDebugInfo(`✅ Test successful! Uploaded to student ${student.id}`)
        alert(`✅ Test successful!\nStudent ID: ${student.id}\nDocument count: ${result.count}`)
      } else {
        setDebugInfo(`❌ Test failed: ${result.errors?.join(', ')}`)
        alert(`❌ Test failed: ${result.errors?.join(', ')}`)
      }
      
    } catch (err) {
      console.error('Test error:', err)
      setDebugInfo(`❌ Test error: ${err.message}`)
      alert(`❌ Test error: ${err.message}`)
    }
  }

  // ============== DEBUG CHECK DOCUMENTS FUNCTION ==============
  const debugCheckDocuments = async (studentId) => {
    console.log(`🔍 Debug: Checking documents for student ${studentId}`)
    setDebugInfo(`Checking documents for student...`)
    
    const { data: student, error: studentError } = await supabase
      .from('sf10_students')
      .select('*')
      .eq('id', studentId)
      .single()
    
    if (studentError) {
      console.error('Student fetch error:', studentError)
      setDebugInfo(`❌ Student fetch error: ${studentError.message}`)
    } else {
      console.log('Student found:', student)
      setDebugInfo(`✅ Student found: ${formatPersonName(student)}`)
    }
    
    const { data: docs, error: docsError } = await supabase
      .from('sf10_documents')
      .select('*')
      .eq('student_id', studentId)
    
    if (docsError) {
      console.error('Documents fetch error:', docsError)
      setDebugInfo(`❌ Documents fetch error: ${docsError.message}`)
    } else {
      console.log(`Found ${docs?.length || 0} documents:`, docs)
      
      const missingUrls = docs?.filter(d => !d.document_url) || []
      const wrongPaths = docs?.filter(d => d.file_path?.includes('sf10-documents/')) || []
      
      if (wrongPaths.length > 0 || missingUrls.length > 0) {
        setDebugInfo(`📄 Found ${docs.length} documents (${wrongPaths.length} wrong paths, ${missingUrls.length} missing URLs)`)
      } else {
        setDebugInfo(`📄 Found ${docs.length} documents (all correct)`)
      }
      
      if (docs && docs.length > 0) {
        const student = students.find(s => s.id === studentId)
        if (student) {
          setSelectedStudent(student)
          setStudentDocuments(docs)
          setShowDocumentsModal(true)
        }
      }
    }
    
    return { student, documents: docs }
  }

  // ============== MANUAL REFRESH FUNCTION ==============
  const handleManualRefresh = () => {
    setRefreshing(true)
    setDebugInfo('Manually refreshing student list...')
    
    if (onAddStudent) {
      onAddStudent(null)
    }
    
    setTimeout(() => {
      setRefreshing(false)
      setDebugInfo('Refresh complete')
    }, 1000)
  }

  // ============== VIEW STUDENT DOCUMENTS ==============
  const handleViewDocuments = async (student) => {
    console.log('🔍 handleViewDocuments called with student:', student)
    setSelectedStudent(student)
    setLoadingDocuments(true)
    setStudentDocuments([])
    setShowDocumentsModal(true)
    
    try {
      console.log(`Fetching documents for student: ${student.id}`)
      const { data: documents, error } = await supabase
        .from('sf10_documents')
        .select('*')
        .eq('student_id', student.id)
        .order('uploaded_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching documents:', error)
        setDebugInfo(`❌ Error fetching documents: ${error.message}`)
        alert('Failed to load documents')
        setLoadingDocuments(false)
        return
      }
      
      console.log(`Found ${documents?.length || 0} documents:`, documents)
      
      if (documents && documents.length > 0) {
        documents.forEach((doc, index) => {
          console.log(`Document ${index + 1}:`, {
            id: doc.id,
            name: doc.document_name,
            url: doc.document_url,
            path: doc.file_path,
            type: doc.document_type
          })
        })
      }
      
      setStudentDocuments(documents || [])
      
      const missingUrls = documents?.filter(d => !d.document_url) || []
      const wrongPaths = documents?.filter(d => d.file_path?.includes('sf10-documents/')) || []
      
      if (wrongPaths.length > 0 || missingUrls.length > 0) {
        setDebugInfo(`📄 Loaded ${documents.length} documents (${wrongPaths.length} wrong paths, ${missingUrls.length} missing URLs)`)
      } else {
        setDebugInfo(`📄 Loaded ${documents?.length || 0} documents`)
      }
      
    } catch (err) {
      console.error('Error in handleViewDocuments:', err)
      setDebugInfo(`❌ Error: ${err.message}`)
      alert('Failed to load documents')
    } finally {
      setLoadingDocuments(false)
    }
  }

  // ============== FIXED DOWNLOAD FUNCTION ==============
  const handleDownloadDocument = async (document) => {
    try {
      // Use the stored document_url directly (simpler and more reliable)
      if (document.document_url) {
        console.log('Opening document URL:', document.document_url)
        window.open(document.document_url, '_blank')
        return
      }
      
      // Fallback: If document_url is missing, generate it and update the database
      console.warn('Document URL missing, generating from file_path...')
      let filePath = document.file_path
      
      // Remove any bucket name prefix if present
      if (filePath.includes('sf10-documents/')) {
        filePath = filePath.split('sf10-documents/').pop()
      }
      
      // Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sf10-documents')
        .getPublicUrl(filePath)
      
      console.log('Generated URL:', publicUrl)
      
      // Update the database with the correct URL for next time
      await supabase
        .from('sf10_documents')
        .update({ 
          document_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', document.id)
      
      // Open the URL
      window.open(publicUrl, '_blank')
      
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to open document. Please try again.')
    }
  }

  // ============== DELETE DOCUMENT ==============
  const handleDeleteDocument = async (documentId, index) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }
    
    try {
      const documentToDelete = studentDocuments[index]
      
      // Clean the file path
      let filePath = documentToDelete.file_path
      if (filePath.includes('sf10-documents/')) {
        filePath = filePath.split('sf10-documents/').pop()
      }
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('sf10-documents')
        .remove([filePath])
      
      if (storageError) {
        console.warn('Failed to delete from storage:', storageError)
      }
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('sf10_documents')
        .delete()
        .eq('id', documentId)
      
      if (dbError) {
        throw dbError
      }
      
      // Remove from local state
      const updatedDocuments = [...studentDocuments]
      updatedDocuments.splice(index, 1)
      setStudentDocuments(updatedDocuments)
      
      alert('Document deleted successfully!')
      setDebugInfo(`✅ Document deleted: ${documentToDelete.document_name}`)
      
      // Refresh student list if this was the last document
      if (updatedDocuments.length === 0 && onAddStudent) {
        setTimeout(() => {
          onAddStudent(null)
        }, 500)
      }
      
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete document')
      setDebugInfo(`❌ Delete error: ${err.message}`)
    }
  }

  // ============== FIXED UPLOAD FUNCTION WITH MIME TYPE HANDLING ==============
  const uploadStudentDocuments = async (studentId, files, requiresSF10 = false) => {
    if (!files.length || !studentId) {
      return { success: false, error: 'No files or student ID' }
    }

    setDebugInfo(`Uploading ${files.length} documents...`)
    console.log('Files to upload:', files)

    let uploadSuccessCount = 0
    let uploadErrorCount = 0
    const uploadedDocumentIds = []
    const errors = []

    for (const file of files) {
      try {
        // Check file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`File "${file.name}" exceeds 10MB limit`)
          uploadErrorCount++
          continue
        }

        // ✅ FIX: Normalize MIME type
        let mimeType = file.type;
        
        // Handle text/plain with charset
        if (mimeType.includes('text/plain')) {
          mimeType = 'text/plain';
        }
        
        // Handle JSON
        if (mimeType.includes('application/json')) {
          mimeType = 'application/json';
        }
        
        // Handle HTML
        if (mimeType.includes('text/html')) {
          mimeType = 'text/html';
        }
        
        // Handle XML
        if (mimeType.includes('application/xml') || mimeType.includes('text/xml')) {
          mimeType = 'application/xml';
        }
        
        // Handle CSV
        if (mimeType.includes('text/csv')) {
          mimeType = 'text/csv';
        }

        // Create a simple filename with timestamp
        const timestamp = Date.now()
        const random = Math.random().toString(36).substring(2)
        const extension = file.name.split('.').pop()
        const fileName = `${timestamp}-${random}.${extension}`
        
        // CRITICAL: Path is JUST studentId/filename (NO bucket name!)
        const filePath = `${studentId}/${fileName}`
        
        console.log('Uploading to path:', filePath)
        console.log('🔄 Attempting upload to:', filePath)
        console.log('📁 File details:', {
          name: file.name,
          type: mimeType,  // Use normalized MIME type
          originalType: file.type,
          size: file.size,
          lastModified: file.lastModified
        })
        
        // ✅ FIX: Create a new File object with normalized MIME type
        const normalizedFile = new File([file], file.name, { type: mimeType });
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('sf10-documents')
          .upload(filePath, normalizedFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: mimeType  // Explicitly set content type
          })

        if (uploadError) {
          console.error('❌ STORAGE UPLOAD ERROR:', uploadError)
          console.error('Error details:', {
            message: uploadError.message,
            statusCode: uploadError.statusCode,
            error: uploadError.error,
            path: filePath,
            contentType: mimeType
          })
          errors.push(`Storage upload failed: ${uploadError.message}`)
          uploadErrorCount++
          continue
        }
        
        console.log('✅ Upload successful')

        // Get public URL to store in document_url
        const { data: { publicUrl } } = supabase.storage
          .from('sf10-documents')
          .getPublicUrl(filePath)

        console.log('Public URL:', publicUrl)

        // Insert into database with ALL required fields including document_url
        const { data, error: dbError } = await supabase
          .from('sf10_documents')
          .insert({
            student_id: studentId,
            document_name: file.name,
            document_type: mimeType,  // Use normalized MIME type
            file_size: file.size,
            file_path: filePath,
            document_url: publicUrl,
            uploaded_at: new Date().toISOString(),
            is_required: requiresSF10
          })
          .select()

        if (dbError) {
          console.error('Database insert failed:', dbError)
          console.error('Error details:', dbError.details)
          errors.push(`Database insert failed: ${dbError.message}`)
          uploadErrorCount++
        } else {
          console.log('✅ Database insert successful:', data)
          uploadSuccessCount++
          if (data && data[0]) {
            uploadedDocumentIds.push(data[0].id)
          }
        }
      } catch (err) {
        console.error('Error processing file:', err)
        errors.push(err.message)
        uploadErrorCount++
      }
    }

    setDebugInfo(`✅ Uploaded ${uploadSuccessCount} documents, ${uploadErrorCount} failed`)
    
    return {
      success: uploadSuccessCount > 0,
      count: uploadSuccessCount,
      documentIds: uploadedDocumentIds,
      errors: errors.length > 0 ? errors : null
    }
  }

  // ============== ADD STUDENT FUNCTION WITH FILE UPLOAD ==============
  const handleAddStudent = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!studentForm.lrn.trim()) {
      setAddStudentError('LRN is required')
      return
    }
    if (!studentForm.first_name.trim()) {
      setAddStudentError('First name is required')
      return
    }
    if (!studentForm.last_name.trim()) {
      setAddStudentError('Last name is required')
      return
    }

    // If student requires SF10, check if documents are uploaded
    if (studentForm.requires_sf10 && uploadedFiles.length === 0) {
      setAddStudentError('Please upload at least one document since this student requires SF10')
      return
    }

    setAddingStudent(true)
    setAddStudentError('')
    setAddStudentSuccess(false)
    setDebugInfo('Starting to add student...')

    try {
      // Test connection first
      const connected = await testConnection()
      if (!connected) {
        setAddStudentError('Database connection failed. Please check your internet connection.')
        setAddingStudent(false)
        return
      }

      // Insert student into database
      const insertData = {
        lrn: studentForm.lrn.trim(),
        first_name: studentForm.first_name.trim(),
        last_name: studentForm.last_name.trim(),
        middle_name: studentForm.middle_name.trim() || null,
        name_extension: studentForm.name_extension.trim() || null,
        birth_date: studentForm.birth_date || null,
        sex: studentForm.sex || null,
        grade_level: studentForm.grade_level ? parseInt(studentForm.grade_level) : null,
        current_grade_level: studentForm.grade_level ? parseInt(studentForm.grade_level) : null,
        section: studentForm.section.trim() || null,
        current_section: studentForm.section.trim() || null,
        school_year: studentForm.school_year.trim(),
        status: studentForm.status,
        requires_sf10: studentForm.requires_sf10 || false
      }

      const { data: studentData, error: studentError } = await supabase
        .from('sf10_students')
        .insert(insertData)
        .select()
        .single()

      if (studentError) {
        console.error('Error adding student:', studentError)
        setDebugInfo(`Error: ${studentError.code} - ${studentError.message}`)
        
        if (studentError.code === '23505') {
          setAddStudentError('A student with this LRN already exists')
        } else if (studentError.code === '42501') {
          setAddStudentError('Permission denied. Check if you are logged in.')
        } else if (studentError.code === '42P01') {
          setAddStudentError('Table does not exist. Please run database schema.')
        } else {
          setAddStudentError(`Failed to add student: ${studentError.message}`)
        }
        setAddingStudent(false)
        return
      }

      console.log('Student added successfully:', studentData)
      setDebugInfo(`Success! Student ID: ${studentData.id}`)

      // Upload files if any
      let uploadSuccess = false
      let uploadedDocIds = []
      
      if (uploadedFiles.length > 0 && studentData.id) {
        console.log('🔄 Starting file upload process...')
        const uploadResult = await uploadStudentDocuments(
          studentData.id, 
          uploadedFiles, 
          studentForm.requires_sf10
        )
        uploadSuccess = uploadResult?.success || false
        uploadedDocIds = uploadResult?.documentIds || []
        
        console.log('Upload result:', uploadResult)
        
        // If upload failed, show error and STOP here
        if (!uploadSuccess) {
          console.error('❌ Upload failed completely:', uploadResult)
          if (uploadResult?.errors) {
            setAddStudentError(`Upload failed: ${uploadResult.errors.join(', ')}`)
          } else {
            setAddStudentError('File upload failed. Please check console for details.')
          }
          setAddingStudent(false)
          return
        }
        
        // If upload had some errors but partial success
        if (uploadResult?.errors && uploadResult.errors.length > 0) {
          console.warn('⚠️ Upload had partial errors:', uploadResult.errors)
          setAddStudentError(`Some files failed: ${uploadResult.errors.join(', ')}`)
        }
      }

      // Success
      setAddStudentSuccess(true)
      setAddStudentError('')
      
      // Store student data for later use
      const newStudent = { ...studentData }
      
      // Store these values BEFORE setTimeout since uploadedFiles will be cleared
      const hadFilesToUpload = uploadedFiles.length > 0;
      const uploadWasSuccessful = uploadSuccess;
      
      // Reset form after 2 seconds and auto-open documents modal
      setTimeout(() => {
        // Reset form
        setStudentForm({
          lrn: '',
          first_name: '',
          last_name: '',
          middle_name: '',
          name_extension: '',
          birth_date: '',
          sex: '',
          grade_level: '',
          section: '',
          school_year: new Date().getFullYear().toString(),
          status: 'Active',
          requires_sf10: false
        })
        setUploadedFiles([])
        setAddStudentSuccess(false)
        setShowAddStudentModal(false)
        
        // Call parent's onAddStudent to refresh list
        if (onAddStudent) {
          console.log('Calling onAddStudent callback with:', newStudent)
          onAddStudent(newStudent)
        }
        
        // Use stored variables instead of checking uploadedFiles (which is now empty)
        if (hadFilesToUpload || uploadWasSuccessful) {
          console.log('Starting to poll for uploaded documents...')
          setDebugInfo('📄 Waiting for documents to appear in database...')
          
          let attempts = 0
          const maxAttempts = 10
          
          const checkForDocuments = async () => {
            attempts++
            console.log(`Polling attempt ${attempts}/${maxAttempts} for student ${newStudent.id}`)
            
            try {
              const { data: docs, error } = await supabase
                .from('sf10_documents')
                .select('*')
                .eq('student_id', newStudent.id)
                .order('uploaded_at', { ascending: false })
              
              if (error) {
                console.error('Error polling for documents:', error)
                if (attempts < maxAttempts) {
                  setTimeout(checkForDocuments, 600)
                }
                return
              }
              
              if (docs && docs.length > 0) {
                console.log(`✅ Documents found on attempt ${attempts}:`, docs)
                setDebugInfo(`✅ Found ${docs.length} documents for student`)
                handleViewDocuments(newStudent)
              } else if (attempts < maxAttempts) {
                setTimeout(checkForDocuments, 600)
              } else {
                console.warn('Documents not found after max attempts')
                setDebugInfo(`⚠️ Documents not showing after ${maxAttempts} attempts. They may still be processing.`)
                handleViewDocuments(newStudent)
              }
            } catch (pollErr) {
              console.error('Polling error:', pollErr)
              if (attempts < maxAttempts) {
                setTimeout(checkForDocuments, 600)
              }
            }
          }
          
          setTimeout(checkForDocuments, 500)
        }
      }, 2000)

    } catch (err) {
      console.error('Add student error:', err)
      setDebugInfo(`Exception: ${err.message}`)
      setAddStudentError(`Failed to add student: ${err.message}`)
    } finally {
      setAddingStudent(false)
    }
  }

  const handleStudentFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setStudentForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ============== FIXED FILE UPLOAD HANDLER WITH EXPANDED MIME TYPES ==============
  const handleFileUploadAddStudent = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    console.log('Files selected:', files)
    
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'text/plain',
      'text/plain;charset=UTF-8',
      'text/plain;charset=utf-8',
      'application/json',
      'text/html',
      'application/xml',
      'text/xml',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream'
    ]

    const newUploadedFiles = []

    for (const file of files) {
      console.log('Processing file:', file.name, file.type, file.size)
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setAddStudentError(`File "${file.name}" exceeds 10MB limit`)
        continue
      }

      // ✅ FIX: Normalize MIME type before checking
      let fileType = file.type;
      if (fileType.includes('text/plain')) {
        fileType = 'text/plain';
      }
      if (fileType.includes('application/json')) {
        fileType = 'application/json';
      }
      if (fileType.includes('text/html')) {
        fileType = 'text/html';
      }
      if (fileType.includes('text/csv')) {
        fileType = 'text/csv';
      }
      
      // Check file type - allow both original and normalized
      if (!validTypes.includes(fileType) && !validTypes.includes(file.type)) {
        setAddStudentError(`File "${file.name}" type "${file.type}" is not supported. Please upload PDF, Word, Excel, CSV, Text, JSON, HTML, XML, or Images.`)
        continue
      }

      // Create preview object
      const fileObj = {
        id: Date.now() + Math.random().toString(36).substring(2),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.includes('image') ? URL.createObjectURL(file) : null
      }

      newUploadedFiles.push(fileObj)
      console.log('File added to upload list:', fileObj.name)
    }

    if (newUploadedFiles.length > 0) {
      console.log('Updating uploadedFiles state with:', newUploadedFiles.length, 'files')
      setUploadedFiles(prev => {
        const updated = [...prev, ...newUploadedFiles]
        console.log('New uploadedFiles state:', updated)
        return updated
      })
      setAddStudentError('')
    } else {
      console.log('No valid files to upload')
    }
  }

  // ============== REMOVE UPLOADED FILE FROM ADD STUDENT FORM ==============
  const removeUploadedFile = (index) => {
    const fileToRemove = uploadedFiles[index]
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview)
    }
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // ============== EXPORT SF10 WITH DOCUMENTS ==============
  const exportSf10WithDocuments = async (studentId) => {
    const student = students.find(s => s.id === studentId)
    if (!student) {
      alert('Student not found')
      return
    }

    try {
      // Fetch student documents
      const { data: documents, error } = await supabase
        .from('sf10_documents')
        .select('*')
        .eq('student_id', studentId)
        .order('uploaded_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
        alert('Failed to fetch documents')
        return
      }
      
      if (!documents || documents.length === 0) {
        alert('No documents found for this student.')
        return
      }

      // Create export data
      const exportData = {
        student: {
          id: student.id,
          lrn: student.lrn,
          name: formatPersonName(student),
          grade_level: student.grade_level || student.current_grade_level,
          section: student.section || student.current_section,
          school_year: student.school_year,
          status: student.status,
          requires_sf10: student.requires_sf10 || false
        },
        sf10Record: sf10ByStudentId[String(studentId)] || {},
        documents: documents.map(doc => ({
          id: doc.id,
          name: doc.document_name,
          type: doc.document_type,
          size: doc.file_size,
          uploaded_at: doc.uploaded_at,
          url: doc.document_url
        })),
        exportDate: new Date().toISOString(),
        exportType: 'SF10_WITH_DOCUMENTS'
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${student.lrn || student.id}-SF10-EXPORT-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('SF10 export with documents has been downloaded successfully!')

    } catch (err) {
      console.error('Export error:', err)
      alert('Failed to export SF10 with documents')
    }
  }

  // ============== COMPONENT CLEANUP ==============
  useEffect(() => {
    return () => {
      // Clean up object URLs
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
    }
  }, [uploadedFiles])

  // ============== CHECK DOCUMENTS WHEN STUDENT ADDED ==============
  useEffect(() => {
    if (addStudentSuccess) {
      console.log('Student added successfully. Checking for uploaded documents...')
      console.log('Uploaded files:', uploadedFiles)
    }
  }, [addStudentSuccess, uploadedFiles])

  // ============== AUTO-FIX PATHS ON MOUNT ==============
  useEffect(() => {
    // Check if there are documents with wrong paths or missing URLs when component mounts
    const checkAndFixPaths = async () => {
      const { count: wrongPathCount, error: pathError } = await supabase
        .from('sf10_documents')
        .select('*', { count: 'exact', head: true })
        .or('file_path.ilike.%sf10-documents/%,file_path.ilike.%sf10-documents%')
      
      const { count: missingUrlCount, error: urlError } = await supabase
        .from('sf10_documents')
        .select('*', { count: 'exact', head: true })
        .is('document_url', null)
      
      if (!pathError && wrongPathCount > 0) {
        setDebugInfo(`⚠️ Found ${wrongPathCount} documents with wrong paths. Click "Fix Paths" to fix them.`)
      } else if (!urlError && missingUrlCount > 0) {
        setDebugInfo(`⚠️ Found ${missingUrlCount} documents with missing URLs. Click "Fix URLs" to fix them.`)
      }
    }
    
    checkAndFixPaths()
  }, [])

  // ============== FORMAT FILE SIZE ==============
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // ============== GET FILE ICON ==============
  const getFileIcon = (fileType) => {
    if (!fileType) return '📎'
    if (fileType.includes('pdf')) return '📄'
    if (fileType.includes('word') || fileType.includes('document')) return '📝'
    if (fileType.includes('excel') || fileType.includes('sheet') || fileType.includes('csv')) return '📊'
    if (fileType.includes('image')) return '🖼️'
    if (fileType.includes('text')) return '📃'
    if (fileType.includes('json')) return '📋'
    if (fileType.includes('html')) return '🌐'
    if (fileType.includes('xml')) return '📐'
    return '📎'
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      {/* Debug Section */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={testConnection}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
            title="Test database connection"
          >
            <span>Test DB</span>
          </button>
          <button
            onClick={testStorageBucket}
            className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
            title="Test storage bucket"
          >
            <span>Test Storage</span>
          </button>
          <button
            onClick={testSimpleUpload}
            className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1"
            title="Test simple upload"
          >
            <span>🧪 Test Upload</span>
          </button>
          <button
            onClick={fixExistingDocumentPaths}
            disabled={fixingPaths}
            className={`text-xs ${fixingPaths ? 'bg-amber-200 text-amber-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'} px-3 py-1.5 rounded-lg flex items-center gap-1`}
            title="Fix existing document paths"
          >
            {fixingPaths ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Fixing...</span>
              </>
            ) : (
              <>
                <FiRefreshCw className="h-3 w-3" />
                <span>Fix Paths</span>
              </>
            )}
          </button>
          <button
            onClick={fixMissingDocumentUrls}
            disabled={fixingUrls}
            className={`text-xs ${fixingUrls ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} px-3 py-1.5 rounded-lg flex items-center gap-1`}
            title="Fix missing document URLs"
          >
            {fixingUrls ? (
              <>
                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Fixing URLs...</span>
              </>
            ) : (
              <>
                <FiExternalLink className="h-3 w-3" />
                <span>Fix URLs</span>
              </>
            )}
          </button>
          <button
            onClick={checkDatabaseSchema}
            className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
            title="Check database schema"
          >
            <span>🔧 Check Schema</span>
          </button>
          <button
            onClick={verifyDocumentsInDB}
            className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
            title="Verify documents in database"
          >
            <FiCheckCircle className="h-3 w-3" />
            <span>Verify Docs</span>
          </button>
          {debugInfo && (
            <div className="text-xs text-gray-500 max-w-md truncate" title={debugInfo}>
              Debug: {debugInfo}
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal with File Upload */}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Add New Student with SF10 Documents</h3>
              <button
                onClick={() => {
                  setShowAddStudentModal(false)
                  // Clean up object URLs
                  uploadedFiles.forEach(file => {
                    if (file.preview) {
                      URL.revokeObjectURL(file.preview)
                    }
                  })
                  setUploadedFiles([])
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddStudent}>
              {addStudentSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-sm">
                  ✅ Student added successfully! Opening documents modal...
                </div>
              )}

              {addStudentError && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
                  ❌ {addStudentError}
                </div>
              )}

              {/* Debug info in modal */}
              {debugInfo && !addStudentSuccess && !addStudentError && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm">
                  🔍 Debug: {debugInfo}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    LRN (Learner Reference Number) *
                  </label>
                  <input
                    type="text"
                    name="lrn"
                    value={studentForm.lrn}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="Enter LRN"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={studentForm.status}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Graduated">Graduated</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={studentForm.first_name}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="First name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={studentForm.last_name}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="Last name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middle_name"
                    value={studentForm.middle_name}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="Middle name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Name Extension
                  </label>
                  <input
                    type="text"
                    name="name_extension"
                    value={studentForm.name_extension}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="e.g., Jr., Sr., III"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={studentForm.birth_date}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Sex
                  </label>
                  <select
                    name="sex"
                    value={studentForm.sex}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  >
                    <option value="">Select sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    name="grade_level"
                    value={studentForm.grade_level}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                  >
                    <option value="">Select grade level</option>
                    {Array.from({length: 12}, (_, i) => i + 1).map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Section
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={studentForm.section}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="e.g., Section A"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    School Year
                  </label>
                  <input
                    type="text"
                    name="school_year"
                    value={studentForm.school_year}
                    onChange={handleStudentFormChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A]"
                    placeholder="e.g., 2024-2025"
                  />
                </div>
              </div>

              {/* SF10 Requirement Checkbox */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="requires_sf10"
                    name="requires_sf10"
                    checked={studentForm.requires_sf10}
                    onChange={handleStudentFormChange}
                    className="w-5 h-5 rounded border-slate-300 text-[#1B3E2A] focus:ring-[#1B3E2A]"
                  />
                  <label htmlFor="requires_sf10" className="text-sm font-medium text-slate-700">
                    This student requires SF10 document
                  </label>
                </div>
                
                <div className="text-xs text-slate-600 ml-8">
                  {studentForm.requires_sf10 ? (
                    <span className="text-amber-600">
                      ⚠️ Documents are required. Please upload at least one supporting document below.
                    </span>
                  ) : (
                    'If checked, documents must be uploaded for SF10 processing.'
                  )}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Supporting Documents {studentForm.requires_sf10 && '*'}
                </label>
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json,.html,.xml,.jpg,.jpeg,.png,.gif,.webp,.svg"
                      onChange={handleFileUploadAddStudent}
                      disabled={addingStudent}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center ${addingStudent ? 'opacity-60' : 'hover:border-slate-400'}`}>
                      <FiUpload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600 mb-1">
                        {addingStudent ? 'Processing...' : 'Click to upload documents'}
                      </p>
                      <p className="text-xs text-slate-500">
                        PDF, Word, Excel, CSV, Text, JSON, HTML, XML, Images (max 10MB each)
                      </p>
                      {studentForm.requires_sf10 && (
                        <p className="text-xs text-amber-600 mt-2">
                          Required for SF10 processing
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-slate-700 mb-2">
                      Files to upload ({uploadedFiles.length}):
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <FiFileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-800 font-medium truncate max-w-xs">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(1)} KB • {file.type.split('/')[1]?.toUpperCase() || file.type.split(';')[0]?.split('/')[1]?.toUpperCase() || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.preview && (
                              <button
                                type="button"
                                onClick={() => window.open(file.preview, '_blank')}
                                className="text-blue-500 hover:text-blue-700 p-1"
                                title="Preview"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeUploadedFile(index)}
                              className="text-rose-500 hover:text-rose-700 p-1"
                              title="Remove"
                              disabled={addingStudent}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false)
                    uploadedFiles.forEach(file => {
                      if (file.preview) {
                        URL.revokeObjectURL(file.preview)
                      }
                    })
                    setUploadedFiles([])
                  }}
                  disabled={addingStudent}
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStudent || (studentForm.requires_sf10 && uploadedFiles.length === 0)}
                  className="flex-1 rounded-2xl bg-[#1B3E2A] px-4 py-3 text-sm font-medium text-white hover:bg-[#23513A] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingStudent ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Add Student with Documents
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Documents Modal */}
      {showDocumentsModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  SF10 Documents - {formatPersonName(selectedStudent)}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  LRN: {selectedStudent.lrn || 'Not assigned'}
                </p>
                {selectedStudent.requires_sf10 && (
                  <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full mt-2">
                    <FiAlertCircle className="w-3 h-3" />
                    Requires SF10 Documents
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDocumentsModal(false)
                  setSelectedStudent(null)
                  setStudentDocuments([])
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Document Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-2xl p-4">
                <div className="text-xs text-blue-600 font-medium mb-1">Total Documents</div>
                <div className="text-2xl font-bold text-blue-700">{studentDocuments.length}</div>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4">
                <div className="text-xs text-emerald-600 font-medium mb-1">Total Size</div>
                <div className="text-2xl font-bold text-emerald-700">
                  {formatFileSize(studentDocuments.reduce((acc, doc) => acc + (doc.file_size || 0), 0))}
                </div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4">
                <div className="text-xs text-purple-600 font-medium mb-1">Last Upload</div>
                <div className="text-sm font-bold text-purple-700">
                  {studentDocuments.length > 0 
                    ? new Date(studentDocuments[0].uploaded_at).toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : 'No documents'
                  }
                </div>
              </div>
            </div>

            {/* Documents List */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <FiFolder className="w-4 h-4" />
                Uploaded Documents
              </h4>
              
              {loadingDocuments ? (
                <div className="flex items-center justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : studentDocuments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <FiFileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No documents uploaded yet</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload documents when adding or editing this student
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentDocuments.map((doc, index) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl">{getFileIcon(doc.document_type || '')}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {doc.document_name}
                            </p>
                            {doc.is_required && (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <FiPaperclip className="w-3 h-3" />
                                Required
                              </span>
                            )}
                            {doc.file_path?.includes('sf10-documents/') && (
                              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <FiAlertCircle className="w-3 h-3" />
                                Wrong Path
                              </span>
                            )}
                            {!doc.document_url && (
                              <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <FiAlertCircle className="w-3 h-3" />
                                Missing URL
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-slate-500">
                              {formatFileSize(doc.file_size || 0)}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">
                              Uploaded {new Date(doc.uploaded_at).toLocaleString('en-PH', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">
                              {doc.document_type?.split('/')[1]?.toUpperCase() || doc.document_type?.split(';')[0]?.split('/')[1]?.toUpperCase() || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(doc.document_url, '_blank')}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Open in new tab"
                          disabled={!doc.document_url}
                        >
                          <FiExternalLink className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <FiDownload className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id, index)}
                          className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowDocumentsModal(false)
                  setSelectedStudent(null)
                  setStudentDocuments([])
                }}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {studentDocuments.length > 0 && (
                <button
                  onClick={() => exportSf10WithDocuments(selectedStudent.id)}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Export All Documents
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={uiText.sf10.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3E2A] focus:border-transparent"
            />
          </div>
        </div>
        
        {/* Refresh Button */}
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2.5 hover:bg-gray-300"
          onClick={handleManualRefresh}
          disabled={refreshing}
          type="button"
          title="Refresh student list"
        >
          {refreshing ? (
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <FiRefreshCw className="h-4 w-4" />
          )}
          <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
        
        {/* Add Student Button */}
        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1B3E2A] text-white text-sm font-medium px-4 py-2.5 hover:bg-[#23513A]"
          onClick={() => setShowAddStudentModal(true)}
          type="button"
        >
          <FiUserPlus className="h-4 w-4" />
          <span>Add Student with Documents</span>
        </button>
      </div>

      {/* Students Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.id}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.name}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.gradeLevel}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.section}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.status}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.documents}</th>
              <th className="py-2 pr-3 font-medium">{uiText.sf10.table.controls}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  {uiText.sf10.table.noResults}
                </td>
              </tr>
            )}

            {filtered.map((student) => {
              const hasSf10 = Boolean(sf10ByStudentId[String(student.id)])
              const requiresSF10 = student.requires_sf10 || false
              
              return (
                <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 pr-3 font-medium text-slate-900 whitespace-nowrap">{student.lrn || student.id}</td>
                  <td className="py-3 pr-3 text-slate-900">
                    <div className="flex flex-col">
                      <span>{formatPersonName(student)}</span>
                      {requiresSF10 && (
                        <span className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                          <FiPaperclip className="h-3 w-3" />
                          Requires SF10
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-slate-700">{student.grade_level || student.current_grade_level || ''}</td>
                  <td className="py-3 pr-3 text-slate-700">{student.section || student.current_section || ''}</td>
                  <td className="py-3 pr-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border ${
                      student.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      student.status === 'Graduated' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      student.status === 'Transferred' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {student.status || ''}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-flex items-center gap-2 text-xs ${hasSf10 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <FiFileText className="h-3 w-3" />
                        <span>{hasSf10 ? 'Has SF10 Record' : 'No SF10 Record'}</span>
                      </span>
                      <span className={`inline-flex items-center gap-2 text-xs ${requiresSF10 ? 'text-amber-600' : 'text-slate-400'}`}>
                        <FiPaperclip className="h-3 w-3" />
                        <span>
                          {requiresSF10 ? 'Requires SF10 Documents' : 'No Document Requirement'}
                        </span>
                      </span>
                      {/* View Documents Button */}
                      <button
                        onClick={() => handleViewDocuments(student)}
                        className="text-xs text-blue-600 hover:text-blue-800 text-left mt-1 flex items-center gap-1"
                      >
                        <FiFolder className="h-3 w-3" />
                        View Uploaded Documents →
                      </button>
                      {/* Debug Button */}
                      <button
                        onClick={() => debugCheckDocuments(student.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 text-left mt-1 flex items-center gap-1"
                        title="Debug: Check documents in console"
                      >
                        🔍 Debug Docs
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Export SF10 with Documents Button - Only for students with documents */}
                      {requiresSF10 && (
                        <button
                          type="button"
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs hover:bg-emerald-700"
                          onClick={() => exportSf10WithDocuments(student.id)}
                          title="Export SF10 with all documents"
                        >
                          <FiDownload className="h-4 w-4" />
                          <span>Export SF10</span>
                        </button>
                      )}

                      {/* Existing buttons */}
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-3 py-2 text-xs hover:bg-slate-800"
                        onClick={() => onViewSf10(student.id)}
                        title="View SF10 record"
                      >
                        <FiFileText className="h-4 w-4" />
                        <span>{uiText.sf10.actions.view}</span>
                      </button>
                      
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          const record = sf10ByStudentId[String(student.id)]
                          if (!record) {
                            window.alert(uiText.sf10.placeholders.download)
                            return
                          }
                          downloadMockPdf({ filename: `${student.lrn || student.id}-SF10.pdf`, payload: record })
                        }}
                        title="Download SF10 as PDF"
                      >
                        <FiDownload className="h-4 w-4" />
                        <span>{uiText.sf10.actions.download}</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => {
                          onViewSf10(student.id)
                          setTimeout(() => window.print(), 50)
                        }}
                        title="Print SF10 record"
                      >
                        <FiPrinter className="h-4 w-4" />
                        <span>{uiText.sf10.actions.print}</span>
                      </button>

                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                        onClick={() => onEditSf10(student.id)}
                        title="Edit SF10 record"
                      >
                        <FiEdit2 className="h-4 w-4" />
                        <span>{uiText.sf10.actions.editSf10}</span>
                      </button>
                      
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-xl bg-white border border-rose-200 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50"
                        onClick={() => onRemoveStudent(student.id)}
                        title="Remove student"
                      >
                        <FiTrash2 className="h-4 w-4" />
                        <span>{uiText.sf10.actions.removeStudent}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {/* Student Count Display */}
      <div className="text-xs text-slate-500 text-center pt-2">
        Showing {filtered.length} of {students.length} students
      </div>
    </div>
  )
}

export function SF10View({ student, record, onBack }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          onClick={onBack}
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>{uiText.sf10.actions.backToList}</span>
        </button>
      </div>

      <div className="border border-slate-200 rounded-2xl p-6 print:border-0 print:p-0">
        <div className="text-center mb-6">
          <div className="text-lg font-semibold text-slate-900">{uiText.sf10.sf10View.header}</div>
          <div className="text-xs text-slate-500">{student ? formatPersonName(student) : ''}</div>
          <div className="text-xs text-slate-500">{student?.id || ''}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="text-xs font-semibold text-slate-700 mb-2">{uiText.sf10.sf10View.profile}</div>
            <div className="text-sm text-slate-700">LRN: {record?.studentProfile?.lrn || ''}</div>
            <div className="text-sm text-slate-700">{student?.grade_level || student?.current_grade_level || ''}</div>
            <div className="text-sm text-slate-700">{student?.section || student?.current_section || ''}</div>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <div className="text-xs font-semibold text-slate-700 mb-2">{uiText.sf10.sf10View.schoolInfo}</div>
            <div className="text-sm text-slate-700">{record?.schoolInfo?.schoolName || ''}</div>
            <div className="text-sm text-slate-700">{record?.schoolInfo?.division || ''}</div>
            <div className="text-sm text-slate-700">{record?.schoolInfo?.region || ''}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 p-4">
          <div className="text-xs font-semibold text-slate-700 mb-3">{uiText.sf10.sf10View.gradeRecords}</div>
          <div className="space-y-4">
            {(record?.gradeRecords || []).map((gr) => (
              <div key={`${gr.schoolYear}-${gr.gradeLevel}`} className="rounded-2xl bg-slate-50/50 border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {gr.gradeLevel} • {gr.schoolYear}
                  </div>
                  <div className="text-xs text-slate-500">{gr.section || ''}</div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-slate-500">
                        <th className="py-1 pr-3 font-medium">{uiText.sf10.sf10View.subject}</th>
                        <th className="py-1 pr-3 font-medium">{uiText.sf10.sf10View.final}</th>
                        <th className="py-1 pr-3 font-medium">{uiText.sf10.sf10View.subjectRemarks}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gr.subjects.map((s) => (
                        <tr key={s.subjectName} className="border-t border-slate-100">
                          <td className="py-2 pr-3 text-slate-800">{s.subjectName}</td>
                          <td className="py-2 pr-3 text-slate-800">{typeof s.finalGrade === 'number' ? s.finalGrade : ''}</td>
                          <td className="py-2 pr-3 text-slate-600">{s.remarks || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  <div>
                    {uiText.sf10.sf10View.generalAverage}: {typeof gr.generalAverage === 'number' ? gr.generalAverage : ''}
                  </div>
                  <div>{gr.promotionStatus || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="text-xs font-semibold text-slate-700 mb-2">{uiText.sf10.sf10View.remarks}</div>
          <div className="text-sm text-slate-700">{record?.remarks || ''}</div>
        </div>
      </div>
    </div>
  )
}