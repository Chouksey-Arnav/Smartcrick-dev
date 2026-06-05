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
];

function getTodaysCrickMessage() {
  var d = new Date();
  var seed = d.getFullYear() * 1000 + d.getMonth() * 31 + d.getDate();
  return CRICK_MESSAGES[seed % CRICK_MESSAGES.length];
}
A.getTodaysCrickMessage = getTodaysCrickMessage;

// ── Crick Mood (Duolingo-style engagement) ───────────────────────
function getCrickMood() {
  var p = (A.DB && A.DB.getProgress()) || {};
  var last    = p.last_active_date || null;
  var streak  = p.current_streak   || 0;
  var today   = new Date().toISOString().slice(0, 10);
  var yest    = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (last && last < yest) {
    return { mood: 'disappointed', msg: "I went to the nets alone yesterday... where were you?" };
  }
  if (streak >= 30) return { mood: 'legendary', msg: "30 days. You've become the ball." };
  if (streak >= 14) return { mood: 'fired_up',   msg: "Fourteen days straight. Legends are made this way." };
  if (streak >= 7)  return { mood: 'hot',        msg: "Seven days in a row. The crease is yours." };
  if (streak === 0) return { mood: 'waiting',    msg: "The crease is empty. Let's change that." };
  return { mood: 'happy', msg: getTodaysCrickMessage() };
}
A.getCrickMood = getCrickMood;

// ── Daily Crick Nets Mechanic ────────────────────────────────────
var NETS_WEIGHTS = [
  {runs:5, w:14},{runs:8, w:15},{runs:12,w:14},{runs:15,w:12},
  {runs:20,w:11},{runs:25,w:10},{runs:35,w:8}, {runs:42,w:6},
  {runs:50,w:5}, {runs:60,w:3}, {runs:75,w:2},
];

function getCrickNetsData() {
  if (!A.DB) return {runs:20, claimed:false, generated_at:Date.now()};
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
function CrickNetsCard() {
  var [data, setData]         = useState(function(){ return getCrickNetsData(); });
  var [claiming, setClaiming] = useState(false);
  var [justClaimed, setJustClaimed] = useState(false);
  var yesterday = getYesterdayNetsData();
  var today = new Date().toISOString().slice(0, 10);

  function handleClaim() {
    if (data.claimed || claiming) return;
    setClaiming(true);
    if (A.awardXP) A.awardXP(data.runs, 0, 'crick_nets', null, null);
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
        data.claimed && h('div', {style:{
          fontSize:10, fontWeight:700, color:'#10b981',
          background:'rgba(16,185,129,0.12)', padding:'3px 8px', borderRadius:99,
        }}, 'Claimed ✓'),
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
          mood.mood === 'disappointed' ? '😤 Crick is disappointed'
          : mood.mood === 'legendary'  ? '🔥 Crick is on fire'
          : mood.mood === 'fired_up'   ? '⚡ Crick is hyped'
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
  var mood = getCrickMood();
  var colors = Object.values(A.CRICK_COLORS || {});

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
      h('div', {style:{
        filter:'drop-shadow(0 8px 32px ' + (currentColor.fill||'#b91c1c') + '44)',
        transition:'filter 0.4s ease',
      }},
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
          mood.mood === 'disappointed' ? '😤 Disappointed'
          : mood.mood === 'legendary'  ? '🔥 Legendary Mood'
          : mood.mood === 'fired_up'   ? '⚡ Fired Up'
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
        'Color Shop'
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

console.log('[SC] app-crick.js v1.0 — Crick system ready');
})();
