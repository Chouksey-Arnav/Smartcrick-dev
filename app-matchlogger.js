// app-matchlogger.js v1.0 — Match Logger V2
// MatchLoggerPage: career stats + SVG wagon wheel + match form + detail view
// Exports: A.MatchLoggerPage
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var Fragment = React.Fragment;
var A = window.SC_APP;
var DB = A.DB;
var nav = A.nav;
var Icon = A.Icon;
var XPBadge = A.XPBadge;
var PageHeader = A.PageHeader;
var BottomNav = A.BottomNav;

// ── DB helpers ───────────────────────────────────────────────────
function getMatchLogs() { return DB.get('match_logs') || []; }
function saveMatchLogs(logs) { DB.set('match_logs', logs); }

// ── Career stats compute ─────────────────────────────────────────
function computeCareerStats(logs) {
  var innings = logs.filter(function(l) { return l.batting && l.batting.runs !== '' && l.batting.runs !== null && l.batting.runs !== undefined; });
  var totalRuns = innings.reduce(function(s, l) { return s + (parseInt(l.batting.runs) || 0); }, 0);
  var notOuts = innings.filter(function(l) { return l.batting.notOut; }).length;
  var dismissals = innings.length - notOuts;
  var avg = dismissals > 0 ? (totalRuns / dismissals).toFixed(1) : innings.length > 0 ? '-' : '-';
  var hs = innings.length > 0 ? Math.max.apply(null, innings.map(function(l) { return parseInt(l.batting.runs) || 0; })) : 0;
  var fours = innings.reduce(function(s, l) { return s + (parseInt(l.batting.fours) || 0); }, 0);
  var sixes = innings.reduce(function(s, l) { return s + (parseInt(l.batting.sixes) || 0); }, 0);
  var totalBalls = innings.reduce(function(s, l) { return s + (parseInt(l.batting.balls) || 0); }, 0);
  var sr = totalBalls > 0 ? ((totalRuns / totalBalls) * 100).toFixed(1) : '-';

  var bowlMatches = logs.filter(function(l) { return l.bowling && l.bowling.wickets !== '' && l.bowling.wickets !== null; });
  var totalWickets = bowlMatches.reduce(function(s, l) { return s + (parseInt(l.bowling.wickets) || 0); }, 0);
  var totalBowlRuns = bowlMatches.reduce(function(s, l) { return s + (parseInt(l.bowling.runs) || 0); }, 0);
  var totalOvers = bowlMatches.reduce(function(s, l) { return s + (parseFloat(l.bowling.overs) || 0); }, 0);
  var economy = totalOvers > 0 ? (totalBowlRuns / totalOvers).toFixed(1) : '-';
  var bowlAvg = totalWickets > 0 ? (totalBowlRuns / totalWickets).toFixed(1) : '-';

  var catches = logs.reduce(function(s, l) { return s + (parseInt((l.fielding || {}).catches) || 0); }, 0);
  var runouts = logs.reduce(function(s, l) { return s + (parseInt((l.fielding || {}).runouts) || 0); }, 0);

  var wins = logs.filter(function(l) { return l.result === 'win'; }).length;
  var losses = logs.filter(function(l) { return l.result === 'loss'; }).length;

  return { innings: innings.length, totalRuns: totalRuns, avg: avg, hs: hs, sr: sr,
    fours: fours, sixes: sixes, totalWickets: totalWickets, economy: economy, bowlAvg: bowlAvg,
    catches: catches, runouts: runouts, wins: wins, losses: losses, matches: logs.length };
}

