// src/components/progress/WeeklyReport.tsx
import { Lightbulb } from 'lucide-react'

interface WeeklyReportProps {
  insights: string[]
  sessionsThisWeek: number
  averageScoreThisWeek: number
}

export function WeeklyReport({ insights, sessionsThisWeek, averageScoreThisWeek }: WeeklyReportProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-500 rounded-lg">
          <Lightbulb className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Insights</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">This Week</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionsThisWeek}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">sessions</p>
        </div>
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{averageScoreThisWeek.toFixed(1)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">out of 10</p>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <span className="text-blue-500 mt-0.5">•</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

