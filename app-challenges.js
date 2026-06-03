// Save as: app-challenges.js
// ================================================================
// SmartCrick AI — 30-Day Challenge v2.0 — Full Overhaul
// C-1: Visual Day Map (4 week rows, 7 cells each, animated)
// C-2: Week Theme Headers
// C-3: Per-Day Specific Tasks from DAY30_TASKS
// C-4: Milestone Celebrations (Days 7, 14, 21, 28, 30)
// C-5: Tomorrow Preview
// C-6: Rest Days (Days 7, 14, 21)
// C-7: Catch-Up Shield
// C-8: Weekly Summary card
// C-9: Social Proof lines
// C-10: Difficulty escalation (W3 reflection prompts, W4 full sessions)
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { DB, awardXP, fireConfetti, nav } = A;
const { DAY30_TASKS, WEEK_THEMES, SOCIAL_PROOF, DRILLS, MENTAL_SESSIONS } = A;
const { Icon, XPBadge, PageHeader } = A;

// ── Milestone messages ────────────────────────────────────────────
const MILESTONE_MESSAGES = {
  7:  { emoji:'🌱', title:'Week 1 Complete!',   badge:'FOUNDATION BUILT',       quote:'You showed up every single day when it mattered. That\'s exactly what champions do.' },
  14: { emoji:'⚡', title:'Week 2 Complete!',   badge:'GAME IS GROWING',        quote:'Two weeks in. Most players quit around here. You didn\'t. That says everything.' },
  21: { emoji:'🔥', title:'Week 3 Complete!',   badge:'FORGED UNDER PRESSURE',  quote:'You trained your mind while others rested. Feel the difference. That\'s real.' },
  28: { emoji:'💎', title:'Final Week Starts!', badge:'ELITE TERRITORY',        quote:'Only the committed reach here. Your final push starts now. Finish what you started.' },
  30: { emoji:'🏆', title:'30-DAY CHAMPION!',   badge:'CHALLENGE COMPLETE',     quote:'30 days. Unbroken. You are the elite cricketer you set out to become. This is real.' },
};

// ── Week summary XP calculation ───────────────────────────────────
function getWeekSummary(weekNum, completed) {
  if (!DAY30_TASKS) return { drills:0, mental:0, xp:0 };
  var weekTasks = DAY30_TASKS.filter(function(t){ return t.week===weekNum; });
  var drills=0, mental=0, xp=0;
  weekTasks.forEach(function(t){
    if(!completed[t.day]) return;
    xp+=t.xp;
    if(t.type==='drill'||t.type==='both') drills++;
    if(t.type==='mental'||t.type==='both'||t.type==='rest') mental++;
  });
  return { drills:drills, mental:mental, xp:xp };
}

// ── Social proof check ─────────────────────────────────────────────
function getSocialProofForDay(doneCount) {
  if(!SOCIAL_PROOF) return null;
  var keys = Object.keys(SOCIAL_PROOF).map(Number).filter(function(k){ return k===doneCount+1; });
  if(!keys.length) return null;
  return SOCIAL_PROOF[keys[0]];
}

