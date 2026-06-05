// app-mascot.js — Crick v2.0
// Cricket ball mascot with dynamic color theming + GSAP animations
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A         = window.SC_APP;
A.Emotion     = A.Emotion || {};

// ── Crick Color System ───────────────────────────────────────────
var CRICK_COLORS = {
  classic:  { id:'classic',  name:'Classic Red',    fill:'#b91c1c', stroke:'#7f1d1d', seam:'#7f1d1d', cost:0   },
  forest:   { id:'forest',   name:'Forest Green',   fill:'#15803d', stroke:'#14532d', seam:'#166534', cost:100 },
  ocean:    { id:'ocean',    name:'Ocean Blue',     fill:'#1d4ed8', stroke:'#1e3a8a', seam:'#1e40af', cost:150 },
  midnight: { id:'midnight', name:'Midnight Black', fill:'#1e1b4b', stroke:'#0f0f1a', seam:'#312e81', cost:200 },
  golden:   { id:'golden',   name:'Gold Edition',   fill:'#b45309', stroke:'#78350f', seam:'#92400e', cost:350 },
  galaxy:   { id:'galaxy',   name:'Galaxy Purple',  fill:'#6d28d9', stroke:'#4c1d95', seam:'#5b21b6', cost:500 },
};
A.CRICK_COLORS = CRICK_COLORS;

A.getCrickColor = function() {
  var id = (A.DB && A.DB.get('crick_active_color')) || 'classic';
  return CRICK_COLORS[id] || CRICK_COLORS.classic;
};
A.getUnlockedColors = function() {
  return (A.DB && A.DB.get('crick_unlocked_colors')) || ['classic'];
};

// ── MascotSVG — the visible cricket ball character ────────────────
// Renders an inline SVG with stable DOM ids so GSAP can target them.
// size: 'sm' (48px) | 'md' (80px) | 'lg' (120px) | 'xl' (180px)
function MascotSVG(props) {
  var size   = props.size === 'sm' ? 48 : props.size === 'lg' ? 120 : props.size === 'xl' ? 180 : 80;
  var rootId = props.id || 'em-mascot-main'; // allow multiple instances via custom id
  // Reactively read active color so color changes re-render
  var [colorKey, setColorKey] = useState(function() {
    return (A.DB && A.DB.get('crick_active_color')) || 'classic';
  });
  useEffect(function() {
    function onUpdate() {
      setColorKey((A.DB && A.DB.get('crick_active_color')) || 'classic');
    }
    window.addEventListener('sc_update', onUpdate);
    return function() { window.removeEventListener('sc_update', onUpdate); };
  }, []);
  var col = CRICK_COLORS[colorKey] || CRICK_COLORS.classic;

  return h('div', {
    id: rootId + '-wrap',
    style: {
      width: size, height: size, flexShrink: 0,
      display: 'inline-block', userSelect: 'none',
    },
    'aria-hidden': 'true',
  },
    h('svg', {
      id: rootId + '-svg',
      viewBox: '0 0 120 120',
      width: size, height: size,
      xmlns: 'http://www.w3.org/2000/svg',
      style: { overflow: 'visible', display: 'block' },
    },
      // ── Body: cricket ball ──────────────────────────────────────
      h('circle', {
        id: rootId + '-body',
        cx: 60, cy: 66, r: 42,
        fill: col.fill, stroke: col.stroke, strokeWidth: 1.5,
      }),
      // Seam arc top
      h('path', {
        d: 'M60 24 Q82 46 60 66 Q38 46 60 24',
        fill: 'none', stroke: col.seam, strokeWidth: 2, opacity: 0.7,
      }),
      // Seam arc bottom
      h('path', {
        d: 'M60 108 Q82 86 60 66 Q38 86 60 108',
        fill: 'none', stroke: col.seam, strokeWidth: 2, opacity: 0.7,
      }),

      // ── Eyes: sclera ───────────────────────────────────────────
      h('ellipse', { id: rootId + '-eye-l', cx: 43, cy: 54, rx: 10, ry: 10, fill: '#fff' }),
      h('ellipse', { id: rootId + '-eye-r', cx: 77, cy: 54, rx: 10, ry: 10, fill: '#fff' }),

      // ── Eyes: pupils ───────────────────────────────────────────
      h('circle', { id: rootId + '-pupil-l', cx: 43, cy: 54, r: 5.5, fill: '#1e1b4b' }),
      h('circle', { id: rootId + '-shine-l', cx: 45, cy: 52, r: 2,   fill: '#fff', opacity: 0.9 }),
      h('circle', { id: rootId + '-pupil-r', cx: 77, cy: 54, r: 5.5, fill: '#1e1b4b' }),
      h('circle', { id: rootId + '-shine-r', cx: 79, cy: 52, r: 2,   fill: '#fff', opacity: 0.9 }),

      // ── Smile ──────────────────────────────────────────────────
      h('path', {
        d: 'M46 77 Q60 90 74 77',
        fill: 'none', stroke: '#fff', strokeWidth: 2.5,
        strokeLinecap: 'round', opacity: 0.9,
      }),

      // ── Arms (hidden in idle) ───────────────────────────────────
      h('g', { id: rootId + '-arms', opacity: 0 },
        h('path', {
          d: 'M17 58 Q8 46 18 38',
          fill: 'none', stroke: '#ef4444', strokeWidth: 5, strokeLinecap: 'round',
        }),
        h('path', {
          d: 'M103 58 Q112 46 102 38',
          fill: 'none', stroke: '#ef4444', strokeWidth: 5, strokeLinecap: 'round',
        }),
      ),

      // ── Mini bat (hidden in idle) ───────────────────────────────
      h('g', { id: rootId + '-bat', opacity: 0, transform: 'translate(90,28) rotate(28)' },
        h('rect', { x: 0, y: 0, width: 6, height: 22, rx: 2, fill: '#d4a76a' }),
        h('rect', { x: -2, y: 18, width: 10, height: 13, rx: 3, fill: '#b8763a' }),
      ),

      // ── Sparkle particles (hidden in idle) ─────────────────────
      h('g', { id: rootId + '-sparkle', opacity: 0 },
        h('text', { x: 6,  y: 22, fontSize: 16, fill: '#fbbf24', fontFamily: 'system-ui' }, '✨'),
        h('text', { x: 90, y: 18, fontSize: 11, fill: '#4ade80', fontFamily: 'system-ui' }, '⭐'),
      ),
    )
  );
}

