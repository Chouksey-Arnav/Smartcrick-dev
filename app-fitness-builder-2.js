// ================================================================
// app-fitness-builder-2.js — FitnessBuilder2Page (top-level)
// Gates on FB2 profile → Onboarding → Home / Library / Progress
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, Fragment } = React;
const A = window.SC_APP;
const FB2 = A.FB2;
const C = FB2.FB2_PALETTE.dark;
const { nav, DB, PageHeader } = A;

// ── Progress / log tab ────────────────────────────────────────
function ProgressTab({ log, plan }) {
  if (!log.length) {
    return h('div', { style:{ textAlign:'center', padding:'40px 20px', color:C.sub }},
      h('div', { style:{ fontSize:44, marginBottom:12 }}, '📊'),
      h('div', { style:{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}, 'No sessions yet'),
      h('div', { style:{ fontSize:13, color:C.sub }}, 'Complete your first workout to start tracking progress.')
    );
  }
  var recent = log.slice().reverse().slice(0,10);
  var totalSessions = log.length;
  var totalMinutes  = log.reduce(function(a,e){ return a + Math.round((e.durationSec||0)/60); }, 0);
  var totalEx       = log.reduce(function(a,e){ return a + (e.exercisesCompleted||0); }, 0);
  return h('div', null,
    h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }},
      [
        { icon:'🏋️', label:'Sessions', val:totalSessions },
        { icon:'⏱️', label:'Minutes', val:totalMinutes },
        { icon:'💪', label:'Exercises', val:totalEx },
      ].map(function(s,i) {
        return h('div', { key:i, style:{
          padding:'13px', borderRadius:13, background:C.card, border:'1px solid '+C.border, textAlign:'center',
        }},
          h('div', { style:{ fontSize:20, marginBottom:4 }}, s.icon),
          h('div', { style:{ fontSize:'1.3rem', fontWeight:900, color:C.accent }}, s.val),
          h('div', { style:{ fontSize:10, color:C.dim, fontWeight:700, marginTop:2 }}, s.label)
        );
      })
    ),
    h('div', { style:{ fontSize:11, color:C.dim, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}, 'Recent sessions'),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:8 }},
      recent.map(function(entry, i) {
        var d = new Date(entry.completedAt || entry.startedAt || Date.now());
        return h('div', { key:i, style:{
          display:'flex', gap:12, padding:'13px 14px', borderRadius:13,
          background:C.card, border:'1px solid '+C.border,
        }},
          h('div', { style:{
            width:38, height:38, borderRadius:10, background:'rgba(22,163,74,0.12)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
          }}, '✅'),
          h('div', { style:{ flex:1, minWidth:0 }},
            h('div', { style:{ fontSize:13.5, fontWeight:800, color:C.text, marginBottom:2 }},
              (entry.exercisesCompleted || 0) + ' / ' + (entry.totalExercises || '?') + ' exercises'
            ),
            h('div', { style:{ fontSize:11, color:C.sub }},
              Math.round((entry.durationSec||0)/60) + ' min · ' +
              d.toLocaleDateString([], {month:'short',day:'numeric'})
            )
          )
        );
      })
    )
  );
}

