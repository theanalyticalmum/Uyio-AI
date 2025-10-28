import Link from 'next/link'
import { Mic, Zap, TrendingUp } from 'lucide-react'

export function GuestHero() {
  const scenarios = [
    { title: 'Nail Your Next Interview', icon: '💼', color: 'from-blue-500 to-cyan-500' },
    { title: 'Speak Up in Meetings', icon: '👥', color: 'from-purple-500 to-pink-500' },
    { title: 'Master Small Talk', icon: '💬', color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI Communication Coach
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Practice speaking with confidence. Get instant feedback.{' '}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">No sign-up required.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/practice/guest"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Try It Now - Free
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 text-lg font-semibold rounded-lg transition-colors w-full sm:w-auto"
            >
              Sign In
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-2xl">🎯</span>
              <span className="font-medium">3 Free Daily Sessions</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-2xl">🔊</span>
              <span className="font-medium">Voice-Powered AI</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="text-2xl">⚡</span>
              <span className="font-medium">Instant Feedback</span>
            </div>
          </div>
        </div>

        {/* Sample Scenarios */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Practice Real-World Scenarios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.title}
                className="relative overflow-hidden rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${scenario.color} opacity-90`} />
                <div className="relative z-10">
                  <div className="text-4xl mb-3">{scenario.icon}</div>
                  <h3 className="text-xl font-semibold">{scenario.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              60-Second Sessions
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Practice anytime, anywhere. No long commitments needed.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Feedback
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get instant coaching on clarity, confidence, and delivery.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Watch your skills improve with every practice session.
            </p>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Join <span className="font-semibold text-gray-900 dark:text-white">1,000+</span> professionals
            improving their communication daily
          </p>
        </div>
      </div>
    </div>
  )
}


