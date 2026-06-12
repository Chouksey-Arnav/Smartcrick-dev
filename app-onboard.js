// Save as: app-onboard.js
// ================================================================
// SmartCrick — Onboarding Funnel v2.0  ("Cal-AI-style" conversion flow)
// ----------------------------------------------------------------
// This is a deliberately psychology-driven onboarding funnel modelled
// on the Cal AI onboarding (the $30M/yr calorie app), adapted to
// cricket. Every screen has a job. The annotated intent is kept in
// comments so future editors understand WHY each step exists.
//
// The macro-architecture (mirrors the Cal AI FigJam breakdown):
//   ACT 1  Trust + value prop ............ make the app feel legit
//   ACT 2  Frictionless personalization .. user starts giving data (sunk cost)
//   ACT 3  Proof + vision + affirmation ... user convinces themselves
//   ACT 4  Commitment + permissions ...... lock-in + re-engagement
//   ACT 5  "Building your plan" + reveal .. show complexity, deliver value
//   ACT 6  Lock progress (account) ....... commitment device
//   ACT 7  Hard paywall -> spin -> discount the obvious final step
//
// By the time the paywall appears, the user has: entered lots of data
// (sunk cost), seen social proof (trust), visualised success (desire),
// been affirmed (belief), and received a "custom plan" (ownership).
// The paywall is framed not as a cost but as the unlock of the plan
// they already built.
//
// NOTE: SmartCrick has no payment backend, so this is a SOFT paywall.
// "Start free trial" / "Unlock" simulates activation (persists
// user.pro). "Maybe later" still lets the user into the app for free.
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { DB, nav, awardXP } = A;

// ── Palette ───────────────────────────────────────────────────────
var C = {
  bg:      '#0d1117',
  card:    'rgba(22,27,34,0.9)',
  border:  'rgba(48,54,61,0.9)',
  green:   '#16a34a',
  green2:  '#34d399',
  greenLt: '#4ade80',
  text:    '#f0fdf4',
  sub:     '#8b949e',
  dim:     '#6b7280',
  faint:   '#484f58',
  gold:    '#f59e0b',
  blue:    '#3b82f6',
};

// ================================================================
// SHARED ANIMATION + LAYOUT PRIMITIVES
// ================================================================

// StaggerChildren — fade-up each child with staggered delay
function StaggerChildren({ children, baseDelay }) {
  return h(Fragment, null,
    React.Children.map(children, function (child, i) {
      if (!child) return null;
      return h('div', {
        key: i,
        className: 'em-stagger-child',
        style: { animationDelay: ((baseDelay || 0) + i * 55) + 'ms', animationFillMode: 'both' },
      }, child);
    })
  );
}

// Top progress bar — fills toward "done" so the user feels nearly
// finished by the time the plan is built (completion bias before paywall).
function TopProgress({ value }) {
  return h('div', {
    role: 'progressbar', 'aria-valuenow': Math.round(value * 100), 'aria-valuemin': 0, 'aria-valuemax': 100,
    style: { height: 5, borderRadius: 99, background: 'rgba(48,54,61,0.7)', overflow: 'hidden', flex: 1 },
  },
    h('div', { style: {
      height: '100%', width: Math.max(4, value * 100) + '%', borderRadius: 99,
      background: 'linear-gradient(90deg,#16a34a,#34d399)',
      transition: 'width 0.5s cubic-bezier(0.16,1,0.3,1)',
    }})
  );
}

// OnboardShell — header (back + progress) / scrollable body / sticky CTA.
function OnboardShell({ onNext, onBack, nextLabel, nextDisabled, progress, showProgress, children, footerNote }) {
  return h('div', {
    style: {
      minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column',
      padding: 'env(safe-area-inset-top, 12px) 0 env(safe-area-inset-bottom, 20px)',
      maxWidth: 480, margin: '0 auto', width: '100%',
    }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 4px' }},
      onBack
        ? h('button', {
            onClick: onBack, 'aria-label': 'Go back',
            style: {
              background: 'transparent', border: 'none', cursor: 'pointer', color: C.sub,
              fontSize: 22, lineHeight: 1, padding: 4, fontFamily: 'inherit',
              minWidth: 32, minHeight: 32, flexShrink: 0,
            }
          }, '‹')
        : h('div', { 'aria-hidden': 'true', style: { display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }},
            h('div', { style: { width: 24, height: 24, borderRadius: 7, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}, '🏏'),
            h('span', { style: { fontSize: 13, fontWeight: 800, color: C.green, letterSpacing: '-0.01em' }}, 'SmartCrick')
          ),
      showProgress !== false && h(TopProgress, { value: progress || 0 })
    ),
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }},
      h(StaggerChildren, { baseDelay: 40 }, children)
    ),
    onNext && h('div', { style: { padding: '12px 20px 0' }},
      A.SpringBtn
        ? h(A.SpringBtn, {
            label: nextLabel || 'Continue',
            onClick: nextDisabled ? undefined : onNext,
            disabled: !!nextDisabled,
            style: {
              width: '100%', padding: '16px', borderRadius: 14,
              fontSize: 16, fontWeight: 800, fontFamily: 'inherit', minHeight: 54,
              background: nextDisabled ? 'rgba(48,54,61,0.5)' : C.green,
              color: nextDisabled ? '#374151' : '#fff',
              boxShadow: nextDisabled ? 'none' : '0 6px 24px rgba(22,163,74,0.4)',
              cursor: nextDisabled ? 'not-allowed' : 'pointer', border: 'none',
            },
          })
        : h('button', {
            onClick: onNext, disabled: !!nextDisabled,
            style: {
              width: '100%', padding: '16px', border: 'none', borderRadius: 14,
              fontSize: 16, fontWeight: 800, fontFamily: 'inherit', minHeight: 54,
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              background: nextDisabled ? 'rgba(48,54,61,0.5)' : C.green,
              color: nextDisabled ? '#374151' : '#fff',
              boxShadow: nextDisabled ? 'none' : '0 6px 24px rgba(22,163,74,0.4)',
            },
          }, nextLabel || 'Continue'),
      footerNote && h('p', { style: { fontSize: 11, color: C.faint, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }}, footerNote)
    )
  );
}

// Heading + subtext block used at the top of question screens.
function QHead({ title, sub }) {
  return h('div', { style: { marginBottom: 22 }},
    h('h2', { style: { fontSize: '1.55rem', fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.02em' }}, title),
    sub && h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.6 }}, sub)
  );
}

// Single-select list — vertical rows with emoji + label + sublabel.
function SelectList({ options, value, onChange, columns }) {
  return h('div', { role: 'radiogroup', style: columns
    ? { display: 'grid', gridTemplateColumns: 'repeat(' + columns + ', 1fr)', gap: 9 }
    : { display: 'flex', flexDirection: 'column', gap: 9 }},
    options.map(function (o) {
      var sel = value === o.id;
      return h('button', {
        key: o.id, role: 'radio', 'aria-checked': sel ? 'true' : 'false', 'aria-label': o.label,
        onClick: function () { haptic(); onChange(o.id); },
        style: {
          display: 'flex', alignItems: 'center', gap: 13, width: '100%',
          padding: '15px 16px', borderRadius: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          background: sel ? 'rgba(22,163,74,0.12)' : C.card,
          border: '2px solid ' + (sel ? C.green : C.border),
          boxShadow: sel ? '0 0 0 3px rgba(22,163,74,0.16)' : 'none',
          transition: 'all 0.15s', minHeight: 56, outline: 'none',
        },
      },
        o.emoji && h('span', { 'aria-hidden': 'true', style: { fontSize: 22, lineHeight: 1, flexShrink: 0 }}, o.emoji),
        h('div', { style: { flex: 1 }},
          h('div', { style: { fontSize: 14.5, fontWeight: 700, color: sel ? C.text : C.sub }}, o.label),
          o.sub && h('div', { style: { fontSize: 12, color: C.faint, marginTop: 2 }}, o.sub)
        ),
        h('div', { 'aria-hidden': 'true', style: {
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: '2px solid ' + (sel ? C.green : 'rgba(75,85,99,0.5)'),
          background: sel ? C.green : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}, sel && h('div', { style: { width: 8, height: 8, borderRadius: '50%', background: '#fff' }}))
      );
    })
  );
}

// Multi-select grid — choose up to `max`.
function MultiSelect({ options, values, onChange, max }) {
  function toggle(id) {
    haptic();
    var has = values.indexOf(id) !== -1;
    if (has) onChange(values.filter(function (v) { return v !== id; }));
    else if (!max || values.length < max) onChange(values.concat([id]));
  }
  return h('div', { style: { display: 'flex', flexDirection: 'column', gap: 9 }},
    options.map(function (o) {
      var sel = values.indexOf(o.id) !== -1;
      return h('button', {
        key: o.id, 'aria-pressed': sel ? 'true' : 'false', 'aria-label': o.label,
        onClick: function () { toggle(o.id); },
        style: {
          display: 'flex', alignItems: 'center', gap: 13, width: '100%',
          padding: '14px 16px', borderRadius: 13, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
          background: sel ? 'rgba(22,163,74,0.12)' : C.card,
          border: '2px solid ' + (sel ? C.green : C.border),
          transition: 'all 0.15s', minHeight: 52, outline: 'none',
        },
      },
        o.emoji && h('span', { 'aria-hidden': 'true', style: { fontSize: 20, lineHeight: 1, flexShrink: 0 }}, o.emoji),
        h('span', { style: { flex: 1, fontSize: 14, fontWeight: 700, color: sel ? C.text : C.sub }}, o.label),
        h('div', { 'aria-hidden': 'true', style: {
          width: 22, height: 22, borderRadius: 7, flexShrink: 0,
          border: '2px solid ' + (sel ? C.green : 'rgba(75,85,99,0.5)'),
          background: sel ? C.green : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', fontWeight: 900,
        }}, sel && '✓')
      );
    })
  );
}

// Segmented control (3-up).
function Segmented({ options, value, onChange }) {
  return h('div', { style: { display: 'flex', gap: 8 }},
    options.map(function (o) {
      var sel = value === o.id;
      return h('button', {
        key: o.id, 'aria-pressed': sel ? 'true' : 'false',
        onClick: function () { haptic(); onChange(o.id); },
        style: {
          flex: 1, padding: '14px 6px', borderRadius: 12, cursor: 'pointer', fontFamily: 'inherit',
          background: sel ? 'rgba(22,163,74,0.14)' : C.card,
          border: '2px solid ' + (sel ? C.green : C.border),
          transition: 'all 0.15s', outline: 'none', textAlign: 'center',
        },
      },
        o.emoji && h('div', { 'aria-hidden': 'true', style: { fontSize: 22, marginBottom: 4 }}, o.emoji),
        h('div', { style: { fontSize: 13.5, fontWeight: 800, color: sel ? C.greenLt : C.dim }}, o.label),
        o.sub && h('div', { style: { fontSize: 10.5, color: C.faint, marginTop: 2 }}, o.sub)
      );
    })
  );
}

// Skill slider row (1–5).
function SkillSlider({ label, emoji, value, onChange }) {
  var labels = ['Beginner', 'Developing', 'Solid', 'Strong', 'Elite'];
  return h('div', { style: { marginBottom: 18 }},
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }},
      h('span', { style: { fontSize: 14, fontWeight: 700, color: C.text }},
        h('span', { 'aria-hidden': 'true', style: { marginRight: 7 }}, emoji), label),
      h('span', { style: { fontSize: 12, fontWeight: 700, color: C.greenLt }}, labels[value - 1])
    ),
    h('input', {
      type: 'range', min: 1, max: 5, step: 1, value: value,
      'aria-label': label + ' skill level',
      onChange: function (e) { haptic(); onChange(parseInt(e.target.value, 10)); },
      style: { width: '100%', accentColor: C.green, height: 28, cursor: 'pointer' },
    })
  );
}

