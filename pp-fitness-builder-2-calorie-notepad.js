// ================================================================
// app-fitness-builder-2-calorie-notepad.js — FB2 "Calorie Notepad"
// Notes-style natural-language food logging with free AI estimation
// (Google Gemini free tier — generateContent REST API, client-side).
// Falls back to manual entry if no API key is configured or the
// request fails (offline / quota / network).
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const A = window.SC_APP;
const FB2 = A.FB2;
const C = FB2.FB2_PALETTE.dark;

// ── Free-tier Gemini API key ───────────────────────────────────
// Get a free key at https://aistudio.google.com/app/apikey and
// restrict it by HTTP referrer (your site's domain) in the Google
// Cloud Console. Leave blank to use manual entry only.
var GEMINI_API_KEY = '';
var GEMINI_MODEL = 'gemini-2.0-flash';
var GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/'
  + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY;

function haptic() {
  try {
    if (A.Emotion && A.Emotion.haptic) { A.Emotion.haptic('light'); return; }
    if (navigator.vibrate) navigator.vibrate(6);
  } catch(e) {}
}

// ── AI estimation ──────────────────────────────────────────────
async function estimateWithGemini(description) {
  var prompt = 'You are a nutrition estimation assistant. A user logged this food in a ' +
    'notes-style tracker: "' + description + '". ' +
    'Identify the food item(s) and portion size mentioned (or assume a typical single ' +
    'serving if unspecified), then estimate its nutrition. ' +
    'Respond with ONLY strict JSON, no markdown, in this exact shape: ' +
    '{"food":"short name","quantity":"portion description","calories":number,' +
    '"protein":number,"carbs":number,"fat":number,"confidence":"low|medium|high"}';

  var res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
    }),
    signal: AbortSignal.timeout ? AbortSignal.timeout(15000) : undefined,
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  var data = await res.json();
  var text = data && data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error('Empty response');
  var parsed = JSON.parse(text);
  return {
    food: parsed.food || description,
    quantity: parsed.quantity || '',
    calories: Math.round(Number(parsed.calories) || 0),
    protein: Math.round(Number(parsed.protein) || 0),
    carbs: Math.round(Number(parsed.carbs) || 0),
    fat: Math.round(Number(parsed.fat) || 0),
    confidence: parsed.confidence || 'medium',
    source: 'gemini',
  };
}

// ── Glass card primitive ───────────────────────────────────────
function GlassCard(props) {
  return h('div', { style: Object.assign({
    padding: '14px 16px', borderRadius: 14,
    background: 'rgba(22,27,34,0.55)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
  }, props.style || {}) }, props.children);
}

// ── Daily totals strip ─────────────────────────────────────────
function TotalsStrip({ totals }) {
  var stats = [
    { label:'Calories', val: totals.calories, icon:'🔥', color:C.accent },
    { label:'Protein',  val: totals.protein + 'g', icon:'🥩', color:'#60a5fa' },
    { label:'Carbs',    val: totals.carbs + 'g',   icon:'🍞', color:'#fbbf24' },
    { label:'Fat',      val: totals.fat + 'g',     icon:'🥑', color:'#a78bfa' },
  ];
  return h('div', { style:{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:14 }},
    stats.map(function(s, i) {
      return h(GlassCard, { key:i, style:{ textAlign:'center', padding:'11px 6px' }},
        h('div', { style:{ fontSize:16, marginBottom:4 }}, s.icon),
        h('div', { style:{ fontSize:'1.05rem', fontWeight:900, color:s.color, lineHeight:1 }}, s.val),
        h('div', { style:{ fontSize:9, color:C.dim, fontWeight:700, marginTop:3, textTransform:'uppercase', letterSpacing:'0.06em' }}, s.label)
      );
    })
  );
}

