// Save as: app-brain-engine.js
// ================================================================
// SmartCrick AI — Brain Engine v1.0
// Neural models: StylePredictor, ProMatcher, DrillAdaptor, MentalReadiness
// Plain IIFE, no npm, no build step. Brain.js loaded via SC.LibLoader.
// ================================================================
(function () {
  'use strict';

  var A = window.SC_APP;
  if (!A) { console.error('[SC] app-brain-engine: SC_APP not found'); return; }

  var DB = A.DB;
  var MODEL_NAMES = ['StylePredictor', 'ProMatcher', 'DrillAdaptor', 'MentalReadiness'];

  var _nets = {};
  var _seeded = {};
  var _userSamples = {};

  var RETRAIN_THRESHOLD = 10;
  var RETRAIN_INCREMENT = 5;
  var MAX_STORED_SAMPLES = 200;

  // ── Model Configs ─────────────────────────────────────────────────
  var MODEL_CONFIGS = {
    StylePredictor:  { hiddenLayers: [10, 6],       activation: 'sigmoid', learningRate: 0.3 },
    ProMatcher:      { hiddenLayers: [16, 10, 6],   activation: 'sigmoid', learningRate: 0.3 },
    DrillAdaptor:    { hiddenLayers: [8, 5],         activation: 'sigmoid', learningRate: 0.3 },
    MentalReadiness: { hiddenLayers: [10, 7],        activation: 'sigmoid', learningRate: 0.3 }
  };

  // ── Pre-seeded Training Data ──────────────────────────────────────
  var SEED_DATA = {
    StylePredictor: [
      // Kohli-type: high technique, consistency
      { input: { batting_ratio:0.7, bowling_ratio:0.0, mental_ratio:0.4, xp_velocity:0.8, consistency:0.9, level_norm:0.7, age_norm:0.5, streak_health:0.9 }, output: { aggressive:0.6, technical:0.95, versatile:0.5, mental_dominant:0.7 } },
      // Warner-type: aggressive opener
      { input: { batting_ratio:0.8, bowling_ratio:0.0, mental_ratio:0.2, xp_velocity:0.9, consistency:0.6, level_norm:0.7, age_norm:0.5, streak_health:0.7 }, output: { aggressive:0.95, technical:0.5, versatile:0.4, mental_dominant:0.3 } },
      // Stokes-type: allrounder
      { input: { batting_ratio:0.4, bowling_ratio:0.4, mental_ratio:0.4, xp_velocity:0.7, consistency:0.7, level_norm:0.8, age_norm:0.4, streak_health:0.7 }, output: { aggressive:0.8, technical:0.7, versatile:0.95, mental_dominant:0.6 } },
      // Dhoni-type: mental dominant
      { input: { batting_ratio:0.3, bowling_ratio:0.0, mental_ratio:0.7, xp_velocity:0.6, consistency:0.95, level_norm:0.9, age_norm:0.6, streak_health:0.95 }, output: { aggressive:0.5, technical:0.7, versatile:0.7, mental_dominant:0.98 } },
      // Spin bowler: technical accuracy
      { input: { batting_ratio:0.1, bowling_ratio:0.8, mental_ratio:0.3, xp_velocity:0.6, consistency:0.7, level_norm:0.6, age_norm:0.5, streak_health:0.6 }, output: { aggressive:0.2, technical:0.8, versatile:0.3, mental_dominant:0.5 } },
      // T20 hitter: aggressive
      { input: { batting_ratio:0.7, bowling_ratio:0.1, mental_ratio:0.2, xp_velocity:0.9, consistency:0.5, level_norm:0.6, age_norm:0.3, streak_health:0.5 }, output: { aggressive:0.9, technical:0.4, versatile:0.6, mental_dominant:0.2 } },
      // Young beginner: low all round
      { input: { batting_ratio:0.5, bowling_ratio:0.2, mental_ratio:0.2, xp_velocity:0.3, consistency:0.2, level_norm:0.1, age_norm:0.1, streak_health:0.2 }, output: { aggressive:0.4, technical:0.3, versatile:0.3, mental_dominant:0.2 } },
      // Inconsistent player: erratic
      { input: { batting_ratio:0.6, bowling_ratio:0.1, mental_ratio:0.1, xp_velocity:0.5, consistency:0.1, level_norm:0.4, age_norm:0.4, streak_health:0.1 }, output: { aggressive:0.6, technical:0.3, versatile:0.3, mental_dominant:0.1 } },
      // Mental focus: meditation, calm
      { input: { batting_ratio:0.2, bowling_ratio:0.1, mental_ratio:0.8, xp_velocity:0.4, consistency:0.8, level_norm:0.5, age_norm:0.5, streak_health:0.8 }, output: { aggressive:0.2, technical:0.5, versatile:0.4, mental_dominant:0.9 } },
      // Fitness focus: high xp velocity, low mental
      { input: { batting_ratio:0.3, bowling_ratio:0.2, mental_ratio:0.1, xp_velocity:0.95, consistency:0.6, level_norm:0.5, age_norm:0.35, streak_health:0.6 }, output: { aggressive:0.7, technical:0.4, versatile:0.6, mental_dominant:0.2 } },
      // Senior experienced player
      { input: { batting_ratio:0.4, bowling_ratio:0.3, mental_ratio:0.5, xp_velocity:0.5, consistency:0.85, level_norm:0.9, age_norm:0.8, streak_health:0.85 }, output: { aggressive:0.4, technical:0.8, versatile:0.75, mental_dominant:0.8 } },
      // Fast bowler: aggressive, lower batting
      { input: { batting_ratio:0.15, bowling_ratio:0.85, mental_ratio:0.2, xp_velocity:0.7, consistency:0.6, level_norm:0.7, age_norm:0.4, streak_health:0.6 }, output: { aggressive:0.85, technical:0.6, versatile:0.3, mental_dominant:0.3 } },
      // WK batsman: versatile
      { input: { batting_ratio:0.5, bowling_ratio:0.0, mental_ratio:0.4, xp_velocity:0.65, consistency:0.75, level_norm:0.65, age_norm:0.45, streak_health:0.7 }, output: { aggressive:0.55, technical:0.7, versatile:0.8, mental_dominant:0.65 } },
      // Opening bat: consistent, technically sound
      { input: { batting_ratio:0.75, bowling_ratio:0.0, mental_ratio:0.35, xp_velocity:0.7, consistency:0.8, level_norm:0.75, age_norm:0.5, streak_health:0.8 }, output: { aggressive:0.5, technical:0.85, versatile:0.55, mental_dominant:0.6 } },
      // Low XP, low engagement player
      { input: { batting_ratio:0.3, bowling_ratio:0.3, mental_ratio:0.3, xp_velocity:0.1, consistency:0.1, level_norm:0.2, age_norm:0.3, streak_health:0.1 }, output: { aggressive:0.3, technical:0.2, versatile:0.3, mental_dominant:0.2 } }
    ],
    ProMatcher: [
      // Pure batsman
      { input: { batting:0.9, bowling:0.1, fielding:0.5, fitness:0.6, mental:0.5, consistency:0.7 }, output: { batsman_type:0.95, bowler_type:0.05, allrounder_type:0.2, keeper_type:0.1 } },
      // Pure bowler
      { input: { batting:0.1, bowling:0.9, fielding:0.5, fitness:0.7, mental:0.5, consistency:0.65 }, output: { batsman_type:0.05, bowler_type:0.95, allrounder_type:0.2, keeper_type:0.05 } },
      // Allrounder
      { input: { batting:0.7, bowling:0.7, fielding:0.7, fitness:0.8, mental:0.6, consistency:0.7 }, output: { batsman_type:0.5, bowler_type:0.5, allrounder_type:0.95, keeper_type:0.1 } },
      // Wicketkeeper
      { input: { batting:0.6, bowling:0.05, fielding:0.95, fitness:0.7, mental:0.75, consistency:0.8 }, output: { batsman_type:0.4, bowler_type:0.05, allrounder_type:0.35, keeper_type:0.95 } },
      // Batting allrounder
      { input: { batting:0.8, bowling:0.5, fielding:0.6, fitness:0.7, mental:0.6, consistency:0.65 }, output: { batsman_type:0.7, bowler_type:0.3, allrounder_type:0.8, keeper_type:0.05 } },
      // Bowling allrounder
      { input: { batting:0.5, bowling:0.8, fielding:0.6, fitness:0.75, mental:0.55, consistency:0.6 }, output: { batsman_type:0.3, bowler_type:0.7, allrounder_type:0.8, keeper_type:0.05 } },
      // Beginner: even low skills
      { input: { batting:0.3, bowling:0.3, fielding:0.3, fitness:0.4, mental:0.3, consistency:0.2 }, output: { batsman_type:0.3, bowler_type:0.3, allrounder_type:0.3, keeper_type:0.1 } },
      // Top order bat: high batting, fitness
      { input: { batting:0.85, bowling:0.15, fielding:0.6, fitness:0.8, mental:0.65, consistency:0.75 }, output: { batsman_type:0.9, bowler_type:0.1, allrounder_type:0.3, keeper_type:0.1 } },
      // Spin bowling specialist
      { input: { batting:0.2, bowling:0.85, fielding:0.55, fitness:0.55, mental:0.7, consistency:0.7 }, output: { batsman_type:0.1, bowler_type:0.9, allrounder_type:0.15, keeper_type:0.05 } },
      // Fast bowler
      { input: { batting:0.15, bowling:0.88, fielding:0.5, fitness:0.9, mental:0.5, consistency:0.6 }, output: { batsman_type:0.1, bowler_type:0.92, allrounder_type:0.15, keeper_type:0.05 } },
      // Finisher bat: aggressive, mental strong
      { input: { batting:0.75, bowling:0.1, fielding:0.55, fitness:0.7, mental:0.85, consistency:0.7 }, output: { batsman_type:0.88, bowler_type:0.05, allrounder_type:0.25, keeper_type:0.15 } },
      // Fielding specialist
      { input: { batting:0.4, bowling:0.3, fielding:0.95, fitness:0.85, mental:0.6, consistency:0.65 }, output: { batsman_type:0.2, bowler_type:0.2, allrounder_type:0.45, keeper_type:0.5 } },
      // High mental, moderate skills
      { input: { batting:0.55, bowling:0.2, fielding:0.6, fitness:0.6, mental:0.9, consistency:0.85 }, output: { batsman_type:0.5, bowler_type:0.15, allrounder_type:0.4, keeper_type:0.45 } },
      // Low fitness, high batting
      { input: { batting:0.8, bowling:0.2, fielding:0.4, fitness:0.3, mental:0.5, consistency:0.5 }, output: { batsman_type:0.8, bowler_type:0.15, allrounder_type:0.3, keeper_type:0.1 } },
      // Low consistency, high skill
      { input: { batting:0.7, bowling:0.7, fielding:0.6, fitness:0.7, mental:0.4, consistency:0.15 }, output: { batsman_type:0.5, bowler_type:0.5, allrounder_type:0.7, keeper_type:0.1 } },
      // Keeper batsman: strong mental + fielding
      { input: { batting:0.7, bowling:0.05, fielding:0.9, fitness:0.65, mental:0.8, consistency:0.75 }, output: { batsman_type:0.6, bowler_type:0.05, allrounder_type:0.3, keeper_type:0.92 } },
      // Utility player: average all round
      { input: { batting:0.55, bowling:0.5, fielding:0.6, fitness:0.6, mental:0.55, consistency:0.55 }, output: { batsman_type:0.4, bowler_type:0.4, allrounder_type:0.7, keeper_type:0.2 } },
      // Youth prodigy: high xp / potential
      { input: { batting:0.65, bowling:0.6, fielding:0.65, fitness:0.75, mental:0.5, consistency:0.4 }, output: { batsman_type:0.45, bowler_type:0.45, allrounder_type:0.75, keeper_type:0.1 } },
      // Senior specialist bat
      { input: { batting:0.88, bowling:0.05, fielding:0.45, fitness:0.5, mental:0.75, consistency:0.88 }, output: { batsman_type:0.95, bowler_type:0.05, allrounder_type:0.2, keeper_type:0.05 } },
      // Medium pace allrounder
      { input: { batting:0.6, bowling:0.65, fielding:0.6, fitness:0.75, mental:0.55, consistency:0.6 }, output: { batsman_type:0.4, bowler_type:0.5, allrounder_type:0.88, keeper_type:0.08 } }
    ],
    DrillAdaptor: [
      // Easy drill, high score, should advance
      { input: { recent_score:0.95, attempt_norm:0.2, days_since:0.1, tier_norm:0.2, level_norm:0.6, role_batting:1, role_bowling:0 }, output: { shouldRetry:0.1, shouldAdvance:0.9, relevance_boost:0.7 } },
      // Hard drill, low score, should retry
      { input: { recent_score:0.2, attempt_norm:0.3, days_since:0.2, tier_norm:0.8, level_norm:0.4, role_batting:1, role_bowling:0 }, output: { shouldRetry:0.9, shouldAdvance:0.05, relevance_boost:0.5 } },
      // Not attempted in a while, relevant
      { input: { recent_score:0.5, attempt_norm:0.05, days_since:0.9, tier_norm:0.4, level_norm:0.5, role_batting:0, role_bowling:1 }, output: { shouldRetry:0.7, shouldAdvance:0.2, relevance_boost:0.9 } },
      // Good score, many attempts, advance
      { input: { recent_score:0.8, attempt_norm:0.7, days_since:0.2, tier_norm:0.4, level_norm:0.7, role_batting:1, role_bowling:1 }, output: { shouldRetry:0.2, shouldAdvance:0.85, relevance_boost:0.6 } },
      // Moderate score, low attempts
      { input: { recent_score:0.55, attempt_norm:0.1, days_since:0.3, tier_norm:0.4, level_norm:0.5, role_batting:1, role_bowling:0 }, output: { shouldRetry:0.6, shouldAdvance:0.2, relevance_boost:0.65 } },
      // High tier, high level, advancing
      { input: { recent_score:0.75, attempt_norm:0.4, days_since:0.1, tier_norm:0.8, level_norm:0.9, role_batting:0, role_bowling:1 }, output: { shouldRetry:0.15, shouldAdvance:0.8, relevance_boost:0.7 } },
      // Low tier, beginner
      { input: { recent_score:0.6, attempt_norm:0.2, days_since:0.5, tier_norm:0.2, level_norm:0.2, role_batting:1, role_bowling:0 }, output: { shouldRetry:0.4, shouldAdvance:0.5, relevance_boost:0.6 } },
      // Off-role drill (batting drill for bowler)
      { input: { recent_score:0.5, attempt_norm:0.3, days_since:0.4, tier_norm:0.4, level_norm:0.5, role_batting:0, role_bowling:1 }, output: { shouldRetry:0.4, shouldAdvance:0.3, relevance_boost:0.3 } },
      // High score, long time since
      { input: { recent_score:0.88, attempt_norm:0.5, days_since:0.85, tier_norm:0.6, level_norm:0.6, role_batting:1, role_bowling:0 }, output: { shouldRetry:0.5, shouldAdvance:0.6, relevance_boost:0.85 } },
      // Failed many attempts, needs retry
      { input: { recent_score:0.35, attempt_norm:0.9, days_since:0.1, tier_norm:0.6, level_norm:0.5, role_batting:1, role_bowling:1 }, output: { shouldRetry:0.8, shouldAdvance:0.05, relevance_boost:0.4 } }
    ],
    MentalReadiness: [
      // Morning, good streak, high readiness
      { input: { hour_norm:0.33, streak_health:0.8, weekly_xp_trend:0.7, recent_rating_avg:0.8, age_norm:0.4, role_norm:0.0, days_since_mental:0.5 }, output: { BREATH:0.5, GROUND:0.3, VISUALIZE:0.85, ACTIVATE:0.9, RECOVER:0.2, REFLECT:0.4, PRESSURE:0.7 } },
      // Evening, low streak, needs recovery
      { input: { hour_norm:0.75, streak_health:0.2, weekly_xp_trend:0.3, recent_rating_avg:0.4, age_norm:0.4, role_norm:0.5, days_since_mental:0.8 }, output: { BREATH:0.85, GROUND:0.8, VISUALIZE:0.4, ACTIVATE:0.3, RECOVER:0.9, REFLECT:0.7, PRESSURE:0.3 } },
      // Pre-match pressure
      { input: { hour_norm:0.4, streak_health:0.6, weekly_xp_trend:0.6, recent_rating_avg:0.7, age_norm:0.5, role_norm:0.0, days_since_mental:0.2 }, output: { BREATH:0.8, GROUND:0.75, VISUALIZE:0.9, ACTIVATE:0.8, RECOVER:0.2, REFLECT:0.3, PRESSURE:0.95 } },
      // Regular training day
      { input: { hour_norm:0.5, streak_health:0.5, weekly_xp_trend:0.5, recent_rating_avg:0.6, age_norm:0.4, role_norm:0.33, days_since_mental:0.4 }, output: { BREATH:0.5, GROUND:0.5, VISUALIZE:0.6, ACTIVATE:0.6, RECOVER:0.4, REFLECT:0.5, PRESSURE:0.5 } },
      // Young player, needs grounding
      { input: { hour_norm:0.5, streak_health:0.3, weekly_xp_trend:0.4, recent_rating_avg:0.5, age_norm:0.1, role_norm:0.0, days_since_mental:0.9 }, output: { BREATH:0.7, GROUND:0.9, VISUALIZE:0.5, ACTIVATE:0.5, RECOVER:0.5, REFLECT:0.6, PRESSURE:0.4 } },
      // Late night, reflect mode
      { input: { hour_norm:0.9, streak_health:0.7, weekly_xp_trend:0.6, recent_rating_avg:0.7, age_norm:0.5, role_norm:0.67, days_since_mental:0.3 }, output: { BREATH:0.6, GROUND:0.5, VISUALIZE:0.3, ACTIVATE:0.2, RECOVER:0.7, REFLECT:0.95, PRESSURE:0.3 } },
      // High performer: activate, visualize
      { input: { hour_norm:0.45, streak_health:0.95, weekly_xp_trend:0.9, recent_rating_avg:0.9, age_norm:0.5, role_norm:0.33, days_since_mental:0.1 }, output: { BREATH:0.4, GROUND:0.3, VISUALIZE:0.9, ACTIVATE:0.95, RECOVER:0.2, REFLECT:0.5, PRESSURE:0.8 } },
      // Bowler under pressure
      { input: { hour_norm:0.4, streak_health:0.5, weekly_xp_trend:0.5, recent_rating_avg:0.6, age_norm:0.4, role_norm:0.67, days_since_mental:0.5 }, output: { BREATH:0.75, GROUND:0.65, VISUALIZE:0.8, ACTIVATE:0.7, RECOVER:0.3, REFLECT:0.4, PRESSURE:0.9 } },
      // Post-loss: recovery, reflection
      { input: { hour_norm:0.6, streak_health:0.2, weekly_xp_trend:0.2, recent_rating_avg:0.25, age_norm:0.4, role_norm:0.0, days_since_mental:0.6 }, output: { BREATH:0.9, GROUND:0.85, VISUALIZE:0.3, ACTIVATE:0.2, RECOVER:0.95, REFLECT:0.9, PRESSURE:0.2 } },
      // Keeper: balanced mental
      { input: { hour_norm:0.45, streak_health:0.65, weekly_xp_trend:0.6, recent_rating_avg:0.65, age_norm:0.45, role_norm:1.0, days_since_mental:0.35 }, output: { BREATH:0.6, GROUND:0.65, VISUALIZE:0.7, ACTIVATE:0.65, RECOVER:0.4, REFLECT:0.55, PRESSURE:0.7 } }
    ]
  };

  // ── Internal Helpers ──────────────────────────────────────────────
  function _cap(val, min, max) {
    return Math.max(min || 0, Math.min(max !== undefined ? max : 1, val || 0));
  }

  function _getNet(name) {
    if (!window.brain) return null;
    if (!_nets[name]) {
      try {
        _nets[name] = new brain.NeuralNetwork(MODEL_CONFIGS[name]);
      } catch (e) {
        console.warn('[SC BrainEngine] Failed to create net for', name, e);
        return null;
      }
    }
    return _nets[name];
  }

  function _loadSavedModels() {
    MODEL_NAMES.forEach(function (name) {
      var saved = DB.get('brain_model_' + name);
      var count = DB.get('brain_samples_' + name) || 0;
      _userSamples[name] = count;
      if (saved && window.brain) {
        try {
          var net = _getNet(name);
          if (net) {
            net.fromJSON(saved);
            _seeded[name] = true;
            console.log('[SC BrainEngine] Loaded saved model:', name, '(', count, 'user samples)');
          }
        } catch (e) {
          console.warn('[SC BrainEngine] Failed to load model', name, e);
        }
      }
    });
  }

  function _seedModel(name) {
    if (_seeded[name]) return;
    var net = _getNet(name);
    if (!net) return;
    var samples = SEED_DATA[name];
    if (!samples || !samples.length) return;
    try {
      net.train(samples, { iterations: 200, errorThresh: 0.005, log: false });
      DB.set('brain_model_' + name, net.toJSON());
      _seeded[name] = true;
      console.log('[SC BrainEngine] Seeded model:', name);
    } catch (e) {
      console.warn('[SC BrainEngine] Failed to seed model', name, e);
    }
  }

  function _retrain(name) {
    var net = _getNet(name);
    if (!net) return;
    var userSamples = DB.get('brain_train_' + name) || [];
    var allSamples = SEED_DATA[name].concat(userSamples);
    try {
      net.train(allSamples, { iterations: 200, errorThresh: 0.005, log: false });
      DB.set('brain_model_' + name, net.toJSON());
      console.log('[SC BrainEngine] Retrained model:', name, 'with', userSamples.length, 'user samples');
    } catch (e) {
      console.warn('[SC BrainEngine] Retrain failed for', name, e);
    }
  }

  // ── Rule-based fallbacks ──────────────────────────────────────────
  var RULE_FALLBACKS = {
    StylePredictor: function (input) {
      var agg  = _cap((input.batting_ratio || 0) * 0.6 + (input.xp_velocity || 0) * 0.4);
      var tech = _cap((input.consistency || 0) * 0.5 + (input.level_norm || 0) * 0.5);
      var ment = _cap((input.mental_ratio || 0) * 0.8 + (input.streak_health || 0) * 0.2);
      var vers = _cap(((input.batting_ratio || 0) + (input.bowling_ratio || 0)) * 0.5);
      return { aggressive: agg, technical: tech, versatile: vers, mental_dominant: ment };
    },
    ProMatcher: function (input) {
      var bat  = _cap((input.batting || 0) * 0.7 + (input.mental || 0) * 0.3);
      var bowl = _cap((input.bowling || 0) * 0.7 + (input.fitness || 0) * 0.3);
      var all  = _cap(((input.batting || 0) + (input.bowling || 0)) * 0.4 + (input.fielding || 0) * 0.2);
      var keep = _cap((input.fielding || 0) * 0.6 + (input.mental || 0) * 0.4);
      return { batsman_type: bat, bowler_type: bowl, allrounder_type: all, keeper_type: keep };
    },
    DrillAdaptor: function (input) {
      var retry   = _cap(1 - (input.recent_score || 0));
      var advance = (input.recent_score || 0) > 0.75 ? 0.8 : 0.2;
      var rel     = _cap(1 - (input.days_since || 0) * 0.5);
      return { shouldRetry: retry, shouldAdvance: advance, relevance_boost: rel };
    },
    MentalReadiness: function (input) {
      var base = _cap(((input.streak_health || 0.5) + (input.recent_rating_avg || 0.5)) / 2);
      return { BREATH: base, GROUND: base, VISUALIZE: base, ACTIVATE: base, RECOVER: _cap(1 - base), REFLECT: base, PRESSURE: _cap(base * 0.8) };
    }
  };

  // ── Public API ────────────────────────────────────────────────────
  A.BrainEngine = {

    init: function () {
      return new Promise(function (resolve) {
        _loadSavedModels();
        MODEL_NAMES.forEach(function (name) {
          if (!_seeded[name]) {
            _seedModel(name);
          }
        });
        console.log('[SC BrainEngine] Initialized');
        resolve();
      });
    },

    predict: function (modelName, input) {
      var fallback = RULE_FALLBACKS[modelName];
      var ruleOut  = fallback ? fallback(input) : {};
      var blend    = A.BrainEngine.getBlendFactor(modelName);
      var net      = _nets[modelName];

      if (!net || !_seeded[modelName]) return ruleOut;
      if (blend <= 0) return ruleOut;

      try {
        var neuralOut = net.run(input);
        if (blend >= 1.0) return neuralOut;
        var merged = {};
        Object.keys(neuralOut).forEach(function (k) {
          merged[k] = (neuralOut[k] || 0) * blend + ((ruleOut[k] || 0)) * (1 - blend);
        });
        return merged;
      } catch (e) {
        console.warn('[SC BrainEngine] Predict failed for', modelName, e);
        return ruleOut;
      }
    },

    train: function (modelName, input, output) {
      if (MODEL_NAMES.indexOf(modelName) === -1) return;
      var samples = DB.get('brain_train_' + modelName) || [];
      samples.push({ input: input, output: output });
      if (samples.length > MAX_STORED_SAMPLES) {
        samples = samples.slice(-MAX_STORED_SAMPLES);
      }
      DB.set('brain_train_' + modelName, samples);
      var count = (_userSamples[modelName] || 0) + 1;
      _userSamples[modelName] = count;
      DB.set('brain_samples_' + modelName, count);

      var shouldRetrain = (count === RETRAIN_THRESHOLD) ||
        (count > RETRAIN_THRESHOLD && ((count - RETRAIN_THRESHOLD) % RETRAIN_INCREMENT === 0));
      if (shouldRetrain) {
        _retrain(modelName);
      }
    },

    isTrained: function (modelName) {
      return (_userSamples[modelName] || 0) >= RETRAIN_THRESHOLD;
    },

    sampleCount: function (modelName) {
      return _userSamples[modelName] || 0;
    },

    getBlendFactor: function (modelName) {
      var count = _userSamples[modelName] || 0;
      if (count < RETRAIN_THRESHOLD) return 0;
      if (count >= 25) return 1.0;
      return (count - RETRAIN_THRESHOLD) / (25 - RETRAIN_THRESHOLD);
    },

    getTrainingStatus: function () {
      var status = {};
      MODEL_NAMES.forEach(function (name) {
        status[name] = {
          samples: _userSamples[name] || 0,
          trained: A.BrainEngine.isTrained(name),
          blend:   A.BrainEngine.getBlendFactor(name)
        };
      });
      return status;
    },

    getStyleLabel: function (userSignals) {
      var signals = userSignals || A.BrainEngine._encodeStyleInput();
      var out = A.BrainEngine.predict('StylePredictor', signals);
      if (!out) return 'Cricketer';
      var candidates = [
        { label: 'Power Player',      key: 'aggressive'       },
        { label: 'Technical Purist',  key: 'technical'        },
        { label: 'Mental Maestro',    key: 'mental_dominant'  },
        { label: 'Complete Cricketer',key: 'versatile'        }
      ];
      var best = candidates[0];
      candidates.forEach(function (c) {
        if ((out[c.key] || 0) > (out[best.key] || 0)) best = c;
      });
      if ((out[best.key] || 0) < 0.55) return 'Well-rounded Cricketer';
      return best.label;
    },

    _encodeStyleInput: function () {
      var prog   = DB.getProgress ? DB.getProgress() : (DB.get('progress') || {});
      var user   = DB.getUser    ? DB.getUser()    : (DB.get('user')     || {});

      var totalDrills     = prog.drills_done    || 0;
      var mentalDone      = prog.mental_done    || 0;
      var completedDrills = prog.completed_drills || [];
      var allCompleted    = (totalDrills + mentalDone) || 1;

      var battingDone = 0, bowlingDone = 0;
      if (A.Data && A.Data.drills) {
        completedDrills.forEach(function (id) {
          var d = A.Data.drills.find(function (x) { return x.id === id; });
          if (d) {
            if (d.category === 'batting') battingDone++;
            else if (d.category === 'bowling') bowlingDone++;
          }
        });
      }

      var xpLog    = DB.getXPLast7Days ? DB.getXPLast7Days() : [];
      var weeklyXP = xpLog.reduce(function (s, d) { return s + (d.xp || 0); }, 0);
      var streak   = prog.current_streak || 0;
      var level    = user.level || 1;
      var age      = user.age   || 16;

      return {
        batting_ratio:  _cap(totalDrills > 0 ? battingDone / totalDrills : 0.5),
        bowling_ratio:  _cap(totalDrills > 0 ? bowlingDone / totalDrills : 0.1),
        mental_ratio:   _cap(mentalDone / allCompleted),
        xp_velocity:    _cap(weeklyXP / 700),
        consistency:    _cap(streak / 30),
        level_norm:     _cap((level - 1) / 9),
        age_norm:       _cap((age - 10) / 30),
        streak_health:  _cap(streak / 14)
      };
    },

    _encodeMentalInput: function () {
      var user = DB.getUser ? DB.getUser() : (DB.get('user') || {});
      var prog = DB.getProgress ? DB.getProgress() : (DB.get('progress') || {});
      var role = (user.role || 'batsman').toLowerCase();

      var roleMap  = { batsman: 0.0, allrounder: 0.33, bowler: 0.67, keeper: 1.0 };
      var roleNorm = roleMap[role] !== undefined ? roleMap[role] : 0.0;

      var xpLog    = DB.getXPLast7Days ? DB.getXPLast7Days() : [];
      var weeklyXP = xpLog.reduce(function (s, d) { return s + (d.xp || 0); }, 0);
      var xpTrend  = _cap(0.5 + (weeklyXP - weeklyXP * 0.85) / 500);

      var mentalHistory  = DB.get('mental_session_history') || [];
      var daysSinceMental = 7;
      if (mentalHistory.length) {
        var last     = mentalHistory[mentalHistory.length - 1];
        var lastDate = new Date(last.date || last.ts || Date.now());
        daysSinceMental = (Date.now() - lastDate.getTime()) / 864e5;
      }

      var sessionRatings = DB.get('session_ratings') || [];
      var last5      = sessionRatings.slice(-5);
      var avgRating  = last5.length
        ? _cap(last5.reduce(function (s, r) { return s + r; }, 0) / last5.length / 5)
        : 0.6;

      return {
        hour_norm:         _cap(new Date().getHours() / 24),
        streak_health:     _cap((prog.current_streak || 0) / 14),
        weekly_xp_trend:   _cap(xpTrend),
        recent_rating_avg: avgRating,
        age_norm:          _cap(((user.age || 16) - 10) / 30),
        role_norm:         roleNorm,
        days_since_mental: _cap(daysSinceMental / 7)
      };
    },

    encodeDrillInput: function (drillId) {
      var user      = DB.getUser ? DB.getUser() : (DB.get('user') || {});
      var drillProg = DB.getSingleDrillProgress ? DB.getSingleDrillProgress(drillId) : null;
      var role      = (user.role || 'batsman').toLowerCase();
      var level     = user.level || 1;

      var lastScore = 0, attemptCount = 0, daysSince = 14, tier = 1;

      if (drillProg) {
        var attempts = drillProg.attempts || [];
        attemptCount = attempts.length;
        if (attempts.length) {
          var last     = attempts[attempts.length - 1];
          lastScore    = last.pct || last.score || 0;
          var lastDate = new Date(last.date || Date.now());
          daysSince    = (Date.now() - lastDate.getTime()) / 864e5;
        }
        var tierMap = { none: 1, bronze: 2, silver: 3, gold: 4, platinum: 5 };
        tier = tierMap[drillProg.tier] || 1;
      }

      if (A.Data && A.Data.drills) {
        var drill = A.Data.drills.find(function (d) { return d.id === drillId; });
        if (drill && drill.tier) tier = parseInt(drill.tier) || tier;
      }

      return {
        recent_score:  _cap(lastScore / 100),
        attempt_norm:  _cap(attemptCount / 20),
        days_since:    _cap(daysSince / 14),
        tier_norm:     _cap(tier / 5),
        level_norm:    _cap(level / 10),
        role_batting:  (role === 'batsman'  || role === 'allrounder') ? 1 : 0,
        role_bowling:  (role === 'bowler'   || role === 'allrounder') ? 1 : 0
      };
    },

    buildStyleSignals: function() { return A.BrainEngine._encodeStyleInput(); },
    buildDrillSignals: function(drillId) { return A.BrainEngine.encodeDrillInput(drillId); },
    buildMentalSignals: function() { return A.BrainEngine._encodeMentalInput(); },
    addSample: function(modelName, input, output) { return A.BrainEngine.train(modelName, input, output); },
    isModelTrained: function(modelName) { return A.BrainEngine.isTrained(modelName); }
  };

  // Auto-init after a brief delay so other modules load first
  setTimeout(function () {
    if (window.SC && window.SC.LibLoader) {
      window.SC.LibLoader.loadBrainJS().then(function () {
        A.BrainEngine.init();
      }).catch(function (e) {
        console.warn('[SC BrainEngine] Brain.js not available, running in rule-based mode');
      });
    }
  }, 500);

  console.log('[SC] BrainEngine module registered');
})();
