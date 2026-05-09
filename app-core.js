// ================================================================
// Save as: app-core.js
// SmartCrick AI — Core v3.1
// Added: getEncouragement(), mental rating DB, routine tracking DB
// ================================================================
(function () {
'use strict';

window.SC_APP = {};
const A = window.SC_APP;

const {
  createElement:h, useState, useEffect, useCallback,
  useRef, useContext, createContext, useMemo, Fragment, memo
} = React;
const { createRoot } = ReactDOM;
A.h = h; A.createRoot = createRoot; A.Fragment = Fragment; A.memo = memo;

// ── ErrorBoundary ─────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { err:null }; }
  static getDerivedStateFromError(e) { return { err:e }; }
  render() {
    if (this.state.err) return h('div',{style:{padding:'2rem',color:'#ef4444',fontFamily:'system-ui',textAlign:'center'}},
      h('div',{style:{fontSize:'3rem',marginBottom:'1rem'}},'⚠️'),
      h('h2',{style:{color:'#f8fafc',marginBottom:'.5rem'}},'Something went wrong'),
      h('p',{style:{color:'#94a3b8',fontSize:'.875rem',marginBottom:'1.5rem'}},this.state.err.message),
      h('button',{onClick:()=>{ this.setState({err:null}); A.nav('Home'); },
        style:{background:'#10b981',color:'#fff',border:'none',borderRadius:'.75rem',padding:'.75rem 1.5rem',fontWeight:700,cursor:'pointer'}
      },'Go Home')
    );
    return this.props.children;
  }
}
A.ErrorBoundary = ErrorBoundary;

// ── Theme Context ─────────────────────────────────────────────────
const ThemeCtx = createContext({ dark:true, toggle:()=>{} });
function useTheme() { return useContext(ThemeCtx); }
A.ThemeCtx = ThemeCtx;
A.useTheme = useTheme;

// ── Hash Router ───────────────────────────────────────────────────
function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/,'') || 'Home';
  const [page, qs] = hash.split('?');
  const params = {};
  if (qs) qs.split('&').forEach(p => { const [k,v]=p.split('='); if(k) params[k]=decodeURIComponent(v||''); });
  return { page, params };
}
function nav(page, params={}) {
  const qs = Object.keys(params).length ? '?'+Object.entries(params).map(([k,v])=>`${k}=${encodeURIComponent(v)}`).join('&') : '';
  window.location.hash = `#/${page}${qs}`;
}
function useRoute() {
  const [route, setRoute] = useState(getRoute);
  useEffect(()=>{
    const fn = ()=>setRoute(getRoute());
    window.addEventListener('hashchange', fn);
    return ()=>window.removeEventListener('hashchange', fn);
  },[]);
  return route;
}
A.getRoute = getRoute; A.nav = nav; A.useRoute = useRoute;

