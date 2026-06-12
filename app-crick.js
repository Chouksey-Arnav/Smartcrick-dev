// app-crick.js — Crick Mascot System v1.0
// Crick page, daily nets mechanic, home cards, XP color shop
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A         = window.SC_APP;

// ── Daily Motivation Messages (seeded by date) ───────────────────
var CRICK_MESSAGES = [
  "The nets don't lie. Show up anyway.",
  "Your cover drive won't fix itself.",
  "Champions train when they don't feel like it.",
  "One session can change everything.",
  "Sachin didn't take days off. Just saying.",
  "The crease belongs to those who prepare.",
  "Bowlers are studying your weaknesses right now.",
  "Every great innings starts with the first ball.",
  "Pressure is a privilege. Embrace it.",
  "Your technique today decides your results tomorrow.",
  "The best players outwork everyone else.",
  "Read. React. Execute. Repeat.",
  "Show the ball respect — and then dominate it.",
  "Mental strength is a skill, not a gift.",
  "Consistent practice beats natural talent every time.",
  "Today's session is tomorrow's confidence.",
  "The pitch doesn't care how you feel. Train anyway.",
  "Build your game one session at a time.",
  "Hard nets. Easy matches.",
  "Great fielders win championships. Train that too.",
  "Focus on process. The results follow.",
  "The best version of you is waiting in the nets.",
  "Each rep in the nets is a rep toward greatness.",
  "No shortcuts to the crease. Only hard work.",
  "Your biggest competition is yesterday's you.",
  "Discipline is the bridge between goals and glory.",
  "Fatigue will lie to you. Push through it.",
  "Study the game as hard as you play it.",
  "Stay humble in practice. Be ruthless in matches.",
  "The nets are where legends are quietly born.",
  // ── Extended rotation (covers a full quarter before repeating) ──
  "Footwork first. Everything else follows.",
  "A quiet mind hits the ball cleaner.",
  "You don't rise to the occasion — you fall to your training.",
  "Watch the seam. Trust the hours.",
  "Today's extra over is tomorrow's match-winning spell.",
  "Comfort zones don't have scoreboards.",
  "Small fixes today, big scores tomorrow.",
  "Train like the next ball decides everything — because one day it will.",
  "The strike rate of effort is always 100%.",
  "Your shadow practice is someone else's match-winning shot.",
  "Bowlers fear batters who never skip a session.",
  "A bad net session beats a missed one. Always show up.",
  "Greatness is repetition nobody sees.",
  "Your last innings is history. Your next session is the future.",
  "Sweat now, celebrate later.",
  "Cricket rewards patience more than power.",
  "Every legend started with a single throwdown.",
  "You're not behind. You're building.",
  "The ball doesn't know your excuses.",
  "Form is temporary. Discipline is permanent.",
  "Win the morning, win the match.",
  "練習 — practice — is the only translation that matters.",
  "Today's drill is tomorrow's instinct.",
  "The crease respects consistency, not intensity alone.",
  "Be the player bowlers prepare extra for.",
  "Train your weakness until it becomes your weapon.",
  "Champions review their own footage. Start today.",
  "A calm head wins more matches than a strong arm.",
  "Every great over was once a nervous first ball.",
  "Practice the shot you're scared to play.",
  "Your competition is training right now too. Are you?",
  "Fitness wins close matches. Don't skip the running.",
  "The best fielders make bowlers look like heroes.",
  "Visualise the shot before you play it.",
  "Confidence is built one rep at a time.",
  "Today, be 1% better than yesterday.",
  "Pressure reveals preparation.",
  "The nets are honest. Match days are the reward.",
  "Don't practice until you get it right. Practice until you can't get it wrong.",
  "Your bat speed is a habit, not a gift.",
  "Slow and correct beats fast and sloppy.",
  "Every session adds a brick to your innings.",
  "The mental game starts before you walk out.",
  "Train your eyes as hard as your hands.",
  "A disciplined warm-up prevents a rushed apology later.",
  "Today's reps are deposits in tomorrow's confidence bank.",
  "You can't fake fitness on day three of a match.",
  "The best batters make bowling look easy — because they trained it that way.",
  "Show up even on the days you don't feel like a cricketer.",
  "Your technique is your signature. Sign it well.",
  "One more drill. One more rep. One more reason to believe.",
  "The scoreboard remembers preparation, not excuses.",
  "Stay sharp. Stay hungry. Stay in the nets.",
  "Great innings are written in quiet practice sessions.",
  "Your future self is counting on today's effort.",
  "Train hard, play easy.",
  "The crease is calling. Answer it.",
  "Today's grind is tomorrow's highlight reel.",
  "Be relentless about the basics.",
];

function getTodaysCrickMessage() {
  if (A.getCrickDailyMessages) {
    try {
      var picks = A.getCrickDailyMessages(1);
      if (picks && picks.length && picks[0].text) return picks[0].text;
    } catch(e) {}
  }
  var d = new Date();
  var seed = d.getFullYear() * 1000 + d.getMonth() * 31 + d.getDate();
  return CRICK_MESSAGES[seed % CRICK_MESSAGES.length];
}
A.getTodaysCrickMessage = getTodaysCrickMessage;

