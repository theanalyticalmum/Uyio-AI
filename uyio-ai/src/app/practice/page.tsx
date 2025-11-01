'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ScenarioCard } from '@/components/practice/ScenarioCard'
import { VoiceRecorder, type VoiceRecorderRef } from '@/components/practice/VoiceRecorder'
import { TranscriptionStatus } from '@/components/practice/TranscriptionStatus'
import { generateScenario } from '@/lib/scenarios/generator'
import { markScenarioUsed } from '@/lib/scenarios/tracker'
import { createClient } from '@/lib/supabase/client'
import type { Scenario } from '@/types/scenario'
import type { FeedbackResult } from '@/types/feedback'
import { Loader2, RefreshCw, CheckCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

type ProcessingState = 
  | 'idle' 
  | 'recording' 
  | 'uploading'
  | 'transcribing' 
  | 'analyzing' 
  | 'complete' 
  | 'error'

export default function PracticePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const recorderRef = useRef<VoiceRecorderRef>(null)
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingState, setProcessingState] = useState<ProcessingState>('idle')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<string>('')
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check authentication with timeout - redirect guests to /practice/guest
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    
    const checkAuth = async () => {
      try {
        // Set timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          console.error('Auth check timeout')
          setError('Authentication check timed out. Please try again.')
          setLoading(false)
        }, 5000) // 5 second timeout
        
        const supabase = createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        // Clear timeout if we got a response
        clearTimeout(timeoutId)
        
        if (authError) {
          console.error('Auth error:', authError)
          // On error, allow guest mode
          router.push('/practice/guest')
          return
        }
        
        if (!user) {
          // No user = guest, redirect to guest practice
          router.push('/practice/guest')
          return
        }
        
        // User is authenticated, load scenario
        loadScenario()
      } catch (err) {
        clearTimeout(timeoutId)
        console.error('Unexpected error during auth check:', err)
        setError('Failed to check authentication. Redirecting to guest mode...')
        setTimeout(() => router.push('/practice/guest'), 2000)
      }
    }
    
    checkAuth()
    
    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId)
  }, [router])

  // Listen for recording trigger from bottom navigation
  useEffect(() => {
    const handleTriggerRecording = () => {
      // Only trigger if we're in idle state and have a scenario loaded
      if (processingState === 'idle' && scenario && recorderRef.current) {
        recorderRef.current.startRecording()
      }
    }
    
    window.addEventListener('trigger-recording', handleTriggerRecording)
    return () => window.removeEventListener('trigger-recording', handleTriggerRecording)
  }, [processingState, scenario])

  const loadScenario = () => {
    setLoading(true)
    
    // Get filters from URL params
    const goal = searchParams.get('goal') as any
    const context = searchParams.get('context') as any
    const difficulty = searchParams.get('difficulty') as any
    
    // Generate scenario
    const newScenario = generateScenario({
      goal,
      context,
      difficulty,
    })
    
    setScenario(newScenario)
    setLoading(false)
  }

  const handleRecordingComplete = async (blob: Blob, url?: string) => {
    setAudioBlob(blob)
    setAudioUrl(url || null)
    setError(null)
    
    // Mark scenario as used
    if (scenario) {
      markScenarioUsed(scenario.id)
    }

    // If upload succeeded, start transcription
    if (url) {
      await handleTranscription(url)
    } else {
      setProcessingState('complete')
      toast.error('Upload failed. Cannot transcribe.')
    }
  }

  const handleTranscription = async (audioUrl: string) => {
    setProcessingState('transcribing')
    
    try {
      const response = await fetch('/api/session/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Transcription failed')
      }

      setTranscript(data.transcript)
      toast.success('Transcription complete!')
      
      // Start analysis
      await handleAnalysis(data.transcript)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to transcribe audio'
      setError(errorMsg)
      setProcessingState('error')
      toast.error(errorMsg)
    }
  }

  const handleAnalysis = async (transcriptText: string) => {
    setProcessingState('analyzing')
    
    try {
      const response = await fetch('/api/session/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          scenarioId: scenario?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setFeedback(data.feedback)
      setProcessingState('complete')
      toast.success('Analysis complete!')
      
      // Store feedback data in sessionStorage for the feedback page
      const feedbackData = {
        feedback: data.feedback,
        transcript: transcriptText,
        audioUrl: audioUrl!,
        scenarioId: scenario?.id || '',
        duration: audioBlob ? Math.round(audioBlob.size / 1000) : 0, // Rough estimate
        isDailyChallenge: searchParams.get('daily') === 'true',
      }
      
      sessionStorage.setItem('feedbackData', JSON.stringify(feedbackData))
      
      // Navigate to feedback page after a short delay
      setTimeout(() => {
        router.push('/practice/feedback')
      }, 1000)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze transcript'
      setError(errorMsg)
      setProcessingState('error')
      toast.error(errorMsg)
    }
  }

  const handleRetry = async () => {
    if (audioUrl && !transcript) {
      // Retry transcription
      await handleTranscription(audioUrl)
    } else if (transcript && !feedback) {
      // Retry analysis
      await handleAnalysis(transcript)
    }
  }

  const handleNewScenario = () => {
    setProcessingState('idle')
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscript('')
    setFeedback(null)
    setError(null)
    loadScenario()
  }

  const handleTryAgain = () => {
    setProcessingState('idle')
    setAudioBlob(null)
    setAudioUrl(null)
    setTranscript('')
    setFeedback(null)
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load scenario</p>
          <button
            onClick={loadScenario}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Scenario Card */}
        <ScenarioCard scenario={scenario} />

        {/* Transcription/Analysis Status */}
        {(processingState === 'transcribing' || processingState === 'analyzing' || processingState === 'error') && (
          <TranscriptionStatus
            status={processingState}
            error={error}
            onRetry={handleRetry}
          />
        )}

        {/* Recording Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          {processingState === 'idle' && (
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Ready to Practice?
              </h3>
              <VoiceRecorder
                ref={recorderRef}
                onRecordingComplete={handleRecordingComplete}
                maxDuration={scenario.time_limit_sec}
              />
            </div>
          )}

          {processingState === 'complete' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Recording Complete!
              </h3>
              <div className="mb-6">
                {audioUrl && (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Recording saved successfully
                    </p>
                  </div>
                )}
              </div>

              {/* Transcript Display */}
              {transcript && (
                <div className="mb-6 text-left">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Your Response:
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      "{transcript}"
                    </p>
                  </div>
                </div>
              )}

              {/* Feedback Display */}
              {feedback && (
                <div className="mb-6 space-y-4">
                  {/* Overall Score - Prominent */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                    <p className="text-sm text-white/80 mb-2">Your Overall Score</p>
                    <div className="text-6xl font-bold text-white mb-2">
                      {((feedback.scores.clarity + feedback.scores.confidence + feedback.scores.logic + feedback.scores.pacing + feedback.scores.fillers) / 5).toFixed(1)}/10
                    </div>
                    <p className="text-white/90 text-lg font-medium">
                      {((feedback.scores.clarity + feedback.scores.confidence + feedback.scores.logic + feedback.scores.pacing + feedback.scores.fillers) / 5) >= 8 
                        ? "Excellent! 🌟" 
                        : ((feedback.scores.clarity + feedback.scores.confidence + feedback.scores.logic + feedback.scores.pacing + feedback.scores.fillers) / 5) >= 6 
                          ? "Great job! 👏" 
                          : "Good effort! 💪"}
                    </p>
                  </div>

                  {/* AI Summary */}
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        AI Coach Feedback
                      </h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feedback.summary}</p>
                  </div>

                  {/* Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Object.entries(feedback.scores).map(([key, value]) => (
                      <div key={key} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {value}/10
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 capitalize mt-1">
                          {key}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Score Explanation */}
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                    <p>💡 Scores are quality ratings (10 = perfect, 0 = needs major improvement)</p>
                    <p>🚫 Fillers {feedback.scores.fillers}/10 = You had ~{feedback.detectedMetrics.fillerCount} filler words ({feedback.detectedMetrics.fillerCount < 5 ? 'excellent' : feedback.detectedMetrics.fillerCount < 10 ? 'good' : 'could improve'})</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-3 border-2 border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-semibold transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleNewScenario}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
                >
                  <RefreshCw className="w-5 h-5" />
                  New Scenario
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Get New Scenario Button (when idle) */}
        {processingState === 'idle' && (
          <div className="text-center">
            <button
              onClick={handleNewScenario}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Get a different scenario
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