// Cinematic animated growth curve — draws itself in, glows, pops milestones.
// withYou: show dashed "on your own" comparison line that draws in first.
// withMilestones: show Week 4 / Week 8 / Week 12 dot pop-ins.
// sparkleRef: optional ref; if provided, fires sparkle at graph endpoint after draw.
function CinematicGrowthCurve({ color, w, height, withYou, withMilestones, sparkleRef }) {
  var endpointRef = useRef(null);
  w = w || 300; height = height || 130;
  var you  = [ [0, 0.18], [0.25, 0.34], [0.5, 0.55], [0.75, 0.8], [1, 0.97] ];
  var solo = [ [0, 0.18], [0.25, 0.26], [0.5, 0.36], [0.75, 0.45], [1, 0.55] ];
  function pts(arr) {
    return arr.map(function(p, i) {
      var x = p[0] * w, y = height - p[1] * (height - 14) - 5;
      return (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
    }).join(' ');
  }
  var endX = w, endY = height - you[4][1] * (height - 14) - 5;
  // Milestone dot positions (at ~33%, ~67%, 100% of x)
  var m1x = w * 0.33, m1y = height - you[1][1] * (height - 14) - 5;
  var m2x = w * 0.67, m2y = height - you[3][1] * (height - 14) - 5;
  var fillPath = pts(you) + ' L' + w.toFixed(1) + ' ' + height + ' L0 ' + height + ' Z';
  var gradId = 'cgFill_' + Math.round(w);

  useEffect(function() {
    if (!withMilestones) return;
    // Sparkle at graph endpoint after green line finishes drawing (0.4s delay + 1.8s draw = 2.2s)
    var t = setTimeout(function() {
      var el = endpointRef.current || (sparkleRef && sparkleRef.current);
      if (el && A.Emotion && A.Emotion.fireSparkleSVG) A.Emotion.fireSparkleSVG(el);
    }, 2600);
    return function() { clearTimeout(t); };
  }, []);

  return h('div', { style: { position: 'relative' } },
    h('svg', { width: '100%', viewBox: '0 0 ' + w + ' ' + height, style: { display: 'block', overflow: 'visible' }, 'aria-hidden': 'true' },
      h('defs', null,
        h('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' },
          h('stop', { offset: '0%',   stopColor: color, stopOpacity: 0.45 }),
          h('stop', { offset: '100%', stopColor: color, stopOpacity: 0 })
        ),
        h('filter', { id: 'lineGlow' },
          h('feGaussianBlur', { stdDeviation: '2.5', result: 'blur' }),
          h('feMerge', null,
            h('feMergeNode', { in: 'blur' }),
            h('feMergeNode', { in: 'SourceGraphic' })
          )
        )
      ),
      // Filled area — fades in after line draws
      h('path', { d: fillPath, fill: 'url(#' + gradId + ')', className: 'sc-fade-fill' }),
      // Comparison "on your own" line — draws first if withYou
      withYou && h('path', {
        d: pts(solo), fill: 'none',
        stroke: 'rgba(139,148,158,0.45)', strokeWidth: 2, strokeLinecap: 'round',
        pathLength: '1', className: 'sc-draw-line-solo',
      }),
      // Main SmartCrick line — animated draw with glow
      h('path', {
        d: pts(you), fill: 'none',
        stroke: color, strokeWidth: 3.5, strokeLinecap: 'round',
        filter: 'url(#lineGlow)',
        pathLength: '1',
        className: withYou ? 'sc-draw-line-green' : 'sc-draw-line-gray',
        style: { animationDuration: withYou ? '1.8s' : '1.6s' },
      }),
      // Milestone dots
      withMilestones && h('circle', { cx: m1x.toFixed(1), cy: m1y.toFixed(1), r: 5, fill: color, className: 'sc-pop-dot-1' }),
      withMilestones && h('circle', { cx: m2x.toFixed(1), cy: m2y.toFixed(1), r: 5, fill: color, className: 'sc-pop-dot-2' }),
      // Endpoint glow dot
      h('circle', {
        ref: endpointRef,
        cx: endX.toFixed(1), cy: endY.toFixed(1), r: 6, fill: color,
        className: withMilestones ? 'sc-pop-dot-3' : '',
        style: withMilestones ? {} : { filter: 'drop-shadow(0 0 6px ' + color + ')' },
      })
    ),
    // Milestone label chips
    withMilestones && h('div', { style: { display: 'flex', justifyContent: 'space-around', marginTop: 6 } },
      [
        { label: 'Week 4: First breakthrough', delay: '1.5s' },
        { label: 'Week 8: Match form',          delay: '2.0s' },
        { label: 'Week 12: Selected ✓',          delay: '2.5s' },
      ].map(function(chip, i) {
        return h('span', {
          key: i,
          className: 'sc-milestone-chip',
          style: {
            fontSize: 9.5, fontWeight: 700, color: color,
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)',
            borderRadius: 99, padding: '2px 7px', animationDelay: chip.delay,
          }
        }, chip.label);
      })
    )
  );
}

