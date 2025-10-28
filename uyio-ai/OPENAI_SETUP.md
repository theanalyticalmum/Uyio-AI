# OpenAI Integration Setup Guide

Complete guide for setting up AI transcription (Whisper) and feedback analysis (GPT-4) in Uyio AI.

## 📋 Overview

The OpenAI integration provides two key features:
1. **Speech-to-Text**: Transcribe audio recordings using Whisper API
2. **AI Coaching**: Analyze transcripts and provide structured feedback using GPT-4

## 🔑 Step 1: Get Your OpenAI API Key

### Create OpenAI Account

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-...`)
   - ⚠️ **Save it now** - you won't see it again!

###

 Verify You Have Credits

- Go to **Settings** > **Billing**
- Add a payment method if needed
- Check your usage limits

**Pricing (as of 2024):**
- Whisper: $0.006 per minute
- GPT-4: ~$0.03 per 1K tokens
- **Estimated cost**: ~$0.02-0.05 per practice session

## ⚙️ Step 2: Configure Environment Variables

Add your OpenAI API key to `.env.local`:

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-key-here
```

**Important:**
- Never commit this key to git
- `.env.local` is already in `.gitignore`
- Restart your dev server after adding the key

### Verify Setup

```bash
cd uyio-ai
npm run dev
```

Navigate to `/practice`, complete a recording, and check if transcription starts automatically.

## 🧪 Step 3: Test the Integration

### Test Transcription

1. Go to `http://localhost:3000/practice`
2. Click the mic button
3. Speak clearly for 10-15 seconds
4. Click stop
5. Wait for upload → transcription → analysis

**Expected flow:**
```
Recording → Uploading... → Transcribing... → Analyzing... → Results!
```

### Test Analysis

After transcription completes, you should see:
- ✅ Your transcript displayed
- ✅ Overall feedback summary
- ✅ Five scores (0-10): Clarity, Confidence, Logic, Pacing, Fillers
- ✅ Coaching tips preview

## 📁 File Structure

```
src/
├── lib/
│   └── openai/
│       ├── client.ts          # OpenAI client setup
│       ├── transcribe.ts      # Whisper API integration
│       ├── analyze.ts         # GPT-4 analysis
│       └── prompts.ts         # Analysis prompt templates
├── app/
│   └── api/
│       └── session/
│           ├── transcribe/
│           │   └── route.ts   # Transcription endpoint
│           └── analyze/
│               └── route.ts   # Analysis endpoint
├── types/
│   └── feedback.ts            # TypeScript definitions
└── components/
    └── practice/
        └── TranscriptionStatus.tsx  # UI for processing states
```

## 🎯 How It Works

### 1. Recording Flow

```typescript
User records → Upload to Supabase → Get audio URL
                                          ↓
                                   Start transcription
```

### 2. Transcription (Whisper API)

```typescript
Audio URL → Fetch audio file → Convert to File object → Whisper API
                                                              ↓
                                                         Transcript text
```

**Model:** `whisper-1`  
**Language:** English (optimized)  
**Response:** Text + metadata (duration, word count)

### 3. Analysis (GPT-4)

```typescript
Transcript + Scenario → Build evaluation prompt → GPT-4 API
                                                        ↓
                                                  Structured feedback
```

**Model:** `gpt-4o` (latest)  
**Temperature:** 0.7 (balanced)  
**Response format:** JSON with scores and coaching tips

### 4. Feedback Structure

```json
{
  "scores": {
    "clarity": 8,      // 0-10
    "confidence": 7,
    "logic": 6,
    "pacing": 9,
    "fillers": 5
  },
  "coaching": {
    "clarity": "Specific actionable tip",
    "confidence": "...",
    // ... per category
  },
  "summary": "2-3 sentences of encouraging feedback",
  "detectedMetrics": {
    "wpm": 145,
    "fillerCount": 8,
    "avgPauseLength": 0.8
  },
  "strengths": ["What went well"],
  "improvements": ["What to work on"]
}
```

## 🐛 Troubleshooting

### Error: "Missing OPENAI_API_KEY"

**Solution:**
1. Check `.env.local` has the key
2. Restart dev server: `npm run dev`
3. Verify key starts with `sk-`

### Error: "Rate limit reached"