// ── Wagon Wheel SVG ──────────────────────────────────────────────
// 8 sectors: covers full 360° around the wicket (batter's view)
var SECTORS = [
  { label: 'Straight', from: -22.5,  to: 22.5,   color: '#3b82f6', bg: 'rgba(59,130,246,0.18)' },
  { label: 'Off drive',from: 22.5,   to: 67.5,   color: '#10b981', bg: 'rgba(16,185,129,0.18)' },
  { label: 'Cover',    from: 67.5,   to: 112.5,  color: '#16a34a', bg: 'rgba(22,163,74,0.18)'  },
  { label: 'Point',    from: 112.5,  to: 157.5,  color: '#f59e0b', bg: 'rgba(245,158,11,0.18)' },
  { label: 'Third man',from: 157.5,  to: 202.5,  color: '#8b5cf6', bg: 'rgba(139,92,246,0.18)' },
  { label: 'Fine leg', from: 202.5,  to: 247.5,  color: '#ec4899', bg: 'rgba(236,72,153,0.18)' },
  { label: 'Leg side', from: 247.5,  to: 292.5,  color: '#f97316', bg: 'rgba(249,115,22,0.18)' },
  { label: 'Mid-on',   from: 292.5,  to: 337.5,  color: '#06b6d4', bg: 'rgba(6,182,212,0.18)'  },
];

function degToRad(deg) { return (deg - 90) * Math.PI / 180; }
function sectorPath(cx, cy, r, fromDeg, toDeg) {
  var x1 = cx + r * Math.cos(degToRad(fromDeg));
  var y1 = cy + r * Math.sin(degToRad(fromDeg));
  var x2 = cx + r * Math.cos(degToRad(toDeg));
  var y2 = cy + r * Math.sin(degToRad(toDeg));
  var large = (toDeg - fromDeg) > 180 ? 1 : 0;
  return 'M ' + cx + ' ' + cy + ' L ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + ' Z';
}

function shotDot(cx, cy, shot, idx) {
  var sec = SECTORS[shot.sector] || SECTORS[0];
  var midDeg = (sec.from + sec.to) / 2;
  // Jitter dots within sector
  var spread = 28;
  var jitter = ((idx * 137) % spread) - spread / 2;
  var angleDeg = midDeg + jitter * 0.4;
  var rMin = shot.runs >= 4 ? 55 : shot.runs >= 2 ? 35 : 18;
  var rMax = shot.runs >= 6 ? 80 : shot.runs >= 4 ? 70 : shot.runs >= 2 ? 55 : 40;
  var r = rMin + ((idx * 73) % (rMax - rMin));
  var x = cx + r * Math.cos(degToRad(angleDeg));
  var y = cy + r * Math.sin(degToRad(angleDeg));
  var color = shot.runs >= 6 ? '#f59e0b' : shot.runs >= 4 ? '#16a34a' : '#60a5fa';
  var size = shot.runs >= 6 ? 5 : shot.runs >= 4 ? 4 : 3;
  return h('circle', { key: 'dot-' + idx, cx: x.toFixed(1), cy: y.toFixed(1), r: size, fill: color, opacity: 0.85 });
}

