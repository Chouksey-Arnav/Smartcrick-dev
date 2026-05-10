// Save as: app-assessment.js
// ================================================================
// SmartCrick AI — Skill Assessment & Radar Chart v1.0
// P5-C: 6-axis spider chart + player rating breakdown
// Fully accessible: SVG aria labels, text fallback, focus rings
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { DB, nav, getLevelInfo } = A;
const { Icon, PageHeader } = A;

// ── calcPlayerRating (also exported to A for use in app-core) ─────
function calcPlayerRating() {
  var p       = DB.getProgress();
  var dp      = DB.getDrillProgress();
  var logs    = DB.get('match_logs') || [];
  var xpLog   = DB.getXPLog();
  var DRILLS  = A.DRILLS || [];

  // Count drills by category
  var catDone = { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0, wicketkeeping: 0 };
  Object.keys(dp).forEach(function(id) {
    var drill = DRILLS.find(function(d) { return d.id === id; });
    if (drill && catDone[drill.category] !== undefined) catDone[drill.category]++;
  });

  // Batting score
  var battingInnings = logs.filter(function(l) { return l.batting && l.batting.runs !== ''; });
  var matchRuns      = battingInnings.reduce(function(s, l) { return s + parseInt(l.batting.runs || 0); }, 0);
  var matchAvg       = battingInnings.length > 0 ? matchRuns / battingInnings.length : 0;
  var batting = Math.min(100, Math.round(
    (Math.min(catDone.batting, 10) / 10) * 60 +
    Math.min(matchAvg / 40, 1) * 40
  ));

  // Bowling score
  var matchWickets = logs.reduce(function(s, l) { return s + parseInt((l.bowling && l.bowling.wickets) || 0); }, 0);
  var bowling = Math.min(100, Math.round(
    (Math.min(catDone.bowling + catDone.wicketkeeping, 10) / 10) * 60 +
    Math.min(matchWickets / 20, 1) * 40
  ));

  // Fielding score
  var matchCatches  = logs.reduce(function(s, l) { return s + parseInt((l.fielding && l.fielding.catches) || 0); }, 0);
  var matchRunouts  = logs.reduce(function(s, l) { return s + parseInt((l.fielding && l.fielding.runouts) || 0); }, 0);
  var fielding = Math.min(100, Math.round(
    (Math.min(catDone.fielding, 6) / 6) * 60 +
    Math.min((matchCatches + matchRunouts) / 10, 1) * 40
  ));

  // Fitness score
  var fitness = Math.min(100, Math.round(
    (Math.min((p.workouts_done || 0), 20) / 20) * 50 +
    Math.min((p.practice_minutes || 0) / 500, 1) * 50
  ));

  // Mental score (already computed)
  var mental = A.calcMentalFitnessScore ? A.calcMentalFitnessScore() : Math.min(100, Math.round(
    (Math.min((p.mental_done || 0), 50) / 50) * 100
  ));

  // Consistency score
  var activeDays30 = 0;
  var heatmap = DB.getActivityHeatmap ? DB.getActivityHeatmap() : [];
  activeDays30 = heatmap.filter(function(d) { return d.xp > 0; }).length;
  var consistency = Math.min(100, Math.round(
    (Math.min((p.current_streak || 0), 30) / 30) * 50 +
    (activeDays30 / 30) * 50
  ));

  var overall = Math.round((batting + bowling + fielding + fitness + mental + consistency) / 6);

  return { batting, bowling, fielding, fitness, mental, consistency, overall };
}
A.calcPlayerRating = calcPlayerRating;

// ── Radar chart config ────────────────────────────────────────────
var AXES = [
  { key: 'batting',     label: 'Batting',     color: '#3b82f6', desc: 'Drill completion + match runs' },
  { key: 'bowling',     label: 'Bowling',     color: '#ef4444', desc: 'Drill completion + wickets taken' },
  { key: 'fielding',    label: 'Fielding',    color: '#10b981', desc: 'Fielding drills + catches/run-outs' },
  { key: 'fitness',     label: 'Fitness',     color: '#f97316', desc: 'Workouts done + practice minutes' },
  { key: 'mental',      label: 'Mental',      color: '#8b5cf6', desc: 'Sessions + ratings + consistency' },
  { key: 'consistency', label: 'Consistency', color: '#f59e0b', desc: 'Streak length + active training days' },
];
var N = AXES.length;

