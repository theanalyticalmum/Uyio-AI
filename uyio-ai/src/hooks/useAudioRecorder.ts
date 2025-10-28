'use client'

import { useState, useRef, useEffect } from 'react'

interface UseAudioRecorderReturn {
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob | null>
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

      // Check browser support for audio formats
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/wav'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder

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

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error starting recording:', err)
      setError('Failed to access microphone. Please check your permissions.')
    }
  }

  const stopRecording = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null)
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        
        // Stop all tracks
        const stream = mediaRecorderRef.current?.stream
        stream?.getTracks().forEach((track) => track.stop())

        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        setIsRecording(false)
        resolve(blob)
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


