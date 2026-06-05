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
      h('div',{className:info.pct>80?'progress-close-to-win':'',style:{height:'100%',background:'linear-gradient(to right,#16a34a,#34d399)',width:`${info.pct}%`,borderRadius:99,transition:'width 0.7s'}}))
  );
  return h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center'}},
      h('span',{style:{fontSize:13,fontWeight:800,color:'#4ade80'}},`Level ${info.level} — ${info.name}`),
      h('span',{style:{fontSize:11,color:'#4b5563'}},info.next?`${info.xpToNext.toLocaleString()} XP to next`:'MAX LEVEL')
    ),
    h('div',{style:{height:6,borderRadius:99,background:'rgba(48,54,61,0.9)',overflow:'hidden',position:'relative'}},
      h('div',{className:info.pct>80?'progress-close-to-win':'',style:{height:'100%',background:'linear-gradient(to right,#16a34a,#34d399)',width:`${info.pct}%`,borderRadius:99,transition:'width 0.7s'}})
    )
  );
}
A.LevelBar = LevelBar;

function StreakBadge({streak=0}){
  if(!streak) return null;
  var hot = streak >= 7;
  return h('div',{style:{display:'inline-flex',alignItems:'center',gap:5,color:'#fb923c',fontSize:13,fontWeight:700,padding:'5px 10px',borderRadius:6,border:'1px solid rgba(251,146,60,0.25)',background:hot?'rgba(251,146,60,0.13)':'rgba(251,146,60,0.08)',flexShrink:0,whiteSpace:'nowrap'}},
    h('span',{style:{display:'inline-block',animation:hot?'scStreakPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both':'none'},'aria-hidden':'true'},
      h(Icon,{n:'flame',cls:'w-3.5 h-3.5'})),
    streak, streak===1?' day':' days');
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

function SkeletonCard({rows=3,cls=''}){
  var heights=[14,10,12];
  return h('div',{className:'sc-card '+cls,style:{padding:16}},
    Array.from({length:rows},function(_,i){
      return h('div',{key:i,className:'sc-skeleton',
        style:{height:heights[i%heights.length],marginBottom:i<rows-1?10:0,
          width:i===rows-1?'65%':'100%',borderRadius:6}});
    })
  );
}
A.SkeletonCard = SkeletonCard;

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
function SidebarNavContent({currentPage,onNavClick}){
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
    h(NavBtn,{...props('Crick','crick','Crick')}),
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
    h(NavBtn,{...props('Cricket Intelligence','zap','IntelligenceHub'),isNew:true}),
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
    h(SidebarNavContent,{currentPage,onNavClick:null}),
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
          h(SidebarNavContent,{currentPage,onNavClick:handleClose})
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
      background: 'rgba(10,13,20,0.96)',
      backdropFilter: 'blur(20px) saturate(1.6)',
      WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
      borderTop: '1px solid rgba(255,255,255,0.07)',
      paddingBottom: 'env(safe-area-inset-bottom,0px)',
      boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 -8px 32px rgba(0,0,0,0.45)',
    }
  },
    h('div', { style: { display: 'flex', alignItems: 'center', height: 62 } },
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
            height: '100%', position: 'relative',
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
            outline: 'none',
          }
        },
          // Top accent bar for active — wider, rounder, gradient
          active && h('div', {
            'aria-hidden': 'true',
            style: {
              position: 'absolute', top: 0, left: '50%',
              transform: 'translateX(-50%)',
              width: 32, height: 3,
              background: 'linear-gradient(to right, #16a34a, #22c55e)',
              borderRadius: '0 0 99px 99px',
            }
          }),
          // Active pill background behind icon+label
          active && h('div', { className: 'sc-nav-pill', 'aria-hidden': 'true' }),
          // Icon + label wrapper — z-index above pill
          h('div', {
            style: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }
          },
            h(Icon, {
              n: item.n,
              cls: 'w-5 h-5',
              style: {
                color: active ? '#4ade80' : '#5a6374',
                transition: 'color 0.2s cubic-bezier(0.34,1.56,0.64,1), transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                transform: active ? 'scale(1.15)' : 'scale(1)',
              }
            }),
            h('span', {
              style: {
                fontSize: 10,
                fontWeight: active ? 700 : 500,
                color: active ? '#4ade80' : '#5a6374',
                transition: 'color 0.2s cubic-bezier(0.34,1.56,0.64,1)',
                letterSpacing: '-0.01em',
              }
            }, item.label)
          )
        );
      })
    )
  );
}
A.BottomNav = BottomNav;