// ── LocalStorage DB ───────────────────────────────────────────────
const DB = {
  _k: k=>`sc_${k}`,
  get(k) { try { const v=localStorage.getItem(this._k(k)); return v?JSON.parse(v):null; } catch { return null; } },
  set(k,v) {
    try { localStorage.setItem(this._k(k),JSON.stringify(v)); } catch(e) { console.warn('SC:ls write',k,e); }
    try {
      if(typeof getPouchDB==='function'&&typeof SC_SYNC_KEYS!=='undefined'){
        var _pdb=getPouchDB(),_fk=this._k(k);
        if(_pdb&&SC_SYNC_KEYS.indexOf(_fk)!==-1){var _did='sc::'+_fk,_val=v;
          _pdb.get(_did).then(ex=>_pdb.put({...ex,value:_val,updatedAt:Date.now()}))
          .catch(e=>{if(e&&e.name==='not_found')return _pdb.put({_id:_did,value:_val,createdAt:Date.now(),updatedAt:Date.now()});})
          .catch(e=>console.warn('[SC]PouchDB:',k,e));}
      }
    } catch(e){}
    return v;
  },
  del(k) { try { localStorage.removeItem(this._k(k)); } catch {} },

  getProgress() {
    return Object.assign({
      total_xp:0,drills_done:0,mental_done:0,workouts_done:0,
      practice_minutes:0,current_streak:0,longest_streak:0,
      last_active_date:null,last_checkin_date:null,
      completed_drills:[],completed_mental:[],completed_workouts:[],
      badges:[],skill_path_progress:{},thirtyDay_completed:{}
    }, this.get('progress')||{});
  },
  saveProgress(v) { this.set('progress',v); },

  getXPLog() { return this.get('xp_log')||[]; },
  addXPEntry(xp,source) {
    const log=this.getXPLog(), today=new Date().toISOString().slice(0,10);
    log.push({date:today,xp,source,ts:Date.now()});
    this.set('xp_log',log.filter(e=>e.ts>Date.now()-90*864e5));
  },
  getXPLast7Days() {
    const log=this.getXPLog(), days=[];
    for(let i=6;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const ds=d.toISOString().slice(0,10), label=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      days.push({date:ds,label,xp:log.filter(e=>e.date===ds).reduce((s,e)=>s+e.xp,0)});
    }
    return days;
  },
  getActivityHeatmap() {
    const log=this.getXPLog(), map={}, days=[];
    log.forEach(e=>{ map[e.date]=(map[e.date]||0)+e.xp; });
    for(let i=29;i>=0;i--){
      const d=new Date(); d.setDate(d.getDate()-i);
      const date=d.toISOString().slice(0,10), xp=map[date]||0;
      days.push({date,xp,level:xp===0?0:xp<50?1:xp<150?2:xp<300?3:4});
    }
    return days;
  },

  getUser() { return this.get('user')||{}; },
  setUser(v) { this.set('user',v); },
  getGoals() { return this.get('goals')||[]; },
  saveGoals(v) { this.set('goals',v); },

  getSchedule() { return this.get('schedule')||{sessions:[]}; },
  saveSchedule(v) { this.set('schedule',v); },
  getSessionsForDate(ds) { return (this.getSchedule().sessions||[]).filter(s=>s.date===ds); },
  getSessionsForWeek(mondayStr) {
    const s=this.getSchedule().sessions||[], start=new Date(mondayStr+'T00:00:00'), end=new Date(start);
    end.setDate(start.getDate()+7);
    return s.filter(sess=>{const d=new Date(sess.date+'T00:00:00');return d>=start&&d<end;});
  },
  addSession(sess) { const sch=this.getSchedule(); sch.sessions=[...(sch.sessions||[]),sess]; this.saveSchedule(sch); },
  updateSession(id,updates) { const sch=this.getSchedule(); sch.sessions=(sch.sessions||[]).map(s=>s.id===id?{...s,...updates}:s); this.saveSchedule(sch); },
  deleteSession(id) { const sch=this.getSchedule(); sch.sessions=(sch.sessions||[]).filter(s=>s.id!==id); this.saveSchedule(sch); },

  // ── Drill Progress (D-A / D-B) ───────────────────────────────
  getDrillProgress() { return this.get('drill_progress')||{}; },
  saveDrillProgress(d) { this.set('drill_progress',d); },
  logDrillAttempt(drillId,rawScore,targetScore,targetType) {
    const prog=this.getDrillProgress();
    if(!prog[drillId]) prog[drillId]={attempts:[],personalBest:0,personalBestPct:0,tier:'none',targetType,targetScore,firstAttemptDate:new Date().toISOString().slice(0,10)};
    const pct=targetScore>0?Math.min(100,Math.round((rawScore/targetScore)*100)):0;
    prog[drillId].attempts.push({date:new Date().toISOString().slice(0,10),score:rawScore,targetScore,pct,ts:Date.now()});
    if(prog[drillId].attempts.length>30) prog[drillId].attempts=prog[drillId].attempts.slice(-30);
    if(rawScore>prog[drillId].personalBest) prog[drillId].personalBest=rawScore;
    if(pct>prog[drillId].personalBestPct) prog[drillId].personalBestPct=pct;
    prog[drillId].targetType=targetType; prog[drillId].targetScore=targetScore;
    prog[drillId].tier=this._calcDrillTier(prog[drillId].attempts);
    this.saveDrillProgress(prog);
    window.dispatchEvent(new CustomEvent('sc_update'));
    return prog[drillId];
  },
  getSingleDrillProgress(id) { return this.getDrillProgress()[id]||null; },
  getDrillTier(id) { return this.getDrillProgress()[id]?.tier||'none'; },
  _calcDrillTier(attempts) {
    if(!attempts||!attempts.length) return 'none';
    const hitOnce=attempts.some(a=>a.pct>=80);
    if(!hitOnce) return 'bronze';
    let consec=0;
    for(const a of attempts){ if(a.pct>=80){consec++;if(consec>=3) return 'gold';}else{consec=0;} }
    return 'silver';
  },
  getDrillRecentScores(id) { const d=this.getDrillProgress()[id]; return d?d.attempts.slice(-5).map(a=>({pct:a.pct,date:a.date})):[]},

  // ── Mental Rating (M-D) ────────────────────────────────────────
  getMentalRatings() { return this.get('mental_ratings')||[]; },
  saveMentalRating(sessionId,rating) {
    const ratings=this.getMentalRatings();
    ratings.push({sessionId,rating,date:new Date().toISOString().slice(0,10),ts:Date.now()});
    this.set('mental_ratings',ratings.filter(r=>r.ts>Date.now()-30*864e5)); // keep 30d
  },
  getAverageMentalRating(days=7) {
    const cutoff=Date.now()-days*864e5;
    const recent=this.getMentalRatings().filter(r=>r.ts>cutoff&&r.rating);
    if(!recent.length) return null;
    return (recent.reduce((s,r)=>s+r.rating,0)/recent.length).toFixed(1);
  },

  // ── Routine Tracking (M-C) ─────────────────────────────────────
  getCompletedRoutines() { return this.get('completed_routines')||[]; },
  logRoutineComplete(routineId,bonusXP) {
    const list=this.getCompletedRoutines();
    list.push({routineId,date:new Date().toISOString().slice(0,10),bonusXP,ts:Date.now()});
    this.set('completed_routines',list);
  },

  // ── Practice Session History (D-C) ────────────────────────────
  getPracticeSessionHistory() { return this.get('practice_sessions')||[]; },
  logPracticeSession(drillIds,totalXP,bonusXP) {
    const list=this.getPracticeSessionHistory();
    list.push({drillIds,totalXP,bonusXP,date:new Date().toISOString().slice(0,10),ts:Date.now()});
    this.set('practice_sessions',list.slice(-50));
  },
};
A.DB = DB;

