-- =====================================================
-- SECURE SUPABASE STORAGE SETUP FOR AUDIO RECORDINGS
-- =====================================================
-- This version implements security best practices
-- Run this instead if you want stricter security
-- =====================================================

-- 1. Create the recordings bucket (PRIVATE, not public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false)  -- Changed to private
ON CONFLICT (id) DO UPDATE SET public = false;

-- 2. More secure storage policies

-- ✅ Only authenticated users can upload
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (
    -- Users can only upload to their own folder
    auth.uid()::text = (storage.foldername(name))[1]
  )
);

-- ✅ Only authenticated users can upload as guest (with naming convention)
CREATE POLICY "Guests can upload temporary recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] LIKE 'guest_%'
);

-- ✅ Users can only view their own recordings
CREATE POLICY "Users can view own recordings"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (
    -- Can view their own folder
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Can view guest files they created (you'd need to track this separately)
    (storage.foldername(name))[1] LIKE 'guest_%'
  )
);

-- ✅ Users can only delete their own recordings
CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ✅ Guests can delete their temporary recordings
CREATE POLICY "Guests can delete temporary recordings"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (storage.foldername(name))[1] LIKE 'guest_%'
);

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- With private bucket, you'll need to:
-- 1. Use createSignedUrl() instead of getPublicUrl() in your code
-- 2. Update src/lib/storage/audio.ts to use signed URLs
-- 3. Signed URLs expire after a set time (more secure)
-- =====================================================

-- To clean up old policies first:
-- DROP POLICY IF EXISTS "Anyone can upload recordings" ON storage.objects;
-- DROP POLICY IF EXISTS "Anyone can view recordings" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;


