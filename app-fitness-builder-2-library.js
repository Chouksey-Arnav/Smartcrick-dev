// ================================================================
// app-fitness-builder-2-library.js — FB2 Exercise Library Browser
// Browse A.EXERCISES with category & difficulty filters.
// Tap an exercise to see detail. "Start session" launches FB2Session.
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useMemo, Fragment } = React;
const A = window.SC_APP;
const FB2 = A.FB2;
const C = FB2.FB2_PALETTE.dark;
const { nav } = A;

var DIFF_COLORS = {
  beginner:     '#16a34a',
  intermediate: '#3b82f6',
  advanced:     '#f97316',
  pro:          '#8b5cf6',
};

var CATEGORY_FILTERS = [
  { id:'all',   label:'All',        emoji:'⚡' },
  { id:'push',  label:'Push',       emoji:'💪' },
  { id:'pull',  label:'Pull',       emoji:'🔄' },
  { id:'legs',  label:'Legs',       emoji:'🦵' },
  { id:'core',  label:'Core',       emoji:'🎯' },
  { id:'conditioning', label:'Cardio', emoji:'💨' },
];

var DIFF_FILTERS = [
  { id:'all',         label:'All levels' },
  { id:'beginner',    label:'Beginner' },
  { id:'intermediate',label:'Intermediate' },
  { id:'advanced',    label:'Advanced' },
  { id:'pro',         label:'Pro' },
];

