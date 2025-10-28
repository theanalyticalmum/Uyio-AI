-- ==============================================================================
-- UYIO AI DATABASE SCHEMA
-- Communication Coaching Platform
-- ==============================================================================
-- This schema defines the complete database structure for Uyio AI, including:
-- - User profiles and progress tracking
-- - Practice scenarios and sessions
-- - Structured courses and lessons
-- - Daily challenges
-- - Row Level Security policies
--
-- Run this in your Supabase SQL Editor to set up the database
-- ==============================================================================

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PROFILES TABLE
-- Extended user profile linked to Supabase auth.users
-- Stores user preferences, goals, and practice statistics
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  display_name TEXT,
  primary_goal TEXT CHECK (primary_goal IN ('clarity', 'confidence', 'persuasion', 'fillers', 'quick_thinking')),
  practice_length_sec INTEGER DEFAULT 90 NOT NULL,
  onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL,
  total_sessions INTEGER DEFAULT 0 NOT NULL,
  streak_count INTEGER DEFAULT 0 NOT NULL,
  last_practice_date DATE
);

-- ------------------------------------------------------------------------------
-- SCENARIOS TABLE
-- Practice scenarios for different goals and contexts
-- Can be system-generated or user-created
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  goal TEXT NOT NULL CHECK (goal IN ('clarity', 'confidence', 'persuasion', 'fillers', 'quick_thinking')),
  context TEXT NOT NULL CHECK (context IN ('work', 'social', 'everyday')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  prompt_text TEXT NOT NULL,
  objective TEXT NOT NULL,
  eval_focus JSONB DEFAULT '[]'::jsonb NOT NULL,
  time_limit_sec INTEGER DEFAULT 90 NOT NULL,
  usage_count INTEGER DEFAULT 0 NOT NULL
);

-- ------------------------------------------------------------------------------
-- SESSIONS TABLE
-- User practice sessions with transcripts, scores, and AI coaching feedback
-- Core table for tracking all user practice data
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID REFERENCES scenarios(id) ON DELETE SET NULL,
  audio_url TEXT,
  transcript TEXT,
  duration_sec INTEGER,
  scores JSONB DEFAULT '{}'::jsonb,
  coach_summary TEXT,
  coaching_tips JSONB DEFAULT '[]'::jsonb,
  detected_metrics JSONB DEFAULT '{}'::jsonb,
  is_daily_challenge BOOLEAN DEFAULT FALSE NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb
);

-- ------------------------------------------------------------------------------
-- COURSES TABLE
-- Structured learning courses (e.g., "7 Days to Confidence")
-- Provides organized curriculum for users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_free BOOLEAN DEFAULT TRUE NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL
);

-- ------------------------------------------------------------------------------
-- COURSE_LESSONS TABLE
-- Individual lessons within courses
-- Each lesson includes content, video, and practice exercise
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL,
  video_url TEXT,
  linked_goal TEXT CHECK (linked_goal IN ('clarity', 'confidence', 'persuasion', 'fillers', 'quick_thinking')),
  default_context TEXT CHECK (default_context IN ('work', 'social', 'everyday')),
  recommended_time_sec INTEGER DEFAULT 90 NOT NULL,
  practice_prompt TEXT,
  UNIQUE(course_id, day_index)
);

-- ------------------------------------------------------------------------------
-- LESSON_PROGRESS TABLE
-- Track user completion of course lessons
-- Links lessons to practice sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  practice_session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  UNIQUE(user_id, lesson_id)
);

-- ------------------------------------------------------------------------------
-- DAILY_SCENARIOS TABLE
-- Daily practice challenges assigned to users
-- Encourages consistent practice and streak building
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  for_date DATE NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, for_date)
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ==============================================================================

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scenario_id ON sessions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_created ON sessions(user_id, created_at DESC);

-- Lesson progress indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Daily scenarios indexes
CREATE INDEX IF NOT EXISTS idx_daily_scenarios_user_id ON daily_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_scenarios_for_date ON daily_scenarios(for_date);
CREATE INDEX IF NOT EXISTS idx_daily_scenarios_user_date ON daily_scenarios(user_id, for_date);

-- Scenarios indexes
CREATE INDEX IF NOT EXISTS idx_scenarios_goal ON scenarios(goal);
CREATE INDEX IF NOT EXISTS idx_scenarios_context ON scenarios(context);
CREATE INDEX IF NOT EXISTS idx_scenarios_difficulty ON scenarios(difficulty);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_scenarios ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- SCENARIOS POLICIES
-- ------------------------------------------------------------------------------

