(function() {
'use strict';
const { createElement:h, useState, useEffect, useRef, Fragment } = React;
const A = window.SC_APP;
const { DB, nav, awardXP } = A;
const { Icon, XPBadge, PageHeader, BottomNav, TopBar } = A;

// ===== jsPDF TRAINING REPORT (P5-G) =====
function generateTrainingReport() {
  try {
    if (!window.jspdf) { console.error('[SC] jsPDF not loaded'); return; }
    var jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    var p   = DB.getProgress() || {};
    var user = DB.getUser() || {};
    var info = A.getLevelInfo ? A.getLevelInfo(p.total_xp || 0) : { level: 1, name: 'Rookie', pct: 0 };
    var goals = DB.getGoals ? DB.getGoals() : [];
    var xpLog = DB.getXPLast7Days ? DB.getXPLast7Days() : [];
    var drillProg = DB.getDrillProgress ? DB.getDrillProgress() : {};
    var mentalAvg = DB.getAverageMentalRating ? DB.getAverageMentalRating(30) : 0;
    var matchLogs = DB.get('match_logs') || [];
    var rating = A.calcPlayerRating ? A.calcPlayerRating() : {};

    var dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    var playerName = user.name || 'SmartCrick Player';
    var filename = 'SmartCrick_Report_' + playerName.replace(/\s+/g, '_') + '_' + new Date().toISOString().slice(0, 10) + '.pdf';

    var W = 210; // A4 width in mm
    var margin = 18;
    var col = margin;

    // ===== COLOR PALETTE =====
    var GREEN  = [22, 163, 74];
    var DARK   = [13, 17, 23];
    var GRAY   = [107, 114, 128];
    var LIGHT  = [229, 231, 235];
    var GOLD   = [245, 158, 11];
    var BLUE   = [59, 130, 246];
    var PURPLE = [139, 92, 246];

    // ===== HELPERS =====
    function setColor(rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
    function setFill(rgb)  { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
    function setDraw(rgb)  { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }
    function bold(size)    { doc.setFont('helvetica', 'bold'); doc.setFontSize(size); }
    function normal(size)  { doc.setFont('helvetica', 'normal'); doc.setFontSize(size); }
    function italic(size)  { doc.setFont('helvetica', 'italic'); doc.setFontSize(size); }

    function sectionHeader(text, y) {
      setFill(GREEN);
      doc.roundedRect(margin, y, W - margin * 2, 7, 1, 1, 'F');
      bold(10);
      setColor([255, 255, 255]);
      doc.text(text, margin + 3, y + 4.8);
      return y + 12;
    }

    function hRule(y) {
      setDraw([229, 231, 235]);
      doc.setLineWidth(0.2);
      doc.line(margin, y, W - margin, y);
      return y + 4;
    }

    function statRow(label, value, y, valueColor) {
      normal(9);
      setColor(GRAY);
      doc.text(label + ':', col, y);
      bold(9);
      setColor(valueColor || DARK);
      doc.text(String(value), col + 65, y);
      return y + 5;
    }

    function progressBar(x, y, w, h, pct, fillRgb) {
      setFill([229, 231, 235]);
      doc.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
      if (pct > 0) {
        setFill(fillRgb || GREEN);
        doc.roundedRect(x, y, Math.max(w * Math.min(pct, 1), 1), h, h / 2, h / 2, 'F');
      }
    }

    // ===================================================================
    // PAGE 1 — HEADER + PLAYER SUMMARY
    // ===================================================================

    // Header banner
    setFill(DARK);
    doc.rect(0, 0, W, 45, 'F');
    setFill(GREEN);
    doc.rect(0, 40, W, 3, 'F');

    bold(22);
    setColor(GREEN);
    doc.text('SmartCrick', margin, 18);
    bold(22);
    setColor([255, 255, 255]);
    doc.text(' AI', margin + 51, 18);

    normal(9);
    setColor([156, 163, 175]);
    doc.text('Elite Cricket Training Platform', margin, 25);
    doc.text('Training Report — Generated ' + dateStr, margin, 31);

    // Player name large
    bold(14);
    setColor([255, 255, 255]);
    doc.text(playerName, W - margin, 18, { align: 'right' });
    normal(9);
    setColor([156, 163, 175]);
    doc.text((user.role || 'Cricketer') + ' · ' + (user.level || 'Club') + ' level', W - margin, 25, { align: 'right' });

    var y = 55;

    // ===== SECTION 1: PLAYER SUMMARY =====
    y = sectionHeader('1. PLAYER SUMMARY', y);

    // XP Level card
    setFill([17, 24, 39]);
    doc.roundedRect(margin, y, (W - margin * 2) / 2 - 3, 28, 2, 2, 'F');
    bold(22);
    setColor(GREEN);
    doc.text('Level ' + info.level, margin + 4, y + 12);
    bold(10);
    setColor([255, 255, 255]);
    doc.text(info.name || '', margin + 4, y + 18);
    normal(8);
    setColor(GRAY);
    doc.text((p.total_xp || 0).toLocaleString() + ' XP total', margin + 4, y + 23);
    progressBar(margin + 4, y + 24.5, (W - margin * 2) / 2 - 11, 2, (info.pct || 0) / 100, GREEN);

    // Streak card
    var col2 = margin + (W - margin * 2) / 2 + 3;
    setFill([17, 24, 39]);
    doc.roundedRect(col2, y, (W - margin * 2) / 2 - 3, 28, 2, 2, 'F');
    bold(22);
    setColor(GOLD);
    doc.text((p.current_streak || 0) + ' days', col2 + 4, y + 12);
    bold(10);
    setColor([255, 255, 255]);
    doc.text('Current Streak', col2 + 4, y + 18);
    normal(8);
    setColor(GRAY);
    doc.text('Best: ' + (p.longest_streak || 0) + ' days', col2 + 4, y + 23);

    y += 33;
    y = statRow('Drills completed', p.drills_done || 0, y, BLUE);
    y = statRow('Mental sessions', p.mental_done || 0, y, PURPLE);
    y = statRow('Workouts done', p.workouts_done || 0, y, GREEN);
    y = statRow('Practice minutes', (p.practice_minutes || 0).toLocaleString(), y, GRAY);
    y = hRule(y);

    // ===== SECTION 2: PLAYER RATING RADAR (text representation) =====
    y = sectionHeader('2. SKILL RATINGS (6-Axis Assessment)', y);

    var axes = [
      { key: 'batting',     label: 'Batting',     color: BLUE },
      { key: 'bowling',     label: 'Bowling',      color: [239, 68, 68] },
      { key: 'fielding',    label: 'Fielding',     color: GREEN },
      { key: 'fitness',     label: 'Fitness',      color: GOLD },
      { key: 'mental',      label: 'Mental',       color: PURPLE },
      { key: 'consistency', label: 'Consistency',  color: [20, 184, 166] },
    ];

    var axisW = (W - margin * 2) / 2 - 4;
    var axisStartX = margin;
    var col2Start = margin + (W - margin * 2) / 2 + 4;

    axes.forEach(function(ax, i) {
      var isRight = i % 2 === 1;
      var xBase = isRight ? col2Start : axisStartX;
      var score = Math.round(rating[ax.key] || 0);
      var grade = score >= 80 ? 'Elite' : score >= 60 ? 'Strong' : score >= 40 ? 'Developing' : 'Beginner';

      bold(8);
      setColor(ax.color);
      doc.text(ax.label, xBase, y);
      normal(8);
      setColor(DARK);
      doc.text(score + '/100  ' + grade, xBase + 25, y);
      progressBar(xBase, y + 1.5, axisW, 2.5, score / 100, ax.color);

      if (isRight || i === axes.length - 1) { y += 9; }
    });

    bold(9);
    setColor(GREEN);
    doc.text('Overall Rating: ' + Math.round(rating.overall || 0) + '/100', margin, y + 2);
    y = hRule(y + 6);

    // ===== SECTION 3: 7-DAY XP LOG =====
    y = sectionHeader('3. 7-DAY XP HISTORY', y);
    normal(8);
    setColor(GRAY);
    doc.text('Date', margin, y);
    doc.text('XP Earned', margin + 50, y);
    doc.text('Visual', margin + 90, y);
    y += 3;

    var maxDayXP = Math.max.apply(null, xpLog.map(function(d) { return d.xp || 0; }).concat([1]));
    xpLog.forEach(function(day) {
      var barW = Math.round(((day.xp || 0) / maxDayXP) * 50);
      normal(8);
      setColor(DARK);
      doc.text(day.date || '', margin, y);
      bold(8);
      setColor(day.xp > 0 ? GREEN : GRAY);
      doc.text(String(day.xp || 0) + ' XP', margin + 50, y);
      if (barW > 0) {
        setFill(day.xp > 200 ? GREEN : day.xp > 50 ? BLUE : GRAY);
        doc.rect(margin + 90, y - 3, barW, 3, 'F');
      }
      y += 5.5;
    });
    y = hRule(y);

    // ===== SECTION 4: BADGES =====
    y = sectionHeader('4. BADGES EARNED', y);
    var earned = p.badges || [];
    if (earned.length === 0) {
      italic(9); setColor(GRAY); doc.text('No badges earned yet. Keep training!', margin, y); y += 7;
    } else {
      var cols4 = 4;
      var colW4 = (W - margin * 2) / cols4;
      earned.forEach(function(b, i) {
        var def = A.BADGE_DEFS ? A.BADGE_DEFS[b] : null;
        var label = def ? def.label : b;
        var bx = margin + (i % cols4) * colW4;
        var by = y + Math.floor(i / cols4) * 8;

        setFill([17, 24, 39]);
        doc.roundedRect(bx, by - 3.5, colW4 - 2, 7, 1, 1, 'F');
        bold(6.5);
        setColor(GOLD);
        doc.text('🏅', bx + 1.5, by + 0.5);
        normal(6.5);
        setColor([229, 231, 235]);
        doc.text(label.slice(0, 16), bx + 7, by + 0.5);
      });
      y += Math.ceil(earned.length / cols4) * 8 + 4;
    }
    y = hRule(y);

    // Check if we need a new page
    if (y > 240) { doc.addPage(); y = 20; }

    // ===================================================================
    // PAGE 2 (or continuation) — DRILLS + MENTAL + MATCHES
    // ===================================================================

    // ===== SECTION 5: DRILL PROGRESS =====
    y = sectionHeader('5. TOP DRILL PROGRESS', y);

    var allDrills = A.DRILLS || [];
    var drillEntries = Object.keys(drillProg).map(function(id) {
      var d = allDrills.find(function(x) { return x.id === id; });
      var prog = drillProg[id];
      return {
        id: id,
        name: d ? d.name : id,
        attempts: (prog.attempts || []).length,
        tier: DB.getDrillTier ? DB.getDrillTier(id) : 1,
      };
    }).sort(function(a, b) { return b.attempts - a.attempts; }).slice(0, 10);

    if (drillEntries.length === 0) {
      italic(9); setColor(GRAY); doc.text('No drills logged yet. Start training!', margin, y); y += 7;
    } else {
      drillEntries.forEach(function(dr, i) {
        normal(8);
        setColor(DARK);
        doc.text((i + 1) + '. ' + dr.name.slice(0, 30), margin, y);
        bold(8);
        setColor(BLUE);
        doc.text(dr.attempts + ' attempts', margin + 100, y);
        var tierLabels = ['', 'Bronze', 'Silver', 'Gold', 'Platinum'];
        setColor(dr.tier >= 3 ? GOLD : GRAY);
        doc.text(tierLabels[dr.tier] || 'Bronze', margin + 130, y);
        y += 5;
      });
    }
    y = hRule(y);

    // ===== SECTION 6: MENTAL SESSIONS =====
    y = sectionHeader('6. MENTAL TRAINING', y);
    y = statRow('Sessions completed', p.mental_done || 0, y, PURPLE);
    y = statRow('Average mood rating', mentalAvg > 0 ? mentalAvg.toFixed(1) + '/5 ⭐' : 'No ratings yet', y, GOLD);
    var mfScore = A.calcMentalFitnessScore ? A.calcMentalFitnessScore() : 0;
    bold(9); setColor(PURPLE);
    doc.text('Mental Fitness Score: ' + Math.round(mfScore) + '/100', margin, y);
    progressBar(margin + 80, y - 3, 60, 3, mfScore / 100, PURPLE);
    y += 6;
    y = hRule(y);

    // ===== SECTION 7: LAST 5 MATCHES =====
    y = sectionHeader('7. RECENT MATCH LOGS', y);
    var recentMatches = matchLogs.slice(-5).reverse();
    if (recentMatches.length === 0) {
      italic(9); setColor(GRAY); doc.text('No matches logged yet. Add matches via Match Logger.', margin, y); y += 7;
    } else {
      recentMatches.forEach(function(m, i) {
        normal(8);
        setColor(DARK);
        var dateLabel = m.date || 'Unknown date';
        var opponent = m.opponent || 'Unknown opponent';
        var runs = (m.batting && m.batting.runs != null) ? m.batting.runs + ' runs' : '—';
        var wkts = (m.bowling && m.bowling.wickets != null) ? m.bowling.wickets + ' wkts' : '—';
        var result = m.result || '';
        setColor(result === 'win' ? GREEN : result === 'loss' ? [239, 68, 68] : GRAY);
        doc.text(dateLabel + ' vs ' + opponent.slice(0, 20), margin, y);
        setColor(BLUE); doc.text('Bat: ' + runs, margin + 90, y);
        setColor([239, 68, 68]); doc.text('Bowl: ' + wkts, margin + 125, y);
        setColor(result === 'win' ? GREEN : GRAY);
        doc.text(result.toUpperCase() || '—', margin + 155, y);
        y += 5.5;
      });
    }
    y = hRule(y);

    // ===== SECTION 8: GOALS =====
    y = sectionHeader('8. GOALS & PROGRESS', y);
    var goalList = Array.isArray(goals) ? goals : [];
    if (goalList.length === 0) {
      italic(9); setColor(GRAY); doc.text('No goals set yet.', margin, y); y += 7;
    } else {
      goalList.slice(0, 6).forEach(function(g) {
        normal(8); setColor(DARK);
        var check = g.completed ? '✓' : '○';
        setColor(g.completed ? GREEN : GRAY);
        doc.text(check + ' ' + (g.text || '').slice(0, 55), margin, y);
        y += 5;
      });
    }
    y = hRule(y);

    // ===== SECTION 9: COACH NOTES =====
    if (y > 230) { doc.addPage(); y = 20; }
    y = sectionHeader('9. COACH NOTES', y);
    normal(8); setColor(GRAY);
    doc.text('Date of review: _______________   Coach signature: _______________', margin, y); y += 10;
    for (var ln = 0; ln < 8; ln++) {
      setDraw([229, 231, 235]);
      doc.setLineWidth(0.15);
      doc.line(margin, y, W - margin, y);
      y += 7;
    }

    // ===== FOOTER =====
    var pageCount = doc.getNumberOfPages();
    for (var pg = 1; pg <= pageCount; pg++) {
      doc.setPage(pg);
      normal(7); setColor(GRAY);
      doc.text('SmartCrick AI · smartcricai.vercel.app · Page ' + pg + ' of ' + pageCount, W / 2, 290, { align: 'center' });
      doc.text('Confidential — ' + playerName + ' · Generated ' + dateStr, W / 2, 294, { align: 'center' });
      setFill(GREEN);
      doc.rect(0, 297, W, 2, 'F');
    }

    doc.save(filename);

    // Award XP for generating report
    if (awardXP) awardXP(20, 0, 'report_gen', null, null);
    if (A.showXPFlash) A.showXPFlash('+20 XP — Report generated!');

  } catch(err) {
    console.error('[SC] Report generation failed:', err);
    alert('Could not generate report. Please check console for details.');
  }
}

// ===== PROFILE PAGE =====
function ProfilePage(props) {
  var [progress, setProgress] = useState(null);
  var [user, setUser] = useState({});
  var [prestige, setPrestige] = useState(0);
  var [streakTokens, setStreakTokens] = useState(0);
  var [goals, setGoals] = useState([]);
  var [goalInput, setGoalInput] = useState('');
  var [showPrestigeModal, setShowPrestigeModal] = useState(false);
  var [reportGenerating, setReportGenerating] = useState(false);
  var [activeTab, setActiveTab] = useState('overview');

  function reload() {
    var p = DB.getProgress() || {};
    setProgress(p);
    setUser(DB.getUser() || {});
    setPrestige(DB.getPrestige ? DB.getPrestige() : 0);
    setStreakTokens(DB.getStreakTokens ? DB.getStreakTokens() : 0);
    setGoals(DB.getGoals ? DB.getGoals() || [] : []);
  }

  useEffect(function() {
    reload();
    function onUpdate() { reload(); }
    window.addEventListener('sc_update', onUpdate);
    return function() { window.removeEventListener('sc_update', onUpdate); };
  }, []);

  if (!progress) {
    return h('div', { style: { paddingBottom: 100, background: '#0d1117', minHeight: '100dvh' } },
      h(TopBar, { title: 'Profile' }),
      h('div', { style: { textAlign: 'center', padding: '60px 20px', color: '#6b7280' } }, 'Loading...'),
      h(BottomNav),
    );
  }

  var levelInfo = A.getLevelInfo ? A.getLevelInfo(progress.total_xp || 0) : { level: 1, name: 'Rookie', pct: 0, xpToNext: 500, next: 'Net Warrior' };
  var earned = progress.badges || [];
  var badgeDefs = A.BADGE_DEFS || {};
  var rating = A.calcPlayerRating ? A.calcPlayerRating() : {};
  var mfScore = A.calcMentalFitnessScore ? A.calcMentalFitnessScore() : 0;
  var xpLog = DB.getXPLast7Days ? DB.getXPLast7Days() : [];
  var weekXP = xpLog.reduce(function(s, d) { return s + (d.xp || 0); }, 0);

  // Streak multiplier
  var streak = progress.current_streak || 0;
  var multiplier = streak >= 30 ? 1.5 : streak >= 14 ? 1.3 : streak >= 7 ? 1.2 : streak >= 3 ? 1.1 : 1.0;

  // Prestige visual
  var prestigeLabels = ['', 'Gold ⭐', 'Diamond 💎', 'Rainbow 🌈'];
  var prestigeColors = ['', '#f59e0b', '#a8b2c0', '#8b5cf6'];
  var canPrestige = levelInfo.level >= 10;

  function handlePrestige() {
    if (!canPrestige) return;
    var newPrestige = prestige + 1;
    if (newPrestige > 3) { newPrestige = 3; }
    DB.setPrestige(newPrestige);
    var p2 = DB.getProgress();
    p2.total_xp = 0;
    var badgeKey = 'prestige' + newPrestige;
    if (!p2.badges) p2.badges = [];
    if (p2.badges.indexOf(badgeKey) === -1) p2.badges.push(badgeKey);
    DB.saveProgress(p2);
    setShowPrestigeModal(false);
    if (A.fireConfetti) A.fireConfetti();
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  function addGoal() {
    if (!goalInput.trim()) return;
    var g = { id: Date.now().toString(), text: goalInput.trim(), completed: false, created: new Date().toISOString().slice(0, 10) };
    var updated = goals.concat([g]);
    if (DB.saveGoals) DB.saveGoals(updated);
    setGoals(updated);
    setGoalInput('');
    window.dispatchEvent(new CustomEvent('sc_update'));
  }

  function toggleGoal(id) {
    var updated = goals.map(function(g) { return g.id === id ? Object.assign({}, g, { completed: !g.completed }) : g; });
    if (DB.saveGoals) DB.saveGoals(updated);
    setGoals(updated);
  }

  function deleteGoal(id) {
    var updated = goals.filter(function(g) { return g.id !== id; });
    if (DB.saveGoals) DB.saveGoals(updated);
    setGoals(updated);
  }

  function handleDownloadReport() {
    setReportGenerating(true);
    setTimeout(function() {
      generateTrainingReport();
      setReportGenerating(false);
    }, 100);
  }

  var tabStyle = function(t) {
    return {
      flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500,
      background: 'none', borderBottom: activeTab === t ? '2px solid #16a34a' : '2px solid transparent',
      color: activeTab === t ? '#4ade80' : '#6b7280',
      transition: 'all .15s',
    };
  };

  // ===== RATING AXIS BARS =====
  var axes = [
    { key: 'batting', label: 'Batting', color: '#3b82f6' },
    { key: 'bowling', label: 'Bowling', color: '#ef4444' },
    { key: 'fielding', label: 'Fielding', color: '#10b981' },
    { key: 'fitness', label: 'Fitness', color: '#f59e0b' },
    { key: 'mental', label: 'Mental', color: '#8b5cf6' },
    { key: 'consistency', label: 'Consistency', color: '#14b8a6' },
  ];

  return h('div', { style: { paddingBottom: 100, background: '#0d1117', minHeight: '100dvh' } },
    h(TopBar, { title: 'Profile' }),

    // ===== HERO CARD =====
    h('div', { style: { margin: '14px 16px', padding: '20px 18px', background: 'linear-gradient(135deg,#0f2027,#1a2a1a)', borderRadius: 16, border: '1px solid rgba(22,163,74,.2)' } },
      h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 } },
        // Avatar
        h('div', {
          style: {
            width: 56, height: 56, borderRadius: 16, flexShrink: 0,
            background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, color: '#fff',
            border: prestige > 0 ? '2px solid ' + prestigeColors[prestige] : '2px solid rgba(22,163,74,.3)',
            boxShadow: prestige > 0 ? '0 0 14px ' + prestigeColors[prestige] + '60' : 'none',
          },
          'aria-hidden': 'true',
        }, (user.name || 'P').charAt(0).toUpperCase()),

        h('div', { style: { flex: 1 } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
            h('h2', { style: { fontSize: 18, fontWeight: 700, color: '#e5e7eb', margin: 0 } }, user.name || 'Player'),
            prestige > 0 && h('span', {
              style: { fontSize: 11, fontWeight: 600, color: prestigeColors[prestige], background: prestigeColors[prestige] + '20', padding: '2px 8px', borderRadius: 10, border: '1px solid ' + prestigeColors[prestige] + '40' },
            }, 'P' + prestige + ' ' + prestigeLabels[prestige]),
          ),
          h('div', { style: { fontSize: 13, color: '#9ca3af', marginTop: 3 } },
            (user.role || 'Cricketer') + ' · ' + (user.ageGroup || '') + ' · ' + (user.level || 'Club'),
          ),
          h('div', { style: { display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' } },
            h('div', null,
              h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Streak'),
              h('div', { style: { fontSize: 16, fontWeight: 700, color: '#f59e0b' } }, streak + ' 🔥'),
            ),
            h('div', null,
              h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Week XP'),
              h('div', { style: { fontSize: 16, fontWeight: 700, color: '#4ade80' } }, weekXP.toLocaleString()),
            ),
            h('div', null,
              h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'Tokens'),
              h('div', { style: { fontSize: 16, fontWeight: 700, color: '#8b5cf6' } }, streakTokens + ' 🎫'),
            ),
            multiplier > 1.0 && h('div', null,
              h('div', { style: { fontSize: 11, color: '#6b7280' } }, 'XP Bonus'),
              h('div', { style: { fontSize: 14, fontWeight: 700, color: '#ef4444' } }, multiplier + '× 🔥'),
            ),
          ),
        ),
      ),

      // XP bar
      h('div', { style: { marginBottom: 4 } },
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 } },
          h('span', { style: { fontSize: 12, color: '#4ade80', fontWeight: 600 } }, 'Level ' + levelInfo.level + ' — ' + levelInfo.name),
          h('span', { style: { fontSize: 12, color: '#6b7280' } }, (progress.total_xp || 0).toLocaleString() + ' XP'),
        ),
        h('div', { style: { height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden' },
          role: 'progressbar', 'aria-valuenow': levelInfo.pct || 0, 'aria-valuemin': 0, 'aria-valuemax': 100,
          'aria-label': 'Level ' + levelInfo.level + ' progress: ' + Math.round(levelInfo.pct || 0) + '%',
        },
          h('div', { style: { height: '100%', width: (levelInfo.pct || 0) + '%', background: '#16a34a', borderRadius: 3, transition: 'width .5s ease' } }),
        ),
        h('div', { style: { fontSize: 11, color: '#4b5563', marginTop: 4, textAlign: 'right' } },
          (levelInfo.xpToNext || 0).toLocaleString() + ' XP to ' + (levelInfo.next || 'max level'),
        ),
      ),

      // Prestige button
      canPrestige && h('button', {
        onClick: function() { setShowPrestigeModal(true); },
        style: {
          marginTop: 10, width: '100%', padding: '9px', borderRadius: 8,
          background: 'linear-gradient(135deg,#f59e0b20,#ef444420)', border: '1px solid #f59e0b40',
          color: '#f59e0b', fontSize: 12, fontWeight: 600, cursor: 'pointer',
        },
        onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,.3)'; },
        onBlur:  function(e) { e.currentTarget.style.boxShadow = 'none'; },
      }, '⚡ Ready to Prestige? — Reset to Level 1 and earn a prestige border'),
    ),

    // ===== TABS =====
    h('div', { style: { display: 'flex', borderBottom: '1px solid rgba(255,255,255,.07)', margin: '0 16px' }, role: 'tablist' },
      ['overview', 'skills', 'badges', 'goals'].map(function(t) {
        var labels = { overview: 'Overview', skills: 'Skills', badges: 'Badges', goals: 'Goals' };
        return h('button', { key: t, role: 'tab', 'aria-selected': activeTab === t ? 'true' : 'false', onClick: function() { setActiveTab(t); }, style: tabStyle(t) }, labels[t]);
      })
    ),

    h('div', { style: { padding: '16px 16px 0' } },

      // ===== OVERVIEW TAB =====
      activeTab === 'overview' && h(Fragment, null,
        // Stats grid
        h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 } },
          [
            { label: 'Drills done',   value: progress.drills_done || 0,   color: '#3b82f6' },
            { label: 'Mental done',   value: progress.mental_done || 0,   color: '#8b5cf6' },
            { label: 'Workouts',      value: progress.workouts_done || 0, color: '#10b981' },
            { label: 'Best streak',   value: (progress.longest_streak || 0) + ' days', color: '#f59e0b' },
            { label: 'Practice min',  value: (progress.practice_minutes || 0).toLocaleString(), color: '#6b7280' },
            { label: 'Badges earned', value: earned.length, color: '#f59e0b' },
          ].map(function(s, i) {
            return h('div', {
              key: i,
              style: { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: '12px 14px' },
            },
              h('div', { style: { fontSize: 11, color: '#6b7280', marginBottom: 4 } }, s.label),
              h('div', { style: { fontSize: 20, fontWeight: 700, color: s.color } }, s.value),
            );
          })
        ),

        // 7-day XP chart
        h('div', { style: { marginBottom: 16, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '14px' } },
          h('div', { style: { fontSize: 13, fontWeight: 600, color: '#e5e7eb', marginBottom: 10 } }, 'Last 7 Days'),
          h('div', { style: { display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 },
            role: 'img', 'aria-label': '7 day XP bar chart',
          },
            xpLog.map(function(d) {
              var maxXP = Math.max.apply(null, xpLog.map(function(x) { return x.xp || 0; }).concat([1]));
              var h2 = Math.max(((d.xp || 0) / maxXP) * 52, d.xp > 0 ? 4 : 1);
              return h('div', { key: d.date, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 } },
                h('div', { style: { fontSize: 9, color: '#6b7280' } }, d.xp > 0 ? d.xp : ''),
                h('div', { style: { width: '100%', height: h2 + 'px', background: d.xp > 0 ? '#16a34a' : 'rgba(255,255,255,.05)', borderRadius: 3, transition: 'height .4s' } }),
                h('div', { style: { fontSize: 9, color: '#4b5563' } }, (d.date || '').slice(5)),
              );
            })
          ),
        ),

        // Download report button
        h('button', {
          onClick: handleDownloadReport,
          disabled: reportGenerating,
          'aria-label': 'Download training report as PDF',
          style: {
            width: '100%', padding: '14px', borderRadius: 10, border: 'none',
            background: reportGenerating ? 'rgba(255,255,255,.06)' : 'linear-gradient(135deg,#1a3a2a,#16a34a20)',
            border: '1px solid rgba(22,163,74,.3)', color: reportGenerating ? '#6b7280' : '#4ade80',
            fontSize: 14, fontWeight: 600, cursor: reportGenerating ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          },
          onFocus: function(e) { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(22,163,74,.3)'; },
          onBlur:  function(e) { e.currentTarget.style.boxShadow = 'none'; },
        },
          reportGenerating ? '⏳ Generating...' : '📄 Download Training Report (PDF)',
        ),
        h('p', { style: { fontSize: 11, color: '#4b5563', textAlign: 'center', marginTop: 6 } },
          'Full 9-section PDF report · Earns +20 XP',
        ),
      ),

      // ===== SKILLS TAB =====
      activeTab === 'skills' && h('div', null,
        h('div', { style: { marginBottom: 12 } },
          h('div', { style: { fontSize: 20, fontWeight: 700, color: '#e5e7eb', textAlign: 'center' } },
            Math.round(rating.overall || 0),
          ),
          h('div', { style: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 } }, 'Overall Rating'),
        ),
        axes.map(function(ax) {
          var score = Math.round(rating[ax.key] || 0);
          var grade = score >= 80 ? 'Elite' : score >= 60 ? 'Strong' : score >= 40 ? 'Developing' : 'Beginner';
          return h('div', { key: ax.key, style: { marginBottom: 12 } },
            h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 } },
              h('span', { style: { fontSize: 13, fontWeight: 500, color: '#e5e7eb' } }, ax.label),
              h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                h('span', { style: { fontSize: 11, color: '#6b7280' } }, grade),
                h('span', { style: { fontSize: 14, fontWeight: 700, color: ax.color } }, score),
              ),
            ),
            h('div', { style: { height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' },
              role: 'progressbar', 'aria-valuenow': score, 'aria-valuemin': 0, 'aria-valuemax': 100,
              'aria-label': ax.label + ': ' + score + ' out of 100',
            },
              h('div', { style: { height: '100%', width: score + '%', background: ax.color, borderRadius: 3 } }),
            ),
          );
        }),

        // Mental Fitness
        h('div', { style: { marginTop: 16, padding: '14px', background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.2)', borderRadius: 10 } },
          h('div', { style: { fontSize: 13, fontWeight: 600, color: '#c4b5fd', marginBottom: 8 } }, 'Mental Fitness Score'),
          h('div', { style: { fontSize: 28, fontWeight: 700, color: '#8b5cf6', textAlign: 'center', marginBottom: 8 } }, Math.round(mfScore)),
          h('div', { style: { height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' } },
            h('div', { style: { height: '100%', width: mfScore + '%', background: '#8b5cf6', borderRadius: 3 } }),
          ),
        ),
      ),

      // ===== BADGES TAB =====
      activeTab === 'badges' && h('div', null,
        earned.length === 0 ? (
          h('div', { style: { textAlign: 'center', padding: '40px 20px', color: '#6b7280' } },
            h('div', { style: { fontSize: 40, marginBottom: 8 } }, '🏅'),
            h('div', { style: { fontSize: 14 } }, 'No badges yet. Start training to earn them!'),
          )
        ) : (
          h('div', null,
            h('div', { style: { fontSize: 13, color: '#6b7280', marginBottom: 12 } }, earned.length + ' badges earned'),
            h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }, role: 'list' },
              earned.map(function(b) {
                var def = badgeDefs[b] || { icon: '⭐', label: b, desc: '' };
                return h('div', {
                  key: b, role: 'listitem',
                  style: { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 10, padding: '10px 12px' },
                },
                  h('div', { style: { fontSize: 18, marginBottom: 4 }, 'aria-hidden': 'true' }, '🏅'),
                  h('div', { style: { fontSize: 12, fontWeight: 600, color: '#fbbf24' } }, def.label),
                  h('div', { style: { fontSize: 11, color: '#6b7280', marginTop: 2 } }, def.desc || ''),
                );
              })
            ),
          )
        ),
      ),

      // ===== GOALS TAB =====
      activeTab === 'goals' && h('div', null,
        // Add goal
        h('div', { style: { display: 'flex', gap: 8, marginBottom: 16 } },
          h('input', {
            value: goalInput,
            onChange: function(e) { setGoalInput(e.target.value); },
            onKeyDown: function(e) { if (e.key === 'Enter') addGoal(); },
            placeholder: 'Add a new cricket goal...',
            'aria-label': 'New goal text',
            style: {
              flex: 1, padding: '10px 12px',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 8, color: '#e5e7eb', fontSize: 14, outline: 'none',
            },
          }),
          h('button', {
            onClick: addGoal, 'aria-label': 'Add goal',
            style: { padding: '10px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontWeight: 600 },
          }, '+'),
        ),

        // Goals list
        goals.length === 0 ? (
          h('div', { style: { textAlign: 'center', padding: '30px 20px', color: '#6b7280' } },
            h('div', { style: { fontSize: 13 } }, 'No goals yet. What do you want to achieve?'),
          )
        ) : (
          h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8 }, role: 'list', 'aria-label': 'Your cricket goals' },
            goals.map(function(g) {
              return h('div', {
                key: g.id, role: 'listitem',
                style: {
                  display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px',
                  background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10,
                },
              },
                h('button', {
                  onClick: function() { toggleGoal(g.id); },
                  'aria-checked': g.completed ? 'true' : 'false', role: 'checkbox',
                  'aria-label': (g.completed ? 'Mark incomplete: ' : 'Mark complete: ') + g.text,
                  style: {
                    width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                    background: g.completed ? '#16a34a' : 'transparent',
                    border: '2px solid ' + (g.completed ? '#16a34a' : '#374151'),
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff',
                  },
                }, g.completed ? '✓' : ''),
                h('div', { style: { flex: 1 } },
                  h('div', { style: { fontSize: 13, color: g.completed ? '#6b7280' : '#e5e7eb', textDecoration: g.completed ? 'line-through' : 'none' } }, g.text),
                  g.created && h('div', { style: { fontSize: 11, color: '#4b5563', marginTop: 2 } }, 'Added ' + g.created),
                ),
                h('button', {
                  onClick: function() { deleteGoal(g.id); },
                  'aria-label': 'Delete goal: ' + g.text,
                  style: { background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: 16, padding: '0 4px' },
                }, '×'),
              );
            })
          )
        ),
      ),
    ),

    // ===== PRESTIGE CONFIRMATION MODAL =====
    showPrestigeModal && h('div', {
      role: 'alertdialog', 'aria-modal': 'true', 'aria-label': 'Prestige confirmation',
      style: { position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 },
    },
      h('div', { style: { background: '#161b27', borderRadius: 16, padding: '28px 24px', maxWidth: 340, width: '100%', textAlign: 'center', border: '1px solid rgba(245,158,11,.3)' } },
        h('div', { style: { fontSize: 40, marginBottom: 12 } }, '⚡'),
        h('h3', { style: { fontSize: 18, fontWeight: 700, color: '#f59e0b', marginBottom: 8 } }, 'Ready to Prestige?'),
        h('p', { style: { fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 20 } },
          'This resets your XP to 0 and your level to 1. You keep all your badges and unlock a prestigious badge border. This is for elite players who have mastered SmartCrick.',
        ),
        h('div', { style: { background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, padding: '10px', marginBottom: 20, fontSize: 12, color: '#fbbf24' } },
          'Prestige ' + (prestige + 1) + ' reward: ' + prestigeLabels[Math.min(prestige + 1, 3)] + ' badge border',
        ),
        h('div', { style: { display: 'flex', gap: 10 } },
          h('button', {
            onClick: function() { setShowPrestigeModal(false); },
            style: { flex: 1, padding: '12px', background: 'rgba(255,255,255,.06)', border: 'none', borderRadius: 8, color: '#9ca3af', fontSize: 14, cursor: 'pointer' },
          }, 'Cancel'),
          h('button', {
            onClick: handlePrestige,
            style: { flex: 1, padding: '12px', background: 'linear-gradient(135deg,#92400e,#f59e0b)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' },
          }, 'Prestige Now ⚡'),
        ),
      ),
    ),

    h(BottomNav),
  );
}

A.ProfilePage = ProfilePage;
A.generateTrainingReport = generateTrainingReport;
console.log('[SC] app-profile.js v3.2 — Profile + jsPDF report + prestige ready');
})();
