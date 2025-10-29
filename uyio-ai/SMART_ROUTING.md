# Smart Routing Architecture

## Overview
Uyio AI uses **smart routing** where the homepage (`/`) shows different content based on authentication state:
- **Guest users** → GuestHero (marketing page)
- **Authenticated users** → UserDashboard (personalized dashboard)

---

## 🔒 Consistency Layers

### 1. **Middleware (Token Refresh)**
**File**: `middleware.ts` + `src/lib/supabase/middleware.ts`

**Purpose**: Runs on EVERY request to keep auth sessions valid

**How it works**:
```typescript
export async function middleware(request: NextRequest) {
  return await updateSession(request)  // Refreshes Supabase session
}
```

**Ensures**:
✅ Auth tokens never expire unexpectedly
✅ Session state stays consistent across requests
✅ Runs before any page renders

---

### 2. **Dynamic Homepage Rendering**
**File**: `src/app/page.tsx`

**Configuration**:
```typescript
export const dynamic = 'force-dynamic'  // Never cache
export const revalidate = 0             // Always fresh
```

**How it works**:
```typescript
export default async function HomePage() {
  const supabase = await createClient()
  const { user } = await supabase.auth.getUser()
  
  if (!user) return <GuestHero />
  return <UserDashboard />
}
```

**Ensures**:
✅ Auth check happens on EVERY page load
✅ No cached responses
✅ Always shows correct content

---

### 3. **Auth Callback (Magic Link Handler)**
**File**: `src/app/auth/callback/route.ts`

**How it works**:
```typescript
// Exchange code for session
await supabase.auth.exchangeCodeForSession(code)

// Check if user has profile
const profile = await getProfile(user.id)

if (!profile) {
  redirect('/auth/onboarding')  // New user
} else {
  redirect('/')  // Existing user → Homepage → UserDashboard
}
```

**Cache prevention**:
```typescript
response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
```

**Ensures**:
✅ Session fully established before redirect
✅ Profile check determines destination
✅ No browser caching of redirect

---

### 4. **Client-Side Fallback (UserDashboard)**
**File**: `src/components/home/UserDashboard.tsx`

**How it works**:
```typescript
useEffect(() => {
  const loadDashboard = async () => {
    const { user } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')  // Safety redirect
      return
    }
    
    const profile = await getProfile(user.id)
    
    if (!profile) {
      router.push('/auth/onboarding')  // Missing profile
      return
    }
    
    // Load dashboard data...
  }
  
  loadDashboard()
}, [])
```

**Ensures**:
✅ Double-checks auth state client-side
✅ Redirects if something went wrong
✅ Graceful error handling

---

## 🧪 Testing Checklist

### Scenario 1: New User Signup
```
1. Guest visits /
   ✅ Shows: GuestHero

2. Click "Start Free" → Enter email → Magic link sent
   ✅ Shows: "Check your email" message

3. Click magic link in email
   ✅ Redirects to: /auth/onboarding
   ✅ Shows: Setup form

4. Complete onboarding
   ✅ Redirects to: /
   ✅ Shows: UserDashboard (not GuestHero!)

5. Refresh page
   ✅ Still shows: UserDashboard
```

### Scenario 2: Returning User Login
```
1. User visits /
   ✅ Shows: GuestHero

2. Click "Sign In" → Enter email → Magic link sent
   ✅ Shows: "Check your email" message

3. Click magic link in email
   ✅ Redirects to: /
   ✅ Shows: UserDashboard (directly!)

4. Refresh page
   ✅ Still shows: UserDashboard

5. Open new tab → Go to uyio-ai.vercel.app
   ✅ Shows: UserDashboard (session persists!)
```

### Scenario 3: Session Expiry
```
1. User is logged in, viewing UserDashboard
   ✅ Shows: UserDashboard

2. Session expires (or user clears cookies)
   ✅ Middleware detects expired session

3. User navigates or refreshes
   ✅ Homepage detects no auth
   ✅ Shows: GuestHero
```

