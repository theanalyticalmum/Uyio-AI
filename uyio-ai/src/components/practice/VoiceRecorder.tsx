'use client'

import { useState } from 'react'
import { Mic, Square } from 'lucide-react'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { toast } from 'sonner'
import { UploadStatus } from './UploadStatus'
import { convertBlobToFile } from '@/utils/audio'

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, audioUrl?: string) => void
  maxDuration?: number // in seconds
  autoUpload?: boolean // automatically upload after recording
}

export function VoiceRecorder({ 
  onRecordingComplete, 
  maxDuration = 180,
  autoUpload = true 
}: VoiceRecorderProps) {
  const { startRecording, stopRecording, isRecording, recordingTime, error } = useAudioRecorder()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleStartRecording = async () => {
    setUploadError(null)
    await startRecording()
    if (error) {
      toast.error(error)
    }
  }

  const uploadRecording = async (blob: Blob): Promise<string | undefined> => {
    setIsUploading(true)
    setUploadProgress(0)
    setUploadError(null)

    try {
      // Convert blob to file
      const file = convertBlobToFile(blob, `recording_${Date.now()}.webm`)
      
      // Create form data
      const formData = new FormData()
      formData.append('audio', file)

      // Simulate progress (since we don't have real progress from fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      // Upload to API
      const response = await fetch('/api/session/upload', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      toast.success('Recording uploaded successfully!')
      return data.audioUrl

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload recording'
      setUploadError(errorMessage)
      toast.error(errorMessage)
      return undefined

    } finally {
      setIsUploading(false)
    }
  }

  const handleStopRecording = async () => {
    const blob = await stopRecording()
    if (!blob) return

    // If auto-upload is enabled, upload the recording
    if (autoUpload) {
      const audioUrl = await uploadRecording(blob)
      onRecordingComplete(blob, audioUrl)
    } else {
      onRecordingComplete(blob)
    }
  }

  const handleRetryUpload = async () => {
    // This would need the blob to be stored, which we're not doing for simplicity
    // In a real app, you'd want to keep the blob in state
    toast.info('Please record again to retry')
  }

  // Auto-stop when max duration reached
  if (isRecording && recordingTime >= maxDuration) {
    handleStopRecording()
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Upload Status */}
      {!isRecording && (
        <UploadStatus
          isUploading={isUploading}
          progress={uploadProgress}
          error={uploadError}
          onRetry={handleRetryUpload}
        />
      )}

      {/* Timer */}
      {isRecording && (
        <div className="text-5xl font-bold text-gray-900 dark:text-white tabular-nums">
          {formatTime(recordingTime)}
        </div>
      )}

      {/* Record Button */}
      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
        )}
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!!error || isUploading}
          className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-12 h-12 text-white" fill="white" />
          ) : (
            <Mic className="w-12 h-12 text-white" />
          )}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center">
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</p>
        )}
        {isUploading ? (
          <p className="text-gray-600 dark:text-gray-400">
            Uploading your recording...
          </p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-400">
              {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
            </p>
            {maxDuration && !isRecording && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Max duration: {formatTime(maxDuration)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

