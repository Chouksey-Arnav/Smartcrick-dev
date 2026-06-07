// ================================================================
// Save as: app-mental.js
// SmartCrick AI — Mental Training v3.2
// LAYOUT FIX: Content properly fills desktop width.
//   - Scenario grid now uses auto-fill columns (responsive)
//   - Page padding works on both phone and desktop
//   - All sections use consistent padding/max-width logic
// Features: M-A breathing orb, M-B scenarios, M-C routines, M-D rating
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const { nav, DB, awardXP, fireConfetti, fmtTime, getEncouragement } = window.SC_APP;
const { MENTAL_SESSIONS, MENT_CATS } = window.SC_APP;
const { Icon, XPBadge, PremiumBadge, EmptyState, PageHeader } = window.SC_APP;
const MentalRoutineCreatorTab = () => window.SC_APP.MentalRoutineCreatorTab ? h(window.SC_APP.MentalRoutineCreatorTab, null) : null;

// ── M-B: Scenarios ────────────────────────────────────────────────
const MENTAL_SCENARIOS=[
  {id:'nervous', icon:'wind',     label:'Nervous before match',      color:'#f97316',bg:'rgba(249,115,22,0.10)', border:'rgba(249,115,22,0.28)', sessionIds:['m51','m52','m80','m63','m50']},
  {id:'bad_form',icon:'rotateCcw',label:'Duck / bad form',           color:'#ef4444',bg:'rgba(239,68,68,0.10)',  border:'rgba(239,68,68,0.28)',  sessionIds:['m32','m33','m35','m36','m30']},
  {id:'distracted',icon:'crosshair',label:"Can't focus",            color:'#3b82f6',bg:'rgba(59,130,246,0.10)', border:'rgba(59,130,246,0.28)', sessionIds:['m03','m05','m07','m04','m09']},
  {id:'flat',    icon:'moon',     label:'Flat / low confidence',     color:'#8b5cf6',bg:'rgba(139,92,246,0.10)',border:'rgba(139,92,246,0.28)', sessionIds:['m21','m22','m23','m25','m27']},
  {id:'bowling', icon:'ball',     label:'About to bowl',             color:'#10b981',bg:'rgba(16,185,129,0.10)',border:'rgba(16,185,129,0.28)', sessionIds:['m65','m62','m64','m63','m50']},
  {id:'peak',    icon:'zap',      label:'Want peak performance',     color:'#f59e0b',bg:'rgba(245,158,11,0.10)',border:'rgba(245,158,11,0.28)', sessionIds:['m53','m26','m54','m28']},
];

// ── M-C: Routines ─────────────────────────────────────────────────
const MENTAL_ROUTINES=[
  {id:'pre-batting',   title:'Pre-Batting Routine',   icon:'bat',      color:'#3b82f6',bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.3)', desc:'Walk to the crease with calm, confidence and total focus',        sessionIds:['m51','m52','m53'],bonusXP:25,totalMins:18},
  {id:'post-dismissal',title:'Post-Dismissal Reset',  icon:'refresh',  color:'#16a34a',bg:'rgba(22,163,74,0.10)',  border:'rgba(22,163,74,0.28)', desc:'Reset fast after getting out — bounce back like a champion',       sessionIds:['m32','m33','m31'],bonusXP:20,totalMins:16},
  {id:'match-morning', title:'Match Day Morning',     icon:'sun',      color:'#f59e0b',bg:'rgba(245,158,11,0.10)',border:'rgba(245,158,11,0.28)',desc:'Start match day with energy, focus and winning belief',             sessionIds:['m56','m80','m54'],bonusXP:30,totalMins:22},
  {id:'focus-block',   title:'Deep Focus Block',      icon:'crosshair',color:'#8b5cf6',bg:'rgba(139,92,246,0.10)',border:'rgba(139,92,246,0.28)',desc:'Sharpen your concentration before technical practice',              sessionIds:['m05','m06','m08'],bonusXP:25,totalMins:21},
  {id:'pressure-train',title:'Pressure Training',     icon:'flame',    color:'#ef4444',bg:'rgba(239,68,68,0.10)', border:'rgba(239,68,68,0.28)', desc:'Train your mind to thrive when the game is on the line',           sessionIds:['m63','m64','m67'],bonusXP:35,totalMins:25},
];
window.SC_APP.MENTAL_ROUTINES = MENTAL_ROUTINES;

