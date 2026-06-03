// Save as: app-core.js
// ================================================================
// SmartCrick AI — Core v3.2
// Added: 9 new DB methods, 7 new badges, calcMentalFitnessScore,
//        getFeaturedDrillId, generateTodaysMission, streak tokens,
//        first-session-of-day event, drill streak tracking
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
function nav(page, params) {
  var p = params || {};
  const qs = Object.keys(p).length ? '?'+Object.entries(p).map(function(kv){return kv[0]+'='+encodeURIComponent(kv[1]);}).join('&') : '';
  window.location.hash = '#/'+page+qs;
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
  _k: function(k){ return 'sc_'+k; },
  get: function(k) { try { var v=localStorage.getItem(this._k(k)); return v?JSON.parse(v):null; } catch(e) { return null; } },
  set: function(k,v) {
    try { localStorage.setItem(this._k(k),JSON.stringify(v)); } catch(e) { console.warn('SC:ls write',k,e); }
    try {
      if(typeof getPouchDB==='function'&&typeof SC_SYNC_KEYS!=='undefined'){
        var _pdb=getPouchDB(),_fk=this._k(k);
        if(_pdb&&SC_SYNC_KEYS.indexOf(_fk)!==-1){var _did='sc::'+_fk,_val=v;
          _pdb.get(_did).then(function(ex){return _pdb.put(Object.assign({},ex,{value:_val,updatedAt:Date.now()}));})
          .catch(function(e){if(e&&e.name==='not_found')return _pdb.put({_id:_did,value:_val,createdAt:Date.now(),updatedAt:Date.now()});})
          .catch(function(e){console.warn('[SC]PouchDB:',k,e);});}
      }
    } catch(e){}
    return v;
  },
  del: function(k) { try { localStorage.removeItem(this._k(k)); } catch(e) {} },

  getProgress: function() {
    return Object.assign({
      total_xp:0,drills_done:0,mental_done:0,workouts_done:0,
      practice_minutes:0,current_streak:0,longest_streak:0,
      last_active_date:null,last_checkin_date:null,
      completed_drills:[],completed_mental:[],completed_workouts:[],
      badges:[],skill_path_progress:{},thirtyDay_completed:{}
    }, this.get('progress')||{});
  },
  saveProgress: function(v) { this.set('progress',v); },

  getXPLog: function() { return this.get('xp_log')||[]; },
  addXPEntry: function(xp,source) {
    var log=this.getXPLog(), today=new Date().toISOString().slice(0,10);
    log.push({date:today,xp:xp,source:source,ts:Date.now()});
    this.set('xp_log',log.filter(function(e){return e.ts>Date.now()-90*864e5;}));
  },
  getXPLast7Days: function() {
    var log=this.getXPLog(), days=[];
    for(var i=6;i>=0;i--){
      var d=new Date(); d.setDate(d.getDate()-i);
      var ds=d.toISOString().slice(0,10), label=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      days.push({date:ds,label:label,xp:log.filter(function(e){return e.date===ds;}).reduce(function(s,e){return s+e.xp;},0)});
    }
    return days;
  },
  getActivityHeatmap: function() {
    var log=this.getXPLog(), map={}, days=[];
    log.forEach(function(e){ map[e.date]=(map[e.date]||0)+e.xp; });
    for(var i=29;i>=0;i--){
      var d=new Date(); d.setDate(d.getDate()-i);
      var date=d.toISOString().slice(0,10), xp=map[date]||0;
      days.push({date:date,xp:xp,level:xp===0?0:xp<50?1:xp<150?2:xp<300?3:4});
    }
    return days;
  },

  getUser: function() { return this.get('user')||{}; },
  setUser: function(v) { this.set('user',v); },
  getGoals: function() { return this.get('goals')||[]; },
  saveGoals: function(v) { this.set('goals',v); },

  getSchedule: function() { return this.get('schedule')||{sessions:[]}; },
  saveSchedule: function(v) { this.set('schedule',v); },
  getSessionsForDate: function(ds) { return (this.getSchedule().sessions||[]).filter(function(s){return s.date===ds;}); },
  getSessionsForWeek: function(mondayStr) {
    var s=this.getSchedule().sessions||[], start=new Date(mondayStr+'T00:00:00'), end=new Date(start);
    end.setDate(start.getDate()+7);
    return s.filter(function(sess){var d=new Date(sess.date+'T00:00:00');return d>=start&&d<end;});
  },
  addSession: function(sess) { var sch=this.getSchedule(); sch.sessions=[].concat(sch.sessions||[],[sess]); this.saveSchedule(sch); },
  updateSession: function(id,updates) { var sch=this.getSchedule(); sch.sessions=(sch.sessions||[]).map(function(s){return s.id===id?Object.assign({},s,updates):s;}); this.saveSchedule(sch); },
  deleteSession: function(id) { var sch=this.getSchedule(); sch.sessions=(sch.sessions||[]).filter(function(s){return s.id!==id;}); this.saveSchedule(sch); },

  // ── Drill Progress (D-A / D-B) ───────────────────────────────
  getDrillProgress: function() { return this.get('drill_progress')||{}; },
  saveDrillProgress: function(d) { this.set('drill_progress',d); },
  logDrillAttempt: function(drillId,rawScore,targetScore,targetType) {
    var prog=this.getDrillProgress();
    if(!prog[drillId]) prog[drillId]={attempts:[],personalBest:0,personalBestPct:0,tier:'none',targetType:targetType,targetScore:targetScore,firstAttemptDate:new Date().toISOString().slice(0,10)};
    var pct=targetScore>0?Math.min(100,Math.round((rawScore/targetScore)*100)):0;
    prog[drillId].attempts.push({date:new Date().toISOString().slice(0,10),score:rawScore,targetScore:targetScore,pct:pct,ts:Date.now()});
    if(prog[drillId].attempts.length>30) prog[drillId].attempts=prog[drillId].attempts.slice(-30);
    if(rawScore>prog[drillId].personalBest) prog[drillId].personalBest=rawScore;
    if(pct>prog[drillId].personalBestPct) prog[drillId].personalBestPct=pct;
    prog[drillId].targetType=targetType; prog[drillId].targetScore=targetScore;
    prog[drillId].tier=this._calcDrillTier(prog[drillId].attempts);
    this.saveDrillProgress(prog);
    // ELO update hook
    if (window.SC_APP && window.SC_APP.ELOSystem) {
      try { window.SC_APP.ELOSystem.updateELO(drillId, rawScore, targetScore); } catch(e) {}
    }
    // KudosService hook
    if (window.SC_APP && window.SC_APP.KudosService) {
      try {
        var _kDrill = (window.SC_APP.DRILLS || []).find(function(d){ return d.id===drillId; });
        var _kCat = _kDrill ? _kDrill.category : '';
        var _kPrevBest = prog[drillId].attempts.length > 1 ? Math.max.apply(null, prog[drillId].attempts.slice(0,-1).map(function(a){return a.score||0;})) : 0;
        if (pct >= 100) {
          window.SC_APP.KudosService.enqueue('drill_100pct', { category: _kCat, drillId: drillId });
        } else if (rawScore > _kPrevBest && _kPrevBest > 0) {
          window.SC_APP.KudosService.enqueue('drill_pb', { category: _kCat, drillId: drillId });
        }
      } catch(e) {}
    }
    window.dispatchEvent(new CustomEvent('sc_update'));
    // Intelligence aggregator hook
    if (window.SC_INTEL) {
      try {
        var drillObj = (window.SC_APP && window.SC_APP.DRILLS || []).find(function(d){ return d.id===drillId; });
        window.SC_INTEL.updateOnDrill(drillObj || { id:drillId });
      } catch(e) {}
    }
    return prog[drillId];
  },
  getSingleDrillProgress: function(id) { return this.getDrillProgress()[id]||null; },
  getDrillTier: function(id) { return (this.getDrillProgress()[id]||{}).tier||'none'; },
  _calcDrillTier: function(attempts) {
    if(!attempts||!attempts.length) return 'none';
    var hitOnce=attempts.some(function(a){return a.pct>=80;});
    if(!hitOnce) return 'bronze';
    var consec=0;
    for(var i=0;i<attempts.length;i++){ if(attempts[i].pct>=80){consec++;if(consec>=3) return 'gold';}else{consec=0;} }
    return 'silver';
  },
  getDrillRecentScores: function(id) { var d=this.getDrillProgress()[id]; return d?d.attempts.slice(-5).map(function(a){return {pct:a.pct,date:a.date};}):[]},

  // ── Mental Rating (M-D) ────────────────────────────────────────
  getMentalRatings: function() { return this.get('mental_ratings')||[]; },
  saveMentalRating: function(sessionId,rating) {
    var ratings=this.getMentalRatings();
    ratings.push({sessionId:sessionId,rating:rating,date:new Date().toISOString().slice(0,10),ts:Date.now()});
    this.set('mental_ratings',ratings.filter(function(r){return r.ts>Date.now()-30*864e5;}));
    // Intelligence aggregator hook — detect session type from ID
    if (window.SC_INTEL) {
      try {
        var mtype = null;
        var mtypes = ['BREATH','GROUND','VISUALIZE','ACTIVATE','RECOVER','REFLECT','PRESSURE'];
        if (sessionId) mtypes.forEach(function(t){ if(sessionId.toUpperCase().indexOf(t)!==-1) mtype=t; });
        window.SC_INTEL.updateOnMental(mtype, rating);
      } catch(e) {}
    }
  },
  getAverageMentalRating: function(days) {
    var d=days||7, cutoff=Date.now()-d*864e5;
    var recent=this.getMentalRatings().filter(function(r){return r.ts>cutoff&&r.rating;});
    if(!recent.length) return null;
    return (recent.reduce(function(s,r){return s+r.rating;},0)/recent.length).toFixed(1);
  },

  // ── Routine Tracking (M-C) ─────────────────────────────────────
  getCompletedRoutines: function() { return this.get('completed_routines')||[]; },
  logRoutineComplete: function(routineId,bonusXP) {
    var list=this.getCompletedRoutines();
    list.push({routineId:routineId,date:new Date().toISOString().slice(0,10),bonusXP:bonusXP,ts:Date.now()});
    this.set('completed_routines',list);
  },

  // ── Practice Session History (D-C) ────────────────────────────
  getPracticeSessionHistory: function() { return this.get('practice_sessions')||[]; },
  logPracticeSession: function(drillIds,totalXP,bonusXP) {
    var list=this.getPracticeSessionHistory();
    list.push({drillIds:drillIds,totalXP:totalXP,bonusXP:bonusXP,date:new Date().toISOString().slice(0,10),ts:Date.now()});
    this.set('practice_sessions',list.slice(-50));
  },

  // ── Challenge Shield (C-7) ────────────────────────────────────
  getChallengeShield: function() { return this.get('challenge_shield')||{lastMissDate:null,shieldUsed:false}; },
  saveChallengeShield: function(v) { this.set('challenge_shield',v); },

  // ── Streak Tokens (RET-2) ─────────────────────────────────────
  getStreakTokens: function() { return this.get('streak_tokens')||0; },
  setStreakTokens: function(n) { this.set('streak_tokens',n); },

  // ── Weekly XP Goal (RET-3) ────────────────────────────────────
  getWeeklyXPGoal: function() { return this.get('weekly_xp_goal')||200; },
  setWeeklyXPGoal: function(n) { this.set('weekly_xp_goal',n); },

  // ── Today's Mission (RET-1) ───────────────────────────────────
  getTodaysMission: function() { return this.get('todays_mission')||null; },
  saveTodaysMission: function(v) { this.set('todays_mission',v); },

  // ── Mental Favorites (MT-3) ───────────────────────────────────
  getMentalFavorites: function() { return this.get('mental_favorites')||[]; },
  toggleMentalFavorite: function(id) {
    var f=this.getMentalFavorites();
    var i=f.indexOf(id);
    if(i===-1) f.push(id); else f.splice(i,1);
    this.set('mental_favorites',f);
    return f.slice();
  },

  // ── Drill Streaks (DR-2) ──────────────────────────────────────
  getDrillStreaks: function() { return this.get('drill_streaks')||{}; },
  updateDrillStreak: function(drillId) {
    var st=this.getDrillStreaks();
    var today=new Date().toISOString().slice(0,10);
    var yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(!st[drillId]) st[drillId]={streak:0,lastDate:null};
    var ds=st[drillId];
    if(ds.lastDate===today) return ds;
    ds.streak=(ds.lastDate===yesterday)?ds.streak+1:1;
    ds.lastDate=today;
    this.set('drill_streaks',st);
    return ds;
  },

  // ── Challenge Reflections (C-10) ─────────────────────────────
  getChallengeReflections: function() { return this.get('challenge_reflections')||{}; },
  saveChallengeReflection: function(dayNum,text) {
    var r=this.getChallengeReflections();
    r[dayNum]=text;
    this.set('challenge_reflections',r);
  },

  // ── Featured Drill (DR-3) ────────────────────────────────────
  getFeaturedDrill: function() { return this.get('featured_drill')||null; },
  setFeaturedDrill: function(v) { this.set('featured_drill',v); },

  // ── Drill Favorites (P5-B) ────────────────────────────────────
  getDrillFavorites: function() { return this.get('drill_favorites')||[]; },
  toggleDrillFavorite: function(id) {
    var f=this.getDrillFavorites();
    var i=f.indexOf(id);
    if(i===-1) f.push(id); else f.splice(i,1);
    this.set('drill_favorites',f);
    return f.slice();
  },

  // ── Drill Notes (P5-B) ────────────────────────────────────────
  getDrillNotes: function() { return this.get('drill_notes')||{}; },
  saveDrillNote: function(id, text) {
    var notes=this.getDrillNotes();
    if(text && text.trim()) notes[id]={text:text.trim(),updatedAt:new Date().toISOString()};
    else delete notes[id];
    this.set('drill_notes',notes);
  },
  getDrillNote: function(id) { return (this.getDrillNotes()[id])||null; },

  // ── Prestige (P8-C) ──────────────────────────────────────────
  getPrestige: function() { return this.get('prestige')||0; },
  setPrestige: function(n) { this.set('prestige',n); },

  // ── Monthly Challenge Progress (P5-E) ─────────────────────────
  getMonthlyProgress: function() { return this.get('monthly_progress')||{}; },
  saveMonthlyProgress: function(v) { this.set('monthly_progress',v); },

  // ── ProVision™ Video Sessions (VA) ────────────────────────────
  getVideoSessions: function() { return this.get('video_sessions')||[]; },
  saveVideoSession: function(session) {
    var s=Object.assign({},session); delete s.landmarks; // strip large data before storing
    var list=this.getVideoSessions();
    list.push(s);
    if(list.length>50) list=list.slice(-50);
    this.set('video_sessions',list);
    // Intelligence aggregator hook
    if (window.SC_INTEL) { try { window.SC_INTEL.updateOnVideo(); } catch(e) {} }
  },
  getVideoSessionsByMode: function(mode) {
    return this.getVideoSessions().filter(function(s){return s.mode===mode;});
  },

  // ── ELO Rating System (ELO-1) ─────────────────────────────────
  getELORatings: function() {
    return Object.assign({ batting:1000, bowling:1000, fielding:1000, wicketkeeping:1000, fitness:1000, mental:1000 }, this.get('elo_ratings')||{});
  },
  saveELORatings: function(v) { this.set('elo_ratings', v); },
  getELOHistory: function(cat) {
    var h = this.get('elo_history') || {};
    return h[cat] || [];
  },
  saveELOHistoryEntry: function(cat, entry) {
    var h = this.get('elo_history') || {};
    h[cat] = (h[cat] || []).concat([entry]).slice(-20);
    this.set('elo_history', h);
  },

  // ── Agile Streak System (AGS-1) ───────────────────────────────
  getStreakPause: function() { return this.get('streak_pause') || { pausedUntil: null, pausedOn: null, pauseDays: 0 }; },
  saveStreakPause: function(v) { this.set('streak_pause', v); },
  getDailyGoalLevel: function() { return this.get('daily_goal_level') || 'standard'; },
  setDailyGoalLevel: function(v) { this.set('daily_goal_level', v); },
  getDailyGoalState: function() {
    var today = new Date().toISOString().slice(0, 10);
    var s = this.get('daily_goal_state') || {};
    if (s.date !== today) {
      s = { date: today, activitiesCount: 0, goalMet: false };
      this.set('daily_goal_state', s);
    }
    return s;
  },
  incrementDailyActivity: function() {
    var s = this.getDailyGoalState();
    s.activitiesCount = (s.activitiesCount || 0) + 1;
    var thresholds = { minimal: 1, standard: 2, elite: 3 };
    var required = thresholds[this.getDailyGoalLevel()] || 2;
    var wasNotMet = !s.goalMet;
    if (s.activitiesCount >= required) s.goalMet = true;
    this.set('daily_goal_state', s);
    return { state: s, justMet: wasNotMet && s.goalMet };
  },
  getDailyTargets: function() {
    return Object.assign({ drills: 3, xp: 150, streakGoal: 7 }, this.get('daily_targets') || {});
  },
  saveDailyTargets: function(v) { this.set('daily_targets', v); },
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
  var xp=totalXP||0, lv=XP_LEVELS[0];
  for(var i=XP_LEVELS.length-1;i>=0;i--){ if(xp>=XP_LEVELS[i].min){lv=XP_LEVELS[i];break;} }
  var next=XP_LEVELS.filter(function(l){return l.level===lv.level+1;})[0]||null;
  var pct=next?Math.min(100,((xp-lv.min)/(next.min-lv.min))*100):100;
  return Object.assign({},lv,{next:next,pct:pct,xpToNext:next?Math.max(0,next.min-xp):0});
}
A.XP_LEVELS=XP_LEVELS; A.getLevelInfo=getLevelInfo;

