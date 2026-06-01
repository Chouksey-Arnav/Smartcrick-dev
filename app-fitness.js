// ================================================================
// app-fitness.js v2.0 — FULL WORKOUT LIBRARY in Quick Start
// Changes from v1.0:
//  - Quick Start shows ALL 80 workouts (was 6 hardcoded)
//  - Search bar to filter workouts
//  - Level filter pills
//  - Proper mobile-responsive card grid
//  - Wizard still available via tab
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const A = window.SC_APP;
const { nav, DB, awardXP, fireConfetti } = A;
const { WORKOUTS, findWorkouts, FIT_LEVELS, FIT_TARGETS, FIT_GOALS, FIT_DURS } = A;
const { Icon, XPBadge, StatCard, EmptyState, PageHeader } = A;

const LVL_GRAD = {
  beginner:    '#15803d,#059669',
  intermediate:'#1d4ed8,#4338ca',
  advanced:    '#c2410c,#ea580c',
  pro:         '#6d28d9,#7c3aed',
};

const LVL_COLOR = {
  beginner:'#16a34a', intermediate:'#3b82f6',
  advanced:'#f97316', pro:'#8b5cf6',
};

// ================================================================
// FITNESS PAGE
// ================================================================
function FitnessPage() {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');
  const [progress, setProgress] = useState(() => DB.getProgress());

  useEffect(() => {
    const refresh = () => setProgress(DB.getProgress());
    window.addEventListener('sc_update', refresh);
    return () => window.removeEventListener('sc_update', refresh);
  }, []);

  // Filter workouts
  const filtered = WORKOUTS.filter(w => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.target.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === 'all' || w.level === levelFilter;
    const matchGoal  = goalFilter === 'all'  || w.goal === goalFilter;
    return matchSearch && matchLevel && matchGoal;
  });

  const WIZARD = [
    { key:'level',    label:'Experience Level', opts:FIT_LEVELS },
    { key:'target',   label:'Target Muscle',    opts:FIT_TARGETS },
    { key:'goal',     label:'Training Goal',    opts:FIT_GOALS },
    { key:'duration', label:'Session Length',   opts:FIT_DURS },
  ];
  const [step, setStep]   = useState(0);
  const [picks, setPicks] = useState({ level:'', target:'', goal:'', duration:'' });
  const [results, setResults] = useState(null);

  function choose(key, val) {
    const n = { ...picks, [key]: val };
    setPicks(n);
    if (step < 3) setStep(s => s + 1);
    else setResults(findWorkouts(n.level, n.target, n.goal, n.duration));
  }

  function resetWizard() {
    setStep(0); setPicks({ level:'', target:'', goal:'', duration:'' }); setResults(null);
  }

  const _FM = window.FramerMotion;
  const _AP = _FM ? _FM.AnimatePresence : null;
  const _mDiv = _FM ? _FM.motion.div : null;

  const TABS = [
    { id:'all',    label:'All Workouts' },
    { id:'wizard', label:'🔮 Wizard' },
    { id:'stats',  label:'📊 Stats' },
  ];

  return h('div', { style:{ paddingBottom:100, background:'#0a0f1e', minHeight:'100dvh' } },
    h(PageHeader, {
      title:'Fitness Builder',
      subtitle:`${WORKOUTS.length} workouts · every level & goal`,
      gradient:'linear-gradient(135deg,#c2410c,#dc2626)',
    }),

    // Tabs
    h('div', { style:{ display:'flex', gap:4, margin:'12px 16px', padding:4, background:'rgba(16,22,36,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14 } },
      TABS.map(t => h('button', {
        key:t.id, onPointerDown:() => { if(A.playTabClick) A.playTabClick(); setTab(t.id); resetWizard(); },
        style:{
          flex:1, padding:'9px 4px', fontSize:12, fontWeight:700,
          cursor:'pointer', fontFamily:'inherit', border:'none', borderRadius:10,
          transition:'all 0.2s',
          background: tab===t.id ? 'linear-gradient(135deg,#c2410c,#ea580c)' : 'transparent',
          color: tab===t.id ? '#fff' : '#6b7280',
          boxShadow: tab===t.id ? '0 2px 10px rgba(194,65,12,0.35)' : 'none',
        }
      }, t.label))
    ),

    (function() {
      var _tabEl = h(React.Fragment, null,
    // ── ALL WORKOUTS TAB ─────────────────────────────────────────
    tab === 'all' && h('div', { style:{ padding:'12px 16px 0' } },
      // Search
      h('div', { style:{ position:'relative', marginBottom:10 } },
        h('input', {
          type:'search', value:search, placeholder:'Search workouts…',
          onChange: e => setSearch(e.target.value),
          style:{
            width:'100%', padding:'10px 14px 10px 38px', borderRadius:9999,
            background:'rgba(16,22,36,0.95)', border:'1px solid rgba(255,255,255,0.08)',
            color:'#f0fdf4', fontSize:14, fontFamily:'inherit', outline:'none',
            boxSizing:'border-box',
          },
          onFocus: e => e.target.style.borderColor='rgba(249,115,22,0.5)',
          onBlur:  e => e.target.style.borderColor='rgba(255,255,255,0.08)',
        }),
        h('span', { style:{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 } }, '🔍')
      ),

      // Level filter pills
      h('div', { style:{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6, scrollbarWidth:'none', marginBottom:10 } },
        h('button', {
          key:'all',
          onClick:() => setLevelFilter('all'),
          style:{ flexShrink:0, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700,
            background: levelFilter==='all'?'rgba(249,115,22,0.2)':'rgba(22,27,34,0.9)',
            color: levelFilter==='all'?'#f97316':'#6b7280',
            outline: levelFilter==='all'?'1.5px solid rgba(249,115,22,0.5)':'none',
          }
        }, 'All Levels'),
        ['beginner','intermediate','advanced','pro'].map(lv => h('button', {
          key:lv,
          onClick:() => setLevelFilter(lv),
          style:{ flexShrink:0, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700,
            background: levelFilter===lv ? LVL_COLOR[lv]+'25' : 'rgba(22,27,34,0.9)',
            color: levelFilter===lv ? LVL_COLOR[lv] : '#6b7280',
            outline: levelFilter===lv ? '1.5px solid '+LVL_COLOR[lv]+'60' : 'none',
          }
        }, lv.charAt(0).toUpperCase()+lv.slice(1)))
      ),

      // Goal filter pills
      h('div', { style:{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none' } },
        [
          { id:'all',              label:'All Goals',     color:'#9ca3af' },
          { id:'build-muscle',     label:'💪 Muscle',    color:'#f97316' },
          { id:'lose-weight',      label:'🔥 Fat Burn',  color:'#ef4444' },
          { id:'improve-endurance',label:'🏃 Endurance', color:'#10b981' },
        ].map(g => h('button', {
          key:g.id,
          onClick:() => setGoalFilter(g.id),
          style:{ flexShrink:0, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700,
            background: goalFilter===g.id ? g.color+'20' : 'rgba(22,27,34,0.9)',
            color: goalFilter===g.id ? g.color : '#6b7280',
            outline: goalFilter===g.id ? '1.5px solid '+g.color+'50' : 'none',
          }
        }, g.label))
      ),

      // Results count
      h('div', { style:{ fontSize:12, color:'#6b7280', marginBottom:10 } },
        filtered.length + ' workout' + (filtered.length!==1?'s':'') + ' found'
      ),

      // Workout grid
      filtered.length === 0
        ? h('div', { style:{ textAlign:'center', padding:'48px 20px' } },
            h('div', { style:{ fontSize:40, marginBottom:12 } }, '💪'),
            h('div', { style:{ fontSize:14, color:'#6b7280' } }, 'No workouts match your filters'),
            h('button', { onClick:() => { setSearch(''); setLevelFilter('all'); setGoalFilter('all'); },
              style:{ marginTop:14, padding:'8px 20px', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:8, color:'#f97316', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' }
            }, 'Clear Filters')
          )
        : h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
            filtered.map(w => h(WorkoutCard, { key:w.id, w:w }))
          )
    ),

    // ── WIZARD TAB ───────────────────────────────────────────────
    tab === 'wizard' && h('div', { style:{ padding:'12px 16px 0' } },
      !results && h('div', null,
        h('div', { style:{ display:'flex', justifyContent:'center', gap:4, marginBottom:16 } },
          WIZARD.map((_,i) => h('div', { key:i, style:{
            height:3, borderRadius:2, transition:'all 0.3s',
            width: i===step?'2rem':'0.5rem',
            background: i<step?'#f97316': i===step?'#f97316':'rgba(51,65,85,0.5)',
          }}))
        ),
        h('h2', { style:{ fontSize:15, fontWeight:800, color:'#f0fdf4', marginBottom:4 } }, WIZARD[step].label),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          WIZARD[step].opts.map(opt => h('button', {
            key:opt.id, onClick:() => choose(WIZARD[step].key, opt.id),
            style:{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
              borderRadius:10, background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)',
              cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.12s',
            },
            onMouseEnter:e => { e.currentTarget.style.borderColor='rgba(249,115,22,0.4)'; },
            onMouseLeave:e => { e.currentTarget.style.borderColor='rgba(48,54,61,0.9)'; },
          },
            h('div', { style:{ width:36, height:36, borderRadius:7, background:'rgba(48,54,61,0.6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
              h(Icon, { n:opt.icon||'activity', cls:'w-4 h-4', style:{ color:'#8b949e' } })
            ),
            h('div', { style:{ flex:1 } },
              h('div', { style:{ fontSize:13, fontWeight:700, color:'#e6edf3' } }, opt.label),
              opt.desc && h('div', { style:{ fontSize:11, color:'#484f58', marginTop:2 } }, opt.desc)
            ),
            h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#374151' } })
          ))
        ),
        step > 0 && h('button', { onClick:() => setStep(s => s-1), style:{ display:'flex', alignItems:'center', gap:6, marginTop:12, background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' } },
          h(Icon, { n:'arrowL', cls:'w-4 h-4' }), 'Back'
        )
      ),
      results && h('div', null,
        h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, marginBottom:12, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)' } },
          h('div', { style:{ fontSize:13, fontWeight:700, color:'#34d399' } }, results.length + ' workout' + (results.length!==1?'s':'') + ' found'),
          h('button', { onClick:resetWizard, style:{ fontSize:11, fontWeight:700, color:'#9ca3af', background:'none', border:'none', cursor:'pointer' } }, 'New Search')
        ),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          results.map(w => h(WorkoutCard, { key:w.id, w:w }))
        )
      )
    ),

    // ── STATS TAB ────────────────────────────────────────────────
    tab === 'stats' && h('div', { style:{ padding:'12px 16px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 } },
      h(StatCard, { label:'Workouts Done',  value:progress.workouts_done||0, color:'#f97316', icon:'dumbbell' }),
      h(StatCard, { label:'Total Library',  value:WORKOUTS.length, color:'#fff', icon:'layers' }),
      h(StatCard, { label:'Levels',         value:'4 levels', color:'#16a34a', icon:'trophy' }),
      h(StatCard, { label:'Muscle Groups',  value:'8 targets', color:'#3b82f6', icon:'crosshair' })
    )
      );
      if (!_FM || !_AP || !_mDiv) return _tabEl;
      return h(_AP, { mode:'wait' },
        h(_mDiv, { key:tab, initial:{opacity:0,y:8}, animate:{opacity:1,y:0}, exit:{opacity:0,y:-8}, transition:{duration:0.18,ease:'easeInOut'} }, _tabEl)
      );
    })()
  );
}

// ── Workout Card component ────────────────────────────────────────
function WorkoutCard({ w }) {
  const grad = LVL_GRAD[w.level] || '#c2410c,#ea580c';
  const lvlColor = LVL_COLOR[w.level] || '#f97316';

  const goalEmoji = { 'build-muscle':'💪', 'lose-weight':'🔥', 'improve-endurance':'🏃' };
  const targetEmoji = {
    'full-body':'🏋️', 'chest':'💪', 'back':'🔙', 'shoulders':'🏔️',
    'arms':'💪', 'legs':'🦵', 'core':'🎯', 'glutes':'🍑',
  };

  return h('button', {
    onClick: () => nav('WorkoutDetail', { id:w.id }),
    style:{
      display:'flex', flexDirection:'column',
      borderRadius:14, background:'rgba(16,22,36,0.9)', border:'1px solid rgba(255,255,255,0.08)',
      cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%',
      transition:'all 0.15s', overflow:'hidden', padding:0,
    },
    onMouseEnter: e => { e.currentTarget.style.borderColor=lvlColor+'40'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.3)'; e.currentTarget.style.transform='translateY(-1px)'; },
    onMouseLeave: e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='translateY(0)'; },
  },
    h('div', { style:{ height:3, background:lvlColor, borderRadius:'14px 14px 0 0', flexShrink:0 } }),
    h('div', { style:{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' } },
      h('div', {
        style:{ width:44, height:44, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`linear-gradient(135deg,${grad})` }
      },
        h('span', { style:{ fontSize:20 } }, targetEmoji[w.target] || '💪')
      ),
      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 } }, w.name),
        h('div', { style:{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' } },
          h('span', { style:{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4, background:lvlColor+'18', color:lvlColor, border:'1px solid '+lvlColor+'30' } }, w.level),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, w.target.replace('-',' ')),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, '·'),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, w.duration_minutes+'min'),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, '·'),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, goalEmoji[w.goal]||''),
        )
      ),
      h(XPBadge, { xp:w.xp_value }),
      h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#374151', flexShrink:0 } })
    )
  );
}

