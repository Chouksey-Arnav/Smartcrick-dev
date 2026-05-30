// app-mental-player-v4.js
// ================================================================
// SmartCrick — Mental Session Player v4 (DEFINITIVE)
// Key improvements over v3:
//   - Visual Signature System: every orb is unique per session
//   - Fixed BREATH timing (separate from phase manager)
//   - GROUND orb: unique particle count, speed, size per session
//   - PRESSURE: smooth color shift teal→amber→red per session slug
//   - Better pre-start card with type badge + visual preview
//   - Share button with URL copy
//   - Unified phase text with staggered fade
// Load AFTER: app-mental-content.js, app-mental-content-v2.js, app-mental.js
// Replaces: A.MentalPlayerPage
// ================================================================
(function() {
'use strict';
var h        = React.createElement;
var useState  = React.useState;
var useEffect = React.useEffect;
var useRef    = React.useRef;
var A = window.SC_APP;
var DB = A.DB;

// ── helpers ──────────────────────────────────────────────────────
function fmt(s) {
  return Math.floor(s/60) + ':' + (s%60 < 10 ? '0' : '') + (s%60|0);
}

// Deterministic hash for visual signature
function sig(slug) {
  var h = 5381, s = slug || 'default';
  for (var i = 0; i < s.length; i++) h = ((h<<5)+h) ^ s.charCodeAt(i), h = h>>>0;
  return {
    speed:     0.45 + (h % 90) / 100,
    particles: 3 + (h % 6),
    orbR:      46 + (h % 22),
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

// ── Visual type preview (shown on pre-start card) ─────────────────
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
  // GROUND default
  return h('svg', {width:size,height:size,viewBox:'0 0 '+size+' '+size},
    h('circle',{cx:c,cy:c,r:c*0.7,fill:color,opacity:0.2}),
    h('circle',{cx:c,cy:c,r:c*0.7,fill:'none',stroke:color,strokeWidth:1.5,opacity:0.8}),
    h('circle',{cx:c,cy:c,r:3,fill:color,opacity:0.9})
  );
}

// ── BREATH renderer ───────────────────────────────────────────────
function BreathViz(props) {
  var pat = props.pattern || {inhale:4,exhale:6}, color = props.color, active = props.active;
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
  var R = 54, cx=80, cy=80;
  var minR=36, maxR=70;
  var r = ph==='inhale'?minR+(maxR-minR)*prog:ph==='inhale2'?minR+(maxR-minR)*prog:ph==='hold'?maxR:ph==='holdOut'?minR:maxR-(maxR-minR)*prog;
  var gO = exp ? 0.3+0.2*prog : 0.1;
  var label = {inhale:'Inhale',inhale2:'Again',hold:'Hold',exhale:'Exhale',holdOut:'Hold'}[ph]||ph;

  return h('div', {style:{display:'flex',flexDirection:'column',alignItems:'center',gap:14}},
    h('div', {style:{position:'relative',width:160,height:160}},
      h('svg', {width:160,height:160,viewBox:'0 0 160 160',style:{overflow:'visible'}},
        h('circle',{cx:cx,cy:cy,r:r+18,fill:'none',stroke:color,strokeWidth:0.5,opacity:gO*0.5}),
        h('circle',{cx:cx,cy:cy,r:r,fill:'none',stroke:color,strokeWidth:2.5,opacity:0.85}),
        h('circle',{cx:cx,cy:cy,r:Math.max(0,r-5),fill:color,opacity:gO*0.4}),
        h('text',{x:cx,y:cy+1,textAnchor:'middle',dominantBaseline:'central',
          fontSize:20,fontWeight:700,fill:'#f0fdf4',fontFamily:'inherit'},cnt)
      )
    ),
    h('div',{style:{fontSize:12,fontWeight:700,color:color,letterSpacing:'0.1em',textTransform:'uppercase'}},label),
    h('div',{style:{fontSize:11,color:'#374151'}},cyc+'/'+maxC+' cycles')
  );
}

// ── GROUND renderer (unique signature per session) ────────────────
function GroundViz(props) {
  var color = props.color, active = props.active, sg = props.sig || {};
  var [t2, setT] = useState(0);
  var tr = useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);

  var speed = sg.speed||0.7, nP = sg.particles||5, orbR = sg.orbR||56;
  var pulse = Math.sin(t2*speed)*0.5+0.5;
  var ang = t2*28;
  var cx=80,cy=80;
  var particles = Array.from({length:nP},function(_,i){
    var a=(ang+i*360/nP)*Math.PI/180;
    var pr=orbR+20;
    return {x:cx+Math.cos(a)*pr, y:cy+Math.sin(a)*pr, r:2+(i%3), o:0.25+pulse*0.45*(i%2?1:0.5)};
  });

  return h('svg',{width:160,height:160,viewBox:'0 0 160 160',style:{overflow:'visible'}},
    h('circle',{cx:cx,cy:cy,r:orbR+24,fill:color,opacity:0.03+pulse*0.04}),
    h('circle',{cx:cx,cy:cy,r:orbR+10,fill:'none',stroke:color,strokeWidth:0.5,opacity:0.1+pulse*0.1}),
    particles.map(function(p,i){return h('circle',{key:i,cx:p.x,cy:p.y,r:p.r,fill:color,opacity:p.o});}),
    h('circle',{cx:cx,cy:cy,r:orbR,fill:color,opacity:0.15+pulse*0.1}),
    h('circle',{cx:cx,cy:cy,r:orbR,fill:'none',stroke:color,strokeWidth:2,opacity:0.8+pulse*0.2}),
    h('circle',{cx:cx,cy:cy,r:orbR*0.5,fill:color,opacity:0.12+pulse*0.1}),
    h('circle',{cx:cx,cy:cy,r:5,fill:color,opacity:0.9})
  );
}

// ── VISUALIZE renderer ────────────────────────────────────────────
function VisualizeViz(props) {
  var text = props.text||'', active = props.active, color = props.color;
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
    h('svg',{width:96,height:96,viewBox:'0 0 96 96'},
      [0,1,2,3,4,5,6].map(function(i){
        return h('circle',{key:i,cx:(15+i*11)+'%',cy:(20+i*9)+'%',r:1+i%2,fill:color,opacity:0.12+i*0.06});
      }),
      h('circle',{cx:48,cy:48,r:26,fill:'none',stroke:color,strokeWidth:1,opacity:0.25}),
      h('circle',{cx:48,cy:48,r:16,fill:'none',stroke:color,strokeWidth:0.5,opacity:0.12}),
      h('circle',{cx:48,cy:48,r:4,fill:color,opacity:0.5})
    ),
    h('div',{style:{opacity:vis?1:0,transition:'opacity 0.8s ease',textAlign:'center',
      padding:'0 20px',maxWidth:320,minHeight:80,display:'flex',alignItems:'center',justifyContent:'center'}},
      h('p',{style:{fontSize:15,color:'#e0f2fe',lineHeight:1.85,fontStyle:'italic',margin:0,
        textShadow:'0 0 30px rgba('+props.glow+',0.25)'}},sentences[idx]||'')
    )
  );
}

// ── ACTIVATE renderer ──────────────────────────────────────────────
function ActivateViz(props) {
  var color = props.color, active = props.active, prog = props.prog||0;
  var [t2,setT]=useState(0); var tr=useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);
  var speed=0.6+prog*1.6, pulse=Math.max(0,Math.sin(t2*speed))*0.5+0.5;
  var orbR=44+prog*24, cx=80,cy=80;
  var rings=[1,2,3].filter(function(i){return prog>i*0.22;}).map(function(i){
    return {r:orbR+18+i*14,o:(prog-i*0.22)*0.28*(0.5+pulse*0.5)};
  });
  return h('svg',{width:160,height:160,viewBox:'0 0 160 160',style:{overflow:'visible'}},
    rings.map(function(rg,i){return h('circle',{key:i,cx:cx,cy:cy,r:rg.r,fill:'none',stroke:color,strokeWidth:0.5+i*0.3,opacity:rg.o});}),
    h('circle',{cx:cx,cy:cy,r:orbR+12,fill:color,opacity:(0.08+prog*0.22+pulse*0.08)*0.6}),
    h('circle',{cx:cx,cy:cy,r:orbR,fill:color,opacity:0.1+prog*0.22+pulse*0.06}),
    h('circle',{cx:cx,cy:cy,r:orbR,fill:'none',stroke:color,strokeWidth:2.5,opacity:0.45+prog*0.55}),
    h('circle',{cx:cx,cy:cy,r:orbR*0.55,fill:color,opacity:0.14+prog*0.22+pulse*0.08}),
    h('circle',{cx:cx,cy:cy,r:6+pulse*3,fill:'#fff',opacity:0.5+prog*0.5})
  );
}

