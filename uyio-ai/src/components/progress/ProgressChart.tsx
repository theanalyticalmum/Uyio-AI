// src/components/progress/ProgressChart.tsx
'use client'

import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { Session } from '@/lib/db/sessions'

interface ProgressChartProps {
  sessions: Session[]
  selectedMetrics?: string[]
}

export function ProgressChart({ sessions, selectedMetrics: initialMetrics }: ProgressChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(
    new Set(initialMetrics || ['clarity', 'confidence', 'logic', 'pacing', 'fillers'])
  )

  // Transform sessions data for the chart
  const chartData = sessions
    .slice()
    .reverse() // Show oldest to newest
    .map((session, index) => ({
      session: index + 1,
      date: new Date(session.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      clarity: session.scores.clarity,
      confidence: session.scores.confidence,
      logic: session.scores.logic,
      pacing: session.scores.pacing,
      fillers: session.scores.fillers,
      overall:
        (session.scores.clarity +
          session.scores.confidence +
          session.scores.logic +
          session.scores.pacing +
          session.scores.fillers) /
        5,
    }))

  const metrics = [
    { key: 'clarity', name: 'Clarity', color: '#3B82F6' }, // blue
    { key: 'confidence', name: 'Confidence', color: '#10B981' }, // green
    { key: 'logic', name: 'Logic', color: '#8B5CF6' }, // purple
    { key: 'pacing', name: 'Pacing', color: '#F59E0B' }, // orange
    { key: 'fillers', name: 'Fillers', color: '#EF4444' }, // red
  ]

  const toggleMetric = (metricKey: string) => {
    const newSelected = new Set(selectedMetrics)
    if (newSelected.has(metricKey)) {
      newSelected.delete(metricKey)
    } else {
      newSelected.add(metricKey)
    }
    setSelectedMetrics(newSelected)
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400">No sessions yet. Complete your first practice to see progress!</p>
      </div>
    )
  }

  if (sessions.length < 3) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Complete at least 3 sessions to see your progress chart
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          You have {sessions.length} session{sessions.length !== 1 ? 's' : ''}. Keep practicing!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Score Trends</h3>

        {/* Metric Toggles */}
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                selectedMetrics.has(metric.key)
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={{
                backgroundColor: selectedMetrics.has(metric.key) ? metric.color : undefined,
                color: selectedMetrics.has(metric.key) ? 'white' : undefined,
              }}
            >
              {metric.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis
              dataKey="date"
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis
              domain={[0, 10]}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: '#F3F4F6',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}/10`, '']}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />

            {metrics.map(
              (metric) =>
                selectedMetrics.has(metric.key) && (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.name}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ r: 4, fill: metric.color }}
                    activeDot={{ r: 6 }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        Showing last {sessions.length} sessions
      </p>
    </div>
  )
}

