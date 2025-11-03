import { FILLER_WORDS, escapeRegex } from '@/lib/constants/fillers'

export interface ObjectiveMetrics {
  wordCount: number
  wordsPerMinute: number
  fillerCount: number
  fillerBreakdown: Record<string, number>
  fillerRate: number // Percentage of words that are fillers
  sentenceCount: number
  avgSentenceLength: number
  duration: number
  pacingScore: number // Auto-calculated 0-10
  fillerScore: number // Auto-calculated 0-10
  pacingFeedback: string // Human-readable pacing feedback
  fillerFeedback: string // Human-readable filler feedback
}

/**
 * Calculate objective metrics from transcript and duration
 * These are FACTS, not AI opinions
 * 
 * @param transcript - The full transcribed text
 * @param duration - Recording duration in seconds
 * @returns Objective metrics calculated from the data
 */
export function calculateObjectiveMetrics(
  transcript: string,
  duration: number
): ObjectiveMetrics {
  // 1. Count words (split by whitespace, filter empties)
  const words = transcript.split(/\s+/).filter(word => word.trim().length > 0)
  const wordCount = words.length
  
  // 2. Calculate WPM (words per minute)
  const wordsPerMinute = duration > 0 
    ? Math.round((wordCount / duration) * 60) 
    : 0
  
  // 3. Count filler words using regex on FULL transcript (handles multi-word fillers)
  let fillerCount = 0
  const fillerBreakdown: Record<string, number> = {}
  
  FILLER_WORDS.forEach(filler => {
    // Use word boundaries to match whole words/phrases only
    const escaped = escapeRegex(filler)
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
    const matches = transcript.match(regex)
    
    if (matches && matches.length > 0) {
      fillerCount += matches.length
      fillerBreakdown[filler] = matches.length
    }
  })
  
  // 4. Calculate filler rate (percentage)
  const fillerRate = wordCount > 0 
    ? Math.round((fillerCount / wordCount) * 1000) / 10 // e.g., 5.2%
    : 0
  
  // 5. Count sentences (rough estimate by punctuation)
  const sentences = transcript
    .split(/[.!?]+/)
    .filter(s => s.trim().length > 0)
  const sentenceCount = sentences.length
  const avgSentenceLength = sentenceCount > 0 
    ? Math.round(wordCount / sentenceCount) 
    : 0
  
  // 6. Calculate pacing score (0-10) based on WPM
  const pacingScore = calculatePacingScore(wordsPerMinute)
  
  // 7. Calculate filler score (0-10) based on filler rate
  const fillerScore = calculateFillerScore(fillerRate)
  
  // 8. Generate human-readable feedback
  const pacingFeedback = getPacingFeedback(wordsPerMinute)
  const fillerFeedback = getFillerFeedback(fillerCount, fillerRate)
  
  return {
    wordCount,
    wordsPerMinute,
    fillerCount,
    fillerBreakdown,
    fillerRate,
    sentenceCount,
    avgSentenceLength,
    duration: Math.round(duration),
    pacingScore,
    fillerScore,
    pacingFeedback,
    fillerFeedback,
  }
}

/**
 * Calculate pacing score (0-10) based on WPM
 * Optimal range: 140-160 WPM for professional speaking
 */
export function calculatePacingScore(wpm: number): number {
  if (wpm >= 140 && wpm <= 160) return 10 // Perfect
  if (wpm >= 130 && wpm <= 170) return 9  // Excellent
  if (wpm >= 120 && wpm <= 180) return 8  // Very good
  if (wpm >= 110 && wpm <= 190) return 7  // Good
  if (wpm >= 100 && wpm <= 200) return 6  // Acceptable
  if (wpm >= 90 && wpm <= 210) return 5   // Needs improvement
  if (wpm >= 80 && wpm <= 220) return 4   // Poor
  if (wpm >= 70 && wpm <= 230) return 3   // Very poor
  if (wpm >= 60 && wpm <= 240) return 2   // Extremely poor
  return 1 // Incomprehensible (too slow/fast)
}

/**
 * Calculate filler score (0-10) based on filler rate percentage
 * Lower filler rate = higher score
 */
export function calculateFillerScore(fillerRate: number): number {
  if (fillerRate < 1) return 10   // Excellent (< 1% fillers)
  if (fillerRate < 2) return 9    // Very good
  if (fillerRate < 3) return 8    // Good
  if (fillerRate < 5) return 7    // Acceptable
  if (fillerRate < 7) return 6    // Needs improvement
  if (fillerRate < 10) return 5   // Moderate issues
  if (fillerRate < 15) return 4   // Significant issues
  if (fillerRate < 20) return 3   // Major issues
  if (fillerRate < 25) return 2   // Severe issues
  return 1 // Extreme filler usage
}

/**
 * Get human-readable pacing feedback
 */
export function getPacingFeedback(wpm: number): string {
  if (wpm < 80) return "Very slow - try speaking more energetically"
  if (wpm < 110) return "Slow pace - consider speeding up slightly"
  if (wpm < 140) return "Good pace with emphasis on clarity"
  if (wpm < 160) return "Excellent natural conversational pace"
  if (wpm < 180) return "Good pace with high energy"
  if (wpm < 200) return "Fast pace - ensure clarity isn't compromised"
  return "Very fast - slow down for better comprehension"
}

/**
 * Get human-readable filler feedback
 */
export function getFillerFeedback(fillerCount: number, fillerRate: number): string {
  if (fillerRate < 1) {
    return `Excellent! Only ${fillerCount} filler word${fillerCount === 1 ? '' : 's'} - very polished delivery.`
  } else if (fillerRate < 3) {
    return `Good control with ${fillerCount} filler word${fillerCount === 1 ? '' : 's'} (${fillerRate}% of speech).`
  } else if (fillerRate < 7) {
    return `Moderate filler usage: ${fillerCount} instances (${fillerRate}%). Try pausing instead.`
  } else {
    return `High filler usage: ${fillerCount} instances (${fillerRate}%). Practice silent pauses.`
  }
}

