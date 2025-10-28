// src/components/home/DailyChallengeCard.tsx
'use client'

import { Sparkles, Clock, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Scenario } from '@/types/scenario'

interface DailyChallengeCardProps {
  scenario: Scenario | null
  completed?: boolean
}

export function DailyChallengeCard({ scenario, completed = false }: DailyChallengeCardProps) {
  const router = useRouter()

  if (!scenario) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold">Daily Challenge</h3>
        </div>
        <p className="text-blue-100 mb-4">Loading today's challenge...</p>
      </div>
    )
  }

  const difficultyColor = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  }[scenario.difficulty]

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-xl font-bold">Daily Challenge</h3>
        </div>
        {completed && (
          <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
            ✓ Completed
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <p className="text-lg font-medium leading-relaxed">{scenario.prompt_text}</p>
        <div className="flex items-center gap-4 text-sm text-blue-100">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{scenario.time_limit_sec}s</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="capitalize">{scenario.goal}</span>
          </div>
          <span className={`px-2 py-0.5 ${difficultyColor} rounded text-white text-xs font-semibold`}>
            {scenario.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      {!completed ? (
        <button
          onClick={() => router.push(`/practice?scenario=${scenario.id}&daily=true`)}
          className="w-full bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Start Daily Challenge
        </button>
      ) : (
        <button
          onClick={() => router.push('/progress')}
          className="w-full bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm"
        >
          View Results
        </button>
      )}
    </div>
  )
}
