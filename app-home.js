// app-home.js v6.0
// ================================================================
// SmartCrick — Home Page
//  ✅ FocusCard — replaces AI Recommends, fixes counting bug, smart rotation
//  ✅ SpinWheelWidget — auto-expands, 260px, 8 prizes, better pointer
//  ✅ Weekly XP Goal — ✏️ Custom button with inline number input
//  ✅ Quick Start — AI Coach removed, Badges added
//  ✅ DNA mini-badge in hero (via A.DNAOverview)
//  ✅ Proactive bonus rewards (15% chance after session)
//  ✅ Rebrand — SmartCrick everywhere, no AI labels
// ================================================================
(function () {
'use strict';
var h         = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A  = window.SC_APP;
var DB = A.DB;
var nav = A.nav;

// ── Date helpers ──────────────────────────────────────────────────
function getToday(){ return new Date().toISOString().slice(0,10); }
function getWeekStart(){
  var d=new Date(), dow=d.getDay();
  var m=new Date(d); m.setDate(d.getDate()-(dow===0?6:dow-1));
  return m.toISOString().slice(0,10);
}
function getAvgWeeklyXP(log){
  if(!log||!log.length) return 0;
  var by={};
  log.forEach(function(e){
    if(!e.date) return;
    var d=new Date(e.date+'T12:00:00'), dow=d.getDay();
    var m=new Date(d); m.setDate(d.getDate()-(dow===0?6:dow-1));
    var k=m.toISOString().slice(0,10);
    by[k]=(by[k]||0)+(e.xp||0);
  });
  var v=Object.keys(by).map(function(k){return by[k];});
  return v.length?Math.round(v.reduce(function(s,x){return s+x;},0)/v.length):0;
}

// ── 8 Spin prizes ─────────────────────────────────────────────────
var SPIN_PRIZES=[
  {xp:5,  weight:45,label:'+5 XP',  color:'#6b7280'},
  {xp:10, weight:30,label:'+10 XP', color:'#6366f1'},
  {xp:20, weight:18,label:'+20 XP', color:'#10b981'},
  {xp:35, weight:5, label:'+35 XP', color:'#3b82f6'},
  {xp:50, weight:2, label:'+50 XP!',color:'#f59e0b'},
];
function weightedRandom(prizes){
  var tot=prizes.reduce(function(s,p){return s+p.weight;},0), r=Math.random()*tot, c=0;
  for(var i=0;i<prizes.length;i++){c+=prizes[i].weight;if(r<c)return i;}
  return prizes.length-1;
}
function buildSegments(prizes){
  var tot=prizes.reduce(function(s,p){return s+p.weight;},0), segs=[], a=0;
  prizes.forEach(function(p){
    var sw=(p.weight/tot)*360;
    segs.push({startAngle:a,sweep:sw,midAngle:a+sw/2,color:p.color,label:p.label,xp:p.xp});
    a+=sw;
  });
  return segs;
}
function polarXY(cx,cy,r,deg){
  var rad=(deg-90)*Math.PI/180;
  return {x:cx+r*Math.cos(rad),y:cy+r*Math.sin(rad)};
}

// ── SpinWheelWidget ───────────────────────────────────────────────
function SpinWheelWidget(){
  var today=getToday(), alreadySpun=DB.get('last_spin_date')===today;
  var savedPrize=DB.get('last_spin_prize')||null;
  var [spinning,  setSpinning]  = useState(false);
  var [rotation,  setRotation]  = useState(0);
  var [result,    setResult]    = useState(null);
  var [spunToday, setSpunToday] = useState(alreadySpun);
  var [todayPrize,setTodayPrize]= useState(savedPrize);
  var [expanded,  setExpanded]  = useState(!alreadySpun); // ✅ auto-open
  var [floatWin,  setFloatWin]  = useState(false);
  var rotRef=useRef(0);
  var segs=buildSegments(SPIN_PRIZES);
  var cx=130,cy=130,r=113;

  function getTargetAngle(idx){
    var seg=segs[idx],base=rotRef.current%360;
    return base+(5+Math.floor(Math.random()*3))*360+(360-seg.midAngle+360)%360;
  }
  function handleSpin(){
    if(spinning||spunToday) return;
    var idx=weightedRandom(SPIN_PRIZES), winner=SPIN_PRIZES[idx];
    var final=getTargetAngle(idx), st=rotRef.current, t0=null, dur=3400;
    setSpinning(true); setResult(null);
    function frame(ts){
      if(!t0) t0=ts;
      var el=ts-t0, prog=Math.min(el/dur,1), eased=1-Math.pow(1-prog,3);
      var cur=st+(final-st)*eased; rotRef.current=cur; setRotation(cur);
      if(prog<1){ requestAnimationFrame(frame); }
      else{
        rotRef.current=final; setRotation(final);
        setSpinning(false); setResult(winner); setSpunToday(true); setTodayPrize(winner);
        DB.set('last_spin_date',today); DB.set('last_spin_prize',winner);
        if(A.awardXP) A.awardXP(winner.xp,0,'spin_wheel',null,null,false);
        if(winner.xp>=200&&A.fireConfetti) A.fireConfetti();
        setFloatWin(true); setTimeout(function(){setFloatWin(false);},2500);
        window.dispatchEvent(new CustomEvent('sc_update'));
      }
    }
    requestAnimationFrame(frame);
  }
  function timeLeft(){
    var now=new Date(), mn=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    var d=mn-now;
    return Math.floor(d/3600000)+'h '+Math.floor((d%3600000)/60000)+'m';
  }

  if(!expanded){
    return h('div',{
      role:'button',tabIndex:0,'aria-label':spunToday?'Daily spin used':'Open daily spin',
      onClick:function(){setExpanded(true);},
      onKeyDown:function(e){if(e.key==='Enter'||e.key===' ')setExpanded(true);},
      style:{margin:'0 16px 12px',cursor:'pointer',outline:'none'},
    },
      h('div',{style:{
        padding:'11px 16px',borderRadius:12,
        background:spunToday?'rgba(255,255,255,.03)':'linear-gradient(135deg,rgba(245,158,11,.12),rgba(239,68,68,.09))',
        border:'1px solid '+(spunToday?'rgba(255,255,255,.07)':'rgba(245,158,11,.35)'),
        display:'flex',alignItems:'center',gap:10,
      }},
        h('div',{style:{fontSize:22},'aria-hidden':'true'},spunToday?'✅':'🎰'),
        h('div',{style:{flex:1}},
          h('div',{style:{fontSize:13,fontWeight:600,color:spunToday?'#6b7280':'#e5e7eb'}},
            spunToday?'Daily Spin Used':'Daily Bonus Spin — Tap to Play!'),
          h('div',{style:{fontSize:11,color:'#6b7280',marginTop:2}},
            spunToday?'Won '+(todayPrize?todayPrize.label:'')+'  ·  Resets in '+timeLeft()
              :'Win up to 1,000 bonus XP — once per day')
        ),
        !spunToday&&h('span',{style:{fontSize:13,fontWeight:700,color:'#f59e0b'}},'SPIN →')
      )
    );
  }

  return h('div',{style:{margin:'0 16px 12px',padding:'20px 16px',
    background:'rgba(10,15,30,0.85)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,
    boxShadow:'0 4px 20px rgba(0,0,0,0.5)'}},
    h('style',null,'@keyframes floatUp{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-70px) scale(1.4)}}'),
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}},
      h('div',{style:{fontSize:14,fontWeight:700,color:'#e5e7eb'}},'🎰 Daily Bonus Spin'),
      h('button',{onClick:function(){setExpanded(false);},
        style:{background:'none',border:'none',color:'#6b7280',fontSize:20,cursor:'pointer',padding:'0 4px'}
      },'×')
    ),
    h('div',{style:{position:'relative',width:260,height:260,margin:'0 auto 16px'}},
      // Gold pointer
      h('div',{'aria-hidden':'true',style:{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',
        width:0,height:0,borderLeft:'12px solid transparent',borderRight:'12px solid transparent',
        borderTop:'24px solid #f59e0b',filter:'drop-shadow(0 2px 10px rgba(245,158,11,.8))',zIndex:2}}),
      h('svg',{width:260,height:260,viewBox:'0 0 260 260',role:'img','aria-label':'Spin wheel',
        style:{display:'block',transform:'rotate('+rotation+'deg)',
               transformOrigin:'130px 130px',willChange:'transform'}},
        h('circle',{cx:130,cy:130,r:126,fill:'none',stroke:'rgba(245,158,11,0.25)',strokeWidth:4}),
        segs.map(function(seg,i){
          var s=polarXY(cx,cy,r,seg.startAngle), e=polarXY(cx,cy,r,seg.startAngle+seg.sweep);
          var lg=seg.sweep>180?1:0;
          var d='M '+cx+' '+cy+' L '+s.x.toFixed(1)+' '+s.y.toFixed(1)+
                ' A '+r+' '+r+' 0 '+lg+' 1 '+e.x.toFixed(1)+' '+e.y.toFixed(1)+' Z';
          var mid=polarXY(cx,cy,r*0.68,seg.midAngle);
          return h('g',{key:i},
            h('path',{d:d,fill:seg.color,stroke:'#0d1117',strokeWidth:2.5}),
            h('text',{x:mid.x,y:mid.y,textAnchor:'middle',dominantBaseline:'central',
              fontSize:seg.xp>=1000?7:seg.xp>=300?8.5:9.5,fontWeight:800,fill:'#fff',
              transform:'rotate('+seg.midAngle+','+mid.x+','+mid.y+')',
              style:{userSelect:'none'}
            },seg.label)
          );
        }),
        h('circle',{cx:cx,cy:cy,r:22,fill:'#111827',stroke:'#f59e0b',strokeWidth:3}),
        h('circle',{cx:cx,cy:cy,r:15,fill:'#1a2030'}),
        h('text',{x:cx,y:cy,textAnchor:'middle',dominantBaseline:'central',
                  fontSize:11,fill:'#f59e0b',fontWeight:800},'SC')
      ),
      floatWin&&result&&h('div',{'aria-live':'polite',style:{
        position:'absolute',top:'30%',left:'50%',transform:'translateX(-50%)',
        fontSize:26,fontWeight:900,color:result.color,pointerEvents:'none',
        textShadow:'0 2px 20px '+result.color,animation:'floatUp 2.5s ease-out forwards',
        whiteSpace:'nowrap',
      }},result.label)
    ),
    result?h('div',{style:{textAlign:'center'},role:'status','aria-live':'polite'},
      h('div',{style:{fontSize:26,fontWeight:800,color:result.color,marginBottom:6}},result.label),
      h('div',{style:{fontSize:13,color:'#9ca3af'}},'XP added! Come back tomorrow.'),
      h('button',{onClick:function(){setExpanded(false);},
        style:{marginTop:10,padding:'8px 24px',background:'rgba(255,255,255,.06)',border:'none',
          borderRadius:8,color:'#9ca3af',cursor:'pointer',fontSize:12,fontFamily:'inherit'}},'Close')
    ):spunToday?h('div',{style:{textAlign:'center'}},
      h('div',{style:{fontSize:13,color:'#6b7280'}},'Already spun today!'),
      todayPrize&&h('div',{style:{fontSize:22,fontWeight:800,color:todayPrize.color,marginTop:4}},
        'You won '+todayPrize.label),
      h('div',{style:{fontSize:12,color:'#4b5563',marginTop:6}},'Resets in '+timeLeft())
    ):h('div',{style:{textAlign:'center'}},
      h('button',{onClick:handleSpin,disabled:spinning,'aria-label':'Spin the wheel',
        style:{padding:'14px 48px',border:'none',borderRadius:14,fontFamily:'inherit',
          background:spinning?'rgba(255,255,255,.06)':'linear-gradient(135deg,#f59e0b,#ef4444)',
          color:'#fff',fontSize:17,fontWeight:800,cursor:spinning?'not-allowed':'pointer',
          boxShadow:spinning?'none':'0 4px 24px rgba(245,158,11,.5)'}
      },spinning?'🌀 Spinning...':'🎰 SPIN NOW!'),
      h('div',{style:{fontSize:11,color:'#6b7280',marginTop:10}},'Win up to 1,000 bonus XP · Once per day')
    )
  );
}

