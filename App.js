// ================================================================
// SmartCrick AI — Professional App v3.1 + GSAP
// CDN React 18 UMD · GSAP 3.13 + ScrollTrigger · No bundler
// ================================================================
(function () {
'use strict';

const {
  createElement:h, useState, useEffect, useCallback, useRef,
  useContext, createContext, useMemo, Fragment, memo, useLayoutEffect
} = React;
const { createRoot } = ReactDOM;

// ── Error Boundary ────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err:null }; }
  static getDerivedStateFromError(e) { return { err:e }; }
  render() {
    if (this.state.err) return h('div', { style:{padding:'2rem',color:'#ef4444',fontFamily:'system-ui',textAlign:'center'} },
      h('div',{style:{fontSize:'2rem',marginBottom:'1rem'}},'⚠️'),
      h('h2', { style:{color:'#f8fafc',marginBottom:'.5rem'} }, 'Something went wrong'),
      h('p', { style:{color:'#94a3b8',fontSize:'.875rem',marginBottom:'1.5rem'} }, this.state.err.message),
      h('button', { onClick:()=>{ this.setState({err:null}); nav('Home'); },
        style:{background:'#10b981',color:'#fff',border:'none',borderRadius:'.75rem',padding:'.75rem 1.5rem',fontWeight:700,cursor:'pointer',fontSize:'1rem'} }, 'Go Home')
    );
    return this.props.children;
  }
}

// ================================================================
// ICONS DICTIONARY
// ================================================================
const IC = {
  home:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  menu:'<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevR:'<path d="m9 18 6-6-6-6"/>',
  chevD:'<path d="m6 9 6 6 6-6"/>',
  chevU:'<path d="m18 15-6-6-6 6"/>',
  arrowL:'<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  brain:'<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  trophy:'<path d="M6 9a6 6 0 0 0 12 0V3H6z"/><path d="M6 9H4.5a1 1 0 0 1 0-5H6"/><path d="M18 9h1.5a1 1 0 0 0 0-5H18"/><path d="M10 14.66V21.978"/><path d="M14 14.66V21.978"/><path d="M4 22h16"/>',
  star:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  flame:'<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/>',
  zap:'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  dumbbell:'<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.34-4.34"/>',
  check:'<polyline points="20 6 9 17 4 12"/>',
  circleCheck:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  plus:'<path d="M5 12h14"/><path d="M12 5v14"/>',
  play:'<polygon points="5 3 19 11 5 19 5 3"/>',
  pause:'<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  award:'<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  crown:'<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.277 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>',
  sparkles:'<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>',
  calendar:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  video:'<path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  activity:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  barChart:'<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  timer:'<line x1="10" y1="2" x2="14" y2="2"/><line x1="12" y1="14" x2="12" y2="8"/><path d="M20.2 20.2A9 9 0 1 0 12 21a8.7 8.7 0 0 0 5.3-1.8"/>',
  heart:'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  layers:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  mic:'<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>',
  globe:'<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  extLink:'<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  info:'<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
  list:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
  crosshair:'<circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/>',
  wind:'<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>',
  bat:'<path d="M3 21l3.5-3.5"/><path d="M5.5 19.5L16 9a2 2 0 0 0 0-2.83L14.83 5A2 2 0 0 0 12 5L2.5 16l-1 1 1 4z"/><path d="M19 4.5l.5.5"/><circle cx="20" cy="4" r="1"/>',
  ball:'<circle cx="12" cy="12" r="9"/><path d="M12 3c-1.2 3.6-1.2 14.4 0 18" stroke-width="1.5"/><path d="M3.5 9.5c3.3.8 11.7.8 17 0" stroke-width="1.5"/><path d="M3.5 14.5c3.3-.8 11.7-.8 17 0" stroke-width="1.5"/>',
  wicket:'<line x1="8" y1="4" x2="8" y2="21"/><line x1="12" y1="4" x2="12" y2="21"/><line x1="16" y1="4" x2="16" y2="21"/><rect x="6" y="4" width="12" height="3" rx="1"/>',
  helmet:'<path d="M12 2a8 8 0 0 0-8 8c0 3.5 1.8 6.6 4.5 8.5H7"/><path d="M12 2a8 8 0 0 1 8 8c0 3.5-1.8 6.6-4.5 8.5H12"/><line x1="4.5" y1="14" x2="19.5" y2="14"/><path d="M4 10h16"/>',
  field:'<ellipse cx="12" cy="12" rx="10" ry="6"/><ellipse cx="12" cy="12" rx="3.5" ry="2"/><line x1="12" y1="6" x2="12" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/>',
  glove:'<path d="M8 18V9a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"/><path d="M16 11h2a2 2 0 0 1 0 4h-2"/><path d="M6 11H4a2 2 0 0 0 0 4h2"/><path d="M8 18h8"/><path d="M8 21h8"/>',
  pitch:'<rect x="3" y="7" width="18" height="10" rx="1"/><line x1="8" y1="7" x2="8" y2="17"/><line x1="16" y1="7" x2="16" y2="17"/><line x1="3" y1="12" x2="21" y2="12"/>',
  cpu:'<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="15" x2="4" y2="15"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="15" x2="22" y2="15"/>',
  diamond:'<path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/>',
  puzzle:'<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-1.705.707 2.402 2.402 0 0 1-1.704-.706l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 1.998c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.877.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z"/>',
  helpCircle:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  chartLine:'<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
  bell:'<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
  navigation:'<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  flag:'<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  trendDown:'<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  alertTriangle:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  chevronsRight:'<polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>',
  rotateCcw:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  maximize:'<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
};

function Icon({ n, cls='w-5 h-5', style }) {
  return h('svg', {
    className:cls, style,
    xmlns:'http://www.w3.org/2000/svg',
    viewBox:'0 0 24 24', fill:'none',
    stroke:'currentColor', strokeWidth:2,
    strokeLinecap:'round', strokeLinejoin:'round',
    'aria-hidden':true,
    dangerouslySetInnerHTML:{ __html:IC[n]||IC.info }
  });
}

// ================================================================
// SCAnim — GSAP ANIMATION NAMESPACE
// Every animation in the app flows through this object.
// All methods guard against GSAP not being loaded — safe on slow
// connections or when CDN is blocked. SCAnim.init() MUST be called
// once from AppRoot's useLayoutEffect.
// ================================================================
const SCAnim = (function() {
  let _ready = false;
  let _rm    = false; // reduced-motion preference

  return {
    get ready()        { return _ready; },
    get reducedMotion(){ return _rm; },

    // ── init ────────────────────────────────────────────────────
    // Called ONCE from AppRoot. Registers ScrollTrigger, sets
    // gsap.defaults, adds .gsap-ready to <body> to lift the FOUC gate.
    init() {
      // Always lift the gate so content is visible regardless
      document.body.classList.add('gsap-ready');

      if (typeof gsap === 'undefined') {
        console.warn('[SCAnim] GSAP not loaded — animations disabled');
        return;
      }
      _rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (typeof ScrollTrigger !== 'undefined' && gsap.registerPlugin) {
        try { gsap.registerPlugin(ScrollTrigger); } catch(e) {}
      }

      gsap.defaults({ ease: 'power2.out', duration: 0.4 });

      _ready = true;
      window.addEventListener('resize', () => {
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, { passive: true });

      console.log('[SCAnim] GSAP ready — reducedMotion=' + _rm);
    },

    // ── countUp ─────────────────────────────────────────────────
    // Animates a numeric counter in an element's textContent.
    countUp(el, from, to, opts={}) {
      if (!el) return;
      if (!_ready || _rm) {
        el.textContent = (opts.format || (v=>String(v)))(to);
        return;
      }
      const obj = { val: from };
      gsap.to(obj, {
        val: to,
        duration: opts.duration ?? 0.9,
        ease: 'power2.out',
        onUpdate: () => {
          if (el) el.textContent = (opts.format || (v=>String(Math.round(v))))(Math.round(obj.val));
        },
        onComplete: () => {
          if (el) el.textContent = (opts.format || (v=>String(v)))(to);
        },
      });
    },

    // ── fillBar ──────────────────────────────────────────────────
    // Animates a progress bar's width from fromPct% to toPct%.
    fillBar(el, fromPct, toPct, opts={}) {
      if (!el) return;
      if (!_ready || _rm) { el.style.width = toPct + '%'; return; }
      gsap.fromTo(el,
        { width: fromPct + '%' },
        { width: toPct + '%', duration: opts.duration ?? 0.9, ease: opts.ease ?? 'power3.out' }
      );
    },

    // ── staggerCards ────────────────────────────────────────────
    // Stagger a NodeList/array of elements into view.
    staggerCards(elements, opts={}) {
      if (!_ready || _rm || !elements || !elements.length) return;
      gsap.from(Array.from(elements), {
        opacity:  0,
        y:        opts.y        ?? 12,
        duration: opts.duration ?? 0.35,
        stagger:  opts.stagger  ?? 0.04,
        delay:    opts.delay    ?? 0,
        ease:     opts.ease     ?? 'power2.out',
        clearProps: 'all',
      });
    },

    // ── flashXP ──────────────────────────────────────────────────
    // Shows floating "+XX XP" toast with pop-in, hold, float-up.
    // Replaces the CSS fallback completely when GSAP is loaded.
    flashXP(text) {
      const el = document.createElement('div');
      el.className = 'xp-flash';
      el.textContent = text;
      document.body.appendChild(el);

      if (!_ready || _rm) {
        // No GSAP: use CSS animation (defined in styles.css)
        setTimeout(() => { try { el.remove(); } catch {} }, 1500);
        return;
      }

      gsap.timeline({ onComplete: () => { try { el.remove(); } catch {} } })
        .fromTo(el,
          { opacity: 0, scale: 0.5, y: 0 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }
        )
        .to(el, { duration: 0.6 }) // hold
        .to(el, { opacity: 0, y: -40, scale: 0.9, duration: 0.5, ease: 'power2.in' });
    },

    // ── levelUpCelebration ────────────────────────────────────────
    // Full level-up sequence: overlay flash + card pulse + confetti.
    levelUpCelebration(levelCard, levelName) {
      if (!_ready || _rm) return;

      const overlay = document.createElement('div');
      overlay.className = 'level-up-overlay';
      overlay.innerHTML =
        '<div class="level-up-overlay-content">' +
          '<div class="level-up-overlay-title">LEVEL UP!</div>' +
          '<div class="level-up-overlay-subtitle">' + levelName + '</div>' +
        '</div>';
      document.body.appendChild(overlay);

      if (typeof confetti === 'function') {
        confetti({ particleCount:120, spread:100, origin:{y:0.5},
          colors:['#16a34a','#34d399','#fbbf24','#ffffff'] });
      }

      const tl = gsap.timeline({ onComplete: () => { try { overlay.remove(); } catch {} } });
      tl.to(overlay, { opacity: 1, duration: 0.3, ease: 'power2.out' }, 0)
        .to(overlay, { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.4);
      tl.fromTo(overlay.querySelector('.level-up-overlay-title'),
        { scale: 0, rotation: -8 },
        { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.5)' }, 0.1);
      tl.from(overlay.querySelector('.level-up-overlay-subtitle'),
        { opacity: 0, y: 12, duration: 0.4 }, 0.4);
      if (levelCard) {
        tl.to(levelCard, {
          boxShadow: '0 0 0 4px rgba(22, 163, 74, 0.6)',
          duration: 0.3, repeat: 2, yoyo: true,
        }, 0);
      }
    },

    // ── scrollReveal ─────────────────────────────────────────────
    // Reveal elements as they scroll into view (once).
    scrollReveal(trigger, targets, opts={}) {
      if (!_ready || _rm || typeof ScrollTrigger === 'undefined') return;
      if (!trigger || !targets || !targets.length) return;
      gsap.from(Array.from(targets), {
        opacity:  0,
        y:        opts.y        ?? 14,
        duration: opts.duration ?? 0.4,
        stagger:  opts.stagger  ?? 0.05,
        ease:     opts.ease     ?? 'power2.out',
        scrollTrigger: {
          trigger,
          start: opts.start ?? 'top 88%',
          once:  opts.once  ?? true,
        },
      });
    },

    // ── drawRing ─────────────────────────────────────────────────
    // Animate an SVG circle's stroke-dashoffset to draw a ring.
    drawRing(circleEl, fromPct, toPct, opts={}) {
      if (!circleEl || !_ready || _rm) return;
      const dasharray = parseFloat(circleEl.getAttribute('stroke-dasharray') || '0');
      if (!dasharray) return;
      gsap.fromTo(circleEl,
        { strokeDashoffset: dasharray * (1 - fromPct) },
        { strokeDashoffset: dasharray * (1 - toPct),
          duration: opts.duration ?? 1.0,
          delay:    opts.delay    ?? 0,
          ease: 'power2.out' }
      );
    },

    // ── addHover ─────────────────────────────────────────────────
    // Desktop hover micro-interaction. No-op on touch devices.
    addHover(el, opts={}) {
      if (!el || !_ready || _rm || 'ontouchstart' in window) return;
      const tween = gsap.to(el, {
        ...opts,
        paused:   true,
        duration: opts.duration ?? 0.18,
        ease:     opts.ease     ?? 'power2.out',
      });
      el.addEventListener('mouseenter', () => tween.play());
      el.addEventListener('mouseleave', () => tween.reverse());
    },

    // ── refresh ──────────────────────────────────────────────────
    refresh() {
      if (typeof ScrollTrigger !== 'undefined') {
        try { ScrollTrigger.refresh(); } catch {}
      }
    },

    // ── killAll ──────────────────────────────────────────────────
    killAll() {
      if (typeof ScrollTrigger !== 'undefined') {
        try { ScrollTrigger.getAll().forEach(t => t.kill()); } catch {}
      }
    },
  };
})();

// ================================================================
// useGSAP — Scoped GSAP context hook with auto-cleanup
// Usage:
//   const ref = useGSAP(() => {
//     gsap.from('[data-anim="card"]', { opacity:0, y:14 });
//   }, [dependency]);
//   return h('div', { ref }, ...children);
//
// gsap.context() scopes selectors to the ref'd element AND
// automatically reverts all tweens + ScrollTriggers on unmount.
// useLayoutEffect runs BEFORE browser paint (no FOUC).
// ================================================================
function useGSAP(setupFn, deps=[]) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || typeof gsap === 'undefined') return;
    if (SCAnim.reducedMotion) return;
    const ctx = gsap.context(setupFn, ref);
    return () => ctx.revert();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

// ── Theme Context ─────────────────────────────────────────────────
const ThemeCtx = createContext({ dark:true, toggle:()=>{} });
function useTheme() { return useContext(ThemeCtx); }

// ── Hash Router ───────────────────────────────────────────────────
function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/,'') || 'Home';
  const [page, qs] = hash.split('?');
  const params = {};
  if (qs) qs.split('&').forEach(p => { const [k,v]=p.split('='); if(k) params[k]=decodeURIComponent(v||''); });
  return { page, params };
}
function nav(page, params={}) {
  const qs = Object.keys(params).length
    ? '?'+Object.entries(params).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&') : '';
  window.location.hash = `#/${page}${qs}`;
}
function useRoute() {
  const [route, setRoute] = useState(getRoute);
  useEffect(()=>{
    const fn = ()=>setRoute(getRoute());
    window.addEventListener('hashchange', fn);
    return ()=>window.removeEventListener('hashchange', fn);
  },[]);
  return route;
}

// ── LocalStorage DB ───────────────────────────────────────────────
const DB = {
  _k: k=>`sc_${k}`,
  isAvailable() {
    try { localStorage.setItem('sc_test','1'); localStorage.removeItem('sc_test'); return true; }
    catch { return false; }
  },
  get(k) {
    try { const v=localStorage.getItem(this._k(k)); return v?JSON.parse(v):null; }
    catch { return null; }
  },
  set(k,v) {
    try {
      localStorage.setItem(this._k(k),JSON.stringify(v));
    } catch(e) { console.warn('SC: localStorage write error',k,e); }
    try {
      if(typeof getPouchDB==='function' && typeof SC_SYNC_KEYS!=='undefined') {
        var _pdb=getPouchDB(), _fk=this._k(k);
        if(_pdb && SC_SYNC_KEYS.indexOf(_fk)!==-1) {
          var _did='sc::'+_fk, _val=v;
          _pdb.get(_did)
            .then(function(ex){return _pdb.put(Object.assign({},ex,{value:_val,updatedAt:Date.now()}));})
            .catch(function(e){if(e&&e.name==='not_found')return _pdb.put({_id:_did,value:_val,createdAt:Date.now(),updatedAt:Date.now()});})
            .catch(function(e){console.warn('[SC] PouchDB:',k,e);});
        }
      }
    } catch(e) {}
    return v;
  },
  del(k) { try { localStorage.removeItem(this._k(k)); } catch {} },
  getProgress() {
    const saved=this.get('progress');
    return Object.assign({
      total_xp:0, drills_done:0, mental_done:0, workouts_done:0,
      practice_minutes:0, current_streak:0, longest_streak:0,
      last_active_date:null, last_checkin_date:null,
      completed_drills:[], completed_mental:[], completed_workouts:[],
      badges:[], skill_path_progress:{}, thirtyDay_completed:{}, ninety_day:{}
    }, saved||{});
  },
  saveProgress(v) { this.set('progress', v); },
  getXPLog() { return this.get('xp_log')||[]; },
  addXPEntry(xp, source) {
    const log = this.getXPLog();
    const today = new Date().toISOString().slice(0,10);
    log.push({ date:today, xp, source, ts:Date.now() });
    this.set('xp_log', log.filter(e=>e.ts>Date.now()-90*864e5));
  },
  getXPLast7Days() {
    const log = this.getXPLog();
    const days = [];
    for (let i=6; i>=0; i--) {
      const d=new Date(); d.setDate(d.getDate()-i);
      const dateStr=d.toISOString().slice(0,10);
      const label=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      days.push({ date:dateStr, label, xp:log.filter(e=>e.date===dateStr).reduce((s,e)=>s+e.xp,0) });
    }
    return days;
  },
  getActivityHeatmap() {
    const log = this.getXPLog();
    const map = {};
    log.forEach(e=>{ map[e.date]=(map[e.date]||0)+e.xp; });
    const days = [];
    for (let i=29; i>=0; i--) {
      const d=new Date(); d.setDate(d.getDate()-i);
      const date=d.toISOString().slice(0,10);
      const xp=map[date]||0;
      days.push({ date, xp, level:xp===0?0:xp<50?1:xp<150?2:xp<300?3:4 });
    }
    return days;
  },
  getUser() { return this.get('user')||{}; },
  setUser(v) { this.set('user',v); },
  getGoals() { return this.get('goals')||[]; },
  saveGoals(v) { this.set('goals',v); },
  getSchedule() { return this.get('schedule')||{ sessions:[] }; },
  saveSchedule(v) { this.set('schedule',v); },
  getSessionsForDate(dateStr) {
    return (this.getSchedule().sessions||[]).filter(s=>s.date===dateStr);
  },
  getSessionsForWeek(mondayStr) {
    const s = this.getSchedule().sessions||[];
    const start = new Date(mondayStr+'T00:00:00');
    const end = new Date(start); end.setDate(start.getDate()+7);
    return s.filter(sess=>{
      const d = new Date(sess.date+'T00:00:00');
      return d>=start && d<end;
    });
  },
  addSession(sess) {
    const sch = this.getSchedule();
    sch.sessions = [...(sch.sessions||[]), sess];
    this.saveSchedule(sch);
  },
  updateSession(id, updates) {
    const sch = this.getSchedule();
    sch.sessions = (sch.sessions||[]).map(s=>s.id===id?{...s,...updates}:s);
    this.saveSchedule(sch);
  },
  deleteSession(id) {
    const sch = this.getSchedule();
    sch.sessions = (sch.sessions||[]).filter(s=>s.id!==id);
    this.saveSchedule(sch);
  },
  completeScheduledSession(id) {
    const sch = this.getSchedule();
    const sess = (sch.sessions||[]).find(s=>s.id===id);
    if (!sess || sess.status==='complete') return null;
    this.updateSession(id, { status:'complete' });
    return sess;
  }
};

// ── XP & Level System ────────────────────────────────────────────
const XP_LEVELS = [
  { level:1, name:'Rookie',           min:0,     max:500   },
  { level:2, name:'Club Player',      min:500,   max:1200  },
  { level:3, name:'District Star',    min:1200,  max:2500  },
  { level:4, name:'State Performer',  min:2500,  max:5000  },
  { level:5, name:'National Prospect',min:5000,  max:9000  },
  { level:6, name:'Elite Player',     min:9000,  max:15000 },
  { level:7, name:'International',    min:15000, max:25000 },
  { level:8, name:'Pro Cricketer',    min:25000, max:40000 },
  { level:9, name:'World Class',      min:40000, max:60000 },
  { level:10,name:'Legend',           min:60000, max:Infinity },
];
function getLevelInfo(totalXP) {
  const xp = totalXP || 0;
  let lv = XP_LEVELS[0];
  for (let i = XP_LEVELS.length-1; i>=0; i--) {
    if (xp >= XP_LEVELS[i].min) { lv = XP_LEVELS[i]; break; }
  }
  const next = XP_LEVELS.find(l=>l.level===lv.level+1)||null;
  const pct = next ? Math.min(100,((xp-lv.min)/(next.min-lv.min))*100) : 100;
  return { ...lv, next, pct, xpToNext:next?Math.max(0,next.min-xp):0 };
}

const BADGE_DEFS = {
  first500:  { icon:'zap',      label:'First 500',      desc:'Earned your first 500 XP' },
  xp5k:      { icon:'trophy',   label:'5K Club',         desc:'5,000 total XP earned' },
  streak3:   { icon:'flame',    label:'On Fire',          desc:'3-day training streak' },
  streak7:   { icon:'flame',    label:'Week Warrior',     desc:'7-day training streak' },
  streak14:  { icon:'flame',    label:'Fortnight',        desc:'14-day streak' },
  streak30:  { icon:'flame',    label:'Monthly Legend',   desc:'30 consecutive days' },
  drills10:  { icon:'bat',      label:'Drill Starter',    desc:'10 cricket drills done' },
  drills50:  { icon:'bat',      label:'Drill Master',     desc:'50 cricket drills done' },
  mental10:  { icon:'brain',    label:'Mind Builder',     desc:'10 mental sessions done' },
  mental25:  { icon:'brain',    label:'Mind Master',      desc:'25 mental sessions done' },
  min60:     { icon:'clock',    label:'First Hour',        desc:'60 min of practice' },
  min600:    { icon:'clock',    label:'600 Min Club',      desc:'600 min of practice' },
  workouts5: { icon:'dumbbell', label:'Fitness Start',    desc:'5 workouts completed' },
  sched10:   { icon:'calendar', label:'Scheduled Pro',    desc:'10 scheduled sessions done' },
};

function checkBadges(p) {
  const b = [...(p.badges||[])];
  const add = id => { if (!b.includes(id)) b.push(id); };
  if ((p.total_xp||0)>=500)  add('first500');
  if ((p.total_xp||0)>=5000) add('xp5k');
  if ((p.current_streak||0)>=3)  add('streak3');
  if ((p.current_streak||0)>=7)  add('streak7');
  if ((p.current_streak||0)>=14) add('streak14');
  if ((p.current_streak||0)>=30) add('streak30');
  if ((p.drills_done||0)>=10)  add('drills10');
  if ((p.drills_done||0)>=50)  add('drills50');
  if ((p.mental_done||0)>=10)  add('mental10');
  if ((p.mental_done||0)>=25)  add('mental25');
  if ((p.practice_minutes||0)>=60)  add('min60');
  if ((p.practice_minutes||0)>=600) add('min600');
  if ((p.workouts_done||0)>=5) add('workouts5');
  const schedDone = (DB.getSchedule().sessions||[]).filter(s=>s.status==='complete').length;
  if (schedDone>=10) add('sched10');
  return b;
}

// ── awardXP — with sc_xp_animate event for GSAP reactive animations ──
function awardXP(xp, minutes=0, source='general', completedKey=null, itemId=null) {
  try {
    const p = DB.getProgress();
    const today = new Date().toISOString().slice(0,10);
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    const oldXP = p.total_xp || 0;

    if (source==='checkin') {
      if (p.last_checkin_date===today) return p;
      p.last_checkin_date=today;
    }
    if (p.last_active_date === today) {}
    else if (p.last_active_date === yesterday) {
      p.current_streak = (p.current_streak||0)+1;
      p.longest_streak = Math.max(p.longest_streak||0, p.current_streak);
    } else {
      p.current_streak = 1;
      p.longest_streak = Math.max(p.longest_streak||0, 1);
    }
    p.last_active_date = today;
    p.total_xp = oldXP + xp;
    p.practice_minutes = (p.practice_minutes||0)+minutes;

    if (completedKey==='drill' && itemId) {
      p.completed_drills = p.completed_drills||[];
      if (!p.completed_drills.includes(itemId)) p.completed_drills.push(itemId);
      p.drills_done = (p.drills_done||0)+1;
    }
    if (completedKey==='mental' && itemId) {
      p.completed_mental = p.completed_mental||[];
      if (!p.completed_mental.includes(itemId)) p.completed_mental.push(itemId);
      p.mental_done = (p.mental_done||0)+1;
    }
    if (completedKey==='workout' && itemId) {
      p.completed_workouts = p.completed_workouts||[];
      if (!p.completed_workouts.includes(itemId)) p.completed_workouts.push(itemId);
      p.workouts_done = (p.workouts_done||0)+1;
    }
    p.badges = checkBadges(p);
    DB.saveProgress(p);
    DB.addXPEntry(xp, source);

    // ── sc_xp_animate: drives GSAP reactive animations on HomePage ──
    // HomePage listens for this to animate the XP count-up, bar fill,
    // and level-up celebration without prop threading.
    const oldInfo = getLevelInfo(oldXP);
    const newInfo = getLevelInfo(p.total_xp);
    window.dispatchEvent(new CustomEvent('sc_xp_animate', {
      detail: {
        oldXP,
        newXP:     p.total_xp,
        delta:     xp,
        leveledUp: newInfo.level > oldInfo.level,
        levelName: newInfo.name,
        newLevel:  newInfo.level,
        source,
      }
    }));

    // Generic re-render event
    window.dispatchEvent(new CustomEvent('sc_update'));

    // Floating XP toast — GSAP version when loaded, CSS fallback otherwise
    SCAnim.flashXP('+' + xp + ' XP');
    return p;
  } catch(e) { console.error('awardXP error:', e); return DB.getProgress(); }
}

function fireConfetti() {
  try { if (typeof confetti!=='undefined') confetti({ particleCount:90, spread:70, origin:{y:.65}, colors:['#10b981','#34d399','#6ee7b7','#fff'] }); } catch{}
}

// ── Utility: date helpers ─────────────────────────────────────────
function getWeekMonday(date) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const day = d.getDay(); const diff = day===0?-6:1-day;
  d.setDate(d.getDate()+diff); return d;
}
function dateStr(d) { return d.toISOString().slice(0,10); }
function addDays(d, n) { const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function formatDate(str) {
  const d = new Date(str+'T00:00:00');
  return d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
}
function isToday(str) { return str===new Date().toISOString().slice(0,10); }
function fmtTime(s) {
  const h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

const SCHED_TYPES = {
  drill:   { label:'Cricket Drill',  icon:'bat',      color:'#3b82f6', bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.4)' },
  mental:  { label:'Mental Session', icon:'brain',    color:'#a855f7', bg:'rgba(168,85,247,0.12)', border:'rgba(168,85,247,0.4)' },
  fitness: { label:'Fitness',        icon:'dumbbell', color:'#f97316', bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.4)' },
  match:   { label:'Match Day',      icon:'wicket',   color:'#f59e0b', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.4)' },
  rest:    { label:'Rest & Recover', icon:'heart',    color:'#16a34a', bg:'rgba(22,163,74,0.08)',  border:'rgba(22,163,74,0.25)' },
  custom:  { label:'Custom Session', icon:'list',     color:'#8b949e', bg:'rgba(139,148,158,0.12)',border:'rgba(139,148,158,0.4)' },
};

// ================================================================
// DATA — Drills, Mental Sessions, Workouts, Skill Paths
// ================================================================
const DRILLS = [
  { id:'b001',category:'batting',title:'Cover Drive Mastery',skill_level:'beginner',duration_minutes:15,xp_value:70,
    video_id:'HhEQQKnXqnw',
    description:'Perfect the most elegant stroke in cricket. Master front elbow, head position, and the flowing high follow-through.',
    steps:['Set side-on stance, bat raised in backlift','Watch ball seam from the bowler\'s hand','Step forward, weight transferring to front foot','Drive through the line, full bat face presented to cover','Head over ball at point of contact','High flowing follow-through pointing toward cover point'],
    tips:'Keep front elbow HIGH, pointing at mid-on. Head stays perfectly still through contact.',
    target_metric:'10 consecutive clean drives, all finding the cover boundary' },
  { id:'b002',category:'batting',title:'Pull Shot Power',skill_level:'intermediate',duration_minutes:20,xp_value:90,
    video_id:'2f8okmqYpg8',
    description:'Dominate short-pitched bowling with authority. The pull shot turns the short ball from a threat into a guaranteed boundary.',
    steps:['Read short delivery early from release point','Rock back fast — weight fully onto back foot','Get inside the line of the ball','Swing bat in a powerful horizontal arc at shoulder height','Roll wrists over at contact','Power follow-through toward mid-wicket'],
    tips:'Identify the length EARLY — early positioning means everything else is automatic.',
    target_metric:'15 controlled pull shots, 10 finding the boundary' },
  { id:'b003',category:'batting',title:'Sweep Shot vs Spin',skill_level:'intermediate',duration_minutes:18,xp_value:85,
    video_id:'kLpGM8q_bk0',
    description:'Dominate spin bowling with the sweep. A well-executed sweep disrupts field settings and frustrates spinners.',
    steps:['Read full delivery from spinner early','Step forward, drop leading knee toward pitch','Get to pitch of ball','Swing bat in horizontal arc, rolling wrists at contact','Contact ball in front of pad','Follow through toward fine leg or mid-wicket'],
    tips:'Commit FULLY to the sweep. Half-hearted attempts result in LBW or top edge.',
    target_metric:'10 clean sweeps in a row without miscuing' },
  { id:'b004',category:'batting',title:'Cut Shot Technique',skill_level:'intermediate',duration_minutes:18,xp_value:85,
    video_id:'2f8okmqYpg8',
    description:'Attack anything short and wide outside off stump. The cut shot is your boundary weapon for wide deliveries.',
    steps:['Identify short-wide delivery early','Rock back and across the crease decisively','Position body behind the line','Downward arc with bat, cut into the ground','Hit firmly through the top half of the ball','Finish with bat pointing toward point'],
    tips:'Play LATE — the later you play it, the finer the angle.',
    target_metric:'20 cut shots finding the target zone past point' },
  { id:'b005',category:'batting',title:'T20 Power Hitting',skill_level:'advanced',duration_minutes:25,xp_value:120,
    video_id:'B0XOcaRMBP4',
    description:'Maximize boundary-hitting in T20 cricket. Strike rates above 150 sustained across 30 balls.',
    steps:['Read the field and plan your shot BEFORE the ball is bowled','Full delivery: drive over mid-on or mid-off','Short delivery: aggressive upper-cut or powerful pull','Yorker: dig out with an open face','Wide: inside-out drive or savage cut','Reset mentally between every delivery'],
    tips:'A bold pre-planned shot executed with conviction beats improvised aggression.',
    target_metric:'Strike rate 150+ sustained across a 30-ball simulation' },
  { id:'b006',category:'batting',title:'Defensive Block Foundation',skill_level:'beginner',duration_minutes:12,xp_value:55,
    video_id:'HhEQQKnXqnw',
    description:'Build an unbreakable defensive technique. Every great innings is built on a technically sound defensive block.',
    steps:['Set correct stance, feet shoulder-width, weight balanced','Watch ball from the bowler\'s hand all the way to bat','For good-length: stay in crease, lean weight forward','Present full face of bat to the ball','SOFT hands at contact','Ball should drop harmlessly at your feet'],
    tips:'Relaxed hands = ball drops dead. Tense hands = caught at short leg.',
    target_metric:'20 consecutive technically correct defensive blocks' },
  { id:'b007',category:'batting',title:'Slog Sweep over Cow Corner',skill_level:'intermediate',duration_minutes:18,xp_value:100,
    video_id:'kLpGM8q_bk0',
    description:'The aggressive T20 weapon against spin. Clear the mid-wicket boundary reliably.',
    steps:['Read full delivery from spinner','Step forward with deep knee bend','Full horizontal bat arc swinging higher than standard sweep','Make contact WELL IN FRONT of the pad','Roll wrists powerfully at impact','Follow through lofted toward cow corner'],
    tips:'Contact in FRONT of pad prevents going straight up.',
    target_metric:'8 of 12 slog sweeps landing in the cow corner zone' },
  { id:'b008',category:'batting',title:'Ramp Shot over Keeper',skill_level:'advanced',duration_minutes:15,xp_value:130,
    video_id:'B0XOcaRMBP4',
    description:'Redirect pace bowling over the wicketkeeper\'s head for guaranteed boundaries.',
    steps:['Identify delivery on stumps line','Shuffle toward off stump, open your stance wide','Angle bat face skyward toward fine leg','Present bat softly — minimal swing, maximum redirect','Ball deflects up off the face and clears the keeper','Minimum 4 runs'],
    tips:'Use the pace of the ball — the harder it comes, the further the ramp travels.',
    target_metric:'6 of 15 attempts successfully clearing the keeper' },
  { id:'b009',category:'batting',title:'Reading Spin from Hand',skill_level:'intermediate',duration_minutes:20,xp_value:95,
    video_id:'kLpGM8q_bk0',
    description:'Identify which way the ball turns before it pitches by reading the bowler\'s hand at release.',
    steps:['Off-spin: fingers roll over the top at release','Leg-spin: wrist cocks outward at release','Googly: same wrist as leg-spin but ball exits back of hand','Doosra: front of hand delivery — goes away from right-hander','Armball: no wrist turn — comes straight','Practice identifying each delivery after each ball'],
    tips:'Watch seam orientation and wrist position AT release — not the flight.',
    target_metric:'Correctly identify 15 of 20 deliveries before they pitch' },
  { id:'b010',category:'batting',title:'Running Between Wickets',skill_level:'beginner',duration_minutes:20,xp_value:70,
    video_id:'HhEQQKnXqnw',
    description:'Turn ones into twos, twos into threes. Sharp running is the cheapest runs in cricket.',
    steps:['Hit ball, assess IMMEDIATELY from follow-through','Call CLEARLY: YES, NO, or WAIT','Sprint in a perfectly straight line to the crease','Ground the bat behind the crease while still moving','Look up immediately to assess second run','Back up CONSTANTLY at the non-striker end'],
    tips:'Loud, early, definitive calls. Ground the bat over the line while running.',
    target_metric:'Convert 80%+ of hit-1s into running 2s in a drill simulation' },
  { id:'w001',category:'bowling',title:'Line & Length Precision',skill_level:'beginner',duration_minutes:20,xp_value:65,
    video_id:'7pFfqTFvOEs',
    description:'The foundation of all wicket-taking. Perfect line and length creates relentless pressure.',
    steps:['Mark target zone with tape: good length, off-stump line','Warm up with 3-step approach at 60% pace — 10 balls','Full run-up at 80% — 20 balls, count consecutive on-target','Increase to 100% pace — 15 balls maintaining accuracy','Shift target: bowl at 4th-stump line','Final 5: alternate target zones without warning'],
    tips:'Aim at the TOP of off-stump. Good length = batsman is uncommitted.',
    target_metric:'8 of 10 consecutive balls hitting marked target zone' },
  { id:'w002',category:'bowling',title:'Outswing Mastery',skill_level:'intermediate',duration_minutes:20,xp_value:100,
    video_id:'SZsXolnz5Pg',
    description:'Master the outswinger — the number one wicket-taker in seam bowling history.',
    steps:['Hold ball with seam vertical pointing toward slip','Wrist stays perfectly UPRIGHT behind ball at release','Aim at the TOP of off-stump','High-arm smooth action — release with full upright seam','Bowl a FULL length — short balls lose swing rapidly','Target: 15-20cm of in-air movement'],
    tips:'NEVER aim at the edge. Target off-stump — the swing finds the edge.',
    target_metric:'5 consecutive outswingers beating the imaginary outside edge' },
  { id:'w003',category:'bowling',title:'Yorker Death Bowling',skill_level:'advanced',duration_minutes:25,xp_value:130,
    video_id:'d3wJbkDK-SU',
    description:'The single most difficult delivery to hit in cricket — the perfect yorker.',
    steps:['Place a target marker at the BASE of the stumps','Full run-up with identical action to all other deliveries','Release point is slightly LATER than for good-length ball','Mental cue: "hit the batsman\'s front toe"','Ball arrives below knee height at base of stumps','Variations: straight, wide, slower yorker'],
    tips:'Think "hit the toe" with every delivery.',
    target_metric:'4 of 6 consecutive deliveries landing as perfect yorkers' },
  { id:'w004',category:'bowling',title:'Inswing Bowling',skill_level:'intermediate',duration_minutes:20,xp_value:100,
    video_id:'SZsXolnz5Pg',
    description:'Swing the ball late into the right-handed batsman for LBW.',
    steps:['Hold ball with seam pointing toward FINE LEG side','Wrist rotates slightly inward at address','Aim significantly WIDER of off-stump than usual','Bowl FULL length — short inswingers lose movement','Target: gap between bat and front pad','LBW or bowled are the natural rewards'],
    tips:'Bowl FULL. Short inswingers completely lose movement.',
    target_metric:'Consistent 10cm+ inswing movement confirmed by a training partner' },
  { id:'w005',category:'bowling',title:'Leg Spin Fundamentals',skill_level:'beginner',duration_minutes:20,xp_value:80,
    video_id:'7pFfqTFvOEs',
    description:'Master the art of leg-spin. The most difficult bowling skill in cricket.',
    steps:['Grip: ball rests in the palm, THIRD FINGER primary across seam','Cock wrist fully back so fingers point downward','High arm action — bring it over fast and smooth','At release: SNAP third finger rightward and over the top','Ball rotates right-to-left — confirm with partner','Start at 10 metres — gradually build to full length'],
    tips:'The snap comes from wrist AND third finger working together.',
    target_metric:'6 of 10 balls showing clear visible leg-spin turn' },
  { id:'w006',category:'bowling',title:'Off Spin with Drift',skill_level:'beginner',duration_minutes:18,xp_value:70,
    video_id:'7pFfqTFvOEs',
    description:'Develop consistent off-spin with drift and turn.',
    steps:['Grip: index and middle finger across seam on top','Turn ball from right to left with fingers at release','Flight the ball up — use the air to create drift','Bowl on middle-off stump line','Vary pace intentionally — float one ball in 10mph slower','With breeze from behind: drift comes naturally'],
    tips:'Use fingers — not wrist. Drift is your invisible weapon.',
    target_metric:'7 of 10 balls on correct line and length with visible turn' },
  { id:'w007',category:'bowling',title:'Bouncer Control & Use',skill_level:'advanced',duration_minutes:20,xp_value:120,
    video_id:'d3wJbkDK-SU',
    description:'Use the short ball as a genuine weapon — physical skill and psychological warfare.',
    steps:['Mark the back-of-length zone on the pitch','Full run-up at maximum sustainable pace','Higher arm arc at point of release','Ball should arrive at chest-to-head height','Control: NOT wide and NOT overpitched','Vary target: chest, armpit, throat'],
    tips:'Aim for the ARMPIT — not the head. Vary target zone every time.',
    target_metric:'5 of 8 bouncers arriving in the target body zone' },
  { id:'w008',category:'bowling',title:'Googly Disguise',skill_level:'intermediate',duration_minutes:20,xp_value:110,
    video_id:'7pFfqTFvOEs',
    description:'Bowl the googly with complete disguise.',
    steps:['Standard leg-spin grip — practice 5 balls to feel natural','SAME action exactly — wrist rolls INWARD at release','Ball exits from the BACK of hand — turns INTO right-hander','Sequence: 5 leg-spinners then 1 googly with identical action','Partner attempts to pick which delivery it is','Perfect disguise until partner cannot identify before pitch 50%'],
    tips:'The googly is identical to leg-spin until the last microsecond of wrist action.',
    target_metric:'Partner misreads the googly 6 of 10 times correctly' },
  { id:'w009',category:'bowling',title:'Slower Ball Variations',skill_level:'advanced',duration_minutes:22,xp_value:130,
    video_id:'SZsXolnz5Pg',
    description:'Off-cutter, leg-cutter, knuckleball — the T20 variations that win matches.',
    steps:['Off-cutter: cut middle finger from OFF to LEG at release','Leg-cutter: cut finger in the OPPOSITE direction','Knuckleball: grip on knuckles, push ball out slowly','Same full run-up and identical arm speed as your fastball','Practice EACH variation for 10 balls before mixing','Mix without any predictable pattern'],
    tips:'Disguise is the entire weapon. Identical arm speed = unreadable delivery.',
    target_metric:'Deceive a batting partner with 3 of 4 variations in a sequence' },
  { id:'w010',category:'bowling',title:'Death Bowling Masterclass',skill_level:'advanced',duration_minutes:25,xp_value:150,
    video_id:'d3wJbkDK-SU',
    description:'Defend 10+ runs in the last 2 overs of a T20. The complete death bowler toolkit.',
    steps:['Delivery 1: Full straight yorker at stumps','Delivery 2: IDENTICAL action — knuckleball or wide yorker','Delivery 3: Short of good length at body','Delivery 4: Full again — they fear the short ball now','Delivery 5: Wide yorker outside off','Delivery 6: Full yorker at stumps'],
    tips:'Never bowl the same delivery twice consecutively.',
    target_metric:'Concede fewer than 8 runs in a complete simulated death over' },
  { id:'f001',category:'fielding',title:'Ground Fielding Excellence',skill_level:'beginner',duration_minutes:15,xp_value:55,
    video_id:'0mH8BKDB5Qk',
    description:'Clean, athletic ground fielding with the long barrier.',
    steps:['Start in athletic ready position — weight on balls of feet','Ball arrives: move quickly and ATTACK the ball','Drop to one knee creating a long barrier','Pick cleanly with BOTH hands','Stand immediately to balanced throwing position','Complete throw at stumps — 20 repetitions each side'],
    tips:'Body BEHIND ball every single time. Never one-hand grabs in match situations.',
    target_metric:'20 clean stops of 25 balls from multiple angles and speeds' },
  { id:'f002',category:'fielding',title:'Throwing Accuracy at Stumps',skill_level:'beginner',duration_minutes:20,xp_value:70,
    video_id:'0mH8BKDB5Qk',
    description:'Flat, fast, accurate throws directly at the stumps.',
    steps:['Pick ball up cleanly in one smooth motion','Pivot FAST onto your back foot','Turn shoulders fully SIDE-ON to the target stumps','Arm swings in a HIGH full arc','Release FLAT — aim at the TOP of the stumps','Complete full follow-through pointing at the target'],
    tips:'Side-on position. High arm. Target: TOP of stumps — not the ground.',
    target_metric:'8 of 15 direct hits on stumps from 30 metres' },
  { id:'f003',category:'fielding',title:'High Catch Confidence',skill_level:'intermediate',duration_minutes:20,xp_value:90,
    video_id:'0mH8BKDB5Qk',
    description:'Take high skiers confidently under sun, pressure, and crowd noise.',
    steps:['Call "MINE" loudly and immediately','Move FAST to get UNDER the ball','Plant feet with one foot slightly forward','Cup hands at eye level — fingers pointing upward','Watch ball ALL the way into the cup','Complete the carry-through — do not stop momentum'],
    tips:'Get UNDER the ball early. Move your feet to perfect position THEN catch.',
    target_metric:'10 consecutive catches without a drop from varying heights' },
  { id:'f004',category:'fielding',title:'Slip Cordon Reactions',skill_level:'intermediate',duration_minutes:20,xp_value:100,
    video_id:'Qh5oHMmPb8k',
    description:'React faster and catch harder in the slip cordon.',
    steps:['Set up in slip position — hands held LOW at knee height','Weight forward on balls of feet','Partner sends fast deflections via catching cradle randomly','React to movement — do NOT anticipate direction','Take ball from knee to shoulder height in one movement','Return IMMEDIATELY to starting ready position'],
    tips:'Hands LOW always. React to the SOUND of the edge before eyes process movement.',
    target_metric:'15 of 20 catches taken cleanly at pace from random directions' },
  { id:'f005',category:'fielding',title:'Direct Hit Run Outs',skill_level:'intermediate',duration_minutes:15,xp_value:90,
    video_id:'0mH8BKDB5Qk',
    description:'Field a ball at full sprint pace and hit the stumps directly.',
    steps:['Ball rolled at medium pace from 20 metres','Sprint to intercept at absolute maximum pace','Clean pick-up in ONE single motion','Pivot IMMEDIATELY — set feet side-on to target','Throw FLAT at the near stump','Entire sequence under 3.5 seconds'],
    tips:'Target the NEAR stump. A miss slightly wide still gives keeper a stumping chance.',
    target_metric:'3 direct hits in 10 attempts, all under 3.5 seconds total' },
  { id:'f006',category:'fielding',title:'Boundary Diving Saves',skill_level:'advanced',duration_minutes:25,xp_value:115,
    video_id:'0mH8BKDB5Qk',
    description:'Save crucial boundaries with full athletic commitment.',
    steps:['Partner drives ball hard toward the boundary','Sprint at maximum effort — attack the ball aggressively','When you cannot stop conventionally: DIVE full length','Stop ball before it reaches the boundary rope','Recover immediately to your feet','Train equal reps diving left AND right'],
    tips:'Commit 100% to the dive. A half-dive becomes a fumble.',
    target_metric:'Save 8 of 10 boundary attempts with athletic diving stops' },
  { id:'k001',category:'wicketkeeping',title:'Keeper Stance & Takes',skill_level:'beginner',duration_minutes:15,xp_value:65,
    video_id:'Qh5oHMmPb8k',
    description:'Perfect the wicketkeeping stance — the foundation every world-class keeper builds on.',
    steps:['Weight on TOES — never on heels throughout the entire delivery','Hands held out in front of body — soft, relaxed, ready','Side-step movement following the ball throughout the delivery','Stay LOW throughout — never stand up early','Fingers pointing DOWN for balls below waist','Fingers pointing UP for balls above waist'],
    tips:'Never cross your feet laterally. Soft hands — tense hands drop clean takes.',
    target_metric:'15 consecutive clean takes across all heights and lines' },
  { id:'k002',category:'wicketkeeping',title:'Stumping Technique',skill_level:'intermediate',duration_minutes:18,xp_value:100,
    video_id:'Qh5oHMmPb8k',
    description:'Master the stumping — the wicketkeeper\'s signature dismissal.',
    steps:['Position directly behind the stumps','Watch ball travel PAST the batsman\'s back foot before moving','Move laterally to take the wide delivery with soft hands','Single flowing motion: take ball and whip bails off','Instant loud appeal — HOWZAT every time','Under 0.5 seconds is elite class'],
    tips:'Ball must pass the batsman\'s back foot BEFORE you begin any movement.',
    target_metric:'10 clean stumpings out of a 30-ball spin-bowling session' },
  { id:'k003',category:'wicketkeeping',title:'Standing Up to Spin',skill_level:'advanced',duration_minutes:25,xp_value:130,
    video_id:'Qh5oHMmPb8k',
    description:'Stand directly up to the stumps for all spin bowling.',
    steps:['Position directly behind stumps — within one metre','Begin with spinner bowling at HALF pace','Take deliveries arriving exactly at the stumps','For turning delivery: quick explosive lateral swivel','Stumping opportunity: whip bails off in one motion','Personal standard: zero byes'],
    tips:'This is the hardest skill in wicketkeeping. Build up gradually over weeks.',
    target_metric:'Zero byes conceded across 20 spin deliveries while standing up' },
  { id:'fit001',category:'fitness',title:'Cricket Sprint Protocol',skill_level:'beginner',duration_minutes:20,xp_value:70,
    description:'Develop explosive sprint speed for running between wickets and explosive fielding starts.',
    steps:['Dynamic warm-up: high knees, butt kicks, leg swings — 5 minutes','Sprint 22 yards: 10 repetitions with 30 seconds rest','Focus on explosive first step — drive out with maximum force','Drive arms hard — arms are the engine that drives leg speed','Stay LOW for first 5 metres — do not straighten up early','Cool down: easy jog 3 minutes'],
    tips:'The first 10 metres is everything in cricket fielding.',
    target_metric:'22 yards consistently under 3.2 seconds' },
  { id:'fit002',category:'fitness',title:'Cricket Core Stability',skill_level:'beginner',duration_minutes:15,xp_value:65,
    description:'Core strength for batting power, bowling action stability, and fielding agility.',
    steps:['Plank: 3 x 45 seconds','Side plank: 2 x 30 seconds each side','Dead bugs: 3 x 10 each side','Bird dog: 3 x 10 each side','Russian twists: 3 x 20 with a cricket ball','Rest 45 seconds between all sets'],
    tips:'Brace your core actively on every repetition.',
    target_metric:'Complete the full circuit 3 times with perfect form' },
  { id:'fit003',category:'fitness',title:'Bowling Shoulder Pre-Hab',skill_level:'beginner',duration_minutes:15,xp_value:60,
    description:'Protect your bowling shoulder. Complete this BEFORE every session.',
    steps:['Shoulder circles slow: 20 forward, 20 backward','External rotation with band: 3 x 15 each arm','Internal rotation: 3 x 15 each arm','Scapular retractions: 3 x 15','YTW exercise: 3 x 10 each letter','Sleeper stretch: 60 seconds each side'],
    tips:'15 minutes of prevention = years of injury-free bowling.',
    target_metric:'Complete pre-hab before 100% of all bowling sessions' },
  { id:'fit004',category:'fitness',title:'Explosive Leg Power',skill_level:'advanced',duration_minutes:25,xp_value:110,
    description:'Devastating leg power for batting explosiveness, bowling speed, and fielding agility.',
    steps:['Box jumps: 4 x 8 repetitions — maximum height, land silently','Jump squats: 3 x 10 — controlled descent, explosive ascent','Single-leg bounds: 3 x 6 each leg','Sprint starts from deep crouch: 5 x 30 metres maximum effort','Rest 90 seconds between ALL explosive sets','Landing noisily = poor power transfer'],
    tips:'Full hip extension at take-off. Silent landing = efficient power transfer.',
    target_metric:'Standing broad jump consistently reaching 2.0 metres' },
  { id:'fit005',category:'fitness',title:'Agility Ladder Footwork',skill_level:'intermediate',duration_minutes:20,xp_value:90,
    description:'Rapid footwork patterns for explosive fielding and quick running.',
    steps:['Single steps — one foot per box — 2 minutes continuous','Two feet per box — 2 minutes continuous','Lateral shuffle through every box — 2 minutes each side','In-in-out-out pattern — 2 minutes','Sprint through at maximum speed: 6 x 10 metres','Cool down: 3 minutes easy walking'],
    tips:'Light, fast, precise foot contacts. Arms drive leg speed.',
    target_metric:'Complete all patterns under 20 minutes with zero ladder contacts' },
  { id:'ment001',category:'mental',title:'Batting Visualization',skill_level:'beginner',duration_minutes:15,xp_value:65,
    description:'Mentally rehearse your perfect innings in vivid multisensory detail.',
    steps:['Close your eyes. Relax every muscle from head to toe.','Picture yourself walking to the crease with confidence','Face 10 deliveries in your mind — play each with perfect technique','Include every sensory detail: bat feel, spikes on grass, crowd sounds','See each delivery arrive and play your best shot','Open your eyes and carry this image into your next real session.'],
    tips:'Be vivid, specific, and multi-sensory.',
    target_metric:'Complete a 10-minute visualization session every day for 2 weeks' },
  { id:'ment002',category:'mental',title:'Between-Ball Reset Routine',skill_level:'intermediate',duration_minutes:12,xp_value:80,
    description:'Master the psychological routine between deliveries.',
    steps:['After ball: look AWAY from the bowler immediately','Take ONE deep reset breath — fully exhale all tension','Tap bat on ground exactly twice — physical anchor to present moment','Scan the field: note any changes to field positions','Look down at the bat handle to refocus attention','New stance — fresh psychological start — every ball is the first ball'],
    tips:'Make this routine completely AUTOMATIC. Same every time, no exceptions.',
    target_metric:'Consistent complete routine used in a 20-ball simulation' },
  { id:'ment003',category:'mental',title:'Pressure Inoculation',skill_level:'advanced',duration_minutes:20,xp_value:130,
    description:'Simulate extreme match pressure in training so real matches feel familiar.',
    steps:['Set a realistic high-pressure scenario: 5 runs needed last over','Real bowler, real fielders, real scorekeeper, vocal spectators','Both teams understand the scenario — pressure is maximum','Do NOT rush — use your complete between-ball routine','Assess situation logically before each ball — plan then execute','Full debrief: what worked? what would you change?'],
    tips:'Pressure is a privilege given only to those who matter.',
    target_metric:'Complete 6 high-pressure scenarios while maintaining full routine' },
];

// ── Mental Sessions Factory ───────────────────────────────────────
const MI = {
  focus:['Find a comfortable seated position and gently close your eyes.','Take three slow complete breaths to settle your nervous system.','Bring all your attention completely to this present moment.','Notice any thoughts that arise — acknowledge each one and release it.','Narrow your entire focus to a single precise point of concentration.','Maintain this focused state through the remainder of the session.'],
  confidence:['Sit tall with excellent posture and take three powerful breaths.','Recall your single greatest performance moment in complete detail.','Feel that exact confidence filling every cell of your body right now.','Repeat your most important personal performance affirmation three times.','Visualize yourself performing with complete belief and natural authority.','Step forward carrying this energy directly into your next performance.'],
  recovery:['Find a quiet space and allow your entire body to fully relax.','Take five long breaths releasing all held tension on every exhale.','Acknowledge frustration without any self-judgment — it is natural.','Remind yourself: every setback is an essential part of the journey.','Identify one specific learning point you can actively take forward.','Make a firm commitment to showing up tomorrow with fresh energy.'],
  'pre-performance':['Begin with three slow grounding breaths — inhale through nose, exhale through mouth.','Scan your body from head to toe, releasing every point of tension.','Visualize walking to your position with calm certain authority.','See yourself executing your most important skill perfectly on the first ball.','Feel the productive excitement and physical readiness building within you.','Step forward with total intention — you have prepared and you are ready.'],
  pressure:['Acknowledge the pressure you feel — it means this genuinely matters.','Breathe in for 4 slow counts, hold for 2, then exhale fully for 6.','Remember: pressure is only given to those trusted to operate at this level.','Focus completely on what you can actually control — your process only.','Commit to your specific process — one ball, one breath, one moment.','Step forward with calm confidence built through your preparation.'],
  visualization:['Close your eyes and progressively relax every single muscle group.','Create an extremely vivid mental image of your performance environment.','See yourself performing your key cricket skill perfectly with ease.','Add full sensory details: sounds, smells, temperature, physical sensations.','Watch yourself succeed completely — feel the deep earned satisfaction.','Open your eyes and carry this sharp vision into your actual performance.'],
  'match-day-calm':['Take your position and close your eyes with complete deliberateness.','Breathe in slowly for 4 counts, hold briefly, release fully for 4 counts.','Feel your feet completely grounded, your body fully present and stable.','Release ALL thoughts connected to outcomes — they are not yours to hold.','Trust your preparation completely — you have done the necessary work.','Open your eyes now with complete calm and confident readiness.'],
  'pro-mental':['Enter the deepest available stillness through sustained controlled breathing.','Access your peak mental state deliberately through concentrated focus.','Engage your elite competitor mindset fully — you have been here before.','Visualize your complete performance in vivid detail from start to finish.','Lock in your precise process cues and personal performance triggers.','Step out now as the athlete you have consistently trained yourself to become.'],
};

function mkM(id,title,cat,dur,xp,premium=false) {
  const mins=Math.floor(dur/60);
  const n=Math.max(3,Math.min(6,Math.ceil(dur/90)));
  const sd=Math.floor(dur/n);
  const pool=MI[cat]||MI.focus;
  const steps=pool.slice(0,n).map((instruction,i)=>({ instruction, duration_seconds:i===n-1?dur-sd*(n-1):sd }));
  return { id,title,category:cat,duration_seconds:dur,xp_value:xp,is_premium:premium,
    description:`A ${mins}-minute ${cat.replace(/-/g,' ')} session to build your mental game.`,steps };
}

const MENTAL_SESSIONS = [
  mkM('m01','Micro Focus Burst','focus',180,35), mkM('m02','Focus Next Ball','focus',240,45),
  mkM('m03','5-4-3-2-1 Grounding','focus',300,50), mkM('m04','Task Isolation Protocol','focus',300,50),
  mkM('m05','Laser Focus Activation','focus',360,55), mkM('m06','Deep Focus Anchor','focus',360,60),
  mkM('m07','Sensory Narrowing','focus',360,60), mkM('m08','Process Over Result','focus',420,65),
  mkM('m09','Noise Cancellation Focus','focus',420,70), mkM('m10','Single-Point Focus Drill','focus',480,55),
  mkM('m11','Flow State Trigger','focus',600,75), mkM('m12','Trusting Instinct','focus',420,65),
  mkM('m20','Morning Positivity Charge','confidence',240,40), mkM('m21','Confidence Countdown','confidence',300,50),
  mkM('m22','Celebrate Small Wins','confidence',300,50), mkM('m23','Self-Talk Rewrite','confidence',360,55),
  mkM('m24','Name Your Strength','confidence',300,50), mkM('m25','Affirmation Immersion','confidence',420,60),
  mkM('m26','Own the Room','confidence',420,65), mkM('m27','Inner Champion','confidence',480,65),
  mkM('m28','Champion Mindset Simulation','confidence',600,85), mkM('m29','Identity Goal Setting','confidence',540,75),
  mkM('m30','Reset Button','recovery',240,45), mkM('m31','Self-Compassion Break','recovery',300,50),
  mkM('m32','Reset After Duck','recovery',300,50), mkM('m33','Bounce-Back Faster','recovery',360,60),
  mkM('m34','Breathing Through Collapse','recovery',360,65), mkM('m35','Let It Go Protocol','recovery',420,60),
  mkM('m36','Failure as Feedback','recovery',420,60), mkM('m37','Processing Disappointment','recovery',480,70),
  mkM('m38','Post-Game Emotional Release','recovery',480,70), mkM('m39','Champions Setback','recovery',480,70),
  mkM('m40','Full Body Relaxation','recovery',540,65), mkM('m41','Sleep Better Tonight','recovery',480,60),
  mkM('m50','Pre-Game Activation','pre-performance',300,50), mkM('m51','Nervous Energy Converter','pre-performance',360,55),
  mkM('m52','Pre-Performance Calm','pre-performance',360,55), mkM('m53','Anchoring Peak State','pre-performance',360,65),
  mkM('m54','Game Day Activation','pre-performance',420,65), mkM('m55','Embrace the Arena','pre-performance',420,65),
  mkM('m56','Morning of Big Day','pre-performance',540,75), mkM('m57','Champions Routine','pre-performance',540,75),
  mkM('m58','Pre-Tournament Mind Lock','pre-performance',600,80),
  mkM('m60','10-Second Rule','pressure',300,50), mkM('m61','Physiological Sigh','pressure',180,35),
  mkM('m62','Strategic Pause','pressure',360,60), mkM('m63','Pressure Is Privilege','pressure',420,65),
  mkM('m64','Handling the Unplayable Ball','pressure',420,70), mkM('m65','Bowling Under Pressure','pressure',420,65),
  mkM('m66','Decision Clarity Under Pressure','pressure',420,70), mkM('m67','Choke-Proof Preparation','pressure',540,80),
  mkM('m68','Mental Toughness Builder','pressure',600,85),
  mkM('m70','Batting Visualization Session','visualization',300,50), mkM('m71','Future-Pacing Success','visualization',420,65),
  mkM('m72','Fielding Brilliance Rehearsal','visualization',420,65), mkM('m73','Master Skill Replay','visualization',480,70),
  mkM('m74','Vision Board Visualization','visualization',480,70), mkM('m75','Perfect Performance','visualization',540,75),
  mkM('m76','Champion Visualization','visualization',600,85),
  mkM('m77','Elite Endurance Mindset','visualization',720,110,true), mkM('m78','Flow State Architecture','visualization',900,120,true),
  mkM('m80','4-7-8 Breath Lock','match-day-calm',360,50), mkM('m81','Deep Calm Breathing','match-day-calm',300,50),
  mkM('m82','Gratitude Before Game','match-day-calm',300,50), mkM('m83','Stillness Practice','match-day-calm',360,55),
  mkM('m84','Anxiety Dissolve Protocol','match-day-calm',420,65), mkM('m85','Box Breathing Method','match-day-calm',480,65),
  mkM('m86','Inner Lake','match-day-calm',420,60),
  mkM('m90','Deliberate Practice Mindset','pro-mental',600,100,true), mkM('m91','Mastery Over Perfection','pro-mental',600,100,true),
  mkM('m92','Elite Competitor Analysis','pro-mental',720,110,true), mkM('m93','Inner Dialogue Mastery','pro-mental',720,110,true),
  mkM('m94','Zone of Genius Activation','pro-mental',720,110,true),
];

function mkW(id,name,level,target,goal,durCat,exercises,durMin,xp) {
  return {id,name,level,target,goal,duration_category:durCat,exercises,duration_minutes:durMin,xp_value:xp};
}
const WORKOUTS = [
  mkW('wb001','Full Body Beginner Blast','beginner','full-body','build-muscle','10-15',4,12,85),
  mkW('wb002','Quick Morning Starter','beginner','full-body','lose-weight','<10',4,8,70),
  mkW('wb003','Chest Beginner Build','beginner','chest','build-muscle','10-15',3,12,70),
  mkW('wb004','Back Beginner Strengthen','beginner','back','build-muscle','<10',3,8,65),
  mkW('wb005','Shoulder Beginner Tone','beginner','shoulders','build-muscle','<10',3,8,65),
  mkW('wb006','Arms Beginner Blast','beginner','arms','build-muscle','10-15',4,12,80),
  mkW('wb007','Legs Beginner Strength','beginner','legs','build-muscle','10-15',4,12,85),
  mkW('wb008','Core Beginner Basics','beginner','core','build-muscle','10-15',4,12,80),
  mkW('wb009','Quick Fat Burn Sprint','beginner','full-body','lose-weight','<10',4,8,70),
  mkW('wb010','Full Body Fat Burn Beginner','beginner','full-body','lose-weight','15-20',5,18,95),
  mkW('wb011','Total Toning Beginner','beginner','full-body','build-muscle','15-20',5,18,100),
  mkW('wb012','10-Minute Full Body Burn','beginner','full-body','lose-weight','10-15',8,10,80),
  mkW('wb013','Chest Fat Burn Beginner','beginner','chest','lose-weight','10-15',3,12,72),
  mkW('wb014','Back Fat Burn Beginner','beginner','back','lose-weight','10-15',3,12,70),
  mkW('wb015','Legs Endurance Beginner','beginner','legs','improve-endurance','15-20',4,18,90),
  mkW('wb016','Core Fat Burn Beginner','beginner','core','lose-weight','<10',4,8,72),
  mkW('wb017','Glutes Beginner Tone','beginner','glutes','build-muscle','10-15',4,12,80),
  mkW('wb018','Full Body Endurance Starter','beginner','full-body','improve-endurance','10-15',4,12,85),
  mkW('wb019','Arms Fat Burn Beginner','beginner','arms','lose-weight','<10',3,8,68),
  mkW('wb020','Evening Stretch Beginner','beginner','full-body','improve-endurance','<10',4,8,60),
  mkW('wi001','Full Body Intermediate Power','intermediate','full-body','build-muscle','20-25',5,22,165),
  mkW('wi002','Chest Intermediate Build','intermediate','chest','build-muscle','15-20',4,17,140),
  mkW('wi003','Back Intermediate Strength','intermediate','back','build-muscle','15-20',4,17,135),
  mkW('wi004','Shoulder Intermediate Sculpt','intermediate','shoulders','build-muscle','15-20',4,17,140),
  mkW('wi005','Arms Intermediate Pump','intermediate','arms','build-muscle','20-25',5,22,165),
  mkW('wi006','Legs Intermediate Circuit','intermediate','legs','build-muscle','20-25',5,22,160),
  mkW('wi007','Core Intermediate Shred','intermediate','core','build-muscle','15-20',5,17,145),
  mkW('wi008','HIIT Fat Burner Intermediate','intermediate','full-body','lose-weight','10-15',4,12,130),
  mkW('wi009','Endurance Builder Intermediate','intermediate','full-body','improve-endurance','20-25',5,22,160),
  mkW('wi010','Chest Intermediate Fat Burn','intermediate','chest','lose-weight','10-15',4,12,128),
  mkW('wi011','Legs Intermediate Fat Burn','intermediate','legs','lose-weight','15-20',4,17,148),
  mkW('wi012','Core Intermediate Fat Burn','intermediate','core','lose-weight','10-15',4,12,125),
  mkW('wi013','Full Body Endurance Circuit','intermediate','full-body','improve-endurance','15-20',5,17,155),
  mkW('wi014','Upper Body Pump Builder','intermediate','full-body','build-muscle','15-20',6,17,150),
  mkW('wi015','Core Shred Express','intermediate','core','lose-weight','10-15',7,12,122),
  mkW('wi016','Full Body Fat Burn Int','intermediate','full-body','lose-weight','20-25',5,22,168),
  mkW('wi017','Active Recovery Session','intermediate','full-body','improve-endurance','15-20',5,17,120),
  mkW('wi018','Glutes Intermediate Shaper','intermediate','glutes','build-muscle','15-20',5,17,140),
  mkW('wi019','Shoulder Intermediate Burn','intermediate','shoulders','lose-weight','15-20',4,17,140),
  mkW('wi020','Full Body Balance Circuit','intermediate','full-body','improve-endurance','25+',6,27,185),
  mkW('wa001','Full Body Advanced HIIT','advanced','full-body','lose-weight','25+',6,27,220),
  mkW('wa002','Chest Advanced Power','advanced','chest','build-muscle','15-20',4,17,178),
  mkW('wa003','Back Advanced Domination','advanced','back','build-muscle','15-20',4,17,182),
  mkW('wa004','Shoulder Advanced Burn','advanced','shoulders','build-muscle','15-20',4,17,175),
  mkW('wa005','Arms Advanced Pump','advanced','arms','build-muscle','20-25',5,22,192),
  mkW('wa006','Legs Explosive Advanced','advanced','legs','build-muscle','20-25',5,22,190),
  mkW('wa007','Core Advanced Destroyer','advanced','core','build-muscle','15-20',5,17,175),
  mkW('wa008','Fat Burn HIIT Advanced','advanced','full-body','lose-weight','20-25',6,22,210),
  mkW('wa009','Power Strength Advanced','advanced','full-body','build-muscle','20-25',5,22,215),
  mkW('wa010','Total Body Cardio Advanced','advanced','full-body','improve-endurance','25+',6,27,225),
  mkW('wa011','Glutes & Hamstrings Advanced','advanced','glutes','lose-weight','20-25',5,22,205),
  mkW('wa012','Chest & Triceps Advanced','advanced','chest','build-muscle','20-25',5,22,190),
  mkW('wa013','Leg Day Power Circuit','advanced','legs','build-muscle','20-25',7,22,200),
  mkW('wa014','Full Body Advanced Athlete','advanced','full-body','build-muscle','25+',6,27,230),
  mkW('wa015','Mobility & Flexibility Advanced','advanced','full-body','improve-endurance','20-25',5,22,160),
  mkW('wa016','Back Advanced Fat Burn','advanced','back','lose-weight','15-20',4,17,170),
  mkW('wa017','Core Advanced Annihilation','advanced','core','improve-endurance','15-20',5,17,185),
  mkW('wa018','Arms Advanced Strength','advanced','arms','build-muscle','15-20',4,17,175),
  mkW('wa019','Full Body Athlete Builder','advanced','full-body','build-muscle','25+',8,27,220),
  mkW('wa020','Chest Advanced Sculptor','advanced','chest','build-muscle','15-20',4,17,165),
  mkW('wp001','Full Body Pro Endurance','pro','full-body','improve-endurance','25+',6,28,310),
  mkW('wp002','Chest Pro Supreme','pro','chest','build-muscle','20-25',4,22,270),
  mkW('wp003','Back Pro Mastery','pro','back','build-muscle','20-25',4,22,280),
  mkW('wp004','Shoulders Elite Pro','pro','shoulders','build-muscle','20-25',5,22,270),
  mkW('wp005','Arms Pro Elite','pro','arms','build-muscle','20-25',4,22,275),
  mkW('wp006','Legs Pro Explosion','pro','legs','build-muscle','25+',5,28,305),
  mkW('wp007','Core Elite Pro','pro','core','build-muscle','20-25',5,22,260),
  mkW('wp008','Full Body Power Pro','pro','full-body','build-muscle','25+',6,28,320),
  mkW('wp009','Explosive Power Pro','pro','full-body','build-muscle','25+',6,28,330),
  mkW('wp010','Pro Athlete Conditioning','pro','full-body','improve-endurance','25+',7,28,300),
  mkW('wp011','Chest Pro Explosion','pro','chest','build-muscle','20-25',4,22,285),
  mkW('wp012','Back Pro Strength','pro','back','build-muscle','20-25',4,22,280),
  mkW('wp013','Legs Pro Power','pro','legs','build-muscle','25+',5,28,305),
  mkW('wp014','Core Pro Mastery','pro','core','build-muscle','20-25',4,22,265),
  mkW('wp015','Arms Pro Domination','pro','arms','build-muscle','25+',5,28,290),
  mkW('wp016','Back Domination Pro','pro','back','build-muscle','25+',5,28,290),
  mkW('wp017','Shoulders Pro Power','pro','shoulders','build-muscle','20-25',4,22,275),
  mkW('wp018','Core Stability Pro','pro','core','improve-endurance','20-25',5,22,270),
  mkW('wp019','Full Body Pro Fat Burn','pro','full-body','lose-weight','25+',6,28,295),
  mkW('wp020','Full Body Pro Cardio','pro','full-body','lose-weight','20-25',6,22,288),
];

function findWorkouts(level, target, goal, durCat) {
  const m=(w,lv,tg,gl,dc)=>w.level===lv&&(tg==='any'||w.target===tg)&&(gl==='any'||w.goal===gl)&&(dc==='any'||w.duration_category===dc);
  let r=WORKOUTS.filter(w=>m(w,level,target,goal,durCat)); if(r.length) return r;
  r=WORKOUTS.filter(w=>m(w,level,target,goal,'any')); if(r.length) return r;
  r=WORKOUTS.filter(w=>m(w,level,target,'any','any')); if(r.length) return r;
  r=WORKOUTS.filter(w=>m(w,level,'any','any','any')); if(r.length) return r;
  const fb={pro:'advanced',advanced:'intermediate',intermediate:'beginner',beginner:'beginner'};
  r=WORKOUTS.filter(w=>w.level===level||w.level===fb[level]);
  return r.length?r:[WORKOUTS[0]];
}

const SKILL_PATHS = [
  { id:'batting', title:'Batting Mastery', icon:'bat', desc:'From solid defence to dominant attacking play — the complete batsman blueprint.',
    color:'from-blue-600 to-indigo-700', textColor:'text-blue-300', borderColor:'border-blue-500/50',
    accent:'#3b82f6',
    levels:[
      { id:'beginner', label:'Club Cricketer', icon:'bat', xpPerDay:80, desc:'Fundamentals, defensive technique, and basic stroke play.', sampleDrills:['Defensive Block Foundation','Cover Drive Mastery','Running Between Wickets'] },
      { id:'intermediate', label:'District Player', icon:'bat', xpPerDay:120, desc:'Shot expansion, spin play, and core T20 skills.', sampleDrills:['Cut Shot Technique','Sweep Shot vs Spin','Pull Shot Power'] },
      { id:'advanced', label:'State Performer', icon:'bat', xpPerDay:160, desc:'Power hitting, pressure batting, and match-winning skills.', sampleDrills:['T20 Power Hitting','Ramp Shot over Keeper','Pressure Inoculation'] },
      { id:'pro', label:'Elite Cricketer', icon:'crown', xpPerDay:200, desc:'Elite refinement, match simulation, and peak performance.', sampleDrills:['Reading Spin from Hand','Between-Ball Reset Routine','Complete Shot Arsenal'] }
    ] },
  { id:'bowling', title:'Bowling Excellence', icon:'ball', desc:'Build line and length, develop all variations, and become unplayable.',
    color:'from-red-600 to-orange-600', textColor:'text-red-300', borderColor:'border-red-500/50',
    accent:'#ef4444',
    levels:[
      { id:'beginner', label:'Club Bowler', icon:'ball', xpPerDay:75, desc:'Correct action, basic control, and seam presentation.', sampleDrills:['Line & Length Precision','Off Spin with Drift','Leg Spin Fundamentals'] },
      { id:'intermediate', label:'District Bowler', icon:'ball', xpPerDay:115, desc:'Swing bowling, spin variations, and field setting.', sampleDrills:['Outswing Mastery','Inswing Bowling','Googly Disguise'] },
      { id:'advanced', label:'State Bowler', icon:'ball', xpPerDay:155, desc:'Death bowling, yorkers, and pressure bowling mastery.', sampleDrills:['Yorker Death Bowling','Bouncer Control & Use','Slower Ball Variations'] },
      { id:'pro', label:'Elite Bowler', icon:'crown', xpPerDay:195, desc:'Complete mastery of swing, seam, spin, and pace variety.', sampleDrills:['Death Bowling Masterclass','Complete Variation Arsenal','Match Simulation'] }
    ] },
  { id:'fielding', title:'Fielding Athlete', icon:'navigation', desc:'Become the player every captain wants — quick, accurate, fearless.',
    color:'from-emerald-600 to-teal-600', textColor:'text-emerald-300', borderColor:'border-emerald-500/50',
    accent:'#10b981',
    levels:[
      { id:'beginner', label:'Safe Pair of Hands', icon:'navigation', xpPerDay:65, desc:'Clean stops, basic catching, and safe accurate returns.', sampleDrills:['Ground Fielding Excellence','High Catch Confidence','Throwing Accuracy at Stumps'] },
      { id:'intermediate', label:'Athletic Fielder', icon:'navigation', xpPerDay:100, desc:'Slip catching, direct hits, and boundary saving.', sampleDrills:['Slip Cordon Reactions','Direct Hit Run Outs','Boundary Diving Saves'] },
      { id:'advanced', label:'Elite Fielder', icon:'navigation', xpPerDay:140, desc:'Elite boundary work, run-out artistry, and impact fielding.', sampleDrills:['Direct Hit Run Outs','Boundary Diving Saves','Pressure Catches'] },
      { id:'pro', label:'World-Class Fielder', icon:'crown', xpPerDay:180, desc:'Redefine the standard of fielding excellence.', sampleDrills:['Full Fielding Masterclass','Captaining the Field','Zero Boundaries Conceded'] }
    ] },
  { id:'allrounder', title:'All-Rounder Path', icon:'star', desc:'The complete cricketer — bat, ball, and field at the highest level.',
    color:'from-purple-600 to-pink-600', textColor:'text-purple-300', borderColor:'border-purple-500/50',
    accent:'#a855f7',
    levels:[
      { id:'beginner', label:'Utility Player', icon:'star', xpPerDay:90, desc:'Solid in two disciplines.', sampleDrills:['Cover Drive Mastery','Line & Length Precision','Ground Fielding Excellence'] },
      { id:'intermediate', label:'Impact Player', icon:'zap', xpPerDay:135, desc:'Match-winning contributions in both disciplines.', sampleDrills:['Pull Shot Power','Outswing Mastery','Slip Cordon Reactions'] },
      { id:'advanced', label:'Key All-Rounder', icon:'star', xpPerDay:175, desc:'Consistently influential in all three disciplines.', sampleDrills:['T20 Power Hitting','Death Bowling Masterclass','Elite Fielding'] },
      { id:'pro', label:'Complete Cricketer', icon:'crown', xpPerDay:220, desc:'Redefine what an all-rounder brings to the team.', sampleDrills:['Complete Batting Arsenal','Complete Bowling Arsenal','World-Class Fielding'] }
    ] }
];

function generateWeekPlan(pathId, levelId) {
  const path=SKILL_PATHS.find(p=>p.id===pathId);
  const lv=path&&path.levels.find(l=>l.id===levelId);
  if(!path||!lv) return [];
  const phases=['Foundation','Development','Integration','Performance','Mastery'];
  return phases.map((phase,wi)=>({
    week:wi+1, phase, theme:`Week ${wi+1} \u2014 ${phase}`,
    days:Array.from({length:7},(_,di)=>{
      if(di===6) return { day:7,label:'Sun',isRest:true,activities:[] };
      const isLight=di===2||di===4;
      const activities=isLight
        ?[{type:'mental',id:'m84',title:'Recovery & Reset',duration:'8 min',xp:65},{type:'drill',id:'fit001',title:'Light Conditioning',duration:'15 min',xp:60}]
        :[{type:'drill',id:pathId==='batting'?'b001':pathId==='bowling'?'w001':'f001',title:lv.sampleDrills[di%lv.sampleDrills.length]||'Skill Session',duration:'20 min',xp:lv.xpPerDay*0.4|0},{type:'fitness',id:'wb001',title:'Cricket Fitness',duration:'20 min',xp:lv.xpPerDay*0.3|0},{type:'mental',id:'m50',title:'Mental Training',duration:'8 min',xp:lv.xpPerDay*0.3|0}];
      return { day:di+1,label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][di],isRest:false,activities,totalXP:activities.reduce((s,a)=>s+a.xp,0) };
    })
  }));
}

function generateSmartSchedule(focusArea, trainingDays, intensity, weekMondayStr) {
  const monday = new Date(weekMondayStr+'T00:00:00');
  const restPatterns = { 3:[1,3,5,6], 4:[2,4,6], 5:[3,6], 6:[6], 7:[] };
  const restDays = restPatterns[trainingDays]||[6];
  const sessions=[];
  for(let i=0;i<7;i++){
    const d=new Date(monday); d.setDate(monday.getDate()+i);
    const ds=dateStr(d);
    if(restDays.includes(i)) continue;
    const isHeavy=i%3===0;
    const drillCat=focusArea==='allrounder'?['batting','bowling','fielding'][i%3]:focusArea;
    const drillOptions=DRILLS.filter(dr=>dr.category===drillCat&&dr.skill_level==='intermediate');
    const drillPick=drillOptions[i%Math.max(drillOptions.length,1)]||DRILLS.find(dr=>dr.category===drillCat)||DRILLS[0];
    const mentalOptions=MENTAL_SESSIONS.filter(m=>!m.is_premium);
    const mentalPick=mentalOptions[i%mentalOptions.length]||MENTAL_SESSIONS[0];
    const workoutPick=WORKOUTS.find(w=>w.level==='intermediate'&&w.goal===(isHeavy?'build-muscle':'improve-endurance'))||WORKOUTS[0];
    sessions.push({id:'sch_'+Date.now()+'_'+i+'_a',date:ds,time:'07:00',type:'drill',title:drillPick.title,ref_id:drillPick.id,duration_minutes:drillPick.duration_minutes,xp_value:drillPick.xp_value,status:'pending',notes:'',color:SCHED_TYPES.drill.color});
    if(isHeavy){ sessions.push({id:'sch_'+Date.now()+'_'+i+'_b',date:ds,time:'17:00',type:'fitness',title:workoutPick.name,ref_id:workoutPick.id,duration_minutes:workoutPick.duration_minutes,xp_value:workoutPick.xp_value,status:'pending',notes:'',color:SCHED_TYPES.fitness.color}); }
    sessions.push({id:'sch_'+Date.now()+'_'+i+'_c',date:ds,time:'19:00',type:'mental',title:mentalPick.title,ref_id:mentalPick.id,duration_minutes:Math.floor(mentalPick.duration_seconds/60),xp_value:mentalPick.xp_value,status:'pending',notes:'',color:SCHED_TYPES.mental.color});
  }
  return sessions;
}

// ================================================================
// SHARED UI COMPONENTS
// ================================================================
function Spinner({ cls='' }) {
  return h('div', { className:`flex items-center justify-center py-16 ${cls}` },
    h('div', { className:'w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin' })
  );
}

function LevelBar({ totalXP, compact=false }) {
  const info=getLevelInfo(totalXP||0);
  if(compact) return h('div',{className:'flex items-center gap-2'},
    h('span',{className:'text-xs font-black text-emerald-400 whitespace-nowrap'},`Lv.${info.level}`),
    h('div',{className:'flex-1 h-1.5 rounded-full bg-slate-700/80 overflow-hidden'},
      h('div',{className:'level-bar-fill',style:{width:`${info.pct}%`}})
    )
  );
  return h('div',{className:'space-y-2'},
    h('div',{className:'flex justify-between items-center'},
      h('span',{className:'text-sm font-black text-emerald-400'},`Level ${info.level} — ${info.name}`),
      h('span',{className:'text-xs text-slate-500'},info.next?`${info.xpToNext.toLocaleString()} XP to next`:'MAX LEVEL')
    ),
    h('div',{className:'level-bar-track'},
      h('div',{className:'level-bar-fill',style:{width:`${info.pct}%`}})
    )
  );
}

function XPBadge({ xp }) {
  return h('span',{style:{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',
    borderRadius:5,fontSize:11,fontWeight:700,background:'rgba(22,163,74,0.1)',
    border:'1px solid rgba(22,163,74,0.25)',color:'#4ade80'}},
    h(Icon,{n:'zap',cls:'w-3 h-3'}), `${xp} XP`
  );
}

function PremiumBadge({ label='PRO' }) {
  return h('span',{className:'premium-badge'},label);
}

function StatCard({ label, value, color='text-emerald-400', icon, sub, cls='' }) {
  return h('div',{className:`stat-card ${cls}`, 'data-gsap-stat':''},
    h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
      icon && h(Icon,{n:icon,cls:'w-3.5 h-3.5',style:{color:'#484f58'}}),
      h('span',{style:{fontSize:10,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},label)
    ),
    h('div',{style:{fontSize:22,fontWeight:800,fontVariantNumeric:'tabular-nums',lineHeight:1},className:color.startsWith('text-')?color:'',
      style:color.startsWith('#')?{fontSize:22,fontWeight:800,fontVariantNumeric:'tabular-nums',lineHeight:1,color}:{fontSize:22,fontWeight:800,fontVariantNumeric:'tabular-nums',lineHeight:1}
    },value),
    sub && h('div',{style:{fontSize:11,color:'#484f58',marginTop:4}},sub)
  );
}

function EmptyState({ icon='bat', title, desc, action }) {
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',textAlign:'center'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:icon||'bat',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('h3',{style:{fontSize:15,fontWeight:700,color:'#8b949e',marginBottom:8}},title),
    h('p',{style:{fontSize:13,color:'#484f58',maxWidth:240,lineHeight:1.6,marginBottom:action?24:0}},desc),
    action && h('button',{onClick:action.fn,className:'btn-primary',style:{width:'auto',padding:'10px 24px',fontSize:13}},action.label)
  );
}

