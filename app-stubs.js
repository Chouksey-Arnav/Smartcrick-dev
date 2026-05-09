// ================================================================
// SmartCrick AI — Stub Pages (all coming-soon and new feature pages)
// app-stubs.js
// ================================================================
(function () {
'use strict';
const { createElement:h } = React;
const { nav } = window.SC_APP;
const { Icon } = window.SC_APP;

function StubPage({ title, icon='zap', desc }) {
  return h('div',{style:{paddingBottom:'7rem',display:'flex',flexDirection:'column',alignItems:'center',
    justifyContent:'center',textAlign:'center',padding:'6rem 1.5rem 7rem',minHeight:'80vh',background:'#0d1117'}},
    h('div',{style:{width:72,height:72,borderRadius:16,background:'rgba(22,27,34,0.9)',
      border:'1px solid rgba(48,54,61,0.9)',display:'flex',alignItems:'center',justifyContent:'center',
      marginBottom:24}},
      h(Icon,{n:icon,cls:'w-9 h-9',style:{color:'#484f58'}})
    ),
    h('h2',{style:{fontSize:'1.375rem',fontWeight:800,color:'#e6edf3',marginBottom:8,letterSpacing:'-0.02em'}},title),
    h('p',{style:{color:'#484f58',fontSize:'0.875rem',maxWidth:'22rem',lineHeight:1.7,marginBottom:32}},
      desc||'This feature is coming in the next update.'),
    h('button',{onClick:()=>nav('Home'),className:'btn-secondary',style:{width:'auto',padding:'10px 28px'}},
      'Go Home')
  );
}

// ── Premium stubs ─────────────────────────────────────────────────
function AICoachPage() {
  return h(StubPage,{title:'AI Head Coach',icon:'cpu',
    desc:"Your personal AI cricket coach — powered by SmartCrick's elite training intelligence."});
}

function NinetyDayPage() {
  return h(StubPage,{title:'90-Day Elite Program',icon:'diamond',
    desc:'A complete 90-day transformation program for serious cricketers. The full roadmap to elite performance.'});
}

// ── Tool stubs ────────────────────────────────────────────────────
function AIWorkoutPage() {
  return h(StubPage,{title:'AI Workout Creator',icon:'sparkles',
    desc:'Tell the AI what you need — it generates your perfect personalized workout instantly.'});
}

function MatchTrackerPage() {
  return h(StubPage,{title:'Match Tracker',icon:'list',
    desc:'Log every match performance: runs, wickets, catches, milestones, and memorable moments.'});
}

function MiniMatchPage() {
  return h(StubPage,{title:'MiniMatch IQ',icon:'puzzle',
    desc:'Cricket tactical decision scenarios. What would you do? Train your cricket brain with real match simulations.'});
}

function GetOutPage() {
  return h(StubPage,{title:'Why Did I Get Out?',icon:'helpCircle',
    desc:'Analyze your dismissal type, understand the pattern, and eliminate the weakness from your game permanently.'});
}

function QuizzesPage() {
  return h(StubPage,{title:'Cricket Quizzes',icon:'book',
    desc:'Test your cricket knowledge — rules, history, tactics, and technical questions at every difficulty level.'});
}

// ── AI & Analytics stubs (new pages referenced in router) ─────────
function VideoAnalysisPage() {
  return h(StubPage,{title:'Video Analysis',icon:'cpu',
    desc:'Upload or record your batting/bowling and get AI-powered technique feedback with frame-by-frame pose analysis.'});
}

function PerformancePage() {
  return h(StubPage,{title:'Performance Analytics',icon:'chartLine',
    desc:'Deep performance insights: wagon wheels, pitch maps, shot charts, and trend analysis across all your sessions.'});
}

function MatchLoggerPage() {
  return h(StubPage,{title:'Match Logger',icon:'list',
    desc:'Log deliveries ball-by-ball in real time. Build a full picture of your match performances over the season.'});
}

function ReactionDrillPage() {
  return h(StubPage,{title:'Reaction Drill',icon:'zap',
    desc:'Train your reaction time with randomized visual stimuli. Measurably sharpen your reflexes for batting and catching.'});
}

Object.assign(window.SC_APP, {
  StubPage,
  AICoachPage, NinetyDayPage,
  AIWorkoutPage, MatchTrackerPage, MiniMatchPage, GetOutPage, QuizzesPage,
  VideoAnalysisPage, PerformancePage, MatchLoggerPage, ReactionDrillPage,
});
console.log('[SC] app-stubs ready');
})();
