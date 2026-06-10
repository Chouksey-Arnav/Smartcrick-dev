// app-drills-steps-engine.js v1.0
// ================================================================
// SmartCrick — Drills "Proof-of-Work" Step Engine
//
// REPLACES the one-click "Complete Drill — Earn XP" leak in
// app-drills-ui-patch.js (DrillDetailV2) with a guided, step-by-step
// "focus mode" flow:
//
//   1. Watch the fitting technique video FIRST (gated start).
//   2. Work ONE step at a time. Each step is expanded into rich,
//      multi-part coaching (action / cue / what good looks like /
//      what to watch for) derived deterministically from data that
//      already exists on every drill.
//   3. Each step has a lightweight proof-of-work "checkpoint"
//      (tap-per-rep, hold-to-focus, observation checklist, honest
//      self-rate, or a deliberate confirm) — you cannot knock a step
//      off, or earn its XP, by mashing a button.
//   4. Completing a step awards its OWN XP, weighted by difficulty
//      (5 / 7 / 10), and reveals the next step. Per-step XP sums
//      EXACTLY to the drill's existing total XP — the economy and
//      leaderboards are untouched.
//   5. Partial progress is saved and resumable; already-earned steps
//      are never re-awarded.
//
// Architecture: additive patch file. Loaded AFTER app-drills-ui-patch.js
// so it wins the A.DrillsPage override. Also exports A.DrillDetailPage
// (previously unexported — the DrillDetail deep-link route was a dead
// NotFound) so Home / SkillPaths / Schedule / Challenges "today's drill"
// links now land in the new flow. The 1MB data file is NEVER touched;
// everything is derived at render time.
// ================================================================
(function () {
'use strict';
if (typeof React === 'undefined') { console.error('[SC] steps-engine: React missing'); return; }
var A = window.SC_APP;
if (!A) { console.error('[SC] steps-engine: SC_APP missing'); return; }

var h        = React.createElement;
var useState = React.useState;
var useEffect= React.useEffect;
var useRef   = React.useRef;

// ── One-time CSS injection (avoids touching the .css files) ──────────
(function injectCSS() {
  if (document.getElementById('scsf-styles')) return;
  var css =
    '@keyframes scsf-in{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}' +
    '@keyframes scsf-pop{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}' +
    '@keyframes scsf-pulse{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.35)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0)}}' +
    '@keyframes scsf-rise{0%{opacity:0;transform:translateY(8px)}20%{opacity:1}100%{opacity:0;transform:translateY(-22px)}}' +
    '.scsf-card{animation:scsf-in .32s cubic-bezier(.25,.46,.45,.94)}' +
    '.scsf-pop{animation:scsf-pop .3s ease}' +
    '.scsf-xpfloat{animation:scsf-rise 1.1s ease forwards}';
  var el = document.createElement('style');
  el.id = 'scsf-styles';
  el.textContent = css;
  document.head.appendChild(el);
})();

// ── Category colours (mirrors app-drills-ui-patch.js) ────────────────
var CAT_COLORS = {
  shots:'#16a34a', decisions:'#0ea5e9', bowling:'#f59e0b', fielding:'#8b5cf6',
  keeping:'#ec4899', wicketkeeping:'#ec4899', partnership:'#14b8a6',
  fitness:'#f97316', batting:'#16a34a', all:'#6b7280',
};
function catColor(c) { return CAT_COLORS[c] || '#6b7280'; }

// ================================================================
//  STEP DERIVATION ENGINE  (pure, deterministic, memoized)
// ================================================================
var STEP_CACHE = {};

function firstClause(str) {
  if (!str) return '';
  var s = String(str).split(/—|–|:|,|\(/)[0].trim();
  var words = s.split(/\s+/);
  if (words.length > 8) s = words.slice(0, 8).join(' ') + '…';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function intIn(text) {
  var m = String(text || '').match(/(\d+)\s*(?:reps?|deliveries|balls?|times|shadow|drives|swings|throws|catches)/i);
  return m ? parseInt(m[1], 10) : null;
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function parseRepTarget(text, cfg) {
  var n = intIn(text) || (cfg && cfg.reps) || 10;
  return clamp(n, 5, 25);
}
function parseHoldMs(text) {
  var m = String(text || '').match(/(\d+)\s*(?:seconds?|secs?|s)\b/i);
  var sec = m ? parseInt(m[1], 10) : 5;
  return clamp(sec, 3, 12) * 1000;
}

function detectRole(text, cfg) {
  var t = String(text || '').toLowerCase();
  if (/film|record|camera|footage|playback|review|compare|count how many|measure/.test(t)) return 'review';
  if (/rate|mark each|self-rate|score each|log each|mark it|note where/.test(t))           return 'rate';
  if (/hold|freeze|still for|count of|for \d+\s*sec|breath/.test(t))                        return 'hold';
  if (intIn(t) || /shadow|reps?\b|swings/.test(t))                                          return 'reps';
  if (/stand|set up|set camera|set the|ask the|mark the spot|grip the|take guard|lay a|stick a/.test(t)) return 'setup';
  return 'execute';
}

var CUE_MAP = [
  [/head|eyes/,                      'Eyes on the ball, head dead still.'],
  [/weight|balance|stance/,          'Feel 50/50 — balanced, springy, ready.'],
  [/grip|hands|wrist/,               'Soft hands, alive wrists — let the bat flow.'],
  [/shoulder/,                       'Stay side-on through the whole shot.'],
  [/elbow/,                          'High front elbow — the bat swings straight.'],
  [/film|record|camera|footage|review|playback/, "Be honest on playback — the camera never lies."],
  [/shadow|reps?\b|swings/,          'Quality over quantity — every rep with full intent.'],
  [/breath|still|freeze/,            'Settle, breathe, then move.'],
  [/rate|mark|score|log/,            'Rate it honestly — growth lives in the truth.'],
  [/footwork|feet|step|stride/,      'Light, decisive feet — get to the pitch of the ball.'],
  [/release|seam|wrist|line|length/, 'Same action every ball — repeat, repeat, repeat.'],
];
function pickCue(drill, text, i, n) {
  if (i === n - 1 && drill.keyFocus) return drill.keyFocus; // reinforce the headline cue last
  var t = String(text || '').toLowerCase();
  for (var k = 0; k < CUE_MAP.length; k++) if (CUE_MAP[k][0].test(t)) return CUE_MAP[k][1];
  return drill.keyFocus || 'Slow is smooth, smooth is fast.';
}

function pickGoodLooks(drill, role, i, n) {
  if (i === n - 1 && drill.masteryThreshold) return drill.masteryThreshold;
  if (role === 'review' && drill.measurement) return 'Target — ' + drill.measurement;
  switch (role) {
    case 'reps':  return 'Every rep looks identical: same shape, same balance, same finish.';
    case 'hold':  return 'Total stillness for the full count — no wobble, no drift.';
    case 'rate':  return drill.measurement ? ('Honest score logged — ' + drill.measurement) : 'An honest score logged for this rep.';
    case 'setup': return 'You set up identically every single time — it becomes automatic.';
    default:      return 'Controlled, repeatable, and you could do it with your eyes closed.';
  }
}

function roleWeight(role) {
  if (role === 'reps' || role === 'review') return 10;
  if (role === 'setup') return 5;
  return 7; // hold / rate / execute
}

// Largest-remainder apportionment so the per-step XP sums EXACTLY to total.
function distributeXP(weights, total) {
  var sum = weights.reduce(function (a, b) { return a + b; }, 0) || 1;
  var exact = weights.map(function (w) { return total * w / sum; });
  var floor = exact.map(function (x) { return Math.floor(x); });
  var used  = floor.reduce(function (a, b) { return a + b; }, 0);
  var rem   = total - used;
  // hand the remainder to the steps with the biggest fractional parts
  var order = exact
    .map(function (x, idx) { return { idx: idx, frac: x - Math.floor(x) }; })
    .sort(function (a, b) { return b.frac - a.frac; });
  for (var k = 0; k < rem && k < order.length; k++) floor[order[k].idx] += 1;
  // never award 0 for a real step
  return floor.map(function (v) { return Math.max(1, v); });
}

function deriveSteps(drill) {
  if (!drill) return [];
  var id = drill.id || drill.name || JSON.stringify(drill).slice(0, 40);
  if (STEP_CACHE[id]) return STEP_CACHE[id];

  var cfg = drill.appMechanicConfig || {};
  var raw = Array.isArray(drill.steps) ? drill.steps.filter(function (s) { return s && String(s).trim(); }) : [];

  // Fallback skeleton for drills with no authored steps.
  if (raw.length === 0) {
    raw = [
      'Set up: ' + (drill.baseline || 'get into position and check your equipment.'),
      'Execute the drill with full focus on ' + (drill.keyFocus || 'clean, repeatable technique') + '.',
      'Measure your result: ' + (drill.measurement || 'note how it felt and what you would change.'),
    ];
  }

  var n = raw.length;
  var total = drill.xp || drill.xp_value || 50;

  // Pass 1: role + verify + difficulty per step
  var crux = -1;
  var pre = raw.map(function (text, i) {
    var role = detectRole(text, cfg);
    if (role === 'reps' && crux === -1) crux = i;
    return { text: String(text).trim(), role: role };
  });
  if (crux === -1) crux = Math.min(n - 1, Math.floor(n / 2)); // attach commonError to mid-step if no exec step

  var weights = pre.map(function (p, i) {
    var w = roleWeight(p.role);
    if (i === n - 1) w = Math.max(w, 10); // the last step is the mastery check
    return w;
  });
  var xps = distributeXP(weights, total);

  var steps = pre.map(function (p, i) {
    var role = p.role;
    var diff = weights[i] >= 10 ? 'hard' : weights[i] >= 7 ? 'core' : 'easy';
    var verify, minDwellMs = 0;
    if (role === 'reps') {
      verify = { type: 'reps', target: parseRepTarget(p.text, cfg) };
    } else if (role === 'hold') {
      verify = { type: 'hold', ms: parseHoldMs(p.text) };
    } else if (role === 'review') {
      var items = (Array.isArray(cfg.checkpoints) && cfg.checkpoints.length)
        ? cfg.checkpoints.slice(0, 4)
        : [drill.keyFocus, 'I reviewed the footage honestly', (drill.measurement || 'I logged the result')];
      items = items.filter(Boolean);
      if (items.length < 2) items.push('I compared it against what good looks like');
      verify = { type: 'checklist', items: items };
    } else if (role === 'rate') {
      verify = { type: 'rate', label: drill.measurement || 'How clean was that rep?' };
    } else {
      verify = { type: 'confirm' };
      minDwellMs = 2500; // small honesty floor so a plain confirm can't be insta-mashed
    }

    return {
      idx: i,
      title: firstClause(p.text) || ('Step ' + (i + 1)),
      action: p.text,
      cue: pickCue(drill, p.text, i, n),
      goodLooks: pickGoodLooks(drill, role, i, n),
      watchFor: (i === crux && drill.commonError) ? drill.commonError : '',
      difficulty: diff,
      xp: xps[i],
      verify: verify,
      minDwellMs: minDwellMs,
    };
  });

  STEP_CACHE[id] = steps;
  return steps;
}

// ================================================================
//  PERSISTENCE  (additive — never disturbs existing progress keys)
// ================================================================
function getProg() { try { return (A.DB && A.DB.getProgress()) || {}; } catch (e) { return {}; } }
function saveProg(p) { try { if (A.DB && A.DB.saveProgress) A.DB.saveProgress(p); } catch (e) {} }

function loadStepState(id, n) {
  var p = getProg();
  var entry = (p.drill_step_progress || {})[id];
  if (!entry || entry.v !== 1 || entry.n !== n) return null; // stale / schema-changed → restart
  return entry;
}
function persistStep(id, n, idx, xp, val) {
  var p = getProg();
  if (!p.drill_step_progress) p.drill_step_progress = {};
  var e = p.drill_step_progress[id];
  if (!e || e.v !== 1 || e.n !== n) e = { v: 1, n: n, done: {}, startedAt: new Date().toISOString() };
  e.done[idx] = { xp: xp, at: new Date().toISOString(), val: (val == null ? null : val) };
  e.updatedAt = new Date().toISOString();
  p.drill_step_progress[id] = e;
  saveProg(p);
}
function clearStepState(id) {
  var p = getProg();
  if (p.drill_step_progress && p.drill_step_progress[id]) {
    delete p.drill_step_progress[id];
    saveProg(p);
  }
}

// ================================================================
//  VERIFICATION WIDGETS  (proof-of-work, no ML, no server)
// ================================================================

// Tap once per rep. Rate-limited so you can't spam-tap to the target.
function RepCounter(props) {
  var target = props.target, color = props.color;
  var [count, setCount] = useState(0);
  var [pop, setPop] = useState(0);
  var lastTap = useRef(0);
  var done = count >= target;

  function tap() {
    if (done) return;
    var now = Date.now();
    if (now - lastTap.current < 350) return; // ignore machine-gun taps (350ms apart enforces real cadence)
    lastTap.current = now;
    var nc = Math.min(target, count + 1);
    setCount(nc);
    setPop(function (x) { return x + 1; });
    if (nc >= target) props.onChange(true, nc);
  }

  var pct = Math.round((count / target) * 100);
  return h('div', { style: { textAlign: 'center' } },
    h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 10 } },
      done ? '✓ All reps logged' : 'Tap once for each rep you complete'),
    h('button', {
      key: pop, className: pop ? 'scsf-pop' : '', onClick: tap, disabled: done,
      style: {
        width: 132, height: 132, borderRadius: '50%', cursor: done ? 'default' : 'pointer',
        border: '3px solid ' + (done ? '#22c55e' : color),
        background: done ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.04)',
        color: done ? '#4ade80' : '#f0fdf4', fontFamily: 'inherit',
        fontSize: 30, fontWeight: 800, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', margin: '0 auto',
        boxShadow: done ? '0 0 24px rgba(34,197,94,0.4)' : 'none', transition: 'all .2s',
      }
    },
      h('span', null, count + ' / ' + target),
      h('span', { style: { fontSize: 11, fontWeight: 600, opacity: 0.7, marginTop: 2 } }, done ? 'DONE' : 'TAP')
    ),
    h('div', { style: { height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, marginTop: 14, overflow: 'hidden' } },
      h('div', { style: { height: '100%', width: pct + '%', background: done ? '#22c55e' : color, transition: 'width .2s' } }))
  );
}

// Press and HOLD for the focus interval. Releasing early resets.
function HoldButton(props) {
  var ms = props.ms, color = props.color;
  var [elapsed, setElapsed] = useState(0);
  var [done, setDone] = useState(false);
  var timer = useRef(null);

  function start() {
    if (done) return;
    if (timer.current) clearInterval(timer.current);
    var t0 = Date.now() - elapsed;
    timer.current = setInterval(function () {
      var e = Date.now() - t0;
      if (e >= ms) {
        clearInterval(timer.current); timer.current = null;
        setElapsed(ms); setDone(true); props.onChange(true);
      } else setElapsed(e);
    }, 50);
  }
  function stop() {
    if (done) return;
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    setElapsed(0); props.onChange(false);
  }
  useEffect(function () { return function () { if (timer.current) clearInterval(timer.current); }; }, []);

  var pct = Math.round((elapsed / ms) * 100);
  return h('div', { style: { textAlign: 'center' } },
    h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 10 } },
      done ? '✓ Held for the full count' : 'Press and HOLD — stay completely still'),
    h('button', {
      onPointerDown: start, onPointerUp: stop, onPointerLeave: stop, disabled: done,
      style: {
        position: 'relative', width: '100%', padding: '20px', borderRadius: 14, overflow: 'hidden',
        border: '2px solid ' + (done ? '#22c55e' : color), cursor: done ? 'default' : 'pointer',
        background: 'rgba(255,255,255,0.04)', color: '#f0fdf4', fontFamily: 'inherit',
        fontSize: 16, fontWeight: 800, touchAction: 'none', userSelect: 'none',
      }
    },
      h('div', { style: { position: 'absolute', left: 0, top: 0, bottom: 0, width: pct + '%', background: (done ? '#22c55e' : color) + '33', transition: 'width .05s linear' } }),
      h('span', { style: { position: 'relative' } }, done ? '✓ Held ' + Math.round(ms / 1000) + 's' : 'HOLD (' + Math.round((ms - elapsed) / 1000) + 's left)')
    )
  );
}

