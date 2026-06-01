// ================================================================
// app-workout-player.js — SmartCrick Immersive Workout Player v3.0
// Cricket highlights on ALL workouts · premium redesign · live timers
// ================================================================
(function() {
'use strict';
var h        = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef   = React.useRef;
var A = window.SC_APP;

// ─── Rest times by level ──────────────────────────────────────
var REST = {
  beginner:     { sets: 45, between: 60 },
  intermediate: { sets: 30, between: 45 },
  advanced:     { sets: 20, between: 30 },
  pro:          { sets: 15, between: 20 },
};

// ─── Cricket playlist (plays on ALL workouts) ─────────────────
// Uses independent coaching/compilation channels — these allow embedding.
// Official board channels (ICC, BCCI, IPL) disable embedding by default.
var CRICKET_PLAYLIST = [
  'FFcuJpZQ_Xc',  // Hit More Sixes Easily — Power Hitting Drills
  'ZjddyzEoqUU',  // Hit HUGE Sixes Consistently — drill set
  'WJTB06RIkoM',  // How PRO Players Train Power Hitting (unfiltered session)
  'eVdkAMu01rI',  // Spectacular Ball Striking | Six Hitting 2024
  'CV0EQKC4bzI',  // Improve Your Power Hitting — coaching session
  '98oFiKrP0Eg',  // Cricket Power Hitting Masterclass — bat & hit sixes
  'eHGK7F_lUyE',  // 5 Cricket Batting Drills every player MUST do
  'm5tudvaSSiY',  // Top 10 Cricket Batting Drills of 2024
  'KFE6HaIfaMU',  // Top 10 Cricket Drills of the Year
  'tlNROo5VETM',  // Dean Jones — 55 biggest sixes compilation
];

var YT_SRC = 'https://www.youtube.com/embed/' + CRICKET_PLAYLIST[0] +
  '?autoplay=1&mute=1&controls=0&loop=1' +
  '&playlist=' + CRICKET_PLAYLIST.join(',') +
  '&playsinline=1&enablejsapi=1&rel=0&modestbranding=1';

// ─── Motivational phrases ─────────────────────────────────────
var MOTIVATIONS = [
  'Push harder! 🔥',
  "You've got this! 💪",
  'Every rep builds a champion!',
  'Cricket legend in the making! 🏏',
  'Champions are forged right here!',
  'Embrace the burn — it means growth! 🔥',
  'Stay locked in. Stay focused.',
  'Beast mode: ON 💪',
  "Don't stop. Not now. Not ever.",
  'Elite cricketers train exactly like this! 🏆',
  'Your future self will thank you.',
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

// ─── Audio ────────────────────────────────────────────────────
function getAudioCtx() {
  if (!window._scAudioCtx) {
    try { window._scAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  return window._scAudioCtx;
}

function playDing() {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    [[440, 0.30], [880, 0.11], [1320, 0.04]].forEach(function(pair) {
      var osc = ctx.createOscillator();
      var g   = ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pair[0], ctx.currentTime);
      g.gain.setValueAtTime(0.001, ctx.currentTime);
      g.gain.linearRampToValueAtTime(pair[1], ctx.currentTime + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2.2);
    });
  } catch(e) {}
}

function playBeep() {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    var osc = ctx.createOscillator();
    var g   = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, ctx.currentTime);
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  } catch(e) {}
}

// ─── SVG Ring Timer ───────────────────────────────────────────
function RingTimer(props) {
  var secs  = props.secs  || 0;
  var total = props.total || 1;
  var color = props.color || '#f59e0b';
  var size  = props.size  || 200;
  var label = props.label || 'secs';
  var r     = size * 0.40;
  var sw    = size * 0.055;
  var circ  = 2 * Math.PI * r;
  var pct   = total > 0 ? secs / total : 0;
  var cx    = size / 2;

  return h('div', { style:{ position:'relative', width:size, height:size, flexShrink:0 } },
    h('svg', { width:size, height:size, style:{ transform:'rotate(-90deg)' } },
      h('circle', { cx:cx, cy:cx, r:r, fill:'none',
        stroke:'rgba(255,255,255,0.06)', strokeWidth:sw }),
      h('circle', { cx:cx, cy:cx, r:r, fill:'none',
        stroke:color, strokeWidth:sw,
        strokeDasharray: circ,
        strokeDashoffset: circ * (1 - pct),
        strokeLinecap: 'round',
        style:{
          transition:'stroke-dashoffset 0.95s linear',
          filter:'drop-shadow(0 0 12px '+color+')',
        },
      })
    ),
    h('div', { style:{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' } },
      h('div', { style:{ fontSize: size * 0.24, fontWeight:900, color:'#f8fafc', fontVariantNumeric:'tabular-nums', lineHeight:1, letterSpacing:'-0.02em' } }, secs),
      h('div', { style:{ fontSize: size * 0.068, fontWeight:800, color:'rgba(255,255,255,0.35)', letterSpacing:'0.12em', textTransform:'uppercase', marginTop:4 } }, label)
    )
  );
}

// ─── YouTube cover background (plays on ALL screens) ─────────
// objectFit:cover does NOT work on iframes — use the 177.78vh technique
function YTCover() {
  return h('iframe', {
    src: YT_SRC,
    allow: 'autoplay; encrypted-media',
    allowFullScreen: false,
    frameBorder: '0',
    style:{
      position:'fixed',
      top:'50%', left:'50%',
      width:'177.78vh',
      height:'100vh',
      minWidth:'100vw',
      transform:'translate(-50%,-50%)',
      zIndex:0, opacity:0.45, pointerEvents:'none', border:'none',
    }
  });
}

// ─── Always-visible dark cinematic gradient ───────────────────
function CinematicBg() {
  return h('div', { style:{
    position:'fixed', inset:0, zIndex:0,
    background:'linear-gradient(160deg,#03060f 0%,#081220 30%,#050e08 58%,#0c0618 80%,#03060f 100%)',
  }});
}

// ─── Vignette overlay ─────────────────────────────────────────
function Vignette(props) {
  var strength = props.strength || 'medium';
  var bg = strength === 'heavy'
    ? 'rgba(2,5,14,0.88)'
    : 'radial-gradient(ellipse at 50% 42%, rgba(2,5,14,0.22) 0%, rgba(2,5,14,0.88) 68%)';
  return h('div', { style:{ position:'fixed', inset:0, zIndex:1, background:bg } });
}

// ─── Stop confirm overlay ─────────────────────────────────────
function StopConfirm(props) {
  return h('div', {
    style:{ position:'fixed', inset:0, zIndex:60,
      background:'rgba(2,5,14,0.95)', backdropFilter:'blur(14px)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:24 }
  },
    h('div', { style:{ background:'#0c1220', borderRadius:22,
      border:'1px solid rgba(255,255,255,0.09)', padding:'32px 24px',
      maxWidth:320, width:'100%', textAlign:'center',
      boxShadow:'0 32px 80px rgba(0,0,0,0.8)' } },
      h('div', { style:{ fontSize:44, marginBottom:12 } }, '🛑'),
      h('h3', { style:{ fontSize:21, fontWeight:900, color:'#f8fafc', margin:'0 0 10px', letterSpacing:'-0.01em' } }, 'Stop This Workout?'),
      h('p',  { style:{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.65, marginBottom:28, margin:'0 0 28px' } },
        'Your progress will be lost and no XP will be awarded.'),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:10 } },
        h('button', { onClick:props.onConfirm, style:{ padding:'15px',
          background:'linear-gradient(135deg,#991b1b,#dc2626)',
          color:'#fff', border:'none', borderRadius:13, cursor:'pointer',
          fontFamily:'inherit', fontWeight:800, fontSize:15, letterSpacing:'0.01em' } },
          'Stop & Exit'),
        h('button', { onClick:props.onCancel, style:{ padding:'14px',
          background:'rgba(255,255,255,0.05)',
          border:'1px solid rgba(255,255,255,0.11)', borderRadius:13,
          color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit',
          fontWeight:600, fontSize:14 } },
          'Keep Going 💪')
      )
    )
  );
}

// ─── Level config ─────────────────────────────────────────────
var LVL = {
  beginner:     { col:'#34d399', grad:'#065f46,#059669', glow:'rgba(52,211,153,0.35)' },
  intermediate: { col:'#60a5fa', grad:'#1e40af,#3b82f6', glow:'rgba(96,165,250,0.35)' },
  advanced:     { col:'#c084fc', grad:'#6d28d9,#9333ea', glow:'rgba(192,132,252,0.35)' },
  pro:          { col:'#f87171', grad:'#991b1b,#ef4444', glow:'rgba(248,113,113,0.35)' },
};

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
  var handleDoneSetRef = useRef(null);

  var restLevel = (workout && REST[workout.level]) || REST.beginner;
  var lvl       = (workout && LVL[workout.level])  || LVL.beginner;

  // ── Elapsed timer ────────────────────────────────────────────
  useEffect(function() {
    var t = setInterval(function() { elapsedRef.current++; setElapsed(elapsedRef.current); }, 1000);
    return function() { clearInterval(t); };
  }, []);

  // ── Cleanup on unmount ───────────────────────────────────────
  useEffect(function() {
    return function() { clearInterval(timerRef.current); clearInterval(exTimerRef.current); };
  }, []);

  // ── Exercise-timer-done event (uses ref, never stale) ────────
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

  // ── Exercise countdown (timed exercises only) ────────────────
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

  // ── Not found ────────────────────────────────────────────────
  if (!workout) {
    return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'#03060f', color:'#f8fafc', padding:32 } },
      h('div', { style:{ fontSize:48, marginBottom:16 } }, '💪'),
      h('p', { style:{ fontWeight:700, marginBottom:16 } }, 'Workout not found'),
      h('button', { onClick:function(){A.nav('Fitness');}, style:{ padding:'12px 24px', background:'#15803d', color:'#fff', border:'none', borderRadius:10, cursor:'pointer', fontFamily:'inherit', fontWeight:700 } }, '← Back')
    );
  }

  var ex        = exercises[exIdx] || null;
  var totalExes = exercises.length;

  // ── handleDoneSet (kept fresh via ref) ───────────────────────
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
        confetti({ particleCount:160, spread:90, origin:{y:0.65}, colors:['#22c55e','#fbbf24','#f8fafc','#60a5fa','#c084fc'] });
        setTimeout(function() { confetti({ particleCount:80, spread:130, origin:{y:0.15} }); }, 600);
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

  // ── Stop button (fixed top-left, all active screens) ─────────
  var StopBtn = h('button', {
    onClick: function() { setShowStop(true); },
    style:{
      position:'fixed', top:16, left:16, zIndex:20,
      background:'rgba(0,0,0,0.65)', backdropFilter:'blur(10px)',
      border:'1px solid rgba(255,255,255,0.1)', borderRadius:10,
      padding:'8px 14px', color:'rgba(255,255,255,0.55)',
      cursor:'pointer', fontFamily:'inherit', fontSize:13, fontWeight:700,
    }
  }, '✕ Stop');

  // ════════════════════════════════════════════════════════════
  // PREVIEW SCREEN
  // ════════════════════════════════════════════════════════════
  if (status === 'preview') {
    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
      h(CinematicBg),
      h(YTCover),
      h('div', { style:{ position:'fixed', inset:0, zIndex:1,
        background:'radial-gradient(ellipse at center, rgba(2,5,14,0.45) 0%, rgba(2,5,14,0.94) 100%)' } }),

      h('div', { style:{ position:'relative', zIndex:2, display:'flex', flexDirection:'column', minHeight:'100dvh', padding:'env(safe-area-inset-top,20px) 20px 32px' } },

        // Back button
        h('button', {
          onClick:function(){A.nav('WorkoutDetail',{id:workout.id});},
          style:{ alignSelf:'flex-start', background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.12)', borderRadius:10,
            padding:'8px 16px', color:'#d1d5db', cursor:'pointer',
            fontFamily:'inherit', fontSize:13, fontWeight:600, marginBottom:28, marginTop:4 }
        }, '← Back'),

        // Workout header
        h('div', { style:{ marginBottom:24 } },
          h('div', { style:{ display:'flex', alignItems:'center', gap:8, marginBottom:10 } },
            h('span', { style:{ fontSize:10, fontWeight:800, color:lvl.col, letterSpacing:'0.18em', textTransform:'uppercase' } }, workout.level),
            h('span', { style:{ fontSize:10, color:'rgba(255,255,255,0.2)' } }, '·'),
            h('span', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.45)', letterSpacing:'0.14em', textTransform:'uppercase' } }, workout.target.replace('-',' ')),
          ),
          h('h1', { style:{ fontSize:30, fontWeight:900, color:'#f8fafc', lineHeight:1.12, margin:'0 0 14px', letterSpacing:'-0.02em' } }, workout.name),
          h('div', { style:{ display:'flex', gap:8, flexWrap:'wrap' } },
            h('span', { style:{ padding:'5px 13px', borderRadius:20, background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.25)', fontSize:12, fontWeight:700, color:'#4ade80' } }, workout.duration_minutes + ' min'),
            h('span', { style:{ padding:'5px 13px', borderRadius:20, background:'rgba(251,191,36,0.10)', border:'1px solid rgba(251,191,36,0.22)', fontSize:12, fontWeight:700, color:'#fbbf24' } }, '+' + workout.xp_value + ' XP'),
            h('span', { style:{ padding:'5px 13px', borderRadius:20, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)', fontSize:12, fontWeight:700, color:'#cbd5e1' } }, totalExes + ' exercises')
          )
        ),

        // Exercise list
        h('div', { style:{ flex:1, overflowY:'auto', marginBottom:24,
          background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)',
          borderRadius:18, border:'1px solid rgba(255,255,255,0.06)', padding:'8px 0' } },
          exercises.map(function(e, i) {
            return h('div', { key:e.id, style:{
              display:'flex', alignItems:'center', gap:12, padding:'12px 16px',
              borderBottom: i < exercises.length-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }},
              h('div', { style:{ width:28, height:28, borderRadius:'50%',
                background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.32)', flexShrink:0 } }, i+1),
              h('div', { style:{ flex:1, minWidth:0 } },
                h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' } }, e.name),
                h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 } },
                  e.sets + ' sets · ' + (e.duration_secs ? e.duration_secs + 's' : e.reps + ' reps'))
              ),
              e.duration_secs && h('div', { style:{
                fontSize:10, fontWeight:800, color:'#60a5fa',
                background:'rgba(96,165,250,0.09)', border:'1px solid rgba(96,165,250,0.16)',
                borderRadius:6, padding:'2px 8px', flexShrink:0, letterSpacing:'0.04em' } }, '⏱ TIMED')
            );
          })
        ),

        // Start CTA
        h('button', {
          onClick:function(){setStatus('set_active');setExIdx(0);setSetIdx(0);},
          style:{
            width:'100%', padding:'19px', border:'none', borderRadius:16,
            fontFamily:'inherit', fontSize:17, fontWeight:900, cursor:'pointer',
            background:'linear-gradient(135deg,' + lvl.grad + ')',
            color:'#fff', boxShadow:'0 8px 32px ' + lvl.glow,
            letterSpacing:'0.03em',
          }
        }, '🏋️  Start Workout')
      )
    );
  }

  // ════════════════════════════════════════════════════════════
  // DONE SCREEN
  // ════════════════════════════════════════════════════════════
  if (status === 'done') {
    var mins = Math.floor(elapsedRef.current / 60);
    var secs = elapsedRef.current % 60;
    return h('div', { style:{
      display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'100dvh',
      background:'linear-gradient(160deg,#03060f 0%,#050e08 50%,#03060f 100%)',
      padding:'32px 24px', textAlign:'center' } },

      h('div', { style:{ fontSize:70, marginBottom:10, filter:'drop-shadow(0 0 24px rgba(251,191,36,0.4))' } }, '🏆'),
      h('h1', { style:{ fontSize:32, fontWeight:900, color:'#f8fafc', marginBottom:6, letterSpacing:'-0.02em' } }, 'Workout Complete!'),
      h('p',  { style:{ color:'rgba(255,255,255,0.35)', marginBottom:32, fontSize:14, fontWeight:600 } }, workout.name),

      h('div', { style:{ display:'flex', gap:12, marginBottom:36, justifyContent:'center', flexWrap:'wrap' } },
        [
          { val: '+' + workout.xp_value, label:'XP Earned',  col:'#4ade80', bg:'rgba(34,197,94,0.10)',  border:'rgba(34,197,94,0.22)' },
          { val: mins + ':' + (secs<10?'0':'') + secs, label:'Time',  col:'#fbbf24', bg:'rgba(251,191,36,0.08)', border:'rgba(251,191,36,0.20)' },
          { val: totalExes,  label:'Exercises', col:'#a5b4fc', bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.20)' },
        ].map(function(item) {
          return h('div', { key:item.label, style:{ padding:'18px 22px', borderRadius:16, background:item.bg, border:'1px solid '+item.border, textAlign:'center', minWidth:90 } },
            h('div', { style:{ fontSize:28, fontWeight:900, color:item.col } }, item.val),
            h('div', { style:{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:5 } }, item.label)
          );
        })
      ),

      h('div', { style:{ display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:300 } },
        h('button', { onClick:function(){A.nav('Fitness');}, style:{ padding:'17px', background:'linear-gradient(135deg,#c2410c,#ea580c)', color:'#fff', border:'none', borderRadius:13, cursor:'pointer', fontFamily:'inherit', fontWeight:800, fontSize:15, letterSpacing:'0.02em' } }, 'More Workouts'),
        h('button', { onClick:function(){A.nav('Home');}, style:{ padding:'15px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius:13, color:'#e2e8f0', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:14 } }, 'Go Home')
      )
    );
  }

  // Safety guard
  if (!ex) { if (status !== 'done') setStatus('done'); return null; }

  var progressPct  = totalExes > 0 ? ((exIdx + 1) / totalExes * 100) : 0;
  var isResting    = status === 'set_rest' || status === 'ex_rest';
  var ringColor    = status === 'ex_rest' ? '#60a5fa' : '#f59e0b';
  var motiv        = MOTIVATIONS[(exIdx * 3 + setIdx) % MOTIVATIONS.length];
  var restQuote    = REST_QUOTES[exIdx % REST_QUOTES.length];

  // ════════════════════════════════════════════════════════════
  // REST SCREEN (between sets or exercises)
  // ════════════════════════════════════════════════════════════
  if (isResting) {
    var nextEx    = status === 'ex_rest' ? (exercises[exIdx] || null) : ex;
    var restLabel = status === 'ex_rest' ? 'EXERCISE REST' : 'SET REST';
    var restTitleColor = status === 'ex_rest' ? '#60a5fa' : '#fbbf24';

    return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
      h(CinematicBg),
      h(YTCover),
      h(Vignette, { strength:'heavy' }),
      StopBtn,
      showStop && h(StopConfirm, { onConfirm:handleStop, onCancel:function(){setShowStop(false);} }),

      h('div', { style:{
        position:'relative', zIndex:2,
        display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', minHeight:'100dvh', padding:'32px 24px',
        textAlign:'center',
      }},

        // Label pill
        h('div', { style:{
          display:'inline-flex', alignItems:'center', gap:6,
          padding:'6px 16px', borderRadius:20,
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.08)',
          marginBottom:28,
        }},
          h('div', { style:{ width:6, height:6, borderRadius:'50%', background:restTitleColor, boxShadow:'0 0 6px '+restTitleColor } }),
          h('span', { style:{ fontSize:11, fontWeight:800, color:restTitleColor, letterSpacing:'0.2em', textTransform:'uppercase' } }, restLabel)
        ),

        // Big ring
        h(RingTimer, { secs:restSecs, total:restTotal, color:ringColor, size:230, label:'secs' }),

        // Rest quote
        h('p', { style:{
          fontSize:15, color:'rgba(255,255,255,0.42)', marginTop:24, marginBottom:28,
          fontStyle:'italic', maxWidth:280, lineHeight:1.65, fontWeight:500,
        }}, restQuote),

        // Up next card
        nextEx && h('div', { style:{
          background:'rgba(255,255,255,0.03)', backdropFilter:'blur(16px)',
          border:'1px solid rgba(255,255,255,0.07)', borderRadius:16,
          padding:'16px 20px', width:'100%', maxWidth:310, textAlign:'left', marginBottom:28,
        }},
          h('div', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:10 } }, '▶  Up Next'),
          h('div', { style:{ fontSize:18, fontWeight:900, color:'#f0fdf4', marginBottom:6, letterSpacing:'-0.01em' } }, nextEx.name),
          h('div', { style:{ display:'flex', gap:12, alignItems:'center' } },
            h('span', { style:{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)' } }, nextEx.sets + ' sets'),
            h('span', { style:{ fontSize:10, color:'rgba(255,255,255,0.15)' } }, '·'),
            h('span', { style:{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.35)' } },
              nextEx.duration_secs ? nextEx.duration_secs + ' seconds' : nextEx.reps + ' reps')
          )
        ),

        // Skip button
        h('button', { onClick:handleSkipRest, style:{
          padding:'13px 32px',
          background:'rgba(255,255,255,0.05)',
          border:'1px solid rgba(255,255,255,0.11)', borderRadius:12,
          color:'rgba(255,255,255,0.65)', cursor:'pointer',
          fontFamily:'inherit', fontSize:14, fontWeight:700, letterSpacing:'0.02em',
        }}, 'Skip Rest →')
      )
    );
  }

  // ════════════════════════════════════════════════════════════
  // ACTIVE EXERCISE SCREEN
  // ════════════════════════════════════════════════════════════
  var isTimed = !!ex.duration_secs;

  return h('div', { style:{ position:'relative', minHeight:'100dvh', background:'#03060f', overflow:'hidden' } },
    h(CinematicBg),
    h(YTCover),
    // Lighter vignette so cricket video shows through the middle
    h('div', { style:{ position:'fixed', inset:0, zIndex:1,
      background:'radial-gradient(ellipse at 50% 40%, rgba(2,5,14,0.18) 0%, rgba(2,5,14,0.86) 65%)' } }),
    StopBtn,
    showStop && h(StopConfirm, { onConfirm:handleStop, onCancel:function(){setShowStop(false);} }),

    h('div', { style:{
      position:'relative', zIndex:2,
      display:'flex', flexDirection:'column',
      minHeight:'100dvh', padding:'16px 20px 24px',
    }},

      // ── Top bar: progress + level ───────────────────────────
      h('div', { style:{ marginBottom:14, paddingTop:'env(safe-area-inset-top,0px)' } },
        h('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 } },
          h('span', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'0.1em' } },
            'Exercise ' + (exIdx+1) + ' of ' + totalExes),
          h('span', { style:{ fontSize:11, fontWeight:800, color:lvl.col, textTransform:'uppercase', letterSpacing:'0.12em' } }, workout.level)
        ),
        h('div', { style:{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:9999, overflow:'hidden' } },
          h('div', { style:{
            height:'100%', width:progressPct+'%',
            background:'linear-gradient(90deg,' + lvl.grad + ')',
            borderRadius:9999, transition:'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            boxShadow:'0 0 10px ' + lvl.glow,
          }})
        )
      ),

      // ── Set dot indicators ──────────────────────────────────
      h('div', { style:{ display:'flex', alignItems:'center', gap:7, marginBottom:16 } },
        h('span', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.28)', textTransform:'uppercase', letterSpacing:'0.14em', marginRight:3 } }, 'Set'),
        [].concat(Array.apply(null, Array(ex.sets))).map(function(_, i) {
          var done = i < setIdx;
          var cur  = i === setIdx;
          return h('div', { key:i, style:{
            width: cur ? 22 : 8, height:8, borderRadius:9999,
            background: done ? lvl.col : cur ? '#fff' : 'rgba(255,255,255,0.13)',
            transition:'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            boxShadow: cur ? '0 0 10px ' + lvl.col : done ? '0 0 6px ' + lvl.col + '55' : 'none',
          }});
        }),
        h('span', { style:{ fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.28)', marginLeft:4 } },
          (setIdx+1) + '/' + ex.sets)
      ),

      // ── Exercise name ───────────────────────────────────────
      h('h2', { style:{
        fontSize:40, fontWeight:900, color:'#f8fafc',
        lineHeight:1.05, margin:'0 0 22px', letterSpacing:'-0.025em',
        textShadow:'0 2px 20px rgba(0,0,0,0.8)',
      }}, ex.name),

      // ── Main content (flex-fill, vertically centred) ────────
      h('div', { style:{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', gap:14 } },

        // Timer ring OR reps badge
        isTimed
          ? h('div', { style:{ display:'flex', alignItems:'center', gap:22, marginBottom:4 } },
              h(RingTimer, { secs:exTimerSecs, total:exTimerTotal, color:'#22c55e', size:164, label:'left' }),
              h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
                h('div', { style:{ fontSize:13, fontWeight:800, color:'rgba(34,197,94,0.85)', textTransform:'uppercase', letterSpacing:'0.1em' } }, 'Hold it!'),
                h('div', { style:{ fontSize:13, color:'rgba(255,255,255,0.42)', lineHeight:1.6, maxWidth:150 } },
                  'Timer auto-advances when done. Tap below to finish early.')
              )
            )
          : h('div', { style:{
              alignSelf:'flex-start', display:'flex', alignItems:'baseline', gap:10,
              padding:'14px 28px', borderRadius:99, marginBottom:4,
              background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.18)',
            }},
              h('span', { style:{ fontSize:52, fontWeight:900, color:'#4ade80', lineHeight:1, letterSpacing:'-0.03em' } }, ex.reps),
              h('span', { style:{ fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.38)' } }, 'reps')
            ),

        // Form tip
        ex.tip && h('div', { style:{
          padding:'13px 16px', borderRadius:13,
          background:'rgba(255,255,255,0.03)', backdropFilter:'blur(12px)',
          border:'1px solid rgba(255,255,255,0.06)',
        }},
          h('div', { style:{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 } }, '💡 Form Tip'),
          h('p',   { style:{ fontSize:13, color:'rgba(255,255,255,0.55)', lineHeight:1.55, margin:0 } }, ex.tip)
        ),

        // Cricket benefit
        ex.cricket_benefit && h('div', { style:{
          padding:'10px 16px', borderRadius:11,
          background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.10)',
        }},
          h('span', { style:{ fontSize:12, color:'rgba(251,191,36,0.75)', fontWeight:700 } },
            '🏏 ' + ex.cricket_benefit)
        ),

        // Motivational text
        h('div', { style:{
          fontSize:14, fontWeight:800, color:lvl.col, opacity:0.75,
          letterSpacing:'0.01em', paddingLeft:2,
        }}, motiv)
      ),

      // ── Done Set / Finish Early CTA ─────────────────────────
      h('button', { onClick:handleDoneSet, style:{
        width:'100%', padding:'19px', border:'none', borderRadius:16,
        fontFamily:'inherit', fontSize:17, fontWeight:900, cursor:'pointer',
        background:'linear-gradient(135deg,#15803d,#22c55e)',
        color:'#fff', boxShadow:'0 8px 28px rgba(21,128,61,0.40)',
        display:'flex', alignItems:'center', justifyContent:'center',
        gap:10, letterSpacing:'0.03em', marginTop:16,
      }},
        isTimed ? '✓  Finish Early' : '✓  Done Set'
      )
    )
  );
}

window.SC_APP.WorkoutPlayerPage = WorkoutPlayerPage;
console.log('[SC] app-workout-player v3.0 — cricket highlights on ALL workouts · premium redesign');
})();
