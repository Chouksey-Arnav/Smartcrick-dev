// app-mental-player-v4.js
// ================================================================
// SmartCrick — Mental Session Player v4.1
// Visual upgrades:
//   - GroundViz: 240px canvas, double particle orbit, outer aurora rings,
//     radial glow background, CSS drop-shadow
//   - BreathViz: 220px canvas, outer pulsing halo, breath-synced glow
//   - ActivateViz: outer corona burst rings, larger canvas
//   - All viz types wrapped in CSS drop-shadow for halo glow
//   - Active player: radial gradient background behind orb
// ================================================================
(function() {
'use strict';
var h        = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A = window.SC_APP;
var DB = A.DB;

function fmt(s) {
  return Math.floor(s/60) + ':' + (s%60 < 10 ? '0' : '') + (s%60|0);
}

function sig(slug) {
  var h = 5381, s = slug || 'default';
  for (var i = 0; i < s.length; i++) h = ((h<<5)+h) ^ s.charCodeAt(i), h = h>>>0;
  return {
    speed:     0.45 + (h % 90) / 100,
    particles: 4 + (h % 5),
    orbR:      52 + (h % 18),
    hue:       (h % 40) - 20,
    wave:      8 + (h % 16),
    freq:      2.2 + (h % 8) * 0.2,
    typeSpeed: 22 + (h % 20),
  };
}

function useRAF(cb, active) {
  var r = useRef(null), fn = useRef(cb);
  fn.current = cb;
  useEffect(function() {
    if (!active) { r.current && cancelAnimationFrame(r.current); return; }
    var last = null;
    function tick(t) { if(last) fn.current(t-last); last=t; r.current=requestAnimationFrame(tick); }
    r.current = requestAnimationFrame(tick);
    return function() { r.current && cancelAnimationFrame(r.current); };
  }, [active]);
}

// ── Visual type preview (pre-start card) ──────────────────────────
function TypeIcon(props) {
  var type = props.type, color = props.color, size = props.size || 48;
  var c = size/2;
  if (type === 'BREATH') return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('circle',{cx:c,cy:c,r:c*0.65,fill:'none',stroke:color,strokeWidth:2,opacity:0.8}),
    h('circle',{cx:c,cy:c,r:c*0.35,fill:color,opacity:0.3})
  );
  if (type === 'VISUALIZE') return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('circle',{cx:c,cy:c,r:3,fill:color,opacity:0.7}),
    h('circle',{cx:c*0.4,cy:c*0.5,r:1.5,fill:color,opacity:0.35}),
    h('circle',{cx:c*1.6,cy:c*0.6,r:2,fill:color,opacity:0.5}),
    h('circle',{cx:c*0.6,cy:c*1.5,r:1,fill:color,opacity:0.25}),
    h('circle',{cx:c*1.5,cy:c*1.4,r:1.5,fill:color,opacity:0.4})
  );
  if (type === 'ACTIVATE') return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('polygon',{points:c+',6 '+(c+10)+','+(c+4)+' '+(c+2)+','+c+' '+(c+12)+','+(size-6)+' '+(c-10)+','+(c-2)+' '+(c-2)+','+(c)+' '+(c-12)+',6',fill:color,opacity:0.7})
  );
  if (type === 'RECOVER') return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('path',{d:'M0 '+c+' Q'+c/2+' '+(c-10)+' '+c+' '+c+' Q'+(c*1.5)+' '+(c+10)+' '+size+' '+c,fill:'none',stroke:color,strokeWidth:2,opacity:0.7})
  );
  if (type === 'REFLECT') return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('text',{x:c,y:c+2,textAnchor:'middle',dominantBaseline:'central',fontSize:size*0.55,fill:color,opacity:0.75,fontFamily:'serif'},'?')
  );
  if (type === 'PRESSURE') return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('circle',{cx:c,cy:c,r:c*0.8,fill:'none',stroke:color,strokeWidth:1.5,opacity:0.5}),
    h('circle',{cx:c,cy:c,r:c*0.5,fill:'none',stroke:color,strokeWidth:1.5,opacity:0.7}),
    h('circle',{cx:c,cy:c,r:c*0.25,fill:color,opacity:0.8})
  );
  return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('circle',{cx:c,cy:c,r:c*0.7,fill:color,opacity:0.2}),
    h('circle',{cx:c,cy:c,r:c*0.7,fill:'none',stroke:color,strokeWidth:1.5,opacity:0.8}),
    h('circle',{cx:c,cy:c,r:3,fill:color,opacity:0.9})
  );
}

