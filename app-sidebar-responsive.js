// Save as: app-sidebar-responsive.js
// ================================================================
// SmartCrick Responsive Sidebar v1.0
// Desktop: full sidebar | Mobile: hamburger + drawer
// ================================================================
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var A = window.SC_APP;
var Icon = A.Icon || function() { return null; };
var nav = A.nav;

var MENU_ITEMS = [
  { id: 'Home', icon: 'home', label: 'Home', section: 'TRAINING' },
  { id: 'Crick', icon: 'crick', label: 'Crick', section: 'TRAINING' },
  { id: 'Drills', icon: 'drills', label: 'Cricket Drills', section: 'TRAINING' },
  { id: 'Mental', icon: 'mental', label: 'Mental Training', section: 'TRAINING' },
  { id: 'Challenges', icon: 'challenge', label: '30-Day Challenge', section: 'TRAINING' },
  { id: 'Fitness', icon: 'fitness', label: 'Fitness Builder', section: 'TRAINING' },
  { id: 'Workouts', icon: 'aiworkout', label: 'AI Workout', section: 'TRAINING' },
  { id: 'Timer', icon: 'timer', label: 'Timer', section: 'TRAINING' },
  { id: 'Progress', icon: 'progress', label: 'My Progress', section: 'PERFORMANCE' },
  { id: 'SkillPaths', icon: 'skillpaths', label: 'Skill Paths', section: 'PERFORMANCE' },
  { id: 'Leaderboard', icon: 'leaderboard', label: 'Leaderboard', section: 'PERFORMANCE' },
  { id: 'Goals', icon: 'goals', label: 'Goals', section: 'PERFORMANCE' },
  { id: 'Profile', icon: 'profile', label: 'My Profile', section: 'PERFORMANCE' },
];

var PREMIUM_ITEMS = [
  { id: 'Coach', icon: 'coach', label: 'AI Head Coach', badge: 'PRO' },
  { id: 'Program', icon: 'program', label: '90-Day Program', badge: 'PRO' },
];

function NavItem({ item, isActive, onClick }) {
  return h('button', {
    onClick: onClick,
    'aria-current': isActive ? 'page' : 'false',
    style: {
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '11px 14px', borderRadius: 10, border: 'none',
      background: isActive ? 'rgba(22,163,74,0.10)' : 'transparent',
      color: isActive ? '#4ade80' : '#9ca3af', cursor: 'pointer',
      fontFamily: 'inherit', textAlign: 'left', fontSize: 14, fontWeight: isActive ? 700 : 600,
      transition: 'all 0.2s', outline: 'none',
      borderLeft: isActive ? '3px solid #16a34a' : '3px solid transparent',
    },
    onMouseEnter: function(e) { if(!isActive) e.target.style.background = 'rgba(75,85,99,0.3)'; },
    onMouseLeave: function(e) { if(!isActive) e.target.style.background = 'transparent'; },
    onFocus: function(e) { e.target.style.outline = '2px solid rgba(22,163,74,0.4)'; },
    onBlur: function(e) { e.target.style.outline = 'none'; },
  },
    h(Icon, { name: item.icon, size: 20, color: isActive ? '#4ade80' : '#6b7280' }),
    h('span', { style: { flex: 1 }}, item.label),
    item.badge && h('span', { style: {
      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
      background: 'rgba(249,115,22,0.15)', color: '#f59e0b', textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}, item.badge)
  );
}

function DesktopSidebar({ currentPage }) {
  return h('div', {
    style: {
      width: 280, background: 'rgba(8,11,15,0.95)', borderRight: '1px solid rgba(48,54,61,0.9)',
      display: 'flex', flexDirection: 'column', paddingTop: 16,
      maxHeight: '100vh', overflowY: 'auto', position: 'fixed', left: 0, top: 0, bottom: 0,
      zIndex: 40,
    }
  },
    h('div', { style: { padding: '16px 14px 24px', borderBottom: '1px solid rgba(48,54,61,0.6)' }},
      h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 }},
        h('div', { style: {
          width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#0d9488)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
        }}, '🏏'),
        h('div', null,
          h('div', { style: { fontSize: 14, fontWeight: 800, color: '#f0fdf4', letterSpacing: '-0.01em' }}, 'SmartCrick'),
          h('div', { style: { fontSize: 10, color: '#6b7280', fontWeight: 600, marginTop: 2 }}, 'v1.1')
        )
      )
    ),
    // Premium section
    h('div', { style: { padding: '8px 10px 16px' }},
      h('div', { style: { fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}, 'Premium'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 }},
        PREMIUM_ITEMS.map(function(item) {
          return h(NavItem, { key: item.id, item: item, isActive: currentPage === item.id, onClick: function() { nav(item.id); } });
        })
      )
    ),
    // Main menu
    MENU_ITEMS.reduce(function(acc, item) {
      var lastSection = acc[acc.length - 1];
      var isNewSection = !lastSection || lastSection.section !== item.section;
      if(isNewSection) {
        acc.push({
          type: 'section',
          section: item.section,
          items: [item],
        });
      } else {
        lastSection.items.push(item);
      }
      return acc;
    }, []).map(function(group) {
      return h('div', { key: group.section, style: { padding: '0 10px 16px' }},
        h('div', { style: { fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}, group.section),
        h('div', { style: { display: 'flex', flexDirection: 'column', gap: 6 }},
          group.items.map(function(item) {
            return h(NavItem, { key: item.id, item: item, isActive: currentPage === item.id, onClick: function() { nav(item.id); } });
          })
        )
      );
    })
  );
}

