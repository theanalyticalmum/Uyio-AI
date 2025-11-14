'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GuestLimitBanner } from '@/components/guest/GuestLimitBanner'
import { VoiceRecorder } from '@/components/practice/VoiceRecorder'
import {
  canPracticeAsGuest,
  incrementGuestUsage,
  saveGuestScore,
  getRemainingSessionsToday,
} from '@/lib/auth/guest'
import { toast } from 'sonner'
import { Loader2, Sparkles, Lock } from 'lucide-react'
import type { Scenario } from '@/types/scenario'

// Guest practice scenarios - simplified format for guests
const GUEST_SCENARIOS: Scenario[] = [
  {
    id: 'guest-1',
    goal: 'clarity',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Share personal experiences clearly',
    prompt_text: "Describe your ideal weekend and what makes it special to you.",
    time_limit_sec: 60,
    eval_focus: ['clarity', 'structure'],
    created_at: new Date().toISOString()
  },
  {
    id: 'guest-2',
    goal: 'confidence',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Speak confidently about achievements',
    prompt_text: "Tell me about a recent accomplishment you're proud of.",
    time_limit_sec: 60,
    eval_focus: ['confidence', 'clarity'],
    created_at: new Date().toISOString()
  },
  {
    id: 'guest-3',
    goal: 'clarity',
    context: 'social',
    difficulty: 'easy',
    objective: 'Explain interests clearly',
    prompt_text: "Explain your favorite hobby and why you enjoy it.",
    time_limit_sec: 60,
    eval_focus: ['clarity', 'structure'],
    created_at: new Date().toISOString()
  },
  {
    id: 'guest-4',
    goal: 'persuasion',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Persuasively describe a place',
    prompt_text: "Describe a place you'd love to visit and why.",
    time_limit_sec: 60,
    eval_focus: ['persuasion', 'clarity'],
    created_at: new Date().toISOString()
  },
  {
    id: 'guest-5',
    goal: 'persuasion',
    context: 'work',
    difficulty: 'medium',
    objective: 'Articulate leadership qualities',
    prompt_text: "Share your thoughts on what makes a great leader.",
    time_limit_sec: 60,
    eval_focus: ['persuasion', 'confidence'],
    created_at: new Date().toISOString()
  },
]

