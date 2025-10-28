'use client'

import { Loader2, AudioWaveform, AlertCircle } from 'lucide-react'

interface TranscriptionStatusProps {
  status: 'transcribing' | 'analyzing' | 'error' | 'complete'
  error?: string | null
  onRetry?: () => void
}

export function TranscriptionStatus({ status, error, onRetry }: TranscriptionStatusProps) {
  if (status === 'complete' && !error) return null

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Transcribing State */}
      {status === 'transcribing' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <AudioWaveform className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
              <div className="absolute inset-0 animate-ping">
                <AudioWaveform className="w-8 h-8 text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                Listening to your recording...
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Converting speech to text
              </p>
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 dark:bg-blue-400 h-full animate-progress-slide" />
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {status === 'analyzing' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-4 mb-4">
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            <div>
              <p className="text-lg font-semibold text-purple-900 dark:text-purple-300">
                Analyzing your performance...
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-400">
                AI coach is reviewing your response
              </p>
            </div>
          </div>
          
          {/* Animated progress bar */}
          <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 dark:bg-purple-400 h-full animate-progress-slide" />
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && error && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">
                Processing failed
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  )
}


