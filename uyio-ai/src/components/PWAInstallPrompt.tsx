'use client'

import { useState, useEffect } from 'react'
import { Smartphone } from 'lucide-react'

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check conditions for showing PWA prompt
    const checkConditions = () => {
      // Only check in browser environment
      if (typeof window === 'undefined') return
      
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      
      // Show only if: mobile and not already installed
      if (isMobile && !isStandalone) {
        setShowPrompt(true)
      }
    }

    // Listen for install prompt (Android/Chrome)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    checkConditions()

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setShowPrompt(false)
      }
      setDeferredPrompt(null)
    }
  }

  if (!showPrompt) return null

  // iOS-specific instructions (no install prompt API)
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  if (isIOS) {
    return (
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
        <div className="flex gap-3 mb-3">
          <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white mb-2">Use Uyio like an app</h4>
            <p className="text-sm text-gray-400 mb-3">
              Install on your phone for quick access - no download needed.
            </p>
            <p className="text-sm text-gray-300">
              Tap the share icon <span className="inline-block px-1">↗</span> below and choose &quot;Add to Home Screen&quot;
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Android/Chrome install prompt
  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
      <div className="flex gap-3">
        <Smartphone className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-white mb-2">Install Uyio on Your Phone</h4>
          <p className="text-sm text-gray-400 mb-3">
            Quick access to your practice sessions - works offline too.
          </p>
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg transition-colors"
            >
              Install Now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

