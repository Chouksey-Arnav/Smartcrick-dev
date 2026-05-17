#!/usr/bin/env python3
# ================================================================
# SmartCrick — deploy_patch.py v3.0
# Run from your LOCAL REPO ROOT folder:
#   python3 deploy_patch.py
#
# What this script does:
#   1. Patches app-home.js  — SURGICALLY (3 targeted changes)
#      a. Fixes [object Object] bug in level display (2 occurrences)
#      b. Adds DailyRewardMiniWidget to home page feed
#   2. Patches app-root.js  — SURGICALLY (4 targeted changes)
#      a. Adds daily reward useState declarations
#      b. Adds daily reward useEffect (fires 800ms after mount)
#      c. Fixes overflow:'hidden' → overflowX:'hidden' (desktop scroll fix)
#      d. Adds width:'100%' to outer flex container (desktop width fix)
#      e. Adds DailyRewardModal render at end of AppShell
#   3. Creates app-daily-reward.js (new file — the reward system)
#   4. Appends desktop layout CSS to styles.css
#   5. Patches index.html — adds app-daily-reward.js script tag
#
# SAFE TO RUN MULTIPLE TIMES — all patches are idempotent.
# ================================================================
import os, sys, shutil, datetime

# ── Colours for terminal output ───────────────────────────────────
OK  = '\033[92m[OK]\033[0m'
ERR = '\033[91m[ERR]\033[0m'
SKP = '\033[93m[SKIP]\033[0m'
INF = '\033[96m[INFO]\033[0m'

changed = []
skipped = []
errors  = []

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def backup(path):
    ts  = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    bak = path + '.bak_' + ts
    shutil.copy2(path, bak)
    print(f'  {INF} Backup: {bak}')

def patch(filepath, description, old, new, max_replacements=1):
    """Idempotent string replacement. Skips if already applied."""
    if not os.path.exists(filepath):
        msg = f'File not found: {filepath}'
        print(f'  {ERR} {msg}')
        errors.append(msg)
        return False
    content = read(filepath)
    if new in content:
        print(f'  {SKP} Already applied: {description}')
        skipped.append(description)
        return False
    if old not in content:
        msg = f'Pattern not found in {filepath}: {description}'
        print(f'  {ERR} {msg}')
        errors.append(msg)
        return False
    write(filepath, content.replace(old, new, max_replacements))
    print(f'  {OK}  Applied: {description}')
    changed.append(description)
    return True

def append_to(filepath, description, content_to_append, sentinel):
    """Idempotent append. Skips if sentinel string is already present."""
    if not os.path.exists(filepath):
        msg = f'File not found: {filepath}'
        print(f'  {ERR} {msg}')
        errors.append(msg)
        return False
    existing = read(filepath)
    if sentinel in existing:
        print(f'  {SKP} Already applied: {description}')
        skipped.append(description)
        return False
    write(filepath, existing + '\n' + content_to_append)
    print(f'  {OK}  Applied: {description}')
    changed.append(description)
    return True

def create_file(filepath, description, content):
    """Create a new file. Overwrites if it exists."""
    write(filepath, content)
    print(f'  {OK}  Created: {filepath} ({description})')
    changed.append(f'Created {filepath}')
    return True

# ================================================================
print('\n' + '='*60)
print('  SmartCrick Deploy Patch v3.0')
print('='*60 + '\n')

# Verify we're in the repo root
for required in ['app-home.js', 'app-root.js', 'app-core.js', 'index.html', 'styles.css']:
    if not os.path.exists(required):
        print(f'{ERR} Missing: {required}')
        print(f'{ERR} Run this script from your REPO ROOT folder.')
        print(f'{ERR} Example: cd ~/smartcricai && python3 deploy_patch.py')
        sys.exit(1)
print(f'{OK}  Repo root confirmed — all required files present.\n')

