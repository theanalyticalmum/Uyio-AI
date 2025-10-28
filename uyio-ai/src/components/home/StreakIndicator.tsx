'use client'

interface StreakIndicatorProps {
  streak: number
}

export function StreakIndicator({ streak }: StreakIndicatorProps) {
  const getFireEmoji = () => {
    if (streak === 0) return '💤'
    if (streak <= 3) return '🔥'
    if (streak <= 7) return '🔥🔥'
    return '🔥🔥🔥'
  }

  const getMessage = () => {
    if (streak === 0) return 'Start your streak today!'
    if (streak === 1) return 'Great start! Come back tomorrow!'
    if (streak <= 3) return 'Keep it going!'
    if (streak <= 7) return "You're on fire!"
    if (streak <= 14) return 'Incredible dedication!'
    return 'Legendary streak! 🏆'
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-3xl">{getFireEmoji()}</span>
      <div>
        <p className="text-xl font-bold text-gray-900 dark:text-white">{streak} day streak</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{getMessage()}</p>
      </div>
    </div>
  )
}


