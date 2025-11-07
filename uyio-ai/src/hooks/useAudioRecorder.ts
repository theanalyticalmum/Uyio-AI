'use client'

import { useState, useRef, useEffect } from 'react'

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<{ blob: Blob | null; duration: number }>
  isRecording: boolean
  recordingTime: number
  error: string | null
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0) // Precise start time using performance.now()
  const mimeTypeRef = useRef<string>('audio/webm') // Store actual MIME type used

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async (): Promise<void> => {
    try {
      setError(null)
      chunksRef.current = []

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Detect best supported audio format with codec-specific fallbacks
      let mimeType = 'audio/webm' // Default for Chrome/Firefox
      
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus' // Best quality for Chrome/Firefox
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm' // Fallback webm
      } else if (MediaRecorder.isTypeSupported('audio/mp4;codecs=mp4a.40.2')) {
        mimeType = 'audio/mp4;codecs=mp4a.40.2' // Safari with AAC codec
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4' // Generic Safari fallback
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus' // Firefox fallback
      } else {
        mimeType = '' // Let browser choose (last resort)
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = mediaRecorder
      
      // Store the actual MIME type being used (browser may override)
      mimeTypeRef.current = mediaRecorder.mimeType || mimeType

      // Collect audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Capture precise start time for accurate duration calculation
      startTimeRef.current = performance.now()

      // Start timer (for UI display only, actual duration calculated on stop)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = (): Promise<{ blob: Blob | null; duration: number }> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve({ blob: null, duration: 0 })
        return
      }

      mediaRecorderRef.current.onstop = () => {
        // Use the actual MIME type from MediaRecorder (handles Safari/Chrome differences)
        const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current })
        
        // Calculate precise duration in seconds (with decimal precision)
        const endTime = performance.now()
        const durationMs = endTime - startTimeRef.current
        const duration = durationMs / 1000 // Convert to seconds with decimals
        
        // Stop all tracks
        const stream = mediaRecorderRef.current?.stream
        stream?.getTracks().forEach((track) => track.stop())

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        setIsRecording(false)
        resolve({ blob, duration })
      }

      mediaRecorderRef.current.stop()
    })
  }

  return {
    startRecording,
    stopRecording,
    isRecording,
    recordingTime,
    error,
  }
}


