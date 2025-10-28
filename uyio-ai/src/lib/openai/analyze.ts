import { openai } from './client'
import { buildAnalysisPrompt, SYSTEM_PROMPT } from './prompts'
import type { FeedbackResult } from '@/types/feedback'
import type { Scenario } from '@/types/scenario'

/**
 * Analyze transcript and provide coaching feedback using GPT-4
 */

export async function analyzeTranscript(
  transcript: string,
  scenario: Scenario,
  duration?: number
): Promise<FeedbackResult> {
  try {
    // Build the analysis prompt
    const userPrompt = buildAnalysisPrompt(transcript, scenario, duration)

    // Call GPT-4
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Latest GPT-4 model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7, // Balanced creativity and consistency
      max_tokens: 1500,
      response_format: { type: 'json_object' }, // Ensure JSON response
    })

    const content = response.choices[0]?.message?.content

    if (!content) {
      throw new Error('Empty response from GPT-4')
    }

    // Parse the JSON response
    const feedback = parseFeedbackResponse(content)

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
 * Parse and validate GPT-4 feedback response
 */
export function parseFeedbackResponse(response: string): FeedbackResult {
  try {
    const data = JSON.parse(response)

    // Validate required fields
    if (!data.scores || !data.coaching || !data.summary || !data.detectedMetrics) {
      throw new Error('Invalid response structure')
    }

    // Validate scores are 0-10
    const scores = data.scores
    Object.keys(scores).forEach((key) => {
      const score = scores[key]
      if (typeof score !== 'number' || score < 0 || score > 10) {
        scores[key] = Math.max(0, Math.min(10, Math.round(score || 5)))
      }
    })

    // Ensure all required score fields exist
    const feedback: FeedbackResult = {
      scores: {
        clarity: scores.clarity || 5,
        confidence: scores.confidence || 5,
        logic: scores.logic || 5,
        pacing: scores.pacing || 5,
        fillers: scores.fillers || 5,
      },
      coaching: {
        clarity: data.coaching.clarity || 'Focus on clear articulation.',
        confidence: data.coaching.confidence || 'Speak with more conviction.',
        logic: data.coaching.logic || 'Structure your thoughts clearly.',
        pacing: data.coaching.pacing || 'Maintain a steady pace.',
        fillers: data.coaching.fillers || 'Reduce filler words.',
      },
      summary: data.summary || 'Good effort! Keep practicing.',
      detectedMetrics: {
        wpm: data.detectedMetrics.wpm || 0,
        fillerCount: data.detectedMetrics.fillerCount || 0,
        avgPauseLength: data.detectedMetrics.avgPauseLength || 0,
        totalWords: data.detectedMetrics.totalWords || 0,
        duration: data.detectedMetrics.duration || 0,
      },
      strengths: data.strengths || ['Good communication skills'],
      improvements: data.improvements || ['Keep practicing'],
    }

    return feedback
  } catch (error) {
    console.error('Failed to parse feedback:', error)
    throw new Error('Invalid feedback format received')
  }
}

/**
 * Calculate overall score from individual scores
 */
export function calculateOverallScore(scores: FeedbackResult['scores']): number {
  const values = Object.values(scores)
  const sum = values.reduce((acc, val) => acc + val, 0)
  return Math.round((sum / values.length) * 10) / 10 // Round to 1 decimal
}


