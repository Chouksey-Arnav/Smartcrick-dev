// Save as: app-onboard.js
// ================================================================
// SmartCrick — Onboarding Wizard v1.1
// P5-A: 5-screen first-time user setup
// Branding: SmartCrick (not SmartCrick AI)
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { DB, nav, getLevelInfo, awardXP } = A;

const TOTAL_STEPS = 5;

// ── StaggerChildren — fade-up each child with staggered delay ─────
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

function OptionBtn({ selected, onClick, children, ariaLabel }) {
  return h('button', {
    onClick: onClick,
    role: 'radio',
    'aria-checked': selected ? 'true' : 'false',
    'aria-label': ariaLabel,
    style: {
      display: 'flex', alignItems: 'center', gap: 12,
      width: '100%', padding: '14px 16px', borderRadius: 12,
      background: selected ? 'rgba(22,163,74,0.10)' : 'rgba(22,27,34,0.9)',
      border: '2px solid ' + (selected ? '#16a34a' : 'rgba(48,54,61,0.9)'),
      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
      transition: 'all 0.15s', outline: 'none',
      boxShadow: selected ? '0 0 0 3px rgba(22,163,74,0.18)' : 'none',
    },
    onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.35)'; },
    onBlur: function(e) { e.currentTarget.style.boxShadow = selected ? '0 0 0 3px rgba(22,163,74,0.18)' : 'none'; },
  },
    h('div', { 'aria-hidden': 'true', style: {
      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
      border: '2px solid ' + (selected ? '#16a34a' : 'rgba(75,85,99,0.5)'),
      background: selected ? '#16a34a' : 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s',
    }},
      selected && h('div', { 'aria-hidden': 'true', style: { width: 8, height: 8, borderRadius: '50%', background: '#fff' }})
    ),
    h('span', { style: { fontSize: 14, fontWeight: 600, color: selected ? '#f0fdf4' : '#8b949e', flex: 1 }}, children)
  );
}

function GridOptionBtn({ selected, onClick, emoji, label, ariaLabel }) {
  return h('button', {
    onClick: onClick, role: 'radio',
    'aria-checked': selected ? 'true' : 'false',
    'aria-label': ariaLabel || label,
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 8, padding: '18px 8px', borderRadius: 12,
      background: selected ? 'rgba(22,163,74,0.10)' : 'rgba(22,27,34,0.9)',
      border: '2px solid ' + (selected ? '#16a34a' : 'rgba(48,54,61,0.9)'),
      cursor: 'pointer', fontFamily: 'inherit', minHeight: 80,
      transition: 'all 0.15s', outline: 'none',
      boxShadow: selected ? '0 0 0 3px rgba(22,163,74,0.18)' : 'none',
    },
    onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.35)'; },
    onBlur: function(e) { e.currentTarget.style.boxShadow = selected ? '0 0 0 3px rgba(22,163,74,0.18)' : 'none'; },
  },
    h('span', { 'aria-hidden': 'true', style: { fontSize: 28, lineHeight: 1 }}, emoji),
    h('span', { style: { fontSize: 12, fontWeight: 700, color: selected ? '#4ade80' : '#6b7280', textAlign: 'center', lineHeight: 1.3 }}, label)
  );
}

function ProgressDots({ step, total }) {
  return h('div', {
    role: 'progressbar', 'aria-valuenow': step, 'aria-valuemin': 1, 'aria-valuemax': total,
    'aria-label': 'Step ' + step + ' of ' + total,
    style: { display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 },
  },
    Array.from({ length: total }, function(_, i) {
      var active = i + 1 === step, done = i + 1 < step;
      return h('div', { key: i, 'aria-hidden': 'true', style: {
        height: 4, borderRadius: 99, transition: 'all 0.3s ease',
        width: active ? 24 : 8,
        background: done ? '#16a34a' : active ? '#34d399' : 'rgba(48,54,61,0.8)',
      }});
    })
  );
}

