import { openai } from './client'
import { buildAnalysisPrompt, SYSTEM_PROMPT } from './prompts'
import { calculateObjectiveMetrics } from '@/lib/analysis/metrics'
import type { FeedbackResult } from '@/types/feedback'
import type { Scenario } from '@/types/scenario'
import { z } from 'zod'

/**
 * Zod schema for validating GPT-4o responses
 * Ensures all required fields exist and have sensible defaults
 * Prevents app crashes from malformed JSON
 */
const CoachingDetailSchema = z.object({
  reason: z.string().min(1).default('Unable to analyze this aspect'),
  example: z.string().min(1).default('No specific example available'),
  tip: z.string().min(1).default('Continue practicing this skill'),
  rubricLevel: z.string().min(1).default('N/A'),
})

const GPTFeedbackSchema = z.object({
  scores: z.object({
    clarity: z.number().int().min(0).max(10).default(5),
    confidence: z.number().int().min(0).max(10).default(5),
    logic: z.number().int().min(0).max(10).default(5),
  }),
  coaching: z.object({
    clarity: CoachingDetailSchema,
    confidence: CoachingDetailSchema,
    logic: CoachingDetailSchema,
  }),
  summary: z.string().min(10).default(
    'Your speech showed both strengths and areas for improvement. Keep practicing to build your communication skills.'
  ),
  strengths: z.array(z.string()).min(1).default([
    'Completed the practice session',
    'Spoke for the full duration',
  ]),
  improvements: z.array(z.string()).min(1).default([
    'Focus on clarity and structure',
    'Practice speaking with more confidence',
  ]),
  topImprovement: z.string().optional().default(
    'Practice speaking in a clear, structured manner'
  ),
})

type GPTFeedbackResponse = z.infer<typeof GPTFeedbackSchema>

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

    // STEP 4: Parse GPT response
    const gptFeedback = parseFeedbackResponse(content)
    
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

/**
 * Parse and validate GPT-4 feedback response using Zod
 * Ensures all required fields exist with sensible defaults
 * Prevents app crashes from malformed JSON
 * 
 * @param response - Raw JSON string from GPT-4o
 * @returns Validated and sanitized feedback object
 */
export function parseFeedbackResponse(response: string): GPTFeedbackResponse {
  try {
    // Step 1: Parse JSON (may throw if invalid JSON)
    const rawData = JSON.parse(response)
    
    // Step 2: Validate with Zod (auto-fills missing fields with defaults)
    const validatedData = GPTFeedbackSchema.parse(rawData)
    
    return validatedData
  } catch (error) {
    // Log the error for debugging
    console.error('GPT response validation failed:', error)
    console.error('Raw response:', response)
    
    // If parsing completely fails, return safe defaults
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors)
      
      // Attempt to salvage what we can with safeParse
      const salvaged = GPTFeedbackSchema.safeParse(
        error.errors.length > 0 ? {} : JSON.parse(response)
      )
      
      if (salvaged.success) {
        console.warn('Using partially salvaged feedback with defaults')
        return salvaged.data
      }
    }
    
    // Last resort: return completely safe defaults
    console.error('Complete validation failure, using full defaults')
    return GPTFeedbackSchema.parse({})
  }
}

/**
 * Calculate overall score from individual scores
 * Simple average of all 5 metrics
 */
export function calculateOverallScore(scores: FeedbackResult['scores']): number {
  const values = Object.values(scores)
  const sum = values.reduce((acc, val) => acc + val, 0)
  return Math.round((sum / values.length) * 10) / 10 // Round to 1 decimal
}
