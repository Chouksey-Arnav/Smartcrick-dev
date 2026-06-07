// app-mascot.js — Crick v2.0
// Cricket ball mascot with dynamic color theming + GSAP animations
(function () {
'use strict';
var h         = React.createElement;
var Fragment  = React.Fragment;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A         = window.SC_APP;
A.Emotion     = A.Emotion || {};

// ── Crick Color System — 100+ colors in 6 tiers ─────────────────
var CRICK_COLORS = {
  // ── TIER 1: Free ─────────────────────────────────────────────
  classic:    { id:'classic',    name:'Classic Red',       fill:'#b91c1c', stroke:'#7f1d1d', seam:'#7f1d1d', cost:0,    tier:1 },
  // ── TIER 2: Common (100–500 XP) ──────────────────────────────
  forest:     { id:'forest',     name:'Forest Green',      fill:'#15803d', stroke:'#14532d', seam:'#166534', cost:100,  tier:2 },
  ocean:      { id:'ocean',      name:'Ocean Blue',        fill:'#1d4ed8', stroke:'#1e3a8a', seam:'#1e40af', cost:150,  tier:2 },
  midnight:   { id:'midnight',   name:'Midnight Black',    fill:'#111827', stroke:'#030712', seam:'#1f2937', cost:175,  tier:2 },
  slate:      { id:'slate',      name:'Slate Grey',        fill:'#475569', stroke:'#1e293b', seam:'#334155', cost:200,  tier:2 },
  coral:      { id:'coral',      name:'Coral',             fill:'#f43f5e', stroke:'#9f1239', seam:'#be123c', cost:225,  tier:2 },
  teal:       { id:'teal',       name:'Teal',              fill:'#0d9488', stroke:'#134e4a', seam:'#0f766e', cost:250,  tier:2 },
  amber:      { id:'amber',      name:'Amber',             fill:'#d97706', stroke:'#78350f', seam:'#b45309', cost:275,  tier:2 },
  crimson:    { id:'crimson',    name:'Crimson',           fill:'#dc2626', stroke:'#7f1d1d', seam:'#b91c1c', cost:300,  tier:2 },
  indigo:     { id:'indigo',     name:'Indigo',            fill:'#4338ca', stroke:'#1e1b4b', seam:'#3730a3', cost:300,  tier:2 },
  lime:       { id:'lime',       name:'Lime Green',        fill:'#4d7c0f', stroke:'#1a2e05', seam:'#3f6212', cost:325,  tier:2 },
  rose:       { id:'rose',       name:'Rose',              fill:'#e11d48', stroke:'#881337', seam:'#be123c', cost:350,  tier:2 },
  cyan:       { id:'cyan',       name:'Cyan',              fill:'#0891b2', stroke:'#0c4a6e', seam:'#0e7490', cost:375,  tier:2 },
  violet:     { id:'violet',     name:'Violet',            fill:'#7c3aed', stroke:'#2e1065', seam:'#6d28d9', cost:400,  tier:2 },
  orange:     { id:'orange',     name:'Sunset Orange',     fill:'#ea580c', stroke:'#431407', seam:'#c2410c', cost:400,  tier:2 },
  pine:       { id:'pine',       name:'Pine',              fill:'#065f46', stroke:'#022c22', seam:'#064e3b', cost:425,  tier:2 },
  navy:       { id:'navy',       name:'Navy Blue',         fill:'#1e3a8a', stroke:'#172554', seam:'#1e40af', cost:450,  tier:2 },
  maroon:     { id:'maroon',     name:'Maroon',            fill:'#881337', stroke:'#4c0519', seam:'#9f1239', cost:450,  tier:2 },
  sage:       { id:'sage',       name:'Sage',              fill:'#4a7c59', stroke:'#1a2e1a', seam:'#3d6b4a', cost:475,  tier:2 },
  dusk:       { id:'dusk',       name:'Dusk Purple',       fill:'#7e22ce', stroke:'#3b0764', seam:'#6b21a8', cost:500,  tier:2 },
  // ── TIER 3: Rare (600–2000 XP) ───────────────────────────────
  golden:     { id:'golden',     name:'Gold',              fill:'#ca8a04', stroke:'#713f12', seam:'#a16207', cost:600,  tier:3 },
  galaxy:     { id:'galaxy',     name:'Galaxy Purple',     fill:'#6d28d9', stroke:'#4c1d95', seam:'#5b21b6', cost:700,  tier:3 },
  chrome:     { id:'chrome',     name:'Chrome Silver',     fill:'#94a3b8', stroke:'#334155', seam:'#cbd5e1', cost:750,  tier:3 },
  bronze:     { id:'bronze',     name:'Bronze',            fill:'#92400e', stroke:'#451a03', seam:'#78350f', cost:800,  tier:3 },
  emerald:    { id:'emerald',    name:'Emerald',           fill:'#059669', stroke:'#022c22', seam:'#047857', cost:850,  tier:3 },
  ruby:       { id:'ruby',       name:'Ruby',              fill:'#be123c', stroke:'#4c0519', seam:'#9f1239', cost:900,  tier:3 },
  sapphire:   { id:'sapphire',   name:'Sapphire',          fill:'#1d4ed8', stroke:'#172554', seam:'#1e3a8a', cost:950,  tier:3 },
  copper:     { id:'copper',     name:'Copper',            fill:'#b45309', stroke:'#431407', seam:'#92400e', cost:1000, tier:3 },
  steel:      { id:'steel',      name:'Steel Blue',        fill:'#0369a1', stroke:'#0c4a6e', seam:'#075985', cost:1050, tier:3 },
  obsidian:   { id:'obsidian',   name:'Obsidian',          fill:'#18181b', stroke:'#09090b', seam:'#27272a', cost:1100, tier:3 },
  jade:       { id:'jade',       name:'Jade',              fill:'#166534', stroke:'#052e16', seam:'#14532d', cost:1150, tier:3 },
  amethyst:   { id:'amethyst',   name:'Amethyst',          fill:'#7e22ce', stroke:'#3b0764', seam:'#6b21a8', cost:1200, tier:3 },
  topaz:      { id:'topaz',      name:'Topaz',             fill:'#0284c7', stroke:'#0c4a6e', seam:'#0369a1', cost:1250, tier:3 },
  platinum:   { id:'platinum',   name:'Platinum',          fill:'#e2e8f0', stroke:'#94a3b8', seam:'#cbd5e1', cost:1350, tier:3 },
  lapis:      { id:'lapis',      name:'Lapis Lazuli',      fill:'#1e3a8a', stroke:'#0f172a', seam:'#1e40af', cost:1400, tier:3 },
  garnet:     { id:'garnet',     name:'Garnet',            fill:'#9f1239', stroke:'#4c0519', seam:'#be123c', cost:1500, tier:3 },
  aquamarine: { id:'aquamarine', name:'Aquamarine',        fill:'#0e7490', stroke:'#0c4a6e', seam:'#0891b2', cost:1600, tier:3 },
  peridot:    { id:'peridot',    name:'Peridot',           fill:'#4d7c0f', stroke:'#1a2e05', seam:'#3f6212', cost:1700, tier:3 },
  onyx:       { id:'onyx',       name:'Onyx',              fill:'#0f0f0f', stroke:'#000000', seam:'#1c1917', cost:1800, tier:3 },
  titanium:   { id:'titanium',   name:'Titanium',          fill:'#374151', stroke:'#111827', seam:'#4b5563', cost:2000, tier:3 },
  // ── TIER 4: Epic (2500–8000 XP) ──────────────────────────────
  neon_green: { id:'neon_green', name:'Neon Green',        fill:'#22c55e', stroke:'#14532d', seam:'#16a34a', cost:2500, tier:4 },
  neon_pink:  { id:'neon_pink',  name:'Neon Pink',         fill:'#ec4899', stroke:'#831843', seam:'#db2777', cost:2700, tier:4 },
  neon_blue:  { id:'neon_blue',  name:'Electric Blue',     fill:'#3b82f6', stroke:'#1e3a8a', seam:'#2563eb', cost:2900, tier:4 },
  lava:       { id:'lava',       name:'Lava Red',          fill:'#ef4444', stroke:'#450a0a', seam:'#dc2626', cost:3000, tier:4 },
  aurora:     { id:'aurora',     name:'Aurora',            fill:'#06b6d4', stroke:'#0c4a6e', seam:'#0891b2', cost:3200, tier:4 },
  toxic:      { id:'toxic',      name:'Toxic Lime',        fill:'#84cc16', stroke:'#1a2e05', seam:'#65a30d', cost:3400, tier:4 },
  plasma:     { id:'plasma',     name:'Plasma',            fill:'#a855f7', stroke:'#3b0764', seam:'#9333ea', cost:3600, tier:4 },
  magma:      { id:'magma',      name:'Magma',             fill:'#f97316', stroke:'#431407', seam:'#ea580c', cost:3800, tier:4 },
  deep_sea:   { id:'deep_sea',   name:'Deep Sea',          fill:'#0f4c75', stroke:'#0a1628', seam:'#1b6ca8', cost:4000, tier:4 },
  wildfire:   { id:'wildfire',   name:'Wildfire',          fill:'#dc2626', stroke:'#3f0202', seam:'#b91c1c', cost:4200, tier:4 },
  void:       { id:'void',       name:'Void',              fill:'#020617', stroke:'#000000', seam:'#0f172a', cost:4500, tier:4 },
  supernova:  { id:'supernova',  name:'Supernova',         fill:'#fde047', stroke:'#713f12', seam:'#facc15', cost:5000, tier:4 },
  glacier:    { id:'glacier',    name:'Glacier',           fill:'#bae6fd', stroke:'#0c4a6e', seam:'#7dd3fc', cost:5500, tier:4 },
  shadow:     { id:'shadow',     name:'Shadow',            fill:'#1e1e2e', stroke:'#000000', seam:'#313244', cost:5800, tier:4 },
  prism:      { id:'prism',      name:'Prism',             fill:'#a78bfa', stroke:'#2e1065', seam:'#8b5cf6', cost:6000, tier:4 },
  crimson_x:  { id:'crimson_x',  name:'Crimson X',         fill:'#ff0030', stroke:'#7f0000', seam:'#cc0000', cost:6500, tier:4 },
  storm:      { id:'storm',      name:'Thunderstorm',      fill:'#1a1a2e', stroke:'#000000', seam:'#16213e', cost:7000, tier:4 },
  solar:      { id:'solar',      name:'Solar Gold',        fill:'#f59e0b', stroke:'#451a03', seam:'#d97706', cost:7500, tier:4 },
  abyss:      { id:'abyss',      name:'Abyss',             fill:'#0a0a0a', stroke:'#000000', seam:'#171717', cost:8000, tier:4 },
  // ── TIER 5: Legendary (10000+ XP) ────────────────────────────
  rainbow:    { id:'rainbow',    name:'Rainbow',           fill:'#ef4444', stroke:'#7f1d1d', seam:'#f97316', cost:10000, tier:5 },
  blk_hole:   { id:'blk_hole',   name:'Black Hole',        fill:'#000000', stroke:'#020617', seam:'#030712', cost:12000, tier:5 },
  lightning:  { id:'lightning',  name:'Lightning',         fill:'#facc15', stroke:'#713f12', seam:'#fde047', cost:14000, tier:5 },
  stardust:   { id:'stardust',   name:'Stardust',          fill:'#c4b5fd', stroke:'#2e1065', seam:'#ddd6fe', cost:16000, tier:5 },
  celestial:  { id:'celestial',  name:'Celestial Blue',    fill:'#0ea5e9', stroke:'#0c4a6e', seam:'#38bdf8', cost:18000, tier:5 },
  inferno:    { id:'inferno',    name:'Inferno',           fill:'#ff3100', stroke:'#3f0000', seam:'#ff5500', cost:20000, tier:5 },
  venom:      { id:'venom',      name:'Venom',             fill:'#4ade80', stroke:'#052e16', seam:'#22c55e', cost:22000, tier:5 },
  ancient:    { id:'ancient',    name:'Ancient Gold',      fill:'#d4af37', stroke:'#5c4a00', seam:'#c9992a', cost:25000, tier:5 },
  nebula:     { id:'nebula',     name:'Nebula',            fill:'#6366f1', stroke:'#1e1b4b', seam:'#818cf8', cost:28000, tier:5 },
  mythic:     { id:'mythic',     name:'Mythic Red',        fill:'#ff0000', stroke:'#300000', seam:'#cc0000', cost:32000, tier:5 },
  omega:      { id:'omega',      name:'Omega Black',       fill:'#050505', stroke:'#000000', seam:'#0a0a0a', cost:35000, tier:5 },
  divine:     { id:'divine',     name:'Divine White',      fill:'#f8fafc', stroke:'#94a3b8', seam:'#e2e8f0', cost:40000, tier:5 },
  // ── TIER 6: Seasonal / Event ──────────────────────────────────
  streak30:   { id:'streak30',   name:'Streak Master',     fill:'#f97316', stroke:'#431407', seam:'#ea580c', cost:0, tier:6, unlock:'streak_30' },
  drills100:  { id:'drills100',  name:'Drill Century',     fill:'#16a34a', stroke:'#052e16', seam:'#15803d', cost:0, tier:6, unlock:'drills_100' },
  sessions50: { id:'sessions50', name:'Mental Champion',   fill:'#7c3aed', stroke:'#2e1065', seam:'#6d28d9', cost:0, tier:6, unlock:'mental_50'  },
  workouts75: { id:'workouts75', name:'Iron Cricketer',    fill:'#0369a1', stroke:'#0c4a6e', seam:'#075985', cost:0, tier:6, unlock:'workouts_75'},
};
A.CRICK_COLORS = CRICK_COLORS;

// ── Crick Accessories System ─────────────────────────────────────
var CRICK_ACCESSORIES = {
  // ── Hats ─────────────────────────────────────────────────────
  none:        { id:'none',        name:'None',            type:'hat',    cost:0,    tier:1, svg:null },
  cap:         { id:'cap',         name:'Cricket Cap',     type:'hat',    cost:400,  tier:2, svg:'hat_cap' },
  helmet:      { id:'helmet',      name:'Helmet',          type:'hat',    cost:600,  tier:2, svg:'hat_helmet' },
  crown:       { id:'crown',       name:'Crown',           type:'hat',    cost:2000, tier:4, svg:'hat_crown' },
  headband:    { id:'headband',    name:'Headband',        type:'hat',    cost:300,  tier:2, svg:'hat_headband' },
  top_hat:     { id:'top_hat',     name:'Top Hat',         type:'hat',    cost:1500, tier:3, svg:'hat_tophat' },
  // ── Eyes ─────────────────────────────────────────────────────
  normal_eyes: { id:'normal_eyes', name:'Normal',          type:'eyes',   cost:0,    tier:1, svg:null },
  star_eyes:   { id:'star_eyes',   name:'Star Eyes',       type:'eyes',   cost:800,  tier:3, svg:'eyes_star' },
  sunglasses:  { id:'sunglasses',  name:'Cool Shades',     type:'eyes',   cost:500,  tier:2, svg:'eyes_shades' },
  laser_eyes:  { id:'laser_eyes',  name:'Laser Eyes',      type:'eyes',   cost:3000, tier:4, svg:'eyes_laser' },
  heart_eyes:  { id:'heart_eyes',  name:'Heart Eyes',      type:'eyes',   cost:1200, tier:3, svg:'eyes_heart' },
  // ── Effects ──────────────────────────────────────────────────
  no_effect:   { id:'no_effect',   name:'None',            type:'effect', cost:0,    tier:1, svg:null },
  fire_aura:   { id:'fire_aura',   name:'Fire Aura',       type:'effect', cost:2500, tier:4, svg:'fx_fire' },
  lightning_fx:{ id:'lightning_fx',name:'Lightning',       type:'effect', cost:3500, tier:4, svg:'fx_lightning' },
  sparkle_fx:  { id:'sparkle_fx',  name:'Sparkle',         type:'effect', cost:1000, tier:3, svg:'fx_sparkle' },
  ice_fx:      { id:'ice_fx',      name:'Ice Aura',        type:'effect', cost:2000, tier:3, svg:'fx_ice' },
};
A.CRICK_ACCESSORIES = CRICK_ACCESSORIES;

A.getCrickAccessory = function(type) {
  var key = (A.DB && A.DB.get('crick_accessory_' + type)) || (type === 'hat' ? 'none' : type === 'eyes' ? 'normal_eyes' : 'no_effect');
  return CRICK_ACCESSORIES[key] || null;
};
A.getUnlockedAccessories = function() {
  return (A.DB && A.DB.get('crick_unlocked_accessories')) || ['none','normal_eyes','no_effect'];
};

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

  // Reactively read equipped accessories
  var [accKeys, setAccKeys] = useState(function() {
    return {
      hat:    (A.DB && A.DB.get('crick_accessory_hat'))    || 'none',
      eyes:   (A.DB && A.DB.get('crick_accessory_eyes'))   || 'normal_eyes',
      effect: (A.DB && A.DB.get('crick_accessory_effect')) || 'no_effect',
    };
  });
  useEffect(function() {
    function onAccUpdate() {
      setAccKeys({
        hat:    (A.DB && A.DB.get('crick_accessory_hat'))    || 'none',
        eyes:   (A.DB && A.DB.get('crick_accessory_eyes'))   || 'normal_eyes',
        effect: (A.DB && A.DB.get('crick_accessory_effect')) || 'no_effect',
      });
    }
    window.addEventListener('sc_update', onAccUpdate);
    return function() { window.removeEventListener('sc_update', onAccUpdate); };
  }, []);
  var hatAcc    = CRICK_ACCESSORIES[accKeys.hat];
  var eyesAcc   = CRICK_ACCESSORIES[accKeys.eyes];
  var effectAcc = CRICK_ACCESSORIES[accKeys.effect];

  var isXL = props.size === 'xl';
  return h('div', {
    id: rootId + '-wrap',
    className: 'crick-mascot-float' + (isXL ? ' crick-mascot-xl' : ''),
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
      // ── Spinning ball group (body + seams) — eyes stay outside ──
      h('g', {
        id: rootId + '-ball-group',
        className: 'crick-ball-spin',
        style: { transformOrigin: '60px 66px' },
      },
        h('circle', {
          id: rootId + '-body',
          cx: 60, cy: 66, r: 42,
          fill: col.fill, stroke: col.stroke, strokeWidth: 1.5,
        }),
        h('path', {
          id: rootId + '-seam-top',
          d: 'M60 24 Q82 46 60 66 Q38 46 60 24',
          fill: 'none', stroke: col.seam, strokeWidth: 2, opacity: 0.7,
        }),
        h('path', {
          id: rootId + '-seam-bot',
          d: 'M60 108 Q82 86 60 66 Q38 86 60 108',
          fill: 'none', stroke: col.seam, strokeWidth: 2, opacity: 0.7,
        }),
      ),

      // ── Eyes: sclera (outside ball group — don't spin) ─────────
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

      // ── Equipped accessory overlays ─────────────────────────────
      effectAcc && effectAcc.svg === 'fx_fire' && h('text', { x: 60, y: 116, textAnchor:'middle', fontSize: 22, fontFamily:'system-ui', opacity: 0.8 }, '🔥'),
      effectAcc && effectAcc.svg === 'fx_lightning' && h('text', { x: 92, y: 30, textAnchor:'middle', fontSize: 20, fontFamily:'system-ui', opacity: 0.85 }, '⚡'),
      effectAcc && effectAcc.svg === 'fx_sparkle' && h('text', { x: 30, y: 28, textAnchor:'middle', fontSize: 16, fontFamily:'system-ui', opacity: 0.9 }, '✨'),
      effectAcc && effectAcc.svg === 'fx_ice' && h('text', { x: 90, y: 100, textAnchor:'middle', fontSize: 18, fontFamily:'system-ui', opacity: 0.8 }, '❄️'),

      eyesAcc && eyesAcc.svg === 'eyes_shades' && h('rect', { x: 32, y: 49, width: 56, height: 12, rx: 5, fill: '#0f172a', opacity: 0.92 }),
      eyesAcc && eyesAcc.svg === 'eyes_star' && h(Fragment, null,
        h('text', { x: 43, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '⭐'),
        h('text', { x: 77, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '⭐'),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_heart' && h(Fragment, null,
        h('text', { x: 43, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '❤️'),
        h('text', { x: 77, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '❤️'),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_laser' && h(Fragment, null,
        h('line', { x1: 43, y1: 54, x2: 8,  y2: 54, stroke:'#ef4444', strokeWidth: 2, opacity: 0.8 }),
        h('line', { x1: 77, y1: 54, x2: 112, y2: 54, stroke:'#ef4444', strokeWidth: 2, opacity: 0.8 }),
      ),

      hatAcc && hatAcc.svg === 'hat_cap' && h('path', { d: 'M30 30 Q60 8 90 30 L90 36 Q60 22 30 36 Z', fill:'#1e3a8a', stroke:'#0f172a', strokeWidth: 1.5 }),
      hatAcc && hatAcc.svg === 'hat_helmet' && h('path', { d: 'M28 32 Q60 4 92 32 L92 40 L28 40 Z', fill:'#374151', stroke:'#111827', strokeWidth: 1.5 }),
      hatAcc && hatAcc.svg === 'hat_crown' && h('path', { d: 'M34 32 L40 18 L52 30 L60 14 L68 30 L80 18 L86 32 Z', fill:'#facc15', stroke:'#92400e', strokeWidth: 1.2 }),
      hatAcc && hatAcc.svg === 'hat_headband' && h('rect', { x: 30, y: 38, width: 60, height: 7, rx: 3.5, fill:'#dc2626', opacity: 0.9 }),
      hatAcc && hatAcc.svg === 'hat_tophat' && h(Fragment, null,
        h('rect', { x: 44, y: 6,  width: 32, height: 24, rx: 2, fill:'#1f2937' }),
        h('rect', { x: 34, y: 28, width: 52, height: 6,  rx: 2, fill:'#1f2937' }),
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
      host.classList.add('crick-celeb-jump', 'crick-xp-glow');
      setTimeout(function () {
        if (host) {
          host.style.opacity = '0.7';
          host.style.transform = 'scale(1)';
          host.classList.remove('crick-celeb-jump', 'crick-xp-glow');
        }
      }, 900);
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

    // ── Eye tracking — pupils follow cursor ──────────────────────
    function onMouseMove(e) {
      var gsap = window.gsap;
      if (!gsap || stateRef.current !== 'idle') return;
      var vw = window.innerWidth;
      var dx = (e.clientX - vw / 2) / (vw / 2);
      var offsetX = dx * 5;
      gsap.to([rootId('pupil-l'), rootId('shine-l')], {
        attr: { cx: 43 + offsetX }, duration: 0.4, ease: 'power2.out', overwrite: 'auto',
      });
      gsap.to([rootId('pupil-r'), rootId('shine-r')], {
        attr: { cx: 77 + offsetX }, duration: 0.4, ease: 'power2.out', overwrite: 'auto',
      });
    }
    function onTouchMove(e) {
      if (e.touches && e.touches[0]) onMouseMove(e.touches[0]);
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    // ── Tap spin API ─────────────────────────────────────────────
    A.Emotion.tapSpinMascot = function(wrapId) {
      var wrap = document.getElementById((wrapId || 'em-mascot-main') + '-wrap');
      if (!wrap) wrap = document.getElementById('em-mascot-fixed-host');
      if (!wrap) return;
      wrap.classList.add('crick-spinning', 'crick-tap-spin');
      if (A.Emotion.haptic) A.Emotion.haptic('crick_tap');
      wrap.addEventListener('animationend', function handler() {
        wrap.classList.remove('crick-spinning', 'crick-tap-spin');
        wrap.removeEventListener('animationend', handler);
      }, { once: true });
    };

    return function () {
      clearTimeout(initTimer);
      killAll();
      A.Emotion.off('sc_badge_unlock',         onCheer);
      A.Emotion.off('sc_daily_reward_claimed', onCheer);
      A.Emotion.off('sc_first_session',        onCheer);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
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
