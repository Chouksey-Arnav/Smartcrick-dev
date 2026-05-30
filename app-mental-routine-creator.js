(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var Fragment = React.Fragment;

// ── Pre-generated routines library — 77 combinations ──────────────
var PRE_GENERATED_ROUTINES = [
  // MATCH ANXIETY - 7 durations
  { focusArea: 'match_anxiety', sessionLength: 300, title: "Quick Match Calm", description: "5-minute breathing routine to ease pre-match nerves", steps: [{ instruction: "Find a quiet spot. Close your eyes and take 3 deep breaths.", duration_seconds: 60 }, { instruction: "Picture yourself walking onto the field confidently. Feel the excitement, not fear.", duration_seconds: 90 }, { instruction: "Breathe in for 4, hold for 4, out for 6. Repeat 5 times.", duration_seconds: 90 }, { instruction: "Say to yourself: 'I am ready. I am prepared. I will give my best.'", duration_seconds: 60 }] },
  { focusArea: 'match_anxiety', sessionLength: 600, title: "Pre-Match Calm Down", description: "10-minute routine to transform anxiety into excitement", steps: [{ instruction: "Sit comfortably. Take 5 slow, deep breaths to center yourself.", duration_seconds: 90 }, { instruction: "Acknowledge your nerves: 'It's okay to be nervous. This means I care.'", duration_seconds: 90 }, { instruction: "Visualize your best performance. See yourself succeeding step by step.", duration_seconds: 180 }, { instruction: "Practice 4-4-6 breathing: inhale 4, hold 4, exhale 6. Do this 10 times.", duration_seconds: 120 }, { instruction: "Open your eyes. Smile. Say: 'I've got this. Let's go!'", duration_seconds: 120 }] },
  { focusArea: 'match_anxiety', sessionLength: 900, title: "Match Day Anxiety Relief", description: "15-minute deep relaxation for match day nerves", steps: [{ instruction: "Find a quiet space. Sit or lie down comfortably. Close your eyes.", duration_seconds: 120 }, { instruction: "Scan your body for tension. Release tension from your shoulders, jaw, and hands.", duration_seconds: 180 }, { instruction: "Breathe deeply. With each exhale, imagine stress leaving your body.", duration_seconds: 180 }, { instruction: "Visualize the match. See yourself calm, focused, and performing well.", duration_seconds: 240 }, { instruction: "Repeat: 'I am calm. I am ready. I trust my training.'", duration_seconds: 120 }, { instruction: "Open your eyes slowly. Stretch. You're ready to perform!", duration_seconds: 60 }] },
  { focusArea: 'match_anxiety', sessionLength: 1200, title: "Match Nerves Transformation", description: "20-minute routine to channel anxiety into performance energy", steps: [{ instruction: "Settle into a comfortable position. Take 10 deep breaths.", duration_seconds: 150 }, { instruction: "Name your anxiety: 'I feel nervous because this match matters to me.'", duration_seconds: 150 }, { instruction: "Reframe it: 'My nerves are energy I can use. This is excitement!'", duration_seconds: 180 }, { instruction: "Visualize channeling this energy into powerful, focused performance.", duration_seconds: 300 }, { instruction: "Practice progressive relaxation: tense and release each muscle group.", duration_seconds: 240 }, { instruction: "Finish with affirmations: 'I am strong. I am ready. I will enjoy this.'", duration_seconds: 180 }] },
  { focusArea: 'match_anxiety', sessionLength: 1800, title: "Deep Match Anxiety Reset", description: "30-minute comprehensive pre-match mental preparation", steps: [{ instruction: "Create a calm environment. Sit comfortably. Close your eyes.", duration_seconds: 180 }, { instruction: "Full body scan: notice and release tension everywhere.", duration_seconds: 360 }, { instruction: "Deep breathing: 4-7-8 pattern (inhale 4, hold 7, exhale 8) for 10 cycles.", duration_seconds: 360 }, { instruction: "Visualize the entire match from start to finish. See yourself performing well.", duration_seconds: 480 }, { instruction: "Practice positive self-talk: replace every negative thought with a positive one.", duration_seconds: 240 }, { instruction: "Final affirmations: 'I am prepared. I trust myself. I will give my best effort.'", duration_seconds: 180 }] },
  { focusArea: 'match_anxiety', sessionLength: 2700, title: "Ultimate Match Preparation", description: "45-minute intensive match anxiety management", steps: [{ instruction: "Begin with 15 minutes of gentle stretching and breathing.", duration_seconds: 900 }, { instruction: "Practice mindfulness: observe your thoughts without judgment.", duration_seconds: 600 }, { instruction: "Detailed match visualization: see every scenario, see yourself handling each one.", duration_seconds: 900 }, { instruction: "Work through worst-case scenarios mentally and accept them.", duration_seconds: 600 }, { instruction: "Build confidence: recall 5 past successes in detail.", duration_seconds: 300 }, { instruction: "Final preparation: energize yourself with positive affirmations and power poses.", duration_seconds: 400 }] },
  { focusArea: 'match_anxiety', sessionLength: 3600, title: "Complete Match Anxiety Mastery", description: "60-minute full mental preparation routine", steps: [{ instruction: "Start with 20 minutes of meditation and deep breathing.", duration_seconds: 1200 }, { instruction: "Body awareness: release all physical tension systematically.", duration_seconds: 600 }, { instruction: "Mental rehearsal: visualize every aspect of match day from arrival to finish.", duration_seconds: 1200 }, { instruction: "Process and reframe all anxious thoughts into productive energy.", duration_seconds: 600 }, { instruction: "Build unshakeable confidence through past success recall and future visualization.", duration_seconds: 600 }, { instruction: "Energize and prepare: positive affirmations, power breathing, and motivation.", duration_seconds: 400 }] },

  // CONFIDENCE - 7 durations
  { focusArea: 'confidence', sessionLength: 300, title: "Quick Confidence Boost", description: "5-minute routine to instantly boost your self-belief", steps: [{ instruction: "Stand tall. Take 3 power poses for 20 seconds each.", duration_seconds: 90 }, { instruction: "Remember your last great performance. Feel that confidence again.", duration_seconds: 120 }, { instruction: "Say out loud: 'I am capable. I am strong. I will succeed.'", duration_seconds: 90 }] },
  { focusArea: 'confidence', sessionLength: 600, title: "Building Self-Belief", description: "10-minute confidence builder for before practice or matches", steps: [{ instruction: "Recall 3 times you succeeded under pressure. Relive those moments.", duration_seconds: 180 }, { instruction: "List your top 3 strengths as a cricketer. Say them out loud.", duration_seconds: 120 }, { instruction: "Visualize yourself performing confidently today.", duration_seconds: 180 }, { instruction: "Repeat: 'I trust my skills. I believe in myself. I'm ready!'", duration_seconds: 120 }] },
  { focusArea: 'confidence', sessionLength: 900, title: "Confidence Foundation", description: "15-minute session to build lasting self-confidence", steps: [{ instruction: "Start with confident body language: stand tall, shoulders back.", duration_seconds: 120 }, { instruction: "Recall 5 past successes in detail. See, feel, and hear each one.", duration_seconds: 300 }, { instruction: "Identify your unique strengths. Write them down mentally.", duration_seconds: 180 }, { instruction: "Visualize yourself using these strengths to succeed today.", duration_seconds: 240 }, { instruction: "Affirmations: 'I am skilled. I am prepared. I am confident.'", duration_seconds: 60 }] },
  { focusArea: 'confidence', sessionLength: 1200, title: "Unshakeable Confidence", description: "20-minute deep confidence building routine", steps: [{ instruction: "Power breathing: strong inhales and exhales to energize yourself.", duration_seconds: 180 }, { instruction: "Success inventory: list 10 things you've done well in cricket.", duration_seconds: 300 }, { instruction: "Strengths deep dive: explore each of your top strengths in detail.", duration_seconds: 360 }, { instruction: "Future success visualization: see yourself achieving your goals.", duration_seconds: 240 }, { instruction: "Confidence mantras: repeat your personal power statements.", duration_seconds: 120 }] },
  { focusArea: 'confidence', sessionLength: 1800, title: "Master Confidence Builder", description: "30-minute comprehensive confidence development", steps: [{ instruction: "Begin with 10 minutes of power poses and energizing movement.", duration_seconds: 600 }, { instruction: "Create a mental highlight reel of all your cricket successes.", duration_seconds: 480 }, { instruction: "Deep strengths analysis: what makes you unique as a player?", duration_seconds: 420 }, { instruction: "Visualization: see yourself dominating in your next performance.", duration_seconds: 420 }, { instruction: "Affirmation practice: 'I am world-class. I am unstoppable.'", duration_seconds: 300 }, { instruction: "Confidence integration: carry this feeling into your performance.", duration_seconds: 180 }] },
  { focusArea: 'confidence', sessionLength: 2700, title: "Elite Confidence Program", description: "45-minute intensive confidence transformation", steps: [{ instruction: "Physical confidence building: 15 minutes of power exercises.", duration_seconds: 900 }, { instruction: "Success journaling: mentally document every cricket achievement.", duration_seconds: 720 }, { instruction: "Strengths maximization: plan how to use your strengths optimally.", duration_seconds: 600 }, { instruction: "Confidence visualization: detailed mental rehearsal of peak performance.", duration_seconds: 720 }, { instruction: "Affirmation mastery: create and embed your personal confidence statements.", duration_seconds: 480 }, { instruction: "Confidence activation: prepare to perform with total self-belief.", duration_seconds: 280 }] },
  { focusArea: 'confidence', sessionLength: 3600, title: "Total Confidence Mastery", description: "60-minute complete confidence transformation program", steps: [{ instruction: "Movement and energy work: 20 minutes of confident physical practice.", duration_seconds: 1200 }, { instruction: "Comprehensive success review: every achievement, large and small.", duration_seconds: 900 }, { instruction: "Deep strengths development: understand and own your unique abilities.", duration_seconds: 900 }, { instruction: "Peak performance visualization: see yourself at your absolute best.", duration_seconds: 900 }, { instruction: "Confidence affirmation integration: embed unshakeable self-belief.", duration_seconds: 600 }, { instruction: "Performance readiness: take this confidence into action.", duration_seconds: 500 }] },

  // PRESSURE - 7 durations
  { focusArea: 'pressure', sessionLength: 300, title: "Quick Pressure Relief", description: "5-minute routine to handle high-pressure moments", steps: [{ instruction: "Take 5 deep breaths: in for 4, hold for 4, out for 6.", duration_seconds: 90 }, { instruction: "Focus only on this moment. Nothing else matters right now.", duration_seconds: 120 }, { instruction: "Say: 'I can handle this. One ball at a time.'", duration_seconds: 90 }] },
  { focusArea: 'pressure', sessionLength: 600, title: "Pressure Management", description: "10-minute routine for performing under pressure", steps: [{ instruction: "Acknowledge the pressure: 'This is a big moment. I'm ready for it.'", duration_seconds: 120 }, { instruction: "Breathe deeply. With each breath, feel more calm and focused.", duration_seconds: 180 }, { instruction: "Visualize yourself executing perfectly under pressure.", duration_seconds: 180 }, { instruction: "Affirmation: 'Pressure makes me better. I thrive in big moments.'", duration_seconds: 120 }] },
  { focusArea: 'pressure', sessionLength: 900, title: "Thriving Under Pressure", description: "15-minute pressure performance enhancement", steps: [{ instruction: "Center yourself: 5 minutes of calm, controlled breathing.", duration_seconds: 300 }, { instruction: "Reframe pressure: 'This is exciting. This is why I play.'", duration_seconds: 180 }, { instruction: "Recall times you've succeeded under pressure before.", duration_seconds: 240 }, { instruction: "Visualize handling this pressure situation perfectly.", duration_seconds: 120 }, { instruction: "Power statements: 'I am at my best when it matters most.'", duration_seconds: 60 }] },
  { focusArea: 'pressure', sessionLength: 1200, title: "Pressure Performance Mastery", description: "20-minute intensive pressure handling routine", steps: [{ instruction: "Deep relaxation: release all tension from your body.", duration_seconds: 300 }, { instruction: "Pressure acceptance: embrace it rather than fear it.", duration_seconds: 240 }, { instruction: "Success recall: 5 times you performed well under pressure.", duration_seconds: 300 }, { instruction: "Pressure simulation: mentally practice the upcoming situation.", duration_seconds: 240 }, { instruction: "Affirmations: 'Pressure reveals my true strength.'", duration_seconds: 120 }] },
  { focusArea: 'pressure', sessionLength: 1800, title: "Elite Pressure Training", description: "30-minute comprehensive pressure preparation", steps: [{ instruction: "Physical relaxation: 10 minutes of tension release.", duration_seconds: 600 }, { instruction: "Mental reframing: turn pressure into excitement and opportunity.", duration_seconds: 420 }, { instruction: "Pressure experience inventory: every pressure situation you've handled.", duration_seconds: 480 }, { instruction: "Detailed pressure visualization: see yourself thriving.", duration_seconds: 480 }, { instruction: "Pressure mantras: 'I am built for moments like these.'", duration_seconds: 300 }, { instruction: "Integration: take this calm confidence into performance.", duration_seconds: 120 }] },
  { focusArea: 'pressure', sessionLength: 2700, title: "Pressure Champion Program", description: "45-minute advanced pressure mastery", steps: [{ instruction: "Complete physical and mental relaxation: 15 minutes.", duration_seconds: 900 }, { instruction: "Pressure psychology: understand and embrace pressure fully.", duration_seconds: 600 }, { instruction: "Comprehensive pressure success review: build confidence.", duration_seconds: 720 }, { instruction: "Intense pressure visualization: simulate and master scenarios.", duration_seconds: 720 }, { instruction: "Pressure affirmation integration: embed pressure confidence.", duration_seconds: 480 }, { instruction: "Performance readiness: channel pressure into peak performance.", duration_seconds: 280 }] },
  { focusArea: 'pressure', sessionLength: 3600, title: "Ultimate Pressure Mastery", description: "60-minute complete pressure performance program", steps: [{ instruction: "Deep relaxation and centering: 20 minutes of preparation.", duration_seconds: 1200 }, { instruction: "Pressure mindset transformation: love pressure, don't fear it.", duration_seconds: 900 }, { instruction: "Extensive pressure success history: prove to yourself you can.", duration_seconds: 900 }, { instruction: "Advanced pressure simulation: mental rehearsal of all scenarios.", duration_seconds: 900 }, { instruction: "Unshakeable pressure confidence: affirmations and integration.", duration_seconds: 600 }, { instruction: "Performance activation: bring your best when it matters most.", duration_seconds: 500 }] },

  // FOCUS - 7 durations
  { focusArea: 'focus', sessionLength: 300, title: "Focus Sharpener", description: "5-minute quick focus enhancement", steps: [{ instruction: "Close your eyes. Count 10 slow breaths, focusing only on counting.", duration_seconds: 90 }, { instruction: "Pick one thing to focus on right now. Only that one thing.", duration_seconds: 120 }, { instruction: "Say: 'I am here. I am focused. I am ready.'", duration_seconds: 90 }] },
  { focusArea: 'focus', sessionLength: 600, title: "Improving Focus", description: "10-minute concentration builder", steps: [{ instruction: "Mindful breathing: count each breath from 1 to 50.", duration_seconds: 180 }, { instruction: "Single-point focus: visualize a cricket ball. See only that.", duration_seconds: 180 }, { instruction: "Practice returning to focus when your mind wanders.", duration_seconds: 180 }, { instruction: "Affirmation: 'My focus is sharp. I see everything clearly.'", duration_seconds: 60 }] },
  { focusArea: 'focus', sessionLength: 900, title: "Deep Concentration", description: "15-minute focus development routine", steps: [{ instruction: "Meditation: 5 minutes of focused breathing, nothing else.", duration_seconds: 300 }, { instruction: "Visual focus: imagine watching a single cricket ball for minutes.", duration_seconds: 240 }, { instruction: "Thought control: notice distractions, let them go, return to focus.", duration_seconds: 240 }, { instruction: "Focus affirmations: 'Nothing breaks my concentration.'", duration_seconds: 120 }] },
  { focusArea: 'focus', sessionLength: 1200, title: "Laser Focus Training", description: "20-minute advanced concentration practice", steps: [{ instruction: "Deep meditation: 10 minutes of pure, single-pointed focus.", duration_seconds: 600 }, { instruction: "Focus visualization: see yourself maintaining perfect concentration.", duration_seconds: 300 }, { instruction: "Distraction management: practice redirecting attention immediately.", duration_seconds: 240 }, { instruction: "Focus mantras: 'I control my attention completely.'", duration_seconds: 60 }] },
  { focusArea: 'focus', sessionLength: 1800, title: "Master Focus Program", description: "30-minute comprehensive focus training", steps: [{ instruction: "Extended meditation: 15 minutes of unwavering concentration.", duration_seconds: 900 }, { instruction: "Advanced focus visualization: see yourself in perfect flow state.", duration_seconds: 480 }, { instruction: "Multi-sensory focus: engage all senses in focused awareness.", duration_seconds: 420 }, { instruction: "Focus integration: embed this concentration in your nervous system.", duration_seconds: 300 }, { instruction: "Performance readiness: take this focus into action.", duration_seconds: 300 }] },
  { focusArea: 'focus', sessionLength: 2700, title: "Elite Focus Development", description: "45-minute intensive concentration mastery", steps: [{ instruction: "Deep concentration practice: 20 minutes of meditation.", duration_seconds: 1200 }, { instruction: "Focus state cultivation: learn to enter focus instantly.", duration_seconds: 720 }, { instruction: "Distraction immunity training: nothing can break your focus.", duration_seconds: 600 }, { instruction: "Flow state visualization: see yourself in perfect concentration.", duration_seconds: 600 }, { instruction: "Focus affirmation integration: embed unbreakable concentration.", duration_seconds: 380 }, { instruction: "Performance activation: bring total focus to your cricket.", duration_seconds: 200 }] },
  { focusArea: 'focus', sessionLength: 3600, title: "Ultimate Focus Mastery", description: "60-minute complete concentration transformation", steps: [{ instruction: "Extended meditation: 30 minutes of deep, sustained focus.", duration_seconds: 1800 }, { instruction: "Focus mastery visualization: see perfect concentration.", duration_seconds: 900 }, { instruction: "Advanced distraction management: immune to all interference.", duration_seconds: 900 }, { instruction: "Flow state integration: make focus your natural state.", duration_seconds: 600 }, { instruction: "Unshakeable focus confidence: you can concentrate on anything.", duration_seconds: 500 }, { instruction: "Performance readiness: total focus, total preparation.", duration_seconds: 300 }] },

  // RECOVERY - 7 durations
  { focusArea: 'recovery', sessionLength: 300, title: "Quick Mental Reset", description: "5-minute recovery after setbacks", steps: [{ instruction: "Take 5 deep breaths. Let go of what just happened.", duration_seconds: 90 }, { instruction: "Say: 'That's over. Next ball. Fresh start.'", duration_seconds: 90 }, { instruction: "Visualize yourself succeeding on the next opportunity.", duration_seconds: 120 }] },
  { focusArea: 'recovery', sessionLength: 600, title: "Mental Recovery", description: "10-minute routine to bounce back stronger", steps: [{ instruction: "Acknowledge disappointment. Feel it, then let it go.", duration_seconds: 120 }, { instruction: "Find one positive from the situation. There's always something.", duration_seconds: 120 }, { instruction: "Breathe deeply. Release tension with each exhale.", duration_seconds: 180 }, { instruction: "Refocus: 'Next moment is what matters. I'm ready.'", duration_seconds: 180 }] },
  { focusArea: 'recovery', sessionLength: 900, title: "Resilience Builder", description: "15-minute recovery and resilience routine", steps: [{ instruction: "Process the setback: what happened and how do you feel?", duration_seconds: 240 }, { instruction: "Perspective shift: this is one moment, not your whole story.", duration_seconds: 180 }, { instruction: "Find the lesson: what can you learn and improve?", duration_seconds: 240 }, { instruction: "Release and refocus: let go and prepare for the next opportunity.", duration_seconds: 180 }, { instruction: "Affirmation: 'I am resilient. I bounce back stronger.'", duration_seconds: 60 }] },
  { focusArea: 'recovery', sessionLength: 1200, title: "Mental Bounce Back", description: "20-minute deep recovery routine", steps: [{ instruction: "Full emotional processing: feel everything, then release it.", duration_seconds: 360 }, { instruction: "Reframe the setback: it's information, not failure.", duration_seconds: 300 }, { instruction: "Gratitude practice: appreciate what you still have and can do.", duration_seconds: 240 }, { instruction: "Future focus: visualize your next success clearly.", duration_seconds: 240 }, { instruction: "Recovery mantras: 'This makes me stronger. I'm moving forward.'", duration_seconds: 60 }] },
  { focusArea: 'recovery', sessionLength: 1800, title: "Complete Mental Recovery", description: "30-minute comprehensive resilience program", steps: [{ instruction: "Deep emotional release: 10 minutes to process everything.", duration_seconds: 600 }, { instruction: "Perspective building: see the bigger picture beyond this moment.", duration_seconds: 420 }, { instruction: "Learning extraction: what valuable lessons does this teach?", duration_seconds: 420 }, { instruction: "Confidence rebuilding: recall times you've overcome adversity.", duration_seconds: 420 }, { instruction: "Forward focus: visualize your comeback and success.", duration_seconds: 360 }, { instruction: "Integration: take renewed strength into your next performance.", duration_seconds: 180 }] },
  { focusArea: 'recovery', sessionLength: 2700, title: "Advanced Resilience Training", description: "45-minute intensive mental recovery", steps: [{ instruction: "Complete emotional processing: 15 minutes of release.", duration_seconds: 900 }, { instruction: "Deep perspective work: understand failure is part of growth.", duration_seconds: 720 }, { instruction: "Comprehensive learning: extract all possible lessons.", duration_seconds: 600 }, { instruction: "Confidence restoration: rebuild through past success recall.", duration_seconds: 600 }, { instruction: "Future visualization: detailed mental rehearsal of comeback.", duration_seconds: 600 }, { instruction: "Resilience integration: you are now stronger than before.", duration_seconds: 280 }] },
  { focusArea: 'recovery', sessionLength: 3600, title: "Ultimate Mental Recovery", description: "60-minute complete resilience transformation", steps: [{ instruction: "Extended emotional processing: 20 minutes to fully release.", duration_seconds: 1200 }, { instruction: "Philosophical perspective: failure is essential for success.", duration_seconds: 900 }, { instruction: "Deep learning integration: wisdom from this experience.", duration_seconds: 900 }, { instruction: "Complete confidence rebuilding: stronger than before.", duration_seconds: 900 }, { instruction: "Detailed comeback visualization: see your future success.", duration_seconds: 600 }, { instruction: "Resilience mastery: you can overcome anything.", duration_seconds: 500 }] },

  // VISUALIZATION - 7 durations
  { focusArea: 'visualization', sessionLength: 300, title: "Quick Success Vision", description: "5-minute visualization for instant mental preparation", steps: [{ instruction: "Close your eyes. Take 3 deep breaths to center.", duration_seconds: 60 }, { instruction: "See yourself performing one perfect action in detail.", duration_seconds: 150 }, { instruction: "Feel the success. Make it real in your mind.", duration_seconds: 90 }] },
  { focusArea: 'visualization', sessionLength: 600, title: "Visualization Practice", description: "10-minute mental rehearsal routine", steps: [{ instruction: "Get comfortable. Close your eyes. Breathe deeply.", duration_seconds: 90 }, { instruction: "Visualize your perfect performance: see, hear, and feel it.", duration_seconds: 300 }, { instruction: "Add detail: what you're wearing, the weather, the sounds.", duration_seconds: 150 }, { instruction: "Feel the emotions of success. Make it vivid and real.", duration_seconds: 60 }] },
  { focusArea: 'visualization', sessionLength: 900, title: "Mental Rehearsal", description: "15-minute detailed visualization practice", steps: [{ instruction: "Relaxation: 3 minutes of deep breathing and body scan.", duration_seconds: 180 }, { instruction: "Begin visualization: see yourself from start to finish.", duration_seconds: 360 }, { instruction: "Engage all senses: make the mental movie completely real.", duration_seconds: 240 }, { instruction: "Experience the emotions: feel the pride and satisfaction.", duration_seconds: 120 }] },
  { focusArea: 'visualization', sessionLength: 1200, title: "Advanced Visualization", description: "20-minute intensive mental imagery training", steps: [{ instruction: "Deep relaxation: 5 minutes to reach a calm, focused state.", duration_seconds: 300 }, { instruction: "Detailed visualization: see every moment of perfect performance.", duration_seconds: 480 }, { instruction: "Multi-sensory enhancement: add sounds, feelings, sensations.", duration_seconds: 300 }, { instruction: "Emotional integration: feel the success deeply.", duration_seconds: 120 }] },
  { focusArea: 'visualization', sessionLength: 1800, title: "Master Visualization Program", description: "30-minute comprehensive mental rehearsal", steps: [{ instruction: "Extended relaxation: 10 minutes of deep preparation.", duration_seconds: 600 }, { instruction: "Complete performance visualization: beginning to end.", duration_seconds: 720 }, { instruction: "Multi-sensory immersion: make it indistinguishable from reality.", duration_seconds: 540 }, { instruction: "Success integration: feel it in your body, mind, and emotions.", duration_seconds: 360 }, { instruction: "Confidence boost: 'I've done this. I'm ready.'", duration_seconds: 180 }] },
  { focusArea: 'visualization', sessionLength: 2700, title: "Elite Mental Imagery", description: "45-minute advanced visualization mastery", steps: [{ instruction: "Deep preparation: 15 minutes of relaxation and focus.", duration_seconds: 900 }, { instruction: "Comprehensive visualization: every detail of peak performance.", duration_seconds: 1080 }, { instruction: "Advanced sensory work: perfect clarity in mental images.", duration_seconds: 720 }, { instruction: "Emotional mastery: experience success fully.", duration_seconds: 600 }, { instruction: "Confidence integration: absolute belief in your ability.", duration_seconds: 300 }, { instruction: "Performance readiness: take this preparation into action.", duration_seconds: 100 }] },
  { focusArea: 'visualization', sessionLength: 3600, title: "Ultimate Visualization Mastery", description: "60-minute complete mental rehearsal program", steps: [{ instruction: "Extended preparation: 20 minutes of deep relaxation.", duration_seconds: 1200 }, { instruction: "Detailed performance visualization: perfect execution.", duration_seconds: 1500 }, { instruction: "Master sensory integration: reality-level mental imagery.", duration_seconds: 900 }, { instruction: "Complete emotional experience: feel every moment of success.", duration_seconds: 600 }, { instruction: "Unshakeable confidence: you've already succeeded mentally.", duration_seconds: 500 }, { instruction: "Performance activation: ready to make it real.", duration_seconds: 300 }] },

  // CONCENTRATION - 7 durations
  { focusArea: 'concentration', sessionLength: 300, title: "Quick Concentration", description: "5-minute focus sharpening exercise", steps: [{ instruction: "Count 20 breaths. Only focus on counting. Nothing else.", duration_seconds: 120 }, { instruction: "Fix your eyes on one point. Don't look away for 90 seconds.", duration_seconds: 90 }, { instruction: "Say: 'My focus is laser-sharp. Nothing distracts me.'", duration_seconds: 90 }] },
  { focusArea: 'concentration', sessionLength: 600, title: "Concentration Builder", description: "10-minute attention training routine", steps: [{ instruction: "Breathing focus: count each breath from 1 to 100.", duration_seconds: 240 }, { instruction: "Visual concentration: stare at a single object without blinking.", duration_seconds: 180 }, { instruction: "Mental focus: think only of one thing for 2 minutes.", duration_seconds: 120 }, { instruction: "Affirmation: 'I control my attention completely.'", duration_seconds: 60 }] },
  { focusArea: 'concentration', sessionLength: 900, title: "Deep Concentration", description: "15-minute intensive focus development", steps: [{ instruction: "Mindfulness breathing: 5 minutes of pure attention to breath.", duration_seconds: 300 }, { instruction: "Single-point focus: visualize one object in perfect detail.", duration_seconds: 300 }, { instruction: "Thought management: notice distractions and immediately refocus.", duration_seconds: 240 }, { instruction: "Focus mantras: 'Nothing breaks my concentration.'", duration_seconds: 60 }] },
  { focusArea: 'concentration', sessionLength: 1200, title: "Master Concentration", description: "20-minute advanced focus training", steps: [{ instruction: "Extended meditation: 10 minutes of unwavering focus.", duration_seconds: 600 }, { instruction: "Concentration visualization: see yourself in perfect focus.", duration_seconds: 300 }, { instruction: "Distraction immunity: practice maintaining focus despite interruptions.", duration_seconds: 240 }, { instruction: "Integration: 'My concentration is my superpower.'", duration_seconds: 60 }] },
  { focusArea: 'concentration', sessionLength: 1800, title: "Elite Concentration Training", description: "30-minute comprehensive focus mastery", steps: [{ instruction: "Deep meditation: 15 minutes of sustained, single-pointed focus.", duration_seconds: 900 }, { instruction: "Advanced concentration: focus on multiple levels simultaneously.", duration_seconds: 540 }, { instruction: "Distraction resistance: nothing can break your attention.", duration_seconds: 480 }, { instruction: "Flow state cultivation: enter peak concentration instantly.", duration_seconds: 420 }, { instruction: "Integration: embed this focus in your nervous system.", duration_seconds: 260 }] },
  { focusArea: 'concentration', sessionLength: 2700, title: "Professional Focus Program", description: "45-minute intensive concentration development", steps: [{ instruction: "Extended meditation: 20 minutes of unwavering attention.", duration_seconds: 1200 }, { instruction: "Multi-level focus: develop layered concentration abilities.", duration_seconds: 720 }, { instruction: "Advanced distraction management: immune to all interference.", duration_seconds: 660 }, { instruction: "Flow state mastery: perfect concentration on demand.", duration_seconds: 660 }, { instruction: "Confidence integration: absolute trust in your focus.", duration_seconds: 360 }, { instruction: "Performance readiness: take elite concentration into action.", duration_seconds: 100 }] },
  { focusArea: 'concentration', sessionLength: 3600, title: "Ultimate Focus Mastery", description: "60-minute complete concentration transformation", steps: [{ instruction: "Master meditation: 30 minutes of perfect, sustained focus.", duration_seconds: 1800 }, { instruction: "Advanced concentration techniques: master-level focus skills.", duration_seconds: 900 }, { instruction: "Complete distraction immunity: nothing affects your attention.", duration_seconds: 900 }, { instruction: "Flow state integration: concentration as your natural state.", duration_seconds: 600 }, { instruction: "Unshakeable focus confidence: you can focus on anything.", duration_seconds: 500 }, { instruction: "Peak performance activation: bring total focus to cricket.", duration_seconds: 300 }] },

  // MOTIVATION - 7 durations
  { focusArea: 'motivation', sessionLength: 300, title: "Quick Energy Boost", description: "5-minute motivation igniter", steps: [{ instruction: "Stand up. Do 10 power jumps. Feel your energy rising!", duration_seconds: 90 }, { instruction: "Think of your biggest cricket dream. See it clearly.", duration_seconds: 120 }, { instruction: "Shout: 'I want this! I'm going to get it! Let's go!'", duration_seconds: 90 }] },
  { focusArea: 'motivation', sessionLength: 600, title: "Boosting Motivation", description: "10-minute drive and passion builder", steps: [{ instruction: "Remember why you started playing cricket. Feel that passion.", duration_seconds: 150 }, { instruction: "Visualize achieving your biggest cricket goal.", duration_seconds: 180 }, { instruction: "List 5 reasons you love this game. Say them with emotion.", duration_seconds: 150 }, { instruction: "Affirmation: 'I am driven. I am passionate. I will succeed!'", duration_seconds: 120 }] },
  { focusArea: 'motivation', sessionLength: 900, title: "Drive and Passion", description: "15-minute motivation amplification", steps: [{ instruction: "Connect with your 'why': the deep reason you play cricket.", duration_seconds: 300 }, { instruction: "Visualize your future success in vivid, emotional detail.", duration_seconds: 360 }, { instruction: "Feel the fire inside: that desire to be great.", duration_seconds: 180 }, { instruction: "Power statements: 'Nothing stops me. I am unstoppable!'", duration_seconds: 60 }] },
  { focusArea: 'motivation', sessionLength: 1200, title: "Unstoppable Drive", description: "20-minute intensive motivation building", steps: [{ instruction: "Deep purpose work: understand what drives you at your core.", duration_seconds: 360 }, { instruction: "Goal visualization: see yourself achieving everything you want.", duration_seconds: 420 }, { instruction: "Energy amplification: feel the burning desire to succeed.", duration_seconds: 300 }, { instruction: "Commitment renewal: recommit to your cricket journey.", duration_seconds: 120 }] },
  { focusArea: 'motivation', sessionLength: 1800, title: "Master Motivation Program", description: "30-minute comprehensive drive building", steps: [{ instruction: "Purpose discovery: 10 minutes exploring your deepest 'why'.", duration_seconds: 600 }, { instruction: "Comprehensive goal visualization: see your entire cricket journey.", duration_seconds: 720 }, { instruction: "Passion amplification: turn your desire into burning motivation.", duration_seconds: 480 }, { instruction: "Action commitment: pledge to do whatever it takes.", duration_seconds: 300 }, { instruction: "Motivation mantras: 'I am driven. I am relentless.'", duration_seconds: 300 }] },
  { focusArea: 'motivation', sessionLength: 2700, title: "Elite Drive Development", description: "45-minute intensive motivation mastery", steps: [{ instruction: "Deep purpose work: 15 minutes connecting to your core motivation.", duration_seconds: 900 }, { instruction: "Comprehensive success visualization: see every goal achieved.", duration_seconds: 960 }, { instruction: "Passion and drive amplification: maximize your internal fire.", duration_seconds: 660 }, { instruction: "Obstacle acceptance: commit to overcoming any challenge.", duration_seconds: 660 }, { instruction: "Motivation integration: embed unshakeable drive.", duration_seconds: 420 }, { instruction: "Action readiness: channel motivation into performance.", duration_seconds: 100 }] },
  { focusArea: 'motivation', sessionLength: 3600, title: "Ultimate Motivation Mastery", description: "60-minute complete drive transformation", steps: [{ instruction: "Extended purpose exploration: 20 minutes finding your deepest why.", duration_seconds: 1200 }, { instruction: "Complete success journey visualization: see it all.", duration_seconds: 1200 }, { instruction: "Maximum passion cultivation: turn desire into obsession.", duration_seconds: 900 }, { instruction: "Total commitment: accept nothing less than your best.", duration_seconds: 600 }, { instruction: "Unshakeable drive integration: motivation as your default state.", duration_seconds: 500 }, { instruction: "Performance activation: take this fire into action.", duration_seconds: 600 }] },

  // DEALING WITH FAILURE - 7 durations
  { focusArea: 'dealing_with_failure', sessionLength: 300, title: "Quick Failure Reset", description: "5-minute bounce back routine", steps: [{ instruction: "Breathe. That's done. It doesn't define you.", duration_seconds: 90 }, { instruction: "Find one thing you can learn from this.", duration_seconds: 120 }, { instruction: "Say: 'I'm still here. I'm still fighting. Next time.'", duration_seconds: 90 }] },
  { focusArea: 'dealing_with_failure', sessionLength: 600, title: "Failure Recovery", description: "10-minute resilience building after setbacks", steps: [{ instruction: "Acknowledge the pain. It's okay to feel disappointed.", duration_seconds: 120 }, { instruction: "Reframe: failure is feedback, not final.", duration_seconds: 150 }, { instruction: "Extract the lesson: what does this teach you?", duration_seconds: 180 }, { instruction: "Refocus: 'This makes me stronger. I will come back better.'", duration_seconds: 150 }] },
  { focusArea: 'dealing_with_failure', sessionLength: 900, title: "Learning from Failure", description: "15-minute growth mindset development", steps: [{ instruction: "Process the failure: what happened and how does it feel?", duration_seconds: 240 }, { instruction: "Perspective shift: every great player has failed many times.", duration_seconds: 180 }, { instruction: "Learning extraction: what valuable lessons does this provide?", duration_seconds: 300 }, { instruction: "Future focus: how will you use this to improve?", duration_seconds: 120 }, { instruction: "Affirmation: 'Failure is just a step toward success.'", duration_seconds: 60 }] },
  { focusArea: 'dealing_with_failure', sessionLength: 1200, title: "Resilience After Failure", description: "20-minute comprehensive failure processing", steps: [{ instruction: "Full emotional release: feel everything, then let it go.", duration_seconds: 360 }, { instruction: "Growth mindset: failure is essential for improvement.", duration_seconds: 300 }, { instruction: "Deep learning: extract maximum value from this experience.", duration_seconds: 300 }, { instruction: "Confidence rebuilding: recall past times you've bounced back.", duration_seconds: 180 }, { instruction: "Forward focus: 'This isn't the end. It's preparation for success.'", duration_seconds: 60 }] },
  { focusArea: 'dealing_with_failure', sessionLength: 1800, title: "Master Failure Response", description: "30-minute complete failure transformation", steps: [{ instruction: "Complete emotional processing: 10 minutes to fully release.", duration_seconds: 600 }, { instruction: "Philosophical reframe: understand failure's role in success.", duration_seconds: 420 }, { instruction: "Comprehensive learning: what can you take from this?", duration_seconds: 480 }, { instruction: "Resilience building: strengthen through adversity.", duration_seconds: 420 }, { instruction: "Future visualization: see yourself succeeding after this.", duration_seconds: 300 }, { instruction: "Integration: 'I am stronger because I failed.'", duration_seconds: 180 }] },
  { focusArea: 'dealing_with_failure', sessionLength: 2700, title: "Advanced Failure Mastery", description: "45-minute intensive resilience program", steps: [{ instruction: "Extended emotional work: 15 minutes processing fully.", duration_seconds: 900 }, { instruction: "Deep philosophical work: failure is the path to mastery.", duration_seconds: 660 }, { instruction: "Maximum learning extraction: wisdom from failure.", duration_seconds: 720 }, { instruction: "Complete resilience building: you can overcome anything.", duration_seconds: 660 }, { instruction: "Detailed comeback visualization: see your return to success.", duration_seconds: 480 }, { instruction: "Integration: failure has made you better.", duration_seconds: 280 }] },
  { focusArea: 'dealing_with_failure', sessionLength: 3600, title: "Ultimate Failure Transformation", description: "60-minute complete failure mastery", steps: [{ instruction: "Deep emotional processing: 20 minutes to completely release.", duration_seconds: 1200 }, { instruction: "Master-level reframe: failure is your greatest teacher.", duration_seconds: 900 }, { instruction: "Complete learning integration: extract all possible wisdom.", duration_seconds: 900 }, { instruction: "Total resilience development: emerge stronger than before.", duration_seconds: 900 }, { instruction: "Comprehensive comeback visualization: detailed success planning.", duration_seconds: 600 }, { instruction: "Mastery integration: you are now better because you failed.", duration_seconds: 500 }] },

  // STAYING CALM - 7 durations
  { focusArea: 'staying_calm', sessionLength: 300, title: "Quick Calm Down", description: "5-minute instant relaxation", steps: [{ instruction: "Take 10 slow, deep breaths. In through nose, out through mouth.", duration_seconds: 120 }, { instruction: "Release all tension from your body. Let everything relax.", duration_seconds: 120 }, { instruction: "Say: 'I am calm. I am in control. I am at peace.'", duration_seconds: 60 }] },
  { focusArea: 'staying_calm', sessionLength: 600, title: "Calm and Centered", description: "10-minute relaxation routine", steps: [{ instruction: "Breathing exercise: 4-7-8 pattern (in 4, hold 7, out 8) for 10 cycles.", duration_seconds: 210 }, { instruction: "Body scan: release tension from head to toe.", duration_seconds: 210 }, { instruction: "Peaceful visualization: imagine a calm, serene place.", duration_seconds: 120 }, { instruction: "Affirmation: 'I am calm, centered, and in control.'", duration_seconds: 60 }] },
  { focusArea: 'staying_calm', sessionLength: 900, title: "Deep Relaxation", description: "15-minute comprehensive calm routine", steps: [{ instruction: "Deep breathing: 5 minutes of slow, rhythmic breathing.", duration_seconds: 300 }, { instruction: "Progressive relaxation: tense and release each muscle group.", duration_seconds: 360 }, { instruction: "Calm visualization: see yourself completely at peace.", duration_seconds: 180 }, { instruction: "Integration: 'Calmness is my natural state.'", duration_seconds: 60 }] },
  { focusArea: 'staying_calm', sessionLength: 1200, title: "Complete Calm", description: "20-minute deep relaxation program", steps: [{ instruction: "Extended breathing: 10 minutes of calming breath work.", duration_seconds: 600 }, { instruction: "Full body relaxation: release all tension completely.", duration_seconds: 360 }, { instruction: "Peace visualization: immerse yourself in complete calm.", duration_seconds: 180 }, { instruction: "Calm mantras: 'I am peace. I am stillness.'", duration_seconds: 60 }] },
  { focusArea: 'staying_calm', sessionLength: 1800, title: "Master Calm Program", description: "30-minute comprehensive relaxation", steps: [{ instruction: "Deep breathing work: 15 minutes of advanced breath techniques.", duration_seconds: 900 }, { instruction: "Complete body relaxation: every muscle totally at ease.", duration_seconds: 540 }, { instruction: "Deep peace visualization: profound inner calm.", duration_seconds: 480 }, { instruction: "Calm integration: calmness becomes automatic.", duration_seconds: 300 }, { instruction: "Readiness: take this peace into performance.", duration_seconds: 180 }] },
  { focusArea: 'staying_calm', sessionLength: 2700, title: "Elite Calm Training", description: "45-minute intensive relaxation mastery", steps: [{ instruction: "Extended breath work: 20 minutes of master-level breathing.", duration_seconds: 1200 }, { instruction: "Total body relaxation: complete tension release.", duration_seconds: 720 }, { instruction: "Advanced calm visualization: absolute inner peace.", duration_seconds: 660 }, { instruction: "Calm mastery: you can be calm in any situation.", duration_seconds: 660 }, { instruction: "Integration: calmness as your default state.", duration_seconds: 360 }, { instruction: "Performance activation: calm focus in action.", duration_seconds: 100 }] },
  { focusArea: 'staying_calm', sessionLength: 3600, title: "Ultimate Calm Mastery", description: "60-minute complete relaxation transformation", steps: [{ instruction: "Master breathing: 30 minutes of advanced breath work.", duration_seconds: 1800 }, { instruction: "Complete relaxation: total body and mind peace.", duration_seconds: 900 }, { instruction: "Deep calm visualization: profound inner stillness.", duration_seconds: 900 }, { instruction: "Calm confidence: you control your state completely.", duration_seconds: 600 }, { instruction: "Integration: unshakeable inner peace.", duration_seconds: 500 }, { instruction: "Performance readiness: calm in all circumstances.", duration_seconds: 300 }] },

  // POSITIVE MINDSET - 7 durations
  { focusArea: 'positive_mindset', sessionLength: 300, title: "Quick Positivity Boost", description: "5-minute positive thinking practice", steps: [{ instruction: "Think of 3 things you're grateful for right now.", duration_seconds: 90 }, { instruction: "Smile. Hold it for 60 seconds. Feel the positivity.", duration_seconds: 90 }, { instruction: "Say: 'Good things are coming. I attract success!'", duration_seconds: 120 }] },
  { focusArea: 'positive_mindset', sessionLength: 600, title: "Positive Mindset", description: "10-minute optimism cultivation", steps: [{ instruction: "Gratitude practice: list 10 things you're thankful for.", duration_seconds: 180 }, { instruction: "Positive reframing: turn 3 negatives into positives.", duration_seconds: 180 }, { instruction: "Success visualization: see positive outcomes.", duration_seconds: 180 }, { instruction: "Affirmation: 'I attract positivity. Great things happen to me.'", duration_seconds: 60 }] },
  { focusArea: 'positive_mindset', sessionLength: 900, title: "Optimism Builder", description: "15-minute positive thinking development", steps: [{ instruction: "Extended gratitude: appreciate everything good in your life.", duration_seconds: 300 }, { instruction: "Positive reframing practice: change your perspective.", duration_seconds: 300 }, { instruction: "Future success visualization: see the best outcomes.", duration_seconds: 240 }, { instruction: "Positive mantras: 'Life is good. I am blessed.'", duration_seconds: 60 }] },
  { focusArea: 'positive_mindset', sessionLength: 1200, title: "Master Positivity", description: "20-minute comprehensive optimism training", steps: [{ instruction: "Deep gratitude work: 10 minutes appreciating life.", duration_seconds: 600 }, { instruction: "Advanced reframing: see opportunity in everything.", duration_seconds: 360 }, { instruction: "Detailed success visualization: positive future.", duration_seconds: 180 }, { instruction: "Integration: 'Positivity is my natural mindset.'", duration_seconds: 60 }] },
  { focusArea: 'positive_mindset', sessionLength: 1800, title: "Elite Positive Thinking", description: "30-minute comprehensive optimism program", steps: [{ instruction: "Extensive gratitude: 15 minutes of deep appreciation.", duration_seconds: 900 }, { instruction: "Master reframing: transform all negatives to positives.", duration_seconds: 540 }, { instruction: "Comprehensive success visualization: see all positive outcomes.", duration_seconds: 480 }, { instruction: "Positivity integration: optimism as your default.", duration_seconds: 300 }, { instruction: "Readiness: take positive energy into performance.", duration_seconds: 180 }] },
  { focusArea: 'positive_mindset', sessionLength: 2700, title: "Professional Optimism", description: "45-minute intensive positive mindset mastery", steps: [{ instruction: "Master gratitude: 20 minutes of deep appreciation.", duration_seconds: 1200 }, { instruction: "Advanced positive reframing: see good in everything.", duration_seconds: 720 }, { instruction: "Detailed positive visualization: comprehensive future success.", duration_seconds: 660 }, { instruction: "Positivity mastery: unshakeable optimism.", duration_seconds: 660 }, { instruction: "Integration: positive mindset as your identity.", duration_seconds: 360 }, { instruction: "Performance activation: positive energy in action.", duration_seconds: 100 }] },
  { focusArea: 'positive_mindset', sessionLength: 3600, title: "Ultimate Positive Transformation", description: "60-minute complete optimism mastery", steps: [{ instruction: "Deep gratitude work: 30 minutes of profound appreciation.", duration_seconds: 1800 }, { instruction: "Master positive reframing: see opportunity in all things.", duration_seconds: 900 }, { instruction: "Comprehensive positive visualization: detailed success.", duration_seconds: 900 }, { instruction: "Unshakeable optimism: positive thinking always.", duration_seconds: 600 }, { instruction: "Integration: positivity as your core being.", duration_seconds: 500 }, { instruction: "Performance readiness: unstoppable positive energy.", duration_seconds: 300 }] },
];

var FOCUS_AREAS = [
  { id: 'match_anxiety',      emoji: '😰', label: 'Match Anxiety',     color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.30)' },
  { id: 'confidence',         emoji: '💪', label: 'Confidence',        color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  border: 'rgba(139,92,246,0.30)' },
  { id: 'pressure',           emoji: '🎯', label: 'Pressure',          color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.30)'  },
  { id: 'focus',              emoji: '🔍', label: 'Focus',             color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.30)' },
  { id: 'recovery',           emoji: '🔄', label: 'Recovery',          color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.30)' },
  { id: 'visualization',      emoji: '🧘', label: 'Visualization',     color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.30)' },
  { id: 'concentration',      emoji: '⚡', label: 'Concentration',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.30)' },
  { id: 'motivation',         emoji: '🔥', label: 'Motivation',        color: '#ec4899', bg: 'rgba(236,72,153,0.12)',  border: 'rgba(236,72,153,0.30)' },
  { id: 'dealing_with_failure',emoji:'💔', label: 'Failure Response',  color: '#6366f1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.30)' },
  { id: 'staying_calm',       emoji: '🌊', label: 'Staying Calm',      color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.30)'  },
  { id: 'positive_mindset',   emoji: '☀️', label: 'Positive Mindset',  color: '#84cc16', bg: 'rgba(132,204,22,0.12)',  border: 'rgba(132,204,22,0.30)' },
];

var SESSION_LENGTHS = [
  { seconds: 300,  label: '5 min',  xp: 10  },
  { seconds: 600,  label: '10 min', xp: 20  },
  { seconds: 900,  label: '15 min', xp: 30  },
  { seconds: 1200, label: '20 min', xp: 40  },
  { seconds: 1800, label: '30 min', xp: 60  },
  { seconds: 2700, label: '45 min', xp: 90  },
  { seconds: 3600, label: '60 min', xp: 120 },
];

function getRoutine(focusArea, sessionLength) {
  return PRE_GENERATED_ROUTINES.find(function(r) {
    return r.focusArea === focusArea && r.sessionLength === sessionLength;
  }) || null;
}

// ── Creator Player (fullscreen fixed overlay) ──────────────────────
function MentalRoutineCreatorPlayer(props) {
  var routine = props.routine;
  var focusDef = props.focusDef;
  var xpValue = props.xpValue;
  var onExit = props.onExit;
  var onDone = props.onDone;

  var fmtTime = window.SC_APP.fmtTime;
  var awardXP = window.SC_APP.awardXP;
  var fireConfetti = window.SC_APP.fireConfetti;
  var Icon = window.SC_APP.Icon;
  var XPBadge = window.SC_APP.XPBadge;

  var _step = useState(0);
  var step = _step[0]; var setStep = _step[1];
  var _timeLeft = useState(function() { return routine.steps[0].duration_seconds; });
  var timeLeft = _timeLeft[0]; var setTimeLeft = _timeLeft[1];
  var _paused = useState(false);
  var paused = _paused[0]; var setPaused = _paused[1];
  var _done = useState(false);
  var done = _done[0]; var setDone = _done[1];
  var _awarded = useState(false);
  var awarded = _awarded[0]; var setAwarded = _awarded[1];

  var intRef = useRef(null);

  useEffect(function() {
    if (done) return;
    clearInterval(intRef.current);
    setTimeLeft(routine.steps[step].duration_seconds);
    setPaused(false);
  }, [step, done]);

  useEffect(function() {
    if (done || paused) { clearInterval(intRef.current); return; }
    clearInterval(intRef.current);
    intRef.current = setInterval(function() {
      setTimeLeft(function(t) {
        if (t <= 1) {
          clearInterval(intRef.current);
          if (step < routine.steps.length - 1) {
            setStep(function(s) { return s + 1; });
          } else {
            finishRoutine();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return function() { clearInterval(intRef.current); };
  }, [step, done, paused]);

  useEffect(function() { return function() { clearInterval(intRef.current); }; }, []);

  function finishRoutine() {
    if (awarded) return;
    setAwarded(true);
    setDone(true);
    if (awardXP) awardXP(xpValue, Math.floor(routine.steps.reduce(function(s,x){return s+x.duration_seconds;},0)/60), 'mental', 'mental', 'creator-' + focusDef.id);
    if (fireConfetti) fireConfetti();
  }

  function goNext() {
    clearInterval(intRef.current);
    if (step < routine.steps.length - 1) { setStep(function(s) { return s + 1; }); }
    else { finishRoutine(); }
  }

  function skipStep() {
    clearInterval(intRef.current);
    if (step < routine.steps.length - 1) { setStep(function(s) { return s + 1; }); }
    else { finishRoutine(); }
  }

  var stepProgress = Math.round(((step + 1) / routine.steps.length) * 100);
  var cur = routine.steps[step];
  var isLastStep = step === routine.steps.length - 1;

  if (done) {
    return h('div', { style: { position: 'fixed', inset: 0, zIndex: 100, background: 'linear-gradient(135deg,#0f0824,#1e1040,#0f172a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center' } },
      h('div', { style: { fontSize: 64, marginBottom: 16 } }, '✨'),
      h('h2', { style: { fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 } }, 'Routine Complete!'),
      h('p', { style: { color: focusDef.color, marginBottom: 4, fontSize: 15, fontWeight: 600 } }, routine.title),
      h('p', { style: { color: '#a78bfa', marginBottom: 16, fontSize: 13 } }, focusDef.emoji + ' ' + focusDef.label),
      XPBadge ? h(XPBadge, { xp: xpValue }) : h('span', { style: { color: '#4ade80', fontWeight: 700 } }, '+' + xpValue + ' XP'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280, marginTop: 24 } },
        h('button', { onClick: onDone, style: { background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 14 } }, 'Back to Creator'),
        h('button', { onClick: onExit, style: { background: 'transparent', color: '#9ca3af', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 10, padding: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 } }, 'Mental Training Home')
      )
    );
  }

  return h('div', { style: { position: 'fixed', inset: 0, zIndex: 100, background: 'linear-gradient(160deg,#0f0824 0%,#170b35 45%,#0f172a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'max(1.25rem,env(safe-area-inset-top)) 1.25rem max(1.5rem,env(safe-area-inset-bottom))' } },
    // Header
    h('div', { style: { width: '100%', maxWidth: 380, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' } },
      h('button', { onClick: onExit, style: { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#a78bfa', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' } }, '← Exit'),
      h('div', { style: { textAlign: 'center', flex: 1, padding: '0 12px' } },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: focusDef.color, textTransform: 'uppercase', letterSpacing: '0.06em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, focusDef.emoji + ' ' + focusDef.label),
        h('div', { style: { fontSize: 10, color: '#6d28d9', marginTop: 1 } }, 'Step ' + (step + 1) + ' of ' + routine.steps.length)
      ),
      h('div', { style: { fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'rgba(109,40,217,0.15)', border: '1px solid rgba(109,40,217,0.25)', borderRadius: 6, padding: '4px 8px' } }, stepProgress + '%')
    ),
    // Progress bar
    h('div', { style: { width: '100%', maxWidth: 380, height: 3, background: 'rgba(109,40,217,0.18)', borderRadius: 2, marginBottom: '2rem' } },
      h('div', { style: { height: '100%', borderRadius: 2, background: 'linear-gradient(to right,' + focusDef.color + ',#a855f7)', width: stepProgress + '%', transition: 'width 0.6s ease' } })
    ),
    // Breathing orb
    (function() {
      var BreathingOrb = window.SC_APP.BreathingOrb;
      return BreathingOrb ? h(BreathingOrb, { isPlaying: !paused && !done }) : h('div', { style: { width: 72, height: 72, borderRadius: '50%', background: 'radial-gradient(circle at 35% 33%,rgba(220,150,255,0.95),rgba(109,40,217,0.75))', boxShadow: '0 0 24px rgba(168,85,247,0.4)', marginTop: 24 } });
    })(),
    // Timer
    h('div', { style: { marginTop: 12, fontSize: 15, fontWeight: 700, color: 'rgba(168,85,247,0.55)', fontVariantNumeric: 'tabular-nums' } }, fmtTime ? fmtTime(timeLeft) : (Math.floor(timeLeft/60)+':'+(timeLeft%60<10?'0':'')+(timeLeft%60))),
    // Instruction
    h('div', { style: { textAlign: 'center', maxWidth: 340, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.25rem 0' } },
      h('p', { style: { fontSize: '1.075rem', color: '#e2d9f3', lineHeight: 1.8, fontWeight: 500 } }, cur && cur.instruction)
    ),
    // Buttons
    h('div', { style: { width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 9 } },
      h('div', { style: { display: 'flex', gap: 9 } },
        step > 0 && h('button', { onClick: function() { clearInterval(intRef.current); setStep(function(s) { return s - 1; }); }, style: { flex: '0 0 auto', padding: '13px 16px', background: 'rgba(255,255,255,0.07)', color: '#a78bfa', borderRadius: 10, fontWeight: 700, border: '1px solid rgba(168,85,247,0.20)', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' } }, '←'),
        h('button', { onClick: goNext, style: { flex: 1, padding: '14px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700, borderRadius: 10, color: '#fff', fontFamily: 'inherit', background: isLastStep ? '#16a34a' : 'linear-gradient(135deg,#5b21b6,#4338ca)' } },
          isLastStep ? '✓ Complete Routine' : 'Next Step →'
        )
      ),
      h('div', { style: { display: 'flex', gap: 9 } },
        h('button', { onClick: skipStep, style: { flex: 1, padding: '11px', background: 'transparent', color: 'rgba(109,40,217,0.8)', borderRadius: 10, fontWeight: 600, border: '1px solid rgba(109,40,217,0.30)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' } }, isLastStep ? 'Skip & Complete' : 'Skip Step'),
        h('button', { onClick: function() { setPaused(function(p) { return !p; }); if (!paused) clearInterval(intRef.current); }, style: { flex: '0 0 auto', padding: '11px 16px', background: 'transparent', color: 'rgba(109,40,217,0.8)', borderRadius: 10, fontWeight: 600, border: '1px solid rgba(109,40,217,0.30)', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' } }, paused ? '▶' : '⏸')
      )
    )
  );
}

// ── Creator Tab UI ─────────────────────────────────────────────────
function MentalRoutineCreatorTab() {
  var nav = window.SC_APP.nav;
  var XPBadge = window.SC_APP.XPBadge;

  var _focus = useState(null); var selectedFocus = _focus[0]; var setFocus = _focus[1];
  var _length = useState(null); var selectedLength = _length[0]; var setLength = _length[1];
  var _playing = useState(false); var isPlaying = _playing[0]; var setPlaying = _playing[1];

  var focusDef = FOCUS_AREAS.find(function(f) { return f.id === selectedFocus; });
  var lengthDef = SESSION_LENGTHS.find(function(l) { return l.seconds === selectedLength; });
  var routine = (selectedFocus && selectedLength) ? getRoutine(selectedFocus, selectedLength) : null;

  if (isPlaying && routine && focusDef && lengthDef) {
    return h(MentalRoutineCreatorPlayer, {
      routine: routine,
      focusDef: focusDef,
      xpValue: lengthDef.xp,
      onExit: function() { setPlaying(false); nav('Mental'); },
      onDone: function() { setPlaying(false); },
    });
  }

  return h('div', { style: { padding: '14px 16px 0' } },
    // Description
    h('div', { style: { padding: '12px 14px', borderRadius: 10, background: 'rgba(109,40,217,0.08)', border: '1px solid rgba(109,40,217,0.2)', marginBottom: 20 } },
      h('p', { style: { fontSize: 13, color: 'rgba(196,130,255,0.9)', lineHeight: 1.6, margin: 0 } },
        'Build a personalised mental routine. Pick your focus area and how long you want to train — your routine is ready instantly.'
      )
    ),

    // Step 1: Focus area
    h('div', { style: { marginBottom: 20 } },
      h('p', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 } },
        '1 · Choose your focus area'
      ),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, width: '100%' } },
        FOCUS_AREAS.map(function(f) {
          var isSel = selectedFocus === f.id;
          return h('button', {
            key: f.id,
            onClick: function() { setFocus(isSel ? null : f.id); },
            style: {
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 5, padding: '10px 4px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
              background: isSel ? f.bg : 'rgba(22,27,34,0.9)',
              border: '1.5px solid ' + (isSel ? f.border : 'rgba(48,54,61,0.8)'),
              transform: isSel ? 'scale(1.04)' : 'scale(1)', transition: 'all 0.15s',
              minHeight: 72,
            }
          },
            h('span', { style: { fontSize: 18, lineHeight: 1 } }, f.emoji),
            h('span', { style: { fontSize: 10, fontWeight: 600, textAlign: 'center', lineHeight: 1.3, color: isSel ? f.color : '#6b7280', overflowWrap: 'break-word', wordBreak: 'break-word', width: '100%' } }, f.label)
          );
        })
      )
    ),

    // Step 2: Session length
    h('div', { style: { marginBottom: 20 } },
      h('p', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 } },
        '2 · Choose session length'
      ),
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
        SESSION_LENGTHS.map(function(sl) {
          var isSel = selectedLength === sl.seconds;
          return h('button', {
            key: sl.seconds,
            onClick: function() { setLength(isSel ? null : sl.seconds); },
            style: {
              padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700,
              background: isSel ? 'linear-gradient(135deg,#5b21b6,#4f46e5)' : 'rgba(22,27,34,0.9)',
              color: isSel ? '#fff' : '#8b949e',
              border: isSel ? 'none' : '1px solid rgba(48,54,61,0.9)',
              boxShadow: isSel ? '0 4px 14px rgba(91,33,182,0.35)' : 'none',
              transition: 'all 0.15s',
            }
          }, sl.label);
        })
      )
    ),

    // Routine preview
    routine && focusDef && lengthDef && h('div', { style: { marginBottom: 16 } },
      h('p', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 } },
        '3 · Your routine'
      ),
      h('div', { style: { borderRadius: 12, background: focusDef.bg, border: '1px solid ' + focusDef.border, overflow: 'hidden' } },
        // Header
        h('div', { style: { padding: '14px 16px 12px', borderBottom: '1px solid ' + focusDef.border } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 } },
            h('span', { style: { fontSize: 24 } }, focusDef.emoji),
            h('div', null,
              h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f0fdf4' } }, routine.title),
              h('div', { style: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 } }, routine.description)
            )
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 } },
            h('span', { style: { fontSize: 11, color: focusDef.color, fontWeight: 600 } }, lengthDef.label),
            h('span', { style: { fontSize: 11, color: 'rgba(255,255,255,0.35)' } }, routine.steps.length + ' steps'),
            XPBadge ? h(XPBadge, { xp: lengthDef.xp }) : h('span', { style: { fontSize: 11, color: '#4ade80', fontWeight: 700 } }, '+' + lengthDef.xp + ' XP')
          )
        ),
        // Steps
        h('div', { style: { padding: '10px 16px 14px' } },
          h('p', { style: { fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 } }, routine.steps.length + ' steps'),
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
            routine.steps.map(function(s, i) {
              return h('div', { key: i, style: { display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.25)' } },
                h('div', { style: { width: 20, height: 20, borderRadius: '50%', background: focusDef.color + '33', border: '1px solid ' + focusDef.color + '66', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 9, fontWeight: 800, color: focusDef.color } }, i + 1),
                h('p', { style: { fontSize: 12, color: 'rgba(240,253,244,0.8)', flex: 1, lineHeight: 1.55, margin: 0 } }, s.instruction),
                h('span', { style: { fontSize: 10, color: 'rgba(255,255,255,0.3)', flexShrink: 0 } }, s.duration_seconds + 's')
              );
            })
          )
        )
      )
    ),

    // Begin button
    routine && h('button', {
      onClick: function() { setPlaying(true); },
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', padding: '14px', marginBottom: 8,
        background: focusDef ? focusDef.color : '#16a34a',
        color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
        boxShadow: '0 4px 20px ' + (focusDef ? focusDef.color + '50' : 'rgba(22,163,74,0.4)'),
        transition: 'all 0.15s',
      }
    }, '▶  Begin Routine'),

    // If neither selected yet, show helper text
    !routine && h('div', { style: { textAlign: 'center', padding: '24px 0', color: '#484f58', fontSize: 13 } },
      selectedFocus && !selectedLength
        ? '← Now pick a session length'
        : !selectedFocus
        ? 'Select a focus area above to begin'
        : ''
    )
  );
}

Object.assign(window.SC_APP, {
  MentalRoutineCreatorTab: MentalRoutineCreatorTab,
  PRE_GENERATED_ROUTINES: PRE_GENERATED_ROUTINES,
  getPreGeneratedMentalRoutine: function(fa, sl) {
    var r = getRoutine(fa, sl);
    return r ? { title: r.title, description: r.description, steps: r.steps } : null;
  },
});

console.log('[SC] app-mental-routine-creator — 77 routines loaded');
})();
