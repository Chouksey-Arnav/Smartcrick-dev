// ================================================================
// Save as: app-ui.js
// SmartCrick AI — UI v3.1
// KEY FIX: All NavBtn layout uses INLINE STYLES (not CSS classes)
//          so sidebar ALWAYS renders correctly, independent of CSS loading.
// KEY FIX: DesktopSidebar component for persistent desktop layout.
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useCallback, useRef, useContext, Fragment } = React;
const A = window.SC_APP;

// ── Icon ──────────────────────────────────────────────────────────
function Icon({ n, cls='w-5 h-5', style }) {
  return h('svg',{className:cls,style,xmlns:'http://www.w3.org/2000/svg',viewBox:'0 0 24 24',fill:'none',
    stroke:'currentColor',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,
    dangerouslySetInnerHTML:{__html:A.IC[n]||A.IC.info}});
}
A.Icon = Icon;

function Spinner({cls=''}){ return h('div',{className:`flex items-center justify-center py-16 ${cls}`},h('div',{className:'w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin'})); }
A.Spinner = Spinner;

function LevelBar({totalXP,compact=false}){
  const info=A.getLevelInfo(totalXP||0);
  if(compact) return h('div',{style:{display:'flex',alignItems:'center',gap:8}},
    h('span',{style:{fontSize:11,fontWeight:800,color:'#4ade80',whiteSpace:'nowrap'}},`Lv.${info.level}`),
    h('div',{style:{flex:1,height:5,borderRadius:99,background:'rgba(48,54,61,0.9)',overflow:'hidden'}},
      h('div',{style:{height:'100%',background:'linear-gradient(to right,#16a34a,#34d399)',width:`${info.pct}%`,borderRadius:99,transition:'width 0.7s'}}))
  );
  return h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
      h('span',{style:{fontSize:13,fontWeight:800,color:'#4ade80'}},`Level ${info.level} — ${info.name}`),
      h('span',{style:{fontSize:11,color:'#4b5563'}},info.next?`${info.xpToNext.toLocaleString()} XP to next`:'MAX LEVEL')
    ),
    h('div',{style:{height:6,borderRadius:99,background:'rgba(48,54,61,0.9)',overflow:'hidden',position:'relative'}},
      h('div',{style:{height:'100%',background:'linear-gradient(to right,#16a34a,#34d399)',width:`${info.pct}%`,borderRadius:99,transition:'width 0.7s'}})
    )
  );
}
A.LevelBar = LevelBar;

function StreakBadge({streak=0}){
  if(!streak) return null;
  return h('div',{style:{display:'inline-flex',alignItems:'center',gap:5,color:'#fb923c',fontSize:13,fontWeight:700,padding:'5px 10px',borderRadius:6,border:'1px solid rgba(251,146,60,0.25)',background:'rgba(251,146,60,0.08)',flexShrink:0,whiteSpace:'nowrap'}},
    h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}),streak, streak===1?' day':' days');
}
A.StreakBadge = StreakBadge;

function XPBadge({xp}){
  return h('span',{style:{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',borderRadius:5,fontSize:11,fontWeight:700,background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.25)',color:'#4ade80'}},
    h(Icon,{n:'zap',cls:'w-3 h-3'}),`${xp} XP`);
}
A.XPBadge = XPBadge;

function PremiumBadge({label='PRO'}){ return h('span',{className:'premium-badge'},label); }
A.PremiumBadge = PremiumBadge;

function StatCard({label,value,color='text-emerald-400',icon,sub,cls=''}){
  return h('div',{className:`stat-card ${cls}`},
    h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
      icon&&h(Icon,{n:icon,cls:'w-3.5 h-3.5',style:{color:color.includes('#')?color:'inherit'}}),
      h('span',{style:{fontSize:10,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},label)
    ),
    h('div',{style:{fontSize:22,fontWeight:800,fontVariantNumeric:'tabular-nums',lineHeight:1,...(color.startsWith('#')?{color}:{})},...(color.startsWith('text-')?{className:color}:{})},value),
    sub&&h('div',{style:{fontSize:11,color:'#484f58',marginTop:4}},sub)
  );
}
A.StatCard = StatCard;

