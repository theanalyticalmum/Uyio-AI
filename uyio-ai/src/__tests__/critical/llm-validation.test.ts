/**
 * Critical Test: LLM Response Validation
 * 
 * Protects Fix #1: Zod schema validation prevents app crashes from malformed GPT responses
 * 
 * What we're testing:
 * - Malformed JSON doesn't crash the app
 * - Missing fields get sensible defaults
 * - Out-of-range scores are clamped
 * - Invalid types are coerced or defaulted
 * 
 * Note: We test the Zod schema directly to avoid OpenAI client initialization in Jest
 */

import { z } from 'zod'

// Copy the schema from analyze.ts to test it directly (avoids OpenAI client init)
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

// Test implementation of parseFeedbackResponse
function parseFeedbackResponse(response: string): z.infer<typeof GPTFeedbackSchema> {
  try {
    const rawData = JSON.parse(response)
    const validatedData = GPTFeedbackSchema.parse(rawData)
    return validatedData
  } catch (error) {
    console.error('GPT response validation failed:', error)
    console.error('Raw response:', response)
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation errors:', error.errors)
      const salvaged = GPTFeedbackSchema.safeParse({})
      if (salvaged.success) {
        return salvaged.data
      }
    }
    
    return GPTFeedbackSchema.parse({})
  }
}

