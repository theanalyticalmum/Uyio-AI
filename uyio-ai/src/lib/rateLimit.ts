/**
 * Rate Limiting Utility
 * 
 * Protects API routes from abuse and prevents unexpected costs.
 * Uses in-memory LRU cache for simplicity (works on serverless).
 */

import { LRUCache } from 'lru-cache'

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed per interval
   */
  limit: number
  
  /**
   * Time window in milliseconds
   */
  interval: number
  
  /**
   * Maximum number of unique tokens to track
   * (prevents memory overflow)
   */
  uniqueTokenPerInterval?: number
}

/**
 * Creates a rate limiter
 */
export function rateLimit(config: RateLimitConfig) {
  const tokenCache = new LRUCache<string, number[]>({
    max: config.uniqueTokenPerInterval || 500,
    ttl: config.interval,
  })

  return {
    /**
     * Check if a request should be rate limited
     * @param token Unique identifier (usually IP address or user ID)
     * @returns Promise that resolves if allowed, rejects if rate limited
     */
    check: async (token: string): Promise<{ success: true } | { success: false; reset: number }> => {
      const tokenCount = tokenCache.get(token) || [0]
      
      if (tokenCount[0] === 0) {
        tokenCache.set(token, tokenCount)
      }
      
      tokenCount[0] += 1
      const currentUsage = tokenCount[0]
      
      if (currentUsage > config.limit) {
        // Calculate when the limit will reset
        const resetTime = Date.now() + config.interval
        return {
          success: false,
          reset: resetTime,
        }
      }
      
      return { success: true }
    },
    
    /**
     * Get current usage for a token
     */
    getUsage: (token: string): number => {
      const tokenCount = tokenCache.get(token)
      return tokenCount ? tokenCount[0] : 0
    },
    
    /**
     * Reset usage for a token
     */
    reset: (token: string): void => {
      tokenCache.delete(token)
    },
  }
}

/**
 * Get identifier from request (IP address or user ID)
 */
export function getIdentifier(request: Request, fallback: string = 'anonymous'): string {
  // Try to get IP from various headers (works with Vercel/Netlify/etc)
  const ip = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    fallback
  
  return ip.trim()
}

/**
 * Format time until reset (for error messages)
 */
export function formatResetTime(resetTimestamp: number): string {
  const seconds = Math.ceil((resetTimestamp - Date.now()) / 1000)
  
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`
  }
  
  const minutes = Math.ceil(seconds / 60)
  return `${minutes} minute${minutes === 1 ? '' : 's'}`
}

// Pre-configured rate limiters for different API routes

/**
 * Strict rate limit for expensive AI operations (transcription, analysis)
 * 10 requests per minute per IP
 */
export const strictRateLimit = rateLimit({
  limit: 10,
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

/**
 * Moderate rate limit for file uploads
 * 20 requests per minute per IP
 */
export const moderateRateLimit = rateLimit({
  limit: 20,
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

/**
 * Generous rate limit for cheap operations (scenario generation)
 * 60 requests per minute per IP
 */
export const generousRateLimit = rateLimit({
  limit: 60,
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

