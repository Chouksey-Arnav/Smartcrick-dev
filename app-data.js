// Save as: app-data.js
// ================================================================
// SmartCrick AI — Data: Icons, Drills, Mental, Workouts, Paths
// app-data.js  ·  loads after app-core.js
// ================================================================
(function () {
'use strict';
const A = window.SC_APP;

// ── Icon Dictionary ───────────────────────────────────────────────
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
  lock:'<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  book:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
};
A.IC = IC;

// ── Drill category config ─────────────────────────────────────────
const DRILL_CATS = [
  {id:'batting',      label:'Batting',      icon:'bat',        from:'#1d4ed8', to:'#4338ca', text:'#60a5fa'},
  {id:'bowling',      label:'Bowling',      icon:'ball',       from:'#dc2626', to:'#ea580c', text:'#f87171'},
  {id:'fielding',     label:'Fielding',     icon:'navigation', from:'#059669', to:'#0d9488', text:'#34d399'},
  {id:'wicketkeeping',label:'Keeping',      icon:'glove',      from:'#0d9488', to:'#0891b2', text:'#2dd4bf'},
  {id:'fitness',      label:'Fitness',      icon:'dumbbell',   from:'#c2410c', to:'#d97706', text:'#fb923c'},
  {id:'mental',       label:'Mental',       icon:'brain',      from:'#6d28d9', to:'#4f46e5', text:'#a78bfa'},
];
const LVL_BADGE = {
  beginner:    {bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.3)',  color:'#4ade80', label:'Beginner'},
  intermediate:{bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.3)', color:'#60a5fa', label:'Intermediate'},
  advanced:    {bg:'rgba(249,115,22,0.12)', border:'rgba(249,115,22,0.3)', color:'#fb923c', label:'Advanced'},
};
A.DRILL_CATS = DRILL_CATS;
A.LVL_BADGE = LVL_BADGE;

// ── DRILLS ────────────────────────────────────────────────────────
const DRILLS = [
  {id:'b001',category:'batting',title:'Cover Drive Mastery',skill_level:'beginner',duration_minutes:15,xp_value:70,video_id:'HhEQQKnXqnw',description:'Perfect the most elegant stroke in cricket. Master front elbow, head position, and the flowing high follow-through that separates average from elite batsmen.',steps:['Set side-on stance, bat raised in backlift','Watch ball seam from the bowler\'s hand — track it all the way','Step forward, weight transferring to front foot','Drive through the line, full bat face presented to cover','Head over ball at point of contact — eyes level','High flowing follow-through pointing toward cover point'],tips:'Keep front elbow HIGH, pointing at mid-on. Head stays perfectly still through contact.',target_metric:'10 consecutive clean drives, all finding the cover boundary'},
  {id:'b002',category:'batting',title:'Pull Shot Power',skill_level:'intermediate',duration_minutes:20,xp_value:90,video_id:'2f8okmqYpg8',description:'Dominate short-pitched bowling with authority. The pull shot turns the short ball from a threat into a guaranteed boundary when executed correctly.',steps:['Read short delivery early from bowler\'s release point','Rock back fast — weight fully onto back foot','Get inside the line of the ball — position inside it','Swing bat in a powerful horizontal arc at shoulder height','Roll wrists over at contact — keeps it along the ground','Power follow-through toward mid-wicket'],tips:'Identify the length EARLY — early positioning means everything else is automatic.',target_metric:'15 controlled pull shots, 10 finding the boundary'},
  {id:'b003',category:'batting',title:'Sweep Shot vs Spin',skill_level:'intermediate',duration_minutes:18,xp_value:85,video_id:'kLpGM8q_bk0',description:'Dominate spin bowling with the sweep. A well-executed sweep disrupts field settings, frustrates spinners, and forces bowling changes.',steps:['Read full delivery from spinner early','Step forward, drop leading knee toward pitch','Get to pitch of ball — bat must meet ball under your eyes','Swing bat in horizontal arc, rolling wrists at contact','CRITICAL: contact ball in front of pad — not beside it','Follow through toward fine leg or mid-wicket depending on width'],tips:'Commit FULLY to the sweep. Half-hearted attempts result in LBW or top edge. All or nothing.',target_metric:'10 clean sweeps in a row, none miscuing'},
  {id:'b004',category:'batting',title:'Cut Shot Technique',skill_level:'intermediate',duration_minutes:18,xp_value:85,video_id:'2f8okmqYpg8',description:'Attack anything short and wide outside off stump. The cut shot is your boundary weapon whenever bowlers err with width.',steps:['Identify short-wide delivery early','Rock back and across the crease decisively','Position body BEHIND the line — inside the bounce trajectory','Downward arc with bat — cut INTO the ground firmly','Hit firmly through the top half of the ball','Finish with bat pointing toward point or backward point'],tips:'Play LATE — the later you play it, the finer the angle, the more impossible to field.',target_metric:'20 cut shots finding the target zone past point'},
  {id:'b005',category:'batting',title:'T20 Power Hitting',skill_level:'advanced',duration_minutes:25,xp_value:120,video_id:'B0XOcaRMBP4',description:'Maximize boundary-hitting in T20 cricket. Strike rates above 150 sustained across 30 balls require correct weight transfer, full bat speed, and decisive shot selection.',steps:['Read the field and plan your shot BEFORE ball is bowled','Full delivery: drive over mid-on or mid-off into the gap','Short delivery: aggressive upper-cut or powerful pull','Yorker: dig out with an open face or whip through leg side','Wide: inside-out drive or savage cut','Reset your mental state completely between every delivery'],tips:'A bold pre-planned shot executed with conviction beats improvised aggression every time.',target_metric:'Strike rate 150+ sustained across a full 30-ball simulation'},
  {id:'b006',category:'batting',title:'Defensive Block Foundation',skill_level:'beginner',duration_minutes:12,xp_value:55,video_id:'HhEQQKnXqnw',description:'Build an unbreakable defensive technique. Every great innings is built on the foundation of a technically sound defensive block.',steps:['Set correct stance — feet shoulder-width, weight balanced','Watch ball from the bowler\'s hand all the way to bat face','For good-length: stay in crease, lean weight forward','Present full face of bat to the ball — no angle','SOFT hands at contact — let the ball deaden against the bat','Ball should drop harmlessly at your feet'],tips:'Relaxed hands = ball drops dead. Tense hands = caught at short leg. Relax.',target_metric:'20 consecutive technically correct defensive blocks'},
  {id:'b007',category:'batting',title:'Slog Sweep over Cow Corner',skill_level:'intermediate',duration_minutes:18,xp_value:100,video_id:'kLpGM8q_bk0',description:'The aggressive T20 weapon against spin. Clear the mid-wicket boundary reliably with perfect contact, timing, and commitment.',steps:['Read full delivery from spinner','Step forward with deep knee bend — get very low to the pitch','Full horizontal bat arc swinging much higher than standard sweep','Make contact WELL IN FRONT of the pad — not beside it','Roll wrists powerfully at impact — close the face over','Follow through lofted powerfully toward cow corner'],tips:'Contact in FRONT of pad prevents going straight up. This is the key technical difference.',target_metric:'8 of 12 slog sweeps landing in the cow corner zone'},
  {id:'b008',category:'batting',title:'Ramp Shot over Keeper',skill_level:'advanced',duration_minutes:15,xp_value:130,video_id:'B0XOcaRMBP4',description:'Redirect pace bowling over the wicketkeeper\'s head for guaranteed boundaries. The ultimate modern T20 weapon against fast bowlers.',steps:['Identify delivery on stumps line — short to good length','Shuffle toward off stump, open your stance wide','Angle bat face skyward toward fine leg — hold frame still','Present bat softly to the line — minimal swing, maximum redirect','Ball deflects up off the face and clears the keeper','Boundary — or minimum 4 if keeper makes a desperate dive'],tips:'Use the pace of the ball — the harder it comes, the further the ramp travels. Do NOT swing.',target_metric:'6 of 15 attempts successfully clearing the keeper'},
  {id:'b009',category:'batting',title:'Reading Spin from Hand',skill_level:'intermediate',duration_minutes:20,xp_value:95,video_id:'kLpGM8q_bk0',description:'Identify which way the ball turns before it pitches — by reading the bowler\'s hand at the point of release. The highest-value skill against quality spin.',steps:['Off-spin: fingers roll OVER the top of ball at release — turns away from right-hander','Leg-spin: wrist cocks outward at release — turns away from right-hander (more)','Googly: same wrist position as leg-spin but ball exits back of hand — turns IN','Doosra: front of hand delivery — goes AWAY from right-hander like off-spin','Armball: no wrist turn — comes straight on through','Practice: partner calls the delivery AFTER each ball — develop your own reading instinct'],tips:'Watch the seam orientation and wrist position AT release — not the flight or bounce.',target_metric:'Correctly identify 15 of 20 deliveries before they pitch'},
  {id:'b010',category:'batting',title:'Running Between Wickets',skill_level:'beginner',duration_minutes:20,xp_value:70,video_id:'HhEQQKnXqnw',description:'Turn ones into twos, twos into threes. Sharp running is the cheapest runs in cricket — they require zero skill from the ball, only from you.',steps:['Hit ball — assess IMMEDIATELY from your follow-through position','Call CLEARLY in one word: YES, NO, or WAIT — single clear call','Sprint in a perfectly straight line to the crease — no curves','Ground the bat — not your foot — behind the crease while still moving','Look up immediately: assess second run potential while completing first','Back up CONSTANTLY at the non-striker end — every single delivery'],tips:'Loud, early, definitive calls. Ground the bat over the line while running — not your foot.',target_metric:'Convert 80%+ of hit-1s into running 2s in a drill simulation'},
  {id:'w001',category:'bowling',title:'Line & Length Precision',skill_level:'beginner',duration_minutes:20,xp_value:65,video_id:'7pFfqTFvOEs',description:'The foundation of all wicket-taking. Perfect line and length creates relentless pressure. Sustained pressure makes batsmen make mistakes.',steps:['Mark target zone with tape: good length, off-stump line','Warm up with 3-step approach at 60% pace — 10 balls, find the feel','Full run-up at 80% — 20 balls, count consecutive on-target deliveries','Increase to 100% pace — 15 balls maintaining accuracy','Shift target: bowl at 4th-stump line — threat the outside edge','Final 5: alternate target zones without warning yourself in advance'],tips:'Aim at the TOP of off-stump. Good length means the batsman is UNCOMMITTED — can\'t drive, can\'t pull.',target_metric:'8 of 10 consecutive balls hitting marked target zone'},
  {id:'w002',category:'bowling',title:'Outswing Mastery',skill_level:'intermediate',duration_minutes:20,xp_value:100,video_id:'SZsXolnz5Pg',description:'Master the outswinger — the number one wicket-taker in seam bowling history. Beat the outside edge consistently and edges fly to slip.',steps:['Hold ball with seam vertical pointing toward slip cordon','Wrist stays perfectly UPRIGHT behind ball at point of release','Aim at the TOP of off-stump — the swing does the rest for you','High-arm smooth action — release with full upright seam presentation','Bowl a FULL length — short balls lose swing rapidly','Target: 15-20cm of in-air movement confirmed by a partner'],tips:'NEVER aim at the edge. Target off-stump — the swing finds the edge by itself.',target_metric:'5 consecutive outswingers beating the imaginary outside edge'},
  {id:'w003',category:'bowling',title:'Yorker Death Bowling',skill_level:'advanced',duration_minutes:25,xp_value:130,video_id:'d3wJbkDK-SU',description:'The single most difficult delivery to hit in cricket — the perfect yorker. Execute this reliably under death-over pressure and you become invaluable.',steps:['Place a target marker at the BASE of the stumps — aim small','Full run-up — identical action and release position to all other deliveries','Release point is slightly LATER than for good-length ball','Mental cue: "hit the batsman\'s front toe" — release late, full length','Ball arrives below knee height at the base of the stumps','Variations: straight yorker, wide yorker outside off, slower yorker with same action'],tips:'Think "hit the toe" with every delivery. Consistent release point is the entire secret.',target_metric:'4 of 6 consecutive deliveries landing as perfect yorkers'},
  {id:'w004',category:'bowling',title:'Inswing Bowling',skill_level:'intermediate',duration_minutes:20,xp_value:100,video_id:'SZsXolnz5Pg',description:'Swing the ball late into the right-handed batsman. The inswinger targeting the gap between bat and pad is the most dangerous delivery for LBW.',steps:['Hold ball with seam pointing toward FINE LEG side','Wrist rotates slightly inward at address — a subtle, deliberate change','Aim significantly WIDER of off-stump than usual — let swing bring it to stumps','Bowl FULL length — short inswingers lose movement and get dispatched','Target: gap between bat and front pad of right-hander','LBW or bowled are the natural rewards when line and length are correct'],tips:'Bowl FULL. Short inswingers completely lose movement and become bad deliveries.',target_metric:'Consistent 10cm+ inswing movement confirmed by a training partner'},
  {id:'w005',category:'bowling',title:'Leg Spin Fundamentals',skill_level:'beginner',duration_minutes:20,xp_value:80,video_id:'7pFfqTFvOEs',description:'Master the art of leg-spin. The most difficult bowling skill in cricket — and the most rewarding when it clicks into place.',steps:['Grip: ball rests in the palm, THIRD FINGER primary across the seam','Cock wrist fully back so fingers point downward toward 6 o\'clock','High arm action — bring it over fast and smooth','At release: SNAP third finger rightward and over the top of the ball','Ball rotates right-to-left — leg-break turn confirmed by partner or video','Start at just 10 metres — gradually build up to full length as control develops'],tips:'The snap comes from wrist AND third finger working together — not arm speed alone.',target_metric:'6 of 10 balls showing clear, visible leg-spin turn'},
  {id:'w006',category:'bowling',title:'Off Spin with Drift',skill_level:'beginner',duration_minutes:18,xp_value:70,video_id:'7pFfqTFvOEs',description:'Develop consistent off-spin with drift and turn. Accuracy plus flight plus drift makes you dangerous against any batsman at any level.',steps:['Grip: index and middle finger across seam on top — control grip','Turn ball from right to left with fingers at release — wrist stays behind','Flight the ball up — use the air deliberately to create drift','Bowl on middle-off stump line — force the batsman to play at the ball','Vary pace intentionally — float one ball in 10mph slower than your stock ball','With breeze from behind: drift comes naturally — use it as an extra weapon'],tips:'Use fingers — not wrist. Drift is your invisible weapon when conditions assist you.',target_metric:'7 of 10 balls on correct line and length with visible turn'},
  {id:'w007',category:'bowling',title:'Bouncer Control & Use',skill_level:'advanced',duration_minutes:20,xp_value:120,video_id:'d3wJbkDK-SU',description:'Use the short ball as a genuine weapon. The bouncer is 30% physical skill and 70% psychological warfare — use both correctly.',steps:['Mark the back-of-length zone on the pitch precisely','Full run-up at maximum sustainable pace — don\'t save yourself','Higher arm arc at point of release — aim at back of length','Ball should arrive at the batsman at chest-to-head height','Control zone: NOT wide (free hit) and NOT overpitched (becomes pull food)','Vary target zone: chest, armpit, throat — never bowl the same spot twice consecutively'],tips:'Aim for the ARMPIT — not the head. Vary target zone every time. Predictable bouncers are attacking balls.',target_metric:'5 of 8 bouncers arriving in the target body zone'},
  {id:'w008',category:'bowling',title:'Googly Disguise',skill_level:'intermediate',duration_minutes:20,xp_value:110,video_id:'7pFfqTFvOEs',description:'Bowl the googly with complete disguise — the batsman should not detect it until it has turned the wrong way past their forward defensive block.',steps:['Standard leg-spin grip — practice 5 balls so the action feels natural','SAME action exactly — wrist rolls INWARD at release instead of outward','Ball exits from the BACK of hand — turns INTO right-hander instead of away','Sequence: bowl 5 leg-spinners then 1 googly with identical action and follow-through','Partner attempts to pick which delivery it is from the release position','Perfect the disguise until partner cannot identify it before pitch more than 50% of the time'],tips:'The googly is identical to leg-spin until the last microsecond of wrist action. Identical.',target_metric:'Partner misreads the googly 6 of 10 times correctly'},
  {id:'w009',category:'bowling',title:'Slower Ball Variations',skill_level:'advanced',duration_minutes:22,xp_value:130,video_id:'SZsXolnz5Pg',description:'Off-cutter, leg-cutter, knuckleball — the T20 variations that turn ordinary fast-medium bowlers into match-winners in the death overs.',steps:['Off-cutter: identical action, cut middle finger from OFF to LEG across seam at release','Leg-cutter: cut finger in the OPPOSITE direction — away from body','Knuckleball: grip on knuckles, push ball out slowly — 20-25km/h slower than fastball','Same full run-up and identical arm speed as your fastball — disguise is 100% of the weapon','Practice EACH variation for 10 balls per training session before mixing them','Mix variations without any predictable pattern — never the same twice in a row'],tips:'Disguise is the entire weapon. Identical arm speed = unreadable, unplayable delivery.',target_metric:'Deceive a batting partner with 3 of 4 variations in a sequence'},
  {id:'w010',category:'bowling',title:'Death Bowling Masterclass',skill_level:'advanced',duration_minutes:25,xp_value:150,video_id:'d3wJbkDK-SU',description:'Defend 10+ runs in the last 2 overs of a T20 match. The complete death bowler\'s toolkit — sequencing, variation, and unbreakable nerve.',steps:['Delivery 1: Full straight yorker at stumps — establish the threat immediately','Delivery 2: IDENTICAL action — knuckleball or wide yorker — now they\'re unsure','Delivery 3: Short of good length at body — push them back onto the back foot','Delivery 4: Full again — they\'re scared of the short ball now — yorker territory','Delivery 5: Wide yorker outside off — impossible to hit cleanly from a defensive position','Delivery 6: Full yorker at stumps — predictable because they expect variation at this point'],tips:'Never bowl the same delivery twice consecutively. Sequential variety is an unbreakable weapon.',target_metric:'Concede fewer than 8 runs in a complete simulated death over'},
  {id:'f001',category:'fielding',title:'Ground Fielding Excellence',skill_level:'beginner',duration_minutes:15,xp_value:55,video_id:'0mH8BKDB5Qk',description:'Clean, athletic ground fielding with the long barrier. One clean stop and accurate throw saves more runs than most impressive boundaries score.',steps:['Start in athletic ready position — weight on balls of feet, slightly crouched','Ball arrives: move quickly and ATTACK the ball — never wait for it','Drop to one knee creating a long barrier behind the entire line of the ball','Pick cleanly with BOTH hands — absolutely no one-hand grabs','Stand immediately to balanced throwing position','Complete throw at stumps or to designated partner — 20 repetitions each side'],tips:'Body BEHIND ball every single time. One-hand grabs in match situations lose matches. Both hands always.',target_metric:'20 clean stops of 25 balls from multiple angles and speeds'},
  {id:'f002',category:'fielding',title:'Throwing Accuracy at Stumps',skill_level:'beginner',duration_minutes:20,xp_value:70,video_id:'0mH8BKDB5Qk',description:'Flat, fast, accurate throws directly at the stumps. Run outs are among the most valuable moments in cricket — train this relentlessly.',steps:['Pick ball up cleanly in one single smooth motion','Pivot FAST onto your back foot — explosive rotation','Turn shoulders fully SIDE-ON to the target stumps — crucial for accuracy and power','Arm swings in a HIGH, full arc — shoulder is the pivot point','Release FLAT — aim at the TOP of the stumps — not the ground in front','Complete full follow-through: arm finishes pointing directly at the target'],tips:'Side-on position. High arm. Target: TOP of stumps — not the ground. Flat throw = direct hit.',target_metric:'8 of 15 direct hits on stumps from 30 metres'},
  {id:'f003',category:'fielding',title:'High Catch Confidence',skill_level:'intermediate',duration_minutes:20,xp_value:90,video_id:'0mH8BKDB5Qk',description:'Take high skiers confidently under sun, pressure, and crowd noise. High catches are dropped because of poor footwork, not poor hands.',steps:['Call "MINE" loudly and immediately — own the catch and own the space','Move FAST to get UNDER the ball — not to where it is, but where it will be','Plant feet well with one foot slightly forward for balance adjustment','Cup hands at eye level — fingers pointing upward toward the ball','Watch ball ALL the way into the cup — do not clutch or move hands early','Complete the carry-through — do not stop momentum at the hands'],tips:'Get UNDER the ball early. Move your feet to perfect position THEN take the catch. Feet first.',target_metric:'10 consecutive catches without a drop from varying heights'},
  {id:'f004',category:'fielding',title:'Slip Cordon Reactions',skill_level:'intermediate',duration_minutes:20,xp_value:100,video_id:'Qh5oHMmPb8k',description:'React faster and catch harder in the slip cordon. Soft hands and ultra-fast reactions separate elite slip catchers from everyone else.',steps:['Set up in slip position — hands held LOW at knee height at ALL times','Weight forward on balls of feet — slight lean toward the bat at all times','Partner sends fast deflections via catching cradle or edge board randomly','React to movement — do NOT anticipate direction before the ball is deflected','Take ball anywhere from knee to shoulder height in one fluid movement','Return IMMEDIATELY to starting ready position after every single catch'],tips:'Hands LOW always. React to the SOUND of the edge before your eyes process the movement.',target_metric:'15 of 20 catches taken cleanly at pace from random directions'},
  {id:'f005',category:'fielding',title:'Direct Hit Run Outs',skill_level:'intermediate',duration_minutes:15,xp_value:90,video_id:'0mH8BKDB5Qk',description:'Field a ball at full sprint pace and hit the stumps directly with a flat throw. One direct hit changes a match.',steps:['Ball rolled at medium pace from 20 metres — approach at full sprint','Sprint to intercept at absolute maximum pace — no jogging','Clean pick-up in ONE single motion — no bobble, no adjustment','Pivot IMMEDIATELY — set feet side-on to target stumps in the same motion','Throw FLAT at the near stump — not the far stump from an angle','Entire sequence from pick-up to ball hitting stumps must be under 3.5 seconds'],tips:'Target the NEAR stump. A miss slightly wide still gives the wicketkeeper a stumping chance.',target_metric:'3 direct hits in 10 attempts, all under 3.5 seconds total'},
  {id:'f006',category:'fielding',title:'Boundary Diving Saves',skill_level:'advanced',duration_minutes:25,xp_value:115,video_id:'0mH8BKDB5Qk',description:'Save crucial boundaries with full athletic commitment. Half-dives result in fumbles. Full commitment saves matches.',steps:['Partner drives ball hard toward the boundary from various angles','Sprint at maximum effort — attack the ball aggressively, do not hesitate','When you cannot stop conventionally: DIVE full length, arm fully extended','Stop ball before it reaches the boundary rope — palm facing down to field','Recover immediately to your feet — ball returned accurately in one movement','Train equal repetitions diving to the left AND to the right — no weak side'],tips:'Commit 100% to the dive. A half-dive becomes a fumble and the ball reaches the rope. Commit or don\'t dive.',target_metric:'Save 8 of 10 boundary attempts with athletic diving stops'},
  {id:'k001',category:'wicketkeeping',title:'Keeper Stance & Takes',skill_level:'beginner',duration_minutes:15,xp_value:65,video_id:'Qh5oHMmPb8k',description:'Perfect the wicketkeeping stance — the foundation that every world-class keeper builds their entire game upon.',steps:['Weight on TOES — never on heels throughout the entire delivery','Hands held out in front of body — soft, relaxed, ready','Side-step movement following the ball throughout the delivery from release','Stay LOW throughout — never stand up early to receive the ball','Fingers pointing DOWN for all balls below waist level','Fingers pointing UP for balls above waist — never thumbs up at waist height'],tips:'Never cross your feet laterally to move. Keep hands soft — tense hands drop clean takes.',target_metric:'15 consecutive clean takes across all heights and lines'},
  {id:'k002',category:'wicketkeeping',title:'Stumping Technique',skill_level:'intermediate',duration_minutes:18,xp_value:100,video_id:'Qh5oHMmPb8k',description:'The wicketkeeper\'s signature dismissal. Master the stumping — explosive hands, perfect footwork, and an instant convincing appeal.',steps:['Position directly behind the stumps — within half a metre','Spinner delivers wide or turning delivery — batsman misses or advances','Watch ball travel PAST the batsman\'s back foot before making any movement','Move laterally to take the wide delivery cleanly with soft hands','Single flowing motion: take ball and IMMEDIATELY whip bails off — one movement','Instant loud appeal — HOWZAT every time, regardless of certainty'],tips:'Ball must pass the batsman\'s back foot BEFORE you begin any movement. Under 0.5 seconds is elite class.',target_metric:'10 clean stumpings out of a 30-ball spin-bowling session'},
  {id:'k003',category:'wicketkeeping',title:'Standing Up to Spin',skill_level:'advanced',duration_minutes:25,xp_value:130,video_id:'Qh5oHMmPb8k',description:'Stand directly up to the stumps for all spin bowling — restricts the batsman\'s movement and creates constant stumping opportunities.',steps:['Position directly behind stumps — within one metre at all times','Begin with spinner bowling at HALF pace — build comfort with the position','Take deliveries arriving exactly at the stumps — not deflected wide','For turning delivery: quick explosive lateral swivel — strong hand leading the take','Stumping opportunity identified: whip bails off in one single motion from the take','Personal standard: zero byes — anything above zero is substandard performance'],tips:'This is the hardest skill in wicketkeeping. Build up the practice distance gradually over weeks.',target_metric:'Zero byes conceded across 20 spin deliveries while standing up'},
  {id:'fit001',category:'fitness',title:'Cricket Sprint Protocol',skill_level:'beginner',duration_minutes:20,xp_value:70,description:'Develop explosive sprint speed for running between wickets and explosive fielding starts. The first 10 metres separates elite fielders from the rest.',steps:['Dynamic warm-up: high knees, butt kicks, leg swings — 5 full minutes','Sprint 22 yards (one crease to crease): 10 repetitions with 30 seconds rest','Focus on explosive first step — drive out with maximum force','Drive arms hard — arms are the engine that drives leg speed','Stay LOW for first 5 metres — do not straighten up early','Cool down: easy jog 3 minutes'],tips:'The first 10 metres is everything in cricket fielding. Train the start exclusively.',target_metric:'22 yards consistently under 3.2 seconds'},
  {id:'fit002',category:'fitness',title:'Cricket Core Stability',skill_level:'beginner',duration_minutes:15,xp_value:65,description:'Core strength for batting power generation, bowling action stability, and fielding agility. Non-negotiable for all cricketers at every level.',steps:['Plank: 3 × 45 seconds — straight line from ankles through shoulders','Side plank: 2 × 30 seconds each side — hip up, body straight','Dead bugs: 3 × 10 each side — slow and completely controlled throughout','Bird dog: 3 × 10 each side — opposite arm and leg fully extended','Russian twists: 3 × 20 — use a cricket ball as weight resistance','Rest 45 seconds between all sets — no shorter'],tips:'Brace your core actively on every single repetition. Breathe OUT on the effort phase.',target_metric:'Complete the full circuit 3 times with perfect form throughout'},
  {id:'fit003',category:'fitness',title:'Bowling Shoulder Pre-Hab',skill_level:'beginner',duration_minutes:15,xp_value:60,description:'Protect your bowling shoulder with this essential routine. Every bowler must complete this BEFORE every session — non-negotiable injury insurance.',steps:['Shoulder circles slow and large: 20 forward, 20 backward — full range','External rotation with resistance band: 3 × 15 each arm — controlled','Internal rotation: 3 × 15 each arm — controlled return','Scapular retractions: 3 × 15 — squeeze shoulder blades firmly together','YTW exercise: 3 × 10 each letter — strengthens the posterior rotator cuff','Sleeper stretch: 60 seconds on each side — essential for internal rotation'],tips:'15 minutes of prevention = years of injury-free bowling. There are no exceptions to this rule.',target_metric:'Complete pre-hab before 100% of all bowling sessions — no exceptions'},
  {id:'fit004',category:'fitness',title:'Explosive Leg Power',skill_level:'advanced',duration_minutes:25,xp_value:110,description:'Develop devastating leg power for batting explosiveness, bowling run-up speed, and fielding agility from a complete standstill.',steps:['Box jumps: 4 × 8 repetitions — maximum height, land absolutely silently','Jump squats: 3 × 10 — controlled descent, explosive ascent with full hip extension','Single-leg bounds: 3 × 6 each leg — driving off one leg for maximum horizontal distance','Sprint starts from deep crouch: 5 × 30 metres at absolute maximum effort','Rest 90 seconds between ALL explosive sets — full recovery is mandatory','Landing noisily = poor power transfer — refine until landings are completely silent'],tips:'Full hip extension at take-off. Silent landing = efficient power transfer = more explosive output.',target_metric:'Standing broad jump consistently reaching 2.0 metres'},
  {id:'fit005',category:'fitness',title:'Agility Ladder Footwork',skill_level:'intermediate',duration_minutes:20,xp_value:90,description:'Rapid footwork patterns for explosive fielding starts and quick running between wickets. Fast feet win run outs and save boundaries.',steps:['Single steps — one foot per box — 2 minutes continuous without hesitation','Two feet per box — jump in and out — 2 minutes continuous','Lateral shuffle through every box sideways — 2 minutes each side','In-in-out-out pattern — 2 minutes — the hardest coordination pattern','Sprint through at maximum possible speed: 6 × 10 metres full recovery between','Cool down: 3 minutes easy walking'],tips:'Light, fast, precise foot contacts only. Arms drive leg speed — pump them hard and high.',target_metric:'Complete all patterns under 20 minutes with zero ladder contacts'},
  {id:'ment001',category:'mental',title:'Batting Visualization',skill_level:'beginner',duration_minutes:15,xp_value:65,description:'Mentally rehearse your perfect innings in vivid, multisensory detail. Neuroscience confirms: the brain cannot distinguish between real and vividly imagined practice.',steps:['Close your eyes. Relax every muscle — scan body from head to toe systematically.','Picture yourself walking to the crease with total, earned confidence','Face 10 deliveries in your mind — play each one with perfect technique','Include every sensory detail: bat feel in hands, spikes on grass, crowd sounds, warm air','See each delivery arrive and play your best technically perfect shot','Open your eyes. Carry this mental image vividly and specifically into your next real session.'],tips:'Be vivid, specific, and multi-sensory. The more real it feels, the more real the neural pathways become.',target_metric:'Complete a 10-minute visualization session every single day for 2 weeks'},
  {id:'ment002',category:'mental',title:'Between-Ball Reset Routine',skill_level:'intermediate',duration_minutes:12,xp_value:80,description:'Master the psychological routine between deliveries. Elite batsmen use this time to RESET completely — not to ruminate on what just happened.',steps:['After ball: look AWAY from the bowler immediately — break eye contact completely','Take ONE deep, slow, deliberate reset breath — fully exhale every bit of tension','Tap bat on ground exactly twice — physical anchor to the present moment only','Scan the field: note any changes to field positions since the last delivery','Look down at the bat handle to physically refocus your gaze and attention','New stance position — fresh psychological start — every single ball is the first ball'],tips:'Make this routine completely AUTOMATIC through 100% consistent practice. Same every time, no exceptions.',target_metric:'Consistent complete routine used in a 20-ball simulation without deviation'},
  {id:'ment003',category:'mental',title:'Pressure Inoculation',skill_level:'advanced',duration_minutes:20,xp_value:130,description:'Simulate extreme match pressure in training so real matches feel familiar and manageable. This is the method elite athletes use worldwide.',steps:['Set a realistic high-pressure scenario: 5 runs needed from last over, 2 wickets remaining','Real bowler, real fielders, real scorekeeper, and vocal watching spectators','Both teams fully understand the scenario — pressure is at its maximum','Do NOT rush — use your complete between-ball routine as you would in a real match','Assess situation logically before each ball — make a clear plan — execute the plan','Full debrief afterward: what worked? What did you feel? What exactly would you change?'],tips:'Pressure is a privilege given only to those who matter. Actively seek it in every training session.',target_metric:'Complete 6 high-pressure scenario simulations while maintaining full routine'},
];
A.DRILLS = DRILLS;

// ── Mental Session Categories ─────────────────────────────────────
const MENT_CATS = [
  {id:'all',            label:'All',        icon:'brain',      from:'#6d28d9', to:'#4f46e5'},
  {id:'favorites',      label:'Favourites', icon:'heart',      from:'#be123c', to:'#e11d48'},
  {id:'focus',          label:'Focus',      icon:'crosshair',  from:'#1d4ed8', to:'#4338ca'},
  {id:'confidence',     label:'Confidence', icon:'shield',     from:'#c2410c', to:'#d97706'},
  {id:'recovery',       label:'Recovery',   icon:'heart',      from:'#15803d', to:'#059669'},
  {id:'pre-performance',label:'Pre-Match',  icon:'zap',        from:'#b45309', to:'#d97706'},
  {id:'pressure',       label:'Pressure',   icon:'flame',      from:'#be123c', to:'#dc2626'},
  {id:'visualization',  label:'Visualize',  icon:'sparkles',   from:'#6d28d9', to:'#7c3aed'},
  {id:'match-day-calm', label:'Calm',       icon:'wind',       from:'#0d9488', to:'#0891b2'},
  {id:'pro-mental',     label:'Pro',        icon:'crown',      from:'#3730a3', to:'#4c1d95'},
];
A.MENT_CATS = MENT_CATS;

// ── Mental Session Factory ────────────────────────────────────────
const MI = {
  focus:['Find a comfortable seated position and gently close your eyes.','Take three slow, complete breaths to fully settle your nervous system.','Bring all your attention completely to this present moment only.','Notice any thoughts that arise — acknowledge each one and release it.','Narrow your entire focus to a single precise point of concentration.','Maintain this focused state through the remainder of the session.'],
  confidence:['Sit tall with excellent posture and take three powerful, diaphragmatic breaths.','Recall your single greatest performance moment — relive it with complete detail.','Feel that exact confidence filling every cell of your body right now.','Repeat your most important personal performance affirmation slowly three times.','Visualize yourself performing with complete belief and natural authority.','Step forward carrying this energy directly into your next performance.'],
  recovery:['Find a quiet space and allow your entire body to fully and deeply relax.','Take five long breaths — deliberately releasing all held tension on every exhale.','Acknowledge frustration without any self-judgment — it is completely natural and valid.','Remind yourself truthfully: every single setback is an essential part of the journey.','Identify one specific clear learning point you can actively take forward today.','Make a firm commitment to showing up tomorrow with completely fresh energy and focus.'],
  'pre-performance':['Begin with three slow, grounding breaths — inhale through nose, exhale through mouth.','Scan your body completely from head to toe, releasing every point of tension.','Visualize walking to your position with calm, certain, earned authority.','See yourself executing your most important skill perfectly on the very first ball.','Feel the productive excitement and complete physical readiness building within you.','Step forward now with total intention — you have prepared and you are genuinely ready.'],
  pressure:['Acknowledge the pressure you feel — it means this genuinely matters to you.','Breathe in for 4 slow counts, hold for 2, then exhale fully for 6 counts.','Remember: pressure is only given to those trusted to operate at this level.','Focus completely and exclusively on what you can actually control — your process only.','Commit to your specific process — one ball, one breath, one precise moment at a time.','Step forward now with calm, completely earned confidence built through your preparation.'],
  visualization:['Close your eyes and progressively relax every single muscle group in your body.','Create an extremely vivid, completely detailed mental image of your performance environment.','See yourself performing your key cricket skill perfectly and with complete ease and flow.','Add full sensory details: sounds, smells, temperature, physical sensations of peak performance.','Watch yourself succeed completely — feel the deep, earned satisfaction entirely in your body.','Open your eyes and carry this sharp, detailed vision directly into your actual performance.'],
  'match-day-calm':['Take your position and close your eyes gently and with complete deliberateness.','Breathe in slowly for 4 counts, hold briefly, release fully for 4 counts.','Feel your feet completely grounded, your body fully present and stable.','Release ALL thoughts connected to outcomes — they are not yours to hold or control.','Trust your preparation completely and specifically — you have done the necessary work.','Open your eyes now with complete calm and clear, confident readiness to perform.'],
  'pro-mental':['Enter the deepest available stillness through sustained controlled breathing.','Access your peak mental state deliberately through concentrated, intentional focus.','Engage your elite competitor mindset fully — you have been in this position before.','Visualize your complete performance in vivid detail from confident start to triumphant finish.','Lock in your precise process cues and personal performance triggers with clarity.','Step out now as the athlete you have consistently, deliberately trained yourself to become.'],
};
A.MI = MI;

function mkM(id,title,cat,dur,xp,premium) {
  var isPremium=premium===true;
  var mins=Math.floor(dur/60);
  var n=Math.max(3,Math.min(6,Math.ceil(dur/90)));
  var sd=Math.floor(dur/n);
  var pool=MI[cat]||MI.focus;
  var steps=pool.slice(0,n).map(function(instruction,i){ return { instruction:instruction, duration_seconds:i===n-1?dur-sd*(n-1):sd }; });
  return { id:id,title:title,category:cat,duration_seconds:dur,xp_value:xp,is_premium:isPremium,
    description:'A '+mins+'-minute '+cat.replace(/-/g,' ')+' session to build your mental game.',steps:steps };
}
A.mkM = mkM;

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
A.MENTAL_SESSIONS = MENTAL_SESSIONS;

// ── Fitness config ────────────────────────────────────────────────
const FIT_LEVELS = [
  {id:'beginner',    label:'Beginner',     icon:'🌱', desc:'New to training or returning after break'},
  {id:'intermediate',label:'Intermediate', icon:'⚡', desc:'Training 3-4x per week consistently'},
  {id:'advanced',    label:'Advanced',     icon:'🔥', desc:'Training 5-6x with high intensity'},
  {id:'pro',         label:'Pro',          icon:'💎', desc:'Elite-level daily training'},
];
const FIT_TARGETS = [
  {id:'full-body',   label:'Full Body',   icon:'activity'}, {id:'chest',      label:'Chest',      icon:'heart'},
  {id:'back',        label:'Back',        icon:'layers'},   {id:'shoulders',  label:'Shoulders',  icon:'wind'},
  {id:'arms',        label:'Arms',        icon:'dumbbell'}, {id:'legs',       label:'Legs',       icon:'zap'},
  {id:'core',        label:'Core',        icon:'crosshair'},{id:'glutes',     label:'Glutes',     icon:'dumbbell'},
];
const FIT_GOALS = [
  {id:'build-muscle',      label:'Build Muscle',  icon:'dumbbell', desc:'Strength and size gains'},
  {id:'lose-weight',       label:'Lose Weight',   icon:'flame',    desc:'Fat burn and conditioning'},
  {id:'improve-endurance', label:'Endurance',     icon:'activity', desc:'Stamina and cricket fitness'},
];
const FIT_DURS = [
  {id:'<10',   label:'Under 10 min', icon:'zap'},   {id:'10-15', label:'10-15 min', icon:'clock'},
  {id:'15-20', label:'15-20 min',    icon:'timer'},  {id:'20-25', label:'20-25 min', icon:'clock'},
  {id:'25+',   label:'25+ min',      icon:'trophy'},
];
A.FIT_LEVELS = FIT_LEVELS;
A.FIT_TARGETS = FIT_TARGETS;
A.FIT_GOALS = FIT_GOALS;
A.FIT_DURS = FIT_DURS;

// ── Workouts ──────────────────────────────────────────────────────
function mkW(id,name,level,target,goal,durCat,exercises,durMin,xp) {
  return {id:id,name:name,level:level,target:target,goal:goal,duration_category:durCat,exercises:exercises,duration_minutes:durMin,xp_value:xp};
}
A.mkW = mkW;

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

  // ── Cricket-Specific & Gap-Filler Workouts (20) ─────────────
  mkW('wc001','Cricket Bowling Power','intermediate','back','build-muscle','20-25',6,22,155),
  mkW('wc002','Batting Explosive Strength','intermediate','core','build-muscle','20-25',6,22,160),
  mkW('wc003','Fielding Agility Circuit','intermediate','full-body','improve-endurance','15-20',7,18,148),
  mkW('wc004','Wicket Keeper Endurance','intermediate','legs','improve-endurance','20-25',6,22,155),
  mkW('wc005','Cricket Warm-Up Protocol','beginner','full-body','improve-endurance','<10',5,8,65),
  mkW('wc006','Speed & Agility HIIT','advanced','full-body','improve-endurance','20-25',7,22,208),
  mkW('wc007','Rotational Power Builder','advanced','core','build-muscle','15-20',5,17,182),
  mkW('wc008','Explosive Lower Body','advanced','legs','build-muscle','20-25',6,22,195),
  mkW('wc009','Shoulder Armour','beginner','shoulders','build-muscle','10-15',4,12,78),
  mkW('wc010','Core Circuit Blast','beginner','core','lose-weight','10-15',5,12,80),
  mkW('wc011','Pulling Power Builder','intermediate','back','build-muscle','15-20',5,17,142),
  mkW('wc012','Chest & Tricep Superset','intermediate','chest','build-muscle','15-20',5,17,145),
  mkW('wc013','Lower Body Fat Burner','beginner','legs','lose-weight','10-15',4,12,82),
  mkW('wc014','Upper Body Shred','intermediate','chest','lose-weight','15-20',5,17,140),
  mkW('wc015','Full Body Metabolic Burn','advanced','full-body','lose-weight','20-25',7,22,215),
  mkW('wc016','Pro Conditioning Circuit','pro','full-body','improve-endurance','25+',8,28,315),
  mkW('wc017','Elite Strength Foundations','pro','full-body','build-muscle','25+',7,28,322),
  mkW('wc018','Arm Sculptor','beginner','arms','build-muscle','10-15',4,12,76),
  mkW('wc019','Glute & Hamstring Focus','intermediate','glutes','build-muscle','15-20',5,17,142),
  mkW('wc020','Athletic Performance Elite','pro','full-body','improve-endurance','25+',8,28,328),
];
A.WORKOUTS = WORKOUTS;

