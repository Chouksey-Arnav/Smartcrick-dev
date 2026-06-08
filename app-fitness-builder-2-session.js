// ================================================================
// app-fitness-builder-2-session.js — FB2 Active Session Screen
// Ring countdown timer (reuses A.Ring), theme-aware backgrounds,
// settings overlay, bulletproof End Workout state reset.
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const FB2 = A.FB2;
const C = FB2.FB2_PALETTE.dark;
const { nav, fmtTime } = A;
const Ring = A.Ring; // exported from app-timer.js

// ── End Workout — full state reset ────────────────────────────
// Translates: Timer.invalidate() → clearInterval
//             UNNotification cleanup → CrickNotif.cancel
//             SwiftData reset → FB2.clearSession2()
function endWorkout(timerRef, workRef, sessionRecord, onDone) {
  clearInterval(timerRef.current);
  clearInterval(workRef.current);
  try {
    // Clear any FB2 session notifications if CrickNotif is available
    if (A.CrickNotif && A.CrickNotif.cancelAll) A.CrickNotif.cancelAll();
  } catch(e) {}
  FB2.clearSession2();             // DELETE fitness2_session entirely — prevents erroneous restart
  if (sessionRecord) FB2.appendLog2(sessionRecord);
  if (onDone) onDone();
}

// ── Settings overlay ──────────────────────────────────────────
function SettingsOverlay({ onClose, onEnd, restSecs, setRestSecs, soundOn, setSoundOn }) {
  return h('div', {
    onClick:onClose,
    style:{
      position:'fixed', inset:0, zIndex:50,
      background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }
  },
    h('div', {
      onClick:function(e){ e.stopPropagation(); },
      style:{
        width:'100%', maxWidth:480,
        background:'rgba(15,18,24,0.92)', backdropFilter:'blur(16px)',
        borderRadius:'20px 20px 0 0', border:'1px solid rgba(48,54,61,0.9)',
        borderBottom:'none', padding:'20px 20px 32px',
      }
    },
      h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }},
        h('div', { style:{ fontSize:15, fontWeight:900, color:C.text }}, 'Session settings'),
        h('button', {
          onClick:onClose, 'aria-label':'Close settings',
          style:{
            background:'rgba(48,54,61,0.7)', border:'none', borderRadius:9999,
            color:'#94a3b8', // theme-aware neutral — visible in dark bg
            fontSize:15, fontWeight:800, padding:'7px 12px', cursor:'pointer',
          }
        }, '✕')
      ),
      // Rest duration
      h('div', { style:{ marginBottom:18 }},
        h('div', { style:{ display:'flex', justifyContent:'space-between', marginBottom:10 }},
          h('span', { style:{ fontSize:13.5, fontWeight:700, color:C.text }}, 'Rest between sets'),
          h('span', { style:{ fontSize:13.5, fontWeight:800, color:C.accent }}, restSecs + 's')
        ),
        h('input', {
          type:'range', min:15, max:120, step:5, value:restSecs,
          onChange:function(e){ setRestSecs(parseInt(e.target.value, 10)); },
          style:{ width:'100%', accentColor:C.accent, cursor:'pointer' }
        })
      ),
      // Sound toggle
      h('div', { style:{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'13px 14px', borderRadius:12,
        background:C.card, border:'1px solid '+C.border, marginBottom:18,
      }},
        h('div', null,
          h('div', { style:{ fontSize:14, fontWeight:700, color:C.text }}, '🔔 Audio cues'),
          h('div', { style:{ fontSize:11, color:C.dim, marginTop:2 }}, 'Beep at end of each set')
        ),
        h('button', {
          onClick:function(){ setSoundOn(function(s){ return !s; }); },
          style:{
            width:48, height:26, borderRadius:99, cursor:'pointer', border:'none',
            background:soundOn?C.accent:'rgba(75,85,99,0.4)', position:'relative', transition:'background 0.2s',
          }
        },
          h('div', { style:{
            position:'absolute', top:3, left: soundOn?24:3, width:20, height:20,
            borderRadius:'50%', background:'#fff', transition:'left 0.2s',
          }})
        )
      ),
      // End workout — the critical button
      h('button', {
        onClick:onEnd,
        style:{
          width:'100%', padding:'14px', border:'none', borderRadius:13,
          fontSize:14, fontWeight:800, fontFamily:'inherit', cursor:'pointer',
          background:'rgba(239,68,68,0.1)', color:'#f87171',
          border:'1px solid rgba(239,68,68,0.3)',
        }
      }, '🛑 End workout')
    )
  );
}

