import OpenAI from 'openai'

/**
 * OpenAI Client Configuration
 */

if (!process.env.OPENAI_API_KEY) {
  throw new Error(
    'Missing OPENAI_API_KEY environment variable. ' +
    'Please add it to your .env.local file. ' +
    'Get your API key from: https://platform.openai.com/api-keys'
  )
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30 seconds
  maxRetries: 2,
})

/**
 * Verify OpenAI client is configured correctly
 */
export async function verifyOpenAIConnection(): Promise<boolean> {
  try {
    // Simple test to verify API key works
    await openai.models.list()
    return true
  } catch (error) {
    console.error('OpenAI connection failed:', error)
    return false
  }
}


