import { StatsCard } from './StatsCard'
import { StreakIndicator } from './StreakIndicator'
import { DailyChallengeCard } from './DailyChallengeCard'
import { QuickPracticeCard } from './QuickPracticeCard'
import { RecentSessionsList } from './RecentSessionsList'
import { TipOfTheDay } from './TipOfTheDay'
import type { UserStats, DailyChallenge, RecentSession } from '@/lib/api/dashboard'

interface UserDashboardProps {
  userName: string
  stats: UserStats
  dailyChallenge: DailyChallenge | null
  recentSessions: RecentSession[]
  tipOfTheDay: string
}

export function UserDashboard({
  userName,
  stats,
  dailyChallenge,
  recentSessions,
  tipOfTheDay,
}: UserDashboardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {getGreeting()}, {userName}! 👋
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Ready for today's practice?</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <StatsCard label="Current Streak" value={stats.currentStreak} icon="🔥" color="amber" suffix=" days" />
        <StatsCard label="Total Sessions" value={stats.totalSessions} icon="🎯" color="blue" />
        <StatsCard label="Best Score" value={stats.bestScore.toFixed(1)} icon="⭐" color="purple" suffix="/10" />
        <StatsCard
          label="Improvement"
          value={stats.improvementPercent}
          icon="📈"
          color="green"
          suffix="%"
          trend={stats.improvementPercent > 0 ? 'up' : stats.improvementPercent < 0 ? 'down' : 'neutral'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Daily Challenge */}
          <DailyChallengeCard challenge={dailyChallenge} />

          {/* Recent Sessions */}
          <RecentSessionsList sessions={recentSessions} />
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Quick Practice */}
          <QuickPracticeCard />

          {/* Tip of the Day */}
          <TipOfTheDay initialTip={tipOfTheDay} />

          {/* Streak Indicator */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <StreakIndicator streak={stats.currentStreak} />
          </div>
        </div>
      </div>
    </div>
  )
}


