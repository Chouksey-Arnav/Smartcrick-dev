// Save as: app-drills.js
// ================================================================
// SmartCrick AI — Drills v3.2
// D-A: Target tracker bottom sheet
// D-B: Bronze/Silver/Gold tier system
// D-C: Practice session builder (chain drills, templates)
// D-F: Category completion rings (SVG progress rings)
// DR-1: Personal Record badge on drill list cards
// DR-2: Drill streak tracking (silent, on completion)
// DR-3: Featured Drill banner + 2x XP this week
// DR-6: Quick 10-Min Set button
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { nav, DB, awardXP, fireConfetti, getEncouragement, getFeaturedDrillId } = A;
const { DRILLS, DRILL_CATS, LVL_BADGE, SCHED_TYPES } = A;
const { Icon, XPBadge, PremiumBadge, EmptyState, PageHeader } = A;

// ── Youth encouragement fallback pool ───────────────────────────
const YOUTH_ENC = [
  "Outstanding! Elite cricketers train exactly like this! 🏏",
  "Champions are built one drill at a time — that's you! ⭐",
  "Your future self is going to thank you for this! 💪",
  "Match-winner in the making! You've got what it takes! 🏆",
  "Brilliant work! The coaches would notice that dedication!",
  "That's the spirit! You're getting sharper every session! 🎯",
  "Every great cricketer started right where you are — keep going! 🔥",
  "You're building real cricket skills. Be proud of yourself! 🌟",
];
var _encIdx = 0;
function nextEnc() { return YOUTH_ENC[_encIdx++ % YOUTH_ENC.length]; }

// ── Infer drill target ────────────────────────────────────────────
function inferDrillTarget(target_metric) {
  if (!target_metric) return { type:'quality', target:5 };
  var t = target_metric.toLowerCase();
  var ofMatch = t.match(/(\d+)\s+of\s+(\d+)/);
  if (ofMatch) return { type:'count', target:parseInt(ofMatch[2]) };
  var consMatch = t.match(/(\d+)\s+consecutive/);
  if (consMatch) return { type:'count', target:parseInt(consMatch[1]) };
  var fracMatch = t.match(/(\d+)\/(\d+)/);
  if (fracMatch) return { type:'count', target:parseInt(fracMatch[2]) };
  return { type:'quality', target:5 };
}

// ── D-B: Tier config ──────────────────────────────────────────────
const TIER_CONFIG = {
  none:   { label:'Not started', color:'#4b5563', bg:'rgba(75,85,99,0.10)',   border:'rgba(75,85,99,0.22)',   emoji:null },
  bronze: { label:'Bronze',      color:'#b87840', bg:'rgba(184,120,64,0.12)', border:'rgba(184,120,64,0.30)', emoji:'🥉' },
  silver: { label:'Silver',      color:'#9ca3af', bg:'rgba(156,163,175,0.12)',border:'rgba(156,163,175,0.30)',emoji:'🥈' },
  gold:   { label:'Gold',        color:'#f59e0b', bg:'rgba(245,158,11,0.12)', border:'rgba(245,158,11,0.35)', emoji:'🥇' },
};

// ── Small tier badge ──────────────────────────────────────────────
function TierBadge({ tier }) {
  if (!tier || tier === 'none') return null;
  var tc = TIER_CONFIG[tier];
  return h('span',{style:{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,
    background:tc.bg,border:'1px solid '+tc.border,color:tc.color,flexShrink:0,whiteSpace:'nowrap'}},tc.emoji,' ',tc.label);
}

// ── P5-D: Drill Score Sparkline ───────────────────────────────────
function DrillScoreSparkline({ drillId }) {
  var recent = DB.getDrillRecentScores ? DB.getDrillRecentScores(drillId) : [];
  if (!recent || !recent.length) return null;
  function dotColor(pct) { return pct>=80?'#16a34a':pct>=50?'#f59e0b':'#ef4444'; }
  return h('div', {
    role: 'img',
    'aria-label': 'Last '+recent.length+' attempt scores',
    style: { display:'flex', alignItems:'center', gap:3 },
  },
    recent.map(function(r, i) {
      return h('div', {
        key: i, 'aria-hidden': 'true', title: r.date+': '+r.pct+'%',
        style: {
          width:7, height:7, borderRadius:'50%', background:dotColor(r.pct),
          opacity: 0.5 + (i/recent.length)*0.5, transition:'all 0.3s',
        }
      });
    })
  );
}

// ── P5-B: Drill Heart Favourite Button ───────────────────────────
function DrillHeartButton({ drillId, size }) {
  var [favs, setFavs] = React.useState(function() { return DB.getDrillFavorites ? DB.getDrillFavorites() : []; });
  var isFav = favs.indexOf(drillId) !== -1;
  var s = size || 18;
  return h('button', {
    onClick: function(e) {
      e.stopPropagation();
      if(DB.toggleDrillFavorite) { var updated = DB.toggleDrillFavorite(drillId); setFavs(updated.slice()); }
    },
    'aria-label': isFav ? 'Remove from favourites' : 'Add to favourites',
    'aria-pressed': isFav ? 'true' : 'false',
    style: {
      padding:6, background:'none', border:'none', cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center',
      minWidth:36, minHeight:36, borderRadius:8, outline:'none',
    },
    onFocus: function(e) { e.currentTarget.style.boxShadow='0 0 0 2px rgba(225,29,72,0.4)'; },
    onBlur:  function(e) { e.currentTarget.style.boxShadow='none'; },
  },
    h('svg', {
      xmlns:'http://www.w3.org/2000/svg', width:s, height:s, viewBox:'0 0 24 24',
      fill:isFav?'#e11d48':'none', stroke:isFav?'#e11d48':'#374151', strokeWidth:2,
      strokeLinecap:'round', strokeLinejoin:'round', 'aria-hidden':'true',
      style:{ transition:'all 0.2s', transform:isFav?'scale(1.15)':'scale(1)' },
    },
      h('path',{d:'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'})
    )
  );
}

// ── DR-1: Personal Record badge ───────────────────────────────────
function PBBadge({ drillId, targetType, targetScore }) {
  var dp = DB.getSingleDrillProgress(drillId);
  if(!dp||!dp.personalBest||dp.personalBest===0) return null;
  var label = targetType==='quality'
    ? 'PB: '+dp.personalBest+'/5 ⭐'
    : 'PB: '+dp.personalBest+'/'+(targetScore||'?');
  return h('span',{style:{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,
    background:'rgba(139,92,246,0.10)',border:'1px solid rgba(139,92,246,0.25)',color:'#a78bfa',flexShrink:0,whiteSpace:'nowrap'}},
    label
  );
}