**Solution:**
- Wait 60 seconds and try again
- Check your OpenAI usage limits
- Upgrade your OpenAI plan if needed

### Error: "Invalid audio format"

**Solution:**
- Use Chrome, Edge, or Safari (best browser support)
- Check microphone permissions are granted
- Try recording again

### Transcription is slow (>30 seconds)

**Possible causes:**
- Large audio file (>2MB)
- Slow network connection
- OpenAI API latency

**Solutions:**
- Keep recordings under 2 minutes
- Check internet connection
- Whisper API typically takes 5-15 seconds

### Error: "Failed to analyze transcript"

**Solution:**
- Check transcript isn't empty
- Verify GPT-4 access on your OpenAI account
- Check API key has sufficient credits

## 💰 Cost Optimization

### Current Usage Estimates

**Per practice session:**
- Audio upload: Free (Supabase)
- Transcription: $0.006-0.018 (1-3 min audio)
- Analysis: $0.015-0.030 (GPT-4 tokens)
- **Total**: ~$0.02-0.05 per session

### Ways to Reduce Costs

1. **Limit recording length** (60-90 seconds)
2. **Cache feedback** (don't re-analyze same recording)
3. **Use GPT-3.5-turbo** for dev/testing (10x cheaper)
4. **Batch analysis** (future: analyze multiple at once)

### Switch to GPT-3.5 (Dev Mode)

In `src/lib/openai/analyze.ts`:

```typescript
// Change this line:
model: 'gpt-4o',
// To this:
model: 'gpt-3.5-turbo',
```

**Trade-off:** Slightly less detailed feedback, but 90% cheaper

## 🔒 Security Best Practices

### API Key Safety

✅ **DO:**
- Keep key in `.env.local` only
- Use different keys for dev/production
- Rotate keys monthly
- Set spending limits in OpenAI dashboard

❌ **DON'T:**
- Commit keys to git
- Share keys in screenshots
- Use same key across projects
- Expose keys in client-side code

### Rate Limiting

All API calls are server-side only (no client exposure).

**Future enhancement:** Add rate limiting per user to prevent abuse.

## 📊 Monitoring & Analytics

### Check Usage

1. Go to [platform.openai.com/usage](https://platform.openai.com/usage)
2. View daily/monthly usage
3. Set up billing alerts

### Track in Your App

Log transcription and analysis success rates:

```typescript
// In API routes
console.log('Transcription:', { success: true, duration: data.duration })
console.log('Analysis:', { success: true, scores: data.scores })
```

## 🚀 Production Checklist

Before launching:

- [ ] API key added to production environment variables
- [ ] Spending limits set in OpenAI dashboard ($50/month recommended)
- [ ] Error handling tested (network failures, rate limits)
- [ ] Billing alerts configured
- [ ] Usage monitoring in place
- [ ] Consider adding user rate limits (e.g., 10 sessions/day)

## 🔗 API Endpoints

### POST `/api/session/transcribe`

**Request:**
```json
{
  "audioUrl": "https://...supabase.co/.../recording.webm"
}
```

**Response:**
```json
{
  "success": true,
  "transcript": "Full transcription text...",
  "wordCount": 145,
  "duration": 62.3
}
```

### POST `/api/session/analyze`

**Request:**
```json
{
  "transcript": "Full text...",
  "scenarioId": "uuid",
  "duration": 60
}
```

**Response:**
```json
{
  "success": true,
  "feedback": { /* FeedbackResult object */ },
  "overallScore": 7.4,
  "wordCount": 145
}
```

## 📚 Next Steps

After basic setup:

1. **Create feedback page** - Dedicated page for detailed results
2. **Save to database** - Store transcripts and scores
3. **Progress tracking** - Show improvement over time
4. **Advanced prompts** - Customize per goal/scenario type
5. **Batch processing** - Queue analysis for offline processing

## 🆘 Support Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Whisper API Reference](https://platform.openai.com/docs/guides/speech-to-text)
- [GPT-4 Guide](https://platform.openai.com/docs/guides/text-generation)
- [OpenAI Community Forum](https://community.openai.com/)

---

**Last Updated:** Oct 28, 2025  
**OpenAI Models Used:** `whisper-1`, `gpt-4o`