# ── Backup critical files ─────────────────────────────────────────
print('── Step 0: Backing up files ─────────────────────────────')
for f in ['app-home.js', 'app-root.js']:
    backup(f)
print()

# ================================================================
# STEP 1: app-home.js — SURGICAL patches only
# ================================================================
print('── Step 1: Patching app-home.js ─────────────────────────')

# 1a. Fix [object Object] bug — level progress text
patch(
    'app-home.js',
    '[object Object] fix #1 — XP progress text',
    "(levelInfo.xpToNext||0).toLocaleString()+' XP to '+(levelInfo.next||'max level')",
    "(levelInfo.xpToNext||0).toLocaleString()+' XP to '+(levelInfo.next ? levelInfo.next.name : 'max level')"
)

# 1b. Fix [object Object] bug — Next Level roadmap
patch(
    'app-home.js',
    '[object Object] fix #2 — Next Level roadmap',
    "'🎮 Next Level: '+(levelInfo.next||'Legend')",
    "'🎮 Next Level: '+(levelInfo.next ? levelInfo.next.name : 'Legend')"
)

# 1c. Insert DailyRewardMiniWidget between AIRecommendCard and SpinWheelWidget
# The exact comment line acts as our anchor
patch(
    'app-home.js',
    'Add DailyRewardMiniWidget to home page feed',
    "    // ── Daily Spin ────────────────────────────────────────────────\n    h(SpinWheelWidget, {}),",
    "    // ── Daily Login Reward ─────────────────────────────────────────\n"
    "    A.DailyRewardMiniWidget ? h(A.DailyRewardMiniWidget, { onOpen: function(){} }) : null,\n\n"
    "    // ── Daily Spin ────────────────────────────────────────────────\n"
    "    h(SpinWheelWidget, {}),"
)

print()

# ================================================================
# STEP 2: app-root.js — SURGICAL patches
# ================================================================
print('── Step 2: Patching app-root.js ─────────────────────────')

# 2a. Add daily reward useState declarations after menuOpen
patch(
    'app-root.js',
    'Add daily reward useState declarations',
    "  var [menuOpen, setMenuOpen] = useState(false);",
    "  var [menuOpen, setMenuOpen] = useState(false);\n\n"
    "  // Daily reward state\n"
    "  var [dailyReward, setDailyReward] = useState(null);\n"
    "  var [showReward, setShowReward]   = useState(false);"
)

# 2b. Add daily reward useEffect — fires 800ms after mount, checks once
patch(
    'app-root.js',
    'Add daily reward useEffect',
    "  // Body background\n  useEffect(function() {\n    document.body.style.background = '#0d1117';\n    document.body.style.margin     = '0';\n    document.body.style.padding    = '0';\n  }, []);",
    "  // Body background\n  useEffect(function() {\n    document.body.style.background = '#0d1117';\n    document.body.style.margin     = '0';\n    document.body.style.padding    = '0';\n  }, []);\n\n"
    "  // Daily reward — fires once after mount, 800ms delay so page renders first\n"
    "  useEffect(function() {\n"
    "    if (!A.DB.getUser().onboardDone) return;\n"
    "    if (!A.initDailyReward) return;\n"
    "    var t = setTimeout(function() {\n"
    "      try {\n"
    "        var result = A.initDailyReward();\n"
    "        if (result && !result.alreadyClaimed && result.reward) {\n"
    "          setDailyReward(result);\n"
    "          setShowReward(true);\n"
    "        }\n"
    "      } catch(e) { console.warn('[SC] Daily reward init error:', e); }\n"
    "    }, 800);\n"
    "    return function() { clearTimeout(t); };\n"
    "  }, []);"
)

# 2c. Fix overflow:'hidden' → overflowX:'hidden' on main content column
#     (was clipping vertical scroll on desktop)
patch(
    'app-root.js',
    "Fix overflow:'hidden' → overflowX:'hidden' on main content column",
    "            overflow:'hidden',\n            position:'relative',",
    "            overflowX:'hidden',\n            position:'relative',"
)

