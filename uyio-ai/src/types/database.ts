// src/types/database.ts
import type { FeedbackScores, CoachingTips } from './feedback'

export type Goal = 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'
export type Context = 'work' | 'social' | 'everyday'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Profile {
  id: string
  created_at: string
  display_name: string
  primary_goal: Goal
  practice_length_sec: number
  onboarding_completed: boolean
  total_sessions: number
  streak_count: number
  last_practice_date: string | null
}

export interface ProfileInput {
  display_name: string
  primary_goal: Goal
  practice_length_sec?: number
}

export interface ProfileStats {
  total_practice_time: number // seconds
  average_session_length: number // seconds
  most_practiced_goal: Goal | null
  best_performing_metric: string | null
  sessions_this_week: number
  sessions_this_month: number
}

export interface SessionDB {
  id: string
  created_at: string
  user_id: string
  scenario_id: string | null
  audio_url: string
  transcript: string
  duration_sec: number
  scores: FeedbackScores
  coach_summary: string
  coaching_tips: CoachingTips
  detected_metrics: {
    wpm: number
    fillerCount: number
    avgPauseLength: number
  }
  is_daily_challenge: boolean
  is_guest: boolean
  guest_id: string | null
  meta: Record<string, any> | null
}

export interface SessionInput {
  user_id: string
  scenario_id: string | null
  audio_url: string
  transcript: string
  duration_sec: number
  scores: FeedbackScores
  coach_summary: string
  coaching_tips: CoachingTips
  detected_metrics: {
    wpm: number
    fillerCount: number
    avgPauseLength: number
  }
  is_daily_challenge?: boolean
  is_guest?: boolean
  guest_id?: string | null
  meta?: Record<string, any>
}

export interface SessionStats {
  total_sessions: number
  total_time: number
  average_scores: FeedbackScores & { overall: number }
  sessions_by_day: Record<string, number>
  sessions_by_context: Record<string, number>
}

export interface ScenarioDB {
  id: string
  created_at: string
  created_by: string | null
  goal: Goal
  context: Context
  difficulty: Difficulty
  prompt_text: string
  objective: string
  eval_focus: string[]
  time_limit_sec: number
  usage_count: number
}

export interface ScenarioInput {
  created_by?: string
  goal: Goal
  context: Context
  difficulty: Difficulty
  prompt_text: string
  objective: string
  eval_focus: string[]
  time_limit_sec?: number
}

export interface DailyScenario {
  id: string
  user_id: string
  scenario_id: string
  for_date: string
  status: 'new' | 'completed' | 'skipped'
  completed_at: string | null
  scenario?: ScenarioDB
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string
  duration_days: number
  is_active: boolean
  is_free: boolean
  order_index: number
}

export interface CourseLesson {
  id: string
  course_id: string
  day_index: number
  title: string
  content_md: string
  video_url: string | null
  linked_goal: Goal
  default_context: Context
  recommended_time_sec: number
  practice_prompt: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed_at: string
  practice_session_id: string | null
}

export interface CourseProgress {
  course_id: string
  total_lessons: number
  completed_lessons: number
  percentage_complete: number
  next_lesson: CourseLesson | null
  last_completed_at: string | null
}

export interface CourseStats {
  lessons_completed: number
  total_lessons: number
  average_score: number
  total_time: number
  started_at: string | null
  completed_at: string | null
}

export interface MetricAverages {
  clarity: number
  confidence: number
  logic: number
  pacing: number
  fillers: number
  overall: number
}

export interface BestScores {
  clarity: { score: number; date: string; scenario_id: string | null }
  confidence: { score: number; date: string; scenario_id: string | null }
  logic: { score: number; date: string; scenario_id: string | null }
  pacing: { score: number; date: string; scenario_id: string | null }
  fillers: { score: number; date: string; scenario_id: string | null }
}

export interface WeeklyActivity {
  sessions_by_day: Record<string, number> // Mon, Tue, etc.
  sessions_by_hour: Record<number, number> // 0-23
  preferred_contexts: Record<Context, number>
  total_sessions: number
  total_time: number
}

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  score: number
  rank: number
  sessions_count: number
}

export interface GlobalStats {
  total_users: number
  total_sessions: number
  total_practice_time: number // seconds
  average_session_score: number
}

