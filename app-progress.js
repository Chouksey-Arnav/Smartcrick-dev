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

  return h('div',{style:{paddingBottom:100, background:'#0a0f1e', minHeight:'100dvh'}},
    h(PageHeader,{title:'My Progress',subtitle:'Your complete training stats',gradient:'linear-gradient(135deg,#0f172a,#064e3b)'}),
    h('div',{style:{padding:'16px', display:'flex', flexDirection:'column', gap:16}},

      // Level card
      h('div',{style:{padding:20, borderRadius:16, background:'rgba(16,22,36,0.95)', border:'1px solid rgba(16,185,129,0.2)', boxShadow:'0 4px 24px rgba(0,0,0,0.3)', position:'relative', overflow:'hidden'}},
        h('div',{style:{position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#22c55e,#0d9488)', borderRadius:'16px 16px 0 0'}}),
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}},
          h('div',{},
            h('div',{style:{fontSize:26, fontWeight:900, color:'#f8fafc'}},`Level ${info.level}`),
            h('div',{style:{color:'#4ade80',fontWeight:700,fontSize:14}},info.name)
          ),
          h('div',{style:{textAlign:'right'}},
            h('div',{style:{fontSize:22, fontWeight:900, color:'#f8fafc'}},`${(progress.total_xp||0).toLocaleString()} XP`),
            info.next&&h('div',{style:{fontSize:12,color:'#64748b', marginTop:2}},`${info.xpToNext.toLocaleString()} to next level`)
          )
        ),
        h(LevelBar,{totalXP:progress.total_xp||0}),
        h('div',{style:{display:'flex',justifyContent:'space-between',fontSize:11,color:'#475569',marginTop:6}},
          h('span',{},`Lv.${info.level}: ${info.min.toLocaleString()}`),
          info.next&&h('span',{},`Lv.${info.level+1}: ${info.next.min.toLocaleString()}`)
        )
      ),

      // Stats grid
      h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}},
        [{label:'Drills Done',val:progress.drills_done||0,color:'text-blue-400',icon:'target'},
         {label:'Mental Sessions',val:progress.mental_done||0,color:'text-purple-400',icon:'brain'},
         {label:'Workouts',val:progress.workouts_done||0,color:'text-orange-400',icon:'dumbbell'},
         {label:'Practice Mins',val:progress.practice_minutes||0,color:'text-teal-400',icon:'clock'},
         {label:'Best Streak',val:`${progress.longest_streak||0}d`,color:'text-red-400',icon:'flame'},
         {label:'Scheduled Done',val:schedStats.done,color:'text-emerald-400',icon:'calendar'},
        ].map(s=>h(StatCard,{key:s.label,...s}))
      ),

      // 7-day chart
      h('div',{style:{padding:16, borderRadius:16, background:'rgba(16,22,36,0.95)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 16px rgba(0,0,0,0.25)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          h('span',{style:{fontSize:14,fontWeight:700,color:'#e2e8f0'}},'7-Day XP'),
          h('span',{style:{fontSize:12,fontWeight:700,color:'#4ade80'}},`${xpDays.reduce((s,d)=>s+d.xp,0)} total`)
        ),
        h(XPChart,{days:xpDays})
      ),

      // 30-day heatmap
      h('div',{style:{padding:16, borderRadius:16, background:'rgba(16,22,36,0.95)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 16px rgba(0,0,0,0.25)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}},
          h('span',{style:{fontSize:14,fontWeight:700,color:'#e2e8f0'}},'30-Day Activity'),
          h('div',{className:'flex items-center gap-1.5'},[0,1,2,3,4].map(l=>h('div',{key:l,className:`heatmap-cell heatmap-${l}`,style:{width:12,height:12}})))
        ),
        h(Heatmap,{days:hmap})
      ),

      // Badges
      h('div',{style:{padding:16, borderRadius:16, background:'rgba(16,22,36,0.95)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 16px rgba(0,0,0,0.25)'}},
        h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}},
          h('div',{style:{display:'flex',alignItems:'center',gap:8}},
            h(Icon,{n:'award',cls:'w-4 h-4',style:{color:'#8b949e'}}),
            h('span',{style:{fontSize:14,fontWeight:700,color:'#e6edf3'}},'Badges')
          ),
          h('span',{style:{fontSize:'0.75rem',color:'#64748b'}},`${badges.length} of ${Object.keys(BADGE_DEFS).length}`)
        ),
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}},
          Object.entries(BADGE_DEFS).map(([id,def])=>{
            const earned=badges.includes(id);
            return h('div',{key:id,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:6,padding:12,borderRadius:12,textAlign:'center',
                background:earned?'rgba(16,185,129,0.08)':'rgba(15,23,42,0.4)',
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
      h('div',{style:{padding:16, borderRadius:16, background:'rgba(16,22,36,0.95)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 4px 16px rgba(0,0,0,0.25)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:16}},
          h(Icon,{n:'layers',cls:'w-4 h-4',style:{color:'#8b949e'}}),
          h('span',{style:{fontSize:14,fontWeight:700,color:'#e6edf3'}},'Skill Paths')
        ),
        SKILL_PATHS.map(path=>{
          const pp=(progress.skill_path_progress||{})[path.id]||{};
          const done=Object.values(pp).filter(Boolean).length;
          const pct=done/path.levels.length*100;
          return h('div',{key:path.id,style:{marginBottom:12}},
            h('div',{style:{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:6}},
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
