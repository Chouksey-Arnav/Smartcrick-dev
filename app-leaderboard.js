// app-leaderboard.js — Micro-Competition Framework (Phase 6)
// Cohort-based leaderboards with ghost players. Fixes blank Leaderboard page.
(function() {
'use strict';
var A = window.SC_APP;
var h = A.h;
var useState = React.useState;
var useEffect = React.useEffect;
var useMemo = React.useMemo;

var FAKE_SURNAMES = ['Sharma','Patel','Singh','Kumar','Yadav','Gupta','Khan','Ali','Verma','Das',
  'Roy','Nair','Reddy','Mehta','Joshi','Shah','Iyer','Pillai','Bose','Kapoor'];

// ── Ghost Player Generator ────────────────────────────────────────
function generateCohort(userXP, userRole, userLevel, scope, category) {
  var elo = (A.DB && A.DB.getELORatings()) || {};
  var userELO = category ? (elo[category] || 1000) : null;

  // Seed changes per scope period (monthly for 'month', weekly for 'week', fixed for 'alltime')
  var now = new Date();
  var seed;
  if (scope === 'alltime') seed = 42;
  else if (scope === 'month') seed = now.getFullYear() * 12 + now.getMonth();
  else seed = Math.floor(Date.now() / (7 * 864e5)); // weekly

  var cricketers = (A.CRICKETERS_DB || []);
  var roleMap = {batsman:'bat',bowler:'bowl',allrounder:'all',wicketkeeper:'wk'};

  function seededRand(i) { return Math.abs(Math.sin(seed * 9301 + i * 49297 + 233) % 1); }

  function ghostName(i) {
    var namePool = cricketers.length ? cricketers : [{name:'Player'}];
    var firstName = namePool[i % namePool.length].name.split(' ')[0];
    var surname = FAKE_SURNAMES[(i * 7 + seed) % FAKE_SURNAMES.length];
    return firstName + ' ' + surname;
  }

  var rankMetric = function(xp) { return xp; };
  if (category && userELO !== null) {
    // Category view: rank by ELO
    rankMetric = function(xp, eloVal) { return eloVal; };
  }

  // Build 19 ghost players around the user
  var ghosts = [];
  // 4 above user
  for (var i=0;i<4;i++) {
    var jitter = 1.05 + i * 0.08 + (seededRand(i) - 0.5) * 0.12;
    var gXP = Math.round((userXP||100) * jitter);
    var gELO = category ? Math.round((userELO||1000) * jitter) : null;
    ghosts.push({name:ghostName(i), xp:gXP, elo:gELO, drillsDone:Math.round(seededRand(i+10)*30+5), streak:Math.round(seededRand(i+20)*14), isUser:false});
  }
  // 5 close to user
  for (var j=0;j<5;j++) {
    var jitter2 = 0.96 + (seededRand(j+4) - 0.5) * 0.08;
    var gXP2 = Math.round((userXP||100) * jitter2);
    var gELO2 = category ? Math.round((userELO||1000) * jitter2) : null;
    ghosts.push({name:ghostName(j+4), xp:gXP2, elo:gELO2, drillsDone:Math.round(seededRand(j+14)*20+3), streak:Math.round(seededRand(j+24)*10), isUser:false});
  }
  // 10 below user
  for (var k=0;k<10;k++) {
    var jitter3 = 0.60 + k * 0.035 + (seededRand(k+9) - 0.5) * 0.05;
    var gXP3 = Math.round((userXP||100) * jitter3);
    var gELO3 = category ? Math.round((userELO||1000) * jitter3) : null;
    ghosts.push({name:ghostName(k+9), xp:gXP3, elo:gELO3, drillsDone:Math.round(seededRand(k+19)*15+1), streak:Math.round(seededRand(k+29)*7), isUser:false});
  }

  // Add user
  var user = A.DB ? A.DB.getUser() : {};
  var progress = A.DB ? A.DB.getProgress() : {};
  ghosts.push({
    name: user.name || 'You',
    xp: userXP || 0,
    elo: userELO,
    drillsDone: progress.drills_done || 0,
    streak: progress.current_streak || 0,
    isUser: true,
  });

  // Sort by rank metric (XP or ELO)
  var sorted = ghosts.sort(function(a,b){
    var va = category ? (b.elo||0) : b.xp;
    var vb = category ? (a.elo||0) : a.xp;
    return va - vb;
  });

  return sorted.map(function(p,i){ return Object.assign({},p,{rank:i+1}); });
}

// ── Leaderboard Page ──────────────────────────────────────────────
function LeaderboardPage() {
  var progress = A.DB ? A.DB.getProgress() : {};
  var user = A.DB ? A.DB.getUser() : {};
  var prefs = (A.DB && A.DB.get('leaderboard_prefs')) || {scope:'week', category:null};

  var [scope, setScope] = useState(prefs.scope || 'week');
  var [category, setCategory] = useState(prefs.category || null);

  // Persist prefs
  useEffect(function() {
    if (A.DB) A.DB.set('leaderboard_prefs', {scope:scope, category:category});
  }, [scope, category]);

  var cohort = useMemo(function() {
    return generateCohort(
      progress.total_xp || 0,
      user.role || 'batsman',
      user.level || 'club',
      scope,
      category
    );
  }, [scope, category, progress.total_xp]);

  var userRow = cohort.find(function(p){ return p.isUser; });
  var userRank = userRow ? userRow.rank : cohort.length;
  var topPct = Math.round((userRank / cohort.length) * 100);

  var SCOPES = [{k:'week',label:'This Week'},{k:'month',label:'This Month'},{k:'alltime',label:'All Time'}];
  var CATS = [{k:null,label:'Overall'},{k:'batting',label:'Batting'},{k:'bowling',label:'Bowling'},
              {k:'fielding',label:'Fielding'},{k:'fitness',label:'Fitness'},{k:'mental',label:'Mental'}];

  var levelLabel = {school:'School',club:'Club',district:'District',state:'State',national:'National'}[user.level||'club'] || 'Club';

  function RankBadge(props) {
    var rank = props.rank;
    var bg = rank===1?'linear-gradient(135deg,#fbbf24,#d97706)':rank===2?'linear-gradient(135deg,#9ca3af,#6b7280)':rank===3?'linear-gradient(135deg,#cd7f32,#92400e)':'rgba(255,255,255,0.07)';
    return h('div',{style:{
      width:32,height:32,borderRadius:rank<=3?'50%':8,background:bg,
      display:'flex',alignItems:'center',justifyContent:'center',
      fontSize:rank<=3?14:12,fontWeight:900,color:rank<=3?'#fff':'#94a3b8',flexShrink:0,
    }}, rank<=3?['🥇','🥈','🥉'][rank-1]:rank);
  }

  return h('div',{style:{background:'#0d1117',minHeight:'100vh',paddingBottom:80}},
    // Header
    h('div',{style:{padding:'20px 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.06)'}},
      h('div',{style:{fontSize:22,fontWeight:900,color:'#f0fdf4',marginBottom:4}},'Leaderboard'),
      h('div',{style:{fontSize:12,color:'#6b7280'}}, levelLabel+' Level · '+(user.role?user.role.charAt(0).toUpperCase()+user.role.slice(1):'Player')+'s')
    ),

    // Scope tabs
    h('div',{style:{display:'flex',gap:4,padding:'12px 16px 0',overflowX:'auto'}},
      SCOPES.map(function(s) {
        return h('button',{key:s.k,onClick:function(){setScope(s.k);},
          style:{padding:'6px 14px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,
            background:scope===s.k?'#10b981':'rgba(255,255,255,0.07)',
            color:scope===s.k?'#fff':'#6b7280',flexShrink:0}
        }, s.label);
      })
    ),

    // Category tabs
    h('div',{style:{display:'flex',gap:4,padding:'8px 16px 12px',overflowX:'auto'}},
      CATS.map(function(c) {
        return h('button',{key:String(c.k),onClick:function(){setCategory(c.k);},
          style:{padding:'4px 12px',borderRadius:20,border:'none',cursor:'pointer',fontWeight:700,fontSize:11,
            background:category===c.k?'rgba(59,130,246,0.3)':'rgba(255,255,255,0.05)',
            color:category===c.k?'#60a5fa':'#6b7280',flexShrink:0,
            borderBottom:category===c.k?'2px solid #3b82f6':'2px solid transparent'}
        }, c.label);
      })
    ),

    // Player list
    h('div',{style:{padding:'0 12px'}},
      cohort.map(function(player) {
        var metric = category ? (player.elo||1000) : player.xp;
        var metricLabel = category ? ((player.elo||1000)+' ELO') : ((player.xp||0)+' XP');
        return h('div',{key:player.rank,
          style:{
            display:'flex',alignItems:'center',gap:10,padding:'10px 10px',marginBottom:4,
            borderRadius:10,
            background:player.isUser?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.02)',
            border:player.isUser?'1px solid rgba(16,185,129,0.3)':'1px solid transparent',
          }
        },
          h(RankBadge,{rank:player.rank}),
          h('div',{style:{flex:1,minWidth:0}},
            h('div',{style:{display:'flex',alignItems:'center',gap:6}},
              h('span',{style:{fontSize:13,fontWeight:700,color:player.isUser?'#10b981':'#f0fdf4',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}, player.name),
              player.isUser && h('span',{style:{fontSize:9,fontWeight:800,color:'#fff',background:'#10b981',borderRadius:4,padding:'1px 5px'}},'YOU')
            ),
            h('div',{style:{display:'flex',alignItems:'center',gap:8,marginTop:2}},
              h('span',{style:{fontSize:10,color:'#6b7280'}},'🏏 '+player.drillsDone),
              player.streak>0 && h('span',{style:{fontSize:10,color:'#f59e0b'}},'🔥 '+player.streak)
            )
          ),
          h('div',{style:{fontSize:13,fontWeight:800,color:player.isUser?'#10b981':'#94a3b8',flexShrink:0}}, metricLabel)
        );
      })
    ),

    // Sticky user rank footer
    h('div',{style:{
      position:'fixed',bottom:58,left:0,right:0,padding:'10px 16px',
      background:'rgba(13,17,23,0.97)',backdropFilter:'blur(12px)',
      borderTop:'1px solid rgba(16,185,129,0.2)',display:'flex',alignItems:'center',justifyContent:'space-between'
    }},
      h('div',{style:{fontSize:13,fontWeight:700,color:'#f0fdf4'}}, 'You are #'+userRank+' '+SCOPES.find(function(s){return s.k===scope;}).label.toLowerCase()),
      h('div',{style:{fontSize:12,color:'#10b981',fontWeight:800}}, 'Top '+topPct+'%')
    )
  );
}
A.LeaderboardPage = LeaderboardPage;

console.log('[SC] app-leaderboard ready — Micro-Competition Framework');
})();
