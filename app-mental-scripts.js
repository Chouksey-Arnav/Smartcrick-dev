// app-mental-scripts.js v1.0
// ================================================================
// SmartCrick — Professional Mental Session Script Library
// Provides unique, role-differentiated, type-tuned phase scripts
// for every session. Load AFTER app-data.js, BEFORE app-mental-integration.js
//
// Personalisation tokens (replaced by app-mental-personalization.js):
//   {NAME}          → user's first name
//   {ROLE}          → batsman / bowler / allrounder / wicketkeeper
//   {ROLE_ACTION}   → core skill action for their role
//   {ROLE_SKILL}    → mental skill emphasis for their role
//   {ROLE_CREASE}   → positional anchor (crease, mark, gloves, etc.)
//   {ROLE_FOCUS}    → role-specific attention cue
//   {LEVEL_CONTEXT} → level-appropriate motivational line
// ================================================================
(function () {
'use strict';
var A = window.SC_APP;
if (!A) return;

// ── Helper: phase builder ────────────────────────────────────────
function ph(id, dur, text) { return { id: id, duration: dur, text: text }; }

// ── Unique session scripts keyed by slug ─────────────────────────
// Each entry: { type, phases: [{id, duration, text}] }
// Durations in seconds. Text is the TTS narration for that phase.
var SCRIPTS = {};

// ════════════════════════════════════════════════════════════════
// BREATH SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['4-7-8-breath-lock'] = {
  type: 'BREATH',
  phases: [
    ph('settle', 40, 'Find a comfortable seat. Let your hands rest open on your thighs. Close your eyes gently.\n\nThis session belongs entirely to you.'),
    ph('breathe', 60, 'We begin with the 4-7-8 pattern.\n\nInhale through your nose... for four counts.\n\nHold at the top... for seven.\n\nRelease slowly through your mouth... for eight.\n\nFeel your nervous system begin to downshift.'),
    ph('breathe', 90, 'Again. In... two... three... four.\n\nHold... two... three... four... five... six... seven.\n\nOut... two... three... four... five... six... seven... eight.\n\nYour heart rate is dropping. Your mind is clearing.'),
    ph('breathe', 90, 'Notice how each cycle takes you deeper.\n\nThis is exactly the breath {NAME} needed right now.\n\nIn for four. Hold for seven. Out for eight.\n\nThe crowd, the pressure, the scoreboard — all of it recedes.'),
    ph('breathe', 90, 'One more time. Let this breath be your anchor.\n\nThe {ROLE_CREASE} waits for a player who is completely present.\n\nIn... hold... out.\n\nYou are that player.'),
    ph('integrate', 40, 'Gently return. Keep the breath with you.\n\nCarry this rhythm into whatever comes next.'),
  ]
};

SCRIPTS['box-breathing-navy-seal'] = {
  type: 'BREATH',
  phases: [
    ph('settle', 30, 'Sit tall. Spine long. This is a discipline practice.\n\nBox breathing was designed to steady elite operators under maximum stress.\n\nYou are training at that level.'),
    ph('breathe', 80, 'Four equal sides. In... two... three... four.\n\nHold... two... three... four.\n\nOut... two... three... four.\n\nHold empty... two... three... four.\n\nFour walls of control.'),
    ph('breathe', 80, 'Again. Same tempo.\n\nIn. Hold. Out. Hold.\n\nEach cycle builds your capacity to perform under pressure.\n\nThis is what {LEVEL_CONTEXT}'),
    ph('breathe', 80, 'Your autonomic system is listening to you now.\n\nYou are telling it: I am in control.\n\nIn... hold... out... hold.\n\nThe {ROLE_FOCUS} demands this composure.'),
    ph('breathe', 80, 'Final set. Make these four counts deliberate.\n\nIn with purpose. Hold with stillness. Out with release. Hold with patience.\n\nBox breathing is now a tool you own.'),
    ph('integrate', 40, 'Open your eyes slowly.\n\nYou just practised elite-level composure. That is a {ROLE} skill.'),
  ]
};

SCRIPTS['physiological-sigh'] = {
  type: 'BREATH',
  phases: [
    ph('settle', 25, 'This is the fastest known way to reduce stress.\n\nTwo inhales through the nose — the second one tops up your lungs fully. Then one long exhale.'),
    ph('breathe', 50, 'Ready. Inhale through your nose... then a second short inhale on top — top up the lungs completely.\n\nNow exhale fully, completely, through your mouth.\n\nFeel the release.'),
    ph('breathe', 50, 'Again. Double inhale through the nose.\n\nTop up.\n\nLong, slow exhale through the mouth.\n\nYour CO2 rebalances. Your chest opens.'),
    ph('breathe', 50, 'Three times now, back to back.\n\nDouble inhale. Long exhale.\nDouble inhale. Long exhale.\nDouble inhale. Long exhale.\n\nThis is the sigh your body has been asking for.'),
    ph('breathe', 40, 'Now breathe normally.\n\nNotice the quiet that has arrived.\n\nThis is available to you at any moment — between overs, at the crease, before you bowl.'),
    ph('integrate', 25, 'The physiological sigh is yours now. Use it.'),
  ]
};

SCRIPTS['deep-calm-breathing'] = {
  type: 'BREATH',
  phases: [
    ph('settle', 45, 'Let your body become heavy.\n\nFeet flat. Shoulders dropped. Jaw unclenched.\n\nBreathe naturally for a moment and simply notice.'),
    ph('breathe', 75, 'We will breathe at a ratio of four in, six out.\n\nThis activates your parasympathetic nervous system — your rest and recovery mode.\n\nIn... two... three... four.\n\nOut... two... three... four... five... six.'),
    ph('breathe', 90, 'Continue at your own pace now.\n\nFour in. Six out.\n\nWith every exhale, imagine tension leaving the muscles in your shoulders, your forearms, your hands.\n\nA relaxed body plays better cricket.'),
    ph('breathe', 90, 'You are building something here, {NAME}.\n\nEvery {ROLE} who learns to breathe under pressure gains an edge that cannot be coached from the outside.\n\nIn. Out. In. Out.'),
    ph('breathe', 75, 'Let your breath be effortless now.\n\nYou are not forcing anything.\n\nJust following the gentle tide of your own breathing.\n\n{LEVEL_CONTEXT}'),
    ph('integrate', 40, 'Slowly open your eyes.\n\nThis calm is your baseline. Return to it whenever you need.'),
  ]
};

SCRIPTS['deep-breathing-anxiety'] = {
  type: 'BREATH',
  phases: [
    ph('settle', 40, 'First — acknowledge it.\n\nAnxiety before a big moment is not weakness. It is your body saying: this matters to me.\n\nLet that be okay.'),
    ph('breathe', 80, 'Place one hand on your chest, one on your belly.\n\nBreathe so that your belly hand rises first. Chest stays relatively still.\n\nThis is diaphragmatic breathing. It sends a direct signal to your brain: you are safe.'),
    ph('breathe', 90, 'Keep breathing from the belly.\n\nIn through the nose, slow and deep.\n\nOut through a slightly open mouth.\n\nLet each exhale be longer than the inhale.\n\nYour heart rate is responding.'),
    ph('breathe', 80, 'The {ROLE_ACTION} requires a settled mind.\n\nYou cannot {ROLE_SKILL} when anxiety is running the show.\n\nSo we breathe. We take the controls back.\n\nIn. Out. In. Out.'),
    ph('breathe', 70, 'Notice that the anxiety has not disappeared.\n\nBut you are bigger than it now.\n\nYou are breathing through it, not around it.\n\nThis is mental strength.'),
    ph('integrate', 40, 'Carry this breath with you.\n\nThe next time anxiety arrives — and it will — you know exactly what to do.'),
  ]
};

SCRIPTS['deep-calm-breathing'] = {
  type: 'BREATH',
  phases: [
    ph('settle', 45, 'Let your body become heavy.\n\nFeet flat. Shoulders dropped. Jaw unclenched.\n\nBreathe naturally for a moment and simply notice.'),
    ph('breathe', 75, 'We will breathe at a ratio of four in, six out.\n\nThis activates your parasympathetic nervous system — your rest and recovery mode.\n\nIn... two... three... four.\n\nOut... two... three... four... five... six.'),
    ph('breathe', 90, 'Continue at your own pace now.\n\nFour in. Six out.\n\nWith every exhale, imagine tension leaving the muscles in your shoulders, your forearms, your hands.\n\nA relaxed body plays better cricket.'),
    ph('breathe', 75, 'You are building something here.\n\nEvery {ROLE} who learns to breathe under pressure gains an edge that cannot be coached.\n\nIn. Out. In. Out.'),
    ph('integrate', 40, 'Slowly open your eyes.\n\nThis calm is your baseline. Return to it whenever you need.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// GROUND SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['5-4-3-2-1-grounding'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 30, 'Keep your eyes open for this one.\n\nThis technique returns you to the present moment instantly. It is one of the most used tools in elite sport psychology.'),
    ph('focus', 50, 'Five things you can see right now.\n\nLook around and name them to yourself — silently or aloud.\n\nFive. Distinct. Things. You can see.\n\nNotice the detail in each.'),
    ph('focus', 50, 'Four things you can physically feel.\n\nThe pressure of your feet on the floor.\nThe texture of your clothing.\nThe temperature of the air.\nThe weight of your hands.\n\nFour physical sensations, right now.'),
    ph('focus', 50, 'Three things you can hear.\n\nGo deeper than the obvious sound.\n\nFind a sound beneath the surface.\n\nThree. Distinct. Things you can hear.'),
    ph('focus', 50, 'Two things you can smell.\n\nEven faint. Even subtle.\n\nTwo things.\n\nYour senses are fully engaged. Your mind is here — not in the last over, not in the next innings.'),
    ph('focus', 40, 'One thing you can taste.\n\nEven just the air on your tongue.\n\nOne thing.\n\nYou are completely here. This is where the {ROLE_ACTION} lives.'),
    ph('integrate', 30, 'You are grounded.\n\nThis technique works in 60 seconds on the field. Use it.'),
  ]
};

SCRIPTS['focus-next-ball'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 25, 'One ball.\n\nNot the over. Not the session. Not the match.\n\nOne ball. That is all that exists.'),
    ph('focus', 60, 'Close your eyes.\n\nSee yourself at the {ROLE_CREASE}.\n\nThe previous ball — whether it was good or bad — is gone. It does not exist.\n\nRight now, there is only the next ball.'),
    ph('focus', 70, 'Feel your feet on the ground.\n\nYour weight distributed. Your balance neutral.\n\nYou are ready. Not tense — ready.\n\nThere is a difference between readiness and tension.\n\nYou are ready.'),
    ph('focus', 70, 'The {ROLE_FOCUS}.\n\nThat is your only job on the next ball.\n\nEverything else — the crowd, the scoreboard, the dropped catch — none of it is here.\n\nOnly this. Only now.'),
    ph('integrate', 35, 'Open your eyes.\n\nOne ball. Every time. That is how elite players think.'),
  ]
};