function EmptyState({icon='bat',title,desc,action}){
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'48px 24px',textAlign:'center'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:icon||'bat',cls:'w-7 h-7',style:{color:'#484f58'}})),
    h('h3',{style:{fontSize:15,fontWeight:700,color:'#8b949e',marginBottom:8}},title),
    h('p',{style:{fontSize:13,color:'#484f58',maxWidth:240,lineHeight:1.6,marginBottom:24}},desc),
    action&&h('button',{onClick:action.fn,className:'btn-primary',style:{width:'auto',padding:'10px 24px',fontSize:13}},action.label)
  );
}
A.EmptyState = EmptyState;

function XPChart({days}){
  const max=Math.max(...days.map(d=>d.xp),1);
  return h('div',{style:{display:'flex',alignItems:'flex-end',gap:6,height:80,width:'100%'}},
    days.map(d=>h('div',{key:d.date,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:4,flex:1}},
      h('div',{style:{width:'100%',borderRadius:'3px 3px 0 0',minHeight:3,height:`${Math.max(3,(d.xp/max)*72)}px`,background:d.xp>0?'linear-gradient(to top,#059669,#34d399)':'rgba(30,41,59,0.6)',transition:'height 0.5s'},title:`${d.xp} XP`}),
      h('span',{style:{fontSize:10,color:'#4b5563',fontWeight:500}},d.label)
    ))
  );
}
A.XPChart = XPChart;

function Heatmap({days}){
  return h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}},
    days.map(d=>h('div',{key:d.date,className:`heatmap-cell heatmap-${d.level}`,style:{aspectRatio:'1',borderRadius:4},title:`${d.date}: ${d.xp} XP`}))
  );
}
A.Heatmap = Heatmap;

