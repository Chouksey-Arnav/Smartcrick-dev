// ================================================================
// SmartCrick ProVision™ — Results Visualization
// app-video-results.js  v1.0
// Gauge Cards · Skeleton Replay · Feedback Panel · PDF Export
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useCallback = React.useCallback;
var A = window.SC_APP;

// ── Color helpers ─────────────────────────────────────────────────
function scoreColor(n) {
  if (n >= 85) return '#a855f7';
  if (n >= 70) return '#22c55e';
  if (n >= 55) return '#f59e0b';
  return '#ef4444';
}
function scoreBg(n) {
  if (n >= 85) return 'rgba(168,85,247,0.12)';
  if (n >= 70) return 'rgba(34,197,94,0.12)';
  if (n >= 55) return 'rgba(245,158,11,0.12)';
  return 'rgba(239,68,68,0.12)';
}
function gradeLabel(n) {
  if (n >= 85) return 'Elite';
  if (n >= 70) return 'Advanced';
  if (n >= 55) return 'Developing';
  return 'Beginner';
}

// ── Animated Gauge Dial ───────────────────────────────────────────
function GaugeDial({ score, label, size }) {
  var sz     = size || 90;
  var radius = sz * 0.38;
  var cx     = sz / 2;
  var cy     = sz * 0.58;
  var startAngle = Math.PI;
  var endAngle   = 2 * Math.PI;
  var arcLen = Math.PI;
  var fill   = (Math.max(0, Math.min(100, score)) / 100) * arcLen;

  function polarToXY(angle, r) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }
  function arcPath(start, end, r) {
    var s = polarToXY(start, r);
    var e = polarToXY(end, r);
    var large = (end - start > Math.PI) ? 1 : 0;
    return 'M ' + s.x + ' ' + s.y + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + e.x + ' ' + e.y;
  }

  var color = scoreColor(score);

  return h('div', { style: { textAlign: 'center', flex: '1 1 0' } },
    h('svg', { width: sz, height: sz * 0.7, viewBox: '0 0 ' + sz + ' ' + (sz * 0.7),
      style: { overflow: 'visible' } },
      // Background arc
      h('path', { d: arcPath(startAngle, endAngle, radius),
        fill: 'none', stroke: 'rgba(48,54,61,0.9)', strokeWidth: sz * 0.085,
        strokeLinecap: 'round' }),
      // Filled arc
      fill > 0.01 && h('path', { d: arcPath(startAngle, startAngle + fill, radius),
        fill: 'none', stroke: color, strokeWidth: sz * 0.085,
        strokeLinecap: 'round',
        style: { transition: 'all 1.2s ease-out' } }),
      // Score text
      h('text', { x: cx, y: cy + sz * 0.06, textAnchor: 'middle',
        fontSize: sz * 0.22, fontWeight: 800, fill: '#f0fdf4', fontFamily: 'Inter, system-ui' },
        score),
    ),
    h('div', { style: { fontSize: 11, color: '#8b949e', marginTop: 2, fontWeight: 600, letterSpacing: '0.02em' } },
      label)
  );
}

// ── Phase Breakdown Bar ───────────────────────────────────────────
function PhaseBar({ subScores, mode }) {
  var phaseNames = {
    batting:  [['stance','Stance'],['backswing','Backswing'],['contact','Contact'],['followThrough','Follow-Thru']],
    bowling:  [['runUp','Run-Up'],['deliveryStride','Stride'],['armAction','Arm Action'],['release','Release']],
    fielding: [['stance','Position'],['movement','Movement'],['hands','Hands'],['throwing','Throw']],
    keeping:  [['stance','Stance'],['footwork','Footwork'],['glovework','Gloves'],['reaction','Reaction']],
  };
  var phases = phaseNames[mode] || phaseNames.batting;

  return h('div', { style: { marginTop: 16 } },
    h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 10 } }, 'Phase Breakdown'),
    phases.map(function(ph) {
      var key = ph[0], label = ph[1];
      var val = subScores[key] || 0;
      var color = scoreColor(val);
      return h('div', { key: key, style: { marginBottom: 8 } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 3 } },
          h('span', { style: { fontSize: 12, color: '#8b949e', fontWeight: 600 } }, label),
          h('span', { style: { fontSize: 12, color: color, fontWeight: 700 } }, val)
        ),
        h('div', { style: { height: 5, borderRadius: 3, background: 'rgba(48,54,61,0.9)', overflow: 'hidden' } },
          h('div', { style: { height: '100%', width: val + '%', background: color, borderRadius: 3,
            transition: 'width 1s ease-out' } })
        )
      );
    })
  );
}

