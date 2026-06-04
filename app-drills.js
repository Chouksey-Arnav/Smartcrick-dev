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
  'shadow-trigger':       { label: 'Shadow Drill',    emoji: '🪞', desc: 'Mirror & video technique feedback' },
  'phase-timer':          { label: 'Phase Timer',     emoji: '⏱️', desc: 'Timed phases with targets' },
  'audio-cue-randomizer': { label: 'Audio React',     emoji: '🔊', desc: 'React to random audio cues' },
  'lives-game':           { label: 'Lives Game',      emoji: '❤️', desc: 'Limited attempts per session' },
  'adaptive-difficulty':  { label: 'Adaptive',        emoji: '📈', desc: 'Auto-adjusts to your level' },
  'decision-tracker':     { label: 'Decision Track',  emoji: '🧠', desc: 'Track decisions per ball' },
  'form-video-upload':    { label: 'Video Review',    emoji: '🎥', desc: 'Record & review your form' },
  'score-vs-feeder':      { label: 'Score Attack',    emoji: '🏆', desc: 'Score points vs. feeder' },
  'streak-multiplier':    { label: 'Streak Bonus',    emoji: '🔥', desc: 'Multiplier for consecutive hits' },
  'simulation-script':    { label: 'Match Sim',       emoji: '🎮', desc: 'Scripted match scenario' },
  'breathwork-overlay':   { label: 'Breathwork',      emoji: '🌬️', desc: 'Guided breathing with activity' },
  'biomech-overlay':      { label: 'Biomechanics',    emoji: '🦴', desc: 'Biomechanical checkpoints' },
  'bowler-tracker':       { label: 'Bowl Track',      emoji: '🎯', desc: 'Track bowling metrics per ball' },
  'partner-call-mode':    { label: 'Partner Calls',   emoji: '📣', desc: 'Partner calls random cues' },
  'trigger-word-loop':    { label: 'Trigger Word',    emoji: '💬', desc: 'Loop a focus cue while practising' },
  'field-set-overlay':    { label: 'Field Overlay',   emoji: '🗺️', desc: 'Field placement visualisation' },
  'dna-mirror':           { label: 'DNA Mirror',      emoji: '🧬', desc: 'Match your DNA archetype' },
};

