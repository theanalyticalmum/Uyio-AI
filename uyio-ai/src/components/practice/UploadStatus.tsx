'use client'

import { CheckCircle, XCircle, Upload, Loader2 } from 'lucide-react'

interface UploadStatusProps {
  isUploading: boolean
  progress?: number
  error?: string | null
  onRetry?: () => void
}

export function UploadStatus({ isUploading, progress = 0, error, onRetry }: UploadStatusProps) {
  if (!isUploading && !error) return null

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Uploading State */}
      {isUploading && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Uploading recording...
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 dark:bg-blue-400 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {progress > 0 && (
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2 text-right">{progress}%</p>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !isUploading && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3 mb-3">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900 dark:text-red-300 mb-1">Upload failed</p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Retry Upload
            </button>
          )}
        </div>
      )}
    </div>
  )
}


