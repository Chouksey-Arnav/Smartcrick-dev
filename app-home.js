// Save as: app-home.js
// ================================================================
// SmartCrick AI — Home Page v3.2
// RET-1: Today's Mission Widget
// RET-3: Weekly XP Goal
// RET-4: Training Momentum Bar
// RET-5: Level-Up Roadmap callout
// RET-6: First-Session-of-Day celebration toast
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useCallback, useRef } = React;
const A = window.SC_APP;
const { DB, nav, getLevelInfo, awardXP, generateTodaysMission } = A;
const { DRILLS, MENTAL_SESSIONS, WORKOUTS } = A;
const { Icon, XPBadge, StatCard, PageHeader, XPChart } = A;

// ── RET-6: First Session Toast ────────────────────────────────────
function FirstSessionToast({ visible, onDone }) {
  useEffect(function(){
    if(!visible) return;
    var t=setTimeout(function(){ onDone(); }, 2800);
    return function(){ clearTimeout(t); };
  }, [visible]);
  if(!visible) return null;
  return h('div', { style:{
    position:'fixed',
    top:'max(5rem, calc(4.5rem + env(safe-area-inset-top, 0px)))',
    left:'50%', transform:'translateX(-50%)',
    zIndex:9998,
    background:'linear-gradient(135deg,#16a34a,#0d9488)',
    color:'#fff', fontSize:14, fontWeight:700,
    padding:'12px 24px', borderRadius:10,
    boxShadow:'0 8px 32px rgba(22,163,74,0.45)',
    whiteSpace:'nowrap',
    animation:'toastIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
    pointerEvents:'none',
  }}, "LET'S GO! First session today! 🏏🔥");
}

