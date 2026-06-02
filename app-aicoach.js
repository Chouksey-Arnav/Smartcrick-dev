// Save as: app-aicoach.js  (NEW FILE — was entirely missing)
// ================================================================
// SmartCrick — AI Head Coach v1.0
// Uses backend: smartcrick-backend-kgya.vercel.app/api/coach
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var A = window.SC_APP;
var DB = A.DB;
var nav = A.nav;

var BACKEND = 'https://smartcrick-backend-kgya.vercel.app';

var STARTERS = [
  'How can I improve my cover drive?',
  'Build me a pre-match mental routine',
  'Tips for bowling a consistent line & length?',
  'How do I handle nerves when batting?',
  'Best drills to improve my fielding?',
];

var FALLBACKS = {
  batting: "For batting improvement:\n1. Head position — still and behind the ball at all times\n2. Front elbow up on all drives for better control\n3. Watch the ball from the bowler's hand (not from pitch-up)\n4. Use the Cover Drive Mastery and Defensive Block drills in the Drills section\n5. Hit at least 50 shadow shots before every batting session 🏏",
  bowling: "For bowling improvement:\n1. Land in your target zone — consistency beats variation at all levels\n2. Load up your front hip in the delivery stride for more pace\n3. Seam upright for outswing, tilted in for inswing\n4. The Line & Length Precision and Yorker Death Bowling drills are essential\n5. Bowl 20 target balls at the end of every net session 🎯",
  fielding: "For fielding:\n1. Body BEHIND the ball on every ground fielding attempt — never just reach\n2. Soft hands on catches — let the ball come to you\n3. Side-on throwing position generates 20% more power\n4. Work through Ground Fielding Excellence and Throwing Accuracy drills\n5. Fielding is where matches are won and lost — 10 mins daily 🤸",
  mental: "For mental performance:\n1. Build a 3-step between-ball reset: break eye contact → deep breath → visualise next ball\n2. Focus only on THIS ball — not the last one, not the match situation\n3. Use the Pressure Is Privilege and Beat Fear of Failure sessions in Mental Training\n4. Write 3 wins (no matter how small) in your journal after every session\n5. Your mental game IS your game 🧠",
  fitness: "For cricket fitness:\n1. Sprint work matters more than long running — 20m shuttles 3x/week\n2. Core strength directly improves every cricket skill — plank, deadbugs, Pallof press\n3. Shoulder prehab: 5 mins of band work before every session\n4. Check the Fitness section for cricket-specific workouts\n5. Sleep 8 hours — that's your best performance enhancer 💪",
};

function getFallback(q) {
  q = q.toLowerCase();
  if(/bat|drive|sweep|cut|pull|lbw|wicket|run/.test(q)) return FALLBACKS.batting;
  if(/bowl|swing|spin|seam|pace|yorker|over/.test(q)) return FALLBACKS.bowling;
  if(/field|catch|throw|ground|slip|gully/.test(q)) return FALLBACKS.fielding;
  if(/mental|mind|nervous|pressure|confident|anxiety|fear|focus|stress/.test(q)) return FALLBACKS.mental;
  if(/fit|strength|gym|run|cardio|exercise|train/.test(q)) return FALLBACKS.fitness;
  return "Great question! Right now I'm in offline mode. Here's what I'd suggest:\n\n1. Check your Today's Mission on the Home screen for personalised drills\n2. Log your last session in the Progress section\n3. Try a 6-min mental session to sharpen your focus\n\nWhen you're back online, I'll give you a fully personalised response. Keep grinding! 💪🏏";
}

function buildContext() {
  var p  = DB.getProgress();
  var u  = DB.getUser();
  var li = A.getLevelInfo ? A.getLevelInfo(p.total_xp || 0) : { level:1, name:'Rookie' };
  var base = 'Player: '+(u.name||'Cricketer')+
             ' | Role: '+(u.role||'batsman')+
             ' | Level: '+li.level+' ('+li.name+')'+
             ' | Streak: '+(p.current_streak||0)+'d'+
             ' | Drills: '+(p.drills_done||0)+
             ' | Mental: '+(p.mental_done||0)+
             ' | Total XP: '+(p.total_xp||0);
  // Inject intelligence profile when sufficiently calibrated
  try {
    if (window.SC_INTEL) {
      var intel = window.SC_INTEL.getProfile();
      var cal   = intel.calibration;
      if (cal.confidence_score >= 10) {
        var topCat = window.SC_INTEL.getTopCategory(intel.drill_affinity.category);
        var intelCtx = ' | AI Score: '+cal.confidence_score+'%'+
                       ' | Training cycles: '+cal.total_cycles+
                       ' | Top affinity: '+topCat+
                       ' | Preference signals: '+cal.preference_signals+
                       ' | Days of data: '+cal.days_of_behavioral_data;
        if (intel.patterns.peak_hour !== null) {
          intelCtx += ' | Peak training hour: '+intel.patterns.peak_hour+'h';
        }
        if (intel.patterns.consistency_rhythm) {
          intelCtx += ' | Training rhythm: '+intel.patterns.consistency_rhythm;
        }
        base += intelCtx;
      }
    }
  } catch(e) {}
  return base;
}