// ── BREATH renderer ───────────────────────────────────────────────
function BreathViz(props) {
  var pat = props.pattern || {inhale:4,exhale:6}, color = props.color, glow = props.glow || '22,163,74', active = props.active;
  var [ph, setPh] = useState('inhale');
  var [cnt, setCnt] = useState(pat.inhale||4);
  var [prog, setProg] = useState(0);
  var [cyc, setCyc] = useState(0);
  var t = useRef(0), pi = useRef(0);
  var maxC = props.totalCycles || 6;
  var order = ['inhale'];
  if ((pat.inhale2||0)>0) order.push('inhale2');
  if ((pat.hold||0)>0)    order.push('hold');
  order.push('exhale');
  if ((pat.holdOut||0)>0) order.push('holdOut');
  var durs = { inhale:(pat.inhale||4)*1000, inhale2:(pat.inhale2||0)*1000,
    hold:(pat.hold||0)*1000, exhale:(pat.exhale||6)*1000, holdOut:(pat.holdOut||0)*1000 };

  useRAF(function(dt) {
    if (!active || cyc >= maxC) return;
    t.current += dt;
    var cur = order[pi.current], dur = Math.max(1, durs[cur]||4000);
    var p = Math.min(1, t.current/dur);
    setProg(p);
    setCnt(Math.max(1, Math.ceil((dur-t.current)/1000)));
    if (t.current >= dur) {
      t.current = 0;
      pi.current = (pi.current+1) % order.length;
      var nxt = order[pi.current];
      setPh(nxt);
      if (pi.current === 0) setCyc(function(c){return c+1;});
    } else { setPh(cur); }
  }, active);

  var exp = (ph==='inhale'||ph==='inhale2'||ph==='hold');
  var cx=110, cy=110;
  var minR=44, maxR=82;
  var r = ph==='inhale'?minR+(maxR-minR)*prog:ph==='inhale2'?minR+(maxR-minR)*prog:ph==='hold'?maxR:ph==='holdOut'?minR:maxR-(maxR-minR)*prog;
  var gO = exp ? 0.28+0.22*prog : 0.08;
  var label = {inhale:'Inhale',inhale2:'Again',hold:'Hold',exhale:'Exhale',holdOut:'Hold'}[ph]||ph;

  return h('div', {style:{display:'flex',flexDirection:'column',alignItems:'center',gap:14}},
    h('div', {style:{
      position:'relative', width:220, height:220,
      filter:'drop-shadow(0 0 28px rgba('+glow+','+(0.25+gO*0.5)+'))',
    }},
      h('svg', {width:220,height:220,viewBox:'0 0 220 220',style:{overflow:'visible'}},
        // Outer aurora halo — pulses gently
        h('circle',{cx:cx,cy:cy,r:r+42,fill:'none',stroke:color,strokeWidth:0.6,opacity:gO*0.25}),
        h('circle',{cx:cx,cy:cy,r:r+30,fill:'none',stroke:color,strokeWidth:1,opacity:gO*0.4}),
        h('circle',{cx:cx,cy:cy,r:r+18,fill:color,opacity:gO*0.07}),
        h('circle',{cx:cx,cy:cy,r:r+18,fill:'none',stroke:color,strokeWidth:1.5,opacity:gO*0.55}),
        // Main breath circle
        h('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:color,strokeWidth:3,opacity:0.9}),
        h('circle',{cx:cx,cy:cy,r:Math.max(0,r-2),fill:color,opacity:gO*0.38}),
        // Inner core
        h('circle',{cx:cx,cy:cy,r:r*0.45,fill:color,opacity:gO*0.25}),
        h('text',{x:cx,y:cy+1,textAnchor:'middle',dominantBaseline:'central',
          fontSize:26,fontWeight:700,fill:'#f0fdf4',fontFamily:'inherit'},cnt)
      )
    ),
    h('div',{style:{fontSize:13,fontWeight:700,color:color,letterSpacing:'0.12em',textTransform:'uppercase'}}),
    h('div',{style:{fontSize:12,color:color,letterSpacing:'0.12em',textTransform:'uppercase',fontWeight:700}},label),
    h('div',{style:{fontSize:11,color:'#374151',marginTop:4}},cyc+' / '+maxC+' cycles')
  );
}

// ── GROUND renderer — redesigned halo ────────────────────────────
function GroundViz(props) {
  var color = props.color, glow = props.glow || '22,163,74', active = props.active, sg = props.sig || {};
  var [t, setT] = useState(0);
  var tr = useRef(0);
  useRAF(function(dt){ if(!active)return; tr.current+=dt; setT(tr.current/1000); }, active);

  var speed = sg.speed || 0.65;
  var nP    = sg.particles || 6;
  var orbR  = sg.orbR || 60;

  // Three independent pulse waves for organic feel
  var pulse1 = (Math.sin(t * speed) + 1) / 2;
  var pulse2 = (Math.sin(t * speed * 1.4 + 1.6) + 1) / 2;
  var pulse3 = (Math.sin(t * speed * 0.65 + 3.2) + 1) / 2;

  var angFwd = t * 22;   // forward orbit
  var angRev = -t * 14;  // reverse outer orbit
  var cx = 120, cy = 120;

  // Inner orbit
  var innerParticles = Array.from({length: nP}, function(_, i) {
    var a = (angFwd + i * 360 / nP) * Math.PI / 180;
    var pr = orbR + 26;
    return { x: cx + Math.cos(a)*pr, y: cy + Math.sin(a)*pr, r: 2.5 + (i%2), o: 0.35 + pulse1*0.45*(i%2?1:0.6) };
  });

  // Outer slow reverse orbit
  var outerParticles = Array.from({length: nP-1}, function(_, i) {
    var a = (angRev + i * 360 / (nP-1) + 28) * Math.PI / 180;
    var pr = orbR + 54;
    return { x: cx + Math.cos(a)*pr, y: cy + Math.sin(a)*pr, r: 1.5 + (i%2)*0.5, o: 0.14 + pulse3*0.22 };
  });

  return h('div', {style:{
    position:'relative', width:240, height:240,
    filter:'drop-shadow(0 0 32px rgba('+glow+','+(0.3+pulse1*0.25)+')',
  }},
    // Background radial glow
    h('div',{style:{
      position:'absolute', inset:0, borderRadius:'50%',
      background:'radial-gradient(ellipse at center, rgba('+glow+',0.16) 0%, transparent 70%)',
    }}),
    h('svg',{width:240,height:240,viewBox:'0 0 240 240',style:{overflow:'visible',position:'relative'}},
      // Outermost sparse dashed aurora
      h('circle',{cx:cx,cy:cy,r:orbR+76, fill:'none',stroke:color,strokeWidth:0.5,opacity:0.04+pulse3*0.06,strokeDasharray:'4 10'}),
      // Outer halo ring
      h('circle',{cx:cx,cy:cy,r:orbR+62, fill:'none',stroke:color,strokeWidth:0.8,opacity:0.07+pulse2*0.1}),
      // Outer glow fill
      h('circle',{cx:cx,cy:cy,r:orbR+52, fill:color, opacity:0.025+pulse1*0.035}),
      // Mid halo rings
      h('circle',{cx:cx,cy:cy,r:orbR+38, fill:'none',stroke:color,strokeWidth:1.2,opacity:0.13+pulse1*0.13}),
      h('circle',{cx:cx,cy:cy,r:orbR+24, fill:'none',stroke:color,strokeWidth:1.8,opacity:0.22+pulse2*0.16}),
      // Outer reverse particles
      outerParticles.map(function(p,i){ return h('circle',{key:'op'+i,cx:p.x,cy:p.y,r:p.r,fill:color,opacity:p.o}); }),
      // Inner forward particles
      innerParticles.map(function(p,i){ return h('circle',{key:'ip'+i,cx:p.x,cy:p.y,r:p.r,fill:color,opacity:p.o}); }),
      // Orb glow fill
      h('circle',{cx:cx,cy:cy,r:orbR+10, fill:color, opacity:0.09+pulse1*0.1}),
      // Orb body
      h('circle',{cx:cx,cy:cy,r:orbR, fill:color, opacity:0.2+pulse1*0.12}),
      h('circle',{cx:cx,cy:cy,r:orbR, fill:'none',stroke:color,strokeWidth:2.5,opacity:0.88+pulse1*0.12}),
      // Inner glow layers
      h('circle',{cx:cx,cy:cy,r:orbR*0.62, fill:color, opacity:0.14+pulse2*0.12}),
      h('circle',{cx:cx,cy:cy,r:orbR*0.32, fill:color, opacity:0.22+pulse1*0.2}),
      // Central light — breathes with pulse
      h('circle',{cx:cx,cy:cy,r:5+pulse1*4, fill:'#fff', opacity:0.55+pulse1*0.35})
    )
  );
}

// ── VISUALIZE renderer ────────────────────────────────────────────
function VisualizeViz(props) {
  var text = props.text||'', active = props.active, color = props.color, glow = props.glow || '22,163,74';
  var sentences = text.split(/(?<=[.!?…])\s+/).filter(Boolean);
  var [idx, setIdx] = useState(0), [vis, setVis] = useState(true);
  var tmr = useRef(null);
  useEffect(function(){
    if(!active||!sentences.length)return;
    var dur = Math.max(5500,Math.min(9000,props.dur?(props.dur*1000/sentences.length):6500));
    function go(){ setVis(false); tmr.current=setTimeout(function(){setIdx(function(i){return(i+1)%sentences.length;});setVis(true);},800); }
    tmr.current = setInterval(go,dur);
    return function(){clearInterval(tmr.current);clearTimeout(tmr.current);};
  },[active,text]);

  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:20}},
    h('div',{style:{filter:'drop-shadow(0 0 20px rgba('+glow+',0.45))'}},
      h('svg',{width:110,height:110,viewBox:'0 0 110 110'},
        [0,1,2,3,4,5,6].map(function(i){
          return h('circle',{key:i,cx:(15+i*12)+'%',cy:(20+i*9)+'%',r:1+i%2,fill:color,opacity:0.12+i*0.06});
        }),
        h('circle',{cx:55,cy:55,r:36,fill:'none',stroke:color,strokeWidth:1,opacity:0.22}),
        h('circle',{cx:55,cy:55,r:22,fill:'none',stroke:color,strokeWidth:0.6,opacity:0.14}),
        h('circle',{cx:55,cy:55,r:5,fill:color,opacity:0.6})
      )
    ),
    h('div',{style:{opacity:vis?1:0,transition:'opacity 0.9s ease',textAlign:'center',
      padding:'0 20px',maxWidth:320,minHeight:80,display:'flex',alignItems:'center',justifyContent:'center'}},
      h('p',{style:{fontSize:15,color:'#e0f2fe',lineHeight:1.9,fontStyle:'italic',margin:0,
        textShadow:'0 0 30px rgba('+glow+',0.3)'}},sentences[idx]||'')
    )
  );
}

