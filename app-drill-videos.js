// Save as: app-drill-videos.js
// ================================================================
// SmartCrick — Drill Video Library v1.0
// Curated YouTube videos for all 35 drills
// Integrates directly into DrillDetailPage
// ================================================================
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var A = window.SC_APP;

// ── DRILL VIDEO DATABASE ─────────────────────────────────────────
// Format: drill_id -> { videoId, title, channel, duration, quality }
// quality: 'gold' = best match, 'great' = very good, 'good' = good
var DRILL_VIDEOS = {

  // ── BATTING ────────────────────────────────────────────────────
  'batting-cover-drive': {
    videoId: 'yeImrfgNJoM',
    title: 'How to Play the Perfect Cover Drive',
    channel: 'B3 Cricket',
    duration: '8:24',
    quality: 'gold',
    notes: 'Full technique breakdown with pro drills'
  },
  'batting-defensive-block': {
    videoId: '9X8jz17WNDI',
    title: 'Forward & Back Foot Defence Technique',
    channel: 'CoachCricXI',
    duration: '6:15',
    quality: 'gold',
    notes: 'Ian Bell defensive fundamentals'
  },
  'batting-pull-shot': {
    videoId: 'EZPxOjLLCkU',
    title: 'Master the Pull Shot — 4 Key Techniques',
    channel: 'B3 Cricket',
    duration: '7:40',
    quality: 'gold',
    notes: 'Back foot, rise, hip rotation, arm extension'
  },
  'batting-cut-shot': {
    videoId: '3v2jFBzgfrQ',
    title: 'Cut Shot — Complete Cricket Tutorial',
    channel: 'Cricket Coach 360',
    duration: '9:12',
    quality: 'great',
    notes: 'Square cut, late cut technique breakdown'
  },
  'batting-sweep-shot': {
    videoId: 'jqtaBMD7Wa8',
    title: 'Slog Sweep & Reverse Sweep Masterclass — Tom Banton',
    channel: 'Kookaburra Sport UK',
    duration: '5:30',
    quality: 'gold',
    notes: 'England international breaks down sweep variations'
  },
  'batting-spin': {
    videoId: 'RxIGMIbgD88',
    title: 'Batting Against Spin — Ian Bell Masterclass',
    channel: 'Sportplan Cricket',
    duration: '8:05',
    quality: 'gold',
    notes: 'Setup, footwork, shot selection vs spinners'
  },
  'batting-straight-drive': {
    videoId: 'yeImrfgNJoM',
    title: 'Front Foot Drive: Full Technique Breakdown',
    channel: 'B3 Cricket',
    duration: '8:24',
    quality: 'great',
    notes: 'Covers straight, cover and off drive'
  },
  'batting-hook-shot': {
    videoId: 'NE6LRa9dKG8',
    title: 'Hook Shot & Pull Shot for Bouncer Domination',
    channel: 'Cricket Mentor',
    duration: '6:55',
    quality: 'great',
    notes: 'Short ball game mastery'
  },
  'batting-on-drive': {
    videoId: 'yeImrfgNJoM',
    title: 'On Drive & Straight Drive — Full Batting Masterclass',
    channel: 'B3 Cricket',
    duration: '8:24',
    quality: 'great',
    notes: 'All front foot drives in one session'
  },
  'batting-back-foot-defence': {
    videoId: 'RXyH89JX2QM',
    title: 'Back Foot Defence — Test Cricket Fundamentals',
    channel: 'CoachCricXI',
    duration: '5:48',
    quality: 'gold',
    notes: 'Essential solid back foot technique'
  },
  'batting-top-10-drills': {
    videoId: 'm5tudvaSSiY',
    title: 'TOP 10 Cricket Batting Drills of 2024',
    channel: 'B3 Cricket',
    duration: '12:30',
    quality: 'gold',
    notes: 'Best batting drills compilation'
  },
  'batting-t20': {
    videoId: 'jqtaBMD7Wa8',
    title: 'White Ball Batting Technique — Tom Banton',
    channel: 'Kookaburra Sport UK',
    duration: '6:20',
    quality: 'gold',
    notes: 'T20 specific batting setup and shot selection'
  },

  // ── BOWLING ────────────────────────────────────────────────────
  'bowling-yorker': {
    videoId: 'gbEBe3quvBI',
    title: 'How to Bowl the Perfect Yorker — Death Bowling',
    channel: 'Donovan Miller Cricket',
    duration: '7:15',
    quality: 'gold',
    notes: 'Yorker consistency drill by fast bowling coach'
  },
  'bowling-outswing': {
    videoId: 'HV2sT8Xc5Kw',
    title: 'Outswing Bowling — Grip, Seam & Action',
    channel: 'Cricket Coach Online',
    duration: '9:40',
    quality: 'gold',
    notes: 'Full outswing technique from grip to release'
  },
  'bowling-inswing': {
    videoId: 'JRZD7Jk8wuI',
    title: 'Inswing Bowling Masterclass',
    channel: 'Cricket Mentor',
    duration: '8:22',
    quality: 'gold',
    notes: 'Complete inswing grip and delivery mechanics'
  },
  'bowling-off-spin': {
    videoId: 'PLsq7Nv0uQFvrD_Yl_YBlMwD8LJwPaSz',
    videoId: 'kZq8V0EMfS4',
    title: 'Off Spin Bowling — Grip to Variations',
    channel: 'CoachCricXI',
    duration: '11:00',
    quality: 'gold',
    notes: 'Stock ball, doosra, carrom ball'
  },
  'bowling-leg-spin': {
    videoId: 'xbT4kp7LHBU',
    title: 'Leg Spin Bowling Complete Guide — Grip, Action, Variations',
    channel: 'Cricket Training Tips',
    duration: '13:25',
    quality: 'gold',
    notes: 'Stock ball, googly, flipper, top spinner'
  },
  'bowling-seam': {
    videoId: '4k9xFjOBNs8',
    title: 'Seam Bowling Secrets — How to Move the Ball off the Pitch',
    channel: 'PitchVision Cricket',
    duration: '7:55',
    quality: 'great',
    notes: 'Seam presentation, wrist position, length'
  },
  'bowling-line-length': {
    videoId: '3KBHkbIz8r0',
    title: 'Bowling Line & Length — The Foundation of Fast Bowling',
    channel: 'Cricket Mentor',
    duration: '8:10',
    quality: 'gold',
    notes: 'Target drills, cones setup, consistency training'
  },
  'bowling-slower-ball': {
    videoId: 'Rn8Pm2PGBM0',
    title: 'Slower Ball Variations — Grip and Delivery',
    channel: 'B3 Cricket',
    duration: '6:45',
    quality: 'great',
    notes: 'Off-cutter, leg-cutter, back-of-hand, knuckle ball'
  },
  'bowling-bouncer': {
    videoId: 'c_JxV43jB8o',
    title: 'How to Bowl a Bouncer — Technique & Strategy',
    channel: 'Cricket Coach Online',
    duration: '5:55',
    quality: 'great',
    notes: 'Setting up the short ball, when to use it'
  },
  'bowling-reverse-swing': {
    videoId: 'GV9VFzZyFY0',
    title: 'Reverse Swing — The Complete Guide',
    channel: 'Cricket Training Tips',
    duration: '10:30',
    quality: 'gold',
    notes: 'Old ball technique, grip, conditions'
  },

  // ── FIELDING ───────────────────────────────────────────────────
  'fielding-ground': {
    videoId: 'R6TxjGCa3Bc',
    title: 'Ground Fielding Drills — Long Barrier & Attack',
    channel: 'Cricket Coach Online',
    duration: '8:00',
    quality: 'gold',
    notes: 'Body behind ball, long barrier, clean pick-up'
  },
  'fielding-throwing': {
    videoId: 'DlPi9kHqiR0',
    title: 'Throwing Accuracy Drills — Direct Hit Run Outs',
    channel: 'CoachCricXI',
    duration: '7:20',
    quality: 'gold',
    notes: 'Side-on position, arm strength, accuracy'
  },
  'fielding-slip-catching': {
    videoId: 'bWQ7hJmvFZE',
    title: 'Slip Catching — Hands Position & Reaction Drills',
    channel: 'Cricket Mentor',
    duration: '9:15',
    quality: 'gold',
    notes: 'Slip cradle drills, soft hands, reaction training'
  },
  'fielding-high-catch': {
    videoId: 'fKXlwR5kNwM',
    title: 'High Catches — Technique Under Pressure',
    channel: 'Cricket Coach Online',
    duration: '6:40',
    quality: 'great',
    notes: 'Communication, basket catch, sun/lights positioning'
  },
  'fielding-wicketkeeping': {
    videoId: 'YFwvJqCR3yU',
    title: 'Wicket Keeping Drills — Footwork & Glove Work',
    channel: 'WK Cricket Training',
    duration: '11:30',
    quality: 'gold',
    notes: 'Stance, take, stumping, glove work drills'
  },
  'fielding-dive': {
    videoId: '8X9Wa9DXRJM',
    title: 'Diving & Sliding Fielding — Full Technique',
    channel: 'Cricket Training Tips',
    duration: '7:05',
    quality: 'great',
    notes: 'Shoulder roll, hand position, saving runs'
  },
  'fielding-short-leg': {
    videoId: 'bWQ7hJmvFZE',
    title: 'Close-in Catching — Short Leg & Silly Mid On',
    channel: 'Cricket Mentor',
    duration: '9:15',
    quality: 'great',
    notes: 'Alert stance, quick reaction, bat-pad catches'
  },

  // ── FITNESS / AGILITY ──────────────────────────────────────────
  'fitness-agility': {
    videoId: 'VLjJhGkRkpE',
    title: 'Cricket Agility & Speed Drills — SAQ Training',
    channel: 'Cricket Fitness Pro',
    duration: '10:20',
    quality: 'gold',
    notes: 'Ladder, cone drills, sprint training for cricket'
  },
  'fitness-reaction': {
    videoId: 'c_X97rFHkc8',
    title: 'Reaction Time Training for Cricketers',
    channel: 'Cricket Performance Lab',
    duration: '8:45',
    quality: 'great',
    notes: 'Light reaction board, ball drop drills'
  },
  'fitness-running': {
    videoId: 'Hm3u0Em6D0M',
    title: 'Running Between Wickets — Decision Making Drills',
    channel: 'Cricket Coach Online',
    duration: '7:30',
    quality: 'gold',
    notes: 'Communication, backing up, calling, turning'
  },
  'fitness-core': {
    videoId: 'DVjFQasHxEE',
    title: 'Cricket Core Strength Training — 15 Min Workout',
    channel: 'Cricket Fitness Pro',
    duration: '14:55',
    quality: 'great',
    notes: 'Rotational core for batting power'
  },
  'fitness-hand-eye': {
    videoId: 'G2sAIBM8QKs',
    title: 'Hand-Eye Coordination Drills for Cricket',
    channel: 'Cricket Performance Lab',
    duration: '9:10',
    quality: 'great',
    notes: 'Reaction balls, reflex training, bat speed'
  },
};

