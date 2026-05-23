// ================================================================
// SmartCrick ProVision™ — Video Analysis Main Page
// app-video-analysis.js  v1.0
// Mode Selection · Upload · Camera · Live Analysis · Orchestration
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useCallback = React.useCallback;
var A = window.SC_APP;

// ── Brand constants ───────────────────────────────────────────────
var BRAND_PURPLE  = '#7c3aed';
var BRAND_LIGHT   = '#a78bfa';
var BRAND_BG      = 'linear-gradient(135deg, #0f0b1e, #1a1035)';
var CARD_BG       = 'rgba(22,27,34,0.95)';
var BORDER        = '1px solid rgba(48,54,61,0.9)';
var GREEN         = '#16a34a';
var GREEN_LIGHT   = '#22c55e';

// ── Mode config ───────────────────────────────────────────────────
var MODES = [
  {
    id: 'batting',
    label: 'Batting',
    emoji: '🏏',
    subtitle: 'Stance · Backswing · Contact · Follow-Through',
    description: 'Full biomechanical breakdown of your batting technique. Shot classification across 10 shot types.',
    features: ['Bat lift angle analysis', 'Hip rotation measurement', 'Shot classification (10 types)', 'Head stability tracking', 'Weight transfer scoring'],
    accent: '#f59e0b',
  },
  {
    id: 'bowling',
    label: 'Bowling',
    emoji: '⚡',
    subtitle: 'Run-Up · Delivery Stride · Arm Action · Release',
    description: 'Complete action analysis with ICC legal check, hip-shoulder separation, and injury risk monitoring.',
    features: ['ICC elbow compliance check', 'Hip-shoulder separation', 'Front knee brace analysis', 'Delivery classification', 'Injury load monitoring'],
    accent: '#ef4444',
  },
  {
    id: 'fielding',
    label: 'Fielding',
    emoji: '🤸',
    subtitle: 'Catching · Ground Fielding · Throwing',
    description: 'Analyse catching technique, ground fielding posture, and throwing mechanics.',
    features: ['Catching stance scoring', 'Ground fielding position', 'Long-barrier technique', 'Throwing mechanics', 'Dive form analysis'],
    accent: GREEN,
  },
  {
    id: 'keeping',
    label: 'Keeping',
    emoji: '🧤',
    subtitle: 'Stance · Crouch · Glovework · Footwork',
    description: 'Wicket-keeping technique analysis: stance width, crouch depth, glove positioning.',
    features: ['Stance width analysis', 'Crouch depth scoring', 'Glove position tracking', 'Leg-side footwork', 'Off-side footwork'],
    accent: '#3b82f6',
  },
];

// ── Utility ───────────────────────────────────────────────────────
function scoreColor(n) {
  if (n >= 85) return '#a855f7';
  if (n >= 70) return '#22c55e';
  if (n >= 55) return '#f59e0b';
  return '#ef4444';
}

function browserSupported() {
  try {
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return { ok: !!gl, noWebGL: !gl };
  } catch(e) {
    return { ok: false, noWebGL: true };
  }
}

