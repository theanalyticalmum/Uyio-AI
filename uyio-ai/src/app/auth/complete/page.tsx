'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuthCompletePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Completing sign-in...')

  useEffect(() => {
    async function completeAuth() {
      try {
        // Get tokens from URL
        const tokensParam = searchParams.get('tokens')
        const redirectPath = searchParams.get('redirect') || '/dashboard'

        if (!tokensParam) {
          throw new Error('No authentication tokens found')
        }

        setStatus('Setting up your session...')

        // Decode tokens
        const tokens = JSON.parse(decodeURIComponent(tokensParam))
        
        if (!tokens.access_token || !tokens.refresh_token) {
          throw new Error('Invalid authentication tokens')
        }

        // Set session client-side
        const supabase = createClient()
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
        })

        if (sessionError) {
          throw sessionError
        }

        setStatus('Success! Redirecting...')

        // Clean URL and redirect (remove tokens from history)
        window.history.replaceState({}, '', '/auth/complete')
        
        // Small delay to ensure session is fully set
        await new Promise(resolve => setTimeout(resolve, 500))
        
        router.push(redirectPath)
        
      } catch (err: any) {
        console.error('Auth completion error:', err)
        setError(err.message || 'Failed to complete authentication')
        setStatus('Authentication failed')
      }
    }

    completeAuth()
  }, [searchParams, router])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push('/auth/login')}
                className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {status}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we complete your sign-in...
          </p>
        </div>
      </div>
    </div>
  )
}