// Tick off each observation. All must be checked.
function Checklist(props) {
  var items = props.items, color = props.color;
  var [checked, setChecked] = useState(items.map(function () { return false; }));
  function toggle(i) {
    var next = checked.slice(); next[i] = !next[i];
    setChecked(next);
    props.onChange(next.every(Boolean));
  }
  return h('div', null,
    h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 10 } }, 'Confirm each — be honest with yourself'),
    items.map(function (it, i) {
      var on = checked[i];
      return h('button', {
        key: i, onClick: function () { toggle(i); },
        style: {
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left',
          padding: '11px 12px', marginBottom: 8, borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
          background: on ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.03)',
          border: '1px solid ' + (on ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.08)'),
          color: on ? '#d1fae5' : '#d1d5db', fontSize: 13, lineHeight: 1.45,
        }
      },
        h('span', {
          style: {
            width: 20, height: 20, borderRadius: 6, flexShrink: 0, fontSize: 13, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: on ? '#22c55e' : 'transparent', color: '#06240f',
            border: '2px solid ' + (on ? '#22c55e' : '#4b5563'),
          }
        }, on ? '✓' : ''),
        h('span', null, it)
      );
    })
  );
}

// Honest 1–5 self-rate (any selection unlocks; value feeds reflection).
function SelfRate(props) {
  var color = props.color;
  var [val, setVal] = useState(0);
  var labels = ['Way off', 'Rough', 'Okay', 'Good', 'Perfect'];
  return h('div', null,
    h('div', { style: { fontSize: 12, color: '#9ca3af', marginBottom: 10 } }, props.label),
    h('div', { style: { display: 'flex', gap: 8, justifyContent: 'space-between' } },
      [1, 2, 3, 4, 5].map(function (n) {
        var on = val === n;
        return h('button', {
          key: n, onClick: function () { setVal(n); props.onChange(true, n); },
          style: {
            flex: 1, padding: '12px 0', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
            background: on ? color : 'rgba(255,255,255,0.04)',
            border: '1px solid ' + (on ? color : 'rgba(255,255,255,0.1)'),
            color: on ? '#fff' : '#9ca3af', fontSize: 18, fontWeight: 800,
          }
        }, n);
      })
    ),
    val > 0 && h('div', { style: { textAlign: 'center', marginTop: 8, fontSize: 12, color: color, fontWeight: 700 } }, labels[val - 1])
  );
}

