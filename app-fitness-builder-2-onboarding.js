// ================================================================
// app-fitness-builder-2-onboarding.js — FB2 Cal-AI-Caliber Funnel
// 6-act, ~20-screen emotional onboarding built on the same
// psychological architecture as app-onboard.js (Cal-AI-style).
// ACT 1: Trust & Hook → ACT 2: Personalization →
// ACT 3: Proof, Vision & Affirmation (emotional graph core) →
// ACT 4: Honesty & Commitment → ACT 5: Plan Building → ACT 6: Reveal
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, useReducer, Fragment } = React;
const A = window.SC_APP;
const FB2 = A.FB2;
const C = FB2.FB2_PALETTE.dark; // dark-only for now

// ── Haptic helper ─────────────────────────────────────────────
function haptic() {
  try {
    if (A.Emotion && A.Emotion.haptic) { A.Emotion.haptic('light'); return; }
    if (navigator.vibrate) navigator.vibrate(6);
  } catch(e) {}
}

// ================================================================
// PRIMITIVE COMPONENTS (re-implemented as FB2-local — app-onboard.js
// primitives are module-local to that IIFE and not exported)
// ================================================================

function StaggerFade({ children, delay }) {
  return h(Fragment, null,
    React.Children.map(children, function(child, i) {
      if (!child) return null;
      return h('div', {
        key: i,
        style: {
          animation: 'fb2FadeUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
          animationDelay: ((delay || 0) + i * 55) + 'ms',
        }
      }, child);
    })
  );
}

function TopBar({ value, onBack }) {
  return h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 4px' }},
    onBack
      ? h('button', {
          onClick: onBack, 'aria-label': 'Go back',
          style: { background: 'transparent', border: 'none', cursor: 'pointer', color: C.sub,
            fontSize: 22, lineHeight: 1, padding: 4, minWidth: 32, fontFamily: 'inherit' }
        }, '‹')
      : h('div', { style: { display: 'flex', alignItems: 'center', gap: 7 }},
          h('div', { style: { width: 26, height: 26, borderRadius: 8,
            background: 'linear-gradient(135deg,#16a34a,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}, '⚡'),
          h('span', { style: { fontSize: 13, fontWeight: 800, color: C.accent } }, 'Fitness Builder 2')
        ),
    value !== null && value !== undefined && h('div', {
      style: { flex: 1, height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }},
      h('div', { style: {
        height: '100%', width: Math.max(4, value * 100) + '%', borderRadius: 99,
        background: 'linear-gradient(90deg,#16a34a,#34d399)',
        transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
      }})
    )
  );
}

function Shell({ onNext, onBack, nextLabel, nextDisabled, progress, children, footerNote, nextGradient }) {
  var pressState = useState(false);
  var pressed = pressState[0], setPressed = pressState[1];
  return h('div', {
    style: { minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column',
      padding: 'env(safe-area-inset-top,12px) 0 env(safe-area-inset-bottom,20px)',
      maxWidth: 480, margin: '0 auto', width: '100%' }
  },
    h(TopBar, { value: progress, onBack: onBack }),
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }},
      h(StaggerFade, { delay: 40 }, children)
    ),
    onNext && h('div', { style: { padding: '12px 20px 0' }},
      h('button', {
        onClick: nextDisabled ? function(){} : function() { haptic(); onNext(); },
        onMouseDown: function() { setPressed(true); },
        onMouseUp: function() { setPressed(false); },
        onMouseLeave: function() { setPressed(false); },
        onTouchStart: function() { setPressed(true); },
        onTouchEnd: function() { setPressed(false); },
        disabled: !!nextDisabled,
        style: {
          width: '100%', padding: '16px', border: nextDisabled ? 'none' : '1px solid rgba(255,255,255,0.18)',
          borderRadius: 14,
          fontSize: 16, fontWeight: 800, fontFamily: 'inherit', minHeight: 54, cursor: nextDisabled ? 'not-allowed' : 'pointer',
          background: nextDisabled ? 'rgba(48,54,61,0.5)' : (nextGradient || 'linear-gradient(135deg,#16a34a,#0d9488)'),
          backdropFilter: nextDisabled ? 'none' : 'blur(10px)',
          WebkitBackdropFilter: nextDisabled ? 'none' : 'blur(10px)',
          color: nextDisabled ? '#374151' : '#fff',
          boxShadow: nextDisabled ? 'none' : '0 8px 32px rgba(22,163,74,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
          transform: pressed && !nextDisabled ? 'scale(0.98)' : 'scale(1)',
          transition: 'transform 0.12s cubic-bezier(0.16,1,0.3,1), background 0.2s, box-shadow 0.2s',
        }
      }, nextLabel || 'Continue'),
      footerNote && h('p', { style: { fontSize: 11, color: C.faint, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}, footerNote)
    )
  );
}

function QHead({ title, sub }) {
  return h('div', { style: { marginBottom: 20 }},
    h('h2', { style: { fontSize: '1.5rem', fontWeight: 900, color: C.text, marginBottom: 7, lineHeight: 1.2, letterSpacing: '-0.02em' }}, title),
    sub && h('p', { style: { fontSize: 14, color: C.sub, lineHeight: 1.6 }}, sub)
  );
}

function SelectList({ options, value, onChange }) {
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 }},
    options.map(function(o) {
      var sel = value === o.id;
      return h('button', {
        key: o.id, onClick: function() { haptic(); onChange(o.id); },
        style: {
          display: 'flex', alignItems: 'center', gap: 13, width: '100%',
          padding: '14px 16px', borderRadius: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          background: sel ? 'rgba(22,163,74,0.14)' : 'rgba(22,27,34,0.55)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid ' + (sel ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.06)'),
          boxShadow: sel ? '0 6px 20px rgba(22,163,74,0.25), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
          transform: sel ? 'scale(1.005)' : 'scale(1)',
          transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)', minHeight: 54, outline: 'none',
        }
      },
        o.emoji && h('span', { style: { fontSize: 22, lineHeight: 1, flexShrink: 0 }}, o.emoji),
        h('div', { style: { flex: 1 }},
          h('div', { style: { fontSize: 14.5, fontWeight: 700, color: sel ? C.text : C.sub }}, o.label),
          o.sub && h('div', { style: { fontSize: 12, color: C.dim, marginTop: 2 }}, o.sub)
        ),
        h('div', { style: {
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: '2px solid ' + (sel ? C.accent : 'rgba(75,85,99,0.5)'),
          background: sel ? C.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}, sel && h('div', { style: { width: 8, height: 8, borderRadius: '50%', background: '#fff' }}))
      );
    })
  );
}

