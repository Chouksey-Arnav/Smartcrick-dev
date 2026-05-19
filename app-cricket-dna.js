// app-cricket-dna.js v1.0
// ================================================================
// SmartCrick — Cricket DNA Engine
// 106 profiles across 8 categories, full signal-based algorithm
// Analyses every piece of training data in the system
//
// Exports:
//   A.CricketDNAPage       — full page component
//   A.DNAOverview          — compact home-feed widget
//   A.getCricketDNA()      — returns cached {primary,secondary,tertiary,signals}
//   A.computeCricketDNA()  — force recompute
//   A.CRICKET_DNA_PROFILES — all 106 profile objects
// ================================================================
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var A  = window.SC_APP;
var DB = A.DB;
var nav = A.nav;

// ── Helpers ──────────────────────────────────────────────────────
var cap = function(n) { return Math.min(100, Math.max(0, Math.round(n))); };
function getToday() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n) {
  var d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ── Signal extraction — reads ALL training data ───────────────────
function extractSignals() {
  var xpLog       = DB.getXPLog ? DB.getXPLog() : [];
  var progress    = DB.getProgress ? DB.getProgress() : {};
  var drillProg   = DB.getDrillProgress ? DB.getDrillProgress() : {};
  var DRILLS      = A.DRILLS || [];

  var last30      = daysAgo(30);
  var last14      = daysAgo(14);
  var prev14s     = daysAgo(28);

  var log30  = xpLog.filter(function(e){ return e.date >= last30; });
  var log14  = xpLog.filter(function(e){ return e.date >= last14; });
  var logP14 = xpLog.filter(function(e){ return e.date >= prev14s && e.date < last14; });

  // Drill category counts from completed drills
  var dc = { batting:0, bowling:0, fielding:0, fitness:0, mental:0, wicketkeeping:0 };
  Object.keys(drillProg).forEach(function(id) {
    var d = DRILLS.find(function(x){ return x.id === id; });
    if (d && dc[d.category] !== undefined) dc[d.category]++;
  });

  // Session type counts
  var mentalEs  = xpLog.filter(function(e){ return e.source === 'mental'; });
  var fitnessEs = xpLog.filter(function(e){ return e.source === 'workout' || e.source === 'fitness'; });
  var netEs     = xpLog.filter(function(e){ return e.source === 'dailynet'; });

  // XP-per-day map
  var xpByDate = {};
  log30.forEach(function(e){ if(e.date) xpByDate[e.date] = (xpByDate[e.date]||0) + (e.xp||0); });
  var trainedDays = Object.keys(xpByDate).length;
  var dayXPs      = Object.keys(xpByDate).map(function(k){ return xpByDate[k]; });
  var highXPDays  = dayXPs.filter(function(x){ return x > 200; }).length;
  var sumXP30     = dayXPs.reduce(function(s,x){ return s+x; }, 0);
  var avgXP       = trainedDays > 0 ? sumXP30 / trainedDays : 0;

  // XP velocity: last 14d vs prior 14d
  var xp14  = log14.reduce(function(s,e){ return s+(e.xp||0); }, 0);
  var xpP14 = logP14.reduce(function(s,e){ return s+(e.xp||0); }, 0);
  var vel   = xpP14 > 0 ? (xp14 - xpP14) / xpP14 : (xp14 > 0 ? 1 : 0);

  // Diversity: avg distinct activity types per trained day
  var srcByDate = {};
  log30.forEach(function(e){
    if (!e.date || !e.source) return;
    if (!srcByDate[e.date]) srcByDate[e.date] = {};
    var t = e.source.startsWith('drill:') ? 'drill' : e.source;
    srcByDate[e.date][t] = true;
  });
  var divSum = Object.keys(srcByDate).reduce(function(s, dt){
    var srcs = srcByDate[dt];
    var t = 0;
    if (srcs.drill) t++;
    if (srcs.mental) t++;
    if (srcs.workout || srcs.fitness) t++;
    if (srcs.dailynet) t++;
    return s + t;
  }, 0);
  var div = trainedDays > 0 ? divSum / trainedDays : 0;

  // Weekend ratio
  var wkXP = log30.filter(function(e){
    if (!e.date) return false;
    var dow = new Date(e.date + 'T12:00:00').getDay();
    return dow === 0 || dow === 6;
  }).reduce(function(s,e){ return s+(e.xp||0); }, 0);
  var wr = sumXP30 > 0 ? wkXP / sumXP30 : 0;

  var txp = progress.total_xp || 0;
  var cr  = DRILLS.length > 0 ? Object.keys(drillProg).length / DRILLS.length : 0;
  var cs  = progress.current_streak  || 0;
  var bs  = progress.longest_streak  || 0;
  var cstr = (DB.get && DB.get('sc_dc_streak') || {}).streak || 0;
  var totalSess = xpLog.length;
  var mr = totalSess > 0 ? mentalEs.length / totalSess : 0;

  return {
    bd:dc.batting, bwd:dc.bowling, fd:dc.fielding, wkd:dc.wicketkeeping,
    mc:mentalEs.length, fc:fitnessEs.length, nc:netEs.length,
    hx:highXPDays, ax:avgXP, cs:cs, bs:bs,
    con:trainedDays/30, vel:vel, div:div, wr:wr, mr:mr,
    cr:cr, cstr:cstr, txp:txp,
    totalDrills:Object.keys(drillProg).length,
    totalSessions:totalSess,
  };
}

// ── 106 Cricket DNA Profiles ──────────────────────────────────────
var RARITY = { common:'Common', uncommon:'Uncommon', rare:'Rare', legendary:'Legendary' };
var RARITY_STARS = { common:1, uncommon:2, rare:3, legendary:4 };

var PROFILES = [
  // ══ BATTING (20) ═════════════════════════════════════════════════
  { id:'b01', name:'The Opener', cat:'batting', rarity:'common', icon:'🏏', clr:'#3b82f6',
    tag:'Built to face the first ball',
    desc:'You take on challenges head-on. Consistent, brave, and technically sound — you set the tone before anyone else arrives at the crease.',
    traits:['Patient','Brave','Technical'],
    tip:'Add mental resilience sessions — openers face the hardest deliveries.',
    score:function(s){ return cap(s.bd*7+s.con*25+s.mc*1.5+(s.cs>5?10:0)); } },

  { id:'b02', name:'The Aggressor', cat:'batting', rarity:'uncommon', icon:'🔥', clr:'#ef4444',
    tag:'Dominate, never survive',
    desc:'High-intensity sessions, explosive XP days — you don\'t play to survive, you play to take the attack on. Risk is your natural language.',
    traits:['Explosive','Bold','Risk-Taker'],
    tip:'Balance aggression with mental training to avoid reckless dismissals.',
    score:function(s){ return cap(s.bd*7+s.hx*4+s.ax/5+(s.mr<0.1?10:0)); } },

  { id:'b03', name:'The Anchor', cat:'batting', rarity:'uncommon', icon:'⚓', clr:'#0891b2',
    tag:'The innings is built around you',
    desc:'Consistency is your superpower. You grind through bad patches, let the innings develop around you, and never throw it away cheaply.',
    traits:['Consistent','Reliable','Patient'],
    tip:'Work on explosive drill sets to complement your anchoring role.',
    score:function(s){ return cap(s.bd*6+s.con*35+(s.cs>14?20:0)); } },

  { id:'b04', name:'The Finisher', cat:'batting', rarity:'uncommon', icon:'💥', clr:'#dc2626',
    tag:'Wins matches in the final overs',
    desc:'You rise to the big moments. Your training peaks under pressure and your challenge completion rate is the mark of a clutch performer.',
    traits:['Clutch','Aggressive','High-Stakes'],
    tip:'Study match-situation drills — finishing is about reading the game, not just swinging.',
    score:function(s){ return cap(s.bd*6+s.hx*5+s.cstr*3); } },

  { id:'b05', name:'The Technician', cat:'batting', rarity:'rare', icon:'📐', clr:'#7c3aed',
    tag:'Perfect technique, perfect results',
    desc:'You obsess over completion rates. Every drill finished, every technique refined. Your batting is textbook and it shows in the quality of your sessions.',
    traits:['Precise','Methodical','Complete'],
    tip:'Add variation to your training — perfect technique needs to be tested under chaos.',
    score:function(s){ return cap(s.bd*9+s.cr*30+s.mc*1); } },

  { id:'b06', name:'The Improviser', cat:'batting', rarity:'uncommon', icon:'🎭', clr:'#0d9488',
    tag:'No situation too complex',
    desc:'You thrive in diverse training environments. Cross-discipline training reveals your adaptability — you\'re unpredictable and hard to plan against.',
    traits:['Creative','Adaptable','Unpredictable'],
    tip:'Structure your creativity with technical foundations so improvisation has depth behind it.',
    score:function(s){ return cap(s.bd*5+s.div*20+s.vel*20+(s.div>2?10:0)); } },

  { id:'b07', name:'The Risk-Taker', cat:'batting', rarity:'common', icon:'🎲', clr:'#f59e0b',
    tag:'High reward, high danger',
    desc:'Your XP spikes show a player who goes for it. Brilliant on good days, vulnerable on bad ones — the gambler\'s batting style that spectators love.',
    traits:['Aggressive','Erratic','High-Ceiling'],
    tip:'Mental training will help you know when to take risks and when to hold back.',
    score:function(s){ return cap(s.bd*5+s.hx*6+(s.con<0.5?10:0)+s.mc); } },

  { id:'b08', name:'The Conservative', cat:'batting', rarity:'common', icon:'🛡️', clr:'#6b7280',
    tag:'Never give it away cheaply',
    desc:'Long, steady sessions. Low-risk consistency. You value the wicket above all. Not flashy, but rarely wrong.',
    traits:['Steady','Low-Risk','Disciplined'],
    tip:'Push your sessions harder — conservative batting needs the occasional forcing shot.',
    score:function(s){ return cap(s.bd*4+s.con*40+(s.hx<3?10:0)); } },

  { id:'b09', name:'The Counter-Puncher', cat:'batting', rarity:'uncommon', icon:'🥊', clr:'#8b5cf6',
    tag:'Waits, then unleashes',
    desc:'Mental training combined with batting drills reveals a reactive player. You absorb pressure then hit back harder than anyone expected.',
    traits:['Reactive','Patient','Explosive'],
    tip:'Practice scenario-specific drills — batting under pressure is your defining moment.',
    score:function(s){ return cap(s.bd*5+s.mc*2+s.con*20+(s.cs>5?10:0)); } },

  { id:'b10', name:'The Stroke Maker', cat:'batting', rarity:'rare', icon:'🎨', clr:'#2563eb',
    tag:'Classical elegance, match-winning shots',
    desc:'High completion rate and batting breadth. You\'ve mastered the full range of shots — not just the easy ones. Cricket aesthetics genuinely matter to you.',
    traits:['Elegant','Classical','Complete'],
    tip:'Work on your mental approach to sustain long innings without giving it away.',
    score:function(s){ return cap(s.bd*8+s.cr*20+s.nc*2); } },

  { id:'b11', name:'The Grinder', cat:'batting', rarity:'common', icon:'⛏️', clr:'#78716c',
    tag:'Ugly scores still count',
    desc:'Long streaks, consistent sessions, modest XP per day. You never give up. Champions are built from exactly this kind of stubbornness.',
    traits:['Stubborn','Resilient','Consistent'],
    tip:'Work on shot variety — grinding works but it gives bowlers time to plan against you.',
    score:function(s){ return cap(s.bd*5+s.con*40+(s.ax<100?10:0)); } },

  { id:'b12', name:'The Express Scorer', cat:'batting', rarity:'uncommon', icon:'⚡', clr:'#ca8a04',
    tag:'Fastest runs in the game',
    desc:'High average XP per session with batting focus — you accumulate runs fast and force the game to work on your terms, not the opposition\'s.',
    traits:['Fast','Dominant','Efficient'],
    tip:'Mental sessions will help you sustain your scoring rate under intense pressure.',
    score:function(s){ return cap(s.bd*6+s.ax/4+s.hx*3); } },

  { id:'b13', name:'The Big Hitter', cat:'batting', rarity:'uncommon', icon:'💪', clr:'#ea580c',
    tag:'Sixes change matches',
    desc:'Fitness combined with batting — your physical power translates to explosive strokeplay. You change games in a single over when you connect.',
    traits:['Powerful','Athletic','Dominant'],
    tip:'Add fielding drills — powerful hitters must be safe in the field to stay in the team.',
    score:function(s){ return cap(s.bd*5+s.hx*7+s.fc*2); } },

  { id:'b14', name:'The Single Taker', cat:'batting', rarity:'common', icon:'🏃', clr:'#16a34a',
    tag:'Keeps the scoreboard ticking',
    desc:'High consistency, controlled scoring. You rotate strike efficiently and never let the game stagnate. The selfless player every coach builds around.',
    traits:['Smart','Selfless','Running'],
    tip:'Fitness sessions improve your between-wickets running and overall game sharpness.',
    score:function(s){ return cap(s.bd*4+s.con*35+(s.ax<80?10:0)); } },

  { id:'b15', name:'The Crisis Manager', cat:'batting', rarity:'rare', icon:'🚨', clr:'#b91c1c',
    tag:'Best when the team needs it most',
    desc:'Mental training combined with challenge completion under pressure. You\'re the player everyone wants at the crease when 3 wickets are down.',
    traits:['Cool','Clutch','Leader'],
    tip:'Practice with specific pressure scenarios to sharpen your crisis instincts further.',
    score:function(s){ return cap(s.bd*4+s.mc*3+s.cstr*4+(s.cs>7?15:0)); } },

  { id:'b16', name:'The No.3', cat:'batting', rarity:'uncommon', icon:'3️⃣', clr:'#4338ca',
    tag:'The most important position',
    desc:'You combine batting depth with mental preparation — the hallmark of a genuine No.3. Always ready to bat in any match situation.',
    traits:['Adaptable','Technical','Reliable'],
    tip:'Study match context drills — the No.3 role requires reading the innings instantly.',
    score:function(s){ return cap(s.bd*7+s.mc*2+s.ax/5); } },

  { id:'b17', name:'The Nightwatchman', cat:'batting', rarity:'common', icon:'🌙', clr:'#4b5563',
    tag:'Survival over style',
    desc:'Bowling knowledge meets batting survival — you understand both arts, making you perfectly equipped to protect wickets late in the day.',
    traits:['Canny','Defensive','Versatile'],
    tip:'Improve your mental approach to batting under pressure to extend your nightwatchman effectiveness.',
    score:function(s){ return cap(s.bd*3+s.bwd*3+s.con*25+s.mc); } },

  { id:'b18', name:'The Pinch Hitter', cat:'batting', rarity:'uncommon', icon:'🚀', clr:'#f97316',
    tag:'Sacrificial explosive opener',
    desc:'You go to destroy, not to occupy. Enormous XP spikes and batting focus reveal a player who makes the game explode in the opening overs.',
    traits:['Sacrificial','Explosive','Brave'],
    tip:'Mental prep specifically for opening-over pressure situations will sharpen your execution.',
    score:function(s){ return cap(s.bd*4+s.hx*8+s.fc*2); } },

  { id:'b19', name:'The Comeback Kid', cat:'batting', rarity:'uncommon', icon:'📈', clr:'#0ea5e9',
    tag:'Stronger every time they fail',
    desc:'Rising XP velocity combined with batting focus — you\'re getting better at a rate others would kill for. Recent sessions show clear upward progression.',
    traits:['Resilient','Improving','Determined'],
    tip:'Journal your sessions to understand why you\'re improving — it helps you control the trajectory.',
    score:function(s){ return cap(s.bd*5+s.vel*35+(s.vel>0.2?20:0)); } },

  { id:'b20', name:'The Renaissance Batter', cat:'batting', rarity:'rare', icon:'🎯', clr:'#7c3aed',
    tag:'Complete in every dimension',
    desc:'Batting + mental + physical + diversity. You train the whole cricketer, not just the shots. The most complete batting student in any squad.',
    traits:['Complete','Balanced','Elite'],
    tip:'Your foundation is exceptional — now sharpen your one specialist weapon.',
    score:function(s){ return cap(s.bd*5+s.div*25+s.mc+s.fc); } },

  // ══ BOWLING (20) ══════════════════════════════════════════════════
  { id:'w01', name:'The Swing Master', cat:'bowling', rarity:'uncommon', icon:'🌀', clr:'#ef4444',
    tag:'The ball does the work',
    desc:'Bowling depth meets physical conditioning. You understand that swing bowling requires both skill and body — and you train both rigorously.',
    traits:['Skilled','Physical','Patient'],
    tip:'Mental training helps swing bowlers maintain focus across long spells.',
    score:function(s){ return cap(s.bwd*8+s.con*25+s.fc*1.5); } },

  { id:'w02', name:'The Seam Machine', cat:'bowling', rarity:'common', icon:'🎳', clr:'#dc2626',
    tag:'Line and length, over after over',
    desc:'High bowling completion rate reveals a player obsessed with bowling mechanics. You hit the seam repeatedly and make batters earn every single run.',
    traits:['Accurate','Consistent','Methodical'],
    tip:'Add variation drills — even the best line-and-length bowler needs a surprise weapon.',
    score:function(s){ return cap(s.bwd*10+s.cr*25); } },

  { id:'w03', name:'The Reverse Swing Artist', cat:'bowling', rarity:'rare', icon:'↩️', clr:'#b91c1c',
    tag:'Older ball, more dangerous',
    desc:'Bowling mastery combined with experience reveals someone who has learned the dark arts of reverse swing through thousands of training hours.',
    traits:['Experienced','Clever','Tactical'],
    tip:'Pair your technical skill with mental focus sessions for maximum late-innings impact.',
    score:function(s){ return cap(s.bwd*9+s.txp/200+s.con*15+(s.txp>2000?10:0)); } },

  { id:'w04', name:'The Off-Spinner', cat:'bowling', rarity:'uncommon', icon:'🌪️', clr:'#7c3aed',
    tag:'Flight, dip, and drift',
    desc:'Mental + bowling combination reveals a thinking bowler. You plan your wickets, set up batters, and understand the psychology of spin bowling deeply.',
    traits:['Intelligent','Deceptive','Strategic'],
    tip:'Daily Net sessions deepen cricket intelligence — perfect for constructing spin bowling plans.',
    score:function(s){ return cap(s.bwd*8+s.mc*2+(s.txp>1000?10:0)); } },

  { id:'w05', name:'The Leg-Spin Wizard', cat:'bowling', rarity:'rare', icon:'✨', clr:'#a855f7',
    tag:'The hardest skill in cricket',
    desc:'Mental training + bowling focus + rising velocity — leg spin is the hardest craft in cricket and you\'re putting in the serious work to master it.',
    traits:['Gifted','Relentless','Magical'],
    tip:'Consistency is leg spin\'s biggest challenge — keep training relentlessly every single day.',
    score:function(s){ return cap(s.bwd*8+s.mc*3+(s.vel>0?10:0)+s.con*15); } },

  { id:'w06', name:'The Economy King', cat:'bowling', rarity:'uncommon', icon:'🔒', clr:'#16a34a',
    tag:'4 an over or fewer',
    desc:'Bowling consistency + mental training. You bowl to stifle, not just to take wickets. Captains trust you. Batters hate facing you.',
    traits:['Economical','Controlled','Team-First'],
    tip:'Work on taking wickets at key moments — economy is great but wickets change games.',
    score:function(s){ return cap(s.bwd*7+s.con*30+(s.mr>0.15?10:0)); } },

  { id:'w07', name:'The Yorker King', cat:'bowling', rarity:'uncommon', icon:'👑', clr:'#ca8a04',
    tag:'Unplayable in the death overs',
    desc:'Bowling + fitness combination with XP spikes showing clutch moments. You\'ve trained the hardest delivery in cricket and execute it when it matters most.',
    traits:['Lethal','Clutch','Athletic'],
    tip:'Mental training for death-bowling pressure specifically will complete your devastating arsenal.',
    score:function(s){ return cap(s.bwd*7+s.fc*3+s.hx*3); } },

  { id:'w08', name:'The Bouncer Machine', cat:'bowling', rarity:'uncommon', icon:'💨', clr:'#f97316',
    tag:'Makes batters think twice',
    desc:'Physical conditioning drives your bowling. You bowl with genuine pace and hostility — the bouncer is a tactical weapon, not a desperate accident.',
    traits:['Hostile','Fast','Physical'],
    tip:'Add mental sessions — fast bowlers must manage aggression to stay consistently effective.',
    score:function(s){ return cap(s.bwd*7+s.fc*4+s.hx*2); } },

  { id:'w09', name:'The Variations Master', cat:'bowling', rarity:'rare', icon:'🎭', clr:'#0d9488',
    tag:'No batter can read you',
    desc:'Mental + bowling + diversity. You have more deliveries than most — slower ball, doosra, whatever it takes. You keep batters permanently guessing.',
    traits:['Unpredictable','Creative','Smart'],
    tip:'Consistency is your only gap — master one variation fully before adding the next.',
    score:function(s){ return cap(s.bwd*6+s.mc*3+s.div*15); } },

  { id:'w10', name:'The Wicket Hunter', cat:'bowling', rarity:'uncommon', icon:'🎯', clr:'#dc2626',
    tag:'Always looking for the breakthrough',
    desc:'High XP days + bowling focus + challenge streak. You attack every ball hunting a wicket. Expensive sometimes, match-changing always.',
    traits:['Attacking','Ambitious','Brave'],
    tip:'Mental training will sharpen when to attack and when to build pressure first.',
    score:function(s){ return cap(s.bwd*8+s.hx*3+s.cstr*3); } },

  { id:'w11', name:'The Death Bowler', cat:'bowling', rarity:'rare', icon:'💀', clr:'#991b1b',
    tag:'When it matters most',
    desc:'Mental + bowling + challenge streak. Under maximum pressure, you deliver your best. The death overs are not a problem — they\'re your personal stage.',
    traits:['Fearless','Skilled','Clutch'],
    tip:'Continue building your challenge streak — pressure performance is a trained habit.',
    score:function(s){ return cap(s.bwd*7+s.mc*3+s.cstr*4); } },

  { id:'w12', name:'The Test Match Warrior', cat:'bowling', rarity:'rare', icon:'⚔️', clr:'#78350f',
    tag:'Wins Tests with patience',
    desc:'Long streaks + bowling + mental + patience signals. You\'re built for the red-ball game. Long spells. Patient field-setting. Wickets in the afternoon session.',
    traits:['Patient','Consistent','Relentless'],
    tip:'Add batting drills — lower-order Test match batting wins games that skill alone cannot.',
    score:function(s){ return cap(s.bwd*7+s.con*30+s.mc*2+(s.bs>14?10:0)); } },

  { id:'w13', name:'The Powerplay Destroyer', cat:'bowling', rarity:'uncommon', icon:'🔥', clr:'#b91c1c',
    tag:'Best in the first 10 overs',
    desc:'Bowling + fitness combo with experience signals. You capitalise on powerplay conditions — new ball, field restrictions, and maximum early pressure.',
    traits:['Aggressive','Physical','Smart'],
    tip:'Work on your stock ball — powerplay bowlers need an unplayable default delivery.',
    score:function(s){ return cap(s.bwd*7+s.fc*4+(s.txp>1500?10:0)); } },

  { id:'w14', name:'The White Ball Specialist', cat:'bowling', rarity:'common', icon:'⚪', clr:'#0ea5e9',
    tag:'T20 and ODI excellence',
    desc:'Bowling + variety + Daily Net. You understand the limited overs game deeply — match situations, field placements, and which ball to bowl in each over.',
    traits:['Smart','Versatile','Explosive'],
    tip:'Work on specific death/powerplay scenario mental sessions for maximum impact.',
    score:function(s){ return cap(s.bwd*6+s.hx*4+s.nc*3); } },

  { id:'w15', name:'The Left-Arm Orthodox', cat:'bowling', rarity:'common', icon:'👈', clr:'#0891b2',
    tag:'Natural angle, constant threat',
    desc:'Bowling consistency is your identity. Reliable, accurate, and hard to score off — left-arm over the wicket gives a natural angle every batter must respect.',
    traits:['Reliable','Accurate','Consistent'],
    tip:'Work on your variations — the arm ball is the deadliest weapon in your arsenal.',
    score:function(s){ return cap(s.bwd*7+s.con*30); } },

  { id:'w16', name:'The Dobber', cat:'bowling', rarity:'common', icon:'🎪', clr:'#6b7280',
    tag:'Consistent medium pace that never disappears',
    desc:'High bowling consistency + lower XP profile. You don\'t blow batters away, but you don\'t give them easy runs either. The underrated player every team needs.',
    traits:['Reliable','Consistent','Workmanlike'],
    tip:'Add variations to complement your excellent line and length.',
    score:function(s){ return cap(s.bwd*6+s.con*35+(s.ax<100?10:0)); } },

  { id:'w17', name:'The Outswing Merchant', cat:'bowling', rarity:'uncommon', icon:'↗️', clr:'#2563eb',
    tag:'Moving it away from the right-hander',
    desc:'Bowling + fitness reveals a complete swing bowler. The away swinger is the most dangerous opening delivery in cricket — and you\'ve put the work in to perfect it.',
    traits:['Technical','Athletic','Patient'],
    tip:'Study the mental approach of great swing bowlers — confidence is the essential ingredient.',
    score:function(s){ return cap(s.bwd*8+s.fc*2+s.con*20); } },

  { id:'w18', name:'The Floater', cat:'bowling', rarity:'uncommon', icon:'🎈', clr:'#db2777',
    tag:'Flight and loop, deceptive genius',
    desc:'Bowling + mental + diversity reveals a spin bowler who manipulates the air. You flight the ball and let drift and dip do the work against unsuspecting batters.',
    traits:['Subtle','Patient','Intelligent'],
    tip:'Add consistency practice — floated spin only works when you can land it precisely.',
    score:function(s){ return cap(s.bwd*6+s.mc*4+(s.div>2?10:0)); } },

  { id:'w19', name:'The Big Dipper', cat:'bowling', rarity:'uncommon', icon:'⬇️', clr:'#7e22ce',
    tag:'Sharp off-cutter, devastating',
    desc:'Bowling + strength combination. Your physical conditioning generates the pace to make that off-cutter really dip and skid through — a genuinely brutal combination.',
    traits:['Physical','Deceptive','Skilled'],
    tip:'Mental preparation for high-pressure overs will complete your complete bowling game.',
    score:function(s){ return cap(s.bwd*7+s.fc*4+s.hx*3); } },

  { id:'w20', name:'The Powerhouse Pacer', cat:'bowling', rarity:'rare', icon:'🚀', clr:'#dc2626',
    tag:'Raw pace that batters genuinely fear',
    desc:'Bowling depth + fitness + high-XP days. Your physical training translates to genuine speed. Some batters would rather face spin than face you on a green wicket.',
    traits:['Fast','Athletic','Intimidating'],
    tip:'Work on control alongside pace — accurate fast bowling is the most dangerous kind.',
    score:function(s){ return cap(s.bwd*8+s.fc*5+s.hx*3+(s.fc>15?15:0)); } },

  // ══ FIELDING (10) ═════════════════════════════════════════════════
  { id:'f01', name:'The Wall', cat:'fielding', rarity:'common', icon:'🧱', clr:'#16a34a',
    tag:'Nothing gets past',
    desc:'High fielding completion rate + consistency. You are safe hands. Batters never take the single when you\'re positioned at the key stopping point.',
    traits:['Safe','Reliable','Dependable'],
    tip:'Work on athleticism — the wall that moves fast too becomes genuinely unstoppable.',
    score:function(s){ return cap(s.fd*10+s.con*25+(s.cr>0.5?10:0)); } },

  { id:'f02', name:'The Rocket Arm', cat:'fielding', rarity:'uncommon', icon:'🏹', clr:'#f97316',
    tag:'Direct hits win matches',
    desc:'Fielding + physical conditioning. You have the arm and the accuracy for direct-hit run-outs that shift entire match momentum instantly.',
    traits:['Athletic','Accurate','Explosive'],
    tip:'Mental training for high-pressure fielding moments sharpens your critical decision-making.',
    score:function(s){ return cap(s.fd*9+s.fc*4+s.hx*2); } },

  { id:'f03', name:'The Slip Cordon King', cat:'fielding', rarity:'rare', icon:'👐', clr:'#0891b2',
    tag:'First slip is a specialist position',
    desc:'Fielding + mental depth. Catching in the slip cordon requires anticipation, concentration, and zero flinching — all signals your training data confirms.',
    traits:['Reactive','Focused','Brave'],
    tip:'Continue mental sessions specifically for concentration under sustained close-in pressure.',
    score:function(s){ return cap(s.fd*8+s.mc*3+s.cr*20); } },

  { id:'f04', name:'The Outfield Flier', cat:'fielding', rarity:'uncommon', icon:'✈️', clr:'#10b981',
    tag:'Covers the most ground',
    desc:'Fielding + fitness + diversity reveals a modern athletic fielder. You cover 50 metres to take catches batters thought were safe. An absolute asset at any level.',
    traits:['Athletic','Fast','Covering'],
    tip:'Work on boundary catching — the diving save at full stretch is the next level.',
    score:function(s){ return cap(s.fd*9+s.fc*5+(s.div>1.5?10:0)); } },

  { id:'f05', name:'The Close Catcher', cat:'fielding', rarity:'uncommon', icon:'🙌', clr:'#4338ca',
    tag:'Catches win matches',
    desc:'Fielding + mental sessions = elite close-in catcher. Gully, short leg, silly mid-on — you stand where others won\'t and catch what others can\'t.',
    traits:['Brave','Focused','Elite'],
    tip:'Additional reflex drills will sharpen your already strong close-catching instincts.',
    score:function(s){ return cap(s.fd*8+s.mc*4+s.con*20); } },

  { id:'f06', name:'The Athletic Fielder', cat:'fielding', rarity:'uncommon', icon:'🤸', clr:'#0d9488',
    tag:'Makes the difficult look easy',
    desc:'Fielding + fitness + rising velocity. Your physical conditioning shows in every effort. Diving stops, full-length catches, and powerful throwing all in one package.',
    traits:['Athletic','Versatile','Improving'],
    tip:'Add mental sessions to sharpen your decision-making in the field.',
    score:function(s){ return cap(s.fd*8+s.fc*5+s.vel*10); } },

  { id:'f07', name:'The Sweeper', cat:'fielding', rarity:'common', icon:'🧹', clr:'#78716c',
    tag:'Boundary control specialist',
    desc:'Consistent fielding training without the high-intensity peaks. You save runs every match by ensuring the ball never reaches the boundary.',
    traits:['Reliable','Consistent','Dependable'],
    tip:'Work on attacking fielding — saving the boundary is good, but a direct-hit run-out is better.',
    score:function(s){ return cap(s.fd*7+s.con*30); } },

  { id:'f08', name:'The Captain\'s Cover', cat:'fielding', rarity:'common', icon:'🗺️', clr:'#6366f1',
    tag:'Goes wherever the team needs',
    desc:'Balanced batting + bowling + fielding profile reveals a complete player. You don\'t have a specialist position — you ARE the specialist everywhere.',
    traits:['Versatile','Team-First','Reliable'],
    tip:'Developing one specialty position makes you even more valuable to the team.',
    score:function(s){ return cap(s.fd*5+s.bd*3+s.bwd*3+s.div*15); } },

  { id:'f09', name:'The Wicketkeeper Hunter', cat:'fielding', rarity:'rare', icon:'🧤', clr:'#14b8a6',
    tag:'Stumpings define you',
    desc:'Wicketkeeping drill focus + mental training + consistency. You have the specific technical demands of keeping woven deep into your Cricket DNA.',
    traits:['Technical','Concentrated','Leader'],
    tip:'Add batting drills — keeper-batters are the most valuable players in modern cricket.',
    score:function(s){ return cap(s.wkd*15+s.mc*3+s.con*20); } },

  { id:'f10', name:'The Run-Out Specialist', cat:'fielding', rarity:'uncommon', icon:'⚡', clr:'#ca8a04',
    tag:'Direct hit, crease demolished',
    desc:'Fielding + fitness + high-intensity sessions. The direct-hit run-out is an art form. Your physical training and alertness make you a constant threat.',
    traits:['Alert','Athletic','Exciting'],
    tip:'Study scenarios — run-out opportunities only work when you read the game instantly.',
    score:function(s){ return cap(s.fd*7+s.fc*4+s.hx*4); } },

  // ══ MENTAL (20) ═══════════════════════════════════════════════════
  { id:'m01', name:'The Ice Man', cat:'mental', rarity:'rare', icon:'🧊', clr:'#0891b2',
    tag:'Zero emotional response under pressure',
    desc:'High mental ratio + long streak + consistency. You don\'t flinch. You don\'t celebrate early. You just execute. The most mentally durable player in any squad.',
    traits:['Composed','Unflappable','Elite'],
    tip:'Channel your composure productively — controlled aggression beats total calm at the crucial moment.',
    score:function(s){ return cap(s.mc*3+s.mr*60+(s.cs>14?20:0)+s.con*15); } },

  { id:'m02', name:'The Pressure Cooker', cat:'mental', rarity:'uncommon', icon:'🌡️', clr:'#ef4444',
    tag:'Performs best when stakes are highest',
    desc:'Mental sessions + challenge streak + high-XP days. You don\'t just cope with pressure — you need it. Your best cricket happens when the match is genuinely on the line.',
    traits:['Clutch','Intense','Driven'],
    tip:'Practice mental recovery — pressure players need to manage the aftermath of big moments.',
    score:function(s){ return cap(s.mc*3+s.cstr*5+(s.hx>5?20:0)); } },

  { id:'m03', name:'The Emotional Engine', cat:'mental', rarity:'common', icon:'❤️', clr:'#e11d48',
    tag:'Passion drives every performance',
    desc:'Mental training with visible momentum swings — you wear your heart on your sleeve and your best sessions happen when you\'re emotionally fired up.',
    traits:['Passionate','Reactive','Authentic'],
    tip:'Mental training focused on channelling emotions will make your fire more consistently controllable.',
    score:function(s){ return cap(s.mc*4+(s.vel>0.2?15:0)+(s.hx>3?10:0)); } },

  { id:'m04', name:'The Philosopher', cat:'mental', rarity:'uncommon', icon:'🤔', clr:'#7c3aed',
    tag:'Understands cricket at a deeper level',
    desc:'Mental sessions + Daily Net + depth signals. You think about cricket differently — tactics, psychology, history. Knowledge is your primary weapon.',
    traits:['Intelligent','Deep','Thoughtful'],
    tip:'Translate your cricket IQ into match situations — theory needs to become instant instinct.',
    score:function(s){ return cap(s.mc*4+s.nc*3+(s.mc>30?20:0)); } },

  { id:'m05', name:'The Competitor', cat:'mental', rarity:'uncommon', icon:'🏆', clr:'#f59e0b',
    tag:'Hates losing more than loves winning',
    desc:'Mental + challenge streak + high-intensity performance. Winning is important — but losing is completely unacceptable. Your competitive fire makes everyone better.',
    traits:['Driven','Intense','Standards'],
    tip:'Channel competition internally too — competing against your own previous best is the healthiest form.',
    score:function(s){ return cap(s.mc*2+s.cstr*5+s.hx*3+s.con*15); } },

  { id:'m06', name:'The Team Man', cat:'mental', rarity:'common', icon:'🤝', clr:'#16a34a',
    tag:'Individual stats mean nothing to you',
    desc:'Balanced diversity + consistency + mental. You train every discipline because you care about the team\'s needs, not personal glory. The glue of any squad.',
    traits:['Selfless','Balanced','Loyal'],
    tip:'Individual excellence still matters — you can\'t contribute if you\'re not developing your own game.',
    score:function(s){ return cap(s.div*25+s.con*25+s.mc); } },

  { id:'m07', name:'The Gladiator', cat:'mental', rarity:'uncommon', icon:'⚔️', clr:'#b45309',
    tag:'Loves the fight above everything',
    desc:'Mental + high-XP days + challenge completion. Every session is a battle. Every challenge accepted. You thrive when the opposition is at their best.',
    traits:['Warrior','Brave','Fearless'],
    tip:'Mental recovery training will help you sustain gladiatorial effort across longer campaigns.',
    score:function(s){ return cap(s.mc*3+s.hx*4+s.cstr*4); } },

  { id:'m08', name:'The Performer', cat:'mental', rarity:'common', icon:'🎭', clr:'#0d9488',
    tag:'Plays to the crowd',
    desc:'High-XP days + knowledge + challenge completion. You love the big occasion and your data proves it. When there\'s an audience — real or imagined — you deliver.',
    traits:['Confident','Showman','Clutch'],
    tip:'Work on quiet match situations — not every game has a crowd, but every session matters.',
    score:function(s){ return cap(s.hx*4+s.nc*3+s.mc*2+s.cstr*3); } },

  { id:'m09', name:'The Introvert', cat:'mental', rarity:'common', icon:'🔇', clr:'#4b5563',
    tag:'Quietly excellent',
    desc:'Strong mental base + consistency. You don\'t need the spotlight. Your training data shows someone who shows up, delivers, and never asks for credit.',
    traits:['Consistent','Quiet','Dependable'],
    tip:'Work on expressing your excellence — communication in cricket is a vital leadership skill.',
    score:function(s){ return cap(s.mc*4+s.con*30+(s.div<1.5?10:0)); } },

  { id:'m10', name:'The Leader', cat:'mental', rarity:'rare', icon:'👑', clr:'#ca8a04',
    tag:'Natural captain instincts',
    desc:'Mental training + diversity + long streaks + best-ever streak. You see the big picture. You bring out the best in others. The numbers tell the story of a future captain.',
    traits:['Strategic','Inspiring','Wise'],
    tip:'Study cricket tactics and situations — leaders think three overs ahead, not one ball.',
    score:function(s){ return cap(s.mc*2+s.div*20+s.con*25+(s.bs>14?10:0)); } },

  { id:'m11', name:'The Learner', cat:'mental', rarity:'uncommon', icon:'📚', clr:'#0ea5e9',
    tag:'Constant improvement mindset',
    desc:'Daily Net + drill completion + mental sessions. You are a dedicated student of the game. Knowledge drives performance — and you\'re accumulating both relentlessly.',
    traits:['Curious','Dedicated','Smart'],
    tip:'Apply your knowledge immediately — try new techniques and drills in your very next session.',
    score:function(s){ return cap(s.nc*5+s.cr*40+s.mc); } },

  { id:'m12', name:'The Resilient', cat:'mental', rarity:'uncommon', icon:'🌱', clr:'#16a34a',
    tag:'Bounces back instantly',
    desc:'Improving velocity + mental base + consistency after gaps. You fall down and you get back up. Every setback is a setup for your next outstanding performance.',
    traits:['Tough','Adaptable','Unstoppable'],
    tip:'Mental sessions specifically on bouncing back will make your recovery even faster.',
    score:function(s){ return cap(s.mc*3+(s.vel>0?20:0)+s.con*20+s.cstr*2); } },

  { id:'m13', name:'The Overthinker', cat:'mental', rarity:'common', icon:'💭', clr:'#64748b',
    tag:'Analysis can become paralysis',
    desc:'High mental training + lower execution rate. You process deeply but sometimes it slows your instincts. The solution is trained reaction, not more thinking.',
    traits:['Analytical','Thoughtful','Over-Processed'],
    tip:'Trust-your-instinct mental sessions will unlock the talent your analysis is currently hiding.',
    score:function(s){ return cap(s.mc*5+(s.cr<0.3?15:0)+(s.div<1?10:0)); } },

  { id:'m14', name:'The Instinctive', cat:'mental', rarity:'common', icon:'⚡', clr:'#f59e0b',
    tag:'Trusts gut over every plan',
    desc:'Physical-first training with low mental ratio reveals a player who operates on feel and pure instinct. Brilliant in the moment, surprising even yourself.',
    traits:['Intuitive','Reactive','Natural'],
    tip:'Add mental sessions to give your excellent instincts a better framework to operate within.',
    score:function(s){ return cap((s.bd+s.bwd+s.fd)*3+(s.mr<0.05?20:0)+s.hx*3); } },

  { id:'m15', name:'The Routineer', cat:'mental', rarity:'uncommon', icon:'📋', clr:'#0891b2',
    tag:'Pre-match rituals are sacred',
    desc:'High consistency + streak + challenge streak. Your training routine is fixed and sacred. Adherence makes you unstoppable — and your data proves you adhere.',
    traits:['Disciplined','Habitual','Consistent'],
    tip:'Build adaptable routines — different venues and conditions require flexibility within your structure.',
    score:function(s){ return cap(s.con*40+(s.cs>7?20:0)+s.cstr*3); } },

  { id:'m16', name:'The Adapter', cat:'mental', rarity:'uncommon', icon:'🔄', clr:'#059669',
    tag:'Changes game plan mid-innings',
    desc:'High diversity + rising velocity + mental sessions. You shift seamlessly between disciplines and scenarios. When Plan A fails, Plans B, C, and D are already forming.',
    traits:['Flexible','Creative','Resourceful'],
    tip:'Deepen one specialty alongside your adaptability — true masters adapt with depth behind them.',
    score:function(s){ return cap(s.div*30+s.vel*20+(s.mr>0.1?10:0)); } },

  { id:'m17', name:'The Confidence Vampire', cat:'mental', rarity:'common', icon:'🧛', clr:'#7c3aed',
    tag:'Needs early success to unlock',
    desc:'High XP spikes with inconsistent consistency — when you\'re in form you\'re unstoppable, but breaking back in after bad patches is your defining challenge.',
    traits:['Form-Player','Talented','Inconsistent'],
    tip:'Mental sessions specifically on confidence-building after failures will transform your entire game.',
    score:function(s){ return cap(s.hx*5+(s.con<0.4?15:0)+s.mc*3); } },

  { id:'m18', name:'The Late Developer', cat:'mental', rarity:'uncommon', icon:'🌅', clr:'#ea580c',
    tag:'Gets better as the session progresses',
    desc:'Rising velocity signal is the key marker. Your best cricket comes after you\'ve warmed up mentally — and the data shows you\'re on a compelling upward curve.',
    traits:['Patient','Progressive','Improving'],
    tip:'Pre-session activation mental sessions will help you start quicker and maintain the quality longer.',
    score:function(s){ return cap(s.vel*40+(s.cs>3?10:0)+s.mc*2); } },

  { id:'m19', name:'The Pressure Creator', cat:'mental', rarity:'uncommon', icon:'🎯', clr:'#b91c1c',
    tag:'Enjoys putting opponents under pressure',
    desc:'Challenge streak + mental + high-XP pressure moments. You create difficulty for the opposition — field placements, appealing, running. You make the other side uncomfortable.',
    traits:['Aggressive','Clever','Intense'],
    tip:'Add fielding drills to maximise your ability to create pressure from every single position.',
    score:function(s){ return cap(s.cstr*6+s.mc*3+s.hx*3); } },

  { id:'m20', name:'The Zen Master', cat:'mental', rarity:'legendary', icon:'🧘', clr:'#0891b2',
    tag:'Mindfulness practitioner, game in perfect focus',
    desc:'Maximum mental training + high mental ratio + consistency + sheer volume. You have achieved a state of training most players don\'t know exists.',
    traits:['Present','Focused','Master'],
    tip:'Share your mindset with teammates — great mental athletes make the greatest teachers.',
    score:function(s){ return cap(s.mc*5+s.mr*60+s.con*15+(s.mc>50?20:0)); } },

  // ══ FITNESS (10) ══════════════════════════════════════════════════
  { id:'ft01', name:'The Power Athlete', cat:'fitness', rarity:'uncommon', icon:'💪', clr:'#dc2626',
    tag:'Explosive power in every movement',
    desc:'Fitness volume + high-XP days + above-average XP per session. Your physical conditioning is your X-factor. The gym work translates to explosive cricket.',
    traits:['Powerful','Explosive','Athletic'],
    tip:'Technical drill work ensures your power is applied with cricket-specific precision.',
    score:function(s){ return cap(s.fc*5+s.hx*5+(s.ax>150?20:0)); } },

  { id:'ft02', name:'The Endurance Machine', cat:'fitness', rarity:'uncommon', icon:'🏃', clr:'#16a34a',
    tag:'Can play 8-hour days',
    desc:'Fitness consistency + long streaks. You build the engine that runs for 90 overs, a five-day Test, or a hot afternoon in the field when others have nothing left.',
    traits:['Enduring','Consistent','Iron-Willed'],
    tip:'Add explosive training to complement your exceptional aerobic base.',
    score:function(s){ return cap(s.fc*4+s.con*30+(s.bs>14?15:0)); } },

  { id:'ft03', name:'The Speed Merchant', cat:'fitness', rarity:'uncommon', icon:'⚡', clr:'#f59e0b',
    tag:'Fastest between the wickets',
    desc:'Fitness + fielding combination. Your work in the gym and the field creates genuine speed — between wickets, in the outfield, and in your running between them.',
    traits:['Fast','Agile','Athletic'],
    tip:'Mental training for running between the wickets reduces the run-out risk from your aggressive approach.',
    score:function(s){ return cap(s.fc*5+s.fd*3+s.hx*4); } },

  { id:'ft04', name:'The Conditioning Specialist', cat:'fitness', rarity:'uncommon', icon:'🎯', clr:'#ea580c',
    tag:'Cricket-specific fitness mastery',
    desc:'Fitness + diversity + improving trajectory. Your conditioning is designed specifically for cricket — explosive sprints, throwing power, sustained concentration.',
    traits:['Specific','Improving','Smart'],
    tip:'Add mental sessions — psychological endurance is the final component of true conditioning.',
    score:function(s){ return cap(s.fc*5+s.div*15+(s.vel>0?15:0)); } },

  { id:'ft05', name:'The Strength Foundation', cat:'fitness', rarity:'common', icon:'🏋️', clr:'#78350f',
    tag:'The gym first, always',
    desc:'High fitness volume + high-XP sessions. Your strength base is the foundation everything else is built on. When you need to hit over the ropes, you absolutely can.',
    traits:['Strong','Physical','Powerful'],
    tip:'Translate gym strength into cricket-specific movements with focused technical drills.',
    score:function(s){ return cap(s.fc*5+s.hx*4+(s.ax>150?15:0)); } },

  { id:'ft06', name:'The Flexible Technician', cat:'fitness', rarity:'common', icon:'🧘', clr:'#0d9488',
    tag:'Mobility and movement over raw power',
    desc:'Fitness + technical drilling + completion rate. Your mobility training keeps you injury-free and technically sound throughout long campaigns.',
    traits:['Mobile','Technical','Injury-Free'],
    tip:'Build strength work alongside your mobility training for a truly complete physical base.',
    score:function(s){ return cap(s.fc*4+s.mc*2+s.cr*20); } },

  { id:'ft07', name:'The Recovery Expert', cat:'fitness', rarity:'common', icon:'🌙', clr:'#6366f1',
    tag:'Sleep, nutrition, rest — the real training',
    desc:'Mental + fitness + consistency. You understand that recovery IS training. Your consistent sessions show someone who manages body and mind with genuine intelligence.',
    traits:['Disciplined','Smart','Consistent'],
    tip:'Work on pre-training activation to complement your already excellent recovery approach.',
    score:function(s){ return cap(s.mc*3+s.fc*3+s.con*25); } },

  { id:'ft08', name:'The HIIT Devotee', cat:'fitness', rarity:'common', icon:'🔥', clr:'#f97316',
    tag:'Short, sharp, brutal sessions',
    desc:'Fitness volume + high-XP density. You love the high-intensity intervals — the burn, the explosion, the feeling of having given everything in a compressed window.',
    traits:['Intense','Efficient','Explosive'],
    tip:'Cricket requires sustained effort too — add endurance work alongside your HIIT sessions.',
    score:function(s){ return cap(s.fc*5+s.hx*6+(s.div<2?10:0)); } },

  { id:'ft09', name:'The Late-Game Performer', cat:'fitness', rarity:'uncommon', icon:'🌅', clr:'#0891b2',
    tag:'Fitness peaks when others are tired',
    desc:'Rising XP velocity + fitness base. Your best cricket comes when others are running empty — because your conditioning is specifically designed for long-game scenarios.',
    traits:['Enduring','Clutch','Athletic'],
    tip:'Continue building your aerobic base — late-game performance is a decisive competitive advantage.',
    score:function(s){ return cap(s.vel*30+s.fc*3+(s.cs>3?15:0)); } },

  { id:'ft10', name:'The Injury Manager', cat:'fitness', rarity:'common', icon:'🩹', clr:'#64748b',
    tag:'Training around limitations intelligently',
    desc:'Moderate fitness + mental sessions + consistent training despite lower intensity — someone managing their body carefully while staying completely engaged with the game.',
    traits:['Smart','Resilient','Consistent'],
    tip:'Work with a physio to identify specific exercises that address your limitations directly.',
    score:function(s){ return cap(s.fc*3+s.mc*2+(s.con>0.5&&s.ax<120?20:0)); } },

  // ══ FORMAT (10) ═══════════════════════════════════════════════════
  { id:'fm01', name:'The Test Purist', cat:'format', rarity:'rare', icon:'🏛️', clr:'#78350f',
    tag:'Five days. Red ball. Pure cricket.',
    desc:'Long consistency streaks + mental + technical drilling + best streak signals. You are built for Test cricket. Patient, skilled, mentally resilient over extended periods.',
    traits:['Patient','Technical','Enduring'],
    tip:'White ball drills will keep your complete game sharp while you specialise.',
    score:function(s){ return cap(s.con*30+s.mc*2+(s.bd+s.bwd+s.fd)*3+(s.bs>14?20:0)); } },

  { id:'fm02', name:'The ODI Strategist', cat:'format', rarity:'uncommon', icon:'📊', clr:'#0891b2',
    tag:'50-over game mastery',
    desc:'Diversity + knowledge + mental + physical. The 50-over game rewards intelligent cricketers who can bat at 6, bowl two spells, field all day, and read the situation.',
    traits:['Balanced','Intelligent','Versatile'],
    tip:'Work on specific match-scenario drills — ODI cricket demands constant tactical adaptability.',
    score:function(s){ return cap(s.div*25+s.nc*3+s.mc*2+s.hx*2); } },

  { id:'fm03', name:'The T20 Entertainer', cat:'format', rarity:'uncommon', icon:'🎆', clr:'#dc2626',
    tag:'20 overs to win the crowd',
    desc:'XP spikes + fitness + bowling + experience. T20 cricket rewards explosiveness, variations, and moments of pure genius. Your data shows a player built for the shortest format.',
    traits:['Explosive','Creative','Entertaining'],
    tip:'Mental training for specific T20 high-pressure moments will maximise your total impact.',
    score:function(s){ return cap(s.hx*5+s.fc*3+s.bwd*3+(s.txp>2000?10:0)); } },

  { id:'fm04', name:'The Format Chameleon', cat:'format', rarity:'rare', icon:'🦎', clr:'#059669',
    tag:'Adapts perfectly to every format',
    desc:'High diversity + balanced batting + bowling profile. You shift between formats seamlessly — Test patience one session, T20 aggression the next. The rarest ability.',
    traits:['Adaptable','Complete','Elite'],
    tip:'Deepen expertise in at least one format — chameleons who specialise are the best in the world.',
    score:function(s){ return cap(s.div*35+(s.bd>5&&s.bwd>5&&s.fd>3?20:0)); } },

  { id:'fm05', name:'The Club Legend', cat:'format', rarity:'uncommon', icon:'🏅', clr:'#ca8a04',
    tag:'Dominant at club and local level',
    desc:'High total XP + best streak + completion rate. You have accumulated cricket wisdom over extended time. Your experience makes you the player others come to for advice.',
    traits:['Experienced','Respected','Complete'],
    tip:'Push your game to the next level with advanced and pro-level skill paths.',
    score:function(s){ return cap(s.txp/100+s.bs*0.5+s.cr*20+(s.txp>5000?15:0)); } },

  { id:'fm06', name:'The Academy Graduate', cat:'format', rarity:'common', icon:'🎓', clr:'#6366f1',
    tag:'Technically perfect, building experience',
    desc:'High completion rate with lower total XP. You\'ve been through the structured system — technical precision is your strength, and match experience is being built rapidly.',
    traits:['Technical','Learning','Foundation'],
    tip:'Get more volume — your technique is excellent, now you need match-simulation intensity.',
    score:function(s){ return cap(s.cr*40+(s.txp<2000?10:0)+s.mc); } },

  { id:'fm07', name:'The Street Cricket Survivor', cat:'format', rarity:'common', icon:'🏙️', clr:'#6b7280',
    tag:'Unorthodox but completely battle-hardened',
    desc:'High-XP spikes with lower consistency — natural talent developed in informal settings where technique is improvised but match-winning ability is real and earned.',
    traits:['Natural','Unorthodox','Resilient'],
    tip:'Formalise your technique with structured drills — street cricket brilliance + foundation = elite.',
    score:function(s){ return cap(s.hx*6+(s.con<0.6?10:0)+s.bd*3); } },

  { id:'fm08', name:'The All-Format Machine', cat:'format', rarity:'rare', icon:'⚙️', clr:'#0d9488',
    tag:'Consistent excellence across every format',
    desc:'Perfectly balanced batting + bowling + mental + physical profile. You play every format and contribute meaningfully in every format. The benchmark player every coach wants.',
    traits:['Complete','Balanced','Elite'],
    tip:'You\'re nearly there — sharpen the edges and become the best all-format player in your squad.',
    score:function(s){ return cap(s.div*30+s.con*20+(s.bd>5&&s.bwd>5&&s.mc>10?20:0)); } },

  { id:'fm09', name:'The Big Match Player', cat:'format', rarity:'rare', icon:'🎪', clr:'#7c3aed',
    tag:'Rises to every single occasion',
    desc:'Challenge streak + mental training + streak + high-XP moments. When the game is biggest, you become your very best. Your data confirms what your teammates already know.',
    traits:['Clutch','Driven','Elite'],
    tip:'Work on consistent base performance — big match players who can\'t perform on off-days are hard to select.',
    score:function(s){ return cap(s.cstr*5+s.mc*3+(s.cs>7?15:0)+s.hx*3); } },

  { id:'fm10', name:'The Serial Performer', cat:'format', rarity:'uncommon', icon:'📅', clr:'#16a34a',
    tag:'Consistent week after week, always',
    desc:'Long consistency + best streak + average XP above baseline. You don\'t have massive highs but you have very few lows. Scorecards tell the story of permanent reliability.',
    traits:['Consistent','Reliable','Professional'],
    tip:'Push for exceptional sessions to add a high ceiling to your already consistent floor.',
    score:function(s){ return cap(s.con*35+(s.bs>21?15:0)+(s.ax>100?15:0)); } },

  // ══ TRAINING PATTERN (10) ═════════════════════════════════════════
  { id:'tp01', name:'The Dawn Trainer', cat:'training', rarity:'common', icon:'🌅', clr:'#f59e0b',
    tag:'Wins the morning, wins the day',
    desc:'High consistency + physical output — your training discipline reflects someone who earns their day before most people have even started theirs.',
    traits:['Disciplined','Early-Rising','Committed'],
    tip:'Add evening mental sessions to bookend your day with complete cricket focus.',
    score:function(s){ return cap(s.con*35+s.hx*3+(s.ax>100?10:0)+s.fc*2); } },

  { id:'tp02', name:'The Night Owl', cat:'training', rarity:'common', icon:'🦉', clr:'#4338ca',
    tag:'Late-night dedication',
    desc:'Mental training preference + consistent effort — your data suggests a player whose best sessions happen in the quiet hours when mental clarity is at its sharpest.',
    traits:['Dedicated','Focused','Night-Worker'],
    tip:'Add morning activation sessions — being fresh across all times of day is a real competitive edge.',
    score:function(s){ return cap(s.mc*4+(s.hx>3?10:0)+s.con*20); } },

  { id:'tp03', name:'The Drills Perfectionist', cat:'training', rarity:'uncommon', icon:'📐', clr:'#0891b2',
    tag:'Repeats until absolutely perfect',
    desc:'Maximum drill completion rate with significant volume. You don\'t move on until it\'s completely right. Your cricket foundation is rock solid because you refused to cut corners.',
    traits:['Meticulous','Thorough','Complete'],
    tip:'Trust the foundation you\'ve built — start performing in match simulations, not just practising.',
    score:function(s){ return cap(s.cr*50+(s.bd+s.bwd+s.fd)*3); } },

  { id:'tp04', name:'The Volume Trainer', cat:'training', rarity:'common', icon:'📦', clr:'#6b7280',
    tag:'More reps, more sessions, more improvement',
    desc:'High total activity volume combined with XP accumulation. You believe in doing the work — repetition is your proven route to mastery.',
    traits:['Hardworking','Voluminous','Committed'],
    tip:'Add quality measurement to your volume — not all reps are created equal.',
    score:function(s){ return cap((s.mc+s.fc+(s.bd+s.bwd+s.fd))*1.5+s.txp/150); } },

  { id:'tp05', name:'The Smart Trainer', cat:'training', rarity:'rare', icon:'🧪', clr:'#0d9488',
    tag:'Quality over quantity, every session',
    desc:'High average XP per session with consistency above 50%. You\'ve discovered that focused, high-quality sessions beat volume. Maximum output, minimum wasted effort.',
    traits:['Efficient','Smart','High-Quality'],
    tip:'Your approach is already elite — share it and help raise the standards of those around you.',
    score:function(s){ return cap((s.ax>150?30:0)+(s.con>0.5&&s.ax>150?20:0)+s.cr*20); } },

  { id:'tp06', name:'The Variety Seeker', cat:'training', rarity:'uncommon', icon:'🎨', clr:'#db2777',
    tag:'Every session brings something completely new',
    desc:'Maximum diversity score + positive velocity. You train across all disciplines and you\'re genuinely getting better because of it. Training boredom is an impossibility.',
    traits:['Creative','Exploratory','Growing'],
    tip:'Periodise your variety — some weeks go deep on one skill, then rotate to the next systematically.',
    score:function(s){ return cap(s.div*35+s.vel*15); } },

  { id:'tp07', name:'The Specialist', cat:'training', rarity:'uncommon', icon:'🎯', clr:'#7c3aed',
    tag:'Deepest expertise in one dimension',
    desc:'One discipline dominates your training + high completion rate. You\'ve chosen your weapon and you\'re mastering it with the dedication of a true specialist.',
    traits:['Focused','Expert','Deep'],
    tip:'Add complementary skills to your speciality — the best specialists also have reliable secondary tools.',
    score:function(s){ return cap((s.bd>15||s.bwd>15||s.mc>30?30:0)+s.cr*20+s.con*20); } },

  { id:'tp08', name:'The Completionist', cat:'training', rarity:'rare', icon:'✅', clr:'#16a34a',
    tag:'Finishes every single session',
    desc:'Maximum completion rates across drills + high mental count + Daily Net. You complete what you start. Every session, every challenge, every goal. The rarest training quality.',
    traits:['Thorough','Disciplined','Reliable'],
    tip:'Push into advanced and pro-level content to match your exceptional completion rate.',
    score:function(s){ return cap(s.cr*50+(s.mc>20?15:0)+(s.nc>20?10:0)); } },

  { id:'tp09', name:'The Streak Protector', cat:'training', rarity:'uncommon', icon:'🛡️', clr:'#f59e0b',
    tag:'Never misses a day, ever',
    desc:'High current + best streak + challenge streak + consistency. Your streak is your identity. Missing a day is simply not an option — and the data proves it hasn\'t happened.',
    traits:['Dedicated','Habitual','Iron-Streak'],
    tip:'Pair your streak discipline with quality measurement — perfect attendance plus high quality is the ultimate target.',
    score:function(s){ return cap(s.cs*2+s.bs*0.5+s.con*25+s.cstr*3); } },

  { id:'tp10', name:'The Weekend Warrior', cat:'training', rarity:'common', icon:'🏖️', clr:'#0ea5e9',
    tag:'Intense sessions when life allows',
    desc:'High weekend XP ratio — your life doesn\'t always allow daily sessions, but when you train, you commit completely. Quality when available, not guilt when not.',
    traits:['Intense','Periodic','Committed'],
    tip:'Add small weekday sessions — even 10 minutes of mental training keeps the habit genuinely alive.',
    score:function(s){ return cap(s.wr*80+(s.con>0.3?10:0)); } },

  // ══ LEGENDARY (6) ═════════════════════════════════════════════════
  { id:'l01', name:'The Complete Cricketer', cat:'legendary', rarity:'legendary', icon:'🌟', clr:'#f59e0b',
    tag:'All disciplines, all dimensions, all present',
    desc:'Batting + bowling + fielding + mental + fitness + consistency all above threshold simultaneously. The rarest DNA in SmartCrick. Fewer than 1 in 200 players ever unlocks this.',
    traits:['All-Round','Elite','Extraordinary'],
    tip:'You\'re already complete. Now define what elite personally means to you.',
    score:function(s){ return cap(s.bd>8&&s.bwd>8&&s.mc>15&&s.fc>10&&s.con>0.7 ? s.div*20+s.con*20+s.mc+s.bd+s.bwd+s.fd : 0); } },

  { id:'l02', name:'The Rough Diamond', cat:'legendary', rarity:'legendary', icon:'💎', clr:'#a855f7',
    tag:'Raw talent rising at an extraordinary rate',
    desc:'Explosive velocity combined with relatively modest total XP — newer to structured training but improving at an extraordinary rate. The biggest single potential in the system.',
    traits:['Talented','Rapid','Explosive-Growth'],
    tip:'Don\'t slow down. Your velocity signal is the rarest training indicator in cricket analytics.',
    score:function(s){ return cap(s.vel>0.3 ? s.vel*50+(s.txp<3000?20:0)+(s.cs>3?20:0) : 0); } },

  { id:'l03', name:'The Diamond in the Rough', cat:'legendary', rarity:'legendary', icon:'💠', clr:'#0891b2',
    tag:'Exceptional quality, not raw quantity',
    desc:'Extraordinary XP per session combined with moderate training frequency. You don\'t need to train every day — when you do, it\'s a masterclass. Efficiency as pure art form.',
    traits:['Efficient','Expert','Masterful'],
    tip:'Show up more consistently — your per-session quality combined with frequency would be unstoppable.',
    score:function(s){ return cap(s.ax>200&&s.con>0.3 ? s.ax/3+s.con*30 : 0); } },

  { id:'l04', name:'The Rising Star', cat:'legendary', rarity:'legendary', icon:'⭐', clr:'#ca8a04',
    tag:'On a trajectory nobody can stop',
    desc:'Positive velocity + early XP journey + growing streak. You\'re in the window where improvement is fastest. This profile identifies players who break through at the next level.',
    traits:['Improving','Ascending','Trajectory'],
    tip:'Protect this phase of development — consistent improvement is more valuable than any single session.',
    score:function(s){ return cap(s.vel>0.1&&s.txp<5000 ? s.vel*40+s.mc+(s.cs>5?20:0) : 0); } },

  { id:'l05', name:'The Veteran', cat:'legendary', rarity:'legendary', icon:'🏆', clr:'#ca8a04',
    tag:'Every badge earned, every XP completely worth it',
    desc:'Exceptional total XP + long best streak + high completion rate. You\'ve been through everything SmartCrick can throw at you and kept going. The mark of a true elite.',
    traits:['Experienced','Elite','Complete'],
    tip:'Your legacy is being built session by session. Pass your knowledge and experience on.',
    score:function(s){ return cap(s.txp>15000 ? s.txp/300+s.bs*0.5+s.cr*20 : 0); } },

  { id:'l06', name:'The Architect', cat:'legendary', rarity:'legendary', icon:'🏗️', clr:'#7c3aed',
    tag:'Constructs innings, constructs careers',
    desc:'Deep batting + deep bowling + strong mental base. You understand both sides of the game deeply. The Architect uses every skill to paint the complete picture.',
    traits:['Strategic','Complete','Visionary'],
    tip:'Your cricket IQ is maximal. Ensure your physical conditioning matches your strategic depth.',
    score:function(s){ return cap(s.bd>10&&s.bwd>10&&s.mc>20 ? (s.bd+s.bwd)*4+s.mc*2+s.con*15 : 0); } },
];

// ── DNA computation engine ────────────────────────────────────────
function computeDNA() {
  var s = extractSignals();
  var scored = PROFILES.map(function(p) {
    var sc = 0;
    try { sc = p.score(s); } catch(e) { sc = 0; }
    var obj = {};
    for (var k in p) { if (k !== 'score') obj[k] = p[k]; }
    obj.score = sc;
    return obj;
  });
  scored.sort(function(a, b) { return b.score - a.score; });
  var hasData = s.totalDrills + s.mc + s.fc + s.nc >= 3;
  return {
    primary:       scored[0],
    secondary:     scored[1],
    tertiary:      scored[2],
    allScores:     scored,
    signals:       s,
    hasEnoughData: hasData,
    computed_at:   Date.now(),
  };
}

// ── Caching layer ─────────────────────────────────────────────────
var _dnaCache = null;
function getCachedDNA() {
  if (!_dnaCache) {
    try {
      var stored = DB.get && DB.get('sc_dna_v1');
      if (stored && stored.computed_at && (Date.now() - stored.computed_at < 3600000)) {
        _dnaCache = stored; // reuse if < 1 hour old
      }
    } catch(e) {}
  }
  if (!_dnaCache) {
    _dnaCache = computeDNA();
    try { if (DB.set) DB.set('sc_dna_v1', _dnaCache); } catch(e) {}
  }
  return _dnaCache;
}
window.addEventListener('sc_update', function() { _dnaCache = null; });

// ── Rarity display helpers ────────────────────────────────────────
var RARITY_COLORS = { common:'#6b7280', uncommon:'#3b82f6', rare:'#a855f7', legendary:'#f59e0b' };
var RARITY_LABELS = { common:'Common', uncommon:'Uncommon', rare:'Rare', legendary:'Legendary' };
var CAT_LABELS = {
  batting:'Batting', bowling:'Bowling', fielding:'Fielding',
  mental:'Mental', fitness:'Fitness', format:'Format',
  training:'Training', legendary:'Legendary',
};

// ── DNAOverview — compact widget for home/progress pages ──────────
function DNAOverview() {
  var [dna, setDna] = useState(null);
  useEffect(function() {
    try { setDna(getCachedDNA()); } catch(e) {}
    window.addEventListener('sc_update', function(){
      try { setDna(getCachedDNA()); } catch(e) {}
    });
  }, []);
  if (!dna || !dna.hasEnoughData || !dna.primary) return null;
  var p = dna.primary;
  return h('div', {
    role:'button', tabIndex:0, 'aria-label':'Your Cricket DNA: ' + p.name,
    onClick: function(){ if(nav) nav('CricketDNA'); },
    onKeyDown: function(e){ if(e.key==='Enter'||e.key===' ')nav&&nav('CricketDNA'); },
    style:{ margin:'0 16px 12px', cursor:'pointer', outline:'none' }
  },
    h('div', { style:{
      padding:'10px 14px', borderRadius:12,
      background:p.clr+'10', border:'1px solid '+p.clr+'28',
      display:'flex', alignItems:'center', gap:10,
    }},
      h('div',{style:{fontSize:22}},p.icon),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:10,fontWeight:800,textTransform:'uppercase',
          letterSpacing:'0.1em',color:'#484f58',marginBottom:2}},'YOUR CRICKET DNA'),
        h('div',{style:{fontSize:13,fontWeight:700,color:p.clr}},p.name),
        h('div',{style:{fontSize:11,color:'#6b7280'}},p.tag)
      ),
      h('span',{style:{fontSize:11,color:p.clr,fontWeight:600}},'View →')
    )
  );
}