// ── RECOVER renderer ───────────────────────────────────────────────
function RecoverViz(props) {
  var color = props.color, active = props.active, sg = props.sig||{};
  var [t2,setT]=useState(0); var tr=useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);
  var amp=sg.wave||12, freq=sg.freq||2.5;
  var W=200,H=80;
  var pts=[], pts2=[];
  for(var x=0;x<=W;x+=4){
    pts.push(x+','+(H/2+Math.sin(x/W*Math.PI*freq+t2*0.35)*amp+Math.sin(x/W*Math.PI*(freq*1.7)+t2*0.6)*amp*0.4).toFixed(1));
    pts2.push(x+','+(H/2+Math.sin(x/W*Math.PI*freq+t2*0.35+1.2)*amp*0.7+Math.sin(x/W*Math.PI*(freq*1.3)+t2*0.45+2)*amp*0.3).toFixed(1));
  }
  var path1='M'+pts.join('L'), path2='M'+pts2.join('L');
  return h('svg',{width:W,height:H,viewBox:'0 0 '+W+' '+H,style:{overflow:'visible'}},
    h('path',{d:path1,fill:'none',stroke:color,strokeWidth:2,opacity:0.55}),
    h('path',{d:path2,fill:'none',stroke:color,strokeWidth:1.5,opacity:0.28}),
    h('path',{d:path1+'L'+W+','+H+'L0,'+H+'Z',fill:color,opacity:0.04})
  );
}

