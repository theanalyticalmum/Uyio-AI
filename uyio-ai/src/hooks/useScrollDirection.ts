'use client'

import { useState, useEffect } from 'react'

export type ScrollDirection = 'up' | 'down' | null

/**
 * Custom hook to detect scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    let lastScrollY = window.pageYOffset

    const updateScrollDirection = () => {
      const currentScrollY = window.pageYOffset
      const direction = currentScrollY > lastScrollY ? 'down' : 'up'

      if (direction !== scrollDirection && (currentScrollY - lastScrollY > 5 || currentScrollY - lastScrollY < -5)) {
        setScrollDirection(direction)
      }

      setScrollY(currentScrollY)
      lastScrollY = currentScrollY > 0 ? currentScrollY : 0
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => window.removeEventListener('scroll', updateScrollDirection)
  }, [scrollDirection])

  return { scrollDirection, scrollY }
}


