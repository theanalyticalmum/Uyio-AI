'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

type Goal = 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'

export function QuickPracticeCard() {
  const [selectedGoal, setSelectedGoal] = useState<Goal>('clarity')
  const [duration, setDuration] = useState(90)

  const goals: { value: Goal; label: string }[] = [
    { value: 'clarity', label: 'Clarity' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'persuasion', label: 'Persuasion' },
    { value: 'fillers', label: 'Reduce Fillers' },
    { value: 'quick_thinking', label: 'Quick Thinking' },
  ]

  const durations = [
    { value: 60, label: '60s' },
    { value: 90, label: '90s' },
    { value: 120, label: '2m' },
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Practice</h3>
      </div>

      {/* Goal Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Choose your focus
        </label>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value as Goal)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          {goals.map((goal) => (
            <option key={goal.value} value={goal.value}>
              {goal.label}
            </option>
          ))}
        </select>
      </div>

      {/* Duration Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          {durations.map((d) => (
            <button
              key={d.value}
              onClick={() => setDuration(d.value)}
              className={`py-2 px-4 rounded-lg font-medium transition-all ${
                duration === d.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <Link
        href={`/practice?goal=${selectedGoal}&duration=${duration}`}
        className="block w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-center transition-colors"
      >
        Start Practice
      </Link>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
        Last practice: 2 hours ago
      </p>
    </div>
  )
}