// ── XP & Level System ────────────────────────────────────────────
const XP_LEVELS = [
  {level:1,name:'Rookie',min:0,max:500},{level:2,name:'Club Player',min:500,max:1200},
  {level:3,name:'District Star',min:1200,max:2500},{level:4,name:'State Performer',min:2500,max:5000},
  {level:5,name:'National Prospect',min:5000,max:9000},{level:6,name:'Elite Player',min:9000,max:15000},
  {level:7,name:'International',min:15000,max:25000},{level:8,name:'Pro Cricketer',min:25000,max:40000},
  {level:9,name:'World Class',min:40000,max:60000},{level:10,name:'Legend',min:60000,max:Infinity},
];
function getLevelInfo(totalXP) {
  const xp=totalXP||0; let lv=XP_LEVELS[0];
  for(let i=XP_LEVELS.length-1;i>=0;i--){ if(xp>=XP_LEVELS[i].min){lv=XP_LEVELS[i];break;} }
  const next=XP_LEVELS.find(l=>l.level===lv.level+1)||null;
  const pct=next?Math.min(100,((xp-lv.min)/(next.min-lv.min))*100):100;
  return {...lv,next,pct,xpToNext:next?Math.max(0,next.min-xp):0};
}
A.XP_LEVELS=XP_LEVELS; A.getLevelInfo=getLevelInfo;

const BADGE_DEFS = {
  first500:{icon:'zap',label:'First 500',desc:'Earned first 500 XP'},
  xp5k:{icon:'trophy',label:'5K Club',desc:'5,000 total XP'},
  streak3:{icon:'flame',label:'On Fire',desc:'3-day streak'},
  streak7:{icon:'flame',label:'Week Warrior',desc:'7-day streak'},
  streak14:{icon:'flame',label:'Fortnight',desc:'14-day streak'},
  streak30:{icon:'flame',label:'Monthly Legend',desc:'30 consecutive days'},
  drills10:{icon:'bat',label:'Drill Starter',desc:'10 drills done'},
  drills50:{icon:'bat',label:'Drill Master',desc:'50 drills done'},
  mental10:{icon:'brain',label:'Mind Builder',desc:'10 mental sessions'},
  mental25:{icon:'brain',label:'Mind Master',desc:'25 mental sessions'},
  min60:{icon:'clock',label:'First Hour',desc:'60 min of practice'},
  min600:{icon:'clock',label:'600 Min Club',desc:'600 min of practice'},
  workouts5:{icon:'dumbbell',label:'Fitness Start',desc:'5 workouts'},
  sched10:{icon:'calendar',label:'Scheduled Pro',desc:'10 scheduled sessions done'},
  drillSilver:{icon:'target',label:'Silver Driller',desc:'Hit a drill target metric'},
  drillGold:{icon:'star',label:'Gold Driller',desc:'Hit target 3 sessions in a row'},
  routine5:{icon:'brain',label:'Routine Runner',desc:'Completed 5 mental routines'},
  session5:{icon:'bat',label:'Session Builder',desc:'Built 5 practice sessions'},
};