// ── Exercise detail sheet ─────────────────────────────────────
function ExerciseSheet({ ex, onClose, onStartSession }) {
  if (!ex) return null;
  var diffColor = DIFF_COLORS[ex.difficulty] || '#34d399';
  return h('div', {
    onClick:onClose,
    style:{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100,
      display:'flex', alignItems:'flex-end', justifyContent:'center',
    }
  },
    h('div', {
      onClick:function(e){ e.stopPropagation(); },
      style:{
        width:'100%', maxWidth:480, borderRadius:'20px 20px 0 0',
        background:C.bg, border:'1px solid rgba(48,54,61,0.9)',
        borderBottom:'none', padding:'0 0 32px',
        maxHeight:'82vh', overflowY:'auto',
      }
    },
      h('div', { style:{ display:'flex', justifyContent:'center', padding:'12px 0 8px' }},
        h('div', { style:{ width:36, height:4, borderRadius:9999, background:'rgba(75,85,99,0.5)' }})
      ),
      // Video placeholder / muscle icon
      h('div', { style:{
        margin:'0 20px 16px', height:170, borderRadius:16, overflow:'hidden',
        background:'linear-gradient(135deg,rgba(22,27,34,0.95),rgba(13,17,23,0.95))',
        display:'flex', alignItems:'center', justifyContent:'center', position:'relative',
      }},
        h('div', { style:{ textAlign:'center' }},
          h('div', { style:{ fontSize:48, marginBottom:8 }},
            ex.category === 'push' ? '💪' : ex.category === 'pull' ? '🔄' :
            ex.category === 'legs' ? '🦵' : ex.category === 'core' ? '🎯' : '⚡'
          ),
          h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.3)', fontWeight:700 }}, 'Exercise preview')
        ),
        h('div', { style:{
          position:'absolute', top:10, right:10,
          background:diffColor+'22', border:'1px solid '+diffColor+'55',
          borderRadius:99, padding:'4px 10px', fontSize:10.5, fontWeight:800, color:diffColor,
        }}, ex.difficulty)
      ),
      h('div', { style:{ padding:'0 20px' }},
        h('h3', { style:{ fontSize:'1.25rem', fontWeight:900, color:C.text, marginBottom:4 }}, ex.name),
        h('div', { style:{ fontSize:12.5, color:C.sub, marginBottom:14, lineHeight:1.5 }},
          'Primary: ' + ex.muscle_primary +
          (ex.muscle_secondary&&ex.muscle_secondary.length ? ' · Also: '+ex.muscle_secondary.join(', ') : '')
        ),
        // Sets / reps / rest chips
        h('div', { style:{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }},
          [
            { l:'Sets', v:ex.sets },
            { l: ex.duration_secs ? 'Duration' : 'Reps', v: ex.duration_secs ? ex.duration_secs+'s' : ex.reps },
            { l:'Rest', v:ex.rest_secs+'s' },
            { l:'Equipment', v:ex.equipment || 'none' },
          ].map(function(chip,i){
            return h('div', { key:i, style:{
              padding:'7px 12px', borderRadius:99, background:'rgba(22,27,34,0.9)',
              border:'1px solid rgba(48,54,61,0.9)',
            }},
              h('span', { style:{ fontSize:10, color:C.dim, display:'block', textTransform:'uppercase', letterSpacing:'0.08em' }}, chip.l),
              h('span', { style:{ fontSize:13, fontWeight:800, color:C.text }}, chip.v)
            );
          })
        ),
        ex.cricket_benefit && h('div', { style:{
          padding:'12px 14px', borderRadius:13, background:'rgba(22,163,74,0.08)',
          border:'1px solid rgba(22,163,74,0.2)', marginBottom:12,
        }},
          h('div', { style:{ fontSize:10, color:C.accent, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}, '🏏 Cricket benefit'),
          h('div', { style:{ fontSize:13, color:C.text, lineHeight:1.5 }}, ex.cricket_benefit)
        ),
        ex.tip && h('div', { style:{
          padding:'12px 14px', borderRadius:13, background:C.card,
          border:'1px solid '+C.border, marginBottom:16,
        }},
          h('div', { style:{ fontSize:10, color:C.sub, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}, '💡 Coach tip'),
          h('div', { style:{ fontSize:13, color:C.sub, lineHeight:1.5 }}, ex.tip)
        ),
        h('button', {
          onClick:function(){ onStartSession([ex]); },
          style:{
            width:'100%', padding:'15px', border:'none', borderRadius:13,
            fontSize:15, fontWeight:800, fontFamily:'inherit', cursor:'pointer',
            background:'linear-gradient(135deg,#16a34a,#0d9488)', color:'#fff',
            boxShadow:'0 6px 20px rgba(22,163,74,0.35)',
          }
        }, 'Start session with this exercise')
      )
    )
  );
}

// ── Exercise card ─────────────────────────────────────────────
function ExerciseCard({ ex, onTap }) {
  var diffColor = DIFF_COLORS[ex.difficulty] || '#34d399';
  var catEmoji = ex.category==='push'?'💪':ex.category==='pull'?'🔄':ex.category==='legs'?'🦵':ex.category==='core'?'🎯':'⚡';
  return h('button', {
    onClick:onTap,
    style:{
      display:'flex', alignItems:'center', gap:13, width:'100%', textAlign:'left',
      padding:'13px 14px', borderRadius:13, cursor:'pointer', fontFamily:'inherit',
      background:C.card, border:'1px solid '+C.border,
      transition:'all 0.15s', outline:'none',
    }
  },
    h('div', { style:{
      width:44, height:44, borderRadius:12, flexShrink:0,
      background:'rgba(22,163,74,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20,
    }}, catEmoji),
    h('div', { style:{ flex:1, minWidth:0 }},
      h('div', { style:{ fontSize:13.5, fontWeight:800, color:C.text, marginBottom:2 }}, ex.name),
      h('div', { style:{ fontSize:11, color:C.sub }},
        ex.muscle_primary + ' · ' + ex.sets + '×' + (ex.duration_secs ? ex.duration_secs+'s' : ex.reps)
      )
    ),
    h('div', { style:{
      padding:'4px 9px', borderRadius:99, fontSize:10, fontWeight:800,
      background:diffColor+'18', color:diffColor, border:'1px solid '+diffColor+'33', flexShrink:0,
    }}, ex.difficulty)
  );
}

// ── Main library component ────────────────────────────────────
function FB2LibraryBrowser({ onStartSession }) {
  var catState = useState('all');
  var cat = catState[0], setCat = catState[1];
  var diffState = useState('all');
  var diff = diffState[0], setDiff = diffState[1];
  var qState = useState('');
  var q = qState[0], setQ = qState[1];
  var selState = useState(null);
  var sel = selState[0], setSel = selState[1];

  var exercises = A.EXERCISES || [];

  var filtered = useMemo(function() {
    return exercises.filter(function(e) {
      var catOk  = cat === 'all' || e.category === cat;
      var diffOk = diff === 'all' || e.difficulty === diff;
      var qOk    = !q || e.name.toLowerCase().includes(q.toLowerCase()) ||
                   (e.muscle_primary||'').toLowerCase().includes(q.toLowerCase());
      return catOk && diffOk && qOk;
    });
  }, [exercises, cat, diff, q]);

  return h(Fragment, null,
    // Search bar
    h('div', { style:{ padding:'0 0 10px' }},
      h('input', {
        type:'text', placeholder:'Search exercises…', value:q,
        onChange:function(e){ setQ(e.target.value); },
        style:{
          width:'100%', padding:'11px 14px', borderRadius:12, fontFamily:'inherit', fontSize:14,
          background:C.card, color:C.text, border:'1px solid '+C.border, outline:'none', boxSizing:'border-box',
        }
      })
    ),
    // Category filter chips
    h('div', { style:{ display:'flex', gap:7, overflowX:'auto', paddingBottom:10, scrollbarWidth:'none' }},
      CATEGORY_FILTERS.map(function(f) {
        var sel2 = cat === f.id;
        return h('button', {
          key:f.id, onClick:function(){ setCat(f.id); },
          style:{
            display:'flex', alignItems:'center', gap:5, padding:'7px 13px',
            borderRadius:99, border:'none', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0,
            background: sel2 ? C.accent : 'rgba(22,27,34,0.9)',
            color: sel2 ? '#fff' : C.sub, fontSize:12.5, fontWeight:700,
            transition:'all 0.15s',
          }
        }, h('span',null,f.emoji), ' ', f.label);
      })
    ),
    // Difficulty filter
    h('div', { style:{ display:'flex', gap:7, overflowX:'auto', paddingBottom:12, scrollbarWidth:'none' }},
      DIFF_FILTERS.map(function(f) {
        var s2 = diff === f.id;
        var dc = DIFF_COLORS[f.id] || C.accent;
        return h('button', {
          key:f.id, onClick:function(){ setDiff(f.id); },
          style:{
            padding:'5px 12px', borderRadius:99, border:'none', cursor:'pointer',
            fontFamily:'inherit', whiteSpace:'nowrap', flexShrink:0, fontSize:11.5, fontWeight:700,
            background: s2 ? (f.id==='all'?C.accent:dc) : 'rgba(22,27,34,0.9)',
            color: s2 ? '#fff' : C.dim,
            transition:'all 0.15s',
          }
        }, f.label);
      })
    ),
    // Count
    h('div', { style:{ fontSize:11, color:C.dim, fontWeight:700, marginBottom:10 }},
      filtered.length + ' exercises'
    ),
    // List
    h('div', { style:{ display:'flex', flexDirection:'column', gap:8 }},
      filtered.slice(0, 60).map(function(ex) {
        return h(ExerciseCard, { key:ex.id, ex:ex, onTap:function(){ setSel(ex); } });
      }),
      filtered.length > 60 && h('div',{style:{textAlign:'center',fontSize:12,color:C.dim,padding:'8px 0'}},
        'Showing 60 of '+filtered.length+' — refine your filters to narrow it down'
      )
    ),
    // Detail sheet
    sel && h(ExerciseSheet, {
      ex:sel,
      onClose:function(){ setSel(null); },
      onStartSession:function(exercises){ setSel(null); if(onStartSession) onStartSession(exercises); },
    })
  );
}

A.FB2LibraryBrowser = FB2LibraryBrowser;
console.log('[SC] app-fitness-builder-2-library ready');
})();
