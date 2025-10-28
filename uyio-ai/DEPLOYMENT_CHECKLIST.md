# 🚀 Deployment Checklist for Uyio AI

Use this checklist before deploying to production.

---

## 📋 Pre-Deployment

### Environment Setup
- [ ] **Supabase production project** created
- [ ] **All environment variables** set in Vercel
- [ ] **OpenAI API key** with billing enabled
- [ ] **`.env.local`** NOT committed to git (check `.gitignore`)

### Database
- [ ] **Run schema.sql** in Supabase SQL Editor
- [ ] **Run storage-schema.sql** for file uploads
- [ ] **RLS policies enabled** on all tables
- [ ] **Storage bucket** `recordings` created
- [ ] **Database backups** configured (Supabase auto-backup enabled)
- [ ] **Test database connection** from local

### Code Quality
- [ ] **No console.errors** in production code
- [ ] **All TypeScript errors** resolved (`npm run build`)
- [ ] **ESLint** passing (`npm run lint`)
- [ ] **No hardcoded secrets** in code
- [ ] **All TODO comments** reviewed

---

## 🧪 Testing

### Core User Flows
- [ ] **Sign up flow** works (magic link email received)
- [ ] **Login flow** works (existing user)
- [ ] **Guest mode** works (3 free sessions, then prompt)
- [ ] **Practice session** works end-to-end:
  - [ ] Record audio (60s, 90s, 120s)
  - [ ] Upload to Supabase Storage
  - [ ] Transcribe with Whisper API
  - [ ] Analyze with GPT-4
  - [ ] Display feedback
  - [ ] Save to database
- [ ] **Progress page** displays charts and stats
- [ ] **Feedback page** shows all scores and coaching tips
- [ ] **Dashboard** shows recent sessions and daily challenge

### Mobile Testing
- [ ] **iOS Safari** - recording works
- [ ] **Android Chrome** - recording works
- [ ] **Responsive design** on mobile (320px-768px)
- [ ] **Touch interactions** work smoothly
- [ ] **Bottom navigation** visible and functional

### Browser Compatibility
- [ ] **Chrome/Edge** (latest)
- [ ] **Safari** (latest)
- [ ] **Firefox** (latest)
- [ ] **Mobile browsers** (iOS Safari, Chrome Mobile)

### Error Handling
- [ ] **Invalid audio** handled gracefully
- [ ] **Network errors** show retry option
- [ ] **Rate limit errors** show appropriate message
- [ ] **404 page** displays correctly
- [ ] **Error boundary** catches React errors

---

## 🔒 Security

### Authentication
- [ ] **RLS policies** protect user data
- [ ] **Guest sessions** expire after 24 hours
- [ ] **Audio files** only accessible by owner
- [ ] **Profile data** only visible to user

### API Routes
- [ ] **Rate limiting** implemented (10-30 req/min)
- [ ] **Input validation** on all endpoints
- [ ] **OpenAI API key** in server-side only
- [ ] **CORS** configured properly

### Data Privacy
- [ ] **No PII** logged to console
- [ ] **Audio files** stored securely
- [ ] **Transcripts** only visible to user
- [ ] **GDPR compliance** considered (if EU users)

---

## ⚡ Performance

### Page Load
- [ ] **Lighthouse score** > 90 (Performance)
- [ ] **First Contentful Paint** < 1.5s
- [ ] **Time to Interactive** < 3.5s
- [ ] **Bundle size** reasonable (< 300KB initial)

### Optimization
- [ ] **Images** optimized with next/image
- [ ] **Fonts** preloaded
- [ ] **Loading skeletons** prevent layout shift
- [ ] **Lazy loading** for heavy components
- [ ] **Caching** configured for static assets

### API Performance
- [ ] **Transcription** completes < 10s for 90s audio
- [ ] **Analysis** completes < 5s
- [ ] **Database queries** optimized with indexes
- [ ] **Audio upload** uses streaming

---

## 📊 Monitoring

### Error Tracking
- [ ] **Sentry** or similar configured (optional)
- [ ] **Error logs** accessible in Vercel
- [ ] **Database errors** logged
- [ ] **API errors** logged with context

### Analytics (Optional)
- [ ] **Vercel Analytics** enabled
- [ ] **Page views** tracked
- [ ] **Session completion** tracked
- [ ] **Conversion funnel** set up

