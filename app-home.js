// app-home.js v4.1 — FIXED:
// 1. "[object Object]" bug in level display → uses levelInfo.next.name
// 2. Daily Reward mini-widget inserted below hero section
// 3. Desktop-aware padding
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var Fragment = React.Fragment;
var A = window.SC_APP;
var DB = A.DB;
var nav = A.nav;

// ── Spin prizes ──────────────────────────────────────────────────
var SPIN_PRIZES = [
  { xp:25,  weight:30, label:'+25 XP',     color:'#3b82f6' },
  { xp:50,  weight:25, label:'+50 XP!',    color:'#10b981' },
  { xp:100, weight:20, label:'+100 XP!!',  color:'#f59e0b' },
  { xp:10,  weight:15, label:'+10 XP',     color:'#8b5cf6' },
  { xp:200, weight:8,  label:'+200 XP!!!', color:'#ef4444' },
  { xp:500, weight:2,  label:'JACKPOT!',   color:'#ffd700' },
];

function weightedRandom(prizes) {
  var total = prizes.reduce(function(s, p) { return s + p.weight; }, 0);
  var r = Math.random() * total, cum = 0;
  for (var i = 0; i < prizes.length; i++) { cum += prizes[i].weight; if (r < cum) return i; }
  return prizes.length - 1;
}

function buildSegments(prizes) {
  var total = prizes.reduce(function(s, p) { return s + p.weight; }, 0);
  var segs = [], angle = 0;
  prizes.forEach(function(p) {
    var sweep = (p.weight / total) * 360;
    segs.push({ startAngle:angle, sweep:sweep, midAngle:angle+sweep/2, color:p.color, label:p.label, xp:p.xp });
    angle += sweep;
  });
  return segs;
}

function polarXY(cx, cy, r, deg) {
  var rad = (deg - 90) * Math.PI / 180;
  return { x:cx+r*Math.cos(rad), y:cy+r*Math.sin(rad) };
}

// ── Spin Wheel Widget ────────────────────────────────────────────
function SpinWheelWidget() {
  var today = new Date().toISOString().slice(0, 10);
  var alreadySpun = DB.get('last_spin_date') === today;
  var savedPrize  = DB.get('last_spin_prize') || null;
  var [spinning,   setSpinning]   = useState(false);
  var [rotation,   setRotation]   = useState(0);
  var [result,     setResult]     = useState(null);
  var [spunToday,  setSpunToday]  = useState(alreadySpun);
  var [todayPrize, setTodayPrize] = useState(savedPrize);
  var [expanded,   setExpanded]   = useState(false);
  var rotRef = useRef(0);
  var segs   = buildSegments(SPIN_PRIZES);
  var cx = 100, cy = 100, r = 88;

  function getTargetAngle(prizeIdx) {
    var seg = segs[prizeIdx];
    var currentBase  = rotRef.current % 360;
    var extraSpins   = (5 + Math.floor(Math.random() * 3)) * 360;
    var toTop        = (360 - seg.midAngle + 360) % 360;
    return currentBase + extraSpins + toTop;
  }

  function handleSpin() {
    if (spinning || spunToday) return;
    var prizeIdx   = weightedRandom(SPIN_PRIZES);
    var winner     = SPIN_PRIZES[prizeIdx];
    var finalAngle = getTargetAngle(prizeIdx);
    var startAngle = rotRef.current, startTime = null, duration = 3200;
    setSpinning(true); setResult(null);
    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed  = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      var cur      = startAngle + (finalAngle - startAngle) * eased;
      rotRef.current = cur; setRotation(cur);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        rotRef.current = finalAngle; setRotation(finalAngle);
        setSpinning(false); setResult(winner); setSpunToday(true); setTodayPrize(winner);
        DB.set('last_spin_date', today); DB.set('last_spin_prize', winner);
        if (A.awardXP) A.awardXP(winner.xp, 0, 'spin_wheel', null, null);
        if (winner.xp >= 200 && A.fireConfetti) A.fireConfetti();
        window.dispatchEvent(new CustomEvent('sc_update'));
      }
    }
    requestAnimationFrame(frame);
  }

  function timeUntilMidnight() {
    var now = new Date(), mn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var d = mn - now;
    return Math.floor(d / 3600000) + 'h ' + Math.floor((d % 3600000) / 60000) + 'm';
  }

  if (!expanded) {
    return h('div', {
      role:'button', tabIndex:0,
      'aria-label': spunToday ? 'Daily spin used' : 'Open daily spin wheel',
      onClick:function(){ setExpanded(true); },
      onKeyDown:function(e){ if(e.key==='Enter'||e.key===' ')setExpanded(true); },
      style:{ margin:'0 16px 12px', cursor:'pointer', outline:'none' },
    },
      h('div', { style:{
        padding:'11px 16px', borderRadius:12,
        background: spunToday ? 'rgba(255,255,255,.03)' : 'linear-gradient(135deg,rgba(245,158,11,.1),rgba(239,68,68,.08))',
        border:'1px solid '+(spunToday?'rgba(255,255,255,.07)':'rgba(245,158,11,.3)'),
        display:'flex', alignItems:'center', gap:10,
      }},
        h('div', { style:{ fontSize:22 }, 'aria-hidden':'true' }, spunToday ? '✅' : '🎰'),
        h('div', { style:{ flex:1 } },
          h('div', { style:{ fontSize:13, fontWeight:600, color:spunToday?'#6b7280':'#e5e7eb' } },
            spunToday ? 'Daily Spin Used' : 'Daily Bonus Spin'),
          h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:2 } },
            spunToday
              ? 'Won '+(todayPrize?todayPrize.label:'')+' · Next in '+timeUntilMidnight()
              : 'Spin for up to 500 bonus XP — once per day')
        ),
        !spunToday && h('span', { style:{ fontSize:13, fontWeight:600, color:'#f59e0b' } }, 'Spin →')
      )
    );
  }

  return h('div', { style:{
    margin:'0 16px 12px', padding:'20px 16px',
    background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:14,
  }},
    h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 } },
      h('div', { style:{ fontSize:14, fontWeight:600, color:'#e5e7eb' } }, '🎰 Daily Bonus Spin'),
      h('button', {
        onClick:function(){ setExpanded(false); },
        'aria-label':'Close spin wheel',
        style:{ background:'none', border:'none', color:'#6b7280', fontSize:20, cursor:'pointer', padding:'0 4px' }
      }, '×')
    ),
    h('div', { style:{ position:'relative', width:200, height:200, margin:'0 auto 16px' } },
      h('div', { 'aria-hidden':'true', style:{
        position:'absolute', top:-8, left:'50%', transform:'translateX(-50%)',
        width:0, height:0,
        borderLeft:'9px solid transparent', borderRight:'9px solid transparent',
        borderTop:'18px solid #16a34a',
        filter:'drop-shadow(0 2px 6px rgba(22,163,74,.6))', zIndex:2,
      }}),
      h('svg', {
        width:200, height:200, viewBox:'0 0 200 200',
        role:'img', 'aria-label':'Spin wheel',
        style:{
          display:'block',
          transform:'rotate('+rotation+'deg)',
          transformOrigin:'100px 100px',
          willChange:'transform',
        }
      },
        segs.map(function(seg, i) {
          var start = polarXY(cx,cy,r,seg.startAngle);
          var end   = polarXY(cx,cy,r,seg.startAngle+seg.sweep);
          var large = seg.sweep > 180 ? 1 : 0;
          var d = 'M '+cx+' '+cy+' L '+start.x.toFixed(1)+' '+start.y.toFixed(1)+
                  ' A '+r+' '+r+' 0 '+large+' 1 '+end.x.toFixed(1)+' '+end.y.toFixed(1)+' Z';
          var mid = polarXY(cx,cy,r*0.65,seg.midAngle);
          return h('g', { key:i },
            h('path', { d:d, fill:seg.color, stroke:'#0d1117', strokeWidth:2.5 }),
            h('text', {
              x:mid.x, y:mid.y, textAnchor:'middle', dominantBaseline:'central',
              fontSize:seg.xp>=200?8:9, fontWeight:700, fill:'#fff',
              transform:'rotate('+seg.midAngle+','+mid.x+','+mid.y+')',
              style:{ userSelect:'none' }
            }, seg.label)
          );
        }),
        h('circle', { cx:cx, cy:cy, r:14, fill:'#111827', stroke:'#16a34a', strokeWidth:2 }),
        h('text', { x:cx, y:cy, textAnchor:'middle', dominantBaseline:'central', fontSize:12, fill:'#16a34a', fontWeight:700 }, '🏏')
      )
    ),
    result
      ? h('div', { style:{ textAlign:'center' }, role:'status', 'aria-live':'polite' },
          h('div', { style:{ fontSize:28, fontWeight:700, color:result.color, marginBottom:6 } }, result.label),
          h('div', { style:{ fontSize:13, color:'#9ca3af' } }, 'XP added! Come back tomorrow.'),
          h('button', {
            onClick:function(){ setExpanded(false); },
            style:{ marginTop:10, padding:'8px 24px', background:'rgba(255,255,255,.06)', border:'none', borderRadius:8, color:'#9ca3af', cursor:'pointer', fontSize:12 }
          }, 'Close')
        )
      : spunToday
        ? h('div', { style:{ textAlign:'center' } },
            h('div', { style:{ fontSize:13, color:'#6b7280' } }, 'Already spun today!'),
            todayPrize && h('div', { style:{ fontSize:22, fontWeight:700, color:todayPrize.color, marginTop:4 } }, 'You won '+todayPrize.label),
            h('div', { style:{ fontSize:12, color:'#4b5563', marginTop:4 } }, 'Next spin in '+timeUntilMidnight())
          )
        : h('div', { style:{ textAlign:'center' } },
            h('button', {
              onClick:handleSpin, disabled:spinning,
              'aria-label':'Spin the wheel',
              style:{
                padding:'13px 40px', border:'none', borderRadius:12,
                background: spinning ? 'rgba(255,255,255,.06)' : 'linear-gradient(135deg,#f59e0b,#ef4444)',
                color:'#fff', fontSize:16, fontWeight:700,
                cursor:spinning?'not-allowed':'pointer',
                boxShadow:spinning?'none':'0 4px 18px rgba(245,158,11,.45)',
              }
            }, spinning ? '🌀 Spinning...' : '🎰 SPIN!'),
            h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:8 } }, 'Win up to 500 bonus XP — once per day')
          )
  );
}

