// src/components/feedback/ActionButtons.tsx
'use client'

import { RefreshCw, Sparkles, TrendingUp, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ActionButtonsProps {
  scenarioId?: string
  sessionId?: string
}

export function ActionButtons({ scenarioId, sessionId }: ActionButtonsProps) {
  const router = useRouter()

  const handleTryAgain = () => {
    if (scenarioId) {
      router.push(`/practice?scenario=${scenarioId}`)
    } else {
      router.push('/practice')
    }
  }

  const handleNewScenario = () => {
    router.push('/practice')
  }

  const handleViewProgress = () => {
    router.push('/progress')
  }

  const handleShare = () => {
    if (sessionId) {
      const url = `${window.location.origin}/practice/feedback?session=${sessionId}`
      navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } else {
      toast.error('Cannot share this session')
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        What's Next?
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Try Again */}
        <button
          onClick={handleTryAgain}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        {/* New Scenario */}
        <button
          onClick={handleNewScenario}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Scenario</span>
        </button>

        {/* View Progress */}
        <button
          onClick={handleViewProgress}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
        >
          <TrendingUp className="w-4 h-4" />
          <span>View Progress</span>
        </button>

        {/* Share Result */}
        {sessionId && (
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        )}
      </div>
    </div>
  )
}