// ── RET-1: Today's Mission Widget ────────────────────────────────
function TodaysMissionWidget({ progress }) {
  var mission = generateTodaysMission();
  var drillDone  = mission.drillId   ? (progress.completed_drills||[]).indexOf(mission.drillId)  !==-1 : false;
  var mentalDone = mission.mentalId  ? (progress.completed_mental||[]).indexOf(mission.mentalId) !==-1 : false;
  // Update mission DB if status changed
  useEffect(function(){
    var updated=false;
    var m=DB.getTodaysMission();
    if(!m) return;
    if(mission.drillId  && drillDone  && !m.drillDone)  { m.drillDone=true;  updated=true; }
    if(mission.mentalId && mentalDone && !m.mentalDone) { m.mentalDone=true; updated=true; }
    if(updated) DB.saveTodaysMission(m);
  }, [drillDone, mentalDone]);

  var drillObj  = mission.drillId   ? (DRILLS||[]).find(function(d){return d.id===mission.drillId;})  : null;
  var mentalObj = mission.mentalId  ? (MENTAL_SESSIONS||[]).find(function(m){return m.id===mission.mentalId;}) : null;
  var totalItems = (drillObj?1:0)+(mentalObj?1:0);
  var completedItems = (drillDone&&drillObj?1:0)+(mentalDone&&mentalObj?1:0);
  var allDone = totalItems>0 && completedItems===totalItems;
  var pct = totalItems>0 ? Math.round((completedItems/totalItems)*100) : 0;

  return h('div', { style:{ padding:'0 16px', marginBottom:16 }},
    h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }},
      h('h2', { style:{ fontSize:13, fontWeight:700, color:'#8b949e', margin:0, textTransform:'uppercase', letterSpacing:'0.08em' }},
        "Today's Mission"
      ),
      h('span', { style:{
        fontSize:11, fontWeight:700,
        color: allDone ? '#4ade80' : '#8b949e',
        background: allDone ? 'rgba(22,163,74,0.10)' : 'rgba(30,41,59,0.6)',
        border:'1px solid '+(allDone?'rgba(22,163,74,0.25)':'rgba(51,65,85,0.5)'),
        padding:'3px 8px', borderRadius:5,
      }}, completedItems+'/'+totalItems+' done')
    ),

    // Progress bar
    h('div', { style:{ height:5, background:'rgba(30,41,59,0.7)', borderRadius:99, overflow:'hidden', marginBottom:12 }},
      h('div', { style:{
        height:'100%', borderRadius:99,
        width:pct+'%',
        background: allDone ? 'linear-gradient(to right,#16a34a,#34d399)' : 'linear-gradient(to right,#3b82f6,#8b5cf6)',
        transition:'width 0.6s ease',
      }})
    ),

    // All done celebration
    allDone && h('div', { style:{
      padding:'12px 14px', borderRadius:10, marginBottom:10,
      background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.25)',
      display:'flex', alignItems:'center', gap:10,
    }},
      h('span', { style:{ fontSize:20 }}, '🔥'),
      h('p', { style:{ fontSize:12, fontWeight:700, color:'#4ade80', lineHeight:1.5 }},
        "Today's mission complete! You're building real cricket habits. ⭐"
      )
    ),

    // Mission items
    h('div', { style:{ display:'flex', flexDirection:'column', gap:8 }},
      // Drill item
      drillObj && h('button', { onClick:function(){ nav('DrillDetail', {id:drillObj.id}); },
        style:{
          display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10,
          border: drillDone ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(37,99,235,0.25)',
          background: drillDone ? 'rgba(22,163,74,0.06)' : 'rgba(37,99,235,0.06)',
          cursor:'pointer', textAlign:'left', fontFamily:'inherit', width:'100%',
          position:'relative', overflow:'hidden',
        }},
        h('div', { style:{
          width:38, height:38, borderRadius:8, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          background: drillDone ? 'rgba(22,163,74,0.15)' : 'rgba(37,99,235,0.15)',
        }},
          h(Icon, { n: drillDone?'circleCheck':'bat', cls:'w-5 h-5', style:{ color: drillDone?'#16a34a':'#3b82f6' }})
        ),
        h('div', { style:{ flex:1, minWidth:0 }},
          h('div', { style:{ fontSize:10, fontWeight:700, color: drillDone?'#16a34a':'#3b82f6', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }},
            drillDone ? '✓ Drill Completed' : 'Cricket Drill'
          ),
          h('div', { style:{ fontSize:13, fontWeight:700, color: drillDone?'#6b7280':'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            textDecoration: drillDone?'line-through':'none' }}, drillObj.title),
          h('div', { style:{ fontSize:11, color:'#484f58', marginTop:2 }}, drillObj.duration_minutes+' min · '+drillObj.xp_value+' XP')
        ),
        !drillDone && h(Icon, { n:'chevR', cls:'w-4 h-4 flex-shrink-0', style:{ color:'#374151' }})
      ),

      // Mental item
      mentalObj && h('button', { onClick:function(){ nav('MentalPlayer', {id:mentalObj.id}); },
        style:{
          display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10,
          border: mentalDone ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(124,58,237,0.25)',
          background: mentalDone ? 'rgba(22,163,74,0.06)' : 'rgba(124,58,237,0.06)',
          cursor:'pointer', textAlign:'left', fontFamily:'inherit', width:'100%',
          position:'relative', overflow:'hidden',
        }},
        h('div', { style:{
          width:38, height:38, borderRadius:8, flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          background: mentalDone ? 'rgba(22,163,74,0.15)' : 'rgba(124,58,237,0.15)',
        }},
          h(Icon, { n: mentalDone?'circleCheck':'brain', cls:'w-5 h-5', style:{ color: mentalDone?'#16a34a':'#8b5cf6' }})
        ),
        h('div', { style:{ flex:1, minWidth:0 }},
          h('div', { style:{ fontSize:10, fontWeight:700, color: mentalDone?'#16a34a':'#8b5cf6', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:2 }},
            mentalDone ? '✓ Session Completed' : 'Mental Session'
          ),
          h('div', { style:{ fontSize:13, fontWeight:700, color: mentalDone?'#6b7280':'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            textDecoration: mentalDone?'line-through':'none' }}, mentalObj.title),
          h('div', { style:{ fontSize:11, color:'#484f58', marginTop:2 }}, Math.floor(mentalObj.duration_seconds/60)+' min · '+mentalObj.xp_value+' XP')
        ),
        !mentalDone && h(Icon, { n:'chevR', cls:'w-4 h-4 flex-shrink-0', style:{ color:'#374151' }})
      )
    )
  );
}

// ── RET-3: Weekly XP Goal Widget ─────────────────────────────────
function WeeklyXPGoalWidget({ weekXP }) {
  var [goal, setGoal] = useState(function(){ return DB.getWeeklyXPGoal(); });
  var pct = Math.min(100, Math.round((weekXP/goal)*100));
  var goalReached = weekXP>=goal;
  var barColor = goalReached ? '#16a34a' : pct>=60 ? '#f59e0b' : '#3b82f6';

  function setNewGoal(n) {
    DB.setWeeklyXPGoal(n);
    setGoal(n);
  }

  return h('div', { style:{ padding:'0 16px', marginBottom:16 }},
    h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }},
      h('span', { style:{ fontSize:13, fontWeight:700, color:'#8b949e', textTransform:'uppercase', letterSpacing:'0.08em' }},
        'Weekly XP Goal'
      ),
      h('div', { style:{ display:'flex', gap:4 }},
        [100,200,500].map(function(g){
          return h('button', { key:g, onClick:function(){ setNewGoal(g); },
            style:{
              padding:'3px 8px', borderRadius:5, fontSize:10, fontWeight:700,
              fontFamily:'inherit', cursor:'pointer',
              background: goal===g ? 'rgba(22,163,74,0.15)' : 'rgba(30,41,59,0.6)',
              border:'1px solid '+(goal===g?'rgba(22,163,74,0.4)':'rgba(51,65,85,0.5)'),
              color: goal===g ? '#4ade80' : '#6b7280',
            }
          }, g+' XP');
        })
      )
    ),
    h('div', { style:{
      padding:'12px 14px', borderRadius:10,
      background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)',
    }},
      h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }},
        h('span', { style:{ fontSize:12, fontWeight:700, color: goalReached?'#4ade80':'#e6edf3' }},
          goalReached ? '🎯 Goal Reached! Amazing week!' : weekXP+' / '+goal+' XP'
        ),
        h('span', { style:{ fontSize:12, fontWeight:800, color:barColor }}, pct+'%')
      ),
      h('div', { style:{ height:6, background:'rgba(30,41,59,0.8)', borderRadius:99, overflow:'hidden' }},
        h('div', { style:{
          height:'100%', borderRadius:99, width:pct+'%',
          background:'linear-gradient(to right,'+barColor+','+barColor+'aa)',
          transition:'width 0.6s ease',
        }})
      )
    )
  );
}