function OnboardShell({ step, onNext, onBack, nextLabel, nextDisabled, children }) {
  var canGoBack = step > 1;
  return h('div', {
    style: {
      minHeight: '100dvh', background: '#0d1117', display: 'flex', flexDirection: 'column',
      padding: 'env(safe-area-inset-top, 16px) 0 env(safe-area-inset-bottom, 24px)',
    }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', padding: '16px 20px 0', marginBottom: 8 }},
      canGoBack
        ? h('button', {
            onClick: onBack, 'aria-label': 'Go back to previous step',
            style: {
              background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)',
              borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 6, color: '#8b949e', fontSize: 13, fontWeight: 600,
              fontFamily: 'inherit', minWidth: 44, minHeight: 44, justifyContent: 'center',
            }
          },
            h('span', null, '← Back')
          )
        : h('div', { 'aria-hidden': 'true', style: { display: 'flex', alignItems: 'center', gap: 8 }},
            h('div', { style: { width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#16a34a,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}, '🏏'),
            h('span', { style: { fontSize: 14, fontWeight: 800, color: '#16a34a', letterSpacing: '-0.01em' }}, 'SmartCrick')
          ),
      h('div', { style: { flex: 1 }}),
      h('span', { 'aria-hidden': 'true', style: { fontSize: 12, fontWeight: 600, color: '#484f58' }}, step + ' / ' + TOTAL_STEPS)
    ),
    h('div', { style: { flex: 1, overflowY: 'auto', padding: '24px 20px 8px' }},
      h(ProgressDots, { step: step, total: TOTAL_STEPS }),
      h(StaggerChildren, { baseDelay: 40 }, children)
    ),
    h('div', { style: { padding: '16px 20px 0' }},
      A.SpringBtn
        ? h(A.SpringBtn, {
            label: nextLabel || 'Continue →',
            onClick: nextDisabled ? undefined : onNext,
            disabled: !!nextDisabled,
            style: {
              width: '100%', padding: '15px', borderRadius: 12,
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit', minHeight: 52,
              background: nextDisabled ? 'rgba(48,54,61,0.5)' : '#16a34a',
              color: nextDisabled ? '#374151' : '#fff',
              boxShadow: nextDisabled ? 'none' : '0 4px 20px rgba(22,163,74,0.35)',
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              border: 'none',
            },
          })
        : h('button', {
            onClick: onNext, disabled: !!nextDisabled,
            style: {
              width: '100%', padding: '15px', border: 'none', borderRadius: 12,
              fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              cursor: nextDisabled ? 'not-allowed' : 'pointer',
              background: nextDisabled ? 'rgba(48,54,61,0.5)' : '#16a34a',
              color: nextDisabled ? '#374151' : '#fff',
              transition: 'all 0.15s', minHeight: 52,
              boxShadow: nextDisabled ? 'none' : '0 4px 20px rgba(22,163,74,0.35)', outline: 'none',
            },
          }, nextLabel || 'Continue →')
    )
  );
}

function Step1Welcome({ onNext }) {
  function handleStart() {
    if (A.Emotion && A.Emotion.cheerMascot) A.Emotion.cheerMascot();
    onNext();
  }
  return h(OnboardShell, { step: 1, onNext: handleStart, nextLabel: "Let's Start! →" },
    h('div', { style: { textAlign: 'center' }},
      h('div', { 'aria-hidden': 'true', style: { margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }},
        A.Mascot
          ? h(A.Mascot, { size: 'lg' })
          : h('div', {
              style: {
                width: 88, height: 88, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 35%, #dc2626, #991b1b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(220,38,38,0.35), 0 0 0 1px rgba(220,38,38,0.2)',
                fontSize: 40,
              }
            }, '🏏')
      ),
      h('h1', { style: { fontSize: '1.875rem', fontWeight: 900, color: '#f0fdf4', marginBottom: 12, letterSpacing: '-0.02em', lineHeight: 1.15 }},
        'Welcome to SmartCrick'),
      h('p', { style: { fontSize: 15, color: '#8b949e', lineHeight: 1.75, marginBottom: 32, maxWidth: 320, margin: '0 auto 32px' }},
        'Your personal cricket training platform. Better technique, stronger mindset, real results.'
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340, margin: '0 auto' }},
        [
          { emoji: '🏏', title: '35 professional drills', sub: 'Batting, bowling, fielding & more' },
          { emoji: '🧠', title: '60+ mental sessions', sub: 'Elite mindset training for cricket' },
          { emoji: '📈', title: 'Track your progress', sub: 'XP, streaks, badges & skill ratings' },
        ].map(function(item, i) {
          return h('div', { key: i, style: {
            display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
            borderRadius: 11, background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)',
          }},
            h('span', { 'aria-hidden': 'true', style: { fontSize: 24, lineHeight: 1, flexShrink: 0 }}, item.emoji),
            h('div', null,
              h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f0fdf4', marginBottom: 1 }}, item.title),
              h('div', { style: { fontSize: 12, color: '#6b7280' }}, item.sub)
            )
          );
        })
      )
    )
  );
}

