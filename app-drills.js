// ================================================================
// SmartCrick — Cricket Drills v6.0
// UI layer — reads A.DRILLS from app-drills-data.js
// Videos via A.getVideoForDrill from app-drill-video-map.js
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A    = window.SC_APP;
var DB   = A.DB;
var nav  = A.nav;
var awardXP = A.awardXP;

// ── PROFESSIONAL ICON HELPER ─────────────────────────────────────
// Renders a crisp line icon from the shared A.IC registry (Lucide-style),
// replacing emojis everywhere for a clean, training-platform aesthetic.
function Ic(name, size, color, extra) {
  if (!A.Icon) return null;
  return h(A.Icon, {
    n: name,
    cls: '',
    style: Object.assign({
      width: size || 16, height: size || 16,
      color: color || '#9ca3af', flexShrink: 0,
    }, extra || {}),
  });
}

// ── DRILL NORMALISER ─────────────────────────────────────────────
function normDrill(d) {
  var dur = d.duration;
  if (typeof dur === 'number') dur = dur + ' min';
  else if (!dur && d.duration_minutes) dur = d.duration_minutes + ' min';
  else if (!dur) dur = '15 min';

  // Resolve video via the video-map (covers all 500 drills)
  var vid = A.getVideoForDrill ? A.getVideoForDrill(d) : null;
  var videoId = (vid && vid.videoId) || d.videoId || d.video_id || '';
  var videoTitle = (vid && vid.title) || d.videoTitle || '';
  var videoChannel = (vid && vid.channel) || d.videoChannel || '';

  return {
    id: d.id || '',
    name: d.name || d.title || '',
    category: d.category || 'batting',
    subCategory: d.subCategory || '',
    level: d.level || d.skill_level || 'beginner',
    duration: dur,
    durationMinutes: (typeof d.duration === 'number' ? d.duration : parseInt(dur) || 15),
    xp: d.xp || d.xp_value || 50,
    emoji: d.emoji || d.icon || '🏏',
    problem: d.problem || d.tagline || d.description || '',
    whyItMatters: d.whyItMatters || '',
    baseline: d.baseline || '',
    measurement: d.measurement || '',
    masteryThreshold: d.masteryThreshold || '',
    appMechanic: d.appMechanic || 'shadow-trigger',
    appMechanicConfig: d.appMechanicConfig || { reps: 20 },
    videoId: videoId,
    videoTitle: videoTitle,
    videoChannel: videoChannel,
    outcome: d.outcome || '',
    fit: d.fit || { roles: ['all'], goals: ['all'], ages: ['all'], phases: ['all'], surfaces: ['all'], formats: ['all'] },
    steps: d.steps || [],
    keyFocus: d.keyFocus || (d.keyPoints && d.keyPoints[0]) || '',
    commonError: d.commonError || (d.commonMistakes && d.commonMistakes[0]) || '',
    equipment: d.equipment || [],
    tagline: d.tagline || d.problem || '',
    focus: d.focus || [],
    keyPoints: d.keyPoints || (d.keyFocus ? [d.keyFocus] : []),
    commonMistakes: d.commonMistakes || (d.commonError ? [d.commonError] : []),
    _pickReason: d._pickReason || '',
  };
}

// ── MECHANIC INFO ────────────────────────────────────────────────
var MECHANIC_INFO = {
  'shadow-trigger':       { label: 'Shadow Drill',    icon: 'user',      desc: 'Mirror & video technique feedback' },
  'phase-timer':          { label: 'Phase Timer',     icon: 'timer',     desc: 'Timed phases with targets' },
  'audio-cue-randomizer': { label: 'Audio React',     icon: 'mic',       desc: 'React to random audio cues' },
  'lives-game':           { label: 'Lives Game',      icon: 'heart',     desc: 'Limited attempts per session' },
  'adaptive-difficulty':  { label: 'Adaptive',        icon: 'chartLine', desc: 'Auto-adjusts to your level' },
  'decision-tracker':     { label: 'Decision Track',  icon: 'brain',     desc: 'Track decisions per ball' },
  'form-video-upload':    { label: 'Video Review',    icon: 'video',     desc: 'Record & review your form' },
  'score-vs-feeder':      { label: 'Score Attack',    icon: 'trophy',    desc: 'Score points vs. feeder' },
  'streak-multiplier':    { label: 'Streak Bonus',    icon: 'flame',     desc: 'Multiplier for consecutive hits' },
  'simulation-script':    { label: 'Match Sim',       icon: 'target',    desc: 'Scripted match scenario' },
  'breathwork-overlay':   { label: 'Breathwork',      icon: 'wind',      desc: 'Guided breathing with activity' },
  'biomech-overlay':      { label: 'Biomechanics',    icon: 'activity',  desc: 'Biomechanical checkpoints' },
  'bowler-tracker':       { label: 'Bowl Track',      icon: 'crosshair', desc: 'Track bowling metrics per ball' },
  'partner-call-mode':    { label: 'Partner Calls',   icon: 'mic',       desc: 'Partner calls random cues' },
  'trigger-word-loop':    { label: 'Trigger Word',    icon: 'repeat',    desc: 'Loop a focus cue while practising' },
  'field-set-overlay':    { label: 'Field Overlay',   icon: 'navigation',desc: 'Field placement visualisation' },
  'dna-mirror':           { label: 'DNA Mirror',      icon: 'sparkles',  desc: 'Match your DNA archetype' },
};