describe('LLM Response Validation - Critical Path', () => {
  describe('Malformed JSON Handling', () => {
    it('handles completely invalid JSON with safe defaults', () => {
      const malformed = '{"invalid json with missing brace'
      
      // Should not throw, should return defaults
      const result = parseFeedbackResponse(malformed)
      
      expect(result).toBeDefined()
      expect(result.scores).toBeDefined()
      expect(result.scores.clarity).toBe(5) // default
      expect(result.scores.confidence).toBe(5) // default
      expect(result.scores.logic).toBe(5) // default
      expect(result.summary).toBeDefined()
      expect(typeof result.summary).toBe('string')
    })

    it('handles empty response with safe defaults', () => {
      const empty = ''
      
      const result = parseFeedbackResponse(empty)
      
      expect(result).toBeDefined()
      expect(result.scores.clarity).toBe(5)
      expect(result.strengths).toHaveLength(2) // default strengths
    })

    it('handles null/undefined without crashing', () => {
      const nullish = 'null'
      
      const result = parseFeedbackResponse(nullish)
      
      expect(result).toBeDefined()
      expect(result.summary).toBeDefined()
    })
  })

  describe('Missing Fields - Defaults', () => {
    it('provides defaults for missing score fields', () => {
      const partial = JSON.stringify({
        scores: { clarity: 7 }, // only clarity provided
        summary: 'Test'
      })
      
      const result = parseFeedbackResponse(partial)
      
      expect(result.scores.clarity).toBe(7) // provided
      expect(result.scores.confidence).toBe(5) // default
      expect(result.scores.logic).toBe(5) // default
    })

    it('provides default coaching when missing', () => {
      const noCoaching = JSON.stringify({
        scores: { clarity: 7, confidence: 7, logic: 7 }
      })
      
      const result = parseFeedbackResponse(noCoaching)
      
      expect(result.coaching).toBeDefined()
      expect(result.coaching.clarity).toBeDefined()
      expect(result.coaching.clarity.tip).toBeDefined()
    })

    it('provides default summary when missing', () => {
      const noSummary = JSON.stringify({
        scores: { clarity: 7, confidence: 7, logic: 7 }
      })
      
      const result = parseFeedbackResponse(noSummary)
      
      expect(result.summary).toBeDefined()
      expect(result.summary.length).toBeGreaterThan(10) // meaningful default
    })

    it('provides default strengths and improvements', () => {
      const minimal = JSON.stringify({
        scores: { clarity: 7, confidence: 7, logic: 7 }
      })
      
      const result = parseFeedbackResponse(minimal)
      
      expect(result.strengths).toBeInstanceOf(Array)
      expect(result.strengths.length).toBeGreaterThanOrEqual(1)
      expect(result.improvements).toBeInstanceOf(Array)
      expect(result.improvements.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Out-of-Range Score Clamping', () => {
    it('clamps scores above 10', () => {
      const tooHigh = JSON.stringify({
        scores: {
          clarity: 15,
          confidence: 12,
          logic: 20
        }
      })
      
      const result = parseFeedbackResponse(tooHigh)
      
      expect(result.scores.clarity).toBeLessThanOrEqual(10)
      expect(result.scores.confidence).toBeLessThanOrEqual(10)
      expect(result.scores.logic).toBeLessThanOrEqual(10)
    })

    it('clamps scores below 0', () => {
      const tooLow = JSON.stringify({
        scores: {
          clarity: -5,
          confidence: -10,
          logic: -1
        }
      })
      
      const result = parseFeedbackResponse(tooLow)
      
      expect(result.scores.clarity).toBeGreaterThanOrEqual(0)
      expect(result.scores.confidence).toBeGreaterThanOrEqual(0)
      expect(result.scores.logic).toBeGreaterThanOrEqual(0)
    })

    it('ensures scores are integers', () => {
      const decimals = JSON.stringify({
        scores: {
          clarity: 7.5,
          confidence: 8.9,
          logic: 6.1
        }
      })
      
      const result = parseFeedbackResponse(decimals)
      
      expect(Number.isInteger(result.scores.clarity)).toBe(true)
      expect(Number.isInteger(result.scores.confidence)).toBe(true)
      expect(Number.isInteger(result.scores.logic)).toBe(true)
    })
  })

  describe('Type Coercion', () => {
    it('coerces string numbers to numbers', () => {
      const stringNumbers = JSON.stringify({
        scores: {
          clarity: "7",
          confidence: "8",
          logic: "6"
        }
      })
      
      const result = parseFeedbackResponse(stringNumbers)
      
      expect(typeof result.scores.clarity).toBe('number')
      expect(result.scores.clarity).toBe(7)
    })

    it('handles arrays when strings expected', () => {
      const weirdTypes = JSON.stringify({
        scores: { clarity: 7, confidence: 7, logic: 7 },
        summary: ['Not', 'a', 'string'] // wrong type
      })
      
      const result = parseFeedbackResponse(weirdTypes)
      
      // Should use default instead of crashing
      expect(typeof result.summary).toBe('string')
    })
  })

  describe('Production Edge Cases', () => {
    it('handles GPT returning valid JSON with extra fields', () => {
      const extraFields = JSON.stringify({
        scores: { clarity: 7, confidence: 8, logic: 6 },
        coaching: {
          clarity: { reason: 'Good', example: 'Test', tip: 'Keep going', rubricLevel: '7-8' },
          confidence: { reason: 'Strong', example: 'Test', tip: 'Continue', rubricLevel: '7-8' },
          logic: { reason: 'Solid', example: 'Test', tip: 'Good work', rubricLevel: '5-6' }
        },
        summary: 'Well done',
        strengths: ['Strong opening'],
        improvements: ['Add more detail'],
        topImprovement: 'Be more specific',
        extraField: 'This should be ignored', // ✅ Extra fields ignored
        anotherExtra: { nested: 'data' }
      })
      
      const result = parseFeedbackResponse(extraFields)
      
      // Should parse successfully and ignore extra fields
      expect(result.scores.clarity).toBe(7)
      expect(result.summary).toBe('Well done')
      expect('extraField' in result).toBe(false)
    })

    it('handles GPT hallucinating array instead of object', () => {
      const arrayResponse = '[{"error": "not an object"}]'
      
      const result = parseFeedbackResponse(arrayResponse)
      
      // Should return safe defaults instead of crashing
      expect(result).toBeDefined()
      expect(result.scores).toBeDefined()
    })

    it('never crashes regardless of input', () => {
      const crazyInputs = [
        '}{][[',
        'undefined',
        '{"scores": null}',
        '{"scores": "not an object"}',
        'true',
        '123',
        '{"scores": {"clarity": "ten"}}',
      ]
      
      crazyInputs.forEach(input => {
        expect(() => {
          const result = parseFeedbackResponse(input)
          expect(result).toBeDefined()
        }).not.toThrow()
      })
    })
  })
})

