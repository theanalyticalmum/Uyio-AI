'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: 'up' | 'down' | null
  color?: string
  sublabel?: string
}

export function StatsCard({ 
  icon, 
  label, 
  value, 
  trend, 
  color = 'blue',
  sublabel 
}: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {label}
        </p>
        {sublabel && (
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {sublabel}
          </p>
        )}
      </div>
    </div>
  )
}