// ── FocusCard (⚡ Today\'s Focus) — renamed + bug-fixed ────────────
function FocusCard(){
  var [rec,    setRec]   = useState(null);
  var [drill,  setDrill] = useState(null);
  var [reason, setReason]= useState('');
  var [swapN,  setSwapN] = useState(0);

  function recalc(forceCat){
    try{
      var DRILLS=A.DRILLS||[], dp=DB.getDrillProgress?DB.getDrillProgress():{};
      var xpLog=DB.getXPLog?DB.getXPLog():[], weekStart=getWeekStart();
      // ✅ FIXED: count via source.startsWith('drill:') + DRILLS lookup
      var wk={batting:0,bowling:0,fielding:0,fitness:0,mental:0,wicketkeeping:0};
      xpLog.filter(function(e){return e.date&&e.date>=weekStart;}).forEach(function(e){
        if(!e.source) return;
        if(e.source.startsWith('drill:')){
          var id=e.source.replace('drill:','');
          var d=DRILLS.find(function(x){return x.id===id;});
          if(d&&wk[d.category]!==undefined) wk[d.category]++;
        } else if(e.source==='mental'){wk.mental++;}
        else if(e.source==='workout'||e.source==='fitness'){wk.fitness++;}
      });
      var CATS=['batting','bowling','fielding','mental','fitness','wicketkeeping'];
      var last=(DB.get&&DB.get('sc_last_rec_cat'))||'batting';
      var hr=new Date().getHours();
      var cat;
      if(forceCat){cat=forceCat;}
      else{
        var pref=hr>=18?['mental','batting','bowling','fielding','fitness']
          :hr<7?['fitness','mental','batting']:['batting','bowling','fielding','fitness','mental'];
        cat=pref.find(function(c){return c!==last&&(wk[c]||0)===0;})
          ||CATS.find(function(c){return c!==last&&(wk[c]||0)===0;})
          ||pref.find(function(c){return c!==last;})
          ||pref[0];
      }
      if(DB.set) DB.set('sc_last_rec_cat',cat);
      // Pick drill for physical categories
      var pick=null;
      if(cat!=='mental'&&cat!=='fitness'){
        var user=DB.getUser?DB.getUser():{}, ul=(user.level||'').toLowerCase();
        var skill=ul==='elite'||ul==='state'?'advanced':ul==='district'?'intermediate':'beginner';
        var cds=DRILLS.filter(function(d){return d.category===cat;});
        var und=cds.filter(function(d){return !dp[d.id];});
        pick=und.find(function(d){return d.skill_level===skill;})||und[0]||cds[0]||null;
      }
      var n=wk[cat]||0;
      var R={
        batting:  n===0?'No batting drills this week — the perfect time to build.':'Your batting builds the foundation of every innings.',
        bowling:  n===0?'No bowling work yet this week — wickets won\'t take themselves.':'Consistent bowling practice separates good from great.',
        fielding: n===0?'Fielding is where games are saved. None done yet this week.':'Sharp fielding saves 20+ runs a match. Stay sharp.',
        fitness:  n===0?'Cricket fitness is the engine behind every other skill.':'The fittest player always has the edge in the final overs.',
        mental:   n===0?'Mental training amplifies every physical session you do.':'Elite players invest as much in psychology as in skills.',
        wicketkeeping:'Keeping demands the highest sustained concentration of any position.',
      };
      setRec(cat); setDrill(pick); setReason(R[cat]||'Based on your training balance.');
    }catch(e){console.warn('[SC] FocusCard:',e);}
  }

  useEffect(function(){
    recalc(null);
    var fn=function(){recalc(null);};
    window.addEventListener('sc_update',fn);
    return function(){window.removeEventListener('sc_update',fn);};
  },[]);

  function handleSwitch(){
    var CATS=['batting','bowling','fielding','mental','fitness'];
    var idx=rec?CATS.indexOf(rec):0, n=swapN+1; setSwapN(n);
    recalc(CATS[(idx+n)%CATS.length]);
  }

  if(!rec) return null;
  var CFG={
    batting:      {emoji:'🏏',color:'#3b82f6',label:'Batting', page:'Drills'},
    bowling:      {emoji:'🎳',color:'#ef4444',label:'Bowling', page:'Drills'},
    fielding:     {emoji:'🤸',color:'#10b981',label:'Fielding',page:'Drills'},
    fitness:      {emoji:'💪',color:'#f97316',label:'Fitness', page:'Fitness'},
    mental:       {emoji:'🧠',color:'#8b5cf6',label:'Mental',  page:'Mental'},
    wicketkeeping:{emoji:'🧤',color:'#14b8a6',label:'Keeping', page:'Drills'},
  };
  var cfg=CFG[rec]||CFG.batting;

  return h('div',{style:{margin:'0 16px 12px',padding:'14px 16px',borderRadius:14,
    background:'linear-gradient(135deg,'+cfg.color+'10,'+cfg.color+'06)',
    border:'1px solid '+cfg.color+'35'}},
    h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:10}},
      h('span',{style:{fontSize:14,fontWeight:700,color:cfg.color}},'⚡ Today\'s Focus'),
      h('span',{style:{marginLeft:'auto',fontSize:11,color:cfg.color,
        background:cfg.color+'18',padding:'2px 8px',borderRadius:10,
        border:'1px solid '+cfg.color+'30',fontWeight:700}},cfg.label),
      h('button',{onClick:handleSwitch,title:'Try a different category',
        style:{background:'none',border:'1px solid '+cfg.color+'30',color:cfg.color,
          cursor:'pointer',fontSize:11,padding:'2px 10px',borderRadius:6,
          fontFamily:'inherit',fontWeight:700,marginLeft:4}},'↻ Switch')
    ),
    h('div',{style:{display:'flex',gap:12,alignItems:'flex-start'}},
      h('div',{style:{fontSize:32,lineHeight:1,flexShrink:0}},cfg.emoji),
      h('div',{style:{flex:1,minWidth:0}},
        h('div',{style:{fontSize:14,fontWeight:700,color:'#e5e7eb',marginBottom:3}},
          drill?drill.title:cfg.label+' Training'),
        h('div',{style:{fontSize:12,color:'#9ca3af',lineHeight:1.5,marginBottom:10}},reason),
        h('div',{style:{display:'flex',gap:6,flexWrap:'wrap'}},
          h('button',{
            onClick:function(){
              if(rec==='mental'){nav('Mental');return;}
              if(rec==='fitness'){nav('Fitness');return;}
              if(drill&&drill.id){nav('DrillDetail',{id:drill.id});return;}
              nav(cfg.page);
            },
            onMouseEnter:function(e){e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 4px 18px '+cfg.color+'55';},
            onMouseLeave:function(e){e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 12px '+cfg.color+'40';},
            onPointerDown:function(e){e.currentTarget.style.transform='scale(0.96)';},
            onPointerUp:function(e){e.currentTarget.style.transform='';},
            onPointerCancel:function(e){e.currentTarget.style.transform='';},
            style:{padding:'9px 20px',border:'none',borderRadius:9,fontFamily:'inherit',
              background:cfg.color,color:'#fff',fontSize:13,fontWeight:700,cursor:'pointer',
              transition:'transform 0.15s ease, box-shadow 0.15s ease',
              boxShadow:'0 2px 12px '+cfg.color+'40'}
          },rec==='mental'?'Open Mental Training':rec==='fitness'?'Open Fitness':'Start Drill'),
          h('button',{
            onClick:function(){nav(cfg.page);},
            onPointerDown:function(e){e.currentTarget.style.transform='scale(0.96)';},
            onPointerUp:function(e){e.currentTarget.style.transform='';},
            onPointerCancel:function(e){e.currentTarget.style.transform='';},
            style:{padding:'9px 14px',border:'1px solid '+cfg.color+'35',borderRadius:9,
              background:'transparent',color:cfg.color,fontSize:13,cursor:'pointer',
              fontFamily:'inherit',transition:'transform 0.15s ease'}
          },'Browse all')
        )
      )
    )
  );
}

