// src/app/practice/feedback/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { ScoreDisplay } from '@/components/feedback/ScoreDisplay'
import { OverallSummary } from '@/components/feedback/OverallSummary'
import { CoachingTips } from '@/components/feedback/CoachingTips'
import { TranscriptView } from '@/components/feedback/TranscriptView'
import { ImprovementBadge } from '@/components/feedback/ImprovementBadge'
import { ActionButtons } from '@/components/feedback/ActionButtons'

import { saveSession, getUserSessionStats } from '@/lib/db/sessions'
import { createClient } from '@/lib/supabase/client'
import type { FeedbackResult } from '@/types/feedback'

interface FeedbackData {
  feedback: FeedbackResult
  transcript: string
  audioUrl: string
  scenarioId: string
  duration: number
  isDailyChallenge?: boolean
}

export default function FeedbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null)
  const [previousBest, setPreviousBest] = useState<number | undefined>(undefined)
  const [streak, setStreak] = useState<number | undefined>(undefined)

  useEffect(() => {
    loadFeedbackData()
  }, [])

  const loadFeedbackData = async () => {
    try {
      // Try to get session ID from URL (if viewing existing session)
      const existingSessionId = searchParams.get('session')

      if (existingSessionId) {
        // Load existing session
        // TODO: Implement getSession and load from database
        toast.error('Viewing saved sessions not yet implemented')
        router.push('/practice')
        return
      }

      // Otherwise, get data from sessionStorage (fresh feedback)
      const storedData = sessionStorage.getItem('feedbackData')

      if (!storedData) {
        toast.error('No feedback data found. Please complete a practice session first.')
        router.push('/practice')
        return
      }

      const data: FeedbackData = JSON.parse(storedData)
      setFeedbackData(data)

      // Get user data for improvement badges
      const supabase = createClient()
      const { data: userData } = await supabase.auth.getUser()

      if (userData?.user) {
        const stats = await getUserSessionStats(userData.user.id)
        setPreviousBest(stats.bestScore)
        // TODO: Get streak from user profile
        setStreak(0)

        // Save session to database
        await saveSessionToDatabase(data, userData.user.id)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading feedback data:', error)
      toast.error('Failed to load feedback')
      router.push('/practice')
    }
  }

  const saveSessionToDatabase = async (data: FeedbackData, userId: string) => {
    try {
      setSaving(true)

      const id = await saveSession({
        user_id: userId,
        scenario_id: data.scenarioId,
        audio_url: data.audioUrl,
        transcript: data.transcript,
        duration_sec: data.duration,
        feedback: data.feedback,
        is_daily_challenge: data.isDailyChallenge,
      })

      setSessionId(id)
      
      // If this was a daily challenge, show special message
      if (data.isDailyChallenge) {
        toast.success('Daily challenge completed! 🎉 Come back tomorrow for a new one!')
      } else {
        toast.success('Session saved successfully!')
      }
    } catch (error) {
      console.error('Error saving session:', error)
      toast.error('Failed to save session. Your feedback is still available.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your feedback...</p>
        </div>
      </div>
    )
  }

  if (!feedbackData) {
    return null
  }

  const { feedback, transcript, audioUrl, scenarioId } = feedbackData

  // Calculate overall score
  const overallScore =
    (feedback.scores.clarity +
      feedback.scores.confidence +
      feedback.scores.logic +
      feedback.scores.pacing +
      feedback.scores.fillers) /
    5

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/practice')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Practice</span>
          </button>

          {saving && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}

          {sessionId && (
            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
              ✓ Session Saved
            </div>
          )}
        </div>

        {/* Page Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Your Practice Results
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's how you performed and what you can improve
          </p>
        </div>

        {/* Improvement Badges */}
        <ImprovementBadge
          currentScore={overallScore}
          previousBest={previousBest}
          streak={streak}
        />

        {/* Score Display */}
        <ScoreDisplay feedback={feedback} />

        {/* Overall Summary */}
        <OverallSummary
          summary={feedback.summary}
          previousScore={previousBest}
          currentScore={overallScore}
        />

        {/* Coaching Tips */}
        <CoachingTips coaching={feedback.coaching} scores={feedback.scores} />

        {/* Transcript */}
        <TranscriptView transcript={transcript} detectedMetrics={feedback.detectedMetrics} />

        {/* Action Buttons */}
        <ActionButtons scenarioId={scenarioId} sessionId={sessionId || undefined} />

        {/* Footer tip */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
          💡 Practice daily for best results. Even 90 seconds a day makes a difference!
        </div>
      </div>
    </div>
  )
}

