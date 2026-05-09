// ================================================================
// Save as: app-drills.js
// SmartCrick AI — Drills Page + Drill Detail
// UPDATED: D-A target tracker bottom sheet, D-B Bronze/Silver/Gold tiers
// ================================================================
(function () {
'use strict';
const { createElement:h, useState, useEffect, useRef } = React;
const { nav, DB, awardXP, fireConfetti } = window.SC_APP;
const { DRILLS, DRILL_CATS, LVL_BADGE, SCHED_TYPES } = window.SC_APP;
const { Icon, XPBadge, PremiumBadge, EmptyState, PageHeader } = window.SC_APP;

// ── D-A: Infer drill target type from target_metric string ───────
// Returns { type: 'count'|'quality'|'time', target: number, displayMax: string }
function inferDrillTarget(target_metric) {
  if (!target_metric) return { type:'quality', target:5, displayMax:'/ 5' };
  const t = target_metric.toLowerCase();

  // "X of Y" — e.g. "8 of 10 balls" → count, max=Y
  const ofMatch = t.match(/(\d+)\s+of\s+(\d+)/);
  if (ofMatch) return { type:'count', target:parseInt(ofMatch[2]), displayMax:`/ ${ofMatch[2]}` };

  // "X consecutive" — e.g. "10 consecutive clean drives" → count, max=X
  const consMatch = t.match(/(\d+)\s+consecutive/);
  if (consMatch) return { type:'count', target:parseInt(consMatch[1]), displayMax:`/ ${consMatch[1]}` };

  // "X of Y" alternative phrasing — "4 of 6"
  const fracMatch = t.match(/(\d+)\/(\d+)/);
  if (fracMatch) return { type:'count', target:parseInt(fracMatch[2]), displayMax:`/ ${fracMatch[2]}` };

  // "under X seconds/minutes" → time
  const timeMatch = t.match(/under\s+(\d+(?:\.\d+)?)\s+(second|minute)/);
  if (timeMatch) {
    const val = parseFloat(timeMatch[1]);
    const unit = timeMatch[2][0]; // 's' or 'm'
    return { type:'time', target:val, displayMax:unit };
  }

  // Default: quality rating 1-5
  return { type:'quality', target:5, displayMax:'/ 5' };
}

// ── D-B: Tier configuration ───────────────────────────────────────
const TIER_CONFIG = {
  none:   { label:'Not started',     color:'#4b5563', bg:'rgba(75,85,99,0.10)', border:'rgba(75,85,99,0.25)',  emoji:null },
  bronze: { label:'Bronze',          color:'#b87840', bg:'rgba(184,120,64,0.12)',border:'rgba(184,120,64,0.30)', emoji:'🥉' },
  silver: { label:'Silver',          color:'#9ca3af', bg:'rgba(156,163,175,0.12)',border:'rgba(156,163,175,0.30)',emoji:'🥈' },
  gold:   { label:'Gold',            color:'#f59e0b', bg:'rgba(245,158,11,0.12)',border:'rgba(245,158,11,0.30)', emoji:'🥇' },
};

// ── D-A: Target Tracker Bottom Sheet ─────────────────────────────
// Shows after tapping "Mark Complete". Collects the score before
// awarding XP and logging the attempt.
function TargetTrackerSheet({ drill, onSubmit, onSkip }) {
  const { type, target, displayMax } = inferDrillTarget(drill.target_metric);
  const [countVal,  setCountVal]  = useState(0);
  const [qualityVal,setQualityVal]= useState(0);

  const score     = type === 'count' || type === 'time' ? countVal : qualityVal;
  const targetVal = target;
  const pct       = targetVal > 0 ? Math.min(100, Math.round((score / targetVal) * 100)) : 0;
  const hitTarget = pct >= 80;

  const barColor = hitTarget ? '#16a34a' : pct >= 50 ? '#f59e0b' : '#3b82f6';

  return h('div',{style:{
    position:'fixed',inset:0,zIndex:60,
    background:'rgba(0,0,0,0.72)',
    backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)',
    display:'flex',alignItems:'flex-end',justifyContent:'center',
  },
    onClick:onSkip, // tap backdrop = skip tracker
  },
    h('div',{
      onClick:e=>e.stopPropagation(),
      style:{
        width:'100%',maxWidth:520,
        background:'#0d1117',
        borderRadius:'20px 20px 0 0',
        border:'1px solid rgba(48,54,61,0.9)',
        borderBottom:'none',
        padding:'0 20px 40px',
      }
    },
      // Drag handle
      h('div',{style:{width:40,height:4,borderRadius:2,background:'rgba(75,85,99,0.6)',margin:'12px auto 20px'}}),

      // Header
      h('h3',{style:{fontSize:17,fontWeight:800,color:'#f0fdf4',marginBottom:4}},
        'How did you do?'),
      h('p',{style:{fontSize:13,color:'#6b7280',marginBottom:20,lineHeight:1.5}},
        drill.target_metric || 'Rate your execution of this drill'),

      // ── Count input (for count / time drills) ─────────────────
      type !== 'quality' && h('div',{style:{marginBottom:16}},
        h('div',{style:{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 18px',borderRadius:12,
          background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',
          marginBottom:12,
        }},
          h('button',{
            onClick:()=>setCountVal(v=>Math.max(0,v-1)),
            style:{
              width:46,height:46,borderRadius:10,
              background:'rgba(48,54,61,0.5)',border:'1px solid rgba(75,85,99,0.5)',
              color:'#e6edf3',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:22,fontWeight:300,lineHeight:1,
            }
          },'−'),
          h('div',{style:{textAlign:'center'}},
            h('div',{style:{fontSize:44,fontWeight:900,color:'#f0fdf4',fontVariantNumeric:'tabular-nums',lineHeight:1}},
              countVal),
            h('div',{style:{fontSize:12,color:'#6b7280',marginTop:4}},
              `Target: ${target} ${type==='time'?displayMax:''}`)
          ),
          h('button',{
            onClick:()=>setCountVal(v=>v+1),
            style:{
              width:46,height:46,borderRadius:10,
              background:'rgba(48,54,61,0.5)',border:'1px solid rgba(75,85,99,0.5)',
              color:'#e6edf3',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:22,fontWeight:300,lineHeight:1,
            }
          },'+')
        ),
        // Progress bar vs target
        h('div',{style:{height:6,borderRadius:3,background:'rgba(48,54,61,0.8)',overflow:'hidden',marginBottom:8}},
          h('div',{style:{
            height:'100%',borderRadius:3,
            background:barColor,
            width:`${pct}%`,
            transition:'width 0.3s, background 0.3s',
          }})
        ),
        hitTarget && h('div',{style:{display:'flex',alignItems:'center',gap:6,color:'#4ade80',fontSize:12,fontWeight:700}},
          h(Icon,{n:'circleCheck',cls:'w-4 h-4'}),'Target achieved! Well done 🎯'
        )
      ),

      // ── Quality rating (1-5 for technique drills) ─────────────
      type === 'quality' && h('div',{style:{marginBottom:16}},
        h('p',{style:{fontSize:12,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}},'Execution quality'),
        h('div',{style:{display:'flex',gap:8,justifyContent:'center'}},
          [1,2,3,4,5].map(n=>{
            const colors = ['','#ef4444','#f97316','#f59e0b','#10b981','#16a34a'];
            const labels = ['','Poor','Fair','Good','Great','Elite'];
            const isSelected = qualityVal === n;
            return h('button',{key:n,
              onClick:()=>setQualityVal(n),
              style:{
                width:54,height:60,borderRadius:10,cursor:'pointer',
                background:isSelected?`${colors[n]}18`:'rgba(22,27,34,0.9)',
                border:`2px solid ${isSelected?colors[n]:'rgba(48,54,61,0.9)'}`,
                display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
                gap:4,transition:'all 0.15s',
                transform:isSelected?'scale(1.08)':'scale(1)',
              }
            },
              h('span',{style:{fontSize:18,fontWeight:800,color:isSelected?colors[n]:'#6b7280'}},n),
              h('span',{style:{fontSize:9,fontWeight:700,color:isSelected?colors[n]:'#4b5563',
                textTransform:'uppercase',letterSpacing:'0.04em'}}),
              qualityVal===n && h('span',{style:{fontSize:9,color:colors[n],fontWeight:700}},labels[n])
            );
          })
        ),
        qualityVal>0 && h('p',{style:{textAlign:'center',fontSize:13,color:['','#ef4444','#f97316','#f59e0b','#10b981','#16a34a'][qualityVal],fontWeight:700,marginTop:10}},
          ['','Poor — keep practicing','Fair — getting there','Good — solid technique','Great — above target!','Elite — perfect execution!'][qualityVal]
        )
      ),

      // Action buttons
      h('div',{style:{display:'flex',gap:10,marginTop:20}},
        h('button',{
          onClick:onSkip,
          style:{
            flex:'0 0 auto',padding:'13px 16px',background:'transparent',
            border:'1px solid rgba(48,54,61,0.9)',borderRadius:10,
            cursor:'pointer',color:'#6b7280',fontSize:13,fontWeight:600,
          }
        },'Skip'),
        h('button',{
          onClick:()=>onSubmit(score, targetVal, type),
          className:'btn-primary',
          style:{flex:1,padding:'13px'},
          disabled: type==='quality' ? qualityVal===0 : false,
        },
          h(Icon,{n:'circleCheck',cls:'w-4 h-4'}),
          ` Save & Complete (+${drill.xp_value} XP)`
        )
      )
    )
  );
}

// ── D-B: Tier Progress Card (shown on drill detail page) ──────────
function TierProgressCard({ drill }) {
  const drillData = DB.getSingleDrillProgress(drill.id);
  const tier      = drillData?.tier || 'none';
  const pb        = drillData?.personalBest || 0;
  const attempts  = drillData?.attempts?.length || 0;
  const { type, target } = inferDrillTarget(drill.target_metric);

  const TIERS = ['none','bronze','silver','gold'];
  const tierIdx = TIERS.indexOf(tier);

  // How many consecutive hits at 80%+ toward gold
  let consec = 0;
  if (drillData?.attempts) {
    const recents = drillData.attempts.slice(-5);
    for (let i = recents.length-1; i>=0; i--) {
      if (recents[i].pct >= 80) consec++;
      else break;
    }
  }

  return h('div',{style:{
    padding:'16px',borderRadius:12,
    background:'rgba(22,27,34,0.9)',border:'1px solid rgba(48,54,61,0.9)',
  }},
    h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:12}},
      h(Icon,{n:'target',cls:'w-4 h-4',style:{color:'#484f58'}}),
      h('span',{style:{fontSize:12,fontWeight:700,color:'#8b949e',textTransform:'uppercase',letterSpacing:'0.08em'}},'Your Progress')
    ),

    tier === 'none'
      ? h('p',{style:{fontSize:13,color:'#484f58',marginBottom:12}},
          'Complete this drill to start earning tiers. Hit 80% of the target to reach Silver, 3 times in a row for Gold.')
      : h('div',{},
          // Tier badges row
          h('div',{style:{display:'flex',gap:8,marginBottom:12}},
            ['bronze','silver','gold'].map(t=>{
              const tc = TIER_CONFIG[t];
              const achieved = tierIdx >= TIERS.indexOf(t);
              return h('div',{key:t,style:{
                flex:1,padding:'8px 6px',borderRadius:9,textAlign:'center',
                background:achieved?tc.bg:'rgba(13,17,23,0.6)',
                border:`1px solid ${achieved?tc.border:'rgba(48,54,61,0.5)'}`,
                opacity:achieved?1:0.4,
                transition:'all 0.2s',
              }},
                h('div',{style:{fontSize:18,marginBottom:2}},tc.emoji||'·'),
                h('div',{style:{fontSize:10,fontWeight:700,color:achieved?tc.color:'#374151',
                  textTransform:'uppercase',letterSpacing:'0.06em'}}),tc.label
              );
            })
          ),
          // Personal best + attempt count
          h('div',{style:{display:'flex',gap:8}},
            h('div',{style:{flex:1,padding:'8px 10px',borderRadius:8,
              background:'rgba(13,17,23,0.5)',border:'1px solid rgba(48,54,61,0.6)',textAlign:'center'}},
              h('div',{style:{fontSize:20,fontWeight:800,color:'#f0fdf4',fontVariantNumeric:'tabular-nums'}},
                type==='quality' ? `${pb}/5` : `${pb}${type==='count'?'/'+target:''}`),
              h('div',{style:{fontSize:10,color:'#6b7280',fontWeight:600,marginTop:2}},'Personal Best')
            ),
            h('div',{style:{flex:1,padding:'8px 10px',borderRadius:8,
              background:'rgba(13,17,23,0.5)',border:'1px solid rgba(48,54,61,0.6)',textAlign:'center'}},
              h('div',{style:{fontSize:20,fontWeight:800,color:'#f0fdf4',fontVariantNumeric:'tabular-nums'}},attempts),
              h('div',{style:{fontSize:10,color:'#6b7280',fontWeight:600,marginTop:2}},'Attempts')
            ),
            tier !== 'gold' && h('div',{style:{flex:1,padding:'8px 10px',borderRadius:8,
              background:'rgba(13,17,23,0.5)',border:'1px solid rgba(48,54,61,0.6)',textAlign:'center'}},
              h('div',{style:{fontSize:20,fontWeight:800,color:consec>=2?'#f59e0b':'#f0fdf4',fontVariantNumeric:'tabular-nums'}},
                `${consec}/3`),
              h('div',{style:{fontSize:10,color:'#6b7280',fontWeight:600,marginTop:2}},'Gold Streak')
            )
          )
        )
  );
}

