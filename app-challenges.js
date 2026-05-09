// ================================================================
// SmartCrick AI — 30-Day Challenge
// app-challenges.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect } = React;
const { DB, awardXP, DAY30 } = window.SC_APP;
const { Icon, PageHeader } = window.SC_APP;

function ThirtyDayPage() {
  const [progress,setProgress]=useState(()=>DB.getProgress());
  const completed=progress.thirtyDay_completed||{};
  const today=new Date().toISOString().slice(0,10);
  const doneCnt=Object.keys(completed).length;
  const pct=Math.round(doneCnt/30*100);

  useEffect(()=>{
    const refresh=()=>setProgress(DB.getProgress());
    window.addEventListener('sc_update',refresh);
    return ()=>window.removeEventListener('sc_update',refresh);
  },[]);

  const markDay=day=>{
    if(completed[day.day]) return;
    const currentP=DB.getProgress();
    if(currentP.thirtyDay_completed?.[day.day]) { setProgress(currentP); return; }
    const p=DB.getProgress();
    if(!p.thirtyDay_completed) p.thirtyDay_completed={};
    p.thirtyDay_completed[day.day]=today;
    DB.saveProgress(p);
    awardXP(day.xp,15,'30day');
    setProgress(DB.getProgress());
  };

  const phases=['Foundation','Development','Integration','Performance'];

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'30-Day Challenge',subtitle:'Build the habit. Transform your game.',gradient:'linear-gradient(135deg,#d97706,#b45309)'}),
    h('div',{className:'px-4 pt-5 space-y-5'},

      // Progress summary
      h('div',{className:'p-5 rounded-2xl',style:{background:'rgba(217,119,6,0.1)',border:'1px solid rgba(217,119,6,0.3)'}},
        h('div',{className:'flex items-center justify-between mb-3'},
          h('div',{},
            h('div',{className:'text-2xl font-black text-white'},`Day ${doneCnt} / 30`),
            h('div',{style:{color:'#fbbf24',fontWeight:700,fontSize:'0.875rem'}},
              doneCnt===30?'🏆 Challenge Complete!':doneCnt===0?'Begin your journey':'Keep going — great work!')
          ),
          h('div',{style:{width:56,height:56,borderRadius:'50%',border:'4px solid #f59e0b',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'#f59e0b',fontSize:'0.875rem'}},
            `${pct}%`)
        ),
        h('div',{style:{height:'8px',background:'rgba(51,65,85,0.6)',borderRadius:'9999px',overflow:'hidden'}},
          h('div',{style:{width:`${pct}%`,height:'100%',background:'linear-gradient(to right,#f59e0b,#d97706)',borderRadius:'9999px',transition:'width .6s'}})
        )
      ),

      // Phases grid
      phases.map((phase,pi)=>{
        const pDays=DAY30.filter(d=>d.phase===phase);
        return h('div',{key:phase},
          h('div',{className:'flex items-center gap-2 mb-3'},
            h('div',{style:{width:8,height:8,borderRadius:'50%',background:'#f59e0b'}}),
            h('span',{style:{fontSize:'0.7rem',fontWeight:800,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.1em'}},
              `Week ${pi+1} — ${phase}`)
          ),
          h('div',{className:'grid grid-cols-7 gap-1.5'},
            pDays.map(d=>{
              const isDone=!!completed[d.day];
              const isNext=!isDone&&Object.keys(completed).length===d.day-1;
              return h('button',{key:d.day,onClick:()=>markDay(d),disabled:isDone,title:`Day ${d.day}: ${d.title}`,
                className:'flex flex-col items-center justify-center py-2 rounded-xl active:scale-95 transition-all',
                style:{aspectRatio:'1',
                  background:isDone?'#10b981':isNext?'rgba(245,158,11,0.15)':d.type==='rest'?'rgba(15,23,42,0.5)':'rgba(30,41,59,0.6)',
                  border:isNext?'2px solid #f59e0b':isDone?'2px solid #059669':'2px solid rgba(51,65,85,0.4)'}},
                h('span',{style:{fontSize:'0.75rem',fontWeight:900,
                  color:isDone?'#fff':isNext?'#f59e0b':d.type==='rest'?'#64748b':'#94a3b8'}},
                  isDone?'✓':d.type==='rest'?'😴':d.day)
              );
            })
          )
        );
      }),

      // Next up card
      (()=>{
        const next=DAY30[doneCnt];
        if(!next||doneCnt===30) return null;
        return h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.7)',border:'1px solid rgba(245,158,11,0.3)'}},
          h('div',{style:{fontSize:'0.7rem',fontWeight:800,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.5rem'}},
            `Up Next — Day ${next.day}`),
          h('div',{className:'font-black text-white text-base mb-1'},next.title),
          h('div',{style:{fontSize:'0.75rem',color:'#64748b',marginBottom:'1rem'}},`Phase: ${next.phase} · +${next.xp} XP`),
          h('button',{onClick:()=>markDay(next),className:'btn-primary w-full py-3 text-sm'},`Complete Day ${next.day}`)
        );
      })()
    )
  );
}

window.SC_APP.ThirtyDayPage = ThirtyDayPage;
console.log('[SC] app-challenges ready');
})();
