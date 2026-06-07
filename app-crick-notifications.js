// app-crick-notifications.js — Crick Push Notification Engine v1.0
// 310 notification templates across 13 categories, 5 daily time slots
// A.CrickNotif.schedule(userData) → queues 3-5 notifications per day
(function() {
'use strict';
var A = window.SC_APP;
A.CrickNotif = A.CrickNotif || {};

// ── Notification library (310 entries) ──────────────────────────
var NOTIFICATIONS = [
  // ── morning_fire (30) ──────────────────────────────────────────
  {id:'mf_001',category:'morning_fire',title:'Rise and grind, {name}',body:'Day {streak} starts now. The crease is waiting.',time:'morning',conditionKey:null},
  {id:'mf_002',category:'morning_fire',title:'Good morning, champion',body:'Champions train in the morning. Be a champion.',time:'morning',conditionKey:null},
  {id:'mf_003',category:'morning_fire',title:'{name}, the nets are open',body:'This morning\'s session sets the tone for the whole day.',time:'morning',conditionKey:null},
  {id:'mf_004',category:'morning_fire',title:'Day {streak} — let\'s go',body:'Every morning session is a deposit into your cricket account.',time:'morning',conditionKey:'has_streak'},
  {id:'mf_005',category:'morning_fire',title:'Morning nets awaiting',body:'Your technique is built one early session at a time.',time:'morning',conditionKey:null},
  {id:'mf_006',category:'morning_fire',title:'{name}, it\'s training time',body:'The pitch is fresh. Your mind is fresh. Make it count.',time:'morning',conditionKey:null},
  {id:'mf_007',category:'morning_fire',title:'Early bird gets the runs',body:'Most players are still sleeping. You\'re already ahead.',time:'morning',conditionKey:null},
  {id:'mf_008',category:'morning_fire',title:'Start strong, {name}',body:'One morning session adds up to a thousand by season end.',time:'morning',conditionKey:null},
  {id:'mf_009',category:'morning_fire',title:'Pre-dawn nets. Champion hours.',body:'The hardest part is showing up. You\'re already here.',time:'morning',conditionKey:null},
  {id:'mf_010',category:'morning_fire',title:'{name} — day {streak} awaits',body:'Streak days feel different. This one\'s yours.',time:'morning',conditionKey:'has_streak'},
  {id:'mf_011',category:'morning_fire',title:'Morning discipline = match confidence',body:'How you start your morning decides how you bat under pressure.',time:'morning',conditionKey:null},
  {id:'mf_012',category:'morning_fire',title:'Up before the bowlers, {name}',body:'Your preparation is already better than most.',time:'morning',conditionKey:null},
  {id:'mf_013',category:'morning_fire',title:'Today\'s session is tomorrow\'s skill',body:'Every rep in training is a rep toward your best innings.',time:'morning',conditionKey:null},
  {id:'mf_014',category:'morning_fire',title:'First ball of the day',body:'Treat today\'s first drill like the first ball of a big innings.',time:'morning',conditionKey:null},
  {id:'mf_015',category:'morning_fire',title:'Train now, dominate later',body:'The match is easy when the training was hard.',time:'morning',conditionKey:null},
  {id:'mf_016',category:'morning_fire',title:'{name}, your opponents aren\'t awake yet',body:'Use these hours. They don\'t get them back.',time:'morning',conditionKey:null},
  {id:'mf_017',category:'morning_fire',title:'Morning XP is double-value XP',body:'Start your streak strong. One session changes everything.',time:'morning',conditionKey:null},
  {id:'mf_018',category:'morning_fire',title:'The sun\'s up. You should be too.',body:'Get to the nets. Your future self thanks you.',time:'morning',conditionKey:null},
  {id:'mf_019',category:'morning_fire',title:'No excuses, {name}',body:'Champions don\'t negotiate with mornings. They own them.',time:'morning',conditionKey:null},
  {id:'mf_020',category:'morning_fire',title:'Streak day {streak} — make it count',body:'You\'ve come too far to take a rest day today.',time:'morning',conditionKey:'streak_3'},
  {id:'mf_021',category:'morning_fire',title:'It\'s a training day',body:'Every skill you build today compounds into the future.',time:'morning',conditionKey:null},
  {id:'mf_022',category:'morning_fire',title:'New day, new drills',body:'Yesterday\'s session built this morning\'s confidence.',time:'morning',conditionKey:null},
  {id:'mf_023',category:'morning_fire',title:'The grind is real, {name}',body:'But so is the reward. Let\'s go.',time:'morning',conditionKey:null},
  {id:'mf_024',category:'morning_fire',title:'Morning ritual = elite mindset',body:'The best players protect their morning routine fiercely.',time:'morning',conditionKey:null},
  {id:'mf_025',category:'morning_fire',title:'Your potential is in the nets',body:'Go find it. Right now.',time:'morning',conditionKey:null},
  {id:'mf_026',category:'morning_fire',title:'Training before breakfast',body:'The hunger for runs starts before the first bite.',time:'morning',conditionKey:null},
  {id:'mf_027',category:'morning_fire',title:'{name} — match-day starts today',body:'Preparation makes match day feel routine.',time:'morning',conditionKey:null},
  {id:'mf_028',category:'morning_fire',title:'First session of the week',body:'Set the tone. Dominate the week. Start right now.',time:'morning',conditionKey:null},
  {id:'mf_029',category:'morning_fire',title:'Still in bed? Not anymore.',body:'Your streak is calling. Your nets are ready.',time:'morning',conditionKey:null},
  {id:'mf_030',category:'morning_fire',title:'Rise. Train. Repeat.',body:'This is how legends are made, {name}.',time:'morning',conditionKey:null},

  // ── post_session (25) ───────────────────────────────────────────
  {id:'ps_001',category:'post_session',title:'Session banked, {name}',body:'That\'s another deposit into your cricket account. +{xp} XP.',time:'anytime',conditionKey:null},
  {id:'ps_002',category:'post_session',title:'Good session — respect',body:'You showed up and did the work. That\'s everything.',time:'anytime',conditionKey:null},
  {id:'ps_003',category:'post_session',title:'Post-session reflection',body:'What did you improve today? Lock it in before you forget.',time:'anytime',conditionKey:null},
  {id:'ps_004',category:'post_session',title:'Another session done',body:'Consistency is the cheat code. You\'re cracking it.',time:'anytime',conditionKey:null},
  {id:'ps_005',category:'post_session',title:'{drills} drills complete',body:'Your muscle memory is getting stronger. Keep building.',time:'anytime',conditionKey:null},
  {id:'ps_006',category:'post_session',title:'Recovery mode activated',body:'Great session. Now hydrate, stretch, and rest.',time:'anytime',conditionKey:null},
  {id:'ps_007',category:'post_session',title:'XP earned. Skills sharpened.',body:'Every session moves you forward. Today was no different.',time:'anytime',conditionKey:null},
  {id:'ps_008',category:'post_session',title:'That was elite, {name}',body:'The best version of yourself showed up today.',time:'anytime',conditionKey:null},
  {id:'ps_009',category:'post_session',title:'Session complete ✓',body:'Log any notes while the reps are fresh in your memory.',time:'anytime',conditionKey:null},
  {id:'ps_010',category:'post_session',title:'Consistency counter: {streak}',body:'Each session adds to the story you\'re writing.',time:'anytime',conditionKey:'has_streak'},
  {id:'ps_011',category:'post_session',title:'Job done today',body:'Rest well — tomorrow\'s session needs a recovered athlete.',time:'anytime',conditionKey:null},
  {id:'ps_012',category:'post_session',title:'That\'s how champions train',body:'Not glamorous. Just consistent. Just like you.',time:'anytime',conditionKey:null},
  {id:'ps_013',category:'post_session',title:'Total XP: {xp}',body:'You\'re building something real here, {name}.',time:'anytime',conditionKey:null},
  {id:'ps_014',category:'post_session',title:'One more session done',body:'Keep this momentum going tomorrow.',time:'anytime',conditionKey:null},
  {id:'ps_015',category:'post_session',title:'Proud of you, {name}',body:'You chose training when you didn\'t have to. That\'s character.',time:'anytime',conditionKey:null},
  {id:'ps_016',category:'post_session',title:'Training logged',body:'Your future self just got a little closer to elite.',time:'anytime',conditionKey:null},
  {id:'ps_017',category:'post_session',title:'Another one in the bank',body:'Your rivals wish they had your work ethic.',time:'anytime',conditionKey:null},
  {id:'ps_018',category:'post_session',title:'Session complete. Streak alive.',body:'Day {streak} is in the books. Tomorrow makes it {streak}+1.',time:'anytime',conditionKey:'has_streak'},
  {id:'ps_019',category:'post_session',title:'Hard session = real growth',body:'Discomfort in training means comfort in matches.',time:'anytime',conditionKey:null},
  {id:'ps_020',category:'post_session',title:'That\'s {workouts} workouts total',body:'You\'re building a body that plays 50-over cricket.',time:'anytime',conditionKey:null},
  {id:'ps_021',category:'post_session',title:'Training complete',body:'Shower. Eat. Rest. Do it all again tomorrow.',time:'anytime',conditionKey:null},
  {id:'ps_022',category:'post_session',title:'Great effort, {name}',body:'The work you do in private shows up in the match.',time:'anytime',conditionKey:null},
  {id:'ps_023',category:'post_session',title:'Session done — reflect now',body:'What was the highlight? What needs work? Write it down.',time:'anytime',conditionKey:null},
  {id:'ps_024',category:'post_session',title:'You earned that XP',body:'Every point represents effort. You put in the effort.',time:'anytime',conditionKey:null},
  {id:'ps_025',category:'post_session',title:'Rest well, champion',body:'Recovery is part of training. Take tonight seriously.',time:'anytime',conditionKey:null},

  // ── streak_milestone (20) ──────────────────────────────────────
  {id:'sm_001',category:'streak_milestone',title:'3-day streak 🔥',body:'Three in a row, {name}. The habit is starting to form.',time:'anytime',conditionKey:'streak_3'},
  {id:'sm_002',category:'streak_milestone',title:'7-day streak! 🏏',body:'One week straight. You\'re not just a player — you\'re a trainer.',time:'anytime',conditionKey:'streak_7'},
  {id:'sm_003',category:'streak_milestone',title:'14-day streak! ⚡',body:'Two weeks of pure consistency. This is elite territory, {name}.',time:'anytime',conditionKey:'streak_14'},
  {id:'sm_004',category:'streak_milestone',title:'Streak day {streak}',body:'Every day you train, someone else takes a day off. Stay ahead.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_005',category:'streak_milestone',title:'Don\'t break it now',body:'{streak} days and counting. Protect this streak like a wicket.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_006',category:'streak_milestone',title:'Streak alive: {streak} days',body:'The longer the streak, the more powerful the habit.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_007',category:'streak_milestone',title:'5-day milestone',body:'Halfway through your first week. Keep going.',time:'anytime',conditionKey:null},
  {id:'sm_008',category:'streak_milestone',title:'10 days strong 💪',body:'Double digits. You\'re officially building a routine.',time:'anytime',conditionKey:null},
  {id:'sm_009',category:'streak_milestone',title:'21-day habit lock',body:'Three weeks means this is wired in now. Legendary.',time:'anytime',conditionKey:null},
  {id:'sm_010',category:'streak_milestone',title:'30 days — you\'re elite',body:'A full month of daily training. Only 1% of players get here.',time:'anytime',conditionKey:null},
  {id:'sm_011',category:'streak_milestone',title:'Your streak is precious',body:'{streak} days of showing up. Don\'t let a lazy day erase that.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_012',category:'streak_milestone',title:'Streak = character',body:'What you do every day makes you who you are as a cricketer.',time:'anytime',conditionKey:null},
  {id:'sm_013',category:'streak_milestone',title:'One more day on the streak',body:'{streak}+1 by tomorrow. Simple as that.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_014',category:'streak_milestone',title:'Consistency is your superpower',body:'You\'ve trained {streak} days straight. Not many can say that.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_015',category:'streak_milestone',title:'Week {streak} complete',body:'Every week you commit is a week your competition doesn\'t.',time:'anytime',conditionKey:null},
  {id:'sm_016',category:'streak_milestone',title:'Streak protected ✓',body:'You didn\'t break it. You never break it. That\'s you.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_017',category:'streak_milestone',title:'Daily training = daily gains',body:'{streak} days = {streak} sessions of compound improvement.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_018',category:'streak_milestone',title:'Streak fire is burning 🔥',body:'Don\'t let it go out. Train today.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_019',category:'streak_milestone',title:'Keep the chain unbroken',body:'Day {streak}. Every link matters.',time:'anytime',conditionKey:'has_streak'},
  {id:'sm_020',category:'streak_milestone',title:'Legendary streak ahead',body:'At this pace, {name}, you\'re building a cricket legacy.',time:'anytime',conditionKey:'has_streak'},

  // ── comeback (25) ──────────────────────────────────────────────
  {id:'cb_001',category:'comeback',title:'We miss you, {name}',body:'It\'s been a while. Your crease is waiting.',time:'morning',conditionKey:'missed_yesterday'},
  {id:'cb_002',category:'comeback',title:'Time to come back',body:'Every day off is fine. The key is coming back.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_003',category:'comeback',title:'Your streak is gone — reset starts today',body:'New streak. Day 1. It only goes up from here.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_004',category:'comeback',title:'Even Sachin had bad weeks',body:'The greats come back. They always come back.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_005',category:'comeback',title:'One session ends the slump',body:'That\'s all it takes. Just one. Right now.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_006',category:'comeback',title:'The nets missed you',body:'Come back today. No judgment — just cricket.',time:'morning',conditionKey:'missed_yesterday'},
  {id:'cb_007',category:'comeback',title:'Comeback starts with one step',body:'Log in. Pick a drill. That\'s it.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_008',category:'comeback',title:'The longer you wait, the harder it gets',body:'Start today. Not tomorrow. Today.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_009',category:'comeback',title:'{name}, your team needs you fit',body:'Come back to training. Match day is coming.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_010',category:'comeback',title:'Every champion has a comeback story',body:'Yours starts right now.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_011',category:'comeback',title:'You trained before. You can train again.',body:'The habit is still in there. Wake it up.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_012',category:'comeback',title:'Day 1 energy. Let\'s go.',body:'Fresh start. Full commitment. New streak begins today.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_013',category:'comeback',title:'Don\'t let rust set in',body:'A few sessions and you\'ll feel sharp again.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_014',category:'comeback',title:'The game doesn\'t wait',body:'Your competition kept training while you were away.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_015',category:'comeback',title:'One session = momentum',body:'You can\'t steer a parked car. Get moving again.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_016',category:'comeback',title:'Crick has been waiting',body:'Come back. Pick a drill. Let\'s restart this.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_017',category:'comeback',title:'It\'s been {days} days since your last session',body:'Time to fix that. Today is the day.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_018',category:'comeback',title:'No shame in restarting',body:'Every comeback is a win. Start yours today.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_019',category:'comeback',title:'The crease calls',body:'There\'s a session with your name on it. Right now.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_020',category:'comeback',title:'New week, fresh commitment',body:'Last week doesn\'t matter. This week is yours.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_021',category:'comeback',title:'Miss training? That\'s a good sign.',body:'If you miss it, you belong in it. Come back.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_022',category:'comeback',title:'The version of you that trains is better',body:'Reconnect with that version. Start today.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_023',category:'comeback',title:'Hard restarts build stronger habits',body:'The comeback is always harder than the start. And worth it.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_024',category:'comeback',title:'Let\'s not waste today too',body:'You have 24 hours. Use some of them on cricket.',time:'morning',conditionKey:'no_streak'},
  {id:'cb_025',category:'comeback',title:'Your cricket journey isn\'t over',body:'It\'s just paused. Hit play today.',time:'morning',conditionKey:'no_streak'},

  // ── drill_tips (30) ────────────────────────────────────────────
  {id:'dt_001',category:'drill_tips',title:'Drill tip: Cover drive',body:'Keep your head still through impact. Front elbow leads everything.',time:'afternoon',conditionKey:null},
  {id:'dt_002',category:'drill_tips',title:'Batting insight',body:'Soft hands on the cut shot — let the ball do the work.',time:'afternoon',conditionKey:null},
  {id:'dt_003',category:'drill_tips',title:'Quick drill tip',body:'Shadow batting for 5 minutes improves muscle memory faster than nets.',time:'afternoon',conditionKey:null},
  {id:'dt_004',category:'drill_tips',title:'Bowling insight for {name}',body:'Seam position at release determines everything. Check yours today.',time:'afternoon',conditionKey:null},
  {id:'dt_005',category:'drill_tips',title:'Fielding secret',body:'The best fielders move before the ball is hit. Anticipate, don\'t react.',time:'afternoon',conditionKey:null},
  {id:'dt_006',category:'drill_tips',title:'Batting: weight transfer',body:'Your weight should be moving forward as you play straight drives.',time:'afternoon',conditionKey:null},
  {id:'dt_007',category:'drill_tips',title:'Spin bowling drill',body:'Practice your stock ball 100 times before attempting variations.',time:'afternoon',conditionKey:null},
  {id:'dt_008',category:'drill_tips',title:'Keeper tip',body:'Head still. Watch the ball all the way. Let it come to you.',time:'afternoon',conditionKey:null},
  {id:'dt_009',category:'drill_tips',title:'Pull shot mechanics',body:'Rock onto the back foot early. Don\'t wait for the ball to arrive.',time:'afternoon',conditionKey:null},
  {id:'dt_010',category:'drill_tips',title:'Batting drill today?',body:'The straight drive is the foundation of every good batting technique.',time:'afternoon',conditionKey:null},
  {id:'dt_011',category:'drill_tips',title:'Bowling rhythm drill',body:'Run-up consistency creates bowling consistency. Mark your approach.',time:'afternoon',conditionKey:null},
  {id:'dt_012',category:'drill_tips',title:'Defence first',body:'The best attacking batters have unbreakable defenses. Build yours.',time:'afternoon',conditionKey:null},
  {id:'dt_013',category:'drill_tips',title:'Footwork focus',body:'Move your feet, not just your hands. Good footwork fixes most problems.',time:'afternoon',conditionKey:null},
  {id:'dt_014',category:'drill_tips',title:'Mental drill: visualize',body:'Before your next nets session, spend 2 minutes visualizing each shot.',time:'afternoon',conditionKey:null},
  {id:'dt_015',category:'drill_tips',title:'Reaction drill reminder',body:'Quick reflexes are trained, not natural. Do 10 minutes of reaction work.',time:'afternoon',conditionKey:null},
  {id:'dt_016',category:'drill_tips',title:'Core strength = bat speed',body:'Every push-up and plank you do adds power to your shots.',time:'afternoon',conditionKey:null},
  {id:'dt_017',category:'drill_tips',title:'Short ball technique',body:'Get on top of the short ball early. Rise onto your toes before it arrives.',time:'afternoon',conditionKey:null},
  {id:'dt_018',category:'drill_tips',title:'Pressure ball drill',body:'Simulate match pressure in practice. Score targets, time limits.',time:'afternoon',conditionKey:null},
  {id:'dt_019',category:'drill_tips',title:'Bowling: yorker drill',body:'Hit the same spot 20 times. That\'s how you make it automatic.',time:'afternoon',conditionKey:null},
  {id:'dt_020',category:'drill_tips',title:'Square cut insight',body:'Stay tall. Don\'t drag the ball down. Punch through the line.',time:'afternoon',conditionKey:null},
  {id:'dt_021',category:'drill_tips',title:'Overthrow prevention',body:'Back up every ball as a fielder. Championship teams do this automatically.',time:'afternoon',conditionKey:null},
  {id:'dt_022',category:'drill_tips',title:'Batting: tempo building',body:'Rotate strike constantly. The boundary comes when the time is right.',time:'afternoon',conditionKey:null},
  {id:'dt_023',category:'drill_tips',title:'Leg glance drill',body:'The flick off the legs — wrists, timing, and head still. Practice today.',time:'afternoon',conditionKey:null},
  {id:'dt_024',category:'drill_tips',title:'Seam bowling control',body:'Bowl at a target, not just a length. Precise aim creates consistent results.',time:'afternoon',conditionKey:null},
  {id:'dt_025',category:'drill_tips',title:'Reading spin',body:'Watch the wrist, not the hand. It tells you everything before release.',time:'afternoon',conditionKey:null},
  {id:'dt_026',category:'drill_tips',title:'Back foot defence',body:'Solid back-foot defence is what makes you hard to dislodge.',time:'afternoon',conditionKey:null},
  {id:'dt_027',category:'drill_tips',title:'Swing bowling tip',body:'Humidity is your friend. Bowl with the shine in humid conditions.',time:'afternoon',conditionKey:null},
  {id:'dt_028',category:'drill_tips',title:'Catching drill suggestion',body:'Low catches are hardest. Spend 5 minutes on the sharp low grab today.',time:'afternoon',conditionKey:null},
  {id:'dt_029',category:'drill_tips',title:'Batting tempo drill',body:'Play 5 overs like T20 — aggressive. Then 5 overs like a Test match.',time:'afternoon',conditionKey:null},
  {id:'dt_030',category:'drill_tips',title:'Outfield sprints drill',body:'Sprint between cones with a ball in hand. Game speed fitness.',time:'afternoon',conditionKey:null},

  // ── mental_reminder (25) ───────────────────────────────────────
  {id:'mr_001',category:'mental_reminder',title:'Mental training matters',body:'Physical preparation without mental prep is incomplete cricket.',time:'anytime',conditionKey:null},
  {id:'mr_002',category:'mental_reminder',title:'Focus session today, {name}?',body:'10 minutes of mental training can transform your next innings.',time:'anytime',conditionKey:null},
  {id:'mr_003',category:'mental_reminder',title:'Breathe. Focus. Execute.',body:'The three words every top cricketer lives by.',time:'anytime',conditionKey:null},
  {id:'mr_004',category:'mental_reminder',title:'Visualization is practice',body:'Your brain doesn\'t distinguish between vivid visualization and real reps.',time:'anytime',conditionKey:null},
  {id:'mr_005',category:'mental_reminder',title:'Pressure is a skill',body:'The best batters don\'t feel less pressure — they handle it better.',time:'anytime',conditionKey:null},
  {id:'mr_006',category:'mental_reminder',title:'Reset between balls',body:'World-class players treat each ball as a new beginning.',time:'anytime',conditionKey:null},
  {id:'mr_007',category:'mental_reminder',title:'Process, not outcome',body:'Focus on what you can control — your technique, your approach.',time:'anytime',conditionKey:null},
  {id:'mr_008',category:'mental_reminder',title:'The mental game starts now',body:'Train your mind during training, not just during matches.',time:'anytime',conditionKey:null},
  {id:'mr_009',category:'mental_reminder',title:'Handle failure like a pro',body:'A duck doesn\'t define you. Your next innings is a fresh page.',time:'anytime',conditionKey:null},
  {id:'mr_010',category:'mental_reminder',title:'Confidence is built, not born',body:'Every session deposits confidence that you draw on in matches.',time:'anytime',conditionKey:null},
  {id:'mr_011',category:'mental_reminder',title:'Self-talk matters',body:'What you say to yourself between deliveries shapes your performance.',time:'anytime',conditionKey:null},
  {id:'mr_012',category:'mental_reminder',title:'Routines reduce anxiety',body:'A pre-ball routine anchors you in the present moment.',time:'anytime',conditionKey:null},
  {id:'mr_013',category:'mental_reminder',title:'Mental toughness session',body:'Open the mental training section. 10 minutes is enough.',time:'anytime',conditionKey:null},
  {id:'mr_014',category:'mental_reminder',title:'Focus drill reminder',body:'Your concentration window determines your ceiling as a cricketer.',time:'anytime',conditionKey:null},
  {id:'mr_015',category:'mental_reminder',title:'Fear of failure is normal',body:'Act despite it. That\'s what courage in cricket looks like.',time:'anytime',conditionKey:null},
  {id:'mr_016',category:'mental_reminder',title:'One ball at a time',body:'No match has ever been won or lost on a single ball. Stay present.',time:'anytime',conditionKey:null},
  {id:'mr_017',category:'mental_reminder',title:'Calm under pressure',body:'The most valuable skill in cricket. Practice it today.',time:'anytime',conditionKey:null},
  {id:'mr_018',category:'mental_reminder',title:'Mistake recovery drill',body:'Practice bouncing back from a bad ball. That skill wins matches.',time:'anytime',conditionKey:null},
  {id:'mr_019',category:'mental_reminder',title:'Pre-match mental prep',body:'Start your mental training routine before every practice session.',time:'anytime',conditionKey:'has_match_today'},
  {id:'mr_020',category:'mental_reminder',title:'Positive self-image',body:'See yourself as the cricketer you\'re becoming, not who you were.',time:'anytime',conditionKey:null},
  {id:'mr_021',category:'mental_reminder',title:'Breathe through the pressure',body:'Box breathing: 4 in, 4 hold, 4 out. Use it between balls.',time:'anytime',conditionKey:null},
  {id:'mr_022',category:'mental_reminder',title:'Trust your technique',body:'You\'ve trained it. In the match, trust it.',time:'anytime',conditionKey:null},
  {id:'mr_023',category:'mental_reminder',title:'Resilience is a muscle',body:'Every setback you train through makes you more resilient.',time:'anytime',conditionKey:null},
  {id:'mr_024',category:'mental_reminder',title:'Mental session: 5 minutes',body:'Even a short mental training session sharpens your focus.',time:'anytime',conditionKey:null},
  {id:'mr_025',category:'mental_reminder',title:'Champions have mental routines',body:'Do you have one? Build it in the mental training section.',time:'anytime',conditionKey:null},

  // ── fitness_reminder (25) ──────────────────────────────────────
  {id:'fr_001',category:'fitness_reminder',title:'Fitness day, {name}',body:'Cricket fitness is cricket-specific. Train accordingly.',time:'afternoon',conditionKey:null},
  {id:'fr_002',category:'fitness_reminder',title:'Workout time',body:'Your body is your equipment. Keep it sharp.',time:'afternoon',conditionKey:null},
  {id:'fr_003',category:'fitness_reminder',title:'Cricket strength workout',body:'Strong core. Fast feet. Explosive power. That\'s cricket fitness.',time:'afternoon',conditionKey:null},
  {id:'fr_004',category:'fitness_reminder',title:'Don\'t skip leg day',body:'Cricket is 80% lower body. Skipping legs is skipping cricket.',time:'afternoon',conditionKey:null},
  {id:'fr_005',category:'fitness_reminder',title:'Pre-season prep starts now',body:'The player who\'s fitter at the start of season wins the season.',time:'afternoon',conditionKey:null},
  {id:'fr_006',category:'fitness_reminder',title:'Recovery workout today',body:'Light mobility + stretching is training too. Count it.',time:'afternoon',conditionKey:null},
  {id:'fr_007',category:'fitness_reminder',title:'Fitness rank upgrade pending',body:'One more session gets you to the next rank. Go get it.',time:'afternoon',conditionKey:null},
  {id:'fr_008',category:'fitness_reminder',title:'Quick HIIT session?',body:'20 minutes of cricket HIIT. You have time.',time:'afternoon',conditionKey:null},
  {id:'fr_009',category:'fitness_reminder',title:'Endurance is wickets',body:'Fast bowlers and fielders who fade in the last 10 overs lose matches.',time:'afternoon',conditionKey:null},
  {id:'fr_010',category:'fitness_reminder',title:'Agility drills today',body:'Your feet in the field are just as important as your bat.',time:'afternoon',conditionKey:null},
  {id:'fr_011',category:'fitness_reminder',title:'Upper body strength',body:'Bat speed starts in the shoulders and back. Train them.',time:'afternoon',conditionKey:null},
  {id:'fr_012',category:'fitness_reminder',title:'Core is king',body:'Everything in cricket — batting, bowling, fielding — starts at the core.',time:'afternoon',conditionKey:null},
  {id:'fr_013',category:'fitness_reminder',title:'Flexibility session',body:'Injury prevention is performance optimization. Stretch today.',time:'afternoon',conditionKey:null},
  {id:'fr_014',category:'fitness_reminder',title:'Workout {workouts} incoming',body:'Keep the fitness streak alive alongside the cricket streak.',time:'afternoon',conditionKey:null},
  {id:'fr_015',category:'fitness_reminder',title:'Sprint training',body:'Cover drives are about footwork. Footwork is about sprint speed.',time:'afternoon',conditionKey:null},
  {id:'fr_016',category:'fitness_reminder',title:'Cricket conditioning',body:'Train the energy systems you use in a cricket match.',time:'afternoon',conditionKey:null},
  {id:'fr_017',category:'fitness_reminder',title:'Throwing shoulder strength',body:'Outfield throws from 60m need shoulder strength. Build it.',time:'afternoon',conditionKey:null},
  {id:'fr_018',category:'fitness_reminder',title:'Reaction time training',body:'React faster in the field. That starts with fitness.',time:'afternoon',conditionKey:null},
  {id:'fr_019',category:'fitness_reminder',title:'Today\'s fitness challenge',body:'Pick any workout under 30 minutes. Something beats nothing.',time:'afternoon',conditionKey:null},
  {id:'fr_020',category:'fitness_reminder',title:'Body weight circuit',body:'No gym? No problem. Bodyweight cricket circuits work just as well.',time:'afternoon',conditionKey:null},
  {id:'fr_021',category:'fitness_reminder',title:'Fitness = match time',body:'The fitter player plays more cricket. Simple equation.',time:'afternoon',conditionKey:null},
  {id:'fr_022',category:'fitness_reminder',title:'Strength session locked in?',body:'Your opponent is getting stronger. Are you?',time:'afternoon',conditionKey:null},
  {id:'fr_023',category:'fitness_reminder',title:'Cooldown counts',body:'Great session means nothing without a proper cooldown and stretch.',time:'afternoon',conditionKey:null},
  {id:'fr_024',category:'fitness_reminder',title:'Mobility is longevity',body:'The cricketers with long careers invest in mobility. Do the same.',time:'afternoon',conditionKey:null},
  {id:'fr_025',category:'fitness_reminder',title:'Fitness rank: {streak} sessions away',body:'Close the gap. One session at a time.',time:'afternoon',conditionKey:null},

  // ── evening_winddown (20) ──────────────────────────────────────
  {id:'ew_001',category:'evening_winddown',title:'End the day right, {name}',body:'A quick session before sleep closes the day like a champion.',time:'evening',conditionKey:null},
  {id:'ew_002',category:'evening_winddown',title:'Evening reflection',body:'Did you train today? If yes — you\'re building something real.',time:'evening',conditionKey:null},
  {id:'ew_003',category:'evening_winddown',title:'Tomorrow\'s session starts tonight',body:'Rest well. Eat well. Show up ready tomorrow.',time:'evening',conditionKey:null},
  {id:'ew_004',category:'evening_winddown',title:'Log your training tonight',body:'Review what you did today. Set tomorrow\'s intention.',time:'evening',conditionKey:null},
  {id:'ew_005',category:'evening_winddown',title:'Night session possible?',body:'Even 15 minutes of drills before bed keeps the streak alive.',time:'evening',conditionKey:null},
  {id:'ew_006',category:'evening_winddown',title:'Mental training before sleep',body:'Visualize tomorrow\'s practice session in detail. It works.',time:'evening',conditionKey:null},
  {id:'ew_007',category:'evening_winddown',title:'Streak check: day {streak}',body:'Is tonight\'s session logged? Don\'t forget to mark it done.',time:'evening',conditionKey:'has_streak'},
  {id:'ew_008',category:'evening_winddown',title:'Cricket wind-down',body:'Read, visualize, or review technique videos tonight.',time:'evening',conditionKey:null},
  {id:'ew_009',category:'evening_winddown',title:'Evening XP top-up',body:'There\'s still time for a quick mental training session.',time:'evening',conditionKey:null},
  {id:'ew_010',category:'evening_winddown',title:'Rest is training too',body:'Champions take recovery as seriously as practice. Rest tonight.',time:'evening',conditionKey:null},
  {id:'ew_011',category:'evening_winddown',title:'Schedule tomorrow now',body:'Add tomorrow\'s session to your schedule tonight.',time:'evening',conditionKey:null},
  {id:'ew_012',category:'evening_winddown',title:'Night owl training',body:'The late session is still a session. Show up for it.',time:'evening',conditionKey:null},
  {id:'ew_013',category:'evening_winddown',title:'Today\'s wins',body:'What did you learn today? That\'s your progress.',time:'evening',conditionKey:null},
  {id:'ew_014',category:'evening_winddown',title:'Pre-sleep visualization',body:'See yourself batting perfectly in tomorrow\'s session. In detail.',time:'evening',conditionKey:null},
  {id:'ew_015',category:'evening_winddown',title:'Last chance to train today',body:'Quick 10-minute session? Your streak will thank you.',time:'evening',conditionKey:null},
  {id:'ew_016',category:'evening_winddown',title:'Evening mental session',body:'Open the mental training section. Wind down the right way.',time:'evening',conditionKey:null},
  {id:'ew_017',category:'evening_winddown',title:'Great day of training',body:'You showed up today. Make tomorrow even better.',time:'evening',conditionKey:null},
  {id:'ew_018',category:'evening_winddown',title:'Prepare for tomorrow',body:'Pack your kit. Hydrate. Set the alarm. Be ready.',time:'evening',conditionKey:null},
  {id:'ew_019',category:'evening_winddown',title:'One more before bed?',body:'A short drill review session locks in today\'s learning.',time:'evening',conditionKey:null},
  {id:'ew_020',category:'evening_winddown',title:'Sleep well, champion',body:'Tomorrow, the crease is yours again. Rest up.',time:'evening',conditionKey:null},

  // ── match_day (20) ─────────────────────────────────────────────
  {id:'md_001',category:'match_day',title:'Match day, {name}! 🏏',body:'All that training — this is what it was for.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_002',category:'match_day',title:'Game day preparation',body:'Warm up early. Visualize your innings. Trust your training.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_003',category:'match_day',title:'Match day mindset',body:'Play your game. Back yourself. The preparation is done.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_004',category:'match_day',title:'Today is what training is for',body:'Every drill, every session — cashed in today.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_005',category:'match_day',title:'Pre-match mental prep',body:'10 minutes of visualization before your warm-up. Do it.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_006',category:'match_day',title:'Focus today, {name}',body:'One ball at a time. One over at a time. One session at a time.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_007',category:'match_day',title:'Game day rituals',body:'Follow your routine. Don\'t change what works.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_008',category:'match_day',title:'Trust the process',body:'You\'ve done the work. The result will reflect it.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_009',category:'match_day',title:'Back yourself today',body:'Confidence isn\'t arrogance — it\'s the result of preparation.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_010',category:'match_day',title:'Match day XP incoming',body:'Log your match performance tonight. Big XP awaits.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_011',category:'match_day',title:'Stay in the moment',body:'The scoreboard lies. Stay in the process, not the result.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_012',category:'match_day',title:'Warm up with intent',body:'Every warm-up ball is mental prep. Don\'t waste it.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_013',category:'match_day',title:'Read the conditions',body:'Check the pitch, the weather, the light. Adapt.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_014',category:'match_day',title:'Match day fuel',body:'Eat well this morning. Your brain needs fuel too.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_015',category:'match_day',title:'Last session before the match',body:'Light warm-up. Mental visualization. Then dominate.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_016',category:'match_day',title:'Settle the nerves',body:'Nerves mean you care. Channel them into focus.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_017',category:'match_day',title:'Match day: reset every ball',body:'Forget the last ball. Win the next one.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_018',category:'match_day',title:'Enjoy the game, {name}',body:'You\'ve earned the right to be here. Play freely.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_019',category:'match_day',title:'Game face on',body:'Competition time. All that prep leads here. Go.',time:'morning',conditionKey:'has_match_today'},
  {id:'md_020',category:'match_day',title:'This is your moment',body:'Belief + preparation + execution = elite cricket.',time:'morning',conditionKey:'has_match_today'},

  // ── wisdom (30) ───────────────────────────────────────────────
  {id:'wi_001',category:'wisdom',title:'Cricket wisdom',body:'"The harder I practice, the luckier I get." — Gary Player',time:'anytime',conditionKey:null},
  {id:'wi_002',category:'wisdom',title:'From the dressing room',body:'"Pressure is a privilege — it only comes to those who earn it."',time:'anytime',conditionKey:null},
  {id:'wi_003',category:'wisdom',title:'Pitch wisdom',body:'"The best way to get runs is to occupy the crease."',time:'anytime',conditionKey:null},
  {id:'wi_004',category:'wisdom',title:'On consistency',body:'"Champions aren\'t made in gyms. They\'re made from something deep inside."',time:'anytime',conditionKey:null},
  {id:'wi_005',category:'wisdom',title:'Sachin on preparation',body:'"When the going gets tough, the tough get going."',time:'anytime',conditionKey:null},
  {id:'wi_006',category:'wisdom',title:'On batting under pressure',body:'"The crease is my stage. The match is my performance."',time:'anytime',conditionKey:null},
  {id:'wi_007',category:'wisdom',title:'Process wisdom',body:'"Trust the process. Enjoy the journey."',time:'anytime',conditionKey:null},
  {id:'wi_008',category:'wisdom',title:'On fielding',body:'"Great fielding wins championships. Study the best fielders."',time:'anytime',conditionKey:null},
  {id:'wi_009',category:'wisdom',title:'Captain\'s wisdom',body:'"Lead by example, on and off the field."',time:'anytime',conditionKey:null},
  {id:'wi_010',category:'wisdom',title:'On bowling',body:'"A good bowler makes the batsman play. A great bowler makes them make mistakes."',time:'anytime',conditionKey:null},
  {id:'wi_011',category:'wisdom',title:'Cricket philosophy',body:'"Cricket is not a matter of life and death. It\'s more important than that."',time:'anytime',conditionKey:null},
  {id:'wi_012',category:'wisdom',title:'On practice',body:'"You can\'t think your way into good batting. You have to practice your way in."',time:'anytime',conditionKey:null},
  {id:'wi_013',category:'wisdom',title:'Mental toughness',body:'"Cricket is 40% physical and 60% mental. Work on both."',time:'anytime',conditionKey:null},
  {id:'wi_014',category:'wisdom',title:'On patience',body:'"The batting partnership that wins is the one that outlasts the bowling."',time:'anytime',conditionKey:null},
  {id:'wi_015',category:'wisdom',title:'On technique',body:'"Good technique is invisible. You only notice bad technique."',time:'anytime',conditionKey:null},
  {id:'wi_016',category:'wisdom',title:'On failure',body:'"Every duck in your career is a lesson about a delivery you hadn\'t faced before."',time:'anytime',conditionKey:null},
  {id:'wi_017',category:'wisdom',title:'From the pavilion',body:'"The best innings is the one the team needed, not the prettiest one."',time:'anytime',conditionKey:null},
  {id:'wi_018',category:'wisdom',title:'On the mental game',body:'"What the mind can conceive, the bat can achieve."',time:'anytime',conditionKey:null},
  {id:'wi_019',category:'wisdom',title:'On team cricket',body:'"Your personal glory is meaningless if the team loses. Play for the team."',time:'anytime',conditionKey:null},
  {id:'wi_020',category:'wisdom',title:'Old cricket wisdom',body:'"The pitch is a great leveller. Every match starts at 0-0."',time:'anytime',conditionKey:null},
  {id:'wi_021',category:'wisdom',title:'On resilience',body:'"A cricketer who\'s never been through adversity doesn\'t know what they\'re capable of."',time:'anytime',conditionKey:null},
  {id:'wi_022',category:'wisdom',title:'On simplicity',body:'"The best cricketers do the simple things brilliantly."',time:'anytime',conditionKey:null},
  {id:'wi_023',category:'wisdom',title:'On the game\'s lessons',body:'"Cricket teaches you how to handle success and failure — both are temporary."',time:'anytime',conditionKey:null},
  {id:'wi_024',category:'wisdom',title:'Partnership wisdom',body:'"A batting partnership is like a conversation. Communicate. Rotate. Build."',time:'anytime',conditionKey:null},
  {id:'wi_025',category:'wisdom',title:'On bowling spells',body:'"A great bowling spell begins in your warm-up, not at the bowling crease."',time:'anytime',conditionKey:null},
  {id:'wi_026',category:'wisdom',title:'On focus',body:'"One ball, one thought, one execution. Then reset."',time:'anytime',conditionKey:null},
  {id:'wi_027',category:'wisdom',title:'Match-day wisdom',body:'"The result is never decided until the last ball. Play every ball."',time:'anytime',conditionKey:null},
  {id:'wi_028',category:'wisdom',title:'The long game',body:'"Building a cricket career takes years. Building the habit takes 21 days."',time:'anytime',conditionKey:null},
  {id:'wi_029',category:'wisdom',title:'On watching great players',body:'"Watch how the best handle failure. That\'s the real lesson."',time:'anytime',conditionKey:null},
  {id:'wi_030',category:'wisdom',title:'Final wisdom',body:'"The game owes you nothing. You owe the game your best effort."',time:'anytime',conditionKey:null},

  // ── weekly_recap (15) ─────────────────────────────────────────
  {id:'wr_001',category:'weekly_recap',title:'Weekly recap time',body:'Open your progress page. See how far you\'ve come this week.',time:'evening',conditionKey:null},
  {id:'wr_002',category:'weekly_recap',title:'Your week in cricket',body:'{drills} drills. {workouts} workouts. {xp} XP. That\'s a real week.',time:'evening',conditionKey:null},
  {id:'wr_003',category:'weekly_recap',title:'End-of-week reflection',body:'What was your biggest improvement this week? Name it.',time:'evening',conditionKey:null},
  {id:'wr_004',category:'weekly_recap',title:'Week {days} complete',body:'Another week of consistent training. You\'re in the top tier.',time:'evening',conditionKey:null},
  {id:'wr_005',category:'weekly_recap',title:'Next week starts tonight',body:'Set three goals for next week. Commit to them now.',time:'evening',conditionKey:null},
  {id:'wr_006',category:'weekly_recap',title:'This week\'s XP haul',body:'You earned {xp} XP this week. What\'s the target for next week?',time:'evening',conditionKey:null},
  {id:'wr_007',category:'weekly_recap',title:'Streaks reviewed',body:'Current streak: {streak} days. Best ever? Check your profile.',time:'evening',conditionKey:null},
  {id:'wr_008',category:'weekly_recap',title:'Weekly summary: {name}',body:'Progress doesn\'t lie. Check yours.',time:'evening',conditionKey:null},
  {id:'wr_009',category:'weekly_recap',title:'Weekly drill count: {drills}',body:'Each drill completed is a technique refined.',time:'evening',conditionKey:null},
  {id:'wr_010',category:'weekly_recap',title:'Review your skill path progress',body:'How far through your skill path are you? Keep pushing.',time:'evening',conditionKey:'has_active_path'},
  {id:'wr_011',category:'weekly_recap',title:'Your rank this week',body:'Did you move up the fitness rank? Check the Fitness Builder.',time:'evening',conditionKey:null},
  {id:'wr_012',category:'weekly_recap',title:'Week summary pending',body:'Log this week\'s highlights before you forget.',time:'evening',conditionKey:null},
  {id:'wr_013',category:'weekly_recap',title:'Weekly win to celebrate',body:'What\'s the one thing you did really well this week? Own it.',time:'evening',conditionKey:null},
  {id:'wr_014',category:'weekly_recap',title:'Week done, {name}',body:'You showed up. You trained. You improved. Week complete.',time:'evening',conditionKey:null},
  {id:'wr_015',category:'weekly_recap',title:'Plan next week now',body:'Open the Schedule. Block your sessions for next week tonight.',time:'evening',conditionKey:null},

  // ── skill_progress (20) ───────────────────────────────────────
  {id:'sp_001',category:'skill_progress',title:'Skill path check-in',body:'How\'s your current path going? Open Skill Paths to see.',time:'anytime',conditionKey:'has_active_path'},
  {id:'sp_002',category:'skill_progress',title:'Level up incoming',body:'A few more sessions and you level up your cricket rank.',time:'anytime',conditionKey:null},
  {id:'sp_003',category:'skill_progress',title:'New skills unlocking soon',body:'Keep pushing the current path. New techniques are just ahead.',time:'anytime',conditionKey:'has_active_path'},
  {id:'sp_004',category:'skill_progress',title:'Batting skill building',body:'Every drill adds depth to your batting arsenal.',time:'anytime',conditionKey:null},
  {id:'sp_005',category:'skill_progress',title:'Skill path milestone near',body:'You\'re close to completing a phase. Finish strong.',time:'anytime',conditionKey:'has_active_path'},
  {id:'sp_006',category:'skill_progress',title:'Cricket DNA update',body:'Your skill profile is changing with every session. Check it.',time:'anytime',conditionKey:null},
  {id:'sp_007',category:'skill_progress',title:'Path completion tracking',body:'Complete your skill path before starting another. Depth first.',time:'anytime',conditionKey:'has_active_path'},
  {id:'sp_008',category:'skill_progress',title:'Assessment time?',body:'When did you last assess your skills? Your baseline may have shifted.',time:'anytime',conditionKey:null},
  {id:'sp_009',category:'skill_progress',title:'Skills compound like interest',body:'Early skill building pays dividends for years. Stay the course.',time:'anytime',conditionKey:null},
  {id:'sp_010',category:'skill_progress',title:'Your weak areas are opportunities',body:'Work on what\'s hard. That\'s where the biggest gains are.',time:'anytime',conditionKey:null},
  {id:'sp_011',category:'skill_progress',title:'New skill unlocked?',body:'Check your skill paths. You may have earned a new badge.',time:'anytime',conditionKey:null},
  {id:'sp_012',category:'skill_progress',title:'Bowling path: next session',body:'Consistency in bowling paths builds consistent bowling.',time:'anytime',conditionKey:null},
  {id:'sp_013',category:'skill_progress',title:'Technique refinement mode',body:'This week, refine one specific technique. Do it deliberately.',time:'anytime',conditionKey:null},
  {id:'sp_014',category:'skill_progress',title:'Skill score update',body:'Your Cricket DNA score updates with every completed session.',time:'anytime',conditionKey:null},
  {id:'sp_015',category:'skill_progress',title:'Multi-skill development',body:'Balance batting, bowling, and fielding skill development.',time:'anytime',conditionKey:null},
  {id:'sp_016',category:'skill_progress',title:'Path halfway point',body:'Halfway through your path. The second half is where mastery begins.',time:'anytime',conditionKey:'has_active_path'},
  {id:'sp_017',category:'skill_progress',title:'Skill path: final push',body:'Almost done with this path. One last effort to complete it.',time:'anytime',conditionKey:'has_active_path'},
  {id:'sp_018',category:'skill_progress',title:'Your progress is real',body:'{xp} XP and counting. You\'re building a real skill portfolio.',time:'anytime',conditionKey:null},
  {id:'sp_019',category:'skill_progress',title:'Skills don\'t fade',body:'Every technique you\'ve learned is permanently in your arsenal.',time:'anytime',conditionKey:null},
  {id:'sp_020',category:'skill_progress',title:'Next level is close',body:'Keep grinding the current phase. Level-up is just sessions away.',time:'anytime',conditionKey:null},

  // ── random_motivator (25) ─────────────────────────────────────
  {id:'rm_001',category:'random_motivator',title:'You\'ve got this, {name}',body:'Whatever the session — batting, fitness, mental — you\'re ready for it.',time:'anytime',conditionKey:null},
  {id:'rm_002',category:'random_motivator',title:'Crick believes in you',body:'Your cricket journey is unique. Keep writing it.',time:'anytime',conditionKey:null},
  {id:'rm_003',category:'random_motivator',title:'One more rep',body:'When your mind says stop, your body is usually at 40%. Go again.',time:'anytime',conditionKey:null},
  {id:'rm_004',category:'random_motivator',title:'You\'re getting better',body:'Progress is happening even when you can\'t see it.',time:'anytime',conditionKey:null},
  {id:'rm_005',category:'random_motivator',title:'Elite mindset check',body:'Am I doing what an elite cricketer would do right now?',time:'anytime',conditionKey:null},
  {id:'rm_006',category:'random_motivator',title:'Today is a gift',body:'Use it for something that makes you a better cricketer.',time:'anytime',conditionKey:null},
  {id:'rm_007',category:'random_motivator',title:'You chose cricket',body:'Cricket chose you too. Honor that by showing up.',time:'anytime',conditionKey:null},
  {id:'rm_008',category:'random_motivator',title:'The sessions add up',body:'You don\'t notice the growth daily. But over months, it\'s remarkable.',time:'anytime',conditionKey:null},
  {id:'rm_009',category:'random_motivator',title:'Hard days make you harder',body:'Today\'s tough session is tomorrow\'s advantage.',time:'anytime',conditionKey:null},
  {id:'rm_010',category:'random_motivator',title:'Train like the team needs you',body:'Because it does.',time:'anytime',conditionKey:null},
  {id:'rm_011',category:'random_motivator',title:'Every professional was once a beginner',body:'The distance between you and your cricket goals is sessions.',time:'anytime',conditionKey:null},
  {id:'rm_012',category:'random_motivator',title:'Legacy is built session by session',body:'What cricket story are you writing with your training?',time:'anytime',conditionKey:null},
  {id:'rm_013',category:'random_motivator',title:'Comparison kills progress',body:'Your only competition is who you were last month.',time:'anytime',conditionKey:null},
  {id:'rm_014',category:'random_motivator',title:'The compound effect is real',body:'Small daily improvements = massive long-term results.',time:'anytime',conditionKey:null},
  {id:'rm_015',category:'random_motivator',title:'Character is built in practice',body:'How you train when no one is watching defines who you are.',time:'anytime',conditionKey:null},
  {id:'rm_016',category:'random_motivator',title:'You\'re already ahead',body:'Most people won\'t train today. You already are.',time:'anytime',conditionKey:null},
  {id:'rm_017',category:'random_motivator',title:'Cricket needs you at your best',body:'Invest in yourself. The game gets richer.',time:'anytime',conditionKey:null},
  {id:'rm_018',category:'random_motivator',title:'The pitch respects preparation',body:'Show up prepared. The results follow.',time:'anytime',conditionKey:null},
  {id:'rm_019',category:'random_motivator',title:'Train with purpose',body:'Every session should have a goal. What\'s yours today?',time:'anytime',conditionKey:null},
  {id:'rm_020',category:'random_motivator',title:'Ordinary inputs, extraordinary outputs',body:'Train every day. In six months, you won\'t recognise your cricket.',time:'anytime',conditionKey:null},
  {id:'rm_021',category:'random_motivator',title:'Show up for yourself',body:'On the days you don\'t feel like it, those are the sessions that matter most.',time:'anytime',conditionKey:null},
  {id:'rm_022',category:'random_motivator',title:'Your best cricket is ahead',body:'You haven\'t played your best innings yet. That\'s exciting.',time:'anytime',conditionKey:null},
  {id:'rm_023',category:'random_motivator',title:'Growth happens in discomfort',body:'If it\'s easy, you\'re not growing. Push harder today.',time:'anytime',conditionKey:null},
  {id:'rm_024',category:'random_motivator',title:'Dedication is a daily choice',body:'Choose it again today. And tomorrow. And the day after.',time:'anytime',conditionKey:null},
  {id:'rm_025',category:'random_motivator',title:'This is your cricket story',body:'Make it worth telling.',time:'anytime',conditionKey:null},
];

// ── Condition checks ─────────────────────────────────────────────
var CONDITIONS = {
  has_streak: function(u) { return (u.streak || 0) >= 1; },
  streak_3:   function(u) { return (u.streak || 0) >= 3; },
  streak_7:   function(u) { return (u.streak || 0) >= 7; },
  streak_14:  function(u) { return (u.streak || 0) >= 14; },
  missed_yesterday: function(u) { return u.missedYesterday === true; },
  has_match_today:  function(u) { return u.hasMatchToday === true; },
  no_streak:        function(u) { return (u.streak || 0) === 0; },
  has_active_path:  function(u) { return !!u.hasActivePath; },
};

// ── Personalise tokens ───────────────────────────────────────────
function personalize(str, userData) {
  if (!str) return str;
  return str
    .replace(/\{name\}/g,     userData.name     || 'Champion')
    .replace(/\{streak\}/g,   String(userData.streak   || 0))
    .replace(/\{drills\}/g,   String(userData.drills   || 0))
    .replace(/\{workouts\}/g, String(userData.workouts || 0))
    .replace(/\{xp\}/g,       String(userData.xp       || 0))
    .replace(/\{days\}/g,     String(userData.days     || 0));
}
A.CrickNotif.personalize = personalize;

// ── Build userData from DB ────────────────────────────────────────
function buildUserData() {
  if (!A.DB) return {};
  var user = A.DB.getUser() || {};
  var prog = A.DB.getProgress() || {};
  var sched = A.DB.getSchedule ? A.DB.getSchedule() : {};
  var today = new Date().toISOString().slice(0, 10);
  var yest  = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Missed yesterday check
  var missedYesterday = false;
  if (prog.last_active_date && prog.last_active_date < yest) missedYesterday = true;

  // Has match today check
  var hasMatchToday = false;
  if (sched.sessions) {
    hasMatchToday = sched.sessions.some(function(s) {
      return s.date === today && s.type === 'match';
    });
  }

  // Active skill path
  var hasActivePath = false;
  try {
    var paths = A.DB.get('skill_path_progress');
    if (paths) hasActivePath = Object.values(paths).some(function(p) { return p && !p.complete; });
  } catch(e) {}

  return {
    name:             user.name || 'Champion',
    streak:           prog.current_streak || 0,
    drills:           Object.keys(prog.drill_completions || {}).length,
    workouts:         prog.workouts_done || 0,
    xp:               prog.total_xp || 0,
    days:             prog.total_days || 0,
    missedYesterday:  missedYesterday,
    hasMatchToday:    hasMatchToday,
    hasActivePath:    hasActivePath,
  };
}
A.CrickNotif._buildUserData = buildUserData;

// ── Filter notifications by condition ────────────────────────────
function eligibleNotifs(userData) {
  return NOTIFICATIONS.filter(function(n) {
    if (!n.conditionKey) return true;
    var check = CONDITIONS[n.conditionKey];
    return check ? check(userData) : true;
  });
}

// ── Pick 3-5 notifications for the day ───────────────────────────
var DAILY_SLOTS = [
  { key: 'morning',   hour: 7,  minute: 30 },
  { key: 'anytime1',  hour: 10, minute: 0  },
  { key: 'afternoon', hour: 14, minute: 0  },
  { key: 'anytime2',  hour: 17, minute: 30 },
  { key: 'evening',   hour: 20, minute: 0  },
];

function pickForSlot(slot, pool, usedIds) {
  var timeMatch = pool.filter(function(n) {
    if (usedIds[n.id]) return false;
    if (slot.key.startsWith('anytime')) return n.time === 'anytime';
    return n.time === slot.key || n.time === 'anytime';
  });
  if (!timeMatch.length) return null;
  var idx = Math.floor(Math.random() * timeMatch.length);
  return timeMatch[idx];
}

// ── Main schedule function ────────────────────────────────────────
function schedule(userData) {
  try {
    if (!A.DB) return;
    var today = new Date().toISOString().slice(0, 10);
    var queueKey = 'crick_notif_queue';
    var existing = A.DB.get(queueKey);
    if (existing && existing.date === today) return; // already scheduled today

    var pool = eligibleNotifs(userData || buildUserData());
    var count = 3 + Math.floor(Math.random() * 3); // 3-5
    var queue = [];
    var usedIds = {};

    for (var i = 0; i < Math.min(count, DAILY_SLOTS.length); i++) {
      var notif = pickForSlot(DAILY_SLOTS[i], pool, usedIds);
      if (notif) {
        usedIds[notif.id] = true;
        var now = new Date();
        var slot = DAILY_SLOTS[i];
        var fireAt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot.hour, slot.minute, 0, 0);
        if (fireAt.getTime() > Date.now() + 60000) { // only schedule future slots
          queue.push({ notifId: notif.id, fireAt: fireAt.getTime() });
          // Set timeout for this notification
          (function(n, delay) {
            setTimeout(function() {
              A.CrickNotif.fire(n.id, A.CrickNotif._buildUserData());
            }, delay);
          })(notif, fireAt.getTime() - Date.now());
        }
      }
    }

    A.DB.set(queueKey, { date: today, queue: queue });
    console.log('[CrickNotif] Scheduled ' + queue.length + ' notifications for today');
  } catch(e) {
    console.warn('[CrickNotif] schedule error:', e);
  }
}
A.CrickNotif.schedule = schedule;

// ── Fire a notification ───────────────────────────────────────────
function fire(notifId, userData) {
  try {
    var notif = NOTIFICATIONS.find(function(n) { return n.id === notifId; });
    if (!notif) return;
    var ud = userData || buildUserData();
    var title = personalize(notif.title, ud);
    var body  = personalize(notif.body,  ud);

    // Post to service worker
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type:     'SC_CRICK_NOTIF',
        title:    title,
        body:     body,
        category: notif.category,
        url:      '/#/Crick',
      });
    }
  } catch(e) {
    console.warn('[CrickNotif] fire error:', e);
  }
}
A.CrickNotif.fire = fire;

