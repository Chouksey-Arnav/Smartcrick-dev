// app-viral.js v1.1 — Cricket DNA Analyzer
(function() {
'use strict';
const { createElement:h, useState, useEffect } = React;
const A  = window.SC_APP;
const DB = A.DB;
const nav = A.nav;

var PRO_DNA = [
  {id:'kohli',   name:'Virat Kohli',    emoji:'👑', role:'Batsman',     country:'🇮🇳', color:'#3b82f6', traits:['Run machine','Ice-cold chaser','Chase master'],           dna:{batting:98,bowling:20,fielding:92,fitness:96,mental:97,consistency:99}},
  {id:'bumrah',  name:'Jasprit Bumrah', emoji:'🎯', role:'Bowler',      country:'🇮🇳', color:'#ef4444', traits:['Unplayable yorkers','Death bowling king','Unique action'], dna:{batting:15,bowling:99,fielding:75,fitness:88,mental:95,consistency:93}},
  {id:'stokes',  name:'Ben Stokes',     emoji:'⚡', role:'All-Rounder', country:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', color:'#f59e0b', traits:['Match-winner','Never give up','Pressure performer'],    dna:{batting:87,bowling:80,fielding:90,fitness:94,mental:99,consistency:80}},
  {id:'root',    name:'Joe Root',       emoji:'🎩', role:'Batsman',     country:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', color:'#10b981', traits:['Technical perfection','Spin master','Consistent scorer'], dna:{batting:97,bowling:40,fielding:85,fitness:87,mental:91,consistency:98}},
  {id:'smith',   name:'Steve Smith',    emoji:'🦎', role:'Batsman',     country:'🇦🇺', color:'#8b5cf6', traits:['Unorthodox genius','Slip expert','Concentration king'],    dna:{batting:98,bowling:30,fielding:88,fitness:85,mental:96,consistency:97}},
  {id:'rashid',  name:'Rashid Khan',   emoji:'🌪️', role:'Bowler',      country:'🇦🇫', color:'#f97316', traits:['Leg-spin wizard','Economy king','Lower-order star'],       dna:{batting:45,bowling:97,fielding:82,fitness:90,mental:88,consistency:91}},
  {id:'buttler', name:'Jos Buttler',    emoji:'🚀', role:'Batsman/WK',  country:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', color:'#14b8a6', traits:['Explosive striker','T20 destroyer','Innovative shots'],    dna:{batting:92,bowling:5, fielding:89,fitness:88,mental:87,consistency:82}},
  {id:'rohit',   name:'Rohit Sharma',   emoji:'🏆', role:'Batsman',     country:'🇮🇳', color:'#6366f1', traits:['Double century king','ODI legend','Elegant strokeplay'],   dna:{batting:95,bowling:10,fielding:78,fitness:80,mental:90,consistency:88}},
  {id:'warner',  name:'David Warner',   emoji:'💥', role:'Batsman',     country:'🇦🇺', color:'#dc2626', traits:['Aggressive opener','Boundary hunter','IPL legend'],         dna:{batting:91,bowling:5, fielding:85,fitness:91,mental:84,consistency:87}},
  {id:'rabada',  name:'Kagiso Rabada',  emoji:'🌩️', role:'Bowler',      country:'🇿🇦', color:'#22c55e', traits:['Pure pace','Big match performer','Lethal yorkers'],        dna:{batting:20,bowling:95,fielding:78,fitness:93,mental:89,consistency:90}},
  {id:'starc',   name:'Mitchell Starc', emoji:'⚡', role:'Bowler',      country:'🇦🇺', color:'#a78bfa', traits:['Left-arm pace','Reverse swing','World Cup hero'],          dna:{batting:30,bowling:93,fielding:72,fitness:88,mental:86,consistency:84}},
  {id:'dhoni',   name:'MS Dhoni',       emoji:'🧘', role:'Batsman/WK',  country:'🇮🇳', color:'#fbbf24', traits:['Ice-cool finisher','World class keeping','Born leader'],    dna:{batting:80,bowling:5, fielding:95,fitness:85,mental:100,consistency:90}},
];
var AXES = ['batting','bowling','fielding','fitness','mental','consistency'];
function cosine(a,b){var d=0,ma=0,mb=0;AXES.forEach(function(k){d+=(a[k]||0)*(b[k]||0);ma+=(a[k]||0)*(a[k]||0);mb+=(b[k]||0)*(b[k]||0);});return ma&&mb?d/(Math.sqrt(ma)*Math.sqrt(mb)):0;}
function computeDNA(scores){
  var m=PRO_DNA.map(function(p){return{pro:p,score:cosine(scores,p.dna)};}).sort(function(a,b){return b.score-a.score;}).slice(0,3);
  var t=m.reduce(function(s,x){return s+x.score;},0);
  return m.map(function(x){return{pro:x.pro,pct:Math.round((x.score/t)*100)};});
}

function CricketDNAPage() {
  var [dna,setDNA]=useState(null), [loading,setLoading]=useState(false), [shared,setShared]=useState(false);
  var lastDate = DB.get('dna_last_date'), today = new Date().toISOString().slice(0,10);

  function analyze() {
    setLoading(true);
    setTimeout(function(){
      var r=A.calcPlayerRating?A.calcPlayerRating():{};
      var hasData=Object.values(r).some(function(v){return v>5;});
      var s=hasData?r:{batting:40+Math.floor(Math.random()*30),bowling:20+Math.floor(Math.random()*40),fielding:35+Math.floor(Math.random()*30),fitness:30+Math.floor(Math.random()*35),mental:40+Math.floor(Math.random()*30),consistency:25+Math.floor(Math.random()*40)};
      setDNA(computeDNA(s)); setLoading(false); DB.set('dna_last_date',today);
    },1600);
  }

  function handleShare() {
    if (!dna) return;
    var text=['🧬 My Cricket DNA on SmartCrick AI:','',dna.map(function(d){return d.pro.emoji+' '+d.pro.name+': '+d.pct+'%';}).join('\n'),'','Find yours → smartcricai.vercel.app/#/CricketDNA','#SmartCrick #CricketDNA'].join('\n');
    if (navigator.share) navigator.share({title:'My Cricket DNA',text:text}).catch(function(){});
    else if (navigator.clipboard) navigator.clipboard.writeText(text).then(function(){setShared(true);setTimeout(function(){setShared(false);},2500);});
  }

  var primary = dna&&dna[0];
  return h('div',{style:{background:'#0d1117',minHeight:'100dvh',paddingBottom:40}},
    h('div',{style:{padding:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 24px',background:'linear-gradient(135deg,#1a0533,#0d1117)',textAlign:'center',position:'relative'}},
      h('button',{onClick:function(){nav('Home');},'aria-label':'Back',style:{position:'absolute',top:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top)))',left:16,background:'rgba(255,255,255,.07)',border:'none',borderRadius:8,padding:'7px 12px',color:'#9ca3af',cursor:'pointer',fontSize:13,fontWeight:600}},'‹ Back'),
      h('div',{style:{fontSize:48,marginBottom:12},'aria-hidden':'true'},'🧬'),
      h('h1',{style:{fontSize:24,fontWeight:900,color:'#f0fdf4',margin:'0 0 8px',letterSpacing:'-.02em'}},'Cricket DNA'),
      h('p',{style:{fontSize:14,color:'#9ca3af',lineHeight:1.6,maxWidth:300,margin:'0 auto'}},'Which pro cricketer does your training most resemble? Find out — then share it.'),
    ),
    h('div',{style:{padding:'20px'}},
      !dna&&!loading&&h('div',null,
        h('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}},
          PRO_DNA.slice(0,6).map(function(p){return h('div',{key:p.id,style:{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'10px',textAlign:'center'}},h('div',{style:{fontSize:22,marginBottom:4}},p.emoji),h('div',{style:{fontSize:10,fontWeight:600,color:'#9ca3af',lineHeight:1.3}},p.name.split(' ').pop()));}),
        ),
        h('button',{onClick:analyze,'aria-label':'Analyse my cricket DNA',style:{width:'100%',padding:'15px',border:'none',borderRadius:12,background:'linear-gradient(135deg,#7c3aed,#4f46e5)',color:'#fff',fontSize:16,fontWeight:700,cursor:'pointer',boxShadow:'0 6px 24px rgba(124,58,237,.4)',display:'flex',alignItems:'center',justifyContent:'center',gap:10}},'🧬 Analyse My Cricket DNA'),
        h('p',{style:{fontSize:11,color:'#4b5563',textAlign:'center',marginTop:8}},'Updates as you train more'),
      ),
      loading&&h('div',{style:{textAlign:'center',padding:'60px 20px'}},
        h('div',{style:{fontSize:48,marginBottom:16}},'🧬'),
        h('div',{style:{fontSize:14,fontWeight:600,color:'#9ca3af'}},'Comparing your training against 12 world-class profiles...'),
      ),
      dna&&primary&&h('div',null,
        // Primary result
        h('div',{style:{background:'linear-gradient(135deg,'+primary.pro.color+'20,'+primary.pro.color+'08)',border:'1px solid '+primary.pro.color+'35',borderRadius:16,padding:'20px',marginBottom:16,textAlign:'center'}},
          h('div',{style:{fontSize:52,marginBottom:8},'aria-hidden':'true'},primary.pro.emoji),
          h('div',{style:{fontSize:11,fontWeight:800,color:primary.pro.color,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}},'Your Cricket DNA'),
          h('div',{style:{fontSize:24,fontWeight:900,color:'#f0fdf4',letterSpacing:'-.02em'}},primary.pro.name+' '+primary.pct+'%'),
          h('div',{style:{fontSize:12,color:'#6b7280',marginTop:4}},primary.pro.role+' · '+primary.pro.country),
          h('div',{style:{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginTop:10}},
            primary.pro.traits.map(function(t){return h('span',{key:t,style:{fontSize:11,padding:'4px 10px',borderRadius:20,background:primary.pro.color+'18',border:'1px solid '+primary.pro.color+'30',color:primary.pro.color}},t);}),
          ),
        ),
        // All 3 bars
        h('div',{style:{display:'flex',flexDirection:'column',gap:10,marginBottom:16}},
          dna.map(function(match){return h('div',{key:match.pro.id},
            h('div',{style:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}},
              h('div',{style:{display:'flex',alignItems:'center',gap:8}},h('span',{style:{fontSize:18}},match.pro.emoji),h('span',{style:{fontSize:13,fontWeight:600,color:'#e5e7eb'}},match.pro.name),h('span',{style:{fontSize:10,color:'#6b7280'}},match.pro.country)),
              h('span',{style:{fontSize:14,fontWeight:700,color:match.pro.color}},match.pct+'%'),
            ),
            h('div',{style:{height:6,borderRadius:3,background:'rgba(255,255,255,.06)',overflow:'hidden'},role:'progressbar','aria-valuenow':match.pct,'aria-valuemin':0,'aria-valuemax':100,'aria-label':match.pro.name+': '+match.pct+'%'},
              h('div',{style:{height:'100%',width:match.pct+'%',background:match.pro.color,borderRadius:3,transition:'width .8s ease'}}),
            ),
          );})
        ),
        // Share
        h('button',{onClick:handleShare,'aria-label':'Share Cricket DNA result',style:{width:'100%',padding:'13px',border:'none',borderRadius:10,background:shared?'#16a34a':primary.pro.color,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',transition:'background .2s',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}},shared?'✓ Copied!':'🔗 Share Your Cricket DNA'),
        h('div',{style:{display:'flex',gap:10}},
          h('button',{onClick:function(){setDNA(null);},style:{flex:1,padding:'10px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:8,color:'#9ca3af',cursor:'pointer',fontSize:12,fontWeight:600}},'↺ Recalculate'),
          h('button',{onClick:function(){nav('Home');},style:{flex:1,padding:'10px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.09)',borderRadius:8,color:'#9ca3af',cursor:'pointer',fontSize:12,fontWeight:600}},'Back Home'),
        ),
      ),
    ),
  );
}
A.CricketDNAPage = CricketDNAPage;
console.log('[SC] app-viral.js v1.1 — Cricket DNA ready');
})();
