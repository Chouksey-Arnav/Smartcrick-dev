// app-performance.js v1.0 — Performance Analytics V2
// Exports: A.PerformancePage
// Chart.js radar + rolling batting avg + XP trend + confidence tracker
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var A = window.SC_APP;
var DB = A.DB;
var Icon = A.Icon;
var PageHeader = A.PageHeader;

// ── Chart.js helpers ─────────────────────────────────────────────
function destroyChart(ref) {
  if (ref.current) { try { ref.current.destroy(); } catch(e) {} ref.current = null; }
}

// ── Radar chart ───────────────────────────────────────────────────
function RadarSection(props) {
  var canvasRef = useRef(null);
  var chartRef = useRef(null);
  var rating = props.rating;

  useEffect(function() {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    destroyChart(chartRef);
    var labels = ['Batting', 'Bowling', 'Fielding', 'Fitness', 'Mental', 'Consistency'];
    var data = [rating.batting || 0, rating.bowling || 0, rating.fielding || 0, rating.fitness || 0, rating.mental || 0, rating.consistency || 0];
    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Your Rating',
          data: data,
          fill: true,
          backgroundColor: 'rgba(22,163,74,0.15)',
          borderColor: '#16a34a',
          borderWidth: 2,
          pointBackgroundColor: '#4ade80',
          pointRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        scales: {
          r: {
            min: 0, max: 100,
            grid: { color: 'rgba(48,54,61,0.6)' },
            angleLines: { color: 'rgba(48,54,61,0.6)' },
            pointLabels: { color: '#8b949e', font: { size: 11, weight: '600' } },
            ticks: { stepSize: 25, color: '#484f58', backdropColor: 'transparent', font: { size: 9 } },
          }
        },
        plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(22,27,34,0.95)', borderColor: 'rgba(48,54,61,0.9)', borderWidth: 1, titleColor: '#f0fdf4', bodyColor: '#8b949e', padding: 10, cornerRadius: 8 } },
      }
    });
    return function() { destroyChart(chartRef); };
  }, [rating.batting, rating.bowling, rating.fielding, rating.fitness, rating.mental, rating.consistency]);

  return h('canvas', { ref: canvasRef, style: { maxHeight: 260 } });
}

// ── Axis bar ─────────────────────────────────────────────────────
function AxisBar(props) {
  var colors = { batting: '#3b82f6', bowling: '#ef4444', fielding: '#10b981', fitness: '#f59e0b', mental: '#8b5cf6', consistency: '#14b8a6' };
  var color = colors[props.axis] || '#16a34a';
  var score = props.score || 0;
  var grade = score >= 80 ? 'Elite' : score >= 60 ? 'Strong' : score >= 40 ? 'Developing' : 'Beginner';
  return h('div', { style: { marginBottom: 10 } },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 } },
      h('span', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' } }, props.label),
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
        h('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: color + '18', border: '1px solid ' + color + '30', color: color } }, grade),
        h('span', { style: { fontSize: 14, fontWeight: 700, color: '#f0fdf4', minWidth: 30, textAlign: 'right' } }, score)
      )
    ),
    h('div', { style: { height: 5, borderRadius: 99, background: 'rgba(30,41,59,0.8)', overflow: 'hidden' } },
      h('div', { style: { height: '100%', width: score + '%', background: color, borderRadius: 99, transition: 'width 0.7s ease' } })
    )
  );
}

