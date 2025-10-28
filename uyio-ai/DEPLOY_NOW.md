# 🚀 Deploy Uyio AI with Custom Domain - Complete Guide

## ✅ Pre-Deployment Checklist

- [x] Code complete and tested
- [x] Pushed to GitHub
- [ ] Custom domain purchased
- [ ] Hosting platform chosen (Vercel/Netlify/Railway)
- [ ] Supabase project created
- [ ] OpenAI API key ready
- [ ] Environment variables ready

---

## Step 1: Prepare Supabase (10 minutes)

### 1.1 Create Supabase Project
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub
4. Click "New Project"
5. Choose organization (or create one)
6. **Project Name**: `uyio-ai` (or your choice)
7. **Database Password**: Generate strong password (SAVE THIS!)
8. **Region**: Choose closest to your users
9. Click "Create new project"
10. **Wait 2-3 minutes** for project to be ready

### 1.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open your local `src/lib/supabase/schema.sql` file
4. Copy ALL contents (the entire file)
5. Paste into Supabase SQL Editor
6. Click **RUN** button
7. Should see: "Success. No rows returned"
8. Verify: Go to **Table Editor** → Should see all tables (profiles, sessions, scenarios, etc.)

### 1.3 Set Up Storage Bucket
1. Go to **Storage** in Supabase sidebar
2. Click "Create a new bucket"
3. **Name**: `recordings`
4. **Public bucket**: NO (keep private)
5. Click "Create bucket"
6. Click on `recordings` bucket
7. Go to **Policies** tab
8. Click "New Policy"
9. Use template: "Enable insert for authenticated users only"
10. Click "Review" → "Save policy"
11. Create another policy for SELECT (read)
12. Create another policy for DELETE

**OR use the SQL from schema.sql** (easier):
```sql
-- Already in your schema.sql file, but if needed:
CREATE POLICY "Users can upload their own recordings"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own recordings"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 1.4 Configure Auth
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider (should be on by default)
3. Go to **URL Configuration**
4. Add **Site URL**: `https://your-app.vercel.app` (update after deployment)
5. Add **Redirect URLs**:
   - `https://your-app.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local testing)

### 1.5 Get Your API Keys
1. Go to **Project Settings** (gear icon)
2. Click **API**
3. Copy these values (you'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)
   - **service_role key**: `eyJhbGc...` (KEEP SECRET!)

---

## Step 2: Get OpenAI API Key (5 minutes)

### 2.1 Create OpenAI Account
1. Go to https://platform.openai.com
2. Sign up or log in
3. Go to **API Keys**: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Name: `uyio-ai-production`
6. Copy the key: `sk-proj-...` (you won't see it again!)

### 2.2 Add Payment Method
1. Go to **Billing**: https://platform.openai.com/settings/organization/billing
2. Click "Add payment method"
3. Add credit card
4. **Set spending limit** (recommended: $50/month for safety)
5. You'll need ~$5-10 credit to start

---

## Step 3: Choose Your Hosting Platform (5 minutes)

### Option A: Vercel (Recommended - Easiest)
**Pros**: Automatic deployments, great Next.js support, free custom domain  
**Cons**: None really  
**Cost**: Free forever for hobby projects

### Option B: Netlify
**Pros**: Simple, good analytics, free tier  
**Cons**: Slightly more config for Next.js  
**Cost**: Free for basic usage

### Option C: Railway
**Pros**: Simple, GitHub integration, generous free tier  
**Cons**: Newer platform  
**Cost**: $5/month after trial

### Option D: Self-Hosted (VPS/Cloud)
**Pros**: Full control, can run anywhere  
**Cons**: More complex setup  
**Cost**: $5-20/month (DigitalOcean, Linode, AWS)

---

## Step 4: Deploy Your App

### 🔷 Option A: Deploy on Vercel

#### 4.1 Connect GitHub
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Click "Import Git Repository"
5. Find your `Uyio-AI` repo
6. Click "Import"

#### 4.2 Configure Project
1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./uyio-ai`
3. Click "Deploy" (DON'T ADD ENV VARS YET - will fail, that's ok!)