// ── MilestoneOverlay ──────────────────────────────────────────────
function MilestoneOverlay({ dayNum, onClose }) {
  var msg = MILESTONE_MESSAGES[dayNum] || MILESTONE_MESSAGES[30];
  return h('div', { style:{
    position:'fixed',inset:0,zIndex:70,background:'rgba(0,0,0,0.90)',
    display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    padding:'2rem',textAlign:'center',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',
    animation:'fadeIn 0.3s ease',
  }},
    h('div', { style:{ fontSize:72, lineHeight:1, marginBottom:20, animation:'bounceIn 0.6s cubic-bezier(0.16,1,0.3,1)' }}, msg.emoji),
    h('div', { style:{ fontSize:11, fontWeight:800, letterSpacing:'0.18em', textTransform:'uppercase',
      color:'#f59e0b', marginBottom:12, padding:'4px 14px', borderRadius:6,
      background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)' }}, msg.badge),
    h('h2', { style:{ fontSize:'1.875rem', fontWeight:900, color:'#fff', marginBottom:12, letterSpacing:'-0.02em', lineHeight:1.2 }}, msg.title),
    h('p', { style:{ fontSize:14, color:'rgba(255,255,255,0.65)', maxWidth:300, lineHeight:1.75, marginBottom:28 }}, msg.quote),
    h('div', { style:{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', marginBottom:28 }},
      h(XPBadge, { xp: (MILESTONE_MESSAGES[dayNum]||{}).xp || 50 })
    ),
    h('button', { onClick:onClose,
      style:{ padding:'14px 40px', background:'#16a34a', color:'#fff', border:'none', borderRadius:10,
        fontWeight:700, fontSize:15, cursor:'pointer', fontFamily:'inherit',
        boxShadow:'0 8px 32px rgba(22,163,74,0.4)' }},
      dayNum===30 ? '🎉 I AM A CHAMPION!' : 'Keep Going →'
    )
  );
}

// ── WeeklySummaryOverlay ──────────────────────────────────────────
function WeeklySummaryOverlay({ weekNum, completed, onClose }) {
  var wt = (WEEK_THEMES||[])[weekNum-1] || { theme:'Week '+weekNum, color:'#16a34a' };
  var summary = getWeekSummary(weekNum, completed);
  return h('div', { style:{
    position:'fixed',inset:0,zIndex:60,background:'rgba(0,0,0,0.80)',
    display:'flex',alignItems:'center',justifyContent:'center',
    padding:'1.5rem',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)',
  }},
    h('div', { style:{
      width:'100%',maxWidth:380,background:'#161b22',borderRadius:20,
      border:'1px solid rgba(48,54,61,0.9)',padding:'28px 24px',textAlign:'center',
    }},
      h('div', { style:{ fontSize:11, fontWeight:800, letterSpacing:'0.16em', textTransform:'uppercase',
        color:wt.color, marginBottom:8 }}, 'Week '+weekNum+' — '+wt.theme),
      h('h3', { style:{ fontSize:'1.375rem', fontWeight:900, color:'#fff', marginBottom:20 }}, 'Week Complete!'),
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }},
        h('div', { style:{ padding:'14px 8px', borderRadius:10, background:wt.bg||'rgba(22,27,34,0.9)', border:'1px solid '+(wt.border||'rgba(48,54,61,0.9)') }},
          h('div', { style:{ fontSize:24, fontWeight:900, color:'#f0fdf4' }}, summary.drills),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}, 'Drills')
        ),
        h('div', { style:{ padding:'14px 8px', borderRadius:10, background:wt.bg||'rgba(22,27,34,0.9)', border:'1px solid '+(wt.border||'rgba(48,54,61,0.9)') }},
          h('div', { style:{ fontSize:24, fontWeight:900, color:'#f0fdf4' }}, summary.mental),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}, 'Mental')
        ),
        h('div', { style:{ padding:'14px 8px', borderRadius:10, background:wt.bg||'rgba(22,27,34,0.9)', border:'1px solid '+(wt.border||'rgba(48,54,61,0.9)') }},
          h('div', { style:{ fontSize:24, fontWeight:900, color:wt.color }}, summary.xp),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:4 }}, 'XP')
        )
      ),
      h('p', { style:{ fontSize:13, color:'#6b7280', lineHeight:1.6, marginBottom:20 }},
        weekNum===1 ? 'Foundation laid. The habits you started this week will carry you through everything.' :
        weekNum===2 ? 'Your game is growing. Two disciplines working together — that\'s how champions train.' :
        weekNum===3 ? 'You forged mental steel this week. Pressure is your fuel now.' :
        'Elite territory reached. One final week to cement your legacy.'
      ),
      h('button', { onClick:onClose,
        style:{ width:'100%', padding:'13px', background:wt.color, color:'#fff', border:'none',
          borderRadius:10, fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }},
        'Continue the Journey →'
      )
    )
  );
}

// ── DayCell ───────────────────────────────────────────────────────
function DayCell({ task, isDone, isAvailable, onPress }) {
  var isRest = task.type === 'rest';
  var isMilestone = task.isMilestone;
  // Determine if this is a missed day (past available but not done) — approximated by day < nextAvailable and not done
  var isMissed = !isDone && !isAvailable && task.day < 30; // will be styled as future; actual missed logic handled below
  return h('button', {
    onClick: onPress,
    disabled: isDone,
    title: 'Day '+task.day+': '+task.title,
    style:{
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      minWidth:38, minHeight:38, borderRadius:10, cursor: isDone ? 'default' : 'pointer',
      fontFamily:'inherit', padding:2,
      background: isDone
        ? (isRest ? 'rgba(59,130,246,0.25)' : 'rgba(34,197,94,0.2)')
        : isAvailable
          ? 'transparent'
          : 'rgba(255,255,255,0.03)',
      border: isDone
        ? ('1px solid '+(isRest?'rgba(59,130,246,0.5)':'rgba(34,197,94,0.4)'))
        : isAvailable
          ? '2px solid #22c55e'
          : '1px solid rgba(255,255,255,0.06)',
      boxShadow: isDone && !isRest
        ? '0 0 8px rgba(34,197,94,0.2)'
        : isAvailable
          ? '0 0 12px rgba(34,197,94,0.3)'
          : 'none',
      animation: isAvailable ? 'dayCellPulse 2s ease-in-out infinite' : 'none',
      color: isDone
        ? (isRest ? '#60a5fa' : '#4ade80')
        : isAvailable
          ? '#22c55e'
          : '#334155',
      opacity: 1,
      transition: 'all 0.2s',
      position: 'relative',
      fontWeight: isDone ? 700 : isAvailable ? 800 : 400,
    }
  },
    isDone
      ? h('span', { style:{ fontSize:14, lineHeight:1 }}, isRest ? '😴' : (isMilestone ? '🏅' : '✓'))
      : isRest
        ? h('span', { style:{ fontSize:14, lineHeight:1 }}, '😴')
        : h('span', { style:{ fontSize:11, fontWeight: isAvailable ? 800 : 400, color: 'inherit', lineHeight:1 }}, task.day)
  );
}

