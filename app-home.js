// app-home.js v5.0 — CLEAN SINGLE IIFE
// ✅ Bug #1 fixed: single IIFE, no duplicate code
// ✅ Bug #2 fixed: no orphaned global code
// ✅ Bug #3 fixed: levelInfo.next.name (no [object Object])
// ✅ Feature 1: StreakCalendarSection — 4-week calendar + heatmap + insight
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A  = window.SC_APP;
var DB = A.DB;
var nav = A.nav;

// ── Spin prize config ─────────────────────────────────────────────
var SPIN_PRIZES = [
  { xp:25,  weight:30, label:'+25 XP',     color:'#3b82f6' },
  { xp:50,  weight:25, label:'+50 XP!',    color:'#10b981' },
  { xp:100, weight:20, label:'+100 XP!!',  color:'#f59e0b' },
  { xp:10,  weight:15, label:'+10 XP',     color:'#8b5cf6' },
  { xp:200, weight:8,  label:'+200 XP!!!', color:'#ef4444' },
  { xp:500, weight:2,  label:'JACKPOT!',   color:'#ffd700' },
];

function weightedRandom(prizes) {
  var total = prizes.reduce(function(s,p){ return s+p.weight; },0);
  var r = Math.random()*total, cum = 0;
  for (var i=0;i<prizes.length;i++) { cum+=prizes[i].weight; if(r<cum) return i; }
  return prizes.length-1;
}

function buildSegments(prizes) {
  var total = prizes.reduce(function(s,p){ return s+p.weight; },0);
  var segs=[], angle=0;
  prizes.forEach(function(p) {
    var sweep = (p.weight/total)*360;
    segs.push({ startAngle:angle, sweep:sweep, midAngle:angle+sweep/2,
                color:p.color, label:p.label, xp:p.xp });
    angle += sweep;
  });
  return segs;
}

function polarXY(cx,cy,r,deg) {
  var rad = (deg-90)*Math.PI/180;
  return { x:cx+r*Math.cos(rad), y:cy+r*Math.sin(rad) };
}

// ── SpinWheelWidget ───────────────────────────────────────────────
function SpinWheelWidget() {
  var today = new Date().toISOString().slice(0,10);
  var alreadySpun = DB.get('last_spin_date')===today;
  var savedPrize  = DB.get('last_spin_prize')||null;
  var [spinning,   setSpinning]   = useState(false);
  var [rotation,   setRotation]   = useState(0);
  var [result,     setResult]     = useState(null);
  var [spunToday,  setSpunToday]  = useState(alreadySpun);
  var [todayPrize, setTodayPrize] = useState(savedPrize);
  var [expanded,   setExpanded]   = useState(false);
  var rotRef = useRef(0);
  var segs   = buildSegments(SPIN_PRIZES);
  var cx=100, cy=100, r=88;

  function getTargetAngle(prizeIdx) {
    var seg = segs[prizeIdx];
    var currentBase = rotRef.current%360;
    var extraSpins  = (5+Math.floor(Math.random()*3))*360;
    var toTop       = (360-seg.midAngle+360)%360;
    return currentBase+extraSpins+toTop;
  }

  function handleSpin() {
    if(spinning||spunToday) return;
    var prizeIdx   = weightedRandom(SPIN_PRIZES);
    var winner     = SPIN_PRIZES[prizeIdx];
    var finalAngle = getTargetAngle(prizeIdx);
    var startAngle = rotRef.current, startTime=null, duration=3200;
    setSpinning(true); setResult(null);
    function frame(ts) {
      if(!startTime) startTime=ts;
      var elapsed=ts-startTime;
      var progress=Math.min(elapsed/duration,1);
      var eased=1-Math.pow(1-progress,3);
      var cur=startAngle+(finalAngle-startAngle)*eased;
      rotRef.current=cur; setRotation(cur);
      if(progress<1) {
        requestAnimationFrame(frame);
      } else {
        rotRef.current=finalAngle; setRotation(finalAngle);
        setSpinning(false); setResult(winner); setSpunToday(true); setTodayPrize(winner);
        DB.set('last_spin_date',today); DB.set('last_spin_prize',winner);
        if(A.awardXP) A.awardXP(winner.xp,0,'spin_wheel',null,null);
        if(winner.xp>=200&&A.fireConfetti) A.fireConfetti();
        window.dispatchEvent(new CustomEvent('sc_update'));
      }
    }
    requestAnimationFrame(frame);
  }

  function timeUntilMidnight() {
    var now=new Date(), mn=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    var d=mn-now;
    return Math.floor(d/3600000)+'h '+Math.floor((d%3600000)/60000)+'m';
  }

  if(!expanded) {
    return h('div',{role:'button',tabIndex:0,'aria-label':spunToday?'Daily spin used':'Open daily spin wheel',
      onClick:function(){setExpanded(true);},
      onKeyDown:function(e){if(e.key==='Enter'||e.key===' ')setExpanded(true);},
      style:{margin:'0 16px 12px',cursor:'pointer',outline:'none'}},
      h('div',{style:{padding:'11px 16px',borderRadius:12,
        background:spunToday?'rgba(255,255,255,.03)':'linear-gradient(135deg,rgba(245,158,11,.1),rgba(239,68,68,.08))',
        border:'1px solid '+(spunToday?'rgba(255,255,255,.07)':'rgba(245,158,11,.3)'),
        display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{fontSize:22},'aria-hidden':'true'},spunToday?'✅':'🎰'),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:13,fontWeight:600,color:spunToday?'#6b7280':'#e5e7eb'}},
            spunToday?'Daily Spin Used':'Daily Bonus Spin'),
          h('div',{style:{fontSize:11,color:'#6b7280',marginTop:2}},
            spunToday?'Won '+(todayPrize?todayPrize.label:'')+' · Next in '+timeUntilMidnight()
                     :'Spin for up to 500 bonus XP — once per day')
        ),
        !spunToday&&h('span',{style:{fontSize:13,fontWeight:600,color:'#f59e0b'}},'Spin →')
      )
    );
  }

  return h('div',{style:{margin:'0 16px 12px',padding:'20px 16px',
    background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:14}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}},
      h('div',{style:{fontSize:14,fontWeight:600,color:'#e5e7eb'}},'🎰 Daily Bonus Spin'),
      h('button',{onClick:function(){setExpanded(false);},'aria-label':'Close',
        style:{background:'none',border:'none',color:'#6b7280',fontSize:20,cursor:'pointer',padding:'0 4px'}},'×')
    ),
    h('div',{style:{position:'relative',width:200,height:200,margin:'0 auto 16px'}},
      h('div',{'aria-hidden':'true',style:{position:'absolute',top:-8,left:'50%',transform:'translateX(-50%)',
        width:0,height:0,borderLeft:'9px solid transparent',borderRight:'9px solid transparent',
        borderTop:'18px solid #16a34a',filter:'drop-shadow(0 2px 6px rgba(22,163,74,.6))',zIndex:2}}),
      h('svg',{width:200,height:200,viewBox:'0 0 200 200',role:'img','aria-label':'Spin wheel',
        style:{display:'block',transform:'rotate('+rotation+'deg)',transformOrigin:'100px 100px',willChange:'transform'}},
        segs.map(function(seg,i) {
          var start=polarXY(cx,cy,r,seg.startAngle);
          var end=polarXY(cx,cy,r,seg.startAngle+seg.sweep);
          var large=seg.sweep>180?1:0;
          var d='M '+cx+' '+cy+' L '+start.x.toFixed(1)+' '+start.y.toFixed(1)+
                ' A '+r+' '+r+' 0 '+large+' 1 '+end.x.toFixed(1)+' '+end.y.toFixed(1)+' Z';
          var mid=polarXY(cx,cy,r*0.65,seg.midAngle);
          return h('g',{key:i},
            h('path',{d:d,fill:seg.color,stroke:'#0d1117',strokeWidth:2.5}),
            h('text',{x:mid.x,y:mid.y,textAnchor:'middle',dominantBaseline:'central',
              fontSize:seg.xp>=200?8:9,fontWeight:700,fill:'#fff',
              transform:'rotate('+seg.midAngle+','+mid.x+','+mid.y+')',
              style:{userSelect:'none'}},seg.label)
          );
        }),
        h('circle',{cx:cx,cy:cy,r:14,fill:'#111827',stroke:'#16a34a',strokeWidth:2}),
        h('text',{x:cx,y:cy,textAnchor:'middle',dominantBaseline:'central',fontSize:12,fill:'#16a34a',fontWeight:700},'🏏')
      )
    ),
    result
      ? h('div',{style:{textAlign:'center'},role:'status','aria-live':'polite'},
          h('div',{style:{fontSize:28,fontWeight:700,color:result.color,marginBottom:6}},result.label),
          h('div',{style:{fontSize:13,color:'#9ca3af'}},'XP added! Come back tomorrow.'),
          h('button',{onClick:function(){setExpanded(false);},
            style:{marginTop:10,padding:'8px 24px',background:'rgba(255,255,255,.06)',
              border:'none',borderRadius:8,color:'#9ca3af',cursor:'pointer',fontSize:12}},'Close')
        )
      : spunToday
        ? h('div',{style:{textAlign:'center'}},
            h('div',{style:{fontSize:13,color:'#6b7280'}},'Already spun today!'),
            todayPrize&&h('div',{style:{fontSize:22,fontWeight:700,color:todayPrize.color,marginTop:4}},'You won '+todayPrize.label),
            h('div',{style:{fontSize:12,color:'#4b5563',marginTop:4}},'Next spin in '+timeUntilMidnight())
          )
        : h('div',{style:{textAlign:'center'}},
            h('button',{onClick:handleSpin,disabled:spinning,'aria-label':'Spin the wheel',
              style:{padding:'13px 40px',border:'none',borderRadius:12,
                background:spinning?'rgba(255,255,255,.06)':'linear-gradient(135deg,#f59e0b,#ef4444)',
                color:'#fff',fontSize:16,fontWeight:700,cursor:spinning?'not-allowed':'pointer',
                boxShadow:spinning?'none':'0 4px 18px rgba(245,158,11,.45)'}},
              spinning?'🌀 Spinning...':'🎰 SPIN!'),
            h('div',{style:{fontSize:11,color:'#6b7280',marginTop:8}},'Win up to 500 bonus XP — once per day')
          )
  );
}

