import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { guestId, action } = body

    if (!guestId) {
      return NextResponse.json({ error: 'Guest ID required' }, { status: 400 })
    }

    if (action === 'check') {
      // In a real app, you might check server-side limits here
      // For now, we rely on client-side localStorage
      return NextResponse.json({
        canPractice: true,
        remaining: 3,
      })
    }

    if (action === 'increment') {
      // Log guest usage (optional - could store in database)
      console.log(`Guest ${guestId} completed a session`)
      
      return NextResponse.json({
        success: true,
        message: 'Session recorded',
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Guest session API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Guest session API',
    endpoints: {
      POST: 'Track guest sessions',
    },
  })
}


