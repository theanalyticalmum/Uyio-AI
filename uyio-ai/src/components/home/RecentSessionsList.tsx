'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import type { RecentSession } from '@/lib/api/dashboard'

interface RecentSessionsListProps {
  sessions: RecentSession[]
  loading?: boolean
}

export function RecentSessionsList({ sessions, loading }: RecentSessionsListProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Sessions</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm text-center">
        <div className="text-4xl mb-2">🎤</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          No sessions yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Complete your first session to see your progress!
        </p>
        <Link
          href="/practice"
          className="inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Start Practicing
        </Link>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    if (score >= 6) return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30'
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
        <Link
          href="/progress"
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Score */}
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${getScoreColor(
                session.overallScore
              )}`}
            >
              {session.overallScore.toFixed(1)}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white truncate">{session.scenarioTitle}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
              </p>
            </div>

            {/* Mini Bars */}
            <div className="flex gap-1">
              {Object.values(session.scores).map((score, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  style={{ height: '32px' }}
                >
                  <div
                    className="bg-blue-500 w-full rounded-full"
                    style={{ height: `${(score / 10) * 100}%`, marginTop: 'auto' }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


