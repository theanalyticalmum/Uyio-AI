'use client'

import Link from 'next/link'
import { Badge } from '../common/Badge'
import { Clock, Target } from 'lucide-react'
import type { DailyChallenge } from '@/lib/api/dashboard'

interface DailyChallengeCardProps {
  challenge: DailyChallenge | null
  loading?: boolean
}

export function DailyChallengeCard({ challenge, loading }: DailyChallengeCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 sm:p-8 text-white animate-pulse">
        <div className="h-6 w-32 bg-white/20 rounded mb-4" />
        <div className="h-4 w-full bg-white/20 rounded mb-2" />
        <div className="h-4 w-3/4 bg-white/20 rounded mb-6" />
        <div className="h-12 w-full bg-white/30 rounded-lg" />
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 sm:p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No challenge available today</p>
      </div>
    )
  }

  const difficultyColors = {
    easy: 'success',
    medium: 'warning',
    hard: 'default',
  } as const

  const contextIcons = {
    work: '💼',
    social: '👥',
    everyday: '🗣️',
  }

  return (
    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 sm:p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold flex items-center gap-2">
          <Target className="w-6 h-6" />
          Daily Challenge
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4" />
          <span>2 min</span>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Badge variant={difficultyColors[challenge.difficulty]} size="sm">
          {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
        </Badge>
        <Badge variant="default" size="sm">
          {contextIcons[challenge.context]} {challenge.context.charAt(0).toUpperCase() + challenge.context.slice(1)}
        </Badge>
      </div>

      <p className="text-white/90 mb-6 line-clamp-2">{challenge.promptText}</p>

      <Link
        href={`/practice?challenge=${challenge.id}`}
        className="block w-full py-3 px-6 bg-white text-blue-600 font-semibold rounded-lg text-center hover:bg-blue-50 transition-colors"
      >
        Start Challenge
      </Link>
    </div>
  )
}


