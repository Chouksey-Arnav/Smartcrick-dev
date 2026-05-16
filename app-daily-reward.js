// app-daily-reward.js v1.0
// ================================================================
// SmartCrick — Daily Login Reward System
// Weekly streak rewards: Day1=5, Day2=15, Day3=20, Day4=30,
//   Day5=50, Day6=75, Day7=100 XP
// Streak resets if user misses a day. Runs once per calendar day.
// Exports: A.DailyRewardModal, A.DailyRewardMiniWidget,
//          A.checkDailyReward, A.initDailyReward,
//          A.getRewardState, A.WEEKLY_REWARDS
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var A = window.SC_APP;
var DB = A.DB;

// ── Reward config ─────────────────────────────────────────────────
var WEEKLY_REWARDS = [
  { day:1, xp:5,   emoji:'🌱', label:'Day 1', color:'#16a34a', bg:'rgba(22,163,74,0.12)',   border:'rgba(22,163,74,0.35)',   message:'Great to see you! Keep this streak alive.' },
  { day:2, xp:15,  emoji:'⚡', label:'Day 2', color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.35)',  message:'Back again! Your consistency is building fast.' },
  { day:3, xp:20,  emoji:'🔥', label:'Day 3', color:'#f97316', bg:'rgba(249,115,22,0.12)',  border:'rgba(249,115,22,0.35)',  message:'3 days straight! The habit is forming.' },
  { day:4, xp:30,  emoji:'💪', label:'Day 4', color:'#8b5cf6', bg:'rgba(139,92,246,0.12)',  border:'rgba(139,92,246,0.35)',  message:"Halfway to the weekly bonus! Don't stop now." },
  { day:5, xp:50,  emoji:'⭐', label:'Day 5', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.35)',  message:'5 days strong! Almost at the jackpot.' },
  { day:6, xp:75,  emoji:'🏏', label:'Day 6', color:'#14b8a6', bg:'rgba(20,184,166,0.12)',  border:'rgba(20,184,166,0.35)',  message:'One more day for the full 100 XP reward!' },
  { day:7, xp:100, emoji:'🏆', label:'Day 7', color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.4)',   message:'PERFECT WEEK! You showed up every single day.', isWeekComplete:true },
];

