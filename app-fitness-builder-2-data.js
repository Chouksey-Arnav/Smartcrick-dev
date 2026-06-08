// ================================================================
// app-fitness-builder-2-data.js — FB2 Schema, Constants & Helpers
// DB keys namespaced fitness2_* to never collide with fitness_*
// ================================================================
(function () {
'use strict';
var A = window.SC_APP;
if (!A) { console.warn('[FB2] SC_APP not ready'); return; }
var DB = A.DB;

// ─── Storage keys ─────────────────────────────────────────────
var K_PROFILE = 'fitness2_profile';   // UserProfile analogue
var K_PLAN    = 'fitness2_plan';      // WorkoutPlan analogue
var K_LOG     = 'fitness2_log';       // ExerciseSession history
var K_SESSION = 'fitness2_session';   // Ephemeral active session (cleared on End Workout)

// ─── DB helpers ───────────────────────────────────────────────
function getProfile2()  { try { return DB.get(K_PROFILE) || null; } catch(e) { return null; } }
function saveProfile2(p){ try { DB.set(K_PROFILE, p); } catch(e) {} }
function getPlan2()     { try { return DB.get(K_PLAN) || null; } catch(e) { return null; } }
function savePlan2(p)   { try { DB.set(K_PLAN, p); } catch(e) {} }
function getLog2()      { try { return DB.get(K_LOG) || []; } catch(e) { return []; } }
function appendLog2(entry) {
  try { var log = getLog2(); log.push(entry); DB.set(K_LOG, log.slice(-200)); } catch(e) {}
}
function getSession2()  { try { return DB.get(K_SESSION) || null; } catch(e) { return null; } }
function saveSession2(s){ try { DB.set(K_SESSION, s); } catch(e) {} }
function clearSession2(){ try { DB.del(K_SESSION); } catch(e) {} }

// ─── Option Constants ─────────────────────────────────────────
var FB2_MOTIVATIONS = [
  { id: 'look',    emoji: '🏆', label: 'Look the part on match day',         sub: 'Presence that commands respect' },
  { id: 'strong',  emoji: '💪', label: 'Finally feel genuinely strong',      sub: 'No more grinding plateaus' },
  { id: 'stamina', emoji: '🫁', label: 'Stop getting tired by the 2nd innings', sub: 'Outlast the competition' },
  { id: 'proud',   emoji: '🔥', label: 'Build a body I\'m proud of',          sub: 'Inside and outside the ground' },
  { id: 'injury',  emoji: '🛡️', label: 'Stay injury-free all season',         sub: 'Train smart, not just hard' },
];

var FB2_GOALS = [
  { id: 'strength',  emoji: '💪', label: 'Build Strength',      sub: 'Lift heavier, hit harder on every ball' },
  { id: 'power',     emoji: '⚡', label: 'Explosive Power',     sub: 'Run faster, field sharper, throw harder' },
  { id: 'endurance', emoji: '🫁', label: 'Match Fitness',       sub: 'Last every over of every match' },
  { id: 'body',      emoji: '🔥', label: 'Body Recomposition',  sub: 'Lean, athletic, match-ready physique' },
  { id: 'mobility',  emoji: '🧘', label: 'Mobility & Recovery', sub: 'Move pain-free, prevent injuries' },
];

var FB2_LEVELS = [
  { id: 'beginner',     icon: '🌱', label: 'Beginner',     color: '#16a34a', sub: '< 6 months training' },
  { id: 'intermediate', icon: '⚡', label: 'Intermediate', color: '#3b82f6', sub: '6 months – 2 years' },
  { id: 'advanced',     icon: '🔥', label: 'Advanced',     color: '#f97316', sub: '2+ years, consistent' },
  { id: 'pro',          icon: '💎', label: 'Pro',          color: '#8b5cf6', sub: 'Elite / semi-professional' },
];

var FB2_BODY_FOCUS = [
  { id: 'upper',  emoji: '💪', label: 'Upper Body',             sub: 'Chest, back, shoulders, arms' },
  { id: 'core',   emoji: '🎯', label: 'Core & Stability',       sub: 'Abs, obliques, lower back' },
  { id: 'lower',  emoji: '🦵', label: 'Lower Body & Power',     sub: 'Quads, hamstrings, glutes, calves' },
  { id: 'cardio', emoji: '💨', label: 'Conditioning & Cardio',  sub: 'Stamina, VO2, match endurance' },
];

var FB2_PATHS = [
  { id: 'preseason', emoji: '🚀', label: 'Pre-Season Power Block',  sub: 'Build your strongest base before the season starts' },
  { id: 'inseason',  emoji: '🏏', label: 'In-Season Maintenance',   sub: 'Stay match-sharp without draining your body' },
  { id: 'offseason', emoji: '⚙️', label: 'Off-Season Rebuild',      sub: 'Overhaul your fitness when games can wait' },
];

var FB2_SCHEDULE_OPTIONS = [
  { id: '3', emoji: '3️⃣', label: '3 days / week', sub: 'Consistent, sustainable start' },
  { id: '4', emoji: '4️⃣', label: '4 days / week', sub: 'The sweet spot for results' },
  { id: '5', emoji: '5️⃣', label: '5 days / week', sub: 'Serious athletic commitment' },
];

var FB2_DURATION_OPTIONS = [
  { id: '20', label: '20 min', sub: 'Efficient on tight days' },
  { id: '30', label: '30 min', sub: 'Standard session' },
  { id: '45', label: '45 min', sub: 'Full training block' },
  { id: '60', label: '60 min', sub: 'Maximum output' },
];

// ─── LD/DL palette (scoped to FB2 only) ───────────────────────
var FB2_PALETTE = {
  dark: {
    bg:     '#0d1117',
    card:   'rgba(22,27,34,0.95)',
    border: 'rgba(48,54,61,0.9)',
    accent: '#16a34a', accent2: '#34d399',
    ring:   '#10b981',
    text:   '#f0fdf4',
    sub:    '#8b949e',
    dim:    '#6b7280',
    faint:  '#484f58',
    danger: '#f87171',
  },
};

// ─── Goal-specific milestone labels for the potential curve ───
function getGoalMilestones(goal) {
  var m = {
    strength:  ['Week 3: First new PR', 'Week 7: Visible muscle gain', 'Week 12: Peak strength'],
    power:     ['Week 2: Faster sprint times', 'Week 6: Explosive power lift', 'Week 12: Elite output'],
    endurance: ['Week 3: Fewer cramps & fatigue', 'Week 7: Full-match stamina', 'Week 12: Unstoppable fitness'],
    body:      ['Week 3: Visible definition', 'Week 7: Body recomposition', 'Week 12: Elite physique'],
    mobility:  ['Week 2: Greater range of motion', 'Week 5: Pain-free movement', 'Week 12: Full athletic mobility'],
  };
  return m[goal] || m.strength;
}

// ─── Plan generator ───────────────────────────────────────────
function generateFB2Plan(profile) {
  var exercises = A.EXERCISES || [];
  if (!exercises.length) return { id: 'fb2_empty', sessions: [], exercises: [] };

  var goal    = profile.goal || 'strength';
  var level   = profile.level || 'beginner';
  var focus   = profile.bodyFocus || ['upper', 'core'];
  var days    = parseInt(profile.daysPerWeek || '4', 10);
  var mins    = parseInt(profile.minutesPerSession || '30', 10);
  var numEx   = mins <= 20 ? 4 : mins <= 30 ? 6 : mins <= 45 ? 8 : 10;

  var focusMuscleMap = {
    upper:  ['chest', 'back', 'shoulders', 'arms', 'triceps', 'biceps'],
    core:   ['core', 'abs'],
    lower:  ['legs', 'glutes', 'quads', 'hamstrings'],
    cardio: ['conditioning', 'cardio'],
  };
  var targetMuscles = [];
  focus.forEach(function(f) {
    (focusMuscleMap[f] || []).forEach(function(m) {
      if (targetMuscles.indexOf(m) === -1) targetMuscles.push(m);
    });
  });

  var levelOrder = ['beginner', 'intermediate', 'advanced', 'pro'];
  var levelIdx   = levelOrder.indexOf(level);
  var candidates = exercises.filter(function(e) {
    var eIdx = levelOrder.indexOf(e.difficulty);
    var levelOk = eIdx <= levelIdx + 1; // include one level above
    var muscleOk = !targetMuscles.length || targetMuscles.indexOf(e.muscle_primary) !== -1;
    return levelOk && muscleOk;
  });

  // Shuffle deterministically by seeding off goal+level
  var seed = goal.length + level.length;
  var shuffled = candidates.slice().sort(function(a, b) {
    return ((a.id.charCodeAt(0) + seed) % 7) - ((b.id.charCodeAt(0) + seed) % 7);
  });

  // Pick diverse exercises (one per muscle group first)
  var picked = [], seenMuscle = {};
  shuffled.forEach(function(e) {
    if (picked.length < numEx && !seenMuscle[e.muscle_primary]) {
      picked.push(e); seenMuscle[e.muscle_primary] = true;
    }
  });
  shuffled.forEach(function(e) {
    if (picked.length < numEx && picked.indexOf(e) === -1) picked.push(e);
  });
  picked = picked.slice(0, numEx);

  // Build weekly sessions with name variety
  var sessionNames = ['Push Power', 'Pull & Back', 'Core & Conditioning', 'Full Body', 'Lower Power', 'Athletic Circuit'];
  var sessions = [];
  for (var d = 0; d < days; d++) {
    sessions.push({
      day: d + 1,
      name: sessionNames[d % sessionNames.length],
      exerciseIds: picked.map(function(e) { return e.id; }),
    });
  }

  return {
    id:               'fb2_plan_' + Date.now(),
    goal:             goal,
    level:            level,
    path:             profile.path || 'preseason',
    daysPerWeek:      days,
    minutesPerSession: mins,
    exercises:        picked,
    sessions:         sessions,
    createdAt:        new Date().toISOString(),
  };
}

// ─── Expose namespace ─────────────────────────────────────────
A.FB2 = {
  K_PROFILE: K_PROFILE, K_PLAN: K_PLAN, K_LOG: K_LOG, K_SESSION: K_SESSION,
  getProfile2: getProfile2, saveProfile2: saveProfile2,
  getPlan2: getPlan2, savePlan2: savePlan2,
  getLog2: getLog2, appendLog2: appendLog2,
  getSession2: getSession2, saveSession2: saveSession2, clearSession2: clearSession2,
  FB2_MOTIVATIONS: FB2_MOTIVATIONS, FB2_GOALS: FB2_GOALS, FB2_LEVELS: FB2_LEVELS,
  FB2_BODY_FOCUS: FB2_BODY_FOCUS, FB2_PATHS: FB2_PATHS,
  FB2_SCHEDULE_OPTIONS: FB2_SCHEDULE_OPTIONS, FB2_DURATION_OPTIONS: FB2_DURATION_OPTIONS,
  FB2_PALETTE: FB2_PALETTE,
  getGoalMilestones: getGoalMilestones,
  generateFB2Plan: generateFB2Plan,
};

console.log('[SC] app-fitness-builder-2-data ready');
})();