// ================================================================
// WORKOUT DETAIL PAGE
// ================================================================
function WorkoutDetailPage({ params }) {
  const w = WORKOUTS.find(wk => wk.id === params?.id);
  const [done, setDone] = useState(false);
  const completing = useRef(false);

  if(!w) return h('div', { style:{ paddingBottom:120, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh' } },
    h('div', { style:{ fontSize:40, marginBottom:16 } }, '💪'),
    h('p', { style:{ fontWeight:700, color:'#f0fdf4', marginBottom:16 } }, 'Workout not found'),
    h('button', { onClick:() => nav('Fitness'), style:{ padding:'12px 24px', background:'#c2410c', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 } }, '← Back'),
  );

  const complete = () => {
    if (completing.current) return;
    completing.current = true;
    awardXP(w.xp_value, w.duration_minutes, 'workout', 'workout', w.id);
    fireConfetti();
    setDone(true);
  };

  if(done) return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem', minHeight:'100dvh', background:'#0a0f1e' } },
    h('div', { style:{ fontSize:48, marginBottom:16 } }, '✅'),
    h('h2', { style:{ fontSize:22, fontWeight:900, color:'#f0fdf4', marginBottom:8 } }, 'Workout Complete!'),
    h('p', { style:{ color:'#9ca3af', marginBottom:12 } }, w.name),
    h(XPBadge, { xp:w.xp_value }),
    h('div', { style:{ marginTop:24, display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:280 } },
      h('button', { onClick:() => nav('Fitness'), style:{ padding:'13px', background:'linear-gradient(135deg,#c2410c,#ea580c)', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700, boxShadow:'0 4px 16px rgba(194,65,12,0.35)' } }, 'More Workouts'),
      h('button', { onClick:() => { setDone(false); completing.current=false; }, style:{ padding:'12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(48,54,61,0.9)', borderRadius:10, color:'#9ca3af', cursor:'pointer', fontFamily:'inherit', fontWeight:600 } }, 'Do Again'),
    )
  );

  const grad = LVL_GRAD[w.level] || '#c2410c,#ea580c';
  const lvlColor = LVL_COLOR[w.level] || '#f97316';
  const goalLabels = { 'build-muscle':'Build Muscle', 'lose-weight':'Lose Weight', 'improve-endurance':'Endurance' };

  return h('div', { style:{ paddingBottom:100, background:'#0a0f1e', minHeight:'100dvh' } },
    h(PageHeader, {
      title:w.name,
      subtitle:`${w.duration_minutes} min · ${w.exercises} exercises · ${w.xp_value} XP`,
      gradient:`linear-gradient(135deg,${grad})`,
      onBack:() => nav('Fitness'),
    }),
    h('div', { style:{ padding:'16px' } },
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 } },
        h(StatCard, { label:'Level',  value:w.level.charAt(0).toUpperCase()+w.level.slice(1),       color:lvlColor }),
        h(StatCard, { label:'Focus',  value:w.target.replace('-',' '),  color:'#f97316' }),
        h(StatCard, { label:'Goal',   value:goalLabels[w.goal]||w.goal, color:'#f59e0b' }),
      ),
      h('div', { style:{ padding:'16px', borderRadius:12, background:'rgba(30,41,59,0.6)', border:'1px solid rgba(51,65,85,0.5)', marginBottom:16 } },
        h('p', { style:{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 } }, 'About This Workout'),
        h('p', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.65 } },
          `A ${w.duration_minutes}-minute ${w.level} workout targeting ${w.target.replace('-',' ')} with a focus on ${(goalLabels[w.goal]||w.goal).toLowerCase()}. Complete ${w.exercises} exercises with proper form and adequate rest between sets.`)
      ),
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 } },
        [
          { label:'Exercises',  value:w.exercises },
          { label:'Duration',   value:w.duration_minutes+'min' },
          { label:'XP Reward',  value:'+'+w.xp_value },
        ].map(stat => h('div', { key:stat.label,
          style:{ padding:'12px 8px', borderRadius:10, background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)', textAlign:'center' }
        },
          h('div', { style:{ fontSize:20, fontWeight:800, color:'#f0fdf4' } }, stat.value),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 } }, stat.label)
        ))
      ),
      h('button', { onClick:complete,
        style:{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'15px', border:'none', borderRadius:12,
          fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer',
          background:`linear-gradient(135deg,${grad})`,
          color:'#fff', boxShadow:`0 4px 20px rgba(194,65,12,0.45)`,
        }
      },
        h(Icon, { n:'circleCheck', cls:'w-5 h-5' }),
        ' Complete Workout (+'+w.xp_value+' XP)'
      )
    )
  );
}

Object.assign(window.SC_APP, { FitnessPage, WorkoutDetailPage, WorkoutCard });
console.log('[SC] app-fitness v2.0 — all', WORKOUTS ? WORKOUTS.length : 0, 'workouts in quick start ready');
})();