// ── AI Recommend Card ─────────────────────────────────────────────
function AIRecommendCard() {
  var [rec, setRec]       = useState(null);
  var [reason, setReason] = useState('');
  var [drill, setDrill]   = useState(null);

  useEffect(function() {
    try {
      var cat  = A.getRecommendedCategory ? A.getRecommendedCategory() : 'batting';
      var text = A.getRecommendedReason   ? A.getRecommendedReason(cat) : 'Based on your training history';
      setRec(cat); setReason(text);
      var DRILLS = A.DRILLS || [], dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
      var uLevel = ((DB.getUser ? DB.getUser() : {}).level || '').toLowerCase();
      var skill  = (uLevel==='elite'||uLevel==='state') ? 'advanced' : uLevel==='district' ? 'intermediate' : 'beginner';
      var catDrills = DRILLS.filter(function(d){ return d.category===cat; });
      var undone    = catDrills.filter(function(d){ return !dp[d.id]; });
      var pick      = undone.find(function(d){ return d.skill_level===skill; }) || undone[0] || catDrills[0];
      setDrill(pick || null);
    } catch(e) { console.warn('[SC] AI card:', e); }
  }, []);

  if (!rec || !drill) return null;

  var CFG = {
    batting:       { emoji:'🏏', color:'#3b82f6', label:'Batting'  },
    bowling:       { emoji:'🎳', color:'#ef4444', label:'Bowling'  },
    fielding:      { emoji:'🤸', color:'#10b981', label:'Fielding' },
    fitness:       { emoji:'💪', color:'#f59e0b', label:'Fitness'  },
    mental:        { emoji:'🧠', color:'#8b5cf6', label:'Mental'   },
    wicketkeeping: { emoji:'🧤', color:'#14b8a6', label:'Keeping'  },
  };
  var cfg = CFG[rec] || CFG.batting;

  return h('div', { style:{
    margin:'0 16px 12px', padding:'14px 16px', borderRadius:14,
    background:'linear-gradient(135deg,'+cfg.color+'10,'+cfg.color+'06)',
    border:'1px solid '+cfg.color+'35',
  }},
    h('div', { style:{ display:'flex', alignItems:'center', gap:8, marginBottom:10 } },
      h('div', { style:{ fontSize:14, fontWeight:600, color:cfg.color } }, '🤖 AI Recommends Today'),
      h('span', { style:{
        marginLeft:'auto', fontSize:11, color:cfg.color,
        background:cfg.color+'18', padding:'2px 8px', borderRadius:10, border:'1px solid '+cfg.color+'30',
      } }, cfg.label)
    ),
    h('div', { style:{ display:'flex', gap:12, alignItems:'flex-start' } },
      h('div', { style:{ fontSize:32, lineHeight:1, flexShrink:0 }, 'aria-hidden':'true' }, cfg.emoji),
      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:14, fontWeight:600, color:'#e5e7eb', marginBottom:3 } }, drill.title),
        h('div', { style:{ fontSize:12, color:'#9ca3af', lineHeight:1.45, marginBottom:9 } }, reason),
        h('button', {
          onClick:function(){ nav('DrillDetail',{ id:drill.id }); },
          'aria-label':'Start '+drill.title,
          style:{
            padding:'8px 18px', border:'none', borderRadius:8,
            background:cfg.color, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer',
          },
        }, '→ Start drill')
      )
    )
  );
}

// ── XP Multiplier Banner ─────────────────────────────────────────
function MultiplierBanner(props) {
  var streak = props.streak||0, mult = props.multiplier||1.0;
  if (mult <= 1.0) return null;
  var clr = mult>=1.5?'#ef4444':mult>=1.3?'#f59e0b':'#16a34a';
  return h('div', {
    role:'status', 'aria-label':mult+'x XP multiplier active',
    style:{
      margin:'0 16px 10px', padding:'9px 14px', borderRadius:10,
      background:clr+'12', border:'1px solid '+clr+'30',
      display:'flex', alignItems:'center', gap:10,
    }
  },
    h('div', { style:{ fontSize:20 }, 'aria-hidden':'true' }, '🔥'),
    h('div', { style:{ flex:1 } },
      h('div', { style:{ fontSize:12, fontWeight:700, color:clr } }, mult+'× XP Multiplier Active'),
      h('div', { style:{ fontSize:11, color:'#6b7280' } }, streak+'-day streak · Every XP earned is boosted!')
    )
  );
}