// Animated number counter — counts from `from` to `to` on mount.
function AnimatedCounter({ from, to, duration, style }) {
  var _from = from || 0, _to = to || 0, _dur = duration || 1500;
  var val = useState(_from);
  var setVal = val[1];
  useEffect(function() {
    if (_from === _to) return;
    var start = null, raf;
    function tick(ts) {
      if (!start) start = ts;
      var t = Math.min(1, (ts - start) / _dur);
      var eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
      setVal(Math.round(_from + (_to - _from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return function() { cancelAnimationFrame(raf); };
  }, [_from, _to]);
  return h('span', { style: style }, val[0]);
}

// Typed haptic helper — delegates to A.Emotion.haptic when available.
function haptic(type) {
  try {
    if (A.Emotion && A.Emotion.haptic) { A.Emotion.haptic(type || 'light'); return; }
    if (navigator.vibrate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) navigator.vibrate(6);
  } catch (e) {}
}

// ================================================================
// OPTION DATA
// ================================================================
var AGE_GROUPS = [
  { id: 'u13', label: 'Under 13', emoji: '🌱' },
  { id: 'u15', label: 'Under 15', emoji: '⚡' },
  { id: 'u17', label: 'Under 17', emoji: '🔥' },
  { id: 'u19', label: 'Under 19', emoji: '⭐' },
  { id: 'senior', label: 'Senior (19+)', emoji: '🏆' },
];
var ROLES = [
  { id: 'batsman', emoji: '🏏', label: 'Batter', sub: 'I live to score runs' },
  { id: 'bowler', emoji: '🎯', label: 'Bowler', sub: 'I take wickets' },
  { id: 'allrounder', emoji: '⭐', label: 'All-Rounder', sub: 'Bat and bowl' },
  { id: 'wicketkeeper', emoji: '🧤', label: 'Wicket-Keeper', sub: 'Behind the stumps' },
];
var LEVELS = [
  { id: 'school', label: 'School cricket', sub: 'Just starting out' },
  { id: 'club', label: 'Club cricket', sub: 'Regular competition' },
  { id: 'district', label: 'District / County', sub: 'Representative level' },
  { id: 'state', label: 'State / Academy', sub: 'High-performance' },
];
var GOALS = [
  { id: 'team', emoji: '🏟️', label: 'Make the team', sub: 'Lock down my spot in the XI' },
  { id: 'average', emoji: '📈', label: 'Score more runs', sub: 'Raise my average & strike rate' },
  { id: 'wickets', emoji: '🎯', label: 'Take more wickets', sub: 'Become a match-winner with the ball' },
  { id: 'district', emoji: '⭐', label: 'Get selected up a level', sub: 'District / rep cricket' },
  { id: 'state', emoji: '🏆', label: 'State / academy squad', sub: 'High-performance pathway' },
  { id: 'pro', emoji: '💎', label: 'Go professional', sub: 'Cricket as a career' },
];

// ================================================================
// ACT 1 — TRUST + VALUE PROP
// ================================================================

// Screen 1 — Welcome. PURPOSE: start trust (premium feel) + show the
// core benefit BEFORE any questions. Hook toward the journey.
function ScrWelcome({ onNext }) {
  function start() { if (A.Emotion && A.Emotion.cheerMascot) A.Emotion.cheerMascot(); onNext(); }
  return h('div', {
    style: {
      minHeight: '100dvh', background: 'radial-gradient(120% 80% at 50% -10%, rgba(22,163,74,0.18), #0d1117 55%)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: 'calc(env(safe-area-inset-top,24px) + 32px) 24px calc(env(safe-area-inset-bottom,24px) + 24px)',
      maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box',
    }
  },
    h(StaggerChildren, { baseDelay: 60 },
      h('div', { style: { textAlign: 'center', paddingTop: 24 }},
        h('div', { 'aria-hidden': 'true', style: { margin: '0 auto 28px', display: 'flex', justifyContent: 'center' }},
          A.Mascot ? h(A.Mascot, { size: 'lg' })
            : h('div', { style: { width: 92, height: 92, borderRadius: 24, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 12px 40px rgba(22,163,74,0.45)', fontSize: 44 }}, '🏏')
        ),
        h('h1', { style: { fontSize: '2.05rem', fontWeight: 900, color: C.text, marginBottom: 14, letterSpacing: '-0.03em', lineHeight: 1.12 }},
          'Train like a pro.', h('br'), h('span', { style: { color: C.greenLt }}, 'Get picked.')),
        h('p', { style: { fontSize: 15.5, color: C.sub, lineHeight: 1.7, maxWidth: 330, margin: '0 auto' }},
          'SmartCrick builds you a personalised cricket plan — technique, fitness and mindset — so you improve faster than training on your own.')
      )
    ),
    h('div', null,
      // Social-proof micro-strip up front to seed credibility.
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 18 }},
        h('span', { 'aria-hidden': 'true', style: { color: C.gold, fontSize: 15, letterSpacing: 1 }}, '★★★★★'),
        h('span', { style: { fontSize: 12.5, color: C.dim, fontWeight: 600 }}, '4.9 · trusted by 50,000+ cricketers')
      ),
      A.SpringBtn
        ? h(A.SpringBtn, { label: 'Build my plan  →', onClick: start, style: { width: '100%', padding: '17px', borderRadius: 14, fontSize: 16.5, fontWeight: 800, fontFamily: 'inherit', minHeight: 56, background: C.green, color: '#fff', boxShadow: '0 8px 28px rgba(22,163,74,0.45)', border: 'none' }})
        : h('button', { onClick: start, style: { width: '100%', padding: '17px', border: 'none', borderRadius: 14, fontSize: 16.5, fontWeight: 800, fontFamily: 'inherit', minHeight: 56, background: C.green, color: '#fff', cursor: 'pointer', boxShadow: '0 8px 28px rgba(22,163,74,0.45)' }}, 'Build my plan  →'),
      h('p', { style: { fontSize: 11.5, color: C.faint, textAlign: 'center', marginTop: 12 }}, 'Takes about 2 minutes · free to start')
    )
  );
}

// ================================================================
// GENERIC QUESTION SCREEN (data-driven, keeps file compact)
// ================================================================
function QuestionScreen(props) {
  var s = props.spec, data = props.data, setData = props.setData;
  var val = data[s.field];
  function set(v) { setData(function (d) { var n = Object.assign({}, d); n[s.field] = v; return n; }); }

  var body;
  if (s.kind === 'single') body = h(SelectList, { options: s.options, value: val, onChange: set, columns: s.columns });
  else if (s.kind === 'multi') body = h(MultiSelect, { options: s.options, values: val || [], onChange: set, max: s.max });
  else if (s.kind === 'segment') body = h(Segmented, { options: s.options, value: val, onChange: set });

  var canProceed = s.optional ? true
    : s.kind === 'multi' ? (val && val.length > 0)
    : !!val;

  return h(OnboardShell, {
    onNext: props.onNext, onBack: props.onBack, progress: props.progress,
    nextLabel: s.cta || 'Continue', nextDisabled: !canProceed,
  },
    h(QHead, { title: typeof s.title === 'function' ? s.title(data) : s.title, sub: s.sub }),
    s.note && h('p', { style: { fontSize: 12, color: C.faint, marginBottom: 14, marginTop: -8 }}, s.note),
    body
  );
}

// ── Bespoke: Name (low-friction text). ───────────────────────────
function ScrName({ data, setData, onNext, onBack, progress }) {
  var name = data.name || '';
  var ok = name.trim().length >= 2;
  return h(OnboardShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: 'Continue', nextDisabled: !ok },
    h(QHead, { title: 'First, what should we call you?', sub: 'Your plan, your name on it. You can change this any time.' }),
    h('input', {
      type: 'text', value: name, placeholder: 'e.g. Arnav', autoComplete: 'given-name', maxLength: 24,
      'aria-label': 'Your first name',
      onChange: function (e) { setData(function (d) { return Object.assign({}, d, { name: e.target.value }); }); },
      style: {
        width: '100%', padding: '16px', borderRadius: 14, fontSize: 18, outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box', background: C.card, color: C.text, fontWeight: 600,
        border: '2px solid ' + (ok ? C.green : C.border), transition: 'border-color 0.15s',
      },
      onFocus: function (e) { e.target.style.borderColor = C.green; },
      onBlur: function (e) { if (!ok) e.target.style.borderColor = C.border; },
    })
  );
}

// ── Bespoke: self-rated skill baseline. ──────────────────────────
// PURPOSE: collect baseline data the "custom plan" is built on, while
// making the user invest effort (sunk cost) and believe the plan will
// be accurate. This is the cricket analogue of Cal AI's height/weight.
function ScrSkills({ data, setData, onNext, onBack, progress }) {
  var skills = data.skills || { batting: 3, bowling: 3, fielding: 3, fitness: 3, mental: 3 };
  function setSkill(k, v) { setData(function (d) { var sk = Object.assign({}, d.skills || skills); sk[k] = v; return Object.assign({}, d, { skills: sk }); }); }
  return h(OnboardShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: 'Continue' },
    h(QHead, { title: 'Rate yourself honestly', sub: "There are no wrong answers — this is the baseline we'll measure your progress against." }),
    h(SkillSlider, { label: 'Batting', emoji: '🏏', value: skills.batting, onChange: function (v) { setSkill('batting', v); }}),
    h(SkillSlider, { label: 'Bowling', emoji: '🎯', value: skills.bowling, onChange: function (v) { setSkill('bowling', v); }}),
    h(SkillSlider, { label: 'Fielding', emoji: '🧤', value: skills.fielding, onChange: function (v) { setSkill('fielding', v); }}),
    h(SkillSlider, { label: 'Fitness', emoji: '💪', value: skills.fitness, onChange: function (v) { setSkill('fitness', v); }}),
    h(SkillSlider, { label: 'Mental game', emoji: '🧠', value: skills.mental, onChange: function (v) { setSkill('mental', v); }})
  );
}

// ── Bespoke: referral code (optional, viral loop). ───────────────
function ScrReferral({ data, setData, onNext, onBack, progress }) {
  return h(OnboardShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: (data.referral && data.referral.trim()) ? 'Apply code' : 'Skip for now' },
    h(QHead, { title: 'Got a referral code?', sub: 'If a coach or teammate invited you, drop their code in. No code? Just skip.' }),
    h('input', {
      type: 'text', value: data.referral || '', placeholder: 'Enter code (optional)', maxLength: 16,
      'aria-label': 'Referral code',
      onChange: function (e) { setData(function (d) { return Object.assign({}, d, { referral: e.target.value.toUpperCase() }); }); },
      style: {
        width: '100%', padding: '16px', borderRadius: 14, fontSize: 17, outline: 'none', letterSpacing: '0.12em',
        fontFamily: 'inherit', boxSizing: 'border-box', background: C.card, color: C.text, fontWeight: 700, textAlign: 'center',
        border: '2px solid ' + ((data.referral || '').trim() ? C.green : C.border),
      },
    })
  );
}

// ================================================================
// INFO / PROOF / AFFIRMATION SCREENS  (no input — just "Continue")
// ================================================================

function InfoShell({ onNext, onBack, progress, nextLabel, children, showProgress }) {
  return h(OnboardShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: nextLabel || 'Continue', showProgress: showProgress },
    children);
}

// Screen — Social proof graph. PURPOSE: lower doubt, "this works".
function ScrProof1({ onNext, onBack, progress }) {
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress },
    h(QHead, { title: 'SmartCrick creates long-term results' }),
    h('div', { style: { padding: 18, borderRadius: 16, background: C.card, border: '1px solid ' + C.border, marginBottom: 18 }},
      h(CinematicGrowthCurve, { color: C.green2, withMilestones: true }),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.faint, marginTop: 8 }},
        h('span', null, 'Week 1'), h('span', null, 'Week 6'), h('span', null, 'Week 12'))
    ),
    h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.7 }},
      'Cricketers who follow a structured SmartCrick plan keep improving long after the motivation of a single good session fades. Consistency compounds — and we build the consistency for you.')
  );
}

// Screen — affirmation, personalised. PURPOSE: "you can do it" — boosts
// confidence, reduces drop-off, primes value of the plan.
function ScrAffirm({ data, onNext, onBack, progress }) {
  var goal = (GOALS.find(function (g) { return g.id === data.goal; }) || {}).label || 'your goal';
  var name = (data.name || '').trim();
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: "Let's do it" },
    h('div', { style: { textAlign: 'center', paddingTop: 8 }},
      h('div', { 'aria-hidden': 'true', style: { fontSize: 52, marginBottom: 18 }}, '🔥'),
      h('h2', { style: { fontSize: '1.6rem', fontWeight: 900, color: C.text, marginBottom: 14, lineHeight: 1.25, letterSpacing: '-0.02em' }},
        (name ? name + ', ' : '') + '“' + goal + '” is absolutely realistic for you.'),
      h('p', { style: { fontSize: 15, color: C.sub, lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }},
        'Players at your level reach this goal all the time — the ones who get there simply train smart and stay consistent. That is exactly what your plan is built to do.')
    )
  );
}