// ── XP trend chart ────────────────────────────────────────────────
function XPTrendChart(props) {
  var canvasRef = useRef(null);
  var chartRef = useRef(null);
  var xpLog = props.xpLog || [];

  useEffect(function() {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    destroyChart(chartRef);

    // Build 14-day rolling
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var ds = d.toISOString().slice(0, 10);
      var label = (d.getMonth() + 1) + '/' + d.getDate();
      var xp = xpLog.filter(function(e) { return e.date === ds; }).reduce(function(s, e) { return s + (e.xp || 0); }, 0);
      days.push({ label: label, xp: xp });
    }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: days.map(function(d) { return d.label; }),
        datasets: [{
          label: 'XP',
          data: days.map(function(d) { return d.xp; }),
          backgroundColor: days.map(function(d) { return d.xp > 200 ? 'rgba(22,163,74,0.8)' : d.xp > 50 ? 'rgba(22,163,74,0.5)' : 'rgba(22,163,74,0.2)'; }),
          borderColor: '#16a34a', borderWidth: 1, borderRadius: 4,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: '#484f58', font: { size: 10 } } },
          y: { grid: { color: 'rgba(48,54,61,0.4)' }, ticks: { color: '#484f58', font: { size: 10 } } }
        },
        plugins: { legend: { display: false } },
      }
    });
    return function() { destroyChart(chartRef); };
  }, []);

  return h('div', { style: { height: 160, position: 'relative' } },
    h('canvas', { ref: canvasRef })
  );
}

// ── Rolling batting average chart ─────────────────────────────────
function BattingTrendChart(props) {
  var canvasRef = useRef(null);
  var chartRef = useRef(null);
  var matches = props.matches || [];

  useEffect(function() {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    destroyChart(chartRef);

    var innings = matches.filter(function(m) { return m.batting && m.batting.runs !== '' && m.batting.runs !== undefined && m.batting.runs !== null; }).slice(0, 20).reverse();
    if (innings.length < 2) { destroyChart(chartRef); return; }

    // Rolling average (window of 5)
    var labels = innings.map(function(m) { return m.opposition ? m.opposition.slice(0, 8) : m.date.slice(5); });
    var runs = innings.map(function(m) { return parseInt(m.batting.runs) || 0; });
    var rolling = runs.map(function(_, i) {
      var window = runs.slice(Math.max(0, i - 4), i + 1);
      var notOuts = innings.slice(Math.max(0, i - 4), i + 1).filter(function(m) { return m.batting.notOut; }).length;
      var dismissals = window.length - notOuts;
      return dismissals > 0 ? parseFloat((window.reduce(function(s, r) { return s + r; }, 0) / dismissals).toFixed(1)) : null;
    });

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Runs',
            data: runs,
            backgroundColor: 'rgba(59,130,246,0.1)',
            borderColor: '#3b82f6',
            borderWidth: 1.5,
            pointRadius: 3,
            pointBackgroundColor: '#60a5fa',
            fill: true,
            tension: 0.3,
            type: 'bar',
            backgroundColor: 'rgba(59,130,246,0.3)',
          },
          {
            label: 'Rolling Avg',
            data: rolling,
            borderColor: '#f59e0b',
            borderWidth: 2,
            pointRadius: 2,
            fill: false,
            tension: 0.4,
            spanGaps: true,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: '#484f58', font: { size: 9 }, maxTicksLimit: 8 } },
          y: { grid: { color: 'rgba(48,54,61,0.4)' }, ticks: { color: '#484f58', font: { size: 10 } } }
        },
        plugins: {
          legend: { display: true, labels: { color: '#8b949e', font: { size: 10 }, boxWidth: 12 } },
          tooltip: { backgroundColor: 'rgba(22,27,34,0.95)', borderColor: 'rgba(48,54,61,0.9)', borderWidth: 1, titleColor: '#f0fdf4', bodyColor: '#8b949e', padding: 8, cornerRadius: 8 },
        },
      }
    });
    return function() { destroyChart(chartRef); };
  }, []);

  return h('div', { style: { height: 180, position: 'relative' } },
    h('canvas', { ref: canvasRef })
  );
}