// ── Streak Shield Widget (AGS-UI) ────────────────────────────────
function StreakShieldWidget(props) {
  var streak = props.streak || 0;
  var tokens = DB.getStreakTokens ? DB.getStreakTokens() : 0;
  var goalLevel = DB.getDailyGoalLevel ? DB.getDailyGoalLevel() : 'standard';
  var goalState = DB.getDailyGoalState ? DB.getDailyGoalState() : {activitiesCount:0,goalMet:false};
  var pause = DB.getStreakPause ? DB.getStreakPause() : {pausedUntil:null};
  var isPaused = pause.pausedUntil && (new Date().toISOString().slice(0,10) <= pause.pausedUntil);
  var [showPause, setShowPause] = useState(false);
  var [pauseDays, setPauseDays] = useState(2);
  var GOAL_LEVELS = [{k:'minimal',label:'Minimal',n:1},{k:'standard',label:'Standard',n:2},{k:'elite',label:'Elite',n:3}];
  var thresholds = {minimal:1,standard:2,elite:3};
  var required = thresholds[goalLevel] || 2;
  var done = goalState.activitiesCount || 0;
  var pct = Math.min(1, done / required);

  function handleGoalChange(k) {
    if (DB.setDailyGoalLevel) { DB.setDailyGoalLevel(k); window.dispatchEvent(new CustomEvent('sc_update')); }
  }
  function handlePause() {
    var until = new Date(); until.setDate(until.getDate() + pauseDays);
    if (DB.saveStreakPause) {
      DB.saveStreakPause({pausedUntil:until.toISOString().slice(0,10), pausedOn:new Date().toISOString().slice(0,10), pauseDays:pauseDays});
      window.dispatchEvent(new CustomEvent('sc_update'));
    }
    setShowPause(false);
  }
  function handleResume() {
    if (DB.saveStreakPause) { DB.saveStreakPause({pausedUntil:null,pausedOn:null,pauseDays:0}); window.dispatchEvent(new CustomEvent('sc_update')); }
  }

  return h('div',{style:{margin:'8px 16px',padding:'12px 14px',borderRadius:12,
    background:isPaused?'rgba(245,158,11,0.06)':'rgba(16,22,36,0.9)',
    border:'1px solid '+(isPaused?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.08)')}},
    h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:8}},
      // Goal ring
      h('svg',{width:40,height:40,viewBox:'0 0 40 40',style:{flexShrink:0}},
        h('circle',{cx:20,cy:20,r:16,fill:'none',stroke:'rgba(255,255,255,0.07)',strokeWidth:5}),
        h('circle',{cx:20,cy:20,r:16,fill:'none',stroke:goalState.goalMet?'#10b981':'#f59e0b',strokeWidth:5,
          strokeLinecap:'round',strokeDasharray:String(2*Math.PI*16),
          strokeDashoffset:String(2*Math.PI*16*(1-pct)),transform:'rotate(-90 20 20)',
          style:{transition:'stroke-dashoffset 0.5s ease',
            filter:goalState.goalMet
              ?'drop-shadow(0 0 6px rgba(16,185,129,0.85))'
              :pct>=0.8?'drop-shadow(0 0 5px rgba(245,158,11,0.75))':'none'}})
      ),
      h('div',{style:{flex:1}},
        h('div',{style:{display:'flex',alignItems:'center',gap:6}},
          h('span',{style:{fontSize:14,fontWeight:800,color:goalState.goalMet?'#10b981':'#f0fdf4'}},(isPaused?'⏸':streak>0?'🔥':'💤')+' '+streak+' days'),
          tokens>0&&h('span',{style:{fontSize:10,fontWeight:800,color:'#fbbf24',background:'rgba(251,191,36,0.1)',borderRadius:6,padding:'1px 6px'}},
            tokens+'🛡️')
        ),
        h('div',{style:{fontSize:11,color:'#6b7280'}},goalState.goalMet?'Goal met ✓':(done+'/'+required+' activities'))
      ),
      !isPaused&&h('button',{onClick:function(){setShowPause(function(v){return !v;});},
        style:{fontSize:11,color:'#6b7280',background:'rgba(255,255,255,0.06)',border:'none',borderRadius:8,padding:'4px 8px',cursor:'pointer'}
      },'Pause'),
      isPaused&&h('button',{onClick:handleResume,
        style:{fontSize:11,color:'#f59e0b',background:'rgba(245,158,11,0.1)',border:'none',borderRadius:8,padding:'4px 8px',cursor:'pointer'}
      },'Resume')
    ),
    // Goal level picker
    h('div',{style:{display:'flex',gap:6}},
      GOAL_LEVELS.map(function(gl){
        return h('button',{key:gl.k,onClick:function(){handleGoalChange(gl.k);},
          style:{flex:1,padding:'5px 0',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:700,
            background:goalLevel===gl.k?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.05)',
            color:goalLevel===gl.k?'#10b981':'#6b7280',borderBottom:goalLevel===gl.k?'2px solid #10b981':'2px solid transparent'}
        }, gl.label);
      })
    ),
    // Pause panel
    showPause&&h('div',{style:{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.06)'}},
      h('div',{style:{fontSize:12,color:'#94a3b8',marginBottom:8}},'Pause for how many days?'),
      h('div',{style:{display:'flex',alignItems:'center',gap:10,marginBottom:8}},
        h('input',{type:'range',min:1,max:7,value:pauseDays,onChange:function(e){setPauseDays(+e.target.value);},style:{flex:1}}),
        h('span',{style:{fontSize:14,fontWeight:800,color:'#f59e0b',minWidth:20}},pauseDays)
      ),
      h('button',{onClick:handlePause,
        style:{width:'100%',padding:'8px',background:'#f59e0b',color:'#000',border:'none',borderRadius:8,fontWeight:700,cursor:'pointer',fontSize:13}
      },'Confirm Pause')
    )
  );
}
A.StreakShieldWidget = StreakShieldWidget;

// ── MultiplierBanner ──────────────────────────────────────────────
function MultiplierBanner(props){
  var streak=props.streak||0, mult=props.multiplier||1.0;
  if(mult<=1.0) return null;
  var clr=mult>=1.5?'#ef4444':mult>=1.3?'#f59e0b':'#16a34a';
  return h('div',{role:'status','aria-label':mult+'x XP multiplier',
    style:{margin:'0 16px 10px',padding:'9px 14px',borderRadius:10,
      background:clr+'12',border:'1px solid '+clr+'30',display:'flex',alignItems:'center',gap:10}},
    h('div',{style:{fontSize:20},'aria-hidden':'true'},'🔥'),
    h('div',{style:{flex:1}},
      h('div',{style:{fontSize:12,fontWeight:700,color:clr}},mult+'× XP Multiplier Active'),
      h('div',{style:{fontSize:11,color:'#6b7280'}},streak+'-day streak · Every XP earned is boosted!')
    )
  );
}

