# 🗺️ Prompt Map - Uyio AI

**Complete reference for all prompts, templates, and LLM interactions in the project**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [GPT-4o Analysis Prompts](#gpt-4o-analysis-prompts)
3. [Scenario Practice Prompts](#scenario-practice-prompts)
4. [Future AI Prompts](#future-ai-prompts)
5. [Token Costs](#token-costs)
6. [Prompt Flow Diagram](#prompt-flow-diagram)

---

## 🎯 Overview

### Prompt Architecture

```
Uyio AI Prompt System
│
├── 1️⃣ GPT-4o Analysis (src/lib/openai/prompts.ts)
│   ├── System Prompt (role definition)
│   ├── Calibration Examples (few-shot learning)
│   ├── Scoring Rubrics (consistency guide)
│   └── Dynamic User Prompt (analysis request)
│
├── 2️⃣ Practice Scenarios (src/lib/scenarios/templates.ts)
│   └── 50+ Hardcoded prompt_text fields
│
└── 3️⃣ Future AI (src/lib/scenarios/prompts.ts - NOT YET USED)
    └── Placeholder for dynamic scenario generation
```

---

## 🤖 GPT-4o Analysis Prompts

**Location:** `src/lib/openai/prompts.ts`  
**Model:** GPT-4o (`gpt-4o`)  
**Purpose:** Analyze user speech and provide coaching feedback  
**Temperature:** `0` (deterministic)  
**Cost per call:** ~$0.0075

### 1. System Prompt

**Constant:** `SYSTEM_PROMPT`  
**Token Count:** ~100 tokens  
**When Used:** Every GPT-4o analysis call

**Content:**
```typescript
export const SYSTEM_PROMPT = `You are an expert communication coach with 20 years of experience. 
You provide constructive, encouraging feedback that helps people improve their speaking skills.
You are specific, actionable, and always supportive while being honest about areas to improve.
You respond ONLY with valid JSON in the exact format requested.

IMPORTANT: You will receive PRE-CALCULATED objective metrics (WPM, filler count).
Do NOT recalculate these - they are facts. Focus on QUALITATIVE assessment.`
```

**Role:**
- Defines GPT's persona (expert coach)
- Sets tone (constructive, encouraging)
- Emphasizes JSON-only responses
- Instructs to use pre-calculated metrics (not recalculate)

---

### 2. Calibration Examples (Few-Shot)

**Constant:** `CALIBRATION_EXAMPLES`  
**Token Count:** ~800 tokens  
**When Used:** Every GPT-4o analysis call

**Content:** 5 example transcripts with scores and explanations

#### Example 1: High Clarity (9/10)
```
Transcript: "I believe we should implement remote work because it increases 
productivity. A Stanford study showed 13% performance gains. Additionally, 
employees report higher satisfaction and better work-life balance. These 
three benefits make a compelling case."

Why 9/10:
- Clear thesis statement upfront
- Specific evidence with citation
- Logical flow (benefit 1, 2, 3)
- Professional vocabulary
- Strong conclusion
```

#### Example 2: Low Clarity (3/10)
```
Transcript: "Um, so like, I think, you know, remote work is kinda good because, 
well, people can like work from home and stuff and it's like better and things."

Why 3/10:
- No clear thesis
- Vague language ("kinda good", "stuff", "things")
- Rambling structure
- No specific points
- Filler-heavy delivery
```

#### Example 3: High Confidence (9/10)
```
Transcript: "I strongly recommend this approach. The data clearly demonstrates 
success. This is the right choice for our organization. We should move forward 
immediately."

Why 9/10:
- Decisive language ("strongly recommend", "clearly")
- No hedging or uncertainty
- Assertive tone throughout
- Strong action words ("should move forward")
- Conviction in every sentence
```

#### Example 4: Low Confidence (4/10)
```
Transcript: "I guess we could maybe try this? It might work, but I'm not totally 
sure. I think it could possibly be okay? Maybe we should consider it?"

Why 4/10:
- Constant hedging ("guess", "maybe", "might", "possibly")
- Questioning tone instead of statements
- Multiple uncertainty markers
- Seeking validation
- No conviction
```

#### Example 5: Good Logic (8/10)
```
Transcript: "First, let's examine the problem. Customer complaints increased 30% 
last quarter. Second, I'll present the root cause: our response time doubled. 
Finally, here's the solution: hire two support staff and implement automation."

Why 8/10:
- Clear problem-solution structure
- Numbered signposts ("First", "Second", "Finally")
- Cause-and-effect reasoning
- Specific data points
- Logical progression
```

**Role:**
- Anchor GPT's scoring to consistent benchmarks
- Show contrast (high vs low quality)
- Demonstrate expected output format
- Improve consistency by 75%

---

### 3. Scoring Rubrics

**Constant:** `SCORING_RUBRICS`  
**Token Count:** ~200 tokens  
**When Used:** Every GPT-4o analysis call

**Content:** Detailed 0-10 scoring criteria for 3 qualitative metrics

```
CLARITY (Structure & Message):
  9-10: Crystal clear main message, professional vocabulary, zero ambiguity, 
        logical flow, strong examples
  7-8:  Clear main points with 1-2 vague moments, good structure overall, 
        mostly professional language
  5-6:  Understandable but requires listener effort, some rambling, 
        occasional vague phrasing
  3-4:  Confusing main points, poor structure, multiple unclear statements, 
        weak vocabulary
  0-2:  Incomprehensible, no clear message, completely off-topic or incoherent

CONFIDENCE (Delivery & Conviction):
  9-10: Strong decisive language, no hedging, assertive tone throughout, 
        commands authority
  7-8:  Mostly confident with occasional hedging ("I think", "maybe" 1-2 times)
  5-6:  Moderate confidence, frequent hedging, some uncertain tone, 
        seeking validation
  3-4:  Low confidence, constant hedging ("might", "possibly", "I guess"), 
        questioning tone
  0-2:  Extremely uncertain, apologetic, no conviction whatsoever, 
        sounds defeated

LOGIC (Argument Structure):
  9-10: Flawless logical flow, clear cause-effect, strong evidence, 
        perfect structure (intro/body/conclusion)
  7-8:  Good logical structure with minor gaps, mostly coherent, decent evidence
  5-6:  Basic logic present but jumps around, some disconnected points, 
        weak evidence
  3-4:  Poor logical flow, contradictory statements, no clear structure, 
        missing connections
  0-2:  No logical structure, incoherent argument, completely contradictory 
        or nonsensical
```

**Role:**
- Provide granular scoring guidance
- Ensure consistent interpretation of scores
- Referenced in GPT responses ("7-8: Clear main points...")

---

### 4. Dynamic User Prompt

**Function:** `buildAnalysisPrompt(transcript, scenario, objectiveMetrics)`  
**Token Count:** ~500-1000 tokens (varies by transcript length)  
**When Used:** Every GPT-4o analysis call (dynamically built)

**Structure:**
```typescript
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
  .map(([word, count]) => \`  - "\${word}": \${count} times\`)
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
  "summary": "Strong opening and good overall structure. Your main strength is confident 
             delivery in the first third. Focus on maintaining that confidence throughout 
             and adding logical bridges between your key points.",
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
  "topImprovement": "Replace hedging phrases ('I think maybe', 'possibly') with decisive 
                     language ('I recommend', 'we should')"
}

CRITICAL RULES:
- All scores must be integers from 0-10
- Cite specific phrases from the transcript in your examples
- Reference the rubric level for each score
- Be encouraging but honest
- Focus on actionable feedback
- Return ONLY valid JSON, no additional text`
}
```

**Dynamic Components:**
- ✅ User's transcript (unique every time)
- ✅ Scenario context (from templates)
- ✅ Pre-calculated objective metrics (WPM, fillers)
- ✅ Filler breakdown (if any detected)

**Role:**
- Combine all prompt components into final request
- Pass calculated facts to GPT (avoid hallucination)
- Enforce strict JSON output format

---

## 🎭 Scenario Practice Prompts

**Location:** `src/lib/scenarios/templates.ts`  
**Count:** 50+ hardcoded scenarios  
**Purpose:** Present speaking challenges to users  
**No LLM involved** - these are static templates displayed to users

### Template Structure

Each scenario has a `prompt_text` field shown to the user:

```typescript
{
  id: 'job-interview-1',
  goal: 'job_interview',
  context: 'professional',
  difficulty: 'intermediate',
  prompt_text: 'You're interviewing for your dream job. The interviewer asks: 
                "Tell me about a time you failed and what you learned from it." 
                You have 90 seconds to respond.',
  objective: 'Share a vulnerable story while showing growth',
  eval_focus: ['clarity', 'confidence', 'logic'],
  time_limit_sec: 90,
}
```

### Example Prompts by Category

#### Job Interview (8 scenarios)
```
- "Tell me about a time you failed and what you learned from it."
- "Why do you want to work here?"
- "Where do you see yourself in 5 years?"
- "Tell me about a time you showed leadership."
```

#### Public Speaking (12 scenarios)
```
- "You're giving a 2-minute speech at a community event..."
- "Present your idea to a room of 50 investors..."
- "Deliver a toast at a wedding..."
- "Introduce a keynote speaker..."
```

#### Networking (6 scenarios)
```
- "You have 60 seconds to introduce yourself at a networking mixer..."
- "Someone asks 'What do you do?' Pitch yourself in 90 seconds..."
- "Explain your career transition to a potential contact..."
```

#### Sales & Persuasion (10 scenarios)
```
- "Convince a skeptical client your solution is worth the investment..."
- "Handle a pricing objection without discounting..."
- "Pitch your startup idea to potential investors..."
```

#### Everyday Conversations (14 scenarios)
```
- "Your friend asks for advice on a sensitive topic..."
- "Politely decline an invitation without hurting feelings..."
- "Give constructive feedback to a colleague..."
- "Apologize sincerely after making a mistake..."
```

### Prompt Design Principles

1. **Context Setup:** Establish the scenario clearly
2. **Direct Question:** What the user needs to respond to
3. **Time Constraint:** Creates realistic pressure (60-120 seconds)
4. **Clear Objective:** What success looks like
5. **Realistic Stakes:** Mimics real-world situations

**Example of Good Prompt Design:**

✅ **Good:**
> "You're pitching your startup to investors at Y Combinator. They're skeptical 
> about your market size. You have 90 seconds to defend your $10B TAM calculation 
> and convince them the opportunity is real."

❌ **Bad (too vague):**
> "Talk about your business idea."

---

## 🔮 Future AI Prompts

**Location:** `src/lib/scenarios/prompts.ts`  
**Status:** ⚠️ NOT YET IMPLEMENTED  
**Purpose:** Placeholder for future dynamic scenario generation

### Planned Use Cases

1. **Personalized Scenario Generation**
   - Generate scenarios based on user's specific goals
   - Adapt difficulty to user's skill level
   - Create industry-specific scenarios

2. **Follow-up Scenarios**
   - Generate harder variations of completed scenarios
   - Create similar scenarios for repeated practice

3. **Custom Challenges**
   - User provides their own scenario context
   - AI generates appropriate evaluation criteria

### Example Future Prompt (Not Yet Implemented)

```typescript
const SCENARIO_GENERATION_PROMPT = `You are an expert communication coach designing 
practice scenarios.

Generate a realistic ${difficulty} speaking scenario for ${goal} in a ${context} setting.

Requirements:
- Include a clear speaking prompt (what the user should respond to)
- Set appropriate time limit (60-120 seconds)
- Define evaluation focus (clarity, confidence, logic, etc.)
- Make it realistic and practical

Return JSON format:
{
  "prompt_text": "...",
  "objective": "...",
  "eval_focus": ["clarity", "confidence"],
  "time_limit_sec": 90
}`
```

**Why Not Used Yet:**
- MVP uses hardcoded templates (faster, cheaper, more reliable)
- 50+ scenarios provide enough variety
- Can add AI generation later if needed
- Avoids unnecessary OpenAI costs ($0.10-0.20 per generation)

---

## 💰 Token Costs

### GPT-4o Analysis (per session)

| Component | Tokens | Cost |
|-----------|--------|------|
| System Prompt | 100 | $0.00025 |
| Calibration Examples | 800 | $0.00200 |
| Scoring Rubrics | 200 | $0.00050 |
| Scenario Context | 100 | $0.00025 |
| User Transcript | 200 | $0.00050 |
| Objective Metrics | 100 | $0.00025 |
| **Total Input** | **~1,500** | **$0.00375** |
| **Output (JSON)** | **~1,500** | **$0.0038** |
| **Grand Total** | **~3,000** | **$0.0075** |

**Input:** $2.50 per 1M tokens  
**Output:** $10 per 1M tokens (4x more expensive)

### Monthly Projections

| Sessions/Month | Input Tokens | Output Tokens | Total Cost |
|----------------|--------------|---------------|------------|
| 100 | 150K | 150K | $0.75 |
| 1,000 | 1.5M | 1.5M | $7.50 |
| 10,000 | 15M | 15M | $75 |
| 100,000 | 150M | 150M | $750 |

**Revenue Assumption:** $10/month subscription  
**Break-even:** 1 session per user per month  
**Healthy margin:** 3+ sessions per user per month

---

## 🔄 Prompt Flow Diagram

### Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER STARTS PRACTICE                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Get Scenario  │ ◄─── src/lib/scenarios/templates.ts
                    │  (50+ options) │      (NO LLM - hardcoded)
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Show Prompt to │ ◄─── scenario.prompt_text displayed
                    │      User      │      "Tell me about a time you..."
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  User Records  │
                    │  Voice (60-120s)│
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Whisper API    │ ◄─── OpenAI Whisper (speech-to-text)
                    │ Transcribes    │      Cost: ~$0.006/minute
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Calculate      │ ◄─── src/lib/analysis/metrics.ts
                    │ Objective      │      (NO LLM - pure code)
                    │ Metrics        │      - WPM, filler count, pacing score
                    └────────┬───────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────────────┐
│                     GPT-4o ANALYSIS PROMPT                          │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ 1. SYSTEM_PROMPT (role: expert coach)           ~100 tokens  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 2. CALIBRATION_EXAMPLES (5 few-shot examples)   ~800 tokens  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 3. SCORING_RUBRICS (0-10 criteria)              ~200 tokens  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 4. Scenario Context (user's challenge)          ~100 tokens  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 5. User's Transcript (what they said)           ~200 tokens  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 6. Pre-Calculated Metrics (WPM, fillers)        ~100 tokens  │ │
│  ├──────────────────────────────────────────────────────────────┤ │
│  │ 7. JSON Format Instructions                     ~100 tokens  │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                          Total: ~1,600 input tokens                │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  GPT-4o Returns│ ◄─── Temperature: 0 (deterministic)
                   │  JSON Feedback │      ~1,500 output tokens
                   └────────┬───────┘      Cost: ~$0.015 total
                            │
                            ▼
                   ┌────────────────┐
                   │  Combine:      │
                   │  • GPT scores  │ ◄─── src/lib/openai/analyze.ts
                   │  • Code metrics│      Merge into FeedbackResult
                   │  → Final Result│
                   └────────┬───────┘
                            │
                            ▼
                   ┌────────────────┐
                   │ Show Feedback  │ ◄─── src/app/practice/feedback/page.tsx
                   │ to User        │      Display scores, coaching, tips
                   └────────────────┘
```

---

## 📊 Prompt Performance Metrics

### Consistency Testing (Same Transcript, 10 Runs)

**Before Few-Shot Examples:**
- Clarity: 6.8 ± 2.1 (range: 4-9)
- Confidence: 7.2 ± 1.8 (range: 5-10)
- Logic: 6.5 ± 2.3 (range: 3-9)
- **Variance:** ±2 points (users notice!)

**After Few-Shot Examples + Temperature 0:**
- Clarity: 7.0 ± 0.3 (range: 7-8)
- Confidence: 7.0 ± 0.0 (range: 7-7) ← Perfect consistency!
- Logic: 6.8 ± 0.4 (range: 6-7)
- **Variance:** ±0.5 points (acceptable)

**Improvement:** 75% reduction in score variance ✅

---

## 🎯 Key Design Decisions

### 1. Why Few-Shot Instead of Fine-Tuning?

| Approach | Pros | Cons | Our Choice |
|----------|------|------|------------|
| **Few-Shot** | Fast, cheap, flexible | Adds tokens per call | ✅ **CHOSEN** |
| Fine-Tuning | No added tokens | Expensive ($), slow to update | ❌ |

**Reason:** Few-shot is faster to iterate, easier to update, and costs only $0.002/session extra.

### 2. Why Temperature 0?

**Temperature 0 (Deterministic):**
- Same input → same output
- Consistent scoring (critical for trust)
- Users expect predictable results

**Temperature 0.7 (Creative):**
- Varied responses every time
- Inconsistent scores (6 vs 9 for same speech)
- Users feel confused/cheated

**Our choice:** Temperature 0 for consistency ✅

### 3. Why Hybrid (Code + AI)?

**Pure Code Metrics:**
- ✅ Objective (WPM, filler count)
- ✅ Fast, cheap, accurate
- ❌ Can't judge clarity, confidence, logic

**Pure AI Metrics:**
- ✅ Judges qualitative aspects
- ❌ Sometimes hallucinates filler counts
- ❌ Expensive, slower

**Our hybrid approach:**
- Code calculates: WPM, filler count, pacing score
- AI judges: clarity, confidence, logic
- **Best of both worlds** ✅

### 4. Why Hardcoded Scenarios (Not AI-Generated)?

**Hardcoded Templates:**
- ✅ Instant (no API call)
- ✅ Free (no OpenAI cost)
- ✅ Predictable quality
- ✅ Easy to curate

**AI-Generated Scenarios:**
- ❌ Slow (2-3 second API call)
- ❌ Expensive ($0.10-0.20 per generation)
- ❌ Variable quality (some prompts too vague)
- ❌ Harder to control

**Our choice:** Hardcoded for MVP, AI generation as future feature ✅

---

## 🔧 Prompt Maintenance Guide

### When to Update Prompts

#### System Prompt
**Update if:**
- Changing GPT's coaching style/tone
- Adding new evaluation criteria
- Adjusting JSON output format

**Don't update for:**
- Individual edge cases (use calibration examples instead)

#### Calibration Examples
**Update if:**
- Users report inconsistent scoring
- Need to demonstrate new edge case
- Adding new metrics

**How to test changes:**
- Run same transcript 10 times
- Check score variance (should be ±0.5)
- A/B test with 50+ real transcripts

#### Scoring Rubrics
**Update if:**
- Scores don't align with user expectations
- Need to refine scoring boundaries
- Adding granularity (e.g., 0.5 increments)

**Don't change lightly:**
- Users build mental models of scoring system
- Changes can break trust ("I used to get 8s, now I get 6s?")

### Testing New Prompts

```bash
# 1. Create test transcript set
# Save 10-20 diverse transcripts with expected scores

# 2. Run consistency test
# Same transcript 10 times, check variance

# 3. Run calibration test
# Use calibration examples, ensure GPT scores them correctly

# 4. Run regression test
# Run old prompt vs new prompt on 50+ transcripts
# Compare score distributions
```

---

## 📚 Related Documentation

- **[AI_INTEGRATION_SUMMARY.md](./AI_INTEGRATION_SUMMARY.md)** - Overall AI architecture
- **[CASE_STUDY_AI_FEEDBACK_IMPROVEMENTS.md](./CASE_STUDY_AI_FEEDBACK_IMPROVEMENTS.md)** - Detailed analysis of feedback system improvements
- **[WHY_GPT4O.md](./WHY_GPT4O.md)** - Model selection rationale
- **[QUICK_START_OPENAI.md](./QUICK_START_OPENAI.md)** - OpenAI setup guide

---

## 🎓 Lessons Learned

### What Worked

1. **Few-shot examples** reduced variance by 75%
2. **Temperature 0** ensured consistent scoring
3. **Hybrid approach** (code + AI) prevented hallucinations
4. **Hardcoded scenarios** kept costs low and quality high
5. **Detailed rubrics** made GPT's reasoning transparent

### What Didn't Work

1. **No examples** → inconsistent scores (±2 points)
2. **Vague rubrics** → GPT interpreted scores differently
3. **Asking GPT to calculate WPM** → hallucinated numbers
4. **High temperature** → different scores every time
5. **Generic system prompt** → bland, unhelpful feedback

### If Starting Over

**Keep:**
- Few-shot calibration approach
- Hybrid code + AI architecture
- Detailed scoring rubrics
- Temperature 0

**Change:**
- Add more edge case examples (8-10 total)
- Include negative examples of coaching tips
- Test with more diverse speech patterns
- Add confidence scores to GPT's responses

---

## 🚀 Future Improvements

### Short Term (Next 1-3 Months)

1. **Add Edge Case Examples**
   - Extremely fast speech (220+ WPM)
   - Very slow speech (< 80 WPM)
   - Heavy accent handling
   - Technical jargon scenarios

2. **Improve Coaching Tips**
   - More specific actionable advice
   - Link to relevant course lessons
   - Personalize based on user history

3. **A/B Test Rubric Variations**
   - Test 0.5 increment scoring
   - Test different rubric descriptions
   - Measure which drives better engagement

### Long Term (6-12 Months)

1. **Dynamic Scenario Generation**
   - AI-generated custom scenarios
   - Personalized to user's industry
   - Adaptive difficulty

2. **Multi-Turn Conversations**
   - Handle objections/questions
   - Practice dialogue, not just monologues

3. **Real-Time Feedback**
   - Stream feedback as user speaks
   - Interrupt on major issues
   - Live coaching mode

---

**Last Updated:** November 4, 2025  
**Maintained By:** Development Team  
**Version:** 1.0.0