// ── D-B: Tier progress card ───────────────────────────────────────
function TierProgressCard({ drill }) {
  var drillData = DB.getSingleDrillProgress(drill.id);
  var tier = drillData ? drillData.tier||'none' : 'none';
  var pb = drillData ? drillData.personalBest||0 : 0;
  var attempts = drillData ? (drillData.attempts||[]).length : 0;
  var inf = inferDrillTarget(drill.target_metric);
  var type = inf.type, target = inf.target;
  var TIERS = ['none','bronze','silver','gold'];
  var tierIdx = TIERS.indexOf(tier);
  var consec = 0;
  if(drillData&&drillData.attempts){
    var recents=drillData.attempts.slice(-5);
    for(var i=recents.length-1;i>=0;i--){ if(recents[i].pct>=80) consec++; else break; }
  }
  return h('div',{style:{padding:'16px',borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:12}},
      h(Icon,{n:'target',cls:'w-4 h-4',style:{color:'#484f58'}}),
      h('span',{style:{fontSize:12,fontWeight:700,color:'#8b949e',textTransform:'uppercase',letterSpacing:'0.08em'}},'Your Progress')
    ),
    tier==='none'
      ?h('p',{style:{fontSize:13,color:'#484f58'}},
        'Complete this drill to earn tiers. Hit 80%+ of the target for Silver. Do it 3 times in a row for Gold! 🥇')
      :h('div',null,
        h('div',{style:{display:'flex',gap:8,marginBottom:12}},
          ['bronze','silver','gold'].map(function(t){
            var tc=TIER_CONFIG[t], achieved=tierIdx>=TIERS.indexOf(t);
            return h('div',{key:t,style:{flex:1,padding:'8px 6px',borderRadius:9,textAlign:'center',
              background:achieved?tc.bg:'rgba(13,17,23,0.6)',border:'1px solid '+(achieved?tc.border:'rgba(48,54,61,0.5)'),opacity:achieved?1:0.4}},
              h('div',{style:{fontSize:18,marginBottom:2}},tc.emoji||'·'),
              h('div',{style:{fontSize:9,fontWeight:700,color:achieved?tc.color:'#374151',textTransform:'uppercase',letterSpacing:'0.06em'}},tc.label)
            );
          })
        ),
        h('div',{style:{display:'flex',gap:8}},
          h('div',{style:{flex:1,padding:'8px 10px',borderRadius:8,background:'rgba(13,17,23,0.5)',border:'1px solid rgba(48,54,61,0.6)',textAlign:'center'}},
            h('div',{style:{fontSize:20,fontWeight:800,color:'#f0fdf4',fontVariantNumeric:'tabular-nums'}},type==='quality'?pb+'/5':pb+'/'+target),
            h('div',{style:{fontSize:10,color:'#6b7280',fontWeight:600,marginTop:2}},'Personal Best')
          ),
          h('div',{style:{flex:1,padding:'8px 10px',borderRadius:8,background:'rgba(13,17,23,0.5)',border:'1px solid rgba(48,54,61,0.6)',textAlign:'center'}},
            h('div',{style:{fontSize:20,fontWeight:800,color:'#f0fdf4',fontVariantNumeric:'tabular-nums'}},attempts),
            h('div',{style:{fontSize:10,color:'#6b7280',fontWeight:600,marginTop:2}},'Attempts')
          ),
          tier!=='gold'&&h('div',{style:{flex:1,padding:'8px 10px',borderRadius:8,background:'rgba(13,17,23,0.5)',border:'1px solid rgba(48,54,61,0.6)',textAlign:'center'}},
            h('div',{style:{fontSize:20,fontWeight:800,color:consec>=2?'#f59e0b':'#f0fdf4',fontVariantNumeric:'tabular-nums'}},consec+'/3'),
            h('div',{style:{fontSize:10,color:'#6b7280',fontWeight:600,marginTop:2}},'Gold Streak')
          )
        )
      )
  );
}

// ── D-A: Target Tracker Bottom Sheet ─────────────────────────────
function TargetTrackerSheet({ drill, onSubmit, onSkip }) {
  var inf = inferDrillTarget(drill.target_metric);
  var type = inf.type, target = inf.target;
  var [countVal, setCountVal] = useState(0);
  var [qualVal, setQualVal]   = useState(0);
  var score = type==='count' ? countVal : qualVal;
  var pct = target>0 ? Math.min(100,Math.round((score/target)*100)) : 0;
  var hitTarget = pct>=80;
  var barColor = hitTarget?'#16a34a':pct>=50?'#f59e0b':'#3b82f6';
  return h('div',{
    style:{position:'fixed',inset:0,zIndex:60,background:'rgba(0,0,0,0.72)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)',display:'flex',alignItems:'flex-end',justifyContent:'center'},
    onClick:onSkip},
    h('div',{onClick:function(e){e.stopPropagation();},style:{width:'100%',maxWidth:520,background:'#0d1117',borderRadius:'20px 20px 0 0',border:'1px solid rgba(48,54,61,0.9)',borderBottom:'none',padding:'0 20px 40px',animation:'sheetSlideUp 0.28s cubic-bezier(0.16,1,0.3,1)'}},
      h('div',{style:{width:40,height:4,borderRadius:2,background:'rgba(75,85,99,0.6)',margin:'12px auto 20px'}}),
      h('h3',{style:{fontSize:17,fontWeight:800,color:'#f0fdf4',marginBottom:4}},'How did you do?'),
      h('p',{style:{fontSize:13,color:'#6b7280',marginBottom:20,lineHeight:1.5}},drill.target_metric||'Rate your execution quality'),
      type!=='quality'&&h('div',{style:{marginBottom:16}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px',borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',marginBottom:12}},
          h('button',{onClick:function(){setCountVal(function(v){return Math.max(0,v-1);});},style:{width:46,height:46,borderRadius:10,background:'rgba(48,54,61,0.5)',border:'1px solid rgba(75,85,99,0.5)',color:'#e6edf3',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:300,lineHeight:1,fontFamily:'inherit'}},'−'),
          h('div',{style:{textAlign:'center'}},
            h('div',{style:{fontSize:44,fontWeight:900,color:'#f0fdf4',fontVariantNumeric:'tabular-nums',lineHeight:1}},countVal),
            h('div',{style:{fontSize:12,color:'#6b7280',marginTop:4}},'Target: '+target)
          ),
          h('button',{onClick:function(){setCountVal(function(v){return v+1;});},style:{width:46,height:46,borderRadius:10,background:'rgba(48,54,61,0.5)',border:'1px solid rgba(75,85,99,0.5)',color:'#e6edf3',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:300,lineHeight:1,fontFamily:'inherit'}},'+')
        ),
        h('div',{style:{height:6,borderRadius:3,background:'rgba(48,54,61,0.8)',overflow:'hidden',marginBottom:8}},
          h('div',{style:{height:'100%',borderRadius:3,background:barColor,width:pct+'%',transition:'width 0.3s, background 0.3s'}})),
        hitTarget&&h('div',{style:{display:'flex',alignItems:'center',gap:6,color:'#4ade80',fontSize:12,fontWeight:700}},
          h(Icon,{n:'circleCheck',cls:'w-4 h-4'}),'Target achieved! 🎯')
      ),
      type==='quality'&&h('div',{style:{marginBottom:16}},
        h('p',{style:{fontSize:12,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},'Execution quality'),
        h('div',{style:{display:'flex',gap:8,justifyContent:'center'}},
          [1,2,3,4,5].map(function(n){
            var colors=['','#ef4444','#f97316','#f59e0b','#10b981','#16a34a'];
            var labels=['','Poor','Fair','Good','Great','Elite'];
            var isSel=qualVal===n;
            return h('button',{key:n,onClick:function(){setQualVal(n);},style:{width:54,height:60,borderRadius:10,cursor:'pointer',fontFamily:'inherit',
              background:isSel?(colors[n]+'18'):'rgba(22,27,34,0.9)',border:'2px solid '+(isSel?colors[n]:'rgba(48,54,61,0.9)'),
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,transition:'all 0.15s',
              transform:isSel?'scale(1.08)':'scale(1)'}},
              h('span',{style:{fontSize:18,fontWeight:800,color:isSel?colors[n]:'#6b7280'}},n),
              isSel&&h('span',{style:{fontSize:9,color:colors[n],fontWeight:700,textTransform:'uppercase',letterSpacing:'0.04em'}},labels[n])
            );
          })
        ),
        qualVal>0&&h('p',{style:{textAlign:'center',fontSize:13,color:['','#ef4444','#f97316','#f59e0b','#10b981','#16a34a'][qualVal],fontWeight:700,marginTop:10}},
          ['','Poor — keep at it!','Fair — getting there!','Good — solid!','Great — above target! 🎯','Elite — perfect! 🏆'][qualVal])
      ),
      h('div',{style:{display:'flex',gap:10,marginTop:20}},
        h('button',{onClick:onSkip,style:{flex:'0 0 auto',padding:'13px 16px',background:'transparent',border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,cursor:'pointer',color:'#6b7280',fontSize:13,fontWeight:600,fontFamily:'inherit'}},'Skip'),
        h('button',{onClick:function(){onSubmit(score,target,type);},
          style:{flex:1,padding:'13px',background:'#16a34a',color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6},
          disabled:type==='quality'?qualVal===0:false},
          h(Icon,{n:'circleCheck',cls:'w-4 h-4'}),' Save & Complete (+'+drill.xp_value+' XP)')
      )
    )
  );
}

