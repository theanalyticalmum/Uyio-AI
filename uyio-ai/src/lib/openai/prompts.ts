import type { Scenario } from '@/types/scenario'

/**
 * System prompt templates for GPT-4 analysis
 */

export function buildAnalysisPrompt(transcript: string, scenario: Scenario, duration?: number): string {
  const evalFocusText = scenario.eval_focus?.join(', ') || 'general communication skills'
  
  return `You are a professional communication coach evaluating a practice session.

SCENARIO:
${scenario.prompt_text}

OBJECTIVE:
${scenario.objective}

EVALUATION FOCUS:
${evalFocusText}

TRANSCRIPT:
"${transcript}"

${duration ? `DURATION: ${duration} seconds` : ''}

Evaluate the transcript comprehensively:

1. SCORES (0-10 scale, integers only):
   - Clarity: Word choice, structure, articulation, easy to understand
   - Confidence: Tone, conviction, authority, assertiveness
   - Logic: Argument structure, coherence, persuasiveness
   - Pacing: Speaking speed, appropriate pauses, rhythm
   - Fillers: Absence of "um", "uh", "like", "you know" (10 = no fillers)

2. COACHING TIPS (one specific actionable tip per category):
   - Be specific and actionable
   - Focus on what the speaker can improve
   - Keep each tip to 1-2 sentences

3. OVERALL SUMMARY:
   - 2-3 sentences of encouraging feedback
   - Highlight what went well
   - Mention the most important area to improve

4. DETECTED METRICS:
   - Calculate words per minute (WPM)
   - Count filler words ("um", "uh", "like", "you know", "so", "basically")
   - Estimate average pause length in seconds

5. STRENGTHS (list 2-3):
   - Specific things the speaker did well
   - Examples from the transcript

6. IMPROVEMENTS (list 2-3):
   - Specific areas to work on
   - Actionable next steps

Return your response as valid JSON matching this EXACT structure:
{
  "scores": {
    "clarity": 8,
    "confidence": 7,
    "logic": 6,
    "pacing": 9,
    "fillers": 5
  },
  "coaching": {
    "clarity": "Try using simpler words to make your point more accessible.",
    "confidence": "Project your voice more and use declarative statements.",
    "logic": "Structure your argument with a clear beginning, middle, and end.",
    "pacing": "Great pacing! Keep using natural pauses for emphasis.",
    "fillers": "You used 'um' 8 times. Try pausing silently instead."
  },
  "summary": "Strong delivery with good pacing. Your main strength is clear articulation. Focus on reducing filler words to sound more polished.",
  "detectedMetrics": {
    "wpm": 145,
    "fillerCount": 8,
    "avgPauseLength": 0.8,
    "totalWords": 120,
    "duration": 50
  },
  "strengths": [
    "Excellent pacing with natural pauses",
    "Clear pronunciation and articulation",
    "Strong opening statement"
  ],
  "improvements": [
    "Reduce filler words (um, uh, like)",
    "Strengthen conclusion with clearer call-to-action",
    "Use more confident tone words"
  ]
}

IMPORTANT:
- All scores must be integers from 0-10
- Be encouraging but honest
- Focus on actionable feedback
- Return ONLY valid JSON, no additional text`
}

export const SYSTEM_PROMPT = `You are an expert communication coach with 20 years of experience. 
You provide constructive, encouraging feedback that helps people improve their speaking skills.
You are specific, actionable, and always supportive while being honest about areas to improve.
You respond ONLY with valid JSON in the exact format requested.`

/**
 * List of common filler words to detect and highlight
 */
export const FILLER_WORDS = [
  'um',
  'uh',
  'like',
  'you know',
  'so',
  'basically',
  'actually',
  'literally',
  'right',
  'okay',
  'well',
  'i mean',
  'kind of',
  'sort of',
]