function findWorkouts(level,target,goal,durCat) {
  var m=function(w,lv,tg,gl,dc){return w.level===lv&&(tg==='any'||w.target===tg)&&(gl==='any'||w.goal===gl)&&(dc==='any'||w.duration_category===dc);};
  var r=WORKOUTS.filter(function(w){return m(w,level,target,goal,durCat);}); if(r.length) return r;
  r=WORKOUTS.filter(function(w){return m(w,level,target,goal,'any');}); if(r.length) return r;
  r=WORKOUTS.filter(function(w){return m(w,level,target,'any','any');}); if(r.length) return r;
  r=WORKOUTS.filter(function(w){return m(w,level,'any','any','any');}); if(r.length) return r;
  var fb={pro:'advanced',advanced:'intermediate',intermediate:'beginner',beginner:'beginner'};
  r=WORKOUTS.filter(function(w){return w.level===level||w.level===fb[level];});
  return r.length?r:[WORKOUTS[0]];
}
A.findWorkouts = findWorkouts;

// ── Skill Paths ────────────────────────────────────────────────────
const SKILL_PATHS = [
  { id:'batting', title:'Batting Mastery', icon:'bat', desc:'From solid defence to dominant attacking play — the complete batsman blueprint.',
    color:'from-blue-600 to-indigo-700', textColor:'text-blue-300', borderColor:'border-blue-500/50', accent:'#3b82f6',
    levels:[
      { id:'beginner',     label:'Club Cricketer',    icon:'bat',   xpPerDay:80,  desc:'Fundamentals, defensive technique, and basic stroke play.', sampleDrills:['Defensive Block Foundation','Cover Drive Mastery','Running Between Wickets'] },
      { id:'intermediate', label:'District Player',   icon:'bat',   xpPerDay:120, desc:'Shot expansion, spin play, and core T20 skills.', sampleDrills:['Cut Shot Technique','Sweep Shot vs Spin','Pull Shot Power'] },
      { id:'advanced',     label:'State Performer',   icon:'bat',   xpPerDay:160, desc:'Power hitting, pressure batting, and match-winning skills.', sampleDrills:['T20 Power Hitting','Ramp Shot over Keeper','Pressure Inoculation'] },
      { id:'pro',          label:'Elite Cricketer',   icon:'crown', xpPerDay:200, desc:'Elite refinement, match simulation, and peak performance.', sampleDrills:['Reading Spin from Hand','Between-Ball Reset Routine','Complete Shot Arsenal'] }
    ]},
  { id:'bowling', title:'Bowling Excellence', icon:'ball', desc:'Build line and length, develop all variations, and become unplayable.',
    color:'from-red-600 to-orange-600', textColor:'text-red-300', borderColor:'border-red-500/50', accent:'#ef4444',
    levels:[
      { id:'beginner',     label:'Club Bowler',    icon:'ball',  xpPerDay:75,  desc:'Correct action, basic control, and seam presentation.', sampleDrills:['Line & Length Precision','Off Spin with Drift','Leg Spin Fundamentals'] },
      { id:'intermediate', label:'District Bowler',icon:'ball',  xpPerDay:115, desc:'Swing bowling, spin variations, and field setting.', sampleDrills:['Outswing Mastery','Inswing Bowling','Googly Disguise'] },
      { id:'advanced',     label:'State Bowler',   icon:'ball',  xpPerDay:155, desc:'Death bowling, yorkers, and pressure bowling mastery.', sampleDrills:['Yorker Death Bowling','Bouncer Control & Use','Slower Ball Variations'] },
      { id:'pro',          label:'Elite Bowler',   icon:'crown', xpPerDay:195, desc:'Complete mastery of swing, seam, spin, and pace variety.', sampleDrills:['Death Bowling Masterclass','Complete Variation Arsenal','Match Simulation'] }
    ]},
  { id:'fielding', title:'Fielding Athlete', icon:'navigation', desc:'Become the player every captain wants — quick, accurate, fearless, match-winning.',
    color:'from-emerald-600 to-teal-600', textColor:'text-emerald-300', borderColor:'border-emerald-500/50', accent:'#10b981',
    levels:[
      { id:'beginner',     label:'Safe Pair of Hands',icon:'navigation', xpPerDay:65,  desc:'Clean stops, basic catching, and safe accurate returns.', sampleDrills:['Ground Fielding Excellence','High Catch Confidence','Throwing Accuracy at Stumps'] },
      { id:'intermediate', label:'Athletic Fielder',  icon:'navigation', xpPerDay:100, desc:'Slip catching, direct hits, and boundary saving.', sampleDrills:['Slip Cordon Reactions','Direct Hit Run Outs','Boundary Diving Saves'] },
      { id:'advanced',     label:'Elite Fielder',     icon:'navigation', xpPerDay:140, desc:'Elite boundary work, run-out artistry, and impact fielding.', sampleDrills:['Direct Hit Run Outs','Boundary Diving Saves','Pressure Catches'] },
      { id:'pro',          label:'World-Class Fielder',icon:'crown',     xpPerDay:180, desc:'Redefine the standard of fielding excellence.', sampleDrills:['Full Fielding Masterclass','Captaining the Field','Zero Boundaries Conceded'] }
    ]},
  { id:'allrounder', title:'All-Rounder Path', icon:'star', desc:'The complete cricketer — contribute meaningfully with bat, ball, and in the field.',
    color:'from-purple-600 to-pink-600', textColor:'text-purple-300', borderColor:'border-purple-500/50', accent:'#a855f7',
    levels:[
      { id:'beginner',     label:'Utility Player',     icon:'star',  xpPerDay:90,  desc:'Solid in two disciplines — reliable, consistent contribution.', sampleDrills:['Cover Drive Mastery','Line & Length Precision','Ground Fielding Excellence'] },
      { id:'intermediate', label:'Impact Player',      icon:'star',  xpPerDay:135, desc:'Match-winning contributions in both disciplines.', sampleDrills:['Pull Shot Power','Outswing Mastery','Slip Cordon Reactions'] },
      { id:'advanced',     label:'Key All-Rounder',    icon:'star',  xpPerDay:175, desc:'Consistently influential in all three disciplines.', sampleDrills:['T20 Power Hitting','Death Bowling Masterclass','Elite Fielding'] },
      { id:'pro',          label:'Complete Cricketer', icon:'crown', xpPerDay:220, desc:'Redefine what an all-rounder brings to the team.', sampleDrills:['Complete Batting Arsenal','Complete Bowling Arsenal','World-Class Fielding'] }
    ]},
];
A.SKILL_PATHS = SKILL_PATHS;

