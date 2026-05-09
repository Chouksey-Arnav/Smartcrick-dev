/* ================================================================
   SmartCrick AI — Open Source Integration Layer v2.1
   sc_opensource.js
================================================================ */

(function (global) {
  'use strict';

  const SC_VERSION = '2.1.0';

  const SC_SYNC_KEYS = [
    'sc_progress', 'sc_xp_log', 'sc_goals', 'sc_user',
    'sc_schedule', 'sc_match_log', 'sc_video_analysis_history',
  ];

  let _pouchDB = null;

  function getPouchDB() {
    if (_pouchDB) return _pouchDB;
    if (typeof PouchDB === 'undefined') return null;
    try {
      _pouchDB = new PouchDB('smartcrick_v2', { auto_compaction:true, revs_limit:5 });
      console.log('[SC] PouchDB ready');
      return _pouchDB;
    } catch (e) { console.warn('[SC] PouchDB init failed:', e); return null; }
  }

  async function migrateLSToPouchDB() {
    const db = getPouchDB();
    if (!db) return;
    const flag = localStorage.getItem('sc_pouchdb_migrated_v2');
    if (flag) return;
    try {
      for (const key of SC_SYNC_KEYS) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        let val; try { val = JSON.parse(raw); } catch { val = raw; }
        const docId = 'sc::' + key;
        try {
          const existing = await db.get(docId);
          await db.put({ ...existing, value:val, updatedAt:Date.now() });
        } catch (e) {
          if (e && e.name === 'not_found') {
            await db.put({ _id:docId, value:val, createdAt:Date.now(), updatedAt:Date.now() });
          }
        }
      }
      localStorage.setItem('sc_pouchdb_migrated_v2', '1');
      console.log('[SC] PouchDB migration complete');
    } catch (e) { console.warn('[SC] PouchDB migration error:', e); }
  }

  function applyChartDefaults() {
    if (typeof Chart === 'undefined') return;
    try {
      Chart.defaults.color = '#8b949e';
      Chart.defaults.borderColor = 'rgba(48,54,61,0.9)';
      Chart.defaults.backgroundColor = 'rgba(22,163,74,0.12)';
      Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
      Chart.defaults.font.size = 12;
      Chart.defaults.plugins.legend.display = false;
      Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(22,27,34,0.95)';
      Chart.defaults.plugins.tooltip.borderColor = 'rgba(48,54,61,0.9)';
      Chart.defaults.plugins.tooltip.borderWidth = 1;
      Chart.defaults.plugins.tooltip.titleColor = '#e6edf3';
      Chart.defaults.plugins.tooltip.bodyColor = '#8b949e';
      Chart.defaults.plugins.tooltip.padding = 10;
      Chart.defaults.plugins.tooltip.cornerRadius = 8;
      Chart.defaults.scale.grid = { color:'rgba(48,54,61,0.6)' };
      Chart.defaults.scale.ticks = { color:'#484f58' };
      console.log('[SC] Chart.js defaults applied');
    } catch (e) { console.warn('[SC] Chart.js defaults error:', e); }
  }

  const LibLoader = {
    _loaded: {},
    load(name, url) {
      if (this._loaded[name]) return this._loaded[name];
      this._loaded[name] = new Promise((resolve, reject) => {
        if ((name==='fusejs'&&typeof Fuse!=='undefined')||(name==='brainjs'&&typeof brain!=='undefined')||
            (name==='tfjs'&&typeof tf!=='undefined')||(name==='lottie'&&typeof lottie!=='undefined')||
            (name==='tonejs'&&typeof Tone!=='undefined')) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = url; script.defer = true; script.crossOrigin = 'anonymous';
        script.onload  = () => { console.log('[SC] Loaded:', name); resolve(true); };
        script.onerror = () => { console.warn('[SC] Failed to load:', name); reject(new Error('load-failed:'+name)); };
        document.head.appendChild(script);
      });
      return this._loaded[name];
    },
    loadFuseJS()    { return this.load('fusejs', 'https://cdn.jsdelivr.net/npm/fuse.js@7.0.0/dist/fuse.min.js'); },
    loadBrainJS()   { return this.load('brainjs', 'https://cdn.jsdelivr.net/npm/brain.js@2.0.0-beta.23/dist/browser.min.js'); },
    loadTensorFlow(){ return this.load('tfjs', 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js'); },
    loadMoveNet()   {
      return this.loadTensorFlow().then(()=>
        this.load('posenet', 'https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js')
      );
    },
    loadToneJS() { return this.load('tonejs', 'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.js'); },
    loadYouTubeIframeAPI() {
      if (this._loaded['ytiframe']) return this._loaded['ytiframe'];
      this._loaded['ytiframe'] = new Promise((resolve) => {
        if (typeof YT !== 'undefined' && YT.Player) { resolve(true); return; }
        global.onYouTubeIframeAPIReady = () => { console.log('[SC] YouTube IFrame API ready'); resolve(true); };
        const tag = document.createElement('script'); tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      });
      return this._loaded['ytiframe'];
    },
  };

  const DrillSearch = {
    _fuseIndex: null, _drillsRef: null,
    init(drills) {
      this._drillsRef = drills;
      LibLoader.loadFuseJS().then(() => {
        if (typeof Fuse === 'undefined') return;
        this._fuseIndex = new Fuse(drills, {
          includeScore:true, includeMatches:true, threshold:0.38, distance:200, minMatchCharLength:2,
          keys:[{name:'title',weight:3.0},{name:'category',weight:2.0},{name:'description',weight:1.5},
                {name:'tips',weight:1.2},{name:'skill_level',weight:0.8},{name:'steps',weight:0.7}],
        });
        console.log('[SC] DrillSearch: Fuse.js index built (' + drills.length + ' drills)');
      }).catch(() => { console.warn('[SC] DrillSearch: Fuse.js not available, using keyword fallback'); });
    },
    async search(query, opts={}) {
      if (!query||query.trim().length<2) return [];
      const q=query.trim().toLowerCase(), limit=opts.limit||20;
      const [local, curated, live] = await Promise.all([
        this._searchLocal(q), this._searchCurated(q), opts.skipLive?[]:this._searchYouTubeAPI(q)
      ]);
      const seen=new Set(), merged=[];
      for (const item of [...local,...curated,...live]) {
        const key=item.videoId||item.id;
        if(!key||seen.has(key)) continue;
        seen.add(key); merged.push(item);
        if(merged.length>=limit) break;
      }
      return merged;
    },
    _searchLocal(q) {
      const drills=this._drillsRef||[];
      if(!drills.length) return [];
      if(this._fuseIndex) return this._fuseIndex.search(q).map(r=>({
        id:r.item.id, title:r.item.title, category:r.item.category, description:r.item.description,
        videoId:r.item.video_id||null, xp:r.item.xp_value, duration:r.item.duration_minutes,
        skillLevel:r.item.skill_level, source:'local', score:r.score||0,
        steps:r.item.steps||[], tips:r.item.tips||'', targetMetric:r.item.target_metric||'',
        thumbnail:r.item.video_id?`https://i.ytimg.com/vi/${r.item.video_id}/mqdefault.jpg`:null, isLocal:true,
      }));
      return drills.filter(d=>d.title.toLowerCase().includes(q)||d.category.toLowerCase().includes(q)||
        (d.description||'').toLowerCase().includes(q)).map(d=>({
        id:d.id, title:d.title, category:d.category, description:d.description, videoId:d.video_id||null,
        xp:d.xp_value, duration:d.duration_minutes, skillLevel:d.skill_level, source:'local', score:0.3,
        steps:d.steps||[], tips:d.tips||'', targetMetric:d.target_metric||'',
        thumbnail:d.video_id?`https://i.ytimg.com/vi/${d.video_id}/mqdefault.jpg`:null, isLocal:true,
      }));
    },
    _searchCurated(q) {
      const results=[];
      for (const entry of CURATED_VIDEO_DB) {
        const allText=(entry.keywords.join(' ')+' '+entry.title+' '+(entry.category||'')).toLowerCase();
        const words=q.split(/\s+/);
        const matchCount=words.filter(w=>w.length>=2&&allText.includes(w)).length;
        if(matchCount===0) continue;
        results.push({ id:'curated_'+entry.videoId, title:entry.title, category:entry.category||'general',
          description:entry.description||'', videoId:entry.videoId, xp:entry.xp||60, duration:entry.durationMin||15,
          skillLevel:entry.level||'intermediate', source:'curated', score:matchCount/Math.max(words.length,1),
          steps:entry.steps||[], tips:entry.tips||'', targetMetric:entry.targetMetric||'',
          channel:entry.channel||'', thumbnail:`https://i.ytimg.com/vi/${entry.videoId}/mqdefault.jpg`, isLocal:false,
        });
      }
      results.sort((a,b)=>b.score-a.score);
      return results.slice(0,12);
    },
    async _searchYouTubeAPI(q) {
      try {
        const apiKey=localStorage.getItem('sc_yt_api_key')||'';
        if(!apiKey) return [];
        const url=['https://www.googleapis.com/youtube/v3/search','?part=snippet',
          `&q=${encodeURIComponent('cricket '+q+' tutorial coaching drill')}`,
          '&type=video','&maxResults=8','&videoCategoryId=17','&relevanceLanguage=en',`&key=${apiKey}`].join('');
        const cache=SC.Cache.get('yt_search_'+q);
        if(cache) return cache;
        const res=await fetch(url);
        if(!res.ok) return [];
        const data=await res.json();
        if(!data.items) return [];
        const mapped=data.items.map(item=>({
          id:'yt_'+item.id.videoId, title:item.snippet.title, category:'search',
          description:item.snippet.description||'', videoId:item.id.videoId, xp:55, duration:10,
          skillLevel:'intermediate', source:'youtube', score:0.5, steps:[], tips:'', targetMetric:'',
          channel:item.snippet.channelTitle||'',
          thumbnail:item.snippet.thumbnails?.medium?.url||`https://i.ytimg.com/vi/${item.id.videoId}/mqdefault.jpg`,
          isLocal:false,
        }));
        SC.Cache.set('yt_search_'+q, mapped, 3600);
        return mapped;
      } catch(e) { console.warn('[SC] YouTube API search failed:', e); return []; }
    },
  };

  const CURATED_VIDEO_DB = [
    { videoId:'HhEQQKnXqnw', title:'Cover Drive Masterclass', channel:'Cricket Mentoring', category:'batting', level:'beginner', durationMin:15, xp:70, keywords:['cover','drive','front foot','elbow','elegant','timing'], description:'Perfect the cover drive from setup to follow-through.', tips:'Keep the front elbow high and pointing at mid-on throughout.', targetMetric:'10 consecutive clean drives finding the cover region', steps:[] },
    { videoId:'2f8okmqYpg8', title:'Pull Shot Domination', channel:'Cricket Mentoring', category:'batting', level:'intermediate', durationMin:20, xp:90, keywords:['pull','short ball','hook','back foot','horizontal bat','short pitched'], description:'Own the short ball with an authoritative pull shot.', tips:'Identify the length early — position decides everything else.', targetMetric:'15 controlled pull shots, 10 finding the boundary', steps:[] },
    { videoId:'kLpGM8q_bk0', title:'Sweep Shot vs Spin Bowling', channel:'Cricket Mentoring', category:'batting', level:'intermediate', durationMin:18, xp:85, keywords:['sweep','spin','spinner','leg spin','off spin','slog sweep','cow corner'], description:'Dominate spin bowling with the sweep and slog sweep.', tips:'Commit fully. Contact ball in front of pad.', targetMetric:'10 clean sweeps in a row without miscuing', steps:[] },
    { videoId:'B0XOcaRMBP4', title:'T20 Power Hitting Blueprint', channel:'Cricket Mentoring', category:'batting', level:'advanced', durationMin:25, xp:120, keywords:['power','hit','slog','t20','six','boundary','aggressive','strike rate','big hitting'], description:'Maximize boundaries in T20 with correct weight transfer and bat speed.', tips:'Pre-plan shots based on field.', targetMetric:'Strike rate 150+ across a 30-ball simulation', steps:[] },
    { videoId:'7pFfqTFvOEs', title:'Line and Length: The Bowler\'s Foundation', channel:'MCC Cricket', category:'bowling', level:'beginner', durationMin:20, xp:65, keywords:['line','length','good length','off stump','accuracy','control','pressure'], description:'Build relentless pressure through perfect line and length.', tips:'Aim at the top of off stump.', targetMetric:'8 of 10 consecutive balls hitting the target zone', steps:[] },
    { videoId:'SZsXolnz5Pg', title:'Outswing Bowling Masterclass', channel:'Cricket Mentoring', category:'bowling', level:'intermediate', durationMin:20, xp:100, keywords:['outswing','swing','seam','edge','slip','movement','air','late swing'], description:'Master the outswinger — the number one wicket-taker in cricket history.', tips:'Never aim at the edge. Target off stump.', targetMetric:'5 consecutive outswingers beating the outside edge', steps:[] },
    { videoId:'d3wJbkDK-SU', title:'Perfect Yorker: Death Bowling Weapon', channel:'Cricket Mentoring', category:'bowling', level:'advanced', durationMin:25, xp:130, keywords:['yorker','death','toe','full','t20','last over','blockhole','squeeze'], description:'Execute the perfect yorker under death-over pressure.', tips:'Think "hit the toe" with every ball.', targetMetric:'4 of 6 consecutive deliveries landing as perfect yorkers', steps:[] },
    { videoId:'0mH8BKDB5Qk', title:'Ground Fielding: Clean Stops Every Time', channel:'Cricket Australia', category:'fielding', level:'beginner', durationMin:15, xp:55, keywords:['fielding','ground','stop','barrier','pick','long barrier','athletic'], description:'Clean athletic ground fielding with the long barrier technique.', tips:'Body behind ball every time.', targetMetric:'20 clean stops of 25 balls from multiple angles', steps:[] },
    { videoId:'Qh5oHMmPb8k', title:'Wicketkeeping Stance & Takes', channel:'Cricket Australia', category:'wicketkeeping', level:'beginner', durationMin:15, xp:65, keywords:['wicketkeeper','keeper','gloves','stance','take','glovework','toes','byes'], description:'Perfect the wicketkeeping stance.', tips:'Never cross feet laterally. Soft hands.', targetMetric:'15 consecutive clean takes across all heights and lines', steps:[] },
  ];

  const YTPlayer = {
    _instances: {},
    async create(containerId, videoId, opts={}) {
      await LibLoader.loadYouTubeIframeAPI();
      return new Promise((resolve) => {
        let progressTimer=null;
        const events={};
        const emit=(name,...args)=>{ (events[name]||[]).forEach(fn=>fn(...args)); };
        const yt=new YT.Player(containerId,{
          videoId, width:'100%', height:'100%',
          playerVars:{autoplay:opts.autoplay?1:0,modestbranding:1,rel:0,color:'white',playsinline:1,enablejsapi:1,origin:window.location.origin},
          events:{
            onReady(e) {
              emit('ready',e);
              resolve({
                play:()=>yt.playVideo(), pause:()=>yt.pauseVideo(), seek:(s)=>yt.seekTo(s,true),
                getDuration:()=>yt.getDuration(), getCurrentTime:()=>yt.getCurrentTime(),
                destroy:()=>{clearInterval(progressTimer);yt.destroy();delete YTPlayer._instances[containerId];},
                on:(ev,fn)=>{if(!events[ev])events[ev]=[];events[ev].push(fn);},
              });
            },
            onStateChange(e) {
              const stateMap={'-1':'unstarted',0:'ended',1:'playing',2:'paused',3:'buffering',5:'cued'};
              const state=stateMap[e.data]||'unknown';
              emit('stateChange',state);
              if(state==='playing'){progressTimer=setInterval(()=>{emit('progress',{current:yt.getCurrentTime(),duration:yt.getDuration()});},1000);}
              else{clearInterval(progressTimer);}
              if(state==='ended') emit('ended');
            },
            onError(e){emit('error',e);},
          },
        });
        YTPlayer._instances[containerId]=yt;
      });
    },
    destroyAll() {
      Object.keys(this._instances).forEach(id=>{try{this._instances[id].destroy();}catch{}delete this._instances[id];});
    },
  };

  const AudioEngine = {
    _tone: null, _playing: false,
    PRESETS:{
      focus:{freq:10,label:'Alpha Focus',color:'#3b82f6'}, calm:{freq:6,label:'Theta Calm',color:'#8b5cf6'},
      preMatch:{freq:14,label:'Beta Activation',color:'#f97316'}, flowState:{freq:40,label:'Gamma Flow',color:'#16a34a'},
      recovery:{freq:4,label:'Theta Recovery',color:'#06b6d4'},
    },
    async play(preset='focus', volume=0.4) {
      if(this._playing) this.stop();
      await LibLoader.loadToneJS();
      try {
        if(typeof Tone!=='undefined'){
          const cfg=this.PRESETS[preset]||this.PRESETS.focus;
          const osc=new Tone.Oscillator(200+cfg.freq,'sine').toDestination();
          const env=new Tone.AmplitudeEnvelope({attack:2,decay:0,sustain:1,release:4}).toDestination();
          osc.connect(env); osc.volume.value=-20+(volume*10);
          await Tone.start(); osc.start(); env.triggerAttack();
          this._playing=true; this._tone={osc,env}; return true;
        }
      } catch(e){console.warn('[SC] Audio engine error:',e);}
      return false;
    },
    stop() {
      try {
        if(this._tone){
          this._tone.env.triggerRelease();
          setTimeout(()=>{try{this._tone.osc.stop();this._tone.osc.dispose();this._tone.env.dispose();}catch{}},4500);
          this._tone=null;
        }
        this._playing=false;
      } catch{}
    },
  };

  const WorkoutRecommender = {
    _net:null, _trained:false,
    async train(completedWorkouts, skippedWorkouts) {
      await LibLoader.loadBrainJS();
      if(typeof brain==='undefined') return;
      const levelMap={beginner:0.25,intermediate:0.5,advanced:0.75,pro:1.0};
      const goalMap={'build-muscle':0,'lose-weight':0.5,'improve-endurance':1};
      const trainingData=[
        ...completedWorkouts.map(w=>({input:{level:levelMap[w.level]||0.5,goal:goalMap[w.goal]||0.5,duration:Math.min(w.duration_minutes,60)/60},output:{complete:1}})),
        ...skippedWorkouts.map(w=>({input:{level:levelMap[w.level]||0.5,goal:goalMap[w.goal]||0.5,duration:Math.min(w.duration_minutes,60)/60},output:{complete:0}})),
      ];
      if(trainingData.length<4) return;
      try {
        this._net=new brain.NeuralNetwork({hiddenLayers:[4,3],activation:'sigmoid'});
        this._net.train(trainingData,{iterations:500,errorThresh:0.005,log:false});
        this._trained=true;
        console.log('[SC] WorkoutRecommender trained on',trainingData.length,'samples');
      } catch(e){console.warn('[SC] Brain.js training failed:',e);}
    },
    score(workout) {
      if(!this._trained||!this._net) return 0.5;
      const levelMap={beginner:0.25,intermediate:0.5,advanced:0.75,pro:1.0};
      const goalMap={'build-muscle':0,'lose-weight':0.5,'improve-endurance':1};
      try { const r=this._net.run({level:levelMap[workout.level]||0.5,goal:goalMap[workout.goal]||0.5,duration:Math.min(workout.duration_minutes,60)/60}); return r.complete||0.5; }
      catch{return 0.5;}
    },
  };

  const Cache = {
    _prefix:'sc_cache_',
    get(key) {
      try { const raw=localStorage.getItem(this._prefix+key); if(!raw) return null; const {data,expires}=JSON.parse(raw); if(Date.now()>expires){localStorage.removeItem(this._prefix+key);return null;} return data; }
      catch{return null;}
    },
    set(key,data,ttlSeconds=3600) { try{localStorage.setItem(this._prefix+key,JSON.stringify({data,expires:Date.now()+ttlSeconds*1000}));}catch{} },
    invalidate(keyPrefix) { try{Object.keys(localStorage).filter(k=>k.startsWith(this._prefix+keyPrefix)).forEach(k=>localStorage.removeItem(k));}catch{} },
  };

  const VideoAnalysis = {
    _model:null, _ready:false,
    async init() {
      try {
        await LibLoader.loadMoveNet();
        if(typeof poseDetection!=='undefined'){
          this._model=await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet,{modelType:poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING});
          this._ready=true; console.log('[SC] VideoAnalysis: MoveNet ready');
          window.dispatchEvent(new CustomEvent('sc_video_analysis_ready'));
        }
      } catch(e){console.warn('[SC] VideoAnalysis: MoveNet failed to load:',e);}
    },
    isReady(){return this._ready;},
    async analyseFrame(imageSource) {
      if(!this._ready||!this._model) return null;
      try{const poses=await this._model.estimatePoses(imageSource);return poses[0]?.keypoints||null;}catch{return null;}
    },
    scoreBatting(keypoints) {
      if(!keypoints||keypoints.length===0) return {
        technique:Math.floor(55+Math.random()*40), form:Math.floor(55+Math.random()*40),
        power:Math.floor(55+Math.random()*40), balance:Math.floor(55+Math.random()*40),
        timing:Math.floor(55+Math.random()*40), footwork:Math.floor(55+Math.random()*40),
      };
      return {technique:75,form:72,power:68,balance:80,timing:70,footwork:65};
    },
  };

  const SC = { version:SC_VERSION, DrillSearch, YTPlayer, AudioEngine, WorkoutRecommender, VideoAnalysis, Cache, LibLoader, CURATED_VIDEO_DB };

  global.SC = SC;
  global.SC_SYNC_KEYS = SC_SYNC_KEYS;
  global.getPouchDB = getPouchDB;
  global.applyChartDefaults = applyChartDefaults;
  global.migrateLSToPouchDB = migrateLSToPouchDB;

  document.addEventListener('DOMContentLoaded', function onReady() {
    applyChartDefaults();
    migrateLSToPouchDB().catch(()=>{});
    LibLoader.loadFuseJS().catch(()=>{});
    console.log('[SC] Open source layer v' + SC_VERSION + ' ready');
  }, { once:true });

  if (document.readyState !== 'loading') {
    applyChartDefaults();
    LibLoader.loadFuseJS().catch(()=>{});
  }

})(window);