async function callCoach(history) {
  var res = await fetch(BACKEND+'/api/coach', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ messages:history.slice(-8), context:buildContext() }),
    signal: AbortSignal.timeout ? AbortSignal.timeout(12000) : undefined,
  });
  if(!res.ok) throw new Error('HTTP '+res.status);
  var d = await res.json();
  return d.message || d.content || d.reply || 'No response from coach.';
}

function Dot({ delay }) {
  return h('div', { style:{
    width:7, height:7, borderRadius:'50%', background:'#22c55e',
    animation:'sc-dot-bounce 1.2s ease-in-out infinite',
    animationDelay:delay+'s',
  }});
}

function Bubble({ msg, animate }) {
  var isAI = msg.role === 'assistant';
  return h('div', {
    style:{
      display:'flex', alignItems:'flex-start', gap:9,
      flexDirection: isAI ? 'row' : 'row-reverse',
      animation: animate ? 'sc-bubble-in 0.22s ease' : 'none',
    }
  },
    isAI && h('div', { style:{
      width:32, height:32, borderRadius:9, flexShrink:0, marginTop:2,
      background:'linear-gradient(135deg,#16a34a,#0d9488)',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
    }}, '🤖'),
    h('div', { style:{
      maxWidth:'76%', padding:'11px 14px',
      borderRadius: isAI ? '3px 14px 14px 14px' : '14px 3px 14px 14px',
      background: isAI ? 'rgba(22,27,34,0.95)' : 'linear-gradient(135deg,#16a34a,#0d9488)',
      border: isAI ? '1px solid rgba(48,54,61,0.8)' : 'none',
      fontSize:13, color:'#f0fdf4', lineHeight:1.68, fontWeight: isAI ? 400 : 500,
      whiteSpace:'pre-wrap',
    }}, msg.content)
  );
}