function generateWeekPlan(pathId,levelId) {
  var path=SKILL_PATHS.find(function(p){return p.id===pathId;});
  var lv=path&&path.levels.find(function(l){return l.id===levelId;});
  if(!path||!lv) return [];
  var phases=['Foundation','Development','Integration','Performance','Mastery'];
  var dateStr=A.dateStr, addDays=A.addDays;
  return phases.map(function(phase,wi){
    return {week:wi+1,phase:phase,theme:'Week '+(wi+1)+' — '+phase,
      days:Array.from({length:7},function(_,di){
        if(di===6) return {day:7,label:'Sun',isRest:true,activities:[]};
        var isLight=di===2||di===4;
        var activities=isLight
          ?[{type:'mental',id:'m84',title:'Recovery & Reset',duration:'8 min',xp:65},{type:'drill',id:DRILLS.find(function(d){return d.category==='fitness';})&&DRILLS.find(function(d){return d.category==='fitness';}).id||'fit001',title:'Light Conditioning',duration:'15 min',xp:60}]
          :[{type:'drill',id:path.id==='batting'?'b001':path.id==='bowling'?'w001':'f001',title:lv.sampleDrills[di%lv.sampleDrills.length]||'Skill Session',duration:'20 min',xp:Math.floor(lv.xpPerDay*0.4)},{type:'fitness',id:'wb001',title:'Cricket Fitness',duration:'20 min',xp:Math.floor(lv.xpPerDay*0.3)},{type:'mental',id:'m50',title:'Mental Training',duration:'8 min',xp:Math.floor(lv.xpPerDay*0.3)}];
        return {day:di+1,label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][di],isRest:false,activities:activities,totalXP:activities.reduce(function(s,a){return s+a.xp;},0)};
      })
    };
  });
}
A.generateWeekPlan = generateWeekPlan;

