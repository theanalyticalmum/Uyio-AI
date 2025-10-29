# Critical Issues to Fix

## Issue #1: Too Many "Start Practice" Buttons ❌

**Problem**: Confusing UX with 3 different practice buttons
- "Start Challenge" (daily challenge card)
- "Start Practice" (quick practice card)  
- "Start First Practice" (empty state in recent sessions)

**Solution**:
- Daily Challenge → "Try Today's Challenge" ✅
- Quick Practice → Keep as "Start Practice" ✅
- Empty State → Remove button text, just show icon/text ✅

---

## Issue #2: Sessions Not Saving to Database ⚠️ CRITICAL

**Problem**: Practice sessions not being saved to Supabase `sessions` table

**Root Cause**: Practice flow doesn't actually call database save functions

**Files to Check**:
- `src/app/practice/page.tsx` - Does it save after recording?
- `src/app/practice/feedback/page.tsx` - Does it save session data?
- `src/lib/db/sessions.ts` - Are save functions being called?

**Solution**: Add proper session saving in practice flow

---

## Issue #3: Goal Selection Clarity ⚠️

**Problem**: Onboarding doesn't clarify you can only choose ONE goal

**Solution**: Add helper text:
```
"What's your primary goal?"
→ "Choose your primary focus (you can change this later in Settings)"
```

---

## Issue #4: Audio Playback Not Working ⚠️ CRITICAL

**Problem**: Play buttons don't work on recorded audio

**Files to Check**:
- `src/components/feedback/AudioPlayback.tsx` - Audio player component
- `src/components/practice/VoiceRecorder.tsx` - Where audio is recorded

**Possible Causes**:
1. Audio blob not being stored correctly
2. Audio URL not being generated
3. Audio element not initialized
4. CORS issues with Supabase Storage

**Solution**: Debug audio storage and playback flow

---

## Issue #5: Progress Not Tracking ⚠️ CRITICAL

**Problem**: No progress showing for authenticated users

**Root Cause**: Likely related to Issue #2 - if sessions aren't saving, progress can't track

**Dependencies**:
- Fix Issue #2 first (session saving)
- Then progress will automatically track

---

## Priority Order:

1. **Issue #2** - Sessions not saving (blocks #5)
2. **Issue #4** - Audio playback not working
3. **Issue #5** - Progress tracking (depends on #2)
4. **Issue #1** - Button labels (UX polish)
5. **Issue #3** - Goal selection text (UX clarity)

---

## Next Steps:

1. ✅ Investigate practice flow to find where session saving should happen
2. ✅ Add database save calls after practice completion
3. ✅ Fix audio storage/playback
4. ✅ Test progress tracking
5. ✅ Polish button labels
6. ✅ Add goal selection helper text

