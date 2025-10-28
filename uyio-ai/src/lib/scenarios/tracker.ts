'use client'

/**
 * Track scenario usage locally to avoid repetition
 */

const STORAGE_KEY = 'uyio_scenario_history'
const MAX_HISTORY_DAYS = 7

interface ScenarioHistory {
  scenarioId: string
  usedAt: number
  userId?: string
}

/**
 * Mark scenario as used
 */
export function markScenarioUsed(scenarioId: string, userId?: string): void {
  if (typeof window === 'undefined') return

  const history = getScenarioHistory()
  history.push({
    scenarioId,
    usedAt: Date.now(),
    userId,
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/**
 * Get all scenario history
 */
export function getScenarioHistory(): ScenarioHistory[] {
  if (typeof window === 'undefined') return []

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const history: ScenarioHistory[] = JSON.parse(stored)
    // Filter out old entries
    const cutoff = Date.now() - MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000
    return history.filter((h) => h.usedAt > cutoff)
  } catch {
    return []
  }
}

/**
 * Get recently used scenario IDs
 */
export function getRecentlyUsedScenarios(limit = 10): string[] {
  const history = getScenarioHistory()
  return history
    .sort((a, b) => b.usedAt - a.usedAt)
    .slice(0, limit)
    .map((h) => h.scenarioId)
}

/**
 * Check if user has seen a scenario recently
 */
export function hasUserSeenScenario(scenarioId: string, daysBack = 7): boolean {
  const history = getScenarioHistory()
  const cutoff = Date.now() - daysBack * 24 * 60 * 60 * 1000

  return history.some((h) => h.scenarioId === scenarioId && h.usedAt > cutoff)
}

/**
 * Clear old history
 */
export function clearOldHistory(): void {
  if (typeof window === 'undefined') return

  const history = getScenarioHistory()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

/**
 * Clear all history
 */
export function clearAllHistory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}


