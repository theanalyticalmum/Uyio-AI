'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, BarChart2, Target, TrendingUp, Mic, ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getProfile } from '@/lib/db/profiles'
import { getUserRecentSessions } from '@/lib/db/sessions'
import { getDailyChallenge } from '@/lib/scenarios/generator'
import { StatsCard } from './StatsCard'
import { DailyChallengeCard } from './DailyChallengeCard'
import { RecentSessionCard } from './RecentSessionCard'
import type { Scenario } from '@/types/scenario'
import type { Profile } from '@/types/database'

interface SessionData {
  id: string
  created_at: string
  is_daily_challenge?: boolean
  scenario?: {
    objective: string
    context: string
  }
  scores: {
    clarity: number
    confidence: number
    logic: number
    pacing: number
    fillers: number
  }
}

export function UserDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [dailyScenario, setDailyScenario] = useState<Scenario | null>(null)
  const [dailyChallengeCompleted, setDailyChallengeCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        // Load all data in parallel
        const [profileData, sessionsData] = await Promise.all([
          getProfile(user.id),
          getUserRecentSessions(user.id, 5),
        ])

        // If no profile exists, redirect to onboarding
        if (!profileData) {
          console.log('No profile found, redirecting to onboarding')
          router.push('/auth/onboarding')
          return
        }

        // Generate today's challenge scenario (deterministic based on date + goal)
        const scenario = getDailyChallenge(profileData.primary_goal)
        
        // Check if user already completed today's daily challenge
        // by looking for sessions with is_daily_challenge=true created today
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const todayISO = today.toISOString()
        
        const completedToday = sessionsData?.some(session => {
          const sessionDate = new Date(session.created_at)
          sessionDate.setHours(0, 0, 0, 0)
          return sessionDate.toISOString() === todayISO && session.is_daily_challenge
        }) || false
        
        const isCompleted = completedToday

        setProfile(profileData)
        setSessions(sessionsData || [])
        setDailyScenario(scenario)
        setDailyChallengeCompleted(isCompleted)
      } catch (err: any) {
        console.error('Failed to load dashboard:', err)
        setError(err?.message || 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  // Calculate stats
  const calculateAverageScore = () => {
    if (sessions.length === 0) return 0
    const totalScore = sessions.reduce((sum, session) => {
      const avg = (
        session.scores.clarity +
        session.scores.confidence +
        session.scores.logic +
        session.scores.pacing +
        session.scores.fillers
      ) / 5
      return sum + avg
    }, 0)
    return (totalScore / sessions.length).toFixed(1)
  }

  const calculateBestScore = () => {
    if (sessions.length === 0) return 0
    const scores = sessions.map(session => 
      (session.scores.clarity +
        session.scores.confidence +
        session.scores.logic +
        session.scores.pacing +
        session.scores.fillers) / 5
    )
    return Math.max(...scores).toFixed(1)
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => router.push('/auth/onboarding')}
              className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Early return ensures profile is not null here
  if (!profile) {
    return null
  }

  const averageScore = calculateAverageScore()
  const bestScore = calculateBestScore()
  const firstName = profile.display_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}, {firstName}! 👋
          </h1>
          {profile.streak_count > 0 && (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Flame className="w-5 h-5" />
              <span className="font-semibold">{profile.streak_count} day streak</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<BarChart2 className="w-6 h-6" />}
            label="Total Sessions"
            value={profile.total_sessions}
            color="blue"
          />
          <StatsCard
            icon={<Flame className="w-6 h-6" />}
            label="Current Streak"
            value={profile.streak_count}
            color="orange"
            sublabel={profile.streak_count === 0 ? 'Start today!' : 'Keep it going!'}
          />
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Average Score"
            value={sessions.length > 0 ? `${averageScore}/10` : '-'}
            color="purple"
          />
          <StatsCard
            icon={<Target className="w-6 h-6" />}
            label="Best Score"
            value={sessions.length > 0 ? `${bestScore}/10` : '-'}
            color="green"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Challenge */}
          <div className="lg:col-span-2">
            <DailyChallengeCard
              scenario={dailyScenario}
              completed={dailyChallengeCompleted}
              loading={false}
            />
          </div>

          {/* Quick Practice */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Quick Practice</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
              Practice any scenario at your own pace
            </p>
            <button
              onClick={() => router.push('/practice')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Practice
            </button>
            {sessions.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Last practice: {new Date(sessions[0].created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Sessions</h3>
            {sessions.length > 0 && (
              <button
                onClick={() => router.push('/progress')}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Mic className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No practice sessions yet
              </h4>
              <p className="text-gray-600 dark:text-gray-400">
                Complete a practice session or try today's challenge to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map(session => (
                <RecentSessionCard key={session.id} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
