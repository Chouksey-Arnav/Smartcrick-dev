// app-ui-audio.js — Lightweight Web Audio API feedback for tab interactions
(function() {
'use strict';
var A = window.SC_APP;

function playTabClick() {
  try {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    var ctx = new AudioCtx();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.07, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.14);
    osc.onended = function() { try { ctx.close(); } catch(e) {} };
  } catch(e) {}
}

A.playTabClick = playTabClick;
console.log('[SC] app-ui-audio.js ready');
})();
