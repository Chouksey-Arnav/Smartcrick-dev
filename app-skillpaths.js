// ================================================================
// SmartCrick AI — Skill Paths Page
// app-skillpaths.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState } = React;
const { nav, DB, awardXP } = window.SC_APP;
const { SKILL_PATHS, generateWeekPlan, dateStr, addDays, SCHED_TYPES } = window.SC_APP;
const { Icon, XPBadge, PageHeader } = window.SC_APP;

function WeekAccordion({ week, pathAccent }) {
  const [open,setOpen]=useState(week.week===1);
  return h('div',{className:'rounded-2xl overflow-hidden',style:{border:'1px solid rgba(51,65,85,0.5)'}},
    h('button',{onClick:()=>setOpen(o=>!o),
      className:'w-full flex items-center justify-between p-4 text-left',
      style:{background:'rgba(30,41,59,0.6)'}},
      h('div',{},
        h('div',{className:'font-bold text-white text-sm'},week.theme),
        h('div',{className:'text-xs text-slate-500 mt-0.5'},`${week.days.filter(d=>!d.isRest).length} training days`)
      ),
      h(Icon,{n:open?'chevU':'chevD',cls:'w-5 h-5',style:{color:'#64748b'}})
    ),
    open && h('div',{style:{background:'rgba(15,23,42,0.4)',borderTop:'1px solid rgba(51,65,85,0.4)'}},
      week.days.map(day=>h('div',{key:day.day,className:'p-4',style:{borderBottom:'1px solid rgba(51,65,85,0.2)'}},
        h('div',{className:'flex items-center justify-between mb-2'},
          h('span',{style:{fontSize:'0.875rem',fontWeight:800,color:'#fff'}},day.label),
          day.isRest
            ? h('div',{style:{display:'flex',alignItems:'center',gap:4}},
              h(Icon,{n:'heart',cls:'w-3 h-3',style:{color:'#484f58'}}),
              h('span',{style:{fontSize:'0.65rem',color:'#484f58'}},'Rest')
            )
            : h('span',{style:{fontSize:'0.7rem',fontWeight:800,color:pathAccent}},`+${day.totalXP} XP`)
        ),
        !day.isRest && h('div',{className:'space-y-1.5'},
          day.activities.map((act,i)=>h('div',{key:i,className:'flex items-center gap-2'},
            h(Icon,{n:act.type==='drill'?'bat':act.type==='mental'?'brain':'dumbbell',cls:'w-3.5 h-3.5',style:{color:'#484f58'}}),
            h('div',{className:'flex-1'},
              h('div',{style:{fontSize:'0.75rem',fontWeight:700,color:'#cbd5e1'}},act.title),
              h('div',{style:{fontSize:'0.7rem',color:'#64748b'}},`${act.duration} · +${act.xp} XP`)
            )
          ))
        )
      ))
    )
  );
}