// ── CATEGORIES ────────────────────────────────────────────────────
var CATS = {
  all:           { label: 'All',      emoji: '🏏', color: '#9ca3af', bg: 'rgba(75,85,99,0.15)' },
  batting:       { label: 'Batting',  emoji: '🏏', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  bowling:       { label: 'Bowling',  emoji: '⚾',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  fielding:      { label: 'Fielding', emoji: '🏃', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  wicketkeeping: { label: 'Keeping',  emoji: '🧤', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  fitness:       { label: 'Fitness',  emoji: '💪', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  mental:        { label: 'Mental',   emoji: '🧠', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
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
  var info = MECHANIC_INFO[props.mechanic] || { label: props.mechanic, emoji: '⚙️' };
  return h('span', { style: {
    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.25)', whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: 3,
  }}, info.emoji + ' ' + info.label);
}

// ── VIDEO PLAYER (inline, click to embed) ────────────────────────
function VideoPlayer(props) {
  var drill = props.drill;
  var [show, setShow] = useState(false);
  if (!drill.videoId || drill.videoId === 'PLACEHOLDER') {
    return h('div', { style: { padding: '12px 0', color: '#6b7280', fontSize: 13, textAlign: 'center' } },
      '📹 Video coming soon'
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
        h('span', { style: { color: '#fff', fontSize: 24, marginLeft: 4 } }, '▶')
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
        pointerEvents: 'auto',
        backdropFilter: 'blur(4px)',
      },
    }, '✕ Hide Video')
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
    h('div', { style: { fontSize: 64, marginBottom: 16 } }, drill.emoji),
    h('div', { style: {
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
      color: cat.color, marginBottom: 10,
    }}, cat.emoji + ' ' + cat.label + ' Drill'),
    h('div', { style: {
      fontSize: 26, fontWeight: 900, color: '#f0fdf4', marginBottom: 10, lineHeight: 1.25, maxWidth: 420,
    }}, drill.name),
    h('div', { style: {
      fontSize: 14, color: '#94a3b8', lineHeight: 1.6, maxWidth: 380, marginBottom: 8,
    }}, drill.problem),
    h('div', { style: { display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 28 } },
      h('span', { style: { fontSize: 12, color: '#64748b' } }, '⏱ ' + drill.duration),
      h('span', { style: { fontSize: 12, color: '#64748b' } }, '⚡ ' + drill.xp + ' XP on completion')
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
        marginBottom: 14,
        width: '100%', maxWidth: 360,
      },
    }, '🏏  Start Drill — I\'m Committed'),
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
  { id: 'strong',    label: '💪 Strong',    bg: 'rgba(34,197,94,0.15)',   color: '#4ade80' },
  { id: 'focused',   label: '🎯 Focused',   bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' },
  { id: 'challenged',label: '😤 Challenged',bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  { id: 'confident', label: '😊 Confident', bg: 'rgba(139,92,246,0.15)', color: '#a78bfa' },
  { id: 'pumped',    label: '🔥 Pumped',    bg: 'rgba(239,68,68,0.15)',   color: '#f87171' },
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
        h('div', { style: { fontSize: 48, marginBottom: 10 } }, '🏏'),
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
                fontSize: 32, background: 'none', border: 'none',
                cursor: 'pointer', opacity: active ? 1 : 0.3,
                transform: active ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.12s',
                filter: active ? 'drop-shadow(0 0 8px rgba(251,191,36,0.6))' : 'none',
              },
            }, '⭐');
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
                transition: 'all 0.15s',
                transform: active ? 'scale(1.04)' : 'scale(1)',
              },
            }, f.label);
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
        },
      }, canClaim ? 'Claim Your XP →' : 'Rate your session & select a feeling')
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
    var text = '🏏 Just completed "' + drill.name + '" on SmartCrick and earned ' + xpEarned + ' XP! Getting better every day.';
    if (navigator.share) {
      navigator.share({ text: text }).catch(function(){});
    } else {
      try { navigator.clipboard.writeText(text); } catch(e){}
      // Subtle feedback
      var btn = document.getElementById('sc-share-btn');
      if (btn) { btn.textContent = '✓ Copied!'; setTimeout(function(){ btn.textContent = '🔗 Share Your Win'; }, 2000); }
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
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.3s',
      }}, '🔥 ' + (multiplier * 100 - 100).toFixed(0) + '% Streak Bonus Applied'),

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
        '🔥 ' + streak + '-day streak — Keep it alive!'
      ),

      // Coach message
      h('div', { style: {
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 16, textAlign: 'left',
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.4s',
      }},
        h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 } }, '🎙️ Coach Says'),
        h('div', { style: { fontSize: 14, color: '#d1fae5', lineHeight: 1.6, fontStyle: 'italic' } }, '"' + coachMsg + '"')
      ),

      // Next drill preview
      nextDrill && h('div', { style: {
        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 14, padding: '14px 16px', marginBottom: 20, textAlign: 'left',
        opacity: popped ? 1 : 0, transition: 'opacity 0.4s 0.5s',
      }},
        h('div', { style: { fontSize: 10, color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 } }, '⬆️ Up Next — Come Back Tomorrow'),
        h('div', { style: { fontSize: 14, color: '#bfdbfe', fontWeight: 700 } }, nextDrill.emoji + ' ' + nextDrill.name),
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
          },
        }, '🔗 Share Your Win'),
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
      // Top row
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 9, flexWrap: 'wrap' } },
        h('span', { style: { fontSize: 20, lineHeight: 1 } }, drill.emoji),
        h('span', { style: { fontSize: 10, padding: '2px 8px', borderRadius: 99, background: lvl.bg, color: lvl.text, fontWeight: 700 } }, drill.level),
        isPick && pickReason && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
          background: 'rgba(16,185,129,0.15)', color: '#34d399',
          border: '1px solid rgba(16,185,129,0.3)',
        }}, '⭐ ' + pickReason),
        h('span', { style: {
          marginLeft: 'auto', fontSize: 10, padding: '2px 8px', borderRadius: 99,
          background: 'rgba(34,197,94,0.12)', color: '#4ade80', fontWeight: 700,
          border: '1px solid rgba(34,197,94,0.2)',
        }}, '⚡ ' + drill.xp + ' XP')
      ),
      // Name
      h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f8fafc', marginTop: 6, lineHeight: 1.3 } }, drill.name),
      // Problem / description
      drill.problem && h('div', { style: {
        fontSize: 12, color: '#64748b', lineHeight: 1.5, marginTop: 5,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}, drill.problem),
      // Bottom badges
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 } },
        h(MechanicBadge, { mechanic: drill.appMechanic }),
        h('span', { style: { fontSize: 11, color: '#64748b' } }, '⏱ ' + drill.duration),
        h('span', { style: { fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: cat.bg, color: cat.color } }, cat.emoji + ' ' + cat.label),
        count > 0 && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
          border: '1px solid rgba(59,130,246,0.3)',
        }}, '✓ ' + count + 'x'),
        hasVideo && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: 'rgba(220,38,38,0.12)', color: '#f87171',
          border: '1px solid rgba(220,38,38,0.25)',
        }}, '▶ Video')
      ),
      // CTA
      h('button', {
        onClick: function(e) { e.stopPropagation(); onSelect(drill); },
        style: {
          width: '100%', padding: '11px', marginTop: 12,
          border: 'none', borderRadius: 10,
          background: cat.bg || 'rgba(34,197,94,0.12)',
          color: cat.color || '#22c55e',
          fontSize: 13, fontWeight: 700, cursor: 'pointer',
          letterSpacing: '0.02em', fontFamily: 'inherit',
          transition: 'background 0.15s',
        }
      }, 'Start Drill →')
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
  var mechInfo = MECHANIC_INFO[drill.appMechanic] || { label: drill.appMechanic, emoji: '⚙️', desc: '' };

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
    var baseXP = drill.xp;
    var bonusXP = Math.round(baseXP * (rating >= 4 ? 0.2 : rating >= 3 ? 0.1 : 0)); // rating bonus
    var finalXP = baseXP + bonusXP;
    var mult = 1.0;
    if (awardXP) {
      try {
        // awardXP returns or updates XP with streak — get current streak for display
        awardXP(finalXP, 0, 'drill:' + drill.id);
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
    };
    btnText = '✅ Mark as Complete (+' + drill.xp + ' XP)';
  } else if (earlyAmber) {
    btnStyle = {
      width: '100%', padding: '18px', borderRadius: 14, border: '1px solid rgba(251,191,36,0.3)',
      background: 'rgba(251,191,36,0.08)',
      color: '#fbbf24', fontSize: 15, fontWeight: 700, cursor: 'default',
      fontFamily: 'inherit',
    };
    btnText = '⏳ Almost there… ' + formatTime(remaining) + ' to unlock';
  } else {
    btnStyle = {
      width: '100%', padding: '18px', borderRadius: 14, border: '1px solid rgba(100,116,139,0.2)',
      background: 'rgba(100,116,139,0.06)',
      color: '#475569', fontSize: 15, fontWeight: 700, cursor: 'default',
      fontFamily: 'inherit',
    };
    btnText = '🔒 Locked — ' + formatTime(remaining) + ' remaining';
  }

  return h('div', { style: s.page },
    // Background ambient video (zIndex 0, behind everything)
    h(BackgroundAmbientVideo, { category: drill.category }),

    // Header (zIndex 10)
    h('div', { style: s.header },
      h('button', { style: s.backBtn, onClick: onBack }, '← Back'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 14, fontWeight: 700, color: '#f0fdf4' } }, drill.name),
        h('div', { style: { fontSize: 11, color: cat.color, marginTop: 1 } }, cat.emoji + ' ' + cat.label)
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
          h('span', { style: { fontSize: 11, fontWeight: 700, color: unlocked ? '#4ade80' : earlyAmber ? '#fbbf24' : '#64748b' } },
            unlocked ? '✅ Ready to complete' : Math.round(pct) + '% — 70% needed to unlock'
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
        h('span', { style: { fontSize: 52, lineHeight: 1 } }, drill.emoji),
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginBottom: 6, lineHeight: 1.2 } }, drill.name),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
            h('span', { style: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: lvl.bg, color: lvl.text } }, drill.level),
            h('span', { style: { fontSize: 11, color: '#9ca3af', padding: '3px 0' } }, '⏱ ' + drill.duration),
            h('span', { style: { fontSize: 11, color: '#fbbf24', padding: '3px 0' } }, '⚡ ' + drill.xp + ' XP'),
            count > 0 && h('span', { style: { fontSize: 11, color: '#34d399', padding: '3px 0' } }, '✓ Completed ' + count + 'x')
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
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
          h('span', { style: { fontSize: 28 } }, mechInfo.emoji),
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
          h('div', { style: { fontSize: 13, color: '#93c5fd', fontWeight: 600, lineHeight: 1.55 } }, '🎯 ' + drill.masteryThreshold)
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
        h('div', { style: { fontSize: 14, color: '#fca5a5', lineHeight: 1.6 } }, '⚠️ ' + drill.commonError)
      ),

      // Outcome / After Mastery
      drill.outcome && h('div', { style: Object.assign({}, s.sectionBox, {
        background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)',
        backdropFilter: 'blur(8px)',
      }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#34d399' }) }, 'After Mastery'),
        h('div', { style: { fontSize: 14, color: '#a7f3d0', lineHeight: 1.6 } }, '✅ ' + drill.outcome)
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
        }, btnText)
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
        h('div', { style: { fontSize: 15, fontWeight: 800, color: '#34d399' } }, '⭐ For You'),
        roleLabel && h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2, textTransform: 'capitalize' } }, roleLabel)
      ),
      smartLabel && h('div', { style: {
        fontSize: 10, color: '#6b7280', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)', borderRadius: 99,
        padding: '3px 9px', fontWeight: 600,
      }}, '🤖 ' + smartLabel)
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
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 } },
            h('span', { style: { fontSize: 20 } }, drill.emoji),
            h('span', { style: { fontSize: 10, padding: '2px 7px', borderRadius: 99, background: lvl.bg, color: lvl.text, fontWeight: 700 } }, drill.level),
            drill._pickReason && h('span', { style: {
              fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 99,
              background: 'rgba(16,185,129,0.15)', color: '#34d399',
              border: '1px solid rgba(16,185,129,0.3)', whiteSpace: 'nowrap',
            }}, drill._pickReason)
          ),
          h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f8fafc', marginBottom: 5, lineHeight: 1.3 } }, drill.name),
          h('div', { style: { fontSize: 11, color: '#64748b', lineHeight: 1.4, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } }, drill.problem),
          h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            h('span', { style: { fontSize: 10, color: '#64748b' } }, '⏱ ' + drill.duration),
            h('span', { style: { fontSize: 10, fontWeight: 700, color: '#4ade80' } }, '⚡ ' + drill.xp + ' XP')
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

  // Filter logic
  var filtered = DRILLS.filter(function(d) {
    if (showPicks) return !!pickIds[d.id];
    var catMatch = activeCat === 'all' || d.category === activeCat;
    var lvlMatch = levelFilter === 'all' || d.level === levelFilter;
    var q = search.toLowerCase().trim();
    var searchMatch = !q
      || d.name.toLowerCase().indexOf(q) > -1
      || (d.problem && d.problem.toLowerCase().indexOf(q) > -1)
      || (d.keyFocus && d.keyFocus.toLowerCase().indexOf(q) > -1)
      || d.category.toLowerCase().indexOf(q) > -1
      || (d.subCategory && d.subCategory.toLowerCase().indexOf(q) > -1)
      || (d.tagline && d.tagline.toLowerCase().indexOf(q) > -1);
    return catMatch && lvlMatch && searchMatch;
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

  return h('div', { style: s.page },
    h('div', { style: s.header },
      h('div', { style: s.title }, '🏏 Drills'),
      h('div', { style: s.subtitle }, totalDrills + ' drills · ' + totalDone + ' completed'),

      // Progress bar
      totalDrills > 0 && h('div', { style: { marginBottom: 14 } },
        h('div', { style: { height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' } },
          h('div', { style: {
            height: '100%', borderRadius: 99,
            width: Math.round((totalDone / totalDrills) * 100) + '%',
            background: 'linear-gradient(90deg,#22c55e,#4ade80)',
            transition: 'width 0.5s',
            boxShadow: '0 0 10px rgba(74,222,128,0.45)',
          }})
        )
      ),

      // Search + level filter
      h('div', { style: s.searchRow },
        h('div', { style: { flex: 1, position: 'relative' } },
          h('span', { style: {
            position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)',
            fontSize: 15, pointerEvents: 'none', color: '#475569',
          } }, '🔍'),
          h('input', {
            style: s.searchInput,
            placeholder: 'Search by drill name or description…',
            value: search,
            onChange: function(e) { setSearch(e.target.value); setShowPicks(false); },
            onFocus: function(e) { e.target.style.borderColor = '#22c55e'; },
            onBlur: function(e) { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; },
          })
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
            style: s.catBtn(active, cat),
            onClick: function() { setActiveCat(key); setShowPicks(false); },
          }, cat.emoji + ' ' + cat.label);
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
          h('div', { style: { fontSize: 40, marginBottom: 16 } }, '🔍'),
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
console.log('[SC] app-drills v6.0 — ' + (A.DRILLS ? A.DRILLS.length : 0) + ' drills · commitment system · ambient video · reflection modal');
})();
