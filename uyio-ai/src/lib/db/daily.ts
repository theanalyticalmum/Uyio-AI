// src/lib/db/daily.ts
import { createClient } from '@/lib/supabase/client'
import { withErrorHandling, withRetry } from './errors'
import type { DailyScenario } from '@/types/database'

export async function getTodaysChallenge(userId: string): Promise<DailyScenario | null> {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('daily_scenarios')
      .select('*, scenario:scenarios(*)')
      .eq('user_id', userId)
      .eq('for_date', today)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch daily challenge: ${error.message}`)
    }

    return data as DailyScenario
  }, 'getTodaysChallenge')
}

export async function createDailyChallenge(userId: string, scenarioId: string): Promise<DailyScenario> {
  return withRetry(async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error} = await supabase
      .from('daily_scenarios')
      .insert({
        user_id: userId,
        scenario_id: scenarioId,
        for_date: today,
        status: 'new',
      })
      .select('*, scenario:scenarios(*)')
      .single()

    if (error) throw new Error(`Failed to create daily challenge: ${error.message}`)
    return data as DailyScenario
  })
}

export async function completeDailyChallenge(userId: string): Promise<void> {
  return withRetry(async () => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('daily_scenarios')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('for_date', today)

    if (error) throw new Error(`Failed to complete daily challenge: ${error.message}`)
  })
}

export async function getDailyChallengeStreak(userId: string): Promise<number> {
  return withErrorHandling(async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('daily_scenarios')
      .select('for_date, status')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('for_date', { ascending: false })

    if (error) throw new Error(`Failed to fetch daily streak: ${error.message}`)

    if (!data || data.length === 0) return 0

    // Count consecutive days
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < data.length; i++) {
      const expectedDate = new Date(today)
      expectedDate.setDate(expectedDate.getDate() - i)
      const expectedDateStr = expectedDate.toISOString().split('T')[0]

      if (data[i].for_date === expectedDateStr) {
        streak++
      } else {
        break
      }
    }

    return streak
  }, 'getDailyChallengeStreak')
}

