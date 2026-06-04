// ================================================================
// app-vibe.js — SmartCrick Vibe Coding Blueprint v1.0
// Loaded LAST in index.html (after app-root.js)
// Adds: haptics, spring interactions, stagger entrance, count-up
//       numbers, scroll reveals, mascot states, bottom nav upgrade,
//       contextual speech, card tilt, pull-to-refresh, visual polish
// ================================================================
(function () {
'use strict';

var A  = window.SC_APP;
var h  = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;

// ── SC_VIBE namespace ─────────────────────────────────────────────
var SC_VIBE = {};
window.SC_VIBE = SC_VIBE;
A.Vibe = SC_VIBE;

// ─────────────────────────────────────────────────────────────────
// 1. HAPTICS — tactile feedback via Vibration API
// ─────────────────────────────────────────────────────────────────
var HAPTIC_PATTERNS = {
  light:    8,
  medium:   15,
  heavy:    50,
  success:  [50, 30, 100],
  error:    [100, 50, 100],
  select:   12,
  tick:     6,
};

SC_VIBE.haptic = function (type) {
  if (!navigator.vibrate) return;
  // Respect reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  try {
    navigator.vibrate(HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS.light);
  } catch (e) {}
};

// Wrap a click handler with haptic
SC_VIBE.wrapClick = function (fn, type) {
  return function (e) {
    SC_VIBE.haptic(type || 'light');
    if (fn) fn(e);
  };
};

// Global haptic delegation — fires on all card/button presses
document.addEventListener('pointerdown', function (e) {
  var card = e.target.closest('.sc-card, .stat-card, .pro-card');
  if (card) { SC_VIBE.haptic('light'); return; }
  var btn = e.target.closest('.btn-primary');
  if (btn) { SC_VIBE.haptic('medium'); }
}, { passive: true });

// ─────────────────────────────────────────────────────────────────
// 2. SPRING PRESS — physical button feel via CSS transform
// ─────────────────────────────────────────────────────────────────
SC_VIBE.applySpring = function (el, opts) {
  if (!el || el._vibeSpring) return;
  el._vibeSpring = true;
  opts = opts || {};
  var pressScale = opts.pressScale || 0.95;

  el.addEventListener('pointerdown', function () {
    el.style.transform = 'scale(' + pressScale + ')';
    el.style.transition = 'transform 80ms cubic-bezier(0.34,1.56,0.64,1)';
  }, { passive: true });

  function release() {
    el.style.transform = 'scale(1)';
    el.style.transition = 'transform 400ms cubic-bezier(0.34,1.56,0.64,1)';
  }
  el.addEventListener('pointerup',     release, { passive: true });
  el.addEventListener('pointercancel', release, { passive: true });
  el.addEventListener('pointerleave',  release, { passive: true });
};

// Apply to all buttons and cards on each page render
SC_VIBE.applySpringToPage = function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(function (el) {
    SC_VIBE.applySpring(el, { pressScale: 0.96 });
  });
  document.querySelectorAll('.sc-card').forEach(function (el) {
    SC_VIBE.applySpring(el, { pressScale: 0.985 });
  });
};

// ─────────────────────────────────────────────────────────────────
// 3. NUMBER COUNT-UP — XP and stats animate when they appear
// ─────────────────────────────────────────────────────────────────
SC_VIBE.countUp = function (el, from, to, duration) {
  if (!el) return;
  duration = duration || 900;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = Math.round(to).toLocaleString();
    return;
  }
  var start = null;
  var range = to - (from || 0);
  function tick(ts) {
    if (!start) start = ts;
    var elapsed = ts - start;
    var progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round((from || 0) + range * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
};

// Activate all elements with data-count-to attribute
SC_VIBE.activateCounters = function () {
  document.querySelectorAll('[data-count-to]:not([data-counted])').forEach(function (el) {
    el.setAttribute('data-counted', '1');
    var target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) return;
    SC_VIBE.countUp(el, 0, target, 900);
  });
};