// ── M-A: Breathing Orb ────────────────────────────────────────────
function BreathingOrb({isPlaying=true}){
  const PHASES=[
    {id:'inhale',label:'Breathe In',  dur:4000,scale:1.0},
    {id:'hold',  label:'Hold…',       dur:2000,scale:1.0},
    {id:'exhale',label:'Breathe Out', dur:6000,scale:0.52},
  ];
  const [pi,setPi]=useState(0);
  const tmRef=useRef(null);
  useEffect(()=>{
    if(!isPlaying){clearTimeout(tmRef.current);return;}
    tmRef.current=setTimeout(()=>setPi(p=>(p+1)%3),PHASES[pi].dur);
    return()=>clearTimeout(tmRef.current);
  },[pi,isPlaying]);
  const ph=PHASES[pi],dur=ph.dur/1000;
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:14,userSelect:'none'}},
    h('div',{style:{position:'relative',width:150,height:150,display:'flex',alignItems:'center',justifyContent:'center'}},
      h('div',{style:{position:'absolute',width:150,height:150,borderRadius:'50%',background:'radial-gradient(circle,rgba(168,85,247,0.12)0%,transparent 68%)',transform:`scale(${ph.scale*1.35})`,transition:`transform ${dur}s ease-in-out`,opacity:isPlaying?1:0.3}}),
      h('div',{style:{position:'absolute',width:110,height:110,borderRadius:'50%',border:`1.5px solid rgba(168,85,247,${isPlaying?0.45:0.12})`,transform:`scale(${ph.scale})`,transition:`transform ${dur}s ease-in-out`}}),
      h('div',{style:{width:72,height:72,borderRadius:'50%',transform:`scale(${ph.scale})`,transition:`transform ${dur}s ease-in-out`,
        background:isPlaying?'radial-gradient(circle at 35% 33%,rgba(220,150,255,0.95),rgba(109,40,217,0.75))':'radial-gradient(circle at 35% 33%,rgba(168,85,247,0.35),rgba(109,40,217,0.25))',
        boxShadow:isPlaying?'0 0 24px rgba(168,85,247,0.4)':'0 0 8px rgba(168,85,247,0.12)'}})
    ),
    h('div',{style:{fontSize:11,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',
      color:isPlaying?'rgba(196,130,255,0.95)':'rgba(168,85,247,0.35)',minWidth:100,textAlign:'center'}},
      isPlaying?ph.label:'— Paused —')
  );
}