// Screen — strong proof, 2x. PURPOSE: reframe price vs benefit.
function ScrProof2({ onNext, onBack, progress }) {
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress },
    h(QHead, { title: 'Improve up to 2× faster than training alone' }),
    h('div', { style: { padding: 18, borderRadius: 16, background: C.card, border: '1px solid ' + C.border, marginBottom: 18 }},
      h(CinematicGrowthCurve, { color: C.green2, withYou: true }),
      h('div', { style: { display: 'flex', gap: 16, justifyContent: 'center', marginTop: 14 }},
        h('span', { style: { fontSize: 12, color: C.greenLt, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }},
          h('span', { 'aria-hidden': 'true', style: { width: 16, height: 3, background: C.greenLt, borderRadius: 2, display: 'inline-block' } }),
          'With SmartCrick'),
        h('span', { style: { fontSize: 12, color: C.dim, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }},
          h('span', { 'aria-hidden': 'true', style: { width: 16, height: 2, background: C.dim, borderRadius: 2, display: 'inline-block', opacity: 0.6 } }),
          'On your own')
      )
    ),
    h('div', { style: { padding: '12px 14px', borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', marginBottom: 14 }},
      h('div', { style: { fontSize: 13, fontWeight: 800, color: C.greenLt, marginBottom: 4 }}, '📊 The data is clear'),
      h('p', { style: { fontSize: 13.5, color: C.sub, lineHeight: 1.6, margin: 0 }},
        'Structured SmartCrick players see ', h('strong', { style: { color: C.text }}, '2× the improvement'), ' vs. self-coached training in the same 12-week window.')
    ),
    h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.7 }},
      'Most players plateau because they repeat what they are already good at. SmartCrick targets the exact gaps holding you back — so every session moves the needle.')
  );
}

// Screen — honesty. PURPOSE: set expectations (slow first week), reduce
// refunds/early churn, build long-term trust before the paywall.
function ScrHonesty({ data, onNext, onBack, progress }) {
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: 'I understand' },
    h(QHead, { title: 'Real talk: week one builds the base' }),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 }},
      [
        { n: '1', t: 'Week 1–2', d: 'We groove your fundamentals. Gains feel small — this is the foundation everything else stands on.' },
        { n: '3', t: 'Week 3–6', d: 'Things click. Your technique sharpens and the numbers start to move.' },
        { n: '7', t: 'Week 7+', d: 'Compounding results. This is where teammates and coaches start to notice.' },
      ].map(function (r, i) {
        return h('div', { key: i, style: { display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 13, background: C.card, border: '1px solid ' + C.border }},
          h('div', { style: { width: 34, height: 34, borderRadius: 10, background: 'rgba(22,163,74,0.15)', color: C.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0 }}, 'W' + r.n),
          h('div', null,
            h('div', { style: { fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 2 }}, r.t),
            h('div', { style: { fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}, r.d)
          )
        );
      })
    ),
    h('p', { style: { fontSize: 13, color: C.faint, lineHeight: 1.6, marginTop: 16, textAlign: 'center' }},
      'Stick with it. The players who win are the ones who trust the process.')
  );
}

// Screen — "Smart Tracking" explainer (Cal-AI Figma #21 analog).
// PURPOSE: explains how Crick auto-tracks sessions/XP and adapts the
// plan, so the user understands why the app feels personalized — and
// so the daily Crick check-in habit doesn't feel confusing later.
function ScrSmartTracking({ onNext, onBack, progress }) {
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: 'Got it' },
    h(QHead, { title: 'Crick tracks your progress automatically', sub: 'Every drill, workout and mental session feeds your plan.' }),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 }},
      [
        { e: '📊', t: 'Auto-logged sessions', d: 'Every drill, workout and mental session you complete is recorded — no manual logging.' },
        { e: '🧠', t: 'Plan adapts to you', d: 'Crick adjusts your weekly plan based on what you\'ve done and what you\'ve missed.' },
        { e: '🏏', t: 'Daily Crick check-ins', d: 'Crick checks in each day with a tip, a nudge, or a reward — keeping you on track without nagging.' },
      ].map(function (r, i) {
        return h('div', { key: i, style: { display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 13, background: C.card, border: '1px solid ' + C.border, alignItems: 'center' }},
          h('span', { 'aria-hidden': 'true', style: { fontSize: 24, flexShrink: 0 }}, r.e),
          h('div', null,
            h('div', { style: { fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 2 }}, r.t),
            h('div', { style: { fontSize: 12.5, color: C.sub, lineHeight: 1.6 }}, r.d)
          )
        );
      })
    ),
    h('p', { style: { fontSize: 13, color: C.faint, lineHeight: 1.6, marginTop: 16, textAlign: 'center' }},
      'The more you use SmartCrick, the smarter your plan gets.')
  );
}

// Screen — notifications. PURPOSE: framed as a benefit ("reach your
// goals"), drives daily re-engagement (retention).
function ScrNotify({ data, setData, onNext, onBack, progress }) {
  function enable() {
    setData(function (d) { return Object.assign({}, d, { notifications: true }); });
    try { if ('Notification' in window && Notification.requestPermission) Notification.requestPermission(); } catch (e) {}
    onNext();
  }
  function skip() { setData(function (d) { return Object.assign({}, d, { notifications: false }); }); onNext(); }
  return h('div', { style: { minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', padding: 'env(safe-area-inset-top,12px) 0 env(safe-area-inset-bottom,20px)' }},
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px 4px' }},
      h('button', { onClick: onBack, 'aria-label': 'Go back', style: { background: 'transparent', border: 'none', cursor: 'pointer', color: C.sub, fontSize: 22, padding: 4, fontFamily: 'inherit' }}, '‹'),
      h(TopProgress, { value: progress })
    ),
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '20px 20px 8px', textAlign: 'center' }},
      h('div', { 'aria-hidden': 'true', style: { fontSize: 50, marginTop: 12, marginBottom: 16 }}, '🔔'),
      h('h2', { style: { fontSize: '1.55rem', fontWeight: 900, color: C.text, marginBottom: 10, lineHeight: 1.2 }}, 'Reach your goals 3× more often'),
      h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.7, maxWidth: 330, margin: '0 auto 18px' }},
        'A gentle nudge on training days keeps your streak alive. Players with reminders on are far more likely to hit their goals.'),
      h('div', { style: { padding: 14, borderRadius: 13, background: C.card, border: '1px solid ' + C.border, textAlign: 'left', maxWidth: 340, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'center' }},
        h('span', { 'aria-hidden': 'true', style: { fontSize: 22 }}, '🏏'),
        h('div', null,
          h('div', { style: { fontSize: 13, fontWeight: 800, color: C.text }}, 'SmartCrick'),
          h('div', { style: { fontSize: 12, color: C.sub, marginTop: 1 }}, "Today's session is ready — 12 mins to a sharper cover drive.")
        )
      )
    ),
    h('div', { style: { padding: '12px 20px 0' }},
      h('button', { onClick: enable, style: { width: '100%', padding: '16px', border: 'none', borderRadius: 14, fontSize: 16, fontWeight: 800, fontFamily: 'inherit', minHeight: 54, background: C.green, color: '#fff', cursor: 'pointer', boxShadow: '0 6px 24px rgba(22,163,74,0.4)' }}, 'Keep me on track'),
      h('button', { onClick: skip, style: { width: '100%', padding: '12px', marginTop: 8, border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, fontFamily: 'inherit', background: 'transparent', color: C.dim, cursor: 'pointer' }}, 'Not now')
    )
  );
}

// Screen — reviews / social proof wall. PURPOSE: 4.9★ trust + ASO.
function ScrReviews({ onNext, onBack, progress }) {
  var reviews = [
    { n: 'Rohan, U17', t: 'Made the district squad after 9 weeks. The plan told me exactly what to fix.', s: 5 },
    { n: 'Aisha, club opener', t: 'My average has never been higher. The mental sessions are a cheat code.', s: 5 },
    { n: 'Coach Dev', t: 'I recommend it to every kid I train. Structured, smart, actually fun.', s: 5 },
  ];
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: 'Continue' },
    h('div', { style: { textAlign: 'center', marginBottom: 18 }},
      h('div', { style: { fontSize: '2.6rem', fontWeight: 900, color: C.text, lineHeight: 1 }}, '4.9'),
      h('div', { 'aria-hidden': 'true', style: { color: C.gold, fontSize: 18, letterSpacing: 2, margin: '6px 0' }}, '★★★★★'),
      h('div', { style: { fontSize: 13, color: C.dim, fontWeight: 600 }}, 'from 12,400+ cricketers')
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 }},
      reviews.map(function (r, i) {
        return h('div', { key: i, style: { padding: '14px 16px', borderRadius: 13, background: C.card, border: '1px solid ' + C.border }},
          h('div', { 'aria-hidden': 'true', style: { color: C.gold, fontSize: 12, letterSpacing: 1, marginBottom: 6 }}, '★★★★★'),
          h('p', { style: { fontSize: 13.5, color: C.text, lineHeight: 1.6, marginBottom: 6 }}, '“' + r.t + '”'),
          h('div', { style: { fontSize: 12, color: C.dim, fontWeight: 700 }}, r.n)
        );
      })
    )
  );
}

// Screen — appreciation. PURPOSE: warmth + safety before commitment.
function ScrThanks({ data, onNext, onBack, progress }) {
  var name = (data.name || '').trim();
  return h(InfoShell, { onNext: onNext, onBack: onBack, progress: progress, nextLabel: 'Build my plan  →' },
    h('div', { style: { textAlign: 'center', paddingTop: 24 }},
      h('div', { 'aria-hidden': 'true', style: { margin: '0 auto 22px', display: 'flex', justifyContent: 'center' }},
        A.Mascot ? h(A.Mascot, { size: 'lg' }) : h('div', { style: { fontSize: 54 }}, '🙏')),
      h('h2', { style: { fontSize: '1.6rem', fontWeight: 900, color: C.text, marginBottom: 12, lineHeight: 1.25 }},
        'Thank you for trusting us' + (name ? ', ' + name : '')),
      h('p', { style: { fontSize: 15, color: C.sub, lineHeight: 1.75, maxWidth: 330, margin: '0 auto' }},
        "We now know exactly where you are and where you want to go. Let's turn that into a plan that's built around you — and nobody else.")
    )
  );
}

// ================================================================
// ACT 5 — "BUILDING YOUR PLAN" + REVEAL
// ================================================================

