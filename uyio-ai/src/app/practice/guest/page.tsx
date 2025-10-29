'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GuestLimitBanner } from '@/components/guest/GuestLimitBanner'
import { SignupPromptModal } from '@/components/auth/SignupPromptModal'
import {
  canPracticeAsGuest,
  incrementGuestUsage,
  saveGuestScore,
  shouldPromptSignup,
  getRemainingSessionsToday,
} from '@/lib/auth/guest'
import { toast } from 'sonner'
import { Mic, Square, Loader2 } from 'lucide-react'

// Simple practice prompts for guest users
const GUEST_PROMPTS = [
  "Describe your ideal weekend and what makes it special to you.",
  "Tell me about a recent accomplishment you're proud of.",
  "Explain your favorite hobby and why you enjoy it.",
  "Describe a place you'd love to visit and why.",
  "Share your thoughts on what makes a great leader.",
  "Talk about a book or movie that impacted you.",
  "Describe your morning routine and why it works for you.",
  "Explain what motivates you to achieve your goals.",
  "Share your perspective on the importance of learning.",
  "Describe a challenge you overcame and what you learned.",
]

export default function GuestPracticePage() {
  const router = useRouter()
  const [canPractice, setCanPractice] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [sessionScore, setSessionScore] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(60)
  const [transcript, setTranscript] = useState('')
  const [feedback, setFeedback] = useState('')
  const [currentPrompt, setCurrentPrompt] = useState('')

  // Select random prompt on mount and when restarting
  useEffect(() => {
    const randomPrompt = GUEST_PROMPTS[Math.floor(Math.random() * GUEST_PROMPTS.length)]
    setCurrentPrompt(randomPrompt)
  }, [])

  useEffect(() => {
    // Check if guest can practice
    if (!canPracticeAsGuest()) {
      setCanPractice(false)
      toast.error('Daily limit reached. Sign up for unlimited practice!')
    }
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRecording && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleStopRecording()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRecording, countdown])

  const handleStartRecording = () => {
    if (!canPracticeAsGuest()) {
      toast.error('Daily limit reached!')
      return
    }

    setIsRecording(true)
    setCountdown(60)
    toast.success('Recording started! Speak clearly.')
  }

  const handleStopRecording = async () => {
    setIsRecording(false)
    setIsProcessing(true)

    // Simulate AI processing (in real app, this would call OpenAI)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock transcript and scores for guest preview
    const mockTranscript =
      'Your response was recorded successfully! This is a preview of how your speech would be transcribed. Sign up for a free account to get real AI-powered transcription and detailed feedback on clarity, confidence, pacing, and more.'
    const mockScore = Math.random() * 3 + 7 // Score between 7-10

    setTranscript(mockTranscript)
    setFeedback(
      'Nice work! Your communication shows promise. Sign up to unlock detailed AI analysis including: clarity score, confidence level, pacing feedback, filler word detection, and personalized coaching tips for improvement.'
    )
    setSessionScore(mockScore)

    // Save score and increment usage
    saveGuestScore({
      clarity: mockScore,
      confidence: mockScore,
      overall: mockScore,
    })
    incrementGuestUsage()

    setIsProcessing(false)

    // Show signup prompt if criteria met
    if (shouldPromptSignup()) {
      setTimeout(() => setShowSignupModal(true), 1000)
    }

    toast.success(`Session complete! Score: ${mockScore.toFixed(1)}/10`)
  }

  if (!canPractice) {
    return (
      <>
        <GuestLimitBanner />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Daily Limit Reached
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You've completed 3 practice sessions today. Sign up for unlimited access!
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <GuestLimitBanner />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              Guest Mode • {getRemainingSessionsToday()} sessions left today
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Quick Practice</h1>
            <p className="text-gray-600 dark:text-gray-400">60-second practice session</p>
          </div>

          {/* Practice Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 mb-6">
            {!isRecording && !isProcessing && !transcript && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mic className="w-10 h-10 text-blue-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to practice?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Speak for 60 seconds on any topic. We'll give you instant feedback!
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Suggested topic:</p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    {currentPrompt || "Speak about any topic you like!"}
                  </p>
                </div>

                <button
                  onClick={handleStartRecording}
                  className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-lg font-semibold rounded-lg transition-colors"
                >
                  Start Recording
                </button>
              </div>
            )}

            {isRecording && (
              <div className="text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Mic className="w-12 h-12 text-red-500" />
                  </div>
                  <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">{countdown}s</div>
                  <p className="text-gray-600 dark:text-gray-400">Recording... Speak clearly!</p>
                </div>

                <button
                  onClick={handleStopRecording}
                  className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              </div>
            )}

            {isProcessing && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Analyzing your speech...</p>
              </div>
            )}

            {transcript && (
              <div className="space-y-6">
                {/* Overall Score - Big and Prominent */}
                <div className="text-center p-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <p className="text-sm text-white/80 mb-2">Your Overall Score</p>
                  <div className="text-6xl font-bold text-white mb-2">{sessionScore?.toFixed(1)}/10</div>
                  <p className="text-white/90 text-lg font-medium">
                    {sessionScore && sessionScore >= 8 ? "Great job! 🌟" : sessionScore && sessionScore >= 6 ? "Good work! 👏" : "Nice try! 💪"}
                  </p>
                </div>

                {/* Basic Feedback */}
                <div className="bg-white dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span className="text-2xl">💬</span>
                    Quick Feedback
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback}</p>
                </div>

                {/* Locked Detailed Scores Preview */}
                <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center px-6">
                      <div className="text-4xl mb-3">🔒</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Unlock Detailed Analysis
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
                        Sign up free to see your detailed scores for Clarity, Confidence, Logic, Pacing, and Fillers—plus personalized coaching tips!
                      </p>
                      <button
                        onClick={() => setShowSignupModal(true)}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
                      >
                        Sign Up Free →
                      </button>
                    </div>
                  </div>
                  {/* Blurred preview of detailed scores */}
                  <div className="opacity-30 pointer-events-none">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Your Detailed Scores</h3>
                    <div className="grid grid-cols-5 gap-3">
                      {['Clarity', 'Confidence', 'Logic', 'Pacing', 'Fillers'].map((metric) => (
                        <div key={metric} className="text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2"></div>
                          <p className="text-xs font-medium">{metric}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Locked Coaching Tips Preview */}
                <div className="relative bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl border-2 border-dashed border-purple-300 dark:border-purple-700">
                  <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                    <div className="text-center px-6">
                      <div className="text-4xl mb-3">🎯</div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        Personalized Coaching Tips
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-sm">
                        Get AI-powered tips tailored to YOUR specific communication style and goals.
                      </p>
                      <button
                        onClick={() => setShowSignupModal(true)}
                        className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
                      >
                        Unlock Coaching →
                      </button>
                    </div>
                  </div>
                  {/* Blurred preview */}
                  <div className="opacity-20 pointer-events-none">
                    <h3 className="font-semibold mb-3">💡 Personalized Tips</h3>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>

                {/* Limited Sessions Notice */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-900 dark:text-yellow-300 mb-2 font-medium">
                    ⚡ {3 - (getRemainingSessionsToday())} of 3 free sessions used today
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-400">
                    Sign up for unlimited practice sessions and detailed feedback!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => {
                      if (canPracticeAsGuest()) {
                        // Reset state
                        setTranscript('')
                        setFeedback('')
                        setSessionScore(null)
                        setCountdown(60)
                        // Get new random prompt
                        const randomPrompt = GUEST_PROMPTS[Math.floor(Math.random() * GUEST_PROMPTS.length)]
                        setCurrentPrompt(randomPrompt)
                      } else {
                        setShowLimitModal(true)
                      }
                    }}
                    className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Try Another ({getRemainingSessionsToday()} left)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Signup Modal */}
      <SignupPromptModal
        score={sessionScore || undefined}
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
      />
    </>
  )
}


