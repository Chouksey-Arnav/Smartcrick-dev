// ================================================================
// SmartCrick AI — Fitness Builder + Workout Detail
// app-fitness.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const { nav, DB, awardXP, fireConfetti } = window.SC_APP;
const { WORKOUTS, findWorkouts, FIT_LEVELS, FIT_TARGETS, FIT_GOALS, FIT_DURS } = window.SC_APP;
const { Icon, XPBadge, StatCard, EmptyState, PageHeader } = window.SC_APP;

const LVL_GRAD={
  beginner:'#15803d,#059669',
  intermediate:'#1d4ed8,#4338ca',
  advanced:'#c2410c,#ea580c',
  pro:'#6d28d9,#7c3aed'
};

// ================================================================
// FITNESS PAGE
// ================================================================
function FitnessPage() {
  const [tab,setTab]=useState('quick');
  const [step,setStep]=useState(0);
  const [picks,setPicks]=useState({level:'',target:'',goal:'',duration:''});
  const [results,setResults]=useState(null);
  const [progress,setProgress]=useState(()=>DB.getProgress());

  useEffect(()=>{
    const refresh=()=>setProgress(DB.getProgress());
    window.addEventListener('sc_update',refresh);
    return ()=>window.removeEventListener('sc_update',refresh);
  },[]);

  const WIZARD=[
    {key:'level',label:'Experience Level',opts:FIT_LEVELS},
    {key:'target',label:'Target Muscle',opts:FIT_TARGETS},
    {key:'goal',label:'Training Goal',opts:FIT_GOALS},
    {key:'duration',label:'Session Length',opts:FIT_DURS},
  ];

  const choose=(key,val)=>{
    const n={...picks,[key]:val};
    setPicks(n);
    if(step<3) setStep(s=>s+1);
    else setResults(findWorkouts(n.level,n.target,n.goal,n.duration));
  };

  const reset=()=>{ setStep(0);setPicks({level:'',target:'',goal:'',duration:''});setResults(null); };

  const quickPicks=[
    WORKOUTS.find(w=>w.id==='wb010'), WORKOUTS.find(w=>w.id==='wi001'),
    WORKOUTS.find(w=>w.id==='wa001'), WORKOUTS.find(w=>w.id==='wp001'),
    WORKOUTS.find(w=>w.id==='wb002'), WORKOUTS.find(w=>w.id==='wi008')
  ].filter(Boolean);

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Fitness Builder',subtitle:`${WORKOUTS.length} workouts · every combination`,
      gradient:'linear-gradient(135deg,#c2410c,#dc2626)'}),

    // Tabs
    h('div',{className:'flex gap-2 px-4 py-3'},
      [['quick','⚡ Quick Start'],['wizard','🔮 Wizard'],['stats','📊 Stats']].map(([id,label])=>
        h('button',{key:id,onClick:()=>{setTab(id);reset();},
          className:'flex-1 py-2 rounded-xl text-xs font-black transition-all',
          style:tab===id?{background:'linear-gradient(135deg,#c2410c,#dc2626)',color:'#fff'}
            :{background:'rgba(30,41,59,0.6)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.5)'}
        },label)
      )
    ),

    // Quick Start
    tab==='quick' && h('div',{className:'px-4 space-y-2.5'},
      h('p',{className:'text-sm text-slate-400 mb-2'},'Jump straight into a recommended workout:'),
      quickPicks.map(w=>h('button',{key:w.id,onClick:()=>nav('WorkoutDetail',{id:w.id}),
        className:'w-full flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[.99] transition-all',
        style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{style:{width:48,height:48,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
          background:`linear-gradient(135deg,${LVL_GRAD[w.level]||'#c2410c,#ea580c'})`}},
          h(Icon,{n:'dumbbell',cls:'w-5 h-5 text-white'})
        ),
        h('div',{className:'flex-1'},
          h('div',{className:'font-bold text-white text-sm'},w.name),
          h('div',{className:'text-xs mt-0.5',style:{color:'#64748b'}},`${w.level} · ${w.target} · ${w.duration_minutes} min`),
          h('div',{className:'flex items-center gap-2 mt-1.5'},
            h(XPBadge,{xp:w.xp_value}),
            h('span',{className:'text-xs',style:{color:'#64748b'}},`${w.exercises} exercises`)
          )
        ),
        h(Icon,{n:'chevR',cls:'w-5 h-5',style:{color:'#475569'}})
      ))
    ),

    // Wizard
    tab==='wizard' && !results && h('div',{className:'px-4'},
      h('div',{className:'flex justify-center gap-2 mb-5'},
        WIZARD.map((_,i)=>h('div',{key:i,className:'h-2 rounded-full transition-all',
          style:{width:i===step?'2rem':'0.5rem',
            background:i<step?'#10b981':i===step?'#f97316':'rgba(51,65,85,0.5)'}}))
      ),
      h('h2',{className:'text-base font-black text-white mb-1'},WIZARD[step].label),
      picks.level && h('p',{className:'text-xs text-slate-500 mb-3'},[picks.level,picks.target,picks.goal].filter(Boolean).join(' · ')),
      h('div',{className:'space-y-2'},
        WIZARD[step].opts.map(opt=>h('button',{key:opt.id,onClick:()=>choose(WIZARD[step].key,opt.id),
          style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,
            textAlign:'left',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',cursor:'pointer',transition:'all 0.12s'}},
          h('div',{style:{width:36,height:36,borderRadius:7,background:'rgba(48,54,61,0.6)',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
            h(Icon,{n:opt.icon||'activity',cls:'w-4 h-4',style:{color:'#8b949e'}})
          ),
          h('div',{style:{flex:1}},
            h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},opt.label),
            opt.desc && h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},opt.desc)
          ),
          h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#374151'}})
        ))
      ),
      step>0 && h('button',{onClick:()=>setStep(s=>s-1),className:'flex items-center gap-2 mt-4 text-sm text-slate-400 font-semibold'},
        h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back'
      )
    ),

    // Wizard results
    tab==='wizard' && results && h('div',{className:'px-4'},
      h('div',{className:'flex items-center justify-between p-4 rounded-2xl mb-4',
        style:{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)'}},
        h('div',{},
          h('div',{className:'text-sm font-bold',style:{color:'#34d399'}},`${results.length} workout${results.length!==1?'s':''} found`),
          h('div',{className:'text-xs text-slate-400'},[picks.level,picks.target,picks.goal].filter(Boolean).join(' · '))
        ),
        h('button',{onClick:reset,className:'text-xs font-bold text-slate-400'},'New Search')
      ),
      h('div',{className:'space-y-2.5'},
        results.map(w=>h('button',{key:w.id,onClick:()=>nav('WorkoutDetail',{id:w.id}),
          className:'w-full flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[.99] transition-all',
          style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
          h('div',{style:{width:48,height:48,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
            background:`linear-gradient(135deg,${LVL_GRAD[w.level]||'#c2410c,#ea580c'})`}},
            h(Icon,{n:'dumbbell',cls:'w-5 h-5 text-white'})
          ),
          h('div',{className:'flex-1'},
            h('div',{className:'font-bold text-white text-sm'},w.name),
            h('div',{className:'text-xs mt-0.5',style:{color:'#64748b'}},`${w.duration_minutes} min · ${w.exercises} exercises`),
            h('div',{className:'mt-1.5'},h(XPBadge,{xp:w.xp_value}))
          ),
          h(Icon,{n:'chevR',cls:'w-5 h-5',style:{color:'#475569'}})
        ))
      )
    ),

    // Stats
    tab==='stats' && h('div',{className:'px-4 grid grid-cols-2 gap-3'},
      h(StatCard,{label:'Workouts Done',value:progress.workouts_done||0,color:'text-orange-400',icon:'dumbbell'}),
      h(StatCard,{label:'Total Library',value:WORKOUTS.length,color:'text-white',icon:'layers'}),
      h(StatCard,{label:'Levels',value:'4 levels',color:'text-emerald-400',icon:'trophy'}),
      h(StatCard,{label:'Targets',value:'8 muscle groups',color:'text-blue-400',icon:'crosshair'})
    )
  );
}

