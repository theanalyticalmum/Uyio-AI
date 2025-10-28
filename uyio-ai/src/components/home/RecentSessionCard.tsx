'use client'

import { useRouter } from 'next/navigation'
import { Clock, TrendingUp } from 'lucide-react'

interface RecentSessionCardProps {
  session: {
    id: string
    created_at: string
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
}

export function RecentSessionCard({ session }: RecentSessionCardProps) {
  const router = useRouter()
  
  // Calculate overall score
  const overallScore = (
    (session.scores.clarity +
      session.scores.confidence +
      session.scores.logic +
      session.scores.pacing +
      session.scores.fillers) /
    5
  ).toFixed(1)

  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    if (score >= 5) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  }

  // Format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Get context emoji
  const getContextEmoji = (context?: string) => {
    switch (context) {
      case 'professional': return '💼'
      case 'interview': return '🎯'
      case 'presentation': return '📊'
      case 'social': return '👥'
      case 'sales': return '💰'
      default: return '🎙️'
    }
  }

  return (
    <button
      onClick={() => router.push(`/progress?sessionId=${session.id}`)}
      className="w-full bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{getContextEmoji(session.scenario?.context)}</span>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
              {session.scenario?.objective || 'Practice Session'}
            </h4>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              <span>{getRelativeTime(session.created_at)}</span>
            </div>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full font-bold text-lg ${getScoreColor(parseFloat(overallScore))}`}>
          {overallScore}
        </div>
      </div>

      {/* Score bars */}
      <div className="grid grid-cols-5 gap-1 mt-3">
        {Object.entries(session.scores).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  value >= 7
                    ? 'bg-green-500'
                    : value >= 5
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${(value / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize text-center">
              {key.slice(0, 3)}
            </p>
          </div>
        ))}
      </div>
    </button>
  )
}

