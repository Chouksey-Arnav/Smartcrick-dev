// app-ui-patch.js v1.0
// STANDALONE file — add as <script src="app-ui-patch.js"></script>
// after app-ui.js and before app-root.js in index.html
// Fixes: adds missing TopBar + MoreMenu, corrects BottomNav
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var Fragment = React.Fragment;
var A = window.SC_APP;
var Icon = A.Icon;

// ── TOP BAR ──────────────────────────────────────────────────────
// Mobile-only header (hidden on desktop via CSS)
function TopBar(props) {
  var title = props.title || 'SmartCrick';
  var onMenuOpen = props.onMenuOpen;
  var onBack = props.onBack;
  var right = props.right;
  var [scrolled, setScrolled] = useState(false);

  useEffect(function() {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return function() { window.removeEventListener('scroll', handleScroll); };
  }, []);

  return h('header', {
    style: {
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 35,
      height: 'calc(52px + env(safe-area-inset-top, 0px))',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      background: scrolled ? 'rgba(8,11,15,0.98)' : 'rgba(8,11,15,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(36,42,50,' + (scrolled ? '0.95' : '0.4') + ')',
      transition: 'border-color 0.2s, background 0.2s',
      boxSizing: 'border-box',
    }
  },
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        height: 52,
        padding: '0 6px',
        gap: 4,
      }
    },
      // Left: hamburger or back button
      onBack
        ? h('button', {
            onClick: onBack,
            'aria-label': 'Go back',
            style: {
              width: 40, height: 40, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            }
          }, h(Icon, { n: 'arrowL', cls: 'w-5 h-5', style: { color: '#9ca3af' } }))
        : h('button', {
            onClick: onMenuOpen,
            'aria-label': 'Open menu',
            style: {
              width: 40, height: 40, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
            }
          }, h(Icon, { n: 'menu', cls: 'w-5 h-5', style: { color: '#9ca3af' } })),

      // Center: logo + title
      h('div', {
        style: {
          display: 'flex', alignItems: 'center', gap: 8,
          flex: 1, minWidth: 0,
        }
      },
        h('div', {
          'aria-hidden': 'true',
          style: {
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg,#16a34a,#0d9488)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }
        },
          h(Icon, { n: 'bat', cls: 'w-4 h-4', style: { color: '#fff' } })
        ),
        h('span', {
          style: {
            fontSize: title === 'SmartCrick' ? 15 : 13,
            fontWeight: title === 'SmartCrick' ? 800 : 700,
            color: '#f0fdf4',
            letterSpacing: title === 'SmartCrick' ? '-0.02em' : '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }
        }, title)
      ),

      // Right slot
      right
        ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 } }, right)
        : h('div', { style: { width: 40, flexShrink: 0 } })
    )
  );
}
A.TopBar = TopBar;

// ── MORE MENU — delegates to existing Sidebar ─────────────────────
function MoreMenu(props) {
  if (!A.Sidebar) return null;
  return h(A.Sidebar, { open: true, onClose: props.onClose || function(){}, currentPage: '' });
}
A.MoreMenu = MoreMenu;

// ── BOTTOM NAV — 4 tabs: Today / Train / Progress / You ──────────
// Accepts both 'page' and 'currentPage' for backward compatibility
function BottomNav(props) {
  var activePage = props.page || props.currentPage || '';

  var items = [
    { n: 'home',     label: 'Today',    pg: 'Home' },
    { n: 'bat',      label: 'Train',    pg: 'Drills' },
    { n: 'barChart', label: 'Progress', pg: 'Progress' },
    { n: 'user',     label: 'You',      pg: 'Profile' },
  ];

  return h('nav', {
    'aria-label': 'Main navigation',
    style: {
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 40,
      background: 'rgba(8,11,15,0.97)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(36,42,50,0.9)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 3, height: '100%',
            position: 'relative',
            background: 'transparent', border: 'none',
            cursor: 'pointer', padding: 0, outline: 'none',
          }
        },
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
// Overwrite the existing BottomNav with the fixed version
A.BottomNav = BottomNav;

console.log('[SC] app-ui-patch v1.0 — TopBar, MoreMenu, BottomNav(fixed) ready');
})();
