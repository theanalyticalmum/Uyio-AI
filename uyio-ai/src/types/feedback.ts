/**
 * Type definitions for AI feedback and analysis
 * Updated to support hybrid objective + qualitative scoring
 */

export interface FeedbackScores {
  clarity: number      // 0-10: AI-scored qualitative
  confidence: number   // 0-10: AI-scored qualitative
  logic: number        // 0-10: AI-scored qualitative
  pacing: number       // 0-10: Auto-calculated from WPM
  fillers: number      // 0-10: Auto-calculated from filler rate
}

/**
 * Detailed coaching with examples and reasoning
 * Used for qualitative metrics (clarity, confidence, logic)
 */
export interface CoachingDetail {
  reason: string       // Why this score
  example: string      // Specific quote from transcript
  tip: string          // Actionable improvement
  rubricLevel: string  // Which rubric level matched
}

/**
 * Simple one-liner tips for each metric
 * Used in compact views and summaries
 */
export interface CoachingTips {
  clarity: string
  confidence: string
  logic: string
  pacing: string
  fillers: string
}

/**
 * Enhanced coaching details for qualitative scores
 * Only available for AI-scored metrics
 */
export interface DetailedCoaching {
  clarity: CoachingDetail
  confidence: CoachingDetail
  logic: CoachingDetail
}

/**
 * Objective metrics calculated from audio/transcript
 * These are facts, not AI opinions
 */
export interface DetectedMetrics {
  wpm: number                              // Words per minute
  fillerCount: number                      // Total filler words detected
  fillerBreakdown: Record<string, number>  // Count of each filler word
  fillerRate: number                       // Percentage of words that are fillers
  avgPauseLength: number                   // Average pause in seconds (future)
  totalWords: number                       // Total word count
  duration: number                         // Speaking duration in seconds
}

/**
 * Metadata about how each score was determined
 * Provides transparency about calculation method
 */
export interface ScoreMetadata {
  source: 'ai' | 'calculated'
  confidence: 'high' | 'medium' | 'low' | 'verified'
}

/**
 * Complete feedback result combining objective + qualitative analysis
 */
export interface FeedbackResult {
  scores: FeedbackScores                                    // All 5 scores (3 AI + 2 calculated)
  coaching: CoachingTips                                    // Simple one-liner tips
  detailedCoaching?: DetailedCoaching                       // Full details with examples (optional)
  summary: string                                           // Overall feedback (2-3 sentences)
  detectedMetrics: DetectedMetrics                          // Objective measurements
  strengths: string[]                                       // Top 2-3 strengths
  improvements: string[]                                    // Top 2-3 areas to improve
  topImprovement?: string                                   // Most important next step (optional)
  scoreMetadata?: Record<keyof FeedbackScores, ScoreMetadata> // Score sources (optional)
}

/**
 * Result from Whisper transcription
 */
export interface TranscriptionResult {
  transcript: string
  wordCount: number
  duration: number // in seconds
  language?: string
}

/**
 * Request format for analysis API
 */
export interface AnalysisRequest {
  transcript: string
  scenarioId: string
  duration: number // Required for WPM calculation
}