SCRIPTS['micro-focus-burst'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 20, 'This is a three-minute reset.\n\nNo matter what happened before, right now you are choosing to be completely present.'),
    ph('focus', 50, 'Look at one point. A spot on the floor, a distant mark — anything.\n\nFocus on it completely.\n\nIf your mind drifts, bring it back.\n\nThis single-point focus is what separates reactive players from deliberate ones.'),
    ph('focus', 50, 'Breathe normally, but consciously.\n\nEach breath in — you bring in clarity.\n\nEach breath out — you release whatever was pulling you away.\n\nFocus. Breath. Focus. Breath.'),
    ph('focus', 40, 'You are a {ROLE}. Your job is {ROLE_ACTION}.\n\nRight now, your only job is this: be completely here.\n\nFor the next twenty seconds — perfect presence.'),
    ph('integrate', 20, 'That is the micro-focus burst.\n\nBuild this into your pre-delivery routine.'),
  ]
};

SCRIPTS['reset-button'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 30, 'Something just happened — or is about to.\n\nYou need a reset.\n\nThis is the mental equivalent of taking a deep breath and starting again.'),
    ph('focus', 55, 'Close your eyes.\n\nVisualize a reset button — whatever it looks like for you. A colour. A symbol. A word.\n\nSee it clearly.\n\nPlace your hand on it mentally.'),
    ph('focus', 60, 'Press it.\n\nFeel the reset happen.\n\nThe previous ball — gone. The previous over — gone. The mistake — gone.\n\nNot forgotten, but set aside. Filed. Not running in the foreground anymore.'),
    ph('focus', 55, 'You are starting fresh. {LEVEL_CONTEXT}\n\nEvery elite player resets. Every champion knows how to start the next ball from zero.\n\nThis is that skill.'),
    ph('integrate', 35, 'Open your eyes.\n\nReset complete. What is the next ball? Good. Focus on that.'),
  ]
};

