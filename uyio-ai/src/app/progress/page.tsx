// src/app/progress/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, TrendingUp, History, Lightbulb } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

import { useProgressData } from '@/hooks/useProgressData'
import { FilterBar, type ProgressFilters } from '@/components/progress/FilterBar'
import { StatsOverview } from '@/components/progress/StatsOverview'
import { ImprovementHighlights } from '@/components/progress/ImprovementHighlights'
import { ProgressChart } from '@/components/progress/ProgressChart'
import { MetricCards } from '@/components/progress/MetricCards'
import { SessionHistory } from '@/components/progress/SessionHistory'
import { WeeklyReport } from '@/components/progress/WeeklyReport'

type TabType = 'overview' | 'history' | 'insights'

export default function ProgressPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [filters, setFilters] = useState<ProgressFilters>({
    dateRange: 30,
    scenarioType: 'all',
    goal: 'all',
  })

  const {
    sessions,
    averages,
    trends,
    streak,
    improvements,
    insights,
    totalTime,
    loading,
    error,
  } = useProgressData({
    dateRange: filters.dateRange,
    limit: 100,
  })

  // Check authentication with timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const checkAuth = async () => {
      try {
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.error('Auth check timeout on progress page')
          setIsAuthenticated(false)
          toast.error('Authentication check timed out. Please sign in.')
          router.push('/auth/login?redirect=/progress')
        }, 5000) // 5 second timeout
        
        const supabase = createClient()
        const { data, error: authError } = await supabase.auth.getUser()
        
        // Clear timeout if we got a response
        clearTimeout(timeoutId)

        if (authError) {
          console.error('Auth error on progress page:', authError)
          setIsAuthenticated(false)
          toast.error('Please sign in to view your progress')
          router.push('/auth/login?redirect=/progress')
          return
        }

        if (!data?.user) {
          setIsAuthenticated(false)
          toast.error('Please sign in to view your progress')
          router.push('/auth/login?redirect=/progress')
        } else {
          setIsAuthenticated(true)
        }
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Unexpected error during auth check:', err)
        setIsAuthenticated(false)
        toast.error('Failed to check authentication')
        router.push('/auth/login?redirect=/progress')
      }
    }
    
    checkAuth()
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId)
  }, [router])

  // Filter sessions based on filters
  const filteredSessions = sessions.filter((session) => {
    if (filters.scenarioType !== 'all' && session.scenario?.context !== filters.scenarioType) {
      return false
    }
    if (filters.goal !== 'all' && session.scenario?.goal !== filters.goal) {
      return false
    }
    return true
  })

  // Calculate stats for this week
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const sessionsThisWeek = filteredSessions.filter((s) => new Date(s.created_at) >= oneWeekAgo)
  const avgScoreThisWeek =
    sessionsThisWeek.length > 0
      ? sessionsThisWeek.reduce((sum, s) => {
          const avg =
            (s.scores.clarity + s.scores.confidence + s.scores.logic + s.scores.pacing + s.scores.fillers) / 5
          return sum + avg
        }, 0) / sessionsThisWeek.length
      : 0

  // Find best metric
  const bestMetric = Object.entries(averages)
    .filter(([key]) => key !== 'overall')
    .reduce((best, [key, value]) => {
      if (value > best.score) {
        return { name: key.charAt(0).toUpperCase() + key.slice(1), score: value }
      }
      return best
    }, { name: '', score: 0 })

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (isAuthenticated === false) {
    return null
  }

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Progress</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Track your communication skills improvement
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={setFilters} />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Stats Overview */}
            <StatsOverview
              totalSessions={filteredSessions.length}
              streak={streak}
              totalTime={totalTime}
              bestMetric={bestMetric.name ? bestMetric : undefined}
            />

            {/* Improvement Highlights */}
            {improvements.length > 0 && <ImprovementHighlights improvements={improvements} />}

            {/* Empty State */}
            {filteredSessions.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="max-w-md mx-auto">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No sessions yet!
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your first practice session to see your progress here.
                  </p>
                  <button
                    onClick={() => router.push('/practice')}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    Start Practicing
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            {filteredSessions.length > 0 && (
              <>
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="-mb-px flex space-x-8">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <>
                      <MetricCards averages={averages} trends={trends} />
                      <ProgressChart sessions={filteredSessions} />
                    </>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && <SessionHistory sessions={filteredSessions} />}

                  {/* Insights Tab */}
                  {activeTab === 'insights' && (
                    <WeeklyReport
                      insights={insights}
                      sessionsThisWeek={sessionsThisWeek.length}
                      averageScoreThisWeek={avgScoreThisWeek}
                    />
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