const BADGE_DEFS = {
  // Onboarding / Profile
  joined:        {icon:'rocket',  label:'SmartCrick Member', desc:'Joined the SmartCrick family'},
  profile_done:  {icon:'user',    label:'Full Profile',      desc:'Completed your player profile'},
  // Drill favorites
  drillFav5:     {icon:'heart',   label:'Drill Collector',   desc:'Saved 5 favourite drills'},
  drill_notes5:  {icon:'pencil',  label:'Note Taker',        desc:'Added notes to 5 drills'},
  // Assessment
  first_rating:  {icon:'target',  label:'Self-Aware',        desc:'Completed your first skill assessment'},
  rating_80:     {icon:'star',    label:'Rated 80+',         desc:'Achieved a player rating over 80'},
  // Prestige
  prestige1:     {icon:'crown',   label:'Prestige I',        desc:'Reset XP for the first time — elite dedication'},
  prestige2:     {icon:'crown',   label:'Prestige II',       desc:'Double prestige — legendary'},
  prestige3:     {icon:'crown',   label:'Prestige III',      desc:'Triple prestige — you are the game'},
  // XP milestones
  first500:{icon:'zap',label:'First 500',desc:'Earned first 500 XP'},
  xp5k:{icon:'trophy',label:'5K Club',desc:'5,000 total XP'},
  // Streaks
  streak3:{icon:'flame',label:'On Fire',desc:'3-day streak'},
  streak7:{icon:'flame',label:'Week Warrior',desc:'7-day streak'},
  streak14:{icon:'flame',label:'Fortnight',desc:'14-day streak'},
  streak30:{icon:'flame',label:'Monthly Legend',desc:'30 consecutive days'},
  // Drills
  drills10:{icon:'bat',label:'Drill Starter',desc:'10 drills done'},
  drills50:{icon:'bat',label:'Drill Master',desc:'50 drills done'},
  // Mental
  mental10:{icon:'brain',label:'Mind Builder',desc:'10 mental sessions'},
  mental25:{icon:'brain',label:'Mind Master',desc:'25 mental sessions'},
  // Minutes
  min60:{icon:'clock',label:'First Hour',desc:'60 min of practice'},
  min600:{icon:'clock',label:'600 Min Club',desc:'600 min of practice'},
  // Other
  workouts5:{icon:'dumbbell',label:'Fitness Start',desc:'5 workouts'},
  sched10:{icon:'calendar',label:'Scheduled Pro',desc:'10 scheduled sessions done'},
  drillSilver:{icon:'target',label:'Silver Driller',desc:'Hit a drill target metric'},
  drillGold:{icon:'star',label:'Gold Driller',desc:'Hit target 3 sessions in a row'},
  routine5:{icon:'brain',label:'Routine Runner',desc:'Completed 5 mental routines'},
  session5:{icon:'bat',label:'Session Builder',desc:'Built 5 practice sessions'},
  // 30-Day Challenge milestones
  week1:{icon:'target',label:'Foundation Week',desc:'Completed Week 1 of the 30-Day Challenge'},
  week2:{icon:'target',label:'Development Week',desc:'Completed Week 2 of the 30-Day Challenge'},
  week3:{icon:'flame',label:'Pressure Week',desc:'Completed Week 3 of the 30-Day Challenge'},
  challenge_complete:{icon:'crown',label:'30-Day Champion',desc:'Completed the full 30-Day Challenge!'},
  // Drill streaks
  drillStreak3:{icon:'flame',label:'Drill Streak 3',desc:'3-day drill streak on one drill'},
  drillStreak7:{icon:'flame',label:'Drill Streak 7',desc:'7-day streak — drilled like a pro!'},
  // Mental consistency
  mentalStreak3:{icon:'brain',label:'Focus Streak',desc:'3 consecutive days of mental training'},
  // ELO Mastery milestones
  batting_elo_1100: {icon:'bat',  label:'Batting Rising',       desc:'Batting ELO reached 1100'},
  batting_elo_1200: {icon:'bat',  label:'Batting Master',       desc:'Batting ELO reached 1200'},
  bowling_elo_1100: {icon:'ball', label:'Bowling Rising',       desc:'Bowling ELO reached 1100'},
  bowling_elo_1200: {icon:'ball', label:'Bowling Master',       desc:'Bowling ELO reached 1200'},
  allround_elo:     {icon:'star', label:'All-Round Excellence', desc:'Two skill categories above ELO 1100'},
  elo_streak:       {icon:'zap',  label:'Rising Star',          desc:'ELO improved in 3 sessions in a row'},
};

