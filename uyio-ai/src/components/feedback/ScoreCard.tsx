// src/components/feedback/ScoreCard.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react'
import { useAnimatedScore } from '@/hooks/useAnimatedScore'

interface ScoreCardProps {
  metric: string
  score: number
  
  // For objective metrics (pacing, fillers):
  objectiveData?: {
    primaryMetric: string    // "155 words/minute" or "8 filler words (3.2%)"
    checkmarks: string[]     // ["Perfect pace", "Consistent energy"]
    tip: string              // Simple actionable tip
  }
  
  // For qualitative metrics (clarity, confidence, logic):
  qualitativeData?: {
    strengths: string[]      // ["Clear main point", "Good examples"]
    weakness?: string        // "Middle section wandered" (optional)
    tip: string              // Simple actionable tip
  }
  
  delay?: number
}

export function ScoreCard({ metric, score, objectiveData, qualitativeData, delay = 0 }: ScoreCardProps) {
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
        
        {/* Primary metric preview (for objective data) */}
        {objectiveData && !isExpanded && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {objectiveData.primaryMetric}
          </p>
        )}
        
        {!objectiveData && !isExpanded && (
          <p className="text-xs text-gray-500 dark:text-gray-400">out of 10</p>
        )}
      </div>

      {/* Expandable tip button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-3 space-y-3 animate-fadeIn">
          {/* Objective data (pacing, fillers) */}
          {objectiveData && (
            <>
              {/* Primary metric */}
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {objectiveData.primaryMetric}
                  </p>
                  {objectiveData.checkmarks.map((check, idx) => (
                    <p key={idx} className="text-gray-600 dark:text-gray-400 mt-1">
                      {check}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Tip */}
              <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <span className="text-lg flex-shrink-0">💡</span>
                <p className="text-blue-900 dark:text-blue-200">
                  {objectiveData.tip}
                </p>
              </div>
            </>
          )}

          {/* Qualitative data (clarity, confidence, logic) */}
          {qualitativeData && (
            <>
              {/* Strengths */}
              {qualitativeData.strengths.map((strength, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">{strength}</p>
                </div>
              ))}
              
              {/* Weakness */}
              {qualitativeData.weakness && (
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300">{qualitativeData.weakness}</p>
                </div>
              )}
              
              {/* Tip */}
              <div className="flex items-start gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <span className="text-lg flex-shrink-0">💡</span>
                <p className="text-blue-900 dark:text-blue-200">
                  {qualitativeData.tip}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