// ── D-F: Category Completion Rings ────────────────────────────────
function CategoryRings({ currentCat, onCatClick, completedDrills }) {
  return h('div',{style:{display:'flex',gap:8,padding:'14px 16px 0',overflowX:'auto',scrollbarWidth:'none'}},
    DRILL_CATS.map(function(cat){
      var catDrills=DRILLS.filter(function(d){return d.category===cat.id;});
      var total=catDrills.length;
      var done=catDrills.filter(function(d){return completedDrills.indexOf(d.id)!==-1;}).length;
      var pct=total>0?(done/total):0;
      var isActive=currentCat===cat.id;
      var R=20,C=2*Math.PI*R,strokeDash=pct*C;
      return h('button',{key:cat.id,onClick:function(){onCatClick(cat.id);},
        style:{display:'flex',flexDirection:'column',alignItems:'center',gap:5,flexShrink:0,
          background:'transparent',border:'none',cursor:'pointer',fontFamily:'inherit',padding:'4px 2px',
          opacity:isActive?1:0.65,transition:'opacity 0.15s,transform 0.15s',
          transform:isActive?'scale(1.1)':'scale(1)'}},
        h('div',{style:{position:'relative',width:50,height:50}},
          h('svg',{width:50,height:50,viewBox:'0 0 50 50'},
            h('circle',{cx:25,cy:25,r:R,fill:'none',stroke:'rgba(48,54,61,0.8)',strokeWidth:3}),
            done>0&&h('circle',{cx:25,cy:25,r:R,fill:'none',
              stroke:isActive?cat.from:'rgba(100,116,139,0.6)',strokeWidth:3,
              strokeDasharray:strokeDash+' '+C,strokeDashoffset:C*0.25,
              strokeLinecap:'round',transition:'stroke-dasharray 0.5s ease,stroke 0.3s'}),
            h('foreignObject',{x:8,y:8,width:34,height:34},
              h('div',{xmlns:'http://www.w3.org/1999/xhtml',style:{width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',
                borderRadius:'50%',background:isActive?(cat.from+'22'):'rgba(22,27,34,0.5)'}},
                h(Icon,{n:cat.icon,cls:'w-4 h-4',style:{color:isActive?cat.from:'#6b7280'}})
              )
            )
          )
        ),
        h('div',{style:{textAlign:'center'}},
          h('div',{style:{fontSize:9,fontWeight:700,color:isActive?cat.from:'#4b5563',whiteSpace:'nowrap'}},
            done>0?(done+'/'+total):('0/'+total))
        )
      );
    })
  );
}

// ── DR-3: Featured Drill Banner ───────────────────────────────────
function FeaturedDrillBanner({ featuredId }) {
  if(!featuredId) return null;
  var drill=DRILLS.find(function(d){return d.id===featuredId;});
  if(!drill) return null;
  return h('button',{
    onClick:function(){nav('DrillDetail',{id:featuredId});},
    style:{
      display:'flex',alignItems:'center',gap:10,margin:'0 16px 4px',padding:'10px 14px',
      borderRadius:10,background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.30)',
      cursor:'pointer',fontFamily:'inherit',textAlign:'left',width:'calc(100% - 32px)',
    }},
    h('span',{style:{fontSize:18,flexShrink:0}},'⭐'),
    h('div',{style:{flex:1,minWidth:0}},
      h('div',{style:{fontSize:10,fontWeight:800,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:2}},
        'Featured This Week — 2× XP'
      ),
      h('div',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},drill.title)
    ),
    h(Icon,{n:'chevR',cls:'w-4 h-4',style:{color:'#f59e0b',flexShrink:0}})
  );
}

