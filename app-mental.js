// ================================================================
// Save as: app-mental.js
// SmartCrick AI — Mental Training Page + Mental Player
// UPDATED: M-A breathing orb animation, M-B scenario entry flow
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const { nav, DB, awardXP, fireConfetti, fmtTime } = window.SC_APP;
const { MENTAL_SESSIONS, MENT_CATS } = window.SC_APP;
const { Icon, XPBadge, PremiumBadge, EmptyState, PageHeader } = window.SC_APP;

// ================================================================
// M-B: SCENARIO DEFINITIONS
// Cricket-specific "how are you feeling?" entry points that map
// to the most relevant mental sessions.
// ================================================================
const MENTAL_SCENARIOS = [
  {
    id: 'nervous',
    emoji: '😰',
    label: 'Nervous before match',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.10)',
    border: 'rgba(249,115,22,0.28)',
    sessionIds: ['m51','m52','m80','m63','m50'],
  },
  {
    id: 'bad_form',
    emoji: '💔',
    label: 'Duck / dropped / bad form',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.10)',
    border: 'rgba(239,68,68,0.28)',
    sessionIds: ['m32','m33','m35','m36','m30'],
  },
  {
    id: 'distracted',
    emoji: '😤',
    label: "Can't focus right now",
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.28)',
    sessionIds: ['m03','m05','m07','m04','m09'],
  },
  {
    id: 'flat',
    emoji: '😴',
    label: 'Flat / low confidence',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.10)',
    border: 'rgba(139,92,246,0.28)',
    sessionIds: ['m21','m22','m23','m25','m27'],
  },
  {
    id: 'bowling',
    emoji: '🎯',
    label: 'About to bowl a spell',
    color: '#10b981',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.28)',
    sessionIds: ['m65','m62','m64','m63','m50'],
  },
  {
    id: 'peak',
    emoji: '⚡',
    label: 'Want peak performance',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.10)',
    border: 'rgba(245,158,11,0.28)',
    sessionIds: ['m53','m26','m54','m28'],
  },
];

// ================================================================
// M-A: BREATHING ORB COMPONENT
// Pulsing orb that guides breath: inhale (4s) → hold (2s) → exhale (6s)
// Uses CSS transitions on scale — hardware-accelerated, smooth.
// Pass isPlaying=false to pause the cycle (e.g. when session is paused).
// ================================================================
function BreathingOrb({ isPlaying = true }) {
  // Phase definitions: id, user-facing label, duration in ms, orb scale
  const PHASES = [
    { id:'inhale', label:'Breathe In',   dur:4000, scale:1.00 },
    { id:'hold',   label:'Hold...',      dur:2000, scale:1.00 },
    { id:'exhale', label:'Breathe Out',  dur:6000, scale:0.52 },
  ];
  const [pi, setPi] = useState(0);
  const tmRef = useRef(null);

  // Advance to next phase after current phase duration
  useEffect(()=>{
    if (!isPlaying) { clearTimeout(tmRef.current); return; }
    tmRef.current = setTimeout(()=> setPi(p => (p + 1) % 3), PHASES[pi].dur);
    return ()=> clearTimeout(tmRef.current);
  }, [pi, isPlaying]);

  const ph  = PHASES[pi];
  const dur = ph.dur / 1000; // seconds for CSS transition

  return h('div',{
    className:'breathing-orb-wrap',
    style:{display:'flex',flexDirection:'column',alignItems:'center',gap:14,userSelect:'none'},
  },
    // Three concentric layers that all scale together
    h('div',{style:{position:'relative',width:150,height:150,display:'flex',alignItems:'center',justifyContent:'center'}},
      // Layer 1 — outer glow halo
      h('div',{style:{
        position:'absolute',
        width:150,height:150,borderRadius:'50%',
        background:'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 68%)',
        transform:`scale(${ph.scale * 1.35})`,
        transition:`transform ${dur}s ease-in-out`,
        opacity: isPlaying ? 1 : 0.35,
      }}),
      // Layer 2 — mid ring
      h('div',{style:{
        position:'absolute',
        width:110,height:110,borderRadius:'50%',
        border:`1.5px solid rgba(168,85,247,${isPlaying ? 0.45 : 0.15})`,
        transform:`scale(${ph.scale})`,
        transition:`transform ${dur}s ease-in-out, border-color 0.5s`,
      }}),
      // Layer 3 — inner core orb
      h('div',{style:{
        width:72,height:72,borderRadius:'50%',
        background:isPlaying
          ? `radial-gradient(circle at 35% 33%, rgba(220,150,255,0.95), rgba(109,40,217,0.75))`
          : `radial-gradient(circle at 35% 33%, rgba(168,85,247,0.4), rgba(109,40,217,0.3))`,
        transform:`scale(${ph.scale})`,
        transition:`transform ${dur}s ease-in-out, background 0.6s`,
        boxShadow: isPlaying
          ? `0 0 24px rgba(168,85,247,0.40), inset 0 0 18px rgba(210,150,255,0.18)`
          : `0 0 8px rgba(168,85,247,0.15)`,
      }})
    ),
    // Phase label
    h('div',{style:{
      fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',
      color:isPlaying?'rgba(196,130,255,0.95)':'rgba(168,85,247,0.4)',
      minWidth:100,textAlign:'center',
      transition:'color 0.4s',
    }}, isPlaying ? ph.label : '— Paused —')
  );
}