// ── AvailableDayCard ──────────────────────────────────────────────
function AvailableDayCard({ task, onComplete }) {
  var [reflectionText, setReflectionText] = useState('');
  var [saving, setSaving] = useState(false);
  var drill   = task.drillId   ? (DRILLS||[]).find(function(d){return d.id===task.drillId;})   : null;
  var session = task.mentalId  ? (MENTAL_SESSIONS||[]).find(function(m){return m.id===task.mentalId;}) : null;
  var needsReflection = !!task.reflectionPrompt;
  var canComplete = !needsReflection || reflectionText.trim().length>0;
  var wt = (WEEK_THEMES||[]).find(function(t){return t.week===task.week;}) || { color:'#16a34a' };

  var typeBadgeColor = task.type==='rest' ? '#3b82f6' : task.type==='mental' ? '#a855f7' : '#16a34a';
  var typeBadgeLabel = task.type==='rest' ? '😴 REST DAY' : task.type==='mental' ? '🧠 MENTAL' : task.type==='drill' ? '🏏 DRILL' : '🏏🧠 DRILL + MENTAL';

  return h('div', { style:{
    borderRadius:16, overflow:'hidden',
    background:'rgba(16,22,36,0.95)',
    border:'1px solid rgba(255,255,255,0.10)',
    borderLeft:'4px solid #22c55e',
    marginTop:10,
    boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
  }},
    h('div', { style:{ padding:'20px' }},
      // Day label + type badge
      h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }},
        h('span', { style:{ fontSize:11, fontWeight:700, color:'#22c55e', textTransform:'uppercase', letterSpacing:'0.08em' }}, 'Day '+task.day+' — '+task.theme),
        h('span', { style:{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:5,
          background:'rgba(0,0,0,0.3)', color:typeBadgeColor, border:'1px solid '+typeBadgeColor+'40' }}, typeBadgeLabel)
      ),

      // Title
      h('h3', { style:{ fontSize:18, fontWeight:800, color:'#f8fafc', marginBottom:8, lineHeight:1.3 }}, task.title),
      h('p', { style:{ fontSize:14, color:'#94a3b8', lineHeight:1.6, marginBottom:14 }}, task.desc),

      // XP
      h('div', { style:{ marginBottom:14 }}, h(XPBadge, { xp:task.xp })),

      // Drill button
      drill && h('button', { onClick:function(){ nav('DrillDetail', {id:drill.id}); },
        style:{
          display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px',
          borderRadius:10, background:'rgba(59,130,246,0.10)', border:'1px solid rgba(59,130,246,0.3)',
          cursor:'pointer', fontFamily:'inherit', textAlign:'left', marginBottom:8,
        }},
        h('div', { style:{ width:34, height:34, borderRadius:7, background:'rgba(59,130,246,0.18)', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center' }},
          h(Icon, { n:'bat', cls:'w-4 h-4', style:{ color:'#60a5fa' }})
        ),
        h('div', { style:{ flex:1, minWidth:0 }},
          h('div', { style:{ fontSize:11, fontWeight:700, color:'#60a5fa', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}, 'Cricket Drill'),
          h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}, drill.title)
        ),
        h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#3b82f6', flexShrink:0 }})
      ),

      // Mental session button
      session && h('button', { onClick:function(){ nav('MentalPlayer', {id:session.id}); },
        style:{
          display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px',
          borderRadius:10, background:'rgba(168,85,247,0.10)', border:'1px solid rgba(168,85,247,0.3)',
          cursor:'pointer', fontFamily:'inherit', textAlign:'left', marginBottom:14,
        }},
        h('div', { style:{ width:34, height:34, borderRadius:7, background:'rgba(168,85,247,0.18)', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center' }},
          h(Icon, { n:'brain', cls:'w-4 h-4', style:{ color:'#c084fc' }})
        ),
        h('div', { style:{ flex:1, minWidth:0 }},
          h('div', { style:{ fontSize:11, fontWeight:700, color:'#c084fc', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}, 'Mental Session'),
          h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}, session.title)
        ),
        h(Icon, { n:'chevR', cls:'w-4 h-4', style:{ color:'#a855f7', flexShrink:0 }})
      ),

      // Reflection prompt (Week 3 only)
      needsReflection && h('div', { style:{ marginBottom:14 }},
        h('p', { style:{ fontSize:11, fontWeight:700, color:wt.color, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8 }},
          '✏️ Today\'s Reflection'
        ),
        h('p', { style:{ fontSize:12, color:'#8b949e', marginBottom:8, lineHeight:1.55 }}, task.reflectionPrompt),
        h('textarea', {
          value:reflectionText,
          onChange:function(e){ setReflectionText(e.target.value); },
          placeholder:'Write your answer here...',
          rows:3,
          style:{
            width:'100%', padding:'10px 12px', borderRadius:9, fontSize:13, lineHeight:1.6,
            background:'rgba(13,17,23,0.6)', border:'1px solid rgba(48,54,61,0.9)', color:'#e6edf3',
            fontFamily:'inherit', resize:'none', outline:'none', boxSizing:'border-box',
          }
        }),
        reflectionText.trim().length===0 && h('p', { style:{ fontSize:11, color:'#f59e0b', marginTop:6 }},
          '⚠️ Complete your reflection to mark this day done'
        )
      ),

      // Mark complete button
      h('button', {
        onClick:function(){
          if(saving||!canComplete) return;
          setSaving(true);
          onComplete(task, reflectionText.trim());
        },
        disabled:!canComplete||saving,
        style:{
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          width:'100%', padding:'14px', border:'none', borderRadius:12,
          fontFamily:'inherit', fontSize:15, fontWeight:700, cursor:canComplete?'pointer':'not-allowed',
          background: canComplete ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(48,54,61,0.5)',
          color:'#fff', opacity:canComplete?1:0.5,
          transition:'all 0.15s',
        }
      },
        h(Icon, { n:'circleCheck', cls:'w-5 h-5' }),
        task.type==='rest' ? ' Complete Rest Day (+'+task.xp+' XP)' : ' Mark Day '+task.day+' Complete (+'+task.xp+' XP)'
      )
    )
  );
}