function XPChart({ days }) {
  const max=Math.max(...days.map(d=>d.xp),1);
  return h('div',{className:'flex items-end gap-1.5 h-20 w-full'},
    days.map(d=>
      h('div',{key:d.date,className:'flex flex-col items-center gap-1 flex-1'},
        h('div',{
          className:'w-full rounded-t-sm',
          'data-anim':'xp-bar',
          'data-gsap-bar':'',
          style:{height:`${Math.max(3,(d.xp/max)*72)}px`,background:d.xp>0?'linear-gradient(to top,#059669,#34d399)':'rgba(30,41,59,0.6)',borderRadius:'3px 3px 0 0',transformOrigin:'bottom'},
          title:`${d.xp} XP`
        }),
        h('span',{className:'text-xs text-slate-500 font-medium'},d.label)
      )
    )
  );
}

function Heatmap({ days }) {
  return h('div',{className:'grid grid-cols-7 gap-1.5'},
    days.map((d,i)=>
      h('div',{key:d.date,
        className:`heatmap-cell heatmap-${d.level}`,
        'data-gsap-cell':'',
        style:{aspectRatio:'1',borderRadius:'4px'},
        title:`${d.date}: ${d.xp} XP`
      })
    )
  );
}

function SectionLabel({ children }) {
  return h('div', { className:'sc-section-label' }, children);
}