// Deliberate confirm (paired with a short dwell floor in the parent).
function ConfirmGate(props) {
  var [on, setOn] = useState(false);
  return h('button', {
    onClick: function () { var v = !on; setOn(v); props.onChange(v); },
    style: {
      display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left',
      padding: '13px 14px', borderRadius: 11, cursor: 'pointer', fontFamily: 'inherit',
      background: on ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.03)',
      border: '1px solid ' + (on ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'),
      color: on ? '#d1fae5' : '#d1d5db', fontSize: 13, fontWeight: 600,
    }
  },
    h('span', {
      style: {
        width: 22, height: 22, borderRadius: 7, flexShrink: 0, fontSize: 14, fontWeight: 800,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: on ? '#22c55e' : 'transparent', color: '#06240f',
        border: '2px solid ' + (on ? '#22c55e' : '#4b5563'),
      }
    }, on ? '✓' : ''),
    h('span', null, "I've done this step properly — not just read it")
  );
}

function VerifyWidget(props) {
  var v = props.step.verify, color = props.color;
  if (v.type === 'reps')      return h(RepCounter, { target: v.target, color: color, onChange: props.onChange });
  if (v.type === 'hold')      return h(HoldButton,  { ms: v.ms, color: color, onChange: props.onChange });
  if (v.type === 'checklist') return h(Checklist,   { items: v.items, color: color, onChange: props.onChange });
  if (v.type === 'rate')      return h(SelfRate,    { label: v.label, color: color, onChange: props.onChange });
  return h(ConfirmGate, { color: color, onChange: props.onChange });
}