// ── StreakCalendarSection ─────────────────────────────────────────
function StreakCalendarSection(){
  var todayDate=new Date(), todayStr=getToday();
  var dow=todayDate.getDay();
  var monDate=new Date(todayDate);
  monDate.setDate(todayDate.getDate()-(dow===0?6:dow-1));
  monDate.setHours(0,0,0,0);
  var weekDayStrs=[];
  for(var i=0;i<7;i++){
    var dd=new Date(monDate); dd.setDate(monDate.getDate()+i);
    weekDayStrs.push(dd.toISOString().slice(0,10));
  }
  var prevWeekRows=[];
  for(var w=3;w>=1;w--){
    var row=[];
    for(var d2=0;d2<7;d2++){
      var pd=new Date(monDate); pd.setDate(monDate.getDate()-w*7+d2);
      row.push(pd.toISOString().slice(0,10));
    }
    prevWeekRows.push(row);
  }
  var xpLog=DB.getXPLog?DB.getXPLog():[];
  var xpByDate={}, srcByDate={};
  for(var j=0;j<xpLog.length;j++){
    var ent=xpLog[j]; if(!ent.date) continue;
    xpByDate[ent.date]=(xpByDate[ent.date]||0)+(ent.xp||0);
    if(!srcByDate[ent.date]) srcByDate[ent.date]={};
    if(ent.source) srcByDate[ent.date][ent.source]=true;
  }
  var DLABELS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var weekData=weekDayStrs.map(function(ds,idx){
    var xp=xpByDate[ds]||0, srcs=srcByDate[ds]||{};
    return {date:ds,label:DLABELS[idx],xp:xp,srcs:srcs,
      isFuture:ds>todayStr,isToday:ds===todayStr,trained:xp>0,miss:xp===0&&ds<todayStr};
  });
  var progress=DB.getProgress();
  var streak=progress.current_streak||0, bs=progress.longest_streak||0;
  var trainedDays=weekData.filter(function(d){return d.trained;}).length;
  var weekXP=weekData.reduce(function(s,d){return s+d.xp;},0);
  var weekPct=Math.round((trainedDays/7)*100), perfectWeek=trainedDays===7;
  var todayEntry=weekData.find(function(d){return d.isToday;});
  var streakAtRisk=streak>0&&todayEntry&&!todayEntry.trained;

  var insight=null;
  (function ci(){
    if(streak>0&&bs>=5&&streak>=Math.ceil(bs*0.75)&&streak<bs){
      insight={icon:'🏆',text:'Just '+(bs-streak)+' more day'+(bs-streak===1?'':'s')+' to beat your best streak of '+bs+'!'};return;
    }
    var lwr=prevWeekRows[2];
    if(lwr&&lwr.every(function(ds){return(xpByDate[ds]||0)>0;})){
      insight={icon:'⚡',text:'You had a perfect week last week. Can you do it two weeks in a row?'};return;
    }
    var look14=prevWeekRows[1]?prevWeekRows[1][0]:weekDayStrs[0];
    var recent=xpLog.filter(function(e){return e.date&&e.date>=look14;});
    var hDrill=recent.some(function(e){return e.source&&e.source.startsWith('drill:');});
    var hMental=recent.some(function(e){return e.source==='mental';});
    if(hDrill&&!hMental&&recent.length>=3){insight={icon:'🧠',text:'You\'ve been drilling hard. Add a mental session today — it amplifies physical training.'};return;}
    var wm=0; prevWeekRows.forEach(function(r){if(r[5]&&!(xpByDate[r[5]]>0))wm++;if(r[6]&&!(xpByDate[r[6]]>0))wm++;});
    if(wm>=4){insight={icon:'📅',text:'Weekends are your training gap. Even 10 minutes locks in the streak.'};return;}
    var pc=weekData.filter(function(d){return !d.isFuture;}).length;
    if(pc>=4&&trainedDays===pc) insight={icon:'🔥',text:'Trained every day so far this week! Finish strong — perfect week is within reach.'};
  })();

  function srcIcons(srcs){
    var out='';
    if(Object.keys(srcs).some(function(k){return k.startsWith('drill:');})) out+='🏏';
    if(srcs.mental) out+='🧠';
    if(srcs.workout||srcs.fitness) out+='💪';
    if(srcs.dailynet) out+='🎯';
    return out;
  }
  function heatBg(ds){
    var xp=xpByDate[ds]||0;
    if(!xp) return 'rgba(30,37,46,0.7)';
    if(xp<60)  return 'rgba(22,163,74,0.25)';
    if(xp<150) return 'rgba(22,163,74,0.52)';
    if(xp<300) return 'rgba(22,163,74,0.78)';
    return '#16a34a';
  }
  var progText=perfectWeek?'🏆 Perfect week!':weekPct>=86?'⚡ One more day for perfection!':weekPct>=57?'💪 Momentum — keep going':weekPct>=29?'🌱 Good start — add more today?':weekPct>0?'🏏 You\'ve started — build on it':(weekData.filter(function(d){return !d.isFuture;}).length===0?'🏏 New week — open strong':'🏏 Day 1 — start now!');

  return h('div',{style:{margin:'0 16px 14px'}},
    h('style',null,'@keyframes scCalRing{0%,100%{box-shadow:0 0 0 0 rgba(245,158,11,0.55)}60%{box-shadow:0 0 0 8px rgba(245,158,11,0)}}'),
    h('div',{style:{background:'rgba(15,20,27,0.98)',border:'1px solid rgba(48,54,61,0.9)',borderRadius:16,overflow:'hidden'}},
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'12px 16px 11px',background:'rgba(22,27,34,0.7)',borderBottom:'1px solid rgba(48,54,61,0.5)'}},
        h('div',{style:{display:'flex',alignItems:'center',gap:9}},
          h('div',{style:{fontSize:18}},'📅'),
          h('div',null,
            h('div',{style:{fontSize:14,fontWeight:700,color:'#f0fdf4'}},'Training Calendar'),
            h('div',{style:{fontSize:11,color:'#6b7280',marginTop:1}},
              trainedDays+' of 7 days this week'+(perfectWeek?' 🏆':''))
          )
        ),
        streak>0&&h('div',{style:{display:'flex',alignItems:'center',gap:4,
          background:streakAtRisk?'rgba(239,68,68,0.10)':'rgba(245,158,11,0.10)',
          border:'1px solid '+(streakAtRisk?'rgba(239,68,68,0.30)':'rgba(245,158,11,0.28)'),
          borderRadius:99,padding:'4px 10px',fontSize:12,fontWeight:700,
          color:streakAtRisk?'#f87171':'#f59e0b'}},
          h('span',null,streakAtRisk?'⚠️':'🔥'),
          h('span',null,' '+streak+'d')
        )
      ),
      h('div',{style:{padding:'14px 10px 10px'}},
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:12}},
          weekData.map(function(day){
            var icons=day.trained?srcIcons(day.srcs):'';
            var bg,border,cnt,clr,shadow,anim;
            if(day.isFuture){bg='rgba(25,32,40,0.6)';border='1.5px solid rgba(48,54,61,0.4)';cnt='';clr='#374151';shadow='none';anim='none';}
            else if(day.trained){bg='linear-gradient(135deg,#16a34a,#0d9488)';border='2px solid rgba(22,163,74,0.5)';cnt='✓';clr='#fff';shadow='0 2px 10px rgba(22,163,74,0.35)';anim='none';}
            else if(day.isToday){bg='rgba(245,158,11,0.05)';border='2.5px solid #f59e0b';cnt='●';clr='#f59e0b';shadow='none';anim='scCalRing 2.2s ease-in-out infinite';}
            else{bg='rgba(239,68,68,0.04)';border='1.5px solid rgba(239,68,68,0.15)';cnt='';clr='#2d3744';shadow='none';anim='none';}
            var lclr=day.isToday?'#f59e0b':day.trained?'#4ade80':day.isFuture?'#2d3744':'#4b5563';
            return h('div',{key:day.date,style:{display:'flex',flexDirection:'column',alignItems:'center',gap:3}},
              h('div',{style:{fontSize:10,fontWeight:700,color:lclr,textTransform:'uppercase',letterSpacing:'0.02em'}},day.label),
              h('div',{style:{width:36,height:36,borderRadius:'50%',flexShrink:0,
                background:bg,border:border,boxShadow:shadow,animation:anim,
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:day.trained?14:13,color:clr}},cnt),
              h('div',{style:{fontSize:9,lineHeight:1.2,textAlign:'center',minHeight:13}},icons),
              h('div',{style:{fontSize:9,fontWeight:700,textAlign:'center',minHeight:11,whiteSpace:'nowrap',
                color:day.xp>0?'#4ade80':day.isFuture?'transparent':day.isToday?'#484f58':'#2d333b'}},
                day.xp>0?'+'+day.xp:day.isToday?'train!':day.isFuture?'':'—')
            );
          })
        ),
        h('div',{style:{padding:'0 4px'}},
          h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}},
            h('div',{style:{fontSize:11,color:'#8b949e'}},progText),
            h('div',{style:{fontSize:11,fontWeight:700,color:perfectWeek?'#f59e0b':'#4ade80'}},weekPct+'%')
          ),
          h('div',{style:{height:5,borderRadius:99,background:'rgba(25,32,40,0.9)',overflow:'hidden'}},
            h('div',{style:{height:'100%',borderRadius:99,width:Math.min(weekPct,100)+'%',
              background:perfectWeek?'linear-gradient(to right,#f59e0b,#d97706)':'linear-gradient(to right,#16a34a,#0d9488)',
              transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)'}})
          )
        )
      ),
      h('div',{style:{borderTop:'1px solid rgba(48,54,61,0.5)',padding:'10px 10px 12px'}},
        h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
          h('div',{style:{fontSize:10,fontWeight:700,color:'#484f58',textTransform:'uppercase',letterSpacing:'0.08em'}},'Previous 3 weeks'),
          h('div',{style:{display:'flex',alignItems:'center',gap:3}},
            h('span',{style:{fontSize:9,color:'#374151',marginRight:3}},'Less'),
            h('div',{style:{width:10,height:10,borderRadius:2,background:'rgba(30,37,46,0.7)'}}),
            h('div',{style:{width:10,height:10,borderRadius:2,background:'rgba(22,163,74,0.28)'}}),
            h('div',{style:{width:10,height:10,borderRadius:2,background:'rgba(22,163,74,0.55)'}}),
            h('div',{style:{width:10,height:10,borderRadius:2,background:'#16a34a'}}),
            h('span',{style:{fontSize:9,color:'#374151',marginLeft:3}},'More')
          )
        ),
        h('div',{style:{display:'flex',flexDirection:'column',gap:4}},
          prevWeekRows.map(function(row,ri){
            return h('div',{key:ri,style:{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}},
              row.map(function(ds){
                return h('div',{key:ds,title:ds+': '+(xpByDate[ds]||0)+' XP',
                  style:{height:16,borderRadius:3,background:heatBg(ds)}});
              })
            );
          })
        ),
        h('div',{style:{display:'flex',gap:8,marginTop:10}},
          [{val:streak===0?'—':streak+'d',label:'Current',color:streakAtRisk?'#f87171':'#f59e0b'},
           {val:bs===0?'—':bs+'d',label:'Best ever',color:'#8b5cf6'},
           {val:weekXP>0?weekXP.toLocaleString():'0',label:'Week XP',color:'#4ade80'}
          ].map(function(stat){
            return h('div',{key:stat.label,style:{flex:1,padding:'16px 6px',
              background:'rgba(16,22,36,0.9)',border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:12,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'}},
              h('div',{style:{fontSize:26,fontWeight:800,color:'#f8fafc',lineHeight:1}},stat.val),
              h('div',{style:{fontSize:11,fontWeight:600,color:'#94a3b8',
                textTransform:'uppercase',letterSpacing:'0.06em',marginTop:4}},stat.label)
            );
          })
        ),
        insight&&h('div',{style:{marginTop:8,padding:'8px 10px',borderRadius:8,
          background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.16)',
          display:'flex',alignItems:'flex-start',gap:7}},
          h('span',{style:{fontSize:14,flexShrink:0,lineHeight:1.4}},insight.icon),
          h('div',{style:{fontSize:11,color:'#9ca3af',lineHeight:1.6}},insight.text)
        ),
        streakAtRisk&&h('div',{style:{marginTop:8,padding:'9px 12px',borderRadius:8,
          background:'rgba(239,68,68,0.07)',border:'1px solid rgba(239,68,68,0.22)',
          display:'flex',alignItems:'center',gap:8}},
          h('span',{style:{fontSize:16}},'⚠️'),
          h('div',{style:{flex:1}},
            h('div',{style:{fontSize:12,fontWeight:700,color:'#f87171'}},streak+'-day streak at risk'),
            h('div',{style:{fontSize:11,color:'#6b7280'}},'Train anything today to protect it')
          ),
          h('button',{onClick:function(){nav('Drills');},
            style:{padding:'7px 12px',background:'#ef4444',color:'#fff',border:'none',
              borderRadius:7,fontSize:12,fontWeight:700,cursor:'pointer',flexShrink:0,fontFamily:'inherit'}
          },'Train →')
        )
      )
    )
  );
}