SCRIPTS['10-second-rule'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 20, 'Ten seconds.\n\nThat is how long elite athletes allow themselves to react emotionally to a bad play.\n\nTen seconds — then they switch.'),
    ph('focus', 45, 'Think of something that happened. A mistake, a missed chance, a dismissal.\n\nFeel the frustration for ten seconds.\n\nFully. Authentically.\n\nTen... nine... eight... seven... six... five... four... three... two... one.'),
    ph('focus', 45, 'Now. Switch.\n\nBig breath in.\n\nBig breath out.\n\nShoulders back. Head up. Eyes level.\n\nYou have felt it. Now you leave it.'),
    ph('focus', 45, 'The {ROLE_ACTION} requires complete attention on what is next.\n\nNot what was. Not what should have been.\n\nWhat IS next.\n\nThat is where your energy goes.'),
    ph('integrate', 25, 'Ten seconds is yours. Beyond that is indulgence.\n\nUse the ten-second rule every time.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// VISUALIZE SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['batting-visualization-session'] = {
  type: 'VISUALIZE',
  phases: [
    ph('settle', 40, 'Close your eyes.\n\nSlow, deep breath in.\n\nSlow breath out.\n\nWe are going to the crease — in your mind.'),
    ph('core', 90, 'See yourself walking out to bat.\n\nFeel the ground under your pads. The weight of your bat in your hand.\n\nThe pitch stretches out before you. You survey it.\n\nYou feel calm. Certain. You have done this before.'),
    ph('core', 90, 'You take guard. Mark the crease.\n\nThe bowler begins his run-up.\n\nYou watch — hand, not head. You track the ball from the moment of release.\n\nYou {ROLE_ACTION}.\n\nThe ball arrives. You play it with complete control.'),
    ph('core', 90, 'You are in flow now.\n\nEach ball comes and you respond — without thinking, only feeling.\n\nYour footwork is automatic. Your eyes are locked in.\n\nYou see the gaps. You time it perfectly.\n\nThis is your batting at its best.'),
    ph('core', 70, 'Hold this image.\n\nYou at your most fluent. Your most complete.\n\nRemember this feeling — the rhythm, the stillness in your head, the certainty.\n\nThis is what you are building toward.'),
    ph('integrate', 40, 'Slowly open your eyes.\n\nThat version of you exists. You just visited them.'),
  ]
};

SCRIPTS['champion-mindset-simulation'] = {
  type: 'VISUALIZE',
  phases: [
    ph('settle', 35, 'Champions do not wait for confidence to arrive. They simulate it, deliberately, until it becomes automatic.\n\nWe are going to do that now.'),
    ph('core', 80, 'Close your eyes.\n\nSee your best ever moment in cricket.\n\nIf you cannot think of one — create one. Imagine your perfect day.\n\nSee the scene in full detail. The ground. The weather. The other players.'),
    ph('core', 90, 'Now step fully into that scene.\n\nYou are not watching from the outside — you are inside the experience.\n\nFeel the confidence in your chest. The certainty in your hands.\n\nYou know — absolutely — that you are the right person for this moment.'),
    ph('core', 90, 'Notice how a champion carries themselves.\n\nThe walk. The posture. The eyes.\n\nBring that into your body now, here, sitting.\n\nSit like a champion.\n\nBreathe like one.\n\nBecause you are building those habits right now.'),
    ph('core', 70, 'Hear the crowd, or the quiet — whatever your scene holds.\n\nFeel the ball in your hand, or the bat grip, or the ground beneath your feet.\n\n{LEVEL_CONTEXT}\n\nThis is where you belong.'),
    ph('integrate', 40, 'Open your eyes carrying that.\n\nThe champion is not a future person. They are the current trajectory of the work you are doing now.'),
  ]
};

SCRIPTS['future-pacing-success'] = {
  type: 'VISUALIZE',
  phases: [
    ph('settle', 35, 'We are going to travel forward.\n\nTo a version of you who has already achieved what you are working toward.'),
    ph('core', 85, 'Imagine yourself six months from now.\n\nYou have put in the training. The drills. The mental sessions.\n\nWhat does cricket look like for you at that point?\n\nSee the match. See the performance. See the reaction of people around you.'),
    ph('core', 85, 'Step into that future you.\n\nFeel how they carry themselves.\n\nWhat do they know that you are still learning?\n\nWhat habits did they build to get there?\n\nThey are the compound interest of your daily practice.'),
    ph('core', 80, 'Now bring a message back.\n\nWhat does that future version of you want the present you to know?\n\nListen for a moment.\n\nPerhaps it is: keep going. Trust the process. The {ROLE_SKILL} is the difference.\n\nWhat do you hear?'),
    ph('integrate', 35, 'Open your eyes.\n\nThe gap between now and that future is filled by daily decisions.\n\nYou just made one. Now go make the next.'),
  ]
};

SCRIPTS['perfect-performance'] = {
  type: 'VISUALIZE',
  phases: [
    ph('settle', 40, 'There is a performance inside you that you have not fully delivered yet.\n\nToday we are going to rehearse it — in complete detail.'),
    ph('core', 90, 'Close your eyes.\n\nYou are in your perfect game.\n\nNot lucky. Not fortunate. Perfect — because of your preparation.\n\nSee the conditions. Feel the air. Know the pitch.'),
    ph('core', 90, 'You are performing exactly as you trained.\n\nEvery skill you have worked on is clicking.\n\nThe {ROLE_ACTION} — you are doing it without thinking.\n\nYour instincts are taking over because they have been trained to.'),
    ph('core', 90, 'See the moments that would normally unsettle you.\n\nA bad ball. An umpire decision.\n\nWatch yourself handle it.\n\nYou stay anchored. You reset. You continue.\n\nThat is the difference between a good player and a complete one.'),
    ph('core', 70, 'The final phase of your perfect performance.\n\nYou have given everything. And it was enough.\n\nFeel that satisfaction — the deep kind, not the flashy kind.\n\nThe satisfaction of someone who prepared and then delivered.'),
    ph('integrate', 40, 'Open your eyes.\n\nThat performance is the blueprint. Your training is the builder.'),
  ]
};

