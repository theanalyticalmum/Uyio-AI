import { STORAGE_CONFIG } from '@/lib/storage/config'

/**
 * Convert Blob to File object with proper naming
 */
export function convertBlobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, {
    type: blob.type || 'audio/webm',
    lastModified: Date.now(),
  })
}

/**
 * Get audio duration from blob
 */
export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(blob)

    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(audio.duration)
    })

    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load audio metadata'))
    })

    audio.src = url
  })
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check file size
  if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`,
    }
  }

  // Check file type (support MIME types with or without codecs)
  // e.g., "audio/webm;codecs=opus" should match "audio/webm"
  const fileTypeBase = file.type.split(';')[0] // Get base type without codec
  const isValidType = STORAGE_CONFIG.ALLOWED_AUDIO_TYPES.some(
    allowedType => fileTypeBase === allowedType || file.type.startsWith(allowedType)
  )
  
  if (!isValidType) {
    return {
      valid: false,
      error: `Invalid audio format: ${file.type}. Supported formats: ${STORAGE_CONFIG.ALLOWED_AUDIO_TYPES.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Generate unique filename for recording
 */
export function generateAudioFilename(userId: string, extension = '.webm'): string {
  const timestamp = Date.now()
  return `${userId}_${timestamp}${extension}`
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}