# 2d. Add width:'100%' to outer flex container (desktop full-width fix)
patch(
    'app-root.js',
    "Add width:'100%' to outer flex container",
    "          display:'flex',\n          flexDirection:'row',\n          minHeight:'100dvh',\n          background:'#0d1117',",
    "          display:'flex',\n          flexDirection:'row',\n          width:'100%',\n          minWidth:'100%',\n          minHeight:'100dvh',\n          background:'#0d1117',"
)

# 2e. Add DailyRewardModal render inside ErrorBoundary, after Sidebar
#     We insert BEFORE the closing of the ErrorBoundary children
patch(
    'app-root.js',
    'Add DailyRewardModal render to AppShell',
    "        : null\n    )\n  );\n}\n\n// ── Mount",
    "        : null,\n\n"
    "      // ── Daily Reward Modal ──────────────────────────────────────\n"
    "      showReward && dailyReward && A.DailyRewardModal\n"
    "        ? h(A.DailyRewardModal, {\n"
    "            reward:  dailyReward.reward,\n"
    "            state:   dailyReward.state,\n"
    "            onClose: function() { setShowReward(false); },\n"
    "          })\n"
    "        : null\n"
    "    )\n  );\n}\n\n// ── Mount"
)

print()

# ================================================================
# STEP 3: Create app-daily-reward.js (NEW FILE)
# ================================================================
print('── Step 3: Creating app-daily-reward.js ─────────────────')