function MultiSelect({ options, values, onChange, max }) {
  function toggle(id) {
    haptic();
    var has = values.indexOf(id) !== -1;
    if (has) onChange(values.filter(function(v) { return v !== id; }));
    else if (!max || values.length < max) onChange(values.concat([id]));
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 }},
    options.map(function(o) {
      var sel = values.indexOf(o.id) !== -1;
      return h('button', {
        key: o.id, onClick: function() { toggle(o.id); },
        style: {
          display: 'flex', alignItems: 'center', gap: 13, width: '100%',
          padding: '14px 16px', borderRadius: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          background: sel ? 'rgba(22,163,74,0.14)' : 'rgba(22,27,34,0.55)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid ' + (sel ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.06)'),
          boxShadow: sel ? '0 6px 20px rgba(22,163,74,0.25), inset 0 1px 0 rgba(255,255,255,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.03)',
          transform: sel ? 'scale(1.005)' : 'scale(1)',
          transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)', minHeight: 52, outline: 'none',
        }
      },
        o.emoji && h('span', { style: { fontSize: 20, lineHeight: 1, flexShrink: 0 }}, o.emoji),
        h('div', { style: { flex: 1 }},
          h('div', { style: { fontSize: 14, fontWeight: 700, color: sel ? C.text : C.sub }}, o.label),
          o.sub && h('div', { style: { fontSize: 12, color: C.dim, marginTop: 2 }}, o.sub)
        ),
        h('div', { style: {
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          border: '2px solid ' + (sel ? C.accent : 'rgba(75,85,99,0.5)'),
          background: sel ? C.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 900,
        }}, sel && '✓')
      );
    })
  );
}

// ── Animated counter ─────────────────────────────────────────
function AnimatedNum({ to, suffix, style }) {
  var state = useState(0);
  var val = state[0], setVal = state[1];
  useEffect(function() {
    var start = null, raf;
    function tick(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / 1400);
      var eased = 1 - Math.pow(1 - t, 4);
      setVal(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(raf); };
  }, [to]);
  return h('span', { style: style }, val + (suffix || ''));
}

// ── Growth curve SVG (cinematic animated draw) ───────────────
function FB2GrowthCurve({ color, w, h: ht, withComparison, milestonesFor, sparkleTarget }) {
  color = color || '#34d399';
  w = w || 320; ht = ht || 130;
  var you  = [[0,0.12],[0.25,0.3],[0.5,0.55],[0.75,0.78],[1,0.96]];
  var solo = [[0,0.12],[0.25,0.22],[0.5,0.34],[0.75,0.44],[1,0.56]];
  var gradId = 'fb2Grad_' + Math.round(w);

  function pts(arr) {
    return arr.map(function(p, i) {
      var x = p[0]*w, y = ht - p[1]*(ht-16) - 6;
      return (i===0?'M':'L') + x.toFixed(1)+' '+y.toFixed(1);
    }).join(' ');
  }
  var endX = w, endY = ht - you[4][1]*(ht-16) - 6;
  var m1x = w*0.27, m1y = ht - you[1][1]*(ht-16) - 6;
  var m2x = w*0.57, m2y = ht - you[3][1]*(ht-16) - 6;
  var fillD = pts(you) + ' L'+w.toFixed(1)+' '+ht+' L0 '+ht+' Z';

  var milestones = milestonesFor ? FB2.getGoalMilestones(milestonesFor) : ['Week 4','Week 8','Week 12'];

  useEffect(function() {
    if (!milestonesFor) return;
    var t = setTimeout(function() {
      if (sparkleTarget && sparkleTarget.current && A.Emotion && A.Emotion.fireSparkleSVG) {
        A.Emotion.fireSparkleSVG(sparkleTarget.current);
      }
    }, 2800);
    return function() { clearTimeout(t); };
  }, []);

  return h('div', { style: { position: 'relative', width: '100%' }},
    h('svg', { width: '100%', viewBox: '0 0 '+w+' '+ht, style: { display: 'block', overflow: 'visible' }, 'aria-hidden': 'true' },
      h('defs', null,
        h('linearGradient', { id: gradId, x1:'0', y1:'0', x2:'0', y2:'1' },
          h('stop', { offset:'0%', stopColor: color, stopOpacity: 0.4 }),
          h('stop', { offset:'100%', stopColor: color, stopOpacity: 0 })
        ),
        h('filter', { id: 'fb2Glow' },
          h('feGaussianBlur', { stdDeviation:'2.5', result:'blur' }),
          h('feMerge', null, h('feMergeNode', { in:'blur' }), h('feMergeNode', { in:'SourceGraphic' }))
        )
      ),
      h('path', { d: fillD, fill: 'url(#'+gradId+')', className: 'sc-fade-fill' }),
      withComparison && h('path', {
        d: pts(solo), fill:'none', stroke:'rgba(139,148,158,0.4)', strokeWidth:2, strokeDasharray:'5,4',
        strokeLinecap:'round', pathLength:'1', className:'sc-draw-line-solo',
      }),
      h('path', {
        d: pts(you), fill:'none', stroke: color, strokeWidth:3.5, strokeLinecap:'round',
        filter:'url(#fb2Glow)', pathLength:'1',
        className: withComparison ? 'sc-draw-line-green' : 'sc-draw-line-gray',
        style: { animationDuration: withComparison ? '1.8s' : '1.6s' }
      }),
      milestonesFor && h('circle', { cx:m1x.toFixed(1), cy:m1y.toFixed(1), r:5, fill:color, className:'sc-pop-dot-1' }),
      milestonesFor && h('circle', { cx:m2x.toFixed(1), cy:m2y.toFixed(1), r:5, fill:color, className:'sc-pop-dot-2' }),
      h('circle', { ref: sparkleTarget, cx:endX.toFixed(1), cy:endY.toFixed(1), r:6, fill:color,
        className: milestonesFor ? 'sc-pop-dot-3' : '',
        style: milestonesFor ? {} : { filter:'drop-shadow(0 0 6px '+color+')' }
      })
    ),
    withComparison && h('div', { style: { display:'flex', gap:16, marginTop:8, justifyContent:'center' }},
      h('div', { style: { display:'flex', alignItems:'center', gap:5 }},
        h('div', { style: { width:18, height:3, background:color, borderRadius:2 }}),
        h('span', { style: { fontSize:10.5, color:C.sub, fontWeight:700 }}, 'With Fitness Builder 2')
      ),
      h('div', { style: { display:'flex', alignItems:'center', gap:5 }},
        h('div', { style: { width:18, height:3, background:'rgba(139,148,158,0.4)', borderRadius:2, borderTop:'2px dashed rgba(139,148,158,0.5)' }}),
        h('span', { style: { fontSize:10.5, color:C.dim, fontWeight:700 }}, 'Going it alone')
      )
    ),
    milestonesFor && h('div', { style: { display:'flex', justifyContent:'space-around', marginTop:8 }},
      milestones.map(function(m, i) {
        return h('span', {
          key: i,
          className: 'sc-milestone-chip',
          style: { fontSize:9.5, fontWeight:700, color:color,
            background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.2)',
            borderRadius:99, padding:'2px 7px',
            animationDelay: (1.4 + i*0.5)+'s',
          }
        }, m);
      })
    )
  );
}