function PageHeader({title,subtitle,gradient,onBack,actions}){
  return h('div',{style:{position:'relative',overflow:'hidden',
    background:gradient||'linear-gradient(135deg,#059669,#047857)',
    paddingTop:'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))',
    paddingBottom:'1.5rem',paddingLeft:'1.25rem',paddingRight:'1.25rem'}},
    h('div',{style:{position:'absolute',top:'-30%',right:'-15%',width:220,height:220,background:'rgba(255,255,255,0.07)',borderRadius:'50%',pointerEvents:'none'}}),
    h('div',{style:{position:'absolute',bottom:'-40%',left:'-10%',width:160,height:160,background:'rgba(255,255,255,0.05)',borderRadius:'50%',pointerEvents:'none'}}),
    h('div',{style:{position:'relative',zIndex:1}},
      h('div',{style:{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:12}},
          onBack&&h('button',{onClick:onBack,style:{flexShrink:0,width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer'}},
            h(Icon,{n:'arrowL',cls:'w-5 h-5 text-white'})),
          h('div',{},
            h('h1',{style:{fontSize:'1.25rem',fontWeight:900,color:'#fff',margin:0,letterSpacing:'-0.02em',lineHeight:1.2}},title),
            subtitle&&h('p',{style:{fontSize:13,marginTop:4,color:'rgba(255,255,255,0.7)',margin:0}},subtitle)
          )
        ),
        actions&&h('div',{style:{display:'flex',alignItems:'center',gap:8}},actions)
      )
    )
  );
}
A.PageHeader = PageHeader;

// ================================================================
// SIDEBAR NAV ITEMS — shared between Desktop and Mobile
// CRITICAL: All layout styles are INLINE (not CSS classes)
// This guarantees the sidebar always renders correctly regardless
// of CSS file loading order or Tailwind interference.
// ================================================================

// Section separator label
function NavSection({label,first=false}){
  return h('div',{style:{
    padding: first?'10px 12px 5px':'18px 12px 5px',
    borderTop: first?'none':'1px solid rgba(40,46,54,0.85)',
    marginTop: first?0:4,
    fontSize:9,fontWeight:800,letterSpacing:'0.14em',textTransform:'uppercase',
    color:'#374151',userSelect:'none',lineHeight:1,
  }},label);
}

// Individual nav button — FULLY inline-styled for guaranteed rendering
function NavBtn({label,icon,pg,onClick,badge,isNew,active,onNavClick}){
  const [hov,setHov]=useState(false);
  return h('button',{
    onClick:()=>{ if(onClick){onClick();}else{A.nav(pg);} if(onNavClick)onNavClick(); },
    onMouseEnter:()=>setHov(true),
    onMouseLeave:()=>setHov(false),
    // ALL LAYOUT INLINE — cannot be overridden by CSS issues
    style:{
      display:'flex',          // CRITICAL: flex row
      flexDirection:'row',     // CRITICAL: horizontal
      alignItems:'center',     // CRITICAL: vertically center icon+label
      width:'100%',            // CRITICAL: full width
      boxSizing:'border-box',
      minHeight:44,            // A1: 44px touch target
      padding:'7px 10px 7px 6px',
      marginBottom:2,
      gap:10,
      border:'none',
      borderLeft:`3px solid ${active?'#16a34a':'transparent'}`, // A2: left accent
      borderRadius:'0 9px 9px 0',
      background:active?'rgba(22,163,74,0.09)':hov?'rgba(255,255,255,0.04)':'transparent',
      cursor:'pointer',
      textAlign:'left',
      fontFamily:'inherit',
      transition:'background 0.14s',
      flexShrink:0,
    }
  },
    // Icon container — inline styled
    h('div',{style:{
      width:30,height:30,borderRadius:7,flexShrink:0,
      display:'flex',alignItems:'center',justifyContent:'center',
      background:active?'rgba(22,163,74,0.18)':'rgba(55,65,81,0.22)',
      transition:'background 0.14s',
    }},
      h(Icon,{n:icon,cls:'w-4 h-4',style:{color:active?'#4ade80':'#9ca3af',transition:'color 0.14s',flexShrink:0}})
    ),
    // Label — inline styled
    h('span',{style:{
      fontSize:13,fontWeight:600,flex:1,textAlign:'left',
      color:active?'#f0fdf4':'#9ca3af',
      whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',
      letterSpacing:'-0.01em',transition:'color 0.14s',
    }},label),
    badge&&h('span',{style:{fontSize:9,fontWeight:800,letterSpacing:'0.06em',textTransform:'uppercase',
      background:'rgba(217,119,6,0.15)',color:'#d97706',border:'1px solid rgba(217,119,6,0.3)',
      padding:'2px 6px',borderRadius:3,flexShrink:0}},badge),
    isNew&&h('span',{style:{fontSize:9,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',
      background:'rgba(22,163,74,0.13)',color:'#4ade80',border:'1px solid rgba(22,163,74,0.28)',
      padding:'2px 5px',borderRadius:3,flexShrink:0}},'NEW')
  );
}

// Level bar section — shared in both sidebar types
function SidebarLevelSection({p,info,streak}){
  return h('div',{style:{padding:'10px 14px 12px',borderBottom:'1px solid rgba(40,46,54,0.8)',background:'rgba(13,17,23,0.4)',flexShrink:0}},
    h(A.LevelBar,{totalXP:p.total_xp||0}),
    h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:7}},
      h('span',{style:{fontSize:11,color:'#374151'}},info.next?`${info.xpToNext.toLocaleString()} XP to next`:'Max Level'),
      streak>0&&h('div',{style:{display:'flex',alignItems:'center',gap:4}},
        h(Icon,{n:'flame',cls:'w-3.5 h-3.5',style:{color:'#fb923c'}}),
        h('span',{style:{fontSize:11,fontWeight:700,color:'#fb923c'}},`${streak}d`)
      )
    )
  );
}

