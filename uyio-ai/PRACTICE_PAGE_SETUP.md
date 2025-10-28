# Practice Page - Voice Recording Interface

## ✅ What Was Built

A complete voice recording interface using the browser's MediaRecorder API.

---

## 📁 Files Created (4 files)

1. ✅ `src/app/practice/page.tsx` - Main practice page
2. ✅ `src/components/practice/VoiceRecorder.tsx` - Recording UI component
3. ✅ `src/components/practice/ScenarioCard.tsx` - Scenario display
4. ✅ `src/hooks/useAudioRecorder.ts` - Recording logic hook

---

## 🎯 Features

### Practice Page (`page.tsx`)
- ✅ Fetches scenario on load (supports URL params)
- ✅ Displays scenario in card format
- ✅ Shows recording interface
- ✅ Four states: idle, recording, processing, complete
- ✅ "Get different scenario" button
- ✅ "Try again" and "New scenario" after recording

### Voice Recorder (`VoiceRecorder.tsx`)
- ✅ Large circular record button (120px)
- ✅ Blue when idle, red when recording
- ✅ White mic icon / stop icon
- ✅ Live recording timer (MM:SS format)
- ✅ Pulse animation during recording
- ✅ Auto-stops at max duration
- ✅ Hover and active states
- ✅ Error handling with toast notifications

### Audio Recorder Hook (`useAudioRecorder.ts`)
- ✅ MediaRecorder API integration
- ✅ Microphone permission handling
- ✅ Browser compatibility checks
- ✅ Recording time tracking
- ✅ Audio format: webm/mp4/wav (auto-detect)
- ✅ Clean memory management
- ✅ Error state management

### Scenario Card (`ScenarioCard.tsx`)
- ✅ Displays objective prominently
- ✅ Shows time limit, difficulty, context badges
- ✅ Full prompt text
- ✅ Example opening (if available)
- ✅ Focus tips list
- ✅ Clean, readable layout

---

## 🎨 UI States

### 1. Idle State
```
- Scenario card at top
- "Ready to Practice?" heading
- Blue circular record button
- "Click to start recording" text
- Max duration shown below
- "Get a different scenario" link
```

### 2. Recording State
```
- Large timer (MM:SS)
- Red record button with pulse animation
- Stop icon (square)
- "Recording... Click to stop" text
- Button scales on hover/click
```

### 3. Processing State
```
- Spinning loader icon
- "Processing your recording..." text
- Centered layout
```

### 4. Complete State
```
- Green checkmark icon
- "Recording Complete!" heading
- Audio blob size display
- "Try Again" button (outline)
- "New Scenario" button (solid)
- Coming soon notice
```

---

## 🔧 How It Works

### Recording Flow
```
1. User clicks blue record button
2. Browser requests microphone permission
3. Permission granted → Recording starts
4. Timer begins counting (0:00, 0:01, ...)
5. Button turns red with pulse animation
6. User clicks stop OR max time reached
7. Recording stops, blob created
8. State changes to "processing"
9. After 500ms → State changes to "complete"
10. Display audio size and action buttons
```

### Audio Format Selection
```typescript
// Priority order:
1. audio/webm (preferred, widely supported)
2. audio/mp4 (fallback)
3. audio/wav (last resort)
```

### Memory Management
```typescript
// Cleanup on component unmount:
- Stop timer interval
- Stop all media tracks
- Close MediaRecorder
- Clear audio chunks
```

---

## 🚀 Usage

### Basic Practice
```
Visit: /practice
- Loads random scenario
- Click record → speak → click stop
- Try again or get new scenario
```

### With Filters
```
Visit: /practice?goal=confidence&context=work
- Loads filtered scenario
- Rest of flow same as basic
```

### From Dashboard
```
Daily Challenge → /practice?challenge=xyz
Quick Practice → /practice?goal=X&duration=90
```

---

## 📊 URL Parameters

| Parameter | Values | Example |
|-----------|--------|---------|
| `goal` | clarity, confidence, persuasion, fillers, quick_thinking | `?goal=clarity` |
| `context` | work, social, everyday | `?context=work` |
| `difficulty` | easy, medium, hard | `?difficulty=medium` |
| `challenge` | scenario ID | `?challenge=work-clarity-01` |
| `duration` | 60, 90, 120 | `?duration=90` |

---

## 🎨 Styling Details