// ── CATEGORIES ────────────────────────────────────────────────────
var CATS = {
  all:           { label: 'All',      icon: 'grid',       color: '#9ca3af', bg: 'rgba(75,85,99,0.15)' },
  batting:       { label: 'Batting',  icon: 'bat',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  bowling:       { label: 'Bowling',  icon: 'ball',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  fielding:      { label: 'Fielding', icon: 'field',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  wicketkeeping: { label: 'Keeping',  icon: 'glove',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  partnership:   { label: 'Partnership', icon: 'user',    color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  fitness:       { label: 'Fitness',  icon: 'dumbbell',   color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  mental:        { label: 'Mental',   icon: 'brain',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
};

var LEVEL_COLORS = {
  beginner:     { bg: 'rgba(34,197,94,0.15)',  text: '#4ade80' },
  intermediate: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24' },
  advanced:     { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  expert:       { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa' },
};

// Coach messages per category shown in celebration
var COACH_MESSAGES = {
  batting: [
    'Your muscle memory is building with every rep. That drive will flow naturally soon.',
    'Repetition is the mother of skill. Your timing improves with each session.',
    'Elite batters earn their technique through exactly this kind of focused work.',
    'You just invested in your future innings. That work shows up when the pressure is on.',
  ],
  bowling: [
    'Consistent action grooves consistent results. You\'re building match-winning habits.',
    'The best bowlers in the world earn their wickets in practice. You\'re doing it right.',
    'Your release point just got a little cleaner. Keep chasing perfection.',
    'That drill is what separates good bowlers from great ones. You chose the harder path.',
  ],
  fielding: [
    'Every dropped catch you prevent in a match starts with sessions like this.',
    'Fielding wins games. You just got better at winning games.',
    'Your hands are learning. Your feet are learning. It adds up faster than you think.',
    'The best fielders make it look effortless because of the effort they put in like this.',
  ],
  wicketkeeping: [
    'Keepers win and lose matches behind the stumps. You\'re investing in wins.',
    'Glove work this clean is what separates district keepers from state keepers.',
    'Your reflexes are sharpening. The stumping you nearly missed will become instinct.',
    'Great keepers are built in practice. You just put one more brick in place.',
  ],
  partnership: [
    'Partnerships win matches. The calls and trust you build here show up when it matters most.',
    'Great pairs are made in practice, not in the middle. You just strengthened yours.',
    'Running well together is a skill — and you just sharpened it.',
    'The best partnerships talk constantly. You\'re building that habit right now.',
  ],
  fitness: [
    'Cricket fitness is an edge most players ignore. You\'re building an advantage.',
    'The last over of a long innings — that\'s where your fitness shows up. Good work.',
    'Your body is getting cricket-ready. That\'s a weapon you carry onto every pitch.',
    'Consistency in conditioning is a professional habit. You\'re thinking like a pro.',
  ],
  mental: [
    'The mental game is what separates players of similar physical ability. You\'re investing in it.',
    'Every elite cricketer has a mental routine. You\'re building yours.',
    'Pressure is privilege. You\'re training to embrace it, not avoid it.',
    'Your mind is a muscle. This session just made it stronger.',
  ],
};

function getCoachMessage(category) {
  var msgs = COACH_MESSAGES[category] || COACH_MESSAGES.batting;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function formatTime(seconds) {
  var m = Math.floor(seconds / 60);
  var s = seconds % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

// ── MECHANIC BADGE ────────────────────────────────────────────────
function MechanicBadge(props) {
  var info = MECHANIC_INFO[props.mechanic] || { label: props.mechanic, icon: 'settings' };
  return h('span', { style: {
    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.25)', whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: 4,
  }}, Ic(info.icon || 'settings', 11, '#a78bfa'), info.label);
}

// ── CATEGORY ICON TILE ───────────────────────────────────────────
// A premium gradient tile that carries the category's line icon —
// the visual signature used across cards, hero and commit screens.
function CatTile(props) {
  var cat  = CATS[props.category] || CATS.all;
  var size = props.size || 44;
  var icon = props.iconSize || Math.round(size * 0.5);
  return h('div', { style: {
    width: size, height: size, borderRadius: Math.round(size * 0.28),
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(140deg, ' + cat.color + '2e, ' + cat.color + '12)',
    border: '1px solid ' + cat.color + '44',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
  }}, Ic(cat.icon, icon, cat.color));
}

// ── VIDEO PLAYER (inline, click to embed) ────────────────────────
function VideoPlayer(props) {
  var drill = props.drill;
  var [show, setShow] = useState(false);
  if (!drill.videoId || drill.videoId === 'PLACEHOLDER') {
    return h('div', { style: { padding: '14px 0', color: '#6b7280', fontSize: 13, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 } },
      Ic('video', 16, '#6b7280'), 'Technique video coming soon'
    );
  }
  if (!show) {
    var thumb = 'https://img.youtube.com/vi/' + drill.videoId + '/mqdefault.jpg';
    return h('div', {
      style: { position: 'relative', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: '#000' },
      onClick: function() { setShow(true); }
    },
      h('img', { src: thumb, style: { width: '100%', display: 'block', opacity: 0.85 }, alt: drill.videoTitle }),
      h('div', { style: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 60, height: 60, borderRadius: '50%', background: 'rgba(220,38,38,0.95)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 24px rgba(220,38,38,0.6)',
      }},
        Ic('play', 24, '#fff', { marginLeft: 3 })
      ),
      drill.videoTitle && h('div', { style: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
        color: '#fff', fontSize: 12, fontWeight: 600,
      }}, drill.videoTitle),
      drill.videoChannel && h('div', { style: {
        position: 'absolute', top: 10, right: 10, padding: '3px 8px',
        background: 'rgba(0,0,0,0.7)', borderRadius: 6, color: '#e5e7eb', fontSize: 10,
      }}, drill.videoChannel)
    );
  }
  return h('div', { style: { position: 'relative', paddingBottom: '56.25%', borderRadius: 12, overflow: 'hidden' } },
    h('iframe', {
      src: 'https://www.youtube.com/embed/' + drill.videoId + '?autoplay=1&rel=0&modestbranding=1',
      style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
      allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
      allowFullScreen: true,
    })
  );
}

// ── BACKGROUND AMBIENT VIDEO ─────────────────────────────────────
function BackgroundAmbientVideo(props) {
  var category = props.category || 'batting';
  var [hidden, setHidden] = useState(false);
  var ambientMap = (A.AMBIENT_VIDEOS) || {};
  var videoId = ambientMap[category] || ambientMap.batting || '';

  if (hidden || !videoId) return null;

  return h('div', { style: { position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' } },
    // YouTube iframe — muted, looping, no controls
    h('div', { style: { position: 'absolute', inset: 0, overflow: 'hidden' } },
      h('iframe', {
        src: 'https://www.youtube.com/embed/' + videoId
          + '?autoplay=1&mute=1&loop=1&controls=0&disablekb=1&modestbranding=1&rel=0&playlist=' + videoId
          + '&start=0&iv_load_policy=3&fs=0',
        style: {
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%,-50%) scale(1.5)',
          width: '100%', height: '100%',
          border: 'none', pointerEvents: 'none',
        },
        allow: 'autoplay; encrypted-media',
        title: 'background',
      })
    ),
    // Dark overlay — ensures text readability
    h('div', { style: {
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, rgba(13,17,23,0.88) 0%, rgba(13,17,23,0.80) 60%, rgba(13,17,23,0.92) 100%)',
    } }),
    // Hide button — pointer-events enabled for this element only
    h('button', {
      onClick: function() { setHidden(true); },
      style: {
        position: 'absolute', top: 12, right: 12, zIndex: 1,
        background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 8, color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600,
        padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit',
        pointerEvents: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5,
        backdropFilter: 'blur(4px)',
      },
    }, Ic('x', 12, 'rgba(255,255,255,0.5)'), 'Hide Video')
  );
}

// ── DRILL COMMIT SCREEN ───────────────────────────────────────────
// Phase 1: User must commit before the timer starts and detail is shown
function DrillCommitScreen(props) {
  var drill    = props.drill;
  var onBack   = props.onBack;
  var onCommit = props.onCommit;
  var cat = CATS[drill.category] || CATS.all;

  return h('div', { style: {
    position: 'fixed', inset: 0, zIndex: 100,
    background: 'rgba(13,17,23,0.97)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px', textAlign: 'center',
    fontFamily: 'system-ui,sans-serif',
  }},
    h('div', { style: { marginBottom: 18, display: 'flex', justifyContent: 'center' } },
      h(CatTile, { category: drill.category, size: 76, iconSize: 38 })
    ),
    h('div', { style: {
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
      color: cat.color, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
    }}, Ic(cat.icon, 13, cat.color), cat.label + ' Drill'),
    h('div', { style: {
      fontSize: 26, fontWeight: 900, color: '#f0fdf4', marginBottom: 10, lineHeight: 1.25, maxWidth: 420,
    }}, drill.name),
    h('div', { style: {
      fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 380, marginBottom: 8,
    }}, drill.problem),
    h('div', { style: { display: 'flex', gap: 18, justifyContent: 'center', marginBottom: 28 } },
      h('span', { style: { fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 5 } }, Ic('clock', 13, '#64748b'), drill.duration),
      h('span', { style: { fontSize: 12, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 5 } }, Ic('zap', 13, '#fbbf24'), drill.xp + ' XP on completion')
    ),
    // Commitment CTA
    h('button', {
      onClick: onCommit,
      style: {
        padding: '16px 36px', borderRadius: 14, border: 'none',
        background: 'linear-gradient(135deg, ' + cat.color + ', ' + cat.color + 'bb)',
        color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer',
        boxShadow: '0 0 32px ' + cat.color + '44',
        fontFamily: 'inherit', letterSpacing: '0.01em',
        marginBottom: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
        width: '100%', maxWidth: 360,
      },
    }, Ic('play', 17, '#fff'), 'Start Drill — I\'m Committed'),
    h('button', {
      onClick: onBack,
      style: {
        padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
        background: 'transparent', color: '#64748b', fontSize: 14, cursor: 'pointer',
        fontFamily: 'inherit', width: '100%', maxWidth: 360,
      },
    }, 'Not Now')
  );
}

// ── REFLECTION MODAL ─────────────────────────────────────────────
// Phase 3: Collect meaningful reflection before awarding XP
var FEELINGS = [
  { id: 'strong',    label: 'Strong',     icon: 'dumbbell', bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  { id: 'focused',   label: 'Focused',    icon: 'target',   bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  { id: 'challenged',label: 'Challenged', icon: 'flame',    bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24' },
  { id: 'confident', label: 'Confident',  icon: 'check',    bg: 'rgba(139,92,246,0.15)',  color: '#a78bfa' },
  { id: 'pumped',    label: 'Pumped',     icon: 'zap',      bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
];

function ReflectionModal(props) {
  var drill      = props.drill;
  var onClaim    = props.onClaim; // (rating, feeling, note) => void
  var [rating,   setRating]   = useState(0);
  var [feeling,  setFeeling]  = useState('');
  var [note,     setNote]     = useState('');
  var [hovered,  setHovered]  = useState(0);

  var canClaim = rating > 0 && feeling !== '';

  return h('div', { style: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'rgba(9,13,20,0.97)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px', fontFamily: 'system-ui,sans-serif',
  }},
    h('div', { style: { width: '100%', maxWidth: 440 } },
      h('div', { style: { textAlign: 'center', marginBottom: 24 } },
        h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
          h('div', { style: {
            width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(140deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))',
            border: '1px solid rgba(34,197,94,0.4)',
          }}, Ic('circleCheck', 30, '#4ade80'))
        ),
        h('div', { style: { fontSize: 22, fontWeight: 900, color: '#f0fdf4', marginBottom: 6 } },
          'Drill Done — Great Work!'
        ),
        h('div', { style: { fontSize: 14, color: '#64748b' } },
          'Tell us how it went to claim your XP'
        )
      ),

      // Star rating
      h('div', { style: { background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '18px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' } },
        h('div', { style: { fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 } },
          'How was this drill session?'
        ),
        h('div', { style: { display: 'flex', gap: 10, justifyContent: 'center' } },
          [1,2,3,4,5].map(function(n) {
            var active = n <= (hovered || rating);
            return h('button', {
              key: n,
              onClick: function() { setRating(n); },
              onMouseEnter: function() { setHovered(n); },
              onMouseLeave: function() { setHovered(0); },
              style: {
                background: 'none', border: 'none', padding: 0, lineHeight: 0,
                cursor: 'pointer', opacity: active ? 1 : 0.35,
                transform: active ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.12s',
                filter: active ? 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' : 'none',
              },
            }, Ic('star', 32, active ? '#fbbf24' : '#475569'));
          })
        )
      ),

      // Feeling selector
      h('div', { style: { background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '18px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.07)' } },
        h('div', { style: { fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 } },
          'How are you feeling?'
        ),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8 } },
          FEELINGS.map(function(f) {
            var active = feeling === f.id;
            return h('button', {
              key: f.id,
              onClick: function() { setFeeling(f.id); },
              style: {
                padding: '9px 14px', borderRadius: 10,
                background: active ? f.bg : 'rgba(255,255,255,0.04)',
                border: active ? ('1px solid ' + f.color + '55') : '1px solid rgba(255,255,255,0.07)',
                color: active ? f.color : '#6b7280',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
                transform: active ? 'scale(1.04)' : 'scale(1)',
              },
            }, Ic(f.icon, 14, active ? f.color : '#6b7280'), f.label);
          })
        )
      ),

      // Optional note
      h('div', { style: { background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: '18px', marginBottom: 20, border: '1px solid rgba(255,255,255,0.07)' } },
        h('div', { style: { fontSize: 12, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 } },
          'Biggest win today? (optional)'
        ),
        h('input', {
          value: note,
          onChange: function(e) { setNote(e.target.value); },
          placeholder: 'e.g. Kept my head still on 8/10 drives…',
          style: {
            width: '100%', boxSizing: 'border-box',
            background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '10px 14px', color: '#e2e8f0',
            fontSize: 14, outline: 'none', fontFamily: 'inherit',
          },
        })
      ),

      // Claim button
      h('button', {
        onClick: function() { if (canClaim) onClaim(rating, feeling, note); },
        disabled: !canClaim,
        style: {
          width: '100%', padding: '16px', borderRadius: 12, border: 'none',
          background: canClaim
            ? 'linear-gradient(135deg, #16a34a, #15803d)'
            : 'rgba(255,255,255,0.06)',
          color: canClaim ? '#fff' : '#374151',
          fontSize: 16, fontWeight: 800, cursor: canClaim ? 'pointer' : 'default',
          fontFamily: 'inherit', letterSpacing: '0.02em',
          transition: 'all 0.2s',
          boxShadow: canClaim ? '0 0 24px rgba(22,163,74,0.4)' : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        },
      }, canClaim ? [h('span', { key: 't' }, 'Claim Your XP'), Ic('chevR', 16, '#fff')] : 'Rate your session & select a feeling')
    )
  );
}

// ── CELEBRATION SCREEN ────────────────────────────────────────────
function CelebrationScreen(props) {
  var drill       = props.drill;
  var xpEarned    = props.xpEarned;
  var streak      = props.streak;
  var multiplier  = props.multiplier;
  var nextDrill   = props.nextDrill;
  var onDone      = props.onDone;
  var [popped, setPopped] = useState(false);

  useEffect(function() {
    var t = setTimeout(function() { setPopped(true); }, 80);
    return function() { clearTimeout(t); };
  }, []);

  var cat = CATS[drill.category] || CATS.all;
  var coachMsg = getCoachMessage(drill.category);

  function handleShare() {
    var text = 'Just completed "' + drill.name + '" on SmartCrick and earned ' + xpEarned + ' XP. Getting better every day.';
    if (navigator.share) {
      navigator.share({ text: text }).catch(function(){});
    } else {
      try { navigator.clipboard.writeText(text); } catch(e){}
      // Subtle feedback
      var btn = document.getElementById('sc-share-btn');
      if (btn) { btn.textContent = 'Copied to clipboard'; setTimeout(function(){ btn.textContent = 'Share Your Win'; }, 2000); }
    }
  }

  return h('div', { style: {
    position: 'fixed', inset: 0, zIndex: 200,
    background: 'radial-gradient(ellipse at center top, rgba(22,163,74,0.18) 0%, rgba(13,17,23,0.98) 60%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '24px', fontFamily: 'system-ui,sans-serif', overflowY: 'auto',
  }},
    h('div', { style: { width: '100%', maxWidth: 440, textAlign: 'center' } },
      // Animated XP
      h('div', { style: {
        fontSize: 72, fontWeight: 900, lineHeight: 1,
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        transform: popped ? 'scale(1)' : 'scale(0.4)',
        opacity: popped ? 1 : 0,
        transition: 'all 0.45s cubic-bezier(0.34,1.56,0.64,1)',
        marginBottom: 4,
      }}, '+' + xpEarned + ' XP'),

      multiplier > 1.0 && h('div', { style: {
        fontSize: 13, color: '#fbbf24', fontWeight: 700, marginBottom: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.3s',
      }}, Ic('flame', 14, '#fbbf24'), (multiplier * 100 - 100).toFixed(0) + '% Streak Bonus Applied'),

      h('div', { style: {
        fontSize: 28, fontWeight: 900, color: '#f0fdf4', marginBottom: 6,
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.2s',
      }}, 'Session Complete!'),

      // Streak badge
      streak >= 2 && h('div', { style: {
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 99, padding: '6px 14px', marginBottom: 20,
        color: '#fbbf24', fontSize: 13, fontWeight: 700,
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.35s',
      }},
        Ic('flame', 14, '#fbbf24'), streak + '-day streak — Keep it alive!'
      ),

      // Coach message
      h('div', { style: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 16, textAlign: 'left',
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.4s',
      }},
        h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 } }, Ic('mic', 12, '#6b7280'), 'Coach Says'),
        h('div', { style: { fontSize: 14, color: '#d1fae5', lineHeight: 1.6, fontStyle: 'italic' } }, '"' + coachMsg + '"')
      ),

      // Next drill preview
      nextDrill && h('div', { style: {
        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'left',
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.5s',
      }},
        h('div', { style: { fontSize: 10, color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 } }, Ic('chevronsRight', 12, '#60a5fa'), 'Up Next — Come Back Tomorrow'),
        h('div', { style: { fontSize: 14, color: '#bfdbfe', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 } }, Ic((CATS[nextDrill.category] || CATS.all).icon, 15, '#bfdbfe'), nextDrill.name),
        h('div', { style: { fontSize: 12, color: '#6b7280', marginTop: 3 } }, nextDrill.problem)
      ),

      // Action buttons
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.55s' } },
        h('button', {
          id: 'sc-share-btn',
          onClick: handleShare,
          style: {
            padding: '13px', borderRadius: 12, border: '1px solid rgba(59,130,246,0.3)',
            background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          },
        }, Ic('extLink', 15, '#60a5fa'), 'Share Your Win'),
        h('button', {
          onClick: onDone,
          style: {
            padding: '13px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 0 20px rgba(22,163,74,0.35)',
          },
        }, 'Back to Drills')
      )
    )
  );
}

// ── DRILL CARD ────────────────────────────────────────────────────
function DrillCard(props) {
  var drill       = props.drill;
  var onSelect    = props.onSelect;
  var isPick      = props.isPick;
  var pickReason  = props.pickReason || drill._pickReason || '';
  var completions = props.completions || {};
  var count       = completions[drill.id] || 0;
  var cat = CATS[drill.category] || CATS.all;
  var lvl = LEVEL_COLORS[drill.level] || LEVEL_COLORS.beginner;
  var hasVideo = !!(drill.videoId && drill.videoId !== 'PLACEHOLDER');

  return h('div', {
    onClick: function() { onSelect(drill); },
    className: 'sc-spring sc-ripple sc-cat-' + (drill.category || 'batting'),
    'data-category': drill.category || 'batting',
    style: {
      background: 'rgba(16,22,36,0.92)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 16,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 12px rgba(0,0,0,0.45)',
    },
    onMouseEnter: function(e) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.55)'; e.currentTarget.style.borderColor = cat.color + '44'; },
    onMouseLeave: function(e) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; },
  },
    // Category gradient strip
    h('div', { style: {
      height: 4,
      background: 'linear-gradient(90deg, ' + cat.color + ', ' + cat.color + '66)',
    } }),
    h('div', { style: { padding: '14px' } },
      // Top row — category tile + meta
      h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 10 } },
        h(CatTile, { category: drill.category, size: 42, iconSize: 21 }),
        h('div', { style: { flex: 1, minWidth: 0 } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 } },
            h('span', { style: { fontSize: 10, padding: '2px 8px', borderRadius: 99, background: lvl.bg, color: lvl.text, fontWeight: 700, textTransform: 'capitalize' } }, drill.level),
            h('span', { style: {
              fontSize: 10, padding: '2px 8px', borderRadius: 99,
              background: 'rgba(34,197,94,0.12)', color: '#4ade80', fontWeight: 700,
              border: '1px solid rgba(34,197,94,0.2)', display: 'inline-flex', alignItems: 'center', gap: 3,
            }}, Ic('zap', 11, '#4ade80'), drill.xp + ' XP')
          ),
          // Name
          h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 } }, drill.name)
        )
      ),
      isPick && pickReason && h('div', { style: {
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 99, marginBottom: 8,
        background: 'rgba(16,185,129,0.15)', color: '#34d399',
        border: '1px solid rgba(16,185,129,0.3)',
      }}, Ic('sparkles', 11, '#34d399'), pickReason),
      // Problem / description
      drill.problem && h('div', { style: {
        fontSize: 12.5, color: '#94a3b8', lineHeight: 1.55, marginTop: 2,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}, drill.problem),
      // Bottom badges
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 11, alignItems: 'center' } },
        h(MechanicBadge, { mechanic: drill.appMechanic }),
        h('span', { style: { fontSize: 11, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 3 } }, Ic('clock', 12, '#64748b'), drill.duration),
        h('span', { style: { fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: cat.bg, color: cat.color, display: 'inline-flex', alignItems: 'center', gap: 4 } }, Ic(cat.icon, 11, cat.color), cat.label),
        count > 0 && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
          background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
          border: '1px solid rgba(59,130,246,0.3)', display: 'inline-flex', alignItems: 'center', gap: 3,
        }}, Ic('check', 11, '#60a5fa'), count + 'x'),
        hasVideo && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
          background: 'rgba(220,38,38,0.12)', color: '#f87171',
          border: '1px solid rgba(220,38,38,0.25)', display: 'inline-flex', alignItems: 'center', gap: 3,
        }}, Ic('play', 10, '#f87171'), 'Video')
      ),
      // CTA
      h('button', {
        onClick: function(e) { e.stopPropagation(); onSelect(drill); },
        style: {
          width: '100%', padding: '11px', marginTop: 13,
          border: 'none', borderRadius: 10,
          background: cat.bg || 'rgba(34,197,94,0.12)',
          color: cat.color || '#22c55e',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.02em', fontFamily: 'inherit',
          transition: 'background 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }
      }, 'Start Drill', Ic('chevR', 14, cat.color || '#22c55e'))
    )
  );
}

