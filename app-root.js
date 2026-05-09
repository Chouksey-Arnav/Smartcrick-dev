// ================================================================
// Save as: app-root.js
// SmartCrick AI — AppRoot v3.2
// LAYOUT FIX: Desktop content fills full available width.
//   - No max-width restriction on outer content area
//   - Page content gets proper horizontal padding on desktop
//   - Mobile: unchanged (top bar + drawer + bottom nav)
//   - Full-screen pages bypass sidebar layout entirely
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect } = React;
const A = window.SC_APP;
const {
  createRoot, ThemeCtx, useRoute, nav, DB,
  ErrorBoundary, DesktopSidebar, Sidebar, BottomNav, Icon,
  HomePage, DrillsPage, DrillDetailPage, PracticeSessionBuilderPage,
  MentalPage, MentalPlayerPage, MentalRoutinesPage, MentalRoutinePlayerPage,
  FitnessPage, WorkoutDetailPage,
  TimerPage, SchedulePage, ProgressPage, SkillPathsPage,
  ThirtyDayPage, LeaderboardPage, GoalsPage, ProfilePage, SettingsPage,
  AICoachPage, NinetyDayPage, AIWorkoutPage, MatchTrackerPage,
  MiniMatchPage, GetOutPage, QuizzesPage,
  VideoAnalysisPage, PerformancePage, MatchLoggerPage, ReactionDrillPage,
} = A;

