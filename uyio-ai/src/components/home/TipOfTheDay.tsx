'use client'

import { useState, useEffect } from 'react'
import { Lightbulb, RefreshCw } from 'lucide-react'

interface TipOfTheDayProps {
  initialTip: string
}

const ALL_TIPS = [
  'Pause before key points for emphasis and clarity.',
  'Use the "Rule of Three" to organize your thoughts.',
  'Smile while speaking - it changes your voice tone!',
  'Record yourself and listen back to identify patterns.',
  'Practice with a timer to build comfort with time limits.',
  'Replace "um" with silence - pauses show confidence.',
  'Stand or sit up straight to improve breath control.',
  'Visualize success before starting your practice.',
  'Focus on one improvement area per session.',
  'Tell stories - they make your points memorable.',
  'Match your energy to your message\'s importance.',
  'End with a strong conclusion, not a trailing voice.',
  'Practice difficult words before your session.',
  'Use hand gestures even in audio practice.',
  'Warm up your voice with simple scales or humming.',
]

export function TipOfTheDay({ initialTip }: TipOfTheDayProps) {
  const [tip, setTip] = useState(initialTip)
  const [isAnimating, setIsAnimating] = useState(false)

  const getNextTip = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const currentIndex = ALL_TIPS.indexOf(tip)
      const nextIndex = (currentIndex + 1) % ALL_TIPS.length
      setTip(ALL_TIPS[nextIndex])
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('uyio_last_tip', ALL_TIPS[nextIndex])
      }
      
      setIsAnimating(false)
    }, 200)
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">💡 Tip of the Day</h3>
          <p
            className={`text-gray-700 dark:text-gray-300 transition-opacity duration-200 ${
              isAnimating ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {tip}
          </p>

          <button
            onClick={getNextTip}
            className="mt-4 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Next tip
          </button>
        </div>
      </div>
    </div>
  )
}


