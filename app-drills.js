// ================================================================
// SmartCrick — Cricket Drills v5.0
// UI layer — reads A.DRILLS from app-drills-data.js
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var A = window.SC_APP;
var DB = A.DB;
var nav = A.nav;
var awardXP = A.awardXP;

// ── DRILL NORMALISER ────────────────────────────────────────────
function normDrill(d) {
  var dur = d.duration;
  if (typeof dur === 'number') dur = dur + ' min';
  else if (!dur && d.duration_minutes) dur = d.duration_minutes + ' min';
  else if (!dur) dur = '15 min';
  return {
    id: d.id || '',
    name: d.name || d.title || '',
    category: d.category || 'batting',
    subCategory: d.subCategory || '',
    level: d.level || d.skill_level || 'beginner',
    duration: dur,
    xp: d.xp || d.xp_value || 50,
    emoji: d.emoji || d.icon || '🏏',
    problem: d.problem || d.tagline || d.description || '',
    whyItMatters: d.whyItMatters || '',
    baseline: d.baseline || '',
    measurement: d.measurement || '',
    masteryThreshold: d.masteryThreshold || '',
    appMechanic: d.appMechanic || 'shadow-trigger',
    appMechanicConfig: d.appMechanicConfig || { reps: 20 },
    videoId: d.videoId || d.video_id || '',
    videoChannel: d.videoChannel || '',
    videoTitle: d.videoTitle || '',
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
  };
}

// ── MECHANIC INFO ───────────────────────────────────────────────
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

// ── CATEGORIES ──────────────────────────────────────────────────
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

// ── VIDEO PLAYER ────────────────────────────────────────────────
function VideoPlayer(props) {
  var drill = props.drill;
  var ref = useRef(null);
  var [show, setShow] = useState(false);
  if (!drill.videoId || drill.videoId === 'PLACEHOLDER') {
    return h('div', { style: { padding: '12px 0', color: '#6b7280', fontSize: 13, textAlign: 'center' } },
      '📹 Video coming soon'
    );
  }
  if (!show) {
    var thumb = 'https://img.youtube.com/vi/' + drill.videoId + '/mqdefault.jpg';
    return h('div', { style: { position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#000' }, onClick: function() { setShow(true); } },
      h('img', { src: thumb, style: { width: '100%', display: 'block', opacity: 0.85 }, alt: drill.videoTitle }),
      h('div', { style: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,0,0,0.9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }},
        h('span', { style: { color: '#fff', fontSize: 22, marginLeft: 4 } }, '▶')
      ),
      drill.videoTitle && h('div', { style: {
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '6px 10px',
        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
        color: '#fff', fontSize: 11,
      }}, drill.videoTitle)
    );
  }
  return h('div', { style: { position: 'relative', paddingBottom: '56.25%', borderRadius: 10, overflow: 'hidden' } },
    h('iframe', {
      ref: ref,
      src: 'https://www.youtube.com/embed/' + drill.videoId + '?autoplay=1',
      style: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
      allow: 'autoplay; encrypted-media',
      allowFullScreen: true,
    })
  );
}

// ── MECHANIC BADGE ──────────────────────────────────────────────
function MechanicBadge(props) {
  var info = MECHANIC_INFO[props.mechanic] || { label: props.mechanic, emoji: '⚙️' };
  return h('span', { style: {
    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
    background: 'rgba(139,92,246,0.12)', color: '#a78bfa',
    border: '1px solid rgba(139,92,246,0.25)', whiteSpace: 'nowrap',
    display: 'inline-flex', alignItems: 'center', gap: 3,
  }}, info.emoji + ' ' + info.label);
}

// ── DRILL CARD ───────────────────────────────────────────────────
function DrillCard(props) {
  var drill = props.drill;
  var onSelect = props.onSelect;
  var isPick = props.isPick;
  var completions = props.completions || {};
  var count = completions[drill.id] || 0;
  var cat = CATS[drill.category] || CATS.all;
  var lvl = LEVEL_COLORS[drill.level] || LEVEL_COLORS.beginner;

  return h('div', {
    onClick: function() { onSelect(drill); },
    style: {
      background: 'rgba(16,22,36,0.9)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      overflow: 'hidden',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
    },
    onMouseEnter: function(e) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)'; },
    onMouseLeave: function(e) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)'; },
  },
    // Category color strip at top
    h('div', { style: { height: 6, background: cat.color, opacity: 0.85 } }),
    h('div', { style: { padding: '14px' } },
      // Top row: emoji + level badge + XP badge
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 } },
        h('span', { style: { fontSize: 18, lineHeight: 1 } }, drill.emoji),
        h('span', { style: {
          fontSize: 10, padding: '2px 8px', borderRadius: 99,
          background: lvl.bg, color: lvl.text, fontWeight: 700,
        }}, drill.level),
        isPick && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: 'rgba(16,185,129,0.15)', color: '#34d399',
          border: '1px solid rgba(16,185,129,0.3)',
        }}, '⭐ Pick'),
        h('span', { style: { marginLeft: 'auto', fontSize: 10, padding: '2px 7px', borderRadius: 99,
          background: 'rgba(34,197,94,0.12)', color: '#4ade80', fontWeight: 700,
          border: '1px solid rgba(34,197,94,0.2)',
        }}, '⚡ ' + drill.xp + ' XP')
      ),
      // Drill name
      h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f8fafc', marginTop: 8, lineHeight: 1.3 } }, drill.name),
      // Problem/tagline
      drill.problem && h('div', { style: {
        fontSize: 12, color: '#64748b', lineHeight: 1.5, marginTop: 4, overflow: 'hidden',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}, drill.problem),
      // Bottom row: badges
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 } },
        h(MechanicBadge, { mechanic: drill.appMechanic }),
        h('span', { style: { fontSize: 11, color: '#64748b' } }, '⏱ ' + drill.duration),
        h('span', { style: { fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99,
          background: cat.bg, color: cat.color } }, cat.emoji + ' ' + cat.label),
        count > 0 && h('span', { style: {
          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
          border: '1px solid rgba(59,130,246,0.3)',
        }}, '✓ ' + count + 'x'),
        (drill.videoId && drill.videoId !== 'PLACEHOLDER') && h('span', { style: { fontSize: 11, color: '#f87171' } }, '▶ Video')
      ),
      // CTA button
      h('button', {
        onClick: function(e) { e.stopPropagation(); onSelect(drill); },
        style: {
          width: '100%',
          padding: '11px',
          marginTop: 12,
          border: 'none',
          borderRadius: 10,
          background: (CATS[drill.category] && CATS[drill.category].bg) || 'rgba(34,197,94,0.12)',
          color: (CATS[drill.category] && CATS[drill.category].color) || '#22c55e',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          letterSpacing: '0.02em',
          fontFamily: 'inherit',
        }
      }, 'Start Drill →')
    )
  );
}