// ── M-D: Post-session rating ──────────────────────────────────────
function PostSessionRating({onRate}){
  const [countdown,setCountdown]=useState(6);
  const [selected,setSelected]=useState(null);
  useEffect(()=>{
    if(countdown<=0){onRate(selected);return;}
    const t=setTimeout(()=>setCountdown(c=>c-1),1000);
    return()=>clearTimeout(t);
  },[countdown]);
  const icons=['trendDown','wind','activity','star','flame'];
  const labels=['Struggling','Neutral','Better','Great','On fire!'];
  const colors=['#ef4444','#9ca3af','#f59e0b','#10b981','#16a34a'];
  return h('div',{style:{textAlign:'center',padding:'20px 16px 0'}},
    h('p',{style:{fontSize:15,fontWeight:700,color:'#f0fdf4',marginBottom:4}},'How do you feel now?'),
    h('p',{style:{fontSize:12,color:'#6b7280',marginBottom:18}},'Rate your mental state after this session'),
    h('div',{style:{display:'flex',gap:8,justifyContent:'center',marginBottom:16}},
      icons.map((ic,i)=>h('button',{key:i,onClick:()=>{setSelected(i+1);onRate(i+1);},style:{
        width:52,height:64,borderRadius:12,cursor:'pointer',fontFamily:'inherit',
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
        background:selected===i+1?`${colors[i]}15`:'rgba(22,27,34,0.9)',
        border:`2px solid ${selected===i+1?colors[i]:'rgba(48,54,61,0.9)'}`,
        transform:selected===i+1?'scale(1.1)':'scale(1)',transition:'all 0.15s',
      }},
        h(Icon,{n:ic,cls:'',style:{width:20,height:20,color:selected===i+1?colors[i]:'#6b7280'}}),
        h('span',{style:{fontSize:9,fontWeight:700,color:selected===i+1?colors[i]:'#374151',textTransform:'uppercase'}},labels[i])
      ))
    ),
    selected===null&&h('p',{style:{fontSize:11,color:'#374151'}},`Auto-skip in ${countdown}s…`),
    h('button',{onClick:()=>onRate(null),style:{fontSize:12,color:'#4b5563',background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',fontWeight:600,display:'inline-flex',alignItems:'center',gap:5}},'Skip',h(Icon,{n:'chevR',cls:'',style:{width:13,height:13,color:'#4b5563'}}))
  );
}

// ── Page inner padding — consistent on phone + desktop ───────────
// On desktop (no bottom nav), pb-28 becomes pb-8 via CSS media query.
// This wrapper provides consistent horizontal padding.
function ContentWrap({children}){
  return h('div',{style:{width:'100%',maxWidth:860,margin:'0 auto',padding:'0 0 120px 0'},className:'mental-content-wrap'},children);
}

// ================================================================
// MENTAL PAGE — fully responsive
// ================================================================
function MentalPage(){
  const [cat,setCat]=useState('all');
  const [search,setSearch]=useState('');
  const [activeScenario,setScenario]=useState(null);
  const [tab,setTab]=useState('sessions');
  const progress=DB.getProgress();
  const done=progress.completed_mental||[];
  const catDef=MENT_CATS.find(c=>c.id===cat)||MENT_CATS[0];

  const scenarioSessions=activeScenario
    ?activeScenario.sessionIds.map(id=>MENTAL_SESSIONS.find(s=>s.id===id)).filter(Boolean)
    :[];
  // ── SMART SEARCH — title + description + technique instructions ──
  const mentalFuseRef=useRef(null);
  if(window.Fuse&&(!mentalFuseRef.current||mentalFuseRef.current._scCount!==MENTAL_SESSIONS.length)){
    mentalFuseRef.current=new window.Fuse(MENTAL_SESSIONS,{includeScore:true,threshold:0.4,ignoreLocation:true,minMatchCharLength:2,
      keys:[{name:'title',weight:0.45},{name:'description',weight:0.30},{name:'category',weight:0.15},{name:'steps.instruction',weight:0.10}]});
    mentalFuseRef.current._scCount=MENTAL_SESSIONS.length;
  }
  const sq=search.trim();
  let searchedSessions;
  if(!sq) searchedSessions=MENTAL_SESSIONS;
  else if(mentalFuseRef.current) searchedSessions=mentalFuseRef.current.search(sq).map(r=>r.item);
  else { const ql=sq.toLowerCase(); searchedSessions=MENTAL_SESSIONS.filter(s=>s.title.toLowerCase().includes(ql)||(s.description&&s.description.toLowerCase().includes(ql))); }
  const filtered=searchedSessions.filter(s=>cat==='all'||s.category===cat);

  // SmartCrick Picks — personalised for this user
  const user=DB.getUser?DB.getUser():(DB.get?DB.get('user'):null);
  const pickSessions=(window.SC_APP.PersonalisationEngine&&user)
    ?window.SC_APP.PersonalisationEngine.getPickSessions(MENTAL_SESSIONS,user,done)
    :[];
  const pickIds=new Set(pickSessions.map(s=>s.id));

  return h('div',{style:{minHeight:'100dvh',background:'#0d1117',backgroundImage:'radial-gradient(ellipse at 30% -10%,rgba(109,40,217,0.08) 0%,transparent 50%)'}},
    h(PageHeader,{title:'Mental Training',subtitle:`${MENTAL_SESSIONS.length} sessions · ${MENTAL_ROUTINES.length} routines · 77 routines`,gradient:'linear-gradient(135deg,#5b21b6,#4f46e5)'}),

    h(ContentWrap,null,
      // Sessions / Routines / Creator tab
      h('div',{style:{display:'flex',gap:6,margin:'16px 16px 0',padding:'4px',borderRadius:99,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)'}},
        [{id:'sessions',icon:'brain',label:'Sessions'},{id:'routines',icon:'repeat',label:'Routines'},{id:'creator',icon:'sparkles',label:'Creator'}].map(t=>h('button',{key:t.id,onClick:()=>{setTab(t.id);setScenario(null);},style:{
          flex:1,padding:'9px 4px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
          borderRadius:99,display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          background:tab===t.id?'rgba(139,92,246,0.15)':'transparent',
          border:tab===t.id?'1px solid rgba(139,92,246,0.3)':'1px solid rgba(255,255,255,0.07)',
          color:tab===t.id?'#a78bfa':'#64748b',transition:'all 0.15s',
        }},h(Icon,{n:t.icon,cls:'',style:{width:14,height:14,color:tab===t.id?'#a78bfa':'#64748b'}}),t.label))
      ),

      // Tab content with animation
      (function(){
        var FM=window.FramerMotion;
        var tabContent=h(Fragment,null,

      // ── Routines tab ──────────────────────────────────────────
      tab==='routines'&&h('div',{style:{padding:'12px 16px 0'}},
        h('p',{style:{fontSize:12,color:'#6b7280',marginBottom:12,lineHeight:1.6}},'Chain multiple sessions together. Complete a full routine for bonus XP!'),
        h('div',{style:{display:'flex',flexDirection:'column',gap:10}},
          MENTAL_ROUTINES.map(r=>{
            const sessions=r.sessionIds.map(id=>MENTAL_SESSIONS.find(s=>s.id===id)).filter(Boolean);
            const totalXP=sessions.reduce((s,x)=>s+x.xp_value,0)+r.bonusXP;
            return h('div',{key:r.id,style:{
              borderRadius:14,background:'rgba(16,22,36,0.9)',
              border:'1px solid rgba(255,255,255,0.07)',
              borderLeft:'6px solid #8b5cf6',
              padding:'16px',overflow:'hidden',
            }},
              h('div',{style:{display:'flex',alignItems:'flex-start',gap:12,marginBottom:10}},
                h('div',{style:{width:44,height:44,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(139,92,246,0.15)',border:'1px solid rgba(139,92,246,0.3)'}},
                  h(Icon,{n:r.icon,cls:'w-5 h-5',style:{color:'#a78bfa'}})),
                h('div',{style:{flex:1,minWidth:0}},
                  h('div',{style:{fontSize:14,fontWeight:700,color:'#f8fafc',marginBottom:4}},r.title),
                  h('div',{style:{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:8,lineHeight:1.5}},r.desc),
                  h('div',{style:{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}},
                    h('span',{style:{fontSize:11,padding:'2px 8px',borderRadius:99,background:'rgba(139,92,246,0.15)',color:'#a78bfa',fontWeight:600,border:'1px solid rgba(139,92,246,0.3)'}},`${r.totalMins} min`),
                    h('span',{style:{fontSize:11,padding:'2px 8px',borderRadius:99,background:'rgba(139,92,246,0.15)',color:'#a78bfa',fontWeight:600,border:'1px solid rgba(139,92,246,0.3)'}},`${r.sessionIds.length} sessions`),
                    h('span',{style:{fontSize:11,padding:'2px 8px',borderRadius:99,background:'rgba(245,158,11,0.12)',color:'#f59e0b',fontWeight:600,border:'1px solid rgba(245,158,11,0.3)'}},`+${r.bonusXP} bonus XP`)
                  )
                )
              ),
              h('button',{onClick:()=>nav('MentalRoutines',{id:r.id}),style:{
                width:'100%',padding:'12px',borderRadius:10,cursor:'pointer',fontFamily:'inherit',
                background:'linear-gradient(135deg,#7c3aed,#6d28d9)',color:'#fff',
                border:'none',fontSize:14,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',gap:7,
              }},'Start Routine',h(Icon,{n:'chevR',cls:'',style:{width:15,height:15,color:'#fff'}}))
            );
          })
        )
      ),

      // ── Sessions tab ──────────────────────────────────────────
      tab==='sessions'&&h(Fragment,null,
        // M-B: Scenario entry — 3-column responsive grid
        h('div',{style:{padding:'14px 16px 0'}},
          h('p',{style:{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}},'How are you feeling right now?'),
          // KEY FIX: Use minmax so columns are auto-sized and never overflow
          h('div',{style:{
            display:'grid',
            gridTemplateColumns:'repeat(3, minmax(0, 1fr))',
            gap:8,
            // Ensure grid never exceeds container
            width:'100%',
            overflow:'hidden',
          }},
            MENTAL_SCENARIOS.map(sc=>{
              const isActive=activeScenario?.id===sc.id;
              return h('button',{key:sc.id,onClick:()=>setScenario(prev=>prev?.id===sc.id?null:sc),style:{
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,
                padding:'16px 4px',borderRadius:14,cursor:'pointer',fontFamily:'inherit',
                background:isActive?sc.bg:'rgba(16,22,36,0.9)',
                border:`1px solid ${isActive?sc.border:'rgba(255,255,255,0.08)'}`,
                transform:isActive?'scale(1.04)':'scale(1)',transition:'all 0.15s',
                minHeight:88,
              }},
                h('div',{style:{
                  width:38,height:38,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',
                  background:isActive?sc.bg:'rgba(255,255,255,0.04)',
                  border:`1px solid ${isActive?sc.border:'rgba(255,255,255,0.07)'}`,
                }},h(Icon,{n:sc.icon,cls:'',style:{width:19,height:19,color:isActive?sc.color:'#94a3b8'}})),
                h('span',{style:{
                  fontSize:13,fontWeight:700,textAlign:'center',lineHeight:1.3,
                  color:isActive?sc.color:'#e2e8f0',
                  overflowWrap:'break-word',wordBreak:'break-word',
                  width:'100%',
                }},sc.label)
              );
            })
          )
        ),

        // Scenario recommendations
        activeScenario&&h('div',{style:{margin:'12px 16px 0',padding:'14px',borderRadius:12,background:activeScenario.bg,border:`1px solid ${activeScenario.border}`}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}},
            h('p',{style:{fontSize:12,fontWeight:700,color:activeScenario.color,textTransform:'uppercase',letterSpacing:'0.08em'}},'Recommended for you'),
            h('button',{onClick:()=>setScenario(null),style:{fontSize:11,color:'#6b7280',background:'none',border:'none',cursor:'pointer',fontWeight:600}},'Clear ×')
          ),
          h('div',{style:{display:'flex',flexDirection:'column',gap:7}},
            scenarioSessions.slice(0,3).map(s=>{
              const sc2=MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
              return h('button',{key:s.id,onClick:()=>{window.SC_APP._mentalSession=s;nav('MentalPlayer',{id:s.id});},style:{
                display:'flex',alignItems:'center',gap:10,padding:'11px 12px',borderRadius:9,
                background:'rgba(13,17,23,0.6)',border:'1px solid rgba(48,54,61,0.7)',
                cursor:'pointer',textAlign:'left',width:'100%',fontFamily:'inherit',
              }},
                h('div',{style:{width:36,height:36,borderRadius:7,flexShrink:0,background:`linear-gradient(135deg,${sc2.from},${sc2.to})`,display:'flex',alignItems:'center',justifyContent:'center'}},
                  h(Icon,{n:sc2.icon,cls:'w-4 h-4 text-white'})),
                h('div',{style:{flex:1,minWidth:0}},
                  h('div',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},s.title),
                  h('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:3}},
                    h('span',{style:{fontSize:11,color:'#6b7280'}},`${Math.floor(s.duration_seconds/60)} min`),
                    h(XPBadge,{xp:s.xp_value}))
                ),
                h(Icon,{n:'play',cls:'w-4 h-4 flex-shrink-0',style:{color:activeScenario.color}})
              );
            })
          )
        ),

        // Category pills
        h('div',{style:{display:'flex',gap:8,padding:'12px 16px 0',overflowX:'auto',scrollbarWidth:'none'}},
          MENT_CATS.map(c=>h('button',{key:c.id,onClick:()=>{setCat(c.id);setScenario(null);},
            style:{
              display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:20,
              fontSize:12,fontWeight:700,whiteSpace:'nowrap',flexShrink:0,cursor:'pointer',fontFamily:'inherit',
              background:cat===c.id?`linear-gradient(135deg,${c.from},${c.to})`:'rgba(22,27,34,0.9)',
              color:cat===c.id?'#fff':'#8b949e',
              border:cat===c.id?'none':'1px solid rgba(48,54,61,0.9)',
              boxShadow:cat===c.id?`0 4px 14px ${c.from}40`:'none',
            }},
            h(Icon,{n:c.icon,cls:'w-3.5 h-3.5',style:{color:cat===c.id?'#fff':'#484f58'}}),c.label))
        ),

        // Search
        h('div',{style:{padding:'8px 16px 8px'}},
          h('div',{style:{position:'relative'}},
            h(Icon,{n:'search',cls:'w-4 h-4',style:{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'#484f58'}}),
            h('input',{type:'text',placeholder:'Search by name or what it helps with…',value:search,onChange:e=>{setSearch(e.target.value);setScenario(null);},
              style:{width:'100%',padding:'10px 14px 10px 38px',borderRadius:10,fontSize:14,outline:'none',boxSizing:'border-box',
                background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3',fontFamily:'inherit'}})
          )
        ),

        // ── SmartCrick Picks for Mental ───────────────────────────────
        pickSessions.length>0&&!search&&cat==='all'&&(function(){
          var _hour = new Date().getHours();
          var _tod = _hour < 12 ? 'morning' : _hour < 18 ? 'afternoon' : 'evening';
          var _userName = user && user.name ? user.name : null;
          var _roleLabel = user && user.role ? (user.role.charAt(0).toUpperCase()+user.role.slice(1)) : null;
          var _greetLine = _userName
            ? 'Good '+_tod+', '+_userName+'. Here\'s what your mind needs today.'
            : 'Good '+_tod+'. Here\'s what your mind needs today.';
          var _subLine = _roleLabel
            ? 'AI-picked for '+_roleLabel+'s based on your recent activity'
            : 'AI-picked based on your recent activity';
          return h('div',{style:{padding:'8px 16px 0'}},
          h('style',null,
            '@keyframes sc-mental-pick{0%,100%{border-color:rgba(139,92,246,0.3)}50%{border-color:rgba(139,92,246,0.6)}}'
          ),
          h('div',{style:{marginBottom:12}},
            h('p',{style:{fontSize:14,fontWeight:700,color:'#f0fdf4',margin:'0 0 3px',lineHeight:1.4}},_greetLine),
            h('p',{style:{fontSize:11,color:'#6b7280',margin:0,display:'inline-flex',alignItems:'center',gap:4}},
              h(Icon,{n:'sparkles',cls:'',style:{width:11,height:11,color:'#8b5cf6'}}),
              _subLine)
          ),
          h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
            pickSessions.map(s=>{
              const sc=MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
              const mins=Math.floor(s.duration_seconds/60);
              const isDone=done.includes(s.id);
              return h('button',{key:'pick-'+s.id,onClick:()=>{window.SC_APP._mentalSession=s;nav('MentalPlayer',{id:s.id});},style:{
                display:'flex',alignItems:'center',gap:12,padding:'13px 14px',borderRadius:11,
                background:'rgba(22,27,34,0.95)',border:'1px solid rgba(139,92,246,0.35)',
                cursor:'pointer',textAlign:'left',width:'100%',fontFamily:'inherit',
                boxShadow:'0 0 0 1px rgba(139,92,246,0.08),0 4px 14px rgba(109,40,217,0.10)',
                animation:'sc-mental-pick 3s ease-in-out infinite',
              }},
                h('div',{style:{width:40,height:40,borderRadius:8,flexShrink:0,position:'relative',background:`linear-gradient(135deg,${sc.from},${sc.to})`,display:'flex',alignItems:'center',justifyContent:'center'}},
                  h(Icon,{n:sc.icon,cls:'w-4 h-4 text-white'}),
                  isDone&&h('div',{style:{position:'absolute',top:-4,right:-4,width:16,height:16,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},
                    h(Icon,{n:'check',cls:'w-2.5 h-2.5 text-white'}))
                ),
                h('div',{style:{flex:1,minWidth:0}},
                  h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:3}},
                    h('span',{style:{fontSize:8,fontWeight:800,color:'#8b5cf6',background:'rgba(139,92,246,0.12)',padding:'2px 5px',borderRadius:3,border:'1px solid rgba(139,92,246,0.25)',letterSpacing:'0.06em',textTransform:'uppercase',display:'inline-flex',alignItems:'center',gap:3}},h(Icon,{n:'sparkles',cls:'',style:{width:9,height:9,color:'#8b5cf6'}}),'Pick'),
                    h('span',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},s.title)
                  ),
                  s.whyPicked&&h('div',{style:{fontSize:10,color:'#8b5cf6',marginBottom:3,opacity:0.85}},s.whyPicked),
                  h('div',{style:{display:'flex',alignItems:'center',gap:8}},
                    h('span',{style:{fontSize:11,color:'#6b7280'}},mins+' min'),
                    h(XPBadge,{xp:s.xp_value}))
                ),
                h(Icon,{n:'play',cls:'w-4 h-4 flex-shrink-0',style:{color:'#8b5cf6'}})
              );
            })
          )
        );})(),

        // Session list
        h('div',{style:{padding:'4px 16px 0'}},
          filtered.length===0
            ?h(EmptyState,{icon:'brain',title:'No sessions found',desc:'Try a different category or search term'})
            :filtered.map(s=>{
              const mins=Math.floor(s.duration_seconds/60),isDone=done.includes(s.id);
              const sc=MENT_CATS.find(c=>c.id===s.category)||MENT_CATS[1];
              return h('button',{key:s.id,onClick:()=>{window.SC_APP._mentalSession=s;nav('MentalPlayer',{id:s.id});},style:{
                display:'flex',alignItems:'center',gap:12,padding:'16px',borderRadius:14,
                background:'rgba(16,22,36,0.9)',border:`1px solid ${isDone?'rgba(22,163,74,0.3)':'rgba(255,255,255,0.07)'}`,
                cursor:'pointer',textAlign:'left',width:'100%',fontFamily:'inherit',marginBottom:8,
                borderLeft:`6px solid ${sc.from}`,
              }},
                h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative',background:`linear-gradient(135deg,${sc.from},${sc.to})`}},
                  h(Icon,{n:sc.icon,cls:'w-5 h-5 text-white'}),
                  isDone&&h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},
                    h(Icon,{n:'check',cls:'w-3 h-3 text-white'}))
                ),
                h('div',{style:{flex:1,minWidth:0}},
                  h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginBottom:6}},
                    h('span',{style:{fontSize:15,fontWeight:700,color:'#f8fafc',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},s.title),
                    h('div',{style:{display:'flex',alignItems:'center',gap:4,flexShrink:0}},
                      pickIds.has(s.id)&&h('span',{style:{fontSize:8,fontWeight:800,color:'#8b5cf6',background:'rgba(139,92,246,0.12)',padding:'2px 5px',borderRadius:3,border:'1px solid rgba(139,92,246,0.25)',letterSpacing:'0.04em',textTransform:'uppercase',display:'inline-flex',alignItems:'center',gap:3}},h(Icon,{n:'sparkles',cls:'',style:{width:9,height:9,color:'#8b5cf6'}}),'Pick'),
                      s.is_premium&&h(PremiumBadge)
                    )
                  ),
                  h('div',{style:{display:'flex',alignItems:'center',gap:8}},
                    h('span',{style:{fontSize:11,padding:'2px 8px',borderRadius:99,background:`${sc.from}22`,color:sc.from,fontWeight:600}},`${mins} min`),
                    h('span',{style:{fontSize:11,padding:'2px 8px',borderRadius:99,background:'rgba(34,197,94,0.12)',color:'#4ade80',fontWeight:600}},`+${s.xp_value} XP`),
                    isDone&&h('span',{style:{fontSize:11,fontWeight:700,color:'#4ade80',display:'inline-flex',alignItems:'center',gap:3}},h(Icon,{n:'check',cls:'',style:{width:12,height:12,color:'#4ade80'}}),'Done')
                  )
                )
              );
            })
        )
      ),

      // ── Creator tab ───────────────────────────────────────────
      tab==='creator'&&h(MentalRoutineCreatorTab,null)

        );// end tabContent Fragment
        if(!FM) return tabContent;
        return h(FM.AnimatePresence,{mode:'wait'},
          h(FM.motion.div,{
            key:tab,
            initial:{opacity:0,y:8},
            animate:{opacity:1,y:0},
            exit:{opacity:0,y:-8},
            transition:{duration:0.18,ease:'easeInOut'},
            style:{width:'100%'},
          },tabContent)
        );
      })()
    )
  );
}