// ── MascotController — singleton GSAP state machine ──────────────
// Renders nothing (null). Mounts once in app-root.js.
// Controls the MascotSVG via GSAP targeting stable DOM ids.
function MascotController() {
  var stateRef   = useRef('idle');
  var blinkTimer = useRef(null);
  var idleTweens = useRef([]);
  var cheerTl    = useRef(null);

  function rootId(part) { return '#em-mascot-main-' + part; }

  function killAll() {
    var gsap = window.gsap;
    if (!gsap) return;
    idleTweens.current.forEach(function (t) { try { t.kill(); } catch (e) {} });
    idleTweens.current = [];
    if (cheerTl.current) { try { cheerTl.current.kill(); } catch (e) {} cheerTl.current = null; }
    if (blinkTimer.current) { clearTimeout(blinkTimer.current); blinkTimer.current = null; }
  }

  function startIdle() {
    var gsap = window.gsap;
    if (!gsap) return;
    stateRef.current = 'idle';

    // Pupils oscillate left ↔ right
    idleTweens.current.push(
      gsap.to([rootId('pupil-l'), rootId('shine-l')], {
        attr: { cx: '+=5' }, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1,
      }),
      gsap.to([rootId('pupil-r'), rootId('shine-r')], {
        attr: { cx: '+=5' }, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.12,
      }),
      // Body subtle breathe
      gsap.to(rootId('body'), {
        scaleY: 1.025, transformOrigin: '60px 108px',
        duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
    );

    scheduleBlink();
  }

  function scheduleBlink() {
    var delay = 2200 + Math.random() * 2800;
    blinkTimer.current = setTimeout(function () {
      if (stateRef.current !== 'idle') return;
      var gsap = window.gsap;
      if (!gsap) return;
      var tl = gsap.timeline();
      tl.to([rootId('eye-l'), rootId('eye-r')], {
        scaleY: 0.05, transformOrigin: '50% 50%', duration: 0.08,
      }).to([rootId('eye-l'), rootId('eye-r')], {
        scaleY: 1, transformOrigin: '50% 50%', duration: 0.13,
      });
      scheduleBlink();
    }, delay);
  }

  function startCheer() {
    if (A.Emotion.prefersReducedMotion()) return;

    // Bring fixed host to full opacity during cheer, then fade back
    var host = document.getElementById('em-mascot-fixed-host');
    if (host) {
      host.style.opacity = '1';
      host.style.transform = 'scale(1.15)';
      setTimeout(function () {
        if (host) { host.style.opacity = '0.7'; host.style.transform = 'scale(1)'; }
      }, 2400);
    }

    var gsap = window.gsap;
    if (!gsap) {
      // CSS fallback: toggle the existing mascot class
      var bodyEl = document.getElementById('em-mascot-main-body');
      if (bodyEl) {
        bodyEl.style.animation = 'em-mascot-cheer 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards';
        setTimeout(function () {
          if (bodyEl) bodyEl.style.animation = '';
          startIdle();
        }, 2200);
      }
      return;
    }

    killAll();
    stateRef.current = 'cheer';

    // Reset pupils to center before cheering
    gsap.set(rootId('pupil-l'), { attr: { cx: 43 } });
    gsap.set(rootId('shine-l'), { attr: { cx: 45 } });
    gsap.set(rootId('pupil-r'), { attr: { cx: 77 } });
    gsap.set(rootId('shine-r'), { attr: { cx: 79 } });

    var tl = gsap.timeline({
      onComplete: function () {
        // Reset optional elements
        gsap.set([rootId('arms'), rootId('bat'), rootId('sparkle')], { opacity: 0 });
        gsap.set(rootId('body'), { y: 0, scaleY: 1 });
        gsap.set([rootId('eye-l'), rootId('eye-r')], { scaleY: 1 });
        startIdle();
      },
    });
    cheerTl.current = tl;

    tl
      // Eyes grow with back-easing
      .to([rootId('eye-l'), rootId('eye-r')], {
        scaleY: 1.28, transformOrigin: '50% 50%', duration: 0.15, ease: 'back.out(2)',
      })
      // Body bounce up
      .to(rootId('body'), { y: -9, duration: 0.2, ease: 'power2.out' }, 0)
      .to(rootId('body'), { y: 0,  duration: 0.38, ease: 'elastic.out(1.1, 0.4)' }, 0.2)
      // Arms appear
      .to(rootId('arms'), { opacity: 1, duration: 0.1 }, 0)
      // Bat swings in
      .to(rootId('bat'), {
        opacity: 1, rotation: 14, transformOrigin: 'bottom left',
        duration: 0.25, ease: 'back.out(1.7)',
      }, 0.12)
      // Sparkles fade in + spin
      .to(rootId('sparkle'), {
        opacity: 1, rotation: 35, transformOrigin: '60px 60px',
        duration: 0.38, ease: 'power2.out',
      }, 0.18)
      // Arms wave 3 times
      .to(rootId('arms'), {
        rotation: '-=28', transformOrigin: '60px 90px',
        yoyo: true, repeat: 3, duration: 0.17, ease: 'power1.inOut',
      }, 0.22)
      // Eyes return to normal
      .to([rootId('eye-l'), rootId('eye-r')], { scaleY: 1, duration: 0.2 }, 0.55)
      // Hold for 1.4s then fade out cheer elements
      .to([rootId('arms'), rootId('bat'), rootId('sparkle')], {
        opacity: 0, duration: 0.3,
      }, 1.85);
  }

  useEffect(function () {
    // Small delay so React has mounted MascotSVG into DOM
    var initTimer = setTimeout(function () { startIdle(); }, 600);

    // Wire to emotion bus
    function onCheer()  { startCheer(); }
    A.Emotion.on('sc_badge_unlock',          onCheer);
    A.Emotion.on('sc_daily_reward_claimed',  onCheer);
    A.Emotion.on('sc_first_session',         onCheer);

    // Public API for imperative calls (e.g. onboarding "Let's Start!")
    A.Emotion.cheerMascot = startCheer;

    return function () {
      clearTimeout(initTimer);
      killAll();
      A.Emotion.off('sc_badge_unlock',         onCheer);
      A.Emotion.off('sc_daily_reward_claimed', onCheer);
      A.Emotion.off('sc_first_session',        onCheer);
    };
  }, []);

  return null; // no visible output — controls SVG via DOM ids
}

A.Mascot           = MascotSVG;
A.MascotController = MascotController;
// Crick aliases
A.Crick            = MascotSVG;
A.CrickController  = MascotController;

console.log('[SC] Crick v2.0 ready — color system active');
})();
