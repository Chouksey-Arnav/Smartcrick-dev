// Save as: app-root.js
// ================================================================
// SmartCrick AI — Root Router v3.3
// Hash-based routing connecting all 30+ pages
// Registers ThemeProvider + ErrorBoundary + TopBar + BottomNav
// P5-A: Onboarding check before rendering any page
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, createContext, useContext } = React;
const A = window.SC_APP;
const { createRoot, ErrorBoundary, ThemeCtx, useRoute, nav,
  TopBar, BottomNav, MoreMenu } = A;

// ── Pages that get full chrome (TopBar + BottomNav) ───────────────
const CHROME_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
]);
// Pages that get a back-arrow header but no bottom nav
const DETAIL_PAGES = new Set([
  'DrillDetail','MentalPlayer','MentalRoutines','MentalRoutinePlayer',
  'PracticeSession','WorkoutDetail','WorkoutPlayer','SkillPathDetail',
  'VideoAnalysis','Performance','ReactionDrill','NinetyDay','AIWorkout',
  'MatchTracker','MiniMatch','GetOut','TimerCustom','Assessment',
]);

// ── Page Router ───────────────────────────────────────────────────
function getPage(name) {
  var P = A;
  var map = {
    // Core
    Home:           P.HomePage,
    // Drills
    Drills:         P.DrillsPage,
    DrillDetail:    P.DrillDetailPage,
    PracticeSession:P.PracticeSessionBuilderPage,
    ReactionDrill:  P.ReactionDrillPage,
    GetOut:         P.GetOutPage,
    VideoAnalysis:  P.VideoAnalysisPage,
    // Mental
    Mental:         P.MentalPage,
    MentalPlayer:   P.MentalPlayerPage,
    MentalRoutines: P.MentalRoutinesPage,
    MentalRoutinePlayer:P.MentalRoutinePlayerPage,
    // Fitness
    Fitness:        P.FitnessPage,
    WorkoutDetail:  P.WorkoutDetailPage,
    WorkoutPlayer:  P.WorkoutPlayerPage,
    AIWorkout:      P.AIWorkoutPage,
    // Timer
    Timer:          P.TimerPage,
    // Schedule
    Schedule:       P.SchedulePage,
    // Skill Paths
    SkillPaths:     P.SkillPathsPage,
    SkillPathDetail:P.SkillPathDetailPage,
    // Progress & Assessment
    Progress:       P.ProgressPage,
    Assessment:     P.AssessmentPage,
    // Profile
    Profile:        P.ProfilePage,
    // Challenge
    ThirtyDay:      P.ThirtyDayPage,
    // Stubs / Others
    Leaderboard:    P.LeaderboardPage,
    AICoach:        P.AICoachPage,
    Performance:    P.PerformancePage,
    MatchLogger:    P.MatchLoggerPage,
    NinetyDay:      P.NinetyDayPage,
    MatchTracker:   P.MatchTrackerPage,
    MiniMatch:      P.MiniMatchPage,
    Quizzes:        P.QuizzesPage,
  };
  return map[name] || null;
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  var route = useRoute();
  var page  = route.page || 'Home';
  var params = route.params || {};
  var [dark, setDark]  = useState(true);
  var [menu, setMenu]  = useState(false);

  // Keep body background synced
  useEffect(function(){
    document.body.style.background = '#0d1117';
  }, []);

  // Scroll to top on page change
  useEffect(function(){
    window.scrollTo(0, 0);
  }, [page]);

  // P5-A: Onboarding gate — show onboard wizard if not done
  var user = A.DB.getUser();
  if (!user.onboardDone) {
    return h(A.ThemeCtx.Provider, { value:{ dark:true, toggle:function(){} }},
      h(A.ErrorBoundary, null, h(A.OnboardPage, null))
    );
  }

  var PageComp = getPage(page);
  var showNav  = CHROME_PAGES.has(page);
  var showBar  = CHROME_PAGES.has(page) || DETAIL_PAGES.has(page);

  // Special full-screen pages (no chrome at all)
  var fullScreen = page === 'AICoach' || page === 'MentalPlayer' || page === 'MentalRoutinePlayer' ||
    page === 'WorkoutPlayer';

  return h(ThemeCtx.Provider, { value:{ dark:dark, toggle:function(){ setDark(function(d){return !d;}); }}},
    h(ErrorBoundary, null,

      // Top bar (for non-full-screen pages that have chrome)
      !fullScreen && showBar && h(TopBar, {
        page:page,
        onMenuOpen:function(){ setMenu(true); }
      }),

      // Page content
      h('div', {
        style:{
          paddingTop: (!fullScreen && showBar) ? 'calc(env(safe-area-inset-top,0px) + 52px)' : '0',
          minHeight:'100dvh', background:'#0d1117',
        }
      },
        PageComp
          ? h(PageComp, { params:params })
          : h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'20px', textAlign:'center' }},
              h('div', { style:{ fontSize:48, marginBottom:16 }}, '🏏'),
              h('h2', { style:{ fontSize:20, fontWeight:800, color:'#f0fdf4', marginBottom:8 }}, 'Page not found'),
              h('p', { style:{ fontSize:13, color:'#6b7280', marginBottom:20 }}, '"'+page+'" is not a valid page.'),
              h('button', { onClick:function(){ nav('Home'); },
                style:{ padding:'12px 24px', background:'#16a34a', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }},
                'Go Home')
            )
      ),

      // Bottom navigation
      !fullScreen && showNav && h(BottomNav, { currentPage:page }),

      // More menu overlay
      menu && h(MoreMenu, { onClose:function(){ setMenu(false); }})
    )
  );
}

