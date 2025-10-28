import { Clock, Target, Lightbulb } from 'lucide-react'
import { Badge } from '../common/Badge'
import type { Scenario } from '@/types/scenario'

interface ScenarioCardProps {
  scenario: Scenario
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const difficultyVariant = {
    easy: 'success' as const,
    medium: 'warning' as const,
    hard: 'default' as const,
  }

  const contextEmoji = {
    work: '💼',
    social: '👥',
    everyday: '🗣️',
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {scenario.objective}
          </h2>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">{formatTime(scenario.time_limit_sec)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={difficultyVariant[scenario.difficulty]} size="sm">
          {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
        </Badge>
        <Badge variant="default" size="sm">
          {contextEmoji[scenario.context]} {scenario.context.charAt(0).toUpperCase() + scenario.context.slice(1)}
        </Badge>
        <Badge variant="info" size="sm">
          {scenario.goal.replace('_', ' ').charAt(0).toUpperCase() + scenario.goal.replace('_', ' ').slice(1)}
        </Badge>
      </div>

      {/* Prompt */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {scenario.prompt_text}
        </p>
      </div>

      {/* Example Opening */}
      {scenario.example_opening && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
            Example opening:
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-200 italic">
            "{scenario.example_opening}"
          </p>
        </div>
      )}

      {/* Tips */}
      {scenario.tips && scenario.tips.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">What to focus on:</p>
          </div>
          <ul className="space-y-2">
            {scenario.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">•</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}