// ── Hexagon radar SVG ──────────────────────────────────────────────
function RadarChart({ scores, size }) {
  var S = size || 240;
  var cx = S / 2, cy = S / 2;
  var maxR = S * 0.42; // max spoke radius

  function angleFor(i) { return (i / N) * 2 * Math.PI - Math.PI / 2; }
  function pointFor(i, r) {
    var a = angleFor(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }
  function poly(pts) { return pts.map(function(p) { return p.x + ',' + p.y; }).join(' '); }

  // Grid rings (25, 50, 75, 100)
  var rings = [0.25, 0.5, 0.75, 1.0].map(function(frac) {
    var pts = Array.from({ length: N }, function(_, i) { return pointFor(i, maxR * frac); });
    return pts;
  });

  // Player polygon
  var playerPts = AXES.map(function(ax, i) {
    return pointFor(i, maxR * Math.max(0.02, (scores[ax.key] || 0) / 100));
  });

  // Label positions (slightly beyond maxR)
  var labelPts = AXES.map(function(ax, i) { return pointFor(i, maxR + 22); });

  return h('svg', {
    viewBox: '0 0 ' + S + ' ' + S, width: S, height: S,
    role: 'img',
    'aria-label': 'Skill radar chart. Batting: ' + (scores.batting || 0) + '%, Bowling: ' + (scores.bowling || 0) + '%, Fielding: ' + (scores.fielding || 0) + '%, Fitness: ' + (scores.fitness || 0) + '%, Mental: ' + (scores.mental || 0) + '%, Consistency: ' + (scores.consistency || 0) + '%.',
  },
    // Grid rings
    rings.map(function(pts, ri) {
      return h('polygon', {
        key: 'ring-' + ri, points: poly(pts),
        fill: 'none', stroke: 'rgba(48,54,61,0.7)',
        strokeWidth: ri === 3 ? 1.5 : 0.75, 'aria-hidden': 'true',
      });
    }),

    // Spokes
    AXES.map(function(ax, i) {
      var tip = pointFor(i, maxR);
      return h('line', {
        key: 'spoke-' + i, x1: cx, y1: cy, x2: tip.x, y2: tip.y,
        stroke: 'rgba(48,54,61,0.7)', strokeWidth: 0.75, 'aria-hidden': 'true',
      });
    }),

    // Player polygon fill
    h('polygon', {
      'aria-hidden': 'true',
      points: poly(playerPts),
      fill: 'rgba(22,163,74,0.15)', stroke: '#16a34a', strokeWidth: 2,
      strokeLinejoin: 'round',
    }),

    // Player dots
    AXES.map(function(ax, i) {
      var pt = playerPts[i];
      return h('circle', {
        key: 'dot-' + i, cx: pt.x, cy: pt.y, r: 5,
        fill: ax.color, stroke: '#0d1117', strokeWidth: 2, 'aria-hidden': 'true',
      });
    }),

    // Axis labels
    AXES.map(function(ax, i) {
      var lp = labelPts[i];
      var anchor = lp.x < cx - 5 ? 'end' : lp.x > cx + 5 ? 'start' : 'middle';
      return h('text', {
        key: 'label-' + i, x: lp.x, y: lp.y + 4,
        textAnchor: anchor, fontSize: 9, fontWeight: 700,
        fill: ax.color, fontFamily: 'Inter, system-ui, sans-serif',
        'aria-hidden': 'true',
      }, ax.label.toUpperCase());
    }),

    // Center overall score
    h('text', {
      'aria-hidden': 'true',
      x: cx, y: cy - 6, textAnchor: 'middle',
      fontSize: 22, fontWeight: 900, fill: '#f0fdf4',
      fontFamily: 'Inter, system-ui, sans-serif',
    }, scores.overall || 0),
    h('text', {
      'aria-hidden': 'true',
      x: cx, y: cy + 11, textAnchor: 'middle',
      fontSize: 8, fontWeight: 700, fill: '#484f58', letterSpacing: 1,
      fontFamily: 'Inter, system-ui, sans-serif',
    }, 'OVERALL')
  );
}

// ── Grade labels ──────────────────────────────────────────────────
function getGrade(score) {
  if (score >= 85) return { label: 'Elite',         color: '#f59e0b' };
  if (score >= 70) return { label: 'Advanced',       color: '#10b981' };
  if (score >= 50) return { label: 'Intermediate',   color: '#3b82f6' };
  if (score >= 30) return { label: 'Developing',     color: '#f97316' };
  return                  { label: 'Beginner',        color: '#8b5cf6' };
}

// ── Axis breakdown row ─────────────────────────────────────────────
function AxisRow({ ax, score }) {
  var grade = getGrade(score);
  var pct   = score || 0;
  return h('div', {
    style: {
      padding: '12px 14px', borderRadius: 10,
      background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)',
    }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }},
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 }},
        h('div', {
          'aria-hidden': 'true',
          style: {
            width: 10, height: 10, borderRadius: '50%',
            background: ax.color, flexShrink: 0,
          }
        }),
        h('div', null,
          h('span', { style: { fontSize: 13, fontWeight: 700, color: '#f0fdf4' }}, ax.label),
          h('span', { style: { fontSize: 11, color: '#484f58', marginLeft: 8 }}, ax.desc)
        )
      ),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }},
        h('span', { style: { fontSize: 13, fontWeight: 800, color: '#f0fdf4', fontVariantNumeric: 'tabular-nums' }}, pct),
        h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
          background: grade.color + '15', border: '1px solid ' + grade.color + '35', color: grade.color,
        }}, grade.label)
      )
    ),
    // Bar
    h('div', {
      role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100,
      'aria-label': ax.label + ' score: ' + pct + ' out of 100',
      style: { height: 5, borderRadius: 99, background: 'rgba(30,41,59,0.8)', overflow: 'hidden' },
    },
      h('div', {
        'aria-hidden': 'true',
        style: {
          height: '100%', borderRadius: 99, width: pct + '%',
          background: ax.color, transition: 'width 0.7s ease',
        }
      })
    )
  );
}

