// app-ui-audio.js — Lightweight Web Audio feedback for tab interactions
// Uses ONE shared AudioContext (creating a new context per tap is what
// produced the harsh/laggy artefacts) and a soft, short tap tone.
(function() {
'use strict';
var A = window.SC_APP;

function sharedCtx() {
  if (!window._scAudioCtx) {
    try { window._scAudioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  }
  var c = window._scAudioCtx;
  if (c && c.state === 'suspended') { try { c.resume(); } catch(e) {} }
  return c;
}

function playTabClick() {
  try {
    var ctx = sharedCtx(); if (!ctx) return;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = 'triangle';
    var t = ctx.currentTime;
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.04);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.start(t);
    osc.stop(t + 0.14);
  } catch(e) {}
}

A.playTabClick = playTabClick;
console.log('[SC] app-ui-audio.js ready — shared ctx, soft tap');
})();