// ── Time-of-day greeting messages ────────────────────────────────
var CRICK_TIME_MESSAGES = {
  morning: [
    "Morning! Best time to groove that technique before the day gets busy.",
    "Rise and grind — the crease is waiting.",
    "Early reps hit different. Let's get moving.",
  ],
  afternoon: [
    "Midday check-in: have you put the bat in your hand yet today?",
    "A quick session now beats a rushed one tonight.",
    "Afternoon slump? A few drills will wake you right up.",
  ],
  evening: [
    "Evening's a great time to review today's work and plan tomorrow's.",
    "Wind down with some mental training before bed.",
    "Last call for today's nets — finish strong.",
  ],
};

// ── Weekend-mode messages ────────────────────────────────────────
var CRICK_WEEKEND_MESSAGES = [
  "Weekend = bonus reps. Most players rest, you can pull ahead.",
  "No school, no excuses — extra net session today?",
  "Weekends are where gaps between players are made or closed.",
];

function getTimeOfDayMood() {
  var hour = new Date().getHours();
  var bucket = hour < 12 ? 'morning' : (hour < 17 ? 'afternoon' : 'evening');
  var list = CRICK_TIME_MESSAGES[bucket];
  var seed = new Date().getDate() + hour;
  return { bucket: bucket, msg: list[seed % list.length] };
}
A.getTimeOfDayMood = getTimeOfDayMood;

// ── Crick Mood (Duolingo-style engagement) ───────────────────────
function getCrickMood() {
  var p = (A.DB && A.DB.getProgress()) || {};
  var last    = p.last_active_date || null;
  var streak  = p.current_streak   || 0;
  var today   = new Date();
  var todayStr = today.toISOString().slice(0, 10);
  var yest    = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // How many days since the user was last active (if ever)
  var daysSince = null;
  if (last) {
    var lastMs = new Date(last + 'T00:00:00').getTime();
    daysSince = Math.round((Date.now() - lastMs) / 86400000);
  }

  // Long absence — escalating "comeback" tone (3-6 days)
  if (daysSince !== null && daysSince >= 3 && daysSince <= 6) {
    return { mood: 'comeback_after_break', msg: "It's been " + daysSince + " days. Your spot in the nets is still open — let's get back to it." };
  }
  if (daysSince !== null && daysSince > 6) {
    return { mood: 'comeback_after_break', msg: "We miss you out here. One session today and you're back on track." };
  }

  if (last && last < yest) {
    return { mood: 'disappointed', msg: "I went to the nets alone yesterday... where were you?" };
  }

  // Personal-best callouts
  if (p.last_pb_at && p.last_pb_at === todayStr) {
    return { mood: 'post_pb', msg: "New personal best today. That's the standard now — let's keep raising it." };
  }

  if (streak >= 30) return { mood: 'legendary', msg: "30 days. You've become the ball." };
  if (streak >= 14) return { mood: 'fired_up',   msg: "Fourteen days straight. Legends are made this way." };
  if (streak >= 7)  return { mood: 'hot',        msg: "Seven days in a row. The crease is yours." };

  // Near a streak milestone (1 day away from 7/14/30)
  if (streak === 6 || streak === 13 || streak === 29) {
    return { mood: 'near_milestone', msg: "One more session and you hit a " + (streak + 1) + "-day streak. Don't stop now." };
  }

  if (streak === 0) return { mood: 'waiting', msg: "The crease is empty. Let's change that." };

  // Weekend mode (Saturday=6, Sunday=0)
  var dow = today.getDay();
  if (dow === 0 || dow === 6) {
    var seed = today.getFullYear() * 1000 + today.getMonth() * 31 + today.getDate();
    return { mood: 'weekend_mode', msg: CRICK_WEEKEND_MESSAGES[seed % CRICK_WEEKEND_MESSAGES.length] };
  }

  // Time-of-day flavoured greeting, falling back to the daily quote
  var tod = getTimeOfDayMood();
  return { mood: 'happy_' + tod.bucket, msg: tod.msg, fallback: getTodaysCrickMessage() };
}
A.getCrickMood = getCrickMood;

// ── Daily Crick Nets Mechanic ────────────────────────────────────
var NETS_WEIGHTS = [
  {runs:1, w:14},{runs:2, w:15},{runs:3, w:14},{runs:4, w:12},
  {runs:5, w:11},{runs:6, w:10},{runs:8, w:8}, {runs:10,w:6},
  {runs:12,w:5}, {runs:15,w:3}, {runs:20,w:2},
];

function getCrickNetsData() {
  if (!A.DB) return {runs:5, claimed:false, generated_at:Date.now()};
  var today = new Date().toISOString().slice(0, 10);
  var key   = 'crick_nets_' + today;
  var saved = A.DB.get(key);
  if (!saved) {
    var tot = NETS_WEIGHTS.reduce(function(s,x){return s+x.w;}, 0);
    var r = Math.random() * tot, c = 0, runs = 5;
    for (var i = 0; i < NETS_WEIGHTS.length; i++) {
      c += NETS_WEIGHTS[i].w;
      if (r < c) { runs = NETS_WEIGHTS[i].runs; break; }
    }
    saved = {runs: runs, claimed: false, generated_at: Date.now()};
    A.DB.set(key, saved);
  }
  return saved;
}
A.getCrickNetsData = getCrickNetsData;

// Yesterday's missed data
function getYesterdayNetsData() {
  if (!A.DB) return null;
  var yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  var d = A.DB.get('crick_nets_' + yest);
  return (d && !d.claimed) ? d : null;
}