function checkBadges(p) {
  var b=[].concat(p.badges||[]);
  var add=function(id){ if(b.indexOf(id)===-1) b.push(id); };
  // Drill favorites
  var favs=DB.getDrillFavorites();
  if(favs.length>=5) add('drillFav5');
  // Drill notes
  var notes=DB.getDrillNotes();
  if(Object.keys(notes).length>=5) add('drill_notes5');
  // Assessment
  if(DB.get('last_assessment_date')) add('first_rating');
  // Prestige
  var prestige=DB.getPrestige();
  if(prestige>=1) add('prestige1');
  if(prestige>=2) add('prestige2');
  if(prestige>=3) add('prestige3');
  // XP milestones
  if((p.total_xp||0)>=500)  add('first500');
  if((p.total_xp||0)>=5000) add('xp5k');
  // Streaks
  if((p.current_streak||0)>=3)  add('streak3');
  if((p.current_streak||0)>=7)  add('streak7');
  if((p.current_streak||0)>=14) add('streak14');
  if((p.current_streak||0)>=30) add('streak30');
  // Drills
  if((p.drills_done||0)>=10) add('drills10');
  if((p.drills_done||0)>=50) add('drills50');
  // Mental
  if((p.mental_done||0)>=10) add('mental10');
  if((p.mental_done||0)>=25) add('mental25');
  // Minutes
  if((p.practice_minutes||0)>=60)  add('min60');
  if((p.practice_minutes||0)>=600) add('min600');
  // Workouts
  if((p.workouts_done||0)>=5) add('workouts5');
  // Schedule
  var schedDone=(DB.getSchedule().sessions||[]).filter(function(s){return s.status==='complete';}).length;
  if(schedDone>=10) add('sched10');
  // Drill tiers
  var dp=DB.getDrillProgress();
  var dpVals=Object.keys(dp).map(function(k){return dp[k];});
  if(dpVals.some(function(d){return d.tier==='silver'||d.tier==='gold';})) add('drillSilver');
  if(dpVals.some(function(d){return d.tier==='gold';})) add('drillGold');
  // Routines / sessions
  var routines=DB.getCompletedRoutines();
  if(routines.length>=5) add('routine5');
  var sessions=DB.getPracticeSessionHistory();
  if(sessions.length>=5) add('session5');
  // 30-Day Challenge milestones
  var tdc=p.thirtyDay_completed||{};
  var tdcCount=Object.keys(tdc).length;
  if(tdcCount>=7)  add('week1');
  if(tdcCount>=14) add('week2');
  if(tdcCount>=21) add('week3');
  if(tdcCount>=30) add('challenge_complete');
  // Drill streaks
  var dstreaks=DB.getDrillStreaks();
  var dstreakVals=Object.keys(dstreaks).map(function(k){return dstreaks[k];});
  if(dstreakVals.some(function(d){return d.streak>=3;})) add('drillStreak3');
  if(dstreakVals.some(function(d){return d.streak>=7;})) add('drillStreak7');
  // Mental consistency (3 consecutive days with mental XP)
  var mRatings=DB.getMentalRatings();
  var xpLog=DB.getXPLog();
  var last3=[];
  for(var mi=0;mi<3;mi++){var mdate=new Date();mdate.setDate(mdate.getDate()-mi);last3.push(mdate.toISOString().slice(0,10));}
  if(last3.every(function(date){return xpLog.some(function(e){return e.date===date&&e.source==='mental';});})) add('mentalStreak3');
  // ELO Mastery milestones
  var _elo=DB.getELORatings();
  if((_elo.batting||1000)>=1100) add('batting_elo_1100');
  if((_elo.batting||1000)>=1200) add('batting_elo_1200');
  if((_elo.bowling||1000)>=1100) add('bowling_elo_1100');
  if((_elo.bowling||1000)>=1200) add('bowling_elo_1200');
  var _aboveCats=Object.keys(_elo).filter(function(c){return(_elo[c]||1000)>=1100;});
  if(_aboveCats.length>=2) add('allround_elo');
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

var _encCounters = {};
function getEncouragement(type, extra) {
  var pool = _ENC[type];
  if(!pool) return extra || '';
  if(typeof pool==='string') return pool;
  var key = type;
  if(!_encCounters[key]) _encCounters[key]=0;
  var msg = pool[_encCounters[key] % pool.length];
  _encCounters[key]++;
  return msg;
}
A.getEncouragement = getEncouragement;

// ── Mental Fitness Score (MT-1) ───────────────────────────────────
function calcMentalFitnessScore() {
  var p=DB.getProgress();
  var sessions=Math.min((p.mental_done||0)/50,1)*40;
  var ratings=DB.getMentalRatings();
  var recent=ratings.filter(function(r){return r.ts>Date.now()-7*864e5;});
  var avgR=recent.length?(recent.reduce(function(s,r){return s+r.rating;},0)/recent.length)/5:0;
  var ratingScore=avgR*30;
  var xpLog=DB.getXPLast7Days();
  var activeDays=xpLog.filter(function(d){return d.xp>0;}).length;
  var consistencyScore=(activeDays/7)*30;
  return Math.round(sessions+ratingScore+consistencyScore);
}
A.calcMentalFitnessScore = calcMentalFitnessScore;

// ── Featured Drill ID (DR-3) ──────────────────────────────────────
function getFeaturedDrillId() {
  var now=new Date();
  var start=new Date(now.getFullYear(),0,1);
  var dayOfYear=Math.floor((now-start)/(86400000));
  var weekNum=Math.ceil((dayOfYear+1)/7);
  var stored=DB.getFeaturedDrill();
  if(stored&&stored.weekNum===weekNum) return stored.drillId;
  var drills=window.SC_APP.DRILLS;
  if(!drills||!drills.length) return null;
  var pick=drills[weekNum%drills.length];
  if(pick) DB.setFeaturedDrill({weekNum:weekNum,drillId:pick.id});
  return pick?pick.id:null;
}
A.getFeaturedDrillId = getFeaturedDrillId;

// ── Today's Mission Generator (RET-1) ────────────────────────────
function generateTodaysMission() {
  var today=new Date().toISOString().slice(0,10);
  var ex=DB.getTodaysMission();
  if(ex&&ex.date===today) return ex;
  var p=DB.getProgress();
  var done=p.completed_drills||[], doneMental=p.completed_mental||[];
  var drills=window.SC_APP.DRILLS||[];
  var mental=window.SC_APP.MENTAL_SESSIONS||[];
  // Prefer lowest-ELO category drill as today's recommendation
  var _eloR=DB.getELORatings();
  var _cats=['batting','bowling','fielding','wicketkeeping','fitness'];
  var _lowestCat=_cats.reduce(function(a,b){return (_eloR[a]||1000)<=(_eloR[b]||1000)?a:b;},'batting');
  var drillPick=drills.find(function(d){return !done.includes(d.id)&&d.category===_lowestCat;})
    ||drills.find(function(d){return !done.includes(d.id)&&d.category==='batting';})
    ||drills.find(function(d){return !done.includes(d.id);})
    ||(drills[0]||null);
  var mentalPick=mental.find(function(m){return !doneMental.includes(m.id)&&!m.is_premium;})
    ||(mental[0]||null);
  var mission={date:today,drillId:drillPick?drillPick.id:null,mentalId:mentalPick?mentalPick.id:null,drillDone:false,mentalDone:false};
  DB.saveTodaysMission(mission);
  return mission;
}
A.generateTodaysMission = generateTodaysMission;

// ── awardXP ───────────────────────────────────────────────────────
function awardXP(xp,minutes,source,completedKey,itemId) {
  var mins=minutes||0, src=source||'general', ck=completedKey||null, iid=itemId||null;
  try {
    var p=DB.getProgress(), today=new Date().toISOString().slice(0,10), yesterday=new Date(Date.now()-86400000).toISOString().slice(0,10);
    if(src==='checkin'){if(p.last_checkin_date===today){console.log('SC:checkin dup');return p;} p.last_checkin_date=today;}
    // Track if this is the first award of the day
    var wasNewDay=(p.last_active_date!==today);
    // Agile Streak: check pause window and auto-consume token
    var _pause=DB.getStreakPause();
    var _isPaused=_pause.pausedUntil&&today<=_pause.pausedUntil;
    if(!_isPaused){
      if(p.last_active_date===today){}
      else if(p.last_active_date===yesterday){p.current_streak=(p.current_streak||0)+1;p.longest_streak=Math.max(p.longest_streak||0,p.current_streak);}
      else{
        var _tokens=DB.getStreakTokens();
        if(_tokens>0&&p.last_active_date&&p.last_active_date!==today){
          DB.setStreakTokens(_tokens-1);
          p.current_streak=(p.current_streak||0)+1;p.longest_streak=Math.max(p.longest_streak||0,p.current_streak);
          window.dispatchEvent(new CustomEvent('sc_streak_token_used',{detail:{remaining:_tokens-1}}));
        } else {p.current_streak=1;p.longest_streak=Math.max(p.longest_streak||0,1);}
      }
      p.last_active_date=today;
    }
    // Award streak token every 7-day milestone (once per day)
    if(wasNewDay&&p.current_streak>0&&p.current_streak%7===0){
      DB.setStreakTokens(DB.getStreakTokens()+1);
    }
    // ── Streak XP multiplier (P5-H) ──────────────────────────────
    var streak=p.current_streak||0;
    var multiplier=streak>=30?1.5:streak>=14?1.3:streak>=7?1.2:streak>=3?1.1:1.0;
    var finalXP=Math.round(xp*multiplier);
    p.total_xp=(p.total_xp||0)+finalXP;
    p.practice_minutes=(p.practice_minutes||0)+mins;
    if(ck==='drill'&&iid){p.completed_drills=p.completed_drills||[];if(p.completed_drills.indexOf(iid)===-1)p.completed_drills.push(iid);p.drills_done=(p.drills_done||0)+1;}
    if(ck==='mental'&&iid){p.completed_mental=p.completed_mental||[];if(p.completed_mental.indexOf(iid)===-1)p.completed_mental.push(iid);p.mental_done=(p.mental_done||0)+1;}
    if(ck==='workout'&&iid){p.completed_workouts=p.completed_workouts||[];if(p.completed_workouts.indexOf(iid)===-1)p.completed_workouts.push(iid);p.workouts_done=(p.workouts_done||0)+1;}
    var _beforeLevel=A.getLevelInfo((p.total_xp||0)-finalXP).level;
    var _afterLevel=A.getLevelInfo(p.total_xp||0).level;
    p.badges=checkBadges(p);
    DB.saveProgress(p); DB.addXPEntry(finalXP,src);
    // Daily goal tracking
    var _goalResult=DB.incrementDailyActivity();
    if(_goalResult.justMet) window.dispatchEvent(new CustomEvent('sc_daily_goal_met',{detail:{level:DB.getDailyGoalLevel()}}));
    window.dispatchEvent(new CustomEvent('sc_update'));
    // Level-up hooks
    if(_afterLevel>_beforeLevel){
      window.dispatchEvent(new CustomEvent('sc_level_up',{detail:{level:_afterLevel}}));
      if(window.SC_APP&&window.SC_APP.KudosService){try{window.SC_APP.KudosService.enqueue('level_up',{level:_afterLevel});}catch(e){}}
      if(window.SC_APP&&window.SC_APP.CardPackService){try{window.SC_APP.CardPackService.triggerPack('level_up');}catch(e){}}
    }
    var flashText = multiplier>1
      ? '+'+xp+' ×'+multiplier.toFixed(1)+' = +'+finalXP+' XP 🔥'
      : '+'+finalXP+' XP';
    showXPFlash(flashText);
    // First session of day event (for RET-6 celebration toast)
    if(wasNewDay&&src!=='checkin') {
      window.dispatchEvent(new CustomEvent('sc_first_session',{detail:{date:today}}));
    }
    return p;
  } catch(e){console.error('awardXP error:',e);return DB.getProgress();}
}

function showXPFlash(text) {
  try{var el=document.createElement('div');el.className='xp-flash';el.textContent=text;document.body.appendChild(el);setTimeout(function(){el.remove();},1700);}catch(e){}
}
function fireConfetti() {
  try{if(typeof confetti!=='undefined')confetti({particleCount:90,spread:70,origin:{y:.65},colors:['#10b981','#34d399','#6ee7b7','#fff']});}catch(e){}
}
A.awardXP=awardXP; A.showXPFlash=showXPFlash; A.fireConfetti=fireConfetti;

// ── Date utilities ────────────────────────────────────────────────
function getWeekMonday(date){var d=new Date(date);d.setHours(0,0,0,0);var day=d.getDay();d.setDate(d.getDate()+(day===0?-6:1-day));return d;}
function dateStr(d){return d.toISOString().slice(0,10);}
function addDays(d,n){var x=new Date(d);x.setDate(x.getDate()+n);return x;}
function formatDate(str){var d=new Date(str+'T00:00:00');return d.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});}
function isToday(str){return str===new Date().toISOString().slice(0,10);}
function fmtTime(s){var hh=Math.floor(s/3600),mm=Math.floor((s%3600)/60),sec=s%60;if(hh>0)return hh+':'+String(mm).padStart(2,'0')+':'+String(sec).padStart(2,'0');return String(mm).padStart(2,'0')+':'+String(sec).padStart(2,'0');}
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

