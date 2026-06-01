// ================================================================
// app-workout-player.js — SmartCrick Immersive Workout Player v2.0
// Phase 2: cricket playlist, live exercise timers, stop workout
// ================================================================
(function() {
'use strict';
var h           = React.createElement;
var useState    = React.useState;
var useEffect   = React.useEffect;
var useRef      = React.useRef;
var useCallback = React.useCallback;
var A = window.SC_APP;

// ─── Rest time constants (seconds) ───────────────────────────
var REST = {
  beginner:     { sets: 45, between: 60 },
  intermediate: { sets: 30, between: 45 },
  advanced:     { sets: 20, between: 30 },
  pro:          { sets: 15, between: 20 },
};

// ─── 10 curated cricket highlight videos ─────────────────────
var CRICKET_PLAYLIST = [
  'VjWn6bEaxMk',  // AB de Villiers 360° batting
  'dVf3Hbfl5Uc',  // IPL greatest sixes ever
  'kSDKmBxHJWc',  // Top bowling spells in cricket
  'hFmPlBY34eA',  // Jasprit Bumrah unplayable deliveries
  '2SsrZJwBbWM',  // Greatest sixes in cricket history
  'PX_AlQLOLl8',  // Brett Lee fastest deliveries
  'Yfs8GIBLt1o',  // MS Dhoni helicopter shots & finishes
  'XRi3EhO0dFo',  // Virat Kohli century highlights
  'r65RBtRlGMw',  // Best cricket catches — incredible fielding
  'cFfKEGVMRlE',  // World Cup greatest moments
];

// ─── Audio helpers (Web Audio API) ───────────────────────────
function getAudioCtx() {
  if (!window._scAudioCtx) {
    try { window._scAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return window._scAudioCtx;
}

function playDing() {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(1320, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function playBeep() {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  } catch(e) {}
}

// ─── SVG Ring Timer ───────────────────────────────────────────
function RingTimer(props) {
  var secs  = props.secs;
  var total = props.total;
  var color = props.color || '#f59e0b';
  var label = props.label || 'secs';
  var r = 84;
  var circ = 2 * Math.PI * r;
  var pct  = total > 0 ? secs / total : 0;
  var dash = circ * pct;

  return h('div', { style: { position:'relative', width:200, height:200, flexShrink:0 } },
    h('svg', { width:200, height:200, style:{ transform:'rotate(-90deg)' } },
      h('circle', { cx:100, cy:100, r:r, fill:'none', stroke:'rgba(255,255,255,0.08)', strokeWidth:12 }),
      h('circle', {
        cx:100, cy:100, r:r, fill:'none', stroke:color, strokeWidth:12,
        strokeDasharray: circ, strokeDashoffset: circ - dash,
        strokeLinecap:'round',
        style:{ transition:'stroke-dashoffset 0.95s linear', filter:'drop-shadow(0 0 8px '+color+')' },
      })
    ),
    h('div', {
      style:{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }
    },
      h('div', { style:{ fontSize:48, fontWeight:900, color:'#f8fafc', fontVariantNumeric:'tabular-nums' } }, secs),
      h('div', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:2 } }, label)
    )
  );
}

// ─── YouTube Ambient Iframe (no controls, auto-cycles) ────────
function YTAmbient(props) {
  // videoSrc is the full ?-param string already built by caller
  var src = props.src;
  if (!src) return null;
  return h('iframe', {
    src: src,
    allow: 'autoplay; encrypted-media',
    frameBorder: '0',
    style:{
      position:'fixed', top:0, left:0, width:'100%', height:'100%',
      objectFit:'cover', zIndex:0, opacity:0.28, pointerEvents:'none',
      border:'none',
    }
  });
}

// ─── Stop Confirm Overlay ─────────────────────────────────────
function StopConfirm(props) {
  return h('div', {
    style:{
      position:'fixed', inset:0, zIndex:50,
      background:'rgba(6,11,20,0.92)', backdropFilter:'blur(8px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24,
    }
  },
    h('div', {
      style:{
        background:'#101624', borderRadius:20,
        border:'1px solid rgba(255,255,255,0.1)',
        padding:'28px 24px', maxWidth:320, width:'100%', textAlign:'center',
        boxShadow:'0 24px 64px rgba(0,0,0,0.7)',
      }
    },
      h('div', { style:{ fontSize:36, marginBottom:10 } }, '🛑'),
      h('h3', { style:{ fontSize:20, fontWeight:900, color:'#f8fafc', margin:'0 0 8px' } }, 'Stop This Workout?'),
      h('p', { style:{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.55, marginBottom:24 } },
        'Your progress will be lost and no XP will be awarded.'
      ),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        h('button', {
          onClick: props.onConfirm,
          style:{
            padding:'14px', background:'linear-gradient(135deg,#b91c1c,#dc2626)',
            color:'#fff', border:'none', borderRadius:12,
            cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:15,
          }
        }, 'Stop & Exit'),
        h('button', {
          onClick: props.onCancel,
          style:{
            padding:'13px', background:'rgba(255,255,255,0.06)',
            border:'1px solid rgba(255,255,255,0.12)', borderRadius:12,
            color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14,
          }
        }, 'Keep Going')
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

  // ── Core state ───────────────────────────────────────────────
  var [status,        setStatus]        = useState('preview');
  var [exIdx,         setExIdx]         = useState(0);
  var [setIdx,        setSetIdx]        = useState(0);
  var [restSecs,      setRestSecs]      = useState(0);
  var [restTotal,     setRestTotal]     = useState(0);
  var [elapsed,       setElapsed]       = useState(0);
  var [exTimerSecs,   setExTimerSecs]   = useState(0);   // live countdown for timed exercises
  var [exTimerTotal,  setExTimerTotal]  = useState(0);
  var [showStop,      setShowStop]      = useState(false);

  var elapsedRef  = useRef(0);
  var restRef     = useRef(0);
  var timerRef    = useRef(null);   // rest interval
  var exTimerRef  = useRef(null);   // exercise interval

  var restLevel = (workout && REST[workout.level]) || REST.beginner;

  // ── Build YouTube src ────────────────────────────────────────
  var ytSrc = useRef((function() {
    if (!workout) return '';
    var isCricket = workout.target === 'cricket' ||
      (workout.id && workout.id.indexOf('wc') === 0);
    if (isCricket) {
      var first = CRICKET_PLAYLIST[0];
      var rest  = CRICKET_PLAYLIST.join(',');
      return 'https://www.youtube.com/embed/' + first +
        '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + rest +
        '&playsinline=1&rel=0&showinfo=0&modestbranding=1';
    }
    var videoMap = A.WORKOUT_VIDEO_MAP || {};
    var vid = videoMap[workout.target] || videoMap['full-body'] || '';
    if (!vid) return '';
    return 'https://www.youtube.com/embed/' + vid +
      '?autoplay=1&mute=1&controls=0&loop=1&playlist=' + vid +
      '&playsinline=1&rel=0&showinfo=0&modestbranding=1';
  })()).current;

  // ── Elapsed timer (runs always) ──────────────────────────────
  useEffect(function() {
    var t = setInterval(function() {
      elapsedRef.current++;
      setElapsed(elapsedRef.current);
    }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // ── Rest countdown ───────────────────────────────────────────
  var startRest = useCallback(function(secs, nextStatus) {
    clearInterval(timerRef.current);
    clearInterval(exTimerRef.current);
    restRef.current = secs;
    setRestSecs(secs);
    setRestTotal(secs);
    timerRef.current = setInterval(function() {
      restRef.current--;
      if (restRef.current <= 3 && restRef.current > 0) playBeep();
      if (restRef.current <= 0) {
        clearInterval(timerRef.current);
        playDing();
        setStatus(nextStatus);
        setRestSecs(0);
      } else {
        setRestSecs(restRef.current);
      }
    }, 1000);
  }, []);

  // ── Exercise timer (for timed exercises) ─────────────────────
  // Runs when status = set_active and current exercise has duration_secs
  useEffect(function() {
    clearInterval(exTimerRef.current);
    if (status !== 'set_active') return;
    var ex = exercises[exIdx];
    if (!ex || !ex.duration_secs) return;

    var remaining = ex.duration_secs;
    setExTimerSecs(remaining);
    setExTimerTotal(remaining);

    exTimerRef.current = setInterval(function() {
      remaining--;
      if (remaining <= 3 && remaining > 0) playBeep();
      if (remaining <= 0) {
        clearInterval(exTimerRef.current);
        playDing();
        // Auto-advance — trigger handleDoneSet equivalent inline to avoid stale closure
        setExTimerSecs(0);
        // Signal completion via a synthetic status flip
        setStatus(function(prevStatus) {
          // We need handleDoneSet logic here — call it by re-using the same
          // state-setter chain. We read current exIdx/setIdx from refs below.
          return prevStatus; // keep same status, effect below will fire
        });
        // Directly fire the done-set logic by dispatching a custom event
        window.dispatchEvent(new CustomEvent('sc_ex_timer_done'));
      } else {
        setExTimerSecs(remaining);
      }
    }, 1000);

    return function() { clearInterval(exTimerRef.current); };
  }, [status, exIdx, setIdx]); // eslint-disable-line

  // ── Cleanup on unmount ───────────────────────────────────────
  useEffect(function() {
    return function() {
      clearInterval(timerRef.current);
      clearInterval(exTimerRef.current);
    };
  }, []);

  // ── Stop workout handler ─────────────────────────────────────
  var handleStop = function() {
    clearInterval(timerRef.current);
    clearInterval(exTimerRef.current);
    A.nav('WorkoutDetail', { id: workout.id });
  };

  if (!workout) {
    return h('div', {
      style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              minHeight:'100dvh', background:'#0a0f1e', color:'#f8fafc', padding:32 }
    },
      h('div', { style:{ fontSize:48, marginBottom:16 } }, '💪'),
      h('p', { style:{ fontWeight:700, marginBottom:16 } }, 'Workout not found'),
      h('button', {
        onClick: function() { A.nav('Fitness'); },
        style:{ padding:'12px 24px', background:'#c2410c', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 }
      }, '← Back')
    );
  }

  var ex        = exercises[exIdx] || null;
  var totalExes = exercises.length;
  var LVL_GRAD  = { beginner:'#065f46,#047857', intermediate:'#1d4ed8,#2563eb', advanced:'#7c3aed,#9333ea', pro:'#b91c1c,#dc2626' };
  var lvlGrad   = LVL_GRAD[workout.level] || '#c2410c,#ea580c';

  // handleDoneSet — also listens to the exercise-timer-done event
  var handleDoneSet = useCallback(function() {
    clearInterval(timerRef.current);
    clearInterval(exTimerRef.current);
    setExTimerSecs(0);
    var curExIdx = exIdx;
    var curSetIdx = setIdx;
    var ex2 = exercises[curExIdx];
    var numSets = ex2 ? ex2.sets : 3;
    if (curSetIdx < numSets - 1) {
      var setsRest = (ex2 && ex2.rest_secs) || restLevel.sets;
      setSetIdx(function(s) { return s + 1; });
      startRest(setsRest, 'set_active');
      setStatus('set_rest');
    } else if (curExIdx < totalExes - 1) {
      setExIdx(function(i) { return i + 1; });
      setSetIdx(0);
      startRest(restLevel.between, 'set_active');
      setStatus('ex_rest');
    } else {
      if (A.awardXP) A.awardXP(workout.xp_value, workout.duration_minutes, 'workout', 'workout', workout.id);
      if (window.confetti) {
        confetti({ particleCount:120, spread:70, origin:{y:0.6}, colors:['#22c55e','#fbbf24','#f8fafc'] });
        setTimeout(function() { confetti({ particleCount:60, spread:100, origin:{y:0.3} }); }, 400);
      }
      setStatus('done');
    }
  }, [exIdx, setIdx, totalExes, restLevel, startRest, workout]);

  // Wire up the exercise-timer-done event
  useEffect(function() {
    window.addEventListener('sc_ex_timer_done', handleDoneSet);
    return function() { window.removeEventListener('sc_ex_timer_done', handleDoneSet); };
  }, [handleDoneSet]);

  var handleSkipRest = function() {
    clearInterval(timerRef.current);
    playDing();
    setStatus('set_active');
    setRestSecs(0);
  };

  // ── PREVIEW SCREEN ───────────────────────────────────────────
  if (status === 'preview') {
    return h('div', {
      style:{ position:'relative', minHeight:'100dvh', background:'#060b14', overflow:'hidden' }
    },
      h(YTAmbient, { src: ytSrc }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'radial-gradient(ellipse at center, rgba(6,11,20,0.55) 0%, rgba(6,11,20,0.9) 100%)' } }),

      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'24px 20px 32px' } },

        h('button', {
          onClick: function() { A.nav('WorkoutDetail', { id:workout.id }); },
          style:{ alignSelf:'flex-start', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:10, padding:'8px 14px', color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:600, marginBottom:24 }
        }, '← Back'),

        h('div', { style:{ marginBottom:20 } },
          h('div', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 } },
            workout.level + ' · ' + workout.target.replace('-', ' ')
          ),
          h('h1', { style:{ fontSize:28, fontWeight:900, color:'#f8fafc', lineHeight:1.15, margin:0, marginBottom:8 } }, workout.name),
          h('div', { style:{ display:'flex', gap:12, flexWrap:'wrap' } },
            h('span', { style:{ padding:'4px 12px', borderRadius:20, background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', fontSize:12, fontWeight:700, color:'#4ade80' } }, workout.duration_minutes + ' min'),
            h('span', { style:{ padding:'4px 12px', borderRadius:20, background:'rgba(251,191,36,0.15)', border:'1px solid rgba(251,191,36,0.3)', fontSize:12, fontWeight:700, color:'#fbbf24' } }, '+' + workout.xp_value + ' XP'),
            h('span', { style:{ padding:'4px 12px', borderRadius:20, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', fontSize:12, fontWeight:700, color:'#e2e8f0' } }, totalExes + ' exercises')
          )
        ),

        h('div', { style:{ flex:1, overflowY:'auto', marginBottom:20, background:'rgba(0,0,0,0.35)', backdropFilter:'blur(12px)', borderRadius:16, border:'1px solid rgba(255,255,255,0.08)', padding:'12px 0' } },
          exercises.map(function(e, i) {
            return h('div', {
              key:e.id,
              style:{ display:'flex', alignItems:'center', gap:12, padding:'10px 16px', borderBottom: i < exercises.length-1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }
            },
              h('div', { style:{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,0.07)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)', flexShrink:0 } }, i+1),
              h('div', { style:{ flex:1, minWidth:0 } },
                h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' } }, e.name),
                h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 } },
                  e.sets + ' sets · ' + (e.duration_secs ? e.duration_secs + 's' : e.reps + ' reps')
                )
              )
            );
          })
        ),

        h('button', {
          onClick: function() { setStatus('set_active'); setExIdx(0); setSetIdx(0); },
          style:{ width:'100%', padding:'18px', border:'none', borderRadius:16, fontFamily:'inherit', fontSize:17, fontWeight:800, cursor:'pointer', background:'linear-gradient(135deg,' + lvlGrad + ')', color:'#fff', boxShadow:'0 6px 28px rgba(0,0,0,0.5)', letterSpacing:'0.02em' }
        }, '🏋️ Start Workout')
      )
    );
  }

  // ── DONE SCREEN ──────────────────────────────────────────────
  if (status === 'done') {
    var mins = Math.floor(elapsedRef.current / 60);
    var secs2 = elapsedRef.current % 60;
    return h('div', {
      style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'#060b14', padding:'32px 24px', textAlign:'center' }
    },
      h('div', { style:{ fontSize:60, marginBottom:8 } }, '🏆'),
      h('h1', { style:{ fontSize:28, fontWeight:900, color:'#f8fafc', marginBottom:6, lineHeight:1.2 } }, 'Workout Complete!'),
      h('p', { style:{ color:'rgba(255,255,255,0.5)', marginBottom:24, fontSize:14 } }, workout.name),
      h('div', { style:{ display:'flex', gap:16, marginBottom:32, justifyContent:'center' } },
        h('div', { style:{ padding:'16px 24px', borderRadius:14, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', textAlign:'center' } },
          h('div', { style:{ fontSize:26, fontWeight:900, color:'#4ade80' } }, '+' + workout.xp_value),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 } }, 'XP Earned')
        ),
        h('div', { style:{ padding:'16px 24px', borderRadius:14, background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.2)', textAlign:'center' } },
          h('div', { style:{ fontSize:26, fontWeight:900, color:'#fbbf24' } }, mins + ':' + (secs2 < 10 ? '0' : '') + secs2),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 } }, 'Time')
        ),
        h('div', { style:{ padding:'16px 24px', borderRadius:14, background:'rgba(99,102,241,0.1)', border:'1px solid rgba(99,102,241,0.2)', textAlign:'center' } },
          h('div', { style:{ fontSize:26, fontWeight:900, color:'#a5b4fc' } }, totalExes),
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:3 } }, 'Exercises')
        )
      ),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:300 } },
        h('button', {
          onClick: function() { A.nav('Fitness'); },
          style:{ padding:'15px', background:'linear-gradient(135deg,#c2410c,#ea580c)', color:'#fff', border:'none', borderRadius:12, cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:15 }
        }, 'More Workouts'),
        h('button', {
          onClick: function() { A.nav('Home'); },
          style:{ padding:'14px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 }
        }, 'Go Home')
      )
    );
  }

  // Safety: empty exercise list
  if (!ex) {
    if (status !== 'done') setStatus('done');
    return null;
  }

  var progressPct = totalExes > 0 ? ((exIdx + 1) / totalExes * 100) : 0;
  var isResting   = status === 'set_rest' || status === 'ex_rest';
  var ringColor   = status === 'ex_rest' ? '#60a5fa' : '#f59e0b';

  // ── Stop button (shown on all active screens) ─────────────────
  var StopBtn = h('button', {
    onClick: function() { setShowStop(true); },
    style:{
      position:'fixed', top:16, left:16, zIndex:20,
      background:'rgba(0,0,0,0.55)', backdropFilter:'blur(8px)',
      border:'1px solid rgba(255,255,255,0.15)', borderRadius:10,
      padding:'8px 14px', color:'rgba(255,255,255,0.65)',
      cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700,
    }
  }, '✕ Stop');

  // ── REST SCREEN ───────────────────────────────────────────────
  if (isResting) {
    var nextEx    = status === 'ex_rest' ? (exercises[exIdx] || null) : ex;
    var restLabel = status === 'ex_rest' ? 'Rest between exercises' : 'Rest between sets';
    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#060b14', overflow:'hidden' } },
      h(YTAmbient, { src: ytSrc }),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'rgba(6,11,20,0.88)' } }),
      StopBtn,
      showStop && h(StopConfirm, { onConfirm: handleStop, onCancel: function() { setShowStop(false); } }),

      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', padding:'32px 24px', textAlign:'center' } },
        h('div', { style:{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.45)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:16 } }, restLabel),
        h(RingTimer, { secs:restSecs, total:restTotal, color:ringColor }),
        h('div', { style:{ marginTop:28, marginBottom:12 } },
          h('div', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 } }, 'UP NEXT'),
          h('div', { style:{ fontSize:18, fontWeight:800, color:'#f0fdf4' } }, nextEx ? nextEx.name : 'Last set!'),
          nextEx && h('div', { style:{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 } },
            nextEx.sets + ' sets · ' + (nextEx.duration_secs ? nextEx.duration_secs + 's' : nextEx.reps + ' reps')
          )
        ),
        h('button', {
          onClick: handleSkipRest,
          style:{ marginTop:24, padding:'13px 32px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:12, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontSize:14, fontWeight:700 }
        }, 'Skip Rest →')
      )
    );
  }

  // ── ACTIVE EXERCISE SCREEN ────────────────────────────────────
  var isTimed = !!ex.duration_secs;

  return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#060b14', overflow:'hidden' } },
    h(YTAmbient, { src: ytSrc }),
    h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:'radial-gradient(ellipse at center, rgba(6,11,20,0.4) 0%, rgba(6,11,20,0.88) 100%)' } }),
    StopBtn,
    showStop && h(StopConfirm, { onConfirm: handleStop, onCancel: function() { setShowStop(false); } }),

    h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'24px 20px 32px' } },

      // Progress bar
      h('div', { style:{ marginBottom:20 } },
        h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 } },
          h('span', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.1em' } },
            'Exercise ' + (exIdx+1) + ' of ' + totalExes
          ),
          h('span', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.1em' } },
            workout.name
          )
        ),
        h('div', { style:{ height:4, background:'rgba(255,255,255,0.08)', borderRadius:9999, overflow:'hidden' } },
          h('div', { style:{ height:'100%', borderRadius:9999, width: progressPct + '%', background:'linear-gradient(90deg,#22c55e,#4ade80)', transition:'width 0.6s ease' } })
        )
      ),

      // Exercise content
      h('div', { style:{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', paddingBottom:20 } },
        h('div', { style:{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.14em', marginBottom:12 } },
          'Set ' + (setIdx+1) + ' of ' + ex.sets
        ),
        h('h2', { style:{ fontSize:34, fontWeight:900, color:'#f8fafc', lineHeight:1.1, margin:'0 0 16px', letterSpacing:'-0.02em' } },
          ex.name
        ),

        // Timed exercise: live SVG ring countdown
        // Rep exercise: static badge
        isTimed
          ? h('div', { style:{ display:'flex', justifyContent:'center', marginBottom:20 } },
              h(RingTimer, { secs:exTimerSecs, total:exTimerTotal, color:'#22c55e', label:'secs left' })
            )
          : h('div', { style:{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'10px 20px', borderRadius:99, marginBottom:20,
              background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)',
              width:'fit-content',
            }},
              h('span', { style:{ fontSize:20, fontWeight:900, color:'#4ade80' } }, ex.reps + ' reps')
            ),

        // Tip card
        ex.tip && h('div', { style:{ padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', marginBottom:12 } },
          h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 } }, '💡 Tip'),
          h('p', { style:{ fontSize:13, color:'rgba(255,255,255,0.65)', lineHeight:1.55, margin:0 } }, ex.tip)
        ),

        // Cricket benefit
        ex.cricket_benefit && h('div', { style:{ padding:'10px 14px', borderRadius:10, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)' } },
          h('span', { style:{ fontSize:11, color:'rgba(251,191,36,0.7)', fontWeight:600 } }, '🏏 ' + ex.cricket_benefit)
        )
      ),

      // Done Set button — for timed exercises label changes to "Finish Early"
      h('button', {
        onClick: handleDoneSet,
        style:{
          width:'100%', padding:'18px', border:'none', borderRadius:16,
          fontFamily:'inherit', fontSize:17, fontWeight:800, cursor:'pointer',
          background:'linear-gradient(135deg,#16a34a,#22c55e)',
          color:'#fff', boxShadow:'0 6px 28px rgba(22,163,74,0.45)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:10,
          letterSpacing:'0.02em',
        }
      }, isTimed ? '✓  Finish Early' : '✓  Done Set')
    )
  );
}

window.SC_APP.WorkoutPlayerPage = WorkoutPlayerPage;
console.log('[SC] app-workout-player v2.0 — cricket playlist + live timers + stop workout');
})();
