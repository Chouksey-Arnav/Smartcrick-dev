// ================================================================
// SmartCrick AI — Schedule Page (full training planner)
// app-schedule.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useCallback } = React;
const { nav, DB, awardXP, fireConfetti } = window.SC_APP;
const { DRILLS, MENTAL_SESSIONS, WORKOUTS, SCHED_TYPES, generateSmartSchedule } = window.SC_APP;
const { getWeekMonday, dateStr, addDays, formatDate, isToday } = window.SC_APP;
const { Icon, XPBadge, PageHeader } = window.SC_APP;

function SchedulePage() {
  const [weekStart, setWeekStart] = useState(()=>dateStr(getWeekMonday(new Date())));
  const [selectedDay, setSelectedDay] = useState(()=>new Date().toISOString().slice(0,10));
  const [schedule, setSchedule] = useState(()=>DB.getSchedule());
  const [view, setView] = useState('week');
  const [addStep, setAddStep] = useState(0);
  const [addType, setAddType] = useState('');
  const [addPick, setAddPick] = useState(null);
  const [addTime, setAddTime] = useState('');
  const [addNote, setAddNote] = useState('');
  const [genStep, setGenStep] = useState(0);
  const [genFocus, setGenFocus] = useState('');
  const [genDays, setGenDays] = useState(4);
  const [genInt, setGenInt] = useState('moderate');
  const [genPreview, setGenPreview] = useState(null);
  const [notif, setNotif] = useState('');

  const refresh = useCallback(()=>setSchedule(DB.getSchedule()), []);
  useEffect(()=>{
    window.addEventListener('sc_update', refresh);
    return()=>window.removeEventListener('sc_update', refresh);
  },[refresh]);

  function showNotif(msg) { setNotif(msg); setTimeout(()=>setNotif(''), 3000); }

  const monday = new Date(weekStart+'T00:00:00');
  const weekDays = Array.from({length:7},(_,i)=>{
    const d = addDays(monday,i);
    return { date:dateStr(d), label:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], num:d.getDate() };
  });

  const daySessions = (schedule.sessions||[]).filter(s=>s.date===selectedDay)
    .sort((a,b)=>a.time.localeCompare(b.time));

  function dayCount(date) { return (schedule.sessions||[]).filter(s=>s.date===date).length; }
  function dayDone(date) { return (schedule.sessions||[]).filter(s=>s.date===date&&s.status==='complete').length; }

  const weekSessions = DB.getSessionsForWeek(weekStart);
  const weekXP = weekSessions.filter(s=>s.status==='pending').reduce((a,s)=>a+s.xp_value,0);
  const weekDoneCount = weekSessions.filter(s=>s.status==='complete').length;

  function completeSession(id) {
    const sess = (schedule.sessions||[]).find(s=>s.id===id);
    if(!sess||sess.status==='complete') return;
    DB.updateSession(id,{status:'complete'});
    awardXP(sess.xp_value, sess.duration_minutes, 'schedule_'+sess.type);
    fireConfetti();
    refresh();
    showNotif(`✅ +${sess.xp_value} XP earned!`);
  }

  function skipSession(id) { DB.updateSession(id,{status:'skipped'}); refresh(); }
  function deleteSession(id) { DB.deleteSession(id); refresh(); showNotif('Session removed'); }
  function undoSession(id) { DB.updateSession(id,{status:'pending'}); refresh(); }

  function startSession(sess) {
    if(sess.type==='drill'&&sess.ref_id) nav('DrillDetail',{id:sess.ref_id});
    else if(sess.type==='mental'&&sess.ref_id) nav('MentalPlayer',{id:sess.ref_id});
    else if(sess.type==='fitness'&&sess.ref_id) nav('WorkoutDetail',{id:sess.ref_id});
    else nav('Timer');
  }

  function saveNewSession() {
    if(!addType) return;
    const tc=SCHED_TYPES[addType];
    let title='Custom Session', refId=null, dur=30, xp=50;
    if(addPick){
      if(addType==='drill'){const d=DRILLS.find(x=>x.id===addPick);if(d){title=d.title;refId=d.id;dur=d.duration_minutes;xp=d.xp_value;}}
      else if(addType==='mental'){const m=MENTAL_SESSIONS.find(x=>x.id===addPick);if(m){title=m.title;refId=m.id;dur=Math.floor(m.duration_seconds/60);xp=m.xp_value;}}
      else if(addType==='fitness'){const w=WORKOUTS.find(x=>x.id===addPick);if(w){title=w.name;refId=w.id;dur=w.duration_minutes;xp=w.xp_value;}}
    } else if(addType==='match'){title='Match Day';dur=180;xp=200;}
    else if(addType==='rest'){title='Rest & Recovery Day';dur=0;xp=20;}
    DB.addSession({id:'sch_'+Date.now(),date:selectedDay,time:addTime,type:addType,title,ref_id:refId,duration_minutes:dur,xp_value:xp,status:'pending',notes:addNote,color:tc.color});
    refresh();
    setView('week'); setAddStep(0); setAddType(''); setAddPick(null); setAddTime(''); setAddNote('');
    showNotif('Session added! 📅');
  }

  function runGenerator() {
    const sessions = generateSmartSchedule(genFocus, genDays, genInt, weekStart);
    setGenPreview(sessions); setGenStep(3);
  }

  function confirmGenerate() {
    const existing = DB.getSchedule();
    const filtered = (existing.sessions||[]).filter(s=>{
      const wd=DB.getSessionsForWeek(weekStart).map(x=>x.id);
      return !wd.includes(s.id)||s.status==='complete';
    });
    existing.sessions = [...filtered, ...genPreview];
    DB.saveSchedule(existing);
    refresh(); setView('week'); setGenStep(0); setGenFocus(''); setGenPreview(null);
    showNotif('🤖 Smart schedule generated!');
  }

  // ── Add session view ──────────────────────────────────────────
  if(view==='add') return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Add Session',subtitle:formatDate(selectedDay),
      gradient:'linear-gradient(135deg,#0f766e,#0d9488)',
      onBack:()=>{ setView('week');setAddStep(0);setAddType('');setAddPick(null);}}),
    h('div',{className:'px-4 pt-5'},
      h('div',{className:'flex gap-2 mb-5'},
        ['Type','Content','Details'].map((s,i)=>h('div',{key:s,className:'flex items-center gap-2'},
          h('div',{className:'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black',
            style:{background:addStep>=i?'linear-gradient(135deg,#0f766e,#0d9488)':'rgba(30,41,59,0.8)',
              color:addStep>=i?'#fff':'#64748b',border:addStep>=i?'none':'1px solid rgba(51,65,85,0.5)'}},i+1),
          h('span',{style:{fontSize:'0.75rem',fontWeight:700,color:addStep===i?'#5eead4':'#64748b'}},s),
          i<2 && h('div',{style:{width:'1.5rem',height:'2px',background:addStep>i?'#0d9488':'rgba(51,65,85,0.5)',borderRadius:'1px'}})
        ))
      ),
      addStep===0 && h('div',{},
        h('h3',{className:'text-base font-black text-white mb-3'},'What type of session?'),
        h('div',{className:'space-y-2'},
          Object.entries(SCHED_TYPES).map(([id,tc])=>h('button',{key:id,
            onClick:()=>{setAddType(id);setAddStep(id==='match'||id==='rest'||id==='custom'?2:1);},
            className:'w-full flex items-center gap-4 p-4 rounded-2xl text-left active:scale-[.99] transition-all',
            style:{background:tc.bg,border:`1px solid ${tc.border}`}},
            h('div',{style:{width:40,height:40,borderRadius:8,background:'rgba(0,0,0,0.25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
              h(Icon,{n:tc.icon||'calendar',cls:'w-5 h-5',style:{color:tc.color}})
            ),
            h('div',{className:'flex-1'},h('div',{className:'font-bold text-white text-sm'},tc.label)),
            h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#475569'}})
          ))
        )
      ),
      addStep===1 && addType && h('div',{},
        h('h3',{className:'text-base font-black text-white mb-3'},
          addType==='drill'?'Choose a drill:':addType==='mental'?'Choose a session:':'Choose a workout:'),
        h('div',{className:'space-y-2 max-h-80 overflow-y-auto sidebar-scroll pr-1'},
          (addType==='drill'?DRILLS:addType==='mental'?MENTAL_SESSIONS.filter(m=>!m.is_premium):WORKOUTS.slice(0,30))
            .map(item=>{
              const isD=addType==='drill';const isM=addType==='mental';
              const label=isD?item.title:isM?item.title:item.name;
              const meta=isD?`${item.duration_minutes} min`:`${isM?Math.floor(item.duration_seconds/60):item.duration_minutes} min`;
              return h('button',{key:item.id,
                onClick:()=>{setAddPick(item.id);setAddStep(2);},
                className:'w-full flex items-center gap-3 p-3 rounded-xl text-left',
                style:{background:addPick===item.id?'rgba(15,118,110,0.2)':'rgba(30,41,59,0.6)',
                  border:addPick===item.id?'1px solid rgba(13,148,136,0.5)':'1px solid rgba(51,65,85,0.4)'}},
                h('div',{className:'flex-1'},
                  h('div',{className:'text-sm font-bold text-white'},label),
                  h('div',{className:'flex items-center gap-2 mt-1'},
                    h('span',{className:'text-xs',style:{color:'#64748b'}},meta),
                    h(XPBadge,{xp:item.xp_value})
                  )
                ),
                h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#475569'}})
              );
            })
        ),
        h('button',{onClick:()=>{setAddStep(0);setAddType('');},className:'flex items-center gap-2 mt-4 text-sm text-slate-400 font-semibold'},
          h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back')
      ),
      addStep===2 && h('div',{},
        h('h3',{className:'text-base font-black text-white mb-4'},'Session details'),
        h('div',{className:'space-y-4'},
          h('div',{},
            h('label',{className:'text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2'},'Time (optional)'),
            h('input',{type:'time',value:addTime,onChange:e=>setAddTime(e.target.value),
              className:'w-full px-4 py-3 rounded-xl text-sm text-white outline-none',
              style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}})
          ),
          h('div',{},
            h('label',{className:'text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2'},'Notes (optional)'),
            h('textarea',{placeholder:'E.g. Focus on elbow position...',value:addNote,onChange:e=>setAddNote(e.target.value),rows:3,
              className:'w-full px-4 py-3 rounded-xl text-sm text-white outline-none resize-none',
              style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}})
          ),
          h('button',{onClick:saveNewSession,className:'btn-primary w-full py-4 text-base font-black'},
            h(Icon,{n:'plus',cls:'w-5 h-5'}),' Add to Schedule'
          ),
          h('button',{onClick:()=>setAddStep(addType==='drill'||addType==='mental'||addType==='fitness'?1:0),
            className:'w-full text-center text-sm text-slate-400 font-semibold py-2'},'← Back')
        )
      )
    )
  );

  // ── Generator view ────────────────────────────────────────────
  if(view==='generate') {
    const FOCUS=[
      {id:'batting',label:'Batting',icon:'bat'},{id:'bowling',label:'Bowling',icon:'ball'},
      {id:'fielding',label:'Fielding',icon:'navigation'},{id:'allrounder',label:'All-Round',icon:'star'}
    ];
    const INTENSITY=[
      {id:'light',label:'Light',icon:'activity',desc:'2 sessions/day max'},
      {id:'moderate',label:'Moderate',icon:'zap',desc:'2-3 sessions/day'},
      {id:'intense',label:'Intense',icon:'flame',desc:'3 sessions/day'}
    ];
    return h('div',{className:'pb-28'},
      h(PageHeader,{title:'Smart Generator',subtitle:'AI-powered weekly schedule',
        gradient:'linear-gradient(135deg,#4c1d95,#5b21b6)',
        onBack:()=>{setView('week');setGenStep(0);setGenFocus('');setGenPreview(null);}}),
      h('div',{className:'px-4 pt-5'},
        h('div',{className:'flex gap-2 mb-5'},
          ['Focus','Days','Intensity','Preview'].map((s,i)=>h('div',{key:s,className:'flex items-center gap-1.5'},
            h('div',{className:'w-5 h-5 rounded-full flex items-center justify-center',
              style:{fontSize:'0.65rem',fontWeight:900,
                background:genStep>=i?'linear-gradient(135deg,#6d28d9,#7c3aed)':'rgba(30,41,59,0.8)',
                color:genStep>=i?'#fff':'#64748b'}},i+1),
            h('span',{style:{fontSize:'0.7rem',fontWeight:700,color:genStep===i?'#c084fc':'#64748b',whiteSpace:'nowrap'}},s),
            i<3 && h('div',{style:{flex:1,height:'2px',background:genStep>i?'#7c3aed':'rgba(51,65,85,0.5)',borderRadius:'1px',minWidth:'1rem'}})
          ))
        ),
        genStep===0 && h('div',{},
          h('h3',{className:'text-base font-black text-white mb-3'},'Which area needs most work?'),
          h('div',{className:'grid grid-cols-2 gap-3'},
            FOCUS.map(f=>h('button',{key:f.id,onClick:()=>{setGenFocus(f.id);setGenStep(1);},
              style:{display:'flex',flexDirection:'column',alignItems:'center',gap:8,padding:'20px 16px',
                borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',cursor:'pointer'}},
              h('div',{style:{width:40,height:40,borderRadius:8,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}},
                h(Icon,{n:f.icon,cls:'w-5 h-5',style:{color:'#8b949e'}})
              ),
              h('span',{style:{fontSize:12,fontWeight:700,color:'#e6edf3'}},f.label)
            ))
          )
        ),
        genStep===1 && h('div',{},
          h('h3',{className:'text-base font-black text-white mb-1'},'Days per week?'),
          h('p',{className:'text-xs text-slate-400 mb-4'},'How many days can you train?'),
          h('div',{className:'flex gap-3 flex-wrap'},
            [3,4,5,6,7].map(n=>h('button',{key:n,onClick:()=>{setGenDays(n);setGenStep(2);},
              className:'flex-1 py-4 rounded-2xl font-black text-lg active:scale-95 transition-all',
              style:{background:genDays===n?'linear-gradient(135deg,#6d28d9,#7c3aed)':'rgba(30,41,59,0.6)',
                color:'#fff',border:'1px solid rgba(51,65,85,0.5)',minWidth:'50px'}},n)
          )),
          h('button',{onClick:()=>setGenStep(0),className:'flex items-center gap-2 mt-4 text-sm text-slate-400 font-semibold'},h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back')
        ),
        genStep===2 && h('div',{},
          h('h3',{className:'text-base font-black text-white mb-3'},'Session intensity?'),
          h('div',{className:'space-y-2'},
            INTENSITY.map(i=>h('button',{key:i.id,onClick:()=>{setGenInt(i.id);runGenerator();},
              className:'w-full flex items-center gap-4 p-4 rounded-2xl text-left',
              style:{background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
              h('div',{style:{width:36,height:36,borderRadius:7,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                h(Icon,{n:i.icon||'activity',cls:'w-4 h-4',style:{color:'#8b949e'}})
              ),
              h('div',{className:'flex-1'},h('div',{style:{fontSize:13,fontWeight:700,color:'#e6edf3'}},i.label),h('div',{style:{fontSize:11,color:'#484f58',marginTop:2}},i.desc)),
              h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#374151'}})
            ))
          ),
          h('button',{onClick:()=>setGenStep(1),className:'flex items-center gap-2 mt-4 text-sm text-slate-400 font-semibold'},h(Icon,{n:'arrowL',cls:'w-4 h-4'}),'Back')
        ),
        genStep===3 && genPreview && h('div',{},
          h('div',{className:'flex items-center justify-between mb-4'},
            h('div',{},
              h('h3',{className:'text-base font-black text-white'},'Preview'),
              h('p',{className:'text-xs text-slate-400'},`${genPreview.length} sessions · ${genPreview.reduce((s,x)=>s+x.xp_value,0)} XP available`)
            ),
            h('button',{onClick:()=>setGenStep(2),className:'text-xs text-slate-400 font-semibold'},'Change')
          ),
          h('div',{className:'space-y-2 max-h-72 overflow-y-auto sidebar-scroll pr-1'},
            genPreview.map((s,i)=>{
              const tc=SCHED_TYPES[s.type]||SCHED_TYPES.custom;
              return h('div',{key:i,style:{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,background:tc.bg,border:`1px solid ${tc.border}`}},
                h('div',{style:{width:32,height:32,borderRadius:6,background:'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                  h(Icon,{n:tc.icon||'calendar',cls:'w-4 h-4',style:{color:tc.color}})
                ),
                h('div',{className:'flex-1'},
                  h('div',{className:'text-xs font-bold text-white'},s.title),
                  h('div',{className:'text-xs',style:{color:'rgba(255,255,255,0.5)'}},`${formatDate(s.date)} ${s.time?'· '+s.time:''} · ${s.duration_minutes} min`)
                ),
                h(XPBadge,{xp:s.xp_value})
              );
            })
          ),
          h('div',{className:'flex gap-3 mt-4'},
            h('button',{onClick:()=>{setGenStep(0);setGenPreview(null);},className:'btn-secondary flex-1'},'Regenerate'),
            h('button',{onClick:confirmGenerate,className:'btn-primary flex-1 font-black'},'Confirm Schedule')
          )
        )
      )
    );
  }

  // ── Main week view ────────────────────────────────────────────
  return h('div',{className:'pb-28'},
    h('div',{style:{background:'linear-gradient(135deg,#0f766e,#0d9488,#0891b2)',
      paddingTop:'max(4.5rem,env(safe-area-inset-top))',paddingBottom:'1.25rem',
      paddingLeft:'1.25rem',paddingRight:'1.25rem',position:'relative',overflow:'hidden'}},
      h('div',{style:{position:'absolute',top:'-40%',right:'-15%',width:'220px',height:'220px',background:'rgba(255,255,255,0.07)',borderRadius:'50%',pointerEvents:'none'}}),
      h('div',{className:'relative z-10'},
        h('div',{className:'flex items-center justify-between mb-4'},
          h('div',{},
            h('h1',{className:'text-xl font-black text-white'},'Schedule'),
            h('p',{style:{color:'rgba(255,255,255,0.65)',fontSize:'0.8125rem'}},
              `Week of ${new Date(weekStart+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${new Date(addDays(new Date(weekStart+'T00:00:00'),6)+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`)
          ),
          h('button',{onClick:()=>{setView('generate');setGenStep(0);setGenFocus('');setGenPreview(null);},
            className:'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white',
            style:{background:'rgba(255,255,255,0.15)'}},
            h(Icon,{n:'sparkles',cls:'w-3.5 h-3.5'}),'Smart Plan'
          )
        ),
        // Week navigator
        h('div',{className:'flex items-center gap-3'},
          h('button',{onClick:()=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()-7);setWeekStart(dateStr(d));},
            style:{width:34,height:34,borderRadius:'0.625rem',background:'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}},
            h(Icon,{n:'arrowL',cls:'w-4 h-4'})
          ),
          h('div',{className:'flex gap-1.5 flex-1 overflow-x-auto scrollbar-hide'},
            weekDays.map(d=>{
              const isToday2=isToday(d.date);
              const isSel=d.date===selectedDay;
              const cnt=dayCount(d.date);
              const doneC=dayDone(d.date);
              return h('button',{key:d.date,onClick:()=>setSelectedDay(d.date),
                className:'flex-shrink-0 flex flex-col items-center py-2 px-2.5 rounded-xl transition-all',
                style:{minWidth:'40px',background:isSel?'rgba(255,255,255,0.2)':isToday2?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',
                  border:isToday2?'2px solid rgba(255,255,255,0.4)':'2px solid transparent'}},
                h('span',{style:{fontSize:'0.65rem',fontWeight:700,color:isSel?'#fff':isToday2?'#fff':'rgba(255,255,255,0.6)'}},d.label),
                h('span',{style:{fontSize:'1.1rem',fontWeight:900,color:'#fff',margin:'0.1rem 0'}},d.num),
                cnt>0
                  ? h('div',{className:'flex gap-0.5'},
                    Array.from({length:Math.min(cnt,3)}).map((_,i)=>h('div',{key:i,style:{width:5,height:5,borderRadius:'50%',background:i<doneC?'#a7f3d0':'rgba(255,255,255,0.5)'}}))
                  )
                  : h('div',{style:{width:5,height:5,borderRadius:'50%',background:'transparent'}})
              );
            })
          ),
          h('button',{onClick:()=>{const d=new Date(weekStart+'T00:00:00');d.setDate(d.getDate()+7);setWeekStart(dateStr(d));},
            style:{width:34,height:34,borderRadius:'0.625rem',background:'rgba(255,255,255,0.12)',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff'}},
            h(Icon,{n:'chevR',cls:'w-4 h-4'})
          )
        )
      )
    ),

    notif && h('div',{style:{margin:'0.75rem 1rem',padding:'0.75rem 1rem',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'0.875rem',fontSize:'0.875rem',fontWeight:700,color:'#34d399'}},notif),

    h('div',{className:'px-4 pt-4'},
      h('div',{className:'flex items-center justify-between mb-3'},
        h('div',{},
          h('h2',{className:'text-base font-black text-white'},
            isToday(selectedDay)?'Today, '+formatDate(selectedDay).split(',').slice(1).join(',').trim():formatDate(selectedDay)),
          h('p',{style:{fontSize:'0.75rem',color:'#64748b',marginTop:'0.125rem'}},
            daySessions.length===0?'No sessions planned':`${daySessions.length} session${daySessions.length!==1?'s':''} · ${daySessions.reduce((s,x)=>s+x.xp_value,0)} XP`)
        ),
        h('button',{onClick:()=>{setView('add');setAddStep(0);setAddType('');setAddPick(null);setAddTime('');setAddNote('');},
          className:'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold text-white',
          style:{background:'linear-gradient(135deg,#0f766e,#0d9488)'}},
          h(Icon,{n:'plus',cls:'w-4 h-4'}),'Add'
        )
      ),

      daySessions.length===0
        ? h('div',{className:'flex flex-col items-center py-10 text-center',style:{border:'2px dashed rgba(51,65,85,0.5)',borderRadius:'1rem'}},
          h(Icon,{n:'calendar',cls:'w-10 h-10',style:{color:'#484f58'}}),
          h('div',{className:'font-bold text-white text-sm mb-1'},'No sessions planned'),
          h('div',{className:'text-xs text-slate-500 mb-4'},'Add a session or generate a smart schedule'),
          h('div',{className:'flex gap-2'},
            h('button',{onClick:()=>{setView('add');setAddStep(0);},className:'btn-primary text-sm px-4 py-2.5'},h(Icon,{n:'plus',cls:'w-4 h-4'}),' Add Session'),
            h('button',{onClick:()=>setView('generate'),className:'btn-secondary text-sm px-4 py-2.5'},h(Icon,{n:'sparkles',cls:'w-4 h-4'}),' Auto Plan')
          )
        )
        : h('div',{className:'space-y-3'},
          daySessions.map(s=>{
            const tc=SCHED_TYPES[s.type]||SCHED_TYPES.custom;
            const isDone=s.status==='complete';
            const isSkipped=s.status==='skipped';
            return h('div',{key:s.id,className:'rounded-2xl overflow-hidden',
              style:{background:isDone?'rgba(16,185,129,0.06)':isSkipped?'rgba(30,41,59,0.3)':tc.bg,
                border:`1px solid ${isDone?'rgba(16,185,129,0.3)':isSkipped?'rgba(51,65,85,0.3)':tc.border}`,
                opacity:isSkipped?0.6:1}},
              h('div',{style:{height:'4px',background:isDone?'#10b981':isSkipped?'#475569':tc.color}}),
              h('div',{className:'p-4'},
                h('div',{className:'flex items-start gap-3'},
                  h('div',{style:{width:44,height:44,borderRadius:'0.875rem',background:isDone?'rgba(16,185,129,0.15)':'rgba(0,0,0,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
                    isDone?h(Icon,{n:'check',cls:'w-4 h-4 text-white'}):h(Icon,{n:tc.icon||'calendar',cls:'w-4 h-4',style:{color:tc.color}})
                  ),
                  h('div',{className:'flex-1 min-w-0'},
                    h('div',{className:'flex items-start justify-between gap-2'},
                      h('h3',{style:{fontSize:'0.9375rem',fontWeight:800,color:isSkipped?'#64748b':'#f8fafc',lineHeight:1.3}},s.title),
                      isDone && h('span',{style:{fontSize:'0.7rem',fontWeight:700,padding:'0.125rem 0.5rem',background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.25)',borderRadius:4,color:'#4ade80',whiteSpace:'nowrap'}},'Done')
                    ),
                    h('div',{className:'flex items-center gap-2 mt-1.5 flex-wrap'},
                      s.time && h('span',{style:{fontSize:'0.75rem',color:'#94a3b8',fontWeight:600}},s.time),
                      s.time && h('span',{style:{color:'#475569'}}, '·'),
                      h('span',{style:{fontSize:'0.75rem',color:'#94a3b8'}},`${s.duration_minutes} min`),
                      !isDone && h(XPBadge,{xp:s.xp_value}),
                      s.notes && h('span',{style:{fontSize:'0.7rem',color:'#64748b',fontStyle:'italic'}},s.notes)
                    )
                  )
                ),
                !isSkipped && h('div',{className:'flex gap-2 mt-3'},
                  !isDone && h('button',{onClick:()=>startSession(s),
                    className:'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-black transition-all',
                    style:{background:`linear-gradient(135deg,${tc.color}33,${tc.color}22)`,border:`1px solid ${tc.color}60`,color:'#fff'}},
                    h(Icon,{n:'play',cls:'w-4 h-4'}),'Start'
                  ),
                  !isDone && h('button',{onClick:()=>completeSession(s.id),
                    className:'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all',
                    style:{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',color:'#34d399'}},
                    h(Icon,{n:'check',cls:'w-4 h-4'}),'Done'
                  ),
                  isDone && h('button',{onClick:()=>undoSession(s.id),
                    className:'flex items-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold',
                    style:{background:'rgba(30,41,59,0.5)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.4)'}},'Undo'),
                  !isDone && h('button',{onClick:()=>skipSession(s.id),
                    className:'py-2.5 px-3 rounded-xl text-xs font-bold',
                    style:{background:'rgba(30,41,59,0.5)',color:'#94a3b8',border:'1px solid rgba(51,65,85,0.4)'}},'Skip'),
                  h('button',{onClick:()=>deleteSession(s.id),
                    className:'py-2.5 px-3 rounded-xl',
                    style:{background:'rgba(239,68,68,0.08)',color:'#f87171',border:'1px solid rgba(239,68,68,0.2)'}},
                    h(Icon,{n:'trash',cls:'w-4 h-4'})
                  )
                ),
                isSkipped && h('div',{className:'flex items-center justify-between mt-3'},
                  h('span',{style:{fontSize:'0.75rem',color:'#64748b'}},'Skipped'),
                  h('button',{onClick:()=>undoSession(s.id),style:{fontSize:'0.75rem',fontWeight:700,color:'#60a5fa'}},'Restore')
                )
              )
            );
          })
        )
    ),

    // Week summary
    h('div',{className:'mx-4 mt-5 p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.5)',border:'1px solid rgba(51,65,85,0.5)'}},
      h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-3'},'This Week'),
      h('div',{className:'grid grid-cols-3 gap-3 text-center'},
        h('div',{},h('div',{className:'text-xl font-black text-white'},weekSessions.length),h('div',{style:{fontSize:'0.7rem',color:'#64748b',fontWeight:700}},'Total')),
        h('div',{},h('div',{className:'text-xl font-black',style:{color:'#34d399'}},weekDoneCount),h('div',{style:{fontSize:'0.7rem',color:'#64748b',fontWeight:700}},'Done')),
        h('div',{},h('div',{className:'text-xl font-black',style:{color:'#f59e0b'}},weekXP),h('div',{style:{fontSize:'0.7rem',color:'#64748b',fontWeight:700}},'XP Left'))
      )
    ),

    // Import from Skill Path
    h('div',{className:'px-4 mt-4 mb-2'},
      h('button',{onClick:()=>nav('SkillPaths'),
        className:'w-full flex items-center gap-3 p-4 rounded-2xl text-left',
        style:{background:'rgba(30,41,59,0.4)',border:'1px solid rgba(51,65,85,0.4)'}},
        h(Icon,{n:'layers',cls:'w-5 h-5',style:{color:'#8b949e'}}),
        h('div',{className:'flex-1'},
          h('div',{className:'text-sm font-bold text-white'},'Import from Skill Path'),
          h('div',{className:'text-xs text-slate-500'},'Load your active path\'s weekly plan')
        ),
        h(Icon,{n:'chevR',cls:'w-5 h-5',style:{color:'#475569'}})
      )
    )
  );
}

window.SC_APP.SchedulePage = SchedulePage;
console.log('[SC] app-schedule ready');
})();
