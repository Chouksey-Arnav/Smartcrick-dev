// app-daily-challenge.js v1.0
// ================================================================
// SmartCrick — Daily Challenge Engine
//
// Architecture:
//   - 30-challenge bank, date-seeded (date % 30) — same challenge
//     for all users each day, resets every 30 days
//   - 12 challenge types with real completion detection against xpLog
//   - Challenge streak: consecutive days completing = separate streak
//   - Adaptive XP bonus: scales slightly with user level
//   - Auto-detects completion in real-time via sc_update events
//   - Idempotent claiming — bonus XP awarded exactly once per day
//   - Challenge streak milestones at 3, 7, 14, 30 days
//
// Exports onto window.SC_APP:
//   A.DailyChallengeCard        — React component for home feed
//   A.getTodayChallenge()       — returns today's challenge object
//   A.checkChallengeProgress()  — { done, progress, total, pct }
//   A.claimDailyChallenge()     — awards bonus, updates streak
//   A.getChallengeStreak()      — { streak, best, lastCompleted }
//   A.initDailyChallenge()      — safe init, call from AppShell
// ================================================================
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A  = window.SC_APP;
var DB = A.DB;

// ── DB keys ───────────────────────────────────────────────────────
var KEY_CLAIMED  = 'sc_dc_claimed_';    // + YYYY-MM-DD → true
var KEY_STREAK   = 'sc_dc_streak';      // { streak, best, lastCompleted }

// ── Date helper ───────────────────────────────────────────────────
function getToday() {
  var d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth()+1).padStart(2,'0') + '-'
    + String(d.getDate()).padStart(2,'0');
}

