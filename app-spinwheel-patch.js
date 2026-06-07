// app-spinwheel-patch.js v2.0
// ================================================================
// Drop-in replacement for SpinWheelWidget in app-home.js
// ADD this file as a <script> tag BEFORE app-root.js in index.html:
//   <script src="app-spinwheel-patch.js"></script>
//
// This patches window.SC_APP.__SpinWheelWidget so app-root
// picks it up. In app-home.js, replace the SpinWheelWidget
// call in HomePage with: A.__SpinWheelWidget ? h(A.__SpinWheelWidget) : h(SpinWheelWidget)
// OR simply replace the SPIN_PRIZES + SpinWheelWidget function
// in app-home.js directly using the content below.
// ================================================================
// DIRECT REPLACEMENT — paste over the SpinWheelWidget section in app-home.js
// ================================================================

/*
 Replace SPIN_PRIZES and SpinWheelWidget entirely in app-home.js
 with the following:
*/

// Prize table v3.0 — hard mode, max 200 XP, expected ~21 XP/spin

(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var A = window.SC_APP;
var DB = A.DB;

// Hard-mode distribution — expected value ~21 XP/spin
var SPIN_PRIZES = [
  { xp:5,  weight:45,  label:'+5',  color:'#475569', dark:'#1e293b' },
  { xp:10, weight:30,  label:'+10', color:'#3b82f6', dark:'#1d4ed8' },
  { xp:20, weight:18,  label:'+20', color:'#10b981', dark:'#059669' },
  { xp:35, weight:5,   label:'+35', color:'#f59e0b', dark:'#d97706' },
  { xp:50, weight:2,   label:'+50', color:'#ef4444', dark:'#dc2626' },
];

function weightedRandom(prizes) {
  var tot = prizes.reduce(function(s,p){ return s+p.weight; }, 0);
  var r = Math.random() * tot, c = 0;
  for (var i=0; i<prizes.length; i++) { c+=prizes[i].weight; if(r<c) return i; }
  return prizes.length-1;
}

function polarXY(cx,cy,r,deg) {
  var rad = (deg-90)*Math.PI/180;
  return { x: cx+r*Math.cos(rad), y: cy+r*Math.sin(rad) };
}

function buildSegs(prizes) {
  var tot = prizes.reduce(function(s,p){return s+p.weight;},0);
  var segs=[],a=0;
  prizes.forEach(function(p){
    var sw=(p.weight/tot)*360;
    segs.push({startAngle:a,sweep:sw,midAngle:a+sw/2,color:p.color,dark:p.dark,label:p.label,xp:p.xp});
    a+=sw;
  });
  return segs;
}

// ── Full-Screen Wheel Modal ──────────────────────────────────────
function WheelModal(props) {
  var onClose = props.onClose;
  var [spinning, setSpinning] = useState(false);
  var [rotation, setRotation] = useState(0);
  var [result, setResult] = useState(null);
  var [floatWin, setFloatWin] = useState(false);
  var rotRef = useRef(0);
  var segs = buildSegs(SPIN_PRIZES);
  var today = new Date().toISOString().slice(0,10);
  var alreadySpun = DB.get('last_spin_date') === today;
  var savedPrize = DB.get('last_spin_prize') || null;

  var SIZE = Math.min(window.innerWidth - 32, 340);
  var cx = SIZE/2, cy = SIZE/2, r = SIZE/2 - 24;

  function getTargetAngle(idx) {
    var seg = segs[idx];
    var base = rotRef.current % 360;
    return base + (5+Math.floor(Math.random()*3))*360 + (360-seg.midAngle+360)%360;
  }

  function handleSpin() {
    if (spinning || alreadySpun) return;
    var idx = weightedRandom(SPIN_PRIZES);
    var winner = SPIN_PRIZES[idx];
    var final = getTargetAngle(idx);
    var st = rotRef.current, t0=null, dur=3600;
    setSpinning(true); setResult(null);
    function frame(ts) {
      if(!t0) t0=ts;
      var el=ts-t0, prog=Math.min(el/dur,1);
      var eased = prog<0.7 ? prog/0.7 : 1-(1-prog)/(1-0.7)*0.05;
      var smoothEased = 1-Math.pow(1-prog,4);
      var cur = st+(final-st)*smoothEased;
      rotRef.current=cur; setRotation(cur);
      if(prog<1){ requestAnimationFrame(frame); }
      else {
        rotRef.current=final; setRotation(final);
        setSpinning(false); setResult(winner);
        DB.set('last_spin_date',today); DB.set('last_spin_prize',winner);
        if(A.awardXP) A.awardXP(winner.xp,0,'spin_wheel',null,null,false);
        if(winner.xp>=100 && A.fireConfetti) A.fireConfetti();
        setFloatWin(true); setTimeout(function(){setFloatWin(false);},2800);
        window.dispatchEvent(new CustomEvent('sc_update'));
      }
    }
    requestAnimationFrame(frame);
  }

  function timeLeft() {
    var now=new Date(), mn=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    var d=mn-now;
    return Math.floor(d/3600000)+'h '+Math.floor((d%3600000)/60000)+'m';
  }

  return h('div', {
    style:{
      position:'fixed',inset:0,zIndex:9000,
      background:'rgba(0,0,0,0.92)',
      backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      padding:'20px',
    }
  },
    h('style',null,
      '@keyframes floatUp{0%{opacity:1;transform:translateY(0)scale(1)}100%{opacity:0;transform:translateY(-80px)scale(1.6)}}'+
      '@keyframes resultBounce{0%{transform:scale(0.3);opacity:0}60%{transform:scale(1.15)}80%{transform:scale(0.95)}100%{transform:scale(1);opacity:1}}'
    ),
    // Close button
    h('button',{
      onClick:onClose,
      style:{
        position:'absolute',top:16,right:16,width:40,height:40,
        borderRadius:'50%',background:'rgba(255,255,255,0.1)',
        border:'1px solid rgba(255,255,255,0.2)',color:'#fff',
        fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
        fontFamily:'inherit',zIndex:1,
      }
    },'×'),

    // Header
    h('div',{style:{textAlign:'center',marginBottom:16}},
      h('div',{style:{fontSize:13,fontWeight:800,color:'#f59e0b',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:4}},'🎰 Daily Bonus Spin'),
      alreadySpun
        ? h('div',{style:{fontSize:11,color:'#6b7280'}},'Resets in '+timeLeft())
        : h('div',{style:{fontSize:11,color:'#9ca3af'}})
    ),

    // THE WHEEL
    h('div',{style:{position:'relative',width:SIZE,height:SIZE,marginBottom:20}},
      // Pointer arrow (top center)
      h('div',{style:{
        position:'absolute',top:-14,left:'50%',transform:'translateX(-50%)',
        width:0,height:0,
        borderLeft:'10px solid transparent',borderRight:'10px solid transparent',
        borderTop:'26px solid #f59e0b',
        filter:'drop-shadow(0 2px 8px rgba(245,158,11,0.8))',
        zIndex:2,
      }}),

      // Wheel SVG
      h('svg',{
        width:SIZE,height:SIZE,viewBox:'0 0 '+SIZE+' '+SIZE,
        style:{
          display:'block',
          transform:'rotate('+rotation+'deg)',
          transformOrigin:cx+'px '+cy+'px',
          willChange:'transform',
          filter:'drop-shadow(0 0 20px rgba(0,0,0,0.5))',
        }
      },
        // Outer ring
        h('circle',{cx:cx,cy:cy,r:r+8,fill:'rgba(30,37,46,0.8)',stroke:'rgba(255,255,255,0.08)',strokeWidth:2}),
        // Wheel segments
        segs.map(function(seg,i){
          var s=polarXY(cx,cy,r,seg.startAngle);
          var e=polarXY(cx,cy,r,seg.startAngle+seg.sweep);
          var lg=seg.sweep>180?1:0;
          var d='M '+cx+' '+cy+' L '+s.x.toFixed(1)+' '+s.y.toFixed(1)+
              ' A '+r+' '+r+' 0 '+lg+' 1 '+e.x.toFixed(1)+' '+e.y.toFixed(1)+' Z';

          // Label position
          var mid=polarXY(cx,cy,r*0.68,seg.midAngle);
          var labelSize = seg.xp>=1000 ? 14 : seg.xp>=250 ? 11 : 12;

          return h('g',{key:i},
            h('path',{d:d,fill:seg.color,stroke:'rgba(0,0,0,0.25)',strokeWidth:2}),
            // Lighter inner segment overlay for depth
            h('path',{d:d,fill:'rgba(255,255,255,0.04)',stroke:'none'}),
            // XP label
            h('text',{
              x:mid.x,y:mid.y,
              textAnchor:'middle',dominantBaseline:'central',
              fontSize:labelSize,fontWeight:900,fill:'#fff',
              transform:'rotate('+seg.midAngle+','+mid.x+','+mid.y+')',
              style:{userSelect:'none',textShadow:'0 1px 3px rgba(0,0,0,0.8)'},
            },seg.label),
          );
        }),
        // Center hub ring
        h('circle',{cx:cx,cy:cy,r:28,fill:'#060c18',stroke:'rgba(255,215,0,0.6)',strokeWidth:2.5}),
        h('circle',{cx:cx,cy:cy,r:20,fill:'#0d1117',stroke:'rgba(255,255,255,0.08)',strokeWidth:1}),
        // Center Crick face (SVG mini-ball)
        h('circle',{cx:cx,cy:cy-1,r:13,fill:'#b91c1c',stroke:'#7f1d1d',strokeWidth:1}),
        h('ellipse',{cx:cx-5,cy:cy-4,rx:3.5,ry:3.5,fill:'#fff'}),
        h('ellipse',{cx:cx+5,cy:cy-4,rx:3.5,ry:3.5,fill:'#fff'}),
        h('circle',{cx:cx-5,cy:cy-4,r:2,fill:'#1e1b4b'}),
        h('circle',{cx:cx+5,cy:cy-4,r:2,fill:'#1e1b4b'}),
        h('path',{d:'M '+(cx-4)+' '+(cy+2)+' Q '+cx+' '+(cy+6)+' '+(cx+4)+' '+(cy+2),fill:'none',stroke:'#fff',strokeWidth:1.5,strokeLinecap:'round'}),
      ),

      // Float win popup
      floatWin && result && h('div',{style:{
        position:'absolute',top:'20%',left:'50%',transform:'translateX(-50%)',
        fontSize:28,fontWeight:900,color:result.color,
        pointerEvents:'none',
        textShadow:'0 2px 20px '+result.color,
        animation:'floatUp 2.8s ease-out forwards',
        whiteSpace:'nowrap',zIndex:10,
      }},'+'+result.xp+' XP!'),
    ),

    // Result / CTA
    result && !alreadySpun
      ? h('div',{style:{textAlign:'center',animation:'resultBounce 0.5s ease'},role:'status','aria-live':'assertive'},
          h('div',{style:{fontSize:30,fontWeight:900,color:result.color,marginBottom:6}},'+'+result.xp+' XP!'),
          h('div',{style:{fontSize:12,color:'#9ca3af',marginBottom:20}},'Added to your XP! Come back tomorrow.'),
          h('button',{
            onClick:onClose,
            style:{
              padding:'12px 36px',background:result.color,color:'#fff',
              border:'none',borderRadius:12,fontSize:15,fontWeight:800,
              cursor:'pointer',fontFamily:'inherit',
              boxShadow:'0 4px 20px '+result.color+'60',
            }
          },'Collect! ✓')
        )
      : alreadySpun
        ? h('div',{style:{textAlign:'center'}},
            savedPrize && h('div',{style:{fontSize:22,fontWeight:800,color:savedPrize.color,marginBottom:6}},
              'You won +'+savedPrize.xp+' XP today!'),
            h('div',{style:{fontSize:12,color:'#6b7280',marginBottom:16}},'Resets in '+timeLeft()),
            h('button',{onClick:onClose,style:{padding:'10px 28px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,color:'#9ca3af',cursor:'pointer',fontFamily:'inherit',fontSize:13}},
              'Close')
          )
        : h('button',{
            onClick:handleSpin,
            disabled:spinning,
            'aria-label':'Spin the wheel',
            style:{
              padding:'16px 56px',border:'none',borderRadius:14,
              fontFamily:'inherit',fontWeight:900,fontSize:18,
              cursor:spinning?'not-allowed':'pointer',
              background:spinning?'rgba(255,255,255,0.06)':'linear-gradient(135deg,#f59e0b,#ef4444)',
              color:'#fff',
              boxShadow:spinning?'none':'0 6px 28px rgba(245,158,11,0.5)',
              transform:spinning?'scale(0.98)':'scale(1)',
              transition:'all 0.15s',
            }
          }, spinning ? '🌀 Spinning...' : '🎰 SPIN!')
  );
}

// ── Home-page mini widget ────────────────────────────────────────
function SpinWheelWidget() {
  var today = new Date().toISOString().slice(0,10);
  var alreadySpun = DB.get('last_spin_date') === today;
  var savedPrize  = DB.get('last_spin_prize') || null;
  var [open, setOpen] = useState(false);

  function timeLeft() {
    var now=new Date(), mn=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
    var d=mn-now;
    return Math.floor(d/3600000)+'h '+Math.floor((d%3600000)/60000)+'m';
  }

  return h('div',{style:{margin:'0 16px 12px'}},
    h('div',{
      role:'button',tabIndex:0,
      'aria-label':alreadySpun?'Daily spin used':'Tap to spin the daily bonus wheel',
      onClick:function(){setOpen(true);},
      onKeyDown:function(e){if(e.key==='Enter'||e.key===' ')setOpen(true);},
      style:{
        padding:'12px 16px',borderRadius:12,cursor:'pointer',outline:'none',
        background:alreadySpun?'rgba(255,255,255,0.03)':'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))',
        border:'1px solid '+(alreadySpun?'rgba(255,255,255,0.07)':'rgba(245,158,11,0.35)'),
        display:'flex',alignItems:'center',gap:12,
        transition:'border-color 0.2s,background 0.2s',
      }
    },
      h('div',{style:{fontSize:24},'aria-hidden':'true'},alreadySpun?'✅':'🎰'),
      h('div',{style:{flex:1}},
        h('div',{style:{fontSize:13,fontWeight:700,color:alreadySpun?'#6b7280':'#e5e7eb'}},
          alreadySpun?'Daily Spin Used':'Daily Bonus Spin — Tap to Play!'),
        h('div',{style:{fontSize:11,color:'#6b7280',marginTop:2}},
          alreadySpun
            ? (savedPrize?'Won +'+savedPrize.xp+' XP  ·  Resets in '+timeLeft():'Resets in '+timeLeft())
            : 'Spin once a day — win 5 to 50 bonus XP')
      ),
      !alreadySpun && h('span',{style:{fontSize:13,fontWeight:700,color:'#f59e0b',flexShrink:0}},'SPIN →')
    ),
    open && h(WheelModal, { onClose: function(){setOpen(false);} })
  );
}

// Patch into SC_APP so app-home.js can use it
A.SpinWheelWidget = SpinWheelWidget;
console.log('[SC] app-spinwheel-patch v2.0 — fixed weights + fullscreen modal ready');
})();