// ================================================================
// MENTAL PAGE — M-B scenario entry flow + full session browser
// ================================================================
function MentalPage() {
  const [cat, setCat]                 = useState('all');
  const [search, setSearch]           = useState('');
  const [activeScenario, setScenario] = useState(null); // M-B scenario
  const progress = DB.getProgress();
  const done = progress.completed_mental || [];
  const catDef = MENT_CATS.find(c=>c.id===cat) || MENT_CATS[0];

  // M-B: Get recommended sessions for active scenario
  const scenarioSessions = activeScenario
    ? activeScenario.sessionIds
        .map(id => MENTAL_SESSIONS.find(s=>s.id===id))
        .filter(Boolean)
    : [];

  // Filter the full list by category + search
  const filtered = MENTAL_SESSIONS.filter(s=>
    (cat==='all' || s.category===cat) &&
    (search==='' || s.title.toLowerCase().includes(search.toLowerCase()))
  );

  // Toggle scenario selection
  const handleScenario = sc => {
    setScenario(prev => prev?.id === sc.id ? null : sc);
    setCat('all'); // Reset category when picking scenario
    setSearch('');
  };

  return h('div',{className:'pb-28'},
    h(PageHeader,{
      title:'Mental Training',
      subtitle:`${MENTAL_SESSIONS.length} guided sessions`,
      gradient:'linear-gradient(135deg,#5b21b6,#4f46e5)',
    }),

    // ── M-B: Scenario entry ──────────────────────────────────────
    h('div',{style:{padding:'16px 16px 0'}},
      h('p',{style:{
        fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',
        letterSpacing:'0.1em',marginBottom:10,
      }},'How are you feeling right now?'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7}},
        MENTAL_SCENARIOS.map(sc=>{
          const isActive = activeScenario?.id === sc.id;
          return h('button',{
            key:sc.id,
            onClick:()=>handleScenario(sc),
            style:{
              display:'flex',flexDirection:'column',alignItems:'center',
              justifyContent:'center',gap:4,
              padding:'10px 6px',borderRadius:10,
              background:isActive ? sc.bg : 'rgba(22,27,34,0.9)',
              border:`1.5px solid ${isActive ? sc.border : 'rgba(48,54,61,0.8)'}`,
              cursor:'pointer',transition:'all 0.15s',
              transform:isActive?'scale(1.03)':'scale(1)',
            }
          },
            h('span',{style:{fontSize:20,lineHeight:1}},sc.emoji),
            h('span',{style:{
              fontSize:10,fontWeight:600,textAlign:'center',lineHeight:1.3,
              color:isActive ? sc.color : '#6b7280',
            }},sc.label)
          );
        })
      )
    ),

    // ── M-B: Recommended sessions for selected scenario ──────────
    activeScenario && h('div',{style:{margin:'16px 16px 0'}},
      h('div',{style:{
        padding:'14px 14px 10px',borderRadius:12,
        background:activeScenario.bg,border:`1px solid ${activeScenario.border}`,
      }},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
          h('p',{style:{fontSize:12,fontWeight:700,color:activeScenario.color,textTransform:'uppercase',letterSpacing:'0.08em'}},
            `Recommended for you`),
          h('button',{
            onClick:()=>setScenario(null),
            style:{fontSize:11,color:'#6b7280',background:'none',border:'none',cursor:'pointer',fontWeight:600}
          },'Clear ×')
        ),
        h('div',{style:{display:'flex',flexDirection:'column',gap:7}},
          scenarioSessions.slice(0,3).map(s=>{
            const mins = Math.floor(s.duration_seconds/60);
            const sc   = MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
            return h('button',{
              key:s.id,
              onClick:()=>nav('MentalPlayer',{id:s.id}),
              style:{
                display:'flex',alignItems:'center',gap:10,padding:'11px 12px',
                borderRadius:9,background:'rgba(13,17,23,0.6)',
                border:'1px solid rgba(48,54,61,0.7)',cursor:'pointer',
                textAlign:'left',transition:'all 0.12s',width:'100%',
              }
            },
              h('div',{style:{
                width:36,height:36,borderRadius:7,flexShrink:0,
                background:`linear-gradient(135deg,${sc.from},${sc.to})`,
                display:'flex',alignItems:'center',justifyContent:'center',
              }},
                h(Icon,{n:sc.icon,cls:'w-4 h-4 text-white'})
              ),
              h('div',{style:{flex:1,minWidth:0}},
                h('div',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},s.title),
                h('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:3}},
                  h('span',{style:{fontSize:11,color:'#6b7280'}},`${mins} min`),
                  h(XPBadge,{xp:s.xp_value})
                )
              ),
              h(Icon,{n:'play',cls:'w-4 h-4 flex-shrink-0',style:{color:activeScenario.color}})
            );
          })
        )
      )
    ),

    // ── Category pills ────────────────────────────────────────────
    h('div',{className:'flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide'},
      MENT_CATS.map(c=>
        h('button',{key:c.id,onClick:()=>{ setCat(c.id); setScenario(null); },
          className:'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all',
          style:cat===c.id
            ?{background:`linear-gradient(135deg,${c.from},${c.to})`,color:'#fff',boxShadow:`0 4px 14px ${c.from}40`}
            :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'}
        },
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5 flex-shrink-0',style:{color:cat===c.id?'#fff':'#484f58'}}),
          ' ', c.label)
      )
    ),

    // ── Search ────────────────────────────────────────────────────
    h('div',{className:'px-4 mb-3'},
      h('div',{className:'relative'},
        h(Icon,{n:'search',cls:'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2',style:{color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search sessions…',value:search,onChange:e=>{setSearch(e.target.value);setScenario(null);},
          className:'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none',
          style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3'}
        })
      )
    ),

    // ── Session list ──────────────────────────────────────────────
    h('div',{className:'px-4 space-y-2.5'},
      filtered.length===0
        ? h(EmptyState,{icon:'brain',title:'No sessions found',desc:'Try a different category or search term'})
        : filtered.map(s=>{
          const mins   = Math.floor(s.duration_seconds/60);
          const isDone = done.includes(s.id);
          const sc     = MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
          return h('button',{key:s.id,onClick:()=>nav('MentalPlayer',{id:s.id}),
            className:'w-full text-left p-4 rounded-2xl transition-all active:scale-[.99] pro-card',
            style:{background:'rgba(22,27,34,0.9)',border:`1px solid ${isDone?'rgba(22,163,74,0.3)':'rgba(48,54,61,0.9)'}`,borderRadius:10}
          },
            h('div',{className:'flex items-center gap-3'},
              h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0,position:'relative',
                background:`linear-gradient(135deg,${sc.from},${sc.to})`}},
                h(Icon,{n:sc.icon,cls:'w-5 h-5 text-white'}),
                isDone && h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,
                  borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},
                  h(Icon,{n:'check',cls:'w-3 h-3 text-white'})
                )
              ),
              h('div',{className:'flex-1 min-w-0'},
                h('div',{className:'flex items-start justify-between gap-2'},
                  h('h3',{className:'font-bold text-white text-sm truncate'},s.title),
                  s.is_premium && h(PremiumBadge)
                ),
                h('div',{className:'flex items-center gap-2 mt-1.5'},
                  h('span',{className:'text-xs',style:{color:'#64748b'}},`${mins} min`),
                  h(XPBadge,{xp:s.xp_value}),
                  isDone && h('div',{style:{display:'flex',alignItems:'center',gap:3}},
                    h(Icon,{n:'check',cls:'w-3 h-3',style:{color:'#4ade80'}}),
                    h('span',{style:{fontSize:11,fontWeight:700,color:'#4ade80'}},'Done')
                  )
                )
              )
            )
          );
        })
    )
  );
}