// ── Mode Selector Screen ──────────────────────────────────────────
function ModeSelector({ onSelect }) {
  var sessions = A.DB ? (A.DB.get('video_sessions') || []) : [];
  var recentSessions = sessions.slice(-3).reverse();

  return h('div', { style: { paddingBottom: '7rem', minHeight: '100vh', background: '#0d1117' } },

    // Hero header
    h('div', { style: { background: BRAND_BG, padding: '28px 20px 24px', textAlign: 'center',
      borderBottom: '1px solid rgba(124,58,237,0.3)' } },
      h('div', { style: { fontSize: 11, color: BRAND_LIGHT, fontWeight: 700, letterSpacing: '0.1em',
        textTransform: 'uppercase', marginBottom: 6 } }, 'SmartCrick'),
      h('div', { style: { fontSize: 26, fontWeight: 900, color: '#f0fdf4', marginBottom: 2,
        fontFamily: "'Rajdhani', sans-serif", letterSpacing: '-0.01em' } },
        'ProVision™'),
      h('div', { style: { fontSize: 13, color: BRAND_LIGHT, marginBottom: 8 } },
        'Motion Intelligence Engine'),
      h('div', { style: { display: 'inline-block', padding: '4px 12px', borderRadius: 20,
        background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
        fontSize: 10, color: BRAND_LIGHT, fontWeight: 700, letterSpacing: '0.06em' } },
        '✦ ELITE BIOMECHANICAL ANALYSIS')
    ),

    h('div', { style: { padding: '20px 16px' } },

      // Mode cards
      h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 12 } }, 'Select Analysis Mode'),

      MODES.map(function(mode) {
        return h('div', { key: mode.id,
          onClick: function() { onSelect(mode.id); },
          style: { marginBottom: 12, padding: '16px', borderRadius: 14, cursor: 'pointer',
            background: CARD_BG, border: BORDER,
            borderLeft: '3px solid ' + mode.accent,
            transition: 'all 0.15s ease' } },
          h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 14 } },
            h('div', { style: { width: 46, height: 46, borderRadius: 12, flexShrink: 0,
              background: 'rgba(22,27,34,0.8)', border: BORDER,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22 } }, mode.emoji),
            h('div', { style: { flex: 1 } },
              h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 } },
                h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f0fdf4' } }, mode.label),
                h('div', { style: { fontSize: 10, color: mode.accent, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 10, background: mode.accent + '20',
                  border: '1px solid ' + mode.accent + '40' } }, 'PRO')
              ),
              h('div', { style: { fontSize: 11, color: '#8b949e', marginBottom: 6 } }, mode.subtitle),
              h('div', { style: { fontSize: 12, color: '#6b7280', lineHeight: 1.5, marginBottom: 8 } },
                mode.description),
              h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 4 } },
                mode.features.slice(0, 3).map(function(f, i) {
                  return h('div', { key: i, style: { fontSize: 10, color: '#484f58', padding: '2px 7px',
                    borderRadius: 8, background: 'rgba(22,27,34,0.8)', border: BORDER } }, f);
                })
              )
            ),
            h('div', { style: { fontSize: 20, color: '#484f58', alignSelf: 'center' } }, '›')
          )
        );
      }),

      // Recent sessions
      recentSessions.length > 0 && h('div', { style: { marginTop: 24 } },
        h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 10 } }, 'Recent Sessions'),
        recentSessions.map(function(s, i) {
          var modeObj = MODES.find(function(m) { return m.id === s.mode; });
          return h('div', { key: s.id || i, style: { display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px', borderRadius: 10, background: CARD_BG, border: BORDER,
            marginBottom: 6, cursor: 'pointer' },
            onClick: function() {
              A.DB.set('_provision_view_session', s);
              onSelect(s.mode, s);
            } },
            h('div', { style: { width: 38, height: 38, borderRadius: 8,
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16 } }, modeObj ? modeObj.emoji : '🏏'),
            h('div', { style: { flex: 1 } },
              h('div', { style: { fontSize: 14, fontWeight: 700, color: '#e6edf3' } },
                (modeObj ? modeObj.label : s.mode) + ' Analysis'),
              h('div', { style: { fontSize: 11, color: '#484f58' } }, s.date + ' · Score: ' + s.score)
            ),
            h('div', { style: { fontSize: 22, fontWeight: 800, color: scoreColor(s.score) } }, s.score)
          );
        })
      ),

      // Browser compatibility note
      h('div', { style: { marginTop: 24, padding: '12px 14px', borderRadius: 10,
        background: 'rgba(22,27,34,0.7)', border: BORDER } },
        h('div', { style: { fontSize: 11, color: '#484f58', lineHeight: 1.6 } },
          '✦ ProVision™ runs entirely on your device — no uploads, no server. Your footage stays private. ',
          'Powered by advanced pose estimation and biomechanical analysis technology.'
        )
      )
    )
  );
}

