# 🐛 Debug: Practice Flow Not Saving & Audio Not Playing

## Issue Summary:
1. ❌ Practice sessions not being saved to database
2. ❌ Audio playback not working

---

## 🔍 Diagnostic Steps

### Check #1: Is Audio Actually Being Recorded?

**Open Browser Console (F12) and look for:**

```
✅ GOOD:
- "Recording started"
- "Recording stopped"
- "Recording uploaded successfully!"

❌ BAD:
- "Failed to upload recording"
- "Network error"
- "CORS error"
```

---

### Check #2: Is OpenAI API Key Set?

**In Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Check if `OPENAI_API_KEY` is set
3. If missing → Add it with your OpenAI API key

**Without this key**:
- ❌ Transcription will fail
- ❌ Analysis will fail
- ❌ Session won't be saved (because feedback is incomplete)

---

### Check #3: Is Audio Upload Working?

**Console should show:**
```javascript
POST /api/session/upload → 200 OK
Response: { audioUrl: "https://..." }
```

**If you see 500 error:**
- Supabase Storage not configured
- Or CORS issue

---

### Check #4: Check Supabase Storage

**In Supabase Dashboard:**
1. Go to Storage
2. Check if `recordings` bucket exists
3. Check if any files are being uploaded

**Expected:**
- Bucket name: `recordings`
- Files: `recording_[timestamp].webm`

---

### Check #5: Is Session Being Saved?

**In Supabase Dashboard:**
1. Go to Table Editor
2. Open `sessions` table
3. Check if any rows exist

**If empty:**
- Practice flow is not completing
- Or OpenAI API is failing

---

## 🚨 Common Failure Points

### Failure Point #1: Microphone Permission

**Symptom**: Recording doesn't start

**Solution**:
```
1. Click the lock icon in browser address bar
2. Allow microphone access
3. Refresh page
```

---

### Failure Point #2: OpenAI API Key Missing

**Symptom**: Recording works, but then fails at "Transcribing..."

**Fix in Vercel**:
```
Settings → Environment Variables → Add:
Name: OPENAI_API_KEY
Value: sk-...your-key...
```

**Then redeploy!**

---

### Failure Point #3: Supabase Storage Not Set Up

**Symptom**: "Failed to upload recording" error

**Fix in Supabase**:
```sql
-- Run this in Supabase SQL Editor:

-- Create recordings bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', false);

-- Add RLS policies
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recordings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own recordings"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'recordings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

### Failure Point #4: Audio Format Not Supported

**Symptom**: Recording uploads, but won't play

**Check**:
- Browser records as `.webm` (Chrome, Firefox)
- Safari might record as `.mp4` or `.wav`

**AudioPlayback component supports**: webm, mp4, wav, ogg

---

### Failure Point #5: CORS Issue with Supabase Storage

**Symptom**: Audio URL exists, but playback fails with CORS error

**Fix in Supabase**:
```
Storage → Recordings bucket → Configuration → CORS

Allowed Origins: *
Allowed Methods: GET, POST
```

---

## 🧪 Quick Test

**Run this in browser console on feedback page:**

```javascript
// Check if audioUrl exists
console.log('Audio URL:', document.querySelector('audio')?.src)

// Try to play manually
document.querySelector('audio')?.play()
  .then(() => console.log('✅ Playback works!'))
  .catch(err => console.error('❌ Playback failed:', err))
```

---

## 📊 Expected Flow

```
1. Click "Start Practice"
   → Loads scenario ✅
   
2. Click Record
   → Microphone permission requested ✅
   → Recording starts (red icon) ✅
   
3. Click Stop
   → Recording stops ✅
   → Uploads to /api/session/upload ✅
   → Returns audioUrl ✅
   
4. Transcription
   → Calls OpenAI Whisper API ✅
   → Returns transcript text ✅
   
5. Analysis
   → Calls OpenAI GPT-4 ✅
   → Returns scores + coaching ✅
   
6. Feedback Page
   → Displays results ✅
   → Saves session to database ✅
   → Audio playback works ✅
```

---

## 🔧 Quick Fixes to Try

### Fix #1: Clear Browser Cache
```
Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Fix #2: Check Browser Console
```
F12 → Console tab
Look for red error messages
```

### Fix #3: Test in Incognito
```
Fresh browser state
No cache issues
```

### Fix #4: Check Network Tab
```
F12 → Network tab
Record a session
Watch for failed requests (red)
```

---

## 🎯 What I Need From You

To help debug, please provide:

1. **Browser Console Errors**
   - Open F12 → Console
   - Record a practice session
   - Copy any red error messages

2. **Network Tab**
   - F12 → Network
   - Filter by "Fetch/XHR"
   - Which requests are failing?

3. **Vercel Environment**
   - Is `OPENAI_API_KEY` set?
   - Any deployment errors?

4. **Supabase Check**
   - Does `recordings` bucket exist in Storage?
   - Are there any rows in `sessions` table?
   - Any auth errors in Supabase logs?

---

## 💡 Most Likely Issue

**My guess**: OpenAI API key is not set in Vercel

**Why this breaks everything**:
1. ❌ Recording uploads → ✅ Works
2. ❌ Transcription fails → ❌ No transcript
3. ❌ Analysis fails → ❌ No feedback
4. ❌ Session not saved → ❌ No progress
5. ❌ Feedback page shows error → ❌ No audio playback

**Fix**: Add `OPENAI_API_KEY` to Vercel environment variables and redeploy!

---

## 🚀 Test Commands

**Test Audio Upload:**
```bash
curl -X POST https://uyio-ai.vercel.app/api/session/upload \
  -H "Content-Type: multipart/form-data" \
  -F "audio=@test.webm"
```

**Test Transcription:**
```bash
curl -X POST https://uyio-ai.vercel.app/api/session/transcribe \
  -H "Content-Type: application/json" \
  -d '{"audioUrl":"https://..."}'
```

**Test Analysis:**
```bash
curl -X POST https://uyio-ai.vercel.app/api/session/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript":"test", "scenarioId":"123"}'
```

---

**Let me know what you find in the console and I'll fix it!** 🐛

