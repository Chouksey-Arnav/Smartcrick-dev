// app-intelligence.js v1.0
// ================================================================
// SmartCrick — Intelligence Aggregator (Module A: The Investment Loop)
// Transforms every user action into weighted intelligence deposits.
// Exposes: window.SC_INTEL
// ================================================================
(function () {
'use strict';

var A  = window.SC_APP;
var DB = A.DB;

var INTEL_KEY = 'intelligence_profile';

var DEFAULT_PROFILE = {
  drill_affinity: {
    category:   { batting:1.0, bowling:1.0, fielding:1.0, fitness:1.0, mental:1.0, wicketkeeping:1.0 },
    duration:   { short:1.0, medium:1.0, long:1.0 },
    difficulty: { beginner:1.0, intermediate:1.0, advanced:1.0 },
    time_of_day:{ morning:1.0, afternoon:1.0, evening:1.0, night:1.0 }
  },
  mental_affinity: {
    type:     { BREATH:1.0, GROUND:1.0, VISUALIZE:1.0, ACTIVATE:1.0, RECOVER:1.0, REFLECT:1.0, PRESSURE:1.0 },
    duration: { short:1.0, medium:1.0, long:1.0 }
  },
  patterns: {
    peak_hour:           null,
    best_day_of_week:    null,
    best_session_length: null,
    consistency_rhythm:  null,
    intensity_preference: 0.5
  },
  submodel: {
    drill_elo:    {},
    category_elo: {}
  },
  calibration: {
    total_cycles:            0,
    preference_signals:      0,
    performance_data_points: 0,
    biomechanical_analyses:  0,
    mental_calibrations:     0,
    days_of_behavioral_data: 0,
    first_interaction_date:  null,
    confidence_score:        0,
    last_updated:            null
  }
};

// ── Helpers ────────────────────────────────────────────────────────
function deepMergeDefaults(def, saved) {
  var result = JSON.parse(JSON.stringify(def));
  if (!saved) return result;
  function merge(base, src) {
    Object.keys(src).forEach(function (k) {
      if (src[k] !== null && typeof src[k] === 'object' && !Array.isArray(src[k])
          && base[k] !== undefined && typeof base[k] === 'object') {
        merge(base[k], src[k]);
      } else {
        base[k] = src[k];
      }
    });
  }
  merge(result, saved);
  return result;
}

function getProfile() {
  return deepMergeDefaults(DEFAULT_PROFILE, DB.get(INTEL_KEY));
}

function saveProfile(p) {
  p.calibration.last_updated = new Date().toISOString();
  DB.set(INTEL_KEY, p);
}

function getHourSlot() {
  var hr = new Date().getHours();
  if (hr >= 5  && hr < 12) return 'morning';
  if (hr >= 12 && hr < 18) return 'afternoon';
  if (hr >= 18 && hr < 22) return 'evening';
  return 'night';
}

function getDurationSlot(minutes) {
  if (!minutes) return 'medium';
  if (minutes < 20) return 'short';
  if (minutes <= 40) return 'medium';
  return 'long';
}

function normaliseDiff(raw) {
  if (!raw) return 'beginner';
  var s = (raw + '').toLowerCase();
  if (s.indexOf('advanced') !== -1) return 'advanced';
  if (s.indexOf('inter')    !== -1) return 'intermediate';
  return 'beginner';
}

// Exponential Moving Average drift — positive interaction
function affinityUp(cur)   { return cur * 0.92 + 1.1 * 0.08; }
// Slight passive decay for non-visited categories
function affinityDown(cur) { return cur * 0.92 + 0.9 * 0.08; }

// ── Score ──────────────────────────────────────────────────────────
function computeConfidenceScore(cal) {
  var s  = Math.min(40, (cal.total_cycles            / 200) * 40);
  s     += Math.min(20, (cal.preference_signals      /  30) * 20);
  s     += Math.min(15, (cal.performance_data_points /  20) * 15);
  s     += Math.min(15, (cal.days_of_behavioral_data /  90) * 15);
  s     += Math.min(10, (cal.biomechanical_analyses  /   5) * 10);
  return Math.round(s);
}

function getCalibrationLabel(score) {
  if (score >= 80) return 'Expert';
  if (score >= 55) return 'Calibrated';
  if (score >= 25) return 'Calibrating';
  return 'Warming Up';
}

// ── Pattern Computation ────────────────────────────────────────────
function computePatterns(p) {
  try {
    var xpLog = DB.getXPLog ? DB.getXPLog() : [];
    // Days of behavioral data
    if (p.calibration.first_interaction_date) {
      p.calibration.days_of_behavioral_data = Math.max(0,
        Math.floor((Date.now() - new Date(p.calibration.first_interaction_date).getTime()) / 86400000)
      );
    }
    if (xpLog.length < 7) return;

    // Peak hour (most XP earned by clock hour)
    var hourXP = {};
    xpLog.forEach(function (e) {
      if (!e.ts) return;
      var hr = new Date(e.ts).getHours();
      hourXP[hr] = (hourXP[hr] || 0) + (e.xp || 0);
    });
    var peakHr = 0, peakVal = 0;
    Object.keys(hourXP).forEach(function (hr) {
      if (hourXP[hr] > peakVal) { peakVal = hourXP[hr]; peakHr = parseInt(hr, 10); }
    });
    p.patterns.peak_hour = peakHr;

    if (xpLog.length < 14) return;

    // Best day of week
    var dayXP = [0,0,0,0,0,0,0];
    xpLog.forEach(function (e) {
      if (!e.date) return;
      var dow = new Date(e.date + 'T12:00:00').getDay();
      dayXP[dow] += (e.xp || 0);
    });
    var bestDay = 0, bestDayXP = 0;
    dayXP.forEach(function (xp, i) { if (xp > bestDayXP) { bestDayXP = xp; bestDay = i; } });
    p.patterns.best_day_of_week = bestDay;

    // Consistency rhythm (last 30 days)
    var today = new Date().toISOString().slice(0, 10);
    var activeDates = {};
    xpLog.filter(function (e) { return e.date && e.date <= today; })
         .slice(-60).forEach(function (e) { activeDates[e.date] = true; });
    var uniqueDays = Object.keys(activeDates).length;
    var dayRatio = uniqueDays / 30;
    if (dayRatio >= 0.85) {
      p.patterns.consistency_rhythm = 'daily';
    } else if (dayRatio >= 0.5) {
      p.patterns.consistency_rhythm = 'every-other';
    } else {
      var wdCount = 0, weCount = 0;
      Object.keys(activeDates).forEach(function (ds) {
        var dow = new Date(ds + 'T12:00:00').getDay();
        if (dow === 0 || dow === 6) weCount++; else wdCount++;
      });
      p.patterns.consistency_rhythm = wdCount > weCount * 2 ? 'weekday' : 'weekend-warrior';
    }
  } catch (e) { console.warn('[SC Intel] pattern:', e); }
}

// ── Update Hooks ───────────────────────────────────────────────────
function updateOnDrill(drill) {
  var p = getProfile();
  if (!p.calibration.first_interaction_date)
    p.calibration.first_interaction_date = new Date().toISOString();
  p.calibration.total_cycles++;

  if (drill) {
    var cat  = drill.category || 'batting';
    var diff = normaliseDiff(drill.difficulty || drill.skill_level);
    var dur  = getDurationSlot(drill.duration_minutes);

    // Category affinity: boost visited, slight decay on others
    if (p.drill_affinity.category[cat] !== undefined) {
      p.drill_affinity.category[cat] = affinityUp(p.drill_affinity.category[cat]);
      Object.keys(p.drill_affinity.category).forEach(function (c) {
        if (c !== cat) p.drill_affinity.category[c] = affinityDown(p.drill_affinity.category[c]);
      });
    }
    // Difficulty
    if (p.drill_affinity.difficulty[diff] !== undefined) {
      p.drill_affinity.difficulty[diff] = affinityUp(p.drill_affinity.difficulty[diff]);
    }
    // Intensity drift
    p.patterns.intensity_preference =
      diff === 'advanced'     ? Math.min(1.0, p.patterns.intensity_preference + 0.02) :
      diff === 'beginner'     ? Math.max(0.0, p.patterns.intensity_preference - 0.01) :
      p.patterns.intensity_preference;
    // Duration
    if (p.drill_affinity.duration[dur] !== undefined) {
      p.drill_affinity.duration[dur] = affinityUp(p.drill_affinity.duration[dur]);
    }
    // Per-drill Elo (slight boost on completion)
    if (!p.submodel.drill_elo[drill.id]) p.submodel.drill_elo[drill.id] = 1200;
    p.submodel.drill_elo[drill.id] = Math.min(2000, p.submodel.drill_elo[drill.id] + 8);
    if (!p.submodel.category_elo[cat]) p.submodel.category_elo[cat] = 1200;
    p.submodel.category_elo[cat] = Math.min(2000, p.submodel.category_elo[cat] + 5);
  }

  // Time-of-day affinity
  var slot = getHourSlot();
  p.drill_affinity.time_of_day[slot] = affinityUp(p.drill_affinity.time_of_day[slot]);

  computePatterns(p);
  p.calibration.confidence_score = computeConfidenceScore(p.calibration);
  saveProfile(p);
}

function updateOnMental(sessionType, rating) {
  var p = getProfile();
  if (!p.calibration.first_interaction_date)
    p.calibration.first_interaction_date = new Date().toISOString();
  p.calibration.total_cycles++;
  p.calibration.mental_calibrations++;

  if (sessionType && p.mental_affinity.type[sessionType] !== undefined) {
    if (rating && rating >= 4)      p.mental_affinity.type[sessionType] = affinityUp(p.mental_affinity.type[sessionType]);
    else if (rating && rating <= 2) p.mental_affinity.type[sessionType] = affinityDown(p.mental_affinity.type[sessionType]);
    else                            p.mental_affinity.type[sessionType] = affinityUp(p.mental_affinity.type[sessionType]);
  }

  var slot = getHourSlot();
  p.drill_affinity.time_of_day[slot] = affinityUp(p.drill_affinity.time_of_day[slot]);

  computePatterns(p);
  p.calibration.confidence_score = computeConfidenceScore(p.calibration);
  saveProfile(p);
}

function updateOnMatch() {
  var p = getProfile();
  if (!p.calibration.first_interaction_date)
    p.calibration.first_interaction_date = new Date().toISOString();
  p.calibration.total_cycles++;
  p.calibration.performance_data_points++;
  computePatterns(p);
  p.calibration.confidence_score = computeConfidenceScore(p.calibration);
  saveProfile(p);
}

function updateOnVideo() {
  var p = getProfile();
  if (!p.calibration.first_interaction_date)
    p.calibration.first_interaction_date = new Date().toISOString();
  p.calibration.total_cycles++;
  p.calibration.biomechanical_analyses++;
  computePatterns(p);
  p.calibration.confidence_score = computeConfidenceScore(p.calibration);
  saveProfile(p);
}

function updateOnPreference(winnerId, loserId, winnerCat, loserCat) {
  var p = getProfile();
  if (!p.calibration.first_interaction_date)
    p.calibration.first_interaction_date = new Date().toISOString();
  p.calibration.preference_signals++;
  p.calibration.total_cycles++;

  // Elo update on drill level
  var K = 32;
  var wElo = p.submodel.drill_elo[winnerId] || 1200;
  var lElo = p.submodel.drill_elo[loserId]  || 1200;
  var expected = 1 / (1 + Math.pow(10, (lElo - wElo) / 400));
  p.submodel.drill_elo[winnerId] = Math.round(Math.min(2400, wElo + K * (1 - expected)));
  p.submodel.drill_elo[loserId]  = Math.round(Math.max(400,  lElo + K * (0 - (1 - expected))));

  // Category Elo
  if (winnerCat && p.submodel.category_elo[winnerCat] !== undefined) {
    var wcElo = p.submodel.category_elo[winnerCat] || 1200;
    var lcElo = p.submodel.category_elo[loserCat]  || 1200;
    var expC  = 1 / (1 + Math.pow(10, (lcElo - wcElo) / 400));
    p.submodel.category_elo[winnerCat] = Math.round(Math.min(2400, wcElo + K * (1 - expC)));
    if (loserCat) p.submodel.category_elo[loserCat] = Math.round(Math.max(400, lcElo + K * (0 - (1 - expC))));
  }

  computePatterns(p);
  p.calibration.confidence_score = computeConfidenceScore(p.calibration);
  saveProfile(p);
}

// ── Query helpers ──────────────────────────────────────────────────
function getCalibrationScore() { return getProfile().calibration.confidence_score || 0; }

function getTopCategory(categoryAffinities) {
  var top = 'batting', topVal = 0;
  Object.keys(categoryAffinities).forEach(function (c) {
    if (categoryAffinities[c] > topVal) { topVal = categoryAffinities[c]; top = c; }
  });
  return top;
}

function getTopMentalType(typeAffinities) {
  var top = 'VISUALIZE', topVal = 0;
  Object.keys(typeAffinities).forEach(function (t) {
    if (typeAffinities[t] > topVal) { topVal = typeAffinities[t]; top = t; }
  });
  return top;
}

function formatHour(hr) {
  if (hr === null || hr === undefined) return null;
  var ampm = hr >= 12 ? 'PM' : 'AM';
  var h12  = hr % 12 || 12;
  var end  = (hr + 2) % 24;
  var eampm = end >= 12 ? 'PM' : 'AM';
  var e12  = end % 12 || 12;
  return h12 + ' ' + ampm + '–' + e12 + ' ' + eampm;
}

function formatDay(dow) {
  return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][dow] || null;
}

function getInsights() {
  var p   = getProfile();
  var cal = p.calibration;
  var out = [];

  if (p.patterns.peak_hour !== null && cal.total_cycles >= 10) {
    out.push('Peak training window: ' + formatHour(p.patterns.peak_hour) + ' (based on ' + cal.total_cycles + ' sessions)');
  }
  if (p.patterns.best_day_of_week !== null && cal.total_cycles >= 14) {
    out.push('Best training day: ' + formatDay(p.patterns.best_day_of_week));
  }
  if (cal.total_cycles >= 5) {
    var topCat = getTopCategory(p.drill_affinity.category);
    out.push(topCat.charAt(0).toUpperCase() + topCat.slice(1) + ' drills resonate most with your style');
  }
  if (cal.mental_calibrations >= 3) {
    var topMental = getTopMentalType(p.mental_affinity.type);
    var MN = { BREATH:'Breathing', GROUND:'Grounding', VISUALIZE:'Visualization',
               ACTIVATE:'Activation', RECOVER:'Recovery', REFLECT:'Reflection', PRESSURE:'Pressure Management' };
    out.push('Mental affinity: ' + (MN[topMental] || topMental) + ' sessions');
  }
  if (cal.total_cycles >= 15) {
    out.push('Training intensity preference: ' + Math.round(p.patterns.intensity_preference * 100) + 'th percentile');
  }
  if (p.patterns.consistency_rhythm && cal.days_of_behavioral_data >= 14) {
    var RL = {
      'daily':           'You train every day — elite consistency',
      'every-other':     'You follow an every-other-day rhythm',
      'weekday':         'Your training peaks on weekdays',
      'weekend-warrior': 'You show weekend training spikes'
    };
    var msg = RL[p.patterns.consistency_rhythm];
    if (msg) out.push(msg);
  }
  return out;
}

function getSmartSuggestion() {
  var p   = getProfile();
  var cal = p.calibration;
  if (cal.confidence_score < 10) return null;

  var topCat   = getTopCategory(p.drill_affinity.category);
  var catLabel = topCat.charAt(0).toUpperCase() + topCat.slice(1);

  if (p.patterns.peak_hour !== null && cal.total_cycles >= 20) {
    return 'Your AI knows you perform best at ' + formatHour(p.patterns.peak_hour) +
           '. Schedule your ' + catLabel + ' session then for maximum gains.';
  }
  return 'Based on ' + cal.total_cycles + ' sessions, your AI recommends ' + catLabel + ' drills today.';
}

function getPersonalizedRanking(drills) {
  if (!drills || !drills.length) return drills;
  var p    = getProfile();
  var da   = p.drill_affinity;
  var slot = getHourSlot();
  return drills.slice().sort(function (a, b) {
    function score(d) {
      var s = 1.0;
      s *= (da.category[d.category] || 1.0);
      s *= (da.difficulty[normaliseDiff(d.difficulty || d.skill_level)] || 1.0);
      s *= (da.duration[getDurationSlot(d.duration_minutes)] || 1.0);
      s *= (da.time_of_day[slot] || 1.0);
      if (p.submodel.drill_elo[d.id]) s *= (p.submodel.drill_elo[d.id] / 1200);
      return s;
    }
    return score(b) - score(a);
  });
}

// ── Public API ─────────────────────────────────────────────────────
window.SC_INTEL = {
  getProfile:              getProfile,
  updateOnDrill:           updateOnDrill,
  updateOnMental:          updateOnMental,
  updateOnMatch:           updateOnMatch,
  updateOnVideo:           updateOnVideo,
  updateOnPreference:      updateOnPreference,
  getCalibrationScore:     getCalibrationScore,
  getCalibrationLabel:     getCalibrationLabel,
  getInsights:             getInsights,
  getSmartSuggestion:      getSmartSuggestion,
  getPersonalizedRanking:  getPersonalizedRanking,
  getTopCategory:          getTopCategory,
  getTopMentalType:        getTopMentalType,
  formatHour:              formatHour,
  formatDay:               formatDay,
};

console.log('[SC] app-intelligence v1.0 — Intelligence Aggregator ready');
})();