// All nav items content — shared between desktop and mobile sidebars
function SidebarNavContent({currentPage,onNavClick,handleSmartStart}){
  const props = (label,icon,pg,extra={})=>({label,icon,pg,active:currentPage===pg,onNavClick,...extra});
  return h('div',{style:{
    display:'block',  // CRITICAL: block layout so each flex-button is on its own row
    padding:'2px 8px 16px',
    overflowY:'auto',
    flex:1,
    // Scrollbar styling
    scrollbarWidth:'thin',
    scrollbarColor:'rgba(48,54,61,0.9) transparent',
  }},
    h(NavSection,{label:'Premium',first:true}),
    h(NavBtn,{...props('AI Head Coach','cpu','AICoach'),badge:'PRO'}),
    h(NavBtn,{...props('90-Day Program','diamond','NinetyDay'),badge:'PRO'}),

    h(NavSection,{label:'Training'}),
    h(NavBtn,{...props('Home','home','Home')}),
    h(NavBtn,{label:'Smart Start',icon:'zap',onClick:handleSmartStart,active:false,onNavClick}),
    h(NavBtn,{...props('Cricket Drills','bat','Drills')}),
    h(NavBtn,{...props('Mental Training','brain','Mental')}),
    h(NavBtn,{...props('30-Day Challenge','target','ThirtyDay')}),
    h(NavBtn,{...props('Fitness Builder','dumbbell','Fitness')}),
    h(NavBtn,{...props('AI Workout','sparkles','AIWorkout')}),
    h(NavBtn,{...props('Timer','timer','Timer')}),

    h(NavSection,{label:'Performance'}),
    h(NavBtn,{...props('My Progress','barChart','Progress')}),
    h(NavBtn,{...props('Skill Paths','layers','SkillPaths')}),
    h(NavBtn,{...props('Leaderboard','trophy','Leaderboard')}),
    h(NavBtn,{...props('Goals','target','Goals')}),
    h(NavBtn,{...props('My Profile','user','Profile')}),

    h(NavSection,{label:'Planning'}),
    h(NavBtn,{...props('Training Schedule','calendar','Schedule'),isNew:true}),

    h(NavSection,{label:'AI & Analytics'}),
    h(NavBtn,{...props('ProVision™ Analysis','cpu','VideoAnalysis'),isNew:true}),
    h(NavBtn,{...props('Performance','chartLine','Performance'),isNew:true}),
    h(NavBtn,{...props('Match Logger','list','MatchLogger'),isNew:true}),
    h(NavBtn,{...props('Reaction Drill','zap','ReactionDrill'),isNew:true}),

    h(NavSection,{label:'Cricket Tools'}),
    h(NavBtn,{...props('Match Tracker','list','MatchTracker')}),
    h(NavBtn,{...props('MiniMatch IQ','puzzle','MiniMatch')}),
    h(NavBtn,{...props('Why Did I Get Out?','helpCircle','GetOut')}),
    h(NavBtn,{...props('Quizzes','book','Quizzes')}),

    h(NavSection,{label:'Account'}),
    h(NavBtn,{...props('Settings','settings','Settings')}),
  );
}

