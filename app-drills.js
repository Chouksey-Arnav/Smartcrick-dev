// Save as: app-drills.js
// ================================================================
// SmartCrick — Cricket Drills v4.0
// COMPLETE REWRITE — fixes drills not visible bug
// • All 35 drills rendered in filterable grid
// • YouTube video player per drill
// • Search + category filter
// • Drill detail page with full instructions
// • XP tracking per drill
// • Integrated audio/video
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var A = window.SC_APP;
var DB = A.DB;
var nav = A.nav;
var awardXP = A.awardXP;

// ── COMPLETE DRILL DATA (35 drills) ─────────────────────────────
var DRILLS = [
  // ── BATTING (12 drills) ────────────────────────────────────────
  {
    id: 'bat-cover-drive', category: 'batting', name: 'Cover Drive Mastery',
    level: 'intermediate', xp: 85, duration: '20 min', icon: '🏏',
    tagline: 'The most elegant shot in cricket',
    focus: ['footwork','timing','bat angle'],
    equipment: ['bat', 'ball', 'tee (optional)'],
    steps: [
      'Start in a balanced stance — feet shoulder-width, weight slightly forward',
      'Watch the ball from the bowler\'s hand, not from the pitch',
      'Lead with front elbow high as you step towards the pitch of the ball',
      'Drive through the line, bat face angling to cover region',
      'Full follow-through — bat finishing high over left shoulder',
      'Hold the position for 2 seconds and check your balance',
    ],
    keyPoints: ['Head still at point of contact','Front elbow drives the shot','Weight transfers fully to front foot'],
    commonMistakes: ['Reaching for the ball instead of moving feet','Closing the bat face too early','Not following through fully'],
    videoId: 'yeImrfgNJoM',
    videoTitle: 'DRIVE Like a Pro — Full Cover Drive Technique + Drills',
    videoChannel: 'B3 Cricket',
  },
  {
    id: 'bat-defensive-block', category: 'batting', name: 'Defensive Block',
    level: 'beginner', xp: 60, duration: '15 min', icon: '🛡️',
    tagline: 'The foundation of every great innings',
    focus: ['defence','patience','head position'],
    equipment: ['bat', 'ball'],
    steps: [
      'Set up with a solid, balanced stance — eyes level',
      'Pick up the bat straight on the back swing',
      'Step into line with the ball — head leading',
      'Present a soft, angled bat face downward',
      'Let the ball hit the middle of the bat and die — no force',
      'Watch the ball all the way onto the bat face',
    ],
    keyPoints: ['Soft hands absorb the pace','Bat angle directs ball safely to ground','Head stays still through contact'],
    commonMistakes: ['Hard hands cause edges','Poor footwork leaves a gap between bat and pad','Looking away from ball too early'],
    videoId: '9X8jz17WNDI',
    videoTitle: 'Forward Defence — Perfect Technique Masterclass',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'bat-pull-shot', category: 'batting', name: 'Pull Shot',
    level: 'intermediate', xp: 90, duration: '20 min', icon: '💥',
    tagline: 'Dominate the short ball',
    focus: ['back foot','rotation','power'],
    equipment: ['bat', 'ball', 'bowling machine (optional)'],
    steps: [
      'Initial trigger movement — step back and across towards off stump',
      'Pick up the length early — see the short ball as it leaves the hand',
      'Weight goes back, back foot plants behind the crease',
      'Rise with the ball — get on top of it, never under it',
      'Rotate hips fully — front hip drives through',
      'Extend both arms through contact for maximum power',
    ],
    keyPoints: ['Get on top of the ball (not under it)','Hip rotation generates all the power','Keep head level — don\'t fall back'],
    commonMistakes: ['Getting under the ball → catch to fine leg','Not rotating hips → no power','Playing too early → leading edge'],
    videoId: 'EZPxOjLLCkU',
    videoTitle: 'Master the Pull Shot — 4 Key Techniques',
    videoChannel: 'B3 Cricket',
  },
  {
    id: 'bat-sweep-shot', category: 'batting', name: 'Sweep Shot',
    level: 'intermediate', xp: 80, duration: '20 min', icon: '🌀',
    tagline: 'Neutralise spinners and score freely',
    focus: ['front knee','bat angle','wrist'],
    equipment: ['bat', 'ball', 'spinner (or feeder)'],
    steps: [
      'Read the line and length early — sweep only to balls on middle or leg',
      'Large front foot stride down the pitch towards ball',
      'Drop front knee towards ground as you go down to the ball',
      'Bat swings horizontal — lead with top hand rolling over',
      'Contact ball between thigh and shoulder height',
      'Follow through around the body — wrists rolling over top',
    ],
    keyPoints: ['Front knee close to ground = best balance','Roll top wrist to keep ball down','Play to good length deliveries only'],
    commonMistakes: ['Sweeping to full tosses → top edge','Not getting down low enough','Playing across a straight ball → LBW'],
    videoId: 'jqtaBMD7Wa8',
    videoTitle: 'Slog Sweep & Sweep Masterclass — Tom Banton',
    videoChannel: 'Kookaburra Sport',
  },
  {
    id: 'bat-cut-shot', category: 'batting', name: 'Cut Shot',
    level: 'intermediate', xp: 80, duration: '20 min', icon: '✂️',
    tagline: 'Punish anything short and wide',
    focus: ['back foot','width','wrist'],
    equipment: ['bat', 'ball'],
    steps: [
      'Pick up the width early — trigger back and across to off stump',
      'Step back onto the back foot, creating space and width',
      'Let the ball come to you — don\'t reach for it',
      'Arms extend through the ball — lead with top hand',
      'Open the face slightly to cut backward of point',
      'Stay in control — this is a placement shot, not a slog',
    ],
    keyPoints: ['Let ball come to you = timing, not power','Back foot behind crease = space to play','Wrist stays firm through contact'],
    commonMistakes: ['Playing too early → leading edge','Reaching across body → no control','Playing to balls too close to body'],
    videoId: '3v2jFBzgfrQ',
    videoTitle: 'Cut Shot — Complete Cricket Tutorial',
    videoChannel: 'Cricket Coach 360',
  },
  {
    id: 'bat-straight-drive', category: 'batting', name: 'Straight Drive',
    level: 'beginner', xp: 70, duration: '15 min', icon: '⬆️',
    tagline: 'Drive through the V between mid-on and mid-off',
    focus: ['alignment','timing','follow-through'],
    equipment: ['bat', 'ball or tee'],
    steps: [
      'Identify the full delivery — pitched up, on or just outside off stump',
      'Stride forward with front foot pointing down the pitch',
      'Head leads the movement, eyes level and fixed on the ball',
      'Swing bat straight through — follow the line of the ball',
      'Contact just below the eyeline for drives',
      'High follow-through finishing over the left shoulder',
    ],
    keyPoints: ['Bat swings in a straight arc — no deviation','Head still at point of contact','Weight fully on front foot at contact'],
    commonMistakes: ['Closing bat face → ball goes to on side','Reaching for ball → no weight transfer','Short follow-through → no timing'],
    videoId: 'yeImrfgNJoM',
    videoTitle: 'Front Foot Drive — Full Technique Breakdown',
    videoChannel: 'B3 Cricket',
  },
  {
    id: 'bat-hook-shot', category: 'batting', name: 'Hook Shot',
    level: 'advanced', xp: 100, duration: '25 min', icon: '🪝',
    tagline: 'Attack the bouncer and score',
    focus: ['reaction','back foot','aerial'],
    equipment: ['bat', 'ball', 'bowling machine recommended'],
    steps: [
      'Read short ball early — look for anything rising above shoulder height',
      'Rapid back-foot pivot — swivel on back foot to face fine leg',
      'Body fully rotates — chest turning through the shot',
      'Arms swing horizontal, pulling ball behind square on leg side',
      'Keep head inside the line — don\'t lose sight of the ball',
      'Watch ball carefully — control the aerial trajectory',
    ],
    keyPoints: ['Only hook balls above shoulder height','Head stays upright — don\'t duck down','Roll wrists over to keep ball down'],
    commonMistakes: ['Hooking balls at chest height → top edge','Not swiveling fully → no power','Losing sight of ball → miss or edge'],
    videoId: 'NE6LRa9dKG8',
    videoTitle: 'Hook Shot & Short Ball Mastery',
    videoChannel: 'Cricket Mentor',
  },
  {
    id: 'bat-on-drive', category: 'batting', name: 'On Drive',
    level: 'advanced', xp: 95, duration: '25 min', icon: '↖️',
    tagline: 'The hardest drive — master the on side',
    focus: ['leg side','rotation','timing'],
    equipment: ['bat', 'ball'],
    steps: [
      'Pick full ball on leg stump — most common from left-arm over the wicket',
      'Large front foot stride — angled towards mid-on',
      'Allow ball to come deeper into the body before striking',
      'Rotate hips and chest through the shot — full body turn',
      'Bat face closes through contact — ball goes between mid-on and square leg',
      'High follow-through — bat finishes over right shoulder',
    ],
    keyPoints: ['Don\'t play early — wait for ball to come to you','Hips and chest rotate fully','Head stays over the ball throughout'],
    commonMistakes: ['Playing early → goes to mid-on','No hip rotation → no power','Bat face stays open → ball goes to mid-off'],
    videoId: 'yeImrfgNJoM',
    videoTitle: 'On Drive & Straight Drive Masterclass',
    videoChannel: 'B3 Cricket',
  },
  {
    id: 'bat-back-foot-defence', category: 'batting', name: 'Back Foot Defence',
    level: 'beginner', xp: 65, duration: '15 min', icon: '🔙',
    tagline: 'Solid defence on the back foot',
    focus: ['back foot','head position','soft hands'],
    equipment: ['bat', 'ball'],
    steps: [
      'Read the back of a length delivery — shorter, rising',
      'Step back and across to off stump — create space',
      'Weight shifts to back foot — stay balanced, don\'t fall over',
      'Get into line — head and eyes level with delivery',
      'Present soft, angled bat face down towards ground',
      'Absorb pace with soft hands — ball dies in front of you',
    ],
    keyPoints: ['Never "hard hand" a back foot defensive shot','Get in line — don\'t play around the body','Soft top hand controls angle'],
    commonMistakes: ['Hard hands → ball pops up for catch','Falling across off stump → exposed leg stump','Playing with feet still — no back-foot movement'],
    videoId: 'RXyH89JX2QM',
    videoTitle: 'Back Foot Defence — Test Fundamentals',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'bat-vs-spin', category: 'batting', name: 'Batting vs Spin',
    level: 'intermediate', xp: 90, duration: '25 min', icon: '🌀',
    tagline: 'Read spin, use feet, and attack',
    focus: ['footwork','reading spin','decision making'],
    equipment: ['bat', 'ball', 'spin bowling partner'],
    steps: [
      'Pre-set: stand slightly outside crease to limit LBW risk',
      'Trigger: small step back and across to read length',
      'Read the flight — shorter = go back, full = use feet',
      'Against off-spin: play straight or with the turn (covers)',
      'Against leg-spin: sweep or reverse sweep low-risk options',
      'Use feet: come down pitch to full deliveries to turn full toss',
    ],
    keyPoints: ['Play the ball not the spin — watch the seam','Use crease position to combat LBW','Sweep only on middle or leg stump line'],
    commonMistakes: ['Playing across straight balls → LBW','Not using feet → spinners bowl to you','Second-guessing turn → late contact'],
    videoId: 'RxIGMIbgD88',
    videoTitle: 'Batting Against Spin — Ian Bell Masterclass',
    videoChannel: 'Sportplan Cricket',
  },
  {
    id: 'bat-t20-hitting', category: 'batting', name: 'T20 Power Hitting',
    level: 'advanced', xp: 110, duration: '30 min', icon: '💣',
    tagline: 'Score at 200 — elite T20 striking',
    focus: ['power','position','shot selection'],
    equipment: ['bat', 'ball', 'tee or feeder'],
    steps: [
      'Widen stance for a bigger base and more rotational power',
      'Look to hit the first ball of every session — intent matters',
      'Pre-meditate shots against specific bowlers',
      'Use your bottom hand for power shots — top hand guides',
      'Maximise bat speed through contact — full extension of arms',
      'Ramp/scoop practice: 10 ramps over wicketkeeper per session',
    ],
    keyPoints: ['Intent beats technique in T20','Full arm extension = maximum bat speed','Back foot gives you more time and options'],
    commonMistakes: ['Pre-meditating on wrong length','Under-rotating on slog shots','Playing with fear of getting out'],
    videoId: 'jqtaBMD7Wa8',
    videoTitle: 'White Ball Batting — Tom Banton Masterclass',
    videoChannel: 'Kookaburra Sport',
  },
  {
    id: 'bat-leave-shot', category: 'batting', name: 'The Leave',
    level: 'beginner', xp: 55, duration: '10 min', icon: '🙅',
    tagline: 'The most underrated skill — leaving well',
    focus: ['decision making','head position','patience'],
    equipment: ['bat', 'ball'],
    steps: [
      'Eyes track ball from hand to pitch — read line immediately',
      'Decide early: anything outside off, pitching away = leave',
      'Hands stay inside the line — bat points down, not away from body',
      'Head stays still — eyes follow ball through to keeper',
      'No movement of feet past pointing at ball',
      'Reset trigger after every leave — stay compact',
    ],
    keyPoints: ['Leave = a scoring opportunity denied — not a failure','Bat must stay behind the line of the body','Watch ball onto keeper gloves'],
    commonMistakes: ['Pushing at balls outside off stump','Hands going towards ball on the leave','Not resetting between deliveries'],
    videoId: '9X8jz17WNDI',
    videoTitle: 'The Leave — When and How to Let the Ball Go',
    videoChannel: 'CoachCricXI',
  },

  // ── BOWLING (12 drills) ────────────────────────────────────────
  {
    id: 'bowl-outswing', category: 'bowling', name: 'Outswing Bowling',
    level: 'intermediate', xp: 90, duration: '20 min', icon: '🌊',
    tagline: 'Move the ball away from the right-hander',
    focus: ['seam position','wrist','release'],
    equipment: ['ball (new or used)', 'stumps', 'cones'],
    steps: [
      'Grip: index and middle fingers together along seam on top',
      'Thumb on seam below, ring finger tucked away',
      'Seam angled slightly towards slip fielder at release',
      'Wrist stays behind the ball — don\'t collapse inward',
      'Bowl a full, attacking length — outside off stump corridor',
      'Consistent release: 200 balls per week minimum',
    ],
    keyPoints: ['Seam must stay upright throughout flight','High release point creates more swing','Newer ball swings more — use wisely'],
    commonMistakes: ['Seam falling over sideways → no swing','Wrist going around the ball → inswing','Bowling short → no opportunity for swing'],
    videoId: 'HV2sT8Xc5Kw',
    videoTitle: 'Outswing Bowling — Grip, Seam & Action',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'bowl-inswing', category: 'bowling', name: 'Inswing Bowling',
    level: 'intermediate', xp: 90, duration: '20 min', icon: '🔄',
    tagline: 'Swing the ball into the right-hander',
    focus: ['seam position','wrist angle','length'],
    equipment: ['ball', 'stumps', 'cones'],
    steps: [
      'Grip: seam angled towards fine leg at release',
      'Index and middle fingers slightly spread for inswing',
      'Wrist tilts inward at point of release',
      'Bowl a fuller length — hitting stumps line',
      'Shiny side of ball on the off side to enhance inswing',
      'Aim at the top of off stump — most dangerous line',
    ],
    keyPoints: ['Seam angled towards fine leg = inswing','Shiny side placement amplifies movement','Bowl straighter — not as much corridor as outswing'],
    commonMistakes: ['Seam not angled consistently','Going short — ball straightens out','Not using the shiny side correctly'],
    videoId: 'JRZD7Jk8wuI',
    videoTitle: 'Inswing Bowling Masterclass',
    videoChannel: 'Cricket Mentor',
  },
  {
    id: 'bowl-yorker', category: 'bowling', name: 'Death Yorker',
    level: 'advanced', xp: 110, duration: '25 min', icon: '🎯',
    tagline: 'The most lethal T20 delivery',
    focus: ['accuracy','full length','toe line'],
    equipment: ['ball', 'stumps', 'cones at base of stumps'],
    steps: [
      'Set up cones at the base of the stumps — this is your target zone',
      'Mental cue: "pitch it AT the toes, not near the toes"',
      'Wrist stays high — don\'t drop head at release',
      'Follow through completely — don\'t slow down approaching crease',
      'Practice: 20 yorkers in a row, counting consecutive hits',
      'Progress: bowl yorkers from a full run-up at match pace',
    ],
    keyPoints: ['Target: base of stumps, not the bat','Full run-up speed = same accuracy target','Best executed after bouncer or slower ball set-up'],
    commonMistakes: ['Bowling half-tracker trying too hard','Slowing down approach → loses accuracy','Only practicing yorkers, not in sequences'],
    videoId: 'gbEBe3quvBI',
    videoTitle: 'Perfect Yorker — Death Bowling Masterclass',
    videoChannel: 'Donovan Miller Cricket',
  },
  {
    id: 'bowl-off-spin', category: 'bowling', name: 'Off Spin Bowling',
    level: 'intermediate', xp: 85, duration: '20 min', icon: '🔁',
    tagline: 'Turn it square from right-arm over',
    focus: ['grip','spin','flight'],
    equipment: ['ball', 'stumps', 'target markers'],
    steps: [
      'Grip: index finger along seam on top, middle finger beside it',
      'Ball rests on the first joint — not palm, not fingertips',
      'Spinning action: index finger pulls down sharply at release',
      'High action creates bounce and dip',
      'Flight the ball — let it drift then dip',
      'Target: landing on off stump, turning to hit leg stump',
    ],
    keyPoints: ['Rip the ball with the index finger — don\'t flip it','High action = more revs = more turn','Give the ball air — flight is your biggest weapon'],
    commonMistakes: ['Ball in palm → no spin imparted','Flat trajectory → batter plays with confidence','Bowling too short → no flight, no danger'],
    videoId: 'kZq8V0EMfS4',
    videoTitle: 'Off Spin — Grip to Variations Complete Guide',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'bowl-leg-spin', category: 'bowling', name: 'Leg Spin Bowling',
    level: 'advanced', xp: 120, duration: '30 min', icon: '🌀',
    tagline: 'The hardest and most potent art in cricket',
    focus: ['wrist position','turn','variations'],
    equipment: ['ball', 'stumps', 'cones'],
    steps: [
      'Grip: ball sits in top joint of index and middle fingers',
      'Ring finger is the spinner — it flicks the ball at release',
      'Wrist: cocked at top, rolls from 12 o\'clock to 3 o\'clock',
      'Land on or outside off stump — turn hitting middle/leg',
      'Practice stock ball until it turns consistently before adding variations',
      'Googly: same action, wrist rolls further to 4-5 o\'clock',
    ],
    keyPoints: ['Stock ball first — 5,000 before trying variations','Wrist position determines the direction of turn','Flight and loop are NOT optional — they\'re your best weapon'],
    commonMistakes: ['Trying googly before stock ball is consistent','Dropping wrist → flat, no turn','Rushing delivery stride → losing control'],
    videoId: 'xbT4kp7LHBU',
    videoTitle: 'Leg Spin — Complete Guide Grip to Variations',
    videoChannel: 'Cricket Training Tips',
  },
  {
    id: 'bowl-line-length', category: 'bowling', name: 'Line & Length Control',
    level: 'beginner', xp: 70, duration: '15 min', icon: '📏',
    tagline: 'The foundation of all bowling',
    focus: ['consistency','target zone','run-up'],
    equipment: ['ball', 'stumps', 'cones', 'target marker'],
    steps: [
      'Place a marker (cone/tape) on a good length on off stump line',
      'Bowl 20 consecutive deliveries, aiming at the marker',
      'Record: how many hit within 30cm of the marker',
      'Progress target: 15/20 consistently before moving to 17/20',
      'Add pressure: set yourself out with a batsman watching',
      'Change pace: bowl same line/length at 70%, 85%, 100%',
    ],
    keyPoints: ['Good length: 6-7m from stumps (fast), 4-5m (spin)','Practice run-up: must be 100% consistent','Line: 5th/6th stump corridor for seam bowlers'],
    commonMistakes: ['Varying run-up = varying line/length','Not measuring performance (just bowling randomly)','Ignoring rhythm — it affects everything'],
    videoId: '3KBHkbIz8r0',
    videoTitle: 'Line & Length — Foundation of Fast Bowling',
    videoChannel: 'Cricket Mentor',
  },
  {
    id: 'bowl-slower-ball', category: 'bowling', name: 'Slower Ball Variations',
    level: 'advanced', xp: 100, duration: '25 min', icon: '🐢',
    tagline: 'Deceive batters with pace changes',
    focus: ['disguise','release','variation'],
    equipment: ['ball', 'stumps'],
    steps: [
      'Off-cutter: cut inside of index finger across seam at release',
      'Leg-cutter: cut outside of middle finger across seam',
      'Back of hand: palm faces batsman at release — lose 20-30km/h',
      'Knuckle ball: ball balanced on knuckles — very slow',
      'Every variation: same run-up, same arm speed — only release changes',
      'Practice 5 of each type before mixing in a session',
    ],
    keyPoints: ['Same action = disguise. Different action = readable','Bowl slower balls 2-3/over max — use sparingly','Set up with bouncers to make slow ball more effective'],
    commonMistakes: ['Slowing down arm → batter reads it early','Not practicing enough → poor control','Using too often → batter adjusts'],
    videoId: 'Rn8Pm2PGBM0',
    videoTitle: 'Slower Ball Variations — Grips and Delivery',
    videoChannel: 'B3 Cricket',
  },
  {
    id: 'bowl-bouncer', category: 'bowling', name: 'Bouncer Strategy',
    level: 'intermediate', xp: 85, duration: '20 min', icon: '⬆️',
    tagline: 'Use the short ball as a weapon, not a gift',
    focus: ['angle','target','sequencing'],
    equipment: ['ball', 'stumps', 'helmet-wearing batter'],
    steps: [
      'Target: at batter\'s armpit — not head, not below chest',
      'Vary angle: over the wicket vs around the wicket for different effect',
      'Use after 2-3 full deliveries — don\'t telegraph it',
      'Follow the bouncer with a yorker — classic sequence',
      'Study the batter: pull shot player = body bouncer, not head height',
      'Only bowl 1-2 per over — more than that = batter adapts',
    ],
    keyPoints: ['Bouncer at armpit is hardest to deal with','Around the wicket to right-hander → angles in awkwardly','Set up your next ball — bouncer creates a plan, not a wicket alone'],
    commonMistakes: ['Bowling bouncers to established pull-shot players','Telegraphing with longer run-up','No follow-up plan — isolated bouncer is easy to deal with'],
    videoId: 'c_JxV43jB8o',
    videoTitle: 'How to Bowl a Bouncer — Technique & Strategy',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'bowl-reverse-swing', category: 'bowling', name: 'Reverse Swing',
    level: 'advanced', xp: 115, duration: '30 min', icon: '🔀',
    tagline: 'The dark art of the old ball',
    focus: ['ball condition','wrist','pace'],
    equipment: ['worn ball (40+ overs)', 'stumps'],
    steps: [
      'Ball condition: rough side out, shiny side in — opposite of conventional swing',
      'Seam angled towards fine leg (like inswing grip)',
      'Bowl at 130km/h+ — reverse only works at pace',
      'Target: yorker length outside off stump swinging back in',
      'Maintain ball: polish the shiny side religiously every over',
      'Work with keeper: they polish the ball between deliveries',
    ],
    keyPoints: ['Speed is non-negotiable for reverse swing','Rough side OUT for reverse swing','Attack stumps — reverse swing most lethal hitting stumps line'],
    commonMistakes: ['Trying reverse swing with new ball (won\'t work)','Bowling short — ball doesn\'t swing as much','Not polishing the shiny side'],
    videoId: 'GV9VFzZyFY0',
    videoTitle: 'Reverse Swing — The Complete Guide',
    videoChannel: 'Cricket Training Tips',
  },
  {
    id: 'bowl-seam-bowling', category: 'bowling', name: 'Seam Bowling',
    level: 'beginner', xp: 75, duration: '15 min', icon: '🪡',
    tagline: 'Make the ball talk off the pitch',
    focus: ['seam position','landing','extraction'],
    equipment: ['new ball', 'stumps', 'pitch (or marked surface)'],
    steps: [
      'Grip: seam perfectly upright — index and middle fingers either side',
      'Thumb supporting underneath along seam',
      'Release: seam stays upright throughout flight',
      'Target: land seam first on a hard area of pitch (good length)',
      'Don\'t try to do too much — let the pitch do the work',
      'Wrist stays firm — no wrist flick at release',
    ],
    keyPoints: ['Seam upright = movement off pitch','Land on the same spot consistently','New ball seams most — use it in first 15 overs'],
    commonMistakes: ['Seam going horizontal in flight','Bowling short — ball loses seam position','Gripping too tight — reduces seam control'],
    videoId: '4k9xFjOBNs8',
    videoTitle: 'Seam Bowling Secrets — Move Ball Off Pitch',
    videoChannel: 'PitchVision Cricket',
  },
  {
    id: 'bowl-spin-variations', category: 'bowling', name: 'Spin Variations',
    level: 'advanced', xp: 105, duration: '25 min', icon: '✨',
    tagline: 'Add arm ball, googly, and carrom ball',
    focus: ['deception','wrist','disguise'],
    equipment: ['ball', 'stumps'],
    steps: [
      'Arm ball (off-spinner): wrist stays behind ball — goes straight on',
      'Doosra (off-spinner): spin from the front of the hand — turns away',
      'Flipper (leg-spinner): squeeze from under the ball — skids on fast',
      'Googly (leg-spinner): extra wrist rotation — turns away from right-handers',
      'Carrom ball: flick from middle finger — minimal drag = deception',
      'All variations: same run-up, same arm speed — disguise is everything',
    ],
    keyPoints: ['Master one variation at a time — not all at once','Video yourself: your variations should look identical from the front','Only use variations when stock ball is consistent'],
    commonMistakes: ['Obvious change in action → batter picks it','Using variations before stock ball is reliable','No end-game plan for variation — what happens after it?'],
    videoId: 'xbT4kp7LHBU',
    videoTitle: 'Spin Variations — Googly, Flipper, Arm Ball Guide',
    videoChannel: 'Cricket Training Tips',
  },
  {
    id: 'bowl-powerplay', category: 'bowling', name: 'Powerplay Bowling',
    level: 'intermediate', xp: 90, duration: '20 min', icon: '⚡',
    tagline: 'Dominate with only 2 fielders outside the ring',
    focus: ['line','attack','field setting'],
    equipment: ['ball', 'stumps', 'fielding cones'],
    steps: [
      'Mindset: attack the stumps — not defensive lines outside off',
      'Use movement: outswing with ring fielders pushed up',
      'Vary pace early: slower ball in powerplay is highly effective',
      'Set up the caught behind: shape one away, then bring one back',
      'Yorker at the end of powerplay over to a set batter',
      'Communicate with captain: set attacking fields early',
    ],
    keyPoints: ['Best field: 2 slips, gully in first 6 overs','Full length bowling — generate nicks and LBWs','Use the new ball swing while it lasts'],
    commonMistakes: ['Defensive bowling outside off stump → easy runs','Trying to stop runs rather than take wickets','Not using slip cordon in powerplay — wasted opportunity'],
    videoId: 'HV2sT8Xc5Kw',
    videoTitle: 'Powerplay Bowling — Attack Strategy',
    videoChannel: 'Cricket Coach Online',
  },

  // ── FIELDING (11 drills) ────────────────────────────────────────
  {
    id: 'field-ground-fielding', category: 'fielding', name: 'Ground Fielding',
    level: 'beginner', xp: 60, duration: '15 min', icon: '🤸',
    tagline: 'Cut off boundaries and save runs',
    focus: ['body position','clean pick-up','attack'],
    equipment: ['ball', 'cones', 'stumps'],
    steps: [
      'Ready position: weight on balls of feet, slight crouch, hands ready',
      'When ball is hit: take 2-3 attack steps forward immediately',
      'Get BODY behind the ball — never just reach one hand',
      'Long barrier option: side-on, lead knee on ground, block line',
      'Attack option: two-handed pick-up, body low',
      'After pick-up: throw immediately in one fluid motion',
    ],
    keyPoints: ['Body behind ball = clean pick-up every time','Attack the ball — don\'t wait for it','Expect every ball to come to you'],
    commonMistakes: ['Waiting for ball to come → it can take bad bounce','Reaching one hand → misfields','Not getting body behind line → ball goes through'],
    videoId: 'R6TxjGCa3Bc',
    videoTitle: 'Ground Fielding Drills — Long Barrier & Attack',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'field-throwing', category: 'fielding', name: 'Throwing Accuracy',
    level: 'intermediate', xp: 75, duration: '20 min', icon: '🎯',
    tagline: 'Hit stumps from any position',
    focus: ['mechanics','accuracy','power'],
    equipment: ['ball', 'stumps'],
    steps: [
      'Side-on position: left shoulder points at target (right-arm)',
      'Weight loads on back foot, front arm points at target',
      'Drive front elbow down as throwing arm comes through',
      'Release over top — not sidearm — for power and accuracy',
      'Follow through: throwing arm continues across body',
      'Practice: 50 throws at stumps per session from 20m, 30m, 40m',
    ],
    keyPoints: ['Side-on throwing generates 30% more power','Always throw at stumps in practice — never aimlessly','Strong core = powerful throw'],
    commonMistakes: ['Sidearm throw → loses accuracy and pace','Not transferring weight → weak throw','Throwing without looking at target'],
    videoId: 'DlPi9kHqiR0',
    videoTitle: 'Throwing Accuracy — Direct Hit Drills',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'field-slip-catching', category: 'fielding', name: 'Slip Catching',
    level: 'intermediate', xp: 80, duration: '20 min', icon: '🤲',
    tagline: 'Turn nicks into wickets',
    focus: ['hand position','soft hands','reaction'],
    equipment: ['ball', 'slip cradle or partner'],
    steps: [
      'Stance: low, balanced, weight slightly forward, hands together',
      'Hands should be BELOW the ball at start — ready to move up',
      'Don\'t move until ball is half-way to you',
      'Watch the edge leave the bat — not the bat',
      'Soft hands: cup the ball, don\'t snatch at it',
      'Use slip cradle: 100 takes per session at varied heights and speeds',
    ],
    keyPoints: ['Watch for the edge — not the bat hit','Soft hands = catch stays in; hard hands = grassed','Low start position = can go up easily, not down quickly'],
    commonMistakes: ['Moving hands too early → out of position','Hard, snatching hands → ball bounces out','Standing too upright → can\'t get down quickly'],
    videoId: 'bWQ7hJmvFZE',
    videoTitle: 'Slip Catching — Hands Position & Reaction Drills',
    videoChannel: 'Cricket Mentor',
  },
  {
    id: 'field-high-catch', category: 'fielding', name: 'High Catch',
    level: 'intermediate', xp: 75, duration: '15 min', icon: '☁️',
    tagline: 'Catches in the deep win matches',
    focus: ['communication','basket','sun'],
    equipment: ['ball', 'open space'],
    steps: [
      'Move early: sprint to get under the ball, then settle',
      'Call loudly: "MINE" — clear communication prevents collisions',
      'Sun or lights: position so ball drops into shadow if possible',
      'Basket catch: fingers pointing up, hands cupped',
      'Keep eyes on ball ALL the way into hands',
      'Two-handed at all times in the deep — one hand for practice only',
    ],
    keyPoints: ['Better to move too early than too late','CALL for every ball — even solo fielder','Feet underneath ball = 10x better catch'],
    commonMistakes: ['Not calling → collision risk','Running with eyes off ball','Catching in front of face → ball pops out'],
    videoId: 'fKXlwR5kNwM',
    videoTitle: 'High Catch Technique — Under Pressure',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'field-run-out', category: 'fielding', name: 'Run Out Execution',
    level: 'advanced', xp: 90, duration: '25 min', icon: '🏃',
    tagline: 'Convert half-chances into run-outs',
    focus: ['awareness','speed','accuracy'],
    equipment: ['ball', 'stumps', 'cones for batters'],
    steps: [
      'Awareness: always know where batters are and call line position',
      'Pick up and throw in ONE motion — no extra steps',
      'Aim: top of stumps — hitting bails is better than missing stumps',
      'Back-up: fielder behind stumps always — not optional',
      'Practice: retrieve ball, pick up, throw to either end — rotation drill',
      'Pressure drill: attempt 20 run-out throws with score keeping',
    ],
    keyPoints: ['Every direct hit attempt needs a backup fielder','One-motion pick-up and throw = fastest possible','Top of stumps = most reliable target'],
    commonMistakes: ['Extra step after pick-up → wasted time','No backup → overthrow = extra runs','Throwing from poor position → wasted attempt'],
    videoId: 'DlPi9kHqiR0',
    videoTitle: 'Run Out Drills — Direct Hit Execution',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'field-wicketkeeping', category: 'fielding', name: 'Wicketkeeping Basics',
    level: 'intermediate', xp: 85, duration: '25 min', icon: '🧤',
    tagline: 'The most demanding fielding role',
    focus: ['stance','footwork','glove work'],
    equipment: ['gloves', 'pads', 'ball', 'stumps'],
    steps: [
      'Stance: squat behind the stumps, weight on balls of feet',
      'Hands: together below eyeline, fingers pointing down initially',
      'Watch the ball from the moment it leaves the bowler\'s hand',
      'Move feet first — never just stretch hands to ball',
      'Take the ball as late as possible in front of body',
      'Stumping: quickly remove bails AFTER confirming batter is out of crease',
    ],
    keyPoints: ['Watch ball all the way into gloves — never assume','Footwork first, then hands','Both gloves together at all times unless diving'],
    commonMistakes: ['Hands moving before feet → can\'t reach wide balls','Taking ball too early → snick goes through','Appealing before completing the stumping'],
    videoId: 'YFwvJqCR3yU',
    videoTitle: 'Wicketkeeping — Footwork & Glove Work Drills',
    videoChannel: 'WK Cricket Training',
  },
  {
    id: 'field-diving', category: 'fielding', name: 'Diving & Sliding',
    level: 'advanced', xp: 80, duration: '20 min', icon: '🛸',
    tagline: 'Aerial saves and sliding stops',
    focus: ['shoulder roll','hands','landing'],
    equipment: ['ball', 'flat surface', 'grass'],
    steps: [
      'Low body position as you dive — launch from low not high',
      'Lead with hands — reach for ball as you dive',
      'Shoulder roll on landing — protect the ball and your body',
      'Sliding stop: lead foot slides, body stays upright',
      'Recover fast: immediately get to feet and return ball',
      'Practice: 10 dives left, 10 right per session on grass',
    ],
    keyPoints: ['Low start = efficient dive; high start = hard landing','Protect ball on contact with ground','Get up immediately — batters run on fielder dives'],
    commonMistakes: ['Diving too high → crash landing → injury','Not protecting ball → jarred loose on contact','Slow recovery → extra run conceded after save'],
    videoId: '8X9Wa9DXRJM',
    videoTitle: 'Diving & Sliding Fielding Technique',
    videoChannel: 'Cricket Training Tips',
  },
  {
    id: 'field-catching-drills', category: 'fielding', name: 'Catching Drills',
    level: 'beginner', xp: 65, duration: '15 min', icon: '🎾',
    tagline: 'Catches win matches — practice daily',
    focus: ['soft hands','eye contact','positioning'],
    equipment: ['ball', 'partner or cradle'],
    steps: [
      '10 close catches: chest height, with partner 10m away',
      '10 diving catches: partner throws wide — dive and catch',
      '10 catching on the move: run 5m, turn, catch over shoulder',
      '10 reaction catches: close range, hard throw, react',
      '10 relay catches: throw up, run to where it will land, catch',
      'Record every dropped catch — track your improvement',
    ],
    keyPoints: ['Soft hands: ball stays in; hard hands: pops out','Eyes on ball = everything else is automatic','Move before the ball arrives, not as it arrives'],
    commonMistakes: ['Taking eye off ball at last moment','Hard hands = snatching → ball bounces out','Not positioning properly before ball arrives'],
    videoId: 'bWQ7hJmvFZE',
    videoTitle: 'Catching Drills — Daily Practice Routine',
    videoChannel: 'Cricket Mentor',
  },
  {
    id: 'field-boundary-patrol', category: 'fielding', name: 'Boundary Fielding',
    level: 'intermediate', xp: 70, duration: '15 min', icon: '🏃',
    tagline: 'Stop fours and take catches on the rope',
    focus: ['sprint','catch on boundary','throw back'],
    equipment: ['ball', 'cones for boundary line'],
    steps: [
      'Set boundary line with cones — practice staying inside',
      'Chase: full-speed sprint from 30 yards, stopping in time',
      'Boundary save: reach ball inside, return before it crosses',
      'Over-the-shoulder catch: sprint, don\'t look back too early',
      'Catch and return in one motion: catch then instantly pivot and throw',
      'Pressure: score yourself on boundary saves out of 10',
    ],
    keyPoints: ['Eyes up — watch ball not boundary rope','Sprint the first 10m — that\'s where matches are won','Never take lazy steps on the boundary — sprint always'],
    commonMistakes: ['Jogging → ball crosses boundary','Looking at rope instead of ball','Slow return throw → extra run'],
    videoId: 'R6TxjGCa3Bc',
    videoTitle: 'Boundary Fielding — Sprint, Save, Throw',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'field-infield', category: 'fielding', name: 'Infield Pressure',
    level: 'intermediate', xp: 75, duration: '20 min', icon: '⚡',
    tagline: 'Cut off singles, create run-out chances',
    focus: ['positioning','anticipation','reaction'],
    equipment: ['ball', 'cones', 'stumps'],
    steps: [
      'Position: always in ready stance — low, weight forward',
      'Anticipate: read the shot being played before ball is hit',
      'Charge early: if batter drives, charge immediately after contact',
      'Angle: always field at angle to cut off runs, not just block',
      'Communicate: call to keeper where you\'re throwing before picking up',
      'Drill: 15 throws to keeper from infield position — score direct hits',
    ],
    keyPoints: ['Anticipation = early movement = better fielding','Always field at angle to stumps for run-out chance','Quick communication before pick-up saves 0.5 seconds'],
    commonMistakes: ['Flat-footed → always reacting, never anticipating','Fielding square to stumps → no angle for run-out','Not communicating → keeper unprepared'],
    videoId: 'R6TxjGCa3Bc',
    videoTitle: 'Infield Pressure — Cut Off Singles',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'field-team-relay', category: 'fielding', name: 'Team Relay Fielding',
    level: 'advanced', xp: 85, duration: '25 min', icon: '🤝',
    tagline: 'Turn team fielding into a wicket-taking machine',
    focus: ['teamwork','backing up','communication'],
    equipment: ['ball', 'stumps', 'cones', 'full team'],
    steps: [
      'Drill: fielder at boundary, relay fielder at 30 yards, keeper at stumps',
      'Ball hit to boundary: boundary fielder throws to relay',
      'Relay fielder catches, immediately turns and throws to stumps',
      'Keeper takes and attempts stumping/run-out',
      'Next fielder backs up at opposite end automatically',
      'Rotate positions so every player practices every role',
    ],
    keyPoints: ['Relay is only useful if the relay fielder is in position','Back-up fielder at opposite end is non-negotiable','Communication: "two!", "one!" tells keeper where to stand'],
    commonMistakes: ['No relay fielder in position → long boundary return','No backup → overthrow costs 4 extra runs','Relay fielder stopping to look before throwing → too slow'],
    videoId: 'DlPi9kHqiR0',
    videoTitle: 'Team Fielding Relay — Coordination Drills',
    videoChannel: 'CoachCricXI',
  },
];