// ================================================================
// WORKOUT DETAIL PAGE
// ================================================================
function WorkoutDetailPage({ params }) {
  const w=WORKOUTS.find(wk=>wk.id===params?.id);
  const [done,setDone]=useState(false);
  const completing=useRef(false);

  if(!w) return h('div',{className:'pb-28 flex flex-col items-center justify-center',style:{minHeight:'80vh'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'dumbbell',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('p',{className:'font-bold text-white mb-4'},'Workout not found'),
    h('button',{onClick:()=>nav('Fitness'),className:'btn-primary px-6 py-3'},'Back')
  );

  const complete=()=>{
    if(completing.current) return;
    completing.current=true;
    awardXP(w.xp_value,w.duration_minutes,'workout','workout',w.id);
    fireConfetti(); setDone(true);
  };

  if(done) return h('div',{className:'flex flex-col items-center justify-center text-center px-5 pb-28',style:{minHeight:'100vh'}},
    h('div',{style:{width:64,height:64,borderRadius:16,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'circleCheck',cls:'w-8 h-8',style:{color:'#16a34a'}})
    ),
    h('h2',{className:'text-2xl font-black text-white mb-2'},'Workout Complete!'),
    h('p',{className:'text-slate-400 mb-3'},w.name),
    h(XPBadge,{xp:w.xp_value}),
    h('div',{className:'mt-6 flex flex-col gap-3 w-full max-w-xs'},
      h('button',{onClick:()=>nav('Fitness'),className:'btn-primary'},'More Workouts'),
      h('button',{onClick:()=>setDone(false),className:'btn-secondary'},'Do Again')
    )
  );

  const grad=LVL_GRAD[w.level]||'#c2410c,#ea580c';
  return h('div',{className:'pb-28'},
    h(PageHeader,{title:w.name,subtitle:`${w.duration_minutes} min · ${w.exercises} exercises · ${w.xp_value} XP`,
      gradient:`linear-gradient(135deg,${grad})`,onBack:()=>nav('Fitness')}),
    h('div',{className:'px-4 pt-5 space-y-4'},
      h('div',{className:'grid grid-cols-3 gap-3'},
        h(StatCard,{label:'Level',value:w.level,color:'text-white'}),
        h(StatCard,{label:'Focus',value:w.target,color:'text-orange-400'}),
        h(StatCard,{label:'Goal',value:w.goal.replace('-',' '),color:'text-amber-400'})
      ),
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'},'About This Workout'),
        h('p',{className:'text-sm text-slate-300 leading-relaxed'},
          `A ${w.duration_minutes}-minute ${w.level} workout targeting ${w.target} with a focus on ${w.goal.replace(/-/g,' ')}. Complete ${w.exercises} exercises with proper form and adequate rest between sets.`)
      ),
      h('button',{onClick:complete,className:'btn-primary w-full py-4 text-base font-black'},
        h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),` Complete Workout (+${w.xp_value} XP)`
      )
    )
  );
}

Object.assign(window.SC_APP, { FitnessPage, WorkoutDetailPage });
console.log('[SC] app-fitness ready');
})();