// ─────────────────────────────────────────────────────────────────
// 4. STAGGER ENTRANCE — cards fan in on every page load
// ─────────────────────────────────────────────────────────────────
SC_VIBE.staggerIn = function (containerEl, delayStep) {
  if (!containerEl) return;
  delayStep = delayStep || 50;
  Array.from(containerEl.children).forEach(function (el, i) {
    var delay = Math.min(i * delayStep, 340);
    // Kill existing animation, force reflow, then re-trigger with new delay
    el.style.animation = 'none';
    void el.offsetHeight;
    el.style.animation = 'scStaggerIn 320ms cubic-bezier(0.16,1,0.3,1) ' + delay + 'ms both';
  });
};

// Scan page for .sc-stagger containers and apply stagger
SC_VIBE.applyStagger = function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.sc-stagger').forEach(function (container) {
    if (container._vibeStaggered) return;
    container._vibeStaggered = true;
    SC_VIBE.staggerIn(container, 50);
  });
  document.querySelectorAll('.sc-stagger-grid').forEach(function (container) {
    if (container._vibeStaggered) return;
    container._vibeStaggered = true;
    SC_VIBE.staggerIn(container, 45);
  });
};

// Reset stagger on page change so it re-fires
SC_VIBE.resetStagger = function () {
  document.querySelectorAll('.sc-stagger, .sc-stagger-grid').forEach(function (c) {
    c._vibeStaggered = false;
  });
};

// ─────────────────────────────────────────────────────────────────
// 5. GSAP SCROLL REVEAL — content sections animate on scroll
// ─────────────────────────────────────────────────────────────────
SC_VIBE.initScrollReveal = function () {
  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  if (!gsap || !ST) return;

  // Register plugin (safe to call multiple times)
  try { gsap.registerPlugin(ST); } catch (e) {}

  SC_VIBE._refreshScrollTriggers = function () {
    // Kill existing triggers
    ST.getAll().forEach(function (t) { try { t.kill(); } catch (e) {} });

    // Find the actual scrolling container (the main content div in app-root)
    var scroller = null;
    var mainDiv = document.querySelector('#root > div > div');
    if (mainDiv) {
      // Walk through children to find the overflow-y:auto div
      var children = mainDiv.children;
      for (var i = 0; i < children.length; i++) {
        var style = window.getComputedStyle(children[i]);
        if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
          scroller = children[i];
          break;
        }
      }
    }

    // Create reveal triggers
    document.querySelectorAll('.sc-reveal:not(.sc-revealed)').forEach(function (el) {
      // If already in viewport, reveal immediately
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add('sc-revealed');
        return;
      }
      ST.create({
        trigger: el,
        start: 'top 90%',
        scroller: scroller || window,
        onEnter: function () { el.classList.add('sc-revealed'); },
        once: true,
      });
    });

    try { ST.refresh(); } catch (e) {}
  };

  SC_VIBE._refreshScrollTriggers();
};

// ─────────────────────────────────────────────────────────────────
// 6. BOTTOM NAV UPGRADE — filled icons + spring bounce + haptics
// ─────────────────────────────────────────────────────────────────

// Filled icon SVG paths (solid fill for active state)
var NAV_ICONS_FILLED = {
  home: '<path fill="currentColor" stroke="none" d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-1.97-1.97V6a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75v1.811L12.53 4.28a.75.75 0 0 0-1.06 0l-8.69 8.69a.75.75 0 1 0 1.06 1.061l8.16-8.16zm.53 2.068L12 5.909l-7.25 7.25V19.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-4.5h2.5v4.5a.75.75 0 0 0 .75.75h4.5a.75.75 0 0 0 .75-.75v-6.34l-7.25-7.252z"/>',
  bat:  '<path fill="currentColor" stroke="none" d="M3 21l3.5-3.5 1.1 3.9L3 21zm2.8-3.2L16.5 7.1a2.3 2.3 0 000-3.2L15.2 2.6a2.3 2.3 0 00-3.2 0L2.4 13l-1 1 1.1 4.4 3.3.4z"/>',
  barChart: '<rect fill="currentColor" stroke="none" x="3" y="9" width="4" height="11" rx="1"/><rect fill="currentColor" stroke="none" x="10" y="3" width="4" height="17" rx="1"/><rect fill="currentColor" stroke="none" x="17" y="6" width="4" height="14" rx="1"/>',
  user: '<circle fill="currentColor" stroke="none" cx="12" cy="7" r="4"/><path fill="currentColor" stroke="none" d="M4 21v-2a8 8 0 0116 0v2H4z"/>',
};

