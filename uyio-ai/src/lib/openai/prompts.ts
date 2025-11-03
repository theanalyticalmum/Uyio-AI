import type { Scenario } from '@/types/scenario'
import type { ObjectiveMetrics } from '@/lib/analysis/metrics'
import { FILLER_WORDS } from '@/lib/constants/fillers'

/**
 * System prompt for GPT-4 analysis
 * Focuses on qualitative assessment only
 */
export const SYSTEM_PROMPT = `You are an expert communication coach with 20 years of experience. 
You provide constructive, encouraging feedback that helps people improve their speaking skills.
You are specific, actionable, and always supportive while being honest about areas to improve.
You respond ONLY with valid JSON in the exact format requested.

IMPORTANT: You will receive PRE-CALCULATED objective metrics (WPM, filler count).
Do NOT recalculate these - they are facts. Focus on QUALITATIVE assessment.`

/**
 * Few-shot calibration examples to anchor GPT-4 scoring
 * Critical for consistency across evaluations
 */
export const CALIBRATION_EXAMPLES = `
CALIBRATION BENCHMARKS (use these to anchor your scoring):

═══════════════════════════════════════════════════════════════════

EXAMPLE 1 - HIGH CLARITY (9/10):
Transcript: "I believe we should implement remote work because it increases productivity. A Stanford study showed 13% performance gains. Additionally, employees report higher satisfaction and better work-life balance. These three benefits make a compelling case."

Why 9/10:
- Clear thesis statement upfront
- Specific evidence with citation
- Logical flow (benefit 1, 2, 3)
- Professional vocabulary
- Strong conclusion

Example from transcript: "A Stanford study showed 13% performance gains"
Tip: "Excellent use of specific data. Continue citing credible sources."

═══════════════════════════════════════════════════════════════════

EXAMPLE 2 - LOW CLARITY (3/10):
Transcript: "Um, so like, I think, you know, remote work is kinda good because, well, people can like work from home and stuff and it's like better and things."

Why 3/10:
- No clear thesis
- Vague language ("kinda good", "stuff", "things")
- Rambling structure
- No specific points
- Filler-heavy delivery

Example from transcript: "people can like work from home and stuff"
Tip: "Replace vague words like 'stuff' with specific benefits: cost savings, flexibility, etc."

═══════════════════════════════════════════════════════════════════

EXAMPLE 3 - HIGH CONFIDENCE (9/10):
Transcript: "I strongly recommend this approach. The data clearly demonstrates success. This is the right choice for our organization. We should move forward immediately."

Why 9/10:
- Decisive language ("strongly recommend", "clearly")
- No hedging or uncertainty
- Assertive tone throughout
- Strong action words ("should move forward")
- Conviction in every sentence

Example from transcript: "I strongly recommend this approach"
Tip: "Excellent confident opening. Maintain this decisiveness throughout all presentations."

═══════════════════════════════════════════════════════════════════

EXAMPLE 4 - LOW CONFIDENCE (4/10):
Transcript: "I guess we could maybe try this? It might work, but I'm not totally sure. I think it could possibly be okay? Maybe we should consider it?"

Why 4/10:
- Constant hedging ("guess", "maybe", "might", "possibly")
- Questioning tone instead of statements
- Multiple uncertainty markers
- Seeking validation
- No conviction

Example from transcript: "I guess we could maybe try this?"
Tip: "Remove hedging words. Change 'I guess we could maybe' to 'We should'."

═══════════════════════════════════════════════════════════════════

EXAMPLE 5 - GOOD LOGIC (8/10):
Transcript: "First, let's examine the problem. Customer complaints increased 30% last quarter. Second, I'll present the root cause: our response time doubled. Finally, here's the solution: hire two support staff and implement automation."

Why 8/10:
- Clear problem-solution structure
- Numbered signposts ("First", "Second", "Finally")
- Cause-and-effect reasoning
- Specific data points
- Logical progression

Example from transcript: "First...Second...Finally" structure
Tip: "Strong logical signposting. Consider adding a brief preview at the start."

═══════════════════════════════════════════════════════════════════

Use these examples as your scoring anchors. A user transcript should be compared against these benchmarks.
`

/**
 * Detailed scoring rubrics for each qualitative metric
 */
