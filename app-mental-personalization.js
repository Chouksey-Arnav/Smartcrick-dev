// app-mental-personalization.js
// ================================================================
// SmartCrick — Mental Session Personalization Engine
// Handles token replacement in session scripts before TTS delivery.
//
// Tokens embedded in session text:
//   {NAME}          → user's name
//   {ROLE}          → batsman / bowler / allrounder / wicketkeeper
//   {ROLE_ACTION}   → role-specific core action phrase
//   {ROLE_SKILL}    → role-specific mental skill focus
//   {ROLE_CREASE}   → batting crease / bowling crease / etc.
//   {ROLE_FOCUS}    → role-specific attention phrase
//   {LEVEL}         → school / club-level / district-level / state-level
//   {LEVEL_CONTEXT} → level-specific motivational context sentence
//   {GOAL_PHRASE}   → user's goal in plain English
//   {RECENT_DRILL}  → 'after your [drill] work today' or ''
// ================================================================
(function () {
'use strict';
var A = window.SC_APP || (window.SC_APP = {});

var ROLE_PHRASES = {
  batsman: {
    action:    'track the ball from the hand',
    skill:     'shot selection and intent',
    crease:    'batting crease',
    focus:     'watching the ball onto the bat',
    position:  'the crease',
    challenge: 'reading the bowler early',
    verbing:   'batting',
    tool:      'bat',
  },
  bowler: {
    action:    'load, drive, and release',
    skill:     'line, length, and variation',
    crease:    'bowling crease',
    focus:     'hitting the seam and your spot',
    position:  'the top of your mark',
    challenge: 'controlling the ball under pressure',
    verbing:   'bowling',
    tool:      'ball',
  },
  allrounder: {
    action:    'switch smoothly between batting and bowling mode',
    skill:     'reading the game and adapting your mindset',
    crease:    'the crease',
    focus:     'staying present in whichever role the team needs',
    position:  'wherever the game demands',
    challenge: 'maintaining intensity across both disciplines',
    verbing:   'performing',
    tool:      'game',
  },
  wicketkeeper: {
    action:    'receive cleanly and move decisively',
    skill:     'glove work, footwork, and vocal leadership',
    crease:    'keeper position',
    focus:     'watching the ball from release through to your gloves',
    position:  'behind the stumps',
    challenge: 'staying sharp for every single delivery',
    verbing:   'keeping',
    tool:      'gloves',
  }
};

var LEVEL_LABELS = {
  school:   'school level',
  club:     'club level',
  district: 'district level',
  state:    'state level',
};

var LEVEL_CONTEXT = {
  school:   'You are building your foundation. Every rep here matters more than you know.',
  club:     'You are developing real skills. This is where habits form that last a career.',
  district: 'You are competing at a high level. The mental edge is what separates equals.',
  state:    'At state level, every player is technically capable. The mental game is your edge.',
};

var GOAL_PHRASES = {
  selection:    'earning selection',
  improve:      'improving your game',
  performance:  'performing at your best',
  fitness:      'building your fitness',
  mental:       'developing your mental game',
  allround:     'becoming a complete cricketer',
};

function _getRecentDrillContext() {
  try {
    var prog = A.DB && A.DB.getDrillProgress ? A.DB.getDrillProgress() : {};
    if (!prog || !Object.keys(prog).length) return '';
    var now = Date.now();
    var cutoff = now - 86400000;
    var recent = null;
    Object.keys(prog).forEach(function (id) {
      var attempts = (prog[id] && prog[id].attempts) || [];
      var last = attempts[attempts.length - 1];
      if (last && last.ts > cutoff) {
        if (!recent || last.ts > recent.ts) {
          recent = { id: id, ts: last.ts };
        }
      }
    });
    if (!recent) return '';
    var drills = A.DRILLS_DATA || [];
    var drill = null;
    for (var i = 0; i < drills.length; i++) {
      if (drills[i].id === recent.id) { drill = drills[i]; break; }
    }
    return drill ? 'after your ' + drill.name + ' work today' : '';
  } catch (e) {
    return '';
  }
}

function _personalizeText(text, user, drillCtx) {
  if (!text) return text;
  var role = user.role || 'batsman';
  var rp = ROLE_PHRASES[role] || ROLE_PHRASES.batsman;
  var level = user.level || 'club';
  var goal = user.goal || 'improve';

  return text
    .replace(/{NAME}/g,          user.name || 'cricketer')
    .replace(/{ROLE}/g,          role)
    .replace(/{ROLE_ACTION}/g,   rp.action)
    .replace(/{ROLE_SKILL}/g,    rp.skill)
    .replace(/{ROLE_CREASE}/g,   rp.crease)
    .replace(/{ROLE_FOCUS}/g,    rp.focus)
    .replace(/{ROLE_POSITION}/g, rp.position)
    .replace(/{ROLE_CHALLENGE}/g,rp.challenge)
    .replace(/{ROLE_VERBING}/g,  rp.verbing)
    .replace(/{ROLE_TOOL}/g,     rp.tool)
    .replace(/{LEVEL}/g,         LEVEL_LABELS[level] || level)
    .replace(/{LEVEL_CONTEXT}/g, LEVEL_CONTEXT[level] || '')
    .replace(/{GOAL_PHRASE}/g,   GOAL_PHRASES[goal] || 'your cricket goals')
    .replace(/{RECENT_DRILL}/g,  drillCtx || '');
}

var MentalPersonalizer = {
  // Call this before passing phase text to TTS.
  // Picks roleText variant first, then runs token replacement.
  personalizePhase: function (phase, user) {
    if (!phase) return '';
    var role = (user && user.role) || 'batsman';
    var raw = (phase.roleText && phase.roleText[role]) || phase.text || '';
    var drillCtx = _getRecentDrillContext();
    return _personalizeText(raw, user || {}, drillCtx);
  },

  // Convenience: personalize plain text string
  personalizeText: function (text, user) {
    var drillCtx = _getRecentDrillContext();
    return _personalizeText(text, user || {}, drillCtx);
  },

  // Get a context line for the pre-session screen
  getSessionContext: function (session, user) {
    if (!session || !user) return '';
    var role = user.role || 'batsman';
    var roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    var type = session.type || session.category || '';
    var typeMap = {
      BREATH:   'breathing and calm',
      GROUND:   'focus and grounding',
      VISUALIZE:'visualization',
      ACTIVATE: 'energy and activation',
      RECOVER:  'recovery and release',
      REFLECT:  'reflection and growth',
      PRESSURE: 'pressure and resilience',
    };
    var typeName = typeMap[type] || 'mental training';
    var drillCtx = _getRecentDrillContext();
    if (drillCtx) {
      return roleLabel + 's · ' + typeName + ' · ' + drillCtx;
    }
    return roleLabel + 's · ' + typeName;
  },

  // Reflection prompt shown post-session, varies by type
  getReflectionPrompt: function (sessionType) {
    var prompts = {
      GROUND:   'What is the one thing you will carry onto the field?',
      BREATH:   'Notice how your body feels right now compared to when you started.',
      VISUALIZE:'Close your eyes once more — hold that image for 10 more seconds.',
      ACTIVATE: 'Name the first thing you will do when you step out.',
      RECOVER:  'How does your mind feel compared to when you started?',
      REFLECT:  'What is the one insight you want to act on first?',
      PRESSURE: 'Name the specific situation where you will use this today.',
    };
    return prompts[sessionType] || 'What did you take from this session?';
  },

  ROLE_PHRASES: ROLE_PHRASES,
  LEVEL_CONTEXT: LEVEL_CONTEXT,
};

Object.assign(A, { MentalPersonalizer: MentalPersonalizer });
console.log('[SC] app-mental-personalization ready — token engine + role phrases');
})();
