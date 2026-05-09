// ================================================================
// SmartCrick AI — Drills Page + Drill Detail Page
// app-drills.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const { nav, DB, awardXP, fireConfetti } = window.SC_APP;
const { DRILLS, DRILL_CATS, LVL_BADGE, SCHED_TYPES } = window.SC_APP;
const { Icon, XPBadge, PremiumBadge, EmptyState, PageHeader } = window.SC_APP;

// ================================================================
// DRILLS PAGE
// ================================================================
function DrillsPage() {
  const [cat,setCat]=useState('batting');
  const [search,setSearch]=useState('');
  const [progress,setProgress]=useState(()=>DB.getProgress());
  useEffect(()=>{
    const refresh=()=>setProgress(DB.getProgress());
    window.addEventListener('sc_update',refresh);
    window.addEventListener('focus',refresh);
    return ()=>{ window.removeEventListener('sc_update',refresh); window.removeEventListener('focus',refresh); };
  },[]);
  const completed=progress.completed_drills||[];
  const catDef=DRILL_CATS.find(c=>c.id===cat);
  const filtered=DRILLS.filter(d=>d.category===cat&&(search===''||d.title.toLowerCase().includes(search.toLowerCase())));

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Cricket Drills',subtitle:`${DRILLS.length} professional drills`,
      gradient:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`}),

    // Category pills
    h('div',{className:'flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide'},
      DRILL_CATS.map(c=>
        h('button',{key:c.id,onClick:()=>setCat(c.id),
          className:'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all',
          style:cat===c.id?{background:`linear-gradient(135deg,${c.from},${c.to})`,color:'#fff',boxShadow:`0 4px 16px ${c.from}40`}
            :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'}
        },
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5 flex-shrink-0',style:{color:cat===c.id?'#fff':c.text}}),
          ' ', c.label)
      )
    ),

    // Search
    h('div',{className:'px-4 mb-3'},
      h('div',{className:'relative'},
        h(Icon,{n:'search',cls:'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2',style:{color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search drills...',value:search,onChange:e=>setSearch(e.target.value),
          className:'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none',
          style:{background:'rgba(22,27,34,0.9)',border:`1px solid ${search?catDef?.from+'60':'rgba(48,54,61,0.9)'}`,color:'#e6edf3'}
        })
      )
    ),

    // Drill list
    h('div',{className:'px-4 space-y-2.5'},
      filtered.length===0
        ? h(EmptyState,{icon:catDef?.icon||'bat',title:'No drills found',desc:'Try a different search term'})
        : filtered.map(d=>{
          const lvl=LVL_BADGE[d.skill_level]||LVL_BADGE.beginner;
          const done=completed.includes(d.id);
          return h('button',{key:d.id,onClick:()=>nav('DrillDetail',{id:d.id}),
            className:'w-full text-left p-4 rounded-2xl transition-all active:scale-[.99] pro-card',
            style:{background:'rgba(22,27,34,0.9)',border:`1px solid ${done?'rgba(22,163,74,0.3)':'rgba(48,54,61,0.9)'}`,borderRadius:10}
          },
            h('div',{className:'flex items-start gap-3'},
              h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0,position:'relative',
                background:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`}},
                h(Icon,{n:catDef?.icon||'bat',cls:'w-5 h-5 text-white'}),
                done && h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,
                  borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},
                  h(Icon,{n:'check',cls:'w-3 h-3 text-white'})
                )
              ),
              h('div',{className:'flex-1 min-w-0'},
                h('div',{className:'flex items-start justify-between gap-2'},
                  h('h3',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',lineHeight:1.3}},d.title),
                  d.is_premium && h(PremiumBadge)
                ),
                h('p',{style:{fontSize:11,color:'#484f58',marginTop:4,overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}},d.description),
                h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:8}},
                  h('span',{style:{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,
                    background:lvl.bg,border:`1px solid ${lvl.border}`,color:lvl.color,
                    textTransform:'uppercase',letterSpacing:'0.04em'}},lvl.label),
                  h('span',{style:{fontSize:11,color:'#484f58'}},`${d.duration_minutes} min`),
                  h(XPBadge,{xp:d.xp_value})
                )
              )
            )
          );
        })
    )
  );
}