// ── ICC Legal Action Badge ────────────────────────────────────────
function ICCBadge({ iccCheck }) {
  if (!iccCheck) return null;
  var status = iccCheck.status;
  var color  = iccCheck.color;
  var angle  = iccCheck.angle;
  var labels = { legal: 'LEGAL ACTION ✓', borderline: 'BORDERLINE ⚠', illegal: 'ILLEGAL ACTION ✗' };
  var descs  = {
    legal: 'Elbow extension ' + angle + '° — within ICC 15° limit. Action is fully compliant.',
    borderline: 'Elbow extension ' + angle + '° — approaching ICC 15° limit. Remedial coaching recommended.',
    illegal: 'Elbow extension ' + angle + '° — exceeds ICC 15° limit. Immediate corrective work required.',
  };

  return h('div', { style: { borderRadius: 10, border: '1px solid ' + color, background: 'rgba(13,17,23,0.8)',
    padding: '12px 16px', marginTop: 16 } },
    h('div', { style: { fontSize: 11, fontWeight: 700, color: color, letterSpacing: '0.06em', marginBottom: 4 } },
      'ICC ACTION COMPLIANCE — BioTrack™ VERIFIED'),
    h('div', { style: { fontSize: 15, fontWeight: 800, color: color, marginBottom: 4 } }, labels[status]),
    h('div', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.5 } }, descs[status])
  );
}

// ── Coaching Feedback Panel ───────────────────────────────────────
function FeedbackPanel({ feedback, linkedDrills }) {
  if (!feedback || !feedback.length) return null;

  return h('div', { style: { marginTop: 20 } },
    h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 12 } }, 'MIE Coaching Intelligence™'),
    feedback.map(function(fb, i) {
      var priority = fb.priority || 2;
      var dotColor = priority === 1 ? '#ef4444' : priority === 2 ? '#f59e0b' : '#22c55e';
      return h('div', { key: i, style: { display: 'flex', gap: 10, marginBottom: 12,
        padding: '10px 14px', borderRadius: 8, background: 'rgba(22,27,34,0.7)',
        border: '1px solid rgba(48,54,61,0.7)', borderLeft: '3px solid ' + dotColor } },
        h('div', { style: { flex: 1, fontSize: 13, color: '#c9d1d9', lineHeight: 1.6 } }, fb.text)
      );
    }),
    linkedDrills && linkedDrills.length > 0 && h('div', { style: { marginTop: 16 } },
      h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', marginBottom: 8 } }, 'Recommended Drills'),
      linkedDrills.map(function(d, i) {
        return h('div', { key: i, style: { display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8, background: 'rgba(22,163,74,0.08)',
          border: '1px solid rgba(22,163,74,0.2)', marginBottom: 6, cursor: 'pointer' },
          onClick: function() { A.nav('Drills'); } },
          h('div', { style: { width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 } }),
          h('div', { style: { flex: 1 } },
            h('div', { style: { fontSize: 13, fontWeight: 600, color: '#22c55e' } }, d.label),
            h('div', { style: { fontSize: 11, color: '#484f58' } }, d.category.charAt(0).toUpperCase() + d.category.slice(1) + ' drill')
          ),
          h('div', { style: { fontSize: 11, color: '#484f58' } }, '→')
        );
      })
    )
  );
}