function Step2Identity({ data, setData, onNext, onBack }) {
  var ageGroups = [
    { id: 'u13', label: 'Under 13', emoji: '🌱' },
    { id: 'u15', label: 'Under 15', emoji: '⚡' },
    { id: 'u17', label: 'Under 17', emoji: '🔥' },
    { id: 'u19', label: 'Under 19', emoji: '⭐' },
    { id: 'senior', label: 'Senior', emoji: '🏆' },
  ];
  var canProceed = data.name && data.name.trim().length >= 2 && data.ageGroup;
  return h(OnboardShell, { step: 2, onNext: onNext, onBack: onBack, nextLabel: 'Continue →', nextDisabled: !canProceed },
    h('div', null,
      h('h2', { style: { fontSize: '1.5rem', fontWeight: 900, color: '#f0fdf4', marginBottom: 8 }}, 'Tell us about yourself'),
      h('p', { style: { fontSize: 14, color: '#8b949e', marginBottom: 24, lineHeight: 1.6 }},
        'This helps us personalise your training. You can change it any time in your profile.'),
      h('div', { style: { marginBottom: 24 }},
        h('label', { htmlFor: 'onboard-name', style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}, 'Your first name'),
        h('input', {
          id: 'onboard-name', type: 'text',
          value: data.name || '',
          onChange: function(e) { setData(function(d) { return Object.assign({}, d, { name: e.target.value }); }); },
          placeholder: 'e.g. Arnav', autoComplete: 'given-name', maxLength: 30,
          style: {
            width: '100%', padding: '13px 14px', borderRadius: 10, fontSize: 16, outline: 'none',
            fontFamily: 'inherit', boxSizing: 'border-box',
            background: 'rgba(22,27,34,0.9)', color: '#f0fdf4',
            border: '2px solid ' + (data.name && data.name.trim().length >= 2 ? '#16a34a' : 'rgba(48,54,61,0.9)'),
            transition: 'border-color 0.15s',
          },
          onFocus: function(e) { e.target.style.borderColor = '#16a34a'; },
          onBlur: function(e) { if(!(data.name && data.name.trim().length >= 2)) e.target.style.borderColor = 'rgba(48,54,61,0.9)'; },
        })
      ),
      h('fieldset', { style: { border: 'none', margin: 0, padding: 0 }},
        h('legend', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, 'Age group'),
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }},
          ageGroups.map(function(ag) {
            return h(GridOptionBtn, {
              key: ag.id, selected: data.ageGroup === ag.id,
              onClick: function() { setData(function(d) { return Object.assign({}, d, { ageGroup: ag.id }); }); },
              emoji: ag.emoji, label: ag.label, ariaLabel: ag.label + ' age group',
            });
          })
        )
      )
    )
  );
}

