// ================================================================
// app-workout-player.js — SmartCrick Immersive Workout Player v2.1
// Premium visuals · mellow bell audio · cricket highlight playlist
// ================================================================
(function() {
'use strict';
var h        = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef   = React.useRef;
var A = window.SC_APP;

// ─── Rest times ───────────────────────────────────────────────
var REST = {
  beginner:     { sets: 45, between: 60 },
  intermediate: { sets: 30, between: 45 },
  advanced:     { sets: 20, between: 30 },
  pro:          { sets: 15, between: 20 },
};

// ─── 10 curated cricket highlight videos ─────────────────────
var CRICKET_PLAYLIST = [
  'VjWn6bEaxMk',  // AB de Villiers 360° batting
  'dVf3Hbfl5Uc',  // IPL greatest sixes compilation
  'kSDKmBxHJWc',  // Top bowling spells in cricket history
  'hFmPlBY34eA',  // Jasprit Bumrah unplayable deliveries
  '2SsrZJwBbWM',  // Greatest sixes ever hit
  'PX_AlQLOLl8',  // Brett Lee fastest deliveries
  'Yfs8GIBLt1o',  // MS Dhoni helicopter shots & epic finishes
  'XRi3EhO0dFo',  // Virat Kohli century highlights
  'r65RBtRlGMw',  // Best cricket catches — incredible fielding
  'cFfKEGVMRlE',  // World Cup greatest moments
];

// ─── Motivational phrases (cycle through workout) ─────────────
var MOTIVATIONS = [
  'Push harder! 🔥',
  'You\'ve got this! 💪',
  'Every rep makes you better!',
  'Cricket legend in the making! 🏏',
  'Champions are built in moments like this!',
  'Feel the burn — embrace it! 🔥',
  'Stay strong, stay focused!',
  'Beast mode activated! 💪',
  'Don\'t stop — not yet!',
  'Elite cricketers train exactly like this! 🏆',
];

var REST_QUOTES = [
  'Breathe. Your muscles are growing.',
  'Rest smart. Then play hard.',
  'Elite athletes recover well.',
  'This rest is part of the training.',
  'Take it in — you earned this.',
];

// ─── Audio ────────────────────────────────────────────────────
function getAudioCtx() {
  if (!window._scAudioCtx) {
    try { window._scAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return window._scAudioCtx;
}

// Mellow bell: 3 harmonics with 2-second smooth fade-out
function playDing() {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    [[440, 0.28], [880, 0.10], [1320, 0.04]].forEach(function(pair) {
      var osc = ctx.createOscillator();
      var g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pair[0], ctx.currentTime);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.linearRampToValueAtTime(pair[1], ctx.currentTime + 0.015);  // soft attack
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0); // 2s fade
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.0);
    });
  } catch(e) {}
}

// Soft low countdown beep
function playBeep() {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    var osc = ctx.createOscillator();
    var g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.10, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.28);
  } catch(e) {}
}

// ─── SVG Ring Timer ───────────────────────────────────────────
function RingTimer(props) {
  var secs  = props.secs;
  var total = props.total;
  var color = props.color || '#f59e0b';
  var size  = props.size  || 200;
  var r     = size * 0.41;
  var sw    = size * 0.054;
  var circ  = 2 * Math.PI * r;
  var pct   = total > 0 ? secs / total : 0;
  var cx    = size / 2;

  return h('div', { style:{ position:'relative', width:size, height:size, flexShrink:0 } },
    h('svg', { width:size, height:size, style:{ transform:'rotate(-90deg)' } },
      h('circle', { cx:cx, cy:cx, r:r, fill:'none', stroke:'rgba(255,255,255,0.07)', strokeWidth:sw }),
      h('circle', {
        cx:cx, cy:cx, r:r, fill:'none', stroke:color, strokeWidth:sw,
        strokeDasharray: circ,
        strokeDashoffset: circ * (1 - pct),
        strokeLinecap: 'round',
        style:{ transition:'stroke-dashoffset 0.95s linear', filter:'drop-shadow(0 0 10px '+color+')' },
      })
    ),
    h('div', {
      style:{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }
    },
      h('div', { style:{ fontSize:size*0.235, fontWeight:900, color:'#f8fafc', fontVariantNumeric:'tabular-nums', lineHeight:1 } }, secs),
      h('div', { style:{ fontSize:size*0.07, fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:5 } }, props.label || 'secs')
    )
  );
}

