// src/lib/stats/calculator.ts
import type { Session } from '@/lib/db/sessions'

export interface MetricAverages {
  clarity: number
  confidence: number
  logic: number
  pacing: number
  fillers: number
  overall: number
}

export interface Trend {
  metric: string
  current: number
  previous: number
  change: number
  direction: 'up' | 'down' | 'stable'
}

export interface StreakData {
  currentStreak: number
  bestStreak: number
  lastPracticeDate: string | null
}

export interface Improvement {
  metric: string
  change: number
  message: string
  icon: string
}

/**
 * Calculate average scores for each metric
 */
export function calculateAverages(sessions: Session[]): MetricAverages {
  if (sessions.length === 0) {
    return {
      clarity: 0,
      confidence: 0,
      logic: 0,
      pacing: 0,
      fillers: 0,
      overall: 0,
    }
  }

  const totals = sessions.reduce(
    (acc, session) => ({
      clarity: acc.clarity + session.scores.clarity,
      confidence: acc.confidence + session.scores.confidence,
      logic: acc.logic + session.scores.logic,
      pacing: acc.pacing + session.scores.pacing,
      fillers: acc.fillers + session.scores.fillers,
    }),
    { clarity: 0, confidence: 0, logic: 0, pacing: 0, fillers: 0 }
  )

  const count = sessions.length
  const averages = {
    clarity: Math.round((totals.clarity / count) * 10) / 10,
    confidence: Math.round((totals.confidence / count) * 10) / 10,
    logic: Math.round((totals.logic / count) * 10) / 10,
    pacing: Math.round((totals.pacing / count) * 10) / 10,
    fillers: Math.round((totals.fillers / count) * 10) / 10,
  }

  const overall = Math.round(
    ((averages.clarity + averages.confidence + averages.logic + averages.pacing + averages.fillers) / 5) * 10
  ) / 10

  return { ...averages, overall }
}

/**
 * Calculate trends for the specified number of days
 */
export function calculateTrends(sessions: Session[], days: number = 7): Trend[] {
  if (sessions.length < 2) {
    return []
  }

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  // Split sessions into recent and previous periods
  const recentSessions = sessions.filter((s) => new Date(s.created_at) >= cutoffDate)
  const previousSessions = sessions.filter((s) => new Date(s.created_at) < cutoffDate)

  if (recentSessions.length === 0 || previousSessions.length === 0) {
    return []
  }

  const recentAvg = calculateAverages(recentSessions)
  const previousAvg = calculateAverages(previousSessions)

  const metrics: (keyof Omit<MetricAverages, 'overall'>)[] = ['clarity', 'confidence', 'logic', 'pacing', 'fillers']

  return metrics.map((metric) => {
    const current = recentAvg[metric]
    const previous = previousAvg[metric]
    const change = Math.round(((current - previous) / previous) * 100)

    let direction: 'up' | 'down' | 'stable' = 'stable'
    if (change > 5) direction = 'up'
    else if (change < -5) direction = 'down'

    return {
      metric,
      current,
      previous,
      change,
      direction,
    }
  })
}

/**
 * Calculate current and best streak
 */