### Scenario 4: Manual URL Navigation
```
1. Logged-in user manually types: uyio-ai.vercel.app/
   ✅ Middleware refreshes session
   ✅ Homepage checks auth
   ✅ Shows: UserDashboard

2. Guest user manually types: uyio-ai.vercel.app/
   ✅ Middleware runs (no session to refresh)
   ✅ Homepage checks auth
   ✅ Shows: GuestHero
```

---

## 🚨 Common Issues & Prevention

### Issue 1: "Seeing GuestHero even though I'm logged in"
**Cause**: Cached page or stale session

**Prevention**:
✅ `dynamic = 'force-dynamic'` on homepage
✅ `revalidate = 0` prevents caching
✅ Middleware refreshes session on every request
✅ Cache-Control headers on auth callback

---

### Issue 2: "Magic link redirects to homepage but shows marketing"
**Cause**: Session not established before redirect

**Prevention**:
✅ Auth callback waits for `exchangeCodeForSession()` to complete
✅ Calls `getUser()` to verify session exists
✅ Only redirects after profile check
✅ Cache-Control prevents cached redirects

---

### Issue 3: "Inconsistent behavior across browsers/tabs"
**Cause**: Cookie sync issues or different session states

**Prevention**:
✅ Middleware runs on EVERY request (all tabs)
✅ Supabase uses httpOnly cookies (secure, auto-synced)
✅ Server-side auth check (not just client state)
✅ Force-dynamic ensures no stale data

---

## 📊 Flow Diagram

```
                    User Visits /
                         ↓
                   [Middleware]
                         ↓
              Refresh Supabase Session
                         ↓
                   [Homepage]
                         ↓
              Check auth.getUser()
                         ↓
                    ┌────┴────┐
                    │         │
                 Guest    Authenticated
                    │         │
                    ↓         ↓
              GuestHero  UserDashboard
                              ↓
                        [Client Check]
                              ↓
                         Has Profile?
                              ↓
                         ┌────┴────┐
                         NO       YES
                         │         │
                         ↓         ↓
                   /onboarding  Load Data
```

---

## 🔍 Debugging

If smart routing isn't working consistently:

### 1. Check Browser Console
```javascript
// Homepage should log:
"User authenticated: true/false"

// UserDashboard should log:
"Loading dashboard..."
"Profile loaded: {data}"
```

### 2. Check Network Tab
```
Request to /
  → Should NOT be cached
  → Should have fresh session cookie

Request to /auth/callback
  → Should have Cache-Control: no-store
```

### 3. Check Supabase Cookies
```
Open DevTools → Application → Cookies
  → Should see: sb-[project-id]-auth-token
  → If missing: Session expired or not set
```

### 4. Test Database Connection
```
Visit: /test-db
  → Should show:
    ✅ Database Connection: Connected
    ✅ Authentication: Logged in as [email]
    ✅ Database Tables: All 5 tables found
```

---

## ✅ Success Criteria

Smart routing is working consistently when:

1. ✅ **New users** → Magic link → Onboarding → Dashboard
2. ✅ **Returning users** → Magic link → Dashboard (skip onboarding)
3. ✅ **Page refreshes** → Shows correct content (no flicker)
4. ✅ **Multiple tabs** → All show same content
5. ✅ **Direct URL visit** → Correct content based on auth state
6. ✅ **Session expiry** → Gracefully shows GuestHero
7. ✅ **No caching issues** → Always fresh auth check

---

## 🎯 Key Takeaways

**The magic happens through layered consistency checks:**

1. **Middleware** → Keeps session alive
2. **Server-side rendering** → Fresh auth check every time
3. **Force-dynamic** → No caching
4. **Client-side fallback** → Error recovery
5. **Cache-Control** → Prevent browser caching

**Result**: One URL (`/`), smart content, consistent behavior! 🚀

