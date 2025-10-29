'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, XCircle, Loader2, Database } from 'lucide-react'

export default function TestDatabasePage() {
  const [results, setResults] = useState<{
    connection: 'loading' | 'success' | 'error'
    auth: 'loading' | 'success' | 'error'
    tables: 'loading' | 'success' | 'error'
    details: {
      user: any
      tableCount: number
      error?: string
    }
  }>({
    connection: 'loading',
    auth: 'loading',
    tables: 'loading',
    details: {
      user: null,
      tableCount: 0,
    },
  })

  useEffect(() => {
    testDatabase()
  }, [])

  const testDatabase = async () => {
    try {
      const supabase = createClient()

      // Test 1: Connection
      const { error: connectionError } = await supabase.from('profiles').select('count')
      if (connectionError) {
        setResults((prev) => ({
          ...prev,
          connection: 'error',
          details: { ...prev.details, error: connectionError.message },
        }))
        return
      }
      setResults((prev) => ({ ...prev, connection: 'success' }))

      // Test 2: Authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setResults((prev) => ({
        ...prev,
        auth: user ? 'success' : 'error',
        details: { ...prev.details, user },
      }))

      // Test 3: Tables
      const tables = ['profiles', 'scenarios', 'sessions', 'courses', 'course_lessons']
      let tableCount = 0

      for (const table of tables) {
        const { error } = await supabase.from(table).select('count').limit(1)
        if (!error) tableCount++
      }

      setResults((prev) => ({
        ...prev,
        tables: tableCount === tables.length ? 'success' : 'error',
        details: { ...prev.details, tableCount },
      }))
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        connection: 'error',
        details: { ...prev.details, error: error.message },
      }))
    }
  }

  const StatusIcon = ({ status }: { status: 'loading' | 'success' | 'error' }) => {
    if (status === 'loading') return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
    if (status === 'success') return <CheckCircle className="w-5 h-5 text-green-500" />
    return <XCircle className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Database className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Database Connection Test
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Testing Supabase connection and tables
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
          {/* Connection Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.connection} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Database Connection
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {results.connection === 'success'
                    ? 'Connected to Supabase'
                    : results.connection === 'error'
                    ? 'Connection failed'
                    : 'Checking...'}
                </p>
              </div>
            </div>
          </div>

          {/* Auth Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.auth} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {results.auth === 'success'
                    ? `Logged in as ${results.details.user?.email}`
                    : results.auth === 'error'
                    ? 'Not authenticated (sign in first)'
                    : 'Checking...'}
                </p>
              </div>
            </div>
          </div>

          {/* Tables Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <StatusIcon status={results.tables} />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Database Tables</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {results.tables === 'success'
                    ? `All 5 tables found ✓`
                    : results.tables === 'error'
                    ? `Only ${results.details.tableCount}/5 tables found`
                    : 'Checking...'}
                </p>
              </div>
            </div>
          </div>

          {/* Error Details */}
          {results.details.error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">Error Details:</h4>
              <code className="text-sm text-red-800 dark:text-red-400 break-all">
                {results.details.error}
              </code>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              📋 Setup Checklist:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
              <li>
                {results.connection === 'success' ? '✅' : '❌'} Supabase credentials configured
              </li>
              <li>
                {results.tables === 'success' ? '✅' : '❌'} Database schema run in Supabase SQL
                Editor
              </li>
              <li>
                {results.auth === 'success' ? '✅' : '⚠️'} User authenticated (optional for this
                test)
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={testDatabase}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Run Test Again
          </button>
        </div>

        {/* Instructions */}
        {results.tables === 'error' && (
          <div className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <h3 className="font-bold text-yellow-900 dark:text-yellow-300 mb-3">
              🚨 Database Setup Required
            </h3>
            <ol className="text-sm text-yellow-800 dark:text-yellow-400 space-y-2 list-decimal list-inside">
              <li>Go to your Supabase dashboard</li>
              <li>Click "SQL Editor" in the sidebar</li>
              <li>
                Copy the contents of <code className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded">src/lib/supabase/schema.sql</code>
              </li>
              <li>Paste and run it in the SQL Editor</li>
              <li>Come back and refresh this page</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