export const SCORING_RUBRICS = `
DETAILED SCORING RUBRICS (reference these for every score):

CLARITY (Structure & Message):
  9-10: Crystal clear main message, professional vocabulary, zero ambiguity, logical flow, strong examples
  7-8:  Clear main points with 1-2 vague moments, good structure overall, mostly professional language
  5-6:  Understandable but requires listener effort, some rambling, occasional vague phrasing
  3-4:  Confusing main points, poor structure, multiple unclear statements, weak vocabulary
  0-2:  Incomprehensible, no clear message, completely off-topic or incoherent

CONFIDENCE (Delivery & Conviction):
  9-10: Strong decisive language, no hedging, assertive tone throughout, commands authority
  7-8:  Mostly confident with occasional hedging ("I think", "maybe" 1-2 times)
  5-6:  Moderate confidence, frequent hedging, some uncertain tone, seeking validation
  3-4:  Low confidence, constant hedging ("might", "possibly", "I guess"), questioning tone
  0-2:  Extremely uncertain, apologetic, no conviction whatsoever, sounds defeated

LOGIC (Argument Structure):
  9-10: Flawless logical flow, clear cause-effect, strong evidence, perfect structure (intro/body/conclusion)
  7-8:  Good logical structure with minor gaps, mostly coherent, decent evidence
  5-6:  Basic logic present but jumps around, some disconnected points, weak evidence
  3-4:  Poor logical flow, contradictory statements, no clear structure, missing connections
  0-2:  No logical structure, incoherent argument, completely contradictory or nonsensical

IMPORTANT: When scoring, you must:
1. Compare against the calibration examples
2. Cite the specific rubric level (e.g., "7-8: Mostly confident...")
3. Give a concrete example from the user's transcript
4. Provide one actionable tip
`

/**
 * Build analysis prompt with pre-calculated objective metrics
 * GPT-4 focuses only on qualitative aspects (clarity, confidence, logic)
 */
export function buildAnalysisPrompt(
  transcript: string,
  scenario: Scenario,
  objectiveMetrics: ObjectiveMetrics
): string {
  return `${CALIBRATION_EXAMPLES}

${SCORING_RUBRICS}

═══════════════════════════════════════════════════════════════════
NOW EVALUATE THIS USER'S SPEECH:
═══════════════════════════════════════════════════════════════════

SCENARIO CONTEXT:
${scenario.prompt_text}

OBJECTIVE:
${scenario.objective}

USER'S TRANSCRIPT:
"${transcript}"

PRE-CALCULATED METRICS (DO NOT RECALCULATE - these are facts):
- Duration: ${objectiveMetrics.duration} seconds
- Word Count: ${objectiveMetrics.wordCount} words
- Words Per Minute: ${objectiveMetrics.wordsPerMinute} WPM
- Filler Word Count: ${objectiveMetrics.fillerCount} (${objectiveMetrics.fillerRate}% of speech)
- Pacing Score: ${objectiveMetrics.pacingScore}/10 (auto-calculated from WPM)
- Filler Score: ${objectiveMetrics.fillerScore}/10 (auto-calculated from filler rate)

${objectiveMetrics.fillerCount > 0 ? `
Most Used Fillers:
${Object.entries(objectiveMetrics.fillerBreakdown)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([word, count]) => `  - "${word}": ${count} times`)
  .join('\n')}
` : ''}

YOUR TASK:
Evaluate the QUALITATIVE aspects only (Clarity, Confidence, Logic).
Pacing and Fillers are already scored objectively above.

Return your response as valid JSON matching this EXACT structure:
{
  "scores": {
    "clarity": 8,
    "confidence": 7,
    "logic": 6
  },
  "coaching": {
    "clarity": {
      "reason": "Clear main point but middle section lost focus when discussing benefits",
      "example": "When you said 'and then, well, basically...' you lost the thread",
      "tip": "Use transition phrases like 'The second key point is...' to maintain structure",
      "rubricLevel": "7-8: Clear main points with 1-2 vague moments"
    },
    "confidence": {
      "reason": "Strong opening but hedged significantly in middle section",
      "example": "Your opening 'I strongly believe' showed great conviction",
      "tip": "Maintain that opening confidence - replace 'I think maybe' with 'I recommend'",
      "rubricLevel": "7-8: Mostly confident with occasional hedging"
    },
    "logic": {
      "reason": "Good problem-solution structure but missing connection between points 2 and 3",
      "example": "You jumped from customer complaints to hiring without explaining the cause",
      "tip": "Add bridging statement: 'This happened because our response time doubled'",
      "rubricLevel": "7-8: Good logical structure with minor gaps"
    }
  },
  "summary": "Strong opening and good overall structure. Your main strength is confident delivery in the first third. Focus on maintaining that confidence throughout and adding logical bridges between your key points.",
  "strengths": [
    "Excellent confident opening statement",
    "Clear problem identification with specific data",
    "Good use of signposting language"
  ],
  "improvements": [
    "Maintain confident tone throughout (not just the opening)",
    "Add explicit logical connections between points",
    "Reduce hedging language in middle section"
  ],
  "topImprovement": "Replace hedging phrases ('I think maybe', 'possibly') with decisive language ('I recommend', 'we should')"
}

CRITICAL RULES:
- All scores must be integers from 0-10
- Cite specific phrases from the transcript in your examples
- Reference the rubric level for each score
- Be encouraging but honest
- Focus on actionable feedback
- Return ONLY valid JSON, no additional text`
}

// Export FILLER_WORDS for backward compatibility
export { FILLER_WORDS }
