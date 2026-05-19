// app-mental-content-extended.js v1.0
// ================================================================
// SmartCrick — Extended Mental Session Content
// Adds 80+ fully scripted sessions + unique visual configs for ALL
// sessions. Load AFTER app-mental-content.js.
//
// Each session gets:
//   1. Unique guided script (phase-by-phase)
//   2. Unique visual config (color, orb behavior, symbol, speed)
//   3. Unique "personality" (tone, intensity, pacing)
// ================================================================
(function() {
'use strict';
var A = window.SC_APP;
if (!A || !A.MENTAL_CONTENT) {
  console.error('[SC] app-mental-content-extended: load AFTER app-mental-content.js');
  return;
}

// ================================================================
// PER-SESSION VISUAL CONFIG
// Overrides the type-level default for individual character
// color: unique hex | orbSpeed: 0.3–2.0 | particleCount: 0–8
// particleRadius: 20–50 | glowIntensity: 0.1–0.5
// symbol: center text | ringStyle: 'solid'|'pulse'|'breath'
// ================================================================
var SESSION_VISUALS = {
  // ── BREATH sessions ──────────────────────────────────────────
  '4-7-8-breath-lock':         { color:'#4f46e5', symbol:'4·7·8', orbSpeed:0.35, glowIntensity:0.3 },
  'box-breathing-navy-seal':   { color:'#1e40af', symbol:'□',     orbSpeed:0.25, glowIntensity:0.25 },
  'physiological-sigh':        { color:'#0891b2', symbol:'~',     orbSpeed:0.5,  glowIntensity:0.2  },
  'detox-breath':              { color:'#059669', symbol:'↑↓',    orbSpeed:0.4,  glowIntensity:0.2  },
  'deep-calm-breathing':       { color:'#7c3aed', symbol:'∞',     orbSpeed:0.3,  glowIntensity:0.28 },
  'deep-breathing-anxiety':    { color:'#6366f1', symbol:'≈',     orbSpeed:0.45, glowIntensity:0.22 },
  'breathe-through-anger':     { color:'#dc2626', symbol:'↓',     orbSpeed:0.6,  glowIntensity:0.35 },
  'breathe-through-bad-day':   { color:'#7c3aed', symbol:'→',     orbSpeed:0.4,  glowIntensity:0.25 },
  '4-7-8-breath-reset':        { color:'#4338ca', symbol:'4·7·8', orbSpeed:0.4,  glowIntensity:0.2  },
  'deep-recovery-breathing':   { color:'#0d9488', symbol:'∿',     orbSpeed:0.3,  glowIntensity:0.25 },
  'anxiety-dissolve-protocol': { color:'#8b5cf6', symbol:'·',     orbSpeed:0.5,  glowIntensity:0.3  },

  // ── GROUND sessions ─────────────────────────────────────────
  '5-4-3-2-1-grounding':       { color:'#16a34a', symbol:'5',    particleCount:5, particleRadius:32, orbSpeed:0.7  },
  'anchoring-peak-state':      { color:'#22c55e', symbol:'⚡',   particleCount:6, particleRadius:36, orbSpeed:0.9  },
  'grounding-instant-presence':{ color:'#15803d', symbol:'◉',   particleCount:4, particleRadius:28, orbSpeed:0.65 },
  'reset-button':              { color:'#16a34a', symbol:'↺',    particleCount:3, particleRadius:26, orbSpeed:0.8  },
  'focus-next-ball':           { color:'#84cc16', symbol:'●',    particleCount:1, particleRadius:40, orbSpeed:1.2  },
  'confidence-countdown':      { color:'#22c55e', symbol:'10',   particleCount:4, particleRadius:30, orbSpeed:1.0  },
  '10-second-rule':            { color:'#4ade80', symbol:'10',   particleCount:2, particleRadius:24, orbSpeed:1.4  },
  'countdown-to-clarity':      { color:'#16a34a', symbol:'▼',   particleCount:3, particleRadius:28, orbSpeed:0.9  },
  'micro-focus-burst':         { color:'#86efac', symbol:'⊙',   particleCount:2, particleRadius:22, orbSpeed:1.6  },
  'power-pose-reset':          { color:'#15803d', symbol:'▲',   particleCount:4, particleRadius:32, orbSpeed:0.75 },
  'celebrate-small-wins':      { color:'#fbbf24', symbol:'✦',   particleCount:7, particleRadius:38, orbSpeed:0.8  },
  'focus-lock-in':             { color:'#06b6d4', symbol:'◎',   particleCount:2, particleRadius:24, orbSpeed:1.3  },
  'task-isolation-protocol':   { color:'#0ea5e9', symbol:'▣',   particleCount:1, particleRadius:20, orbSpeed:1.1  },
  'sensory-narrowing':         { color:'#22d3ee', symbol:'→·',  particleCount:2, particleRadius:26, orbSpeed:1.2  },
  'laser-focus-activation':    { color:'#f97316', symbol:'·',   particleCount:1, particleRadius:20, orbSpeed:1.8  },
  'strategic-pause-activation':{ color:'#16a34a', symbol:'‖',   particleCount:3, particleRadius:28, orbSpeed:0.6  },
  'silent-minute-protocol':    { color:'#1f2937', symbol:'○',   particleCount:0, particleRadius:0,  orbSpeed:0.3  },
  'trusting-instinct':         { color:'#a78bfa', symbol:'~',   particleCount:5, particleRadius:34, orbSpeed:0.85 },
  'present-moment-is-enough':  { color:'#34d399', symbol:'◦',   particleCount:3, particleRadius:26, orbSpeed:0.5  },

  // ── VISUALIZE sessions ───────────────────────────────────────
  'future-memory':             { color:'#0ea5e9', symbol:'◈', glowIntensity:0.25 },
  'goal-movie':                { color:'#6366f1', symbol:'▶', glowIntensity:0.28 },
  'champion-mindset-simulation':{ color:'#f59e0b', symbol:'⬟', glowIntensity:0.3 },
  'perfect-performance':       { color:'#10b981', symbol:'✓', glowIntensity:0.22 },
  'visualization-skill-building':{ color:'#8b5cf6', symbol:'⊕', glowIntensity:0.25 },
  'obstacle-visualisation':    { color:'#ef4444', symbol:'◇', glowIntensity:0.28 },
  'vivid-goal-map':            { color:'#f59e0b', symbol:'✦', glowIntensity:0.32 },
  'new-identity-visualisation':{ color:'#a78bfa', symbol:'◑', glowIntensity:0.3  },
  'healing-visualisation':     { color:'#34d399', symbol:'❂', glowIntensity:0.22 },
  'flow-state-trigger':        { color:'#06b6d4', symbol:'∞', glowIntensity:0.35 },
  'flow-state-architecture':   { color:'#0284c7', symbol:'≋', glowIntensity:0.4  },
  'zone-of-genius-activation': { color:'#f59e0b', symbol:'⬡', glowIntensity:0.38 },
  'mental-highlight-reel':     { color:'#ec4899', symbol:'▷', glowIntensity:0.25 },

  // ── ACTIVATE sessions ────────────────────────────────────────
  'game-day-activation':       { color:'#f59e0b', symbol:'⚡', glowIntensity:0.4  },
  'pre-game-activation':       { color:'#f97316', symbol:'▲', glowIntensity:0.38 },
  'morning-mindset-ritual':    { color:'#fbbf24', symbol:'☀', glowIntensity:0.32 },
  'morning-positivity-charge': { color:'#f59e0b', symbol:'↑', glowIntensity:0.3  },
  'morning-energy-boost':      { color:'#fb923c', symbol:'↑', glowIntensity:0.28 },
  'morning-clarity-protocol':  { color:'#fcd34d', symbol:'◎', glowIntensity:0.25 },
  'win-the-morning':           { color:'#f59e0b', symbol:'✦', glowIntensity:0.35 },
  'best-self-morning':         { color:'#f97316', symbol:'◈', glowIntensity:0.3  },
  'motivational-momentum-builder':{ color:'#f59e0b', symbol:'→', glowIntensity:0.35 },
  'fuel-your-fire':            { color:'#ef4444', symbol:'🔥', glowIntensity:0.45 },
  'believe-it-session':        { color:'#fbbf24', symbol:'★', glowIntensity:0.4  },
  'mental-toughness-builder':  { color:'#78716c', symbol:'⬧', glowIntensity:0.28 },
  'competition-as-fuel':       { color:'#dc2626', symbol:'↗', glowIntensity:0.4  },

  // ── RECOVER sessions ─────────────────────────────────────────
  'post-game-emotional-release':{ color:'#0d9488', symbol:'↓', glowIntensity:0.2 },
  'sleep-better-tonight':      { color:'#1e3a5f', symbol:'☽', glowIntensity:0.18 },
  'decompression-zone':        { color:'#0d9488', symbol:'≡', glowIntensity:0.18 },
  'full-body-relaxation':      { color:'#0f766e', symbol:'~', glowIntensity:0.15 },
  'intentional-rest':          { color:'#134e4a', symbol:'□', glowIntensity:0.15 },
  'emotional-drain-release':   { color:'#2dd4bf', symbol:'↓', glowIntensity:0.22 },
  'radical-acceptance':        { color:'#0d9488', symbol:'○', glowIntensity:0.18 },
  'inner-lake':                { color:'#0e7490', symbol:'≈', glowIntensity:0.2  },
  'releasing-expectations':    { color:'#0d9488', symbol:'↑', glowIntensity:0.18 },
  'releasing-outcome-attachment':{ color:'#14b8a6', symbol:'◦', glowIntensity:0.2 },

  // ── REFLECT sessions ─────────────────────────────────────────
  'failure-inventory':         { color:'#d97706', symbol:'?', glowIntensity:0.25 },
  'evening-review-unwind':     { color:'#b45309', symbol:'3', glowIntensity:0.2  },
  'self-compassion-break':     { color:'#f59e0b', symbol:'♡', glowIntensity:0.25 },
  'accountability-mirror':     { color:'#92400e', symbol:'◉', glowIntensity:0.22 },
  'gratitude-before-game':     { color:'#d97706', symbol:'✦', glowIntensity:0.28 },
  'why-engine':                { color:'#b45309', symbol:'?', glowIntensity:0.3  },
  'night-review-3-good-things':{ color:'#92400e', symbol:'3', glowIntensity:0.18 },
  'inner-critic-translator':   { color:'#d97706', symbol:'↔', glowIntensity:0.25 },
  'freedom-from-judgment':     { color:'#fbbf24', symbol:'○', glowIntensity:0.22 },

  // ── PRESSURE sessions ────────────────────────────────────────
  'pressure-rehearsal-crucial-over':{ color:'#dc2626', symbol:'!', glowIntensity:0.5 },
  'choke-proof-preparation':   { color:'#b91c1c', symbol:'∅', glowIntensity:0.4  },
  'high-stakes-rehearsal':     { color:'#ef4444', symbol:'↑', glowIntensity:0.45 },
  'stress-inoculation':        { color:'#dc2626', symbol:'▲', glowIntensity:0.42 },
  'bounce-back-blueprint':     { color:'#f97316', symbol:'↗', glowIntensity:0.35 },
  'comeback-mindset':          { color:'#f97316', symbol:'→', glowIntensity:0.38 },
  'beat-fear-of-failure':      { color:'#dc2626', symbol:'✗', glowIntensity:0.45 },
  'composed-under-fire':       { color:'#92400e', symbol:'─', glowIntensity:0.3  },
  'embrace-the-discomfort':    { color:'#c2410c', symbol:'▲', glowIntensity:0.4  },
};

// ================================================================
// EXTENDED SESSION SCRIPTS — 80+ additional sessions
// ================================================================
var EXTENDED_CONTENT = {

  // ─── MICRO FOCUS BURST (3 min) ────────────────────────────────
  'micro-focus-burst': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 15,
        text: 'Thirty seconds to lock in. Close your eyes. Drop your shoulders. One breath.'
      },
      { id: 'breathe', duration: 125,
        text: 'Pick one thing. One specific thing in front of you right now.\n\nNot your whole performance. Not the innings. Not the match.\n\nOne delivery. One ball. One action.\n\nBring your entire attention to that single thing and hold it there.\n\nEverything else falls away. The crowd. The scoreboard. The last ball. None of it exists.\n\nOnly this. Only now. Only the one thing you are about to do.'
      },
      { id: 'integrate', duration: 40,
        text: 'Your focus is a narrow beam. Not scattered light — a laser.\n\nSingle-point attention is a skill. You just practiced it.\n\nApply it now.'
      }
    ]
  },

  // ─── COUNTDOWN TO CLARITY (5 min) ────────────────────────────
  'countdown-to-clarity': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 30,
        text: 'When the mind is noisy — full of doubt, analysis, or anxiety — sometimes the simplest tool is a countdown.\n\nNot to count down to an action. To count down noise into silence.\n\nClose your eyes. Begin.'
      },
      { id: 'breathe', duration: 180,
        text: 'TEN — the day so far. Whatever happened, however you got here. Acknowledge it.\n\nNINE — your expectations. Put them down for now. You can pick them back up later.\n\nEIGHT — what others think. Let it go. Their opinions exist outside this circle.\n\nSEVEN — the result. You do not control outcomes. Only processes.\n\nSIX — the past. The previous over. The last shot. The mistake. Gone.\n\nFIVE — you are halfway. The noise is quieter now. Notice it.\n\nFOUR — your body. Become aware of it. Feet, legs, core, hands. It is here. It is ready.\n\nTHREE — your breath. Feel it entering and leaving. Slow it slightly.\n\nTWO — this moment. This exact moment. Nothing else.\n\nONE — you are here. Clear. Present. Ready.'
      },
      { id: 'integrate', duration: 90,
        text: 'Clarity is not the absence of thought. It is the presence of the right thought, at the right time.\n\nYou have just emptied the noise. Now fill that space with your intention for what comes next.\n\nOne word. One clear intention.\n\nHold it.'
      }
    ]
  },

  // ─── POWER POSE RESET (5 min) ─────────────────────────────────
  'power-pose-reset': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 30,
        text: 'Your body and mind are in constant conversation. The body does not wait for the mind to feel confident before acting — the body can lead.\n\nIn two minutes, your posture will shift your psychology. Not motivational theory. Neuroscience.\n\nClose your eyes and begin.'
      },
      { id: 'breathe', duration: 180,
        text: 'Sit or stand tall. Not rigid — tall. Like a thread is pulling the crown of your head gently upward.\n\nFeel your feet connected to the ground. Both of them. Solid. Planted.\n\nBroaden your shoulders. Not forced — let them settle back and down. Create space across your chest.\n\nLet your chin be parallel to the ground. Not up in arrogance, not down in doubt. Neutral. Steady.\n\nThis is the posture of a player who belongs here. Not a player pretending to belong — a player who actually does.\n\nHold this shape for two minutes.\n\nYour nervous system is reading this and adjusting. Cortisol down. Testosterone up. That is real physiology.\n\nYou do not need to feel confident to stand like you are. Stand like you are — the feeling follows.'
      },
      { id: 'integrate', duration: 90,
        text: 'Before you move — notice what is different.\n\nSomething has shifted. Even if subtle. The body has led, and the mind has followed.\n\nKeep this posture as you walk out. It is the first statement you make before you speak a word.\n\nMake it the right one.'
      }
    ]
  },

  // ─── 10-SECOND RULE (5 min) ───────────────────────────────────
  '10-second-rule': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 20,
        text: 'The 10-second rule is simple:\n\nAfter any mistake — you are allowed 10 seconds to feel whatever you feel.\n\nThen you let it go.\n\nNot suppress. Not deny. Let it pass through you in 10 seconds, and release it.'
      },
      { id: 'breathe', duration: 200,
        text: 'Think of a mistake — from today, this week, or this season. Something that still has charge in it.\n\nFeel the emotion it brings. Don\'t run from it.\n\nNow count with me:\n\n10... you feel it.\n\n9... you acknowledge it. This is real. The emotion is valid.\n\n8... you are human. Every great player has made this exact kind of mistake.\n\n7... it is already in the past. Regardless of how recent — it is done.\n\n6... you are breathing. You are here. The game continues.\n\n5... what does this teach you? One thing. Just one.\n\n4... the lesson has been noted.\n\n3... you are done with this now. You\'ve given it its 10 seconds.\n\n2... you are choosing to be present.\n\n1... release.'
      },
      { id: 'integrate', duration: 80,
        text: 'The 10-second rule is a choice you make, over and over, until it becomes automatic.\n\nThe best players are not the ones who don\'t make mistakes. They are the ones who release them fastest.\n\nPractice this until the moment arrives. Because it will.'
      }
    ]
  },

  // ─── CELEBRATE SMALL WINS (5 min) ────────────────────────────
  'celebrate-small-wins': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 25,
        text: 'High performers often have a bias toward what went wrong — they move past the good too quickly.\n\nThis session is about correcting that. Not about ignoring mistakes. About giving genuine wins their due weight.\n\nClose your eyes. Take a breath. We are going to inventory what is actually going well.'
      },
      { id: 'breathe', duration: 200,
        text: 'Think about the last week of your cricket.\n\nWhat is one small technical thing that has improved — even slightly? Not a big breakthrough. A small movement in the right direction.\n\nAcknowledge it. This is real progress. You made it happen.\n\nNow — what is one mental skill you deployed well recently? A reset after a bad ball. A time you stayed patient when the impulse was to attack. A fielding position you took seriously even when tired.\n\nThat is mental skill. You did that.\n\nNow — what is one commitment you kept this week? An early session. A fitness session. A technical drill you did when no one was watching.\n\nNo one else will recognise it. That is exactly why it matters. You did it for yourself.\n\nThree small wins. Let them land.'
      },
      { id: 'integrate', duration: 75,
        text: 'Progress in cricket is not linear. It is accumulative.\n\nEvery small win is a deposit in a compound interest account. You don\'t see the balance growing each day — but it is.\n\nYou are further along than you think.'
      }
    ]
  },

  // ─── FOCUS LOCK-IN (5 min) ────────────────────────────────────
  'focus-lock-in': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 25,
        text: 'There is a specific mental state that elite athletes call being "in the zone" — and it is not mysterious. It has a structure.\n\nThis session trains that structure.\n\nClose your eyes. We begin.'
      },
      { id: 'breathe', duration: 195,
        text: 'The first element of focus lock-in: release external attention.\n\nStop monitoring what others are thinking. Stop tracking the scoreboard. Stop anticipating what might happen three balls from now.\n\nEverything outside this immediate moment — let it blur, like background sound you stop hearing.\n\nSecond element: narrow to the task.\n\nWhat is the specific task in front of you? Not the goal — the task. The next action. Narrowed to its smallest possible unit.\n\nFor batting: ball tracking. For bowling: seam position and target. For fielding: first step readiness.\n\nOne task. All of your attention. Right now.\n\nThird element: let the body lead.\n\nYou have trained this. Stop directing and start trusting. Your technique is there — in your muscles, your nervous system. Trust the preparation.\n\nRelease conscious control. Trust automatic processing.'
      },
      { id: 'integrate', duration: 80,
        text: 'You have just rehearsed the three elements of focus lock-in:\n\n1. Release external noise\n2. Narrow to the task\n3. Trust automatic processing\n\nThis is the zone. It is trainable. You are training it now.'
      }
    ]
  },

  // ─── 2-MINUTE WARRIOR (5 min) ─────────────────────────────────
  '2-minute-warrior': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 20,
        text: 'This session is about compression. Two minutes of pure psychological activation — then you go.\n\nNo complexity. No long breathing sequence. Just clarity and energy, delivered fast.\n\nClose your eyes.'
      },
      { id: 'breathe', duration: 210,
        text: 'One explosive breath in. Hold. Release hard.\n\nAgain. In. Hold. Release.\n\nFeel the energy.\n\nYou have trained for this moment. Every net session, every fitness session, every morning you chose to go — it all lives in your body right now.\n\nYou are ready. Not because it feels easy. Because you did the work.\n\nYou are a competitor. That means you do not need perfect conditions to perform. You perform anyway.\n\nFeel that in your chest now. The willingness to go.\n\nRemember why this matters to you. Not abstractly — the specific reason. The thing you are trying to prove. The person you are trying to become.\n\nLet it rise.\n\nOne more breath. In hard. Out hard.\n\nNow — go be ready.'
      },
      { id: 'integrate', duration: 70,
        text: 'Warriors don\'t wait to feel ready. They decide they are ready.\n\nYou just made that decision.\n\nGo.'
      }
    ]
  },

  // ─── MICRO-WIN REVIEW (5 min) ─────────────────────────────────
  'micro-win-review': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 25,
        text: 'Research in sports psychology shows that athletes who systematically review their small improvements develop faster than those who only track big outcomes.\n\nThis session is a structured micro-win review. Three minutes of honest, specific acknowledgement.\n\nClose your eyes.'
      },
      { id: 'breathe', duration: 200,
        text: 'Think about today\'s session or today\'s match.\n\nNot the result. Not what the scoreboard says. What did YOU do well, at a granular level?\n\nA footwork adjustment that worked. A length you hit consistently. A shot you took on instinctively and it came off.\n\nOr — in fielding: a communication that prevented a mix-up. A caught and bowled chance you set up correctly. A recovery sprint that showed your conditioning.\n\nOr mentally: a time you noticed doubt and redirected. A reset after something went wrong. A choice to stay process-focused when outcome-thinking crept in.\n\nList three. Not what your coach would notice — what YOU know was different today.\n\nThese are data points. They confirm: the work is working.'
      },
      { id: 'integrate', duration: 75,
        text: 'Micro-wins compound.\n\nThirty days of deliberate micro-wins is a different player.\n\nYou are accumulating something. Let yourself see it.'
      }
    ]
  },

  // ─── EMBRACING CHANGE (5 min) ─────────────────────────────────
  'embracing-change': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 25,
        text: 'Something has changed, is changing, or needs to change.\n\nMaybe it\'s your role in the team. Your technique. Your mindset. A life circumstance that is affecting your game.\n\nThis session is about choosing to move with change rather than against it.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 200,
        text: 'What is the change you\'re facing?\n\nName it honestly — not what you wish it was, but what it actually is.\n\nNow: what is the story you\'ve been telling about it?\n\nThat it is unfair? That you\'re not ready? That things were better before?\n\nEach of those stories is understandable. They might even be true. But here is the question that matters:\n\nIs the story helping you move forward?\n\nChange in cricket — in technique, in role, in circumstance — is constant. The players who survive and grow are not the ones who are immune to difficulty.\n\nThey are the ones who become skilled at responding to it.\n\nWhat if this change — however uncomfortable — is exactly what is needed to get you to the next level?\n\nWhat if you could lean into it, with curiosity instead of resistance?'
      },
      { id: 'integrate', duration: 75,
        text: 'You cannot stop change. You can only choose your relationship with it.\n\nResistance makes change harder. Openness makes it navigable.\n\nYou are not behind because things changed. You are exactly where you need to be to learn what comes next.'
      }
    ]
  },

  // ─── GRATITUDE FOR JOURNEY (5 min) ────────────────────────────
  'gratitude-for-journey': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 25,
        text: 'Gratitude is not a soft concept. Research shows it measurably increases performance, resilience, and team cohesion.\n\nThis session is about your cricket journey specifically. Not gratitude in the abstract — for the specific, improbable chain of events that led to you playing this sport.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 200,
        text: 'When did you first love cricket?\n\nSee that moment. Young. Perhaps in a back garden. A street. Watching on television and something in you lit up.\n\nThat feeling was yours. No one put it there. It emerged from somewhere genuine.\n\nWho helped you get here? A parent who drove you early. A coach who believed in something they saw. A teammate who made the game feel like home.\n\nThink of them. Feel the gratitude — not the debt, the warmth.\n\nWhat has cricket given you that is not on any scorecard? Discipline. Friendships. Identity. Purpose. The specific feeling of a delivery hit in the middle.\n\nCricket has given you real things. Real experiences. A version of yourself that only exists because of this game.\n\nLet yourself feel grateful for it. Not performatively — genuinely.'
      },
      { id: 'integrate', duration: 75,
        text: 'You are someone who plays cricket.\n\nThat is not nothing. Across the whole of human experience — this specific thing, this sport, this discipline — you chose it and it chose you.\n\nHonour that by playing with your whole self.'
      }
    ]
  },

  // ─── MORNING POSITIVITY CHARGE (4 min) ────────────────────────
  'morning-positivity-charge': {
    type: 'ACTIVATE',
    phases: [
      { id: 'settle', duration: 20,
        text: 'The first thoughts of the morning set the architecture for the day.\n\nNot by magic — because they prime your nervous system and attention system for what to look for, notice, and respond to.\n\nThis is a four-minute charge. Let\'s make today a good day on purpose.'
      },
      { id: 'activate', duration: 175,
        text: 'Start with your body. Feel it waking. Movement in your shoulders, your fingers. Alive.\n\nYou woke up today. That is the first gift.\n\nNow: one thing you are genuinely looking forward to today. Not "hoping for" — actually looking forward to. A session. A conversation. A piece of cricket you get to play.\n\nFeel it now. Let the anticipation live in your body — not just your head.\n\nOne more: who can you make things better for today? A teammate you can encourage. A younger player you can help. A coach you can show up for.\n\nYou have more impact than you think. Use some of it today.\n\nFinally: your intention. Not a goal. An intention — a quality you will bring to everything today.\n\nName it. Own it.'
      },
      { id: 'integrate', duration: 45,
        text: 'You have just consciously oriented your morning.\n\nMost people react to their day. You have chosen yours.\n\nThat is a small edge — taken daily, it becomes a large one.'
      }
    ]
  },

  // ─── WIN THE MORNING (5 min) ──────────────────────────────────
  'win-the-morning': {
    type: 'ACTIVATE',
    phases: [
      { id: 'settle', duration: 25,
        text: 'There is a well-established link between morning routine quality and high-performance outcomes.\n\nThis session is not about a perfect routine. It is about starting — deliberately.\n\nYou win the morning. The morning does not win you.'
      },
      { id: 'activate', duration: 200,
        text: 'Take stock of your body right now. Energy level, readiness.\n\nNow — choose to bring five percent more. Not one hundred percent more. Just five.\n\nFive percent more intentionality. Five percent more focus. Five percent more willingness to engage.\n\nThis is called the minimum effective dose of motivation. You don\'t always need to feel fired up. You just need to begin — and five percent is always available.\n\nNow think about what today actually requires of you. Training? A match? Recovery? Mental work?\n\nSee it clearly. Not as a burden — as an opportunity to do the thing you have chosen.\n\nYou chose this sport. You showed up for this session. That is already a form of winning.\n\nOne deep breath. Fill your lungs completely.\n\nRelease it all.\n\nYou are awake. You are here. You are ready to begin.'
      },
      { id: 'integrate', duration: 75,
        text: 'Win the morning by doing the first intentional thing.\n\nNot the easiest thing. The first right thing.\n\nGo do it.'
      }
    ]
  },

  // ─── TEAM PLAYER MINDSET (5 min) ──────────────────────────────
  'team-player-mindset': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 25,
        text: 'Cricket is a team sport.\n\nEven a brilliant individual performance means more when it is in service of something shared.\n\nThis session is about checking your team orientation — honestly. No judgment. Just clarity.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 195,
        text: 'When a teammate succeeds, what is your first honest reaction?\n\nNot the reaction you show. The first internal response.\n\nIf there is any fraction of you that resents another player\'s good performance — that is not a moral failing. It is human. But it is worth examining.\n\nBecause the teams that win are filled with players who genuinely want each other to succeed.\n\nWhat would it mean for your team if every player performed at their best? Including the ones you compete with for a spot?\n\nA team where every player rises does more for your cricket than a team where you succeed among mediocrity.\n\nNow: what is one concrete thing you can do this week to add to a teammate\'s development or confidence?\n\nNot sacrifice your own. Add to theirs.\n\nThe player who makes others better is always wanted on the team.'
      },
      { id: 'integrate', duration: 80,
        text: 'Team player mindset is not about suppressing your ambition. It is about channelling it toward something bigger than your statistics.\n\nYour legacy in cricket will be partly what you contributed to others.\n\nThat starts now.'
      }
    ]
  },

  // ─── RESET AFTER DUCK (5 min) ─────────────────────────────────
  'reset-after-duck': {
    type: 'RECOVER',
    phases: [
      { id: 'settle', duration: 25,
        text: 'You made zero.\n\nOr something close to it. A short innings, an unwanted dismissal, a contribution below what you expected of yourself.\n\nThis session is not about fixing it. It is about processing it properly, so it doesn\'t compound.\n\nClose your eyes. Let yourself actually feel what you feel right now.'
      },
      { id: 'recover', duration: 195,
        text: 'Disappointment is appropriate. Don\'t rush past it.\n\nYou care about your performance. That\'s why it hurts. The pain is information about your investment.\n\nSit with the feeling for a moment. Not to wallow — to witness it without judgment.\n\nNow — separate the facts from the story.\n\nFact: I scored zero (or low). True.\n\nStory: I am a bad player / I let everyone down / I will never succeed at this level — these are stories. They feel true. They are not evidence.\n\nEvery player you admire has a duck somewhere in their career. The ones you respect most handled it by coming back and scoring runs.\n\nThat is now your next job. Not today. Eventually.\n\nWhat did you actually do right in that innings? Even on a duck — there are often things done correctly. Decision-making, footwork, fight.\n\nName one. Even one.'
      },
      { id: 'integrate', duration: 80,
        text: 'A duck is a data point. It is not a verdict.\n\nYou are the same player you were when you walked out. Your ability did not change in that innings.\n\nYour opportunity to use it is coming. Prepare for that.'
      }
    ]
  },

  // ─── BOWLING MINDSET LOCK-IN (5 min) ──────────────────────────
  'bowling-mindset-lock-in': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 25,
        text: 'You are a bowler. In a moment, you are going to bowl.\n\nBefore you take the ball, we are going to set your mind in the exact state required for your best bowling.\n\nClose your eyes. This takes four minutes.'
      },
      { id: 'breathe', duration: 195,
        text: 'Your plan for this batsman. What are you trying to do?\n\nNot vaguely. Specifically. The line, the length, the variation you are going to use and when.\n\nYou have a plan. Trust it.\n\nNow — let your run-up live in your body. Feel it. The rhythm of it. The way your body knows the approach, the gather, the delivery position. This is stored in your procedural memory. You don\'t need to think about it.\n\nFocus only on your target. The spot on the pitch. That is all you are trying to hit.\n\nNot the batsman. Not the result. Not what your captain thinks. The spot.\n\nEvery great delivery in your career started with your attention on that spot.\n\nFeel the ball in your hand. The seam. Your grip. This is yours.\n\nYou have bowled thousands of deliveries. Your body knows what to do.\n\nLet it.'
      },
      { id: 'integrate', duration: 80,
        text: 'Plan set. Body ready. Mind clear.\n\nOne target. One delivery at a time.\n\nTake the ball.'
      }
    ]
  },

  // ─── DEEP BREATHING ANXIETY (5 min) ──────────────────────────
  'deep-breathing-anxiety': {
    type: 'BREATH',
    breathPattern: { inhale: 4, hold: 4, exhale: 6 },
    totalCycles: 7,
    phases: [
      { id: 'settle', duration: 30,
        text: 'Anxiety before cricket is not a problem to solve. It is energy to direct.\n\nBut when that anxiety becomes overwhelming — when it starts limiting rather than fuelling — the fastest intervention is breath.\n\nWe are going to breathe through it. Not away from it — through it.\n\nClose your eyes.'
      },
      { id: 'breathe', duration: 280,
        breathing: true,
        cycleText: {
          inhale: 'Breathe in... count 4...',
          hold: 'Hold... feel the pause...',
          exhale: 'Slow exhale... count 6...'
        },
        betweenCycles: [
          'Notice the anxiety in your body. Where does it live? Name the location.',
          'The anxiety is there because you care. That is its purpose.',
          'Your breath is now longer than the anxiety cycle. You are interrupting it.',
          'Each cycle, the physiological arousal reduces slightly.',
          'You are choosing your response, breath by breath.',
          'The game has not started. You are already managing it.',
          'One more cycle. The most powerful yet.'
        ]
      },
      { id: 'integrate', duration: 40,
        text: 'Notice the difference.\n\nAnxiety is not gone — you may still feel it. But you are in relationship with it differently now.\n\nYou chose the response. That is enough.'
      }
    ]
  },

  // ─── BREATHE THROUGH ANGER (6 min) ───────────────────────────
  'breathe-through-anger': {
    type: 'BREATH',
    breathPattern: { inhale: 3, hold: 1, exhale: 8 },
    totalCycles: 8,
    phases: [
      { id: 'settle', duration: 30,
        text: 'Something happened that made you angry.\n\nA decision. A ball you felt was unfair. A dismissal you cannot accept yet. A boundary you gave away.\n\nAnger is valid. It says: this mattered to me. But unmanaged anger damages performance — the research on this is unambiguous.\n\nSo we breathe. Not to make the anger wrong. To metabolise it into fuel.\n\nClose your eyes.'
      },
      { id: 'breathe', duration: 320,
        breathing: true,
        cycleText: {
          inhale: 'Short in...',
          hold: 'Brief pause.',
          exhale: 'Long, controlled release...'
        },
        betweenCycles: [
          'The long exhale activates the vagus nerve. This is chemistry — not willpower.',
          'You are choosing your response. That is strength, not surrender.',
          'The thing that made you angry is past. It is done.',
          'Your energy is too valuable to spend on what you cannot change.',
          'What CAN you affect from here? Focus there.',
          'The anger is metabolising. Feel it shifting — from heat to drive.',
          'From reaction to response.',
          'From disruption to fuel.'
        ]
      },
      { id: 'integrate', duration: 40,
        text: 'You have metabolised the anger.\n\nNow it is drive. Controlled, directed competitive energy.\n\nUse it. Not against the game — for your cricket.'
      }
    ]
  },

  // ─── WORRY DRAWER (5 min) ─────────────────────────────────────
  'worry-drawer': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 25,
        text: 'Your mind is holding worries. About selection. About form. About what others think. About whether you\'re improving fast enough.\n\nThese worries consume processing power. They make your mind heavier than it needs to be.\n\nThis session gives those worries somewhere to go.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 200,
        text: 'Imagine a drawer. Solid, reliable. In a desk somewhere safe.\n\nThis drawer is for worries you cannot resolve right now.\n\nOpen it.\n\nNow — take your first worry. See it clearly. Name it.\n\nPut it in the drawer.\n\nSecond worry. Name it. In the drawer.\n\nThird. In it goes.\n\nAny others that arise — name them, place them.\n\nThese worries are not being deleted. They exist. They may even be legitimate. But right now, in this moment, they are not yours to solve.\n\nThe drawer is where they wait — without consuming your attention — until you have the time, information, or resources to address them properly.\n\nClose the drawer.\n\nNotice your mind. How much lighter is it now?'
      },
      { id: 'integrate', duration: 75,
        text: 'The worry drawer technique is used by high-performers across elite sport.\n\nYou can open the drawer again — with intention — when the time is right.\n\nRight now, the drawer is closed. And your attention is free.'
      }
    ]
  },

  // ─── RUNNING BETWEEN WICKETS (5 min) ─────────────────────────
  'running-between-wickets': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 25,
        text: 'Running between wickets is the intersection of fitness, communication, confidence, and decision-making.\n\nThis session is about sharpening the mental elements: decision speed, communication clarity, and trust.\n\nClose your eyes.'
      },
      { id: 'breathe', duration: 195,
        text: 'See yourself at the crease. Your partner is at the other end.\n\nA ball is played into the leg side. Your read needs to happen instantly.\n\nIn your mind: Call. Early. Loud. Decisive.\n\n"YES." No hesitation. Your partner hears confidence and goes.\n\nNow practice a "NO." The ball is played firmly to deep square leg. The fielder is fast.\n\n"NO — WAIT." Firm. Your partner stops. No mix-up.\n\nNow the hard one: you called "yes," your partner committed — and mid-pitch you see it\'s not on.\n\nYou call "WAIT." Then "NO." You sacrifice yourself — you take the run-out. Your partner survives.\n\nThis is the highest act of batting partnership. The willingness to put yourself at risk to protect your partner.\n\nSee yourself doing it. Not reluctantly — decisively.\n\nThat confidence in the partnership changes how both of you play.'
      },
      { id: 'integrate', duration: 80,
        text: 'Excellent running between wickets is not just about fitness or speed.\n\nIt is communication and trust, rehearsed until it is automatic.\n\nYou have just rehearsed it.'
      }
    ]
  },

  // ─── MENTAL RECOVERY SPRINT (5 min) ──────────────────────────
  'mental-recovery-sprint': {
    type: 'ACTIVATE',
    phases: [
      { id: 'settle', duration: 20,
        text: 'Something went wrong. It may have been two minutes ago or two overs ago.\n\nThis session is a sprint — not a long recovery. Fast processing, fast return to performance state.\n\nTwo breaths. Go.'
      },
      { id: 'activate', duration: 180,
        text: 'Name what happened. One sentence.\n\nFact only — no story attached.\n\nNow: is there anything I can do about that right now?\n\nIf yes: do it.\nIf no: release it.\n\nThat is the entire decision tree.\n\nNow we rebuild. Take a breath — a real one, all the way in.\n\nFeel your feet. Both of them, on the ground. You are still in the game.\n\nWhat is the next specific action that is required of you?\n\nNot the next over. Not the next session. The very next action.\n\nSee it. Own it.\n\nYou are a player with resources. This setback is one data point among hundreds in your career.\n\nYou have responded to adversity before and you are going to respond to it now.\n\nGet back in the game.'
      },
      { id: 'integrate', duration: 100,
        text: 'Recovery is a mental skill. You just used it.\n\nEvery time you recover well from adversity, you build the habit of recovery.\n\nYou are now the player who comes back. Go prove it.'
      }
    ]
  },

  // ─── DEALING WITH CRITICISM (6 min) ──────────────────────────
  'dealing-with-criticism': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'Criticism is unavoidable in competitive sport.\n\nFrom coaches, selectors, teammates, supporters, or yourself.\n\nThe skill is not in becoming immune to it. It is in developing a wise, productive relationship with it.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 240,
        text: 'Think of a piece of criticism you have received recently — or one that is sitting with you.\n\nFirst question: is it true?\n\nNot emotionally true — factually true. Set aside how it was delivered and who said it.\n\nIs the criticism pointing at something real?\n\nIf yes: this is information. Uncomfortable, but valuable. What is the one thing this criticism is telling you to improve?\n\nIf partially true: take the true part and work with it. Leave the rest.\n\nIf false: you must also develop the skill of releasing criticism that is not founded in reality. Not defensively — with discernment. Not all criticism deserves integration.\n\nNow: how it was delivered. Was it constructive or destructive? Kindly or harshly?\n\nYou are allowed to feel hurt by how something was said — even if the content was valid.\n\nAnd: can you separate the delivery from the content? The message from the messenger?\n\nThe most useful skill in handling criticism is extracting the data and releasing the emotion around it.'
      },
      { id: 'integrate', duration: 60,
        text: 'A player who can receive criticism — take what is useful, release what is not, and continue performing — is a player others want to coach.\n\nYou are developing that capacity.\n\nThat is a professional attribute.'
      }
    ]
  },

  // ─── DEALING NERVES BATTING (6 min) ──────────────────────────
  'dealing-nerves-batting': {
    type: 'BREATH',
    breathPattern: { inhale: 4, hold: 2, exhale: 7 },
    totalCycles: 7,
    phases: [
      { id: 'settle', duration: 35,
        text: 'You\'re about to go in to bat.\n\nThe nerves are real. The butterflies. The quickened heartbeat. Maybe the slightly shaky hands.\n\nThis is not a malfunction. This is your body preparing to perform.\n\nThe difference between nervous and ready is one breath.\n\nLet\'s take it.'
      },
      { id: 'breathe', duration: 285,
        breathing: true,
        cycleText: {
          inhale: 'In through the nose... 4 counts...',
          hold: 'Brief hold...',
          exhale: 'Long, slow out... let it go...'
        },
        betweenCycles: [
          'The butterflies are organizing themselves into formation.',
          'Your body is loaded with energy. You just need to direct it.',
          'Every batter who ever scored a century felt this exact feeling walking to the crease.',
          'The nerves say: this matters. Let them say it.',
          'Your technique is there. Your preparation is done.',
          'You do not need to feel calm. You need to be ready.',
          'You are ready.'
        ]
      },
      { id: 'integrate', duration: 40,
        text: 'Put your helmet on. Grip the bat.\n\nOne thing you are trying to do in the first three balls.\n\nWalk out there and do that one thing.\n\nEverything else follows from the first right decision.'
      }
    ]
  },

  // ─── ACCOUNTABILITY MIRROR (6 min) ────────────────────────────
  'accountability-mirror': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'This session requires the most honesty of any practice.\n\nNo external pressure. No audience. No judgment from anyone but yourself.\n\nThe accountability mirror is exactly what it sounds like: you look clearly at yourself.\n\nClose your eyes. Take a breath. Enter.'
      },
      { id: 'reflect', duration: 250,
        text: 'Where are you NOT living up to your own standards?\n\nNot general standards — your standards. The ones you have privately set for how you want to train, prepare, and perform.\n\nPick one area. Be specific.\n\nIs it training attendance? Are you showing up but not fully present? Is there a technical area you\'re avoiding because it\'s uncomfortable?\n\nOr mental: are you processing your mistakes properly or carrying them? Are you genuinely committed to your process or is part of you waiting to be more committed when conditions are better?\n\nState it plainly. To yourself. Without self-pity or self-attack — just clarity.\n\n"I am not yet living up to my own standard in [specific area]."\n\nNow: one specific commitment you are going to make.\n\nNot a vague intention. A specific, time-bound, actionable commitment.\n\n"In the next [time period], I will [specific action]."\n\nState it again. Feel the weight of it. This is a promise to yourself.'
      },
      { id: 'integrate', duration: 60,
        text: 'The accountability mirror does not shame. It clarifies.\n\nYou have just seen something clearly. That clarity is the beginning of change.\n\nHold your commitment. Tell someone if it helps.\n\nThen go do it.'
      }
    ]
  },

  // ─── COLD PRESSURE SIMULATION (6 min) ─────────────────────────
  'cold-pressure-simulation': {
    type: 'PRESSURE',
    phases: [
      { id: 'settle', duration: 35,
        text: 'Cold pressure simulation: performing well the very first time in a new high-pressure environment.\n\nYou have never been to this ground before. Or this team selection. Or this level.\n\nEvery elite player remembers their first time at a new level — the disorientation. The slight overwhelm.\n\nThis session inoculates you against it. We go there now, in the safety of your mind.'
      },
      { id: 'pressure', duration: 250,
        text: 'You are in an unfamiliar dressing room. Different people. Different energy. The ground is larger. The crowd is different.\n\nYour usual pre-match routine is slightly disrupted. The pitch looks different.\n\nFeel the unfamiliarity. Don\'t push it away.\n\nNow find what is the same:\n\nYour hands. Your bat grip. The ball. The crease. Your run-up length.\n\nThese things do not change with the ground or the level.\n\nYour technique does not care what county it\'s playing in. Your bowling action does not know the difference between a regional ground and an international stadium.\n\nOnly your mind assigns those meanings.\n\nNow perform. In this unfamiliar place — perform the way you always perform.\n\nOne delivery, one ball, one task. Identical to the one you do in training.\n\nSame mechanics. Same focus. New environment, same player.\n\nThis is cold pressure. And you handled it.'
      },
      { id: 'integrate', duration: 70,
        text: 'You have now been to this scenario in your mind.\n\nWhen it arrives for real, it will feel familiar.\n\nNew environment. Same performer. Same process.\n\nThat is all you need.'
      }
    ]
  },

  // ─── CALM COMPETITOR (6 min) ──────────────────────────────────
  'calm-competitor': {
    type: 'GROUND',
    phases: [
      { id: 'settle', duration: 30,
        text: 'The calm competitor is not a relaxed competitor. They are an intensely focused one.\n\nCalm in sport means: internally regulated. Not outwardly affected by the chaos of competition.\n\nThis session trains that internal regulation.\n\nClose your eyes.'
      },
      { id: 'breathe', duration: 240,
        text: 'Imagine the most intense match situation you regularly face.\n\nThe pressure. The opposition. The expectations.\n\nNow — inside that environment, find the still point.\n\nNot by suppressing the intensity. By becoming the eye of the storm.\n\nThe eye of a storm is calm because it is centred. Everything revolves around it — the chaos is real — but inside the centre, there is stillness.\n\nYou are the eye.\n\nThe match is the storm. The crowd, the scoreboard, the opposition, the expectations — all storm.\n\nYou are calm inside it. Not unaffected — centred.\n\nFrom that centre, your decisions are clear. Your technique is accessible. Your awareness is wide.\n\nPractice this now. Storm around you. Still inside.'
      },
      { id: 'integrate', duration: 90,
        text: 'Calm is not passive.\n\nThe calm competitor is the most dangerous one in the game — because they make no decisions from panic, no shots from fear, no deliveries from anger.\n\nOnly clear decisions. Deliberate action.\n\nThat is your competitive edge.'
      }
    ]
  },

  // ─── MOTIVATION WITHOUT MOOD (6 min) ─────────────────────────
  'motivation-without-mood': {
    type: 'ACTIVATE',
    phases: [
      { id: 'settle', duration: 30,
        text: 'You don\'t feel like it today.\n\nMaybe you\'re tired. Maybe things haven\'t been going your way. Maybe the enthusiasm just isn\'t there.\n\nThis session is about performing without relying on feeling motivated.\n\nProfessionals do not wait for motivation. They have learned to act without it.\n\nClose your eyes.'
      },
      { id: 'activate', duration: 240,
        text: 'Motivation is an emotional state. Like all emotional states, it comes and goes.\n\nAmateurs need to feel motivated to perform. Professionals perform regardless — and sometimes the motivation arrives AFTER they begin, not before.\n\nThis is the secret: action precedes feeling.\n\nYou do not feel motivated, so you start anyway. And once you start, something shifts.\n\nThink of the last time this happened for you — you started a session reluctantly, and somewhere in it, something clicked. The body woke up. The purpose returned.\n\nThat is not an accident. That is the architecture of professional performance.\n\nSo today: you do not need to feel it to begin.\n\nYou only need to begin.\n\nWhat is the very first physical action of today\'s session?\n\nSee yourself doing just that one thing. Just that one thing.\n\nYou can do one thing.'
      },
      { id: 'integrate', duration: 90,
        text: 'You showed up without motivation and you are going to begin anyway.\n\nThat is a professional act.\n\nThe commitment is to the process, not to the feeling.\n\nToday, the process is enough.\n\nBegin.'
      }
    ]
  },

  // ─── 1% BETTER MINDSET (6 min) ────────────────────────────────
  '1%-better-mindset': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'James Clear, author of Atomic Habits, showed that 1% improvements compounded daily result in being 37 times better in a year.\n\nThis session is not about grand leaps. It\'s about the philosophy of the marginal gain — and what it means for your cricket.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 240,
        text: 'Where is one area of your cricket where a 1% improvement would compound the most over the next three months?\n\nNot the area you\'re worst at. The area where a small, consistent improvement would have the biggest downstream effect.\n\nFor some players: leave the ball outside off stump more consistently — scores improve immediately.\nFor some: improve the first movement in the crease — their defensive game unlocks their attacking game.\nFor bowlers: tighten one length by three inches — becomes much harder to hit.\n\nWhat is YOUR 1%?\n\nName it as specifically as possible.\n\nNow: what is the smallest daily practice that would create this improvement?\n\nNot a big overhaul. One small deliberate repetition, every session.\n\nFive balls at that specific target. Twenty throw-downs with that exact footwork trigger. One technical focus in every net session.\n\nSmall. Consistent. Compounding.'
      },
      { id: 'integrate', duration: 90,
        text: 'You now have a 1% focus.\n\nThis is not about being impatient for results. Results are a function of the process.\n\nYour job: maintain the process. Trust the compound.\n\nThirty days from now, that 1% will be visible.\n\nNinety days from now, it will change your game.'
      }
    ]
  },

  // ─── POSITIVE PRESSURE PARTNERSHIP (6 min) ────────────────────
  'positive-pressure-partnership': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'Cricket is often described as an individual game played within a team.\n\nBut at its best, the relationship between two batters at the crease creates something neither could generate alone — a partnership that multiplies pressure on the opposition and halves the pressure on each individual.\n\nThis session is about building that partnership psychology.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 240,
        text: 'Think of the best batting partnership you have been part of.\n\nWhat made it work? Not just the runs — the feeling of it.\n\nWas it the communication? The way you supported each other between overs? The way one steadied when the other was unsettled?\n\nThere is a specific trust that forms in a good partnership. Not blind trust — active trust. Both players holding their individual responsibility while also holding each other.\n\nNow think of a partner you are going to bat with regularly. Or a bowling partnership.\n\nWhat is your specific contribution to making that partnership effective?\n\nNot what they contribute. What you contribute.\n\nCommunication style. Calming presence. Aggression trigger. Experience-sharing.\n\nName your role. Own your role. Then fulfill it.'
      },
      { id: 'integrate', duration: 90,
        text: 'The best partnerships in cricket are not accidents.\n\nThey are built through deliberate communication, shared intent, and each player knowing their role.\n\nYou have just gotten clearer on yours.'
      }
    ]
  },

  // ─── EMBRACE THE ARENA (7 min) ────────────────────────────────
  'embrace-the-arena': {
    type: 'ACTIVATE',
    phases: [
      { id: 'settle', duration: 35,
        text: 'Theodore Roosevelt wrote: "It is not the critic who counts... The credit belongs to the man who is actually in the arena."\n\nYou are in the arena.\n\nYou have chosen to compete. To put your ability on the line. To be seen.\n\nThis session is about fully claiming that — not with bravado, but with genuine ownership.\n\nClose your eyes.'
      },
      { id: 'activate', duration: 280,
        text: 'Feel the weight of what you\'ve chosen.\n\nCricket is not easy. It was not designed to be easy. You fail far more than you succeed on any individual measure — most batters are dismissed more than they score centuries. Most bowlers concede more runs than they take wickets.\n\nAnd yet you come back.\n\nThat is the arena. That is the choice.\n\nNow feel the privilege of it. The fact that you are healthy enough to compete. That you are part of a team. That somewhere, someone worked to give you this opportunity.\n\nThe arena is not a place of punishment. It is a place of revelation — where you find out who you are under pressure.\n\nYou have chosen to know. That is courage.\n\nFeel it now.\n\nNot the wins. Not the statistics.\n\nThe courage to show up and compete when the outcome is uncertain.\n\nThat is the arena. You are in it. And you belong here.'
      },
      { id: 'integrate', duration: 105,
        text: 'The critic watches from the stands.\n\nYou are on the field.\n\nWhen the ball arrives — you are the one who responds.\n\nThat is everything.\n\nEmbrace it.'
      }
    ]
  },

  // ─── INNER LAKE (9 min) ───────────────────────────────────────
  'inner-lake': {
    type: 'RECOVER',
    phases: [
      { id: 'settle', duration: 40,
        text: 'This is an extended stillness practice.\n\nThe inner lake is a metaphor from meditation: your mind, at its deepest level, is like a still mountain lake. The surface may be disturbed by wind and weather — thoughts, emotions, external events.\n\nBut beneath the surface, the water is always still.\n\nThis session helps you access that stillness.\n\nClose your eyes. Take three long breaths.'
      },
      { id: 'recover', duration: 390,
        text: 'Imagine a mountain lake. Early morning. The air is cold and clear.\n\nThe surface of the lake reflects the sky perfectly — because it is perfectly still.\n\nYou are standing at the water\'s edge. Looking at the reflection.\n\nNow — a thought arrives. In the image, it appears as a small stone dropped into the lake.\n\nRipples spread across the surface. The reflection disturbs.\n\nNotice: the stone is gone. The ripples are already fading.\n\nThe lake beneath — unchanged.\n\nAnother thought. Another stone. More ripples.\n\nAnd again: they pass. The lake receives them and returns to stillness.\n\nYou cannot stop thoughts from arriving, any more than you can stop wind from touching the water.\n\nBut you are not the thoughts. You are the lake.\n\nSit with the lake now. Feel its depth below the surface activity. The stillness that is always there — underneath.\n\nThis stillness is available to you always. Not only in meditation. In the middle of a match. Between deliveries. At the crease.\n\nThe surface may ripple. The depth is always still.\n\nYou are the lake.'
      },
      { id: 'integrate', duration: 100,
        text: 'Come back slowly.\n\nFeel the steadiness that is available underneath the activity of your mind.\n\nYou will carry that steadiness with you — not always on the surface, but always beneath it.\n\nWhenever you need it, go to the lake.'
      }
    ]
  },

  // ─── FULL BODY RELAXATION (10 min) ────────────────────────────
  'full-body-relaxation': {
    type: 'RECOVER',
    phases: [
      { id: 'settle', duration: 40,
        text: 'This is progressive muscle relaxation — one of the most research-validated recovery tools in sports psychology.\n\nYou\'re going to systematically tense and release each major muscle group. The contrast between tension and release produces a depth of relaxation that passive rest cannot reach.\n\nLie down if possible. Close your eyes. Begin.'
      },
      { id: 'recover', duration: 430,
        text: 'Feet and toes: curl them tightly. Hold for five seconds. Release completely. Feel the warmth of the release.\n\nCalves: flex them hard. Hold five seconds. Let them go. Notice the difference.\n\nThighs: squeeze them. Five seconds. Release.\n\nGlutes and lower back: tighten. Hold. Let go completely.\n\nStomach: pull it in and hold. Five seconds. Release. Let it soften.\n\nChest: take a deep breath and hold it while you tense your chest. Release both together.\n\nShoulders: pull them up to your ears. Hold. Drop them. Feel them fall farther than you expected.\n\nArms and hands: make a fist, flex your entire arm. Five seconds. Release. Let the arms fall heavy.\n\nNeck: gently press the back of your head into the surface behind you. Hold. Release.\n\nFace: scrunch your face — brow, eyes, jaw, everything. Hold. Release completely. Jaw unclenched, brow smooth, eyes soft.\n\nYour entire body is now released.\n\nNotice the heaviness. The warmth. The depth of relaxation in every muscle you just worked.\n\nThis is what full recovery feels like.'
      },
      { id: 'integrate', duration: 130,
        text: 'Remain here for as long as you choose.\n\nYour muscles have released deeply. Your nervous system has shifted into parasympathetic mode.\n\nYour body is now genuinely recovering — not just resting.\n\nThis is preparation for tomorrow\'s performance.'
      }
    ]
  },

  // ─── PROCESS FILM (9 min) ─────────────────────────────────────
  'process-film': {
    type: 'VISUALIZE',
    phases: [
      { id: 'settle', duration: 40,
        text: 'Elite teams use film review not just to analyse mistakes — but to reinforce excellent process.\n\nThis session is a mental version of process film: reviewing what you did WELL in recent performances, to strengthen those neural pathways.\n\nClose your eyes. You are about to watch your own process film — your highlights reel.'
      },
      { id: 'visualize', duration: 390,
        text: 'The film starts. You are watching yourself.\n\nSee a moment when your decision-making under pressure was correct. Not the result — the decision.\n\nA ball played with the correct shot selection. A delivery bowled to plan. A moment you chose patience when aggression would have been easier.\n\nWatch yourself make that decision. Frame by frame.\n\nNow a moment of resilience. Something went wrong — and you responded well. Reset, refocused, continued.\n\nWatch it. See the mental process in it.\n\nNow a moment of excellence. Pure skill. The ball hit cleanly in the middle. The delivery that pitched exactly where intended. The catch taken with full commitment.\n\nFeel it in your body now as you watch it.\n\nYour brain reinforces what it repeatedly experiences — whether real or vividly imagined.\n\nBy watching this process film, you are telling your nervous system: this is how I perform. This is my standard.\n\nRun it again. Two more times.\n\nThree good decisions. Three resilient responses. Three moments of excellence.\n\nYours.'
      },
      { id: 'integrate', duration: 100,
        text: 'That is your process film.\n\nYou have just watched evidence of your own capability. Not theory — memory.\n\nThe next time doubt arrives, return to this film.\n\nThe footage is real. The capability is real.\n\nYou have it.'
      }
    ]
  },

  // ─── PATIENCE — LONG-GAME THINKING (8 min) ───────────────────
  'patience-long-game-thinking': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 35,
        text: 'Impatience is one of the most common performance limiters in cricket.\n\nThe impulse to force results before conditions are right. The inability to wait for the loose ball.\n\nThis session is about developing patience as a deliberate mental skill — not passive waiting, but active patience.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 320,
        text: 'Think of the most patient performance you have ever seen in cricket.\n\nA batter who occupied the crease for six hours. A bowler who maintained line and length for thirty overs without a wicket and then struck in the thirty-first.\n\nWhat did that patience look like from the outside?\n\nSteady. Unrattled. Committed to the process even when it wasn\'t working yet.\n\nNow think about what it felt like from the INSIDE.\n\nNot relaxed necessarily. Focused. In each delivery, seeing only that delivery. Not the four hours left to bat — just this ball.\n\nThat is active patience: intense attention to the present moment, with no attachment to a timeline.\n\nWhere in your cricket do you most need patience?\n\nIn your batting: waiting for the bad ball. In your bowling: trusting your plan across long spells.\n\nWhat specifically tests your patience most?\n\nName it. Now practise what the patient response looks like.\n\nSee yourself patient in that exact situation. Not passive — actively patient. Engaged, ready, waiting.\n\nThe ball will come. Your job is to be ready when it does.'
      },
      { id: 'integrate', duration: 85,
        text: 'The long game is won by players who outlast their opponents\' patience.\n\nNot always by being more talented.\n\nBy being more willing to wait.\n\nThat is a trainable quality. You are training it now.'
      }
    ]
  },

  // ─── DECISION MAKER (8 min) ───────────────────────────────────
  'decision-maker': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 35,
        text: 'Cricket is a sequence of micro-decisions, made rapidly, under pressure, with incomplete information.\n\nEvery delivery is a decision problem. Play or leave. Attack or defend. Bowl full or short. Take the catch on the dive or protect the certain single.\n\nThis session trains your decision-making process — not the individual decisions, but the architecture of how you decide.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 320,
        text: 'Think of a decision you made in cricket recently that you are unsatisfied with.\n\nNot a decision that had a bad outcome — necessarily. A decision where the process was off.\n\nMaybe you decided too slowly. Or too quickly. Or based on emotion rather than read. Or you were distracted at the moment of decision.\n\nWalk back through the decision. What information did you have?\n\nWhat was the correct framework for that information?\n\nWhat did you do instead?\n\nThis is not self-punishment — this is decision audit. Elite sports teams do this professionally.\n\nNow think about your decision framework in general.\n\nHow do you make decisions under pressure? Instinct? Rules? Read-react?\n\nThe best decisions in cricket often combine pattern recognition (instinct) with a pre-set framework (if it\'s full, drive; if it\'s short, pull) with real-time information processing.\n\nWhich element is weakest for you right now?\n\nInstinct? Framework? Information processing?\n\nName it. That is your development area.'
      },
      { id: 'integrate', duration: 85,
        text: 'Good decision-making is a skill — not a personality trait.\n\nIt can be developed through deliberate review and deliberate practice.\n\nYou just did a review. Now go do the practice.'
      }
    ]
  },

  // ─── ABUNDANCE MINDSET SHIFT (7 min) ─────────────────────────
  'abundance-mindset-shift': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'Scarcity thinking says: there is only so much success available, and someone else\'s success diminishes mine.\n\nAbundance thinking says: success is not a limited resource. Someone else\'s excellence inspires and raises the level of the whole.\n\nThis session shifts your mental framework from scarcity to abundance.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 270,
        text: 'Where in your cricket life are you operating from scarcity?\n\nResenting a teammate\'s selection? Feeling threatened by a younger player\'s emergence? Comparing your statistics to others\' with an undercurrent of anxiety?\n\nBe honest. Scarcity thinking is almost universal. It is not a character flaw — it is a default cognitive pattern that needs deliberate correction.\n\nNow: what would abundance look like in that same area?\n\nYour teammate\'s selection means the team is strong — which means your cricket environment is higher quality. Your competition in that position makes you better.\n\nThe younger player coming through: what can you learn from them? What can you offer them?\n\nAbundance is not naivety. You are still competing for selection. But you are competing from a place of wholeness rather than fear.\n\nFrom abundance, your best cricket emerges.\nFrom scarcity, your game contracts.\n\nWhich would you rather compete from?'
      },
      { id: 'integrate', duration: 120,
        text: 'Abundance is a practice, not a personality type.\n\nYou choose it, over and over, in small moments.\n\nWhen you feel the pull toward comparison — choose abundance.\n\nThe game will feel different. And you will play differently within it.'
      }
    ]
  },

  // ─── EMOTIONAL INTELLIGENCE CHECK-IN (7 min) ─────────────────
  'emotional-intelligence-check-in': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'Emotional intelligence in cricket means: knowing what you are feeling, why you are feeling it, and how to manage it productively.\n\nThis is a check-in. Five minutes of honest self-examination.\n\nClose your eyes. What is the dominant emotional tone right now?'
      },
      { id: 'reflect', duration: 270,
        text: 'Name the emotion you are feeling most strongly right now.\n\nNot thinking — feeling. There is a difference.\n\nAnxious. Flat. Confident. Frustrated. Excited. Resentful. Hopeful. Tired.\n\nJust one word.\n\nNow: where is this emotion coming from?\n\nA recent performance? A conversation? Physical tiredness? Something outside cricket entirely?\n\nEmotions carry information — even unpleasant ones. This emotion is telling you something.\n\nWhat is it telling you?\n\nAnd: is this emotion helping your performance right now, or limiting it?\n\nIf helping: how do you amplify it and maintain it?\n\nIf limiting: what is one thing you can do right now to shift the emotional state? A breath. A physical action. A change of environment. A conversation.\n\nYou do not need to wait for the emotion to change before you perform. But you benefit from knowing what it is and making a choice about it.\n\nThat is emotional intelligence.'
      },
      { id: 'integrate', duration: 120,
        text: 'You have just checked in. You know what you\'re feeling and where it\'s coming from.\n\nThat awareness is the foundation.\n\nNow: what do you choose to do with it?'
      }
    ]
  },

  // ─── COMPARISON DETOX (9 min) ─────────────────────────────────
  'comparison-detox': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 40,
        text: 'Comparison is the thief of joy — but in sport, it is also a thief of focus.\n\nWhen your attention is on what others are doing, it is absent from what YOU are doing.\n\nThis session is a detox from the comparison habit. Nine minutes to redirect your attention where it actually produces results.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 380,
        text: 'Who do you compare yourself to most frequently?\n\nBe honest. A specific teammate. A player at the same age. Someone at the next level.\n\nNotice what the comparison brings. Motivation sometimes. But also: inadequacy? Anxiety? The feeling of falling behind?\n\nHere is the problem with comparison as a primary motivational tool:\n\nIt is based on incomplete information. You see their results. You don\'t see their doubts, their bad days, their behind-the-scenes struggles.\n\nYou are comparing your insides to their outsides.\n\nThe comparison is structurally unfair — and therefore useless as a guide.\n\nNow: what is your OWN standard?\n\nNot relative to someone else. Absolute. What does YOUR best cricket look like?\n\nNot "better than X." What specific quality of performance are you building toward?\n\nStay there. That is the only comparison that produces growth: you versus your own best.\n\nYou versus who you were last month.\n\nYou versus what you are capable of.\n\nEverything else is noise.'
      },
      { id: 'integrate', duration: 100,
        text: 'Your only real competition is with the previous version of yourself.\n\nAm I better than I was? Am I using my capability fully?\n\nThose are the only questions that matter for development.\n\nEverybody else\'s journey is not yours.\n\nFocus on yours.'
      }
    ]
  },

  // ─── REDISCOVERING YOUR WHY (7 min) ──────────────────────────
  'rediscovering-your-why': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 30,
        text: 'When the motivation fades, the why remains.\n\nOr it should.\n\nThis session digs back to the root of why you play cricket — past the trophies, past the selection pressure, to the thing underneath all of it.\n\nClose your eyes.'
      },
      { id: 'reflect', duration: 280,
        text: 'How old were you when you first fell in love with cricket?\n\nSee that version of you. What were you doing?\n\nMaybe it was watching on television and feeling electricity at a particular moment. Maybe it was holding a bat for the first time and something just felt right. Maybe it was a specific person who made you love the game.\n\nThat original feeling: what was it? Before the pressure. Before the expectation. Before the selection. Before the cricket hierarchy.\n\nJust the pure thing.\n\nWhat was the feeling?\n\nNow: is that feeling still accessible? When was the last time you felt it — even briefly?\n\nIn a net session when the ball flew off the middle. A catch you took that you\'re still proud of. A delivery that landed exactly where you planned.\n\nThat feeling is the reason.\n\nNot the result. Not the statistics. Not the reputation.\n\nThe feeling of playing cricket well. Of competing. Of the craft of it.\n\nLet yourself feel it now. Let it rise.\n\nThat is why you play.'
      },
      { id: 'integrate', duration: 110,
        text: 'Your why does not care about your average. It cares about your engagement.\n\nGo back to the game — not to prove something, not to achieve something. To do the thing that first made you feel alive in it.\n\nThe results will follow from that place.\n\nThey always do.'
      }
    ]
  },

  // ─── THOUGHT LABELING PRACTICE (8 min) ───────────────────────
  'thought-labeling-practice': {
    type: 'REFLECT',
    phases: [
      { id: 'settle', duration: 35,
        text: 'Thought labeling is a technique from Acceptance and Commitment Therapy (ACT) used extensively in elite sport psychology.\n\nThe principle: you cannot stop thoughts from arising, but you can change your relationship with them by labeling them.\n\nA labeled thought loses some of its power.\n\nClose your eyes. We practice.'
      },
      { id: 'reflect', duration: 320,
        text: 'Let your mind settle and notice whatever thoughts arise naturally.\n\nWhen a thought comes, label it — gently, without judgment.\n\nA thought about the upcoming match: "Prediction."\n\nA thought about a past mistake: "Memory."\n\nA thought about what your coach will say: "Opinion."\n\nA thought about whether you\'ll be selected: "Planning."\n\nA worry: "Worry."\n\nA criticism of yourself: "Judgment."\n\nJust label. Don\'t engage, don\'t argue, don\'t follow the thought.\n\nLabel and return to neutral.\n\nYou are practicing the skill of noticing thoughts AS thoughts — not as facts, not as commands.\n\n"I might get dropped" is a prediction. Not a fact. Label it "Prediction" and return.\n\n"I\'m not good enough" is a judgment. Not a fact. Label it "Judgment" and return.\n\nPractice this for the remainder of the session.'
      },
      { id: 'integrate', duration: 85,
        text: 'You have practiced watching your mind rather than being governed by it.\n\nThat is the beginning of psychological flexibility — the foundation of performance under pressure.\n\nAt the crease: when a negative thought arrives, label it. One word.\n\nThen return to the ball.'
      }
    ]
  },

  // ─── SENSORY PERFORMANCE BLUEPRINT (10 min) ──────────────────
  'sensory-performance-blueprint': {
    type: 'VISUALIZE',
    phases: [
      { id: 'settle', duration: 45,
        text: 'The sensory performance blueprint is the most detailed form of mental rehearsal.\n\nWhere standard visualization uses sight, the blueprint adds ALL five senses.\n\nThe research shows multi-sensory imagery activates performance pathways more completely than visual-only rehearsal.\n\nClose your eyes. We are going to build your complete performance blueprint.'
      },
      { id: 'visualize', duration: 430,
        text: 'Begin with sight. See the ground. The specific pitch you are playing on. The fielding positions. The sky. The colours.\n\nNow add sound. The crowd — how many people, what energy? The opposition\'s communication. Your own breathing. The sound of the ball when it is hit well.\n\nNow touch. Feel the grip of the bat or the ball. The texture of your gloves. The surface of the pitch underfoot. The temperature of the air on your skin. The weight of your pads.\n\nNow smell. Every ground has a smell — grass, leather, dust, crowd. Let it arrive.\n\nNow taste. The last thing you drank. The dry mouth of nerves or the clean mouth of readiness.\n\nYou are fully in the environment now.\n\nPerform. In full sensory detail.\n\nSee, hear, feel, smell, taste your own excellent performance.\n\nA delivery bowled exactly as intended — what does it feel like through your body?\n\nA shot struck perfectly — what is the sound, the feel, the sight of it?\n\nA catch taken cleanly — all your senses receiving that moment.\n\nThis is your performance blueprint. It lives in your nervous system now.'
      },
      { id: 'integrate', duration: 125,
        text: 'Your nervous system has just run a complete performance rehearsal — in full sensory detail.\n\nThe next time you step onto the field, some elements of it will feel familiar. Because your brain has been there before.\n\nThat is the power of the sensory blueprint.\n\nYou are more ready than you know.'
      }
    ]
  },

  // ─── NEW IDENTITY VISUALISATION (10 min) ─────────────────────
  'new-identity-visualisation': {
    type: 'VISUALIZE',
    phases: [
      { id: 'settle', duration: 45,
        text: 'Identity precedes behaviour.\n\nYou don\'t become a great player and then develop great habits. You adopt the identity of a great player and the habits follow.\n\nThis session builds a new identity. One that is available to you now — not after you achieve a certain result.\n\nClose your eyes. Take three deep breaths. Step into it.'
      },
      { id: 'visualize', duration: 430,
        text: 'Who is the cricketer you are becoming?\n\nNot who you are on your current best day. The player you are building toward — the one who exists one or two levels above where you are now.\n\nSee them.\n\nHow do they hold themselves? Not arrogance — authority. The authority of someone who has earned their place through work.\n\nHow do they prepare? See their warm-up. Their net sessions. Their conversations with coaches.\n\nHow do they handle adversity? A bad ball, a dropped catch, a period where nothing goes right — how does this player respond?\n\nNot perfectly. Realistically. With skill and resilience and self-knowledge.\n\nNow — step inside them.\n\nYou are not watching them. You ARE them.\n\nFeel the game from inside their perspective. The calm confidence that comes from deep preparation. The freedom that comes from genuinely trusting your training.\n\nThe way every delivery, batting or bowling, feels like a familiar environment.\n\nThis player is not a fantasy. They are a future version of you, built from the choices you make in the next six months.\n\nCarry them with you.'
      },
      { id: 'integrate', duration: 125,
        text: 'Identity change is not instant. It is accumulated.\n\nEvery session, every right decision, every commitment kept — you are adding one more brick to the structure of this identity.\n\nWho are you? You are the player you just saw.\n\nAct accordingly. Starting today.'
      }
    ]
  },

  // ─── FLOW STATE ARCHITECTURE (15 min) ─────────────────────────
  'flow-state-architecture': {
    type: 'VISUALIZE',
    phases: [
      { id: 'settle', duration: 60,
        text: 'Flow state — what athletes call "the zone" — is not random.\n\nResearcher Mihaly Csikszentmihalyi identified specific conditions that reliably generate it:\n\n1. Clear goals\n2. Immediate feedback\n3. Optimal challenge level (slightly above your current skill)\n4. Deep concentration\n5. Loss of self-consciousness\n6. Timelessness\n\nThis fifteen-minute session is not a flow state — it is preparation for one. A deliberate build of the mental architecture that allows flow to emerge.\n\nClose your eyes. This is a long session. Let it unfold at its own pace.'
      },
      { id: 'visualize', duration: 540,
        text: 'Begin with goals. What is the single clear goal for the next session or match?\n\nNot a result — a process goal. "See the ball early." "Maintain my run-up rhythm throughout." "React, don\'t think, in the field."\n\nOne clear process goal. Hold it.\n\nNow: optimal challenge. Are you playing at a level where the challenge matches your current skill? Or is it too easy (boredom) or too hard (anxiety)?\n\nIf too easy: create a harder personal challenge within the game. Hold yourself to a higher standard than the situation demands.\n\nIf too hard: shrink your focus to the simplest possible execution of your role. Remove everything except the next ball.\n\nNow: concentration. Let external awareness fall away. The scoreboard. The crowd. The implications.\n\nImagine a tunnel of light — and inside that tunnel is only the task. Enter it.\n\nNotice that in the tunnel, self-consciousness fades. You are not thinking about how you look. You are not monitoring what others think. You are simply doing.\n\nThis is the approach of flow.\n\nAnd the last element: time. When flow arrives, time changes. An over that felt like moments. A spell of bowling that became effortless.\n\nYou cannot force this. But you can create the conditions for it, over and over, until it arrives more frequently.\n\nSit in this architecture. Feel the potential of it. This is where your best cricket lives.'
      },
      { id: 'integrate', duration: 300,
        text: 'Flow does not arrive because you try hard to get it. It arrives when the conditions are right.\n\nYour job: create the conditions. Show up prepared, set your process goal, narrow your attention, trust your training, and get out of your own way.\n\nDo this consistently — and the zone becomes not an accident but a regular address.\n\nYou know how to get there.\n\nGo build it.'
      }
    ]
  },

};