// ── HOME PAGE ────────────────────────────────────────────────────
function HomePage() {
  var [progress,   setProgress]   = useState(null);
  var [mission,    setMission]    = useState(null);
  var [weeklyGoal, setWeeklyGoal] = useState(200);
  var [xpLog,      setXpLog]      = useState([]);
  var [firstToast, setFirstToast] = useState(false);

  // Daily reward widget state
  var [showRewardModal, setShowRewardModal] = useState(false);

  function reload() {
    setProgress(DB.getProgress() || {});
    setMission(A.generateTodaysMission ? A.generateTodaysMission() : null);
    setWeeklyGoal(DB.getWeeklyXPGoal ? (DB.getWeeklyXPGoal()||200) : 200);
    setXpLog(DB.getXPLast7Days ? DB.getXPLast7Days() : []);
  }

  useEffect(function() {
    reload();
    var onUpdate = function() { reload(); };
    var onFirst  = function() { setFirstToast(true); setTimeout(function(){ setFirstToast(false); }, 2800); };
    window.addEventListener('sc_update', onUpdate);
    window.addEventListener('sc_first_session', onFirst);
    return function() {
      window.removeEventListener('sc_update', onUpdate);
      window.removeEventListener('sc_first_session', onFirst);
    };
  }, []);

  if (!progress) {
    return h('div', { style:{ background:'#0d1117', minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center' } },
      h('div', { style:{ textAlign:'center', color:'#6b7280' } },
        h('div', { style:{ fontSize:40, marginBottom:12 } }, '🏏'),
        h('div', { style:{ fontSize:14 } }, 'Loading SmartCrick...')
      )
    );
  }

  var user      = DB.getUser ? DB.getUser() : {};
  var levelInfo = A.getLevelInfo ? A.getLevelInfo(progress.total_xp||0)
    : { level:1, name:'Rookie', pct:0, xpToNext:500, next:null };
  var streak    = progress.current_streak || 0;
  var mult      = streak>=30?1.5:streak>=14?1.3:streak>=7?1.2:streak>=3?1.1:1.0;
  var weekXP    = xpLog.reduce(function(s,d){ return s+(d.xp||0); }, 0);
  var todayDate = new Date().toISOString().slice(0, 10);
  var todayXP   = (xpLog.find(function(d){ return d.date===todayDate; })||{ xp:0 }).xp;
  var greet     = (function(){ var hr=new Date().getHours(); return hr<12?'Good morning':hr<17?'Good afternoon':'Good evening'; })();

  // ── BUG FIX: levelInfo.next is an object, not a string ─────────
  // Use levelInfo.next.name, not levelInfo.next directly
  var nextLevelName = levelInfo.next ? levelInfo.next.name : null;

  // Momentum bars
  var momentum = (function(){
    var arr=[];
    for(var i=9;i>=0;i--){
      var d=new Date(); d.setDate(d.getDate()-i);
      var ds=d.toISOString().slice(0,10);
      var e=xpLog.find(function(x){ return x.date===ds; });
      arr.push({ date:ds, xp:e?e.xp:0, isToday:i===0 });
    }
    return arr;
  })();
  var maxMomentum = Math.max.apply(null, momentum.map(function(d){ return d.xp; }).concat([1]));

  return h('div', { style:{ background:'#0d1117', minHeight:'100dvh' } },

    // ── Hero / level + streak ───────────────────────────────────
    h('div', { style:{ padding:'16px 16px 12px', background:'linear-gradient(180deg,rgba(22,163,74,.07) 0%,transparent 100%)' } },
      h('div', { style:{ marginBottom:12 } },
        h('div', { style:{ fontSize:13, color:'#9ca3af' } }, greet+', '+(user.name||'Cricketer')+' 👋'),
        h('h1', { style:{ fontSize:22, fontWeight:700, color:'#e5e7eb', margin:'4px 0 2px' } }, "Today's Training"),
        h('div', { style:{ fontSize:12, color:'#6b7280' } },
          new Date().toLocaleDateString('en-GB',{ weekday:'long', day:'numeric', month:'long' }))
      ),
      h('div', { style:{ display:'flex', gap:10 } },
        // Level card
        h('div', {
          style:{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:12, padding:'12px' },
          role:'region', 'aria-label':'XP level progress',
        },
          h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:6 } },
            h('span', { style:{ fontSize:11, color:'#6b7280' } }, 'Level '+levelInfo.level),
            h('span', { style:{ fontSize:11, color:'#4ade80', fontWeight:600 } }, (progress.total_xp||0).toLocaleString()+' XP')
          ),
          h('div', { style:{ fontSize:14, fontWeight:600, color:'#e5e7eb', marginBottom:6 } }, levelInfo.name),
          h('div', {
            style:{ height:4, background:'rgba(255,255,255,.08)', borderRadius:2, overflow:'hidden' },
            role:'progressbar', 'aria-valuenow':Math.round(levelInfo.pct||0), 'aria-valuemin':0, 'aria-valuemax':100,
          },
            h('div', { style:{ height:'100%', width:(levelInfo.pct||0)+'%', background:'#16a34a', borderRadius:2, transition:'width .5s' } })
          ),
          // ── FIXED: was (levelInfo.next || 'max level') which → "[object Object]"
          h('div', { style:{ fontSize:10, color:'#4b5563', marginTop:4 } },
            (levelInfo.xpToNext||0).toLocaleString()+' XP to '+(nextLevelName||'max level'))
        ),
        // Streak card
        h('div', {
          style:{ background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)', borderRadius:12, padding:'12px', minWidth:100, textAlign:'center' },
          role:'region', 'aria-label':streak+' day training streak',
        },
          h('div', { style:{ fontSize:28, fontWeight:700, color:'#f59e0b', lineHeight:1.1 } }, streak),
          h('div', { style:{ fontSize:11, color:'#f59e0b', fontWeight:500 } }, 'day streak'),
          h('div', { style:{ fontSize:18, marginTop:4 }, 'aria-hidden':'true' }, streak>0?'🔥':'💤')
        )
      )
    ),

    // ── XP Multiplier ───────────────────────────────────────────
    h(MultiplierBanner, { streak:streak, multiplier:mult }),

    // ── AI Drill Recommendation ─────────────────────────────────
    h(AIRecommendCard, {}),

    // ── DAILY LOGIN REWARD (new) ────────────────────────────────
    A.DailyRewardMiniWidget
      ? h(A.DailyRewardMiniWidget, {
          onOpen: function() { setShowRewardModal(true); }
        })
      : null,

    // ── Daily Spin ───────────────────────────────────────────────
    h(SpinWheelWidget, {}),

    // ── Daily Net widget ─────────────────────────────────────────
    A.DailyNetHomeWidget ? h(A.DailyNetHomeWidget, {}) : null,

    // ── Today's Mission ──────────────────────────────────────────
    mission && h('div', { style:{ margin:'0 16px 12px' } },
      h('div', {
        style:{ background:'rgba(59,130,246,.08)', border:'1px solid rgba(59,130,246,.22)', borderRadius:14, padding:'14px 16px' },
        role:'region', 'aria-label':"Today's mission",
      },
        h('div', { style:{ display:'flex', alignItems:'center', gap:8, marginBottom:10 } },
          h('div', { style:{ fontSize:14, fontWeight:600, color:'#60a5fa' } }, "📋 Today's Mission"),
          mission.reason && h('div', { style:{ marginLeft:'auto', fontSize:11, color:'#4b5563', fontStyle:'italic' } }, mission.reason)
        ),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
          mission.drillId && h('div', { style:{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(255,255,255,.04)', borderRadius:8 } },
            h('div', { style:{ width:20, height:20, borderRadius:4, flexShrink:0, background:mission.drillDone?'#16a34a':'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff' } },
              mission.drillDone?'✓':'🎯'),
            h('div', { style:{ flex:1 } },
              h('div', { style:{ fontSize:12, fontWeight:500, color:mission.drillDone?'#6b7280':'#e5e7eb', textDecoration:mission.drillDone?'line-through':'none' } },
                (function(){ var d=(A.DRILLS||[]).find(function(x){ return x.id===mission.drillId; }); return d?d.title:mission.drillId; })()),
              h('div', { style:{ fontSize:11, color:'#6b7280' } }, 'Drill · +XP')
            ),
            !mission.drillDone && h('button', {
              onClick:function(){ nav('DrillDetail',{ id:mission.drillId }); },
              'aria-label':'Start drill',
              style:{ padding:'5px 12px', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:6, fontSize:11, cursor:'pointer' }
            }, '→ Go')
          ),
          mission.mentalId && h('div', { style:{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'rgba(255,255,255,.04)', borderRadius:8 } },
            h('div', { style:{ width:20, height:20, borderRadius:4, flexShrink:0, background:mission.mentalDone?'#8b5cf6':'rgba(255,255,255,.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff' } },
              mission.mentalDone?'✓':'🧠'),
            h('div', { style:{ flex:1 } },
              h('div', { style:{ fontSize:12, fontWeight:500, color:mission.mentalDone?'#6b7280':'#e5e7eb', textDecoration:mission.mentalDone?'line-through':'none' } },
                (function(){ var m=(A.MENTAL_SESSIONS||[]).find(function(x){ return x.id===mission.mentalId; }); return m?m.title:mission.mentalId; })()),
              h('div', { style:{ fontSize:11, color:'#6b7280' } }, 'Mental session · +XP')
            ),
            !mission.mentalDone && h('button', {
              onClick:function(){ nav('MentalPlayer',{ id:mission.mentalId }); },
              'aria-label':'Start mental session',
              style:{ padding:'5px 12px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:6, fontSize:11, cursor:'pointer' }
            }, '→ Go')
          )
        ),
        mission.drillDone && mission.mentalDone && h('div', {
          style:{ marginTop:10, padding:'8px', background:'rgba(22,163,74,.1)', borderRadius:8, textAlign:'center', fontSize:12, color:'#4ade80', fontWeight:600 },
          role:'status',
        }, '✅ Mission complete! Brilliant work today 🏏')
      )
    ),

    // ── Weekly XP Goal ───────────────────────────────────────────
    h('div', { style:{ margin:'0 16px 12px', padding:'14px 16px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14 } },
      h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 } },
        h('div', { style:{ fontSize:13, fontWeight:600, color:'#e5e7eb' } }, '🎯 Weekly XP Goal'),
        h('div', { style:{ fontSize:12, fontWeight:600, color:weekXP>=weeklyGoal?'#4ade80':'#f59e0b' } },
          weekXP.toLocaleString()+' / '+weeklyGoal.toLocaleString()+' XP')
      ),
      h('div', {
        style:{ height:6, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden', marginBottom:8 },
        role:'progressbar',
        'aria-valuenow':Math.min(Math.round((weekXP/weeklyGoal)*100),100),
        'aria-valuemin':0, 'aria-valuemax':100,
      },
        h('div', { style:{ height:'100%', width:Math.min((weekXP/weeklyGoal)*100,100)+'%', background:weekXP>=weeklyGoal?'#4ade80':'#f59e0b', borderRadius:3, transition:'width .4s' } })
      ),
      h('div', { style:{ display:'flex', gap:6 } },
        [100,200,500].map(function(g){
          var sel = weeklyGoal===g;
          return h('button', {
            key:g,
            onClick:function(){ if(DB.setWeeklyXPGoal) DB.setWeeklyXPGoal(g); setWeeklyGoal(g); window.dispatchEvent(new CustomEvent('sc_update')); },
            'aria-pressed':sel?'true':'false',
            style:{
              padding:'4px 12px', borderRadius:8, fontSize:11, cursor:'pointer',
              background:sel?'rgba(22,163,74,.15)':'rgba(255,255,255,.04)',
              border:'1px solid '+(sel?'rgba(22,163,74,.4)':'rgba(255,255,255,.08)'),
              color:sel?'#4ade80':'#6b7280', fontWeight:sel?600:400,
            }
          }, g+' XP');
        })
      )
    ),

    // ── Training Momentum ────────────────────────────────────────
    h('div', { style:{ margin:'0 16px 12px', padding:'14px 16px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14 } },
      h('div', { style:{ fontSize:13, fontWeight:600, color:'#e5e7eb', marginBottom:10 } }, '⚡ Training Momentum'),
      h('div', {
        style:{ display:'flex', gap:3, alignItems:'flex-end', height:40 },
        role:'img', 'aria-label':'Last 10 days training activity',
      },
        momentum.map(function(d,i){
          var bar = maxMomentum>0 ? Math.max((d.xp/maxMomentum)*38, d.xp>0?4:2) : 2;
          var clr = d.xp>300?'#4ade80':d.xp>100?'#16a34a':d.xp>0?'#166534':'rgba(255,255,255,.06)';
          return h('div', { key:d.date, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 } },
            h('div', { style:{ width:'100%', height:bar+'px', background:clr, borderRadius:3, border:d.isToday?'1px solid #4ade80':'none' }, title:d.date+': '+d.xp+' XP' }),
            d.isToday && h('div', { style:{ fontSize:8, color:'#4ade80' }, 'aria-hidden':'true' }, '▲')
          );
        })
      ),
      h('div', { style:{ display:'flex', justifyContent:'space-between', marginTop:4 } },
        h('span', { style:{ fontSize:10, color:'#4b5563' } }, '10 days ago'),
        h('span', { style:{ fontSize:10, color:'#4b5563' } }, 'Today')
      )
    ),

    // ── Quick Start grid ─────────────────────────────────────────
    h('div', { style:{ margin:'0 16px 12px' } },
      h('div', { style:{ fontSize:13, fontWeight:600, color:'#e5e7eb', marginBottom:10 } }, 'Quick Start'),
      h('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 } },
        [
          { label:'Drills',      emoji:'🎯', page:'Drills',     color:'#3b82f6' },
          { label:'Daily Net',   emoji:'🏏', page:'DailyNet',   color:'#4f46e5' },
          { label:'Mental',      emoji:'🧠', page:'Mental',     color:'#8b5cf6' },
          { label:'Fitness',     emoji:'💪', page:'Fitness',    color:'#10b981' },
          { label:'Schedule',    emoji:'📅', page:'Schedule',   color:'#f59e0b' },
          { label:'AI Coach',    emoji:'🤖', page:'AICoach',    color:'#14b8a6' },
          { label:'Progress',    emoji:'📊', page:'Progress',   color:'#6b7280' },
          { label:'Cricket DNA', emoji:'🧬', page:'CricketDNA', color:'#7c3aed' },
        ].map(function(item){
          return h('button', {
            key:item.page,
            onClick:function(){ nav(item.page); },
            'aria-label':'Go to '+item.label,
            style:{
              display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
              cursor:'pointer', background:'rgba(255,255,255,.04)',
              border:'1px solid rgba(255,255,255,.07)',
              borderLeft:'3px solid '+item.color, borderRadius:10, textAlign:'left',
            },
            onFocus:function(e){ e.currentTarget.style.boxShadow='0 0 0 2px '+item.color+'40'; },
            onBlur:function(e){ e.currentTarget.style.boxShadow='none'; },
          },
            h('div', { style:{ fontSize:20 }, 'aria-hidden':'true' }, item.emoji),
            h('div', { style:{ fontSize:13, fontWeight:500, color:'#e5e7eb' } }, item.label)
          );
        })
      )
    ),

    // ── Next level roadmap ────────────────────────────────────────
    h('div', { style:{ margin:'0 16px 20px', padding:'12px 14px', background:'rgba(22,163,74,.06)', border:'1px solid rgba(22,163,74,.15)', borderRadius:12 } },
      h('div', { style:{ fontSize:12, color:'#4ade80', fontWeight:600, marginBottom:4 } },
        '🎮 Next Level: '+(nextLevelName||'Legend')),
      h('div', { style:{ fontSize:11, color:'#6b7280' } },
        (levelInfo.xpToNext||0).toLocaleString()+' XP needed · '+
        (todayXP>0
          ? '~'+Math.ceil((levelInfo.xpToNext||0)/todayXP)+" more days at today's pace"
          : 'Start training to see your pace'))
    ),

    // ── First session toast ──────────────────────────────────────
    firstToast && h('div', {
      role:'alert', 'aria-live':'assertive',
      style:{
        position:'fixed', bottom:90, left:16, right:16, zIndex:100,
        background:'#16a34a', borderRadius:12, padding:'14px 18px',
        boxShadow:'0 8px 32px rgba(22,163,74,.55)',
        display:'flex', alignItems:'center', gap:12,
      }
    },
      h('div', { style:{ fontSize:24 }, 'aria-hidden':'true' }, '🎉'),
      h('div', null,
        h('div', { style:{ fontSize:14, fontWeight:700, color:'#fff' } }, 'First session complete!'),
        h('div', { style:{ fontSize:12, color:'rgba(255,255,255,.8)' } }, 'SmartCrick Member badge earned!')
      )
    ),

    // ── Daily Reward Modal (inline fallback if AppShell didn't show it) ──
    showRewardModal && A.DailyRewardModal && (function(){
      // Re-check reward state for display
      var state = A.getRewardState ? A.getRewardState() : {};
      var today = new Date().toISOString().slice(0, 10);
      var claimed = state.lastClaimed === today;
      if (!claimed || !state.weekDay) return null;
      var reward = (A.WEEKLY_REWARDS||[])[state.weekDay - 1];
      if (!reward) return null;
      return h(A.DailyRewardModal, {
        reward:  reward,
        state:   state,
        onClose: function() { setShowRewardModal(false); },
      });
    })()
  );
}

// ── Brain.js Neural Engine ────────────────────────────────────────
(function initBrainJS() {
  function heuristicFallback() {
    A.getRecommendedCategory = function() {
      try {
        var dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
        var DRILLS = A.DRILLS || [];
        var counts = { batting:0, bowling:0, fielding:0, fitness:0, mental:0 };
        Object.keys(dp).forEach(function(id) {
          var d = DRILLS.find(function(x){ return x.id===id; });
          if (d && counts[d.category] !== undefined) counts[d.category]++;
        });
        return Object.keys(counts).reduce(function(a, b){ return counts[a]<=counts[b]?a:b; });
      } catch(e) { return 'batting'; }
    };
    A.getRecommendedReason = function(cat) {
      try {
        var dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
        var DRILLS = A.DRILLS || [];
        var n = DRILLS.filter(function(d){ return d.category===cat&&dp[d.id]; }).length;
        return "You've done "+n+' '+cat+' drill'+(n===1?'':'s')+' — time to push further!';
      } catch(e) { return 'Based on your training history'; }
    };
  }

  try {
    if (typeof brain === 'undefined') { heuristicFallback(); return; }
    var net = new brain.NeuralNetwork({ hiddenLayers:[12,8], activation:'sigmoid' });
    var TD = [
      { input:{ bd:0.0,bw:0.8,fd:0.5,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4,lc:0.3 }, output:{ batting:0.9,bowling:0.05,fielding:0.1,fitness:0.1,mental:0.2 } },
      { input:{ bd:0.8,bw:0.0,fd:0.5,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4,lc:0.1 }, output:{ batting:0.1,bowling:0.9,fielding:0.1,fitness:0.1,mental:0.15 } },
      { input:{ bd:0.6,bw:0.7,fd:0.0,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4,lc:0.5 }, output:{ batting:0.1,bowling:0.1,fielding:0.9,fitness:0.1,mental:0.15 } },
      { input:{ bd:0.5,bw:0.5,fd:0.5,st:0.2,ms:0.1,tod:0.7,dow:0.5,xw:0.2,lc:0.1 }, output:{ batting:0.1,bowling:0.05,fielding:0.05,fitness:0.1,mental:0.9 } },
      { input:{ bd:0.6,bw:0.5,fd:0.5,st:0.8,ms:0.7,tod:0.3,dow:0.3,xw:0.7,lc:0.1 }, output:{ batting:0.2,bowling:0.15,fielding:0.15,fitness:0.85,mental:0.1 } },
      { input:{ bd:0.3,bw:0.3,fd:0.3,st:0.0,ms:0.5,tod:0.4,dow:0.2,xw:0.0,lc:0.5 }, output:{ batting:0.85,bowling:0.15,fielding:0.1,fitness:0.1,mental:0.3 } },
    ];
    net.train(TD, { iterations:800, errorThresh:0.005, log:false });
    var REASONS = {
      batting:  ['Your batting needs the most work right now','Cover drive practice will sharpen your footwork'],
      bowling:  ['Your bowling drills are behind — time to fix that','Line and length awaits'],
      fielding: ['Fielding wins matches — work on it today','Sharp ground fielding saves runs'],
      fitness:  ['Cricket fitness is the foundation','Conditioning work will improve everything'],
      mental:   ['Mental prep separates good players from great ones','A focused mind scores more runs'],
    };
    A.getRecommendedCategory = function() {
      try {
        var p=DB.getProgress()||{}, dp=DB.getDrillProgress?DB.getDrillProgress():{}, DRILLS=A.DRILLS||[];
        var cats={ batting:0,bowling:0,fielding:0,fitness:0,mental:0 };
        Object.keys(dp).forEach(function(id){ var d=DRILLS.find(function(x){ return x.id===id; }); if(d&&cats[d.category]!==undefined) cats[d.category]++; });
        var xpLog=DB.getXPLast7Days?DB.getXPLast7Days():[];
        var weekXP=xpLog.reduce(function(s,d){ return s+(d.xp||0); },0);
        var mScore=A.calcMentalFitnessScore?A.calcMentalFitnessScore():50;
        var streak=p.current_streak||0;
        var lastLog=DB.getXPLog?DB.getXPLog():[], lastCat=0.5;
        if(lastLog.length>0){ var l=lastLog[lastLog.length-1]; var cm={ drill:0.1,batting:0.1,bowling:0.3,fielding:0.5,fitness:0.7,mental:0.9 }; lastCat=cm[l.source]||0.5; }
        var out=net.run({ bd:Math.min(cats.batting,10)/10,bw:Math.min(cats.bowling,10)/10,fd:Math.min(cats.fielding,6)/6,st:Math.min(streak,30)/30,ms:mScore/100,tod:new Date().getHours()/24,dow:new Date().getDay()/7,xw:Math.min(weekXP,500)/500,lc:lastCat });
        return ['batting','bowling','fielding','fitness','mental'].reduce(function(a,b){ return (out[a]||0)>=(out[b]||0)?a:b; });
      } catch(e) { return 'batting'; }
    };
    A.getRecommendedReason = function(cat) {
      var pool=REASONS[cat]||REASONS.batting;
      return pool[Math.floor(Math.random()*pool.length)];
    };
    console.log('[SC] Brain.js trained');
  } catch(err) {
    console.warn('[SC] Brain.js fallback:', err.message);
    heuristicFallback();
  }
})();

A.HomePage = HomePage;
console.log('[SC] app-home.js v4.1 — [object Object] bug fixed, daily reward widget added');
})();    angle += sweep;
  });
  return segs;
}

