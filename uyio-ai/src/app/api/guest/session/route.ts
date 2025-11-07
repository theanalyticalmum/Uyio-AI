import { NextResponse } from 'next/server'
import { generousRateLimit, getIdentifier, formatResetTime } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    // 🔒 Rate limiting: 60 requests per minute per IP (generous for guest tracking)
    const identifier = getIdentifier(request)
    const rateLimitResult = await generousRateLimit.check(identifier)
    
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

export async function GET(request: Request) {
  // 🔒 Rate limiting: 60 requests per minute per IP
  const identifier = getIdentifier(request)
  const rateLimitResult = await generousRateLimit.check(identifier)
  
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
  
  return NextResponse.json({
    message: 'Guest session API',
    endpoints: {
      POST: 'Track guest sessions',
    },
  })
}


