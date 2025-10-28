# Guest Mode Setup Guide

## Overview

Guest mode allows users to try Uyio AI without signing up. Users get 3 free practice sessions per day with simplified features.

## What Was Built

### 🎯 Core Files Created

**1. Guest Session Management**
- `src/lib/auth/guest.ts` - localStorage-based session tracking
  - Generate unique guest IDs
  - Track daily session limits (3/day)
  - Store practice scores temporarily
  - Check conversion triggers

**2. Pages**
- `src/app/page.tsx` - Updated landing with guest CTA
- `src/app/practice/guest/page.tsx` - Simplified 60s practice flow

**3. Components**
- `src/components/auth/SignupPromptModal.tsx` - Conversion modal after practice
- `src/components/guest/GuestLimitBanner.tsx` - Shows remaining sessions
- `src/components/home/GuestDashboard.tsx` - Stats for guest users

**4. API Routes**
- `src/app/api/guest/session/route.ts` - Track guest sessions

**5. Database Schema**
- `src/lib/supabase/guest-schema.sql` - Guest tracking tables

---

## Database Setup

Run this SQL in your Supabase SQL Editor:

```bash
# Open the file
cat src/lib/supabase/guest-schema.sql
```

This adds:
- `guest_sessions` table
- `is_guest` and `guest_id` columns to `sessions` table
- Migration function for guest → user conversion

---

## Features Implemented

### ✅ Guest Experience

**Landing Page:**
- Two CTAs: "Try It Now" (guest) vs "Sign In/Sign Up"
- "3 Free Sessions" badge
- Auto-redirect authenticated users to dashboard

**Practice Flow:**
- Fixed 60-second sessions
- No signup required
- Instant AI feedback (simulated)
- Session count tracking

**Limits:**
- Max 3 sessions per day
- Resets at midnight local time
- No progress saved to database
- Simplified feedback (3 tips vs 5)

### ✅ Conversion Optimization

**Signup Prompts:**
- After completing 3 sessions
- After scoring >8/10
- "Maybe later" option (dismissable)

**Conversion Benefits:**
- Show their score with praise
- List premium features
- One-click email signup
- Session count carried over

**Guest → Member:**
- Detect returning guests
- Pre-fill signup form
- Show "You've completed X sessions"
- Migrate data on signup

---

## How It Works

### 1. First Visit
```
User lands → Clicks "Try It Now" → Practice page
↓
localStorage creates guest session:
{
  guestId: "guest_1234_abc",
  sessionCount: 0,
  todaysSessions: 0,
  scores: []
}
```

### 2. Practice Session
```
Record 60s → AI feedback → Score saved to localStorage
↓
Increment sessionCount and todaysSessions
↓
Check if should prompt signup (3 sessions OR high score)
```

### 3. Daily Reset
```
Midnight check → Reset todaysSessions to 0
```

### 4. Limit Reached
```
3 sessions completed → Show "Sign up for unlimited"
↓
Display countdown to reset
```

### 5. Conversion
```
Guest signs up → Email sent → Magic link clicked
↓
Detect guest mode → Show "Welcome back!"
↓
Profile created → Guest data can be migrated
```

---

## Testing Checklist

### Landing Page
- [ ] See "Try It Now" button for logged-out users
- [ ] See "Continue Practice" for logged-in users
- [ ] "3 Free Sessions" badge visible
- [ ] Responsive on mobile

### Guest Practice
- [ ] Can start recording without login
- [ ] 60-second countdown works
- [ ] Stop button ends recording
- [ ] Feedback screen shows score
- [ ] "Sign up to save" CTA appears

### Session Limits
- [ ] Banner shows "2 sessions left" after 1st practice
- [ ] After 3 sessions, see "Daily limit reached"
- [ ] Can't practice when limit hit
- [ ] Countdown to reset displays

### Signup Conversion
- [ ] Modal appears after 3rd session
- [ ] Shows score and benefits
- [ ] Email signup works
- [ ] "Maybe later" closes modal
- [ ] Returning guest sees session count on signup page

### Data Persistence
- [ ] Guest data survives page refresh
- [ ] Daily reset works at midnight
- [ ] localStorage clears after signup (optional)

---

## localStorage Keys

```javascript
// Guest session data
uyio_guest_session = {
  guestId: string
  sessionCount: number
  todaysSessions: number
  dailyResetAt: string (ISO date)
  bestScoreToday: number | null
  scores: Array<{timestamp, clarity, confidence, overall}>
}
```

---

## Guest Mode Restrictions

| Feature | Guest | Member |
|---------|-------|--------|
| Daily sessions | 3 | Unlimited |
| Session length | 60s fixed | 60s/90s/120s/180s |
| Goal selection | General only | 5 specialized goals |
| Progress tracking | Current session only | Full history |
| Courses | ❌ No access | ✅ Full access |
| Daily challenges | ❌ No access | ✅ Full access |
| Audio saved | ❌ Memory only | ✅ Database |
| Feedback depth | 3 tips | 5 tips + detailed |

---

## Environment Variables

No additional env vars needed! Guest mode works with existing setup.

---

## Next Steps

1. **Run the guest schema SQL** in Supabase
2. **Test the landing page** at http://localhost:3000
3. **Try guest practice** at http://localhost:3000/practice/guest
4. **Test signup conversion** after 3 sessions

---

## Customization Options

**Adjust Daily Limit:**
```typescript
// In src/lib/auth/guest.ts
const MAX_DAILY_SESSIONS = 3 // Change to 5, 10, etc.
```

**Change Session Length:**
```typescript
// In src/app/practice/guest/page.tsx
setCountdown(90) // Change from 60 to 90 seconds
```

**Modify Conversion Triggers:**
```typescript
// In src/lib/auth/guest.ts shouldPromptSignup()
if (session.sessionCount >= 5) // Prompt after 5 instead of 3
if (session.bestScoreToday > 9) // Only high scores
```

---

## Troubleshooting

**"Daily limit reached" but it's a new day:**
- Check browser time zone
- Clear localStorage: `localStorage.removeItem('uyio_guest_session')`

**Signup modal not appearing:**
- Check console for errors
- Verify `shouldPromptSignup()` logic
- Check if modal state is managed correctly

**Guest data not persisting:**
- Verify localStorage is enabled
- Check for private browsing mode
- Inspect Application tab in DevTools

---

## Migration to Paid Features

When ready to add paid plans:
1. Keep guest mode as free tier
2. Add "Pro" features (longer sessions, advanced coaching)
3. Use guest conversion data to optimize pricing
4. Track guest → paid conversion rate

---

🎉 **Guest mode is ready!** Users can now try Uyio AI without friction, and you have multiple conversion touchpoints built in.


