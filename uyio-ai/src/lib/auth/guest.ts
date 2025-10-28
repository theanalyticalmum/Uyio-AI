'use client'

/**
 * Guest Mode Utilities
 * Manages guest sessions without authentication
 */

export interface GuestSession {
  guestId: string
  sessionCount: number
  firstVisit: number
  lastPractice: number
  todaysSessions: number
  dailyResetAt: string // ISO date string
  bestScoreToday: number | null
  scores: Array<{
    timestamp: number
    clarity: number
    confidence: number
    overall: number
  }>
}

const GUEST_KEY = 'uyio_guest_session'
const MAX_DAILY_SESSIONS = 3

/**
 * Generate unique guest ID
 */
export function generateGuestId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `guest_${timestamp}_${random}`
}

/**
 * Initialize new guest session
 */
export function initGuestSession(): GuestSession {
  const session: GuestSession = {
    guestId: generateGuestId(),
    sessionCount: 0,
    firstVisit: Date.now(),
    lastPractice: Date.now(),
    todaysSessions: 0,
    dailyResetAt: new Date().toISOString().split('T')[0],
    bestScoreToday: null,
    scores: [],
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_KEY, JSON.stringify(session))
  }
  return session
}

/**
 * Get current guest session or create new one
 */
export function getGuestSession(): GuestSession {
  if (typeof window === 'undefined') {
    return initGuestSession()
  }

  const stored = localStorage.getItem(GUEST_KEY)
  if (!stored) {
    return initGuestSession()
  }

  const session: GuestSession = JSON.parse(stored)

  // Check if daily reset needed
  const today = new Date().toISOString().split('T')[0]
  if (session.dailyResetAt !== today) {
    session.todaysSessions = 0
    session.dailyResetAt = today
    session.bestScoreToday = null
    localStorage.setItem(GUEST_KEY, JSON.stringify(session))
  }

  return session
}

/**
 * Increment guest usage after practice
 */
export function incrementGuestUsage(): GuestSession {
  const session = getGuestSession()
  session.sessionCount += 1
  session.todaysSessions += 1
  session.lastPractice = Date.now()
  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_KEY, JSON.stringify(session))
  }
  return session
}

/**
 * Check if guest should be prompted to sign up
 */
export function shouldPromptSignup(): boolean {
  const session = getGuestSession()
  
  // Prompt after 3 total sessions
  if (session.sessionCount >= 3) {
    return true
  }

  // Prompt after high score (>8)
  if (session.bestScoreToday && session.bestScoreToday > 8) {
    return true
  }

  return false
}

/**
 * Check if guest can practice (under daily limit)
 */
export function canPracticeAsGuest(): boolean {
  const session = getGuestSession()
  return session.todaysSessions < MAX_DAILY_SESSIONS
}

/**
 * Get remaining sessions for today
 */
export function getRemainingSessionsToday(): number {
  const session = getGuestSession()
  return Math.max(0, MAX_DAILY_SESSIONS - session.todaysSessions)
}

/**
 * Save guest practice score
 */
export function saveGuestScore(scores: {
  clarity: number
  confidence: number
  overall: number
}): GuestSession {
  const session = getGuestSession()
  
  session.scores.push({
    timestamp: Date.now(),
    ...scores,
  })

  // Update best score
  if (!session.bestScoreToday || scores.overall > session.bestScoreToday) {
    session.bestScoreToday = scores.overall
  }

  // Keep only last 10 scores
  if (session.scores.length > 10) {
    session.scores = session.scores.slice(-10)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(GUEST_KEY, JSON.stringify(session))
  }
  return session
}

/**
 * Clear guest session data
 */
export function clearGuestSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(GUEST_KEY)
  }
}

/**
 * Get guest data for migration to user account
 */
export function getGuestDataForMigration() {
  const session = getGuestSession()
  return {
    guestId: session.guestId,
    totalSessions: session.sessionCount,
    scores: session.scores,
    firstVisit: new Date(session.firstVisit),
    lastPractice: new Date(session.lastPractice),
  }
}

/**
 * Check if user is in guest mode
 */
export function isGuestMode(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(GUEST_KEY) !== null
}

/**
 * Get time until daily reset (in milliseconds)
 */
export function getTimeUntilReset(): number {
  const now = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime() - now.getTime()
}

/**
 * Format time until reset as readable string
 */
export function formatTimeUntilReset(): string {
  const ms = getTimeUntilReset()
  const hours = Math.floor(ms / (1000 * 60 * 60))
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}