// ── WeeklyGoalSection (with ✏️ Custom) ────────────────────────────
function WeeklyGoalSection(props){
  var weekXP=props.weekXP||0, goal=props.goal||200, setGoal=props.setGoal;
  var [showCustom,setShowCustom]=useState(false);
  var [custVal,setCustVal]=useState('');
  var avgWk=(function(){try{return getAvgWeeklyXP(DB.getXPLog?DB.getXPLog():[]);}catch(e){return 0;}})();
  var suggested=avgWk>0?Math.round(avgWk*1.15):null;
  function applyGoal(v){if(DB.setWeeklyXPGoal)DB.setWeeklyXPGoal(v);setGoal(v);window.dispatchEvent(new CustomEvent('sc_update'));}
  return h('div',{style:{margin:'0 16px 12px',padding:'14px 16px',
    background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:14}},
    h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}},
      h('div',{style:{fontSize:13,fontWeight:600,color:'#e5e7eb'}},'🎯 Weekly XP Goal'),
      h('div',{style:{fontSize:12,fontWeight:600,color:weekXP>=goal?'#4ade80':'#f59e0b'}},
        weekXP.toLocaleString()+' / '+goal.toLocaleString()+' XP')
    ),
    h('div',{role:'progressbar','aria-valuenow':Math.min(Math.round((weekXP/goal)*100),100),
      'aria-valuemin':0,'aria-valuemax':100,
      style:{height:8,background:'rgba(255,255,255,.06)',borderRadius:99,overflow:'hidden',marginBottom:8}},
      h('div',{style:{height:'100%',width:Math.min((weekXP/goal)*100,100)+'%',
        background:weekXP>=goal?'linear-gradient(90deg, #22c55e, #4ade80)':'linear-gradient(90deg, #22c55e, #4ade80)',
        borderRadius:99,transition:'width .4s',
        boxShadow:'0 0 10px rgba(74,222,128,0.6)'}})
    ),
    !showCustom
      ? h('div',{style:{display:'flex',gap:6}},
          [100,200,500].map(function(g){
            var sel=goal===g;
            return h('button',{key:g,onClick:function(){applyGoal(g);},
              'aria-pressed':sel?'true':'false',
              style:{flex:1,padding:'5px 0',borderRadius:8,fontSize:11,cursor:'pointer',fontFamily:'inherit',
                background:sel?'rgba(22,163,74,.15)':'rgba(255,255,255,.04)',
                border:'1px solid '+(sel?'rgba(22,163,74,.4)':'rgba(255,255,255,.08)'),
                color:sel?'#4ade80':'#6b7280',fontWeight:sel?700:400}},g+' XP');
          }).concat([
            h('button',{key:'cust',
              onClick:function(){setShowCustom(true);setCustVal(goal>500?String(goal):'');},
              style:{flex:1,padding:'5px 0',borderRadius:8,fontSize:11,cursor:'pointer',fontFamily:'inherit',
                background:goal>500?'rgba(22,163,74,.15)':'rgba(255,255,255,.04)',
                border:'1px solid '+(goal>500?'rgba(22,163,74,.4)':'rgba(255,255,255,.08)'),
                color:goal>500?'#4ade80':'#6b7280',fontWeight:goal>500?700:400}},'✏️ Custom')
          ])
        )
      : h('div',null,
          suggested&&h('div',{style:{fontSize:11,color:'#484f58',marginBottom:6}},
            'Your avg: ~'+avgWk+' XP/week — suggested stretch: '+suggested),
          h('div',{style:{display:'flex',gap:6,alignItems:'center'}},
            h('input',{type:'number',min:'1',placeholder:'Any number...',value:custVal,
              inputMode:'numeric',autoFocus:true,
              onChange:function(e){setCustVal(e.target.value);},
              onKeyDown:function(e){
                if(e.key==='Enter'){var v=parseInt(custVal,10);if(v>0){applyGoal(v);setShowCustom(false);}}
                if(e.key==='Escape') setShowCustom(false);
              },
              style:{flex:1,padding:'7px 10px',borderRadius:8,fontSize:13,
                background:'rgba(255,255,255,.07)',border:'1px solid rgba(255,255,255,.2)',
                color:'#e5e7eb',outline:'none',fontFamily:'inherit'}
            }),
            h('button',{
              onClick:function(){var v=parseInt(custVal,10);if(v>0){applyGoal(v);setShowCustom(false);}},
              disabled:!custVal||parseInt(custVal,10)<1,
              style:{padding:'7px 16px',borderRadius:8,border:'none',fontFamily:'inherit',
                background:'#16a34a',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}
            },'Set ✓'),
            h('button',{onClick:function(){setShowCustom(false);setCustVal('');},
              style:{padding:'7px 10px',borderRadius:8,fontFamily:'inherit',
                border:'1px solid rgba(255,255,255,.1)',background:'transparent',
                color:'#6b7280',cursor:'pointer',fontSize:12}},'✕')
          )
        )
  );
}

