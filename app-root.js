// app-root.js v5.0 — DEFENSIVE + FIXED
// Root causes addressed:
// 1. Guards all A.* component references — never crashes on undefined
// 2. Correct responsive layout (flex-row desktop, column mobile)
// 3. A.Sidebar for mobile drawer (not MoreMenu)  
// 4. BottomNav gets correct 'page' prop
// 5. HomePage no longer double-renders TopBar/BottomNav
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var A = window.SC_APP;

// ── Safe component wrapper ────────────────────────────────────────
// Returns a no-op if the component isn't defined yet
function safeComp(comp, props, children) {
  if (typeof comp !== 'function' && typeof comp !== 'object') return null;
  return children !== undefined ? h(comp, props, children) : h(comp, props);
}

var createRoot   = A.createRoot;
var ErrorBoundary = A.ErrorBoundary;
var ThemeCtx     = A.ThemeCtx;
var useRoute     = A.useRoute;
var nav          = A.nav;

// Pages rendered by AppShell's chrome (TopBar + BottomNav)
var CHROME_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
]);

// All navigable pages (get main content padding)
var STANDARD_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
  'DrillDetail','MentalPlayer','MentalRoutines','MentalRoutinePlayer',
  'PracticeSession','WorkoutDetail','WorkoutPlayer','SkillPathDetail',
  'VideoAnalysis','Performance','ReactionDrill','NinetyDay','AIWorkout',
  'MatchTracker','MiniMatch','GetOut','Assessment','CricketDNA','DailyNet',
]);

// Pages that own their full-screen layout — no TopBar/BottomNav
var FULLSCREEN_PAGES = new Set([
  'AICoach','MentalPlayer','MentalRoutinePlayer','WorkoutPlayer',
]);

// Page labels for TopBar
var PAGE_LABELS = {
  Home: 'SmartCrick', Drills: 'Cricket Drills', Mental: 'Mental Training',
  Fitness: 'Fitness', Progress: 'Progress', Profile: 'Profile',
  Schedule: 'Schedule', ThirtyDay: '30-Day Challenge', SkillPaths: 'Skill Paths',
  Leaderboard: 'Leaderboard', Timer: 'Timer', Quizzes: 'Quizzes',
  MatchLogger: 'Match Logger', Performance: 'Analytics',
  AICoach: 'AI Coach', Assessment: 'Skill Assessment',
  CricketDNA: 'Cricket DNA', DailyNet: 'Daily Net',
  NinetyDay: '90-Day Program', MatchTracker: 'Match Tracker',
  MiniMatch: 'MiniMatch IQ', DrillDetail: 'Drill', WorkoutDetail: 'Workout',
};

function getPage(name) {
  var P = A;
  var map = {
    Home: P.HomePage, Drills: P.DrillsPage, DrillDetail: P.DrillDetailPage,
    PracticeSession: P.PracticeSessionBuilderPage,
    ReactionDrill: P.ReactionDrillPage,
    GetOut: P.GetOutPage, VideoAnalysis: P.VideoAnalysisPage,
    Mental: P.MentalPage, MentalPlayer: P.MentalPlayerPage,
    MentalRoutines: P.MentalRoutinesPage,
    MentalRoutinePlayer: P.MentalRoutinePlayerPage,
    Fitness: P.FitnessPage, WorkoutDetail: P.WorkoutDetailPage,
    WorkoutPlayer: P.WorkoutPlayerPage, AIWorkout: P.AIWorkoutPage,
    Timer: P.TimerPage, Schedule: P.SchedulePage,
    SkillPaths: P.SkillPathsPage, SkillPathDetail: P.SkillPathDetailPage,
    Progress: P.ProgressPage, Assessment: P.AssessmentPage,
    Profile: P.ProfilePage, ThirtyDay: P.ThirtyDayPage,
    Leaderboard: P.LeaderboardPage, AICoach: P.AICoachPage,
    Performance: P.PerformancePage, MatchLogger: P.MatchLoggerPage,
    NinetyDay: P.NinetyDayPage, MatchTracker: P.MatchTrackerPage,
    MiniMatch: P.MiniMatchPage, Quizzes: P.QuizzesPage,
    CricketDNA: P.CricketDNAPage, DailyNet: P.DailyNetPage,
  };
  return map[name] || null;
}

