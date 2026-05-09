// ================================================================
// Save as: app-ui.js
// SmartCrick AI — Shared UI Components
// UPDATED: A1 Sidebar 48px items, A2 active left-bar indicator,
//          A3 SectionLabel separators, cleaner dark mode toggle
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useCallback, useRef, useContext, Fragment } = React;
const A = window.SC_APP;

// ── Icon Component ────────────────────────────────────────────────
function Icon({ n, cls='w-5 h-5', style }) {
  return h('svg', {
    className:cls, style,
    xmlns:'http://www.w3.org/2000/svg',
    viewBox:'0 0 24 24', fill:'none',
    stroke:'currentColor', strokeWidth:2,
    strokeLinecap:'round', strokeLinejoin:'round',
    'aria-hidden':true,
    dangerouslySetInnerHTML:{ __html: A.IC[n]||A.IC.info }
  });
}
A.Icon = Icon;

// ── Spinner ───────────────────────────────────────────────────────
function Spinner({ cls='' }) {
  return h('div', { className:`flex items-center justify-center py-16 ${cls}` },
    h('div', { className:'w-10 h-10 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin' })
  );
}
A.Spinner = Spinner;

// ── LevelBar ──────────────────────────────────────────────────────
function LevelBar({ totalXP, compact=false }) {
  const info = A.getLevelInfo(totalXP||0);
  if(compact) return h('div',{className:'flex items-center gap-2'},
    h('span',{className:'text-xs font-black text-emerald-400 whitespace-nowrap'},`Lv.${info.level}`),
    h('div',{className:'flex-1 h-1.5 rounded-full bg-slate-700/80 overflow-hidden'},
      h('div',{className:'h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700',style:{width:`${info.pct}%`}})
    )
  );
  return h('div',{className:'space-y-2'},
    h('div',{className:'flex justify-between items-center'},
      h('span',{className:'text-sm font-black text-emerald-400'},`Level ${info.level} — ${info.name}`),
      h('span',{className:'text-xs text-slate-500'},info.next?`${info.xpToNext.toLocaleString()} XP to next`:'MAX LEVEL')
    ),
    h('div',{className:'h-2 rounded-full bg-slate-700/80 overflow-hidden'},
      h('div',{className:'h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 relative',style:{width:`${info.pct}%`}},
        h('div',{className:'absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent',style:{animation:'shimmer 2s ease-in-out infinite'}})
      )
    )
  );
}
A.LevelBar = LevelBar;