function SkillPathsPage() {
  const [pathId, setPathId] = useState(null);
  const [levelId, setLevelId] = useState(null);
  const [weekPlan, setWeekPlan] = useState(null);
  const progress = DB.getProgress();
  const skillProg = progress.skill_path_progress || {};

  function importToSchedule(plan) {
    const monday = new Date();
    monday.setHours(0,0,0,0);
    const day = monday.getDay();
    monday.setDate(monday.getDate() + (day===0?-6:1-day));
    let added = 0;
    plan.forEach(week=>{
      if(week.week!==1) return;
      week.days.forEach(day=>{
        if(day.isRest) return;
        const d = addDays(monday, day.day-1);
        const ds = dateStr(d);
        day.activities.forEach((act,i)=>{
          DB.addSession({
            id:'sch_'+Date.now()+'_'+day.day+'_'+i,
            date:ds, time:i===0?'07:00':i===1?'17:00':'19:00',
            type:act.type, title:act.title, ref_id:act.id||null,
            duration_minutes:parseInt(act.duration)||20, xp_value:act.xp,
            status:'pending', notes:'From Skill Path', color:SCHED_TYPES[act.type]?.color||'#64748b'
          });
          added++;
        });
      });
    });
    window.dispatchEvent(new CustomEvent('sc_update'));
    alert(`✅ ${added} sessions imported to this week's schedule!`);
  }

  if(!pathId) return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Skill Paths',subtitle:'Structured programs for every discipline',
      gradient:'linear-gradient(135deg,#7e22ce,#4f46e5)'}),
    h('div',{className:'px-4 pt-5 space-y-4'},
      SKILL_PATHS.map(path=>{
        const pp=skillProg[path.id]||{};
        const doneCount=Object.values(pp).filter(Boolean).length;
        const pct=doneCount/path.levels.length*100;
        return h('button',{key:path.id,onClick:()=>{setPathId(path.id);setLevelId(null);setWeekPlan(null);},
          className:'w-full text-left p-5 rounded-2xl active:scale-[.99] transition-all',
          style:{background:'rgba(30,41,59,0.7)',border:`1px solid ${path.accent}30`}},
          h('div',{style:{height:'3px',background:`linear-gradient(to right,${path.accent},transparent)`,marginBottom:'1rem',borderRadius:'2px'}}),
          h('div',{className:'flex items-center gap-4'},
            h('div',{style:{position:'relative',width:56,height:56,flexShrink:0}},
              h('svg',{width:56,height:56,viewBox:'0 0 56 56',style:{position:'absolute',inset:0,transform:'rotate(-90deg)'}},
                h('circle',{cx:28,cy:28,r:22,fill:'none',stroke:'rgba(51,65,85,0.6)',strokeWidth:4}),
                h('circle',{cx:28,cy:28,r:22,fill:'none',stroke:path.accent,strokeWidth:4,
                  strokeDasharray:2*Math.PI*22,strokeDashoffset:2*Math.PI*22*(1-pct/100),
                  strokeLinecap:'round',style:{transition:'stroke-dashoffset .6s'}})
              ),
              h('div',{style:{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center'}},
                h(Icon,{n:path.icon||'bat',cls:'w-6 h-6 text-white'})
              )
            ),
            h('div',{className:'flex-1'},
              h('h3',{className:'font-black text-white text-base'},path.title),
              h('p',{className:'text-xs mt-0.5 mb-2',style:{color:'#64748b'}},path.desc),
              h('div',{className:'flex items-center gap-3'},
                h('div',{className:'flex-1 h-2 rounded-full',style:{background:'rgba(51,65,85,0.6)',overflow:'hidden'}},
                  h('div',{style:{width:`${pct}%`,height:'100%',background:path.accent,borderRadius:'9999px',transition:'width .6s'}})
                ),
                h('span',{style:{fontSize:'0.7rem',fontWeight:800,color:path.accent}},`${doneCount}/${path.levels.length}`)
              )
            )
          )
        );
      })
    )
  );

  const path=SKILL_PATHS.find(p=>p.id===pathId);
  if(!path) return null;
  const grad=`linear-gradient(135deg,${path.accent},${path.accent}88)`;

  if(!levelId) return h('div',{className:'pb-28'},
    h(PageHeader,{title:path.title,subtitle:path.desc,gradient:grad,onBack:()=>setPathId(null)}),
    h('div',{className:'px-4 pt-5 space-y-3'},
      h('p',{className:'text-sm text-slate-400 mb-2'},'Choose your level to begin your structured 5-week program:'),
      path.levels.map((lv,i)=>{
        const pp=skillProg[path.id]||{};
        const unlocked=i===0||(pp[path.levels[i-1].id]);
        const done=pp[lv.id];
        return h('button',{key:lv.id,
          onClick:()=>{if(!unlocked)return;setLevelId(lv.id);setWeekPlan(generateWeekPlan(path.id,lv.id));},
          className:'w-full text-left p-5 rounded-2xl transition-all',
          style:{background:done?'rgba(16,185,129,0.08)':unlocked?'rgba(30,41,59,0.7)':'rgba(15,23,42,0.5)',
            border:`2px solid ${done?'rgba(16,185,129,0.4)':unlocked?`${path.accent}40`:'rgba(51,65,85,0.3)'}`,
            opacity:unlocked?1:0.5}},
          h('div',{className:'flex items-center gap-4'},
            h('div',{style:{width:52,height:52,borderRadius:'0.875rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              background:done?'#10b981':unlocked?path.accent:'rgba(51,65,85,0.5)'}},
              done ? h(Icon,{n:'circleCheck',cls:'w-7 h-7 text-white'}) : h(Icon,{n:lv.icon||'bat',cls:'w-7 h-7 text-white'})
            ),
            h('div',{className:'flex-1'},
              h('div',{className:'flex items-center gap-2'},
                h('h3',{className:'font-black text-white'},lv.label),
                !unlocked && h(Icon,{n:'lock',cls:'w-3 h-3',style:{color:'#484f58',flexShrink:0}}),
                done && h('div',{style:{display:'flex',alignItems:'center',gap:4}},
                  h(Icon,{n:'check',cls:'w-3 h-3',style:{color:'#4ade80'}}),
                  h('span',{style:{fontSize:'0.7rem',fontWeight:700,color:'#4ade80'}},'Complete')
                )
              ),
              h('p',{className:'text-xs text-slate-400 mt-0.5'},lv.desc),
              h('div',{className:'flex items-center gap-2 mt-2'},
                h('span',{style:{fontSize:'0.75rem',fontWeight:800,color:path.accent}},`+${lv.xpPerDay} XP/day`),
                h('span',{style:{fontSize:'0.75rem',color:'#475569'}},'· 5-week program')
              )
            )
          )
        );
      })
    )
  );

  const lv=path.levels.find(l=>l.id===levelId);
  if(!lv||!weekPlan) return null;

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:lv.label,subtitle:path.title,gradient:grad,onBack:()=>setLevelId(null)}),
    h('div',{className:'px-4 pt-5'},
      h('div',{className:'flex gap-2 mb-5'},
        h('button',{onClick:()=>importToSchedule(weekPlan),
          className:'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white',
          style:{background:'linear-gradient(135deg,#0f766e,#0d9488)'}},
          h(Icon,{n:'calendar',cls:'w-4 h-4'}),'Import to Schedule'
        ),
        h('button',{onClick:()=>{
          const p=DB.getProgress();
          if(!p.skill_path_progress) p.skill_path_progress={};
          if(!p.skill_path_progress[path.id]) p.skill_path_progress[path.id]={};
          p.skill_path_progress[path.id][levelId]=true; DB.saveProgress(p);
          awardXP(lv.xpPerDay*5,30,'skill_path'); setLevelId(null);
        },className:'flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-bold',
          style:{background:'rgba(30,41,59,0.7)',border:'1px solid rgba(51,65,85,0.5)',color:'#94a3b8'}
        },h(Icon,{n:'check',cls:'w-4 h-4'}),'Mark Done')
      ),
      h('div',{className:'space-y-3'},
        weekPlan.map(week=>h(WeekAccordion,{key:week.week,week,pathAccent:path.accent}))
      )
    )
  );
}

Object.assign(window.SC_APP, { WeekAccordion, SkillPathsPage });
console.log('[SC] app-skillpaths ready');
})();
