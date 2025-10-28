// src/lib/db/profiles.ts
import { createClient } from '@/lib/supabase/client'
import { withErrorHandling, withRetry, NotFoundError, ValidationError } from './errors'
import type { Profile, ProfileInput, ProfileStats, Goal } from '@/types/database'

/**
 * Create a new user profile
 */
export async function createProfile(userId: string, data: ProfileInput): Promise<Profile> {
  return withRetry(async () => {
    const supabase = createClient()

    if (!data.display_name?.trim()) {
      throw new ValidationError('display_name', 'Display name is required')
    }

    const profileData = {
      id: userId,
      display_name: data.display_name.trim(),
      primary_goal: data.primary_goal,
      practice_length_sec: data.practice_length_sec || 90,
      onboarding_completed: true,
      total_sessions: 0,
      streak_count: 0,
      last_practice_date: null,
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`)
    }

    return profile as Profile
  })
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  return withErrorHandling(async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to fetch profile: ${error.message}`)
    }

    return data as Profile
  }, 'getProfile')
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'total_sessions' | 'streak_count'>>
): Promise<Profile> {
  return withRetry(async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update profile: ${error.message}`)
    }

    if (!data) {
      throw new NotFoundError('Profile', userId)
    }

    return data as Profile
  })
}

/**
 * Increment session count and update practice date
 */
export async function incrementSessionCount(userId: string): Promise<void> {
  return withRetry(async () => {
    const supabase = createClient()

    // Get current profile
    const profile = await getProfile(userId)
    if (!profile) {
      throw new NotFoundError('Profile', userId)
    }

    // Update streak
    const newStreak = await updateStreak(userId, profile.last_practice_date)

    // Increment session count
    const { error } = await supabase
      .from('profiles')
      .update({
        total_sessions: (profile.total_sessions || 0) + 1,
        last_practice_date: new Date().toISOString().split('T')[0],
        streak_count: newStreak,
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to increment session count: ${error.message}`)
    }
  })
}

/**
 * Calculate and update user streak
 */
export async function updateStreak(userId: string, lastPracticeDate: string | null): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  if (!lastPracticeDate) {
    // First session ever
    return 1
  }

  const lastDate = new Date(lastPracticeDate)
  const todayDate = new Date(today)
  const diffTime = todayDate.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Already practiced today, maintain streak
    const profile = await getProfile(userId)
    return profile?.streak_count || 1
  } else if (diffDays === 1) {
    // Practiced yesterday, increment streak
    const profile = await getProfile(userId)
    return (profile?.streak_count || 0) + 1
  } else {
    // Streak broken, reset to 1
    return 1
  }
}

/**
 * Get profile statistics
 */
export async function getProfileStats(userId: string): Promise<ProfileStats> {
  return withErrorHandling(async () => {
    const supabase = createClient()

    // Get all sessions for this user
    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('duration_sec, created_at, scenario_id, scenario:scenarios(goal)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch session stats: ${error.message}`)
    }

    if (!sessions || sessions.length === 0) {
      return {
        total_practice_time: 0,
        average_session_length: 0,
        most_practiced_goal: null,
        best_performing_metric: null,
        sessions_this_week: 0,
        sessions_this_month: 0,
      }
    }

    // Calculate total time
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration_sec || 0), 0)
    const avgLength = Math.round(totalTime / sessions.length)

    // Most practiced goal
    const goalCounts: Record<string, number> = {}
    sessions.forEach((s: any) => {
      const goal = s.scenario?.goal
      if (goal) {
        goalCounts[goal] = (goalCounts[goal] || 0) + 1
      }
    })
    const mostPracticedGoal = Object.entries(goalCounts).reduce(
      (max, [goal, count]) => (count > max.count ? { goal, count } : max),
      { goal: null as Goal | null, count: 0 }
    ).goal

    // Sessions this week/month
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const sessionsThisWeek = sessions.filter((s) => new Date(s.created_at) >= weekAgo).length
    const sessionsThisMonth = sessions.filter((s) => new Date(s.created_at) >= monthAgo).length

    return {
      total_practice_time: totalTime,
      average_session_length: avgLength,
      most_practiced_goal: mostPracticedGoal,
      best_performing_metric: null, // TODO: Calculate from scores
      sessions_this_week: sessionsThisWeek,
      sessions_this_month: sessionsThisMonth,
    }
  }, 'getProfileStats')
}

/**
 * Check if profile exists
 */
export async function profileExists(userId: string): Promise<boolean> {
  const profile = await getProfile(userId)
  return profile !== null
}

/**
 * Delete profile (soft delete - mark as inactive)
 */
export async function deleteProfile(userId: string): Promise<void> {
  return withRetry(async () => {
    const supabase = createClient()

    // In production, you might want to soft delete
    // For now, we'll just update a flag (you'd need to add this column)
    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: false }) // Mark as inactive
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete profile: ${error.message}`)
    }
  })
}

