// app-mental-audio.js
// ================================================================
// SmartCrick — Mental Audio v3.0
// Replaces ToneJS soundscapes with:
//   1. MentalYouTube  — hidden auto-playing YouTube soundtrack
//   2. MentalTTS      — Web Speech API voice guide (warm, sentence-chunked)
//   3. AudioEngine    — Web Audio API binaural beats (unchanged)
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
// Curated long-form ambient/focus videos matched to each mental session type.
// Videos are 1–8 hours, start at a random offset so every session feels fresh.
var SESSION_TYPE_TRACKS = {
  BREATH:    'n4YghVcjbpw',  // Alpha 8Hz calm — breathing & relaxation
  GROUND:    'MTg-gZy9oLM',  // Theta 6Hz deep — grounding & presence
  VISUALIZE: 'MTg-gZy9oLM',  // Theta cinematic — mental imagery & flow
  ACTIVATE:  'n4YghVcjbpw',  // Alpha energised — pre-match activation
  RECOVER:   'Z2dK_m2LfrY',  // Delta 2Hz rest — deep nervous system recovery
  REFLECT:   'n4YghVcjbpw',  // Calm ambient — journaling & reflection
  PRESSURE:  'Z8ANihFXlgU',  // Beta 18Hz focus — pressure simulation
};

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
    // Random start offset (0-120s) so each session feels unique
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
    playSession: function(type)       { play(SESSION_TYPE_TRACKS[type]      || SESSION_TYPE_TRACKS.GROUND); },
    playCreator: function(focusArea)  { play(CREATOR_FOCUS_TRACKS[focusArea] || CREATOR_FOCUS_TRACKS.focus); },
  };
})();

// ── MentalTTS — warm voice guide via Web Speech API ───────────────
// Uses sentence-level chunking (≤180 chars each) to stay well under
// any browser's utterance limits and avoid the Chrome 15s pause bug.
// Ducks the YouTube volume while speaking, restores it after.
var MentalTTS = (function() {
  var synth = window.speechSynthesis;
  var _queue     = [];
  var _speaking  = false;
  var _stopped   = true;
  var _voice     = null;

  // Split text into bite-sized sentences the browser can handle cleanly
  function splitToChunks(text) {
    if (!text) return [];
    var clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
    // Split at sentence endings followed by space/newline, or at newlines
    var sentences = clean.split(/(?<=[.!?])\s+|\n+/)
      .map(function(s) { return s.trim(); })
      .filter(Boolean);
    var chunks = [];
    sentences.forEach(function(s) {
      if (s.length <= 180) {
        chunks.push(s);
      } else {
        // Break long sentences at commas, fitting within 160 chars
        var parts = s.match(/.{1,160}(?:[,\s]|$)/g) || [s];
        parts.forEach(function(p) { if (p.trim()) chunks.push(p.trim()); });
      }
    });
    return chunks;
  }

  // Priority order of warm, natural-sounding English voices
  var WARM_VOICES = [
    'Google UK English Female',  // Android Chrome — warm & clear
    'Samantha',                  // macOS / iOS — natural
    'Karen',                     // macOS / iOS AU — soft
    'Victoria',                  // macOS — calm
    'Moira',                     // macOS IE — gentle
    'Daniel',                    // macOS UK male — deep, calm
    'Google US English',         // Chrome desktop fallback
  ];

  function selectVoice() {
    if (_voice) return _voice;
    if (!synth) return null;
    var voices = synth.getVoices();
    for (var i = 0; i < WARM_VOICES.length; i++) {
      var found = voices.find(function(v) { return v.name === WARM_VOICES[i]; });
      if (found) { _voice = found; return found; }
    }
    _voice = voices.find(function(v) { return v.lang === 'en-GB'; })
           || voices.find(function(v) { return v.lang.startsWith('en'); })
           || voices[0] || null;
    return _voice;
  }

  // Pre-load voices on first chance (async in some browsers)
  if (synth) {
    synth.getVoices();
    if (typeof synth.onvoiceschanged !== 'undefined') {
      synth.onvoiceschanged = function() { _voice = null; selectVoice(); };
    }
  }

  function _duckYT() {
    var YT = window.SC_APP && window.SC_APP.MentalYouTube;
    if (YT) YT.setVolume(26);
  }

  function _restoreYT() {
    var YT = window.SC_APP && window.SC_APP.MentalYouTube;
    if (YT) YT.setVolume(65);
  }

  function _nextChunk() {
    if (_stopped || !_queue.length || !synth) {
      _speaking = false;
      if (!_queue.length) _restoreYT();
      return;
    }
    _speaking = true;
    var chunk = _queue.shift();
    var u = new SpeechSynthesisUtterance(chunk);
    u.voice  = selectVoice();
    u.rate   = 0.82;   // meditative pace
    u.pitch  = 0.93;   // slightly lower = warmth
    u.volume = 0.95;
    u.lang   = (u.voice && u.voice.lang) || 'en-GB';
    u.onend  = function() {
      if (_stopped) return;
      // Natural inter-sentence pause
      setTimeout(_nextChunk, _queue.length ? 620 : 0);
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
    // If voices not yet loaded, wait for them before starting
    if (synth.getVoices().length === 0 && typeof synth.onvoiceschanged !== 'undefined') {
      var prev = synth.onvoiceschanged;
      synth.onvoiceschanged = function() {
        synth.onvoiceschanged = prev;
        _voice = null;
        _nextChunk();
      };
    } else {
      _nextChunk();
    }
  }

  function stop() {
    _stopped = true;
    _speaking = false;
    _queue = [];
    if (synth) { try { synth.cancel(); } catch(e) {} }
    _restoreYT();
  }

  function pause()  { if (synth && synth.speaking) { try { synth.pause();  } catch(e) {} } }
  function resume() {
    if (synth && synth.paused)  { try { synth.resume(); } catch(e) {} }
    else if (!_speaking && _queue.length) { _stopped = false; _nextChunk(); }
  }

  return { speak: speak, stop: stop, pause: pause, resume: resume };
})();

// ── Export ─────────────────────────────────────────────────────────
Object.assign(window.SC_APP || (window.SC_APP = {}), {
  AudioEngine:    AudioEngine,
  MentalYouTube:  MentalYouTube,
  MentalTTS:      MentalTTS,
});

console.log('[SC] app-mental-audio v3.0 — YouTube soundtrack + TTS voice guide ready');
})();
