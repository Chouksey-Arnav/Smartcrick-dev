// app-daily-net.js v1.0 — The Daily Net: Wordle for cricket
// Loads AFTER app-home.js, BEFORE app-root.js
(function () {
'use strict';
const { createElement: h, useState, useEffect, useRef, Fragment } = React;
const A  = window.SC_APP;
const DB = A.DB;
const nav = A.nav;

// ── Question bank (60 questions — date-seeded, 5 per day) ─────────
var Q = [
  // Batting decisions
  {q:'First ball of your innings. Outswinger on off stump. What do you do?',o:['Drive through covers','Leave it alone','Flick off hips','Play a false shot on purpose'],c:1,e:'Never play at a swinging ball first ball. Leave it. Eyes on.',cat:'bat'},
  {q:'Full toss at chest height in the final over. Your shot?',o:['Duck under it','Smash over mid-wicket','Play a defensive block','Signal no-ball and ignore it'],c:1,e:'Chest-height full toss is a free boundary. Attack over mid-wicket.',cat:'bat'},
  {q:'Spinner bowling around the wicket into rough. Right-hander. Best plan?',o:['Sweep every ball','Use feet and drive straight','Pad everything','Stay deep in crease'],c:1,e:'Getting to the pitch with your feet neutralises the rough completely.',cat:'bat'},
  {q:'Need 12 off last over. Wide yorker outside off. Your shot?',o:['Inside-out drive','Leave it','Drive straight','Step away and ramp'],c:0,e:'Inside-out through cover is highest-percentage on that line with no fielder.',cat:'bat'},
  {q:'Cover drive territory but third man is up. Where do you hit?',o:['Straight down the ground','Thick edge to third man','Over the top','Square drive behind point'],c:0,e:'Third man is up — straight drive hits the gap. Redirect through covers.',cat:'bat'},
  {q:'Leg-spinner bowls a googly. How do you identify it at release?',o:['Ball comes from front of hand','Wrist rolls outward','Ball is slower through air','Seam points toward leg'],c:0,e:'Googly exits the back of hand — seam visible differently, wrist stays outward.',cat:'bat'},
  {q:'You have scored 0 off 10 balls. Pressure building. What do you focus on?',o:['Try to hit the next ball hard','Reset between every ball','Look at the scoreboard','Think about your average'],c:1,e:'Process only. Reset ritual between balls. The runs come when the mind clears.',cat:'bat'},
  {q:'Inswinger aimed at middle stump. What is the right shot?',o:['Flick off hip','Leave it outside off','Play forward defensively','Step outside leg'],c:2,e:'Full inswinger on middle = play forward dead bat or flick. Defend it.',cat:'bat'},

  // Bowling decisions
  {q:'Tail-ender arrives. First ball as a seam bowler. What do you bowl?',o:['Full and straight at stumps','Short and at body','Wide bouncer','Good length on off stump'],c:0,e:'Full and straight gives tail-ender zero time to adjust. Danger zone.',cat:'bowl'},
  {q:'Batsman keeps hitting you through covers. Best counter-plan?',o:['Bowl wider outside off','Bring mid-off in and bowl fuller','Bowl a bouncer','Bowl off-stump line shorter'],c:1,e:'Fuller + mid-off in forces drive against a fielder. Takes away the boundary.',cat:'bowl'},
  {q:'T20 last over, need to defend 9. What is your sequence?',o:['4 bouncers then 2 yorkers','Yorker then slower ball alternating','Off-stump line every ball','Wide yorkers then straight'],c:1,e:'Yorker-slower-ball alternation makes line and pace impossible to read.',cat:'bowl'},
  {q:'Batsman steps down to slog you over mid-on. What do you bowl next?',o:['Exact same line','Shorter and into the body','Wide yorker','Slower ball full toss'],c:1,e:'Go short and into the body — he is pre-committed to coming forward again.',cat:'bowl'},
  {q:'Perfect outswing conditions. What line do you bowl to a right-hander?',o:['Middle stump','Off stump','Outside off stump','Leg stump'],c:1,e:'Off-stump line. The swing moves it to off — you want it to threaten the edge.',cat:'bowl'},
  {q:'Leg-spinner: how do you grip the ball for a standard leg break?',o:['Ball in palm, first finger across seam','Ball in top of fingers, third finger spins','Ball held with thumb and index only','Seam vertical, wrist upright'],c:1,e:'Leg break: third finger drives the spin. Ball sits in top of fingers, NOT palm.',cat:'bowl'},
  {q:'Good-length delivery on off stump to a right-hander. Ideal outcome?',o:['Batsman pulls','Edge to slip','Ball beats outside edge','LBW appeal'],c:1,e:'Good length off stump = edge or play-and-miss. That is the corridor of uncertainty.',cat:'bowl'},

  // Fielding & keeping
  {q:'Ball hit to boundary. You are the closest fielder. First priority?',o:['Sprint and dive to save','Walk and collect cleanly','Signal teammates','Stay deep as backup'],c:0,e:'Always sprint. You never know how much the ball will slow near the rope.',cat:'field'},
  {q:'Sun directly in eyes for a high catch. What do you do?',o:['Catch anyway and squint','Move laterally to take sun out of line','Shield with cap and stand still','Call a teammate'],c:1,e:'Move your feet. Lateral step takes the sun out of your sightline completely.',cat:'field'},
  {q:'Slip catch off thin edge going to your right. How do you take it?',o:['Dive forward early','One hand only','Cup hands low and react late','Jump and take at height'],c:2,e:'Slip catching: soft hands, cup low, and react to the edge. Never anticipate.',cat:'field'},
  {q:'Direct-hit run-out chance from 25m. Which stump do you target?',o:['Near stump (batting end)','Middle stump','Far stump','Either — just throw hard'],c:0,e:'Near stump — keeper can still take it if you miss slightly to either side.',cat:'field'},
  {q:'You are wicket-keeper. Spinner bowls wide. Ball turns past the bat. Priority?',o:['Chase ball wide','Stay behind stumps if batsman advances','Dive immediately','Appeal first, then move'],c:1,e:'Stumping chance: stay behind stumps until ball passes the bat. Then move.',cat:'keep'},

  // Laws & rules
  {q:'Batsman hits their own stumps while playing a shot. Decision?',o:['Not out — playing a shot','Out hit wicket','Out handled ball','Dead ball'],c:1,e:'Hit wicket while playing a shot is still OUT. Dislodging bails = dismissed.',cat:'law'},
  {q:'Ball pitches outside leg stump and would hit the stumps. LBW?',o:['Out LBW','Not out — pitched outside leg','Out — but only if no shot played','Depends on ball-tracking'],c:1,e:'Law is absolute: cannot be out LBW if ball pitches outside leg stump.',cat:'law'},
  {q:'Fielder catches ball stepping on the boundary rope. Result?',o:['Out caught','Six awarded','Four awarded','Ball replayed'],c:1,e:'Touching the rope while completing the catch = SIX automatically awarded.',cat:'law'},
  {q:'Free hit after a front-foot no-ball. Batsman is caught at mid-on. What happens?',o:['Out caught','Not out — free hit protection','Runs count but no wicket','Appeal to third umpire'],c:1,e:'On a free hit from a front-foot no-ball, you CANNOT be out caught, bowled, or LBW.',cat:'law'},
  {q:'How many balls are allowed in an over if there are two wides?',o:['6','7','8','Up to the umpire'],c:2,e:'Each wide or no-ball adds a delivery. 2 wides + 6 legal = 8 total balls minimum.',cat:'law'},
  {q:'A "Nelson" score in cricket is?',o:['111','99','222','100'],c:0,e:'Nelson = 111. Said to resemble Lord Nelson who had one eye, one arm, one leg.',cat:'trivia'},
  {q:'Maximum fielders outside the circle after the powerplay in T20?',o:['3','4','5','6'],c:2,e:'Post-powerplay (overs 7-20) in T20: maximum 5 fielders outside the 30-yard circle.',cat:'law'},

  // Mental game
  {q:'You are out for a duck. Batting again in 20 minutes. What do you do?',o:['Replay the dismissal mentally','Execute your reset routine','Tell the team what went wrong','Watch video immediately'],c:1,e:'Your pre-batting routine IS your reset mechanism. Use it every single time.',cat:'mental'},
  {q:'Hostile crowd boos every shot. Your mental approach?',o:['Fuel anger and attack','Narrow focus to process cues','Play more aggressively to silence them','Ask umpire to intervene'],c:1,e:'Narrow focus: grip, stance, watch seam. Crowd literally disappears when process absorbs attention.',cat:'mental'},
  {q:'5th day Test. Team needs you to bat 40 overs for draw. Mental plan?',o:['Target the 40-overs number','Focus on the next ball only','Set 10-run mini targets','Think about the scoreboard constantly'],c:1,e:'One ball at a time. Never let your mind live in the future. The draw comes from 1+1+1...',cat:'mental'},
  {q:'Captain gives mid-innings technical advice you disagree with. You do what?',o:['Argue it with the captain','Apply it immediately and discuss later','Ignore it entirely','Call a timeout'],c:1,e:'Apply it now. Disagree in the dressing room after. The captain needs your execution, not debate.',cat:'mental'},
  {q:'What is the Between-Ball Reset routine for?',o:['Calculating the required run rate','Mentally disconnecting from the last ball','Signalling field changes','Checking for pitch damage'],c:1,e:'The reset ritual: look away, one breath, bat tap, new stance. Last ball = gone. Start fresh.',cat:'mental'},

  // Technique
  {q:'Where should contact be made in a sweep shot?',o:['Beside the front pad','In front of the front pad','Behind the body','At full arm extension away'],c:1,e:'Contact in front of the pad means earlier timing and full control over direction.',cat:'tech'},
  {q:'Front elbow position for a cover drive (right-hander)?',o:['Pointing at slip','Pointing at mid-on','Pointing at the bowler','Pointing down at the pitch'],c:1,e:'Front elbow toward mid-on keeps the bat face full and the drive flowing through cover.',cat:'tech'},
  {q:'What does "playing late" mean and why does it help?',o:['Hitting in the air','Delaying your shot to get more information','Waiting for the ball to stop moving','Playing defensive every ball'],c:1,e:'Playing late = maximum time to read line, length, and movement before committing.',cat:'tech'},
  {q:'A leg-spinner bowls a flipper. What should it do?',o:['Turn sharply from off','Bounce higher than normal','Stay low and skid through','Drift late in the air'],c:2,e:'The flipper is pushed from the front of the hand and skids through low — opposite of expected bounce.',cat:'tech'},
  {q:'Bowling outswing: where exactly should the seam point?',o:['Toward fine leg','Toward first slip','Toward mid-on','Straight up'],c:1,e:'Seam pointing toward first slip + wrist upright = the outswing shape in the air.',cat:'tech'},
  {q:'What is the purpose of a "high-arm" bowling action?',o:['More pace','More bounce and skidthrough','Better swing','All of the above'],c:3,e:'High-arm creates steep bounce, can generate swing, and makes the ball awkward to hit.',cat:'tech'},

  // History & knowledge
  {q:'Who holds the record for most Test wickets of all time?',o:['Shane Warne','Anil Kumble','Muttiah Muralitharan','James Anderson'],c:2,e:'Muralitharan: 800 Test wickets. Warne: 708. Anderson: the all-time leader among pace bowlers.',cat:'trivia'},
  {q:'Which delivery turns from off to leg for a right-handed batsman from a leg-spinner?',o:['Googly','Leg break','Flipper','Top spinner'],c:0,e:'The googly turns the "wrong way" into the right-hander — same direction as off-spin.',cat:'tech'},
  {q:'"Corridor of uncertainty" refers to?',o:['Short balls that are hard to judge','Zone just outside off stump between drive and leave','Danger area around the rough','Wide deliveries near the crease'],c:1,e:'The corridor: seam-up deliveries 4th-5th stump line where batsman cannot commit to play or leave.',cat:'tech'},
  {q:'Who scored the first ever T20 International hundred?',o:['Chris Gayle','Brendon McCullum','Rohit Sharma','David Warner'],c:1,e:'Brendon McCullum scored T20I cricket\'s first century — 116* for New Zealand vs Bangladesh 2010.',cat:'trivia'},
  {q:'What does "DRS" stand for?',o:['Decision Review System','Delivery Review Standard','Dismissal Review Software','Data Review Score'],c:0,e:'Decision Review System — uses ball-tracking, edge detection, and thermal imaging to review umpire calls.',cat:'trivia'},
  {q:'In Test cricket, how long is the follow-on lead requirement?',o:['100 runs','150 runs','200 runs','250 runs'],c:3,e:'Follow-on in Tests: if first-innings lead exceeds 200 runs, captain can enforce follow-on.',cat:'law'},
  {q:'Which country invented cricket?',o:['Australia','India','England','West Indies'],c:2,e:'Cricket originated in England (probably South-East England) in the 16th century. First recorded match 1646.',cat:'trivia'},
  {q:'How many deliveries in a Powerplay in a 50-over ODI?',o:['6','10','15','20'],c:1,e:'ODI Powerplay covers the first 10 overs. Maximum 2 fielders outside the 30-yard circle.',cat:'law'},
  {q:'What is a "hat-trick" in cricket?',o:['Three wickets in three overs','Three wickets in three consecutive balls','Three catches in one over','Three ducks in one match'],c:1,e:'Hat-trick: three wickets with three consecutive deliveries. One of cricket\'s rarest achievements.',cat:'trivia'},
  {q:'Which cricket format has a "Super Over" to resolve ties?',o:['Tests','ODIs','T20Is','All formats'],c:1,e:'Super Over is used in ODIs and T20Is (with some exceptions). Tests settle for a draw when tied.',cat:'law'},
  {q:'How many stumps are in a set of wickets?',o:['2','3','4','6'],c:1,e:'Three stumps per wicket — off stump, middle stump, leg stump. Two bails rest on top.',cat:'trivia'},
  {q:'What does LBW stand for?',o:['Leg Before Wicket','Left Behind Wicket','Long Before Wicket','Line Ball Wicket'],c:0,e:'Leg Before Wicket — when the ball would have hit the stumps but is intercepted by the batsman\'s pad first.',cat:'law'},
  {q:'A "golden duck" means the batsman was out for?',o:['0 off 0 balls','0 off 1 ball or first ball','0 off 2 balls','Any score under 5'],c:1,e:'Golden duck = dismissed first ball, for zero. A regular duck is 0 off any number of balls.',cat:'trivia'},
  {q:'What is the maximum number of overs one bowler can bowl in a 50-over ODI?',o:['5','8','10','No limit'],c:2,e:'In 50-over cricket, one bowler may bowl a maximum of 10 overs (20% of the innings).',cat:'law'},
  {q:'What is a "doosra"?',o:['Off-spin delivery that turns the other way','Leg-spin googly variation','An arm ball from a medium pacer','A faster delivery hidden in the action'],c:0,e:'The doosra (Urdu: the second one) is bowled with an off-spin action but turns away from a right-hander.',cat:'tech'},
];

// ── Date-seeded question selector ─────────────────────────────────
function getTodayQuestions() {
  var today   = new Date().toISOString().slice(0, 10);
  var dateInt = parseInt(today.replace(/-/g, ''), 10);
  var indices = [], s = (dateInt * 1664525 + 1013904223) >>> 0;
  while (indices.length < 5) {
    s = ((s * 1664525 + 1013904223) >>> 0);
    var idx = s % Q.length;
    if (indices.indexOf(idx) === -1) indices.push(idx);
  }
  return indices.map(function (i) { return Q[i]; });
}

var GRADE_CONFIG = [
  { min:5, label:'PERFECT 🏆', color:'#fbbf24', msg:'You are a walking cricket encyclopedia. Unreal.', emoji:'🏆' },
  { min:4, label:'Elite!',      color:'#4ade80', msg:'One slip. Your cricket brain is razor sharp.',    emoji:'⭐' },
  { min:3, label:'Solid! 💪',   color:'#60a5fa', msg:'Respectable. Can you hit 4 tomorrow?',            emoji:'💪' },
  { min:2, label:'Getting there',color:'#f97316', msg:'Keep training that cricket brain.',               emoji:'🏏' },
  { min:0, label:'Try tomorrow', color:'#f87171', msg:'Every champion starts somewhere. See you tomorrow.', emoji:'🎯' },
];
function getGrade(score) {
  return GRADE_CONFIG.find(function (g) { return score >= g.min; });
}

function timeUntilMidnight() {
  var now = new Date(), mn = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  var d   = mn - now;
  return Math.floor(d / 3600000) + 'h ' + Math.floor((d % 3600000) / 60000) + 'm';
}

function buildShareText(score, questions, answers) {
  var emojis = answers.map(function (a, i) { return a === questions[i].c ? '🟩' : '🟥'; }).join('');
  return ['🏏 The Daily Net — ' + new Date().toISOString().slice(0, 10), score + '/5 ' + emojis, '', 'Challenge yourself → smartcricai.vercel.app/#/DailyNet', '#SmartCrick #DailyNet #Cricket'].join('\n');
}

// ════════════════════════════════════════════════════════════════
// DAILY NET PAGE
// ════════════════════════════════════════════════════════════════
function DailyNetPage() {
  var today    = new Date().toISOString().slice(0, 10);
  var saved    = DB.get('dn_' + today);
  var questions = getTodayQuestions();

  var [phase,    setPhase]    = useState(saved ? 'done' : 'intro'); // intro|q|done
  var [qIdx,     setQIdx]     = useState(0);
  var [answers,  setAnswers]  = useState(saved ? saved.answers : []);
  var [selected, setSelected] = useState(null);
  var [revealed, setRevealed] = useState(false);
  var [shared,   setShared]   = useState(false);

  var score = answers.filter(function (a, i) { return a === questions[i].c; }).length;
  var grade = getGrade(score);

  function handleConfirm() { if (selected === null) return; setRevealed(true); }

  function handleNext() {
    var newAnswers = answers.concat([selected]);
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (qIdx < 4) {
      setQIdx(qIdx + 1);
    } else {
      var finalScore = newAnswers.filter(function (a, i) { return a === questions[i].c; }).length;
      DB.set('dn_' + today, { answers: newAnswers, score: finalScore, date: today });
      if (A.awardXP) A.awardXP(finalScore * 15 + 20, 0, 'dailynet', null, null);
      // Update streak
      var st = DB.get('dn_streak') || { count: 0, lastDate: null };
      var yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      var yd = yesterday.toISOString().slice(0, 10);
      st.count = (st.lastDate === yd || st.lastDate === today) ? st.count + 1 : 1;
      st.lastDate = today;
      DB.set('dn_streak', st);
      window.dispatchEvent(new CustomEvent('sc_update'));
      setPhase('done');
    }
  }

  function handleShare() {
    var text = buildShareText(score, questions, answers);
    if (navigator.share) { navigator.share({ title: 'The Daily Net', text: text }).catch(function () {}); }
    else if (navigator.clipboard) { navigator.clipboard.writeText(text).then(function () { setShared(true); setTimeout(function () { setShared(false); }, 2500); }); }
  }

  // ── Header component ────────────────────────────────────────────
  var Header = h('div', {
    style: { padding: 'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 20px', background: 'linear-gradient(135deg,#0c2340,#0d1117)', position: 'relative' },
  },
    h('button', { onClick: function () { nav('Home'); }, 'aria-label': 'Back', style: { position:'absolute', top:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top)))', left:16, background:'rgba(255,255,255,.07)', border:'none', borderRadius:8, padding:'7px 12px', color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:600 } }, '‹ Back'),
    h('div', { style: { textAlign: 'center' } },
      h('div', { style: { fontSize: 40, marginBottom: 8 }, 'aria-hidden': 'true' }, '🏏'),
      h('h1', { style: { fontSize: 22, fontWeight: 900, color: '#f0fdf4', margin: '0 0 4px', letterSpacing: '-.02em' } }, 'The Daily Net'),
      h('p',  { style: { fontSize: 13, color: '#9ca3af', margin: 0 } }, '5 questions · New challenge every midnight'),
    ),
  );

  // ── INTRO ───────────────────────────────────────────────────────
  if (phase === 'intro') {
    var dnStreak = (DB.get('dn_streak') || { count: 0 }).count;
    return h('div', { style: { background: '#0d1117', minHeight: '100dvh', paddingBottom: 40 } },
      Header,
      h('div', { style: { padding: '20px' } },
        dnStreak > 0 && h('div', { style: { padding:'10px 14px', borderRadius:10, background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)', marginBottom:16, display:'flex', alignItems:'center', gap:10 } },
          h('span', { style: { fontSize: 20 } }, '🔥'),
          h('div', null,
            h('div', { style: { fontSize: 13, fontWeight: 700, color: '#f59e0b' } }, dnStreak + '-day Daily Net streak!'),
            h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Don\'t break it — play today\'s challenge'),
          ),
        ),
        h('div', { style: { background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:'16px', marginBottom:20 } },
          h('div', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform:'uppercase', letterSpacing:'.08em', marginBottom: 10 } }, 'How it works'),
          [['🟩','Correct answer'],['🟥','Wrong answer'],['📅','New 5 questions every midnight'],['🌍','Same questions for everyone — compare your score']].map(function (r) {
            return h('div', { key: r[0], style: { display:'flex', gap:10, alignItems:'center', marginBottom:8 } },
              h('span', { style: { fontSize: 16, flexShrink: 0 } }, r[0]),
              h('span', { style: { fontSize: 13, color: '#9ca3af' } }, r[1]),
            );
          }),
        ),
        h('div', { style: { display:'flex', gap:6, justifyContent:'center', marginBottom:20 } },
          [1,2,3,4,5].map(function (n) {
            return h('div', { key: n, style: { width:32, height:32, borderRadius:'50%', background:'rgba(59,130,246,.12)', border:'1px solid rgba(59,130,246,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#60a5fa' } }, n);
          })
        ),
        h('button', { onClick: function () { setPhase('q'); }, 'aria-label': 'Start today\'s Daily Net',
          style: { width:'100%', padding:'15px', border:'none', borderRadius:12, background:'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:'0 6px 24px rgba(59,130,246,.4)' } },
          '🏏 Start Today\'s Challenge'),
        h('p', { style: { fontSize:11, color:'#4b5563', textAlign:'center', marginTop:8 } }, 'Resets in ' + timeUntilMidnight()),
      ),
    );
  }

  // ── QUESTION ────────────────────────────────────────────────────
  if (phase === 'q') {
    var cq  = questions[qIdx];
    var pct = (qIdx / 5) * 100;
    var catColors = { bat:'#3b82f6', bowl:'#ef4444', field:'#10b981', keep:'#14b8a6', law:'#f59e0b', mental:'#8b5cf6', tech:'#f97316', trivia:'#6366f1' };
    var catColor = catColors[cq.cat] || '#6b7280';
    var catLabels = { bat:'Batting', bowl:'Bowling', field:'Fielding', keep:'Keeping', law:'Laws', mental:'Mental', tech:'Technique', trivia:'Knowledge' };
    return h('div', { style: { background:'#0d1117', minHeight:'100dvh', paddingBottom:40 } },
      // Progress bar header
      h('div', { style: { padding:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 14px', background:'rgba(0,0,0,.4)', borderBottom:'1px solid rgba(255,255,255,.06)' } },
        h('div', { style: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 } },
          h('div', { style: { display:'flex', gap:5 } },
            answers.map(function (a, i) { return h('div', { key:i, style:{ width:8, height:8, borderRadius:'50%', background: a === questions[i].c ? '#4ade80' : '#ef4444' } }); }),
            [0,1,2,3,4].filter(function(n){ return n >= answers.length; }).map(function(n){ return h('div', { key:'q'+n, style:{ width:8, height:8, borderRadius:'50%', background:'rgba(255,255,255,.15)' } }); }),
          ),
          h('span', { style: { fontSize:12, fontWeight:600, color:catColor, background:catColor+'18', padding:'3px 10px', borderRadius:20, border:'1px solid '+catColor+'30' } }, catLabels[cq.cat] || cq.cat),
        ),
        h('div', { style:{ height:3, background:'rgba(255,255,255,.08)', borderRadius:2, overflow:'hidden' } },
          h('div', { style:{ height:'100%', width:pct+'%', background:'#3b82f6', borderRadius:2, transition:'width .4s' } }),
        ),
      ),
      h('div', { style:{ padding:'20px' } },
        // Question card
        h('div', { style:{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.07)', borderRadius:14, padding:'20px', marginBottom:20 } },
          h('div', { style:{ fontSize:11, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 } }, 'Q' + (qIdx+1) + ' of 5'),
          h('p', { style:{ fontSize:15, fontWeight:600, color:'#f0fdf4', lineHeight:1.6, margin:0 } }, cq.q),
        ),
        // Options
        h('div', { style:{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 } },
          cq.o.map(function (opt, i) {
            var isSel = selected === i;
            var isRight = revealed && i === cq.c;
            var isWrong = revealed && isSel && i !== cq.c;
            return h('button', {
              key: i, onClick: function () { if (!revealed) setSelected(i); },
              disabled: revealed,
              'aria-pressed': isSel ? 'true' : 'false',
              style: {
                display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
                background: isRight?'rgba(74,222,128,.1)':isWrong?'rgba(239,68,68,.1)':isSel?'rgba(59,130,246,.1)':'rgba(255,255,255,.03)',
                border:'2px solid '+(isRight?'rgba(74,222,128,.45)':isWrong?'rgba(239,68,68,.45)':isSel?'rgba(59,130,246,.45)':'rgba(255,255,255,.07)'),
                borderRadius:10, cursor:revealed?'default':'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .15s',
              },
            },
              h('div', { 'aria-hidden':'true', style:{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:isRight?'#16a34a':isWrong?'#ef4444':isSel?'#3b82f6':'rgba(255,255,255,.06)', fontSize:11, fontWeight:800, color:'#fff' } }, isRight?'✓':isWrong?'✗':['A','B','C','D'][i]),
              h('span', { style:{ fontSize:13, fontWeight:500, color:'#e5e7eb', flex:1, lineHeight:1.4 } }, opt),
            );
          })
        ),
        // Explanation
        revealed && h('div', { style:{ padding:'12px 14px', borderRadius:10, marginBottom:16, background:selected===cq.c?'rgba(74,222,128,.07)':'rgba(239,68,68,.07)', border:'1px solid '+(selected===cq.c?'rgba(74,222,128,.25)':'rgba(239,68,68,.25)') } },
          h('div', { style:{ fontSize:12, fontWeight:700, marginBottom:4, color:selected===cq.c?'#4ade80':'#f87171' } }, selected===cq.c ? '✓ Correct!' : '✗ Incorrect'),
          h('div', { style:{ fontSize:13, color:'#9ca3af', lineHeight:1.55 } }, cq.e),
        ),
        !revealed && selected !== null && h('button', {
          onClick: handleConfirm,
          style:{ width:'100%', padding:'13px', border:'none', borderRadius:10, background:'#3b82f6', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' },
        }, 'Lock In Answer'),
        revealed && h('button', {
          onClick: handleNext,
          style:{ width:'100%', padding:'13px', border:'none', borderRadius:10, background:'#16a34a', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' },
        }, qIdx < 4 ? 'Next Question →' : 'See My Score →'),
      ),
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────
  var emojis = answers.map(function (a, i) { return a === questions[i].c ? '🟩' : '🟥'; }).join('');
  var dnStreak2 = (DB.get('dn_streak') || { count: 0 }).count;
  return h('div', { style:{ background:'#0d1117', minHeight:'100dvh', paddingBottom:40 } },
    h('div', { style:{ padding:'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 24px', background:'linear-gradient(135deg,#0c2340,#0d1117)', textAlign:'center' } },
      h('div', { style:{ fontSize:44, marginBottom:8 }, 'aria-hidden':'true' }, grade.emoji),
      h('div', { style:{ fontSize:11, fontWeight:800, color:grade.color, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 } }, grade.label),
      h('div', { style:{ fontSize:38, fontWeight:900, color:'#f0fdf4', marginBottom:6 } }, score + '/5'),
      h('div', { style:{ fontSize:26, letterSpacing:6, marginBottom:10 } }, emojis),
      h('p',  { style:{ fontSize:13, color:'#9ca3af', maxWidth:280, margin:'0 auto', lineHeight:1.6 } }, grade.msg),
    ),
    h('div', { style:{ padding:'20px' } },
      // XP earned
      h('div', { style:{ background:'rgba(22,163,74,.08)', border:'1px solid rgba(22,163,74,.2)', borderRadius:12, padding:'14px', marginBottom:14, textAlign:'center' } },
        h('div', { style:{ fontSize:20, fontWeight:700, color:'#4ade80' } }, '+' + ((score * 15) + 20) + ' XP earned!'),
        h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:3 } }, score * 15 + ' for answers · 20 participation bonus'),
      ),
      // Streak
      dnStreak2 > 0 && h('div', { style:{ background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.2)', borderRadius:12, padding:'12px', marginBottom:14, display:'flex', alignItems:'center', gap:10 } },
        h('span', { style:{ fontSize:20 } }, '🔥'),
        h('div', null,
          h('div', { style:{ fontSize:13, fontWeight:700, color:'#f59e0b' } }, dnStreak2 + '-day Daily Net streak!'),
          h('div', { style:{ fontSize:11, color:'#6b7280' } }, 'Resets if you miss a day. Come back tomorrow.'),
        ),
      ),
      // Share — the viral trigger
      h('button', {
        onClick: handleShare,
        'aria-label': 'Share your Daily Net result',
        style:{ width:'100%', padding:'14px', border:'none', borderRadius:10, background:shared?'#16a34a':'linear-gradient(135deg,#1d4ed8,#4f46e5)', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10, transition:'background .2s' },
      }, shared ? '✓ Copied! Paste anywhere.' : '🔗 Share ' + emojis),
      // Next challenge
      h('div', { style:{ textAlign:'center', padding:'10px', background:'rgba(255,255,255,.03)', borderRadius:10, marginBottom:16 } },
        h('div', { style:{ fontSize:12, color:'#6b7280' } }, 'Next challenge in ' + timeUntilMidnight()),
        h('div', { style:{ fontSize:11, color:'#4b5563', marginTop:2 } }, '5 new questions. Same midnight reset. Every day.'),
      ),
      // Answer review
      h('div', { style:{ fontSize:12, fontWeight:700, color:'#6b7280', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10 } }, 'Answer Review'),
      h('div', { style:{ display:'flex', flexDirection:'column', gap:8 } },
        questions.map(function (q, i) {
          var correct = answers[i] === q.c;
          return h('div', { key:i, style:{ padding:'12px 14px', borderRadius:10, background:correct?'rgba(74,222,128,.06)':'rgba(239,68,68,.06)', border:'1px solid '+(correct?'rgba(74,222,128,.2)':'rgba(239,68,68,.2)') } },
            h('div', { style:{ display:'flex', gap:8, alignItems:'flex-start' } },
              h('span', { style:{ flexShrink:0, fontSize:14 } }, correct ? '🟩' : '🟥'),
              h('div', null,
                h('div', { style:{ fontSize:12, fontWeight:500, color:'#e5e7eb', marginBottom:2, lineHeight:1.4 } }, q.q),
                h('div', { style:{ fontSize:11, color:'#6b7280' } }, '✓ ' + q.o[q.c]),
                !correct && h('div', { style:{ fontSize:11, color:'#f87171', marginTop:2 } }, '✗ You chose: ' + (q.o[answers[i]] || 'No answer')),
              ),
            ),
          );
        })
      ),
      h('button', { onClick:function(){ nav('Home'); }, style:{ width:'100%', marginTop:16, padding:'12px', background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.09)', borderRadius:10, color:'#9ca3af', cursor:'pointer', fontSize:13, fontWeight:600 } }, 'Back to Training'),
    ),
  );
}
A.DailyNetPage = DailyNetPage;

// ── Compact widget for Home page ───────────────────────────────────
function DailyNetHomeWidget() {
  var today  = new Date().toISOString().slice(0, 10);
  var saved  = DB.get('dn_' + today);
  var done   = !!saved;
  var score  = done ? saved.score : 0;
  var grade  = done ? getGrade(score) : null;
  var emojis = done ? saved.answers.map(function (a, i) {
    return a === getTodayQuestions()[i].c ? '🟩' : '🟥';
  }).join('') : null;

  return h('div', {
    role:'button', tabIndex:0,
    'aria-label': done ? 'Daily Net done — score ' + score + '/5' : 'Play today\'s Daily Net',
    onClick: function () { nav('DailyNet'); },
    onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') nav('DailyNet'); },
    onFocus: function (e) { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,.35)'; },
    onBlur:  function (e) { e.currentTarget.style.boxShadow = 'none'; },
    style: { margin:'0 16px 12px', cursor:'pointer', outline:'none' },
  },
    h('div', { style:{
      padding:'12px 16px', borderRadius:12,
      background: done ? 'rgba(255,255,255,.03)' : 'linear-gradient(135deg,rgba(29,78,216,.12),rgba(79,70,229,.08))',
      border:'1px solid '+(done ? 'rgba(255,255,255,.07)' : 'rgba(59,130,246,.3)'),
      display:'flex', alignItems:'center', gap:12,
    }},
      h('div', { style:{ fontSize:22, flexShrink:0 }, 'aria-hidden':'true' }, done ? (grade && grade.emoji) || '🏏' : '🏏'),
      h('div', { style:{ flex:1 } },
        h('div', { style:{ fontSize:13, fontWeight:600, color:done ? '#6b7280' : '#e5e7eb' } },
          done ? 'Daily Net Complete — ' + score + '/5' : 'The Daily Net'),
        h('div', { style:{ fontSize:11, color:'#6b7280', marginTop:2 } },
          done ? emojis + ' · ' + timeUntilMidnight() + ' until next'
               : '5 cricket questions · Compare with everyone · Resets midnight'),
      ),
      !done && h('div', { style:{ fontSize:12, fontWeight:600, color:'#60a5fa', flexShrink:0 } }, 'Play →'),
    ),
  );
}
A.DailyNetHomeWidget = DailyNetHomeWidget;

// ── Expose helpers used by other files ─────────────────────────────
A.getDailyNetQuestions = getTodayQuestions;
A.getDailyNetStatus    = function () {
  var today = new Date().toISOString().slice(0, 10);
  return DB.get('dn_' + today) || null;
};

console.log('[SC] app-daily-net.js v1.0 — DailyNetPage + DailyNetHomeWidget + ' + Q.length + ' questions ready');
})();