// ── Metric Detail Cards ───────────────────────────────────────────
function MetricCards({ metrics, mode }) {
  var modeLabels = {
    headStability:          ['Head Stability', 'score'],
    batLiftAngle:           ['Bat Lift Angle', '°'],
    bodyRotation:           ['Hip Rotation', '°'],
    frontElbowAngle:        ['Front Elbow', '°'],
    weightTransfer:         ['Weight Transfer', 'score'],
    balance:                ['Balance', 'score'],
    elbowExtension:         ['Elbow Extension', '°'],
    hipShoulderSeparation:  ['Hip-Shoulder Sep', '°'],
    frontKneeAngle:         ['Front Knee', '°'],
    runUpConsistency:       ['Run-Up Consistency', 'score'],
    groundFieldingPosition: ['Ground Position', 'score'],
    bodyLean:               ['Body Lean', '°'],
    throwingMechanics:      ['Throw Mechanics', 'score'],
    stanceWidth:            ['Stance Width', 'score'],
    crouchDepth:            ['Crouch Depth', 'score'],
    glovePosition:          ['Glove Position', 'score'],
  };

  var keys = Object.keys(metrics).filter(function(k) {
    var v = metrics[k];
    return v !== null && v !== undefined && modeLabels[k];
  });

  if (!keys.length) return null;

  return h('div', { style: { marginTop: 20 } },
    h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 10 } }, 'Key Metrics'),
    h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 } },
      keys.map(function(k) {
        var v     = metrics[k];
        var info  = modeLabels[k];
        var label = info ? info[0] : k;
        var unit  = info ? info[1] : '';
        var disp  = unit === 'score' ? v : v + unit;
        var color = unit === 'score' ? scoreColor(v) : '#c9d1d9';
        return h('div', { key: k, style: { padding: '10px 12px', borderRadius: 8,
          background: 'rgba(22,27,34,0.7)', border: '1px solid rgba(48,54,61,0.7)' } },
          h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 600, marginBottom: 3 } }, label),
          h('div', { style: { fontSize: 20, fontWeight: 800, color: color } }, disp)
        );
      })
    )
  );
}

// ── Skeleton Replay Viewer ────────────────────────────────────────
function SkeletonReplayViewer({ session, videoUrl }) {
  var canvasRef = useRef(null);
  var [frame, setFrame] = useState(0);
  var landmarks = session.landmarks || [];
  var maxFrame  = Math.max(0, landmarks.length - 1);

  useEffect(function() {
    if (!canvasRef.current || !landmarks.length) return;
    var canvas = canvasRef.current;
    var ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var lm = landmarks[Math.min(frame, landmarks.length - 1)];
    if (lm && A.VideoEngine) {
      A.VideoEngine.drawSkeletonOnCanvas(ctx, lm, canvas.width, canvas.height, scoreColor(session.score), A.VD ? A.VD.POSE_CONNECTIONS : []);
    }
  }, [frame, landmarks]);

  if (!landmarks.length) return null;

  return h('div', { style: { marginTop: 20 } },
    h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 10 } }, 'ProVision™ Pose Overlay'),
    h('canvas', { ref: canvasRef, width: 320, height: 240,
      style: { width: '100%', borderRadius: 10, background: '#0d1117',
        border: '1px solid rgba(48,54,61,0.9)' } }),
    h('div', { style: { marginTop: 8 } },
      h('input', { type: 'range', min: 0, max: maxFrame, value: frame,
        onChange: function(e) { setFrame(parseInt(e.target.value)); },
        style: { width: '100%', accentColor: '#7c3aed' } }),
      h('div', { style: { display: 'flex', justifyContent: 'space-between',
        fontSize: 10, color: '#484f58', marginTop: 2 } },
        h('span', null, 'Frame ' + (frame + 1)),
        h('span', null, landmarks.length + ' frames captured')
      )
    )
  );
}

