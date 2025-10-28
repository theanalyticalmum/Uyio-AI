# 🎤 Uyio AI - Your AI Communication Coach

Practice speaking with confidence. Get instant AI-powered feedback. No sign-up required to try.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

- 🎯 **AI-Powered Coaching** - Get detailed feedback on clarity, confidence, logic, pacing, and fillers
- 🎙️ **Voice Recording** - Practice with real-time audio recording (up to 3 minutes)
- 📊 **Progress Tracking** - Visualize your improvement with charts and statistics
- 🏆 **Daily Challenges** - Stay consistent with personalized daily scenarios
- 👤 **Guest Mode** - Try 3 sessions for free without signing up
- 🌙 **Dark Mode** - Fully responsive with dark mode support
- 📱 **Mobile Optimized** - Works great on all devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenAI API key with billing enabled

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Uyio-AI.git
cd Uyio-AI/uyio-ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file (see `env.example.txt` for template):

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-your-openai-key
```

**Where to get these:**
- **Supabase**: https://app.supabase.com → Settings → API
- **OpenAI**: https://platform.openai.com/api-keys

### 4. Set Up Database

Run the SQL migrations in Supabase SQL Editor:

```bash
1. src/lib/supabase/schema.sql          # Main database schema
2. src/lib/supabase/storage-schema.sql  # Storage buckets
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
uyio-ai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home/Dashboard
│   │   ├── practice/          # Practice session page
│   │   ├── progress/          # Progress tracking
│   │   ├── auth/              # Authentication pages
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── feedback/          # Feedback display components
│   │   ├── progress/          # Progress charts & stats
│   │   ├── practice/          # Voice recorder, scenarios
│   │   └── layout/            # Navigation, header, footer
│   ├── lib/                   # Utility functions
│   │   ├── db/               # Database helpers
│   │   ├── openai/           # OpenAI integration
│   │   ├── scenarios/        # Scenario generation
│   │   └── supabase/         # Supabase client
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Helper utilities
├── public/                   # Static assets
└── docs/                    # Documentation
```

---

## 🗄️ Database Schema

### Core Tables:
- **`profiles`** - User profiles, goals, streaks
- **`sessions`** - Practice sessions with scores
- **`scenarios`** - Practice scenarios (system + user-created)
- **`daily_scenarios`** - Daily challenge tracking
- **`courses`** - Structured learning paths
- **`lesson_progress`** - Course completion tracking

See `src/lib/supabase/schema.sql` for complete schema.

---

## 🔧 Configuration

### Supabase Setup

1. Create a new project at https://app.supabase.com
2. Run migrations: `schema.sql` → `storage-schema.sql`
3. Enable RLS (Row Level Security) policies
4. Create storage bucket: `recordings`

### OpenAI Setup

1. Get API key: https://platform.openai.com/api-keys
2. Add billing information (required)
3. Models used:
   - **Whisper-1**: Speech-to-text ($0.006/min)
   - **GPT-4o**: Feedback analysis (~$0.01/session)

**Monthly cost estimate**: ~$30-50 for 1000 sessions

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel: https://vercel.com/new
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
```

### Custom Domain (Optional)

In Vercel dashboard: Settings → Domains

---

## 📊 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Links)
- **Storage**: Supabase Storage
- **AI**: OpenAI (Whisper + GPT-4)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Toasts**: Sonner

---

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Structure Guidelines

- **Components**: Reusable UI components in `/components`
- **Pages**: Next.js pages in `/app`
- **Database**: All database logic in `/lib/db`
- **Types**: Centralized in `/types`
- **Keep it simple**: Follow anti-overengineering principles

---

## 📖 Documentation

- [Database Helpers](./DATABASE_HELPERS.md) - Complete database API reference
- [Setup Guides](./docs/) - Feature-specific setup instructions

---

## 🛣️ Roadmap

### v1.0 (Current)
- ✅ Core practice flow
- ✅ AI feedback
- ✅ Progress tracking
- ✅ Guest mode

### v1.1 (Planned)
- 📚 Structured courses
- 🎯 Advanced analytics
- 👥 Team/coach features
- 🌍 Multi-language support

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) for details

---

## 💬 Support

- **Issues**: GitHub Issues
- **Email**: support@uyio.ai
- **Docs**: This README + `/docs` folder

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- OpenAI for powerful AI models
- All contributors and users!

---

**Built with ❤️ by the Uyio AI team**
