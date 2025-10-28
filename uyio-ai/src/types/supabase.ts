/**
 * Database type definitions for Supabase
 * These will be auto-generated from your Supabase schema later
 * For now, we'll define the basic types for the app
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      scenarios: {
        Row: Scenario
        Insert: Omit<Scenario, 'id' | 'created_at'>
        Update: Partial<Omit<Scenario, 'id' | 'created_at'>>
      }
      sessions: {
        Row: Session
        Insert: Omit<Session, 'id' | 'created_at'>
        Update: Partial<Omit<Session, 'id' | 'created_at'>>
      }
    }
    Views: {
      [_: string]: never
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
    }
  }
}

/**
 * User Profile
 */
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at?: string
}

/**
 * Learning Scenario
 */
export interface Scenario {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  language: string
  category: string
  created_at: string
  updated_at?: string
}

/**
 * Practice Session
 */
export interface Session {
  id: string
  user_id: string
  scenario_id: string
  audio_url?: string
  transcript?: string
  feedback?: string
  score?: number
  duration_seconds?: number
  created_at: string
  completed_at?: string
}

/**
 * Helper Types
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']