// Screen — building loader. PURPOSE: show complexity ("serious tech"),
// build anticipation, manufacture the feeling that real work is being
// done FOR the user. Auto-advances when complete.
function ScrBuilding({ onNext }) {
  var [pct, setPct] = useState(0);
  var steps = [
    'Analysing your skill baseline…',
    'Matching drills to your role…',
    'Calibrating your training load…',
    'Applying the SmartCrick progression model…',
    'Personalising your mental routine…',
    'Finalising your 12-week plan…',
  ];
  var [completedSteps, setCompletedSteps] = useState([false, false, false, false, false, false]);
  var stepRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(function () {
    var p = 0;
    var iv = setInterval(function () {
      p += Math.random() * 7 + 3;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(onNext, 800); }
      var rounded = Math.min(100, Math.round(p));
      setPct(rounded);
      var newCompleted = steps.map(function(_, i) { return rounded > (i + 1) / steps.length * 100; });
      setCompletedSteps(function(prev) {
        // Fire sparkle for newly completed steps
        newCompleted.forEach(function(done, i) {
          if (done && !prev[i]) {
            haptic('success');
            setTimeout(function() {
              var el = stepRefs[i].current;
              if (el && A.Emotion && A.Emotion.fireSparkleSVG) A.Emotion.fireSparkleSVG(el);
            }, 50);
          }
        });
        return newCompleted;
      });
    }, 280);
    return function () { clearInterval(iv); };
  }, []);

  var R = 54, CIRC = 2 * Math.PI * R;
  var isGlowing = pct >= 80;
  return h('div', { style: { minHeight: '100dvh', background: 'radial-gradient(120% 80% at 50% 0%, rgba(22,163,74,0.16), #0d1117 55%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 28px', maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }},
    h('div', { style: { position: 'relative', width: 140, height: 140, marginBottom: 24 }},
      h('svg', { width: 140, height: 140, viewBox: '0 0 140 140', 'aria-hidden': 'true',
        style: isGlowing ? { filter: 'drop-shadow(0 0 12px rgba(52,211,153,0.6))' } : {} },
        h('circle', { cx: 70, cy: 70, r: R, fill: 'none', stroke: 'rgba(48,54,61,0.8)', strokeWidth: 9 }),
        h('circle', { cx: 70, cy: 70, r: R, fill: 'none', stroke: C.green2, strokeWidth: 9, strokeLinecap: 'round',
          strokeDasharray: CIRC, strokeDashoffset: CIRC * (1 - pct / 100),
          transform: 'rotate(-90 70 70)', style: { transition: 'stroke-dashoffset 0.28s linear' }})
      ),
      h('div', { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }},
        h('div', { style: { fontSize: 28, fontWeight: 900, color: pct === 100 ? C.greenLt : C.text, lineHeight: 1, transition: 'color 0.3s' }}, pct + '%'),
        pct === 100 && h('div', { style: { fontSize: 11, fontWeight: 700, color: C.greenLt, marginTop: 2 }}, 'DONE ✓')
      )
    ),
    h('h2', { style: { fontSize: '1.35rem', fontWeight: 900, color: C.text, marginBottom: 20, textAlign: 'center' }}, 'Building your custom plan'),
    // Step checklist
    h('div', { style: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }},
      steps.map(function(step, i) {
        var done = completedSteps[i];
        return h('div', {
          key: i,
          style: {
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 11,
            background: done ? 'rgba(22,163,74,0.08)' : 'rgba(22,27,34,0.6)',
            border: '1px solid ' + (done ? 'rgba(52,211,153,0.3)' : 'rgba(48,54,61,0.5)'),
            transition: 'all 0.3s ease',
          }
        },
          h('div', {
            ref: stepRefs[i],
            style: {
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? C.green : 'rgba(48,54,61,0.8)',
              border: '2px solid ' + (done ? C.green2 : 'rgba(72,79,88,0.8)'),
              transition: 'all 0.2s',
            }
          },
            done ? h('span', { className: 'sc-check-pop', style: { fontSize: 12, color: '#fff', fontWeight: 900, lineHeight: 1 }}, '✓') : null
          ),
          h('span', { style: { fontSize: 13, fontWeight: done ? 700 : 500, color: done ? C.greenLt : C.sub, transition: 'all 0.3s', flex: 1, lineHeight: 1.4 }}, step)
        );
      })
    )
  );
}

// Screen — plan ready reveal. PURPOSE: deliver perceived value the user
// now "owns" (custom path, projected rating curve, weekly target).
function ScrReveal({ data, onNext, onBack }) {
  var endpointRef = useRef(null);
  useEffect(function () {
    try { A.fireConfetti && A.fireConfetti(); } catch (e) {}
    // Mascot cheer after counter finishes (1.5s)
    var t1 = setTimeout(function() {
      try { if (A.Emotion && A.Emotion.cheerMascot) A.Emotion.cheerMascot(); } catch(e) {}
    }, 1600);
    // Sparkle at graph endpoint
    var t2 = setTimeout(function() {
      var el = endpointRef.current;
      if (el && A.Emotion && A.Emotion.fireSparkleSVG) A.Emotion.fireSparkleSVG(el);
    }, 2400);
    return function() { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  var pathMap = { batsman: 'batting', bowler: 'bowling', allrounder: 'allrounder', wicketkeeper: 'fielding' };
  var recommendedPath = pathMap[data.role] || 'batting';
  var pathLabels = { batting: 'Batting Mastery', bowling: 'Bowling Excellence', allrounder: 'All-Round Elite', fielding: 'Keeper / Fielding Athlete' };
  var pathEmoji  = { batting: '🏏', bowling: '🎯', allrounder: '⭐', fielding: '🧤' };
  var xpGoalMap  = { '3': 150, '4': 200, '5': 280, '6': 350, '7': 450 };
  var weeklyXP   = xpGoalMap[data.trainingDays] || 200;
  var sk         = data.skills || { batting: 3, bowling: 3, fielding: 3, fitness: 3, mental: 3 };
  var avg        = (sk.batting + sk.bowling + sk.fielding + sk.fitness + sk.mental) / 5;
  var current    = Math.round(avg * 18 + 8);
  var projected  = Math.min(98, current + 17);
  var name       = (data.name || '').trim();
  var firstName  = name.split(' ')[0];

  // Build personalised plan name using generatePersonalizedPlan if available
  var planName = pathLabels[recommendedPath];
  if (A.generatePersonalizedPlan && data.level) {
    var tempUser = Object.assign({ recommendedPath: recommendedPath }, data);
    try { var pp = A.generatePersonalizedPlan(tempUser); if (pp && pp.name) planName = pp.name; } catch(e) {}
  }

  return h(OnboardShell, { onNext: onNext, onBack: onBack, showProgress: false, nextLabel: 'See my plan  →' },
    h('div', { style: { textAlign: 'center', marginBottom: 16 }},
      h('div', { 'aria-hidden': 'true', style: { fontSize: 44, marginBottom: 8 }}, '🎉'),
      h('h2', { style: { fontSize: '1.6rem', fontWeight: 900, color: C.text, marginBottom: 6, lineHeight: 1.2 }},
        (firstName ? firstName + ', your' : 'Your') + ' plan is ready!'),
      h('p', { style: { fontSize: 14, color: C.sub, lineHeight: 1.6 }}, 'Built from everything you told us. This is yours.')
    ),

    // Projected rating card — shimmer entrance + animated counter
    h('div', { style: {
      padding: 16, borderRadius: 16, marginBottom: 14,
      background: 'linear-gradient(135deg, rgba(22,27,34,0.95), rgba(22,27,34,0.8))',
      border: '1px solid rgba(52,211,153,0.3)',
      boxShadow: '0 0 24px rgba(52,211,153,0.08)',
    }},
      h('div', { style: { fontSize: 10, color: C.greenLt, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}, '📈 Your SmartCrick Rating — 12-Week Projection'),
      h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12 }},
        h('div', { style: { textAlign: 'center' }},
          h(AnimatedCounter, { from: current, to: current, duration: 1500, style: { fontSize: 38, fontWeight: 900, color: C.dim } }),
          h('div', { style: { fontSize: 10, color: C.faint, fontWeight: 600, marginTop: 2 }}, 'TODAY')
        ),
        h('div', { style: { fontSize: 22, color: C.faint, fontWeight: 300 }}, '→'),
        h('div', { style: { textAlign: 'center' }},
          h(AnimatedCounter, { from: current, to: projected, duration: 1500, style: { fontSize: 46, fontWeight: 900, color: C.greenLt, filter: 'drop-shadow(0 0 8px rgba(74,222,128,0.5))' } }),
          h('div', { style: { fontSize: 10, color: C.greenLt, fontWeight: 700, marginTop: 2 }}, 'WEEK 12')
        )
      ),
      h('div', { ref: endpointRef },
        h(CinematicGrowthCurve, { color: C.green2, height: 90, withMilestones: false })
      ),
      h('div', { style: { textAlign: 'center', marginTop: 8 }},
        h('span', { style: { fontSize: 12, fontWeight: 700, color: C.greenLt, background: 'rgba(52,211,153,0.1)', borderRadius: 99, padding: '3px 10px' }}, '+' + (projected - current) + ' points in 12 weeks')
      )
    ),

    // Recommended path card — shows personalised name
    h('div', { style: { padding: 16, borderRadius: 14, marginBottom: 12, background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.3)' }},
      h('div', { style: { fontSize: 10, fontWeight: 800, color: C.greenLt, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}, '⭐ Your recommended path'),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 }},
        h('span', { 'aria-hidden': 'true', style: { fontSize: 28 }}, pathEmoji[recommendedPath]),
        h('div', null,
          h('div', { style: { fontSize: 15, fontWeight: 800, color: C.text }}, planName),
          h('div', { style: { fontSize: 12.5, color: C.sub, marginTop: 2 }}, (data.trainingDays || 4) + ' days/week · ' + weeklyXP + ' XP weekly target')
        )
      )
    ),

    // Value stack — staggered with StaggerChildren
    h(StaggerChildren, { baseDelay: 80 },
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }},
        [
          { e: '🏏', t: '35+ pro drills' },
          { e: '🧠', t: '60+ mental sessions' },
          { e: '💪', t: 'Personal fitness plan' },
          { e: '📊', t: 'Progress tracking' },
        ].map(function (x, i) {
          return h('div', { key: i, style: { padding: '12px 14px', borderRadius: 11, background: C.card, border: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 9 }},
            h('span', { 'aria-hidden': 'true', style: { fontSize: 18 }}, x.e),
            h('span', { style: { fontSize: 12.5, fontWeight: 700, color: C.text }}, x.t)
          );
        })
      )
    )
  );
}