export function calculateStreak(sessions: Session[]): StreakData {
  if (sessions.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastPracticeDate: null,
    }
  }

  // Sort sessions by date descending
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  const lastPracticeDate = sortedSessions[0].created_at.split('T')[0]

  // Get unique practice dates
  const practiceDates = Array.from(new Set(sortedSessions.map((s) => s.created_at.split('T')[0]))).sort().reverse()

  // Calculate current streak
  let currentStreak = 0
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (practiceDates[0] === today || practiceDates[0] === yesterday) {
    currentStreak = 1
    for (let i = 1; i < practiceDates.length; i++) {
      const currentDate = new Date(practiceDates[i - 1])
      const nextDate = new Date(practiceDates[i])
      const diffDays = Math.round((currentDate.getTime() - nextDate.getTime()) / 86400000)

      if (diffDays === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate best streak
  let bestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < practiceDates.length; i++) {
    const currentDate = new Date(practiceDates[i - 1])
    const nextDate = new Date(practiceDates[i])
    const diffDays = Math.round((currentDate.getTime() - nextDate.getTime()) / 86400000)

    if (diffDays === 1) {
      tempStreak++
    } else {
      bestStreak = Math.max(bestStreak, tempStreak)
      tempStreak = 1
    }
  }
  bestStreak = Math.max(bestStreak, tempStreak)

  return {
    currentStreak,
    bestStreak,
    lastPracticeDate,
  }
}

/**
 * Identify significant improvements
 */
export function getImprovements(sessions: Session[]): Improvement[] {
  if (sessions.length < 5) {
    return []
  }

  const improvements: Improvement[] = []

  // Compare recent 5 sessions to previous 5 sessions
  const recentSessions = sessions.slice(0, 5)
  const previousSessions = sessions.slice(5, 10)

  if (previousSessions.length < 5) {
    return []
  }

  const recentAvg = calculateAverages(recentSessions)
  const previousAvg = calculateAverages(previousSessions)

  const metrics: { key: keyof Omit<MetricAverages, 'overall'>; name: string; icon: string }[] = [
    { key: 'clarity', name: 'Clarity', icon: '🎯' },
    { key: 'confidence', name: 'Confidence', icon: '💪' },
    { key: 'logic', name: 'Logic', icon: '🧠' },
    { key: 'pacing', name: 'Pacing', icon: '⏱️' },
    { key: 'fillers', name: 'Fillers', icon: '🚫' },
  ]

  metrics.forEach(({ key, name, icon }) => {
    const change = Math.round(((recentAvg[key] - previousAvg[key]) / previousAvg[key]) * 100)

    if (change >= 20) {
      improvements.push({
        metric: name,
        change,
        message: `${change}% improvement in ${name} over your last 10 sessions!`,
        icon,
      })
    }
  })

  // Check for new personal bests
  const allTimeAvg = calculateAverages(sessions)
  const currentAvg = calculateAverages(recentSessions)

  if (currentAvg.overall > allTimeAvg.overall) {
    improvements.push({
      metric: 'Overall',
      change: Math.round(((currentAvg.overall - allTimeAvg.overall) / allTimeAvg.overall) * 100),
      message: 'New personal best average score!',
      icon: '🏆',
    })
  }

  return improvements
}

/**
 * Generate AI-style insights based on data patterns
 */
export function generateInsights(sessions: Session[]): string[] {
  if (sessions.length < 3) {
    return ['Complete more sessions to unlock personalized insights!']
  }

  const insights: string[] = []

  // Analyze best performing scenario context
  const contextCounts: Record<string, { count: number; totalScore: number }> = {}
  sessions.forEach((session) => {
    const context = session.scenario?.context || 'unknown'
    if (!contextCounts[context]) {
      contextCounts[context] = { count: 0, totalScore: 0 }
    }
    const avgScore =
      (session.scores.clarity +
        session.scores.confidence +
        session.scores.logic +
        session.scores.pacing +
        session.scores.fillers) /
      5
    contextCounts[context].count++
    contextCounts[context].totalScore += avgScore
  })

  const bestContext = Object.entries(contextCounts).reduce((best, [context, data]) => {
    const avg = data.totalScore / data.count
    if (!best || avg > best.avg) {
      return { context, avg }
    }
    return best
  }, null as { context: string; avg: number } | null)

  if (bestContext) {
    insights.push(`You perform best in ${bestContext.context} scenarios. Consider focusing your practice here.`)
  }

  // Analyze time patterns
  const trends = calculateTrends(sessions, 7)
  const improvingMetrics = trends.filter((t) => t.direction === 'up')

  if (improvingMetrics.length > 0) {
    insights.push(
      `Great progress! Your ${improvingMetrics[0].metric} has improved by ${Math.abs(improvingMetrics[0].change)}% this week.`
    )
  }

  // Streak encouragement
  const streak = calculateStreak(sessions)
  if (streak.currentStreak >= 3) {
    insights.push(`You're on a ${streak.currentStreak}-day streak! Consistency is key to improvement.`)
  }

  // Practice frequency insight
  const recentDays = 7
  const recentSessions = sessions.filter((s) => {
    const date = new Date(s.created_at)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - recentDays)
    return date >= cutoff
  })

  if (recentSessions.length >= 5) {
    insights.push("Excellent practice frequency! You're building strong communication habits.")
  } else if (recentSessions.length < 2 && sessions.length > 5) {
    insights.push("Try to practice more consistently. Even 90 seconds daily makes a difference!")
  }

  return insights.length > 0 ? insights : ['Keep practicing to unlock insights about your progress!']
}

/**
 * Calculate total practice time
 */
export function calculateTotalTime(sessions: Session[]): { hours: number; minutes: number } {
  const totalSeconds = sessions.reduce((sum, session) => sum + (session.duration_sec || 90), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  return { hours, minutes }
}

