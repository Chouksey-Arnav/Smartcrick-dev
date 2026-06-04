// ================================================================
// app-fitness.js v3.0 — Professional Cricket Training Ecosystem
//  • Programs / Journeys (multi-week cricket paths)  ← retention core
//  • Fitness Rank ladder + weekly training streak header
//  • Full workout library + search + filters
//  • Wizard + Progress (rank, PRs, difficulty trend)
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect } = React;
const A = window.SC_APP;
const { nav, DB } = A;
const { WORKOUTS, findWorkouts, FIT_LEVELS, FIT_TARGETS, FIT_GOALS, FIT_DURS } = A;
const { Icon, XPBadge, StatCard, PageHeader } = A;
const FE = A.FitnessEngine;

const LVL_GRAD = {
  beginner:'#15803d,#059669', intermediate:'#1d4ed8,#4338ca',
  advanced:'#c2410c,#ea580c', pro:'#6d28d9,#7c3aed',
};
const LVL_COLOR = { beginner:'#16a34a', intermediate:'#3b82f6', advanced:'#f97316', pro:'#8b5cf6' };

function workoutById(id) { return WORKOUTS.find(function(w){ return w.id === id; }); }

// ─── Rank / streak header ─────────────────────────────────────
function RankHeader({ stats }) {
  if (!stats) return null;
  const r = stats.rank, nx = stats.nextRank;
  const pct = Math.round((stats.rankProgress || 0) * 100);
  return h('div', { style:{ margin:'12px 16px 0', padding:'14px 16px', borderRadius:16,
      background:'linear-gradient(135deg,rgba(16,22,36,0.95),rgba(20,16,30,0.95))',
      border:'1px solid '+r.color+'33' } },
    h('div', { style:{ display:'flex', alignItems:'center', gap:12, marginBottom:10 } },
      h('div', { style:{ width:44, height:44, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22,
        background:r.color+'1e', border:'1px solid '+r.color+'40' } }, r.icon),
      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.14em' } }, 'Fitness Rank'),
        h('div', { style:{ fontSize:16, fontWeight:900, color:r.color } }, r.label)
      ),
      h('div', { style:{ textAlign:'right' } },
        h('div', { style:{ fontSize:18, fontWeight:900, color:'#f0fdf4' } }, '🔥 ' + (stats.weeklyStreak||0)),
        h('div', { style:{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' } }, 'week streak')
      )
    ),
    h('div', { style:{ height:6, borderRadius:9999, background:'rgba(255,255,255,0.07)', overflow:'hidden' } },
      h('div', { style:{ height:'100%', width:pct+'%', background:'linear-gradient(90deg,'+r.color+','+(nx?nx.color:r.color)+')', borderRadius:9999, transition:'width 0.6s' } })
    ),
    h('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:6 } },
      h('span', { style:{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600 } }, stats.workoutsDone + ' workouts done'),
      h('span', { style:{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600 } }, nx ? (nx.min - stats.workoutsDone) + ' to ' + nx.label : 'Max rank reached')
    )
  );
}

// ─── Program card ─────────────────────────────────────────────
function ProgramCard({ program, onOpen }) {
  const pp = FE.programProgress(program);
  const pct = Math.round(pp.pct * 100);
  const cta = pp.complete ? '✓ Complete' : pp.started ? 'Continue' : 'Start';
  return h('button', { onClick:onOpen, style:{ display:'flex', flexDirection:'column', width:'100%', textAlign:'left',
      borderRadius:16, overflow:'hidden', padding:0, cursor:'pointer', fontFamily:'inherit',
      background:'rgba(16,22,36,0.9)', border:'1px solid '+program.color+'2e' } },
    h('div', { style:{ height:4, background:'linear-gradient(90deg,'+program.grad+')' } }),
    h('div', { style:{ padding:'14px 16px' } },
      h('div', { style:{ display:'flex', alignItems:'center', gap:12, marginBottom:10 } },
        h('div', { style:{ width:46, height:46, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, background:'linear-gradient(135deg,'+program.grad+')' } }, program.icon),
        h('div', { style:{ flex:1, minWidth:0 } },
          h('div', { style:{ fontSize:15, fontWeight:800, color:'#f0fdf4' } }, program.title),
          h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.42)', marginTop:2 } }, program.subtitle)
        ),
        h('span', { style:{ fontSize:11, fontWeight:800, padding:'5px 12px', borderRadius:9999, background:program.color+'1e', color:program.color, border:'1px solid '+program.color+'40' } }, cta)
      ),
      pp.started && h('div', { style:{ marginTop:2 } },
        h('div', { style:{ height:5, borderRadius:9999, background:'rgba(255,255,255,0.07)', overflow:'hidden' } },
          h('div', { style:{ height:'100%', width:pct+'%', background:'linear-gradient(90deg,'+program.grad+')', borderRadius:9999 } })
        ),
        h('div', { style:{ fontSize:10, color:'rgba(255,255,255,0.4)', fontWeight:600, marginTop:5 } }, pp.done + ' / ' + pp.total + ' sessions complete')
      )
    )
  );
}

// ─── Program detail (inline) ──────────────────────────────────
function ProgramDetail({ program, onBack }) {
  const [, force] = useState(0);
  const pp = FE.programProgress(program);

  function startNow() {
    FE.startProgram(program.id);
    force(x => x + 1);
    window.dispatchEvent(new CustomEvent('sc_update'));
  }
  function openSession(workoutId) { nav('WorkoutDetail', { id: workoutId }); }

  return h('div', { style:{ padding:'12px 16px 0' } },
    h('button', { onClick:onBack, style:{ display:'flex', alignItems:'center', gap:6, marginBottom:14, background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:700, fontFamily:'inherit' } }, '← All Programs'),
    h('div', { style:{ padding:'16px', borderRadius:16, background:'linear-gradient(135deg,'+program.grad+')', marginBottom:16 } },
      h('div', { style:{ fontSize:30, marginBottom:6 } }, program.icon),
      h('div', { style:{ fontSize:20, fontWeight:900, color:'#fff' } }, program.title),
      h('div', { style:{ fontSize:12, color:'rgba(255,255,255,0.85)', marginTop:2 } }, program.subtitle),
      h('p', { style:{ fontSize:13, color:'rgba(255,255,255,0.92)', lineHeight:1.6, marginTop:10 } }, program.desc)
    ),
    !pp.started && h('button', { onClick:startNow, style:{ width:'100%', padding:'15px', border:'none', borderRadius:13, marginBottom:18,
        fontFamily:'inherit', fontSize:15, fontWeight:800, cursor:'pointer', background:'linear-gradient(135deg,'+program.grad+')', color:'#fff' } }, '🚀  Start This Program'),
    pp.started && !pp.complete && pp.next && h('button', { onClick:function(){ openSession(pp.next.workoutId); }, style:{ width:'100%', padding:'15px', border:'none', borderRadius:13, marginBottom:18,
        fontFamily:'inherit', fontSize:15, fontWeight:800, cursor:'pointer', background:'linear-gradient(135deg,'+program.grad+')', color:'#fff' } }, '▶  Continue — ' + (workoutById(pp.next.workoutId) ? workoutById(pp.next.workoutId).name : 'Next session')),
    pp.complete && h('div', { style:{ padding:'14px', borderRadius:13, marginBottom:18, textAlign:'center', background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80', fontWeight:800, fontSize:14 } }, '🏆 Program complete — outstanding work!'),

    program.weeks.map(function(wk, wi) {
      return h('div', { key:wi, style:{ marginBottom:16 } },
        h('div', { style:{ fontSize:11, fontWeight:800, color:program.color, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 } }, wk.label),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          wk.sessions.map(function(sid, si) {
            const w = workoutById(sid);
            const key = wi + ':' + si;
            const done = pp.doneKeys.indexOf(key) !== -1;
            if (!w) return null;
            return h('button', { key:key, onClick:function(){ openSession(sid); }, style:{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:12,
                background:'rgba(16,22,36,0.9)', border:'1px solid '+(done?'rgba(34,197,94,0.35)':'rgba(255,255,255,0.07)'), cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%' } },
              h('div', { style:{ width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:13,
                background: done ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)', color: done ? '#4ade80':'rgba(255,255,255,0.4)', border:'1px solid '+(done?'rgba(34,197,94,0.4)':'rgba(255,255,255,0.1)') } }, done ? '✓' : (si+1)),
              h('div', { style:{ flex:1, minWidth:0 } },
                h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' } }, w.name),
                h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:2 } }, w.duration_minutes + ' min · ' + w.exercises + ' exercises · +' + w.xp_value + ' XP')
              ),
              h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#374151', flexShrink:0 } })
            );
          })
        )
      );
    })
  );
}

// ─── Programs tab ─────────────────────────────────────────────
function ProgramsTab({ stats }) {
  const [openId, setOpenId] = useState(null);
  if (!FE) return h('div', { style:{ padding:24, color:'#6b7280', fontSize:13 } }, 'Programs unavailable.');
  if (openId) {
    const p = FE.PROGRAMS.find(function(x){ return x.id === openId; });
    if (p) return h(ProgramDetail, { program:p, onBack:function(){ setOpenId(null); } });
  }
  const rec = FE.getRecommended && FE.getRecommended();
  return h('div', { style:{ padding:'12px 16px 0' } },
    rec && rec.workoutId && workoutById(rec.workoutId) && h('button', {
      onClick:function(){ nav('WorkoutDetail', { id: rec.workoutId }); },
      style:{ width:'100%', textAlign:'left', marginBottom:14, padding:'14px 16px', borderRadius:14, cursor:'pointer', fontFamily:'inherit',
        background:'linear-gradient(135deg,rgba(249,115,22,0.14),rgba(220,38,38,0.12))', border:'1px solid rgba(249,115,22,0.35)' } },
      h('div', { style:{ fontSize:10, fontWeight:800, color:'#fb923c', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:4 } }, '▶ Pick up where you left off'),
      h('div', { style:{ fontSize:15, fontWeight:800, color:'#f0fdf4' } }, workoutById(rec.workoutId).name),
      h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:2 } }, rec.program.title + ' · ' + rec.session.label)
    ),
    h('div', { style:{ fontSize:12, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 } }, 'Training Journeys'),
    h('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
      FE.PROGRAMS.map(function(p) { return h(ProgramCard, { key:p.id, program:p, onOpen:function(){ setOpenId(p.id); } }); })
    ),
    h('p', { style:{ fontSize:11, color:'#484f58', lineHeight:1.6, marginTop:16 } },
      'Each journey is a structured multi-week block — sessions unlock as you complete them, and every workout adapts to how the last one felt.')
  );
}

// ─── Progress tab ─────────────────────────────────────────────
function ProgressTab({ stats }) {
  const log = (function(){ try { return DB.get('fitness_log') || []; } catch(e){ return []; } })();
  const recent = log.slice(-5).reverse();
  const ratingColor = { easy:'#34d399', perfect:'#fbbf24', hard:'#f87171' };
  const ratingLabel = { easy:'Too easy', perfect:'Just right', hard:'Too tough' };
  const longestHold = (stats && stats.prs && stats.prs.longestHold) || 0;
  return h('div', { style:{ padding:'12px 16px 0' } },
    h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 } },
      h(StatCard, { label:'Workouts Done', value:(stats?stats.workoutsDone:0), color:'#f97316', icon:'dumbbell' }),
      h(StatCard, { label:'This Week',     value:(stats?stats.weekCount:0)+'/'+(stats?stats.weeklyTarget:3), color:'#34d399', icon:'activity' }),
      h(StatCard, { label:'Week Streak',   value:'🔥 '+(stats?stats.weeklyStreak:0), color:'#fbbf24', icon:'trophy' }),
      h(StatCard, { label:'Longest Hold',  value:longestHold+'s', color:'#60a5fa', icon:'timer' })
    ),
    h('div', { style:{ fontSize:12, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', margin:'4px 0 10px' } }, 'Recent Sessions'),
    recent.length === 0
      ? h('div', { style:{ padding:'28px 16px', textAlign:'center', color:'#6b7280', fontSize:13 } }, 'No workouts logged yet — start your first session!')
      : h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          recent.map(function(e, i) {
            return h('div', { key:i, style:{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:11, background:'rgba(16,22,36,0.9)', border:'1px solid rgba(255,255,255,0.06)' } },
              h('div', { style:{ flex:1, minWidth:0 } },
                h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' } }, e.name),
                h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.38)', marginTop:2 } }, (e.minutes||0) + ' min · +' + (e.xp||0) + ' XP')
              ),
              h('span', { style:{ fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:9999, color:ratingColor[e.difficulty]||'#9ca3af', background:(ratingColor[e.difficulty]||'#9ca3af')+'1e', border:'1px solid '+(ratingColor[e.difficulty]||'#9ca3af')+'33' } }, ratingLabel[e.difficulty]||'logged')
            );
          })
        )
  );
}

