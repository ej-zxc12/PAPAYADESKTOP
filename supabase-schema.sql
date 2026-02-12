-- Papaya Academy Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Donors table
CREATE TABLE donors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns/Programs table
CREATE TABLE campaigns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_amount DECIMAL(12, 2),
    current_amount DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Paused')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners table
CREATE TABLE partners (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    type VARCHAR(100) DEFAULT 'Cash' CHECK (type IN ('Cash', 'Sponsorship', 'In-kind')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    description TEXT,
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donations table
CREATE TABLE donations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    donor_id UUID REFERENCES donors(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'PHP',
    country VARCHAR(100),
    method VARCHAR(100) CHECK (method IN ('Credit Card', 'Bank Transfer', 'GCash', 'PayMaya', 'Cash', 'Other')),
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    date DATE NOT NULL,
    reference VARCHAR(255),
    gateway VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    from_name VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body TEXT NOT NULL,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    replied BOOLEAN DEFAULT FALSE,
    reply_text TEXT,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SF10 Students table
CREATE TABLE sf10_students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lrn VARCHAR(20) UNIQUE NOT NULL, -- Learner Reference Number
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    name_extension VARCHAR(50),
    birth_date DATE,
    sex VARCHAR(10) CHECK (sex IN ('Male', 'Female')),
    grade_level INTEGER,
    section VARCHAR(100),
    school_year VARCHAR(20),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Graduated', 'Transferred')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SF10 Records table
CREATE TABLE sf10_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES sf10_students(id) ON DELETE CASCADE,
    school_name VARCHAR(255) NOT NULL,
    school_address TEXT,
    grade_level INTEGER NOT NULL,
    school_year VARCHAR(20) NOT NULL,
    academic_honors TEXT,
    attendance_rate DECIMAL(5, 2),
    general_average DECIMAL(5, 2),
    adviser_name VARCHAR(255),
    principal_name VARCHAR(255),
    date_issued DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alumni table
CREATE TABLE alumni (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    batchYear INTEGER NOT NULL,
    programOrGrade VARCHAR(255) NOT NULL,
    achievements TEXT[],
    notes TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
CREATE TABLE news_articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    author VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Media library table
CREATE TABLE media_library (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    url VARCHAR(1000) NOT NULL,
    alt_text TEXT,
    caption TEXT,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_donations_donor_id ON donations(donor_id);
CREATE INDEX idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX idx_donations_date ON donations(date);
CREATE INDEX idx_donations_status ON donations(status);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_messages_read ON messages(read);
CREATE INDEX idx_sf10_students_lrn ON sf10_students(lrn);
CREATE INDEX idx_sf10_records_student_id ON sf10_records(student_id);
CREATE INDEX idx_alumni_graduation_year ON alumni(graduation_year);
CREATE INDEX idx_news_articles_status ON news_articles(status);
CREATE INDEX idx_media_library_file_type ON media_library(file_type);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('organization_name', 'Papaya Academy, Inc.', 'Organization name'),
('address', '', 'Organization address'),
('currency', 'PHP', 'Default currency'),
('max_donation_per_transaction', '', 'Maximum donation per transaction'),
('gateway_api_key', '', 'Payment gateway API key'),
('webhook_url', '', 'Webhook URL for payment notifications'),
('require_two_factor', 'false', 'Require two-factor authentication'),
('notify_on_failed_login', 'true', 'Notify on failed login attempts');

-- Enable Row Level Security (RLS)
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf10_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sf10_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow public read access for some tables
CREATE POLICY "Public view campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public view partners" ON partners FOR SELECT USING (status = 'Active');
CREATE POLICY "Public view news articles" ON news_articles FOR SELECT USING (status = 'Published');

-- Allow authenticated users full access
CREATE POLICY "Authenticated users can manage donors" ON donors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage campaigns" ON campaigns FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage partners" ON partners FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage donations" ON donations FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage messages" ON messages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sf10 students" ON sf10_students FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage sf10 records" ON sf10_records FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage alumni" ON alumni FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage news articles" ON news_articles FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage media library" ON media_library FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_donors_updated_at BEFORE UPDATE ON donors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at BEFORE UPDATE ON donations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sf10_students_updated_at BEFORE UPDATE ON sf10_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sf10_records_updated_at BEFORE UPDATE ON sf10_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alumni_updated_at BEFORE UPDATE ON alumni FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_articles_updated_at BEFORE UPDATE ON news_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_library_updated_at BEFORE UPDATE ON media_library FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