-- Everyone can view scenarios
CREATE POLICY "Anyone can view scenarios"
  ON scenarios FOR SELECT
  USING (true);

-- Authenticated users can create scenarios
CREATE POLICY "Authenticated users can create scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own scenarios
CREATE POLICY "Users can update own scenarios"
  ON scenarios FOR UPDATE
  USING (auth.uid() = created_by);

-- Users can delete their own scenarios
CREATE POLICY "Users can delete own scenarios"
  ON scenarios FOR DELETE
  USING (auth.uid() = created_by);

-- ------------------------------------------------------------------------------
-- SESSIONS POLICIES
-- ------------------------------------------------------------------------------

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- COURSES POLICIES
-- ------------------------------------------------------------------------------

-- Everyone can view active courses
CREATE POLICY "Anyone can view active courses"
  ON courses FOR SELECT
  USING (is_active = true);

-- ------------------------------------------------------------------------------
-- COURSE_LESSONS POLICIES
-- ------------------------------------------------------------------------------

-- Everyone can view lessons from active courses
CREATE POLICY "Anyone can view lessons"
  ON course_lessons FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_lessons.course_id
      AND courses.is_active = true
    )
  );

-- ------------------------------------------------------------------------------
-- LESSON_PROGRESS POLICIES
-- ------------------------------------------------------------------------------

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- DAILY_SCENARIOS POLICIES
-- ------------------------------------------------------------------------------

-- Users can view their own daily scenarios
CREATE POLICY "Users can view own daily scenarios"
  ON daily_scenarios FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own daily scenarios
CREATE POLICY "Users can update own daily scenarios"
  ON daily_scenarios FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. HELPER FUNCTIONS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- FUNCTION: Update user streak
-- Calculates and updates streak count based on practice dates
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_last_practice DATE;
  v_new_streak INTEGER;
  v_days_since INTEGER;
BEGIN
  -- Get last practice date
  SELECT last_practice_date INTO v_last_practice
  FROM profiles
  WHERE id = p_user_id;

  -- If never practiced before, streak is 1
  IF v_last_practice IS NULL THEN
    v_new_streak := 1;
  ELSE
    v_days_since := CURRENT_DATE - v_last_practice;
    
    -- If practiced yesterday or today, increment streak
    IF v_days_since <= 1 THEN
      SELECT streak_count + 1 INTO v_new_streak
      FROM profiles
      WHERE id = p_user_id;
    -- If missed more than 1 day, reset streak
    ELSE
      v_new_streak := 1;
    END IF;
  END IF;

  -- Update profile
  UPDATE profiles
  SET 
    streak_count = v_new_streak,
    last_practice_date = CURRENT_DATE,
    total_sessions = total_sessions + 1
  WHERE id = p_user_id;

  RETURN v_new_streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- FUNCTION: Calculate user statistics