function PageHeader({ title, subtitle, gradient, onBack, actions }) {
  return h('div',{
    'data-gsap-pageheader':'',
    className:'relative overflow-hidden',
    style:{background:gradient||'linear-gradient(135deg,#059669,#047857)',
      paddingTop:'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))',
      paddingBottom:'1.5rem',paddingLeft:'1.25rem',paddingRight:'1.25rem'}
  },
    h('div',{style:{position:'absolute',top:'-30%',right:'-15%',width:'220px',height:'220px',background:'rgba(255,255,255,0.07)',borderRadius:'50%',pointerEvents:'none'}}),
    h('div',{style:{position:'absolute',bottom:'-40%',left:'-10%',width:'160px',height:'160px',background:'rgba(255,255,255,0.05)',borderRadius:'50%',pointerEvents:'none'}}),
    h('div',{className:'relative z-10'},
      h('div',{className:'flex items-start justify-between'},
        h('div',{className:'flex items-center gap-3'},
          onBack && h('button',{onClick:onBack,
            className:'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
            style:{background:'rgba(255,255,255,0.15)'}},
            h(Icon,{n:'arrowL',cls:'w-5 h-5 text-white'})
          ),
          h('div',{},
            h('h1',{className:'text-xl font-black text-white tracking-tight leading-tight'},title),
            subtitle && h('p',{className:'text-sm mt-0.5',style:{color:'rgba(255,255,255,0.7)'}},subtitle)
          )
        ),
        actions && h('div',{className:'flex items-center gap-2'},actions)
      )
    )
  );
}