SCRIPTS['flow-state-architecture'] = {
  type: 'VISUALIZE',
  phases: [
    ph('settle', 45, 'Flow state is not an accident.\n\nAt the highest levels, athletes build the conditions for it deliberately.\n\nToday we are constructing yours.'),
    ph('core', 90, 'Think back to a time when you were completely in the zone.\n\nEverything felt automatic. Time moved differently.\n\nYou were not thinking — you were just doing.\n\nLocate that memory. Feel it again.'),
    ph('core', 90, 'What created that state?\n\nFor most athletes, it begins with complete attention on the process — not the outcome.\n\nThe {ROLE_ACTION}. That is your process.\n\nNot the scoreboard. Not selection. The process.'),
    ph('core', 100, 'Now imagine yourself entering that state deliberately.\n\nYou have a cue — a trigger that signals to your nervous system: it is time.\n\nA breath. A word. A ritual.\n\nDecide on your trigger now. What is it?\n\nSay it silently three times.'),
    ph('core', 80, 'Use that trigger.\n\nFeel the flow state arriving.\n\nEverything narrows. Your awareness becomes precise. You are entirely here.\n\nThis is what you are training for.'),
    ph('integrate', 45, 'Open your eyes carrying your trigger.\n\nThe flow state is now a door with a key. You have the key.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// ACTIVATE SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['pre-game-activation'] = {
  type: 'ACTIVATE',
  phases: [
    ph('activate', 30, 'It is time.\n\nEverything you have trained. Everything you have practised. It comes down to what you do now.'),
    ph('activate', 50, 'Close your eyes.\n\nFeel the energy in your body — the aliveness before competition.\n\nThis is not nerves. This is fuel.\n\nYour body is ready to perform.'),
    ph('activate', 55, 'Recall your training.\n\nThe hours at the nets. The drills. The sweat.\n\nAll of it has been deposited. Today you make the withdrawal.\n\nYou have earned the right to play with confidence.'),
    ph('activate', 55, '{NAME}, you are a {ROLE}.\n\nYour {ROLE_SKILL} is going to show up today.\n\nYou are going to {ROLE_ACTION} better than ever.\n\nFeel that certainty build in your chest.'),
    ph('activate', 45, 'Open your eyes.\n\nHead up. Chest forward. Eyes alive.\n\nGo.'),
  ]
};

SCRIPTS['game-day-activation'] = {
  type: 'ACTIVATE',
  phases: [
    ph('activate', 25, 'Game day.\n\nThis is what all the preparation is for.'),
    ph('activate', 55, 'Rapid breath sequence.\n\nThree deep breaths, fast exhale.\n\nIn — out sharp. In — out sharp. In — out sharp.\n\nYou are lighting the engine.'),
    ph('activate', 60, 'Recall your greatest performance.\n\nNot as a memory — as a feeling.\n\nThat confidence. That clarity. That certainty.\n\nBring it into the body right now.'),
    ph('activate', 55, 'You have done everything right.\n\nThe preparation is complete. The training is done.\n\nNow you trust it.\n\nThe {ROLE_ACTION} is automatic when you get out of your own way.'),
    ph('activate', 40, 'One word. Say it internally.\n\nYour word for today. Your anchor.\n\nTake it with you.\n\nLet it go. Let the game come to you.'),
  ]
};

SCRIPTS['fuel-your-fire'] = {
  type: 'ACTIVATE',
  phases: [
    ph('activate', 30, 'There is a fire in every great competitor.\n\nToday, we are finding yours and making it burn brighter.'),
    ph('activate', 60, 'What drives you?\n\nNot the surface answer. The real one.\n\nThe reason you show up when it is hard. The reason you chose this sport.\n\nFeel that reason now. Let it become emotion.'),
    ph('activate', 65, 'That emotion is energy.\n\nChannelled correctly, it becomes your greatest performance tool.\n\nRight now, imagine directing every ounce of that passion into your role.\n\nInto the {ROLE_ACTION}. Into the {ROLE_SKILL}.\n\nIt is fuel. Use it.'),
    ph('activate', 55, '{LEVEL_CONTEXT}\n\nThis is your moment.\n\nPush your shoulders back. Take a breath.\n\nThe fire is burning. The game is waiting. Go.'),
  ]
};

SCRIPTS['embrace-the-arena'] = {
  type: 'ACTIVATE',
  phases: [
    ph('activate', 30, 'Some players fear the arena.\n\nElite players love it.\n\nToday you decide which one you are.'),
    ph('activate', 60, 'Close your eyes. See the ground full.\n\nThe crowd. The lights if it is a night match.\n\nThe eyes on you. The expectation in the air.\n\nDo not shrink from it. Step toward it.'),
    ph('activate', 65, 'This is where you were built to perform.\n\nEvery net session. Every early morning. Every sacrifice.\n\nIt was all pointing here — to this arena, this moment.\n\nYou belong here.'),
    ph('activate', 50, 'Feel the arena energy pour into you — not press down on you.\n\nYou are not carrying it. You are powered by it.\n\n{NAME}, this is what you trained for. Every rep of it.'),
    ph('activate', 35, 'Eyes open.\n\nThe arena is ready for you.\n\nGo take your place.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// RECOVER SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['reset-after-duck'] = {
  type: 'RECOVER',
  phases: [
    ph('settle', 40, 'Every {ROLE} who has played long enough has been here.\n\nThe duck. The quick dismissal. The feeling of having let the side down.\n\nBreathe. You are not alone in this.'),
    ph('recover', 70, 'Feel whatever you need to feel for a moment.\n\nDisappointment. Frustration. Embarrassment.\n\nThose are real, human, sporting emotions.\n\nDo not bury them. Acknowledge them.'),
    ph('recover', 80, 'Now let us look at what actually happened.\n\nNot the story you are telling yourself — the facts.\n\nOne ball. One moment. In a game made of many balls and many moments.\n\nThis is one data point, not the entire story.'),
    ph('recover', 80, 'The greatest batsmen in history have all been dismissed cheaply.\n\nWhat separated them was not avoiding failure.\n\nIt was what they did with the space between failure and the next chance.\n\nThis space. Right here. This is where character is built.'),
    ph('recover', 70, 'When you get the next ball — or the next knock — what {ROLE} will you be?\n\nThe one still carrying this? Or the one who processed it and came back sharper?\n\nYour nervous system is taking notes right now. Tell it what to do.'),
    ph('integrate', 40, 'Close this chapter.\n\nThe next one starts fresh. You are ready to write it.'),
  ]
};

SCRIPTS['bounce-back-faster'] = {
  type: 'RECOVER',
  phases: [
    ph('settle', 30, 'You are not here because something went right.\n\nYou are here because something went wrong, and you chose recovery over rumination.\n\nThat is already a mental skill.'),
    ph('recover', 65, 'Name what happened. Clearly. Without drama.\n\nA bad over. A missed catch. A poor decision.\n\nJust the event. No commentary. No story.'),
    ph('recover', 70, 'Now extract the useful information.\n\nWhat, if anything, can you actually learn from this?\n\nNot what the crowd would say. Not what the commentators would say.\n\nWhat does the honest athlete in you see?'),
    ph('recover', 70, 'File it.\n\nThe lesson goes into storage. The emotion gets released.\n\nYou do not carry performance mistakes beyond this moment.\n\nThe {ROLE_CREASE} needs a player who is mentally light.'),
    ph('integrate', 35, 'Take a breath.\n\nYou are ready. What is the next ball?'),
  ]
};

SCRIPTS['full-body-relaxation'] = {
  type: 'RECOVER',
  phases: [
    ph('settle', 40, 'You have worked hard.\n\nYour body has given everything today.\n\nThis session is your reward — not more output, but complete rest.'),
    ph('recover', 80, 'Start at the top of your head.\n\nFeel the scalp release. The forehead smooth out. The jaw unclench.\n\nLet your face become completely neutral. No effort. No expression.'),
    ph('recover', 80, 'Move down to the shoulders.\n\nLet them drop — further than you thought possible.\n\nNow the chest. The breathing deepens naturally.\n\nThe belly softens. The lower back releases against whatever you are resting on.'),
    ph('recover', 80, 'Your arms. Feel them become heavy.\n\nThe hands uncurl. The fingers relax.\n\nDown through the hips, the thighs, the knees.\n\nAll the way to the feet, which soften and spread.'),
    ph('recover', 80, 'You are completely relaxed now.\n\nEvery muscle that carried you through training today is resting.\n\nThis is when the adaptation happens — in the recovery.\n\nThe work was planting seeds. This is the growing.'),
    ph('integrate', 40, 'When you are ready, slowly move your fingers, then your toes.\n\nCarry this rest with you. You earned it.'),
  ]
};

SCRIPTS['sleep-better-tonight'] = {
  type: 'RECOVER',
  phases: [
    ph('settle', 50, 'The day is done.\n\nWhatever happened today — good, bad, incomplete — the day belongs to the past now.\n\nThis moment is about transition. From performance to rest.'),
    ph('recover', 90, 'Let your breathing slow right down.\n\nLonger exhales than inhales.\n\nWith each exhale, imagine the day\'s tension dissolving.\n\nThe noise of the day becomes quiet.'),
    ph('recover', 90, 'If thoughts come — as they will — do not push them away.\n\nSimply notice them, and return to the breath.\n\nThe mind is learning to trust that it can rest.\n\nYou are giving it permission.'),
    ph('recover', 90, 'Tomorrow there will be more to do.\n\nMore to work toward. More to build.\n\nBut right now, there is only rest.\n\nThe body repairs. The skills consolidate. The memories form.\n\nAll during sleep.'),
    ph('recover', 80, 'You do not need to do anything right now.\n\nJust breathe.\n\nJust rest.\n\nYou have done enough today.'),
    ph('integrate', 40, 'Let sleep come whenever it is ready.\n\nYou have prepared for it. Goodnight.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// REFLECT SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['self-talk-rewrite'] = {
  type: 'REFLECT',
  phases: [
    ph('settle', 35, 'The voice in your head is your most constant cricket coach.\n\nThe question is — is it coaching you well?\n\nToday we audit that voice, and where needed, we rewrite it.'),
    ph('reflect', 75, 'Think of a negative self-talk pattern you notice.\n\nMaybe it is: I always get out in the nervous nineties. Or: I crumble under pressure. Or: I can\'t bowl when they are set.\n\nHear the statement clearly. It is just a programme running in the background.'),
    ph('reflect', 80, 'Now look at the evidence.\n\nIs this statement always true? Or is your brain overgeneralising one or two experiences?\n\nWhat would you tell a teammate who said this about themselves?\n\nYou would offer them the full picture.'),
    ph('reflect', 80, 'Rewrite the statement.\n\nNot with false positivity — with honest accuracy.\n\nSomething like: I have found pressure difficult before, and I am actively building that skill.\n\nThat is true. And it is also forward-facing.'),
    ph('reflect', 60, 'Say your rewritten statement three times internally.\n\nEach time, with more conviction.\n\nThis is not delusion — it is deliberate mental training.'),
    ph('integrate', 35, 'The voice is trainable.\n\nYou just trained it.'),
  ]
};

SCRIPTS['failure-as-feedback'] = {
  type: 'REFLECT',
  phases: [
    ph('settle', 35, 'Failure is the most honest feedback a player receives.\n\nNot because it is comfortable — but because it shows you exactly where the gap is.'),
    ph('reflect', 70, 'Think of a recent failure in your cricket.\n\nLook at it calmly. You are a {ROLE} doing an honest review — not punishing yourself.'),
    ph('reflect', 80, 'What did the failure actually reveal?\n\nA technical gap? A mental pattern? A preparation issue?\n\nBe specific. Vague self-criticism does nothing.\n\nPrecise identification of the gap is the beginning of fixing it.'),
    ph('reflect', 75, 'What would a coach who believed in you tell you about this?\n\nThey would say: we identified it, now we work on it.\n\nThe failure has done its job. It pointed to the next area of growth.\n\nNow it can be released.'),
    ph('integrate', 35, 'Carry the lesson forward. Leave the failure behind.\n\nThat is what experienced players do.'),
  ]
};

SCRIPTS['inner-champion'] = {
  type: 'REFLECT',
  phases: [
    ph('settle', 40, 'Inside every serious cricketer is a version of themselves that plays without fear.\n\nThat version knows they deserve to be here. That their hard work has earned their place.\n\nToday we connect with that version.'),
    ph('reflect', 80, 'Close your eyes.\n\nSee your best cricketing self — not the result, but the player.\n\nThe way they carry themselves at the {ROLE_CREASE}.\n\nThe certainty in their eyes.\n\nThe calm in their movements.'),
    ph('reflect', 85, 'That player is not a fantasy.\n\nThey are the compound result of every net session, every drill, every early morning.\n\nEvery session in this app.\n\nYou are building them, rep by rep.'),
    ph('reflect', 75, 'What does your inner champion need from you this week?\n\nMore technical work? More mental sessions? More sleep?\n\nListen honestly.\n\nThe champion inside you knows what the next step is.'),
    ph('integrate', 40, 'Open your eyes.\n\nYou are the inner champion in training.\n\nGo be that person today.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// PRESSURE SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['pressure-is-privilege'] = {
  type: 'PRESSURE',
  phases: [
    ph('settle', 30, 'Not everyone gets to feel what you are feeling.\n\nThe weight of a big game. The responsibility. The stakes.\n\nThat pressure means you matter. That you are in a situation that matters.'),
    ph('pressure', 60, 'Let the pressure be there. Do not try to remove it.\n\nInstead, reframe it: this is not a threat. This is an opportunity that came with a tax.\n\nThe tax is pressure. The opportunity is to perform something meaningful.'),
    ph('pressure', 70, 'Your body is prepared for exactly this.\n\nThe adrenaline sharpens your focus. The heart rate increases your reaction speed.\n\nNature built your body to perform under pressure — not collapse.'),
    ph('pressure', 70, 'Think of the hardest moment you ever faced in cricket and came through.\n\nYou did it.\n\nThe {ROLE_SKILL} that got you through then is still in you.\n\nIt is more developed now than it was then.'),
    ph('pressure', 55, 'You have earned this pressure.\n\nOnly players who are taken seriously face it.\n\nWear it. Step into it. Let it sharpen you.'),
    ph('integrate', 35, 'Pressure is a privilege.\n\nGo enjoy it.'),
  ]
};

SCRIPTS['choke-proof-preparation'] = {
  type: 'PRESSURE',
  phases: [
    ph('settle', 35, 'Choking happens when attention shifts from process to outcome at the wrong moment.\n\nToday we build the mental armour against it.'),
    ph('pressure', 70, 'When the stakes are highest, your routine becomes your anchor.\n\nThink of your pre-delivery routine right now.\n\nThe exact sequence. The exact focus points.\n\nThat routine is chokeproof — as long as you commit to it.'),
    ph('pressure', 75, 'Visualise a high-pressure moment.\n\nYou need six off the last ball. The team needs your last wicket to win.\n\nDo not picture the outcome.\n\nPicture your routine. Your process. Your next action only.'),
    ph('pressure', 75, 'Notice how narrow your attention becomes when you focus on process.\n\nThe crowd becomes background noise. The scoreboard becomes irrelevant.\n\nThe only thing that exists is: {ROLE_ACTION}.\n\nThat is the chokeproof mindset.'),
    ph('pressure', 60, 'Practise this narrowing now.\n\nBreath in — feel the focus sharpen.\n\nBreath out — everything except the next action falls away.\n\nThis is a trained skill. You are training it right now.'),
    ph('integrate', 35, 'When pressure arrives — and it will — trust your routine.\n\nProcess over outcome. Every time.'),
  ]
};

SCRIPTS['bowling-under-pressure'] = {
  type: 'PRESSURE',
  phases: [
    ph('settle', 30, 'You are at the top of your mark.\n\nThe match is on the line.\n\nThis session is a rehearsal for that exact moment.'),
    ph('pressure', 60, 'Visualise your run-up.\n\nNot the result — the action.\n\nThe build of momentum. The coil at the crease. The drive of the front arm. The release point.\n\nThat sequence is your truth. Not what the batter does with it.'),
    ph('pressure', 70, 'The ball is in your hand.\n\nFeel the seam. Feel the weight.\n\nYou have bowled this length ten thousand times in training.\n\nThat muscle memory does not disappear under pressure — unless you let overthinking override it.'),
    ph('pressure', 65, 'One word. Your ball. Your plans.\n\nNot their bat. Not their strengths.\n\nYou are not trying to stop them — you are trying to execute your delivery.\n\nThere is a difference. Elite bowlers know it.'),
    ph('pressure', 55, 'Bowl now. In your mind.\n\nSee it land on a perfect length. Watch it move.\n\nEven if it does not — your job was to execute. You executed.\n\nThat is a bowler who does not choke.'),
    ph('integrate', 30, 'Back to your mark.\n\nOne ball. Yours.'),
  ]
};

SCRIPTS['death-over-psychology'] = {
  type: 'PRESSURE',
  phases: [
    ph('settle', 30, 'The death overs are won in the mind first.\n\nTechnique matters. But mental readiness determines whether the technique comes out under fire.'),
    ph('pressure', 65, 'See yourself at the start of the final overs.\n\nThe batter is set. The crowd is loud. Your captain needs something special.\n\nYou do not flinch. You have been here before — in your mind.'),
    ph('pressure', 70, 'Your plan is clear.\n\nYou do not bowl to scoreboard. You bowl to your field.\n\nYou bowl to your strengths.\n\nVariation. Execution. Nerve.\n\nThree things. That is all you need to hold.'),
    ph('pressure', 70, 'When they hit you for six — and sometimes they will — your response is what defines you.\n\nNot the six.\n\nYou shake it off in three seconds. You reset. You come back with your best next ball.'),
    ph('pressure', 55, 'Visualise the wicket.\n\nSee yourself getting it in the death overs.\n\nNot lucky. Planned. Executed.\n\nThat is the {ROLE_ACTION} at its best.'),
    ph('integrate', 30, 'The death is your ground. Own it.'),
  ]
};

SCRIPTS['10-second-rule'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 20, 'Ten seconds.\n\nThat is how long elite athletes allow themselves to react emotionally to a bad play.\n\nTen seconds — then they switch.'),
    ph('focus', 45, 'Think of something that happened. A mistake, a missed chance, a dismissal.\n\nFeel the frustration for ten seconds.\n\nFully. Authentically.\n\nTen... nine... eight... seven... six... five... four... three... two... one.'),
    ph('focus', 45, 'Now. Switch.\n\nBig breath in.\n\nBig breath out.\n\nShoulders back. Head up. Eyes level.\n\nYou have felt it. Now you leave it.'),
    ph('focus', 45, 'The {ROLE_ACTION} requires complete attention on what is next.\n\nNot what was. Not what should have been.\n\nWhat IS next.\n\nThat is where your energy goes.'),
    ph('integrate', 25, 'Ten seconds is yours. Beyond that is indulgence.\n\nUse the ten-second rule every time.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// CONFIDENCE SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['confidence-countdown'] = {
  type: 'GROUND',
  phases: [
    ph('settle', 30, 'Confidence is not a feeling that arrives before you perform.\n\nIt is built by remembering what you have already done.\n\nLet us build it now.'),
    ph('focus', 60, 'Ten things that went well in your cricket this year.\n\nNot perfect — well. Moments of genuine quality.\n\nList them silently.\n\nTen moments of real cricketing capability.'),
    ph('focus', 65, 'Five qualities that make you a valuable player.\n\nNot ideal qualities — your actual qualities.\n\nThe thing your teammates rely on you for.\n\nThe thing your coach notices.\n\nName five.'),
    ph('focus', 60, 'Three recent improvements.\n\nSkills you have built. Habits you have changed.\n\nEvidence that you are progressing.\n\nThree things better than they were six months ago.'),
    ph('focus', 50, 'One thing you know with complete certainty you can do.\n\nYour core skill. Your foundation.\n\nWhen everything else is uncertain, this remains.\n\nName it. Feel it. Trust it.'),
    ph('integrate', 35, 'That is your confidence profile.\n\nCarry it. It belongs to you.'),
  ]
};

SCRIPTS['own-the-room'] = {
  type: 'ACTIVATE',
  phases: [
    ph('activate', 25, 'Presence is a choice.\n\nToday you choose to be the player whose energy changes the room when they walk in.'),
    ph('activate', 55, 'Stand in a way that communicates confidence — even if you are sitting.\n\nBack straight. Chin level. Eyes alive.\n\nYour body language is telling your nervous system what to believe.\n\nBelieve something good.'),
    ph('activate', 60, 'Visualise walking into the dressing room.\n\nYou arrive with purpose. Not arrogance — certainty.\n\nYou have prepared. You are ready. The team feels it.\n\nWhat does that energy feel like in your chest?'),
    ph('activate', 55, 'That presence comes from earned confidence.\n\nYou have been doing the work: the drills, the mental sessions, the preparation.\n\n{LEVEL_CONTEXT}\n\nYou have every right to own your space.'),
    ph('activate', 35, 'Go own it.'),
  ]
};

SCRIPTS['affirmation-immersion'] = {
  type: 'REFLECT',
  phases: [
    ph('settle', 35, 'The most powerful coach you have is yourself.\n\nThe words you repeat internally are instructions to your nervous system.\n\nLet us make those instructions excellent.'),
    ph('reflect', 65, 'Close your eyes.\n\nFirst statement: I {ROLE_ACTION} with skill and instinct.\n\nSay it internally. Then again. Then once more with the muscle behind it.'),
    ph('reflect', 65, 'Second statement: {LEVEL_CONTEXT}\n\nRepeat it three times.\n\nLet it land at the level of belief, not just sound.'),
    ph('reflect', 65, 'Third statement: I prepare, I compete, I improve.\n\nThat is your identity as an athlete.\n\nRepeat it with complete ownership.'),
    ph('reflect', 65, 'Final statement — make it your own.\n\nWhat does your inner champion need to believe right now?\n\nCreate one sentence.\n\nRepeat it until it feels true — because it is.'),
    ph('integrate', 35, 'Open your eyes.\n\nThose statements are now active in your nervous system.\n\nThey will show up when it matters.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// PRE-PERFORMANCE SESSIONS
// ════════════════════════════════════════════════════════════════

SCRIPTS['nervous-energy-converter'] = {
  type: 'PRESSURE',
  phases: [
    ph('settle', 35, 'You are nervous. Good.\n\nNervousness means you care about what is about to happen.\n\nNow we convert that energy into performance fuel.'),
    ph('pressure', 65, 'Close your eyes.\n\nFeel the nervous energy in your body — maybe your chest, your stomach, your hands.\n\nDo not try to calm it down.\n\nInstead, give it a new name: readiness.'),
    ph('pressure', 70, 'Redirect it.\n\nAll that energy — the adrenaline, the heartbeat, the sensitivity — aim it.\n\nAim it at your first {ROLE_ACTION}.\n\nChannel it into precise performance readiness.'),
    ph('pressure', 65, 'Three rapid breaths out.\n\nRapid, purposeful.\n\nNow one long slow breath in.\n\nFeel the nervous energy sharpen into focus.\n\nYou are not nervous. You are activated.'),
    ph('activate', 40, 'Eyes open.\n\nThis is not anxiety — this is your body firing up for battle.\n\nGo compete.'),
  ]
};

SCRIPTS['anchoring-peak-state'] = {
  type: 'VISUALIZE',
  phases: [
    ph('settle', 35, 'Athletes use anchors — physical cues linked to peak mental states.\n\nToday we create yours.'),
    ph('core', 75, 'Close your eyes.\n\nRecall your absolute best performance.\n\nThe feelings as they actually were: the certainty, the flow, the power.\n\nStep fully into that memory. Be there.'),
    ph('core', 80, 'As you feel that peak state — create a physical anchor.\n\nThis might be pressing two fingers together.\n\nOr a specific breath pattern.\n\nOr a word spoken internally.\n\nDecide on your anchor right now.'),
    ph('core', 80, 'While the peak state is strong, activate the anchor.\n\nRepeat this three times in your mind:\n\nPeak state — activate anchor. Peak state — activate anchor. Peak state — activate anchor.\n\nYou are creating a mental link.'),
    ph('core', 65, 'Test it.\n\nActivate the anchor.\n\nFeel the peak state return — even partially.\n\nWith practice, the response grows stronger.\n\nThis is a skill used by Olympic athletes worldwide.'),
    ph('integrate', 35, 'Open your eyes.\n\nYou have an anchor. Use it before every performance.'),
  ]
};

// ════════════════════════════════════════════════════════════════
// TYPE-BASED FALLBACK SCRIPTS (used when no specific script exists)
// ════════════════════════════════════════════════════════════════
// These provide high-quality, unique-feeling scripts that adapt to
// the session name and user role via personalisation tokens.

var TYPE_FALLBACKS = {
  BREATH: [
    function(name, dur) {
      var core = Math.max(60, dur * 60 - 80);
      return [
        ph('settle', 40, 'Close your eyes.\n\nLet your body settle — feet flat, hands open.\n\nWe are beginning ' + name + '.'),
        ph('breathe', Math.floor(core * 0.3), 'Start with natural breathing.\n\nSimply notice the rhythm your body already has.\n\nNotice it without changing it.'),
        ph('breathe', Math.floor(core * 0.4), 'Now lengthen each exhale slightly.\n\nInhale through the nose — slow and full.\n\nExhale through the mouth — longer than the inhale.\n\nWith each breath out, the tension in your body decreases.\n\nThe {ROLE_ACTION} starts with this — a settled, ready body.'),
        ph('breathe', Math.floor(core * 0.3), 'Continue at this pace.\n\nEvery breath in brings you more fully into this moment.\n\nEvery breath out clears what was before.\n\n{LEVEL_CONTEXT}'),
        ph('integrate', 40, 'Slowly open your eyes.\n\nCarry this breath with you.'),
      ];
    }
  ],
  GROUND: [
    function(name, dur) {
      var core = Math.max(60, dur * 60 - 70);
      return [
        ph('settle', 30, name + ' begins with complete presence.\n\nCome fully into this moment.'),
        ph('focus', Math.floor(core * 0.35), 'Feel your feet on the ground.\n\nYour weight. Your connection to the surface beneath you.\n\nYou are here. Nowhere else.\n\nThis is where real cricket is played — in the present, not in the future or the past.'),
        ph('focus', Math.floor(core * 0.35), 'Narrow your attention to one thing.\n\nYour breathing. Or the feel of your hands. Or a single point in front of you.\n\nThe {ROLE_FOCUS}.\n\nStay with it.'),
        ph('focus', Math.floor(core * 0.30), 'Each time the mind wanders — and it will — you choose to return.\n\nThat choice is the practice.\n\nEach return strengthens your focus for the field.\n\nFor the {ROLE_ACTION}.'),
        ph('integrate', 40, 'Open your eyes.\n\nYou have been completely present for this session.\n\nNow take that presence to your cricket.'),
      ];
    }
  ],
  VISUALIZE: [
    function(name, dur) {
      var core = Math.max(90, dur * 60 - 80);
      return [
        ph('settle', 40, 'Close your eyes.\n\nRelax your body completely.\n\nWe are going to use your imagination as a performance tool.\n\nThis is ' + name + '.'),
        ph('core', Math.floor(core * 0.35), 'See yourself on the cricket field.\n\nYour team around you. The game in motion.\n\nYou are exactly where you are supposed to be.'),
        ph('core', Math.floor(core * 0.35), 'Watch yourself perform.\n\nThe {ROLE_ACTION} — perfectly executed.\n\nNot because you are lucky. Because you are prepared.\n\nSee the technique. Feel the intention behind it.'),
        ph('core', Math.floor(core * 0.30), 'The mind does not fully distinguish between a vividly imagined experience and a real one.\n\nEvery moment you visualise yourself succeeding, you are building neural pathways.\n\nYou are literally practising — right now.\n\n{LEVEL_CONTEXT}'),
        ph('integrate', 40, 'Open your eyes slowly.\n\nYou have just added quality reps to your performance.\n\nSame skill. Different environment. All valid practice.'),
      ];
    }
  ],
  ACTIVATE: [
    function(name, dur) {
      var core = Math.max(60, dur * 60 - 60);
      return [
        ph('activate', 25, 'Time to activate.\n\nThis is ' + name + '.\n\nYour energy levels are about to increase.'),
        ph('activate', Math.floor(core * 0.4), 'Take three sharp exhales.\n\nSharp out. Sharp out. Sharp out.\n\nFeel the energy system engage.\n\nThis is your body switching from rest to ready.'),
        ph('activate', Math.floor(core * 0.35), 'You are a {ROLE} who has prepared for this.\n\nCall up your best memory of {ROLE_ACTION} done right.\n\nFeel the physicality of it. The decisiveness.\n\nThat feeling — bring it into your body now.'),
        ph('activate', Math.floor(core * 0.25), 'On your feet — mentally at least.\n\nHead up. Eyes forward.\n\nYou are ready.\n\n{LEVEL_CONTEXT}\n\nLet\'s go.'),
      ];
    }
  ],
  RECOVER: [
    function(name, dur) {
      var core = Math.max(90, dur * 60 - 80);
      return [
        ph('settle', 45, 'You have earned the right to rest.\n\nThis session — ' + name + ' — is your permission to do so.'),
        ph('recover', Math.floor(core * 0.35), 'Begin with the body.\n\nRelease your shoulders. Soften your face.\n\nThe body carries emotional weight as physical tension.\n\nLetting go starts with noticing where you are holding.'),
        ph('recover', Math.floor(core * 0.35), 'Now the mind.\n\nAnything from today\'s cricket — let it be processed and set aside.\n\nNot ignored. Not buried. Processed and set aside.\n\nThe {ROLE_CREASE} will still be there tomorrow.\n\nRight now, there is only recovery.'),
        ph('recover', Math.floor(core * 0.30), 'This is where the growth happens.\n\nNot in the work — in the rest after the work.\n\nYour nervous system is consolidating everything you trained today.\n\nLet it work. Just breathe and let it work.'),
        ph('integrate', 35, 'When you are ready, return slowly.\n\nYou are recovered. You are ready for what comes next.'),
      ];
    }
  ],
  REFLECT: [
    function(name, dur) {
      var core = Math.max(80, dur * 60 - 70);
      return [
        ph('settle', 35, 'Reflection is how experience becomes wisdom.\n\nToday — ' + name + ' — we are turning your cricket experience into something you can use.'),
        ph('reflect', Math.floor(core * 0.35), 'Think back over your recent cricket.\n\nNot with judgment — with curiosity.\n\nWhat patterns do you notice?\n\nWhere does your best cricket live? What conditions create it?'),
        ph('reflect', Math.floor(core * 0.35), 'Now think about where you want to grow.\n\nThe {ROLE_SKILL} is never fully complete — there is always a next level.\n\nWhat is your next level?\n\nBe honest. Be specific.'),
        ph('reflect', Math.floor(core * 0.30), 'What is the gap between where you are and where you want to be?\n\nNot a discouraging gap — an honest, useful one.\n\nThe gap tells you where to direct your practice.\n\n{LEVEL_CONTEXT}'),
        ph('integrate', 35, 'You have reflected with honesty and intention.\n\nThat is a skill that compounds.'),
      ];
    }
  ],
  PRESSURE: [
    function(name, dur) {
      var core = Math.max(80, dur * 60 - 65);
      return [
        ph('settle', 30, 'Pressure is where championships are decided.\n\nThis is ' + name + '.\n\nWe train it so it does not train you.'),
        ph('pressure', Math.floor(core * 0.35), 'Imagine the pressure moment.\n\nNot vaguely — specifically.\n\nWhere are you? What is the situation? What is at stake?\n\nLet yourself feel the weight of it.'),
        ph('pressure', Math.floor(core * 0.35), 'Now narrow.\n\nForget the stakes. Forget the outcome.\n\nWhat is the one thing you need to execute right now?\n\nThe {ROLE_ACTION}.\n\nThat is all. One thing. One execution.'),
        ph('pressure', Math.floor(core * 0.30), 'Elite players do not remove pressure.\n\nThey create a small, focused mental space inside it — where the process lives.\n\nYour routine. Your breath. Your {ROLE_FOCUS}.\n\nThat space is chokeproof.'),
        ph('integrate', 35, 'Pressure has been rehearsed.\n\nWhen it arrives in the match, your body will remember this session.'),
      ];
    }
  ],
};

// ── getSessionContent — the master lookup function ───────────────
function toSlug(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getSessionType(session) {
  if (!session) return 'GROUND';
  var n = (session.name || session.title || '').toLowerCase();
  // check explicit type from enrichment
  if (session.experienceType && TYPE_FALLBACKS[session.experienceType]) return session.experienceType;
  // heuristic
  if (/breath|sigh|box breath|4-7-8|inhale|exhale/.test(n)) return 'BREATH';
  if (/visual|goal|future|champion|scene|see yourself|imagine/.test(n)) return 'VISUALIZE';
  if (/activ|morning|game.day|fuel|fire|energise/.test(n)) return 'ACTIVATE';
  if (/recover|sleep|decompress|relax|release|rest|bounce/.test(n)) return 'RECOVER';
  if (/reflect|invent|account|mirror|why|gratit|self-talk|review/.test(n)) return 'REFLECT';
  if (/pressure|choke|stake|inocul|death|nervous|anxiety/.test(n)) return 'PRESSURE';
  return 'GROUND';
}

A.getSessionContent = function (slug, name, dur) {
  var normSlug = slug ? toSlug(slug) : (name ? toSlug(name) : '');

  // 1. Try exact match in SCRIPTS
  var script = SCRIPTS[normSlug] || SCRIPTS[slug];
  if (script) return { type: script.type, phases: script.phases };

  // 2. Try name-based slug
  var nameSlug = name ? toSlug(name) : '';
  if (nameSlug && SCRIPTS[nameSlug]) {
    var s2 = SCRIPTS[nameSlug];
    return { type: s2.type, phases: s2.phases };
  }

  // 3. Try partial match (first 3 words of slug)
  var shortSlug = normSlug.split('-').slice(0, 4).join('-');
  var found = Object.keys(SCRIPTS).find(function(k) { return k.indexOf(shortSlug) === 0; });
  if (found) return { type: SCRIPTS[found].type, phases: SCRIPTS[found].phases };

  // 4. Use type-based fallback with session-specific generation
  var sessionObj = A.MENTAL_SESSIONS && A.MENTAL_SESSIONS.find(function(s) {
    return toSlug(s.name) === normSlug || toSlug(s.name) === nameSlug || s.id === slug;
  });
  var type = getSessionType(sessionObj || { name: name });
  var durMins = dur || (sessionObj ? Math.floor((sessionObj.duration_seconds || 300) / 60) : 5);
  var displayName = name || (sessionObj ? sessionObj.name : slug);
  var fallbackFns = TYPE_FALLBACKS[type] || TYPE_FALLBACKS.GROUND;
  var phases = fallbackFns[0](displayName, durMins);

  return { type: type, phases: phases };
};

// Also expose generateFallbackScript for integration.js compatibility
A.generateFallbackScript = function (nameOrSlug, typeKey, dur) {
  var type = (typeKey && TYPE_FALLBACKS[typeKey]) ? typeKey : 'GROUND';
  var fallbackFns = TYPE_FALLBACKS[type];
  return { type: type, phases: fallbackFns[0](nameOrSlug, dur || 5) };
};

// Expose slug helper
A.getSessionSlug = toSlug;

console.log('[SC] app-mental-scripts v1.0 — ' + Object.keys(SCRIPTS).length + ' unique session scripts loaded');
})();