function generateSmartSchedule(focusArea,trainingDays,intensity,weekMondayStr) {
  var monday=new Date(weekMondayStr+'T00:00:00');
  var restPatterns={3:[1,3,5,6],4:[2,4,6],5:[3,6],6:[6],7:[]};
  var restDays=restPatterns[trainingDays]||[6];
  var sessions=[];
  var dateStr=A.dateStr, SCHED_TYPES=A.SCHED_TYPES;
  for(var i=0;i<7;i++){
    var d=new Date(monday); d.setDate(monday.getDate()+i);
    var ds=dateStr(d);
    if(restDays.indexOf(i)!==-1) continue;
    var isHeavy=i%3===0;
    var drillCat=focusArea==='allrounder'?['batting','bowling','fielding'][i%3]:focusArea;
    var drillOptions=DRILLS.filter(function(dd){return dd.category===drillCat&&dd.skill_level==='intermediate';});
    var drillPick=drillOptions[i%drillOptions.length]||DRILLS.find(function(dd){return dd.category===drillCat;})||DRILLS[0];
    var mentalOptions=MENTAL_SESSIONS.filter(function(m){return !m.is_premium;});
    var mentalPick=mentalOptions[i%mentalOptions.length]||MENTAL_SESSIONS[0];
    var workoutPick=WORKOUTS.find(function(w){return w.level==='intermediate'&&w.goal===(isHeavy?'build-muscle':'improve-endurance');})||WORKOUTS[0];
    sessions.push({id:'sch_'+Date.now()+'_'+i+'_a',date:ds,time:'07:00',type:'drill',title:drillPick.title,ref_id:drillPick.id,duration_minutes:drillPick.duration_minutes,xp_value:drillPick.xp_value,status:'pending',notes:'',color:SCHED_TYPES.drill.color});
    if(isHeavy) sessions.push({id:'sch_'+Date.now()+'_'+i+'_b',date:ds,time:'17:00',type:'fitness',title:workoutPick.name,ref_id:workoutPick.id,duration_minutes:workoutPick.duration_minutes,xp_value:workoutPick.xp_value,status:'pending',notes:'',color:SCHED_TYPES.fitness.color});
    sessions.push({id:'sch_'+Date.now()+'_'+i+'_c',date:ds,time:'19:00',type:'mental',title:mentalPick.title,ref_id:mentalPick.id,duration_minutes:Math.floor(mentalPick.duration_seconds/60),xp_value:mentalPick.xp_value,status:'pending',notes:'',color:SCHED_TYPES.mental.color});
  }
  return sessions;
}
A.generateSmartSchedule = generateSmartSchedule;