// ── CrickNetsCard — prominent home page card ─────────────────────
function CrickNetsCard(props) {
  var [data, setData]         = useState(function(){ return getCrickNetsData(); });
  var [claiming, setClaiming] = useState(false);
  var [justClaimed, setJustClaimed] = useState(false);
  var [showInfo, setShowInfo] = useState(false);
  var compact = !!props.compact;
  var yesterday = getYesterdayNetsData();
  var today = new Date().toISOString().slice(0, 10);

  function handleClaim() {
    if (data.claimed || claiming) return;
    setClaiming(true);
    if (A.awardXP) A.awardXP(data.runs, 0, 'crick_nets', null, null, false);
    var updated = {runs: data.runs, claimed: true, generated_at: data.generated_at};
    if (A.DB) A.DB.set('crick_nets_' + today, updated);
    if (A.Emotion) try { A.Emotion.cheerMascot && A.Emotion.cheerMascot(); } catch(e) {}
    if (A.fireConfetti && data.runs >= 50) try { A.fireConfetti(); } catch(e) {}
    if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
    setTimeout(function() {
      setData(updated);
      setClaiming(false);
      setJustClaimed(true);
      window.dispatchEvent(new CustomEvent('sc_update'));
    }, 400);
  }

  useEffect(function() {
    function onUpdate() { setData(getCrickNetsData()); }
    window.addEventListener('sc_update', onUpdate);
    return function() { window.removeEventListener('sc_update', onUpdate); };
  }, []);

  var runColor = data.runs >= 50 ? '#f59e0b' : data.runs >= 30 ? '#10b981' : '#60a5fa';

  return h('div', {style:{margin:'0 16px 14px'}},
    h('div', {
      style:{
        background:'linear-gradient(135deg, rgba(15,20,35,0.98) 0%, rgba(20,28,46,0.95) 100%)',
        border: data.claimed ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(96,165,250,0.3)',
        borderRadius:16, padding:'18px 16px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.5)',
        position:'relative', overflow:'hidden',
      }
    },
      // Subtle background glow
      h('div', {style:{
        position:'absolute', top:-30, right:-30, width:120, height:120,
        borderRadius:'50%', background: data.claimed ? 'rgba(16,185,129,0.08)' : 'rgba(96,165,250,0.08)',
        pointerEvents:'none',
      }}),

      // Header row
      h('div', {style:{display:'flex', alignItems:'center', gap:8, marginBottom:12}},
        h('div', {style:{fontSize:11, fontWeight:800, color:'#475569', textTransform:'uppercase', letterSpacing:'0.1em', flex:1}},
          'Crick\'s Daily Net'),
        h('button', {
          onClick: function(e){ e.stopPropagation && e.stopPropagation(); setShowInfo(!showInfo); },
          'aria-label': 'What is this?',
          style:{
            width:20, height:20, borderRadius:'50%', flexShrink:0,
            background: showInfo ? 'rgba(96,165,250,0.25)' : 'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.12)', color:'#94a3b8',
            fontSize:11, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
            display:'flex', alignItems:'center', justifyContent:'center', padding:0,
          }
        }, '?'),
        data.claimed && h('div', {style:{
          fontSize:10, fontWeight:700, color:'#10b981',
          background:'rgba(16,185,129,0.12)', padding:'3px 8px', borderRadius:99,
        }}, 'Claimed ✓'),
      ),

      showInfo && h('div', {style:{
        fontSize:11.5, color:'#94a3b8', lineHeight:1.5, marginBottom:12,
        background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:10, padding:'10px 12px',
      }},
        'Every day, Crick "bats" in the nets and racks up a random number of runs. ' +
        'Those runs convert 1:1 into real XP for you — just tap Claim to bank them. ' +
        'It\'s a free daily top-up on top of whatever you earn from drills, mental sessions and workouts, ' +
        'so check in once a day so Crick\'s knock doesn\'t go to waste!'
      ),

      // Main content row
      h('div', {style:{display:'flex', alignItems:'center', gap:14}},
        // Crick mascot
        h('div', {style:{flexShrink:0, filter: data.claimed ? 'none' : 'drop-shadow(0 4px 12px rgba(96,165,250,0.3))'}},
          A.Crick ? h(A.Crick, {size:'md', id:'crick-nets-card'}) : h('div',{style:{fontSize:40}},'🏏')
        ),
        // Score + text
        h('div', {style:{flex:1}},
          h('div', {style:{display:'flex', alignItems:'baseline', gap:4, marginBottom:4}},
            h('span', {
              style:{
                fontSize: data.runs >= 50 ? 40 : 36, fontWeight:900,
                color: data.claimed ? '#6b7280' : runColor,
                lineHeight:1, letterSpacing:'-0.02em',
                fontFamily:'system-ui',
                className: !data.claimed ? 'sc-runs-reveal' : '',
              }
            }, String(data.runs)),
            h('span', {style:{fontSize:14, fontWeight:700, color:'#374151', marginLeft:2}}, 'runs'),
          ),
          h('div', {style:{fontSize:13, color: data.claimed ? '#4b5563' : '#94a3b8', lineHeight:1.4}},
            data.claimed
              ? 'Great work — you earned ' + data.runs + ' XP in the nets!'
              : 'Crick scored ' + data.runs + ' runs in the nets today. Claim your XP!',
          ),
          // Yesterday missed
          !data.claimed && yesterday && h('div', {style:{
            fontSize:11, color:'#92400e', marginTop:6,
            background:'rgba(146,64,14,0.1)', padding:'4px 8px', borderRadius:6,
            border:'1px solid rgba(146,64,14,0.2)',
          }},
            'Yesterday: Crick scored ' + yesterday.runs + ' runs — you weren\'t there.'
          ),
        ),
        // Claim button
        !data.claimed && h('button', {
          onClick: handleClaim,
          disabled: claiming,
          style:{
            flexShrink:0, padding:'10px 18px',
            background: claiming ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
            border:'none', borderRadius:12,
            fontSize:13, fontWeight:800, color:'#fff',
            cursor: claiming ? 'not-allowed' : 'pointer',
            fontFamily:'inherit',
            boxShadow: claiming ? 'none' : '0 4px 16px rgba(59,130,246,0.4)',
            transition:'all 0.15s',
          }
        }, claiming ? '...' : 'Claim +' + data.runs),
      ),
    )
  );
}
A.CrickNetsCard = CrickNetsCard;