function polarXY(cx, cy, r, deg) {
  var rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// ── Spin Wheel Widget ─────────────────────────────────────────────
function SpinWheelWidget() {
  var today = new Date().toISOString().slice(0, 10);
  var alreadySpun = DB.get('last_spin_date') === today;
  var savedPrize  = DB.get('last_spin_prize') || null;
  var [spinning,   setSpinning]   = useState(false);
  var [rotation,   setRotation]   = useState(0);
  var [result,     setResult]     = useState(null);
  var [spunToday,  setSpunToday]  = useState(alreadySpun);
  var [todayPrize, setTodayPrize] = useState(savedPrize);
  var [expanded,   setExpanded]   = useState(false);
  var rotRef = useRef(0);
  var segs = buildSegments(SPIN_PRIZES);
  var cx = 100, cy = 100, r = 88;

  function getTargetAngle(prizeIdx) {
    var seg = segs[prizeIdx];
    var currentBase = rotRef.current % 360;
    var extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    var toTop = (360 - seg.midAngle + 360) % 360;
    return currentBase + extraSpins + toTop;
  }

  function handleSpin() {
    if (spinning || spunToday) return;
    var prizeIdx = weightedRandom(SPIN_PRIZES);
    var winner = SPIN_PRIZES[prizeIdx];
    var finalAngle = getTargetAngle(prizeIdx);
    var startAngle = rotRef.current, startTime = null, duration = 3200;
    setSpinning(true); setResult(null);
    function frame(ts) {
      if (!startTime) startTime = ts;
      var elapsed = ts - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var cur = startAngle + (finalAngle - startAngle) * eased;
      rotRef.current = cur; setRotation(cur);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        rotRef.current = finalAngle; setRotation(finalAngle);
        setSpinning(false); setResult(winner); setSpunToday(true); setTodayPrize(winner);
        DB.set('last_spin_date', today); DB.set('last_spin_prize', winner);
        if (A.awardXP) A.awardXP(winner.xp, 0, 'spin_wheel', null, null);
        if (winner.xp >= 200 && A.fireConfetti) A.fireConfetti();
        window.dispatchEvent(new CustomEvent('sc_update'));
      }
    }
    requestAnimationFrame(frame);
  }

  function timeUntilMidnight() {
    var now = new Date(), mn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var d = mn - now;
    return Math.floor(d / 3600000) + 'h ' + Math.floor((d % 3600000) / 60000) + 'm';
  }

  if (!expanded) {
    return h('div', {
      role: 'button', tabIndex: 0,
      'aria-label': spunToday ? 'Daily spin used' : 'Open daily spin wheel',
      onClick: function() { setExpanded(true); },
      onKeyDown: function(e) { if (e.key === 'Enter' || e.key === ' ') setExpanded(true); },
      style: { margin: '0 16px 12px', cursor: 'pointer', outline: 'none' },
    },
      h('div', { style: {
        padding: '11px 16px', borderRadius: 12,
        background: spunToday ? 'rgba(255,255,255,.03)' : 'linear-gradient(135deg,rgba(245,158,11,.1),rgba(239,68,68,.08))',
        border: '1px solid ' + (spunToday ? 'rgba(255,255,255,.07)' : 'rgba(245,158,11,.3)'),
        display: 'flex', alignItems: 'center', gap: 10,
      }},
        h('div', { style: { fontSize: 22 }, 'aria-hidden': 'true' }, spunToday ? '✅' : '🎰'),
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontSize: 13, fontWeight: 600, color: spunToday ? '#6b7280' : '#e5e7eb' } },
            spunToday ? 'Daily Spin Used' : 'Daily Bonus Spin'),
          h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2 } },
            spunToday
              ? 'Won ' + (todayPrize ? todayPrize.label : '') + '  ·  Next in ' + timeUntilMidnight()
              : 'Spin for up to 500 bonus XP — once per day')
        ),
        !spunToday && h('span', { style: { fontSize: 13, fontWeight: 600, color: '#f59e0b' } }, 'Spin →')
      )
    );
  }

  return h('div', { style: {
    margin: '0 16px 12px', padding: '20px 16px',
    background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14,
  }},
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 } },
      h('div', { style: { fontSize: 14, fontWeight: 600, color: '#e5e7eb' } }, '🎰 Daily Bonus Spin'),
      h('button', {
        onClick: function() { setExpanded(false); },
        'aria-label': 'Close spin wheel',
        style: { background: 'none', border: 'none', color: '#6b7280', fontSize: 20, cursor: 'pointer', padding: '0 4px' }
      }, '×')
    ),
    h('div', { style: { position: 'relative', width: 200, height: 200, margin: '0 auto 16px' } },
      h('div', { 'aria-hidden': 'true', style: {
        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '9px solid transparent', borderRight: '9px solid transparent',
        borderTop: '18px solid #16a34a',
        filter: 'drop-shadow(0 2px 6px rgba(22,163,74,.6))', zIndex: 2,
      }}),
      h('svg', {
        width: 200, height: 200, viewBox: '0 0 200 200',
        role: 'img', 'aria-label': 'Spin wheel',
        style: {
          display: 'block',
          transform: 'rotate(' + rotation + 'deg)',
          transformOrigin: '100px 100px',
          willChange: 'transform',
        }
      },
        segs.map(function(seg, i) {
          var start = polarXY(cx, cy, r, seg.startAngle);
          var end   = polarXY(cx, cy, r, seg.startAngle + seg.sweep);
          var large = seg.sweep > 180 ? 1 : 0;
          var d = 'M ' + cx + ' ' + cy + ' L ' + start.x.toFixed(1) + ' ' + start.y.toFixed(1) +
                  ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + end.x.toFixed(1) + ' ' + end.y.toFixed(1) + ' Z';
          var mid = polarXY(cx, cy, r * 0.65, seg.midAngle);
          return h('g', { key: i },
            h('path', { d: d, fill: seg.color, stroke: '#0d1117', strokeWidth: 2.5 }),
            h('text', {
              x: mid.x, y: mid.y,
              textAnchor: 'middle', dominantBaseline: 'central',
              fontSize: seg.xp >= 200 ? 8 : 9, fontWeight: 700, fill: '#fff',
              transform: 'rotate(' + seg.midAngle + ',' + mid.x + ',' + mid.y + ')',
              style: { userSelect: 'none' }
            }, seg.label)
          );
        }),
        h('circle', { cx: cx, cy: cy, r: 14, fill: '#111827', stroke: '#16a34a', strokeWidth: 2 }),
        h('text', { x: cx, y: cy, textAnchor: 'middle', dominantBaseline: 'central', fontSize: 12, fill: '#16a34a', fontWeight: 700 }, '🏏')
      )
    ),
    result
      ? h('div', { style: { textAlign: 'center' }, role: 'status', 'aria-live': 'polite' },
          h('div', { style: { fontSize: 28, fontWeight: 700, color: result.color, marginBottom: 6 } }, result.label),
          h('div', { style: { fontSize: 13, color: '#9ca3af' } }, 'XP added! Come back tomorrow.'),
          h('button', {
            onClick: function() { setExpanded(false); },
            style: { marginTop: 10, padding: '8px 24px', background: 'rgba(255,255,255,.06)', border: 'none', borderRadius: 8, color: '#9ca3af', cursor: 'pointer', fontSize: 12 }
          }, 'Close')
        )
      : spunToday
        ? h('div', { style: { textAlign: 'center' } },
            h('div', { style: { fontSize: 13, color: '#6b7280' } }, 'Already spun today!'),
            todayPrize && h('div', { style: { fontSize: 22, fontWeight: 700, color: todayPrize.color, marginTop: 4 } }, 'You won ' + todayPrize.label),
            h('div', { style: { fontSize: 12, color: '#4b5563', marginTop: 4 } }, 'Next spin in ' + timeUntilMidnight())
          )
        : h('div', { style: { textAlign: 'center' } },
            h('button', {
              onClick: handleSpin,
              disabled: spinning,
              'aria-label': 'Spin the wheel',
              style: {
                padding: '13px 40px', border: 'none', borderRadius: 12,
                background: spinning ? 'rgba(255,255,255,.06)' : 'linear-gradient(135deg,#f59e0b,#ef4444)',
                color: '#fff', fontSize: 16, fontWeight: 700,
                cursor: spinning ? 'not-allowed' : 'pointer',
                boxShadow: spinning ? 'none' : '0 4px 18px rgba(245,158,11,.45)',
              }
            }, spinning ? '🌀 Spinning...' : '🎰 SPIN!'),
            h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 8 } }, 'Win up to 500 bonus XP — once per day')
          )
  );
}

