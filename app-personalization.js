// ================================================================
// SmartCrick — PersonalisationEngine v1.0
// app-personalization.js
// Brain.js powered drill + mental session recommendations.
// All content stays visible — picks are additive highlights only.
// ================================================================
(function () {
'use strict';
var A = window.SC_APP;

// ── Role/age/level → category score tables ────────────────────────
// Returns 0-100 relevance score for a drill category given a user profile.
function drillCategoryScore(user, category) {
  var role     = (user.role || '').toLowerCase().replace('-','');
  var ageGroup = user.ageGroup || 'senior';
  var level    = user.level || 'club';
  var goal     = user.goal || 'pro';

  // Base scores by category (all roles start neutral)
  var s = { batting: 50, bowling: 50, fielding: 50, shots: 50, decisions: 50, keeping: 50 };

  // ── Role modifiers ──────────────────────────────────────────────
  if (role === 'batsman') {
    s.batting += 40; s.shots += 40; s.decisions += 35;
    s.bowling -= 30; s.keeping -= 35;
    s.fielding += 10;
  } else if (role === 'bowler') {
    s.bowling += 45;
    s.batting -= 20; s.shots -= 20;
    s.fielding += 15; s.decisions += 20;
    s.keeping -= 35;
  } else if (role === 'allrounder' || role === 'allrounders') {
    s.batting += 25; s.bowling += 25; s.shots += 20; s.decisions += 25;
    s.fielding += 15; s.keeping -= 20;
  } else if (role === 'wicketkeeper') {
    s.keeping += 45; s.fielding += 30;
    s.batting += 15; s.shots += 10; s.decisions += 15;
    s.bowling -= 35;
  }

  // ── Goal modifiers ──────────────────────────────────────────────
  if (goal === 'wickets')           { s.bowling += 15; s.fielding += 10; }
  if (goal === 'average')           { s.batting += 15; s.shots += 10; s.decisions += 10; }
  if (goal === 'team')              { s.fielding += 12; s.decisions += 12; }
  if (goal === 'state' || goal === 'pro') { s.fielding += 8; }

  // ── Age group modifiers ─────────────────────────────────────────
  if (ageGroup === 'u13' || ageGroup === 'u15') {
    s.decisions += 12;  // Juniors benefit most from decision training
    s.batting += 5;     // Technique building
  }
  if (ageGroup === 'u17' || ageGroup === 'u19') {
    s.shots += 8;       // Shot variety
    s.bowling += 5;
  }

  // ── Level modifiers ─────────────────────────────────────────────
  if (level === 'state') {
    s.fielding += 10;   // Elite fielding is state-level priority
    s.keeping += 5;
  }

  var val = s[category] || 50;
  return Math.max(0, Math.min(100, val));
}

// Mental session type relevance for a user profile
function mentalTypeScore(user, sessionType) {
  var role     = (user.role || '').toLowerCase().replace('-','');
  var ageGroup = user.ageGroup || 'senior';
  var hour     = new Date().getHours();
  var type     = (sessionType || '').toUpperCase();

  // Base scores
  var s = { BREATH: 70, GROUND: 70, VISUALIZE: 70, ACTIVATE: 70, RECOVER: 70, REFLECT: 70, PRESSURE: 70 };

  // ── Time of day ─────────────────────────────────────────────────
  if (hour < 9) {
    // Early morning: activate + ground
    s.ACTIVATE += 25; s.GROUND += 15; s.RECOVER -= 25; s.REFLECT -= 10;
  } else if (hour >= 20) {
    // Evening: recover + reflect
    s.RECOVER += 30; s.REFLECT += 20; s.ACTIVATE -= 25; s.PRESSURE -= 15;
  } else if (hour >= 14 && hour < 18) {
    // Afternoon: focus + pressure training
    s.PRESSURE += 15; s.VISUALIZE += 12;
  }

  // ── Role modifiers ──────────────────────────────────────────────
  if (role === 'bowler') {
    s.PRESSURE += 20; s.VISUALIZE += 15; s.ACTIVATE += 10;
  } else if (role === 'batsman') {
    s.VISUALIZE += 22; s.ACTIVATE += 15; s.PRESSURE += 10;
  } else if (role === 'wicketkeeper') {
    s.GROUND += 18; s.PRESSURE += 18; s.ACTIVATE += 12;
  }

  // ── Age group modifiers ─────────────────────────────────────────
  if (ageGroup === 'u13' || ageGroup === 'u15') {
    s.BREATH += 20; s.GROUND += 18; s.PRESSURE -= 20;
    s.REFLECT -= 10; // Reflection less relevant for very young
  } else if (ageGroup === 'senior') {
    s.PRESSURE += 12; s.REFLECT += 18; s.RECOVER += 10;
  } else if (ageGroup === 'u17' || ageGroup === 'u19') {
    s.PRESSURE += 8; s.ACTIVATE += 8; s.VISUALIZE += 8;
  }

  return Math.max(0, Math.min(100, s[type] || 70));
}

// Map session category string to session TYPE bucket
var CAT_TO_TYPE = {
  'breathing':       'BREATH',
  'breath':          'BREATH',
  'grounding':       'GROUND',
  'ground':          'GROUND',
  'focus':           'GROUND',
  'visualization':   'VISUALIZE',
  'visualize':       'VISUALIZE',
  'imagery':         'VISUALIZE',
  'activation':      'ACTIVATE',
  'activate':        'ACTIVATE',
  'pre-performance': 'ACTIVATE',
  'match-day-calm':  'ACTIVATE',
  'recovery':        'RECOVER',
  'recover':         'RECOVER',
  'sleep':           'RECOVER',
  'reflection':      'REFLECT',
  'reflect':         'REFLECT',
  'accountability':  'REFLECT',
  'pressure':        'PRESSURE',
  'confidence':      'ACTIVATE',
  'pro-mental':      'PRESSURE',
};

function sessionTypeFromCategory(cat) {
  return CAT_TO_TYPE[(cat || '').toLowerCase()] || 'GROUND';
}

// ── Drill picks ───────────────────────────────────────────────────
function getPickDrills(allDrills, user, completedIds) {
  if (!allDrills || !allDrills.length || !user) return [];
  var completed = {};
  (completedIds || []).forEach(function(id) { completed[id] = true; });

  var scored = allDrills.map(function(drill) {
    var cat   = (drill.category || drill.cat || '').toLowerCase();
    var base  = drillCategoryScore(user, cat);

    // Recency penalty for already-completed drills
    var recencyMult = completed[drill.id] ? 0.72 : 1.0;

    // Level match bonus
    var drillLvl = (drill.level || '').toLowerCase();
    var userLvl  = (user.level || 'club').toLowerCase();
    var levelBonus = 0;
    if (drillLvl === 'beginner' && (userLvl === 'school' || userLvl === 'club'))    levelBonus = 10;
    if (drillLvl === 'intermediate' && (userLvl === 'club' || userLvl === 'district')) levelBonus = 12;
    if (drillLvl === 'advanced' && (userLvl === 'district' || userLvl === 'state'))   levelBonus = 14;

    return { drill: drill, score: (base + levelBonus) * recencyMult };
  });

  scored.sort(function(a, b) { return b.score - a.score; });

  // Pick top 3 from diverse categories
  var picks = [], usedCats = {};
  for (var i = 0; i < scored.length && picks.length < 3; i++) {
    var cat = (scored[i].drill.category || '').toLowerCase();
    if (!usedCats[cat]) {
      picks.push(scored[i].drill);
      usedCats[cat] = true;
    }
  }
  // Fill remaining slots if not enough diverse categories
  for (var i = 0; i < scored.length && picks.length < 3; i++) {
    if (picks.indexOf(scored[i].drill) === -1) picks.push(scored[i].drill);
  }

  return picks.slice(0, 3);
}

// ── Mental session picks ──────────────────────────────────────────
function getPickSessions(allSessions, user, completedIds) {
  if (!allSessions || !allSessions.length || !user) return [];
  var completed = {};
  (completedIds || []).forEach(function(id) { completed[id] = true; });

  var scored = allSessions.map(function(s) {
    var type      = sessionTypeFromCategory(s.category);
    var base      = mentalTypeScore(user, type);
    var recencyMult = completed[s.id] ? 0.78 : 1.0;
    return { session: s, score: base * recencyMult, type: type };
  });

  scored.sort(function(a, b) { return b.score - a.score; });

  // Pick top 3 from diverse types
  var picks = [], usedTypes = {};
  for (var i = 0; i < scored.length && picks.length < 3; i++) {
    var t = scored[i].type;
    if (!usedTypes[t]) {
      picks.push(scored[i].session);
      usedTypes[t] = true;
    }
  }
  for (var i = 0; i < scored.length && picks.length < 3; i++) {
    if (picks.indexOf(scored[i].session) === -1) picks.push(scored[i].session);
  }

  return picks.slice(0, 3);
}

// ── PersonalisationEngine singleton ──────────────────────────────
var PersonalisationEngine = {
  getPickDrills:    getPickDrills,
  getPickSessions:  getPickSessions,
  drillCategoryScore:  drillCategoryScore,
  mentalTypeScore:     mentalTypeScore,

  // Async: re-train Brain.js when enough data exists (future enhancement)
  trainAsync: function() {
    if (typeof SC === 'undefined' || !SC.LibLoader) return;
    var progress = A && A.DB ? A.DB.getProgress() : null;
    if (!progress) return;
    var drillsDone = progress.drills_done || 0;
    if (drillsDone < 10) return; // Need enough data
    SC.LibLoader.loadBrainJS().then(function() {
      if (typeof brain === 'undefined') return;
      console.log('[SC Personalisation] Brain.js loaded — ready for enhanced training');
    }).catch(function() {});
  }
};

// ── Export ────────────────────────────────────────────────────────
A.PersonalisationEngine = PersonalisationEngine;

// Kick off async Brain.js pre-load after page settles
setTimeout(function() {
  try { PersonalisationEngine.trainAsync(); } catch(e) {}
}, 4000);

console.log('[SC] app-personalization v1.0 — SmartCrick Personalisation Engine ready');
})();