(function patchBottomNav() {
  var _origBottomNav = A.BottomNav;
  if (!_origBottomNav) return;

  function VibeBottomNav(props) {
    var activePage = props.page || props.currentPage || '';
    var [lastTapped, setLastTapped] = useState(null);

    var items = [
      { n: 'home',     label: 'Today',    pg: 'Home' },
      { n: 'bat',      label: 'Train',    pg: 'Drills' },
      { n: 'barChart', label: 'Progress', pg: 'Progress' },
      { n: 'user',     label: 'You',      pg: 'Profile' },
    ];

    return h('nav', {
      'aria-label': 'Main navigation',
      style: {
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        zIndex: 40,
        background: 'rgba(8,11,15,0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(36,42,50,0.9)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      },
    },
      h('div', { style: { display: 'flex', alignItems: 'center', height: 58 } },
        items.map(function (item) {
          var active  = activePage === item.pg;
          var tapped  = lastTapped === item.pg;
          var iconPath = active && NAV_ICONS_FILLED[item.n]
            ? NAV_ICONS_FILLED[item.n]
            : (A.IC ? A.IC[item.n] : '');

          return h('button', {
            key: item.pg,
            onPointerDown: function () {
              // Zero-latency: fire haptic + audio + nav simultaneously
              SC_VIBE.haptic('medium');
              if (A.UIAudio) A.UIAudio.tick();
              setLastTapped(item.pg);
              setTimeout(function () { setLastTapped(null); }, 420);
              A.nav(item.pg);
            },
            onClick: function (e) {
              // Keyboard activation only (detail===0 = no pointer)
              if (e.detail === 0) A.nav(item.pg);
            },
            'aria-label': item.label,
            'aria-current': active ? 'page' : undefined,
            style: {
              flex: 1,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 3, height: '100%',
              position: 'relative',
              background: 'transparent', border: 'none',
              cursor: 'pointer', padding: 0, outline: 'none',
            },
          },
            // Active accent bar at top
            active && h('div', {
              'aria-hidden': 'true',
              style: {
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 28, height: 3,
                background: 'linear-gradient(90deg, #16a34a, #22c55e)',
                borderRadius: '0 0 4px 4px',
              },
            }),
            // Icon + label with spring transform
            h('div', {
              'aria-hidden': 'true',
              style: {
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 3,
                transform: tapped
                  ? 'scale(0.82)'
                  : active ? 'scale(1.15)' : 'scale(1)',
                transition: tapped
                  ? 'transform 80ms ease'
                  : 'transform 420ms cubic-bezier(0.34,1.56,0.64,1)',
              },
            },
              h('svg', {
                viewBox: '0 0 24 24',
                width: 20, height: 20,
                fill: active && NAV_ICONS_FILLED[item.n] ? 'currentColor' : 'none',
                stroke: active && NAV_ICONS_FILLED[item.n] ? 'none' : 'currentColor',
                strokeWidth: 2,
                strokeLinecap: 'round', strokeLinejoin: 'round',
                style: {
                  color: active ? '#4ade80' : '#374151',
                  display: 'block',
                  transition: 'color 180ms ease',
                },
                dangerouslySetInnerHTML: { __html: iconPath },
              }),
              h('span', {
                style: {
                  fontSize: 10,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#4ade80' : '#374151',
                  transition: 'color 180ms ease',
                  letterSpacing: '-0.01em',
                  lineHeight: 1,
                },
              }, item.label)
            )
          );
        })
      )
    );
  }

  A.BottomNav = VibeBottomNav;
})();

// ─────────────────────────────────────────────────────────────────
// 7. MASCOT NEW STATES — personality-driven empty states
// ─────────────────────────────────────────────────────────────────
(function addMascotStates() {
  var gsap = window.gsap;
  if (!gsap) return;
  if (!A.Emotion) A.Emotion = {};

  function rootId(part) { return '#em-mascot-main-' + part; }

  // ── Searching state — wild pupil oscillation ──────────────────
  A.Emotion.mascotSearch = function () {
    if (!document.querySelector('#em-mascot-main-body')) return;
    gsap.killTweensOf([rootId('pupil-l'), rootId('pupil-r'), rootId('shine-l'), rootId('shine-r'), rootId('body')]);
    // Pupils dart left-right rapidly
    gsap.to([rootId('pupil-l'), rootId('shine-l')], {
      attr: { cx: '+=8' }, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 9,
    });
    gsap.to([rootId('pupil-r'), rootId('shine-r')], {
      attr: { cx: '-=8' }, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: 9, delay: 0.1,
    });
    // Body tilts while searching
    gsap.to(rootId('body'), {
      rotation: 7, transformOrigin: '60px 108px',
      duration: 0.55, ease: 'power2.inOut', yoyo: true, repeat: 4,
      onComplete: function () { gsap.set(rootId('body'), { rotation: 0 }); },
    });
  };

  // ── Confused state — error / unknown ─────────────────────────
  A.Emotion.mascotConfused = function () {
    if (!document.querySelector('#em-mascot-main-body')) return;
    gsap.killTweensOf([rootId('body'), rootId('eye-l'), rootId('eye-r')]);
    var tl = gsap.timeline();
    // Shake side-to-side
    tl.to(rootId('body'), {
      x: -6, duration: 0.07, ease: 'power1.inOut', yoyo: true, repeat: 7,
      onComplete: function () { gsap.set(rootId('body'), { x: 0 }); },
    });
    // Eyes go wide
    tl.to([rootId('eye-l'), rootId('eye-r')], {
      scaleX: 1.2, transformOrigin: '50% 50%', duration: 0.2,
    }, 0);
    setTimeout(function () {
      gsap.to([rootId('eye-l'), rootId('eye-r')], { scaleX: 1, duration: 0.3 });
    }, 1400);
  };

  // ── Sleeping state — inactive for a while ────────────────────
  var _sleepTl = null;
  A.Emotion.mascotSleep = function () {
    if (!document.querySelector('#em-mascot-main-body')) return;
    if (_sleepTl) return; // already sleeping
    gsap.killTweensOf([rootId('eye-l'), rootId('eye-r'), rootId('body')]);
    _sleepTl = gsap.timeline({ repeat: -1 });
    // Close eyes
    _sleepTl.to([rootId('eye-l'), rootId('eye-r')], {
      scaleY: 0.05, transformOrigin: '50% 50%', duration: 0.4, ease: 'power2.inOut',
    });
    // Gentle sway
    _sleepTl.to(rootId('body'), {
      rotation: 5, transformOrigin: '60px 108px',
      duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: 1,
    }, 0.3);
    A.Emotion._sleepTl = _sleepTl;
  };

  A.Emotion.mascotWakeUp = function () {
    if (_sleepTl) { _sleepTl.kill(); _sleepTl = null; A.Emotion._sleepTl = null; }
    if (!document.querySelector('#em-mascot-main-body')) return;
    gsap.to([rootId('eye-l'), rootId('eye-r')], {
      scaleY: 1, transformOrigin: '50% 50%', duration: 0.35,
    });
    gsap.set(rootId('body'), { rotation: 0 });
  };

  // ── Waving state — greeting on first load ─────────────────────
  A.Emotion.mascotWave = function () {
    if (!document.querySelector('#em-mascot-main-body')) return;
    var arms = document.querySelector(rootId('arms'));
    if (!arms) return;
    gsap.set(rootId('arms'), { opacity: 1 });
    gsap.to(rootId('arms'), {
      rotation: 22, transformOrigin: '60px 90px', ease: 'power1.inOut',
      yoyo: true, repeat: 5, duration: 0.2,
      onComplete: function () {
        gsap.to(rootId('arms'), { opacity: 0, duration: 0.25 });
        gsap.set(rootId('arms'), { rotation: 0, delay: 0.3 });
      },
    });
  };

  // Inactivity sleep detection
  var sleepTimer = null;
  var SLEEP_DELAY = 4 * 60 * 1000; // 4 minutes idle

  function resetSleepTimer() {
    clearTimeout(sleepTimer);
    if (_sleepTl) A.Emotion.mascotWakeUp();
    sleepTimer = setTimeout(function () {
      if (A.Emotion.mascotSleep) A.Emotion.mascotSleep();
    }, SLEEP_DELAY);
  }

  ['touchstart', 'click', 'keydown', 'scroll', 'pointermove'].forEach(function (evt) {
    document.addEventListener(evt, resetSleepTimer, { passive: true });
  });
  sleepTimer = setTimeout(function () {
    if (A.Emotion.mascotSleep) A.Emotion.mascotSleep();
  }, SLEEP_DELAY);
})();

// ─────────────────────────────────────────────────────────────────
// 8. CONTEXTUAL SPEECH BUBBLE — personality-driven home greeting
// ─────────────────────────────────────────────────────────────────
SC_VIBE.getMascotContext = function () {
  var p = A.DB ? A.DB.getProgress() : {};
  var streak = p.current_streak || 0;
  var hour = new Date().getHours();
  var drillsDone = p.drills_done || 0;
  var xp = p.total_xp || 0;

  // Priority messages
  if (streak >= 30) return "30-day streak! You're a legend, champion. 🏆";
  if (streak >= 14) return "Two weeks straight! Your commitment is elite. 🔥";
  if (streak >= 7)  return "Week-long streak! Champions are made in moments like this.";
  if (xp >= 10000)  return "10,000+ XP. The elite tier. Keep pushing.";
  if (drillsDone >= 50) return "50 drills done! Your muscle memory is building.";

  // Time of day
  if (hour < 6)  return "Night training? Champions are built in the dark. 🌙";
  if (hour < 12) return "Morning session! This is how champions are made. ☀️";
  if (hour < 17) return "Afternoon grind. Your wicket today.";
  if (hour < 21) return "Evening session — end the day like a champion.";
  return "Late night hustle. Your dedication is showing. 🏏";
};

// Inject speech bubble above mascot on Home page
SC_VIBE.showMascotSpeech = function () {
  var host = document.getElementById('em-mascot-fixed-host');
  if (!host) return;

  // Don't show if already visible
  if (document.getElementById('sc-speech-bubble')) return;

  var msg = SC_VIBE.getMascotContext();
  var bubble = document.createElement('div');
  bubble.id = 'sc-speech-bubble';
  bubble.className = 'sc-speech-bubble';
  bubble.textContent = msg;
  bubble.style.cssText = 'position:fixed;bottom:' + (72 + (parseFloat(window.getComputedStyle(document.body).getPropertyValue('--safe-area-inset-bottom') || '0'))) + 'px;right:8px;z-index:199;font-size:12px;max-width:200px;';

  document.body.appendChild(bubble);

  // Make mascot visible during speech
  host.style.opacity = '0.9';
  host.style.transform = 'scale(1.1)';

  setTimeout(function () {
    bubble.classList.add('sc-fade-out');
    host.style.opacity = '0.18';
    host.style.transform = 'scale(1)';
    setTimeout(function () {
      if (bubble.parentNode) bubble.parentNode.removeChild(bubble);
    }, 320);
  }, 4500);
};

// ─────────────────────────────────────────────────────────────────
// 9. ENHANCED EMPTY STATES — mascot-powered personality
// ─────────────────────────────────────────────────────────────────
(function patchEmptyState() {
  var _orig = A.EmptyState;
  if (!_orig) return;

  A.EmptyState = function (props) {
    var mascotState = props.mascotState || 'searching';
    var showMascot = props.showMascot !== false;

    useEffect(function () {
      if (!showMascot) return;
      // Trigger mascot state after a short delay
      var t = setTimeout(function () {
        if (mascotState === 'searching' && A.Emotion && A.Emotion.mascotSearch) {
          A.Emotion.mascotSearch();
        } else if (mascotState === 'confused' && A.Emotion && A.Emotion.mascotConfused) {
          A.Emotion.mascotConfused();
        }
      }, 400);
      return function () { clearTimeout(t); };
    }, [mascotState, showMascot]);

    // Render original EmptyState — mascot reacts via GSAP on the fixed host
    return _orig(props);
  };
})();

// ─────────────────────────────────────────────────────────────────
// 10. 3D CARD TILT — desktop hover effect
// ─────────────────────────────────────────────────────────────────
(function initCardTilt() {
  // Mouse-only (not touch devices)
  if (window.matchMedia('(hover: none)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('mousemove', function (e) {
    var card = e.target.closest('[data-tilt]');
    if (!card) return;
    var rect = card.getBoundingClientRect();
    var dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    var dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    var tilt = 5;
    card.style.transform = 'perspective(600px) rotateY(' + (dx * tilt) + 'deg) rotateX(' + (-dy * tilt) + 'deg) scale(1.018) translateZ(4px)';
    card.style.transition = 'transform 80ms ease';
  }, { passive: true });

  document.addEventListener('mouseleave', function (e) {
    var card = e.target.closest('[data-tilt]');
    if (!card) return;
    card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) scale(1) translateZ(0)';
    card.style.transition = 'transform 500ms cubic-bezier(0.16,1,0.3,1)';
  }, { passive: true, capture: true });
})();

