-- =====================================================
-- SECURE SUPABASE STORAGE SETUP FOR AUDIO RECORDINGS
-- =====================================================
-- This version CLEANS UP old policies first, then creates secure ones
-- Run this complete script in Supabase SQL Editor
-- =====================================================

-- STEP 1: Clean up old policies
-- =====================================================
DROP POLICY IF EXISTS "Anyone can upload recordings" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;

-- STEP 2: Update bucket to private
-- =====================================================
UPDATE storage.buckets 
SET public = false 
WHERE id = 'recordings';

-- STEP 3: Create new secure policies
-- =====================================================

-- ✅ Only authenticated users can upload to their own folder
CREATE POLICY "Authenticated users can upload recordings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ✅ Allow guest uploads (authenticated users uploading to guest_ folders)
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
    auth.uid()::text = (storage.foldername(name))[1]
    OR (storage.foldername(name))[1] LIKE 'guest_%'
  )
);

-- ✅ Users can only delete their own recordings
CREATE POLICY "Users can delete own recordings only"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings'
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR (storage.foldername(name))[1] LIKE 'guest_%'
  )
);

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Check that bucket is now private:
SELECT id, name, public FROM storage.buckets WHERE id = 'recordings';

-- Check that 4 new policies exist:
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- After running this, you need to update your code:
-- 1. Replace src/lib/storage/audio.ts with audio-secure.ts
-- 2. Test that uploads and playback still work
-- 3. Signed URLs will now be used instead of public URLs
-- =====================================================


