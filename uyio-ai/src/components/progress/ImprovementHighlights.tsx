// src/components/progress/ImprovementHighlights.tsx
'use client'

import { useState } from 'react'
import { X, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Improvement } from '@/lib/stats/calculator'

interface ImprovementHighlightsProps {
  improvements: Improvement[]
}

export function ImprovementHighlights({ improvements }: ImprovementHighlightsProps) {
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  if (improvements.length === 0) {
    return null
  }

  const handleDismiss = (index: number) => {
    setDismissed((prev) => new Set(prev).add(index))
  }

  const handleShare = (improvement: Improvement) => {
    const text = `${improvement.icon} ${improvement.message} #UyioAI #CommunicationSkills`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    }
  }

  const visibleImprovements = improvements.filter((_, index) => !dismissed.has(index))

  if (visibleImprovements.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {visibleImprovements.map((improvement, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-sm animate-slide-up"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <span className="text-3xl">{improvement.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {improvement.metric} Improvement!
                </h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{improvement.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare(improvement)}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Share achievement"
              >
                <Share2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </button>
              <button
                onClick={() => handleDismiss(index)}
                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

