// Save as: icons.js
// ================================================================
// SmartCrick Icon Library v1.0
// All icons as inline SVG — no dependencies, works offline
// Usage: h(Icon, { name: 'home', size: 24, color: '#16a34a' })
// ================================================================
(function() {
'use strict';
var h = React.createElement;
var A = window.SC_APP;

var ICONS = {
  // Navigation
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  
  drills: '<path d="M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M9 9h6M9 15h6" stroke-linecap="round"/>',
  
  mental: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2" stroke-linecap="round"/>',
  
  fitness: '<path d="M6 4l3 9-3 3m12-12l-3 9 3 3M6 4h12v2H6zm0 14h12v2H6z"/><circle cx="9" cy="10" r="1.5"/><circle cx="15" cy="10" r="1.5"/>',
  
  timer: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  
  progress: '<polyline points="23 6 13 16 8 11 2 17"/><polyline points="17 6 23 6 23 12"/>',
  
  skillpaths: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><line x1="7" y1="6" x2="10" y2="14"/><line x1="17" y1="6" x2="14" y2="14"/><line x1="12" y1="17" x2="12" y2="19" x-offset="0.5"/>',
  
  leaderboard: '<path d="M3 12a2 2 0 0 1 2-2h3V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="6" y="8" width="2" height="9"/><rect x="12" y="3" width="2" height="14"/>',
  
  goals: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  
  profile: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  
  challenge: '<path d="M6 9l6-3 6 3v6l-6 3-6-3V9z"/><polyline points="9 12 12 14 15 12"/>',
  
  smartstart: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round" stroke-linejoin="round"/>',
  
  aiworkout: '<path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><path d="M9 15c.5 1 1.5 1.5 3 1.5s2.5-.5 3-1.5" stroke-linecap="round"/>',
  
  coach: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08s5.97 1.09 6 3.08c-1.29 1.94-3.5 3.22-6 3.22z"/>',
  
  program: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>',
  
  dailybonus: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  
  dailynet: '<path d="M12 2l2 4h4.5l-3.5 3 1.5 4.5L12 13l-4.5 0.5 1.5-4.5-3.5-3H10l2-4z"/><path d="M12 2l2 4h4.5"/>',
  
  menu: '<line x1="3" y1="6" x2="21" y2="6" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke-width="2" stroke-linecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke-width="2" stroke-linecap="round"/>',
  
  close: '<line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>',
  
  chevronright: '<polyline points="9 18 15 12 9 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  
  check: '<polyline points="20 6 9 17 4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2" stroke-linecap="round"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2" stroke-linecap="round"/>',

  crick: '<circle cx="12" cy="13" r="8" fill="#b91c1c" stroke="#7f1d1d" stroke-width="1.5"/><ellipse cx="9" cy="11" rx="2.5" ry="2.5" fill="#fff"/><ellipse cx="15" cy="11" rx="2.5" ry="2.5" fill="#fff"/><circle cx="9" cy="11" r="1.5" fill="#1e1b4b"/><circle cx="15" cy="11" r="1.5" fill="#1e1b4b"/><path d="M9 15 Q12 17.5 15 15" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
};

function Icon(props) {
  var name = props.name || 'home';
  var size = props.size || 24;
  var color = props.color || '#9ca3af';
  var className = props.className || '';
  var ariaLabel = props['aria-label'] || name;
  
  var svgPath = ICONS[name];
  if(!svgPath) {
    console.warn('[Icons] Unknown icon:', name);
    svgPath = ICONS.alert;
  }
  
  return h('svg', {
    viewBox: '0 0 24 24',
    width: size,
    height: size,
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: className,
    'aria-label': ariaLabel,
    style: { flexShrink: 0, display: 'block' },
    dangerouslySetInnerHTML: { __html: svgPath }
  });
}

A.Icon = Icon;
A.ICONS = ICONS;
console.log('[SC] icons.js v1.0 — ' + Object.keys(ICONS).length + ' icons ready');
})();