// ── ACTIVATE renderer ──────────────────────────────────────────────
function ActivateViz(props) {
  var color = props.color, glow = props.glow || '22,163,74', active = props.active, prog = props.prog||0;
  var [t,setT]=useState(0); var tr=useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);
  var speed=0.6+prog*1.8, pulse=Math.max(0,Math.sin(t*speed))*0.5+0.5;
  var orbR=50+prog*28, cx=120, cy=120;
  var rings=[1,2,3,4].filter(function(i){return prog>i*0.18;}).map(function(i){
    return {r:orbR+22+i*18, o:(prog-i*0.18)*0.3*(0.5+pulse*0.5)};
  });
  return h('div',{style:{filter:'drop-shadow(0 0 30px rgba('+glow+','+(0.25+prog*0.3)+'))'}},
    h('svg',{width:240,height:240,viewBox:'0 0 240 240',style:{overflow:'visible'}},
      rings.map(function(rg,i){return h('circle',{key:i,cx:cx,cy:cy,r:rg.r,fill:'none',stroke:color,strokeWidth:0.6+i*0.3,opacity:rg.o});}),
      h('circle',{cx:cx,cy:cy,r:orbR+16,fill:color,opacity:(0.08+prog*0.24+pulse*0.08)*0.6}),
      h('circle',{cx:cx,cy:cy,r:orbR,fill:color,opacity:0.12+prog*0.24+pulse*0.07}),
      h('circle',{cx:cx,cy:cy,r:orbR,fill:'none',stroke:color,strokeWidth:3,opacity:0.45+prog*0.55}),
      h('circle',{cx:cx,cy:cy,r:orbR*0.55,fill:color,opacity:0.14+prog*0.22+pulse*0.09}),
      h('circle',{cx:cx,cy:cy,r:7+pulse*4,fill:'#fff',opacity:0.5+prog*0.5})
    )
  );
}