// ── Profile cards ─────────────────────────────────────────────────
function PrimaryProfileCard(props) {
  var p = props.profile;
  if (!p) return null;
  var rc = RARITY_COLORS[p.rarity] || '#6b7280';
  var rl = RARITY_LABELS[p.rarity] || p.rarity;
  return h('div', { style:{
    borderRadius:16, overflow:'hidden',
    background:'rgba(13,17,23,0.98)',
    border:'1px solid '+p.clr+'40',
  }},
    h('div',{style:{height:4,background:'linear-gradient(to right,'+p.clr+','+p.clr+'66)'}}),
    h('div',{style:{padding:'16px'}},
      h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:12}},
        h('div',{style:{
          width:56,height:56,borderRadius:14,fontSize:28,
          background:p.clr+'18',border:'1px solid '+p.clr+'35',
          display:'flex',alignItems:'center',justifyContent:'center'
        }},p.icon),
        h('div',{style:{flex:1}},
          h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
            h('div',{style:{
              fontSize:9,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.12em',
              color:rc,background:rc+'18',padding:'2px 7px',borderRadius:99,
              border:'1px solid '+rc+'30'
            }},rl),
            h('div',{style:{fontSize:10,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.06em'}},
              CAT_LABELS[p.cat]||p.cat)
          ),
          h('div',{style:{fontSize:20,fontWeight:800,color:'#f0fdf4',lineHeight:1.1}},p.name)
        )
      ),
      h('div',{style:{fontSize:12,fontStyle:'italic',color:p.clr,marginBottom:8,fontWeight:600}},'"'+p.tag+'"'),
      h('div',{style:{fontSize:12,color:'#9ca3af',lineHeight:1.7,marginBottom:12}},p.desc),
      h('div',{style:{display:'flex',flexWrap:'wrap',gap:5,marginBottom:12}},
        (p.traits||[]).map(function(t){
          return h('span',{key:t,style:{
            fontSize:11,fontWeight:700,color:p.clr,
            background:p.clr+'12',border:'1px solid '+p.clr+'25',
            padding:'3px 10px',borderRadius:99
          }},t);
        })
      ),
      h('div',{style:{
        padding:'10px 12px',borderRadius:9,
        background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',
        fontSize:11,color:'#8b949e',lineHeight:1.6
      }},
        h('span',{style:{fontWeight:700,color:p.clr}},'\uD83D\uDCA1 Training insight: '),
        p.tip
      ),
      h('div',{style:{marginTop:12}},
        h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:4}},
          h('span',{style:{fontSize:10,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},
            'MATCH STRENGTH'),
          h('span',{style:{fontSize:11,fontWeight:700,color:p.clr}},p.score+'%')
        ),
        h('div',{style:{height:6,borderRadius:99,background:'rgba(25,32,40,0.9)',overflow:'hidden'}},
          h('div',{style:{
            height:'100%',width:p.score+'%',borderRadius:99,
            background:'linear-gradient(to right,'+p.clr+','+p.clr+'88)',
            transition:'width 1s cubic-bezier(0.16,1,0.3,1)'
          }})
        )
      )
    )
  );
}