// ─── YouTube ambient background ───────────────────────────────
// Uses the "cover" technique: position center, width = 177.78vh (16:9)
// This ensures the video fills the viewport regardless of aspect ratio.
// `objectFit:cover` does NOT work on iframes — this transform approach does.
function YTAmbient(props) {
  if (!props.src) return null;
  return h('iframe', {
    src: props.src,
    allow: 'autoplay; encrypted-media; picture-in-picture',
    allowFullScreen: false,
    frameBorder: '0',
    style:{
      position:'fixed',
      top:'50%', left:'50%',
      width:'177.78vh',   // 100vh × (16/9) — always wider than any portrait screen
      height:'100vh',
      minWidth:'100vw',
      transform:'translate(-50%,-50%)',
      zIndex:0, opacity:0.30, pointerEvents:'none', border:'none',
    }
  });
}

// ─── Cinematic dark gradient (always visible, fallback + depth) ──
function CinematicBg() {
  return h('div', {
    style:{
      position:'fixed', inset:0, zIndex:0,
      background:'linear-gradient(135deg,#060c1a 0%,#0d1f30 28%,#071810 55%,#150d21 80%,#060c1a 100%)',
    }
  });
}

// ─── Stop confirm overlay ─────────────────────────────────────
function StopConfirm(props) {
  return h('div', {
    style:{ position:'fixed', inset:0, zIndex:50, background:'rgba(4,8,18,0.93)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }
  },
    h('div', { style:{ background:'#101624', borderRadius:20, border:'1px solid rgba(255,255,255,0.1)', padding:'28px 24px', maxWidth:320, width:'100%', textAlign:'center', boxShadow:'0 24px 64px rgba(0,0,0,0.75)' } },
      h('div', { style:{ fontSize:38, marginBottom:10 } }, '🛑'),
      h('h3', { style:{ fontSize:20, fontWeight:900, color:'#f8fafc', margin:'0 0 8px' } }, 'Stop This Workout?'),
      h('p',  { style:{ fontSize:13, color:'rgba(255,255,255,0.48)', lineHeight:1.6, marginBottom:24 } }, 'Your progress will be lost and no XP will be awarded.'),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        h('button', { onClick:props.onConfirm, style:{ padding:'14px', background:'linear-gradient(135deg,#b91c1c,#dc2626)', color:'#fff', border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:15 } }, 'Stop & Exit'),
        h('button', { onClick:props.onCancel,  style:{ padding:'13px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 } }, 'Keep Going')
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

  var [status,       setStatus]       = useState('preview');
  var [exIdx,        setExIdx]        = useState(0);
  var [setIdx,       setSetIdx]       = useState(0);
  var [restSecs,     setRestSecs]     = useState(0);
  var [restTotal,    setRestTotal]    = useState(0);
  var [elapsed,      setElapsed]      = useState(0);
  var [exTimerSecs,  setExTimerSecs]  = useState(0);
  var [exTimerTotal, setExTimerTotal] = useState(0);
  var [showStop,     setShowStop]     = useState(false);

  var elapsedRef       = useRef(0);
  var restRef          = useRef(0);
  var timerRef         = useRef(null);
  var exTimerRef       = useRef(null);
  var handleDoneSetRef = useRef(null);  // always-fresh ref — avoids stale closure in timer

  var restLevel = (workout && REST[workout.level]) || REST.beginner;

  // ── Build YouTube src ONCE ───────────────────────────────────
  var ytSrc = useRef((function() {
    if (!workout) return '';
    var isCricket = workout.target === 'cricket' ||
                    (workout.id && workout.id.indexOf('wc') === 0);
    if (isCricket) {
      return 'https://www.youtube.com/embed/' + CRICKET_PLAYLIST[0] +
        '?autoplay=1&mute=1&controls=0&loop=1' +
        '&playlist=' + CRICKET_PLAYLIST.join(',') +
        '&playsinline=1&enablejsapi=1';
    }
    var vid = (A.WORKOUT_VIDEO_MAP || {})[workout.target] ||
              (A.WORKOUT_VIDEO_MAP || {})['full-body'] || '';
    if (!vid) return '';
    return 'https://www.youtube.com/embed/' + vid +
      '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + vid +
      '&playsinline=1&enablejsapi=1';
  })()).current;

  // ── Elapsed timer ────────────────────────────────────────────
  useEffect(function() {
    var t = setInterval(function() { elapsedRef.current++; setElapsed(elapsedRef.current); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────
  useEffect(function() {
    return function() { clearInterval(timerRef.current); clearInterval(exTimerRef.current); };
  }, []);

  // ── Register exercise-timer-done event once (uses ref so never stale) ──
  useEffect(function() {
    var handler = function() { if (handleDoneSetRef.current) handleDoneSetRef.current(); };
    window.addEventListener('sc_ex_timer_done', handler);
    return function() { window.removeEventListener('sc_ex_timer_done', handler); };
  }, []);

  // ── Rest countdown ───────────────────────────────────────────
  var startRest = function(secs, nextStatus) {
    clearInterval(timerRef.current);
    clearInterval(exTimerRef.current);
    restRef.current = secs;
    setRestSecs(secs); setRestTotal(secs);
    timerRef.current = setInterval(function() {
      restRef.current--;
      if (restRef.current <= 3 && restRef.current > 0) playBeep();
      if (restRef.current <= 0) {
        clearInterval(timerRef.current);
        playDing();
        setStatus(nextStatus); setRestSecs(0);
      } else {
        setRestSecs(restRef.current);
      }
    }, 1000);
  };

  // ── Exercise countdown (timed exercises) ─────────────────────
  useEffect(function() {
    clearInterval(exTimerRef.current);
    if (status !== 'set_active') return;
    var ex = exercises[exIdx];
    if (!ex || !ex.duration_secs) return;
    var remaining = ex.duration_secs;
    setExTimerSecs(remaining); setExTimerTotal(remaining);
    exTimerRef.current = setInterval(function() {
      remaining--;
      if (remaining <= 3 && remaining > 0) playBeep();
      if (remaining <= 0) {
        clearInterval(exTimerRef.current);
        setExTimerSecs(0);
        playDing();
        window.dispatchEvent(new CustomEvent('sc_ex_timer_done'));
      } else {
        setExTimerSecs(remaining);
      }
    }, 1000);
    return function() { clearInterval(exTimerRef.current); };
  }, [status, exIdx, setIdx]); // eslint-disable-line

  if (!workout) {
    return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'#0a0f1e', color:'#f8fafc', padding:32 } },
      h('div', { style:{ fontSize:48, marginBottom:16 } }, '💪'),
      h('p', { style:{ fontWeight:700, marginBottom:16 } }, 'Workout not found'),
      h('button', { onClick:function(){A.nav('Fitness');}, style:{ padding:'12px 24px', background:'#c2410c', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 } }, '← Back')
    );
  }

  var ex        = exercises[exIdx] || null;
  var totalExes = exercises.length;

  var LVL_GRAD = { beginner:'#065f46,#047857', intermediate:'#1d4ed8,#2563eb', advanced:'#7c3aed,#9333ea', pro:'#b91c1c,#dc2626' };
  var LVL_COL  = { beginner:'#34d399', intermediate:'#60a5fa', advanced:'#c084fc', pro:'#f87171' };
  var lvlGrad  = LVL_GRAD[workout.level] || '#c2410c,#ea580c';
  var lvlCol   = LVL_COL[workout.level]  || '#f97316';

  // handleDoneSet — kept fresh via ref
  var handleDoneSet = function() {
    clearInterval(timerRef.current);
    clearInterval(exTimerRef.current);
    setExTimerSecs(0);
    var ex2     = exercises[exIdx];
    var numSets = ex2 ? ex2.sets : 3;
    if (setIdx < numSets - 1) {
      var sr = (ex2 && ex2.rest_secs) || restLevel.sets;
      setSetIdx(function(s) { return s + 1; });
      startRest(sr, 'set_active');
      setStatus('set_rest');
    } else if (exIdx < totalExes - 1) {
      setExIdx(function(i) { return i + 1; });
      setSetIdx(0);
      startRest(restLevel.between, 'set_active');
      setStatus('ex_rest');
    } else {
      if (A.awardXP) A.awardXP(workout.xp_value, workout.duration_minutes, 'workout', 'workout', workout.id);
      if (window.confetti) {
        confetti({ particleCount:150, spread:80, origin:{y:0.6}, colors:['#22c55e','#fbbf24','#f8fafc','#60a5fa'] });
        setTimeout(function() { confetti({ particleCount:80, spread:120, origin:{y:0.2} }); }, 500);
      }
      setStatus('done');
    }
  };
  handleDoneSetRef.current = handleDoneSet;

  var handleSkipRest = function() {
    clearInterval(timerRef.current);
    playDing();
    setStatus('set_active'); setRestSecs(0);
  };

  var handleStop = function() {
    clearInterval(timerRef.current);
    clearInterval(exTimerRef.current);
    A.nav('WorkoutDetail', { id: workout.id });
  };

  // Stop button — fixed top-left on all active screens
  var StopBtn = h('button', {
    onClick: function() { setShowStop(true); },
    style:{ position:'fixed', top:16, left:16, zIndex:20, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:10, padding:'8px 14px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700 }
  }, '✕ Stop');

  // ── PREVIEW SCREEN ───────────────────────────────────────────
  if (status === 'preview') {
    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#060b14', overflow:'hidden' } },
      h(CinematicBg),
      h(YTAmbient, { src: ytSrc }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'radial-gradient(ellipse at center, rgba(4,8,18,0.5) 0%, rgba(4,8,18,0.93) 100%)' } }),

      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'24px 20px 32px' } },
        h('button', { onClick:function(){A.nav('WorkoutDetail',{id:workout.id});}, style:{ alignSelf:'flex-start', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.14)', borderRadius:10, padding:'8px 14px', color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, marginBottom:24 } }, '← Back'),

        h('div', { style:{ marginBottom:20 } },
          h('div', { style:{ fontSize:11, fontWeight:700, color:lvlCol, letterSpacing:'0.16em', textTransform:'uppercase', marginBottom:6 } }, workout.level + ' · ' + workout.target.replace('-',' ')),
          h('h1', { style:{ fontSize:28, fontWeight:900, color:'#f8fafc', lineHeight:1.15, margin:'0 0 10px', letterSpacing:'-0.01em' } }, workout.name),
          h('div', { style:{ display:'flex', gap:10, flexWrap:'wrap' } },
            h('span', { style:{ padding:'5px 14px', borderRadius:20, background:'rgba(34,197,94,0.14)', border:'1px solid rgba(34,197,94,0.28)', fontSize:12, fontWeight:700, color:'#4ade80' } }, workout.duration_minutes + ' min'),
            h('span', { style:{ padding:'5px 14px', borderRadius:20, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.28)', fontSize:12, fontWeight:700, color:'#fbbf24' } }, '+' + workout.xp_value + ' XP'),
            h('span', { style:{ padding:'5px 14px', borderRadius:20, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', fontSize:12, fontWeight:700, color:'#e2e8f0' } }, totalExes + ' exercises')
          )
        ),

        // Exercise list
        h('div', { style:{ flex:1, overflowY:'auto', marginBottom:20, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(16px)', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', padding:'12px 0' } },
          exercises.map(function(e, i) {
            return h('div', { key:e.id, style:{ display:'flex', alignItems:'center', gap:12, padding:'11px 16px', borderBottom:i < exercises.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' } },
              h('div', { style:{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', flexShrink:0 } }, i+1),
              h('div', { style:{ flex:1, minWidth:0 } },
                h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' } }, e.name),
                h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.36)', marginTop:2 } }, e.sets + ' sets · ' + (e.duration_secs ? e.duration_secs + 's' : e.reps + ' reps'))
              ),
              e.duration_secs && h('div', { style:{ fontSize:10, fontWeight:700, color:'#60a5fa', background:'rgba(96,165,250,0.1)', border:'1px solid rgba(96,165,250,0.18)', borderRadius:6, padding:'2px 7px', flexShrink:0 } }, '⏱')
            );
          })
        ),

        h('button', { onClick:function(){setStatus('set_active');setExIdx(0);setSetIdx(0);}, style:{ width:'100%', padding:'18px', border:'none', borderRadius:16, fontFamily:'inherit', fontSize:17, fontWeight:800, cursor:'pointer', background:'linear-gradient(135deg,'+lvlGrad+')', color:'#fff', boxShadow:'0 6px 28px rgba(0,0,0,0.55)', letterSpacing:'0.02em' } }, '🏋️  Start Workout')
      )
    );
  }

  // ── DONE SCREEN ──────────────────────────────────────────────
  if (status === 'done') {
    var mins = Math.floor(elapsedRef.current / 60);
    var s2   = elapsedRef.current % 60;
    return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'linear-gradient(135deg,#060c1a,#071810)', padding:'32px 24px', textAlign:'center' } },
      h('div', { style:{ fontSize:64, marginBottom:8 } }, '🏆'),
      h('h1', { style:{ fontSize:30, fontWeight:900, color:'#f8fafc', marginBottom:6, letterSpacing:'-0.02em' } }, 'Workout Complete!'),
      h('p',  { style:{ color:'rgba(255,255,255,0.4)', marginBottom:28, fontSize:14 } }, workout.name),
      h('div', { style:{ display:'flex', gap:14, marginBottom:36, justifyContent:'center', flexWrap:'wrap' } },
        h('div', { style:{ padding:'18px 22px', borderRadius:16, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.22)', textAlign:'center' } },
          h('div', { style:{ fontSize:28, fontWeight:900, color:'#4ade80' } }, '+' + workout.xp_value),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 } }, 'XP Earned')
        ),
        h('div', { style:{ padding:'18px 22px', borderRadius:16, background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.18)', textAlign:'center' } },
          h('div', { style:{ fontSize:28, fontWeight:900, color:'#fbbf24' } }, mins + ':' + (s2<10?'0':'') + s2),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 } }, 'Time')
        ),
        h('div', { style:{ padding:'18px 22px', borderRadius:16, background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.18)', textAlign:'center' } },
          h('div', { style:{ fontSize:28, fontWeight:900, color:'#a5b4fc' } }, totalExes),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:4 } }, 'Exercises')
        )
      ),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:300 } },
        h('button', { onClick:function(){A.nav('Fitness');}, style:{ padding:'16px', background:'linear-gradient(135deg,#c2410c,#ea580c)', color:'#fff', border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:15 } }, 'More Workouts'),
        h('button', { onClick:function(){A.nav('Home');}, style:{ padding:'14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.11)', borderRadius:12, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 } }, 'Go Home')
      )
    );
  }

  // Safety
  if (!ex) { if (status !== 'done') setStatus('done'); return null; }

  var progressPct = totalExes > 0 ? ((exIdx + 1) / totalExes * 100) : 0;
  var isResting   = status === 'set_rest' || status === 'ex_rest';
  var ringColor   = status === 'ex_rest' ? '#60a5fa' : '#f59e0b';
  var motiv       = MOTIVATIONS[(exIdx + setIdx) % MOTIVATIONS.length];
  var restQuote   = REST_QUOTES[exIdx % REST_QUOTES.length];

  // ── REST SCREEN ───────────────────────────────────────────────
  if (isResting) {
    var nextEx    = status === 'ex_rest' ? (exercises[exIdx] || null) : ex;
    var restLabel = status === 'ex_rest' ? 'REST BETWEEN EXERCISES' : 'REST BETWEEN SETS';

    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#060b14', overflow:'hidden' } },
      h(CinematicBg),
      h(YTAmbient, { src: ytSrc }),
      // Heavier overlay during rest — more meditative
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'rgba(4,8,18,0.91)' } }),
      StopBtn,
      showStop && h(StopConfirm, { onConfirm:handleStop, onCancel:function(){setShowStop(false);} }),

      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'32px 24px', textAlign:'center' } },

        // Label
        h('div', { style:{ fontSize:11, fontWeight:800, color:ringColor, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:22, opacity:0.9 } }, restLabel),

        // Big ring
        h(RingTimer, { secs:restSecs, total:restTotal, color:ringColor, size:224 }),

        // Encouragement
        h('p', { style:{ fontSize:14, color:'rgba(255,255,255,0.45)', marginTop:22, marginBottom:22, fontStyle:'italic', maxWidth:260, lineHeight:1.6 } }, restQuote),

        // Up next card
        nextEx && h('div', { style:{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'14px 20px', width:'100%', maxWidth:300, textAlign:'left', marginBottom:28 } },
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:8 } }, '▶  Up Next'),
          h('div', { style:{ fontSize:16, fontWeight:800, color:'#f0fdf4', marginBottom:4 } }, nextEx.name),
          h('div', { style:{ fontSize:12, color:'rgba(255,255,255,0.38)' } }, nextEx.sets + ' sets · ' + (nextEx.duration_secs ? nextEx.duration_secs + 's' : nextEx.reps + ' reps'))
        ),

        // Skip button
        h('button', { onClick:handleSkipRest, style:{ padding:'12px 28px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:12, color:'rgba(255,255,255,0.7)', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 } }, 'Skip Rest →')
      )
    );
  }

  // ── ACTIVE EXERCISE SCREEN ────────────────────────────────────
  var isTimed = !!ex.duration_secs;

  return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#060b14', overflow:'hidden' } },
    h(CinematicBg),
    h(YTAmbient, { src: ytSrc }),
    // Radial vignette — lighter in centre so video shows through, dark at edges
    h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'radial-gradient(ellipse at 50% 45%, rgba(4,8,18,0.28) 0%, rgba(4,8,18,0.91) 72%)' } }),
    StopBtn,
    showStop && h(StopConfirm, { onConfirm:handleStop, onCancel:function(){setShowStop(false);} }),

    h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'20px 20px 28px' } },

      // Progress bar
      h('div', { style:{ marginBottom:18 } },
        h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 } },
          h('span', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.38)', textTransform:'uppercase', letterSpacing:'0.1em' } }, 'Exercise ' + (exIdx+1) + ' of ' + totalExes),
          h('span', { style:{ fontSize:11, fontWeight:700, color:lvlCol, textTransform:'uppercase', letterSpacing:'0.1em' } }, workout.level)
        ),
        h('div', { style:{ height:3, background:'rgba(255,255,255,0.07)', borderRadius:9999, overflow:'hidden' } },
          h('div', { style:{ height:'100%', width:progressPct+'%', background:'linear-gradient(90deg,'+lvlGrad+')', borderRadius:9999, transition:'width 0.6s ease', boxShadow:'0 0 8px rgba(34,197,94,0.35)' } })
        )
      ),

      // Main content
      h('div', { style:{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center' } },

        // Set dot indicators
        h('div', { style:{ display:'flex', alignItems:'center', gap:6, marginBottom:14 } },
          h('div', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.32)', textTransform:'uppercase', letterSpacing:'0.12em', marginRight:4 } }, 'Set'),
          [].concat(Array.apply(null, Array(ex.sets))).map(function(_, i) {
            var isComplete = i < setIdx;
            var isCurrent  = i === setIdx;
            return h('div', {
              key:i,
              style:{
                width: isCurrent ? 20 : 8,
                height:8,
                borderRadius:9999,
                background: isComplete ? lvlCol : isCurrent ? '#fff' : 'rgba(255,255,255,0.15)',
                transition:'all 0.3s ease',
                boxShadow: isCurrent ? ('0 0 8px ' + lvlCol) : 'none',
              }
            });
          }),
          h('div', { style:{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.3)', marginLeft:4 } }, (setIdx+1) + '/' + ex.sets)
        ),

        // Exercise name
        h('h2', { style:{ fontSize:38, fontWeight:900, color:'#f8fafc', lineHeight:1.05, margin:'0 0 20px', letterSpacing:'-0.02em' } }, ex.name),

        // Timed: live ring | Reps: badge
        isTimed
          ? h('div', { style:{ display:'flex', alignItems:'center', gap:20, marginBottom:20 } },
              h(RingTimer, { secs:exTimerSecs, total:exTimerTotal, color:'#22c55e', size:160, label:'left' }),
              h('div', { style:{ display:'flex', flexDirection:'column', gap:6 } },
                h('div', { style:{ fontSize:12, fontWeight:700, color:'rgba(34,197,94,0.7)', textTransform:'uppercase', letterSpacing:'0.1em' } }, 'Hold it!'),
                h('div', { style:{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.5, maxWidth:140 } }, 'Timer auto-advances. Tap "Finish Early" if needed.')
              )
            )
          : h('div', { style:{ alignSelf:'flex-start', display:'flex', alignItems:'baseline', gap:8, padding:'12px 24px', borderRadius:99, marginBottom:20, background:'rgba(34,197,94,0.09)', border:'1px solid rgba(34,197,94,0.2)' } },
              h('span', { style:{ fontSize:38, fontWeight:900, color:'#4ade80', lineHeight:1 } }, ex.reps),
              h('span', { style:{ fontSize:15, fontWeight:700, color:'rgba(255,255,255,0.45)' } }, 'reps')
            ),

        // Tip
        ex.tip && h('div', { style:{ padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:10 } },
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:5 } }, '💡 Form Tip'),
          h('p',   { style:{ fontSize:13, color:'rgba(255,255,255,0.58)', lineHeight:1.5, margin:0 } }, ex.tip)
        ),

        // Cricket benefit
        ex.cricket_benefit && h('div', { style:{ padding:'9px 14px', borderRadius:10, background:'rgba(251,191,36,0.05)', border:'1px solid rgba(251,191,36,0.12)', marginBottom:14 } },
          h('span', { style:{ fontSize:11, color:'rgba(251,191,36,0.7)', fontWeight:600 } }, '🏏 ' + ex.cricket_benefit)
        ),

        // Motivational text
        h('div', { style:{ fontSize:13, fontWeight:700, color:lvlCol, opacity:0.65, letterSpacing:'0.01em' } }, motiv)
      ),

      // Done Set / Finish Early CTA
      h('button', { onClick:handleDoneSet, style:{ width:'100%', padding:'18px', border:'none', borderRadius:16, fontFamily:'inherit', fontSize:17, fontWeight:800, cursor:'pointer', background:'linear-gradient(135deg,#16a34a,#22c55e)', color:'#fff', boxShadow:'0 6px 24px rgba(22,163,74,0.38)', display:'flex', alignItems:'center', justifyContent:'center', gap:10, letterSpacing:'0.02em', marginTop:16 } },
        isTimed ? '✓  Finish Early' : '✓  Done Set'
      )
    )
  );
}

window.SC_APP.WorkoutPlayerPage = WorkoutPlayerPage;
console.log('[SC] app-workout-player v2.1 — premium visuals + mellow audio + cricket playlist');
})();