// ── Date helpers (timezone-safe, always uses local wall-clock day) ─
function getToday() {
  var d = new Date();
  return d.getFullYear() + '-'
    + String(d.getMonth() + 1).padStart(2, '0') + '-'
    + String(d.getDate()).padStart(2, '0');
}
function getYesterday() {
  var d = new Date();
  d.setDate(d.getDate() - 1);
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

// ── Core claim logic ─────────────────────────────────────────────
// Returns { alreadyClaimed, state, reward }
function checkDailyReward() {
  var today     = getToday();
  var yesterday = getYesterday();
  var state     = getRewardState();

  // Guard: already claimed today
  if (state.lastClaimed === today) {
    return { alreadyClaimed:true, state:state, reward:null };
  }

  // Determine new weekDay in cycle
  var newWeekDay;
  if (!state.lastClaimed || state.lastClaimed < yesterday) {
    // First time ever, or streak broken (missed 1+ days)
    newWeekDay = 1;
  } else {
    // state.lastClaimed === yesterday → consecutive, advance
    newWeekDay = (state.weekDay % 7) + 1;
  }

  var reward = WEEKLY_REWARDS[newWeekDay - 1];

  var newState = {
    lastClaimed:   today,
    weekDay:       newWeekDay,
    totalClaimed:  (state.totalClaimed || 0) + 1,
    longestWeek:   newWeekDay === 7
      ? Math.max((state.longestWeek || 0), 7)
      : (state.longestWeek || 0),
  };
  saveRewardState(newState);

  // Award XP via awardXP (won't double-count because date guard above)
  if (A.awardXP) {
    A.awardXP(reward.xp, 0, 'daily_login', null, null);
  }

  // Confetti on perfect week
  if (reward.isWeekComplete && A.fireConfetti) {
    setTimeout(function () { A.fireConfetti(); }, 700);
  }

  window.dispatchEvent(new CustomEvent('sc_update'));
  window.dispatchEvent(new CustomEvent('sc_daily_reward_claimed', { detail:{ reward:reward, state:newState } }));

  return { alreadyClaimed:false, state:newState, reward:reward };
}

A.checkDailyReward = checkDailyReward;
A.getRewardState   = getRewardState;
A.WEEKLY_REWARDS   = WEEKLY_REWARDS;

// ── Safe entry point for AppShell ────────────────────────────────
function initDailyReward() {
  try { return checkDailyReward(); }
  catch (e) { console.warn('[SC] Daily reward error:', e); return null; }
}
A.initDailyReward = initDailyReward;

// ── Day Circle ───────────────────────────────────────────────────
function DayCircle(props) {
  var day    = props.day;
  var status = props.status; // 'done' | 'current' | 'locked'
  var r      = WEEKLY_REWARDS[day - 1];

  var circleBg     = status==='done'    ? r.color : status==='current' ? r.bg : 'rgba(22,27,34,0.9)';
  var circleBorder = status==='done'    ? r.color : status==='current' ? r.border : 'rgba(48,54,61,0.6)';
  var textColor    = status==='done'    ? '#fff' : status==='current' ? r.color : '#374151';
  var glow         = (status==='done'||status==='current') ? ('0 0 10px '+r.color+'50') : 'none';

  return h('div', { style:{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 } },
    h('div', {
      style:{
        width:36, height:36, borderRadius:'50%',
        background:circleBg, border:'2px solid '+circleBorder,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize: status==='locked' ? 11 : 17,
        color:textColor, boxShadow:glow, transition:'all 0.2s', flexShrink:0,
      }
    }, status==='locked' ? '🔒' : status==='done' ? '✓' : r.emoji),
    h('div', { style:{ fontSize:9, fontWeight:700, color:textColor, textAlign:'center', lineHeight:1, whiteSpace:'nowrap' } },
      '+'+r.xp+' XP')
  );
}

// ── Daily Reward Modal ───────────────────────────────────────────
function DailyRewardModal(props) {
  var reward  = props.reward;
  var state   = props.state;
  var onClose = props.onClose;

  var [animIn, setAnimIn]       = useState(false);
  var [xpCount, setXpCount]     = useState(0);

  useEffect(function () {
    var t1 = setTimeout(function () { setAnimIn(true); }, 40);

    // Animated XP counter
    var current  = 0;
    var target   = reward.xp;
    var stepSize = Math.max(1, Math.ceil(target / 25));
    var t2 = setInterval(function () {
      current += stepSize;
      if (current >= target) { current = target; clearInterval(t2); }
      setXpCount(current);
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
      opacity: animIn ? 1 : 0,
      transition:'opacity 0.3s ease',
    },
    onClick:onClose,
  },
    // Keyframes
    h('style', null,
      '@keyframes drBounce{0%{transform:scale(0.2);opacity:0}55%{transform:scale(1.18)}80%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}'+
      '@keyframes drSlide{from{transform:scale(0.85) translateY(24px)}to{transform:scale(1) translateY(0)}}'
    ),

    h('div', {
      onClick:function(e){e.stopPropagation();},
      style:{
        width:'100%', maxWidth:390,
        background:'linear-gradient(160deg,#111827,#0d1117)',
        borderRadius:22,
        border:'1px solid '+reward.border,
        padding:'28px 20px 24px',
        textAlign:'center',
        boxShadow:'0 24px 70px rgba(0,0,0,0.7), 0 0 0 1px '+reward.border,
        animation: animIn ? 'drSlide 0.4s cubic-bezier(0.16,1,0.3,1) forwards' : 'none',
      }
    },

      // Header badge
      h('div', {
        style:{
          display:'inline-flex', alignItems:'center', gap:6,
          fontSize:10, fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase',
          color:reward.color, background:reward.bg, border:'1px solid '+reward.border,
          padding:'4px 12px', borderRadius:99, marginBottom:18,
        }
      }, '🎁  DAILY LOGIN REWARD'),

      // Big emoji
      h('div', {
        style:{
          fontSize:58, lineHeight:1, marginBottom:10,
          animation: animIn ? 'drBounce 0.65s cubic-bezier(0.16,1,0.3,1)' : 'none',
        }
      }, reward.emoji),

      // Day label
      h('div', { style:{ fontSize:13, fontWeight:700, color:reward.color, marginBottom:4 } },
        isW7 ? 'PERFECT WEEK COMPLETE!' : 'DAY '+weekDay+' OF 7'
      ),

      // XP count
      h('div', {
        style:{
          fontSize:52, fontWeight:900, color:'#f0fdf4',
          letterSpacing:'-0.04em', lineHeight:1, marginBottom:6,
          fontVariantNumeric:'tabular-nums',
        }
      }, '+'+xpCount+' XP'),

      // Message
      h('div', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.65, marginBottom:22, maxWidth:300, margin:'0 auto 22px' } },
        reward.message
      ),

      // Weekly circles
      h('div', { style:{ marginBottom:20 } },
        h('div', { style:{ fontSize:10, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 } }, 'This Week'),
        h('div', { style:{ display:'flex', justifyContent:'center', gap:5 } },
          WEEKLY_REWARDS.map(function (r, i) {
            var d   = i + 1;
            var st  = d < weekDay ? 'done' : d === weekDay ? 'current' : 'locked';
            return h(DayCircle, { key:d, day:d, status:st });
          })
        )
      ),

      // Stats row
      h('div', { style:{ display:'flex', gap:8, marginBottom:20 } },
        [
          { label:'Total Days',   value:state.totalClaimed    },
          { label:'Best Week',    value:(state.longestWeek||0)+'/7' },
          { label:'This Week',    value:weekDay+'/7'          },
        ].map(function (s) {
          return h('div', {
            key:s.label,
            style:{
              flex:1, padding:'10px 6px',
              background:'rgba(22,27,34,0.8)',
              border:'1px solid rgba(48,54,61,0.8)',
              borderRadius:10, textAlign:'center',
            }
          },
            h('div', { style:{ fontSize:16, fontWeight:800, color:'#f0fdf4' } }, s.value),
            h('div', { style:{ fontSize:9, fontWeight:700, color:'#484f58', textTransform:'uppercase', letterSpacing:'0.06em', marginTop:3 } }, s.label)
          );
        })
      ),

      // CTA button
      h('button', {
        onClick:onClose,
        style:{
          width:'100%', padding:'13px', border:'none', borderRadius:12,
          background: isW7
            ? 'linear-gradient(135deg,#f59e0b,#d97706)'
            : 'linear-gradient(135deg,'+reward.color+','+reward.color+'cc)',
          color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer',
          fontFamily:'inherit',
          boxShadow:'0 4px 18px '+reward.color+'45',
          transition:'transform 0.1s, box-shadow 0.1s',
        },
        onMouseEnter:function(e){e.currentTarget.style.transform='scale(1.02)';},
        onMouseLeave:function(e){e.currentTarget.style.transform='scale(1)';},
      }, isW7 ? '🏆 Claim Your Champion Reward!' : '🏏 Let\'s Train Today!'),

      // Come-back teaser
      weekDay < 7 && h('div', { style:{ fontSize:11, color:'#484f58', marginTop:10 } },
        'Come back tomorrow for +'+WEEKLY_REWARDS[weekDay].xp+' XP'
      )
    )
  );
}