// ── Confidence trend (mental ratings last 14 days) ─────────────────
function ConfidenceChart(props) {
  var canvasRef = useRef(null);
  var chartRef = useRef(null);

  useEffect(function() {
    if (!canvasRef.current || typeof Chart === 'undefined') return;
    destroyChart(chartRef);

    var ratings = DB.getMentalRatings ? DB.getMentalRatings() : [];
    // Group by day, average per day
    var map = {};
    ratings.forEach(function(r) { if (!map[r.date]) map[r.date] = []; map[r.date].push(r.rating); });
    var days = [];
    for (var i = 13; i >= 0; i--) {
      var d = new Date(); d.setDate(d.getDate() - i);
      var ds = d.toISOString().slice(0, 10);
      var label = (d.getMonth() + 1) + '/' + d.getDate();
      var avg = map[ds] ? (map[ds].reduce(function(s, v) { return s + v; }, 0) / map[ds].length) : null;
      days.push({ label: label, avg: avg });
    }

    var hasData = days.some(function(d) { return d.avg !== null; });
    if (!hasData) { destroyChart(chartRef); return; }

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: days.map(function(d) { return d.label; }),
        datasets: [{
          label: 'Confidence',
          data: days.map(function(d) { return d.avg; }),
          borderColor: '#8b5cf6',
          borderWidth: 2,
          backgroundColor: 'rgba(139,92,246,0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: function(ctx) { return ctx.raw !== null ? 3 : 0; },
          pointBackgroundColor: '#a78bfa',
          spanGaps: false,
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false }, ticks: { color: '#484f58', font: { size: 9 }, maxTicksLimit: 7 } },
          y: { min: 1, max: 5, grid: { color: 'rgba(48,54,61,0.4)' }, ticks: { color: '#484f58', font: { size: 10 }, stepSize: 1 } }
        },
        plugins: { legend: { display: false } },
      }
    });
    return function() { destroyChart(chartRef); };
  }, []);

  return h('div', { style: { height: 140, position: 'relative' } },
    h('canvas', { ref: canvasRef })
  );
}

// ── Section wrapper ────────────────────────────────────────────────
function Section(props) {
  return h('div', { style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 14, padding: '16px', marginBottom: 12 } },
    h('div', { style: { fontSize: 12, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 } }, props.title),
    props.children
  );
}

// ── Mini stat card ─────────────────────────────────────────────────
function MiniStat(props) {
  return h('div', { style: { textAlign: 'center', padding: '10px 6px', background: 'rgba(13,17,23,0.5)', borderRadius: 8, border: '1px solid rgba(48,54,61,0.6)' } },
    h('div', { style: { fontSize: 18, fontWeight: 800, color: props.color || '#f0fdf4', fontVariantNumeric: 'tabular-nums', lineHeight: 1 } }, props.value),
    h('div', { style: { fontSize: 9, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 } }, props.label)
  );
}