// ================================================================
// DRILLS PAGE
// ================================================================
function DrillsPage() {
  var [cat,setCat]           = useState('batting');
  var [search,setSearch]     = useState('');
  var [progress,setProgress] = useState(function(){ return DB.getProgress(); });
  var [drillProg,setDrillProg] = useState(function(){ return DB.getDrillProgress(); });
  var [favs,setFavs]         = useState(function(){ return DB.getDrillFavorites ? DB.getDrillFavorites() : []; });
  var featuredId = getFeaturedDrillId ? getFeaturedDrillId() : null;

  useEffect(function(){
    var refresh=function(){
      setProgress(DB.getProgress());setDrillProg(DB.getDrillProgress());
      if(DB.getDrillFavorites) setFavs(DB.getDrillFavorites());
    };
    window.addEventListener('sc_update',refresh);
    window.addEventListener('focus',refresh);
    return function(){window.removeEventListener('sc_update',refresh);window.removeEventListener('focus',refresh);};
  },[]);

  var completed=progress.completed_drills||[];
  var catDef=DRILL_CATS.find(function(c){return c.id===cat;});
  var filtered=DRILLS.filter(function(d){
    if(cat==='favorites') return favs.indexOf(d.id)!==-1 && (search===''||d.title.toLowerCase().indexOf(search.toLowerCase())!==-1);
    return d.category===cat&&(search===''||d.title.toLowerCase().indexOf(search.toLowerCase())!==-1);
  });

  // DR-6: Quick 10-Min handler
  function handleQuick10() {
    var candidates=DRILLS.filter(function(d){return d.category===cat&&d.duration_minutes<=15;});
    if(candidates.length<2){
      candidates=DRILLS.filter(function(d){return d.duration_minutes<=15;});
    }
    var picked=candidates.slice(0,3).map(function(d){return d.id;});
    if(picked.length<2){ return; }
    try{ sessionStorage.setItem('sc_quick_drills',JSON.stringify(picked)); }catch(e){}
    nav('PracticeSession');
  }

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Cricket Drills',subtitle:DRILLS.length+' professional drills',
      gradient:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')',
      actions:h('div',{style:{display:'flex',gap:6}},
        // DR-6 Quick 10-Min
        h('button',{onClick:handleQuick10,style:{
          display:'flex',alignItems:'center',gap:4,padding:'7px 10px',borderRadius:8,
          background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.18)',
          cursor:'pointer',color:'#fff',fontSize:11,fontWeight:700,fontFamily:'inherit',whiteSpace:'nowrap',
        }},h(Icon,{n:'zap',cls:'w-3 h-3'}),'10 Min'),
        // Build Session
        h('button',{onClick:function(){nav('PracticeSession');},style:{
          display:'flex',alignItems:'center',gap:5,padding:'7px 10px',borderRadius:8,
          background:'rgba(255,255,255,0.12)',border:'1px solid rgba(255,255,255,0.18)',
          cursor:'pointer',color:'#fff',fontSize:11,fontWeight:700,fontFamily:'inherit',whiteSpace:'nowrap',
        }},h(Icon,{n:'zap',cls:'w-3 h-3'}),'Session')
      )}),

    // DR-3: Featured drill banner (above rings)
    featuredId && h(FeaturedDrillBanner,{featuredId:featuredId}),

    // D-F: Category completion rings
    h(CategoryRings,{currentCat:cat,onCatClick:function(c){setCat(c);setSearch('');},completedDrills:completed}),

    // Category pills
    h('div',{role:'tablist','aria-label':'Drill categories',className:'flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide'},
      // Favourites pill first
      h('button',{
        role:'tab', 'aria-selected':cat==='favorites'?'true':'false',
        'aria-label':'Favourite drills ('+favs.length+')',
        onClick:function(){setCat('favorites');setSearch('');},
        className:'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all',
        style:cat==='favorites'
          ?{background:'linear-gradient(135deg,#be123c,#e11d48)',color:'#fff',boxShadow:'0 4px 16px rgba(190,18,60,0.35)',outline:'none'}
          :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)',outline:'none'},
      },
        h('svg',{xmlns:'http://www.w3.org/2000/svg',width:14,height:14,viewBox:'0 0 24 24',fill:cat==='favorites'?'#fff':'none',stroke:cat==='favorites'?'#fff':'#484f58',strokeWidth:2,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':'true'},
          h('path',{d:'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'})
        ),
        'Favourites',
        favs.length>0&&h('span',{style:{marginLeft:3,fontSize:10,fontWeight:800,opacity:0.8}},favs.length)
      ),
      DRILL_CATS.map(function(c){
        return h('button',{key:c.id,role:'tab','aria-selected':cat===c.id?'true':'false',
          onClick:function(){setCat(c.id);setSearch('');},
          className:'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all',
          style:cat===c.id?{background:'linear-gradient(135deg,'+c.from+','+c.to+')',color:'#fff',boxShadow:'0 4px 16px '+c.from+'40',outline:'none'}
            :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)',outline:'none'}},
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5 flex-shrink-0',style:{color:cat===c.id?'#fff':c.text}}),' ',c.label);
      })
    ),

    // Search
    h('div',{className:'px-4 mb-3'},
      h('div',{className:'relative'},
        h(Icon,{n:'search',cls:'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2',style:{color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search drills…',value:search,onChange:function(e){setSearch(e.target.value);},
          className:'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none',
          style:{background:'rgba(22,27,34,0.9)',border:'1px solid '+(search?(catDef?catDef.from+'60':'rgba(22,163,74,0.4)'):'rgba(48,54,61,0.9)'),color:'#e6edf3'}})
      )
    ),

    // Drill cards
    h('div',{className:'px-4 space-y-2.5'},
      filtered.length===0
        ?h(EmptyState,{icon:catDef&&catDef.icon||'bat',title:'No drills found',desc:'Try a different search term'})
        :filtered.map(function(d){
          var lvl=LVL_BADGE[d.skill_level]||LVL_BADGE.beginner;
          var done=completed.indexOf(d.id)!==-1;
          var tier=drillProg[d.id]?drillProg[d.id].tier||'none':'none';
          var catD=DRILL_CATS.find(function(c){return c.id===d.category;});
          var isFeatured=featuredId===d.id;
          var inf=inferDrillTarget(d.target_metric);
          return h('div',{key:d.id,
            style:{background:'rgba(22,27,34,0.9)',borderRadius:10,position:'relative',
              border:'1px solid '+(tier==='gold'?'rgba(245,158,11,0.35)':isFeatured?'rgba(245,158,11,0.25)':done?'rgba(22,163,74,0.25)':'rgba(48,54,61,0.9)')}},
            h('button',{
              onClick:function(){nav('DrillDetail',{id:d.id});},
              'aria-label':'Open '+d.title,
              className:'w-full text-left p-4 rounded-2xl transition-all active:scale-[.99]',
              style:{background:'none',border:'none',cursor:'pointer',fontFamily:'inherit',outline:'none',display:'block',width:'100%',padding:14,paddingRight:44}},
              h('div',{className:'flex items-start gap-3'},
                h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,position:'relative',
                  background:'linear-gradient(135deg,'+(catD?catD.from:'#1d4ed8')+','+(catD?catD.to:'#4338ca')+')'}},
                  h(Icon,{n:catD?catD.icon:'bat',cls:'w-5 h-5 text-white'}),
                  done&&h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center'}},
                    h(Icon,{n:'check',cls:'w-3 h-3 text-white'}))
                ),
                h('div',{className:'flex-1 min-w-0'},
                  h('div',{className:'flex items-start justify-between gap-2'},
                    h('h3',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',lineHeight:1.3}},d.title),
                    d.is_premium&&h(PremiumBadge)
                  ),
                  isFeatured&&h('div',{style:{fontSize:10,fontWeight:700,color:'#f59e0b',marginTop:2}},'⭐ 2× XP this week'),
                  h('p',{style:{fontSize:11,color:'#484f58',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}},d.description),
                  h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6,marginTop:8}},
                    h('span',{style:{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,background:lvl.bg,border:'1px solid '+lvl.border,color:lvl.color,textTransform:'uppercase',letterSpacing:'0.04em'}},lvl.label),
                    h('span',{style:{fontSize:11,color:'#484f58'}},d.duration_minutes+' min'),
                    h(XPBadge,{xp:isFeatured?d.xp_value*2:d.xp_value}),
                    h(TierBadge,{tier:tier}),
                    h(PBBadge,{drillId:d.id,targetType:inf.type,targetScore:inf.target}),
                    // P5-D: Score sparkline
                    h(DrillScoreSparkline,{drillId:d.id})
                  )
                )
              )
            ),
            // P5-B: Heart button (outside main button, absolutely positioned)
            h('div',{style:{position:'absolute',top:8,right:4}},
              h(DrillHeartButton,{drillId:d.id,size:16})
            )
          );
        })
    )
  );
}

