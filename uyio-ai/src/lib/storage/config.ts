/**
 * Storage configuration for Supabase
 */

export const STORAGE_CONFIG = {
  // Storage bucket name
  BUCKET: 'recordings',

  // File size limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB

  // Allowed audio types
  ALLOWED_AUDIO_TYPES: [
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
  ],

  // Retention policies
  GUEST_RETENTION_HOURS: 1,
  USER_RETENTION_DAYS: 30,

  // File naming
  FILE_EXTENSION: '.webm',
} as const

export const UPLOAD_ERRORS = {
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
  INVALID_FORMAT: 'Invalid audio format. Please use a supported browser.',
  UPLOAD_FAILED: 'Upload failed. Please try again.',
  NETWORK_ERROR: 'Network error. Check your connection and retry.',
  STORAGE_FULL: 'Storage quota exceeded. Please contact support.',
  UNAUTHORIZED: 'Authentication required to upload recordings.',
} as const


