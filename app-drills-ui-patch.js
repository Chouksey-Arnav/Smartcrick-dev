// app-drills-ui-patch.js v1.0
// ================================================================
// SmartCrick — Drills Page UI Patch
// Adds:
//   - Category tabs including new "Shots" + "Decision Making" etc.
//   - YouTube video button on every drill card
//   - "problem" and "measurement" fields displayed in detail view
//   - progressionNext link at bottom of each drill
//
// Load AFTER app-drills-v2.js and app-drills.js
// Patches A.DrillsPage
// ================================================================
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var A = window.SC_APP;

// ── Category colours ──────────────────────────────────────────────
var CAT_COLORS = {
  shots:       '#16a34a',
  decisions:   '#0ea5e9',
  bowling:     '#f59e0b',
  fielding:    '#8b5cf6',
  keeping:     '#ec4899',
  partnership: '#14b8a6',
  fitness:     '#f97316',
  batting:     '#16a34a',
  all:         '#6b7280',
};

function catColor(cat) { return CAT_COLORS[cat] || '#6b7280'; }

// ── YouTube open helper ────────────────────────────────────────────
function openVideo(url) {
  if (!url) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

// ── Drill Detail View ──────────────────────────────────────────────
function DrillDetailV2(props) {
  var drill = props.drill, onBack = props.onBack;
  if (!drill) return null;
  var color = catColor(drill.category);

  return h('div', {
    style: {
      minHeight: '100dvh',
      background: '#0d1117',
      paddingTop: 'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))',
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
      color: '#f0fdf4',
    }
  },
    // Header
    h('div', { style: { padding: '0 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' } },
      h('button', {
        onClick: onBack,
        style: { background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '8px 0', fontSize: 14, fontFamily: 'inherit' }
      }, '← Back to Drills'),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 } },
        h('div', { style: { fontSize: 32 } }, drill.emoji || '🏏'),
        h('div', null,
          h('h1', { style: { fontSize: 20, fontWeight: 800, margin: 0 } }, drill.name),
          h('div', { style: { display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' } },
            h('span', {
              style: {
                padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: color + '20', color: color, border: '1px solid ' + color + '30',
              }
            }, (drill.category || 'drill').toUpperCase()),
            h('span', { style: { fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 } },
              '⏱ ' + (drill.duration || 15) + ' min'),
            h('span', { style: { fontSize: 12, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 4 } },
              '⚡ ' + (drill.xp || 80) + ' XP')
          )
        )
      )
    ),

    h('div', { style: { padding: '16px 16px 0' } },
      // Problem this solves (V2 drills)
      drill.problem && h('div', {
        style: {
          background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
        }
      },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#f87171', letterSpacing: '0.06em', marginBottom: 6 } }, '🎯 PROBLEM THIS SOLVES'),
        h('p', { style: { fontSize: 13, color: '#fca5a5', lineHeight: 1.6, margin: 0 } }, drill.problem)
      ),

      // Measurement (V2 drills)
      drill.measurement && h('div', {
        style: {
          background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
        }
      },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.06em', marginBottom: 6 } }, '📊 HOW TO MEASURE PROGRESS'),
        h('p', { style: { fontSize: 13, color: '#6ee7b7', lineHeight: 1.6, margin: 0 } }, drill.measurement)
      ),

      // YouTube video button
      drill.youtubeUrl && h('button', {
        onClick: function() { openVideo(drill.youtubeUrl); },
        style: {
          width: '100%', padding: '14px',
          background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.25)',
          borderRadius: 10, color: '#f87171', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          marginBottom: 16,
        }
      },
        h('svg', { width: 20, height: 14, viewBox: '0 0 20 14', fill: 'none' },
          h('rect', { width: 20, height: 14, rx: 3, fill: '#ef4444' }),
          h('polygon', { points: '8,4 8,10 14,7', fill: 'white' })
        ),
        'Watch on YouTube'
      ),

      // Steps
      h('div', { style: { marginBottom: 16 } },
        h('div', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', marginBottom: 10 } }, 'DRILL STEPS'),
        (drill.steps || drill.description || '').length > 0 && h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10 } },
          (Array.isArray(drill.steps) ? drill.steps : [drill.steps || drill.description]).map(function(step, i) {
            return h('div', {
              key: i,
              style: {
                display: 'flex', gap: 12, alignItems: 'flex-start',
                background: '#161b22', borderRadius: 10, padding: '12px 14px',
                border: '1px solid rgba(255,255,255,0.06)',
              }
            },
              h('div', {
                style: {
                  minWidth: 24, height: 24, borderRadius: '50%',
                  background: color + '20', color: color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                }
              }, i + 1),
              h('p', { style: { fontSize: 13, color: '#d1d5db', lineHeight: 1.6, margin: 0 } }, step)
            );
          })
        )
      ),

      // Key focus (v2)
      drill.keyFocus && h('div', {
        style: {
          background: color + '10', border: '1px solid ' + color + '25',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
        }
      },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: color, letterSpacing: '0.06em', marginBottom: 6 } }, '🔑 KEY FOCUS'),
        h('p', { style: { fontSize: 13, color: '#e5e7eb', lineHeight: 1.6, margin: 0, fontStyle: 'italic' } }, drill.keyFocus)
      ),

      // Common error (v2)
      drill.commonError && h('div', {
        style: {
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: 10, padding: '12px 14px', marginBottom: 16,
        }
      },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: '0.06em', marginBottom: 6 } }, '⚠️ MOST COMMON ERROR'),
        h('p', { style: { fontSize: 13, color: '#fde68a', lineHeight: 1.6, margin: 0 } }, drill.commonError)
      ),

      // Key points (existing drills compatibility)
      drill.keyPoints && drill.keyPoints.length > 0 && h('div', {
        style: { marginBottom: 16 }
      },
        h('div', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', marginBottom: 8 } }, 'KEY POINTS'),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
          drill.keyPoints.map(function(kp, i) {
            return h('div', {
              key: i,
              style: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#9ca3af' }
            },
              h('div', { style: { width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 } }),
              kp
            );
          })
        )
      ),

      // Progression link
      drill.progressionNext && h('div', {
        style: {
          background: '#161b22', borderRadius: 10, padding: '12px 14px',
          border: '1px solid rgba(255,255,255,0.06)', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        },
        onClick: function() {
          // Find and navigate to next drill
          var next = A.DRILLS && A.DRILLS.find(function(d) { return d.id === drill.progressionNext; });
          if (next && props.onDrill) props.onDrill(next);
        }
      },
        h('div', null,
          h('div', { style: { fontSize: 11, color: '#6b7280', marginBottom: 4 } }, 'NEXT PROGRESSION →'),
          h('div', { style: { fontSize: 14, fontWeight: 700, color: color } },
            (function() {
              var next = A.DRILLS && A.DRILLS.find(function(d) { return d.id === drill.progressionNext; });
              return next ? next.name : drill.progressionNext;
            })()
          )
        ),
        h('span', { style: { color: '#374151', fontSize: 18 } }, '›')
      ),

      // XP Button
      h('button', {
        onClick: function() {
          if (A.awardXP) A.awardXP(drill.xp || 80, drill.duration || 15, 'drills', 'drill', drill.id);
          if (A.fireConfetti) A.fireConfetti();
          window.dispatchEvent(new CustomEvent('sc_update'));
          onBack();
        },
        style: {
          width: '100%', padding: '16px',
          background: 'linear-gradient(135deg,' + color + ',' + color + 'cc)',
          border: 'none', borderRadius: 12, color: '#fff',
          fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
        }
      }, '✓ Complete Drill — Earn ' + (drill.xp || 80) + ' XP')
    )
  );
}