// ================================================================
// SIDEBAR — with GSAP stagger-in on open (Doc Part 7.2)
// ================================================================
function Sidebar({ open, onClose, currentPage }) {
  const scrollRef = useRef(null);
  const savedScroll = useRef(0);
  const panelRef = useRef(null);
  const { dark, toggle } = useTheme();
  const p = DB.getProgress();
  const info = getLevelInfo(p.total_xp||0);
  const streak = p.current_streak||0;

  const handleClose = useCallback(()=>{
    savedScroll.current = scrollRef.current?.scrollTop||0;
    onClose();
  },[onClose]);

  useEffect(()=>{
    if(open && scrollRef.current){
      requestAnimationFrame(()=>{ if(scrollRef.current) scrollRef.current.scrollTop=savedScroll.current; });
    }
  },[open]);

  // ── GSAP: stagger nav items when sidebar opens ────────────────
  // Children animate in parallel with the CSS slide-in transition.
  // Delay 0.08s so the panel "leads" visually.
  useLayoutEffect(()=>{
    if (!open || !panelRef.current || !SCAnim.ready) return;
    if (SCAnim.reducedMotion) return;
    const ctx = gsap.context(()=>{
      const labels  = panelRef.current.querySelectorAll('.sc-section-label');
      const buttons = panelRef.current.querySelectorAll('.sc-nav-btn');
      gsap.from(labels, { opacity:0, x:-8, duration:0.3, stagger:0.02, delay:0.08, ease:'power2.out' });
      gsap.from(buttons,{ opacity:0, x:-12,duration:0.3, stagger:0.012,delay:0.12, ease:'power2.out' });
    }, panelRef);
    return () => ctx.revert();
  },[open]); // re-fires every open

  function NavBtn({ label, icon, pg, onClick, badge, isNew }) {
    const active = currentPage===pg;
    return h('button',{
      onClick:onClick||(()=>{ nav(pg); handleClose(); }),
      className:`sc-nav-btn${active?' active':''}`,
    },
      h(Icon,{n:icon,cls:'w-4 h-4 flex-shrink-0',style:{color:active?'#4ade80':'#484f58'}}),
      h('span',{style:{fontSize:'13px',fontWeight:600,flex:1,textAlign:'left',color:active?'#e6edf3':'#8b949e'}},label),
      badge && h('span',{className:'premium-badge'},badge),
      isNew && h('span',{style:{fontSize:'10px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',
        background:'rgba(22,163,74,0.12)',color:'#4ade80',border:'1px solid rgba(22,163,74,0.25)',
        padding:'2px 6px',borderRadius:'4px',flexShrink:0}},'NEW')
    );
  }

  const handleSmartStart = () => {
    handleClose();
    if(currentPage!=='Home'){ nav('Home'); setTimeout(()=>{ const el=document.getElementById('smart-start'); if(el) el.scrollIntoView({behavior:'smooth'}); },200); }
    else { const el=document.getElementById('smart-start'); if(el) el.scrollIntoView({behavior:'smooth'}); }
  };

  return h(Fragment,null,
    open && h('div',{className:'fixed inset-0 z-40',
      style:{background:'rgba(0,0,0,0.7)',backdropFilter:'blur(4px)'},onClick:handleClose}),
    h('div',{
      ref:panelRef,
      className:'fixed inset-y-0 left-0 z-50 w-72 flex flex-col sidebar-panel',
      style:{transform:open?'translateX(0)':'translateX(-100%)',
        transition:'transform .22s cubic-bezier(.16,1,.3,1)',willChange:'transform'}
    },
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'16px 20px',borderBottom:'1px solid rgba(48,54,61,0.9)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10}},
          h('div',{style:{width:36,height:36,borderRadius:8,background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
            h(Icon,{n:'bat',cls:'w-5 h-5 text-white'})),
          h('div',{},
            h('div',{style:{fontSize:14,fontWeight:800,color:'#e6edf3',letterSpacing:'-0.01em'}},'SMARTCRICK'),
            h('div',{style:{fontSize:11,fontWeight:600,color:'#4ade80',marginTop:1}},`Level ${info.level} · ${info.name}`)
          )
        ),
        h('button',{onClick:handleClose,
          style:{width:30,height:30,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',
            background:'rgba(48,54,61,0.6)',border:'1px solid rgba(48,54,61,0.9)',cursor:'pointer',color:'#8b949e'}},
          h(Icon,{n:'x',cls:'w-4 h-4'}))
      ),
      h('div',{style:{padding:'12px 20px',borderBottom:'1px solid rgba(48,54,61,0.6)',background:'rgba(22,27,34,0.5)'}},
        h(LevelBar,{totalXP:p.total_xp||0}),
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}},
          h('span',{style:{fontSize:11,color:'#484f58'}},'XP to next level'),
          streak>0 && h('div',{style:{display:'flex',alignItems:'center',gap:4}},
            h(Icon,{n:'flame',cls:'w-3.5 h-3.5',style:{color:'#fb923c'}}),
            h('span',{style:{fontSize:11,fontWeight:700,color:'#fb923c'}},`${streak}d streak`)
          )
        )
      ),
      h('div',{ref:scrollRef,className:'flex-1 sidebar-scroll',style:{padding:'6px 8px'}},
        h(SectionLabel,{},'Premium'),
        h(NavBtn,{label:'AI Head Coach',icon:'cpu',pg:'AICoach',badge:'PRO'}),
        h(NavBtn,{label:'90-Day Program',icon:'diamond',pg:'NinetyDay',badge:'PRO'}),
        h(SectionLabel,{},'Training'),
        h(NavBtn,{label:'Home',icon:'home',pg:'Home'}),
        h(NavBtn,{label:'Smart Start',icon:'zap',onClick:handleSmartStart}),
        h(NavBtn,{label:'Cricket Drills',icon:'bat',pg:'Drills'}),
        h(NavBtn,{label:'Mental Training',icon:'brain',pg:'Mental'}),
        h(NavBtn,{label:'30-Day Challenge',icon:'target',pg:'ThirtyDay'}),
        h(NavBtn,{label:'Fitness Builder',icon:'dumbbell',pg:'Fitness'}),
        h(NavBtn,{label:'AI Workout',icon:'sparkles',pg:'AIWorkout'}),
        h(NavBtn,{label:'Timer',icon:'timer',pg:'Timer'}),
        h(SectionLabel,{},'Performance'),
        h(NavBtn,{label:'My Progress',icon:'barChart',pg:'Progress'}),
        h(NavBtn,{label:'Skill Paths',icon:'layers',pg:'SkillPaths'}),
        h(NavBtn,{label:'Leaderboard',icon:'trophy',pg:'Leaderboard'}),
        h(NavBtn,{label:'Goals',icon:'target',pg:'Goals'}),
        h(NavBtn,{label:'My Profile',icon:'user',pg:'Profile'}),
        h(SectionLabel,{},'Planning'),
        h(NavBtn,{label:'Training Schedule',icon:'calendar',pg:'Schedule',isNew:true}),
        h(SectionLabel,{},'AI & Analytics'),
        h(NavBtn,{label:'Video Analysis',  icon:'video',     pg:'VideoAnalysis', isNew:true}),
        h(NavBtn,{label:'Performance',     icon:'chartLine', pg:'Performance',   isNew:true}),
        h(NavBtn,{label:'Match Logger',    icon:'list',      pg:'MatchLogger',   isNew:true}),
        h(NavBtn,{label:'Reaction Drill',  icon:'zap',       pg:'ReactionDrill', isNew:true}),
        h(SectionLabel,{},'Cricket Tools'),
        h(NavBtn,{label:'Match Tracker',icon:'list',pg:'MatchTracker'}),
        h(NavBtn,{label:'MiniMatch IQ',icon:'puzzle',pg:'MiniMatch'}),
        h(NavBtn,{label:'Why Did I Get Out?',icon:'helpCircle',pg:'GetOut'}),
        h(NavBtn,{label:'Quizzes',icon:'book',pg:'Quizzes'}),
        h(SectionLabel,{},'Account'),
        h(NavBtn,{label:'Settings',icon:'settings',pg:'Settings'}),
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',
          margin:'8px 8px 4px',padding:'10px 12px',borderRadius:8,
          background:'rgba(22,27,34,0.6)',border:'1px solid rgba(48,54,61,0.9)'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:dark?'moon':'sun',cls:'w-4 h-4',style:{color:'#484f58'}}),
            h('span',{style:{fontSize:13,fontWeight:600,color:'#8b949e'}},'Dark Mode')
          ),
          h('button',{onClick:toggle,
            style:{position:'relative',width:40,height:22,borderRadius:11,
              background:dark?'#16a34a':'rgba(48,54,61,0.9)',border:'none',cursor:'pointer',transition:'background .2s',flexShrink:0}},
            h('div',{style:{position:'absolute',top:3,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'transform .2s',
              left:3,transform:dark?'translateX(18px)':'translateX(0)'}})
          )
        ),
        h('div',{style:{height:24}})
      )
    )
  );
}

// ================================================================
// BOTTOM NAV — with GSAP sliding indicator (Doc Part 7.3)
// ================================================================
function BottomNav({ page }) {
  const navRef = useRef(null);
  const indicatorRef = useRef(null);
  const items=[
    {n:'home',label:'Home',pg:'Home'},
    {n:'bat',label:'Drills',pg:'Drills'},
    {n:'brain',label:'Mental',pg:'Mental'},
    {n:'dumbbell',label:'Fitness',pg:'Fitness'},
    {n:'calendar',label:'Schedule',pg:'Schedule'},
  ];
  const activeIdx = items.findIndex(i => i.pg === page);

  // ── GSAP: slide indicator to active tab ───────────────────────
  useLayoutEffect(()=>{
    if (!navRef.current || !indicatorRef.current) return;
    const buttons = navRef.current.querySelectorAll('button[data-tab]');
    if (activeIdx < 0 || !buttons[activeIdx]) {
      indicatorRef.current.style.opacity = '0';
      return;
    }
    const btn = buttons[activeIdx];
    const navRect = navRef.current.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const targetLeft = btnRect.left - navRect.left + (btnRect.width - 20) / 2;
    if (SCAnim.ready && !SCAnim.reducedMotion) {
      gsap.to(indicatorRef.current, { x:targetLeft, opacity:1, duration:0.3, ease:'power3.out' });
    } else {
      indicatorRef.current.style.transform = `translateX(${targetLeft}px)`;
      indicatorRef.current.style.opacity = '1';
    }
  },[activeIdx]);

  return h('nav',{
    ref:navRef,
    className:'bottom-nav',
    style:{paddingBottom:'max(0px,env(safe-area-inset-bottom))'}
  },
    // Sliding indicator pill (GSAP controls translateX)
    h('div',{ref:indicatorRef,className:'bottom-nav-indicator',style:{opacity:0}}),
    h('div',{style:{display:'flex',alignItems:'center',height:56}},
      items.map((item,idx)=>{
        const active=page===item.pg;
        return h('button',{key:item.pg,
          onClick:()=>nav(item.pg),
          'data-tab':String(idx),
          style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',gap:3,height:'100%',position:'relative',
            background:'transparent',border:'none',cursor:'pointer',padding:0}
        },
          h(Icon,{n:item.n,cls:'w-5 h-5',style:{color:active?'#4ade80':'#374151',transition:'color 0.12s'}}),
          h('span',{style:{fontSize:10,fontWeight:active?700:500,letterSpacing:'0.02em',
            color:active?'#4ade80':'#374151',transition:'color 0.12s'}},item.label)
        );
      })
    )
  );
}

// ================================================================
// HOME PAGE — full GSAP entrance timeline (Doc Part 7.1)
// + sc_xp_animate listener for reactive bar/count animations
// ================================================================
function HomePage() {
  const rootRef  = useRef(null);
  const xpNumRef = useRef(null);   // "X,XXX XP" text element
  const barRef   = useRef(null);   // level bar fill element
  const levelCardRef = useRef(null); // whole level card (for level-up flash)

  const [progress, setProgress] = useState(()=>DB.getProgress());
  const [xpDays, setXpDays]     = useState(()=>DB.getXPLast7Days());
  const [checkedIn, setCheckedIn]= useState(()=>{
    const p=DB.getProgress();
    return p.last_checkin_date===new Date().toISOString().slice(0,10);
  });

  const refresh = useCallback(()=>{
    setProgress(DB.getProgress());
    setXpDays(DB.getXPLast7Days());
    setCheckedIn(DB.getProgress().last_checkin_date===new Date().toISOString().slice(0,10));
  },[]);

  useEffect(()=>{
    window.addEventListener('sc_update',refresh);
    window.addEventListener('focus',refresh);
    return()=>{window.removeEventListener('sc_update',refresh);window.removeEventListener('focus',refresh);};
  },[refresh]);

  // ── GSAP entrance timeline ────────────────────────────────────
  // Mirrors the reading scan path: greeting → stats → chart → quick → tasks
  useLayoutEffect(()=>{
    if (!rootRef.current || typeof gsap === 'undefined') return;
    if (SCAnim.reducedMotion) return;

    const ctx = gsap.context(()=>{
      const p = DB.getProgress();
      const info = getLevelInfo(p.total_xp||0);
      const tl = gsap.timeline({ defaults: { ease:'power2.out' } });

      // 0.00s — greeting & streak badge
      tl.from('[data-anim="greeting"]', { opacity:0, y:-8, duration:0.4 }, 0)
        .from('[data-anim="streak"]',   { opacity:0, scale:0.85, duration:0.3, ease:'back.out(2)' }, 0.15);

      // 0.20s — level card fades in
      tl.from('[data-anim="level-card"]', { opacity:0, y:14, duration:0.45 }, 0.2);

      // 0.35s — XP count-up from 0 to current
      if (xpNumRef.current) {
        const obj = { val: 0 };
        tl.to(obj, {
          val:      p.total_xp || 0,
          duration: 0.9,
          onUpdate: () => {
            if (xpNumRef.current)
              xpNumRef.current.textContent = Math.round(obj.val).toLocaleString() + ' XP';
          },
        }, 0.35);
      }

      // 0.40s — bar fills from 0% to current pct
      if (barRef.current) {
        tl.fromTo(barRef.current,
          { width: '0%' },
          { width: `${info.pct}%`, duration:1.1, ease:'power3.out' },
          0.4
        );
      }

      // 0.55s — 4 stat boxes stagger in
      tl.from('[data-anim="stat"]', { opacity:0, y:10, duration:0.35, stagger:0.05 }, 0.55);

      // 0.70s — 7-day chart bars rise from bottom
      const bars = rootRef.current.querySelectorAll('[data-anim="xp-bar"]');
      if (bars.length) {
        tl.from(bars, { scaleY:0, transformOrigin:'bottom', duration:0.5, stagger:0.04, ease:'power2.out' }, 0.7);
      }

      // 0.85s — Quick Train tiles pop with back ease
      tl.from('[data-anim="quick-tile"]', {
        opacity:0, scale:0.85, duration:0.3, stagger:0.05, ease:'back.out(1.6)'
      }, 0.85);

      // 1.00s — daily check-in card
      tl.from('[data-anim="checkin"]', { opacity:0, y:12, duration:0.35 }, 1.0);

      // 1.10s — Smart Start cards slide in from right
      tl.from('[data-anim="smart-start-card"]', { opacity:0, x:18, duration:0.4, stagger:0.07 }, 1.1);

      // ScrollTrigger: Explore tiles below the fold
      const exploreSection = rootRef.current.querySelector('[data-anim="explore"]');
      if (exploreSection && typeof ScrollTrigger !== 'undefined') {
        gsap.from(exploreSection.querySelectorAll('[data-anim="explore-tile"]'), {
          opacity:0, y:14, duration:0.4, stagger:0.05, ease:'power2.out',
          scrollTrigger:{ trigger:exploreSection, start:'top 88%', once:true }
        });
      }

      // Desktop hover micro-interactions on Quick Train tiles
      rootRef.current.querySelectorAll('[data-anim="quick-tile"]').forEach(el => {
        SCAnim.addHover(el, { scale:1.04, y:-2, duration:0.18 });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []); // run once on mount

  // ── sc_xp_animate: reactive bar/count animation on XP award ──
  useEffect(()=>{
    function onXPAnimate(e) {
      const { oldXP, newXP, leveledUp, levelName } = e.detail;
      const oldInfo = getLevelInfo(oldXP);
      const newInfo = getLevelInfo(newXP);
      // Count up the XP number
      if (xpNumRef.current) {
        SCAnim.countUp(xpNumRef.current, oldXP, newXP, {
          duration: 1.0,
          format: v => v.toLocaleString() + ' XP',
        });
      }
      // Fill the level bar
      if (barRef.current) {
        if (leveledUp) {
          // Cross-level: fill to 100%, snap, then fill new pct
          if (SCAnim.ready) {
            gsap.timeline()
              .to(barRef.current, { width:'100%', duration:0.4, ease:'power2.out' })
              .set(barRef.current, { width:'0%' })
              .to(barRef.current, { width:`${newInfo.pct}%`, duration:0.6, ease:'power2.out' });
          }
        } else {
          SCAnim.fillBar(barRef.current, oldInfo.pct, newInfo.pct, { duration:0.9 });
        }
      }
      // Level-up celebration
      if (leveledUp && levelCardRef.current) {
        SCAnim.levelUpCelebration(levelCardRef.current, levelName);
      }
      // Refresh state so React re-renders the level name text
      setProgress(DB.getProgress());
    }
    window.addEventListener('sc_xp_animate', onXPAnimate);
    return () => window.removeEventListener('sc_xp_animate', onXPAnimate);
  }, []);

  const info    = getLevelInfo(progress.total_xp||0);
  const user    = DB.getUser();
  const name    = user.name?(user.name.split(' ')[0]):'Cricketer';
  const hh      = new Date().getHours();
  const greeting= hh<12?'Good morning':hh<17?'Good afternoon':'Good evening';
  const streak  = progress.current_streak||0;

  const handleCheckIn = () => {
    if(checkedIn) return;
    const today=new Date().toISOString().slice(0,10);
    if(DB.getProgress().last_checkin_date===today){setCheckedIn(true);return;}
    awardXP(15,0,'checkin');setCheckedIn(true);
  };

  const done       = progress.completed_drills||[];
  const doneMental = progress.completed_mental||[];
  const drillPick  = DRILLS.find(d=>!done.includes(d.id)&&d.category==='batting')||DRILLS[0];
  const mentalPick = MENTAL_SESSIONS.find(m=>!doneMental.includes(m.id)&&!m.is_premium)||MENTAL_SESSIONS[0];
  const workoutPick= WORKOUTS.find(w=>w.level==='beginner')||WORKOUTS[0];

  const quickActions=[
    {icon:'bat',    label:'Drills',  pg:'Drills',  color:'#2563eb',bg:'rgba(37,99,235,0.12)', border:'rgba(37,99,235,0.25)'},
    {icon:'brain',  label:'Mental',  pg:'Mental',  color:'#7c3aed',bg:'rgba(124,58,237,0.12)',border:'rgba(124,58,237,0.25)'},
    {icon:'dumbbell',label:'Fitness',pg:'Fitness', color:'#ea580c',bg:'rgba(234,88,12,0.12)', border:'rgba(234,88,12,0.25)'},
    {icon:'timer',  label:'Timer',   pg:'Timer',   color:'#0d9488',bg:'rgba(13,148,136,0.12)',border:'rgba(13,148,136,0.25)'},
  ];
  const exploreTiles=[
    {icon:'layers', label:'Skill Paths',sub:'Structured programs',pg:'SkillPaths'},
    {icon:'calendar',label:'Schedule',  sub:'Plan your week',     pg:'Schedule'},
    {icon:'barChart',label:'Progress',  sub:'Stats & badges',     pg:'Progress'},
    {icon:'target', label:'30-Day',     sub:'Daily challenge',    pg:'ThirtyDay'},
    {icon:'trophy', label:'Leaderboard',sub:'Your ranking',       pg:'Leaderboard'},
    {icon:'book',   label:'Quizzes',    sub:'Cricket knowledge',  pg:'Quizzes'},
  ];

  const Stat = ({val,label,color}) => h('div',{
    'data-anim':'stat',
    style:{textAlign:'center',padding:'10px 4px',borderRadius:8,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}
  },
    h('div',{style:{fontSize:18,fontWeight:800,color,lineHeight:1,fontVariantNumeric:'tabular-nums'}},val),
    h('div',{style:{fontSize:10,fontWeight:600,color:'#484f58',marginTop:3,textTransform:'uppercase',letterSpacing:'0.06em'}},label)
  );

  return h('div',{ref:rootRef,style:{paddingBottom:'calc(5rem + env(safe-area-inset-bottom, 0px))',background:'#0d1117',minHeight:'100dvh'}},
    // ── Hero ───────────────────────────────────────────────────
    h('div',{style:{background:'linear-gradient(160deg,#0a1628 0%,#0d1117 60%)',
      padding:'calc(3.75rem + max(0.75rem,env(safe-area-inset-top))) 20px 24px',
      borderBottom:'1px solid rgba(48,54,61,0.9)',position:'relative',overflow:'hidden'}},
      h('div',{style:{position:'absolute',top:'-60%',right:'-5%',width:280,height:280,
        background:'radial-gradient(circle,rgba(22,163,74,0.07),transparent 70%)',borderRadius:'50%',pointerEvents:'none'}}),
      // Greeting row
      h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}},
        h('div',{'data-anim':'greeting'},
          h('p',{style:{fontSize:12,fontWeight:600,color:'#16a34a',marginBottom:4,letterSpacing:'0.04em',textTransform:'uppercase'}},greeting),
          h('h1',{style:{fontSize:28,fontWeight:800,color:'#e6edf3',margin:0,letterSpacing:'-0.02em',lineHeight:1.1}},name),
          h('p',{style:{fontSize:13,color:'#484f58',marginTop:6}},'Train. Measure. Improve.')
        ),
        streak>0 && h('div',{'data-anim':'streak',className:'streak-badge',style:{flexShrink:0}},
          h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}),streak,' day streak')
      ),
      // Level card
      h('div',{ref:levelCardRef,'data-anim':'level-card',
        style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:16,marginBottom:16}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
          h('div',{style:{display:'flex',alignItems:'center',gap:10}},
            h('div',{style:{width:32,height:32,borderRadius:6,background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.2)',display:'flex',alignItems:'center',justifyContent:'center'}},
              h(Icon,{n:'crown',cls:'w-4 h-4',style:{color:'#16a34a'}})),
            h('div',{},
              h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},`Level ${info.level}`),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:1}},info.name)
            )
          ),
          h('div',{style:{textAlign:'right'}},
            h('div',{ref:xpNumRef,style:{fontSize:15,fontWeight:800,color:'#e6edf3',fontVariantNumeric:'tabular-nums'}},
              (progress.total_xp||0).toLocaleString()+' XP'),
            info.next && h('div',{style:{fontSize:11,color:'#484f58',marginTop:1}},
              `${info.xpToNext.toLocaleString()} to Level ${info.level+1}`)
          )
        ),
        h('div',{className:'level-bar-track'},
          h('div',{ref:barRef,className:'level-bar-fill',style:{width:`${info.pct}%`}})
        )
      ),
      // 4-stat row
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}},
        h(Stat,{val:progress.drills_done||0,  label:'Drills', color:'#3b82f6'}),
        h(Stat,{val:progress.mental_done||0,  label:'Mental', color:'#8b5cf6'}),
        h(Stat,{val:progress.practice_minutes||0,label:'Mins',color:'#f97316'}),
        h(Stat,{val:(progress.total_xp||0).toLocaleString(),label:'XP',color:'#16a34a'})
      ),
      // 7-day XP chart
      h('div',{style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:'14px 16px'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          h('div',{style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:'chartLine',cls:'w-3.5 h-3.5',style:{color:'#484f58'}}),
            h('span',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},'7-Day XP')
          ),
          h('span',{style:{fontSize:12,fontWeight:700,color:'#16a34a'}},`${xpDays.reduce((s,d)=>s+d.xp,0)} this week`)
        ),
        h(XPChart,{days:xpDays})
      )
    ),
    // ── Quick Train ─────────────────────────────────────────────
    h('div',{style:{padding:'20px 20px 0'}},
      h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em'}},'Quick Train'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}},
        quickActions.map(a=>
          h('button',{key:a.pg,onClick:()=>nav(a.pg),
            'data-anim':'quick-tile',
            className:'quick-train-tile',
            style:{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'14px 8px',
              borderRadius:10,border:`1px solid ${a.border}`,background:a.bg,cursor:'pointer',transition:'all 0.12s'}
          },
            h('div',{style:{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.3)'}},
              h(Icon,{n:a.icon,cls:'w-5 h-5',style:{color:a.color}})
            ),
            h('span',{style:{fontSize:11,fontWeight:600,color:'#8b949e'}},a.label)
          )
        )
      )
    ),
    // ── Daily Check-In ─────────────────────────────────────────
    h('div',{style:{padding:'16px 20px 0'}},
      h('button',{onClick:handleCheckIn,disabled:checkedIn,
        'data-anim':'checkin',
        style:{width:'100%',display:'flex',alignItems:'center',gap:14,padding:14,
          borderRadius:10,border:checkedIn?'1px solid rgba(22,163,74,0.25)':'1px solid rgba(48,54,61,0.9)',
          background:checkedIn?'rgba(22,163,74,0.06)':'rgba(22,27,34,0.9)',
          cursor:checkedIn?'default':'pointer',textAlign:'left',transition:'all 0.12s'}
      },
        h('div',{style:{width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
          background:checkedIn?'rgba(22,163,74,0.15)':'rgba(48,54,61,0.6)'}},
          h(Icon,{n:checkedIn?'circleCheck':'zap',cls:'w-5 h-5',style:{color:checkedIn?'#16a34a':'#8b949e'}})
        ),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:13,fontWeight:700,color:checkedIn?'#4ade80':'#e6edf3'}},checkedIn?'Checked in today':'Daily Check-In'),
          h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},checkedIn?'15 XP earned. Come back tomorrow.':'Tap to claim 15 XP.')
        ),
        !checkedIn && h('span',{style:{fontSize:11,fontWeight:700,color:'#16a34a',background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.2)',padding:'4px 8px',borderRadius:6,flexShrink:0}},'+15 XP')
      )
    ),
    // ── Smart Start ────────────────────────────────────────────
    h('div',{id:'smart-start',style:{padding:'20px 20px 0'}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}},
        h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:0,textTransform:'uppercase',letterSpacing:'0.08em'}},"Today's Focus"),
        h('span',{style:{fontSize:11,color:'#484f58'}},'AI-selected')
      ),
      h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
        [{item:drillPick, type:'drill',  color:'#2563eb',icon:'bat',    dest:()=>nav('DrillDetail',{id:drillPick.id})},
         {item:mentalPick,type:'mental', color:'#7c3aed',icon:'brain',  dest:()=>nav('MentalPlayer',{id:mentalPick.id})},
         {item:workoutPick,type:'fitness',color:'#ea580c',icon:'dumbbell',dest:()=>nav('WorkoutDetail',{id:workoutPick.id})}
        ].map(({item,type,color,icon,dest})=>
          h('button',{key:type,onClick:dest,
            'data-anim':'smart-start-card',
            style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
              border:`1px solid ${color}33`,background:`${color}0d`,cursor:'pointer',textAlign:'left',transition:'all 0.12s'}
          },
            h('div',{style:{width:40,height:40,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:`${color}26`}},
              h(Icon,{n:icon,cls:'w-5 h-5',style:{color}})
            ),
            h('div',{style:{flex:1,minWidth:0}},
              h('div',{style:{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:2}},
                type==='drill'?'Cricket Drill':type==='mental'?'Mental Session':'Fitness'),
              h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},
                item.title||item.name),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},
                (type==='mental'?Math.floor(item.duration_seconds/60):item.duration_minutes)+' min · '+(item.xp_value)+' XP')
            ),
            h(Icon,{n:'chevR',cls:'w-4 h-4 flex-shrink-0',style:{color:'#374151'}})
          )
        )
      )
    ),
    // ── Explore ─────────────────────────────────────────────────
    h('div',{'data-anim':'explore',style:{padding:'20px 20px 0'}},
      h('h2',{style:{fontSize:13,fontWeight:700,color:'#8b949e',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'0.08em'}},'Explore'),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}},
        exploreTiles.map(t=>
          h('button',{key:t.pg,onClick:()=>nav(t.pg),
            'data-anim':'explore-tile',
            style:{display:'flex',alignItems:'center',gap:12,padding:14,borderRadius:10,
              border:'1px solid rgba(48,54,61,0.9)',background:'rgba(22,27,34,0.9)',
              cursor:'pointer',textAlign:'left',transition:'all 0.12s'}
          },
            h('div',{style:{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(48,54,61,0.6)'}},
              h(Icon,{n:t.icon,cls:'w-4 h-4',style:{color:'#8b949e'}})
            ),
            h('div',{style:{minWidth:0}},
              h('div',{style:{fontSize:13,fontWeight:600,color:'#e6edf3',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},t.label),
              h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},t.sub)
            )
          )
        )
      )
    )
  );
}

// ================================================================
// DRILLS PAGE — stagger cards on category/search change
// ================================================================
const DRILL_CATS=[
  {id:'batting',label:'Batting',icon:'bat',from:'#1d4ed8',to:'#4338ca'},
  {id:'bowling',label:'Bowling',icon:'ball',from:'#dc2626',to:'#ea580c'},
  {id:'fielding',label:'Fielding',icon:'navigation',from:'#059669',to:'#0d9488'},
  {id:'wicketkeeping',label:'Keeping',icon:'glove',from:'#0d9488',to:'#0891b2'},
  {id:'fitness',label:'Fitness',icon:'dumbbell',from:'#c2410c',to:'#d97706'},
  {id:'mental',label:'Mental',icon:'brain',from:'#6d28d9',to:'#4f46e5'},
];
const LVL_COLOR={
  beginner:{bg:'rgba(34,197,94,0.12)',border:'rgba(34,197,94,0.3)',color:'#4ade80',label:'Beginner'},
  intermediate:{bg:'rgba(59,130,246,0.12)',border:'rgba(59,130,246,0.3)',color:'#60a5fa',label:'Intermediate'},
  advanced:{bg:'rgba(249,115,22,0.12)',border:'rgba(249,115,22,0.3)',color:'#fb923c',label:'Advanced'}
};

function DrillsPage(){
  const [cat,setCat]=useState('batting');
  const [search,setSearch]=useState('');
  const [progress,setProgress]=useState(()=>DB.getProgress());
  const listRef=useRef(null);
  const rootRef=useRef(null);

  useEffect(()=>{const r=()=>setProgress(DB.getProgress());window.addEventListener('sc_update',r);return()=>window.removeEventListener('sc_update',r);},[]);

  // Re-stagger cards whenever category or search changes
  useLayoutEffect(()=>{
    if(!listRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const cards=listRef.current.querySelectorAll('[data-drill-card]');
      if(cards.length) SCAnim.staggerCards(cards,{y:12,duration:0.35,stagger:0.04});
    },listRef);
    return()=>ctx.revert();
  },[cat,search]);

  const completed=progress.completed_drills||[];
  const catDef=DRILL_CATS.find(c=>c.id===cat);
  const filtered=DRILLS.filter(d=>d.category===cat&&(search===''||d.title.toLowerCase().includes(search.toLowerCase())));

  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Cricket Drills',subtitle:DRILLS.length+' professional drills',gradient:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')'}),
    h('div',{style:{display:'flex',gap:8,padding:'12px 16px',overflowX:'auto',scrollbarWidth:'none'}},
      DRILL_CATS.map(c=>{
        const activeCat=cat===c.id;
        const catStyle=activeCat?{background:'linear-gradient(135deg,'+c.from+','+c.to+')',color:'#fff',border:'none'}:{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'};
        return h('button',{key:c.id,onClick:()=>setCat(c.id),style:Object.assign({display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:10,fontSize:13,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,cursor:'pointer',transition:'all 0.12s'},catStyle)},
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5 flex-shrink-0',style:{color:activeCat?'#fff':'#484f58'}}),c.label);
      })
    ),
    h('div',{style:{padding:'0 16px 12px'}},
      h('div',{style:{position:'relative'}},
        h(Icon,{n:'search',cls:'w-4 h-4',style:{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search drills...',value:search,onChange:e=>setSearch(e.target.value),style:{width:'100%',paddingLeft:36,paddingRight:16,paddingTop:10,paddingBottom:10,borderRadius:10,fontSize:13,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3',outline:'none',boxSizing:'border-box'}})
      )
    ),
    h('div',{ref:listRef,style:{padding:'0 16px',display:'flex',flexDirection:'column',gap:10}},
      filtered.length===0?h(EmptyState,{icon:catDef?catDef.icon:'bat',title:'No drills found',desc:'Try a different search term'}):
      filtered.map(d=>{
        const lvl=LVL_COLOR[d.skill_level]||LVL_COLOR.beginner;
        const isDone=completed.includes(d.id);
        return h('button',{key:d.id,'data-drill-card':'',onClick:()=>nav('DrillDetail',{id:d.id}),style:{width:'100%',textAlign:'left',padding:16,borderRadius:10,border:'1px solid '+(isDone?'rgba(22,163,74,0.3)':'rgba(48,54,61,0.9)'),background:'rgba(22,27,34,0.9)',cursor:'pointer',transition:'all 0.12s'}},
          h('div',{style:{display:'flex',alignItems:'flex-start',gap:12}},
            h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative',background:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')'}},
              h(Icon,{n:catDef?catDef.icon:'bat',cls:'w-5 h-5 text-white'}),
              isDone&&h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},h(Icon,{n:'check',cls:'w-3 h-3 text-white'}))
            ),
            h('div',{style:{flex:1,minWidth:0}},
              h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}},
                h('h3',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',lineHeight:1.3,margin:0}},d.title),
                d.is_premium&&h(PremiumBadge)
              ),
              h('p',{style:{fontSize:11,color:'#484f58',margin:'4px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},d.description),
              h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:8}},
                h('span',{style:{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:lvl.bg,border:'1px solid '+lvl.border,color:lvl.color,textTransform:'uppercase'}},lvl.label),
                h('span',{style:{fontSize:11,color:'#484f58'}},d.duration_minutes+' min'),
                h(XPBadge,{xp:d.xp_value})
              )
            )
          )
        );
      })
    )
  );
}