// ── Upload Zone ───────────────────────────────────────────────────
function UploadZone({ onFile, error }) {
  var [dragging, setDragging] = useState(false);
  var fileRef = useRef(null);

  function handleFile(file) {
    if (!file) return;
    var maxMB = 200;
    if (file.size > maxMB * 1024 * 1024) {
      onFile(null, 'Video too large (' + Math.round(file.size/1e6) + 'MB). Maximum ' + maxMB + 'MB. Trim to the key action.');
      return;
    }
    var url = URL.createObjectURL(file);
    onFile(url, null, file.name);
  }

  return h('div', {
    onDragOver: function(e) { e.preventDefault(); setDragging(true); },
    onDragLeave: function() { setDragging(false); },
    onDrop: function(e) {
      e.preventDefault(); setDragging(false);
      var file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) handleFile(file);
    },
    onClick: function() { fileRef.current && fileRef.current.click(); },
    style: { padding: '32px 20px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
      background: dragging ? 'rgba(124,58,237,0.12)' : 'rgba(22,27,34,0.7)',
      border: '2px dashed ' + (dragging ? BRAND_PURPLE : 'rgba(48,54,61,0.9)'),
      transition: 'all 0.2s ease' }
  },
    h('input', { ref: fileRef, type: 'file', accept: 'video/*', style: { display: 'none' },
      onChange: function(e) { handleFile(e.target.files[0]); } }),
    h('div', { style: { fontSize: 36, marginBottom: 10 } }, '📹'),
    h('div', { style: { fontSize: 15, fontWeight: 700, color: '#e6edf3', marginBottom: 4 } },
      'Upload Video'),
    h('div', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.5 } },
      'Drag & drop or tap to select · MP4, MOV, WEBM'),
    h('div', { style: { fontSize: 11, color: '#484f58', marginTop: 6 } },
      'Best: side-on angle, good lighting, 5-30 seconds'),
    error && h('div', { style: { marginTop: 10, fontSize: 12, color: '#ef4444',
      padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.1)' } }, error)
  );
}