function Step3Role({ data, setData, onNext, onBack }) {
  var roles = [
    { id: 'batsman', emoji: '🏏', label: 'Batsman', sub: 'Love to bat' },
    { id: 'bowler', emoji: '🎳', label: 'Bowler', sub: 'Love to bowl' },
    { id: 'allrounder', emoji: '⭐', label: 'All-Rounder', sub: 'Both disciplines' },
    { id: 'wicketkeeper', emoji: '🧤', label: 'Wicket-Keeper', sub: 'Behind the stumps' },
  ];
  var levels = [
    { id: 'school', label: 'School cricket', sub: 'Just starting out' },
    { id: 'club', label: 'Club cricket', sub: 'Regular competition' },
    { id: 'district', label: 'District / County', sub: 'Representative cricket' },
    { id: 'state', label: 'State / Region', sub: 'High-performance' },
  ];
  var canProceed = data.role && data.battingStyle && data.level;
  return h(OnboardShell, { step: 3, onNext: onNext, onBack: onBack, nextLabel: 'Continue →', nextDisabled: !canProceed },
    h('div', null,
      h('h2', { style: { fontSize: '1.5rem', fontWeight: 900, color: '#f0fdf4', marginBottom: 8 }}, 'Your playing role'),
      h('p', { style: { fontSize: 14, color: '#8b949e', marginBottom: 24, lineHeight: 1.6 }}, 'We use this to recommend the right drills and training plans for you.'),
      h('fieldset', { style: { border: 'none', margin: '0 0 20px', padding: 0 }},
        h('legend', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, 'Primary role'),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }},
          roles.map(function(r) {
            var sel = data.role === r.id;
            return h('button', {
              key: r.id,
              onClick: function() { setData(function(d) { return Object.assign({}, d, { role: r.id }); }); },
              role: 'radio', 'aria-checked': sel ? 'true' : 'false', 'aria-label': r.label,
              style: {
                display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderRadius: 11,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                background: sel ? 'rgba(22,163,74,0.10)' : 'rgba(22,27,34,0.9)',
                border: '2px solid ' + (sel ? '#16a34a' : 'rgba(48,54,61,0.9)'),
                transition: 'all 0.15s', outline: 'none', minHeight: 54,
              },
            },
              h('span', { 'aria-hidden': 'true', style: { fontSize: 22, lineHeight: 1, flexShrink: 0 }}, r.emoji),
              h('div', null,
                h('div', { style: { fontSize: 13, fontWeight: 700, color: sel ? '#f0fdf4' : '#8b949e' }}, r.label),
                h('div', { style: { fontSize: 11, color: '#484f58', marginTop: 1 }}, r.sub)
              )
            );
          })
        )
      ),
      h('fieldset', { style: { border: 'none', margin: '0 0 20px', padding: 0 }},
        h('legend', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, 'Batting hand'),
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }},
          [{ id: 'right', label: 'Right-hand bat' }, { id: 'left', label: 'Left-hand bat' }].map(function(bs) {
            return h(OptionBtn, {
              key: bs.id, selected: data.battingStyle === bs.id,
              onClick: function() { setData(function(d) { return Object.assign({}, d, { battingStyle: bs.id }); }); },
              ariaLabel: bs.label,
            }, bs.label);
          })
        )
      ),
      h('fieldset', { style: { border: 'none', margin: 0, padding: 0 }},
        h('legend', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, 'Current playing level'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 }},
          levels.map(function(lv) {
            var sel = data.level === lv.id;
            return h('button', {
              key: lv.id,
              onClick: function() { setData(function(d) { return Object.assign({}, d, { level: lv.id }); }); },
              role: 'radio', 'aria-checked': sel ? 'true' : 'false', 'aria-label': lv.label + ': ' + lv.sub,
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 14px', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit',
                background: sel ? 'rgba(22,163,74,0.10)' : 'rgba(22,27,34,0.9)',
                border: '2px solid ' + (sel ? '#16a34a' : 'rgba(48,54,61,0.9)'),
                transition: 'all 0.15s', outline: 'none', minHeight: 48,
              },
            },
              h('span', { style: { fontSize: 13, fontWeight: 700, color: sel ? '#f0fdf4' : '#8b949e' }}, lv.label),
              h('span', { style: { fontSize: 11, color: '#484f58' }}, lv.sub)
            );
          })
        )
      )
    )
  );
}

