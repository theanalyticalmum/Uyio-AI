// src/components/progress/FilterBar.tsx
'use client'

import { RotateCcw } from 'lucide-react'

export interface ProgressFilters {
  dateRange: 7 | 30 | 90 | 365
  scenarioType: 'all' | 'work' | 'social' | 'everyday'
  goal: 'all' | 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'
}

interface FilterBarProps {
  filters: ProgressFilters
  onFilterChange: (filters: ProgressFilters) => void
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const handleReset = () => {
    onFilterChange({
      dateRange: 30,
      scenarioType: 'all',
      goal: 'all',
    })
  }

  const isFiltered = filters.dateRange !== 30 || filters.scenarioType !== 'all' || filters.goal !== 'all'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-center gap-4">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period:</label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: Number(e.target.value) as 7 | 30 | 90 | 365 })}
            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>All time</option>
          </select>
        </div>

        {/* Scenario Type */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Context:</label>
          <select
            value={filters.scenarioType}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                scenarioType: e.target.value as ProgressFilters['scenarioType'],
              })
            }
            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Contexts</option>
            <option value="work">Work</option>
            <option value="social">Social</option>
            <option value="everyday">Everyday</option>
          </select>
        </div>

        {/* Goal Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Goal:</label>
          <select
            value={filters.goal}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                goal: e.target.value as ProgressFilters['goal'],
              })
            }
            className="px-3 py-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Goals</option>
            <option value="clarity">Clarity</option>
            <option value="confidence">Confidence</option>
            <option value="persuasion">Persuasion</option>
            <option value="fillers">Reduce Fillers</option>
            <option value="quick_thinking">Quick Thinking</option>
          </select>
        </div>

        {/* Reset Button */}
        {isFiltered && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  )
}