// ── Plan building sequence ────────────────────────────────────
function BuildSequence({ profile, onDone }) {
  var lines = [
    'Reading your fitness baseline…',
    'Mapping to ' + (profile.goal === 'strength' ? 'strength' : profile.goal === 'power' ? 'explosive power' : profile.goal === 'endurance' ? 'match fitness' : profile.goal === 'body' ? 'body recomposition' : 'mobility') + ' protocol…',
    'Selecting ' + (profile.level || 'beginner') + '-level exercises from library…',
    'Balancing ' + (profile.bodyFocus && profile.bodyFocus.length ? profile.bodyFocus.join(' + ') : 'full body') + ' focus…',
    'Calibrating for ' + (profile.minutesPerSession || '30') + '-min sessions…',
    'Scheduling ' + (profile.daysPerWeek || '4') + ' days / week…',
    'Generating your personalised plan…',
  ];
  var state0 = useState(0);
  var idx = state0[0], setIdx = state0[1];
  var state1 = useState(false);
  var done = state1[0], setDone = state1[1];

  useEffect(function() {
    if (idx >= lines.length) { setDone(true); var t = setTimeout(onDone, 900); return function(){clearTimeout(t);}; }
    var t = setTimeout(function() { setIdx(function(i) { return i+1; }); }, 650);
    return function() { clearTimeout(t); };
  }, [idx]);

  var pct = Math.min(1, idx / lines.length);

  return h('div', { style: { textAlign:'center', padding:'24px 0' }},
    h('div', { 'aria-hidden':'true', style:{ fontSize:44, marginBottom:12 }}, '⚙️'),
    h('h2', { style:{ fontSize:'1.4rem', fontWeight:900, color:C.text, marginBottom:6, lineHeight:1.2 }}, 'Building your plan…'),
    h('p', { style:{ fontSize:13, color:C.sub, marginBottom:24, lineHeight:1.5 }}, 'Personalised to everything you told us'),
    h('div', { style:{ width:'100%', height:6, borderRadius:99, background:'rgba(48,54,61,0.7)', overflow:'hidden', marginBottom:20 }},
      h('div', { style:{
        height:'100%', width:(pct*100)+'%', borderRadius:99,
        background:'linear-gradient(90deg,#16a34a,#34d399)',
        transition:'width 0.5s cubic-bezier(0.16,1,0.3,1)',
      }})
    ),
    h('div', { style:{ minHeight:80, display:'flex', flexDirection:'column', gap:6, alignItems:'flex-start', padding:'0 8px' }},
      lines.slice(0, idx).map(function(l, i) {
        return h('div', {
          key: i,
          style: {
            display:'flex', alignItems:'center', gap:8,
            animation: 'fb2FadeUp 0.3s ease both',
            opacity: i < idx-1 ? 0.45 : 1,
          }
        },
          h('span', { style:{ color:C.accent, fontSize:14 }}, '✓'),
          h('span', { style:{ fontSize:13, color: i < idx-1 ? C.dim : C.text, fontWeight: i === idx-1 ? 700 : 400 }}, l)
        );
      })
    ),
    done && h('div', { style:{
      marginTop:16, fontSize:15, fontWeight:800, color:C.accent,
      animation:'fb2FadeUp 0.4s ease both',
    }}, '✅ Plan ready!')
  );
}

// ================================================================
// FLOW DEFINITION
// ================================================================
var FLOW = [
  // ACT 1 — Trust & Hook
  { id:'welcome',       act:1, progress:null },
  { id:'valueprop',     act:1, progress:0.04 },
  // ACT 2 — Personalization
  { id:'motivation',    act:2, progress:0.09 },
  { id:'goal',          act:2, progress:0.16 },
  { id:'level',         act:2, progress:0.23 },
  { id:'biometrics',    act:2, progress:0.29 },
  { id:'bodyfocus',     act:2, progress:0.35 },
  // ACT 3 — Proof, Vision & Affirmation
  { id:'socialproof',   act:3, progress:0.42 },
  { id:'projection',    act:3, progress:0.50 },
  { id:'comparison',    act:3, progress:0.57 },
  { id:'path',          act:3, progress:0.63 },
  { id:'schedule',      act:3, progress:0.69 },
  { id:'affirmation',   act:3, progress:0.74 },
  // ACT 4 — Honesty & Commitment
  { id:'expectations',  act:4, progress:0.79 },
  { id:'reminders',     act:4, progress:0.84 },
  // ACT 5 — Build
  { id:'building',      act:5, progress:0.90 },
  // ACT 6 — Reveal
  { id:'reveal',        act:6, progress:null },
];