// ─────────────────────────────────────────────────────────────────
// 11. PULL-TO-REFRESH — visual feedback on top-of-page pull
// ─────────────────────────────────────────────────────────────────
(function initPullToRefresh() {
  var indicator = document.createElement('div');
  indicator.id = 'sc-ptr';
  indicator.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>';
  indicator.style.cssText = [
    'position:fixed',
    'top:calc(58px + env(safe-area-inset-top,0px))',
    'left:50%',
    'transform:translateX(-50%) translateY(-48px)',
    'width:36px;height:36px',
    'background:rgba(22,30,48,0.95)',
    'border:1px solid rgba(34,197,94,0.3)',
    'border-radius:50%',
    'display:flex;align-items:center;justify-content:center',
    'z-index:100',
    'transition:transform 0.22s cubic-bezier(0.16,1,0.3,1)',
    'box-shadow:0 2px 12px rgba(0,0,0,0.5)',
    'pointer-events:none',
  ].join(';');
  document.body.appendChild(indicator);

  var startY = 0, pulling = false, threshold = 64;

  function isAtTop() { return window.scrollY <= 2; }

  document.addEventListener('touchstart', function (e) {
    if (!isAtTop()) return;
    startY = e.touches[0].clientY;
    pulling = true;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    if (!pulling) return;
    var dy = e.touches[0].clientY - startY;
    if (dy > 12) {
      indicator.style.transform = 'translateX(-50%) translateY(' + Math.min(dy * 0.5, 16) + 'px)';
    }
  }, { passive: true });

  document.addEventListener('touchend', function () {
    if (!pulling) return;
    pulling = false;
    indicator.style.transform = 'translateX(-50%) translateY(-48px)';
    var svgEl = indicator.querySelector('svg');
    if (svgEl) {
      svgEl.style.animation = 'spin 0.7s linear infinite';
      svgEl.style.display = 'block';
    }
    window.dispatchEvent(new CustomEvent('sc_update'));
    SC_VIBE.haptic('medium');
    setTimeout(function () {
      if (svgEl) svgEl.style.animation = '';
    }, 700);
  }, { passive: true });
})();

