// src/lib/db/sessions.ts
import { createClient } from '@/lib/supabase/client'
import type { FeedbackResult } from '@/types/feedback'
import type { Scenario } from '@/types/scenario'

export interface Session {
  id: string
  created_at: string
  user_id: string
  scenario_id: string
  audio_url: string
  transcript: string
  duration_sec: number
  scores: {
    clarity: number
    confidence: number
    logic: number
    pacing: number
    fillers: number
  }
  coach_summary: string
  coaching_tips: {
    clarity: string
    confidence: string
    logic: string
    pacing: string
    fillers: string
  }
  detected_metrics: {
    wpm: number
    fillerCount: number
    avgPauseLength: number
  }
  is_daily_challenge: boolean
  meta?: Record<string, any>
  scenario?: Scenario
}

export interface SaveSessionData {
  user_id: string
  scenario_id: string
  audio_url: string
  transcript: string
  duration_sec: number
  feedback: FeedbackResult
  is_daily_challenge?: boolean
}

/**
 * Save a practice session to the database
 * @param data Session data including feedback
 * @returns Session ID
 */
export async function saveSession(data: SaveSessionData): Promise<string> {
  const supabase = createClient()

  const sessionData = {
    user_id: data.user_id,
    scenario_id: data.scenario_id,
    audio_url: data.audio_url,
    transcript: data.transcript,
    duration_sec: data.duration_sec,
    scores: data.feedback.scores,
    coach_summary: data.feedback.summary,
    coaching_tips: data.feedback.coaching,
    detected_metrics: data.feedback.detectedMetrics,
    is_daily_challenge: data.is_daily_challenge || false,
    meta: {
      device: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      app_version: '1.0.0',
    },
  }

  const { data: session, error } = await supabase
    .from('sessions')
    .insert(sessionData)
    .select('id')
    .single()

  if (error) {
    console.error('Error saving session:', error)
    throw new Error(`Failed to save session: ${error.message}`)
  }

  // Update user's total sessions count and streak
  await updateUserStats(data.user_id)

  return session.id
}

/**
 * Get a session by ID
 * @param sessionId The session ID
 * @returns Session data with scenario
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      scenario:scenarios(*)
    `)
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data as Session
}

/**
 * Get user's recent practice sessions
 * @param userId User ID
 * @param limit Number of sessions to fetch
 * @returns Array of sessions
 */
export async function getUserRecentSessions(userId: string, limit: number = 5): Promise<Session[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      scenario:scenarios(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recent sessions:', error)
    return []
  }

  return (data as Session[]) || []
}

/**
 * Get user's session statistics
 * @param userId User ID
 * @returns Statistics object
 */
export async function getUserSessionStats(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select('scores, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) {
    return {
      totalSessions: 0,
      averageScore: 0,
      bestScore: 0,
      recentImprovement: 0,
    }
  }

  const totalSessions = data.length

  if (totalSessions === 0) {
    return {
      totalSessions: 0,
      averageScore: 0,
      bestScore: 0,
      recentImprovement: 0,
    }
  }

  // Calculate average of all scores
  const allScores = data.map((session) => {
    const scores = session.scores as any
    return (scores.clarity + scores.confidence + scores.logic + scores.pacing + scores.fillers) / 5
  })

  const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length
  const bestScore = Math.max(...allScores)

  // Calculate improvement (last 5 sessions vs previous 5)
  let recentImprovement = 0
  if (totalSessions >= 10) {
    const recent = allScores.slice(0, 5)
    const previous = allScores.slice(5, 10)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length
    recentImprovement = ((recentAvg - previousAvg) / previousAvg) * 100
  }

  return {
    totalSessions,
    averageScore: Math.round(averageScore * 10) / 10,
    bestScore: Math.round(bestScore * 10) / 10,
    recentImprovement: Math.round(recentImprovement),
  }
}

/**
 * Update user statistics after a session
 * @param userId User ID
 */
async function updateUserStats(userId: string) {
  const supabase = createClient()

  // Get total sessions count
  const { count } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Update profile with new count
  await supabase
    .from('profiles')
    .update({
      total_sessions: count || 0,
      last_practice_date: new Date().toISOString().split('T')[0],
    })
    .eq('id', userId)

  // TODO: Implement streak calculation
}