// ── AIRecommendCard ───────────────────────────────────────────────
function AIRecommendCard() {
  var [rec,setRec]       = useState(null);
  var [reason,setReason] = useState('');
  var [drill,setDrill]   = useState(null);

  useEffect(function() {
    try {
      var cat  = A.getRecommendedCategory?A.getRecommendedCategory():'batting';
      var text = A.getRecommendedReason?A.getRecommendedReason(cat):'Based on your training history';
      setRec(cat); setReason(text);
      var DRILLS=A.DRILLS||[], dp=DB.getDrillProgress?DB.getDrillProgress():{};
      var uLevel=((DB.getUser?DB.getUser():{}).level||'').toLowerCase();
      var skill=(uLevel==='elite'||uLevel==='state')?'advanced':uLevel==='district'?'intermediate':'beginner';
      var catDrills=DRILLS.filter(function(d){return d.category===cat;});
      var undone=catDrills.filter(function(d){return !dp[d.id];});
      var pick=undone.find(function(d){return d.skill_level===skill;})||undone[0]||catDrills[0];
      setDrill(pick||null);
    } catch(e){console.warn('[SC] AI card:',e);}
  },[]);

  if(!rec||!drill) return null;
  var CFG={
    batting:{emoji:'🏏',color:'#3b82f6',label:'Batting'},
    bowling:{emoji:'🎳',color:'#ef4444',label:'Bowling'},
    fielding:{emoji:'🤸',color:'#10b981',label:'Fielding'},
    fitness:{emoji:'💪',color:'#f59e0b',label:'Fitness'},
    mental:{emoji:'🧠',color:'#8b5cf6',label:'Mental'},
    wicketkeeping:{emoji:'🧤',color:'#14b8a6',label:'Keeping'},
  };
  var cfg=CFG[rec]||CFG.batting;
  return h('div',{style:{margin:'0 16px 12px',padding:'14px 16px',borderRadius:14,
    background:'linear-gradient(135deg,'+cfg.color+'10,'+cfg.color+'06)',
    border:'1px solid '+cfg.color+'35'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:10}},
      h('span',{style:{fontSize:14,fontWeight:600,color:cfg.color}},'🤖 AI Recommends Today'),
      h('span',{style:{marginLeft:'auto',fontSize:11,color:cfg.color,
        background:cfg.color+'18',padding:'2px 8px',borderRadius:10,border:'1px solid '+cfg.color+'30'}},cfg.label)
    ),
    h('div',{style:{display:'flex',gap:12,alignItems:'flex-start'}},
      h('div',{style:{fontSize:32,lineHeight:1,flexShrink:0},'aria-hidden':'true'},cfg.emoji),
      h('div',{style:{flex:1,minWidth:0}},
        h('div',{style:{fontSize:14,fontWeight:600,color:'#e5e7eb',marginBottom:3}},drill.title),
        h('div',{style:{fontSize:12,color:'#9ca3af',lineHeight:1.45,marginBottom:9}},reason),
        h('button',{onClick:function(){nav('DrillDetail',{id:drill.id});},'aria-label':'Start '+drill.title,
          style:{padding:'8px 18px',border:'none',borderRadius:8,background:cfg.color,
            color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}},'→ Start drill')
      )
    )
  );
}

