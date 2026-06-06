// app-schedule.js v2.1 — Training Schedule Planner
// Exports: A.SchedulePage
(function() {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A   = window.SC_APP;
const DB  = A.DB;
const nav = A.nav;
const { Icon, XPBadge, PageHeader } = A;
const { DRILLS, MENTAL_SESSIONS, WORKOUTS, SCHED_TYPES, awardXP, fireConfetti } = A;
const { getWeekMonday, dateStr, addDays, formatDate, isToday, fmtTime } = A;

var TYPE_COLORS = {
  drill:   { label:'Cricket Drill',    color:'#3b82f6', bg:'rgba(59,130,246,.12)',   border:'rgba(59,130,246,.4)',  icon:'bat'      },
  mental:  { label:'Mental Session',   color:'#a855f7', bg:'rgba(168,85,247,.12)',   border:'rgba(168,85,247,.4)', icon:'brain'    },
  fitness: { label:'Fitness',          color:'#f97316', bg:'rgba(249,115,22,.12)',    border:'rgba(249,115,22,.4)', icon:'dumbbell' },
  match:   { label:'Match Day',        color:'#f59e0b', bg:'rgba(245,158,11,.12)',    border:'rgba(245,158,11,.4)', icon:'wicket'   },
  rest:    { label:'Rest & Recover',   color:'#16a34a', bg:'rgba(22,163,74,.08)',     border:'rgba(22,163,74,.25)', icon:'heart'    },
  custom:  { label:'Custom Session',   color:'#8b949e', bg:'rgba(139,148,158,.12)',   border:'rgba(139,148,158,.4)',icon:'list'     },
};

// ── Pending session bridge (from Today's Mission "Start" btn) ─────
function checkPendingSession() {
  try {
    var raw = sessionStorage.getItem('sc_pending_session');
    if (!raw) return null;
    sessionStorage.removeItem('sc_pending_session');
    return JSON.parse(raw);
  } catch(e) { return null; }
}

// ── Session Card ──────────────────────────────────────────────────
function SessionCard({ sess, onComplete, onDelete }) {
  var tc = TYPE_COLORS[sess.type] || TYPE_COLORS.custom;
  var done = sess.status === 'complete';
  return h('div', { style:{ borderRadius:10, overflow:'hidden', border:'1px solid '+(done?'rgba(22,163,74,.3)':tc.border), background:done?'rgba(22,163,74,.06)':tc.bg, marginBottom:8 } },
    h('div', { style:{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px' } },
      h('div', { style:{ width:36, height:36, borderRadius:8, background:tc.color+'20', border:'1px solid '+tc.color+'40', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } },
        h(Icon, { n:tc.icon, cls:'w-4 h-4', style:{ color:tc.color } })
      ),
      h('div', { style:{ flex:1, minWidth:0 } },
        h('div', { style:{ fontSize:13, fontWeight:700, color:done?'#6b7280':'#f0fdf4', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textDecoration:done?'line-through':'none' } }, sess.title),
        h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:2 } }, [sess.time, sess.duration_minutes&&sess.duration_minutes+'min', sess.xp_value&&'+'+sess.xp_value+' XP'].filter(Boolean).join(' · ')),
      ),
      !done && h('button', {
        onClick: function(){ onComplete(sess); },
        'aria-label': 'Mark '+sess.title+' complete',
        style:{ padding:'6px 12px', background:'#16a34a', color:'#fff', border:'none', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 },
      }, '✓ Done'),
      h('button', { onClick:function(){ onDelete(sess.id); }, 'aria-label':'Delete session', style:{ background:'none', border:'none', color:'#374151', cursor:'pointer', padding:'4px 6px', fontSize:16, flexShrink:0 } }, '×'),
    ),
  );
}

// ── Add Session Modal ─────────────────────────────────────────────
function AddSessionModal({ date, onSave, onClose }) {
  var [type,     setType]     = useState('drill');
  var [title,    setTitle]    = useState('');
  var [time,     setTime]     = useState('07:00');
  var [refId,    setRefId]    = useState('');
  var [notes,    setNotes]    = useState('');
  var tc = TYPE_COLORS[type]||TYPE_COLORS.custom;

  // Auto-suggestions by type
  var suggestions = {
    drill:   (DRILLS||[]).slice(0,6).map(function(d){ return { id:d.id, label:d.title, xp:d.xp_value, dur:d.duration_minutes }; }),
    mental:  (MENTAL_SESSIONS||[]).slice(0,6).map(function(m){ return { id:m.id, label:m.title, xp:m.xp_value, dur:Math.round(m.duration_seconds/60) }; }),
    fitness: (WORKOUTS||[]).slice(0,6).map(function(w){ return { id:w.id, label:w.name, xp:w.xp_value, dur:w.duration_minutes }; }),
    match:   [], rest:[], custom:[],
  };
  var sugg = suggestions[type]||[];
  var [selectedSugg, setSelectedSugg] = useState(null);

  function handleSugg(s) {
    setSelectedSugg(s); setTitle(s.label); setRefId(s.id);
  }

  function handleSave() {
    if (!title.trim()) return;
    var xp = selectedSugg ? selectedSugg.xp : 60;
    var dur = selectedSugg ? selectedSugg.dur : 20;
    onSave({
      id: 'sch_' + Date.now(),
      date: date, time: time, type: type,
      title: title.trim(), ref_id: refId || null,
      duration_minutes: dur, xp_value: xp,
      status: 'pending', notes: notes, color: tc.color,
    });
  }

  return h('div', { style:{ position:'fixed', inset:0, zIndex:60, background:'rgba(0,0,0,.8)', backdropFilter:'blur(6px)', display:'flex', alignItems:'flex-end', justifyContent:'center' }, onClick:onClose },
    h('div', { onClick:function(e){e.stopPropagation();}, style:{ width:'100%', maxWidth:520, background:'#161b22', borderRadius:'20px 20px 0 0', border:'1px solid rgba(48,54,61,.9)', borderBottom:'none', padding:'0 20px 40px', maxHeight:'85vh', overflowY:'auto' } },
      h('div', { style:{ width:40, height:4, borderRadius:2, background:'rgba(75,85,99,.6)', margin:'12px auto 20px' } }),
      h('h3', { style:{ fontSize:17, fontWeight:800, color:'#f0fdf4', marginBottom:16 } }, 'Add Session — '+formatDate(date)),

      // Type selector
      h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:16 } },
        ['drill','mental','fitness','match','rest','custom'].map(function(t) {
          var ttc = TYPE_COLORS[t], isSel = type===t;
          return h('button', { key:t, onClick:function(){setType(t);setTitle('');setRefId('');setSelectedSugg(null);},
            style:{ padding:'8px 4px', borderRadius:8, border:'1px solid '+(isSel?ttc.color:'rgba(48,54,61,.9)'), background:isSel?ttc.bg:'rgba(22,27,34,.9)', cursor:'pointer', fontFamily:'inherit', fontSize:11, fontWeight:700, color:isSel?ttc.color:'#6b7280' } },
            ttc.label,
          );
        })
      ),

      // Quick picks
      sugg.length > 0 && h('div', { style:{ marginBottom:14 } },
        h('div', { style:{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 } }, 'Quick Pick'),
        h('div', { style:{ display:'flex', flexDirection:'column', gap:6 } },
          sugg.map(function(s) {
            return h('button', { key:s.id, onClick:function(){handleSugg(s);},
              style:{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, border:'1px solid '+(selectedSugg&&selectedSugg.id===s.id?tc.color:'rgba(48,54,61,.9)'), background:selectedSugg&&selectedSugg.id===s.id?tc.bg:'rgba(22,27,34,.9)', cursor:'pointer', textAlign:'left', fontFamily:'inherit' } },
              h('div', { style:{ flex:1, fontSize:12, fontWeight:600, color:'#f0fdf4' } }, s.label),
              h(XPBadge, { xp: s.xp }),
            );
          })
        ),
      ),

      // Title input
      h('div', { style:{ marginBottom:12 } },
        h('label', { htmlFor:'sess-title', style:{ display:'block', fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 } }, 'Session Title'),
        h('input', { id:'sess-title', type:'text', value:title, onChange:function(e){setTitle(e.target.value);}, placeholder:'e.g. Cover Drive Mastery', style:{ width:'100%', padding:'11px 14px', background:'rgba(22,27,34,.9)', border:'1px solid rgba(48,54,61,.9)', borderRadius:9, color:'#f0fdf4', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' } }),
      ),

      // Time
      h('div', { style:{ marginBottom:16 } },
        h('label', { htmlFor:'sess-time', style:{ display:'block', fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 } }, 'Start Time'),
        h('input', { id:'sess-time', type:'time', value:time, onChange:function(e){setTime(e.target.value);}, style:{ width:'100%', padding:'11px 14px', background:'rgba(22,27,34,.9)', border:'1px solid rgba(48,54,61,.9)', borderRadius:9, color:'#f0fdf4', fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box' } }),
      ),

      h('button', { onClick:handleSave, disabled:!title.trim(), style:{ width:'100%', padding:'13px', background:title.trim()?tc.color:'rgba(48,54,61,.5)', color:'#fff', border:'none', borderRadius:10, fontSize:14, fontWeight:700, cursor:title.trim()?'pointer':'not-allowed', opacity:title.trim()?1:0.5 } }, 'Add to Schedule'),
    ),
  );
}

// ── Week nav header ───────────────────────────────────────────────
function WeekNav({ monday, onPrev, onNext }) {
  var sunday = addDays(monday, 6);
  var label  = dateStr(monday).slice(5).replace('-','/') + ' – ' + dateStr(sunday).slice(5).replace('-','/');
  var isCurrent = dateStr(monday) === dateStr(getWeekMonday(new Date()));
  return h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'rgba(22,27,34,.9)', borderBottom:'1px solid rgba(48,54,61,.9)' } },
    h('button', { onClick:onPrev, 'aria-label':'Previous week', style:{ background:'rgba(48,54,61,.5)', border:'1px solid rgba(75,85,99,.5)', borderRadius:8, padding:'6px 12px', color:'#8b949e', cursor:'pointer', fontSize:12, fontWeight:600 } }, '‹ Prev'),
    h('div', { style:{ textAlign:'center' } },
      h('div', { style:{ fontSize:13, fontWeight:700, color:'#f0fdf4' } }, label),
      isCurrent && h('div', { style:{ fontSize:10, color:'#16a34a', fontWeight:700 } }, 'This Week'),
    ),
    h('button', { onClick:onNext, 'aria-label':'Next week', style:{ background:'rgba(48,54,61,.5)', border:'1px solid rgba(75,85,99,.5)', borderRadius:8, padding:'6px 12px', color:'#8b949e', cursor:'pointer', fontSize:12, fontWeight:600 } }, 'Next ›'),
  );
}

// ── Daily Net integration in schedule ────────────────────────────
function DailyNetScheduleRow() {
  var today = new Date().toISOString().slice(0,10);
  var saved = DB.get('dn_'+today);
  var done  = !!saved;
  return h('div', { style:{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:9, border:'1px solid rgba(79,70,229,.3)', background:'rgba(79,70,229,.07)', marginBottom:8 } },
    h('div', { style:{ width:36, height:36, borderRadius:8, background:'rgba(79,70,229,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 } }, h('span', { style:{fontSize:18} }, '🏏')),
    h('div', { style:{ flex:1 } },
      h('div', { style:{ fontSize:13, fontWeight:700, color:done?'#6b7280':'#f0fdf4', textDecoration:done?'line-through':'none' } }, 'The Daily Net'),
      h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:2 } }, done ? 'Score: '+saved.score+'/5 ✓' : '5 cricket questions · ~2 min'),
    ),
    !done && h('button', { onClick:function(){nav('DailyNet');}, style:{ padding:'6px 12px', background:'#4f46e5', color:'#fff', border:'none', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 } }, 'Play →'),
    done && h('span', { style:{ fontSize:11, fontWeight:700, color:'#4ade80', flexShrink:0 } }, '✓ Done'),
  );
}

// ── Main Schedule Page ────────────────────────────────────────────
function SchedulePage() {
  var [monday,    setMonday]    = useState(function(){ return getWeekMonday(new Date()); });
  var [schedule,  setSchedule]  = useState(function(){ return DB.getSchedule(); });
  var [showAdd,   setShowAdd]   = useState(false);
  var [addDate,   setAddDate]   = useState(null);
  var [toast,     setToast]     = useState('');
  var today = new Date().toISOString().slice(0,10);

  useEffect(function(){
    var pending = checkPendingSession();
    if (pending) { completePendingSession(pending); }
  }, []);
  useEffect(function(){
    var onUpdate = function(){ setSchedule(DB.getSchedule()); };
    window.addEventListener('sc_update', onUpdate);
    return function(){ window.removeEventListener('sc_update', onUpdate); };
  }, []);

  function completePendingSession(pending) {
    var xp = pending.xp_value || 60;
    awardXP(xp, pending.duration_minutes||15, pending.type||'drill', pending.type==='drill'?'drill':pending.type==='mental'?'mental':null, pending.ref_id||null);
    if (pending.schedule_id) DB.updateSession(pending.schedule_id, { status:'complete' });
    setSchedule(DB.getSchedule());
    showToast('✓ Session complete! +' + xp + ' XP');
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(function(){ setToast(''); }, 2500);
  }

  function handleComplete(sess) {
    DB.updateSession(sess.id, { status:'complete' });
    var xp = sess.xp_value||60;
    awardXP(xp, sess.duration_minutes||15, sess.type, sess.type==='drill'?'drill':sess.type==='mental'?'mental':null, sess.ref_id||null);
    // If it's a drill/mental ref, navigate into it
    if (sess.type==='drill' && sess.ref_id) {
      sessionStorage.setItem('sc_pending_session', JSON.stringify(Object.assign({},sess,{schedule_id:sess.id})));
      nav('DrillDetail', { id: sess.ref_id });
    } else if (sess.type==='mental' && sess.ref_id) {
      sessionStorage.setItem('sc_pending_session', JSON.stringify(Object.assign({},sess,{schedule_id:sess.id})));
      nav('MentalPlayer', { id: sess.ref_id });
    } else if (sess.type==='fitness' && sess.ref_id) {
      sessionStorage.setItem('sc_pending_session', JSON.stringify(Object.assign({},sess,{schedule_id:sess.id})));
      nav('WorkoutDetail', { id: sess.ref_id });
    } else {
      fireConfetti();
      setSchedule(DB.getSchedule());
      showToast('✓ '+sess.title+' complete! +'+xp+' XP');
      window.dispatchEvent(new CustomEvent('sc_update'));
    }
  }

  function handleDelete(id) { DB.deleteSession(id); setSchedule(DB.getSchedule()); }

  function handleSave(sess) {
    DB.addSession(sess);
    setSchedule(DB.getSchedule());
    setShowAdd(false);
    showToast('Added: ' + sess.title);
  }

  // iCal export
  function exportICal() {
    var sessions = (schedule.sessions||[]);
    if (!sessions.length) { alert('No sessions to export.'); return; }
    var lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SmartCrick AI//EN','CALSCALE:GREGORIAN'];
    sessions.forEach(function(s) {
      var dtStr = s.date.replace(/-/g,'') + 'T' + (s.time||'070000').replace(':','') + '00';
      lines.push('BEGIN:VEVENT','UID:smartcrick-'+s.id,'DTSTART:'+dtStr,'DURATION:PT'+(s.duration_minutes||20)+'M','SUMMARY:'+s.title+' [SmartCrick]','DESCRIPTION:+'+s.xp_value+' XP · '+s.type,'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    var blob = new Blob([lines.join('\r\n')],{type:'text/calendar'});
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a'); a.href=url; a.download='SmartCrick_Schedule.ics'; a.click();
    URL.revokeObjectURL(url);
  }

  // Build 7-day array for current week
  var days = Array.from({length:7}, function(_,i) {
    var d = addDays(monday, i), ds = dateStr(d);
    var sessions = (schedule.sessions||[]).filter(function(s){ return s.date===ds; }).sort(function(a,b){ return (a.time||'00:00').localeCompare(b.time||'00:00'); });
    return { date:ds, label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], sessions:sessions, isToday:ds===today };
  });

  var totalXP   = (schedule.sessions||[]).reduce(function(s,x){ return s+(x.xp_value||0); }, 0);
  var doneSess  = (schedule.sessions||[]).filter(function(s){ return s.status==='complete'; }).length;
  var totalSess = (schedule.sessions||[]).length;

  return h('div', { style:{ paddingBottom:100, background:'#0d1117', minHeight:'100dvh' } },
    A.CrickTip ? h(A.CrickTip, { context: 'schedule', trigger: 'first_visit' }) : null,
    h(PageHeader, { title:'Training Schedule', subtitle:'Plan · Track · Improve', gradient:'linear-gradient(135deg,#0f766e,#0891b2)',
      actions: h('div', { style:{display:'flex',gap:8} },
        h('button', { onClick:exportICal, title:'Export to calendar', style:{background:'rgba(255,255,255,.12)',border:'none',borderRadius:8,padding:'7px 10px',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700} }, '📅 iCal'),
        h('button', { onClick:function(){setAddDate(today);setShowAdd(true);}, 'aria-label':'Add session', style:{background:'rgba(255,255,255,.15)',border:'none',borderRadius:8,padding:'7px 12px',color:'#fff',cursor:'pointer',fontSize:12,fontWeight:700} }, '+ Add'),
      ),
    }),

    h(WeekNav, { monday:monday, onPrev:function(){setMonday(addDays(monday,-7));}, onNext:function(){setMonday(addDays(monday,7));} }),

    // Week stats
    h('div', { style:{ display:'flex', gap:8, padding:'12px 16px', borderBottom:'1px solid rgba(48,54,61,.9)' } },
      [{label:'Sessions',value:totalSess,color:'#8b949e'},{label:'Completed',value:doneSess,color:'#16a34a'},{label:'Total XP',value:totalXP,color:'#f59e0b'}].map(function(s){
        return h('div', { key:s.label, style:{ flex:1, textAlign:'center', padding:'8px', background:'rgba(22,27,34,.9)', borderRadius:8, border:'1px solid rgba(48,54,61,.9)' } },
          h('div', { style:{ fontSize:18, fontWeight:800, color:s.color } }, s.value),
          h('div', { style:{ fontSize:10, color:'#484f58', fontWeight:700, textTransform:'uppercase', marginTop:2 } }, s.label),
        );
      })
    ),

    // Daily Net row (today only)
    h('div', { style:{ padding:'10px 16px 0' } },
      h(DailyNetScheduleRow),
    ),

    // Days
    h('div', { style:{ padding:'0 16px 16px' } },
      days.map(function(day) {
        return h('div', { key:day.date, style:{ marginBottom:12 } },
          // Day header
          h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 } },
            h('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
              h('div', { style:{ width:32, height:32, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, background:day.isToday?'#16a34a':'rgba(48,54,61,.5)', color:'#fff' } }, day.label),
              h('div', { style:{ fontSize:12, color:day.isToday?'#4ade80':'#6b7280', fontWeight:day.isToday?700:500 } }, day.date.slice(5).replace('-','/')),
              day.isToday && h('span', { style:{ fontSize:10, background:'rgba(22,163,74,.15)', color:'#16a34a', padding:'2px 7px', borderRadius:4, fontWeight:700 } }, 'TODAY'),
            ),
            h('button', { onClick:function(){setAddDate(day.date);setShowAdd(true);},'aria-label':'Add session on '+day.date, style:{ background:'rgba(48,54,61,.4)', border:'1px solid rgba(75,85,99,.4)', borderRadius:6, padding:'3px 9px', color:'#6b7280', cursor:'pointer', fontSize:11, fontWeight:700 } }, '+ Add'),
          ),
          // Sessions
          day.sessions.length===0
            ? h('div', { style:{ padding:'8px 12px', borderRadius:8, border:'1px dashed rgba(48,54,61,.6)', color:'#374151', fontSize:12, textAlign:'center' } }, 'Rest or add a session')
            : day.sessions.map(function(sess) {
                return h(SessionCard, { key:sess.id, sess:sess, onComplete:handleComplete, onDelete:handleDelete });
              }),
        );
      })
    ),

    // Add modal
    showAdd && h(AddSessionModal, { date:addDate, onSave:handleSave, onClose:function(){setShowAdd(false);} }),

    // Toast
    toast && h('div', { role:'status','aria-live':'polite', style:{ position:'fixed', bottom:90, left:16, right:16, zIndex:90, background:'#16a34a', color:'#fff', padding:'12px 18px', borderRadius:10, fontWeight:700, fontSize:14, textAlign:'center', boxShadow:'0 6px 24px rgba(22,163,74,.5)' } }, toast),
  );
}

A.SchedulePage = SchedulePage;
console.log('[SC] app-schedule.js v2.1 — SchedulePage + Daily Net row ready');
})();