// ── ELO Rating System (ELO-1) ────────────────────────────────────────
A.ELOSystem = (function() {
  var ELO_TIERS = [
    {min:0,    label:'Learning',   color:'#6b7280'},
    {min:900,  label:'Developing', color:'#cd7f32'},
    {min:1100, label:'Competent',  color:'#9ca3af'},
    {min:1300, label:'Advanced',   color:'#f59e0b'},
    {min:1500, label:'Elite',      color:'#10b981'},
  ];

  function computeELODelta(drillPct, currentELO) {
    var K = currentELO < 1000 ? 48 : (currentELO < 1400 ? 32 : 16);
    var expected = 1 / (1 + Math.pow(10, (1200 - currentELO) / 400));
    var actual = Math.min(1, drillPct / 100);
    return Math.round(K * (actual - expected));
  }

  function updateELO(drillId, rawScore, targetScore) {
    try {
      var drills = (window.SC_APP && window.SC_APP.DRILLS) || [];
      var drill = drills.find(function(d){ return d.id === drillId; });
      if (!drill) return null;
      var cat = (drill.category || '').toLowerCase();
      var validCats = ['batting','bowling','fielding','wicketkeeping','fitness','mental'];
      if (validCats.indexOf(cat) === -1) return null;
      var pct = targetScore > 0 ? Math.min(100, (rawScore / targetScore) * 100) : 0;
      var ratings = A.DB.getELORatings();
      var currentELO = ratings[cat] || 1000;
      var delta = computeELODelta(pct, currentELO);
      var newELO = Math.max(600, Math.min(2000, currentELO + delta));
      ratings[cat] = newELO;
      A.DB.saveELORatings(ratings);
      var today = new Date().toISOString().slice(0, 10);
      A.DB.saveELOHistoryEntry(cat, {date:today, elo:newELO, delta:delta, drillId:drillId});
      var hist = A.DB.getELOHistory(cat);
      var prevMax = hist.length > 1 ? Math.max.apply(null, hist.slice(0,-1).map(function(e){return e.elo||0;})) : 0;
      if (newELO > prevMax && prevMax > 0) {
        window.dispatchEvent(new CustomEvent('sc_elo_pr', {detail:{category:cat, elo:newELO, delta:delta}}));
      }
      return {newELO:newELO, delta:delta, category:cat};
    } catch(e) { return null; }
  }

  function getPersonalRecord(cat) {
    var hist = A.DB.getELOHistory(cat);
    if (!hist.length) return 1000;
    return Math.max.apply(null, hist.map(function(e){return e.elo||1000;}));
  }

  function getTier(elo) {
    var tier = ELO_TIERS[0];
    for (var i = ELO_TIERS.length-1; i >= 0; i--) {
      if (elo >= ELO_TIERS[i].min) { tier = ELO_TIERS[i]; break; }
    }
    return tier;
  }

  function getCategoryDisplayName(cat) {
    var map = {batting:'Batting',bowling:'Bowling',fielding:'Fielding',wicketkeeping:'Keeping',fitness:'Fitness',mental:'Mental'};
    return (map[cat]||cat)+' ELO';
  }

  return {updateELO:updateELO, getPersonalRecord:getPersonalRecord, getTier:getTier, getCategoryDisplayName:getCategoryDisplayName, ELO_TIERS:ELO_TIERS};
})();