A.DailyRewardModal = DailyRewardModal;

// ── Mini widget for Home page ────────────────────────────────────
function DailyRewardMiniWidget(props) {
  var onOpen = props.onOpen;
  var state   = getRewardState();
  var today   = getToday();
  var claimed = (state.lastClaimed === today);

  // Determine which reward would show next (or current if claimed)
  var displayWeekDay = claimed ? state.weekDay : ((state.weekDay % 7) + 1);
  // First-time: weekDay is 0, so displayWeekDay becomes 1
  if (displayWeekDay < 1) displayWeekDay = 1;
  var nextReward = WEEKLY_REWARDS[Math.min(displayWeekDay - 1, 6)];

  return h('div', {
    onClick: claimed ? undefined : onOpen,
    role:    claimed ? undefined : 'button',
    tabIndex:claimed ? -1 : 0,
    'aria-label': claimed ? 'Daily reward claimed' : 'Claim daily reward',
    onKeyDown:function(e){ if(!claimed&&(e.key==='Enter'||e.key===' '))onOpen(); },
    style:{ margin:'0 16px 12px', cursor:claimed?'default':'pointer', outline:'none' },
  },
    h('div', {
      style:{
        padding:'12px 16px', borderRadius:12,
        background: claimed ? 'rgba(255,255,255,0.03)' : nextReward.bg,
        border:'1px solid '+(claimed?'rgba(255,255,255,0.07)':nextReward.border),
        display:'flex', alignItems:'center', gap:12,
        transition:'border-color 0.2s, background 0.2s',
      }
    },
      h('div', { style:{ fontSize:22, flexShrink:0 } }, claimed ? '✅' : nextReward.emoji),

      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:13, fontWeight:700, color:claimed?'#6b7280':'#f0fdf4' } },
          claimed ? 'Daily Reward Claimed ✓' : 'Daily Login Reward'
        ),
        h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:2 } },
          claimed
            ? 'Day '+(state.weekDay)+'/7 · +'+(WEEKLY_REWARDS[(state.weekDay-1)||0].xp)+' XP earned today'
            : 'Day '+displayWeekDay+'/7 · Tap to claim +'+nextReward.xp+' XP'
        )
      ),

      // Week dots
      h('div', { style:{ display:'flex', gap:3, alignItems:'center', flexShrink:0 } },
        WEEKLY_REWARDS.map(function (r, i) {
          var d         = i + 1;
          var refDay    = claimed ? state.weekDay : displayWeekDay;
          var isFilled  = d < refDay;
          var isCurrent = d === refDay;
          return h('div', {
            key:d,
            style:{
              width:7, height:7, borderRadius:'50%',
              background: isFilled  ? r.color
                        : isCurrent ? r.color+'99'
                        : 'rgba(75,85,99,0.4)',
              border: isCurrent ? '1px solid '+r.color : 'none',
              flexShrink:0,
              transition:'background 0.2s',
            }
          });
        })
      ),

      !claimed && h('div', {
        style:{
          fontSize:12, fontWeight:700, color:nextReward.color,
          background:nextReward.bg, border:'1px solid '+nextReward.border,
          padding:'4px 10px', borderRadius:20, flexShrink:0, whiteSpace:'nowrap',
        }
      }, '+'+nextReward.xp+' XP')
    )
  );
}

A.DailyRewardMiniWidget = DailyRewardMiniWidget;

console.log('[SC] app-daily-reward v1.0 — weekly streak reward system ready');
})();