// ── 30-challenge bank ─────────────────────────────────────────────
// Types: any_drill | batting_drill | bowling_drill | fielding_drill |
//        mental_x1 | mental_x2 | fitness | daily_net |
//        xp_target | drill_mental | drill_fitness | triple_combo |
//        drills_x2 | any_3types | net_and_drill | bat_and_bowl |
//        mental_and_xp | any_4acts
//
// Each challenge has:
//   id, type, label, desc, xpBonus, icon, color, navTarget,
//   target (optional: count for multi-step)
// ----------------------------------------------------------------
var CHALLENGE_BANK = [
  {
    id:'dc_00', type:'any_drill', label:'First ball of the day',
    desc:'Complete any cricket drill. Champions start their day with intention — not just gym selfies.',
    xpBonus:60, icon:'🏏', color:'#3b82f6', nav:'Drills',
  },
  {
    id:'dc_01', type:'mental_x1', label:'Train the organ that matters most',
    desc:'One mental session. Your brain is your best piece of equipment. Sharpen it.',
    xpBonus:55, icon:'🧠', color:'#8b5cf6', nav:'Mental',
  },
  {
    id:'dc_02', type:'xp_target', target:100, label:'100 XP day',
    desc:'Earn 100 XP in any combination of training. Consistent effort beats occasional brilliance.',
    xpBonus:70, icon:'⚡', color:'#f59e0b', nav:'Drills',
  },
  {
    id:'dc_03', type:'batting_drill', label:'The blade is your weapon',
    desc:'Complete a batting drill today. Technique built in training becomes instinct in the match.',
    xpBonus:65, icon:'🏏', color:'#3b82f6', nav:'Drills',
  },
  {
    id:'dc_04', type:'mental_x2', target:2, label:'Double mental session',
    desc:'Two mental sessions. Elite athletes spend as much time on psychology as on physical skill.',
    xpBonus:90, icon:'🧠', color:'#8b5cf6', nav:'Mental',
  },
  {
    id:'dc_05', type:'drill_mental', label:'Body and mind — the complete session',
    desc:'One drill + one mental session. Separation of physical and mental training is a myth.',
    xpBonus:100, icon:'💎', color:'#14b8a6', nav:'Drills',
  },
  {
    id:'dc_06', type:'fitness', label:'Cricket is an athletic sport',
    desc:'Complete a fitness workout. The fittest cricketer on the pitch has an advantage no technique can cancel.',
    xpBonus:75, icon:'💪', color:'#f97316', nav:'Fitness',
  },
  {
    id:'dc_07', type:'bowling_drill', label:'Wickets are earned, not given',
    desc:'A bowling drill today. Line, length, and craft win matches for your team.',
    xpBonus:65, icon:'🎳', color:'#ef4444', nav:'Drills',
  },
  {
    id:'dc_08', type:'xp_target', target:150, label:'150 XP — push the pace',
    desc:'Earn 150 XP today. This requires a real session, not just a quick spin.',
    xpBonus:85, icon:'🔥', color:'#f59e0b', nav:'Drills',
  },
  {
    id:'dc_09', type:'daily_net', label:'Great players know the game',
    desc:'Complete today\'s Daily Net quiz. Understanding cricket makes you a smarter player on the field.',
    xpBonus:60, icon:'🎯', color:'#6366f1', nav:'DailyNet',
  },
  {
    id:'dc_10', type:'fielding_drill', label:'The game is won in the field',
    desc:'A fielding drill today. Saves in the field and direct-hit run-outs change entire match momentum.',
    xpBonus:65, icon:'🤸', color:'#10b981', nav:'Drills',
  },
  {
    id:'dc_11', type:'triple_combo', label:'Triple threat session',
    desc:'Drill + mental + fitness in one day. Three pillars, one complete athlete. This is elite preparation.',
    xpBonus:130, icon:'⭐', color:'#f59e0b', nav:'Drills',
  },
  {
    id:'dc_12', type:'any_drill', label:'Repetition is the mother of skill',
    desc:'Another drill session. Mastery is just repetition the lazy never complete.',
    xpBonus:60, icon:'🏏', color:'#3b82f6', nav:'Drills',
  },
  {
    id:'dc_13', type:'xp_target', target:200, label:'200 XP — elite effort required',
    desc:'200 XP today. This means a complete training day. No shortcuts accepted.',
    xpBonus:100, icon:'💥', color:'#ef4444', nav:'Drills',
  },
  {
    id:'dc_14', type:'bat_and_bowl', label:'All-round capability day',
    desc:'Batting drill + bowling drill. All-rounders win matches that specialists can\'t. Expand your game.',
    xpBonus:110, icon:'⭐', color:'#14b8a6', nav:'Drills',
  },
  {
    id:'dc_15', type:'drills_x2', target:2, label:'Double drill session',
    desc:'Two separate drills. The second one is always harder. Do it anyway.',
    xpBonus:100, icon:'🏏', color:'#3b82f6', nav:'Drills',
  },
  {
    id:'dc_16', type:'mental_and_xp', target:100, label:'Mind and grind',
    desc:'Mental session + earn 100 XP. Focused mind, focused training. Watch the quality of everything improve.',
    xpBonus:95, icon:'🧠', color:'#8b5cf6', nav:'Mental',
  },
  {
    id:'dc_17', type:'bowling_drill', label:'Build the stock ball',
    desc:'A bowling drill. The best bowlers make the basics devastating through repetition.',
    xpBonus:65, icon:'🎳', color:'#ef4444', nav:'Drills',
  },
  {
    id:'dc_18', type:'xp_target', target:120, label:'Above average is below elite',
    desc:'120 XP today. This phrase should haunt every player who settles for average effort.',
    xpBonus:75, icon:'🔥', color:'#f59e0b', nav:'Drills',
  },
  {
    id:'dc_19', type:'net_and_drill', label:'Knowledge into action',
    desc:'Daily Net quiz + any drill. Understanding the game theoretically AND training it physically.',
    xpBonus:95, icon:'🎯', color:'#6366f1', nav:'DailyNet',
  },
  {
    id:'dc_20', type:'fitness', label:'Build the cricket engine',
    desc:'Fitness session today. Power in cricket comes from specific athletic conditioning. Build yours.',
    xpBonus:75, icon:'💪', color:'#f97316', nav:'Fitness',
  },
  {
    id:'dc_21', type:'fielding_drill', label:'Elite fielding separates teams',
    desc:'A fielding drill. The standard of fielding across world cricket has risen every decade. Rise with it.',
    xpBonus:65, icon:'🤸', color:'#10b981', nav:'Drills',
  },
  {
    id:'dc_22', type:'mental_x2_drill', target:2, label:'Full elite preparation',
    desc:'2 mental sessions + 1 drill. This is how professional cricketers prepare their minds before major matches.',
    xpBonus:120, icon:'👑', color:'#f59e0b', nav:'Mental',
  },
  {
    id:'dc_23', type:'xp_target', target:250, label:'250 XP — champion\'s day',
    desc:'250 XP in a single day. Less than 5% of SmartCrick players hit this. You\'re going to be one of them.',
    xpBonus:120, icon:'💎', color:'#6366f1', nav:'Drills',
  },
  {
    id:'dc_24', type:'drill_mental', label:'The complete player',
    desc:'Drill + mental session. Physical skill without mental strength loses the big moments. Win both.',
    xpBonus:105, icon:'💎', color:'#14b8a6', nav:'Drills',
  },
  {
    id:'dc_25', type:'any_3types', label:'Three-discipline champion',
    desc:'Three different activity types today. Drill, mental, fitness — or mix with Daily Net. Complete training.',
    xpBonus:130, icon:'🏆', color:'#f59e0b', nav:'Drills',
  },
  {
    id:'dc_26', type:'batting_drill', label:'The cover drive never gets old',
    desc:'A batting drill. There is no shortcut to technical excellence. Return to the fundamentals.',
    xpBonus:65, icon:'🏏', color:'#3b82f6', nav:'Drills',
  },
  {
    id:'dc_27', type:'xp_target', target:175, label:'Consistent excellence',
    desc:'175 XP. Consistency is the trait coaches look for in professional contracts. Build it now.',
    xpBonus:90, icon:'🔥', color:'#f59e0b', nav:'Drills',
  },
  {
    id:'dc_28', type:'mental_x1', label:'Pre-match preparation',
    desc:'One mental session. Pre-match rituals and mental preparation are used by every player at the highest level.',
    xpBonus:55, icon:'🧠', color:'#8b5cf6', nav:'Mental',
  },
  {
    id:'dc_29', type:'triple_combo', label:'The champion\'s training day',
    desc:'Drill + mental + fitness. Three disciplines in one session. Champions train like this, not just before the big game.',
    xpBonus:130, icon:'👑', color:'#ef4444', nav:'Drills',
  },
];