DAILY_REWARD_JS = r"""// app-daily-reward.js v1.0
// ================================================================
// SmartCrick — Daily Login Reward System
// Weekly streak: Day1=5, Day2=15, Day3=20, Day4=30,
//               Day5=50, Day6=75, Day7=100 XP (total 295/week)
// Resets to Day 1 if a day is missed.
// Exports: A.DailyRewardModal, A.DailyRewardMiniWidget,
//          A.checkDailyReward, A.initDailyReward,
//          A.getRewardState, A.WEEKLY_REWARDS
// ================================================================
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var A         = window.SC_APP;
var DB        = A.DB;

// ── Reward schedule ───────────────────────────────────────────────
var WEEKLY_REWARDS = [
  { day:1, xp:5,   emoji:'🌱', label:'Day 1', color:'#16a34a', bg:'rgba(22,163,74,0.12)',   border:'rgba(22,163,74,0.35)',   message:'Great to see you! Keep this streak alive.' },
  { day:2, xp:15,  emoji:'⚡', label:'Day 2', color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.35)',  message:'Back again! Your consistency is building fast.' },
  { day:3, xp:20,  emoji:'🔥', label:'Day 3', color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.35)',  message:'3 days straight! The habit is forming.' },
  { day:4, xp:30,  emoji:'💪', label:'Day 4', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.35)',  message:"Halfway to the weekly bonus! Don't stop now." },
  { day:5, xp:50,  emoji:'⭐', label:'Day 5', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.35)',  message:'5 days strong! Almost at the jackpot.' },
  { day:6, xp:75,  emoji:'🏏', label:'Day 6', color:'#14b8a6', bg:'rgba(20,184,166,0.12)',  border:'rgba(20,184,166,0.35)',  message:'One more day for the full 100 XP reward!' },
  { day:7, xp:100, emoji:'🏆', label:'Day 7', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.4)',   message:'PERFECT WEEK! You showed up every single day.', isWeekComplete:true },
];

// ── Local-time date helpers ───────────────────────────────────────
// Uses local calendar day (not UTC), so midnight resets feel natural
function getToday() {
  var d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}
function getYesterday() {
  var d = new Date(); d.setDate(d.getDate() - 1);
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}

// ── DB helpers ────────────────────────────────────────────────────
var REWARD_KEY = 'sc_daily_login_reward';
function getRewardState() {
  return Object.assign(
    { lastClaimed:null, weekDay:0, totalClaimed:0, longestWeek:0 },
    DB.get(REWARD_KEY) || {}
  );
}
function saveRewardState(s) { DB.set(REWARD_KEY, s); }

// ── Core claim logic ──────────────────────────────────────────────
function checkDailyReward() {
  var today     = getToday();
  var yesterday = getYesterday();
  var state     = getRewardState();

  // Already claimed today — guard against double-awarding
  if (state.lastClaimed === today) {
    return { alreadyClaimed:true, state:state, reward:null };
  }

  // Calculate week position
  var newWeekDay;
  if (!state.lastClaimed || state.lastClaimed < yesterday) {
    // First time, or missed 1+ days → reset streak to Day 1
    newWeekDay = 1;
  } else {
    // Consecutive day → advance in 7-day cycle (wraps Day7 → Day1)
    newWeekDay = (state.weekDay % 7) + 1;
  }

  var reward = WEEKLY_REWARDS[newWeekDay - 1];

  var newState = {
    lastClaimed:  today,
    weekDay:      newWeekDay,
    totalClaimed: (state.totalClaimed || 0) + 1,
    longestWeek:  newWeekDay === 7
      ? Math.max((state.longestWeek || 0), 7)
      : (state.longestWeek || 0),
  };
  saveRewardState(newState);

  // Award XP
  if (A.awardXP) { A.awardXP(reward.xp, 0, 'daily_login', null, null); }
  // Confetti on perfect week
  if (reward.isWeekComplete && A.fireConfetti) {
    setTimeout(function () { A.fireConfetti(); }, 700);
  }
  window.dispatchEvent(new CustomEvent('sc_update'));
  window.dispatchEvent(new CustomEvent('sc_daily_reward_claimed',
    { detail:{ reward:reward, state:newState } }));

  return { alreadyClaimed:false, state:newState, reward:reward };
}

function initDailyReward() {
  try { return checkDailyReward(); }
  catch (e) { console.warn('[SC] Daily reward error:', e); return null; }
}

A.checkDailyReward = checkDailyReward;
A.initDailyReward  = initDailyReward;
A.getRewardState   = getRewardState;
A.WEEKLY_REWARDS   = WEEKLY_REWARDS;

// ── DayCircle component ───────────────────────────────────────────
function DayCircle(props) {
  var day    = props.day;
  var status = props.status; // 'done' | 'current' | 'locked'
  var r      = WEEKLY_REWARDS[day - 1];
  var bg     = status === 'done'    ? r.color
             : status === 'current' ? r.bg
             : 'rgba(22,27,34,0.9)';
  var border = status === 'done'    ? r.color
             : status === 'current' ? r.border
             : 'rgba(48,54,61,0.5)';
  var clr    = status === 'done'    ? '#fff'
             : status === 'current' ? r.color
             : '#374151';
  return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:3 } },
    h('div', { style:{
      width:34, height:34, borderRadius:'50%',
      background:bg, border:'2px solid '+border,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize: status === 'locked' ? 10 : 16,
      color:clr, flexShrink:0,
      boxShadow: (status==='done'||status==='current') ? '0 0 8px '+r.color+'50' : 'none',
      transition:'all 0.2s',
    } },
      status === 'locked' ? '🔒' : status === 'done' ? '✓' : r.emoji
    ),
    h('div', { style:{ fontSize:8, fontWeight:700, color:clr, lineHeight:1, whiteSpace:'nowrap' } },
      '+'+r.xp+' XP')
  );
}

// ── DailyRewardModal ─────────────────────────────────────────────
function DailyRewardModal(props) {
  var reward  = props.reward;
  var state   = props.state;
  var onClose = props.onClose;
  var [animIn, setAnimIn] = useState(false);
  var [cnt, setCnt]       = useState(0);

  useEffect(function () {
    var t1 = setTimeout(function () { setAnimIn(true); }, 40);
    // Animated XP counter
    var cur = 0, target = reward.xp, step = Math.max(1, Math.ceil(target / 25));
    var t2 = setInterval(function () {
      cur = Math.min(cur + step, target);
      setCnt(cur);
      if (cur >= target) clearInterval(t2);
    }, 35);
    return function () { clearTimeout(t1); clearInterval(t2); };
  }, []);

  var weekDay = state.weekDay;
  var isW7    = !!reward.isWeekComplete;

  return h('div', {
    style:{
      position:'fixed', inset:0, zIndex:9500,
      background:'rgba(0,0,0,0.88)',
      backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'16px',
      opacity: animIn ? 1 : 0, transition:'opacity 0.3s ease',
    },
    onClick:onClose,
  },
    h('style', null,
      '@keyframes drBounce{0%{transform:scale(0.2);opacity:0}55%{transform:scale(1.18)}'
      +'80%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}'
    ),
    h('div', {
      onClick:function(e){e.stopPropagation();},
      style:{
        width:'100%', maxWidth:380,
        background:'linear-gradient(160deg,#111827,#0d1117)',
        borderRadius:22, border:'1px solid '+reward.border,
        padding:'28px 20px 24px', textAlign:'center',
        boxShadow:'0 24px 70px rgba(0,0,0,0.7)',
        transform: animIn ? 'scale(1) translateY(0)' : 'scale(0.88) translateY(28px)',
        transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)',
      }
    },
      // Badge
      h('div', {
        style:{
          display:'inline-flex', alignItems:'center', gap:6,
          fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase',
          color:reward.color, background:reward.bg, border:'1px solid '+reward.border,
          padding:'4px 12px', borderRadius:99, marginBottom:18,
        }
      }, '\uD83C\uDF81  DAILY LOGIN REWARD'),

      // Emoji
      h('div', {
        style:{ fontSize:56, lineHeight:1, marginBottom:10,
          animation: animIn ? 'drBounce 0.65s cubic-bezier(0.16,1,0.3,1)' : 'none' }
      }, reward.emoji),

      // Day label
      h('div', { style:{ fontSize:13, fontWeight:700, color:reward.color, marginBottom:4 } },
        isW7 ? 'PERFECT WEEK COMPLETE!' : 'DAY '+weekDay+' OF 7'),

      // XP counter
      h('div', {
        style:{
          fontSize:50, fontWeight:900, color:'#f0fdf4',
          letterSpacing:'-0.04em', lineHeight:1, marginBottom:6,
          fontVariantNumeric:'tabular-nums',
        }
      }, '+'+cnt+' XP'),

      // Message
      h('p', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.65, marginBottom:22,
        maxWidth:290, margin:'0 auto 22px' } }, reward.message),

      // Weekly circles
      h('div', { style:{ marginBottom:20 } },
        h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58',
          textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 } }, 'This Week'),
        h('div', { style:{ display:'flex', justifyContent:'center', gap:5 } },
          WEEKLY_REWARDS.map(function (r2, i) {
            var d  = i + 1;
            var st = d < weekDay ? 'done' : d === weekDay ? 'current' : 'locked';
            return h(DayCircle, { key:d, day:d, status:st });
          })
        )
      ),

      // Stats row
      h('div', { style:{ display:'flex', gap:8, marginBottom:20 } },
        [
          { l:'Total Days',  v:state.totalClaimed             },
          { l:'Best Week',   v:(state.longestWeek||0)+'/7'    },
          { l:'This Week',   v:weekDay+'/7'                   },
        ].map(function (s) {
          return h('div', { key:s.l,
            style:{ flex:1, padding:'10px 6px',
              background:'rgba(22,27,34,0.8)',
              border:'1px solid rgba(48,54,61,0.8)',
              borderRadius:10, textAlign:'center' }
          },
            h('div', { style:{ fontSize:16, fontWeight:800, color:'#f0fdf4' } }, s.v),
            h('div', { style:{ fontSize:9, fontWeight:700, color:'#484f58',
              textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 } }, s.l)
          );
        })
      ),

      // CTA
      h('button', {
        onClick:onClose,
        style:{
          width:'100%', padding:'13px', border:'none', borderRadius:12,
          background: isW7
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
            : 'linear-gradient(135deg,'+reward.color+','+reward.color+'cc)',
          color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
          fontFamily:'inherit', boxShadow:'0 4px 18px '+reward.color+'45',
        },
      }, isW7 ? '\uD83C\uDFC6 Claim Your Champion Reward!' : '\uD83C\uDFCF Let\'s Train Today!'),

      weekDay < 7 && h('div', { style:{ fontSize:11, color:'#484f58', marginTop:10 } },
        'Come back tomorrow for +'+WEEKLY_REWARDS[weekDay].xp+' XP')
    )
  );
}
A.DailyRewardModal = DailyRewardModal;

// ── DailyRewardMiniWidget (for home page feed) ────────────────────
function DailyRewardMiniWidget(props) {
  var onOpen = props.onOpen;
  var state  = getRewardState();
  var today  = getToday();
  var claimed = (state.lastClaimed === today);
  var displayDay = claimed ? state.weekDay : ((state.weekDay % 7) + 1);
  if (displayDay < 1) displayDay = 1;
  var next = WEEKLY_REWARDS[Math.min(displayDay - 1, 6)];

  return h('div', {
    role:     claimed ? 'status' : 'button',
    tabIndex: claimed ? -1 : 0,
    'aria-label': claimed ? 'Daily reward claimed' : 'Claim daily reward',
    onClick:    claimed ? undefined : onOpen,
    onKeyDown:  function(e){ if(!claimed&&(e.key==='Enter'||e.key===' '))onOpen(); },
    style:{ margin:'0 16px 12px', cursor:claimed?'default':'pointer', outline:'none' },
  },
    h('div', {
      style:{
        padding:'12px 16px', borderRadius:12,
        background: claimed ? 'rgba(255,255,255,0.03)' : next.bg,
        border:'1px solid '+(claimed ? 'rgba(255,255,255,0.07)' : next.border),
        display:'flex', alignItems:'center', gap:12,
        transition:'border-color 0.2s, background 0.2s',
      }
    },
      h('div', { style:{ fontSize:22, flexShrink:0 } }, claimed ? '\u2705' : next.emoji),
      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:13, fontWeight:700, color:claimed?'#6b7280':'#f0fdf4' } },
          claimed ? 'Daily Reward Claimed \u2713' : 'Daily Login Reward'),
        h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:2 } },
          claimed
            ? 'Day '+(state.weekDay)+'/7 \u00b7 +'+(WEEKLY_REWARDS[(state.weekDay-1)||0].xp)+' XP earned today'
            : 'Day '+displayDay+'/7 \u00b7 Come back daily for escalating XP')
      ),
      // 7-dot progress
      h('div', { style:{ display:'flex', gap:3, alignItems:'center', flexShrink:0 } },
        WEEKLY_REWARDS.map(function (r2, i) {
          var d        = i + 1;
          var ref      = claimed ? state.weekDay : displayDay;
          var filled   = d < ref;
          var current  = d === ref;
          return h('div', { key:d,
            style:{
              width:7, height:7, borderRadius:'50%', flexShrink:0,
              background: filled  ? r2.color
                        : current ? r2.color+'99'
                        : 'rgba(75,85,99,0.4)',
              border: current ? '1px solid '+r2.color : 'none',
              transition:'background 0.2s',
            }
          });
        })
      ),
      !claimed && h('div', {
        style:{
          fontSize:12, fontWeight:700, color:next.color,
          background:next.bg, border:'1px solid '+next.border,
          padding:'4px 10px', borderRadius:20, flexShrink:0, whiteSpace:'nowrap',
        }
      }, '+'+next.xp+' XP')
    )
  );
}
A.DailyRewardMiniWidget = DailyRewardMiniWidget;

console.log('[SC] app-daily-reward v1.0 — weekly streak reward system ready');
})();
"""

