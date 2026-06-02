// app-intelligence-hub.js v1.0
// ================================================================
// SmartCrick — Intelligence Hub Page + Home Card (Module C: Visibility Layer)
// The "System Maturity Index" — makes the investment visible.
// Registers: A.IntelligenceHubPage, A.IntelligenceHomeCard
// ================================================================
(function () {
'use strict';

var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var A         = window.SC_APP;
var DB        = A.DB;
var nav       = A.nav;

// ── Animated SVG Progress Ring ─────────────────────────────────────
function ProgressRing(props) {
  var score       = props.score       || 0;
  var size        = props.size        || 120;
  var strokeWidth = props.strokeWidth || 8;
  var radius      = (size - strokeWidth) / 2;
  var circ        = 2 * Math.PI * radius;
  var offset      = circ - (score / 100) * circ;
  var color       = score >= 80 ? '#0d9488' : score >= 55 ? '#16a34a' : score >= 25 ? '#f59e0b' : '#6b7280';
  return h('svg', {
    width: size, height: size,
    viewBox: '0 0 ' + size + ' ' + size,
    style: { transform: 'rotate(-90deg)', display: 'block' },
    'aria-hidden': 'true',
  },
    h('circle', {
      cx: size/2, cy: size/2, r: radius,
      fill: 'none', stroke: 'rgba(255,255,255,0.07)', strokeWidth: strokeWidth,
    }),
    h('circle', {
      cx: size/2, cy: size/2, r: radius,
      fill: 'none', stroke: color, strokeWidth: strokeWidth,
      strokeDasharray: circ, strokeDashoffset: offset,
      strokeLinecap: 'round',
      style: {
        transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)',
        filter: 'drop-shadow(0 0 6px ' + color + '99)',
      },
    })
  );
}

// ── PDF Passport Export ────────────────────────────────────────────
function exportPassport(profile, insights) {
  try {
    var jsPDF = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDF) { alert('PDF export requires a connection — try again when online.'); return; }
    var doc  = new jsPDF({ unit: 'mm', format: 'a4' });
    var user = DB.getUser ? DB.getUser() : {};
    var cal  = profile.calibration;
    var score = cal.confidence_score;
    var label = window.SC_INTEL ? window.SC_INTEL.getCalibrationLabel(score) : '';
    var now   = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' });

    // Background
    doc.setFillColor(13, 17, 23);
    doc.rect(0, 0, 210, 297, 'F');
    // Green accent line
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 3, 'F');

    // Title
    doc.setTextColor(240, 253, 244);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Cricket Intelligence Passport', 20, 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Player: ' + (user.name || 'Cricketer') + '   •   Generated: ' + now, 20, 32);
    doc.text('Role: ' + (user.role || 'Cricketer') + '   •   Level: ' + (user.level || 'Club'), 20, 39);

    // Score
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);
    doc.setTextColor(240, 253, 244);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Intelligence Score: ' + score + '/100  (' + label + ')', 20, 55);

    // Insights
    doc.setFontSize(12);
    doc.text('What Your AI Has Learned', 20, 68);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    var y = 78;
    insights.forEach(function (ins) {
      doc.text('•  ' + ins, 22, y);
      y += 8;
    });
    if (!insights.length) { doc.text('•  Continue training to generate insights', 22, y); y += 8; }

    // Calibration breakdown
    y += 6;
    doc.setTextColor(240, 253, 244);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Calibration Breakdown', 20, y); y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    [
      ['Training Cycles',        cal.total_cycles,            200],
      ['Preference Signals',     cal.preference_signals,       30],
      ['Match Performance Data', cal.performance_data_points,  20],
      ['Biomechanical Analyses', cal.biomechanical_analyses,    5],
      ['Days of Behavioral Data',cal.days_of_behavioral_data,  90],
    ].forEach(function (row) {
      doc.text(row[0] + ': ' + row[1] + ' / ' + row[2], 22, y);
      y += 8;
    });

    // Footer
    doc.setDrawColor(34, 197, 94);
    doc.line(20, 275, 190, 275);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    var daysStr = cal.days_of_behavioral_data > 0 ? cal.days_of_behavioral_data + ' days' : 'just beginning';
    doc.text(
      'This intelligence represents ' + daysStr + ' of personalized learning and cannot be replicated on any other platform.',
      20, 282
    );
    doc.text('SmartCrick — Elite Cricket Training  |  smartcrick.ai', 20, 289);

    doc.save('cricket-intelligence-passport.pdf');
  } catch (e) {
    console.warn('[SC] Passport export failed:', e);
  }
}

