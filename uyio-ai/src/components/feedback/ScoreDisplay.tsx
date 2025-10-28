// src/components/feedback/ScoreDisplay.tsx
'use client'

import { ScoreCard } from './ScoreCard'
import type { FeedbackScores, CoachingTips } from '@/types/feedback'

interface ScoreDisplayProps {
  scores: FeedbackScores
  coaching: CoachingTips
}

export function ScoreDisplay({ scores, coaching }: ScoreDisplayProps) {
  // Calculate overall average
  const overall = Math.round(
    ((scores.clarity + scores.confidence + scores.logic + scores.pacing + scores.fillers) / 5) * 10
  ) / 10

  // Get overall color
  const getOverallColor = (avg: number) => {
    if (avg >= 8) return 'from-green-500 to-emerald-600'
    if (avg >= 5) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  // Get encouragement message
  const getEncouragementMessage = (avg: number) => {
    if (avg >= 9) return 'Outstanding! 🌟'
    if (avg >= 8) return 'Great job! 🎉'
    if (avg >= 7) return 'Well done! 👏'
    if (avg >= 5) return 'Good effort! 💪'
    return 'Keep practicing! 🎯'
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Badge */}
      <div className={`bg-gradient-to-r ${getOverallColor(overall)} rounded-2xl p-6 text-white shadow-lg text-center`}>
        <h2 className="text-5xl font-bold mb-2">{overall}/10</h2>
        <p className="text-xl font-semibold">{getEncouragementMessage(overall)}</p>
        <p className="text-sm mt-1 text-white/80">Overall Performance</p>
      </div>

      {/* Individual Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <ScoreCard metric="Clarity" score={scores.clarity} tip={coaching.clarity} delay={0} />
        <ScoreCard metric="Confidence" score={scores.confidence} tip={coaching.confidence} delay={100} />
        <ScoreCard metric="Logic" score={scores.logic} tip={coaching.logic} delay={200} />
        <ScoreCard metric="Pacing" score={scores.pacing} tip={coaching.pacing} delay={300} />
        <ScoreCard metric="Fillers" score={scores.fillers} tip={coaching.fillers} delay={400} />
      </div>
    </div>
  )
}

