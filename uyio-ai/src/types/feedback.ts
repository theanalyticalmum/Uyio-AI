/**
 * Type definitions for AI feedback and analysis
 */

export interface FeedbackScores {
  clarity: number // 0-10: Word choice, structure, articulation
  confidence: number // 0-10: Tone, conviction, authority
  logic: number // 0-10: Argument structure, coherence
  pacing: number // 0-10: Speed, pauses, rhythm
  fillers: number // 0-10: Um, uh, like usage (10 = no fillers)
}

export interface CoachingTips {
  clarity: string
  confidence: string
  logic: string
  pacing: string
  fillers: string
}

export interface DetectedMetrics {
  wpm: number // Words per minute
  fillerCount: number // Total filler words detected
  avgPauseLength: number // Average pause in seconds
  totalWords: number // Total word count
  duration: number // Speaking duration in seconds
}

export interface FeedbackResult {
  scores: FeedbackScores
  coaching: CoachingTips
  summary: string // Overall feedback (2-3 sentences)
  detectedMetrics: DetectedMetrics
  strengths: string[] // Top 2-3 strengths
  improvements: string[] // Top 2-3 areas to improve
}

export interface TranscriptionResult {
  transcript: string
  wordCount: number
  duration: number // in seconds
  language?: string
}

export interface AnalysisRequest {
  transcript: string
  scenarioId: string
  duration?: number // optional, for WPM calculation
}


