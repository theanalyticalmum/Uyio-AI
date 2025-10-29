'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, signOut } from '@/lib/auth/actions'
import { getProfile } from '@/lib/db/profiles'
import { User, Target, Clock, LogOut, Loader2, Save, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Profile } from '@/types/database'

type Goal = 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'

const GOALS = [
  {
    value: 'clarity' as Goal,
    title: 'Clarity',
    description: 'Speak with precision and clear articulation',
    icon: '🎯',
  },
  {
    value: 'confidence' as Goal,
    title: 'Confidence',
    description: 'Project authority and conviction',
    icon: '⚡',
  },
  {
    value: 'persuasion' as Goal,
    title: 'Persuasion',
    description: 'Make compelling arguments',
    icon: '💬',
  },
  {
    value: 'fillers' as Goal,
    title: 'Reduce Fillers',
    description: 'Eliminate ums, ahs, and likes',
    icon: '🚫',
  },
  {
    value: 'quick_thinking' as Goal,
    title: 'Quick Thinking',
    description: 'Think and respond on your feet',
    icon: '💡',
  },
]

const PRACTICE_LENGTHS = [
  { value: 60, label: '60 seconds' },
  { value: 90, label: '90 seconds' },
  { value: 120, label: '2 minutes' },
  { value: 180, label: '3 minutes' },
]

export default function SettingsPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState<Goal>('clarity')
  const [practiceLength, setPracticeLength] = useState(90)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      const profileData = await getProfile(user.id)
      if (!profileData) {
        router.push('/auth/onboarding')
        return
      }

      setProfile(profileData)
      setDisplayName(profileData.display_name || '')
      setPrimaryGoal(profileData.primary_goal || 'clarity')
      setPracticeLength(profileData.practice_length_sec || 90)
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error('Name cannot be empty')
      return
    }

    setSaving(true)

    const result = await updateProfile({
      display_name: displayName.trim(),
      primary_goal: primaryGoal,
      practice_length_sec: practiceLength,
    })

    if (result.error) {
      toast.error(result.error)
      setSaving(false)
      return
    }

    toast.success('Settings saved successfully!')
    setHasChanges(false)
    setSaving(false)
    
    // Reload profile to get fresh data
    await loadProfile()
  }

  const handleSignOut = async () => {
    await signOut()
  }

  // Track changes
  useEffect(() => {
    if (!profile) return
    
    const changed = 
      displayName !== (profile.display_name || '') ||
      primaryGoal !== profile.primary_goal ||
      practiceLength !== profile.practice_length_sec

    setHasChanges(changed)
  }, [displayName, primaryGoal, practiceLength, profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
                  {profile?.id ? '••••••••' : 'Not available'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Email cannot be changed
                </p>
              </div>
            </div>
          </div>

          {/* Goal Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Target className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Primary Goal</h2>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Your primary goal helps us personalize your daily challenges and feedback.
            </p>

            <div className="space-y-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.value}
                  onClick={() => setPrimaryGoal(goal.value)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${
                      primaryGoal === goal.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">{goal.title}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{goal.description}</div>
                    </div>
                    {primaryGoal === goal.value && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Practice Length Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Default Practice Length
              </h2>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose your preferred practice session duration.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRACTICE_LENGTHS.map((length) => (
                <button
                  key={length.value}
                  onClick={() => setPracticeLength(length.value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 font-medium transition-all
                    ${
                      practiceLength === length.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
                    }
                  `}
                >
                  {length.label}
                </button>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
            </div>

            <button
              onClick={handleSignOut}
              className="px-6 py-3 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Save Button - Fixed at bottom on mobile */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:static sm:mt-6 sm:bg-transparent sm:border-0 sm:p-0">
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`
              w-full px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2
              ${
                hasChanges && !saving
                  ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {hasChanges ? 'Save Changes' : 'No Changes'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

