'use client'

import { useEffect, useState } from 'react'
import { getGuestSession } from '@/lib/auth/guest'
import Link from 'next/link'
import { TrendingUp, Zap, Trophy } from 'lucide-react'

export function GuestDashboard() {
  const [sessionCount, setSessionCount] = useState(0)
  const [bestScore, setBestScore] = useState<number | null>(null)

  useEffect(() => {
    const session = getGuestSession()
    setSessionCount(session.todaysSessions)
    setBestScore(session.bestScoreToday)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Today's Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{sessionCount}/3</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Best Score</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {bestScore ? bestScore.toFixed(1) : '—'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Status</h3>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Guest Mode</p>
        </div>
      </div>

      {/* Practice Button */}
      <div className="text-center mb-12">
        <Link
          href="/practice/guest"
          className="inline-block px-12 py-4 bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          Start Practice
        </Link>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
          Unlock More with a Free Account
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">📈</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Progress Tracking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                See your improvement over weeks and months
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">🎯</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Personalized Goals</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Focus on what matters most to you
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">📚</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">7-Day Course</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Structured learning path to confidence
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">♾️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Unlimited Practice</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No daily limits on your sessions
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          "I improved my clarity score by 40% in just 2 weeks!" - Sarah K.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Join 1,000+ people mastering communication
        </p>
      </div>
    </div>
  )
}