function Step4Goal({ data, setData, onNext, onBack }) {
  var goals = [
    { id: 'team', emoji: '🏟️', label: 'Make the team', sub: 'Earn my place in the XI' },
    { id: 'average', emoji: '📈', label: 'Improve my batting', sub: 'Raise my average & strike rate' },
    { id: 'wickets', emoji: '🎯', label: 'Take more wickets', sub: 'Become a match-winning bowler' },
    { id: 'district', emoji: '⭐', label: 'District selection', sub: 'Get selected for representative cricket' },
    { id: 'state', emoji: '🏆', label: 'State squad', sub: 'High-performance pathway' },
    { id: 'pro', emoji: '💎', label: 'Go professional', sub: 'Cricket as a career' },
  ];
  var days = ['3', '4', '5', '6', '7'];
  var canProceed = data.goal && data.trainingDays;
  return h(OnboardShell, { step: 4, onNext: onNext, onBack: onBack, nextLabel: 'Continue →', nextDisabled: !canProceed },
    h('div', null,
      h('h2', { style: { fontSize: '1.5rem', fontWeight: 900, color: '#f0fdf4', marginBottom: 8 }}, 'Your cricket goal'),
      h('p', { style: { fontSize: 14, color: '#8b949e', marginBottom: 24, lineHeight: 1.6 }}, 'Knowing your goal helps us build the right training plan.'),
      h('fieldset', { style: { border: 'none', margin: '0 0 24px', padding: 0 }},
        h('legend', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, "What's your #1 goal?"),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 7 }},
          goals.map(function(g) {
            var sel = data.goal === g.id;
            return h('button', {
              key: g.id,
              onClick: function() { setData(function(d) { return Object.assign({}, d, { goal: g.id }); }); },
              role: 'radio', 'aria-checked': sel ? 'true' : 'false', 'aria-label': g.label + ': ' + g.sub,
              style: {
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 11,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                background: sel ? 'rgba(22,163,74,0.10)' : 'rgba(22,27,34,0.9)',
                border: '2px solid ' + (sel ? '#16a34a' : 'rgba(48,54,61,0.9)'),
                transition: 'all 0.15s', outline: 'none', minHeight: 52,
              },
            },
              h('span', { 'aria-hidden': 'true', style: { fontSize: 20, lineHeight: 1, flexShrink: 0 }}, g.emoji),
              h('div', null,
                h('div', { style: { fontSize: 13, fontWeight: 700, color: sel ? '#f0fdf4' : '#8b949e' }}, g.label),
                h('div', { style: { fontSize: 11, color: '#484f58', marginTop: 1 }}, g.sub)
              )
            );
          })
        )
      ),
      h('fieldset', { style: { border: 'none', margin: 0, padding: 0 }},
        h('legend', { style: { display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}, 'Training days per week'),
        h('div', { style: { display: 'flex', gap: 8 }},
          days.map(function(d) {
            var sel = data.trainingDays === d;
            return h('button', {
              key: d,
              onClick: function() { setData(function(prev) { return Object.assign({}, prev, { trainingDays: d }); }); },
              role: 'radio', 'aria-checked': sel ? 'true' : 'false', 'aria-label': d + ' days per week',
              style: {
                flex: 1, padding: '13px 4px', borderRadius: 10, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 15, fontWeight: 800, minHeight: 52,
                background: sel ? 'rgba(22,163,74,0.12)' : 'rgba(22,27,34,0.9)',
                border: '2px solid ' + (sel ? '#16a34a' : 'rgba(48,54,61,0.9)'),
                color: sel ? '#4ade80' : '#6b7280',
                transition: 'all 0.15s', outline: 'none',
              },
            }, d);
          })
        )
      )
    )
  );
}