// ================================================================
// PERFORMANCE PAGE
// ================================================================
function PerformancePage() {
  var [rating, setRating] = useState(function() {
    return A.calcPlayerRating ? A.calcPlayerRating() : {};
  });
  var [tab, setTab] = useState('overview');
  var xpLog = DB.getXPLog ? DB.getXPLog() : [];
  var matchLogs = DB.get('match_logs') || [];
  var progress = DB.getProgress();
  var mentalAvg = DB.getAverageMentalRating ? DB.getAverageMentalRating(14) : null;
  var mfScore = A.calcMentalFitnessScore ? A.calcMentalFitnessScore() : 0;

  useEffect(function() {
    var refresh = function() { if (A.calcPlayerRating) setRating(A.calcPlayerRating()); };
    window.addEventListener('sc_update', refresh);
    return function() { window.removeEventListener('sc_update', refresh); };
  }, []);

  var innings = matchLogs.filter(function(m) { return m.batting && m.batting.runs !== '' && m.batting.runs !== undefined; });
  var totalRuns = innings.reduce(function(s, m) { return s + (parseInt(m.batting.runs) || 0); }, 0);
  var notOuts = innings.filter(function(m) { return m.batting.notOut; }).length;
  var avg = (innings.length - notOuts) > 0 ? (totalRuns / (innings.length - notOuts)).toFixed(1) : '-';
  var hs = innings.length > 0 ? Math.max.apply(null, innings.map(function(m) { return parseInt(m.batting.runs) || 0; })) : 0;
  var weekXP = (DB.getXPLast7Days ? DB.getXPLast7Days() : []).reduce(function(s, d) { return s + (d.xp || 0); }, 0);

  var AXES = [
    { key: 'batting', label: 'Batting' }, { key: 'bowling', label: 'Bowling' },
    { key: 'fielding', label: 'Fielding' }, { key: 'fitness', label: 'Fitness' },
    { key: 'mental', label: 'Mental' }, { key: 'consistency', label: 'Consistency' }
  ];

  var TABS = [{ id: 'overview', label: 'Overview' }, { id: 'batting', label: 'Batting' }, { id: 'mental', label: 'Mental' }];

  return h('div', { style: { paddingBottom: 100, background: '#0d1117', minHeight: '100dvh' } },
    h(PageHeader, { title: 'Performance Analytics', subtitle: 'Deep insights across all your training', gradient: 'linear-gradient(135deg,#6d28d9,#4f46e5)' }),

    h('div', { style: { padding: '12px 16px 0' } },
      // Tab bar
      h('div', { style: { display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(48,54,61,0.9)' } },
        TABS.map(function(t) {
          return h('button', { key: t.id, onClick: function() { setTab(t.id); }, style: { flex: 1, padding: '10px 6px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', border: 'none', background: tab === t.id ? 'linear-gradient(135deg,#6d28d9,#4f46e5)' : 'rgba(22,27,34,0.9)', color: tab === t.id ? '#fff' : '#6b7280', borderRight: t.id !== 'mental' ? '1px solid rgba(48,54,61,0.9)' : 'none', transition: 'all 0.15s' } }, t.label);
        })
      ),

      // ── OVERVIEW ─────────────────────────────────────────────
      tab === 'overview' && h('div', null,
        // Overall rating card
        h('div', { style: { background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(79,70,229,0.08))', border: '1px solid rgba(109,40,217,0.3)', borderRadius: 14, padding: '16px', marginBottom: 12 } },
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 } },
            h('div', null,
              h('div', { style: { fontSize: 11, fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em' } }, 'Overall Rating'),
              h('div', { style: { fontSize: 44, fontWeight: 900, color: '#f0fdf4', lineHeight: 1, marginTop: 2 } }, rating.overall || 0)
            ),
            h('div', { style: { textAlign: 'right' } },
              h('div', { style: { fontSize: 11, color: '#6b7280', marginBottom: 4 } }, 'Week XP'),
              h('div', { style: { fontSize: 22, fontWeight: 700, color: '#4ade80' } }, weekXP.toLocaleString()),
              h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 4 } }, (progress.current_streak || 0) + ' day streak 🔥')
            )
          ),
          h('div', { style: { display: 'flex', justifyContent: 'center' } },
            h(RadarSection, { rating: rating })
          )
        ),

        // XP trend
        h(Section, { title: '14-Day XP History' },
          h(XPTrendChart, { xpLog: xpLog })
        ),

        // Axis breakdown
        h(Section, { title: 'Skill Breakdown' },
          AXES.map(function(ax) {
            return h(AxisBar, { key: ax.key, axis: ax.key, label: ax.label, score: rating[ax.key] || 0 });
          })
        )
      ),

      // ── BATTING ──────────────────────────────────────────────
      tab === 'batting' && h('div', null,
        innings.length === 0
          ? h('div', { style: { textAlign: 'center', padding: '48px 20px' } },
              h('div', { style: { fontSize: 40, marginBottom: 12 } }, '🏏'),
              h('p', { style: { fontSize: 13, color: '#6b7280' } }, 'Log your first match to see batting analytics'),
              h('button', { onClick: function() { A.nav('MatchLogger'); }, style: { marginTop: 16, padding: '10px 24px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Go to Match Logger')
            )
          : h('div', null,
              h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 } },
                h(MiniStat, { label: 'Innings', value: innings.length }),
                h(MiniStat, { label: 'Average', value: avg, color: '#4ade80' }),
                h(MiniStat, { label: 'H/S', value: hs || '-', color: '#f59e0b' }),
                h(MiniStat, { label: 'Total Runs', value: totalRuns, color: '#60a5fa' })
              ),
              h(Section, { title: 'Batting Trend — Runs + Rolling Average' },
                h(BattingTrendChart, { matches: matchLogs })
              ),
              // Last 5 innings
              h(Section, { title: 'Last 5 Innings' },
                h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
                  innings.slice(0, 5).map(function(m, i) {
                    var runs = parseInt(m.batting.runs) || 0;
                    var balls = parseInt(m.batting.balls) || 0;
                    var sr = balls > 0 ? ((runs / balls) * 100).toFixed(0) : '-';
                    var runColor = runs >= 50 ? '#f59e0b' : runs >= 30 ? '#4ade80' : '#8b949e';
                    return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(13,17,23,0.5)', borderRadius: 8, border: '1px solid rgba(48,54,61,0.6)' } },
                      h('div', { style: { fontSize: 20, fontWeight: 800, color: runColor, minWidth: 44, textAlign: 'right', fontVariantNumeric: 'tabular-nums' } }, runs + (m.batting.notOut ? '*' : '')),
                      h('div', { style: { flex: 1 } },
                        h('div', { style: { fontSize: 12, fontWeight: 600, color: '#f0fdf4' } }, 'vs ' + (m.opposition || '?')),
                        h('div', { style: { fontSize: 11, color: '#6b7280' } }, m.date + ' · ' + m.format + ' · ' + (balls || '?') + 'b · S/R ' + sr)
                      ),
                      h('div', { style: { width: 8, height: 8, borderRadius: '50%', background: m.result === 'win' ? '#16a34a' : m.result === 'loss' ? '#ef4444' : '#f59e0b', flexShrink: 0 } })
                    );
                  })
                )
              )
            )
      ),

      // ── MENTAL ───────────────────────────────────────────────
      tab === 'mental' && h('div', null,
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 } },
          h(MiniStat, { label: 'Sessions Done', value: progress.mental_done || 0, color: '#a78bfa' }),
          h(MiniStat, { label: 'Mental Fitness', value: mfScore, color: '#8b5cf6' }),
          h(MiniStat, { label: '14-Day Avg', value: mentalAvg ? mentalAvg + '/5' : '-', color: '#c084fc' })
        ),

        h(Section, { title: 'Confidence Trend (14 Days)' },
          h(ConfidenceChart, {})
        ),

        h(Section, { title: 'Mental Fitness Score' },
          h('div', { style: { marginBottom: 8 } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
              h('span', { style: { fontSize: 13, color: '#e5e7eb' } }, 'Overall mental fitness'),
              h('span', { style: { fontSize: 20, fontWeight: 800, color: '#8b5cf6' } }, mfScore + '/100')
            ),
            h('div', { style: { height: 8, borderRadius: 99, background: 'rgba(30,41,59,0.8)', overflow: 'hidden' } },
              h('div', { style: { height: '100%', width: mfScore + '%', background: 'linear-gradient(to right,#7c3aed,#a855f7)', borderRadius: 99, transition: 'width 0.7s' } })
            )
          ),
          h('div', { style: { fontSize: 11, color: '#6b7280', lineHeight: 1.6, marginTop: 10 } }, 'Calculated from: session count (40%), avg mood rating (30%), training consistency (30%). Increases as you build your mental training habit.')
        ),

        h(Section, { title: 'Mental Session History' },
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 } },
            [
              { label: 'Focus sessions', val: (DB.getXPLog() || []).filter(function(e) { return e.source === 'mental'; }).length, color: '#8b5cf6' },
              { label: 'Avg rating (7 days)', val: DB.getAverageMentalRating ? (DB.getAverageMentalRating(7) || '-') + '/5' : '-', color: '#a78bfa' },
              { label: 'Sessions this week', val: (DB.getXPLast7Days ? DB.getXPLast7Days() : []).filter(function(d) { return d.xp > 0; }).length, color: '#c084fc' },
            ].map(function(row) {
              return h('div', { key: row.label, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(48,54,61,0.4)' } },
                h('span', { style: { fontSize: 13, color: '#8b949e' } }, row.label),
                h('span', { style: { fontSize: 14, fontWeight: 700, color: row.color } }, row.val)
              );
            })
          )
        ),

        h('button', { onClick: function() { A.nav('Mental'); }, style: { width: '100%', padding: '13px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, color: '#a78bfa', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, '🧠 Train Mental Now')
      )
    )
  );
}

A.PerformancePage = PerformancePage;
console.log('[SC] app-performance.js v1.0 — PerformancePage + charts ready');
})();