// ── Daily Net Home Widget ────────────────────────────────────────
function DailyNetHomeWidget() {
  var today  = new Date().toISOString().slice(0, 10);
  var saved  = DB.get('dn_' + today);
  var done   = !!saved;
  var score  = done ? saved.score : 0;
  var emojis = done ? (saved.answers || []).map(function(a, i) {
    var qs = A.getDailyNetQuestions ? A.getDailyNetQuestions() : [];
    return (qs[i] && a === qs[i].c) ? '🟩' : '🟥';
  }).join('') : '';

  function timeLeft() {
    var now = new Date(), mn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    var d = mn - now;
    return Math.floor(d / 3600000) + 'h ' + Math.floor((d % 3600000) / 60000) + 'm';
  }

  return h('div', {
    role: 'button', tabIndex: 0,
    'aria-label': done ? 'Daily Net complete — ' + score + '/5' : "Play today's Daily Net challenge",
    onClick: function() { nav('DailyNet'); },
    onKeyDown: function(e) { if (e.key === 'Enter' || e.key === ' ') nav('DailyNet'); },
    onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,.35)'; },
    onBlur:  function(e) { e.currentTarget.style.boxShadow = 'none'; },
    style: { margin: '0 16px 12px', cursor: 'pointer', outline: 'none' },
  },
    h('div', { style: {
      padding: '12px 16px', borderRadius: 12,
      background: done ? 'rgba(255,255,255,.03)' : 'linear-gradient(135deg,rgba(29,78,216,.12),rgba(79,70,229,.08))',
      border: '1px solid ' + (done ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.3)'),
      display: 'flex', alignItems: 'center', gap: 12,
    }},
      h('div', { style: { fontSize: 24, flexShrink: 0 }, 'aria-hidden': 'true' },
        done ? (score === 5 ? '🏆' : score >= 3 ? '⭐' : '🏏') : '🏏'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 13, fontWeight: 700, color: done ? '#9ca3af' : '#e5e7eb' } },
          done ? 'Daily Net — ' + score + '/5 ✓' : 'The Daily Net'),
        h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2 } },
          done
            ? emojis + '  ·  Next in ' + timeLeft()
            : '5 cricket Qs · Same for everyone · Share your score')
      ),
      !done && h('span', { style: {
        fontSize: 12, fontWeight: 700, color: '#60a5fa',
        background: 'rgba(59,130,246,.12)', padding: '4px 10px', borderRadius: 20, flexShrink: 0,
      } }, 'Play →')
    )
  );
}