// ================================================================
// DRILL DETAIL PAGE — entrance timeline + CTA pulse + success screen
// ================================================================
function DrillDetailPage({params}){
  const drill=DRILLS.find(d=>d.id===(params&&params.id));
  const [done,setDone]=useState(false);
  const completing=useRef(false);
  const rootRef=useRef(null);
  const successRef=useRef(null);

  // Entrance animation
  useLayoutEffect(()=>{
    if(done||!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-anim="video"]',     {opacity:0,scale:0.95,duration:0.45},0)
        .from('[data-anim="description"]',{opacity:0,y:14,duration:0.4},0.1)
        .from('[data-anim="step-card"]',  {opacity:0,x:-14,duration:0.35,stagger:0.06},0.25)
        .from('[data-anim="tip-card"]',   {opacity:0,y:14,duration:0.4},'+=0.05')
        .from('[data-anim="target-card"]',{opacity:0,y:14,duration:0.4},'-=0.2')
        .from('[data-anim="cta-button"]', {opacity:0,y:18,duration:0.4},'-=0.2');
      // Continuous subtle pulse on CTA to invite tap
      const ctaEl=rootRef.current.querySelector('[data-anim="cta-button"]');
      if(ctaEl){
        gsap.to(ctaEl,{scale:1.02,duration:1.4,ease:'sine.inOut',repeat:-1,yoyo:true,delay:1.5});
      }
    },rootRef);
    return()=>ctx.revert();
  },[done,params&&params.id]);

  // Completion screen entrance
  useLayoutEffect(()=>{
    if(!done||!successRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-success="icon"]',   {scale:0,opacity:0,duration:0.5,ease:'back.out(2)'},0)
        .from('[data-success="title"]',  {opacity:0,y:16,duration:0.4},0.15)
        .from('[data-success="subtitle"]',{opacity:0,y:12,duration:0.35},0.25)
        .from('[data-success="badge"]',  {opacity:0,scale:0.7,duration:0.4,ease:'back.out(1.8)'},0.35)
        .from('[data-success="actions"] > *',{opacity:0,y:12,duration:0.35,stagger:0.08},0.5);
    },successRef);
    return()=>ctx.revert();
  },[done]);

  if(!drill) return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'2rem',textAlign:'center'}},
    h('p',{style:{color:'#8b949e',fontWeight:700,marginBottom:16}},'Drill not found'),
    h('button',{onClick:()=>nav('Drills'),style:{padding:'10px 24px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Back to Drills')
  );
  const catDef=DRILL_CATS.find(c=>c.id===drill.category);
  const complete=()=>{
    if(completing.current)return;completing.current=true;
    awardXP(drill.xp_value,drill.duration_minutes,'drill','drill',drill.id);
    fireConfetti();setDone(true);
  };

  if(done) return h('div',{ref:successRef,style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'2rem 1.25rem',minHeight:'100vh'}},
    h('div',{'data-success':'icon',style:{width:64,height:64,borderRadius:16,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},h(Icon,{n:'circleCheck',cls:'w-8 h-8',style:{color:'#16a34a'}})),
    h('h2',{'data-success':'title',style:{fontSize:'1.5rem',fontWeight:800,color:'#fff',marginBottom:8}},'Drill Complete!'),
    h('p',{'data-success':'subtitle',style:{color:'#94a3b8',marginBottom:12}},drill.title),
    h('div',{'data-success':'badge'},h(XPBadge,{xp:drill.xp_value})),
    h('div',{'data-success':'actions',style:{marginTop:24,display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:280}},
      h('button',{onClick:()=>nav('Drills'),style:{padding:'12px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'More Drills'),
      h('button',{onClick:()=>{setDone(false);completing.current=false;},style:{padding:'12px',background:'rgba(30,41,59,0.6)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.5)',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Do Again')
    )
  );

  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:drill.title,subtitle:drill.duration_minutes+' min \u00b7 '+drill.xp_value+' XP',gradient:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')',onBack:()=>nav('Drills')}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}},
      drill.video_id&&h('div',{'data-anim':'video'},
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:8}},'Video Tutorial'),
        h('div',{style:{position:'relative',aspectRatio:'16/9',background:'#0f172a',borderRadius:12,overflow:'hidden'}},
          h('iframe',{src:'https://www.youtube.com/embed/'+drill.video_id+'?modestbranding=1&rel=0&playsinline=1',title:drill.title+' tutorial',allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',allowFullScreen:true,loading:'lazy',style:{position:'absolute',inset:0,width:'100%',height:'100%',border:0}})
        )
      ),
      h('div',{'data-anim':'description',style:{padding:16,borderRadius:12,background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('p',{style:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,margin:0}},drill.description)
      ),
      h('div',null,
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},drill.steps.length+' Steps'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          drill.steps.map((s,i)=>h('div',{key:i,'data-anim':'step-card',style:{display:'flex',alignItems:'flex-start',gap:12,padding:12,borderRadius:10,background:'rgba(15,23,42,0.5)',border:'1px solid rgba(51,65,85,0.4)'}},
            h('div',{style:{width:24,height:24,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:'#fff',flexShrink:0,marginTop:1,background:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')'}},i+1),
            h('p',{style:{fontSize:13,color:'#cbd5e1',lineHeight:1.6,flex:1,margin:0}},s)
          ))
        )
      ),
      drill.tips&&h('div',{'data-anim':'tip-card',style:{display:'flex',alignItems:'flex-start',gap:12,padding:16,borderRadius:12,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)'}},
        h(Icon,{n:'sparkles',cls:'w-4 h-4 flex-shrink-0',style:{color:'#16a34a'}}),
        h('div',null,
          h('p',{style:{fontSize:11,fontWeight:800,color:'#4ade80',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}},'Coach Tip'),
          h('p',{style:{fontSize:13,color:'#6ee7b7',margin:0}},drill.tips)
        )
      ),
      drill.target_metric&&h('div',{'data-anim':'target-card',style:{display:'flex',alignItems:'flex-start',gap:12,padding:16,borderRadius:12,background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.25)'}},
        h(Icon,{n:'target',cls:'w-4 h-4 flex-shrink-0',style:{color:'#60a5fa'}}),
        h('div',null,
          h('p',{style:{fontSize:11,fontWeight:800,color:'#60a5fa',textTransform:'uppercase',letterSpacing:'0.06em',margin:'0 0 4px'}},'Success Target'),
          h('p',{style:{fontSize:13,color:'#93c5fd',margin:0}},drill.target_metric)
        )
      ),
      h('button',{'data-anim':'cta-button',onClick:complete,style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:16,background:'linear-gradient(135deg,#059669,#047857)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:'pointer'}},
        h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),'Mark Complete (+'+drill.xp_value+' XP)'
      )
    )
  );
}

// ================================================================
// MENTAL PAGE + MENTAL PLAYER — stagger + step crossfade
// ================================================================
const MENT_CATS=[
  {id:'all',label:'All',icon:'brain',from:'#6d28d9',to:'#4f46e5'},
  {id:'focus',label:'Focus',icon:'crosshair',from:'#1d4ed8',to:'#4338ca'},
  {id:'confidence',label:'Confidence',icon:'shield',from:'#c2410c',to:'#d97706'},
  {id:'recovery',label:'Recovery',icon:'heart',from:'#15803d',to:'#059669'},
  {id:'pre-performance',label:'Pre-Match',icon:'zap',from:'#b45309',to:'#d97706'},
  {id:'pressure',label:'Pressure',icon:'flame',from:'#be123c',to:'#dc2626'},
  {id:'visualization',label:'Visualize',icon:'sparkles',from:'#6d28d9',to:'#7c3aed'},
  {id:'match-day-calm',label:'Calm',icon:'wind',from:'#0d9488',to:'#0891b2'},
  {id:'pro-mental',label:'Pro',icon:'crown',from:'#3730a3',to:'#4c1d95'},
];

function MentalPage(){
  const [cat,setCat]=useState('all');
  const [search,setSearch]=useState('');
  const [doneSessions,setDoneSessions]=useState(()=>DB.getProgress().completed_mental||[]);
  const listRef=useRef(null);

  useEffect(()=>{const r=()=>setDoneSessions(DB.getProgress().completed_mental||[]);window.addEventListener('sc_update',r);return()=>window.removeEventListener('sc_update',r);},[]);

  // Stagger mental cards on category or search change
  useLayoutEffect(()=>{
    if(!listRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const cards=listRef.current.querySelectorAll('[data-mental-card]');
      if(cards.length) SCAnim.staggerCards(cards,{y:12,duration:0.35,stagger:0.04});
    },listRef);
    return()=>ctx.revert();
  },[cat,search]);

  const filtered=MENTAL_SESSIONS.filter(s=>(cat==='all'||s.category===cat)&&(search===''||s.title.toLowerCase().includes(search.toLowerCase())));

  return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Mental Training',subtitle:MENTAL_SESSIONS.length+' guided sessions',gradient:'linear-gradient(135deg,#6d28d9,#4f46e5)'}),
    h('div',{style:{display:'flex',gap:8,padding:'12px 16px',overflowX:'auto',scrollbarWidth:'none'}},
      MENT_CATS.map(c=>{
        const ac=cat===c.id;
        const cs=ac?{background:'linear-gradient(135deg,'+c.from+','+c.to+')',color:'#fff',border:'none'}:{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'};
        return h('button',{key:c.id,onClick:()=>setCat(c.id),style:Object.assign({display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:10,fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,cursor:'pointer'},cs)},
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5',style:{color:ac?'#fff':'#484f58'}}),c.label);
      })
    ),
    h('div',{style:{padding:'0 16px 12px'}},
      h('div',{style:{position:'relative'}},
        h(Icon,{n:'search',cls:'w-4 h-4',style:{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search sessions...',value:search,onChange:e=>setSearch(e.target.value),style:{width:'100%',paddingLeft:36,paddingRight:16,paddingTop:10,paddingBottom:10,borderRadius:10,fontSize:13,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3',outline:'none',boxSizing:'border-box'}})
      )
    ),
    h('div',{ref:listRef,style:{padding:'0 16px',display:'flex',flexDirection:'column',gap:10}},
      filtered.length===0?h(EmptyState,{icon:'brain',title:'No sessions found',desc:'Try a different category or search term'}):
      filtered.map(s=>{
        const mins=Math.floor(s.duration_seconds/60);
        const isDone=doneSessions.includes(s.id);
        const sc=MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
        return h('button',{key:s.id,'data-mental-card':'',onClick:()=>nav('MentalPlayer',{id:s.id}),style:{width:'100%',textAlign:'left',padding:16,borderRadius:10,border:'1px solid '+(isDone?'rgba(22,163,74,0.3)':'rgba(48,54,61,0.9)'),background:'rgba(22,27,34,0.9)',cursor:'pointer'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:12}},
            h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative',background:'linear-gradient(135deg,'+sc.from+','+sc.to+')'}},
              h(Icon,{n:sc.icon,cls:'w-5 h-5 text-white'}),
              isDone&&h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},h(Icon,{n:'check',cls:'w-3 h-3 text-white'}))
            ),
            h('div',{style:{flex:1,minWidth:0}},
              h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:8}},
                h('h3',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',margin:0}},s.title),
                s.is_premium&&h(PremiumBadge)
              ),
              h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:6}},
                h('span',{style:{fontSize:11,color:'#484f58'}},mins+' min'),
                h(XPBadge,{xp:s.xp_value}),
                isDone&&h('span',{style:{fontSize:11,fontWeight:700,color:'#4ade80'}},'Done')
              )
            )
          )
        );
      })
    )
  );
}