// ── DRILL DETAIL PAGE ─────────────────────────────────────────────
function DrillDetailPage(props) {
  var drill    = props.drill;
  var onBack   = props.onBack;
  var allDrills = props.allDrills || [];

  // Phase management
  var [phase, setPhase] = useState('commit'); // 'commit' | 'active' | 'reflect' | 'celebrate'
  var [elapsedSec, setElapsedSec] = useState(0);
  var [xpEarned, setXpEarned]     = useState(0);
  var [streak, setStreak]         = useState(0);
  var [multiplier, setMultiplier] = useState(1.0);
  var timerRef = useRef(null);

  var p = DB.getProgress ? DB.getProgress() : {};
  var completions = (p.drill_completions || {});
  var count = completions[drill.id] || 0;

  var cat = CATS[drill.category] || CATS.all;
  var lvl = LEVEL_COLORS[drill.level] || LEVEL_COLORS.beginner;
  var mechInfo = MECHANIC_INFO[drill.appMechanic] || { label: drill.appMechanic, icon: 'settings', desc: '' };

  // Timer: starts when phase === 'active'
  useEffect(function() {
    if (phase !== 'active') return;
    timerRef.current = setInterval(function() {
      setElapsedSec(function(s) { return s + 1; });
    }, 1000);
    return function() { clearInterval(timerRef.current); };
  }, [phase]);

  var totalSec   = (drill.durationMinutes || 15) * 60;
  var pct        = Math.min(100, (elapsedSec / totalSec) * 100);
  var unlocked   = pct >= 70;
  var earlyAmber = pct >= 30 && pct < 70;

  // Remaining seconds to unlock
  var unlockAt   = Math.ceil(totalSec * 0.70);
  var remaining  = Math.max(0, unlockAt - elapsedSec);

  // Next drill suggestion (next in same category)
  var nextDrill = null;
  for (var i = 0; i < allDrills.length; i++) {
    if (allDrills[i].id === drill.id) {
      for (var j = i + 1; j < allDrills.length; j++) {
        if (allDrills[j].category === drill.category && allDrills[j].id !== drill.id) {
          nextDrill = allDrills[j]; break;
        }
      }
      break;
    }
  }

  function handleCommit() {
    setPhase('active');
  }

  function handleMarkComplete() {
    if (!unlocked) return;
    clearInterval(timerRef.current);
    setPhase('reflect');
  }

  function handleReflectionClaim(rating, feeling, note) {
    // Save reflection
    var prog = DB.getProgress ? DB.getProgress() : {};
    prog.drills_done = (prog.drills_done || 0) + 1;
    if (!prog.drill_completions) prog.drill_completions = {};
    prog.drill_completions[drill.id] = (prog.drill_completions[drill.id] || 0) + 1;
    if (!prog.drill_reflections) prog.drill_reflections = {};
    prog.drill_reflections[drill.id] = { rating: rating, feeling: feeling, note: note, date: new Date().toISOString() };
    if (DB.saveProgress) DB.saveProgress(prog);

    // Award XP
    var baseXP = Math.round(drill.xp * 1.25);
    var bonusXP = Math.round(baseXP * (rating >= 4 ? 0.2 : rating >= 3 ? 0.1 : 0)); // rating bonus
    var finalXP = baseXP + bonusXP;
    var mult = 1.0;
    if (awardXP) {
      try {
        // awardXP returns or updates XP with streak — get current streak for display
        awardXP(finalXP, 0, 'drill:' + drill.id, 'drill', drill.id, true);
        var freshProg = DB.getProgress ? DB.getProgress() : {};
        mult = freshProg.streak_multiplier || 1.0;
        var earnedFinal = Math.round(finalXP * mult);
        setXpEarned(earnedFinal);
        setStreak(freshProg.current_streak || 0);
        setMultiplier(mult);
      } catch(e) {
        setXpEarned(finalXP);
      }
    } else {
      setXpEarned(finalXP);
    }

    // Brain engine signal
    if (A.BrainEngine && A.BrainEngine.isModelTrained && A.BrainEngine.isModelTrained('DrillAdaptor')) {
      try {
        var sig = A.BrainEngine.buildDrillSignals(drill.id);
        A.BrainEngine.addSample('DrillAdaptor', sig, { shouldRetry: 0, shouldAdvance: 1, relevance_boost: 1 });
      } catch(e) {}
    }
    if (A.trackDrillForCardPack) try { A.trackDrillForCardPack(); } catch(e) {}
    window.dispatchEvent(new CustomEvent('sc_update'));

    setPhase('celebrate');
  }

  // ── Commit screen
  if (phase === 'commit') {
    return h(DrillCommitScreen, { drill: drill, onBack: onBack, onCommit: handleCommit });
  }

  // ── Reflect screen
  if (phase === 'reflect') {
    return h(ReflectionModal, { drill: drill, onClaim: handleReflectionClaim });
  }

  // ── Celebrate screen
  if (phase === 'celebrate') {
    return h(CelebrationScreen, {
      drill: drill,
      xpEarned: xpEarned,
      streak: streak,
      multiplier: multiplier,
      nextDrill: nextDrill,
      onDone: onBack,
    });
  }

  // ── Active session (phase === 'active') ─────────────────────────
  var s = {
    page: { background: '#0d1117', minHeight: '100vh', color: '#f0fdf4', fontFamily: 'system-ui,sans-serif', position: 'relative' },
    header: {
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    },
    backBtn: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8, padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: 13,
    },
    body: { padding: '20px 16px', maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 },
    sectionBox: { borderRadius: 14, padding: '14px 16px', marginBottom: 14 },
    sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, opacity: 0.7 },
  };

  // Complete button state
  var btnStyle, btnText;
  if (unlocked) {
    btnStyle = {
      width: '100%', padding: '18px', borderRadius: 14, border: 'none',
      background: 'linear-gradient(135deg, #16a34a, #15803d)',
      color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer',
      boxShadow: '0 0 28px rgba(22,163,74,0.45)',
      fontFamily: 'inherit', transition: 'all 0.2s',
      animation: 'sc-pulse 2s infinite',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    };
    btnText = ['complete', 'Mark as Complete (+' + drill.xp + ' XP)'];
  } else if (earlyAmber) {
    btnStyle = {
      width: '100%', padding: '18px', borderRadius: 14, border: '1px solid rgba(251,191,36,0.3)',
      background: 'rgba(251,191,36,0.08)',
      color: '#fbbf24', fontSize: 15, fontWeight: 700, cursor: 'default',
      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    };
    btnText = ['clock', 'Almost there — ' + formatTime(remaining) + ' to unlock'];
  } else {
    btnStyle = {
      width: '100%', padding: '18px', borderRadius: 14, border: '1px solid rgba(100,116,139,0.2)',
      background: 'rgba(100,116,139,0.06)',
      color: '#475569', fontSize: 15, fontWeight: 700, cursor: 'default',
      fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
    };
    btnText = ['lock', 'Locked — ' + formatTime(remaining) + ' remaining'];
  }

  return h('div', { style: s.page },
    // Background ambient video (zIndex 0, behind everything)
    h(BackgroundAmbientVideo, { category: drill.category }),

    // Header (zIndex 10)
    h('div', { style: s.header },
      h('button', { style: Object.assign({}, s.backBtn, { display: 'inline-flex', alignItems: 'center', gap: 5 }), onClick: onBack }, Ic('arrowL', 13, '#9ca3af'), 'Back'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 14, fontWeight: 700, color: '#f0fdf4' } }, drill.name),
        h('div', { style: { fontSize: 11, color: cat.color, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 } }, Ic(cat.icon, 12, cat.color), cat.label)
      ),
      // Live timer
      h('div', { style: {
        background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '5px 12px',
        fontFamily: 'monospace', fontSize: 15, fontWeight: 700,
        color: unlocked ? '#4ade80' : earlyAmber ? '#fbbf24' : '#64748b',
        border: '1px solid ' + (unlocked ? 'rgba(74,222,128,0.3)' : earlyAmber ? 'rgba(251,191,36,0.3)' : 'rgba(100,116,139,0.2)'),
      }}, formatTime(elapsedSec) )
    ),

    // Body (zIndex 1)
    h('div', { style: s.body },

      // Progress ring / time bar
      h('div', { style: { marginBottom: 18 } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          h('span', { style: { fontSize: 11, color: '#6b7280', fontWeight: 600 } }, 'Session Progress'),
          h('span', { style: { fontSize: 11, fontWeight: 700, color: unlocked ? '#4ade80' : earlyAmber ? '#fbbf24' : '#64748b', display: 'flex', alignItems: 'center', gap: 5 } },
            unlocked ? [Ic('check', 12, '#4ade80'), 'Ready to complete'] : Math.round(pct) + '% — 70% needed to unlock'
          )
        ),
        h('div', { style: { height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' } },
          h('div', { style: {
            height: '100%', borderRadius: 99,
            width: pct + '%',
            background: unlocked
              ? 'linear-gradient(90deg,#22c55e,#4ade80)'
              : earlyAmber
              ? 'linear-gradient(90deg,#d97706,#fbbf24)'
              : 'linear-gradient(90deg,#374151,#4b5563)',
            transition: 'width 1s linear, background 0.4s',
            boxShadow: unlocked ? '0 0 12px rgba(74,222,128,0.5)' : 'none',
          }})
        )
      ),

      // Hero row
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 } },
        h(CatTile, { category: drill.category, size: 60, iconSize: 30 }),
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginBottom: 6, lineHeight: 1.2 } }, drill.name),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' } },
            h('span', { style: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: lvl.bg, color: lvl.text, textTransform: 'capitalize' } }, drill.level),
            h('span', { style: { fontSize: 11, color: '#9ca3af', padding: '3px 0', display: 'inline-flex', alignItems: 'center', gap: 4 } }, Ic('clock', 12, '#9ca3af'), drill.duration),
            h('span', { style: { fontSize: 11, color: '#fbbf24', padding: '3px 0', display: 'inline-flex', alignItems: 'center', gap: 4 } }, Ic('zap', 12, '#fbbf24'), drill.xp + ' XP'),
            count > 0 && h('span', { style: { fontSize: 11, color: '#34d399', padding: '3px 0', display: 'inline-flex', alignItems: 'center', gap: 4 } }, Ic('check', 12, '#34d399'), 'Completed ' + count + 'x')
          )
        )
      ),

      // Problem + Why It Matters
      (drill.problem || drill.whyItMatters) && h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
        backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#34d399' }) }, 'The Problem This Fixes'),
        drill.problem && h('div', { style: { fontSize: 14, color: '#d1fae5', lineHeight: 1.65, marginBottom: drill.whyItMatters ? 10 : 0 } }, drill.problem),
        drill.whyItMatters && h('div', { style: { fontSize: 13, color: '#6ee7b7', lineHeight: 1.55, fontStyle: 'italic' } }, drill.whyItMatters)
      ),

      // Mechanic
      h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.2)',
        backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#a78bfa' }) }, 'Drill Format'),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
          h('div', { style: {
            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(139,92,246,0.14)', border: '1px solid rgba(139,92,246,0.3)',
          }}, Ic(mechInfo.icon || 'settings', 20, '#c4b5fd')),
          h('div', null,
            h('div', { style: { fontWeight: 700, color: '#c4b5fd', fontSize: 14 } }, mechInfo.label),
            h('div', { style: { fontSize: 12, color: '#9ca3af', marginTop: 2 } }, mechInfo.desc)
          )
        )
      ),

      // Baseline & Measurement
      (drill.baseline || drill.measurement || drill.masteryThreshold) && h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)',
        backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#60a5fa' }) }, 'Measurement & Mastery'),
        drill.baseline && h('div', { style: { marginBottom: 8 } },
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 } }, 'Baseline'),
          h('div', { style: { fontSize: 13, color: '#bfdbfe', lineHeight: 1.55 } }, drill.baseline)
        ),
        drill.measurement && h('div', { style: { marginBottom: 8 } },
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 } }, 'Track'),
          h('div', { style: { fontSize: 13, color: '#bfdbfe', lineHeight: 1.55 } }, drill.measurement)
        ),
        drill.masteryThreshold && h('div', null,
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 } }, 'Mastery Criterion'),
          h('div', { style: { fontSize: 13, color: '#93c5fd', fontWeight: 600, lineHeight: 1.55, display: 'flex', alignItems: 'flex-start', gap: 6 } }, Ic('target', 14, '#93c5fd', { marginTop: 2 }), h('span', null, drill.masteryThreshold))
        )
      ),

      // Video (inline player)
      h('div', { style: { marginBottom: 14 } },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#9ca3af', paddingLeft: 2, marginBottom: 10 }) }, 'Technique Video'),
        h(VideoPlayer, { drill: drill })
      ),

      // Equipment
      drill.equipment && drill.equipment.length > 0 && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(22,27,34,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }) },
        h('div', { style: s.sectionTitle }, 'Equipment'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          drill.equipment.map(function(item, i) {
            return h('span', { key: i, style: {
              fontSize: 12, padding: '4px 10px', borderRadius: 7,
              background: 'rgba(255,255,255,0.05)', color: '#d1d5db',
              border: '1px solid rgba(255,255,255,0.09)',
            }}, item);
          })
        )
      ),

      // Steps
      (drill.steps && drill.steps.length > 0) && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(22,27,34,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }) },
        h('div', { style: s.sectionTitle }, 'How To Do It'),
        drill.steps.map(function(step, i) {
          return h('div', { key: i, style: { display: 'flex', gap: 12, marginBottom: i < drill.steps.length - 1 ? 14 : 0 } },
            h('div', { style: {
              minWidth: 26, height: 26, borderRadius: '50%',
              background: 'rgba(22,163,74,0.18)', color: '#4ade80',
              fontSize: 12, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}, i + 1),
            h('div', { style: { fontSize: 14, color: '#e5e7eb', lineHeight: 1.6, paddingTop: 3 } }, step)
          );
        })
      ),

      // Key Focus
      drill.keyFocus && h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)',
        textAlign: 'center', backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#fbbf24' }) }, 'Key Mental Cue'),
        h('div', { style: { fontSize: 19, fontWeight: 800, color: '#fde68a', lineHeight: 1.4 } }, '"' + drill.keyFocus + '"')
      ),

      // Common Error
      drill.commonError && h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.22)',
        backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#f87171' }) }, 'Most Common Mistake'),
        h('div', { style: { fontSize: 14, color: '#fca5a5', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 } }, Ic('alertTriangle', 16, '#f87171', { marginTop: 2 }), h('span', null, drill.commonError))
      ),

      // Outcome / After Mastery
      drill.outcome && h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
        backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#34d399' }) }, 'After Mastery'),
        h('div', { style: { fontSize: 14, color: '#a7f3d0', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8 } }, Ic('circleCheck', 16, '#34d399', { marginTop: 2 }), h('span', null, drill.outcome))
      ),

      // Fit Tags
      drill.fit && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(22,27,34,0.7)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }) },
        h('div', { style: s.sectionTitle }, 'Best For'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5 } },
          (drill.fit.roles || []).map(function(r, i) {
            return h('span', { key: 'r' + i, style: { fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(59,130,246,0.12)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.2)' } }, r);
          }),
          (drill.fit.formats || []).map(function(f, i) {
            return h('span', { key: 'f' + i, style: { fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(139,92,246,0.12)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.2)' } }, f);
          }),
          (drill.fit.goals || []).map(function(g, i) {
            return h('span', { key: 'g' + i, style: { fontSize: 10, padding: '2px 7px', borderRadius: 99, background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,0.2)' } }, g);
          })
        )
      ),

      // Complete button
      h('div', { style: { padding: '20px 0 60px' } },
        h('button', {
          onClick: handleMarkComplete,
          disabled: !unlocked,
          style: btnStyle,
        }, Ic(btnText[0], 18, btnStyle.color), h('span', null, btnText[1]))
      )
    )
  );
}

// ── FOR YOU SECTION ───────────────────────────────────────────────
function ForYouSection(props) {
  var picks      = props.picks;       // array of normalised drills with _pickReason
  var user       = props.user;
  var smartLabel = props.smartLabel;
  var onSelect   = props.onSelect;
  var completions = props.completions || {};

  if (!picks || picks.length === 0) return null;

  var roleLabel = user ? (
    (user.role || '') + (user.level ? ' · ' + user.level : '') + (user.ageGroup ? ' · ' + user.ageGroup : '')
  ) : '';

  return h('div', { style: {
    background: 'rgba(16,185,129,0.06)',
    border: '1px solid rgba(16,185,129,0.16)',
    borderRadius: 16, margin: '0 0 18px',
    overflow: 'hidden',
  }},
    // Header
    h('div', { style: {
      padding: '14px 16px 10px',
      borderBottom: '1px solid rgba(16,185,129,0.12)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6,
    }},
      h('div', null,
        h('div', { style: { fontSize: 15, fontWeight: 800, color: '#34d399', display: 'flex', alignItems: 'center', gap: 7 } }, Ic('sparkles', 16, '#34d399'), 'For You'),
        roleLabel && h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2, textTransform: 'capitalize' } }, roleLabel)
      ),
      smartLabel && h('div', { style: {
        fontSize: 10, color: '#6b7280', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 99,
        padding: '3px 9px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
      }}, Ic('cpu', 11, '#6b7280'), smartLabel)
    ),

    // Horizontal scroll of pick cards
    h('div', { style: { display: 'flex', gap: 12, overflowX: 'auto', padding: '12px 16px', WebkitOverflowScrolling: 'touch' } },
      picks.map(function(drill, i) {
        var cat = CATS[drill.category] || CATS.all;
        var lvl = LEVEL_COLORS[drill.level] || LEVEL_COLORS.beginner;
        var count = completions[drill.id] || 0;
        return h('div', {
          key: drill.id,
          onClick: function() { onSelect(drill); },
          style: {
            flexShrink: 0, width: 220,
            background: 'rgba(16,22,36,0.95)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14, padding: '14px', cursor: 'pointer',
            borderTop: '3px solid ' + cat.color,
            transition: 'all 0.2s',
          },
          onMouseEnter: function(e) { e.currentTarget.style.transform = 'translateY(-2px)'; },
          onMouseLeave: function(e) { e.currentTarget.style.transform = ''; },
        },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
            h(CatTile, { category: drill.category, size: 34, iconSize: 17 }),
            h('span', { style: { fontSize: 10, padding: '2px 7px', borderRadius: 99, background: lvl.bg, color: lvl.text, fontWeight: 700, textTransform: 'capitalize' } }, drill.level),
            drill._pickReason && h('span', { style: {
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
              background: 'rgba(16,185,129,0.15)', color: '#34d399',
              border: '1px solid rgba(16,185,129,0.3)', whiteSpace: 'nowrap',
            }}, drill._pickReason)
          ),
          h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 5, lineHeight: 1.3 } }, drill.name),
          h('div', { style: { fontSize: 11, color: '#64748b', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } }, drill.problem),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            h('span', { style: { fontSize: 10, color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: 4 } }, Ic('clock', 11, '#64748b'), drill.duration),
            h('span', { style: { fontSize: 10, fontWeight: 700, color: '#4ade80', display: 'inline-flex', alignItems: 'center', gap: 4 } }, Ic('zap', 11, '#4ade80'), drill.xp + ' XP')
          )
        );
      })
    )
  );
}