#### 4.3 Add Environment Variables
1. Go to Project → Settings → Environment Variables
2. Add these:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
```

#### 4.4 Redeploy
1. Deployments → Latest → ... → Redeploy
2. Wait 2 minutes → ✅ Ready

---

### 🔷 Option B: Deploy on Netlify

#### 4.1 Connect GitHub
1. Go to https://netlify.com
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub → Select your repo

#### 4.2 Configure Build
1. **Build command**: `cd uyio-ai && npm run build`
2. **Publish directory**: `uyio-ai/.next`
3. Click "Show advanced" → Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
OPENAI_API_KEY=sk-proj-...
```

4. Click "Deploy site"

#### 4.3 Enable Next.js Features
1. Site settings → Build & deploy → Post processing
2. Enable "Next.js Runtime"
3. Redeploy

---

### 🔷 Option C: Deploy on Railway

#### 4.1 Create Project
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project"
4. Choose "Deploy from GitHub repo"
5. Select your repo

#### 4.2 Configure
1. Railway auto-detects Next.js
2. Add environment variables:
   - Go to Variables tab
   - Add all env vars listed above

3. Railway will auto-deploy

---

## Step 5: Set Up Your Custom Domain (10 minutes)

### 5.1 Purchase Domain (if you haven't)
Popular registrars:
- **Namecheap** (recommended, cheap)
- **Google Domains**
- **GoDaddy**
- **Cloudflare** (cheapest, at-cost pricing)

Example: `uyio.ai`, `speakbetter.com`, `yourname.com`

### 5.2 Connect Domain to Vercel

#### In Vercel:
1. Go to Project → Settings → Domains
2. Click "Add"
3. Enter your domain: `yourdomain.com`
4. Click "Add"

#### You'll see DNS instructions:
```
A Record: @ → 76.76.21.21
CNAME: www → cname.vercel-dns.com
```

#### In Your Domain Registrar:
1. Log into your domain provider
2. Find "DNS Settings" or "Manage DNS"
3. Add these records:

**For root domain (yourdomain.com):**
- Type: `A`
- Name: `@` (or leave blank)
- Value: `76.76.21.21`
- TTL: `3600` (or auto)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`
- TTL: `3600`

4. Save changes
5. Wait 5-30 minutes for DNS to propagate
6. Back in Vercel, click "Verify" → Should show ✅

### 5.3 Connect Domain to Netlify

#### In Netlify:
1. Site settings → Domain management
2. Click "Add custom domain"
3. Enter: `yourdomain.com`

#### You'll see DNS instructions:
```
A Record: @ → 75.2.60.5
CNAME: www → your-site.netlify.app
```

Follow same steps as Vercel above, but use Netlify's IPs.

### 5.4 Connect Domain to Railway

#### In Railway:
1. Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `yourdomain.com`

#### Add DNS Records:
```
CNAME: @ → your-project.up.railway.app
CNAME: www → your-project.up.railway.app
```

---

## Step 6: Update Supabase URLs (2 minutes)

### 6.1 Use Your Custom Domain
1. In Supabase dashboard
2. Go to **Authentication** → **URL Configuration**
3. Update **Site URL**: `https://yourdomain.com`
4. Update **Redirect URLs**:
   - `https://yourdomain.com/auth/callback`
   - `https://www.yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for testing)
5. Click "Save"

### 6.2 Enable SSL (Automatic)
- Vercel/Netlify/Railway auto-provision SSL certificates
- Your site will be on HTTPS within 5-10 minutes
- Look for 🔒 padlock in browser

---

## Step 7: Test Your Live App! (3 minutes)

### 7.1 Visit Your Site
1. Go to your custom domain: `https://yourdomain.com`
2. Should see the guest hero page
3. Click "Start Free Practice"

