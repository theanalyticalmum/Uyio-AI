'use client'

import { LucideIcon } from 'lucide-react'

interface GoalCardProps {
  icon: LucideIcon
  title: string
  description: string
  value: string
  selected: boolean
  onClick: () => void
}

export function GoalCard({ icon: Icon, title, description, value, selected, onClick }: GoalCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full p-6 rounded-lg border-2 text-left transition-all duration-200
        hover:shadow-md hover:scale-[1.02]
        ${
          selected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-sm'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
        }
      `}
    >
      <div className="flex items-start gap-4">
        <div
          className={`
          p-3 rounded-lg
          ${selected ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
        `}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </button>
  )
}