// ── CrickHomeCard — speech bubble card for home feed ─────────────
function CrickHomeCard() {
  var mood = getCrickMood();
  var borderColor = mood.mood === 'disappointed' ? 'rgba(245,158,11,0.35)'
    : mood.mood === 'fired_up' || mood.mood === 'legendary' ? 'rgba(74,222,128,0.3)'
    : 'rgba(255,255,255,0.08)';

  return h('div', {style:{margin:'0 16px 14px'}},
    h('div', {
      style:{
        display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
        background:'rgba(10,15,30,0.95)',
        border:'1px solid ' + borderColor,
        borderRadius:14,
        boxShadow:'0 2px 12px rgba(0,0,0,0.4)',
      }
    },
      // Crick
      h('div', {style:{flexShrink:0}},
        A.Crick ? h(A.Crick, {size:'sm', id:'crick-home-card'}) : h('div',{style:{fontSize:32}},'🏏')
      ),
      // Speech bubble text
      h('div', {style:{flex:1}},
        h('div', {style:{
          fontSize:11, fontWeight:700, color:'#475569',
          textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4,
        }},
          mood.mood === 'disappointed'        ? '😤 Crick is disappointed'
          : mood.mood === 'legendary'         ? '🔥 Crick is on fire'
          : mood.mood === 'fired_up'          ? '⚡ Crick is hyped'
          : mood.mood === 'near_milestone'    ? '🎯 So close!'
          : mood.mood === 'post_pb'           ? '🏆 New PB!'
          : mood.mood === 'comeback_after_break' ? '👋 Crick missed you'
          : mood.mood === 'weekend_mode'      ? '🌤️ Weekend grind'
          : '🏏 Crick says'
        ),
        h('div', {style:{fontSize:13, color:'#cbd5e1', lineHeight:1.45, fontStyle:'italic'}},
          '"' + mood.msg + '"'
        ),
      ),
    )
  );
}
A.CrickHomeCard = CrickHomeCard;

// ── XP Spending (shop purchases) ────────────────────────────────
function spendXP(amount) {
  if (!A.DB) return false;
  var progress = A.DB.getProgress();
  if ((progress.total_xp || 0) < amount) return false;
  progress.total_xp = Math.max(0, (progress.total_xp || 0) - amount);
  A.DB.saveProgress(progress);
  window.dispatchEvent(new CustomEvent('sc_update'));
  return true;
}

// ── CrickPage — full dedicated page ─────────────────────────────
var TIER_TABS = [
  { id:'all',     label:'All' },
  { id:1,         label:'Free' },
  { id:2,         label:'Common' },
  { id:3,         label:'Rare' },
  { id:4,         label:'Epic' },
  { id:5,         label:'Legendary' },
  { id:6,         label:'Seasonal' },
];

