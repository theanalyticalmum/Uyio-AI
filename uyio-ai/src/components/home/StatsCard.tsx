'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatsCardProps {
  label: string
  value: number | string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  suffix?: string
  animate?: boolean
}

export function StatsCard({
  label,
  value,
  icon,
  trend,
  color = 'blue',
  suffix = '',
  animate = true,
}: StatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value as number)
      return
    }

    let start = 0
    const end = value as number
    const duration = 1000
    const increment = end / (duration / 16)

    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setDisplayValue(end)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value, animate])

  const colorClasses = {
    blue: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    green: 'text-green-500 bg-green-100 dark:bg-green-900/30',
    amber: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    purple: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
  }

  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingDown className="w-4 h-4 text-red-500" />,
    neutral: <Minus className="w-4 h-4 text-gray-400" />,
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl ${
            colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
          }`}
        >
          {icon}
        </div>
        {trend && <div>{trendIcons[trend]}</div>}
      </div>

      <div className="space-y-1">
        <p className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">
          {typeof value === 'number' && animate ? displayValue : value}
          {suffix}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}