// ================================================================
// ACT 6 — LOCK PROGRESS (ACCOUNT)
// ================================================================
// PURPOSE: get a commitment (account) before the paywall so leaving
// feels like losing the plan they just built. Simulated (no backend).
function ScrAccount({ data, setData, onNext }) {
  function pick(provider) {
    haptic();
    setData(function (d) { return Object.assign({}, d, { account: provider }); });
    onNext();
  }
  var btn = function (bg, color, border, label, icon) {
    return h('button', {
      onClick: function () { pick(label); },
      style: { width: '100%', padding: '15px', borderRadius: 13, fontSize: 15, fontWeight: 800, fontFamily: 'inherit', minHeight: 54, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: bg, color: color, border: border || 'none', marginBottom: 10 },
    }, h('span', { 'aria-hidden': 'true', style: { fontSize: 18 }}, icon), 'Continue with ' + label);
  };
  return h('div', { style: { minHeight: '100dvh', background: C.bg, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24, maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box' }},
    h(StaggerChildren, { baseDelay: 40 },
      h('div', { style: { textAlign: 'center', marginBottom: 26 }},
        h('div', { 'aria-hidden': 'true', style: { fontSize: 44, marginBottom: 12 }}, '🔒'),
        h('h2', { style: { fontSize: '1.55rem', fontWeight: 900, color: C.text, marginBottom: 10, lineHeight: 1.25 }}, 'Save your plan so you never lose it'),
        h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.65, maxWidth: 330, margin: '0 auto' }},
          'Create your free account to lock in your progress, streaks and custom plan across all your devices.')
      ),
      btn('#fff', '#000', null, 'Apple', ''),
      btn('#fff', '#1f2937', null, 'Google', 'G'),
      btn(C.card, C.text, '2px solid ' + C.border, 'Email', '✉️'),
      h('p', { style: { fontSize: 11, color: C.faint, textAlign: 'center', marginTop: 8, lineHeight: 1.5 }},
        'We only use this to save your progress. No spam, ever.')
    )
  );
}

// ================================================================
// ACT 7 — PAYWALL  /  SPIN  /  DISCOUNTED PAYWALL
// ================================================================

// PlanOption row for the paywall.
function PlanRow({ selected, onClick, title, price, sub, badge, perWeek }) {
  return h('button', {
    onClick: function () { haptic(); onClick(); },
    'aria-pressed': selected ? 'true' : 'false',
    style: {
      position: 'relative', width: '100%', padding: '16px', borderRadius: 15, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      background: selected ? 'rgba(22,163,74,0.12)' : C.card,
      border: '2px solid ' + (selected ? C.green : C.border),
      boxShadow: selected ? '0 0 0 3px rgba(22,163,74,0.16)' : 'none', transition: 'all 0.15s',
    },
  },
    badge && h('span', { style: { position: 'absolute', top: -10, right: 14, background: C.green, color: '#fff', fontSize: 10, fontWeight: 900, padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.06em' }}, badge),
    h('div', null,
      h('div', { style: { fontSize: 15, fontWeight: 800, color: C.text }}, title),
      h('div', { style: { fontSize: 12.5, color: C.sub, marginTop: 2 }}, sub)
    ),
    h('div', { style: { textAlign: 'right', flexShrink: 0 }},
      h('div', { style: { fontSize: 15, fontWeight: 900, color: selected ? C.greenLt : C.text }}, price),
      perWeek && h('div', { style: { fontSize: 11, color: C.faint, marginTop: 1 }}, perWeek)
    )
  );
}

// Hard paywall. PURPOSE: final conversion. Everything funnels here; the
// plan is "built", so this is framed as the unlock — not a cost.
function ScrPaywall({ data, onStart, onDecline }) {
  var [plan, setPlan] = useState('annual');
  var name = (data.name || '').trim();
  return h('div', { style: { minHeight: '100dvh', background: 'radial-gradient(120% 70% at 50% 0%, rgba(22,163,74,0.18), #0d1117 50%)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', padding: 'env(safe-area-inset-top,16px) 0 env(safe-area-inset-bottom,20px)', boxSizing: 'border-box' }},
    h('div', { style: { display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }},
      h('button', { onClick: onDecline, 'aria-label': 'Close', style: { background: 'transparent', border: 'none', color: C.faint, fontSize: 26, lineHeight: 1, cursor: 'pointer', padding: 6, fontFamily: 'inherit' }}, '×')
    ),
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '4px 22px 8px' }},
      h(StaggerChildren, { baseDelay: 40 },
        h('div', { style: { textAlign: 'center', marginBottom: 20 }},
          h('div', { 'aria-hidden': 'true', style: { fontSize: 40, marginBottom: 10 }}, '🏏'),
          h('h2', { style: { fontSize: '1.65rem', fontWeight: 900, color: C.text, marginBottom: 8, lineHeight: 1.2, letterSpacing: '-0.02em' }},
            'Unlock your full plan' + (name ? ', ' + name : '')),
          h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }},
            'Your custom 12-week plan is ready. Start your free trial to unlock every drill, session and tool.')
        ),
        // Value stack — remind them what they're unlocking.
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 20 }},
          [
            'Your personalised 12-week plan',
            '35+ pro drills + 60+ mental sessions',
            'Progress tracking, streaks & analytics',
            'New content every week',
          ].map(function (t, i) {
            return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 11 }},
              h('span', { 'aria-hidden': 'true', style: { width: 22, height: 22, borderRadius: '50%', background: 'rgba(22,163,74,0.18)', color: C.greenLt, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 900, flexShrink: 0 }}, '✓'),
              h('span', { style: { fontSize: 14, color: C.text, fontWeight: 600 }}, t)
            );
          })
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 14 }},
          h(PlanRow, { selected: plan === 'annual', onClick: function () { setPlan('annual'); }, title: 'Yearly', sub: '3-day free trial, then billed yearly', price: '$59.99/yr', perWeek: 'just $1.15/week', badge: 'Best value' }),
          h(PlanRow, { selected: plan === 'monthly', onClick: function () { setPlan('monthly'); }, title: 'Monthly', sub: 'Flexible, cancel anytime', price: '$14.99/mo' })
        )
      )
    ),
    h('div', { style: { padding: '8px 22px 0' }},
      A.SpringBtn
        ? h(A.SpringBtn, { label: plan === 'annual' ? 'Start my 3-day free trial' : 'Unlock SmartCrick', onClick: function () { onStart(plan, plan === 'annual'); }, style: { width: '100%', padding: '17px', borderRadius: 14, fontSize: 16.5, fontWeight: 800, fontFamily: 'inherit', minHeight: 56, background: C.green, color: '#fff', boxShadow: '0 8px 28px rgba(22,163,74,0.45)', border: 'none' }})
        : h('button', { onClick: function () { onStart(plan, plan === 'annual'); }, style: { width: '100%', padding: '17px', border: 'none', borderRadius: 14, fontSize: 16.5, fontWeight: 800, fontFamily: 'inherit', minHeight: 56, background: C.green, color: '#fff', cursor: 'pointer', boxShadow: '0 8px 28px rgba(22,163,74,0.45)' }}, plan === 'annual' ? 'Start my 3-day free trial' : 'Unlock SmartCrick'),
      h('p', { style: { fontSize: 11, color: C.faint, textAlign: 'center', marginTop: 10, lineHeight: 1.5 }},
        plan === 'annual' ? 'No charge today. We\'ll remind you before your trial ends. Cancel anytime.' : 'Cancel anytime in settings.'),
      h('div', { style: { display: 'flex', justifyContent: 'center', gap: 18, marginTop: 8 }},
        h('button', { onClick: onDecline, style: { background: 'transparent', border: 'none', color: C.dim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}, 'Maybe later'),
        h('button', { onClick: function () { onStart(plan, false, true); }, style: { background: 'transparent', border: 'none', color: C.dim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 4 }}, 'Restore')
      )
    )
  );
}

