import type { Scenario } from '@/types/scenario'

/**
 * Hardcoded scenario templates for MVP
 * 50+ scenarios across all goals, contexts, and difficulty levels
 */

export const SCENARIO_TEMPLATES: Scenario[] = [
  // ============================================================================
  // WORK SCENARIOS - CLARITY FOCUS
  // ============================================================================
  {
    id: 'work-clarity-01',
    goal: 'clarity',
    context: 'work',
    difficulty: 'easy',
    objective: 'Explain a project delay to your manager',
    prompt_text:
      'Your project is running two weeks behind schedule. Explain the situation to your manager in a clear, structured way. Include the reason for the delay, what you\'re doing about it, and when you expect to complete the work.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'logic', 'structure'],
    example_opening: 'I want to give you an update on the timeline for the project...',
    tips: ['Use the situation-action-result format', 'Be direct and honest', 'Focus on solutions'],
  },
  {
    id: 'work-clarity-02',
    goal: 'clarity',
    context: 'work',
    difficulty: 'medium',
    objective: 'Give an impromptu status update',
    prompt_text:
      'You\'re unexpectedly asked for a project status update in a meeting. You have 90 seconds to provide a clear overview of where things stand, any blockers, and next steps. Be organized and concise.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'quick_thinking', 'structure'],
    example_opening: 'Thanks for asking. Let me give you the current status in three parts...',
    tips: ['Use a simple structure', 'Prioritize critical information', 'End with clear next steps'],
  },
  {
    id: 'work-clarity-03',
    goal: 'clarity',
    context: 'work',
    difficulty: 'hard',
    objective: 'Present quarterly results to stakeholders',
    prompt_text:
      'Present your team\'s quarterly performance to stakeholders. Include key metrics, wins, challenges, and outlook. Make complex data easy to understand. You have 2 minutes.',
    time_limit_sec: 120,
    eval_focus: ['clarity', 'structure', 'confidence'],
    example_opening: 'This quarter, we focused on three key objectives...',
    tips: ['Lead with the headline', 'Use simple comparisons', 'Visualize numbers with context'],
  },

  // ============================================================================
  // WORK SCENARIOS - CONFIDENCE FOCUS
  // ============================================================================
  {
    id: 'work-confidence-01',
    goal: 'confidence',
    context: 'work',
    difficulty: 'medium',
    objective: 'Pitch a new idea in 90 seconds',
    prompt_text:
      'You have 90 seconds to pitch your innovative idea to senior leadership. They\'re skeptical but open. Speak with authority and conviction. Highlight the opportunity, not just the concept.',
    time_limit_sec: 90,
    eval_focus: ['confidence', 'persuasion', 'clarity'],
    example_opening: 'I\'d like to share an opportunity that could transform how we...',
    tips: ['Start strong', 'Show conviction in your voice', 'Use power poses before speaking'],
  },
  {
    id: 'work-confidence-02',
    goal: 'confidence',
    context: 'work',
    difficulty: 'hard',
    objective: 'Ask for a raise',
    prompt_text:
      'Make your case for a salary increase. Speak confidently about your value, accomplishments, and market rate. Be assertive but professional. You have 2 minutes to make your case.',
    time_limit_sec: 120,
    eval_focus: ['confidence', 'persuasion', 'clarity'],
    example_opening: 'I\'d like to discuss my compensation based on my contributions this year...',
    tips: ['Lead with accomplishments', 'Use data and specifics', 'Maintain confident posture'],
  },
  {
    id: 'work-confidence-03',
    goal: 'confidence',
    context: 'work',
    difficulty: 'easy',
    objective: 'Introduce yourself to a new team',
    prompt_text:
      'You\'re joining a new team. Introduce yourself confidently in 60 seconds. Share your background, what excites you about the role, and what you bring to the table.',
    time_limit_sec: 60,
    eval_focus: ['confidence', 'clarity'],
    example_opening: 'Hi everyone, I\'m excited to be joining the team...',
    tips: ['Smile and make eye contact', 'Show enthusiasm', 'Be authentic'],
  },

  // ============================================================================
  // WORK SCENARIOS - PERSUASION FOCUS
  // ============================================================================
  {
    id: 'work-persuasion-01',
    goal: 'persuasion',
    context: 'work',
    difficulty: 'medium',
    objective: 'Convince stakeholders to approve your budget',
    prompt_text:
      'You need approval for a budget increase. Persuade stakeholders that this investment will pay off. Focus on ROI, not features. Address their concerns preemptively.',
    time_limit_sec: 120,
    eval_focus: ['persuasion', 'logic', 'confidence'],
    example_opening: 'This investment will generate a 3x return within 6 months. Here\'s how...',
    tips: ['Lead with the benefit', 'Use specific numbers', 'Anticipate objections'],
  },
  {
    id: 'work-persuasion-02',
    goal: 'persuasion',
    context: 'work',
    difficulty: 'hard',
    objective: 'Disagree with colleague respectfully',
    prompt_text:
      'A colleague proposed an approach you strongly disagree with. Persuade them to consider your alternative without damaging the relationship. Be diplomatic but firm.',
    time_limit_sec: 90,
    eval_focus: ['persuasion', 'clarity', 'confidence'],
    example_opening: 'I appreciate your perspective, and I\'d like to suggest we also consider...',
    tips: ['Acknowledge their view first', 'Use "and" not "but"', 'Focus on outcomes'],
  },
  {
    id: 'work-persuasion-03',
    goal: 'persuasion',
    context: 'work',
    difficulty: 'easy',
    objective: 'Recommend a process improvement',
    prompt_text:
      'Suggest a change to an existing process that will save time. Persuade your team to adopt it. Explain why it\'s better and how easy it is to implement.',
    time_limit_sec: 60,
    eval_focus: ['persuasion', 'clarity'],
    example_opening: 'I noticed we could save 5 hours a week by changing how we...',
    tips: ['Quantify the benefit', 'Make it sound easy', 'Address "what\'s in it for them"'],
  },

  // ============================================================================
  // WORK SCENARIOS - FILLERS FOCUS
  // ============================================================================
  {
    id: 'work-fillers-01',
    goal: 'fillers',
    context: 'work',
    difficulty: 'medium',
    objective: 'Decline additional work politely without fillers',
    prompt_text:
      'Your manager asks you to take on more work, but your plate is full. Politely decline in 60 seconds without using filler words like "um," "uh," or "like." Use intentional pauses instead.',
    time_limit_sec: 60,
    eval_focus: ['fillers', 'clarity', 'confidence'],
    example_opening: 'I appreciate you thinking of me for this. Currently, I\'m focused on...',
    tips: ['Pause before speaking', 'Replace fillers with silence', 'Breathe between thoughts'],
  },
  {
    id: 'work-fillers-02',
    goal: 'fillers',
    context: 'work',
    difficulty: 'hard',
    objective: 'Lead a brainstorming session cleanly',
    prompt_text:
      'Facilitate a 90-second brainstorming session opener. Set the stage, explain the goal, and invite ideas. Do it without any filler words. Pauses are powerful—use them.',
    time_limit_sec: 90,
    eval_focus: ['fillers', 'clarity', 'confidence'],
    example_opening: 'Today we\'re tackling a challenge that affects our entire team...',
    tips: ['Prepare your opening line', 'Pause at natural breaks', 'Slow down your speech'],
  },

  // ============================================================================
  // WORK SCENARIOS - QUICK THINKING
  // ============================================================================
  {
    id: 'work-quick-01',
    goal: 'quick_thinking',
    context: 'work',
    difficulty: 'medium',
    objective: 'Answer an unexpected question in a meeting',
    prompt_text:
      'You\'re asked an unexpected question: "What do you think is the biggest challenge our industry will face in the next 5 years?" Answer thoughtfully in 90 seconds using the PREP method: Point, Reason, Example, Point.',
    time_limit_sec: 90,
    eval_focus: ['quick_thinking', 'clarity', 'logic'],
    example_opening: 'That\'s a great question. I believe the biggest challenge will be...',
    tips: ['Buy time gracefully', 'Use a framework (PREP)', 'Stay relevant'],
  },
  {
    id: 'work-quick-02',
    goal: 'quick_thinking',
    context: 'work',
    difficulty: 'hard',
    objective: 'Respond to unexpected criticism',
    prompt_text:
      'A colleague publicly challenges your recent work in a meeting. Respond professionally and quickly. Acknowledge their point, provide context, and move forward. 60 seconds.',
    time_limit_sec: 60,
    eval_focus: ['quick_thinking', 'confidence', 'clarity'],
    example_opening: 'I appreciate you bringing that up. Let me provide some context...',
    tips: ['Stay calm', 'Don\'t get defensive', 'Focus on facts'],
  },
  {
    id: 'work-quick-03',
    goal: 'quick_thinking',
    context: 'work',
    difficulty: 'easy',
    objective: 'Give constructive feedback on the spot',
    prompt_text:
      'A team member asks for immediate feedback on their presentation. Give constructive, balanced feedback in 60 seconds. Be specific and helpful.',
    time_limit_sec: 60,
    eval_focus: ['quick_thinking', 'clarity'],
    example_opening: 'Overall, I thought it was strong. A few specific thoughts...',
    tips: ['Start with positives', 'Be specific', 'End with encouragement'],
  },

  // ============================================================================
  // SOCIAL SCENARIOS - CLARITY FOCUS
  // ============================================================================
  {
    id: 'social-clarity-01',
    goal: 'clarity',
    context: 'social',
    difficulty: 'easy',
    objective: 'Recommend a restaurant clearly',
    prompt_text:
      'A friend asks for restaurant recommendations. Clearly explain why they should try your favorite spot. Include the type of food, atmosphere, and what makes it special.',
    time_limit_sec: 60,
    eval_focus: ['clarity', 'structure'],
    example_opening: 'You have to try this place downtown. Here\'s why...',
    tips: ['Paint a picture', 'Be specific about details', 'Give clear directions if asked'],
  },
  {
    id: 'social-clarity-02',
    goal: 'clarity',
    context: 'social',
    difficulty: 'medium',
    objective: 'Explain your hobbies',
    prompt_text:
      'Someone asks about your hobbies. Explain one in a way that makes it interesting even if they\'re unfamiliar with it. Make it relatable and clear.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'structure'],
    example_opening: 'I\'m really into [hobby]. Let me explain what makes it so engaging...',
    tips: ['Start with what it is', 'Explain why you love it', 'Make it relatable'],
  },
  {
    id: 'social-clarity-03',
    goal: 'clarity',
    context: 'social',
    difficulty: 'easy',
    objective: 'Describe your ideal day',
    prompt_text:
      'Someone asks you to describe your ideal day from morning to night. Walk them through it clearly and engagingly in 90 seconds.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'structure'],
    example_opening: 'My ideal day would start with...',
    tips: ['Follow chronological order', 'Include specific details', 'Show enthusiasm'],
  },

  // ============================================================================
  // SOCIAL SCENARIOS - CONFIDENCE FOCUS
  // ============================================================================
  {
    id: 'social-confidence-01',
    goal: 'confidence',
    context: 'social',
    difficulty: 'medium',
    objective: 'Give a wedding toast',
    prompt_text:
      'You\'re giving a toast at a friend\'s wedding. Speak confidently and warmly for 90 seconds. Share a story, express your happiness, and wish them well.',
    time_limit_sec: 90,
    eval_focus: ['confidence', 'clarity'],
    example_opening: 'I\'ve known [name] for [years], and I\'ve never seen them happier...',
    tips: ['Speak slowly and clearly', 'Make eye contact', 'Smile genuinely'],
  },
  {
    id: 'social-confidence-02',
    goal: 'confidence',
    context: 'social',
    difficulty: 'easy',
    objective: 'Compliment someone genuinely',
    prompt_text:
      'Give a heartfelt compliment to someone. Be specific, genuine, and confident. Avoid downplaying or being awkward. 30 seconds.',
    time_limit_sec: 60,
    eval_focus: ['confidence', 'clarity'],
    example_opening: 'I wanted to tell you that I really appreciate...',
    tips: ['Be specific', 'Make eye contact', 'Don\'t minimize it'],
  },
  {
    id: 'social-confidence-03',
    goal: 'confidence',
    context: 'social',
    difficulty: 'medium',
    objective: 'Tell an engaging story',
    prompt_text:
      'Tell a story from your life that has a lesson or insight. Make it engaging and speak with confidence. Set the scene, build tension, and deliver a satisfying conclusion.',
    time_limit_sec: 120,
    eval_focus: ['confidence', 'clarity', 'structure'],
    example_opening: 'Let me tell you about the time I learned...',
    tips: ['Use vivid details', 'Vary your pace', 'Build to a point'],
  },

  // ============================================================================
  // SOCIAL SCENARIOS - PERSUASION FOCUS
  // ============================================================================
  {
    id: 'social-persuasion-01',
    goal: 'persuasion',
    context: 'social',
    difficulty: 'easy',
    objective: 'Convince a friend to try something new',
    prompt_text:
      'Persuade a friend to try a new restaurant, activity, or experience with you. Make it sound appealing and address their potential hesitations.',
    time_limit_sec: 60,
    eval_focus: ['persuasion', 'clarity'],
    example_opening: 'I think you\'d really enjoy this because...',
    tips: ['Focus on what they value', 'Make it easy to say yes', 'Share your enthusiasm'],
  },
  {
    id: 'social-persuasion-02',
    goal: 'persuasion',
    context: 'social',
    difficulty: 'medium',
    objective: 'Recommend a book convincingly',
    prompt_text:
      'Persuade someone to read a book you loved. Sell it without spoilers. Focus on themes, writing style, and why it resonated with you.',
    time_limit_sec: 90,
    eval_focus: ['persuasion', 'clarity'],
    example_opening: 'This book completely changed how I think about...',
    tips: ['Tap into emotions', 'Relate it to their interests', 'Create curiosity'],
  },

  // ============================================================================
  // SOCIAL SCENARIOS - FILLERS FOCUS
  // ============================================================================
  {
    id: 'social-fillers-01',
    goal: 'fillers',
    context: 'social',
    difficulty: 'medium',
    objective: 'Make small talk without fillers',
    prompt_text:
      'You\'re at a networking event. Make small talk with someone new for 60 seconds without using filler words. Ask questions and share about yourself smoothly.',
    time_limit_sec: 60,
    eval_focus: ['fillers', 'clarity'],
    example_opening: 'I noticed you work in [industry]. What brought you to that field?',
    tips: ['Prepare conversation starters', 'Listen actively', 'Use pauses naturally'],
  },
  {
    id: 'social-fillers-02',
    goal: 'fillers',
    context: 'social',
    difficulty: 'easy',
    objective: 'Apologize cleanly for being late',
    prompt_text:
      'You\'re 15 minutes late. Apologize sincerely in 30 seconds without filler words. Take responsibility and move forward gracefully.',
    time_limit_sec: 60,
    eval_focus: ['fillers', 'clarity'],
    example_opening: 'I apologize for being late. Traffic was heavier than expected...',
    tips: ['Be brief and genuine', 'Don\'t over-explain', 'Pause confidently'],
  },

  // ============================================================================
  // SOCIAL SCENARIOS - QUICK THINKING
  // ============================================================================
  {
    id: 'social-quick-01',
    goal: 'quick_thinking',
    context: 'social',
    difficulty: 'medium',
    objective: 'Politely exit a conversation',
    prompt_text:
      'You\'re stuck in a conversation you need to leave. Exit gracefully in 30 seconds without being rude. Give a reason and transition smoothly.',
    time_limit_sec: 60,
    eval_focus: ['quick_thinking', 'clarity'],
    example_opening: 'It\'s been great talking with you. I need to...',
    tips: ['Be polite but firm', 'Give a brief reason', 'End on a positive note'],
  },
  {
    id: 'social-quick-02',
    goal: 'quick_thinking',
    context: 'social',
    difficulty: 'easy',
    objective: 'Introduce two people to each other',
    prompt_text:
      'Introduce two people who don\'t know each other. Give each person context about the other so they can start a conversation. 30 seconds.',
    time_limit_sec: 60,
    eval_focus: ['quick_thinking', 'clarity'],
    example_opening: '[Name 1], meet [Name 2]. You both work in...',
    tips: ['Give them a conversation starter', 'Highlight commonalities', 'Be enthusiastic'],
  },

  // ============================================================================
  // EVERYDAY SCENARIOS - CLARITY FOCUS
  // ============================================================================
  {
    id: 'everyday-clarity-01',
    goal: 'clarity',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Describe your morning routine',
    prompt_text:
      'Walk someone through your typical morning routine from waking up to leaving home. Be clear and detailed without being boring.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'structure'],
    example_opening: 'My morning starts at [time] when I...',
    tips: ['Follow chronological order', 'Include key details', 'Keep it engaging'],
  },
  {
    id: 'everyday-clarity-02',
    goal: 'clarity',
    context: 'everyday',
    difficulty: 'medium',
    objective: 'Give clear directions',
    prompt_text:
      'Give someone directions to a location you know well. Be specific about landmarks, turns, and distances. Make it impossible to get lost.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'logic', 'structure'],
    example_opening: 'From here, you\'ll want to head north until you see...',
    tips: ['Use landmarks', 'Give distances', 'Anticipate confusion points'],
  },
  {
    id: 'everyday-clarity-03',
    goal: 'clarity',
    context: 'everyday',
    difficulty: 'hard',
    objective: 'Explain a complex topic simply',
    prompt_text:
      'Explain a complex concept from your field to someone with no background knowledge. Make it simple without being condescending. Use analogies.',
    time_limit_sec: 120,
    eval_focus: ['clarity', 'structure'],
    example_opening: 'Think of it like this...',
    tips: ['Use analogies', 'Avoid jargon', 'Check for understanding'],
  },

  // ============================================================================
  // EVERYDAY SCENARIOS - CONFIDENCE FOCUS
  // ============================================================================
  {
    id: 'everyday-confidence-01',
    goal: 'confidence',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Order at a restaurant confidently',
    prompt_text:
      'You\'re at a restaurant. Order your meal confidently, ask questions about the menu, and make any special requests. Speak clearly and assertively.',
    time_limit_sec: 60,
    eval_focus: ['confidence', 'clarity'],
    example_opening: 'I\'d like the [dish], and I have a question about...',
    tips: ['Speak clearly', 'Don\'t apologize', 'Make eye contact'],
  },
  {
    id: 'everyday-confidence-02',
    goal: 'confidence',
    context: 'everyday',
    difficulty: 'medium',
    objective: 'Make a complaint politely but firmly',
    prompt_text:
      'You received poor service. Make a complaint that\'s firm but polite. Explain the issue, what you expect, and stay confident throughout.',
    time_limit_sec: 90,
    eval_focus: ['confidence', 'clarity'],
    example_opening: 'I want to bring an issue to your attention...',
    tips: ['State facts calmly', 'Be clear about resolution', 'Stay composed'],
  },
  {
    id: 'everyday-confidence-03',
    goal: 'confidence',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Leave a confident voicemail',
    prompt_text:
      'Leave a voicemail for someone you\'re trying to reach. Be clear, concise, and confident. State your purpose and what you need from them.',
    time_limit_sec: 60,
    eval_focus: ['confidence', 'clarity'],
    example_opening: 'Hi, this is [name]. I\'m calling about...',
    tips: ['Slow down', 'Include callback info', 'Be brief'],
  },

  // ============================================================================
  // EVERYDAY SCENARIOS - PERSUASION FOCUS
  // ============================================================================
  {
    id: 'everyday-persuasion-01',
    goal: 'persuasion',
    context: 'everyday',
    difficulty: 'medium',
    objective: 'Negotiate a price',
    prompt_text:
      'You\'re buying something expensive. Negotiate a better price. Be persuasive but respectful. Explain why you deserve a discount.',
    time_limit_sec: 90,
    eval_focus: ['persuasion', 'confidence'],
    example_opening: 'I\'m very interested, but I was hoping we could discuss the price...',
    tips: ['Do your research', 'Be willing to walk away', 'Find win-win'],
  },
  {
    id: 'everyday-persuasion-02',
    goal: 'persuasion',
    context: 'everyday',
    difficulty: 'easy',
    objective: 'Explain why you\'re passionate about something',
    prompt_text:
      'Persuade someone that your hobby or interest is worth their attention. Share your passion in a way that makes them curious.',
    time_limit_sec: 90,
    eval_focus: ['persuasion', 'clarity'],
    example_opening: 'Let me tell you why I\'m so passionate about...',
    tips: ['Share personal stories', 'Show genuine enthusiasm', 'Make it relatable'],
  },

  // ============================================================================
  // EVERYDAY SCENARIOS - FILLERS FOCUS
  // ============================================================================
  {
    id: 'everyday-fillers-01',
    goal: 'fillers',
    context: 'everyday',
    difficulty: 'medium',
    objective: 'Share weekend plans without fillers',
    prompt_text:
      'Someone asks about your weekend plans. Share them in detail for 60 seconds without using "um," "uh," or "like." Use intentional pauses.',
    time_limit_sec: 60,
    eval_focus: ['fillers', 'clarity'],
    example_opening: 'This weekend I\'m planning to...',
    tips: ['Think before you speak', 'Pause between thoughts', 'Speak deliberately'],
  },
  {
    id: 'everyday-fillers-02',
    goal: 'fillers',
    context: 'everyday',
    difficulty: 'hard',
    objective: 'Speak for 2 minutes without any fillers',
    prompt_text:
      'Choose any topic you\'re comfortable with and speak about it for 2 full minutes without a single filler word. This is a pure elimination challenge.',
    time_limit_sec: 120,
    eval_focus: ['fillers', 'clarity', 'confidence'],
    example_opening: 'Today I want to talk about something I find fascinating...',
    tips: ['Pick a topic you know well', 'Slow your pace', 'Embrace silence'],
  },

  // ============================================================================
  // EVERYDAY SCENARIOS - QUICK THINKING
  // ============================================================================
  {
    id: 'everyday-quick-01',
    goal: 'quick_thinking',
    context: 'everyday',
    difficulty: 'hard',
    objective: 'Answer "tell me about yourself"',
    prompt_text:
      'You\'re asked the classic question: "Tell me about yourself." Answer in 90 seconds. Make it interesting, relevant, and memorable.',
    time_limit_sec: 90,
    eval_focus: ['quick_thinking', 'clarity', 'structure'],
    example_opening: 'I\'d describe myself as someone who...',
    tips: ['Use present-past-future structure', 'Highlight unique aspects', 'End with a hook'],
  },
  {
    id: 'everyday-quick-02',
    goal: 'quick_thinking',
    context: 'everyday',
    difficulty: 'medium',
    objective: 'Explain your job to a 5-year-old',
    prompt_text:
      'Explain what you do for work as if you\'re talking to a 5-year-old child. Make it simple, fun, and easy to understand.',
    time_limit_sec: 60,
    eval_focus: ['quick_thinking', 'clarity'],
    example_opening: 'You know how [simple example]? Well, I help people...',
    tips: ['Use simple analogies', 'Avoid jargon completely', 'Make it relatable'],
  },

  // ============================================================================
  // CHALLENGE SCENARIOS - MIXED
  // ============================================================================
  {
    id: 'challenge-01',
    goal: 'persuasion',
    context: 'work',
    difficulty: 'hard',
    objective: 'Defend an unpopular opinion',
    prompt_text:
      'Take an unpopular opinion in your field and defend it persuasively. Make a logical case even if you don\'t personally agree. Show you can argue any side.',
    time_limit_sec: 120,
    eval_focus: ['persuasion', 'logic', 'confidence'],
    example_opening: 'I know this is controversial, but hear me out...',
    tips: ['Acknowledge the counterargument', 'Use strong logic', 'Stay composed'],
  },
  {
    id: 'challenge-02',
    goal: 'quick_thinking',
    context: 'social',
    difficulty: 'hard',
    objective: 'Persuade someone in 30 seconds',
    prompt_text:
      'You have just 30 seconds to persuade someone to take a specific action. Choose your action and make every word count. Be concise and compelling.',
    time_limit_sec: 60,
    eval_focus: ['persuasion', 'quick_thinking', 'clarity'],
    example_opening: 'In 30 seconds, I\'m going to convince you to...',
    tips: ['Lead with the benefit', 'One idea only', 'Strong call to action'],
  },
  {
    id: 'challenge-03',
    goal: 'confidence',
    context: 'work',
    difficulty: 'hard',
    objective: 'Handle a hostile question with confidence',
    prompt_text:
      'Someone asks you an aggressive question designed to make you defensive. Respond with confidence and grace. Don\'t take the bait. Stay professional.',
    time_limit_sec: 90,
    eval_focus: ['confidence', 'quick_thinking', 'clarity'],
    example_opening: 'That\'s an important concern. Let me address it directly...',
    tips: ['Stay calm', 'Acknowledge without agreeing', 'Redirect constructively'],
  },
  {
    id: 'challenge-04',
    goal: 'clarity',
    context: 'everyday',
    difficulty: 'hard',
    objective: 'Explain three unrelated concepts in sequence',
    prompt_text:
      'Explain three completely unrelated concepts in 90 seconds: 1) How compound interest works, 2) Why the sky is blue, 3) How to make a perfect omelet. Make each clear and concise.',
    time_limit_sec: 90,
    eval_focus: ['clarity', 'quick_thinking', 'structure'],
    example_opening: 'I\'ll explain three things quickly and clearly...',
    tips: ['Use transitions', 'Be concise', 'Maintain energy'],
  },
  {
    id: 'challenge-05',
    goal: 'fillers',
    context: 'everyday',
    difficulty: 'hard',
    objective: 'Improvise on a random topic',
    prompt_text:
      'Speak for 90 seconds on a completely random topic: "The History of Doorknobs." Make it interesting and informative without any filler words. Yes, you can make things up.',
    time_limit_sec: 90,
    eval_focus: ['fillers', 'quick_thinking', 'clarity'],
    example_opening: 'Doorknobs are more interesting than you might think...',
    tips: ['Embrace creativity', 'Stay committed', 'Have fun with it'],
  },
]

/**
 * Get all scenarios
 */
export function getAllScenarios(): Scenario[] {
  return SCENARIO_TEMPLATES
}

/**
 * Get scenarios by goal
 */
export function getScenariosByGoal(goal: string): Scenario[] {
  return SCENARIO_TEMPLATES.filter((s) => s.goal === goal)
}

/**
 * Get scenarios by context
 */
export function getScenariosByContext(context: string): Scenario[] {
  return SCENARIO_TEMPLATES.filter((s) => s.context === context)
}

/**
 * Get scenarios by difficulty
 */
export function getScenariosByDifficulty(difficulty: string): Scenario[] {
  return SCENARIO_TEMPLATES.filter((s) => s.difficulty === difficulty)
}

/**
 * Get scenario by ID
 */
export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIO_TEMPLATES.find((s) => s.id === id)
}

/**
 * Get total count of scenarios
 */
export function getTotalScenarioCount(): number {
  return SCENARIO_TEMPLATES.length
}