create_file('app-daily-reward.js', 'Daily login reward system', DAILY_REWARD_JS)
print()

# ================================================================
# STEP 4: Append desktop full-width fix to styles.css
# ================================================================
print('── Step 4: Patching styles.css (desktop layout fix) ─────')

DESKTOP_CSS = """
/* ================================================================
   DESKTOP FULL-WIDTH FIX — appended by deploy_patch.py v3.0
   Fixes: app content appearing as narrow centered column on desktop
================================================================ */

/* Force root and body to full viewport width */
html {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
body {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden;
}
#root {
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  min-height: 100dvh;
}

/* Remove any inadvertent max-width from the desktop-content helper */
.desktop-content {
  max-width: none !important;
  width: 100%;
}

/* Desktop sidebar — must be a normal flex child (not fixed/absolute) */
@media (min-width: 768px) {
  .sc-desktop-sidebar {
    display: block !important;
    flex-shrink: 0 !important;
    width: 260px !important;
    min-width: 260px !important;
    max-width: 260px !important;
    position: sticky !important;
    top: 0 !important;
    height: 100dvh !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    /* Remove any position:fixed that would take it out of flex flow */
    left: auto !important;
  }

  /* Hide mobile-only chrome */
  .sc-mobile-only { display: none !important; }
  .sc-bottomnav   { display: none !important; }
  .sc-topbar      { display: none !important; }

  /* Remove bottom nav padding on desktop */
  .pb-28 { padding-bottom: 2rem !important; }
}

/* Mobile */
@media (max-width: 767px) {
  .sc-desktop-sidebar { display: none !important; }
  .sc-mobile-only     { display: block !important; }
  .sc-bottomnav       { display: flex !important; }
}
/* ── end desktop full-width fix ── */
"""