// ── AI Recommend Card ─────────────────────────────────────────────
function AIRecommendCard() {
  var [rec, setRec]       = useState(null);
  var [reason, setReason] = useState('');
  var [drill, setDrill]   = useState(null);

  useEffect(function() {
    try {
      var cat  = A.getRecommendedCategory ? A.getRecommendedCategory() : 'batting';
      var text = A.getRecommendedReason   ? A.getRecommendedReason(cat) : 'Based on your training history';
      setRec(cat); setReason(text);
      var DRILLS = A.DRILLS || [], dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
      var uLevel = ((DB.getUser ? DB.getUser() : {}).level || '').toLowerCase();
      var skill  = (uLevel === 'elite' || uLevel === 'state') ? 'advanced' : uLevel === 'district' ? 'intermediate' : 'beginner';
      var catDrills = DRILLS.filter(function(d) { return d.category === cat; });
      var undone    = catDrills.filter(function(d) { return !dp[d.id]; });
      var pick      = undone.find(function(d) { return d.skill_level === skill; }) || undone[0] || catDrills[0];
      setDrill(pick || null);
    } catch(e) { console.warn('[SC] AI card:', e); }
  }, []);

  if (!rec || !drill) return null;

  var CFG = {
    batting:      { emoji: '🏏', color: '#3b82f6', label: 'Batting' },
    bowling:      { emoji: '🎳', color: '#ef4444', label: 'Bowling' },
    fielding:     { emoji: '🤸', color: '#10b981', label: 'Fielding' },
    fitness:      { emoji: '💪', color: '#f59e0b', label: 'Fitness' },
    mental:       { emoji: '🧠', color: '#8b5cf6', label: 'Mental' },
    wicketkeeping:{ emoji: '🧤', color: '#14b8a6', label: 'Keeping' },
  };
  var cfg = CFG[rec] || CFG.batting;

  return h('div', { style: {
    margin: '0 16px 12px', padding: '14px 16px', borderRadius: 14,
    background: 'linear-gradient(135deg,' + cfg.color + '10,' + cfg.color + '06)',
    border: '1px solid ' + cfg.color + '35',
  }},
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
      h('span', { style: { fontSize: 14, fontWeight: 600, color: cfg.color } }, '🤖 AI Recommends Today'),
      h('span', { style: {
        marginLeft: 'auto', fontSize: 11, color: cfg.color,
        background: cfg.color + '18', padding: '2px 8px', borderRadius: 10, border: '1px solid ' + cfg.color + '30',
      } }, cfg.label)
    ),
    h('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start' } },
      h('div', { style: { fontSize: 32, lineHeight: 1, flexShrink: 0 }, 'aria-hidden': 'true' }, cfg.emoji),
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { style: { fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 3 } }, drill.title),
        h('div', { style: { fontSize: 12, color: '#9ca3af', lineHeight: 1.45, marginBottom: 9 } }, reason),
        h('button', {
          onClick: function() { nav('DrillDetail', { id: drill.id }); },
          'aria-label': 'Start ' + drill.title,
          style: {
            padding: '8px 18px', border: 'none', borderRadius: 8,
            background: cfg.color, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          },
          onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 3px ' + cfg.color + '50'; },
          onBlur:  function(e) { e.currentTarget.style.boxShadow = 'none'; },
        }, '→ Start drill')
      )
    )
  );
}

// ── XP Multiplier Banner ─────────────────────────────────────────
function MultiplierBanner(props) {
  var streak = props.streak || 0, mult = props.multiplier || 1.0;
  if (mult <= 1.0) return null;
  var clr = mult >= 1.5 ? '#ef4444' : mult >= 1.3 ? '#f59e0b' : '#16a34a';
  return h('div', {
    role: 'status', 'aria-label': mult + 'x XP multiplier active',
    style: {
      margin: '0 16px 10px', padding: '9px 14px', borderRadius: 10,
      background: clr + '12', border: '1px solid ' + clr + '30',
      display: 'flex', alignItems: 'center', gap: 10,
    }
  },
    h('div', { style: { fontSize: 20 }, 'aria-hidden': 'true' }, '🔥'),
    h('div', { style: { flex: 1 } },
      h('div', { style: { fontSize: 12, fontWeight: 700, color: clr } }, mult + '× XP Multiplier Active'),
      h('div', { style: { fontSize: 11, color: '#6b7280' } }, streak + '-day streak · Every XP earned is boosted!')
    )
  );
}