// ── Home / plan tab ───────────────────────────────────────────
function HomeTab({ profile, plan, onStartSession, onResetProfile }) {
  var goal = FB2.FB2_GOALS.find(function(g){ return g.id === (profile.goal||'strength'); }) || FB2.FB2_GOALS[0];
  var lvl  = FB2.FB2_LEVELS.find(function(l){ return l.id === (profile.level||'beginner'); }) || FB2.FB2_LEVELS[0];

  return h('div', null,
    // Profile banner
    h('div', { style:{
      padding:'14px 16px', borderRadius:16, marginBottom:14,
      background:'linear-gradient(135deg,rgba(22,27,34,0.98),rgba(13,17,23,0.95))',
      border:'1px solid rgba(22,163,74,0.2)',
    }},
      h('div', { style:{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }},
        h('div', { style:{
          width:46, height:46, borderRadius:13, fontSize:22,
          background:'rgba(22,163,74,0.12)', display:'flex', alignItems:'center', justifyContent:'center',
        }}, goal.emoji),
        h('div', { style:{ flex:1, minWidth:0 }},
          h('div', { style:{ fontSize:11, color:C.dim, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}, 'Your goal'),
          h('div', { style:{ fontSize:15, fontWeight:900, color:C.text }}, goal.label)
        ),
        h('div', { style:{
          padding:'5px 11px', borderRadius:99, fontSize:11, fontWeight:800,
          background:lvl.color+'22', color:lvl.color, border:'1px solid '+lvl.color+'44',
        }}, lvl.icon + ' ' + lvl.label)
      ),
      h('div', { style:{ display:'flex', gap:10 }},
        h('div', { style:{ flex:1, textAlign:'center', padding:'10px', borderRadius:10, background:'rgba(255,255,255,0.04)' }},
          h('div', { style:{ fontSize:'1.2rem', fontWeight:900, color:C.accent }}, profile.daysPerWeek || '4'),
          h('div', { style:{ fontSize:9.5, color:C.dim, fontWeight:700, marginTop:2 }}, 'DAYS/WK')
        ),
        h('div', { style:{ flex:1, textAlign:'center', padding:'10px', borderRadius:10, background:'rgba(255,255,255,0.04)' }},
          h('div', { style:{ fontSize:'1.2rem', fontWeight:900, color:C.accent }}, profile.minutesPerSession || '30'),
          h('div', { style:{ fontSize:9.5, color:C.dim, fontWeight:700, marginTop:2 }}, 'MIN/SESSION')
        ),
        h('div', { style:{ flex:1, textAlign:'center', padding:'10px', borderRadius:10, background:'rgba(255,255,255,0.04)' }},
          h('div', { style:{ fontSize:'1.2rem', fontWeight:900, color:C.accent }}, plan ? plan.exercises.length : '—'),
          h('div', { style:{ fontSize:9.5, color:C.dim, fontWeight:700, marginTop:2 }}, 'EXERCISES')
        )
      )
    ),

    // Quick start
    plan && plan.exercises.length > 0 && h('div', { style:{ marginBottom:16 }},
      h('div', { style:{ fontSize:11, color:C.dim, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }},
        'Today\'s session'
      ),
      h('div', { style:{
        padding:'16px', borderRadius:16, background:C.card, border:'1px solid '+C.border, marginBottom:10,
      }},
        h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:12 }},
          h('div', { style:{ fontSize:14.5, fontWeight:900, color:C.text }},
            plan.sessions && plan.sessions[0] ? plan.sessions[0].name : 'Full Body Session'
          ),
          h('div', { style:{ fontSize:11, color:C.sub }},
            plan.exercises.length + ' exercises · ' + (profile.minutesPerSession||'30') + ' min'
          )
        ),
        plan.exercises.slice(0,3).map(function(ex, i) {
          return h('div', { key:i, style:{
            display:'flex', gap:10, alignItems:'center', marginBottom:8,
            paddingBottom:8, borderBottom:i<2?'1px solid rgba(48,54,61,0.5)':'none',
          }},
            h('div', { style:{
              width:26,height:26,borderRadius:7,fontSize:10,fontWeight:800,color:C.accent,
              background:'rgba(22,163,74,0.1)',display:'flex',alignItems:'center',justifyContent:'center',
            }}, i+1),
            h('div', null,
              h('div', { style:{ fontSize:13, fontWeight:700, color:C.text }}, ex.name),
              h('div', { style:{ fontSize:11, color:C.sub }}, ex.sets+'×'+(ex.duration_secs?ex.duration_secs+'s':ex.reps))
            )
          );
        }),
        plan.exercises.length > 3 && h('div', { style:{ fontSize:11, color:C.dim, marginBottom:10, textAlign:'center' }},
          '+ '+(plan.exercises.length-3)+' more'
        ),
        h('button', {
          onClick:function(){ onStartSession(plan.exercises); },
          style:{
            width:'100%', padding:'14px', border:'none', borderRadius:12,
            fontSize:14, fontWeight:800, fontFamily:'inherit', cursor:'pointer',
            background:'linear-gradient(135deg,#16a34a,#0d9488)', color:'#fff',
            boxShadow:'0 4px 16px rgba(22,163,74,0.35)',
          }
        }, '▶ Start session')
      )
    ),

    // Reset / redo onboarding
    h('button', {
      onClick:onResetProfile,
      style:{
        width:'100%', padding:'12px', border:'1px solid rgba(48,54,61,0.9)', borderRadius:12,
        background:'transparent', color:C.dim, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
      }
    }, '🔄 Rebuild my plan')
  );
}

// ── Active session wrapper ────────────────────────────────────
function SessionWrapper({ exercises, planId, onDone }) {
  return A.FB2SessionScreen
    ? h(A.FB2SessionScreen, { exercises:exercises, planId:planId, onDone:onDone })
    : h('div', { style:{ padding:40, textAlign:'center', color:C.sub }}, 'Session screen loading…');
}

