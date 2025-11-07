-- =================================================================
-- PRIVATE STORAGE SETUP FOR UYIO AI
-- =================================================================
-- This creates a private recordings bucket with RLS policies
-- Run this in Supabase SQL Editor
-- =================================================================

-- STEP 1: Drop existing policies if they exist (safe to run multiple times)
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access" ON storage.objects;

-- STEP 2: Create private recordings bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings-private',
  'recordings-private',
  false, -- PRIVATE!
  10485760, -- 10MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING; -- Skip if bucket already exists

-- STEP 3: Create RLS policies

-- Policy 1: Users can only upload their own recordings
CREATE POLICY "Users can upload own recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Users can only access their own recordings
CREATE POLICY "Users can access own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Users can only delete their own recordings
CREATE POLICY "Users can delete own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Service role can access all recordings (for cleanup/admin)
CREATE POLICY "Service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'recordings-private')
WITH CHECK (bucket_id = 'recordings-private');

-- =================================================================
-- VERIFICATION QUERIES (run these to confirm setup)
-- =================================================================

-- Check bucket was created
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'recordings-private';

-- Check all 4 policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname IN (
  'Users can upload own recordings',
  'Users can access own recordings', 
  'Users can delete own recordings',
  'Service role full access'
);

-- =================================================================
-- EXPECTED RESULTS:
-- =================================================================
-- Bucket query should return 1 row with public = false
-- Policies query should return 4 rows (one for each policy)
-- =================================================================