function CrickPage() {
  var [colorKey, setColorKey] = useState(function(){
    return (A.DB && A.DB.get('crick_active_color')) || 'classic';
  });
  var [unlocked, setUnlocked] = useState(function(){
    return (A.DB && A.DB.get('crick_unlocked_colors')) || ['classic'];
  });
  var [xp, setXP] = useState(function(){
    var p = (A.DB && A.DB.getProgress()) || {};
    return p.total_xp || 0;
  });
  var [toast, setToast] = useState(null);
  var [tierFilter, setTierFilter] = useState('all');
  function readAccKeys() {
    var out = {};
    (A.ACCESSORY_TYPES || ['hat','eyes','effect']).forEach(function(t){
      out[t] = (A.DB && A.DB.get('crick_accessory_' + t)) || (A.ACCESSORY_DEFAULTS && A.ACCESSORY_DEFAULTS[t]) || 'none';
    });
    return out;
  }
  var [accessoryKey, setAccessoryKey] = useState(readAccKeys);
  var [unlockedAcc, setUnlockedAcc] = useState(function(){
    return (A.DB && A.DB.get('crick_unlocked_accessories')) || (A.ACCESSORY_DEFAULTS ? Object.values(A.ACCESSORY_DEFAULTS) : ['none','normal_eyes','no_effect']);
  });
  var [accTypeFilter, setAccTypeFilter] = useState('all');
  var mood = getCrickMood();
  var allColors = Object.values(A.CRICK_COLORS || {});
  var colors = tierFilter === 'all' ? allColors : allColors.filter(function(c){ return c.tier === tierFilter; });
  var allAccessories = Object.values(A.CRICK_ACCESSORIES || {});

  useEffect(function() {
    function onUpdate() {
      setColorKey((A.DB && A.DB.get('crick_active_color')) || 'classic');
      setUnlocked((A.DB && A.DB.get('crick_unlocked_colors')) || ['classic']);
      var p = (A.DB && A.DB.getProgress()) || {};
      setXP(p.total_xp || 0);
    }
    window.addEventListener('sc_update', onUpdate);
    return function() { window.removeEventListener('sc_update', onUpdate); };
  }, []);

  function showToast(msg, type) {
    setToast({msg:msg, type:type||'info'});
    setTimeout(function(){setToast(null);}, 2400);
  }

  function handleUnlock(col) {
    if (unlocked.includes(col.id)) {
      // Equip
      if (A.DB) A.DB.set('crick_active_color', col.id);
      setColorKey(col.id);
      window.dispatchEvent(new CustomEvent('sc_update'));
      showToast('Equipped ' + col.name + '!', 'success');
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      // Try to purchase
      if (xp < col.cost) {
        showToast('Need ' + col.cost + ' XP to unlock — earn more first!', 'error');
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
        return;
      }
      if (!spendXP(col.cost)) return;
      var newUnlocked = (unlocked || []).concat([col.id]);
      if (A.DB) {
        A.DB.set('crick_unlocked_colors', newUnlocked);
        A.DB.set('crick_active_color', col.id);
      }
      setUnlocked(newUnlocked);
      setColorKey(col.id);
      if (A.Emotion) try { A.Emotion.cheerMascot && A.Emotion.cheerMascot(); } catch(e) {}
      if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
      showToast('Unlocked ' + col.name + '! ' + col.cost + ' XP spent.', 'success');
    }
  }

  function handleAccessory(acc) {
    var isUnlocked = unlockedAcc.includes(acc.id);
    if (isUnlocked) {
      if (A.DB) A.DB.set('crick_accessory_' + acc.type, acc.id);
      var next = Object.assign({}, accessoryKey);
      next[acc.type] = acc.id;
      setAccessoryKey(next);
      window.dispatchEvent(new CustomEvent('sc_update'));
      showToast('Equipped ' + acc.name + '!', 'success');
      if (navigator.vibrate) navigator.vibrate(30);
    } else {
      if (xp < acc.cost) {
        showToast('Need ' + acc.cost + ' XP to unlock — earn more first!', 'error');
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
        return;
      }
      if (!spendXP(acc.cost)) return;
      var newUnlocked = (unlockedAcc || []).concat([acc.id]);
      if (A.DB) {
        A.DB.set('crick_unlocked_accessories', newUnlocked);
        A.DB.set('crick_accessory_' + acc.type, acc.id);
      }
      setUnlockedAcc(newUnlocked);
      var next2 = Object.assign({}, accessoryKey);
      next2[acc.type] = acc.id;
      setAccessoryKey(next2);
      if (A.Emotion) try { A.Emotion.cheerMascot && A.Emotion.cheerMascot(); } catch(e) {}
      if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
      showToast('Unlocked ' + acc.name + '! ' + acc.cost + ' XP spent.', 'success');
    }
  }

  var currentColor = (A.CRICK_COLORS && A.CRICK_COLORS[colorKey]) || (A.CRICK_COLORS && A.CRICK_COLORS.classic) || {};

  return h('div', {style:{
    minHeight:'100dvh', background:'#070b14',
    paddingBottom:80,
  }},
    // Header
    h('div', {style:{
      padding:'20px 16px 16px',
      background:'linear-gradient(180deg, rgba(10,15,30,0.98) 0%, transparent 100%)',
      borderBottom:'1px solid rgba(255,255,255,0.06)',
    }},
      h('div', {style:{fontSize:26, fontWeight:900, color:'#f8fafc', letterSpacing:'-0.02em'}}, 'Crick'),
      h('div', {style:{fontSize:12, color:'#475569', marginTop:2}}, currentColor.name || 'Classic Red'),
    ),

    // Crick display
    h('div', {style:{
      display:'flex', flexDirection:'column', alignItems:'center',
      padding:'32px 16px 20px', gap:12,
    }},
      h('div', {
        style:{
          filter:'drop-shadow(0 8px 32px ' + (currentColor.fill||'#b91c1c') + '44)',
          transition:'filter 0.4s ease',
          cursor: 'pointer',
        },
        onClick: function() {
          if (A.Emotion && A.Emotion.tapSpinMascot) A.Emotion.tapSpinMascot('crick-page-main');
          if (A.Emotion && A.Emotion.fireSparkleSVG) {
            var el = document.getElementById('crick-page-main-wrap');
            if (el) A.Emotion.fireSparkleSVG(el, { color: currentColor.fill || '#b91c1c' });
          }
        },
      },
        A.Crick ? h(A.Crick, {size:'xl', id:'crick-page-main'}) : h('div',{style:{fontSize:80}},'🏏')
      ),
      // Speech bubble
      h('div', {style:{
        background:'rgba(15,20,35,0.95)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:12, padding:'12px 16px',
        maxWidth:300, textAlign:'center',
        boxShadow:'0 4px 16px rgba(0,0,0,0.4)',
      }},
        h('div', {style:{fontSize:10, fontWeight:700, color:'#374151', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6}},
          mood.mood === 'disappointed'        ? '😤 Disappointed'
          : mood.mood === 'legendary'         ? '🔥 Legendary Mood'
          : mood.mood === 'fired_up'          ? '⚡ Fired Up'
          : mood.mood === 'near_milestone'    ? '🎯 So Close!'
          : mood.mood === 'post_pb'           ? '🏆 New PB'
          : mood.mood === 'comeback_after_break' ? '👋 Welcome Back'
          : mood.mood === 'weekend_mode'      ? '🌤️ Weekend Grind'
          : '💬 Daily Message'
        ),
        h('div', {style:{fontSize:14, color:'#cbd5e1', lineHeight:1.5, fontStyle:'italic'}},
          '"' + mood.msg + '"'
        ),
      ),
      // XP balance
      h('div', {style:{
        fontSize:13, color:'#6b7280', fontWeight:600,
        background:'rgba(255,255,255,0.04)', padding:'8px 16px', borderRadius:99,
        border:'1px solid rgba(255,255,255,0.08)',
      }},
        'Your XP: ', h('span',{style:{color:'#f59e0b', fontWeight:800}}, xp.toLocaleString())
      ),
    ),

    // Color Shop
    h('div', {style:{padding:'0 16px 20px'}},
      h('div', {style:{fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14}},
        'Color Shop  ·  ' + allColors.filter(function(c){return unlocked.includes(c.id);}).length + '/' + allColors.length + ' unlocked'
      ),
      // Tier filter tabs
      h('div', {style:{display:'flex', gap:8, overflowX:'auto', marginBottom:14, paddingBottom:4}},
        TIER_TABS.map(function(tab) {
          var isActive = tierFilter === tab.id;
          var lockedCount = tab.id === 'all' ? 0 : allColors.filter(function(c){ return c.tier === tab.id && !unlocked.includes(c.id); }).length;
          return h('button', {
            key: tab.id,
            onClick: function(){ setTierFilter(tab.id); },
            style:{
              flexShrink:0, padding:'8px 14px', borderRadius:99,
              background: isActive ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (isActive ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'),
              color: isActive ? '#4ade80' : '#9ca3af',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              whiteSpace:'nowrap',
            }
          }, tab.label + (lockedCount > 0 ? ' (' + lockedCount + ' 🔒)' : ''));
        })
      ),
      h('div', {style:{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}},
        colors.map(function(col) {
          var isUnlocked = unlocked.includes(col.id);
          var isActive   = colorKey === col.id;
          return h('button', {
            key: col.id,
            onClick: function(){ handleUnlock(col); },
            style:{
              display:'flex', flexDirection:'column', alignItems:'center', gap:8,
              padding:'14px 10px',
              background: isActive ? 'rgba(255,255,255,0.07)' : 'rgba(10,15,25,0.8)',
              border: isActive ? '2px solid ' + col.fill : '2px solid rgba(255,255,255,0.08)',
              borderRadius:14, cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s',
              boxShadow: isActive ? ('0 0 16px ' + col.fill + '44') : 'none',
              position:'relative', overflow:'hidden',
            }
          },
            // Color swatch (mini Crick ball)
            h('div', {style:{
              width:52, height:52, borderRadius:'50%',
              background: col.fill,
              border:'3px solid ' + col.stroke,
              position:'relative',
              opacity: isUnlocked ? 1 : 0.5,
            }},
              // Seam lines
              h('div', {style:{
                position:'absolute', inset:0, borderRadius:'50%',
                background:'transparent',
                boxShadow:'inset 0 0 0 1px ' + col.seam + '44',
              }}),
              !isUnlocked && h('div', {style:{
                position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center',
                background:'rgba(0,0,0,0.4)', borderRadius:'50%',
                fontSize:18,
              }}, '🔒'),
            ),
            h('div', {style:{fontSize:10, fontWeight:800, color: isActive ? '#e5e7eb' : '#9ca3af',
              textAlign:'center', lineHeight:1.3}},
              col.name
            ),
            h('div', {style:{
              fontSize:10, fontWeight:700,
              color: isActive ? '#4ade80' : isUnlocked ? '#10b981' : '#f59e0b',
            }},
              isActive ? 'Equipped ✓' : isUnlocked ? 'Equip' : col.cost + ' XP'
            ),
          );
        })
      ),
    ),

    // Accessories
    h('div', {style:{padding:'0 16px 20px'}},
      h('div', {style:{fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:14}},
        'Accessories  ·  ' + allAccessories.filter(function(a){return unlockedAcc.includes(a.id);}).length + '/' + allAccessories.length + ' unlocked'
      ),
      // Type filter tabs
      h('div', {style:{display:'flex', gap:8, overflowX:'auto', marginBottom:14, paddingBottom:4}},
        [{id:'all',label:'All',icon:'🧰'},{id:'hat',label:'Hats',icon:'🎩'},{id:'eyes',label:'Eyes',icon:'👀'},
         {id:'effect',label:'Auras',icon:'✨'},{id:'bat',label:'Bats',icon:'🏏'},{id:'badge',label:'Badges',icon:'🎖️'},
         {id:'background',label:'Backdrops',icon:'🖼️'}].map(function(tab){
          var isActive = accTypeFilter === tab.id;
          return h('button', {
            key: tab.id,
            onClick: function(){ setAccTypeFilter(tab.id); },
            style:{
              flexShrink:0, padding:'8px 14px', borderRadius:99,
              background: isActive ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)',
              border: '1px solid ' + (isActive ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.08)'),
              color: isActive ? '#4ade80' : '#9ca3af',
              fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              whiteSpace:'nowrap',
            }
          }, tab.icon + ' ' + tab.label);
        })
      ),
      h('div', {style:{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}},
        allAccessories.filter(function(acc){ return accTypeFilter === 'all' || acc.type === accTypeFilter; }).map(function(acc) {
          var isUnlocked = unlockedAcc.includes(acc.id);
          var isActive   = accessoryKey[acc.type] === acc.id;
          var TYPE_ICON = {hat:'🎩', eyes:'👀', effect:'✨', bat:'🏏', badge:'🎖️', background:'🖼️'};
          return h('button', {
            key: acc.id,
            onClick: function(){ handleAccessory(acc); },
            style:{
              display:'flex', flexDirection:'column', alignItems:'center', gap:8,
              padding:'14px 10px',
              background: isActive ? 'rgba(255,255,255,0.07)' : 'rgba(10,15,25,0.8)',
              border: isActive ? '2px solid #10b981' : '2px solid rgba(255,255,255,0.08)',
              borderRadius:14, cursor:'pointer', fontFamily:'inherit',
              transition:'all 0.2s', position:'relative',
            }
          },
            h('div', {style:{
              width:44, height:44, borderRadius:12,
              background:'rgba(255,255,255,0.05)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:20, opacity: isUnlocked ? 1 : 0.4, position:'relative',
            }},
              TYPE_ICON[acc.type] || '✨',
              !isUnlocked && h('div', {style:{
                position:'absolute', fontSize:14,
              }}, '🔒')
            ),
            h('div', {style:{fontSize:10, fontWeight:800, color: isActive ? '#e5e7eb' : '#9ca3af', textAlign:'center', lineHeight:1.3}},
              acc.name
            ),
            h('div', {style:{
              fontSize:10, fontWeight:700,
              color: isActive ? '#4ade80' : isUnlocked ? '#10b981' : '#f59e0b',
            }},
              isActive ? 'Equipped ✓' : isUnlocked ? 'Equip' : (acc.cost > 0 ? acc.cost + ' XP' : 'Free')
            ),
          );
        })
      ),
    ),

    // Daily Nets section
    h('div', {style:{padding:'0 0 20px'}},
      h('div', {style:{fontSize:11, fontWeight:800, color:'#374151', textTransform:'uppercase', letterSpacing:'0.1em', padding:'0 16px', marginBottom:12}},
        'Today\'s Net Session'
      ),
      h(CrickNetsCard, {}),
    ),

    // Toast notification
    toast && h('div', {style:{
      position:'fixed', bottom:90, left:'50%', transform:'translateX(-50%)',
      background: toast.type === 'success' ? 'rgba(16,185,129,0.95)' : toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(30,40,60,0.95)',
      color:'#fff', padding:'10px 20px', borderRadius:99,
      fontSize:13, fontWeight:700, zIndex:9999,
      boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
      whiteSpace:'nowrap',
    }}, toast.msg),
  );
}
A.CrickPage = CrickPage;