// ================================================================
// EMOTIONAL DESIGN COMPONENTS — Phase 2 + 5
// SpringBtn, MomentumBar, TactileXPChart, Badge3D
// Direct DOM-ref animations bypass React reconciler for 60fps.
// ================================================================

// ── SpringBtn — spring-physics CTA button ────────────────────────
function SpringBtn(props) {
  var label     = props.label;
  var onClick   = props.onClick;
  var state     = props.state    || 'idle';
  var btnClass  = props.className || 'btn-primary';
  var btnStyle  = props.style    || {};
  var disabled  = props.disabled || state === 'loading';

  var btnRef    = useRef(null);
  var cancelRef = useRef(null);

  function doSpring(from, to, cb) {
    if (cancelRef.current) cancelRef.current();
    var E = window.SC_APP && window.SC_APP.Emotion;
    if (!E || !E.springSubmit || E.prefersReducedMotion()) {
      if (btnRef.current) btnRef.current.style.transform = 'scale(' + to + ')';
      if (cb) cb();
      return;
    }
    cancelRef.current = E.runSpring(from, to, E.springSubmit,
      function (p) { if (btnRef.current) btnRef.current.style.transform = 'scale(' + p + ')'; },
      cb
    );
  }

  useEffect(function () {
    if (state === 'success' && btnRef.current) {
      doSpring(1, 1.08, function () { doSpring(1.08, 1, null); });
      var E = window.SC_APP && window.SC_APP.Emotion;
      if (E && E.fireSparkleSVG) E.fireSparkleSVG(btnRef.current, { count: 8, color: '#4ade80' });
    }
  }, [state]);

  useEffect(function () {
    return function () { if (cancelRef.current) cancelRef.current(); };
  }, []);

  var content = state === 'loading' ? '…' : state === 'success' ? '✓  Done' : label;

  return h('button', {
    ref: btnRef,
    className: 'em-spring-btn ' + btnClass,
    style: Object.assign({ transformOrigin: 'center', outline: 'none' }, btnStyle),
    disabled: disabled,
    onClick: onClick,
    onPointerDown:  function () { doSpring(1, 0.95, null); },
    onPointerUp:    function () { if (state !== 'success') doSpring(0.95, 1, null); },
    onPointerLeave: function () { if (state !== 'success') doSpring(0.95, 1, null); },
  }, content);
}
A.SpringBtn = SpringBtn;

