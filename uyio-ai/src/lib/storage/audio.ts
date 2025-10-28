import { createClient } from '@/lib/supabase/client'
import { STORAGE_CONFIG, UPLOAD_ERRORS } from './config'
import { generateAudioFilename } from '@/utils/audio'

/**
 * ⚠️ MVP VERSION - PUBLIC BUCKET
 * 
 * This uses a public storage bucket for simplicity.
 * 
 * ⚠️ BEFORE PRODUCTION: Switch to audio-secure.ts which uses:
 * - Private bucket with signed URLs
 * - Better access controls
 * - Enhanced security
 * 
 * See PRODUCTION_CHECKLIST.md for when to upgrade.
 */

/**
 * Upload audio blob to Supabase Storage
 */
export async function uploadAudio(
  audioBlob: Blob,
  userId: string
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  try {
    const supabase = createClient()

    // Generate filename
    const filename = generateAudioFilename(userId)
    const filepath = `${userId}/${filename}`

    // Convert blob to file
    const file = new File([audioBlob], filename, {
      type: audioBlob.type || 'audio/webm',
    })

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET)
      .upload(filepath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Upload error:', error)
      return {
        success: false,
        error: error.message || UPLOAD_ERRORS.UPLOAD_FAILED,
      }
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_CONFIG.BUCKET).getPublicUrl(data.path)

    return {
      success: true,
      audioUrl: publicUrl,
    }
  } catch (error) {
    console.error('Upload exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : UPLOAD_ERRORS.UPLOAD_FAILED,
    }
  }
}

/**
 * Delete audio file from storage
 */
export async function deleteAudio(audioUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()

    // Extract path from URL
    const url = new URL(audioUrl)
    const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/recordings\/(.+)/)

    if (!pathMatch) {
      return {
        success: false,
        error: 'Invalid audio URL',
      }
    }

    const filepath = pathMatch[1]

    // Delete from storage
    const { error } = await supabase.storage.from(STORAGE_CONFIG.BUCKET).remove([filepath])

    if (error) {
      console.error('Delete error:', error)
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete audio',
    }
  }
}

/**
 * Get public URL for audio file
 */
export function getAudioUrl(path: string): string {
  const supabase = createClient()
  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_CONFIG.BUCKET).getPublicUrl(path)
  return publicUrl
}

/**
 * Check if recordings bucket exists and is properly configured
 */
export async function checkRecordingsBucket(): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.storage.getBucket(STORAGE_CONFIG.BUCKET)

    if (error || !data) {
      console.warn('Recordings bucket not found or not accessible')
      return false
    }

    return true
  } catch (error) {
    console.error('Bucket check error:', error)
    return false
  }
}