// ================================================================
//  ACTIVE STEP CARD  (re-mounted per step via key)
// ================================================================
function StepCard(props) {
  var step = props.step, color = props.color, drill = props.drill;
  var [verified, setVerified] = useState(false);
  var [value, setValue] = useState(null);
  var [dwellMet, setDwellMet] = useState(step.minDwellMs === 0);

  useEffect(function () {
    if (step.minDwellMs > 0) {
      var t = setTimeout(function () { setDwellMet(true); }, step.minDwellMs);
      return function () { clearTimeout(t); };
    }
  }, [step.idx]);

  function onChange(ok, val) { setVerified(ok); if (val != null) setValue(val); }
  var ready = verified && dwellMet;

  var lab = { fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 5 };

  return h('div', { className: 'scsf-card', style: {
    background: '#11161d', borderRadius: 16, padding: '18px 16px 16px',
    border: '1px solid rgba(255,255,255,0.07)', borderLeft: '4px solid ' + color, marginBottom: 14,
  } },
    // header row
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 } },
      h('div', { style: {
        minWidth: 32, height: 32, borderRadius: '50%', background: color, color: '#fff',
        fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'scsf-pulse 2s infinite',
      } }, step.idx + 1),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f0fdf4', lineHeight: 1.25 } }, step.title),
        h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2, textTransform: 'capitalize' } }, step.difficulty + ' · +' + step.xp + ' XP')
      )
    ),

    // ACTION
    h('div', { style: { marginBottom: 14 } },
      h('div', { style: Object.assign({}, lab, { color: color }) }, 'Do this'),
      h('div', { style: { fontSize: 14.5, color: '#e5e7eb', lineHeight: 1.6 } }, step.action)
    ),

    // CUE
    step.cue && h('div', { style: {
      background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: 10, padding: '10px 12px', marginBottom: 10,
    } },
      h('div', { style: Object.assign({}, lab, { color: '#fbbf24', marginBottom: 4 }) }, '🔑 Coaching cue'),
      h('div', { style: { fontSize: 13, color: '#fde68a', lineHeight: 1.5, fontStyle: 'italic' } }, step.cue)
    ),

    // GOOD LOOKS LIKE
    step.goodLooks && h('div', { style: {
      background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
      borderRadius: 10, padding: '10px 12px', marginBottom: 10,
    } },
      h('div', { style: Object.assign({}, lab, { color: '#34d399', marginBottom: 4 }) }, '✓ What good looks like'),
      h('div', { style: { fontSize: 13, color: '#6ee7b7', lineHeight: 1.5 } }, step.goodLooks)
    ),

    // WATCH FOR
    step.watchFor && h('div', { style: {
      background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)',
      borderRadius: 10, padding: '10px 12px', marginBottom: 10,
    } },
      h('div', { style: Object.assign({}, lab, { color: '#f87171', marginBottom: 4 }) }, '⚠️ Watch for'),
      h('div', { style: { fontSize: 13, color: '#fca5a5', lineHeight: 1.5 } }, step.watchFor)
    ),

    // CHECKPOINT (proof-of-work)
    h('div', { style: {
      background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.12)',
      borderRadius: 12, padding: '14px 12px', margin: '14px 0',
    } }, h(VerifyWidget, { step: step, color: color, onChange: onChange })),

    // COMPLETE
    h('button', {
      onClick: function () { if (ready) props.onComplete(step, value); },
      disabled: !ready,
      style: {
        width: '100%', padding: '15px', borderRadius: 13, border: 'none', fontFamily: 'inherit',
        fontSize: 15, fontWeight: 800, cursor: ready ? 'pointer' : 'default',
        background: ready ? 'linear-gradient(135deg,#16a34a,#15803d)' : 'rgba(100,116,139,0.12)',
        color: ready ? '#fff' : '#475569',
        boxShadow: ready ? '0 0 22px rgba(22,163,74,0.4)' : 'none', transition: 'all .2s',
      }
    }, ready ? ('✓ Complete step (+' + step.xp + ' XP)')
            : (!dwellMet ? 'Take a moment…' : 'Finish the checkpoint above to unlock'))
  );
}

