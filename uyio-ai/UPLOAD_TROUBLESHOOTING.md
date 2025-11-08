# 🔧 Upload Troubleshooting Guide

## 🐛 Issue: "Upload failed. Cannot transcribe."

**Symptoms:**
- Recording completes successfully
- Shows "Upload failed. Cannot transcribe." error
- Practice session doesn't proceed to transcription

---

## 🎯 Root Cause

The app is trying to upload to the **private** Supabase storage bucket (`recordings-private`), which may not be set up yet.

---

## ✅ Solution: Set Up Private Storage Bucket

### **Step 1: Check if Bucket Exists**

1. Go to your Supabase Dashboard
2. Click **Storage** in the left sidebar
3. Look for a bucket named **`recordings-private`**

**If it exists:** Skip to Step 2  
**If it doesn't exist:** Continue below

---

### **Step 2: Create the Private Bucket** (if missing)

**Option A: Via SQL Query (Recommended)**

Run this SQL in Supabase SQL Editor:

```sql
-- Create private recordings bucket (run this in Supabase SQL Editor)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings-private',
  'recordings-private',
  false, -- PRIVATE!
  10485760, -- 10MB limit
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
)
ON CONFLICT (id) DO NOTHING;
```

**Option B: Via Dashboard UI**

1. Go to **Storage** → **New bucket**
2. Name: `recordings-private`
3. ✅ **Make bucket private** (important!)
4. Set file size limit: `10 MB`
5. Click **Create bucket**

---

### **Step 3: Set Up Row Level Security (RLS) Policies**

Run this SQL to allow authenticated users to upload their own recordings:

```sql
-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Users can upload own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects;
DROP POLICY IF EXISTS "Service role full access" ON storage.objects;

-- 1. Users can upload their own recordings
CREATE POLICY "Users can upload own recordings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'recordings-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. Users can access their own recordings
CREATE POLICY "Users can access own recordings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'recordings-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Users can delete their own recordings
CREATE POLICY "Users can delete own recordings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'recordings-private'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Service role can access all (for cleanup/admin)
CREATE POLICY "Service role full access"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'recordings-private')
WITH CHECK (bucket_id = 'recordings-private');
```

---

### **Step 4: Verify Setup**

Run this SQL to verify the bucket exists and is private:

```sql
-- Check bucket configuration
SELECT id, public, file_size_limit 
FROM storage.buckets 
WHERE id = 'recordings-private';

-- Expected result:
-- id                  | public | file_size_limit
-- recordings-private  | false  | 10485760
```

If you see `public = false` and `file_size_limit = 10485760`, you're all set! ✅

---

### **Step 5: Test the Upload**

1. Go back to your app
2. Try recording a practice session
3. Should now upload successfully ✅

---

## 🔍 Additional Diagnostics

### **Check Browser Console**

Press `F12` (or `Cmd+Option+I` on Mac) and look for:

```
Upload failed: {
  error: "new row violates row-level security policy"
  ...
}
```

**This means:** RLS policies aren't set up correctly. Re-run Step 3.

```
Upload failed: {
  error: "Bucket not found"
  ...
}
```

**This means:** The `recordings-private` bucket doesn't exist. Run Step 2.

---

## 🎭 Guest Scoring Issue: Fixed!

### **Problem**
Guest users were getting high scores (7-10/10) even when they didn't say anything.

### **Root Cause**
Guest practice uses mock/fake scoring to provide a preview. The scores were previously random between 7-10, regardless of recording duration.

### **Fix Applied** ✅
Now scores are based on recording duration:

- **< 5 seconds** (silence/very short): **3-5/10** ❌
- **5-15 seconds** (short response): **5-7/10** ⚠️
- **15+ seconds** (decent response): **7-9/10** ✅

**Result:** Guests who don't speak will now get appropriately low scores, making it feel more realistic.

---

## 📊 Expected Behavior

### **For Guests:**
1. Record practice session
2. Get mock scores based on duration
3. See preview of feedback
4. Prompted to sign up for real AI analysis

### **For Authenticated Users:**
1. Record practice session ✅
2. Upload to private Supabase storage ✅
3. Transcribe with OpenAI Whisper ✅
4. Analyze with GPT-4o ✅
5. Save session to database ✅
6. Display detailed feedback ✅

---

## 🚨 Common Issues

### **Issue: "Too many upload requests"**
**Cause:** Rate limiting (20 uploads per minute)  
**Solution:** Wait a minute and try again

### **Issue: "Invalid audio format"**
**Cause:** Browser sent unsupported MIME type  
**Solution:** Use Chrome, Firefox, or Safari (latest versions)

### **Issue: "File too large"**
**Cause:** Recording exceeds 10MB limit  
**Solution:** Keep recordings under 3 minutes

### **Issue: Signed URL expired**
**Cause:** Trying to access audio after 1 hour  
**Solution:** Record a new session (old recordings expire for privacy)

---

## 🔐 Security Notes

### **Why Private Storage?**
- ✅ Recordings are private by default
- ✅ Users can only access their own recordings
- ✅ Signed URLs expire after 1 hour
- ✅ No public access to sensitive audio

### **Why Signed URLs?**
- ✅ Time-limited access (1 hour)
- ✅ No permanent public URLs
- ✅ Automatic expiration for privacy
- ✅ Prevents unauthorized playback

---

## 📞 Still Having Issues?

### **Check These:**

1. ✅ Supabase project URL is correct in `.env.local`
2. ✅ Supabase anon key is correct in `.env.local`
3. ✅ OpenAI API key is set in Vercel environment variables
4. ✅ All environment variables are added to Vercel
5. ✅ App has been redeployed after adding env vars

### **Get Help:**

1. Check browser console (F12) for errors
2. Check Vercel logs for server-side errors
3. Check Supabase logs for storage errors
4. Check Network tab (F12) to see which API call fails

---

## ✅ Quick Checklist

- [ ] `recordings-private` bucket exists in Supabase
- [ ] Bucket is set to **private** (not public)
- [ ] RLS policies are set up
- [ ] Tested recording + upload
- [ ] Guest scoring feels realistic
- [ ] Authenticated users can upload successfully

Once all boxes are checked, you're good to go! 🚀

---

**Last Updated:** November 7, 2025  
**Fixes Applied:** 
- Guest scoring now based on duration
- Better error logging for uploads
- Comprehensive troubleshooting guide