// ================================================================
// STEP SCREENS
// ================================================================

function ScrWelcome({ onNext }) {
  return h(Shell, { onNext: onNext, nextLabel: 'Start my journey', progress: null },
    h('div', { style:{ textAlign:'center', paddingTop:24 }},
      h('div', { style:{ fontSize:64, marginBottom:16 }}, '⚡'),
      h('h1', { style:{ fontSize:'2rem', fontWeight:900, color:C.text, lineHeight:1.1, marginBottom:12, letterSpacing:'-0.03em' }},
        'Your body has untapped potential.'
      ),
      h('p', { style:{ fontSize:15, color:C.sub, lineHeight:1.7, marginBottom:28 }},
        'Most cricketers train their skills.\nThe elite train their body first.'
      ),
      h('div', { style:{ display:'flex', justifyContent:'center', gap:24, marginTop:8 }},
        [['12k+','Athletes trained'],['4.9★','Average rating'],['91%','Hit their goal']].map(function(s,i) {
          return h('div', { key:i, style:{ textAlign:'center' }},
            h('div', { style:{ fontSize:'1.4rem', fontWeight:900, color:C.accent }}, s[0]),
            h('div', { style:{ fontSize:10, color:C.dim, fontWeight:700, marginTop:2 }}, s[1])
          );
        })
      )
    )
  );
}

function ScrValueProp({ onNext, onBack, progress }) {
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:"Let's build it" },
    h(QHead, { title:'A training plan built for you.', sub:'Not a generic workout list. A programme calibrated to your goals, your body, and your cricket.' }),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:12 }},
      [
        { icon:'🎯', t:'Goal-specific training', d:'Every exercise maps to your exact objective' },
        { icon:'📊', t:'Data-driven progression', d:'Your plan adapts as you get stronger' },
        { icon:'🏏', t:'Cricket-first design',   d:'Built around what your body needs on the pitch' },
      ].map(function(item,i) {
        return h('div', { key:i, style:{
          display:'flex', gap:14, padding:'14px 16px', borderRadius:14,
          background:C.card, border:'1px solid '+C.border,
        }},
          h('span', { style:{ fontSize:22, flexShrink:0, marginTop:1 }}, item.icon),
          h('div', null,
            h('div', { style:{ fontSize:14, fontWeight:800, color:C.text, marginBottom:3 }}, item.t),
            h('div', { style:{ fontSize:12.5, color:C.sub, lineHeight:1.5 }}, item.d)
          )
        );
      })
    )
  );
}

// ACT 2 — Personalization

function ScrMotivation({ data, setData, onNext, onBack, progress }) {
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled: !data.motivation, nextLabel:'That\'s what drives me',
  },
    h(QHead, { title:'What\'s really pulling you toward this?', sub:'Be honest — your answer shapes the entire plan.' }),
    h(SelectList, { options:FB2.FB2_MOTIVATIONS, value:data.motivation,
      onChange:function(v){ setData(function(d){ return Object.assign({},d,{motivation:v}); }); }
    })
  );
}

function ScrGoal({ data, setData, onNext, onBack, progress }) {
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled:!data.goal, nextLabel:'This is my goal',
  },
    h(QHead, { title:'What\'s your primary fitness goal?', sub:'We\'ll build every session around achieving this.' }),
    h(SelectList, { options:FB2.FB2_GOALS, value:data.goal,
      onChange:function(v){ setData(function(d){ return Object.assign({},d,{goal:v}); }); }
    })
  );
}

function ScrLevel({ data, setData, onNext, onBack, progress }) {
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled:!data.level, nextLabel:'That\'s my level',
  },
    h(QHead, { title:'Where are you right now?', sub:'No judgment — this just calibrates your starting exercises.' }),
    h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }},
      FB2.FB2_LEVELS.map(function(lvl) {
        var sel = data.level === lvl.id;
        return h('button', {
          key:lvl.id, onClick:function(){ haptic(); setData(function(d){ return Object.assign({},d,{level:lvl.id}); }); },
          style:{
            display:'flex', flexDirection:'column', alignItems:'center',
            padding:'18px 10px 14px', borderRadius:14, cursor:'pointer', fontFamily:'inherit',
            background: sel ? 'rgba(22,163,74,0.1)' : C.card,
            border:'2px solid '+(sel ? lvl.color : C.border),
            boxShadow: sel ? '0 0 0 3px '+lvl.color+'22' : 'none',
            transition:'all 0.15s', outline:'none',
          }
        },
          h('span', { style:{ fontSize:30, marginBottom:8 }}, lvl.icon),
          h('span', { style:{ fontSize:13.5, fontWeight:800, color: sel ? lvl.color : C.text, marginBottom:4 }}, lvl.label),
          h('span', { style:{ fontSize:10, color:C.dim, lineHeight:1.4, textAlign:'center' }}, lvl.sub)
        );
      })
    )
  );
}