// ── CrickNudge — global "stay engaged" speech-bubble banner ──────
// Shows a brief Crick message when the user returns to the tab after
// being away, or when they're close to a milestone / haven't done
// today's session. Frequency-capped to avoid notification fatigue —
// at most one nudge per cooldown window.
var CRICK_NUDGE_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
var CRICK_NUDGE_AWAY_THRESHOLD_MS = 30 * 60 * 1000; // 30 min

function getCrickNudgeMessage() {
  var p = (A.DB && A.DB.getProgress()) || {};
  var today = new Date().toISOString().slice(0, 10);
  var netsKey = 'crick_nets_' + today;
  var nets = A.DB ? A.DB.get(netsKey) : null;
  var hour = new Date().getHours();

  // Streak milestone close
  var streak = p.current_streak || 0;
  if (streak === 6 || streak === 13 || streak === 29) {
    return "One more session and you hit a " + (streak + 1) + "-day streak. Don't stop now!";
  }
  // Unclaimed nets reward sitting around
  if (nets && !nets.claimed) {
    return "Crick scored " + nets.runs + " runs in the nets today — don't forget to claim your XP!";
  }
  // Late in the day, no session yet
  if (hour >= 18 && (!p.last_active_date || p.last_active_date !== today)) {
    return "Still time for today's session — even a short one keeps the streak alive.";
  }
  // Welcome back after time away
  return "Welcome back! Ready to pick up where you left off?";
}