// ── MultiplierBanner ──────────────────────────────────────────────
function MultiplierBanner(props) {
  var streak=props.streak||0, mult=props.multiplier||1.0;
  if(mult<=1.0) return null;
  var clr=mult>=1.5?'#ef4444':mult>=1.3?'#f59e0b':'#16a34a';
  return h('div',{role:'status','aria-label':mult+'x XP multiplier active',
    style:{margin:'0 16px 10px',padding:'9px 14px',borderRadius:10,
      background:clr+'12',border:'1px solid '+clr+'30',display:'flex',alignItems:'center',gap:10}},
    h('div',{style:{fontSize:20},'aria-hidden':'true'},'🔥'),
    h('div',{style:{flex:1}},
      h('div',{style:{fontSize:12,fontWeight:700,color:clr}},mult+'× XP Multiplier Active'),
      h('div',{style:{fontSize:11,color:'#6b7280'}},streak+'-day streak · Every XP earned is boosted!')
    )
  );
}

// ================================================================
// FEATURE 1: STREAK CALENDAR SECTION
// 4-week view: current week (large circles) + 3-week heatmap
// Intelligent insight engine with 6 pattern detectors
// ================================================================
function StreakCalendarSection() {

  // ── Date utilities ────────────────────────────────────────────
  var now = new Date();
  var todayStr = now.toISOString().slice(0,10);

  // Monday of current week
  var dow = now.getDay();
  var mondayOffset = (dow===0)?-6:1-dow;
  var mondayDate = new Date(now);
  mondayDate.setDate(now.getDate()+mondayOffset);
  mondayDate.setHours(0,0,0,0);

  function makeDateStr(base,offsetDays) {
    var d = new Date(base);
    d.setDate(base.getDate()+offsetDays);
    return d.toISOString().slice(0,10);
  }

  // Current week: Mon→Sun
  var DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var weekDayStrs = DAY_LABELS.map(function(_,i){ return makeDateStr(mondayDate,i); });

  // Previous 3 weeks (arrays of 7, oldest first)
  var prevWeekRows = [3,2,1].map(function(weeksBack) {
    return DAY_LABELS.map(function(_,d){ return makeDateStr(mondayDate,-(weeksBack*7)+d); });
  });

  // ── Build XP lookup maps ──────────────────────────────────────
  var xpLog = DB.getXPLog?DB.getXPLog():[];
  var xpByDate={}, sourcesByDate={};
  for(var j=0;j<xpLog.length;j++){
    var e=xpLog[j];
    if(!e.date) continue;
    xpByDate[e.date]=(xpByDate[e.date]||0)+(e.xp||0);
    if(!sourcesByDate[e.date]) sourcesByDate[e.date]={};
    if(e.source) sourcesByDate[e.date][e.source]=true;
  }

  // ── Current-week cell data ────────────────────────────────────
  var weekData = weekDayStrs.map(function(ds,idx){
    var xp = xpByDate[ds]||0;
    return {
      date:ds, label:DAY_LABELS[idx], xp:xp,
      srcs:sourcesByDate[ds]||{},
      isFuture: ds>todayStr,
      isToday:  ds===todayStr,
      trained:  xp>0,
      missed:   xp===0 && ds<todayStr,
    };
  });

  // ── Key metrics ───────────────────────────────────────────────
  var progress   = DB.getProgress();
  var streak     = progress.current_streak||0;
  var bestStreak = progress.longest_streak||0;
  var trainedDays= weekData.filter(function(d){return d.trained;}).length;
  var weekXP     = weekData.reduce(function(s,d){return s+d.xp;},0);
  var weekPct    = Math.round((trainedDays/7)*100);
  var perfectWeek= trainedDays===7;
  var todayCell  = weekData.find(function(d){return d.isToday;});
  var streakAtRisk= streak>0 && todayCell && !todayCell.trained;

  // ── Source icons helper ───────────────────────────────────────
  function srcIcons(srcs) {
    var out='';
    if(srcs.drill||srcs.batting||srcs.bowling||srcs.fielding) out+='🏏';
    if(srcs.mental) out+='🧠';
    if(srcs.workout||srcs.fitness) out+='💪';
    if(srcs.dailynet) out+='🎯';
    if(srcs.daily_login) out+='🎁';
    return out;
  }

  // ── Heatmap color helper ──────────────────────────────────────
  function heatBg(ds) {
    var xp=xpByDate[ds]||0;
    if(xp===0)   return 'rgba(25,32,40,0.8)';
    if(xp<60)    return 'rgba(22,163,74,0.22)';
    if(xp<150)   return 'rgba(22,163,74,0.48)';
    if(xp<300)   return 'rgba(22,163,74,0.75)';
    return '#16a34a';
  }

  // ── Intelligent insight engine (6 detectors) ──────────────────
  // Runs through detectors in priority order, uses first match
  var insight = null;
  function checkInsight() {
    // 1. About to beat personal best streak
    if(streak>0 && bestStreak>=5 && streak>=Math.ceil(bestStreak*0.75) && streak<bestStreak) {
      var need=bestStreak-streak;
      insight={icon:'🏆',color:'rgba(245,158,11,0.08)',border:'rgba(245,158,11,0.22)',textColor:'#fbbf24',
        text:'Just '+need+' more day'+(need===1?'':'s')+' to beat your personal best of '+bestStreak+' days!'};
      return;
    }
    // 2. Repeated perfect-week streak (last week was also perfect)
    var lastWeekDays = prevWeekRows[2];
    if(lastWeekDays && lastWeekDays.every(function(ds){return (xpByDate[ds]||0)>0;})) {
      if(trainedDays>=5) {
        insight={icon:'⚡',color:'rgba(59,130,246,0.07)',border:'rgba(59,130,246,0.20)',textColor:'#60a5fa',
          text:'Two consecutive strong weeks! You\'re building real elite consistency.'};
        return;
      }
    }
    // 3. Drilling without mental training (pattern over 14 days)
    var look14 = prevWeekRows[1]?prevWeekRows[1][0]:weekDayStrs[0];
    var recent14=xpLog.filter(function(e){return e.date&&e.date>=look14;});
    var hasMental14=recent14.some(function(e){return e.source==='mental';});
    var hasDrill14=recent14.some(function(e){return e.source==='drill'||e.source==='batting'||e.source==='bowling';});
    if(hasDrill14&&!hasMental14&&recent14.length>=4) {
      insight={icon:'🧠',color:'rgba(139,92,246,0.07)',border:'rgba(139,92,246,0.20)',textColor:'#a78bfa',
        text:'You\'ve been training hard physically. Add a mental session today — elite players train both.'};
      return;
    }
    // 4. Consistent weekday trainer but misses weekends
    var weekendMisses=0;
    prevWeekRows.forEach(function(r){
      if(r[5]&&!(xpByDate[r[5]]>0)) weekendMisses++;
      if(r[6]&&!(xpByDate[r[6]]>0)) weekendMisses++;
    });
    if(weekendMisses>=4) {
      insight={icon:'📅',color:'rgba(249,115,22,0.07)',border:'rgba(249,115,22,0.20)',textColor:'#fb923c',
        text:'Weekends are your training gap. Even 10 minutes keeps your streak alive.'};
      return;
    }
    // 5. On track for perfect week
    var pastDaysCount=weekData.filter(function(d){return !d.isFuture;}).length;
    if(pastDaysCount>=4 && trainedDays===pastDaysCount && !perfectWeek) {
      insight={icon:'🔥',color:'rgba(22,163,74,0.07)',border:'rgba(22,163,74,0.20)',textColor:'#4ade80',
        text:'Trained every day so far this week — perfect week bonus is within reach!'};
      return;
    }
    // 6. Coming back after a gap (last week was sparse, this week is strong)
    var lastWeekTrainedCount=0;
    if(prevWeekRows[2]) {
      prevWeekRows[2].forEach(function(ds){if((xpByDate[ds]||0)>0)lastWeekTrainedCount++;});
    }
    if(lastWeekTrainedCount<=2 && trainedDays>=3) {
      insight={icon:'💪',color:'rgba(22,163,74,0.07)',border:'rgba(22,163,74,0.20)',textColor:'#4ade80',
        text:'Strong bounce-back this week after a quiet one. This is what champions do.'};
      return;
    }
  }
  checkInsight();

  // ── Progress message ──────────────────────────────────────────
  var progressMsg = perfectWeek?'🏆 Perfect week!'
    :weekPct>=86?'⚡ One more day for a perfect week!'
    :weekPct>=57?'💪 Momentum building — finish strong'
    :weekPct>=29?'🌱 Good start — keep adding to it'
    :weekPct>0 ?'🏏 You\'ve started — build on it'
    :(weekData.filter(function(d){return !d.isFuture;}).length===0)
      ?'🏏 New week — how will you open it?'
      :'🏏 Day 1 — start it now!';

  // ── Render ────────────────────────────────────────────────────
  return h('div',{style:{margin:'0 16px 14px'}},
    h('style',null,
      '@keyframes scRingPulse{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.5)}'+
      '60%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}'
    ),

    h('div',{style:{background:'rgba(13,17,23,0.98)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:16,overflow:'hidden'}},

      // ── HEADER ───────────────────────────────────────────────
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'12px 16px 11px',background:'rgba(22,27,34,0.7)',
        borderBottom:'1px solid rgba(48,54,61,0.5)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:9}},
          h('div',{style:{fontSize:18}},'📅'),
          h('div',null,
            h('div',{style:{fontSize:14,fontWeight:700,color:'#f0fdf4'}},'Training Calendar'),
            h('div',{style:{fontSize:11,color:'#6b7280',marginTop:1}},
              trainedDays+' of 7 days this week'+(perfectWeek?' 🏆':''))
          )
        ),
        streak>0&&h('div',{style:{display:'flex',alignItems:'center',gap:4,
          background:streakAtRisk?'rgba(239,68,68,0.10)':'rgba(245,158,11,0.10)',
          border:'1px solid '+(streakAtRisk?'rgba(239,68,68,0.30)':'rgba(245,158,11,0.28)'),
          borderRadius:99,padding:'4px 10px',fontSize:12,fontWeight:700,
          color:streakAtRisk?'#f87171':'#f59e0b'}},
          h('span',null,streakAtRisk?'⚠️':'🔥'),
          h('span',null,' '+streak+'d')
        )
      ),

      // ── CURRENT WEEK — 7 large circles ───────────────────────
      h('div',{style:{padding:'14px 10px 10px'}},
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:12}},
          weekData.map(function(day) {
            var icons=day.trained?srcIcons(day.srcs):'';
            var circleBg,circleBorder,circleText,circleColor,shadow,anim;

            if(day.isFuture) {
              circleBg='rgba(22,27,34,0.6)';circleBorder='1.5px solid rgba(48,54,61,0.35)';
              circleText='';circleColor='#2d3744';shadow='none';anim='none';
            } else if(day.trained) {
              circleBg='linear-gradient(135deg,#16a34a,#0d9488)';
              circleBorder='2px solid rgba(22,163,74,0.45)';
              circleText='✓';circleColor='#fff';
              shadow='0 2px 10px rgba(22,163,74,0.35)';anim='none';
            } else if(day.isToday) {
              circleBg='rgba(245,158,11,0.04)';circleBorder='2.5px solid #f59e0b';
              circleText='●';circleColor='#f59e0b';shadow='none';
              anim='scRingPulse 2.2s ease-in-out infinite';
            } else {
              circleBg='rgba(239,68,68,0.03)';circleBorder='1.5px solid rgba(239,68,68,0.12)';
              circleText='';circleColor='#2d3744';shadow='none';anim='none';
            }

            var labelColor=day.isToday?'#f59e0b':day.trained?'#4ade80':day.isFuture?'#2d3744':'#4b5563';

            return h('div',{key:day.date,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:3}},
              // Day label
              h('div',{style:{fontSize:10,fontWeight:700,color:labelColor,
                textTransform:'uppercase',letterSpacing:'0.02em'}},day.label),
              // Circle
              h('div',{style:{width:36,height:36,borderRadius:'50%',
                background:circleBg,border:circleBorder,boxShadow:shadow,animation:anim,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:day.trained?14:13,color:circleColor,
                transition:'background 0.25s,box-shadow 0.25s'}},circleText),
              // Source icons
              h('div',{style:{fontSize:9,lineHeight:1.2,textAlign:'center',minHeight:13,letterSpacing:'-0.5px'}},icons),
              // XP label
              h('div',{style:{fontSize:9,fontWeight:700,textAlign:'center',minHeight:11,whiteSpace:'nowrap',
                color:day.xp>0?'#4ade80':day.isFuture?'transparent':day.isToday?'#484f58':'#2d333b'}},
                day.xp>0?'+'+day.xp:day.isToday?'train!':day.isFuture?'':'—')
            );
          })
        ),

        // Week progress bar
        h('div',{style:{padding:'0 4px'}},
          h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}},
            h('div',{style:{fontSize:11,color:'#8b949e'}},progressMsg),
            h('div',{style:{fontSize:11,fontWeight:700,color:perfectWeek?'#f59e0b':'#4ade80'}},weekPct+'%')
          ),
          h('div',{style:{height:5,borderRadius:99,background:'rgba(22,27,34,0.9)',overflow:'hidden'}},
            h('div',{style:{height:'100%',borderRadius:99,
              width:Math.min(weekPct,100)+'%',
              background:perfectWeek?'linear-gradient(to right,#f59e0b,#d97706)':'linear-gradient(to right,#16a34a,#0d9488)',
              transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)'}})
          )
        )
      ),

      // ── PREVIOUS 3 WEEKS HEATMAP ─────────────────────────────
      h('div',{style:{borderTop:'1px solid rgba(48,54,61,0.5)',padding:'10px 10px 12px'}},

        // Legend header
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
          h('div',{style:{fontSize:10,fontWeight:700,color:'#484f58',
            textTransform:'uppercase',letterSpacing:'0.08em'}},'Previous 3 weeks'),
          h('div',{style:{display:'flex',alignItems:'center',gap:3}},
            h('span',{style:{fontSize:9,color:'#374151',marginRight:3}},'Less'),
            ['rgba(25,32,40,0.8)','rgba(22,163,74,0.22)','rgba(22,163,74,0.50)','#16a34a'].map(function(bg,i){
              return h('div',{key:i,style:{width:10,height:10,borderRadius:2,background:bg}});
            }),
            h('span',{style:{fontSize:9,color:'#374151',marginLeft:3}},'More')
          )
        ),

        // 3 heatmap rows
        h('div',{style:{display:'flex',flexDirection:'column',gap:4}},
          prevWeekRows.map(function(row,ri){
            return h('div',{key:ri,style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}},
              row.map(function(ds){
                return h('div',{key:ds,title:ds+': '+(xpByDate[ds]||0)+' XP',style:{
                  height:16,borderRadius:3,background:heatBg(ds),transition:'background 0.2s'}});
              })
            );
          })
        ),

        // Stats row
        h('div',{style:{display:'flex',gap:8,marginTop:10}},
          [
            {val:streak===0?'—':streak+'d',      label:'Current',  color:streakAtRisk?'#f87171':'#f59e0b'},
            {val:bestStreak===0?'—':bestStreak+'d',label:'Best ever',color:'#8b5cf6'},
            {val:weekXP>0?weekXP.toLocaleString():'0',label:'Week XP',color:'#4ade80'},
          ].map(function(stat){
            return h('div',{key:stat.label,style:{flex:1,padding:'8px 6px',
              background:'rgba(22,27,34,0.85)',border:'1px solid rgba(48,54,61,0.6)',
              borderRadius:8,textAlign:'center'}},
              h('div',{style:{fontSize:16,fontWeight:800,color:stat.color,lineHeight:1}},stat.val),
              h('div',{style:{fontSize:9,fontWeight:700,color:'#484f58',
                textTransform:'uppercase',letterSpacing:'0.06em',marginTop:3}},stat.label)
            );
          })
        ),

        // Personalized insight card (only shown when pattern detected)
        insight&&h('div',{style:{marginTop:8,padding:'8px 10px',borderRadius:8,
          background:insight.color,border:'1px solid '+insight.border,
          display:'flex',alignItems:'flex-start',gap:7}},
          h('span',{style:{fontSize:14,flexShrink:0,lineHeight:1.4}},insight.icon),
          h('div',{style:{fontSize:11,color:insight.textColor,lineHeight:1.6}},insight.text)
        ),

        // Streak at risk — actionable warning with CTA
        streakAtRisk&&h('div',{style:{marginTop:8,padding:'9px 12px',borderRadius:8,
          background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.22)',
          display:'flex',alignItems:'center',gap:8}},
          h('span',{style:{fontSize:16}},'⚠️'),
          h('div',{style:{flex:1}},
            h('div',{style:{fontSize:12,fontWeight:700,color:'#f87171'}},streak+'-day streak at risk'),
            h('div',{style:{fontSize:11,color:'#6b7280'}},'Train anything today to protect it')
          ),
          h('button',{onClick:function(){nav('Drills');},
            style:{padding:'7px 12px',background:'#ef4444',color:'#fff',
              border:'none',borderRadius:7,fontSize:12,fontWeight:700,
              cursor:'pointer',flexShrink:0,fontFamily:'inherit'}},'Train →')
        )
      )
    )
  );
}

