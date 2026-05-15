// app-quizzes.js v1.0 — Quizzes V2
// 50Q timed mode + T/F blitz + Field Position ID
// Exports: A.QuizzesPage
(function() {
'use strict';
var h = React.createElement;
var useState = React.useState;
var useEffect = React.useEffect;
var useRef = React.useRef;
var Fragment = React.Fragment;
var A = window.SC_APP;
var DB = A.DB;
var Icon = A.Icon;
var PageHeader = A.PageHeader;

// ── Question bank (50 questions for timed mode) ───────────────────
var Q50 = [
  {q:'What does LBW stand for?',o:['Leg Before Wicket','Left-Behind Wicket','Long Ball Wide','Line Between Wickets'],c:0,cat:'law'},
  {q:'How many balls in a standard over?',o:['4','5','6','8'],c:2,cat:'law'},
  {q:'What is a "hat-trick"?',o:['3 wickets in 3 consecutive balls','3 sixes in an over','3 consecutive maidens','3 ducks in a season'],c:0,cat:'law'},
  {q:'Maximum fielders outside the ring post-powerplay in T20?',o:['3','4','5','6'],c:2,cat:'law'},
  {q:'Ball pitches outside leg — can it be LBW?',o:['Yes always','No — never','Only in Tests','Only if no shot played'],c:1,cat:'law'},
  {q:'How many runs for a follow-on in Test cricket?',o:['100','150','200','250'],c:2,cat:'law'},
  {q:"What's a 'Nelson' score?",o:['99','111','222','333'],c:1,cat:'trivia'},
  {q:'First T20 World Cup was held in?',o:['2004','2005','2006','2007'],c:3,cat:'trivia'},
  {q:'Most Test wickets all time?',o:['Shane Warne','Muttiah Muralitharan','Anil Kumble','James Anderson'],c:1,cat:'trivia'},
  {q:'Who scored the highest individual Test innings?',o:['Don Bradman','Brian Lara','Hanif Mohammad','Len Hutton'],c:1,cat:'trivia'},
  {q:'First Test match was played between?',o:['England vs Australia','England vs South Africa','Australia vs India','England vs West Indies'],c:0,cat:'trivia'},
  {q:'DRS stands for?',o:['Decision Review System','Delivery Replay Software','Direct Review Screen','Digital Result System'],c:0,cat:'trivia'},
  {q:'Doosra turns which way for a right-hander from an off-spinner?',o:['Away — like leg spin','Into — like off spin','Straight on','Depends on conditions'],c:0,cat:'tech'},
  {q:'Flipper does what?',o:['Turns sharply from off','Stays low and skids through','Drifts in late','Bounces higher than expected'],c:1,cat:'tech'},
  {q:'Front elbow position in a cover drive (right-hander)?',o:['Pointing at slip','Pointing at mid-on','Pointing at mid-wicket','Pointing down at pitch'],c:1,cat:'tech'},
  {q:'Outswing: where does the seam point?',o:['Toward fine leg','Toward first slip','Toward mid-on','Straight up'],c:1,cat:'tech'},
  {q:'Playing "late" means?',o:['Hitting the ball after it passes','Delaying your shot for more info','Playing defensively','Waiting for the full toss'],c:1,cat:'tech'},
  {q:'What is the "corridor of uncertainty"?',o:['Short ball at body','Zone just outside off stump','Wide outside off','Yorker length zone'],c:1,cat:'tech'},
  {q:'Leg break turns which way for a right-hander?',o:['Away from batsman (off side)','Into batsman (leg side)','Straight on','No turn, just pace'],c:0,cat:'tech'},
  {q:'What is a "golden duck"?',o:['Dismissed for 0 off 0 balls','Dismissed first ball for 0','Any score under 5','Hit wicket for 0'],c:1,cat:'law'},
  {q:'Max overs per bowler in 50-over ODI?',o:['5','8','10','No limit'],c:2,cat:'law'},
  {q:'What is a "wide" in cricket?',o:['Ball bounces twice','Ball too wide for batsman to reach','Ball below waist','Ball above shoulder on full'],c:1,cat:'law'},
  {q:'Batting average is calculated as?',o:['Total runs / balls faced','Total runs / dismissals','Total runs / innings','Runs / matches'],c:1,cat:'bat'},
  {q:'What shot is played to a short ball on the leg side?',o:['Cover drive','Pull shot','Cut shot','Off drive'],c:1,cat:'bat'},
  {q:'First ball of innings — outswinger on off stump. You should?',o:['Drive through covers','Leave it alone','Flick off hips','Play and miss intentionally'],c:1,cat:'bat'},
  {q:'What is a "switch hit"?',o:['Reverse sweep','Changing hands before playing a shot','Hit against the spin','A helicopter shot'],c:1,cat:'bat'},
  {q:'Against a spinner bowling around the wicket: best plan?',o:['Sweep every ball','Use feet and drive straight','Stay deep in crease','Pad everything'],c:1,cat:'bat'},
  {q:'What does "reading the seam" help a batsman do?',o:['Judge pace','Predict which way ball might move','Spot a googly','Identify slower balls'],c:1,cat:'bat'},
  {q:'Tail-ender arrives. Best first ball as a seam bowler?',o:['Full and straight at stumps','Short at body','Wide bouncer','Good length outside off'],c:0,cat:'bowl'},
  {q:'T20 death over: what is the most dangerous delivery?',o:['Good length outside off','Full straight yorker','Bouncer','Slower ball short'],c:1,cat:'bowl'},
  {q:'Googly exits from which part of the hand?',o:['Front of hand','Back of hand','Fingertips only','Wrist only'],c:1,cat:'bowl'},
  {q:'Economy rate in bowling measures?',o:['Wickets per match','Runs per over','Wides per match','Strike rate'],c:1,cat:'bowl'},
  {q:'What is "reverse swing"?',o:['Ball swings opposite to conventional with old ball','Ball swings both ways','Ball swings in wet conditions only','Off-spin that goes the other way'],c:0,cat:'bowl'},
  {q:'Slip fielder: hands should be held?',o:['High at shoulder','Low at knee height','Behind the back','Above the head'],c:1,cat:'field'},
  {q:'Direct hit run-out: which stump to target?',o:['Far stump','Near stump','Middle stump','Any stump'],c:1,cat:'field'},
  {q:'Sun in eyes for a high catch: best action?',o:['Catch anyway','Move laterally to take sun out of sightline','Signal teammate','Shield with cap and stand still'],c:1,cat:'field'},
  {q:'Wicket-keeper: when to move for a stumping?',o:['As ball is released','As ball reaches the stumps','After ball passes batsman\'s back foot','Before batsman plays shot'],c:2,cat:'field'},
  {q:'Between-ball reset routine: what is it for?',o:['Calculate required run rate','Signal field changes','Mentally disconnect from the last ball','Check pitch condition'],c:2,cat:'mental'},
  {q:'Pressure feels overwhelming. First step?',o:['Bowl faster','Focus on breathing','Ask umpire for a break','Think about the result'],c:1,cat:'mental'},
  {q:'After a duck: what should you do with 20 min until next innings?',o:['Replay dismissal in your mind','Execute your pre-batting reset routine','Watch video immediately','Tell team what went wrong'],c:1,cat:'mental'},
  {q:'What is "process focus" in cricket?',o:['Focusing on the score','Concentrating on technique cues over outcomes','Watching the scoreboard constantly','Thinking about averages'],c:1,cat:'mental'},
  {q:'What is the powerplay in T20 cricket?',o:['Overs 1-4','Overs 1-6','Overs 1-8','Overs 1-10'],c:1,cat:'law'},
  {q:'Test cricket: how many days maximum?',o:['3','4','5','6'],c:2,cat:'law'},
  {q:'Free hit occurs after which type of no-ball?',o:['Waist-height full toss','Front-foot no-ball','Bouncer above shoulder','Wide'],c:1,cat:'law'},
  {q:'In T20: a fielder saves a boundary but steps on the rope — result?',o:['Four','Six','Out caught','Ball replayed'],c:1,cat:'law'},
  {q:'"Nightwatchman" in cricket is?',o:['Lower-order bat sent to protect higher-order batsman at end of day','Batsman who bats overnight','Substitute fielder','Umpire who signals no-ball'],c:0,cat:'trivia'},
  {q:'Which country invented cricket?',o:['Australia','India','England','West Indies'],c:2,cat:'trivia'},
  {q:'What is an "Ashes" series?',o:['Test between India and Pakistan','Test between England and Australia','T20 World Cup','Any 5-match Test series'],c:1,cat:'trivia'},
  {q:'Brian Lara\'s world record Test score?',o:['375','400','501','501 not out'],c:1,cat:'trivia'},
  {q:'T/F: A batsman can be out "handled the ball" in cricket?',o:['True','False','Only in Tests','Only if not wearing gloves'],c:0,cat:'law'},
];

// ── T/F question bank (20 questions) ─────────────────────────────
var TF_Q = [
  {q:'A batsman can be out hit-wicket while playing a shot.',a:true,e:'Hit wicket while playing a stroke is still dismissal.'},
  {q:'A wide ball counts as an extra run for the batting side.',a:true,e:'Wides automatically add a run (or more) to the total.'},
  {q:'The off-stump is the stump closest to the batsman\'s legs.',a:false,e:'Off stump is on the bat side (right side for right-handers). Leg stump is closest to legs.'},
  {q:'In T20, the bowling powerplay allows only 2 fielders outside the 30-yard circle.',a:true,e:'Overs 1-6 in T20: max 2 fielders outside the ring.'},
  {q:'A batsman can score a legitimate six without hitting the ball.',a:false,e:'Six requires the ball to be hit over the boundary without bouncing.'},
  {q:'The "Duckworth-Lewis-Stern" method applies in all weather-affected cricket formats.',a:false,e:'DLS applies to limited-overs cricket only, not Tests.'},
  {q:'A bowler CAN bowl two consecutive overs in the same innings.',a:false,e:'Bowlers must alternate ends — cannot bowl two consecutive overs.'},
  {q:'Overthrows that reach the boundary count as 4 extras.',a:true,e:'Overthrow boundaries add to the total (runs + any overthrows + 4).'},
  {q:'A spinner can legally bowl a "doosra" in all competitions.',a:false,e:'Some bowling actions for doosra have been found illegal — umpires can report suspect actions.'},
  {q:'The striker\'s crease is 4 feet from the stumps.',a:true,e:'The popping crease is 4 feet (1.22m) in front of the stumps.'},
  {q:'A batsman is out if the ball lodges in the wicket-keeper\'s pads.',a:false,e:'This is usually called dead ball. It only counts if caught cleanly.'},
  {q:'In Test cricket, a follow-on can be avoided by scoring exactly 200 runs behind.',a:false,e:'The follow-on margin is MORE than 200 runs lead. Exactly 200 avoids it.'},
  {q:'A cricket pitch is 22 yards long.',a:true,e:'22 yards (20.1m) — one chain in the old imperial measurement system.'},
  {q:'The "Ashes" urn originally contained the ashes of a cricket stump.',a:false,e:'The Ashes urn is said to contain the ashes of a bail (not stump) — though this is disputed.'},
  {q:'A no-ball also results in a free hit in Test cricket.',a:false,e:'Free hit only applies in T20Is and some limited-overs formats, not Tests.'},
  {q:'Third umpire review can only be requested by the fielding side.',a:false,e:'Both batting and fielding teams can request DRS reviews.'},
  {q:'A "super over" is used to settle ties in Test matches.',a:false,e:'Tests settle for a draw if tied. Super over is used in limited-overs formats.'},
  {q:'Cover point and point are on the off side of the wicket.',a:true,e:'Both cover point and point are off-side fielding positions.'},
  {q:'A spinner bowling around the wicket is spinning the ball away from a right-hander.',a:false,e:'For an off-spinner going around to a right-hander, the ball turns into the batsman, not away.'},
  {q:'The maximum number of fielders behind square on the leg side is 2.',a:true,e:'Only 2 fielders are allowed behind square on the leg side at any time.'},
];

// ── Field position zones SVG ──────────────────────────────────────
var FIELD_ZONES = [
  { id: 'mid-on', label: 'Mid-on', cx: 120, cy: 60, r: 20, desc: 'Left of umpire, 30-40 yards' },
  { id: 'mid-off', label: 'Mid-off', cx: 200, cy: 60, r: 20, desc: 'Right of umpire, 30-40 yards' },
  { id: 'square-leg', label: 'Square leg', cx: 58, cy: 150, r: 20, desc: 'Square on the leg side' },
  { id: 'point', label: 'Point', cx: 262, cy: 150, r: 20, desc: 'Square on the off side' },
  { id: 'fine-leg', label: 'Fine leg', cx: 70, cy: 248, r: 20, desc: 'Behind square on leg, near boundary' },
  { id: 'third-man', label: 'Third man', cx: 250, cy: 248, r: 20, desc: 'Behind square on off, near boundary' },
  { id: 'cover', label: 'Cover point', cx: 230, cy: 95, r: 20, desc: 'Between point and mid-off' },
  { id: 'mid-wicket', label: 'Mid-wicket', cx: 90, cy: 95, r: 20, desc: 'Between mid-on and square leg' },
  { id: 'slip', label: 'First slip', cx: 242, cy: 195, r: 18, desc: 'Behind the wicket on off side' },
  { id: 'gully', label: 'Gully', cx: 255, cy: 172, r: 18, desc: 'Between slip and point' },
];

var FIELD_QUESTIONS = [
  { id: 'fq1', q: 'Where does MID-ON field?', answer: 'mid-on' },
  { id: 'fq2', q: 'Where does POINT field?', answer: 'point' },
  { id: 'fq3', q: 'Where does FINE LEG field?', answer: 'fine-leg' },
  { id: 'fq4', q: 'Where does THIRD MAN field?', answer: 'third-man' },
  { id: 'fq5', q: 'Where does SQUARE LEG field?', answer: 'square-leg' },
  { id: 'fq6', q: 'Where does COVER POINT field?', answer: 'cover' },
  { id: 'fq7', q: 'Where does MID-WICKET field?', answer: 'mid-wicket' },
  { id: 'fq8', q: 'Where does MID-OFF field?', answer: 'mid-off' },
  { id: 'fq9', q: 'Where does FIRST SLIP field?', answer: 'slip' },
  { id: 'fq10', q: 'Where does GULLY field?', answer: 'gully' },
];

// ── Cricket field SVG ─────────────────────────────────────────────
function CricketField(props) {
  var onZoneClick = props.onZoneClick;
  var selected = props.selected;
  var correct = props.correct;
  var showAll = props.showAll;

  return h('svg', { width: 320, height: 320, viewBox: '0 0 320 320', style: { display: 'block', overflow: 'visible' } },
    // Oval background (grass)
    h('ellipse', { cx: 160, cy: 160, rx: 148, ry: 152, fill: 'rgba(22,163,74,0.08)', stroke: 'rgba(22,163,74,0.2)', strokeWidth: 1 }),
    // 30-yard circle
    h('ellipse', { cx: 160, cy: 160, rx: 95, ry: 97, fill: 'none', stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }),
    // Pitch
    h('rect', { x: 148, y: 130, width: 24, height: 60, fill: 'rgba(180,140,80,0.3)', stroke: 'rgba(180,140,80,0.4)', strokeWidth: 0.5, rx: 2 }),
    // Wickets (top and bottom)
    h('rect', { x: 154, y: 127, width: 12, height: 4, fill: '#f0fdf4', rx: 1 }),
    h('rect', { x: 154, y: 189, width: 12, height: 4, fill: '#f0fdf4', rx: 1 }),
    // Batsman indicator
    h('circle', { cx: 160, cy: 170, r: 6, fill: '#3b82f6', opacity: 0.8 }),

    // Field zones
    FIELD_ZONES.map(function(z) {
      var isSelected = selected === z.id;
      var isCorrect = correct === z.id;
      var baseColor = isCorrect ? '#16a34a' : isSelected ? '#ef4444' : 'rgba(48,54,61,0.4)';
      var borderColor = isCorrect ? '#4ade80' : isSelected ? '#f87171' : showAll ? 'rgba(139,148,158,0.6)' : 'rgba(139,148,158,0.4)';
      var textColor = isCorrect ? '#4ade80' : isSelected ? '#f87171' : '#8b949e';

      return h('g', { key: z.id, onClick: function() { if (onZoneClick) onZoneClick(z.id); }, style: { cursor: onZoneClick ? 'pointer' : 'default' } },
        h('circle', { cx: z.cx, cy: z.cy, r: z.r, fill: baseColor, stroke: borderColor, strokeWidth: 1.5, opacity: isSelected || isCorrect ? 1 : showAll ? 0.7 : 0.5 }),
        h('text', { x: z.cx, y: z.cy + 1, textAnchor: 'middle', dominantBaseline: 'central', fontSize: 7, fontWeight: 700, fill: textColor, fontFamily: 'inherit', style: { userSelect: 'none', pointerEvents: 'none' } }, z.id === 'square-leg' ? 'Sq Leg' : z.id === 'mid-wicket' ? 'Mid-wkt' : z.id === 'fine-leg' ? 'Fine Leg' : z.id === 'third-man' ? '3rd Man' : z.id === 'first-slip' ? 'Slip' : z.id === 'cover' ? 'Cover' : z.label.split(' ')[0])
      );
    })
  );
}

// ── Score result screen ───────────────────────────────────────────
function ResultScreen(props) {
  var score = props.score;
  var total = props.total;
  var mode = props.mode;
  var onPlayAgain = props.onPlayAgain;
  var onHome = props.onHome;
  var emojis = props.emojis || [];
  var pct = Math.round((score / total) * 100);
  var grade = pct >= 90 ? { label: 'Cricket Genius! 🏆', color: '#f59e0b' } :
              pct >= 70 ? { label: 'Elite Knowledge! ⭐', color: '#4ade80' } :
              pct >= 50 ? { label: 'Solid! 💪', color: '#60a5fa' } :
              { label: 'Keep Training! 🏏', color: '#f87171' };
  var xpEarned = Math.round(score * (mode === 'blitz' ? 8 : mode === 'field' ? 15 : 12));

  // Award XP
  useEffect(function() {
    if (xpEarned > 0 && A.awardXP) A.awardXP(xpEarned, 0, 'quiz', null, null);
    var best = DB.get('quiz_best_' + mode) || 0;
    if (pct > best) DB.set('quiz_best_' + mode, pct);
    window.dispatchEvent(new CustomEvent('sc_update'));
  }, []);

  function handleShare() {
    var emojiStr = emojis.slice(0, 20).join('');
    var text = ['🏏 Cricket Quiz — ' + mode, score + '/' + total + ' (' + pct + '%) ' + grade.label, emojiStr, '', '#SmartCrick #CricketIQ'].join('\n');
    if (navigator.share) navigator.share({ title: 'My Cricket IQ', text: text }).catch(function() {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  return h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '24px 20px', textAlign: 'center' } },
    h('div', { style: { fontSize: 64, marginBottom: 12 } }, pct >= 70 ? '🏆' : pct >= 50 ? '⭐' : '🏏'),
    h('div', { style: { fontSize: 11, fontWeight: 800, color: grade.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 } }, grade.label),
    h('div', { style: { fontSize: 44, fontWeight: 900, color: '#f0fdf4', marginBottom: 4 } }, score + '/' + total),
    h('div', { style: { fontSize: 18, letterSpacing: 4, marginBottom: 12, lineHeight: 1.5, wordBreak: 'break-all', maxWidth: 280 } }, emojis.slice(0, 20).join('')),
    h('div', { style: { padding: '10px 20px', borderRadius: 10, background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', marginBottom: 20 } },
      h('div', { style: { fontSize: 18, fontWeight: 700, color: '#4ade80' } }, '+' + xpEarned + ' XP earned!')
    ),
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 280 } },
      h('button', { onClick: handleShare, style: { padding: '12px', background: 'linear-gradient(135deg,#1d4ed8,#4f46e5)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, '🔗 Share My Score'),
      h('button', { onClick: onPlayAgain, style: { padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Play Again'),
      h('button', { onClick: onHome, style: { padding: '12px', background: 'transparent', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 10, color: '#8b949e', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' } }, 'Back to Quizzes')
    )
  );
}

// ── TIMED QUIZ MODE (50Q, 30s per question) ───────────────────────
function TimedQuizMode(props) {
  var onFinish = props.onFinish;
  var shuffled = props.questions;

  var [qIdx, setQIdx] = useState(0);
  var [selected, setSelected] = useState(null);
  var [revealed, setRevealed] = useState(false);
  var [answers, setAnswers] = useState([]);
  var [timeLeft, setTimeLeft] = useState(30);
  var timerRef = useRef(null);

  var q = shuffled[qIdx];

  function startTimer() {
    clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(function() {
      setTimeLeft(function(t) {
        if (t <= 1) {
          clearInterval(timerRef.current);
          autoNext();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function autoNext() {
    clearInterval(timerRef.current);
    var newAnswers = answers.concat([selected]);
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (qIdx + 1 >= shuffled.length) {
      onFinish(newAnswers);
    } else {
      setQIdx(function(i) { return i + 1; });
    }
  }

  useEffect(function() {
    startTimer();
    return function() { clearInterval(timerRef.current); };
  }, [qIdx]);

  function handleConfirm() {
    if (selected === null) return;
    clearInterval(timerRef.current);
    setRevealed(true);
  }

  function handleNext() {
    clearInterval(timerRef.current);
    var newAnswers = answers.concat([selected !== null ? selected : -1]);
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (qIdx + 1 >= shuffled.length) {
      onFinish(newAnswers);
    } else {
      setQIdx(function(i) { return i + 1; });
    }
  }

  var timerColor = timeLeft <= 5 ? '#ef4444' : timeLeft <= 10 ? '#f59e0b' : '#16a34a';
  var catColors = { law: '#f59e0b', trivia: '#6366f1', tech: '#f97316', bat: '#3b82f6', bowl: '#ef4444', field: '#10b981', mental: '#8b5cf6' };
  var catColor = catColors[q.cat] || '#6b7280';

  return h('div', { style: { paddingBottom: 20 } },
    // Progress + timer header
    h('div', { style: { padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(48,54,61,0.6)' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
        h('span', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280' } }, (qIdx + 1) + ' / ' + shuffled.length),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: 6 } },
          h('div', { style: { width: 32, height: 32, borderRadius: '50%', border: '2px solid ' + timerColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: timerColor, fontVariantNumeric: 'tabular-nums' } }, timeLeft),
          h('span', { style: { fontSize: 11, padding: '2px 8px', borderRadius: 20, background: catColor + '18', border: '1px solid ' + catColor + '30', color: catColor, fontWeight: 700 } }, q.cat.toUpperCase())
        )
      ),
      h('div', { style: { height: 3, background: 'rgba(48,54,61,0.8)', borderRadius: 2, overflow: 'hidden' } },
        h('div', { style: { height: '100%', width: ((qIdx / shuffled.length) * 100) + '%', background: '#16a34a', borderRadius: 2, transition: 'width 0.3s' } })
      )
    ),

    h('div', { style: { padding: '16px' } },
      h('div', { style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 12, padding: '16px', marginBottom: 16 } },
        h('p', { style: { fontSize: 15, fontWeight: 600, color: '#f0fdf4', lineHeight: 1.6, margin: 0 } }, q.q)
      ),

      h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 } },
        q.o.map(function(opt, i) {
          var isSel = selected === i;
          var isRight = revealed && i === q.c;
          var isWrong = revealed && isSel && i !== q.c;
          return h('button', { key: i, onClick: function() { if (!revealed) setSelected(i); },
            disabled: revealed,
            style: { display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 10, background: isRight ? 'rgba(74,222,128,0.1)' : isWrong ? 'rgba(239,68,68,0.1)' : isSel ? 'rgba(59,130,246,0.1)' : 'rgba(22,27,34,0.9)', border: '2px solid ' + (isRight ? 'rgba(74,222,128,0.4)' : isWrong ? 'rgba(239,68,68,0.4)' : isSel ? 'rgba(59,130,246,0.4)' : 'rgba(48,54,61,0.9)'), cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s' } },
            h('div', { style: { width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isRight ? '#16a34a' : isWrong ? '#ef4444' : isSel ? '#3b82f6' : 'rgba(48,54,61,0.5)', fontSize: 11, fontWeight: 800, color: '#fff' } }, isRight ? '✓' : isWrong ? '✗' : ['A','B','C','D'][i]),
            h('span', { style: { fontSize: 13, fontWeight: 500, color: '#e5e7eb', flex: 1, lineHeight: 1.4 } }, opt)
          );
        })
      ),

      revealed && h('div', { style: { padding: '12px 14px', borderRadius: 10, marginBottom: 14, background: selected === q.c ? 'rgba(74,222,128,0.07)' : 'rgba(239,68,68,0.07)', border: '1px solid ' + (selected === q.c ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)') } },
        h('div', { style: { fontSize: 12, fontWeight: 700, color: selected === q.c ? '#4ade80' : '#f87171', marginBottom: 4 } }, selected === q.c ? '✓ Correct!' : '✗ Wrong'),
        q.e && h('div', { style: { fontSize: 12, color: '#9ca3af', lineHeight: 1.55 } }, q.e)
      ),

      !revealed && selected !== null && h('button', { onClick: handleConfirm, style: { width: '100%', padding: '13px', border: 'none', borderRadius: 10, background: '#3b82f6', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Lock In Answer'),
      revealed && h('button', { onClick: handleNext, style: { width: '100%', padding: '13px', border: 'none', borderRadius: 10, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, qIdx + 1 < shuffled.length ? 'Next →' : 'See Score →')
    )
  );
}

// ── T/F BLITZ MODE ─────────────────────────────────────────────────
function BlitzMode(props) {
  var onFinish = props.onFinish;
  var [qIdx, setQIdx] = useState(0);
  var [answers, setAnswers] = useState([]);
  var [timeLeft, setTimeLeft] = useState(10);
  var [flashing, setFlashing] = useState(null);
  var timerRef = useRef(null);

  function startTimer() {
    clearInterval(timerRef.current);
    setTimeLeft(10);
    timerRef.current = setInterval(function() {
      setTimeLeft(function(t) {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(null); return 0; }
        return t - 1;
      });
    }, 1000);
  }

  useEffect(function() { startTimer(); return function() { clearInterval(timerRef.current); }; }, [qIdx]);

  function handleAnswer(val) {
    clearInterval(timerRef.current);
    var correct = TF_Q[qIdx].a;
    var isRight = val === correct;
    setFlashing(isRight ? 'right' : 'wrong');
    var newAnswers = answers.concat([{ val: val, correct: isRight }]);
    setTimeout(function() {
      setFlashing(null);
      setAnswers(newAnswers);
      if (qIdx + 1 >= TF_Q.length) { onFinish(newAnswers); }
      else { setQIdx(function(i) { return i + 1; }); }
    }, 600);
  }

  var q = TF_Q[qIdx];
  var bgColor = flashing === 'right' ? 'rgba(22,163,74,0.2)' : flashing === 'wrong' ? 'rgba(239,68,68,0.15)' : '#0d1117';

  return h('div', { style: { paddingBottom: 20, background: bgColor, minHeight: '60vh', transition: 'background 0.3s' } },
    h('div', { style: { padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
      h('span', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280' } }, (qIdx + 1) + '/' + TF_Q.length),
      h('div', { style: { width: 36, height: 36, borderRadius: '50%', border: '2px solid ' + (timeLeft <= 3 ? '#ef4444' : '#f59e0b'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: timeLeft <= 3 ? '#ef4444' : '#f59e0b', fontVariantNumeric: 'tabular-nums' } }, timeLeft)
    ),
    h('div', { style: { padding: '20px 16px', textAlign: 'center' } },
      h('div', { style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 14, padding: '20px', marginBottom: 24 } },
        h('p', { style: { fontSize: 16, fontWeight: 600, color: '#f0fdf4', lineHeight: 1.6, margin: 0 } }, q.q)
      ),
      h('div', { style: { display: 'flex', gap: 12, justifyContent: 'center' } },
        h('button', { onClick: function() { handleAnswer(true); }, style: { flex: 1, padding: '16px', background: 'rgba(22,163,74,0.12)', border: '2px solid rgba(22,163,74,0.4)', borderRadius: 14, color: '#4ade80', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' } }, '✓ TRUE'),
        h('button', { onClick: function() { handleAnswer(false); }, style: { flex: 1, padding: '16px', background: 'rgba(239,68,68,0.10)', border: '2px solid rgba(239,68,68,0.35)', borderRadius: 14, color: '#f87171', fontSize: 18, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' } }, '✗ FALSE')
      )
    )
  );
}

// ── FIELD POSITION MODE ────────────────────────────────────────────
function FieldPositionMode(props) {
  var onFinish = props.onFinish;
  var shuffled = props.questions;

  var [qIdx, setQIdx] = useState(0);
  var [selected, setSelected] = useState(null);
  var [revealed, setRevealed] = useState(false);
  var [answers, setAnswers] = useState([]);

  var q = shuffled[qIdx];

  function handleZoneClick(zoneId) {
    if (revealed) return;
    setSelected(zoneId);
  }

  function handleConfirm() {
    if (!selected) return;
    setRevealed(true);
  }

  function handleNext() {
    var isCorrect = selected === q.answer;
    var newAnswers = answers.concat([{ selected: selected, correct: isCorrect }]);
    setAnswers(newAnswers);
    setSelected(null);
    setRevealed(false);
    if (qIdx + 1 >= shuffled.length) {
      onFinish(newAnswers);
    } else {
      setQIdx(function(i) { return i + 1; });
    }
  }

  var isCorrect = revealed && selected === q.answer;
  var correctZone = FIELD_ZONES.find(function(z) { return z.id === q.answer; });

  return h('div', { style: { paddingBottom: 20 } },
    h('div', { style: { padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(48,54,61,0.6)' } },
      h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
        h('span', { style: { fontSize: 12, fontWeight: 700, color: '#6b7280' } }, (qIdx + 1) + ' / ' + shuffled.length),
        h('span', { style: { fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399', fontWeight: 700 } }, 'FIELD ID')
      ),
      h('div', { style: { height: 3, background: 'rgba(48,54,61,0.8)', borderRadius: 2, overflow: 'hidden' } },
        h('div', { style: { height: '100%', width: ((qIdx / shuffled.length) * 100) + '%', background: '#10b981', borderRadius: 2 } })
      )
    ),
    h('div', { style: { padding: '12px 16px' } },
      h('div', { style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 10, padding: '12px 14px', marginBottom: 12, textAlign: 'center' } },
        h('p', { style: { fontSize: 14, fontWeight: 700, color: '#f0fdf4', margin: 0 } }, q.q),
        h('p', { style: { fontSize: 12, color: '#6b7280', marginTop: 4 } }, 'Tap the correct fielding zone on the oval')
      ),
      h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 } },
        h(CricketField, { onZoneClick: revealed ? null : handleZoneClick, selected: revealed ? null : selected, correct: revealed ? q.answer : null, showAll: revealed })
      ),
      revealed && h('div', { style: { padding: '12px 14px', borderRadius: 10, marginBottom: 12, background: isCorrect ? 'rgba(74,222,128,0.07)' : 'rgba(239,68,68,0.07)', border: '1px solid ' + (isCorrect ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)') } },
        h('div', { style: { fontSize: 12, fontWeight: 700, color: isCorrect ? '#4ade80' : '#f87171', marginBottom: 4 } }, isCorrect ? '✓ Correct!' : '✗ Incorrect'),
        correctZone && h('div', { style: { fontSize: 12, color: '#9ca3af' } }, q.answer.replace(/-/g, ' ').toUpperCase() + ': ' + correctZone.desc)
      ),
      !revealed && selected && h('button', { onClick: handleConfirm, style: { width: '100%', padding: '13px', border: 'none', borderRadius: 10, background: '#10b981', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8 } }, 'Confirm Position'),
      revealed && h('button', { onClick: handleNext, style: { width: '100%', padding: '13px', border: 'none', borderRadius: 10, background: '#16a34a', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, qIdx + 1 < shuffled.length ? 'Next →' : 'See Score →')
    )
  );
}

// ── Best scores display ────────────────────────────────────────────
function BestBadge(props) {
  var best = DB.get('quiz_best_' + props.mode);
  if (!best) return null;
  return h('span', { style: { fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b' } }, 'Best: ' + best + '%');
}

// ================================================================
// QUIZZES PAGE
// ================================================================
function QuizzesPage() {
  var [mode, setMode] = useState(null); // null=menu, 'timed'|'blitz'|'field'
  var [result, setResult] = useState(null);
  var [questions, setQuestions] = useState([]);

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function startMode(m) {
    setResult(null);
    if (m === 'timed') { setQuestions(shuffle(Q50).slice(0, 20)); }
    else if (m === 'blitz') { setQuestions(shuffle(TF_Q)); }
    else if (m === 'field') { setQuestions(shuffle(FIELD_QUESTIONS)); }
    setMode(m);
  }

  function handleFinish(answers) {
    if (mode === 'timed') {
      var score = answers.filter(function(a, i) { return a === questions[i].c; }).length;
      var emojis = answers.map(function(a, i) { return a === questions[i].c ? '🟩' : '🟥'; });
      setResult({ score: score, total: answers.length, emojis: emojis });
    } else if (mode === 'blitz') {
      var score2 = answers.filter(function(a) { return a.correct; }).length;
      var emojis2 = answers.map(function(a) { return a.correct ? '🟩' : '🟥'; });
      setResult({ score: score2, total: answers.length, emojis: emojis2 });
    } else if (mode === 'field') {
      var score3 = answers.filter(function(a) { return a.correct; }).length;
      var emojis3 = answers.map(function(a) { return a.correct ? '🟩' : '🟥'; });
      setResult({ score: score3, total: answers.length, emojis: emojis3 });
    }
  }

  // Result screen
  if (result) {
    return h(ResultScreen, { score: result.score, total: result.total, mode: mode, emojis: result.emojis,
      onPlayAgain: function() { startMode(mode); }, onHome: function() { setMode(null); setResult(null); } });
  }

  // Active mode
  if (mode === 'timed') return h('div', { style: { background: '#0d1117', minHeight: '100dvh' } },
    h('div', { style: { padding: 'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 12px', background: 'linear-gradient(135deg,#0c2340,#0d1117)' } },
      h('button', { onClick: function() { setMode(null); }, style: { background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600 } }, '‹ Exit'),
      h('h2', { style: { fontSize: 18, fontWeight: 800, color: '#f0fdf4', margin: '10px 0 4px' } }, '⚡ Cricket IQ — 20 Questions'),
      h('p', { style: { fontSize: 12, color: '#6b7280', margin: 0 } }, '30 seconds per question')
    ),
    h(TimedQuizMode, { questions: questions, onFinish: handleFinish })
  );

  if (mode === 'blitz') return h('div', { style: { background: '#0d1117', minHeight: '100dvh' } },
    h('div', { style: { padding: 'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 12px', background: 'linear-gradient(135deg,#1a0533,#0d1117)' } },
      h('button', { onClick: function() { setMode(null); }, style: { background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600 } }, '‹ Exit'),
      h('h2', { style: { fontSize: 18, fontWeight: 800, color: '#f0fdf4', margin: '10px 0 4px' } }, '⚡ T/F Blitz — 20 Questions'),
      h('p', { style: { fontSize: 12, color: '#6b7280', margin: 0 } }, '10 seconds per question — TRUE or FALSE')
    ),
    h(BlitzMode, { onFinish: handleFinish })
  );

  if (mode === 'field') return h('div', { style: { background: '#0d1117', minHeight: '100dvh' } },
    h('div', { style: { padding: 'max(3.5rem,calc(3.5rem + env(safe-area-inset-top))) 20px 12px', background: 'linear-gradient(135deg,#0a2c1a,#0d1117)' } },
      h('button', { onClick: function() { setMode(null); }, style: { background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: '7px 12px', color: '#9ca3af', cursor: 'pointer', fontSize: 13, fontWeight: 600 } }, '‹ Exit'),
      h('h2', { style: { fontSize: 18, fontWeight: 800, color: '#f0fdf4', margin: '10px 0 4px' } }, '🎯 Field Position ID'),
      h('p', { style: { fontSize: 12, color: '#6b7280', margin: 0 } }, 'Tap the correct zone on the oval')
    ),
    h(FieldPositionMode, { questions: questions, onFinish: handleFinish })
  );

  // Main menu
  return h('div', { style: { paddingBottom: 100, background: '#0d1117', minHeight: '100dvh' } },
    h(PageHeader, { title: 'Cricket Quizzes', subtitle: 'Test your cricket IQ across 3 game modes', gradient: 'linear-gradient(135deg,#1e40af,#7c3aed)' }),

    h('div', { style: { padding: '16px' } },
      // Modes
      [
        {
          id: 'timed', icon: '⚡', title: '20-Question IQ Test', color: '#3b82f6',
          desc: '20 questions, 30 seconds each. Batting, bowling, laws, history. Think fast.',
          bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.25)',
        },
        {
          id: 'blitz', icon: '🔥', title: 'True/False Blitz', color: '#8b5cf6',
          desc: '20 questions, 10 seconds each. Pure instinct. TAP TRUE or FALSE as fast as you can.',
          bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.25)',
        },
        {
          id: 'field', icon: '🎯', title: 'Field Position ID', color: '#10b981',
          desc: 'Tap the correct zone on the oval. Can you place every fielder? This is the hardest one.',
          bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.25)',
        },
      ].map(function(m) {
        return h('div', { key: m.id, style: { background: m.bg, border: '1px solid ' + m.border, borderRadius: 14, marginBottom: 12, overflow: 'hidden' } },
          h('div', { style: { height: 3, background: m.color } }),
          h('div', { style: { padding: '16px' } },
            h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 } },
              h('div', { style: { fontSize: 32, lineHeight: 1, flexShrink: 0 } }, m.icon),
              h('div', { style: { flex: 1 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 } },
                  h('div', { style: { fontSize: 15, fontWeight: 800, color: '#f0fdf4' } }, m.title),
                  h(BestBadge, { mode: m.id })
                ),
                h('div', { style: { fontSize: 12, color: '#8b949e', lineHeight: 1.6 } }, m.desc)
              )
            ),
            // Preview for field mode
            m.id === 'field' && h('div', { style: { display: 'flex', justifyContent: 'center', marginBottom: 10, opacity: 0.6 } },
              h(CricketField, { showAll: true })
            ),
            h('button', { onClick: function() { startMode(m.id); }, style: { width: '100%', padding: '12px', border: 'none', borderRadius: 10, background: m.color, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' } }, 'Start →')
          )
        );
      }),

      // Stats strip
      h('div', { style: { background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.9)', borderRadius: 12, padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 } },
        [['timed', 'IQ Test'], ['blitz', 'Blitz'], ['field', 'Field ID']].map(function(pair) {
          var best = DB.get('quiz_best_' + pair[0]);
          return h('div', { key: pair[0], style: { textAlign: 'center' } },
            h('div', { style: { fontSize: 16, fontWeight: 800, color: best ? '#f59e0b' : '#374151' } }, best ? best + '%' : '-'),
            h('div', { style: { fontSize: 10, fontWeight: 700, color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 } }, pair[1] + ' Best')
          );
        })
      )
    )
  );
}

A.QuizzesPage = QuizzesPage;
A.CricketField = CricketField;
console.log('[SC] app-quizzes.js v1.0 — QuizzesPage + 3 modes + field ID ready');
})();