// ── REFLECT renderer ───────────────────────────────────────────────
function ReflectViz(props) {
  var text=props.text||'', active=props.active, sg=props.sig||{};
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
    h('svg',{width:80,height:80,viewBox:'0 0 80 80'},
      h('circle',{cx:40,cy:40,r:28,fill:'none',stroke:color,strokeWidth:1,opacity:0.28}),
      h('text',{x:40,y:40,textAnchor:'middle',dominantBaseline:'central',fontSize:24,fill:color,opacity:0.65,fontFamily:'serif'},'?')
    ),
    h('div',{style:{textAlign:'center',padding:'0 20px',maxWidth:320,minHeight:80}},
      h('p',{style:{fontSize:15,color:'#fbbf24',lineHeight:1.85,fontStyle:'italic',margin:0,whiteSpace:'pre-line'}},
        disp,
        active&&ci<=(lines[si]||'').length&&h('span',{style:{borderRight:'2px solid #d97706',marginLeft:1,opacity:0.75}},'\u200b')
      )
    )
  );
}

// ── PRESSURE renderer ──────────────────────────────────────────────
function PressureViz(props) {
  var active=props.active, prog=props.prog||0;
  var [t2,setT]=useState(0); var tr=useRef(0);
  useRAF(function(dt){if(!active)return;tr.current+=dt;setT(tr.current/1000);},active);
  var speed=0.8+prog*3.5, pulse=Math.max(0,Math.sin(t2*speed));
  var r=Math.round(13+(220-13)*prog), g=Math.round(148+(38-148)*prog), b=Math.round(136+(38-136)*prog);
  var color='rgb('+r+','+g+','+b+')';
  var orbR=52+pulse*(10+prog*22), cx=80,cy=80;
  return h('div',{style:{display:'flex',flexDirection:'column',alignItems:'center',gap:12}},
    h('svg',{width:160,height:160,viewBox:'0 0 160 160',style:{overflow:'visible'}},
      h('circle',{cx:cx,cy:cy,r:orbR+14,fill:color,opacity:0.04+pulse*0.06}),
      h('circle',{cx:cx,cy:cy,r:orbR,fill:'none',stroke:color,strokeWidth:2.5,opacity:0.5+pulse*0.5}),
      h('circle',{cx:cx,cy:cy,r:orbR-12,fill:color,opacity:0.06+prog*0.08+pulse*0.06}),
      h('circle',{cx:cx,cy:cy,r:8+pulse*5,fill:color,opacity:0.7+pulse*0.3})
    ),
    prog>0.45&&h('div',{style:{fontSize:11,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:color,opacity:0.7+prog*0.3}},
      prog>0.82?'⚡ Peak pressure':prog>0.6?'Pressure building':'Rising')
  );
}