// ── Session Comparison Bar ────────────────────────────────────────
function ComparisonBar({ session }) {
  var sessions = A.DB ? A.DB.get('video_sessions') || [] : [];
  var sameModeS = sessions.filter(function(s) { return s.mode === session.mode && s.id !== session.id; });
  var personalBest = sameModeS.length ? Math.max.apply(null, sameModeS.map(function(s) { return s.score; })) : null;
  var eliteScore   = 92;

  var bars = [
    { label: 'You', score: session.score, color: scoreColor(session.score) },
  ];
  if (personalBest && personalBest !== session.score) {
    bars.push({ label: 'Personal Best', score: personalBest, color: '#22c55e' });
  }
  bars.push({ label: 'Elite Benchmark™', score: eliteScore, color: '#a855f7' });

  return h('div', { style: { marginTop: 20 } },
    h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 12 } }, 'Performance Comparison'),
    bars.map(function(b) {
      return h('div', { key: b.label, style: { marginBottom: 10 } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 3 } },
          h('span', { style: { fontSize: 12, color: '#8b949e', fontWeight: 600 } }, b.label),
          h('span', { style: { fontSize: 12, fontWeight: 700, color: b.color } }, b.score)
        ),
        h('div', { style: { height: 6, borderRadius: 3, background: 'rgba(48,54,61,0.9)', overflow: 'hidden' } },
          h('div', { style: { height: '100%', width: b.score + '%', background: b.color, borderRadius: 3,
            transition: 'width 1.2s ease-out' } })
        )
      );
    })
  );
}

// ── Session History List ──────────────────────────────────────────
function SessionHistoryList({ currentSession, mode, onViewSession }) {
  var sessions = A.DB ? (A.DB.get('video_sessions') || []) : [];
  var sameModeS = sessions.filter(function(s) { return s.mode === mode; })
    .sort(function(a, b) { return b.ts - a.ts; })
    .slice(0, 6);

  if (sameModeS.length < 2) return null;

  return h('div', { style: { marginTop: 20 } },
    h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 10 } }, 'Session History'),
    sameModeS.map(function(s, i) {
      var isCurrent = s.id === currentSession.id;
      return h('div', { key: s.id, style: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 8, background: isCurrent ? 'rgba(124,58,237,0.12)' : 'rgba(22,27,34,0.7)',
        border: '1px solid ' + (isCurrent ? 'rgba(124,58,237,0.4)' : 'rgba(48,54,61,0.7)'),
        marginBottom: 6, cursor: isCurrent ? 'default' : 'pointer' },
        onClick: isCurrent ? undefined : function() { onViewSession && onViewSession(s); } },
        h('div', { style: { width: 36, height: 36, borderRadius: 8,
          background: scoreBg(s.score), display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: 800, fontSize: 16, color: scoreColor(s.score) } },
          s.score),
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontSize: 13, fontWeight: 600, color: isCurrent ? '#c4b5fd' : '#e6edf3' } },
            isCurrent ? 'Current Session' : gradeLabel(s.score) + ' Session'),
          h('div', { style: { fontSize: 11, color: '#484f58' } }, s.date)
        ),
        !isCurrent && h('div', { style: { fontSize: 11, color: '#484f58' } }, '→')
      );
    })
  );
}