// ─────────────────────────────────────────────────────────────────
// 12. XP BURST ANIMATION — floating +XP text on award
// ─────────────────────────────────────────────────────────────────
SC_VIBE.showXPBurst = function (amount, anchorEl) {
  if (!anchorEl) anchorEl = document.body;
  var rect = anchorEl.getBoundingClientRect ? anchorEl.getBoundingClientRect()
    : { top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 };
  var burst = document.createElement('div');
  burst.className = 'sc-xp-burst';
  burst.textContent = '+' + amount + ' XP';
  burst.style.left = (rect.left + rect.width / 2) + 'px';
  burst.style.top  = (rect.top + window.scrollY) + 'px';
  document.body.appendChild(burst);
  setTimeout(function () {
    if (burst.parentNode) burst.parentNode.removeChild(burst);
  }, 1200);
};

// ─────────────────────────────────────────────────────────────────
// 13. CATEGORY BORDER UTILITY — apply colored borders to cards
// ─────────────────────────────────────────────────────────────────
SC_VIBE.applyCategoryBorders = function () {
  var catMap = {
    batting: 'sc-cat-batting', bowling: 'sc-cat-bowling',
    fielding: 'sc-cat-fielding', wicketkeeping: 'sc-cat-wicketkeeping',
    fitness: 'sc-cat-fitness', mental: 'sc-cat-mental',
  };
  document.querySelectorAll('[data-category]').forEach(function (el) {
    var cat = el.getAttribute('data-category');
    var cls = catMap[cat];
    if (cls && !el.classList.contains(cls)) {
      // Remove other cat classes first
      Object.values(catMap).forEach(function (c) { el.classList.remove(c); });
      el.classList.add(cls);
    }
  });
};

