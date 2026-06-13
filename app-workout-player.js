// ================================================================
// app-workout-player.js — SmartCrick Immersive Workout Player v6.0
//  • Structured sessions: WARM-UP → MAIN WORK → COOL-DOWN
//  • "GET READY" prep countdown before every timed hold / sprint
//    (so you're in position before the clock starts)
//  • Clean, pleasant Web-Audio cues (shared AudioContext, no drone)
//  • Per-rep vs hold vs cardio handled correctly
//  • End-of-session difficulty rating → auto-regulates next time
// ================================================================
(function() {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A = window.SC_APP;

// ─── Rest fallbacks by level (used only if a set has none) ────
var REST = {
  beginner:     { sets: 45, between: 60 },
  intermediate: { sets: 35, between: 45 },
  advanced:     { sets: 30, between: 40 },
  pro:          { sets: 25, between: 35 },
};

// ─── Level config ─────────────────────────────────────────────
var LVL = {
  beginner:     { col:'#34d399', grad:'#065f46,#059669', glow:'rgba(52,211,153,0.35)',  orb:'rgba(52,211,153,0.12)'  },
  intermediate: { col:'#60a5fa', grad:'#1e40af,#3b82f6', glow:'rgba(96,165,250,0.35)',  orb:'rgba(96,165,250,0.10)'  },
  advanced:     { col:'#c084fc', grad:'#6d28d9,#9333ea', glow:'rgba(192,132,252,0.35)', orb:'rgba(192,132,252,0.10)' },
  pro:          { col:'#f87171', grad:'#991b1b,#ef4444', glow:'rgba(248,113,113,0.35)', orb:'rgba(248,113,113,0.10)' },
};

var BLOCK_META = {
  warmup:   { label:'WARM-UP',   col:'#fbbf24', emoji:'🔥' },
  main:     { label:null,        col:null,      emoji:'' },
  cooldown: { label:'COOL-DOWN', col:'#38bdf8', emoji:'🧊' },
};

// ─── Motivation (context-aware) ───────────────────────────────
var MOTIVATIONS = [
  'Push harder! 🔥', "You've got this! 💪", 'Every rep builds a champion!',
  'Cricket legend in the making! 🏏', 'Champions are forged right here!',
  'Embrace the burn — it means growth!', 'Stay locked in. Stay focused.',
  'Beast mode: ON 💪', "Don't stop. Not now. Not ever.",
  'Elite cricketers train exactly like this! 🏆', 'Your future self will thank you.',
  'This is what separates good from great.',
];
var REST_QUOTES = [
  'Breathe. Your muscles are growing right now.',
  'Rest smart. Then go harder.',
  'Elite athletes recover as hard as they train.',
  'This rest is part of the training.',
  'Take it in — you earned every second.',
  'Recover. Reload. Dominate.',
];
var WARM_QUOTE = "Loosen up — we're getting the body ready to perform.";
var COOL_QUOTE = 'Breathe it out. This is where recovery begins.';

// ════════════════════════════════════════════════════════════
//  AUDIO — one shared AudioContext, short & pleasant cues
// ════════════════════════════════════════════════════════════
function actx() {
  if (!window._scAudioCtx) {
    try { window._scAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  var c = window._scAudioCtx;
  if (c && c.state === 'suspended') { try { c.resume(); } catch(e) {} }
  return c;
}
// single short tone with a soft attack and gentle decay
function tone(freq, startOffset, dur, vol, type) {
  var c = actx(); if (!c) return;
  try {
    var o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type || 'triangle';
    var t = c.currentTime + (startOffset || 0);
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.start(t); o.stop(t + dur + 0.03);
  } catch(e) {}
}
// soft metronome tick during countdowns
function playTick()    { tone(620, 0, 0.06, 0.045, 'triangle'); }
// pleasant rising "go" when a timer ends / rest is over
function playGo()      { tone(784, 0, 0.12, 0.09, 'triangle'); tone(1047, 0.07, 0.13, 0.07, 'triangle'); }
// gentle confirmation when a set is logged
function playSetDone() { tone(880, 0, 0.10, 0.07, 'triangle'); }
// short, bright arpeggio when the whole workout is complete (no 2s drone!)
function playComplete() {
  tone(523, 0.00, 0.16, 0.09, 'triangle');
  tone(659, 0.10, 0.16, 0.09, 'triangle');
  tone(784, 0.20, 0.16, 0.09, 'triangle');
  tone(1047,0.30, 0.34, 0.11, 'triangle');
}

// ─── Inject CSS keyframes once ────────────────────────────────
function injectStyles() {
  if (document.getElementById('sc-wp-styles')) return;
  var s = document.createElement('style');
  s.id = 'sc-wp-styles';
  s.textContent = [
    '@keyframes scBgPulse{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}',
    '@keyframes scOrb1{0%,100%{transform:translate(0,0) scale(1);opacity:.7}33%{transform:translate(7%,8%) scale(1.12);opacity:.9}66%{transform:translate(-4%,12%) scale(.9);opacity:.55}}',
    '@keyframes scOrb2{0%,100%{transform:translate(0,0) scale(1);opacity:.55}40%{transform:translate(-9%,-7%) scale(1.18);opacity:.75}70%{transform:translate(5%,-4%) scale(.85);opacity:.4}}',
    '@keyframes scOrb3{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.35}50%{transform:translate(-47%,-53%) scale(1.22);opacity:.55}}',
    '@keyframes scPrepPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.06);opacity:.85}}',
  ].join('');
  document.head.appendChild(s);
}

// ─── Athletic animated background ────────────────────────────
function AthleticBg(props) {
  var orbColor = (props.lvl && props.lvl.orb) || 'rgba(52,211,153,0.10)';
  useEffect(function() { injectStyles(); }, []);
  return h('div', { style:{ position:'fixed', inset:0, zIndex:0, overflow:'hidden',
      background:'linear-gradient(-45deg,#060912,#0c1928,#071814,#100718)',
      backgroundSize:'400% 400%', animation:'scBgPulse 22s ease infinite' } },
    h('div', { style:{ position:'absolute', borderRadius:'50%', width:'75vw', height:'75vw', maxWidth:520, maxHeight:520,
      top:'-12%', left:'-14%', background:'radial-gradient(circle,' + orbColor + ' 0%,transparent 65%)', animation:'scOrb1 13s ease-in-out infinite' }}),
    h('div', { style:{ position:'absolute', borderRadius:'50%', width:'65vw', height:'65vw', maxWidth:440, maxHeight:440,
      bottom:'-8%', right:'-10%', background:'radial-gradient(circle,rgba(59,130,246,0.09) 0%,transparent 65%)', animation:'scOrb2 17s ease-in-out infinite' }}),
    h('div', { style:{ position:'absolute', borderRadius:'50%', width:'55vw', height:'55vw', maxWidth:400, maxHeight:400,
      top:'50%', left:'50%', background:'radial-gradient(circle,' + orbColor + ' 0%,transparent 68%)', animation:'scOrb3 20s ease-in-out infinite' }})
  );
}

// ─── YouTube ambient video background ─────────────────────────
function VideoBg(props) {
  var id = props.id;
  var src = 'https://www.youtube.com/embed/' + id +
    '?autoplay=1&mute=1&loop=1&playlist=' + id +
    '&controls=0&modestbranding=1&playsinline=1&rel=0';
  return h('div', { style:{ position:'fixed', inset:0, zIndex:0, overflow:'hidden', background:'#000' } },
    h('iframe', {
      src: src, title:'background video', frameBorder:'0',
      allow:'autoplay; encrypted-media; picture-in-picture',
      style:{
        position:'absolute', top:'50%', left:'50%',
        width:'177.78vh', height:'56.25vw',
        minWidth:'100%', minHeight:'100%',
        transform:'translate(-50%,-50%)',
        pointerEvents:'none', border:'none',
      }
    })
  );
}

// ─── Backdrop dispatcher — video if available, else animated bg ──
function Backdrop(props) {
  var ex = props.ex;
  if (ex && ex.youtube_id) return h(VideoBg, { id: ex.youtube_id });
  return h(AthleticBg, { lvl: props.lvl });
}

// ─── SVG Ring Timer ───────────────────────────────────────────
function RingTimer(props) {
  var secs  = props.secs  || 0;
  var total = props.total || 1;
  var color = props.color || '#f59e0b';
  var size  = props.size  || 200;
  var label = props.label || 'secs';
  var r     = size * 0.40, sw = size * 0.055, circ = 2 * Math.PI * r;
  var pct   = total > 0 ? secs / total : 0, cx = size / 2;
  return h('div', { style:{ position:'relative', width:size, height:size, flexShrink:0 } },
    h('svg', { width:size, height:size, style:{ transform:'rotate(-90deg)' } },
      h('circle', { cx:cx, cy:cx, r:r, fill:'none', stroke:'rgba(255,255,255,0.06)', strokeWidth:sw }),
      h('circle', { cx:cx, cy:cx, r:r, fill:'none', stroke:color, strokeWidth:sw,
        strokeDasharray: circ, strokeDashoffset: circ * (1 - pct), strokeLinecap:'round',
        style:{ transition:'stroke-dashoffset 0.95s linear', filter:'drop-shadow(0 0 14px '+color+')' } })
    ),
    h('div', { style:{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' } },
      h('div', { style:{ fontSize: size*0.24, fontWeight:900, color:'#f8fafc', fontVariantNumeric:'tabular-nums', lineHeight:1, letterSpacing:'-0.02em' } }, secs),
      h('div', { style:{ fontSize: size*0.068, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4 } }, label)
    )
  );
}

// ─── Stop confirm overlay ─────────────────────────────────────
function StopConfirm(props) {
  return h('div', { style:{ position:'fixed', inset:0, zIndex:60, background:'rgba(2,5,14,0.96)', backdropFilter:'blur(16px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 } },
    h('div', { style:{ background:'#0c1220', borderRadius:22, border:'1px solid rgba(255,255,255,0.09)', padding:'32px 24px',
      maxWidth:320, width:'100%', textAlign:'center', boxShadow:'0 32px 80px rgba(0,0,0,0.85)' } },
      h('div', { style:{ fontSize:44, marginBottom:12 } }, '🛑'),
      h('h3', { style:{ fontSize:21, fontWeight:900, color:'#f8fafc', margin:'0 0 10px', letterSpacing:'-0.01em' } }, 'Stop This Workout?'),
      h('p',  { style:{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.65, margin:'0 0 28px' } }, 'Your progress will be lost and no XP will be awarded.'),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        h('button', { onClick:props.onConfirm, style:{ padding:'15px', background:'linear-gradient(135deg,#991b1b,#dc2626)', color:'#fff', border:'none', borderRadius:13, cursor:'pointer', fontFamily:'inherit', fontWeight:800, fontSize:15 } }, 'Stop & Exit'),
        h('button', { onClick:props.onCancel, style:{ padding:'14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:13, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 } }, 'Keep Going 💪')
      )
    )
  );
}

// ─── Workout Player Page ──────────────────────────────────────
function WorkoutPlayerPage(props) {
  var workoutId = (props.params && props.params.id) || '';
  var WORKOUTS  = A.WORKOUTS || [];
  var workout   = WORKOUTS.find(function(w) { return w.id === workoutId; }) || null;

  var exercises = useRef(
    workout && A.getWorkoutExercises ? A.getWorkoutExercises(workout) : []
  ).current;

  var [status,    setStatus]    = useState('preview');
  var [exIdx,     setExIdx]     = useState(0);
  var [setIdx,    setSetIdx]    = useState(0);
  var [restSecs,  setRestSecs]  = useState(0);
  var [restTotal, setRestTotal] = useState(0);
  var [elapsed,   setElapsed]   = useState(0);
  var [workSecs,  setWorkSecs]  = useState(0);
  var [workTotal, setWorkTotal] = useState(0);
  var [isPrep,    setIsPrep]    = useState(false);
  var [prepSecs,  setPrepSecs]  = useState(0);
  var [prepTotal, setPrepTotal] = useState(0);
  var [showStop,  setShowStop]  = useState(false);
  var [canComplete, setCanComplete] = useState(false);
  var [holdSecsLeft, setHoldSecsLeft] = useState(0);

  var elapsedRef       = useRef(0);
  var restRef          = useRef(0);
  var timerRef         = useRef(null);
  var workTimerRef     = useRef(null);
  var handleDoneSetRef = useRef(null);
  var startWorkRef     = useRef(null);
  var longestHoldRef   = useRef(0);
  var setStartRef      = useRef(0);
  var gateTimerRef     = useRef(null);

  var restLevel = (workout && REST[workout.level]) || REST.beginner;
  var lvl       = (workout && LVL[workout.level])  || LVL.beginner;

  // count just the MAIN exercises (exclude warm-up / cool-down) for display
  var mainCount = exercises.filter(function(e){ return (e.block||'main') === 'main'; }).length;

  // elapsed timer
  useEffect(function() {
    var t = setInterval(function() { elapsedRef.current++; setElapsed(elapsedRef.current); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // cleanup
  useEffect(function() {
    return function() { clearInterval(timerRef.current); clearInterval(workTimerRef.current); };
  }, []);

  // exercise-timer-done event (never stale via ref)
  useEffect(function() {
    var handler = function() { if (handleDoneSetRef.current) handleDoneSetRef.current(); };
    window.addEventListener('sc_ex_timer_done', handler);
    return function() { window.removeEventListener('sc_ex_timer_done', handler); };
  }, []);

  // rest countdown
  var startRest = function(secs, nextStatus) {
    clearInterval(timerRef.current);
    clearInterval(workTimerRef.current);
    restRef.current = secs;
    setRestSecs(secs); setRestTotal(secs);
    timerRef.current = setInterval(function() {
      restRef.current--;
      if (restRef.current <= 3 && restRef.current > 0) playTick();
      if (restRef.current <= 0) {
        clearInterval(timerRef.current);
        playGo();
        setStatus(nextStatus); setRestSecs(0);
      } else { setRestSecs(restRef.current); }
    }, 1000);
  };

  // launch the actual WORK countdown for a timed exercise
  var launchWork = function(seconds) {
    clearInterval(workTimerRef.current);
    setIsPrep(false);
    var rem = seconds;
    setWorkSecs(rem); setWorkTotal(seconds);
    workTimerRef.current = setInterval(function() {
      rem--;
      if (rem <= 3 && rem > 0) playTick();
      if (rem <= 0) {
        clearInterval(workTimerRef.current);
        setWorkSecs(0);
        playGo();
        window.dispatchEvent(new CustomEvent('sc_ex_timer_done'));
      } else { setWorkSecs(rem); }
    }, 1000);
  };
  startWorkRef.current = launchWork;

  // timed-exercise driver: PREP (get ready) → WORK
  useEffect(function() {
    clearInterval(workTimerRef.current);
    if (status !== 'set_active') { setIsPrep(false); return; }
    var e = exercises[exIdx];
    if (!e || e.kind === 'reps' || !e.work_secs) { setIsPrep(false); return; }

    var prep = e.prep_secs || 5;
    var work = e.work_secs;
    if (work > (longestHoldRef.current || 0) && e.kind === 'hold') longestHoldRef.current = work;

    setIsPrep(true); setPrepSecs(prep); setPrepTotal(prep);
    setWorkSecs(work); setWorkTotal(work);
    var rem = prep;
    playTick();
    workTimerRef.current = setInterval(function() {
      rem--;
      if (rem <= 0) {
        clearInterval(workTimerRef.current);
        playGo();
        launchWork(work);
      } else { playTick(); setPrepSecs(rem); }
    }, 1000);
    return function() { clearInterval(workTimerRef.current); };
  }, [status, exIdx, setIdx]); // eslint-disable-line

  // anti-cheat: minimum genuine-effort gate before a set can be marked done
  useEffect(function() {
    clearInterval(gateTimerRef.current);
    if (status !== 'set_active') return;
    var e = exercises[exIdx];
    var mcs = (e && e.min_complete_secs) || 0;
    setStartRef.current = Date.now();
    if (mcs <= 0) { setCanComplete(true); setHoldSecsLeft(0); return; }
    setCanComplete(false);
    setHoldSecsLeft(mcs);
    gateTimerRef.current = setInterval(function() {
      var left = mcs - Math.floor((Date.now() - setStartRef.current) / 1000);
      if (left <= 0) {
        setCanComplete(true); setHoldSecsLeft(0);
        clearInterval(gateTimerRef.current);
      } else {
        setHoldSecsLeft(left);
      }
    }, 250);
    return function() { clearInterval(gateTimerRef.current); };
  }, [status, exIdx, setIdx]); // eslint-disable-line

  // not found
  if (!workout) {
    return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'#03060f', color:'#f8fafc', padding:32 } },
      h('div', { style:{ fontSize:48, marginBottom:16 } }, '💪'),
      h('p', { style:{ fontWeight:700, marginBottom:16 } }, 'Workout not found'),
      h('button', { onClick:function(){A.nav('Fitness');}, style:{ padding:'12px 24px', background:'#15803d', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 } }, '← Back')
    );
  }

  var ex        = exercises[exIdx] || null;
  var totalExes = exercises.length;

  // advance after a set is completed
  var handleDoneSet = function() {
    clearInterval(timerRef.current);
    clearInterval(workTimerRef.current);
    setIsPrep(false); setWorkSecs(0);
    playSetDone();
    var ex2     = exercises[exIdx];
    var numSets = ex2 ? ex2.sets : 3;
    if (setIdx < numSets - 1) {
      var sr = (ex2 && ex2.rest_secs) || restLevel.sets;
      setSetIdx(function(s) { return s + 1; });
      startRest(sr, 'set_active');
      setStatus('set_rest');
    } else if (exIdx < totalExes - 1) {
      var nextE = exercises[exIdx + 1];
      var br = (nextE && (nextE.block === 'cooldown')) ? 20 : restLevel.between;
      setExIdx(function(i) { return i + 1; });
      setSetIdx(0);
      startRest(br, 'set_active');
      setStatus('ex_rest');
    } else {
      setStatus('rate'); // ask how it felt before celebrating
    }
  };
  handleDoneSetRef.current = handleDoneSet;

  var finishWorkout = function(difficulty) {
    if (A.awardXP) A.awardXP(Math.round(workout.xp_value*1.25), workout.duration_minutes, 'workout', 'workout', workout.id, true);
    if (A.DB && A.DB.logWorkoutComplete) { try { A.DB.logWorkoutComplete(workout.id); } catch(e) {} }
    if (A.FitnessEngine && A.FitnessEngine.recordWorkout) {
      A.FitnessEngine.recordWorkout(workout, {
        minutes: Math.round(elapsedRef.current / 60) || workout.duration_minutes,
        difficulty: difficulty,
        longestHold: longestHoldRef.current,
      });
    }
    playComplete();
    if (window.confetti) {
      confetti({ particleCount:160, spread:90, origin:{y:0.65}, colors:['#22c55e','#fbbf24','#f8fafc','#60a5fa','#c084fc'] });
      setTimeout(function() { confetti({ particleCount:80, spread:130, origin:{y:0.15} }); }, 600);
    }
    setStatus('done');
  };

  var handleSkipRest = function() {
    clearInterval(timerRef.current);
    playGo();
    setStatus('set_active'); setRestSecs(0);
  };
  var handleStop = function() {
    clearInterval(timerRef.current);
    clearInterval(workTimerRef.current);
    A.nav('WorkoutDetail', { id: workout.id });
  };

  var overlayActive = 'radial-gradient(ellipse at 50% 40%, rgba(2,5,14,0.10) 0%, rgba(2,5,14,0.80) 62%)';
  var overlayRest   = 'radial-gradient(ellipse at 50% 50%, rgba(2,5,14,0.20) 0%, rgba(2,5,14,0.88) 70%)';
  var overlayPreview= 'radial-gradient(ellipse at center, rgba(2,5,14,0.35) 0%, rgba(2,5,14,0.92) 100%)';

  var StopBtn = h('button', { onClick: function() { setShowStop(true); }, style:{ position:'fixed', top:16, left:16, zIndex:20,
      background:'rgba(0,0,0,0.65)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:10,
      padding:'8px 14px', color:'rgba(255,255,255,0.55)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700 } }, '✕ Stop');

  function exSub(e) {
    if (!e) return '';
    if (e.kind === 'reps') return e.sets + ' × ' + e.reps + ' reps';
    var w = (e.work_secs || e.duration_secs || 0) + 's';
    return e.sets > 1 ? e.sets + ' × ' + w : w;
  }

  // ════════════════════════════════════════════════════════════
  // PREVIEW
  // ════════════════════════════════════════════════════════════
  if (status === 'preview') {
    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
      h(Backdrop, { lvl: lvl, ex: exercises[0] }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:overlayPreview } }),
      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'env(safe-area-inset-top,20px) 20px 32px' } },
        h('button', { onClick:function(){A.nav('WorkoutDetail',{id:workout.id});}, style:{ alignSelf:'flex-start', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 16px', color:'#d1d5db', cursor:'pointer',
            fontFamily:'inherit', fontSize:13, fontWeight:600, marginBottom:24, marginTop:4 } }, '← Back'),
        h('div', { style:{ marginBottom:18 } },
          h('div', { style:{ display:'flex', alignItems:'center', gap:8, marginBottom:10 } },
            h('span', { style:{ fontSize:10, fontWeight:800, color:lvl.col, letterSpacing:'0.18em', textTransform:'uppercase' } }, workout.level),
            h('span', { style:{ fontSize:10, color:'rgba(255,255,255,0.2)' } }, '·'),
            h('span', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.14em', textTransform:'uppercase' } }, workout.target.replace('-',' '))
          ),
          h('h1', { style:{ fontSize:30, fontWeight:900, color:'#f8fafc', lineHeight:1.12, margin:'0 0 14px', letterSpacing:'-0.02em' } }, workout.name),
          h('div', { style:{ display:'flex', gap:8, flexWrap:'wrap' } },
            h('span', { style:{ padding:'5px 13px', borderRadius:20, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', fontSize:12, fontWeight:700, color:'#4ade80' } }, workout.duration_minutes + ' min'),
            h('span', { style:{ padding:'5px 13px', borderRadius:20, background:'rgba(251,191,36,0.10)', border:'1px solid rgba(251,191,36,0.22)', fontSize:12, fontWeight:700, color:'#fbbf24' } }, '+' + workout.xp_value + ' XP'),
            h('span', { style:{ padding:'5px 13px', borderRadius:20, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', fontSize:12, fontWeight:700, color:'#cbd5e1' } }, mainCount + ' exercises')
          ),
          h('div', { style:{ marginTop:10, fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:600 } }, '🔥 Warm-up  ·  💪 Main work  ·  🧊 Cool-down — guided start to finish')
        ),
        h('div', { style:{ flex:1, overflowY:'auto', marginBottom:24, background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)',
          borderRadius:18, border:'1px solid rgba(255,255,255,0.06)', padding:'8px 0' } },
          exercises.map(function(e, i) {
            var bm = BLOCK_META[e.block || 'main'] || BLOCK_META.main;
            return h('div', { key:e.id + i, style:{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
              borderBottom: i < exercises.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none' } },
              h('div', { style:{ width:28, height:28, borderRadius:'50%', background: bm.label ? bm.col+'22' : 'rgba(255,255,255,0.04)',
                border:'1px solid ' + (bm.label ? bm.col+'40' : 'rgba(255,255,255,0.07)'),
                display:'flex', alignItems:'center', justifyContent:'center', fontSize: bm.label?13:11, fontWeight:800,
                color: bm.label ? bm.col : 'rgba(255,255,255,0.32)', flexShrink:0 } }, bm.label ? bm.emoji : i),
              h('div', { style:{ flex:1, minWidth:0 } },
                h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' } }, e.name),
                h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 } },
                  (bm.label ? bm.label + ' · ' : '') + exSub(e))
              ),
              (e.kind === 'hold' || e.kind === 'cardio') && h('div', { style:{ fontSize:10, fontWeight:800, color:'#60a5fa',
                background:'rgba(96,165,250,0.09)', border:'1px solid rgba(96,165,250,0.16)', borderRadius:6, padding:'2px 8px', flexShrink:0 } }, '⏱ TIMED')
            );
          })
        ),
        h('button', { onClick:function(){ actx(); setStatus('set_active'); setExIdx(0); setSetIdx(0); }, style:{
            width:'100%', padding:'19px', border:'none', borderRadius:16, fontFamily:'inherit', fontSize:17, fontWeight:900, cursor:'pointer',
            background:'linear-gradient(135deg,' + lvl.grad + ')', color:'#fff', boxShadow:'0 8px 32px ' + lvl.glow, letterSpacing:'0.03em' } }, '🏋️  Start Workout')
      )
    );
  }

  // ════════════════════════════════════════════════════════════
  // RATE — how did that feel? (auto-regulation)
  // ════════════════════════════════════════════════════════════
  if (status === 'rate') {
    var rateOpts = [
      { id:'easy',    emoji:'😎', label:'Too Easy',  sub:"I'll push harder next time", col:'#34d399' },
      { id:'perfect', emoji:'🔥', label:'Just Right', sub:'Challenging but doable',     col:'#fbbf24' },
      { id:'hard',    emoji:'🥵', label:'Too Tough',  sub:'Ease it back next time',     col:'#f87171' },
    ];
    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
      h(AthleticBg, { lvl: lvl }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'rgba(2,5,14,0.86)' } }),
      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'32px 24px', textAlign:'center' } },
        h('div', { style:{ fontSize:46, marginBottom:10 } }, '✅'),
        h('h1', { style:{ fontSize:24, fontWeight:900, color:'#f8fafc', marginBottom:8 } }, 'Last rep done!'),
        h('p', { style:{ color:'rgba(255,255,255,0.5)', marginBottom:30, fontSize:14, fontWeight:600, maxWidth:300 } }, 'How did that session feel? We’ll tune your next one to match.'),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:12, width:'100%', maxWidth:340 } },
          rateOpts.map(function(o) {
            return h('button', { key:o.id, onClick:function(){ finishWorkout(o.id); }, style:{ display:'flex', alignItems:'center', gap:14, padding:'15px 18px',
              borderRadius:15, background:'rgba(255,255,255,0.04)', border:'1px solid ' + o.col + '33', cursor:'pointer', fontFamily:'inherit', textAlign:'left' } },
              h('div', { style:{ fontSize:28 } }, o.emoji),
              h('div', { style:{ flex:1 } },
                h('div', { style:{ fontSize:15, fontWeight:800, color:o.col } }, o.label),
                h('div', { style:{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 } }, o.sub)
              )
            );
          })
        )
      )
    );
  }

  // ════════════════════════════════════════════════════════════
  // DONE
  // ════════════════════════════════════════════════════════════
  if (status === 'done') {
    var mins = Math.floor(elapsedRef.current / 60), dsecs = elapsedRef.current % 60;
    var fe = (A.FitnessEngine && A.FitnessEngine.getStats) ? A.FitnessEngine.getStats() : null;
    return h('div', { style:{ position:'relative', minHeight:'100dvh', overflow:'hidden', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'32px 24px', textAlign:'center' } },
      h(AthleticBg, { lvl: lvl }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'rgba(2,5,14,0.82)' } }),
      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', width:'100%' } },
        h('div', { style:{ fontSize:70, marginBottom:10, filter:'drop-shadow(0 0 28px rgba(251,191,36,0.45))' } }, '🏆'),
        h('h1', { style:{ fontSize:32, fontWeight:900, color:'#f8fafc', marginBottom:6, letterSpacing:'-0.02em' } }, 'Workout Complete!'),
        h('p',  { style:{ color:'rgba(255,255,255,0.35)', marginBottom:28, fontSize:14, fontWeight:600 } }, workout.name),
        h('div', { style:{ display:'flex', gap:12, marginBottom:24, justifyContent:'center', flexWrap:'wrap' } },
          [
            { val:'+'+workout.xp_value, label:'XP Earned', col:'#4ade80', bg:'rgba(34,197,94,0.10)', bd:'rgba(34,197,94,0.22)' },
            { val:mins+':'+(dsecs<10?'0':'')+dsecs, label:'Time', col:'#fbbf24', bg:'rgba(251,191,36,0.08)', bd:'rgba(251,191,36,0.20)' },
            { val:mainCount, label:'Exercises', col:'#a5b4fc', bg:'rgba(99,102,241,0.08)', bd:'rgba(99,102,241,0.20)' },
          ].map(function(item) {
            return h('div', { key:item.label, style:{ padding:'16px 20px', borderRadius:16, background:item.bg, border:'1px solid '+item.bd, textAlign:'center', minWidth:90 } },
              h('div', { style:{ fontSize:26, fontWeight:900, color:item.col } }, item.val),
              h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:5 } }, item.label)
            );
          })
        ),
        fe && h('div', { style:{ marginBottom:28, padding:'12px 18px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' } },
          h('span', { style:{ fontSize:13, fontWeight:700, color:fe.rank.color } }, fe.rank.icon + ' ' + fe.rank.label),
          h('span', { style:{ fontSize:13, color:'rgba(255,255,255,0.4)', fontWeight:600 } }, '  ·  ' + fe.workoutsDone + ' workouts  ·  🔥 ' + fe.weeklyStreak + 'w streak')
        ),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:300 } },
          h('button', { onClick:function(){A.nav('Fitness');}, style:{ padding:'17px', background:'linear-gradient(135deg,#c2410c,#ea580c)', color:'#fff', border:'none', borderRadius:13, cursor:'pointer', fontFamily:'inherit', fontWeight:800, fontSize:15 } }, 'More Workouts'),
          h('button', { onClick:function(){A.nav('Home');}, style:{ padding:'15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:13, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 } }, 'Go Home')
        )
      )
    );
  }

  // safety guard
  if (!ex) { if (status !== 'done') setStatus('rate'); return null; }

  var progressPct = totalExes > 0 ? ((exIdx + 1) / totalExes * 100) : 0;
  var isResting   = status === 'set_rest' || status === 'ex_rest';
  var ringColor   = status === 'ex_rest' ? '#60a5fa' : '#f59e0b';
  var motiv       = MOTIVATIONS[(exIdx * 3 + setIdx) % MOTIVATIONS.length];
  var bm          = BLOCK_META[ex.block || 'main'] || BLOCK_META.main;

  // ════════════════════════════════════════════════════════════
  // REST
  // ════════════════════════════════════════════════════════════
  if (isResting) {
    var nextEx    = exercises[exIdx] || ex;
    var nbm       = BLOCK_META[nextEx.block || 'main'] || BLOCK_META.main;
    var restLabel = status === 'ex_rest' ? 'NEXT UP' : 'SET REST';
    var restTitleColor = status === 'ex_rest' ? '#60a5fa' : '#fbbf24';
    var restQuote = nextEx.block === 'cooldown' ? COOL_QUOTE
                  : nextEx.block === 'warmup'   ? WARM_QUOTE
                  : REST_QUOTES[exIdx % REST_QUOTES.length];

    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
      h(Backdrop, { lvl: lvl, ex: nextEx }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:overlayRest } }),
      StopBtn,
      showStop && h(StopConfirm, { onConfirm:handleStop, onCancel:function(){setShowStop(false);} }),
      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'32px 24px', textAlign:'center' } },
        h('div', { style:{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 16px', borderRadius:20, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:28 } },
          h('div', { style:{ width:6, height:6, borderRadius:'50%', background:restTitleColor, boxShadow:'0 0 8px '+restTitleColor } }),
          h('span', { style:{ fontSize:11, fontWeight:800, color:restTitleColor, letterSpacing:'0.2em', textTransform:'uppercase' } }, restLabel)
        ),
        h(RingTimer, { secs:restSecs, total:restTotal, color:ringColor, size:230, label:'secs' }),
        h('p', { style:{ fontSize:15, color:'rgba(255,255,255,0.44)', marginTop:24, marginBottom:28, fontStyle:'italic', maxWidth:280, lineHeight:1.65, fontWeight:500 } }, restQuote),
        nextEx && h('div', { style:{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(16px)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'16px 20px', width:'100%', maxWidth:310, textAlign:'left', marginBottom:28 } },
          h('div', { style:{ fontSize:10, fontWeight:800, color: nbm.label ? nbm.col : 'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:10 } }, (nbm.label ? (nbm.emoji + '  ' + nbm.label) : '▶  Up Next')),
          h('div', { style:{ fontSize:18, fontWeight:900, color:'#f0fdf4', marginBottom:6, letterSpacing:'-0.01em' } }, nextEx.name),
          h('div', { style:{ display:'flex', gap:12 } },
            h('span', { style:{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)' } }, exSub(nextEx))
          )
        ),
        h('button', { onClick:handleSkipRest, style:{ padding:'13px 32px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:12, color:'rgba(255,255,255,0.65)', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700, letterSpacing:'0.02em' } }, 'Skip Rest →')
      )
    );
  }

  // ════════════════════════════════════════════════════════════
  // ACTIVE EXERCISE
  // ════════════════════════════════════════════════════════════
  var isTimed = ex.kind === 'hold' || ex.kind === 'cardio';

  return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
    h(Backdrop, { lvl: lvl, ex: ex }),
    h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:overlayActive } }),
    StopBtn,
    showStop && h(StopConfirm, { onConfirm:handleStop, onCancel:function(){setShowStop(false);} }),
    h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'16px 20px 24px' } },

      // progress bar
      h('div', { style:{ marginBottom:14, paddingTop:'env(safe-area-inset-top,0px)' } },
        h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 } },
          h('span', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' } },
            (bm.label ? bm.label : 'Exercise ' + (exIdx+1) + ' of ' + totalExes)),
          h('span', { style:{ fontSize:11, fontWeight:800, color: bm.label ? bm.col : lvl.col, textTransform:'uppercase', letterSpacing:'0.12em' } }, bm.label ? (bm.emoji) : workout.level)
        ),
        h('div', { style:{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:9999, overflow:'hidden' } },
          h('div', { style:{ height:'100%', width:progressPct+'%', background:'linear-gradient(90deg,' + lvl.grad + ')', borderRadius:9999, transition:'width 0.7s cubic-bezier(0.4,0,0.2,1)', boxShadow:'0 0 10px ' + lvl.glow }})
        )
      ),

      // set dots
      h('div', { style:{ display:'flex', alignItems:'center', gap:7, marginBottom:16 } },
        h('span', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.14em', marginRight:3 } }, 'Set'),
        [].concat(Array.apply(null, Array(ex.sets))).map(function(_, i) {
          var dn = i < setIdx, cur = i === setIdx;
          return h('div', { key:i, style:{ width: cur ? 22 : 8, height:8, borderRadius:9999,
            background: dn ? lvl.col : cur ? '#fff' : 'rgba(255,255,255,0.13)',
            transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: cur ? '0 0 10px ' + lvl.col : dn ? '0 0 6px ' + lvl.col + '55' : 'none' }});
        }),
        h('span', { style:{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.28)', marginLeft:4 } }, (setIdx+1) + '/' + ex.sets)
      ),

      // exercise name
      h('h2', { style:{ fontSize:38, fontWeight:900, color:'#f8fafc', lineHeight:1.05, margin:'0 0 22px', letterSpacing:'-0.025em', textShadow:'0 2px 24px rgba(0,0,0,0.7)' } }, ex.name),

      // main area
      h('div', { style:{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:14 } },

        isTimed
          ? ( isPrep
              ? h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:14, animation:'scPrepPulse 1s ease-in-out infinite' } },
                  h('div', { style:{ fontSize:13, fontWeight:800, color:'#fbbf24', textTransform:'uppercase', letterSpacing:'0.22em' } }, 'Get Ready'),
                  h(RingTimer, { secs:prepSecs, total:prepTotal, color:'#fbbf24', size:200, label:'get set' }),
                  h('div', { style:{ fontSize:13, color:'rgba(255,255,255,0.5)', maxWidth:240, textAlign:'center', lineHeight:1.5 } },
                    'Get into position for ' + ex.name + ' — the timer starts at zero.')
                )
              : h('div', { style:{ display:'flex', alignItems:'center', gap:22, marginBottom:4 } },
                  h(RingTimer, { secs:workSecs, total:workTotal, color:'#22c55e', size:170, label:'left' }),
                  h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
                    h('div', { style:{ fontSize:13, fontWeight:800, color:'rgba(34,197,94,0.85)', textTransform:'uppercase', letterSpacing:'0.1em' } }, ex.kind === 'hold' ? 'Hold it!' : 'Go all out!'),
                    h('div', { style:{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.6, maxWidth:150 } }, 'Timer auto-advances. Tap below to finish early.')
                  )
                )
            )
          : h('div', { style:{ alignSelf:'flex-start', display:'flex', alignItems:'baseline', gap:10, padding:'14px 28px', borderRadius:99, marginBottom:4,
              background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.18)' } },
              h('span', { style:{ fontSize:52, fontWeight:900, color:'#4ade80', lineHeight:1, letterSpacing:'-0.03em' } }, ex.reps),
              h('span', { style:{ fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.38)' } }, 'reps')
            ),

        (ex.coaching_cue || ex.tip) && h('div', { style:{ padding:'13px 16px', borderRadius:13, background:'rgba(255,255,255,0.04)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.07)' } },
          h('div', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 } }, '💡 Form Tip'),
          h('p',   { style:{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.55, margin:0 } }, ex.coaching_cue || ex.tip)
        ),

        ex.cricket_benefit && h('div', { style:{ padding:'10px 16px', borderRadius:11, background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.10)' } },
          h('span', { style:{ fontSize:12, color:'rgba(251,191,36,0.75)', fontWeight:700 } }, '🏏 ' + ex.cricket_benefit)
        ),

        h('div', { style:{ fontSize:14, fontWeight:800, color:lvl.col, opacity:0.75, letterSpacing:'0.01em', paddingLeft:2 } }, motiv)
      ),

      // CTA
      (isTimed && isPrep)
        ? h('button', { onClick:function(){ clearInterval(workTimerRef.current); playGo(); if (startWorkRef.current) startWorkRef.current(ex.work_secs); }, style:{
            width:'100%', padding:'19px', border:'none', borderRadius:16, fontFamily:'inherit', fontSize:17, fontWeight:900, cursor:'pointer',
            background:'linear-gradient(135deg,#b45309,#f59e0b)', color:'#fff', boxShadow:'0 8px 28px rgba(180,83,9,0.42)',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10, letterSpacing:'0.03em', marginTop:16 } }, "I'm Ready  →")
        : h('button', { onClick: canComplete ? handleDoneSet : function(){}, style:{
            width:'100%', padding:'19px', border:'none', borderRadius:16, fontFamily:'inherit', fontSize:17, fontWeight:900,
            cursor: canComplete ? 'pointer' : 'not-allowed',
            background: canComplete ? 'linear-gradient(135deg,#15803d,#22c55e)' : 'rgba(255,255,255,0.06)',
            color: canComplete ? '#fff' : 'rgba(255,255,255,0.35)',
            border: canComplete ? 'none' : '1px solid rgba(255,255,255,0.10)',
            boxShadow: canComplete ? '0 8px 28px rgba(21,128,61,0.42)' : 'none',
            position:'relative', overflow:'hidden',
            display:'flex', alignItems:'center', justifyContent:'center', gap:10, letterSpacing:'0.03em', marginTop:16 } },
            !canComplete && ex.min_complete_secs && h('div', { style:{
              position:'absolute', left:0, top:0, bottom:0,
              width: (100 - Math.min(100, Math.max(0, (holdSecsLeft / ex.min_complete_secs) * 100))) + '%',
              background:'rgba(34,197,94,0.18)', transition:'width 0.25s linear', zIndex:0,
            }}),
            h('span', { style:{ position:'relative', zIndex:1 } },
              canComplete ? (isTimed ? '✓  Finish Early' : '✓  Done Set') : ('Hold on… ' + holdSecsLeft + 's')
            )
          )
    )
  );
}

window.SC_APP.WorkoutPlayerPage = WorkoutPlayerPage;
window.SC_APP.VideoBg = VideoBg;
window.SC_APP.Backdrop = Backdrop;
window.SC_APP.AthleticBg = AthleticBg;
console.log('[SC] app-workout-player v6.0 — warm-up/cool-down, get-ready prep, pleasant audio, auto-regulation');
})();
