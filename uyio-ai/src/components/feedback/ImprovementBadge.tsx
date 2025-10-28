// src/components/feedback/ImprovementBadge.tsx
'use client'

import { Trophy, TrendingUp, Flame } from 'lucide-react'

interface ImprovementBadgeProps {
  currentScore: number
  previousBest?: number
  streak?: number
}

export function ImprovementBadge({ currentScore, previousBest, streak }: ImprovementBadgeProps) {
  const isNewBest = previousBest !== undefined && currentScore > previousBest
  const improvement = previousBest !== undefined ? currentScore - previousBest : 0
  const hasStreak = streak !== undefined && streak >= 3

  if (!isNewBest && !hasStreak) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* New Personal Best */}
      {isNewBest && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8" />
            <div>
              <h4 className="text-lg font-bold">🎯 New Personal Best!</h4>
              <p className="text-sm text-white/90">
                You scored {improvement.toFixed(1)} points higher than your previous best!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Streak Badge */}
      {hasStreak && (
        <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <Flame className="w-8 h-8 animate-pulse" />
            <div>
              <h4 className="text-lg font-bold">🔥 {streak}-Day Streak!</h4>
              <p className="text-sm text-white/90">
                You're on fire! Keep practicing to maintain your momentum.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* First Session Badge */}
      {previousBest === undefined && currentScore >= 7 && (
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            <div>
              <h4 className="text-lg font-bold">🌟 Strong Start!</h4>
              <p className="text-sm text-white/90">
                Great first session! You scored {currentScore}/10. Keep it up!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