function WagonWheel(props) {
  var shots = props.shots || [];
  var interactive = props.interactive;
  var onSectorClick = props.onSectorClick;
  var cx = 100, cy = 100, r = 82, innerR = 10;
  var pitchR = 14;

  return h('svg', { width: 200, height: 200, viewBox: '0 0 200 200', style: { display: 'block' } },
    // Outer grass
    h('circle', { cx: cx, cy: cy, r: r + 2, fill: 'rgba(22,163,74,0.06)', stroke: 'rgba(22,163,74,0.2)', strokeWidth: 1 }),
    // Sector backgrounds
    SECTORS.map(function(sec, i) {
      return h('path', {
        key: 'sec-' + i,
        d: sectorPath(cx, cy, r, sec.from, sec.to),
        fill: sec.bg,
        stroke: 'rgba(0,0,0,0.3)',
        strokeWidth: 0.5,
        style: interactive ? { cursor: 'pointer' } : {},
        onClick: interactive ? function() { if (onSectorClick) onSectorClick(i); } : null,
      });
    }),
    // 30-yard circle
    h('circle', { cx: cx, cy: cy, r: 50, fill: 'none', stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1, strokeDasharray: '3 3' }),
    // Pitch rectangle
    h('rect', { x: cx - 4, y: cy - pitchR, width: 8, height: pitchR * 2, fill: 'rgba(180,140,80,0.4)', stroke: 'rgba(180,140,80,0.6)', strokeWidth: 0.5, rx: 1 }),
    // Wickets
    h('rect', { x: cx - 3, y: cy - pitchR - 3, width: 6, height: 3, fill: '#f0fdf4', rx: 0.5 }),
    h('rect', { x: cx - 3, y: cy + pitchR, width: 6, height: 3, fill: '#f0fdf4', rx: 0.5 }),
    // Shot dots
    shots.map(function(shot, i) { return shotDot(cx, cy, shot, i); }),
    // Center dot
    h('circle', { cx: cx, cy: cy, r: innerR, fill: '#161b22', stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }),
    h('circle', { cx: cx, cy: cy, r: 3, fill: '#16a34a' }),
    // Sector labels (only when no shots — acts as guide)
    shots.length === 0 && SECTORS.map(function(sec, i) {
      var midDeg = (sec.from + sec.to) / 2;
      var lx = cx + 68 * Math.cos(degToRad(midDeg));
      var ly = cy + 68 * Math.sin(degToRad(midDeg));
      return h('text', { key: 'lbl-' + i, x: lx.toFixed(0), y: ly.toFixed(0), textAnchor: 'middle', dominantBaseline: 'central', fontSize: 6, fontWeight: 700, fill: sec.color, fontFamily: 'inherit', style: { pointerEvents: 'none' } }, sec.label.split(' ')[0]);
    })
  );
}

// ── Stat pill ────────────────────────────────────────────────────
function StatPill(props) {
  return h('div', { style: { textAlign: 'center', padding: '10px 8px', background: 'rgba(22,27,34,0.9)', borderRadius: 8, border: '1px solid rgba(48,54,61,0.9)' } },
    h('div', { style: { fontSize: 18, fontWeight: 800, color: props.color || '#f0fdf4', fontVariantNumeric: 'tabular-nums', lineHeight: 1 } }, props.value),
    h('div', { style: { fontSize: 9, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 } }, props.label)
  );
}