// ── ShieldBanner ──────────────────────────────────────────────────
function ShieldBanner({ shield, onUseShield }) {
  if(!shield||(!shield.lastMissDate&&!shield.shieldUsed)) return null;
  var today=new Date().toISOString().slice(0,10);
  var yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
  // Only show if last miss was yesterday or earlier
  if(!shield.lastMissDate||shield.lastMissDate===today) return null;
  var daysSince=Math.floor((Date.now()-new Date(shield.lastMissDate+'T00:00:00').getTime())/86400000);
  if(daysSince<1) return null;
  var isFirstMiss=!shield.shieldUsed;
  return h('div', {
    style:{
      padding:'12px 14px', borderRadius:10, marginBottom:8,
      background: isFirstMiss ? 'rgba(245,158,11,0.10)' : 'rgba(30,41,59,0.6)',
      border:'1px solid '+(isFirstMiss?'rgba(245,158,11,0.35)':'rgba(48,54,61,0.6)'),
      display:'flex', alignItems:'flex-start', gap:12,
    }
  },
    h('span', { style:{ fontSize:20, flexShrink:0, marginTop:2 }}, isFirstMiss ? '🛡️' : '💬'),
    h('div', { style:{ flex:1 }},
      h('p', { style:{ fontSize:13, fontWeight:700, color: isFirstMiss ? '#f59e0b' : '#8b949e', marginBottom:4 }},
        isFirstMiss ? 'Catch-Up Shield Active' : 'Keep Going!'
      ),
      h('p', { style:{ fontSize:12, color:'#6b7280', lineHeight:1.55 }},
        isFirstMiss
          ? 'You missed a day but your shield has you covered — complete today\'s day to stay on track!'
          : 'Every champion has off days. Jump back in today — your journey isn\'t over!'
      )
    ),
    isFirstMiss && h('button', {
      onClick:onUseShield,
      style:{
        flexShrink:0, padding:'6px 12px', borderRadius:7, fontSize:11, fontWeight:700,
        background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.4)',
        color:'#f59e0b', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap',
      }
    }, 'Use Shield')
  );
}