// ── 30-Day Challenge Data ─────────────────────────────────────────
// WEEK_THEMES — visual config for each week
const WEEK_THEMES = [
  { week:1, theme:'Foundation',  color:'#3b82f6', bg:'rgba(59,130,246,0.10)',  border:'rgba(59,130,246,0.30)',  desc:'Build your training base. One rep at a time.' },
  { week:2, theme:'Development', color:'#10b981', bg:'rgba(16,185,129,0.10)',  border:'rgba(16,185,129,0.30)',  desc:'Grow your game. Drill and mental working together.' },
  { week:3, theme:'Pressure',    color:'#f97316', bg:'rgba(249,115,22,0.10)',   border:'rgba(249,115,22,0.30)',  desc:'Forge mental steel. Thrive where others crack.' },
  { week:4, theme:'Elite',       color:'#f59e0b', bg:'rgba(245,158,11,0.10)',  border:'rgba(245,158,11,0.30)',  desc:'Become elite. This is what separates you.' },
];
A.WEEK_THEMES = WEEK_THEMES;

// SOCIAL_PROOF — mock % of players at each milestone day
const SOCIAL_PROOF = { 10:72, 14:62, 20:51, 25:38, 28:29 };
A.SOCIAL_PROOF = SOCIAL_PROOF;

