# 🔧 Supabase Client Fix - Server Routes

**Fixed authentication errors in server routes by passing server client instances to storage functions**

---

## 🐛 Problem

### **Before (Broken):**

**Server API Route:**
```typescript
// src/app/api/session/upload/route.ts
const supabase = await createActionClient() // ✅ Server client with auth context

const result = await uploadAudio(audioBlob, userId) // ❌ Calls storage function
```

**Storage Function:**
```typescript
// src/lib/storage/audio.ts
export async function uploadAudio(audioBlob: Blob, userId: string) {
  const supabase = createClient() // ❌ WRONG! Creates BROWSER client on server
  
  // This client has no auth context, causes permission errors
  const { data, error } = await supabase.storage.upload(...)
}
```

**Error Messages:**
```
Error: Invalid JWT token
Error: Access denied to storage bucket
Error: Authentication required
```

---

## ✅ Solution

### **After (Fixed):**

**Server API Route:**
```typescript
// src/app/api/session/upload/route.ts
const supabase = await createActionClient() // ✅ Server client with auth context

const result = await uploadAudio(audioBlob, userId, supabase) // ✅ Pass client
```

**Storage Function:**
```typescript
// src/lib/storage/audio.ts
export async function uploadAudio(
  audioBlob: Blob,
  userId: string,
  supabase: SupabaseClient // ✅ Receive client from caller
) {
  // Uses the server client with proper auth context
  const { data, error } = await supabase.storage.upload(...)
}
```

---

## 🔑 Key Concept: Client Types

### **Browser Client (`createClient()` from `@/lib/supabase/client`)**
- ✅ Used in: Client components, browser JavaScript
- ✅ Has access to: Browser cookies, localStorage
- ❌ Cannot be used in: Server routes, server components
- **Why it fails on server:** No access to auth cookies in server context

### **Server Client (`createClient()` from `@/lib/supabase/server`)**
- ✅ Used in: Server components (read-only)
- ✅ Has access to: Server-side cookies (read-only)
- ✅ Proper authentication context in server environment

### **Action Client (`createActionClient()` from `@/lib/supabase/server`)**
- ✅ Used in: API routes, server actions
- ✅ Has access to: Server-side cookies (read + write)
- ✅ Can modify auth state (set/remove cookies)
- **This is what we pass to storage functions!**

---

## 📝 Changes Made

### **1. Updated Storage Functions**

**File:** `src/lib/storage/audio.ts`

**Functions Updated:**
- `uploadAudio()` - Now accepts `supabase: SupabaseClient` parameter
- `deleteAudio()` - Now accepts `supabase: SupabaseClient` parameter
- `getAudioUrl()` - Now accepts `supabase: SupabaseClient` parameter
- `checkRecordingsBucket()` - Now accepts `supabase: SupabaseClient` parameter

**Before:**
```typescript
export async function uploadAudio(
  audioBlob: Blob,
  userId: string
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  const supabase = createClient() // ❌ Creates browser client
  // ...
}
```

**After:**
```typescript
export async function uploadAudio(
  audioBlob: Blob,
  userId: string,
  supabase: SupabaseClient // ✅ Accepts server client
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  // Uses the passed client (has auth context)
  // ...
}
```

---

### **2. Updated API Routes**

**File:** `src/app/api/session/upload/route.ts`

**Before:**
```typescript
const supabase = await createActionClient()
const { data: { user } } = await supabase.auth.getUser()

// ...

const result = await uploadAudio(audioBlob, userId) // ❌ Missing client
```

**After:**
```typescript
const supabase = await createActionClient()
const { data: { user } } = await supabase.auth.getUser()

// ...

const result = await uploadAudio(audioBlob, userId, supabase) // ✅ Pass client
```

---

### **3. Future-Proofed Secure Version**

**File:** `src/lib/storage/audio-secure.ts`

Also updated the secure version (private bucket with signed URLs) with the same pattern:
- `uploadAudio()` - Accepts `supabase` parameter
- `refreshSignedUrl()` - Accepts `supabase` parameter
- `deleteAudio()` - Accepts `supabase` parameter
- `checkRecordingsBucket()` - Accepts `supabase` parameter

This ensures when we switch to the secure version in production, it will work correctly.

---

## 🎯 Why This Pattern?

### **Dependency Injection Pattern**

**Benefits:**
1. ✅ **Correct Auth Context** - Server routes control which client is used
2. ✅ **Testability** - Can pass mock clients for testing
3. ✅ **Flexibility** - Caller decides browser vs server client
4. ✅ **Single Responsibility** - Storage functions don't manage auth
5. ✅ **No Hidden Dependencies** - Clear which client is being used

**Anti-Pattern (What We Avoided):**
```typescript
// ❌ BAD: Function creates its own client
function uploadAudio() {
  const supabase = createClient() // Hidden dependency, wrong client type
}

// ✅ GOOD: Function receives client
function uploadAudio(supabase: SupabaseClient) {
  // Uses the correct client passed by caller
}
```