// ── TomorrowPreview ───────────────────────────────────────────────
function TomorrowPreview({ nextTask }) {
  if(!nextTask) return null;
  return h('div', { style:{
    padding:'12px 14px', borderRadius:10, marginTop:4,
    background:'rgba(22,27,34,0.6)', border:'1px solid rgba(48,54,61,0.6)',
    display:'flex', alignItems:'center', gap:10,
  }},
    h('span', { style:{ fontSize:14, flexShrink:0 }}, '👀'),
    h('div', { style:{ flex:1, minWidth:0 }},
      h('p', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:3 }}, 'Tomorrow — Day '+nextTask.day),
      h('p', { style:{ fontSize:12, fontWeight:700, color:'#8b949e', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}, nextTask.title)
    ),
    h(Icon, { n:'lock', cls:'w-3.5 h-3.5', style:{ color:'#374151', flexShrink:0 }})
  );
}

// ================================================================
// THIRTY DAY PAGE — main component
// ================================================================
function ThirtyDayPage() {
  var [progress, setProgress]             = useState(function(){ return DB.getProgress(); });
  var [shield, setShield]                 = useState(function(){ return DB.getChallengeShield(); });
  var [showMilestone, setShowMilestone]   = useState(null);
  var [showWeekSummary, setShowWeekSummary] = useState(null);
  var [reflections, setReflections]       = useState(function(){ return DB.getChallengeReflections(); });

  useEffect(function(){
    var refresh=function(){ setProgress(DB.getProgress()); setShield(DB.getChallengeShield()); setReflections(DB.getChallengeReflections()); };
    window.addEventListener('sc_update', refresh);
    return function(){ window.removeEventListener('sc_update', refresh); };
  },[]);

  if(!DAY30_TASKS||!WEEK_THEMES) {
    return h('div',{style:{padding:40,textAlign:'center',color:'#8b949e'}},
      h('p',null,'Loading challenge data...'));
  }

  var completed = progress.thirtyDay_completed||{};
  var doneCount = Object.keys(completed).length;
  var today     = new Date().toISOString().slice(0,10);
  var pct       = Math.round(doneCount/30*100);

  // Next available task = first task not completed, in order
  var nextTask = DAY30_TASKS.find(function(t){ return !completed[t.day]; }) || null;
  var prevDoneTask = doneCount>0 ? DAY30_TASKS.find(function(t){ return t.day===doneCount; }) : null;

  // Check shield status — if last completed was 2+ days ago
  function checkAndUpdateShield(newDoneCount) {
    if(newDoneCount===0) return;
    var lastTask=DAY30_TASKS.find(function(t){return t.day===newDoneCount;});
    if(!lastTask) return;
    var lastDate=completed[newDoneCount];
    if(!lastDate) return;
    var daysSince=Math.floor((Date.now()-new Date(lastDate+'T00:00:00').getTime())/86400000);
    if(daysSince>=2) {
      var s=DB.getChallengeShield();
      if(!s.lastMissDate) {
        s.lastMissDate=lastDate;
        DB.saveChallengeShield(s);
        setShield(s);
      }
    }
  }

  function handleUseShield() {
    var s=DB.getChallengeShield();
    s.shieldUsed=true;
    DB.saveChallengeShield(s);
    setShield(Object.assign({},s));
  }

  function markDay(task, reflectionText) {
    if(completed[task.day]) return;
    // Save reflection (Week 3)
    if(task.reflectionPrompt && reflectionText) {
      DB.saveChallengeReflection(task.day, reflectionText);
    }
    // Update thirtyDay_completed
    var p=DB.getProgress();
    if(!p.thirtyDay_completed) p.thirtyDay_completed={};
    p.thirtyDay_completed[task.day]=today;
    DB.saveProgress(p);
    // Award XP
    awardXP(task.xp, 15, '30day');
    var newCount=Object.keys(p.thirtyDay_completed).length;
    // Milestone badges + XP bonus
    if(newCount===7)  { awardXP(50,  0, 'milestone'); if(A.CardPackService) try{A.CardPackService.triggerPack('week_done');}catch(e){} }
    if(newCount===14) { awardXP(75,  0, 'milestone'); if(A.CardPackService) try{A.CardPackService.triggerPack('week_done');}catch(e){} }
    if(newCount===21) { awardXP(100, 0, 'milestone'); if(A.CardPackService) try{A.CardPackService.triggerPack('week_done');}catch(e){} }
    if(newCount===30) { awardXP(200, 0, 'milestone'); if(A.CardPackService) try{A.CardPackService.triggerPack('challenge_30');}catch(e){} }
    // Show weekly summary THEN milestone
    if(newCount===7||newCount===14||newCount===21||newCount===28) {
      var wk=Math.ceil(newCount/7);
      // Show week summary first, milestone after dismissing
      setShowWeekSummary(wk);
    } else if(newCount===30) {
      fireConfetti();
      setShowMilestone(30);
    }
    setProgress(DB.getProgress());
    setReflections(DB.getChallengeReflections());
  }

  function handleWeekSummaryClose(weekNum) {
    setShowWeekSummary(null);
    var milestoneDay=weekNum*7;
    if([7,14,21,28,30].indexOf(milestoneDay)!==-1) {
      fireConfetti();
      setShowMilestone(milestoneDay);
    }
  }

  // ── Render overlays first ────────────────────────────────────
  var overlays = h(Fragment, null,
    showMilestone && h(MilestoneOverlay, { dayNum:showMilestone, onClose:function(){ setShowMilestone(null); }}),
    showWeekSummary && !showMilestone && h(WeeklySummaryOverlay, {
      weekNum:showWeekSummary,
      completed:completed,
      onClose:function(){ handleWeekSummaryClose(showWeekSummary); }
    })
  );

  return h(Fragment, null,
    overlays,
    h('div', { style:{ paddingBottom:120, minHeight:'100dvh', background:'#0d1117' }},

      h(PageHeader, {
        title:'30-Day Challenge',
        subtitle:'Build the habit. Transform your game.',
        gradient:'linear-gradient(135deg,#d97706,#b45309)',
      }),

      h('div', { style:{ padding:'16px 16px 0' }},

        // ── Overall progress bar ─────────────────────────────────
        h('div', { style:{
          background:'rgba(10,15,30,0.9)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)',
          padding:'20px', marginBottom:20, boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
        }},
          h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }},
            h('div', null,
              h('div', { style:{ fontSize:11, fontWeight:600, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}, 'Challenge Progress'),
              h('div', { style:{ fontSize:28, fontWeight:900, color:'#f8fafc' }}, 'Day '+doneCount+' of 30'),
              h('div', { style:{ fontSize:11, fontWeight:700, color:'#94a3b8', marginTop:2 }},
                doneCount===30 ? '🏆 Challenge Complete — You Are The Champion!' :
                doneCount===0  ? 'Begin your journey today' :
                doneCount<7   ? 'Building the foundation...' :
                doneCount<14  ? 'Game is growing!' :
                doneCount<21  ? 'Forging mental steel!' :
                'ELITE territory — finish strong!'
              )
            ),
            h('div', { style:{
              display:'flex', alignItems:'center', gap:4,
              padding:'4px 10px', borderRadius:99,
              background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)',
            }},
              h('span', { style:{ fontSize:14 }}, '🔥'),
              h('span', { style:{ fontSize:14, fontWeight:700, color:'#f59e0b' }}, pct+'%')
            )
          ),
          h('div', { style:{ height:8, background:'rgba(255,255,255,0.06)', borderRadius:99, overflow:'hidden' }},
            h('div', { style:{
              width:pct+'%', height:'100%', borderRadius:99,
              background:'linear-gradient(90deg,#22c55e,#4ade80)',
              transition:'width 0.7s ease',
              boxShadow:'0 0 12px rgba(74,222,128,0.5)',
            }})
          )
        ),

        // ── Shield banner ────────────────────────────────────────
        h(ShieldBanner, { shield:shield, onUseShield:handleUseShield }),

        // ── Four week sections ───────────────────────────────────
        WEEK_THEMES.map(function(wt) {
          var weekTasks=DAY30_TASKS.filter(function(t){return t.week===wt.week;});
          var weekDone=weekTasks.filter(function(t){return !!completed[t.day];}).length;
          var socialProofDay=wt.week===2?14:wt.week===3?20:wt.week===4?25:null;
          var socialPct=socialProofDay&&SOCIAL_PROOF?SOCIAL_PROOF[socialProofDay]:null;

          return h('div', { key:wt.week, style:{ marginBottom:20 }},

            // Week theme header
            h('div', { style:{
              padding:'10px 14px', borderRadius:10, marginBottom:10,
              background:wt.bg, border:'1px solid '+wt.border,
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }},
              h('div', null,
                h('div', { style:{ fontSize:11, fontWeight:800, color:wt.color, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:2 }},
                  'Week '+wt.week+' — '+wt.theme
                ),
                h('div', { style:{ fontSize:12, color:'rgba(255,255,255,0.5)' }}, wt.desc)
              ),
              h('div', { style:{
                fontSize:12, fontWeight:800, color:wt.color,
                background:'rgba(0,0,0,0.25)', padding:'3px 10px', borderRadius:6,
              }}, weekDone+'/'+weekTasks.length)
            ),

            // 7-cell day map
            h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:8 }},
              weekTasks.map(function(task){
                var isDone=!!completed[task.day];
                var isAvailable=!isDone&&(doneCount===task.day-1);
                return h(DayCell, {
                  key:task.day,
                  task:task,
                  isDone:isDone,
                  isAvailable:isAvailable,
                  onPress:function(){},
                });
              })
            ),

            // Available day card (only shows for current unlockable day in this week)
            (function(){
              var avail=weekTasks.find(function(t){return !completed[t.day]&&doneCount===t.day-1;});
              if(!avail) return null;
              return h(AvailableDayCard, {
                key:'avail-'+avail.day,
                task:avail,
                onComplete:markDay,
              });
            })(),

            // Social proof
            socialPct && doneCount+1===socialProofDay && h('div', { style:{
              marginTop:8, padding:'8px 12px', borderRadius:8,
              background:'rgba(22,27,34,0.6)', border:'1px solid rgba(48,54,61,0.6)',
              display:'flex', alignItems:'center', gap:8,
            }},
              h('span', { style:{ fontSize:14 }}, '🌍'),
              h('p', { style:{ fontSize:12, color:'#6b7280' }},
                socialPct+'% of SmartCrick players have made it to Day '+socialProofDay+'. Keep pushing!'
              )
            )
          );
        }),

        // ── Tomorrow preview ─────────────────────────────────────
        doneCount>0 && nextTask && completed[doneCount] && h(TomorrowPreview, { nextTask:nextTask }),

        // ── Done state ───────────────────────────────────────────
        doneCount===30 && h('div', { style:{
          padding:'24px', borderRadius:14, textAlign:'center', marginTop:8,
          background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.3)',
        }},
          h('div', { style:{ fontSize:48, marginBottom:12 }}, '🏆'),
          h('h3', { style:{ fontSize:18, fontWeight:900, color:'#fff', marginBottom:8 }}, '30-Day Champion!'),
          h('p', { style:{ fontSize:13, color:'#6b7280', lineHeight:1.65 }},
            'You completed the entire 30-Day Challenge. You\'ve proven what elite dedication looks like. Now go play.'
          )
        ),

        // ── P5-E: Monthly Challenge ──────────────────────────────
        h(MonthlyChallenge, { progress:progress })

      )
    )
  );
}

