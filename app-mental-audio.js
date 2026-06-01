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
var SESSION_TYPE_TRACKS = {
  BREATH:    'n4YghVcjbpw',
  GROUND:    'MTg-gZy9oLM',
  VISUALIZE: 'MTg-gZy9oLM',
  ACTIVATE:  'n4YghVcjbpw',
  RECOVER:   'Z2dK_m2LfrY',
  REFLECT:   'n4YghVcjbpw',
  PRESSURE:  'Z8ANihFXlgU',
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

  // Priority: Neural/Enhanced voices first, then warm system voices
  var WARM_VOICES = [
    'Ava (Enhanced)',
    'Samantha (Enhanced)',
    'Microsoft Aria Online (Natural) - English (United States)',
    'Microsoft Jenny Online (Natural) - English (United States)',
    'Microsoft Guy Online (Natural) - English (United States)',
    'Microsoft David Desktop - English (United States)',
    'Google UK English Female',
    'Ava',
    'Samantha',
    'Karen (Enhanced)',
    'Karen',
    'Victoria (Enhanced)',
    'Victoria',
    'Moira',
    'Daniel (Enhanced)',
    'Daniel',
    'Microsoft Zira Desktop - English (United States)',
    'Google US English',
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
           || voices.find(function(v) { return v.lang === 'en-AU'; })
           || voices.find(function(v) { return v.lang.startsWith('en'); })
           || voices[0] || null;
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
    if (_stopped || !_queue.length || !synth) {
      _speaking = false;
      if (!_queue.length) _restoreYT();
      return;
    }
    _speaking = true;
    var chunk = _queue.shift();
    var u = new SpeechSynthesisUtterance(chunk);
    u.voice  = selectVoice();
    u.rate   = 0.82;   // warm coaching pace — unhurried but present
    u.pitch  = 0.95;   // warm, clear, coach-like
    u.volume = 1.0;    // full presence
    u.lang   = (u.voice && u.voice.lang) || 'en-GB';
    u.onend  = function() {
      if (_stopped) return;
      setTimeout(_nextChunk, _queue.length ? 1200 : 0);
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

    // 1.5s warm-up: let ambient audio settle before voice begins
    _warmupTimer = setTimeout(_start, 800);
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

  return { speak: speak, stop: stop, pause: pause, resume: resume };
})();

// ── Export ─────────────────────────────────────────────────────────
Object.assign(window.SC_APP || (window.SC_APP = {}), {
  AudioEngine:    AudioEngine,
  MentalYouTube:  MentalYouTube,
  MentalTTS:      MentalTTS,
});

console.log('[SC] app-mental-audio v3.1 — warmer voice, 1.5s warmup, graceful YT fade-back');
})();