// ─────────────────────────────────────────────────────────────────
// 14. HERO NUMBER FORMATTING — Rajdhani for big numbers
// ─────────────────────────────────────────────────────────────────
SC_VIBE.applyHeroNums = function () {
  document.querySelectorAll('[data-hero-num]:not([data-hero-applied])').forEach(function (el) {
    el.setAttribute('data-hero-applied', '1');
    el.classList.add('sc-hero-num');
    el.style.fontFamily = "'Rajdhani', 'Inter', system-ui, sans-serif";
    el.style.fontWeight = '700';
    el.style.fontVariantNumeric = 'tabular-nums';
    el.style.letterSpacing = '-0.01em';
  });
};

// ─────────────────────────────────────────────────────────────────
// 15. INITIALIZATION — runs on load and after each page change
// ─────────────────────────────────────────────────────────────────
SC_VIBE._initialized = false;

SC_VIBE.initPage = function () {
  // Reset stagger state on new page
  SC_VIBE.resetStagger();

  setTimeout(function () {
    SC_VIBE.applySpringToPage();
    SC_VIBE.applyStagger();
    SC_VIBE.activateCounters();
    SC_VIBE.applyCategoryBorders();
    SC_VIBE.applyHeroNums();

    if (SC_VIBE._refreshScrollTriggers) {
      SC_VIBE._refreshScrollTriggers();
    }
  }, 120);
};

