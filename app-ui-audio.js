// app-ui-audio.js v1.0
// Zero-latency Web Audio UI click tick — SmartCrick
// Triangle wave at 660 Hz, 0.05 s fade — instant tactile feedback
// Must load BEFORE app-root.js and any page that calls UIAudio.tick()
(function() {
'use strict';

var UIAudio = {
  _ctx: null,

  _getCtx: function() {
    if (!this._ctx) {
      try {
        this._ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch(e) {
        return null;
      }
    }
    // Browser autoplay policy: resume a suspended context on first user gesture
    if (this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
    return this._ctx;
  },

  // Call this BEFORE any state update (setTab, nav, etc.) for zero-latency feel
  tick: function() {
    var ctx = this._getCtx();
    if (!ctx) return;
    try {
      var osc  = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(660, ctx.currentTime);

      // Short, subtle envelope: attack → fast exponential decay
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.06); // tiny buffer after fade
    } catch(e) {
      // Audio is an enhancement only — silently swallow errors
    }
  }
};

window.SC_APP = window.SC_APP || {};
window.SC_APP.UIAudio = UIAudio;
console.log('[SC] app-ui-audio v1.0 — zero-latency UI tick ready');
})();