function MentalPlayerPage({params}){
  const sess=MENTAL_SESSIONS.find(s=>s.id===(params&&params.id));
  const [started,setStarted]=useState(false);
  const [step,setStep]=useState(0);
  const [timeLeft,setTimeLeft]=useState(0);
  const [done,setDone]=useState(false);
  const [paused,setPaused]=useState(false);
  const intRef=useRef(null);
  const awardedRef=useRef(false);
  const previewRef=useRef(null);
  const successRef=useRef(null);
  const instructionRef=useRef(null);

  // Preview screen entrance
  useLayoutEffect(()=>{
    if(started||done||!previewRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-mp="desc"]', {opacity:0,y:14,duration:0.4})
        .from('[data-mp="step"]', {opacity:0,x:-12,duration:0.32,stagger:0.05},0.15)
        .from('[data-mp="begin"]',{opacity:0,y:14,duration:0.4},'+=0.1');
    },previewRef);
    return()=>ctx.revert();
  },[started,done]);

  // Step instruction crossfade — fires on every step change while running
  useLayoutEffect(()=>{
    if(!started||done||!instructionRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    gsap.fromTo(instructionRef.current,
      {opacity:0,y:10},
      {opacity:1,y:0,duration:0.35,ease:'power2.out'}
    );
  },[step,started]);

  // Completion screen entrance
  useLayoutEffect(()=>{
    if(!done||!successRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-success="icon"]',    {scale:0,opacity:0,duration:0.5,ease:'back.out(2)'},0)
        .from('[data-success="title"]',   {opacity:0,y:16,duration:0.4},0.15)
        .from('[data-success="subtitle"]',{opacity:0,y:12,duration:0.35},0.25)
        .from('[data-success="badge"]',   {opacity:0,scale:0.7,duration:0.4,ease:'back.out(1.8)'},0.35)
        .from('[data-success="actions"] > *',{opacity:0,y:12,duration:0.35,stagger:0.08},0.5);
    },successRef);
    return()=>ctx.revert();
  },[done]);

  useEffect(()=>{
    if(!started)return;
    clearInterval(intRef.current);
    if(sess&&!done) setTimeLeft(sess.steps[step]?sess.steps[step].duration_seconds:60);
    setPaused(false);
  },[step,started]);

  useEffect(()=>{
    if(!started||done||paused){clearInterval(intRef.current);return;}
    clearInterval(intRef.current);
    intRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(t<=1){
          clearInterval(intRef.current);
          if(sess&&step<sess.steps.length-1){setStep(s=>s+1);}
          else{finishSession();}
          return 0;
        }
        return t-1;
      });
    },1000);
    return()=>clearInterval(intRef.current);
  },[started,done,paused,step]);

  useEffect(()=>()=>clearInterval(intRef.current),[]);

  const finishSession=()=>{
    if(awardedRef.current)return;awardedRef.current=true;setDone(true);
    awardXP(sess.xp_value,Math.floor(sess.duration_seconds/60),'mental','mental',sess.id);
    fireConfetti();
  };
  const goNext=()=>{clearInterval(intRef.current);if(sess&&step<sess.steps.length-1)setStep(s=>s+1);else finishSession();};

  if(!sess) return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'2rem',textAlign:'center'}},
    h('p',{style:{color:'#8b949e',fontWeight:700,marginBottom:16}},'Session not found'),
    h('button',{onClick:()=>nav('Mental'),style:{padding:'10px 24px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Back')
  );

  // Completion screen
  if(done) return h('div',{ref:successRef,style:{minHeight:'100vh',background:'linear-gradient(135deg,#0f0824,#1e1040,#0f172a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem',textAlign:'center'}},
    h('div',{'data-success':'icon',style:{width:72,height:72,borderRadius:18,background:'rgba(124,58,237,0.2)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}},h(Icon,{n:'circleCheck',cls:'w-9 h-9',style:{color:'#a855f7'}})),
    h('h2',{'data-success':'title',style:{fontSize:'1.5rem',fontWeight:800,color:'#fff',marginBottom:8}},'Session Complete'),
    h('p',{'data-success':'subtitle',style:{color:'#a78bfa',marginBottom:16,fontSize:14}},sess.title),
    h('div',{'data-success':'badge'},h(XPBadge,{xp:sess.xp_value})),
    h('div',{'data-success':'actions',style:{marginTop:24,display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:280}},
      h('button',{onClick:()=>nav('Mental'),style:{padding:'12px',background:'#7c3aed',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'More Sessions'),
      h('button',{onClick:()=>{setDone(false);setStarted(false);setStep(0);awardedRef.current=false;},style:{padding:'12px',background:'rgba(109,40,217,0.15)',color:'#a78bfa',border:'1px solid rgba(109,40,217,0.3)',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Repeat Session')
    )
  );

  const mins=Math.floor(sess.duration_seconds/60);

  // Preview screen
  if(!started) return h('div',{ref:previewRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:sess.title,subtitle:mins+' min \u00b7 '+sess.xp_value+' XP',gradient:'linear-gradient(135deg,#6d28d9,#4338ca)',onBack:()=>nav('Mental')}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}},
      h('div',{'data-mp':'desc',style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:16}},
        h('p',{style:{fontSize:13,color:'#8b949e',lineHeight:1.7,margin:0}},sess.description)
      ),
      h('div',null,
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},sess.steps.length+' Steps'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          sess.steps.map((s,i)=>h('div',{key:i,'data-mp':'step',style:{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',borderRadius:8,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
            h('div',{style:{width:22,height:22,borderRadius:'50%',background:'rgba(168,85,247,0.2)',border:'1px solid rgba(168,85,247,0.3)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:10,fontWeight:800,color:'#a855f7'}},i+1),
            h('p',{style:{fontSize:13,color:'#8b949e',flex:1,lineHeight:1.6,margin:0}},s.instruction),
            h('span',{style:{fontSize:11,color:'#484f58',flexShrink:0,marginTop:1}},s.duration_seconds+'s')
          ))
        )
      ),
      h('button',{'data-mp':'begin',onClick:()=>{setStarted(true);setStep(0);setTimeLeft(sess.steps[0].duration_seconds);},style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:14,background:'linear-gradient(135deg,#6d28d9,#4338ca)',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer'}},
        h(Icon,{n:'play',cls:'w-5 h-5'}),' Begin Session'
      )
    )
  );

  // Active guided player
  const cur=sess.steps[step];
  const pct=cur&&cur.duration_seconds>0?timeLeft/cur.duration_seconds:0;
  const R=90,C=2*Math.PI*R;
  const isLast=step===sess.steps.length-1;

  return h('div',{style:{minHeight:'100vh',background:'linear-gradient(160deg,#0f0824 0%,#1e1040 50%,#0f172a 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'max(1.5rem,env(safe-area-inset-top)) 1.5rem max(1.5rem,env(safe-area-inset-bottom))'}},
    h('div',{style:{width:'100%',maxWidth:360,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}},
      h('button',{onClick:()=>nav('Mental'),style:{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'6px 10px',cursor:'pointer',color:'#a78bfa',fontSize:12,fontWeight:600}},'\u2190 Exit'),
      h('div',{style:{textAlign:'center'}},
        h('div',{style:{fontSize:11,fontWeight:700,color:'#7c3aed',textTransform:'uppercase'}},sess.title.slice(0,24)),
        h('div',{style:{fontSize:10,color:'#6d28d9',marginTop:2}},'Step '+(step+1)+' of '+sess.steps.length)
      ),
      h('div',{style:{fontSize:11,fontWeight:700,color:'#7c3aed',background:'rgba(109,40,217,0.15)',borderRadius:6,padding:'4px 8px'}},Math.round(((step+(1-pct))/sess.steps.length)*100)+'%')
    ),
    h('div',{style:{position:'relative',width:220,height:220}},
      h('svg',{width:220,height:220,viewBox:'0 0 220 220'},
        h('circle',{cx:110,cy:110,r:R,fill:'none',stroke:'rgba(109,40,217,0.15)',strokeWidth:12}),
        h('circle',{cx:110,cy:110,r:R,fill:'none',stroke:'#a855f7',strokeWidth:12,strokeLinecap:'round',strokeDasharray:C,strokeDashoffset:C*(1-Math.max(0,Math.min(1,pct))),style:{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dashoffset 1s linear'}})
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center'}},
        h('div',{style:{fontSize:'2.75rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums',lineHeight:1}},fmtTime(timeLeft)),
        h('div',{style:{fontSize:11,color:'#7c3aed',fontWeight:700,marginTop:6,letterSpacing:'0.04em'}},paused?'PAUSED':'RUNNING')
      )
    ),
    // Instruction with crossfade ref — key forces React to remount on step change
    h('div',{style:{textAlign:'center',maxWidth:320,flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.5rem 0'}},
      h('p',{key:step,ref:instructionRef,style:{fontSize:'1.05rem',color:'#ddd6fe',lineHeight:1.75,fontWeight:500}},cur&&cur.instruction)
    ),
    h('div',{style:{width:'100%',maxWidth:360,display:'flex',flexDirection:'column',gap:10}},
      h('div',{style:{display:'flex',gap:10}},
        step>0&&h('button',{onClick:()=>{clearInterval(intRef.current);setStep(s=>s-1);},style:{flexShrink:0,padding:'12px 18px',background:'rgba(255,255,255,0.08)',color:'#a78bfa',borderRadius:10,fontWeight:700,border:'1px solid rgba(168,85,247,0.2)',cursor:'pointer',fontSize:14}},h(Icon,{n:'arrowL',cls:'w-4 h-4'})),
        h('button',{onClick:goNext,style:{flex:1,padding:13,background:isLast?'#16a34a':'linear-gradient(135deg,#6d28d9,#4338ca)',color:'#fff',borderRadius:10,border:'none',cursor:'pointer',fontSize:14,fontWeight:700}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:6}},
            isLast?h(Icon,{n:'circleCheck',cls:'w-4 h-4'}):null,
            isLast?'Complete Session':'Next Step',
            !isLast&&h(Icon,{n:'chevR',cls:'w-4 h-4'})
          )
        )
      ),
      h('button',{onClick:()=>setPaused(p=>!p),style:{padding:10,background:'transparent',color:'#6d28d9',borderRadius:10,fontWeight:600,border:'1px solid rgba(109,40,217,0.3)',cursor:'pointer',fontSize:13}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:6}},h(Icon,{n:paused?'play':'pause',cls:'w-4 h-4'}),paused?'Resume':'Pause')
      )
    )
  );
}

// ================================================================
// FITNESS PAGE + WORKOUT DETAIL — stagger + entrance + CTA pulse
// ================================================================
const FIT_WIZARD=[
  {key:'level',label:'Experience Level',opts:[{id:'beginner',label:'Beginner',icon:'activity',desc:'New or returning'},{id:'intermediate',label:'Intermediate',icon:'zap',desc:'Training 3-4x weekly'},{id:'advanced',label:'Advanced',icon:'flame',desc:'5-6x high intensity'},{id:'pro',label:'Pro',icon:'diamond',desc:'Elite daily training'}]},
  {key:'target',label:'Target Muscle',opts:[{id:'full-body',label:'Full Body',icon:'activity'},{id:'chest',label:'Chest',icon:'heart'},{id:'back',label:'Back',icon:'layers'},{id:'shoulders',label:'Shoulders',icon:'wind'},{id:'arms',label:'Arms',icon:'dumbbell'},{id:'legs',label:'Legs',icon:'zap'},{id:'core',label:'Core',icon:'crosshair'},{id:'glutes',label:'Glutes',icon:'dumbbell'}]},
  {key:'goal',label:'Training Goal',opts:[{id:'build-muscle',label:'Build Muscle',icon:'dumbbell',desc:'Strength and size'},{id:'lose-weight',label:'Lose Weight',icon:'flame',desc:'Fat burn and conditioning'},{id:'improve-endurance',label:'Endurance',icon:'activity',desc:'Stamina and cricket fitness'}]},
  {key:'duration',label:'Session Length',opts:[{id:'<10',label:'Under 10 min',icon:'zap'},{id:'10-15',label:'10-15 min',icon:'clock'},{id:'15-20',label:'15-20 min',icon:'timer'},{id:'20-25',label:'20-25 min',icon:'clock'},{id:'25+',label:'25+ min',icon:'trophy'}]},
];
const LVL_GRAD={beginner:'linear-gradient(135deg,#15803d,#059669)',intermediate:'linear-gradient(135deg,#1d4ed8,#4338ca)',advanced:'linear-gradient(135deg,#c2410c,#ea580c)',pro:'linear-gradient(135deg,#6d28d9,#7c3aed)'};

function FitnessPage(){
  const [tab,setTab]=useState('quick');
  const [step,setStep]=useState(0);
  const [picks,setPicks]=useState({level:'',target:'',goal:'',duration:''});
  const [results,setResults]=useState(null);
  const listRef=useRef(null);

  const choose=(key,val)=>{
    const n={...picks,[key]:val};setPicks(n);
    if(step<3)setStep(s=>s+1);
    else setResults(findWorkouts(n.level,n.target,n.goal,n.duration));
  };
  const reset=()=>{setStep(0);setPicks({level:'',target:'',goal:'',duration:''});setResults(null);};

  // Stagger workout cards on tab change or results change
  useLayoutEffect(()=>{
    if(!listRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const cards=listRef.current.querySelectorAll('[data-fit-card]');
      if(cards.length) SCAnim.staggerCards(cards,{y:12,duration:0.35,stagger:0.04});
    },listRef);
    return()=>ctx.revert();
  },[tab,results]);

  const quickPicks=[WORKOUTS[0],WORKOUTS[20],WORKOUTS[40],WORKOUTS[60]].filter(Boolean);

  const WorkoutCard=({w})=>h('button',{'data-fit-card':'',onClick:()=>nav('WorkoutDetail',{id:w.id}),style:{width:'100%',display:'flex',alignItems:'center',gap:16,padding:16,borderRadius:12,textAlign:'left',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',cursor:'pointer',transition:'all 0.12s'}},
    h('div',{style:{width:48,height:48,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:LVL_GRAD[w.level]||LVL_GRAD.beginner}},h(Icon,{n:'dumbbell',cls:'w-5 h-5 text-white'})),
    h('div',{style:{flex:1}},
      h('div',{style:{fontSize:14,fontWeight:700,color:'#e6edf3'}},w.name),
      h('div',{style:{fontSize:12,marginTop:2,color:'#484f58'}},w.level+' \u00b7 '+w.target+' \u00b7 '+w.duration_minutes+' min'),
      h('div',{style:{marginTop:6}},h(XPBadge,{xp:w.xp_value}))
    ),
    h(Icon,{n:'chevR',cls:'w-5 h-5',style:{color:'#374151'}})
  );

  return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Fitness Builder',subtitle:WORKOUTS.length+' workouts',gradient:'linear-gradient(135deg,#c2410c,#dc2626)'}),
    h('div',{style:{display:'flex',gap:8,padding:'12px 16px'}},
      [['quick','Quick Start'],['wizard','Wizard'],['stats','Stats']].map(([id,label])=>{
        const at=tab===id;
        const ts=at?{background:'linear-gradient(135deg,#c2410c,#dc2626)',color:'#fff',border:'none'}:{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'};
        return h('button',{key:id,onClick:()=>{setTab(id);reset();},style:Object.assign({flex:1,padding:'8px 4px',borderRadius:10,fontSize:12,fontWeight:800,cursor:'pointer'},ts)},label);
      })
    ),
    h('div',{style:{padding:'0 16px'}},
      tab==='quick'&&h('div',{ref:listRef,style:{display:'flex',flexDirection:'column',gap:10}},quickPicks.map(w=>h(WorkoutCard,{key:w.id,w}))),
      tab==='wizard'&&!results&&h('div',null,
        h('div',{style:{display:'flex',justifyContent:'center',gap:8,marginBottom:20,paddingTop:4}},
          FIT_WIZARD.map((_,i)=>h('div',{key:i,style:{height:8,borderRadius:9999,transition:'all 0.3s',width:i===step?32:8,background:i<step?'#10b981':i===step?'#f97316':'rgba(51,65,85,0.5)'}}))
        ),
        h('h2',{style:{fontSize:16,fontWeight:800,color:'#fff',marginBottom:4}},FIT_WIZARD[step].label),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8,marginTop:12}},
          FIT_WIZARD[step].opts.map(opt=>h('button',{key:opt.id,onClick:()=>choose(FIT_WIZARD[step].key,opt.id),style:{width:'100%',display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,textAlign:'left',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',cursor:'pointer'}},
            h('div',{style:{width:36,height:36,borderRadius:7,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},h(Icon,{n:opt.icon||'activity',cls:'w-4 h-4',style:{color:'#8b949e'}})),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},opt.label),
              opt.desc&&h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},opt.desc)
            ),
            h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#374151'}})
          ))
        ),
        step>0&&h('button',{onClick:()=>setStep(s=>s-1),style:{display:'flex',alignItems:'center',gap:8,marginTop:16,fontSize:13,fontWeight:600,color:'#94a3b8',background:'none',border:'none',cursor:'pointer'}},h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back')
      ),
      tab==='wizard'&&results&&h('div',null,
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',marginBottom:8}},
          h('div',null,h('div',{style:{fontSize:14,fontWeight:700,color:'#34d399'}},results.length+' workouts found'),
            h('div',{style:{fontSize:12,color:'#94a3b8'}},Object.values(picks).filter(Boolean).join(' \u00b7 '))),
          h('button',{onClick:reset,style:{fontSize:12,fontWeight:700,color:'#94a3b8',background:'none',border:'none',cursor:'pointer'}},'New Search')
        ),
        h('div',{ref:listRef,style:{display:'flex',flexDirection:'column',gap:10}},results.map(w=>h(WorkoutCard,{key:w.id,w})))
      ),
      tab==='stats'&&h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,paddingTop:8}},
        h(StatCard,{label:'Workouts Done',value:DB.getProgress().workouts_done||0,color:'#fb923c',icon:'dumbbell'}),
        h(StatCard,{label:'Total Library',value:WORKOUTS.length,icon:'layers'}),
        h(StatCard,{label:'Levels',value:'4 levels',color:'#4ade80',icon:'trophy'}),
        h(StatCard,{label:'Muscle Groups',value:'8 targets',color:'#60a5fa',icon:'crosshair'})
      )
    )
  );
}

function WorkoutDetailPage({params}){
  const w=WORKOUTS.find(wk=>wk.id===(params&&params.id));
  const [done,setDone]=useState(false);
  const completing=useRef(false);
  const rootRef=useRef(null);
  const successRef=useRef(null);

  // Entrance animation
  useLayoutEffect(()=>{
    if(done||!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-anim="stat"]',    {opacity:0,y:10,duration:0.35,stagger:0.05},0)
        .from('[data-anim="about"]',   {opacity:0,y:14,duration:0.4},0.2)
        .from('[data-anim="cta-button"]',{opacity:0,y:18,duration:0.4},0.35);
      const ctaEl=rootRef.current.querySelector('[data-anim="cta-button"]');
      if(ctaEl) gsap.to(ctaEl,{scale:1.02,duration:1.4,ease:'sine.inOut',repeat:-1,yoyo:true,delay:1.0});
    },rootRef);
    return()=>ctx.revert();
  },[done,params&&params.id]);

  // Completion screen entrance
  useLayoutEffect(()=>{
    if(!done||!successRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-success="icon"]',    {scale:0,opacity:0,duration:0.5,ease:'back.out(2)'},0)
        .from('[data-success="title"]',   {opacity:0,y:16,duration:0.4},0.15)
        .from('[data-success="subtitle"]',{opacity:0,y:12,duration:0.35},0.25)
        .from('[data-success="badge"]',   {opacity:0,scale:0.7,duration:0.4,ease:'back.out(1.8)'},0.35)
        .from('[data-success="actions"] > *',{opacity:0,y:12,duration:0.35,stagger:0.08},0.5);
    },successRef);
    return()=>ctx.revert();
  },[done]);

  if(!w) return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'80vh',padding:'2rem',textAlign:'center'}},
    h('p',{style:{color:'#8b949e',fontWeight:700,marginBottom:16}},'Workout not found'),
    h('button',{onClick:()=>nav('Fitness'),style:{padding:'10px 24px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Back')
  );
  const complete=()=>{
    if(completing.current)return;completing.current=true;
    awardXP(w.xp_value,w.duration_minutes,'workout','workout',w.id);
    fireConfetti();setDone(true);
  };

  if(done) return h('div',{ref:successRef,style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'2rem 1.25rem',minHeight:'100vh'}},
    h('div',{'data-success':'icon',style:{width:64,height:64,borderRadius:16,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},h(Icon,{n:'circleCheck',cls:'w-8 h-8',style:{color:'#16a34a'}})),
    h('h2',{'data-success':'title',style:{fontSize:'1.5rem',fontWeight:800,color:'#fff',marginBottom:8}},'Workout Complete!'),
    h('p',{'data-success':'subtitle',style:{color:'#94a3b8',marginBottom:12}},w.name),
    h('div',{'data-success':'badge'},h(XPBadge,{xp:w.xp_value})),
    h('div',{'data-success':'actions',style:{marginTop:24,display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:280}},
      h('button',{onClick:()=>nav('Fitness'),style:{padding:'12px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'More Workouts'),
      h('button',{onClick:()=>{setDone(false);completing.current=false;},style:{padding:'12px',background:'rgba(30,41,59,0.6)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.5)',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Do Again')
    )
  );

  const grad=({beginner:'#15803d,#059669',intermediate:'#1d4ed8,#4338ca',advanced:'#c2410c,#ea580c',pro:'#6d28d9,#7c3aed'})[w.level]||'#c2410c,#ea580c';
  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:w.name,subtitle:w.duration_minutes+' min \u00b7 '+w.exercises+' exercises \u00b7 '+w.xp_value+' XP',gradient:'linear-gradient(135deg,'+grad+')',onBack:()=>nav('Fitness')}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}},
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}},
        h(StatCard,{'data-anim':'stat',label:'Level',value:w.level}),
        h(StatCard,{'data-anim':'stat',label:'Focus',value:w.target,color:'#fb923c'}),
        h(StatCard,{'data-anim':'stat',label:'Goal',value:w.goal.replace('-',' '),color:'#fbbf24'})
      ),
      h('div',{'data-anim':'about',style:{padding:16,borderRadius:12,background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('p',{style:{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 8px'}},'About This Workout'),
        h('p',{style:{fontSize:13,color:'#cbd5e1',lineHeight:1.7,margin:0}},'A '+w.duration_minutes+'-minute '+w.level+' workout targeting '+w.target+' with a focus on '+w.goal.replace(/-/g,' ')+'. Complete '+w.exercises+' exercises with proper form and adequate rest between sets.')
      ),
      h('button',{'data-anim':'cta-button',onClick:complete,style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:16,background:'linear-gradient(135deg,'+grad+')',color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:800,cursor:'pointer'}},
        h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),'Complete Workout (+'+w.xp_value+' XP)'
      )
    )
  );
}

// ================================================================
// TIMER PAGE — preset card stagger on mount
// ================================================================
function TimerPage(){
  const PRESETS=[
    {id:'net',name:'Net Session',work:600,rest:120,rounds:3,col:'#3b82f6'},
    {id:'sprint',name:'Sprint Intervals',work:30,rest:30,rounds:8,col:'#f97316'},
    {id:'hiit',name:'HIIT Cricket',work:45,rest:15,rounds:6,col:'#dc2626'},
    {id:'drill',name:'Drill Reps',work:60,rest:30,rounds:5,col:'#16a34a'},
    {id:'mental',name:'Mindset Reset',work:300,rest:60,rounds:2,col:'#7c3aed'},
    {id:'custom',name:'Custom',work:60,rest:30,rounds:4,col:'#0d9488'},
  ];
  const [selected,setSelected]=useState(null);
  const [phase,setPhase]=useState('work');
  const [remaining,setRemaining]=useState(0);
  const [round,setRound]=useState(1);
  const [running,setRunning]=useState(false);
  const [finished,setFinished]=useState(false);
  const [cWork,setCWork]=useState(60);
  const [cRest,setCRest]=useState(30);
  const [cRounds,setCRounds]=useState(4);
  const intRef=useRef(null);
  const stRef=useRef({phase:'work',remaining:0,round:1,preset:null});
  const presetsRef=useRef(null);

  // Stagger preset cards on mount
  useLayoutEffect(()=>{
    if(!presetsRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      SCAnim.staggerCards(presetsRef.current.querySelectorAll('[data-timer-preset]'),{y:10,duration:0.3,stagger:0.04,delay:0.1});
    },presetsRef);
    return()=>ctx.revert();
  },[]);

  const startTimer=(preset)=>{
    const p=preset.id==='custom'?{...preset,work:cWork,rest:cRest,rounds:cRounds}:preset;
    stRef.current={phase:'work',remaining:p.work,round:1,preset:p};
    setPhase('work');setRemaining(p.work);setRound(1);setRunning(false);setFinished(false);setSelected(p);
  };

  useEffect(()=>{
    if(!running||finished)return;
    clearInterval(intRef.current);
    intRef.current=setInterval(()=>{
      const s=stRef.current;
      if(s.remaining<=1){
        if(s.phase==='work'){
          const n={...s,phase:'rest',remaining:s.preset.rest};stRef.current=n;
          setPhase('rest');setRemaining(s.preset.rest);
        } else {
          if(s.round>=s.preset.rounds){
            clearInterval(intRef.current);setRunning(false);setFinished(true);
            awardXP(40,Math.ceil(s.preset.work*s.preset.rounds/60),'timer');
          } else {
            const n={...s,phase:'work',remaining:s.preset.work,round:s.round+1};stRef.current=n;
            setPhase('work');setRemaining(s.preset.work);setRound(r=>r+1);
          }
        }
      } else {stRef.current.remaining--;setRemaining(r=>r-1);}
    },1000);
    return()=>clearInterval(intRef.current);
  },[running,finished]);
  useEffect(()=>()=>clearInterval(intRef.current),[]);

  if(!selected) return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Timer',subtitle:'Interval & drill session timer',gradient:'linear-gradient(135deg,#0f766e,#0d9488)'}),
    h('div',{style:{padding:'20px 16px'}},
      h('p',{style:{fontSize:13,color:'#94a3b8',marginBottom:16}},'Choose a training preset:'),
      h('div',{ref:presetsRef,style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},
        PRESETS.map(p=>h('button',{key:p.id,'data-timer-preset':'',onClick:()=>startTimer(p),style:{padding:'16px 12px',borderRadius:12,border:'1px solid rgba(51,65,85,0.5)',background:'rgba(22,27,34,0.9)',cursor:'pointer',textAlign:'left'}},
          h('div',{style:{width:36,height:36,borderRadius:8,background:p.col+'33',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}},
            h(Icon,{n:'timer',cls:'w-5 h-5',style:{color:p.col}})
          ),
          h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',marginBottom:4}},p.name),
          h('div',{style:{fontSize:11,color:'#64748b'}},fmtTime(p.work)+' work \u00b7 '+p.rounds+' rounds')
        ))
      ),
      h('div',{style:{marginTop:16,padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',marginBottom:12}},'Custom Intervals'),
        h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12,marginBottom:12}},
          [['Work (s)',cWork,setCWork],['Rest (s)',cRest,setCRest],['Rounds',cRounds,setCRounds]].map(([label,val,setter])=>
            h('div',{key:label},
              h('label',{style:{fontSize:11,fontWeight:700,color:'#64748b',display:'block',marginBottom:6}},label),
              h('input',{type:'number',min:1,value:val,onChange:e=>setter(Math.max(1,parseInt(e.target.value)||1)),style:{width:'100%',padding:'8px 10px',borderRadius:8,background:'rgba(15,23,42,0.6)',border:'1px solid rgba(51,65,85,0.6)',color:'#e6edf3',fontSize:14,fontWeight:700,outline:'none',boxSizing:'border-box'}})
            )
          )
        ),
        h('button',{onClick:()=>startTimer(PRESETS.find(p=>p.id==='custom')),style:{width:'100%',padding:'12px',background:'linear-gradient(135deg,#0f766e,#0d9488)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:13}},'Start Custom Timer')
      )
    )
  );

  const pct=remaining/(phase==='work'?selected.work:selected.rest);
  const col=phase==='work'?selected.col:'#64748b';
  const R=90,C=2*Math.PI*R;

  if(finished) return h('div',{style:{minHeight:'100vh',background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',textAlign:'center'}},
    h('div',{style:{width:64,height:64,borderRadius:16,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},h(Icon,{n:'circleCheck',cls:'w-8 h-8',style:{color:'#16a34a'}})),
    h('h2',{style:{fontSize:'1.5rem',fontWeight:800,color:'#fff',marginBottom:8}},selected.name+' Complete!'),
    h('p',{style:{color:'#94a3b8',marginBottom:16}},selected.rounds+' rounds completed'),
    h(XPBadge,{xp:40}),
    h('div',{style:{marginTop:24,display:'flex',flexDirection:'column',gap:12,width:'100%',maxWidth:280}},
      h('button',{onClick:()=>setSelected(null),style:{padding:'12px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'New Timer'),
      h('button',{onClick:()=>startTimer(selected),style:{padding:'12px',background:'rgba(30,41,59,0.6)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.5)',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Repeat')
    )
  );

  return h('div',{style:{minHeight:'100vh',background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',padding:'max(1.5rem,env(safe-area-inset-top)) 1.5rem max(1.5rem,env(safe-area-inset-bottom))'}},
    h('div',{style:{width:'100%',maxWidth:360,display:'flex',alignItems:'center',justifyContent:'space-between'}},
      h('button',{onClick:()=>{clearInterval(intRef.current);setSelected(null);},style:{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'6px 12px',cursor:'pointer',color:'#94a3b8',fontSize:12,fontWeight:600}},'\u2190 Back'),
      h('div',{style:{textAlign:'center'}},
        h('div',{style:{fontSize:13,fontWeight:700,color:col}},selected.name),
        h('div',{style:{fontSize:11,color:'#64748b'}},'Round '+round+' of '+selected.rounds)
      ),
      h('div',{style:{fontSize:11,fontWeight:700,color:'#64748b',background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)',borderRadius:6,padding:'4px 8px'}},phase==='work'?'WORK':'REST')
    ),
    h('div',{style:{position:'relative',width:220,height:220}},
      h('svg',{width:220,height:220,viewBox:'0 0 220 220'},
        h('circle',{cx:110,cy:110,r:R,fill:'none',stroke:'rgba(51,65,85,0.5)',strokeWidth:12}),
        h('circle',{cx:110,cy:110,r:R,fill:'none',stroke:col,strokeWidth:12,strokeLinecap:'round',strokeDasharray:C,strokeDashoffset:C*(1-Math.max(0,Math.min(1,pct))),style:{transform:'rotate(-90deg)',transformOrigin:'center',transition:'stroke-dashoffset 0.5s linear'}})
      ),
      h('div',{style:{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}},
        h('div',{style:{fontSize:'3rem',fontWeight:900,color:'#fff',fontVariantNumeric:'tabular-nums',lineHeight:1}},fmtTime(remaining)),
        h('div',{style:{fontSize:12,fontWeight:700,color:col,marginTop:6,textTransform:'uppercase',letterSpacing:'0.06em'}},phase==='work'?'Work':'Rest')
      )
    ),
    h('div',{style:{width:'100%',maxWidth:360,display:'flex',flexDirection:'column',gap:12}},
      h('button',{onClick:()=>setRunning(r=>!r),style:{width:80,height:80,borderRadius:'50%',background:running?'linear-gradient(135deg,#dc2626,#be123c)':'linear-gradient(135deg,#059669,#0d9488)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto',boxShadow:'0 8px 32px '+selected.col+'55'}},
        h(Icon,{n:running?'pause':'play',cls:'w-8 h-8 text-white'})
      ),
      h('button',{onClick:()=>{clearInterval(intRef.current);stRef.current={...stRef.current,phase:'work',remaining:selected.work,round:1};setPhase('work');setRemaining(selected.work);setRound(1);setRunning(false);},style:{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'10px',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,color:'#94a3b8',fontSize:13,fontWeight:600,cursor:'pointer'}},
        h(Icon,{n:'refresh',cls:'w-4 h-4'}),'Reset'
      )
    )
  );
}

// ================================================================
// 30-DAY CHALLENGE — grid stagger + ring draw + completion cell pop
// ================================================================
const DAY30=Array.from({length:30},(_,i)=>{
  const phases=['Foundation','Development','Integration','Performance'];
  const types=['drill','mental','drill','fitness','drill','mental'];
  const titles=['Batting Fundamentals','Mental Focus Session','Bowling Precision','Fitness Conditioning','Fielding Agility','Match Mindset'];
  const xps=[60,50,70,65,80,55];
  const isRest=i%7===6;
  return {day:i+1,title:isRest?'Rest & Recover':titles[i%6],type:isRest?'rest':types[i%6],xp:isRest?20:xps[i%6],phase:phases[Math.floor(i/7)%4]};
});

function ThirtyDayPage(){
  const [progress,setProgress]=useState(()=>DB.getProgress());
  const rootRef=useRef(null);
  const completed=progress.thirtyDay_completed||{};
  const doneCnt=Object.keys(completed).length;
  const pct=Math.round(doneCnt/30*100);
  const today=new Date().toISOString().slice(0,10);

  useEffect(()=>{const r=()=>setProgress(DB.getProgress());window.addEventListener('sc_update',r);return()=>window.removeEventListener('sc_update',r);},[]);

  // Grid cells stagger in on mount + progress ring draw
  useLayoutEffect(()=>{
    if(!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      // Stagger all day cells with back-out pop effect
      const cells=rootRef.current.querySelectorAll('[data-day-cell]');
      if(cells.length){
        gsap.from(cells,{
          opacity:0,scale:0.7,duration:0.2,
          stagger:{amount:0.55,from:'start'},
          ease:'back.out(1.4)',delay:0.15
        });
      }
      // Draw the progress ring
      const ring=rootRef.current.querySelector('[data-prog-ring]');
      if(ring) SCAnim.drawRing(ring,0,doneCnt/30,{duration:1.0,delay:0.1});
    },rootRef);
    return()=>ctx.revert();
  },[]);

  const markDay=(day)=>{
    if(completed[day.day])return;
    const currentP=DB.getProgress();
    if(currentP.thirtyDay_completed?.[day.day]){setProgress(currentP);return;}
    const p=DB.getProgress();
    if(!p.thirtyDay_completed)p.thirtyDay_completed={};
    p.thirtyDay_completed[day.day]=today;
    DB.saveProgress(p);
    awardXP(day.xp,15,'30day');
    setProgress(DB.getProgress());
    // Pop the just-completed cell
    if(SCAnim.ready&&!SCAnim.reducedMotion){
      const cell=document.querySelector('[data-day-cell="'+day.day+'"]');
      if(cell) gsap.fromTo(cell,{scale:0.8},{scale:1,duration:0.4,ease:'back.out(2.5)'});
    }
    if(Object.keys(completed).length+1===30){fireConfetti();setTimeout(fireConfetti,400);}
  };

  const phases=['Foundation','Development','Integration','Performance'];
  const R=90,C=2*Math.PI*R;

  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'30-Day Challenge',subtitle:'Build the habit. Transform your game.',gradient:'linear-gradient(135deg,#d97706,#b45309)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:20}},
      h('div',{style:{padding:20,borderRadius:12,background:'rgba(217,119,6,0.1)',border:'1px solid rgba(217,119,6,0.3)'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}},
          h('div',null,
            h('div',{style:{fontSize:24,fontWeight:800,color:'#fff'}},'Day '+doneCnt+' / 30'),
            h('div',{style:{fontSize:14,fontWeight:700,color:'#fbbf24',marginTop:2}},doneCnt===30?'Challenge Complete! \uD83C\uDFC6':doneCnt===0?'Begin your journey':'Keep going!')
          ),
          // SVG progress ring — drawn by GSAP on mount
          h('div',{style:{position:'relative',width:64,height:64,flexShrink:0}},
            h('svg',{width:64,height:64,viewBox:'0 0 64 64'},
              h('circle',{cx:32,cy:32,r:28,fill:'none',stroke:'rgba(51,65,85,0.6)',strokeWidth:5}),
              h('circle',{'data-prog-ring':'',cx:32,cy:32,r:28,fill:'none',stroke:'#f59e0b',strokeWidth:5,
                strokeLinecap:'round',
                strokeDasharray:2*Math.PI*28,
                strokeDashoffset:2*Math.PI*28*(1-pct/100),
                style:{transform:'rotate(-90deg)',transformOrigin:'center'}
              })
            ),
            h('div',{style:{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'#f59e0b'}},pct+'%')
          )
        ),
        h('div',{style:{height:10,background:'rgba(51,65,85,0.6)',borderRadius:9999,overflow:'hidden'}},
          h('div',{style:{width:pct+'%',height:'100%',background:'linear-gradient(to right,#f59e0b,#d97706)',borderRadius:9999,transition:'width .6s'}})
        )
      ),
      phases.map((phase,pi)=>{
        const pDays=DAY30.filter(d=>d.phase===phase);
        return h('div',{key:phase},
          h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:12}},
            h('div',{style:{width:8,height:8,borderRadius:'50%',background:'#f59e0b'}}),
            h('span',{style:{fontSize:11,fontWeight:800,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.1em'}},'Week '+(pi+1)+' \u2014 '+phase)
          ),
          h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}},
            pDays.map(d=>{
              const isDone=!!completed[d.day];
              const isNext=!isDone&&Object.keys(completed).length===d.day-1;
              const isRest=d.type==='rest';
              return h('button',{key:d.day,'data-day-cell':d.day,onClick:()=>markDay(d),disabled:isDone,title:'Day '+d.day+': '+d.title,style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',aspectRatio:'1',borderRadius:10,cursor:isDone?'default':'pointer',transition:'all 0.12s',background:isDone?'#10b981':isNext?'rgba(245,158,11,0.15)':isRest?'rgba(15,23,42,0.5)':'rgba(22,27,34,0.9)',border:'2px solid '+(isDone?'#059669':isNext?'#f59e0b':'rgba(48,54,61,0.9)')}},
                isDone?h(Icon,{n:'check',cls:'w-3.5 h-3.5 text-white'}):
                isRest?h('span',{style:{fontSize:13,fontWeight:700,color:'#64748b'}},'R'):
                h('span',{style:{fontSize:13,fontWeight:900,color:isNext?'#f59e0b':'#8b949e'}},String(d.day))
              );
            })
          )
        );
      }),
      (()=>{
        const next=DAY30[doneCnt];
        if(!next||doneCnt===30)return null;
        return h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(245,158,11,0.3)'}},
          h('div',{style:{fontSize:11,fontWeight:800,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}},'Up Next \u2014 Day '+next.day),
          h('div',{style:{fontSize:16,fontWeight:800,color:'#fff',marginBottom:4}},next.title),
          h('div',{style:{fontSize:12,color:'#64748b',marginBottom:12}},next.phase+' \u00b7 +'+next.xp+' XP'),
          h('button',{onClick:()=>markDay(next),style:{width:'100%',padding:'12px',background:'linear-gradient(135deg,#d97706,#b45309)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:14}},'Complete Day '+next.day)
        );
      })()
    )
  );
}

// ================================================================
// NINETY-DAY PROGRAM — full implementation with stagger
// ================================================================
const NINETY_PHASES=[
  {phase:1,name:'Foundation',weeks:'1-4',color:'#3b82f6',desc:'Build unbreakable habits, baseline fitness, and core technique.'},
  {phase:2,name:'Development',weeks:'5-8',color:'#8b5cf6',desc:'Expand your skill range, increase intensity, add complexity.'},
  {phase:3,name:'Integration',weeks:'9-10',color:'#f97316',desc:'Connect all disciplines. Match-simulation training begins.'},
  {phase:4,name:'Performance',weeks:'11-13',color:'#dc2626',desc:'Peak performance. High pressure drills. Championship mindset.'},
];
const NINETY_WEEKS=Array.from({length:13},(_,wi)=>{
  const phaseIdx=wi<4?0:wi<8?1:wi<10?2:3;
  const phase=NINETY_PHASES[phaseIdx];
  const isDeload=(wi+1)%4===0;
  return {
    week:wi+1,phase:phase.name,phaseColor:phase.color,isDeload,
    title:isDeload?'Week '+(wi+1)+' \u2014 Deload & Assess':'Week '+(wi+1)+' \u2014 '+phase.name,
    desc:isDeload?'Reduce volume 40%. Test your gains. Recover fully.':[
      'Batting technique + core fitness + mental foundations',
      'Bowling accuracy + fielding athleticism + confidence building',
      'Match-practice simulations + full skill integration sessions',
      'Peak performance prep + pressure inoculation + final assessment',
    ][phaseIdx],
    dailyXP:[80,100,120,150][phaseIdx],
  };
});

function NinetyDayPage(){
  const [progress,setProgress]=useState(()=>DB.getProgress());
  const [expandedWeek,setExpandedWeek]=useState(null);
  const rootRef=useRef(null);

  useEffect(()=>{const r=()=>setProgress(DB.getProgress());window.addEventListener('sc_update',r);return()=>window.removeEventListener('sc_update',r);},[]);

  // Entrance: progress bar fill + stats cards stagger
  useLayoutEffect(()=>{
    if(!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-nd="header"]',{opacity:0,y:14,duration:0.45},0)
        .from('[data-nd="stat"]',{opacity:0,y:10,duration:0.35,stagger:0.05},0.2)
        .from('[data-nd="week-card"]',{opacity:0,y:10,duration:0.3,stagger:0.03},0.35);
    },rootRef);
    return()=>ctx.revert();
  },[]);

  const ninetyProg=progress.ninety_day||{};
  const completedWeeks=Object.keys(ninetyProg).filter(k=>ninetyProg[k]===true).length;
  const totalXPEarned=Object.entries(ninetyProg).filter(([k,v])=>v===true).reduce((sum,[k])=>{
    const w=NINETY_WEEKS.find(w=>w.week===parseInt(k));
    return sum+(w?w.dailyXP*6:0);
  },0);
  const overallPct=Math.round(completedWeeks/13*100);
  const currentWeekIdx=NINETY_WEEKS.findIndex(w=>!ninetyProg[w.week]);
  const currentWeek=currentWeekIdx>=0?NINETY_WEEKS[currentWeekIdx]:null;

  const markWeekComplete=(week)=>{
    const p=DB.getProgress();
    if(!p.ninety_day)p.ninety_day={};
    p.ninety_day[week.week]=true;
    DB.saveProgress(p);
    awardXP(week.dailyXP*6,week.dailyXP*0.5,'ninety_day');
    setProgress(DB.getProgress());
    if(week.week===13){fireConfetti();setTimeout(fireConfetti,400);setTimeout(fireConfetti,800);}
  };

  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'90-Day Program',subtitle:'The complete cricket transformation.',gradient:'linear-gradient(135deg,#1e3a8a,#6d28d9)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:20}},
      h('div',{'data-nd':'header',style:{padding:20,borderRadius:12,background:'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(30,58,138,0.1))',border:'1px solid rgba(109,40,217,0.3)'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
          h('div',null,
            h('div',{style:{fontSize:24,fontWeight:800,color:'#fff'}},'Week '+completedWeeks+' / 13'),
            h('div',{style:{fontSize:14,fontWeight:700,color:'#a78bfa',marginTop:2}},completedWeeks===13?'Program Complete! \uD83C\uDFC6':currentWeek?currentWeek.phase+' Phase':'Ready to start')
          ),
          h('div',{style:{textAlign:'right'}},
            h('div',{style:{fontSize:18,fontWeight:800,color:'#fff',fontVariantNumeric:'tabular-nums'}},totalXPEarned.toLocaleString()+' XP'),
            h('div',{style:{fontSize:12,color:'#6d28d9',marginTop:2}},'earned so far')
          )
        ),
        h('div',{style:{height:10,background:'rgba(51,65,85,0.6)',borderRadius:9999,overflow:'hidden',marginBottom:8}},
          h('div',{style:{width:overallPct+'%',height:'100%',background:'linear-gradient(to right,#6d28d9,#a78bfa)',borderRadius:9999,transition:'width .6s'}})
        ),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(13,1fr)',gap:4}},
          NINETY_WEEKS.map(w=>{
            const done=!!ninetyProg[w.week];
            const isCurrent=currentWeek&&currentWeek.week===w.week;
            return h('div',{key:w.week,style:{height:8,borderRadius:2,background:done?w.phaseColor:isCurrent?w.phaseColor+'55':'rgba(51,65,85,0.5)',transition:'background .3s',cursor:'pointer'},title:'Week '+w.week+': '+w.phase,onClick:()=>setExpandedWeek(expandedWeek===w.week?null:w.week)});
          })
        )
      ),
      h('div',{style:{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}},
        h(StatCard,{'data-nd':'stat',label:'Weeks Done',value:completedWeeks,color:'#a78bfa',icon:'calendar'}),
        h(StatCard,{'data-nd':'stat',label:'Program',value:overallPct+'%',color:'#4ade80',icon:'target'}),
        h(StatCard,{'data-nd':'stat',label:'XP Earned',value:totalXPEarned.toLocaleString(),color:'#fbbf24',icon:'zap'}),
        h(StatCard,{'data-nd':'stat',label:'Remaining',value:(13-completedWeeks)+' weeks',icon:'clock'})
      ),
      currentWeek&&!ninetyProg[currentWeek.week]&&h('div',{style:{padding:16,borderRadius:12,background:'rgba(109,40,217,0.12)',border:'1px solid rgba(109,40,217,0.3)'}},
        h('div',{style:{fontSize:11,fontWeight:800,color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6}},'Current Week'),
        h('div',{style:{fontSize:18,fontWeight:800,color:'#fff',marginBottom:4}},currentWeek.title),
        h('div',{style:{fontSize:13,color:'#6d28d9',marginBottom:16,lineHeight:1.5}},currentWeek.desc),
        h('button',{onClick:()=>markWeekComplete(currentWeek),style:{width:'100%',padding:'12px',background:'linear-gradient(135deg,#6d28d9,#4f46e5)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:14}},'Mark Week '+currentWeek.week+' Complete (+'+currentWeek.dailyXP*6+' XP)')
      ),
      h('div',null,
        h('h3',{style:{fontSize:13,fontWeight:700,color:'#8b949e',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},'13-Week Overview'),
        NINETY_PHASES.map(ph=>h('div',{key:ph.phase,style:{marginBottom:16}},
          h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:8}},
            h('div',{style:{width:10,height:10,borderRadius:'50%',background:ph.color}}),
            h('span',{style:{fontSize:12,fontWeight:800,color:ph.color,textTransform:'uppercase',letterSpacing:'0.08em'}},'Phase '+ph.phase+': '+ph.name+' (Weeks '+ph.weeks+')')
          ),
          h('p',{style:{fontSize:12,color:'#64748b',marginLeft:18,lineHeight:1.5,marginBottom:8}},ph.desc),
          h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
            NINETY_WEEKS.filter(w=>w.phase===ph.name).map(w=>{
              const isDone=!!ninetyProg[w.week];
              const isCurrent=currentWeek&&currentWeek.week===w.week;
              return h('button',{key:w.week,'data-nd':'week-card',onClick:()=>setExpandedWeek(expandedWeek===w.week?null:w.week),style:{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,textAlign:'left',background:isDone?'rgba(16,185,129,0.08)':isCurrent?ph.color+'15':'rgba(22,27,34,0.9)',border:'1px solid '+(isDone?'rgba(16,185,129,0.3)':isCurrent?ph.color+'44':'rgba(48,54,61,0.9)'),cursor:'pointer'}},
                h('div',{style:{width:28,height:28,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:isDone?'#10b981':isCurrent?ph.color:'rgba(48,54,61,0.6)'}},
                  isDone?h(Icon,{n:'check',cls:'w-3.5 h-3.5 text-white'}):h('span',{style:{fontSize:11,fontWeight:800,color:isCurrent?'#fff':'#484f58'}},String(w.week))
                ),
                h('div',{style:{flex:1,minWidth:0}},
                  h('div',{style:{fontSize:12,fontWeight:700,color:isDone?'#4ade80':isCurrent?'#fff':'#8b949e'}},w.title),
                  w.isDeload&&h('span',{style:{fontSize:10,fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.1)',padding:'2px 6px',borderRadius:4,marginTop:2,display:'inline-block'}},'DELOAD')
                ),
                !isDone&&!isCurrent&&h('button',{onClick:e=>{e.stopPropagation();markWeekComplete(w);},style:{flexShrink:0,padding:'5px 8px',background:'rgba(109,40,217,0.15)',border:'1px solid rgba(109,40,217,0.3)',borderRadius:6,color:'#a78bfa',fontSize:11,fontWeight:700,cursor:'pointer'}},'Done'),
                isCurrent&&h('span',{style:{flexShrink:0,fontSize:10,fontWeight:700,color:ph.color,background:ph.color+'15',padding:'3px 7px',borderRadius:5}},'CURRENT'),
                isDone&&h('span',{style:{flexShrink:0,fontSize:10,fontWeight:700,color:'#4ade80'}},'\u2713')
              );
            })
          )
        ))
      )
    )
  );
}
function SchedulePage(){
  const [weekStart,setWeekStart]=useState(()=>dateStr(getWeekMonday(new Date())));
  const [selectedDay,setSelectedDay]=useState(()=>new Date().toISOString().slice(0,10));
  const [schedule,setSchedule]=useState(()=>DB.getSchedule());
  const [showAdd,setShowAdd]=useState(false);
  const [addStep,setAddStep]=useState(0);
  const [addType,setAddType]=useState('');
  const [addPick,setAddPick]=useState(null);
  const [addTime,setAddTime]=useState('');
  const [addNote,setAddNote]=useState('');
  const [notif,setNotif]=useState('');
  const refresh=useCallback(()=>setSchedule(DB.getSchedule()),[]);

  // Stagger session cards when selected day or schedule changes
  useLayoutEffect(()=>{
    if(!cardsRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const cards=cardsRef.current.querySelectorAll('[data-sess-card]');
      if(cards.length) SCAnim.staggerCards(cards,{y:10,duration:0.32,stagger:0.05});
    },cardsRef);
    return()=>ctx.revert();
  },[selectedDay,schedule]);

  // Stagger week day pills when week changes
  useLayoutEffect(()=>{
    if(!weekRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const pills=weekRef.current.querySelectorAll('[data-day-pill]');
      if(pills.length) SCAnim.staggerCards(pills,{y:-6,duration:0.28,stagger:0.03,delay:0.1});
    },weekRef);
    return()=>ctx.revert();
  },[weekStart]);

  useEffect(()=>{window.addEventListener('sc_update',refresh);return()=>window.removeEventListener('sc_update',refresh);},[refresh]);
  function toast(msg){setNotif(msg);setTimeout(()=>setNotif(''),3000);}

  const monday=new Date(weekStart+'T00:00:00');
  const weekDays=Array.from({length:7},(_,i)=>{const d=addDays(monday,i);return{date:dateStr(d),label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i],num:d.getDate()};});
  const daySessions=(schedule.sessions||[]).filter(s=>s.date===selectedDay).sort((a,b)=>a.time.localeCompare(b.time));
  const weekSessions=DB.getSessionsForWeek(weekStart);
  const weekDoneCount=weekSessions.filter(s=>s.status==='complete').length;
  const weekXPLeft=weekSessions.filter(s=>s.status==='pending').reduce((a,s)=>a+s.xp_value,0);
  function dayCount(date){return(schedule.sessions||[]).filter(s=>s.date===date).length;}
  function dayDone(date){return(schedule.sessions||[]).filter(s=>s.date===date&&s.status==='complete').length;}
  function completeSession(id){
    const sess=(schedule.sessions||[]).find(s=>s.id===id);
    if(!sess||sess.status==='complete')return;
    DB.updateSession(id,{status:'complete'});
    awardXP(sess.xp_value,sess.duration_minutes||0,'schedule_'+sess.type);
    fireConfetti();refresh();toast('+'+sess.xp_value+' XP earned!');
  }
  function deleteSession(id){DB.deleteSession(id);refresh();toast('Session removed.');}
  function startSession(sess){
    if(sess.type==='drill'&&sess.ref_id)nav('DrillDetail',{id:sess.ref_id});
    else if(sess.type==='mental'&&sess.ref_id)nav('MentalPlayer',{id:sess.ref_id});
    else if(sess.type==='fitness'&&sess.ref_id)nav('WorkoutDetail',{id:sess.ref_id});
    else nav('Timer');
  }
  function saveNewSession(){
    const tc=SCHED_TYPES[addType]||SCHED_TYPES.custom;
    let title='Custom',refId=null,dur=30,xp=50;
    if(addPick){
      if(addType==='drill'){const d=DRILLS.find(x=>x.id===addPick);if(d){title=d.title;refId=d.id;dur=d.duration_minutes;xp=d.xp_value;}}
      else if(addType==='mental'){const m=MENTAL_SESSIONS.find(x=>x.id===addPick);if(m){title=m.title;refId=m.id;dur=Math.floor(m.duration_seconds/60);xp=m.xp_value;}}
      else if(addType==='fitness'){const w=WORKOUTS.find(x=>x.id===addPick);if(w){title=w.name;refId=w.id;dur=w.duration_minutes;xp=w.xp_value;}}
    } else if(addType==='match'){title='Match Day';dur=180;xp=200;}
    else if(addType==='rest'){title='Rest & Recovery';dur=0;xp=20;}
    DB.addSession({id:'sch_'+Date.now(),date:selectedDay,time:addTime||'',type:addType,title,ref_id:refId,duration_minutes:dur,xp_value:xp,status:'pending',notes:addNote,color:tc.color});
    refresh();setShowAdd(false);setAddStep(0);setAddType('');setAddPick(null);setAddTime('');setAddNote('');
    toast('Session added!');
  }

  if(showAdd) return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Add Session',subtitle:formatDate(selectedDay),gradient:'linear-gradient(135deg,#0f766e,#0d9488)',onBack:()=>{setShowAdd(false);setAddStep(0);setAddType('');setAddPick(null);}}),
    h('div',{style:{padding:'20px 16px'}},
      addStep===0&&h('div',null,
        h('h3',{style:{fontSize:16,fontWeight:800,color:'#fff',marginBottom:12}},'Session type?'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          Object.entries(SCHED_TYPES).map(([id,tc])=>h('button',{key:id,onClick:()=>{setAddType(id);setAddStep(id==='match'||id==='rest'||id==='custom'?2:1);},style:{display:'flex',alignItems:'center',gap:14,padding:'12px 14px',borderRadius:10,textAlign:'left',background:tc.bg,border:'1px solid '+tc.border,cursor:'pointer'}},
            h('div',{style:{width:40,height:40,borderRadius:8,background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},h(Icon,{n:tc.icon||'calendar',cls:'w-5 h-5',style:{color:tc.color}})),
            h('span',{style:{fontSize:13,fontWeight:700,color:'#fff'}},tc.label),
            h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#475569',marginLeft:'auto'}})
          ))
        )
      ),
      addStep===1&&h('div',null,
        h('h3',{style:{fontSize:16,fontWeight:800,color:'#fff',marginBottom:12}},addType==='drill'?'Choose a drill:':addType==='mental'?'Choose a session:':'Choose a workout:'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8,maxHeight:360,overflowY:'auto'}},
          (addType==='drill'?DRILLS:addType==='mental'?MENTAL_SESSIONS.filter(m=>!m.is_premium):WORKOUTS.slice(0,30)).map(item=>{
            const isM=addType==='mental';
            return h('button',{key:item.id,onClick:()=>{setAddPick(item.id);setAddStep(2);},style:{display:'flex',alignItems:'center',gap:12,padding:'12px',borderRadius:10,textAlign:'left',background:addPick===item.id?'rgba(15,118,110,0.2)':'rgba(22,27,34,0.9)',border:'1px solid '+(addPick===item.id?'rgba(13,148,136,0.5)':'rgba(48,54,61,0.9)'),cursor:'pointer'}},
              h('div',{style:{flex:1}},
                h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},isM?item.title:item.name||item.title),
                h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:4}},
                  h('span',{style:{fontSize:11,color:'#64748b'}},(isM?Math.floor(item.duration_seconds/60):item.duration_minutes)+' min'),
                  h(XPBadge,{xp:item.xp_value})
                )
              ),h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#475569'}})
            );
          })
        ),
        h('button',{onClick:()=>{setAddStep(0);setAddType('');},style:{display:'flex',alignItems:'center',gap:8,marginTop:16,fontSize:13,fontWeight:600,color:'#94a3b8',background:'none',border:'none',cursor:'pointer'}},h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back')
      ),
      addStep===2&&h('div',null,
        h('h3',{style:{fontSize:16,fontWeight:800,color:'#fff',marginBottom:16}},'Details'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:12}},
          h('div',null,
            h('label',{style:{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:8}},'Time (optional)'),
            h('input',{type:'time',value:addTime,onChange:e=>setAddTime(e.target.value),style:{width:'100%',padding:'10px 14px',borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3',fontSize:13,outline:'none',boxSizing:'border-box'}})
          ),
          h('div',null,
            h('label',{style:{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:8}},'Notes (optional)'),
            h('textarea',{placeholder:'Focus on...',value:addNote,onChange:e=>setAddNote(e.target.value),rows:3,style:{width:'100%',padding:'10px 14px',borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3',fontSize:13,outline:'none',resize:'none',boxSizing:'border-box'}})
          ),
          h('button',{onClick:saveNewSession,style:{width:'100%',padding:'12px',background:'linear-gradient(135deg,#0f766e,#0d9488)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8}},h(Icon,{n:'plus',cls:'w-5 h-5'}),'Add to Schedule'),
          h('button',{onClick:()=>setAddStep(addType==='drill'||addType==='mental'||addType==='fitness'?1:0),style:{textAlign:'center',fontSize:13,fontWeight:600,color:'#94a3b8',background:'none',border:'none',cursor:'pointer',padding:'8px 0'}},'Back')
        )
      )
    )
  );

  return h('div',{style:{paddingBottom:'6rem'}},
    h('div',{style:{background:'linear-gradient(135deg,#0f766e,#0d9488)',paddingTop:'max(4rem,env(safe-area-inset-top))',paddingBottom:'1.25rem',paddingLeft:'1.25rem',paddingRight:'1.25rem',position:'relative',overflow:'hidden'}},
      h('div',{style:{position:'absolute',top:'-40%',right:'-15%',width:220,height:220,background:'rgba(255,255,255,0.07)',borderRadius:'50%',pointerEvents:'none'}}),
      h('div',{style:{position:'relative',zIndex:1}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}},
          h('div',null,
            h('h1',{style:{fontSize:21,fontWeight:800,color:'#fff',margin:0}},'Schedule'),
            h('p',{style:{color:'rgba(255,255,255,0.65)',fontSize:13,margin:'2px 0 0'}},'Week of '+new Date(weekStart+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}))
          ),
          h('button',{onClick:()=>{setShowAdd(true);setAddStep(0);},style:{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:10,fontSize:12,fontWeight:700,color:'#fff',background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer'}},h(Icon,{n:'plus',cls:'w-4 h-4'}),'Add')
        ),
        h('div',{style:{display:'flex',alignItems:'center',gap:8}},
          h('button',{onClick:()=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()-7);setWeekStart(dateStr(d));},style:{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}},h(Icon,{n:'arrowL',cls:'w-4 h-4'})),
          h('div',{ref:weekRef,style:{display:'flex',gap:6,flex:1,overflowX:'auto',scrollbarWidth:'none'}},
            weekDays.map(d=>{
              const iT=isToday(d.date),iSel=d.date===selectedDay;
              const cnt=dayCount(d.date),dc=dayDone(d.date);
              return h('button',{key:d.date,'data-day-pill':'',onClick:()=>setSelectedDay(d.date),style:{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 10px',borderRadius:10,minWidth:40,background:iSel?'rgba(255,255,255,0.2)':iT?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',border:iT?'2px solid rgba(255,255,255,0.4)':'2px solid transparent',cursor:'pointer'}},
                h('span',{style:{fontSize:10,fontWeight:700,color:iSel||iT?'#fff':'rgba(255,255,255,0.6)'}},d.label),
                h('span',{style:{fontSize:'1.1rem',fontWeight:900,color:'#fff',margin:'1px 0'}},d.num),
                cnt>0?h('div',{style:{display:'flex',gap:2}},Array.from({length:Math.min(cnt,3)}).map((_,i)=>h('div',{key:i,style:{width:5,height:5,borderRadius:'50%',background:i<dc?'#a7f3d0':'rgba(255,255,255,0.5)'}})))
                  :h('div',{style:{width:5,height:5}})
              );
            })
          ),
          h('button',{onClick:()=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()+7);setWeekStart(dateStr(d));},style:{width:34,height:34,borderRadius:10,background:'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',flexShrink:0}},h(Icon,{n:'chevR',cls:'w-4 h-4'}))
        )
      )
    ),
    notif&&h('div',{style:{margin:'12px 16px 0',padding:'12px 16px',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:12,fontSize:14,fontWeight:700,color:'#34d399'}},notif),
    h('div',{style:{padding:'16px 16px 0'}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}},
        h('div',null,
          h('h2',{style:{fontSize:16,fontWeight:800,color:'#fff',margin:0}},isToday(selectedDay)?'Today':formatDate(selectedDay)),
          h('p',{style:{fontSize:12,color:'#64748b',marginTop:2}},daySessions.length===0?'No sessions planned':daySessions.length+' session'+(daySessions.length!==1?'s':'')+' \u00b7 '+daySessions.reduce((s,x)=>s+x.xp_value,0)+' XP')
        ),
        h('button',{onClick:()=>{setShowAdd(true);setAddStep(0);},style:{display:'flex',alignItems:'center',gap:6,padding:'8px 12px',borderRadius:10,fontSize:12,fontWeight:700,color:'#fff',background:'linear-gradient(135deg,#0f766e,#0d9488)',border:'none',cursor:'pointer'}},h(Icon,{n:'plus',cls:'w-4 h-4'}),'Add')
      ),
      daySessions.length===0
        ?h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',padding:'2.5rem 1rem',textAlign:'center',border:'2px dashed rgba(51,65,85,0.5)',borderRadius:12}},
          h(Icon,{n:'calendar',cls:'w-10 h-10',style:{color:'#484f58'}}),
          h('div',{style:{fontWeight:700,color:'#fff',fontSize:14,margin:'12px 0 4px'}},'No sessions planned'),
          h('div',{style:{fontSize:12,color:'#64748b',marginBottom:16}},'Add a session to get started'),
          h('button',{onClick:()=>{setShowAdd(true);setAddStep(0);},style:{display:'flex',alignItems:'center',gap:6,padding:'10px 20px',background:'linear-gradient(135deg,#0f766e,#0d9488)',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:13}},h(Icon,{n:'plus',cls:'w-4 h-4'}),' Add Session')
        )
        :h('div',{style:{display:'flex',flexDirection:'column',gap:12}},
          daySessions.map(s=>{
            const tc=SCHED_TYPES[s.type]||SCHED_TYPES.custom;
            const isDone=s.status==='complete',isSkipped=s.status==='skipped';
            return h('div',{key:s.id,'data-sess-card':'',style:{borderRadius:12,overflow:'hidden',background:isDone?'rgba(16,185,129,0.06)':isSkipped?'rgba(30,41,59,0.3)':tc.bg,border:'1px solid '+(isDone?'rgba(16,185,129,0.3)':isSkipped?'rgba(51,65,85,0.3)':tc.border),opacity:isSkipped?0.6:1}},
              h('div',{style:{height:4,background:isDone?'#10b981':isSkipped?'#475569':tc.color}}),
              h('div',{style:{padding:16}},
                h('div',{style:{display:'flex',alignItems:'flex-start',gap:12}},
                  h('div',{style:{width:44,height:44,borderRadius:12,background:isDone?'rgba(16,185,129,0.15)':'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                    isDone?h(Icon,{n:'check',cls:'w-5 h-5 text-white'}):h(Icon,{n:tc.icon||'calendar',cls:'w-5 h-5',style:{color:tc.color}})
                  ),
                  h('div',{style:{flex:1,minWidth:0}},
                    h('h3',{style:{fontSize:15,fontWeight:800,color:isSkipped?'#64748b':'#e6edf3',lineHeight:1.3,margin:0}},s.title),
                    h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:6,flexWrap:'wrap'}},
                      s.time&&h('span',{style:{fontSize:12,color:'#94a3b8',fontWeight:600}},s.time),
                      s.duration_minutes>0&&h('span',{style:{fontSize:12,color:'#94a3b8'}},s.duration_minutes+' min'),
                      !isDone&&h(XPBadge,{xp:s.xp_value})
                    )
                  )
                ),
                !isSkipped&&h('div',{style:{display:'flex',gap:8,marginTop:12}},
                  !isDone&&h('button',{onClick:()=>startSession(s),style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:10,borderRadius:10,fontSize:13,fontWeight:700,color:'#fff',background:tc.color+'33',border:'1px solid '+tc.color+'60',cursor:'pointer'}},h(Icon,{n:'play',cls:'w-4 h-4'}),'Start'),
                  !isDone&&h('button',{onClick:()=>completeSession(s.id),style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:10,borderRadius:10,fontSize:13,fontWeight:700,color:'#34d399',background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',cursor:'pointer'}},h(Icon,{n:'check',cls:'w-4 h-4'}),'Done'),
                  isDone&&h('button',{onClick:()=>{DB.updateSession(s.id,{status:'pending'});refresh();},style:{padding:'10px 12px',borderRadius:10,fontSize:12,fontWeight:700,color:'#94a3b8',background:'rgba(30,41,59,0.5)',border:'1px solid rgba(51,65,85,0.4)',cursor:'pointer'}},'Undo'),
                  !isDone&&h('button',{onClick:()=>{DB.updateSession(s.id,{status:'skipped'});refresh();},style:{padding:'10px 12px',borderRadius:10,fontSize:12,color:'#94a3b8',background:'rgba(30,41,59,0.5)',border:'1px solid rgba(51,65,85,0.4)',cursor:'pointer'}},'Skip'),
                  h('button',{onClick:()=>deleteSession(s.id),style:{padding:'10px 12px',borderRadius:10,color:'#f87171',background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',cursor:'pointer'}},h(Icon,{n:'trash',cls:'w-4 h-4'}))
                )
              )
            );
          })
        ),
      h('div',{style:{marginTop:16,padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 12px'}},'This Week'),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,textAlign:'center'}},
          h('div',null,h('div',{style:{fontSize:21,fontWeight:800,color:'#fff'}},weekSessions.length),h('div',{style:{fontSize:11,color:'#64748b',fontWeight:700}},'Sessions')),
          h('div',null,h('div',{style:{fontSize:21,fontWeight:800,color:'#34d399'}},weekDoneCount),h('div',{style:{fontSize:11,color:'#64748b',fontWeight:700}},'Done')),
          h('div',null,h('div',{style:{fontSize:21,fontWeight:800,color:'#f59e0b'}},weekXPLeft),h('div',{style:{fontSize:11,color:'#64748b',fontWeight:700}},'XP Left'))
        )
      )
    )
  );
}

// ================================================================
// SKILL PATHS PAGE
// ================================================================
function WeekAccordion({week,pathAccent}){
  const [open,setOpen]=useState(week.week===1);
  return h('div',{style:{borderRadius:12,overflow:'hidden',border:'1px solid rgba(51,65,85,0.5)'}},
    h('button',{onClick:()=>setOpen(o=>!o),style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:16,textAlign:'left',background:'rgba(22,27,34,0.9)',border:'none',cursor:'pointer'}},
      h('div',null,
        h('div',{style:{fontWeight:700,color:'#e6edf3',fontSize:14}},week.theme),
        h('div',{style:{fontSize:12,color:'#64748b',marginTop:2}},week.days.filter(d=>!d.isRest).length+' training days')
      ),
      h(Icon,{n:open?'chevU':'chevD',cls:'w-5 h-5',style:{color:'#64748b'}})
    ),
    open&&h('div',{style:{background:'rgba(15,23,42,0.4)',borderTop:'1px solid rgba(51,65,85,0.4)'}},
      week.days.map(day=>h('div',{key:day.day,style:{padding:'12px 16px',borderBottom:'1px solid rgba(51,65,85,0.2)'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
          h('span',{style:{fontSize:14,fontWeight:800,color:'#e6edf3'}},day.label),
          day.isRest?h('span',{style:{fontSize:11,color:'#484f58'}},'Rest'):h('span',{style:{fontSize:11,fontWeight:800,color:pathAccent}},'+'+day.totalXP+' XP')
        ),
        !day.isRest&&h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
          day.activities.map((act,i)=>h('div',{key:i,style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:act.type==='drill'?'bat':act.type==='mental'?'brain':'dumbbell',cls:'w-3.5 h-3.5',style:{color:'#484f58',flexShrink:0}}),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:12,fontWeight:700,color:'#cbd5e1'}},act.title),
              h('div',{style:{fontSize:11,color:'#64748b'}},act.duration+' \u00b7 +'+act.xp+' XP')
            )
          ))
        )
      ))
    )
  );
}

