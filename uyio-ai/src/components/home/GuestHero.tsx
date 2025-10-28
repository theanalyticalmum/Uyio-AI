'use client'

import { useRouter } from 'next/navigation'
import { Sparkles, Mic, TrendingUp, Zap } from 'lucide-react'

export function GuestHero() {
  const router = useRouter()

  const benefits = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Instant AI Feedback',
      description: 'Get personalized coaching in seconds powered by GPT-4'
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Voice-Powered Practice',
      description: 'Real speaking practice with natural voice recording'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Track Your Progress',
      description: 'Watch your scores improve with detailed analytics'
    }
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fadeIn">
            <Zap className="w-4 h-4" />
            3 Free Sessions Daily - No Credit Card Required
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            Master Communication
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              in 90 Seconds
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            AI-powered coaching to speak with confidence and clarity.
            Practice real scenarios, get instant feedback, see real results.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <button
              onClick={() => router.push('/practice/guest')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Free Practice
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-lg font-semibold rounded-xl transition-all"
            >
              Sign In
            </button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ✨ Join hundreds improving their communication skills
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:scale-[1.02]"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {benefit.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Choose a Scenario
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Pick from real-world communication challenges
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Record Your Response
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Speak naturally for 60-90 seconds
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Get AI Coaching
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Receive detailed feedback on clarity, confidence & more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
