'use client'

import { useState, useEffect } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { signInWithEmail } from '@/lib/auth/actions'
import { toast } from 'sonner'
import { Smartphone } from 'lucide-react'

// Detect mobile browser
function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export default function LoginPage() {
  const [sent, setSent] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileBrowser())
  }, [])

  const handleLogin = async (email: string) => {
    const result = await signInWithEmail(email)

    if (result.error) {
      toast.error(result.error)
      throw new Error(result.error)
    }

    setSent(true)
    
    if (isMobile) {
      toast.success('Check your email! Make sure to open the link in Safari or Chrome.')
    } else {
      toast.success('Check your email for the login link!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Uyio AI</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Sign in to continue</p>
        </div>

        {/* Mobile Warning Banner */}
        {isMobile && (
          <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  📱 Mobile User? Important!
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-400">
                  After clicking the magic link in your email, make sure to open it in <strong>Safari</strong> or <strong>Chrome</strong> (not in the email app).
                  <br />
                  Tap the menu (⋯) and select &quot;Open in Browser&quot;.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Check your email!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We sent you a magic link. Click it to sign in instantly.
              </p>
              
              {/* Mobile-specific instructions */}
              {isMobile && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
                  <p className="text-sm text-yellow-900 dark:text-yellow-300 font-medium mb-2">
                    📱 Don&apos;t forget!
                  </p>
                  <p className="text-xs text-yellow-800 dark:text-yellow-400">
                    Open the link in Safari or Chrome, not in your email app. This ensures your session works properly.
                  </p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Didn&apos;t receive it?{' '}
                <button onClick={() => setSent(false)} className="text-blue-500 hover:text-blue-600 font-medium">
                  Try again
                </button>
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Sign in</h2>
              <AuthForm
                type="login"
                onSubmit={handleLogin}
                submitText="Send Magic Link"
                footerLink={{
                  text: 'New here?',
                  linkText: 'Sign up',
                  href: '/auth/signup',
                }}
              />
            </>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-6">
          We&apos;ll email you a magic link for a password-free sign in.
        </p>
      </div>
    </div>
  )
}