// ── Main page ─────────────────────────────────────────────────
function FitnessBuilder2Page() {
  var profileState  = useState(function(){ return FB2.getProfile2(); });
  var profile = profileState[0], setProfile = profileState[1];
  var planState     = useState(function(){ return FB2.getPlan2(); });
  var plan = planState[0], setPlan = planState[1];
  var logState      = useState(function(){ return FB2.getLog2(); });
  var log = logState[0], setLog = logState[1];
  var tabState      = useState('home');
  var tab = tabState[0], setTab = tabState[1];
  var sessionState  = useState(null);   // null | [exercises]
  var sessionExs = sessionState[0], setSessionExs = sessionState[1];
  var sessionPlanId = useState(null);
  var planId = sessionPlanId[0], setPlanId = sessionPlanId[1];

  // Check for an interrupted session on mount — only resume if explicitly active
  useEffect(function() {
    var s = FB2.getSession2();
    if (s && s.status === 'active' && plan && plan.exercises && plan.exercises.length) {
      // Offer to resume (don't auto-start — avoids erroneous restart on launch)
      // Simple: show a banner; user chooses. For now, we clear stale sessions on cold launch.
      var sessionAge = s.startedAt ? (Date.now() - new Date(s.startedAt).getTime()) : Infinity;
      if (sessionAge > 3 * 60 * 60 * 1000) {
        // Older than 3 hours — safe to clear
        FB2.clearSession2();
      }
    }
  }, []);

  function handleOnboardComplete(p, generatedPlan) {
    setProfile(p);
    if (generatedPlan) { setPlan(generatedPlan); }
  }

  function handleResetProfile() {
    FB2.clearSession2();
    // Don't delete the profile in DB yet — just reset local state so onboarding reruns
    setProfile(null);
    setPlan(null);
  }

  function startSession(exercises) {
    setSessionExs(exercises);
    setPlanId(plan ? plan.id : null);
  }

  function endSession() {
    setSessionExs(null);
    setPlanId(null);
    setLog(FB2.getLog2());   // refresh log
  }

  // If session is active, show session screen full-page
  if (sessionExs && sessionExs.length) {
    return h(SessionWrapper, { exercises:sessionExs, planId:planId, onDone:endSession });
  }

  // If not onboarded yet, show the funnel
  if (!profile) {
    return A.FB2OnboardingFlow
      ? h(A.FB2OnboardingFlow, { onComplete:handleOnboardComplete })
      : h('div', { style:{ padding:40, textAlign:'center', color:C.sub }}, 'Loading…');
  }

  // Main experience
  var TABS = [
    { id:'home',     label:'Plan',    icon:'🏠' },
    { id:'library',  label:'Library', icon:'📚' },
    { id:'progress', label:'Progress',icon:'📊' },
    { id:'notepad',  label:'Calories',icon:'📝' },
  ];

  return h('div', { style:{ background:C.bg, minHeight:'100dvh', maxWidth:480, margin:'0 auto' }},
    PageHeader && h(PageHeader, {
      title:'Fitness Builder 2',
      subtitle:'Beta — your personalised training',
      gradient:'linear-gradient(135deg,#16a34a,#0d9488)',
    }),

    // Tab nav
    h('div', { style:{
      display:'flex', borderBottom:'1px solid rgba(48,54,61,0.7)',
      background:C.bg, position:'sticky', top:0, zIndex:10,
    }},
      TABS.map(function(t) {
        var active = tab === t.id;
        return h('button', {
          key:t.id, onClick:function(){ setTab(t.id); },
          style:{
            flex:1, padding:'12px 8px', border:'none', cursor:'pointer', fontFamily:'inherit',
            background:'transparent', color:active?C.accent:C.dim,
            borderBottom:active?'2px solid '+C.accent:'2px solid transparent',
            fontSize:12.5, fontWeight:active?800:600, transition:'all 0.15s',
          }
        }, t.icon + ' ' + t.label);
      })
    ),

    h('div', { style:{ padding:'14px 16px 100px' }},
      tab === 'home' && h(HomeTab, {
        profile:profile, plan:plan,
        onStartSession:startSession,
        onResetProfile:handleResetProfile,
      }),
      tab === 'library' && A.FB2LibraryBrowser && h(A.FB2LibraryBrowser, {
        onStartSession:startSession,
      }),
      tab === 'library' && !A.FB2LibraryBrowser && h('div', {style:{textAlign:'center',padding:40,color:C.sub}}, 'Library loading…'),
      tab === 'progress' && h(ProgressTab, { log:log, plan:plan }),
      tab === 'notepad' && A.FB2CalorieNotepad && h(A.FB2CalorieNotepad, null),
      tab === 'notepad' && !A.FB2CalorieNotepad && h('div', {style:{textAlign:'center',padding:40,color:C.sub}}, 'Calorie Notepad loading…')
    )
  );
}

A.FitnessBuilder2Page = FitnessBuilder2Page;
console.log('[SC] app-fitness-builder-2 ready');
})();
