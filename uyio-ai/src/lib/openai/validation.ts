/**
 * OpenAI Response Validation with Zod
 * 
 * Provides complete default objects at every nesting level to prevent
 * crashes from malformed GPT responses.
 * 
 * Key design: Defaults at EVERY level (field, object, and root)
 */

import { z } from 'zod'

/**
 * Coaching detail schema with object-level default
 * Used for individual metric coaching (clarity, confidence, etc.)
 */
const CoachingDetailSchema = z.object({
  reason: z.string().min(1).default('Unable to analyze this aspect'),
  example: z.string().min(1).default('No specific example available'),
  tip: z.string().min(1).default('Continue practicing this skill'),
  rubricLevel: z.string().min(1).default('N/A'),
}).default({
  reason: 'Unable to analyze this aspect',
  example: 'No specific example available',
  tip: 'Continue practicing this skill',
  rubricLevel: 'N/A',
})

/**
 * Complete coaching schema with defaults for all metrics
 * Provides object-level default with all five metrics
 */
const CoachingSchema = z.object({
  clarity: CoachingDetailSchema,
  confidence: CoachingDetailSchema,
  logic: CoachingDetailSchema,
}).default({
  clarity: {
    reason: 'Unable to analyze clarity',
    example: 'No specific example available',
    tip: 'Focus on clear articulation and structure',
    rubricLevel: 'N/A',
  },
  confidence: {
    reason: 'Unable to analyze confidence',
    example: 'No specific example available',
    tip: 'Speak with more conviction and authority',
    rubricLevel: 'N/A',
  },
  logic: {
    reason: 'Unable to analyze logic',
    example: 'No specific example available',
    tip: 'Structure your arguments more clearly',
    rubricLevel: 'N/A',
  },
})

/**
 * Scores schema with object-level default
 * All scores default to 5 (middle of 0-10 range)
 * Uses coerce to convert string numbers to numbers
 */
const ScoresSchema = z.object({
  clarity: z.coerce.number().int().min(0).max(10).default(5),
  confidence: z.coerce.number().int().min(0).max(10).default(5),
  logic: z.coerce.number().int().min(0).max(10).default(5),
}).default({
  clarity: 5,
  confidence: 5,
  logic: 5,
})

/**
 * Complete GPT feedback schema with hierarchical defaults
 * 
 * Defaults are provided at:
 * 1. Field level (e.g., clarity: 5)
 * 2. Object level (e.g., scores: {...})
 * 3. Root level (entire response)
 */
export const GPTFeedbackSchema = z.object({
  scores: ScoresSchema,
  coaching: CoachingSchema,
  summary: z.string().min(1).default(
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
}).default({
  scores: {
    clarity: 5,
    confidence: 5,
    logic: 5,
  },
  coaching: {
    clarity: {
      reason: 'Unable to analyze clarity',
      example: 'No specific example available',
      tip: 'Focus on clear articulation and structure',
      rubricLevel: 'N/A',
    },
    confidence: {
      reason: 'Unable to analyze confidence',
      example: 'No specific example available',
      tip: 'Speak with more conviction and authority',
      rubricLevel: 'N/A',
    },
    logic: {
      reason: 'Unable to analyze logic',
      example: 'No specific example available',
      tip: 'Structure your arguments more clearly',
      rubricLevel: 'N/A',
    },
  },
  summary: 'Your speech showed both strengths and areas for improvement. Keep practicing to build your communication skills.',
  strengths: [
    'Completed the practice session',
    'Spoke for the full duration',
  ],
  improvements: [
    'Focus on clarity and structure',
    'Practice speaking with more confidence',
  ],
  topImprovement: 'Practice speaking in a clear, structured manner',
})

/**
 * Type inference from schema
 */
export type GPTFeedbackResponse = z.infer<typeof GPTFeedbackSchema>

/**
 * Helper function to safely parse GPT responses with complete defaults
 * 
 * Three-tier fallback strategy:
 * 1. Attempt to parse the raw data
 * 2. If that fails, parse with empty object (uses all defaults)
 * 3. If that fails, return schema's default directly
 * 
 * This ensures the function NEVER throws and always returns valid feedback
 */
export function parseGPTResponse(response: string): GPTFeedbackResponse {
  try {
    // Step 1: Parse JSON
    const rawData = JSON.parse(response)
    
    // Step 2: Validate with Zod (auto-fills missing fields with defaults)
    const validatedData = GPTFeedbackSchema.parse(rawData)
    
    return validatedData
  } catch (error) {
    // Log the error for debugging
    console.error('GPT response validation failed:', error)
    console.error('Raw response:', response)
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors)
      
      // Attempt to salvage what we can with safeParse
      const salvaged = GPTFeedbackSchema.safeParse({})
      
      if (salvaged.success) {
        console.warn('Using complete default feedback due to validation failure')
        return salvaged.data
      }
    }
    
    // Last resort: return complete defaults
    // This should always work now that we have complete hierarchical defaults
    console.error('Complete validation failure, using full defaults')
    return GPTFeedbackSchema.parse({})
  }
}

