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

// ── Crick Color System — 200+ colors in 6 tiers ─────────────────
var CRICK_COLORS = {
  // ── TIER 1: Free ─────────────────────────────────────────────
  classic:     { id:'classic', name:'Classic Red', fill:'#b91c1c', stroke:'#7f1d1d', seam:'#7f1d1d', cost:0, tier:1 },
  // ── TIER 2: Common (350-1,800 XP) ────────────────────────────
  forest:      { id:'forest', name:'Forest Green', fill:'#15803d', stroke:'#14532d', seam:'#166534', cost:350, tier:2 },
  ocean:       { id:'ocean', name:'Ocean Blue', fill:'#1d4ed8', stroke:'#1e3a8a', seam:'#1e40af', cost:428, tier:2 },
  midnight:    { id:'midnight', name:'Midnight Black', fill:'#111827', stroke:'#030712', seam:'#1f2937', cost:505, tier:2 },
  slate:       { id:'slate', name:'Slate Grey', fill:'#475569', stroke:'#1e293b', seam:'#334155', cost:582, tier:2 },
  coral:       { id:'coral', name:'Coral', fill:'#f43f5e', stroke:'#9f1239', seam:'#be123c', cost:661, tier:2 },
  teal:        { id:'teal', name:'Teal', fill:'#0d9488', stroke:'#134e4a', seam:'#0f766e', cost:740, tier:2 },
  amber:       { id:'amber', name:'Amber', fill:'#d97706', stroke:'#78350f', seam:'#b45309', cost:828, tier:2 },
  crimson:     { id:'crimson', name:'Crimson', fill:'#dc2626', stroke:'#7f1d1d', seam:'#b91c1c', cost:917, tier:2 },
  indigo:      { id:'indigo', name:'Indigo', fill:'#4338ca', stroke:'#1e1b4b', seam:'#3730a3', cost:1005, tier:2 },
  lime:        { id:'lime', name:'Lime Green', fill:'#4d7c0f', stroke:'#1a2e05', seam:'#3f6212', cost:1083, tier:2 },
  rose:        { id:'rose', name:'Rose', fill:'#e11d48', stroke:'#881337', seam:'#be123c', cost:1171, tier:2 },
  cyan:        { id:'cyan', name:'Cyan', fill:'#0891b2', stroke:'#0c4a6e', seam:'#0e7490', cost:1253, tier:2 },
  violet:      { id:'violet', name:'Violet', fill:'#7c3aed', stroke:'#2e1065', seam:'#6d28d9', cost:1330, tier:2 },
  orange:      { id:'orange', name:'Sunset Orange', fill:'#ea580c', stroke:'#431407', seam:'#c2410c', cost:1410, tier:2 },
  pine:        { id:'pine', name:'Pine', fill:'#065f46', stroke:'#022c22', seam:'#064e3b', cost:1499, tier:2 },
  navy:        { id:'navy', name:'Navy Blue', fill:'#1e3a8a', stroke:'#172554', seam:'#1e40af', cost:1589, tier:2 },
  maroon:      { id:'maroon', name:'Maroon', fill:'#881337', stroke:'#4c0519', seam:'#9f1239', cost:1665, tier:2 },
  sage:        { id:'sage', name:'Sage', fill:'#4a7c59', stroke:'#1a2e1a', seam:'#3d6b4a', cost:1743, tier:2 },
  dusk:        { id:'dusk', name:'Dusk Purple', fill:'#7e22ce', stroke:'#3b0764', seam:'#6b21a8', cost:1826, tier:2 },
  cobalt:      { id:'cobalt', name:'Cobalt', fill:'#2b7aca', stroke:'#114274', seam:'#275c90', cost:1905, tier:2 },
  saffron:     { id:'saffron', name:'Saffron', fill:'#ae8132', stroke:'#5d4214', seam:'#785c2b', cost:1951, tier:2 },
  mint:        { id:'mint', name:'Mint', fill:'#30b074', stroke:'#135e3b', seam:'#2a7a54', cost:1997, tier:2 },
  plum:        { id:'plum', name:'Plum', fill:'#b734b7', stroke:'#661566', seam:'#802d80', cost:2046, tier:2 },
  cherry:      { id:'cherry', name:'Cherry', fill:'#b53046', stroke:'#631320', seam:'#7e2a38', cost:2093, tier:2 },
  sand:        { id:'sand', name:'Sand', fill:'#b99527', stroke:'#624d0e', seam:'#806923', cost:2136, tier:2 },
  azure:       { id:'azure', name:'Azure', fill:'#309acf', stroke:'#14597b', seam:'#2d7295', cost:2175, tier:2 },
  blush:       { id:'blush', name:'Blush', fill:'#cc285f', stroke:'#750f31', seam:'#92264a', cost:2221, tier:2 },
  olive:       { id:'olive', name:'Olive', fill:'#98ad2e', stroke:'#4e5a11', seam:'#697728', cost:2256, tier:2 },
  turquoise:   { id:'turquoise', name:'Turquoise', fill:'#3ccdc1', stroke:'#188178', seam:'#329a91', cost:2299, tier:2 },
  mauve:       { id:'mauve', name:'Mauve', fill:'#d435ba', stroke:'#861373', seam:'#a02c8d', cost:2341, tier:2 },
  tangerine:   { id:'tangerine', name:'Tangerine', fill:'#cd782d', stroke:'#784112', seam:'#935b2a', cost:2381, tier:2 },
  periwinkle:  { id:'periwinkle', name:'Periwinkle', fill:'#2a43c0', stroke:'#101f6a', seam:'#263687', cost:2420, tier:2 },
  mustard:     { id:'mustard', name:'Mustard', fill:'#ae992d', stroke:'#5a4e11', seam:'#776a27', cost:2463, tier:2 },
  seafoam:     { id:'seafoam', name:'Seafoam', fill:'#22b490', stroke:'#0b5b47', seam:'#1f7a63', cost:2506, tier:2 },
  salmon:      { id:'salmon', name:'Salmon', fill:'#b93b27', stroke:'#62190e', seam:'#802f23', cost:2554, tier:2 },
  lilac:       { id:'lilac', name:'Lilac', fill:'#7d28d2', stroke:'#450f7b', seam:'#5e2697', cost:2591, tier:2 },
  khaki:       { id:'khaki', name:'Khaki', fill:'#beb123', stroke:'#645d0c', seam:'#837b20', cost:2637, tier:2 },
  denim:       { id:'denim', name:'Denim', fill:'#387ad6', stroke:'#13458b', seam:'#2c5ea5', cost:2674, tier:2 },
  raspberry:   { id:'raspberry', name:'Raspberry', fill:'#cc3359', stroke:'#79152e', seam:'#932f48', cost:2714, tier:2 },
  apricot:     { id:'apricot', name:'Apricot', fill:'#af7431', stroke:'#5d3b13', seam:'#79542a', cost:2762, tier:2 },
  cerulean:    { id:'cerulean', name:'Cerulean', fill:'#2c8faf', stroke:'#10485b', seam:'#266478', cost:2805, tier:2 },
  fern:        { id:'fern', name:'Fern', fill:'#2bb136', stroke:'#105c16', seam:'#25792c', cost:2849, tier:2 },
  wine:        { id:'wine', name:'Wine', fill:'#cf3e30', stroke:'#7b1d14', seam:'#95352d', cost:2893, tier:2 },
  honey:       { id:'honey', name:'Honey', fill:'#c79e3d', stroke:'#7a5d1a', seam:'#927635', cost:2938, tier:2 },
  lavender:    { id:'lavender', name:'Lavender', fill:'#672db9', stroke:'#341164', seam:'#4d2881', cost:2974, tier:2 },
  pewter:      { id:'pewter', name:'Pewter', fill:'#3767c8', stroke:'#183777', seam:'#315190', cost:3022, tier:2 },
  terracotta:  { id:'terracotta', name:'Terracotta', fill:'#ba562c', stroke:'#652a10', seam:'#824227', cost:3058, tier:2 },
  moss:        { id:'moss', name:'Moss', fill:'#64b72a', stroke:'#31610f', seam:'#4a7e25', cost:3093, tier:2 },
  ivory:       { id:'ivory', name:'Ivory', fill:'#af9631', stroke:'#5d4e13', seam:'#79692a', cost:3133, tier:2 },
  rust:        { id:'rust', name:'Rust', fill:'#cc5933', stroke:'#792e15', seam:'#93482f', cost:3176, tier:2 },
  sky:         { id:'sky', name:'Sky', fill:'#328cb3', stroke:'#144a61', seam:'#2c647d', cost:3223, tier:2 },
  orchid:      { id:'orchid', name:'Orchid', fill:'#ba2ed6', stroke:'#701183', seam:'#8b299e', cost:3268, tier:2 },
  clay:        { id:'clay', name:'Clay', fill:'#c16c2f', stroke:'#6d3812', seam:'#89512a', cost:3305, tier:2 },
  frost:       { id:'frost', name:'Frost', fill:'#3db9d1', stroke:'#167588', seam:'#308ea1', cost:3353, tier:2 },
  // ── TIER 3: Rare (2,200-7,500 XP) ────────────────────────────
  golden:      { id:'golden', name:'Gold', fill:'#ca8a04', stroke:'#713f12', seam:'#a16207', cost:2200, tier:3 },
  galaxy:      { id:'galaxy', name:'Galaxy Purple', fill:'#6d28d9', stroke:'#4c1d95', seam:'#5b21b6', cost:2520, tier:3 },
  chrome:      { id:'chrome', name:'Chrome Silver', fill:'#94a3b8', stroke:'#334155', seam:'#cbd5e1', cost:2844, tier:3 },
  bronze:      { id:'bronze', name:'Bronze', fill:'#92400e', stroke:'#451a03', seam:'#78350f', cost:3176, tier:3 },
  emerald:     { id:'emerald', name:'Emerald', fill:'#059669', stroke:'#022c22', seam:'#047857', cost:3468, tier:3 },
  ruby:        { id:'ruby', name:'Ruby', fill:'#be123c', stroke:'#4c0519', seam:'#9f1239', cost:3755, tier:3 },
  sapphire:    { id:'sapphire', name:'Sapphire', fill:'#1d4ed8', stroke:'#172554', seam:'#1e3a8a', cost:4042, tier:3 },
  copper:      { id:'copper', name:'Copper', fill:'#b45309', stroke:'#431407', seam:'#92400e', cost:4376, tier:3 },
  steel:       { id:'steel', name:'Steel Blue', fill:'#0369a1', stroke:'#0c4a6e', seam:'#075985', cost:4657, tier:3 },
  obsidian:    { id:'obsidian', name:'Obsidian', fill:'#18181b', stroke:'#09090b', seam:'#27272a', cost:4950, tier:3 },
  jade:        { id:'jade', name:'Jade', fill:'#166534', stroke:'#052e16', seam:'#14532d', cost:5263, tier:3 },
  amethyst:    { id:'amethyst', name:'Amethyst', fill:'#7e22ce', stroke:'#3b0764', seam:'#6b21a8', cost:5547, tier:3 },
  topaz:       { id:'topaz', name:'Topaz', fill:'#0284c7', stroke:'#0c4a6e', seam:'#0369a1', cost:5877, tier:3 },
  platinum:    { id:'platinum', name:'Platinum', fill:'#e2e8f0', stroke:'#94a3b8', seam:'#cbd5e1', cost:6197, tier:3 },
  lapis:       { id:'lapis', name:'Lapis Lazuli', fill:'#1e3a8a', stroke:'#0f172a', seam:'#1e40af', cost:6486, tier:3 },
  garnet:      { id:'garnet', name:'Garnet', fill:'#9f1239', stroke:'#4c0519', seam:'#be123c', cost:6815, tier:3 },
  aquamarine:  { id:'aquamarine', name:'Aquamarine', fill:'#0e7490', stroke:'#0c4a6e', seam:'#0891b2', cost:7115, tier:3 },
  peridot:     { id:'peridot', name:'Peridot', fill:'#4d7c0f', stroke:'#1a2e05', seam:'#3f6212', cost:7444, tier:3 },
  onyx:        { id:'onyx', name:'Onyx', fill:'#0f0f0f', stroke:'#000000', seam:'#1c1917', cost:7765, tier:3 },
  titanium:    { id:'titanium', name:'Titanium', fill:'#374151', stroke:'#111827', seam:'#4b5563', cost:8046, tier:3 },
  citrine:     { id:'citrine', name:'Citrine', fill:'#c49f27', stroke:'#6c560e', seam:'#8a7224', cost:8336, tier:3 },
  tourmaline:  { id:'tourmaline', name:'Tourmaline', fill:'#43d68c', stroke:'#169254', seam:'#30ab6e', cost:8535, tier:3 },
  moonstone:   { id:'moonstone', name:'Moonstone', fill:'#456ad9', stroke:'#153699', seam:'#2f50b1', cost:8741, tier:3 },
  malachite:   { id:'malachite', name:'Malachite', fill:'#33d769', stroke:'#128739', seam:'#2aa252', cost:8914, tier:3 },
  opal:        { id:'opal', name:'Opal', fill:'#9d2ec2', stroke:'#57126e', seam:'#712989', cost:9101, tier:3 },
  turitella:   { id:'turitella', name:'Turitella', fill:'#d8944f', stroke:'#a05c18', seam:'#b77534', cost:9300, tier:3 },
  tanzanite:   { id:'tanzanite', name:'Tanzanite', fill:'#6844d5', stroke:'#351792', seam:'#4f31aa', cost:9491, tier:3 },
  spinel:      { id:'spinel', name:'Spinel', fill:'#d34580', stroke:'#91184a', seam:'#a93264', cost:9655, tier:3 },
  zircon:      { id:'zircon', name:'Zircon', fill:'#2480c2', stroke:'#0c4269', seam:'#215d87', cost:9863, tier:3 },
  kyanite:     { id:'kyanite', name:'Kyanite', fill:'#5285cb', stroke:'#1f4d8e', seam:'#3d68a4', cost:10054, tier:3 },
  alexandrite: { id:'alexandrite', name:'Alexandrite', fill:'#28c3a9', stroke:'#0f6c5c', seam:'#248978', cost:10219, tier:3 },
  morganite:   { id:'morganite', name:'Morganite', fill:'#bc384e', stroke:'#6d1826', seam:'#863240', cost:10383, tier:3 },
  iolite:      { id:'iolite', name:'Iolite', fill:'#392cce', stroke:'#1a1178', seam:'#322994', cost:10533, tier:3 },
  sunstone:    { id:'sunstone', name:'Sunstone', fill:'#d18d2e', stroke:'#7c5013', seam:'#976a2b', cost:10697, tier:3 },
  rhodolite:   { id:'rhodolite', name:'Rhodolite', fill:'#c02a75', stroke:'#6a103d', seam:'#872657', cost:10872, tier:3 },
  chrysoprase: { id:'chrysoprase', name:'Chrysoprase', fill:'#6ad954', stroke:'#30a419', seam:'#4bbb35', cost:11024, tier:3 },
  labradorite: { id:'labradorite', name:'Labradorite', fill:'#2f3bc1', stroke:'#121a6d', seam:'#2a3289', cost:11227, tier:3 },
  heliotrope:  { id:'heliotrope', name:'Heliotrope', fill:'#892fb6', stroke:'#481263', seam:'#62297f', cost:11436, tier:3 },
  carnelian:   { id:'carnelian', name:'Carnelian', fill:'#d77d50', stroke:'#9f4519', seam:'#b66035', cost:11626, tier:3 },
  serpentine:  { id:'serpentine', name:'Serpentine', fill:'#42c258', stroke:'#1d772c', seam:'#398e47', cost:11795, tier:3 },
  azurite:     { id:'azurite', name:'Azurite', fill:'#5895ca', stroke:'#225d91', seam:'#4076a5', cost:11990, tier:3 },
  rhodonite:   { id:'rhodonite', name:'Rhodonite', fill:'#da5274', stroke:'#a5183b', seam:'#bc3456', cost:12161, tier:3 },
  amazonite:   { id:'amazonite', name:'Amazonite', fill:'#3bb089', stroke:'#186249', seam:'#327b63', cost:12356, tier:3 },
  sodalite:    { id:'sodalite', name:'Sodalite', fill:'#5777d6', stroke:'#1b3da1', seam:'#3858b7', cost:12563, tier:3 },
  larimar:     { id:'larimar', name:'Larimar', fill:'#4dbbcb', stroke:'#1d7c8b', seam:'#3a93a1', cost:12739, tier:3 },
  hematite:    { id:'hematite', name:'Hematite', fill:'#c95e5e', stroke:'#932525', seam:'#a74444', cost:12916, tier:3 },
  quartz:      { id:'quartz', name:'Quartz', fill:'#9154cf', stroke:'#591e94', seam:'#733caa', cost:13076, tier:3 },
  beryl:       { id:'beryl', name:'Beryl', fill:'#52daa2', stroke:'#18a56a', seam:'#34bc83', cost:13231, tier:3 },
  feldspar:    { id:'feldspar', name:'Feldspar', fill:'#c79857', stroke:'#8b5f23', seam:'#9f7841', cost:13400, tier:3 },
  gypsum:      { id:'gypsum', name:'Gypsum', fill:'#2a92c6', stroke:'#105070', seam:'#266a8c', cost:13552, tier:3 },
  mica:        { id:'mica', name:'Mica', fill:'#adad38', stroke:'#5e5e17', seam:'#787830', cost:13760, tier:3 },
  basalt:      { id:'basalt', name:'Basalt', fill:'#4f7dd8', stroke:'#1845a0', seam:'#345fb7', cost:13934, tier:3 },
  granite:     { id:'granite', name:'Granite', fill:'#c86b4c', stroke:'#85381e', seam:'#9b533b', cost:14142, tier:3 },
  marble:      { id:'marble', name:'Marble', fill:'#2873bd', stroke:'#0f3b67', seam:'#245484', cost:14344, tier:3 },
  slate_grey:  { id:'slate_grey', name:'Slate Grey', fill:'#506fce', stroke:'#1d3a90', seam:'#3a55a6', cost:14533, tier:3 },
  // ── TIER 4: Epic (9,000-28,000 XP) ───────────────────────────
  neon_green:  { id:'neon_green', name:'Neon Green', fill:'#22c55e', stroke:'#14532d', seam:'#16a34a', cost:9000, tier:4 },
  neon_pink:   { id:'neon_pink', name:'Neon Pink', fill:'#ec4899', stroke:'#831843', seam:'#db2777', cost:9996, tier:4 },
  neon_blue:   { id:'neon_blue', name:'Electric Blue', fill:'#3b82f6', stroke:'#1e3a8a', seam:'#2563eb', cost:10922, tier:4 },
  lava:        { id:'lava', name:'Lava Red', fill:'#ef4444', stroke:'#450a0a', seam:'#dc2626', cost:12003, tier:4 },
  aurora:      { id:'aurora', name:'Aurora', fill:'#06b6d4', stroke:'#0c4a6e', seam:'#0891b2', cost:13076, tier:4 },
  toxic:       { id:'toxic', name:'Toxic Lime', fill:'#84cc16', stroke:'#1a2e05', seam:'#65a30d', cost:14081, tier:4 },
  plasma:      { id:'plasma', name:'Plasma', fill:'#a855f7', stroke:'#3b0764', seam:'#9333ea', cost:15230, tier:4 },
  magma:       { id:'magma', name:'Magma', fill:'#f97316', stroke:'#431407', seam:'#ea580c', cost:16217, tier:4 },
  deep_sea:    { id:'deep_sea', name:'Deep Sea', fill:'#0f4c75', stroke:'#0a1628', seam:'#1b6ca8', cost:17118, tier:4 },
  wildfire:    { id:'wildfire', name:'Wildfire', fill:'#dc2626', stroke:'#3f0202', seam:'#b91c1c', cost:18150, tier:4 },
  void:        { id:'void', name:'Void', fill:'#020617', stroke:'#000000', seam:'#0f172a', cost:19064, tier:4 },
  supernova:   { id:'supernova', name:'Supernova', fill:'#fde047', stroke:'#713f12', seam:'#facc15', cost:20200, tier:4 },
  glacier:     { id:'glacier', name:'Glacier', fill:'#bae6fd', stroke:'#0c4a6e', seam:'#7dd3fc', cost:21237, tier:4 },
  shadow:      { id:'shadow', name:'Shadow', fill:'#1e1e2e', stroke:'#000000', seam:'#313244', cost:22138, tier:4 },
  prism:       { id:'prism', name:'Prism', fill:'#a78bfa', stroke:'#2e1065', seam:'#8b5cf6', cost:23180, tier:4 },
  crimson_x:   { id:'crimson_x', name:'Crimson X', fill:'#ff0030', stroke:'#7f0000', seam:'#cc0000', cost:24093, tier:4 },
  storm:       { id:'storm', name:'Thunderstorm', fill:'#1a1a2e', stroke:'#000000', seam:'#16213e', cost:25055, tier:4 },
  solar:       { id:'solar', name:'Solar Gold', fill:'#f59e0b', stroke:'#451a03', seam:'#d97706', cost:26028, tier:4 },
  abyss:       { id:'abyss', name:'Abyss', fill:'#0a0a0a', stroke:'#000000', seam:'#171717', cost:26980, tier:4 },
  cyber_pink:  { id:'cyber_pink', name:'Cyber Pink', fill:'#e7328c', stroke:'#9f0954', seam:'#bc206e', cost:28000, tier:4 },
  ion_blue:    { id:'ion_blue', name:'Ion Blue', fill:'#49c5ee', stroke:'#0792c0', seam:'#1facdb', cost:28626, tier:4 },
  vapor_purple:{ id:'vapor_purple', name:'Vapor Purple', fill:'#8c2deb', stroke:'#5406a2', seam:'#6e1bc0', cost:29258, tier:4 },
  acid_yellow: { id:'acid_yellow', name:'Acid Yellow', fill:'#f0f631', stroke:'#b1b800', seam:'#d1d813', cost:29844, tier:4 },
  neon_orange: { id:'neon_orange', name:'Neon Orange', fill:'#f98c3e', stroke:'#c75300', seam:'#e86b11', cost:30402, tier:4 },
  quantum_teal:{ id:'quantum_teal', name:'Quantum Teal', fill:'#20f3ec', stroke:'#00a39e', seam:'#13c3bd', cost:31100, tier:4 },
  radium:      { id:'radium', name:'Radium', fill:'#8fe651', stroke:'#55b80f', seam:'#6fd129', cost:31743, tier:4 },
  photon:      { id:'photon', name:'Photon', fill:'#f5e214', stroke:'#998c00', seam:'#bcad10', cost:32323, tier:4 },
  flux_violet: { id:'flux_violet', name:'Flux Violet', fill:'#7f31ed', stroke:'#4905a8', seam:'#621bc5', cost:33023, tier:4 },
  nova_cyan:   { id:'nova_cyan', name:'Nova Cyan', fill:'#13daec', stroke:'#04808b', seam:'#169fac', cost:33627, tier:4 },
  plasma_red:  { id:'plasma_red', name:'Plasma Red', fill:'#ea1f30', stroke:'#940511', seam:'#b31926', cost:34286, tier:4 },
  hyper_lime:  { id:'hyper_lime', name:'Hyper Lime', fill:'#8af80d', stroke:'#4f9400', seam:'#69b90e', cost:34967, tier:4 },
  tron_blue:   { id:'tron_blue', name:'Tron Blue', fill:'#48b1e5', stroke:'#0e79af', seam:'#2893c8', cost:35643, tier:4 },
  static_white:{ id:'static_white', name:'Static White', fill:'#e74646', stroke:'#b00c0c', seam:'#cb2525', cost:36263, tier:4 },
  glitch_green:{ id:'glitch_green', name:'Glitch Green', fill:'#14eb38', stroke:'#048b1b', seam:'#17ab30', cost:36935, tier:4 },
  solar_flare: { id:'solar_flare', name:'Solar Flare', fill:'#f8a920', stroke:'#a86b00', seam:'#cc870f', cost:37651, tier:4 },
  pulsar:      { id:'pulsar', name:'Pulsar', fill:'#3a15f4', stroke:'#1a0099', seam:'#2e11bb', cost:38268, tier:4 },
  comet_tail:  { id:'comet_tail', name:'Comet Tail', fill:'#208fdf', stroke:'#0b5284', seam:'#206ca2', cost:38825, tier:4 },
  meteor_blue: { id:'meteor_blue', name:'Meteor Blue', fill:'#246deb', stroke:'#063b99', seam:'#1a54b7', cost:39562, tier:4 },
  xenon:       { id:'xenon', name:'Xenon', fill:'#eb37eb', stroke:'#ab07ab', seam:'#c81ec8', cost:40228, tier:4 },
  fusion_pink: { id:'fusion_pink', name:'Fusion Pink', fill:'#e236a9', stroke:'#9c0d6c', seam:'#b72486', cost:40892, tier:4 },
  warp_violet: { id:'warp_violet', name:'Warp Violet', fill:'#8f20df', stroke:'#520b84', seam:'#6c20a2', cost:41634, tier:4 },
  electro_lime:{ id:'electro_lime', name:'Electro Lime', fill:'#70f62c', stroke:'#3bb300', seam:'#53d312', cost:42220, tier:4 },
  cryo_blue:   { id:'cryo_blue', name:'Cryo Blue', fill:'#37d0f6', stroke:'#0097bd', seam:'#14b4db', cost:42901, tier:4 },
  rift_purple: { id:'rift_purple', name:'Rift Purple', fill:'#be28f0', stroke:'#7d03a6', seam:'#9917c4', cost:43587, tier:4 },
  singularity: { id:'singularity', name:'Singularity', fill:'#2828eb', stroke:'#06069d', seam:'#1b1bbb', cost:44214, tier:4 },
  eclipse:     { id:'eclipse', name:'Eclipse', fill:'#3e6aef', stroke:'#0532b8', seam:'#1c4ad4', cost:44780, tier:4 },
  blazing_gold:{ id:'blazing_gold', name:'Blazing Gold', fill:'#f1b80e', stroke:'#8e6b01', seam:'#af8812', cost:45488, tier:4 },
  hydro_blue:  { id:'hydro_blue', name:'Hydro Blue', fill:'#42bbeb', stroke:'#0884b4', seam:'#209ecf', cost:46207, tier:4 },
  toxic_purple:{ id:'toxic_purple', name:'Toxic Purple', fill:'#d322f7', stroke:'#8c00a8', seam:'#ac10cb', cost:46857, tier:4 },
  neon_teal:   { id:'neon_teal', name:'Neon Teal', fill:'#48e5d0', stroke:'#0eaf99', seam:'#28c8b3', cost:47536, tier:4 },
  signal_red:  { id:'signal_red', name:'Signal Red', fill:'#f33030', stroke:'#b20101', seam:'#d01616', cost:48226, tier:4 },
  pixel_green: { id:'pixel_green', name:'Pixel Green', fill:'#31e920', stroke:'#129306', seam:'#27b11b', cost:48814, tier:4 },
  arctic_violet:{ id:'arctic_violet', name:'Arctic Violet', fill:'#5e2df0', stroke:'#2d03ab', seam:'#4418c9', cost:49476, tier:4 },
  phoenix_orange:{ id:'phoenix_orange', name:'Phoenix Orange', fill:'#e56334', stroke:'#9d320b', seam:'#b94a22', cost:50152, tier:4 },
  // ── TIER 5: Legendary (35,000-140,000 XP) ────────────────────
  rainbow:     { id:'rainbow', name:'Rainbow', fill:'#ef4444', stroke:'#7f1d1d', seam:'#f97316', cost:35000, tier:5 },
  blk_hole:    { id:'blk_hole', name:'Black Hole', fill:'#000000', stroke:'#020617', seam:'#030712', cost:44749, tier:5 },
  lightning:   { id:'lightning', name:'Lightning', fill:'#facc15', stroke:'#713f12', seam:'#fde047', cost:53186, tier:5 },
  stardust:    { id:'stardust', name:'Stardust', fill:'#c4b5fd', stroke:'#2e1065', seam:'#ddd6fe', cost:61651, tier:5 },
  celestial:   { id:'celestial', name:'Celestial Blue', fill:'#0ea5e9', stroke:'#0c4a6e', seam:'#38bdf8', cost:70846, tier:5 },
  inferno:     { id:'inferno', name:'Inferno', fill:'#ff3100', stroke:'#3f0000', seam:'#ff5500', cost:80398, tier:5 },
  venom:       { id:'venom', name:'Venom', fill:'#4ade80', stroke:'#052e16', seam:'#22c55e', cost:89961, tier:5 },
  ancient:     { id:'ancient', name:'Ancient Gold', fill:'#d4af37', stroke:'#5c4a00', seam:'#c9992a', cost:99014, tier:5 },
  nebula:      { id:'nebula', name:'Nebula', fill:'#6366f1', stroke:'#1e1b4b', seam:'#818cf8', cost:108621, tier:5 },
  mythic:      { id:'mythic', name:'Mythic Red', fill:'#ff0000', stroke:'#300000', seam:'#cc0000', cost:117194, tier:5 },
  omega:       { id:'omega', name:'Omega Black', fill:'#050505', stroke:'#000000', seam:'#0a0a0a', cost:125739, tier:5 },
  divine:      { id:'divine', name:'Divine White', fill:'#f8fafc', stroke:'#94a3b8', seam:'#e2e8f0', cost:135603, tier:5 },
  cosmic_dust: { id:'cosmic_dust', name:'Cosmic Dust', fill:'#6b10ea', stroke:'#3a0288', seam:'#5214a9', cost:143746, tier:5 },
  event_horizon:{ id:'event_horizon', name:'Event Horizon', fill:'#dc2e2e', stroke:'#8a0f0f', seam:'#a62626', cost:148066, tier:5 },
  dark_matter: { id:'dark_matter', name:'Dark Matter', fill:'#2445eb', stroke:'#061e99', seam:'#1a34b7', cost:152572, tier:5 },
  quasar:      { id:'quasar', name:'Quasar', fill:'#df34c3', stroke:'#950e7f', seam:'#b1259a', cost:157576, tier:5 },
  supercell:   { id:'supercell', name:'Supercell', fill:'#3295dc', stroke:'#0f5a8f', seam:'#2774aa', cost:162601, tier:5 },
  solstice:    { id:'solstice', name:'Solstice', fill:'#eead2b', stroke:'#a46f04', seam:'#c28a19', cost:167998, tier:5 },
  eternity:    { id:'eternity', name:'Eternity', fill:'#4020df', stroke:'#1f0b84', seam:'#3620a2', cost:172051, tier:5 },
  genesis:     { id:'genesis', name:'Genesis', fill:'#18e780', stroke:'#068847', seam:'#1aa861', cost:177381, tier:5 },
  ragnarok:    { id:'ragnarok', name:'Ragnarok', fill:'#de4c3f', stroke:'#9d1c10', seam:'#b7352a', cost:181834, tier:5 },
  valhalla:    { id:'valhalla', name:'Valhalla', fill:'#408af2', stroke:'#0351bf', seam:'#1a6adb', cost:186144, tier:5 },
  phoenix_rebirth:{ id:'phoenix_rebirth', name:'Phoenix Rebirth', fill:'#f26a26', stroke:'#a73801', seam:'#c65015', cost:190949, tier:5 },
  olympus:     { id:'olympus', name:'Olympus', fill:'#26bff2', stroke:'#017ea7', seam:'#159ac6', cost:195955, tier:5 },
  elysium:     { id:'elysium', name:'Elysium', fill:'#9e48f4', stroke:'#6601cb', seam:'#8018e7', cost:200606, tier:5 },
  avalon:      { id:'avalon', name:'Avalon', fill:'#20d99c', stroke:'#0b7f58', seam:'#209d73', cost:205753, tier:5 },
  camelot:     { id:'camelot', name:'Camelot', fill:'#3764eb', stroke:'#0730ab', seam:'#1e48c8', cost:210177, tier:5 },
  excalibur:   { id:'excalibur', name:'Excalibur', fill:'#1ea3e6', stroke:'#07608d', seam:'#1c7bab', cost:214263, tier:5 },
  zenith:      { id:'zenith', name:'Zenith', fill:'#ebbf3d', stroke:'#af8608', seam:'#cba020', cost:218286, tier:5 },
  apex_predator:{ id:'apex_predator', name:'Apex Predator', fill:'#df2a39', stroke:'#8d0c17', seam:'#a9232e', cost:222808, tier:5 },
  ascension:   { id:'ascension', name:'Ascension', fill:'#eedf3a', stroke:'#b2a406', seam:'#cec01c', cost:227515, tier:5 },
  transcendence:{ id:'transcendence', name:'Transcendence', fill:'#b943f4', stroke:'#8401c6', seam:'#9f18e2', cost:232230, tier:5 },
  // ── TIER 6: Seasonal / Event ──────────────────────────────────
  streak30:    { id:'streak30', name:'Streak Master', fill:'#f97316', stroke:'#431407', seam:'#ea580c', cost:0, tier:6, unlock:'streak_30' },
  drills100:   { id:'drills100', name:'Drill Century', fill:'#16a34a', stroke:'#052e16', seam:'#15803d', cost:0, tier:6, unlock:'drills_100' },
  sessions50:  { id:'sessions50', name:'Mental Champion', fill:'#7c3aed', stroke:'#2e1065', seam:'#6d28d9', cost:0, tier:6, unlock:'mental_50' },
  workouts75:  { id:'workouts75', name:'Iron Cricketer', fill:'#0369a1', stroke:'#0c4a6e', seam:'#075985', cost:0, tier:6, unlock:'workouts_75' },
};
A.CRICK_COLORS = CRICK_COLORS;

