// ================================================================
// SmartCrick — Drill Video Map v1.0
// app-drill-video-map.js — loaded AFTER app-drills-data.js, BEFORE app-drills.js
// Maps every drill subcategory → a curated YouTube video.
// Also exports AMBIENT_VIDEOS for the cinematic drill-page background.
// ================================================================
(function () {
  'use strict';
  var A = window.SC_APP;
  if (!A) { console.error('[SC] app-drill-video-map: SC_APP not found'); return; }

  // ── Subcategory → Video ──────────────────────────────────────────
  // Covers all 38 subcategories found in the 500-drill library.
  // Each entry: { videoId, title, channel, quality }
  var SUBCAT_VIDEOS = {

    // ── BATTING ───────────────────────────────────────────────────
    'stance-setup': {
      videoId: 'rk7HGPXWVWY',
      title: 'Batting Stance — Complete Fundamentals',
      channel: 'B3 Cricket',
      quality: 'gold',
    },
    'backlift-pickup': {
      videoId: '2BO8bKuHjXU',
      title: 'Backlift & Pickup Masterclass',
      channel: 'Cricket Coach Online',
      quality: 'gold',
    },
    'footwork-trigger': {
      videoId: 'ZF6CfUF4GAM',
      title: 'Footwork & Trigger Movements — Complete Guide',
      channel: 'CoachCricXI',
      quality: 'gold',
    },
    'front-foot-drives': {
      videoId: 'yeImrfgNJoM',
      title: 'How to Play the Perfect Front Foot Drive',
      channel: 'B3 Cricket',
      quality: 'gold',
    },
    'back-foot-play': {
      videoId: '9X8jz17WNDI',
      title: 'Back Foot Defence & Punch — Technique Masterclass',
      channel: 'CoachCricXI',
      quality: 'gold',
    },
    'pull-hook-cut': {
      videoId: 'EZPxOjLLCkU',
      title: 'Pull Shot, Hook & Cut — 4 Key Techniques',
      channel: 'B3 Cricket',
      quality: 'gold',
    },
    'sweep-reverse-sweep': {
      videoId: 'jqtaBMD7Wa8',
      title: 'Sweep & Reverse Sweep Masterclass — Tom Banton',
      channel: 'Kookaburra Sport UK',
      quality: 'gold',
    },
    'off-side-play': {
      videoId: 'yeImrfgNJoM',
      title: 'Off-Side Batting: Drive, Cut & Dab',
      channel: 'B3 Cricket',
      quality: 'great',
    },
    'on-side-play': {
      videoId: 'EZPxOjLLCkU',
      title: 'On-Side Power: Pull, Hook & Flick',
      channel: 'B3 Cricket',
      quality: 'great',
    },
    'lofted-t20': {
      videoId: 'm5tudvaSSiY',
      title: 'T20 Batting — Lofted Shots & Power Hitting',
      channel: 'B3 Cricket',
      quality: 'gold',
    },
    'game-situation': {
      videoId: 'RxIGMIbgD88',
      title: 'Reading the Game — Ian Bell Batting Masterclass',
      channel: 'Sportplan Cricket',
      quality: 'gold',
    },
    'match-simulation': {
      videoId: 'RxIGMIbgD88',
      title: 'Batting Decision-Making Under Match Pressure',
      channel: 'Sportplan Cricket',
      quality: 'great',
    },

    // ── BOWLING ───────────────────────────────────────────────────
    'seam-swing': {
      videoId: 'JRZD7Jk8wuI',
      title: 'Inswing & Outswing Bowling — Complete Masterclass',
      channel: 'Cricket Mentor',
      quality: 'gold',
    },
    'spin-grip-flight': {
      videoId: 'xbT4kp7LHBU',
      title: 'Leg Spin — Grip, Flight & Variations',
      channel: 'Cricket Training Tips',
      quality: 'gold',
    },
    'spin-variations': {
      videoId: 'kZq8V0EMfS4',
      title: 'Spin Bowling Variations — Off-Spin to Doosra',
      channel: 'CoachCricXI',
      quality: 'gold',
    },
    'line-length': {
      videoId: '3KBHkbIz8r0',
      title: 'Bowling Line & Length — Foundation of Fast Bowling',
      channel: 'Cricket Mentor',
      quality: 'gold',
    },
    'yorker-bouncer': {
      videoId: 'gbEBe3quvBI',
      title: 'How to Bowl the Perfect Yorker & Bouncer',
      channel: 'Donovan Miller Cricket',
      quality: 'gold',
    },
    'pace-variations': {
      videoId: 'Rn8Pm2PGBM0',
      title: 'Slower Ball Variations — Cutters, Knuckle & Palm',
      channel: 'B3 Cricket',
      quality: 'gold',
    },
    'load-delivery-stride': {
      videoId: '4k9xFjOBNs8',
      title: 'Seam Bowling — Load Position & Delivery Stride',
      channel: 'PitchVision Cricket',
      quality: 'great',
    },
    'run-up-alignment': {
      videoId: '3KBHkbIz8r0',
      title: 'Run-Up Alignment & Approach — Consistency Drills',
      channel: 'Cricket Mentor',
      quality: 'great',
    },
    'match-planning-bowl': {
      videoId: 'GV9VFzZyFY0',
      title: 'Bowling Plans — Setting Up & Dismissing Batters',
      channel: 'Cricket Training Tips',
      quality: 'gold',
    },

    // ── FIELDING ─────────────────────────────────────────────────
    'ground-fielding': {
      videoId: 'R6TxjGCa3Bc',
      title: 'Ground Fielding — Long Barrier, Attack & Pick-Up',
      channel: 'Cricket Coach Online',
      quality: 'gold',
    },
    'catching': {
      videoId: 'fKXlwR5kNwM',
      title: 'Catching Masterclass — High Balls & Under Pressure',
      channel: 'Cricket Coach Online',
      quality: 'gold',
    },
    'throwing': {
      videoId: 'DlPi9kHqiR0',
      title: 'Throwing Accuracy — Direct Hit & Run-Out Drills',
      channel: 'CoachCricXI',
      quality: 'gold',
    },
    'keeping-edges': {
      videoId: 'bWQ7hJmvFZE',
      title: 'Slip Catching & Edge Reactions — Drills & Technique',
      channel: 'Cricket Mentor',
      quality: 'gold',
    },
    'diving': {
      videoId: '8X9Wa9DXRJM',
      title: 'Diving & Sliding — Full Fielding Technique',
      channel: 'Cricket Training Tips',
      quality: 'great',
    },
    'positioning-anticipation': {
      videoId: 'R6TxjGCa3Bc',
      title: 'Fielding Positioning & Anticipation Drills',
      channel: 'Cricket Coach Online',
      quality: 'great',
    },

    // ── WICKETKEEPING ────────────────────────────────────────────
    'glove-work': {
      videoId: 'YFwvJqCR3yU',
      title: 'Wicket Keeping — Glove Work & Footwork Drills',
      channel: 'WK Cricket Training',
      quality: 'gold',
    },
    'stumping': {
      videoId: 'YFwvJqCR3yU',
      title: 'Stumping Technique & Reaction Drills',
      channel: 'WK Cricket Training',
      quality: 'gold',
    },
    'stance-footwork': {
      videoId: 'YFwvJqCR3yU',
      title: 'Keeper Stance, Footwork & Take Drills',
      channel: 'WK Cricket Training',
      quality: 'gold',
    },

    // ── FITNESS ──────────────────────────────────────────────────
    'agility-footwork': {
      videoId: 'VLjJhGkRkpE',
      title: 'Cricket Agility & Speed — SAQ Training',
      channel: 'Cricket Fitness Pro',
      quality: 'gold',
    },
    'strength-stability': {
      videoId: 'DVjFQasHxEE',
      title: 'Cricket Core Strength & Stability — 15 Min Workout',
      channel: 'Cricket Fitness Pro',
      quality: 'gold',
    },
    'endurance-conditioning': {
      videoId: 'Hm3u0Em6D0M',
      title: 'Cricket Conditioning & Endurance Training',
      channel: 'Cricket Coach Online',
      quality: 'great',
    },
    'power-explosiveness': {
      videoId: 'c_X97rFHkc8',
      title: 'Explosive Power Training for Cricket',
      channel: 'Cricket Performance Lab',
      quality: 'great',
    },
    'running-between-wickets': {
      videoId: 'Hm3u0Em6D0M',
      title: 'Running Between Wickets — Decision Drills',
      channel: 'Cricket Coach Online',
      quality: 'gold',
    },

    // ── MENTAL ───────────────────────────────────────────────────
    'visualization': {
      videoId: 'G2sAIBM8QKs',
      title: 'Cricket Visualization & Mental Performance',
      channel: 'Cricket Performance Lab',
      quality: 'gold',
    },
    'pre-performance-routines': {
      videoId: 'G2sAIBM8QKs',
      title: 'Pre-Performance Routines for Cricketers',
      channel: 'Cricket Performance Lab',
      quality: 'gold',
    },
    'pressure-adversity': {
      videoId: 'G2sAIBM8QKs',
      title: 'Mental Toughness & Pressure Training',
      channel: 'Cricket Performance Lab',
      quality: 'great',
    },
    'in-play-focus': {
      videoId: 'G2sAIBM8QKs',
      title: 'In-Play Focus & Concentration Drills',
      channel: 'Cricket Performance Lab',
      quality: 'great',
    },
  };

  // ── Category fallback videos ──────────────────────────────────────
  var CAT_FALLBACK_VIDEOS = {
    batting:       { videoId: 'yeImrfgNJoM', title: 'Batting Masterclass', channel: 'B3 Cricket', quality: 'great' },
    bowling:       { videoId: '3KBHkbIz8r0', title: 'Bowling Masterclass', channel: 'Cricket Mentor', quality: 'great' },
    fielding:      { videoId: 'R6TxjGCa3Bc', title: 'Fielding Drills', channel: 'Cricket Coach Online', quality: 'great' },
    wicketkeeping: { videoId: 'YFwvJqCR3yU', title: 'Keeping Drills', channel: 'WK Cricket Training', quality: 'great' },
    fitness:       { videoId: 'VLjJhGkRkpE', title: 'Cricket Fitness', channel: 'Cricket Fitness Pro', quality: 'great' },
    mental:        { videoId: 'G2sAIBM8QKs', title: 'Cricket Mental Skills', channel: 'Cricket Performance Lab', quality: 'great' },
  };

  // ── Ambient background videos by category ────────────────────────
  // Muted, looping, no-controls — plays behind the drill detail page.
  // Batting: iconic cover drives & shots compilations
  // Bowling: greatest spells & inswingers
  // etc.
  var AMBIENT_VIDEOS = {
    batting:       'dEG3f0lfBHM',   // Top 50 Greatest Batting Shots — Cricket Highlights
    bowling:       'KPuHcBDL5oc',   // Greatest Bowling Spells in Cricket History
    fielding:      'gM9jCNTxhEY',   // Best Fielding Moments — ICC Cricket
    wicketkeeping: 'oSIa1yDf1K8',   // Best Wicket Keeping — ICC Cricket
    fitness:       'VLjJhGkRkpE',   // Cricket Agility & SAQ Training
    mental:        'NjkS67_kFU8',   // Cricket — The Mental Game (focus compilation)
  };

  // ── Video resolver ───────────────────────────────────────────────
  // Called by app-drills.js normDrill() to get a video for any drill.
  function getVideoForDrill(drill) {
    // Priority 1: drill already has a real videoId (not PLACEHOLDER)
    var existingId = drill.videoId || drill.video_id || '';
    if (existingId && existingId !== 'PLACEHOLDER') {
      return { videoId: existingId, title: drill.videoTitle || '', channel: drill.videoChannel || '', quality: 'great' };
    }
    // Priority 2: subCategory match
    var subCat = drill.subCategory || '';
    if (subCat && SUBCAT_VIDEOS[subCat]) return SUBCAT_VIDEOS[subCat];
    // Priority 3: category fallback
    var cat = (drill.category || '').toLowerCase();
    if (CAT_FALLBACK_VIDEOS[cat]) return CAT_FALLBACK_VIDEOS[cat];
    // Priority 4: generic cricket drill
    return { videoId: 'yeImrfgNJoM', title: 'Cricket Drill Tutorial', channel: 'B3 Cricket', quality: 'good' };
  }

  // ── Export ────────────────────────────────────────────────────────
  A.DRILL_VIDEO_MAP    = SUBCAT_VIDEOS;
  A.AMBIENT_VIDEOS     = AMBIENT_VIDEOS;
  A.getVideoForDrill   = getVideoForDrill;

  console.log('[SC] app-drill-video-map v1.0 — ' + Object.keys(SUBCAT_VIDEOS).length + ' subcategories mapped, ' + Object.keys(AMBIENT_VIDEOS).length + ' ambient videos');
})();