// ── RECOVER renderer ───────────────────────────────────────────────
function RecoverViz(props) {
  var color = props.color, glow = props.glow || '22,163,74', active = props.active, sg = props.sg||{};
  var [t,setT]=useState(0); var tr=useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);
  var amp=sg.wave||12, freq=sg.freq||2.5;
  var W=220,H=90;
  var pts=[], pts2=[];
  for(var x=0;x<=W;x+=4){
    pts.push(x+','+(H/2+Math.sin(x/W*Math.PI*freq+t*0.35)*amp+Math.sin(x/W*Math.PI*(freq*1.7)+t*0.6)*amp*0.4).toFixed(1));
    pts2.push(x+','+(H/2+Math.sin(x/W*Math.PI*freq+t*0.35+1.2)*amp*0.7+Math.sin(x/W*Math.PI*(freq*1.3)+t*0.45+2)*amp*0.3).toFixed(1));
  }
  var path1='M'+pts.join('L'), path2='M'+pts2.join('L');
  return h('div',{style:{filter:'drop-shadow(0 0 16px rgba('+glow+',0.35))'}},
    h('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H,style:{overflow:'visible'}},
      h('path',{d:path1,fill:'none',stroke:color,strokeWidth:2.5,opacity:0.65}),
      h('path',{d:path2,fill:'none',stroke:color,strokeWidth:1.5,opacity:0.32}),
      h('path',{d:path1+'L'+W+','+H+'L0,'+H+'Z',fill:color,opacity:0.06})
    )
  );
}

// ── REFLECT renderer ───────────────────────────────────────────────
function ReflectViz(props) {
  var text=props.text||'', active=props.active, sg=props.sig||{}, glow=props.glow||'217,119,6';
  var lines=(text||'').split(/\n+/).filter(Boolean);
  var [disp,setDisp]=useState(''), [si,setSi]=useState(0), [ci,setCi]=useState(0);
  var tmr=useRef(null);
  useEffect(function(){if(!active)return;setDisp('');setSi(0);setCi(0);},[text,active]);
  useEffect(function(){
    if(!active)return;
    var s=lines[si]||'';
    if(ci<s.length){ tmr.current=setTimeout(function(){setDisp(function(d){return d+s[ci];});setCi(function(c){return c+1;});},(sg.typeSpeed||32)); }
    else if(si<lines.length-1){ tmr.current=setTimeout(function(){setDisp(function(d){return d+'\n';});setSi(function(x){return x+1;});setCi(0);},1900); }
    return function(){clearTimeout(tmr.current);};
  },[active,si,ci,text]);
  var color='#d97706';
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:20}},
    h('div',{style:{filter:'drop-shadow(0 0 18px rgba('+glow+',0.4))'}},
      h('svg',{width:90,height:90,viewBox:'0 0 90 90'},
        h('circle',{cx:45,cy:45,r:35,fill:'none',stroke:color,strokeWidth:1,opacity:0.3}),
        h('circle',{cx:45,cy:45,r:22,fill:'none',stroke:color,strokeWidth:0.6,opacity:0.18}),
        h('text',{x:45,y:45,textAnchor:'middle',dominantBaseline:'central',fontSize:28,fill:color,opacity:0.7,fontFamily:'serif'},'?')
      )
    ),
    h('div',{style:{textAlign:'center',padding:'0 20px',maxWidth:320,minHeight:80}},
      h('p',{style:{fontSize:15,color:'#fbbf24',lineHeight:1.9,fontStyle:'italic',margin:0,whiteSpace:'pre-line'}},
        disp,
        active&&ci<=(lines[si]||'').length&&h('span',{style:{borderRight:'2px solid #d97706',marginLeft:1,opacity:0.75}},'​')
      )
    )
  );
}

