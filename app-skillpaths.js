// app-skillpaths.js v3.0 — Premium Plan Design + Personalization + Auto-completion
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const { nav, DB, awardXP } = window.SC_APP;
const { SKILL_PATHS, generateWeekPlan, generatePersonalizedPlan, dateStr, addDays, SCHED_TYPES } = window.SC_APP;
const { Icon, XPBadge, PageHeader } = window.SC_APP;

// ── Plan activity progress helpers ───────────────────────────────────
function planKey(pathId, levelId) { return 'sc_planprog_' + pathId + '_' + levelId; }
function getPlanProgress(pathId, levelId) {
  try { return JSON.parse(localStorage.getItem(planKey(pathId, levelId)) || '{}'); } catch(e) { return {}; }
}
function setPlanActivityDone(pathId, levelId, actKey) {
  var prog = getPlanProgress(pathId, levelId);
  prog[actKey] = true;
  try { localStorage.setItem(planKey(pathId, levelId), JSON.stringify(prog)); } catch(e) {}
  window.dispatchEvent(new CustomEvent('sc_update'));
}
function actKey(weekIdx, dayIdx, actIdx) { return 'w'+weekIdx+'_d'+dayIdx+'_a'+actIdx; }

// ── Haptic shorthand ─────────────────────────────────────────────────
function haptic(type) {
  try { if (window.SC_APP.Emotion && window.SC_APP.Emotion.haptic) window.SC_APP.Emotion.haptic(type || 'light'); } catch(e) {}
}

// ── Early Start Confirmation Modal ────────────────────────────────
function EarlyStartModal({ levelLabel, pathTitle, onConfirm, onCancel }) {
  return h('div', {
    style:{ position:'fixed',inset:0,zIndex:80,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }
  },
    h('div', { style:{ width:'100%',maxWidth:360,background:'#161b22',borderRadius:20,border:'1px solid rgba(245,158,11,0.4)',padding:'28px 24px',textAlign:'center' } },
      h('div', { style:{ fontSize:48,marginBottom:12 } }, '⚡'),
      h('h3', { style:{ fontSize:18,fontWeight:900,color:'#f59e0b',marginBottom:8,letterSpacing:'-0.02em' } }, 'Start Early?'),
      h('p', { style:{ fontSize:13,color:'#9ca3af',lineHeight:1.7,marginBottom:4 } }, 'You\'re about to start the'),
      h('p', { style:{ fontSize:14,fontWeight:800,color:'#f0fdf4',marginBottom:4 } }, '"'+levelLabel+'"'),
      h('p', { style:{ fontSize:13,color:'#9ca3af',lineHeight:1.7,marginBottom:20 } }, 'level of '+pathTitle+' early. This is a harder challenge. Ready?'),
      h('div', { style:{ display:'flex',gap:10 } },
        h('button', { onClick:onCancel, style:{ flex:1,padding:'12px',background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,color:'#8b949e',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:700 } }, 'Not Yet'),
        h('button', { onClick:onConfirm, style:{ flex:1,padding:'12px',background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:14,fontWeight:800,boxShadow:'0 4px 14px rgba(245,158,11,0.4)' } }, "I'm Ready! ⚡")
      )
    )
  );
}

