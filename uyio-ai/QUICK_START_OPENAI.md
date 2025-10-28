# 🚀 Quick Start: OpenAI Integration

Get AI transcription and feedback working in 5 minutes!

## Step 1: Get OpenAI API Key (2 minutes)

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Click **"Create new secret key"**
4. **Copy the key** (starts with `sk-...`) - you'll need it next!
   - ⚠️ You can only see it once!

## Step 2: Add to Environment Variables (1 minute)

Open your `.env.local` file (create if it doesn't exist):

```bash
cd uyio-ai
touch .env.local  # if it doesn't exist
```

Add this line with your actual key:

```env
OPENAI_API_KEY=sk-your-actual-key-paste-here
```

**Complete .env.local should look like:**

```env
# Supabase (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI (add this)
OPENAI_API_KEY=sk-your-actual-key-here
```

## Step 3: Restart Your Server (10 seconds)

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
```

## Step 4: Test It! (2 minutes)

1. Open [http://localhost:3000/practice](http://localhost:3000/practice)
2. Click the **blue mic button**
3. Speak for 10-15 seconds
4. Click the **red stop button**
5. Watch the magic happen:
   - ✅ Uploading...
   - ✅ Transcribing... (Whisper API)
   - ✅ Analyzing... (GPT-4)
   - ✅ **See your transcript and scores!**

## ✅ Expected Results

You should see:

1. **Your transcript** displayed in a gray box
2. **Overall feedback** with encouraging message
3. **Five scores** (0-10):
   - Clarity
   - Confidence
   - Logic
   - Pacing
   - Fillers

## 🐛 Troubleshooting

### "Missing OPENAI_API_KEY"

- ✅ Check `.env.local` has the correct key
- ✅ Restart dev server: `Ctrl+C` then `npm run dev`
- ✅ Verify key starts with `sk-`

### "Rate limit reached"

- Wait 60 seconds
- Check you have billing enabled: [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)

### "Network error" or timeout

- Check your internet connection
- Whisper API can take 5-15 seconds
- Try again with a shorter recording

## 💰 Cost

**Per practice session:** ~$0.02-0.05

- Transcription (Whisper): $0.006 per minute
- Analysis (GPT-4): ~$0.03 per analysis

**Recommended**: Set a billing limit in OpenAI dashboard

## 🎉 You're All Set!

Now every practice session will:
1. Upload your audio
2. Transcribe it with Whisper
3. Analyze it with GPT-4
4. Give you personalized coaching feedback

## 📚 Next Steps

- Read [OPENAI_SETUP.md](./OPENAI_SETUP.md) for advanced config
- Check [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) before launch
- Try different scenarios to test various feedback types

---

**Need help?** See [OPENAI_SETUP.md](./OPENAI_SETUP.md) for detailed troubleshooting.


