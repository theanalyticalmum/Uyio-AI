/**
 * Master list of filler words for detection and highlighting
 * Used across metrics calculation, transcript highlighting, and GPT prompts
 * 
 * SINGLE SOURCE OF TRUTH - Import from here everywhere
 */
export const FILLER_WORDS = [
  // Single word fillers
  'um',
  'uh',
  'like',
  'so',
  'basically',
  'actually',
  'literally',
  'right',
  'okay',
  'well',
  
  // Multi-word fillers
  'you know',
  'I mean',
  'kind of',
  'sort of',
  'you see',
  'I guess',
] as const

export type FillerWord = typeof FILLER_WORDS[number]

/**
 * Helper for regex escaping special characters
 * Needed for fillers like "I guess" to properly match in regex
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