// ── MomentumBar — spring-physics progress bar ────────────────────
function MomentumBar(props) {
  var pct       = props.pct       || 0;
  var height    = props.height    || 8;
  var gradient  = props.gradient  || 'linear-gradient(to right,#16a34a,#34d399)';
  var glowColor = props.glowColor || 'rgba(74,222,128,0.4)';
  var ariaLabel = props.ariaLabel;

  var fillRef   = useRef(null);
  var prevPct   = useRef(pct);
  var cancelRef = useRef(null);

  useEffect(function () {
    var from = prevPct.current;
    var to   = pct;
    prevPct.current = to;
    if (cancelRef.current) cancelRef.current();
    var E = window.SC_APP && window.SC_APP.Emotion;
    if (!E || E.prefersReducedMotion()) {
      if (fillRef.current) {
        fillRef.current.style.width = to + '%';
        fillRef.current.classList.toggle('progress-close-to-win', to > 80);
      }
      return;
    }
    var springFn = Math.abs(to - from) > 20
      ? E.createSpring(120, 12, 1) : E.springBar;
    cancelRef.current = E.runSpring(from, to, springFn, function (p) {
      if (fillRef.current) {
        fillRef.current.style.width = Math.max(0, p) + '%';
        fillRef.current.classList.toggle('progress-close-to-win', p > 80);
      }
    }, null);
    return function () { if (cancelRef.current) cancelRef.current(); };
  }, [pct]);

  return h('div', {
    style: { height: height, borderRadius: 99, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
    role: ariaLabel ? 'progressbar' : undefined,
    'aria-valuenow': ariaLabel ? Math.round(pct) : undefined,
    'aria-valuemin': ariaLabel ? 0 : undefined,
    'aria-valuemax': ariaLabel ? 100 : undefined,
  },
    h('div', {
      ref: fillRef,
      className: 'em-momentum-bar-fill',
      style: { width: pct + '%', background: gradient, boxShadow: '0 0 8px ' + glowColor },
    })
  );
}
A.MomentumBar = MomentumBar;

// ── TactileXPChart — SVG chart with radial glow + spring label ────
function TactileXPChart(props) {
  var days = props.days || [];
  var wrapRef  = useRef(null);
  var labelRef = useRef(null);
  var rafRef   = useRef(null);
  var springSt = useRef({ pos: 0, vel: 0 });
  var targetXP = useRef(0);
  var labelX   = useRef(0);
  var max = Math.max.apply(null, days.map(function (d) { return d.xp; }).concat([1]));

  function getIdx(clientX) {
    if (!wrapRef.current || !days.length) return -1;
    var rect = wrapRef.current.getBoundingClientRect();
    var bw   = rect.width / days.length;
    var E    = window.SC_APP && window.SC_APP.Emotion;
    var cl   = E ? E.clamp : function (v, a, b) { return Math.max(a, Math.min(b, v)); };
    return cl(Math.floor((clientX - rect.left) / bw), 0, days.length - 1);
  }

  function runLabel() {
    var E = window.SC_APP && window.SC_APP.Emotion;
    if (!E || !E.springChart) { rafRef.current = null; return; }
    var r = E.springChart(springSt.current.pos, springSt.current.vel, targetXP.current, 0.016);
    springSt.current.pos = r.pos; springSt.current.vel = r.vel;
    if (labelRef.current) {
      labelRef.current.textContent = Math.round(r.pos) + ' XP';
      labelRef.current.style.left  = labelX.current + 'px';
    }
    rafRef.current = r.done ? null : requestAnimationFrame(runLabel);
  }

  function onInteract(clientX, clientY) {
    if (!wrapRef.current) return;
    var idx = getIdx(clientX);
    if (idx < 0 || idx >= days.length) return;
    var rect = wrapRef.current.getBoundingClientRect();
    var rx = ((clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    var ry = ((clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
    wrapRef.current.style.backgroundImage =
      'radial-gradient(circle 54px at ' + rx + ' ' + ry + ', rgba(74,222,128,0.2) 0%, transparent 70%)';
    targetXP.current = days[idx].xp;
    labelX.current = (idx + 0.5) * (rect.width / days.length);
    if (labelRef.current) labelRef.current.classList.add('visible');
    if (!rafRef.current) runLabel();
  }

  function onLeave() {
    if (wrapRef.current) wrapRef.current.style.backgroundImage = 'none';
    if (labelRef.current) labelRef.current.classList.remove('visible');
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }

  useEffect(function () { return function () { if (rafRef.current) cancelAnimationFrame(rafRef.current); }; }, []);

  var svgH = 72, bw = 36;

  return h('div', {
    ref: wrapRef,
    className: 'em-chart-tactile',
    style: { width: '100%', position: 'relative' },
    onMouseMove:  function (e) { onInteract(e.clientX, e.clientY); },
    onMouseLeave: onLeave,
    onTouchMove:  function (e) { if (e.touches[0]) onInteract(e.touches[0].clientX, e.touches[0].clientY); },
    onTouchEnd:   onLeave,
  },
    h('div', { ref: labelRef, className: 'em-chart-label' }),
    h('svg', {
      style: { width: '100%', height: svgH + 20, display: 'block', overflow: 'visible' },
      viewBox: '0 0 ' + (days.length * bw) + ' ' + (svgH + 20),
      preserveAspectRatio: 'none',
    },
      h('defs', null,
        h('linearGradient', { id: 'em-xp-grad', x1: '0', y1: '0', x2: '0', y2: '1' },
          h('stop', { offset: '0%',   stopColor: '#34d399' }),
          h('stop', { offset: '100%', stopColor: '#059669' })
        ),
        h('filter', { id: 'em-bar-glow', x: '-40%', y: '-40%', width: '180%', height: '180%' },
          h('feGaussianBlur', { stdDeviation: '3', result: 'blur' }),
          h('feMerge', null, h('feMergeNode', { in: 'blur' }), h('feMergeNode', { in: 'SourceGraphic' }))
        )
      ),
      days.map(function (d, i) {
        var barH = Math.max(3, (d.xp / max) * svgH);
        var x    = i * bw + 4;
        return h('g', { key: d.date },
          h('rect', {
            x: x, y: svgH - barH, width: 28, height: barH, rx: 3,
            fill: d.xp > 0 ? 'url(#em-xp-grad)' : 'rgba(30,41,59,0.6)',
          }),
          h('text', {
            x: x + 14, y: svgH + 14,
            textAnchor: 'middle',
            style: { fontSize: 9, fill: '#4b5563', fontWeight: 500, fontFamily: 'Inter,system-ui,sans-serif' },
          }, d.label)
        );
      })
    )
  );
}
A.TactileXPChart = TactileXPChart;

// ── Badge3D — 3D tilt card with glint + unlock ceremony ──────────
function Badge3D(props) {
  var badgeId = props.badgeId;
  var def     = props.def;
  var earned  = props.earned;
  var cardRef = useRef(null);
  var glintRef= useRef(null);

  function resetTilt() {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.32s cubic-bezier(0.16,1,0.3,1)';
    cardRef.current.style.transform  = 'perspective(280px) rotateY(0deg) rotateX(0deg) scale(1)';
    if (glintRef.current) glintRef.current.style.opacity = '0';
    setTimeout(function () { if (cardRef.current) cardRef.current.style.transition = ''; }, 350);
  }

  function onMove(e) {
    if (!earned || !cardRef.current) return;
    var E = window.SC_APP && window.SC_APP.Emotion;
    if (E && E.prefersReducedMotion()) return;
    var rect = cardRef.current.getBoundingClientRect();
    var dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    var dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    cardRef.current.style.transform =
      'perspective(280px) rotateY(' + (dx * 18) + 'deg) rotateX(' + (-dy * 12) + 'deg) scale(1.04)';
    if (glintRef.current) {
      glintRef.current.style.background =
        'radial-gradient(circle at ' + (50+dx*30) + '% ' + (50+dy*30) + '%, rgba(255,255,255,0.22) 0%, transparent 65%)';
      glintRef.current.style.opacity = '1';
    }
  }

  useEffect(function () {
    function onUnlock(detail) {
      if (!detail || !detail.ids || detail.ids.indexOf(badgeId) === -1) return;
      if (!cardRef.current) return;
      cardRef.current.classList.add('em-badge-unlock');
      cardRef.current.addEventListener('animationend', function h2() {
        cardRef.current && cardRef.current.classList.remove('em-badge-unlock');
        cardRef.current && cardRef.current.removeEventListener('animationend', h2);
      }, { once: true });
      var E = window.SC_APP && window.SC_APP.Emotion;
      if (E && E.fireSparkleSVG) E.fireSparkleSVG(cardRef.current, { count: 10, color: '#4ade80', radius: 30 });
    }
    var E = window.SC_APP && window.SC_APP.Emotion;
    if (E) E.on('sc_badge_unlock', onUnlock);
    return function () { if (E) E.off('sc_badge_unlock', onUnlock); };
  }, [badgeId]);

  return h('div', {
    ref: cardRef,
    'data-badge-id': badgeId,
    className: earned ? 'em-card-3d' : '',
    onMouseMove:  earned ? onMove     : undefined,
    onMouseLeave: earned ? resetTilt  : undefined,
    style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: 12, borderRadius: 12, textAlign: 'center',
      background: earned ? 'rgba(16,185,129,0.08)' : 'rgba(15,23,42,0.4)',
      border: '1px solid ' + (earned ? 'rgba(16,185,129,0.25)' : 'rgba(51,65,85,0.3)'),
      opacity: earned ? 1 : 0.4,
      position: 'relative',
    },
  },
    earned && h('div', { ref: glintRef, className: 'em-glint' }),
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' } },
      earned
        ? h(Icon, { n: def.icon, cls: 'w-6 h-6', style: { color: '#e6edf3' } })
        : h(Icon, { n: 'lock',   cls: 'w-5 h-5', style: { color: '#484f58' } })
    ),
    h('span', { style: { fontSize: '0.65rem', fontWeight: 800, color: earned ? '#f8fafc' : '#64748b' } }, def.label)
  );
}
A.Badge3D = Badge3D;

// ── Progress Rings — Apple Activity-style triple concentric SVG ──
function ProgressRings(props) {
  var content      = props.content      || {done:0, target:3};
  var contribution = props.contribution || {xp:0, target:150};
  var consistency  = props.consistency  || {streak:0, target:7};
  var onRingClick  = props.onRingClick  || function(){};

  var SIZE = 240, CX = 120, CY = 120;
  var rings = [
    {key:'content',      r:104, sw:16, color:'#FF375F', trk:'rgba(255,55,95,0.13)',  value:content.done,       max:Math.max(content.target,1),      label:'Content',      sub:'Drills'},
    {key:'contribution', r:82,  sw:15, color:'#92F736', trk:'rgba(146,247,54,0.12)', value:contribution.xp,    max:Math.max(contribution.target,1), label:'Contribution', sub:'XP Earned'},
    {key:'consistency',  r:60,  sw:14, color:'#62F4EB', trk:'rgba(98,244,235,0.11)', value:consistency.streak, max:Math.max(consistency.target,1),  label:'Consistency',  sub:'Day Streak'},
  ];
  var prevPcts = useRef({content:0, contribution:0, consistency:0});
  var animRef  = useRef(false);
  var xpRef    = useRef(null);

  // Inject keyframe CSS once
  useEffect(function() {
    var sid = 'sc-ring-apple-v3';
    if (!document.getElementById(sid)) {
      var el = document.createElement('style'); el.id = sid;
      el.textContent = [
        '@keyframes sc_ring_glow_red  {0%,100%{filter:drop-shadow(0 0 6px #FF375F88)}50%{filter:drop-shadow(0 0 18px #FF375F)}}',
        '@keyframes sc_ring_glow_green{0%,100%{filter:drop-shadow(0 0 6px #92F73688)}50%{filter:drop-shadow(0 0 18px #92F736)}}',
        '@keyframes sc_ring_glow_cyan {0%,100%{filter:drop-shadow(0 0 6px #62F4EB88)}50%{filter:drop-shadow(0 0 18px #62F4EB)}}',
        '.sc-ring-glow-red  {animation:sc_ring_glow_red   1.8s ease-in-out infinite}',
        '.sc-ring-glow-green{animation:sc_ring_glow_green 1.8s ease-in-out infinite;animation-delay:0.6s}',
        '.sc-ring-glow-cyan {animation:sc_ring_glow_cyan  1.8s ease-in-out infinite;animation-delay:1.2s}',
        '@keyframes sc_ring_hub_pulse{0%,100%{opacity:0.55}50%{opacity:0.75}}',
      ].join('\n');
      document.head.appendChild(el);
    }
  }, []);

  // GSAP mount animation — arcs fill from 0 to pct on first render
  useEffect(function() {
    if (animRef.current) return;
    animRef.current = true;
    var gsap = window.gsap;
    if (!gsap) return;
    rings.forEach(function(ring, i) {
      var pct  = Math.min(1, ring.value / ring.max);
      var circ = 2 * Math.PI * ring.r;
      var el   = document.getElementById('sc-ring-arc-' + ring.key);
      if (!el) return;
      gsap.fromTo(el,
        { attr: { strokeDashoffset: circ } },
        { attr: { strokeDashoffset: circ * (1 - pct) },
          duration: 1.5, delay: 0.1 + i * 0.16, ease: 'power3.out' }
      );
    });
    // Animate center XP count-up
    var xpEl = xpRef.current;
    if (xpEl) {
      var target = contribution.xp || 0;
      var obj = { val: 0 };
      gsap.to(obj, { val: target, duration: 1.4, delay: 0.3, ease: 'power2.out',
        onUpdate: function() { if (xpEl) xpEl.textContent = Math.round(obj.val); }
      });
    }
  }, []);

  // Ring completion haptic + event
  useEffect(function() {
    rings.forEach(function(ring) {
      var pct  = Math.min(1, ring.value / ring.max);
      var prev = prevPcts.current[ring.key] || 0;
      if (pct >= 1 && prev < 1) {
        if (navigator.vibrate) navigator.vibrate([80, 40, 100]);
        if (A.Emotion) try { A.Emotion.emit('sc_ring_complete', {ring: ring.key}); } catch(e) {}
      }
      prevPcts.current[ring.key] = pct;
    });
  }, [content.done, contribution.xp, consistency.streak]);

  var glowMap = {'#FF375F':'sc-ring-glow-red','#92F736':'sc-ring-glow-green','#62F4EB':'sc-ring-glow-cyan'};

  // Get level info for center hub
  var levelInfo = null;
  try {
    var p = A.DB ? A.DB.getProgress() : {};
    levelInfo = A.getLevelInfo ? A.getLevelInfo(p.total_xp || 0) : null;
  } catch(e) {}

  return h('div', {
    style: { display:'flex', flexDirection:'column', alignItems:'center', gap:18 },
    onClick: onRingClick,
    role: 'button', 'aria-label': 'View progress details', tabIndex: 0,
  },
    h('svg', {
      width: SIZE, height: SIZE, viewBox: '0 0 240 240',
      style: { cursor:'pointer', overflow:'visible', display:'block', filter:'drop-shadow(0 4px 24px rgba(0,0,0,0.45))' },
    },
      // SVG defs for radial gradients (per ring)
      h('defs', null,
        rings.map(function(ring) {
          return h('radialGradient', { key:'g'+ring.key, id:'sc-rg-'+ring.key, cx:'50%', cy:'50%', r:'50%' },
            h('stop', { offset:'0%',   stopColor: ring.color, stopOpacity:'0.55' }),
            h('stop', { offset:'100%', stopColor: ring.color, stopOpacity:'1'    }),
          );
        }),
        // Center hub gradient
        h('radialGradient', { id:'sc-rg-hub', cx:'40%', cy:'35%', r:'65%' },
          h('stop', { offset:'0%',   stopColor:'#1e293b', stopOpacity:'1' }),
          h('stop', { offset:'100%', stopColor:'#0a0e14', stopOpacity:'1' }),
        )
      ),

      // Center dark hub disc (behind everything)
      h('circle', { cx:CX, cy:CY, r:40, fill:'url(#sc-rg-hub)', stroke:'rgba(255,255,255,0.04)', strokeWidth:1 }),

      // Build rings outer → inner
      rings.map(function(ring) {
        var rawPct = ring.value / ring.max;
        var pct  = Math.min(rawPct, 1);
        var over = rawPct > 1 ? Math.min(rawPct - 1, 1) : 0;
        var circ = 2 * Math.PI * ring.r;
        var gCls = pct >= 0.9 ? glowMap[ring.color] : '';

        return h(Fragment, { key: ring.key },
          // Track arc (faint colored)
          h('circle', {
            cx: CX, cy: CY, r: ring.r,
            fill: 'none', stroke: ring.trk,
            strokeWidth: ring.sw,
          }),
          // Round track end-caps for closed look (start dot)
          h('circle', {
            cx: CX, cy: CY - ring.r, r: ring.sw / 2,
            fill: ring.trk,
          }),
          // Progress arc (animated via GSAP on mount)
          h('circle', {
            id: 'sc-ring-arc-' + ring.key,
            cx: CX, cy: CY, r: ring.r,
            fill: 'none', stroke: 'url(#sc-rg-'+ring.key+')',
            strokeWidth: ring.sw, strokeLinecap: 'round',
            strokeDasharray: circ, strokeDashoffset: circ * (1 - pct),
            transform: 'rotate(-90 120 120)',
            style: { transition: 'stroke-dashoffset 0.75s cubic-bezier(0.16,1,0.3,1)' },
            className: gCls,
          }),
          // Overflow arc (bright white layer — Apple Watch style)
          over > 0 && h('circle', {
            cx: CX, cy: CY, r: ring.r,
            fill: 'none', stroke: '#fff',
            strokeWidth: ring.sw - 4, strokeLinecap: 'round', opacity: 0.6,
            strokeDasharray: circ,
            strokeDashoffset: circ * (1 - Math.min(over, 0.9) * 0.35),
            transform: 'rotate(-90 120 120)',
          }),
        );
      }),

      // Center XP value (animated count-up via ref)
      h('text', { x: CX, y: CY - 12, textAnchor:'middle',
        style:{ fontSize:10, fill:'#64748b', fontWeight:700, fontFamily:'system-ui', letterSpacing:'0.12em' }
      }, 'TODAY'),
      h('text', {
        x: CX, y: CY + 12, textAnchor:'middle',
        style:{ fontSize:26, fill:'#f1f5f9', fontWeight:900, fontFamily:'system-ui', letterSpacing:'-0.025em' },
        ref: xpRef,
      }, String(contribution.xp || 0)),
      h('text', { x: CX, y: CY + 26, textAnchor:'middle',
        style:{ fontSize:9.5, fill:'#334155', fontWeight:700, fontFamily:'system-ui', letterSpacing:'0.07em' }
      }, 'XP'),

      // Level badge below center (if available)
      levelInfo && h('text', { x: CX, y: CY + 40, textAnchor:'middle',
        style:{ fontSize:8.5, fill: '#4ade80', fontWeight:700, fontFamily:'system-ui', letterSpacing:'0.05em', textTransform:'uppercase' }
      }, 'Lv ' + (levelInfo.level || 1)),
    ),

    // Ring labels — 3 columns, rich layout
    h('div', { style:{ display:'flex', gap:6, alignItems:'stretch', width:'100%', maxWidth:260 } },
      rings.map(function(ring) {
        var rawPct = ring.value / ring.max;
        var pct    = Math.min(rawPct, 1);
        var pctStr = Math.round(pct * 100) + '%';
        var isComplete = pct >= 1;
        var valueStr = ring.key === 'content'
          ? content.done + '/' + content.target
          : ring.key === 'contribution'
            ? (contribution.xp || 0).toLocaleString()
            : (consistency.streak || 0) + 'd';

        return h('div', {
          key: ring.key,
          style:{
            flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            padding:'8px 4px 7px',
            background: isComplete ? ('rgba('+hexToRgb(ring.color)+',0.08)') : 'rgba(255,255,255,0.025)',
            borderRadius:10,
            border: '1px solid ' + (isComplete ? ring.color + '44' : 'rgba(255,255,255,0.04)'),
          }
        },
          // Color dot with glow
          h('div', { style:{
            width:8, height:8, borderRadius:'50%',
            background: ring.color,
            opacity: pct > 0 ? 1 : 0.2,
            boxShadow: pct > 0.1 ? ('0 0 10px '+ring.color+'99') : 'none',
            transition:'box-shadow 0.4s',
          }}),
          // Value
          h('div', { style:{
            fontSize:14, fontWeight:900,
            color: pct > 0 ? '#f1f5f9' : '#374151',
            fontFamily:'system-ui', letterSpacing:'-0.02em', lineHeight:1,
          }}, valueStr),
          // Sub label
          h('div', { style:{
            fontSize:9, fontWeight:700, color:'#475569',
            textTransform:'uppercase', letterSpacing:'0.07em',
          }}, ring.sub),
          // Progress bar
          h('div', { style:{ width:'80%', height:2.5, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' } },
            h('div', { style:{
              height:'100%', borderRadius:2,
              width: pctStr,
              background: ring.color,
              transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: pct > 0 ? ('0 0 6px '+ring.color) : 'none',
            }})
          ),
        );
      })
    )
  );
}

// hex helper for ring labels rgba
function hexToRgb(hex) {
  var r = parseInt(hex.slice(1,3),16);
  var g = parseInt(hex.slice(3,5),16);
  var b = parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
}

A.ProgressRings = ProgressRings;

// ── Minimalist Mode (MIN-1) ───────────────────────────────────────
function useMinimalistMode() {
  var [isMin, setIsMin] = useState(function(){ return !!(A.DB && A.DB.get('minimalist_mode')); });
  useEffect(function(){
    function onUpdate(){ setIsMin(!!(A.DB && A.DB.get('minimalist_mode'))); }
    window.addEventListener('sc_update', onUpdate);
    return function(){ window.removeEventListener('sc_update', onUpdate); };
  }, []);
  return isMin;
}
A.useMinimalistMode = useMinimalistMode;

function MinimalistToggle() {
  var isMin = useMinimalistMode();
  function toggle() {
    if (A.DB) { A.DB.set('minimalist_mode', !isMin); window.dispatchEvent(new CustomEvent('sc_update')); }
  }
  return h('div', {style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 0',borderBottom:'1px solid rgba(255,255,255,0.06)'}},
    h('div',null,
      h('div',{style:{fontSize:14,fontWeight:700,color:'#f0fdf4',marginBottom:2}},'Focus Mode'),
      h('div',{style:{fontSize:12,color:'#6b7280'}},'Show only drills, rings, and mission')
    ),
    h('button',{
      onClick:toggle,
      style:{width:44,height:24,borderRadius:12,border:'none',cursor:'pointer',
        background:isMin?'#10b981':'rgba(255,255,255,0.1)',position:'relative',transition:'background 0.2s',flexShrink:0}
    },
      h('div',{style:{position:'absolute',top:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s ease',left:isMin?22:2}})
    )
  );
}
A.MinimalistToggle = MinimalistToggle;

// ── Kudos Overlay (KDO-UI) ────────────────────────────────────────
function KudosOverlay() {
  var [item, setItem] = useState(null);
  var [visible, setVisible] = useState(false);
  var timerRef = useRef(null);

  useEffect(function() {
    if (!A.KudosService) return;
    function onKudos(k) {
      setItem(k); setVisible(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(function(){ setVisible(false); }, 4200);
    }
    A.KudosService.onKudos(onKudos);
    return function(){ A.KudosService.offKudos(onKudos); };
  }, []);

  useEffect(function() {
    var sid = 'sc-kudos-anim';
    if (!document.getElementById(sid)) {
      var el = document.createElement('style'); el.id = sid;
      el.textContent = '@keyframes kudosSlide{from{transform:translateX(120%);opacity:0}to{transform:translateX(0);opacity:1}} .sc-kudos-enter{animation:kudosSlide 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards}';
      document.head.appendChild(el);
    }
  }, []);

  if (!visible || !item) return null;
  return h('div',{
    className:'sc-kudos-enter',
    style:{position:'fixed',top:72,right:12,zIndex:9990,maxWidth:280,
      background:'rgba(16,24,32,0.97)',border:'1px solid rgba(16,185,129,0.35)',
      borderRadius:14,padding:'12px 14px',boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
      backdropFilter:'blur(12px)',display:'flex',flexDirection:'column',gap:6}
  },
    h('div',{style:{display:'flex',alignItems:'center',gap:8}},
      h('div',{style:{fontSize:18}},'🏏'),
      h('div',{style:{fontSize:12,fontWeight:800,color:'#10b981'}}, item.cricketerName||'The Dressing Room')
    ),
    h('div',{style:{fontSize:12,color:'#e2e8f0',lineHeight:1.4}}, item.message),
    item.tip && h('div',{style:{fontSize:11,color:'#6b7280',borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:6,marginTop:2,fontStyle:'italic'}},
      '"'+item.tip+'"')
  );
}
A.KudosOverlay = KudosOverlay;

// (End of app-ui additions — the existing console.log('[SC] app-ui...') line follows below)
console.log('[SC] app-ui v3.3 ready — ProgressRings, KudosOverlay, MinimalistToggle');
})();