// ── Mount ─────────────────────────────────────────────────────────
var rootEl = document.getElementById('root');
if (rootEl) {
  var root = A.createRoot(rootEl);
  root.render(h(AppShell, null));
  console.log('[SC] app-root v3.3 mounted — onboarding gate + Assessment route active');
} else {
  console.error('[SC] ERROR: #root element not found');
}
})();
// ================================================================
// SmartCrick AI — Root Router v3.2
// Hash-based routing connecting all 30+ pages
// Registers ThemeProvider + ErrorBoundary + TopBar + BottomNav
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, createContext, useContext } = React;
const A = window.SC_APP;
const { createRoot, ErrorBoundary, ThemeCtx, useRoute, nav,
  TopBar, BottomNav, MoreMenu } = A;

// ── Pages that get full chrome (TopBar + BottomNav) ───────────────
const CHROME_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
]);
// Pages that get a back-arrow header but no bottom nav
const DETAIL_PAGES = new Set([
  'DrillDetail','MentalPlayer','MentalRoutines','MentalRoutinePlayer',
  'PracticeSession','WorkoutDetail','WorkoutPlayer','SkillPathDetail',
  'VideoAnalysis','Performance','ReactionDrill','NinetyDay','AIWorkout',
  'MatchTracker','MiniMatch','GetOut','TimerCustom',
]);

// ── Page Router ───────────────────────────────────────────────────
function getPage(name) {
  var P = A;
  var map = {
    // Core
    Home:           P.HomePage,
    // Drills
    Drills:         P.DrillsPage,
    DrillDetail:    P.DrillDetailPage,
    PracticeSession:P.PracticeSessionBuilderPage,
    ReactionDrill:  P.ReactionDrillPage,
    GetOut:         P.GetOutPage,
    VideoAnalysis:  P.VideoAnalysisPage,
    // Mental
    Mental:         P.MentalPage,
    MentalPlayer:   P.MentalPlayerPage,
    MentalRoutines: P.MentalRoutinesPage,
    MentalRoutinePlayer:P.MentalRoutinePlayerPage,
    // Fitness
    Fitness:        P.FitnessPage,
    WorkoutDetail:  P.WorkoutDetailPage,
    WorkoutPlayer:  P.WorkoutPlayerPage,
    AIWorkout:      P.AIWorkoutPage,
    // Timer
    Timer:          P.TimerPage,
    // Schedule
    Schedule:       P.SchedulePage,
    // Skill Paths
    SkillPaths:     P.SkillPathsPage,
    SkillPathDetail:P.SkillPathDetailPage,
    // Progress
    Progress:       P.ProgressPage,
    // Profile
    Profile:        P.ProfilePage,
    // Challenge
    ThirtyDay:      P.ThirtyDayPage,
    // Stubs / Others
    Leaderboard:    P.LeaderboardPage,
    AICoach:        P.AICoachPage,
    Performance:    P.PerformancePage,
    MatchLogger:    P.MatchLoggerPage,
    NinetyDay:      P.NinetyDayPage,
    MatchTracker:   P.MatchTrackerPage,
    MiniMatch:      P.MiniMatchPage,
    Quizzes:        P.QuizzesPage,
  };
  return map[name] || null;
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  var route = useRoute();
  var page  = route.page || 'Home';
  var params = route.params || {};
  var [dark, setDark]  = useState(true);
  var [menu, setMenu]  = useState(false);

  // Keep body background synced
  useEffect(function(){
    document.body.style.background = '#0d1117';
  }, []);

  // Scroll to top on page change
  useEffect(function(){
    window.scrollTo(0, 0);
  }, [page]);

  var PageComp = getPage(page);
  var showNav  = CHROME_PAGES.has(page);
  var showBar  = CHROME_PAGES.has(page) || DETAIL_PAGES.has(page);

  // Special full-screen pages (no chrome at all)
  var fullScreen = page === 'AICoach' || page === 'MentalPlayer' || page === 'MentalRoutinePlayer' ||
    page === 'WorkoutPlayer';

  return h(ThemeCtx.Provider, { value:{ dark:dark, toggle:function(){ setDark(function(d){return !d;}); }}},
    h(ErrorBoundary, null,

      // Top bar (for non-full-screen pages that have chrome)
      !fullScreen && showBar && h(TopBar, {
        page:page,
        onMenuOpen:function(){ setMenu(true); }
      }),

      // Page content
      h('div', {
        style:{
          paddingTop: (!fullScreen && showBar) ? 'calc(env(safe-area-inset-top,0px) + 52px)' : '0',
          minHeight:'100dvh', background:'#0d1117',
        }
      },
        PageComp
          ? h(PageComp, { params:params })
          : h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'20px', textAlign:'center' }},
              h('div', { style:{ fontSize:48, marginBottom:16 }}, '🏏'),
              h('h2', { style:{ fontSize:20, fontWeight:800, color:'#f0fdf4', marginBottom:8 }}, 'Page not found'),
              h('p', { style:{ fontSize:13, color:'#6b7280', marginBottom:20 }}, '"'+page+'" is not a valid page.'),
              h('button', { onClick:function(){ nav('Home'); },
                style:{ padding:'12px 24px', background:'#16a34a', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }},
                'Go Home')
            )
      ),

      // Bottom navigation
      !fullScreen && showNav && h(BottomNav, { currentPage:page }),

      // More menu overlay
      menu && h(MoreMenu, { onClose:function(){ setMenu(false); }})
    )
  );
}

// ── Mount ─────────────────────────────────────────────────────────
var rootEl = document.getElementById('root');
if (rootEl) {
  var root = A.createRoot(rootEl);
  root.render(h(AppShell, null));
  console.log('[SC] app-root v3.2 mounted — hash router active');
} else {
  console.error('[SC] ERROR: #root element not found');
}
})();