// ── PDF Report Generation ─────────────────────────────────────────
function generatePDFReport(session) {
  if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
    alert('PDF library loading. Please try again in a moment.');
    return;
  }
  var jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
  var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  var user = A.DB ? A.DB.getUser() : {};
  var w = 210, margin = 20;

  // Header background
  doc.setFillColor(13, 17, 23);
  doc.rect(0, 0, w, 50, 'F');

  // Branding
  doc.setFontSize(20);
  doc.setTextColor(240, 253, 244);
  doc.setFont('helvetica', 'bold');
  doc.text('SmartCrick ProVision™', margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(134, 115, 253);
  doc.text('Biomechanical Analysis Report', margin, 28);

  doc.setTextColor(72, 79, 88);
  doc.setFontSize(9);
  doc.text('Motion Intelligence Engine · BioTrack™ Certified', margin, 35);
  doc.text('Report Date: ' + new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }), margin, 42);

  // Player info box
  doc.setFillColor(22, 27, 34);
  doc.setDrawColor(48, 54, 61);
  doc.roundedRect(margin, 55, w - margin*2, 28, 4, 4, 'FD');

  doc.setTextColor(230, 237, 243);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(user.name || 'Athlete', margin + 6, 66);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(139, 148, 158);
  var modeLabel = session.mode.charAt(0).toUpperCase() + session.mode.slice(1);
  doc.text(modeLabel + ' Analysis  ·  ' + (session.handedness || 'RHB') + '  ·  ' + session.date, margin + 6, 73);
  doc.text('Duration: ' + session.duration + 's  ·  Frames: ' + session.frames + '  ·  Engine: ' + session.backend, margin + 6, 79);

  // Score hero
  var scoreColor255 = session.score >= 85 ? [168, 85, 247] : session.score >= 70 ? [34, 197, 94] : session.score >= 55 ? [245, 158, 11] : [239, 68, 68];
  doc.setFillColor.apply(doc, scoreColor255);
  doc.circle(w - 40, 69, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(session.score), w - 40, 72, { align: 'center' });
  doc.setFontSize(8);
  doc.text(gradeLabel(session.score), w - 40, 79, { align: 'center' });

  // Sub-scores section
  var y = 92;
  doc.setTextColor(72, 79, 88);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('PHASE SCORES', margin, y);
  y += 6;

  var sub = session.subScores || {};
  Object.keys(sub).forEach(function(k) {
    var v = sub[k];
    var label = k.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); });
    var barW = (v / 100) * (w - margin*2 - 40);
    var c255 = v >= 85 ? [168,85,247] : v >= 70 ? [34,197,94] : v >= 55 ? [245,158,11] : [239,68,68];
    doc.setFillColor(48, 54, 61);
    doc.roundedRect(margin + 32, y, w - margin*2 - 40, 5, 1, 1, 'F');
    doc.setFillColor.apply(doc, c255);
    doc.roundedRect(margin + 32, y, Math.max(2, barW), 5, 1, 1, 'F');
    doc.setTextColor(139, 148, 158);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, y + 4);
    doc.setTextColor.apply(doc, c255);
    doc.setFont('helvetica', 'bold');
    doc.text(String(v), w - margin, y + 4, { align: 'right' });
    y += 10;
  });

  // Metrics
  y += 4;
  doc.setTextColor(72, 79, 88);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('KEY METRICS', margin, y);
  y += 6;

  var metrics = session.metrics || {};
  var mKeys = Object.keys(metrics).filter(function(k) { return metrics[k] !== null && metrics[k] !== undefined; });
  mKeys.forEach(function(k, idx) {
    if (idx > 0 && idx % 2 === 0) y += 9;
    var isLeft = idx % 2 === 0;
    var x = isLeft ? margin : w/2 + 5;
    var label = k.replace(/([A-Z])/g, ' $1').replace(/^./, function(s) { return s.toUpperCase(); });
    doc.setTextColor(139, 148, 158);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(label.slice(0, 18), x, y);
    doc.setTextColor(230, 237, 243);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(String(metrics[k]), x, y + 5);
    if (!isLeft) y += 0;
  });
  if (mKeys.length > 0) y += 12;

  // ICC check
  if (session.iccCheck) {
    y += 4;
    var ic = session.iccCheck;
    var icColor = ic.status === 'legal' ? [22,163,74] : ic.status === 'borderline' ? [245,158,11] : [220,38,38];
    doc.setFillColor(22, 27, 34);
    doc.setDrawColor.apply(doc, icColor);
    doc.roundedRect(margin, y, w - margin*2, 18, 3, 3, 'FD');
    doc.setTextColor.apply(doc, icColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ICC Legal Action Assessment: ' + ic.status.toUpperCase() + ' (' + ic.angle + '°)', margin + 5, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(139, 148, 158);
    doc.text('Elbow extension angle: ' + ic.angle + '°  |  ICC legal limit: 15°', margin + 5, y + 13);
    y += 24;
  }

  // Coaching feedback
  if (session.feedback && session.feedback.length) {
    y += 4;
    doc.setTextColor(72, 79, 88);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('COACHING FEEDBACK — MIE Intelligence™', margin, y);
    y += 6;
    session.feedback.slice(0, 4).forEach(function(fb) {
      var lines = doc.splitTextToSize(fb.text || String(fb), w - margin*2 - 8);
      doc.setFillColor(22, 27, 34);
      doc.setDrawColor(48, 54, 61);
      doc.roundedRect(margin, y, w - margin*2, lines.length * 4.5 + 5, 2, 2, 'FD');
      doc.setTextColor(201, 209, 217);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(lines, margin + 4, y + 4.5);
      y += lines.length * 4.5 + 9;
      if (y > 260) { doc.addPage(); y = 20; }
    });
  }

  // Footer
  doc.setTextColor(72, 79, 88);
  doc.setFontSize(7);
  doc.text('SmartCrick ProVision™ · Elite Cricket Performance Intelligence · ' + new Date().getFullYear(), w/2, 285, { align: 'center' });

  doc.save('SmartCrick-ProVision-' + session.mode + '-' + session.date + '.pdf');
}

