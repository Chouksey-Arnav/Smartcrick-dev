// app-emotion-engine.js — Emotional Design Runtime v1.0
// Phase 1: Spring physics, event bus, badge-unlock detection, sparkle generator
(function () {
'use strict';
var A = window.SC_APP;
A.Emotion = A.Emotion || {};

// ── Reduced Motion Guard ──────────────────────────────────────────
A.Emotion.prefersReducedMotion = function () {
  try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
};

// ── Spring Physics Factory ────────────────────────────────────────
// Returns a stepper: (pos, vel, target, dt) → {pos, vel, done}
function createSpring(stiffness, damping, mass) {
  mass = mass || 1;
  return function step(pos, vel, target, dt) {
    var F   = -stiffness * (pos - target) - damping * vel;
    var acc = F / mass;
    vel = vel + acc * dt;
    pos = pos + vel * dt;
    var done = Math.abs(pos - target) < 0.001 && Math.abs(vel) < 0.001;
    return { pos: pos, vel: vel, done: done };
  };
}
A.Emotion.createSpring = createSpring;

// Pre-built spring instances per blueprint specs
A.Emotion.springSubmit = createSpring(300, 20, 1);   // submit / CTA button
A.Emotion.springChart  = createSpring(200, 18, 1);   // chart value label
A.Emotion.springBadge  = createSpring(260, 22, 1);   // badge unlock pop
A.Emotion.springMascot = createSpring(280, 18, 1);   // mascot arms
A.Emotion.springBar    = createSpring(180, 14, 1);   // progress bar fill

// ── Math Utilities ────────────────────────────────────────────────
A.Emotion.lerp  = function (a, b, t) { return a + (b - a) * t; };
A.Emotion.clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

// ── rAF Spring Loop Helper ────────────────────────────────────────
// Drives a value from fromVal → toVal with springFn, calling onFrame(pos) each tick.
// Returns a cancel() function.
A.Emotion.runSpring = function (fromVal, toVal, springFn, onFrame, onDone) {
  if (A.Emotion.prefersReducedMotion()) {
    onFrame(toVal);
    if (onDone) onDone();
    return function () {};
  }
  var pos = fromVal, vel = 0, rafId = null;
  function tick() {
    var r = springFn(pos, vel, toVal, 0.016);
    pos = r.pos; vel = r.vel;
    onFrame(pos);
    if (!r.done) { rafId = requestAnimationFrame(tick); }
    else if (onDone) { onDone(); }
  }
  rafId = requestAnimationFrame(tick);
  return function cancel() { if (rafId) cancelAnimationFrame(rafId); };
};

// ── Typed Haptic Feedback ─────────────────────────────────────────
var HAPTIC_PATTERNS = {
  light:    [6],
  medium:   [10],
  success:  [15, 30, 25],
  badge:    [20, 15, 20, 15, 30],
  complete: [50],
  paywall:  [15],
  spin:     [20, 20, 20, 20, 50],
  streak:   [80],
};
A.Emotion.haptic = function(type) {
  if (!navigator.vibrate || A.Emotion.prefersReducedMotion()) return;
  try { navigator.vibrate(HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS.light); } catch(e) {}
};

// ── Emotion Event Bus ─────────────────────────────────────────────
var _listeners = {};
A.Emotion.on = function (type, fn) {
  _listeners[type] = _listeners[type] || [];
  _listeners[type].push(fn);
};
A.Emotion.off = function (type, fn) {
  _listeners[type] = (_listeners[type] || []).filter(function (f) { return f !== fn; });
};
A.Emotion.emit = function (type, detail) {
  (_listeners[type] || []).forEach(function (fn) { try { fn(detail); } catch (e) {} });
};

// Wire global window events to bus
['sc_update', 'sc_badge_unlock', 'sc_first_session', 'sc_daily_reward_claimed'].forEach(function (evt) {
  window.addEventListener(evt, function (e) { A.Emotion.emit(evt, e && e.detail); });
});

// ── Badge Unlock Detection — monkey-patch awardXP ─────────────────
// awardXP is defined in app-core.js which loads before this file.
(function patchAwardXP() {
  var _orig = A.awardXP;
  if (typeof _orig !== 'function') {
    console.warn('[SC Emotion] awardXP not found — badge patch skipped');
    return;
  }
  A.awardXP = function (xp, minutes, source, completedKey, itemId) {
    var before = ((A.DB.getProgress().badges) || []).slice();
    var result = _orig.call(this, xp, minutes, source, completedKey, itemId);
    try {
      var after = (A.DB.getProgress().badges) || [];
      var newBadges = after.filter(function (id) { return before.indexOf(id) === -1; });
      if (newBadges.length > 0) {
        window.dispatchEvent(new CustomEvent('sc_badge_unlock', { detail: { ids: newBadges } }));
      }
    } catch (e) {}
    return result;
  };
})();

// ── SVG Sparkle Generator ─────────────────────────────────────────
// Renders an SVG burst centered on anchorEl, then removes itself.
A.Emotion.fireSparkleSVG = function (anchorEl, opts) {
  if (A.Emotion.prefersReducedMotion()) return;
  if (!anchorEl) return;
  opts = opts || {};
  var count    = opts.count    || 8;
  var color    = opts.color    || '#4ade80';
  var radius   = opts.radius   || 44;
  var duration = opts.duration || 580;

  var rect = anchorEl.getBoundingClientRect();
  var cx   = rect.left + rect.width / 2;
  var cy   = rect.top  + rect.height / 2;

  var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  var boxSize = radius * 2 + 24;
  svg.setAttribute('width',  boxSize + 'px');
  svg.setAttribute('height', boxSize + 'px');
  svg.style.cssText = [
    'position:fixed',
    'left:' + (cx - radius - 12) + 'px',
    'top:'  + (cy - radius - 12) + 'px',
    'pointer-events:none',
    'z-index:99999',
    'overflow:visible',
  ].join(';');

  var gsap     = window.gsap;
  var halfBox  = radius + 12;

  for (var i = 0; i < count; i++) {
    var angle = (i / count) * Math.PI * 2;
    var r2    = radius * (0.55 + Math.random() * 0.45);
    var tx    = Math.cos(angle) * r2;
    var ty    = Math.sin(angle) * r2;
    var size  = 2.5 + Math.random() * 3;

    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', halfBox);
    circle.setAttribute('cy', halfBox);
    circle.setAttribute('r',  size);
    circle.setAttribute('fill', color);
    circle.setAttribute('opacity', '1');
    svg.appendChild(circle);

    if (gsap) {
      gsap.to(circle, {
        attr: { cx: halfBox + tx, cy: halfBox + ty, r: 1 },
        opacity: 0,
        duration: duration / 1000,
        ease: 'power2.out',
        delay: i * 0.018,
      });
    } else {
      (function (el, _tx, _ty, delay) {
        setTimeout(function () {
          var t = 0;
          function frame() {
            t += 16;
            var prog  = Math.min(t / duration, 1);
            var eased = 1 - Math.pow(1 - prog, 2);
            el.setAttribute('cx', halfBox + _tx * eased);
            el.setAttribute('cy', halfBox + _ty * eased);
            el.setAttribute('opacity', String(1 - eased));
            if (prog < 1) requestAnimationFrame(frame);
          }
          requestAnimationFrame(frame);
        }, delay);
      })(circle, tx, ty, i * 20);
    }
  }

  document.body.appendChild(svg);
  setTimeout(function () {
    if (svg.parentNode) svg.parentNode.removeChild(svg);
  }, duration + count * 30 + 100);
};

// ── Streak Particle Burst (canvas-based) ─────────────────────────
// Spawns a full-screen canvas, runs an rAF particle burst, then removes it.
A.Emotion.fireStreakParticles = function (streak) {
  if (A.Emotion.prefersReducedMotion()) return;

  var canvas  = document.createElement('canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99998;';
  document.body.appendChild(canvas);

  var ctx    = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;
  var cxP = W / 2, cyP = H * 0.55;

  var palette = streak >= 30
    ? ['#fbbf24', '#f59e0b', '#fde68a', '#fff']
    : streak >= 14
    ? ['#34d399', '#fbbf24', '#4ade80', '#fff']
    : ['#4ade80', '#34d399', '#86efac'];

  var count = Math.min(60 + streak * 2, 120);
  var particles = [];
  for (var i = 0; i < count; i++) {
    var angle = Math.random() * Math.PI * 2;
    var speed = 3 + Math.random() * 7;
    particles.push({
      x: cxP, y: cyP,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 2 + Math.random() * 4,
      life: 1,
      decay: 0.01 + Math.random() * 0.012,
    });
  }

  var stopped = false;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    var allDead = true;
    particles.forEach(function (p) {
      if (p.life <= 0) return;
      allDead = false;
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.2;
      p.life -= p.decay;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (!allDead && !stopped) requestAnimationFrame(draw);
    else if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  }
  requestAnimationFrame(draw);
  setTimeout(function () { stopped = true; }, 2500);
};

console.log('[SC] Emotion Engine v1.0 ready');
})();