// ── HOME PAGE ────────────────────────────────────────────────────
function HomePage() {
  var [progress,   setProgress]   = useState(null);
  var [mission,    setMission]    = useState(null);
  var [weeklyGoal, setWeeklyGoal] = useState(200);
  var [xpLog,      setXpLog]      = useState([]);
  var [firstToast, setFirstToast] = useState(false);

  function reload() {
    setProgress(DB.getProgress() || {});
    setMission(A.generateTodaysMission ? A.generateTodaysMission() : null);
    setWeeklyGoal(DB.getWeeklyXPGoal ? (DB.getWeeklyXPGoal() || 200) : 200);
    setXpLog(DB.getXPLast7Days ? DB.getXPLast7Days() : []);
  }

  useEffect(function() {
    reload();
    var onUpdate = function() { reload(); };
    var onFirst  = function() { setFirstToast(true); setTimeout(function() { setFirstToast(false); }, 2800); };
    window.addEventListener('sc_update', onUpdate);
    window.addEventListener('sc_first_session', onFirst);
    return function() {
      window.removeEventListener('sc_update', onUpdate);
      window.removeEventListener('sc_first_session', onFirst);
    };
  }, []);

  // Simple loading state — NO TopBar or BottomNav (AppShell handles them)
  if (!progress) {
    return h('div', { style: { background: '#0d1117', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      h('div', { style: { textAlign: 'center', color: '#6b7280' } },
        h('div', { style: { fontSize: 40, marginBottom: 12 } }, '🏏'),
        h('div', { style: { fontSize: 14 } }, 'Loading SmartCrick...')
      )
    );
  }

  var user      = DB.getUser ? DB.getUser() : {};
  var levelInfo = A.getLevelInfo ? A.getLevelInfo(progress.total_xp || 0) : { level: 1, name: 'Rookie', pct: 0, xpToNext: 500, next: 'Net Warrior' };
  var streak    = progress.current_streak || 0;
  var mult      = streak >= 30 ? 1.5 : streak >= 14 ? 1.3 : streak >= 7 ? 1.2 : streak >= 3 ? 1.1 : 1.0;
  var weekXP    = xpLog.reduce(function(s, d) { return s + (d.xp || 0); }, 0);
  var todayDate = new Date().toISOString().slice(0, 10);
  var todayXP   = (xpLog.find(function(d) { return d.date === todayDate; }) || { xp: 0 }).xp;
  var greet     = (function() { var hr = new Date().getHours(); return hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'; })();

  // Last-10-day momentum
  var momentum = (function() {
    var arr = [];
    for (var i = 9; i >= 0; i--) {
      var d  = new Date(); d.setDate(d.getDate() - i);
      var ds = d.toISOString().slice(0, 10);
      var e  = xpLog.find(function(x) { return x.date === ds; });
      arr.push({ date: ds, xp: e ? e.xp : 0, isToday: i === 0 });
    }
    return arr;
  })();
  var maxMomentum = Math.max.apply(null, momentum.map(function(d) { return d.xp; }).concat([1]));

  // ── MAIN RETURN — no TopBar, no BottomNav (AppShell provides them) ──
  return h('div', { style: { background: '#0d1117', minHeight: '100dvh' } },

    // ── Hero / level + streak ─────────────────────────────────────
    h('div', { style: { padding: '16px 16px 12px', background: 'linear-gradient(180deg,rgba(22,163,74,.07) 0%,transparent 100%)' } },
      h('div', { style: { marginBottom: 12 } },
        h('div', { style: { fontSize: 13, color: '#9ca3af' } }, greet + ', ' + (user.name || 'Cricketer') + ' 👋'),
        h('h1', { style: { fontSize: 22, fontWeight: 700, color: '#e5e7eb', margin: '4px 0 2px' } }, "Today's Training"),
        h('div', { style: { fontSize: 12, color: '#6b7280' } }, new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }))
      ),
      h('div', { style: { display: 'flex', gap: 10 } },
        // Level card
        h('div', {
          style: { flex: 1, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '12px' },
          role: 'region', 'aria-label': 'XP level progress',
        },
          h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 } },
            h('span', { style: { fontSize: 11, color: '#6b7280' } }, 'Level ' + levelInfo.level),
            h('span', { style: { fontSize: 11, color: '#4ade80', fontWeight: 600 } }, (progress.total_xp || 0).toLocaleString() + ' XP')
          ),
          h('div', { style: { fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 6 } }, levelInfo.name),
          h('div', {
            style: { height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' },
            role: 'progressbar', 'aria-valuenow': Math.round(levelInfo.pct || 0), 'aria-valuemin': 0, 'aria-valuemax': 100,
          },
            h('div', { style: { height: '100%', width: (levelInfo.pct || 0) + '%', background: '#16a34a', borderRadius: 2, transition: 'width .5s' } })
          ),
          h('div', { style: { fontSize: 10, color: '#4b5563', marginTop: 4 } },
            (levelInfo.xpToNext || 0).toLocaleString() + ' XP to ' + (levelInfo.next || 'max'))
        ),
        // Streak card
        h('div', {
          style: { background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: '12px', minWidth: 100, textAlign: 'center' },
          role: 'region', 'aria-label': streak + ' day training streak',
        },
          h('div', { style: { fontSize: 28, fontWeight: 700, color: '#f59e0b', lineHeight: 1.1 } }, streak),
          h('div', { style: { fontSize: 11, color: '#f59e0b', fontWeight: 500 } }, 'day streak'),
          h('div', { style: { fontSize: 18, marginTop: 4 }, 'aria-hidden': 'true' }, streak > 0 ? '🔥' : '💤')
        )
      )
    ),

    // ── XP Multiplier banner ──────────────────────────────────────
    h(MultiplierBanner, { streak: streak, multiplier: mult }),

    // ── AI Drill Recommendation ───────────────────────────────────
    h(AIRecommendCard, {}),

    // ── Daily Spin ────────────────────────────────────────────────
    h(SpinWheelWidget, {}),

    // ── Daily Net widget ──────────────────────────────────────────
    h(DailyNetHomeWidget, {}),

    // ── Today's Mission ───────────────────────────────────────────
    mission && h('div', { style: { margin: '0 16px 12px' } },
      h('div', {
        style: { background: 'rgba(59,130,246,.08)', border: '1px solid rgba(59,130,246,.22)', borderRadius: 14, padding: '14px 16px' },
        role: 'region', 'aria-label': "Today's mission",
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 } },
          h('div', { style: { fontSize: 14, fontWeight: 600, color: '#60a5fa' } }, "📋 Today's Mission"),
          mission.reason && h('div', { style: { marginLeft: 'auto', fontSize: 11, color: '#4b5563', fontStyle: 'italic' } }, mission.reason)
        ),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
          mission.drillId && h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,.04)', borderRadius: 8 } },
            h('div', { style: { width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: mission.drillDone ? '#16a34a' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' } },
              mission.drillDone ? '✓' : '🎯'),
            h('div', { style: { flex: 1 } },
              h('div', { style: { fontSize: 12, fontWeight: 500, color: mission.drillDone ? '#6b7280' : '#e5e7eb', textDecoration: mission.drillDone ? 'line-through' : 'none' } },
                (function() { var d = (A.DRILLS || []).find(function(x) { return x.id === mission.drillId; }); return d ? d.title : mission.drillId; })()),
              h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Drill · +XP')
            ),
            !mission.drillDone && h('button', {
              onClick: function() { nav('DrillDetail', { id: mission.drillId }); },
              'aria-label': 'Start drill',
              style: { padding: '5px 12px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }
            }, '→ Go')
          ),
          mission.mentalId && h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', background: 'rgba(255,255,255,.04)', borderRadius: 8 } },
            h('div', { style: { width: 20, height: 20, borderRadius: 4, flexShrink: 0, background: mission.mentalDone ? '#8b5cf6' : 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff' } },
              mission.mentalDone ? '✓' : '🧠'),
            h('div', { style: { flex: 1 } },
              h('div', { style: { fontSize: 12, fontWeight: 500, color: mission.mentalDone ? '#6b7280' : '#e5e7eb', textDecoration: mission.mentalDone ? 'line-through' : 'none' } },
                (function() { var m = (A.MENTAL_SESSIONS || []).find(function(x) { return x.id === mission.mentalId; }); return m ? m.title : mission.mentalId; })()),
              h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Mental session · +XP')
            ),
            !mission.mentalDone && h('button', {
              onClick: function() { nav('MentalPlayer', { id: mission.mentalId }); },
              'aria-label': 'Start mental session',
              style: { padding: '5px 12px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, cursor: 'pointer' }
            }, '→ Go')
          )
        ),
        mission.drillDone && mission.mentalDone && h('div', {
          style: { marginTop: 10, padding: '8px', background: 'rgba(22,163,74,.1)', borderRadius: 8, textAlign: 'center', fontSize: 12, color: '#4ade80', fontWeight: 600 },
          role: 'status',
        }, '✅ Mission complete! Brilliant work today 🏏')
      )
    ),

    // ── Weekly XP Goal ────────────────────────────────────────────
    h('div', { style: { margin: '0 16px 12px', padding: '14px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14 } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
        h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb' } }, '🎯 Weekly XP Goal'),
        h('div', { style: { fontSize: 12, fontWeight: 600, color: weekXP >= weeklyGoal ? '#4ade80' : '#f59e0b' } },
          weekXP.toLocaleString() + ' / ' + weeklyGoal.toLocaleString() + ' XP')
      ),
      h('div', {
        style: { height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
        role: 'progressbar',
        'aria-valuenow': Math.min(Math.round((weekXP / weeklyGoal) * 100), 100),
        'aria-valuemin': 0, 'aria-valuemax': 100,
      },
        h('div', { style: { height: '100%', width: Math.min((weekXP / weeklyGoal) * 100, 100) + '%', background: weekXP >= weeklyGoal ? '#4ade80' : '#f59e0b', borderRadius: 3, transition: 'width .4s' } })
      ),
      h('div', { style: { display: 'flex', gap: 6 } },
        [100, 200, 500].map(function(g) {
          var sel = weeklyGoal === g;
          return h('button', {
            key: g,
            onClick: function() { if (DB.setWeeklyXPGoal) DB.setWeeklyXPGoal(g); setWeeklyGoal(g); window.dispatchEvent(new CustomEvent('sc_update')); },
            'aria-pressed': sel ? 'true' : 'false',
            style: {
              padding: '4px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
              background: sel ? 'rgba(22,163,74,.15)' : 'rgba(255,255,255,.04)',
              border: '1px solid ' + (sel ? 'rgba(22,163,74,.4)' : 'rgba(255,255,255,.08)'),
              color: sel ? '#4ade80' : '#6b7280', fontWeight: sel ? 600 : 400,
            }
          }, g + ' XP');
        })
      )
    ),

    // ── Training Momentum ─────────────────────────────────────────
    h('div', { style: { margin: '0 16px 12px', padding: '14px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14 } },
      h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 10 } }, '⚡ Training Momentum'),
      h('div', {
        style: { display: 'flex', gap: 3, alignItems: 'flex-end', height: 40 },
        role: 'img', 'aria-label': 'Last 10 days training activity',
      },
        momentum.map(function(d, i) {
          var bar = maxMomentum > 0 ? Math.max((d.xp / maxMomentum) * 38, d.xp > 0 ? 4 : 2) : 2;
          var clr = d.xp > 300 ? '#4ade80' : d.xp > 100 ? '#16a34a' : d.xp > 0 ? '#166534' : 'rgba(255,255,255,.06)';
          return h('div', { key: d.date, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 } },
            h('div', { style: { width: '100%', height: bar + 'px', background: clr, borderRadius: 3, border: d.isToday ? '1px solid #4ade80' : 'none' }, title: d.date + ': ' + d.xp + ' XP' }),
            d.isToday && h('div', { style: { fontSize: 8, color: '#4ade80' }, 'aria-hidden': 'true' }, '▲')
          );
        })
      ),
      h('div', { style: { display: 'flex', justifyContent: 'space-between', marginTop: 4 } },
        h('span', { style: { fontSize: 10, color: '#4b5563' } }, '10 days ago'),
        h('span', { style: { fontSize: 10, color: '#4b5563' } }, 'Today')
      )
    ),

    // ── Quick Start grid ──────────────────────────────────────────
    h('div', { style: { margin: '0 16px 12px' } },
      h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 10 } }, 'Quick Start'),
      h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 } },
        [
          { label: 'Drills',      emoji: '🎯', page: 'Drills',     color: '#3b82f6' },
          { label: 'Daily Net',   emoji: '🏏', page: 'DailyNet',   color: '#4f46e5' },
          { label: 'Mental',      emoji: '🧠', page: 'Mental',     color: '#8b5cf6' },
          { label: 'Fitness',     emoji: '💪', page: 'Fitness',    color: '#10b981' },
          { label: 'Schedule',    emoji: '📅', page: 'Schedule',   color: '#f59e0b' },
          { label: 'AI Coach',    emoji: '🤖', page: 'AICoach',    color: '#14b8a6' },
          { label: 'Progress',    emoji: '📊', page: 'Progress',   color: '#6b7280' },
          { label: 'Cricket DNA', emoji: '🧬', page: 'CricketDNA', color: '#7c3aed' },
        ].map(function(item) {
          return h('button', {
            key: item.page,
            onClick: function() { nav(item.page); },
            'aria-label': 'Go to ' + item.label,
            style: {
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              cursor: 'pointer', background: 'rgba(255,255,255,.04)',
              border: '1px solid rgba(255,255,255,.07)',
              borderLeft: '3px solid ' + item.color, borderRadius: 10, textAlign: 'left',
            },
            onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 2px ' + item.color + '40'; },
            onBlur:  function(e) { e.currentTarget.style.boxShadow = 'none'; },
          },
            h('div', { style: { fontSize: 20 }, 'aria-hidden': 'true' }, item.emoji),
            h('div', { style: { fontSize: 13, fontWeight: 500, color: '#e5e7eb' } }, item.label)
          );
        })
      )
    ),

    // ── Next level roadmap ────────────────────────────────────────
    h('div', { style: { margin: '0 16px 20px', padding: '12px 14px', background: 'rgba(22,163,74,.06)', border: '1px solid rgba(22,163,74,.15)', borderRadius: 12 } },
      h('div', { style: { fontSize: 12, color: '#4ade80', fontWeight: 600, marginBottom: 4 } },
        '🎮 Next Level: ' + (levelInfo.next || 'Legend')),
      h('div', { style: { fontSize: 11, color: '#6b7280' } },
        (levelInfo.xpToNext || 0).toLocaleString() + ' XP needed · ' +
        (todayXP > 0
          ? '~' + Math.ceil((levelInfo.xpToNext || 0) / todayXP) + " more days at today's pace"
          : 'Start training to see your pace'))
    ),

    // ── First session toast ───────────────────────────────────────
    firstToast && h('div', {
      role: 'alert', 'aria-live': 'assertive',
      style: {
        position: 'fixed', bottom: 90, left: 16, right: 16, zIndex: 100,
        background: '#16a34a', borderRadius: 12, padding: '14px 18px',
        boxShadow: '0 8px 32px rgba(22,163,74,.55)',
        display: 'flex', alignItems: 'center', gap: 12,
      }
    },
      h('div', { style: { fontSize: 24 }, 'aria-hidden': 'true' }, '🎉'),
      h('div', null,
        h('div', { style: { fontSize: 14, fontWeight: 700, color: '#fff' } }, 'First session complete!'),
        h('div', { style: { fontSize: 12, color: 'rgba(255,255,255,.8)' } }, 'SmartCrick Member badge earned!')
      )
    )

    // NOTE: No h(BottomNav) here — AppShell (app-root.js) renders it globally
  );
}