### Record Button
```css
Size: 120px × 120px
Idle: bg-blue-500, hover:bg-blue-600
Recording: bg-red-500, hover:bg-red-600
Icon: white, 48px (w-12 h-12)
Shadow: shadow-lg
Animation: pulse (during recording)
Transitions: scale on hover/active
```

### Timer
```css
Font size: text-5xl (48px)
Weight: font-bold
Color: text-gray-900 dark:text-white
Format: M:SS (tabular-nums)
```

### Status Messages
```css
Main text: text-gray-600 dark:text-gray-400
Error: text-red-600 dark:text-red-400
Success: text-green-500
```

---

## 🧪 Testing Checklist

### Basic Recording
- [ ] Visit /practice page
- [ ] Scenario loads and displays
- [ ] Click record button
- [ ] Browser requests mic permission
- [ ] Allow permission
- [ ] Recording starts, timer counts
- [ ] Button turns red with pulse
- [ ] Click stop button
- [ ] Recording stops
- [ ] "Processing..." appears
- [ ] "Complete!" screen shows
- [ ] Audio size displays

### Error Handling
- [ ] Deny mic permission → See error message
- [ ] No microphone → See error message
- [ ] Error displays in red text
- [ ] Record button is disabled

### Auto-Stop
- [ ] Start recording
- [ ] Wait for max duration (e.g., 90s)
- [ ] Recording auto-stops
- [ ] Proceeds to complete state

### Scenario Loading
- [ ] Page loads without URL params → Random scenario
- [ ] With goal param → Filtered by goal
- [ ] With context param → Filtered by context
- [ ] With difficulty param → Filtered by difficulty
- [ ] "Get different scenario" → New scenario loads

### Actions
- [ ] "Try Again" → Returns to idle state, keeps scenario
- [ ] "New Scenario" → Loads new scenario, returns to idle
- [ ] Both buttons work correctly

---

## 🔐 Browser Permissions

### Microphone Access
```
First use: Browser shows permission dialog
User allows: Recording works
User denies: Error message shown
```

### Permission States
```
- "prompt" - Not yet requested
- "granted" - User allowed
- "denied" - User blocked
```

### Handle Denied
```typescript
if (error) {
  toast.error('Failed to access microphone. Please check your permissions.')
  // Button becomes disabled
}
```

---

## 🎯 What's Missing (For Later)

- ⏳ Upload audio to storage
- ⏳ Transcription (Whisper API)
- ⏳ AI feedback (GPT-4)
- ⏳ Save session to database
- ⏳ Playback audio
- ⏳ Waveform visualization
- ⏳ Save/download recording
- ⏳ Progress tracking

---

## 🔧 Technical Details

### MediaRecorder API
```typescript
const mediaRecorder = new MediaRecorder(stream, {
  mimeType: 'audio/webm'
})

mediaRecorder.ondataavailable = (event) => {
  chunks.push(event.data)
}

mediaRecorder.start() // Begin recording
mediaRecorder.stop()  // End recording
```

### Blob Creation
```typescript
const blob = new Blob(chunks, { type: 'audio/webm' })
// Size: blob.size (bytes)
// Type: blob.type (mime type)
```

### Browser Compatibility
```
✅ Chrome/Edge: audio/webm
✅ Firefox: audio/webm
✅ Safari: audio/mp4
✅ Opera: audio/webm
```

---

## 🚀 Next Steps

Now that recording works, you can:

1. **Test the page** - Visit /practice and try recording
2. **Add upload** - Save audio to Supabase Storage
3. **Add transcription** - Send to OpenAI Whisper API
4. **Add feedback** - Get AI coaching with GPT-4
5. **Save sessions** - Store in database
6. **Track progress** - Link to progress page

---

## 🎉 Summary

You now have:
- ✅ Functional voice recording interface
- ✅ Clean, intuitive UI
- ✅ Browser MediaRecorder integration
- ✅ Error handling
- ✅ Multiple recording states
- ✅ Scenario integration
- ✅ URL parameter support
- ✅ Ready for transcription/feedback

**The practice page is MVP-ready for recording!** 🎤

---

## 🔗 Integration Points

**From Dashboard:**
```typescript
// Daily Challenge Card
<Link href="/practice?challenge=daily">
  Start Challenge
</Link>

// Quick Practice Card
<Link href={`/practice?goal=${goal}&duration=${duration}`}>
  Start Practice
</Link>
```

**From Navigation:**
```typescript
// Practice nav link
<Link href="/practice">Practice</Link>
```

**Try it now:** `npm run dev` → Visit http://localhost:3000/practice 🚀


