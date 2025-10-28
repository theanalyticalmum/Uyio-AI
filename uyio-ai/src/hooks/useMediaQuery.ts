'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook to detect screen size breakpoints
 */
export function useMediaQuery() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 639px)')
    const tabletQuery = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
    const desktopQuery = window.matchMedia('(min-width: 1024px)')

    const updateMedia = () => {
      setIsMobile(mobileQuery.matches)
      setIsTablet(tabletQuery.matches)
      setIsDesktop(desktopQuery.matches)
    }

    // Initial check
    updateMedia()

    // Add listeners
    mobileQuery.addEventListener('change', updateMedia)
    tabletQuery.addEventListener('change', updateMedia)
    desktopQuery.addEventListener('change', updateMedia)

    return () => {
      mobileQuery.removeEventListener('change', updateMedia)
      tabletQuery.removeEventListener('change', updateMedia)
      desktopQuery.removeEventListener('change', updateMedia)
    }
  }, [])

  return { isMobile, isTablet, isDesktop }
}