// Collapsed, knocked-off step summary
function DoneRow(props) {
  var step = props.step;
  return h('div', { style: {
    display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', marginBottom: 8,
    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: 11,
  } },
    h('div', { style: {
      minWidth: 26, height: 26, borderRadius: '50%', background: '#22c55e', color: '#06240f',
      fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
    } }, '✓'),
    h('div', { style: { flex: 1, fontSize: 13.5, fontWeight: 600, color: '#a7f3d0' } }, step.title),
    h('div', { style: { fontSize: 12, fontWeight: 800, color: '#34d399' } }, '+' + step.xp + ' XP')
  );
}

// Locked future step (title hidden to keep focus on one thing)
function LockedRow(props) {
  return h('div', { style: {
    display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', marginBottom: 8,
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 11, opacity: 0.55,
  } },
    h('div', { style: {
      minWidth: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: '#6b7280',
      fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
    } }, props.n),
    h('div', { style: { flex: 1, fontSize: 13, color: '#4b5563' } }, '🔒 Locked'),
    h('div', { style: { fontSize: 11, color: '#374151' } }, '+' + props.step.xp + ' XP')
  );
}

// ================================================================
//  VIDEO (the "watch first" gate)
// ================================================================
function StepVideo(props) {
  var drill = props.drill, color = props.color;
  var vid = (A.getVideoForDrill ? A.getVideoForDrill(drill) : null) ||
            { videoId: 'yeImrfgNJoM', title: 'Cricket Drill Tutorial', channel: 'B3 Cricket' };
  var [show, setShow] = useState(false);

  if (!show) {
    return h('button', {
      onClick: function () { setShow(true); props.onOpened(); },
      style: {
        width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '14px',
        borderRadius: 14, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)',
        color: '#f0fdf4', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      }
    },
      h('div', { style: {
        width: 50, height: 36, borderRadius: 7, background: '#dc2626', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      } }, h('div', { style: { width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '13px solid #fff', marginLeft: 3 } })),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontSize: 13.5, fontWeight: 700, color: '#f0fdf4', lineHeight: 1.35, marginBottom: 3 } }, vid.title || 'Watch the technique first'),
        h('div', { style: { fontSize: 11.5, color: '#9ca3af' } }, (vid.channel || 'YouTube') + ' · Watch how it should look')
      )
    );
  }
  return h('div', { style: { borderRadius: 14, overflow: 'hidden', background: '#000' } },
    h('div', { style: { position: 'relative', paddingBottom: '56.25%', height: 0 } },
      h('iframe', {
        src: 'https://www.youtube.com/embed/' + vid.videoId + '?autoplay=1&rel=0&modestbranding=1&color=red',
        style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullScreen: true, title: vid.title || 'Drill video',
      })
    )
  );
}

