// src/components/feedback/AudioPlayback.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Download, Volume2 } from 'lucide-react'

interface AudioPlaybackProps {
  audioUrl: string
  transcript: string
}

export function AudioPlayback({ audioUrl, transcript }: AudioPlaybackProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2]
    const currentIndex = speeds.indexOf(playbackSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    setPlaybackSpeed(nextSpeed)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed
    }
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `uyio-recording-${Date.now()}.webm`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-4">
        <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Your Recording
        </h3>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="space-y-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Play Recording</span>
            </>
          )}
        </button>

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={changeSpeed}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            Speed: {playbackSpeed}x
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>
    </div>
  )
}

