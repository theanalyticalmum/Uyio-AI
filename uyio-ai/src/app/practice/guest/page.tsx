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
                    Describe your ideal weekend and what makes it special to you.
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
                {/* Score */}
                <div className="text-center pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-5xl font-bold text-blue-500 mb-2">{sessionScore?.toFixed(1)}/10</div>
                  <p className="text-gray-600 dark:text-gray-400">Overall Score</p>
                </div>

                {/* Feedback */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feedback}</p>
                </div>

                {/* Transcript */}
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Transcript</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{transcript}</p>
                </div>

                {/* CTA */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-300 mb-3">
                    💡 Sign up to save this session and track your progress over time!
                  </p>
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Save My Progress
                  </button>
                </div>

                {/* Practice Again */}
                <button
                  onClick={() => {
                    setTranscript('')
                    setFeedback('')
                    setSessionScore(null)
                    setCountdown(60)
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Practice Again
                </button>
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