// ================================================================
//  MAIN: DrillStepFlowPage
// ================================================================
function DrillStepFlowPage(props) {
  // Resolve drill from either an explicit prop (list mode) or a route id.
  var drill = props.drill;
  if (!drill && props.params && props.params.id && A.DRILLS) {
    drill = A.DRILLS.filter(function (d) { return d.id === props.params.id; })[0];
  }
  var onBack = props.onBack || function () { if (A.nav) A.nav('Drills'); };

  if (!drill) {
    return h('div', { style: { minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: '#9ca3af' } },
      h('div', { style: { fontSize: 40 } }, '🏏'),
      h('div', null, 'Drill not found.'),
      h('button', { onClick: onBack, style: { padding: '10px 20px', borderRadius: 10, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Back to Drills')
    );
  }

  var color = catColor(drill.category);
  var steps = deriveSteps(drill);
  var id = drill.id;
  var n = steps.length;

  // ── State (hydrated from saved partial progress) ──
  var init = (function () {
    var saved = loadStepState(id, n);
    var doneSet = {}, ratings = {}, firstUndone = 0;
    if (saved) {
      Object.keys(saved.done).forEach(function (k) {
        doneSet[k] = true;
        if (saved.done[k] && saved.done[k].val != null) ratings[k] = saved.done[k].val;
      });
      while (firstUndone < n && doneSet[firstUndone]) firstUndone++;
    }
    return { doneSet: doneSet, ratings: ratings, active: firstUndone, videoDone: saved ? true : false };
  })();

  var [doneSet, setDoneSet]   = useState(init.doneSet);
  var [ratings, setRatings]   = useState(init.ratings);
  var [active, setActive]     = useState(init.active);
  var [videoDone, setVideoDone] = useState(init.videoDone);
  var [phase, setPhase]       = useState('run'); // 'run' | 'celebrate'
  var [floatXP, setFloatXP]   = useState(null);
  var [summary, setSummary]   = useState(null);

  var doneCount = Object.keys(doneSet).length;
  var earned = steps.reduce(function (sum, s) { return sum + (doneSet[s.idx] ? s.xp : 0); }, 0);

  // ── Finalize on last step ──
  function finalize(finalRatings) {
    // record per-drill completion count + reflection (mirrors existing schema)
    var p = getProg();
    if (!p.drill_completions) p.drill_completions = {};
    p.drill_completions[id] = (p.drill_completions[id] || 0) + 1;
    var rvals = Object.keys(finalRatings).map(function (k) { return finalRatings[k]; }).filter(function (v) { return typeof v === 'number'; });
    var avg = rvals.length ? Math.round(rvals.reduce(function (a, b) { return a + b; }, 0) / rvals.length) : null;
    if (!p.drill_reflections) p.drill_reflections = {};
    p.drill_reflections[id] = { rating: avg, feeling: null, note: null, date: new Date().toISOString(), viaSteps: true };
    saveProg(p);

    clearStepState(id);

    // brain-engine + card-pack hooks (same as the legacy flow)
    try {
      if (A.BrainEngine && A.BrainEngine.isModelTrained && A.BrainEngine.isModelTrained('DrillAdaptor')) {
        var sig = A.BrainEngine.buildDrillSignals(id);
        A.BrainEngine.addSample('DrillAdaptor', sig, { shouldRetry: 0, shouldAdvance: 1, relevance_boost: 1 });
      }
    } catch (e) {}
    try { if (A.trackDrillForCardPack) A.trackDrillForCardPack(); } catch (e) {}
    try { if (A.fireConfetti) A.fireConfetti(); } catch (e) {}

    var total = steps.reduce(function (s, st) { return s + st.xp; }, 0);
    setSummary({ total: total, count: n, rating: avg });
    setPhase('celebrate');
  }

  // ── Complete a step ──
  function completeStep(step, val) {
    if (doneSet[step.idx]) return; // idempotent — never re-award
    var isLast = step.idx === n - 1;

    // Award XP. Intermediate steps are NON-meaningful (no streak/completion
    // record). The LAST step carries the meaningful 'drill' completion so the
    // streak counts once and the drill is recorded exactly once.
    try {
      if (A.awardXP) {
        if (isLast) A.awardXP(step.xp, drill.durationMinutes || drill.duration || 15, 'drill:' + id, 'drill', id, true);
        else        A.awardXP(step.xp, 0, 'drill_step', 'drill_step', null, false);
      }
    } catch (e) {}

    var nextDone = Object.assign({}, doneSet); nextDone[step.idx] = true;
    var nextRatings = Object.assign({}, ratings); if (val != null) nextRatings[step.idx] = val;
    setDoneSet(nextDone); setRatings(nextRatings);
    persistStep(id, n, step.idx, step.xp, val);

    setFloatXP({ amt: step.xp, key: Date.now() });
    setTimeout(function () { setFloatXP(null); }, 1100);

    if (isLast) { finalize(nextRatings); return; }

    // advance to the next not-done step
    var nx = step.idx + 1;
    while (nx < n && nextDone[nx]) nx++;
    setActive(nx);
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  }

  // ── CELEBRATE ──
  if (phase === 'celebrate' && summary) {
    var nextDrill = null;
    if (A.DRILLS) {
      for (var qi = 0; qi < A.DRILLS.length; qi++) {
        if (A.DRILLS[qi].category === drill.category && A.DRILLS[qi].id !== id) { nextDrill = A.DRILLS[qi]; break; }
      }
    }
    return h('div', { style: { minHeight: '100dvh', background: '#0d1117', color: '#f0fdf4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' } },
      h('div', { className: 'scsf-pop', style: {
        width: 96, height: 96, borderRadius: '50%', background: 'rgba(34,197,94,0.15)',
        border: '3px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 48, marginBottom: 22,
      } }, '🏆'),
      h('div', { style: { fontSize: 24, fontWeight: 900, marginBottom: 6 } }, 'Drill mastered'),
      h('div', { style: { fontSize: 14, color: '#9ca3af', marginBottom: 4 } }, drill.name),
      h('div', { style: { fontSize: 13, color: '#6b7280', marginBottom: 20 } }, summary.count + ' steps completed — every one earned'),
      h('div', { style: { fontSize: 34, fontWeight: 900, color: '#34d399', marginBottom: 24 } }, '+' + summary.total + ' XP'),
      nextDrill && h('button', {
        onClick: function () {
          setPhase('run'); setSummary(null);
          // reset to the next drill cleanly
          if (A.nav && (!props.drill)) A.nav('DrillDetail', { id: nextDrill.id });
          else if (props.onPickDrill) props.onPickDrill(nextDrill);
          else onBack();
        },
        style: { padding: '14px 26px', borderRadius: 12, border: '1px solid ' + color, background: color + '22', color: color, fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12 }
      }, 'Next: ' + nextDrill.name + ' →'),
      h('button', {
        onClick: onBack,
        style: { padding: '13px 26px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }
      }, 'Back to Drills')
    );
  }

  // ── RUN ──
  var s = {
    page: { minHeight: '100dvh', background: '#0d1117', color: '#f0fdf4',
      paddingTop: 'max(0.5rem, env(safe-area-inset-top))', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))' },
    body: { maxWidth: 640, margin: '0 auto', padding: '0 16px' },
  };

  return h('div', { style: s.page },
    // floating +XP feedback
    floatXP && h('div', { key: floatXP.key, className: 'scsf-xpfloat', style: {
      position: 'fixed', top: '40%', left: 0, right: 0, textAlign: 'center', zIndex: 50,
      fontSize: 30, fontWeight: 900, color: '#34d399', pointerEvents: 'none',
      textShadow: '0 2px 16px rgba(0,0,0,0.6)',
    } }, '+' + floatXP.amt + ' XP'),

    h('div', { style: s.body },
      // header
      h('div', { style: { padding: '12px 0 10px' } },
        h('button', { onClick: onBack, style: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '6px 0', fontSize: 14, fontFamily: 'inherit' } }, '← Back to Drills'),
        h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12, marginTop: 8 } },
          h('div', { style: { fontSize: 30 } }, drill.emoji || '🏏'),
          h('div', { style: { flex: 1 } },
            h('h1', { style: { fontSize: 20, fontWeight: 900, margin: 0, lineHeight: 1.2 } }, drill.name),
            h('div', { style: { display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' } },
              h('span', { style: { padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: color + '20', color: color, border: '1px solid ' + color + '30' } }, (drill.category || 'drill').toUpperCase()),
              h('span', { style: { fontSize: 12, color: '#9ca3af' } }, '⏱ ' + (drill.duration || drill.durationMinutes || 15) + ' min'),
              h('span', { style: { fontSize: 12, color: '#f59e0b', fontWeight: 700 } }, '⚡ ' + (drill.xp || 50) + ' XP')
            )
          )
        )
      ),

      // segmented progress
      h('div', { style: { display: 'flex', gap: 4, margin: '6px 0 14px' } },
        steps.map(function (st) {
          var st2 = doneSet[st.idx] ? 'done' : (st.idx === active && videoDone ? 'active' : 'todo');
          return h('div', { key: st.idx, style: {
            flex: 1, height: 6, borderRadius: 99,
            background: st2 === 'done' ? '#22c55e' : st2 === 'active' ? color : 'rgba(255,255,255,0.08)',
            boxShadow: st2 === 'active' ? '0 0 10px ' + color : 'none', transition: 'all .3s',
          } });
        })
      ),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 16 } },
        h('span', { style: { color: '#9ca3af', fontWeight: 600 } }, doneCount + ' / ' + n + ' steps'),
        h('span', { style: { color: '#34d399', fontWeight: 700 } }, earned + ' / ' + (drill.xp || 50) + ' XP earned')
      ),

      // problem context (condensed)
      drill.problem && h('div', { style: { background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, padding: '11px 13px', marginBottom: 12 } },
        h('div', { style: { fontSize: 10, fontWeight: 800, color: '#f87171', letterSpacing: '0.06em', marginBottom: 5 } }, '🎯 THE PROBLEM THIS FIXES'),
        h('div', { style: { fontSize: 12.5, color: '#fca5a5', lineHeight: 1.55 } }, drill.problem)
      ),

      // VIDEO FIRST
      h('div', { style: { marginBottom: 16 } },
        h('div', { style: { fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.07em', marginBottom: 8 } },
          videoDone ? 'TECHNIQUE VIDEO' : '① WATCH HOW IT\'S DONE FIRST'),
        h(StepVideo, { drill: drill, color: color, onOpened: function () { setVideoDone(true); } })
      ),

      // STEP STACK
      !videoDone
        ? h('div', { style: { textAlign: 'center', padding: '24px 16px', color: '#6b7280', fontSize: 13, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12 } },
            '▶ Watch the technique video above to unlock the step-by-step drill.',
            h('div', { style: { marginTop: 10 } },
              h('button', { onClick: function () { setVideoDone(true); }, style: { background: 'none', border: 'none', color: '#475569', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', fontFamily: 'inherit' } }, 'Skip video & start')
            )
          )
        : h('div', null,
            h('div', { style: { fontSize: 11, fontWeight: 800, color: '#9ca3af', letterSpacing: '0.07em', marginBottom: 10 } }, '② WORK THROUGH IT — ONE STEP AT A TIME'),
            steps.map(function (st) {
              if (doneSet[st.idx]) return h(DoneRow, { key: st.idx, step: st });
              if (st.idx === active) return h(StepCard, { key: st.idx, step: st, drill: drill, color: color, onComplete: completeStep });
              return h(LockedRow, { key: st.idx, step: st, n: st.idx + 1 });
            })
          )
    )
  );
}

// ================================================================
//  LIST PAGE  (reuses the v2 list UX, routes selection to the flow)
// ================================================================
function DrillsPageStepFlow() {
  var [cat, setCat]   = useState('all');
  var [search, setSrch] = useState('');
  var [selected, setSel] = useState(null);
  var [level, setLvl] = useState('all');

  var cats = A.DRILL_CATEGORIES_V2 || [
    { id: 'all', label: 'All', emoji: '🏏' },
    { id: 'shots', label: 'Shots', emoji: '🏏' },
    { id: 'decisions', label: 'Decision Making', emoji: '🎯' },
    { id: 'bowling', label: 'Bowling', emoji: '⚾' },
    { id: 'fielding', label: 'Fielding', emoji: '🏃' },
    { id: 'keeping', label: 'Keeping', emoji: '🧤' },
    { id: 'partnership', label: 'Partnership', emoji: '🤝' },
  ];

  var prog = getProg();
  var stepProg = prog.drill_step_progress || {};

  var drills = (A.DRILLS || []).filter(function (d) {
    var matchCat = cat === 'all' || d.category === cat;
    var matchLvl = level === 'all' || d.level === level;
    var q = search.toLowerCase();
    var matchSrch = !q || (d.name || '').toLowerCase().indexOf(q) >= 0 || (d.problem || '').toLowerCase().indexOf(q) >= 0;
    return matchCat && matchLvl && matchSrch;
  });

  if (selected) {
    return h(DrillStepFlowPage, {
      key: selected.id, // remount on drill change so step state never leaks between drills
      drill: selected,
      onBack: function () { setSel(null); },
      onPickDrill: function (d) { setSel(d); },
    });
  }

  var wrap = { minHeight: '100dvh', background: '#0d1117', paddingTop: 'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))', paddingBottom: 'calc(72px + env(safe-area-inset-bottom))', color: '#f0fdf4' };

  return h('div', { style: wrap },
    h('div', { style: { padding: '12px 16px 0' } },
      h('input', {
        value: search, onChange: function (e) { setSrch(e.target.value); },
        placeholder: '🔍 Search drills or problems...',
        style: { width: '100%', padding: '10px 14px', background: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#f0fdf4', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' }
      })
    ),
    h('div', { style: { display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none' } },
      cats.map(function (c) {
        var on = cat === c.id, cc = catColor(c.id);
        return h('button', { key: c.id, onClick: function () { setCat(c.id); },
          style: { flexShrink: 0, padding: '7px 14px', borderRadius: 99, cursor: 'pointer', background: on ? cc : 'rgba(255,255,255,0.05)', border: on ? '1px solid ' + cc : '1px solid rgba(255,255,255,0.06)', color: on ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: on ? 700 : 400, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }
        }, c.emoji + ' ' + c.label);
      })
    ),
    h('div', { style: { display: 'flex', gap: 6, padding: '0 16px 12px' } },
      ['all', 'beginner', 'intermediate', 'advanced', 'pro'].map(function (l) {
        var lc = { beginner: '#16a34a', intermediate: '#0ea5e9', advanced: '#f59e0b', pro: '#8b5cf6' }[l] || '#6b7280';
        return h('button', { key: l, onClick: function () { setLvl(l); },
          style: { padding: '5px 12px', borderRadius: 99, cursor: 'pointer', background: level === l ? lc + '25' : 'transparent', border: '1px solid ' + (level === l ? lc : 'rgba(255,255,255,0.08)'), color: level === l ? lc : '#6b7280', fontSize: 11, fontWeight: 600, fontFamily: 'inherit', textTransform: 'capitalize' }
        }, l === 'all' ? 'All levels' : l);
      })
    ),
    h('div', { style: { padding: '0 16px 10px', fontSize: 12, color: '#374151' } }, drills.length + ' drill' + (drills.length !== 1 ? 's' : '')),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' } },
      drills.map(function (d) {
        var cc = catColor(d.category);
        var sp = stepProg[d.id];
        var resumePct = sp ? Math.round((Object.keys(sp.done || {}).length / (sp.n || 1)) * 100) : 0;
        return h('div', { key: d.id, onClick: function () { setSel(d); },
          style: { background: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderLeft: '3px solid ' + cc, borderRadius: 10, padding: '14px', cursor: 'pointer', position: 'relative' }
        },
          h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 } },
            h('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 } },
              h('div', { style: { fontSize: 24, lineHeight: 1 } }, d.emoji || '🏏'),
              h('div', { style: { flex: 1 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                  h('span', { style: { fontSize: 15, fontWeight: 700, color: '#f0fdf4' } }, d.name),
                  resumePct > 0 && resumePct < 100 && h('span', { style: { fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' } }, 'RESUME ' + resumePct + '%')
                ),
                d.problem
                  ? h('p', { style: { fontSize: 12, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.5 } }, d.problem.substring(0, 80) + (d.problem.length > 80 ? '...' : ''))
                  : h('p', { style: { fontSize: 12, color: '#6b7280', margin: '4px 0 0' } }, (d.level || 'beginner') + ' · ' + (d.duration || 15) + ' min')
              )
            ),
            h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 } },
              h('span', { style: { fontSize: 11, color: '#f59e0b', fontWeight: 700 } }, (d.xp || 50) + ' XP')
            )
          )
        );
      })
    )
  );
}

// ================================================================
//  REGISTER  (wins the override; also fixes the dead DrillDetail route)
// ================================================================
A.deriveDrillSteps = deriveSteps;
A.DrillStepFlowPage = DrillStepFlowPage;
A.DrillDetailPage   = DrillStepFlowPage;   // was never exported → DrillDetail route was NotFound
A.DrillsPage        = DrillsPageStepFlow;  // replaces DrillsPageV2 (the one-click XP leak)

console.log('[SC] app-drills-steps-engine v1.0 — proof-of-work step flow active (video-gated, per-step XP, resumable)');
})();
