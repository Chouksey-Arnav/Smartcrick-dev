// app-mental-integration.js v1.0
// ================================================================
// SmartCrick — Mental System Final Integration
// Wires together: content + extended content + v4 player + URLs
// Load ORDER in index.html:
//   app-mental-content.js          (base 30 scripted sessions)
//   app-mental-content-extended.js (50+ more + visual configs)
//   app-mental.js                  (existing list/browse page)
//   app-mental-player-v4.js        (7-type renderer)
//   app-mental-integration.js      (THIS FILE — wires everything)
// ================================================================
(function() {
'use strict';
var A = window.SC_APP;

// ── 1. Surface-level slug normaliser ─────────────────────────────
// Converts any session name to a consistent lookup key
function toSlug(name) {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// ── 2. Enrich ALL sessions in A.MENTAL_SESSIONS with type + slug ─
//    so the browse list shows the type badge colour
function enrichSessions() {
  if (!A.MENTAL_SESSIONS) return;
  A.MENTAL_SESSIONS.forEach(function(s) {
    var slug = toSlug(s.name);
    s.slug = slug;
    var typeKey = A.SESSION_TYPE_MAP && A.SESSION_TYPE_MAP[slug];
    if (typeKey) {
      s.experienceType = typeKey;
      var typeObj = A.SESSION_TYPES && A.SESSION_TYPES[typeKey];
      if (typeObj) s.typeColor = typeObj.color;
    }
    if (!s.experienceType) {
      // fallback heuristic
      var n = s.name.toLowerCase();
      if (/breath|sigh|box breath|4-7-8/.test(n))  s.experienceType = 'BREATH';
      else if (/ground|anchor|reset|focus|5-4-3/.test(n)) s.experienceType = 'GROUND';
      else if (/visual|goal|future|champion|scene/.test(n)) s.experienceType = 'VISUALIZE';
      else if (/activ|morning|game.day|fuel|fire/.test(n)) s.experienceType = 'ACTIVATE';
      else if (/recover|sleep|decompress|relax|release/.test(n)) s.experienceType = 'RECOVER';
      else if (/reflect|invent|account|mirror|why|gratit/.test(n)) s.experienceType = 'REFLECT';
      else if (/pressure|choke|stake|inocul|cold/.test(n)) s.experienceType = 'PRESSURE';
      else s.experienceType = 'GROUND';
      var t = A.SESSION_TYPES && A.SESSION_TYPES[s.experienceType];
      if (t) s.typeColor = t.color;
    }
  });
  console.log('[SC] enriched', A.MENTAL_SESSIONS.length, 'sessions with type data');
}

// ── 3. Patch getSessionContent to also normalise slugs ────────────
var _orig = A.getSessionContent;
A.getSessionContent = function(slug, name, dur) {
  // try exact slug first
  var result = _orig && _orig(slug, name, dur);
  if (result && result.phases && result.phases.length) return result;
  // try normalised slug from name
  var norm = toSlug(name || slug);
  result = _orig && _orig(norm, name, dur);
  if (result && result.phases && result.phases.length) return result;
  // fallback: generate from type
  var typeKey = (A.SESSION_TYPE_MAP && (A.SESSION_TYPE_MAP[norm] || A.SESSION_TYPE_MAP[slug])) || 'GROUND';
  if (A.generateFallbackScript) return A.generateFallbackScript(name || slug, typeKey, dur || 5);
  return { type: typeKey, phases: [
    { id: 'settle',    duration: 30, text: 'Settle in. Close your eyes. Breathe.' },
    { id: 'core',      duration: (dur||5)*60 - 60, text: 'Be fully present for this session.' },
    { id: 'integrate', duration: 30, text: 'Gently return. Carry this with you.' }
  ]};
};
A.toSlug = toSlug;

// ── 4. Deep-link: ?session=slug or ?mental=slug ───────────────────
function handleDeepLink() {
  var p = new URLSearchParams(window.location.search);
  var raw = p.get('session') || p.get('mental');
  if (!raw || !A.MENTAL_SESSIONS) return;
  var slug = toSlug(raw);
  var found = A.MENTAL_SESSIONS.find(function(s) {
    return s.slug === slug || toSlug(s.name) === slug;
  });
  if (found && A.nav) {
    A.nav('MentalSession', { session: found });
    // clean URL
    history.replaceState(null, '', window.location.pathname);
  }
}

// ── 5. Share URL helper ───────────────────────────────────────────
A.getMentalShareUrl = function(session) {
  return window.location.origin + window.location.pathname +
    '?session=' + (session.slug || toSlug(session.name));
};
A.copyMentalShareUrl = function(session) {
  var url = A.getMentalShareUrl(session);
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url).then(function() {
      window.dispatchEvent(new CustomEvent('sc_toast',{detail:{msg:'Link copied!',type:'success'}}));
    });
  } else {
    prompt('Copy session link:', url);
  }
};

// ── 6. Boot ───────────────────────────────────────────────────────
enrichSessions();
// Deep link fires after React mounts
window.addEventListener('sc_ready', handleDeepLink, { once: true });
// Fallback: try 2s after load
setTimeout(handleDeepLink, 2000);

console.log('[SC] app-mental-integration v1.0 — system wired');
})();
