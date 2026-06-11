// app-mental-audio.js
// ================================================================
// SmartCrick — Mental Audio v3.1
// Changes from v3.0:
//   - Voice: slower rate (0.76), deeper pitch (0.88), full volume
//   - Enhanced/Neural voices prioritised (macOS Ava, Edge Aria/Jenny)
//   - 1.5s warm-up pause before first utterance (YT settles first)
//   - 950ms inter-sentence breath pause (more contemplative)
//   - Graceful YT fade-back after TTS ends (300ms ramp)
// ================================================================
(function() {
'use strict';
var A = window.SC_APP;

// ── AudioEngine (binaural beats — no Tone.js dependency) ─────────
var AudioEngine = (function() {
  var ctx = null, leftOsc = null, rightOsc = null;
  var noise = null, noiseGain = null, binauralGain = null;
  var playing = false;

  function getCtx() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function stop() {
    try {
      if (leftOsc)    { leftOsc.stop();  leftOsc.disconnect();  leftOsc = null; }
      if (rightOsc)   { rightOsc.stop(); rightOsc.disconnect(); rightOsc = null; }
      if (noise)      { noise.stop();    noise.disconnect();    noise = null; }
      if (noiseGain)  { noiseGain.disconnect();   noiseGain = null; }
      if (binauralGain) { binauralGain.disconnect(); binauralGain = null; }
    } catch(e) {}
    playing = false;
  }

  function start(beatHz, carrierHz, ambienceType, volPct) {
    stop();
    var c = getCtx();
    if (!c) return;
    var vol = (volPct || 70) / 100;
    try {
      var merger = c.createChannelMerger(2);
      merger.connect(c.destination);
      binauralGain = c.createGain();
      binauralGain.gain.value = vol * 0.35;

      leftOsc = c.createOscillator();
      leftOsc.type = 'sine';
      leftOsc.frequency.value = carrierHz;
      var leftSplit = c.createGain(); leftSplit.gain.value = 1;
      leftOsc.connect(leftSplit); leftSplit.connect(merger, 0, 0);

      rightOsc = c.createOscillator();
      rightOsc.type = 'sine';
      rightOsc.frequency.value = carrierHz + beatHz;
      var rightSplit = c.createGain(); rightSplit.gain.value = 1;
      rightOsc.connect(rightSplit); rightSplit.connect(merger, 0, 1);

      leftOsc.start(); rightOsc.start();

      if (ambienceType !== 'none') {
        noise = c.createBufferSource();
        var bufferSize = c.sampleRate * 4;
        var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
        var data = buffer.getChannelData(0);
        if (ambienceType === 'white') {
          for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        } else if (ambienceType === 'pink') {
          var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
          for (var i = 0; i < bufferSize; i++) {
            var white = Math.random() * 2 - 1;
            b0=0.99886*b0+white*0.0555179; b1=0.99332*b1+white*0.0750759;
            b2=0.96900*b2+white*0.1538520; b3=0.86650*b3+white*0.3104856;
            b4=0.55000*b4+white*0.5329522; b5=-0.7616*b5-white*0.0168980;
            data[i] = (b0+b1+b2+b3+b4+b5+b6+white*0.5362)*0.11;
            b6 = white*0.115926;
          }
        } else {
          var last = 0;
          for (var i = 0; i < bufferSize; i++) {
            var w = Math.random() * 2 - 1;
            last = (last + 0.02*w) / 1.02;
            data[i] = last * 3.5;
            if (data[i] > 1) data[i] = 1;
            if (data[i] < -1) data[i] = -1;
          }
        }
        noise.buffer = buffer;
        noise.loop = true;
        var filter = c.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = ambienceType === 'white' ? 600 : ambienceType === 'pink' ? 1200 : 400;
        noiseGain = c.createGain();
        noiseGain.gain.value = vol * 0.3;
        noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(c.destination);
        noise.start();
      }
      playing = true;
    } catch(e) { console.warn('[MentalAudio]', e.message); }
  }

  function setVol(pct) {
    var vol = pct / 100;
    if (binauralGain) binauralGain.gain.value = vol * 0.35;
    if (noiseGain)    noiseGain.gain.value    = vol * 0.3;
  }

  return { start: start, stop: stop, setVol: setVol, isPlaying: function() { return playing; } };
})();

// ── YouTube Soundtrack Mapping ─────────────────────────────────────
// Emergency fallback only — used when a session id is missing from
// SESSION_TRACKS below. Kept to the 4 original, known-good ids.
var SESSION_TYPE_TRACKS = {
  BREATH:    'Z2dK_m2LfrY',
  GROUND:    'MTg-gZy9oLM',
  VISUALIZE: 'MTg-gZy9oLM',
  ACTIVATE:  'n4YghVcjbpw',
  RECOVER:   'Z2dK_m2LfrY',
  REFLECT:   'n4YghVcjbpw',
  PRESSURE:  'Z8ANihFXlgU',
};

// ── Verified ambient/meditation track pool ─────────────────────────
// Each id is a real, long-running ambient/meditation YouTube video
// suitable for quiet looping background. Moods cover the full range
// needed across all 8 mental-training categories.
var TRACK_MOODS = {
  'Z2dK_m2LfrY': 'Rainstorm calm',          // gentle rain loop
  'n4YghVcjbpw': 'Epic orchestral',          // cinematic activation
  'MTg-gZy9oLM': 'Cinematic ambient',        // visualization underscore
  'Z8ANihFXlgU': 'Binaural focus',           // pressure / deep focus tone
  '1ZYbU82GVz4': 'Deep sleep drone',         // slow night drone
  'eKFTSSKCzWA': 'Fireplace crackling',      // warm fire ambience
  'mPZkdNFkNps': 'Ocean waves',              // water / shoreline
  'aXLB6dlbS24': 'Forest birdsong',          // nature / woodland
  '7maJOI3QMu0': 'Tibetan singing bowls',    // bowls / resonance
  'WZKW2Hq2fks': 'Soft piano ambient',       // reflective piano
  '2OEL4P1Rz04': 'Lo-fi calm beats',         // lo-fi study calm
  'jfKfPfyJRdk':  'Lo-fi focus radio',       // lo-fi steady focus
  'nDq6TstdEi8': 'White noise',              // pure white noise
  'qFZQ1pUaCwo': 'Pink noise',               // softer broadband noise
  '1oRrEenOaPQ': 'Wind ambience',            // open wind / highlands
  'DWcJFNfaw9c': 'Night sleep ambience',     // crickets / night calm
  'M9b0OBgKtdY': 'Emotional reflective score',// orchestral reflection
  '5qap5aO4i9A': 'Lo-fi chillhop',           // alternate lo-fi
  'lE6RYpe9IT0': 'Deep binaural drone',      // low binaural pad
  'WZ-19LMyFB4': 'Soothing string ambience', // gentle strings
  'kgx4WGK0oNU': 'Epic calm build',          // building orchestral calm
  'Sx4otCcQTJg': 'Crackling campfire night', // fire + night crickets
  'qN7C_pjrEKE': 'Stream water flow',        // running water / brook
  'eg9V5g4xLkY': 'Tibetan bowl meditation',  // alternate bowls
  '8plwv25NYRo': 'Calm cinematic pads',      // soft cinematic pads
};

// ── Per-session track map — sessionId -> verified track id ─────────
// Assignment reflects each session's specific title/theme, not just
// its category, so sessions sharing a category get varied ambience.
var SESSION_TRACKS = {
  // Focus
  m01: 'Z8ANihFXlgU',  // Micro Focus Burst — binaural focus
  m02: 'jfKfPfyJRdk',  // Focus Next Ball — lo-fi focus radio
  m03: 'aXLB6dlbS24',  // 5-4-3-2-1 Grounding — forest grounding
  m04: '2OEL4P1Rz04',  // Task Isolation Protocol — lo-fi calm
  m05: 'Z8ANihFXlgU',  // Laser Focus Activation — binaural focus
  m06: 'lE6RYpe9IT0',  // Deep Focus Anchor — deep binaural drone
  m07: '1oRrEenOaPQ',  // Sensory Narrowing — wind ambience
  m08: 'jfKfPfyJRdk',  // Process Over Result — lo-fi focus
  m09: 'nDq6TstdEi8',  // Noise Cancellation Focus — white noise
  m10: 'Z8ANihFXlgU',  // Single-Point Focus Drill — binaural focus
  m11: 'kgx4WGK0oNU',  // Flow State Trigger — epic calm build
  m12: 'qN7C_pjrEKE',  // Trusting Instinct — stream water flow
  // Confidence
  m20: 'MTg-gZy9oLM',  // Morning Positivity Charge — cinematic ambient
  m21: 'kgx4WGK0oNU',  // Confidence Countdown — epic calm build
  m22: 'WZKW2Hq2fks',  // Celebrate Small Wins — soft piano
  m23: 'M9b0OBgKtdY',  // Self-Talk Rewrite — reflective score
  m24: '8plwv25NYRo',  // Name Your Strength — calm cinematic pads
  m25: 'MTg-gZy9oLM',  // Affirmation Immersion — cinematic ambient
  m26: 'n4YghVcjbpw',  // Own the Room — epic orchestral
  m27: 'kgx4WGK0oNU',  // Inner Champion — epic calm build
  m28: 'n4YghVcjbpw',  // Champion Mindset Simulation — epic orchestral
  m29: 'MTg-gZy9oLM',  // Identity Goal Setting — cinematic ambient
  // Recovery
  m30: 'Z2dK_m2LfrY',  // Reset Button — rainstorm calm
  m31: 'WZKW2Hq2fks',  // Self-Compassion Break — soft piano
  m32: 'M9b0OBgKtdY',  // Reset After Duck — emotional reflective score
  m33: 'qN7C_pjrEKE',  // Bounce-Back Faster — stream water flow
  m34: 'Z2dK_m2LfrY',  // Breathing Through Collapse — rainstorm calm
  m35: '1oRrEenOaPQ',  // Let It Go Protocol — wind ambience
  m36: 'WZ-19LMyFB4',  // Failure as Feedback — soothing strings
  m37: 'M9b0OBgKtdY',  // Processing Disappointment — reflective score
  m38: 'Z2dK_m2LfrY',  // Post-Game Emotional Release — rainstorm calm
  m39: 'WZ-19LMyFB4',  // Champions Setback — soothing strings
  m40: 'mPZkdNFkNps',  // Full Body Relaxation — ocean waves
  m41: 'DWcJFNfaw9c',  // Sleep Better Tonight — night sleep ambience
  // Pre-Performance
  m50: 'n4YghVcjbpw',  // Pre-Game Activation — epic orchestral
  m51: 'Z8ANihFXlgU',  // Nervous Energy Converter — binaural focus
  m52: 'Z2dK_m2LfrY',  // Pre-Performance Calm — rainstorm calm
  m53: 'kgx4WGK0oNU',  // Anchoring Peak State — epic calm build
  m54: 'n4YghVcjbpw',  // Game Day Activation — epic orchestral
  m55: 'n4YghVcjbpw',  // Embrace the Arena — epic orchestral
  m56: '1ZYbU82GVz4',  // Morning of Big Day — deep sleep drone (calm wake)
  m57: 'MTg-gZy9oLM',  // Champions Routine — cinematic ambient
  m58: 'kgx4WGK0oNU',  // Pre-Tournament Mind Lock — epic calm build
  // Pressure
  m60: 'Z8ANihFXlgU',  // 10-Second Rule — binaural focus
  m61: 'lE6RYpe9IT0',  // Physiological Sigh — deep binaural drone
  m62: '1oRrEenOaPQ',  // Strategic Pause — wind ambience
  m63: 'Z8ANihFXlgU',  // Pressure Is Privilege — binaural focus
  m64: 'Z8ANihFXlgU',  // Handling the Unplayable Ball — binaural focus
  m65: 'lE6RYpe9IT0',  // Bowling Under Pressure — deep binaural drone
  m66: 'qN7C_pjrEKE',  // Decision Clarity Under Pressure — stream water
  m67: 'Z8ANihFXlgU',  // Choke-Proof Preparation — binaural focus
  m68: 'n4YghVcjbpw',  // Mental Toughness Builder — epic orchestral
  // Visualization
  m70: 'MTg-gZy9oLM',  // Batting Visualization Session — cinematic ambient
  m71: 'kgx4WGK0oNU',  // Future-Pacing Success — epic calm build
  m72: 'aXLB6dlbS24',  // Fielding Brilliance Rehearsal — forest birdsong
  m73: 'MTg-gZy9oLM',  // Master Skill Replay — cinematic ambient
  m74: '8plwv25NYRo',  // Vision Board Visualization — calm cinematic pads
  m75: 'n4YghVcjbpw',  // Perfect Performance — epic orchestral
  m76: 'n4YghVcjbpw',  // Champion Visualization — epic orchestral
  m77: 'lE6RYpe9IT0',  // Elite Endurance Mindset — deep binaural drone
  m78: 'MTg-gZy9oLM',  // Flow State Architecture — cinematic ambient
  // Match-Day Calm
  m80: 'Z2dK_m2LfrY',  // 4-7-8 Breath Lock — rainstorm calm
  m81: '1oRrEenOaPQ',  // Deep Calm Breathing — wind ambience
  m82: 'WZKW2Hq2fks',  // Gratitude Before Game — soft piano
  m83: '7maJOI3QMu0',  // Stillness Practice — Tibetan singing bowls
  m84: 'Z2dK_m2LfrY',  // Anxiety Dissolve Protocol — rainstorm calm
  m85: 'nDq6TstdEi8',  // Box Breathing Method — white noise
  m86: 'mPZkdNFkNps',  // Inner Lake — ocean waves
  // Pro-Mental
  m90: 'eg9V5g4xLkY',  // Deliberate Practice Mindset — Tibetan bowl meditation
  m91: 'WZ-19LMyFB4',  // Mastery Over Perfection — soothing strings
  m92: 'lE6RYpe9IT0',  // Elite Competitor Analysis — deep binaural drone
  m93: 'M9b0OBgKtdY',  // Inner Dialogue Mastery — reflective score
  m94: 'kgx4WGK0oNU',  // Zone of Genius Activation — epic calm build
};
A.SESSION_TRACKS = SESSION_TRACKS;

function getTrackMoodForSlug(slug, sessionId) {
  var trackId = (sessionId && SESSION_TRACKS[sessionId]);
  return trackId ? (TRACK_MOODS[trackId] || null) : null;
}
A.getTrackMood = getTrackMoodForSlug;

var CREATOR_FOCUS_TRACKS = {
  match_anxiety:        'n4YghVcjbpw',
  confidence:           'MTg-gZy9oLM',
  pressure:             'Z8ANihFXlgU',
  focus:                'Z8ANihFXlgU',
  recovery:             'Z2dK_m2LfrY',
  visualization:        'MTg-gZy9oLM',
  concentration:        'Z8ANihFXlgU',
  motivation:           'n4YghVcjbpw',
  dealing_with_failure: 'Z2dK_m2LfrY',
  staying_calm:         'n4YghVcjbpw',
  positive_mindset:     'MTg-gZy9oLM',
};

// ── MentalYouTube — hidden autoplay soundtrack ─────────────────────
var MentalYouTube = (function() {
  var player = null;
  var containerId = null;
  var fadeTimer = null;

  function ensureContainer() {
    if (containerId && document.getElementById(containerId)) return containerId;
    var div = document.createElement('div');
    containerId = 'sc-mental-yt-' + Date.now();
    div.id = containerId;
    Object.assign(div.style, {
      position: 'fixed', left: '-500px', top: '-500px',
      width: '320px', height: '180px',
      opacity: '0', pointerEvents: 'none', zIndex: '-1'
    });
    document.body.appendChild(div);
    return containerId;
  }

  function _loadYTApi(cb) {
    if (typeof YT !== 'undefined' && YT.Player) { cb(); return; }
    var prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (prev) prev();
      window.onYouTubeIframeAPIReady = prev;
      setTimeout(cb, 50);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      var tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }

  function play(videoId, vol) {
    if (!videoId) return;
    vol = (vol != null) ? vol : 65;
    clearInterval(fadeTimer);
    var startSec = Math.floor(Math.random() * 120);

    _loadYTApi(function() {
      var cid = ensureContainer();
      if (player && player.loadVideoById) {
        try {
          player.setVolume(vol);
          player.loadVideoById({ videoId: videoId, startSeconds: startSec });
          player.playVideo();
        } catch(e) {}
        return;
      }
      try {
        player = new YT.Player(cid, {
          width: 320, height: 180,
          videoId: videoId,
          playerVars: {
            autoplay: 1, controls: 0, modestbranding: 1,
            rel: 0, loop: 1, playlist: videoId,
            playsinline: 1, start: startSec
          },
          events: {
            onReady: function(e) {
              try { e.target.setVolume(vol); e.target.playVideo(); } catch(ex) {}
            },
            onError: function() {
              console.warn('[SC Mental] YouTube audio unavailable — session continues silently');
            }
          }
        });
      } catch(e) {
        console.warn('[SC Mental] YT player init failed:', e);
      }
    });
  }

  function stop() {
    clearInterval(fadeTimer);
    if (player) { try { player.stopVideo(); } catch(e) {} }
  }

  function fadeOut(durationMs) {
    if (!player || !player.getVolume) { stop(); return; }
    durationMs = durationMs || 5000;
    var steps = 30, step = 0, startVol = 65;
    try { startVol = player.getVolume(); } catch(e) {}
    clearInterval(fadeTimer);
    fadeTimer = setInterval(function() {
      step++;
      try { player.setVolume(Math.max(0, startVol * (1 - step / steps))); } catch(e) {}
      if (step >= steps) { clearInterval(fadeTimer); stop(); }
    }, durationMs / steps);
  }

  function setVolume(vol) {
    if (player) { try { player.setVolume(vol); } catch(e) {} }
  }

  function pause()  { if (player) { try { player.pauseVideo(); } catch(e) {} } }
  function resume() { if (player) { try { player.playVideo();  } catch(e) {} } }

  return {
    play:       play,
    stop:       stop,
    fadeOut:    fadeOut,
    setVolume:  setVolume,
    pause:      pause,
    resume:     resume,
    playSession: function(type, slug, sessionId) {
      var trackId = (sessionId && SESSION_TRACKS[sessionId])
                 || SESSION_TYPE_TRACKS[type]
                 || SESSION_TYPE_TRACKS.GROUND;
      play(trackId);
    },
    playCreator: function(focusArea)  { play(CREATOR_FOCUS_TRACKS[focusArea] || CREATOR_FOCUS_TRACKS.focus); },
  };
})();

// ── MentalTTS — warm voice guide via Web Speech API ───────────────
// Sentence-level chunking to avoid Chrome's 15s utterance bug.
// 1.5s warm-up delay so ambient audio settles before voice starts.
// Ducks YouTube while speaking; graceful 300ms fade-back on finish.
var MentalTTS = (function() {
  var synth = window.speechSynthesis;
  var _queue     = [];
  var _speaking  = false;
  var _stopped   = true;
  var _voice     = null;
  var _warmupTimer = null;

  function splitToChunks(text) {
    if (!text) return [];
    var clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    var sentences = clean.split(/(?<=[.!?…])\s+|\n+/)
      .map(function(s) { return s.trim(); })
      .filter(Boolean);
    var chunks = [];
    sentences.forEach(function(s) {
      // '---' on its own line = breath pause sentinel (2.8s gap)
      if (s === '---') {
        chunks.push(null); // null = pause, handled in _nextChunk
        return;
      }
      if (s.length <= 200) {
        chunks.push(s);
      } else {
        // Prefer comma/semicolon breaks, keeping natural phrasing
        var parts = s.split(/(?<=,|;)\s+/);
        var current = '';
        parts.forEach(function(p) {
          if ((current + ' ' + p).trim().length <= 200) {
            current = (current + ' ' + p).trim();
          } else {
            if (current) chunks.push(current);
            current = p;
          }
        });
        if (current) chunks.push(current);
      }
    });
    return chunks;
  }

  // Priority: most broadly available warm neural voices first (exact-name fast path)
  var WARM_VOICES = [
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Sonia Online (Natural) - English (United Kingdom)',
    'Microsoft Libby Online (Natural) - English (United Kingdom)',
    'Microsoft Clara Online (Natural) - English (Canada)',
    'Microsoft Natasha Online (Natural) - English (Australia)',
    'Google UK English Female',
    'Google US English',
    'Ava (Enhanced)',
    'Samantha (Enhanced)',
    'Kate (Enhanced)',
    'Ava',
    'Samantha',
    'Karen (Enhanced)',
    'Karen',
    'Moira',
    'Tessa',
    'Microsoft Zira Desktop - English (United States)',
  ];

  // Scoring fallback for browsers (esp. Chrome/Linux/Android) where none of the
  // exact WARM_VOICES names exist. Picks the warmest available voice instead of
  // silently falling through to a robotic default. 100% free (Web Speech API).
  var WARM_KEYWORDS  = ['natural','neural','enhanced','premium','online','female','aria','jenny','sonia','libby','clara','samantha','karen','moira','tessa','zira','salli','joanna','kendra','amy','emma'];
  var AVOID_KEYWORDS = ['whisper','organ','zarvox','trinoid','bells','boing','bubbles','cellos','wobble','bad news','bahh','albert','jester','superstar','rocko','grandma','grandpa','eddy','reed','sandy','shelley','flo','novelty','espeak','pico'];
  var PREFERRED_LANGS = ['en-GB','en-AU','en-IE','en-ZA','en-US'];

  function scoreVoice(v) {
    var name = (v.name || '').toLowerCase();
    for (var i = 0; i < AVOID_KEYWORDS.length; i++) {
      if (name.indexOf(AVOID_KEYWORDS[i]) !== -1) return -1000;
    }
    var score = 0;
    for (var j = 0; j < WARM_KEYWORDS.length; j++) {
      if (name.indexOf(WARM_KEYWORDS[j]) !== -1) score += 10;
    }
    var langIdx = PREFERRED_LANGS.indexOf(v.lang);
    if (langIdx !== -1) score += (PREFERRED_LANGS.length - langIdx) * 5;
    else if ((v.lang || '').indexOf('en') === 0) score += 3;
    if (v.localService === false) score += 2; // cloud/neural voices tend to sound warmer
    return score;
  }

  // Per-session-type voice profiles — warmth tuned to emotional register
  var VOICE_PROFILES = {
    BREATH:    { rate: 0.68, pitch: 0.90, pause: 2200 }, // very slow, low, deeply calming
    RECOVER:   { rate: 0.70, pitch: 0.91, pause: 2100 }, // slow and gentle
    REFLECT:   { rate: 0.73, pitch: 0.93, pause: 1900 }, // thoughtful pace
    GROUND:    { rate: 0.74, pitch: 0.95, pause: 1800 }, // grounded, steady
    VISUALIZE: { rate: 0.72, pitch: 0.93, pause: 2000 }, // immersive, flowing
    ACTIVATE:  { rate: 0.82, pitch: 1.00, pause: 1400 }, // purposeful, energised
    PRESSURE:  { rate: 0.80, pitch: 0.98, pause: 1500 }, // matter-of-fact, authoritative
    DEFAULT:   { rate: 0.73, pitch: 0.93, pause: 1800 }, // general warm baseline
  };
  var _sessionType = 'DEFAULT';

  function setSessionType(type) {
    _sessionType = (type && VOICE_PROFILES[type]) ? type : 'DEFAULT';
  }

  function _getProfile() {
    return VOICE_PROFILES[_sessionType] || VOICE_PROFILES.DEFAULT;
  }

  function selectVoice() {
    if (_voice) return _voice;
    if (!synth) return null;
    var voices = synth.getVoices();
    if (!voices.length) return null;

    // Fast path: an exact known-warm voice name is available
    for (var i = 0; i < WARM_VOICES.length; i++) {
      var found = voices.find(function(v) { return v.name === WARM_VOICES[i]; });
      if (found) { _voice = found; return found; }
    }

    // Fallback: score every available voice and pick the warmest non-novelty
    // English voice. Guarantees a calm result even on Chrome/Linux/Android
    // where the named neural voices above don't exist — still 100% free.
    var englishVoices = voices.filter(function(v) { return (v.lang || '').toLowerCase().indexOf('en') === 0; });
    var pool = englishVoices.length ? englishVoices : voices;
    var best = null, bestScore = -Infinity;
    pool.forEach(function(v) {
      var s = scoreVoice(v);
      if (s > bestScore) { bestScore = s; best = v; }
    });
    _voice = best || pool[0] || voices[0] || null;
    return _voice;
  }

  if (synth) {
    synth.getVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') {
      synth.onvoiceschanged = function() { _voice = null; selectVoice(); };
    }
  }

  function _duckYT() {
    var YT = window.SC_APP && window.SC_APP.MentalYouTube;
    if (YT) YT.setVolume(15);
  }

  function _restoreYT() {
    var YT = window.SC_APP && window.SC_APP.MentalYouTube;
    if (!YT) return;
    // 800ms graceful restore so re-entry isn't jarring
    var step = 0, steps = 16, target = 65;
    var t = setInterval(function() {
      step++;
      try { YT.setVolume(Math.round(15 + (target - 15) * (step / steps))); } catch(e) {}
      if (step >= steps) clearInterval(t);
    }, 50);
  }

  function _nextChunk() {
    if (_stopped || !synth) {
      _speaking = false;
      if (!_queue.length) _restoreYT();
      return;
    }
    if (!_queue.length) {
      // Personalized closing line — spoken while still ducked, then restore YT
      try {
        var user = A.DB && A.DB.getUser ? A.DB.getUser() : null;
        var name = (user && user.name) ? user.name : '';
        var closing = name ? 'Well done, ' + name + '. Carry that with you.' : 'Well done. Carry that with you.';
        var cu = new SpeechSynthesisUtterance(closing);
        cu.voice  = selectVoice();
        var _cp = _getProfile();
        cu.rate   = _cp.rate;
        cu.pitch  = _cp.pitch;
        cu.volume = 0.9;
        cu.lang   = (cu.voice && cu.voice.lang) || 'en-GB';
        cu.onend  = function() { _speaking = false; _restoreYT(); };
        cu.onerror = function() { _speaking = false; _restoreYT(); };
        synth.speak(cu);
      } catch(e) {
        _speaking = false;
        _restoreYT();
      }
      return;
    }
    _speaking = true;
    var chunk = _queue.shift();
    // null = breath pause sentinel (---  in script)
    if (chunk === null) {
      setTimeout(_nextChunk, 2800);
      return;
    }
    var prof = _getProfile();
    var u = new SpeechSynthesisUtterance(chunk);
    u.voice  = selectVoice();
    u.rate   = prof.rate;   // per-type pace — warm and unhurried
    u.pitch  = prof.pitch;  // lower pitch = warmer, less robotic
    u.volume = 1.0;
    u.lang   = (u.voice && u.voice.lang) || 'en-GB';
    u.onend  = function() {
      if (_stopped) return;
      setTimeout(_nextChunk, _queue.length ? prof.pause : 0);
    };
    u.onerror = function() { setTimeout(_nextChunk, 100); };
    synth.speak(u);
  }

  function speak(text) {
    if (!synth || !text) return;
    stop();
    _stopped = false;
    _queue = splitToChunks(text);
    if (!_queue.length) return;
    _duckYT();

    function _start() {
      if (_stopped) return;
      if (synth.getVoices().length === 0 && typeof synth.onvoiceschanged !== 'undefined') {
        var prev = synth.onvoiceschanged;
        synth.onvoiceschanged = function() {
          synth.onvoiceschanged = prev;
          _voice = null;
          if (!_stopped) _nextChunk();
        };
      } else {
        _nextChunk();
      }
    }

    // 2.5s warm-up: let ambient audio settle before voice begins
    _warmupTimer = setTimeout(_start, 2500);
  }

  function stop() {
    _stopped = true;
    _speaking = false;
    _queue = [];
    if (_warmupTimer) { clearTimeout(_warmupTimer); _warmupTimer = null; }
    if (synth) { try { synth.cancel(); } catch(e) {} }
    _restoreYT();
  }

  function pause()  { if (synth && synth.speaking) { try { synth.pause();  } catch(e) {} } }
  function resume() {
    if (synth && synth.paused)  { try { synth.resume(); } catch(e) {} }
    else if (!_speaking && _queue.length) { _stopped = false; _nextChunk(); }
  }

  return { speak: speak, stop: stop, pause: pause, resume: resume, setSessionType: setSessionType };
})();

// ── Export ─────────────────────────────────────────────────────────
Object.assign(window.SC_APP || (window.SC_APP = {}), {
  AudioEngine:    AudioEngine,
  MentalYouTube:  MentalYouTube,
  MentalTTS:      MentalTTS,
});

console.log('[SC] app-mental-audio v3.1 — warmer voice, 1.5s warmup, graceful YT fade-back');
})();
