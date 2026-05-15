// app-root.js v4.0 — LAYOUT FIXED
// Root causes fixed:
// 1. TopBar now properly defined (in app-ui.js additions)
// 2. MoreMenu replaced with A.Sidebar directly
// 3. BottomNav prop fixed: passes 'page' not 'currentPage'
// 4. DesktopSidebar now mounted in flex-row layout
// 5. Responsive layout: row on desktop, column on mobile
// 6. Home page no longer double-renders BottomNav
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var A = window.SC_APP;
var createRoot = A.createRoot;
var ErrorBoundary = A.ErrorBoundary;
var ThemeCtx = A.ThemeCtx;
var useRoute = A.useRoute;
var nav = A.nav;

// Pages with BottomNav visible
var CHROME_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
]);

// All navigable pages (gets paddings, TopBar)
var STANDARD_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
  'DrillDetail','MentalPlayer','MentalRoutines','MentalRoutinePlayer',
  'PracticeSession','WorkoutDetail','WorkoutPlayer','SkillPathDetail',
  'VideoAnalysis','Performance','ReactionDrill','NinetyDay','AIWorkout',
  'MatchTracker','MiniMatch','GetOut','TimerCustom','Assessment',
  'CricketDNA','DailyNet',
]);

// Pages that manage their own full-screen layout (no chrome)
var FULLSCREEN_PAGES = new Set([
  'AICoach','MentalPlayer','MentalRoutinePlayer','WorkoutPlayer',
]);

// Pages that render their OWN TopBar — AppShell skips its TopBar for these
var SELF_TOPBAR_PAGES = new Set(['Home']);
// Pages that render their OWN BottomNav — AppShell skips for these
var SELF_BOTTOMNAV_PAGES = new Set([]);

function getPage(name) {
  var P = A;
  var map = {
    Home: P.HomePage, Drills: P.DrillsPage, DrillDetail: P.DrillDetailPage,
    PracticeSession: P.PracticeSessionBuilderPage, ReactionDrill: P.ReactionDrillPage,
    GetOut: P.GetOutPage, VideoAnalysis: P.VideoAnalysisPage,
    Mental: P.MentalPage, MentalPlayer: P.MentalPlayerPage,
    MentalRoutines: P.MentalRoutinesPage, MentalRoutinePlayer: P.MentalRoutinePlayerPage,
    Fitness: P.FitnessPage, WorkoutDetail: P.WorkoutDetailPage,
    WorkoutPlayer: P.WorkoutPlayerPage, AIWorkout: P.AIWorkoutPage,
    Timer: P.TimerPage, Schedule: P.SchedulePage,
    SkillPaths: P.SkillPathsPage, SkillPathDetail: P.SkillPathDetailPage,
    Progress: P.ProgressPage, Assessment: P.AssessmentPage, Profile: P.ProfilePage,
    ThirtyDay: P.ThirtyDayPage, Leaderboard: P.LeaderboardPage,
    AICoach: P.AICoachPage, Performance: P.PerformancePage,
    MatchLogger: P.MatchLoggerPage, NinetyDay: P.NinetyDayPage,
    MatchTracker: P.MatchTrackerPage, MiniMatch: P.MiniMatchPage, Quizzes: P.QuizzesPage,
    CricketDNA: P.CricketDNAPage, DailyNet: P.DailyNetPage,
  };
  return map[name] || null;
}

// Page display labels
var PAGE_LABELS = {
  Home:'SmartCrick AI', Drills:'Cricket Drills', Mental:'Mental Training',
  Fitness:'Fitness Builder', Progress:'My Progress', Profile:'My Profile',
  Schedule:'Training Schedule', ThirtyDay:'30-Day Challenge', SkillPaths:'Skill Paths',
  Leaderboard:'Leaderboard', Timer:'Training Timer', Quizzes:'Cricket Quizzes',
  MatchLogger:'Match Logger', Performance:'Performance Analytics',
  AICoach:'AI Head Coach', Assessment:'Skill Assessment', CricketDNA:'Cricket DNA',
  DailyNet:'The Daily Net', NinetyDay:'90-Day Program', MatchTracker:'Match Tracker',
  MiniMatch:'MiniMatch IQ', DrillDetail:'Drill', WorkoutDetail:'Workout',
};