// ── Camera Capture Component ──────────────────────────────────────
function CameraCapture({ mode, handedness, onCapture, onError }) {
  var videoRef    = useRef(null);
  var canvasRef   = useRef(null);
  var liveRef     = useRef(null);
  var streamRef   = useRef(null);
  var [recording, setRecording] = useState(false);
  var [livePose, setLivePose]   = useState(false);
  var [countdown, setCountdown] = useState(null);
  var [seconds, setSeconds]     = useState(0);
  var timerRef = useRef(null);
  var chunksRef = useRef([]);
  var recorderRef = useRef(null);

  useEffect(function() {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: 640, height: 480 } })
      .then(function(stream) {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(function(err) {
        var msg = err.name === 'NotAllowedError' ? 'Camera permission denied. Allow camera or upload a video instead.'
                : err.name === 'NotFoundError'   ? 'No camera found. Use video upload instead.'
                : 'Camera unavailable: ' + err.message;
        onError && onError(msg);
      });

    return function() {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(function(t) { t.stop(); });
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (liveRef.current) { liveRef.current.stop(); liveRef.current = null; }
    };
  }, []);

  function startLivePose() {
    if (!A.VideoEngine || !canvasRef.current || !videoRef.current) return;
    A.VideoEngine.startLiveAnalysis(videoRef.current, canvasRef.current, { mode: mode, handedness: handedness },
      function(result) { /* live metrics could update a display */ }
    ).then(function(ctrl) { liveRef.current = ctrl; setLivePose(true); });
  }

  function startRecording() {
    if (!streamRef.current) return;
    chunksRef.current = [];
    var mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8') ? 'video/webm;codecs=vp8' : 'video/mp4';
    try {
      recorderRef.current = new MediaRecorder(streamRef.current, { mimeType: mimeType });
    } catch(e) {
      recorderRef.current = new MediaRecorder(streamRef.current);
    }
    recorderRef.current.ondataavailable = function(e) { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorderRef.current.onstop = function() {
      var blob = new Blob(chunksRef.current, { type: 'video/webm' });
      var url  = URL.createObjectURL(blob);
      onCapture && onCapture(url, blob.name || 'recorded.webm');
    };
    recorderRef.current.start(100);
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(function() { setSeconds(function(s) { return s + 1; }); }, 1000);
  }

  function stopRecording() {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
    }
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  return h('div', { style: { position: 'relative' } },
    h('div', { style: { position: 'relative', borderRadius: 14, overflow: 'hidden',
      background: '#000', border: BORDER } },
      h('video', { ref: videoRef, autoPlay: true, playsInline: true, muted: true,
        style: { width: '100%', display: 'block', minHeight: 220 } }),
      h('canvas', { ref: canvasRef,
        style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: livePose ? 'block' : 'none' } }),
      recording && h('div', { style: { position: 'absolute', top: 10, left: 10,
        padding: '4px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.9)',
        fontSize: 11, fontWeight: 700, color: '#fff' } },
        '● REC ' + seconds + 's')
    ),
    h('div', { style: { display: 'flex', gap: 8, marginTop: 10 } },
      !livePose && h('button', { onClick: startLivePose,
        style: { flex: 1, padding: '10px', borderRadius: 10,
          background: 'rgba(22,27,34,0.7)', border: BORDER,
          color: '#8b949e', fontSize: 13, fontWeight: 600, cursor: 'pointer' } },
        'Live Pose Overlay'),
      !recording
        ? h('button', { onClick: startRecording,
            style: { flex: 1, padding: '10px', borderRadius: 10,
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              color: '#fca5a5', fontSize: 13, fontWeight: 700, cursor: 'pointer' } },
            '⏺ Start Recording')
        : h('button', { onClick: stopRecording,
            style: { flex: 1, padding: '10px', borderRadius: 10,
              background: 'rgba(239,68,68,0.8)', border: 'none',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' } },
            '⏹ Stop & Analyse (' + seconds + 's)')
    )
  );
}

// ── Analysis Progress Screen ──────────────────────────────────────
function AnalysisScreen({ videoUrl, mode, handedness, cameraAngle, onComplete, onCancel }) {
  var videoRef  = useRef(null);
  var canvasRef = useRef(null);
  var [progress, setProgress] = useState(0);
  var [statusMsg, setStatusMsg] = useState('Initializing BioTrack™ Pose System...');
  var [currentLandmarks, setCurrentLandmarks] = useState(null);
  var [phase, setPhase]   = useState('stance');
  var cancelledRef = useRef(false);
  var CONN = A.VD ? A.VD.POSE_CONNECTIONS : [];

  useEffect(function() {
    if (!videoUrl) return;
    var videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.src = videoUrl;
    videoEl.muted = true;

    videoEl.addEventListener('loadedmetadata', function() {
      if (cancelledRef.current) return;
      if (videoEl.duration > 180) {
        setStatusMsg('Video too long (>' + Math.round(videoEl.duration) + 's). Analysing first 3 minutes.');
      }
      runAnalysis(videoEl);
    });

    videoEl.load();

    return function() { cancelledRef.current = true; };
  }, [videoUrl]);

  async function runAnalysis(videoEl) {
    if (!A.VideoEngine) {
      setStatusMsg('ProVision™ Engine not loaded. Please refresh.');
      return;
    }
    try {
      var result = await A.VideoEngine.analyseVideo(
        videoEl,
        { mode: mode, handedness: handedness, cameraAngle: cameraAngle, fps: 8 },
        function(pct, msg) {
          if (cancelledRef.current) return;
          setProgress(pct);
          if (msg) setStatusMsg(msg);
        },
        function(frameResult) {
          if (cancelledRef.current) return;
          if (frameResult.lm) setCurrentLandmarks(frameResult.lm);
          if (frameResult.phase) setPhase(frameResult.phase);
          // Draw on canvas
          var canvas = canvasRef.current;
          if (canvas && A.VideoEngine && frameResult.lm) {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            A.VideoEngine.drawSkeletonOnCanvas(ctx, frameResult.lm, canvas.width, canvas.height, '#7c3aed', CONN);
          }
        }
      );
      if (cancelledRef.current) return;

      // Save session
      if (A.DB) {
        var sessions = A.DB.get('video_sessions') || [];
        sessions.push(result);
        if (sessions.length > 50) sessions = sessions.slice(-50);
        A.DB.set('video_sessions', sessions);
      }

      setProgress(100);
      setStatusMsg('Analysis complete!');
      await new Promise(function(r) { setTimeout(r, 600); });
      onComplete && onComplete(result);
    } catch(e) {
      console.error('[SC] Video analysis error:', e);
      setStatusMsg('Analysis error: ' + e.message + '. Please try again.');
    }
  }

  var phaseLabels = {
    batting:  { stance:'Stance', backswing:'Backswing', contact:'Contact', followThrough:'Follow-Thru' },
    bowling:  { runUp:'Run-Up', deliveryStride:'Stride', armAction:'Arm Action', followThrough:'Release' },
    fielding: { approach:'Approach', collection:'Collection', throw:'Throw' },
    keeping:  { stance:'Stance', take:'Take', footwork:'Footwork' },
  };

  return h('div', { style: { minHeight: '100vh', background: '#0d1117', paddingBottom: '5rem',
    display: 'flex', flexDirection: 'column' } },

    h('div', { style: { padding: '16px', borderBottom: '1px solid rgba(48,54,61,0.7)',
      display: 'flex', alignItems: 'center', gap: 10 } },
      h('button', { onClick: function() { cancelledRef.current = true; onCancel && onCancel(); },
        style: { background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 20 } }, '✕'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 11, color: BRAND_LIGHT, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' } }, 'ProVision™ Engine'),
        h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f0fdf4' } }, 'Analysing ' + mode.charAt(0).toUpperCase() + mode.slice(1))
      )
    ),

    h('div', { style: { flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 16 } },

      // Video + skeleton overlay canvas
      h('div', { style: { position: 'relative', borderRadius: 14, overflow: 'hidden',
        background: '#000', border: BORDER, minHeight: 200 } },
        h('video', { ref: videoRef, style: { width: '100%', display: 'block', opacity: 0.35 },
          muted: true, playsInline: true }),
        h('canvas', { ref: canvasRef, width: 640, height: 480,
          style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' } }),
        h('div', { style: { position: 'absolute', bottom: 10, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
          h('div', { style: { fontSize: 10, color: BRAND_LIGHT, fontWeight: 700,
            padding: '3px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.7)' } },
            'BioTrack™ LIVE'),
          phase && h('div', { style: { fontSize: 10, color: '#f0fdf4', fontWeight: 600,
            padding: '3px 8px', borderRadius: 6, background: 'rgba(22,27,34,0.8)' } },
            (phaseLabels[mode] || {})[phase] || phase)
        )
      ),

      // Progress
      h('div', { style: { padding: '16px', borderRadius: 12, background: CARD_BG, border: BORDER } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 } },
          h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e6edf3' } }, statusMsg),
          h('div', { style: { fontSize: 16, fontWeight: 800, color: BRAND_LIGHT } }, progress + '%')
        ),
        h('div', { style: { height: 6, borderRadius: 3, background: 'rgba(48,54,61,0.9)', overflow: 'hidden' } },
          h('div', { style: { height: '100%', width: progress + '%', borderRadius: 3,
            background: 'linear-gradient(90deg, ' + BRAND_PURPLE + ', ' + BRAND_LIGHT + ')',
            transition: 'width 0.4s ease' } })
        )
      ),

      // Phase pills
      h('div', { style: { display: 'flex', gap: 6, flexWrap: 'wrap' } },
        Object.entries(phaseLabels[mode] || phaseLabels.batting).map(function(entry) {
          var k = entry[0], v = entry[1];
          var active = phase === k;
          return h('div', { key: k, style: { padding: '4px 10px', borderRadius: 20, fontSize: 11,
            fontWeight: active ? 700 : 500,
            background: active ? 'rgba(124,58,237,0.25)' : 'rgba(22,27,34,0.7)',
            border: '1px solid ' + (active ? 'rgba(124,58,237,0.6)' : 'rgba(48,54,61,0.7)'),
            color: active ? BRAND_LIGHT : '#484f58' } }, v);
        })
      ),

      // Info card
      h('div', { style: { padding: '12px 14px', borderRadius: 10,
        background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)' } },
        h('div', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.6 } },
          'CricketIQ™ Algorithm is processing ' + (mode === 'batting' ? '4 technique phases and 8 biomechanical metrics'
            : mode === 'bowling' ? '4 delivery phases, ICC elbow compliance, and hip-shoulder separation'
            : mode === 'fielding' ? 'catching stance, ground fielding position, and throwing mechanics'
            : 'stance depth, glove position, and footwork efficiency') + '.')
      )
    )
  );
}

// ── Input / Setup Screen ──────────────────────────────────────────
function InputScreen({ mode, onStartAnalysis, onBack }) {
  var [videoUrl, setVideoUrl]       = useState(null);
  var [fileName, setFileName]       = useState(null);
  var [inputTab, setInputTab]       = useState('upload'); // 'upload' | 'camera'
  var [handedness, setHandedness]   = useState('RHB');
  var [cameraAngle, setCameraAngle] = useState('side-on');
  var [uploadError, setUploadError] = useState(null);
  var [camError, setCamError]       = useState(null);
  var hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  var modeObj = MODES.find(function(m) { return m.id === mode; });

  function handleFile(url, err, name) {
    setUploadError(err || null);
    if (url) { setVideoUrl(url); setFileName(name || 'video'); }
  }

  function handleCapture(url, name) {
    setVideoUrl(url);
    setFileName(name || 'recorded.webm');
    setInputTab('upload');
  }

  return h('div', { style: { minHeight: '100vh', background: '#0d1117', paddingBottom: '7rem' } },

    // Header
    h('div', { style: { padding: '14px 16px', borderBottom: '1px solid rgba(48,54,61,0.7)',
      display: 'flex', alignItems: 'center', gap: 10 } },
      h('button', { onClick: onBack,
        style: { background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 22 } }, '←'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 11, color: BRAND_LIGHT, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' } }, 'ProVision™'),
        h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f0fdf4' } },
          (modeObj ? modeObj.emoji + ' ' : '') + (modeObj ? modeObj.label : mode) + ' Analysis')
      )
    ),

    h('div', { style: { padding: '16px' } },

      // Handedness selector
      h('div', { style: { marginBottom: 16 } },
        h('div', { style: { fontSize: 12, color: '#8b949e', fontWeight: 600, marginBottom: 8 } },
          mode === 'bowling' ? 'Bowling Hand' : mode === 'batting' ? 'Batting Hand' : 'Dominant Hand'),
        h('div', { style: { display: 'flex', gap: 8 } },
          ['RHB', 'LHB'].map(function(hand) {
            var active = handedness === hand;
            return h('button', { key: hand, onClick: function() { setHandedness(hand); },
              style: { flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13,
                background: active ? 'rgba(124,58,237,0.2)' : CARD_BG,
                border: '1px solid ' + (active ? 'rgba(124,58,237,0.6)' : 'rgba(48,54,61,0.7)'),
                color: active ? BRAND_LIGHT : '#8b949e', cursor: 'pointer' } },
              hand === 'RHB' ? 'Right-Handed' : 'Left-Handed');
          })
        )
      ),

      // Camera angle
      h('div', { style: { marginBottom: 16 } },
        h('div', { style: { fontSize: 12, color: '#8b949e', fontWeight: 600, marginBottom: 8 } }, 'Camera Angle'),
        h('div', { style: { display: 'flex', gap: 8 } },
          [['side-on','Side-On (Best)'],['front-on','Front-On']].map(function(opt) {
            var active = cameraAngle === opt[0];
            return h('button', { key: opt[0], onClick: function() { setCameraAngle(opt[0]); },
              style: { flex: 1, padding: '10px', borderRadius: 10, fontWeight: active ? 700 : 600, fontSize: 13,
                background: active ? 'rgba(22,163,74,0.12)' : CARD_BG,
                border: '1px solid ' + (active ? 'rgba(22,163,74,0.4)' : 'rgba(48,54,61,0.7)'),
                color: active ? GREEN_LIGHT : '#8b949e', cursor: 'pointer' } },
              opt[1]);
          })
        )
      ),

      // Input tabs
      hasCamera && h('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
        ['upload', 'camera'].map(function(tab) {
          var active = inputTab === tab;
          var label  = tab === 'upload' ? '📁 Upload Video' : '📹 Use Camera';
          return h('button', { key: tab, onClick: function() { setInputTab(tab); },
            style: { flex: 1, padding: '10px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: active ? 'rgba(124,58,237,0.15)' : CARD_BG,
              border: '1px solid ' + (active ? 'rgba(124,58,237,0.5)' : 'rgba(48,54,61,0.7)'),
              color: active ? BRAND_LIGHT : '#8b949e', cursor: 'pointer' } },
            label);
        })
      ),

      // Upload or Camera
      inputTab === 'upload'
        ? h(UploadZone, { onFile: handleFile, error: uploadError })
        : h(CameraCapture, { mode: mode, handedness: handedness, onCapture: handleCapture,
            onError: function(msg) { setCamError(msg); setInputTab('upload'); } }),

      // Camera error
      camError && h('div', { style: { marginTop: 10, fontSize: 12, color: '#f59e0b',
        padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.1)' } }, camError),

      // Video preview
      videoUrl && h('div', { style: { marginTop: 16, padding: '12px', borderRadius: 12,
        background: CARD_BG, border: '1px solid rgba(22,163,74,0.3)' } },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 } },
          h('div', { style: { width: 36, height: 36, borderRadius: 8,
            background: 'rgba(22,163,74,0.12)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 18 } }, '✓'),
          h('div', { style: { flex: 1 } },
            h('div', { style: { fontSize: 14, fontWeight: 700, color: GREEN_LIGHT } }, 'Video Ready'),
            h('div', { style: { fontSize: 11, color: '#484f58' } }, fileName || 'video')
          ),
          h('button', { onClick: function() { setVideoUrl(null); setFileName(null); },
            style: { background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 18 } }, '✕')
        ),
        h('video', { src: videoUrl, controls: true, playsInline: true,
          style: { width: '100%', borderRadius: 8, maxHeight: 200 } })
      ),

      // Start button
      videoUrl && h('button', { onClick: function() { onStartAnalysis(videoUrl, handedness, cameraAngle); },
        style: { width: '100%', marginTop: 16, padding: '16px', borderRadius: 14,
          background: 'linear-gradient(135deg, ' + BRAND_PURPLE + ', #6d28d9)',
          border: 'none', color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          letterSpacing: '-0.01em' } },
        'Start ProVision™ Analysis ›'
      ),

      // Tips
      h('div', { style: { marginTop: 20, padding: '12px 14px', borderRadius: 10,
        background: 'rgba(22,27,34,0.7)', border: BORDER } },
        h('div', { style: { fontSize: 11, fontWeight: 700, color: '#484f58',
          letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 } }, 'Tips for Best Results'),
        ['Film from side-on for batting/bowling — captures full body mechanics',
          'Ensure your full body is visible in the frame',
          'Good lighting makes pose detection more accurate',
          'Contrasting clothing vs background improves tracking'].map(function(tip, i) {
          return h('div', { key: i, style: { fontSize: 11, color: '#6b7280', marginBottom: 3,
            display: 'flex', gap: 6, alignItems: 'flex-start' } },
            h('span', { style: { color: BRAND_LIGHT, flexShrink: 0 } }, '✦'),
            tip);
        })
      )
    )
  );
}

// ── Main VideoAnalysisPage component ─────────────────────────────
function VideoAnalysisPage(props) {
  var params   = (props && props.params) || {};
  var initMode = params.mode || null;

  // Check for a session to view directly (from history click)
  var viewSession = A.DB ? A.DB.get('_provision_view_session') : null;
  if (viewSession) { A.DB && A.DB.del('_provision_view_session'); }

  var [screen, setScreen]       = useState(viewSession ? 'results' : (initMode ? 'input' : 'mode'));
  var [mode, setMode]           = useState(initMode || (viewSession && viewSession.mode) || 'batting');
  var [videoUrl, setVideoUrl]   = useState(null);
  var [handedness, setHandedness] = useState('RHB');
  var [cameraAngle, setCameraAngle] = useState('side-on');
  var [session, setSession]     = useState(viewSession || null);
  var support = browserSupported();

  // Browser incompatibility warning
  if (!support.ok && screen === 'mode') {
    return h('div', { style: { minHeight: '100vh', background: '#0d1117', padding: '24px 16px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center' } },
      h('div', { style: { fontSize: 40, marginBottom: 16 } }, '⚠️'),
      h('div', { style: { fontSize: 18, fontWeight: 800, color: '#f0fdf4', marginBottom: 8 } },
        'Browser Upgrade Needed'),
      h('div', { style: { fontSize: 13, color: '#8b949e', maxWidth: 320, lineHeight: 1.6, marginBottom: 20 } },
        'ProVision™ requires WebGL for AI pose estimation. Please use Chrome, Firefox, or Safari 15+ for the full experience.'),
      h('button', { onClick: function() { setScreen('mode'); },
        style: { padding: '12px 24px', borderRadius: 12, background: BRAND_PURPLE, border: 'none',
          color: '#fff', fontWeight: 700, cursor: 'pointer' } },
        'Continue Anyway (Demo Mode)')
    );
  }

  if (screen === 'mode') {
    return h(ModeSelector, {
      onSelect: function(selectedMode, previewSession) {
        setMode(selectedMode);
        if (previewSession) { setSession(previewSession); setScreen('results'); }
        else setScreen('input');
      }
    });
  }

  if (screen === 'input') {
    return h(InputScreen, {
      mode: mode,
      onBack: function() { setScreen('mode'); },
      onStartAnalysis: function(url, hand, angle) {
        setVideoUrl(url);
        setHandedness(hand);
        setCameraAngle(angle);
        setScreen('analysing');
      },
    });
  }

  if (screen === 'analysing') {
    return h(AnalysisScreen, {
      videoUrl: videoUrl,
      mode: mode,
      handedness: handedness,
      cameraAngle: cameraAngle,
      onComplete: function(result) {
        setSession(result);
        setScreen('results');
      },
      onCancel: function() { setScreen('input'); },
    });
  }

  if (screen === 'results') {
    return h(A.VideoResultsPage || FallbackResults, {
      session: session,
      videoUrl: videoUrl,
      onRetry: function() { setScreen('input'); },
      onClose: function() { setScreen('mode'); },
    });
  }

  return null;
}

function FallbackResults({ session, onClose }) {
  if (!session) return null;
  return h('div', { style: { padding: 24, color: '#e6edf3' } },
    h('div', { style: { fontSize: 24, fontWeight: 800, color: '#f0fdf4', marginBottom: 8 } }, 'Analysis Complete'),
    h('div', { style: { fontSize: 48, fontWeight: 900, color: '#a855f7' } }, session.score),
    h('button', { onClick: onClose, style: { marginTop: 20, padding: '12px 24px',
      background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' } }, 'Done')
  );
}

// Export — overrides the stub
Object.assign(A, {
  VideoAnalysisPage: VideoAnalysisPage,
});

console.log('[SC] app-video-analysis ready — ProVision™ v1.0');
})();
