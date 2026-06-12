// app-sidebar-patch.js v1.0
// ================================================================
// SmartCrick — Sidebar cleanup + dark/light mode fix
// ADD this script AFTER app-ui.js but BEFORE app-root.js
// This patches the sidebar to remove dead pages and fix dark mode
// ================================================================
(function () {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var useContext = React.useContext;
var Fragment = React.Fragment;
var A = window.SC_APP;

// ── DARK/LIGHT MODE CSS variables ──────────────────────────────
// Apply theme to :root based on dark mode state
function applyTheme(isDark) {
  var root = document.documentElement;
  if (isDark) {
    root.style.setProperty('--bg-base',   '#0d1117');
    root.style.setProperty('--bg-card',   '#161b22');
    root.style.setProperty('--bg-surface','#1c2128');
    root.style.setProperty('--bg-hover',  '#22272e');
    root.style.setProperty('--border',    'rgba(48,54,61,0.9)');
    root.style.setProperty('--text-1',    '#f0fdf4');
    root.style.setProperty('--text-2',    '#8b949e');
    root.style.setProperty('--text-3',    '#484f58');
    document.body.style.background = '#0d1117';
    document.body.classList.remove('sc-light');
    document.body.classList.add('sc-dark');
  } else {
    root.style.setProperty('--bg-base',   '#f8fafc');
    root.style.setProperty('--bg-card',   '#ffffff');
    root.style.setProperty('--bg-surface','#f1f5f9');
    root.style.setProperty('--bg-hover',  '#e2e8f0');
    root.style.setProperty('--border',    'rgba(148,163,184,0.4)');
    root.style.setProperty('--text-1',    '#0f172a');
    root.style.setProperty('--text-2',    '#475569');
    root.style.setProperty('--text-3',    '#94a3b8');
    document.body.style.background = '#f8fafc';
    document.body.classList.remove('sc-dark');
    document.body.classList.add('sc-light');
  }
  // Store preference
  try { localStorage.setItem('sc_dark_mode', isDark ? '1' : '0'); } catch(e){}
}

// Load saved preference
var savedDark = true;
try {
  var saved = localStorage.getItem('sc_dark_mode');
  if (saved !== null) savedDark = saved === '1';
} catch(e){}
applyTheme(savedDark);

// Patch ThemeCtx provider to actually work
var _themeListeners = [];
var _isDark = savedDark;

function toggleTheme() {
  _isDark = !_isDark;
  applyTheme(_isDark);
  _themeListeners.forEach(function(fn){ try{ fn(_isDark); } catch(e){} });
}

// Override the ThemeCtx so useTheme() returns working values
if (A.ThemeCtx) {
  A._themeState = { dark: _isDark, toggle: toggleTheme };
  // Monkey-patch useTheme
  A.useTheme = function() {
    var [dark, setDark] = useState(_isDark);
    useEffect(function() {
      var fn = function(d){ setDark(d); };
      _themeListeners.push(fn);
      return function() {
        var idx = _themeListeners.indexOf(fn);
        if (idx !== -1) _themeListeners.splice(idx, 1);
      };
    }, []);
    return { dark: dark, toggle: toggleTheme };
  };
}

// ── PAGES TO REMOVE ──────────────────────────────────────────────
// These pages are removed from the sidebar and should be removed
// from app-root.js STANDARD_PAGES + pageMap as well.
var REMOVED_PAGES = new Set([
  'MiniMatch', 'MatchTracker', 'GetOut', 'Quizzes',
  'ReactionDrill', 'MatchLogger', 'Performance',
]);

// ── PATCHED SIDEBAR NAV ITEMS ────────────────────────────────────
// Override the Sidebar component with removed pages filtered out

var _origSidebar = A.Sidebar;
var _origDesktopSidebar = A.DesktopSidebar;

// The nav items in a clean order (dead pages removed)
var CLEAN_NAV = [
  // Premium
  { label:'AI Head Coach',    icon:'cpu',      pg:'AICoach',    badge:'PRO', section:'PREMIUM' },
  { label:'90-Day Program',   icon:'diamond',  pg:'NinetyDay',  badge:'PRO', section:'PREMIUM' },
  // Core Training
  { label:'Home',             icon:'home',     pg:'Home',       section:'TRAINING' },
  { label:'Crick',            icon:'crick',    pg:'Crick',      section:'TRAINING' },
  { label:'Cricket Drills',   icon:'bat',      pg:'Drills',     section:'TRAINING' },
  { label:'Mental Training',  icon:'brain',    pg:'Mental',     section:'TRAINING' },
  // ON HOLD: 30-Day Challenge temporarily hidden from nav (code kept for later re-enable)
  // { label:'30-Day Challenge', icon:'target',   pg:'ThirtyDay',  section:'TRAINING' },
  { label:'Fitness Builder',  icon:'dumbbell', pg:'Fitness',    section:'TRAINING' },
  { label:'Fitness Builder 2',icon:'flask',    pg:'FitnessBuilder2', badge:'BETA', section:'TRAINING' },
  { label:'Timer',            icon:'timer',    pg:'Timer',      section:'TRAINING' },
  // Performance
  { label:'My Progress',      icon:'barChart', pg:'Progress',   section:'PERFORMANCE' },
  { label:'Skill Paths',      icon:'layers',   pg:'SkillPaths', section:'PERFORMANCE' },
  { label:'Cricket DNA',      icon:'sparkles', pg:'CricketDNA', section:'PERFORMANCE' },
  { label:'Assessment',       icon:'target',   pg:'Assessment', section:'PERFORMANCE' },
  { label:'My Profile',       icon:'user',     pg:'Profile',    section:'PERFORMANCE' },
  { label:'ProVision™ Analysis',icon:'cpu',    pg:'VideoAnalysis',section:'PERFORMANCE', isNew:true },
  // Planning
  { label:'Training Schedule',icon:'calendar', pg:'Schedule',   section:'PLANNING', isNew:true },
  { label:'Daily Net Quiz',   icon:'crosshair',pg:'DailyNet',   section:'PLANNING' },
  { label:'Match Logger',     icon:'list',     pg:'MatchLogger', section:'PLANNING' },
];

function CleanNavItem(props) {
  var item = props.item, isActive = props.isActive, onNavClick = props.onNavClick;
  var [hov, setHov] = useState(false);
  return h('button', {
    onClick: function() { A.nav(item.pg); if (onNavClick) onNavClick(); },
    onMouseEnter: function() { setHov(true); },
    onMouseLeave: function() { setHov(false); },
    style: {
      display:'flex', flexDirection:'row', alignItems:'center',
      width:'100%', boxSizing:'border-box', minHeight:44, padding:'7px 10px 7px 6px',
      marginBottom:2, gap:10, border:'none',
      borderLeft: '3px solid ' + (isActive ? '#16a34a' : 'transparent'),
      borderRadius:'0 9px 9px 0',
      background: isActive ? 'rgba(22,163,74,0.09)' : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
      cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'background 0.14s', flexShrink:0,
    }
  },
    h('div', { style:{ width:30,height:30,borderRadius:7,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',background:isActive?'rgba(22,163,74,0.18)':'rgba(55,65,81,0.22)',transition:'background 0.14s' } },
      h(A.Icon, { n:item.icon, cls:'w-4 h-4', style:{ color:isActive?'#4ade80':'#9ca3af', transition:'color 0.14s', flexShrink:0 } })
    ),
    h('span', { style:{ fontSize:13,fontWeight:600,flex:1,textAlign:'left',color:isActive?'#f0fdf4':'#9ca3af',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',letterSpacing:'-0.01em',transition:'color 0.14s' } }, item.label),
    item.badge && h('span', { style:{ fontSize:9,fontWeight:800,letterSpacing:'0.06em',textTransform:'uppercase',background:'rgba(217,119,6,0.15)',color:'#d97706',border:'1px solid rgba(217,119,6,0.3)',padding:'2px 6px',borderRadius:3,flexShrink:0 } }, item.badge),
    item.isNew && h('span', { style:{ fontSize:9,fontWeight:800,letterSpacing:'0.08em',textTransform:'uppercase',background:'rgba(22,163,74,0.13)',color:'#4ade80',border:'1px solid rgba(22,163,74,0.28)',padding:'2px 5px',borderRadius:3,flexShrink:0 } }, 'NEW')
  );
}

function NavSectionLabel(props) {
  return h('div', { style:{
    padding: props.first?'10px 12px 5px':'18px 12px 5px',
    borderTop: props.first?'none':'1px solid rgba(40,46,54,0.85)',
    marginTop: props.first?0:4,
    fontSize:9,fontWeight:800,letterSpacing:'0.14em',textTransform:'uppercase',
    color:'#374151',userSelect:'none',lineHeight:1,
  }}, props.label);
}

function CleanSidebarContent(props) {
  var currentPage = props.currentPage, onNavClick = props.onNavClick;
  var sections = {};
  CLEAN_NAV.forEach(function(item) {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });
  var sectionOrder = ['PREMIUM','TRAINING','PERFORMANCE','PLANNING'];
  return h('div', { style:{ display:'block', padding:'2px 8px 16px', overflowY:'auto', flex:1, scrollbarWidth:'thin', scrollbarColor:'rgba(48,54,61,0.9) transparent' } },
    sectionOrder.map(function(sec, si) {
      var items = sections[sec];
      if (!items) return null;
      return h(Fragment, { key:sec },
        h(NavSectionLabel, { label:sec, first:si===0 }),
        items.map(function(item) {
          return h(CleanNavItem, { key:item.pg, item:item, isActive:currentPage===item.pg, onNavClick:onNavClick });
        })
      );
    })
  );
}

function LevelSection(props) {
  var p = A.DB && A.DB.getProgress ? A.DB.getProgress() : {};
  var info = A.getLevelInfo ? A.getLevelInfo(p.total_xp||0) : { level:1, name:'Rookie', pct:0, xpToNext:500 };
  var streak = p.current_streak||0;
  return h('div', { style:{ padding:'10px 14px 12px', borderBottom:'1px solid rgba(40,46,54,0.8)', background:'rgba(13,17,23,0.4)', flexShrink:0 } },
    A.LevelBar ? h(A.LevelBar, { totalXP:p.total_xp||0 }) : null,
    h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6 } },
      h('span', { style:{ fontSize:11, color:'#374151' } }, info.next ? info.xpToNext.toLocaleString()+' XP to next' : 'Max Level'),
      streak>0 && h('div', { style:{ display:'flex', alignItems:'center', gap:4 } },
        A.Icon ? h(A.Icon, { n:'flame', cls:'w-3.5 h-3.5', style:{ color:'#fb923c' } }) : '🔥',
        h('span', { style:{ fontSize:11, fontWeight:700, color:'#fb923c' } }, streak+'d')
      )
    )
  );
}

// Clean Desktop Sidebar
function CleanDesktopSidebar(props) {
  var { dark, toggle } = A.useTheme ? A.useTheme() : { dark:true, toggle:function(){} };
  return h('div', { style:{
    width:260,flexShrink:0,display:'flex',flexDirection:'column',
    height:'100dvh',background:dark?'#080b0f':'#ffffff',
    borderRight:'1px solid '+(dark?'rgba(36,42,50,0.95)':'rgba(148,163,184,0.3)'),
    position:'sticky',top:0,
  } },
    h('div', { style:{ padding:'16px 14px 14px', borderBottom:'1px solid '+(dark?'rgba(36,42,50,0.9)':'rgba(148,163,184,0.2)'), flexShrink:0 } },
      h('div', { style:{ display:'flex', alignItems:'center', gap:10 } },
        h('div', { style:{ width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#16a34a,#0d9488)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 2px 10px rgba(22,163,74,0.3)' } },
          A.Icon ? h(A.Icon, { n:'bat', cls:'w-5 h-5 text-white' }) : '🏏'
        ),
        h('div', null,
          h('div', { style:{ fontSize:14,fontWeight:800,color:dark?'#f0fdf4':'#0f172a',letterSpacing:'0.01em',lineHeight:1.2 } }, 'SMARTCRICK'),
          h('div', { style:{ fontSize:11,fontWeight:600,color:'#34d399',marginTop:2 } }, 'Elite Cricket Training')
        )
      )
    ),
    h(LevelSection),
    h(CleanSidebarContent, { currentPage:props.currentPage }),
    // Dark mode toggle
    h('div', { style:{ padding:'10px 14px', borderTop:'1px solid '+(dark?'rgba(36,42,50,0.85)':'rgba(148,163,184,0.2)'), flexShrink:0 } },
      h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between' } },
        h('div', { style:{ display:'flex', alignItems:'center', gap:9 } },
          h('div', { style:{ width:28,height:28,borderRadius:6,background:'rgba(48,54,61,0.4)',display:'flex',alignItems:'center',justifyContent:'center' } },
            A.Icon ? h(A.Icon, { n:dark?'moon':'sun', cls:'w-3.5 h-3.5', style:{ color:'#6b7280' } }) : (dark?'🌙':'☀️')
          ),
          h('span', { style:{ fontSize:12,fontWeight:600,color:'#6b7280' } }, dark?'Dark Mode':'Light Mode')
        ),
        h('button', {
          onClick:toggle,
          'aria-label':dark?'Switch to light mode':'Switch to dark mode',
          style:{ position:'relative',width:40,height:22,borderRadius:11,background:dark?'#16a34a':'rgba(55,65,81,0.8)',border:'none',cursor:'pointer',transition:'background 0.25s',flexShrink:0 }
        },
          h('div', { style:{ position:'absolute',top:3,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'transform 0.25s',left:3,transform:dark?'translateX(18px)':'translateX(0)',boxShadow:'0 1px 4px rgba(0,0,0,0.35)' } })
        )
      )
    )
  );
}

// Clean Mobile Sidebar Drawer
function CleanSidebar(props) {
  var { open, onClose, currentPage } = props;
  var { dark, toggle } = A.useTheme ? A.useTheme() : { dark:true, toggle:function(){} };
  var scrollRef = useRef(null);

  return h(Fragment, null,
    h('div', { style:{ position:'fixed',inset:0,zIndex:40,background:'rgba(0,0,0,0.75)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)',opacity:open?1:0,pointerEvents:open?'auto':'none',transition:'opacity 0.22s' }, onClick:onClose }),
    h('div', { style:{ position:'fixed',inset:'0 auto 0 0',zIndex:50,width:270,display:'flex',flexDirection:'column',background:dark?'#080b0f':'#ffffff',borderRight:'1px solid '+(dark?'rgba(36,42,50,0.95)':'rgba(148,163,184,0.3)'),boxShadow:'6px 0 50px rgba(0,0,0,0.7)',transform:open?'translateX(0)':'translateX(-100%)',transition:'transform 0.22s cubic-bezier(0.16,1,0.3,1)',willChange:'transform' } },
      h('div', { style:{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px',borderBottom:'1px solid rgba(36,42,50,0.9)',flexShrink:0 } },
        h('div', { style:{ display:'flex',alignItems:'center',gap:10 } },
          h('div', { style:{ width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#16a34a,#0d9488)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 } },
            A.Icon ? h(A.Icon, { n:'bat', cls:'w-5 h-5 text-white' }) : '🏏'
          ),
          h('div', null,
            h('div', { style:{ fontSize:14,fontWeight:800,color:dark?'#f0fdf4':'#0f172a' } }, 'SMARTCRICK'),
            h('div', { style:{ fontSize:11,fontWeight:600,color:'#34d399',marginTop:1 } }, 'Elite Cricket Training')
          )
        ),
        h('button', { onClick:onClose, style:{ width:30,height:30,borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(48,54,61,0.5)',border:'1px solid rgba(48,54,61,0.8)',cursor:'pointer',color:'#6b7280',flexShrink:0 } },
          A.Icon ? h(A.Icon, { n:'x', cls:'w-4 h-4' }) : '×'
        )
      ),
      h(LevelSection),
      h('div', { ref:scrollRef, style:{ flex:1,overflowY:'auto',display:'block',scrollbarWidth:'thin',scrollbarColor:'rgba(48,54,61,0.9) transparent' } },
        h(CleanSidebarContent, { currentPage:currentPage, onNavClick:onClose })
      ),
      h('div', { style:{ padding:'10px 14px', borderTop:'1px solid rgba(36,42,50,0.85)', flexShrink:0 } },
        h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between' } },
          h('div', { style:{ display:'flex', alignItems:'center', gap:9 } },
            h('div', { style:{ width:28,height:28,borderRadius:6,background:'rgba(48,54,61,0.4)',display:'flex',alignItems:'center',justifyContent:'center' } },
              A.Icon ? h(A.Icon, { n:dark?'moon':'sun', cls:'w-3.5 h-3.5', style:{ color:'#6b7280' } }) : (dark?'🌙':'☀️')
            ),
            h('span', { style:{ fontSize:12,fontWeight:600,color:'#6b7280' } }, dark?'Dark Mode':'Light Mode')
          ),
          h('button', {
            onClick:toggle,
            style:{ position:'relative',width:40,height:22,borderRadius:11,background:dark?'#16a34a':'rgba(55,65,81,0.8)',border:'none',cursor:'pointer',transition:'background 0.25s',flexShrink:0 }
          },
            h('div', { style:{ position:'absolute',top:3,width:16,height:16,background:'#fff',borderRadius:'50%',transition:'transform 0.25s',left:3,transform:dark?'translateX(18px)':'translateX(0)',boxShadow:'0 1px 4px rgba(0,0,0,0.35)' } })
          )
        )
      )
    )
  );
}

// Patch the global Sidebar + DesktopSidebar
A.Sidebar = CleanSidebar;
A.DesktopSidebar = CleanDesktopSidebar;

// Patch BottomNav to remove dead pages (already has only 4 tabs so it's fine)
// but make it theme-aware
var _origBN = A.BottomNav;
function ThemedBottomNav(props) {
  var { dark } = A.useTheme ? A.useTheme() : { dark:true };
  var activePage = props.page || props.currentPage || '';
  var items = [
    { n:'home',     label:'Today',    pg:'Home' },
    { n:'bat',      label:'Train',    pg:'Drills' },
    { n:'barChart', label:'Progress', pg:'Progress' },
    { n:'user',     label:'You',      pg:'Profile' },
  ];
  return h('nav', {
    className:'sc-bottomnav',
    'aria-label':'Main navigation',
    style:{
      position:'fixed', bottom:0,left:0,right:0,zIndex:40,
      background: dark ? 'rgba(8,11,15,0.97)' : 'rgba(255,255,255,0.97)',
      backdropFilter:'blur(24px)',WebkitBackdropFilter:'blur(24px)',
      borderTop:'1px solid '+(dark?'rgba(36,42,50,0.9)':'rgba(148,163,184,0.3)'),
      paddingBottom:'env(safe-area-inset-bottom,0px)',
    }
  },
    h('div', { style:{ display:'flex', alignItems:'center', height:58 } },
      items.map(function(item) {
        var active = activePage === item.pg;
        return h('button', {
          key:item.pg, onClick:function(){A.nav(item.pg);},
          'aria-label':item.label, 'aria-current':active?'page':undefined,
          style:{ flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:3,height:'100%',position:'relative',background:'transparent',border:'none',cursor:'pointer',padding:0,outline:'none' }
        },
          active && h('div', { style:{ position:'absolute',top:0,left:'50%',transform:'translateX(-50%)',width:20,height:2.5,background:'#16a34a',borderRadius:'0 0 3px 3px' } }),
          A.Icon ? h(A.Icon, { n:item.n, cls:'w-5 h-5', style:{ color:active?'#4ade80':(dark?'#374151':'#94a3b8'), transition:'color 0.15s' } }) : h('span',null,item.label[0]),
          h('span', { style:{ fontSize:10,fontWeight:active?700:500,color:active?'#4ade80':(dark?'#374151':'#94a3b8'),transition:'color 0.15s',letterSpacing:'-0.01em' } }, item.label)
        );
      })
    )
  );
}
A.BottomNav = ThemedBottomNav;

console.log('[SC] app-sidebar-patch v1.0 — cleaned sidebar + working dark/light mode ready');
})();