// ================================================================
// DRILL DETAIL PAGE
// ================================================================
function DrillDetailPage({ params }) {
  var drill=DRILLS.find(function(d){return d.id===params&&params.id?d.id===params.id:false;});
  if(!params||!params.id) drill=null;
  else drill=DRILLS.find(function(d){return d.id===params.id;});

  var [done,setDone]                 = useState(false);
  var [showSheet,setShowSheet]       = useState(false);
  var [encouragement,setEncouragement] = useState('');
  var completing                     = useRef(false);
  var catDef = drill ? DRILL_CATS.find(function(c){return c.id===drill.category;}) : null;

  var featuredId = getFeaturedDrillId ? getFeaturedDrillId() : null;
  var isFeatured = drill && featuredId===drill.id;
  var xpMultiplier = isFeatured ? 2 : 1;

  if(!drill) return h('div',{className:'pb-28 flex flex-col items-center justify-center',style:{minHeight:'80vh'}},
    h('p',{className:'font-bold text-white mb-4'},'Drill not found'),
    h('button',{onClick:function(){nav('Drills');},className:'btn-primary px-6 py-3'},'Back'));

  function handleTrackerSubmit(rawScore,targetScore,targetType) {
    if(completing.current) return; completing.current=true;
    DB.logDrillAttempt(drill.id,rawScore,targetScore,targetType);
    // DR-2: update drill streak silently
    if(DB.updateDrillStreak) DB.updateDrillStreak(drill.id);
    awardXP(drill.xp_value*xpMultiplier,drill.duration_minutes,'drill','drill',drill.id);
    var tier=DB.getDrillTier(drill.id);
    var msg=tier==='gold'?getEncouragement('gold_tier'):tier==='silver'?getEncouragement('silver_tier'):nextEnc();
    setEncouragement(msg);
    fireConfetti(); setShowSheet(false); setDone(true);
  }
  function handleTrackerSkip() {
    if(completing.current) return; completing.current=true;
    var inf=inferDrillTarget(drill.target_metric);
    DB.logDrillAttempt(drill.id,0,inf.target,inf.type);
    if(DB.updateDrillStreak) DB.updateDrillStreak(drill.id);
    awardXP(drill.xp_value*xpMultiplier,drill.duration_minutes,'drill','drill',drill.id);
    setEncouragement(nextEnc());
    fireConfetti(); setShowSheet(false); setDone(true);
  }

  if(done) {
    var tier=DB.getDrillTier(drill.id);
    return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'48px 20px',minHeight:'80vh',background:'#0d1117'}},
      h('div',{style:{width:72,height:72,borderRadius:16,background:'rgba(22,163,74,0.12)',border:'1px solid rgba(22,163,74,0.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
        h(Icon,{n:'circleCheck',cls:'w-9 h-9',style:{color:'#16a34a'}})),
      h('h2',{className:'text-2xl font-black text-white mb-2'},'Drill Complete!'),
      h('p',{className:'text-slate-400 mb-3'},drill.title),
      isFeatured&&h('div',{style:{padding:'6px 14px',borderRadius:7,background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',marginBottom:8}},
        h('span',{style:{fontSize:12,fontWeight:700,color:'#f59e0b'}},'⭐ Featured drill — 2× XP awarded!')
      ),
      h('div',{style:{display:'flex',gap:8,alignItems:'center',justifyContent:'center',marginBottom:12}},
        h(XPBadge,{xp:drill.xp_value*xpMultiplier}),h(TierBadge,{tier:tier})),
      h('div',{style:{padding:'14px 16px',borderRadius:12,background:'rgba(22,163,74,0.07)',border:'1px solid rgba(22,163,74,0.20)',maxWidth:320,marginBottom:20}},
        h('p',{style:{fontSize:14,fontWeight:600,color:'#6ee7b7',lineHeight:1.6}},encouragement)),
      h('div',{className:'mt-2 flex flex-col gap-3 w-full max-w-xs'},
        h('button',{onClick:function(){nav('Drills');},className:'btn-primary'},'More Drills'),
        h('button',{onClick:function(){setDone(false);completing.current=false;},className:'btn-secondary'},'Do Again')
      )
    );
  }

  return h('div',{className:'pb-28'},
    h(PageHeader,{title:drill.title,subtitle:drill.duration_minutes+' min · '+(drill.xp_value*xpMultiplier)+' XP'+(isFeatured?' · ⭐ 2× XP':''),
      gradient:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')',onBack:function(){nav('Drills');},
      actions:h(DrillHeartButton,{drillId:drill.id,size:20})}),

    // Featured banner on detail page
    isFeatured&&h('div',{style:{margin:'12px 16px 0',padding:'10px 14px',borderRadius:10,
      background:'rgba(245,158,11,0.10)',border:'1px solid rgba(245,158,11,0.30)',
      display:'flex',alignItems:'center',gap:10}},
      h('span',{style:{fontSize:18}},'⭐'),
      h('div',null,
        h('div',{style:{fontSize:11,fontWeight:800,color:'#f59e0b',textTransform:'uppercase',letterSpacing:'0.08em'}},'Featured This Week'),
        h('div',{style:{fontSize:12,color:'rgba(245,158,11,0.75)'}},
          'Complete this drill for '+drill.xp_value*2+' XP (2× bonus this week!)')
      )
    ),

    h('div',{className:'px-4 pt-5 space-y-4'},
      drill.video_id&&h('div',null,
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'},'Video Tutorial'),
        h('div',{style:{position:'relative',aspectRatio:'16/9',background:'#0f172a',borderRadius:'1rem',overflow:'hidden'}},
          h('iframe',{src:'https://www.youtube.com/embed/'+drill.video_id+'?modestbranding=1&rel=0&color=white',title:drill.title,
            allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',allowFullScreen:true,loading:'lazy',
            style:{position:'absolute',inset:0,width:'100%',height:'100%',border:0}}))),
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('p',{className:'text-sm text-slate-300 leading-relaxed'},drill.description)),
      h('div',null,
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-3'},drill.steps.length+' Steps'),
        h('div',{className:'space-y-2'},
          drill.steps.map(function(s,i){
            return h('div',{key:i,className:'flex items-start gap-3 p-3 rounded-xl',
              style:{background:'rgba(15,23,42,0.5)',border:'1px solid rgba(51,65,85,0.4)'}},
              h('div',{className:'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5',
                style:{background:'linear-gradient(135deg,'+(catDef?catDef.from:'#1d4ed8')+','+(catDef?catDef.to:'#4338ca')+')'}},i+1),
              h('p',{className:'text-sm text-slate-300 leading-relaxed flex-1'},s));
          }))),
      drill.tips&&h('div',{className:'flex items-start gap-3 p-4 rounded-2xl',style:{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.22)'}},
        h(Icon,{n:'sparkles',cls:'w-4 h-4 flex-shrink-0',style:{color:'#16a34a'}}),
        h('div',null,h('p',{className:'text-xs font-black text-emerald-400 uppercase tracking-wider mb-1'},'Coach Tip'),h('p',{className:'text-sm',style:{color:'#6ee7b7'}},drill.tips))),
      drill.target_metric&&h('div',{className:'flex items-start gap-3 p-4 rounded-2xl',style:{background:'rgba(59,130,246,0.07)',border:'1px solid rgba(59,130,246,0.22)'}},
        h(Icon,{n:'target',cls:'w-4 h-4 flex-shrink-0',style:{color:'#3b82f6'}}),
        h('div',null,h('p',{className:'text-xs font-black text-blue-400 uppercase tracking-wider mb-1'},'Success Target'),h('p',{className:'text-sm text-blue-300'},drill.target_metric))),
      h(TierProgressCard,{drill:drill}),

      // P5-D: 5-bar score history chart
      (function(){
        var recent=DB.getDrillRecentScores?DB.getDrillRecentScores(drill.id):[];
        if(!recent||!recent.length) return null;
        var max=5;
        function barColor(pct){return pct>=80?'#16a34a':pct>=50?'#f59e0b':'#ef4444';}
        return h('div',{
          role:'region','aria-label':'Your last '+recent.length+' attempt scores',
          style:{padding:'14px',borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
          h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},'Last '+recent.length+' Attempts'),
          h('div',{style:{display:'flex',alignItems:'flex-end',gap:6,height:40},'aria-hidden':'true'},
            recent.map(function(r,i){
              var ht=Math.max(4,Math.round((r.pct/100)*36));
              return h('div',{key:i,style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:3}},
                h('div',{style:{width:'100%',borderRadius:'3px 3px 0 0',background:barColor(r.pct),height:ht+'px',transition:'height 0.4s'}}),
                h('div',{style:{fontSize:8,color:'#484f58',fontWeight:600}},r.pct+'%')
              );
            })
          )
        );
      })(),

      // P5-B: Personal training notes
      (function(){
        var noteData=DB.getDrillNote?DB.getDrillNote(drill.id):null;
        var [noteText,setNoteText]=React.useState(noteData?noteData.text:'');
        var [saved,setSaved]=React.useState(false);
        function handleBlur(){
          if(DB.saveDrillNote) DB.saveDrillNote(drill.id,noteText);
          setSaved(true); setTimeout(function(){setSaved(false);},2000);
        }
        return h('div',{
          role:'region','aria-label':'Your personal training notes for this drill',
          style:{padding:'14px',borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
            h('label',{htmlFor:'drill-notes-'+drill.id,style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},
              '✏️ My Notes'),
            saved&&h('span',{role:'status','aria-live':'polite',style:{fontSize:11,fontWeight:700,color:'#16a34a'}},'Saved ✓')
          ),
          h('textarea',{
            id:'drill-notes-'+drill.id,
            value:noteText,
            onChange:function(e){setNoteText(e.target.value);setSaved(false);},
            onBlur:handleBlur,
            placeholder:'Add your coaching notes, what worked, personal tips...',
            rows:3,
            'aria-label':'Personal training notes for '+drill.title,
            style:{
              width:'100%',padding:'10px 12px',borderRadius:9,fontSize:13,lineHeight:1.6,
              background:'rgba(13,17,23,0.6)',border:'1px solid rgba(48,54,61,0.9)',color:'#e6edf3',
              fontFamily:'inherit',resize:'none',outline:'none',boxSizing:'border-box',
              transition:'border-color 0.15s',
            },
            onFocus:function(e){e.target.style.borderColor='#16a34a';e.target.style.boxShadow='0 0 0 3px rgba(22,163,74,0.15)';},
            onBlur2:function(e){e.target.style.borderColor='rgba(48,54,61,0.9)';e.target.style.boxShadow='none';},
          }),
          h('p',{style:{fontSize:10,color:'#374151',marginTop:5}},'Notes auto-save when you leave this field. Private to you.')
        );
      })(),
        DB.addSession({id:'sch_'+Date.now(),date:new Date().toISOString().slice(0,10),time:'',type:'drill',title:drill.title,ref_id:drill.id,duration_minutes:drill.duration_minutes,xp_value:drill.xp_value,status:'pending',notes:'',color:SCHED_TYPES.drill.color});
        window.dispatchEvent(new CustomEvent('sc_update'));
        alert('Added to today\'s schedule! ✅');},
        className:'w-full py-3 rounded-2xl text-sm font-bold text-blue-400 text-center',
        style:{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.25)',cursor:'pointer'}},'📅 Add to Today\'s Schedule'),
      h('button',{onClick:function(){setShowSheet(true);},className:'btn-primary w-full py-4 text-base font-black'},
        h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),' Mark Complete (+'+(drill.xp_value*xpMultiplier)+' XP)')
    ),
    showSheet&&h(TargetTrackerSheet,{drill:drill,onSubmit:handleTrackerSubmit,onSkip:handleTrackerSkip})
  );
}