// ── DRILL DETAIL PAGE ────────────────────────────────────────────
function DrillDetailPage(props) {
  var drill = props.drill;
  var onBack = props.onBack;
  var [done, setDone] = useState(false);

  var p = DB.getProgress ? DB.getProgress() : {};
  var completions = (p.drill_completions || {});
  var count = completions[drill.id] || 0;

  function completeDrill() {
    if (done) return;
    setDone(true);
    var prog = DB.getProgress ? DB.getProgress() : {};
    prog.drills_done = (prog.drills_done || 0) + 1;
    if (!prog.drill_completions) prog.drill_completions = {};
    prog.drill_completions[drill.id] = (prog.drill_completions[drill.id] || 0) + 1;
    if (DB.saveProgress) DB.saveProgress(prog);
    if (awardXP) awardXP(drill.xp, 0, 'drill:' + drill.id);
    if (A.BrainEngine && A.BrainEngine.isModelTrained && A.BrainEngine.isModelTrained('DrillAdaptor')) {
      try {
        var sig = A.BrainEngine.buildDrillSignals(drill.id);
        A.BrainEngine.addSample('DrillAdaptor', sig, { shouldRetry: 0, shouldAdvance: 1, relevance_boost: 1 });
      } catch(e) {}
    }
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  var cat = CATS[drill.category] || CATS.all;
  var lvl = LEVEL_COLORS[drill.level] || LEVEL_COLORS.beginner;
  var mechInfo = MECHANIC_INFO[drill.appMechanic] || { label: drill.appMechanic, emoji: '⚙️', desc: '' };

  var s = {
    page: { background: '#0d1117', minHeight: '100vh', color: '#f0fdf4', fontFamily: 'system-ui,sans-serif' },
    header: {
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #30363d', padding: '12px 16px',
      display: 'flex', alignItems: 'center', gap: 12,
    },
    backBtn: {
      background: 'rgba(255,255,255,0.06)', border: '1px solid #30363d',
      borderRadius: 8, padding: '6px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: 13,
    },
    body: { padding: '20px 16px', maxWidth: 640, margin: '0 auto' },
    sectionBox: { borderRadius: 12, padding: '14px 16px', marginBottom: 14 },
    sectionTitle: { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, opacity: 0.7 },
  };

  return h('div', { style: s.page },
    // Header
    h('div', { style: s.header },
      h('button', { style: s.backBtn, onClick: onBack }, '← Back'),
      h('div', { style: { flex: 1 } },
        h('div', { style: { fontSize: 15, fontWeight: 700, color: '#f0fdf4' } }, drill.name),
        h('div', { style: { fontSize: 11, color: cat.color, marginTop: 2 } }, cat.emoji + ' ' + cat.label)
      )
    ),

    h('div', { style: s.body },
      // Hero row
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 } },
        h('span', { style: { fontSize: 52, lineHeight: 1 } }, drill.emoji),
        h('div', { style: { flex: 1 } },
          h('div', { style: { fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginBottom: 6 } }, drill.name),
          h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
            h('span', { style: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: lvl.bg, color: lvl.text } }, drill.level),
            h('span', { style: { fontSize: 11, color: '#9ca3af', padding: '3px 0' } }, '⏱ ' + drill.duration),
            h('span', { style: { fontSize: 11, color: '#fbbf24', padding: '3px 0' } }, '⚡ ' + drill.xp + ' XP'),
            count > 0 && h('span', { style: { fontSize: 11, color: '#34d399', padding: '3px 0' } }, '✓ Completed ' + count + 'x')
          )
        )
      ),

      // Problem + Why It Matters
      (drill.problem || drill.whyItMatters) && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#34d399' }) }, 'The Problem This Fixes'),
        drill.problem && h('div', { style: { fontSize: 14, color: '#d1fae5', lineHeight: 1.6, marginBottom: drill.whyItMatters ? 10 : 0 } }, drill.problem),
        drill.whyItMatters && h('div', { style: { fontSize: 13, color: '#6ee7b7', lineHeight: 1.5, fontStyle: 'italic' } }, drill.whyItMatters)
      ),

      // Mechanic Info
      h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }) },
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
      (drill.baseline || drill.measurement || drill.masteryThreshold) && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#60a5fa' }) }, 'Measurement & Mastery'),
        drill.baseline && h('div', { style: { marginBottom: 8 } },
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 } }, 'Baseline'),
          h('div', { style: { fontSize: 13, color: '#bfdbfe', lineHeight: 1.5 } }, drill.baseline)
        ),
        drill.measurement && h('div', { style: { marginBottom: 8 } },
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 } }, 'Track'),
          h('div', { style: { fontSize: 13, color: '#bfdbfe', lineHeight: 1.5 } }, drill.measurement)
        ),
        drill.masteryThreshold && h('div', null,
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: 3 } }, 'Mastery Criterion'),
          h('div', { style: { fontSize: 13, color: '#93c5fd', fontWeight: 600, lineHeight: 1.5 } }, '🎯 ' + drill.masteryThreshold)
        )
      ),

      // Video
      h('div', { style: { marginBottom: 14 } },
        h(VideoPlayer, { drill: drill })
      ),

      // Equipment
      drill.equipment && drill.equipment.length > 0 && h('div', { style: Object.assign({}, s.sectionBox, { background: '#161b22', border: '1px solid #30363d' }) },
        h('div', { style: s.sectionTitle }, 'Equipment'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          drill.equipment.map(function(item, i) {
            return h('span', { key: i, style: {
              fontSize: 12, padding: '3px 9px', borderRadius: 6,
              background: 'rgba(255,255,255,0.05)', color: '#d1d5db',
              border: '1px solid #374151',
            }}, item);
          })
        )
      ),

      // Steps
      (drill.steps && drill.steps.length > 0) && h('div', { style: Object.assign({}, s.sectionBox, { background: '#161b22', border: '1px solid #30363d' }) },
        h('div', { style: s.sectionTitle }, 'How To Do It'),
        drill.steps.map(function(step, i) {
          return h('div', { key: i, style: { display: 'flex', gap: 12, marginBottom: i < drill.steps.length - 1 ? 12 : 0 } },
            h('div', { style: {
              minWidth: 24, height: 24, borderRadius: '50%', background: 'rgba(22,163,74,0.2)',
              color: '#4ade80', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}, i + 1),
            h('div', { style: { fontSize: 14, color: '#e5e7eb', lineHeight: 1.55, paddingTop: 2 } }, step)
          );
        })
      ),

      // Key Focus
      drill.keyFocus && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', textAlign: 'center' }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#fbbf24' }) }, 'Key Mental Cue'),
        h('div', { style: { fontSize: 18, fontWeight: 800, color: '#fde68a', lineHeight: 1.4 } }, '"' + drill.keyFocus + '"')
      ),

      // Common Error
      drill.commonError && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#f87171' }) }, 'Most Common Mistake'),
        h('div', { style: { fontSize: 14, color: '#fca5a5', lineHeight: 1.55 } }, '⚠️ ' + drill.commonError)
      ),

      // Outcome
      drill.outcome && h('div', { style: Object.assign({}, s.sectionBox, { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }) },
        h('div', { style: Object.assign({}, s.sectionTitle, { color: '#34d399' }) }, 'After Mastery'),
        h('div', { style: { fontSize: 14, color: '#a7f3d0', lineHeight: 1.55 } }, '✅ ' + drill.outcome)
      ),

      // Fit Tags
      drill.fit && h('div', { style: Object.assign({}, s.sectionBox, { background: '#161b22', border: '1px solid #30363d' }) },
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

      // Complete Button
      h('div', { style: { padding: '20px 0 40px' } },
        h('button', {
          onClick: completeDrill,
          disabled: done,
          style: {
            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
            background: done ? 'rgba(22,163,74,0.3)' : 'linear-gradient(135deg,#16a34a,#15803d)',
            color: done ? '#4ade80' : '#fff',
            fontSize: 16, fontWeight: 700, cursor: done ? 'default' : 'pointer',
            transition: 'opacity 0.2s',
          },
        }, done ? '✅ Completed — +' + drill.xp + ' XP' : '✅ Mark as Complete (+' + drill.xp + ' XP)')
      )
    )
  );
}