function AppRoot() {
  const [mobileOpen,   setMobileOpen]  = useState(false);
  const [isDesktop,    setIsDesktop]   = useState(()=>window.innerWidth>=768);
  const [dark,         setDark]        = useState(()=>{ const s=DB.get('theme'); return s!==null?s:true; });
  const { page, params } = useRoute();

  useEffect(()=>{
    const h=()=>setIsDesktop(window.innerWidth>=768);
    window.addEventListener('resize',h);
    return()=>window.removeEventListener('resize',h);
  },[]);

  useEffect(()=>{
    document.documentElement.classList.toggle('dark',dark);
    DB.set('theme',dark);
  },[dark]);

  useEffect(()=>{
    if(typeof applyChartDefaults==='function') applyChartDefaults();
    if(!window.location.hash||window.location.hash==='#'||window.location.hash==='#/'){
      window.location.hash='#/Home';
    }
  },[]);

  useEffect(()=>{ setMobileOpen(false); },[page]);

  const theme = { dark, toggle:()=>setDark(d=>!d) };
  // Pages that need full viewport (no sidebar, no chrome)
  const fullscreenPages = ['MentalPlayer','MentalRoutinePlayer'];
  const isFS = fullscreenPages.includes(page);

  function renderPage() {
    switch(page) {
      case 'Home':                return h(HomePage);
      case 'Drills':              return h(DrillsPage);
      case 'DrillDetail':         return h(DrillDetailPage,{params});
      case 'PracticeSession':     return h(PracticeSessionBuilderPage);
      case 'Mental':              return h(MentalPage);
      case 'MentalPlayer':        return h(MentalPlayerPage,{params});
      case 'MentalRoutines':      return h(MentalRoutinesPage,{params});
      case 'MentalRoutinePlayer': return h(MentalRoutinePlayerPage,{params});
      case 'Fitness':             return h(FitnessPage);
      case 'WorkoutDetail':       return h(WorkoutDetailPage,{params});
      case 'Timer':               return h(TimerPage);
      case 'Schedule':            return h(SchedulePage);
      case 'Progress':            return h(ProgressPage);
      case 'SkillPaths':          return h(SkillPathsPage);
      case 'ThirtyDay':           return h(ThirtyDayPage);
      case 'Leaderboard':         return h(LeaderboardPage);
      case 'Goals':               return h(GoalsPage);
      case 'Profile':             return h(ProfilePage);
      case 'Settings':            return h(SettingsPage);
      case 'AICoach':             return h(AICoachPage);
      case 'NinetyDay':           return h(NinetyDayPage);
      case 'AIWorkout':           return h(AIWorkoutPage);
      case 'MatchTracker':        return h(MatchTrackerPage);
      case 'MiniMatch':           return h(MiniMatchPage);
      case 'GetOut':              return h(GetOutPage);
      case 'Quizzes':             return h(QuizzesPage);
      case 'VideoAnalysis':       return h(VideoAnalysisPage);
      case 'Performance':         return h(PerformancePage);
      case 'MatchLogger':         return h(MatchLoggerPage);
      case 'ReactionDrill':       return h(ReactionDrillPage);
      default:                    return h(HomePage);
    }
  }

  return h(ThemeCtx.Provider,{value:theme},

    // ── DESKTOP LAYOUT (≥768px) ──────────────────────────────────
    isDesktop && !isFS && h('div',{style:{
      display:'flex',
      flexDirection:'row',
      height:'100dvh',
      overflow:'hidden',
      background:'#0d1117',
    }},
      // Persistent sidebar — 260px fixed width
      h(DesktopSidebar,{currentPage:page}),

      // Scrollable content — flex:1 fills ALL remaining width
      h('main',{
        id:'desktop-main',
        style:{
          flex:1,
          height:'100dvh',
          overflowY:'auto',
          overflowX:'hidden',
          background:dark?'#0d1117':'#f8fafc',
          minWidth:0, // CRITICAL: prevents flex child from overflowing
        }
      },
        // NO maxWidth restriction here — let page content use full width.
        // Individual pages add their own padding as needed.
        renderPage()
      )
    ),

    // ── FULLSCREEN DESKTOP (mental player, routine player) ───────
    isDesktop && isFS && h('div',{style:{
      minHeight:'100dvh',
      background:'#0d1117',
    }},
      renderPage()
    ),

    // ── MOBILE LAYOUT (<768px) ───────────────────────────────────
    !isDesktop && h('div',{style:{
      minHeight:'100dvh',
      background:dark?'#0d1117':'#f8fafc',
      display:'flex',
      flexDirection:'column',
    }},
      // Top bar
      !isFS && h('div',{style:{
        position:'fixed',top:0,left:0,right:0,zIndex:30,
        display:'flex',alignItems:'center',gap:12,
        paddingLeft:16,paddingRight:16,paddingBottom:10,
        paddingTop:'max(10px,env(safe-area-inset-top))',
        background:'rgba(8,11,15,0.95)',
        backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(36,42,50,0.85)',
      }},
        h('button',{
          onClick:()=>setMobileOpen(true),
          style:{width:36,height:36,borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center',
            background:'rgba(255,255,255,0.05)',border:'1px solid rgba(48,54,61,0.5)',flexShrink:0,cursor:'pointer',border:'none'}
        },
          h(Icon,{n:'menu',cls:'w-5 h-5',style:{color:'#94a3b8'}})
        ),
        h('div',{style:{display:'flex',alignItems:'center',gap:8}},
          h(Icon,{n:'bat',cls:'w-4 h-4',style:{color:'#16a34a'}}),
          h('span',{style:{fontSize:14,fontWeight:800,color:'#e6edf3',letterSpacing:'0.02em'}}),'SMARTCRICK'
        ),
        h('div',{style:{flex:1}}),
        (()=>{ const s=DB.getProgress().current_streak||0; if(!s) return null;
          return h('div',{style:{display:'flex',alignItems:'center',gap:4,fontSize:12,fontWeight:800,color:'#fb923c',
            background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',padding:'4px 10px',borderRadius:6}},
            h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}),s,'d');
        })()
      ),

      !isFS && h(Sidebar,{open:mobileOpen,onClose:()=>setMobileOpen(false),currentPage:page}),

      h('main',{style:{flex:1,minHeight:'100dvh',background:dark?'#0d1117':'#f8fafc'}},
        renderPage()
      ),

      !isFS && h(BottomNav,{page})
    )
  );
}

// Mount
const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    createRoot(rootEl).render(h(ErrorBoundary,null,h(AppRoot)));
    console.log('[SC] SmartCrick v3.2 mounted');
  } catch(e) {
    rootEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#94a3b8;font-family:system-ui;text-align:center;padding:2rem;background:#020617"><p style="font-size:1.125rem;font-weight:700;color:#f8fafc">Failed to load: ${e.message}</p></div>`;
  }
} else { console.error('SmartCrick: #root not found'); }
})();