// ── RET-4: Training Momentum Bar ──────────────────────────────────
function TrainingMomentumBar() {
  var xpLog = DB.getXPLog();
  var last10 = [];
  for(var i=9;i>=0;i--){
    var d=new Date(); d.setDate(d.getDate()-i);
    last10.push(d.toISOString().slice(0,10));
  }
  var activeDays = last10.filter(function(date){
    return xpLog.some(function(e){ return e.date===date&&e.xp>0; });
  }).length;
  var pct=Math.round((activeDays/10)*100);
  var barColor=activeDays>=8?'#16a34a':activeDays>=5?'#f59e0b':'#3b82f6';

  return h('div', { style:{
    display:'flex', alignItems:'center', gap:12, padding:'10px 14px',
    borderRadius:10, marginBottom:0,
    background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)',
  }},
    h(Icon, { n:'flame', cls:'w-4 h-4 flex-shrink-0', style:{ color:barColor }}),
    h('div', { style:{ flex:1 }},
      h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }},
        h('span', { style:{ fontSize:11, fontWeight:700, color:'#8b949e' }}, 'Training Momentum'),
        h('span', { style:{ fontSize:11, fontWeight:800, color:barColor }}, activeDays+' of last 10 days')
      ),
      h('div', { style:{ height:5, background:'rgba(30,41,59,0.8)', borderRadius:99, overflow:'hidden' }},
        h('div', { style:{
          height:'100%', borderRadius:99, width:pct+'%',
          background:barColor, transition:'width 0.6s ease',
        }})
      )
    )
  );
}

