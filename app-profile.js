// ================================================================
// SmartCrick AI — Profile, Settings, Leaderboard, Goals
// app-profile.js
// ================================================================
(function () {
'use strict';
const { createElement:h, useState } = React;
const { DB, getLevelInfo, awardXP, useTheme } = window.SC_APP;
const { Icon, LevelBar, PageHeader } = window.SC_APP;

// ================================================================
// PROFILE PAGE
// ================================================================
function ProfilePage() {
  const [user,setUser]=useState(DB.getUser);
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState(user);
  const progress=DB.getProgress();
  const info=getLevelInfo(progress.total_xp||0);
  const save=()=>{ DB.setUser(form); setUser(form); setEditing(false); };

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'My Profile',subtitle:'Your cricketer identity',
      gradient:'linear-gradient(135deg,#0f766e,#0d9488)',
      actions:h('button',{onClick:()=>editing?save():setEditing(true),
        className:'px-4 py-2 rounded-xl text-white text-sm font-bold',
        style:{background:'rgba(255,255,255,0.15)'}},editing?'Save':'Edit')
    }),
    h('div',{className:'px-4 pt-5 space-y-4'},
      h('div',{className:'flex items-center gap-4 p-5 rounded-2xl',style:{background:'rgba(30,41,59,0.7)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{style:{width:80,height:80,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'linear-gradient(135deg,#16a34a,#0d9488)'}},
          h(Icon,{n:'bat',cls:'w-10 h-10 text-white'})
        ),
        h('div',{className:'flex-1'},
          h('div',{className:'text-xl font-black text-white'},user.name||'Cricketer'),
          h('div',{style:{color:'#34d399',fontWeight:700,fontSize:'0.875rem'}},`${info.name} — Level ${info.level}`),
          h('div',{className:'text-xs text-slate-400 mt-0.5'},user.role||'All-Rounder'),
          h('div',{className:'mt-3'},h(LevelBar,{totalXP:progress.total_xp||0,compact:true}))
        )
      ),
      editing && h('div',{className:'space-y-3'},
        [{key:'name',label:'Full Name',ph:'Your name'},{key:'role',label:'Playing Role',ph:'Batsman, Bowler...'},
         {key:'team',label:'Team / Club',ph:'Your team'},{key:'country',label:'Country',ph:'Your country'}].map(f=>
          h('div',{key:f.key},
            h('label',{className:'text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5'},f.label),
            h('input',{type:'text',placeholder:f.ph,value:form[f.key]||'',onChange:e=>setForm({...form,[f.key]:e.target.value}),
              className:'w-full px-4 py-3 rounded-xl text-sm text-white outline-none',
              style:{background:'rgba(30,41,59,0.7)',border:'1px solid rgba(51,65,85,0.6)'}})
          )
        ),
        h('div',{className:'flex gap-3'},
          h('button',{onClick:save,className:'btn-primary flex-1'},'Save'),
          h('button',{onClick:()=>setEditing(false),className:'btn-secondary flex-1'},'Cancel')
        )
      ),
      !editing && h('div',{className:'grid grid-cols-2 gap-3'},
        [{label:'Role',val:user.role||'Not set'},{label:'Team',val:user.team||'Not set'},
         {label:'Country',val:user.country||'Not set'},{label:'Total XP',val:(progress.total_xp||0).toLocaleString()}].map(s=>
          h('div',{key:s.label,className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
            h('div',{className:'text-xs text-slate-500 uppercase font-bold tracking-wider'},s.label),
            h('div',{className:'font-bold text-white text-sm mt-1'},s.val)
          )
        )
      )
    )
  );
}

// ================================================================
// SETTINGS PAGE
// ================================================================
function SettingsPage() {
  const {dark,toggle}=useTheme();
  const [msg,setMsg]=useState('');
  const clearAll=()=>{
    if(!window.confirm('Reset all progress? This cannot be undone.')) return;
    DB.del('progress');DB.del('xp_log');DB.del('schedule');
    window.dispatchEvent(new CustomEvent('sc_update'));
    setMsg('Progress reset successfully!');
  };
  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Settings',gradient:'linear-gradient(135deg,#334155,#1e293b)'}),
    h('div',{className:'px-4 pt-5 space-y-3'},
      msg && h('div',{className:'p-3 rounded-xl text-sm font-semibold text-center',
        style:{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.3)',color:'#34d399'}},msg),
      h('div',{className:'flex items-center justify-between p-4 rounded-2xl',
        style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('div',{},
          h('div',{className:'font-bold text-white text-sm'},'Dark Mode'),
          h('div',{className:'text-xs text-slate-500'},'Easy on the eyes')
        ),
        h('button',{onClick:toggle,style:{width:48,height:24,borderRadius:'9999px',
          background:dark?'#10b981':'#475569',position:'relative',border:'none',cursor:'pointer'}},
          h('div',{style:{width:20,height:20,borderRadius:'50%',background:'#fff',position:'absolute',
            top:2,left:2,transition:'transform .2s',transform:dark?'translateX(24px)':'translateX(0)',
            boxShadow:'0 2px 4px rgba(0,0,0,0.3)'}})
        )
      ),
      h('button',{onClick:clearAll,className:'w-full p-4 rounded-2xl text-left',
        style:{background:'rgba(239,68,68,0.06)',border:'1px solid rgba(239,68,68,0.3)'}},
        h('div',{className:'font-bold text-red-400 text-sm'},'Reset All Progress'),
        h('div',{className:'text-xs text-slate-500'},'Clears XP, drills, workouts, and schedule data')
      )
    )
  );
}

// ================================================================
// LEADERBOARD PAGE
// ================================================================
function LeaderboardPage() {
  const progress=DB.getProgress();
  const info=getLevelInfo(progress.total_xp||0);
  const entries=[
    {n:'Virat K.',lv:9,xp:52400,streak:47,flag:'🇮🇳'},{n:'Josh H.',lv:8,xp:38200,streak:31,flag:'🇦🇺'},
    {n:'Babar A.',lv:8,xp:36800,streak:28,flag:'🇵🇰'},{n:'Rohit S.',lv:7,xp:29100,streak:22,flag:'🇮🇳'},
    {n:'Ben S.',lv:7,xp:27300,streak:19,flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿'},
    {n:'You',lv:info.level,xp:progress.total_xp||0,streak:progress.current_streak||0,isYou:true}
  ].sort((a,b)=>b.xp-a.xp).map((e,i)=>({...e,rank:i+1}));

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Leaderboard',subtitle:'Top SmartCrick athletes worldwide',gradient:'linear-gradient(135deg,#b45309,#92400e)'}),
    h('div',{className:'px-4 pt-5 space-y-2.5'},
      entries.map(e=>h('div',{key:e.rank,className:'flex items-center gap-4 p-4 rounded-2xl',
        style:{background:e.isYou?'rgba(16,185,129,0.08)':'rgba(30,41,59,0.6)',
          border:`1px solid ${e.isYou?'rgba(16,185,129,0.3)':'rgba(51,65,85,0.5)'}`}},
        h('div',{style:{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.75rem',fontWeight:900,
          background:e.rank<=3?'linear-gradient(135deg,#f59e0b,#d97706)':'rgba(30,41,59,0.8)',
          color:e.rank<=3?'#fff':'#94a3b8'}},`#${e.rank}`),
        h('div',{style:{fontSize:16,lineHeight:1}},e.flag||''),
        h('div',{className:'flex-1'},
          h('div',{style:{fontWeight:800,fontSize:'0.875rem',color:e.isYou?'#34d399':'#f8fafc'}},e.isYou?`${e.n} (You)`:e.n),
          h('div',{style:{fontSize:'0.75rem',color:'#64748b'}},`Level ${e.lv} · ${e.xp.toLocaleString()} XP`)
        ),
        h('div',{style:{fontSize:'0.75rem',fontWeight:800,color:'#fb923c'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:4}},
            h(Icon,{n:'flame',cls:'w-3.5 h-3.5',style:{color:'#fb923c'}}),`${e.streak}d`)
        )
      ))
    )
  );
}

// ================================================================
// GOALS PAGE
// ================================================================
function GoalsPage() {
  const [goals,setGoals]=useState(()=>DB.getGoals());
  const [newGoal,setNewGoal]=useState('');

  const add=()=>{
    if(!newGoal.trim()) return;
    const g=[...goals,{id:Date.now(),text:newGoal.trim(),done:false,date:new Date().toISOString().slice(0,10)}];
    DB.saveGoals(g);setGoals(g);setNewGoal('');
  };

  const toggle=id=>{
    const g=goals.map(x=>x.id===id?{...x,done:!x.done}:x);
    DB.saveGoals(g);setGoals(g);
    if(!goals.find(x=>x.id===id)?.done) awardXP(25,0,'goal');
  };

  const del=id=>{ const g=goals.filter(x=>x.id!==id); DB.saveGoals(g); setGoals(g); };

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Goals',subtitle:'Set and track your training targets',gradient:'linear-gradient(135deg,#15803d,#16a34a)'}),
    h('div',{className:'px-4 pt-5 space-y-4'},
      h('div',{className:'flex gap-2'},
        h('input',{type:'text',placeholder:'Add a training goal...',value:newGoal,onChange:e=>setNewGoal(e.target.value),
          onKeyDown:e=>e.key==='Enter'&&add(),
          className:'flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none',
          style:{background:'rgba(30,41,59,0.7)',border:'1px solid rgba(51,65,85,0.6)'}}),
        h('button',{onClick:add,className:'btn-primary px-4 py-3 rounded-xl'},h(Icon,{n:'plus',cls:'w-5 h-5'}))
      ),
      goals.length===0 && h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',textAlign:'center'}},
        h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
          h(Icon,{n:'target',cls:'w-7 h-7',style:{color:'#484f58'}})
        ),
        h('h3',{style:{fontSize:15,fontWeight:700,color:'#8b949e',marginBottom:8}},'No goals yet'),
        h('p',{style:{fontSize:13,color:'#484f58',maxWidth:240,lineHeight:1.6}},'Add your first cricket training goal to stay focused and track progress')
      ),
      goals.map(g=>h('div',{key:g.id,className:'flex items-center gap-3 p-4 rounded-2xl',
        style:{background:g.done?'rgba(16,185,129,0.06)':'rgba(30,41,59,0.6)',
          border:`1px solid ${g.done?'rgba(16,185,129,0.25)':'rgba(51,65,85,0.5)'}`}},
        h('button',{onClick:()=>toggle(g.id),style:{width:28,height:28,borderRadius:'50%',
          border:`2px solid ${g.done?'#10b981':'rgba(51,65,85,0.8)'}`,background:g.done?'#10b981':'transparent',
          display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer'}},
          g.done && h(Icon,{n:'check',cls:'w-4 h-4 text-white'})
        ),
        h('span',{style:{flex:1,fontSize:'0.875rem',color:g.done?'#64748b':'#f8fafc',fontWeight:600,
          textDecoration:g.done?'line-through':'none'}},g.text),
        h('button',{onClick:()=>del(g.id),style:{color:'#ef4444',background:'none',border:'none',cursor:'pointer',padding:'0.25rem'}},
          h(Icon,{n:'x',cls:'w-4 h-4'})
        )
      ))
    )
  );
}

Object.assign(window.SC_APP, { ProfilePage, SettingsPage, LeaderboardPage, GoalsPage });
console.log('[SC] app-profile ready');
})();