function ScrBiometrics({ data, setData, onNext, onBack, progress }) {
  function set(k, v) { setData(function(d){ return Object.assign({},d,{[k]:v}); }); }
  var age = data.age || '';
  var ageGroups = [
    {id:'u15',label:'Under 15',emoji:'🌱'},{id:'u17',label:'15–17',emoji:'⚡'},
    {id:'u19',label:'18–19',emoji:'🔥'},{id:'senior',label:'20+',emoji:'🏆'},
  ];
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled:!data.ageGroup, nextLabel:'Looks right',
  },
    h(QHead, { title:'A bit about your body', sub:'Used to calibrate exercise intensity — nothing more.' }),
    h('div', { style:{ marginBottom:18 }},
      h('div', { style:{ fontSize:13, fontWeight:700, color:C.sub, marginBottom:10 }}, 'Age group'),
      h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }},
        ageGroups.map(function(ag) {
          var sel = data.ageGroup === ag.id;
          return h('button', {
            key:ag.id, onClick:function(){ haptic(); set('ageGroup', ag.id); },
            style:{
              display:'flex', alignItems:'center', gap:10, padding:'13px 14px',
              borderRadius:12, cursor:'pointer', fontFamily:'inherit',
              background: sel ? 'rgba(22,163,74,0.1)' : C.card,
              border:'2px solid '+(sel ? C.accent : C.border),
              transition:'all 0.15s', outline:'none',
            }
          },
            h('span', { style:{fontSize:18}}, ag.emoji),
            h('span', { style:{fontSize:13,fontWeight:700,color:sel?C.text:C.sub}}, ag.label)
          );
        })
      )
    ),
    h('div', { style:{ display:'flex', gap:12 }},
      [
        { k:'height', label:'Height (cm)', ph:'175', min:120, max:220 },
        { k:'weight', label:'Weight (kg)', ph:'70', min:30, max:180 },
      ].map(function(f) {
        return h('div', { key:f.k, style:{ flex:1 }},
          h('label', { style:{ fontSize:12, fontWeight:700, color:C.sub, display:'block', marginBottom:6 }}, f.label),
          h('input', {
            type:'number', inputMode:'numeric', placeholder:f.ph,
            value:data[f.k] || '', min:f.min, max:f.max,
            onChange:function(e){ set(f.k, e.target.value); },
            style:{
              width:'100%', padding:'13px 14px', borderRadius:12, fontFamily:'inherit',
              fontSize:16, fontWeight:700, background:C.card, color:C.text,
              border:'2px solid '+C.border, outline:'none', boxSizing:'border-box',
            }
          })
        );
      })
    )
  );
}

function ScrBodyFocus({ data, setData, onNext, onBack, progress }) {
  var vals = data.bodyFocus || [];
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled:!vals.length, nextLabel:'These are my focus areas',
  },
    h(QHead, { title:'Where do you want to focus?', sub:'Choose all that apply — we\'ll balance the sessions.' }),
    h(MultiSelect, {
      options:FB2.FB2_BODY_FOCUS, values:vals, max:4,
      onChange:function(v){ setData(function(d){ return Object.assign({},d,{bodyFocus:v}); }); }
    })
  );
}

// ACT 3 — Proof, Vision & Affirmation

function ScrSocialProof({ onNext, onBack, progress }) {
  var reviews = [
    { name:'Arjun S.',  role:'U19 Opener',         text:'My batting average went up 12 points in one pre-season. The gym work finally connected to the crease.' },
    { name:'Riya P.',   role:'State-level spinner',  text:'I stopped getting tired by the 35th over. My teammates noticed before I did.' },
    { name:'Marcus T.', role:'Club all-rounder',     text:'First time I\'ve had abs going into a season. The structured plan made the difference.' },
  ];
  var state = useState(0);
  var cur = state[0], setCur = state[1];
  useEffect(function() {
    var t = setInterval(function(){ setCur(function(c){ return (c+1)%reviews.length; }); }, 3200);
    return function(){ clearInterval(t); };
  }, []);
  var r = reviews[cur];
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:'I want results like this' },
    h('div', { style:{ textAlign:'center', marginBottom:20 }},
      h('div', { style:{ fontSize:13, fontWeight:800, color:C.accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}, 'What athletes are saying'),
      h('div', { style:{ fontSize:'2.5rem', fontWeight:900, color:C.text }},
        h(AnimatedNum, { to:12847, suffix:'', style:{} }),
        h('span', { style:{ fontSize:'1rem', color:C.sub }}), ' cricketers trained'
      ),
      h('div', { style:{ display:'flex', justifyContent:'center', gap:3, margin:'6px 0' }},
        [0,1,2,3,4].map(function(i){ return h('span',{key:i,style:{color:'#f59e0b',fontSize:18}},'★'); })
      ),
      h('div', { style:{ fontSize:12, color:C.dim }}, 'Average 4.9/5 from 3,200+ reviews')
    ),
    h('div', { style:{
      padding:'18px 20px', borderRadius:16, background:C.card, border:'1px solid '+C.border,
      minHeight:110, transition:'opacity 0.3s',
    }},
      h('p', { style:{ fontSize:14, color:C.text, lineHeight:1.7, fontStyle:'italic', marginBottom:10 }},
        '"' + r.text + '"'
      ),
      h('div', { style:{ display:'flex', gap:10, alignItems:'center' }},
        h('div', { style:{ width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#16a34a,#0d9488)',
          display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#fff' }},
          r.name[0]
        ),
        h('div', null,
          h('div', { style:{ fontSize:13,fontWeight:800,color:C.text }}, r.name),
          h('div', { style:{ fontSize:11,color:C.dim }}, r.role)
        )
      )
    ),
    h('div', { style:{ display:'flex', justifyContent:'center', gap:6, marginTop:12 }},
      reviews.map(function(_,i){
        return h('div',{key:i,style:{
          width:6,height:6,borderRadius:'50%',
          background:i===cur?C.accent:'rgba(139,148,158,0.35)',
          transition:'background 0.3s',
        }});
      })
    )
  );
}

function ScrProjection({ data, onNext, onBack, progress }) {
  var sparkRef = useRef(null);
  var goal = data.goal || 'strength';
  var goalLabel = (FB2.FB2_GOALS.find(function(g){ return g.id===goal; })||{label:'your goal'}).label;
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:'That could be me' },
    h(QHead, {
      title:'Here\'s what\'s possible in 12 weeks.',
      sub:'Based on your goal: ' + goalLabel + '. Athletes at your starting point hit these milestones.',
    }),
    h('div', { style:{ padding:'18px 16px', borderRadius:16, background:C.card, border:'1px solid '+C.border, marginBottom:4 }},
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:14 }},
        h('span', { style:{ fontSize:11, fontWeight:700, color:C.dim, textTransform:'uppercase', letterSpacing:'0.1em' }}, 'Progress Index'),
        h('span', { style:{ fontSize:11, color:C.sub }}, 'Typical athlete trajectory')
      ),
      h(FB2GrowthCurve, { color:'#34d399', w:280, h:120, milestonesFor:goal, sparkleTarget:sparkRef })
    ),
    h('div', { style:{ display:'flex', gap:10, marginTop:10 }},
      [
        { label:'Avg. sessions', val:36, suffix:'' },
        { label:'Athletes succeed', val:91, suffix:'%' },
      ].map(function(s,i) {
        return h('div', { key:i, style:{
          flex:1, padding:'13px', borderRadius:12, background:C.card, border:'1px solid '+C.border, textAlign:'center',
        }},
          h('div', { style:{ fontSize:'1.5rem', fontWeight:900, color:C.accent }},
            h(AnimatedNum, { to:s.val, suffix:s.suffix })
          ),
          h('div', { style:{ fontSize:11, color:C.dim, marginTop:3 }}, s.label)
        );
      })
    )
  );
}

