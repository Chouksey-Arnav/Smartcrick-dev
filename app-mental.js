// ================================================================
// SmartCrick AI — Mental Training Page + Mental Player
// app-mental.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const { nav, DB, awardXP, fireConfetti, fmtTime } = window.SC_APP;
const { MENTAL_SESSIONS, MENT_CATS } = window.SC_APP;
const { Icon, XPBadge, PremiumBadge, EmptyState, PageHeader } = window.SC_APP;

// ================================================================
// MENTAL PAGE
// ================================================================
function MentalPage() {
  const [cat,setCat]=useState('all');
  const [search,setSearch]=useState('');
  const progress=DB.getProgress();
  const done=progress.completed_mental||[];
  const catDef=MENT_CATS.find(c=>c.id===cat)||MENT_CATS[0];

  const filtered=MENTAL_SESSIONS.filter(s=>
    (cat==='all'||s.category===cat)&&
    (search===''||s.title.toLowerCase().includes(search.toLowerCase()))
  );

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Mental Training',subtitle:`${MENTAL_SESSIONS.length} guided sessions`,
      gradient:'linear-gradient(135deg,#6d28d9,#4f46e5)'}),

    h('div',{className:'flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide'},
      MENT_CATS.map(c=>
        h('button',{key:c.id,onClick:()=>setCat(c.id),
          className:'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all',
          style:cat===c.id?{background:`linear-gradient(135deg,${c.from},${c.to})`,color:'#fff',boxShadow:`0 4px 14px ${c.from}40`}
            :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'}
        },
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5 flex-shrink-0',style:{color:cat===c.id?'#fff':'#484f58'}}),
          ' ', c.label)
      )
    ),

    h('div',{className:'px-4 mb-3'},
      h('div',{className:'relative'},
        h(Icon,{n:'search',cls:'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2',style:{color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search sessions...',value:search,onChange:e=>setSearch(e.target.value),
          className:'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none',
          style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3'}
        })
      )
    ),

    h('div',{className:'px-4 space-y-2.5'},
      filtered.length===0
        ? h(EmptyState,{icon:'brain',title:'No sessions found',desc:'Try a different category or search term'})
        : filtered.map(s=>{
          const mins=Math.floor(s.duration_seconds/60);
          const isDone=done.includes(s.id);
          const sc=MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
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
                    h('span',{style:{fontSize:11,fontWeight:700,color:'#4ade80'}},'Complete')
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
// MENTAL PLAYER — Step-by-step guided session
// ================================================================
function MentalPlayerPage({ params }) {
  const sess=MENTAL_SESSIONS.find(s=>s.id===params?.id);
  const [started,setStarted]=useState(false);
  const [step,setStep]=useState(0);
  const [timeLeft,setTimeLeft]=useState(0);
  const [done,setDone]=useState(false);
  const [paused,setPaused]=useState(false);
  const intRef=useRef(null);
  const awardedRef=useRef(false);
  const completingRef=useRef(false);

  useEffect(()=>{ if(!started) { awardedRef.current=false; completingRef.current=false; } },[started]);

  useEffect(()=>{
    if(started && sess && !done){
      clearInterval(intRef.current);
      setTimeLeft(sess.steps[step]?.duration_seconds||60);
      setPaused(false);
    }
    return ()=>clearInterval(intRef.current);
  },[step,started,done]);

  useEffect(()=>{
    if(!started||done||paused) { clearInterval(intRef.current); return; }
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
    else { completingRef.current=true; finishSession(); }
  };

  const skipStep=()=>{
    clearInterval(intRef.current);
    if(step<sess.steps.length-1){ setStep(s=>s+1); }
    else { completingRef.current=true; finishSession(); }
  };

  const goPrev=()=>{
    if(step>0){ clearInterval(intRef.current); setStep(s=>s-1); }
  };

  if(!sess) return h('div',{className:'pb-28 flex flex-col items-center justify-center text-center px-5',style:{minHeight:'80vh'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'brain',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('p',{className:'font-bold text-white mb-4'},'Session not found'),
    h('button',{onClick:()=>nav('Mental'),className:'btn-primary px-6 py-3'},'Back')
  );

  if(done) return h('div',{style:{minHeight:'100vh',background:'linear-gradient(135deg,#0f0824,#1e1040,#0f172a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem',textAlign:'center'}},
    h('div',{style:{width:72,height:72,borderRadius:18,background:'rgba(124,58,237,0.2)',border:'1px solid rgba(168,85,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}},
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

  const mins=Math.floor(sess.duration_seconds/60);

  // Pre-session preview
  if(!started) return h('div',{className:'pb-28'},
    h(PageHeader,{title:sess.title,subtitle:`${mins} min · ${sess.xp_value} XP · ${sess.steps.length} steps`,
      gradient:'linear-gradient(135deg,#6d28d9,#4338ca)',onBack:()=>nav('Mental')}),
    h('div',{style:{padding:'20px'}},
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
      h('button',{onClick:()=>{setStarted(true);setStep(0);setTimeLeft(sess.steps[0].duration_seconds);},
        className:'btn-primary',style:{padding:'14px',fontSize:15,fontWeight:700}},
        h(Icon,{n:'play',cls:'w-5 h-5'}), ' Begin Session'
      )
    )
  );

  // Active guided player
  const cur=sess.steps[step];
  const pct=cur&&cur.duration_seconds>0?timeLeft/cur.duration_seconds:0;
  const R=90, C=2*Math.PI*R;
  const isLastStep=step===sess.steps.length-1;
  const progressPct=Math.round(((step)/(sess.steps.length))*100);

  return h('div',{style:{minHeight:'100vh',background:'linear-gradient(160deg,#0f0824 0%,#1e1040 50%,#0f172a 100%)',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',
    padding:'max(1.5rem,env(safe-area-inset-top)) 1.5rem max(1.5rem,env(safe-area-inset-bottom))'}},

    // Top bar
    h('div',{style:{width:'100%',maxWidth:360,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}},
      h('button',{onClick:()=>nav('Mental'),style:{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',
        borderRadius:8,padding:'6px 10px',cursor:'pointer',color:'#a78bfa',fontSize:12,fontWeight:600}},
        '← Exit'),
      h('div',{style:{textAlign:'center'}},
        h('div',{style:{fontSize:11,fontWeight:700,color:'#7c3aed',textTransform:'uppercase',letterSpacing:'0.08em'}},sess.title.slice(0,28)),
        h('div',{style:{fontSize:10,color:'#6d28d9',marginTop:2}},`Step ${step+1} of ${sess.steps.length}`)
      ),
      h('div',{style:{fontSize:11,fontWeight:700,color:'#7c3aed',background:'rgba(109,40,217,0.15)',
        border:'1px solid rgba(109,40,217,0.25)',borderRadius:6,padding:'4px 8px'}},`${progressPct}%`)
    ),

    // Progress bar
    h('div',{style:{width:'100%',maxWidth:360,height:3,background:'rgba(109,40,217,0.2)',borderRadius:2,marginBottom:'1.5rem'}},
      h('div',{style:{height:'100%',borderRadius:2,background:'#a855f7',
        width:`${Math.round(((step+(1-pct))/(sess.steps.length))*100)}%`,transition:'width 0.5s ease'}})
    ),

    // Ring timer
    h('div',{style:{position:'relative',width:220,height:220,flexShrink:0}},
      h('svg',{width:220,height:220,viewBox:'0 0 220 220'},
        h('circle',{cx:110,cy:110,r:R,fill:'none',stroke:'rgba(109,40,217,0.15)',strokeWidth:12}),
        h('circle',{cx:110,cy:110,r:R,fill:'none',stroke:'#a855f7',strokeWidth:12,
          strokeLinecap:'round',strokeDasharray:C,
          strokeDashoffset:C*(1-Math.max(0,Math.min(1,pct))),
          style:{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dashoffset 1s linear'}
        })
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}},
        h('div',{style:{fontSize:'2.75rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums',lineHeight:1}},fmtTime(timeLeft)),
        h('div',{style:{fontSize:11,color:'#7c3aed',fontWeight:700,marginTop:6,letterSpacing:'0.04em'}},paused?'PAUSED':'RUNNING')
      )
    ),

    // Step instruction
    h('div',{style:{textAlign:'center',maxWidth:320,flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem 0'}},
      h('p',{style:{fontSize:'1.05rem',color:'#ddd6fe',lineHeight:1.75,fontWeight:500}},cur?.instruction)
    ),

    // Controls
    h('div',{style:{width:'100%',maxWidth:360,display:'flex',flexDirection:'column',gap:10}},
      h('div',{style:{display:'flex',gap:10}},
        step>0 && h('button',{onClick:goPrev,
          style:{flex:'0 0 auto',padding:'12px 18px',background:'rgba(255,255,255,0.08)',
            color:'#a78bfa',borderRadius:10,fontWeight:700,border:'1px solid rgba(168,85,247,0.2)',cursor:'pointer',fontSize:14}},
          h(Icon,{n:'arrowL',cls:'w-4 h-4 inline-block'})
        ),
        h('button',{onClick:goNext,
          style:{flex:1,padding:'13px',background:isLastStep?'#16a34a':'linear-gradient(135deg,#6d28d9,#4338ca)',
            color:'#fff',borderRadius:10,fontWeight:700,border:'none',cursor:'pointer',fontSize:14}},
          isLastStep
            ? h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:8}},h(Icon,{n:'circleCheck',cls:'w-4 h-4'}),'Complete Session')
            : h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:6}},'Next Step ',h(Icon,{n:'chevR',cls:'w-4 h-4'}))
        )
      ),
      h('div',{style:{display:'flex',gap:10}},
        h('button',{onClick:skipStep,
          style:{flex:1,padding:'10px',background:'transparent',color:'#6d28d9',borderRadius:10,
            fontWeight:600,border:'1px solid rgba(109,40,217,0.3)',cursor:'pointer',fontSize:13}},
          isLastStep?'Skip & Complete':'Skip Step'
        ),
        h('button',{onClick:()=>{ setPaused(p=>!p); if(!paused) clearInterval(intRef.current); },
          style:{flex:'0 0 auto',padding:'10px 18px',background:'transparent',color:'#6d28d9',borderRadius:10,
            fontWeight:600,border:'1px solid rgba(109,40,217,0.3)',cursor:'pointer',fontSize:13}},
          h(Icon,{n:paused?'play':'pause',cls:'w-4 h-4'})
        )
      )
    )
  );
}

Object.assign(window.SC_APP, { MentalPage, MentalPlayerPage });
console.log('[SC] app-mental ready');
})();