// DAY30_TASKS — 30 specific daily tasks (replaces generic DAY30)
var DAY30_TASKS = [
  // ── WEEK 1: Foundation (blue) — 1 item each ──────────────────
  { day:1,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'drill',  isRest:false, isMilestone:false,
    title:'Drive 10 Straight Balls',
    desc:'Perfect the cover drive — the foundation of elite batting. Head still, high elbow, flowing follow-through.',
    drillId:'b001', mentalId:null, xp:80, reflectionPrompt:null },
  { day:2,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'mental', isRest:false, isMilestone:false,
    title:'3-Minute Focus Burst',
    desc:'Train your concentration muscle for just 3 minutes. Elite focus starts with small, consistent reps.',
    drillId:null, mentalId:'m01', xp:50, reflectionPrompt:null },
  { day:3,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'drill',  isRest:false, isMilestone:false,
    title:'Defensive Block Foundation',
    desc:'Build an unbreakable defensive technique. The base of every great innings starts here.',
    drillId:'b006', mentalId:null, xp:55, reflectionPrompt:null },
  { day:4,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'mental', isRest:false, isMilestone:false,
    title:'5-4-3-2-1 Grounding',
    desc:'Ground yourself in the present moment. Your pre-training ritual begins here — use it every session.',
    drillId:null, mentalId:'m03', xp:50, reflectionPrompt:null },
  { day:5,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'drill',  isRest:false, isMilestone:false,
    title:'Line & Length Precision',
    desc:'Every great bowler starts here. Perfect control creates perfect pressure. Own your line and length.',
    drillId:'w001', mentalId:null, xp:65, reflectionPrompt:null },
  { day:6,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'mental', isRest:false, isMilestone:false,
    title:'4-7-8 Breath Lock',
    desc:'Master the breath and you master the moment. This breathing technique is used by elite athletes worldwide.',
    drillId:null, mentalId:'m80', xp:50, reflectionPrompt:null },
  { day:7,  week:1, theme:'Foundation', weekColor:'#3b82f6', type:'rest',   isRest:true,  isMilestone:true,
    title:'Foundation Recovery Day',
    desc:'Rest IS training. Your body consolidates a full week of work today. Honour the recovery.',
    drillId:null, mentalId:'m30', xp:20, reflectionPrompt:null },

  // ── WEEK 2: Development (green) — 1 drill + 1 mental ─────────
  { day:8,  week:2, theme:'Development', weekColor:'#10b981', type:'both', isRest:false, isMilestone:false,
    title:'Cover Drive + Confidence',
    desc:'Combine elite technique with belief. Feel your confidence physically building with every ball you hit.',
    drillId:'b001', mentalId:'m21', xp:130, reflectionPrompt:null },
  { day:9,  week:2, theme:'Development', weekColor:'#10b981', type:'both', isRest:false, isMilestone:false,
    title:'Line & Length + Laser Focus',
    desc:'Precision bowling drill paired with elite concentration training. Control the ball. Control the mind.',
    drillId:'w001', mentalId:'m05', xp:120, reflectionPrompt:null },
  { day:10, week:2, theme:'Development', weekColor:'#10b981', type:'both', isRest:false, isMilestone:false,
    title:'Ground Fielding + Pre-Game Activation',
    desc:'Athletic fielding combined with pre-performance mental readiness. Two pillars of match impact.',
    drillId:'f001', mentalId:'m50', xp:115, reflectionPrompt:null },
  { day:11, week:2, theme:'Development', weekColor:'#10b981', type:'both', isRest:false, isMilestone:false,
    title:'Pull Shot Power + Energy Converter',
    desc:'Turn those pre-session nerves into pure batting power. Nervous energy is just fuel waiting for direction.',
    drillId:'b002', mentalId:'m51', xp:145, reflectionPrompt:null },
  { day:12, week:2, theme:'Development', weekColor:'#10b981', type:'both', isRest:false, isMilestone:false,
    title:'Outswing Mastery + Physiological Reset',
    desc:'Technical swing bowling paired with a fast mental reset. Precision body and mind working as one.',
    drillId:'w002', mentalId:'m61', xp:135, reflectionPrompt:null },
  { day:13, week:2, theme:'Development', weekColor:'#10b981', type:'both', isRest:false, isMilestone:false,
    title:'Cricket Sprints + Pressure Is Privilege',
    desc:'Physical speed meets mental pressure mastery. The cricketers who sprint hardest think clearest under fire.',
    drillId:'fit001', mentalId:'m63', xp:130, reflectionPrompt:null },
  { day:14, week:2, theme:'Development', weekColor:'#10b981', type:'rest',  isRest:true,  isMilestone:true,
    title:'Development Recovery Day',
    desc:'Two full weeks in. Most people quit around here. You\'re not most people. Rest, rebuild, return stronger.',
    drillId:null, mentalId:'m84', xp:30, reflectionPrompt:null },

  // ── WEEK 3: Pressure (orange) — drill + mental + reflection ──
  { day:15, week:3, theme:'Pressure', weekColor:'#f97316', type:'both', isRest:false, isMilestone:false,
    title:'Sweep Shot + Pressure Is Privilege',
    desc:'Spin domination drill with elite pressure mindset. When others tighten up, you open up.',
    drillId:'b003', mentalId:'m63', xp:150,
    reflectionPrompt:'What one thing will you do differently in your very next training session?' },
  { day:16, week:3, theme:'Pressure', weekColor:'#f97316', type:'both', isRest:false, isMilestone:false,
    title:'Yorker Mastery + Anchoring Peak State',
    desc:'The most dangerous delivery in cricket, paired with peak state anchoring. Deliberate. Deadly. Elite.',
    drillId:'w003', mentalId:'m53', xp:195,
    reflectionPrompt:'Describe in one sentence how you handled pressure today.' },
  { day:17, week:3, theme:'Pressure', weekColor:'#f97316', type:'both', isRest:false, isMilestone:false,
    title:'Core Stability + Laser Focus',
    desc:'Cricket core strength combined with elite concentration. Physical and mental precision as one system.',
    drillId:'fit002', mentalId:'m05', xp:125,
    reflectionPrompt:'What is your biggest mental strength as a cricketer right now?' },
  { day:18, week:3, theme:'Pressure', weekColor:'#f97316', type:'both', isRest:false, isMilestone:false,
    title:'Cut Shot + Nervous Energy Converter',
    desc:'Attack every ball of width with authority — and convert every pre-session nerve into pure execution.',
    drillId:'b004', mentalId:'m51', xp:140,
    reflectionPrompt:'What shot or skill are you most confident in right now?' },
  { day:19, week:3, theme:'Pressure', weekColor:'#f97316', type:'both', isRest:false, isMilestone:false,
    title:'Throwing Accuracy + Game Day Activation',
    desc:'Elite throw accuracy with match-day mental activation. The two skills that separate fielding units.',
    drillId:'f002', mentalId:'m54', xp:135,
    reflectionPrompt:'Name one thing you\'d tell your younger self about training.' },
  { day:20, week:3, theme:'Pressure', weekColor:'#f97316', type:'both', isRest:false, isMilestone:false,
    title:'Line & Length Revisit + Breath Control',
    desc:'Revisit your bowling foundation under real pressure conditions with mastered breath control.',
    drillId:'w001', mentalId:'m80', xp:115,
    reflectionPrompt:'How does today\'s practice connect to your bigger cricket goal?' },
  { day:21, week:3, theme:'Pressure', weekColor:'#f97316', type:'rest',  isRest:true,  isMilestone:true,
    title:'Elite Recovery Day',
    desc:'Three weeks of elite training. Today you breathe, restore, and reflect on everything you\'ve built.',
    drillId:null, mentalId:'m84', xp:45,
    reflectionPrompt:'What has this three-week journey taught you about yourself as a cricketer?' },

  // ── WEEK 4: Elite (gold) — full sessions ─────────────────────
  { day:22, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'T20 Power Hitting + Elite Anchoring',
    desc:'Strike rates above 150. Anchored peak state. You\'re entering the territory most players never reach.',
    drillId:'b005', mentalId:'m53', xp:185, reflectionPrompt:null },
  { day:23, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'Death Bowling + Pressure Is Privilege',
    desc:'The complete death bowler\'s toolkit. Pressure is your fuel. Elite bowlers want this moment.',
    drillId:'w003', mentalId:'m63', xp:195, reflectionPrompt:null },
  { day:24, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'High Catch Confidence + Game Day Activation',
    desc:'Under the high ball with full belief. Match-day mental activation. Every catch is a match-saver.',
    drillId:'f003', mentalId:'m54', xp:155, reflectionPrompt:null },
  { day:25, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'Slog Sweep + Nervous Energy Converter',
    desc:'Boundaries from anywhere in the ground. Convert every nerve into muscle memory.',
    drillId:'b007', mentalId:'m51', xp:155, reflectionPrompt:null },
  { day:26, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'Death Bowling Masterclass + Breath Control',
    desc:'The complete death bowler arsenal. Mastered breath. Mastered nerves. Mastered game.',
    drillId:'w010', mentalId:'m80', xp:200, reflectionPrompt:null },
  { day:27, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'Explosive Leg Power + Laser Focus',
    desc:'Peak athletic and mental conditioning in one session. The two pillars of elite performance.',
    drillId:'fit004', mentalId:'m05', xp:165, reflectionPrompt:null },
  { day:28, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:true,
    title:'Pull Shot Power + Champion Pressure',
    desc:'Dominant batting under championship pressure. 28 days in. You\'ve earned this session.',
    drillId:'b002', mentalId:'m63', xp:155, reflectionPrompt:null },
  { day:29, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:false,
    title:'T20 Power + Elite Anchoring',
    desc:'The second-to-last session. Peak batting power with anchored elite state. Almost there.',
    drillId:'b005', mentalId:'m53', xp:185, reflectionPrompt:null },
  { day:30, week:4, theme:'Elite', weekColor:'#f59e0b', type:'both', isRest:false, isMilestone:true,
    title:'CHAMPION DAY — Power & Pressure',
    desc:'30 days. One mission. Elite cricketer status. Today you prove it — not to anyone else, but to yourself.',
    drillId:'b005', mentalId:'m63', xp:280, reflectionPrompt:null },
];