// ── Small tier badge for list cards ──────────────────────────────
function TierBadge({ tier }) {
  if (!tier || tier === 'none') return null;
  const tc = TIER_CONFIG[tier];
  return h('span',{style:{
    display:'inline-flex',alignItems:'center',gap:3,
    fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,
    background:tc.bg,border:`1px solid ${tc.border}`,color:tc.color,
    flexShrink:0,whiteSpace:'nowrap',
  }},tc.emoji,' ',tc.label);
}

// ================================================================
// DRILLS PAGE — with D-B tier badges on cards
// ================================================================
function DrillsPage() {
  const [cat,     setCat]     = useState('batting');
  const [search,  setSearch]  = useState('');
  const [progress,setProgress]= useState(()=>DB.getProgress());
  const [drillProg,setDrillProg]= useState(()=>DB.getDrillProgress());

  useEffect(()=>{
    const refresh=()=>{ setProgress(DB.getProgress()); setDrillProg(DB.getDrillProgress()); };
    window.addEventListener('sc_update',refresh);
    window.addEventListener('focus',refresh);
    return ()=>{ window.removeEventListener('sc_update',refresh); window.removeEventListener('focus',refresh); };
  },[]);

  const completed = progress.completed_drills || [];
  const catDef    = DRILL_CATS.find(c=>c.id===cat);
  const filtered  = DRILLS.filter(d=>
    d.category===cat &&
    (search==='' || d.title.toLowerCase().includes(search.toLowerCase()))
  );

  return h('div',{className:'pb-28'},
    h(PageHeader,{
      title:'Cricket Drills',
      subtitle:`${DRILLS.length} professional drills`,
      gradient:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`,
    }),

    // Category pills
    h('div',{className:'flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide'},
      DRILL_CATS.map(c=>
        h('button',{key:c.id,onClick:()=>setCat(c.id),
          className:'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all',
          style:cat===c.id
            ?{background:`linear-gradient(135deg,${c.from},${c.to})`,color:'#fff',boxShadow:`0 4px 16px ${c.from}40`}
            :{background:'rgba(22,27,34,0.9)',color:'#8b949e',border:'1px solid rgba(48,54,61,0.9)'}
        },
          h(Icon,{n:c.icon,cls:'w-3.5 h-3.5 flex-shrink-0',style:{color:cat===c.id?'#fff':c.text}}),
          ' ', c.label)
      )
    ),

    // Search
    h('div',{className:'px-4 mb-3'},
      h('div',{className:'relative'},
        h(Icon,{n:'search',cls:'w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2',style:{color:'#484f58'}}),
        h('input',{type:'text',placeholder:'Search drills…',value:search,onChange:e=>setSearch(e.target.value),
          className:'w-full pl-9 pr-4 py-2.5 rounded-xl text-sm placeholder-slate-600 outline-none',
          style:{background:'rgba(22,27,34,0.9)',border:`1px solid ${search?catDef?.from+'60':'rgba(48,54,61,0.9)'}`,color:'#e6edf3'}
        })
      )
    ),

    // Drill cards list
    h('div',{className:'px-4 space-y-2.5'},
      filtered.length===0
        ? h(EmptyState,{icon:catDef?.icon||'bat',title:'No drills found',desc:'Try a different search term'})
        : filtered.map(d=>{
          const lvl       = LVL_BADGE[d.skill_level]||LVL_BADGE.beginner;
          const done      = completed.includes(d.id);
          const tier      = drillProg[d.id]?.tier || 'none';
          return h('button',{key:d.id,onClick:()=>nav('DrillDetail',{id:d.id}),
            className:'w-full text-left p-4 rounded-2xl transition-all active:scale-[.99]',
            style:{
              background:'rgba(22,27,34,0.9)',
              border:`1px solid ${tier==='gold'?'rgba(245,158,11,0.35)':done?'rgba(22,163,74,0.25)':'rgba(48,54,61,0.9)'}`,
              borderRadius:10,
            }
          },
            h('div',{className:'flex items-start gap-3'},
              // Category icon with done checkmark overlay
              h('div',{style:{width:44,height:44,borderRadius:8,display:'flex',alignItems:'center',
                justifyContent:'center',flexShrink:0,position:'relative',
                background:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`}},
                h(Icon,{n:catDef?.icon||'bat',cls:'w-5 h-5 text-white'}),
                done && h('div',{style:{position:'absolute',top:-4,right:-4,width:18,height:18,
                  borderRadius:'50%',background:'#16a34a',
                  display:'flex',alignItems:'center',justifyContent:'center'}},
                  h(Icon,{n:'check',cls:'w-3 h-3 text-white'})
                )
              ),
              h('div',{className:'flex-1 min-w-0'},
                h('div',{className:'flex items-start justify-between gap-2'},
                  h('h3',{style:{fontSize:13,fontWeight:700,color:'#e6edf3',lineHeight:1.3}},d.title),
                  d.is_premium && h(PremiumBadge)
                ),
                h('p',{style:{fontSize:11,color:'#484f58',marginTop:4,overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}},d.description),
                h('div',{style:{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6,marginTop:8}},
                  h('span',{style:{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:4,
                    background:lvl.bg,border:`1px solid ${lvl.border}`,color:lvl.color,
                    textTransform:'uppercase',letterSpacing:'0.04em'}},lvl.label),
                  h('span',{style:{fontSize:11,color:'#484f58'}},`${d.duration_minutes} min`),
                  h(XPBadge,{xp:d.xp_value}),
                  // D-B tier badge
                  h(TierBadge,{tier})
                )
              )
            )
          );
        })
    )
  );
}