function SmallProfileCard(props) {
  var p = props.profile, label = props.label || 'Secondary';
  if (!p) return null;
  return h('div',{style:{
    flex:1,padding:'12px',borderRadius:12,
    background:'rgba(13,17,23,0.97)',border:'1px solid '+p.clr+'28'
  }},
    h('div',{style:{fontSize:10,color:'#484f58',textTransform:'uppercase',
      letterSpacing:'0.08em',marginBottom:6}},label),
    h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:8}},
      h('div',{style:{fontSize:20}},p.icon),
      h('div',null,
        h('div',{style:{fontSize:13,fontWeight:700,color:p.clr}},p.name),
        h('div',{style:{fontSize:10,color:'#6b7280'}},RARITY_LABELS[p.rarity])
      )
    ),
    h('div',{style:{fontSize:11,color:'#6b7280',lineHeight:1.5}},p.tag),
    h('div',{style:{marginTop:8}},
      h('div',{style:{height:3,borderRadius:99,background:'rgba(25,32,40,0.9)',overflow:'hidden'}},
        h('div',{style:{height:'100%',width:p.score+'%',background:p.clr,borderRadius:99}})
      )
    )
  );
}

// ── Full Cricket DNA Page ─────────────────────────────────────────
function CricketDNAPage() {
  var [dna, setDna]         = useState(null);
  var [loading, setLoading] = useState(true);
  var [showSignals, setShowSignals] = useState(false);
  var [catFilter, setCatFilter]     = useState('all');
  var [showAll, setShowAll]         = useState(false);

  useEffect(function(){
    try {
      setLoading(false);
      setDna(getCachedDNA());
    } catch(e) { setLoading(false); }
    window.addEventListener('sc_update', function(){
      try { setDna(getCachedDNA()); } catch(e) {}
    });
  }, []);

  if (loading) {
    return h('div',{style:{background:'#0d1117',minHeight:'100dvh',
      display:'flex',alignItems:'center',justifyContent:'center'}},
      h('div',{style:{textAlign:'center',color:'#6b7280'}},
        h('div',{style:{fontSize:36,marginBottom:12}},'🧬'),
        h('div',{style:{fontSize:14}},'Analysing training data...')
      )
    );
  }

  var s = dna ? dna.signals : {};
  var sigTotal = (s.totalDrills||0)+(s.mc||0)+(s.fc||0)+(s.nc||0);

  // Category filter options
  var cats = ['all','batting','bowling','fielding','mental','fitness','format','training','legendary'];
  var filteredProfiles = (dna ? dna.allScores : PROFILES).filter(function(p){
    return catFilter === 'all' || p.cat === catFilter;
  });

  return h('div',{style:{background:'#0d1117',minHeight:'100dvh',paddingBottom:80}},

    // Header
    h('div',{style:{
      padding:'20px 16px 16px',
      background:'linear-gradient(180deg,rgba(168,85,247,0.08) 0%,transparent 100%)'
    }},
      h('div',{style:{display:'flex',alignItems:'center',gap:12,marginBottom:6}},
        h('div',{style:{fontSize:32}},'🧬'),
        h('div',null,
          h('h1',{style:{fontSize:22,fontWeight:800,color:'#f0fdf4',margin:0}},'Cricket DNA'),
          h('div',{style:{fontSize:12,color:'#6b7280'}},
            sigTotal>0
              ? 'Analysed '+sigTotal+' training signals from your history'
              : 'Train to discover your Cricket DNA')
        )
      )
    ),

    // Not enough data
    !dna || !dna.hasEnoughData ? h('div',{style:{margin:'16px',padding:'20px',
      borderRadius:14,background:'rgba(168,85,247,0.07)',
      border:'1px solid rgba(168,85,247,0.2)',textAlign:'center'}},
      h('div',{style:{fontSize:36,marginBottom:12}},'🧬'),
      h('div',{style:{fontSize:16,fontWeight:700,color:'#f0fdf4',marginBottom:8}},
        'Start training to unlock your DNA'),
      h('div',{style:{fontSize:13,color:'#9ca3af',lineHeight:1.6,marginBottom:16}},
        'Complete a few drills, mental sessions, or fitness workouts. SmartCrick analyses your training patterns to reveal your unique Cricket DNA profile.'),
      h('button',{onClick:function(){nav('Drills');},
        style:{padding:'12px 24px',background:'#a855f7',color:'#fff',border:'none',
          borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}},
        '→ Start Training')
    ) : h('div',null,

      // Primary profile
      h('div',{style:{margin:'0 16px 12px'}},
        h(PrimaryProfileCard, {profile:dna.primary})
      ),

      // Secondary + Tertiary
      h('div',{style:{display:'flex',gap:8,margin:'0 16px 12px'}},
        h(SmallProfileCard, {profile:dna.secondary, label:'Secondary DNA'}),
        h(SmallProfileCard, {profile:dna.tertiary,  label:'Tertiary DNA'})
      ),

      // Signals panel
      h('div',{style:{margin:'0 16px 12px'}},
        h('div',{
          role:'button',tabIndex:0,
          onClick:function(){ setShowSignals(!showSignals); },
          style:{
            padding:'11px 14px',borderRadius:12,cursor:'pointer',
            background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',
            display:'flex',alignItems:'center',justifyContent:'space-between'
          }
        },
          h('div',{style:{fontSize:13,fontWeight:600,color:'#e5e7eb'}},'📊 Your Training Signals'),
          h('span',{style:{color:'#484f58',fontSize:14}},showSignals?'▲':'▼')
        ),
        showSignals && h('div',{style:{
          padding:'12px',borderRadius:12,marginTop:4,
          background:'rgba(13,17,23,0.98)',border:'1px solid rgba(48,54,61,0.8)'
        }},
          h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}},
            [
              {label:'Batting Drills', val:s.bd||0, max:35},
              {label:'Bowling Drills', val:s.bwd||0, max:35},
              {label:'Fielding Drills', val:s.fd||0, max:20},
              {label:'Mental Sessions', val:s.mc||0, max:50},
              {label:'Fitness Sessions', val:s.fc||0, max:30},
              {label:'Daily Net', val:s.nc||0, max:30},
              {label:'High-XP Days', val:s.hx||0, max:15},
              {label:'Current Streak', val:s.cs||0, max:30},
              {label:'Best Streak', val:s.bs||0, max:100},
              {label:'Consistency (30d)', val:Math.round((s.con||0)*100)+'%', raw:true},
              {label:'XP Velocity', val:(s.vel>0?'+':'')+Math.round((s.vel||0)*100)+'%', raw:true},
              {label:'Diversity Score', val:((s.div||0).toFixed(1))+'/4', raw:true},
            ].map(function(sig){
              return h('div',{key:sig.label,style:{
                padding:'8px 10px',borderRadius:8,
                background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.5)'
              }},
                h('div',{style:{fontSize:10,color:'#484f58',textTransform:'uppercase',
                  letterSpacing:'0.06em',marginBottom:3}},sig.label),
                h('div',{style:{fontSize:15,fontWeight:800,color:'#e5e7eb'}},
                  sig.raw ? sig.val : sig.val)
              );
            })
          )
        )
      ),

      // All profiles grid
      h('div',{style:{margin:'0 16px 12px'}},
        h('div',{style:{fontSize:13,fontWeight:700,color:'#e5e7eb',marginBottom:10}},
          'All 106 Profiles'),
        h('div',{style:{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}},
          cats.map(function(c){
            var sel = catFilter === c;
            return h('button',{key:c,onClick:function(){ setCatFilter(c); },
              style:{
                padding:'4px 10px',borderRadius:99,fontSize:11,cursor:'pointer',
                fontFamily:'inherit',fontWeight:sel?700:400,
                background:sel?'rgba(168,85,247,0.2)':'rgba(255,255,255,0.04)',
                border:'1px solid '+(sel?'rgba(168,85,247,0.4)':'rgba(255,255,255,0.08)'),
                color:sel?'#c084fc':'#6b7280'
              }}, c === 'all' ? 'All' : CAT_LABELS[c]||c);
          })
        ),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}},
          (showAll ? filteredProfiles : filteredProfiles.slice(0, 24)).map(function(p){
            var locked = (p.score||0) < 15;
            return h('div',{key:p.id,style:{
              padding:'8px 6px',borderRadius:10,textAlign:'center',
              background:locked?'rgba(13,17,23,0.6)':'rgba(22,27,34,0.9)',
              border:'1px solid '+(locked?'rgba(48,54,61,0.3)':p.clr+'25'),
              opacity:locked?0.5:1
            }},
              h('div',{style:{fontSize:18,marginBottom:4,filter:locked?'grayscale(1)':'none'}},p.icon),
              h('div',{style:{fontSize:9,fontWeight:700,color:locked?'#374151':p.clr,
                lineHeight:1.3,marginBottom:3}},p.name),
              h('div',{style:{fontSize:8,color:'#484f58'}},RARITY_LABELS[p.rarity]),
              h('div',{style:{marginTop:4,height:2,borderRadius:99,
                background:'rgba(48,54,61,0.6)',overflow:'hidden'}},
                h('div',{style:{height:'100%',width:(p.score||0)+'%',background:p.clr,borderRadius:99}})
              )
            );
          })
        ),
        filteredProfiles.length > 24 && h('button',{
          onClick:function(){ setShowAll(!showAll); },
          style:{
            width:'100%',marginTop:10,padding:'10px',border:'none',borderRadius:10,
            background:'rgba(255,255,255,0.04)',color:'#9ca3af',cursor:'pointer',
            fontSize:13,fontFamily:'inherit'
          }
        }, showAll ? 'Show less' : 'Show all '+filteredProfiles.length+' profiles')
      )
    )
  );
}

// ── Exports ───────────────────────────────────────────────────────
A.CricketDNAPage       = CricketDNAPage;
A.DNAOverview          = DNAOverview;
A.getCricketDNA        = getCachedDNA;
A.computeCricketDNA    = computeDNA;
A.CRICKET_DNA_PROFILES = PROFILES;

console.log('[SC] app-cricket-dna.js v1.0 — ' + PROFILES.length + ' profiles, DNA engine ready');
})();