-- Returns aggregated stats for a user's practice history
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE(
  total_sessions BIGINT,
  total_duration_min INTEGER,
  avg_clarity_score NUMERIC,
  avg_confidence_score NUMERIC,
  sessions_this_week BIGINT,
  current_streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(s.id)::BIGINT as total_sessions,
    (SUM(s.duration_sec) / 60)::INTEGER as total_duration_min,
    ROUND(AVG((s.scores->>'clarity')::NUMERIC), 1) as avg_clarity_score,
    ROUND(AVG((s.scores->>'confidence')::NUMERIC), 1) as avg_confidence_score,
    COUNT(s.id) FILTER (WHERE s.created_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT as sessions_this_week,
    p.streak_count as current_streak
  FROM sessions s
  JOIN profiles p ON p.id = s.user_id
  WHERE s.user_id = p_user_id
  GROUP BY p.streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- FUNCTION: Get or create daily scenario
-- Assigns a daily challenge to a user for a specific date
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_or_create_daily_scenario(p_user_id UUID, p_for_date DATE DEFAULT CURRENT_DATE)
RETURNS UUID AS $$
DECLARE
  v_daily_id UUID;
  v_scenario_id UUID;
  v_user_goal TEXT;
BEGIN
  -- Check if daily scenario already exists
  SELECT id INTO v_daily_id
  FROM daily_scenarios
  WHERE user_id = p_user_id AND for_date = p_for_date;

  -- If exists, return it
  IF v_daily_id IS NOT NULL THEN
    RETURN v_daily_id;
  END IF;

  -- Get user's primary goal
  SELECT primary_goal INTO v_user_goal
  FROM profiles
  WHERE id = p_user_id;

  -- Select a random scenario matching user's goal
  SELECT id INTO v_scenario_id
  FROM scenarios
  WHERE (v_user_goal IS NULL OR goal = v_user_goal)
  ORDER BY RANDOM()
  LIMIT 1;

  -- Create new daily scenario
  INSERT INTO daily_scenarios (user_id, scenario_id, for_date)
  VALUES (p_user_id, v_scenario_id, p_for_date)
  RETURNING id INTO v_daily_id;

  RETURN v_daily_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 6. TRIGGERS
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- TRIGGER: Update scenario usage count
-- Increments usage_count when a scenario is used in a session
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_scenario_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE scenarios
  SET usage_count = usage_count + 1
  WHERE id = NEW.scenario_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_scenario_usage
  AFTER INSERT ON sessions
  FOR EACH ROW
  WHEN (NEW.scenario_id IS NOT NULL)
  EXECUTE FUNCTION increment_scenario_usage();

-- ==============================================================================
-- 7. SEED DATA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- SEED: Starter Course - "7 Days to Confidence & Clarity"
-- ------------------------------------------------------------------------------
INSERT INTO courses (title, slug, description, duration_days, is_active, is_free, order_index)
VALUES (
  '7 Days to Confidence & Clarity',
  '7-days-confidence-clarity',
  'Build a foundation of clear, confident communication in just one week. Perfect for beginners and anyone looking to refresh their skills.',
  7,
  true,
  true,
  1
) ON CONFLICT (slug) DO NOTHING;

-- Get the course ID for inserting lessons
DO $$
DECLARE
  v_course_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM courses WHERE slug = '7-days-confidence-clarity';

  -- Day 1: Introduction to Clear Communication
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 1,
    'Welcome: The Power of Clear Communication',
    '# Day 1: The Power of Clear Communication

## Why Communication Matters

Clear communication is a superpower. It helps you:
- Express your ideas confidently
- Build stronger relationships
- Advance in your career
- Reduce misunderstandings

## Today''s Focus: Baseline

Today is about establishing your starting point. Don''t worry about being perfect—just be yourself.

## Tips for Your First Practice:
1. Speak naturally
2. Take your time
3. Don''t worry about mistakes
4. Have fun with it!',
    'clarity',
    'everyday',
    'Introduce yourself and explain what you hope to achieve by improving your communication skills. Take your time and speak naturally.'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

  -- Day 2: Eliminating Filler Words
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 2,
    'Eliminating Filler Words',
    '# Day 2: Eliminating Filler Words

## What Are Filler Words?

"Um," "uh," "like," "you know"—these words creep into our speech when we''re thinking or nervous.

## Why They Matter

Too many fillers can:
- Make you seem less confident
- Distract your listener
- Weaken your message

## The Pause Technique

Instead of saying "um," try pausing silently. Silence is powerful and shows confidence.

## Today''s Challenge:
Practice speaking with intentional pauses instead of filler words.',
    'fillers',
    'everyday',
    'Describe your morning routine without using any filler words. If you catch yourself about to say "um" or "like," pause instead.'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

  -- Day 3: Speaking with Confidence
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 3,
    'Speaking with Confidence',
    '# Day 3: Speaking with Confidence

## Confidence vs. Arrogance

Confident speakers:
- Stand behind their words
- Admit when they don''t know
- Speak with conviction

## Body Language Matters

Even in audio practice:
- Sit up straight
- Smile while speaking
- Use hand gestures
- Your voice will reflect your posture!

## The "I Believe" Framework

Start statements with conviction:
- "I believe..."
- "In my experience..."
- "I''m confident that..."

## Today''s Practice:
Speak with conviction about something you believe in.',
    'confidence',
    'work',
    'Convince someone why your favorite hobby or interest is worth trying. Speak with passion and confidence.'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

  -- Day 4: Structure Your Thoughts
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 4,
    'Structure Your Thoughts',
    '# Day 4: Structure Your Thoughts

## The Power of Structure

Organized thoughts are easier to:
- Understand
- Remember
- Act upon

## Simple Frameworks

**The Rule of Three:**
Point 1, Point 2, Point 3

**Problem-Solution:**
Here''s the issue → Here''s the fix

**Past-Present-Future:**
Where we were → Where we are → Where we''re going

## Today''s Focus:
Practice using one of these frameworks.',
    'clarity',
    'work',
    'Explain a complex topic you know well using the "Rule of Three" framework. Break it down into three main points.'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

  -- Day 5: Quick Thinking Under Pressure
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 5,
    'Quick Thinking Under Pressure',
    '# Day 5: Quick Thinking Under Pressure

## Think Fast, Speak Smart

Being put on the spot is challenging, but you can train for it.

## The PREP Method

- **P**oint: State your main point
- **R**eason: Give a reason
- **E**xample: Share an example
- **P**oint: Restate your point

## Buy Time Gracefully

"That''s a great question..."
"Let me think about that..."
"Here''s how I see it..."

## Today''s Challenge:
Respond to an unexpected scenario quickly but thoughtfully.',
    'quick_thinking',
    'work',
    'You''re asked in a meeting: "What do you think is the biggest challenge our industry will face in the next 5 years?" Answer using the PREP method.'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

  -- Day 6: Persuasive Speaking
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 6,
    'The Art of Persuasion',
    '# Day 6: The Art of Persuasion

## Persuasion ≠ Manipulation

Good persuasion:
- Respects the listener
- Uses logic and emotion
- Seeks mutual benefit

## The Persuasion Formula

1. **Empathy**: Show you understand their position
2. **Evidence**: Present facts or examples
3. **Emotion**: Connect to what they care about
4. **Action**: Clear next step

## Stories Persuade

People remember stories 22x more than facts alone.

## Today''s Practice:
Persuade someone to take action on something you care about.',
    'persuasion',
    'work',
    'Persuade your manager to let the team work remotely one day per week. Use empathy, evidence, and emotion.'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

  -- Day 7: Bringing It All Together
  INSERT INTO course_lessons (course_id, day_index, title, content_md, linked_goal, default_context, practice_prompt)
  VALUES (
    v_course_id, 7,
    'Bringing It All Together',
    '# Day 7: Bringing It All Together

## You''ve Come Far!

Over the past week, you''ve learned:
- ✅ Clear communication basics
- ✅ Eliminating fillers
- ✅ Speaking confidently
- ✅ Structuring thoughts
- ✅ Quick thinking
- ✅ Persuasive speaking

## Today''s Final Challenge

Combine everything you''ve learned into one powerful practice session.

## Moving Forward

- Practice daily (even 90 seconds helps!)
- Review your progress
- Celebrate improvements
- Keep challenging yourself

## Remember:
Communication is a skill, not a talent. You can always improve.

🎉 **Congratulations on completing the course!**',
    'confidence',
    'work',
    'Give a 90-second elevator pitch about yourself—who you are, what you do, and what makes you unique. Use everything you''ve learned this week!'
  ) ON CONFLICT (course_id, day_index) DO NOTHING;

END $$;

-- ------------------------------------------------------------------------------
-- SEED: Practice Scenarios (20 examples covering all goals and contexts)
-- ------------------------------------------------------------------------------

-- CLARITY scenarios
INSERT INTO scenarios (goal, context, difficulty, prompt_text, objective, eval_focus, time_limit_sec) VALUES
('clarity', 'work', 'easy', 'Explain what you do for work to someone who has never heard of your job title.', 'Use simple language and avoid jargon', '["clarity", "logic", "pacing"]', 90),
('clarity', 'everyday', 'easy', 'Give directions from your home to the nearest grocery store.', 'Be specific and sequential', '["clarity", "logic"]', 60),
('clarity', 'work', 'medium', 'Explain a recent technical problem you solved to a non-technical colleague.', 'Break down complexity into simple terms', '["clarity", "logic", "pacing"]', 120),
('clarity', 'social', 'medium', 'Describe your favorite movie plot without giving away the ending.', 'Be clear and engaging', '["clarity", "pacing"]', 90);

-- CONFIDENCE scenarios
INSERT INTO scenarios (goal, context, difficulty, prompt_text, objective, eval_focus, time_limit_sec) VALUES
('confidence', 'work', 'easy', 'Introduce yourself in a team meeting and share one professional achievement you''re proud of.', 'Speak with conviction and pride', '["confidence", "clarity"]', 60),
('confidence', 'social', 'easy', 'Tell a story about a time you overcame a challenge.', 'Own your success', '["confidence", "clarity"]', 90),
('confidence', 'work', 'hard', 'You''re presenting to executives. Defend a controversial decision you made on a project.', 'Stand firm while staying respectful', '["confidence", "logic", "persuasion"]', 120),
('confidence', 'everyday', 'medium', 'Explain why you deserve a discount or refund for poor service.', 'Be assertive but professional', '["confidence", "clarity"]', 90);

-- PERSUASION scenarios
INSERT INTO scenarios (goal, context, difficulty, prompt_text, objective, eval_focus, time_limit_sec) VALUES
('persuasion', 'work', 'medium', 'Convince your manager to approve your budget request for a new tool or resource.', 'Use logic and benefits', '["persuasion", "logic", "confidence"]', 120),
('persuasion', 'social', 'easy', 'Recommend a book, movie, or restaurant to a friend and convince them to try it.', 'Be enthusiastic and specific', '["persuasion", "clarity"]', 90),
('persuasion', 'work', 'hard', 'Pitch a new product idea to potential investors in 90 seconds.', 'Hook them quickly and show value', '["persuasion", "confidence", "logic"]', 90),
('persuasion', 'everyday', 'medium', 'Convince someone to join you in a healthy habit (exercise, meditation, etc.).', 'Appeal to their motivations', '["persuasion", "clarity"]', 90);

-- FILLERS scenarios
INSERT INTO scenarios (goal, context, difficulty, prompt_text, objective, eval_focus, time_limit_sec) VALUES
('fillers', 'work', 'easy', 'Describe your typical workday from start to finish without using filler words.', 'Replace fillers with intentional pauses', '["fillers", "pacing", "clarity"]', 90),
('fillers', 'everyday', 'medium', 'Teach someone how to make your favorite recipe, step by step, without any "ums" or "likes".', 'Speak smoothly and deliberately', '["fillers", "clarity", "pacing"]', 120),
('fillers', 'social', 'easy', 'Describe your dream vacation destination without filler words.', 'Pause instead of filling silence', '["fillers", "clarity"]', 60),
('fillers', 'work', 'hard', 'Answer rapid-fire questions about your expertise without using filler words.', 'Stay composed under pressure', '["fillers", "quick_thinking", "confidence"]', 90);

-- QUICK_THINKING scenarios
INSERT INTO scenarios (goal, context, difficulty, prompt_text, objective, eval_focus, time_limit_sec) VALUES
('quick_thinking', 'work', 'medium', 'You''re asked in a meeting: "What''s the one thing we should change about our product?" Answer immediately.', 'Think fast but stay coherent', '["quick_thinking", "clarity", "confidence"]', 60),
('quick_thinking', 'social', 'easy', 'Someone asks: "If you could have dinner with anyone, dead or alive, who and why?" Respond quickly.', 'Be spontaneous yet thoughtful', '["quick_thinking", "clarity"]', 60),
('quick_thinking', 'work', 'hard', 'Respond to: "Our biggest competitor just launched a feature we don''t have. What''s our plan?"', 'Stay calm and strategic', '["quick_thinking", "logic", "confidence"]', 90),
('quick_thinking', 'everyday', 'medium', 'You''re asked: "What''s one thing you''d change about yourself if you could?" Answer honestly and quickly.', 'Be authentic under pressure', '["quick_thinking", "clarity", "confidence"]', 60);

-- ==============================================================================
-- 8. HELPFUL VIEWS (Optional)
-- ==============================================================================

-- User dashboard summary view
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
  p.id as user_id,
  p.display_name,
  p.streak_count,
  p.total_sessions,
  COUNT(DISTINCT ds.id) FILTER (WHERE ds.status = 'new') as pending_daily_challenges,
  COUNT(DISTINCT lp.id) as completed_lessons,
  AVG((s.scores->>'clarity')::NUMERIC) as avg_clarity,
  AVG((s.scores->>'confidence')::NUMERIC) as avg_confidence
FROM profiles p
LEFT JOIN daily_scenarios ds ON ds.user_id = p.id
LEFT JOIN lesson_progress lp ON lp.user_id = p.id
LEFT JOIN sessions s ON s.user_id = p.id
GROUP BY p.id, p.display_name, p.streak_count, p.total_sessions;

-- ==============================================================================
-- ROLLBACK COMMANDS (Keep commented - use only if you need to tear down)
-- ==============================================================================

/*
-- WARNING: These commands will DELETE ALL DATA and TABLES
-- Only run if you need to completely reset the database

DROP VIEW IF EXISTS user_dashboard_summary;
DROP TRIGGER IF EXISTS trigger_increment_scenario_usage ON sessions;
DROP FUNCTION IF EXISTS increment_scenario_usage();
DROP FUNCTION IF EXISTS get_or_create_daily_scenario(UUID, DATE);
DROP FUNCTION IF EXISTS get_user_stats(UUID);
DROP FUNCTION IF EXISTS update_user_streak(UUID);
DROP TABLE IF EXISTS daily_scenarios CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS scenarios CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
*/

-- ==============================================================================
-- END OF SCHEMA
-- ==============================================================================


