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

// ── TONE.JS SOUNDSCAPE ENGINE ────────────────────────────────────
// Generates rich ambient soundscapes using the globally-loaded Tone.js
var ToneEngine = (function() {
  var parts = [];
  var master = null;
  var running = false;
  var currentType = null;

  // Soundscape definitions — one per mental session type
  var SOUNDSCAPES = {
    // BREATH / calm: Ocean Air — gentle sine pads, slow LFO
    breath: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      var rev = new Tone.Reverb({ decay: 8, wet: 0.65 }).toDestination();
      var synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 3, decay: 1, sustain: 0.9, release: 6 },
        volume: -22,
      }).connect(rev);
      synth.triggerAttack(['C3', 'G3', 'E4'], Tone.now());
      var lfo = new Tone.LFO({ frequency: 0.05, min: -28, max: -18 }).start();
      lfo.connect(synth.volume);
      parts.push({ dispose: function() { try { lfo.stop(); lfo.dispose(); synth.releaseAll(); synth.dispose(); rev.dispose(); } catch(e){} } });
    },
    // GROUND / grounding: Earth Anchor — bass drone, slow filter sweep
    ground: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      var rev = new Tone.Reverb({ decay: 10, wet: 0.55 }).toDestination();
      var synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 4, decay: 0, sustain: 1, release: 8 },
        volume: -20,
      }).connect(rev);
      synth.triggerAttack('D2', Tone.now());
      var filter = new Tone.AutoFilter({ frequency: 0.03, baseFrequency: 120, octaves: 2, wet: 0.7 }).toDestination().start();
      var synth2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 6, decay: 0, sustain: 1, release: 8 },
        volume: -26,
      }).connect(filter);
      synth2.triggerAttack('A2', Tone.now() + 2);
      parts.push({ dispose: function() { try { synth.triggerRelease(); synth.dispose(); synth2.triggerRelease(); synth2.dispose(); filter.dispose(); rev.dispose(); } catch(e){} } });
    },
    // VISUALIZE: Champion Cinema — rising orchestral strings simulation
    visualize: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      var rev = new Tone.Reverb({ decay: 7, wet: 0.7 }).toDestination();
      var vol = new Tone.Volume(-18).connect(rev);
      var synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth', partialCount: 3 },
        envelope: { attack: 3, decay: 1, sustain: 0.85, release: 7 },
      }).connect(vol);
      var chords = [['A3','C#4','E4'], ['C4','E4','G4'], ['D4','F#4','A4'], ['G3','B3','D4']];
      var idx = 0;
      synth.triggerAttack(chords[0], Tone.now());
      var seq = new Tone.Sequence(function(time) {
        synth.releaseAll(time);
        idx = (idx + 1) % chords.length;
        synth.triggerAttack(chords[idx], time + 0.5);
      }, [null], '4m');
      seq.start(0);
      Tone.getTransport().bpm.value = 70;
      Tone.getTransport().start();
      parts.push({ dispose: function() { try { seq.stop(); seq.dispose(); synth.releaseAll(); synth.dispose(); vol.dispose(); rev.dispose(); Tone.getTransport().stop(); } catch(e){} } });
    },
    // ACTIVATE: Game Day — rhythmic energy, rising A major
    activate: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      var rev = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
      Tone.getTransport().bpm.value = 116;
      var kick = new Tone.MembraneSynth({ volume: -10 }).connect(rev);
      var kickSeq = new Tone.Sequence(function(time) { kick.triggerAttackRelease('C1', '8n', time); }, ['0','2'], '1m');
      var padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square', partialCount: 2 },
        envelope: { attack: 0.2, decay: 0.3, sustain: 0.6, release: 1.5 },
        volume: -24,
      }).connect(rev);
      padSynth.triggerAttack(['A3','E4','C#5'], Tone.now() + 1);
      kickSeq.start(0);
      Tone.getTransport().start();
      parts.push({ dispose: function() { try { kickSeq.stop(); kickSeq.dispose(); kick.dispose(); padSynth.releaseAll(); padSynth.dispose(); rev.dispose(); Tone.getTransport().stop(); } catch(e){} } });
    },
    // RECOVER: Deep Rest — sparse piano, delta ambience
    recover: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      var rev = new Tone.Reverb({ decay: 12, wet: 0.8 }).toDestination();
      var synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 2, decay: 4, sustain: 0.2, release: 10 },
        volume: -24,
      }).connect(rev);
      var notes = ['G3','E3','C3','D3','B2'];
      var noteIdx = 0;
      var playNote = function() {
        synth.triggerAttackRelease(notes[noteIdx % notes.length], '4n');
        noteIdx++;
      };
      playNote();
      var interval = Tone.getTransport().scheduleRepeat(function() { playNote(); }, '6s');
      Tone.getTransport().bpm.value = 40;
      Tone.getTransport().start();
      parts.push({ dispose: function() { try { Tone.getTransport().clear(interval); synth.dispose(); rev.dispose(); Tone.getTransport().stop(); } catch(e){} } });
    },
    // REFLECT: Still Water — sparse plucked strings, G-Em-C-D progression
    reflect: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      var rev = new Tone.Reverb({ decay: 6, wet: 0.6 }).toDestination();
      var pluck = new Tone.PluckSynth({ attackNoise: 1, dampening: 4000, resonance: 0.97, volume: -18 }).connect(rev);
      var melody = ['G4','B4','D5','E4','G4','B4','C5','E5','G4','D5'];
      var mIdx = 0;
      Tone.getTransport().bpm.value = 62;
      var seq = new Tone.Sequence(function(time) {
        pluck.triggerAttack(melody[mIdx % melody.length], time);
        mIdx++;
      }, [null], '2n');
      seq.start(0);
      Tone.getTransport().start();
      parts.push({ dispose: function() { try { seq.stop(); seq.dispose(); pluck.dispose(); rev.dispose(); Tone.getTransport().stop(); } catch(e){} } });
    },
    // PRESSURE: Into the Fire — heartbeat, then calm transition
    pressure: function() {
      if (typeof Tone === 'undefined') return;
      Tone.start();
      Tone.getTransport().bpm.value = 80;
      var kick = new Tone.MembraneSynth({ volume: -8, envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.3 } }).toDestination();
      var kickSeq = new Tone.Sequence(function(time) { kick.triggerAttackRelease('C1', '8n', time); }, ['0', '0.5'], '1m');
      kickSeq.start(0);
      // After 20s fade kick out and bring in calm pad
      var calmRev = new Tone.Reverb({ decay: 8, wet: 0.7 }).toDestination();
      var calmPad = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 5, decay: 0, sustain: 1, release: 8 },
        volume: -30,
      }).connect(calmRev);
      var transitionId = Tone.getTransport().scheduleOnce(function(time) {
        kickSeq.stop(time);
        kick.volume.rampTo(-60, 3, time);
        calmPad.triggerAttack(['C3', 'G3', 'E4'], time + 3);
        calmPad.volume.rampTo(-18, 5, time + 3);
      }, '20s');
      Tone.getTransport().start();
      parts.push({ dispose: function() { try { kickSeq.stop(); kickSeq.dispose(); kick.dispose(); calmPad.releaseAll(); calmPad.dispose(); calmRev.dispose(); Tone.getTransport().stop(); } catch(e){} } });
    },
  };

  // Map session name/category to soundscape type
  function getSoundscapeType(sessionName, sessionCategory) {
    var name = (sessionName || '').toLowerCase();
    var cat  = (sessionCategory || '').toLowerCase();
    if (name.includes('sleep') || name.includes('recovery') || name.includes('rest') || cat === 'recovery') return 'recover';
    if (name.includes('activation') || name.includes('game day') || name.includes('morning') || name.includes('fuel') || name.includes('fire') || cat === 'activation' || cat === 'pre-performance') return 'activate';
    if (name.includes('pressure') || name.includes('choke') || name.includes('crucible') || cat === 'pressure' || cat === 'pro-mental') return 'pressure';
    if (name.includes('visualiz') || name.includes('imagery') || name.includes('champion') || name.includes('peak') || cat === 'visualization') return 'visualize';
    if (name.includes('reflect') || name.includes('journal') || name.includes('accountab') || cat === 'reflection') return 'reflect';
    if (name.includes('ground') || name.includes('focus') || name.includes('concentrat') || cat === 'focus' || cat === 'grounding') return 'ground';
    return 'breath'; // Default: calm breathing soundscape
  }

  function play(sessionName, sessionCategory, volume) {
    stop();
    var type = getSoundscapeType(sessionName, sessionCategory);
    currentType = type;
    try {
      var fn = SOUNDSCAPES[type];
      if (fn) fn();
      // Set master volume
      if (typeof Tone !== 'undefined') {
        Tone.getDestination().volume.value = -20 + ((volume || 65) / 100) * 14;
      }
      running = true;
    } catch(e) {
      console.warn('[ToneEngine] Soundscape failed:', e);
    }
  }

  function stop() {
    try {
      if (typeof Tone !== 'undefined') {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
      }
    } catch(e) {}
    parts.forEach(function(p) { try { p.dispose(); } catch(e) {} });
    parts = [];
    running = false;
    currentType = null;
  }

  function setVol(pct) {
    if (typeof Tone !== 'undefined') {
      try { Tone.getDestination().volume.value = -20 + (pct / 100) * 14; } catch(e) {}
    }
  }

  return { play: play, stop: stop, setVol: setVol, isPlaying: function() { return running; }, getCurrentType: function() { return currentType; } };
})();