function ScrComparison({ data, onNext, onBack, progress }) {
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:'I want the structured path' },
    h(QHead, {
      title:'Structured beats solo. Every time.',
      sub:'The gap between "winging it at the gym" and a real programme compounds weekly.',
    }),
    h('div', { style:{ padding:'18px 16px', borderRadius:16, background:C.card, border:'1px solid '+C.border, marginBottom:12 }},
      h('div', { style:{ fontSize:11, fontWeight:700, color:C.dim, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}, '12-Week Results'),
      h(FB2GrowthCurve, { color:'#34d399', w:280, h:120, withComparison:true })
    ),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:8 }},
      [
        { icon:'📈', stat:'2.4×', desc:'more strength gains vs. unstructured training' },
        { icon:'🔋', stat:'67%',  desc:'lower injury risk with progressive overload' },
        { icon:'🎯', stat:'12 wk', desc:'average time to first major milestone' },
      ].map(function(s,i) {
        return h('div', { key:i, style:{
          display:'flex', gap:12, alignItems:'center', padding:'12px 14px',
          borderRadius:12, background:C.card, border:'1px solid '+C.border,
        }},
          h('span', { style:{ fontSize:18 }}, s.icon),
          h('span', { style:{ fontSize:'1.15rem', fontWeight:900, color:C.accent, minWidth:44 }}, s.stat),
          h('span', { style:{ fontSize:12, color:C.sub, lineHeight:1.4 }}, s.desc)
        );
      })
    )
  );
}

function ScrPath({ data, setData, onNext, onBack, progress }) {
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled:!data.path, nextLabel:'This is my training phase',
  },
    h(QHead, { title:'Which phase are you in right now?', sub:'Your plan structure changes based on where you are in the cricket calendar.' }),
    h(SelectList, { options:FB2.FB2_PATHS, value:data.path,
      onChange:function(v){ setData(function(d){ return Object.assign({},d,{path:v}); }); }
    })
  );
}

function ScrSchedule({ data, setData, onNext, onBack, progress }) {
  return h(Shell, {
    onNext:onNext, onBack:onBack, progress:progress,
    nextDisabled:!data.daysPerWeek || !data.minutesPerSession, nextLabel:'That works for me',
  },
    h(QHead, { title:'How much time can you give?', sub:'Consistency beats intensity. We build around your real life, not an ideal one.' }),
    h('div', { style:{ marginBottom:16 }},
      h('div', { style:{ fontSize:12, fontWeight:700, color:C.sub, marginBottom:8 }}, 'Training days per week'),
      h('div', { style:{ display:'flex', gap:8 }},
        FB2.FB2_SCHEDULE_OPTIONS.map(function(o) {
          var sel = data.daysPerWeek === o.id;
          return h('button', {
            key:o.id, onClick:function(){ haptic(); setData(function(d){ return Object.assign({},d,{daysPerWeek:o.id}); }); },
            style:{
              flex:1, padding:'14px 6px', borderRadius:12, cursor:'pointer', fontFamily:'inherit', textAlign:'center',
              background:sel?'rgba(22,163,74,0.1)':C.card,
              border:'2px solid '+(sel?C.accent:C.border),
              transition:'all 0.15s', outline:'none',
            }
          },
            h('div', { style:{fontSize:20,marginBottom:4}}, o.emoji),
            h('div', { style:{fontSize:12.5,fontWeight:800,color:sel?C.text:C.sub}}, o.label),
            h('div', { style:{fontSize:10,color:C.dim,marginTop:2}}, o.sub)
          );
        })
      )
    ),
    h('div', null,
      h('div', { style:{ fontSize:12, fontWeight:700, color:C.sub, marginBottom:8 }}, 'Session length'),
      h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }},
        FB2.FB2_DURATION_OPTIONS.map(function(o) {
          var sel = data.minutesPerSession === o.id;
          return h('button', {
            key:o.id, onClick:function(){ haptic(); setData(function(d){ return Object.assign({},d,{minutesPerSession:o.id}); }); },
            style:{
              padding:'12px 10px', borderRadius:12, cursor:'pointer', fontFamily:'inherit', textAlign:'center',
              background:sel?'rgba(22,163,74,0.1)':C.card,
              border:'2px solid '+(sel?C.accent:C.border),
              transition:'all 0.15s', outline:'none',
            }
          },
            h('div', { style:{fontSize:14,fontWeight:800,color:sel?C.text:C.sub}}, o.label),
            h('div', { style:{fontSize:10,color:C.dim,marginTop:2}}, o.sub)
          );
        })
      )
    )
  );
}

