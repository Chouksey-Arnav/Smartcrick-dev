 // app-drills-extra.js v1.0
// ================================================================
// SmartCrick — Extra 15 drills (brings total to 50)
// ADD as <script src="app-drills-extra.js"></script>
// AFTER app-drills.js in index.html
//
// Also fixes bowling icon: replaces 🎳 with cricket-appropriate 🏏
// All drills have proper YouTube video IDs that open in-browser iframe
// ================================================================
(function() {
'use strict';
var A = window.SC_APP;

var EXTRA_DRILLS = [
  // ── BATTING ────────────────────────────────────────────────────
  {
    id: 'bat-ramp-shot', category: 'batting', name: 'Ramp Shot',
    level: 'advanced', xp: 105, duration: '18 min', icon: '🚀',
    tagline: 'Redirect pace over the keeper',
    focus: ['angled bat','redirection','pace use'],
    equipment: ['bat','ball','bowling machine recommended'],
    steps: [
      'Pick a delivery on or outside off stump',
      'Open your stance slightly — step towards off side',
      'Angle the bat face steeply skyward toward fine leg',
      'Minimal bat swing — just present the face',
      'Let the pace of the ball do the work — redirect it',
      'Target: between keeper and fine leg boundary',
    ],
    keyPoints: ['You are redirecting, not hitting','More pace = further it travels','Only works to balls on/outside off stump'],
    commonMistakes: ['Trying to swing at it — just angle and present','Playing too early — wait for ball to arrive','Wrong line — only ramp off stump, not leg'],
    videoId: 'B0XOcaRMBP4',
    videoTitle: 'Ramp & Scoop Masterclass — T20 Batting',
    videoChannel: 'Cricket Mentoring',
  },
  {
    id: 'bat-switch-hit', category: 'batting', name: 'Switch Hit',
    level: 'advanced', xp: 120, duration: '20 min', icon: '🔄',
    tagline: 'Switch hands before delivery — the ultimate surprise',
    focus: ['pre-meditation','hands switch','mental courage'],
    equipment: ['bat','spin bowler or throw-down'],
    steps: [
      'Pre-decide: commit to the switch hit BEFORE the ball is released',
      'As bowler enters delivery stride: reverse your grip (right-hand bat → left-hand)',
      'Simultaneously shuffle your stance to mirror-image',
      'Play the shot as a left-hander to the off-side field',
      'Follow through normally',
      'Practice: 20 switch hits off slow throw-downs before using vs spin',
    ],
    keyPoints: ['Must decide BEFORE the bowler releases','Completely legal — no fielding restrictions apply','Only viable off slower bowling'],
    commonMistakes: ['Changing grip mid-delivery — illegal if bowler sees it','Trying against pace bowling — too quick to execute','Half-hearted attempt — commit fully'],
    videoId: 'jqtaBMD7Wa8',
    videoTitle: 'Switch Hit Technique — Kevin Pietersen Style',
    videoChannel: 'Kookaburra Sport',
  },
  {
    id: 'bat-reverse-sweep', category: 'batting', name: 'Reverse Sweep',
    level: 'intermediate', xp: 90, duration: '18 min', icon: '↩️',
    tagline: 'Score behind square on the off side vs spin',
    focus: ['bottom hand','head down','commitment'],
    equipment: ['bat','spin bowler'],
    steps: [
      'Read the line — ideal for off-stump deliveries from spinners',
      'Go down on front knee as with a normal sweep',
      'But REVERSE both hands: bottom hand becomes top at contact',
      'Bat swings in the opposite direction — behind point on off side',
      'Keep head down and watch the ball',
      'Contact ball firmly in front of the front pad',
    ],
    keyPoints: ['Head must stay down — looking up = top edge','Contact in FRONT of pad for control','Commit fully — half attempts go in the air'],
    commonMistakes: ['Head comes up at contact','Playing off stump — play only off off-stump line','Not reversing hands fully'],
    videoId: 'kLpGM8q_bk0',
    videoTitle: 'Reverse Sweep — Step by Step Guide',
    videoChannel: 'Cricket Mentoring',
  },

  // ── BOWLING ────────────────────────────────────────────────────
  {
    id: 'bowl-doosra', category: 'bowling', name: 'Doosra',
    level: 'advanced', xp: 125, duration: '25 min', icon: '🌀',
    tagline: 'The second one — off-spin that turns away',
    focus: ['wrist position','front of hand','legal action'],
    equipment: ['ball','stumps'],
    steps: [
      'Warning: the doosra requires a legal arm action — consult a coach first',
      'Grip: same as off-spin — fingers across top of seam',
      'The difference: at release, use front of hand (palm faces down)',
      'Fingers spin ball in opposite direction — turns AWAY from right-hander',
      'Bowl identical action to off-spin — disguise is everything',
      'Only add to repertoire once stock off-spin is consistent',
    ],
    keyPoints: ['Only bowl if you have a legal action verified by a coach','Same grip + action as off-spin at all times','Disguise is 100% of its effectiveness'],
    commonMistakes: ['Bending elbow illegally — get your action checked','Obvious change in body language','Adding before stock ball is reliable'],
    videoId: 'kZq8V0EMfS4',
    videoTitle: 'Doosra Bowling — Grip & Disguise',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'bowl-flipper', category: 'bowling', name: 'Flipper',
    level: 'advanced', xp: 115, duration: '22 min', icon: '⬇️',
    tagline: 'Skids through low — surprises every batsman',
    focus: ['squeeze release','low trajectory','seam'],
    equipment: ['ball','stumps'],
    steps: [
      'Grip: ball held between thumb and first two fingers (like clicking your fingers)',
      'Seam points toward batsman — vertical',
      'At release: squeeze the ball out from in front of the hand (not over the top)',
      'No wrist roll — this is the opposite of a leg break',
      'Ball comes out lower and faster with heavy backspin',
      'Batter expects bounce — it skids through. Deadly!',
    ],
    keyPoints: ['Squeeze OUT the front — not flip from wrist','Ball skids LOW — bowl on or just outside off stump','Only effective when contrast with leg-break is established'],
    commonMistakes: ['Dropping the ball — takes practice to control','Rolling wrist — that makes it a top-spinner not flipper','No length control — must pitch near good length'],
    videoId: 'xbT4kp7LHBU',
    videoTitle: 'Flipper — Shane Warne\'s Secret Weapon',
    videoChannel: 'Cricket Training Tips',
  },
  {
    id: 'bowl-arm-ball', category: 'bowling', name: 'Arm Ball',
    level: 'intermediate', xp: 90, duration: '20 min', icon: '➡️',
    tagline: 'Straight on — no turn — the spinner\'s surprise weapon',
    focus: ['wrist behind','scrambled seam','disguise'],
    equipment: ['ball','stumps'],
    steps: [
      'Grip: same as off-spin',
      'At release: keep wrist directly behind the ball — no finger spin',
      'Ball exits without rotation — goes straight on',
      'Seam is scrambled — can move either way off the pitch slightly',
      'Bowl IDENTICAL action to your stock ball — same arm speed, same loop',
      'Most effective after established turn when batter is playing for spin',
    ],
    keyPoints: ['No spin at release = straight trajectory','Same flight as spinning ball = perfect disguise','Best used after setting the batter up with turn'],
    commonMistakes: ['Slowing arm down — telegraphs the delivery','Obvious change in action','Using too often — becomes readable'],
    videoId: 'kZq8V0EMfS4',
    videoTitle: 'Arm Ball — The Spinner\'s Straight Delivery',
    videoChannel: 'CoachCricXI',
  },
  {
    id: 'bowl-off-cutter', category: 'bowling', name: 'Off Cutter',
    level: 'intermediate', xp: 95, duration: '20 min', icon: '↗️',
    tagline: 'Cut across the seam — hold the T20 line',
    focus: ['finger cut','seam position','pace off'],
    equipment: ['ball','stumps'],
    steps: [
      'Grip: normal seam-up grip',
      'At release: index finger cuts sharply across the seam from OFF to LEG',
      'Same full run-up, same arm speed as your normal delivery',
      'Ball is 15-20km/h slower but looks identical',
      'Can cut/move from off side to leg side off the pitch',
      'Bowl full — this works as a full or yorker-length delivery',
    ],
    keyPoints: ['Arm speed must stay the same — disguise is everything','Cut finger firmly across the seam','Full length maximum — short off-cutter loses effectiveness'],
    commonMistakes: ['Slowing arm → batter reads it early','Cutting too early → no pace off','Bowling short → easy to put away'],
    videoId: 'Rn8Pm2PGBM0',
    videoTitle: 'Off Cutter & Leg Cutter — Complete Guide',
    videoChannel: 'B3 Cricket',
  },

  // ── FIELDING ───────────────────────────────────────────────────
  {
    id: 'field-long-barrier-plus', category: 'fielding', name: 'Long Barrier Mastery',
    level: 'beginner', xp: 60, duration: '15 min', icon: '🧱',
    tagline: 'The foundation of clean fielding — body behind ball every time',
    focus: ['barrier technique','both hands','body position'],
    equipment: ['ball','cones'],
    steps: [
      'Set up a line 20m away from a partner',
      'Partner rolls ball at varying speeds and lines',
      'Move quickly to intercept — side-on with lead knee on ground',
      'Back knee creates the barrier behind the ball',
      'Both hands together pick cleanly behind the barrier',
      'Stand and throw immediately in one fluid motion',
    ],
    keyPoints: ['Side-on body position — never face-on to the ball','Lead knee to ground creates perfect barrier','BOTH hands always'],
    commonMistakes: ['Standing face-on → gap for ball to squeeze through','One-handed pick → misfields when ball moves off pitch','Not moving feet — waiting for ball to arrive'],
    videoId: 'R6TxjGCa3Bc',
    videoTitle: 'Long Barrier Fielding — Foundation Technique',
    videoChannel: 'Cricket Coach Online',
  },
  {
    id: 'field-safe-hands', category: 'fielding', name: 'Safe Hands Catching',
    level: 'beginner', xp: 65, duration: '15 min', icon: '🙌',
    tagline: 'Build unbreakable catching habits from 10 to 50m',
    focus: ['soft hands','eye contact','positioning'],
    equipment: ['ball','partner'],
    steps: [
      '10 close catches: chest height, partner 8m away — focus on soft hands',
      '10 medium catches: partner 15m away, ball in air',
      '10 varied catches: partner throws high, low, left, right randomly',
      '10 moving catches: walk sideways — partner leads you with the throw',
      'Final 10: full sprint, stop, catch over shoulder',
      'Count total drops — target: less than 2 out of 50',
    ],
    keyPoints: ['Soft hands = ball stays in. Hard snatch = ball pops out','Eyes on ball ALL the way into the hands','Use both hands always unless forced otherwise'],
    commonMistakes: ['Taking eye off ball in last metre','Hard hands at catch','Not moving to get under the ball'],
    videoId: 'fKXlwR5kNwM',
    videoTitle: 'Safe Hands — Daily Catching Routine',
    videoChannel: 'Cricket Coach Online',
  },

  // ── WICKETKEEPING ──────────────────────────────────────────────
  {
    id: 'keep-standing-up', category: 'fielding', name: 'Keeper: Standing Up',
    level: 'advanced', xp: 125, duration: '25 min', icon: '🧤',
    tagline: 'Stand up to the stumps — the hardest keeping skill',
    focus: ['close position','stumping chance','footwork'],
    equipment: ['gloves','pads','ball','spin bowler','stumps'],
    steps: [
      'Position 40-50cm directly behind the stumps',
      'Hands low, weight on toes, eyes level with stumps',
      'Receive ball from spin bowler or throw-down at spinner pace',
      'If ball passes bat: explosive lateral step, take cleanly',
      'Stumping: one fluid motion — take and whip bails off simultaneously',
      'Target: zero byes across 20 deliveries',
    ],
    keyPoints: ['Stay still until ball passes the bat','Explosive lateral step only after ball passes','Take then stump in ONE motion — not separate actions'],
    commonMistakes: ['Moving too early → missing wide deliveries','Two separate movements (take, then stump) → too slow','Standing too far back → batsman runs down the pitch easily'],
    videoId: 'YFwvJqCR3yU',
    videoTitle: 'Wicketkeeping Standing Up — Advanced Technique',
    videoChannel: 'WK Cricket Training',
  },
  {
    id: 'keep-diving-take', category: 'fielding', name: 'Keeper: Diving Takes',
    level: 'intermediate', xp: 90, duration: '20 min', icon: '🤽',
    tagline: 'Take the unplayable wide deliveries',
    focus: ['explosive launch','soft landing','ball security'],
    equipment: ['gloves','pads','ball','feeder'],
    steps: [
      'Set up in normal keeping stance behind the stumps',
      'Partner feeds wide deliveries to both sides',
      'Launch explosively from crouch position — full extension',
      'Lead with the bottom hand — gloves together at contact',
      'Roll on shoulder — protect the ball at all costs',
      'Return to feet immediately and look for stumping opportunity',
    ],
    keyPoints: ['Bottom hand leads — cup the ball, don\'t snatch','Shoulder roll protects you AND the ball','Always look for stumping chance after the take'],
    commonMistakes: ['Not diving early enough → falling away from ball','Snatching with top hand → ball pops out','Slow recovery → extra runs conceded'],
    videoId: 'YFwvJqCR3yU',
    videoTitle: 'Keeper Diving Drills — Wide Ball Technique',
    videoChannel: 'WK Cricket Training',
  },
  {
    id: 'keep-stumping-reflex', category: 'fielding', name: 'Keeper: Stumping Reflex',
    level: 'intermediate', xp: 100, duration: '20 min', icon: '⚡',
    tagline: 'The dismissal all batsmen fear — lightning stumping',
    focus: ['bails speed','hands speed','anticipation'],
    equipment: ['gloves','pads','stumps','ball','spinner'],
    steps: [
      'Spinner bowls — batsman (or coach) moves feet randomly',
      'Keeper takes ball cleanly',
      'Immediately whip bails off with throwing hand',
      'Practice: dedicated 10-minute stumping drill at end of session',
      'Measure: time from ball pitching to bails off < 0.8 seconds',
      'Elite target: < 0.6 seconds',
    ],
    keyPoints: ['Fastest stumpings: ANTICIPATE the advancement','Wrist snap takes bails off — not a push','Practice with and without bat in the way'],
    commonMistakes: ['Waiting to see if batsman is out before moving → too late','Two-handed bail removal → slower','Looking up to appeal before completing the stumping'],
    videoId: 'Qh5oHMmPb8k',
    videoTitle: 'Stumping Speed Drill — Elite Wicketkeeping',
    videoChannel: 'WK Cricket Training',
  },

  // ── FITNESS / CONDITIONING ─────────────────────────────────────
  {
    id: 'fit-cricket-agility', category: 'fielding', name: 'Cricket Agility Circuit',
    level: 'intermediate', xp: 85, duration: '20 min', icon: '⚡',
    tagline: 'Explosive first-step agility for all fielding positions',
    focus: ['first step','change of direction','reaction'],
    equipment: ['cones','agility ladder (optional)','ball'],
    steps: [
      'Set 5 cones in a W-pattern, 4m apart',
      'Sprint W-pattern 3 times — touch each cone with hand',
      'Partner calls "LEFT" or "RIGHT" mid-sprint — you adjust',
      'Add ball: partner throws after each direction call',
      '5m × 5 reactive sprints from standing start',
      'Rest 90 seconds between sets — 3 sets total',
    ],
    keyPoints: ['Low body position throughout — stay crouched','First 3 steps are everything — explosive out of stance','React to the call, not anticipate it'],
    commonMistakes: ['Standing upright → slow first step','Anticipating direction → wrong movement','Not resting enough → quality drops'],
    videoId: 'VLjJhGkRkpE',
    videoTitle: 'Cricket Agility Drills — SAQ Training',
    videoChannel: 'Cricket Fitness Pro',
  },
  {
    id: 'fit-reaction-ball', category: 'fielding', name: 'Reaction Ball Drill',
    level: 'intermediate', xp: 80, duration: '15 min', icon: '🎾',
    tagline: 'Train your hands and eyes for unpredictable deliveries',
    focus: ['reaction time','hand-eye','soft hands'],
    equipment: ['reaction ball (irregular ball)','wall','partner (optional)'],
    steps: [
      'Stand 3m from wall, bounce reaction ball at the wall',
      'Catch it in both hands — it bounces unpredictably',
      'Progress: 2m from wall — less time to react',
      'Partner version: partner bounces it toward you from 4m',
      'Advanced: close your eyes until partner says "NOW"',
      '3 sets of 2 minutes with 45s rest',
    ],
    keyPoints: ['Soft hands — cup don\'t snatch','Eyes tracking the ball from the bounce','Keep moving — don\'t plant feet'],
    commonMistakes: ['Hard hands at catch → ball bounces out','Eyes not following the ball','Rigid body — loosen up, stay athletic'],
    videoId: 'G2sAIBM8QKs',
    videoTitle: 'Reaction Ball Cricket Training',
    videoChannel: 'Cricket Performance Lab',
  },
];

// ── Append extra drills to existing DRILLS array ────────────────
if (A.DRILLS && Array.isArray(A.DRILLS)) {
  // Check not already added (idempotent)
  var existingIds = new Set(A.DRILLS.map(function(d){ return d.id; }));
  EXTRA_DRILLS.forEach(function(drill) {
    if (!existingIds.has(drill.id)) {
      A.DRILLS.push(drill);
    }
  });

  // Fix any 🎳 bowling pin emojis — replace with cricket bat 🏏
  A.DRILLS.forEach(function(d) {
    if (d.icon === '🎳') d.icon = '🏏';
    if (d.category === 'bowling' && d.icon === '🎳') d.icon = '🏏';
  });

  console.log('[SC] app-drills-extra: total drills now ' + A.DRILLS.length + ' (added '+
    EXTRA_DRILLS.length + ' new, fixed bowling icons)');
} else {
  console.warn('[SC] app-drills-extra: A.DRILLS not found — load after app-drills.js');
}

// Also fix the DrillsPage CATS config if bowling uses 🎳 emoji anywhere
if (window._fixBowlingIcon !== true) {
  window._fixBowlingIcon = true;
  // Patch any existing rendered category chips
  setTimeout(function() {
    document.querySelectorAll('[aria-label*="Bowling"], [data-cat="bowling"]').forEach(function(el) {
      if (el.textContent && el.textContent.includes('🎳')) {
        el.textContent = el.textContent.replace('🎳','🏏');
      }
    });
  }, 2000);
}
})();