// ── RET-5: Level-Up Roadmap ───────────────────────────────────────
function LevelUpRoadmap({ info }) {
  if(!info.next) return null;
  var sessionsAway = Math.max(1, Math.ceil(info.xpToNext/100));
  return h('div', { style:{
    display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10,
    background:'rgba(22,27,34,0.9)', border:'1px solid rgba(48,54,61,0.9)',
  }},
    h(Icon, { n:'zap', cls:'w-4 h-4 flex-shrink-0', style:{ color:'#f59e0b' }}),
    h('p', { style:{ fontSize:12, color:'#8b949e', lineHeight:1.5 }},
      h('span', { style:{ fontWeight:700, color:'#f59e0b' }}, info.xpToNext.toLocaleString()+' XP'),
      ' to ',
      h('span', { style:{ fontWeight:700, color:'#f0fdf4' }}, 'Level '+(info.level+1)),
      ' — about ',
      h('span', { style:{ fontWeight:700, color:'#f0fdf4' }}, sessionsAway+' sessions'),
      ' away'
    )
  );
}

// ── HomePage ──────────────────────────────────────────────────────
function HomePage() {
  var [progress, setProgress] = useState(function(){ return DB.getProgress(); });
  var [xpDays, setXpDays]    = useState(function(){ return DB.getXPLast7Days(); });
  var [checkedIn, setCheckedIn] = useState(function(){
    var p=DB.getProgress();
    return p.last_checkin_date===new Date().toISOString().slice(0,10);
  });
  var [showToast, setShowToast] = useState(false);

  var refresh = useCallback(function(){
    setProgress(DB.getProgress());
    setXpDays(DB.getXPLast7Days());
    setCheckedIn(DB.getProgress().last_checkin_date===new Date().toISOString().slice(0,10));
  },[]);

  useEffect(function(){
    window.addEventListener('sc_update', refresh);
    window.addEventListener('focus', refresh);
    // RET-6: first session event
    var handleFirst=function(){ setShowToast(true); };
    window.addEventListener('sc_first_session', handleFirst);
    return function(){
      window.removeEventListener('sc_update', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('sc_first_session', handleFirst);
    };
  },[refresh]);

  var info = getLevelInfo(progress.total_xp||0);
  var user = DB.getUser();
  var name = user.name ? user.name.split(' ')[0] : 'Cricketer';
  var hh = new Date().getHours();
  var greeting = hh<12?'Good morning':hh<17?'Good afternoon':'Good evening';
  var streak = progress.current_streak||0;
  var weekXP = xpDays.reduce(function(s,d){ return s+d.xp; },0);

  var handleCheckIn = function() {
    if(checkedIn) return;
    var today=new Date().toISOString().slice(0,10);
    var cp=DB.getProgress();
    if(cp.last_checkin_date===today){ setCheckedIn(true); return; }
    awardXP(15,0,'checkin');
    setCheckedIn(true);
  };

  var quickActions = [
    {icon:'bat',    label:'Drills',  pg:'Drills',  color:'#2563eb', bg:'rgba(37,99,235,0.12)', border:'rgba(37,99,235,0.25)'},
    {icon:'brain',  label:'Mental',  pg:'Mental',  color:'#7c3aed', bg:'rgba(124,58,237,0.12)',border:'rgba(124,58,237,0.25)'},
    {icon:'dumbbell',label:'Fitness',pg:'Fitness', color:'#ea580c', bg:'rgba(234,88,12,0.12)', border:'rgba(234,88,12,0.25)'},
    {icon:'timer',  label:'Timer',   pg:'Timer',   color:'#0d9488', bg:'rgba(13,148,136,0.12)',border:'rgba(13,148,136,0.25)'},
  ];

  var exploreTiles = [
    {icon:'layers',  label:'Skill Paths',  sub:'Structured programs', pg:'SkillPaths'},
    {icon:'calendar',label:'Schedule',     sub:'Plan your week',      pg:'Schedule'},
    {icon:'barChart',label:'Progress',     sub:'Stats & badges',      pg:'Progress'},
    {icon:'target',  label:'30-Day',       sub:'Daily challenge',     pg:'ThirtyDay'},
    {icon:'trophy',  label:'Leaderboard',  sub:'Your ranking',        pg:'Leaderboard'},
    {icon:'book',    label:'Quizzes',      sub:'Cricket knowledge',   pg:'Quizzes'},
  ];

  function Stat(p) {
    return h('div',{
      style:{textAlign:'center',padding:'10px 4px',borderRadius:8,
        background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
      h('div',{style:{fontSize:18,fontWeight:800,color:p.color,lineHeight:1,fontVariantNumeric:'tabular-nums'}},p.val),
      h('div',{style:{fontSize:10,fontWeight:600,color:'#484f58',marginTop:3,textTransform:'uppercase',letterSpacing:'0.06em'}},p.label)
    );
  }

  return h('div',{style:{paddingBottom:'calc(5rem + env(safe-area-inset-bottom, 0px))',background:'#0d1117',minHeight:'100dvh'}},

    // RET-6 Toast
    h(FirstSessionToast, { visible:showToast, onDone:function(){ setShowToast(false); }}),

    // ── Hero ────────────────────────────────────────────────────
    h('div',{style:{
      background:'linear-gradient(160deg,#0a1628 0%,#0d1117 60%)',
      padding:'calc(3.75rem + max(0.75rem,env(safe-area-inset-top))) 20px 24px',
      borderBottom:'1px solid rgba(48,54,61,0.9)', position:'relative', overflow:'hidden',
    }},
      h('div',{style:{position:'absolute',top:'-60%',right:'-5%',width:280,height:280,
        background:'radial-gradient(circle,rgba(22,163,74,0.07),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}),

      // Greeting
      h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}},
        h('div',null,
          h('p',{style:{fontSize:12,fontWeight:600,color:'#16a34a',marginBottom:4,letterSpacing:'0.04em',textTransform:'uppercase'}},greeting),
          h('h1',{style:{fontSize:28,fontWeight:800,color:'#e6edf3',margin:0,letterSpacing:'-0.02em',lineHeight:1.1}},name),
          h('p',{style:{fontSize:13,color:'#484f58',marginTop:6}},'Train. Measure. Improve.')
        ),
        streak>0&&h('div',{className:'streak-badge',style:{flexShrink:0}},
          h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}), streak, ' day streak'
        )
      ),

      // Level card
      h('div',{style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:16,marginBottom:8}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
          h('div',{style:{display:'flex',alignItems:'center',gap:10}},
            h('div',{style:{width:32,height:32,borderRadius:6,background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}},
              h(Icon,{n:'crown',cls:'w-4 h-4',style:{color:'#16a34a'}})
            ),
            h('div',null,
              h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},'Level '+info.level),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:1}},info.name)
            )
          ),
          h('div',{style:{textAlign:'right'}},
            h('div',{style:{fontSize:15,fontWeight:800,color:'#e6edf3',fontVariantNumeric:'tabular-nums'}},(progress.total_xp||0).toLocaleString()+' XP'),
            info.next&&h('div',{style:{fontSize:11,color:'#484f58',marginTop:1}},info.xpToNext.toLocaleString()+' to Level '+(info.level+1))
          )
        ),
        h('div',{className:'level-bar-track'},
          h('div',{className:'level-bar-fill',style:{width:info.pct+'%'}})
        )
      ),

      // RET-5: Level-up roadmap (below level card)
      h('div',{style:{marginBottom:8}},
        h(LevelUpRoadmap, { info:info })
      ),

      // 4-stat row
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}},
        h(Stat,{val:progress.drills_done||0,  label:'Drills',  color:'#3b82f6'}),
        h(Stat,{val:progress.mental_done||0,  label:'Mental',  color:'#8b5cf6'}),
        h(Stat,{val:progress.practice_minutes||0, label:'Mins',color:'#f97316'}),
        h(Stat,{val:(progress.total_xp||0).toLocaleString(), label:'XP', color:'#16a34a'}),
      ),

      // RET-4: Momentum bar (inside hero, below stats)
      h(TrainingMomentumBar),

      // 7-day XP chart (below momentum)
      h('div',{style:{marginTop:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:'14px 16px'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          h('div',{style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:'chartLine',cls:'w-3.5 h-3.5',style:{color:'#484f58'}}),
            h('span',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},'7-Day XP')
          ),
          h('span',{style:{fontSize:12,fontWeight:700,color:'#16a34a'}},weekXP+' this week')
        ),
        h(XPChart,{days:xpDays})
      )
    ),

    // ── Quick Train ────────────────────────────────────────────
    h('div',{style:{padding:'20px 16px 0'}},
      h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em'}},'Quick Train'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}},
        quickActions.map(function(a){
          return h('button',{key:a.pg,onClick:function(){nav(a.pg);},
            style:{display:'flex',flexDirection:'column',alignItems:'center',gap:8,
              padding:'14px 8px',borderRadius:10,border:'1px solid '+a.border,
              background:a.bg,cursor:'pointer',transition:'all 0.12s'}},
            h('div',{style:{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)'}},
              h(Icon,{n:a.icon,cls:'w-5 h-5',style:{color:a.color}})
            ),
            h('span',{style:{fontSize:11,fontWeight:600,color:'#8b949e'}},a.label)
          );
        })
      )
    ),

    // ── RET-1: Today's Mission ─────────────────────────────────
    h('div',{style:{paddingTop:20}},
      h(TodaysMissionWidget, { progress:progress })
    ),

    // ── RET-3: Weekly XP Goal ──────────────────────────────────
    h('div',{style:{paddingTop:4}},
      h(WeeklyXPGoalWidget, { weekXP:weekXP })
    ),

    // ── Daily Check-In ────────────────────────────────────────
    h('div',{style:{padding:'16px 16px 0'}},
      h('button',{onClick:handleCheckIn,disabled:checkedIn,
        style:{width:'100%',display:'flex',alignItems:'center',gap:14,padding:14,
          borderRadius:10,border:checkedIn?'1px solid rgba(22,163,74,0.25)':'1px solid rgba(48,54,61,0.9)',
          background:checkedIn?'rgba(22,163,74,0.06)':'rgba(22,27,34,0.9)',
          cursor:checkedIn?'default':'pointer',textAlign:'left',transition:'all 0.12s'}},
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
        !checkedIn&&h('span',{style:{fontSize:11,fontWeight:700,color:'#16a34a',
          background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.2)',
          padding:'4px 8px',borderRadius:6,flexShrink:0}},'+15 XP')
      )
    ),

    // ── Explore ────────────────────────────────────────────────
    h('div',{style:{padding:'20px 16px 0'}},
      h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em'}},'Explore'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}},
        exploreTiles.map(function(t){
          return h('button',{key:t.pg,onClick:function(){nav(t.pg);},
            style:{display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
              border:'1px solid rgba(48,54,61,0.9)',background:'rgba(22,27,34,0.9)',cursor:'pointer',textAlign:'left',transition:'all 0.12s'}},
            h('div',{style:{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(48,54,61,0.6)'}},
              h(Icon,{n:t.icon,cls:'w-4 h-4',style:{color:'#8b949e'}})
            ),
            h('div',{style:{minWidth:0}},
              h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},t.label),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},t.sub)
            )
          );
        })
      )
    )
  );
}

window.SC_APP.HomePage = HomePage;
console.log('[SC] app-home v3.2 — RET-1 through RET-6 ready');
})();
