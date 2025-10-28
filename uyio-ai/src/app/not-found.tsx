// src/app/not-found.tsx
import Link from 'next/link'
import { Home, Mic, TrendingUp } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-blue-500 mb-4">404</h1>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Oops! The page you're looking for doesn't exist. Let's get you back on track.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <Home className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Home</span>
          </Link>

          <Link
            href="/practice"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <Mic className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Practice</span>
          </Link>

          <Link
            href="/progress"
            className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">Progress</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

