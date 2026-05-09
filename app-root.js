// ================================================================
// SmartCrick AI — AppRoot + mount
// app-root.js  ·  loads LAST — all other files must be loaded first
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect } = React;
const A = window.SC_APP;

// Pull everything from SC_APP
const { createRoot, ThemeCtx, useRoute, nav, DB } = A;
const { ErrorBoundary, Sidebar, BottomNav, Icon } = A;

// Pages
const {
  HomePage, DrillsPage, DrillDetailPage,
  MentalPage, MentalPlayerPage,
  FitnessPage, WorkoutDetailPage,
  TimerPage, SchedulePage,
  ProgressPage, SkillPathsPage,
  ThirtyDayPage, LeaderboardPage, GoalsPage,
  ProfilePage, SettingsPage,
  AICoachPage, NinetyDayPage,
  AIWorkoutPage, MatchTrackerPage, MiniMatchPage, GetOutPage, QuizzesPage,
  VideoAnalysisPage, PerformancePage, MatchLoggerPage, ReactionDrillPage,
} = A;

function AppRoot() {
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [dark,setDark]=useState(()=>{ const s=DB.get('theme'); return s!==null?s:true; });
  const {page,params}=useRoute();

  useEffect(()=>{
    document.documentElement.classList.toggle('dark',dark);
    DB.set('theme',dark);
  },[dark]);

  useEffect(()=>{
    if(typeof applyChartDefaults==='function') applyChartDefaults();
    if(typeof migrateLSToPouchDB==='function') migrateLSToPouchDB();
    if(!window.location.hash||window.location.hash==='#'||window.location.hash==='#/') {
      window.location.hash='#/Home';
    }
  },[]);

  useEffect(()=>{ setSidebarOpen(false); },[page]);

  const theme={dark,toggle:()=>setDark(d=>!d)};
  const fullscreenPages=['MentalPlayer'];
  const isFS=fullscreenPages.includes(page);

  function renderPage() {
    switch(page) {
      case 'Home':         return h(HomePage);
      case 'Drills':       return h(DrillsPage);
      case 'DrillDetail':  return h(DrillDetailPage,{params});
      case 'Mental':       return h(MentalPage);
      case 'MentalPlayer': return h(MentalPlayerPage,{params});
      case 'Fitness':      return h(FitnessPage);
      case 'WorkoutDetail':return h(WorkoutDetailPage,{params});
      case 'Timer':        return h(TimerPage);
      case 'Schedule':     return h(SchedulePage);
      case 'Progress':     return h(ProgressPage);
      case 'SkillPaths':   return h(SkillPathsPage);
      case 'ThirtyDay':    return h(ThirtyDayPage);
      case 'Leaderboard':  return h(LeaderboardPage);
      case 'Goals':        return h(GoalsPage);
      case 'Profile':      return h(ProfilePage);
      case 'Settings':     return h(SettingsPage);
      case 'AICoach':      return h(AICoachPage);
      case 'NinetyDay':    return h(NinetyDayPage);
      case 'AIWorkout':    return h(AIWorkoutPage);
      case 'MatchTracker': return h(MatchTrackerPage);
      case 'MiniMatch':    return h(MiniMatchPage);
      case 'GetOut':       return h(GetOutPage);
      case 'Quizzes':      return h(QuizzesPage);
      case 'VideoAnalysis':return h(VideoAnalysisPage);
      case 'Performance':  return h(PerformancePage);
      case 'MatchLogger':  return h(MatchLoggerPage);
      case 'ReactionDrill':return h(ReactionDrillPage);
      default:             return h(HomePage);
    }
  }

  return h(ThemeCtx.Provider,{value:theme},
    // ── Top bar ───────────────────────────────────────────────
    !isFS && h('div',{
      style:{position:'fixed',top:0,left:0,right:0,zIndex:30,display:'flex',alignItems:'center',gap:'0.75rem',
        paddingLeft:'1rem',paddingRight:'1rem',paddingBottom:'0.75rem',
        paddingTop:'max(0.75rem,env(safe-area-inset-top))',
        background:'rgba(2,6,23,0.9)',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
        borderBottom:'1px solid rgba(16,185,129,0.08)'}
    },
      h('button',{onClick:()=>setSidebarOpen(true),
        style:{width:36,height:36,borderRadius:'0.75rem',display:'flex',alignItems:'center',justifyContent:'center',
          background:'rgba(255,255,255,0.05)',border:'1px solid rgba(51,65,85,0.5)',flexShrink:0,cursor:'pointer'}},
        h(Icon,{n:'menu',cls:'w-5 h-5',style:{color:'#94a3b8'}})
      ),
      h('div',{style:{display:'flex',alignItems:'center',gap:8}},
        h(Icon,{n:'bat',cls:'w-4 h-4',style:{color:'#16a34a'}}),
        h('span',{style:{fontSize:14,fontWeight:800,color:'#e6edf3',letterSpacing:'0.02em'}},'SMARTCRICK')
      ),
      h('div',{style:{flex:1}}),
      (()=>{
        const s=DB.getProgress().current_streak||0;
        if(!s) return null;
        return h('div',{style:{display:'flex',alignItems:'center',gap:4,fontSize:'0.75rem',fontWeight:800,color:'#fb923c',
          background:'rgba(249,115,22,0.08)',border:'1px solid rgba(249,115,22,0.2)',padding:'4px 10px',borderRadius:6}},
          h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}),s,'d');
      })()
    ),

    h(Sidebar,{open:sidebarOpen,onClose:()=>setSidebarOpen(false),currentPage:page}),

    h('main',{style:{minHeight:'100dvh',background:dark?'#020617':'#f8fafc'}},renderPage()),

    !isFS && h(BottomNav,{page})
  );
}

// ── Mount ─────────────────────────────────────────────────────────
const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    createRoot(rootEl).render(h(ErrorBoundary, null, h(AppRoot)));
    console.log('[SC] SmartCrick AI mounted successfully');
  } catch(e) {
    rootEl.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;color:#94a3b8;font-family:system-ui;text-align:center;padding:2rem;background:#020617">
      <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
      <p style="font-size:1.125rem;font-weight:700;color:#f8fafc;margin-bottom:0.5rem">Failed to load</p>
      <p style="font-size:0.875rem">Please check your internet connection and reload.</p>
      <p style="font-size:0.75rem;margin-top:1rem;color:#475569">${e.message}</p>
    </div>`;
  }
} else {
  console.error('SmartCrick: #root element not found');
}

})();