// ================================================================
// M-C: Routine pages
// ================================================================
function MentalRoutinesPage({params}){
  const routine=MENTAL_ROUTINES.find(r=>r.id===params?.id);
  if(!routine) return h('div',{style:{paddingBottom:120}},h(PageHeader,{title:'Routines',gradient:'linear-gradient(135deg,#5b21b6,#4f46e5)',onBack:()=>nav('Mental')}));
  const sessions=routine.sessionIds.map(id=>MENTAL_SESSIONS.find(s=>s.id===id)).filter(Boolean);
  const totalXP=sessions.reduce((s,x)=>s+x.xp_value,0)+routine.bonusXP;
  return h('div',{style:{paddingBottom:120}},
    h(PageHeader,{title:routine.title,subtitle:`${routine.totalMins} min · ${sessions.length} sessions · ${totalXP} XP`,gradient:'linear-gradient(135deg,#5b21b6,#4f46e5)',onBack:()=>nav('Mental')}),
    h('div',{style:{maxWidth:860,margin:'0 auto',padding:'20px 16px'}},
      h('div',{style:{padding:'14px',borderRadius:12,background:routine.bg,border:`1px solid ${routine.border}`,marginBottom:16}},
        h('p',{style:{fontSize:13,color:'rgba(255,255,255,0.75)',lineHeight:1.6}},routine.desc),
        h('p',{style:{fontSize:11,fontWeight:700,color:routine.color,marginTop:8}},`+${routine.bonusXP} bonus XP for completing all sessions`)),
      h('p',{style:{fontSize:12,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},'Sessions in this routine'),
      h('div',{style:{display:'flex',flexDirection:'column',gap:8,marginBottom:20}},
        sessions.map((s,i)=>h('div',{key:s.id,style:{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
          h('div',{style:{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#5b21b6,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:12,fontWeight:800,color:'#fff'}},i+1),
          h('div',{style:{flex:1}},
            h('div',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4'}},s.title),
            h('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:3}},
              h('span',{style:{fontSize:11,color:'#6b7280'}},`${Math.floor(s.duration_seconds/60)} min`),
              h(XPBadge,{xp:s.xp_value})))
        ))
      ),
      h('button',{onClick:()=>nav('MentalRoutinePlayer',{id:routine.id,step:'0'}),
        style:{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'14px',background:'#16a34a',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontFamily:'inherit',fontSize:15,fontWeight:700}},
        h(Icon,{n:'play',cls:'w-5 h-5'}),' Start Routine')
    )
  );
}

function MentalRoutinePlayerPage({params}){
  const routine=MENTAL_ROUTINES.find(r=>r.id===params?.id);
  const [sessionIdx,setSessionIdx]=useState(parseInt(params?.step||'0',10));
  const [betweenSessions,setBetween]=useState(false);
  const [countdown,setCountdown]=useState(3);
  const [routineDone,setRoutineDone]=useState(false);
  const ctRef=useRef(null);
  if(!routine) return h('div',{style:{textAlign:'center',padding:'80px 20px'}},h('button',{onClick:()=>nav('Mental'),style:{background:'#16a34a',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',cursor:'pointer',fontFamily:'inherit',fontWeight:700}},'Back'));
  const sessions=routine.sessionIds.map(id=>MENTAL_SESSIONS.find(s=>s.id===id)).filter(Boolean);
  const currentSession=sessions[sessionIdx];

  const handleSessionComplete=()=>{
    if(sessionIdx<sessions.length-1){
      setBetween(true);setCountdown(3);
      ctRef.current=setInterval(()=>setCountdown(c=>{
        if(c<=1){clearInterval(ctRef.current);setBetween(false);setSessionIdx(i=>i+1);return 3;}
        return c-1;
      }),1000);
    } else {
      awardXP(routine.bonusXP,routine.totalMins,'routine');
      DB.logRoutineComplete(routine.id,routine.bonusXP);
      fireConfetti(); setRoutineDone(true);
    }
  };
  useEffect(()=>()=>clearInterval(ctRef.current),[]);

  if(routineDone) return h('div',{style:{minHeight:'100vh',background:'linear-gradient(135deg,#0f0824,#1e1040,#0f172a)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem',textAlign:'center'}},
    h('div',{style:{width:84,height:84,borderRadius:24,marginBottom:18,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(140deg,rgba(245,158,11,0.28),rgba(245,158,11,0.08))',border:'1px solid rgba(245,158,11,0.4)',boxShadow:'0 10px 36px rgba(245,158,11,0.25)'}},h(Icon,{n:'trophy',cls:'',style:{width:42,height:42,color:'#fbbf24'}})),
    h('h2',{style:{fontSize:'1.6rem',fontWeight:900,color:'#fff',marginBottom:8}},`${routine.title} Complete!`),
    h('p',{style:{color:'#a78bfa',marginBottom:16,fontSize:14}},getEncouragement('routine_complete')),
    h(XPBadge,{xp:sessions.reduce((s,x)=>s+x.xp_value,0)+routine.bonusXP}),
    h('div',{style:{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:280,marginTop:24}},
      h('button',{onClick:()=>nav('Mental'),style:{background:'#16a34a',color:'#fff',border:'none',borderRadius:10,padding:'13px',cursor:'pointer',fontFamily:'inherit',fontWeight:700}},'Back to Mental'),
      h('button',{onClick:()=>nav('Home'),style:{background:'transparent',color:'#9ca3af',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,padding:'12px',cursor:'pointer',fontFamily:'inherit',fontWeight:600}},'Go Home')
    )
  );

  if(betweenSessions) return h('div',{style:{minHeight:'100vh',background:'linear-gradient(135deg,#0f0824,#1e1040)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1.5rem',textAlign:'center'}},
    h('div',{style:{width:64,height:64,borderRadius:18,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(34,197,94,0.14)',border:'1px solid rgba(34,197,94,0.35)'}},h(Icon,{n:'circleCheck',cls:'',style:{width:34,height:34,color:'#4ade80'}})),
    h('h3',{style:{fontSize:'1.25rem',fontWeight:800,color:'#fff',marginBottom:8}},`Session ${sessionIdx+1} done`),
    h('p',{style:{color:'#a78bfa',marginBottom:24}},`Next: ${sessions[sessionIdx+1]?.title}`),
    h('div',{style:{fontSize:48,fontWeight:900,color:'#7c3aed',fontVariantNumeric:'tabular-nums'}},countdown),
    h('p',{style:{color:'#4b5563',fontSize:12,marginTop:8}},'Starting next session…')
  );

  return h(EmbeddedSessionPlayer,{
    session:currentSession,routineTitle:routine.title,
    sessionNum:sessionIdx+1,totalSessions:sessions.length,
    onComplete:handleSessionComplete,onExit:()=>nav('Mental'),
  });
}

function EmbeddedSessionPlayer({session,routineTitle,sessionNum,totalSessions,onComplete,onExit}){
  const [step,setStep]=useState(0);
  const [timeLeft,setTimeLeft]=useState(()=>session.steps[0]?.duration_seconds||60);
  const [paused,setPaused]=useState(false);
  const [done,setDone]=useState(false);
  const intRef=useRef(null),awardedRef=useRef(false);
  useEffect(()=>{
    if(done)return;clearInterval(intRef.current);setTimeLeft(session.steps[step]?.duration_seconds||60);setPaused(false);
    return()=>clearInterval(intRef.current);
  },[step,done]);
  useEffect(()=>{
    if(done||paused){clearInterval(intRef.current);return;}
    clearInterval(intRef.current);
    intRef.current=setInterval(()=>setTimeLeft(t=>{
      if(t<=1){clearInterval(intRef.current);
        if(step<session.steps.length-1){setStep(s=>s+1);}
        else{if(!awardedRef.current){awardedRef.current=true;awardXP(Math.round(session.xp_value*1.25),Math.floor(session.duration_seconds/60),'mental','mental',session.id,true);setDone(true);}}
        return 0;}
      return t-1;
    }),1000);
    return()=>clearInterval(intRef.current);
  },[step,done,paused]);
  useEffect(()=>{if(done)onComplete();},[done]);
  useEffect(()=>()=>clearInterval(intRef.current),[]);
  const cur=session.steps[step],isLastEmbedStep=step===session.steps.length-1;
  return h('div',{style:{minHeight:'100vh',background:'linear-gradient(160deg,#0f0824,#170b35,#0f172a)',display:'flex',flexDirection:'column',alignItems:'center',padding:'max(1.25rem,env(safe-area-inset-top)) 1.25rem max(1.5rem,env(safe-area-inset-bottom))'}},
    h('div',{style:{width:'100%',maxWidth:380,display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'0.75rem'}},
      h('button',{onClick:onExit,style:{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.10)',borderRadius:8,padding:'6px 12px',cursor:'pointer',color:'#a78bfa',fontSize:12,fontWeight:600,fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:5}},h(Icon,{n:'arrowL',cls:'',style:{width:13,height:13,color:'#a78bfa'}}),'Exit'),
      h('div',{style:{textAlign:'center',flex:1}},
        h('div',{style:{fontSize:10,color:'#4b5563',fontWeight:700,textTransform:'uppercase'}},routineTitle),
        h('div',{style:{fontSize:11,color:'#7c3aed',marginTop:2}},`Session ${sessionNum}/${totalSessions} · Step ${step+1}/${session.steps.length}`)
      ),
      h('div',{style:{width:40}})
    ),
    h('div',{style:{width:'100%',maxWidth:380,height:3,background:'rgba(109,40,217,0.18)',borderRadius:2,marginBottom:'2rem'}},
      h('div',{style:{height:'100%',borderRadius:2,background:'#a855f7',width:`${Math.round(((step+1)/session.steps.length)*100)}%`}})),
    h(BreathingOrb,{isPlaying:!paused&&!done}),
    h('div',{style:{marginTop:12,fontSize:15,fontWeight:700,color:'rgba(168,85,247,0.55)',fontVariantNumeric:'tabular-nums'}},fmtTime(timeLeft)),
    h('div',{style:{textAlign:'center',maxWidth:340,flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'1.25rem 0'}},
      h('p',{style:{fontSize:'1.075rem',color:'#e2d9f3',lineHeight:1.8,fontWeight:500}},cur?.instruction)),
    h('div',{style:{width:'100%',maxWidth:380,display:'flex',flexDirection:'column',gap:9}},
      h('button',{onClick:()=>{clearInterval(intRef.current);if(step<session.steps.length-1){setStep(s=>s+1);}else{if(!awardedRef.current){awardedRef.current=true;awardXP(Math.round(session.xp_value*1.25),Math.floor(session.duration_seconds/60),'mental','mental',session.id,true);setDone(true);}}},
        style:{flex:1,padding:'14px',border:'none',cursor:'pointer',fontSize:14,fontWeight:700,borderRadius:10,color:'#fff',fontFamily:'inherit',background:isLastEmbedStep?'#16a34a':'linear-gradient(135deg,#5b21b6,#4338ca)',display:'flex',alignItems:'center',justifyContent:'center',gap:7}},
        isLastEmbedStep?[h('span',{key:'l'},'Complete Session'),h(Icon,{key:'i',n:'check',cls:'',style:{width:16,height:16,color:'#fff'}})]:[h('span',{key:'l'},'Next Step'),h(Icon,{key:'i',n:'chevR',cls:'',style:{width:16,height:16,color:'#fff'}})]),
      h('button',{onClick:()=>setPaused(p=>!p),style:{padding:'10px',background:'transparent',color:'rgba(109,40,217,0.8)',borderRadius:10,fontWeight:600,border:'1px solid rgba(109,40,217,0.30)',cursor:'pointer',fontSize:13,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}},
        h(Icon,{n:paused?'play':'pause',cls:'',style:{width:14,height:14,color:'rgba(168,85,247,0.9)'}}),paused?'Resume':'Pause')
    )
  );
}

Object.assign(window.SC_APP,{
  MentalPage,MentalRoutinesPage,MentalRoutinePlayerPage,
  BreathingOrb,PostSessionRating,MENTAL_SCENARIOS,MENTAL_ROUTINES,
});
console.log('[SC] app-mental v3.2 — responsive layout fix');
})();