---

## 🧪 Testing The Fix

### **Before Fix:**
```bash
# Upload attempt
curl -X POST https://uyio.ai/api/session/upload \
  -H "Cookie: sb-access-token=..." \
  -F "audio=@recording.webm"

# Response:
{
  "error": "Invalid JWT token"
}
```

### **After Fix:**
```bash
# Upload attempt
curl -X POST https://uyio.ai/api/session/upload \
  -H "Cookie: sb-access-token=..." \
  -F "audio=@recording.webm"

# Response:
{
  "success": true,
  "audioUrl": "https://...",
  "userId": "user-123",
  "size": 45678,
  "type": "audio/webm"
}
```

---

## 📊 Impact

### **Files Modified:**
- `src/lib/storage/audio.ts` (4 functions updated)
- `src/lib/storage/audio-secure.ts` (4 functions updated)
- `src/app/api/session/upload/route.ts` (1 call site updated)

### **Lines Changed:** ~30 lines

### **Breaking Changes:** ⚠️ Yes - storage function signatures changed

**Migration Required:**
Any code calling these functions must now pass a Supabase client:
```typescript
// Old:
await uploadAudio(blob, userId)

// New:
await uploadAudio(blob, userId, supabase)
```

**Currently Only Used In:**
- `src/app/api/session/upload/route.ts` ✅ Fixed

---

## 🔒 Security Improvements

### **Before:**
- ❌ Browser client used on server (no auth context)
- ❌ Uploads could fail authentication
- ❌ Storage operations bypass RLS policies

### **After:**
- ✅ Server client used on server (proper auth context)
- ✅ All uploads authenticated correctly
- ✅ Storage operations respect RLS policies
- ✅ User identity preserved in storage metadata

---

## 📚 Best Practices Going Forward

### **Rule 1: Never Import Browser Client in Server Code**

**❌ Don't:**
```typescript
// In API route or server component
import { createClient } from '@/lib/supabase/client' // WRONG!
```

**✅ Do:**
```typescript
// In API route or server component
import { createActionClient } from '@/lib/supabase/server' // CORRECT!
```

---

### **Rule 2: Pass Server Client to Helper Functions**

**❌ Don't:**
```typescript
// Helper function creates its own client
export async function helperFunction() {
  const supabase = createClient() // WRONG! Which client?
  // ...
}
```

**✅ Do:**
```typescript
// Helper function receives client from caller
export async function helperFunction(supabase: SupabaseClient) {
  // Uses the correct client passed by caller
  // ...
}
```

---

### **Rule 3: Create Client Once Per Request**

**❌ Don't:**
```typescript
// API route
export async function POST(request: Request) {
  const supabase1 = await createActionClient()
  await doThing1(supabase1)
  
  const supabase2 = await createActionClient() // WASTEFUL!
  await doThing2(supabase2)
}
```

**✅ Do:**
```typescript
// API route
export async function POST(request: Request) {
  const supabase = await createActionClient() // Once
  await doThing1(supabase) // Pass to all functions
  await doThing2(supabase)
}
```

---

## 🚨 Common Mistakes to Avoid

### **Mistake 1: Using Browser Client in API Routes**
```typescript
// ❌ WRONG
import { createClient } from '@/lib/supabase/client'

export async function POST(request: Request) {
  const supabase = createClient() // NO AUTH CONTEXT!
}
```

### **Mistake 2: Creating Multiple Clients**
```typescript
// ❌ WASTEFUL
export async function POST(request: Request) {
  const supabase1 = await createActionClient()
  const supabase2 = await createActionClient() // Unnecessary
}
```

### **Mistake 3: Not Passing Client to Helpers**
```typescript
// ❌ HIDDEN BUG
export async function POST(request: Request) {
  const supabase = await createActionClient()
  
  // This function creates its own client internally (wrong type!)
  await uploadAudio(blob, userId) // MISSING: supabase
}
```

---

## 📖 Related Documentation

- **Supabase SSR Docs:** https://supabase.com/docs/guides/auth/server-side/nextjs
- **Next.js Server Actions:** https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations
- **Dependency Injection:** https://en.wikipedia.org/wiki/Dependency_injection

---

## ✅ Checklist for New API Routes

When creating new API routes that use Supabase:

- [ ] Import `createActionClient` (not browser client)
- [ ] Create client once at route start
- [ ] Pass client to all helper functions
- [ ] Never create multiple clients per request
- [ ] Test with authenticated and unauthenticated requests
- [ ] Verify RLS policies are enforced

---

**Last Updated:** November 7, 2025  
**Impact:** High - Fixes critical auth bugs  
**Complexity:** Low - Simple pattern to follow  
**Status:** ✅ Fixed and documented

