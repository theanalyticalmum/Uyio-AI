import { createClient } from '@/lib/supabase/server'
import { GuestHero } from '@/components/home/GuestHero'
import { UserDashboard } from '@/components/home/UserDashboard'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated, show guest hero
  if (!user) {
    return <GuestHero />
  }

  // If authenticated, show user dashboard (handles its own data fetching)
  return <UserDashboard />
}
