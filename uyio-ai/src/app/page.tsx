import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { GuestHero } from '@/components/home/GuestHero'
import { UserDashboard } from '@/components/home/UserDashboard'
import { SkeletonLoader } from '@/components/common/SkeletonLoader'
import {
  getUserStats,
  getDailyChallenge,
  getRecentSessions,
  getTipOfTheDay,
} from '@/lib/api/dashboard'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated, show guest hero
  if (!user) {
    return <GuestHero />
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .single()

  // Fetch dashboard data
  const [stats, dailyChallenge, recentSessions] = await Promise.all([
    getUserStats(user.id),
    getDailyChallenge(user.id),
    getRecentSessions(user.id, 5),
  ])

  const tipOfTheDay = getTipOfTheDay()

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonLoader variant="text" className="w-64 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <SkeletonLoader variant="stat" count={4} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonLoader variant="card" className="h-48 mb-6" />
              <SkeletonLoader variant="card" className="h-64" />
            </div>
            <div>
              <SkeletonLoader variant="card" className="h-48 mb-6" />
              <SkeletonLoader variant="card" className="h-32" />
            </div>
          </div>
        </div>
      }
    >
      <UserDashboard
        userName={profile?.display_name || user.email?.split('@')[0] || 'User'}
        stats={stats}
        dailyChallenge={dailyChallenge}
        recentSessions={recentSessions}
        tipOfTheDay={tipOfTheDay}
      />
    </Suspense>
  )
}
