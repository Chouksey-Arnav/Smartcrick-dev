// app-intelligence-digest.js v1.0
// ================================================================
// SmartCrick — Weekly Intelligence Digest (Module D)
// Auto-generates 3 insight bullets every Monday (or first open of week).
// Registers: A.IntelligenceDigestCard
// ================================================================
(function () {
'use strict';

var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var A         = window.SC_APP;
var DB        = A.DB;

var DIGEST_KEY = 'intel_digest';

// ── Week key (Monday's date string) ───────────────────────────────
function getWeekKey() {
  var d   = new Date();
  var dow = d.getDay();
  var mon = new Date(d);
  mon.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return mon.toISOString().slice(0, 10);
}

// ── Bullet generation ──────────────────────────────────────────────
function generateBullets() {
  var intel = window.SC_INTEL;
  if (!intel) return [];

  var p   = intel.getProfile();
  var cal = p.calibration;
  if (cal.total_cycles < 3) return [];

  var bullets = [];

  // How many cycles accumulated
  bullets.push(
    cal.total_cycles + ' training interaction' + (cal.total_cycles !== 1 ? 's' : '') +
    ' recorded — your AI model is growing stronger every session'
  );

  // Preference signals
  if (cal.preference_signals > 0) {
    bullets.push(
      cal.preference_signals + ' preference signal' + (cal.preference_signals !== 1 ? 's' : '') +
      ' collected — drill recommendations are now more accurate for you'
    );
  }

  // Peak hour if known
  if (p.patterns.peak_hour !== null && cal.total_cycles >= 10) {
    bullets.push('Peak performance window identified: ' + intel.formatHour(p.patterns.peak_hour));
  }

  // Top category
  if (cal.total_cycles >= 5) {
    var topCat   = intel.getTopCategory(p.drill_affinity.category);
    var catLabel = topCat.charAt(0).toUpperCase() + topCat.slice(1);
    bullets.push(catLabel + ' drills are trending up in your intelligence profile');
  }

  // Match data
  if (cal.performance_data_points > 0) {
    bullets.push(
      cal.performance_data_points + ' match data point' + (cal.performance_data_points !== 1 ? 's' : '') +
      ' linked to your training intelligence'
    );
  }

  // Biomechanical
  if (cal.biomechanical_analyses > 0) {
    bullets.push(
      'ProVision™ has contributed ' + cal.biomechanical_analyses +
      ' biomechanical data point' + (cal.biomechanical_analyses !== 1 ? 's' : '') + ' to your profile'
    );
  }

  // Days of data
  if (cal.days_of_behavioral_data >= 7) {
    bullets.push(
      'Your AI has ' + cal.days_of_behavioral_data + ' days of behavioral history — ' +
      (cal.days_of_behavioral_data >= 30 ? 'deep personalization is now active' : 'patterns are beginning to emerge')
    );
  }

  return bullets.slice(0, 3);
}

// ── Get or generate this week's digest ────────────────────────────
function getOrCreateDigest() {
  var weekKey = getWeekKey();
  var saved   = DB.get(DIGEST_KEY);

  if (saved && saved.weekKey === weekKey) return saved;

  // Generate fresh digest for this week
  var bullets = generateBullets();
  if (!bullets.length) return null;

  var digest = { weekKey: weekKey, bullets: bullets, dismissed: false, ts: Date.now() };
  DB.set(DIGEST_KEY, digest);
  return digest;
}

function dismissDigest() {
  var saved = DB.get(DIGEST_KEY) || {};
  DB.set(DIGEST_KEY, Object.assign({}, saved, { dismissed: true }));
}

// ── React Component ────────────────────────────────────────────────
function IntelligenceDigestCard() {
  var [digest,  setDigest]  = useState(null);
  var [visible, setVisible] = useState(false);

  useEffect(function () {
    var d = getOrCreateDigest();
    if (d && !d.dismissed && d.bullets && d.bullets.length) {
      setDigest(d);
      setVisible(true);
    }
  }, []);

  if (!visible || !digest) return null;

  function handleDismiss() {
    dismissDigest();
    setVisible(false);
  }

  return h('div', {
    style: {
      margin:'0 16px 12px', padding:'14px 16px', borderRadius:14,
      background:'linear-gradient(135deg,rgba(13,148,136,0.10),rgba(22,163,74,0.07))',
      border:'1px solid rgba(13,148,136,0.28)',
      animation:'scDigestIn 0.35s cubic-bezier(0.16,1,0.3,1)',
    }
  },
    h('style', null, '@keyframes scDigestIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}'),

    // Header
    h('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 } },
      h('div', { style: { display:'flex', alignItems:'center', gap:8 } },
        h('div', { style: { fontSize:15 } }, '🧠'),
        h('div', { style: { fontSize:13, fontWeight:700, color:'#f0fdf4' } }, 'This Week in AI Intelligence')
      ),
      h('button', {
        onClick:     handleDismiss,
        'aria-label':'Dismiss weekly digest',
        style: { background:'none', border:'none', color:'#4b5563', fontSize:18, cursor:'pointer', padding:'0 2px', lineHeight:1, fontFamily:'inherit' }
      }, '×')
    ),

    // Bullets
    h('div', { style: { display:'flex', flexDirection:'column', gap:6, marginBottom:10 } },
      digest.bullets.map(function (bullet, i) {
        return h('div', { key:i, style: { display:'flex', gap:8, alignItems:'flex-start' } },
          h('div', { 'aria-hidden':'true', style: { width:5, height:5, borderRadius:'50%', background:'#16a34a', marginTop:7, flexShrink:0 } }),
          h('div', { style: { fontSize:12, color:'#9ca3af', lineHeight:1.55 } }, bullet)
        );
      })
    ),

    // CTA
    h('button', {
      onClick: function () { if (A && A.nav) A.nav('IntelligenceHub'); },
      style: { background:'none', border:'none', color:'#16a34a', fontSize:12, fontWeight:700, cursor:'pointer', padding:0, fontFamily:'inherit' }
    }, 'View Full Intelligence Profile →')
  );
}

// ── Register ───────────────────────────────────────────────────────
A.IntelligenceDigestCard = IntelligenceDigestCard;

console.log('[SC] app-intelligence-digest v1.0 — Weekly Digest ready');
})();
