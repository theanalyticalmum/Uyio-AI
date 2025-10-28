import { NextResponse } from 'next/server'
import { getDailyChallenge } from '@/lib/scenarios/generator'
import { createClient } from '@/lib/supabase/server'
import type { Goal } from '@/types/scenario'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const goal = searchParams.get('goal') as Goal | null

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If user is authenticated, use their primary goal
    let userGoal = goal

    if (user && !userGoal) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('primary_goal')
        .eq('id', user.id)
        .single()

      if (profile?.primary_goal) {
        userGoal = profile.primary_goal as Goal
      }
    }

    // Generate daily challenge
    const scenario = getDailyChallenge(userGoal || undefined)

    // Check if user has completed today's challenge
    let completed = false
    if (user) {
      const today = new Date().toISOString().split('T')[0]
      const { data: dailyScenario } = await supabase
        .from('daily_scenarios')
        .select('status')
        .eq('user_id', user.id)
        .eq('for_date', today)
        .single()

      completed = dailyScenario?.status === 'completed'
    }

    return NextResponse.json({
      success: true,
      scenario,
      completed,
      isAuthenticated: !!user,
    })
  } catch (error) {
    console.error('Error getting daily challenge:', error)
    return NextResponse.json(
      { error: 'Failed to get daily challenge' },
      { status: 500 }
    )
  }
}


