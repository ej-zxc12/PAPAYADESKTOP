-- SF10 Documents Table
-- This table stores uploaded documents for SF10 students
-- Run this in your Supabase SQL Editor

CREATE TABLE sf10_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES sf10_students(id) ON DELETE CASCADE,
    document_url VARCHAR(500) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    file_path VARCHAR(500) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_sf10_documents_student_id ON sf10_documents(student_id);
CREATE INDEX idx_sf10_documents_uploaded_at ON sf10_documents(uploaded_at);

-- Enable Row Level Security
ALTER TABLE sf10_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to manage their own documents
CREATE POLICY "Users can manage their own student documents" ON sf10_documents
    FOR ALL USING (
        auth.role() = 'authenticated'
    );

-- Create policy for authenticated users to view all documents
CREATE POLICY "Users can view all student documents" ON sf10_documents
    FOR SELECT USING (
        auth.role() = 'authenticated'
    );
