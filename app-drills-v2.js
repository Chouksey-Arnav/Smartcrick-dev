// app-drills-v2.js v1.0
// ================================================================
// SmartCrick — Drills Redesign v2
// 
// PHILOSOPHY CHANGE:
//   OLD: "How to play a cover drive" (tutorial - user can find on Google)
//   NEW: "Off-stump decision tracker" (solves a SPECIFIC measurable problem)
//
// Every drill has:
//   problem       — the specific gap this drill closes
//   measurement   — how to track whether you're improving
//   youtubeUrl    — opens in browser, direct YouTube search for this drill
//   steps         — 6-8 hyper-specific steps (not generic)
//   keyFocus      — the one mental cue that unlocks this drill
//   commonError   — the #1 mistake people make doing this drill
//   progressionNext — what drill to do after mastering this one
//
// CATEGORIES:
//   shots       — technical shot-making (moved from main list)
//   decisions   — shot selection, leave, reading play
//   bowling     — line/length/craft/variation
//   fielding    — elite fielding skills
//   keeping     — wicketkeeping specifics
//   fitness     — cricket-specific movement
//   partnership — running, calling, tactics
//
// Load AFTER app-drills.js — extends A.DRILLS
// ================================================================
(function() {
'use strict';
var A = window.SC_APP;
A.DRILLS_V2 = true;

// ================================================================
// HELPER — open YouTube in browser (always works)
// ================================================================
A.openDrillVideo = function(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener');
};

// YouTube search URL builder — guaranteed to always return results
function yt(query) {
  return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' cricket coaching');
}

// Specific verified channel video links for well-known drills
// (Channel: MCC, Cricket Australia, PitchVision, various county coaches)
var DRILL_VIDEOS = {
  // Batting shots — well-documented technique videos
  'cover-drive':        'https://www.youtube.com/results?search_query=cover+drive+technique+cricket+coaching+MCC',
  'pull-shot':          'https://www.youtube.com/results?search_query=pull+shot+cricket+coaching+back+foot',
  'sweep-shot':         'https://www.youtube.com/results?search_query=sweep+shot+cricket+batting+technique',
  'reverse-sweep':      'https://www.youtube.com/results?search_query=reverse+sweep+cricket+technique+advanced',
  'flick-shot':         'https://www.youtube.com/results?search_query=flick+shot+cricket+leg+side+batting',
  'cut-shot':           'https://www.youtube.com/results?search_query=cut+shot+cricket+back+foot+batting',
  'drive-on-up':        'https://www.youtube.com/results?search_query=straight+drive+on+drive+cricket+coaching',
  'late-cut':           'https://www.youtube.com/results?search_query=late+cut+cricket+batting+fine+leg',
  'ramp-shot':          'https://www.youtube.com/results?search_query=ramp+shot+cricket+over+wicketkeeper',
  'switch-hit':         'https://www.youtube.com/results?search_query=switch+hit+cricket+batting+Kevin+Pietersen',
  'slog-sweep':         'https://www.youtube.com/results?search_query=slog+sweep+cricket+T20+batting',
  'lofted-drive':       'https://www.youtube.com/results?search_query=lofted+drive+cricket+batting+powerplay',
  // Bowling
  'outswing':           'https://www.youtube.com/results?search_query=outswing+bowling+cricket+seam+position',
  'inswing':            'https://www.youtube.com/results?search_query=inswing+bowling+cricket+seam+wrist',
  'off-spin':           'https://www.youtube.com/results?search_query=off+spin+bowling+cricket+finger+position',
  'leg-spin':           'https://www.youtube.com/results?search_query=leg+spin+bowling+cricket+grip+wrist',
  'googly':             'https://www.youtube.com/results?search_query=googly+bowling+cricket+leg+spin+variation',
  'yorker':             'https://www.youtube.com/results?search_query=yorker+bowling+cricket+death+overs',
  'slower-ball':        'https://www.youtube.com/results?search_query=slower+ball+cricket+bowling+variations',
  'bouncer':            'https://www.youtube.com/results?search_query=bouncer+bowling+cricket+short+pitch',
};

// ================================================================
// SHOTS CATEGORY
// These are the existing shot/technique drills, MOVED to 'shots'
// Each gets a proper YouTube URL + enhanced steps
// ================================================================
var SHOTS_DRILLS = [
  {
    id: 'shot-cover-drive',
    name: 'Cover Drive',
    category: 'shots',
    level: 'beginner',
    duration: 15,
    xp: 60,
    emoji: '🏏',
    problem: 'Getting LBW or edging to slip by driving at balls too wide or too full',
    measurement: 'Track: balls hit to cover boundary vs balls edging or missing — aim for 7/10 clean contact',
    youtubeUrl: DRILL_VIDEOS['cover-drive'],
    steps: [
      'Set up 3 cones at off stump, middle stump, and 8 inches outside off — only drive balls pitched between middle and the outer cone',
      'Lead with your front elbow — it should be pointing toward mid-off at contact, not collapsing inward',
      'Keep your head still and over the ball at contact — chin should almost touch the front knee on a good drive',
      'Drive THROUGH the ball to the cone at mid-off — finish with the bat face pointing at extra cover',
      'After contact, hold your follow-through position for 2 seconds — this trains balance and checks your weight transfer',
      'Do 20 throw-downs. After each 5, have your feeder move 2 inches wider — stop driving anything beyond 8 inches outside off'
    ],
    keyFocus: 'Front elbow leads — everything else follows',
    commonError: 'Reaching for wide balls. If you have to reach, do NOT drive — let it go. The cover drive only works when it comes to you.',
    progressionNext: 'shot-on-drive',
    keyPoints: ['Lead elbow', 'Head over ball', 'Only drive your half'],
    commonMistakes: ['Reaching for wide deliveries', 'Collapsing elbow', 'Playing too early'],
  },
  {
    id: 'shot-pull-shot',
    name: 'Pull Shot',
    category: 'shots',
    level: 'intermediate',
    duration: 15,
    xp: 80,
    emoji: '🏏',
    problem: 'Top-edging short balls to fine leg or being hit by deliveries above waist height',
    measurement: 'Track: balls pulled in control (middled, in the arc square to fine leg) vs top-edges. Target 7/10',
    youtubeUrl: DRILL_VIDEOS['pull-shot'],
    steps: [
      'Mark a line behind your crease — the pull shot requires you to get inside the line of the ball. Your back foot moves BACK and ACROSS first',
      'Have feeder throw from 8 metres, pitching consistently short — same length each time so you can focus on movement not decision',
      'Move back foot back first, then across to inside the ball\'s line. Your weight is back — NOT falling forward',
      'The bat swing is almost horizontal — from inside the line of the ball, rolling the wrists over at contact to keep it down',
      'Eyes stay on the ball until it contacts the bat — practice deliberately tracking it from the hand to the middle',
      'After 10 pulls, have feeder occasionally throw fuller — practice the NO: back foot goes back, ball is full, you STOP and play a different shot or leave',
      'Final 10: mix of pull length and fuller — your trigger movement is the same each time, the DECISION to pull or not comes late'
    ],
    keyFocus: 'Back and across FIRST — before the shot starts, your body is already in position',
    commonError: 'Falling onto the front foot (causes top-edges). Your weight must stay back throughout contact.',
    progressionNext: 'decision-short-ball',
    keyPoints: ['Back foot first', 'Roll wrists over', 'Eyes on contact'],
    commonMistakes: ['Weight going forward', 'Playing too late', 'Not getting inside the line'],
  },
  {
    id: 'shot-sweep',
    name: 'Sweep Shot',
    category: 'shots',
    level: 'intermediate',
    duration: 15,
    xp: 80,
    emoji: '🏏',
    problem: 'Missing sweep shots to LBW, being caught at short fine leg, or misjudging the delivery',
    measurement: 'Target: 8/10 sweeps with ball hitting the middle third of bat and staying below knee height',
    youtubeUrl: DRILL_VIDEOS['sweep-shot'],
    steps: [
      'Mark a target zone: a chalk circle on the pitch where a sweep-able ball pitches (outside leg stump, on a length)',
      'Get into a low kneeling position first — practice the body shape before the ball arrives. Front knee almost touching the pitch, back leg providing balance',
      'Feeder throws to your marked target zone — slow first, then normal pace',
      'Front foot kneels DOWN, not leans forward — the heel comes off the ground, knee points at mid-wicket',
      'Bat starts HIGH (at your shoulder) and sweeps DOWNWARD — this keeps the ball down and creates the rolling motion',
      'At contact, your eyes are level with the ball — head down, not watching from standing height',
      'After 10 sweep-length balls, feeder mixes in a full ball — practice recognising that a full ball is NOT a sweep ball and playing forward defence instead'
    ],
    keyFocus: 'Bat starts high, comes down — the wrist roll at contact is what directs the ball',
    commonError: 'Trying to sweep a ball that\'s too full — this causes LBW. Only sweep when the ball is on a sweep length (passing leg stump line).',
    progressionNext: 'shot-slog-sweep',
    keyPoints: ['Ball on leg side', 'Down on one knee', 'Bat high to low'],
    commonMistakes: ['Sweeping full balls (LBW risk)', 'Not getting low enough', 'Mis-timing the contact'],
  },
  {
    id: 'shot-cut',
    name: 'Cut Shot',
    category: 'shots',
    level: 'intermediate',
    duration: 15,
    xp: 75,
    emoji: '🏏',
    problem: 'Edging cut shots behind or top-edging — usually caused by playing at balls not short enough',
    measurement: 'Target: 8/10 cuts going square or behind square on the off side below catching height',
    youtubeUrl: DRILL_VIDEOS['cut-shot'],
    steps: [
      'Draw a line 12 inches behind the crease — the cut shot should be played OFF the back foot behind this line',
      'Mark a "cut zone" on the pitch: outside off stump, short of a length. Feeder only throws to this zone initially',
      'Back foot goes BACK and ACROSS to outside off stump line — your weight is balanced, not falling backward',
      'The bat comes from high to low, angled downward — this keeps the ball down through cover-point area',
      'Roll the top hand over at contact — wrist rolls naturally downward. This is what separates a good cut from a top-edge',
      'Contact point is in FRONT of your body, level with your hip — not beside or behind you',
      'Mix: feeder throws cut-zone balls and occasionally full balls outside off. The cut only happens on SHORT balls — full balls get driven or left'
    ],
    keyFocus: 'Short ball gets cut — anything fuller gets driven or left. The decision is made early',
    commonError: 'Cutting at balls that aren\'t short enough — this causes edges. If it\'s full enough to drive, drive it.',
    progressionNext: 'decision-offstump-leave',
    keyPoints: ['Short ball only', 'Back foot movement first', 'Top hand roll at contact'],
    commonMistakes: ['Playing at full balls', 'Getting too close to the ball', 'Static feet'],
  },
  {
    id: 'shot-flick',
    name: 'Leg-Side Flick',
    category: 'shots',
    level: 'intermediate',
    duration: 15,
    xp: 75,
    emoji: '🏏',
    problem: 'Missing leg-stump deliveries to LBW or skying them to mid-on instead of flicking fine',
    measurement: 'Target: 7/10 flicks landing in the gap between square leg and fine leg, below fielding height',
    youtubeUrl: DRILL_VIDEOS['flick-shot'],
    steps: [
      'Start with front foot in position — toe pointing toward mid-on. This is the gate the ball passes through',
      'Feeder bowls straight or on leg stump, full length — the ball needs to be full enough to flick off the front foot',
      'Bat starts on leg stump line — your hands are close to your hip, not reaching',
      'The bat face angles toward fine leg at contact — wrist rotation converts straight hitting to a flick',
      'Practice the wrist rotation in isolation: hold the bat at contact position, rotate your wrists from straight (mid-on) to flick (fine leg). Feel the difference',
      'Contact is beside or just in front of the front foot — not behind it',
      'Build up: 10 balls with feeder calling "FLICK" on leg-side balls and "LEAVE" on straight balls — practice the decision alongside the technique'
    ],
    keyFocus: 'The wrist does the work — once the bat position is set, the wrist angle directs the ball',
    commonError: 'Playing across a straight ball (LBW). The flick only works if the ball is going down the leg side. Straight balls need a straight shot.',
    progressionNext: 'decision-legside',
    keyPoints: ['Wrist rotation', 'Front foot position', 'Contact in front of body'],
    commonMistakes: ['Playing across straight deliveries', 'Reaching rather than rotating', 'Static feet'],
  },
  {
    id: 'shot-ramp',
    name: 'Ramp / Scoop Over Keeper',
    category: 'shots',
    level: 'advanced',
    duration: 20,
    xp: 120,
    emoji: '🏏',
    problem: 'Either missing the ball entirely or hitting it straight to deep fine leg fielders because of timing and angle errors',
    measurement: 'Target: 6/10 ramps clearing 20 metres behind the wicket with no top-edge mishits',
    youtubeUrl: DRILL_VIDEOS['ramp-shot'],
    steps: [
      'Do NOT attempt this shot until you can play it soft-feed 10/10 at half pace. Build the movement first',
      'Set up with a wicketkeeper (or use a cone). The target is over their left or right shoulder — NOT directly over their head',
      'Back foot moves toward leg stump — you are getting inside the line of a ball aimed at your body',
      'Bend knees deeply — get LOW. This is the single biggest technique error: not getting low enough',
      'Bat angle: face aimed at the sky (roughly 45°), angled over your shoulder. You are using the ball\'s pace',
      'You are NOT hitting — you are REDIRECTING the pace over the keeper. Contact is early, in front of your body',
      'Practice without a ball first: set the angle, stand in position, hold for 5 seconds. Engrave the shape in your body',
      'Slow feed: 10 balls at half pace. Hit 8/10 over the keeper zone before attempting at full pace'
    ],
    keyFocus: 'You redirect the ball\'s pace — you do not hit it. The more pace the bowler provides, the easier this shot is',
    commonError: 'Trying to hit over the keeper — you should feel the ball ping off the bat face. You\'re a ramp, not a bat.',
    progressionNext: 'shot-switch-hit',
    keyPoints: ['Get low', 'Early contact', 'Redirect not swing'],
    commonMistakes: ['Not getting low', 'Swinging at it instead of redirecting', 'Wrong angle on bat face'],
  },
  {
    id: 'shot-lofted-drive',
    name: 'Lofted Drive (Over the Infield)',
    category: 'shots',
    level: 'advanced',
    duration: 20,
    xp: 110,
    emoji: '🏏',
    problem: 'Hitting lofted drives straight to fielders or mishitting to mid-on because of head position and bat angle at contact',
    measurement: 'Target: 7/10 lofted drives landing in the arc between extra cover and mid-off at a height that clears fielders',
    youtubeUrl: DRILL_VIDEOS['lofted-drive'],
    steps: [
      'First: establish the correct arc. Stand at the crease, look at the gap between extra cover and mid-off. That is where the ball goes. Not "up" — through that gap but at 15° elevation',
      'The fundamental difference from a flat drive: your WEIGHT stays back slightly longer — you hit through the ball not down on it',
      'Front foot placement: slightly more toward extra cover than a flat drive — this opens the bat face naturally',
      'At contact: lead elbow has already gone through. The bat face is angled 10-15° toward the sky — not flat',
      'Head position: UP slightly at contact — not down on the ball as with a flat drive. This is counterintuitive and must be trained',
      'Practice: slow feed, focus only on keeping head up at contact. Get 8/10 clearing an imaginary fielder at 15 yards',
      'Add a physical marker: a cone at the 15-yard fielding position. Clear it. This makes the elevation real'
    ],
    keyFocus: 'Head up at contact — this is what elevates the ball. Everything else is the same as your flat drive',
    commonError: 'Head goes DOWN at contact (instinct from all flat-drive practice). Consciously look at the sky as you hit — this feels wrong but IS correct.',
    progressionNext: 'decision-field-reading',
    keyPoints: ['Head up at contact', 'Bat face angled at sky', 'Hit through not down'],
    commonMistakes: ['Head going down at contact', 'Hitting too early', 'Wrong direction (mid-on instead of cover)'],
  },
  {
    id: 'shot-yorker-defence',
    name: 'Yorker Defence',
    category: 'shots',
    level: 'advanced',
    duration: 20,
    xp: 100,
    emoji: '🏏',
    problem: 'Being bowled or LBW to a good yorker, especially in death overs',
    measurement: 'Target: 8/10 yorkers jammed out successfully with no dismissal and no edged into stumps',
    youtubeUrl: yt('yorker batting technique defence T20 death overs'),
    steps: [
      'Understand: a good yorker gives you less time than any other delivery. You cannot be late. The decision to jam down must be INSTANT',
      'Pre-load your trigger movement lower than usual — your stance is slightly more bent at the knee when facing a yorker bowler',
      'Spot the release: yorkers typically come from a higher arm action. Identify this in the first 2-3 balls of the spell',
      'Front foot goes FORWARD and DOWN — you want to smother the ball at or just past the crease line, not at your feet',
      'The bat comes STRAIGHT DOWN — not angled, not pulled across. The bat face is 90° to the pitch, going directly down',
      'Bottom hand is firm — this is one of few shots where the bottom hand grips tightly to stop the bat deflecting into the stumps',
      'Practice: feeder stands 6m away (shorter than normal) and throws slow yorkers. Focus on downward jab — the only goal is "did it hit the middle third of the bat?"'
    ],
    keyFocus: 'Down and forward simultaneously — the bat and the front foot move together in one motion',
    commonError: 'Front foot goes back (instinct for a full ball you want to drive). You must override this reflex — go FORWARD even when it feels counterintuitive.',
    progressionNext: 'decision-death-overs',
    keyPoints: ['Straight bat down', 'Front foot forward not back', 'Bottom hand firm'],
    commonMistakes: ['Stepping back', 'Angling bat', 'Playing too late'],
  },
];

// ================================================================
// DECISION-MAKING DRILLS
// These are the UNIQUE drills — solving problems you can't find
// by Googling "how to play a cover drive"
// ================================================================
var DECISION_DRILLS = [
  {
    id: 'decision-offstump-leave',
    name: 'Off-Stump Leave Discipline',
    category: 'decisions',
    level: 'intermediate',
    duration: 20,
    xp: 130,
    emoji: '🎯',
    problem: 'Edging behind or to slip off balls outside off stump that should have been left. 73% of Test match dismissals come from balls on or outside off stump.',
    measurement: 'Track each ball: LEFT correctly / PLAYED correctly / Wrong leave / Wrong play. Target: 90%+ correct decisions over 30 balls',
    youtubeUrl: yt('off stump leave discipline cricket batting decision making'),
    steps: [
      'Place a cone or chalk mark on off stump — this is your decision line. Balls OUTSIDE this line should be left unless they are attacking deliveries at your stumps',
      'Stand at the crease with NO BAT. Feeder bowls 10 balls — half inside off stump, half outside. Your task: call "PLAY" or "LEAVE" out loud before the ball reaches you. No bat, just calling.',
      'Add bat: same drill but with bat in hand. If you called "LEAVE" — bat stays in your stance position. If "PLAY" — you play. Calling out loud FIRST is the rule.',
      'Introduce scoring: every correct call = 1 point. Every wrong play (played at an outside-off ball) = -2 points. Every wrong leave (left a ball on your stumps) = -3 points.',
      'Feeder variation: 5 balls per over, mix of outside off, on off, and on stump. Your calling must happen as the ball leaves the hand.',
      'Progress test: 3 overs of normal net bowling. Track on a scorecard: leave/play decision on every single ball. Target: 90%+ correct.',
      'Advanced: feeder sometimes calls "SWING" before releasing — this changes the leave decision. Practice updating mid-delivery.'
    ],
    keyFocus: 'Call before you decide. Saying "LEAVE" out loud commits your brain before the reflex to play kicks in',
    commonError: 'Making the decision too late (after the ball passes the crease). The decision must be made when the ball is in the FIRST HALF of its flight.',
    progressionNext: 'decision-scoring-rotation',
    keyPoints: ['Call out loud', 'Decision in first half of delivery', 'Correct leave = run saved'],
    commonMistakes: ['Deciding too late', 'Playing at anything that moves toward you', 'Not tracking the line of the ball early enough'],
  },
  {
    id: 'decision-short-ball',
    name: 'Short Ball: Play, Duck, or Hook Decision',
    category: 'decisions',
    level: 'intermediate',
    duration: 25,
    xp: 140,
    emoji: '🎯',
    problem: 'Getting into trouble with short-pitched bowling because you play the SAME response (pull, duck, or sway) to EVERY short ball, rather than the right response to each specific ball',
    measurement: 'Track 3 decisions: correct play (hook/pull) / correct evade (duck/sway) / wrong call. Target 85%+ correct',
    youtubeUrl: yt('short ball cricket batting decision duck hook pull technique'),
    steps: [
      'Establish the 3-ball taxonomy you MUST recognise: Ball A = head height or above, angled into body → DUCK (let it pass over you); Ball B = shoulder height, outside off → SWAY away; Ball C = hip to shoulder height, outside off → PULL/HOOK',
      'Feeder throws from 8 metres at slow pace. You call the ball type ("DUCK", "SWAY", or "HOOK") before it arrives. No bat for the first 15 balls — just reading and calling.',
      'Add a physical response: for DUCK, bend knees and go under. For SWAY, lean slightly back. For HOOK, play the shot. Feeder gives feedback on correct identification.',
      'Same drill at full pace — recognition must happen in under 0.3 seconds. The CALL happens as the ball leaves the hand, not after.',
      'Critical: introduce feeder mixing in full balls with short balls. The full ball gets driven. If you pull a full ball, penalty: 2 press-ups. This trains the LENGTH read alongside the height read.',
      'Final test: 2 overs of genuine short-pitched bowling. Feeder tracks your correct vs incorrect responses. Your target is no "wrong hooks" (trying to pull a ball that should be ducked).'
    ],
    keyFocus: 'The first frame of the delivery tells you the length — commit to your read before the ball is halfway',
    commonError: 'Treating all short balls as "pull balls" — this gets you hit, hit a top-edge, or LBW when you misread. Three different answers to three different balls.',
    progressionNext: 'decision-pressure-net',
    keyPoints: ['Three ball types, three responses', 'Call before contact', 'Full ball = drive, not pull'],
    commonMistakes: ['Trying to hook balls above head height', 'Ducking hookable balls', 'Same trigger movement for all short balls'],
  },
  {
    id: 'decision-scoring-rotation',
    name: 'Score Rotation Under Pressure',
    category: 'decisions',
    level: 'intermediate',
    duration: 20,
    xp: 120,
    emoji: '🎯',
    problem: 'Staying on strike too long in middle overs because you can\'t find the single, then panicking and playing a high-risk shot instead of rotating strike properly',
    measurement: 'Target: in 6 simulated overs, score 65%+ of your runs in singles. No more than 2 dot balls in a row.',
    youtubeUrl: yt('cricket batting strike rotation singles gap finding technique'),
    steps: [
      'Set a field: cone at mid-off, mid-on, cover, mid-wicket, square leg, fine leg. 4 gaps identified (between each cone pair). Before each ball, NAME the gap you are targeting: "cover-point gap" or "mid-wicket gap".',
      'Feeder bowls a full over (6 balls). Your ONLY goal is to hit the gap you called and take 1 run. Not a boundary — a pushed single.',
      'Penalty structure: dot ball = -1 point. Single = +2. Boundary = +1 (boundaries are good but singles are the habit). Wrong gap = 0 (you named cover, hit mid-on — not a success).',
      'Variation drill: feeder places one of the cones randomly before each ball — you must find a new gap. This trains reading the field in real time.',
      'Pressure version: partner calls "last ball of the over" on a random ball. You must now score off it regardless — the mental pressure of a "mandatory" scoring moment.',
      'Track your dot ball count over 6 overs. No more than 2 dots in succession. When you hit 3 consecutive dots, this is the trigger to play the rotation shot — not the big shot.'
    ],
    keyFocus: 'Name the gap before the ball is bowled. Your feet go toward where you named.',
    commonError: 'Hitting to the fielder and calling it "bad luck." Gap selection is a skill — a fielder at mid-off means there\'s a gap at cover. It\'s already there. Find it.',
    progressionNext: 'decision-field-reading',
    keyPoints: ['Name gap before delivery', 'Singles are the goal', 'Field reading first'],
    commonMistakes: ['Hitting to fielders repeatedly', 'No pre-ball intention', 'Panic big-hitting after dot balls'],
  },
  {
    id: 'decision-field-reading',
    name: 'Real-Time Field Reading',
    category: 'decisions',
    level: 'advanced',
    duration: 20,
    xp: 150,
    emoji: '🎯',
    problem: 'Hitting your best shot directly to a fielder who was specifically placed for it — because you didn\'t read the field before the ball was bowled',
    measurement: 'In 3 overs (18 balls), track: pre-ball field scan done / gap found / hit to gap. Target 70%+ of scoring shots going to the gap you identified.',
    youtubeUrl: yt('cricket batting reading the field gap finding T20 strategy'),
    steps: [
      'Rule 1: after each ball, you have 6 seconds before the next delivery. In those 6 seconds, you must scan EVERY fielder and name ONE gap. Out loud or silently.',
      'Feeder sets a specific field (6-7 cones). Before each ball, you call the gap. Then feeder varies lines — some balls will be deliverable to your chosen gap, some won\'t be.',
      'Track: when the right ball came for your gap, did you execute? When a different ball came, did you correctly redirect to a different shot?',
      'Advanced: feeder moves one cone between each ball, without warning. You must update your field reading each delivery. Name the NEW gap.',
      'Captain\'s mind drill: feeder describes a match situation ("they\'ve brought mid-on up, straightened extra cover"). You describe what shot and line you\'ll look to play and why. Justify your plan before facing.',
      'Final level: full net session where you must narrate your field reading out loud before every third ball. Coach confirms or corrects your reading. This builds the habit of conscious field awareness.'
    ],
    keyFocus: 'After each ball you play, your first action is looking at the fielders — not thinking about what you just hit',
    commonError: 'Reading the field at the start of your innings and not updating. Fields change — captains move fielders every few overs specifically to exploit your patterns.',
    progressionNext: 'decision-death-overs',
    keyPoints: ['Scan after every ball', 'Name the gap before delivery', 'Update when field moves'],
    commonMistakes: ['One-time field reading', 'Ignoring fielder movements', 'Playing favorite shots regardless of field'],
  },
  {
    id: 'decision-death-overs',
    name: 'Death Overs Decision Tree',
    category: 'decisions',
    level: 'advanced',
    duration: 25,
    xp: 170,
    emoji: '🎯',
    problem: 'Inconsistent performance in overs 17-20 because you don\'t have a pre-programmed decision framework — you\'re improvising under maximum pressure',
    measurement: 'In 3 simulated death overs, track: correct shot selection vs panic shots. Target: 0 dismissals from wrong shot selection in 18 balls.',
    youtubeUrl: yt('T20 death overs batting strategy decision making cricket'),
    steps: [
      'Build your personal decision tree first (write it down): Full ball = drive/loft. Short ball = pull/upper cut. Yorker = jam out. Wide = cut/ramp. This is your MAP.',
      'Death bowling specific: identify which bowlers bowl what variations in your competition. Build their threat map in your mind before you walk out.',
      'Pressure simulation: feeder shouts "YOU NEED 14 OFF 6" before starting a mini-over. Same deliveries as without pressure — but your brain is different. Track what changes.',
      'Feeder bowls 3 consecutive yorkers. Your decision: do NOT change shot. Jam out each one. The panic moment — where you try to flip over it on the 3rd — is what gets you out. Own the jam-out.',
      'Trigger word system: before each ball in death, say your trigger under your breath. "Straight." "Width." "Length." One word that focuses your primary read for that delivery.',
      'Full simulation: 3 complete death overs (18 balls), feeder varying between yorker/short/full with a random field. Score everything. After, review which balls you had wrong shot selection on and why.'
    ],
    keyFocus: 'Your decision tree runs before the ball. You\'re not deciding what to do — you\'re EXECUTING a pre-made decision',
    commonError: 'Changing your mind mid-swing (one of the main causes of mishits in death overs). Commit to the shot before the ball arrives.',
    progressionNext: 'decision-pressure-net',
    keyPoints: ['Pre-built decision tree', 'One trigger word per ball', 'Commit before contact'],
    commonMistakes: ['Mid-swing changes', 'Improvising under pressure', 'Playing every ball the same regardless of length'],
  },
  {
    id: 'decision-pressure-net',
    name: 'Pressure Net: The Elimination Game',
    category: 'decisions',
    level: 'advanced',
    duration: 30,
    xp: 180,
    emoji: '🎯',
    problem: 'Performing well in regular nets but falling apart in match situations — the gap between practice performance and game performance',
    measurement: 'Track dismissals in the Elimination Game. Target: surviving 30 balls without a dismissal. Eliminate scoring shots — only survival counts.',
    youtubeUrl: yt('cricket pressure net session survival batting competitive practice'),
    steps: [
      'Rules of the Elimination Game: you start with 3 lives. Every dismissal (edged behind, bowled, LBW, or hit on pads on the line of stumps) costs 1 life. If you last 30 balls with at least 1 life remaining, you win.',
      'Pressure escalation: after every 5 balls survived, the bowler gets to bowl 1 "missile" ball of their choice — their hardest, best delivery. This ball is called "THE CHALLENGE".',
      'Mental rule: if you survive THE CHALLENGE without losing a life, you get 1 extra life. This rewards composure under maximum pressure.',
      'No attacking shots in the first 10 balls. Defence, leave, and singles only. Force yourself to build — this trains patience under the pressure of wanting to score.',
      'Between the 10th and 20th ball, 1 boundary per 5 balls allowed. Between 20th and 30th — play your game. But remember: every dismissal costs a life.',
      'Run the Elimination Game 3 times per week for a month. Record your score. The improvement in your match temperament will be visible within 3 weeks.'
    ],
    keyFocus: 'Survival is the skill. Your brain must learn that NOT getting out is a high-value action, not a passive one.',
    commonError: 'Treating this like a scoring competition. Players who focus on not getting out perform better than players trying to impress. The Elimination Game trains that mindset.',
    progressionNext: 'decision-offstump-leave',
    keyPoints: ['Survival first', 'Escalating pressure by design', 'Patience is active not passive'],
    commonMistakes: ['Treating it as a scoring game', 'Attacking too early', 'Giving up after losing a life'],
  },
];

// ================================================================
// BOWLING CRAFT DRILLS
// These are problem-solving bowling drills — not "how to bowl outswing"
// ================================================================
var BOWLING_DRILLS = [
  {
    id: 'bowl-target-line',
    name: 'Line Machine: Off-Stump Targeting',
    category: 'bowling',
    level: 'beginner',
    duration: 20,
    xp: 90,
    emoji: '⚾',
    problem: 'Bowling 2-3 balls per over down the leg side, giving away free runs and opportunities for batters to flick to fine leg',
    measurement: 'Target: 22/24 deliveries in a 4-over spell landing between leg stump and 4 inches outside off. Track each ball.',
    youtubeUrl: yt('cricket bowling line and length targeting accuracy training'),
    steps: [
      'Place a cone or chalk mark exactly 4 inches outside off stump — this is your outer boundary. Place another on off stump itself. You are bowling WITHIN this channel.',
      'Bowl 12 balls at 60% pace. Mark a point on the pitch where each ball lands. Review: how many were in your channel? Where did the errors go?',
      'The most common error is "falling away" at the crease — the front foot drifts toward the return crease, pulling the release point inward. Have someone watch your release point.',
      'Bowling marker drill: place a piece of tape at your ideal front foot landing spot. Every ball, your front foot should land within 4 inches of this marker.',
      'Increase to 80% pace. Maintain the channel. Accuracy at high pace requires the same front foot position — the error usually comes from chasing pace at the expense of line.',
      'Channel discipline over: 6 balls, no wides, no balls outside leg stump, no balls more than 4 inches outside off. This is a deliverable standard from day 1 — hold yourself to it.'
    ],
    keyFocus: 'Your front foot controls your line. Get your foot right and the rest follows.',
    commonError: 'Bowling at the BATTER instead of the STUMPS. Pick a specific stump and aim at it — not at where the batter is standing.',
    progressionNext: 'bowl-length-zones',
    keyPoints: ['4-inch channel outside off', 'Front foot consistency', 'Aim at stumps not batter'],
    commonMistakes: ['Aiming at the batter', 'Front foot falling away', 'Losing line when increasing pace'],
  },
  {
    id: 'bowl-length-zones',
    name: 'Length Zones: The Four-Zone Map',
    category: 'bowling',
    level: 'intermediate',
    duration: 20,
    xp: 100,
    emoji: '⚾',
    problem: 'Being predictable in length — bowling consistently at the same spot, allowing batters to settle into a rhythm and attack',
    measurement: 'In 24 balls, successfully hit each of the 4 target zones 4+ times. Track which zones you miss most often.',
    youtubeUrl: yt('cricket bowling length zones good length full length yorker bouncer'),
    steps: [
      'Map the 4 zones with chalk or tape on the pitch: Zone 1 = yorker (at crease or just short), Zone 2 = full-pitched (1.5m in front of crease), Zone 3 = good length (3-4m in front of crease), Zone 4 = short (5m+ from crease)',
      'Bowl 6 balls targeting only Zone 3 (good length). Get comfortable with your natural landing zone.',
      'Now mix: feeder calls the zone number as you walk back. You must bowl that zone within 18 inches. Feeder calls AFTER you\'ve started your walk-back — this forces the length change to happen in your mind during the approach.',
      'Seamer version: Zone 1 (yorker) requires you to either drive your body more or lengthen your stride. Zone 4 (short) requires you to go early in the action. Drill both in isolation before mixing.',
      'Spinner version: Zone 2 and 3 get the most drift and dip. Zone 4 is your arm ball territory. Bowl each zone 5 times and note which ones extract the most turn.',
      'Pressure 24-ball over: bowl 4 full overs (24 balls). Mark each zone you hit. Any over with fewer than 3 zone-4 (good length) balls means you\'re bowling too predictable — build in variety.'
    ],
    keyFocus: 'The length decision must be made during your walk-back — not at the crease. By the time you run in, the length is already chosen.',
    commonError: 'All four zones feel different in your body. Zone 1 (yorker) feels like you\'re driving forward. Zone 4 (short) feels earlier in the action. Identify what each one FEELS like — then you can replicate it.',
    progressionNext: 'bowl-variation-timing',
    keyPoints: ['4 distinct zones', 'Decision made in walk-back', 'Each zone has a body feel'],
    commonMistakes: ['Staying in one zone', 'Deciding at crease instead of walk-back', 'Not knowing your natural zone'],
  },
  {
    id: 'bowl-variation-timing',
    name: 'Slower Ball Disguise',
    category: 'bowling',
    level: 'advanced',
    duration: 25,
    xp: 140,
    emoji: '⚾',
    problem: 'Batters reading your slower ball early because your action changes — the body telegraphs the variation before release',
    measurement: 'Video your regular ball and slower ball action from side-on. Target: no visible difference in arm speed, shoulder position, or foot plant between the two.',
    youtubeUrl: yt('cricket slower ball disguise same action off cutter palm ball coaching'),
    steps: [
      'Rule 1 of disguise: the slower ball dies if your ACTION changes. The variation must live in the hand, not the body. Bowl 5 regular balls — then 5 slower balls. Video from the side. Compare arm speed at the release point.',
      'Grip the slower ball but rehearse the SAME full-pace run-up, same arm swing, same shoulder rotation. The change is in the fingers and wrist only.',
      'Feeder test: bowl to a batter who tries to call each delivery ("FAST" or "SLOW") before it reaches them. Their success rate tells you how well you\'re disguising it.',
      'The common tell: wrist position. For an off-cutter, the wrist rotates slightly inward. Practice keeping the wrist showing the same angle until the moment of release — then rotate.',
      'Add physical markers: tape a small mark on the seam. For your regular ball, it must be upright at release. For off-cutter, sideways at release. Nothing else changes.',
      'Match simulation: bowl 3 overs at full pace. In each over, slip in 1-2 slower balls. Count how many get middled (batter adjusted) vs how many swing and miss or miscue. Target: 1/3 slower balls effective.'
    ],
    keyFocus: 'Same body, different hand. Your body is the disguise — everything else is delivery mechanics',
    commonError: 'Slowing down your run-up slightly when bowling the slower ball. This is the most common tell — often unconscious. Have a teammate watch specifically for this.',
    progressionNext: 'bowl-pressure-spell',
    keyPoints: ['Action identical until release', 'Change lives in fingers only', 'Video check your tell'],
    commonMistakes: ['Slowing run-up', 'Changed arm angle', 'Different jump at crease'],
  },
  {
    id: 'bowl-pressure-spell',
    name: 'The Pressure Spell: 30 Balls, No Loose Deliveries',
    category: 'bowling',
    level: 'advanced',
    duration: 30,
    xp: 160,
    emoji: '⚾',
    problem: 'Bowling well for 3-4 overs then having a "brain fade" delivery — a full toss, a half-tracker, or a wide that costs 6-10 runs and breaks the pressure you\'ve built',
    measurement: 'Define "loose" as: full toss, ball more than 6 inches outside off, ball 3+ inches down leg side, or ball above shoulder height. Target: 0 loose deliveries in 30 balls.',
    youtubeUrl: yt('cricket bowling consistency pressure spell line length discipline'),
    steps: [
      'Define your loose delivery before starting. Write it down. Be specific about what counts as "loose" for YOU — your worst delivery type.',
      'Bowl 5 overs (30 balls). After EACH BALL, call it yourself: "GOOD" or "LOOSE." Don\'t wait for a batter\'s reaction or a coach\'s feedback — self-call in real time.',
      'Every loose delivery: stop. Walk the whole way back to your mark. Take a breath. Rebuild your bowling shape in your mind before bowling the next ball. This creates a physical reset habit.',
      'Add a penalty that you self-administer: 5 press-ups for every loose ball in the spell. This creates accountability without external pressure.',
      'Track over 5 sessions: how many loose deliveries per 30-ball spell? The number should decrease each session. When you get to 0 in one session, that\'s a milestone.',
      'Match application: before every over you bowl, remind yourself of your "loose delivery definition." One second, before you start your walk-back on ball 1. This primes the focus.'
    ],
    keyFocus: 'Self-call after every delivery. The habit of honest self-assessment in real time is the entire skill being developed here.',
    commonError: 'Justifying loose deliveries ("the batter played it well" or "it moved in the air"). A loose delivery is defined by WHERE it pitches, not what the batter does with it.',
    progressionNext: 'bowl-target-line',
    keyPoints: ['Self-call each delivery', 'Defined "loose" before starting', 'Physical reset after each loose ball'],
    commonMistakes: ['Rationalising loose deliveries', 'No reset after mistakes', 'Inconsistent standard'],
  },
  {
    id: 'bowl-seam-position',
    name: 'Seam Presentation Consistency',
    category: 'bowling',
    level: 'intermediate',
    duration: 20,
    xp: 110,
    emoji: '⚾',
    problem: 'The ball not swinging or seaming as expected because the seam is not consistently upright at release — the single biggest technical difference between club and professional seamers',
    measurement: 'Video your release from behind. Target: seam perfectly upright in 18+ out of 24 deliveries.',
    youtubeUrl: yt('cricket seam bowling seam position upright release swing'),
    steps: [
      'Start with grip. The seam should sit between the first two fingers, with the thumb underneath. Both fingers are ON the seam, not beside it. This is the single most important starting point.',
      'Tape the ball: put white tape across the seam on one side. When you bowl, the tape should be clearly visible pointing straight ahead in your video. If the tape is angled, the seam is tilting.',
      'Slow bowling drill: bowl 10 balls at 40% pace focusing ONLY on seam position. Not line, not length — just seam. Feel what upright seam release feels like in your wrist.',
      'The wrist behind the ball: your wrist should be directly behind the ball at release, pushing the ball toward the target. If the wrist rolls to the side, the seam goes with it.',
      'Back-to-back video: record 10 balls at full pace. Watch the release frame. How many are truly upright? Circle the ones where the seam is angled — identify which direction it falls.',
      'The fix: if seam tilts toward leg (common), your wrist is pronating early. If seam tilts away, your wrist is supinating. Identify which problem you have and isolate the wrist position in front of a mirror.'
    ],
    keyFocus: 'Seam upright at the moment the ball leaves your fingers — not at the start of your action, not at the top of your swing. AT release.',
    commonError: 'Trying to grip tighter to keep the seam in place. Tight grip kills seam movement — loose, relaxed fingers with precise seam position is the goal.',
    progressionNext: 'bowl-variation-timing',
    keyPoints: ['Fingers on seam', 'Wrist behind ball at release', 'Loose grip, precise position'],
    commonMistakes: ['Gripping too tight', 'Wrist rotating before release', 'Fingers beside not on seam'],
  },
];

// ================================================================
// FIELDING ELITE DRILLS
// Genuine elite fielding development — not "how to take a catch"
// ================================================================
var FIELDING_DRILLS = [
  {
    id: 'field-first-step',
    name: 'First-Step Explosion',
    category: 'fielding',
    level: 'intermediate',
    duration: 15,
    xp: 90,
    emoji: '🏃',
    problem: 'Being 0.3-0.5 seconds slow to react to the ball off the bat — the gap between saving 1 run and conceding 2',
    measurement: 'From ball-on-bat to first foot moving: target under 0.25 seconds. Use video and count frames (30fps camera = 0.033s per frame)',
    youtubeUrl: yt('cricket fielding first step reaction explosive movement'),
    steps: [
      'Start position: weight on balls of feet (not flat), slight lean forward, knees bent at 10-15°. This is not static standing — this is a coiled position. Practice holding it for 5 seconds without looking like you\'re going anywhere.',
      'Reaction ball drill: stand 3 metres from a partner. They throw a reaction ball (or regular ball) in any direction without warning. Your first step must be instantaneous. 20 reps.',
      'Pre-ball trigger: use the bowler\'s front foot landing as your trigger. As the front foot hits, your weight shifts further forward onto the balls of your feet. This shortens your reaction time by 0.1-0.2 seconds.',
      'Shadow drill: feeder points left or right silently. You SPRINT one step in that direction. No ball. Just explosive first step. 15 reps each direction. The first step should leave a scuff mark — that\'s how explosive it needs to be.',
      'With ball: partner hits grounders at varying angles. Your first step is the test — get to the ball in fewest possible total steps. Count steps each time. Fewer = better first step.',
      'Weekly test: measure your reaction time with a partner counting from the moment the bat makes contact to your first foot moving. Track weekly.'
    ],
    keyFocus: 'Your weight is already moving when the bat hits the ball — not after you SEE where it\'s going',
    commonError: 'Watching the ball before moving. Elite fielders move based on PREDICTION (pre-ball read), not reaction (post-bat read). The ball confirms your direction — your body starts moving from prediction.',
    progressionNext: 'field-ground-barrier',
    keyPoints: ['Weight already transferring at bat-contact', 'Coiled ready position', 'Pre-ball trigger movement'],
    commonMistakes: ['Flat-footed starting position', 'Watching before moving', 'No pre-ball preparation'],
  },
  {
    id: 'field-ground-barrier',
    name: 'Ground Fielding: Long Barrier Technique',
    category: 'fielding',
    level: 'beginner',
    duration: 15,
    xp: 80,
    emoji: '🏃',
    problem: 'The ball going through your hands or legs when stopping a hard ground drive — the long barrier technique is the safest and most consistent stop, but it requires drilling',
    measurement: 'Track: balls stopped cleanly / balls going through / balls bouncing past. Target: 95%+ clean stops using long barrier',
    youtubeUrl: yt('cricket fielding long barrier technique ground ball stopping'),
    steps: [
      'The long barrier: get DOWN on one knee (the knee of your stronger side). Your standing leg creates a wall — shin to the ground. The knee touches the ground behind the standing foot.',
      'Hands form a cup in front of the standing foot: fingers pointing DOWN, palms facing toward the ball. This is the opposite of catching hands (which face upward).',
      'Body is slightly sideways to the ball — not square on. This means a deflection goes to your stronger side, not between your legs.',
      'Ground the ball FIRST, then gather. Do not try to field and throw in one motion — get the ball under control, then stand and throw.',
      'Drill: 20 slow rollers from a partner, all at your standing foot. Perfect the technique at slow pace first. 20 medium pace. 20 hard.',
      'Pressure drill: partner varies the pace without warning. Some slow (tempting you to field standing up), some hard (requiring the barrier). Use barrier on EVERY ball regardless of pace — the habit must be automatic.'
    ],
    keyFocus: 'The barrier is not for hard balls only — use it on every ground ball until it is automatic',
    commonError: 'Only using the barrier on fast balls and standing up for slow ones. A slow ball that bounces awkwardly at the last second goes through if you\'re standing. Barrier on every ball.',
    progressionNext: 'field-throwing-accuracy',
    keyPoints: ['One knee down', 'Shin creates second wall', 'Hands pointing down'],
    commonMistakes: ['Only using on fast balls', 'Not getting low enough', 'Rushing to throw before the ball is secure'],
  },
  {
    id: 'field-throwing-accuracy',
    name: 'Flat Throw Accuracy Under Pressure',
    category: 'fielding',
    level: 'intermediate',
    duration: 20,
    xp: 110,
    emoji: '🏃',
    problem: 'Overthrows — the ball going to the boundary after a fielding error — caused by throwing at the stumps rather than hitting them',
    measurement: 'Target: 20 throws from 25 metres, 15+ hitting the stumps directly or bouncing in to keeper within 0.5m',
    youtubeUrl: yt('cricket fielding throwing accuracy direct hit stumps training'),
    steps: [
      'Stance before throwing: after fielding the ball, your momentum must be going TOWARD the target, not sideways. Take one gathering step that points your front shoulder at the stumps.',
      'The throw: NOT a baseball overhead throw — a low, flat, fast throw that hits the stumps at stump height (30cm). High throws give keepers decision-making problems and miss more often.',
      '25-metre throwing drill: place stumps at the target. From 25 metres, throw 20 times. Measure how many are accurate. Track over 4 weeks.',
      'Add movement: field the ball on the move from either side. Your gathering step must still point you at the stumps before you throw. This is the hardest part — momentum going sideways must be converted to target-direction.',
      'Pressure version: with a partner running between wickets, you have under 3 seconds. Speed becomes necessary. But accuracy must come first — a fast throw 2 metres wide is always worse than a slightly slower accurate one.',
      'Non-dominant hand: develop a basic underarm/side-arm throw from your non-dominant side. Just 10/20 in every session. Over 3 months, this becomes a genuine weapon.'
    ],
    keyFocus: 'Front shoulder pointed at target BEFORE you throw — your body\'s direction tells the ball where to go',
    commonError: 'Throwing while sideways or off-balance. The ball cannot be accurate when your body momentum is going the wrong direction. Stop, align, then throw — even if it costs 0.5 seconds.',
    progressionNext: 'field-relay-throw',
    keyPoints: ['Front shoulder at target', 'Low flat throw', 'Alignment before release'],
    commonMistakes: ['Throwing off-balance', 'Throwing too high', 'Not completing gathering step'],
  },
  {
    id: 'field-high-catch',
    name: 'High Catch Under Pressure and Movement',
    category: 'fielding',
    level: 'intermediate',
    duration: 20,
    xp: 120,
    emoji: '🏃',
    problem: 'Dropping catches under the highest balls because of sun, communication breakdown, or wrong eye position at contact',
    measurement: 'Target: 10 consecutive high catches (8-12 metres) with correct catch technique and calm communication',
    youtubeUrl: yt('cricket high catch technique sky ball communication fielding'),
    steps: [
      'Starting position: face the ball as it goes up. Track it with BOTH EYES until you have a clear read on where it\'s landing.',
      'Move early to the landing spot — do NOT wait until the ball is at peak height. Get to where the ball is going, then SET your feet.',
      'Hands above forehead, fingers spread and pointing UP — the reverse cup. Catch with fingers, not palms. Your face should be behind the hands at contact.',
      'Eyes on ball through contact — do not blink at the last moment (this is automatic but can be trained). Keep eyes fixed through the catch.',
      'Communication: if two fielders converge, whoever has the best angle calls "MINE" loudly. Calling must happen when the ball is still rising — not at the peak. Calling at peak height is too late.',
      'Sun drill: take 10 catches at various angles relative to the sun. Develop your technique for positioning hands to block sun without losing sight of the ball. This is a specific skill — drill it specifically.'
    ],
    keyFocus: 'Move early to the landing spot — your feet must be SET before the ball arrives, not still moving at contact',
    commonError: 'Moving to the ball and still moving at the point of contact. Arrivals at the catch should be "gathered" — feet planted, body still, then receive the ball.',
    progressionNext: 'field-first-step',
    keyPoints: ['Move early, set feet', 'Hands above head, fingers up', 'Call early not at peak'],
    commonMistakes: ['Still moving at contact', 'Hands at face height (too low)', 'Calling too late when two fielders converge'],
  },
];

// ================================================================
// PARTNERSHIP DRILLS
// ================================================================
var PARTNERSHIP_DRILLS = [
  {
    id: 'partner-calling',
    name: 'Run Calling Under Pressure',
    category: 'partnership',
    level: 'intermediate',
    duration: 20,
    xp: 100,
    emoji: '🤝',
    problem: 'Run-outs from calling confusion, late calls, or one partner not hearing the call — often costs 6-10 runs in wickets and lost runs per innings',
    measurement: 'In 20 simulated running situations, target: 0 run-outs, 0 miscommunications, 18+ correct responses to calls',
    youtubeUrl: yt('cricket running between wickets calling communication drill'),
    steps: [
      'The three calls: "YES" (run immediately), "NO" (do not run), "WAIT" (hold, may run later). Practice each until automatic — they must be instant responses, not thoughts.',
      'Who calls what: striker calls for all balls in FRONT of the crease (drives, flicks). Non-striker calls for all balls BEHIND the crease (cuts, edges, deflections off back-pad). Establish this rule clearly before each partnership.',
      'Volume rule: EVERY call must be loud enough for your partner to hear over crowd noise. Practice by calling across 22 metres with someone between you playing crowd noise through a speaker.',
      'Early call: the call must happen when the ball is hit — not when the ball reaches the fielder. Late calls (after the fielder picks up) are the #1 cause of run-outs. Drill the early call.',
      'Running drill: one batter and one partner on a pitch. Feeder hits grounders to different positions. Batter makes the call, partner responds. Run or stay. Track: early calls / late calls / correct decisions.',
      'Commitment drill: once you call "YES" and both partners commit — you NEVER call "NO" again. The run-out from changing your mind mid-pitch is avoidable. Call right, commit fully, or call "WAIT" early.'
    ],
    keyFocus: 'Call when the ball is hit — not when you see the fielder',
    commonError: 'Waiting to see what the fielder does before calling. By the time you know what the fielder is doing, you\'re already in trouble. The call is based on the BALL PLACEMENT and YOUR READ — not the fielder\'s reaction.',
    progressionNext: 'partner-running-fitness',
    keyPoints: ['Call on impact', 'Loud enough for 22 metres', 'Never change YES to NO after commitment'],
    commonMistakes: ['Calling based on fielder reaction', 'Too quiet', 'Calling too late'],
  },
];

// ================================================================
// MERGE ALL INTO A.DRILLS
// ================================================================
var ALL_NEW_DRILLS = SHOTS_DRILLS.concat(DECISION_DRILLS).concat(BOWLING_DRILLS).concat(FIELDING_DRILLS).concat(PARTNERSHIP_DRILLS);

// Add to existing A.DRILLS or create
if (!A.DRILLS) A.DRILLS = [];

// Remove any existing drills in the 'shots' category (avoid duplicates)
// Mark existing batting/shot drills as category 'shots' if they have matching names
var shotKeywords = ['drive', 'pull shot', 'sweep', 'cut shot', 'hook shot', 'flick', 'scoop', 'ramp', 'switch hit', 'reverse sweep', 'slog'];
A.DRILLS.forEach(function(d) {
  if (!d.category || d.category === 'batting') {
    var name = (d.name || '').toLowerCase();
    var isShot = shotKeywords.some(function(k) { return name.includes(k); });
    if (isShot) d.category = 'shots';
  }
});

// Append new drills (check for duplicate IDs)
var existingIds = new Set(A.DRILLS.map(function(d) { return d.id; }));
ALL_NEW_DRILLS.forEach(function(d) {
  if (!existingIds.has(d.id)) {
    A.DRILLS.push(d);
    existingIds.add(d.id);
  }
});

// Expose category list for UI
A.DRILL_CATEGORIES_V2 = [
  { id: 'all',         label: 'All',           emoji: '🏏' },
  { id: 'shots',       label: 'Shots',         emoji: '🏏' },
  { id: 'decisions',   label: 'Decision Making', emoji: '🎯' },
  { id: 'bowling',     label: 'Bowling Craft',   emoji: '🎯' },
  { id: 'fielding',    label: 'Fielding Elite',  emoji: '🏃' },
  { id: 'keeping',     label: 'Keeping',         emoji: '🧤' },
  { id: 'partnership', label: 'Partnership',     emoji: '🤝' },
  { id: 'fitness',     label: 'Fitness',         emoji: '💪' },
];

console.log('[SC] app-drills-v2 loaded — total drills:', A.DRILLS.length, '| new v2 drills:', ALL_NEW_DRILLS.length);
})();
