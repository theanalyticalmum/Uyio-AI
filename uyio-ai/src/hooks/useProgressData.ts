// src/hooks/useProgressData.ts
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUserRecentSessions } from '@/lib/db/sessions'
import type { Session } from '@/lib/db/sessions'
import {
  calculateAverages,
  calculateTrends,
  calculateStreak,
  getImprovements,
  generateInsights,
  calculateTotalTime,
  type MetricAverages,
  type Trend,
  type StreakData,
  type Improvement,
} from '@/lib/stats/calculator'

export interface ProgressData {
  sessions: Session[]
  averages: MetricAverages
  trends: Trend[]
  streak: StreakData
  improvements: Improvement[]
  insights: string[]
  totalTime: { hours: number; minutes: number }
  loading: boolean
  error: string | null
}

interface UseProgressDataOptions {
  limit?: number
  dateRange?: number // days
  autoRefresh?: boolean
}

export function useProgressData(options: UseProgressDataOptions = {}): ProgressData {
  const { limit = 100, dateRange = 30, autoRefresh = false } = options

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [averages, setAverages] = useState<MetricAverages>({
    clarity: 0,
    confidence: 0,
    logic: 0,
    pacing: 0,
    fillers: 0,
    overall: 0,
  })
  const [trends, setTrends] = useState<Trend[]>([])
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastPracticeDate: null,
  })
  const [improvements, setImprovements] = useState<Improvement[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [totalTime, setTotalTime] = useState<{ hours: number; minutes: number }>({ hours: 0, minutes: 0 })

  useEffect(() => {
    fetchData()

    if (autoRefresh) {
      const interval = setInterval(fetchData, 5 * 60 * 1000) // Refresh every 5 minutes
      return () => clearInterval(interval)
    }
  }, [limit, dateRange, autoRefresh])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData?.user) {
        throw new Error('Not authenticated')
      }

      // Fetch sessions
      const fetchedSessions = await getUserRecentSessions(userData.user.id, limit)

      // Filter by date range
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - dateRange)
      const filteredSessions = fetchedSessions.filter((s) => new Date(s.created_at) >= cutoffDate)

      setSessions(filteredSessions)

      // Calculate all statistics
      if (filteredSessions.length > 0) {
        setAverages(calculateAverages(filteredSessions))
        setTrends(calculateTrends(filteredSessions, 7))
        setStreak(calculateStreak(filteredSessions))
        setImprovements(getImprovements(filteredSessions))
        setInsights(generateInsights(filteredSessions))
        setTotalTime(calculateTotalTime(filteredSessions))
      }

      // Try to cache results
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'uyio_progress_cache',
            JSON.stringify({
              timestamp: Date.now(),
              sessions: filteredSessions,
            })
          )
        } catch (e) {
          // Ignore localStorage errors
        }
      }
    } catch (err) {
      console.error('Error fetching progress data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load progress data')

      // Try to load from cache
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('uyio_progress_cache')
          if (cached) {
            const { timestamp, sessions: cachedSessions } = JSON.parse(cached)
            // Use cache if less than 1 hour old
            if (Date.now() - timestamp < 60 * 60 * 1000) {
              setSessions(cachedSessions)
              setAverages(calculateAverages(cachedSessions))
              setTrends(calculateTrends(cachedSessions, 7))
              setStreak(calculateStreak(cachedSessions))
              setImprovements(getImprovements(cachedSessions))
              setInsights(generateInsights(cachedSessions))
              setTotalTime(calculateTotalTime(cachedSessions))
            }
          }
        } catch (e) {
          // Ignore cache errors
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    sessions,
    averages,
    trends,
    streak,
    improvements,
    insights,
    totalTime,
    loading,
    error,
  }
}