function CrickNudge() {
  var [nudge, setNudge] = useState(null);

  useEffect(function() {
    if (!A.DB) return;
    var lastSeenKey = 'crick_nudge_last_shown';
    var lastAwayKey = 'crick_nudge_last_active_at';

    function maybeShow(reason) {
      var now = Date.now();
      var lastShown = A.DB.get(lastSeenKey) || 0;
      if (now - lastShown < CRICK_NUDGE_COOLDOWN_MS) return;
      var msg = getCrickNudgeMessage();
      if (!msg) return;
      A.DB.set(lastSeenKey, now);
      setNudge({ msg: msg });
      if (A.Emotion && A.Emotion.cheerMascot) A.Emotion.cheerMascot();
      setTimeout(function() { setNudge(null); }, 6000);
    }

    function onVisibility() {
      if (document.visibilityState !== 'visible') {
        A.DB.set(lastAwayKey, Date.now());
        return;
      }
      var lastActive = A.DB.get(lastAwayKey) || 0;
      if (Date.now() - lastActive >= CRICK_NUDGE_AWAY_THRESHOLD_MS) {
        maybeShow('return');
      }
    }

    document.addEventListener('visibilitychange', onVisibility);
    return function() { document.removeEventListener('visibilitychange', onVisibility); };
  }, []);

  if (!nudge) return null;

  return h('div', {
    role: 'status', 'aria-live': 'polite',
    style: {
      position: 'fixed', left: '50%', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 78px)',
      transform: 'translateX(-50%)', zIndex: 8500,
      display: 'flex', alignItems: 'center', gap: 10,
      maxWidth: 'calc(100vw - 32px)', width: 360,
      background: 'rgba(10,15,30,0.97)', border: '1px solid rgba(74,222,128,0.3)',
      borderRadius: 14, padding: '10px 14px',
      boxShadow: '0 8px 28px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
    }
  },
    h('div', {style:{flexShrink:0}},
      A.Crick ? h(A.Crick, {size:'sm', id:'crick-nudge'}) : h('div',{style:{fontSize:28}},'🏏')
    ),
    h('div', {style:{flex:1, fontSize:13, color:'#cbd5e1', lineHeight:1.4}}, nudge.msg),
    h('button', {
      onClick: function() { setNudge(null); },
      'aria-label': 'Dismiss',
      style: {
        flexShrink:0, background:'none', border:'none', color:'#6b7280',
        fontSize:18, lineHeight:1, cursor:'pointer', padding:4,
      }
    }, '×')
  );
}
A.CrickNudge = CrickNudge;