// ================================================================
// MENTAL PLAYER — M-A: Breathing orb replaces ring timer
// Full guided session with breathing animation, pause, skip
// ================================================================
function MentalPlayerPage({ params }) {
  const sess          = MENTAL_SESSIONS.find(s=>s.id===params?.id);
  const [started,    setStarted]    = useState(false);
  const [step,       setStep]       = useState(0);
  const [timeLeft,   setTimeLeft]   = useState(0);
  const [done,       setDone]       = useState(false);
  const [paused,     setPaused]     = useState(false);
  const intRef       = useRef(null);
  const awardedRef   = useRef(false);
  const completingRef= useRef(false);

  useEffect(()=>{ if(!started){ awardedRef.current=false; completingRef.current=false; } },[started]);

  // Load step duration whenever step/started changes
  useEffect(()=>{
    if(started && sess && !done){
      clearInterval(intRef.current);
      setTimeLeft(sess.steps[step]?.duration_seconds||60);
      setPaused(false);
    }
    return ()=>clearInterval(intRef.current);
  },[step,started,done]);

  // Countdown ticker
  useEffect(()=>{
    if(!started||done||paused){ clearInterval(intRef.current); return; }
    clearInterval(intRef.current);
    intRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(intRef.current);
          if(step<sess.steps.length-1){ setStep(s=>s+1); }
          else { finishSession(); }
          return 0;
        }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(intRef.current);
  },[started,done,paused,step]);

  useEffect(()=>()=>clearInterval(intRef.current),[]);

  const finishSession=()=>{
    if(awardedRef.current) return;
    awardedRef.current=true;
    setDone(true);
    awardXP(sess.xp_value,Math.floor(sess.duration_seconds/60),'mental','mental',sess.id);
    fireConfetti();
  };

  const goNext=()=>{
    if(completingRef.current) return;
    clearInterval(intRef.current);
    if(step<sess.steps.length-1){ setStep(s=>s+1); }
    else{ completingRef.current=true; finishSession(); }
  };

  const skipStep=()=>{
    clearInterval(intRef.current);
    if(step<sess.steps.length-1){ setStep(s=>s+1); }
    else{ completingRef.current=true; finishSession(); }
  };

  const goPrev=()=>{
    if(step>0){ clearInterval(intRef.current); setStep(s=>s-1); }
  };

  // ── Not found ──────────────────────────────────────────────────
  if(!sess) return h('div',{className:'pb-28 flex flex-col items-center justify-center text-center px-5',style:{minHeight:'80vh'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'brain',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('p',{className:'font-bold text-white mb-4'},'Session not found'),
    h('button',{onClick:()=>nav('Mental'),className:'btn-primary px-6 py-3'},'Back')
  );

  // ── Completion screen ──────────────────────────────────────────
  if(done) return h('div',{style:{minHeight:'100vh',background:'linear-gradient(160deg,#0f0824,#1e1040,#0f172a)',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    padding:'1.5rem',textAlign:'center'}},
    h('div',{style:{width:72,height:72,borderRadius:18,background:'rgba(124,58,237,0.2)',
      border:'1px solid rgba(168,85,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}},
      h(Icon,{n:'circleCheck',cls:'w-9 h-9',style:{color:'#a855f7'}})
    ),
    h('h2',{style:{fontSize:'1.5rem',fontWeight:800,color:'#fff',marginBottom:8,letterSpacing:'-0.02em'}},'Session Complete'),
    h('p',{style:{color:'#a78bfa',marginBottom:16,fontSize:14}},sess.title),
    h(XPBadge,{xp:sess.xp_value}),
    h('div',{style:{marginTop:24,display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:280}},
      h('button',{onClick:()=>nav('Mental'),className:'btn-primary'},'More Sessions'),
      h('button',{onClick:()=>{setDone(false);setStarted(false);setStep(0);awardedRef.current=false;completingRef.current=false;},className:'btn-secondary'},'Repeat Session')
    )
  );

  const mins = Math.floor(sess.duration_seconds/60);

  // ── Pre-session preview ────────────────────────────────────────
  if(!started) return h('div',{className:'pb-28'},
    h(PageHeader,{
      title:sess.title,
      subtitle:`${mins} min · ${sess.xp_value} XP · ${sess.steps.length} steps`,
      gradient:'linear-gradient(135deg,#5b21b6,#4338ca)',
      onBack:()=>nav('Mental'),
    }),
    h('div',{style:{padding:'20px'}},
      // Breathing intro callout
      h('div',{style:{
        display:'flex',alignItems:'center',gap:12,padding:'14px 16px',marginBottom:16,
        borderRadius:11,background:'rgba(109,40,217,0.10)',border:'1px solid rgba(109,40,217,0.25)',
      }},
        // Mini static orb for preview
        h('div',{style:{
          width:40,height:40,borderRadius:'50%',flexShrink:0,
          background:'radial-gradient(circle at 35% 33%, rgba(220,150,255,0.8), rgba(109,40,217,0.6))',
          boxShadow:'0 0 12px rgba(168,85,247,0.35)',
        }}),
        h('p',{style:{fontSize:12,color:'rgba(196,130,255,0.9)',lineHeight:1.5,fontWeight:500}},
          'A breathing guide will appear during this session to help you stay calm and present.')
      ),
      h('div',{style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:16,marginBottom:16}},
        h('p',{style:{fontSize:13,color:'#8b949e',lineHeight:1.7}},sess.description)
      ),
      h('div',{style:{marginBottom:20}},
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},
          `${sess.steps.length} Steps — tap Skip to advance any step early`),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          sess.steps.map((s,i)=>
            h('div',{key:i,style:{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',
              borderRadius:8,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
              h('div',{style:{width:22,height:22,borderRadius:'50%',background:'rgba(168,85,247,0.2)',
                border:'1px solid rgba(168,85,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center',
                flexShrink:0,marginTop:1,fontSize:10,fontWeight:800,color:'#a855f7'}},i+1),
              h('p',{style:{fontSize:13,color:'#8b949e',flex:1,lineHeight:1.6}},s.instruction),
              h('span',{style:{fontSize:11,color:'#484f58',flexShrink:0,marginTop:1}},`${s.duration_seconds}s`)
            )
          )
        )
      ),
      h('button',{
        onClick:()=>{ setStarted(true); setStep(0); setTimeLeft(sess.steps[0].duration_seconds); },
        className:'btn-primary',
        style:{padding:'14px',fontSize:15,fontWeight:700},
      },
        h(Icon,{n:'play',cls:'w-5 h-5'}), ' Begin Session'
      )
    )
  );

  // ── Active session player — M-A layout ────────────────────────
  const cur         = sess.steps[step];
  const isLastStep  = step === sess.steps.length-1;
  const progressPct = Math.round((step / sess.steps.length) * 100);
  // Thin step progress (not time-based — calm, not anxious)
  const stepProgress = Math.round(((step + 1) / sess.steps.length) * 100);

  return h('div',{style:{
    minHeight:'100vh',
    background:'linear-gradient(160deg,#0f0824 0%,#170b35 45%,#0f172a 100%)',
    display:'flex',flexDirection:'column',alignItems:'center',
    padding:'max(1.25rem,env(safe-area-inset-top)) 1.25rem max(1.5rem,env(safe-area-inset-bottom))',
  }},

    // Top bar — exit + title + progress%
    h('div',{style:{width:'100%',maxWidth:380,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.875rem'}},
      h('button',{
        onClick:()=>nav('Mental'),
        style:{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.10)',
          borderRadius:8,padding:'6px 12px',cursor:'pointer',color:'#a78bfa',fontSize:12,fontWeight:600}
      },'← Exit'),
      h('div',{style:{textAlign:'center',flex:1,padding:'0 12px'}},
        h('div',{style:{fontSize:11,fontWeight:700,color:'#7c3aed',textTransform:'uppercase',letterSpacing:'0.06em',
          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},sess.title.slice(0,32)),
        h('div',{style:{fontSize:10,color:'#6d28d9',marginTop:1}},`Step ${step+1} of ${sess.steps.length}`)
      ),
      h('div',{style:{fontSize:11,fontWeight:700,color:'#7c3aed',background:'rgba(109,40,217,0.15)',
        border:'1px solid rgba(109,40,217,0.25)',borderRadius:6,padding:'4px 8px',flexShrink:0}},
        `${stepProgress}%`)
    ),

    // Step progress bar (gentle — shows steps not seconds)
    h('div',{style:{width:'100%',maxWidth:380,height:3,background:'rgba(109,40,217,0.18)',borderRadius:2,marginBottom:'2rem'}},
      h('div',{style:{height:'100%',borderRadius:2,background:'linear-gradient(to right,#7c3aed,#a855f7)',
        width:`${stepProgress}%`,transition:'width 0.6s ease'}})
    ),

    // ── M-A: Breathing Orb (main visual anchor) ──────────────────
    h(BreathingOrb,{isPlaying:started && !paused && !done}),

    // Time remaining (compact, below orb — not anxiety-inducing)
    h('div',{style:{marginTop:12,fontSize:15,fontWeight:700,
      color:'rgba(168,85,247,0.55)',fontVariantNumeric:'tabular-nums',letterSpacing:'0.05em'}},
      fmtTime(timeLeft)
    ),

    // Step instruction text
    h('div',{style:{
      textAlign:'center',maxWidth:340,flex:1,
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'1.25rem 0',
    }},
      h('p',{style:{
        fontSize:'1.075rem',color:'#e2d9f3',lineHeight:1.8,fontWeight:500,
        transition:'opacity 0.3s',
      }},cur?.instruction)
    ),

    // Controls
    h('div',{style:{width:'100%',maxWidth:380,display:'flex',flexDirection:'column',gap:9}},
      // Primary: prev + next/complete
      h('div',{style:{display:'flex',gap:9}},
        step>0 && h('button',{onClick:goPrev,
          style:{flex:'0 0 auto',padding:'13px 16px',background:'rgba(255,255,255,0.07)',
            color:'#a78bfa',borderRadius:10,fontWeight:700,
            border:'1px solid rgba(168,85,247,0.20)',cursor:'pointer',fontSize:14}},
          h(Icon,{n:'arrowL',cls:'w-4 h-4 inline-block'})
        ),
        h('button',{onClick:goNext,style:{
          flex:1,padding:'14px',border:'none',cursor:'pointer',fontSize:14,fontWeight:700,
          borderRadius:10,color:'#fff',
          background:isLastStep?'#16a34a':'linear-gradient(135deg,#5b21b6,#4338ca)',
          boxShadow:isLastStep?'0 4px 16px rgba(22,163,74,0.35)':'0 4px 16px rgba(79,70,229,0.35)',
        }},
          isLastStep
            ? h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:8}},h(Icon,{n:'circleCheck',cls:'w-4 h-4'}),'Complete Session')
            : h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:6}},'Next Step ',h(Icon,{n:'chevR',cls:'w-4 h-4'}))
        )
      ),
      // Secondary: skip + pause
      h('div',{style:{display:'flex',gap:9}},
        h('button',{onClick:skipStep,
          style:{flex:1,padding:'11px',background:'transparent',color:'rgba(109,40,217,0.8)',borderRadius:10,
            fontWeight:600,border:'1px solid rgba(109,40,217,0.30)',cursor:'pointer',fontSize:13}},
          isLastStep?'Skip & Complete':'Skip Step'
        ),
        h('button',{
          onClick:()=>{ setPaused(p=>!p); if(!paused) clearInterval(intRef.current); },
          style:{flex:'0 0 auto',padding:'11px 16px',background:'transparent',color:'rgba(109,40,217,0.8)',borderRadius:10,
            fontWeight:600,border:'1px solid rgba(109,40,217,0.30)',cursor:'pointer',fontSize:13}
        },
          h(Icon,{n:paused?'play':'pause',cls:'w-4 h-4'})
        )
      )
    )
  );
}

Object.assign(window.SC_APP, { MentalPage, MentalPlayerPage, BreathingOrb });
console.log('[SC] app-mental ready (M-A breathing orb + M-B scenario entry)');
})();