export default function GuestPracticePage() {
  const router = useRouter()
  const [canPractice, setCanPractice] = useState(true)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [recordingDuration, setRecordingDuration] = useState<number>(0)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [transcript, setTranscript] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Select random scenario on mount
  useEffect(() => {
    const randomScenario = GUEST_SCENARIOS[Math.floor(Math.random() * GUEST_SCENARIOS.length)]
    setScenario(randomScenario)
  }, [])

  useEffect(() => {
    // Check if guest can practice
    if (!canPracticeAsGuest()) {
      setCanPractice(false)
      toast.error('Daily limit reached. Sign up for unlimited practice!')
    }
  }, [])

  // Handle recording completion - GUEST FLOW (no storage upload)
  const handleRecordingComplete = async (blob: Blob, url: string | undefined, duration: number) => {
    setAudioBlob(blob)
    setRecordingDuration(duration)
    setError(null)

    // Guests skip storage - send blob directly to transcription
    await handleTranscription(blob, duration)
  }

  const handleTranscription = async (audioBlob: Blob, duration: number) => {
    setIsTranscribing(true)
    try {
      // Convert blob to File for upload
      const audioFile = new File([audioBlob], 'guest-recording.webm', {
        type: audioBlob.type,
      })

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('audio', audioFile)

      // Send directly to transcription API (guests skip storage)
      const response = await fetch('/api/session/transcribe', {
        method: 'POST',
        body: formData, // Send file directly, not JSON
      })

      if (!response.ok) {
        throw new Error('Transcription failed')
      }

      const data = await response.json()
      setTranscript(data.transcript)
      toast.success('Transcription complete!')

      // Step 2: Analyze with GPT-4
      await handleAnalysis(data.transcript, duration)
    } catch (error: any) {
      console.error('Transcription error:', error)
      setError('Transcription failed. Please try again.')
      toast.error('Transcription failed')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleAnalysis = async (transcriptText: string, duration: number) => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/session/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          scenarioId: scenario?.id,
          duration: duration,
        }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setAnalysis(data)

      // Save guest session data
      const avgScore =
        (data.scores.clarity + data.scores.confidence + data.scores.logic) / 3
      
      saveGuestScore({
        clarity: data.scores.clarity,
        confidence: data.scores.confidence,
        overall: avgScore,
      })
      incrementGuestUsage()

      toast.success('Analysis complete!')
    } catch (error: any) {
      console.error('Analysis error:', error)
      setError('Analysis failed. Please try again.')
      toast.error('Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleTryAgain = () => {
    if (!canPracticeAsGuest()) {
      toast.error('Daily limit reached! Sign up for unlimited practice.')
      router.push('/auth/signup')
      return
    }

    // Reset state
    setAudioUrl(null)
    setAudioBlob(null)
    setTranscript(null)
    setAnalysis(null)
    setError(null)

    // Get new random scenario
    const randomScenario = GUEST_SCENARIOS[Math.floor(Math.random() * GUEST_SCENARIOS.length)]
    setScenario(randomScenario)
  }

  // Limit reached screen
  if (!canPractice) {
    return (
      <>
        <GuestLimitBanner />
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              You've used all 3 free sessions today
            </h2>
            <p className="text-gray-300 mb-6">
              Sign up for unlimited practice and see your detailed scores.
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Sign Up for Unlimited Access
            </button>
          </div>
        </div>
      </>
    )
  }

  // Show results with blur overlay (AFTER analysis complete)
  if (analysis && transcript) {
    const overallScore = (
      (analysis.scores.clarity + analysis.scores.confidence + analysis.scores.logic) / 3
    ).toFixed(1)

    return (
      <>
        <GuestLimitBanner />
        <div className="min-h-screen bg-gray-950 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Your Practice Results</h1>

            {/* Overall Score - VISIBLE */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-8 mb-8">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{overallScore}/10</div>
                <p className="text-white/90 text-lg">
                  {parseFloat(overallScore) >= 8.5 ? 'Excellent work!' : 
                   parseFloat(overallScore) >= 7 ? 'Great job!' : 
                   'Good effort!'}
                </p>
              </div>
            </div>

            {/* Detailed Scores - BLURRED with CTA Overlay */}
            <div className="relative mb-8">
              <div className="filter blur-md pointer-events-none">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Clarity', score: analysis.scores.clarity },
                    { label: 'Confidence', score: analysis.scores.confidence },
                    { label: 'Logic', score: analysis.scores.logic },
                  ].map((metric) => (
                    <div key={metric.label} className="bg-gray-900 rounded-lg p-4">
                      <h3 className="text-sm text-gray-400 mb-1">{metric.label}</h3>
                      <div className="text-2xl font-bold text-white">{metric.score}/10</div>
                    </div>
                  ))}
                </div>

                {/* AI Feedback - First line visible, rest blurred */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    <Sparkles className="w-5 h-5 inline mr-2" />
                    AI Coach Feedback
                  </h3>
                  <p className="text-gray-300 mb-4">{analysis.summary}</p>
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <h4 className="font-semibold text-white mb-2">✓ Strengths</h4>
                      <ul className="space-y-1">
                        {analysis.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-gray-300">• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay CTA */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-950/95 border-2 border-purple-500/50 rounded-xl p-8 max-w-md mx-auto text-center">
                  <Lock className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Want to see your detailed analysis?
                  </h2>
                  <p className="text-gray-300 mb-6 text-left">
                    <span className="block mb-2">Sign up free to unlock:</span>
                    <span className="block">• Individual skill scores</span>
                    <span className="block">• Personalized AI coaching</span>
                    <span className="block">• Progress tracking</span>
                    <span className="block">• Unlimited practice sessions</span>
                  </p>

                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity mb-3"
                  >
                    Sign Up Free - See Full Analysis
                  </button>

                  <button
                    onClick={() => router.push('/auth/login')}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Already have an account? Sign in
                  </button>

                  {/* Sessions remaining */}
                  <p className="text-sm text-gray-500 mt-4">
                    {getRemainingSessionsToday()} free sessions remaining today
                  </p>
                </div>
              </div>
            </div>

            {/* Try Again Button */}
            {getRemainingSessionsToday() > 0 && (
              <button
                onClick={handleTryAgain}
                className="w-full py-3 border-2 border-gray-700 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Try Another Practice ({getRemainingSessionsToday()} left)
              </button>
            )}
          </div>
        </div>
      </>
    )
  }

  // Main practice interface
  return (
    <>
      <GuestLimitBanner />
      <div className="min-h-screen bg-gray-950 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">Guest Practice</h1>
              <div className="bg-gray-900 rounded-lg px-4 py-2">
                <span className="text-gray-400">{getRemainingSessionsToday()} sessions left today</span>
              </div>
            </div>
          </div>

          {/* Scenario Card */}
          {scenario && !analysis && (
            <div className="bg-gray-900 rounded-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                  {scenario.difficulty}
                </span>
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                  {scenario.context}
                </span>
                <span className="text-gray-400">60 seconds</span>
              </div>

              <h2 className="text-xl font-semibold text-white mb-3">Your Challenge:</h2>
              <p className="text-gray-300 text-lg mb-4">{scenario.prompt_text}</p>

              <div className="bg-gray-800/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Tips:</h3>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li>• Start with a clear opening statement</li>
                  <li>• Use specific examples</li>
                  <li>• End with a strong conclusion</li>
                </ul>
              </div>
            </div>
          )}

          {/* Voice Recorder - REAL RECORDING (guests skip storage upload) */}
          {!analysis && scenario && (
            <VoiceRecorder
              onRecordingComplete={handleRecordingComplete}
              maxDuration={60}
              autoUpload={false}
            />
          )}

          {/* Loading States */}
          {(isTranscribing || isAnalyzing) && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">
                  {isTranscribing ? 'Transcribing your speech...' : 'Analyzing with AI...'}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
              <p className="text-red-400">{error}</p>
              <button
                onClick={handleTryAgain}
                className="mt-2 text-red-300 hover:text-red-200 text-sm underline"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Sign up prompt for non-results page */}
          {!analysis && (
            <div className="mt-12 bg-gray-900 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Want unlimited practice?</h3>
              <p className="text-gray-400 mb-4">
                Sign up free to track your progress and get detailed feedback.
              </p>
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Create free account →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}


