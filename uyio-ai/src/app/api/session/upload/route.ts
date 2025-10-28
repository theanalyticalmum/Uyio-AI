import { NextResponse } from 'next/server'
import { createActionClient } from '@/lib/supabase/server'
import { uploadAudio } from '@/lib/storage/audio'
import { validateAudioFile } from '@/utils/audio'
import { UPLOAD_ERRORS } from '@/lib/storage/config'

export async function POST(request: Request) {
  try {
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

    // Upload to Supabase Storage
    const result = await uploadAudio(audioBlob, userId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || UPLOAD_ERRORS.UPLOAD_FAILED },
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


