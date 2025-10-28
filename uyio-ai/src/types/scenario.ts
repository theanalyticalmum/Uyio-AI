export type Goal = 'clarity' | 'confidence' | 'persuasion' | 'fillers' | 'quick_thinking'
export type Context = 'work' | 'social' | 'everyday'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Scenario {
  id: string
  goal: Goal
  context: Context
  difficulty: Difficulty
  objective: string
  prompt_text: string
  time_limit_sec: number
  eval_focus: string[]
  example_opening?: string
  tips?: string[]
  created_at?: string
  usage_count?: number
}

export interface ScoreRubric {
  goal: Goal
  criteria: {
    name: string
    description: string
    weight: number
  }[]
  focusAreas: string[]
}

export interface ScenarioFilters {
  goal?: Goal
  context?: Context
  difficulty?: Difficulty
  userId?: string
}