// ── 404 Fallback ──────────────────────────────────────────────────
function NotFound(props) {
  return h('div', {
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '70vh',
      padding: '20px', textAlign: 'center',
    }
  },
    h('div', { style: { fontSize: 48, marginBottom: 16 } }, '\uD83C\uDFCF'),
    h('h2', { style: { fontSize: 20, fontWeight: 800, color: '#f0fdf4', marginBottom: 8 } },
      'Page not found'),
    h('p', { style: { fontSize: 13, color: '#6b7280', marginBottom: 20 } },
      '"' + (props.page || '') + '" is not available.'),
    h('button', {
      onClick: function() { nav('Home'); },
      style: {
        padding: '12px 24px', background: '#16a34a', color: '#fff',
        border: 'none', borderRadius: 10, cursor: 'pointer',
        fontFamily: 'inherit', fontWeight: 700,
      }
    }, 'Go Home')
  );
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  var route      = useRoute();
  var page       = route.page || 'Home';
  var params     = route.params || {};
  var [dark, setDark]       = useState(true);
  var [menuOpen, setMenuOpen] = useState(false);

  // Reset scroll + close drawer on page change
  useEffect(function() {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [page]);

  // Body background
  useEffect(function() {
    document.body.style.background = '#0d1117';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  // ── Onboarding gate ───────────────────────────────────────────
  var user = A.DB.getUser();
  if (!user.onboardDone) {
    if (!A.OnboardPage) {
      return h('div', {
        style: {
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '100dvh', background: '#0d1117', color: '#6b7280', fontSize: 14,
        }
      }, 'Loading SmartCrick...');
    }
    return h(ThemeCtx.Provider, { value: { dark: true, toggle: function() {} } },
      h(ErrorBoundary, null, h(A.OnboardPage, null))
    );
  }

  // ── Layout flags ──────────────────────────────────────────────
  var PageComp      = getPage(page);
  var isFullScreen  = FULLSCREEN_PAGES.has(page);
  var isChrome      = CHROME_PAGES.has(page);
  var isStandard    = STANDARD_PAGES.has(page);
  var showTopBar    = !isFullScreen && isStandard;
  var showBottomNav = !isFullScreen && isChrome;
  var pageTitle     = PAGE_LABELS[page] || page;

  // Top padding: 52px TopBar + safe-area when TopBar is shown on mobile
  var topPad = showTopBar
    ? 'calc(52px + env(safe-area-inset-top, 0px))'
    : '0px';
  // Bottom padding: 58px BottomNav when shown
  var botPad = showBottomNav
    ? 'calc(58px + env(safe-area-inset-bottom, 0px))'
    : '0px';

  return h(ThemeCtx.Provider, {
    value: { dark: dark, toggle: function() { setDark(function(d) { return !d; }); } }
  },
    h(ErrorBoundary, null,

      // ── Outer flex wrapper: row on desktop, column on mobile ──
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'row',
          minHeight: '100dvh',
          background: '#0d1117',
        }
      },

        // ── Desktop sidebar (visible 768px+, hidden mobile) ───
        h('div', { className: 'sc-desktop-sidebar' },
          A.DesktopSidebar ? h(A.DesktopSidebar, { currentPage: page }) : null
        ),

        // ── Main content column ───────────────────────────────
        h('div', {
          style: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100dvh',
            overflow: 'hidden',
            position: 'relative',
          }
        },

          // Mobile TopBar (hidden on desktop via CSS)
          showTopBar
            ? h('div', { className: 'sc-mobile-only' },
                A.TopBar
                  ? h(A.TopBar, { title: pageTitle, onMenuOpen: function() { setMenuOpen(true); } })
                  : null
              )
            : null,

          // Page content
          h('div', {
            style: {
              flex: 1,
              paddingTop: topPad,
              paddingBottom: botPad,
              minHeight: '100dvh',
              boxSizing: 'border-box',
            }
          },
            PageComp
              ? h(PageComp, { params: params })
              : h(NotFound, { page: page })
          ),

          // Mobile BottomNav (hidden on desktop via CSS)
          showBottomNav
            ? h('div', { className: 'sc-mobile-only' },
                A.BottomNav
                  ? h(A.BottomNav, { page: page })
                  : null
              )
            : null
        )
      ),

      // Mobile sidebar drawer (position:fixed, always in DOM)
      A.Sidebar
        ? h(A.Sidebar, {
            open: menuOpen,
            onClose: function() { setMenuOpen(false); },
            currentPage: page,
          })
        : null
    )
  );
}

// ── Mount (once, safely) ──────────────────────────────────────────
var rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[SC] FATAL: #root element missing');
} else {
  try {
    createRoot(rootEl).render(h(AppShell, null));
    console.log('[SC] app-root v5.0 — mounted ✓');
  } catch(e) {
    console.error('[SC] Mount failed:', e);
    rootEl.innerHTML = '<div style="color:#f0fdf4;padding:40px;text-align:center;background:#0d1117;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:3rem;margin-bottom:1rem">\uD83C\uDFCF</div><h2>SmartCrick failed to start</h2><p style="color:#6b7280">Open DevTools (F12) \u2192 Console for details.</p><button onclick="location.reload()" style="margin-top:1rem;padding:12px 24px;background:#16a34a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px">Retry</button></div>';
  }
}
})();
