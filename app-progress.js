// ================================================================
// SmartCrick AI — Progress Page
// app-progress.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useCallback } = React;
const { DB, getLevelInfo } = window.SC_APP;
const { SKILL_PATHS, BADGE_DEFS } = window.SC_APP;
const { Icon, LevelBar, StatCard, XPChart, Heatmap, PageHeader } = window.SC_APP;

function ProgressPage() {
  const [progress,setProgress]=useState(()=>DB.getProgress());
  const [xpDays,setXpDays]=useState(()=>DB.getXPLast7Days());
  const [hmap,setHmap]=useState(()=>DB.getActivityHeatmap());

  const refresh=useCallback(()=>{
    setProgress(DB.getProgress());setXpDays(DB.getXPLast7Days());setHmap(DB.getActivityHeatmap());
  },[]);

  useEffect(()=>{
    window.addEventListener('sc_update',refresh);window.addEventListener('focus',refresh);
    return()=>{window.removeEventListener('sc_update',refresh);window.removeEventListener('focus',refresh);};
  },[refresh]);

  const info=getLevelInfo(progress.total_xp||0);
  const badges=progress.badges||[];
  const schedStats={
    done:(DB.getSchedule().sessions||[]).filter(s=>s.status==='complete').length,
    total:(DB.getSchedule().sessions||[]).length
  };

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'My Progress',subtitle:'Your complete training stats',gradient:'linear-gradient(135deg,#064e3b,#065f46)'}),
    h('div',{className:'px-4 pt-5 space-y-5'},

      // Level card
      h('div',{className:'p-5 rounded-2xl',style:{background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(13,148,136,0.06))',border:'1px solid rgba(16,185,129,0.3)'}},
        h('div',{className:'flex items-center justify-between mb-4'},
          h('div',{},
            h('div',{className:'text-2xl font-black text-white'},`Level ${info.level}`),
            h('div',{style:{color:'#34d399',fontWeight:700,fontSize:'0.875rem'}},info.name)
          ),
          h('div',{className:'text-right'},
            h('div',{className:'text-xl font-black text-white'},`${(progress.total_xp||0).toLocaleString()} XP`),
            info.next&&h('div',{style:{fontSize:'0.75rem',color:'#64748b'}},`${info.xpToNext.toLocaleString()} to next level`)
          )
        ),
        h(LevelBar,{totalXP:progress.total_xp||0}),
        h('div',{className:'flex justify-between text-xs mt-2',style:{color:'#475569'}},
          h('span',{},`Lv.${info.level}: ${info.min.toLocaleString()}`),
          info.next&&h('span',{},`Lv.${info.level+1}: ${info.next.min.toLocaleString()}`)
        )
      ),

      // Stats grid
      h('div',{className:'grid grid-cols-2 gap-3'},
        [{label:'Drills Done',val:progress.drills_done||0,color:'text-blue-400',icon:'target'},
         {label:'Mental Sessions',val:progress.mental_done||0,color:'text-purple-400',icon:'brain'},
         {label:'Workouts',val:progress.workouts_done||0,color:'text-orange-400',icon:'dumbbell'},
         {label:'Practice Mins',val:progress.practice_minutes||0,color:'text-teal-400',icon:'clock'},
         {label:'Best Streak',val:`${progress.longest_streak||0}d`,color:'text-red-400',icon:'flame'},
         {label:'Scheduled Done',val:schedStats.done,color:'text-emerald-400',icon:'calendar'},
        ].map(s=>h(StatCard,{key:s.label,...s}))
      ),

      // 7-day chart
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{className:'flex justify-between items-center mb-3'},
          h('span',{className:'text-sm font-bold text-white'},'7-Day XP'),
          h('span',{style:{fontSize:'0.75rem',fontWeight:700,color:'#34d399'}},`${xpDays.reduce((s,d)=>s+d.xp,0)} total`)
        ),
        h(XPChart,{days:xpDays})
      ),

      // 30-day heatmap
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{className:'flex justify-between items-center mb-3'},
          h('span',{className:'text-sm font-bold text-white'},'30-Day Activity'),
          h('div',{className:'flex items-center gap-1.5'},[0,1,2,3,4].map(l=>h('div',{key:l,className:`heatmap-cell heatmap-${l}`,style:{width:12,height:12}})))
        ),
        h(Heatmap,{days:hmap})
      ),

      // Badges
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{className:'flex justify-between items-center mb-4'},
          h('div',{style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:'award',cls:'w-4 h-4',style:{color:'#8b949e'}}),
            h('span',{style:{fontSize:14,fontWeight:700,color:'#e6edf3'}},'Badges')
          ),
          h('span',{style:{fontSize:'0.75rem',color:'#64748b'}},`${badges.length} of ${Object.keys(BADGE_DEFS).length}`)
        ),
        h('div',{className:'grid grid-cols-3 gap-2.5'},
          Object.entries(BADGE_DEFS).map(([id,def])=>{
            const earned=badges.includes(id);
            return h('div',{key:id,className:'flex flex-col items-center gap-1.5 p-3 rounded-xl text-center',
              style:{background:earned?'rgba(16,185,129,0.08)':'rgba(15,23,42,0.4)',
                border:`1px solid ${earned?'rgba(16,185,129,0.25)':'rgba(51,65,85,0.3)'}`,
                opacity:earned?1:0.4}},
              h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',width:'100%'}},
                earned?h(Icon,{n:def.icon,cls:'w-6 h-6',style:{color:'#e6edf3'}}):h(Icon,{n:'lock',cls:'w-5 h-5',style:{color:'#484f58'}})
              ),
              h('span',{style:{fontSize:'0.65rem',fontWeight:800,color:earned?'#f8fafc':'#64748b'}},def.label)
            );
          })
        )
      ),

      // Skill path progress
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:16}},
          h(Icon,{n:'layers',cls:'w-4 h-4',style:{color:'#8b949e'}}),
          h('span',{style:{fontSize:14,fontWeight:700,color:'#e6edf3'}},'Skill Paths')
        ),
        SKILL_PATHS.map(path=>{
          const pp=(progress.skill_path_progress||{})[path.id]||{};
          const done=Object.values(pp).filter(Boolean).length;
          const pct=done/path.levels.length*100;
          return h('div',{key:path.id,className:'mb-3 last:mb-0'},
            h('div',{className:'flex justify-between text-xs mb-1.5'},
              h('div',{style:{display:'flex',alignItems:'center',gap:6}},
                h(Icon,{n:path.icon||'bat',cls:'w-3.5 h-3.5',style:{color:'#8b949e'}}),
                h('span',{style:{color:'#8b949e',fontWeight:600,fontSize:13}},path.title)
              ),
              h('span',{style:{color:path.accent,fontWeight:800}},`${done}/${path.levels.length}`)
            ),
            h('div',{style:{height:'6px',background:'rgba(51,65,85,0.6)',borderRadius:'9999px',overflow:'hidden'}},
              h('div',{style:{width:`${pct}%`,height:'100%',background:path.accent,borderRadius:'9999px',transition:'width .6s'}})
            )
          );
        })
      )
    )
  );
}

window.SC_APP.ProgressPage = ProgressPage;
console.log('[SC] app-progress ready');
})();
