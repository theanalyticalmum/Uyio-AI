// src/components/progress/StatsOverview.tsx
import { Calendar, Clock, Flame, Trophy, TrendingUp } from 'lucide-react'
import type { StreakData } from '@/lib/stats/calculator'

interface StatsOverviewProps {
  totalSessions: number
  streak: StreakData
  totalTime: { hours: number; minutes: number }
  bestMetric?: { name: string; score: number }
}

export function StatsOverview({ totalSessions, streak, totalTime, bestMetric }: StatsOverviewProps) {
  const stats = [
    {
      icon: Calendar,
      label: 'Total Sessions',
      value: totalSessions.toString(),
      color: 'blue',
    },
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${streak.currentStreak} days`,
      color: 'orange',
    },
    {
      icon: Clock,
      label: 'Total Practice',
      value: `${totalTime.hours}h ${totalTime.minutes}m`,
      color: 'purple',
    },
    {
      icon: Trophy,
      label: 'Best Streak',
      value: `${streak.bestStreak} days`,
      color: 'yellow',
    },
  ]

  if (bestMetric) {
    stats.push({
      icon: TrendingUp,
      label: 'Top Skill',
      value: `${bestMetric.name} (${bestMetric.score}/10)`,
      color: 'green',
    })
  }

  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]} mb-3`}>
              <Icon className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          </div>
        )
      })}
    </div>
  )
}

