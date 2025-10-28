# 🔒 Rate Limiting Implementation

## ✅ Status: **ACTIVE & PROTECTING YOUR APIs**

Rate limiting has been successfully implemented across all expensive API routes to prevent abuse and protect against unexpected costs.

---

## 📊 Current Limits

### Strict Limits (Expensive AI Operations)
**Applied to:**
- `/api/session/transcribe` (Whisper API - ~$0.006 per request)
- `/api/session/analyze` (GPT-4 - ~$0.015 per request)

**Limit**: **10 requests per minute per IP**

**Why**: These routes call OpenAI APIs which cost money. Prevents API abuse and cost overruns.

---

### Moderate Limits (File Uploads)
**Applied to:**
- `/api/session/upload` (Supabase Storage)

**Limit**: **20 requests per minute per IP**

**Why**: More generous since uploads are cheaper, but still prevents abuse.

---

### Generous Limits (Cheap Operations)
**Applied to:**
- `/api/scenario/generate` (Local operation, no API calls)

**Limit**: **60 requests per minute per IP**

**Why**: Very generous since this is a cheap operation that doesn't cost money.

---

## 🎯 How It Works

### 1. Per-IP Tracking
```typescript
// Identifies each user by their IP address
const identifier = getIdentifier(request)
// Returns: "192.168.1.1" or "10.0.0.5"
```

### 2. In-Memory Cache (LRU)
```typescript
// Uses LRU cache to track request counts
// Automatically expires after the time window
const cache = new LRUCache({
  max: 500, // Track up to 500 unique IPs
  ttl: 60000, // 1 minute window
})
```

### 3. Smart Headers
```typescript
// Returns proper HTTP 429 status
// Includes Retry-After header
headers: {
  'Retry-After': '45', // Seconds until reset
}
```

---

## 💡 User Experience

### What Users See

**Before Rate Limit:**
```json
{
  "success": true,
  "transcript": "..."
}
```

**After Rate Limit (11th request in 1 minute):**
```json
{
  "error": "Too many requests. Please try again in 23 seconds.",
  "retryAfter": 1730102445000
}
```

**Status Code**: `429 Too Many Requests`

---

## 🧪 Testing Rate Limits

### Test Locally:
```bash
# Start your dev server
npm run dev

# Make 11 requests quickly (using a tool like curl or Postman)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/session/transcribe \
    -H "Content-Type: application/json" \
    -d '{"audioUrl": "https://example.com/test.mp3"}' &
done

# The 11th request should return 429
```

### Test with Postman:
1. Create a POST request to `/api/session/transcribe`
2. Send it 10 times quickly
3. 11th request should fail with 429

---

## 📈 Monitoring

### View Current Usage (Development):
```typescript
import { strictRateLimit } from '@/lib/rateLimit'

// Check how many requests an IP has made
const usage = strictRateLimit.getUsage('192.168.1.1')
console.log(`Current usage: ${usage}/10`)
```

### Reset a User (if needed):
```typescript
import { strictRateLimit } from '@/lib/rateLimit'

// Manually reset rate limit for an IP
strictRateLimit.reset('192.168.1.1')
```

---

## 🛠️ Configuration

### To Change Limits:

**Edit**: `src/lib/rateLimit.ts`

```typescript
// Make transcription stricter (5 requests/min)
export const strictRateLimit = rateLimit({
  limit: 5, // Changed from 10
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

// Make uploads more generous (30 requests/min)
export const moderateRateLimit = rateLimit({
  limit: 30, // Changed from 20
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})
```

### To Add Rate Limiting to New Routes:

```typescript
import { strictRateLimit, getIdentifier, formatResetTime } from '@/lib/rateLimit'

export async function POST(request: Request) {
  // Add rate limiting at the start
  const identifier = getIdentifier(request)
  const rateLimitResult = await strictRateLimit.check(identifier)
  
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { 
        error: `Too many requests. Please try again in ${formatResetTime(rateLimitResult.reset)}.`,
        retryAfter: rateLimitResult.reset,
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
        },
      }
    )
  }
  
  // Your route logic here...
}
```

---

## 🎯 Cost Protection Examples