// ================================================================
// DRILL DETAIL PAGE — D-A target tracker + D-B tier progress card
// ================================================================
function DrillDetailPage({ params }) {
  const drill      = DRILLS.find(d=>d.id===params?.id);
  const [done,     setDone]      = useState(false);
  const [showSheet,setShowSheet] = useState(false); // D-A tracker sheet
  const completing = useRef(false);
  const catDef     = DRILL_CATS.find(c=>c.id===drill?.category);

  // ── Not found ──────────────────────────────────────────────────
  if(!drill) return h('div',{className:'pb-28 flex flex-col items-center justify-center',style:{minHeight:'80vh'}},
    h('div',{style:{width:56,height:56,borderRadius:12,background:'rgba(48,54,61,0.6)',
      display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
      h(Icon,{n:'bat',cls:'w-7 h-7',style:{color:'#484f58'}})
    ),
    h('div',{className:'font-bold text-white mb-4'},'Drill not found'),
    h('button',{onClick:()=>nav('Drills'),className:'btn-primary px-6 py-3'},'Back to Drills')
  );

  // ── D-A: Handle tracker submission ────────────────────────────
  const handleTrackerSubmit = (rawScore, targetScore, targetType) => {
    if (completing.current) return;
    completing.current = true;
    // Log the attempt to drill_progress (updates tier)
    DB.logDrillAttempt(drill.id, rawScore, targetScore, targetType);
    // Award XP (existing logic: full XP first time, badge check)
    awardXP(drill.xp_value, drill.duration_minutes, 'drill', 'drill', drill.id);
    fireConfetti();
    setShowSheet(false);
    setDone(true);
  };

  // ── D-A: Skip tracker (legacy complete, still logs bronze) ────
  const handleTrackerSkip = () => {
    if (completing.current) return;
    completing.current = true;
    // Log a 0-score attempt so drill still gets Bronze tier
    const { target, type } = inferDrillTarget(drill.target_metric);
    DB.logDrillAttempt(drill.id, 0, target, type);
    awardXP(drill.xp_value, drill.duration_minutes, 'drill', 'drill', drill.id);
    fireConfetti();
    setShowSheet(false);
    setDone(true);
  };

  // Open the tracker sheet instead of completing directly
  const openTracker = () => {
    if (completing.current) return;
    setShowSheet(true);
  };

  // ── Completion screen ──────────────────────────────────────────
  if(done) {
    const tier = DB.getDrillTier(drill.id);
    const tc   = TIER_CONFIG[tier];
    return h('div',{className:'flex flex-col items-center justify-center text-center px-5 pb-28',style:{minHeight:'100vh',background:'#0d1117'}},
      h('div',{style:{width:72,height:72,borderRadius:16,background:'rgba(22,163,74,0.12)',
        border:'1px solid rgba(22,163,74,0.25)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}},
        h(Icon,{n:'circleCheck',cls:'w-9 h-9',style:{color:'#16a34a'}})
      ),
      h('h2',{className:'text-2xl font-black text-white mb-2'},'Drill Complete!'),
      h('p',{className:'text-slate-400 mb-3'},drill.title),
      h('div',{style:{display:'flex',gap:8,alignItems:'center',justifyContent:'center',marginBottom:8}},
        h(XPBadge,{xp:drill.xp_value}),
        tier !== 'none' && h(TierBadge,{tier})
      ),
      // Tier upgrade message
      tier==='gold' && h('p',{style:{fontSize:14,fontWeight:700,color:'#f59e0b',marginTop:4,marginBottom:4}},
        '🥇 Gold tier achieved! Mastery unlocked!'),
      tier==='silver' && h('p',{style:{fontSize:13,color:'#9ca3af',marginTop:4,marginBottom:4}},
        'Silver earned! 3 more above 80% for Gold 🥇'),
      tier==='bronze' && h('p',{style:{fontSize:13,color:'#b87840',marginTop:4,marginBottom:4}},
        'Bronze earned! Hit 80% of target for Silver 🥈'),
      h('div',{className:'mt-6 flex flex-col gap-3 w-full max-w-xs'},
        h('button',{onClick:()=>nav('Drills'),className:'btn-primary'},'More Drills'),
        h('button',{onClick:()=>{setDone(false);completing.current=false;},className:'btn-secondary'},'Do Again')
      )
    );
  }

  return h('div',{className:'pb-28'},
    h(PageHeader,{
      title:drill.title,
      subtitle:`${drill.duration_minutes} min · ${drill.xp_value} XP`,
      gradient:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`,
      onBack:()=>nav('Drills'),
    }),

    h('div',{className:'px-4 pt-5 space-y-4'},
      // Video embed
      drill.video_id && h('div',{},
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-2'},'Video Tutorial'),
        h('div',{style:{position:'relative',aspectRatio:'16/9',background:'#0f172a',borderRadius:'1rem',overflow:'hidden'}},
          h('iframe',{
            src:`https://www.youtube.com/embed/${drill.video_id}?modestbranding=1&rel=0&color=white`,
            title:`${drill.title} tutorial`,
            allow:'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
            allowFullScreen:true,loading:'lazy',
            style:{position:'absolute',inset:0,width:'100%',height:'100%',border:0}
          })
        ),
        h('a',{href:`https://www.youtube.com/watch?v=${drill.video_id}`,target:'_blank',rel:'noopener noreferrer',
          className:'flex items-center gap-1 text-xs mt-2',style:{color:'#64748b'}},
          h(Icon,{n:'extLink',cls:'w-3.5 h-3.5'}),'Open in YouTube'
        )
      ),

      // Description
      h('div',{className:'p-4 rounded-2xl',style:{background:'rgba(30,41,59,0.6)',border:'1px solid rgba(51,65,85,0.5)'}},
        h('p',{className:'text-sm text-slate-300 leading-relaxed'},drill.description)
      ),

      // Steps
      h('div',{},
        h('p',{className:'text-xs font-bold text-slate-500 uppercase tracking-wider mb-3'},`${drill.steps.length} Steps`),
        h('div',{className:'space-y-2'},
          drill.steps.map((s,i)=>
            h('div',{key:i,className:'flex items-start gap-3 p-3 rounded-xl',
              style:{background:'rgba(15,23,42,0.5)',border:'1px solid rgba(51,65,85,0.4)'}},
              h('div',{className:'w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5',
                style:{background:`linear-gradient(135deg,${catDef?.from||'#1d4ed8'},${catDef?.to||'#4338ca'})`}},i+1),
              h('p',{className:'text-sm text-slate-300 leading-relaxed flex-1'},s)
            )
          )
        )
      ),

      // Coach tip
      drill.tips && h('div',{className:'flex items-start gap-3 p-4 rounded-2xl',
        style:{background:'rgba(16,185,129,0.07)',border:'1px solid rgba(16,185,129,0.22)'}},
        h(Icon,{n:'sparkles',cls:'w-4 h-4 flex-shrink-0',style:{color:'#16a34a'}}),
        h('div',{},
          h('p',{className:'text-xs font-black text-emerald-400 uppercase tracking-wider mb-1'},'Coach Tip'),
          h('p',{className:'text-sm',style:{color:'#6ee7b7'}},drill.tips)
        )
      ),

      // Target metric
      drill.target_metric && h('div',{className:'flex items-start gap-3 p-4 rounded-2xl',
        style:{background:'rgba(59,130,246,0.07)',border:'1px solid rgba(59,130,246,0.22)'}},
        h(Icon,{n:'target',cls:'w-4 h-4 flex-shrink-0',style:{color:'#484f58'}}),
        h('div',{},
          h('p',{className:'text-xs font-black text-blue-400 uppercase tracking-wider mb-1'},'Success Target'),
          h('p',{className:'text-sm text-blue-300'},drill.target_metric)
        )
      ),

      // D-B: Tier progress card
      h(TierProgressCard,{drill}),

      // Add to schedule
      h('button',{
        onClick:()=>{
          const today=new Date().toISOString().slice(0,10);
          DB.addSession({id:'sch_'+Date.now(),date:today,time:'',type:'drill',
            title:drill.title,ref_id:drill.id,duration_minutes:drill.duration_minutes,
            xp_value:drill.xp_value,status:'pending',notes:'',color:SCHED_TYPES.drill.color});
          window.dispatchEvent(new CustomEvent('sc_update'));
          alert('Added to today\'s schedule! ✅');
        },
        className:'w-full py-3 rounded-2xl text-sm font-bold text-blue-400 text-center',
        style:{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.25)'}
      },'📅 Add to Today\'s Schedule'),

      // D-A: Complete button → opens tracker sheet
      h('button',{
        onClick:openTracker,
        className:'btn-primary w-full py-4 text-base font-black',
      },
        h(Icon,{n:'circleCheck',cls:'w-5 h-5'}),
        ` Mark Complete (+${drill.xp_value} XP)`
      )
    ),

    // D-A: Target tracker bottom sheet (rendered last, overlays everything)
    showSheet && h(TargetTrackerSheet,{
      drill,
      onSubmit: handleTrackerSubmit,
      onSkip:   handleTrackerSkip,
    })
  );
}

Object.assign(window.SC_APP, {
  DrillsPage, DrillDetailPage,
  TargetTrackerSheet, TierProgressCard, TierBadge,
  inferDrillTarget, TIER_CONFIG,
});
console.log('[SC] app-drills ready (D-A target tracker + D-B tier system)');
})();
