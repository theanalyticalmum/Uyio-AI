import { NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase/server'
import { uploadAudio } from '@/lib/storage/audio-secure' // 🔒 Private storage with signed URLs
import { validateAudioFile } from '@/utils/audio'
import { UPLOAD_ERRORS } from '@/lib/storage/config'
import { moderateRateLimit, getIdentifier, formatResetTime } from '@/lib/rateLimit'

export async function POST(request: Request) {
  try {
    // 🔒 Rate limiting: 20 requests per minute per IP (more generous for uploads)
    const identifier = getIdentifier(request)
    const rateLimitResult = await moderateRateLimit.check(identifier)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: `Too many upload requests. Please try again in ${formatResetTime(rateLimitResult.reset)}.`,
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

    // Get form data
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    // Validate file
    const validation = validateAudioFile(audioFile)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Get user ID (or generate guest ID)
    const supabase = await createActionClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let userId: string

    if (user) {
      userId = user.id
    } else {
      // Generate guest ID (you can also get this from a cookie/localStorage)
      userId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }

    // Convert File to Blob if needed
    const audioBlob = new Blob([await audioFile.arrayBuffer()], { type: audioFile.type })

    // Upload to Supabase Storage (pass server client for proper auth context)
    const result = await uploadAudio(audioBlob, userId, supabase)

    if (!result.success) {
      console.error('Upload failed:', {
        error: result.error,
        userId,
        fileSize: audioFile.size,
        fileType: audioFile.type,
      })
      
      return NextResponse.json(
        { 
          error: result.error || UPLOAD_ERRORS.UPLOAD_FAILED,
          details: 'Failed to upload to storage. Check if recordings-private bucket exists in Supabase.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      audioUrl: result.audioUrl,
      userId,
      size: audioFile.size,
      type: audioFile.type,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : UPLOAD_ERRORS.UPLOAD_FAILED },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to upload audio recordings',
    maxSize: '10MB',
    allowedFormats: ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'],
  })
}