// ── StreakBadge ───────────────────────────────────────────────────
function StreakBadge({ streak=0 }) {
  if(!streak) return h('div',{style:{display:'flex',alignItems:'center',gap:6,padding:'5px 10px',
    borderRadius:6,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
    h(Icon,{n:'bat',cls:'w-3.5 h-3.5',style:{color:'#374151'}}),
    h('span',{style:{fontSize:11,fontWeight:600,color:'#484f58'}},'No streak yet')
  );
  return h('div',{className:'streak-badge'},
    h(Icon,{n:'flame',cls:'w-3.5 h-3.5'}),
    streak, streak===1?' day':' days'
  );
}
A.StreakBadge = StreakBadge;

// ── XPBadge ───────────────────────────────────────────────────────
function XPBadge({ xp }) {
  return h('span',{style:{display:'inline-flex',alignItems:'center',gap:4,padding:'2px 8px',
    borderRadius:5,fontSize:11,fontWeight:700,background:'rgba(22,163,74,0.1)',
    border:'1px solid rgba(22,163,74,0.25)',color:'#4ade80'}},
    h(Icon,{n:'zap',cls:'w-3 h-3'}), `${xp} XP`
  );
}
A.XPBadge = XPBadge;

// ── PremiumBadge ──────────────────────────────────────────────────
function PremiumBadge({ label='PRO' }) {
  return h('span',{className:'premium-badge'},label);
}
A.PremiumBadge = PremiumBadge;

// ── StatCard ──────────────────────────────────────────────────────
function StatCard({ label, value, color='text-emerald-400', icon, sub, cls='' }) {
  return h('div',{className:`stat-card ${cls}`},
    h('div',{style:{display:'flex',alignItems:'center',gap:6,marginBottom:4}},
      icon && h(Icon,{n:icon,cls:'w-3.5 h-3.5',style:{color:color.replace('text-','').includes('#')?color:'inherit'}}),
      h('span',{style:{fontSize:10,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},label)
    ),
    h('div',{style:{fontSize:22,fontWeight:800,fontVariantNumeric:'tabular-nums',lineHeight:1,
      color:color.startsWith('#')?color:'inherit'},className:color.startsWith('text-')?color:''},value),
    sub && h('div',{style:{fontSize:11,color:'#484f58',marginTop:4}},sub)
  );
}
A.StatCard = StatCard;

// ── EmptyState ────────────────────────────────────────────────────
function EmptyState({ icon='bat', title, desc, action }) {
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
    padding:'48px 24px',textAlign:'center'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:icon||'bat',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('h3',{style:{fontSize:15,fontWeight:700,color:'#8b949e',marginBottom:8}},title),
    h('p',{style:{fontSize:13,color:'#484f58',maxWidth:240,lineHeight:1.6,marginBottom:24}},desc),
    action && h('button',{onClick:action.fn,className:'btn-primary',style:{width:'auto',padding:'10px 24px',fontSize:13}},action.label)
  );
}
A.EmptyState = EmptyState;

// ── XPChart ───────────────────────────────────────────────────────
function XPChart({ days }) {
  const max=Math.max(...days.map(d=>d.xp),1);
  return h('div',{className:'flex items-end gap-1.5 h-20 w-full'},
    days.map(d=>
      h('div',{key:d.date,className:'flex flex-col items-center gap-1 flex-1'},
        h('div',{
          className:'w-full rounded-t-sm transition-all duration-500',
          style:{height:`${Math.max(3,(d.xp/max)*72)}px`,
            background:d.xp>0?'linear-gradient(to top,#059669,#34d399)':'rgba(30,41,59,0.6)',
            borderRadius:'3px 3px 0 0'},
          title:`${d.xp} XP`
        }),
        h('span',{className:'text-xs text-slate-500 font-medium'},d.label)
      )
    )
  );
}
A.XPChart = XPChart;

// ── Heatmap ───────────────────────────────────────────────────────
function Heatmap({ days }) {
  return h('div',{className:'grid grid-cols-7 gap-1.5'},
    days.map((d)=>
      h('div',{key:d.date,
        className:`heatmap-cell heatmap-${d.level}`,
        style:{aspectRatio:'1',borderRadius:'4px'},
        title:`${d.date}: ${d.xp} XP`
      })
    )
  );
}
A.Heatmap = Heatmap;

// ── SectionLabel ──────────────────────────────────────────────────
function SectionLabel({ children, first=false }) {
  return h('div', {
    className: first ? 'sc-section-label sc-section-label--first' : 'sc-section-label'
  }, children);
}
A.SectionLabel = SectionLabel;

// ── PageHeader ────────────────────────────────────────────────────
function PageHeader({ title, subtitle, gradient, onBack, actions }) {
  return h('div',{
    className:'relative overflow-hidden',
    style:{background:gradient||'linear-gradient(135deg,#059669,#047857)',
      paddingTop:'max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))',
      paddingBottom:'1.5rem',paddingLeft:'1.25rem',paddingRight:'1.25rem'}
  },
    h('div',{style:{position:'absolute',top:'-30%',right:'-15%',width:'220px',height:'220px',
      background:'rgba(255,255,255,0.07)',borderRadius:'50%',pointerEvents:'none'}}),
    h('div',{style:{position:'absolute',bottom:'-40%',left:'-10%',width:'160px',height:'160px',
      background:'rgba(255,255,255,0.05)',borderRadius:'50%',pointerEvents:'none'}}),
    h('div',{className:'relative z-10'},
      h('div',{className:'flex items-start justify-between'},
        h('div',{className:'flex items-center gap-3'},
          onBack && h('button',{onClick:onBack,
            className:'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
            style:{background:'rgba(255,255,255,0.15)'}},
            h(Icon,{n:'arrowL',cls:'w-5 h-5 text-white'})
          ),
          h('div',{},
            h('h1',{className:'text-xl font-black text-white tracking-tight leading-tight'},title),
            subtitle && h('p',{className:'text-sm mt-0.5',style:{color:'rgba(255,255,255,0.7)'}},subtitle)
          )
        ),
        actions && h('div',{className:'flex items-center gap-2'},actions)
      )
    )
  );
}
A.PageHeader = PageHeader;

// ================================================================
// SIDEBAR — A1 + A2 + A3: Fully redesigned for professionalism
// 48px touch targets, left-accent active state, clear section sep.
// ================================================================
function Sidebar({ open, onClose, currentPage }) {
  const scrollRef = useRef(null);
  const savedScroll = useRef(0);
  const { dark, toggle } = A.useTheme();
  const p = A.DB.getProgress();
  const info = A.getLevelInfo(p.total_xp||0);
  const streak = p.current_streak||0;

  const handleClose = useCallback(()=>{
    savedScroll.current = scrollRef.current?.scrollTop||0;
    onClose();
  },[onClose]);

  useEffect(()=>{
    if(open && scrollRef.current){
      requestAnimationFrame(()=>{ if(scrollRef.current) scrollRef.current.scrollTop=savedScroll.current; });
    }
  },[open]);

  // ── NavBtn: A1 min-height 48px, A2 left-accent active state ────
  function NavBtn({ label, icon, pg, onClick, badge, isNew }) {
    const active = currentPage===pg;
    return h('button',{
      onClick: onClick||(()=>{ A.nav(pg); handleClose(); }),
      className: `sc-nav-btn${active?' active':''}`,
      'aria-current': active ? 'page' : undefined,
    },
      // Icon — green when active, muted when not
      h('div',{style:{
        width:32,height:32,borderRadius:7,flexShrink:0,
        display:'flex',alignItems:'center',justifyContent:'center',
        background:active?'rgba(22,163,74,0.15)':'rgba(48,54,61,0.3)',
        transition:'background 0.15s',
      }},
        h(Icon,{n:icon,cls:'w-4 h-4',style:{color:active?'#4ade80':'#6b7280',transition:'color 0.15s'}})
      ),
      h('span',{style:{
        fontSize:13,fontWeight:600,flex:1,textAlign:'left',
        color:active?'#f0fdf4':'#9ca3af',
        transition:'color 0.15s',
        letterSpacing:'-0.01em',
      }},label),
      badge && h('span',{className:'premium-badge'},badge),
      isNew && h('span',{style:{
        fontSize:9,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',
        background:'rgba(22,163,74,0.15)',color:'#4ade80',
        border:'1px solid rgba(22,163,74,0.3)',padding:'2px 5px',borderRadius:3,flexShrink:0,
      }},'NEW')
    );
  }

  const handleSmartStart = () => {
    handleClose();
    if(currentPage!=='Home'){ A.nav('Home'); setTimeout(()=>{ const el=document.getElementById('smart-start'); if(el) el.scrollIntoView({behavior:'smooth'}); },200); }
    else { const el=document.getElementById('smart-start'); if(el) el.scrollIntoView({behavior:'smooth'}); }
  };

  return h(Fragment,null,
    // Backdrop
    open && h('div',{
      className:'fixed inset-0 z-40',
      style:{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'},
      onClick:handleClose
    }),

    // Drawer panel
    h('div',{
      className:'fixed inset-y-0 left-0 z-50 flex flex-col sidebar-panel',
      style:{
        width:280,
        transform:open?'translateX(0)':'translateX(-100%)',
        transition:'transform .22s cubic-bezier(.16,1,.3,1)',
        willChange:'transform',
      }
    },
      // ── Sidebar Header ────────────────────────────────────────
      h('div',{style:{
        display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'16px 16px 14px',
        borderBottom:'1px solid rgba(48,54,61,0.8)',
        background:'rgba(13,17,23,0.6)',
        flexShrink:0,
      }},
        h('div',{style:{display:'flex',alignItems:'center',gap:10}},
          // App logo
          h('div',{style:{
            width:38,height:38,borderRadius:9,
            background:'linear-gradient(135deg,#16a34a,#0d9488)',
            display:'flex',alignItems:'center',justifyContent:'center',
            flexShrink:0,boxShadow:'0 2px 12px rgba(22,163,74,0.35)',
          }},
            h(Icon,{n:'bat',cls:'w-5 h-5 text-white'})
          ),
          h('div',{},
            h('div',{style:{fontSize:14,fontWeight:800,color:'#f0fdf4',letterSpacing:'0.01em',lineHeight:1.2}},'SMARTCRICK'),
            h('div',{style:{fontSize:11,fontWeight:600,color:'#34d399',marginTop:2}},`Level ${info.level} · ${info.name}`)
          )
        ),
        h('button',{
          onClick:handleClose,
          style:{
            width:30,height:30,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',
            background:'rgba(48,54,61,0.5)',border:'1px solid rgba(48,54,61,0.8)',
            cursor:'pointer',color:'#6b7280',flexShrink:0,
          }
        },
          h(Icon,{n:'x',cls:'w-4 h-4'})
        )
      ),

      // ── Level + Streak bar ────────────────────────────────────
      h('div',{style:{
        padding:'12px 16px',
        borderBottom:'1px solid rgba(48,54,61,0.5)',
        background:'rgba(22,27,34,0.4)',
        flexShrink:0,
      }},
        h(LevelBar,{totalXP:p.total_xp||0}),
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:8}},
          h('span',{style:{fontSize:11,color:'#4b5563'}},
            info.next ? `${info.xpToNext.toLocaleString()} XP to next level` : 'Max Level Reached'
          ),
          streak>0 && h('div',{style:{display:'flex',alignItems:'center',gap:4}},
            h(Icon,{n:'flame',cls:'w-3.5 h-3.5',style:{color:'#fb923c'}}),
            h('span',{style:{fontSize:11,fontWeight:700,color:'#fb923c'}},`${streak}d streak`)
          )
        )
      ),

      // ── Scrollable nav items ──────────────────────────────────
      h('div',{
        ref:scrollRef,
        className:'flex-1 sidebar-scroll',
        style:{padding:'4px 8px 8px'},
      },
        h(SectionLabel,{first:true},'Premium'),
        h(NavBtn,{label:'AI Head Coach',  icon:'cpu',     pg:'AICoach',  badge:'PRO'}),
        h(NavBtn,{label:'90-Day Program', icon:'diamond', pg:'NinetyDay',badge:'PRO'}),

        h(SectionLabel,{},'Training'),
        h(NavBtn,{label:'Home',            icon:'home',     pg:'Home'}),
        h(NavBtn,{label:'Smart Start',     icon:'zap',      onClick:handleSmartStart}),
        h(NavBtn,{label:'Cricket Drills',  icon:'bat',      pg:'Drills'}),
        h(NavBtn,{label:'Mental Training', icon:'brain',    pg:'Mental'}),
        h(NavBtn,{label:'30-Day Challenge',icon:'target',   pg:'ThirtyDay'}),
        h(NavBtn,{label:'Fitness Builder', icon:'dumbbell', pg:'Fitness'}),
        h(NavBtn,{label:'AI Workout',      icon:'sparkles', pg:'AIWorkout'}),
        h(NavBtn,{label:'Timer',           icon:'timer',    pg:'Timer'}),

        h(SectionLabel,{},'Performance'),
        h(NavBtn,{label:'My Progress',   icon:'barChart', pg:'Progress'}),
        h(NavBtn,{label:'Skill Paths',   icon:'layers',   pg:'SkillPaths'}),
        h(NavBtn,{label:'Leaderboard',   icon:'trophy',   pg:'Leaderboard'}),
        h(NavBtn,{label:'Goals',         icon:'target',   pg:'Goals'}),
        h(NavBtn,{label:'My Profile',    icon:'user',     pg:'Profile'}),

        h(SectionLabel,{},'Planning'),
        h(NavBtn,{label:'Training Schedule',icon:'calendar',pg:'Schedule',isNew:true}),

        h(SectionLabel,{},'AI & Analytics'),
        h(NavBtn,{label:'Video Analysis', icon:'cpu',       pg:'VideoAnalysis',isNew:true}),
        h(NavBtn,{label:'Performance',    icon:'chartLine', pg:'Performance',  isNew:true}),
        h(NavBtn,{label:'Match Logger',   icon:'list',      pg:'MatchLogger',  isNew:true}),
        h(NavBtn,{label:'Reaction Drill', icon:'zap',       pg:'ReactionDrill',isNew:true}),

        h(SectionLabel,{},'Cricket Tools'),
        h(NavBtn,{label:'Match Tracker',     icon:'list',       pg:'MatchTracker'}),
        h(NavBtn,{label:'MiniMatch IQ',      icon:'puzzle',     pg:'MiniMatch'}),
        h(NavBtn,{label:'Why Did I Get Out?',icon:'helpCircle', pg:'GetOut'}),
        h(NavBtn,{label:'Quizzes',           icon:'book',       pg:'Quizzes'}),

        h(SectionLabel,{},'Account'),
        h(NavBtn,{label:'Settings',icon:'settings',pg:'Settings'}),

        // ── Dark Mode Toggle ──────────────────────────────────
        h('div',{style:{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          margin:'6px 4px 4px',padding:'12px 12px',borderRadius:9,
          background:'rgba(22,27,34,0.5)',border:'1px solid rgba(48,54,61,0.6)',
        }},
          h('div',{style:{display:'flex',alignItems:'center',gap:9}},
            h('div',{style:{width:32,height:32,borderRadius:7,background:'rgba(48,54,61,0.4)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
              h(Icon,{n:dark?'moon':'sun',cls:'w-4 h-4',style:{color:'#6b7280'}})
            ),
            h('span',{style:{fontSize:13,fontWeight:600,color:'#9ca3af'}},dark?'Dark Mode':'Light Mode')
          ),
          // Toggle switch
          h('button',{
            onClick:toggle,
            role:'switch',
            'aria-checked':String(dark),
            style:{
              position:'relative',width:44,height:24,borderRadius:12,
              background:dark?'#16a34a':'rgba(55,65,81,0.8)',
              border:'none',cursor:'pointer',
              transition:'background 0.25s',flexShrink:0,
            }
          },
            h('div',{style:{
              position:'absolute',top:3,width:18,height:18,background:'#fff',
              borderRadius:'50%',transition:'transform 0.25s',
              left:3,transform:dark?'translateX(20px)':'translateX(0)',
              boxShadow:'0 1px 4px rgba(0,0,0,0.35)',
            }})
          )
        ),
        h('div',{style:{height:16}}) // bottom padding
      )
    )
  );
}
A.Sidebar = Sidebar;

// ── BottomNav ─────────────────────────────────────────────────────
function BottomNav({ page }) {
  const items=[
    {n:'home',    label:'Home',     pg:'Home'},
    {n:'bat',     label:'Drills',   pg:'Drills'},
    {n:'brain',   label:'Mental',   pg:'Mental'},
    {n:'dumbbell',label:'Fitness',  pg:'Fitness'},
    {n:'calendar',label:'Schedule', pg:'Schedule'},
  ];
  return h('nav',{
    className:'bottom-nav',
    style:{paddingBottom:'max(0px,env(safe-area-inset-bottom))'}
  },
    h('div',{style:{display:'flex',alignItems:'center',height:58}},
      items.map(item=>{
        const active=page===item.pg;
        return h('button',{key:item.pg,onClick:()=>A.nav(item.pg),
          style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',
            justifyContent:'center',gap:3,height:'100%',position:'relative',
            background:'transparent',border:'none',cursor:'pointer',padding:0}
        },
          active && h('div',{style:{
            position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',
            width:24,height:3,background:'#16a34a',borderRadius:'0 0 4px 4px',
          }}),
          h(Icon,{n:item.n,cls:'w-5 h-5',style:{color:active?'#4ade80':'#4b5563',transition:'color 0.15s'}}),
          h('span',{style:{
            fontSize:10,fontWeight:active?700:500,letterSpacing:'0.02em',
            color:active?'#4ade80':'#4b5563',transition:'color 0.15s',
          }},item.label)
        );
      })
    )
  );
}
A.BottomNav = BottomNav;

console.log('[SC] app-ui ready');
})();
