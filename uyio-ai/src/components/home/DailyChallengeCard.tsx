'use client'

import { useRouter } from 'next/navigation'
import { Calendar, Clock, Zap, CheckCircle, Loader2 } from 'lucide-react'
import type { Scenario } from '@/types/scenario'

interface DailyChallengeCardProps {
  scenario: Scenario | null
  completed?: boolean
  loading?: boolean
}

export function DailyChallengeCard({ scenario, completed, loading }: DailyChallengeCardProps) {
  const router = useRouter()

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="text-xl font-bold">Today's Challenge</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="text-xl font-bold">Today's Challenge</h3>
        </div>
        <p className="text-white/80 mb-4">
          No challenge available today. Come back tomorrow!
        </p>
      </div>
    )
  }

  if (completed) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 shadow-lg text-white">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5" />
          <h3 className="text-xl font-bold">Challenge Complete!</h3>
        </div>
        <p className="text-white/90 mb-2">
          Great job! You've completed today's challenge.
        </p>
        <p className="text-sm text-white/70">
          Come back tomorrow for a new challenge
        </p>
      </div>
    )
  }

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500',
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl p-6 shadow-lg text-white relative overflow-hidden">
      {/* Decorative Element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" />
          <h3 className="text-xl font-bold">Today's Challenge</h3>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[scenario.difficulty as keyof typeof difficultyColors] || difficultyColors.medium}`}>
            {scenario.difficulty}
          </span>
        </div>

        <h4 className="text-2xl font-bold mb-3">
          {scenario.objective}
        </h4>

        <p className="text-white/90 mb-4 line-clamp-2">
          {scenario.prompt_text}
        </p>

        <div className="flex items-center gap-4 text-sm text-white/80 mb-6">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(scenario.time_limit_sec / 60)} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span className="capitalize">{scenario.goal}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/practice?daily=true')}
          className="w-full bg-white text-purple-600 font-bold py-3 rounded-lg hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Start Challenge
        </button>
      </div>
    </div>
  )
}
