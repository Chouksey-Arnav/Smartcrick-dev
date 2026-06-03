// app-card-pack.js — Variable Reward Engine (Phase 5)
// Staggered card-flip reveals with haptic feedback and rarity tiers
(function() {
'use strict';
var A = window.SC_APP;
var h = A.h;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;

// ── Card Pack Service ─────────────────────────────────────────────
A.CardPackService = (function() {
  var PACK_TYPES = {
    drill_5:      {title:'Training Pack',  emoji:'📦', cards:2},
    level_up:     {title:'Level Pack',     emoji:'⭐', cards:3},
    week_done:    {title:'Week Pack',      emoji:'🏆', cards:3},
    challenge_30: {title:'Champion Pack',  emoji:'💎', cards:5},
  };

  var CARD_POOL = [
    {type:'xp',           weight:40},
    {type:'badge',        weight:20},
    {type:'pro_tip',      weight:25},
    {type:'drill_unlock', weight:10},
    {type:'rare_xp',      weight:5},
  ];

  function _weightedPick(pool) {
    var tot = pool.reduce(function(s,c){return s+c.weight;},0);
    var r = Math.random() * tot, acc = 0;
    for (var i=0;i<pool.length;i++){acc+=pool[i].weight;if(r<acc)return pool[i];}
    return pool[pool.length-1];
  }

  function _generateCard(type) {
    if (type==='xp') {
      var xpVals=[25,50,75,100,150,200];
      return {type:'xp',xp:xpVals[Math.floor(Math.random()*xpVals.length)],label:'XP Bonus',rarity:'common'};
    }
    if (type==='rare_xp') {
      return {type:'xp',xp:500,label:'Rare XP Blast!',rarity:'rare'};
    }
    if (type==='pro_tip') {
      var db=(window.SC_APP&&window.SC_APP.CRICKETERS_DB)||[];
      var c=db[Math.floor(Math.random()*db.length)];
      return {type:'pro_tip',cricketerName:c?c.name:'Pro',tip:c?c.tip:'',label:'Pro Tip',rarity:'uncommon'};
    }
    if (type==='badge') {
      var p=(window.SC_APP&&window.SC_APP.DB)?window.SC_APP.DB.getProgress():{badges:[]};
      var earned=p.badges||[];
      var all=Object.keys((window.SC_APP&&window.SC_APP.BADGE_DEFS)||{});
      var unearned=all.filter(function(id){return earned.indexOf(id)===-1;});
      if (!unearned.length) return _generateCard('xp');
      var id=unearned[Math.floor(Math.random()*unearned.length)];
      var def=(window.SC_APP.BADGE_DEFS||{})[id]||{};
      return {type:'badge',badgeId:id,label:def.label||'Badge',desc:def.desc||'',rarity:'uncommon'};
    }
    if (type==='drill_unlock') {
      var drills=(window.SC_APP&&window.SC_APP.DRILLS)||[];
      var dp=(window.SC_APP&&window.SC_APP.DB)?window.SC_APP.DB.getDrillProgress():{};
      var untried=drills.filter(function(d){return !dp[d.id];});
      var pick=untried.length?untried[Math.floor(Math.random()*untried.length)]:(drills[0]||null);
      return {type:'drill_unlock',drillId:pick?pick.id:null,drillName:pick?pick.name:'',label:'Drill Spotlight',rarity:'common'};
    }
    return {type:'xp',xp:25,label:'XP Bonus',rarity:'common'};
  }

  function generatePack(triggerType) {
    var packDef=PACK_TYPES[triggerType]||PACK_TYPES.drill_5;
    var cards=[];
    for (var i=0;i<packDef.cards;i++) {
      var cardType=_weightedPick(CARD_POOL).type;
      cards.push(_generateCard(cardType));
    }
    return {packDef:packDef, cards:cards, triggerType:triggerType};
  }

  function awardCardContents(pack) {
    if (!pack||!pack.cards) return;
    pack.cards.forEach(function(card) {
      if (card.type==='xp'&&card.xp&&window.SC_APP&&window.SC_APP.awardXP) {
        window.SC_APP.awardXP(card.xp, 0, 'card_pack');
      }
      if (card.type==='badge'&&card.badgeId&&window.SC_APP&&window.SC_APP.DB) {
        var p=window.SC_APP.DB.getProgress();
        p.badges=p.badges||[];
        if (p.badges.indexOf(card.badgeId)===-1) {
          p.badges.push(card.badgeId);
          window.SC_APP.DB.saveProgress(p);
          window.dispatchEvent(new CustomEvent('sc_badge_unlock',{detail:{ids:[card.badgeId]}}));
        }
      }
    });
  }

  var _pendingPack = null;
  var _packListeners = [];

  function triggerPack(triggerType) {
    _pendingPack = generatePack(triggerType);
    _packListeners.forEach(function(fn){try{fn(_pendingPack);}catch(e){}});
  }

  function onPack(fn)  { _packListeners.push(fn); }
  function offPack(fn) { _packListeners=_packListeners.filter(function(f){return f!==fn;}); }
  function consumePack() { var p=_pendingPack; _pendingPack=null; return p; }

  return {generatePack:generatePack, awardCardContents:awardCardContents, triggerPack:triggerPack, onPack:onPack, offPack:offPack, consumePack:consumePack};
})();

// ── Card Pack Reveal Overlay ──────────────────────────────────────
function CardPackRevealOverlay() {
  var [pack, setPack] = useState(null);
  var [revealed, setRevealed] = useState([]);
  var [claimed, setClaimed] = useState(false);
  var [showClaim, setShowClaim] = useState(false);
  var cardRefs = useRef([]);

  // Inject CSS once
  useEffect(function() {
    var sid = 'sc-cardpack-style';
    if (!document.getElementById(sid)) {
      var el = document.createElement('style'); el.id = sid;
      el.textContent = [
        '.sc-card-wrap{perspective:600px}',
        '.sc-card-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.5s}',
        '.sc-card-inner.flipped{transform:rotateY(180deg)}',
        '.sc-card-face{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px}',
        '.sc-card-back{transform:rotateY(180deg)}',
        '@keyframes sc_cardpop{0%{transform:scale(0.6) rotateY(180deg)}100%{transform:scale(1) rotateY(180deg)}}',
        '.sc-card-inner.flipped{animation:sc_cardpop 0.45s cubic-bezier(0.34,1.56,0.64,1)}',
        '@keyframes sc_pack_in{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}',
        '.sc-pack-anim{animation:sc_pack_in 0.3s ease forwards}',
      ].join('\n');
      document.head.appendChild(el);
    }
  }, []);

  // Subscribe to pack service
  useEffect(function() {
    if (!A.CardPackService) return;
    function onPack(p) {
      setPack(p); setRevealed([]); setClaimed(false); setShowClaim(false);
      cardRefs.current = [];
    }
    A.CardPackService.onPack(onPack);
    return function(){ A.CardPackService.offPack(onPack); };
  }, []);

  // Close on navigation
  useEffect(function() {
    function onNav(){ setPack(null); }
    window.addEventListener('hashchange', onNav);
    return function(){ window.removeEventListener('hashchange', onNav); };
  }, []);

  // Staggered reveal when pack is set
  useEffect(function() {
    if (!pack) return;
    pack.cards.forEach(function(card, i) {
      setTimeout(function() {
        setRevealed(function(prev){ return prev.concat([i]); });
        if (navigator.vibrate) navigator.vibrate([50,30,50]);
        if (card.rarity==='rare') {
          if (navigator.vibrate) navigator.vibrate([200]);
          if (A.fireConfetti) A.fireConfetti();
          if (A.Emotion && cardRefs.current[i]) {
            try { A.Emotion.fireSparkleSVG(cardRefs.current[i], {color:'#fbbf24',count:12}); } catch(e) {}
          }
        } else if (A.Emotion && cardRefs.current[i]) {
          try { A.Emotion.fireSparkleSVG(cardRefs.current[i], {color:'#4ade80',count:8}); } catch(e) {}
        }
      }, (i+1) * 500);
    });
    var total = pack.cards.length;
    setTimeout(function(){ setShowClaim(true); }, total * 500 + 800);
  }, [pack]);

  function handleClaim() {
    if (!pack) return;
    A.CardPackService.awardCardContents(pack);
    setClaimed(true);
    setTimeout(function(){ setPack(null); }, 600);
  }

  if (!pack) return null;

  var RARITY_STYLES = {
    common:   {bg:'linear-gradient(135deg,#1a2a1a,#0f2d16)',border:'rgba(16,185,129,0.4)',glow:''},
    uncommon: {bg:'linear-gradient(135deg,#1a1a2a,#0f1628)',border:'rgba(139,92,246,0.5)',glow:'0 0 16px rgba(139,92,246,0.3)'},
    rare:     {bg:'linear-gradient(135deg,#2a1a00,#1a0f00)',border:'rgba(251,191,36,0.6)',glow:'0 0 24px rgba(251,191,36,0.5)'},
  };

  function CardFaceBack(card) {
    var rs = RARITY_STYLES[card.rarity] || RARITY_STYLES.common;
    var emoji = card.type==='xp'?'⚡':card.type==='badge'?'🏅':card.type==='pro_tip'?'🏏':card.type==='drill_unlock'?'🎯':'✨';
    return h('div', {
      className:'sc-card-face sc-card-back',
      style:{background:rs.bg, border:'2px solid '+rs.border, boxShadow:rs.glow,
        display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:12,gap:6}
    },
      h('div',{style:{fontSize:28}}, emoji),
      h('div',{style:{fontSize:13,fontWeight:800,color:'#f0fdf4',textAlign:'center'}}, card.label),
      card.type==='xp' && h('div',{style:{fontSize:22,fontWeight:900,color:card.rarity==='rare'?'#fbbf24':'#10b981'}},'+'+card.xp+' XP'),
      card.type==='pro_tip' && h('div',{style:{fontSize:10,color:'#94a3b8',textAlign:'center',lineHeight:1.4,marginTop:2}},
        h('div',{style:{fontWeight:700,color:'#a78bfa',marginBottom:2}},card.cricketerName),
        h('div',{style:{fontStyle:'italic'}},'"'+(card.tip||'Train smart.')+'\"')
      ),
      card.type==='badge' && h('div',{style:{fontSize:10,color:'#94a3b8',textAlign:'center'}},card.desc||card.label),
      card.type==='drill_unlock' && h('div',{style:{fontSize:10,color:'#94a3b8',textAlign:'center'}},card.drillName||'New Drill'),
      card.rarity==='rare' && h('div',{style:{fontSize:9,fontWeight:800,color:'#fbbf24',letterSpacing:2,marginTop:4}},'✦ RARE ✦')
    );
  }

  return h('div',{
    style:{position:'fixed',inset:0,zIndex:9998,background:'rgba(0,0,0,0.88)',backdropFilter:'blur(8px)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}
  },
    h('div',{className:'sc-pack-anim',style:{display:'flex',flexDirection:'column',alignItems:'center',gap:20,width:'100%',maxWidth:360}},
      h('div',{style:{textAlign:'center'}},
        h('div',{style:{fontSize:40,marginBottom:4}},pack.packDef.emoji),
        h('div',{style:{fontSize:20,fontWeight:900,color:'#f0fdf4'}},pack.packDef.title),
        h('div',{style:{fontSize:12,color:'#6b7280'}},pack.cards.length+' cards inside')
      ),
      h('div',{style:{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}},
        pack.cards.map(function(card,i) {
          var isFlipped = revealed.indexOf(i) !== -1;
          return h('div',{key:i, className:'sc-card-wrap',
            ref:function(el){cardRefs.current[i]=el;},
            style:{width:100,height:140,flexShrink:0}
          },
            h('div',{className:'sc-card-inner'+(isFlipped?' flipped':'')},
              // Front face (unrevealed back-of-card)
              h('div',{className:'sc-card-face',
                style:{background:'linear-gradient(135deg,#161b22,#1f2937)',border:'2px solid rgba(245,158,11,0.4)',
                  display:'flex',alignItems:'center',justifyContent:'center'}},
                h('div',{style:{fontSize:28,opacity:0.4}},'🏏')
              ),
              // Back face (revealed card content)
              CardFaceBack(card)
            )
          );
        })
      ),
      showClaim && !claimed && h('button',{
        onClick:handleClaim,
        style:{padding:'14px 32px',background:'linear-gradient(135deg,#10b981,#059669)',color:'#fff',border:'none',
          borderRadius:12,fontWeight:900,fontSize:16,cursor:'pointer',letterSpacing:0.5,
          boxShadow:'0 4px 20px rgba(16,185,129,0.4)'}
      },'Claim All Rewards'),
      claimed && h('div',{style:{fontSize:14,fontWeight:700,color:'#10b981'}},'Rewards claimed! 🎉')
    )
  );
}
A.CardPackRevealOverlay = CardPackRevealOverlay;

// ── Card pack milestone trigger for drills ────────────────────────
// Called by app-drills.js after every drill XP award
A.trackDrillForCardPack = function() {
  var today = new Date().toISOString().slice(0, 10);
  var key = 'session_drill_count_' + today;
  var prev = (A.DB && A.DB.get(key)) || 0;
  if (A.DB) A.DB.set(key, prev + 1);
  if ((prev + 1) % 5 === 0 && A.CardPackService) {
    A.CardPackService.triggerPack('drill_5');
  }
};

console.log('[SC] app-card-pack ready — Variable Reward Engine');
})();