// ── Result badge ─────────────────────────────────────────────────
function ResultBadge(props) {
  var colors = { win: { bg: 'rgba(22,163,74,0.15)', border: 'rgba(22,163,74,0.4)', color: '#4ade80', label: 'W' },
    loss: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', color: '#f87171', label: 'L' },
    draw: { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.3)', color: '#fbbf24', label: 'D' },
    'no-result': { bg: 'rgba(139,148,158,0.10)', border: 'rgba(139,148,158,0.3)', color: '#8b949e', label: 'NR' } };
  var c = colors[props.result] || colors['no-result'];
  return h('div', { style: { width: 28, height: 28, borderRadius: 6, background: c.bg, border: '1px solid ' + c.border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
    h('span', { style: { fontSize: 10, fontWeight: 800, color: c.color } }, c.label)
  );
}

// ── Log form ─────────────────────────────────────────────────────
function MatchForm(props) {
  var editing = props.editing || {};
  var onSave = props.onSave;
  var onClose = props.onClose;

  var blankBat = { runs: '', balls: '', fours: '', sixes: '', notOut: false, position: '4' };
  var blankBowl = { wickets: '', runs: '', overs: '', maidens: '' };
  var blankField = { catches: '', runouts: '', stumpings: '' };

  var [form, setForm] = useState({
    date: editing.date || new Date().toISOString().slice(0, 10),
    format: editing.format || 'T20',
    opposition: editing.opposition || '',
    result: editing.result || 'win',
    batting: Object.assign({}, blankBat, editing.batting || {}),
    bowling: Object.assign({}, blankBowl, editing.bowling || {}),
    fielding: Object.assign({}, blankField, editing.fielding || {}),
    notes: editing.notes || '',
    shots: editing.shots || [],
  });
  var [tab, setTab] = useState('bat');
  var [pendingSector, setPendingSector] = useState(null);
  var [pendingRuns, setPendingRuns] = useState(1);

  function set(key, val) { setForm(function(f) { var o = Object.assign({}, f); o[key] = val; return o; }); }
  function setBat(key, val) { setForm(function(f) { return Object.assign({}, f, { batting: Object.assign({}, f.batting, { [key]: val }) }); }); }
  function setBowl(key, val) { setForm(function(f) { return Object.assign({}, f, { bowling: Object.assign({}, f.bowling, { [key]: val }) }); }); }
  function setField(key, val) { setForm(function(f) { return Object.assign({}, f, { fielding: Object.assign({}, f.fielding, { [key]: val }) }); }); }

  function addShot() {
    if (pendingSector === null) return;
    var shot = { sector: pendingSector, runs: pendingRuns };
    setForm(function(f) { return Object.assign({}, f, { shots: f.shots.concat([shot]) }); });
    setPendingSector(null);
  }

  function removeLastShot() {
    setForm(function(f) { return Object.assign({}, f, { shots: f.shots.slice(0, -1) }); });
  }

  var FORMATS = ['T20', 'T10', 'ODI', '50-over', '40-over', 'Test', '4-day', 'Club'];
  var RESULTS = [{ id: 'win', label: 'Win', color: '#16a34a' }, { id: 'loss', label: 'Loss', color: '#ef4444' }, { id: 'draw', label: 'Draw', color: '#f59e0b' }, { id: 'no-result', label: 'No Result', color: '#6b7280' }];

  var inp = { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 8, color: '#f0fdf4', fontSize: 14, padding: '10px 12px', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box' };
  var lbl = { fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 };

  return h('div', { style: { position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }, onClick: onClose },
    h('div', { onClick: function(e) { e.stopPropagation(); }, style: { width: '100%', maxWidth: 520, background: '#0d1117', borderRadius: '20px 20px 0 0', border: '1px solid rgba(48,54,61,0.9)', borderBottom: 'none', maxHeight: '92vh', overflowY: 'auto', padding: '0 20px 40px' } },
      h('div', { style: { width: 40, height: 4, borderRadius: 2, background: 'rgba(75,85,99,0.6)', margin: '12px auto 16px' } }),
      h('h3', { style: { fontSize: 17, fontWeight: 800, color: '#f0fdf4', marginBottom: 16 } }, editing.id ? 'Edit Match' : 'Log a Match'),

      // Core fields
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 } },
        h('div', null,
          h('label', { style: lbl }, 'Date'),
          h('input', { type: 'date', value: form.date, onChange: function(e) { set('date', e.target.value); }, style: inp })
        ),
        h('div', null,
          h('label', { style: lbl }, 'Format'),
          h('select', { value: form.format, onChange: function(e) { set('format', e.target.value); }, style: Object.assign({}, inp, { paddingRight: 8 }) },
            FORMATS.map(function(f) { return h('option', { key: f, value: f }, f); })
          )
        )
      ),
      h('div', { style: { marginBottom: 12 } },
        h('label', { style: lbl }, 'Opposition'),
        h('input', { type: 'text', value: form.opposition, onChange: function(e) { set('opposition', e.target.value); }, placeholder: 'e.g. Apex CC', style: inp })
      ),
      h('div', { style: { marginBottom: 16 } },
        h('label', { style: lbl }, 'Result'),
        h('div', { style: { display: 'flex', gap: 6 } },
          RESULTS.map(function(r) {
            var sel = form.result === r.id;
            return h('button', { key: r.id, onClick: function() { set('result', r.id); }, style: { flex: 1, padding: '8px 4px', borderRadius: 8, border: '1px solid ' + (sel ? r.color : 'rgba(48,54,61,0.9)'), background: sel ? r.color + '20' : 'rgba(22,27,34,0.9)', color: sel ? r.color : '#6b7280', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, r.label);
          })
        )
      ),

      // Tabs
      h('div', { style: { display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(48,54,61,0.9)' } },
        ['bat', 'bowl', 'field', 'wheel'].map(function(t) {
          var labels = { bat: '🏏 Bat', bowl: '🎳 Bowl', field: '🤸 Field', wheel: '🎯 Wheel' };
          return h('button', { key: t, onPointerDown: function() { if(A.playTabClick) A.playTabClick(); setTab(t); }, style: { flex: 1, padding: '9px 4px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: tab === t ? 'rgba(22,163,74,0.15)' : 'rgba(22,27,34,0.9)', color: tab === t ? '#4ade80' : '#6b7280', borderRight: t !== 'wheel' ? '1px solid rgba(48,54,61,0.9)' : 'none' } }, labels[t]);
        })
      ),

      // Tab content with animation
      (function() {
        var FM = window.FramerMotion;
        var tabContent = h(Fragment, null,

      // Batting tab
      tab === 'bat' && h('div', null,
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 } },
          h('div', null, h('label', { style: lbl }, 'Runs'), h('input', { type: 'number', min: 0, value: form.batting.runs, onChange: function(e) { setBat('runs', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, 'Balls'), h('input', { type: 'number', min: 0, value: form.batting.balls, onChange: function(e) { setBat('balls', e.target.value); }, style: inp }))
        ),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 } },
          h('div', null, h('label', { style: lbl }, '4s'), h('input', { type: 'number', min: 0, value: form.batting.fours, onChange: function(e) { setBat('fours', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, '6s'), h('input', { type: 'number', min: 0, value: form.batting.sixes, onChange: function(e) { setBat('sixes', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, 'Position'), h('input', { type: 'number', min: 1, max: 11, value: form.batting.position, onChange: function(e) { setBat('position', e.target.value); }, style: inp }))
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          h('input', { type: 'checkbox', id: 'notout', checked: form.batting.notOut, onChange: function(e) { setBat('notOut', e.target.checked); }, style: { width: 18, height: 18 } }),
          h('label', { htmlFor: 'notout', style: { fontSize: 13, color: '#8b949e', cursor: 'pointer' } }, 'Not out')
        )
      ),

      // Bowling tab
      tab === 'bowl' && h('div', null,
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 } },
          h('div', null, h('label', { style: lbl }, 'Wickets'), h('input', { type: 'number', min: 0, max: 10, value: form.bowling.wickets, onChange: function(e) { setBowl('wickets', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, 'Runs'), h('input', { type: 'number', min: 0, value: form.bowling.runs, onChange: function(e) { setBowl('runs', e.target.value); }, style: inp }))
        ),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 } },
          h('div', null, h('label', { style: lbl }, 'Overs'), h('input', { type: 'number', min: 0, step: 0.1, value: form.bowling.overs, onChange: function(e) { setBowl('overs', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, 'Maidens'), h('input', { type: 'number', min: 0, value: form.bowling.maidens, onChange: function(e) { setBowl('maidens', e.target.value); }, style: inp }))
        )
      ),

      // Fielding tab
      tab === 'field' && h('div', null,
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 } },
          h('div', null, h('label', { style: lbl }, 'Catches'), h('input', { type: 'number', min: 0, value: form.fielding.catches, onChange: function(e) { setField('catches', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, 'Run-outs'), h('input', { type: 'number', min: 0, value: form.fielding.runouts, onChange: function(e) { setField('runouts', e.target.value); }, style: inp })),
          h('div', null, h('label', { style: lbl }, 'Stumpings'), h('input', { type: 'number', min: 0, value: form.fielding.stumpings, onChange: function(e) { setField('stumpings', e.target.value); }, style: inp }))
        )
      ),

      // Wagon wheel tab
      tab === 'wheel' && h('div', { style: { textAlign: 'center' } },
        h('p', { style: { fontSize: 12, color: '#6b7280', marginBottom: 12 } }, 'Tap a sector to log where your shots went. Build your personal wagon wheel.'),
        h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
          h(WagonWheel, { shots: form.shots, interactive: true, onSectorClick: function(i) { setPendingSector(i); } })
        ),
        pendingSector !== null && h('div', { style: { background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.25)', borderRadius: 10, padding: '12px', marginBottom: 10 } },
          h('p', { style: { fontSize: 12, color: '#4ade80', marginBottom: 8 } }, 'Sector: ' + SECTORS[pendingSector].label + ' — How many runs?'),
          h('div', { style: { display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 } },
            [1, 2, 3, 4, 6].map(function(r) {
              return h('button', { key: r, onClick: function() { setPendingRuns(r); }, style: { width: 40, height: 40, borderRadius: 8, border: '1px solid ' + (pendingRuns === r ? '#16a34a' : 'rgba(48,54,61,0.9)'), background: pendingRuns === r ? 'rgba(22,163,74,0.15)' : 'rgba(22,27,34,0.9)', color: pendingRuns === r ? '#4ade80' : '#8b949e', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, r);
            })
          ),
          h('button', { onClick: addShot, style: { width: '100%', padding: '9px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Add Shot +')
        ),
        form.shots.length > 0 && h('div', { style: { display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' } },
          h('span', { style: { fontSize: 12, color: '#6b7280' } }, form.shots.length + ' shots logged'),
          h('button', { onClick: removeLastShot, style: { fontSize: 11, color: '#ef4444', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'inherit' } }, 'Undo last')
        )
      )

        ); // end tabContent Fragment
        if (!FM) return tabContent;
        return h(FM.AnimatePresence, { mode: 'wait' },
          h(FM.motion.div, {
            key: tab,
            initial: { opacity: 0, y: 8 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -8 },
            transition: { duration: 0.18, ease: 'easeInOut' },
            style: { width: '100%' },
          }, tabContent)
        );
      })(),

      // Notes
      h('div', { style: { marginTop: 16 } },
        h('label', { style: lbl }, 'Notes'),
        h('textarea', { value: form.notes, onChange: function(e) { set('notes', e.target.value); }, placeholder: 'Key moments, conditions, lessons learned...', rows: 3, style: Object.assign({}, inp, { resize: 'none', lineHeight: 1.5 }) })
      ),

      h('button', {
        onClick: function() { onSave(form); },
        style: { width: '100%', padding: '13px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginTop: 16 }
      }, editing.id ? 'Save Changes' : 'Log Match 🏏')
    )
  );
}

// ── Match detail overlay ──────────────────────────────────────────
function MatchDetail(props) {
  var m = props.match;
  var onClose = props.onClose;
  var onDelete = props.onDelete;

  var bat = m.batting || {};
  var bowl = m.bowling || {};
  var field = m.fielding || {};
  var sr = bat.balls > 0 ? ((parseInt(bat.runs) / parseInt(bat.balls)) * 100).toFixed(1) : '-';

  return h('div', { style: { position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }, onClick: onClose },
    h('div', { onClick: function(e) { e.stopPropagation(); }, style: { width: '100%', maxWidth: 400, background: '#0d1117', borderRadius: 16, border: '1px solid rgba(48,54,61,0.9)', maxHeight: '85vh', overflowY: 'auto', padding: '20px' } },
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 } },
        h('div', null,
          h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f0fdf4' } }, m.opposition || 'Unknown Opposition'),
          h('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 } }, m.date + ' · ' + m.format)
        ),
        h(ResultBadge, { result: m.result })
      ),

      // Wagon wheel
      m.shots && m.shots.length > 0 && h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 } },
        h(WagonWheel, { shots: m.shots || [] })
      ),

      // Stats grid
      h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 } },
        bat.runs !== '' && bat.runs !== undefined && h(StatPill, { label: 'Runs', value: bat.runs + (bat.notOut ? '*' : ''), color: '#60a5fa' }),
        bat.balls !== '' && bat.balls !== undefined && h(StatPill, { label: 'Balls', value: bat.balls }),
        sr !== '-' && h(StatPill, { label: 'S/R', value: sr, color: '#4ade80' }),
        bat.fours !== '' && bat.fours !== undefined && h(StatPill, { label: '4s', value: bat.fours, color: '#10b981' }),
        bat.sixes !== '' && bat.sixes !== undefined && h(StatPill, { label: '6s', value: bat.sixes, color: '#f59e0b' }),
        bowl.wickets !== '' && bowl.wickets !== undefined && h(StatPill, { label: 'Wkts', value: bowl.wickets, color: '#ef4444' }),
        bowl.runs !== '' && bowl.runs !== undefined && h(StatPill, { label: 'Bowl Runs', value: bowl.runs }),
        bowl.overs !== '' && bowl.overs !== undefined && h(StatPill, { label: 'Overs', value: bowl.overs }),
        (parseInt(field.catches) + parseInt(field.runouts || 0)) > 0 && h(StatPill, { label: 'Field', value: (parseInt(field.catches) || 0) + 'ct ' + (parseInt(field.runouts) || 0) + 'ro', color: '#14b8a6' })
      ),

      m.notes && h('div', { style: { padding: '12px 14px', borderRadius: 10, background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', marginBottom: 16 } },
        h('p', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.6, margin: 0 } }, m.notes)
      ),

      h('div', { style: { display: 'flex', gap: 10 } },
        h('button', { onClick: onClose, style: { flex: 1, padding: '10px', background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 8, color: '#8b949e', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' } }, 'Close'),
        h('button', { onClick: function() { onDelete(m.id); }, style: { padding: '10px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' } }, 'Delete')
      )
    )
  );
}

// ================================================================
// MATCH LOGGER PAGE
// ================================================================
function MatchLoggerPage() {
  var [logs, setLogs] = useState(function() { return getMatchLogs(); });
  var [showForm, setShowForm] = useState(false);
  var [detail, setDetail] = useState(null);
  var [editMatch, setEditMatch] = useState(null);

  useEffect(function() {
    var refresh = function() { setLogs(getMatchLogs()); };
    window.addEventListener('sc_update', refresh);
    return function() { window.removeEventListener('sc_update', refresh); };
  }, []);

  function handleSave(form) {
    var all = getMatchLogs();
    if (editMatch) {
      var idx = all.findIndex(function(m) { return m.id === editMatch.id; });
      if (idx !== -1) all[idx] = Object.assign({}, editMatch, form);
    } else {
      all.unshift(Object.assign({ id: 'ml_' + Date.now() }, form));
      // Award XP for logging a match
      if (A.awardXP) A.awardXP(30, 0, 'match_log', null, null);
      // Intelligence hook — new match only, not edits
      if (window.SC_INTEL) { try { window.SC_INTEL.updateOnMatch(); } catch(e) {} }
    }
    saveMatchLogs(all);
    setLogs(all.slice());
    window.dispatchEvent(new CustomEvent('sc_update'));
    setShowForm(false);
    setEditMatch(null);
  }

  function handleDelete(id) {
    var all = getMatchLogs().filter(function(m) { return m.id !== id; });
    saveMatchLogs(all);
    setLogs(all.slice());
    setDetail(null);
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  var stats = computeCareerStats(logs);
  var recentShots = logs.slice(0, 3).reduce(function(acc, m) { return acc.concat(m.shots || []); }, []);

  return h('div', { style: { paddingBottom: 100, background: '#0d1117', minHeight: '100dvh' } },
    h(PageHeader, { title: 'Match Logger', subtitle: stats.matches + ' matches · ' + stats.innings + ' innings logged', gradient: 'linear-gradient(135deg,#1d4ed8,#0891b2)',
      actions: h('button', { onClick: function() { setShowForm(true); setEditMatch(null); }, style: { background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' } }, '+ Log Match')
    }),

    h('div', { style: { padding: '16px 16px 0' } },

      // Career stats row
      stats.matches > 0 && h('div', null,
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 } }, 'Career Summary'),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 } },
          h(StatPill, { label: 'Matches', value: stats.matches }),
          h(StatPill, { label: 'Runs', value: stats.totalRuns, color: '#60a5fa' }),
          h(StatPill, { label: 'Avg', value: stats.avg, color: '#4ade80' }),
          h(StatPill, { label: 'H/S', value: stats.hs || '-', color: '#f59e0b' })
        ),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 16 } },
          h(StatPill, { label: 'S/R', value: stats.sr }),
          h(StatPill, { label: 'Wickets', value: stats.totalWickets, color: '#ef4444' }),
          h(StatPill, { label: 'Economy', value: stats.economy }),
          h(StatPill, { label: 'W/L', value: stats.wins + '/' + stats.losses, color: '#16a34a' })
        ),
      ),

      // Aggregate wagon wheel (last 3 matches)
      recentShots.length > 0 && h('div', { style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 14, padding: '16px', marginBottom: 16 } },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 } }, 'Wagon Wheel (last 3 matches)'),
        h('div', { style: { display: 'flex', justifyContent: 'center' } },
          h(WagonWheel, { shots: recentShots })
        ),
        h('div', { style: { display: 'flex', gap: 16, justifyContent: 'center', marginTop: 10 } },
          [{ label: '4s', color: '#16a34a' }, { label: '6s', color: '#f59e0b' }, { label: '1-3', color: '#60a5fa' }].map(function(l) {
            return h('div', { key: l.label, style: { display: 'flex', alignItems: 'center', gap: 5 } },
              h('div', { style: { width: 8, height: 8, borderRadius: '50%', background: l.color } }),
              h('span', { style: { fontSize: 11, color: '#6b7280' } }, l.label)
            );
          })
        )
      ),

      // Match list
      h('div', { style: { fontSize: 11, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 } }, 'Match History'),

      logs.length === 0
        ? h('div', { style: { textAlign: 'center', padding: '48px 20px', color: '#484f58' } },
            h('div', { style: { fontSize: 40, marginBottom: 12 } }, '🏏'),
            h('p', { style: { fontSize: 14, color: '#6b7280' } }, "No matches logged yet. Tap '+ Log Match' to start building your career record."),
            h('button', { onClick: function() { setShowForm(true); }, style: { marginTop: 16, padding: '12px 24px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Log Your First Match')
          )
        : h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            logs.map(function(m) {
              var bat = m.batting || {};
              var bowl = m.bowling || {};
              return h('div', { key: m.id, style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 10, overflow: 'hidden', position: 'relative' } },
                h('button', { onClick: function() { setDetail(m); }, style: { display: 'block', width: '100%', padding: '12px 44px 12px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                    h(ResultBadge, { result: m.result }),
                    h('div', { style: { flex: 1, minWidth: 0 } },
                      h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f0fdf4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, 'vs ' + (m.opposition || 'Unknown')),
                      h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2 } }, m.date + ' · ' + m.format)
                    ),
                    h('div', { style: { textAlign: 'right', flexShrink: 0 } },
                      bat.runs !== '' && bat.runs !== undefined && h('div', { style: { fontSize: 13, fontWeight: 700, color: '#60a5fa' } }, bat.runs + (bat.notOut ? '*' : '') + ' (' + (bat.balls || '?') + ')'),
                      bowl.wickets !== '' && bowl.wickets !== undefined && h('div', { style: { fontSize: 11, color: '#ef4444' } }, bowl.wickets + '/' + (bowl.runs || '?'))
                    )
                  )
                )
              );
            })
          )
    ),

    showForm && h(MatchForm, { editing: editMatch || {}, onSave: handleSave, onClose: function() { setShowForm(false); setEditMatch(null); } }),
    detail && h(MatchDetail, { match: detail, onClose: function() { setDetail(null); }, onDelete: handleDelete }),
  );
}

A.MatchLoggerPage = MatchLoggerPage;
A.WagonWheel = WagonWheel;
console.log('[SC] app-matchlogger.js v1.0 — MatchLoggerPage + WagonWheel ready');
})();