A.DAY30_TASKS = DAY30_TASKS;
A.DAY30 = DAY30_TASKS; // backward compat

// ── Monthly Challenges (P5-E) ─────────────────────────────────────
// Keys by 'YYYY-MM' — current month auto-detected
var MONTHLY_CHALLENGES = [
  {
    id: 'batting_month',
    title: 'Batting Month',
    theme: 'Master the Cover Drive',
    color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)',
    emoji: '🏏',
    month: 5, // May
    tasks: [
      { id: 'bm1', type: 'drill',   drillId: 'b001', times: 5,   xp: 150, label: '5× Cover Drive Mastery sessions' },
      { id: 'bm2', type: 'mental',  mentalId:'m21',  times: 3,   xp: 75,  label: '3× Confidence Countdown sessions' },
      { id: 'bm3', type: 'xp',      target: 300,                 xp: 100, label: 'Earn 300 XP this month' },
    ],
    bonusXP: 75,
    badgeId: 'batting_month',
  },
  {
    id: 'bowling_month',
    title: 'Bowling Month',
    theme: 'Perfect Line & Length',
    color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)',
    emoji: '🎳',
    month: 6, // June
    tasks: [
      { id: 'bow1', type: 'drill',  drillId: 'w001', times: 5,  xp: 130, label: '5× Line & Length Precision sessions' },
      { id: 'bow2', type: 'drill',  drillId: 'w003', times: 3,  xp: 120, label: '3× Yorker Death Bowling sessions' },
      { id: 'bow3', type: 'xp',     target: 300,                xp: 100, label: 'Earn 300 XP this month' },
    ],
    bonusXP: 75,
    badgeId: 'bowling_month',
  },
  {
    id: 'mental_month',
    title: 'Mind Month',
    theme: 'Build Your Elite Mindset',
    color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)',
    emoji: '🧠',
    month: 7, // July
    tasks: [
      { id: 'men1', type: 'mental', mentalId:'m05',  times: 5,  xp: 100, label: '5× Laser Focus sessions' },
      { id: 'men2', type: 'mental', mentalId:'m63',  times: 5,  xp: 100, label: '5× Pressure Is Privilege sessions' },
      { id: 'men3', type: 'xp',     target: 250,                xp: 75,  label: 'Earn 250 XP this month' },
    ],
    bonusXP: 75,
    badgeId: 'mental_month',
  },
  {
    id: 'fielding_month',
    title: 'Fielding Month',
    theme: 'Become the Best Fielder on the Pitch',
    color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)',
    emoji: '🤸',
    month: 8, // August
    tasks: [
      { id: 'fld1', type: 'drill',  drillId: 'f001', times: 5,  xp: 100, label: '5× Ground Fielding sessions' },
      { id: 'fld2', type: 'drill',  drillId: 'f002', times: 3,  xp: 90,  label: '3× Throwing Accuracy sessions' },
      { id: 'fld3', type: 'xp',     target: 300,                xp: 100, label: 'Earn 300 XP this month' },
    ],
    bonusXP: 75,
    badgeId: 'fielding_month',
  },
];
A.MONTHLY_CHALLENGES = MONTHLY_CHALLENGES;

// Helper: get this month's challenge
A.getCurrentMonthChallenge = function() {
  var m = new Date().getMonth() + 1; // 1-12
  return MONTHLY_CHALLENGES.find(function(c) { return c.month === m; }) || MONTHLY_CHALLENGES[0];
};

console.log('[SC] app-data ready —', DRILLS.length, 'drills,', MENTAL_SESSIONS.length, 'sessions,', WORKOUTS.length, 'workouts,', DAY30_TASKS.length, 'challenge days,', MONTHLY_CHALLENGES.length, 'monthly challenges');
})();