function AppShell() {
  var route = useRoute();
  var page = route.page || 'Home';
  var params = route.params || {};
  var [dark, setDark] = useState(true);
  var [menuOpen, setMenuOpen] = useState(false);

  // Scroll to top on page change, close menu
  useEffect(function() {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [page]);

  // Apply background to body
  useEffect(function() { document.body.style.background = '#0d1117'; }, []);

  // Onboarding gate — must complete before entering the app
  var user = A.DB.getUser();
  if (!user.onboardDone) {
    return h(ThemeCtx.Provider, { value: { dark: true, toggle: function() {} } },
      h(ErrorBoundary, null, h(A.OnboardPage, null))
    );
  }

  var PageComp = getPage(page);
  var isFullScreen = FULLSCREEN_PAGES.has(page);
  var isChrome = CHROME_PAGES.has(page);
  var isStandard = STANDARD_PAGES.has(page);
  var showTopBar = !isFullScreen && isStandard && !SELF_TOPBAR_PAGES.has(page);
  var showBottomNav = !isFullScreen && isChrome && !SELF_BOTTOMNAV_PAGES.has(page);
  var pageLabel = PAGE_LABELS[page] || page;

  return h(ThemeCtx.Provider, {
    value: { dark: dark, toggle: function() { setDark(function(d) { return !d; }); } }
  },
    h(ErrorBoundary, null,

      // ── App layout wrapper: flex-row on desktop, flex-col on mobile ──
      h('div', { className: 'sc-app-layout' },

        // ── Desktop sidebar (hidden on mobile via .sc-desktop-sidebar-wrap CSS) ──
        h('div', { className: 'sc-desktop-sidebar-wrap' },
          h(A.DesktopSidebar, { currentPage: page })
        ),

        // ── Main content column ──
        h('div', { className: 'sc-main-column' },

          // ── Mobile TopBar (hidden on desktop via .sc-topbar CSS) ──
          showTopBar && h(A.TopBar, {
            page: page,
            title: pageLabel,
            onMenuOpen: function() { setMenuOpen(true); },
          }),

          // ── Page content ──
          h('div', {
            className: showTopBar ? 'sc-page-content sc-page-content--topbar' : 'sc-page-content',
            style: showBottomNav ? { paddingBottom: 'calc(58px + env(safe-area-inset-bottom,0px))' } : {},
          },
            PageComp
              ? h(PageComp, { params: params })
              : h('div', {
                  style: {
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '70vh', padding: '20px', textAlign: 'center',
                  }
                },
                h('div', { style: { fontSize: 48, marginBottom: 16 } }, '🏏'),
                h('h2', { style: { fontSize: 20, fontWeight: 800, color: '#f0fdf4', marginBottom: 8 } }, 'Page not found'),
                h('p', { style: { fontSize: 13, color: '#6b7280', marginBottom: 20 } }, '"' + page + '" is not available.'),
                h('button', {
                  onClick: function() { nav('Home'); },
                  style: { padding: '12px 24px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }
                }, 'Go Home')
              )
          ),

          // ── Mobile BottomNav (hidden on desktop via CSS) ──
          showBottomNav && h(A.BottomNav, { page: page }),
        )
      ),

      // ── Mobile Sidebar drawer overlay (position:fixed, z-index:50) ──
      h(A.Sidebar, {
        open: menuOpen,
        onClose: function() { setMenuOpen(false); },
        currentPage: page,
      })
    )
  );
}

// Mount once
var rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(h(AppShell, null));
  console.log('[SC] app-root v4.0 — layout fixed, 7 root causes resolved ✓');
} else {
  console.error('[SC] FATAL: #root element not found');
}
})();