// ── PRESSURE renderer ──────────────────────────────────────────────
function PressureViz(props) {
  var active=props.active, prog=props.prog||0, glow=props.glow||'13,148,136';
  var [t,setT]=useState(0); var tr=useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);
  var speed=0.8+prog*3.5, pulse=Math.max(0,Math.sin(t*speed));
  var ri=Math.round(13+(220-13)*prog), gi=Math.round(148+(38-148)*prog), bi=Math.round(136+(38-136)*prog);
  var color='rgb('+ri+','+gi+','+bi+')';
  var orbR=56+pulse*(10+prog*22), cx=120,cy=120;
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:12}},
    h('div',{style:{filter:'drop-shadow(0 0 24px rgba('+ri+','+gi+','+bi+','+(0.2+prog*0.4)+'))'}},
      h('svg',{width:240,height:240,viewBox:'0 0 240 240',style:{overflow:'visible'}},
        h('circle',{cx:cx,cy:cy,r:orbR+22,fill:color,opacity:0.04+pulse*0.06}),
        h('circle',{cx:cx,cy:cy,r:orbR+10,fill:'none',stroke:color,strokeWidth:1,opacity:0.15+pulse*0.15}),
        h('circle',{cx:cx,cy:cy,r:orbR,fill:'none',stroke:color,strokeWidth:3,opacity:0.5+pulse*0.5}),
        h('circle',{cx:cx,cy:cy,r:orbR-14,fill:color,opacity:0.07+prog*0.1+pulse*0.07}),
        h('circle',{cx:cx,cy:cy,r:9+pulse*6,fill:color,opacity:0.75+pulse*0.25})
      )
    ),
    prog>0.45&&h('div',{style:{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:color,opacity:0.7+prog*0.3,display:'inline-flex',alignItems:'center',gap:5}},
      prog>0.82?[A.Icon&&h(A.Icon,{key:'i',n:'zap',cls:'',style:{width:12,height:12,color:color}}),'Peak pressure']:prog>0.6?'Pressure building':'Rising')
  );
}

// ── Phase text with staggered fade ────────────────────────────────
function PhaseText(props) {
  var text=props.text||'', color=props.color;
  var [vis,setVis]=useState(false);
  useEffect(function(){setVis(false);var t=setTimeout(function(){setVis(true);},60);return function(){clearTimeout(t);};},[text]);
  var lines=text.split(/\n/).filter(function(l){return l.trim();});
  return h('div',{style:{opacity:vis?1:0,transition:'opacity 1s ease',textAlign:'center',padding:'0 22px',maxWidth:352,margin:'0 auto'}},
    lines.map(function(l,i){
      return h('p',{key:i,style:{fontSize:i===0?15:13,color:i===0?'#f0fdf4':'#8b949e',lineHeight:1.75,margin:'0 0 9px',fontWeight:i===0?500:400}},l);
    })
  );
}

// ── Progress bar ──────────────────────────────────────────────────
function ProgBar(props) {
  return h('div',{style:{width:'100%',height:2.5,background:'rgba(255,255,255,0.07)',borderRadius:99,overflow:'hidden'}},
    h('div',{style:{height:'100%',width:Math.min(100,props.pct)+'%',background:props.color,borderRadius:99,transition:'width 1.1s linear'}})
  );
}

// ── Phase manager ─────────────────────────────────────────────────
function usePhases(phases, running, onDone) {
  var [pi,setPi]=useState(0), [pe,setPe]=useState(0), [te,setTe]=useState(0);
  var tr=useRef(0), pr=useRef(0), total=useRef(0);
  total.current = phases.reduce(function(s,p){return s+(p.duration||60);},0);
  useRAF(function(dt){
    tr.current+=dt/1000;
    setTe(Math.floor(tr.current));
    var cur=phases[pr.current], dur=cur?(cur.duration||60):60;
    var pe2=Math.floor(tr.current - phases.slice(0,pr.current).reduce(function(s,p){return s+(p.duration||60);},0));
    setPe(pe2);
    if(pe2>=dur){
      if(pr.current<phases.length-1){ pr.current+=1; setPi(pr.current); }
      else { onDone&&onDone(); }
    }
  }, running);
  return {pi, pe, te, total:total.current};
}

