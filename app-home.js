// ================================================================
// SmartCrick AI — Home Page
// app-home.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useCallback } = React;
const { DB, nav, getLevelInfo, awardXP } = window.SC_APP;
const { DRILLS, MENTAL_SESSIONS, WORKOUTS } = window.SC_APP;
const { Icon, XPBadge, StatCard, PageHeader, XPChart } = window.SC_APP;

function HomePage() {
  const [progress, setProgress] = useState(()=>DB.getProgress());
  const [xpDays, setXpDays] = useState(()=>DB.getXPLast7Days());
  const [checkedIn, setCheckedIn] = useState(()=>{
    const p=DB.getProgress();
    return p.last_checkin_date===new Date().toISOString().slice(0,10);
  });

  const refresh = useCallback(()=>{
    setProgress(DB.getProgress());
    setXpDays(DB.getXPLast7Days());
    setCheckedIn(DB.getProgress().last_checkin_date===new Date().toISOString().slice(0,10));
  },[]);

  useEffect(()=>{
    window.addEventListener('sc_update',refresh);
    window.addEventListener('focus',refresh);
    return ()=>{ window.removeEventListener('sc_update',refresh); window.removeEventListener('focus',refresh); };
  },[refresh]);

  const info = getLevelInfo(progress.total_xp||0);
  const user = DB.getUser();
  const name = user.name?(user.name.split(' ')[0]):'Cricketer';
  const hh = new Date().getHours();
  const greeting = hh<12?'Good morning':hh<17?'Good afternoon':'Good evening';
  const streak = progress.current_streak||0;

  const handleCheckIn = () => {
    if(checkedIn) return;
    const today=new Date().toISOString().slice(0,10);
    const currentProgress=DB.getProgress();
    if(currentProgress.last_checkin_date===today) { setCheckedIn(true); return; }
    awardXP(15,0,'checkin');
    setCheckedIn(true);
  };

  const done = progress.completed_drills||[];
  const doneMental = progress.completed_mental||[];
  const drillPick = DRILLS.find(d=>!done.includes(d.id)&&d.category==='batting')||DRILLS[0];
  const mentalPick = MENTAL_SESSIONS.find(m=>!doneMental.includes(m.id)&&!m.is_premium)||MENTAL_SESSIONS[0];
  const workoutPick = WORKOUTS.find(w=>w.level==='beginner')||WORKOUTS[0];

  const quickActions=[
    {icon:'bat',    label:'Drills',  pg:'Drills',  color:'#2563eb', bg:'rgba(37,99,235,0.12)', border:'rgba(37,99,235,0.25)'},
    {icon:'brain',  label:'Mental',  pg:'Mental',  color:'#7c3aed', bg:'rgba(124,58,237,0.12)',border:'rgba(124,58,237,0.25)'},
    {icon:'dumbbell',label:'Fitness',pg:'Fitness', color:'#ea580c', bg:'rgba(234,88,12,0.12)', border:'rgba(234,88,12,0.25)'},
    {icon:'timer',  label:'Timer',   pg:'Timer',   color:'#0d9488', bg:'rgba(13,148,136,0.12)',border:'rgba(13,148,136,0.25)'},
  ];

  const exploreTiles=[
    {icon:'layers',  label:'Skill Paths',  sub:'Structured programs', pg:'SkillPaths'},
    {icon:'calendar',label:'Schedule',     sub:'Plan your week',      pg:'Schedule'},
    {icon:'barChart',label:'Progress',     sub:'Stats & badges',      pg:'Progress'},
    {icon:'target',  label:'30-Day',       sub:'Daily challenge',     pg:'ThirtyDay'},
    {icon:'trophy',  label:'Leaderboard',  sub:'Your ranking',        pg:'Leaderboard'},
    {icon:'book',    label:'Quizzes',      sub:'Cricket knowledge',   pg:'Quizzes'},
  ];

  const Stat = ({val,label,color}) => h('div',{
    style:{textAlign:'center',padding:'10px 4px',borderRadius:8,
      background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
    h('div',{style:{fontSize:18,fontWeight:800,color:color,lineHeight:1,fontVariantNumeric:'tabular-nums'}},val),
    h('div',{style:{fontSize:10,fontWeight:600,color:'#484f58',marginTop:3,textTransform:'uppercase',letterSpacing:'0.06em'}},label)
  );

  return h('div',{style:{paddingBottom:'calc(5rem + env(safe-area-inset-bottom, 0px))',background:'#0d1117',minHeight:'100dvh'}},

    // ── Hero ──────────────────────────────────────────────────────
    h('div',{style:{
      background:'linear-gradient(160deg,#0a1628 0%,#0d1117 60%)',
      padding:'calc(3.75rem + max(0.75rem,env(safe-area-inset-top))) 20px 24px',
      borderBottom:'1px solid rgba(48,54,61,0.9)',position:'relative',overflow:'hidden'
    }},
      h('div',{style:{position:'absolute',top:'-60%',right:'-5%',width:280,height:280,
        background:'radial-gradient(circle,rgba(22,163,74,0.07),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}),

      // Greeting row
      h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}},
        h('div',{},
          h('p',{style:{fontSize:12,fontWeight:600,color:'#16a34a',marginBottom:4,letterSpacing:'0.04em',textTransform:'uppercase'}},greeting),
          h('h1',{style:{fontSize:28,fontWeight:800,color:'#e6edf3',margin:0,letterSpacing:'-0.02em',lineHeight:1.1}},name),
          h('p',{style:{fontSize:13,color:'#484f58',marginTop:6}},'Train. Measure. Improve.')
        ),
        streak>0 && h('div',{className:'streak-badge',style:{flexShrink:0}},
          h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}), streak, ' day streak'
        )
      ),

      // Level card
      h('div',{style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:16,marginBottom:16}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
          h('div',{style:{display:'flex',alignItems:'center',gap:10}},
            h('div',{style:{width:32,height:32,borderRadius:6,background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}},
              h(Icon,{n:'crown',cls:'w-4 h-4',style:{color:'#16a34a'}})
            ),
            h('div',{},
              h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},`Level ${info.level}`),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:1}},info.name)
            )
          ),
          h('div',{style:{textAlign:'right'}},
            h('div',{style:{fontSize:15,fontWeight:800,color:'#e6edf3',fontVariantNumeric:'tabular-nums'}},
              (progress.total_xp||0).toLocaleString(),' XP'),
            info.next && h('div',{style:{fontSize:11,color:'#484f58',marginTop:1}},
              `${info.xpToNext.toLocaleString()} to Level ${info.level+1}`)
          )
        ),
        h('div',{className:'level-bar-track'},
          h('div',{className:'level-bar-fill',style:{width:`${info.pct}%`}})
        )
      ),

      // 4-stat row
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}},
        h(Stat,{val:progress.drills_done||0,  label:'Drills',  color:'#3b82f6'}),
        h(Stat,{val:progress.mental_done||0,  label:'Mental',  color:'#8b5cf6'}),
        h(Stat,{val:progress.practice_minutes||0, label:'Mins',color:'#f97316'}),
        h(Stat,{val:(progress.total_xp||0).toLocaleString(), label:'XP', color:'#16a34a'}),
      ),

      // 7-day chart
      h('div',{style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:'14px 16px'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          h('div',{style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:'chartLine',cls:'w-3.5 h-3.5',style:{color:'#484f58'}}),
            h('span',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},'7-Day XP')
          ),
          h('span',{style:{fontSize:12,fontWeight:700,color:'#16a34a'}},
            `${xpDays.reduce((s,d)=>s+d.xp,0)} this week`)
        ),
        h(XPChart,{days:xpDays})
      )
    ),

    // ── Quick Train ───────────────────────────────────────────────
    h('div',{style:{padding:'20px 20px 0'}},
      h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em'}},'Quick Train'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}},
        quickActions.map(a=>
          h('button',{key:a.pg,onClick:()=>nav(a.pg),
            style:{display:'flex',flexDirection:'column',alignItems:'center',gap:8,
              padding:'14px 8px',borderRadius:10,border:`1px solid ${a.border}`,
              background:a.bg,cursor:'pointer',transition:'all 0.12s'}
          },
            h('div',{style:{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)'}},
              h(Icon,{n:a.icon,cls:'w-5 h-5',style:{color:a.color}})
            ),
            h('span',{style:{fontSize:11,fontWeight:600,color:'#8b949e'}},a.label)
          )
        )
      )
    ),

    // ── Daily Check-In ────────────────────────────────────────────
    h('div',{style:{padding:'16px 20px 0'}},
      h('button',{onClick:handleCheckIn,disabled:checkedIn,
        style:{width:'100%',display:'flex',alignItems:'center',gap:14,padding:14,
          borderRadius:10,border:checkedIn?'1px solid rgba(22,163,74,0.25)':'1px solid rgba(48,54,61,0.9)',
          background:checkedIn?'rgba(22,163,74,0.06)':'rgba(22,27,34,0.9)',
          cursor:checkedIn?'default':'pointer',textAlign:'left',transition:'all 0.12s'}
      },
        h('div',{style:{width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
          background:checkedIn?'rgba(22,163,74,0.15)':'rgba(48,54,61,0.6)'}},
          h(Icon,{n:checkedIn?'circleCheck':'zap',cls:'w-5 h-5',style:{color:checkedIn?'#16a34a':'#8b949e'}})
        ),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:13,fontWeight:700,color:checkedIn?'#4ade80':'#e6edf3'}},
            checkedIn?'Checked in today':'Daily Check-In'),
          h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},
            checkedIn?'15 XP earned. Come back tomorrow.':'Tap to claim 15 XP.')
        ),
        !checkedIn && h('span',{style:{fontSize:11,fontWeight:700,color:'#16a34a',
          background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.2)',
          padding:'4px 8px',borderRadius:6,flexShrink:0}},'+15 XP')
      )
    ),

    // ── Today's Focus ─────────────────────────────────────────────
    h('div',{id:'smart-start',style:{padding:'20px 20px 0'}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}},
        h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:0,textTransform:'uppercase',letterSpacing:'0.08em'}},"Today's Focus"),
        h('span',{style:{fontSize:11,color:'#484f58'}},'AI-selected')
      ),
      h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
        // Drill pick
        h('button',{onClick:()=>nav('DrillDetail',{id:drillPick.id}),
          style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
            border:'1px solid rgba(37,99,235,0.2)',background:'rgba(37,99,235,0.06)',cursor:'pointer',textAlign:'left',transition:'all 0.12s'}
        },
          h('div',{style:{width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(37,99,235,0.15)'}},
            h(Icon,{n:'bat',cls:'w-5 h-5',style:{color:'#3b82f6'}})
          ),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{fontSize:10,fontWeight:700,color:'#3b82f6',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}},'Cricket Drill'),
            h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},drillPick.title),
            h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},`${drillPick.duration_minutes} min · ${drillPick.xp_value} XP`)
          ),
          h(Icon,{n:'chevR',cls:'w-4 h-4 flex-shrink-0',style:{color:'#374151'}})
        ),
        // Mental pick
        h('button',{onClick:()=>nav('MentalPlayer',{id:mentalPick.id}),
          style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
            border:'1px solid rgba(124,58,237,0.2)',background:'rgba(124,58,237,0.06)',cursor:'pointer',textAlign:'left',transition:'all 0.12s'}
        },
          h('div',{style:{width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(124,58,237,0.15)'}},
            h(Icon,{n:'brain',cls:'w-5 h-5',style:{color:'#8b5cf6'}})
          ),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{fontSize:10,fontWeight:700,color:'#8b5cf6',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}},'Mental Session'),
            h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},mentalPick.title),
            h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},`${Math.floor(mentalPick.duration_seconds/60)} min · ${mentalPick.xp_value} XP`)
          ),
          h(Icon,{n:'chevR',cls:'w-4 h-4 flex-shrink-0',style:{color:'#374151'}})
        ),
        // Workout pick
        h('button',{onClick:()=>nav('WorkoutDetail',{id:workoutPick.id}),
          style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
            border:'1px solid rgba(234,88,12,0.2)',background:'rgba(234,88,12,0.06)',cursor:'pointer',textAlign:'left',transition:'all 0.12s'}
        },
          h('div',{style:{width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(234,88,12,0.15)'}},
            h(Icon,{n:'dumbbell',cls:'w-5 h-5',style:{color:'#f97316'}})
          ),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{fontSize:10,fontWeight:700,color:'#f97316',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}},'Fitness'),
            h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},workoutPick.name),
            h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},`${workoutPick.duration_minutes} min · ${workoutPick.xp_value} XP`)
          ),
          h(Icon,{n:'chevR',cls:'w-4 h-4 flex-shrink-0',style:{color:'#374151'}})
        )
      )
    ),

    // ── Explore ───────────────────────────────────────────────────
    h('div',{style:{padding:'20px 20px 0'}},
      h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em'}},'Explore'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}},
        exploreTiles.map(t=>
          h('button',{key:t.pg,onClick:()=>nav(t.pg),
            style:{display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
              border:'1px solid rgba(48,54,61,0.9)',background:'rgba(22,27,34,0.9)',cursor:'pointer',textAlign:'left',transition:'all 0.12s'}
          },
            h('div',{style:{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(48,54,61,0.6)'}},
              h(Icon,{n:t.icon,cls:'w-4 h-4',style:{color:'#8b949e'}})
            ),
            h('div',{style:{minWidth:0}},
              h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},t.label),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},t.sub)
            )
          )
        )
      )
    )
  );
}

window.SC_APP.HomePage = HomePage;
console.log('[SC] app-home ready');
})();