// ── Manual entry form (fallback) ───────────────────────────────
function ManualEntryForm({ description, onSave, onCancel }) {
  var foodState = useState(description || '');
  var food = foodState[0], setFood = foodState[1];
  var calState = useState('');
  var cal = calState[0], setCal = calState[1];

  return h(GlassCard, { style:{ marginBottom: 12, border:'1px solid rgba(52,211,153,0.25)' }},
    h('div', { style:{ fontSize:12, fontWeight:800, color:C.text, marginBottom:8 }}, 'Add manually'),
    h('input', {
      value: food, onChange: function(e){ setFood(e.target.value); },
      placeholder: 'Food description',
      style: {
        width:'100%', padding:'10px 12px', borderRadius:10, marginBottom:8,
        background:'rgba(13,17,23,0.6)', border:'1px solid '+C.border,
        color:C.text, fontSize:13, fontFamily:'inherit', boxSizing:'border-box',
      }
    }),
    h('input', {
      value: cal, onChange: function(e){ setCal(e.target.value.replace(/[^0-9]/g,'')); },
      placeholder: 'Calories (kcal)', inputMode:'numeric',
      style: {
        width:'100%', padding:'10px 12px', borderRadius:10, marginBottom:10,
        background:'rgba(13,17,23,0.6)', border:'1px solid '+C.border,
        color:C.text, fontSize:13, fontFamily:'inherit', boxSizing:'border-box',
      }
    }),
    h('div', { style:{ display:'flex', gap:8 }},
      h('button', {
        onClick: function() {
          if (!food.trim() || !cal) return;
          haptic();
          onSave({ food: food.trim(), quantity:'', calories: Number(cal), protein:0, carbs:0, fat:0, confidence:'manual', source:'manual' });
        },
        style: {
          flex:1, padding:'11px', border:'none', borderRadius:10, fontWeight:800, fontSize:13,
          fontFamily:'inherit', cursor:'pointer', color:'#fff',
          background:'linear-gradient(135deg,#16a34a,#0d9488)',
        }
      }, 'Save entry'),
      h('button', {
        onClick: onCancel,
        style: {
          padding:'11px 16px', border:'1px solid '+C.border, borderRadius:10, fontWeight:700, fontSize:13,
          fontFamily:'inherit', cursor:'pointer', color:C.sub, background:'transparent',
        }
      }, 'Cancel')
    )
  );
}