// ── Plan Hero Card ────────────────────────────────────────────────
function PlanHeroCard({ plan, path, lv, totalActivities, doneActivities, user }) {
  var pct = totalActivities ? Math.round(doneActivities / totalActivities * 100) : 0;
  var R = 32, CIRC = 2 * Math.PI * R;
  var name = user && (user.name||'').split(' ')[0];
  return h('div', {
    style:{
      margin:'0 16px 16px',
      background:'linear-gradient(135deg,'+path.accent+'22,rgba(15,23,42,0.95))',
      border:'1px solid '+path.accent+'40',
      borderRadius:20,
      padding:'18px 18px 16px',
      position:'relative',
      overflow:'hidden',
    }
  },
    h('div', { style:{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(to right,'+path.accent+','+path.accent+'44)' } }),
    h('div', { style:{ display:'flex',alignItems:'flex-start',gap:14 } },
      // Circular progress
      h('div', { style:{ position:'relative',width:72,height:72,flexShrink:0 } },
        h('svg', { width:72,height:72,viewBox:'0 0 72 72',style:{ position:'absolute',inset:0,transform:'rotate(-90deg)' } },
          h('circle', { cx:36,cy:36,r:R,fill:'none',stroke:'rgba(51,65,85,0.5)',strokeWidth:5 }),
          h('circle', { cx:36,cy:36,r:R,fill:'none',stroke:path.accent,strokeWidth:5,
            strokeDasharray:CIRC, strokeDashoffset:CIRC*(1-pct/100),
            strokeLinecap:'round', style:{ transition:'stroke-dashoffset 0.6s ease' }
          })
        ),
        h('div', { style:{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center' } },
          h('span', { style:{ fontSize:17,fontWeight:900,color:'#f0fdf4',lineHeight:1 } }, pct+'%'),
          h('span', { style:{ fontSize:9,color:'#64748b',fontWeight:700,marginTop:2 } }, 'done')
        )
      ),
      h('div', { style:{ flex:1,minWidth:0 } },
        h('div', { style:{ fontSize:11,color:path.accent,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:4 } }, 'Your 12-Week Journey'),
        h('div', { style:{ fontSize:15,fontWeight:900,color:'#f0fdf4',lineHeight:1.3,marginBottom:6 } }, plan.name || lv.label),
        h('div', { style:{ fontSize:11.5,color:'#64748b' } }, doneActivities + ' of ' + totalActivities + ' activities complete'),
        name && h('div', { style:{ fontSize:11,color:path.accent,fontWeight:600,marginTop:3 } }, '👤 ' + name + '\'s personalised plan')
      ),
      // Mascot
      window.SC_APP.Mascot && h('div', { style:{ flexShrink:0,opacity:0.85 } },
        h(window.SC_APP.Mascot, { size:'sm' })
      )
    )
  );
}

// ── Plan Promise Card ─────────────────────────────────────────────
function PlanPromiseCard({ promise, accent }) {
  if (!promise) return null;
  return h('div', {
    style:{
      margin:'0 16px 16px',
      padding:'14px 16px',
      borderRadius:14,
      background:'rgba(15,23,42,0.7)',
      borderLeft:'3px solid '+accent,
      border:'1px solid rgba(51,65,85,0.4)',
      borderLeftWidth:3,
      borderLeftColor:accent,
    }
  },
    h('div', { style:{ fontSize:9.5,fontWeight:800,color:accent,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:6 } }, '🎯 SmartCrick Plan Promise'),
    h('p', { style:{ fontSize:13,color:'#94a3b8',lineHeight:1.65,margin:0,fontStyle:'italic' } }, '"'+promise+'"')
  );
}

// ── Activity Row ──────────────────────────────────────────────────
function ActivityRow({ act, actIdx, weekIdx, dayIdx, pathId, levelId, planProgress, onComplete }) {
  var key = actKey(weekIdx, dayIdx, actIdx);
  var done = !!(planProgress && planProgress[key]);
  var typeColors = { drill:'#3b82f6', fitness:'#ec4899', mental:'#8b5cf6' };
  var typeIcons  = { drill:'bat', fitness:'dumbbell', mental:'brain' };
  var color = typeColors[act.type] || '#64748b';

  function handleComplete(e) {
    e.stopPropagation();
    if (done) return;
    haptic('success');
    setPlanActivityDone(pathId, levelId, key);
    if (onComplete) onComplete(key);
    // Award XP for manual completion
    try { awardXP(act.xp || 20, 10, 'plan_activity'); } catch(e2) {}
  }

  function handleStart(e) {
    e.stopPropagation();
    haptic('medium');
    // Store plan context for auto-completion hook
    try {
      sessionStorage.setItem('sc_plan_pending', JSON.stringify({
        planKey: planKey(pathId, levelId), actKey: key, ref_id: act.ref_id, type: act.type
      }));
    } catch(se) {}
    if (act.type === 'drill'   && act.ref_id) { nav('DrillDetail',    { id: act.ref_id }); return; }
    if (act.type === 'mental'  && act.ref_id) { nav('MentalPlayer',   { id: act.ref_id }); return; }
    if (act.type === 'fitness' && act.ref_id) { nav('WorkoutDetail',  { id: act.ref_id }); return; }
    nav(act.type === 'drill' ? 'Drills' : act.type === 'mental' ? 'Mental' : 'Fitness');
  }

  return h('div', {
    'data-ref-id': act.ref_id || '',
    style:{
      display:'flex',alignItems:'center',gap:10,padding:'10px 12px',
      borderRadius:11,
      background: done ? 'rgba(16,185,129,0.07)' : 'rgba(15,23,42,0.5)',
      border:'1px solid '+(done ? 'rgba(16,185,129,0.25)' : 'rgba(51,65,85,0.35)'),
      transition:'all 0.25s ease',
      opacity: done ? 0.85 : 1,
    }
  },
    // Type icon circle
    h('div', { style:{ width:34,height:34,borderRadius:'50%',flexShrink:0,background:color+'18',border:'1px solid '+color+'40',display:'flex',alignItems:'center',justifyContent:'center' } },
      h(Icon, { n:typeIcons[act.type]||'bat', cls:'w-4 h-4', style:{ color:color } })
    ),
    // Content
    h('div', { style:{ flex:1,minWidth:0 } },
      h('div', { style:{ fontSize:13,fontWeight:700,color:done?'#64748b':'#e2e8f0',lineHeight:1.3 } }, act.title),
      h('div', { style:{ fontSize:11,color:'#475569',marginTop:2 } },
        act.duration + ' · ',
        h('span', { style:{ color:color,fontWeight:700 } }, '+' + act.xp + ' XP')
      )
    ),
    // Start button
    !done && h('button', {
      onClick: handleStart,
      style:{ padding:'5px 10px',background:color+'15',border:'1px solid '+color+'35',borderRadius:8,color:color,fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'inherit',flexShrink:0,whiteSpace:'nowrap' }
    }, 'Start →'),
    // Completion checkbox
    h('button', {
      onClick: handleComplete,
      'aria-label': done ? 'Completed' : 'Mark complete',
      style:{
        width:28,height:28,borderRadius:'50%',flexShrink:0,cursor:done?'default':'pointer',
        background: done ? '#10b981' : 'transparent',
        border:'2px solid '+(done ? '#10b981' : 'rgba(71,85,105,0.8)'),
        display:'flex',alignItems:'center',justifyContent:'center',
        transition:'all 0.2s',
        color:'#fff',fontSize:13,fontWeight:900,
      }
    }, done ? '✓' : '')
  );
}

// ── Day Card ─────────────────────────────────────────────────────
function DayCard({ day, dayIdx, weekIdx, pathId, levelId, planProgress, onActivityComplete, pathAccent }) {
  var [open, setOpen] = useState(weekIdx === 0 && dayIdx < 2);
  if (day.isRest) {
    return h('div', { style:{ padding:'10px 12px',borderRadius:11,background:'rgba(15,23,42,0.3)',border:'1px solid rgba(51,65,85,0.2)',display:'flex',alignItems:'center',gap:10 } },
      h(Icon, { n:'heart', cls:'w-4 h-4', style:{ color:'#374151' } }),
      h('div', null,
        h('div', { style:{ fontSize:13,fontWeight:700,color:'#374151' } }, day.label + ' — Rest Day'),
        h('div', { style:{ fontSize:11,color:'#374151' } }, 'Recovery builds performance')
      )
    );
  }
  var totalActs = day.activities ? day.activities.length : 0;
  var doneActs = day.activities ? day.activities.filter(function(act, ai) {
    return !!(planProgress && planProgress[actKey(weekIdx, dayIdx, ai)]);
  }).length : 0;
  var allDone = totalActs > 0 && doneActs === totalActs;

  return h('div', {
    style:{
      borderRadius:12,overflow:'hidden',
      border:'1px solid '+(allDone ? 'rgba(16,185,129,0.35)' : 'rgba(51,65,85,0.35)'),
      transition:'border-color 0.3s',
      boxShadow: allDone ? '0 0 10px rgba(16,185,129,0.08)' : 'none',
    }
  },
    h('button', {
      onClick:function(){ haptic('light'); setOpen(function(o){ return !o; }); },
      style:{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',background:'rgba(22,27,34,0.7)',border:'none',cursor:'pointer',fontFamily:'inherit',textAlign:'left' }
    },
      h('div', { style:{ display:'flex',alignItems:'center',gap:10 } },
        allDone && h('span', { style:{ fontSize:14,color:'#10b981' } }, '✓'),
        h('div', null,
          h('div', { style:{ fontSize:13,fontWeight:800,color:allDone?'#10b981':'#f0fdf4' } }, day.label),
          h('div', { style:{ fontSize:10.5,color:'#475569',marginTop:1 } }, doneActs+'/'+totalActs+' complete · +'+day.totalXP+' XP')
        )
      ),
      h('div', { style:{ display:'flex',alignItems:'center',gap:8 } },
        h('span', { style:{ fontSize:11,fontWeight:700,color:pathAccent } }, '+'+day.totalXP+' XP'),
        h(Icon, { n:open?'chevU':'chevD', cls:'w-4 h-4', style:{ color:'#475569' } })
      )
    ),
    open && h('div', { style:{ background:'rgba(10,15,26,0.5)',borderTop:'1px solid rgba(51,65,85,0.25)',padding:'10px 10px 12px' } },
      h('div', { style:{ display:'flex',flexDirection:'column',gap:7 } },
        (day.activities||[]).map(function(act, ai) {
          return h(ActivityRow, {
            key:ai, act:act, actIdx:ai, weekIdx:weekIdx, dayIdx:dayIdx,
            pathId:pathId, levelId:levelId, planProgress:planProgress,
            onComplete: onActivityComplete,
          });
        })
      )
    )
  );
}

// ── Phase Card (replaces WeekAccordion) ───────────────────────────
var PHASE_COLORS = {
  'Foundation':         '#3b82f6',
  'Building Basics':    '#3b82f6',
  'Development':        '#10b981',
  'Growing Strong':     '#10b981',
  'Integration':        '#f97316',
  'First Breakthrough': '#f97316',
  'Performance':        '#f59e0b',
  'Match Ready':        '#f59e0b',
  'Mastery':            '#8b5cf6',
  'Star Player':        '#8b5cf6',
  'Elite Foundation':   '#3b82f6',
  'Performance Peak':   '#10b981',
  'Championship Mindset':'#f97316',
  'Pro Standard':       '#f59e0b',
  'Elite Selection':    '#8b5cf6',
};
var PHASE_ICONS = {
  'Foundation':'layers', 'Building Basics':'layers', 'Development':'trending',
  'Growing Strong':'trending', 'Integration':'zap', 'First Breakthrough':'zap',
  'Performance':'flame', 'Match Ready':'flame', 'Mastery':'crown', 'Star Player':'crown',
  'Elite Foundation':'layers', 'Performance Peak':'trending', 'Championship Mindset':'zap',
  'Pro Standard':'flame', 'Elite Selection':'crown',
};

function PhaseCard({ week, weekIdx, pathId, levelId, planProgress, onActivityComplete, pathAccent }) {
  var [open, setOpen] = useState(weekIdx === 0);
  var phaseColor = PHASE_COLORS[week.phase] || pathAccent || '#3b82f6';
  var phaseIcon  = PHASE_ICONS[week.phase] || 'layers';

  var totalActs = 0, doneActs = 0;
  week.days.forEach(function(day, di) {
    if (day.isRest) return;
    (day.activities||[]).forEach(function(act, ai) {
      totalActs++;
      if (planProgress && planProgress[actKey(weekIdx, di, ai)]) doneActs++;
    });
  });
  var allDone = totalActs > 0 && doneActs === totalActs;
  var trainingDays = week.days.filter(function(d){ return !d.isRest; }).length;

  return h('div', {
    style:{
      borderRadius:14,overflow:'hidden',
      border:'1px solid '+(allDone?'rgba(16,185,129,0.3)':'rgba(51,65,85,0.4)'),
      background:'rgba(15,23,42,0.5)',
      boxShadow:allDone?'0 0 12px rgba(16,185,129,0.06)':'none',
      transition:'all 0.3s',
    }
  },
    // Phase header
    h('button', {
      onClick:function(){ haptic('light'); setOpen(function(o){ return !o; }); },
      style:{ width:'100%',display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',background:'rgba(22,27,34,0.7)',border:'none',borderLeft:'3px solid '+phaseColor,cursor:'pointer',fontFamily:'inherit',textAlign:'left' }
    },
      h('div', { style:{ width:36,height:36,borderRadius:10,flexShrink:0,background:phaseColor+'18',border:'1px solid '+phaseColor+'35',display:'flex',alignItems:'center',justifyContent:'center' } },
        h(Icon, { n:phaseIcon, cls:'w-4 h-4', style:{ color:phaseColor } })
      ),
      h('div', { style:{ flex:1,minWidth:0 } },
        h('div', { style:{ display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:3 } },
          h('span', { style:{ fontSize:14,fontWeight:900,color:allDone?'#10b981':'#f0fdf4' } }, week.phase),
          allDone && h('span', { style:{ fontSize:10,fontWeight:800,color:'#10b981',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:99,padding:'2px 8px' } }, 'COMPLETED ✓')
        ),
        h('div', { style:{ fontSize:11.5,color:'#94a3b8',lineHeight:1.5,marginBottom:5 } }, week.theme),
        h('div', { style:{ display:'flex',alignItems:'center',gap:12 } },
          h('span', { style:{ fontSize:11,color:'#475569' } }, trainingDays+' training days'),
          h('div', { style:{ flex:1,height:4,borderRadius:4,background:'rgba(51,65,85,0.5)',overflow:'hidden' } },
            h('div', { style:{ width:(totalActs?Math.round(doneActs/totalActs*100):0)+'%',height:'100%',background:phaseColor,borderRadius:4,transition:'width 0.4s ease' } })
          ),
          h('span', { style:{ fontSize:11,color:phaseColor,fontWeight:700,flexShrink:0 } }, doneActs+'/'+totalActs)
        )
      ),
      h(Icon, { n:open?'chevU':'chevD', cls:'w-4 h-4', style:{ color:'#475569',flexShrink:0,marginTop:2 } })
    ),
    // Days expanded
    open && h('div', { style:{ padding:'10px 12px 14px',borderTop:'1px solid rgba(51,65,85,0.3)',display:'flex',flexDirection:'column',gap:8 } },
      week.days.map(function(day, di) {
        return h(DayCard, {
          key:di, day:day, dayIdx:di, weekIdx:weekIdx,
          pathId:pathId, levelId:levelId, planProgress:planProgress,
          onActivityComplete:onActivityComplete, pathAccent:pathAccent||phaseColor,
        });
      })
    )
  );
}

// ── iCal export for full 12-week plan ─────────────────────────────
function exportPlanToICal(plan, planName) {
  var monday = new Date();
  monday.setHours(0,0,0,0);
  var day = monday.getDay();
  monday.setDate(monday.getDate() + (day===0?1:8-day)); // next Monday
  var lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SmartCrick//12-Week Plan//EN','CALSCALE:GREGORIAN'];
  var times = ['070000','170000','190000'];
  plan.weeks.forEach(function(week, wi) {
    week.days.forEach(function(day) {
      if (day.isRest) return;
      (day.activities||[]).forEach(function(act, ai) {
        var d = new Date(monday);
        d.setDate(d.getDate() + (wi * 7) + (day.day - 1));
        var ds = dateStr(d).replace(/-/g,'') + 'T' + (times[ai]||'070000');
        var uid = 'sc-' + wi + '-' + day.day + '-' + ai + '@smartcrick.app';
        lines.push('BEGIN:VEVENT','UID:'+uid,'DTSTART:'+ds,
          'DURATION:PT'+(parseInt(act.duration)||20)+'M',
          'SUMMARY:SmartCrick: '+act.title,
          'DESCRIPTION:+'+act.xp+' XP · '+act.type+' · '+week.theme,
          'CATEGORIES:SMARTCRICK,'+act.type.toUpperCase(),'END:VEVENT');
      });
    });
  });
  lines.push('END:VCALENDAR');
  var blob = new Blob([lines.join('\r\n')], { type:'text/calendar' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = (planName||'SmartCrick_Plan').replace(/[^a-z0-9]/gi,'_') + '.ics';
  a.click(); URL.revokeObjectURL(url);
}

// ── Main Page ─────────────────────────────────────────────────────
function SkillPathsPage() {
  const [pathId, setPathId] = useState(null);
  const [levelId, setLevelId] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const [personalPlan, setPersonalPlan] = useState(null);
  const [earlyStartModal, setEarlyStartModal] = useState(null);
  const [planProgress, setPlanProgress] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);
  const user = DB.getUser ? DB.getUser() : null;

  const progress = DB.getProgress();
  const skillProg = progress.skill_path_progress || {};

  // Reload plan progress when pathId/levelId changes
  useEffect(function() {
    if (pathId && levelId) {
      setPlanProgress(getPlanProgress(pathId, levelId));
    }
  }, [pathId, levelId, refreshKey]);

  // Listen for auto-complete events (drill/mental/fitness completed in main app)
  useEffect(function() {
    function onAutoComplete(e) {
      setRefreshKey(function(k){ return k + 1; });
      // Fire sparkle on the matching activity row
      var refId = e.detail && e.detail.ref_id;
      if (refId) {
        setTimeout(function() {
          var el = document.querySelector('[data-ref-id="'+refId+'"]');
          if (el && window.SC_APP.Emotion && window.SC_APP.Emotion.fireSparkleSVG) {
            window.SC_APP.Emotion.fireSparkleSVG(el);
          }
        }, 100);
      }
    }
    window.addEventListener('sc_plan_autocomplete', onAutoComplete);
    window.addEventListener('sc_update', function(){ setRefreshKey(function(k){ return k + 1; }); });
    return function() { window.removeEventListener('sc_plan_autocomplete', onAutoComplete); };
  }, []);

  function handleActivityComplete(key) {
    setPlanProgress(function(prev) {
      var next = Object.assign({}, prev, { [key]: true });
      return next;
    });
    // Check if all activities in the plan are now done → celebration
    if (pathId && levelId) {
      setTimeout(function() {
        var fresh = getPlanProgress(pathId, levelId);
        var total = 0, done = 0;
        (weekPlan||[]).forEach(function(week, wi) {
          week.days.forEach(function(day, di) {
            if (!day.isRest) (day.activities||[]).forEach(function(act, ai) {
              total++; if (fresh[actKey(wi, di, ai)]) done++;
            });
          });
        });
        if (total > 0 && done === total) {
          haptic('badge');
          try { if (window.SC_APP.fireConfetti) window.SC_APP.fireConfetti(); } catch(e) {}
        }
      }, 200);
    }
  }

  function importToSchedule(plan) {
    haptic('medium');
    var monday = new Date();
    monday.setHours(0,0,0,0);
    var day = monday.getDay();
    monday.setDate(monday.getDate() + (day===0?-6:1-day));
    var added = 0;
    plan.forEach(function(week) {
      if (week.week !== 1) return;
      week.days.forEach(function(d) {
        if (d.isRest) return;
        var dd = addDays(monday, d.day-1);
        var ds = dateStr(dd);
        (d.activities||[]).forEach(function(act,i) {
          DB.addSession({
            id:'sch_'+Date.now()+'_'+d.day+'_'+i,
            date:ds, time:i===0?'07:00':i===1?'17:00':'19:00',
            type:act.type, title:act.title, ref_id:act.ref_id||act.id||null,
            duration_minutes:parseInt(act.duration)||20, xp_value:act.xp,
            status:'pending', notes:'From Skill Path',
            color:(SCHED_TYPES&&SCHED_TYPES[act.type])?SCHED_TYPES[act.type].color:'#64748b'
          });
          added++;
        });
      });
    });
    window.dispatchEvent(new CustomEvent('sc_update'));
    alert('✅ '+added+' sessions added to this week\'s schedule!');
  }

  // ── PATHS LIST ───────────────────────────────────────────────────
  if (!pathId) return h('div', { className:'pb-28' },
    h(PageHeader, {
      title:'Skill Paths',
      subtitle:'Structured 12-week programs for every discipline',
      gradient:'linear-gradient(135deg,#7e22ce,#4f46e5)',
    }),
    h('div', { className:'px-4 pt-5 space-y-4' },
      SKILL_PATHS.map(function(path) {
        const pp = skillProg[path.id]||{};
        const doneCount = Object.values(pp).filter(Boolean).length;
        const pct = doneCount/path.levels.length*100;
        return h('button', {
          key:path.id,
          onClick:function(){ haptic('light'); setPathId(path.id); setLevelId(null); setWeekPlan(null); setPersonalPlan(null); },
          className:'w-full text-left rounded-2xl active:scale-[.99] transition-all',
          style:{ background:'rgba(15,23,42,0.8)', border:'1px solid '+path.accent+'30', overflow:'hidden' }
        },
          h('div', { style:{ height:3,background:'linear-gradient(to right,'+path.accent+',transparent)' } }),
          h('div', { style:{ padding:'16px 18px 18px',display:'flex',alignItems:'center',gap:14 } },
            // Circular progress ring
            h('div', { style:{ position:'relative',width:60,height:60,flexShrink:0 } },
              h('svg', { width:60,height:60,viewBox:'0 0 60 60',style:{ position:'absolute',inset:0,transform:'rotate(-90deg)' } },
                h('circle', { cx:30,cy:30,r:24,fill:'none',stroke:'rgba(51,65,85,0.5)',strokeWidth:4 }),
                h('circle', { cx:30,cy:30,r:24,fill:'none',stroke:path.accent,strokeWidth:4,
                  strokeDasharray:2*Math.PI*24,strokeDashoffset:2*Math.PI*24*(1-pct/100),
                  strokeLinecap:'round',style:{ transition:'stroke-dashoffset .6s' }
                })
              ),
              h('div', { style:{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' } },
                h(Icon, { n:path.icon||'bat', cls:'w-6 h-6 text-white' })
              )
            ),
            h('div', { className:'flex-1', style:{ minWidth:0 } },
              h('h3', { style:{ fontWeight:900,color:'#f0fdf4',fontSize:15,marginBottom:2 } }, path.title),
              h('p', { style:{ fontSize:12,color:'#64748b',marginBottom:8,lineHeight:1.4 } }, path.desc),
              h('div', { style:{ display:'flex',alignItems:'center',gap:8 } },
                h('div', { style:{ flex:1,height:5,borderRadius:99,background:'rgba(51,65,85,0.5)',overflow:'hidden' } },
                  h('div', { style:{ width:pct+'%',height:'100%',background:path.accent,borderRadius:99,transition:'width .6s' } })
                ),
                h('span', { style:{ fontSize:11,fontWeight:800,color:path.accent,flexShrink:0 } }, doneCount+'/'+path.levels.length+' levels')
              )
            )
          )
        );
      })
    )
  );

  const path = SKILL_PATHS.find(function(p){ return p.id===pathId; });
  if (!path) return null;
  const grad = 'linear-gradient(135deg,'+path.accent+','+path.accent+'88)';

  // ── LEVEL SELECTION ──────────────────────────────────────────────
  if (!levelId) return h('div', { className:'pb-28' },
    earlyStartModal && h(EarlyStartModal, {
      levelLabel: earlyStartModal.level.label,
      pathTitle: path.title,
      onConfirm: function() {
        haptic('medium');
        var lv = earlyStartModal.level;
        var pp = generatePersonalizedPlan && user ? (generatePersonalizedPlan(Object.assign({ recommendedPath: path.id, level: user.level }, user)) || null) : null;
        var wp = pp ? pp.weeks : generateWeekPlan(path.id, lv.id);
        setLevelId(lv.id);
        setWeekPlan(wp);
        setPersonalPlan(pp);
        setEarlyStartModal(null);
      },
      onCancel: function() { setEarlyStartModal(null); }
    }),
    h(PageHeader, { title:path.title, subtitle:path.desc, gradient:grad, onBack:function(){ setPathId(null); } }),
    h('div', { className:'px-4 pt-5 space-y-3' },
      h('p', { style:{ fontSize:13,color:'#64748b',marginBottom:16,lineHeight:1.6 } },
        'Choose your level. Each level is a structured 5-week program. Locked levels can be started early.'),
      path.levels.map(function(lv, i) {
        const pp2 = skillProg[path.id]||{};
        const unlocked = i===0 || pp2[path.levels[i-1].id];
        const done = pp2[lv.id];
        return h('div', { key:lv.id,
          style:{ borderRadius:14,overflow:'hidden',background:done?'rgba(16,185,129,0.06)':unlocked?'rgba(22,27,34,0.8)':'rgba(10,15,26,0.6)',border:'2px solid '+(done?'rgba(16,185,129,0.4)':unlocked?path.accent+'40':'rgba(51,65,85,0.4)') }
        },
          h('button', {
            onClick:function(){
              if (!unlocked && !done) return;
              haptic('light');
              var pp3 = generatePersonalizedPlan && user ? (generatePersonalizedPlan(Object.assign({ recommendedPath: path.id }, user)) || null) : null;
              var wp = pp3 ? pp3.weeks : generateWeekPlan(path.id, lv.id);
              setLevelId(lv.id); setWeekPlan(wp); setPersonalPlan(pp3);
            },
            style:{ display:'flex',alignItems:'center',gap:14,padding:'16px',cursor:(unlocked||done)?'pointer':'default',background:'transparent',border:'none',textAlign:'left',width:'100%',fontFamily:'inherit' }
          },
            h('div', { style:{ width:52,height:52,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:done?'#10b981':unlocked?path.accent:'rgba(51,65,85,0.5)' } },
              done ? h(Icon, { n:'circleCheck', cls:'w-7 h-7 text-white' }) : h(Icon, { n:lv.icon||'bat', cls:'w-7 h-7 text-white' })
            ),
            h('div', { className:'flex-1' },
              h('div', { style:{ display:'flex',alignItems:'center',gap:6,marginBottom:2 } },
                h('span', { style:{ fontWeight:900,color:'#f0fdf4',fontSize:14 } }, lv.label),
                !unlocked&&!done && h(Icon, { n:'lock', cls:'w-3 h-3', style:{ color:'#f59e0b' } }),
                done && h('span', { style:{ fontSize:10,fontWeight:800,color:'#4ade80',background:'rgba(74,222,128,0.1)',borderRadius:99,padding:'2px 7px' } }, '✓ Complete')
              ),
              h('p', { style:{ fontSize:12,color:'#64748b',marginBottom:6,lineHeight:1.4 } }, lv.desc),
              h('div', { style:{ display:'flex',gap:8 } },
                h('span', { style:{ fontSize:12,fontWeight:800,color:path.accent } }, '+'+lv.xpPerDay+' XP/day'),
                h('span', { style:{ fontSize:12,color:'#475569' } }, '· 5-week program')
              )
            )
          ),
          !unlocked&&!done && h('div', { style:{ padding:'8px 16px 12px',background:'rgba(245,158,11,0.04)',borderTop:'1px solid rgba(245,158,11,0.12)',display:'flex',alignItems:'center',justifyContent:'space-between' } },
            h('span', { style:{ fontSize:11,color:'#6b7280' } }, '⚠ Complete previous levels to unlock'),
            h('button', {
              onClick:function(){ haptic('light'); setEarlyStartModal({ path, level:lv }); },
              style:{ padding:'6px 12px',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:8,color:'#f59e0b',fontSize:11,fontWeight:800,cursor:'pointer',fontFamily:'inherit' }
            }, '⚡ Start Early')
          )
        );
      })
    )
  );

  const lv = path.levels.find(function(l){ return l.id===levelId; });
  if (!lv || !weekPlan) return null;

  // Count total activities + completed
  var totalActs = 0, doneActs = 0;
  weekPlan.forEach(function(week, wi) {
    week.days.forEach(function(day, di) {
      if (!day.isRest) (day.activities||[]).forEach(function(act, ai) {
        totalActs++;
        if (planProgress[actKey(wi, di, ai)]) doneActs++;
      });
    });
  });

  var plan = personalPlan || { name: lv.label, promise: null, weeks: weekPlan };

  // ── WEEK PLAN VIEW ────────────────────────────────────────────────
  return h('div', { className:'pb-28', style:{ background:'#080b0f',minHeight:'100dvh' } },
    h(PageHeader, { title:plan.name||lv.label, subtitle:path.title, gradient:grad, onBack:function(){ setLevelId(null); } }),

    // Hero card
    h(PlanHeroCard, { plan:plan, path:path, lv:lv, totalActivities:totalActs, doneActivities:doneActs, user:user }),

    // Promise card
    plan.promise && h(PlanPromiseCard, { promise:plan.promise, accent:path.accent }),

    // Action buttons
    h('div', { style:{ display:'flex',gap:8,padding:'0 16px 16px' } },
      h('button', {
        onClick:function(){ importToSchedule(weekPlan); },
        style:{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'11px',borderRadius:11,background:'linear-gradient(135deg,#0f766e,#0d9488)',border:'none',color:'#fff',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'inherit' }
      },
        h(Icon, { n:'calendar', cls:'w-4 h-4' }), 'Add Week 1 to Schedule'
      ),
      h('button', {
        onClick:function(){ haptic('medium'); exportPlanToICal({ weeks:weekPlan }, plan.name); },
        style:{ display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'11px 14px',borderRadius:11,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(51,65,85,0.5)',color:'#94a3b8',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }
      },
        '📅 Export'
      ),
      h('button', {
        onClick:function(){
          haptic('badge');
          var p2 = DB.getProgress();
          if (!p2.skill_path_progress) p2.skill_path_progress = {};
          if (!p2.skill_path_progress[path.id]) p2.skill_path_progress[path.id] = {};
          p2.skill_path_progress[path.id][levelId] = true;
          DB.saveProgress(p2);
          awardXP(lv.xpPerDay*5, 30, 'skill_path');
          try { if (window.SC_APP.fireConfetti) window.SC_APP.fireConfetti(); } catch(e) {}
          setLevelId(null);
        },
        style:{ display:'flex',alignItems:'center',gap:5,padding:'11px 14px',borderRadius:11,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(51,65,85,0.5)',color:'#94a3b8',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit' }
      },
        h(Icon, { n:'check', cls:'w-4 h-4' }), 'Done'
      )
    ),

    // Phase cards
    h('div', { style:{ padding:'0 16px 16px',display:'flex',flexDirection:'column',gap:10 } },
      weekPlan.map(function(week, wi) {
        return h(PhaseCard, {
          key:wi, week:week, weekIdx:wi,
          pathId:path.id, levelId:levelId,
          planProgress:planProgress,
          onActivityComplete:handleActivityComplete,
          pathAccent:path.accent,
        });
      })
    )
  );
}

Object.assign(window.SC_APP, { WeekAccordion: PhaseCard, SkillPathsPage, getPlanProgress, setPlanActivityDone });
console.log('[SC] app-skillpaths v3.0 — premium design + personalization + auto-completion ready');
})();