### Cost Monitoring
- [ ] **OpenAI usage** dashboard checked
- [ ] **Supabase storage** usage monitored
- [ ] **Vercel bandwidth** within limits
- [ ] **Alert thresholds** set for costs

---

## 🚢 Deployment Steps

### 1. GitHub
```bash
# Commit all changes
git add .
git commit -m "Production-ready: All features complete"
git push origin main
```

### 2. Vercel Setup
- [ ] **Import project** from GitHub
- [ ] **Set framework preset** to Next.js
- [ ] **Configure build settings**:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 3. Environment Variables in Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-prod-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
OPENAI_API_KEY=sk-your-prod-openai-key
```

- [ ] **Production** environment
- [ ] **Preview** environment (optional)
- [ ] **Development** environment (optional)

### 4. Deploy
- [ ] **Deploy to preview** first
- [ ] **Test preview deployment** thoroughly
- [ ] **Promote to production**
- [ ] **Check production site** loads correctly

### 5. DNS (if using custom domain)
- [ ] **Add custom domain** in Vercel
- [ ] **Configure DNS** records (A/CNAME)
- [ ] **SSL certificate** auto-generated
- [ ] **HTTPS** enforced

---

## ✅ Post-Deployment

### Immediate Checks (within 1 hour)
- [ ] **Homepage** loads correctly
- [ ] **Sign up** works
- [ ] **Practice flow** works end-to-end
- [ ] **Database** receiving data
- [ ] **Storage** accepting uploads
- [ ] **No console errors** in production

### Within 24 Hours
- [ ] **Monitor error logs** (Vercel logs)
- [ ] **Check OpenAI usage** (costs)
- [ ] **Check Supabase usage** (requests, storage)
- [ ] **Verify email delivery** (magic links)
- [ ] **Test from multiple devices**

### Within 1 Week
- [ ] **User feedback** collected
- [ ] **Performance metrics** reviewed
- [ ] **Conversion rates** analyzed
- [ ] **Bug reports** addressed
- [ ] **Usage patterns** identified

---

## 🐛 Common Issues & Fixes

### "Cannot read properties of undefined"
- **Cause**: Missing environment variables
- **Fix**: Check all env vars in Vercel dashboard

### Audio upload fails
- **Cause**: CORS or storage bucket permissions
- **Fix**: Check Supabase storage RLS policies

### Transcription timeout
- **Cause**: Large audio files or API latency
- **Fix**: Increase timeout in `vercel.json`

### High OpenAI costs
- **Cause**: Too many requests or long audio
- **Fix**: Add rate limiting, optimize prompts

### Slow page loads
- **Cause**: Large bundle size
- **Fix**: Use dynamic imports, optimize images

---

## 📱 Mobile App Considerations (Future)

If converting to PWA:
- [ ] **manifest.json** created
- [ ] **Service worker** for offline
- [ ] **App icons** (192px, 512px)
- [ ] **Splash screen** designed
- [ ] **Add to home screen** tested

---

## 📝 Legal & Compliance

- [ ] **Privacy Policy** page created (if collecting data)
- [ ] **Terms of Service** page created
- [ ] **Cookie consent** (if using analytics)
- [ ] **Data retention policy** defined
- [ ] **GDPR compliance** (if EU users)

---

## 🎯 Success Metrics

Define what success looks like:

- **Week 1**:
  - [ ] 50+ sign-ups
  - [ ] 80%+ session completion rate
  - [ ] < 5 critical bugs
  - [ ] Average load time < 3s

- **Month 1**:
  - [ ] 500+ users
  - [ ] 90%+ uptime
  - [ ] OpenAI costs < $100
  - [ ] Positive user feedback

---

## 🔄 Rollback Plan

If something goes wrong:

1. **Revert deployment** in Vercel (instant)
2. **Check error logs** to identify issue
3. **Fix in local environment**
4. **Test thoroughly**
5. **Redeploy**

---

## 📞 Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **OpenAI Support**: https://help.openai.com

---

## ✨ You're Ready!

Once all items are checked, you're good to deploy! 🚀

**Remember**: Ship fast, iterate often, and listen to users.

Good luck with your launch! 🎉

