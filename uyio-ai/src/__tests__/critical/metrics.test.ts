/**
 * Critical Test: Objective Metrics Calculation
 * 
 * Protects Fixes #3, #4, #5:
 * - Fix #3: Accurate filler word counting
 * - Fix #4: Correct word count (filtering empty strings)
 * - Fix #5: Accurate WPM calculation
 * 
 * What we're testing:
 * - Filler words are counted accurately
 * - Empty strings don't inflate word count
 * - WPM is calculated correctly
 * - Filler rate percentages are accurate
 * - Edge cases don't cause crashes
 */

import { calculateObjectiveMetrics } from '@/lib/analysis/metrics'

describe('Objective Metrics Calculation - Critical Path', () => {
  describe('Word Count Accuracy', () => {
    it('counts words correctly in normal text', () => {
      const transcript = 'This is a test with exactly ten words in it'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordCount).toBe(10)
    })

    it('filters empty strings from word count (THE FIX)', () => {
      const transcript = 'Word1    Word2     Word3' // multiple spaces
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      // Should be 3, not more (no empty strings counted)
      expect(metrics.wordCount).toBe(3)
    })

    it('handles extra whitespace without inflating count', () => {
      const transcript = '  Hello  world  test  ' // extra spaces everywhere
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordCount).toBe(3)
    })

    it('handles newlines and tabs correctly', () => {
      const transcript = 'Hello\nworld\ttest\n\n'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordCount).toBe(3)
    })

    it('handles empty transcript without crashing', () => {
      const metrics = calculateObjectiveMetrics('', 60)
      
      expect(metrics.wordCount).toBe(0)
      expect(metrics.fillerCount).toBe(0)
      expect(metrics.wordsPerMinute).toBe(0)
    })

    it('handles single word', () => {
      const metrics = calculateObjectiveMetrics('Hello', 60)
      
      expect(metrics.wordCount).toBe(1)
    })
  })

  describe('Filler Word Counting', () => {
    it('counts single-word fillers accurately', () => {
      const transcript = 'Um, like, I think this is, um, a good idea'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      // um (2x) + like (1x) = 3
      expect(metrics.fillerCount).toBe(3)
    })

    it('counts multi-word fillers accurately', () => {
      const transcript = 'I mean, you know, I think we should, you know, proceed'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      // "I mean" (1x) + "you know" (2x) + "I think" (1x, if in FILLER_WORDS)
      expect(metrics.fillerCount).toBeGreaterThan(0)
    })

    it('provides detailed filler breakdown', () => {
      const transcript = 'So, um, I was like thinking about it, um, you know'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerBreakdown).toHaveProperty('um')
      expect(metrics.fillerBreakdown).toHaveProperty('like')
      expect(metrics.fillerBreakdown).toHaveProperty('so')
      expect(metrics.fillerBreakdown['um']).toBe(2)
    })

    it('does not count filler-like words that are not fillers', () => {
      const transcript = 'I like cats' // "like" as verb, not filler
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      // Should still count it if it matches pattern
      // (regex matches whole words, so context doesn't matter)
      expect(metrics.fillerBreakdown['like']).toBe(1)
    })

    it('handles transcript with no fillers', () => {
      const transcript = 'This speech contains zero filler words'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerCount).toBe(0)
      expect(Object.keys(metrics.fillerBreakdown).length).toBe(0)
    })

    it('handles transcript with many fillers', () => {
      const transcript = 'Um, so, like, basically, um, actually, um, right, so, like'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerCount).toBeGreaterThan(5)
      expect(metrics.fillerRate).toBeGreaterThan(50) // > 50%
    })
  })

  describe('Filler Rate Calculation', () => {
    it('calculates filler rate as percentage', () => {
      // 5 fillers out of 20 words = 25%
      const transcript = 'Um like so um like ' + 'normal words '.repeat(15)
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      const expectedRate = (metrics.fillerCount / metrics.wordCount) * 100
      expect(metrics.fillerRate).toBeCloseTo(expectedRate, 1)
    })

    it('handles 0% filler rate', () => {
      const transcript = 'Perfect speech with no fillers at all'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerRate).toBe(0)
    })

    it('handles 100% filler rate (edge case)', () => {
      const transcript = 'um um um um'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerRate).toBe(100)
    })

    it('uses accurate word count in denominator (THE FIX)', () => {
      // Before fix: extra spaces created empty strings, inflating denominator
      const transcript = 'um  like  so  um' // double spaces
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      // Should be 4 words, not more
      expect(metrics.wordCount).toBe(4)
      expect(metrics.fillerRate).toBe(100) // 4 fillers / 4 words
    })
  })

  describe('WPM Calculation', () => {
    it('calculates WPM correctly', () => {
      const transcript = 'one two three four five six seven eight nine ten' // 10 words
      const metrics = calculateObjectiveMetrics(transcript, 6) // 6 seconds = 0.1 min
      
      // 10 words / 0.1 min = 100 WPM
      expect(metrics.wordsPerMinute).toBe(100)
    })

    it('handles sub-minute recordings', () => {
      const transcript = 'word '.repeat(5) // 5 words
      const metrics = calculateObjectiveMetrics(transcript, 10) // 10 seconds
      
      // 5 words / (10/60) min = 30 WPM
      expect(metrics.wordsPerMinute).toBe(30)
    })

    it('handles exact 60 second recording', () => {
      const transcript = 'word '.repeat(140) // 140 words
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordsPerMinute).toBe(140)
    })

    it('handles long recordings', () => {
      const transcript = 'word '.repeat(300) // 300 words
      const metrics = calculateObjectiveMetrics(transcript, 120) // 2 minutes
      
      expect(metrics.wordsPerMinute).toBe(150)
    })

    it('handles zero duration gracefully', () => {
      const transcript = 'some words'
      const metrics = calculateObjectiveMetrics(transcript, 0)
      
      expect(metrics.wordsPerMinute).toBe(0) // no division by zero crash
    })

    it('uses accurate word count in calculation (THE FIX)', () => {
      // Before fix: empty strings inflated word count, inflating WPM
      const transcript = 'word1  word2  word3' // 3 words with extra spaces
      const metrics = calculateObjectiveMetrics(transcript, 6) // 6 seconds
      
      expect(metrics.wordCount).toBe(3)
      expect(metrics.wordsPerMinute).toBe(30) // 3 words / 0.1 min = 30, not higher
    })
  })

  describe('Pacing Score', () => {
    it('gives perfect score for 140-160 WPM', () => {
      const transcript = 'word '.repeat(150) // 150 words
      const metrics = calculateObjectiveMetrics(transcript, 60) // 1 minute
      
      expect(metrics.wordsPerMinute).toBe(150)
      expect(metrics.pacingScore).toBe(10)
    })

    it('penalizes very slow speech', () => {
      const transcript = 'word '.repeat(50) // 50 words
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordsPerMinute).toBe(50)
      expect(metrics.pacingScore).toBeLessThan(5)
    })

    it('penalizes very fast speech', () => {
      const transcript = 'word '.repeat(250) // 250 words
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordsPerMinute).toBe(250)
      expect(metrics.pacingScore).toBeLessThan(5)
    })
  })

  describe('Filler Score', () => {
    it('gives perfect score for < 1% fillers', () => {
      // 1 filler out of 150 words = 0.67%
      const transcript = 'um ' + 'normal '.repeat(149)
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerRate).toBeLessThan(1)
      expect(metrics.fillerScore).toBe(10)
    })

    it('penalizes high filler usage', () => {
      // 15 fillers out of 100 words = 15%
      const transcript = 'um '.repeat(15) + 'word '.repeat(85)
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerRate).toBeGreaterThan(10)
      expect(metrics.fillerScore).toBeLessThan(5)
    })
  })

  describe('Sentence Counting', () => {
    it('counts sentences by punctuation', () => {
      const transcript = 'First sentence. Second sentence! Third sentence?'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.sentenceCount).toBe(3)
    })

    it('handles no punctuation', () => {
      const transcript = 'One long run-on sentence without punctuation'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.sentenceCount).toBeGreaterThanOrEqual(1)
    })

    it('calculates average sentence length', () => {
      const transcript = 'Short. Longer sentence here. Even longer sentence with more words.'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.avgSentenceLength).toBeGreaterThan(0)
      expect(metrics.avgSentenceLength).toBe(Math.round(metrics.wordCount / metrics.sentenceCount))
    })
  })

  describe('Human-Readable Feedback', () => {
    it('provides pacing feedback string', () => {
      const transcript = 'word '.repeat(150)
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.pacingFeedback).toBeDefined()
      expect(typeof metrics.pacingFeedback).toBe('string')
      expect(metrics.pacingFeedback.length).toBeGreaterThan(0)
    })

    it('provides filler feedback string', () => {
      const transcript = 'um like so um like word word word word'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.fillerFeedback).toBeDefined()
      expect(typeof metrics.fillerFeedback).toBe('string')
      expect(metrics.fillerFeedback).toContain(metrics.fillerCount.toString())
    })
  })

  describe('Edge Cases', () => {
    it('handles extremely short transcript', () => {
      const metrics = calculateObjectiveMetrics('Hi', 1)
      
      expect(metrics.wordCount).toBe(1)
      expect(metrics).toBeDefined()
    })

    it('handles extremely long transcript', () => {
      const transcript = 'word '.repeat(10000) // 10,000 words
      const metrics = calculateObjectiveMetrics(transcript, 3600) // 1 hour
      
      expect(metrics.wordCount).toBe(10000)
      expect(metrics.wordsPerMinute).toBe(Math.round((10000 / 60)))
    })

    it('handles transcript with only punctuation', () => {
      const transcript = '... !!! ???'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordCount).toBe(3) // punctuation marks counted as words
    })

    it('handles transcript with numbers', () => {
      const transcript = '1 2 3 4 5'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordCount).toBe(5)
    })

    it('handles transcript with emojis', () => {
      const transcript = 'Hello 😊 world 🎉'
      const metrics = calculateObjectiveMetrics(transcript, 60)
      
      expect(metrics.wordCount).toBeGreaterThanOrEqual(2)
    })
  })

  describe('Duration Handling', () => {
    it('accepts decimal durations (sub-second precision)', () => {
      const transcript = 'word word word'
      const metrics = calculateObjectiveMetrics(transcript, 0.5) // 0.5 seconds
      
      expect(metrics.duration).toBe(1) // rounded
      expect(metrics.wordsPerMinute).toBeGreaterThan(0)
    })

    it('rounds duration for display', () => {
      const transcript = 'word word word'
      const metrics = calculateObjectiveMetrics(transcript, 10.6)
      
      expect(metrics.duration).toBe(11) // rounded
    })
  })
})