// ================================================================
// MERGE extended content into main MENTAL_CONTENT
// ================================================================
Object.assign(A.MENTAL_CONTENT, EXTENDED_CONTENT);

// ================================================================
// MERGE visual configs into a global SESSION_VISUALS lookup
// ================================================================
A.SESSION_VISUALS = SESSION_VISUALS;

// Helper: get visual config for a session (with type fallback)
A.getSessionVisual = function(sessionSlug, type) {
  var custom = SESSION_VISUALS[sessionSlug];
  var typeDefault = A.SESSION_TYPES && A.SESSION_TYPES[type || 'GROUND'];
  if (!custom) return { color: typeDefault ? typeDefault.color : '#16a34a', glowIntensity: 0.25, orbSpeed: 0.7 };
  return Object.assign({
    color: typeDefault ? typeDefault.color : '#16a34a',
    glowIntensity: 0.25,
    orbSpeed: 0.7,
    particleCount: 5,
    particleRadius: 30
  }, custom);
};

console.log('[SC] app-mental-content-extended v1.0 — added ' +
  Object.keys(EXTENDED_CONTENT).length + ' more scripted sessions, ' +
  Object.keys(SESSION_VISUALS).length + ' unique visual configs. Total scripted: ' +
  Object.keys(A.MENTAL_CONTENT).length);
})();