// ── DesktopSidebar — always visible on ≥768px screens ────────────
function DesktopSidebar({currentPage}){
  const {dark,toggle}=A.useTheme();
  const p=A.DB.getProgress(), info=A.getLevelInfo(p.total_xp||0), streak=p.current_streak||0;
  const handleSmartStart=()=>{
    if(currentPage!=='Home'){A.nav('Home');setTimeout(()=>{document.getElementById('smart-start')?.scrollIntoView({behavior:'smooth'});},200);}
    else{document.getElementById('smart-start')?.scrollIntoView({behavior:'smooth'});}
  };
  return h('div',{style:{
    width:260,flexShrink:0,display:'flex',flexDirection:'column',
    height:'100dvh',background:'#080b0f',
    borderRight:'1px solid rgba(36,42,50,0.95)',
    position:'sticky',top:0,
  }},
    // Header
    h('div',{style:{padding:'16px 14px 14px',borderBottom:'1px solid rgba(36,42,50,0.9)',flexShrink:0}},
      h('div',{style:{display:'flex',alignItems:'center',gap:10}},
        h('div',{style:{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#16a34a,#0d9488)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 10px rgba(22,163,74,0.3)'}},
          h(Icon,{n:'bat',cls:'w-5 h-5 text-white'})),
        h('div',{},
          h('div',{style:{fontSize:14,fontWeight:800,color:'#f0fdf4',letterSpacing:'0.01em',lineHeight:1.2}},'SMARTCRICK'),
          h('div',{style:{fontSize:11,fontWeight:600,color:'#34d399',marginTop:2}},`Lv.${info.level} · ${info.name}`)
        )
      )
    ),
    h(SidebarLevelSection,{p,info,streak}),
    h(SidebarNavContent,{currentPage,onNavClick:null,handleSmartStart}),
    // Dark mode toggle at bottom
    h('div',{style:{padding:'10px 14px',borderTop:'1px solid rgba(36,42,50,0.85)',flexShrink:0}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:9}},
          h('div',{style:{width:28,height:28,borderRadius:6,background:'rgba(48,54,61,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}},
            h(Icon,{n:dark?'moon':'sun',cls:'w-3.5 h-3.5',style:{color:'#6b7280'}})),
          h('span',{style:{fontSize:12,fontWeight:600,color:'#6b7280'}},'Dark Mode')
        ),
        h('button',{onClick:toggle,style:{position:'relative',width:40,height:22,borderRadius:11,background:dark?'#16a34a':'rgba(55,65,81,0.8)',border:'none',cursor:'pointer',transition:'background 0.25s',flexShrink:0}},
          h('div',{style:{position:'absolute',top:3,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'transform 0.25s',left:3,transform:dark?'translateX(18px)':'translateX(0)',boxShadow:'0 1px 4px rgba(0,0,0,0.35)'}})
        )
      )
    )
  );
}
A.DesktopSidebar = DesktopSidebar;

// ── Sidebar (mobile drawer) ───────────────────────────────────────
function Sidebar({open,onClose,currentPage}){
  const scrollRef=useRef(null), savedScroll=useRef(0);
  const {dark,toggle}=A.useTheme();
  const p=A.DB.getProgress(), info=A.getLevelInfo(p.total_xp||0), streak=p.current_streak||0;

  const handleClose=useCallback(()=>{savedScroll.current=scrollRef.current?.scrollTop||0;onClose();},[onClose]);
  useEffect(()=>{if(open&&scrollRef.current){requestAnimationFrame(()=>{if(scrollRef.current)scrollRef.current.scrollTop=savedScroll.current;});}},[open]);

  const handleSmartStart=()=>{
    handleClose();
    if(currentPage!=='Home'){A.nav('Home');setTimeout(()=>{document.getElementById('smart-start')?.scrollIntoView({behavior:'smooth'});},200);}
    else{document.getElementById('smart-start')?.scrollIntoView({behavior:'smooth'});}
  };

  return h(Fragment,null,
    // Backdrop
    h('div',{style:{
      position:'fixed',inset:0,zIndex:40,
      background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)',
      opacity:open?1:0,pointerEvents:open?'auto':'none',
      transition:'opacity 0.22s',
    },onClick:handleClose}),
    // Drawer
    h('div',{style:{
      position:'fixed',inset:'0 auto 0 0',zIndex:50,
      width:270,display:'flex',flexDirection:'column',
      background:'#080b0f',borderRight:'1px solid rgba(36,42,50,0.95)',
      boxShadow:'6px 0 50px rgba(0,0,0,0.7)',
      transform:open?'translateX(0)':'translateX(-100%)',
      transition:'transform 0.22s cubic-bezier(0.16,1,0.3,1)',
      willChange:'transform',
    }},
      // Header
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 14px',borderBottom:'1px solid rgba(36,42,50,0.9)',flexShrink:0}},
        h('div',{style:{display:'flex',alignItems:'center',gap:10}},
          h('div',{style:{width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#16a34a,#0d9488)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 10px rgba(22,163,74,0.3)'}},
            h(Icon,{n:'bat',cls:'w-5 h-5 text-white'})),
          h('div',{},
            h('div',{style:{fontSize:14,fontWeight:800,color:'#f0fdf4',letterSpacing:'0.01em',lineHeight:1.2}},'SMARTCRICK'),
            h('div',{style:{fontSize:11,fontWeight:600,color:'#34d399',marginTop:2}},`Lv.${info.level} · ${info.name}`)
          )
        ),
        h('button',{onClick:handleClose,style:{width:30,height:30,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(48,54,61,0.5)',border:'1px solid rgba(48,54,61,0.8)',cursor:'pointer',color:'#6b7280',flexShrink:0}},
          h(Icon,{n:'x',cls:'w-4 h-4'}))
      ),
      h(SidebarLevelSection,{p,info,streak}),
      // Scrollable nav
      h('div',{ref:scrollRef,style:{flex:1,overflowY:'auto',display:'block',scrollbarWidth:'thin',scrollbarColor:'rgba(48,54,61,0.9) transparent'}},
        h('div',{style:{display:'block',padding:'2px 8px 8px'}},
          h(SidebarNavContent,{currentPage,onNavClick:handleClose,handleSmartStart})
        )
      ),
      // Dark mode
      h('div',{style:{padding:'10px 14px',borderTop:'1px solid rgba(36,42,50,0.85)',flexShrink:0}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between'}},
          h('div',{style:{display:'flex',alignItems:'center',gap:9}},
            h('div',{style:{width:28,height:28,borderRadius:6,background:'rgba(48,54,61,0.4)',display:'flex',alignItems:'center',justifyContent:'center'}},
              h(Icon,{n:dark?'moon':'sun',cls:'w-3.5 h-3.5',style:{color:'#6b7280'}})),
            h('span',{style:{fontSize:12,fontWeight:600,color:'#6b7280'}},'Dark Mode')
          ),
          h('button',{onClick:toggle,style:{position:'relative',width:40,height:22,borderRadius:11,background:dark?'#16a34a':'rgba(55,65,81,0.8)',border:'none',cursor:'pointer',transition:'background 0.25s',flexShrink:0}},
            h('div',{style:{position:'absolute',top:3,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'transform 0.25s',left:3,transform:dark?'translateX(18px)':'translateX(0)',boxShadow:'0 1px 4px rgba(0,0,0,0.35)'}})
          )
        )
      )
    )
  );
}
A.Sidebar = Sidebar;

// ── BottomNav ─────────────────────────────────────────────────────
function BottomNav({page}){
  const items=[{n:'home',label:'Home',pg:'Home'},{n:'bat',label:'Drills',pg:'Drills'},{n:'brain',label:'Mental',pg:'Mental'},{n:'dumbbell',label:'Fitness',pg:'Fitness'},{n:'calendar',label:'Schedule',pg:'Schedule'}];
  return h('nav',{style:{position:'fixed',bottom:0,left:0,right:0,zIndex:40,background:'rgba(8,11,15,0.97)',backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',borderTop:'1px solid rgba(36,42,50,0.9)',paddingBottom:'max(0px,env(safe-area-inset-bottom))'}},
    h('div',{style:{display:'flex',alignItems:'center',height:58}},
      items.map(item=>{
        const active=page===item.pg;
        return h('button',{key:item.pg,onClick:()=>A.nav(item.pg),style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,height:'100%',position:'relative',background:'transparent',border:'none',cursor:'pointer',padding:0}},
          active&&h('div',{style:{position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:24,height:3,background:'#16a34a',borderRadius:'0 0 4px 4px'}}),
          h(Icon,{n:item.n,cls:'w-5 h-5',style:{color:active?'#4ade80':'#374151',transition:'color 0.15s'}}),
          h('span',{style:{fontSize:10,fontWeight:active?700:500,color:active?'#4ade80':'#374151',transition:'color 0.15s'}},item.label)
        );
      })
    )
  );
}
A.BottomNav = BottomNav;

function SectionLabel({children}){ return h('div',{className:'sc-section-label'},children); }
A.SectionLabel = SectionLabel;

// ================================================================
// APP-UI ADDITIONS — paste these into app-ui.js BEFORE the final
// console.log('[SC] app-ui...') line
// Fixes: adds TopBar, adds MoreMenu, fixes BottomNav props
// ================================================================

// ── TOP BAR (mobile header) ───────────────────────────────────────
// Shown on mobile only — hidden on desktop via CSS .sc-topbar
function TopBar(props) {
  var page = props.page;
  var title = props.title;
  var onMenuOpen = props.onMenuOpen;
  var onBack = props.onBack;
  var right = props.right;
  var label = title || page || 'SmartCrick AI';

  var [scrolled, setScrolled] = React.useState(false);
  React.useEffect(function() {
    var el = document.querySelector('.sc-main-column') || window;
    function onScroll() { setScrolled((el.scrollTop || window.scrollY) > 8); }
    el.addEventListener('scroll', onScroll, { passive: true });
    return function() { el.removeEventListener('scroll', onScroll); };
  }, []);

  return h('header', {
    className: 'sc-topbar',
    style: {
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 30,
      height: 'calc(52px + env(safe-area-inset-top,0px))',
      paddingTop: 'env(safe-area-inset-top,0px)',
      background: scrolled ? 'rgba(8,11,15,0.98)' : 'rgba(8,11,15,0.94)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: scrolled ? '1px solid rgba(36,42,50,0.95)' : '1px solid rgba(36,42,50,0.5)',
      transition: 'border-color 0.2s, background 0.2s',
    }
  },
    h('div', {
      style: {
        display: 'flex', alignItems: 'center', height: 52,
        padding: '0 4px 0 8px', gap: 4,
      }
    },
      // Left: hamburger or back
      onBack
        ? h('button', {
            onClick: onBack,
            'aria-label': 'Go back',
            style: {
              width: 40, height: 40, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            }
          },
            h(Icon, { n: 'arrowL', cls: 'w-5 h-5', style: { color: '#9ca3af' } })
          )
        : h('button', {
            onClick: onMenuOpen,
            'aria-label': 'Open navigation menu',
            style: {
              width: 40, height: 40, borderRadius: 10, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            }
          },
            h(Icon, { n: 'menu', cls: 'w-5 h-5', style: { color: '#9ca3af' } })
          ),

      // Center: logo + title
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 } },
        h('div', {
          'aria-hidden': 'true',
          style: {
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#16a34a,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(22,163,74,0.3)',
          }
        },
          h(Icon, { n: 'bat', cls: 'w-4 h-4', style: { color: '#fff' } })
        ),
        h('span', {
          style: {
            fontSize: label === 'SmartCrick AI' ? 15 : 14,
            fontWeight: label === 'SmartCrick AI' ? 800 : 700,
            color: '#f0fdf4',
            letterSpacing: label === 'SmartCrick AI' ? '-0.02em' : '-0.01em',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }
        }, label === 'SmartCrick AI' ? 'SmartCrick AI' : label)
      ),

      // Right: actions slot
      right
        ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 } }, right)
        : h('div', { style: { width: 40, flexShrink: 0 } }) // spacer for symmetry
    )
  );
}
A.TopBar = TopBar;

