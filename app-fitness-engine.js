// ================================================================
// app-fitness-engine.js — SmartCrick Fitness Progression Engine v1.0
// The "professional training ecosystem" layer:
//   • Fitness Rank ladder (cricket-themed identity progression)
//   • Weekly training streak + loss-aversion habit loop
//   • Personal records (PRs) + completion history
//   • Auto-regulation (adapts next session to your last rating)
//   • Multi-week cricket Programs / Journeys with session unlocking
// Pure data layer — no UI. Persists via SC_APP.DB (localStorage + sync).
// ================================================================
(function () {
'use strict';
var A = window.SC_APP;
if (!A) { console.warn('[SC] fitness-engine: SC_APP not ready'); return; }
var DB = A.DB;

// ─── Date helpers ─────────────────────────────────────────────
function todayStr() { return new Date().toISOString().slice(0, 10); }
function daysAgoStr(n) {
  var d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
function startOfWeek() {
  // ISO-ish week starting Monday
  var d = new Date();
  var day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
}

// ─── Storage keys ─────────────────────────────────────────────
var K_LOG      = 'fitness_log';       // [{id,name,level,target,goal,minutes,xp,difficulty,ts}]
var K_RATINGS  = 'fitness_ratings';   // { workoutId: 'easy'|'perfect'|'hard' }
var K_PROGRAMS = 'fitness_programs';  // { programId: { startedAt, done:[sessionKey,...] } }

// ─── Fitness Rank ladder (cricket identity progression) ───────
// Mirrors the skill-path ladder so fitness feels part of the same journey.
var RANKS = [
  { id: 'rookie',     label: 'Net Rookie',        min: 0,   icon: '🌱', color: '#34d399', blurb: 'Building the base. Every champion starts here.' },
  { id: 'club',       label: 'Club Athlete',      min: 10,  icon: '⚡', color: '#60a5fa', blurb: 'Training is becoming a habit. Keep showing up.' },
  { id: 'district',   label: 'District Engine',   min: 25,  icon: '🔥', color: '#f59e0b', blurb: 'A real engine now — strength and stamina rising.' },
  { id: 'state',      label: 'State Powerhouse',  min: 50,  icon: '💪', color: '#f97316', blurb: 'Powerhouse conditioning. You train like a performer.' },
  { id: 'national',   label: 'National Machine',  min: 100, icon: '🏆', color: '#a78bfa', blurb: 'Elite-level work ethic. Few ever get here.' },
  { id: 'elite',      label: 'Elite Beast',       min: 200, icon: '💎', color: '#f472b6', blurb: 'A genuine athletic machine. Relentless.' },
];

function rankForCount(n) {
  var r = RANKS[0];
  for (var i = 0; i < RANKS.length; i++) if (n >= RANKS[i].min) r = RANKS[i];
  return r;
}
function nextRank(cur) {
  var idx = RANKS.indexOf(cur);
  return idx >= 0 && idx < RANKS.length - 1 ? RANKS[idx + 1] : null;
}

// ─── Log access ───────────────────────────────────────────────
function getLog()  { try { return DB.get(K_LOG) || []; } catch (e) { return []; } }
function saveLog(l){ try { DB.set(K_LOG, l.slice(-300)); } catch (e) {} }

// ─── Weekly training streak (consecutive weeks with ≥2 sessions) ─
function weeklyStreak(log) {
  if (!log.length) return 0;
  // group sessions into ISO weeks; count consecutive weeks (incl. this one) with >=2 sessions
  var byWeek = {};
  log.forEach(function (e) {
    var d = new Date(e.ts);
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    var wk = d.toISOString().slice(0, 10);
    byWeek[wk] = (byWeek[wk] || 0) + 1;
  });
  var streak = 0;
  var cursor = new Date(startOfWeek());
  for (var i = 0; i < 104; i++) {
    var wk = cursor.toISOString().slice(0, 10);
    if ((byWeek[wk] || 0) >= 2) { streak++; }
    else if (i === 0) { /* current week not yet at 2 — keep checking prior weeks */ }
    else break;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

// ─── Public stats ─────────────────────────────────────────────
function getStats() {
  var log = getLog();
  var prog = (DB.getProgress && DB.getProgress()) || {};
  var done = prog.workouts_done || log.length || 0;

  var weekStart = startOfWeek();
  var weekCount = log.filter(function (e) { return e.ts >= Date.parse(weekStart); }).length;
  var totalMinutes = log.reduce(function (s, e) { return s + (e.minutes || 0); }, 0);

  var rank = rankForCount(done);
  var nxt = nextRank(rank);
  var rankProgress = nxt ? Math.min(1, (done - rank.min) / (nxt.min - rank.min)) : 1;

  var last = log.length ? log[log.length - 1] : null;

  // longest hold PR (seconds) recorded by the player
  var prs = (function () { try { return DB.get('fitness_prs') || {}; } catch (e) { return {}; } })();

  return {
    workoutsDone: done,
    weekCount: weekCount,
    totalMinutes: totalMinutes,
    rank: rank,
    nextRank: nxt,
    rankProgress: rankProgress,
    weeklyStreak: weeklyStreak(log),
    lastWorkout: last,
    prs: prs,
    weeklyTarget: 3,
  };
}

// ─── Auto-regulation ──────────────────────────────────────────
// Returns an intensity delta for a workout based on the user's last
// difficulty rating:  too easy → +1 (harder),  too tough → -1 (easier).
function getAdjustment(workoutId) {
  try {
    var r = DB.get(K_RATINGS) || {};
    if (r[workoutId] === 'easy') return 1;
    if (r[workoutId] === 'hard') return -1;
  } catch (e) {}
  return 0;
}
function getRating(workoutId) {
  try { return (DB.get(K_RATINGS) || {})[workoutId] || null; } catch (e) { return null; }
}

// ─── Record a completed workout (fitness layer only) ──────────
// awardXP() in app-core already handles XP / streak / workouts_done.
// This stores the fitness-specific history, difficulty rating, PRs,
// and advances any active Program that contains this workout.
function recordWorkout(workout, info) {
  info = info || {};
  try {
    var log = getLog();
    log.push({
      id: workout.id, name: workout.name, level: workout.level,
      target: workout.target, goal: workout.goal,
      minutes: info.minutes || workout.duration_minutes || 0,
      xp: workout.xp_value || 0,
      difficulty: info.difficulty || 'perfect',
      ts: Date.now(),
    });
    saveLog(log);

    if (info.difficulty) {
      var r = DB.get(K_RATINGS) || {};
      r[workout.id] = info.difficulty;
      DB.set(K_RATINGS, r);
    }

    if (info.longestHold) {
      var prs = DB.get('fitness_prs') || {};
      if ((info.longestHold || 0) > (prs.longestHold || 0)) prs.longestHold = info.longestHold;
      DB.set('fitness_prs', prs);
    }

    advancePrograms(workout.id);
  } catch (e) { console.warn('[SC] recordWorkout', e); }
  return getStats();
}

// ================================================================
// PROGRAMS / JOURNEYS — multi-week cricket training paths
// Each session references a real workout id from A.WORKOUTS.
// Completing the matching workout marks that session done and
// unlocks the next one.  Week-over-week progression is provided by
// the auto-regulation engine + the user moving up the workout ladder.
// ================================================================
var PROGRAMS = [
  {
    id: 'foundations',
    title: 'Cricket Foundations',
    subtitle: '3 weeks · beginner base',
    icon: '🌱', color: '#34d399', grad: '#065f46,#059669',
    level: 'beginner',
    desc: 'Build the engine every cricketer needs: full-body strength, a stable core, and the habit of training. Three sessions a week, no equipment required.',
    weeks: [
      { label: 'Week 1 — Movement', sessions: ['wc005', 'wb001', 'wb008'] },
      { label: 'Week 2 — Strength',  sessions: ['wb007', 'wb006', 'wc010'] },
      { label: 'Week 3 — Engine',    sessions: ['wb010', 'wb018', 'wb011'] },
    ],
  },
  {
    id: 'fastbowler',
    title: 'Fast Bowler Engine',
    subtitle: '4 weeks · posterior chain & core',
    icon: '🎯', color: '#60a5fa', grad: '#1e40af,#3b82f6',
    level: 'intermediate',
    desc: 'Bowlers live and die by the posterior chain, anti-rotation core and shoulder durability. This block hardens the body against the repeated impact of a long spell.',
    weeks: [
      { label: 'Week 1 — Base',        sessions: ['wc001', 'wi007', 'wi004'] },
      { label: 'Week 2 — Rotation',    sessions: ['wc007', 'wi006', 'wi003'] },
      { label: 'Week 3 — Power',       sessions: ['wc001', 'wi009', 'wc007'] },
      { label: 'Week 4 — Conditioning',sessions: ['wi013', 'wi006', 'wc003'] },
    ],
  },
  {
    id: 'powerhitter',
    title: 'Power Hitter Block',
    subtitle: '4 weeks · rotational power & strength',
    icon: '💥', color: '#f97316', grad: '#c2410c,#ea580c',
    level: 'intermediate',
    desc: 'Six-hitting comes from the ground up: legs drive, hips rotate, core transfers, arms finish. This block builds explosive rotational power and the upper body to back it up.',
    weeks: [
      { label: 'Week 1 — Foundation', sessions: ['wc002', 'wi005', 'wi006'] },
      { label: 'Week 2 — Rotation',   sessions: ['wc007', 'wi001', 'wi005'] },
      { label: 'Week 3 — Power',      sessions: ['wc002', 'wi006', 'wi002'] },
      { label: 'Week 4 — Peak',       sessions: ['wc002', 'wc007', 'wi001'] },
    ],
  },
  {
    id: 'fielder',
    title: 'Fielding Athlete',
    subtitle: '4 weeks · speed, agility & power',
    icon: '⚡', color: '#a78bfa', grad: '#6d28d9,#9333ea',
    level: 'advanced',
    desc: 'Elite fielders are explosive, agile and never tired in the field. This advanced block builds change-of-direction speed, plyometric power and the conditioning to back it up.',
    weeks: [
      { label: 'Week 1 — Speed',       sessions: ['wc003', 'wc006', 'wa006'] },
      { label: 'Week 2 — Agility',     sessions: ['wc006', 'wa008', 'wc007'] },
      { label: 'Week 3 — Power',       sessions: ['wc008', 'wc006', 'wa007'] },
      { label: 'Week 4 — Game Fit',    sessions: ['wc015', 'wa010', 'wc006'] },
    ],
  },
];

// flatten a program's sessions to ordered keys "weekIdx:sessionIdx"
function programSessionList(program) {
  var out = [];
  program.weeks.forEach(function (wk, wi) {
    wk.sessions.forEach(function (sid, si) {
      out.push({ key: wi + ':' + si, week: wi, idx: si, label: wk.label, workoutId: sid });
    });
  });
  return out;
}

function getProgramState(programId) {
  var all = {};
  try { all = DB.get(K_PROGRAMS) || {}; } catch (e) {}
  return all[programId] || null;
}
function saveProgramState(programId, state) {
  var all = {};
  try { all = DB.get(K_PROGRAMS) || {}; } catch (e) {}
  all[programId] = state;
  DB.set(K_PROGRAMS, all);
}

function startProgram(programId) {
  var st = getProgramState(programId);
  if (!st) { st = { startedAt: Date.now(), done: [] }; saveProgramState(programId, st); }
  return st;
}

// When a workout is completed, mark the FIRST not-yet-done session of any
// started program that points at this workout id.
function advancePrograms(workoutId) {
  var all = {};
  try { all = DB.get(K_PROGRAMS) || {}; } catch (e) { return; }
  var changed = false;
  PROGRAMS.forEach(function (p) {
    var st = all[p.id];
    if (!st) return; // only advance started programs
    var sessions = programSessionList(p);
    for (var i = 0; i < sessions.length; i++) {
      if (sessions[i].workoutId === workoutId && st.done.indexOf(sessions[i].key) === -1) {
        st.done.push(sessions[i].key);
        changed = true;
        break;
      }
    }
  });
  if (changed) DB.set(K_PROGRAMS, all);
}

// progress summary for one program
function programProgress(program) {
  var st = getProgramState(program.id);
  var sessions = programSessionList(program);
  var doneCount = st ? st.done.length : 0;
  // next undone session
  var next = null;
  for (var i = 0; i < sessions.length; i++) {
    if (!st || st.done.indexOf(sessions[i].key) === -1) { next = sessions[i]; break; }
  }
  return {
    started: !!st,
    total: sessions.length,
    done: doneCount,
    pct: sessions.length ? doneCount / sessions.length : 0,
    next: next,
    complete: doneCount >= sessions.length,
    sessions: sessions,
    doneKeys: st ? st.done : [],
  };
}

// recommended next workout across the ecosystem
function getRecommended() {
  // prefer the next session of a started, incomplete program
  for (var i = 0; i < PROGRAMS.length; i++) {
    var st = getProgramState(PROGRAMS[i].id);
    if (st) {
      var pp = programProgress(PROGRAMS[i]);
      if (!pp.complete && pp.next) {
        return { type: 'program', program: PROGRAMS[i], session: pp.next, workoutId: pp.next.workoutId };
      }
    }
  }
  return null;
}

// ─── Export ───────────────────────────────────────────────────
A.FitnessEngine = {
  RANKS: RANKS,
  PROGRAMS: PROGRAMS,
  getStats: getStats,
  getAdjustment: getAdjustment,
  getRating: getRating,
  recordWorkout: recordWorkout,
  startProgram: startProgram,
  getProgramState: getProgramState,
  programProgress: programProgress,
  programSessionList: programSessionList,
  getRecommended: getRecommended,
  rankForCount: rankForCount,
};

console.log('[SC] app-fitness-engine v1.0 ready —', PROGRAMS.length, 'programs,', RANKS.length, 'ranks');
})();
