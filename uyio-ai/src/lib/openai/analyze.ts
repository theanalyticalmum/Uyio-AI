import { openai } from './client'
import { buildAnalysisPrompt, SYSTEM_PROMPT } from './prompts'
import { parseGPTResponse, type GPTFeedbackResponse } from './validation'
import { calculateObjectiveMetrics } from '@/lib/analysis/metrics'
import type { FeedbackResult } from '@/types/feedback'
import type { Scenario } from '@/types/scenario'

/**
 * Analyze transcript with hybrid approach:
 * 1. Calculate objective metrics ourselves (WPM, fillers) - FACTS
 * 2. Get qualitative feedback from GPT-4 (clarity, confidence, logic) - AI OPINION
 * 3. Combine into unified feedback result
 * 
 * @param transcript - The transcribed speech text
 * @param scenario - The practice scenario context
 * @param duration - Recording duration in seconds (required for WPM)
 * @returns Complete feedback with scores, coaching, and metrics
 */
export async function analyzeTranscript(
  transcript: string,
  scenario: Scenario,
  duration: number
): Promise<FeedbackResult> {
  try {
    // STEP 1: Calculate objective metrics (facts, not opinions)
    const objectiveMetrics = calculateObjectiveMetrics(transcript, duration)
    
    // STEP 2: Build prompt with pre-calculated metrics
    const userPrompt = buildAnalysisPrompt(transcript, scenario, objectiveMetrics)
    
    // STEP 3: Get qualitative feedback from GPT-4 (temperature 0 for consistency)
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0, // CHANGED FROM 0.7 - Now deterministic for consistency
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from GPT-4')
    }

    // STEP 4: Parse and validate GPT response using Zod (from validation.ts)
    const gptFeedback = parseGPTResponse(content)
    
    // STEP 5: Combine objective + qualitative into final result
    const feedback: FeedbackResult = {
      scores: {
        // Qualitative (from GPT-4)
        clarity: gptFeedback.scores.clarity,
        confidence: gptFeedback.scores.confidence,
        logic: gptFeedback.scores.logic,
        // Objective (auto-calculated)
        pacing: objectiveMetrics.pacingScore,
        fillers: objectiveMetrics.fillerScore,
      },
      coaching: {
        // Qualitative coaching (from GPT-4)
        clarity: gptFeedback.coaching.clarity.tip,
        confidence: gptFeedback.coaching.confidence.tip,
        logic: gptFeedback.coaching.logic.tip,
        // Objective coaching (pre-defined)
        pacing: objectiveMetrics.pacingFeedback,
        fillers: objectiveMetrics.fillerFeedback,
      },
      // Enhanced coaching details (from GPT-4)
      detailedCoaching: {
        clarity: gptFeedback.coaching.clarity,
        confidence: gptFeedback.coaching.confidence,
        logic: gptFeedback.coaching.logic,
      },
      summary: gptFeedback.summary,
      detectedMetrics: {
        wpm: objectiveMetrics.wordsPerMinute,
        fillerCount: objectiveMetrics.fillerCount,
        fillerBreakdown: objectiveMetrics.fillerBreakdown,
        fillerRate: objectiveMetrics.fillerRate,
        avgPauseLength: 0, // Would need audio waveform analysis
        totalWords: objectiveMetrics.wordCount,
        duration: objectiveMetrics.duration,
      },
      strengths: gptFeedback.strengths || [],
      improvements: gptFeedback.improvements || [],
      topImprovement: gptFeedback.topImprovement || gptFeedback.improvements?.[0],
      // Flag which scores are objective vs subjective (for transparency)
      scoreMetadata: {
        clarity: { source: 'ai', confidence: 'high' },
        confidence: { source: 'ai', confidence: 'high' },
        logic: { source: 'ai', confidence: 'high' },
        pacing: { source: 'calculated', confidence: 'verified' },
        fillers: { source: 'calculated', confidence: 'verified' },
      }
    }

    return feedback
  } catch (error) {
    console.error('Analysis error:', error)

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new Error('API rate limit reached. Please try again in a moment.')
      }
    }

    throw new Error('Failed to analyze transcript. Please try again.')
  }
}

// parseFeedbackResponse is now in validation.ts and imported as parseGPTResponse

/**
 * Calculate overall score from individual scores
 * Simple average of all 5 metrics
 */
export function calculateOverallScore(scores: FeedbackResult['scores']): number {
  const values = Object.values(scores)
  const sum = values.reduce((acc, val) => acc + val, 0)
  return Math.round((sum / values.length) * 10) / 10 // Round to 1 decimal
}