// ── Active session screen ──────────────────────────────────────
function FB2SessionScreen({ exercises, planId, onDone }) {
  var idxState = useState(0);
  var exIdx = idxState[0], setExIdx = idxState[1];
  var phaseState = useState('work');   // 'work' | 'rest' | 'done'
  var phase = phaseState[0], setPhase = phaseState[1];
  var restSecsState = useState(30);
  var restSecs = restSecsState[0], setRestSecs = restSecsState[1];
  var soundState = useState(true);
  var soundOn = soundState[0], setSoundOn = soundState[1];
  var showSettingsState = useState(false);
  var showSettings = showSettingsState[0], setShowSettings = showSettingsState[1];
  var startTs = useRef(Date.now());
  var timerRef  = useRef(null);   // active countdown interval
  var workRef   = useRef(null);   // work phase interval
  var setsState = useState(1);
  var setNum = setsState[0], setSetNum = setsState[1];

  var ex = exercises[exIdx] || null;
  var totalSets = ex ? (ex.sets || 3) : 1;
  var workDuration = ex ? (ex.duration_secs || Math.max(20, (ex.reps || 12) * 3)) : 30;
  var totalExercises = exercises.length;

  var timeState = useState(workDuration);
  var timeLeft = timeState[0], setTimeLeft = timeState[1];
  var running = useRef(true);

  // Persist ephemeral session on every exercise change
  useEffect(function() {
    if (ex && phase !== 'done') {
      FB2.saveSession2({
        planId: planId || null,
        exerciseIndex: exIdx,
        exerciseName: ex.name,
        setNum: setNum,
        startedAt: new Date(startTs.current).toISOString(),
        status: 'active',
      });
    }
  }, [exIdx, setNum]);

  // Timer logic
  useEffect(function() {
    if (phase === 'done') return;
    var duration = phase === 'rest' ? restSecs : workDuration;
    setTimeLeft(duration);
    timerRef.current = setInterval(function() {
      setTimeLeft(function(t) {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (soundOn) {
            try {
              var ctx = new (window.AudioContext || window.webkitAudioContext)();
              var osc = ctx.createOscillator();
              osc.connect(ctx.destination);
              osc.frequency.setValueAtTime(phase==='rest'?880:440, ctx.currentTime);
              osc.start(); osc.stop(ctx.currentTime + 0.12);
            } catch(e) {}
          }
          if (phase === 'work') {
            if (setNum < totalSets) {
              setPhase('rest');
            } else {
              advanceExercise();
            }
          } else {
            setSetNum(function(s) { return s + 1; });
            setPhase('work');
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return function() { clearInterval(timerRef.current); };
  }, [phase, exIdx, setNum, restSecs]);

  function advanceExercise() {
    if (exIdx + 1 < totalExercises) {
      setExIdx(function(i) { return i + 1; });
      setSetNum(1);
      setPhase('work');
    } else {
      setPhase('done');
    }
  }

  function skipExercise() { advanceExercise(); }

  function handleEnd() {
    var sessionRecord = {
      id: 'sess_' + Date.now(),
      planId: planId || null,
      exercisesCompleted: exIdx,
      totalExercises: totalExercises,
      durationSec: Math.round((Date.now() - startTs.current) / 1000),
      completedAt: new Date().toISOString(),
      exercises: exercises.slice(0, exIdx+1).map(function(e){ return e.id; }),
    };
    endWorkout(timerRef, workRef, sessionRecord, function() {
      try{ A.awardXP && A.awardXP(Math.min(50, exIdx * 8 + 10)); }catch(e){}
      if (onDone) onDone();
      else nav('FitnessBuilder2');
    });
  }

  // ── Ring progress ──────────────────────────────────────────
  var totalTime = phase === 'rest' ? restSecs : workDuration;
  var pct = totalTime > 0 ? timeLeft / totalTime : 0;
  var ringColor = phase === 'rest' ? '#60a5fa' : '#10b981';

  if (phase === 'done') {
    return h('div', { style:{
      minHeight:'100dvh', background:C.bg, display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', padding:'24px',
      maxWidth:480, margin:'0 auto', width:'100%', textAlign:'center',
    }},
      h('div', { style:{ fontSize:56, marginBottom:16 }}, '🏆'),
      h('h2', { style:{ fontSize:'1.7rem', fontWeight:900, color:C.text, marginBottom:8 }}, 'Workout complete!'),
      h('p', { style:{ fontSize:14, color:C.sub, lineHeight:1.6, marginBottom:24 }},
        'You finished ' + totalExercises + ' exercises.\nEvery rep counts.'
      ),
      h('button', {
        onClick:handleEnd,
        style:{
          padding:'15px 36px', border:'none', borderRadius:13,
          fontSize:15, fontWeight:800, fontFamily:'inherit', cursor:'pointer',
          background:'linear-gradient(135deg,#16a34a,#0d9488)', color:'#fff',
          boxShadow:'0 6px 20px rgba(22,163,74,0.35)',
        }
      }, 'See my progress →')
    );
  }

  return h('div', { style:{
    minHeight:'100dvh', background:'linear-gradient(180deg,#0a0f14 0%,#0d1117 100%)',
    display:'flex', flexDirection:'column', maxWidth:480, margin:'0 auto', width:'100%',
  }},
    // Header
    h('div', { style:{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'16px 20px 8px',
    }},
      h('button', {
        onClick:function(){ setShowSettings(true); }, 'aria-label':'Settings',
        style:{ background:'rgba(22,27,34,0.8)', border:'1px solid rgba(48,54,61,0.8)',
          borderRadius:10, padding:'8px 12px', cursor:'pointer', color:'#94a3b8', fontSize:14 }
      }, '⚙️'),
      h('div', { style:{ textAlign:'center' }},
        h('div', { style:{ fontSize:11, color:C.dim, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }},
          'Exercise ' + (exIdx+1) + ' / ' + totalExercises
        ),
        h('div', { style:{ fontSize:13.5, fontWeight:800, color:C.text, marginTop:2 }}, ex ? ex.name : '')
      ),
      h('button', {
        onClick:skipExercise, 'aria-label':'Skip exercise',
        style:{ background:'rgba(22,27,34,0.8)', border:'1px solid rgba(48,54,61,0.8)',
          borderRadius:10, padding:'8px 12px', cursor:'pointer', color:'#94a3b8', fontSize:12, fontWeight:700 }
      }, 'Skip')
    ),
    // Exercise progress bar
    h('div', { style:{ height:3, background:'rgba(48,54,61,0.5)', margin:'0 20px' }},
      h('div', { style:{
        height:'100%', width:((exIdx/totalExercises)*100)+'%',
        background:'linear-gradient(90deg,#16a34a,#34d399)', transition:'width 0.4s',
      }})
    ),
    // Category icon / visual center
    h('div', { style:{
      flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px',
    }},
      h('div', { style:{
        width:100, height:100, borderRadius:28, marginBottom:24,
        background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.2)',
        display:'flex', alignItems:'center', justifyContent:'center', fontSize:46,
      }},
        ex ? (
          ex.category==='push'?'💪':ex.category==='pull'?'🔄':
          ex.category==='legs'?'🦵':ex.category==='core'?'🎯':'⚡'
        ) : '⚡'
      ),
      // Ring timer — centered
      Ring ? h(Ring, { pct:pct, size:200, stroke:12, color:ringColor },
        h('div', { style:{ textAlign:'center' }},
          h('div', { style:{ fontSize:'2.2rem', fontWeight:900, color:C.text, fontVariantNumeric:'tabular-nums' }},
            fmtTime ? fmtTime(timeLeft) : (Math.floor(timeLeft/60)+':'+(timeLeft%60<10?'0':'')+timeLeft%60)
          ),
          h('div', { style:{ fontSize:11, color: phase==='rest'?'#60a5fa':C.sub, fontWeight:700, marginTop:2, textTransform:'uppercase', letterSpacing:'0.1em' }},
            phase === 'rest' ? 'Rest' : 'Set ' + setNum + ' / ' + totalSets
          )
        )
      ) : h('div', { style:{ fontSize:'3rem', fontWeight:900, color:C.text }},
        fmtTime ? fmtTime(timeLeft) : timeLeft
      ),
      // Exercise details
      ex && h('div', { style:{ marginTop:20, textAlign:'center' }},
        h('div', { style:{ fontSize:13, color:C.sub }},
          ex.sets + ' sets · ' + (ex.duration_secs ? ex.duration_secs+'s' : ex.reps+' reps') + ' · ' + (ex.rest_secs||30)+'s rest'
        ),
        ex.tip && h('div', { style:{ fontSize:11.5, color:C.dim, marginTop:6, maxWidth:280, lineHeight:1.5, textAlign:'center' }},
          '💡 ' + ex.tip
        )
      )
    ),
    // Bottom controls
    h('div', { style:{ padding:'0 20px 32px', display:'flex', gap:12 }},
      h('button', {
        onClick:function(){ setShowSettings(true); },
        style:{
          flex:1, padding:'13px', border:'1px solid rgba(48,54,61,0.8)', borderRadius:12,
          background:'rgba(22,27,34,0.8)', color:C.sub, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
        }
      }, '⚙️ Settings'),
      h('button', {
        onClick:skipExercise,
        style:{
          flex:2, padding:'13px', border:'none', borderRadius:12,
          background:'linear-gradient(135deg,#16a34a,#0d9488)', color:'#fff',
          fontSize:14, fontWeight:800, cursor:'pointer', fontFamily:'inherit',
          boxShadow:'0 4px 16px rgba(22,163,74,0.35)',
        }
      }, phase === 'rest' ? '⏭ Skip rest' : '→ Next set')
    ),
    showSettings && h(SettingsOverlay, {
      onClose:function(){ setShowSettings(false); },
      onEnd:handleEnd,
      restSecs:restSecs, setRestSecs:setRestSecs,
      soundOn:soundOn, setSoundOn:setSoundOn,
    })
  );
}

A.FB2SessionScreen = FB2SessionScreen;
console.log('[SC] app-fitness-builder-2-session ready');
})();