function Step5Launch({ data, onFinish }) {
  var pathMap = { batsman: 'batting', bowler: 'bowling', allrounder: 'allrounder', wicketkeeper: 'fielding' };
  var recommendedPath = pathMap[data.role] || 'batting';
  var pathLabels = { batting: 'Batting Mastery', bowling: 'Bowling Excellence', allrounder: 'All-Round Elite', fielding: 'Fielding Athlete' };
  var pathEmojis = { batting: '🏏', bowling: '🎳', allrounder: '⭐', fielding: '🧤' };
  var pathColors = { batting: '#3b82f6', bowling: '#ef4444', allrounder: '#f59e0b', fielding: '#10b981' };
  var xpGoalMap = { '3': 150, '4': 200, '5': 280, '6': 350, '7': 450 };
  var weeklyXPGoal = xpGoalMap[data.trainingDays] || 200;
  var goalLabel = { team: 'Make the team', average: 'Improve batting', wickets: 'Take more wickets', district: 'District selection', state: 'State squad', pro: 'Go professional' };
  var levelLabel = { school: 'Beginner', club: 'Intermediate', district: 'Intermediate', state: 'Advanced' };
  var levelSub = levelLabel[data.level] || 'Intermediate';
  var pc = pathColors[recommendedPath];

  return h(OnboardShell, { step: 5, onNext: onFinish, nextLabel: "Start Training! 🏏" },
    h('div', null,
      h('h2', { style: { fontSize: '1.5rem', fontWeight: 900, color: '#f0fdf4', marginBottom: 8 }},
        data.name ? 'Ready, ' + data.name + '! 🎉' : "You're all set! 🎉"),
      h('p', { style: { fontSize: 14, color: '#8b949e', marginBottom: 24, lineHeight: 1.6 }},
        "Based on your profile, here's your personalised training setup."),
      h('div', { style: { padding: '18px', borderRadius: 14, marginBottom: 16, background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)' }},
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }},
          h('div', { style: { width: 48, height: 48, borderRadius: 12, background: 'rgba(22,163,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 24 }}, '👤'),
          h('div', null,
            h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f0fdf4' }}, data.name || 'Cricketer'),
            h('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 2 }},
              (data.ageGroup || '').replace('u', 'Under ') + ' · ' + levelSub + ' · ' + (data.battingStyle === 'left' ? 'Left-hand bat' : 'Right-hand bat'))
          )
        ),
        h('div', { style: { height: 1, background: 'rgba(48,54,61,0.6)', marginBottom: 14 }}),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 }},
          [
            { label: 'Goal', value: goalLabel[data.goal] || data.goal, color: '#f59e0b' },
            { label: 'Training', value: (data.trainingDays || 4) + ' days/week', color: '#3b82f6' },
            { label: 'Weekly XP target', value: weeklyXPGoal + ' XP/week', color: '#16a34a' },
          ].map(function(item, i) {
            return h('div', { key: i, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }},
              h('span', { style: { fontSize: 12, color: '#6b7280', fontWeight: 600 }}, item.label),
              h('span', { style: { fontSize: 12, fontWeight: 700, color: item.color }}, item.value)
            );
          })
        )
      ),
      h('div', { style: {
        padding: '16px', borderRadius: 14, marginBottom: 16,
        background: pc + '08', border: '1px solid ' + pc + '40',
      }},
        h('div', { style: { fontSize: 10, fontWeight: 800, color: pc, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}, '⭐ Recommended for you'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 }},
          h('span', { 'aria-hidden': 'true', style: { fontSize: 24 }}, pathEmojis[recommendedPath]),
          h('div', null,
            h('div', { style: { fontSize: 14, fontWeight: 700, color: '#f0fdf4' }}, pathLabels[recommendedPath] + ' Path'),
            h('div', { style: { fontSize: 12, color: '#8b949e', marginTop: 2 }}, levelSub + ' level · ' + data.trainingDays + ' days/week')
          )
        )
      ),
      h('div', { style: {
        padding: '12px 14px', borderRadius: 10, background: 'rgba(22,27,34,0.9)',
        border: '1px solid rgba(48,54,61,0.9)', display: 'flex', alignItems: 'center', gap: 10,
      }},
        h('span', { 'aria-hidden': 'true', style: { fontSize: 18 }}, '🎯'),
        h('p', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.6 }},
          "Today's first mission is waiting for you. Let's build the habit, one session at a time.")
      )
    )
  );
}

function OnboardPage() {
  var [step, setStep] = useState(1);
  var [data, setData] = useState({ name: '', ageGroup: '', role: '', battingStyle: '', level: '', goal: '', trainingDays: '4' });

  function handleNext() { if (step < TOTAL_STEPS) setStep(function(s) { return s + 1; }); else handleFinish(); }
  function handleBack() { setStep(function(s) { return Math.max(1, s - 1); }); }

  function handleFinish() {
    var xpGoalMap = { '3': 150, '4': 200, '5': 280, '6': 350, '7': 450 };
    var weeklyXPGoal = xpGoalMap[data.trainingDays] || 200;
    var pathMap = { batsman: 'batting', bowler: 'bowling', allrounder: 'allrounder', wicketkeeper: 'fielding' };
    DB.setUser(Object.assign({}, DB.getUser(), {
      name: (data.name || '').trim() || 'Cricketer',
      ageGroup: data.ageGroup, role: data.role,
      battingStyle: data.battingStyle, level: data.level,
      goal: data.goal, trainingDays: parseInt(data.trainingDays) || 4,
      recommendedPath: pathMap[data.role] || 'batting',
      onboardDone: true, joinedAt: new Date().toISOString(),
    }));
    DB.setWeeklyXPGoal(weeklyXPGoal);
    awardXP(50, 0, 'onboarding');
    var p = DB.getProgress();
    if(p.badges.indexOf('joined') === -1) p.badges.push('joined');
    DB.saveProgress(p);
    nav('Home');
  }

  var stepProps = { data: data, setData: setData, onNext: handleNext, onBack: handleBack };
  return h('div', { role: 'main' },
    step === 1 && h(Step1Welcome, { onNext: handleNext }),
    step === 2 && h(Step2Identity, stepProps),
    step === 3 && h(Step3Role, stepProps),
    step === 4 && h(Step4Goal, stepProps),
    step === 5 && h(Step5Launch, { data: data, onFinish: handleFinish }),
  );
}

A.OnboardPage = OnboardPage;
console.log('[SC] app-onboard v1.1 — SmartCrick branding, 5-screen wizard ready');
})();
