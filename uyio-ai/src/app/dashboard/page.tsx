import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserDashboard } from '@/components/home/UserDashboard'

// Force dynamic rendering to always check authentication
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated, redirect to homepage
  if (!user) {
    redirect('/')
  }

  // User is authenticated, show dashboard
  return <UserDashboard />
}