// ── Brain.js Neural Engine ────────────────────────────────────────
(function initBrainJS() {
  function heuristicFallback() {
    A.getRecommendedCategory = function() {
      try {
        var dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
        var DRILLS = A.DRILLS || [];
        var counts = { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0 };
        Object.keys(dp).forEach(function(id) {
          var d = DRILLS.find(function(x) { return x.id === id; });
          if (d && counts[d.category] !== undefined) counts[d.category]++;
        });
        return Object.keys(counts).reduce(function(a, b) { return counts[a] <= counts[b] ? a : b; });
      } catch(e) { return 'batting'; }
    };
    A.getRecommendedReason = function(cat) {
      try {
        var dp = DB.getDrillProgress ? DB.getDrillProgress() : {};
        var DRILLS = A.DRILLS || [];
        var n = DRILLS.filter(function(d) { return d.category === cat && dp[d.id]; }).length;
        return "You've done " + n + ' ' + cat + ' drill' + (n === 1 ? '' : 's') + ' — time to push further!';
      } catch(e) { return 'Based on your training history'; }
    };
  }

  try {
    if (typeof brain === 'undefined') { heuristicFallback(); return; }
    var net = new brain.NeuralNetwork({ hiddenLayers: [12, 8], activation: 'sigmoid' });
    var TD = [
      { input: { bd: 0.0, bw: 0.8, fd: 0.5, st: 0.3, ms: 0.6, tod: 0.3, dow: 0.2, xw: 0.4, lc: 0.3 }, output: { batting: 0.9, bowling: 0.05, fielding: 0.1, fitness: 0.1, mental: 0.2 } },
      { input: { bd: 0.8, bw: 0.0, fd: 0.5, st: 0.3, ms: 0.6, tod: 0.3, dow: 0.2, xw: 0.4, lc: 0.1 }, output: { batting: 0.1, bowling: 0.9, fielding: 0.1, fitness: 0.1, mental: 0.15 } },
      { input: { bd: 0.6, bw: 0.7, fd: 0.0, st: 0.3, ms: 0.6, tod: 0.3, dow: 0.2, xw: 0.4, lc: 0.5 }, output: { batting: 0.1, bowling: 0.1, fielding: 0.9, fitness: 0.1, mental: 0.15 } },
      { input: { bd: 0.5, bw: 0.5, fd: 0.5, st: 0.2, ms: 0.1, tod: 0.7, dow: 0.5, xw: 0.2, lc: 0.1 }, output: { batting: 0.1, bowling: 0.05, fielding: 0.05, fitness: 0.1, mental: 0.9 } },
      { input: { bd: 0.6, bw: 0.5, fd: 0.5, st: 0.8, ms: 0.7, tod: 0.3, dow: 0.3, xw: 0.7, lc: 0.1 }, output: { batting: 0.2, bowling: 0.15, fielding: 0.15, fitness: 0.85, mental: 0.1 } },
      { input: { bd: 0.3, bw: 0.3, fd: 0.3, st: 0.0, ms: 0.5, tod: 0.4, dow: 0.2, xw: 0.0, lc: 0.5 }, output: { batting: 0.85, bowling: 0.15, fielding: 0.1, fitness: 0.1, mental: 0.3 } },
      { input: { bd: 0.5, bw: 0.5, fd: 0.5, st: 0.3, ms: 0.5, tod: 0.85, dow: 0.3, xw: 0.4, lc: 0.1 }, output: { batting: 0.15, bowling: 0.1, fielding: 0.05, fitness: 0.15, mental: 0.82 } },
      { input: { bd: 0.3, bw: 0.3, fd: 0.3, st: 0.3, ms: 0.6, tod: 0.25, dow: 0.2, xw: 0.3, lc: 0.9 }, output: { batting: 0.75, bowling: 0.3, fielding: 0.2, fitness: 0.3, mental: 0.1 } },
      { input: { bd: 0.9, bw: 0.2, fd: 0.5, st: 0.4, ms: 0.7, tod: 0.35, dow: 0.3, xw: 0.5, lc: 0.1 }, output: { batting: 0.05, bowling: 0.9, fielding: 0.2, fitness: 0.15, mental: 0.05 } },
      { input: { bd: 0.5, bw: 0.4, fd: 0.2, st: 0.4, ms: 0.6, tod: 0.3, dow: 0.3, xw: 0.5, lc: 0.5 }, output: { batting: 0.4, bowling: 0.3, fielding: 0.7, fitness: 0.25, mental: 0.15 } },
    ];
    net.train(TD, { iterations: 800, errorThresh: 0.005, log: false });
    var REASONS = {
      batting:  ['Your batting needs the most work right now', 'Cover drive practice will sharpen your footwork'],
      bowling:  ['Your bowling drills are behind — time to fix that', 'Line and length awaits'],
      fielding: ['Fielding wins matches — work on it today', 'Sharp ground fielding saves runs'],
      fitness:  ['Cricket fitness is the foundation — prioritise it', 'Conditioning work will improve everything'],
      mental:   ['Mental prep separates good players from great ones', 'A focused mind scores more runs'],
    };
    A.getRecommendedCategory = function() {
      try {
        var p = DB.getProgress() || {}, dp = DB.getDrillProgress ? DB.getDrillProgress() : {}, DRILLS = A.DRILLS || [];
        var cats = { batting: 0, bowling: 0, fielding: 0, fitness: 0, mental: 0 };
        Object.keys(dp).forEach(function(id) {
          var d = DRILLS.find(function(x) { return x.id === id; });
          if (d && cats[d.category] !== undefined) cats[d.category]++;
        });
        var xpLog = DB.getXPLast7Days ? DB.getXPLast7Days() : [];
        var weekXP = xpLog.reduce(function(s, d) { return s + (d.xp || 0); }, 0);
        var mScore = A.calcMentalFitnessScore ? A.calcMentalFitnessScore() : 50;
        var streak = p.current_streak || 0;
        var lastLog = DB.getXPLog ? DB.getXPLog() : [], lastCat = 0.5;
        if (lastLog.length > 0) {
          var l = lastLog[lastLog.length - 1];
          var cm = { drill: 0.1, batting: 0.1, bowling: 0.3, fielding: 0.5, fitness: 0.7, mental: 0.9 };
          lastCat = cm[l.source] || 0.5;
        }
        var out = net.run({
          bd: Math.min(cats.batting, 10) / 10, bw: Math.min(cats.bowling, 10) / 10,
          fd: Math.min(cats.fielding, 6) / 6, st: Math.min(streak, 30) / 30,
          ms: mScore / 100, tod: new Date().getHours() / 24,
          dow: new Date().getDay() / 7, xw: Math.min(weekXP, 500) / 500, lc: lastCat,
        });
        return ['batting', 'bowling', 'fielding', 'fitness', 'mental'].reduce(function(a, b) {
          return (out[a] || 0) >= (out[b] || 0) ? a : b;
        });
      } catch(e) { return 'batting'; }
    };
    A.getRecommendedReason = function(cat) {
      var pool = REASONS[cat] || REASONS.batting;
      return pool[Math.floor(Math.random() * pool.length)];
    };
    console.log('[SC] Brain.js trained');
  } catch(err) {
    console.warn('[SC] Brain.js fallback:', err.message);
    heuristicFallback();
  }
})();

A.HomePage = HomePage;
console.log('[SC] app-home.js v4.0 — TopBar/BottomNav removed (AppShell handles them)');
})();