// ── WEB SPEECH ENGINE ────────────────────────────────────────────
var SpeechEngine = (function() {
  var synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  var voice = null;
  var enabled = true;

  function loadVoices() {
    if (!synth) return;
    var voices = synth.getVoices();
    voice = voices.find(function(v) { return v.lang.includes('en') && v.name.includes('Google'); }) ||
            voices.find(function(v) { return v.lang.includes('en'); }) ||
            voices[0];
  }

  if (synth) {
    if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
    loadVoices();
  }

  function speak(text, rate) {
    if (!synth || !enabled || !text) return;
    try {
      synth.cancel();
      var utter = new SpeechSynthesisUtterance(text);
      if (voice) utter.voice = voice;
      utter.rate = rate || 0.9;
      utter.pitch = 1.0;
      utter.volume = 1.0;
      synth.speak(utter);
    } catch(e) { console.warn('[SpeechEngine]', e); }
  }

  function stop() { if (synth) synth.cancel(); }
  function setEnabled(val) { enabled = !!val; }
  function isEnabled() { return enabled; }

  return { speak: speak, stop: stop, setEnabled: setEnabled, isEnabled: isEnabled };
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
    if(playing) {
      AudioEngine.stop();
      ToneEngine.stop();
      setPlaying(false);
    } else {
      AudioEngine.start(preset.beatHz, preset.carrier, preset.ambience, vol);
      ToneEngine.play(sessionName, '', vol);
      setPlaying(true);
    }
  }
  function handleVol(e) {
    var v = parseInt(e.target.value);
    setVol(v);
    AudioEngine.setVol(v);
    ToneEngine.setVol(v);
  }

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
A.ToneEngine = ToneEngine;
A.SpeechEngine = SpeechEngine;
A.MentalPresets = PRESETS;
A.getMentalPreset = getPreset;

console.log('[SC] app-mental-audio v2.0 — Web Audio API binaural + YT soundtrack ready');
})();
