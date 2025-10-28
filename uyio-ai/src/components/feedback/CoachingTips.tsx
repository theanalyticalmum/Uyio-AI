// src/components/feedback/CoachingTips.tsx
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb, Copy, Check, AlertCircle } from 'lucide-react'
import type { FeedbackScores, CoachingTips as CoachingTipsType } from '@/types/feedback'

interface CoachingTipsProps {
  coaching: CoachingTipsType
  scores: FeedbackScores
}

const metricIcons = {
  clarity: '🎯',
  confidence: '💪',
  logic: '🧠',
  pacing: '⏱️',
  fillers: '🚫',
}

export function CoachingTips({ coaching, scores }: CoachingTipsProps) {
  const [expandedTip, setExpandedTip] = useState<string | null>(null)
  const [copiedTip, setCopiedTip] = useState<string | null>(null)

  // Find the lowest score metric for "Most Important" badge
  const lowestMetric = Object.entries(scores).reduce((lowest, [key, value]) => {
    return value < scores[lowest as keyof FeedbackScores] ? key : lowest
  }, 'clarity')

  const handleCopy = (metric: string, tip: string) => {
    navigator.clipboard.writeText(`${metric}: ${tip}`)
    setCopiedTip(metric)
    setTimeout(() => setCopiedTip(null), 2000)
  }

  const toggleTip = (metric: string) => {
    setExpandedTip(expandedTip === metric ? null : metric)
  }

  const metrics = ['clarity', 'confidence', 'logic', 'pacing', 'fillers'] as const

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-yellow-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Personalized Coaching Tips
        </h3>
      </div>

      <div className="space-y-3">
        {metrics.map((metric) => {
          const isExpanded = expandedTip === metric
          const isLowest = metric === lowestMetric
          const score = scores[metric]

          return (
            <div
              key={metric}
              className={`border rounded-lg transition-all ${
                isLowest
                  ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
              }`}
            >
              <button
                onClick={() => toggleTip(metric)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{metricIcons[metric]}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {metric}
                      </h4>
                      {isLowest && (
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Focus Here
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Score: {score}/10
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 animate-fadeIn">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {coaching[metric]}
                  </p>
                  <button
                    onClick={() => handleCopy(metric, coaching[metric])}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    {copiedTip === metric ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Tip</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 Pro Tip:</strong> Focus on your lowest-scoring area first. Small improvements in weak areas lead to the biggest gains!
        </p>
      </div>
    </div>
  )
}

