// src/hooks/useAnimatedScore.ts
'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook for animating score count-up from 0 to target
 * @param targetScore The final score to count up to
 * @param duration Animation duration in milliseconds
 * @returns The current animated score value
 */
export function useAnimatedScore(targetScore: number, duration: number = 1500): number {
  const [currentScore, setCurrentScore] = useState(0)

  useEffect(() => {
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)

      // Easing function: easeOutCubic for smooth deceleration
      const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)
      const easedProgress = easeOutCubic(progress)

      setCurrentScore(Math.round(easedProgress * targetScore))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [targetScore, duration])

  return currentScore
}