// ── DRILLS PAGE ────────────────────────────────────────────────────
function DrillsPage() {
  var [activeCat,     setActiveCat]     = useState('all');
  var [search,        setSearch]        = useState('');
  var [levelFilter,   setLevelFilter]   = useState('all');
  var [selectedDrill, setSelectedDrill] = useState(null);
  var [showPicks,     setShowPicks]     = useState(false);

  var rawDrills = A.DRILLS || [];
  var DRILLS    = rawDrills.map(normDrill);

  var progress    = DB.getProgress ? DB.getProgress() : {};
  var completions = progress.drill_completions || {};

  var user = DB.getUser ? DB.getUser() : null;

  // Get personalised picks (up to 5, each has _pickReason)
  var pickDrills = [];
  if (A.PersonalisationEngine && user && A.PersonalisationEngine.getPickDrills) {
    try {
      pickDrills = A.PersonalisationEngine.getPickDrills(DRILLS, user, Object.keys(completions)) || [];
    } catch(e) {}
  }
  var pickIds = {};
  pickDrills.forEach(function(d) { pickIds[d.id] = true; });

  var smartLabel = A.PersonalisationEngine && A.PersonalisationEngine.getSmartLabel
    ? A.PersonalisationEngine.getSmartLabel()
    : null;

  // ── SMART SEARCH ────────────────────────────────────────────────
  // Fuzzy, typo-tolerant matching across the drill name AND its full
  // description (problem), plus coaching cues, outcomes, steps and tags —
  // so you can find a drill by what it does, not just its title.
  var fuseRef = useRef(null);
  if (window.Fuse && (!fuseRef.current || fuseRef.current._scCount !== DRILLS.length)) {
    fuseRef.current = new window.Fuse(DRILLS, {
      includeScore: true, threshold: 0.4, ignoreLocation: true, minMatchCharLength: 2,
      keys: [
        { name: 'name',         weight: 0.34 },
        { name: 'problem',      weight: 0.30 }, // the description
        { name: 'tagline',      weight: 0.14 },
        { name: 'whyItMatters', weight: 0.10 },
        { name: 'keyFocus',     weight: 0.08 },
        { name: 'outcome',      weight: 0.06 },
        { name: 'steps',        weight: 0.06 },
        { name: 'equipment',    weight: 0.04 },
        { name: 'category',     weight: 0.05 },
        { name: 'subCategory',  weight: 0.05 },
        { name: 'level',        weight: 0.03 },
      ],
    });
    fuseRef.current._scCount = DRILLS.length;
  }

  var q = search.trim();
  var searchBase;
  if (!q) {
    searchBase = DRILLS;
  } else if (fuseRef.current) {
    searchBase = fuseRef.current.search(q).map(function(r) { return r.item; });
  } else {
    // Fallback: case-insensitive substring across name + description
    var ql = q.toLowerCase();
    searchBase = DRILLS.filter(function(d) {
      return d.name.toLowerCase().indexOf(ql) > -1
        || (d.problem && d.problem.toLowerCase().indexOf(ql) > -1)
        || (d.tagline && d.tagline.toLowerCase().indexOf(ql) > -1)
        || (d.keyFocus && d.keyFocus.toLowerCase().indexOf(ql) > -1)
        || d.category.toLowerCase().indexOf(ql) > -1;
    });
  }

  // Apply category / level / picks filters on top of the search results
  var filtered = searchBase.filter(function(d) {
    if (showPicks) return !!pickIds[d.id];
    var catMatch = activeCat === 'all' || d.category === activeCat;
    var lvlMatch = levelFilter === 'all' || d.level === levelFilter;
    return catMatch && lvlMatch;
  });

  if (selectedDrill) {
    return h(DrillDetailPage, {
      drill: selectedDrill,
      onBack: function() { setSelectedDrill(null); },
      allDrills: DRILLS,
    });
  }

  var totalDone   = Object.keys(completions).length;
  var totalDrills = DRILLS.length;

  var s = {
    page: { background: '#0d1117', minHeight: '100vh', color: '#f0fdf4', fontFamily: 'system-ui,sans-serif' },
    header: { background: '#0d1117', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '16px 16px 0' },
    title: { fontSize: 24, fontWeight: 900, color: '#f0fdf4', marginBottom: 3 },
    subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 14 },
    searchRow: { display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' },
    searchInput: {
      width: '100%', boxSizing: 'border-box',
      background: 'rgba(16,22,36,0.9)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 99, padding: '10px 16px 10px 42px', color: '#e2e8f0',
      fontSize: 14, outline: 'none', fontFamily: 'inherit',
      transition: 'border-color 0.2s',
    },
    select: {
      background: 'rgba(16,22,36,0.9)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 99, padding: '9px 14px', color: '#e2e8f0',
      fontSize: 12, outline: 'none', cursor: 'pointer', fontFamily: 'inherit',
    },
    catScroll: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch' },
    catBtn: function(active, cat) {
      return {
        flexShrink: 0, padding: '8px 16px', borderRadius: 99, border: '1px solid',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
        borderColor: active ? cat.color : 'rgba(255,255,255,0.08)',
        background: active ? cat.bg : 'transparent',
        color: active ? cat.color : '#64748b',
        boxShadow: active ? ('0 0 14px ' + cat.color + '30') : 'none',
        fontFamily: 'inherit',
      };
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 14, padding: '14px 16px 100px', maxWidth: 960, margin: '0 auto',
    },
    emptyMsg: { textAlign: 'center', padding: '80px 20px', color: '#6b7280' },
  };

  var donePct = totalDrills > 0 ? Math.round((totalDone / totalDrills) * 100) : 0;

  return h('div', { style: s.page },
    A.CrickTip ? h(A.CrickTip, { context: 'drills', trigger: 'first_visit' }) : null,
    h('div', { style: s.header },
      // Title block — professional training-platform header
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 } },
        h('div', { style: {
          width: 46, height: 46, borderRadius: 13, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(140deg, #16a34a, #0d9488)',
          boxShadow: '0 6px 20px rgba(22,163,74,0.35)',
        }}, Ic('bat', 24, '#ffffff')),
        h('div', { style: { flex: 1, minWidth: 0 } },
          h('div', { style: { fontSize: 11, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#16a34a', marginBottom: 2 } }, 'Training Library'),
          h('div', { style: { fontSize: 24, fontWeight: 900, color: '#f0fdf4', lineHeight: 1 } }, 'Drills')
        ),
        h('div', { style: { textAlign: 'right', flexShrink: 0 } },
          h('div', { style: { fontSize: 20, fontWeight: 900, color: '#4ade80', lineHeight: 1 } }, donePct + '%'),
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' } }, 'Mastery')
        )
      ),

      // Stat line
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, fontSize: 12, color: '#6b7280' } },
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5 } }, Ic('layers', 13, '#6b7280'), totalDrills + ' drills'),
        h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5 } }, Ic('circleCheck', 13, '#4ade80'), totalDone + ' completed')
      ),

      // Progress bar
      totalDrills > 0 && h('div', { style: { marginBottom: 14 } },
        h('div', { style: { height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' } },
          h('div', { style: {
            height: '100%', borderRadius: 99,
            width: donePct + '%',
            background: 'linear-gradient(90deg,#22c55e,#4ade80)',
            transition: 'width 0.5s',
            boxShadow: '0 0 10px rgba(74,222,128,0.45)',
          }})
        )
      ),

      // Search + level filter
      h('div', { style: s.searchRow },
        h('div', { style: { flex: 1, position: 'relative', display: 'flex', alignItems: 'center' } },
          h('span', { style: {
            position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
            pointerEvents: 'none', display: 'flex',
          } }, Ic('search', 16, '#475569')),
          h('input', {
            style: s.searchInput,
            placeholder: 'Search by name or description…',
            value: search,
            onChange: function(e) { setSearch(e.target.value); setShowPicks(false); },
            onFocus: function(e) { e.target.style.borderColor = '#22c55e'; },
            onBlur: function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; },
          }),
          search && h('button', {
            onClick: function() { setSearch(''); },
            'aria-label': 'Clear search',
            style: {
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 99,
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', padding: 0,
            },
          }, Ic('x', 13, '#94a3b8'))
        ),
        h('select', {
          style: s.select,
          value: levelFilter,
          onChange: function(e) { setLevelFilter(e.target.value); },
        },
          h('option', { value: 'all' }, 'All Levels'),
          h('option', { value: 'beginner' }, 'Beginner'),
          h('option', { value: 'intermediate' }, 'Intermediate'),
          h('option', { value: 'advanced' }, 'Advanced')
        )
      ),

      // Category tabs
      h('div', { style: s.catScroll },
        Object.keys(CATS).map(function(key) {
          var cat    = CATS[key];
          var active = !showPicks && activeCat === key;
          return h('button', {
            key: key,
            style: Object.assign(s.catBtn(active, cat), { display: 'inline-flex', alignItems: 'center', gap: 6 }),
            onClick: function() { setActiveCat(key); setShowPicks(false); },
          }, Ic(cat.icon, 14, active ? cat.color : '#64748b'), cat.label);
        })
      )
    ),

    // Body
    h('div', { style: { padding: '14px 16px 0', maxWidth: 960, margin: '0 auto' } },

      // For You section — shown when no search active
      !search && pickDrills.length > 0 && h(ForYouSection, {
        picks: pickDrills,
        user: user,
        smartLabel: smartLabel,
        onSelect: setSelectedDrill,
        completions: completions,
      }),

      // Result count
      h('div', { style: { padding: '4px 0 10px', fontSize: 12, color: '#6b7280' } },
        filtered.length + ' drill' + (filtered.length !== 1 ? 's' : '') +
        (search ? ' matching "' + search + '"' :
         activeCat !== 'all' ? ' in ' + CATS[activeCat].label : '')
      )
    ),

    // Grid
    filtered.length === 0
      ? h('div', { style: s.emptyMsg },
          h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 } }, Ic('search', 40, '#475569')),
          h('div', { style: { fontSize: 18, fontWeight: 700, color: '#f8fafc', marginBottom: 8 } }, 'No drills found'),
          h('div', { style: { fontSize: 13, color: '#64748b', marginBottom: 20 } }, 'Try a different category or clear the search'),
          h('button', {
            onClick: function() { setSearch(''); setActiveCat('all'); setLevelFilter('all'); setShowPicks(false); },
            style: {
              padding: '10px 24px', background: 'rgba(34,197,94,0.12)', color: '#22c55e',
              border: '1px solid rgba(34,197,94,0.25)', borderRadius: 99,
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }
          }, 'Clear Filters')
        )
      : h('div', { className: 'sc-stagger-grid', style: s.grid },
          filtered.map(function(drill) {
            return h(DrillCard, {
              key: drill.id,
              drill: drill,
              onSelect: setSelectedDrill,
              isPick: !!pickIds[drill.id],
              pickReason: drill._pickReason || '',
              completions: completions,
            });
          })
        )
  );
}

A.DrillsPage = DrillsPage;
A.VideoPlayer = VideoPlayer;
console.log('[SC] app-drills v6.0 — ' + (A.DRILLS ? A.DRILLS.length : 0) + ' drills · commitment system · ambient video · reflection modal');
})();
