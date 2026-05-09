// ================================================================
// SmartCrick AI — Timer Page (Stopwatch, Countdown, Interval, Cricket)
// app-timer.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const { fmtTime } = window.SC_APP;
const { Icon, PageHeader } = window.SC_APP;

// ── SVG Ring component ────────────────────────────────────────────
function Ring({ pct, size=220, stroke=14, color='#10b981', bg='rgba(30,41,59,0.6)', children }) {
  const r=(size-stroke)/2, C=2*Math.PI*r;
  return h('div',{style:{position:'relative',width:size,height:size,display:'flex',alignItems:'center',justifyContent:'center'}},
    h('svg',{width:size,height:size,viewBox:`0 0 ${size} ${size}`,style:{position:'absolute',inset:0}},
      h('circle',{cx:size/2,cy:size/2,r,fill:'none',stroke:bg,strokeWidth:stroke}),
      h('circle',{cx:size/2,cy:size/2,r,fill:'none',stroke:color,strokeWidth:stroke,
        strokeLinecap:'round',strokeDasharray:C,strokeDashoffset:C*(1-Math.max(0,Math.min(1,pct))),
        style:{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dashoffset 1s linear'}
      })
    ),
    h('div',{style:{position:'absolute',textAlign:'center'}},children)
  );
}

// ── STOPWATCH ─────────────────────────────────────────────────────
function StopwatchMode() {
  const [elapsed,setElapsed]=useState(0);
  const [running,setRunning]=useState(false);
  const [laps,setLaps]=useState([]);
  const intRef=useRef(null);
  const lapStart=useRef(0);

  useEffect(()=>{
    if(running) intRef.current=setInterval(()=>setElapsed(e=>e+1),1000);
    else clearInterval(intRef.current);
    return()=>clearInterval(intRef.current);
  },[running]);

  const toggle=()=>setRunning(r=>!r);
  const lap=()=>{
    const t=elapsed-lapStart.current;
    setLaps(l=>[...l,{n:l.length+1,t,total:elapsed}]);
    lapStart.current=elapsed;
  };
  const reset=()=>{setRunning(false);setElapsed(0);setLaps([]);lapStart.current=0;};

  return h('div',{className:'flex flex-col items-center px-5 pt-6'},
    h(Ring,{pct:(elapsed%60)/60,color:'#10b981'},
      h('div',{style:{fontSize:'2.5rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums'}},fmtTime(elapsed)),
      h('div',{style:{fontSize:'0.7rem',color:'#94a3b8',fontWeight:700}},`LAP ${laps.length+1}`)
    ),
    h('div',{className:'flex gap-4 mt-6'},
      h('button',{onClick:reset,style:{width:56,height:56,borderRadius:'50%',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.6)',color:'#94a3b8',cursor:'pointer',fontWeight:800,fontSize:'0.75rem'}},'RST'),
      h('button',{onClick:toggle,style:{width:80,height:80,borderRadius:'50%',background:running?'linear-gradient(135deg,#dc2626,#be123c)':'linear-gradient(135deg,#059669,#0d9488)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:running?'0 8px 32px rgba(220,38,38,0.4)':'0 8px 32px rgba(5,150,105,0.4)'}},
        h(Icon,{n:running?'pause':'play',cls:'w-8 h-8 text-white'})
      ),
      h('button',{onClick:lap,disabled:!running,style:{width:56,height:56,borderRadius:'50%',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.6)',color:running?'#fff':'#475569',cursor:running?'pointer':'default',fontWeight:800,fontSize:'0.75rem',opacity:running?1:0.5}},'LAP')
    ),
    laps.length>0 && h('div',{className:'w-full mt-6 max-h-48 overflow-y-auto sidebar-scroll'},
      h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'},`${laps.length} Lap${laps.length>1?'s':''}`),
      [...laps].reverse().map(l=>h('div',{key:l.n,className:'flex justify-between items-center py-2',style:{borderBottom:'1px solid rgba(30,41,59,0.5)'}},
        h('span',{style:{color:'#94a3b8',fontSize:'0.875rem'}},`Lap ${l.n}`),
        h('span',{style:{color:'#fff',fontSize:'0.875rem',fontWeight:800,fontVariantNumeric:'tabular-nums'}},fmtTime(l.t)),
        h('span',{style:{color:'#64748b',fontSize:'0.75rem',fontVariantNumeric:'tabular-nums'}},fmtTime(l.total))
      ))
    )
  );
}

// ── COUNTDOWN ─────────────────────────────────────────────────────
function CountdownMode() {
  const [mins,setMins]=useState(5);
  const [secs,setSecs]=useState(0);
  const [remaining,setRemaining]=useState(300);
  const [total,setTotal]=useState(300);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const isSetup=!running&&remaining===total&&!done;
  const intRef=useRef(null);

  useEffect(()=>{
    if(running){
      intRef.current=setInterval(()=>setRemaining(r=>{
        if(r<=1){clearInterval(intRef.current);setRunning(false);setDone(true);return 0;}
        return r-1;
      }),1000);
    } else clearInterval(intRef.current);
    return()=>clearInterval(intRef.current);
  },[running]);

  const start=()=>{
    if(!running){const t=mins*60+secs;setTotal(t);setRemaining(t);setDone(false);}
    setRunning(r=>!r);
  };
  const reset=()=>{setRunning(false);setRemaining(total);setDone(false);};
  const pct=total>0?remaining/total:0;
  const isLow=remaining<=10&&running;
  const col=isLow?'#ef4444':done?'#f59e0b':'#10b981';

  return h('div',{className:'flex flex-col items-center px-5 pt-6'},
    done && h('div',{className:'w-full p-4 mb-4 rounded-2xl text-center',style:{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)'}},
      h(Icon,{n:'circleCheck',cls:'w-6 h-6',style:{color:'#f59e0b',marginBottom:4}}),
      h('div',{style:{fontWeight:800,color:'#f59e0b'}},"Time's up! Great work!"),
      h('button',{onClick:reset,className:'btn-primary mt-3 px-6 py-2 text-sm'},'Reset')
    ),
    h(Ring,{pct,color:col},
      h('div',{style:{fontSize:'2.5rem',fontWeight:900,color:isLow?'#ef4444':done?'#f59e0b':'#fff',fontVariantNumeric:'tabular-nums'}},fmtTime(remaining)),
      h('div',{style:{fontSize:'0.7rem',color:'#94a3b8',fontWeight:700}},'remaining')
    ),
    isSetup && h('div',{className:'mt-4 p-4 rounded-2xl w-full',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
      h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-3'},'Set Duration'),
      h('div',{className:'flex items-center justify-center gap-6'},
        h('div',{className:'text-center'},
          h('button',{onClick:()=>setMins(m=>Math.min(99,m+1)),style:{width:40,height:40,borderRadius:'0.75rem',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#fff',cursor:'pointer',fontWeight:800,fontSize:'1.25rem'}},'+'),
          h('div',{style:{fontSize:'2rem',fontWeight:900,color:'#fff',margin:'0.5rem 0',fontVariantNumeric:'tabular-nums'}},String(mins).padStart(2,'0')),
          h('button',{onClick:()=>setMins(m=>Math.max(0,m-1)),style:{width:40,height:40,borderRadius:'0.75rem',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#fff',cursor:'pointer',fontWeight:800,fontSize:'1.25rem'}},'-'),
          h('div',{style:{fontSize:'0.7rem',color:'#64748b',marginTop:'0.25rem'}},'min')
        ),
        h('div',{style:{fontSize:'2rem',fontWeight:900,color:'#475569'}},':'),
        h('div',{className:'text-center'},
          h('button',{onClick:()=>setSecs(s=>Math.min(59,s+5)),style:{width:40,height:40,borderRadius:'0.75rem',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#fff',cursor:'pointer',fontWeight:800,fontSize:'1.25rem'}},'+'),
          h('div',{style:{fontSize:'2rem',fontWeight:900,color:'#fff',margin:'0.5rem 0',fontVariantNumeric:'tabular-nums'}},String(secs).padStart(2,'0')),
          h('button',{onClick:()=>setSecs(s=>Math.max(0,s-5)),style:{width:40,height:40,borderRadius:'0.75rem',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#fff',cursor:'pointer',fontWeight:800,fontSize:'1.25rem'}},'-'),
          h('div',{style:{fontSize:'0.7rem',color:'#64748b',marginTop:'0.25rem'}},'sec')
        )
      )
    ),
    !done && h('div',{className:'flex gap-4 mt-6'},
      h('button',{onClick:reset,style:{width:56,height:56,borderRadius:'50%',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#94a3b8',cursor:'pointer',fontWeight:800,fontSize:'0.75rem'}},'RST'),
      h('button',{onClick:start,style:{width:80,height:80,borderRadius:'50%',background:running?'linear-gradient(135deg,#dc2626,#be123c)':'linear-gradient(135deg,#059669,#0d9488)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(5,150,105,0.35)'}},
        h(Icon,{n:running?'pause':'play',cls:'w-8 h-8 text-white'})
      ),
      h('div',{style:{width:56}})
    )
  );
}

// ── INTERVAL ─────────────────────────────────────────────────────
function IntervalMode() {
  const [workS,setWorkS]=useState(60);
  const [restS,setRestS]=useState(30);
  const [rounds,setRounds]=useState(5);
  const [running,setRunning]=useState(false);
  const [phase,setPhase]=useState('work');
  const [remaining,setRemaining]=useState(60);
  const [round,setRound]=useState(1);
  const [cfg,setCfg]=useState(true);
  const [done,setDone]=useState(false);
  const stRef=useRef({phase:'work',remaining:60,round:1});
  const intRef=useRef(null);

  const startIt=()=>{
    stRef.current={phase:'work',remaining:workS,round:1};
    setPhase('work');setRemaining(workS);setRound(1);setCfg(false);setRunning(true);
  };
  const reset=()=>{clearInterval(intRef.current);setRunning(false);setCfg(true);setDone(false);setPhase('work');setRound(1);};

  useEffect(()=>{
    if(!running) return;
    intRef.current=setInterval(()=>{
      const st=stRef.current;
      if(st.remaining<=1){
        if(st.phase==='work'){
          const n={phase:'rest',remaining:restS,round:st.round};stRef.current=n;setPhase('rest');setRemaining(restS);
        } else {
          if(st.round>=rounds){clearInterval(intRef.current);setRunning(false);setDone(true);}
          else{const n={phase:'work',remaining:workS,round:st.round+1};stRef.current=n;setPhase('work');setRemaining(workS);setRound(r=>r+1);}
        }
      } else {stRef.current.remaining--;setRemaining(r=>r-1);}
    },1000);
    return()=>clearInterval(intRef.current);
  },[running]);

  if(cfg) return h('div',{className:'px-5 pt-6 space-y-3'},
    h('p',{className:'text-sm text-slate-400 text-center mb-2'},'Configure your interval session'),
    [{label:'Work Time',val:workS,set:setWorkS,step:15,min:10,max:600,fmt:true},
     {label:'Rest Time',val:restS,set:setRestS,step:5,min:5,max:300,fmt:true},
     {label:'Rounds',val:rounds,set:setRounds,step:1,min:1,max:20,fmt:false}].map(cfg2=>
      h('div',{key:cfg2.label,className:'flex items-center justify-between p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('span',{className:'text-sm font-bold text-white'},cfg2.label),
        h('div',{className:'flex items-center gap-3'},
          h('button',{onClick:()=>cfg2.set(v=>Math.max(cfg2.min,v-cfg2.step)),style:{width:36,height:36,borderRadius:'0.75rem',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#fff',cursor:'pointer',fontWeight:800}},'−'),
          h('span',{style:{width:72,textAlign:'center',fontSize:'1.1rem',fontWeight:900,color:'#34d399',fontVariantNumeric:'tabular-nums'}},cfg2.fmt?fmtTime(cfg2.val):cfg2.val),
          h('button',{onClick:()=>cfg2.set(v=>Math.min(cfg2.max,v+cfg2.step)),style:{width:36,height:36,borderRadius:'0.75rem',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#fff',cursor:'pointer',fontWeight:800}},'+')
        )
      )
    ),
    h('div',{className:'p-4 rounded-2xl text-center',style:{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)'}},
      h('span',{style:{color:'#34d399',fontSize:'0.875rem',fontWeight:700}},`Total: ${fmtTime(rounds*(workS+restS))} · ${rounds} rounds`)
    ),
    h('button',{onClick:startIt,className:'btn-primary w-full py-4 text-base font-black'},'Start Interval Session')
  );

  const pct=phase==='work'?remaining/workS:remaining/restS;
  const col=phase==='work'?'#10b981':'#3b82f6';
  return h('div',{className:'flex flex-col items-center px-5 pt-6'},
    done
      ? h('div',{className:'text-center py-8'},
        h('div',{style:{width:56,height:56,borderRadius:14,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
          h(Icon,{n:'circleCheck',cls:'w-7 h-7',style:{color:'#16a34a'}})
        ),
        h('div',{className:'text-xl font-black text-white mb-4'},'Session Complete!'),
        h('button',{onClick:reset,className:'btn-primary px-8 py-3'},'Done')
      )
      : h(Fragment,null,
          h('div',{className:'w-full py-3 rounded-2xl mb-5 text-center font-black text-white text-sm',
            style:{background:phase==='work'?'linear-gradient(135deg,rgba(5,150,105,0.3),rgba(13,148,136,0.2))':'linear-gradient(135deg,rgba(29,78,216,0.3),rgba(67,56,202,0.2))',
              border:`1px solid ${phase==='work'?'rgba(16,185,129,0.4)':'rgba(59,130,246,0.4)'}`}},
            phase==='work'?`💪 WORK — Round ${round} of ${rounds}`:`😤 REST — Round ${round} of ${rounds}`
          ),
          h(Ring,{pct,color:col},
            h('div',{style:{fontSize:'2.5rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums'}},fmtTime(remaining)),
            h('div',{style:{fontSize:'0.7rem',fontWeight:800,textTransform:'uppercase',letterSpacing:'0.1em',color:col}},phase)
          ),
          h('div',{className:'flex gap-4 mt-6'},
            h('button',{onClick:reset,style:{width:56,height:56,borderRadius:'50%',background:'rgba(30,41,59,0.8)',border:'1px solid rgba(51,65,85,0.5)',color:'#94a3b8',cursor:'pointer',fontWeight:800,fontSize:'0.75rem'}},'RST'),
            h('button',{onClick:()=>setRunning(r=>!r),style:{width:80,height:80,borderRadius:'50%',background:running?'linear-gradient(135deg,#dc2626,#be123c)':'linear-gradient(135deg,#059669,#0d9488)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(5,150,105,0.35)'}},
              h(Icon,{n:running?'pause':'play',cls:'w-8 h-8 text-white'})
            ),
            h('div',{style:{width:56}})
          )
        )
  );
}

// ── CRICKET PRESETS ───────────────────────────────────────────────
function SimpleCountdownPreset({ preset, onBack }) {
  const [remaining,setRemaining]=useState(preset.work);
  const [running,setRunning]=useState(false);
  const [done,setDone]=useState(false);
  const intRef=useRef(null);
  useEffect(()=>{
    if(running) intRef.current=setInterval(()=>setRemaining(r=>{if(r<=1){clearInterval(intRef.current);setRunning(false);setDone(true);return 0;}return r-1;}),1000);
    else clearInterval(intRef.current);
    return()=>clearInterval(intRef.current);
  },[running]);
  const pct=remaining/preset.work;
  return h('div',{className:'flex flex-col items-center px-5 pt-4'},
    h('button',{onClick:onBack,className:'self-start flex items-center gap-2 text-slate-400 mb-4 text-sm font-semibold'},h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back'),
    h('div',{className:'w-full py-3 rounded-2xl mb-5 text-center font-black text-white text-sm',style:{background:preset.grad}},preset.name),
    done && h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:16,color:'#16a34a',fontWeight:700}},h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),'Complete!'),
    h(Ring,{pct,color:preset.col},
      h('div',{style:{fontSize:'2.5rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums'}},fmtTime(remaining)),
      h('div',{style:{fontSize:'0.7rem',color:'#94a3b8',fontWeight:700}},'remaining')
    ),
    !done && h('button',{onClick:()=>setRunning(r=>!r),className:'mt-6',style:{width:80,height:80,borderRadius:'50%',background:running?'linear-gradient(135deg,#dc2626,#be123c)':'linear-gradient(135deg,#059669,#0d9488)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(5,150,105,0.35)'}},
      h(Icon,{n:running?'pause':'play',cls:'w-8 h-8 text-white'})
    ),
    done && h('button',{onClick:onBack,className:'btn-primary mt-6 px-8 py-3'},'Back to Presets')
  );
}

function SimpleIntervalPreset({ preset, onBack }) {
  const [phase,setPhase]=useState('work');const[remaining,setRemaining]=useState(preset.work);const[round,setRound]=useState(1);
  const [running,setRunning]=useState(false);const[done,setDone]=useState(false);
  const st=useRef({phase:'work',remaining:preset.work,round:1});const intRef=useRef(null);
  useEffect(()=>{
    if(!running) return;
    intRef.current=setInterval(()=>{
      const s=st.current;
      if(s.remaining<=1){
        if(s.phase==='work'){const n={phase:'rest',remaining:preset.rest,round:s.round};st.current=n;setPhase('rest');setRemaining(preset.rest);}
        else{if(s.round>=preset.rounds){clearInterval(intRef.current);setRunning(false);setDone(true);}
          else{const n={phase:'work',remaining:preset.work,round:s.round+1};st.current=n;setPhase('work');setRemaining(preset.work);setRound(r=>r+1);}}
      }else{st.current.remaining--;setRemaining(r=>r-1);}
    },1000);
    return()=>clearInterval(intRef.current);
  },[running]);
  const pct=phase==='work'?remaining/preset.work:remaining/preset.rest;
  const col=phase==='work'?preset.col:'#3b82f6';
  return h('div',{className:'flex flex-col items-center px-5 pt-4'},
    h('button',{onClick:onBack,className:'self-start flex items-center gap-2 text-slate-400 mb-4 text-sm font-semibold'},h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back'),
    done
      ? h('div',{className:'text-center py-8'},h('div',{style:{width:56,height:56,borderRadius:14,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},h(Icon,{n:'circleCheck',cls:'w-7 h-7',style:{color:'#16a34a'}})),h('div',{className:'text-xl font-black text-white mb-4'},'Complete!'),h('button',{onClick:onBack,className:'btn-primary px-8 py-3'},'Done'))
      : h(Fragment,null,
          h('div',{className:'w-full py-3 rounded-2xl mb-5 text-center font-black text-white text-sm',style:{background:preset.grad}},`${preset.name} — Round ${round}/${preset.rounds}`),
          h(Ring,{pct,color:col},
            h('div',{style:{fontSize:'2.5rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums'}},fmtTime(remaining)),
            h('div',{style:{fontSize:'0.7rem',fontWeight:800,textTransform:'uppercase',color:col}},phase)
          ),
          h('button',{onClick:()=>setRunning(r=>!r),className:'mt-6',style:{width:80,height:80,borderRadius:'50%',background:running?'linear-gradient(135deg,#dc2626,#be123c)':'linear-gradient(135deg,#059669,#0d9488)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 8px 32px rgba(5,150,105,0.35)'}},
            h(Icon,{n:running?'pause':'play',cls:'w-8 h-8 text-white'})
          )
        )
  );
}

function CricketPresetsMode() {
  const [active,setActive]=useState(null);
  const presets=[
    {id:'bowl',icon:'ball',name:'Bowling Spell',desc:'4 min bowl / 2 min rest / 4 rounds',work:240,rest:120,rounds:4,col:'#dc2626',grad:'linear-gradient(135deg,#dc2626,#ea580c)'},
    {id:'bat',icon:'bat',name:'Batting Focus',desc:'10-minute countdown session',work:600,rest:0,rounds:1,col:'#3b82f6',grad:'linear-gradient(135deg,#1d4ed8,#4338ca)'},
    {id:'field',icon:'navigation',name:'Fielding Drills',desc:'45s intense / 15s rest / 8 rounds',work:45,rest:15,rounds:8,col:'#10b981',grad:'linear-gradient(135deg,#059669,#0d9488)'},
    {id:'mental',icon:'brain',name:'Mental Session',desc:'5-minute guided focus countdown',work:300,rest:0,rounds:1,col:'#a855f7',grad:'linear-gradient(135deg,#6d28d9,#4338ca)'},
    {id:'warmup',icon:'flame',name:'Cricket Warm-Up',desc:'90s drills / 30s rest / 6 rounds',work:90,rest:30,rounds:6,col:'#f97316',grad:'linear-gradient(135deg,#c2410c,#d97706)'},
    {id:'sprint',icon:'zap',name:'Speed Sprints',desc:'10s sprint / 50s rest / 10 rounds',work:10,rest:50,rounds:10,col:'#06b6d4',grad:'linear-gradient(135deg,#0891b2,#0d9488)'},
  ];

  if(active){
    const p=presets.find(x=>x.id===active);
    if(!p) return null;
    if(p.rounds===1) return h(SimpleCountdownPreset,{preset:p,onBack:()=>setActive(null)});
    return h(SimpleIntervalPreset,{preset:p,onBack:()=>setActive(null)});
  }

  return h('div',{className:'px-5 pt-4'},
    h('p',{className:'text-sm text-slate-400 mb-4'},'Cricket-specific training timers, ready to start:'),
    h('div',{className:'space-y-2.5'},
      presets.map(p=>h('button',{key:p.id,onClick:()=>setActive(p.id),
        className:'w-full flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[.99] transition-all',
        style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:p.grad}},
          h(Icon,{n:p.icon||'timer',cls:'w-5 h-5 text-white'})
        ),
        h('div',{className:'flex-1'},
          h('div',{className:'font-bold text-white text-sm'},p.name),
          h('div',{className:'text-xs mt-0.5',style:{color:'#64748b'}},p.desc)
        ),
        h(Icon,{n:'chevR',cls:'w-5 h-5',style:{color:'#475569'}})
      ))
    )
  );
}

// ================================================================
// TIMER PAGE
// ================================================================
function TimerPage() {
  const [mode,setMode]=useState('stopwatch');
  const MODES=[
    {id:'stopwatch',label:'Stopwatch',icon:'timer'},
    {id:'countdown',label:'Countdown',icon:'clock'},
    {id:'interval',label:'Interval',icon:'repeat'},
    {id:'cricket',label:'Cricket',icon:'bat'}
  ];
  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Training Timer',subtitle:'Professional-grade cricket timer',gradient:'linear-gradient(135deg,#0d9488,#0891b2)'}),
    h('div',{className:'flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide'},
      MODES.map(m=>h('button',{key:m.id,onClick:()=>setMode(m.id),
        className:'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all',
        style:mode===m.id?{background:'linear-gradient(135deg,#0d9488,#0891b2)',color:'#fff',boxShadow:'0 4px 14px rgba(13,148,136,0.4)'}
          :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'}
      },h(Icon,{n:m.icon,cls:'w-3.5 h-3.5',style:{color:mode===m.id?'#fff':'#484f58'}}), ' ', m.label))
    ),
    mode==='stopwatch' && h(StopwatchMode),
    mode==='countdown' && h(CountdownMode),
    mode==='interval' && h(IntervalMode),
    mode==='cricket' && h(CricketPresetsMode)
  );
}

Object.assign(window.SC_APP, { Ring, TimerPage, StopwatchMode, CountdownMode, IntervalMode, CricketPresetsMode });
console.log('[SC] app-timer ready');
})();
