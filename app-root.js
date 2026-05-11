// Save as: app-root.js
// ================================================================
// SmartCrick AI — Root Router v3.4
// FIXES: Removed duplicate IIFE (was causing infinite splash loop)
//        Added CricketDNA + DailyNet viral pages
//        Assessment route confirmed
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect } = React;
const A = window.SC_APP;
const { createRoot, ErrorBoundary, ThemeCtx, useRoute, nav,
  TopBar, BottomNav, MoreMenu } = A;

// ── Pages with full chrome (TopBar + BottomNav) ───────────────────
const CHROME_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
]);

// ── Pages with back-arrow only, no bottom nav ─────────────────────
const DETAIL_PAGES = new Set([
  'DrillDetail','MentalPlayer','MentalRoutines','MentalRoutinePlayer',
  'PracticeSession','WorkoutDetail','WorkoutPlayer','SkillPathDetail',
  'VideoAnalysis','Performance','ReactionDrill','NinetyDay','AIWorkout',
  'MatchTracker','MiniMatch','GetOut','TimerCustom','Assessment',
  'CricketDNA','DailyNet',
]);

// ── Page map ──────────────────────────────────────────────────────
function getPage(name) {
  var P = A;
  var map = {
    Home:                P.HomePage,
    Drills:              P.DrillsPage,
    DrillDetail:         P.DrillDetailPage,
    PracticeSession:     P.PracticeSessionBuilderPage,
    ReactionDrill:       P.ReactionDrillPage,
    GetOut:              P.GetOutPage,
    VideoAnalysis:       P.VideoAnalysisPage,
    Mental:              P.MentalPage,
    MentalPlayer:        P.MentalPlayerPage,
    MentalRoutines:      P.MentalRoutinesPage,
    MentalRoutinePlayer: P.MentalRoutinePlayerPage,
    Fitness:             P.FitnessPage,
    WorkoutDetail:       P.WorkoutDetailPage,
    WorkoutPlayer:       P.WorkoutPlayerPage,
    AIWorkout:           P.AIWorkoutPage,
    Timer:               P.TimerPage,
    Schedule:            P.SchedulePage,
    SkillPaths:          P.SkillPathsPage,
    SkillPathDetail:     P.SkillPathDetailPage,
    Progress:            P.ProgressPage,
    Assessment:          P.AssessmentPage,
    Profile:             P.ProfilePage,
    ThirtyDay:           P.ThirtyDayPage,
    Leaderboard:         P.LeaderboardPage,
    AICoach:             P.AICoachPage,
    Performance:         P.PerformancePage,
    MatchLogger:         P.MatchLoggerPage,
    NinetyDay:           P.NinetyDayPage,
    MatchTracker:        P.MatchTrackerPage,
    MiniMatch:           P.MiniMatchPage,
    Quizzes:             P.QuizzesPage,
    // Viral features
    CricketDNA:          P.CricketDNAPage,
    DailyNet:            P.DailyNetPage,
  };
  return map[name] || null;
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  var route   = useRoute();
  var page    = route.page || 'Home';
  var params  = route.params || {};
  var [dark,  setDark] = useState(true);
  var [menu,  setMenu] = useState(false);

  useEffect(function(){ document.body.style.background = '#0d1117'; }, []);
  useEffect(function(){ window.scrollTo(0, 0); }, [page]);

  // ── P5-A Onboarding gate ─────────────────────────────────────
  var user = A.DB.getUser();
  if (!user.onboardDone) {
    return h(ThemeCtx.Provider, { value:{ dark:true, toggle:function(){} }},
      h(ErrorBoundary, null, h(A.OnboardPage, null))
    );
  }

  var PageComp   = getPage(page);
  var showNav    = CHROME_PAGES.has(page);
  var showBar    = CHROME_PAGES.has(page) || DETAIL_PAGES.has(page);
  var fullScreen = page === 'AICoach' || page === 'MentalPlayer' ||
                   page === 'MentalRoutinePlayer' || page === 'WorkoutPlayer';

  return h(ThemeCtx.Provider, { value:{ dark:dark, toggle:function(){ setDark(function(d){ return !d; }); }}},
    h(ErrorBoundary, null,
      !fullScreen && showBar && h(TopBar, {
        page: page,
        onMenuOpen: function(){ setMenu(true); }
      }),
      h('div', {
        style:{
          paddingTop: (!fullScreen && showBar) ? 'calc(env(safe-area-inset-top,0px) + 52px)' : '0',
          minHeight: '100dvh', background: '#0d1117',
        }
      },
        PageComp
          ? h(PageComp, { params: params })
          : h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', padding:'20px', textAlign:'center' }},
              h('div', { style:{ fontSize:48, marginBottom:16 }}, '🏏'),
              h('h2', { style:{ fontSize:20, fontWeight:800, color:'#f0fdf4', marginBottom:8 }}, 'Page not found'),
              h('p', { style:{ fontSize:13, color:'#6b7280', marginBottom:20 }}, '"'+page+'" is not available.'),
              h('button', { onClick:function(){ nav('Home'); },
                style:{ padding:'12px 24px', background:'#16a34a', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }},
                'Go Home')
            )
      ),
      !fullScreen && showNav && h(BottomNav, { currentPage: page }),
      menu && h(MoreMenu, { onClose: function(){ setMenu(false); }})
    )
  );
}

// ── Mount — only once ────────────────────────────────────────────
var rootEl = document.getElementById('root');
if (rootEl) {
  var root = createRoot(rootEl);
  root.render(h(AppShell, null));
  console.log('[SC] app-root v3.4 — single mount, viral pages registered');
} else {
  console.error('[SC] FATAL: #root element not found in DOM');
}

})(); // ← ONE closing bracket only. Never duplicate this file's IIFE.