// ── AI Brain DNA Card ─────────────────────────────────────────────
function AIBrainDNACard() {
  var [status, setStatus] = useState(null);

  useEffect(function() {
    function loadStatus() {
      if (A.BrainEngine && A.BrainEngine.getFullStatus) {
        try { setStatus(A.BrainEngine.getFullStatus()); } catch(e) {}
      }
    }
    loadStatus();
    var t = setTimeout(loadStatus, 600); // retry after Brain.js init
    var onUpdate = function() { loadStatus(); };
    window.addEventListener('sc_update', onUpdate);
    return function() { clearTimeout(t); window.removeEventListener('sc_update', onUpdate); };
  }, []);

  var totalSamples = status ? (status.totalSamples || 0) : 0;
  var styleLabel   = (status && totalSamples >= 5 && status.styleLabel) || null;
  var proLabel     = (status && totalSamples >= 5 && status.proLabel)   || null;
  var models       = (status && status.models) || {};
  var MODEL_KEYS   = ['StylePredictor','ProMatcher','DrillAdaptor','MentalReadiness'];
  var MODEL_SHORT  = { StylePredictor:'Style', ProMatcher:'Role', DrillAdaptor:'Drills', MentalReadiness:'Mental' };

  return h('button', {
    onClick: function() { nav('IntelligenceHub'); },
    style: {
      display:'block', width:'calc(100% - 32px)', margin:'0 16px 12px',
      padding:'14px 16px',
      background:'linear-gradient(135deg, rgba(79,70,229,0.9) 0%, rgba(124,58,237,0.9) 100%)',
      border:'1px solid rgba(139,92,246,0.3)',
      borderRadius:14, cursor:'pointer', textAlign:'left',
      boxShadow:'0 4px 20px rgba(79,70,229,0.25)',
    }
  },
    h('div', { style:{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 } },
      h('div', { style:{ display:'flex', alignItems:'center', gap:8 } },
        h('div', { style:{ fontSize:16 } }, '⬡'),
        h('div', { style:{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.85)', letterSpacing:'0.08em', textTransform:'uppercase' } }, 'Your Cricket DNA')
      ),
      h('div', { style:{ fontSize:11, color:'rgba(255,255,255,0.45)' } }, totalSamples + ' signals →')
    ),
    totalSamples < 5
      ? h('div', { style:{ fontSize:12, color:'rgba(255,255,255,0.65)', lineHeight:1.5 } },
          'The AI is learning about you — complete drills and sessions to train your personal model.'
        )
      : h('div', { style:{ display:'flex', gap:20, flexWrap:'wrap' } },
          styleLabel && h('div', null,
            h('div', { style:{ fontSize:9, color:'rgba(255,255,255,0.5)', marginBottom:2, letterSpacing:'0.06em' } }, 'STYLE'),
            h('div', { style:{ fontSize:14, fontWeight:800, color:'#fff' } }, styleLabel)
          ),
          proLabel && h('div', null,
            h('div', { style:{ fontSize:9, color:'rgba(255,255,255,0.5)', marginBottom:2, letterSpacing:'0.06em' } }, 'ARCHETYPE'),
            h('div', { style:{ fontSize:14, fontWeight:800, color:'#fff' } }, proLabel)
          )
        ),
    h('div', { style:{ display:'flex', gap:6, marginTop:10, alignItems:'flex-end' } },
      MODEL_KEYS.map(function(name) {
        var m = models[name] || {};
        var pct = Math.min(100, Math.round(((m.samples || 0) / 25) * 100));
        var col = m.trained ? '#4ade80' : 'rgba(255,255,255,0.35)';
        return h('div', { key:name, style:{ flex:1 } },
          h('div', { style:{ fontSize:8, color:'rgba(255,255,255,0.4)', marginBottom:3, textAlign:'center' } }, MODEL_SHORT[name]),
          h('div', { style:{ height:3, borderRadius:99, background:'rgba(255,255,255,0.12)', overflow:'hidden' } },
            h('div', { style:{ height:'100%', width:pct+'%', background:col, borderRadius:99, transition:'width 0.5s' } })
          )
        );
      })
    )
  );
}

// ── HomePage ──────────────────────────────────────────────────────
function HomePage(){
  var [progress,        setProgress]       = useState(null);
  var [mission,         setMission]        = useState(null);
  var [weeklyGoal,      setWeeklyGoal]     = useState(200);
  var [xpLog,           setXpLog]          = useState([]);
  var [firstToast,      setFirstToast]     = useState(false);
  var [showRewardModal, setShowRewardModal] = useState(false);
  var [bonusToast,      setBonusToast]     = useState(null);

  function reload(){
    setProgress(DB.getProgress()||{});
    setMission(A.generateTodaysMission?A.generateTodaysMission():null);
    setWeeklyGoal(DB.getWeeklyXPGoal?(DB.getWeeklyXPGoal()||200):200);
    setXpLog(DB.getXPLast7Days?DB.getXPLast7Days():[]);
  }

  var prevStreakRef = useRef(null);

  useEffect(function(){
    reload();
    var onUpdate=function(){
      // Streak milestone particle burst
      try {
        var p = DB.getProgress ? DB.getProgress() : {};
        var newStreak = p.current_streak || 0;
        var MILESTONES = [7,14,21,30];
        if (prevStreakRef.current !== null &&
            MILESTONES.indexOf(newStreak) !== -1 &&
            newStreak > prevStreakRef.current) {
          var E = A.Emotion;
          if (E && E.fireStreakParticles) E.fireStreakParticles(newStreak);
          if (A.fireConfetti) A.fireConfetti();
        }
        prevStreakRef.current = newStreak;
      } catch(e) {}

      reload();
      // ✅ Proactive bonus reward — 15% chance after any session
      try{
        var today=getToday(), key='sc_surprise_'+today;
        if(DB.get&&DB.get(key)) return;
        if(Math.random()<0.15){
          var BXPS=[25,50,75,100];
          var bxp=BXPS[Math.floor(Math.random()*BXPS.length)];
          if(DB.set) DB.set(key,true);
          if(A.awardXP) A.awardXP(bxp,0,'bonus_reward',null,null);
          setBonusToast({xp:bxp});
          setTimeout(function(){setBonusToast(null);},4500);
        }
      }catch(e){}
    };
    var onFirst=function(){setFirstToast(true);setTimeout(function(){setFirstToast(false);},2800);};
    var onOpenReward=function(){setShowRewardModal(true);};
    // Initialise prevStreakRef
    try { prevStreakRef.current = (DB.getProgress?DB.getProgress():{}).current_streak||0; } catch(e){}
    window.addEventListener('sc_update',onUpdate);
    window.addEventListener('sc_first_session',onFirst);
    window.addEventListener('sc_open_reward_modal',onOpenReward);
    return function(){
      window.removeEventListener('sc_update',onUpdate);
      window.removeEventListener('sc_first_session',onFirst);
      window.removeEventListener('sc_open_reward_modal',onOpenReward);
    };
  },[]);

  // ⚠️ Must be called before any early return — Rules of Hooks
  var isMinimalist=A.useMinimalistMode?A.useMinimalistMode():false;

  if(!progress){
    return h('div',{style:{background:'#0d1117',minHeight:'100dvh',
      display:'flex',alignItems:'center',justifyContent:'center'}},
      A.CricketLoader ? h(A.CricketLoader, null) :
        h('div',{style:{textAlign:'center',color:'#6b7280'}},
          h('div',{style:{fontSize:40,marginBottom:12}},'🏏'),
          h('div',{style:{fontSize:14}},'Loading...')
        )
    );
  }

  var user=DB.getUser?DB.getUser():{};
  var levelInfo=A.getLevelInfo?A.getLevelInfo(progress.total_xp||0)
    :{level:1,name:'Rookie',pct:0,xpToNext:500,next:null};
  var streak=progress.current_streak||0;
  var mult=streak>=30?1.5:streak>=14?1.3:streak>=7?1.2:streak>=3?1.1:1.0;
  var weekXP=xpLog.reduce(function(s,d){return s+(d.xp||0);},0);
  var todayDate=getToday();
  var allXPLog=DB.getXPLog?DB.getXPLog():[];
  var todayEntries=allXPLog.filter(function(e){return e.date===todayDate;});
  var todayXP=todayEntries.reduce(function(s,e){return s+(e.xp||0);},0);
  var todayDrills=todayEntries.filter(function(e){return e.source&&e.source.indexOf('drill:')===0;}).length;
  var dailyTargets=DB.getDailyTargets?DB.getDailyTargets():{drills:3,xp:150,streakGoal:7};
  var greet=(function(){var hr=new Date().getHours();return hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';})();
  var nextLevelName=levelInfo.next?levelInfo.next.name:'max level'; // ✅ fixed [object Object]

  return h('div',{style:{background:'#0d1117',minHeight:'100dvh',
    backgroundImage:'radial-gradient(ellipse at 20% -20%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(59,130,246,0.06) 0%, transparent 50%)'}},
    h('style',null,'@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}'),

    // ── Hero ───────────────────────────────────────────────────────
    h('div',{className:'sc-home-card-enter',style:{animationDelay:'0ms',padding:'16px 16px 12px',
      background:'linear-gradient(180deg,rgba(22,163,74,.07) 0%,transparent 100%)'}},
      h('div',{style:{marginBottom:12}},
        h('div',{style:{fontSize:13,color:'#94a3b8'}},greet+', '+(user.name||'Cricketer')+' 👋'),
        h('h1',{style:{fontSize:24,fontWeight:800,color:'#f8fafc',margin:'4px 0 2px'}},'Today\'s Training'),
        h('div',{style:{fontSize:12,color:'#64748b'}},
          new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'}))
      ),
      h('div',{style:{display:'flex',gap:10,marginBottom:10}},
        h('div',{style:{flex:1,background:'rgba(16,22,36,0.9)',border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:12,padding:'16px',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'},role:'region','aria-label':'XP level progress'},
          h('div',{style:{display:'flex',justifyContent:'space-between',marginBottom:6}},
            h('span',{style:{fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em'}},'Level '+levelInfo.level),
            h('span',{style:{fontSize:11,color:'#4ade80',fontWeight:700}},
              h('span',{'data-count-to':progress.total_xp||0,'data-hero-num':'1'},(progress.total_xp||0).toLocaleString()),
              ' XP')
          ),
          h('div',{style:{fontSize:16,fontWeight:800,color:'#f8fafc',marginBottom:8}},levelInfo.name),
          A.MomentumBar
            ? h(A.MomentumBar,{pct:levelInfo.pct||0,height:8,gradient:'linear-gradient(to right,#22c55e,#4ade80)',glowColor:'rgba(74,222,128,0.6)',ariaLabel:'Level progress'})
            : h('div',{style:{height:8,background:'rgba(255,255,255,.08)',borderRadius:99,overflow:'hidden'},role:'progressbar','aria-valuenow':Math.round(levelInfo.pct||0),'aria-valuemin':0,'aria-valuemax':100},
                h('div',{style:{height:'100%',width:(levelInfo.pct||0)+'%',background:'linear-gradient(90deg,#22c55e,#4ade80)',borderRadius:99,transition:'width .5s',boxShadow:'0 0 10px rgba(74,222,128,0.6)'}})
              ),
          h('div',{style:{fontSize:10,color:'#475569',marginTop:6}},
            (levelInfo.xpToNext||0).toLocaleString()+' XP to '+nextLevelName)
        ),
        h('div',{
          className:streak>=30?'streak-legendary':streak>=14?'streak-fire':streak>=7?'streak-hot':'',
          style:{background:'rgba(16,22,36,0.9)',border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:12,padding:'16px',minWidth:95,textAlign:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.4)'},
          role:'region','aria-label':streak+' day streak'},
          h('div',{style:{fontSize:26,fontWeight:800,color:'#f8fafc',lineHeight:1.1}},
            h('span',{'data-count-to':streak,'data-hero-num':'1'},String(streak))),
          h('div',{style:{fontSize:11,fontWeight:600,color:'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em',marginTop:2}},'Streak'),
          h('div',{style:{fontSize:18,marginTop:6,display:'inline-block',
            animation:streak>=7?'scStreakPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both':'none'},
            'aria-hidden':'true'},streak>0?'🔥':'💤')
        )
      ),
      // ✅ DNA mini-badge (only if app-cricket-dna.js is loaded)
      A.DNAOverview?h(A.DNAOverview,{}):null,

      // ── Triple Progress Rings ──────────────────────────────────
      A.ProgressRings?h('div',{style:{display:'flex',justifyContent:'center',padding:'16px 0 4px'}},
        h(A.ProgressRings,{
          content:{done:todayDrills,target:dailyTargets.drills},
          contribution:{xp:todayXP,target:dailyTargets.xp},
          consistency:{streak:streak,target:dailyTargets.streakGoal},
          onRingClick:function(){A.nav('Progress');}
        })
      ):null
    ),

    // ── Streak Shield (always visible) ────────────────────────────
    A.StreakShieldWidget
      ? h('div',{className:'sc-home-card-enter',style:{animationDelay:'80ms'}},
          h(A.StreakShieldWidget, {streak:streak}))
      : null,

    !isMinimalist&&h(MultiplierBanner,{streak:streak,multiplier:mult}),
    !isMinimalist&&h('div',{className:'sc-home-card-enter',style:{animationDelay:'90ms'}},
      h(AIBrainDNACard,{})),
    !isMinimalist&&(A.IntelligenceDigestCard?h(A.IntelligenceDigestCard,{}):null),
    !isMinimalist&&h('div',{className:'sc-home-card-enter',style:{animationDelay:'160ms'}},
      h(StreakCalendarSection,{})),
    !isMinimalist&&(A.DailyChallengeCard?h(A.DailyChallengeCard,{}):null),
    h('div',{className:'sc-home-card-enter',style:{animationDelay:'240ms'}},
      h(FocusCard,{})),
    !isMinimalist&&(A.IntelligenceHomeCard?h(A.IntelligenceHomeCard,{}):null),

    !isMinimalist&&(A.DailyRewardMiniWidget?h(A.DailyRewardMiniWidget,{
      onOpen:function(){window.dispatchEvent(new CustomEvent('sc_open_reward_modal'));}
    }):null),

    !isMinimalist&&h('div',{className:'sc-reveal'},h(SpinWheelWidget,{})),
    !isMinimalist&&(A.DailyNetHomeWidget?h('div',{className:'sc-reveal'},h(A.DailyNetHomeWidget,{})):null),

    // ── Mission ────────────────────────────────────────────────────
    mission&&h('div',{style:{margin:'0 16px 12px'}},
      h('div',{style:{background:'rgba(16,22,36,0.9)',
        borderLeft:'4px solid #3b82f6',
        border:'1px solid rgba(255,255,255,0.08)',
        borderRadius:12,padding:'14px 16px',
        boxShadow:'0 2px 8px rgba(0,0,0,0.4)'},role:'region','aria-label':'Today\'s mission'},
        h('div',{style:{display:'flex',alignItems:'center',gap:8,marginBottom:10}},
          h('div',{style:{fontSize:16,fontWeight:700,color:'#f8fafc'}},'📋 Today\'s Mission'),
          mission.reason&&h('div',{style:{marginLeft:'auto',fontSize:11,color:'#64748b',fontStyle:'italic'}},mission.reason)
        ),
        h('div',{style:{display:'flex',flexDirection:'column',gap:8}},
          mission.drillId&&h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'rgba(255,255,255,.04)',borderRadius:8}},
            h('div',{style:{width:20,height:20,borderRadius:4,flexShrink:0,
              background:mission.drillDone?'#16a34a':'rgba(255,255,255,.08)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff'}},
              mission.drillDone?'✓':'🎯'),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:12,fontWeight:500,color:mission.drillDone?'#6b7280':'#e5e7eb',
                textDecoration:mission.drillDone?'line-through':'none'}},
                (function(){var d=(A.DRILLS||[]).find(function(x){return x.id===mission.drillId;});return d?d.title:mission.drillId;})()),
              h('div',{style:{fontSize:11,color:'#6b7280'}},'Drill · +XP')
            ),
            !mission.drillDone&&h('button',{
              onClick:function(){nav('DrillDetail',{id:mission.drillId});},
              style:{padding:'7px 14px',background:'linear-gradient(135deg, #22c55e, #16a34a)',
                color:'#fff',border:'none',
                borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                boxShadow:'0 2px 8px rgba(34,197,94,0.3)'}
            },'Begin Challenge')
          ),
          mission.mentalId&&h('div',{style:{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:'rgba(255,255,255,.04)',borderRadius:8}},
            h('div',{style:{width:20,height:20,borderRadius:4,flexShrink:0,
              background:mission.mentalDone?'#8b5cf6':'rgba(255,255,255,.08)',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'#fff'}},
              mission.mentalDone?'✓':'🧠'),
            h('div',{style:{flex:1}},
              h('div',{style:{fontSize:12,fontWeight:500,color:mission.mentalDone?'#6b7280':'#e5e7eb',
                textDecoration:mission.mentalDone?'line-through':'none'}},
                (function(){var m=(A.MENTAL_SESSIONS||[]).find(function(x){return x.id===mission.mentalId;});return m?m.title:mission.mentalId;})()),
              h('div',{style:{fontSize:11,color:'#6b7280'}},'Mental session · +XP')
            ),
            !mission.mentalDone&&h('button',{
              onClick:function(){nav('MentalPlayer',{id:mission.mentalId});},
              style:{padding:'7px 14px',background:'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color:'#fff',border:'none',
                borderRadius:8,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',
                boxShadow:'0 2px 8px rgba(139,92,246,0.3)'}
            },'Begin Challenge')
          )
        ),
        mission.drillDone&&mission.mentalDone&&h('div',{
          style:{marginTop:10,padding:'8px',background:'rgba(22,163,74,.1)',borderRadius:8,
            textAlign:'center',fontSize:12,color:'#4ade80',fontWeight:600},role:'status'
        },'✅ Mission complete! Brilliant work today 🏏')
      )
    ),

    h('div',{className:'sc-reveal'},h(WeeklyGoalSection,{weekXP:weekXP,goal:weeklyGoal,setGoal:setWeeklyGoal})),

    // ── Quick Start (AI Coach removed → Badges added) ──────────────
    h('div',{style:{margin:'0 16px 12px'}},
      h('div',{style:{fontSize:13,fontWeight:700,color:'#f8fafc',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.06em'}},'Quick Start'),
      h('div',{className:'sc-stagger',style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}},
        [
          {label:'Drills',      emoji:'🎯', page:'Drills',     color:'#3b82f6'},
          {label:'Daily Net',   emoji:'🏏', page:'DailyNet',   color:'#4f46e5'},
          {label:'Mental',      emoji:'🧠', page:'Mental',     color:'#8b5cf6'},
          {label:'Fitness',     emoji:'💪', page:'Fitness',    color:'#10b981'},
          {label:'Schedule',    emoji:'📅', page:'Schedule',   color:'#f59e0b'},
          {label:'ProVision™',  emoji:'🎥', page:'VideoAnalysis',color:'#7c3aed'},
          {label:'Progress',    emoji:'📊', page:'Progress',   color:'#6b7280'},
          {label:'Cricket DNA', emoji:'🧬', page:'CricketDNA', color:'#7c3aed'},
        ].map(function(item){
          // Convert hex color to rgba at 12% and 25% opacity
          var hexToRgb=function(hex){
            var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
            return r+','+g+','+b;
          };
          var rgb=hexToRgb(item.color);
          return h('button',{key:item.page,onClick:function(){nav(item.page);},
            'aria-label':'Go to '+item.label,
            className:'sc-spring sc-ripple',
            style:{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',cursor:'pointer',
              background:'rgba('+rgb+',0.12)',
              border:'1px solid rgba('+rgb+',0.25)',
              borderRadius:12,textAlign:'left',fontFamily:'inherit',
              fontSize:13,fontWeight:600,
              transition:'transform 0.15s',
              WebkitTapHighlightColor:'transparent'}
          },
            h('div',{style:{fontSize:20},'aria-hidden':'true'},item.emoji),
            h('div',{style:{fontSize:13,fontWeight:600,color:'#e2e8f0'}},item.label)
          );
        })
      )
    ),

    // ── Next level ─────────────────────────────────────────────────
    h('div',{style:{margin:'0 16px 20px',padding:'12px 14px',
      background:'rgba(22,163,74,.06)',border:'1px solid rgba(22,163,74,.15)',borderRadius:12}},
      h('div',{style:{fontSize:12,color:'#4ade80',fontWeight:600,marginBottom:4}},
        '🎮 Next Level: '+nextLevelName),
      h('div',{style:{fontSize:11,color:'#6b7280'}},
        (levelInfo.xpToNext||0).toLocaleString()+' XP needed · '+
        (todayXP>0?'~'+Math.ceil((levelInfo.xpToNext||0)/todayXP)+' more days at today\'s pace':'Start training to see your pace'))
    ),

    // ── Modals ─────────────────────────────────────────────────────
    (function(){
      if(!showRewardModal||!A.DailyRewardModal) return null;
      var state=A.getRewardState?A.getRewardState():{};
      var ts=getToday();
      if(state.lastClaimed!==ts||!state.weekDay) return null;
      var reward=(A.WEEKLY_REWARDS||[])[state.weekDay-1];
      if(!reward) return null;
      return h(A.DailyRewardModal,{reward:reward,state:state,onClose:function(){setShowRewardModal(false);}});
    })(),

    firstToast&&h('div',{role:'alert','aria-live':'assertive',
      style:{position:'fixed',bottom:90,left:16,right:16,zIndex:100,
        background:'#16a34a',borderRadius:12,padding:'14px 18px',
        boxShadow:'0 8px 32px rgba(22,163,74,.55)',display:'flex',alignItems:'center',gap:12,
        animation:'slideUp 0.3s ease-out'}},
      h('div',{style:{fontSize:24},'aria-hidden':'true'},'🎉'),
      h('div',null,
        h('div',{style:{fontSize:14,fontWeight:700,color:'#fff'}},'First session complete!'),
        h('div',{style:{fontSize:12,color:'rgba(255,255,255,.8)'}},'SmartCrick Member badge earned!')
      )
    ),

    bonusToast&&h('div',{role:'alert','aria-live':'polite',
      style:{position:'fixed',bottom:90,left:16,right:16,zIndex:105,
        background:'linear-gradient(135deg,#7c3aed,#a855f7)',borderRadius:14,
        padding:'14px 18px',boxShadow:'0 8px 32px rgba(124,58,237,.5)',
        display:'flex',alignItems:'center',gap:12,animation:'slideUp 0.3s ease-out'}},
      h('div',{style:{fontSize:24}},'🎁'),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:14,fontWeight:700,color:'#fff'}},'Bonus Reward!'),
        h('div',{style:{fontSize:12,color:'rgba(255,255,255,.8)'}},'+'+bonusToast.xp+' XP for your dedication 🔥')
      ),
      h('button',{onClick:function(){setBonusToast(null);},
        style:{background:'none',border:'none',color:'rgba(255,255,255,.7)',fontSize:18,cursor:'pointer',padding:'0 4px'}},'×')
    )
  );
}

// ── Brain.js Neural Recommendation Engine ─────────────────────────
(function initBrainJS(){
  function heuristicFallback(){
    A.getRecommendedCategory=function(){
      try{
        var dp=DB.getDrillProgress?DB.getDrillProgress():{};
        var DRILLS=A.DRILLS||[], counts={batting:0,bowling:0,fielding:0,fitness:0,mental:0};
        Object.keys(dp).forEach(function(id){
          var d=DRILLS.find(function(x){return x.id===id;});
          if(d&&counts[d.category]!==undefined) counts[d.category]++;
        });
        return Object.keys(counts).reduce(function(a,b){return counts[a]<=counts[b]?a:b;});
      }catch(e){return 'batting';}
    };
    A.getRecommendedReason=function(cat){
      var R={batting:'Your batting builds the foundation.',bowling:'Bowling practice takes wickets.',
        fielding:'Fielding saves games.',fitness:'Fitness powers everything else.',mental:'Mental strength multiplies all your skills.'};
      return R[cat]||'Based on your training history.';
    };
  }
  try{
    if(typeof brain==='undefined'){heuristicFallback();return;}
    var net=new brain.NeuralNetwork({hiddenLayers:[12,8],activation:'sigmoid'});
    net.train([
      {input:{bd:0.0,bw:0.8,fd:0.5,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4},output:{batting:0.9,bowling:0.05,fielding:0.1,fitness:0.1,mental:0.2}},
      {input:{bd:0.8,bw:0.0,fd:0.5,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4},output:{batting:0.1,bowling:0.9,fielding:0.1,fitness:0.1,mental:0.15}},
      {input:{bd:0.6,bw:0.7,fd:0.0,st:0.3,ms:0.6,tod:0.3,dow:0.2,xw:0.4},output:{batting:0.1,bowling:0.1,fielding:0.9,fitness:0.1,mental:0.15}},
      {input:{bd:0.5,bw:0.5,fd:0.5,st:0.2,ms:0.1,tod:0.7,dow:0.5,xw:0.2},output:{batting:0.1,bowling:0.1,fielding:0.1,fitness:0.9,mental:0.1}},
      {input:{bd:0.4,bw:0.4,fd:0.4,st:0.5,ms:0.5,tod:0.8,dow:0.5,xw:0.6},output:{batting:0.1,bowling:0.1,fielding:0.1,fitness:0.1,mental:0.9}},
    ],{iterations:400,errorThresh:0.005});
    A.getRecommendedCategory=function(){
      try{
        var dp=DB.getDrillProgress?DB.getDrillProgress():{};
        var log=DB.getXPLog?DB.getXPLog():[], DRILLS=A.DRILLS||[];
        var counts={batting:0,bowling:0,fielding:0,fitness:0,mental:0};
        Object.keys(dp).forEach(function(id){
          var d=DRILLS.find(function(x){return x.id===id;});
          if(d&&counts[d.category]!==undefined) counts[d.category]++;
        });
        var tot=Math.max(Object.keys(counts).map(function(k){return counts[k];}).reduce(function(s,v){return s+v;},0),1);
        var hr=new Date().getHours(), dow=new Date().getDay();
        var wkXP=log.filter(function(e){return e.date>=getWeekStart();}).reduce(function(s,e){return s+(e.xp||0);},0);
        var p=net.run({bd:counts.batting/tot,bw:counts.bowling/tot,fd:(counts.fielding+counts.fitness)/tot,
          st:Math.min((DB.getProgress?DB.getProgress().current_streak||0:0)/30,1),
          ms:counts.mental/tot,tod:hr/24,dow:dow/6,xw:Math.min(wkXP/500,1)});
        return Object.keys(p).reduce(function(a,b){return p[a]>=p[b]?a:b;});
      }catch(e){return 'batting';}
    };
    A.getRecommendedReason=function(cat){
      var R={batting:'Neural analysis: batting is your priority focus.',bowling:'Your bowling needs dedicated sessions.',
        fielding:'Fielding analytics show opportunity for improvement.',fitness:'Fitness is the foundation of your game.',
        mental:'Mental training will amplify all your physical work.'};
      return R[cat]||'Based on your complete training profile.';
    };
    console.log('[SC] Brain.js neural recommendation engine active');
  }catch(e){heuristicFallback();}
})();

A.HomePage=HomePage;
console.log('[SC] app-home.js v6.0 — FocusCard, custom XP goals, auto-spin, DNA badge, proactive rewards');
})();
