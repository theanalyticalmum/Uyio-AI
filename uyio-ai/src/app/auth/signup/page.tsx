'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthForm } from '@/components/auth/AuthForm'
import { GoalCard } from '@/components/auth/GoalCard'
import { signUp } from '@/lib/auth/actions'
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

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [selectedGoal, setSelectedGoal] = useState<Goal>('clarity')
  const [practiceLength, setPracticeLength] = useState(90)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [isGuestConverting, setIsGuestConverting] = useState(false)
  const [guestSessionCount, setGuestSessionCount] = useState(0)

  // Check if user is converting from guest
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const guestData = localStorage.getItem('uyio_guest_session')
      if (guestData) {
        const session = JSON.parse(guestData)
        setIsGuestConverting(true)
        setGuestSessionCount(session.sessionCount || 0)
      }
    }
  }, [])

  const handleEmailSubmit = async (emailInput: string) => {
    setEmail(emailInput)
    setStep(2)
  }

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setLoading(true)

    const result = await signUp(email, {
      display_name: displayName,
      primary_goal: selectedGoal,
      practice_length_sec: practiceLength,
    })

    setLoading(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    setSent(true)
    toast.success('Check your email to complete signup!')
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Check your email!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">Click it to complete your signup and start practicing!</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Uyio AI</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isGuestConverting
              ? "Welcome back! Let's save your progress"
              : 'Master communication in just 90 seconds a day'}
          </p>
          {isGuestConverting && guestSessionCount > 0 && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              🎉 You've already completed {guestSessionCount} session{guestSessionCount !== 1 ? 's' : ''}!
            </p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          {step === 1 ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Get started</h2>
              <AuthForm
                type="signup"
                onSubmit={handleEmailSubmit}
                submitText="Get Started"
                footerLink={{
                  text: 'Already have an account?',
                  linkText: 'Login',
                  href: '/auth/login',
                }}
              />
            </>
          ) : (
            <form onSubmit={handleCompleteSetup} className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Customize your experience</h2>
                <p className="text-gray-600 dark:text-gray-400">Help us personalize your coaching journey</p>
              </div>

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
                  What's your primary goal?
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
                {loading ? 'Setting up...' : 'Complete Setup'}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Back to email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