// ================================================================
// MAIN HOME PAGE
// ================================================================
function HomePage() {
  var [progress,       setProgress]       = useState(null);
  var [mission,        setMission]        = useState(null);
  var [weeklyGoal,     setWeeklyGoal]     = useState(200);
  var [xpLog,          setXpLog]          = useState([]);
  var [firstToast,     setFirstToast]     = useState(false);
  var [showRewardModal,setShowRewardModal] = useState(false);

  function reload() {
    setProgress(DB.getProgress()||{});
    setMission(A.generateTodaysMission?A.generateTodaysMission():null);
    setWeeklyGoal(DB.getWeeklyXPGoal?(DB.getWeeklyXPGoal()||200):200);
    setXpLog(DB.getXPLast7Days?DB.getXPLast7Days():[]);
  }

  useEffect(function(){
    reload();
    var onUpdate=function(){reload();};
    var onFirst=function(){setFirstToast(true);setTimeout(function(){setFirstToast(false);},2800);};
    var onOpen=function(){setShowRewardModal(true);};
    window.addEventListener('sc_update',onUpdate);
    window.addEventListener('sc_first_session',onFirst);
    window.addEventListener('sc_open_reward_modal',onOpen);
    return function(){
      window.removeEventListener('sc_update',onUpdate);
      window.removeEventListener('sc_first_session',onFirst);
      window.removeEventListener('sc_open_reward_modal',onOpen);
    };
  },[]);

  if(!progress) {
    return h('div',{style:{background:'#0d1117',minHeight:'100dvh',display:'flex',alignItems:'center',justifyContent:'center'}},
      h('div',{style:{textAlign:'center',color:'#6b7280'}},
        h('div',{style:{fontSize:40,marginBottom:12}},'🏏'),
        h('div',{style:{fontSize:14}},'Loading SmartCrick...')
      )
    );
  }

  var user      = DB.getUser?DB.getUser():{};
  var levelInfo = A.getLevelInfo?A.getLevelInfo(progress.total_xp||0)
    :{level:1,name:'Rookie',pct:0,xpToNext:500,next:null};
  var streak    = progress.current_streak||0;
  var mult      = streak>=30?1.5:streak>=14?1.3:streak>=7?1.2:streak>=3?1.1:1.0;
  var weekXP    = xpLog.reduce(function(s,d){return s+(d.xp||0);},0);
  var todayDate = new Date().toISOString().slice(0,10);
  var todayXP   = (xpLog.find(function(d){return d.date===todayDate;})||{xp:0}).xp;
  var greet     = (function(){var hr=new Date().getHours();return hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';})();

  // ✅ BUG FIX #3: levelInfo.next is {level,name,min,max}, NOT a string
  // Old code: levelInfo.next||'max level'  →  '[object Object]'
  // Fixed:    levelInfo.next?levelInfo.next.name:'max level'
  var nextLevelName = levelInfo.next?levelInfo.next.name:'max level';

  return h('div',{style:{background:'#0d1117',minHeight:'100dvh'}},

    // ── Hero: level + streak ──────────────────────────────────────
    h('div',{style:{padding:'16px 16px 12px',background:'linear-gradient(180deg,rgba(22,163,74,.07) 0%,transparent 100%)'}},
      h('div',{style:{marginBottom:12}},
        h('div',{style:{fontSize:13,color:'#9ca3af'}},greet+', '+(user.name||'Cricketer')+' 👋'),
        h('h1',{style:{fontSize:22,fontWeight:700,color:'#e5e7eb',margin:'4px 0 2px'}},"Today's Training"),
        h('div',{style:{fontSize:12,color:'#6b7280'}},
          new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}))
      ),
      h('div',{style:{display:'flex',gap:10}},
        h('div',{style:{flex:1,background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:12,padding:'12px'},
          role:'region','aria-label':'XP level progress'},
          h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:6}},
            h('span',{style:{fontSize:11,color:'#6b7280'}},'Level '+levelInfo.level),
            h('span',{style:{fontSize:11,color:'#4ade80',fontWeight:600}},(progress.total_xp||0).toLocaleString()+' XP')
          ),
          h('div',{style:{fontSize:14,fontWeight:600,color:'#e5e7eb',marginBottom:6}},levelInfo.name),
          h('div',{style:{height:4,background:'rgba(255,255,255,.08)',borderRadius:2,overflow:'hidden'},
            role:'progressbar','aria-valuenow':Math.round(levelInfo.pct||0),'aria-valuemin':0,'aria-valuemax':100},
            h('div',{style:{height:'100%',width:(levelInfo.pct||0)+'%',background:'#16a34a',borderRadius:2,transition:'width .5s'}})
          ),
          h('div',{style:{fontSize:10,color:'#4b5563',marginTop:4}},
            (levelInfo.xpToNext||0).toLocaleString()+' XP to '+nextLevelName)
        ),
        h('div',{style:{background:'rgba(245,158,11,.08)',border:'1px solid rgba(245,158,11,.2)',
          borderRadius:12,padding:'12px',minWidth:100,textAlign:'center'},
          role:'region','aria-label':streak+' day training streak'},
          h('div',{style:{fontSize:28,fontWeight:700,color:'#f59e0b',lineHeight:1.1}},streak),
          h('div',{style:{fontSize:11,color:'#f59e0b',fontWeight:500}},'day streak'),
          h('div',{style:{fontSize:18,marginTop:4},'aria-hidden':'true'},streak>0?'🔥':'💤')
        )
      )
    ),

    // ── XP Multiplier ─────────────────────────────────────────────
    h(MultiplierBanner,{streak:streak,multiplier:mult}),

    // ── FEATURE 1: TRAINING CALENDAR ──────────────────────────────
    h(StreakCalendarSection,{}),

    // ── FEATURE 2: DAILY CHALLENGE ────────────────────────────────
    // Loaded from app-daily-challenge.js (must appear before app-root.js in index.html)
    A.DailyChallengeCard?h(A.DailyChallengeCard,{}):null,

    // ── AI Recommendation ─────────────────────────────────────────
    h(AIRecommendCard,{}),

    // ── Daily Login Reward (mini widget) ──────────────────────────
    A.DailyRewardMiniWidget?h(A.DailyRewardMiniWidget,{
      onOpen:function(){window.dispatchEvent(new CustomEvent('sc_open_reward_modal'));}
    }):null,

    // ── Daily Spin ────────────────────────────────────────────────
    h(SpinWheelWidget,{}),

    // ── Daily Net quiz widget ─────────────────────────────────────
    A.DailyNetHomeWidget?h(A.DailyNetHomeWidget,{}):null,

    // ── Today's Mission ───────────────────────────────────────────
    mission&&h('div',{style:{margin:'0 16px 12px'}},
      h('div',{style:{background:'rgba(59,130,246,.08)',border:'1px solid rgba(59,130,246,.22)',borderRadius:14,padding:'14px 16px'},
        role:'region','aria-label':"Today's mission"},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:10}},
          h('div',{style:{fontSize:14,fontWeight:600,color:'#60a5fa'}},"📋 Today's Mission"),
          mission.reason&&h('div',{style:{marginLeft:'auto',fontSize:11,color:'#4b5563',fontStyle:'italic'}},mission.reason)
        ),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          mission.drillId&&h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
            background:'rgba(255,255,255,.04)',borderRadius:8}},
            h('div',{style:{width:20,height:20,borderRadius:4,flexShrink:0,
              background:mission.drillDone?'#16a34a':'rgba(255,255,255,.08)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff'}},
              mission.drillDone?'✓':'🎯'),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:12,fontWeight:500,color:mission.drillDone?'#6b7280':'#e5e7eb',
                textDecoration:mission.drillDone?'line-through':'none'}},
                (function(){var d=(A.DRILLS||[]).find(function(x){return x.id===mission.drillId;});return d?d.title:mission.drillId;})()),
              h('div',{style:{fontSize:11,color:'#6b7280'}},'Drill · +XP')
            ),
            !mission.drillDone&&h('button',{onClick:function(){nav('DrillDetail',{id:mission.drillId});},
              style:{padding:'5px 12px',background:'#1d4ed8',color:'#fff',border:'none',borderRadius:6,fontSize:11,cursor:'pointer'}},'→ Go')
          ),
          mission.mentalId&&h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',
            background:'rgba(255,255,255,.04)',borderRadius:8}},
            h('div',{style:{width:20,height:20,borderRadius:4,flexShrink:0,
              background:mission.mentalDone?'#8b5cf6':'rgba(255,255,255,.08)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff'}},
              mission.mentalDone?'✓':'🧠'),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:12,fontWeight:500,color:mission.mentalDone?'#6b7280':'#e5e7eb',
                textDecoration:mission.mentalDone?'line-through':'none'}},
                (function(){var m=(A.MENTAL_SESSIONS||[]).find(function(x){return x.id===mission.mentalId;});return m?m.title:mission.mentalId;})()),
              h('div',{style:{fontSize:11,color:'#6b7280'}},'Mental session · +XP')
            ),
            !mission.mentalDone&&h('button',{onClick:function(){nav('MentalPlayer',{id:mission.mentalId});},
              style:{padding:'5px 12px',background:'#7c3aed',color:'#fff',border:'none',borderRadius:6,fontSize:11,cursor:'pointer'}},'→ Go')
          )
        ),
        mission.drillDone&&mission.mentalDone&&h('div',{style:{marginTop:10,padding:'8px',
          background:'rgba(22,163,74,.1)',borderRadius:8,textAlign:'center',fontSize:12,color:'#4ade80',fontWeight:600},
          role:'status'},'✅ Mission complete! Brilliant work today 🏏')
      )
    ),

    // ── Weekly XP Goal ────────────────────────────────────────────
    h('div',{style:{margin:'0 16px 12px',padding:'14px 16px',background:'rgba(255,255,255,.04)',
      border:'1px solid rgba(255,255,255,.07)',borderRadius:14}},
      h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},
        h('div',{style:{fontSize:13,fontWeight:600,color:'#e5e7eb'}},'🎯 Weekly XP Goal'),
        h('div',{style:{fontSize:12,fontWeight:600,color:weekXP>=weeklyGoal?'#4ade80':'#f59e0b'}},
          weekXP.toLocaleString()+' / '+weeklyGoal.toLocaleString()+' XP')
      ),
      h('div',{style:{height:6,background:'rgba(255,255,255,.06)',borderRadius:3,overflow:'hidden',marginBottom:8},
        role:'progressbar','aria-valuenow':Math.min(Math.round((weekXP/weeklyGoal)*100),100),'aria-valuemin':0,'aria-valuemax':100},
        h('div',{style:{height:'100%',width:Math.min((weekXP/weeklyGoal)*100,100)+'%',
          background:weekXP>=weeklyGoal?'#4ade80':'#f59e0b',borderRadius:3,transition:'width .4s'}})
      ),
      h('div',{style:{display:'flex',gap:6}},
        [100,200,500].map(function(g){
          var sel=weeklyGoal===g;
          return h('button',{key:g,onClick:function(){
              if(DB.setWeeklyXPGoal)DB.setWeeklyXPGoal(g);setWeeklyGoal(g);
              window.dispatchEvent(new CustomEvent('sc_update'));
            },'aria-pressed':sel?'true':'false',
            style:{padding:'4px 12px',borderRadius:8,fontSize:11,cursor:'pointer',
              background:sel?'rgba(22,163,74,.15)':'rgba(255,255,255,.04)',
              border:'1px solid '+(sel?'rgba(22,163,74,.4)':'rgba(255,255,255,.08)'),
              color:sel?'#4ade80':'#6b7280',fontWeight:sel?600:400}},g+' XP');
        })
      )
    ),

    // ── Quick Start grid ──────────────────────────────────────────
    h('div',{style:{margin:'0 16px 12px'}},
      h('div',{style:{fontSize:13,fontWeight:600,color:'#e5e7eb',marginBottom:10}},'Quick Start'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
        [{label:'Drills',emoji:'🎯',page:'Drills',color:'#3b82f6'},
         {label:'Daily Net',emoji:'🏏',page:'DailyNet',color:'#4f46e5'},
         {label:'Mental',emoji:'🧠',page:'Mental',color:'#8b5cf6'},
         {label:'Fitness',emoji:'💪',page:'Fitness',color:'#10b981'},
         {label:'Schedule',emoji:'📅',page:'Schedule',color:'#f59e0b'},
         {label:'AI Coach',emoji:'🤖',page:'AICoach',color:'#14b8a6'},
         {label:'Progress',emoji:'📊',page:'Progress',color:'#6b7280'},
         {label:'Cricket DNA',emoji:'🧬',page:'CricketDNA',color:'#7c3aed'},
        ].map(function(item){
          return h('button',{key:item.page,onClick:function(){nav(item.page);},'aria-label':'Go to '+item.label,
            style:{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',cursor:'pointer',
              background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',
              borderLeft:'3px solid '+item.color,borderRadius:10,textAlign:'left'}},
            h('div',{style:{fontSize:20},'aria-hidden':'true'},item.emoji),
            h('div',{style:{fontSize:13,fontWeight:500,color:'#e5e7eb'}},item.label)
          );
        })
      )
    ),

    // ── Next level roadmap ────────────────────────────────────────
    h('div',{style:{margin:'0 16px 20px',padding:'12px 14px',
      background:'rgba(22,163,74,.06)',border:'1px solid rgba(22,163,74,.15)',borderRadius:12}},
      // ✅ BUG FIX applied here too
      h('div',{style:{fontSize:12,color:'#4ade80',fontWeight:600,marginBottom:4}},
        '🎮 Next Level: '+nextLevelName),
      h('div',{style:{fontSize:11,color:'#6b7280'}},
        (levelInfo.xpToNext||0).toLocaleString()+' XP needed · '+
        (todayXP>0
          ?'~'+Math.ceil((levelInfo.xpToNext||0)/todayXP)+" more days at today's pace"
          :'Start training to see your pace'))
    ),

    // ── Daily Reward Modal (re-open after AppShell dismissed) ─────
    (function(){
      if(!showRewardModal||!A.DailyRewardModal) return null;
      var state=A.getRewardState?A.getRewardState():{};
      var ts=new Date().toISOString().slice(0,10);
      if(state.lastClaimed!==ts||!state.weekDay) return null;
      var reward=(A.WEEKLY_REWARDS||[])[state.weekDay-1];
      if(!reward) return null;
      return h(A.DailyRewardModal,{reward:reward,state:state,onClose:function(){setShowRewardModal(false);}});
    })(),

    // ── First session toast ───────────────────────────────────────
    firstToast&&h('div',{role:'alert','aria-live':'assertive',
      style:{position:'fixed',bottom:90,left:16,right:16,zIndex:100,
        background:'#16a34a',borderRadius:12,padding:'14px 18px',
        boxShadow:'0 8px 32px rgba(22,163,74,.55)',display:'flex',alignItems:'center',gap:12}},
      h('div',{style:{fontSize:24},'aria-hidden':'true'},'🎉'),
      h('div',null,
        h('div',{style:{fontSize:14,fontWeight:700,color:'#fff'}},'First session complete!'),
        h('div',{style:{fontSize:12,color:'rgba(255,255,255,.8)'}},'SmartCrick Member badge earned!')
      )
    )
  );
}