// ── Logged entry row ───────────────────────────────────────────
function EntryRow({ entry, onDelete }) {
  var d = new Date(entry.date);
  var confColor = entry.confidence === 'high' ? '#34d399' : entry.confidence === 'low' ? '#f87171' : '#fbbf24';
  return h(GlassCard, { style:{ display:'flex', gap:12, alignItems:'center', marginBottom:8 }},
    h('div', { style:{
      width:38, height:38, borderRadius:10, background:'rgba(22,163,74,0.12)',
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0,
    }}, entry.source === 'manual' ? '✏️' : '🤖'),
    h('div', { style:{ flex:1, minWidth:0 }},
      h('div', { style:{ fontSize:13.5, fontWeight:800, color:C.text, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}, entry.food),
      h('div', { style:{ fontSize:11, color:C.sub }},
        d.toLocaleTimeString([], {hour:'numeric', minute:'2-digit'}) +
        (entry.quantity ? ' · ' + entry.quantity : '')
      )
    ),
    h('div', { style:{ textAlign:'right', flexShrink:0 }},
      h('div', { style:{ fontSize:15, fontWeight:900, color:C.accent }}, entry.calories + ' kcal'),
      entry.source !== 'manual' && h('div', { style:{ fontSize:9.5, fontWeight:700, color:confColor, marginTop:2, textTransform:'uppercase' }}, entry.confidence + ' confidence')
    ),
    h('button', {
      onClick: function() { haptic(); onDelete(entry.id); },
      'aria-label': 'Delete entry',
      style: {
        background:'transparent', border:'none', color:C.dim, fontSize:18, cursor:'pointer',
        padding:'4px 6px', lineHeight:1, fontFamily:'inherit', flexShrink:0,
      }
    }, '×')
  );
}

// ── Main component ─────────────────────────────────────────────
function FB2CalorieNotepad() {
  var logState = useState(function(){ return FB2.getNutritionLog2(); });
  var log = logState[0], setLog = logState[1];
  var inputState = useState('');
  var input = inputState[0], setInput = inputState[1];
  var loadingState = useState(false);
  var loading = loadingState[0], setLoading = loadingState[1];
  var manualState = useState(null); // null | description string
  var manualFor = manualState[0], setManualFor = manualState[1];
  var errState = useState('');
  var err = errState[0], setErr = errState[1];

  var totals = FB2.getNutritionTotalsToday2();
  var todayKey = new Date().toDateString();
  var todays = log.filter(function(e){ return new Date(e.date).toDateString() === todayKey; }).slice().reverse();
  var earlier = log.filter(function(e){ return new Date(e.date).toDateString() !== todayKey; }).slice().reverse().slice(0, 20);

  function saveEntry(data) {
    var saved = FB2.addNutritionEntry2(data);
    if (saved) setLog(FB2.getNutritionLog2());
    setInput('');
    setManualFor(null);
    setErr('');
  }

  function deleteEntry(id) {
    FB2.removeNutritionEntry2(id);
    setLog(FB2.getNutritionLog2());
  }

  async function handleSubmit() {
    var text = input.trim();
    if (!text || loading) return;
    haptic();
    if (!GEMINI_API_KEY) {
      setManualFor(text);
      return;
    }
    setLoading(true);
    setErr('');
    try {
      var result = await estimateWithGemini(text);
      saveEntry(result);
    } catch (e) {
      setErr("Couldn't reach the AI estimator — add it manually instead.");
      setManualFor(text);
    } finally {
      setLoading(false);
    }
  }

  return h('div', null,
    h('div', { style:{ marginBottom:14 }},
      h('div', { style:{ fontSize:'1.2rem', fontWeight:900, color:C.text, marginBottom:4 }}, 'Calorie Notepad'),
      h('div', { style:{ fontSize:12.5, color:C.sub, lineHeight:1.5 }}, 'Just describe what you ate — like a note. We’ll estimate the calories.')
    ),

    h(TotalsStrip, { totals: totals }),

    h(GlassCard, { style:{ marginBottom: 14 }},
      h('textarea', {
        value: input,
        onChange: function(e){ setInput(e.target.value); },
        placeholder: "e.g. \"In-N-Out Burger with fries\" or \"half an avocado on toast\"",
        rows: 2,
        style: {
          width:'100%', padding:'10px 12px', borderRadius:10, marginBottom:10,
          background:'rgba(13,17,23,0.5)', border:'1px solid '+C.border,
          color:C.text, fontSize:13.5, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box',
        }
      }),
      h('button', {
        onClick: handleSubmit,
        disabled: loading || !input.trim(),
        style: {
          width:'100%', padding:'13px', border:'1px solid rgba(255,255,255,0.18)', borderRadius:12,
          fontSize:14.5, fontWeight:800, fontFamily:'inherit', minHeight:48,
          cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
          background: (loading || !input.trim()) ? 'rgba(48,54,61,0.5)' : 'linear-gradient(135deg,#16a34a,#0d9488)',
          backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)',
          color: (loading || !input.trim()) ? '#374151' : '#fff',
          boxShadow: (loading || !input.trim()) ? 'none' : '0 8px 24px rgba(22,163,74,0.3)',
          transition:'all 0.2s',
        }
      }, loading ? '✨ Estimating…' : '📝 Log it'),
      err && h('div', { style:{ fontSize:11.5, color:C.danger, marginTop:8 }}, err),
      !GEMINI_API_KEY && !err && h('div', { style:{ fontSize:11, color:C.dim, marginTop:8, lineHeight:1.5 }},
        'AI estimation isn’t configured yet — entries are logged manually.')
    ),

    manualFor !== null && h(ManualEntryForm, {
      description: manualFor,
      onSave: saveEntry,
      onCancel: function(){ setManualFor(null); },
    }),

    todays.length > 0 && h('div', null,
      h('div', { style:{ fontSize:11, color:C.dim, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}, 'Today'),
      todays.map(function(entry){ return h(EntryRow, { key:entry.id, entry:entry, onDelete:deleteEntry }); })
    ),

    earlier.length > 0 && h('div', { style:{ marginTop: 16 }},
      h('div', { style:{ fontSize:11, color:C.dim, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}, 'Earlier'),
      earlier.map(function(entry){ return h(EntryRow, { key:entry.id, entry:entry, onDelete:deleteEntry }); })
    ),

    !todays.length && !earlier.length && h('div', { style:{ textAlign:'center', padding:'40px 20px', color:C.sub }},
      h('div', { style:{ fontSize:44, marginBottom:12 }}, '📝'),
      h('div', { style:{ fontSize:15, fontWeight:700, color:C.text, marginBottom:6 }}, 'No meals logged yet'),
      h('div', { style:{ fontSize:13, color:C.sub }}, 'Describe what you ate above to get started.')
    )
  );
}

A.FB2CalorieNotepad = FB2CalorieNotepad;
console.log('[SC] app-fitness-builder-2-calorie-notepad ready');
})();