### Without Rate Limiting:
- Malicious user makes 1000 transcription requests
- Cost: 1000 × $0.006 = **$6.00**
- Plus 1000 analysis requests
- Cost: 1000 × $0.015 = **$15.00**
- **Total damage: $21.00 in 1 minute**

### With Rate Limiting:
- User makes 10 transcription requests (limit reached)
- Cost: 10 × $0.006 = **$0.06**
- Plus 10 analysis requests
- Cost: 10 × $0.015 = **$0.15**
- **Total cost: $0.21 in 1 minute** ✅

**Savings: $20.79 per attacker per minute**

---

## 🔥 Handling High Traffic

### Current Limits Support:

**Scenario**: 100 concurrent users

- Each user can make **10 AI requests/minute**
- Total capacity: **1000 AI requests/minute**
- Estimated cost: **$21/minute** ($30,240/month max)

**With rate limiting**, even if attacked:
- Max cost per minute: **$21** (if all 100 users hit limit)
- Max cost per hour: **$1,260**
- Max cost per day: **$30,240**

**OpenAI spending limit** ($50/month) will protect you further.

---

## 🚨 What If Limits Are Too Strict?

### Signs Users Are Hitting Limits:
- Complaints about "too many requests" errors
- Legitimate users getting blocked
- During testing, hitting limits frequently

### Solution:
1. **Increase limits** in `rateLimit.ts`
2. **Add user authentication** to rate limit per user ID instead of IP
3. **Implement tiered limits** (free users: 10/min, paid users: 100/min)

---

## 🎓 Advanced: Per-User Rate Limiting

### Future Enhancement (Optional):

```typescript
// src/lib/rateLimit.ts - Add user-based limiting
export async function getIdentifierFromAuth(
  request: Request
): Promise<string> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // If authenticated, use user ID (more fair)
    if (user) {
      return `user_${user.id}`
    }
    
    // Otherwise fall back to IP
    return getIdentifier(request)
  } catch {
    return getIdentifier(request)
  }
}

// Usage:
const identifier = await getIdentifierFromAuth(request)
```

**Benefit**: Users behind same IP (office, school) won't affect each other.

---

## 📊 Metrics to Track (Post-Launch)

1. **Rate limit hits**: How often are users hitting limits?
2. **Which routes**: Which APIs are being hit most?
3. **Time of day**: When do limits get hit?
4. **User behavior**: Are limits too strict or too loose?

### Logging (Add to production):
```typescript
if (!rateLimitResult.success) {
  console.warn('[RATE_LIMIT]', {
    route: '/api/session/transcribe',
    ip: identifier,
    timestamp: new Date().toISOString(),
  })
  // Send to monitoring service (Sentry, Datadog, etc.)
}
```

---

## ✅ Success Checklist

- ✅ Rate limiting installed (`lru-cache` package)
- ✅ Applied to all expensive routes
- ✅ Proper 429 status codes
- ✅ User-friendly error messages
- ✅ Retry-After headers
- ✅ No linter errors
- ✅ Ready for production

---

## 🎉 You're Protected!

**Your API is now secure against:**
- ✅ Cost overruns from abuse
- ✅ Malicious users making thousands of requests
- ✅ Accidental infinite loops in client code
- ✅ Bots scraping your service

**Estimated savings:**
- **$20+ per attacker per minute**
- **Potential savings: Unlimited** (prevents worst-case scenarios)

---

## 📚 Related Files

- `src/lib/rateLimit.ts` - Core rate limiting logic
- `src/app/api/session/transcribe/route.ts` - Example implementation
- `src/app/api/session/analyze/route.ts` - Example implementation
- `src/app/api/session/upload/route.ts` - Example implementation
- `src/app/api/scenario/generate/route.ts` - Example implementation

---

## 🆘 Troubleshooting

### Issue: "Too many requests" in development
**Solution**: Limits apply in dev too. Either:
1. Increase limits temporarily
2. Use `strictRateLimit.reset(yourIP)` between tests
3. Wait 1 minute

### Issue: Postman/curl not triggering rate limit
**Solution**: Make sure requests come from same IP. Postman should work automatically.

### Issue: All users getting rate limited together
**Solution**: They're likely behind the same IP (e.g., office network). Consider per-user rate limiting (see Advanced section).

---

**Rate limiting is now active and protecting your APIs!** 🎉🔒