append_to(
    'styles.css',
    'Append desktop full-width fix to styles.css',
    DESKTOP_CSS,
    '/* ── end desktop full-width fix ── */'
)
print()

# ================================================================
# STEP 5: Patch index.html — add app-daily-reward.js script tag
# ================================================================
print('── Step 5: Patching index.html (script load order) ──────')

patch(
    'index.html',
    'Add app-daily-reward.js script tag before app-root.js',
    "  <script src=\"app-root.js\"></script>",
    "  <script src=\"app-daily-reward.js\"></script>\n"
    "  <script src=\"app-root.js\"></script>"
)

# Also strengthen the critical CSS for #root width in index.html inline style
patch(
    'index.html',
    'Strengthen #root CSS in index.html inline style',
    "    #root { min-height: 100dvh; background: #0d1117; }",
    "    html, body { width: 100%; margin: 0; padding: 0; overflow-x: hidden; }\n"
    "    #root { width: 100%; min-height: 100dvh; background: #0d1117; display: block; }"
)

print()

# ================================================================
# SUMMARY
# ================================================================
print('='*60)
print('  PATCH COMPLETE')
print('='*60)
print(f'\n  Changed   : {len(changed)} patches applied')
print(f'  Skipped   : {len(skipped)} (already applied)')
print(f'  Errors    : {len(errors)}')

if errors:
    print('\n  ERRORS (manual fix needed):')
    for e in errors: print('    ✗ ' + e)

print('\n  Next steps:')
print('    git add -A')
print('    git commit -m "fix: daily rewards + desktop fullwidth + object bug"')
print('    git push')
print()

if errors:
    print('  ⚠ FIX THE ERRORS ABOVE BEFORE DEPLOYING')
    sys.exit(1)
else:
    print('  ✅ All patches applied — safe to deploy')
