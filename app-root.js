// app-root.js v5.2 — page transitions via Framer Motion + zero-latency BottomNav sound
// Changes from v5.1:
// 1. Framer Motion AnimatePresence wraps page content for smooth page transitions
// 2. Graceful fallback: if framer-motion CDN fails, renders without animation
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var A = window.SC_APP;

// ── Framer Motion — graceful fallback if CDN unavailable ──────────
var _FM  = window.framerMotion || window.FramerMotion || null;
var _AP  = _FM ? _FM.AnimatePresence : null;  // AnimatePresence
var _mDiv = (_FM && _FM.motion) ? _FM.motion.div : null; // motion.div
if (!_FM) console.warn('[SC] Framer Motion not loaded — page transitions disabled');

function safeComp(comp, props, children) {
  if (typeof comp !== 'function' && typeof comp !== 'object') return null;
  return children !== undefined ? h(comp, props, children) : h(comp, props);
}

var createRoot    = A.createRoot;
var ErrorBoundary = A.ErrorBoundary;
var ThemeCtx      = A.ThemeCtx;
var useRoute      = A.useRoute;
var nav           = A.nav;

var CHROME_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
]);

var STANDARD_PAGES = new Set([
  'Home','Drills','Mental','Fitness','Progress','Profile','Schedule',
  'ThirtyDay','SkillPaths','Leaderboard','Timer','Quizzes','MatchLogger',
  'DrillDetail','MentalPlayer','MentalRoutines','MentalRoutinePlayer',
  'PracticeSession','WorkoutDetail','WorkoutPlayer','SkillPathDetail',
  'VideoAnalysis','Performance','ReactionDrill','NinetyDay','AIWorkout',
  'MatchTracker','MiniMatch','GetOut','Assessment','CricketDNA','DailyNet',
  'IntelligenceHub',
]);

var FULLSCREEN_PAGES = new Set([
  'AICoach','MentalPlayer','MentalRoutinePlayer','WorkoutPlayer',
]);

var PAGE_LABELS = {
  Home:'SmartCrick', Drills:'Cricket Drills', Mental:'Mental Training',
  Fitness:'Fitness', Progress:'Progress', Profile:'Profile',
  Schedule:'Schedule', ThirtyDay:'30-Day Challenge', SkillPaths:'Skill Paths',
  Leaderboard:'Leaderboard', Timer:'Timer', Quizzes:'Quizzes',
  MatchLogger:'Match Logger', Performance:'Analytics',
  AICoach:'AI Coach', Assessment:'Skill Assessment',
  CricketDNA:'Cricket DNA', DailyNet:'Daily Net',
  IntelligenceHub:'Cricket Intelligence',
  NinetyDay:'90-Day Program', MatchTracker:'Match Tracker',
  MiniMatch:'MiniMatch IQ', DrillDetail:'Drill', WorkoutDetail:'Workout',
  VideoAnalysis:'ProVision™',
};

function getPage(name) {
  var P = A;
  var map = {
    Home:P.HomePage, Drills:P.DrillsPage, DrillDetail:P.DrillDetailPage,
    PracticeSession:P.PracticeSessionBuilderPage,
    ReactionDrill:P.ReactionDrillPage,
    GetOut:P.GetOutPage, VideoAnalysis:P.VideoAnalysisPage,
    Mental:P.MentalPage, MentalPlayer:P.MentalPlayerPage,
    MentalRoutines:P.MentalRoutinesPage,
    MentalRoutinePlayer:P.MentalRoutinePlayerPage,
    Fitness:P.FitnessPage, WorkoutDetail:P.WorkoutDetailPage,
    WorkoutPlayer:P.WorkoutPlayerPage, AIWorkout:P.AIWorkoutPage,
    Timer:P.TimerPage, Schedule:P.SchedulePage,
    SkillPaths:P.SkillPathsPage, SkillPathDetail:P.SkillPathDetailPage,
    Progress:P.ProgressPage, Assessment:P.AssessmentPage,
    Profile:P.ProfilePage, ThirtyDay:P.ThirtyDayPage,
    Leaderboard:P.LeaderboardPage, AICoach:P.AICoachPage,
    Performance:P.PerformancePage, MatchLogger:P.MatchLoggerPage,
    NinetyDay:P.NinetyDayPage, MatchTracker:P.MatchTrackerPage,
    MiniMatch:P.MiniMatchPage, Quizzes:P.QuizzesPage,
    CricketDNA:P.CricketDNAPage, DailyNet:P.DailyNetPage,
    IntelligenceHub:P.IntelligenceHubPage,
  };
  return map[name] || null;
}