// ── getTodayChallenge ─────────────────────────────────────────────
// Deterministic: same challenge for everyone on the same calendar day
function getTodayChallenge() {
  var today = getToday();
  // Numeric seed from YYYYMMDD
  var seed = parseInt(today.replace(/-/g,''), 10);
  var idx  = seed % CHALLENGE_BANK.length;
  return Object.assign({}, CHALLENGE_BANK[idx], { date: today });
}

// ── Completion detection engine ───────────────────────────────────
// Reads from xpLog (real-time), completed_drills, and DB keys.
// Returns { done, progress, total, pct }
function checkChallengeProgress(challenge) {
  var today     = getToday();
  var xpLog     = DB.getXPLog ? DB.getXPLog() : [];
  var progress  = DB.getProgress();
  var DRILLS    = A.DRILLS || [];

  // Today's log entries only
  var todayLog  = xpLog.filter(function(e){ return e.date === today; });
  var todayXP   = todayLog.reduce(function(s,e){ return s+(e.xp||0); }, 0);

  // Source counters — count distinct activities (not raw xp entries)
  // A single drill run = one entry; we count entries per source type
  var drillEnts    = todayLog.filter(function(e){ return e.source && e.source.startsWith('drill'); });
  var mentalEnts   = todayLog.filter(function(e){ return e.source === 'mental'; });
  var fitnessEnts  = todayLog.filter(function(e){ return e.source === 'workout' || e.source === 'fitness'; });
  var dailyNetDone = !!(DB.get && DB.get('dn_' + today) && DB.get('dn_' + today).score !== undefined);

  // Category drill detection: source is 'drill:drillId' or 'drill'
  function countCategoryDrills(category) {
    return drillEnts.filter(function(e) {
      if (!e.source) return false;
      var drillId = e.source.replace('drill:', '').replace('drill', '');
      if (!drillId) {
        // Source is just 'drill' — can't determine category from source alone
        // Fall back to checking completed_drills timestamps if available
        return false;
      }
      var drill = DRILLS.find(function(d){ return d.id === drillId; });
      return drill && drill.category === category;
    }).length;
  }

  // For challenges that just need 'any drill', use drillEnts.length
  // For category-specific, use countCategoryDrills
  // For simple 'drill' source (no id), count as generic drill
  var anyDrillCount = drillEnts.length;

  // Count distinct activity types present today
  var typesPresent = 0;
  if (anyDrillCount > 0) typesPresent++;
  if (mentalEnts.length > 0) typesPresent++;
  if (fitnessEnts.length > 0) typesPresent++;
  if (dailyNetDone) typesPresent++;

  // ── Type-specific logic ──────────────────────────────────────
  switch (challenge.type) {

    case 'any_drill':
      return { done: anyDrillCount >= 1, progress: Math.min(anyDrillCount,1), total: 1,
               pct: anyDrillCount >= 1 ? 100 : 0 };

    case 'batting_drill': {
      var bCount = countCategoryDrills('batting') || (anyDrillCount >= 1 ? 1 : 0);
      // If we can't determine category (source='drill'), treat any drill as qualifying
      var batting = countCategoryDrills('batting');
      var effective = batting > 0 ? batting : (anyDrillCount >= 1 ? 1 : 0);
      return { done: effective >= 1, progress: Math.min(effective,1), total: 1,
               pct: effective >= 1 ? 100 : 0, note: batting === 0 && anyDrillCount > 0 ? 'any' : '' };
    }

    case 'bowling_drill': {
      var bowling = countCategoryDrills('bowling');
      var eff = bowling > 0 ? bowling : (anyDrillCount >= 1 ? 1 : 0);
      return { done: eff >= 1, progress: Math.min(eff,1), total: 1,
               pct: eff >= 1 ? 100 : 0 };
    }

    case 'fielding_drill': {
      var fielding = countCategoryDrills('fielding');
      var eff2 = fielding > 0 ? fielding : (anyDrillCount >= 1 ? 1 : 0);
      return { done: eff2 >= 1, progress: Math.min(eff2,1), total: 1,
               pct: eff2 >= 1 ? 100 : 0 };
    }

    case 'mental_x1':
      return { done: mentalEnts.length >= 1, progress: Math.min(mentalEnts.length,1), total: 1,
               pct: mentalEnts.length >= 1 ? 100 : 0 };

    case 'mental_x2': {
      var needed = challenge.target || 2;
      var got = mentalEnts.length;
      return { done: got >= needed, progress: Math.min(got, needed), total: needed,
               pct: Math.min(Math.round((got/needed)*100), 100) };
    }

    case 'fitness':
      return { done: fitnessEnts.length >= 1, progress: Math.min(fitnessEnts.length,1), total: 1,
               pct: fitnessEnts.length >= 1 ? 100 : 0 };

    case 'daily_net':
      return { done: dailyNetDone, progress: dailyNetDone ? 1 : 0, total: 1,
               pct: dailyNetDone ? 100 : 0 };

    case 'xp_target': {
      var needed2 = challenge.target || 100;
      return { done: todayXP >= needed2, progress: Math.min(todayXP, needed2), total: needed2,
               pct: Math.min(Math.round((todayXP/needed2)*100), 100) };
    }

    case 'drill_mental': {
      var hasDrill  = anyDrillCount >= 1;
      var hasMental = mentalEnts.length >= 1;
      var got2 = (hasDrill?1:0) + (hasMental?1:0);
      return { done: hasDrill && hasMental, progress: got2, total: 2,
               pct: Math.round((got2/2)*100),
               subStatus: hasDrill && !hasMental ? '🏏 drill done — need mental'
                 : !hasDrill && hasMental ? '🧠 mental done — need a drill'
                 : hasDrill && hasMental ? '✓' : '' };
    }

    case 'drill_fitness': {
      var hasDrill3  = anyDrillCount >= 1;
      var hasFit    = fitnessEnts.length >= 1;
      var got3 = (hasDrill3?1:0) + (hasFit?1:0);
      return { done: hasDrill3 && hasFit, progress: got3, total: 2,
               pct: Math.round((got3/2)*100) };
    }

    case 'triple_combo': {
      var hasDrill4  = anyDrillCount >= 1;
      var hasMental2 = mentalEnts.length >= 1;
      var hasFit2   = fitnessEnts.length >= 1;
      var got4 = (hasDrill4?1:0) + (hasMental2?1:0) + (hasFit2?1:0);
      return { done: hasDrill4 && hasMental2 && hasFit2, progress: got4, total: 3,
               pct: Math.round((got4/3)*100),
               subStatus: [
                 hasDrill4 ? null : '🏏 drill',
                 hasMental2 ? null : '🧠 mental',
                 hasFit2 ? null : '💪 fitness',
               ].filter(Boolean).join(' + ') + (got4 < 3 ? ' still needed' : '') };
    }

    case 'drills_x2': {
      var needed3 = challenge.target || 2;
      var got5 = anyDrillCount;
      return { done: got5 >= needed3, progress: Math.min(got5, needed3), total: needed3,
               pct: Math.min(Math.round((got5/needed3)*100), 100) };
    }

    case 'any_3types':
      return { done: typesPresent >= 3, progress: Math.min(typesPresent,3), total: 3,
               pct: Math.min(Math.round((typesPresent/3)*100), 100) };

    case 'any_4acts': {
      // Count total activities (each entry = one activity, cap per type)
      var acts = Math.min(anyDrillCount,2) + Math.min(mentalEnts.length,2) +
                 Math.min(fitnessEnts.length,1) + (dailyNetDone?1:0);
      return { done: acts >= 4, progress: Math.min(acts,4), total: 4,
               pct: Math.min(Math.round((acts/4)*100), 100) };
    }

    case 'net_and_drill': {
      var hasDN = dailyNetDone;
      var hasDr = anyDrillCount >= 1;
      var got6  = (hasDN?1:0) + (hasDr?1:0);
      return { done: hasDN && hasDr, progress: got6, total: 2,
               pct: Math.round((got6/2)*100),
               subStatus: hasDN && !hasDr ? '🎯 quiz done — need a drill'
                 : !hasDN && hasDr ? '🏏 drill done — complete the Daily Net quiz'
                 : '' };
    }

    case 'bat_and_bowl': {
      var bat2  = countCategoryDrills('batting');
      var bowl2 = countCategoryDrills('bowling');
      // Fallback: if categories undetectable, accept any 2 drills
      var eff3  = bat2 > 0 && bowl2 > 0 ? 2
               : bat2 > 0 || bowl2 > 0  ? 1
               : anyDrillCount >= 2      ? 2
               : anyDrillCount >= 1      ? 1 : 0;
      return { done: eff3 >= 2, progress: Math.min(eff3,2), total: 2,
               pct: Math.min(Math.round((eff3/2)*100), 100) };
    }

    case 'mental_and_xp': {
      var needXP   = challenge.target || 100;
      var hasMen   = mentalEnts.length >= 1;
      var xpMet    = todayXP >= needXP;
      var got7     = (hasMen?1:0) + (xpMet?1:0);
      return { done: hasMen && xpMet, progress: got7, total: 2,
               pct: Math.round((got7/2)*100) };
    }

    case 'mental_x2_drill': {
      var neededM = challenge.target || 2;
      var mentalOk = mentalEnts.length >= neededM;
      var drillOk  = anyDrillCount >= 1;
      var mentalProg = Math.min(mentalEnts.length, neededM);
      var total    = neededM + 1;
      var got8     = mentalProg + (drillOk?1:0);
      return { done: mentalOk && drillOk, progress: got8, total: total,
               pct: Math.min(Math.round((got8/total)*100), 100),
               subStatus: !mentalOk ? mentalEnts.length+'/'+neededM+' mental sessions done'
                 : !drillOk ? 'mental ✓ — add a drill to finish' : '' };
    }

    default:
      return { done: false, progress: 0, total: 1, pct: 0 };
  }
}

