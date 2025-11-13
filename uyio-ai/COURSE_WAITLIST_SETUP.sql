-- ============================================================================
-- COURSE WAITLIST TABLE SETUP
-- ============================================================================
-- This creates the course_waitlist table for capturing email signups
-- Run this in Supabase SQL Editor
-- ============================================================================

-- Create the course waitlist table
CREATE TABLE IF NOT EXISTS course_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_course_waitlist_email ON course_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_course_waitlist_created_at ON course_waitlist(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE course_waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert their email (for waitlist signup)
CREATE POLICY "Anyone can join waitlist"
ON course_waitlist
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Only authenticated users can view waitlist (for admin purposes)
CREATE POLICY "Authenticated users can view waitlist"
ON course_waitlist
FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the table was created successfully:
-- SELECT * FROM course_waitlist;
-- ============================================================================

