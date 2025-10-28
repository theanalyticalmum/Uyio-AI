'use client'

import { useState } from 'react'
import { AuthForm } from '@/components/auth/AuthForm'
import { signInWithEmail } from '@/lib/auth/actions'
import { toast } from 'sonner'

export default function LoginPage() {
  const [sent, setSent] = useState(false)

  const handleLogin = async (email: string) => {
    const result = await signInWithEmail(email)

    if (result.error) {
      toast.error(result.error)
      throw new Error(result.error)
    }

    setSent(true)
    toast.success('Check your email for the login link!')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Uyio AI</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Sign in to continue</p>
        </div>

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


