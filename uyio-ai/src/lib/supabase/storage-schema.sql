-- =====================================================
-- SUPABASE STORAGE SETUP FOR AUDIO RECORDINGS (MVP)
-- =====================================================
-- ⚠️ THIS IS THE SIMPLE MVP VERSION
-- 
-- Uses public bucket for simplicity.
-- 
-- ⚠️ BEFORE PRODUCTION LAUNCH: 
-- Use storage-schema-secure.sql instead!
-- See PRODUCTION_CHECKLIST.md
-- =====================================================

-- 1. Create the recordings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for recordings bucket

-- Allow anyone to upload recordings (authenticated and guest users)
CREATE POLICY "Anyone can upload recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recordings');

-- Allow anyone to view recordings (public bucket)
CREATE POLICY "Anyone can view recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'recordings');

-- Users can only delete their own recordings
CREATE POLICY "Users can delete own recordings"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'recordings' 
  AND (
    -- Allow if the user_id folder matches their auth.uid
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Allow if it's a guest folder (temporary files)
    (storage.foldername(name))[1] LIKE 'guest_%'
  )
);

-- 3. Optional: Set bucket size limits (adjust as needed)
-- Maximum file size: 10MB
-- Maximum bucket size: 100GB per account

-- Note: You can configure these in the Supabase Dashboard under:
-- Storage > Settings > File size limits

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup worked correctly:

-- Check bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'recordings';

-- Check policies are created
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%recording%';

-- =====================================================
-- CLEANUP (if needed)
-- =====================================================
-- Uncomment and run if you need to reset:

-- DROP POLICY IF EXISTS "Anyone can upload recordings" ON storage.objects;
-- DROP POLICY IF EXISTS "Anyone can view recordings" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'recordings';