function AICoachPage() {
  var initMsg = { role:'assistant', content:"Hi! I'm your SmartCrick AI Coach. Ask me anything — batting, bowling, fielding, fitness, or mental performance. What would you like to work on today? 🏏" };
  var [msgs, setMsgs] = useState([initMsg]);
  var [input, setInput] = useState('');
  var [busy, setBusy] = useState(false);
  var [offline, setOffline] = useState(false);
  var [lastIdx, setLastIdx] = useState(0);
  var bottomRef = useRef(null);
  var inputRef = useRef(null);

  useEffect(function() {
    if(bottomRef.current) bottomRef.current.scrollIntoView({ behavior:'smooth' });
  }, [msgs, busy]);

  async function send(text) {
    text = (text||'').trim();
    if(!text || busy) return;
    var userMsg = { role:'user', content:text };
    var newHistory = msgs.concat([userMsg]);
    setMsgs(newHistory);
    setInput('');
    setBusy(true);
    setLastIdx(newHistory.length);
    try {
      var reply = await callCoach(newHistory);
      setMsgs(function(prev) { return prev.concat([{ role:'assistant', content:reply }]); });
      setOffline(false);
    } catch(e) {
      setOffline(true);
      var fallback = getFallback(text);
      setMsgs(function(prev) { return prev.concat([{ role:'assistant', content:fallback+'\n\n_[Offline mode — connect for AI coaching]_' }]); });
    }
    setBusy(false);
  }

  function handleKey(e) {
    if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return h('div', {
    style:{ background:'#0d1117', minHeight:'100dvh', display:'flex', flexDirection:'column' }
  },
    // ── KEYFRAMES (injected once) ──
    h('style', null,
      '@keyframes sc-dot-bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}'+
      '@keyframes sc-bubble-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'
    ),

    // ── HEADER ──
    h('div', { style:{
      padding:'max(3.4rem,calc(3.4rem + env(safe-area-inset-top))) 16px 14px',
      background:'rgba(8,11,15,0.95)', borderBottom:'1px solid rgba(48,54,61,0.8)', flexShrink:0,
    }},
      h('div', { style:{ display:'flex', alignItems:'center', gap:12 }},
        h('button', {
          onClick:function(){nav('Home');}, 'aria-label':'Back to home',
          style:{ background:'rgba(255,255,255,0.06)', border:'none', borderRadius:8,
            padding:'7px 11px', color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:600,
            fontFamily:'inherit', flexShrink:0, minWidth:44, minHeight:36, display:'flex', alignItems:'center',
          }
        }, '‹'),
        h('div', { style:{ width:40, height:40, borderRadius:10, flexShrink:0,
          background:'linear-gradient(135deg,#16a34a,#0d9488)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}, '🤖'),
        h('div', null,
          h('div', { style:{ fontSize:15, fontWeight:800, color:'#f0fdf4' }}, 'AI Head Coach'),
          h('div', { style:{ fontSize:11, color: offline ? '#f59e0b' : '#16a34a', fontWeight:600 }},
            offline ? '⚠ Offline mode' : '● SmartCrick Intelligence'
          )
        )
      )
    ),

    // ── MESSAGES ──
    h('div', { style:{ flex:1, overflowY:'auto', padding:'14px 16px', display:'flex', flexDirection:'column', gap:10 }},
      msgs.map(function(m, i) { return h(Bubble, { key:i, msg:m, animate:i >= lastIdx }); }),
      busy && h('div', { style:{ display:'flex', gap:9, alignItems:'flex-start' }},
        h('div', { style:{ width:32, height:32, borderRadius:9, flexShrink:0, marginTop:2,
          background:'linear-gradient(135deg,#16a34a,#0d9488)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}, '🤖'),
        h('div', { style:{ padding:'13px 14px', borderRadius:'3px 14px 14px 14px',
          background:'rgba(22,27,34,0.95)', border:'1px solid rgba(48,54,61,0.8)' }},
          h('div', { style:{ display:'flex', gap:4, alignItems:'center' }},
            h(Dot, {delay:0}), h(Dot, {delay:0.2}), h(Dot, {delay:0.4})
          )
        )
      ),
      h('div', { ref:bottomRef })
    ),

    // ── STARTER PROMPTS ──
    msgs.length <= 1 && h('div', { style:{ padding:'0 16px 8px', display:'flex', gap:7, overflowX:'auto',
      scrollbarWidth:'none', flexShrink:0 }},
      STARTERS.map(function(s, i) {
        return h('button', { key:i, onClick:function(){ send(s); }, style:{
          flexShrink:0, padding:'7px 12px', borderRadius:99,
          background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.22)',
          color:'#4ade80', fontSize:12, fontWeight:600, cursor:'pointer',
          fontFamily:'inherit', whiteSpace:'nowrap',
        }}, s);
      })
    ),

    // ── INPUT BAR ──
    h('div', { style:{
      padding:'10px 16px', paddingBottom:'calc(10px + env(safe-area-inset-bottom,0px))',
      borderTop:'1px solid rgba(48,54,61,0.8)', background:'rgba(6,8,12,0.97)', flexShrink:0,
    }},
      h('div', { style:{ display:'flex', gap:8, alignItems:'flex-end' }},
        h('textarea', {
          ref:inputRef, value:input, rows:1,
          onChange:function(e){ setInput(e.target.value); },
          onKeyDown:handleKey,
          placeholder:'Ask your cricket coach...',
          style:{
            flex:1, padding:'11px 13px', background:'rgba(22,27,34,0.9)',
            border:'1px solid rgba(48,54,61,0.8)', borderRadius:11,
            color:'#f0fdf4', fontSize:14, fontFamily:'inherit', resize:'none',
            outline:'none', maxHeight:100, overflow:'auto', lineHeight:1.55,
          },
          onFocus:function(e){ e.target.style.borderColor='rgba(22,163,74,0.5)'; },
          onBlur:function(e){ e.target.style.borderColor='rgba(48,54,61,0.8)'; },
        }),
        h('button', {
          onClick:function(){ send(input); }, disabled:!input.trim()||busy,
          'aria-label':'Send message',
          style:{
            width:44, height:44, borderRadius:11, border:'none', flexShrink:0,
            cursor: input.trim()&&!busy ? 'pointer' : 'not-allowed',
            background: input.trim()&&!busy
              ? 'linear-gradient(135deg,#16a34a,#0d9488)'
              : 'rgba(48,54,61,0.4)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:18, color:'#fff', transition:'background 0.15s',
          }
        }, '↑')
      )
    )
  );
}

A.AICoachPage = AICoachPage;
console.log('[SC] app-aicoach v1.0 — AI Head Coach ready');
})();
