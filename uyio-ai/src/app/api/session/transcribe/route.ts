import { NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/openai/transcribe'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { audioUrl } = body

    // Validate input
    if (!audioUrl || typeof audioUrl !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid audioUrl' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(audioUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid audio URL format' },
        { status: 400 }
      )
    }

    // Transcribe the audio
    const result = await transcribeAudio(audioUrl)

    return NextResponse.json({
      success: true,
      transcript: result.transcript,
      wordCount: result.wordCount,
      duration: result.duration,
      language: result.language,
    })
  } catch (error) {
    console.error('Transcription API error:', error)

    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to transcribe audio'

    // Check for specific error types
    if (errorMessage.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API rate limit reached. Please try again in a moment.' },
        { status: 429 }
      )
    }

    if (errorMessage.includes('invalid_audio') || errorMessage.includes('Invalid audio')) {
      return NextResponse.json(
        { error: 'Invalid audio format. Please record again with a supported browser.' },
        { status: 400 }
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
    message: 'Use POST with { audioUrl: string } to transcribe audio',
    endpoint: '/api/session/transcribe',
  })
}