// ── Phase text with staggered fade ────────────────────────────────
function PhaseText(props) {
  var text=props.text||'', color=props.color;
  var [vis,setVis]=useState(false);
  useEffect(function(){setVis(false);var t=setTimeout(function(){setVis(true);},60);return function(){clearTimeout(t);};},[text]);
  var lines=text.split(/\n/).filter(function(l){return l.trim();});
  return h('div',{style:{opacity:vis?1:0,transition:'opacity 0.9s ease',textAlign:'center',padding:'0 22px',maxWidth:352,margin:'0 auto'}},
    lines.map(function(l,i){
      return h('p',{key:i,style:{fontSize:i===0?15:13,color:i===0?'#f0fdf4':'#8b949e',lineHeight:1.72,margin:'0 0 9px',fontWeight:i===0?500:400}},l);
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
    tr.current+=dt/1000; total.current; // eslint-disable-line
    setTe(Math.floor(tr.current));
    var cur=phases[pr.current], dur=cur?(cur.duration||60):60;
    pr.current; // ref read
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
  var params=props.params||{}, session=params.session;
  if(!session) return h('div',{style:{padding:40,textAlign:'center',color:'#6b7280'}},'No session');

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
  var doneRef=useRef(false);
  var prevPiRef=useRef(-1);

  // Start YouTube soundtrack + speak first phase text when session begins
  useEffect(function(){
    if(!started) return;
    if(A.MentalYouTube) A.MentalYouTube.playSession(type);
    var firstText = phases[0] && phases[0].text;
    if(firstText && A.MentalTTS) A.MentalTTS.speak(firstText);
    prevPiRef.current = 0;
  },[started]);

  // Stop all audio on unmount (e.g. navigating away mid-session)
  useEffect(function(){
    return function(){
      if(A.MentalTTS) A.MentalTTS.stop();
      if(A.MentalYouTube) A.MentalYouTube.stop();
    };
  },[]);

  function finish(){
    if(doneRef.current)return;
    doneRef.current=true;
    setRunning(false);setDone(true);
    if(A.MentalTTS) A.MentalTTS.stop();
    if(A.MentalYouTube) A.MentalYouTube.fadeOut(5000);
    if(A.awardXP) A.awardXP(session.xp||50,session.duration_minutes||5,'mental','mental',slug);
    if(A.fireConfetti) A.fireConfetti();
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  var pm=usePhases(phases,running,finish);
  var {pi,pe,te,total}=pm;
  var curPhase=phases[pi]||phases[0];

  // Speak each phase's text as it advances (skip pi=0 — spoken on session start)
  useEffect(function(){
    if(!started || !running) return;
    if(pi === 0 || pi === prevPiRef.current) return;
    prevPiRef.current = pi;
    var text = phases[pi] && phases[pi].text;
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
  if(done) return h('div',{style:{minHeight:'100dvh',background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:32}},
    h(TypeIcon,{type:type,color:color,size:56}),
    h('h2',{style:{fontSize:22,fontWeight:800,color:'#f0fdf4',marginTop:16,marginBottom:6}},'Session complete'),
    h('p',{style:{fontSize:13,color:'#6b7280',marginBottom:12}},session.name),
    h('div',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 16px',borderRadius:99,background:color+'1a',border:'1px solid '+color+'35',fontSize:13,fontWeight:700,color:color,marginBottom:28}},'⚡ +'+session.xp+' XP'),
    h('div',{style:{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:270}},
      h('button',{onClick:function(){A.nav('Mental');},style:{padding:14,background:color,color:'#fff',border:'none',borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}},'More Sessions'),
      h('button',{onClick:shareSession,style:{padding:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#6b7280',cursor:'pointer',fontSize:13,fontFamily:'inherit'}},'Share this session')
    )
  );

  // PRE-START ────────────────────────────────────────────────────
  if(!started) return h('div',{style:{minHeight:'100dvh',background:'#0d1117',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:28}},
    h('div',{style:{width:68,height:68,borderRadius:18,background:color+'12',border:'1px solid '+color+'25',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:18}},
      h(TypeIcon,{type:type,color:color,size:42})
    ),
    h('div',{style:{display:'inline-flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:99,background:color+'12',border:'1px solid '+color+'25',fontSize:11,fontWeight:700,color:color,marginBottom:10,letterSpacing:'0.06em',textTransform:'uppercase'}},sType.label),
    h('h2',{style:{fontSize:19,fontWeight:800,color:'#f0fdf4',marginBottom:6,lineHeight:1.3}},session.name),
    h('p',{style:{fontSize:12,color:'#6b7280',marginBottom:24}},
      (session.duration_minutes||5)+' min · '+session.xp+' XP · '+phases.length+' phases'),
    h('p',{style:{fontSize:13,color:'#484f58',maxWidth:280,lineHeight:1.7,marginBottom:30}},
      'Find a comfortable position. You won\'t need to watch the screen during this session.'),
    h('button',{
      onClick:function(){setStarted(true);setRunning(true);},
      style:{padding:'16px 52px',background:'linear-gradient(135deg,'+color+','+color+'bb)',color:'#fff',border:'none',borderRadius:14,fontSize:16,fontWeight:800,cursor:'pointer',fontFamily:'inherit',boxShadow:'0 6px 24px rgba('+glow+',0.32)'}
    },'Begin Session ▶'),
    h('button',{onClick:shareSession,style:{marginTop:12,background:'none',border:'none',color:'#374151',fontSize:12,cursor:'pointer',fontFamily:'inherit'}},'Share this session →')
  );

  // ACTIVE ───────────────────────────────────────────────────────
  return h('div',{style:{minHeight:'100dvh',background:'#080b0f',display:'flex',flexDirection:'column',alignItems:'center',paddingTop:'max(44px,calc(44px + env(safe-area-inset-top)))',paddingBottom:'calc(20px + env(safe-area-inset-bottom))'}},
    // Top bar
    h('div',{style:{width:'100%',padding:'0 18px',display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}},
      h('button',{onClick:function(){
        setRunning(false);
        if(A.MentalTTS) A.MentalTTS.stop();
        if(A.MentalYouTube) A.MentalYouTube.stop();
        A.nav('Mental');
      },style:{background:'none',border:'none',color:'#374151',fontSize:13,cursor:'pointer',fontFamily:'inherit'}},'← Exit'),
      h('div',{style:{fontSize:11,color:'#2d3748'}},fmt(te)+' / '+fmt(total))
    ),
    // Progress
    h('div',{style:{width:'100%',padding:'0 18px',marginBottom:22}},
      h(ProgBar,{pct:sessProgress*100,color:color})
    ),
    // Visual + text
    h('div',{style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:26,width:'100%'}},
      type==='BREATH'  && h(BreathViz,{pattern:content.breathPattern,totalCycles:content.totalCycles,cycleText:curPhase.cycleText,color:color,active:running}),
      type==='GROUND'  && h(GroundViz,{color:color,active:running,sig:sg}),
      type==='VISUALIZE' && h(VisualizeViz,{text:curPhase.text,active:running,color:color,glow:glow,dur:curPhase.duration}),
      type==='ACTIVATE'  && h(ActivateViz,{color:color,active:running,prog:sessProgress}),
      type==='RECOVER'   && h(RecoverViz,{color:color,active:running,sig:sg}),
      type==='REFLECT'   && h(ReflectViz,{text:curPhase.text,active:running,sg:sg}),
      type==='PRESSURE'  && h(PressureViz,{active:running,prog:sessProgress}),
      // Phase text (not for types that display their own text)
      (type!=='REFLECT'&&type!=='VISUALIZE'&&curPhase.text&&curPhase.id!=='breathe')&&h(PhaseText,{text:curPhase.text,color:color}),
    ),
    // Pause/resume
    h('div',{style:{width:'100%',padding:'0 28px',marginTop:20}},
      h('button',{
        onClick:function(){
          setRunning(function(r){
            if(r){ if(A.MentalYouTube) A.MentalYouTube.pause(); if(A.MentalTTS) A.MentalTTS.pause(); }
            else { if(A.MentalYouTube) A.MentalYouTube.resume(); if(A.MentalTTS) A.MentalTTS.resume(); }
            return !r;
          });
        },
        style:{width:'100%',padding:14,background:running?'rgba(255,255,255,0.05)':color,border:running?'1px solid rgba(255,255,255,0.1)':'none',borderRadius:12,color:running?'#6b7280':'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:'inherit',transition:'all 0.2s'}
      }, running?'⏸ Pause':'▶ Resume')
    )
  );
}

Object.assign(window.SC_APP || (window.SC_APP={}), { MentalPlayerPage });
console.log('[SC] app-mental-player-v4 ready — 7 types, visual signatures, share links');
})();