function checkBadges(p) {
  const b=[...(p.badges||[])];
  const add=id=>{if(!b.includes(id))b.push(id);};
  if((p.total_xp||0)>=500) add('first500');
  if((p.total_xp||0)>=5000) add('xp5k');
  if((p.current_streak||0)>=3) add('streak3');
  if((p.current_streak||0)>=7) add('streak7');
  if((p.current_streak||0)>=14) add('streak14');
  if((p.current_streak||0)>=30) add('streak30');
  if((p.drills_done||0)>=10) add('drills10');
  if((p.drills_done||0)>=50) add('drills50');
  if((p.mental_done||0)>=10) add('mental10');
  if((p.mental_done||0)>=25) add('mental25');
  if((p.practice_minutes||0)>=60) add('min60');
  if((p.practice_minutes||0)>=600) add('min600');
  if((p.workouts_done||0)>=5) add('workouts5');
  const schedDone=(DB.getSchedule().sessions||[]).filter(s=>s.status==='complete').length;
  if(schedDone>=10) add('sched10');
  const dp=DB.getDrillProgress();
  if(Object.values(dp).some(d=>d.tier==='silver'||d.tier==='gold')) add('drillSilver');
  if(Object.values(dp).some(d=>d.tier==='gold')) add('drillGold');
  const routines=DB.getCompletedRoutines();
  if(routines.length>=5) add('routine5');
  const sessions=DB.getPracticeSessionHistory();
  if(sessions.length>=5) add('session5');
  return b;
}
A.BADGE_DEFS=BADGE_DEFS; A.checkBadges=checkBadges;

// ── Encouragement System ──────────────────────────────────────────
const _ENC = {
  drill_complete:[
    "Outstanding! Elite cricketers train exactly like this every day! 🏏",
    "Champions are built one drill at a time — that's you! ⭐",
    "Your future self is going to thank you for putting in this work! 💪",
    "Every great cricketer started exactly where you are. Keep going!",
    "That's the spirit! You're getting sharper with every session! 🎯",
    "Match-winner in the making! You've got what it takes! 🏆",
    "Brilliant work! The coaches would be proud of that effort!",
  ],
  mental_complete:[
    "Your mental game just levelled up! That's your secret weapon! 🧠",
    "Elite cricketers train their minds daily. Now so do you! ⚡",
    "The strongest players have the strongest minds — you're building that! 🌟",
    "A calm, focused mind is worth 100 extra runs. You're investing wisely!",
  ],
  routine_complete:[
    "Full routine completed! You just trained like a professional cricketer! 🏆",
    "Incredible commitment! Routine training separates good from GREAT! ⭐",
    "You completed the whole routine! That's elite level dedication! 🔥",
  ],
  session_complete:[
    "Full practice session done! That's a proper training day! 🔥",
    "You completed the entire session — that's what champions do! 🏆",
    "Outstanding! A complete session means real improvement! ⭐",
  ],
  gold_tier:"🥇 GOLD TIER! You've mastered this drill! Absolutely outstanding!",
  silver_tier:"🥈 Silver tier achieved! One step closer to mastering this drill!",
};

let _encCounters = {};
function getEncouragement(type, extra='') {
  const pool = _ENC[type];
  if(!pool) return extra || '';
  if(typeof pool==='string') return pool;
  const key = type;
  if(!_encCounters[key]) _encCounters[key]=0;
  const msg = pool[_encCounters[key] % pool.length];
  _encCounters[key]++;
  return msg;
}
A.getEncouragement = getEncouragement;