// ════════════════════════════════════════════════════════════
// FITNESS PAGE
// ════════════════════════════════════════════════════════════
function FitnessPage() {
  const [tab, setTab] = useState('programs');
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [goalFilter, setGoalFilter] = useState('all');
  const [stats, setStats] = useState(() => FE ? FE.getStats() : null);

  useEffect(() => {
    const refresh = () => { if (FE) setStats(FE.getStats()); };
    window.addEventListener('sc_update', refresh);
    return () => window.removeEventListener('sc_update', refresh);
  }, []);

  const filtered = WORKOUTS.filter(w => {
    const matchSearch = !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.target.toLowerCase().includes(search.toLowerCase());
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
  function resetWizard() { setStep(0); setPicks({ level:'', target:'', goal:'', duration:'' }); setResults(null); }

  const TABS = [
    { id:'programs', label:'🗺️ Journeys' },
    { id:'all',      label:'Workouts' },
    { id:'wizard',   label:'🔮 Wizard' },
    { id:'stats',    label:'📊 Progress' },
  ];

  return h('div', { style:{ paddingBottom:100, background:'#0a0f1e', minHeight:'100dvh' } },
    h(PageHeader, { title:'Fitness Builder', subtitle:`${WORKOUTS.length} workouts · ${FE?FE.PROGRAMS.length:0} journeys · every level`, gradient:'linear-gradient(135deg,#c2410c,#dc2626)' }),

    (tab === 'programs' || tab === 'stats') && h(RankHeader, { stats }),

    // Tabs
    h('div', { style:{ display:'flex', gap:4, margin:'12px 16px', padding:4, background:'rgba(16,22,36,0.9)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:14 } },
      TABS.map(t => h('button', {
        key:t.id, onPointerDown:() => { if(A.playTabClick) A.playTabClick(); setTab(t.id); resetWizard(); },
        style:{ flex:1, padding:'9px 4px', fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', border:'none', borderRadius:10, transition:'all 0.2s',
          background: tab===t.id ? 'linear-gradient(135deg,#c2410c,#ea580c)' : 'transparent',
          color: tab===t.id ? '#fff' : '#6b7280',
          boxShadow: tab===t.id ? '0 2px 10px rgba(194,65,12,0.35)' : 'none' }
      }, t.label))
    ),

    // ── PROGRAMS / JOURNEYS ──────────────────────────────────
    tab === 'programs' && h(ProgramsTab, { stats }),

    // ── PROGRESS ─────────────────────────────────────────────
    tab === 'stats' && h(ProgressTab, { stats }),

    // ── ALL WORKOUTS ─────────────────────────────────────────
    tab === 'all' && h('div', { style:{ padding:'12px 16px 0' } },
      h('div', { style:{ position:'relative', marginBottom:10 } },
        h('input', { type:'search', value:search, placeholder:'Search workouts…', onChange: e => setSearch(e.target.value),
          style:{ width:'100%', padding:'10px 14px 10px 38px', borderRadius:9999, background:'rgba(16,22,36,0.95)', border:'1px solid rgba(255,255,255,0.08)', color:'#f0fdf4', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' },
          onFocus: e => e.target.style.borderColor='rgba(249,115,22,0.5)', onBlur: e => e.target.style.borderColor='rgba(255,255,255,0.08)' }),
        h('span', { style:{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 } }, '🔍')
      ),
      h('div', { style:{ display:'flex', gap:6, overflowX:'auto', paddingBottom:6, scrollbarWidth:'none', marginBottom:10 } },
        h('button', { key:'all', onClick:() => setLevelFilter('all'),
          style:{ flexShrink:0, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700,
            background: levelFilter==='all'?'rgba(249,115,22,0.2)':'rgba(22,27,34,0.9)', color: levelFilter==='all'?'#f97316':'#6b7280', outline: levelFilter==='all'?'1.5px solid rgba(249,115,22,0.5)':'none' } }, 'All Levels'),
        ['beginner','intermediate','advanced','pro'].map(lv => h('button', { key:lv, onClick:() => setLevelFilter(lv),
          style:{ flexShrink:0, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700,
            background: levelFilter===lv ? LVL_COLOR[lv]+'25' : 'rgba(22,27,34,0.9)', color: levelFilter===lv ? LVL_COLOR[lv] : '#6b7280', outline: levelFilter===lv ? '1.5px solid '+LVL_COLOR[lv]+'60' : 'none' } }, lv.charAt(0).toUpperCase()+lv.slice(1)))
      ),
      h('div', { style:{ display:'flex', gap:6, overflowX:'auto', paddingBottom:8, scrollbarWidth:'none' } },
        [ { id:'all', label:'All Goals', color:'#9ca3af' }, { id:'build-muscle', label:'💪 Muscle', color:'#f97316' },
          { id:'lose-weight', label:'🔥 Fat Burn', color:'#ef4444' }, { id:'improve-endurance', label:'🏃 Endurance', color:'#10b981' } ].map(g => h('button', { key:g.id, onClick:() => setGoalFilter(g.id),
          style:{ flexShrink:0, padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700,
            background: goalFilter===g.id ? g.color+'20' : 'rgba(22,27,34,0.9)', color: goalFilter===g.id ? g.color : '#6b7280', outline: goalFilter===g.id ? '1.5px solid '+g.color+'50' : 'none' } }, g.label))
      ),
      h('div', { style:{ fontSize:12, color:'#6b7280', marginBottom:10 } }, filtered.length + ' workout' + (filtered.length!==1?'s':'') + ' found'),
      filtered.length === 0
        ? h('div', { style:{ textAlign:'center', padding:'48px 20px' } },
            h('div', { style:{ fontSize:40, marginBottom:12 } }, '💪'),
            h('div', { style:{ fontSize:14, color:'#6b7280' } }, 'No workouts match your filters'),
            h('button', { onClick:() => { setSearch(''); setLevelFilter('all'); setGoalFilter('all'); }, style:{ marginTop:14, padding:'8px 20px', background:'rgba(249,115,22,0.15)', border:'1px solid rgba(249,115,22,0.3)', borderRadius:8, color:'#f97316', cursor:'pointer', fontSize:12, fontWeight:700, fontFamily:'inherit' } }, 'Clear Filters'))
        : h('div', { className:'sc-stagger', style:{ display:'flex', flexDirection:'column', gap:8 } }, filtered.map(w => h(WorkoutCard, { key:w.id, w:w })))
    ),

    // ── WIZARD ───────────────────────────────────────────────
    tab === 'wizard' && h('div', { style:{ padding:'12px 16px 0' } },
      !results && h('div', null,
        h('div', { style:{ display:'flex', justifyContent:'center', gap:4, marginBottom:16 } },
          WIZARD.map((_,i) => h('div', { key:i, style:{ height:3, borderRadius:2, transition:'all 0.3s', width: i===step?'2rem':'0.5rem', background: i<=step?'#f97316':'rgba(51,65,85,0.5)' }}))
        ),
        h('h2', { style:{ fontSize:15, fontWeight:800, color:'#f0fdf4', marginBottom:8 } }, WIZARD[step].label),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          WIZARD[step].opts.map(opt => h('button', { key:opt.id, onClick:() => choose(WIZARD[step].key, opt.id),
            style:{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)', cursor:'pointer', fontFamily:'inherit', textAlign:'left' } },
            h('div', { style:{ width:36, height:36, borderRadius:7, background:'rgba(48,54,61,0.6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } }, h(Icon, { n:opt.icon||'activity', cls:'w-4 h-4', style:{ color:'#8b949e' } })),
            h('div', { style:{ flex:1 } },
              h('div', { style:{ fontSize:13, fontWeight:700, color:'#e6edf3' } }, opt.label),
              opt.desc && h('div', { style:{ fontSize:11, color:'#484f58', marginTop:2 } }, opt.desc)
            ),
            h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#374151' } })
          ))
        ),
        step > 0 && h('button', { onClick:() => setStep(s => s-1), style:{ display:'flex', alignItems:'center', gap:6, marginTop:12, background:'none', border:'none', color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:600, fontFamily:'inherit' } }, h(Icon, { n:'arrowL', cls:'w-4 h-4' }), 'Back')
      ),
      results && h('div', null,
        h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10, marginBottom:12, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)' } },
          h('div', { style:{ fontSize:13, fontWeight:700, color:'#34d399' } }, results.length + ' workout' + (results.length!==1?'s':'') + ' found'),
          h('button', { onClick:resetWizard, style:{ fontSize:11, fontWeight:700, color:'#9ca3af', background:'none', border:'none', cursor:'pointer' } }, 'New Search')
        ),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } }, results.map(w => h(WorkoutCard, { key:w.id, w:w })))
      )
    )
  );
}

// ── Workout Card ──────────────────────────────────────────────
function WorkoutCard({ w }) {
  const grad = LVL_GRAD[w.level] || '#c2410c,#ea580c';
  const lvlColor = LVL_COLOR[w.level] || '#f97316';
  const goalEmoji = { 'build-muscle':'💪', 'lose-weight':'🔥', 'improve-endurance':'🏃' };
  const targetEmoji = { 'full-body':'🏋️', 'chest':'💪', 'back':'🔙', 'shoulders':'🏔️', 'arms':'💪', 'legs':'🦵', 'core':'🎯', 'glutes':'🍑' };
  return h('button', { onClick: () => nav('WorkoutDetail', { id:w.id }),
    className:'sc-spring sc-ripple',
    style:{ display:'flex', flexDirection:'column', borderRadius:14, background:'rgba(16,22,36,0.9)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%', overflow:'hidden', padding:0 } },
    h('div', { style:{ height:3, background:lvlColor, borderRadius:'14px 14px 0 0', flexShrink:0 } }),
    h('div', { style:{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px' } },
      h('div', { style:{ width:44, height:44, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:`linear-gradient(135deg,${grad})` } }, h('span', { style:{ fontSize:20 } }, targetEmoji[w.target] || '💪')),
      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 } }, w.name),
        h('div', { style:{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' } },
          h('span', { style:{ fontSize:10, fontWeight:700, padding:'2px 6px', borderRadius:4, background:lvlColor+'18', color:lvlColor, border:'1px solid '+lvlColor+'30' } }, w.level),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, w.target.replace('-',' ')),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, '·'),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, w.duration_minutes+'min'),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, '·'),
          h('span', { style:{ fontSize:11, color:'#6b7280' } }, goalEmoji[w.goal]||'')
        )
      ),
      h(XPBadge, { xp:w.xp_value }),
      h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#374151', flexShrink:0 } })
    )
  );
}

