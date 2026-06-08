// Save as: app-assessment.js  (was named app_assessment.js — rename in repo)
// ================================================================
// SmartCrick — Assessment & Player Rating System v1.0
// Exports: A.calcPlayerRating, A.AssessmentPage
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { DB, nav } = A;

// ── PLAYER RATING CALCULATOR ────────────────────────────────────
function calcPlayerRating(progress, user) {
  progress = progress || DB.getProgress();
  user = user || DB.getUser();
  var p = progress;
  var role = user.role || 'batsman';
  var level = user.level || 'club';

  // XP-based base score (0-100)
  var xpScore = Math.min(100, Math.round((p.total_xp || 0) / 50));

  // Consistency: streak bonus
  var streakBonus = Math.min(20, Math.round((p.best_streak || 0) * 0.8));

  // Drills activity
  var drillScore = Math.min(25, (p.drills_done || 0) * 2);

  // Mental sessions
  var mentalScore = Math.min(20, (p.mental_done || 0) * 1.5);

  // Fitness sessions
  var fitnessScore = Math.min(15, (p.fitness_done || 0) * 1.2);

  // Badge diversity
  var badgeScore = Math.min(10, ((p.badges || []).length) * 1.5);

  // Role-adjusted weights
  var roleWeights = {
    batsman:      { batting:0.40, bowling:0.10, fielding:0.15, mental:0.25, fitness:0.10 },
    bowler:       { batting:0.10, bowling:0.40, fielding:0.15, mental:0.25, fitness:0.10 },
    allrounder:   { batting:0.25, bowling:0.25, fielding:0.15, mental:0.25, fitness:0.10 },
    wicketkeeper: { batting:0.25, bowling:0.05, fielding:0.35, mental:0.25, fitness:0.10 },
  };
  var w = roleWeights[role] || roleWeights.batsman;

  // Per-skill metrics from drill completions
  var dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
  var bySkill = { batting:0, bowling:0, fielding:0 };
  Object.keys(dp).forEach(function(id) {
    var d = (A.DRILLS || []).find(function(x) { return x.id === id; });
    if(d && dp[id] && dp[id].completions) {
      var skill = d.skill_focus || d.category || 'batting';
      bySkill[skill] = (bySkill[skill] || 0) + Math.min(30, dp[id].completions * 5);
    }
  });

  // Composite score per axis (0-100)
  var axes = {
    batting:    Math.min(100, Math.round(xpScore * w.batting * 1.5 + Math.min(30, bySkill.batting || 0) + streakBonus * 0.3)),
    bowling:    Math.min(100, Math.round(xpScore * w.bowling * 1.5 + Math.min(30, bySkill.bowling || 0) + streakBonus * 0.3)),
    fielding:   Math.min(100, Math.round(xpScore * w.fielding * 1.5 + Math.min(30, bySkill.fielding || 0) + streakBonus * 0.2)),
    mental:     Math.min(100, Math.round(mentalScore * 3.5 + xpScore * w.mental + streakBonus * 0.5)),
    fitness:    Math.min(100, Math.round(fitnessScore * 4.5 + xpScore * w.fitness + streakBonus * 0.2)),
    consistency:Math.min(100, Math.round(Math.min(60, (p.current_streak || 0) * 4) + badgeScore * 2 + drillScore)),
  };

  var overall = Math.min(99, Math.round(
    axes.batting * 0.20 + axes.bowling * 0.20 + axes.fielding * 0.15 +
    axes.mental * 0.20 + axes.fitness * 0.10 + axes.consistency * 0.15
  ));

  var ratingLabel = overall >= 85 ? 'Elite' : overall >= 70 ? 'Advanced' : overall >= 55 ? 'Intermediate' : overall >= 40 ? 'Developing' : 'Beginner';
  return { axes: axes, overall: overall, label: ratingLabel, role: role };
}

A.calcPlayerRating = calcPlayerRating;

