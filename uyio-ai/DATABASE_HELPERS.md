# Database Helpers Documentation

This document explains the comprehensive database layer we've built for Uyio AI.

## Overview

We've created a type-safe, error-handled database abstraction layer with the following features:

- ✅ Custom error handling
- ✅ Automatic retry logic
- ✅ Type safety with TypeScript
- ✅ Permission checks
- ✅ Proper validation
- ✅ Legacy compatibility

---

## File Structure

```
src/
├── lib/db/
│   ├── errors.ts          # Custom error classes and wrappers
│   ├── profiles.ts        # User profile operations
│   ├── sessions.ts        # Practice session management
│   ├── scenarios.ts       # Scenario CRUD operations
│   └── daily.ts           # Daily challenge management
├── types/
│   └── database.ts        # All TypeScript types
```

---

## Error Handling

### Custom Error Classes

```typescript
import { DatabaseError, NotFoundError, PermissionError, ValidationError } from '@/lib/db/errors'

try {
  await createProfile(userId, data)
} catch (error) {
  if (error instanceof ValidationError) {
    // Handle validation error
  } else if (error instanceof NotFoundError) {
    // Handle not found
  } else if (error instanceof PermissionError) {
    // Handle permission denied
  }
}
```

### Automatic Retry

Functions automatically retry on transient failures (up to 3 times):

```typescript
// Automatically retries on network errors
const profile = await createProfile(userId, {
  display_name: 'John Doe',
  primary_goal: 'clarity'
})
```

---

## Profiles (`src/lib/db/profiles.ts`)

### Create Profile

```typescript
import { createProfile } from '@/lib/db/profiles'

const profile = await createProfile(userId, {
  display_name: 'Jane Smith',
  primary_goal: 'confidence',
  practice_length_sec: 120
})
```

### Get Profile

```typescript
const profile = await getProfile(userId)
if (!profile) {
  // User doesn't have a profile yet
}
```

### Update Profile

```typescript
await updateProfile(userId, {
  primary_goal: 'clarity',
  display_name: 'Jane Doe'
})
```

### Increment Session Count

```typescript
// Automatically updates streak and last_practice_date
await incrementSessionCount(userId)
```

### Get Profile Stats

```typescript
const stats = await getProfileStats(userId)
// Returns: total_practice_time, average_session_length, most_practiced_goal, etc.
```

---

## Sessions (`src/lib/db/sessions.ts`)

### Create Session

```typescript
import { createSession } from '@/lib/db/sessions'

const session = await createSession({
  user_id: userId,
  scenario_id: scenarioId,
  audio_url: audioUrl,
  transcript: transcript,
  duration_sec: 90,
  scores: {
    clarity: 8,
    confidence: 7,
    logic: 9,
    pacing: 6,
    fillers: 8
  },
  coach_summary: "Great job! Your clarity was excellent.",
  coaching_tips: {
    clarity: "Keep using concrete examples",
    confidence: "Slow down slightly",
    // ... other tips
  },
  detected_metrics: {
    wpm: 150,
    fillerCount: 2,
    avgPauseLength: 0.5
  },
  is_daily_challenge: false
})
```

### Get Session

```typescript
const session = await getSession(sessionId)
// Includes scenario details via JOIN
```

### Get User Sessions (with filters)

```typescript
const sessions = await getUserSessions(userId, {
  limit: 20,
  offset: 0,
  dateFrom: new Date('2024-01-01'),
  dateTo: new Date(),
  scenarioType: 'work',
  goal: 'clarity'
})
```

### Get Recent Sessions

```typescript
const recentSessions = await getUserRecentSessions(userId, 5)
```

### Get Session Statistics

```typescript
const stats = await getSessionStats(userId)
// Returns: total_sessions, total_time, average_scores, sessions_by_day, sessions_by_context
```

### Delete Session

```typescript
// Verifies user owns the session
await deleteSession(sessionId, userId)
```

### Guest Sessions

```typescript
const guestSessions = await getGuestSessions(guestId)
// Only returns sessions from last 24 hours
```

---

## Scenarios (`src/lib/db/scenarios.ts`)

### Create Scenario

```typescript
import { createScenario } from '@/lib/db/scenarios'

const scenario = await createScenario({
  created_by: userId, // optional
  goal: 'clarity',
  context: 'work',
  difficulty: 'medium',
  prompt_text: "Explain your project to a stakeholder",
  objective: "Clearly communicate project status",
  eval_focus: ['clarity', 'confidence', 'logic'],
  time_limit_sec: 90
})
```

### Get Scenario

```typescript
const scenario = await getScenario(scenarioId)
// Automatically increments usage_count
```

### Get User's Scenarios

```typescript
const myScenarios = await getUserScenarios(userId)
```

### Get Popular Scenarios

```typescript
const popular = await getMostUsedScenarios(10)
```