// ── Improvement tip ────────────────────────────────────────────────
function getImprovementTip(scores) {
  var sorted = AXES.map(function(ax) { return { ax: ax, score: scores[ax.key] || 0 }; })
    .sort(function(a, b) { return a.score - b.score; });
  var weakest = sorted[0];
  var tips = {
    batting:     'Add 2–3 batting drills this week. Start with Cover Drive Mastery.',
    bowling:     'Practice Line & Length Precision daily — control is the foundation.',
    fielding:    'Do Ground Fielding Excellence 3× this week. Clean stops win matches.',
    fitness:     'Complete one workout session today. Your cricket stamina needs it.',
    mental:      'Start each training day with a 5-minute mental session.',
    consistency: 'Train every day this week, even just 10 minutes. Don\'t break the chain.',
  };
  return { axis: weakest.ax, score: weakest.score, tip: tips[weakest.ax.key] };
}

// ── Last assessment date ──────────────────────────────────────────
function getLastAssessmentStr() {
  var d = DB.get('last_assessment_date');
  if (!d) return null;
  var dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ================================================================
// ASSESSMENT PAGE
// ================================================================
function AssessmentPage() {
  var [scores, setScores]   = useState(null);
  var [loading, setLoading] = useState(true);
  var headingRef = useRef(null);

  useEffect(function() {
    // Compute on mount with a tiny delay for smooth entry
    var t = setTimeout(function() {
      var r = calcPlayerRating();
      setScores(r);
      setLoading(false);
      DB.set('last_assessment_date', new Date().toISOString().slice(0, 10));
      // Focus heading for screen readers
      if (headingRef.current) headingRef.current.focus();
    }, 200);
    return function() { clearTimeout(t); };
  }, []);

  var overall   = scores ? scores.overall : 0;
  var grade     = scores ? getGrade(overall) : { label: 'Loading…', color: '#484f58' };
  var tip       = scores ? getImprovementTip(scores) : null;
  var lastDate  = getLastAssessmentStr();

  return h('div', { style: { paddingBottom: 100, background: '#0d1117', minHeight: '100dvh' }},
    h(PageHeader, {
      title: 'Skill Assessment',
      subtitle: 'Your 6-axis cricket rating',
      gradient: 'linear-gradient(135deg,#1e3a5f,#7c3aed)',
      onBack: function() { nav('Home'); },
    }),

    loading
      ? h('div', {
          role: 'status', 'aria-live': 'polite', 'aria-label': 'Calculating your skill ratings',
          style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 },
        },
          h('div', { 'aria-hidden': 'true', className: 'spinner' }),
          h('p', { style: { fontSize: 14, color: '#6b7280', fontWeight: 600 }}, 'Analysing your training data…')
        )
      : h('div', { style: { padding: '16px' }},

          // Overall grade card
          h('div', {
            role: 'region', 'aria-label': 'Overall player rating',
            style: {
              padding: '24px', borderRadius: 16, marginBottom: 16, textAlign: 'center',
              background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)',
            }
          },
            // Radar chart
            h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 }},
              h(RadarChart, { scores: scores, size: 240 })
            ),

            // Overall rating
            h('div', {
              tabIndex: -1, ref: headingRef,
              style: {
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '8px 20px', borderRadius: 99, marginBottom: 8,
                background: grade.color + '15', border: '1px solid ' + grade.color + '35',
              }
            },
              h('span', { 'aria-hidden': 'true', style: { fontSize: 18 }},
                grade.label === 'Elite' ? '🏆' : grade.label === 'Advanced' ? '⭐' : grade.label === 'Intermediate' ? '⚡' : '🌱'),
              h('span', { style: { fontSize: 15, fontWeight: 800, color: grade.color }}, grade.label + ' Cricketer'),
            ),

            h('p', { style: { fontSize: 12, color: '#484f58', marginTop: 4 }},
              lastDate ? 'Assessed ' + lastDate : 'First assessment'
            )
          ),

          // Axis breakdown
          h('div', { role: 'region', 'aria-label': 'Skill breakdown by category' },
            h('h2', {
              style: {
                fontSize: 11, fontWeight: 700, color: '#6b7280',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
              }
            }, 'Skill Breakdown'),
            h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 }},
              AXES.map(function(ax) {
                return h(AxisRow, { key: ax.key, ax: ax, score: scores[ax.key] });
              })
            )
          ),

          // Top improvement tip
          tip && h('div', {
            role: 'complementary', 'aria-label': 'Coaching tip for your weakest area',
            style: {
              marginTop: 16, padding: '16px', borderRadius: 12,
              background: tip.ax.color + '0D', border: '1px solid ' + tip.ax.color + '30',
            }
          },
            h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12 }},
              h('div', {
                'aria-hidden': 'true',
                style: {
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: tip.ax.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }
              },
                h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: tip.ax.color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
                  h('path', { d: 'm12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' })
                )
              ),
              h('div', null,
                h('p', { style: { fontSize: 11, fontWeight: 800, color: tip.ax.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }},
                  'Focus: Improve your ' + tip.ax.label + ' (' + tip.score + '/100)'),
                h('p', { style: { fontSize: 13, color: '#8b949e', lineHeight: 1.65 }}, tip.tip)
              )
            )
          ),

          // Re-assess info
          h('p', {
            style: {
              textAlign: 'center', fontSize: 12, color: '#374151',
              marginTop: 16, lineHeight: 1.6,
            }
          },
            'Your rating updates automatically as you complete drills, sessions and log matches. Train consistently to watch your scores climb.'
          )
        )
  );
}

A.AssessmentPage = AssessmentPage;
A.calcPlayerRating = calcPlayerRating;
A.RADAR_AXES = AXES;
console.log('[SC] app-assessment v1.0 — P5-C radar chart + calcPlayerRating ready');
})();