// Category config
var CATS = {
  all:      { label: 'All Drills', color: '#9ca3af', bg: 'rgba(75,85,99,0.15)' },
  batting:  { label: 'Batting',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  bowling:  { label: 'Bowling',    color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  fielding: { label: 'Fielding',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

var LEVEL_COLORS = { beginner: '#16a34a', intermediate: '#f59e0b', advanced: '#ef4444', pro: '#8b5cf6' };

// ── DRILL VIDEO PLAYER ───────────────────────────────────────────
function VideoPlayer({ drill }) {
  var [show, setShow] = useState(false);
  if(!drill.videoId) return null;
  return h('div', { style: { marginTop: 16 }},
    !show
      ? h('button', {
          onClick: function() { setShow(true); },
          style: {
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '13px 14px', borderRadius: 11,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          }
        },
          h('div', { style: {
            width: 44, height: 32, borderRadius: 7, background: '#dc2626',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }},
            h('div', { style: { width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '13px solid #fff', marginLeft: 2 }})
          ),
          h('div', { style: { flex: 1, minWidth: 0 }},
            h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f0fdf4', lineHeight: 1.3 }}, drill.videoTitle),
            h('div', { style: { fontSize: 11, color: '#9ca3af', marginTop: 3 }},
              drill.videoChannel, ' · ⭐ Top Pick for this drill'
            )
          )
        )
      : h('div', { style: { borderRadius: 12, overflow: 'hidden', background: '#000' }},
          h('div', { style: { position: 'relative', paddingBottom: '56.25%', height: 0 }},
            h('iframe', {
              src: 'https://www.youtube.com/embed/' + drill.videoId + '?autoplay=1&rel=0&modestbranding=1',
              style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
              allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
              allowFullScreen: true, title: drill.videoTitle,
            })
          ),
          h('div', { style: { padding: '8px 14px', background: 'rgba(17,17,17,0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }},
            h('span', { style: { fontSize: 11, color: '#9ca3af' }}, drill.videoChannel),
            h('button', { onClick: function() { setShow(false); }, style: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit', padding: '0 4px' }}, '×')
          )
        )
  );
}

// ── DRILL DETAIL PAGE ────────────────────────────────────────────
function DrillDetailPage({ drillId, onBack }) {
  var drill = DRILLS.find(function(d) { return d.id === drillId; });
  var [done, setDone] = useState(false);
  var [started, setStarted] = useState(false);
  if(!drill) return h('div', { style: { padding: 20, color: '#f0fdf4' }}, 'Drill not found. ', h('button', { onClick: onBack, style: { color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}, '← Go back'));

  var catCol = CATS[drill.category] ? CATS[drill.category].color : '#9ca3af';
  var lvlCol = LEVEL_COLORS[drill.level] || '#9ca3af';

  function completeDrill() {
    if(done) return;
    setDone(true);
    var p = DB.getProgress();
    p.drills_done = (p.drills_done || 0) + 1;
    if(!p.drill_completions) p.drill_completions = {};
    p.drill_completions[drill.id] = (p.drill_completions[drill.id] || 0) + 1;
    DB.saveProgress(p);
    if(awardXP) awardXP(drill.xp, 0, 'drill:' + drill.id);
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  return h('div', { style: { background: '#0d1117', minHeight: '100dvh', paddingBottom: 100 }},
    // Header
    h('div', { style: { padding: '16px 16px 0', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.97)', zIndex: 10, borderBottom: '1px solid rgba(48,54,61,0.6)', paddingBottom: 12 }},
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 }},
        h('button', { onClick: onBack, style: { background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#9ca3af', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, minHeight: 36 }}, '← Back'),
        h('div', { style: { flex: 1, fontSize: 15, fontWeight: 800, color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}, drill.name),
        h('div', { style: { fontSize: 20, lineHeight: 1, flexShrink: 0 }}, drill.icon)
      )
    ),
    h('div', { style: { padding: '20px 16px' }},
      // Meta badges
      h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }},
        h('span', { style: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: CATS[drill.category].bg, color: catCol, border: '1px solid ' + catCol + '40' }}, drill.category.charAt(0).toUpperCase() + drill.category.slice(1)),
        h('span', { style: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: lvlCol + '15', color: lvlCol, border: '1px solid ' + lvlCol + '40' }}, drill.level.charAt(0).toUpperCase() + drill.level.slice(1)),
        h('span', { style: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(22,163,74,0.12)', color: '#4ade80', border: '1px solid rgba(22,163,74,0.3)' }}, '+' + drill.xp + ' XP'),
        h('span', { style: { fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 99, background: 'rgba(75,85,99,0.2)', color: '#9ca3af', border: '1px solid rgba(75,85,99,0.3)' }}, drill.duration)
      ),
      // Tagline
      h('p', { style: { fontSize: 14, color: '#9ca3af', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}, '"' + drill.tagline + '"'),
      // Video player
      h(VideoPlayer, { drill: drill }),
      // Equipment
      h('div', { style: { marginTop: 20, marginBottom: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)' }},
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}, 'Equipment Needed'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 }},
          drill.equipment.map(function(item, i) {
            return h('span', { key: i, style: { fontSize: 12, padding: '4px 10px', borderRadius: 99, background: 'rgba(75,85,99,0.25)', color: '#d1d5db', border: '1px solid rgba(75,85,99,0.4)' }}, item);
          })
        )
      ),
      // Steps
      h('div', { style: { marginBottom: 16 }},
        h('div', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}, 'Step-by-Step Instructions'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 }},
          drill.steps.map(function(step, i) {
            return h('div', { key: i, style: { display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 11, background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)' }},
              h('div', { style: { width: 24, height: 24, borderRadius: '50%', background: 'rgba(22,163,74,0.15)', border: '1.5px solid rgba(22,163,74,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#4ade80', flexShrink: 0 }}, i + 1),
              h('p', { style: { fontSize: 13, color: '#d1d5db', lineHeight: 1.65, margin: 0, paddingTop: 2 }}, step)
            );
          })
        )
      ),
      // Key points
      h('div', { style: { marginBottom: 16, padding: '14px 16px', borderRadius: 12, background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)' }},
        h('div', { style: { fontSize: 12, fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, '✓ Key Coaching Points'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 }},
          drill.keyPoints.map(function(pt, i) {
            return h('div', { key: i, style: { display: 'flex', gap: 8, alignItems: 'flex-start' }},
              h('span', { style: { color: '#16a34a', fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 2 }}, '✓'),
              h('span', { style: { fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}, pt)
            );
          })
        )
      ),
      // Common mistakes
      h('div', { style: { marginBottom: 24, padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }},
        h('div', { style: { fontSize: 12, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, '⚠ Common Mistakes'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 }},
          drill.commonMistakes.map(function(m, i) {
            return h('div', { key: i, style: { display: 'flex', gap: 8, alignItems: 'flex-start' }},
              h('span', { style: { color: '#ef4444', fontSize: 14, lineHeight: 1, flexShrink: 0, marginTop: 2 }}, '✗'),
              h('span', { style: { fontSize: 13, color: '#d1d5db', lineHeight: 1.5 }}, m)
            );
          })
        )
      ),
      // Complete button
      done
        ? h('div', { style: { textAlign: 'center', padding: '20px', borderRadius: 12, background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.3)' }},
            h('div', { style: { fontSize: 32, marginBottom: 8 }}, '🎉'),
            h('div', { style: { fontSize: 15, fontWeight: 700, color: '#4ade80', marginBottom: 4 }}, 'Drill Complete!'),
            h('div', { style: { fontSize: 13, color: '#9ca3af' }}, '+' + drill.xp + ' XP earned')
          )
        : h('button', {
            onClick: completeDrill,
            style: {
              width: '100%', padding: '15px', border: 'none', borderRadius: 12,
              background: 'linear-gradient(135deg, #16a34a, #0d9488)',
              color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(22,163,74,0.35)',
            }
          }, '✓ Mark as Complete — +' + drill.xp + ' XP')
    )
  );
}

// ── MAIN DRILLS PAGE ─────────────────────────────────────────────
function DrillsPage() {
  var [activeCat, setActiveCat] = useState('all');
  var [search, setSearch] = useState('');
  var [selectedDrill, setSelectedDrill] = useState(null);
  var progress = DB.getProgress();
  var completions = progress.drill_completions || {};

  if(selectedDrill) {
    return h(DrillDetailPage, { drillId: selectedDrill, onBack: function() { setSelectedDrill(null); } });
  }

  // Filter drills
  var filtered = DRILLS.filter(function(d) {
    var catMatch = activeCat === 'all' || d.category === activeCat;
    var searchMatch = !search || d.name.toLowerCase().indexOf(search.toLowerCase()) > -1 || d.focus.some(function(f) { return f.toLowerCase().indexOf(search.toLowerCase()) > -1; });
    return catMatch && searchMatch;
  });

  // SmartCrick Picks — personalised for the user
  var user = DB.getUser ? DB.getUser() : (DB.get ? DB.get('user') : null);
  var completedIds = Object.keys(completions);
  var pickDrills = (A.PersonalisationEngine && user)
    ? A.PersonalisationEngine.getPickDrills(DRILLS, user, completedIds)
    : [];
  var pickIds = {};
  pickDrills.forEach(function(d) { pickIds[d.id] = true; });

  return h('div', { style: { background: '#0d1117', minHeight: '100dvh', paddingBottom: 100 }},
    // Sticky header
    h('div', { style: { position: 'sticky', top: 0, background: 'rgba(13,17,23,0.97)', zIndex: 10, paddingTop: 'max(16px, calc(16px + env(safe-area-inset-top)))', paddingBottom: 0, borderBottom: '1px solid rgba(48,54,61,0.6)' }},
      h('div', { style: { padding: '0 16px 12px' }},
        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }},
          h('div', null,
            h('h1', { style: { fontSize: 20, fontWeight: 900, color: '#f0fdf4', letterSpacing: '-0.01em', margin: 0 }}, 'Cricket Drills'),
            h('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 }}, filtered.length + ' of ' + DRILLS.length + ' drills')
          ),
          h('div', { style: { fontSize: 11, fontWeight: 700, color: '#4ade80', background: 'rgba(22,163,74,0.12)', padding: '4px 10px', borderRadius: 99, border: '1px solid rgba(22,163,74,0.25)' }}, (progress.drills_done || 0) + ' done')
        ),
        // Search
        h('div', { style: { position: 'relative', marginBottom: 12 }},
          h('input', {
            type: 'search', value: search, placeholder: 'Search drills...',
            onChange: function(e) { setSearch(e.target.value); },
            style: {
              width: '100%', padding: '10px 14px 10px 36px', borderRadius: 10,
              background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)',
              color: '#f0fdf4', fontSize: 14, fontFamily: 'inherit', outline: 'none',
              boxSizing: 'border-box',
            },
            onFocus: function(e) { e.target.style.borderColor = 'rgba(22,163,74,0.4)'; },
            onBlur: function(e) { e.target.style.borderColor = 'rgba(48,54,61,0.9)'; },
          }),
          h('span', { style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: 14 }}, '🔍')
        ),
        // Category filter
        h('div', { style: { display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2 }},
          Object.keys(CATS).map(function(cat) {
            var active = activeCat === cat;
            var catData = CATS[cat];
            return h('button', {
              key: cat,
              onClick: function() { setActiveCat(cat); setSearch(''); },
              style: {
                flexShrink: 0, padding: '7px 14px', borderRadius: 99, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
                background: active ? catData.bg : 'transparent',
                color: active ? catData.color : '#6b7280',
                outline: active ? '1.5px solid ' + catData.color + '50' : 'none',
                transition: 'all 0.15s',
              }
            }, catData.label);
          })
        )
      )
    ),
    // ── SmartCrick Picks ─────────────────────────────────────────────
    pickDrills.length > 0 && !search && activeCat === 'all' && h('div', { style: { padding: '12px 16px 0' }},
      h('style', null,
        '@keyframes sc-pick-border{0%,100%{opacity:0.6}50%{opacity:1}}' +
        '.sc-pick-card{animation:sc-pick-border 3s ease-in-out infinite}'
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }},
        h('span', { style: { fontSize: 11, fontWeight: 800, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}, '✦ SmartCrick Pick'),
        h('div', { style: { flex: 1, height: 1, background: 'linear-gradient(to right, rgba(74,222,128,0.3), transparent)' }}),
        h('span', { style: { fontSize: 10, color: '#6b7280', fontWeight: 600 }}, 'personalised for you')
      ),
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }},
        pickDrills.map(function(drill) {
          var catData = CATS[drill.category] || { color: '#16a34a', bg: 'rgba(22,163,74,0.12)' };
          var lvlCol = LEVEL_COLORS[drill.level] || '#9ca3af';
          var drillDone = completions[drill.id] || 0;
          return h('button', {
            key: 'pick-' + drill.id,
            className: 'sc-pick-card',
            onClick: function() { setSelectedDrill(drill.id); },
            style: {
              display: 'flex', flexDirection: 'column', padding: 0,
              borderRadius: 14, border: '1px solid rgba(74,222,128,0.35)',
              background: 'rgba(22,27,34,0.95)', cursor: 'pointer',
              fontFamily: 'inherit', textAlign: 'left', overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(74,222,128,0.10), 0 4px 16px rgba(22,163,74,0.12)',
              transition: 'all 0.2s',
            },
            onMouseEnter: function(e) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(74,222,128,0.4), 0 8px 24px rgba(22,163,74,0.2)'; },
            onMouseLeave: function(e) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(74,222,128,0.10), 0 4px 16px rgba(22,163,74,0.12)'; },
          },
            h('div', { style: { height: 3, background: 'linear-gradient(to right, #16a34a, #0d9488)', opacity: 0.9 }}),
            h('div', { style: { padding: '12px 14px' }},
              h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }},
                h('div', { style: { fontSize: 22, lineHeight: 1, flexShrink: 0, marginTop: 2 }}, drill.icon),
                h('div', { style: { flex: 1, minWidth: 0 }},
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }},
                    h('span', { style: { fontSize: 8, fontWeight: 800, color: '#16a34a', background: 'rgba(22,163,74,0.12)', padding: '1px 5px', borderRadius: 3, border: '1px solid rgba(22,163,74,0.25)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}, '✦ Pick')
                  ),
                  h('div', { style: { fontSize: 13, fontWeight: 800, color: '#f0fdf4', lineHeight: 1.3, marginBottom: 2 }}, drill.name),
                  h('div', { style: { fontSize: 11, color: '#9ca3af' }}, drill.tagline)
                ),
                drillDone > 0 && h('div', { style: { flexShrink: 0, fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(22,163,74,0.12)', padding: '2px 7px', borderRadius: 99, border: '1px solid rgba(22,163,74,0.25)' }}, '×' + drillDone)
              ),
              h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }},
                h('div', { style: { display: 'flex', gap: 6, alignItems: 'center' }},
                  h('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: lvlCol + '15', color: lvlCol, border: '1px solid ' + lvlCol + '30' }}, drill.level),
                  h('span', { style: { fontSize: 11, color: '#6b7280' }}, drill.duration)
                ),
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 4 }},
                  h('span', { style: { fontSize: 12, fontWeight: 800, color: '#4ade80' }}, '+' + drill.xp),
                  h('span', { style: { fontSize: 11, color: '#6b7280' }}, 'XP')
                )
              )
            )
          );
        })
      )
    ),

    // Drill grid
    h('div', { style: { padding: '16px 16px' }},
      filtered.length === 0
        ? h('div', { style: { textAlign: 'center', padding: '60px 20px', color: '#6b7280' }},
            h('div', { style: { fontSize: 40, marginBottom: 12 }}, '🔍'),
            h('div', { style: { fontSize: 14, fontWeight: 600 }}, 'No drills found'),
            h('button', { onClick: function() { setSearch(''); setActiveCat('all'); }, style: { marginTop: 12, background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}, 'Clear filters')
          )
        : h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }},
            filtered.map(function(drill) {
              var catData = CATS[drill.category];
              var lvlCol = LEVEL_COLORS[drill.level] || '#9ca3af';
              var drillDone = completions[drill.id] || 0;
              return h('button', {
                key: drill.id,
                onClick: function() { setSelectedDrill(drill.id); },
                style: {
                  display: 'flex', flexDirection: 'column', padding: 0,
                  borderRadius: 14, border: '1px solid rgba(48,54,61,0.9)',
                  background: 'rgba(22,27,34,0.9)', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left', overflow: 'hidden',
                  transition: 'all 0.2s', outline: 'none',
                },
                onMouseEnter: function(e) { e.currentTarget.style.borderColor = catData.color + '60'; e.currentTarget.style.transform = 'translateY(-2px)'; },
                onMouseLeave: function(e) { e.currentTarget.style.borderColor = 'rgba(48,54,61,0.9)'; e.currentTarget.style.transform = 'translateY(0)'; },
              },
                // Card header with category color
                h('div', { style: { height: 4, background: catData.color, opacity: 0.7 }}),
                h('div', { style: { padding: '14px 16px' }},
                  h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }},
                    h('div', { style: { fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}, drill.icon),
                    h('div', { style: { flex: 1, minWidth: 0 }},
                      h('div', { style: { fontSize: 14, fontWeight: 800, color: '#f0fdf4', lineHeight: 1.3, marginBottom: 4 }}, drill.name),
                      h('div', { style: { fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}, drill.tagline)
                    ),
                    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }},
                      pickIds[drill.id] && h('div', { style: { fontSize: 8, fontWeight: 800, color: '#16a34a', background: 'rgba(22,163,74,0.12)', padding: '2px 5px', borderRadius: 3, border: '1px solid rgba(22,163,74,0.25)', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}, '✦ Pick'),
                      drillDone > 0 && h('div', { style: { fontSize: 10, fontWeight: 700, color: '#4ade80', background: 'rgba(22,163,74,0.12)', padding: '2px 7px', borderRadius: 99, border: '1px solid rgba(22,163,74,0.25)', whiteSpace: 'nowrap' }}, '×' + drillDone)
                    )
                  ),
                  // Focus tags
                  h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }},
                    drill.focus.slice(0,3).map(function(f, i) {
                      return h('span', { key: i, style: { fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: 'rgba(75,85,99,0.25)', color: '#9ca3af', border: '1px solid rgba(75,85,99,0.3)' }}, f);
                    })
                  ),
                  // Footer row
                  h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }},
                    h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' }},
                      h('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: lvlCol + '15', color: lvlCol, border: '1px solid ' + lvlCol + '30' }}, drill.level),
                      h('span', { style: { fontSize: 11, color: '#6b7280' }}, drill.duration)
                    ),
                    h('div', { style: { display: 'flex', alignItems: 'center', gap: 4 }},
                      h('span', { style: { fontSize: 12, fontWeight: 800, color: '#4ade80' }}, '+' + drill.xp),
                      h('span', { style: { fontSize: 11, color: '#6b7280' }}, 'XP'),
                      drill.videoId && h('span', { style: { fontSize: 16, marginLeft: 4 }}, '▶')
                    )
                  )
                )
              );
            })
          )
    )
  );
}

A.DrillsPage = DrillsPage;
A.DRILLS = DRILLS;
console.log('[SC] app-drills v4.0 — ' + DRILLS.length + ' drills, search + filter + video ready');
})();