function MobileNav({ currentPage, onMenuToggle, menuOpen }) {
  return h(h.Fragment, null,
    // Header with hamburger
    h('div', {
      style: {
        display: 'none', '@media (max-width: 768px)': { display: 'flex' },
        position: 'fixed', top: 0, left: 0, right: 0, height: 56, zIndex: 50,
        background: 'rgba(8,11,15,0.98)', borderBottom: '1px solid rgba(48,54,61,0.9)',
        alignItems: 'center', padding: '0 12px', gap: 12,
      }
    },
      h('button', {
        onClick: onMenuToggle, 'aria-label': 'Toggle menu', 'aria-expanded': menuOpen,
        style: {
          width: 44, height: 44, borderRadius: 8, background: 'rgba(75,85,99,0.2)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: '#9ca3af', fontFamily: 'inherit',
        }
      },
        h(Icon, { name: menuOpen ? 'close' : 'menu', size: 22 })
      ),
      h('div', { style: { fontSize: 14, fontWeight: 800, color: '#f0fdf4' }}, 'SmartCrick'),
      h('div', { style: { flex: 1 }})
    ),
    // Mobile drawer (when open)
    menuOpen && h('div', {
      style: {
        display: 'none', '@media (max-width: 768px)': { display: 'block' },
        position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)',
        onClick: onMenuToggle,
      }
    }),
    h('div', {
      style: {
        display: 'none', '@media (max-width: 768px)': { display: 'block' },
        position: 'fixed', left: 0, top: 0, bottom: 0, width: 280, zIndex: 45,
        background: 'rgba(8,11,15,0.98)', borderRight: '1px solid rgba(48,54,61,0.9)',
        overflowY: 'auto', transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease', paddingTop: 12,
      }
    },
      h('div', { style: { padding: '16px 14px 24px', borderBottom: '1px solid rgba(48,54,61,0.6)' }},
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 10 }},
          h('div', { style: {
            width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#16a34a,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}, '🏏'),
          h('div', null,
            h('div', { style: { fontSize: 14, fontWeight: 800, color: '#f0fdf4' }}, 'SmartCrick'),
            h('div', { style: { fontSize: 10, color: '#6b7280', marginTop: 2 }}, 'v1.1')
          )
        )
      ),
      MENU_ITEMS.map(function(item) {
        return h(NavItem, { key: item.id, item: item, isActive: currentPage === item.id, onClick: function() { nav(item.id); onMenuToggle(); } });
      })
    )
  );
}

function ResponsiveSidebar({ currentPage }) {
  var [menuOpen, setMenuOpen] = useState(false);
  var isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if(isMobile) {
    return h(MobileNav, { currentPage: currentPage, onMenuToggle: function() { setMenuOpen(!menuOpen); }, menuOpen: menuOpen });
  }
  return h(DesktopSidebar, { currentPage: currentPage });
}

A.ResponsiveSidebar = ResponsiveSidebar;
console.log('[SC] app-sidebar-responsive v1.0 — desktop + mobile ready');
})();
