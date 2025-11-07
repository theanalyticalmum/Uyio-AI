import { openai } from './client'
import type { TranscriptionResult } from '@/types/feedback'

/**
 * Transcribe audio using OpenAI Whisper API
 */

export async function transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
  try {
    // Fetch the audio file
    const response = await fetch(audioUrl)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`)
    }

    const audioBlob = await response.blob()
    
    return await transcribeFromBlob(audioBlob)
  } catch (error) {
    console.error('Transcription error:', error)
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Failed to transcribe audio. Please try again.'
    )
  }
}

/**
 * Transcribe audio from a Blob directly
 */
export async function transcribeFromBlob(audioBlob: Blob): Promise<TranscriptionResult> {
  try {
    // Convert blob to File (required by OpenAI API)
    const file = new File([audioBlob], 'recording.webm', {
      type: audioBlob.type || 'audio/webm',
    })

    // Call Whisper API
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en', // Optimize for English
      response_format: 'verbose_json', // Get additional metadata
    })

    // Calculate word count accurately (filter out empty strings)
    const words = response.text.trim().split(/\s+/).filter(word => word.length > 0)
    const wordCount = words.length

    return {
      transcript: response.text,
      wordCount,
      duration: response.duration || 0,
      language: response.language || 'en',
    }
  } catch (error) {
    console.error('Whisper API error:', error)
    
    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        throw new Error('API rate limit reached. Please try again in a moment.')
      }
      if (error.message.includes('invalid_audio')) {
        throw new Error('Invalid audio format. Please record again.')
      }
    }
    
    throw new Error('Failed to transcribe audio. Please try again.')
  }
}

/**
 * Estimate audio duration from blob size (rough approximation)
 * Used as fallback if duration not available
 */
export function estimateAudioDuration(audioBlob: Blob): number {
  // Rough estimate: ~16KB per second for webm audio
  const bytesPerSecond = 16000
  return Math.round(audioBlob.size / bytesPerSecond)
}


