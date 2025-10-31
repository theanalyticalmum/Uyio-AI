'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createActionClient } from '@/lib/supabase/server'

export interface ProfileData {
  display_name: string
  primary_goal: 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'
  practice_length_sec: number
}

export interface ProfileUpdate {
  display_name?: string
  primary_goal?: 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'
  practice_length_sec?: number
}

/**
 * Send magic link for passwordless login
 */
export async function signInWithEmail(email: string) {
  const supabase = await createActionClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

/**
 * Sign up new user and create profile
 */
export async function signUp(email: string, profileData: ProfileData) {
  const supabase = await createActionClient()

  // Send magic link
  const { error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  return { success: true, profileData }
}

/**
 * Create user profile after authentication
 */
export async function createProfile(profileData: ProfileData) {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    display_name: profileData.display_name,
    primary_goal: profileData.primary_goal,
    practice_length_sec: profileData.practice_length_sec,
    onboarding_completed: true,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = await createActionClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

/**
 * Get current authenticated user
 */
export async function getUser() {
  const supabase = await createActionClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Update user profile
 */
export async function updateProfile(data: ProfileUpdate) {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  // NO REDIRECT - just return success
  return { success: true }
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboarding() {
  const supabase = await createActionClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { completed: false }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  return { completed: profile?.onboarding_completed || false }
}