// ================================================================
// D-C: PRACTICE SESSION BUILDER
// ================================================================
const SESSION_TEMPLATES = [
  {id:'batting',  label:'Batting Day',  icon:'bat',    color:'#3b82f6', bg:'rgba(59,130,246,0.12)',  border:'rgba(59,130,246,0.3)',  desc:'Full batting technique workout',
    drillIds:DRILLS?DRILLS.filter(function(d){return d.category==='batting';}).slice(0,4).map(function(d){return d.id;}):[]},
  {id:'bowling',  label:'Bowling Day',  icon:'wicket', color:'#ef4444', bg:'rgba(239,68,68,0.12)',   border:'rgba(239,68,68,0.3)',   desc:'Focus on your bowling attack',
    drillIds:DRILLS?DRILLS.filter(function(d){return d.category==='bowling';}).slice(0,3).map(function(d){return d.id;}):[]},
  {id:'fielding', label:'Fielding Day', icon:'shield',  color:'#10b981', bg:'rgba(16,185,129,0.12)',  border:'rgba(16,185,129,0.3)',  desc:'Sharpen your fielding skills',
    drillIds:DRILLS?DRILLS.filter(function(d){return d.category==='fielding';}).slice(0,3).map(function(d){return d.id;}):[]},
];

function PracticeSessionBuilderPage() {
  var [step,setStep]               = useState('template');
  var [selectedDrills,setSelected] = useState([]);
  var [template,setTemplate]       = useState(null);
  var [playIdx,setPlayIdx]         = useState(0);
  var [sessionDone,setSessionDone] = useState(false);
  var [totalEarned,setTotalEarned] = useState(0);
  var [encouragement,setEncouragement] = useState('');

  // DR-6: pick up quick drills from sessionStorage
  useEffect(function(){
    try {
      var quick=sessionStorage.getItem('sc_quick_drills');
      if(quick){
        var ids=JSON.parse(quick);
        sessionStorage.removeItem('sc_quick_drills');
        setSelected(ids);
        setStep('preview');
      }
    } catch(e){}
  },[]);

  var drillObjs=selectedDrills.map(function(id){return DRILLS.find(function(d){return d.id===id;});}).filter(Boolean);
  var totalXP=drillObjs.reduce(function(s,d){return s+d.xp_value;},0);
  var bonusXP=Math.floor(totalXP*0.10);
  var totalMins=drillObjs.reduce(function(s,d){return s+d.duration_minutes;},0);

  function startTemplate(tpl){
    var ids=tpl.drillIds.filter(function(id){return DRILLS.find(function(d){return d.id===id;});});
    setTemplate(tpl); setSelected(ids); setStep('preview');
  }
  function toggleDrill(id){
    setSelected(function(prev){
      return prev.indexOf(id)!==-1?prev.filter(function(x){return x!==id;}):[].concat(prev,[id]).slice(0,5);
    });
  }
  function startSession(){ setPlayIdx(0); setStep('playing'); }
  function handleDrillComplete(){
    if(playIdx<drillObjs.length-1){ setPlayIdx(function(i){return i+1;}); }
    else{ finishSession(); }
  }
  function finishSession(){
    var base=drillObjs.reduce(function(s,d){return s+d.xp_value;},0);
    var bonus=Math.floor(base*0.10);
    drillObjs.forEach(function(d){awardXP(d.xp_value,d.duration_minutes,'drill','drill',d.id);});
    awardXP(bonus,0,'session_bonus');
    DB.logPracticeSession(selectedDrills,base,bonus);
    setTotalEarned(base+bonus);
    setEncouragement(getEncouragement('session_complete')||nextEnc());
    fireConfetti(); setStep('done');
  }

  // Done screen
  if(step==='done') return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'48px 20px',minHeight:'80vh',background:'#0d1117'}},
    h('div',{style:{fontSize:56,marginBottom:16}},'🔥'),
    h('h2',{className:'text-2xl font-black text-white mb-2'},'Session Complete!'),
    h('p',{className:'text-slate-400 mb-4'},drillObjs.length+' drills · '+totalMins+' minutes'),
    h('div',{style:{display:'flex',gap:8,alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(XPBadge,{xp:totalEarned}),
      h('span',{style:{fontSize:13,fontWeight:700,color:'#f59e0b'}},'+'+bonusXP+' bonus XP! 🎯')),
    h('div',{style:{padding:'14px 16px',borderRadius:12,background:'rgba(22,163,74,0.07)',border:'1px solid rgba(22,163,74,0.20)',maxWidth:320,marginBottom:24}},
      h('p',{style:{fontSize:14,fontWeight:600,color:'#6ee7b7',lineHeight:1.6}},encouragement)),
    h('div',{style:{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:280}},
      h('button',{onClick:function(){nav('Drills');},className:'btn-primary'},'Back to Drills'),
      h('button',{onClick:function(){setStep('template');setSelected([]);setTemplate(null);setPlayIdx(0);},className:'btn-secondary'},'Build Another Session')
    )
  );

  // Playing
  if(step==='playing'){
    var d=drillObjs[playIdx];
    if(!d){finishSession();return null;}
    var cd=DRILL_CATS.find(function(c){return c.id===d.category;});
    return h('div',{className:'pb-28'},
      h('div',{style:{background:'linear-gradient(135deg,'+(cd?cd.from:'#1d4ed8')+','+(cd?cd.to:'#4338ca')+')',padding:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 1.25rem 1.25rem',position:'relative'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
          h('button',{onClick:function(){nav('Drills');},style:{color:'rgba(255,255,255,0.7)',background:'rgba(255,255,255,0.15)',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'inherit'}},'✕ Exit'),
          h('div',{style:{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.8)'}},'Drill '+(playIdx+1)+' of '+drillObjs.length)
        ),
        h('h1',{style:{fontSize:'1.25rem',fontWeight:900,color:'#fff',margin:0}},d.title),
        h('p',{style:{fontSize:12,color:'rgba(255,255,255,0.65)',marginTop:4}},d.duration_minutes+' min · '+d.xp_value+' XP'),
        h('div',{style:{height:4,borderRadius:2,background:'rgba(255,255,255,0.2)',overflow:'hidden',marginTop:12}},
          h('div',{style:{height:'100%',background:'#fff',borderRadius:2,width:(playIdx/drillObjs.length*100)+'%',transition:'width 0.5s'}}))
      ),
      h('div',{style:{padding:'20px 16px'}},
        h('div',{style:{padding:'14px',borderRadius:12,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',marginBottom:16}},
          h('p',{style:{fontSize:13,color:'#8b949e',lineHeight:1.7}},d.description)),
        h('div',{style:{marginBottom:16}},
          h('p',{style:{fontSize:11,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},d.steps.length+' Steps'),
          h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
            d.steps.map(function(s,i){
              return h('div',{key:i,style:{display:'flex',gap:10,padding:'10px 12px',borderRadius:8,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
                h('span',{style:{width:20,height:20,borderRadius:'50%',background:'linear-gradient(135deg,'+(cd?cd.from:'#1d4ed8')+','+(cd?cd.to:'#4338ca')+')',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:'#fff',flexShrink:0}},i+1),
                h('p',{style:{fontSize:12,color:'#8b949e',flex:1,lineHeight:1.6}},s));
            }))),
        h('button',{onClick:handleDrillComplete,className:'btn-primary w-full py-4 text-base font-black'},
          playIdx<drillObjs.length-1?'✓ Done! Next: '+drillObjs[playIdx+1].title.slice(0,20)+'…':'🎉 Complete Session!'
        )
      )
    );
  }

  // Preview
  if(step==='preview') return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Your Practice Session',subtitle:drillObjs.length+' drills · '+totalMins+' min · '+(totalXP+bonusXP)+' XP',
      gradient:'linear-gradient(135deg,#1e40af,#1d4ed8)',onBack:function(){setStep('custom');}}),
    h('div',{style:{padding:'20px 16px'}},
      h('div',{style:{padding:'12px 14px',borderRadius:10,background:'rgba(245,158,11,0.10)',border:'1px solid rgba(245,158,11,0.25)',marginBottom:16,display:'flex',alignItems:'center',gap:10}},
        h('span',{style:{fontSize:18}},'🎯'),
        h('div',null,
          h('p',{style:{fontSize:12,fontWeight:700,color:'#f59e0b'}},'Session Bonus XP'),
          h('p',{style:{fontSize:11,color:'rgba(245,158,11,0.7)'}},
            'Complete all '+drillObjs.length+' drills for +'+bonusXP+' bonus XP!'))
      ),
      h('p',{style:{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},'Drills in this session'),
      h('div',{style:{display:'flex',flexDirection:'column',gap:8,marginBottom:20}},
        drillObjs.map(function(d,i){
          var catD=DRILL_CATS.find(function(c){return c.id===d.category;});
          return h('div',{key:d.id,style:{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',borderRadius:10,background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)'}},
            h('div',{style:{width:28,height:28,borderRadius:6,background:'linear-gradient(135deg,'+(catD?catD.from:'#1d4ed8')+','+(catD?catD.to:'#4338ca')+')',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:12,fontWeight:800,color:'#fff'}},i+1),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4'}},d.title),
              h('div',{style:{display:'flex',alignItems:'center',gap:6,marginTop:3}},
                h('span',{style:{fontSize:11,color:'#6b7280'}},d.duration_minutes+' min'),h(XPBadge,{xp:d.xp_value})))
          );
        })
      ),
      drillObjs.length>=2
        ?h('button',{onClick:startSession,className:'btn-primary',style:{padding:'14px',fontSize:15,fontWeight:700}},h(Icon,{n:'play',cls:'w-5 h-5'}),' Start Session Now')
        :h('p',{style:{textAlign:'center',color:'#ef4444',fontSize:13,fontWeight:600}},'Add at least 2 drills to start!')
    )
  );

  // Custom picker
  if(step==='custom') return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Build Custom Session',subtitle:'Pick 2–5 drills · '+selectedDrills.length+' selected',gradient:'linear-gradient(135deg,#1e40af,#1d4ed8)',onBack:function(){setStep('template');}}),
    h('div',{style:{padding:'12px 16px 0'}},
      h('div',{style:{display:'flex',flexDirection:'column',gap:6}},
        DRILLS.map(function(d){
          var catD=DRILL_CATS.find(function(c){return c.id===d.category;});
          var isSel=selectedDrills.indexOf(d.id)!==-1;
          return h('button',{key:d.id,onClick:function(){toggleDrill(d.id);},style:{
            display:'flex',alignItems:'center',gap:10,padding:'11px 12px',borderRadius:9,
            background:isSel?'rgba(22,163,74,0.09)':'rgba(22,27,34,0.9)',
            border:'1.5px solid '+(isSel?'rgba(22,163,74,0.4)':'rgba(48,54,61,0.9)'),
            cursor:'pointer',textAlign:'left',fontFamily:'inherit',width:'100%',}},
            h('div',{style:{width:32,height:32,borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
              background:'linear-gradient(135deg,'+(catD?catD.from:'#1d4ed8')+','+(catD?catD.to:'#4338ca')+')'}},
              h(Icon,{n:catD?catD.icon:'bat',cls:'w-3.5 h-3.5 text-white'})),
            h('div',{style:{flex:1,minWidth:0}},
              h('div',{style:{fontSize:12,fontWeight:700,color:'#f0fdf4'}},d.title),
              h('div',{style:{fontSize:11,color:'#6b7280'}},d.duration_minutes+' min · '+d.xp_value+' XP')),
            isSel&&h('div',{style:{width:22,height:22,borderRadius:'50%',background:'#16a34a',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}},
              h(Icon,{n:'check',cls:'w-3 h-3 text-white'}))
          );
        })
      )
    ),
    selectedDrills.length>=2&&h('div',{style:{position:'fixed',bottom:'calc(env(safe-area-inset-bottom,0px) + 16px)',left:16,right:16,zIndex:20}},
      h('button',{onClick:function(){setStep('preview');},className:'btn-primary',style:{padding:'14px',fontSize:14,fontWeight:700,boxShadow:'0 8px 24px rgba(22,163,74,0.35)'}},
        'Preview Session ('+selectedDrills.length+' drills · '+(totalXP+bonusXP)+' XP) →')
    )
  );

  // Template selection
  return h('div',{className:'pb-28'},
    h(PageHeader,{title:'Build a Practice Session',subtitle:'Chain drills together for bonus XP',gradient:'linear-gradient(135deg,#1e40af,#1d4ed8)',onBack:function(){nav('Drills');}}),
    h('div',{style:{padding:'20px 16px'}},
      h('div',{style:{padding:'12px 14px',borderRadius:10,background:'rgba(245,158,11,0.10)',border:'1px solid rgba(245,158,11,0.25)',marginBottom:20,display:'flex',gap:10}},
        h('span',{style:{fontSize:18}},'⚡'),
        h('p',{style:{fontSize:12,color:'rgba(245,158,11,0.85)',lineHeight:1.5,fontWeight:600}},'Complete a full session to earn 10% bonus XP on top of each drill!')),
      h('p',{style:{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},'Quick Start Templates'),
      h('div',{style:{display:'flex',flexDirection:'column',gap:10,marginBottom:24}},
        SESSION_TEMPLATES.map(function(tpl){
          var drs=tpl.drillIds.map(function(id){return DRILLS.find(function(d){return d.id===id;});}).filter(Boolean);
          return h('button',{key:tpl.id,onClick:function(){startTemplate(tpl);},style:{
            display:'flex',alignItems:'center',gap:12,padding:'14px 16px',borderRadius:12,
            background:tpl.bg,border:'1px solid '+tpl.border,cursor:'pointer',textAlign:'left',width:'100%',fontFamily:'inherit'}},
            h('div',{style:{width:44,height:44,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,background:'rgba(0,0,0,0.2)'}},
              h(Icon,{n:tpl.icon,cls:'w-5 h-5',style:{color:tpl.color}})),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:14,fontWeight:700,color:'#f0fdf4',marginBottom:3}},tpl.label),
              h('div',{style:{fontSize:12,color:'rgba(255,255,255,0.5)',marginBottom:6}},tpl.desc),
              h('div',{style:{display:'flex',alignItems:'center',gap:8}},
                h('span',{style:{fontSize:11,color:tpl.color,fontWeight:600}},drs.reduce(function(s,d){return s+d.duration_minutes;},0)+' min'),
                h('span',{style:{fontSize:11,color:'rgba(255,255,255,0.4)'}},drs.length+' drills'),
                h(XPBadge,{xp:drs.reduce(function(s,d){return s+d.xp_value;},0)+Math.floor(drs.reduce(function(s,d){return s+d.xp_value;},0)*0.1)})
              )
            ),
            h(Icon,{n:'chevR',cls:'w-5 h-5 flex-shrink-0',style:{color:'rgba(255,255,255,0.25)'}})
          );
        })
      ),
      h('div',{style:{borderTop:'1px solid rgba(48,54,61,0.8)',paddingTop:20}},
        h('p',{style:{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},'Or Build Your Own'),
        h('button',{onClick:function(){setStep('custom');},style:{
          display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',
          padding:'14px',borderRadius:12,background:'rgba(22,27,34,0.9)',
          border:'1px dashed rgba(48,54,61,0.9)',cursor:'pointer',fontFamily:'inherit'}},
          h(Icon,{n:'zap',cls:'w-5 h-5',style:{color:'#6b7280'}}),
          h('span',{style:{fontSize:14,fontWeight:700,color:'#8b949e'}},'Custom Session (Pick any drills)'))
      )
    )
  );
}

Object.assign(window.SC_APP,{
  DrillsPage:DrillsPage,DrillDetailPage:DrillDetailPage,PracticeSessionBuilderPage:PracticeSessionBuilderPage,
  TargetTrackerSheet:TargetTrackerSheet,TierProgressCard:TierProgressCard,TierBadge:TierBadge,CategoryRings:CategoryRings,
  inferDrillTarget:inferDrillTarget,TIER_CONFIG:TIER_CONFIG,SESSION_TEMPLATES:SESSION_TEMPLATES,
  FeaturedDrillBanner:FeaturedDrillBanner,PBBadge:PBBadge,
});
console.log('[SC] app-drills v3.2 — DR-1 PB badge, DR-2 streak, DR-3 featured, DR-6 quick set');
})();