function NotFound(props) {
  return h('div', {
    style:{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'70vh',
      padding:'20px', textAlign:'center',
    }
  },
    h('div', { style:{ fontSize:48, marginBottom:16 } }, '🏏'),
    h('h2', { style:{ fontSize:20, fontWeight:800, color:'#f0fdf4', marginBottom:8 } },
      'Page not found'),
    h('p', { style:{ fontSize:13, color:'#6b7280', marginBottom:20 } },
      '"'+(props.page||'')+'" is not available.'),
    h('button', {
      onClick:function(){ nav('Home'); },
      style:{
        padding:'12px 24px', background:'#16a34a', color:'#fff',
        border:'none', borderRadius:10, cursor:'pointer',
        fontFamily:'inherit', fontWeight:700,
      }
    }, 'Go Home')
  );
}

// ── App Shell ─────────────────────────────────────────────────────
function AppShell() {
  var route    = useRoute();
  var page     = route.page || 'Home';
  var params   = route.params || {};
  var [dark, setDark]       = useState(true);
  var [menuOpen, setMenuOpen] = useState(false);

  // Daily reward state
  var [dailyReward, setDailyReward] = useState(null);   // { reward, state } or null
  var [showReward, setShowReward]   = useState(false);

  // Reset scroll + close drawer on page change
  useEffect(function() {
    window.scrollTo(0, 0);
    setMenuOpen(false);
  }, [page]);

  // Body background
  useEffect(function() {
    document.body.style.background = '#0d1117';
    document.body.style.margin     = '0';
    document.body.style.padding    = '0';
  }, []);

  // ── Daily reward check (runs once on mount, after onboarding guard) ──
  useEffect(function() {
    var user = A.DB.getUser();
    if (!user.onboardDone) return; // don't show reward during onboarding
    if (!A.initDailyReward) return;

    // Small delay so the app renders first
    var t = setTimeout(function() {
      var result = A.initDailyReward();
      if (result && !result.alreadyClaimed && result.reward) {
        setDailyReward(result);
        setShowReward(true);
      }
    }, 800);
    return function() { clearTimeout(t); };
  }, []);

  // ── Onboarding gate ───────────────────────────────────────────
  var user = A.DB.getUser();
  if (!user.onboardDone) {
    if (!A.OnboardPage) {
      return h('div', {
        style:{
          display:'flex', alignItems:'center', justifyContent:'center',
          minHeight:'100dvh', background:'#0d1117', color:'#6b7280', fontSize:14,
        }
      }, 'Loading SmartCrick...');
    }
    return h(ThemeCtx.Provider, { value:{ dark:true, toggle:function(){} } },
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

  var topPad = showTopBar
    ? 'calc(52px + env(safe-area-inset-top, 0px))'
    : '0px';
  var botPad = showBottomNav
    ? 'calc(58px + env(safe-area-inset-bottom, 0px))'
    : '0px';

  return h(ThemeCtx.Provider, {
    value:{ dark:dark, toggle:function(){ setDark(function(d){ return !d; }); } }
  },
    h(ErrorBoundary, null,

      // Outer flex wrapper
      h('div', {
        style:{
          display:'flex',
          flexDirection:'row',
          minHeight:'100dvh',
          width:'100%',          // ← ensure full viewport width
          background:'#0d1117',
        }
      },

        // Desktop sidebar
        h('div', { className:'sc-desktop-sidebar' },
          A.DesktopSidebar ? h(A.DesktopSidebar, { currentPage:page }) : null
        ),

        // Main content column
        h('div', {
          style:{
            flex:1,
            minWidth:0,
            display:'flex',
            flexDirection:'column',
            minHeight:'100dvh',
            overflowX:'hidden',   // ← was 'hidden' (both axes) — now only X, so Y scrolls
            position:'relative',
            width:'100%',
          }
        },

          // Mobile TopBar
          showTopBar
            ? h('div', { className:'sc-mobile-only' },
                A.TopBar
                  ? h(A.TopBar, { title:pageTitle, onMenuOpen:function(){ setMenuOpen(true); } })
                  : null
              )
            : null,

          // Page content — wrapped in AnimatePresence for smooth page transitions
          // The outer div holds padding; only the inner motion.div slides/fades.
          // Static chrome (TopBar, BottomNav, Sidebar) is NOT inside this wrapper.
            h('div', {
            style:{
              flex:1,
              paddingTop:topPad,
              paddingBottom:botPad,
              width:'100%',        // ← fill full available width
              boxSizing:'border-box',
              overflowY:'auto',
              WebkitOverflowScrolling:'touch',
            }
          },
            _AP && _mDiv
              ? h(_AP, { mode:'wait' },
                  h(_mDiv, {
                    key: page,
                    initial:    { opacity:0, x:18 },
                    animate:    { opacity:1, x:0  },
                    exit:       { opacity:0, x:-18 },
                    transition: { type:'tween', ease:'easeInOut', duration:0.22 },
                    style:      { width:'100%' },
                  },
                    PageComp
                      ? h(PageComp, { params:params })
                      : h(NotFound, { page:page })
                  )
                )
              : (PageComp
                  ? h(PageComp, { params:params })
                  : h(NotFound, { page:page }))
          ),

          // Mobile BottomNav
          showBottomNav
            ? h('div', { className:'sc-mobile-only' },
                A.BottomNav
                  ? h(A.BottomNav, { page:page })
                  : null
              )
            : null
        )
      ),

      // Mobile sidebar drawer
      A.Sidebar
        ? h(A.Sidebar, {
            open:menuOpen,
            onClose:function(){ setMenuOpen(false); },
            currentPage:page,
          })
        : null,

      // ── Daily Reward Modal ──────────────────────────────────────
      showReward && dailyReward && A.DailyRewardModal
        ? h(A.DailyRewardModal, {
            reward:  dailyReward.reward,
            state:   dailyReward.state,
            onClose: function() { setShowReward(false); },
          })
        : null,

      // ── Kudos Overlay — fires on drill/level/ring-complete events ─
      A.KudosOverlay ? h(A.KudosOverlay, null) : null,

      // ── Card Pack Reveal Overlay ─────────────────────────────────
      A.CardPackRevealOverlay ? h(A.CardPackRevealOverlay, null) : null,

      // ── Mascot Controller singleton (renders null, drives GSAP) ──
      A.MascotController ? h(A.MascotController, null) : null,

      // ── Persistent MascotSVG — always in DOM so GSAP has a target ─
      // Sits fixed at bottom-right, subtle in idle, animated on cheer.
      A.Mascot ? h('div', {
        id: 'em-mascot-fixed-host',
        style: {
          position: 'fixed', bottom: 70, right: 12, zIndex: 200,
          pointerEvents: 'none', opacity: 0.18,
          transition: 'opacity 0.4s ease',
        },
      }, h(A.Mascot, { size: 'sm' })) : null
    )
  );
}

// ── Mount ─────────────────────────────────────────────────────────
var rootEl = document.getElementById('root');
if (!rootEl) {
  console.error('[SC] FATAL: #root element missing');
} else {
  try {
    createRoot(rootEl).render(h(AppShell, null));
    console.log('[SC] app-root v5.2 — mounted ✓ (page transitions + audio tick)');
  } catch(e) {
    console.error('[SC] Mount failed:', e);
    rootEl.innerHTML = '<div style="color:#f0fdf4;padding:40px;text-align:center;background:#0d1117;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:3rem;margin-bottom:1rem">🏏</div><h2>SmartCrick failed to start</h2><p style="color:#6b7280">Open DevTools → Console for details.</p><button onclick="location.reload()" style="margin-top:1rem;padding:12px 24px;background:#16a34a;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:15px">Retry</button></div>';
  }
}
})();