// ── Crick Accessories System — 60+ items across 6 slot types ─────
var ACCESSORY_DEFAULTS = {
  hat: 'none', eyes: 'normal_eyes', effect: 'no_effect',
  bat: 'no_bat', badge: 'no_badge', background: 'no_bg',
};
A.ACCESSORY_DEFAULTS = ACCESSORY_DEFAULTS;
A.ACCESSORY_TYPES = ['hat','eyes','effect','bat','badge','background'];

var CRICK_ACCESSORIES = {
  // ── Hats (free default + 10 unlockable, 600-3,500 XP) ─────────
  none:        { id:'none',        name:'None',            type:'hat',    cost:0,    tier:1, svg:null },
  headband:    { id:'headband',    name:'Headband',        type:'hat',    cost:600,  tier:2, svg:'hat_headband' },
  cap:         { id:'cap',         name:'Cricket Cap',     type:'hat',    cost:850,  tier:2, svg:'hat_cap' },
  bandana:     { id:'bandana',     name:'Bandana',         type:'hat',    cost:1000, tier:2, svg:'hat_bandana' },
  beanie:      { id:'beanie',      name:'Beanie',          type:'hat',    cost:1150, tier:2, svg:'hat_beanie' },
  baggy_green: { id:'baggy_green', name:'Baggy Green',     type:'hat',    cost:1500, tier:3, svg:'hat_baggy' },
  helmet:      { id:'helmet',      name:'Batting Helmet',  type:'hat',    cost:1750, tier:3, svg:'hat_helmet' },
  sun_hat:     { id:'sun_hat',     name:'Wide-brim Sun Hat',type:'hat',   cost:1900, tier:3, svg:'hat_sun' },
  top_hat:     { id:'top_hat',     name:'Top Hat',         type:'hat',    cost:2400, tier:3, svg:'hat_tophat' },
  party_hat:   { id:'party_hat',   name:'Party Hat',       type:'hat',    cost:2800, tier:4, svg:'hat_party' },
  halo:        { id:'halo',        name:'Halo Ring',       type:'hat',    cost:3200, tier:4, svg:'hat_halo' },
  crown:       { id:'crown',       name:'Crown',           type:'hat',    cost:3500, tier:4, svg:'hat_crown' },
  // ── Eyes (free default + 9 unlockable, 700-4,000 XP) ──────────
  normal_eyes: { id:'normal_eyes', name:'Normal',          type:'eyes',   cost:0,    tier:1, svg:null },
  sunglasses:  { id:'sunglasses',  name:'Cool Shades',     type:'eyes',   cost:700,  tier:2, svg:'eyes_shades' },
  nerd_glasses:{ id:'nerd_glasses',name:'Nerd Glasses',    type:'eyes',   cost:950,  tier:2, svg:'eyes_nerd' },
  monocle:     { id:'monocle',     name:'Monocle',         type:'eyes',   cost:1300, tier:3, svg:'eyes_monocle' },
  visor:       { id:'visor',       name:'Sports Visor',    type:'eyes',   cost:1600, tier:3, svg:'eyes_visor' },
  wink:        { id:'wink',        name:'Wink',            type:'eyes',   cost:1850, tier:3, svg:'eyes_wink' },
  star_eyes:   { id:'star_eyes',   name:'Star Eyes',       type:'eyes',   cost:2200, tier:3, svg:'eyes_star' },
  heart_eyes:  { id:'heart_eyes',  name:'Heart Eyes',      type:'eyes',   cost:2600, tier:4, svg:'eyes_heart' },
  anime_eyes:  { id:'anime_eyes',  name:'Anime Eyes',      type:'eyes',   cost:3200, tier:4, svg:'eyes_anime' },
  laser_eyes:  { id:'laser_eyes',  name:'Laser Eyes',      type:'eyes',   cost:4000, tier:4, svg:'eyes_laser' },
  // ── Effects / Auras (free default + 9, 1,200-6,000 XP) ────────
  no_effect:   { id:'no_effect',   name:'None',            type:'effect', cost:0,    tier:1, svg:null },
  sparkle_fx:  { id:'sparkle_fx',  name:'Sparkle',         type:'effect', cost:1200, tier:3, svg:'fx_sparkle' },
  petals_fx:   { id:'petals_fx',   name:'Falling Petals',  type:'effect', cost:1700, tier:3, svg:'fx_petals' },
  smoke_fx:    { id:'smoke_fx',    name:'Smoke Trail',     type:'effect', cost:2200, tier:3, svg:'fx_smoke' },
  ice_fx:      { id:'ice_fx',      name:'Ice Aura',        type:'effect', cost:2700, tier:4, svg:'fx_ice' },
  confetti_fx: { id:'confetti_fx', name:'Confetti Burst',  type:'effect', cost:3200, tier:4, svg:'fx_confetti' },
  fire_aura:   { id:'fire_aura',   name:'Fire Aura',       type:'effect', cost:3800, tier:4, svg:'fx_fire' },
  lightning_fx:{ id:'lightning_fx',name:'Lightning',       type:'effect', cost:4400, tier:4, svg:'fx_lightning' },
  galaxy_fx:   { id:'galaxy_fx',   name:'Galaxy Swirl',    type:'effect', cost:5200, tier:5, svg:'fx_galaxy' },
  rainbow_fx:  { id:'rainbow_fx',  name:'Rainbow Trail',   type:'effect', cost:6000, tier:5, svg:'fx_rainbow' },
  // ── Bats (free default + 5, 1,000-7,500 XP) ───────────────────
  no_bat:      { id:'no_bat',      name:'None',            type:'bat',    cost:0,    tier:1, svg:null },
  bat_classic: { id:'bat_classic', name:'Classic Willow',  type:'bat',    cost:1000, tier:2, svg:'bat_classic' },
  bat_signature:{ id:'bat_signature',name:"Signature Bat", type:'bat',    cost:2400, tier:3, svg:'bat_signature' },
  bat_carbon:  { id:'bat_carbon',  name:'Carbon Pro Bat',  type:'bat',    cost:4000, tier:4, svg:'bat_carbon' },
  bat_neon:    { id:'bat_neon',    name:'Neon Edge Bat',   type:'bat',    cost:5500, tier:4, svg:'bat_neon' },
  bat_golden:  { id:'bat_golden',  name:'Golden Willow',   type:'bat',    cost:7500, tier:5, svg:'bat_golden' },
  // ── Badges (free default + 5, 2,000-9,000 XP) ─────────────────
  no_badge:    { id:'no_badge',    name:'None',            type:'badge',  cost:0,    tier:1, svg:null },
  badge_century:{ id:'badge_century',name:'Century Badge', type:'badge',  cost:2000, tier:3, svg:'badge_century' },
  badge_hattrick:{ id:'badge_hattrick',name:'Hat-trick Pin',type:'badge', cost:3200, tier:3, svg:'badge_hattrick' },
  badge_armband:{ id:'badge_armband',name:"Captain's Armband",type:'badge',cost:5000, tier:4, svg:'badge_armband' },
  badge_mvp:   { id:'badge_mvp',   name:'MVP Medal',       type:'badge',  cost:6800, tier:4, svg:'badge_mvp' },
  badge_worldcup:{ id:'badge_worldcup',name:'World Cup Star',type:'badge',cost:9000, tier:5, svg:'badge_worldcup' },
  // ── Backgrounds (free default + 5, 3,000-12,000 XP) ───────────
  no_bg:        { id:'no_bg',        name:'None',              type:'background', cost:0,     tier:1, svg:null },
  bg_sunset:    { id:'bg_sunset',    name:'Sunset Pitch',      type:'background', cost:3000,  tier:3, svg:'bg_sunset' },
  bg_floodlights:{id:'bg_floodlights',name:'Night Floodlights',type:'background', cost:5000,  tier:4, svg:'bg_floodlights' },
  bg_stadium:   { id:'bg_stadium',   name:'Packed Stadium',    type:'background', cost:7000,  tier:4, svg:'bg_stadium' },
  bg_aurora:    { id:'bg_aurora',    name:'Aurora Sky',        type:'background', cost:9000,  tier:5, svg:'bg_aurora' },
  bg_trophyroom:{ id:'bg_trophyroom',name:'Trophy Room',       type:'background', cost:12000, tier:5, svg:'bg_trophyroom' },
};
A.CRICK_ACCESSORIES = CRICK_ACCESSORIES;