// ── MORE MENU — delegates to Sidebar ─────────────────────────────
// Backward-compat: app-root.js previously referenced MoreMenu.
// Now app-root.js uses A.Sidebar directly, but keep this as fallback.
function MoreMenu(props) {
  return h(A.Sidebar, { open: true, onClose: props.onClose || function(){}, currentPage: '' });
}
A.MoreMenu = MoreMenu;

// ── FIXED BOTTOM NAV ─────────────────────────────────────────────
// Changes: accepts 'page' prop (not 'currentPage'), 4 tabs: Today/Train/Progress/You
// Adds className 'sc-bottomnav' for CSS responsive hiding on desktop
function BottomNav(props) {
  // Accept both 'page' and 'currentPage' for backward compat
  var activePage = props.page || props.currentPage || '';

  var items = [
    { n: 'home',     label: 'Today',    pg: 'Home' },
    { n: 'bat',      label: 'Train',    pg: 'Drills' },
    { n: 'barChart', label: 'Progress', pg: 'Progress' },
    { n: 'user',     label: 'You',      pg: 'Profile' },
  ];

  return h('nav', {
    className: 'sc-bottomnav',
    'aria-label': 'Main navigation',
    style: {
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 40,
      background: 'rgba(8,11,15,0.97)',
      backdropFilter: 'blur(24px) saturate(1.8)',
      WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
      borderTop: '1px solid rgba(36,42,50,0.9)',
      paddingBottom: 'env(safe-area-inset-bottom,0px)',
    }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', height: 58 } },
      items.map(function(item) {
        var active = activePage === item.pg;
        return h('button', {
          key: item.pg,
          onClick: function() { A.nav(item.pg); },
          'aria-label': item.label,
          'aria-current': active ? 'page' : undefined,
          style: {
            flex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, height: '100%', position: 'relative',
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            outline: 'none',
          }
        },
          // Top accent bar for active
          active && h('div', {
            'aria-hidden': 'true',
            style: {
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: 20, height: 2.5,
              background: '#16a34a',
              borderRadius: '0 0 3px 3px',
            }
          }),
          h(Icon, {
            n: item.n,
            cls: 'w-5 h-5',
            style: {
              color: active ? '#4ade80' : '#374151',
              transition: 'color 0.15s',
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }
          }),
          h('span', {
            style: {
              fontSize: 10,
              fontWeight: active ? 700 : 500,
              color: active ? '#4ade80' : '#374151',
              transition: 'color 0.15s',
              letterSpacing: '-0.01em',
            }
          }, item.label)
        );
      })
    )
  );
}
A.BottomNav = BottomNav;

// (End of app-ui additions — the existing console.log('[SC] app-ui...') line follows below)  
console.log('[SC] app-ui v3.1 ready — inline sidebar, DesktopSidebar exported');
})();
