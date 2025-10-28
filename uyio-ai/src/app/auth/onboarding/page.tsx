'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GoalCard } from '@/components/auth/GoalCard'
import { createProfile } from '@/lib/auth/actions'
import { toast } from 'sonner'
import { Target, Zap, MessageSquare, Ban, Lightbulb } from 'lucide-react'

type Goal = 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'

const GOALS = [
  {
    value: 'clarity' as Goal,
    icon: Target,
    title: 'Clarity',
    description: 'Speak with precision and clear articulation',
  },
  {
    value: 'confidence' as Goal,
    icon: Zap,
    title: 'Confidence',
    description: 'Project authority and conviction',
  },
  {
    value: 'persuasion' as Goal,
    icon: MessageSquare,
    title: 'Persuasion',
    description: 'Make compelling arguments',
  },
  {
    value: 'fillers' as Goal,
    icon: Ban,
    title: 'Reduce Fillers',
    description: 'Eliminate ums, ahs, and likes',
  },
  {
    value: 'quick_thinking' as Goal,
    icon: Lightbulb,
    title: 'Quick Thinking',
    description: 'Think and respond on your feet',
  },
]

const PRACTICE_LENGTHS = [
  { value: 60, label: '60 seconds' },
  { value: 90, label: '90 seconds' },
  { value: 120, label: '2 minutes' },
  { value: 180, label: '3 minutes' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [selectedGoal, setSelectedGoal] = useState<Goal>('clarity')
  const [practiceLength, setPracticeLength] = useState(90)
  const [loading, setLoading] = useState(false)

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)

    const result = await createProfile({
      display_name: displayName,
      primary_goal: selectedGoal,
      practice_length_sec: practiceLength,
    })

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Welcome to Uyio AI! 🎉')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Uyio AI! 🎉</h1>
          <p className="text-gray-600 dark:text-gray-400">Let&apos;s personalize your experience</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          <form onSubmit={handleComplete} className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What should we call you?
              </label>
              <input
                id="name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                What&apos;s your primary goal?
              </label>
              <div className="space-y-3">
                {GOALS.map((goal) => (
                  <GoalCard
                    key={goal.value}
                    icon={goal.icon}
                    title={goal.title}
                    description={goal.description}
                    value={goal.value}
                    selected={selectedGoal === goal.value}
                    onClick={() => setSelectedGoal(goal.value)}
                  />
                ))}
              </div>
            </div>

            {/* Practice Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Default practice length
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PRACTICE_LENGTHS.map((length) => (
                  <button
                    key={length.value}
                    type="button"
                    onClick={() => setPracticeLength(length.value)}
                    className={`
                      px-4 py-3 rounded-lg border-2 font-medium transition-all
                      ${
                        practiceLength === length.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'
                      }
                    `}
                  >
                    {length.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up...' : 'Start Practicing'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}