// ================================================================
// P5-E: Monthly Challenge Component
// ================================================================
function MonthlyChallenge({ progress }) {
  var MONTHLY_CHALLENGES = A.MONTHLY_CHALLENGES;
  var getCurrentMonthChallenge = A.getCurrentMonthChallenge;
  if(!MONTHLY_CHALLENGES || !getCurrentMonthChallenge) return null;

  var challenge = getCurrentMonthChallenge();
  if(!challenge) return null;

  var mp = DB.getMonthlyProgress ? DB.getMonthlyProgress() : {};
  var monthKey = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
  var monthData = mp[monthKey] || { completed: {} };

  // Compute task progress
  var xpLog = DB.getXPLog ? DB.getXPLog() : [];
  var monthXP = xpLog.filter(function(e) {
    return e.date && e.date.startsWith(monthKey) && e.xp > 0;
  }).reduce(function(s, e) { return s + e.xp; }, 0);

  function isTaskDone(task) {
    if(monthData.completed[task.id]) return true;
    // Auto-detect XP task
    if(task.type === 'xp') return monthXP >= task.target;
    // Drill task: count from completed_drills in xp_log (source='drill')
    if(task.type === 'drill') {
      var drillEntries = xpLog.filter(function(e) {
        return e.date && e.date.startsWith(monthKey) && e.source === 'drill';
      });
      return drillEntries.length >= task.times;
    }
    // Mental task
    if(task.type === 'mental') {
      var mentalEntries = xpLog.filter(function(e) {
        return e.date && e.date.startsWith(monthKey) && e.source === 'mental';
      });
      return mentalEntries.length >= task.times;
    }
    return false;
  }

  var completedTasks = challenge.tasks.filter(isTaskDone).length;
  var allDone = completedTasks === challenge.tasks.length;
  var pct = Math.round((completedTasks / challenge.tasks.length) * 100);

  // Month name
  var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var monthName = monthNames[new Date().getMonth()];

  return h('div', {
    role: 'region',
    'aria-label': monthName + ' monthly challenge',
    style: { marginTop: 20 }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }},
      h('h2', { style: { fontSize: 13, fontWeight: 700, color: '#8b949e', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }},
        monthName + ' Challenge'),
      allDone && h('span', { style: { fontSize: 11, fontWeight: 700, color: '#16a34a' }}, '✓ Complete!')
    ),

    h('div', { style: {
      borderRadius: 14, overflow: 'hidden',
      background: challenge.bg, border: '1px solid ' + challenge.border,
    }},
      h('div', { style: { height: 3, background: challenge.color }}),
      h('div', { style: { padding: '16px' }},
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }},
          h('span', { 'aria-hidden': 'true', style: { fontSize: 24 }}, challenge.emoji),
          h('div', null,
            h('div', { style: { fontSize: 14, fontWeight: 800, color: '#f0fdf4' }}, challenge.title),
            h('div', { style: { fontSize: 12, color: challenge.color }}, challenge.theme)
          )
        ),

        // Progress bar
        h('div', {
          role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100,
          'aria-label': completedTasks + ' of ' + challenge.tasks.length + ' tasks complete',
          style: { height: 5, borderRadius: 99, background: 'rgba(30,41,59,0.5)', overflow: 'hidden', marginBottom: 12 }
        },
          h('div', { 'aria-hidden': 'true', style: {
            height: '100%', borderRadius: 99, width: pct + '%',
            background: challenge.color, transition: 'width 0.6s ease'
          }})
        ),

        // Tasks
        h('div', { role: 'list', 'aria-label': 'Monthly challenge tasks', style: { display: 'flex', flexDirection: 'column', gap: 8 }},
          challenge.tasks.map(function(task) {
            var done = isTaskDone(task);
            var drillObj = task.type === 'drill' && A.DRILLS ? A.DRILLS.find(function(d) { return d.id === task.drillId; }) : null;
            var mentalObj = task.type === 'mental' && A.MENTAL_SESSIONS ? A.MENTAL_SESSIONS.find(function(s) { return s.id === task.mentalId; }) : null;
            var actionLabel = done ? '' : (drillObj ? 'Go to drill' : mentalObj ? 'Start session' : null);
            return h('div', { key: task.id, role: 'listitem', style: {
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              borderRadius: 9, background: done ? 'rgba(22,163,74,0.08)' : 'rgba(13,17,23,0.4)',
              border: '1px solid ' + (done ? 'rgba(22,163,74,0.25)' : 'rgba(48,54,61,0.6)'),
            }},
              h('div', { 'aria-hidden': 'true', style: {
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: done ? '#16a34a' : 'rgba(48,54,61,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: done ? 'none' : '1px solid rgba(75,85,99,0.5)',
              }},
                done && h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: 12, height: 12, viewBox: '0 0 24 24', fill: 'none', stroke: '#fff', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' },
                  h('polyline', { points: '20 6 9 17 4 12' }))
              ),
              h('div', { style: { flex: 1, minWidth: 0 }},
                h('div', { style: { fontSize: 12, fontWeight: 600, color: done ? '#4ade80' : '#8b949e', textDecoration: done ? 'line-through' : 'none' }}, task.label),
                task.type === 'xp' && h('div', { style: { fontSize: 11, color: '#484f58', marginTop: 1 }},
                  monthXP + ' / ' + task.target + ' XP earned this month')
              ),
              h(XPBadge, { xp: task.xp }),
              !done && (drillObj || mentalObj) && h('button', {
                onClick: function() { nav(drillObj ? 'DrillDetail' : 'MentalPlayer', { id: drillObj ? drillObj.id : mentalObj.id }); },
                'aria-label': actionLabel,
                style: {
                  padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  background: challenge.color + '20', border: '1px solid ' + challenge.color + '40',
                  color: challenge.color, fontFamily: 'inherit', flexShrink: 0, minHeight: 36,
                  outline: 'none',
                },
                onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 2px ' + challenge.color + '40'; },
                onBlur:  function(e) { e.currentTarget.style.boxShadow = 'none'; },
              }, 'Go →')
            );
          })
        ),

        // Bonus XP notice
        h('div', { style: {
          marginTop: 12, padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(48,54,61,0.4)',
        }},
          h('span', { 'aria-hidden': 'true', style: { fontSize: 14 }}, '⭐'),
          h('p', { style: { fontSize: 12, color: '#6b7280' }},
            'Complete all tasks to earn +' + challenge.bonusXP + ' bonus XP!')
        )
      )
    )
  );
}

window.SC_APP.ThirtyDayPage = ThirtyDayPage;
window.SC_APP.MonthlyChallenge = MonthlyChallenge;
console.log('[SC] app-challenges v2.1 — C-1→C-10 + P5-E Monthly Challenge');
})();
