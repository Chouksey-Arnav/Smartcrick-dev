// app-preference-ranker.js v1.0
// ================================================================
// SmartCrick — Elo Preference Ranker (Module B: Frictionless Signals)
// Shows a Quick Pick modal every 5 drill/mental completions.
// Exposes: window.SC_PREFER
// ================================================================
(function () {
'use strict';

var h        = React.createElement;
var useState = React.useState;
var A        = window.SC_APP;
var DB       = A.DB;
var nav      = A.nav;

var COUNTER_KEY  = 'pref_counter';
var DISMISS_KEY  = 'pref_dismissals';
var LAST_KEY     = 'pref_last_cycle';
var INTERVAL     = 5;   // show every N training interactions
var MAX_DISMISS  = 3;   // pause after 3 consecutive dismissals
var PAUSE_CYCLES = 10;  // resume after this many more cycles

// ── Trigger Logic ──────────────────────────────────────────────────
function shouldShowQuickPick() {
  var intel = window.SC_INTEL;
  if (!intel) return false;

  var cycles = intel.getProfile().calibration.total_cycles;
  if (cycles < 3) return false; // need some data first

  var lastCycle  = DB.get(LAST_KEY)  || 0;
  var dismissals = DB.get(DISMISS_KEY) || 0;

  // Paused after too many dismissals
  if (dismissals >= MAX_DISMISS) {
    if (cycles - lastCycle < PAUSE_CYCLES) return false;
    DB.set(DISMISS_KEY, 0); // reset after pause
  }

  return (cycles - lastCycle) >= INTERVAL;
}

// ── Pair Selection ─────────────────────────────────────────────────
function getQuickPickPair() {
  var intel = window.SC_INTEL;
  if (!intel) return null;

  var p     = intel.getProfile();
  var drills = A.DRILLS || [];
  if (drills.length < 2) return null;

  // Get top 2 categories by affinity (exclude mental/fitness — no drill pairs)
  var cats = Object.keys(p.drill_affinity.category)
    .filter(function (c) { return c !== 'mental' && c !== 'fitness'; })
    .sort(function (a, b) { return p.drill_affinity.category[b] - p.drill_affinity.category[a]; });

  var cat1 = cats[0] || 'batting';
  var cat2 = cats[1] || 'bowling';
  if (cat1 === cat2) cat2 = cats[2] || 'fielding';

  function pickFromCat(cat) {
    var pool = drills.filter(function (d) { return d.category === cat; });
    if (!pool.length) pool = drills;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  var d1 = pickFromCat(cat1);
  var d2 = pickFromCat(cat2);
  if (!d1 || !d2 || d1.id === d2.id) return null;
  return [d1, d2];
}

// ── Elo Record ─────────────────────────────────────────────────────
function recordChoice(winnerId, loserId, winnerCat, loserCat) {
  if (window.SC_INTEL) {
    window.SC_INTEL.updateOnPreference(winnerId, loserId, winnerCat, loserCat);
    var p = window.SC_INTEL.getProfile();
    DB.set(LAST_KEY, p.calibration.total_cycles);
  }
  DB.set(DISMISS_KEY, 0);
  window.dispatchEvent(new CustomEvent('sc_intel_smarter'));
}

function recordDismissal() {
  if (window.SC_INTEL) {
    var p = window.SC_INTEL.getProfile();
    DB.set(LAST_KEY, p.calibration.total_cycles);
  }
  DB.set(DISMISS_KEY, (DB.get(DISMISS_KEY) || 0) + 1);
}

// ── React Component ────────────────────────────────────────────────
var CAT_EMOJI = { batting:'🏏', bowling:'🎯', fielding:'🤸', fitness:'💪', mental:'🧠', wicketkeeping:'🧤', partnership:'🤝' };
var CAT_COLOR = { batting:'#3b82f6', bowling:'#ef4444', fielding:'#10b981', fitness:'#f97316', mental:'#8b5cf6', wicketkeeping:'#14b8a6', partnership:'#06b6d4' };

function DrillCard(props) {
  var d        = props.drill;
  var selected = props.selected;
  var color    = CAT_COLOR[d.category] || '#16a34a';
  return h('button', {
    onClick:   props.onChoose,
    'aria-label': 'Choose ' + d.title,
    style: {
      flex: 1, padding: '14px 12px', borderRadius: 12,
      border:      '2px solid ' + (selected ? color : 'rgba(255,255,255,0.10)'),
      background:  selected ? (color + '22') : 'rgba(22,27,34,0.95)',
      cursor:      'pointer', fontFamily: 'inherit', textAlign: 'left',
      transition:  'all 0.2s ease',
      transform:   selected ? 'scale(1.03)' : 'scale(1)',
      boxShadow:   selected ? ('0 0 20px ' + color + '55') : 'none',
    }
  },
    h('div', { style: { fontSize: 24, marginBottom: 6, lineHeight: 1 } },
      CAT_EMOJI[d.category] || '🏏'
    ),
    h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f0fdf4', marginBottom: 4, lineHeight: 1.3 } },
      d.title || 'Drill'
    ),
    h('div', { style: { fontSize: 10, fontWeight: 700, color: color, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: d.duration_minutes ? 3 : 0 } },
      d.category || ''
    ),
    d.duration_minutes && h('div', { style: { fontSize: 11, color: '#6b7280' } }, d.duration_minutes + ' min')
  );
}

function QuickPickModal(props) {
  var pair    = props.pair    || [];
  var onClose = props.onClose;
  var [chosen, setChosen] = useState(null);

  if (!pair || pair.length < 2) return null;
  var d1 = pair[0], d2 = pair[1];

  function choose(winner, loser) {
    setChosen(winner.id);
    setTimeout(function () {
      recordChoice(winner.id, loser.id, winner.category, loser.category);
      try {
        if (A.BrainEngine && A.BrainEngine.train) {
          var wCat = (winner.category || '').toLowerCase();
          var lCat = (loser.category  || '').toLowerCase();
          var input = {
            category_batting:  wCat==='batting'  ? 1 : lCat==='batting'  ? 0 : 0.5,
            category_bowling:  wCat==='bowling'  ? 1 : lCat==='bowling'  ? 0 : 0.5,
            category_fielding: wCat==='fielding' ? 1 : lCat==='fielding' ? 0 : 0.5,
            category_mental:   wCat==='mental'   ? 1 : lCat==='mental'   ? 0 : 0.5,
            category_fitness:  wCat==='fitness'  ? 1 : lCat==='fitness'  ? 0 : 0.5,
            drill_level: winner.level === 'beginner' ? 0.25 : winner.level === 'intermediate' ? 0.5 : 0.75,
          };
          var output = { shouldRetry: 0.2, shouldAdvance: 0.5, relevance_boost: 0.9 };
          A.BrainEngine.train('DrillAdaptor', input, output);
        }
      } catch(e) {}
      onClose && onClose('chose');
    }, 500);
  }

  function dismiss() {
    recordDismissal();
    onClose && onClose('dismiss');
  }

  return h('div', {
    style: {
      position: 'fixed', inset: 0, zIndex: 9500,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
    },
    onClick: function (e) { if (e.target === e.currentTarget) dismiss(); }
  },
    h('div', {
      role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Quick Pick — train your AI',
      style: {
        background: 'linear-gradient(180deg,#0d1117 0%,#080b0f 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px 20px 0 0',
        padding: '20px 16px 36px',
        width: '100%', maxWidth: 480,
        animation: 'scQPSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)',
      }
    },
      h('style', null, '@keyframes scQPSlideUp{from{transform:translateY(100%);opacity:0}to{transform:none;opacity:1}}'),
      // Handle bar
      h('div', { 'aria-hidden': 'true', style: { width: 36, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.14)', margin: '0 auto 16px' } }),
      // Header
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 } },
        h('div', { style: { fontSize: 20 } }, '🧠'),
        h('div', null,
          h('div', { style: { fontSize: 14, fontWeight: 800, color: '#f0fdf4' } }, 'Train Your AI'),
          h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Every choice makes your AI smarter')
        )
      ),
      h('div', { style: { fontSize: 13, color: '#9ca3af', margin: '8px 0 14px' } },
        'Which drill would you prefer next time?'
      ),
      // Cards
      h('div', { style: { display: 'flex', gap: 10, marginBottom: 16 } },
        h(DrillCard, { drill: d1, selected: chosen === d1.id, onChoose: function () { choose(d1, d2); } }),
        h(DrillCard, { drill: d2, selected: chosen === d2.id, onChoose: function () { choose(d2, d1); } })
      ),
      // AI got smarter indicator
      chosen && h('div', {
        role: 'status', 'aria-live': 'polite',
        style: { textAlign: 'center', fontSize: 13, color: '#16a34a', fontWeight: 700, marginBottom: 8 }
      }, '✓ Your AI just got smarter!'),
      // Dismiss
      !chosen && h('button', {
        onClick: dismiss,
        style: { width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#4b5563', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }
      }, "I'll decide later →")
    )
  );
}

// ── Public API ─────────────────────────────────────────────────────
window.SC_PREFER = {
  shouldShowQuickPick:  shouldShowQuickPick,
  getQuickPickPair:     getQuickPickPair,
  recordChoice:         recordChoice,
  recordDismissal:      recordDismissal,
  QuickPickModal:       QuickPickModal,
};

console.log('[SC] app-preference-ranker v1.0 — Elo Preference Ranker ready');
})();