// ── Challenge streak system ───────────────────────────────────────
function getChallengeStreak() {
  return Object.assign(
    { streak: 0, best: 0, lastCompleted: null },
    DB.get(KEY_STREAK) || {}
  );
}

function updateChallengeStreak(today) {
  var cs       = getChallengeStreak();
  var yesterday = (function(){
    var d = new Date(); d.setDate(d.getDate()-1);
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  })();

  if (cs.lastCompleted === today) return cs; // already updated today

  var newStreak;
  if (cs.lastCompleted === yesterday) {
    newStreak = (cs.streak || 0) + 1;
  } else {
    newStreak = 1; // gap in challenge completions — reset
  }

  var newBest = Math.max(newStreak, cs.best || 0);
  var updated = { streak: newStreak, best: newBest, lastCompleted: today };
  DB.set(KEY_STREAK, updated);
  return updated;
}

// ── claimDailyChallenge ───────────────────────────────────────────
// Awards bonus XP once per day. Returns { already, xpAwarded, newStreak }
function claimDailyChallenge(challenge) {
  var today = getToday();
  var key   = KEY_CLAIMED + today;
  if (DB.get(key)) return { already: true, xpAwarded: 0, newStreak: 0 };

  // Adaptive XP bonus: small scale by user level
  var progress = DB.getProgress();
  var totalXP  = progress.total_xp || 0;
  var multiplier = totalXP > 10000 ? 1.15 : totalXP > 2500 ? 1.08 : 1.0;
  var xpAwarded  = Math.round(challenge.xpBonus * multiplier);

  // Award the bonus
  if (A.awardXP) {
    A.awardXP(xpAwarded, 0, 'daily_challenge', null, null);
  }

  // Mark claimed
  DB.set(key, { xp: xpAwarded, challengeId: challenge.id, ts: Date.now() });

  // Update challenge streak
  var updatedStreak = updateChallengeStreak(today);

  // Fire events
  window.dispatchEvent(new CustomEvent('sc_update'));
  window.dispatchEvent(new CustomEvent('sc_challenge_completed', {
    detail: { challenge: challenge, xpAwarded: xpAwarded, streak: updatedStreak }
  }));

  // Milestone confetti
  if (updatedStreak.streak === 7 || updatedStreak.streak === 30) {
    if (A.fireConfetti) setTimeout(function(){ A.fireConfetti(); }, 400);
  }

  return { already: false, xpAwarded: xpAwarded, newStreak: updatedStreak.streak };
}

