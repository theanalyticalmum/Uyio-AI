// src/components/feedback/OverallSummary.tsx
import { Sparkles, TrendingUp } from 'lucide-react'

interface OverallSummaryProps {
  summary: string
  previousScore?: number
  currentScore: number
}

export function OverallSummary({ summary, previousScore, currentScore }: OverallSummaryProps) {
  const improvement = previousScore ? currentScore - previousScore : null
  const hasImproved = improvement !== null && improvement > 0

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-start gap-4">
        {/* Coach Avatar */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Your AI Coach Says:
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {summary}
          </p>

          {/* Improvement Indicator */}
          {hasImproved && improvement && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 dark:text-green-300 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              <span>+{improvement.toFixed(1)} points from last session!</span>
            </div>
          )}

          {previousScore === undefined && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              This is your first session. Keep practicing to track your improvement!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

