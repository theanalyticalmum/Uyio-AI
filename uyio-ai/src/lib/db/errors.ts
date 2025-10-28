// src/lib/db/errors.ts

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class NotFoundError extends DatabaseError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`)
    this.name = 'NotFoundError'
  }
}

export class PermissionError extends DatabaseError {
  constructor(action: string, resource: string) {
    super(`Permission denied: Cannot ${action} ${resource}`)
    this.name = 'PermissionError'
  }
}

export class ValidationError extends DatabaseError {
  constructor(field: string, message: string) {
    super(`Validation failed for ${field}: ${message}`)
    this.name = 'ValidationError'
  }
}

/**
 * Wrap database operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error
    }
    
    console.error(`Database error in ${context}:`, error)
    throw new DatabaseError(
      `Failed to ${context}`,
      error
    )
  }
}

/**
 * Retry logic for transient database failures
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: unknown
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      // Don't retry on validation or permission errors
      if (error instanceof ValidationError || error instanceof PermissionError) {
        throw error
      }
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)))
      }
    }
  }
  
  throw new DatabaseError(
    `Operation failed after ${maxRetries} attempts`,
    lastError
  )
}

