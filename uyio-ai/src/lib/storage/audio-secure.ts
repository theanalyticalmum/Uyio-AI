/**
 * SECURE VERSION - Uses private bucket with signed URLs
 * Replace audio.ts with this file if you implement the secure storage schema
 */

import { STORAGE_CONFIG, UPLOAD_ERRORS } from './config'
import { generateAudioFilename } from '@/utils/audio'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Upload audio blob to Supabase Storage (Private Bucket)
 * 
 * @param audioBlob - The audio file as a Blob
 * @param userId - User ID for file organization
 * @param supabase - Supabase client instance (pass from API route for proper auth context)
 */
export async function uploadAudio(
  audioBlob: Blob,
  userId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  try {

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

    // Get SIGNED URL instead of public URL (expires after 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET)
      .createSignedUrl(data.path, 3600) // 1 hour expiry

    if (urlError || !signedUrlData) {
      console.error('Signed URL error:', urlError)
      return {
        success: false,
        error: 'Failed to generate access URL',
      }
    }

    return {
      success: true,
      audioUrl: signedUrlData.signedUrl,
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
 * Get a new signed URL for an existing recording
 * Call this before playback if the original signed URL expired
 * 
 * @param filepath - Storage path (e.g., "userId/filename.webm")
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @param supabase - Supabase client instance (pass from API route for proper auth context)
 */
export async function refreshSignedUrl(
  filepath: string,
  expiresIn: number = 3600,
  supabase: SupabaseClient
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  try {

    const { data, error } = await supabase.storage
      .from(STORAGE_CONFIG.BUCKET)
      .createSignedUrl(filepath, expiresIn)

    if (error || !data) {
      return {
        success: false,
        error: 'Failed to refresh access URL',
      }
    }

    return {
      success: true,
      audioUrl: data.signedUrl,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to refresh URL',
    }
  }
}

/**
 * Delete audio file from storage
 * 
 * @param filepath - Storage path (e.g., "userId/filename.webm")
 * @param supabase - Supabase client instance (pass from API route for proper auth context)
 */
export async function deleteAudio(
  filepath: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {

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
 * Check if recordings bucket exists and is properly configured
 * 
 * @param supabase - Supabase client instance (pass from API route for proper auth context)
 */
export async function checkRecordingsBucket(supabase: SupabaseClient): Promise<boolean> {
  try {
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