// ── Kudos Service (KDO-1) ────────────────────────────────────────────
A.KudosService = (function() {
  var _queue = [];
  var _timer = null;
  var _listeners = [];
  var KUDOS_TEMPLATES = [
    '{name} just drilled the same technique — you\'re keeping good company.',
    'Strong session. {name} trains like this every morning.',
    'Personal best! {name} would approve of that score.',
    'You\'re improving faster than {name} did at this stage.',
    'That\'s the consistency {name} is known for.',
  ];
  var LEVEL_TEMPLATES = [
    'Level up! {name} reached this milestone too — and went on to greatness.',
    'Brilliant progression. {name} trained like this before making it big.',
    'New level unlocked! {name} credits consistent training like yours.',
  ];
  var ROLE_MAP = {batting:'batsman',bowling:'bowler',fielding:'fielder',wicketkeeping:'wicketkeeper'};

  function _getCricketer(category) {
    var db = (window.SC_APP && window.SC_APP.CRICKETERS_DB) || [];
    var role = ROLE_MAP[category];
    var pool = role ? db.filter(function(c){ return c.role===role||(c.role&&c.role.indexOf&&c.role.indexOf(role)!==-1); }) : [];
    if (!pool.length) pool = db;
    if (!pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function enqueue(type, context) {
    var ctx = context || {};
    var templates = (type==='level_up') ? LEVEL_TEMPLATES : KUDOS_TEMPLATES;
    var cricketer = _getCricketer(ctx.category||'');
    if (!cricketer) return;
    var msg = templates[Math.floor(Math.random()*templates.length)].replace(/\{name\}/g, cricketer.name);
    var tip = (type==='drill_pb'||type==='drill_100pct') ? (cricketer.tip||null) : null;
    _queue.push({id:Date.now()+Math.random(), message:msg, tip:tip, cricketerName:cricketer.name, type:type});
    if (!_timer) _timer = setTimeout(function(){ _flush(); }, 3000);
  }

  function _flush() {
    _timer = null;
    var item = _queue.shift();
    if (!item) return;
    _listeners.forEach(function(fn){ try{fn(item);}catch(e){} });
    if (_queue.length) _timer = setTimeout(function(){ _flush(); }, 2500);
  }

  function onKudos(fn) { _listeners.push(fn); }
  function offKudos(fn) { _listeners = _listeners.filter(function(f){return f!==fn;}); }
  return {enqueue:enqueue, onKudos:onKudos, offKudos:offKudos};
})();

console.log('[SC] app-core v3.3 ready — ELO, AgileStreak, KudosService');
})();