// ── CRICK_TIPS data — contextual tips per page ───────────────────
A.CRICK_TIPS = {
  general: [
    "Consistency beats talent. Show up every day.",
    "Track everything — what gets measured, gets improved.",
    "Your best innings is always the next one.",
  ],
  drills: [
    "Slow practice makes perfect execution under pressure.",
    "Focus on one technique per session — don't scatter.",
    "Shadow batting before nets — your brain leads your hands.",
    "Record your sessions. You'll spot patterns you can't feel.",
  ],
  mental: [
    "Breathe before every ball. Two seconds of calm wins matches.",
    "Visualize the shot before you play it. Your brain can't tell the difference.",
    "Pressure is just excitement without breath. Control the breath.",
  ],
  skillpaths: [
    "Pick one path and finish it. Depth beats breadth.",
    "Week 3 is always the hardest. Don't quit in week 3.",
    "Your skill path is your curriculum. Follow it.",
    "Each completed path permanently raises your ceiling.",
  ],
  profile: [
    "Your stats don't lie. Train your weakest number.",
    "XP is just a mirror — it shows what you've actually done.",
    "Share your progress. Accountability accelerates everything.",
  ],
  schedule: [
    "Schedule it or skip it. Unplanned sessions rarely happen.",
    "Morning sessions have 73% higher completion rates.",
    "Even 15 minutes is a win. Schedule the minimum.",
  ],
  fitness: [
    "Cricket fitness is explosive power + endurance. Train both.",
    "Most wickets fall in the last 10 overs. Be the fittest player on the field.",
    "3 sessions a week beats 7 sessions then burnout.",
    "Core strength is batting strength. Never skip core day.",
  ],
  home: [
    "One session today is worth more than ten sessions planned.",
    "Champions don't wait for motivation. They build discipline.",
    "The best training is the training you actually do.",
  ],
};

// ── CrickTip component — contextual tip card ─────────────────────
function CrickTip(props) {
  var context  = props.context  || 'general';
  var trigger  = props.trigger  || 'first_visit';
  var onDismiss = props.onDismiss;

  var storageKey = 'crick_tip_' + context + '_' + trigger;
  var [visible, setVisible] = useState(function() {
    if (!A.DB) return false;
    var ts = A.DB.get(storageKey);
    if (!ts) return true;
    if (trigger === 'always') return true;
    // Hide if dismissed within 24h
    return (Date.now() - ts) > 86400000;
  });

  if (!visible) return null;

  var tips = A.CRICK_TIPS[context] || A.CRICK_TIPS.general;
  var d = new Date();
  var seed = d.getFullYear() * 1000 + d.getMonth() * 31 + d.getDate() + context.length;
  var tip = tips[seed % tips.length];

  function dismiss() {
    if (A.DB) A.DB.set(storageKey, Date.now());
    setVisible(false);
    if (onDismiss) onDismiss();
  }

  return h('div', {
    style: {
      margin: '8px 16px',
      padding: '12px 14px',
      background: 'rgba(10,15,30,0.95)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12,
      display: 'flex', alignItems: 'flex-start', gap: 10,
    }
  },
    h('div', { style: { flexShrink: 0, marginTop: 2 } },
      A.Crick ? h(A.Crick, { size: 'sm', id: 'crick-tip-' + context }) : h('span', { style: { fontSize: 24 } }, '🏏')
    ),
    h('div', { style: { flex: 1, minWidth: 0 } },
      h('div', { style: { fontSize: 11, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 } },
        'Crick says'
      ),
      h('div', { style: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.45, fontStyle: 'italic' } },
        '"' + tip + '"'
      ),
    ),
    h('button', {
      onClick: dismiss,
      'aria-label': 'Dismiss tip',
      style: {
        flexShrink: 0, background: 'none', border: 'none',
        color: '#374151', cursor: 'pointer', padding: '0 4px',
        fontSize: 18, lineHeight: 1,
      },
    }, '×'),
  );
}
A.CrickTip = CrickTip;

console.log('[SC] app-crick.js v1.1 — Crick system + CrickTip ready');
})();
