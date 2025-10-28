import { NextResponse } from 'next/server'
import { analyzeTranscript, calculateOverallScore } from '@/lib/openai/analyze'
import { createActionClient } from '@/lib/supabase/server'
import { strictRateLimit, getIdentifier, formatResetTime } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    // 🔒 Rate limiting: 10 requests per minute per IP
    const identifier = getIdentifier(request)
    const rateLimitResult = await strictRateLimit.check(identifier)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: `Too many requests. Please try again in ${formatResetTime(rateLimitResult.reset)}.`,
          retryAfter: rateLimitResult.reset,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      )
    }

    const body = await request.json()
    const { transcript, scenarioId, duration } = body

    // Validate input
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid transcript' },
        { status: 400 }
      )
    }

    if (!scenarioId || typeof scenarioId !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid scenarioId' },
        { status: 400 }
      )
    }

    // Check transcript isn't empty or too short
    const wordCount = transcript.trim().split(/\s+/).length
    if (wordCount < 5) {
      return NextResponse.json(
        { error: 'Transcript too short. Please record a longer response.' },
        { status: 400 }
      )
    }

    // Fetch scenario details from database
    const supabase = await createActionClient()
    const { data: scenario, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single()

    if (scenarioError || !scenario) {
      // If scenario not in database, create a basic one for analysis
      // This handles the case where we're using hardcoded scenarios
      console.warn('Scenario not found in database, using basic scenario')
      
      const basicScenario = {
        id: scenarioId,
        prompt_text: 'General communication practice',
        objective: 'Communicate clearly and confidently',
        eval_focus: ['clarity', 'confidence', 'logic', 'pacing', 'fillers'],
        goal: 'clarity',
        context: 'general',
        difficulty: 'medium',
      }

      const feedback = await analyzeTranscript(transcript, basicScenario as any, duration)
      const overallScore = calculateOverallScore(feedback.scores)

      return NextResponse.json({
        success: true,
        feedback,
        overallScore,
        wordCount,
      })
    }

    // Analyze the transcript
    const feedback = await analyzeTranscript(transcript, scenario, duration)
    const overallScore = calculateOverallScore(feedback.scores)

    return NextResponse.json({
      success: true,
      feedback,
      overallScore,
      wordCount,
    })
  } catch (error) {
    console.error('Analysis API error:', error)

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to analyze transcript'

    // Check for specific error types
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API rate limit reached. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (errorMessage.includes('Invalid feedback format')) {
      return NextResponse.json(
        { error: 'Received invalid feedback format. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST with { transcript: string, scenarioId: string, duration?: number } to analyze',
    endpoint: '/api/session/analyze',
  })
}


