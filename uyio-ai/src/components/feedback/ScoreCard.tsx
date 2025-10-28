// src/components/feedback/ScoreCard.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useAnimatedScore } from '@/hooks/useAnimatedScore'

interface ScoreCardProps {
  metric: string
  score: number
  tip: string
  delay?: number
}

export function ScoreCard({ metric, score, tip, delay = 0 }: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const animatedScore = useAnimatedScore(score, 1500)

  // Color coding based on score
  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-green-600 dark:text-green-400'
    if (s >= 5) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getRingColor = (s: number) => {
    if (s >= 8) return 'stroke-green-500'
    if (s >= 5) return 'stroke-yellow-500'
    return 'stroke-red-500'
  }

  const getBgColor = (s: number) => {
    if (s >= 8) return 'bg-green-50 dark:bg-green-900/10'
    if (s >= 5) return 'bg-yellow-50 dark:bg-yellow-900/10'
    return 'bg-red-50 dark:bg-red-900/10'
  }

  // Circle progress percentage
  const circumference = 2 * Math.PI * 45 // radius = 45
  const progress = (animatedScore / 10) * circumference

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Score Ring */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            {/* Progress circle */}
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className={`${getRingColor(score)} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          {/* Score number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
              {animatedScore}
            </span>
          </div>
        </div>

        {/* Metric name */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize mt-3">
          {metric}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">out of 10</p>
      </div>

      {/* Expandable tip */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>Coaching Tip</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className={`mt-3 p-3 rounded-lg ${getBgColor(score)} text-sm text-gray-700 dark:text-gray-300 animate-fadeIn`}>
          {tip}
        </div>
      )}
    </div>
  )
}