A.getCrickAccessory = function(type) {
  var key = (A.DB && A.DB.get('crick_accessory_' + type)) || ACCESSORY_DEFAULTS[type] || 'none';
  return CRICK_ACCESSORIES[key] || null;
};
A.getUnlockedAccessories = function() {
  return (A.DB && A.DB.get('crick_unlocked_accessories')) || Object.values(ACCESSORY_DEFAULTS);
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

  // Reactively read equipped accessories (all 6 slot types)
  function readAccKeys() {
    var out = {};
    A.ACCESSORY_TYPES.forEach(function(t) {
      out[t] = (A.DB && A.DB.get('crick_accessory_' + t)) || ACCESSORY_DEFAULTS[t];
    });
    return out;
  }
  var [accKeys, setAccKeys] = useState(readAccKeys);
  useEffect(function() {
    function onAccUpdate() { setAccKeys(readAccKeys()); }
    window.addEventListener('sc_update', onAccUpdate);
    return function() { window.removeEventListener('sc_update', onAccUpdate); };
  }, []);
  var hatAcc    = CRICK_ACCESSORIES[accKeys.hat];
  var eyesAcc   = CRICK_ACCESSORIES[accKeys.eyes];
  var effectAcc = CRICK_ACCESSORIES[accKeys.effect];
  var batAcc    = CRICK_ACCESSORIES[accKeys.bat];
  var badgeAcc  = CRICK_ACCESSORIES[accKeys.badge];
  var bgAcc     = CRICK_ACCESSORIES[accKeys.background];

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
      // ── Equipped background (rendered behind everything) ────────
      bgAcc && bgAcc.svg === 'bg_sunset' && h(Fragment, null,
        h('rect', { x:0, y:70, width:120, height:50, fill:'#fb923c', opacity:0.18, rx:8 }),
        h('circle', { cx:96, cy:84, r:14, fill:'#fbbf24', opacity:0.35 }),
      ),
      bgAcc && bgAcc.svg === 'bg_floodlights' && h(Fragment, null,
        h('rect', { x:0, y:0, width:120, height:120, fill:'#0f172a', opacity:0.22, rx:8 }),
        h('circle', { cx:14, cy:14, r:9, fill:'#e0f2fe', opacity:0.4 }),
        h('circle', { cx:106, cy:14, r:9, fill:'#e0f2fe', opacity:0.4 }),
      ),
      bgAcc && bgAcc.svg === 'bg_stadium' && h(Fragment, null,
        h('rect', { x:0, y:88, width:120, height:32, fill:'#1e293b', opacity:0.35, rx:6 }),
        h('text', { x:60, y:104, textAnchor:'middle', fontSize:11, opacity:0.5 }, '👏👏👏'),
      ),
      bgAcc && bgAcc.svg === 'bg_aurora' && h(Fragment, null,
        h('path', { d:'M0 30 Q30 10 60 30 T120 30 V0 H0 Z', fill:'#34d399', opacity:0.18 }),
        h('path', { d:'M0 42 Q30 22 60 42 T120 42 V0 H0 Z', fill:'#a78bfa', opacity:0.14 }),
      ),
      bgAcc && bgAcc.svg === 'bg_trophyroom' && h(Fragment, null,
        h('rect', { x:0, y:0, width:120, height:120, fill:'#451a03', opacity:0.12, rx:8 }),
        h('text', { x:18, y:100, fontSize:14, opacity:0.55 }, '🏆'),
        h('text', { x:92, y:30, fontSize:12, opacity:0.5 }, '🏆'),
      ),

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
      effectAcc && effectAcc.svg === 'fx_petals' && h(Fragment, null,
        h('text', { x: 16, y: 36, fontSize: 14, opacity: 0.8 }, '🌸'),
        h('text', { x: 100, y: 92, fontSize: 13, opacity: 0.7 }, '🌸'),
      ),
      effectAcc && effectAcc.svg === 'fx_smoke' && h('text', { x: 60, y: 118, textAnchor:'middle', fontSize: 20, opacity: 0.55 }, '💨'),
      effectAcc && effectAcc.svg === 'fx_confetti' && h(Fragment, null,
        h('text', { x: 22, y: 24, fontSize: 13, opacity: 0.85 }, '🎉'),
        h('text', { x: 96, y: 100, fontSize: 13, opacity: 0.8 }, '🎊'),
      ),
      effectAcc && effectAcc.svg === 'fx_galaxy' && h('text', { x: 60, y: 22, textAnchor:'middle', fontSize: 16, opacity: 0.85 }, '🌌'),
      effectAcc && effectAcc.svg === 'fx_rainbow' && h('path', {
        d: 'M14 100 Q60 50 106 100', fill:'none', strokeWidth: 5, opacity: 0.7,
        stroke: 'url(#sc-rainbow-grad)',
      }),
      effectAcc && effectAcc.svg === 'fx_rainbow' && h('defs', null,
        h('linearGradient', { id:'sc-rainbow-grad', x1:'0%', y1:'0%', x2:'100%', y2:'0%' },
          h('stop', { offset:'0%',  stopColor:'#ef4444' }),
          h('stop', { offset:'33%', stopColor:'#facc15' }),
          h('stop', { offset:'66%', stopColor:'#22c55e' }),
          h('stop', { offset:'100%',stopColor:'#3b82f6' }),
        )
      ),

      eyesAcc && eyesAcc.svg === 'eyes_shades' && h('rect', { x: 32, y: 49, width: 56, height: 12, rx: 5, fill: '#0f172a', opacity: 0.92 }),
      eyesAcc && eyesAcc.svg === 'eyes_nerd' && h(Fragment, null,
        h('circle', { cx:43, cy:54, r:11, fill:'none', stroke:'#1f2937', strokeWidth:3 }),
        h('circle', { cx:77, cy:54, r:11, fill:'none', stroke:'#1f2937', strokeWidth:3 }),
        h('line',   { x1:54, y1:54, x2:66, y2:54, stroke:'#1f2937', strokeWidth:3 }),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_monocle' && h(Fragment, null,
        h('circle', { cx:77, cy:54, r:11, fill:'none', stroke:'#facc15', strokeWidth:2.5 }),
        h('line',   { x1:77, y1:65, x2:74, y2:78, stroke:'#facc15', strokeWidth:2 }),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_visor' && h('path', { d:'M30 47 Q60 38 90 47 L90 56 Q60 49 30 56 Z', fill:'#0ea5e9', opacity:0.85 }),
      eyesAcc && eyesAcc.svg === 'eyes_wink' && h(Fragment, null,
        h('path', { d:'M37 54 Q43 49 49 54', fill:'none', stroke:'#1e1b4b', strokeWidth:2.5, strokeLinecap:'round' }),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_star' && h(Fragment, null,
        h('text', { x: 43, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '⭐'),
        h('text', { x: 77, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '⭐'),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_heart' && h(Fragment, null,
        h('text', { x: 43, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '❤️'),
        h('text', { x: 77, y: 59, textAnchor:'middle', fontSize: 13, fontFamily:'system-ui' }, '❤️'),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_anime' && h(Fragment, null,
        h('ellipse', { cx:43, cy:54, rx:7, ry:9, fill:'#7c3aed' }),
        h('ellipse', { cx:77, cy:54, rx:7, ry:9, fill:'#7c3aed' }),
        h('circle',  { cx:45, cy:51, r:2, fill:'#fff' }),
        h('circle',  { cx:79, cy:51, r:2, fill:'#fff' }),
      ),
      eyesAcc && eyesAcc.svg === 'eyes_laser' && h(Fragment, null,
        h('line', { x1: 43, y1: 54, x2: 8,  y2: 54, stroke:'#ef4444', strokeWidth: 2, opacity: 0.8 }),
        h('line', { x1: 77, y1: 54, x2: 112, y2: 54, stroke:'#ef4444', strokeWidth: 2, opacity: 0.8 }),
      ),

      hatAcc && hatAcc.svg === 'hat_headband' && h('rect', { x: 30, y: 38, width: 60, height: 7, rx: 3.5, fill:'#dc2626', opacity: 0.9 }),
      hatAcc && hatAcc.svg === 'hat_cap' && h('path', { d: 'M30 30 Q60 8 90 30 L90 36 Q60 22 30 36 Z', fill:'#1e3a8a', stroke:'#0f172a', strokeWidth: 1.5 }),
      hatAcc && hatAcc.svg === 'hat_bandana' && h('path', { d: 'M28 32 Q60 18 92 32 L92 38 Q60 26 28 38 Z', fill:'#dc2626', stroke:'#7f1d1d', strokeWidth: 1.2 }),
      hatAcc && hatAcc.svg === 'hat_beanie' && h('path', { d: 'M30 34 Q60 6 90 34 L90 40 L30 40 Z', fill:'#16a34a', stroke:'#14532d', strokeWidth: 1.2 }),
      hatAcc && hatAcc.svg === 'hat_baggy' && h(Fragment, null,
        h('path', { d: 'M28 32 Q60 6 92 32 L92 40 L28 40 Z', fill:'#14532d', stroke:'#052e16', strokeWidth: 1.2 }),
        h('circle', { cx:60, cy:22, r:5, fill:'#facc15' }),
      ),
      hatAcc && hatAcc.svg === 'hat_helmet' && h('path', { d: 'M28 32 Q60 4 92 32 L92 40 L28 40 Z', fill:'#374151', stroke:'#111827', strokeWidth: 1.5 }),
      hatAcc && hatAcc.svg === 'hat_sun' && h('ellipse', { cx:60, cy:32, rx:38, ry:9, fill:'#fde68a', stroke:'#b45309', strokeWidth:1.5 }),
      hatAcc && hatAcc.svg === 'hat_tophat' && h(Fragment, null,
        h('rect', { x: 44, y: 6,  width: 32, height: 24, rx: 2, fill:'#1f2937' }),
        h('rect', { x: 34, y: 28, width: 52, height: 6,  rx: 2, fill:'#1f2937' }),
      ),
      hatAcc && hatAcc.svg === 'hat_party' && h(Fragment, null,
        h('path', { d:'M48 30 L72 30 L60 4 Z', fill:'#ec4899', stroke:'#831843', strokeWidth:1.2 }),
        h('circle', { cx:60, cy:4, r:3, fill:'#fde047' }),
      ),
      hatAcc && hatAcc.svg === 'hat_halo' && h('ellipse', { cx:60, cy:14, rx:18, ry:6, fill:'none', stroke:'#fde047', strokeWidth:3, opacity:0.9 }),
      hatAcc && hatAcc.svg === 'hat_crown' && h('path', { d: 'M34 32 L40 18 L52 30 L60 14 L68 30 L80 18 L86 32 Z', fill:'#facc15', stroke:'#92400e', strokeWidth: 1.2 }),

      // ── Bats (held, swung in on cheer via shared #...-bat group) ─
      batAcc && batAcc.svg === 'bat_classic' && h('g', { transform:'translate(90,30) rotate(28)' },
        h('rect', { x:0, y:0, width:6, height:24, rx:2, fill:'#d4a76a' }),
        h('rect', { x:-2, y:20, width:10, height:14, rx:3, fill:'#b8763a' }),
      ),
      batAcc && batAcc.svg === 'bat_signature' && h('g', { transform:'translate(90,30) rotate(28)' },
        h('rect', { x:0, y:0, width:6, height:24, rx:2, fill:'#e2c08d' }),
        h('rect', { x:-2, y:20, width:10, height:14, rx:3, fill:'#92400e' }),
        h('line', { x1:1, y1:4, x2:1, y2:18, stroke:'#7c2d12', strokeWidth:1 }),
      ),
      batAcc && batAcc.svg === 'bat_carbon' && h('g', { transform:'translate(90,30) rotate(28)' },
        h('rect', { x:0, y:0, width:6, height:24, rx:2, fill:'#1f2937' }),
        h('rect', { x:-2, y:20, width:10, height:14, rx:3, fill:'#374151' }),
      ),
      batAcc && batAcc.svg === 'bat_neon' && h('g', { transform:'translate(90,30) rotate(28)' },
        h('rect', { x:0, y:0, width:6, height:24, rx:2, fill:'#22d3ee', opacity:0.9 }),
        h('rect', { x:-2, y:20, width:10, height:14, rx:3, fill:'#0891b2' }),
      ),
      batAcc && batAcc.svg === 'bat_golden' && h('g', { transform:'translate(90,30) rotate(28)' },
        h('rect', { x:0, y:0, width:6, height:24, rx:2, fill:'#fde047' }),
        h('rect', { x:-2, y:20, width:10, height:14, rx:3, fill:'#ca8a04' }),
      ),

      // ── Badges (chest emblem, on the ball body) ──────────────────
      badgeAcc && badgeAcc.svg === 'badge_century' && h('text', { x:60, y:90, textAnchor:'middle', fontSize:13 }, '💯'),
      badgeAcc && badgeAcc.svg === 'badge_hattrick' && h('text', { x:60, y:90, textAnchor:'middle', fontSize:13 }, '🎩'),
      badgeAcc && badgeAcc.svg === 'badge_armband' && h('rect', { x:48, y:84, width:24, height:6, rx:2, fill:'#1e3a8a', stroke:'#facc15', strokeWidth:1 }),
      badgeAcc && badgeAcc.svg === 'badge_mvp' && h(Fragment, null,
        h('circle', { cx:60, cy:90, r:7, fill:'#facc15', stroke:'#92400e', strokeWidth:1.5 }),
        h('text', { x:60, y:93, textAnchor:'middle', fontSize:7, fontWeight:800 }, 'MVP'),
      ),
      badgeAcc && badgeAcc.svg === 'badge_worldcup' && h('text', { x:60, y:92, textAnchor:'middle', fontSize:14 }, '⭐🏆'),
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
