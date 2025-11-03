// src/components/feedback/TranscriptView.tsx
'use client'

import { useState, useCallback } from 'react'
import { FileText, Copy, Check, ChevronDown, ChevronUp, ZoomIn, ZoomOut } from 'lucide-react'
import { FILLER_WORDS } from '@/lib/constants/fillers'

interface TranscriptViewProps {
  transcript: string
  detectedMetrics: {
    wpm: number
    fillerCount: number
    avgPauseLength: number
  }
}

export function TranscriptView({ transcript, detectedMetrics }: TranscriptViewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [textSize, setTextSize] = useState('base')

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 🔒 SECURITY FIX: Use React components instead of dangerouslySetInnerHTML
  // This prevents XSS attacks from malicious transcript content
  const highlightFillers = useCallback((text: string) => {
    const words = text.split(/(\s+)/) // Split by spaces, keeping spaces
    return words.map((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:]$/, '') // Remove punctuation for matching
      // Cast FILLER_WORDS to readonly string[] for includes() to accept any string
      if ((FILLER_WORDS as readonly string[]).includes(cleanWord)) {
        return (
          <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1 rounded">
            {word}
          </span>
        )
      }
      return <span key={index}>{word}</span>
    })
  }, [])

  const wordCount = transcript.split(/\s+/).length
  const textSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transcript
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          {isExpanded ? (
            <>
              <span>Collapse</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Expand</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Metrics */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Words:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{wordCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Speed:</span>
          <span className="font-semibold text-gray-900 dark:text-white">{detectedMetrics.wpm} WPM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Filler Words:</span>
          <span className="font-semibold text-red-600 dark:text-red-400">{detectedMetrics.fillerCount}</span>
        </div>
      </div>

      {/* Transcript Text */}
      <div
        className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 ${
          isExpanded ? 'max-h-none' : 'max-h-32 overflow-hidden'
        } relative`}
      >
        <div className={`text-gray-700 dark:text-gray-300 leading-relaxed ${textSizeClasses[textSize as keyof typeof textSizeClasses]}`}>
          {highlightFillers(transcript)}
        </div>
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent" />
        )}
      </div>

      {/* Controls */}
      {isExpanded && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTextSize('sm')}
              className={`p-2 rounded ${
                textSize === 'sm'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Small text"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setTextSize('base')}
              className={`p-2 rounded text-sm font-medium ${
                textSize === 'base'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              A
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`p-2 rounded ${
                textSize === 'lg'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              title="Large text"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

