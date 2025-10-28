import { NextResponse } from 'next/server'
import { generateScenario } from '@/lib/scenarios/generator'
import type { Goal, Context, Difficulty } from '@/types/scenario'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { goal, context, difficulty } = body

    // Validate inputs if provided
    if (goal && !['clarity', 'confidence', 'persuasion', 'fillers', 'quick_thinking'].includes(goal)) {
      return NextResponse.json(
        { error: 'Invalid goal. Must be one of: clarity, confidence, persuasion, fillers, quick_thinking' },
        { status: 400 }
      )
    }

    if (context && !['work', 'social', 'everyday'].includes(context)) {
      return NextResponse.json(
        { error: 'Invalid context. Must be one of: work, social, everyday' },
        { status: 400 }
      )
    }

    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty. Must be one of: easy, medium, hard' },
        { status: 400 }
      )
    }

    // Generate scenario with filters
    const scenario = generateScenario({
      goal: goal as Goal,
      context: context as Context,
      difficulty: difficulty as Difficulty,
    })

    return NextResponse.json({
      success: true,
      scenario,
    })
  } catch (error) {
    console.error('Error generating scenario:', error)
    return NextResponse.json(
      { error: 'Failed to generate scenario' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to generate a scenario',
    example: {
      goal: 'clarity',
      context: 'work',
      difficulty: 'medium',
    },
  })
}


