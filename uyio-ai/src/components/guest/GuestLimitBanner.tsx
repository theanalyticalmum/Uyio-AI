'use client'

import { useEffect, useState } from 'react'
import { getRemainingSessionsToday, formatTimeUntilReset, canPracticeAsGuest } from '@/lib/auth/guest'
import { AlertCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export function GuestLimitBanner() {
  const [remaining, setRemaining] = useState(3)
  const [timeUntilReset, setTimeUntilReset] = useState('')
  const [canPractice, setCanPractice] = useState(true)

  useEffect(() => {
    const updateStatus = () => {
      setRemaining(getRemainingSessionsToday())
      setTimeUntilReset(formatTimeUntilReset())
      setCanPractice(canPracticeAsGuest())
    }

    updateStatus()
    const interval = setInterval(updateStatus, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (canPractice && remaining === 3) {
    return null // Don't show banner if no sessions used yet
  }

  return (
    <div
      className={`
      w-full px-4 py-3 text-sm font-medium text-center
      ${
        canPractice
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-b border-blue-200 dark:border-blue-800'
          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800'
      }
    `}
    >
      <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto">
        {canPractice ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>
              {remaining === 1 ? '1 free session' : `${remaining} free sessions`} left today
            </span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            <span>Daily limit reached</span>
            <span className="hidden sm:inline">• Resets in {timeUntilReset}</span>
            <Link
              href="/auth/signup"
              className="ml-2 underline font-semibold hover:no-underline"
            >
              Sign up for unlimited practice
            </Link>
          </>
        )}
      </div>
    </div>
  )
}


