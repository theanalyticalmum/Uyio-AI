'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// Metadata is handled in layout.tsx for client components
// Title: 7-Day Speaking Confidence Course | Uyio AI
// Description: Master confident speaking in 7 days. Join 300+ professionals on the waitlist.

export default function CoursesPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [error, setError] = useState('')

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('course_waitlist')
        .insert([{ email }])
      
      if (insertError) {
        if (insertError.code === '23505') {
          setError('You\'re already on the waitlist!')
        } else {
          setError('Something went wrong. Please try again.')
        }
      } else {
        setJoined(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    
    setLoading(false)
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-2">You\'re on the list!</h2>
            <p className="text-gray-300">Check your email for updates about the course launch.</p>
            <p className="text-sm text-gray-500 mt-4">Course launches soon</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm mb-4">
            FREE DURING BETA
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Master Confident Speaking in 7 Days
          </h1>
          <p className="text-xl text-gray-400">
            Join 300+ professionals already on the waitlist
          </p>
        </div>

        {/* What You'll Learn Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">What You\'ll Learn</h2>
          <div className="space-y-6">
            {[
              {
                title: 'Daily communication challenges',
                description: 'Practice real-world scenarios that build clarity, tone, structure, and confidence.'
              },
              {
                title: 'Video examples & demonstrations',
                description: 'See what "good" looks like through short, relatable models.'
              },
              {
                title: 'Instant AI feedback',
                description: 'Get clear guidance on how to improve — every single day.'
              },
              {
                title: 'Structured skill progression',
                description: 'Each day builds on the last: clarity → confidence → quick thinking → articulation → persuasion → performance.'
              },
              {
                title: 'Real-life speaking applications',
                description: 'Better presentations, interviews, meetings, disagreements, storytelling, and more.'
              },
              {
                title: 'Designed for busy people',
                description: '15 minutes per day. No fluff. No overwhelm. Just progress.'
              }
            ].map((item, index) => (
              <div key={index} className="border-l-2 border-purple-500/30 pl-6">
                <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Course Overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8">Course Overview</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                day: 1,
                title: 'Speak With Clarity',
                description: 'How to structure your thoughts so you sound organized, precise, and understood.'
              },
              {
                day: 2,
                title: 'Sound Confident (Without Feeling It)',
                description: 'Voice techniques that project authority even when your mind is nervous.'
              },
              {
                day: 3,
                title: 'Quick Thinking: Speak On The Fly',
                description: 'Learn to respond fast and intelligently using prompt patterns.'
              },
              {
                day: 4,
                title: 'Articulation & Enunciation',
                description: 'Training drills to sound sharp, polished, and professional.'
              },
              {
                day: 5,
                title: 'Reduce Fillers (Ums, Ahs, Likes)',
                description: 'Break the filler-word habit using behavioral triggers and AI-guided practice.'
              },
              {
                day: 6,
                title: 'Make Compelling Points (Persuasion)',
                description: 'Structure arguments, push back respectfully, and speak so people listen.'
              },
              {
                day: 7,
                title: 'Real-World Speaking Challenge',
                description: 'Your final confidence test: a timed speaking task with full AI coaching.'
              }
            ].map((day) => (
              <div key={day.day} className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 font-bold">
                    {day.day}
                  </div>
                  <h3 className="font-semibold text-white">Day {day.day} — {day.title}</h3>
                </div>
                <p className="text-gray-400 text-sm">{day.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Powered by Uyio AI */}
        <section className="mb-16 bg-gray-900 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Powered by Uyio AI</h2>
          <p className="text-gray-300 mb-6">The course includes:</p>
          <ul className="space-y-2 text-gray-400">
            <li>• AI-generated challenges tailored to your speaking goals</li>
            <li>• Instant scoring + coaching</li>
            <li>• Real-time articulation correction</li>
            <li>• Pacing and filler training</li>
            <li>• Emotional delivery feedback</li>
            <li>• Voice pattern improvement tips</li>
            <li>• Progress tracking across all 7 days</li>
          </ul>
          <p className="text-white font-semibold mt-6">
            This course doesn\'t teach communication — it transforms it.
          </p>
        </section>

        {/* Waitlist Form */}
        <section className="mb-16">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Join the Waitlist</h2>
              <p className="text-gray-400">Be the first to access the beta.</p>
            </div>
            
            <form onSubmit={handleJoinWaitlist} className="space-y-4">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </button>
              
              <p className="text-center text-sm text-gray-500">
                We\'ll only email you about the course launch. No spam.
              </p>
            </form>
          </div>
        </section>

        {/* Footer Trust Indicators */}
        <footer className="text-center text-sm text-gray-500 space-y-1">
          <p>• We never share your email or recordings</p>
          <p>• Cancel anytime</p>
          <p>• Built by Uyio AI, your AI communication coach</p>
        </footer>
      </div>
    </div>
  )
}