### 7.2 Test Guest Flow
1. Try recording a practice session
2. Should get AI feedback
3. Verify scores display correctly

### 7.3 Test Sign Up
1. Click "Sign In" → "Sign Up"
2. Enter email
3. Check email for magic link
4. Click link → should redirect to dashboard
5. Verify dashboard loads with your name

### 7.4 Test Authenticated Flow
1. Click "Start Practice"
2. Record a session
3. Get feedback
4. Check if session appears in dashboard
5. Check progress page

---

## 🎉 You're Live!

### Share Your App:
- Your domain: `https://yourdomain.com`
- Share with friends/colleagues for testing
- Get feedback!
- Post on social media! 🚀

---

## 🐛 Troubleshooting

### Build Fails
- Check your hosting platform's build logs
- Ensure all imports are correct
- Verify package.json has all dependencies
- Check that environment variables are set

### Authentication Not Working
- Verify Supabase redirect URLs match your domain EXACTLY
- Check browser console for errors
- Ensure Site URL is set in Supabase
- Try: `https://yourdomain.com/auth/callback` (with https)

### Audio Upload Fails
- Check Supabase Storage bucket exists
- Verify RLS policies are set
- Check browser console for errors
- Test with smaller audio file first

### AI Feedback Not Working
- Verify OpenAI API key is correct
- Check you have credits ($5+ balance)
- Look at your hosting platform's function/serverless logs
- Check API key has correct permissions

### Database Errors
- Verify schema.sql ran successfully
- Check all tables exist in Supabase
- Verify RLS policies are enabled

---

## 📊 Monitor Your App

### Your Hosting Dashboard
- **Vercel**: Deployments → Function logs
- **Netlify**: Site overview → Function logs
- **Railway**: Deployments → View logs
- Monitor bandwidth and build times

### Supabase Dashboard
- Check database queries (SQL Editor)
- Monitor auth users (Authentication)
- View storage usage (Storage)
- Check API usage (Settings → Usage)

### OpenAI Dashboard
- Track API usage (https://platform.openai.com/usage)
- Monitor costs (Billing)
- Check rate limits
- Set spending alerts

---

## 💰 Cost Tracking

### Free Tier Limits:
- **Vercel**: Free for hobby projects (unlimited bandwidth)
- **Netlify**: Free for personal projects (100GB bandwidth/month)
- **Railway**: $5 credit/month free (then $5/month)
- **Supabase**: 
  - 500MB database
  - 1GB file storage
  - 2GB bandwidth
  - 50,000 monthly active users
- **OpenAI**: Pay-per-use (~$0.02 per session)

### Expected Costs (100 users):
- Vercel: $0
- Supabase: $0 (unless you exceed free tier)
- OpenAI: $20-30/month

---

## 🎯 Post-Launch Tasks

- [ ] Set up custom domain
- [ ] Enable analytics (Vercel Analytics)
- [ ] Add error monitoring (Sentry)
- [ ] Create feedback form
- [ ] Share on social media
- [ ] Get first 10 users!

---

## 🆘 Need Help?

### Check Logs:
- **Your hosting platform**: Go to Deployments/Logs section
- **Supabase**: SQL Editor → Run queries to debug
- **Browser**: Open DevTools (F12) → Console tab
- **Network tab**: See failed API requests

### Common Issues:
1. **"API key not found"** → Add env vars in hosting platform
2. **"Authentication failed"** → Check Supabase redirect URLs match domain
3. **"Upload failed"** → Verify Storage bucket + RLS policies
4. **"No feedback"** → Check OpenAI balance and API key
5. **DNS not working** → Wait 30 mins, clear DNS cache, check records

---

## ✅ You Did It!

**Congratulations!** You've deployed a full-stack AI app with:
- ✅ Next.js 14
- ✅ Supabase (database + auth + storage)
- ✅ OpenAI (Whisper + GPT-4)
- ✅ Vercel hosting
- ✅ Production-ready code

**Now go get users!** 🚀