function SkillPathsPage(){
  const [pathId,setPathId]=useState(null);
  const [levelId,setLevelId]=useState(null);
  const [weekPlan,setWeekPlan]=useState(null);
  const [progress,setProgress]=useState(()=>DB.getProgress());
  useEffect(()=>{const r=()=>setProgress(DB.getProgress());window.addEventListener('sc_update',r);return()=>window.removeEventListener('sc_update',r);},[]);
  const skillProg=progress.skill_path_progress||{};

  function importToSchedule(plan){
    const monday=getWeekMonday(new Date());let added=0;
    plan.forEach(week=>{
      if(week.week!==1)return;
      week.days.forEach(day=>{
        if(day.isRest)return;
        const d=addDays(monday,day.day-1),ds=dateStr(d);
        day.activities.forEach((act,i)=>{
          DB.addSession({id:'sch_'+Date.now()+'_'+day.day+'_'+i,date:ds,time:i===0?'07:00':i===1?'17:00':'19:00',type:act.type,title:act.title,ref_id:act.id||null,duration_minutes:parseInt(act.duration)||20,xp_value:act.xp,status:'pending',notes:'From Skill Path',color:(SCHED_TYPES[act.type]&&SCHED_TYPES[act.type].color)||'#64748b'});
          added++;
        });
      });
    });
    window.dispatchEvent(new CustomEvent('sc_update'));
    alert(added+' sessions imported to this week\'s schedule!');
  }

  // Stagger path cards on mount; draw rings after stagger
  useLayoutEffect(()=>{
    if(!listRef.current||!SCAnim.ready||pathId)return;
    if(SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const cards=listRef.current.querySelectorAll('[data-path-card]');
      SCAnim.staggerCards(cards,{y:16,duration:0.4,stagger:0.06,delay:0.1});
      cards.forEach((card,i)=>{
        const ring=card.querySelector('[data-ring-fill]');
        if(ring){
          const pp=(progress.skill_path_progress||{})[SKILL_PATHS[i]?.id]||{};
          const doneCount=Object.values(pp).filter(Boolean).length;
          const pct=doneCount/(SKILL_PATHS[i]?.levels.length||4);
          SCAnim.drawRing(ring,0,pct,{duration:1.1,delay:0.3+i*0.08});
        }
      });
    },listRef);
    return()=>ctx.revert();
  },[pathId]);

  if(!pathId) return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Skill Paths',subtitle:'Structured programs for every discipline',gradient:'linear-gradient(135deg,#7e22ce,#4f46e5)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}},
      SKILL_PATHS.map(path=>{
        const pp=skillProg[path.id]||{};
        const doneCount=Object.values(pp).filter(Boolean).length;
        const pct=doneCount/path.levels.length*100;
        return h('button',{key:path.id,'data-path-card':'',onClick:()=>{setPathId(path.id);setLevelId(null);setWeekPlan(null);},style:{width:'100%',textAlign:'left',padding:20,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid '+path.accent+'30',cursor:'pointer',transition:'all 0.12s'}},
          h('div',{style:{height:3,background:'linear-gradient(to right,'+path.accent+',transparent)',marginBottom:16,borderRadius:2}}),
          h('div',{style:{display:'flex',alignItems:'center',gap:16}},
            h('div',{style:{width:52,height:52,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:path.accent+'22'}},h(Icon,{n:path.icon||'bat',cls:'w-7 h-7',style:{color:path.accent}})),
            h('div',{style:{flex:1}},
              h('h3',{style:{fontSize:16,fontWeight:800,color:'#e6edf3',margin:0}},path.title),
              h('p',{style:{fontSize:12,color:'#64748b',marginTop:4,marginBottom:8,lineHeight:1.5}},path.desc),
              h('div',{style:{display:'flex',alignItems:'center',gap:12}},
                h('div',{style:{flex:1,height:6,borderRadius:9999,background:'rgba(51,65,85,0.6)',overflow:'hidden'}},
                  h('div',{style:{width:pct+'%',height:'100%',background:path.accent,borderRadius:9999,transition:'width .6s'}})
                ),
                h('span',{style:{fontSize:11,fontWeight:800,color:path.accent}},doneCount+'/'+path.levels.length)
              )
            )
          )
        );
      })
    )
  );

  const path=SKILL_PATHS.find(p=>p.id===pathId);
  if(!path)return null;
  const grad='linear-gradient(135deg,'+path.accent+','+path.accent+'88)';

  if(!levelId) return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:path.title,subtitle:path.desc,gradient:grad,onBack:()=>setPathId(null)}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:12}},
      path.levels.map((lv,i)=>{
        const pp=skillProg[path.id]||{};
        const unlocked=i===0||(pp[path.levels[i-1].id]);
        const isDone=pp[lv.id];
        return h('button',{key:lv.id,onClick:()=>{if(!unlocked)return;setLevelId(lv.id);setWeekPlan(generateWeekPlan(path.id,lv.id));},style:{width:'100%',textAlign:'left',padding:20,borderRadius:12,background:isDone?'rgba(16,185,129,0.08)':unlocked?'rgba(22,27,34,0.9)':'rgba(15,23,42,0.5)',border:'2px solid '+(isDone?'rgba(16,185,129,0.4)':unlocked?path.accent+'40':'rgba(51,65,85,0.3)'),opacity:unlocked?1:0.5,cursor:unlocked?'pointer':'not-allowed',transition:'all 0.12s'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:16}},
            h('div',{style:{width:52,height:52,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:isDone?'#10b981':unlocked?path.accent:'rgba(51,65,85,0.5)'}},
              isDone?h(Icon,{n:'check',cls:'w-6 h-6 text-white'}):h(Icon,{n:lv.icon||'bat',cls:'w-6 h-6 text-white'})
            ),
            h('div',{style:{flex:1}},
              h('div',{style:{display:'flex',alignItems:'center',gap:8}},
                h('h3',{style:{fontSize:15,fontWeight:800,color:'#e6edf3',margin:0}},lv.label),
                !unlocked&&h(Icon,{n:'lock',cls:'w-3 h-3',style:{color:'#484f58'}}),
                isDone&&h('span',{style:{fontSize:11,fontWeight:700,color:'#4ade80'}},'Complete')
              ),
              h('p',{style:{fontSize:12,color:'#64748b',marginTop:4,lineHeight:1.5}},lv.desc),
              h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:8}},
                h('span',{style:{fontSize:12,fontWeight:800,color:path.accent}},'+'+lv.xpPerDay+' XP/day'),
                h('span',{style:{fontSize:12,color:'#475569'}},'· 5-week program')
              )
            )
          )
        );
      })
    )
  );

  const lv=path.levels.find(l=>l.id===levelId);
  if(!lv||!weekPlan)return null;
  return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:lv.label,subtitle:path.title,gradient:grad,onBack:()=>setLevelId(null)}),
    h('div',{style:{padding:'20px 16px'}},
      h('div',{style:{display:'flex',gap:8,marginBottom:20}},
        h('button',{onClick:()=>importToSchedule(weekPlan),style:{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:12,borderRadius:10,fontSize:13,fontWeight:700,color:'#fff',background:'linear-gradient(135deg,#0f766e,#0d9488)',border:'none',cursor:'pointer'}},h(Icon,{n:'calendar',cls:'w-4 h-4'}),'Import to Schedule'),
        h('button',{onClick:()=>{const p=DB.getProgress();if(!p.skill_path_progress)p.skill_path_progress={};if(!p.skill_path_progress[path.id])p.skill_path_progress[path.id]={};p.skill_path_progress[path.id][levelId]=true;DB.saveProgress(p);awardXP(lv.xpPerDay*5,30,'skill_path');setLevelId(null);},style:{display:'flex',alignItems:'center',gap:6,padding:'12px 16px',borderRadius:10,fontSize:13,fontWeight:700,color:'#94a3b8',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',cursor:'pointer'}},h(Icon,{n:'check',cls:'w-4 h-4'}),'Mark Done')
      ),
      h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
        weekPlan.map(week=>h(WeekAccordion,{key:week.week,week,pathAccent:path.accent}))
      )
    )
  );
}

