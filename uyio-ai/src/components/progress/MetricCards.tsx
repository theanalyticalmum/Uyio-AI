// src/components/progress/MetricCards.tsx
'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MetricAverages, Trend } from '@/lib/stats/calculator'

interface MetricCardsProps {
  averages: MetricAverages
  trends: Trend[]
  onMetricClick?: (metric: string) => void
}

export function MetricCards({ averages, trends, onMetricClick }: MetricCardsProps) {
  const metrics = [
    {
      name: 'Clarity',
      key: 'clarity' as keyof Omit<MetricAverages, 'overall'>,
      color: 'blue',
      icon: '🎯',
    },
    {
      name: 'Confidence',
      key: 'confidence' as keyof Omit<MetricAverages, 'overall'>,
      color: 'green',
      icon: '💪',
    },
    {
      name: 'Logic',
      key: 'logic' as keyof Omit<MetricAverages, 'overall'>,
      color: 'purple',
      icon: '🧠',
    },
    {
      name: 'Pacing',
      key: 'pacing' as keyof Omit<MetricAverages, 'overall'>,
      color: 'orange',
      icon: '⏱️',
    },
    {
      name: 'Fillers',
      key: 'fillers' as keyof Omit<MetricAverages, 'overall'>,
      color: 'red',
      icon: '🚫',
    },
  ]

  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
    green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10',
    orange: 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10',
    red: 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10',
  }

  const getTrendForMetric = (metricKey: string): Trend | undefined => {
    return trends.find((t) => t.metric === metricKey)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => {
        const trend = getTrendForMetric(metric.key)
        const average = averages[metric.key]

        return (
          <button
            key={metric.key}
            onClick={() => onMetricClick?.(metric.key)}
            className={`text-left bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border-2 ${
              colorClasses[metric.color as keyof typeof colorClasses]
            } hover:shadow-md transition-all duration-200 hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{metric.icon}</span>
              {trend && (
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    trend.direction === 'up'
                      ? 'text-green-600 dark:text-green-400'
                      : trend.direction === 'down'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                  {trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                  {trend.direction === 'stable' && <Minus className="w-4 h-4" />}
                  <span>{Math.abs(trend.change)}%</span>
                </div>
              )}
            </div>

            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{metric.name}</h3>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{average}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">/10</span>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  average >= 8
                    ? 'bg-green-500'
                    : average >= 5
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${(average / 10) * 100}%` }}
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