// ── Main Results Page ─────────────────────────────────────────────
function VideoResultsPage({ session, videoUrl, onRetry, onClose }) {
  var [viewingSession, setViewingSession] = useState(session);
  var [xpShown, setXpShown] = useState(false);
  var user = A.DB ? A.DB.getUser() : {};

  useEffect(function() {
    if (xpShown || !session || !A.DB) return;
    setXpShown(true);
    var baseXP = 75;
    var bonus = session.score >= 85 ? 50 : session.score >= 70 ? 25 : session.score >= 55 ? 10 : 0;
    A.DB.addXPEntry(baseXP + bonus, 'video_analysis');
    window.dispatchEvent(new CustomEvent('sc_update'));
    if (session.score >= 85 && window.confetti) {
      window.confetti({ particleCount: 80, spread: 70, origin: { y: 0.4 } });
    }
  }, [session]);

  var s = viewingSession;
  if (!s) return null;

  var pColor = scoreColor(s.score);
  var modeLabel = s.mode ? s.mode.charAt(0).toUpperCase() + s.mode.slice(1) : '';

  return h('div', { style: { minHeight: '100vh', background: '#0d1117', paddingBottom: '7rem', color: '#e6edf3' } },

    // Header
    h('div', { style: { padding: '16px 16px 0', display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: '1px solid rgba(48,54,61,0.7)', paddingBottom: 14 } },
      h('button', { onClick: onClose || function() { A.nav('VideoAnalysis'); },
        style: { background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 22, lineHeight: 1 } }, '←'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 11, color: '#7c3aed', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' } }, 'ProVision™ Analysis'),
        h('div', { style: { fontSize: 16, fontWeight: 800, color: '#f0fdf4' } }, modeLabel + ' Report')
      ),
      h('button', { onClick: function() { generatePDFReport(s); },
        style: { padding: '8px 14px', borderRadius: 8, background: 'rgba(124,58,237,0.15)',
          border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: 'pointer' } },
        'Export PDF')
    ),

    h('div', { style: { padding: '0 16px' } },

      // Hero Score Card
      h('div', { style: { margin: '16px 0', padding: '20px', borderRadius: 14,
        background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        border: '1px solid rgba(124,58,237,0.3)', textAlign: 'center' } },
        h('div', { style: { fontSize: 11, color: '#a78bfa', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 8 } }, 'ProVision™ Technique Score'),
        h('div', { style: { fontSize: 72, fontWeight: 900, color: pColor, lineHeight: 1,
          fontFamily: "'Rajdhani', sans-serif" } }, s.score),
        h('div', { style: { fontSize: 16, fontWeight: 700, color: pColor, marginTop: 4 } }, gradeLabel(s.score)),
        s.shotLabel && h('div', { style: { marginTop: 8, fontSize: 13, color: '#c4b5fd',
          padding: '4px 12px', borderRadius: 20, background: 'rgba(124,58,237,0.2)', display: 'inline-block' } },
          'Detected: ' + s.shotLabel),
        s.actionInfo && h('div', { style: { marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 } },
          h('div', { style: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 6,
            fontSize: 11, fontWeight: 700,
            background: s.actionDetected ? 'rgba(22,163,74,0.12)' : 'rgba(245,158,11,0.12)',
            color: s.actionDetected ? '#4ade80' : '#fbbf24',
            border: '1px solid ' + (s.actionDetected ? 'rgba(22,163,74,0.25)' : 'rgba(245,158,11,0.25)') } },
            s.actionDetected ? '🎯 ' : '⚠ ', s.actionInfo)
        ),
        h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 8 } },
          'Powered by CricketIQ™ Scoring Algorithm  ·  ' + s.backend + ' backend  ·  ' + s.frames + ' frames')
      ),

      // 4 sub-score dials
      h('div', { style: { display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', margin: '16px 0' } },
        Object.entries(s.subScores || {}).map(function(entry) {
          var key = entry[0], val = entry[1];
          var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function(c){ return c.toUpperCase(); });
          return h(GaugeDial, { key: key, score: val, label: label });
        })
      ),

      // ICC Badge for bowling
      h(ICCBadge, { iccCheck: s.iccCheck }),

      // Phase breakdown
      h(PhaseBar, { subScores: s.subScores, mode: s.mode }),

      // Comparison
      h(ComparisonBar, { session: s }),

      // Skeleton replay
      h(SkeletonReplayViewer, { session: s, videoUrl: videoUrl }),

      // Key metrics grid
      h(MetricCards, { metrics: s.metrics, mode: s.mode }),

      // Coaching feedback
      h(FeedbackPanel, { feedback: s.feedback, linkedDrills: s.linkedDrills }),

      // Session history
      h(SessionHistoryList, { currentSession: s, mode: s.mode, onViewSession: setViewingSession }),

      // Injury risk (bowling)
      s.injuryRisk !== null && s.injuryRisk !== undefined && h('div', { style: { marginTop: 16,
        padding: '12px 16px', borderRadius: 10, background: 'rgba(22,27,34,0.7)',
        border: '1px solid rgba(48,54,61,0.7)' } },
        h('div', { style: { fontSize: 11, color: '#484f58', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', marginBottom: 6 } }, 'Load Management Index'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          h('div', { style: { fontSize: 24, fontWeight: 800,
            color: s.injuryRisk <= 3 ? '#22c55e' : s.injuryRisk <= 6 ? '#f59e0b' : '#ef4444' } },
            s.injuryRisk + '/10'),
          h('div', { style: { flex: 1, fontSize: 12, color: '#8b949e' } },
            s.injuryRisk <= 3 ? 'Low risk. Continue normal training load.' :
            s.injuryRisk <= 6 ? 'Moderate load. Monitor cumulative delivery count.' :
            'High load detected. Schedule rest day and technique review.')
        )
      ),

      // Retry button
      h('button', { onClick: onRetry || function() { A.nav('VideoAnalysis'); },
        style: { width: '100%', marginTop: 24, padding: '14px', borderRadius: 12,
          background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)',
          color: '#a78bfa', fontSize: 14, fontWeight: 700, cursor: 'pointer' } },
        'Analyse Another Video')
    )
  );
}

// Export
Object.assign(A, {
  VideoResultsPage: VideoResultsPage,
  generatePDFReport: generatePDFReport,
  GaugeDial: GaugeDial,
});

console.log('[SC] app-video-results ready — ProVision™ Results Engine v1.0');
})();
