# Scenario System - Quick Reference

## ✅ What Was Built

A complete scenario system with 50+ hardcoded templates ready for MVP.

---

## 📁 Files Created (6 files)

### Core System
1. ✅ `src/types/scenario.ts` - Type definitions
2. ✅ `src/lib/scenarios/templates.ts` - **50+ hardcoded scenarios**
3. ✅ `src/lib/scenarios/generator.ts` - Selection & filtering logic
4. ✅ `src/lib/scenarios/tracker.ts` - Usage tracking (localStorage)

### API Routes
5. ✅ `src/app/api/scenario/generate/route.ts` - Generate custom scenario
6. ✅ `src/app/api/scenario/daily/route.ts` - Get daily challenge

---

## 📊 Scenario Breakdown

### By Goal (50+ total):
- **Clarity**: 15+ scenarios
- **Confidence**: 15+ scenarios
- **Persuasion**: 10+ scenarios
- **Reduce Fillers**: 5+ scenarios
- **Quick Thinking**: 10+ scenarios

### By Context:
- **Work**: 18+ scenarios
- **Social**: 16+ scenarios
- **Everyday**: 16+ scenarios

### By Difficulty:
- **Easy**: 15+ scenarios
- **Medium**: 25+ scenarios
- **Hard**: 10+ scenarios

### Time Limits:
- **60 seconds**: ~20 scenarios
- **90 seconds**: ~25 scenarios
- **120 seconds**: ~5 scenarios

---

## 🔧 API Usage

### Generate Custom Scenario

**Endpoint:** `POST /api/scenario/generate`

**Request Body:**
```json
{
  "goal": "clarity",        // optional: clarity, confidence, persuasion, fillers, quick_thinking
  "context": "work",        // optional: work, social, everyday
  "difficulty": "medium"    // optional: easy, medium, hard
}
```

**Response:**
```json
{
  "success": true,
  "scenario": {
    "id": "work-clarity-01",
    "goal": "clarity",
    "context": "work",
    "difficulty": "easy",
    "objective": "Explain a project delay to your manager",
    "prompt_text": "Your project is running two weeks behind...",
    "time_limit_sec": 90,
    "eval_focus": ["clarity", "logic", "structure"],
    "example_opening": "I want to give you an update...",
    "tips": ["Use situation-action-result", "Be direct", "Focus on solutions"]
  }
}
```

### Get Daily Challenge

**Endpoint:** `GET /api/scenario/daily`

**Query Parameters:**
- `goal` (optional): User's primary goal

**Response:**
```json
{
  "success": true,
  "scenario": { /* scenario object */ },
  "completed": false,
  "isAuthenticated": true
}
```

---

## 💻 Code Examples

### Generate Scenario (Frontend)
```typescript
const response = await fetch('/api/scenario/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    goal: 'confidence',
    context: 'work',
    difficulty: 'medium'
  })
})

const { scenario } = await response.json()
```

### Get Daily Challenge
```typescript
const response = await fetch('/api/scenario/daily')
const { scenario, completed } = await response.json()
```

### Use Generator Directly
```typescript
import { generateScenario, getDailyChallenge, getRandomScenario } from '@/lib/scenarios/generator'

// With filters
const scenario = generateScenario({
  goal: 'clarity',
  context: 'work'
})

// Daily challenge
const daily = getDailyChallenge('confidence')

// Random
const random = getRandomScenario()
```

---

## 🎯 How It Works

### Selection Logic

1. **Filter by options** (goal, context, difficulty)
2. **Avoid recently used** (checks localStorage)
3. **Return random from filtered set**

### Daily Challenge Logic

1. **Uses date as seed** (same scenario all day)
2. **Filters by user's primary goal** (if provided)
3. **Rotates through templates** (day of year % total scenarios)

### Usage Tracking

- Stores last 10 scenarios in localStorage
- Prevents same scenario twice in a row
- Clears history older than 7 days
- Works offline

---

## 📝 Scenario Structure

Each scenario has:

```typescript
{
  id: string                  // unique identifier
  goal: Goal                  // clarity, confidence, etc.
  context: Context            // work, social, everyday
  difficulty: Difficulty      // easy, medium, hard
  objective: string           // what user should accomplish
  prompt_text: string         // detailed scenario description
  time_limit_sec: number      // 60, 90, or 120
  eval_focus: string[]        // metrics to evaluate
  example_opening?: string    // optional starter phrase
  tips?: string[]             // optional guidance
}
```

---

## 🧪 Testing

### Test Generate API
```bash
curl -X POST http://localhost:3000/api/scenario/generate \
  -H "Content-Type: application/json" \
  -d '{"goal":"clarity","context":"work"}'
```

### Test Daily API
```bash
curl http://localhost:3000/api/scenario/daily?goal=confidence
```

### Test Functions
```typescript
import { generateScenario } from '@/lib/scenarios/generator'

console.log(generateScenario({ goal: 'clarity' }))
```

---

## 🎨 Example Scenarios

### Easy - Social - Clarity
**Objective:** "Recommend a restaurant clearly"
**Prompt:** "A friend asks for restaurant recommendations. Clearly explain why they should try your favorite spot..."
**Time:** 60 seconds

### Medium - Work - Confidence
**Objective:** "Pitch a new idea in 90 seconds"
**Prompt:** "You have 90 seconds to pitch your innovative idea to senior leadership..."
**Time:** 90 seconds

### Hard - Work - Persuasion
**Objective:** "Convince stakeholders to approve your budget"
**Prompt:** "You need approval for a budget increase. Persuade stakeholders that this investment will pay off..."
**Time:** 120 seconds

---

## 🚀 Next Steps

Now that scenarios are functional, you can:

1. **Build practice page** - Use these scenarios in voice recording
2. **Create scenario selector** - Let users filter and choose
3. **Add to dashboard** - Show daily challenge
4. **Track completion** - Store in database when practiced

---

## 📦 What's NOT Included (For Later)

- ✋ AI-generated scenarios (using templates for MVP)
- ✋ User-submitted scenarios
- ✋ Difficulty auto-adjustment
- ✋ Complex personalization
- ✋ Scenario ratings/favorites
- ✋ Advanced analytics

---

## 🎉 Summary

You now have:
- ✅ 50+ production-ready scenarios
- ✅ Smart filtering & selection
- ✅ Daily challenge system
- ✅ Usage tracking
- ✅ Two working API endpoints
- ✅ Type-safe implementation
- ✅ Ready for practice page integration

**The scenario system is MVP-ready!** 🚀

---

## 🔗 Integration Points

### Dashboard
```typescript
// In DailyChallengeCard.tsx
const response = await fetch('/api/scenario/daily')
const { scenario } = await response.json()
```

### Practice Page
```typescript
// In practice page
const response = await fetch('/api/scenario/generate', {
  method: 'POST',
  body: JSON.stringify({ goal: userGoal })
})
const { scenario } = await response.json()
```

### Quick Practice
```typescript
// In QuickPracticeCard.tsx
const response = await fetch('/api/scenario/generate', {
  method: 'POST',
  body: JSON.stringify({ goal, context, difficulty })
})
```

---

**Ready to integrate into your practice flow!** 🎯


