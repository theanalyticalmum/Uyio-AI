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

-- NO SELECT POLICY
-- This means only the database owner (you) can view the waitlist.
-- Regular users cannot query this table, protecting privacy.
-- You can view waitlist entries in:
-- 1. Supabase Dashboard → Table Editor → course_waitlist
-- 2. Supabase SQL Editor → SELECT * FROM course_waitlist;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify the table was created successfully:
-- SELECT * FROM course_waitlist;
-- ============================================================================