SC_VIBE.init = function () {
  if (SC_VIBE._initialized) return;
  SC_VIBE._initialized = true;

  // Set up GSAP ScrollTrigger
  SC_VIBE.initScrollReveal();

  // Run on initial load
  setTimeout(function () {
    SC_VIBE.initPage();

    // Show speech bubble on Home page after a delay
    var route = window.location.hash || '';
    if (!route || route === '#/' || route.indexOf('Home') !== -1) {
      setTimeout(SC_VIBE.showMascotSpeech, 2200);
    }

    // Wave mascot on first ever visit
    var user = A.DB ? A.DB.getUser() : {};
    if (user.onboardDone && !A.DB.get('mascot_waved')) {
      setTimeout(function () {
        if (A.Emotion && A.Emotion.mascotWave) A.Emotion.mascotWave();
        if (A.DB) A.DB.set('mascot_waved', true);
      }, 1800);
    }
  }, 600);

  // Re-run on every page navigation
  window.addEventListener('hashchange', function () {
    SC_VIBE.initPage();

    // Show speech bubble only on Home page
    setTimeout(function () {
      var route = window.location.hash || '';
      if (route.indexOf('Home') !== -1 || route === '#/') {
        SC_VIBE.showMascotSpeech();
      }
    }, 800);
  });

  // Re-run when data updates
  window.addEventListener('sc_update', function () {
    setTimeout(function () {
      SC_VIBE.activateCounters();
      SC_VIBE.applyCategoryBorders();
      SC_VIBE.applyHeroNums();
    }, 100);
  });
};

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', SC_VIBE.init);
} else {
  SC_VIBE.init();
}

console.log('[SC] app-vibe v1.0 — Vibe Coding Blueprint active ✓');
})();
