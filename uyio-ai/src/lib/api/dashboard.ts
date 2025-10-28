import { createClient } from '@/lib/supabase/server'
import type { Scenario } from '@/types/scenario'

export interface UserStats {
  currentStreak: number
  totalSessions: number
  bestScore: number
  improvementPercent: number
}

export interface DailyChallenge {
  id: string
  promptText: string
  difficulty: 'easy' | 'medium' | 'hard'
  context: 'work' | 'social' | 'everyday'
  goal: string
}

export interface RecentSession {
  id: string
  createdAt: string
  scenarioTitle: string
  overallScore: number
  scores: {
    clarity: number
    confidence: number
    logic: number
  }
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createClient()

  // Get profile for streak
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, total_sessions')
    .eq('id', userId)
    .single()

  // Get best score
  const { data: sessions } = await supabase
    .from('sessions')
    .select('scores')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  let bestScore = 0
  if (sessions && sessions.length > 0) {
    bestScore = Math.max(
      ...sessions
        .map((s) => (s.scores as any)?.overall || 0)
        .filter((score) => score > 0)
    )
  }

  // Calculate improvement (last 7 days vs previous 7 days)
  const improvementPercent = await calculateImprovement(userId)

  return {
    currentStreak: profile?.streak_count || 0,
    totalSessions: profile?.total_sessions || 0,
    bestScore: bestScore || 0,
    improvementPercent,
  }
}

/**
 * Get today's daily challenge
 */
export async function getDailyChallenge(userId: string): Promise<Scenario | null> {
  const supabase = await createClient()

  // Get user's goal for personalization
  const { data: profile } = await supabase
    .from('profiles')
    .select('primary_goal')
    .eq('id', userId)
    .single()

  const today = new Date().toISOString().split('T')[0]

  // Check if daily scenario exists
  let { data: dailyScenario } = await supabase
    .from('daily_scenarios')
    .select('scenario_id, scenarios(*)')
    .eq('user_id', userId)
    .eq('for_date', today)
    .single()

  // If no daily scenario, create one
  if (!dailyScenario) {
    // Get a random scenario matching user's goal
    const { data: scenario } = await supabase
      .from('scenarios')
      .select('*')
      .eq('goal', profile?.primary_goal || 'clarity')
      .order('usage_count', { ascending: true })
      .limit(1)
      .single()

    if (scenario) {
      // Create daily scenario
      await supabase.from('daily_scenarios').insert({
        user_id: userId,
        scenario_id: scenario.id,
        for_date: today,
      })

      return scenario as Scenario
    }
  } else {
    const scenario = (dailyScenario as any).scenarios
    return scenario as Scenario
  }

  return null
}

/**
 * Get recent practice sessions
 */
export async function getRecentSessions(userId: string, limit = 5): Promise<RecentSession[]> {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, created_at, scenario_id, scores, scenarios(prompt_text)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!sessions) return []

  return sessions.map((session) => ({
    id: session.id,
    createdAt: session.created_at,
    scenarioTitle: ((session as any).scenarios?.prompt_text || 'Practice Session').substring(0, 50),
    overallScore: (session.scores as any)?.overall || 0,
    scores: {
      clarity: (session.scores as any)?.clarity || 0,
      confidence: (session.scores as any)?.confidence || 0,
      logic: (session.scores as any)?.logic || 0,
    },
  }))
}

/**
 * Get tip of the day
 */
export function getTipOfTheDay(): string {
  const tips = [
    'Pause before key points for emphasis and clarity.',
    'Use the "Rule of Three" to organize your thoughts.',
    'Smile while speaking - it changes your voice tone!',
    'Record yourself and listen back to identify patterns.',
    'Practice with a timer to build comfort with time limits.',
    'Replace "um" with silence - pauses show confidence.',
    'Stand or sit up straight to improve breath control.',
    'Visualize success before starting your practice.',
    'Focus on one improvement area per session.',
    'Tell stories - they make your points memorable.',
    'Match your energy to your message\'s importance.',
    'End with a strong conclusion, not a trailing voice.',
    'Practice difficult words before your session.',
    'Use hand gestures even in audio practice.',
    'Warm up your voice with simple scales or humming.',
  ]

  // Pseudo-random based on date for consistency
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  )
  return tips[dayOfYear % tips.length]
}

/**
 * Calculate improvement percentage
 */
async function calculateImprovement(userId: string): Promise<number> {
  const supabase = await createClient()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

  // Last 7 days
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('scores')
    .eq('user_id', userId)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  // Previous 7 days
  const { data: previousSessions } = await supabase
    .from('sessions')
    .select('scores')
    .eq('user_id', userId)
    .gte('created_at', fourteenDaysAgo.toISOString())
    .lt('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  if (!recentSessions || recentSessions.length === 0) return 0
  if (!previousSessions || previousSessions.length === 0) return 0

  const recentAvg =
    recentSessions.reduce((sum, s) => sum + ((s.scores as any)?.overall || 0), 0) /
    recentSessions.length

  const previousAvg =
    previousSessions.reduce((sum, s) => sum + ((s.scores as any)?.overall || 0), 0) /
    previousSessions.length

  if (previousAvg === 0) return 0

  return Math.round(((recentAvg - previousAvg) / previousAvg) * 100)
}