// ── MAIN PLAYER ───────────────────────────────────────────────────
function MentalPlayerPage(props) {
  var params=props.params||{};
  var session=A._mentalSession||(A.MENTAL_SESSIONS&&A.MENTAL_SESSIONS.find(function(x){return x.id===params.id;}));
  A._mentalSession=null;
  if(!session) return h('div',{style:{padding:40,textAlign:'center',color:'#6b7280'}},
    h('p',{style:{marginBottom:16}},'Session not found.'),
    h('button',{onClick:function(){A.nav('Mental');},style:{background:'#16a34a',color:'#fff',border:'none',borderRadius:10,padding:'12px 24px',cursor:'pointer',fontFamily:'inherit',fontWeight:700}},'Back to Mental Training')
  );

  var slug     = (A.getSessionSlug && A.getSessionSlug(session.name)) || session.id || '';
  var content  = A.getSessionContent ? A.getSessionContent(slug,session.name,session.duration_minutes) : null;
  var sType    = (A.SESSION_TYPES && content) ? A.SESSION_TYPES[content.type] : null;
  if(!sType) sType={color:'#16a34a',glow:'22,163,74',label:'Session',id:'GROUND'};
  var color    = sType.color;
  var glow     = sType.glow||'22,163,74';
  var phases   = (content&&content.phases) || [{id:'core',duration:(session.duration_minutes||5)*60,text:'Be present.'}];
  var sg       = (A.computeSessionSignature && A.computeSessionSignature(slug)) || {};

  var [running,setRunning]=useState(false);
  var [done,setDone]=useState(false);
  var [started,setStarted]=useState(false);
  var [journal,setJournal]=useState(['','','']);
  var [journalSaved,setJournalSaved]=useState(false);
  var doneRef=useRef(false);
  var prevPiRef=useRef(-1);

  useEffect(function(){
    if(!started) return;
    if(A.MentalYouTube) A.MentalYouTube.playSession(type, slug);
    // Set voice profile for this session type before speaking
    if(A.MentalTTS && A.MentalTTS.setSessionType) A.MentalTTS.setSessionType(type);
    var rawFirst = phases[0] && phases[0].text;
    var firstText = (A.MentalPersonalizer && rawFirst)
      ? A.MentalPersonalizer.personalizePhase(phases[0], A.DB.getUser())
      : rawFirst;
    if(firstText && A.MentalTTS) A.MentalTTS.speak(firstText);
    prevPiRef.current = 0;
  },[started]);

  useEffect(function(){
    return function(){
      if(A.MentalTTS) A.MentalTTS.stop();
      if(A.MentalYouTube) A.MentalYouTube.stop();
    };
  },[]);

  function finish(){
    if(doneRef.current)return;
    doneRef.current=true;
    setRunning(false); setDone(true);
    if(A.MentalTTS) A.MentalTTS.stop();
    if(A.MentalYouTube) A.MentalYouTube.fadeOut(5000);
    if(A.awardXP) A.awardXP(Math.round((session.xp||50)*1.25),session.duration_minutes||5,'mental','mental',slug,true);
    if(A.fireConfetti) A.fireConfetti();
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  var pm=usePhases(phases,running,finish);
  var {pi,pe,te,total}=pm;
  var curPhase=phases[pi]||phases[0];

  useEffect(function(){
    if(!started || !running) return;
    if(pi === 0 || pi === prevPiRef.current) return;
    prevPiRef.current = pi;
    var rawText = phases[pi] && phases[pi].text;
    var text = (A.MentalPersonalizer && rawText)
      ? A.MentalPersonalizer.personalizePhase(phases[pi], A.DB.getUser())
      : rawText;
    if(text && A.MentalTTS) A.MentalTTS.speak(text);
  },[pi, started, running]);

  var sessProgress=total>0?Math.min(1,te/total):0;
  var type=(content&&content.type)||'GROUND';

  function shareSession(){
    var url=window.location.origin+window.location.pathname+'?session='+encodeURIComponent(slug);
    navigator.clipboard&&navigator.clipboard.writeText(url).then(function(){
      window.dispatchEvent(new CustomEvent('sc_toast',{detail:{msg:'Link copied!',type:'success'}}));
    }).catch(function(){ prompt('Share link:',url); });
  }

  // DONE ─────────────────────────────────────────────────────────
  if(done) {
    var _doneUser = A.DB && A.DB.getUser ? A.DB.getUser() : {};
    var _doneName = _doneUser && _doneUser.name ? _doneUser.name : null;
    var _reflectPrompt = A.MentalPersonalizer ? A.MentalPersonalizer.getReflectionPrompt(type) : 'What did you take from this session?';
    return h('div',{style:{minHeight:'100dvh',background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:32}},
      h('div',{style:{filter:'drop-shadow(0 0 24px rgba('+glow+',0.5))',marginBottom:16}},
        h(TypeIcon,{type:type,color:color,size:64})
      ),
      h('h2',{style:{fontSize:24,fontWeight:800,color:'#f0fdf4',marginBottom:4}},_doneName ? _doneName+', session complete.' : 'Session complete'),
      h('p',{style:{fontSize:13,color:'#6b7280',marginBottom:6}},session.name),
      h('p',{style:{fontSize:12,color:'#484f58',marginBottom:14}},(session.duration_minutes||5)+' minutes well spent.'),
      h('div',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'7px 18px',borderRadius:99,background:color+'1a',border:'1px solid '+color+'35',fontSize:13,fontWeight:700,color:color,marginBottom:20}},A.Icon&&h(A.Icon,{n:'zap',cls:'',style:{width:14,height:14,color:color}}),'+'+session.xp+' XP'),
      h('div',{style:{maxWidth:280,margin:'0 auto 16px',padding:'14px 16px',borderRadius:12,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)'}},
        h('p',{style:{fontSize:12,color:'#9ca3af',margin:0,lineHeight:1.7,fontStyle:'italic'}},_reflectPrompt)
      ),
      h('div',{style:{maxWidth:300,margin:'0 auto 28px',padding:'14px 16px',borderRadius:12,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.06)',textAlign:'left'}},
        h('p',{style:{fontSize:11,fontWeight:800,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}},'Quick Journal'),
        ['What went well today?','What will you work on next?','One word for how you feel:'].map(function(ph,i){
          return h('input',{
            key:i, type:'text', placeholder:ph, value:journal[i],
            onChange:function(e){
              var next=journal.slice(); next[i]=e.target.value; setJournal(next); setJournalSaved(false);
            },
            style:{width:'100%',marginBottom:8,padding:'9px 11px',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:8,color:'#e5e7eb',fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box'}
          });
        }),
        h('button',{
          onClick:function(){
            try{
              var key='sc_mental_journal';
              var all=(A.DB&&A.DB.get(key))||[];
              all.unshift({slug:slug,date:new Date().toISOString().slice(0,10),lines:journal});
              if(A.DB) A.DB.set(key,all.slice(0,200));
            }catch(e){}
            setJournalSaved(true);
          },
          style:{marginTop:2,padding:'8px 16px',background:journalSaved?'rgba(74,222,128,0.12)':color+'1a',border:'1px solid '+(journalSaved?'rgba(74,222,128,0.35)':color+'35'),borderRadius:8,color:journalSaved?'#4ade80':color,fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}
        }, journalSaved?'Saved ✓':'Save journal')
      ),
      h('div',{style:{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:270}},
        h('button',{onClick:function(){A.nav('Mental');},style:{padding:14,background:color,color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 4px 20px rgba('+glow+',0.35)'}},'More Sessions'),
        h('button',{onClick:shareSession,style:{padding:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#6b7280',cursor:'pointer',fontSize:13,fontFamily:'inherit'}},'Share this session')
      )
    );
  }

  // PRE-START ────────────────────────────────────────────────────
  if(!started) {
    var _user = A.DB && A.DB.getUser ? A.DB.getUser() : {};
    var _userName = (_user && _user.name) ? _user.name : null;
    var _ctxLine = A.MentalPersonalizer ? A.MentalPersonalizer.getSessionContext({type:type}, _user) : '';
    var _drillCtx = _ctxLine && _ctxLine.indexOf('after your') !== -1 ? _ctxLine.split(' · ').pop() : '';
    var ROLE_ICONS = {batsman:'bat',bowler:'ball',allrounder:'zap',wicketkeeper:'shield'};
    var _roleIcon = _user && _user.role ? (ROLE_ICONS[_user.role]||'user') : null;
    var _trackMood = A.getTrackMood ? A.getTrackMood(slug) : null;
    var ROLE_PREP_NOTES = {
      batsman:'Batsmen: sit upright with your bat nearby as an anchor.',
      bowler:'Bowlers: rest your bowling arm loosely, breathe from the shoulders down.',
      allrounder:'All-rounders: settle into stillness — both sides of your game start here.',
      wicketkeeper:'Keepers: relax your hands and wrists fully before you begin.',
    };
    var _prepNote = _user && _user.role ? ROLE_PREP_NOTES[_user.role] : null;
    return h('div',{style:{minHeight:'100dvh',background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:28}},
      h('div',{style:{width:80,height:80,borderRadius:22,background:color+'14',border:'1px solid '+color+'28',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:20,filter:'drop-shadow(0 0 20px rgba('+glow+',0.3))'}},
        h(TypeIcon,{type:type,color:color,size:46})
      ),
      h('div',{style:{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:10}},
        h('div',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 14px',borderRadius:99,background:color+'14',border:'1px solid '+color+'28',fontSize:11,fontWeight:700,color:color,letterSpacing:'0.07em',textTransform:'uppercase'}},sType.label),
        _roleIcon&&A.Icon&&h('div',{style:{display:'inline-flex',alignItems:'center',gap:4,padding:'4px 10px',borderRadius:99,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',fontSize:11,fontWeight:600,color:'#9ca3af'}},
          h(A.Icon,{n:_roleIcon,cls:'',style:{width:12,height:12,color:'#9ca3af'}}),
          'For '+(_user.role||'you')+'s')
      ),
      _trackMood&&h('div',{style:{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 11px',borderRadius:99,background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',fontSize:10,fontWeight:600,color:'#6b7280',marginBottom:8}},'🎧 '+_trackMood),
      _userName&&h('p',{style:{fontSize:14,color:'#6b7280',marginBottom:4,fontWeight:500}},'Ready, '+_userName+'?'),
      h('h2',{style:{fontSize:20,fontWeight:800,color:'#f0fdf4',marginBottom:8,lineHeight:1.3}},session.name),
      h('p',{style:{fontSize:12,color:'#6b7280',marginBottom:_drillCtx?8:20}},
        (session.duration_minutes||5)+' min · '+session.xp+' XP · '+phases.length+' phases'),
      _prepNote&&h('p',{style:{fontSize:12,color:'#4b5563',maxWidth:280,lineHeight:1.6,marginBottom:_drillCtx?10:16,fontStyle:'italic'}},_prepNote),
      _drillCtx&&h('div',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',borderRadius:99,background:'rgba(22,163,74,0.1)',border:'1px solid rgba(22,163,74,0.25)',fontSize:12,color:'#4ade80',marginBottom:16,maxWidth:300,textAlign:'left'}},
        A.Icon&&h(A.Icon,{n:'check',cls:'',style:{width:12,height:12,color:'#4ade80',flexShrink:0}}),
        'Great work '+_drillCtx+'. This session will lock it in mentally.'
      ),
      h('p',{style:{fontSize:13,color:'#484f58',maxWidth:280,lineHeight:1.75,marginBottom:28}},
        'Find a comfortable position. You won\'t need to watch the screen — just listen.'),
      h('button',{
        onClick:function(){setStarted(true);setRunning(true);},
        style:{padding:'16px 0',width:'100%',maxWidth:260,background:'linear-gradient(135deg,'+color+','+color+'cc)',color:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 8px 28px rgba('+glow+',0.38)',display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9}
      },A.Icon&&h(A.Icon,{n:'play',cls:'',style:{width:17,height:17,color:'#fff'}}),'Begin Session'),
      h('button',{onClick:shareSession,style:{marginTop:14,background:'none',border:'none',color:'#374151',fontSize:12,cursor:'pointer',fontFamily:'inherit'}},'Share this session')
    );
  }

  // ACTIVE ───────────────────────────────────────────────────────
  var PHASE_LABELS = {settle:'SETTLE',breathe:'BREATHE',activate:'ACTIVATE',focus:'FOCUS',reflect:'REFLECT',recover:'RECOVER',pressure:'PRESSURE',integrate:'INTEGRATE',decompress:'DECOMPRESS',acknowledge:'REFLECT',reframe:'REFRAME',ready:'READY',core:'FOCUS'};
  var PHASE_HINTS  = {settle:'Find stillness',breathe:'Breathe slowly',activate:'Feel the energy',focus:'Narrow your attention',reflect:'Be honest with yourself',recover:'Let it go',pressure:'Lean into it',integrate:'Let it land',decompress:'Release',acknowledge:'Feel it fully',reframe:'Choose your response',ready:'You are ready',core:'Be present'};
  var phaseLabel = PHASE_LABELS[(curPhase&&curPhase.id)||'core'] || 'FOCUS';
  var phaseHint  = PHASE_HINTS[(curPhase&&curPhase.id)||'core']  || 'Be present';
  return h('div',{style:{
    minHeight:'100dvh',
    background:'radial-gradient(ellipse at 50% 42%, rgba('+glow+',0.07) 0%, #080b0f 65%)',
    display:'flex',flexDirection:'column',alignItems:'center',
    paddingTop:'max(44px,calc(44px + env(safe-area-inset-top)))',
    paddingBottom:'calc(20px + env(safe-area-inset-bottom))',
  }},
    // Full-width progress strip at very top
    h('div',{style:{position:'fixed',top:0,left:0,right:0,height:3,background:'rgba(255,255,255,0.04)',zIndex:10}},
      h('div',{style:{height:'100%',width:Math.min(100,sessProgress*100)+'%',background:'linear-gradient(to right,'+color+','+color+'99)',transition:'width 1.1s linear'}})
    ),
    // Top bar
    h('div',{style:{width:'100%',padding:'0 18px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}},
      h('button',{onClick:function(){
        setRunning(false);
        if(A.MentalTTS) A.MentalTTS.stop();
        if(A.MentalYouTube) A.MentalYouTube.stop();
        A.nav('Mental');
      },style:{background:'none',border:'none',color:'#374151',fontSize:13,cursor:'pointer',fontFamily:'inherit',display:'inline-flex',alignItems:'center',gap:5}},A.Icon&&h(A.Icon,{n:'arrowL',cls:'',style:{width:13,height:13,color:'#374151'}}),'Exit'),
      h('div',{style:{display:'flex',alignItems:'center',gap:10}},
        h('span',{style:{fontSize:10,fontWeight:800,letterSpacing:'0.14em',textTransform:'uppercase',color:color,opacity:0.85}},phaseLabel),
        h('div',{style:{fontSize:11,color:'#2d3748'}},fmt(te)+' / '+fmt(total))
      )
    ),
    // Secondary progress bar
    h('div',{style:{width:'100%',padding:'0 18px',marginBottom:28}},
      h(ProgBar,{pct:sessProgress*100,color:color})
    ),
    // Viz + text
    h('div',{style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:28,width:'100%'}},
      type==='BREATH'    && h(BreathViz,{pattern:content.breathPattern,totalCycles:content.totalCycles,color:color,glow:glow,active:running}),
      type==='GROUND'    && h(GroundViz,{color:color,glow:glow,active:running,sig:sg}),
      type==='VISUALIZE' && h(VisualizeViz,{text:curPhase.text,active:running,color:color,glow:glow,dur:curPhase.duration}),
      type==='ACTIVATE'  && h(ActivateViz,{color:color,glow:glow,active:running,prog:sessProgress}),
      type==='RECOVER'   && h(RecoverViz,{color:color,glow:glow,active:running,sg:sg}),
      type==='REFLECT'   && h(ReflectViz,{text:curPhase.text,active:running,sig:sg,glow:glow}),
      type==='PRESSURE'  && h(PressureViz,{active:running,prog:sessProgress,glow:glow}),
      h('div',{style:{fontSize:11,color:color,opacity:0.55,letterSpacing:'0.1em',textTransform:'uppercase',fontWeight:600,marginTop:-12}},phaseHint),
      (type!=='REFLECT'&&type!=='VISUALIZE'&&curPhase.text&&curPhase.id!=='breathe')&&h(PhaseText,{text:curPhase.text,color:color}),
    ),
    // Pause / resume
    h('div',{style:{width:'100%',padding:'0 28px',marginTop:20}},
      h('button',{
        onClick:function(){
          setRunning(function(r){
            if(r){ if(A.MentalYouTube) A.MentalYouTube.pause(); if(A.MentalTTS) A.MentalTTS.pause(); }
            else  { if(A.MentalYouTube) A.MentalYouTube.resume(); if(A.MentalTTS) A.MentalTTS.resume(); }
            return !r;
          });
        },
        style:{width:'100%',padding:14,background:running?'rgba(255,255,255,0.05)':color,
          border:running?'1px solid rgba(255,255,255,0.1)':'none',borderRadius:12,
          color:running?'#6b7280':'#fff',fontSize:15,fontWeight:700,cursor:'pointer',
          fontFamily:'inherit',transition:'all 0.25s',
          boxShadow:running?'none':'0 4px 18px rgba('+glow+',0.3)',
          display:'inline-flex',alignItems:'center',justifyContent:'center',gap:7}
      }, A.Icon&&h(A.Icon,{n:running?'pause':'play',cls:'',style:{width:15,height:15,color:running?'#6b7280':'#fff'}}), running?'Pause':'Resume')
    )
  );
}

Object.assign(window.SC_APP || (window.SC_APP={}), { MentalPlayerPage });
console.log('[SC] app-mental-player-v4.1 ready — redesigned halo, radial glow, CSS drop-shadow');
})();