// ── DRILLS PAGE ───────────────────────────────────────────────────
function DrillsPage() {
  var [activeCat, setActiveCat]         = useState('all');
  var [search, setSearch]               = useState('');
  var [levelFilter, setLevelFilter]     = useState('all');
  var [selectedDrill, setSelectedDrill] = useState(null);
  var [showPicks, setShowPicks]         = useState(false);

  var rawDrills = A.DRILLS || [];
  var DRILLS = rawDrills.map(normDrill);

  var progress = DB.getProgress ? DB.getProgress() : {};
  var completions = progress.drill_completions || {};

  var user = DB.getUser ? DB.getUser() : null;
  var pickDrills = [];
  if (A.PersonalisationEngine && user && A.PersonalisationEngine.getPickDrills) {
    try {
      pickDrills = A.PersonalisationEngine.getPickDrills(DRILLS, user, Object.keys(completions)) || [];
    } catch(e) {}
  }
  var pickIds = {};
  pickDrills.forEach(function(d) { pickIds[d.id] = true; });

  var filtered = DRILLS.filter(function(d) {
    if (showPicks) return !!pickIds[d.id];
    var catMatch = activeCat === 'all' || d.category === activeCat;
    var lvlMatch = levelFilter === 'all' || d.level === levelFilter;
    var q = search.toLowerCase();
    var searchMatch = !q
      || d.name.toLowerCase().indexOf(q) > -1
      || (d.problem && d.problem.toLowerCase().indexOf(q) > -1)
      || (d.keyFocus && d.keyFocus.toLowerCase().indexOf(q) > -1)
      || d.category.toLowerCase().indexOf(q) > -1;
    return catMatch && lvlMatch && searchMatch;
  });

  if (selectedDrill) {
    return h(DrillDetailPage, {
      drill: selectedDrill,
      onBack: function() { setSelectedDrill(null); },
    });
  }

  var s = {
    page: { background: '#0d1117', minHeight: '100vh', color: '#f0fdf4', fontFamily: 'system-ui,sans-serif' },
    header: {
      background: '#0d1117', borderBottom: '1px solid #30363d',
      padding: '16px 16px 0',
    },
    title: { fontSize: 22, fontWeight: 800, color: '#f0fdf4', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#6b7280', marginBottom: 14 },
    searchRow: { display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' },
    searchInput: {
      width: '100%', boxSizing: 'border-box',
      background: 'rgba(16,22,36,0.9)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 99, padding: '9px 16px 9px 40px', color: '#e2e8f0',
      fontSize: 14, outline: 'none',
    },
    select: {
      background: 'rgba(16,22,36,0.9)', border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 99, padding: '8px 14px', color: '#e2e8f0',
      fontSize: 12, outline: 'none', cursor: 'pointer',
    },
    catScroll: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, WebkitOverflowScrolling: 'touch' },
    catBtn: function(active, cat) {
      return {
        flexShrink: 0, padding: '8px 16px', borderRadius: 99, border: '1px solid',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
        borderColor: active ? cat.color : 'rgba(255,255,255,0.08)',
        background: active ? cat.bg : 'transparent',
        color: active ? cat.color : '#64748b',
        boxShadow: active ? ('0 0 12px ' + cat.color + '33') : 'none',
      };
    },
    picksBtn: function(active) {
      return {
        flexShrink: 0, padding: '8px 16px', borderRadius: 99, border: '1px solid',
        fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
        borderColor: active ? '#34d399' : 'rgba(255,255,255,0.08)',
        background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
        color: active ? '#34d399' : '#64748b',
        boxShadow: active ? '0 0 12px rgba(52,211,153,0.2)' : 'none',
      };
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
      gap: 14, padding: '14px 16px 100px', maxWidth: 960, margin: '0 auto',
    },
    emptyMsg: { textAlign: 'center', padding: '80px 20px', color: '#6b7280' },
    statsBar: {
      display: 'flex', gap: 16, padding: '10px 16px',
      borderBottom: '1px solid #21262d', background: 'rgba(22,27,34,0.5)',
    },
  };

  var totalDone = Object.keys(completions).length;
  var totalDrills = DRILLS.length;

  return h('div', { style: s.page },
    h('div', { style: s.header },
      h('div', { style: s.title }, '🏏 Drills'),
      h('div', { style: s.subtitle }, totalDrills + ' drills · ' + totalDone + ' completed'),

      // Stats bar
      totalDrills > 0 && h('div', { style: { marginBottom: 12 } },
        h('div', { style: { height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' } },
          h('div', { style: {
            height: '100%', borderRadius: 99,
            width: Math.round((totalDone / totalDrills) * 100) + '%',
            background: 'linear-gradient(90deg, #22c55e, #4ade80)',
            transition: 'width 0.5s',
            boxShadow: '0 0 10px rgba(74,222,128,0.5)',
          }})
        )
      ),

      // Search + Level filter
      h('div', { style: s.searchRow },
        h('div', { style: { flex: 1, position: 'relative' } },
          h('span', { style: {
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            fontSize: 14, pointerEvents: 'none', color: '#475569',
          } }, '🔍'),
          h('input', {
            style: s.searchInput,
            placeholder: 'Search drills…',
            value: search,
            onChange: function(e) { setSearch(e.target.value); },
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

      // Category tabs + Picks
      h('div', { style: s.catScroll },
        pickDrills.length > 0 && h('button', {
          style: s.picksBtn(showPicks),
          onClick: function() { setShowPicks(!showPicks); setActiveCat('all'); },
        }, '⭐ For You (' + pickDrills.length + ')'),
        Object.keys(CATS).map(function(key) {
          var cat = CATS[key];
          var active = !showPicks && activeCat === key;
          return h('button', {
            key: key,
            style: s.catBtn(active, cat),
            onClick: function() { setActiveCat(key); setShowPicks(false); },
          }, cat.emoji + ' ' + cat.label);
        })
      )
    ),

    // Results count
    h('div', { style: { padding: '10px 16px', fontSize: 12, color: '#6b7280' } },
      filtered.length + ' drill' + (filtered.length !== 1 ? 's' : '') +
      (showPicks ? ' picked for you' : activeCat !== 'all' ? ' in ' + CATS[activeCat].label : '')
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
      : h('div', { style: s.grid },
          filtered.map(function(drill) {
            return h(DrillCard, {
              key: drill.id,
              drill: drill,
              onSelect: setSelectedDrill,
              isPick: !!pickIds[drill.id],
              completions: completions,
            });
          })
        )
  );
}

A.DrillsPage = DrillsPage;
console.log('[SC] app-drills v5.0 — ' + (A.DRILLS ? A.DRILLS.length : 0) + ' drills available');
})();