// ── Brain.js neural recommendation engine ────────────────────────
(function initBrainJS(){
  function heuristicFallback(){
    A.getRecommendedCategory=function(){
      try{
        var dp=DB.getDrillProgress?DB.getDrillProgress():{};
        var DRILLS=A.DRILLS||[];
        var counts={batting:0,bowling:0,fielding:0,fitness:0,mental:0};
        Object.keys(dp).forEach(function(id){
          var d=DRILLS.find(function(x){return x.id===id;});
          if(d&&counts[d.category]!==undefined)counts[d.category]++;
        });
        return Object.keys(counts).reduce(function(a,b){return counts[a]<=counts[b]?a:b;});
      }catch(e){return 'batting';}
    };
    A.getRecommendedReason=function(cat){
      try{
        var dp=DB.getDrillProgress?DB.getDrillProgress():{};
        var DRILLS=A.DRILLS||[];
        var n=DRILLS.filter(function(d){return d.category===cat&&dp[d.id];}).length;
        return "You've done "+n+' '+cat+' drill'+(n===1?'':'s')+' — time to push further!';
      }catch(e){return 'Based on your training history';}
    };
  }

  try{
    if(typeof brain==='undefined'){heuristicFallback();return;}
    var net=new brain.NeuralNetwork({hiddenLayers:[12,8],activation:'sigmoid'});
    var TD=[
      {input:{bd:0.0,bw:0.8,fd:0.5,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4,lc:0.3},output:{batting:0.9,bowling:0.05,fielding:0.1,fitness:0.1,mental:0.2}},
      {input:{bd:0.8,bw:0.0,fd:0.5,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4,lc:0.1},output:{batting:0.1,bowling:0.9,fielding:0.1,fitness:0.1,mental:0.15}},
      {input:{bd:0.6,bw:0.7,fd:0.0,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4,lc:0.5},output:{batting:0.1,bowling:0.1,fielding:0.9,fitness:0.1,mental:0.15}},
      {input:{bd:0.5,bw:0.5,fd:0.5,st:0.2,ms:0.1,tod:0.7,dow:0.5,xw:0.2,lc:0.1},output:{batting:0.1,bowling:0.05,fielding:0.05,fitness:0.1,mental:0.9}},
      {input:{bd:0.6,bw:0.5,fd:0.5,st:0.8,ms:0.7,tod:0.3,dow:0.3,xw:0.7,lc:0.1},output:{batting:0.2,bowling:0.15,fielding:0.15,fitness:0.85,mental:0.1}},
      {input:{bd:0.3,bw:0.3,fd:0.3,st:0.0,ms:0.5,tod:0.4,dow:0.2,xw:0.0,lc:0.5},output:{batting:0.85,bowling:0.15,fielding:0.1,fitness:0.1,mental:0.3}},
    ];
    net.train(TD,{iterations:800,errorThresh:0.005,log:false});
    var REASONS={
      batting:['Your batting needs the most work right now','Cover drive practice will sharpen your footwork'],
      bowling:['Your bowling drills are behind — time to fix that','Line and length awaits'],
      fielding:['Fielding wins matches — work on it today','Sharp ground fielding saves runs'],
      fitness:['Cricket fitness is the foundation — prioritise it','Conditioning work will improve everything'],
      mental:['Mental prep separates good players from great ones','A focused mind scores more runs'],
    };
    A.getRecommendedCategory=function(){
      try{
        var p=DB.getProgress()||{},dp=DB.getDrillProgress?DB.getDrillProgress():{},DRILLS=A.DRILLS||[];
        var cats={batting:0,bowling:0,fielding:0,fitness:0,mental:0};
        Object.keys(dp).forEach(function(id){var d=DRILLS.find(function(x){return x.id===id;});if(d&&cats[d.category]!==undefined)cats[d.category]++;});
        var xpLog=DB.getXPLast7Days?DB.getXPLast7Days():[];
        var weekXP=xpLog.reduce(function(s,d){return s+(d.xp||0);},0);
        var mScore=A.calcMentalFitnessScore?A.calcMentalFitnessScore():50;
        var streak=p.current_streak||0;
        var lastLog=DB.getXPLog?DB.getXPLog():[],lastCat=0.5;
        if(lastLog.length>0){var l=lastLog[lastLog.length-1];var cm={drill:0.1,batting:0.1,bowling:0.3,fielding:0.5,fitness:0.7,mental:0.9};lastCat=cm[l.source]||0.5;}
        var out=net.run({bd:Math.min(cats.batting,10)/10,bw:Math.min(cats.bowling,10)/10,fd:Math.min(cats.fielding,6)/6,st:Math.min(streak,30)/30,ms:mScore/100,tod:new Date().getHours()/24,dow:new Date().getDay()/7,xw:Math.min(weekXP,500)/500,lc:lastCat});
        return ['batting','bowling','fielding','fitness','mental'].reduce(function(a,b){return (out[a]||0)>=(out[b]||0)?a:b;});
      }catch(e){return 'batting';}
    };
    A.getRecommendedReason=function(cat){
      var pool=REASONS[cat]||REASONS.batting;
      return pool[Math.floor(Math.random()*pool.length)];
    };
    console.log('[SC] Brain.js trained');
  }catch(err){
    console.warn('[SC] Brain.js fallback:',err.message);
    heuristicFallback();
  }
})();

A.HomePage = HomePage;
console.log('[SC] app-home.js v5.0 — single IIFE, bugs fixed, training calendar feature live');
})();