// ════════════════════════════════════════════════════════════
// WORKOUT DETAIL PAGE
// ════════════════════════════════════════════════════════════
function WorkoutDetailPage({ params }) {
  const w = WORKOUTS.find(wk => wk.id === params?.id);
  if(!w) return h('div', { style:{ paddingBottom:120, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'80vh' } },
    h('div', { style:{ fontSize:40, marginBottom:16 } }, '💪'),
    h('p', { style:{ fontWeight:700, color:'#f0fdf4', marginBottom:16 } }, 'Workout not found'),
    h('button', { onClick:() => nav('Fitness'), style:{ padding:'12px 24px', background:'#c2410c', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 } }, '← Back'));

  const complete = () => nav('WorkoutPlayer', { id: w.id });
  const grad = LVL_GRAD[w.level] || '#c2410c,#ea580c';
  const lvlColor = LVL_COLOR[w.level] || '#f97316';
  const goalLabels = { 'build-muscle':'Build Muscle', 'lose-weight':'Lose Weight', 'improve-endurance':'Endurance' };
  const lastRating = FE && FE.getRating ? FE.getRating(w.id) : null;
  const ratingNote = { easy:'You found this easy last time — we’ve bumped the intensity up.', hard:'You found this tough last time — we’ve eased it back a little.', perfect:'Dialled in for you based on last time.' };

  return h('div', { style:{ paddingBottom:100, background:'#0a0f1e', minHeight:'100dvh' } },
    h(PageHeader, { title:w.name, subtitle:`${w.duration_minutes} min · ${w.exercises} exercises · ${w.xp_value} XP`, gradient:`linear-gradient(135deg,${grad})`, onBack:() => nav('Fitness') }),
    h('div', { style:{ padding:'16px' } },
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 } },
        h(StatCard, { label:'Level', value:w.level.charAt(0).toUpperCase()+w.level.slice(1), color:lvlColor }),
        h(StatCard, { label:'Focus', value:w.target.replace('-',' '), color:'#f97316' }),
        h(StatCard, { label:'Goal', value:goalLabels[w.goal]||w.goal, color:'#f59e0b' })
      ),
      lastRating && h('div', { style:{ padding:'11px 14px', borderRadius:11, marginBottom:14, background:'rgba(96,165,250,0.08)', border:'1px solid rgba(96,165,250,0.22)' } },
        h('span', { style:{ fontSize:12, color:'#93c5fd', fontWeight:600 } }, '🎯 ' + (ratingNote[lastRating]||'Adapted to you.'))
      ),
      h('div', { style:{ padding:'16px', borderRadius:12, background:'rgba(30,41,59,0.6)', border:'1px solid rgba(51,65,85,0.5)', marginBottom:16 } },
        h('p', { style:{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 } }, 'About This Workout'),
        h('p', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.65 } },
          `A guided ${w.duration_minutes}-minute ${w.level} session targeting ${w.target.replace('-',' ')} with a focus on ${(goalLabels[w.goal]||w.goal).toLowerCase()}. It opens with a warm-up, works through ${w.exercises} main exercises with sets, reps and rest tuned to your level, and finishes with a cool-down stretch.`)
      ),
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16 } },
        [ { label:'Exercises', value:w.exercises }, { label:'Duration', value:w.duration_minutes+'min' }, { label:'XP Reward', value:'+'+w.xp_value } ].map(stat => h('div', { key:stat.label, style:{ padding:'12px 8px', borderRadius:10, background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)', textAlign:'center' } },
          h('div', { style:{ fontSize:20, fontWeight:800, color:'#f0fdf4' } }, stat.value),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 } }, stat.label)
        ))
      ),
      h('button', { onClick:complete, style:{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'15px', border:'none', borderRadius:12, fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:'pointer', background:`linear-gradient(135deg,${grad})`, color:'#fff', boxShadow:`0 4px 20px rgba(194,65,12,0.45)` } }, '🏋️  Start Workout →')
    )
  );
}

Object.assign(window.SC_APP, { FitnessPage, WorkoutDetailPage, WorkoutCard });
console.log('[SC] app-fitness v3.0 — ecosystem: journeys, ranks, progress,', WORKOUTS ? WORKOUTS.length : 0, 'workouts');
})();
