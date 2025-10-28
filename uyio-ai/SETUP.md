# Uyio AI Setup Guide

## 1. Environment Variables Setup

Create a `.env.local` file in the root directory with the following content:

```bash
# ==============================================================================
# SUPABASE CONFIGURATION
# ==============================================================================
# Get these from your Supabase project dashboard:
# 1. Go to https://supabase.com/dashboard
# 2. Select your project (or create a new one)
# 3. Go to Settings > API
# 4. Copy the Project URL and anon/public key

NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# ==============================================================================
# OPENAI API CONFIGURATION
# ==============================================================================
# Get your OpenAI API key:
# 1. Go to https://platform.openai.com/api-keys
# 2. Sign in or create an account
# 3. Click "Create new secret key"
# 4. Copy the key immediately (you won't be able to see it again)
#
# This key is used for:
# - GPT-4 for AI conversation and feedback generation
# - Whisper API for speech-to-text transcription

OPENAI_API_KEY=your_openai_api_key_here
```

## 2. Supabase Database Setup

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project name: `uyio-ai`
6. Create a strong database password (save it!)
7. Choose a region close to you
8. Click "Create new project"

### Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Open the file `src/lib/supabase/schema.sql` from this project
3. Copy all the SQL code
4. Paste it into the SQL Editor
5. Click **"Run"** or press `Cmd/Ctrl + Enter`
6. Wait for it to complete (should take 2-3 seconds)

You should see a success message. This creates:
- ✅ 7 tables (profiles, scenarios, sessions, courses, etc.)
- ✅ All indexes for performance
- ✅ Row Level Security policies
- ✅ Helper functions
- ✅ Seed data (starter course + 20 practice scenarios)

### Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings > API**
2. Find **Project URL** - copy this
3. Find **anon public** key - copy this
4. Paste both into your `.env.local` file

## 3. OpenAI API Setup

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Give it a name like "Uyio AI Development"
5. Copy the key immediately (you won't see it again!)
6. Paste it into your `.env.local` file

**Note:** You'll need to add billing information to your OpenAI account to use the API.

## 4. Install Dependencies

```bash
npm install
```

## 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 6. Verify Setup

### Check Supabase Connection

1. Go to your app
2. Try to sign up for an account
3. Check Supabase dashboard > Authentication > Users
4. You should see your user appear

### Check Database

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - profiles
   - scenarios
   - sessions
   - courses
   - course_lessons
   - lesson_progress
   - daily_scenarios

### Check Seed Data

1. Click on the **scenarios** table
2. You should see 20 pre-populated scenarios
3. Click on the **courses** table
4. You should see "7 Days to Confidence & Clarity" course

## Troubleshooting

### "Could not connect to Supabase"
- Check that your NEXT_PUBLIC_SUPABASE_URL is correct
- Check that your NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
- Make sure there are no extra spaces in your .env.local file

### "OpenAI API error"
- Verify your OPENAI_API_KEY is correct
- Check that you have billing enabled on your OpenAI account
- Make sure you have available credits

### "Database error"
- Ensure you ran the full schema.sql file
- Check the SQL Editor for any error messages
- Try running the schema again (it's designed to be idempotent)

## Next Steps

- Read the main README.md for project overview
- Check out the database schema in `src/lib/supabase/schema.sql`
- Explore the Supabase client utilities in `src/lib/supabase/`
- Start building features!

## Security Reminders

- ⚠️ Never commit `.env.local` to Git
- ⚠️ Never share API keys publicly
- ⚠️ Use different keys for development and production
- ⚠️ Rotate keys if compromised