// ── Full Intelligence Hub Page ─────────────────────────────────────
function IntelligenceHubPage() {
  var [profile,  setProfile]  = useState(null);
  var [insights, setInsights] = useState([]);
  var [score,    setScore]    = useState(0);

  function load() {
    if (!window.SC_INTEL) return;
    var p = window.SC_INTEL.getProfile();
    setProfile(p);
    setInsights(window.SC_INTEL.getInsights());
    setScore(p.calibration.confidence_score || 0);
  }

  useEffect(function () {
    load();
    window.addEventListener('sc_update', load);
    window.addEventListener('sc_intel_smarter', load);
    return function () {
      window.removeEventListener('sc_update', load);
      window.removeEventListener('sc_intel_smarter', load);
    };
  }, []);

  if (!profile) {
    return h('div', { style: { background:'#0d1117', minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center' } },
      h('div', { style: { color:'#6b7280', textAlign:'center' } },
        h('div', { style: { fontSize:40, marginBottom:12 } }, '🧠'),
        h('div', {}, 'Loading intelligence...')
      )
    );
  }

  var cal   = profile.calibration;
  var label = window.SC_INTEL ? window.SC_INTEL.getCalibrationLabel(score) : 'Warming Up';
  var labelColor = score >= 80 ? '#0d9488' : score >= 55 ? '#16a34a' : score >= 25 ? '#f59e0b' : '#6b7280';
  var isNew = score < 5;

  // ── "What Your AI Knows" cards ──
  var KNOWS = [
    {
      key:'peak', icon:'⏰', label:'Peak Training Window',
      value: (function () {
        if (profile.patterns.peak_hour === null || cal.total_cycles < 10) return null;
        return window.SC_INTEL ? window.SC_INTEL.formatHour(profile.patterns.peak_hour) : null;
      })(),
      threshold: 10, count: cal.total_cycles,
    },
    {
      key:'day', icon:'📅', label:'Best Training Day',
      value: (function () {
        if (profile.patterns.best_day_of_week === null || cal.total_cycles < 14) return null;
        return window.SC_INTEL ? window.SC_INTEL.formatDay(profile.patterns.best_day_of_week) : null;
      })(),
      threshold: 14, count: cal.total_cycles,
    },
    {
      key:'style', icon:'🏏', label:'Dominant Drill Style',
      value: (function () {
        if (cal.total_cycles < 5) return null;
        var top = window.SC_INTEL ? window.SC_INTEL.getTopCategory(profile.drill_affinity.category) : 'batting';
        return top.charAt(0).toUpperCase() + top.slice(1);
      })(),
      threshold: 5, count: cal.total_cycles,
    },
    {
      key:'mental', icon:'🧠', label:'Mental Affinity',
      value: (function () {
        if (cal.mental_calibrations < 3) return null;
        var top = window.SC_INTEL ? window.SC_INTEL.getTopMentalType(profile.mental_affinity.type) : null;
        if (!top) return null;
        var L = { BREATH:'Breathing', GROUND:'Grounding', VISUALIZE:'Visualization',
                  ACTIVATE:'Activation', RECOVER:'Recovery', REFLECT:'Reflection', PRESSURE:'Pressure Mgmt' };
        return L[top] || top;
      })(),
      threshold: 3, count: cal.mental_calibrations,
    },
    {
      key:'intensity', icon:'⚡', label:'Intensity Preference',
      value: (function () {
        if (cal.total_cycles < 15) return null;
        return Math.round(profile.patterns.intensity_preference * 100) + 'th percentile';
      })(),
      threshold: 15, count: cal.total_cycles,
    },
    {
      key:'rhythm', icon:'📊', label:'Training Rhythm',
      value: (function () {
        if (!profile.patterns.consistency_rhythm || cal.days_of_behavioral_data < 14) return null;
        var L = { 'daily':'Daily trainer', 'every-other':'Every other day', 'weekday':'Weekday-focused', 'weekend-warrior':'Weekend warrior' };
        return L[profile.patterns.consistency_rhythm] || profile.patterns.consistency_rhythm;
      })(),
      threshold: 14, count: cal.days_of_behavioral_data,
    },
  ];

  var BARS = [
    { label:'Training Cycles',        value:cal.total_cycles,            max:200, icon:'🔄', color:'#16a34a' },
    { label:'Preference Signals',      value:cal.preference_signals,      max:30,  icon:'🎯', color:'#3b82f6' },
    { label:'Match Performance Data',  value:cal.performance_data_points, max:20,  icon:'📋', color:'#f59e0b' },
    { label:'Biomechanical Analyses',  value:cal.biomechanical_analyses,  max:5,   icon:'🎥', color:'#8b5cf6' },
    { label:'Days of History',         value:cal.days_of_behavioral_data, max:90,  icon:'📆', color:'#0d9488' },
  ];

  return h('div', { style: { background:'#0d1117', minHeight:'100dvh', paddingBottom:48 } },
    h('style', null,
      '@keyframes scHubFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}'
    ),

    // ── Header ──
    h('div', {
      style: {
        padding:'max(3.2rem,calc(3.2rem + env(safe-area-inset-top))) 16px 14px',
        background:'rgba(8,11,15,0.97)', borderBottom:'1px solid rgba(48,54,61,0.8)',
        position:'sticky', top:0, zIndex:10, backdropFilter:'blur(12px)',
      }
    },
      h('div', { style: { display:'flex', alignItems:'center', gap:12 } },
        h('button', {
          onClick: function () { nav('Home'); },
          'aria-label': 'Back',
          style: { background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8, padding:'7px 12px', color:'#9ca3af', cursor:'pointer', fontSize:15, fontFamily:'inherit', minWidth:44, minHeight:36, display:'flex', alignItems:'center', justifyContent:'center' }
        }, '‹'),
        h('div', { style: { flex:1 } },
          h('div', { style: { fontSize:16, fontWeight:800, color:'#f0fdf4' } }, '🧠 Cricket Intelligence'),
          h('div', { style: { fontSize:11, color:'#6b7280' } }, 'Your personalized AI profile')
        )
      )
    ),

    // ── New user state ──
    isNew
      ? h('div', { style: { margin:16, padding:'36px 24px', textAlign:'center', background:'rgba(22,163,74,0.05)', border:'1px solid rgba(22,163,74,0.15)', borderRadius:16, animation:'scHubFadeIn 0.4s ease' } },
          h('div', { style: { fontSize:52, marginBottom:14 } }, '🧠'),
          h('div', { style: { fontSize:20, fontWeight:800, color:'#f0fdf4', marginBottom:8 } }, 'Your AI is just getting started'),
          h('div', { style: { fontSize:13, color:'#9ca3af', lineHeight:1.7, marginBottom:24 } },
            'Complete 5 training sessions to begin calibration. Every drill, mental session, and match teaches your AI your unique cricket fingerprint.'
          ),
          h('button', {
            onClick: function () { nav('Drills'); },
            style: { padding:'12px 28px', background:'linear-gradient(135deg,#16a34a,#0d9488)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }
          }, 'Start Training →')
        )

      : h('div', { style: { animation:'scHubFadeIn 0.4s ease' } },

          // ── Score Ring ──
          h('div', { style: { margin:16, padding:'24px 20px', background:'rgba(22,27,34,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, textAlign:'center' } },
            h('div', { style: { position:'relative', width:140, height:140, margin:'0 auto 14px' } },
              h(ProgressRing, { score:score, size:140, strokeWidth:10 }),
              h('div', { style: { position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' } },
                h('div', { style: { fontSize:38, fontWeight:900, color:'#f0fdf4', lineHeight:1 } }, score),
                h('div', { style: { fontSize:11, fontWeight:700, color:labelColor, marginTop:2, letterSpacing:'0.04em' } }, label)
              )
            ),
            h('div', { style: { fontSize:13, color:'#9ca3af' } },
              'Based on ' + cal.total_cycles.toLocaleString() + ' training interactions' +
              (cal.days_of_behavioral_data > 0 ? ' over ' + cal.days_of_behavioral_data + ' days' : '')
            ),
            cal.days_of_behavioral_data >= 7 && h('div', { style: { fontSize:11, color:'#4b5563', marginTop:4 } },
              cal.preference_signals + ' preference signal' + (cal.preference_signals !== 1 ? 's' : '') + ' • ' +
              cal.performance_data_points + ' match data point' + (cal.performance_data_points !== 1 ? 's' : '')
            )
          ),

          // ── What Your AI Knows ──
          h('div', { style: { margin:'0 16px 14px' } },
            h('div', { style: { fontSize:12, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 } },
              '✦ What Your AI Knows'
            ),
            h('div', { style: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 } },
              KNOWS.map(function (item) {
                var unlocked = !!item.value;
                var needed   = Math.max(0, item.threshold - item.count);
                return h('div', { key:item.key, style: {
                  padding:'12px 14px', borderRadius:12,
                  background: unlocked ? 'rgba(22,27,34,0.95)' : 'rgba(15,20,27,0.6)',
                  border: '1px solid ' + (unlocked ? 'rgba(22,163,74,0.22)' : 'rgba(48,54,61,0.4)'),
                }},
                  h('div', { style: { fontSize:18, marginBottom:6, opacity:unlocked?1:0.35 } }, item.icon),
                  h('div', { style: { fontSize:10, color:'#6b7280', marginBottom:3, fontWeight:600, letterSpacing:'0.04em' } }, item.label),
                  h('div', { style: { fontSize:13, fontWeight:700, color:unlocked?'#f0fdf4':'#374151', lineHeight:1.3 } },
                    unlocked ? item.value : (needed + ' more ' + (item.key === 'mental' ? 'sessions' : 'interactions') + ' to unlock')
                  )
                );
              })
            )
          ),

          // ── Calibration Breakdown ──
          h('div', { style: { margin:'0 16px 14px', padding:'16px', background:'rgba(22,27,34,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14 } },
            h('div', { style: { fontSize:13, fontWeight:700, color:'#f0fdf4', marginBottom:12 } }, '⚡ Calibration Breakdown'),
            BARS.map(function (bar) {
              var pct = Math.min(100, Math.round((bar.value / bar.max) * 100));
              return h('div', { key:bar.label, style: { marginBottom:10 } },
                h('div', { style: { display:'flex', justifyContent:'space-between', marginBottom:5 } },
                  h('div', { style: { fontSize:12, color:'#9ca3af' } }, bar.icon + ' ' + bar.label),
                  h('div', { style: { fontSize:12, fontWeight:700, color:bar.color } }, bar.value.toLocaleString() + ' / ' + bar.max)
                ),
                h('div', {
                  role:'progressbar', 'aria-valuenow':pct, 'aria-valuemin':0, 'aria-valuemax':100,
                  style: { height:6, borderRadius:99, background:'rgba(255,255,255,0.06)', overflow:'hidden' }
                },
                  h('div', { style: { height:'100%', width:pct+'%', background:bar.color, borderRadius:99, transition:'width 0.9s cubic-bezier(0.16,1,0.3,1)', boxShadow:'0 0 8px '+bar.color+'55' } })
                )
              );
            })
          ),

          // ── AI Insights ──
          insights.length > 0 && h('div', { style: { margin:'0 16px 14px', padding:'16px', background:'rgba(22,27,34,0.9)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14 } },
            h('div', { style: { fontSize:13, fontWeight:700, color:'#f0fdf4', marginBottom:10 } }, '💡 AI Insights'),
            insights.map(function (ins, i) {
              return h('div', { key:i, style: {
                padding:'8px 12px', borderRadius:8, marginBottom:6,
                background:'rgba(22,163,74,0.05)', border:'1px solid rgba(22,163,74,0.12)',
                fontSize:12, color:'#9ca3af', lineHeight:1.55,
              }}, '• ' + ins);
            })
          ),

          // ── Intelligence Lock-in ──
          h('div', { style: { margin:'0 16px 14px', padding:'16px', background:'rgba(8,11,15,0.7)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12 } },
            h('div', { style: { fontSize:12, color:'#4b5563', lineHeight:1.8 } },
              '🔒 You have accumulated ',
              h('span', { style: { color:'#16a34a', fontWeight:700 } }, cal.total_cycles.toLocaleString()),
              ' training interactions that have taught your AI your unique cricket style.',
              cal.days_of_behavioral_data > 0
                ? h('span', null,
                    ' This intelligence has been building for ',
                    h('span', { style: { color:'#16a34a', fontWeight:700 } }, cal.days_of_behavioral_data),
                    ' days and cannot be transferred to another platform.'
                  )
                : null
            )
          ),

          // ── Export ──
          h('div', { style: { margin:'0 16px' } },
            h('button', {
              onClick: function () { exportPassport(profile, insights); },
              style: {
                width:'100%', padding:'13px', borderRadius:12,
                border:'1px solid rgba(22,163,74,0.3)',
                background:'rgba(22,163,74,0.07)',
                color:'#4ade80', fontSize:13, fontWeight:700,
                cursor:'pointer', fontFamily:'inherit',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }
            },
              h('span', null, '📄'), 'Export Cricket Intelligence Passport'
            )
          )
        )
  );
}

// ── Home Page Mini Card ────────────────────────────────────────────
function IntelligenceHomeCard() {
  var [score,   setScore]   = useState(0);
  var [insight, setInsight] = useState('');
  var [visible, setVisible] = useState(false);

  function load() {
    if (!window.SC_INTEL) return;
    var s = window.SC_INTEL.getCalibrationScore();
    if (s < 5) { setVisible(false); return; }
    var ins = window.SC_INTEL.getInsights();
    setScore(s);
    setInsight(ins[0] || '');
    setVisible(true);
  }

  useEffect(function () {
    load();
    window.addEventListener('sc_update', load);
    window.addEventListener('sc_intel_smarter', load);
    return function () {
      window.removeEventListener('sc_update', load);
      window.removeEventListener('sc_intel_smarter', load);
    };
  }, []);

  if (!visible) return null;

  var label = window.SC_INTEL ? window.SC_INTEL.getCalibrationLabel(score) : '';
  var color = score >= 80 ? '#0d9488' : score >= 55 ? '#16a34a' : score >= 25 ? '#f59e0b' : '#6b7280';

  return h('div', {
    role:'button', tabIndex:0,
    'aria-label':'View Cricket Intelligence profile',
    onClick:   function () { nav('IntelligenceHub'); },
    onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') nav('IntelligenceHub'); },
    style: {
      margin:'0 16px 12px', padding:'12px 14px', borderRadius:14,
      background:'linear-gradient(135deg,rgba(13,148,136,0.08),rgba(22,163,74,0.06))',
      border:'1px solid rgba(13,148,136,0.25)',
      cursor:'pointer', outline:'none',
    }
  },
    h('div', { style: { display:'flex', alignItems:'center', gap:12 } },
      // Mini ring
      h('div', { style: { position:'relative', width:44, height:44, flexShrink:0 } },
        h(ProgressRing, { score:score, size:44, strokeWidth:4 }),
        h('div', { style: { position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:color } }, score)
      ),
      // Text
      h('div', { style: { flex:1, minWidth:0 } },
        h('div', { style: { display:'flex', alignItems:'center', gap:6, marginBottom:3 } },
          h('div', { style: { fontSize:12, fontWeight:700, color:'#f0fdf4' } }, '🧠 Cricket Intelligence'),
          h('div', { style: { fontSize:10, color:color, fontWeight:700, background:color+'15', padding:'1px 6px', borderRadius:99, border:'1px solid '+color+'30', flexShrink:0 } }, label)
        ),
        insight
          ? h('div', { style: { fontSize:11, color:'#9ca3af', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, insight)
          : h('div', { style: { fontSize:11, color:'#6b7280' } }, 'AI calibrating to your unique style...')
      ),
      h('div', { style: { fontSize:16, color:color, flexShrink:0 } }, '›')
    )
  );
}

// ── Register ───────────────────────────────────────────────────────
A.IntelligenceHubPage  = IntelligenceHubPage;
A.IntelligenceHomeCard = IntelligenceHomeCard;

console.log('[SC] app-intelligence-hub v1.0 — Intelligence Hub + Home Card ready');
})();