// ================================================================
// PROGRESS PAGE
// ================================================================
function ProgressPage(){
  const [progress,setProgress]=useState(()=>DB.getProgress());
  const [xpDays,setXpDays]=useState(()=>DB.getXPLast7Days());
  const [hmap,setHmap]=useState(()=>DB.getActivityHeatmap());
  const rootRef=useRef(null);
  const xpNumRef=useRef(null);
  const barRef=useRef(null);
  const levelCardRef=useRef(null);
  const refresh=useCallback(()=>{setProgress(DB.getProgress());setXpDays(DB.getXPLast7Days());setHmap(DB.getActivityHeatmap());},[]);
  useEffect(()=>{window.addEventListener('sc_update',refresh);window.addEventListener('focus',refresh);return()=>{window.removeEventListener('sc_update',refresh);window.removeEventListener('focus',refresh);};},[refresh]);
  const info=getLevelInfo(progress.total_xp||0);

  // Full ScrollTrigger animation setup
  useLayoutEffect(()=>{
    if(!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const p=DB.getProgress();
    const inf=getLevelInfo(p.total_xp||0);
    const ctx=gsap.context(()=>{
      // Level card entrance + count-up
      const tl=gsap.timeline({defaults:{ease:'power2.out'}});
      tl.from('[data-prog="level-card"]',{opacity:0,y:14,duration:0.45},0);
      if(xpNumRef.current){
        const obj={val:0};
        tl.to(obj,{val:p.total_xp||0,duration:0.9,onUpdate:()=>{if(xpNumRef.current)xpNumRef.current.textContent=Math.round(obj.val).toLocaleString()+' XP';},},0.1);
      }
      if(barRef.current){
        tl.fromTo(barRef.current,{width:'0%'},{width:inf.pct+'%',duration:1.1,ease:'power3.out'},0.15);
      }
      // ScrollTrigger: stats grid
      if(typeof ScrollTrigger!=='undefined'){
        const statsGrid=rootRef.current.querySelector('[data-prog="stats-grid"]');
        if(statsGrid){
          gsap.from(statsGrid.querySelectorAll('[data-gsap-stat]'),{opacity:0,y:14,duration:0.35,stagger:0.05,ease:'power2.out',scrollTrigger:{trigger:statsGrid,start:'top 88%',once:true}});
        }
        const chart=rootRef.current.querySelector('[data-prog="chart"]');
        if(chart){
          gsap.from(chart.querySelectorAll('[data-bar]'),{scaleY:0,transformOrigin:'bottom',duration:0.5,stagger:0.04,ease:'power2.out',scrollTrigger:{trigger:chart,start:'top 88%',once:true}});
        }
        const heatmap=rootRef.current.querySelector('[data-prog="heatmap"]');
        if(heatmap){
          gsap.from(heatmap.querySelectorAll('.heatmap-cell'),{opacity:0,scale:0,duration:0.25,stagger:{amount:0.6,from:'start'},ease:'power2.out',scrollTrigger:{trigger:heatmap,start:'top 88%',once:true}});
        }
        const badgesGrid=rootRef.current.querySelector('[data-prog="badges"]');
        if(badgesGrid){
          gsap.from(badgesGrid.querySelectorAll('[data-badge]'),{opacity:0,scale:0.7,duration:0.3,stagger:0.03,ease:'back.out(1.5)',scrollTrigger:{trigger:badgesGrid,start:'top 88%',once:true}});
        }
      }
    },rootRef);
    return()=>ctx.revert();
  },[]);

  const badges=progress.badges||[];
  const max7=Math.max(...xpDays.map(d=>d.xp),1);
  const HEAT_COLORS=['rgba(22,27,34,0.9)','rgba(22,163,74,0.2)','rgba(22,163,74,0.45)','rgba(22,163,74,0.7)','#16a34a'];
  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'My Progress',subtitle:'Your complete training stats',gradient:'linear-gradient(135deg,#064e3b,#065f46)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:20}},
      h('div',{'data-prog':'level-card',style:{padding:20,borderRadius:12,background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(13,148,136,0.06))',border:'1px solid rgba(16,185,129,0.3)'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}},
          h('div',null,h('div',{style:{fontSize:24,fontWeight:800,color:'#fff'}},'Level '+info.level),h('div',{style:{color:'#34d399',fontWeight:700,fontSize:14,marginTop:2}},info.name)),
          h('div',{style:{textAlign:'right'}},
            h('div',{ref:xpNumRef,style:{fontSize:20,fontWeight:800,color:'#fff',fontVariantNumeric:'tabular-nums'}},(progress.total_xp||0).toLocaleString()+' XP'),
            info.next&&h('div',{style:{fontSize:12,color:'#64748b',marginTop:2}},info.xpToNext.toLocaleString()+' to next level')
          )
        ),
        h(LevelBar,{totalXP:progress.total_xp||0})
      ),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},
        [{label:'Drills Done',val:progress.drills_done||0,color:'#60a5fa',icon:'target'},
         {label:'Mental Sessions',val:progress.mental_done||0,color:'#a78bfa',icon:'brain'},
         {label:'Workouts',val:progress.workouts_done||0,color:'#fb923c',icon:'dumbbell'},
         {label:'Practice Mins',val:progress.practice_minutes||0,color:'#2dd4bf',icon:'clock'},
         {label:'Best Streak',val:(progress.longest_streak||0)+'d',color:'#f87171',icon:'flame'},
         {label:'Total XP',val:(progress.total_xp||0).toLocaleString(),color:'#4ade80',icon:'zap'},
        ].map(s=>h(StatCard,{key:s.label,label:s.label,value:String(s.val),color:s.color,icon:s.icon}))
      ),
      h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          h('span',{style:{fontSize:14,fontWeight:700,color:'#e6edf3'}},'7-Day XP'),
          h('span',{style:{fontSize:12,fontWeight:700,color:'#34d399'}},xpDays.reduce((s,d)=>s+d.xp,0)+' total')
        ),
        h('div',{style:{display:'flex',alignItems:'flex-end',gap:6,height:80}},
          xpDays.map(d=>h('div',{key:d.date,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}},
            h('div',{style:{width:'100%',height:Math.max(3,(d.xp/max7)*72)+'px',background:d.xp>0?'linear-gradient(to top,#059669,#34d399)':'rgba(30,41,59,0.6)',borderRadius:'3px 3px 0 0'},title:d.xp+' XP'}),
            h('span',{style:{fontSize:10,color:'#484f58',fontWeight:600}},d.label)
          ))
        )
      ),
      h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('p',{style:{fontSize:14,fontWeight:700,color:'#e6edf3',margin:'0 0 12px'}},'30-Day Activity'),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:5}},
          hmap.map((d,i)=>h('div',{key:i,style:{aspectRatio:'1',borderRadius:4,background:HEAT_COLORS[d.level],cursor:d.xp>0?'default':'default'},title:d.date+(d.xp>0?' · '+d.xp+' XP':'')}))
        )
      ),
      badges.length>0&&h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('p',{style:{fontSize:14,fontWeight:700,color:'#e6edf3',margin:'0 0 12px'}},'Badges Earned ('+badges.length+')'),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}},
          badges.map(id=>{
            const bd=BADGE_DEFS[id];if(!bd)return null;
            return h('div',{key:id,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:4,padding:'10px 6px',borderRadius:8,background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)',textAlign:'center'},title:bd.desc},
              h('div',{style:{width:32,height:32,borderRadius:8,background:'linear-gradient(135deg,#d97706,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center'}},h(Icon,{n:bd.icon,cls:'w-4 h-4 text-white'})),
              h('span',{style:{fontSize:9,fontWeight:700,color:'#94a3b8',lineHeight:1.3}},bd.label)
            );
          })
        )
      ),
      badges.length===0&&h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',textAlign:'center'}},
        h(Icon,{n:'award',cls:'w-8 h-8',style:{color:'#484f58',margin:'0 auto 8px'}}),
        h('p',{style:{fontSize:13,color:'#484f58',margin:0}},'Complete activities to earn badges!')
      )
    )
  );
}

// ================================================================
// PROFILE PAGE
// ================================================================
function ProfilePage(){
  const [user,setUser]=useState(()=>DB.getUser());
  const [editing,setEditing]=useState(false);
  const rootRef=useRef(null);
  useLayoutEffect(()=>{
    if(!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      gsap.from('[data-prof-item]',{opacity:0,y:12,duration:0.35,stagger:0.06,ease:'power2.out',delay:0.1});
    },rootRef);
    return()=>ctx.revert();
  },[]);
  const [form,setForm]=useState({name:'',role:'',club:'',age:''});
  const progress=DB.getProgress();
  const info=getLevelInfo(progress.total_xp||0);
  const startEdit=()=>{setForm({name:user.name||'',role:user.role||'',club:user.club||'',age:user.age||''});setEditing(true);};
  const save=()=>{const u={...user,...form};DB.setUser(u);setUser(u);setEditing(false);};
  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'My Profile',subtitle:'Your cricket identity',gradient:'linear-gradient(135deg,#0f172a,#1e293b)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:20}},
      h('div',{'data-prof-item':'',style:{display:'flex',flexDirection:'column',alignItems:'center',padding:'24px 20px',borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',textAlign:'center'}},
        h('div',{style:{width:72,height:72,borderRadius:18,background:'linear-gradient(135deg,#16a34a,#059669)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
          h(Icon,{n:'user',cls:'w-9 h-9 text-white'})
        ),
        h('h2',{style:{fontSize:20,fontWeight:800,color:'#e6edf3',margin:0}},user.name||'Set your name'),
        h('p',{style:{color:'#484f58',fontSize:13,marginTop:4,marginBottom:8}},user.role||'Cricketer'),
        h('div',{style:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',justifyContent:'center'}},
          h('span',{style:{fontSize:12,fontWeight:700,color:'#4ade80',background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.25)',padding:'4px 10px',borderRadius:6}},'Lv.'+info.level+' '+info.name),
          h(XPBadge,{xp:progress.total_xp||0})
        )
      ),
      editing?h('div',{style:{padding:20,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('h3',{style:{fontSize:15,fontWeight:700,color:'#e6edf3',margin:'0 0 16px'}},'Edit Profile'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:12}},
          [['name','Name','Virat Kohli'],['role','Role/Position','Batting All-Rounder'],['club','Club/Team','Core Cricket Academy'],['age','Age','']].map(([key,label,ph])=>
            h('div',{key:key},
              h('label',{style:{fontSize:11,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',display:'block',marginBottom:6}},label),
              h('input',{type:'text',placeholder:ph,value:form[key],onChange:e=>setForm(f=>({...f,[key]:e.target.value})),style:{width:'100%',padding:'10px 14px',borderRadius:10,background:'rgba(15,23,42,0.6)',border:'1px solid rgba(51,65,85,0.6)',color:'#e6edf3',fontSize:13,outline:'none',boxSizing:'border-box'}})
            )
          ),
          h('div',{style:{display:'flex',gap:10,marginTop:4}},
            h('button',{onClick:save,style:{flex:1,padding:'12px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Save'),
            h('button',{onClick:()=>setEditing(false),style:{flex:1,padding:'12px',background:'rgba(30,41,59,0.6)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.5)',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Cancel')
          )
        )
      ):h('button',{onClick:startEdit,style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,color:'#8b949e',fontSize:13,fontWeight:700,cursor:'pointer'}},h(Icon,{n:'pencil',cls:'w-4 h-4'}),'Edit Profile'),
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}},
        h(StatCard,{label:'Level',value:String(info.level),color:'#4ade80',icon:'crown'}),
        h(StatCard,{label:'Streak',value:(progress.current_streak||0)+'d',color:'#fb923c',icon:'flame'}),
        h(StatCard,{label:'Badges',value:String((progress.badges||[]).length),color:'#fbbf24',icon:'award'}),
        h(StatCard,{label:'Total XP',value:(progress.total_xp||0).toLocaleString(),color:'#4ade80',icon:'zap'})
      )
    )
  );
}

// ================================================================
// GOALS PAGE
// ================================================================
function GoalsPage(){
  const [goals,setGoals]=useState(()=>DB.getGoals());
  const listRef=useRef(null);
  useLayoutEffect(()=>{
    if(!listRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      const cards=listRef.current.querySelectorAll('[data-goal-card]');
      if(cards.length) SCAnim.staggerCards(cards,{y:10,duration:0.3,stagger:0.05});
    },listRef);
    return()=>ctx.revert();
  },[goals.length]);
  const [newGoal,setNewGoal]=useState('');
  const [adding,setAdding]=useState(false);
  const addGoal=()=>{
    if(!newGoal.trim())return;
    const g=[...goals,{id:Date.now(),text:newGoal.trim(),done:false,created:new Date().toISOString().slice(0,10)}];
    DB.saveGoals(g);setGoals(g);setNewGoal('');setAdding(false);
  };
  const toggleGoal=(id)=>{
    const g=goals.map(gl=>gl.id===id?{...gl,done:!gl.done}:gl);
    DB.saveGoals(g);setGoals(g);
    if(goals.find(gl=>gl.id===id)&&!goals.find(gl=>gl.id===id).done)awardXP(25,0,'goal_complete');
  };
  const deleteGoal=(id)=>{const g=goals.filter(gl=>gl.id!==id);DB.saveGoals(g);setGoals(g);};
  const active=goals.filter(g=>!g.done);const done=goals.filter(g=>g.done);
  return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Goals',subtitle:'Set targets. Hit them. Repeat.',gradient:'linear-gradient(135deg,#0c4a6e,#0369a1)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}},
      adding?h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(59,130,246,0.4)'}},
        h('textarea',{autoFocus:true,placeholder:'e.g. Score 50+ in next club match...',value:newGoal,onChange:e=>setNewGoal(e.target.value),rows:3,style:{width:'100%',padding:'10px 14px',borderRadius:10,background:'rgba(15,23,42,0.6)',border:'1px solid rgba(51,65,85,0.6)',color:'#e6edf3',fontSize:13,outline:'none',resize:'none',boxSizing:'border-box',marginBottom:12}}),
        h('div',{style:{display:'flex',gap:10}},
          h('button',{onClick:addGoal,style:{flex:1,padding:'10px',background:'#059669',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Add Goal'),
          h('button',{onClick:()=>{setAdding(false);setNewGoal('');},style:{flex:1,padding:'10px',background:'rgba(30,41,59,0.6)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.5)',borderRadius:10,fontWeight:700,cursor:'pointer'}},'Cancel')
        )
      ):h('button',{onClick:()=>setAdding(true),style:{width:'100%',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',background:'rgba(22,27,34,0.9)',border:'2px dashed rgba(59,130,246,0.4)',borderRadius:12,color:'#60a5fa',fontSize:13,fontWeight:700,cursor:'pointer'}},h(Icon,{n:'plus',cls:'w-4 h-4'}),'Add New Goal'),
      active.length>0&&h('div',null,
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},'Active Goals ('+active.length+')'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:10}},
          active.map(g=>h('div',{key:g.id,style:{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
            h('button',{onClick:()=>toggleGoal(g.id),style:{width:22,height:22,borderRadius:6,border:'2px solid rgba(22,163,74,0.5)',background:'transparent',cursor:'pointer',flexShrink:0,marginTop:2}}),
            h('p',{style:{flex:1,margin:0,fontSize:13,color:'#e6edf3',lineHeight:1.5}},g.text),
            h('button',{onClick:()=>deleteGoal(g.id),style:{background:'none',border:'none',cursor:'pointer',color:'#484f58',flexShrink:0}},h(Icon,{n:'trash',cls:'w-3.5 h-3.5'}))
          ))
        )
      ),
      done.length>0&&h('div',null,
        h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},'Achieved ('+done.length+')'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          done.map(g=>h('div',{key:g.id,style:{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:'rgba(16,185,129,0.06)',border:'1px solid rgba(16,185,129,0.2)',opacity:0.8}},
            h('div',{style:{width:22,height:22,borderRadius:6,background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},h(Icon,{n:'check',cls:'w-3 h-3 text-white'})),
            h('p',{style:{flex:1,margin:0,fontSize:13,color:'#64748b',textDecoration:'line-through'}},g.text),
            h('button',{onClick:()=>deleteGoal(g.id),style:{background:'none',border:'none',cursor:'pointer',color:'#484f58',flexShrink:0}},h(Icon,{n:'trash',cls:'w-3.5 h-3.5'}))
          ))
        )
      ),
      goals.length===0&&h(EmptyState,{icon:'target',title:'No goals yet',desc:'Set your first cricket goal to get started.',action:{label:'Add Goal',fn:()=>setAdding(true)}})
    )
  );
}

// ================================================================
// LEADERBOARD PAGE
// ================================================================
function LeaderboardPage(){
  const rootRef=useRef(null);
  const progress=DB.getProgress();
  useLayoutEffect(()=>{
    if(!rootRef.current||!SCAnim.ready||SCAnim.reducedMotion)return;
    const ctx=gsap.context(()=>{
      SCAnim.staggerCards(rootRef.current.querySelectorAll('[data-lb-card]'),{y:8,duration:0.3,stagger:0.04});
    },rootRef);
    return()=>ctx.revert();
  },[]);
  const info=getLevelInfo(progress.total_xp||0);
  const mockboard=[
    {rank:1,name:'Rahul S.',xp:12450,level:6,streak:21,badge:'🏆'},
    {rank:2,name:'Priya K.',xp:9820,level:5,streak:14,badge:'🥈'},
    {rank:3,name:'Arjun M.',xp:8100,level:5,streak:9,badge:'🥉'},
    {rank:4,name:'You',xp:progress.total_xp||0,level:info.level,streak:progress.current_streak||0,isYou:true},
    {rank:5,name:'Kavya R.',xp:4200,level:3,streak:5,badge:''},
    {rank:6,name:'Dev P.',xp:3100,level:3,streak:3,badge:''},
  ].sort((a,b)=>b.xp-a.xp).map((p,i)=>({...p,rank:i+1}));
  return h('div',{ref:rootRef,style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Leaderboard',subtitle:'Your academy rankings',gradient:'linear-gradient(135deg,#78350f,#d97706)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:12}},
      mockboard.map(p=>h('div',{key:p.rank,'data-lb-card':'',style:{display:'flex',alignItems:'center',gap:14,padding:'14px 16px',borderRadius:12,background:p.isYou?'rgba(22,163,74,0.1)':'rgba(22,27,34,0.9)',border:'1px solid '+(p.isYou?'rgba(22,163,74,0.4)':'rgba(48,54,61,0.9)'),transition:'all 0.12s'}},
        h('div',{style:{width:32,height:32,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:p.rank<=3?18:14,fontWeight:800,color:p.rank===1?'#fbbf24':p.rank===2?'#94a3b8':p.rank===3?'#c97c2e':'#484f58',background:p.rank<=3?'rgba(217,119,6,0.12)':'transparent'}},p.rank<=3?p.badge:p.rank),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:14,fontWeight:700,color:p.isYou?'#4ade80':'#e6edf3'}},p.name+(p.isYou?' (You)':'')),
          h('div',{style:{fontSize:12,color:'#484f58',marginTop:2}},'Lv.'+p.level+' \u00b7 '+p.streak+'d streak')
        ),
        h('div',{style:{textAlign:'right'}},
          h('div',{style:{fontSize:14,fontWeight:800,color:p.isYou?'#4ade80':'#e6edf3',fontVariantNumeric:'tabular-nums'}},p.xp.toLocaleString()),
          h('div',{style:{fontSize:11,color:'#484f58'}},'XP')
        )
      ))
    )
  );
}

// ================================================================
// SETTINGS PAGE
// ================================================================
function SettingsPage(){
  const [confirm,setConfirm]=useState(false);
  const clearAll=()=>{
    if(!confirm){setConfirm(true);setTimeout(()=>setConfirm(false),4000);return;}
    ['progress','xp_log','goals','schedule','user'].forEach(k=>DB.del(k));
    window.dispatchEvent(new CustomEvent('sc_update'));
    nav('Home');
  };
  return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title:'Settings',subtitle:'App preferences',gradient:'linear-gradient(135deg,#0f172a,#1e293b)'}),
    h('div',{style:{padding:'20px 16px',display:'flex',flexDirection:'column',gap:16}},
      h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('h3',{style:{fontSize:15,fontWeight:700,color:'#e6edf3',margin:'0 0 4px'}},'SmartCrick AI'),
        h('p',{style:{fontSize:12,color:'#484f58',margin:0}},'v3.1 \u00b7 Data stored locally on your device')
      ),
      h('div',{style:{padding:16,borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
        h('h3',{style:{fontSize:14,fontWeight:700,color:'#e6edf3',margin:'0 0 12px'}},'Data'),
        h('button',{onClick:()=>nav('Progress'),style:{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,background:'transparent',border:'none',cursor:'pointer',textAlign:'left'}},
          h(Icon,{n:'barChart',cls:'w-4 h-4',style:{color:'#484f58'}}),h('span',{style:{fontSize:13,color:'#8b949e'}},'View detailed progress')
        ),
        h('button',{onClick:clearAll,style:{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,background:confirm?'rgba(239,68,68,0.1)':'transparent',border:confirm?'1px solid rgba(239,68,68,0.3)':'none',cursor:'pointer',textAlign:'left'}},
          h(Icon,{n:'trash',cls:'w-4 h-4',style:{color:confirm?'#f87171':'#484f58'}}),
          h('span',{style:{fontSize:13,color:confirm?'#f87171':'#8b949e'}},confirm?'Tap again to confirm reset':'Reset all progress data')
        )
      )
    )
  );
}

// ================================================================
// STUB PAGE + ALL STUB PAGES
// ================================================================
function StubPage({title,icon,desc,features,badge}){
  return h('div',{style:{paddingBottom:'6rem'}},
    h(PageHeader,{title,subtitle:'Coming soon',gradient:'linear-gradient(135deg,#0f172a,#1e3a8a)',onBack:()=>history.back()}),
    h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',padding:'3rem 1.5rem',textAlign:'center'}},
      h('div',{style:{width:72,height:72,borderRadius:18,background:'rgba(99,102,241,0.15)',border:'1px solid rgba(99,102,241,0.3)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20}},
        h(Icon,{n:icon||'sparkles',cls:'w-9 h-9',style:{color:'#6366f1'}})
      ),
      badge&&h('div',{style:{marginBottom:12}},h(PremiumBadge,{label:badge})),
      h('h2',{style:{fontSize:22,fontWeight:800,color:'#e6edf3',marginBottom:10}},title),
      h('p',{style:{fontSize:14,color:'#64748b',maxWidth:280,lineHeight:1.7,marginBottom:features?24:0}},desc),
      features&&h('div',{style:{width:'100%',maxWidth:320,display:'flex',flexDirection:'column',gap:10,marginTop:8}},
        features.map((f,i)=>h('div',{key:i,style:{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',textAlign:'left'}},
          h(Icon,{n:'check',cls:'w-4 h-4 flex-shrink-0',style:{color:'#6366f1'}}),
          h('span',{style:{fontSize:13,color:'#94a3b8'}},f)
        ))
      )
    )
  );
}

function AICoachPage(){
  return h(StubPage,{title:'AI Head Coach',icon:'cpu',badge:'PRO',
    desc:'Your personal AI batting and bowling coach. Analyses your stats, identifies patterns, and creates a completely personalised training program.',
    features:['Personalised drill recommendations','Weakness identification from your stats','Weekly training load optimisation','Real-time coaching during drills']});
}
function AIWorkoutPage(){
  return h(StubPage,{title:'AI Workout Builder',icon:'sparkles',badge:'PRO',
    desc:'Tell the AI your goals, available equipment, and time — it builds the perfect cricket fitness session for you instantly.',
    features:['Equipment-aware workout design','Cricket-specific movement patterns','Progressive overload planning','Injury prevention protocols']});
}
function MatchTrackerPage(){
  return h(StubPage,{title:'Match Tracker',icon:'list',
    desc:'Log every match ball by ball. Track runs, wickets, extras, partnerships, and build a comprehensive career record.',
    features:['Ball-by-ball scoring','Partnership tracking','Career statistics aggregation','Match report exports']});
}
function MiniMatchPage(){
  return h(StubPage,{title:'MiniMatch IQ',icon:'puzzle',
    desc:'Cricket scenario brain-teasers. Given the match situation, what\'s the optimal play? Test your cricket IQ against real match scenarios.',
    features:['100+ real match scenarios','Batting and bowling decisions','Field placement puzzles','Leaderboard rankings']});
}
function GetOutPage(){
  return h(StubPage,{title:'Why Did I Get Out?',icon:'helpCircle',
    desc:'Describe how you got dismissed. The AI diagnoses the technical or tactical error and prescribes targeted practice drills to fix it.',
    features:['Dismissal pattern analysis','Technical fault identification','Targeted drill prescriptions','Video reference examples']});
}
function QuizzesPage(){
  return h(StubPage,{title:'Cricket Quizzes',icon:'book',
    desc:'Test your cricket knowledge — rules, history, tactics, and technique. Earn XP for every correct answer.',
    features:['Rules and Laws of Cricket','Tactical scenario questions','Cricket history trivia','Technique identification rounds']});
}
function VideoAnalysisPage(){
  return h(StubPage,{title:'Video Analysis',icon:'video',
    desc:'Upload your batting or bowling footage. AI analyses your stance, backlift, delivery action — full breakdown with drills to fix every fault.',
    features:['Stance and grip analysis','Backlift and follow-through review','Bowling action breakdown','Side-by-side comparison with pros']});
}
function PerformancePage(){
  return h(StubPage,{title:'Performance Analytics',icon:'chartLine',
    desc:'Deep-dive analytics on your training patterns, XP velocity, completion rates, and skill progression curves — visualised over time.',
    features:['XP velocity tracking','Training consistency scores','Skill improvement curves','Volume and intensity analytics']});
}
function MatchLoggerPage(){
  return h(StubPage,{title:'Match Logger',icon:'list',
    desc:'Log runs, wickets, catches, and key match moments. Build a comprehensive match history and track your game-day performance trends.',
    features:['Ball-by-ball match logging','Batting and bowling stats','Partnership and run-rate tracking','Career records dashboard']});
}
function ReactionDrillPage(){
  return h(StubPage,{title:'Reaction Drill',icon:'zap',
    desc:'Train your hand-eye coordination and reaction time with colour-coded visual stimulus drills — calibrated to simulate real delivery speeds.',
    features:['Colour-coded reaction targets','Speed calibration by role','Reaction time scoring','Progress benchmarking']});
}

// ================================================================
// APP ROOT — SCAnim.init + ScrollTrigger refresh on page change
// ================================================================
function AppRoot(){
  const {page,params}=useRoute();
  const [sidebarOpen,setSidebarOpen]=useState(false);
  const [dark,setDark]=useState(()=>{
    try{const s=localStorage.getItem('sc_dark');return s===null?true:s==='true';}catch{return true;}
  });

  // ── GSAP initialisation — runs ONCE before any page renders ──
  useLayoutEffect(()=>{
    SCAnim.init();
  },[]);

  useEffect(()=>{
    // Apply dark/light class
    document.documentElement.classList.toggle('sc-dark',dark);
    document.documentElement.classList.toggle('sc-light',!dark);
  },[]);

  useEffect(()=>{
    document.documentElement.classList.toggle('sc-dark',dark);
    document.documentElement.classList.toggle('sc-light',!dark);
    try{localStorage.setItem('sc_dark',String(dark));}catch{}
  },[dark]);

  // Refresh ScrollTriggers on every page change — wait one frame so
  // the new page's useLayoutEffect has registered its triggers first
  useEffect(()=>{
    setSidebarOpen(false);
    requestAnimationFrame(()=>{ SCAnim.refresh(); });
  },[page]);

  const toggleDark=useCallback(()=>setDark(d=>!d),[]);
  const themeVal=useMemo(()=>({dark,toggle:toggleDark}),[dark,toggleDark]);

  const renderPage=()=>{
    switch(page){
      case 'Home': return h(HomePage);
      case 'Drills': return h(DrillsPage);
      case 'DrillDetail': return h(DrillDetailPage,{params});
      case 'Mental': return h(MentalPage);
      case 'MentalPlayer': return h(MentalPlayerPage,{params});
      case 'Fitness': return h(FitnessPage);
      case 'WorkoutDetail': return h(WorkoutDetailPage,{params});
      case 'Timer': return h(TimerPage);
      case 'ThirtyDay': return h(ThirtyDayPage);
      case 'NinetyDay': return h(NinetyDayPage);
      case 'Schedule': return h(SchedulePage);
      case 'SkillPaths': return h(SkillPathsPage);
      case 'Progress': return h(ProgressPage);
      case 'Profile': return h(ProfilePage);
      case 'Goals': return h(GoalsPage);
      case 'Leaderboard': return h(LeaderboardPage);
      case 'Settings': return h(SettingsPage);
      case 'AICoach': return h(AICoachPage);
      case 'AIWorkout': return h(AIWorkoutPage);
      case 'MatchTracker': return h(MatchTrackerPage);
      case 'MiniMatch': return h(MiniMatchPage);
      case 'GetOut': return h(GetOutPage);
      case 'Quizzes': return h(QuizzesPage);
      case 'VideoAnalysis': return h(VideoAnalysisPage);
      case 'Performance': return h(PerformancePage);
      case 'MatchLogger': return h(MatchLoggerPage);
      case 'ReactionDrill': return h(ReactionDrillPage);
      default: return h(HomePage);
    }
  };

  const hideNav=['MentalPlayer','Timer','DrillDetail','WorkoutDetail'].includes(page);
  const hideSidebar=['MentalPlayer','Timer'].includes(page);

  return h(ThemeCtx.Provider,{value:themeVal},
    h(ErrorBoundary,null,
      h('div',{style:{minHeight:'100dvh',background:'#0d1117',color:'#e6edf3',fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif"}},
        !hideSidebar&&h('div',{style:{position:'fixed',top:'max(0.75rem,calc(0.75rem + env(safe-area-inset-top)))',left:'0.75rem',zIndex:35}},
          h('button',{onClick:()=>setSidebarOpen(true),style:{width:42,height:42,borderRadius:10,background:'rgba(13,17,23,0.92)',backdropFilter:'blur(12px)',border:'1px solid rgba(48,54,61,0.9)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:'0 4px 12px rgba(0,0,0,0.4)'}},
            h(Icon,{n:'menu',cls:'w-5 h-5',style:{color:'#8b949e'}})
          )
        ),
        !hideSidebar&&h(Sidebar,{open:sidebarOpen,onClose:()=>setSidebarOpen(false),currentPage:page}),
        h('main',{style:{flex:1}},
          h(ErrorBoundary,null,renderPage())
        ),
        !hideNav&&h(BottomNav,{page})
      )
    )
  );
}

// ================================================================
// MOUNT — single instance
// ================================================================
const _root = document.getElementById('root');
if(_root){
  createRoot(_root).render(
    h(ErrorBoundary,null,h(AppRoot))
  );
} else {
  console.error('[SmartCrick] #root element not found');
}

})(); // end IIFE