// ── RADAR CHART (Canvas) ─────────────────────────────────────────
function RadarChart({ axes, size }) {
  size = size || 220;
  var canvasRef = useRef(null);
  var labels = ['Batting','Bowling','Fielding','Mental','Fitness','Consistency'];
  var axisKeys = ['batting','bowling','fielding','mental','fitness','consistency'];
  var axisColors = ['#3b82f6','#ef4444','#10b981','#8b5cf6','#f59e0b','#06b6d4'];

  useEffect(function() {
    var canvas = canvasRef.current;
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var cx = size/2, cy = size/2, r = size/2 - 30;
    var n = axisKeys.length;
    ctx.clearRect(0, 0, size, size);

    // Grid rings
    [0.25,0.5,0.75,1.0].forEach(function(pct) {
      ctx.beginPath();
      for(var i=0;i<n;i++) {
        var angle = (i/n)*Math.PI*2 - Math.PI/2;
        var x=cx+Math.cos(angle)*r*pct, y=cy+Math.sin(angle)*r*pct;
        i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(48,54,61,0.7)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Axis lines
    for(var i=0;i<n;i++) {
      var angle = (i/n)*Math.PI*2 - Math.PI/2;
      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(angle)*r, cy+Math.sin(angle)*r);
      ctx.strokeStyle = 'rgba(48,54,61,0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Filled area
    ctx.beginPath();
    axisKeys.forEach(function(key, i) {
      var val = (axes[key] || 0)/100;
      var angle = (i/n)*Math.PI*2 - Math.PI/2;
      var x=cx+Math.cos(angle)*r*val, y=cy+Math.sin(angle)*r*val;
      i===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle = 'rgba(22,163,74,0.15)';
    ctx.fill();
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Points + labels
    axisKeys.forEach(function(key, i) {
      var val = (axes[key] || 0)/100;
      var angle = (i/n)*Math.PI*2 - Math.PI/2;
      var px=cx+Math.cos(angle)*r*val, py=cy+Math.sin(angle)*r*val;
      ctx.beginPath();
      ctx.arc(px,py,4,0,Math.PI*2);
      ctx.fillStyle = axisColors[i];
      ctx.fill();

      // Label
      var lx=cx+Math.cos(angle)*(r+18), ly=cy+Math.sin(angle)*(r+18);
      ctx.font = '600 10px Inter, system-ui, sans-serif';
      ctx.fillStyle = '#9ca3af';
      ctx.textAlign = Math.abs(Math.cos(angle)) < 0.1 ? 'center' : Math.cos(angle)>0 ? 'left' : 'right';
      ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.1 ? 'middle' : Math.sin(angle)>0 ? 'top' : 'bottom';
      ctx.fillText(labels[i], lx, ly);
    });
  }, [axes, size]);

  return h('canvas', { ref: canvasRef, width: size, height: size, style: { display:'block', margin:'0 auto' }, 'aria-label': 'Radar chart of cricket skill ratings' });
}

// ── ASSESSMENT PAGE ──────────────────────────────────────────────
function AssessmentPage() {
  var progress = DB.getProgress();
  var user = DB.getUser();
  var rating = calcPlayerRating(progress, user);
  var axes = rating.axes;
  var overall = rating.overall;
  var Icon = A.Icon;
  var BottomNav = A.BottomNav;
  var TopBar = A.TopBar;

  var axisLabels = ['Batting','Bowling','Fielding','Mental','Fitness','Consistency'];
  var axisKeys = ['batting','bowling','fielding','mental','fitness','consistency'];
  var axisColors = ['#3b82f6','#ef4444','#10b981','#8b5cf6','#f59e0b','#06b6d4'];
  var axisEmojis = ['🏏','🎯','🤸','🧠','💪','🔥'];

  var ratingColor = overall >= 85 ? '#f59e0b' : overall >= 70 ? '#3b82f6' : overall >= 55 ? '#16a34a' : overall >= 40 ? '#06b6d4' : '#6b7280';

  var weakest = axisKeys.reduce(function(a,b) { return axes[a]<axes[b]?a:b; });
  var strongest = axisKeys.reduce(function(a,b) { return axes[a]>axes[b]?a:b; });

  // Train ProMatcher whenever this page renders with real data
  React.useEffect(function() {
    try {
      if (!A.BrainEngine || !A.BrainEngine.train || !axes) return;
      var input = {
        batting:     Math.min(1, (axes.batting||0)/100),
        bowling:     Math.min(1, (axes.bowling||0)/100),
        fielding:    Math.min(1, (axes.fielding||0)/100),
        fitness:     Math.min(1, (axes.fitness||0)/100),
        mental:      Math.min(1, (axes.mental||0)/100),
        consistency: Math.min(1, (axes.consistency||0)/100),
      };
      var role = ((user && user.role) || 'batsman').toLowerCase();
      var output = {
        batsman_type:  role==='batsman'     ? 0.9 : role==='allrounder' ? 0.6 : 0.2,
        bowler_type:   role==='bowler'      ? 0.9 : role==='allrounder' ? 0.6 : 0.1,
        allrounder_type: role==='allrounder'? 0.9 : 0.3,
        keeper_type:   role==='wicketkeeper'? 0.9 : 0.1,
      };
      A.BrainEngine.train('ProMatcher', input, output);
    } catch(e) {}
  }, []);

  var tips = {
    batting:     'Work on the Cover Drive, Defensive Block, and Pull Shot drills for batting gains.',
    bowling:     'Focus on the Line & Length Precision and Yorker Death Bowling drills.',
    fielding:    'Build Ground Fielding Excellence and Throwing Accuracy drills into your sessions.',
    mental:      'Add 1 mental session per day — start with 5-min sessions in the Mental section.',
    fitness:     'Add 2-3 fitness workouts per week from the Fitness section.',
    consistency: 'Keep your daily streak going — even a 10-min session counts!',
  };

  return h('div', { style: { background:'#0d1117', minHeight:'100dvh', paddingBottom:100 }},
    h('div', { className:'sc-mobile-only' }, A.TopBar ? h(A.TopBar, { title:'Assessment' }) : null),
    h('div', { style: { padding:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 16px 0' }},
      h('div', { style: { textAlign:'center', marginBottom:24 }},
        h('h1', { style: { fontSize:'1.25rem', fontWeight:900, color:'#f0fdf4', marginBottom:6 }}, '🏏 Player Rating'),
        h('div', { style: { fontSize:13, color:'#6b7280' }}, 'Based on your training history')
      ),
      h('div', { style: { background:'rgba(22,27,34,0.9)', borderRadius:16, padding:24, border:'1px solid rgba(48,54,61,0.9)', marginBottom:16, textAlign:'center' }},
        h('div', { style: { fontSize:56, fontWeight:900, color:ratingColor, letterSpacing:'-0.03em', lineHeight:1, marginBottom:6 }}, overall),
        h('div', { style: { fontSize:14, fontWeight:700, color:ratingColor, marginBottom:16 }}, rating.label + ' Cricketer'),
        h(RadarChart, { axes:axes, size:220 })
      ),
      h('div', { style: { display:'flex', flexDirection:'column', gap:8, marginBottom:16 }},
        axisKeys.map(function(key, i) {
          var val = axes[key] || 0;
          return h('div', { key:key, style: { background:'rgba(22,27,34,0.9)', borderRadius:12, padding:'12px 14px', border:'1px solid rgba(48,54,61,0.9)' }},
            h('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }},
              h('div', { style: { display:'flex', alignItems:'center', gap:8 }},
                h('span', { 'aria-hidden':'true', style:{ fontSize:16 } }, axisEmojis[i]),
                h('span', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4' } }, axisLabels[i])
              ),
              h('span', { style:{ fontSize:14, fontWeight:800, color:axisColors[i] } }, val)
            ),
            h('div', { style:{ height:6, borderRadius:99, background:'rgba(48,54,61,0.8)', overflow:'hidden' }},
              h('div', { style:{ height:'100%', borderRadius:99, width:val+'%', background:axisColors[i], transition:'width 0.5s ease' } })
            )
          );
        })
      ),
      h('div', { style:{ background:'rgba(22,27,34,0.9)', borderRadius:12, padding:16, border:'1px solid rgba(48,54,61,0.9)', marginBottom:16 }},
        h('div', { style:{ fontSize:12, fontWeight:700, color:'#4ade80', marginBottom:8 }}, '💡 Priority Focus'),
        h('div', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.6 }},
          'Your weakest area is ',
          h('span', { style:{ color:'#f0fdf4', fontWeight:700 }}, axisLabels[axisKeys.indexOf(weakest)]),
          '. ',
          tips[weakest]
        )
      ),
      h('div', { style:{ background:'rgba(22,27,34,0.9)', borderRadius:12, padding:16, border:'1px solid rgba(48,54,61,0.9)', marginBottom:16 }},
        h('div', { style:{ fontSize:12, fontWeight:700, color:'#f59e0b', marginBottom:8 }}, '⭐ Your Strength'),
        h('div', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.6 }},
          'Your strongest area is ',
          h('span', { style:{ color:'#f0fdf4', fontWeight:700 }}, axisLabels[axisKeys.indexOf(strongest)]),
          '. Keep it up — elite cricketers double down on their strengths!'
        )
      ),
      h('div', { style:{ display:'flex', gap:10 }},
        h('button', { onClick:function(){ nav('Drills'); }, style:{ flex:1, padding:'13px', borderRadius:11, background:'#16a34a', border:'none', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}, '🏏 Go Train'),
        h('button', { onClick:function(){ nav('Mental'); }, style:{ flex:1, padding:'13px', borderRadius:11, background:'rgba(139,92,246,0.12)', border:'1px solid rgba(139,92,246,0.3)', color:'#a78bfa', fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}, '🧠 Mental')
      )
    ),
    h('div', { className:'sc-mobile-only' }, A.BottomNav ? h(A.BottomNav, { page:'Assessment' }) : null)
  );
}

A.AssessmentPage = AssessmentPage;
console.log('[SC] app-assessment v1.0 — calcPlayerRating + AssessmentPage ready');
})();