// ── Updated DrillsPage with category system ────────────────────────
function DrillsPageV2() {
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

  var drills = (A.DRILLS || []).filter(function(d) {
    var matchCat   = cat === 'all' || d.category === cat;
    var matchLvl   = level === 'all' || d.level === level;
    var q = search.toLowerCase();
    var matchSrch  = !q || (d.name || '').toLowerCase().includes(q) || (d.problem || '').toLowerCase().includes(q);
    return matchCat && matchLvl && matchSrch;
  });

  if (selected) {
    return h(DrillDetailV2, {
      drill: selected,
      onBack: function() { setSel(null); },
      onDrill: function(d) { setSel(d); }
    });
  }

  return h('div', {
    style: {
      minHeight: '100dvh',
      background: '#0d1117',
      paddingTop: 'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))',
      paddingBottom: 'calc(72px + env(safe-area-inset-bottom))',
      color: '#f0fdf4',
    }
  },
    // Search bar
    h('div', { style: { padding: '12px 16px 0' } },
      h('input', {
        value: search,
        onChange: function(e) { setSrch(e.target.value); },
        placeholder: '🔍 Search drills or problems...',
        style: {
          width: '100%', padding: '10px 14px', background: '#161b22',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
          color: '#f0fdf4', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
        }
      })
    ),

    // Category tabs
    h('div', {
      style: {
        display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto',
        scrollbarWidth: 'none',
      }
    },
      cats.map(function(c) {
        var active = cat === c.id;
        var cc = catColor(c.id);
        return h('button', {
          key: c.id,
          onClick: function() { setCat(c.id); },
          style: {
            flexShrink: 0, padding: '7px 14px', borderRadius: 99, cursor: 'pointer',
            background: active ? cc : 'rgba(255,255,255,0.05)',
            border: active ? ('1px solid ' + cc) : '1px solid rgba(255,255,255,0.06)',
            color: active ? '#fff' : '#9ca3af',
            fontSize: 12, fontWeight: active ? 700 : 400, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
          }
        }, c.emoji + ' ' + c.label);
      })
    ),

    // Level pills
    h('div', { style: { display: 'flex', gap: 6, padding: '0 16px 12px' } },
      ['all', 'beginner', 'intermediate', 'advanced', 'pro'].map(function(l) {
        var levelColors = { beginner: '#16a34a', intermediate: '#0ea5e9', advanced: '#f59e0b', pro: '#8b5cf6' };
        var lc = levelColors[l] || '#6b7280';
        return h('button', {
          key: l,
          onClick: function() { setLvl(l); },
          style: {
            padding: '5px 12px', borderRadius: 99, cursor: 'pointer',
            background: level === l ? lc + '25' : 'transparent',
            border: '1px solid ' + (level === l ? lc : 'rgba(255,255,255,0.08)'),
            color: level === l ? lc : '#6b7280',
            fontSize: 11, fontWeight: 600, fontFamily: 'inherit', textTransform: 'capitalize',
          }
        }, l === 'all' ? 'All levels' : l);
      })
    ),

    // Results count
    h('div', { style: { padding: '0 16px 10px', fontSize: 12, color: '#374151' } },
      drills.length + ' drill' + (drills.length !== 1 ? 's' : '')
    ),

    // Drill cards
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, padding: '0 16px' } },
      drills.map(function(d) {
        var cc = catColor(d.category);
        var isNew = !!d.problem; // v2 drills have problem field
        return h('div', {
          key: d.id,
          onClick: function() { setSel(d); },
          style: {
            background: '#161b22',
            border: '1px solid rgba(255,255,255,0.06)',
            borderLeft: '3px solid ' + cc,
            borderRadius: 10, padding: '14px', cursor: 'pointer',
            position: 'relative',
          }
        },
          h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 } },
            h('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 } },
              h('div', { style: { fontSize: 24, lineHeight: 1 } }, d.emoji || '🏏'),
              h('div', { style: { flex: 1 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                  h('span', { style: { fontSize: 15, fontWeight: 700, color: '#f0fdf4' } }, d.name),
                  isNew && h('span', {
                    style: {
                      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 99,
                      background: cc + '20', color: cc, border: '1px solid ' + cc + '30',
                    }
                  }, 'PRO')
                ),
                d.problem
                  ? h('p', { style: { fontSize: 12, color: '#6b7280', margin: '4px 0 0', lineHeight: 1.5 } },
                      d.problem.substring(0, 80) + (d.problem.length > 80 ? '...' : ''))
                  : h('p', { style: { fontSize: 12, color: '#6b7280', margin: '4px 0 0' } },
                      (d.level || 'beginner') + ' · ' + (d.duration || 15) + ' min')
              )
            ),
            h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 } },
              d.youtubeUrl && h('div', {
                style: {
                  width: 26, height: 18, background: '#ef444415',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                },
                onClick: function(e) { e.stopPropagation(); openVideo(d.youtubeUrl); }
              },
                h('svg', { width: 12, height: 8, viewBox: '0 0 12 8', fill: 'none' },
                  h('polygon', { points: '3.5,1 3.5,7 9,4', fill: '#ef4444' })
                )
              ),
              h('span', { style: { fontSize: 11, color: '#f59e0b', fontWeight: 700 } },
                (d.xp || 80) + ' XP')
            )
          )
        );
      })
    )
  );
}

// Register
Object.assign(window.SC_APP || (window.SC_APP = {}), {
  DrillsPage: DrillsPageV2,
  DrillDetailV2: DrillDetailV2,
});
console.log('[SC] app-drills-ui-patch v1.0 — DrillsPage v2 with categories, YouTube links, problem/measurement display');
})();