---

## Daily Challenges (`src/lib/db/daily.ts`)

### Get Today's Challenge

```typescript
import { getTodaysChallenge } from '@/lib/db/daily'

const challenge = await getTodaysChallenge(userId)
if (!challenge) {
  // Create one for today
}
```

### Create Daily Challenge

```typescript
await createDailyChallenge(userId, scenarioId)
```

### Complete Daily Challenge

```typescript
await completeDailyChallenge(userId)
// Marks as completed and sets completed_at timestamp
```

### Get Daily Streak

```typescript
const streak = await getDailyChallengeStreak(userId)
console.log(`User has completed ${streak} days in a row!`)
```

---

## Common Usage Patterns

### After User Completes Practice

```typescript
// 1. Save the session
const session = await createSession({
  user_id: userId,
  scenario_id: scenarioId,
  audio_url: audioUrl,
  transcript: transcript,
  duration_sec: 90,
  scores: feedbackScores,
  coach_summary: feedback.summary,
  coaching_tips: feedback.coaching,
  detected_metrics: feedback.detectedMetrics
})

// 2. Check if it was a daily challenge
if (isDailyChallenge) {
  await completeDailyChallenge(userId)
}

// 3. Session count and streak are automatically updated!
```

### Loading Dashboard Data

```typescript
// Get all needed data
const [profile, recentSessions, stats, todaysChallenge] = await Promise.all([
  getProfile(userId),
  getUserRecentSessions(userId, 5),
  getProfileStats(userId),
  getTodaysChallenge(userId)
])
```

### Loading Progress Page

```typescript
const [sessions, stats] = await Promise.all([
  getUserSessions(userId, { limit: 100, dateFrom: thirtyDaysAgo }),
  getSessionStats(userId)
])
```

---

## Type Definitions

All types are exported from `src/types/database.ts`:

```typescript
import type {
  Profile,
  ProfileInput,
  ProfileStats,
  SessionDB,
  SessionInput,
  SessionStats,
  ScenarioDB,
  ScenarioInput,
  DailyScenario,
  // ... and more
} from '@/types/database'
```

---

## Error Handling Best Practices

### Always Catch Errors

```typescript
try {
  const profile = await getProfile(userId)
  if (!profile) {
    // Handle new user
    await createProfile(userId, defaultData)
  }
} catch (error) {
  console.error('Failed to load profile:', error)
  toast.error('Could not load your profile. Please try again.')
}
```

### Use TypeScript for Safety

```typescript
import { NotFoundError } from '@/lib/db/errors'

try {
  await deleteSession(sessionId, userId)
} catch (error) {
  if (error instanceof NotFoundError) {
    toast.error('Session not found')
  } else if (error instanceof PermissionError) {
    toast.error('You do not have permission to delete this session')
  } else {
    toast.error('Failed to delete session')
  }
}
```

---

## Performance Tips

1. **Batch operations when possible**
   ```typescript
   const [profile, sessions, stats] = await Promise.all([
     getProfile(userId),
     getUserSessions(userId),
     getSessionStats(userId)
   ])
   ```

2. **Use pagination for large datasets**
   ```typescript
   const page1 = await getUserSessions(userId, { limit: 20, offset: 0 })
   const page2 = await getUserSessions(userId, { limit: 20, offset: 20 })
   ```

3. **Cache results when appropriate**
   - Profile data (rarely changes)
   - Recent sessions (use `useProgressData` hook which has caching)

---

## Migration from Old Code

If you have old code using the previous functions, they still work:

```typescript
// OLD (still works)
await saveSession({
  user_id: userId,
  scenario_id: scenarioId,
  audio_url: audioUrl,
  transcript: transcript,
  duration_sec: 90,
  feedback: feedbackResult
})

// NEW (preferred)
await createSession({
  user_id: userId,
  scenario_id: scenarioId,
  audio_url: audioUrl,
  transcript: transcript,
  duration_sec: 90,
  scores: feedbackResult.scores,
  coach_summary: feedbackResult.summary,
  coaching_tips: feedbackResult.coaching,
  detected_metrics: feedbackResult.detectedMetrics
})
```

---

## Next Steps

### To implement courses functionality:

1. Create `src/lib/db/courses.ts`
2. Add functions:
   - `getCourses()`
   - `getCourseProgress(userId, courseId)`
   - `markLessonComplete(userId, lessonId)`

### To add caching:

1. Implement in-memory cache with TTL
2. Invalidate cache on updates
3. Use React Query or SWR for client-side caching

---

## Summary

✅ **6 new files created**  
✅ **954 lines of robust database code**  
✅ **Type-safe operations**  
✅ **Automatic error handling**  
✅ **Retry logic**  
✅ **Permission checks**  
✅ **Legacy compatibility maintained**

All database operations are now centralized, typed, and error-handled!