// ── initDailyChallenge ────────────────────────────────────────────
// Safe wrapper — call from AppShell after onboarding check
function initDailyChallenge() {
  try {
    var user = DB.getUser();
    if (!user.onboardDone) return;
    var today     = getToday();
    var challenge = getTodayChallenge();
    var prog      = checkChallengeProgress(challenge);
    var claimed   = !!(DB.get(KEY_CLAIMED + today));

    // Auto-claim if already done but not yet claimed (e.g. app reloaded)
    if (prog.done && !claimed) {
      claimDailyChallenge(challenge);
    }
  } catch(e) { console.warn('[SC] Daily challenge init:', e); }
}

// ================================================================
// REACT COMPONENT — DailyChallengeCard
// ================================================================
function DailyChallengeCard() {
  var [challenge,   setChallenge]  = useState(null);
  var [progState,   setProgState]  = useState({ done:false, progress:0, total:1, pct:0 });
  var [claimed,     setClaimed]    = useState(false);
  var [xpAwarded,   setXpAwarded]  = useState(0);
  var [cStreak,     setCStreak]    = useState({ streak:0, best:0 });
  var [justClaimed, setJustClaimed]= useState(false);
  var [expanded,    setExpanded]   = useState(false);
  var claimingRef = useRef(false);

  function refresh() {
    try {
      var today = getToday();
      var ch    = getTodayChallenge();
      var prog  = checkChallengeProgress(ch);
      var isClaimed = !!(DB.get(KEY_CLAIMED + today));
      var claimedData = DB.get(KEY_CLAIMED + today) || {};
      var cs    = getChallengeStreak();
      setChallenge(ch);
      setProgState(prog);
      setClaimed(isClaimed);
      setXpAwarded(claimedData.xp || 0);
      setCStreak(cs);

      // Auto-claim when conditions become met
      if (prog.done && !isClaimed && !claimingRef.current) {
        claimingRef.current = true;
        setTimeout(function() {
          var result = claimDailyChallenge(ch);
          if (!result.already) {
            setXpAwarded(result.xpAwarded);
            setJustClaimed(true);
            setClaimed(true);
            var cs2 = getChallengeStreak();
            setCStreak(cs2);
            setTimeout(function(){ setJustClaimed(false); }, 3000);
          }
          claimingRef.current = false;
        }, 600); // short delay for animation feel
      }
    } catch(e) { console.warn('[SC] DailyChallengeCard refresh:', e); }
  }

  useEffect(function() {
    refresh();
    window.addEventListener('sc_update', refresh);
    return function() { window.removeEventListener('sc_update', refresh); };
  }, []);

  if (!challenge) return null;

  var today     = getToday();
  var isClaimed = claimed;
  var prog      = progState;

  // ── Color system based on challenge type ───────────────────────
  var typeColor = {
    'any_drill':'#3b82f6','batting_drill':'#3b82f6','bowling_drill':'#ef4444',
    'fielding_drill':'#10b981','mental_x1':'#8b5cf6','mental_x2':'#8b5cf6',
    'fitness':'#f97316','daily_net':'#6366f1','xp_target':'#f59e0b',
    'drill_mental':'#14b8a6','triple_combo':'#f59e0b','drills_x2':'#3b82f6',
    'any_3types':'#f59e0b','net_and_drill':'#6366f1','bat_and_bowl':'#14b8a6',
    'mental_and_xp':'#8b5cf6','any_4acts':'#ef4444','mental_x2_drill':'#8b5cf6',
    'drill_fitness':'#f97316',
  };
  var color = typeColor[challenge.type] || challenge.color || '#16a34a';

  // ── Progress bar label ─────────────────────────────────────────
  function progressLabel() {
    if (isClaimed) return null;
    if (prog.subStatus) return prog.subStatus;
    if (prog.total > 1) {
      if (challenge.type === 'xp_target') {
        return prog.progress.toLocaleString() + ' / ' + prog.total.toLocaleString() + ' XP';
      }
      return prog.progress + ' / ' + prog.total + ' done';
    }
    if (prog.pct > 0 && prog.pct < 100) return prog.pct + '% complete';
    return null;
  }

  // ── Collapsed state ────────────────────────────────────────────
  if (!expanded) {
    return h('div', {
      role: 'button', tabIndex: 0,
      'aria-label': isClaimed ? 'Daily challenge complete' : 'Daily challenge — ' + challenge.label,
      onClick: function(){ setExpanded(true); },
      onKeyDown: function(e){ if(e.key==='Enter'||e.key===' ')setExpanded(true); },
      style: { margin:'0 16px 12px', cursor:'pointer', outline:'none' },
    },
      h('div', { style: {
        padding: '12px 14px', borderRadius: 12,
        background: isClaimed ? 'rgba(22,163,74,0.06)' : prog.pct > 0 ? color+'10' : 'rgba(22,27,34,0.9)',
        border: '1px solid ' + (isClaimed ? 'rgba(22,163,74,0.30)' : prog.pct > 0 ? color+'40' : 'rgba(48,54,61,0.9)'),
        display: 'flex', alignItems: 'center', gap: 10,
        transition: 'border-color 0.25s, background 0.25s',
      }},
        // Icon circle
        h('div', { style: {
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: isClaimed ? 'rgba(22,163,74,0.18)' : color+'18',
          border: '1px solid ' + (isClaimed ? 'rgba(22,163,74,0.35)' : color+'35'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18,
        }}, isClaimed ? '✅' : challenge.icon),

        // Text block
        h('div', { style: { flex: 1, minWidth: 0 }},
          h('div', { style: { display:'flex', alignItems:'center', gap:6, marginBottom: 2 }},
            h('div', { style: {
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              color: '#484f58',
            }}, 'DAILY CHALLENGE'),
            cStreak.streak >= 2 && h('div', { style: {
              fontSize: 9, fontWeight: 700, color: '#f59e0b',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              padding: '1px 6px', borderRadius: 99,
            }}, '🔥 ' + cStreak.streak + 'd streak')
          ),
          h('div', { style: {
            fontSize: 13, fontWeight: 700,
            color: isClaimed ? '#6b7280' : '#f0fdf4',
            textDecoration: isClaimed ? 'none' : 'none',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}, challenge.label),
          // Mini progress bar
          prog.pct > 0 && !isClaimed && h('div', { style: { marginTop: 5 }},
            h('div', { style: { height: 3, borderRadius: 99, background: 'rgba(48,54,61,0.6)', overflow: 'hidden' }},
              h('div', { style: {
                height: '100%', width: prog.pct + '%', background: color,
                borderRadius: 99, transition: 'width 0.5s ease',
              }})
            )
          )
        ),

        // Right badge
        isClaimed
          ? h('div', { style: { fontSize: 11, fontWeight: 700, color: '#4ade80', flexShrink: 0 }},
              '+' + xpAwarded + ' XP ✓')
          : h('div', { style: {
              fontSize: 11, fontWeight: 700, color: color,
              background: color + '15', border: '1px solid ' + color + '30',
              padding: '3px 8px', borderRadius: 8, flexShrink: 0,
            }}, '+' + challenge.xpBonus + ' XP')
      )
    );
  }

  // ── EXPANDED state ─────────────────────────────────────────────
  var pLabel = progressLabel();

  return h('div', { style: { margin: '0 16px 12px' }},
    h('style', null,
      '@keyframes dcSlideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}' +
      '@keyframes dcClaim{0%{transform:scale(1)}50%{transform:scale(1.05)}100%{transform:scale(1)}}' +
      '@keyframes dcPulse{0%,100%{opacity:1}50%{opacity:0.7}}'
    ),
    h('div', {
      style: {
        borderRadius: 14, overflow: 'hidden',
        border: '1px solid ' + (isClaimed ? 'rgba(22,163,74,0.35)' : color + '35'),
        background: isClaimed ? 'rgba(22,163,74,0.05)' : 'rgba(13,17,23,0.97)',
        animation: 'dcSlideIn 0.22s ease',
      }
    },
      // Color accent bar
      h('div', { style: {
        height: 3,
        background: isClaimed ? '#16a34a' : 'linear-gradient(to right,' + color + ',' + color + '88)',
      }}),

      h('div', { style: { padding: '14px 14px 16px' }},

        // ── Header row ──────────────────────────────────────────
        h('div', { style: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom: 12 }},
          h('div', { style: { display:'flex', alignItems:'center', gap: 9 }},
            h('div', { style: {
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: isClaimed ? 'rgba(22,163,74,0.18)' : color + '18',
              border: '1px solid ' + (isClaimed ? 'rgba(22,163,74,0.35)' : color + '35'),
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
              animation: justClaimed ? 'dcClaim 0.4s ease' : 'none',
            }}, isClaimed ? '✅' : challenge.icon),
            h('div', null,
              h('div', { style: {
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#484f58', marginBottom: 2,
              }}, 'DAILY CHALLENGE'),
              h('div', { style: { fontSize: 15, fontWeight: 800, color: isClaimed ? '#4ade80' : '#f0fdf4', lineHeight: 1.2 }},
                challenge.label)
            )
          ),
          h('button', {
            onClick: function(e){ e.stopPropagation(); setExpanded(false); },
            style: { background:'none', border:'none', color:'#484f58', fontSize:18, cursor:'pointer', padding:'0 4px', lineHeight:1 }
          }, '×')
        ),

        // ── Description ──────────────────────────────────────────
        h('p', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.65, margin: '0 0 14px' }},
          challenge.desc),

        // ── Progress bar (multi-step or XP target) ───────────────
        (prog.total > 1 || challenge.type === 'xp_target') && !isClaimed && h('div', { style: { marginBottom: 12 }},
          h('div', { style: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5
          }},
            h('div', { style: { fontSize: 11, color: '#6b7280' }},
              pLabel || (prog.pct + '% complete')),
            h('div', { style: { fontSize: 11, fontWeight: 700, color: color }},
              prog.pct + '%')
          ),
          h('div', { style: { height: 6, borderRadius: 99, background: 'rgba(25,32,40,0.9)', overflow: 'hidden' }},
            h('div', { style: {
              height: '100%', width: prog.pct + '%', background: color,
              borderRadius: 99, transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)',
            }})
          )
        ),

        // ── Sub-status hint (for combos) ─────────────────────────
        !isClaimed && prog.subStatus && !(prog.total > 1) && h('div', { style: {
          padding: '7px 10px', borderRadius: 7, marginBottom: 12,
          background: color + '08', border: '1px solid ' + color + '20',
          fontSize: 11, color: color,
        }}, prog.subStatus),

        // ── Just claimed celebration ─────────────────────────────
        justClaimed && h('div', { style: {
          padding: '10px 12px', borderRadius: 10, marginBottom: 12,
          background: 'rgba(22,163,74,0.12)', border: '1px solid rgba(22,163,74,0.35)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'dcClaim 0.5s ease',
        }},
          h('div', { style: { fontSize: 20 }}, '🎉'),
          h('div', null,
            h('div', { style: { fontSize: 13, fontWeight: 700, color: '#4ade80' }},
              'Challenge complete! +' + xpAwarded + ' XP'),
            cStreak.streak >= 2 && h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2 }},
              cStreak.streak + '-day challenge streak!')
          )
        ),

        // ── Already complete (persistent state) ──────────────────
        isClaimed && !justClaimed && h('div', { style: {
          padding: '10px 12px', borderRadius: 10, marginBottom: 14,
          background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.22)',
          display: 'flex', alignItems: 'center', gap: 8,
        }},
          h('div', { style: { fontSize: 18 }}, '✅'),
          h('div', null,
            h('div', { style: { fontSize: 13, fontWeight: 700, color: '#4ade80' }},
              'Challenge complete — +' + xpAwarded + ' XP earned'),
            cStreak.streak >= 2 && h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2 }},
              '🔥 ' + cStreak.streak + '-day challenge streak!')
          )
        ),

        // ── Challenge streak mini display ─────────────────────────
        !isClaimed && cStreak.streak >= 1 && h('div', { style: {
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12,
          padding: '6px 10px', borderRadius: 8,
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.20)',
        }},
          h('span', { style: { fontSize: 14 }}, '🔥'),
          h('div', null,
            h('div', { style: { fontSize: 11, fontWeight: 700, color: '#f59e0b' }},
              cStreak.streak + '-day challenge streak'),
            cStreak.best > cStreak.streak && h('div', { style: { fontSize: 10, color: '#484f58' }},
              'Best: ' + cStreak.best + ' days')
          ),
          // 7-dot progress to next milestone
          h('div', { style: { display:'flex', gap:2, alignItems:'center', marginLeft:'auto' }},
            [1,2,3,4,5,6,7].map(function(n){
              var filled = n <= cStreak.streak;
              return h('div', { key:n, style: {
                width:6, height:6, borderRadius:'50%', flexShrink:0,
                background: filled ? '#f59e0b' : 'rgba(245,158,11,0.18)',
                border: '1px solid rgba(245,158,11,0.3)',
              }});
            }),
            h('span', { style: { fontSize:9, color:'#484f58', marginLeft:4 }}, '→7d')
          )
        ),

        // ── Bonus XP indicator ────────────────────────────────────
        !isClaimed && h('div', { style: {
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }},
          h('div', { style: { fontSize: 11, color: '#6b7280' }}, 'Bonus on completion'),
          h('div', { style: {
            fontSize: 13, fontWeight: 800, color: color,
            background: color + '15', border: '1px solid ' + color + '30',
            padding: '3px 10px', borderRadius: 8,
          }}, '+' + challenge.xpBonus + ' XP')
        ),

        // ── CTA button ────────────────────────────────────────────
        !isClaimed && h('button', {
          onClick: function() {
            setExpanded(false);
            if (A.nav) A.nav(challenge.nav || 'Drills');
          },
          style: {
            width: '100%', padding: '12px', border: 'none', borderRadius: 10,
            background: 'linear-gradient(135deg,' + color + ',' + color + 'cc)',
            color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: '0 3px 14px ' + color + '40',
          }
        },
          prog.pct > 0 ? 'Continue →' : 'Start now →'
        ),

        // ── Tomorrow preview teaser ───────────────────────────────
        h('div', { style: { textAlign:'center', marginTop: 10 }},
          h('div', { style: { fontSize: 10, color: '#374151' }},
            'New challenge unlocks at midnight')
        )
      )
    )
  );
}

// ── Exports ───────────────────────────────────────────────────────
A.DailyChallengeCard      = DailyChallengeCard;
A.getTodayChallenge       = getTodayChallenge;
A.checkChallengeProgress  = checkChallengeProgress;
A.claimDailyChallenge     = claimDailyChallenge;
A.getChallengeStreak      = getChallengeStreak;
A.initDailyChallenge      = initDailyChallenge;
A.CHALLENGE_BANK          = CHALLENGE_BANK;

console.log('[SC] app-daily-challenge v1.0 — ' + CHALLENGE_BANK.length + ' challenges, engine ready');
})();