function awardXP(xp,minutes=0,source='general',completedKey=null,itemId=null) {
  try {
    const p=DB.getProgress(), today=new Date().toISOString().slice(0,10), yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(source==='checkin'){if(p.last_checkin_date===today){console.log('SC:checkin dup');return p;} p.last_checkin_date=today;}
    if(p.last_active_date===today){}
    else if(p.last_active_date===yesterday){p.current_streak=(p.current_streak||0)+1;p.longest_streak=Math.max(p.longest_streak||0,p.current_streak);}
    else{p.current_streak=1;p.longest_streak=Math.max(p.longest_streak||0,1);}
    p.last_active_date=today;
    p.total_xp=(p.total_xp||0)+xp;
    p.practice_minutes=(p.practice_minutes||0)+minutes;
    if(completedKey==='drill'&&itemId){p.completed_drills=p.completed_drills||[];if(!p.completed_drills.includes(itemId))p.completed_drills.push(itemId);p.drills_done=(p.drills_done||0)+1;}
    if(completedKey==='mental'&&itemId){p.completed_mental=p.completed_mental||[];if(!p.completed_mental.includes(itemId))p.completed_mental.push(itemId);p.mental_done=(p.mental_done||0)+1;}
    if(completedKey==='workout'&&itemId){p.completed_workouts=p.completed_workouts||[];if(!p.completed_workouts.includes(itemId))p.completed_workouts.push(itemId);p.workouts_done=(p.workouts_done||0)+1;}
    p.badges=checkBadges(p);
    DB.saveProgress(p); DB.addXPEntry(xp,source);
    window.dispatchEvent(new CustomEvent('sc_update'));
    showXPFlash(`+${xp} XP`);
    return p;
  } catch(e){console.error('awardXP error:',e);return DB.getProgress();}
}

function showXPFlash(text) {
  try{const el=document.createElement('div');el.className='xp-flash';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),1700);}catch{}
}
function fireConfetti() {
  try{if(typeof confetti!=='undefined')confetti({particleCount:90,spread:70,origin:{y:.65},colors:['#10b981','#34d399','#6ee7b7','#fff']});}catch{}
}
A.awardXP=awardXP; A.showXPFlash=showXPFlash; A.fireConfetti=fireConfetti;

// ── Date utilities ────────────────────────────────────────────────
function getWeekMonday(date){const d=new Date(date);d.setHours(0,0,0,0);const day=d.getDay();d.setDate(d.getDate()+(day===0?-6:1-day));return d;}
function dateStr(d){return d.toISOString().slice(0,10);}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function formatDate(str){const d=new Date(str+'T00:00:00');return d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});}
function isToday(str){return str===new Date().toISOString().slice(0,10);}
function fmtTime(s){const hh=Math.floor(s/3600),mm=Math.floor((s%3600)/60),sec=s%60;if(hh>0)return `${hh}:${String(mm).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;return `${String(mm).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;}
A.getWeekMonday=getWeekMonday; A.dateStr=dateStr; A.addDays=addDays;
A.formatDate=formatDate; A.isToday=isToday; A.fmtTime=fmtTime;

const SCHED_TYPES = {
  drill:{label:'Cricket Drill',icon:'bat',color:'#3b82f6',bg:'rgba(59,130,246,0.12)',border:'rgba(59,130,246,0.4)'},
  mental:{label:'Mental Session',icon:'brain',color:'#a855f7',bg:'rgba(168,85,247,0.12)',border:'rgba(168,85,247,0.4)'},
  fitness:{label:'Fitness',icon:'dumbbell',color:'#f97316',bg:'rgba(249,115,22,0.12)',border:'rgba(249,115,22,0.4)'},
  match:{label:'Match Day',icon:'wicket',color:'#f59e0b',bg:'rgba(245,158,11,0.12)',border:'rgba(245,158,11,0.4)'},
  rest:{label:'Rest & Recover',icon:'heart',color:'#16a34a',bg:'rgba(22,163,74,0.08)',border:'rgba(22,163,74,0.25)'},
  custom:{label:'Custom Session',icon:'list',color:'#8b949e',bg:'rgba(139,148,158,0.12)',border:'rgba(139,148,158,0.4)'},
};
A.SCHED_TYPES=SCHED_TYPES;

console.log('[SC] app-core v3.1 ready');
})();
