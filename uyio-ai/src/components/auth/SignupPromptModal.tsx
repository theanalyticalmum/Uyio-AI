'use client'

import { useState } from 'react'
import { X, TrendingUp, Target, BookOpen, Zap } from 'lucide-react'
import { signUp } from '@/lib/auth/actions'
import { toast } from 'sonner'

interface SignupPromptModalProps {
  score?: number
  isOpen: boolean
  onClose: () => void
}

export function SignupPromptModal({ score, isOpen, onClose }: SignupPromptModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)

    const result = await signUp(email, {
      display_name: 'Guest User',
      primary_goal: 'clarity',
      practice_length_sec: 90,
    })

    if (result.error) {
      toast.error(result.error)
      setLoading(false)
      return
    }

    toast.success('Check your email to complete signup!')
    onClose()
  }

  const isHighScore = score && score >= 8

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Score Display */}
        {score && (
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-blue-500 mb-2">{score.toFixed(1)}/10</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {isHighScore ? 'Impressive! 🎉' : 'Great job! 🎉'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isHighScore
                ? "This was impressive! Don't lose this achievement."
                : "You're making great progress!"}
            </p>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Sign up to unlock:
          </h3>

          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Track your progress over time</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">See your improvement with charts and stats</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Personalized coaching</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI feedback based on your specific goals</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">7-Day Confidence Course</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Structured lessons to level up fast</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Unlimited daily practice</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">No limits on your learning journey</p>
            </div>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Free Account'}
          </button>
        </form>

        {/* Maybe Later */}
        <button
          onClick={onClose}
          className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mt-4"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}