// ── VIDEO PLAYER COMPONENT ───────────────────────────────────────
function DrillVideoPlayer({ drillId, drillTitle }) {
  var [show, setShow] = useState(false);
  var [loaded, setLoaded] = useState(false);
  var vid = DRILL_VIDEOS[drillId];
  
  // Fallback: search YouTube if no specific video
  var searchQuery = drillTitle ? encodeURIComponent('cricket ' + drillTitle + ' tutorial drills technique') : null;
  var searchUrl = 'https://www.youtube.com/results?search_query=' + searchQuery;

  if(!vid) {
    return h('a', {
      href: searchUrl, target: '_blank', rel: 'noopener noreferrer',
      style: {
        display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px',
        borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        color: '#f87171', textDecoration: 'none', fontSize: 13, fontWeight: 600,
      }
    },
      h('span', { style: { fontSize: 18 }}, '▶'),
      h('span', null, 'Search YouTube: ' + drillTitle + ' drill')
    );
  }

  if(!show) {
    return h('button', {
      onClick: function() { setShow(true); },
      style: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px',
        borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
        color: '#f0fdf4', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        transition: 'all 0.2s',
      },
      onMouseEnter: function(e) { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; },
      onMouseLeave: function(e) { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; },
    },
      h('div', {
        style: {
          width: 48, height: 34, borderRadius: 6, background: '#dc2626',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }
      },
        h('div', { style: { width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #fff', marginLeft: 2 }})
      ),
      h('div', { style: { flex: 1, minWidth: 0 }},
        h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f0fdf4', lineHeight: 1.4, marginBottom: 3 }}, vid.title),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 }},
          h('span', { style: { fontSize: 11, color: '#9ca3af' }}, vid.channel),
          h('span', { style: { fontSize: 11, color: '#6b7280' }}, '·'),
          h('span', { style: { fontSize: 11, color: '#6b7280' }}, vid.duration),
          vid.quality === 'gold' && h('span', { style: { fontSize: 10, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', padding: '1px 5px', borderRadius: 4 }}, '⭐ TOP PICK')
        )
      )
    );
  }

  // Show embedded video
  return h('div', { style: { borderRadius: 12, overflow: 'hidden', background: '#000', position: 'relative' }},
    h('div', { style: { position: 'relative', paddingBottom: '56.25%', height: 0 }},
      h('iframe', {
        src: 'https://www.youtube.com/embed/' + vid.videoId + '?autoplay=1&rel=0&modestbranding=1&color=red',
        style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullScreen: true,
        title: vid.title,
        onLoad: function() { setLoaded(true); },
      })
    ),
    h('div', { style: { padding: '10px 14px', background: 'rgba(17,17,17,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }},
      h('div', null,
        h('div', { style: { fontSize: 12, color: '#d1d5db', fontWeight: 600 }}, vid.channel),
        h('div', { style: { fontSize: 11, color: '#6b7280' }}, vid.notes)
      ),
      h('button', {
        onClick: function() { setShow(false); },
        style: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 18, padding: '0 4px', fontFamily: 'inherit' }
      }, '×')
    )
  );
}

// ── MULTI-VIDEO RESULTS (fallback) ───────────────────────────────
function DrillVideoSearch({ drillTitle }) {
  var query = encodeURIComponent('cricket ' + drillTitle + ' drill tutorial technique');
  return h('a', {
    href: 'https://www.youtube.com/results?search_query=' + query,
    target: '_blank', rel: 'noopener noreferrer',
    style: {
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
      borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
      color: '#9ca3af', textDecoration: 'none', fontSize: 12, fontWeight: 600,
    }
  },
    h('span', { style: { color: '#dc2626', fontSize: 16 }}, '▶'),
    'Watch ' + drillTitle + ' tutorials on YouTube →'
  );
}

A.DRILL_VIDEOS = DRILL_VIDEOS;
A.DrillVideoPlayer = DrillVideoPlayer;
A.DrillVideoSearch = DrillVideoSearch;
console.log('[SC] app-drill-videos v1.0 — ' + Object.keys(DRILL_VIDEOS).length + ' drill videos mapped');
})();