// ================================================================
// DRILL DETAIL PAGE
// ================================================================
function DrillDetailPage({ params }) {
  const drill=DRILLS.find(d=>d.id===params?.id);
  const [done,setDone]=useState(false);
  const completing=useRef(false);
  const catDef=DRILL_CATS.find(c=>c.id===drill?.category);

  if(!drill) return h('div',{className:'pb-28 flex flex-col items-center justify-center',style:{minHeight:'80vh'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'bat',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('div',{className:'font-bold text-white mb-4'},'Drill not found'),
    h('button',{onClick:()=>nav('Drills'),className:'btn-primary px-6 py-3'},'Back to Drills')
  );

  const complete=()=>{
    if(completing.current) return;
    completing.current=true;
    awardXP(drill.xp_value,drill.duration_minutes,'drill','drill',drill.id);
    fireConfetti(); setDone(true);
  };

  if(done) return h('div',{className:'flex flex-col items-center justify-center text-center px-5 pb-28',style:{minHeight:'100vh'}},
    h('div',{style:{width:64,height:64,borderRadius:16,background:'rgba(22,163,74,0.15)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'circleCheck',cls:'w-8 h-8',style:{color:'#16a34a'}})
    ),
    h('h2',{className:'text-2xl font-black text-white mb-2'},'Drill Complete!'),
    h('p',{className:'text-slate-400 mb-3'},drill.title),
    h(XPBadge,{xp:drill.xp_value}),
    h('div',{className:'mt-6 flex flex-col gap-3 w-full max-w-xs'},
      h('button',{onClick:()=>nav('Drills'),className:'btn-primary'},'More Drills'),
      h('button',{onClick:()=>setDone(false),className:'btn-secondary'},'Do Again')
    )
  );

  return h('div',{className:'pb-28'},
    h(PageHeader,{
      title:drill.title,
      subtitle:`${drill.duration_minutes} min · ${drill.xp_value} XP`,
      gradient:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`,
      onBack:()=>nav('Drills')
    }),

    h('div',{className:'px-4 pt-5 space-y-4'},
      // Video
      drill.video_id && h('div',{},
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'},'Video Tutorial'),
        h('div',{style:{position:'relative',aspectRatio:'16/9',background:'#0f172a',borderRadius:'1rem',overflow:'hidden'}},
          h('iframe',{src:`https://www.youtube.com/embed/${drill.video_id}?modestbranding=1&rel=0&color=white`,
            title:`${drill.title} tutorial`,
            allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen:true,loading:'lazy',
            style:{position:'absolute',inset:0,width:'100%',height:'100%',border:0}
          })
        ),
        h('a',{href:`https://www.youtube.com/watch?v=${drill.video_id}`,target:'_blank',rel:'noopener noreferrer',
          className:'flex items-center gap-1 text-xs mt-2',style:{color:'#64748b'}},
          h(Icon,{n:'extLink',cls:'w-3.5 h-3.5'}),'Open in YouTube'
        )
      ),

      // Description
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('p',{className:'text-sm text-slate-300 leading-relaxed'},drill.description)
      ),

      // Steps
      h('div',{},
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-3'},`${drill.steps.length} Steps`),
        h('div',{className:'space-y-2'},
          drill.steps.map((s,i)=>
            h('div',{key:i,className:'flex items-start gap-3 p-3 rounded-xl',
              style:{background:'rgba(15,23,42,0.5)',border:'1px solid rgba(51,65,85,0.4)'}},
              h('div',{className:'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5',
                style:{background:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`}},i+1),
              h('p',{className:'text-sm text-slate-300 leading-relaxed flex-1'},s)
            )
          )
        )
      ),

      // Tip
      drill.tips && h('div',{className:'flex items-start gap-3 p-4 rounded-2xl',
        style:{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.25)'}},
        h(Icon,{n:'sparkles',cls:'w-4 h-4 flex-shrink-0',style:{color:'#16a34a'}}),
        h('div',{},
          h('p',{className:'text-xs font-black text-emerald-400 uppercase tracking-wider mb-1'},'Coach Tip'),
          h('p',{className:'text-sm',style:{color:'#6ee7b7'}},drill.tips)
        )
      ),

      // Target metric
      drill.target_metric && h('div',{className:'flex items-start gap-3 p-4 rounded-2xl',
        style:{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.25)'}},
        h(Icon,{n:'target',cls:'w-4 h-4 flex-shrink-0',style:{color:'#484f58'}}),
        h('div',{},
          h('p',{className:'text-xs font-black text-blue-400 uppercase tracking-wider mb-1'},'Success Target'),
          h('p',{className:'text-sm text-blue-300'},drill.target_metric)
        )
      ),

      // Add to schedule
      h('button',{
        onClick:()=>{
          const today=new Date().toISOString().slice(0,10);
          DB.addSession({
            id:'sch_'+Date.now(),date:today,time:'',
            type:'drill',title:drill.title,ref_id:drill.id,
            duration_minutes:drill.duration_minutes,xp_value:drill.xp_value,
            status:'pending',notes:'',color:SCHED_TYPES.drill.color
          });
          window.dispatchEvent(new CustomEvent('sc_update'));
          alert('Added to today\'s schedule! ✅');
        },
        className:'w-full py-3 rounded-2xl text-sm font-bold text-blue-400 text-center',
        style:{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.25)'}
      },'📅 Add to Today\'s Schedule'),

      h('button',{onClick:complete,className:'btn-primary w-full py-4 text-base font-black'},
        h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),` Mark Complete (+${drill.xp_value} XP)`
      )
    )
  );
}

Object.assign(window.SC_APP, { DrillsPage, DrillDetailPage });
console.log('[SC] app-drills ready');
})();