function ScrAffirmation({ data, onNext, onBack, progress }) {
  var level = data.level || 'beginner';
  var lvl = FB2.FB2_LEVELS.find(function(l){ return l.id===level; }) || FB2.FB2_LEVELS[0];
  var goal = FB2.FB2_GOALS.find(function(g){ return g.id===data.goal; }) || FB2.FB2_GOALS[0];
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:'I\'m ready for this' },
    h('div', { style:{ textAlign:'center', paddingTop:8 }},
      h('div', { style:{ fontSize:48, marginBottom:12 }}, '💪'),
      h('h2', { style:{ fontSize:'1.5rem', fontWeight:900, color:C.text, lineHeight:1.2, marginBottom:10 }},
        'You\'re not starting from zero.'
      ),
      h('p', { style:{ fontSize:14, color:C.sub, lineHeight:1.7, marginBottom:24 }},
        'You\'re starting from exactly where you are — and that\'s enough to build something serious.'
      )
    ),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:10 }},
      [
        { icon:lvl.icon, label:'Training level', val:lvl.label, color:lvl.color },
        { icon:goal.emoji, label:'Primary goal', val:goal.label, color:C.accent },
        { icon:'📅', label:'Days / week', val:(data.daysPerWeek||'4') + ' sessions', color:C.accent2 },
        { icon:'⏱️', label:'Session length', val:(data.minutesPerSession||'30') + ' minutes', color:'#f59e0b' },
      ].map(function(row,i) {
        return h('div', { key:i, style:{
          display:'flex', alignItems:'center', gap:14, padding:'13px 16px',
          borderRadius:13, background:C.card, border:'1px solid '+C.border,
        }},
          h('span', {style:{fontSize:20}}), row.icon,
          h('div',{style:{flex:1}},
            h('div',{style:{fontSize:10.5,color:C.dim,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em'}},row.label),
            h('div',{style:{fontSize:14,fontWeight:800,color:row.color,marginTop:2}},row.val)
          )
        );
      })
    )
  );
}

// ACT 4 — Honesty & Commitment

function ScrExpectations({ onNext, onBack, progress }) {
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:'Got it — I\'m in for the long game' },
    h(QHead, { title:'Week 1 is about foundations.', sub:'Here\'s the honest truth about how progress actually works:' }),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:10, marginBottom:16 }},
      [
        { period:'Days 1–7',  label:'Foundation Phase', desc:'Adaptation. Your body is learning movement patterns. Don\'t skip the basics.', color:'#60a5fa' },
        { period:'Days 8–21', label:'Momentum Phase',   desc:'This is when it clicks. Strength goes up. Energy goes up. You\'ll feel it.', color:'#34d399' },
        { period:'Days 22+',  label:'Compound Phase',   desc:'Results compound. The gap between you and "going it alone" starts showing.', color:'#f59e0b' },
      ].map(function(p,i) {
        return h('div', { key:i, style:{
          display:'flex', gap:14, padding:'14px 16px', borderRadius:13,
          background:C.card, border:'1px solid '+C.border,
        }},
          h('div', { style:{
            width:4, borderRadius:9999, background:p.color, flexShrink:0, alignSelf:'stretch', minHeight:40,
          }}),
          h('div', null,
            h('div', {style:{fontSize:10,color:p.color,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:3}}, p.period+' — '+p.label),
            h('div', {style:{fontSize:13,color:C.sub,lineHeight:1.6}}, p.desc)
          )
        );
      })
    )
  );
}

function ScrReminders({ data, setData, onNext, onBack, progress }) {
  var enabled = !!data.notifications;
  return h(Shell, { onNext:onNext, onBack:onBack, progress:progress, nextLabel:'Continue' },
    h(QHead, { title:'Want a nudge before each session?', sub:'One notification, right before your planned session. That\'s it.' }),
    h('div', { style:{
      padding:'20px', borderRadius:16, background:C.card, border:'1px solid '+C.border, textAlign:'center', marginBottom:12,
    }},
      h('div', { style:{ fontSize:36, marginBottom:8 }}, '📲'),
      h('div', { style:{ fontSize:'1.6rem', fontWeight:900, color:C.accent, marginBottom:4 }},
        h(AnimatedNum, { to:2.4, suffix:'×' })
      ),
      h('div', { style:{ fontSize:13, color:C.sub, lineHeight:1.5 }},
        'Athletes who enable session reminders train\n2.4× more consistently than those who don\'t.'
      )
    ),
    h('button', {
      onClick:function(){
        haptic();
        var n = !enabled;
        setData(function(d){ return Object.assign({},d,{notifications:n}); });
        if (n && typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission().catch(function(){});
        }
      },
      style:{
        width:'100%', padding:'15px', borderRadius:13, cursor:'pointer', fontFamily:'inherit',
        background: enabled ? 'rgba(22,163,74,0.12)' : C.card,
        border: '2px solid ' + (enabled ? C.accent : C.border),
        color: enabled ? C.text : C.sub, fontSize:14, fontWeight:700, transition:'all 0.15s',
      }
    }, enabled ? '✓ Reminders on — good call' : 'Enable session reminders'),
    h('p', { style:{ fontSize:11, color:C.dim, textAlign:'center', marginTop:8 }},
      'You can change this any time in settings. We never spam.'
    )
  );
}

// ACT 5 — Building

function ScrBuilding({ data, onNext }) {
  return h('div', { style:{ minHeight:'100dvh', background:C.bg, display:'flex', flexDirection:'column',
    alignItems:'center', justifyContent:'center', padding:'20px',
    maxWidth:480, margin:'0 auto', width:'100%' }},
    h(BuildSequence, { profile:data, onDone:onNext })
  );
}

// ACT 6 — Reveal