// ── Permission request + scheduling toggle ───────────────────────
A.CrickNotif.isEnabled = function() {
  return !!(A.DB && A.DB.get('crick_notif_enabled'));
};

A.CrickNotif.requestPermission = function() {
  return new Promise(function(resolve) {
    if (!('Notification' in window)) { resolve(false); return; }
    Notification.requestPermission().then(function(perm) {
      var granted = perm === 'granted';
      if (A.DB) A.DB.set('crick_notif_enabled', granted);
      if (granted) {
        if (navigator.serviceWorker && navigator.serviceWorker.ready) {
          navigator.serviceWorker.ready.then(function(reg) {
            if (reg.pushManager && reg.pushManager.subscribe) {
              reg.pushManager.getSubscription().then(function(existing) {
                if (existing) { if (A.DB) A.DB.set('crick_push_subscription', existing.toJSON ? existing.toJSON() : existing); return; }
                reg.pushManager.subscribe({ userVisibleOnly: true }).then(function(sub) {
                  if (A.DB) A.DB.set('crick_push_subscription', sub.toJSON ? sub.toJSON() : sub);
                }).catch(function() {});
              }).catch(function() {});
            }
          }).catch(function() {});
        }
        schedule(buildUserData());
      }
      resolve(granted);
    }).catch(function() { resolve(false); });
  });
};

A.CrickNotif.disable = function() {
  if (A.DB) A.DB.set('crick_notif_enabled', false);
};

console.log('[SC] app-crick-notifications.js v1.0 — 310 notifications ready');
})();
