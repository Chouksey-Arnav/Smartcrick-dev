// Save as: app-mental-integrated.js
// ================================================================
// SmartCrick — Mental Training Page v3.0 WITH AUDIO
// Replaces app-mental.js — add to index.html AFTER app-mental.js
// or use as standalone replacement
// ================================================================
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var A = window.SC_APP;
var DB = A.DB;
var nav = A.nav;
var awardXP = A.awardXP;

// ── MENTAL AUDIO ENGINE (inline — no external dependency) ────────
var AudioEngine = (function() {
  var ctx = null, leftOsc = null, rightOsc = null;
  var noise = null, noiseGain = null, binauralGain = null;
  var playing = false;

  function getCtx() {
    if(!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function stop() {
    try {
      if(leftOsc) { leftOsc.stop(); leftOsc.disconnect(); leftOsc = null; }
      if(rightOsc) { rightOsc.stop(); rightOsc.disconnect(); rightOsc = null; }
      if(noise) { noise.stop(); noise.disconnect(); noise = null; }
      if(noiseGain) { noiseGain.disconnect(); noiseGain = null; }
      if(binauralGain) { binauralGain.disconnect(); binauralGain = null; }
    } catch(e) {}
    playing = false;
  }

  function start(beatHz, carrierHz, ambienceType, volPct) {
    stop();
    var c = getCtx();
    if(!c) return;
    var vol = (volPct || 70) / 100;

    try {
      // Binaural beats
      var merger = c.createChannelMerger(2);
      merger.connect(c.destination);
      binauralGain = c.createGain();
      binauralGain.gain.value = vol * 0.35;

      leftOsc = c.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.value = carrierHz;
      var leftSplit = c.createGain();
      leftSplit.gain.value = 1;
      leftOsc.connect(leftSplit);
      leftSplit.connect(merger, 0, 0); // left channel

      rightOsc = c.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.value = carrierHz + beatHz;
      var rightSplit = c.createGain();
      rightSplit.gain.value = 1;
      rightOsc.connect(rightSplit);
      rightSplit.connect(merger, 0, 1); // right channel

      leftOsc.start();
      rightOsc.start();

      // Ambient noise layer
      if(ambienceType !== 'none') {
        noise = c.createBufferSource();
        var bufferSize = c.sampleRate * 4;
        var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        var data = buffer.getChannelData(0);

        if(ambienceType === 'white') {
          for(var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        } else if(ambienceType === 'pink') {
          // Pink noise (sounds like rain)
          var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
          for(var i=0;i<bufferSize;i++){
            var white=Math.random()*2-1;
            b0=0.99886*b0+white*0.0555179; b1=0.99332*b1+white*0.0750759;
            b2=0.96900*b2+white*0.1538520; b3=0.86650*b3+white*0.3104856;
            b4=0.55000*b4+white*0.5329522; b5=-0.7616*b5-white*0.0168980;
            data[i]=(b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11;
            b6=white*0.115926;
          }
        } else {
          // Brown noise (forest/ocean)
          var last = 0;
          for(var i=0;i<bufferSize;i++){
            var w=Math.random()*2-1;
            last=(last+0.02*w)/1.02;
            data[i]=last*3.5;
            if(data[i]>1)data[i]=1;
            if(data[i]<-1)data[i]=-1;
          }
        }
        noise.buffer = buffer;
        noise.loop = true;

        // LP filter
        var filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = ambienceType === 'white' ? 600 : ambienceType === 'pink' ? 1200 : 400;

        noiseGain = c.createGain();
        noiseGain.gain.value = vol * 0.3;

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(c.destination);
        noise.start();
      }

      playing = true;
    } catch(e) { console.warn('[MentalAudio]', e.message); }
  }

  function setVol(pct) {
    var vol = pct / 100;
    if(binauralGain) binauralGain.gain.value = vol * 0.35;
    if(noiseGain) noiseGain.gain.value = vol * 0.3;
  }

  return { start: start, stop: stop, setVol: setVol, isPlaying: function() { return playing; } };
})();

// ── PRESETS BY SESSION TYPE ──────────────────────────────────────
var PRESETS = {
  calm:       { beatHz:8,  carrier:190, ambience:'pink',  ytId:'n4YghVcjbpw', label:'Calm & Clear',        desc:'Alpha 8Hz — stress relief, relaxed awareness' },
  focus:      { beatHz:18, carrier:220, ambience:'white', ytId:'Z8ANihFXlgU', label:'Deep Focus',           desc:'Beta 18Hz — sharp concentration' },
  meditation: { beatHz:6,  carrier:180, ambience:'brown', ytId:'MTg-gZy9oLM', label:'Deep Meditation',      desc:'Theta 6Hz — flow state, creativity' },
  activation: { beatHz:12, carrier:200, ambience:'pink',  ytId:'n4YghVcjbpw', label:'Pre-Match Activation', desc:'Alpha 12Hz — calm alertness, confidence' },
  pressure:   { beatHz:25, carrier:230, ambience:'none',  ytId:'Z8ANihFXlgU', label:'Pressure Training',    desc:'Beta 25Hz — heightened response, pressure simulation' },
  recovery:   { beatHz:2,  carrier:160, ambience:'brown', ytId:'Z2dK_m2LfrY', label:'Recovery & Rest',      desc:'Delta 2Hz — deep nervous system recovery' },
  peak:       { beatHz:40, carrier:200, ambience:'white', ytId:'n4YghVcjbpw', label:'Peak Performance',     desc:'Gamma 40Hz — elite cognition, peak state' },
  confidence: { beatHz:10, carrier:210, ambience:'pink',  ytId:'MTg-gZy9oLM', label:'Confidence Builder',   desc:'Alpha 10Hz — positive self-belief' },
};

function getPreset(sessionName, minutes) {
  var name = (sessionName||'').toLowerCase();
  if(name.includes('sleep') || name.includes('recovery') || name.includes('rest')) return 'recovery';
  if(name.includes('activation') || name.includes('game day') || name.includes('pre-match') || name.includes('pre-game') || name.includes('morning of')) return 'activation';
  if(name.includes('pressure') || name.includes('choke') || name.includes('crucial') || name.includes('high stakes')) return 'pressure';
  if(name.includes('peak') || name.includes('flow') || name.includes('zone') || name.includes('champion') || name.includes('elite')) return 'peak';
  if(name.includes('focus') || name.includes('concentration') || name.includes('lock')) return 'focus';
  if(name.includes('confidence') || name.includes('belief') || name.includes('self')) return 'confidence';
  if(name.includes('meditation') || name.includes('visualiz') || name.includes('imagery') || name.includes('deep')) return 'meditation';
  if(minutes >= 10) return 'meditation';
  if(minutes >= 7) return 'focus';
  return 'calm';
}

// ── AUDIO PLAYER COMPONENT ───────────────────────────────────────
function SessionAudioPlayer({ sessionName, minutes }) {
  var presetKey = getPreset(sessionName, minutes);
  var preset = PRESETS[presetKey];
  var [playing, setPlaying] = useState(false);
  var [vol, setVol] = useState(65);
  var [showYT, setShowYT] = useState(false);
  var [showInfo, setShowInfo] = useState(false);

  useEffect(function() { return function() { AudioEngine.stop(); }; }, []);

  function toggle() {
    if(playing) { AudioEngine.stop(); setPlaying(false); }
    else { AudioEngine.start(preset.beatHz, preset.carrier, preset.ambience, vol); setPlaying(true); }
  }
  function handleVol(e) { var v = parseInt(e.target.value); setVol(v); AudioEngine.setVol(v); }

  var ambLabel = { pink:'Rain',brown:'Forest',white:'White noise',none:'Pure binaural' };
  var ambienceEmoji = { pink:'🌧',brown:'🌲',white:'☁️',none:'🎵' };

  return h('div', { style: { borderRadius: 14, overflow: 'hidden', marginBottom: 16, border: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.04)' }},
    h('style', null,
      '@keyframes sc-bar{0%,100%{transform:scaleY(0.5)}50%{transform:scaleY(1.4)}}'
    ),
    // Main audio controls
    h('div', { style: { padding: '14px 16px' }},
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }},
        h('button', {
          onClick: toggle,
          style: {
            width: 44, height: 44, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0,
            background: playing ? 'linear-gradient(135deg,#8b5cf6,#6366f1)' : 'rgba(139,92,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            boxShadow: playing ? '0 4px 14px rgba(139,92,246,0.4)' : 'none', fontFamily: 'inherit',
          }
        }, playing ? '⏸' : '▶'),
        h('div', { style: { flex: 1 }},
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }},
            h('span', { style: { fontSize: 12, fontWeight: 800, color: '#a78bfa' }}, '🎵 ' + preset.label),
            h('span', { style: { fontSize: 10, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '1px 6px', borderRadius: 4, border: '1px solid rgba(139,92,246,0.2)' }},
              ambienceEmoji[preset.ambience] + ' ' + ambLabel[preset.ambience]
            )
          ),
          playing
            ? h('div', { style: { display: 'flex', gap: 2, alignItems: 'center', height: 14 }},
                Array.from({length: 14}, function(_,i) {
                  return h('div', { key: i, style: {
                    width: 2.5, background: '#8b5cf6', borderRadius: 2,
                    animation: 'sc-bar 1s ease-in-out infinite',
                    animationDelay: (i * 0.07) + 's',
                    height: (5 + Math.sin(i*0.9)*4) + 'px', opacity: 0.8,
                    transformOrigin: 'bottom',
                  }});
                })
              )
            : h('div', { style: { fontSize: 11, color: '#6b7280' }}, preset.desc)
        ),
        h('button', {
          onClick: function() { setShowInfo(!showInfo); },
          style: { background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16, padding: '4px', fontFamily: 'inherit' }
        }, 'ℹ')
      ),
      // Volume
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 }},
        h('span', { style: { fontSize: 14, flexShrink: 0 }}, vol < 30 ? '🔈' : vol < 70 ? '🔉' : '🔊'),
        h('input', {
          type: 'range', min: 0, max: 100, value: vol, onChange: handleVol,
          style: { flex: 1, accentColor: '#8b5cf6', cursor: 'pointer' }
        }),
        h('span', { style: { fontSize: 11, color: '#6b7280', minWidth: 30, textAlign: 'right', fontWeight: 600 }}, vol + '%')
      )
    ),
    // Info panel
    showInfo && h('div', { style: { padding: '12px 16px', borderTop: '1px solid rgba(139,92,246,0.15)', background: 'rgba(139,92,246,0.06)' }},
      h('div', { style: { fontSize: 11, color: '#a78bfa', fontWeight: 700, marginBottom: 6 }}, '🧠 How binaural beats work'),
      h('div', { style: { fontSize: 11, color: '#9ca3af', lineHeight: 1.7, marginBottom: 8 }},
        'Left ear hears ' + preset.carrier + 'Hz. Right ear hears ' + (preset.carrier + preset.beatHz) + 'Hz. Your brain perceives the ' + preset.beatHz + 'Hz difference, entraining to that frequency. ', preset.desc + '.'
      ),
      h('div', { style: { fontSize: 10, color: '#6b7280', fontStyle: 'italic' }}, '⚠ Requires headphones for full binaural effect. Ambient layer works on speakers.')
    ),
    // YouTube soundtrack divider
    h('div', { style: { borderTop: '1px solid rgba(48,54,61,0.5)' }},
      !showYT
        ? h('button', {
            onClick: function() { setShowYT(true); },
            style: {
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', background: 'transparent', border: 'none',
              cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }
          },
            h('div', { style: { width: 28, height: 20, borderRadius: 4, background: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }},
              h('div', { style: { width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '9px solid #fff', marginLeft: 1 }})
            ),
            h('span', { style: { fontSize: 12, fontWeight: 600, color: '#9ca3af' }}, 'Or watch curated YouTube soundtrack →')
          )
        : h('div', null,
            h('div', { style: { position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }},
              h('iframe', {
                src: 'https://www.youtube.com/embed/' + preset.ytId + '?autoplay=0&rel=0&modestbranding=1',
                style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
                allowFullScreen: true, title: preset.label + ' meditation music',
              })
            ),
            h('button', {
              onClick: function() { setShowYT(false); },
              style: { width: '100%', padding: '8px', background: 'rgba(17,17,17,0.9)', border: 'none', color: '#6b7280', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }
            }, '▲ Close video')
          )
    )
  );
}

// Attach to global so MentalPage can use it
A.SessionAudioPlayer = SessionAudioPlayer;
A.AudioEngine = AudioEngine;
A.MentalPresets = PRESETS;
A.getMentalPreset = getPreset;

console.log('[SC] app-mental-audio v2.0 — Web Audio API binaural + YT soundtrack ready');
})();