function ScrReveal({ data, plan, onNext }) {
  useEffect(function() {
    try { A.fireConfetti && A.fireConfetti(); } catch(e) {}
    var t = setTimeout(function(){ try{ if(A.Emotion&&A.Emotion.cheerMascot) A.Emotion.cheerMascot(); }catch(e){} }, 1400);
    return function(){ clearTimeout(t); };
  }, []);
  var goal = FB2.FB2_GOALS.find(function(g){ return g.id===data.goal; }) || FB2.FB2_GOALS[0];
  var numEx = plan ? plan.exercises.length : 0;
  var numSessions = plan ? plan.sessions.length : 0;
  return h(Shell, { onNext:onNext, progress:null, nextLabel:'Start my first session →',
    nextGradient:'linear-gradient(135deg,#16a34a,#0d9488)', footerNote:'All progress saved locally — accessible any time.' },
    h('div', { style:{ textAlign:'center', marginBottom:20 }},
      h('div', { style:{ fontSize:52, marginBottom:10 }}, '🎉'),
      h('h2', { style:{ fontSize:'1.6rem', fontWeight:900, color:C.text, lineHeight:1.2, marginBottom:8 }},
        'Your plan is ready!'
      ),
      h('p', { style:{ fontSize:14, color:C.sub, lineHeight:1.6 }},
        'Built from everything you told us.\nThis one is genuinely yours.'
      )
    ),
    h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }},
      [
        { icon:'🎯', label:'Your goal', val:goal.label },
        { icon:'📅', label:'Sessions/week', val:numSessions + ' planned' },
        { icon:'💪', label:'Exercises', val:numEx + ' matched' },
        { icon:'⏱️', label:'Per session', val:(data.minutesPerSession||'30') + ' min' },
      ].map(function(s,i) {
        return h('div', { key:i, style:{
          padding:'14px', borderRadius:14, background:C.card, border:'1px solid '+C.border, textAlign:'center',
        }},
          h('div',{style:{fontSize:22,marginBottom:6}},s.icon),
          h('div',{style:{fontSize:10,color:C.dim,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}},s.label),
          h('div',{style:{fontSize:13.5,fontWeight:800,color:C.text}},s.val)
        );
      })
    ),
    plan && plan.exercises.length > 0 && h('div', { style:{ padding:'14px 16px', borderRadius:14, background:C.card, border:'1px solid '+C.border }},
      h('div', { style:{ fontSize:11, color:C.dim, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}, 'First session preview'),
      plan.exercises.slice(0,3).map(function(ex,i) {
        return h('div', { key:i, style:{
          display:'flex', alignItems:'center', gap:10, paddingBottom:8,
          borderBottom: i<2 ? '1px solid rgba(48,54,61,0.5)' : 'none', marginBottom:i<2?8:0,
        }},
          h('div', { style:{
            width:28,height:28,borderRadius:8,background:'rgba(22,163,74,0.12)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:C.accent,
          }}, i+1),
          h('div', null,
            h('div',{style:{fontSize:13,fontWeight:700,color:C.text}},ex.name),
            h('div',{style:{fontSize:11,color:C.dim}},ex.sets+'×'+ex.reps+' • '+(ex.rest_secs||30)+'s rest')
          )
        );
      }),
      plan.exercises.length > 3 && h('div',{style:{fontSize:11,color:C.dim,textAlign:'center',marginTop:6}},
        '+ '+(plan.exercises.length-3)+' more exercises'
      )
    )
  );
}

// ================================================================
// MAIN FLOW ORCHESTRATOR
// ================================================================
function FB2OnboardingFlow({ onComplete }) {
  var state = useReducer(function(d, action) {
    return Object.assign({}, d, typeof action === 'function' ? action(d) : action);
  }, {});
  var data = state[0], setData = state[1];
  var idxState = useState(0);
  var idx = idxState[0], setIdx = idxState[1];
  var planState = useState(null);
  var plan = planState[0], setPlan = planState[1];

  function next() {
    haptic();
    if (idx < FLOW.length - 1) {
      // Generate plan just before building screen
      if (FLOW[idx + 1].id === 'building' && !plan) {
        var generated = FB2.generateFB2Plan(data);
        setPlan(generated);
        FB2.savePlan2(generated);
      }
      setIdx(function(i) { return i + 1; });
    } else {
      finish();
    }
  }

  function back() {
    haptic();
    if (idx > 0) setIdx(function(i) { return i - 1; });
  }

  function finish() {
    var profile = Object.assign({}, data, { onboardedAt: new Date().toISOString() });
    FB2.saveProfile2(profile);
    if (plan) FB2.savePlan2(plan);
    try { A.fireConfetti && A.fireConfetti(); } catch(e) {}
    if (onComplete) onComplete(profile, plan);
  }

  var step = FLOW[idx];
  var progress = step.progress;
  var canBack = idx > 0 && !['welcome','building','reveal'].includes(step.id);
  var props = { data:data, setData:setData, onNext:next, onBack:canBack?back:null, progress:progress };

  var view;
  switch (step.id) {
    case 'welcome':      view = h(ScrWelcome, { onNext:next }); break;
    case 'valueprop':    view = h(ScrValueProp, props); break;
    case 'motivation':   view = h(ScrMotivation, props); break;
    case 'goal':         view = h(ScrGoal, props); break;
    case 'level':        view = h(ScrLevel, props); break;
    case 'biometrics':   view = h(ScrBiometrics, props); break;
    case 'bodyfocus':    view = h(ScrBodyFocus, props); break;
    case 'socialproof':  view = h(ScrSocialProof, props); break;
    case 'projection':   view = h(ScrProjection, { data:data, onNext:next, onBack:canBack?back:null, progress:progress }); break;
    case 'comparison':   view = h(ScrComparison, props); break;
    case 'path':         view = h(ScrPath, props); break;
    case 'schedule':     view = h(ScrSchedule, props); break;
    case 'affirmation':  view = h(ScrAffirmation, { data:data, onNext:next, onBack:back, progress:progress }); break;
    case 'expectations': view = h(ScrExpectations, props); break;
    case 'reminders':    view = h(ScrReminders, props); break;
    case 'building':     view = h(ScrBuilding, { data:data, onNext:next }); break;
    case 'reveal':       view = h(ScrReveal, { data:data, plan:plan, onNext:finish }); break;
    default:             view = h(ScrWelcome, { onNext:next });
  }

  return h('div', { key: step.id, style:{ animation:'fb2SlideIn 0.35s cubic-bezier(0.16,1,0.3,1) both' }}, view);
}

A.FB2OnboardingFlow = FB2OnboardingFlow;

// Inject CSS animations
(function() {
  if (document.getElementById('fb2-onboard-css')) return;
  var s = document.createElement('style');
  s.id = 'fb2-onboard-css';
  s.textContent = `
    @keyframes fb2FadeUp {
      from { opacity:0; transform:translateY(14px); }
      to   { opacity:1; transform:translateY(0); }
    }
    @keyframes fb2SlideIn {
      from { opacity:0; transform:translateX(20px); }
      to   { opacity:1; transform:translateX(0); }
    }
  `;
  document.head.appendChild(s);
})();

console.log('[SC] app-fitness-builder-2-onboarding ready —', FLOW.length, 'steps');
})();