// Spin-the-wheel. PURPOSE: gamified, variable-reward discount that fires
// only if the user declined the first offer — makes them feel "lucky"
// and re-opens the conversion with urgency.
function ScrSpin({ onResult }) {
  var [spinning, setSpinning] = useState(false);
  var [done, setDone] = useState(false);
  var rotRef = useRef(0);
  var [rot, setRot] = useState(0);
  var segs = [
    { label: '20% OFF', off: 20, color: '#1f6f43' },
    { label: '40% OFF', off: 40, color: '#16a34a' },
    { label: '50% OFF', off: 50, color: '#1f6f43' },
    { label: '60% OFF', off: 60, color: '#16a34a' },
    { label: '30% OFF', off: 30, color: '#1f6f43' },
    { label: '60% OFF', off: 60, color: '#16a34a' },
  ];
  var WIN = 3; // always lands on 60% OFF (index 3) — the "lucky" outcome
  function spin() {
    if (spinning || done) return;
    setSpinning(true); haptic();
    var seg = 360 / segs.length;
    var target = 360 * 5 + (360 - (WIN * seg + seg / 2)); // land WIN under pointer (top)
    rotRef.current = target;
    setRot(target);
    setTimeout(function () {
      setSpinning(false); setDone(true);
      try { A.fireConfetti && A.fireConfetti(); } catch (e) {}
      setTimeout(function () { onResult(segs[WIN].off); }, 900);
    }, 4200);
  }
  var seg = 360 / segs.length;
  return h('div', { style: { minHeight: '100dvh', background: 'radial-gradient(120% 70% at 50% 0%, rgba(245,158,11,0.14), #0d1117 55%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, maxWidth: 480, margin: '0 auto', width: '100%', boxSizing: 'border-box', textAlign: 'center' }},
    h('h2', { style: { fontSize: '1.55rem', fontWeight: 900, color: C.text, marginBottom: 6 }}, 'Wait — one last thing 🎁'),
    h('p', { style: { fontSize: 14.5, color: C.sub, lineHeight: 1.6, maxWidth: 320, marginBottom: 26 }}, 'Spin the wheel for an exclusive one-time discount on your plan.'),
    h('div', { style: { position: 'relative', width: 260, height: 260, marginBottom: 30 }},
      h('div', { 'aria-hidden': 'true', style: { position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: '20px solid ' + C.gold, zIndex: 3, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}),
      h('svg', { width: 260, height: 260, viewBox: '0 0 260 260', style: { transform: 'rotate(' + rot + 'deg)', transition: spinning ? 'transform 4.2s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }, 'aria-hidden': 'true' },
        segs.map(function (s, i) {
          var a0 = (i * seg - 90) * Math.PI / 180, a1 = ((i + 1) * seg - 90) * Math.PI / 180;
          var x0 = 130 + 125 * Math.cos(a0), y0 = 130 + 125 * Math.sin(a0);
          var x1 = 130 + 125 * Math.cos(a1), y1 = 130 + 125 * Math.sin(a1);
          var mid = (i * seg + seg / 2 - 90) * Math.PI / 180;
          var tx = 130 + 78 * Math.cos(mid), ty = 130 + 78 * Math.sin(mid);
          return h('g', { key: i },
            h('path', { d: 'M130 130 L' + x0.toFixed(1) + ' ' + y0.toFixed(1) + ' A125 125 0 0 1 ' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' Z', fill: s.color, stroke: '#0d1117', strokeWidth: 2 }),
            h('text', { x: tx, y: ty, fill: '#fff', fontSize: 14, fontWeight: 900, textAnchor: 'middle', dominantBaseline: 'middle', transform: 'rotate(' + (i * seg + seg / 2) + ' ' + tx + ' ' + ty + ')' }, s.label)
          );
        }),
        h('circle', { cx: 130, cy: 130, r: 22, fill: '#0d1117', stroke: C.gold, strokeWidth: 3 })
      )
    ),
    h('button', { onClick: spin, disabled: spinning || done, style: { width: '100%', maxWidth: 320, padding: '17px', border: 'none', borderRadius: 14, fontSize: 16.5, fontWeight: 800, fontFamily: 'inherit', minHeight: 56, background: done ? 'rgba(48,54,61,0.5)' : C.gold, color: done ? C.faint : '#1a1205', cursor: done || spinning ? 'default' : 'pointer', boxShadow: done ? 'none' : '0 8px 28px rgba(245,158,11,0.4)' }},
      spinning ? 'Spinning…' : done ? 'You won! 🎉' : 'SPIN TO WIN')
  );
}

// Discounted paywall. PURPOSE: one-time offer + scarcity/urgency
// (countdown). The last conversion push for users who didn't take the
// first offer.
function ScrDiscount({ data, offer, onStart, onDecline }) {
  offer = offer || 60;
  var full = 59.99;
  var discounted = Math.round((full * (1 - offer / 100)) * 100) / 100;
  var [secs, setSecs] = useState(10 * 60);
  useEffect(function () {
    var iv = setInterval(function () { setSecs(function (s) { return s > 0 ? s - 1 : 0; }); }, 1000);
    return function () { clearInterval(iv); };
  }, []);
  var mm = String(Math.floor(secs / 60)).padStart(2, '0');
  var ss = String(secs % 60).padStart(2, '0');
  return h('div', { style: { minHeight: '100dvh', background: 'radial-gradient(120% 70% at 50% 0%, rgba(245,158,11,0.16), #0d1117 50%)', display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', width: '100%', padding: 'env(safe-area-inset-top,16px) 0 env(safe-area-inset-bottom,20px)', boxSizing: 'border-box' }},
    h('div', { style: { display: 'flex', justifyContent: 'flex-end', padding: '8px 16px 0' }},
      h('button', { onClick: onDecline, 'aria-label': 'Close', style: { background: 'transparent', border: 'none', color: C.faint, fontSize: 26, cursor: 'pointer', padding: 6, fontFamily: 'inherit' }}, '×')
    ),
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '4px 22px 8px' }},
      h(StaggerChildren, { baseDelay: 40 },
        h('div', { style: { textAlign: 'center', marginBottom: 18 }},
          h('div', { style: { display: 'inline-block', background: 'rgba(245,158,11,0.16)', color: C.gold, fontSize: 12, fontWeight: 900, padding: '6px 14px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}, '🎉 ' + offer + '% OFF — one time only'),
          h('h2', { style: { fontSize: '1.7rem', fontWeight: 900, color: C.text, marginBottom: 10, lineHeight: 1.2 }}, 'Your exclusive offer'),
          h('div', { style: { display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 8 }},
            h('span', { style: { fontSize: 20, color: C.dim, textDecoration: 'line-through', fontWeight: 700 }}, '$' + full.toFixed(2)),
            h('span', { style: { fontSize: 40, fontWeight: 900, color: C.greenLt }}, '$' + discounted.toFixed(2)),
            h('span', { style: { fontSize: 14, color: C.sub, fontWeight: 700 }}, '/yr')
          ),
          h('p', { style: { fontSize: 13.5, color: C.sub }}, 'Locked in forever. Less than ' + ('$' + (discounted / 52).toFixed(2)) + '/week.')
        ),
        // Urgency countdown.
        h('div', { style: { textAlign: 'center', marginBottom: 20 }},
          h('div', { style: { fontSize: 12, color: C.dim, fontWeight: 700, marginBottom: 6 }}, 'Offer expires in'),
          h('div', { style: { fontSize: 30, fontWeight: 900, color: C.gold, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.04em' }}, mm + ':' + ss)
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 8 }},
          ['Everything in SmartCrick Pro', 'Your custom 12-week plan', 'Lowest price we ever offer'].map(function (t, i) {
            return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 11 }},
              h('span', { 'aria-hidden': 'true', style: { color: C.greenLt, fontWeight: 900 }}, '✓'),
              h('span', { style: { fontSize: 14, color: C.text, fontWeight: 600 }}, t)
            );
          })
        )
      )
    ),
    h('div', { style: { padding: '8px 22px 0' }},
      h('button', { onClick: function () { onStart('annual_discount', false); }, style: { width: '100%', padding: '17px', border: 'none', borderRadius: 14, fontSize: 16.5, fontWeight: 800, fontFamily: 'inherit', minHeight: 56, background: C.green, color: '#fff', cursor: 'pointer', boxShadow: '0 8px 28px rgba(22,163,74,0.45)' }}, 'Claim ' + offer + '% off  →'),
      h('button', { onClick: onDecline, style: { width: '100%', padding: '12px', marginTop: 8, border: 'none', background: 'transparent', color: C.dim, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}, 'No thanks, I\'ll start with the free version')
    )
  );
}

// ================================================================
// FLOW DEFINITION
// ================================================================
// Question specs (data-driven screens). Each maps to a QuestionScreen.
var QSPECS = {
  // Low-friction warm-up question (Cal-AI Figma #3 analog: "Choose your
  // gender"). Trivial, easy to answer, builds trust that the app is
  // "made for me" before any real personalization begins.
  format: { field: 'format', kind: 'single', title: 'Which format do you play most?', sub: 'Just so we get a feel for your game.', options: [
    { id: 't20', emoji: '⚡', label: 'T20 / Limited overs' },
    { id: 'odi', emoji: '🏏', label: 'One Day' },
    { id: 'test', emoji: '🛡️', label: 'Multi-day / Test' },
    { id: 'fun', emoji: '😄', label: 'Just for fun' },
  ]},
  // Free market research — feels like a normal question; used for
  // attribution + future marketing decisions.
  source: { field: 'source', kind: 'single', title: 'Where did you hear about SmartCrick?', sub: 'Helps us know what cricketers find useful.', options: [
    { id: 'instagram', emoji: '📸', label: 'Instagram / TikTok' },
    { id: 'youtube', emoji: '▶️', label: 'YouTube' },
    { id: 'friend', emoji: '👥', label: 'Friend or teammate' },
    { id: 'coach', emoji: '🧑‍🏫', label: 'Coach or academy' },
    { id: 'appstore', emoji: '🔍', label: 'App Store search' },
    { id: 'other', emoji: '💬', label: 'Somewhere else' },
  ]},
  // Segment switchers vs new — research while keeping the user engaged.
  switcher: { field: 'usedOthers', kind: 'single', title: 'Have you used a cricket training app before?', options: [
    { id: 'yes', emoji: '🔁', label: 'Yes, I\'ve tried others', sub: 'Looking for something better' },
    { id: 'no', emoji: '✨', label: 'No, this is my first', sub: 'Excited to start' },
  ]},
  age: { field: 'ageGroup', kind: 'single', columns: 1, title: 'What\'s your age group?', sub: 'We tailor training load and content to your stage.', options: AGE_GROUPS },
  role: { field: 'role', kind: 'single', title: 'What\'s your main role?', sub: 'This shapes which drills and plans we recommend.', options: ROLES },
  hand: { field: 'battingStyle', kind: 'single', title: 'How do you bat?', options: [
    { id: 'right', emoji: '🫱', label: 'Right-hand bat' },
    { id: 'left', emoji: '🫲', label: 'Left-hand bat' },
  ]},
  level: { field: 'level', kind: 'single', title: 'What level are you playing at?', sub: 'So your plan starts in exactly the right place.', options: LEVELS },
  goal: { field: 'goal', kind: 'single', title: 'What\'s your #1 cricket goal?', sub: 'Picture it. This is what we\'re building toward.', options: GOALS },
  // Visualise the success outcome — fuels desire.
  vision: { field: 'vision', kind: 'single', title: 'In 12 weeks, what would make you proud?', options: [
    { id: 'fifty', emoji: '🏏', label: 'A match-winning 50 or 100' },
    { id: 'fifer', emoji: '🎯', label: 'A 5-wicket haul' },
    { id: 'selected', emoji: '⭐', label: 'Getting selected a level up' },
    { id: 'consistent', emoji: '📈', label: 'Being my team\'s most consistent player' },
    { id: 'calm', emoji: '🧘', label: 'Staying calm & confident under pressure' },
  ]},
  // Pain points — emotional hook + research before selling.
  blockers: { field: 'blockers', kind: 'multi', max: 3, title: 'What\'s been holding you back?', sub: 'Pick up to 3. We\'ll target these first.', options: [
    { id: 'technique', emoji: '🔧', label: 'Inconsistent technique' },
    { id: 'nerves', emoji: '😰', label: 'Nerves & pressure' },
    { id: 'plan', emoji: '🗺️', label: 'No clear plan to follow' },
    { id: 'practice', emoji: '⏱️', label: 'Not enough quality practice' },
    { id: 'fitness', emoji: '💪', label: 'Fitness & stamina' },
    { id: 'feedback', emoji: '🔍', label: 'No feedback on what to fix' },
    { id: 'motivation', emoji: '🔋', label: 'Motivation drops off' },
  ]},
  // Deeper motivation — expands value beyond just runs/wickets.
  motivation: { field: 'motivations', kind: 'multi', max: 3, title: 'Beyond the scorecard, what do you want?', sub: 'The deeper why keeps you going. Pick up to 3.', options: [
    { id: 'confidence', emoji: '💎', label: 'Confidence' },
    { id: 'consistency', emoji: '🎯', label: 'Consistency' },
    { id: 'toughness', emoji: '🧠', label: 'Mental toughness' },
    { id: 'recognition', emoji: '🏅', label: 'Recognition & selection' },
    { id: 'enjoyment', emoji: '😄', label: 'Loving the game again' },
    { id: 'prove', emoji: '🔥', label: 'Prove people wrong' },
  ]},
  // Agency — let the user control the pace.
  pace: { field: 'pace', kind: 'segment', title: 'How hard do you want to push?', sub: 'You\'re in control. You can change this later.', options: [
    { id: 'steady', emoji: '🌱', label: 'Steady', sub: 'Sustainable' },
    { id: 'balanced', emoji: '⚖️', label: 'Balanced', sub: 'Recommended' },
    { id: 'aggressive', emoji: '🚀', label: 'All-in', sub: 'Fast results' },
  ]},
  days: { field: 'trainingDays', kind: 'segment', title: 'How many days a week can you train?', sub: 'Be realistic — consistency beats intensity.', options: [
    { id: '3', label: '3', sub: 'days' },
    { id: '4', label: '4', sub: 'days' },
    { id: '5', label: '5', sub: 'days' },
    { id: '6', label: '6', sub: 'days' },
  ]},
};

// Ordered flow. Each entry: { id, type }. FORM steps drive the progress
// bar; the bar completes at 'thanks' (completion bias before paywall).
var FLOW = [
  { id: 'welcome',    type: 'welcome' },
  { id: 'format',     type: 'q', form: true },
  { id: 'source',     type: 'q', form: true },
  { id: 'switcher',   type: 'q', form: true },
  { id: 'name',       type: 'name', form: true },
  { id: 'age',        type: 'q', form: true },
  { id: 'role',       type: 'q', form: true },
  { id: 'hand',       type: 'q', form: true },
  { id: 'level',      type: 'q', form: true },
  { id: 'skills',     type: 'skills', form: true },
  { id: 'proof1',     type: 'proof1', form: true },
  { id: 'goal',       type: 'q', form: true },
  { id: 'vision',     type: 'q', form: true },
  { id: 'affirm',     type: 'affirm', form: true },
  { id: 'blockers',   type: 'q', form: true },
  { id: 'motivation', type: 'q', form: true },
  { id: 'pace',       type: 'q', form: true },
  { id: 'proof2',     type: 'proof2', form: true },
  { id: 'honesty',    type: 'honesty', form: true },
  { id: 'days',       type: 'q', form: true },
  { id: 'smarttrack', type: 'smarttrack', form: true },
  { id: 'notify',     type: 'notify', form: true },
  { id: 'reviews',    type: 'reviews', form: true },
  { id: 'referral',   type: 'referral', form: true },
  { id: 'thanks',     type: 'thanks', form: true },
  { id: 'building',   type: 'building' },
  { id: 'reveal',     type: 'reveal' },
  { id: 'account',    type: 'account' },
  { id: 'paywall',    type: 'paywall' },
  { id: 'spin',       type: 'spin' },
  { id: 'discount',   type: 'discount' },
];
var FORM_TOTAL = FLOW.filter(function (s) { return s.form; }).length;

// ================================================================
// ROOT FLOW CONTROLLER
// ================================================================
function OnboardPage() {
  var [idx, setIdx] = useState(0);
  var [data, setData] = useState({
    name: '', source: '', usedOthers: '', ageGroup: '', role: '', battingStyle: '',
    level: '', skills: { batting: 3, bowling: 3, fielding: 3, fitness: 3, mental: 3 },
    goal: '', vision: '', blockers: [], motivations: [], pace: 'balanced',
    trainingDays: '4', notifications: false, referral: '', account: '', offer: 0,
  });

  var step = FLOW[idx];

  function go(id) { var i = FLOW.findIndex(function (s) { return s.id === id; }); if (i !== -1) { setIdx(i); window.scrollTo(0, 0); } }
  function next() { if (idx < FLOW.length - 1) { setIdx(idx + 1); window.scrollTo(0, 0); } else finalize(false); }
  function back() {
    // Skip non-form / one-way screens when going back.
    var i = idx - 1;
    while (i > 0 && !FLOW[i].form) i--;
    if (i < 0) i = 0;
    setIdx(i); window.scrollTo(0, 0);
  }

  // Progress bar value — based on position within the form steps.
  var formSoFar = FLOW.slice(0, idx + 1).filter(function (s) { return s.form; }).length;
  var progress = Math.min(1, formSoFar / FORM_TOTAL);

  // ── Persist + finish. pro=true if they started a trial / purchased. ──
  function finalize(pro, planId) {
    var xpGoalMap = { '3': 150, '4': 200, '5': 280, '6': 350, '7': 450 };
    var weeklyXP = xpGoalMap[data.trainingDays] || 200;
    var pathMap = { batsman: 'batting', bowler: 'bowling', allrounder: 'allrounder', wicketkeeper: 'fielding' };
    DB.setUser(Object.assign({}, DB.getUser(), {
      name: (data.name || '').trim() || 'Cricketer',
      source: data.source, usedOthers: data.usedOthers,
      ageGroup: data.ageGroup, role: data.role, battingStyle: data.battingStyle,
      level: data.level, skills: data.skills, goal: data.goal, vision: data.vision,
      blockers: data.blockers, motivations: data.motivations, pace: data.pace,
      trainingDays: parseInt(data.trainingDays, 10) || 4,
      notifications: !!data.notifications, referral: (data.referral || '').trim(),
      account: data.account || null, accountLinked: !!data.account,
      recommendedPath: pathMap[data.role] || 'batting',
      pro: !!pro, plan: pro ? (planId || 'annual') : null,
      proSince: pro ? new Date().toISOString() : null,
      onboardDone: true, joinedAt: new Date().toISOString(),
    }));
    DB.setWeeklyXPGoal(weeklyXP);
    try { awardXP(50, 0, 'onboarding'); } catch (e) {}
    try {
      var p = DB.getProgress();
      if (p && p.badges && p.badges.indexOf('joined') === -1) { p.badges.push('joined'); DB.saveProgress(p); }
    } catch (e) {}
    nav('Home');
  }

  // ── Paywall handlers ──────────────────────────────────────────
  function startSubscription(planId, isTrial) {
    haptic();
    try { A.fireConfetti && A.fireConfetti(); } catch (e) {}
    finalize(true, planId);
  }
  // Hard-paywall decline → spin the wheel (Cal AI plays the discount card).
  function paywallDecline() { go('spin'); }
  function spinResult(offer) { setData(function (d) { return Object.assign({}, d, { offer: offer }); }); go('discount'); }
  function discountDecline() { finalize(false); }

  // ── Render the current step ───────────────────────────────────
  var stepProps = { data: data, setData: setData, onNext: next, onBack: idx > 0 ? back : null, progress: progress };

  var view;
  switch (step.type) {
    case 'welcome':  view = h(ScrWelcome, { onNext: next }); break;
    case 'q':        view = h(QuestionScreen, Object.assign({ spec: QSPECS[step.id] }, stepProps)); break;
    case 'name':     view = h(ScrName, stepProps); break;
    case 'skills':   view = h(ScrSkills, stepProps); break;
    case 'referral': view = h(ScrReferral, stepProps); break;
    case 'proof1':   view = h(ScrProof1, stepProps); break;
    case 'affirm':   view = h(ScrAffirm, stepProps); break;
    case 'proof2':   view = h(ScrProof2, stepProps); break;
    case 'honesty':  view = h(ScrHonesty, stepProps); break;
    case 'smarttrack': view = h(ScrSmartTracking, stepProps); break;
    case 'notify':   view = h(ScrNotify, stepProps); break;
    case 'reviews':  view = h(ScrReviews, stepProps); break;
    case 'thanks':   view = h(ScrThanks, stepProps); break;
    case 'building': view = h(ScrBuilding, { onNext: next }); break;
    case 'reveal':   view = h(ScrReveal, { data: data, onNext: next, onBack: null }); break;
    case 'account':  view = h(ScrAccount, { data: data, setData: setData, onNext: next }); break;
    case 'paywall':  view = h(ScrPaywall, { data: data, onStart: startSubscription, onDecline: paywallDecline }); break;
    case 'spin':     view = h(ScrSpin, { onResult: spinResult }); break;
    case 'discount': view = h(ScrDiscount, { data: data, offer: data.offer || 60, onStart: startSubscription, onDecline: discountDecline }); break;
    default:         view = h(ScrWelcome, { onNext: next });
  }

  return h('div', { role: 'main', key: step.id }, view);
}

// ── Standalone Paywall page (reusable post-onboarding, e.g. "Go Pro"). ─
function PaywallPage() {
  function start(planId) {
    try { A.fireConfetti && A.fireConfetti(); } catch (e) {}
    DB.setUser(Object.assign({}, DB.getUser(), { pro: true, plan: planId || 'annual', proSince: new Date().toISOString() }));
    nav('Home');
  }
  return h(ScrPaywall, { data: DB.getUser() || {}, onStart: function (p) { start(p); }, onDecline: function () { nav('Home'); } });
}

A.OnboardPage = OnboardPage;
A.PaywallPage = PaywallPage;
console.log('[SC] app-onboard v2.0 — Cal-AI-style conversion funnel ready (' + FLOW.length + ' steps)');
})();
