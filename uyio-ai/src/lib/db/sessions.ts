// src/lib/db/sessions.ts
import { createClient } from '@/lib/supabase/client'
import { withErrorHandling, withRetry, NotFoundError, PermissionError } from './errors'
import { incrementSessionCount } from './profiles'
import type { FeedbackResult } from '@/types/feedback'
import type { Scenario } from '@/types/scenario'
import type { SessionDB, SessionInput, SessionStats, MetricAverages } from '@/types/database'

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

interface GetSessionsOptions {
  limit?: number
  offset?: number
  dateFrom?: Date
  dateTo?: Date
  scenarioType?: string
  goal?: string
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
 * Create a new session
 */
export async function createSession(input: SessionInput): Promise<Session> {
  return withRetry(async () => {
    const supabase = createClient()

    const sessionData = {
      ...input,
      is_guest: input.is_guest || false,
      meta: input.meta || {
        device: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        app_version: '1.0.0',
      },
    }

    const { data, error } = await supabase
      .from('sessions')
      .insert(sessionData)
      .select('*')
      .single()

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`)
    }

    // Update user stats
    if (!input.is_guest) {
      await incrementSessionCount(input.user_id)
    }

    return data as Session
  })
}

/**
 * Save a practice session (legacy compatibility)
 */
export async function saveSession(data: SaveSessionData): Promise<string> {
  const session = await createSession({
    user_id: data.user_id,
    scenario_id: data.scenario_id,
    audio_url: data.audio_url,
    transcript: data.transcript,
    duration_sec: data.duration_sec,
    scores: data.feedback.scores,
    coach_summary: data.feedback.summary,
    coaching_tips: data.feedback.coaching,
    detected_metrics: data.feedback.detectedMetrics,
    is_daily_challenge: data.is_daily_challenge,
  })

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
 * Get user's sessions with advanced filtering
 */
export async function getUserSessions(
  userId: string,
  options: GetSessionsOptions = {}
): Promise<Session[]> {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const {
      limit = 20,
      offset = 0,
      dateFrom,
      dateTo,
      scenarioType,
      goal,
    } = options

    let query = supabase
      .from('sessions')
      .select(`
        *,
        scenario:scenarios(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (dateFrom) {
      query = query.gte('created_at', dateFrom.toISOString())
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo.toISOString())
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`)
    }

    // Filter by scenario properties (client-side for now)
    let sessions = (data as Session[]) || []

    if (scenarioType) {
      sessions = sessions.filter((s) => s.scenario?.context === scenarioType)
    }
    if (goal) {
      sessions = sessions.filter((s) => s.scenario?.goal === goal)
    }

    return sessions
  }, 'getUserSessions')
}

/**
 * Get user's recent practice sessions
 */
export async function getUserRecentSessions(userId: string, limit: number = 5): Promise<Session[]> {
  return getUserSessions(userId, { limit })
}

/**
 * Get detailed session statistics
 */
export async function getSessionStats(userId: string): Promise<SessionStats> {
  return withErrorHandling(async () => {
    const sessions = await getUserSessions(userId, { limit: 1000 })

    if (sessions.length === 0) {
      return {
        total_sessions: 0,
        total_time: 0,
        average_scores: {
          clarity: 0,
          confidence: 0,
          logic: 0,
          pacing: 0,
          fillers: 0,
          overall: 0,
        },
        sessions_by_day: {},
        sessions_by_context: {},
      }
    }

    // Calculate totals
    const totalTime = sessions.reduce((sum, s) => sum + s.duration_sec, 0)

    // Calculate averages
    const scoreSum = sessions.reduce(
      (acc, s) => ({
        clarity: acc.clarity + s.scores.clarity,
        confidence: acc.confidence + s.scores.confidence,
        logic: acc.logic + s.scores.logic,
        pacing: acc.pacing + s.scores.pacing,
        fillers: acc.fillers + s.scores.fillers,
      }),
      { clarity: 0, confidence: 0, logic: 0, pacing: 0, fillers: 0 }
    )

    const avgScores = {
      clarity: Math.round((scoreSum.clarity / sessions.length) * 10) / 10,
      confidence: Math.round((scoreSum.confidence / sessions.length) * 10) / 10,
      logic: Math.round((scoreSum.logic / sessions.length) * 10) / 10,
      pacing: Math.round((scoreSum.pacing / sessions.length) * 10) / 10,
      fillers: Math.round((scoreSum.fillers / sessions.length) * 10) / 10,
      overall: 0,
    }
    avgScores.overall =
      Math.round(
        ((avgScores.clarity + avgScores.confidence + avgScores.logic + avgScores.pacing + avgScores.fillers) / 5) * 10
      ) / 10

    // Sessions by day
    const sessionsByDay: Record<string, number> = {}
    sessions.forEach((s) => {
      const day = new Date(s.created_at).toLocaleDateString('en-US', { weekday: 'short' })
      sessionsByDay[day] = (sessionsByDay[day] || 0) + 1
    })

    // Sessions by context
    const sessionsByContext: Record<string, number> = {}
    sessions.forEach((s) => {
      const context = s.scenario?.context || 'unknown'
      sessionsByContext[context] = (sessionsByContext[context] || 0) + 1
    })

    return {
      total_sessions: sessions.length,
      total_time: totalTime,
      average_scores: avgScores,
      sessions_by_day: sessionsByDay,
      sessions_by_context: sessionsByContext,
    }
  }, 'getSessionStats')
}

/**
 * Legacy function for compatibility
 */
export async function getUserSessionStats(userId: string) {
  const stats = await getSessionStats(userId)

  const sessions = await getUserSessions(userId, { limit: 1000 })
  const allScores = sessions.map(
    (s) => (s.scores.clarity + s.scores.confidence + s.scores.logic + s.scores.pacing + s.scores.fillers) / 5
  )
  const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0

  // Calculate improvement
  let recentImprovement = 0
  if (sessions.length >= 10) {
    const recent = allScores.slice(0, 5)
    const previous = allScores.slice(5, 10)
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const previousAvg = previous.reduce((a, b) => a + b, 0) / previous.length
    recentImprovement = ((recentAvg - previousAvg) / previousAvg) * 100
  }

  return {
    totalSessions: stats.total_sessions,
    averageScore: stats.average_scores.overall,
    bestScore: Math.round(bestScore * 10) / 10,
    recentImprovement: Math.round(recentImprovement),
  }
}

/**
 * Delete a session
 */
export async function deleteSession(sessionId: string, userId: string): Promise<boolean> {
  return withRetry(async () => {
    const supabase = createClient()

    // Verify ownership
    const session = await getSession(sessionId)
    if (!session) {
      throw new NotFoundError('Session', sessionId)
    }
    if (session.user_id !== userId) {
      throw new PermissionError('delete', 'session')
    }

    const { error } = await supabase.from('sessions').delete().eq('id', sessionId)

    if (error) {
      throw new Error(`Failed to delete session: ${error.message}`)
    }

    // TODO: Clean up audio file from storage

    return true
  })
}

/**
 * Get guest sessions
 */
export async function getGuestSessions(guestId: string): Promise<Session[]> {
  return withErrorHandling(async () => {
    const supabase = createClient()

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const { data, error } = await supabase
      .from('sessions')
      .select('*, scenario:scenarios(*)')
      .eq('guest_id', guestId)
      .eq('is_guest', true)
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch guest sessions: ${error.message}`)
    }

    return (data as Session[]) || []
  }, 'getGuestSessions')
}

