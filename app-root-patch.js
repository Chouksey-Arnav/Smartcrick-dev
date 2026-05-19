// app-root-patch.js v1.0
// ================================================================
// SmartCrick — Remove dead pages from routing
// ADD as <script src="app-root-patch.js"></script>
// AFTER app-root.js in index.html (last script before </body>)
//
// Removes from routing: MiniMatch, MatchTracker, GetOut, Quizzes,
//   ReactionDrill, MatchLogger, Performance
// ================================================================
(function() {
'use strict';
var A = window.SC_APP;
if (!A) { console.warn('[SC] app-root-patch: SC_APP not found'); return; }

// Pages to remove entirely
var DEAD_PAGES = [
  'MiniMatch', 'MatchTracker', 'GetOut', 'Quizzes',
  'ReactionDrill', 'MatchLogger', 'Performance',
];
var DEAD_SET = new Set(DEAD_PAGES);

// ─── 1. Patch pageMap ─────────────────────────────────────────────
if (A.pageMap && typeof A.pageMap === 'object') {
  DEAD_PAGES.forEach(function(pg) {
    if (A.pageMap[pg]) {
      delete A.pageMap[pg];
      console.log('[SC] app-root-patch: removed page', pg, 'from pageMap');
    }
  });
}

// ─── 2. Patch STANDARD_PAGES array ────────────────────────────────
if (A.STANDARD_PAGES && Array.isArray(A.STANDARD_PAGES)) {
  var before = A.STANDARD_PAGES.length;
  A.STANDARD_PAGES = A.STANDARD_PAGES.filter(function(pg) {
    return !DEAD_SET.has(pg);
  });
  console.log('[SC] app-root-patch: STANDARD_PAGES', before, '->', A.STANDARD_PAGES.length);
}

// ─── 3. Patch CHROME_PAGES array ──────────────────────────────────
if (A.CHROME_PAGES && Array.isArray(A.CHROME_PAGES)) {
  A.CHROME_PAGES = A.CHROME_PAGES.filter(function(pg) {
    return !DEAD_SET.has(pg);
  });
}

// ─── 4. Patch PAGE_LABELS object ──────────────────────────────────
if (A.PAGE_LABELS && typeof A.PAGE_LABELS === 'object') {
  DEAD_PAGES.forEach(function(pg) {
    delete A.PAGE_LABELS[pg];
  });
}

// ─── 5. Safety: if currentPage is a dead page, redirect to Home ───
try {
  var cur = A.DB ? A.DB.get('sc_page') : null;
  if (cur && DEAD_SET.has(cur)) {
    if (A.DB) A.DB.set('sc_page', 'Home');
    if (A.nav) A.nav('Home');
    console.log('[SC] app-root-patch: redirected from dead page', cur, '-> Home');
  }
} catch(e) {}

// ─── 6. Intercept nav() to block dead pages ───────────────────────
var _origNav = A.nav;
if (_origNav) {
  A.nav = function(page, params) {
    if (DEAD_SET.has(page)) {
      console.warn('[SC] app-root-patch: nav to dead page blocked:', page);
      return;
    }
    return _origNav(page, params);
  };
}

console.log('[SC] app-root-patch v1.0 — dead pages removed from routing');
})();
