// src/lib/db/scenarios.ts
import { createClient } from '@/lib/supabase/client'
import { withErrorHandling, withRetry, NotFoundError } from './errors'
import type { ScenarioDB, ScenarioInput } from '@/types/database'

export async function createScenario(data: ScenarioInput): Promise<ScenarioDB> {
  return withRetry(async () => {
    const supabase = createClient()
    const { data: scenario, error } = await supabase
      .from('scenarios')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(`Failed to create scenario: ${error.message}`)
    return scenario as ScenarioDB
  })
}

export async function getScenario(scenarioId: string): Promise<ScenarioDB | null> {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to fetch scenario: ${error.message}`)
    }

    // Increment usage count
    await incrementUsageCount(scenarioId)
    return data as ScenarioDB
  }, 'getScenario')
}

export async function getUserScenarios(userId: string): Promise<ScenarioDB[]> {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch user scenarios: ${error.message}`)
    return (data as ScenarioDB[]) || []
  }, 'getUserScenarios')
}

export async function incrementUsageCount(scenarioId: string): Promise<void> {
  const supabase = createClient()
  await supabase.rpc('increment_scenario_usage', { scenario_id: scenarioId })
}

export async function getMostUsedScenarios(limit: number = 10): Promise<ScenarioDB[]> {
  return withErrorHandling(async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('scenarios')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Failed to fetch popular scenarios: ${error.message}`)
    return (data as ScenarioDB[]) || []
  }, 'getMostUsedScenarios')
}

