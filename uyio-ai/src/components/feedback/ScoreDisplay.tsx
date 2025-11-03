// src/components/feedback/ScoreDisplay.tsx
'use client'

import { ScoreCard } from './ScoreCard'
import type { FeedbackResult } from '@/types/feedback'

interface ScoreDisplayProps {
  feedback: FeedbackResult
}

export function ScoreDisplay({ feedback }: ScoreDisplayProps) {
  const { scores, coaching, detectedMetrics, detailedCoaching } = feedback
  
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

  // Prepare objective data for pacing
  const pacingData = {
    primaryMetric: `${detectedMetrics.wpm} words/minute`,
    checkmarks: [
      detectedMetrics.wpm >= 140 && detectedMetrics.wpm <= 160
        ? 'Perfect conversational pace'
        : detectedMetrics.wpm < 140
        ? 'Measured pace for clarity'
        : 'Energetic pace',
      'Maintained consistent rhythm',
    ],
    tip: coaching.pacing,
  }

  // Prepare objective data for fillers
  const topFillers = Object.entries(detectedMetrics.fillerBreakdown || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([word, count]) => `"${word}" (${count}×)`)
    .join(', ')

  const fillersData = {
    primaryMetric: `${detectedMetrics.fillerCount} filler word${detectedMetrics.fillerCount === 1 ? '' : 's'} (${detectedMetrics.fillerRate}%)`,
    checkmarks:
      detectedMetrics.fillerCount === 0
        ? ['No fillers detected!', 'Excellent self-control']
        : [
            topFillers ? `Most used: ${topFillers}` : 'Scattered filler usage',
            detectedMetrics.fillerRate < 5 ? 'Acceptable control' : 'Room for improvement',
          ],
    tip: coaching.fillers,
  }

  // Prepare qualitative data (if detailedCoaching exists, extract from it; otherwise use simple tips)
  const clarityData = detailedCoaching?.clarity
    ? {
        strengths: [detailedCoaching.clarity.example || 'Clear communication'],
        weakness: detailedCoaching.clarity.reason.includes('but') 
          ? detailedCoaching.clarity.reason.split('but')[1]?.trim() 
          : undefined,
        tip: detailedCoaching.clarity.tip,
      }
    : {
        strengths: [coaching.clarity],
        tip: coaching.clarity,
      }

  const confidenceData = detailedCoaching?.confidence
    ? {
        strengths: [detailedCoaching.confidence.example || 'Confident delivery'],
        weakness: detailedCoaching.confidence.reason.includes('but')
          ? detailedCoaching.confidence.reason.split('but')[1]?.trim()
          : undefined,
        tip: detailedCoaching.confidence.tip,
      }
    : {
        strengths: [coaching.confidence],
        tip: coaching.confidence,
      }

  const logicData = detailedCoaching?.logic
    ? {
        strengths: [detailedCoaching.logic.example || 'Logical structure'],
        weakness: detailedCoaching.logic.reason.includes('but')
          ? detailedCoaching.logic.reason.split('but')[1]?.trim()
          : undefined,
        tip: detailedCoaching.logic.tip,
      }
    : {
        strengths: [coaching.logic],
        tip: coaching.logic,
      }

  return (
    <div className="space-y-6">
      {/* Overall Score Badge */}
      <div
        className={`bg-gradient-to-r ${getOverallColor(overall)} rounded-2xl p-6 text-white shadow-lg text-center`}
      >
        <h2 className="text-5xl font-bold mb-2">{overall}/10</h2>
        <p className="text-xl font-semibold">{getEncouragementMessage(overall)}</p>
        <p className="text-sm mt-1 text-white/80">Overall Performance</p>
      </div>

      {/* Individual Score Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <ScoreCard
          metric="Clarity"
          score={scores.clarity}
          qualitativeData={clarityData}
          delay={0}
        />
        <ScoreCard
          metric="Confidence"
          score={scores.confidence}
          qualitativeData={confidenceData}
          delay={100}
        />
        <ScoreCard
          metric="Logic"
          score={scores.logic}
          qualitativeData={logicData}
          delay={200}
        />
        <ScoreCard
          metric="Pacing"
          score={scores.pacing}
          objectiveData={pacingData}
          delay={300}
        />
        <ScoreCard
          metric="Fillers"
          score={scores.fillers}
          objectiveData={fillersData}
          delay={400}
        />
      </div>
    </div>
  )
}
