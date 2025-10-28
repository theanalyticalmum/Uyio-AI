import type { Scenario, Goal, Context, Difficulty, ScenarioFilters } from '@/types/scenario'
import { SCENARIO_TEMPLATES } from './templates'
import { getRecentlyUsedScenarios } from './tracker'

/**
 * Generate a scenario based on filters
 */
export function generateScenario(filters: ScenarioFilters = {}): Scenario {
  let filteredScenarios = [...SCENARIO_TEMPLATES]

  // Apply goal filter
  if (filters.goal) {
    filteredScenarios = filteredScenarios.filter((s) => s.goal === filters.goal)
  }

  // Apply context filter
  if (filters.context) {
    filteredScenarios = filteredScenarios.filter((s) => s.context === filters.context)
  }

  // Apply difficulty filter
  if (filters.difficulty) {
    filteredScenarios = filteredScenarios.filter((s) => s.difficulty === filters.difficulty)
  }

  // Avoid recently used scenarios if possible
  const recentlyUsed = getRecentlyUsedScenarios(5)
  const notRecentlyUsed = filteredScenarios.filter((s) => !recentlyUsed.includes(s.id))

  // Use not-recently-used if available, otherwise use all filtered
  const availableScenarios = notRecentlyUsed.length > 0 ? notRecentlyUsed : filteredScenarios

  // If no scenarios match, return a random one
  if (availableScenarios.length === 0) {
    return getRandomScenario()
  }

  // Return random scenario from filtered results
  const randomIndex = Math.floor(Math.random() * availableScenarios.length)
  return availableScenarios[randomIndex]
}

/**
 * Get daily challenge based on date and user goal
 */
export function getDailyChallenge(goal?: Goal): Scenario {
  // Use date as seed for consistent daily selection
  const today = new Date()
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  )

  // Filter by goal if provided
  let scenarios = goal
    ? SCENARIO_TEMPLATES.filter((s) => s.goal === goal)
    : SCENARIO_TEMPLATES

  // Use day of year as seed for pseudo-random selection
  const index = dayOfYear % scenarios.length
  return scenarios[index]
}

/**
 * Get a completely random scenario
 */
export function getRandomScenario(): Scenario {
  const randomIndex = Math.floor(Math.random() * SCENARIO_TEMPLATES.length)
  return SCENARIO_TEMPLATES[randomIndex]
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): Scenario | null {
  return SCENARIO_TEMPLATES.find((s) => s.id === id) || null
}

/**
 * Get scenarios by goal
 */
export function getScenariosByGoal(goal: Goal): Scenario[] {
  return SCENARIO_TEMPLATES.filter((s) => s.goal === goal)
}

/**
 * Get scenarios by context
 */
export function getScenariosByContext(context: Context): Scenario[] {
  return SCENARIO_TEMPLATES.filter((s) => s.context === context)
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty: Difficulty): Scenario[] {
  return SCENARIO_TEMPLATES.filter((s) => s.difficulty === difficulty)
}


