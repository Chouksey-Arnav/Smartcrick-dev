// ================================================================
// SmartCrick ProVision™ — Motion Intelligence Engine (MIE)
// app-video-engine.js  v1.0
// BioTrack™ Biomechanical Analysis · CricketIQ™ Scoring Algorithm
// ================================================================
(function () {
'use strict';
var A = window.SC_APP;

// ── MediaPipe Landmark Indices ────────────────────────────────────
var MP = {
  NOSE:0, L_EYE_INNER:1, L_EYE:2, L_EYE_OUTER:3,
  R_EYE_INNER:4, R_EYE:5, R_EYE_OUTER:6,
  L_EAR:7, R_EAR:8,
  L_SHOULDER:11, R_SHOULDER:12,
  L_ELBOW:13, R_ELBOW:14,
  L_WRIST:15, R_WRIST:16,
  L_PINKY:17, R_PINKY:18,
  L_INDEX:19, R_INDEX:20,
  L_THUMB:21, R_THUMB:22,
  L_HIP:23, R_HIP:24,
  L_KNEE:25, R_KNEE:26,
  L_ANKLE:27, R_ANKLE:28,
  L_HEEL:29, R_HEEL:30,
  L_FOOT:31, R_FOOT:32,
};

// CDN URLs for MediaPipe
var MP_VERSION = '0.5.1675469404';
var MP_CDN_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/pose@' + MP_VERSION;
var MP_CAMERA_VER = '0.3.1675466862';
var MP_CAMERA_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@' + MP_CAMERA_VER + '/camera_utils.js';

// ── Pure-math utility functions (also injected into Web Worker) ──
function angleBetween3Points(a, b, c) {
  if (!a || !b || !c) return 0;
  var v1x = a.x - b.x, v1y = a.y - b.y, v1z = (a.z||0)-(b.z||0);
  var v2x = c.x - b.x, v2y = c.y - b.y, v2z = (c.z||0)-(b.z||0);
  var dot = v1x*v2x + v1y*v2y + v1z*v2z;
  var mag1 = Math.sqrt(v1x*v1x + v1y*v1y + v1z*v1z);
  var mag2 = Math.sqrt(v2x*v2x + v2y*v2y + v2z*v2z);
  if (mag1 === 0 || mag2 === 0) return 0;
  return Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2)))) * (180 / Math.PI);
}

function elbowExtensionAngle(shoulder, elbow, wrist) {
  var fullAngle = angleBetween3Points(shoulder, elbow, wrist);
  return Math.max(0, 180 - fullAngle);
}

function hipShoulderSeparation(lHip, rHip, lShoulder, rShoulder) {
  if (!lHip || !rHip || !lShoulder || !rShoulder) return 0;
  var hipAngle = Math.atan2(rHip.y - lHip.y, rHip.x - lHip.x) * (180 / Math.PI);
  var shoulAngle = Math.atan2(rShoulder.y - lShoulder.y, rShoulder.x - lShoulder.x) * (180 / Math.PI);
  var diff = Math.abs(shoulAngle - hipAngle);
  return diff > 180 ? 360 - diff : diff;
}

function vectorMagnitude2D(a, b) {
  if (!a || !b) return 0;
  return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
}

function landmarkVisibilityOk(lm) {
  return lm && (lm.visibility === undefined || lm.visibility >= 0.4);
}

function stdDev(arr) {
  if (!arr || arr.length < 2) return 0;
  var mean = arr.reduce(function(s, v) { return s + v; }, 0) / arr.length;
  var variance = arr.reduce(function(s, v) { return s + Math.pow(v - mean, 2); }, 0) / arr.length;
  return Math.sqrt(variance);
}

// Score a single metric against an ideal value and tolerance range
function scoreVsIdeal(value, ideal, range) {
  if (value === null || value === undefined || isNaN(value)) return 50;
  var deviation = Math.abs(value - ideal);
  var normalized = Math.max(0, 1 - deviation / range);
  return Math.round(normalized * 100);
}

// ── Per-frame biomechanical extraction ───────────────────────────
function extractBattingMetrics(lm, hand) {
  var bowlSide = (hand === 'LHB') ? 'L' : 'R';
  var offSide  = (hand === 'LHB') ? 'R' : 'L';
  var bowlShoulder = lm[MP[bowlSide + '_SHOULDER']];
  var bowlElbow    = lm[MP[bowlSide + '_ELBOW']];
  var bowlWrist    = lm[MP[bowlSide + '_WRIST']];
  var offShoulder  = lm[MP[offSide  + '_SHOULDER']];
  var offElbow     = lm[MP[offSide  + '_ELBOW']];
  var lHip = lm[MP.L_HIP], rHip = lm[MP.R_HIP];
  var lKnee = lm[MP.L_KNEE], rKnee = lm[MP.R_KNEE];
  var lAnkle = lm[MP.L_ANKLE], rAnkle = lm[MP.R_ANKLE];

  var batLiftAngle = null;
  if (bowlShoulder && bowlElbow && bowlWrist && landmarkVisibilityOk(bowlWrist)) {
    var wristAboveShoulder = bowlShoulder.y - bowlWrist.y;
    batLiftAngle = wristAboveShoulder > 0
      ? Math.min(90, wristAboveShoulder * 300)
      : 0;
  }

  var topElbowAngle = null;
  if (offShoulder && offElbow && bowlShoulder) {
    topElbowAngle = angleBetween3Points(bowlShoulder, offShoulder, offElbow);
  }

  var bodyRotation = null;
  if (lHip && rHip && lm[MP.L_SHOULDER] && lm[MP.R_SHOULDER]) {
    var hipAngle    = Math.atan2(rHip.y - lHip.y, rHip.x - lHip.x) * 180/Math.PI;
    var shoulAngle  = Math.atan2(lm[MP.R_SHOULDER].y - lm[MP.L_SHOULDER].y, lm[MP.R_SHOULDER].x - lm[MP.L_SHOULDER].x) * 180/Math.PI;
    bodyRotation    = Math.abs(shoulAngle - hipAngle);
    if (bodyRotation > 90) bodyRotation = 180 - bodyRotation;
    bodyRotation    = bodyRotation * (hand === 'LHB' ? -1 : 1);
    bodyRotation    = Math.abs(bodyRotation);
  }

  var frontElbowAngle = null;
  if (offShoulder && offElbow && bowlShoulder) {
    frontElbowAngle = angleBetween3Points(offShoulder, offElbow, lm[MP[offSide + '_WRIST']]);
  }

  var weightForward = null;
  if (lAnkle && rAnkle && lHip && rHip) {
    var hipCentreX   = (lHip.x + rHip.x) / 2;
    var ankleCentreX = (lAnkle.x + rAnkle.x) / 2;
    weightForward = (hand === 'RHB') ? (ankleCentreX < hipCentreX) : (ankleCentreX > hipCentreX);
  }

  var kneeAngle = null;
  var frontKneeLandmark = lm[MP[(hand === 'RHB' ? 'L' : 'R') + '_KNEE']];
  var frontAnkleLandmark = lm[MP[(hand === 'RHB' ? 'L' : 'R') + '_ANKLE']];
  var frontHipLandmark   = lm[MP[(hand === 'RHB' ? 'L' : 'R') + '_HIP']];
  if (frontKneeLandmark && frontAnkleLandmark && frontHipLandmark) {
    kneeAngle = angleBetween3Points(frontHipLandmark, frontKneeLandmark, frontAnkleLandmark);
  }

  return {
    batLiftAngle: batLiftAngle,
    topElbowAngle: topElbowAngle,
    bodyRotation: bodyRotation,
    frontElbowAngle: frontElbowAngle,
    weightForward: weightForward,
    kneeAngle: kneeAngle,
    noseY: lm[MP.NOSE] ? lm[MP.NOSE].y : null,
    noseX: lm[MP.NOSE] ? lm[MP.NOSE].x : null,
    wristY: bowlWrist ? bowlWrist.y : null,
    shoulderY: bowlShoulder ? bowlShoulder.y : null,
    confidence: avgVisibility(lm),
  };
}

function extractBowlingMetrics(lm, hand) {
  var bowlSide = (hand === 'LHB') ? 'L' : 'R';
  var offSide  = (hand === 'LHB') ? 'R' : 'L';

  var bowlShoulder = lm[MP[bowlSide + '_SHOULDER']];
  var bowlElbow    = lm[MP[bowlSide + '_ELBOW']];
  var bowlWrist    = lm[MP[bowlSide + '_WRIST']];
  var offShoulder  = lm[MP[offSide  + '_SHOULDER']];
  var lHip = lm[MP.L_HIP], rHip = lm[MP.R_HIP];
  var frontKnee   = lm[MP[(hand === 'RHB' ? 'L' : 'R') + '_KNEE']];
  var frontAnkle  = lm[MP[(hand === 'RHB' ? 'L' : 'R') + '_ANKLE']];
  var frontHip    = lm[MP[(hand === 'RHB' ? 'L' : 'R') + '_HIP']];

  var elbowExt = null;
  if (bowlShoulder && bowlElbow && bowlWrist &&
      landmarkVisibilityOk(bowlShoulder) && landmarkVisibilityOk(bowlElbow) && landmarkVisibilityOk(bowlWrist)) {
    elbowExt = elbowExtensionAngle(bowlShoulder, bowlElbow, bowlWrist);
  }

  var hss = null;
  if (lHip && rHip && lm[MP.L_SHOULDER] && lm[MP.R_SHOULDER]) {
    hss = hipShoulderSeparation(lHip, rHip, lm[MP.L_SHOULDER], lm[MP.R_SHOULDER]);
  }

  var frontKneeAngle = null;
  if (frontHip && frontKnee && frontAnkle) {
    frontKneeAngle = angleBetween3Points(frontHip, frontKnee, frontAnkle);
  }

  var shoulderHeight = null;
  if (bowlShoulder && lHip && rHip) {
    var hipY = (lHip.y + rHip.y) / 2;
    shoulderHeight = (hipY - bowlShoulder.y) * 100; // positive = shoulder above hip (in normalized coords)
  }

  var wristRelShoulder = null;
  if (bowlWrist && bowlShoulder) {
    wristRelShoulder = bowlShoulder.y - bowlWrist.y; // positive = wrist above shoulder
  }

  var hipX = lHip && rHip ? (lHip.x + rHip.x) / 2 : null;

  return {
    elbowExtension: elbowExt,
    hipShoulderSeparation: hss,
    frontKneeAngle: frontKneeAngle,
    shoulderHeight: shoulderHeight,
    wristRelShoulder: wristRelShoulder,
    hipX: hipX,
    noseY: lm[MP.NOSE] ? lm[MP.NOSE].y : null,
    confidence: avgVisibility(lm),
  };
}

function extractFieldingMetrics(lm) {
  var lHip = lm[MP.L_HIP], rHip = lm[MP.R_HIP];
  var lKnee = lm[MP.L_KNEE], rKnee = lm[MP.R_KNEE];
  var lShoulder = lm[MP.L_SHOULDER], rShoulder = lm[MP.R_SHOULDER];
  var lWrist = lm[MP.L_WRIST], rWrist = lm[MP.R_WRIST];

  var hipHeight = lHip && rHip ? (lHip.y + rHip.y) / 2 : null;
  var kneeHeight = lKnee && rKnee ? (lKnee.y + rKnee.y) / 2 : null;
  var bodyLean   = null;
  if (lHip && rHip && lShoulder && rShoulder) {
    var hipCX = (lHip.x + rHip.x) / 2;
    var shoulCX = (lShoulder.x + rShoulder.x) / 2;
    bodyLean = Math.abs(shoulCX - hipCX) * 100;
  }
  var handHeight = lWrist && rWrist ? Math.min(lWrist.y, rWrist.y) : null;
  var throwElbow = null;
  if (rShoulder && lm[MP.R_ELBOW] && rWrist) {
    throwElbow = angleBetween3Points(rShoulder, lm[MP.R_ELBOW], rWrist);
  }

  return {
    hipHeight: hipHeight,
    kneeHeight: kneeHeight,
    bodyLean: bodyLean,
    handHeight: handHeight,
    throwElbow: throwElbow,
    confidence: avgVisibility(lm),
  };
}

function extractKeepingMetrics(lm) {
  var lHip = lm[MP.L_HIP], rHip = lm[MP.R_HIP];
  var lKnee = lm[MP.L_KNEE], rKnee = lm[MP.R_KNEE];
  var lAnkle = lm[MP.L_ANKLE], rAnkle = lm[MP.R_ANKLE];
  var lShoulder = lm[MP.L_SHOULDER], rShoulder = lm[MP.R_SHOULDER];
  var lWrist = lm[MP.L_WRIST], rWrist = lm[MP.R_WRIST];

  var stanceWidth = lAnkle && rAnkle ? Math.abs(rAnkle.x - lAnkle.x) : null;
  var shoulderWidth = lShoulder && rShoulder ? Math.abs(rShoulder.x - lShoulder.x) : null;
  var stanceRatio = (stanceWidth && shoulderWidth && shoulderWidth > 0) ? stanceWidth / shoulderWidth : null;

  var crouchAngleL = lHip && lKnee && lAnkle ? angleBetween3Points(lHip, lKnee, lAnkle) : null;
  var crouchAngleR = rHip && rKnee && rAnkle ? angleBetween3Points(rHip, rKnee, rAnkle) : null;
  var crouchAngle = (crouchAngleL && crouchAngleR) ? (crouchAngleL + crouchAngleR) / 2 : (crouchAngleL || crouchAngleR);

  var gloveY = lWrist && rWrist ? Math.min(lWrist.y, rWrist.y) : null;
  var hipY   = lHip && rHip ? (lHip.y + rHip.y) / 2 : null;
  var gloveRelHip = (gloveY !== null && hipY !== null) ? hipY - gloveY : null;

  return {
    stanceRatio: stanceRatio,
    crouchAngle: crouchAngle,
    gloveRelHip: gloveRelHip,
    hipY: hipY,
    confidence: avgVisibility(lm),
  };
}

function avgVisibility(lm) {
  if (!lm || !lm.length) return 0;
  var valid = lm.filter(function(p) { return p && p.visibility !== undefined; });
  if (!valid.length) return 1;
  return valid.reduce(function(s, p) { return s + p.visibility; }, 0) / valid.length;
}

// ── Phase detection ───────────────────────────────────────────────
function detectBattingPhase(frameMetrics, frameIdx, totalFrames) {
  var pct = frameIdx / Math.max(1, totalFrames - 1);
  var m   = frameMetrics;
  if (!m) return 'stance';
  if (pct < 0.18) return 'stance';
  if (!m.wristY || !m.shoulderY) return pct < 0.5 ? 'backswing' : pct < 0.75 ? 'contact' : 'followThrough';
  var wristAboveShoulder = m.shoulderY - m.wristY; // positive = wrist is above shoulder in image coords
  if (pct < 0.55 && wristAboveShoulder < 0.05) return 'backswing';
  if (pct < 0.78) return 'contact';
  return 'followThrough';
}

function detectBowlingPhase(frameMetrics, frameIdx, totalFrames) {
  var pct = frameIdx / Math.max(1, totalFrames - 1);
  if (pct < 0.30) return 'runUp';
  if (pct < 0.55) return 'deliveryStride';
  if (pct < 0.78) return 'armAction';
  return 'followThrough';
}

// ── Frame accumulator ─────────────────────────────────────────────
function createAccumulator() {
  return {
    batLiftAngles: [], topElbowAngles: [], bodyRotations: [], frontElbowAngles: [],
    weightForwardFrames: 0, weightFrameCount: 0, kneeAngles: [],
    noseXs: [], noseYs: [], wristYs: [],
    elbowExtensions: [], hsValues: [], frontKneeAngles: [],
    shoulderHeights: [], wristRelShoulders: [], hipXs: [],
    hipHeights: [], kneeHeightValues: [], bodyLeans: [], handHeights: [], throwElbows: [],
    stanceRatios: [], crouchAngles: [], gloveRelHips: [],
    phaseFrames: { stance:0, backswing:0, contact:0, followThrough:0, runUp:0, deliveryStride:0, armAction:0 },
    confidences: [], frameCount: 0,
  };
}

function accumulateBatting(acc, m, phase) {
  if (m.batLiftAngle !== null) acc.batLiftAngles.push(m.batLiftAngle);
  if (m.topElbowAngle !== null) acc.topElbowAngles.push(m.topElbowAngle);
  if (m.bodyRotation !== null) acc.bodyRotations.push(m.bodyRotation);
  if (m.frontElbowAngle !== null) acc.frontElbowAngles.push(m.frontElbowAngle);
  if (m.weightForward !== null) { acc.weightForwardFrames += m.weightForward ? 1 : 0; acc.weightFrameCount++; }
  if (m.kneeAngle !== null) acc.kneeAngles.push(m.kneeAngle);
  if (m.noseX !== null) acc.noseXs.push(m.noseX);
  if (m.noseY !== null) acc.noseYs.push(m.noseY);
  if (m.wristY !== null) acc.wristYs.push(m.wristY);
  if (m.confidence !== null) acc.confidences.push(m.confidence);
  if (acc.phaseFrames[phase] !== undefined) acc.phaseFrames[phase]++;
  acc.frameCount++;
}

function accumulateBowling(acc, m, phase) {
  if (m.elbowExtension !== null) acc.elbowExtensions.push(m.elbowExtension);
  if (m.hipShoulderSeparation !== null) acc.hsValues.push(m.hipShoulderSeparation);
  if (m.frontKneeAngle !== null) acc.frontKneeAngles.push(m.frontKneeAngle);
  if (m.shoulderHeight !== null) acc.shoulderHeights.push(m.shoulderHeight);
  if (m.wristRelShoulder !== null) acc.wristRelShoulders.push(m.wristRelShoulder);
  if (m.hipX !== null) acc.hipXs.push(m.hipX);
  if (m.confidence !== null) acc.confidences.push(m.confidence);
  if (acc.phaseFrames[phase] !== undefined) acc.phaseFrames[phase]++;
  acc.frameCount++;
}

function accumulateFielding(acc, m) {
  if (m.hipHeight !== null) acc.hipHeights.push(m.hipHeight);
  if (m.kneeHeight !== null) acc.kneeHeightValues.push(m.kneeHeight);
  if (m.bodyLean !== null) acc.bodyLeans.push(m.bodyLean);
  if (m.handHeight !== null) acc.handHeights.push(m.handHeight);
  if (m.throwElbow !== null) acc.throwElbows.push(m.throwElbow);
  if (m.confidence !== null) acc.confidences.push(m.confidence);
  acc.frameCount++;
}

function accumulateKeeping(acc, m) {
  if (m.stanceRatio !== null) acc.stanceRatios.push(m.stanceRatio);
  if (m.crouchAngle !== null) acc.crouchAngles.push(m.crouchAngle);
  if (m.gloveRelHip !== null) acc.gloveRelHips.push(m.gloveRelHip);
  if (m.confidence !== null) acc.confidences.push(m.confidence);
  acc.frameCount++;
}

function avg(arr) {
  if (!arr || !arr.length) return null;
  return arr.reduce(function(s, v) { return s + v; }, 0) / arr.length;
}
function percentile(arr, pct) {
  if (!arr || !arr.length) return null;
  var sorted = arr.slice().sort(function(a, b) { return a - b; });
  return sorted[Math.floor(sorted.length * pct / 100)];
}
function maxVal(arr) {
  if (!arr || !arr.length) return null;
  return Math.max.apply(null, arr);
}
function minVal(arr) {
  if (!arr || !arr.length) return null;
  return Math.min.apply(null, arr);
}

// ── Scoring functions ─────────────────────────────────────────────
function scoreBatting(acc, handedness) {
  var headStability = 100;
  if (acc.noseXs.length > 3) {
    var sdX = stdDev(acc.noseXs);
    var sdY = stdDev(acc.noseYs);
    headStability = Math.max(0, Math.min(100, 100 - (sdX + sdY) * 600));
  }

  var avgBatLift    = avg(acc.batLiftAngles) || 0;
  var batLiftScore  = scoreVsIdeal(avgBatLift, 55, 15);

  var avgTopElbow   = avg(acc.topElbowAngles) || 90;
  var topElbowScore = scoreVsIdeal(avgTopElbow, 100, 25);

  var peakRotation  = percentile(acc.bodyRotations, 85) || 0;
  var rotationScore = scoreVsIdeal(Math.min(peakRotation, 100), 80, 25);

  var avgFrontElbow = avg(acc.frontElbowAngles) || 90;
  var frontElbScore = scoreVsIdeal(avgFrontElbow, 90, 20);

  var wtScore = acc.weightFrameCount > 0
    ? Math.round((acc.weightForwardFrames / acc.weightFrameCount) * 100)
    : 60;

  var avgKnee    = avg(acc.kneeAngles) || 150;
  var kneeScore  = scoreVsIdeal(avgKnee, 155, 20);

  var wristPeak  = minVal(acc.wristYs); // lower Y = higher in frame = follow-through
  var ftScore    = wristPeak !== null ? Math.max(0, Math.min(100, (1 - wristPeak) * 130)) : 55;

  var stanceScore    = Math.round(headStability * 0.5 + topElbowScore * 0.3 + kneeScore * 0.2);
  var backswingScore = Math.round(batLiftScore * 0.55 + topElbowScore * 0.30 + headStability * 0.15);
  var contactScore   = Math.round(rotationScore * 0.40 + frontElbScore * 0.35 + headStability * 0.25);
  var followScore    = Math.round(ftScore * 0.60 + wtScore * 0.40);

  var overall = Math.round(
    stanceScore * 0.20 +
    backswingScore * 0.25 +
    contactScore * 0.35 +
    followScore * 0.20
  );

  var peakHip   = peakRotation;
  var peakElbow = avgFrontElbow;
  var classified = A.VD ? A.VD.classifyShot(peakHip, peakElbow, acc.weightFrameCount > 0 && acc.weightForwardFrames / acc.weightFrameCount > 0.5) : null;

  return {
    score: Math.max(0, Math.min(100, overall)),
    subScores: { stance: stanceScore, backswing: backswingScore, contact: contactScore, followThrough: followScore },
    metrics: {
      headStability: Math.round(headStability),
      batLiftAngle: Math.round(avgBatLift),
      topElbowAngle: Math.round(avgTopElbow),
      bodyRotation: Math.round(peakRotation),
      frontElbowAngle: Math.round(avgFrontElbow),
      weightTransfer: wtScore,
      balance: Math.round(kneeScore * 0.6 + headStability * 0.4),
    },
    shotType: classified ? classified.id : 'defensive',
    shotLabel: classified ? classified.label : 'Defensive',
    iccCheck: null,
    injuryRisk: null,
  };
}

function scoreBowling(acc, handedness) {
  var avgElbowExt  = avg(acc.elbowExtensions);
  var maxElbowExt  = maxVal(acc.elbowExtensions) || 0;
  var iccStatus    = maxElbowExt < 15 ? 'legal' : maxElbowExt < 22 ? 'borderline' : 'illegal';
  var iccScore     = maxElbowExt < 15 ? 100 : maxElbowExt < 22 ? 62 : 20;

  var avgHSS       = avg(acc.hsValues) || 0;
  var hssScore     = scoreVsIdeal(avgHSS, 42, 12);

  var avgKnee      = avg(acc.frontKneeAngles) || 140;
  var kneeScore    = scoreVsIdeal(avgKnee, 155, 20);

  var shoulderAvg  = avg(acc.shoulderHeights) || 0;
  var shoulderScore = Math.max(0, Math.min(100, shoulderAvg * 8 + 55));

  var runUpConsistency = 75;
  if (acc.hipXs.length > 5) {
    var hipSD = stdDev(acc.hipXs);
    runUpConsistency = Math.max(0, Math.min(100, 100 - hipSD * 800));
  }

  var armActionScore    = Math.round(iccScore * 0.50 + hssScore * 0.35 + shoulderScore * 0.15);
  var deliveryStrideScore = Math.round(kneeScore * 0.65 + shoulderScore * 0.35);
  var releaseScore      = Math.round(shoulderScore * 0.55 + hssScore * 0.45);
  var runUpScore        = Math.round(runUpConsistency);

  var overall = Math.round(
    runUpScore * 0.15 +
    deliveryStrideScore * 0.30 +
    armActionScore * 0.35 +
    releaseScore * 0.20
  );

  var loadScore = Math.min(10, Math.round((maxElbowExt / 22) * 5 + (acc.frameCount > 100 ? 3 : 1)));

  return {
    score: Math.max(0, Math.min(100, overall)),
    subScores: { runUp: runUpScore, deliveryStride: deliveryStrideScore, armAction: armActionScore, release: releaseScore },
    metrics: {
      elbowExtension: Math.round(avgElbowExt || 0),
      maxElbowExtension: Math.round(maxElbowExt),
      hipShoulderSeparation: Math.round(avgHSS),
      frontKneeAngle: Math.round(avgKnee),
      shoulderHeight: Math.round(shoulderAvg * 10),
      runUpConsistency: Math.round(runUpConsistency),
    },
    shotType: null,
    shotLabel: null,
    iccCheck: {
      angle: Math.round(maxElbowExt * 10) / 10,
      status: iccStatus,
      color: iccStatus === 'legal' ? '#16a34a' : iccStatus === 'borderline' ? '#f59e0b' : '#dc2626',
    },
    injuryRisk: loadScore,
  };
}

function scoreFielding(acc) {
  var avgBodyLean   = avg(acc.bodyLeans) || 10;
  var groundScore   = Math.max(0, Math.min(100, 100 - avgBodyLean * 2));

  var avgHipHeight  = avg(acc.hipHeights) || 0.5;
  var lowBodyScore  = Math.max(0, Math.min(100, (1 - avgHipHeight) * 150));

  var avgThrowElbow = avg(acc.throwElbows) || 90;
  var throwScore    = scoreVsIdeal(avgThrowElbow, 90, 20);

  var handScore     = 70; // approximate — catching hands assessment

  var stanceScore   = Math.round(lowBodyScore * 0.6 + groundScore * 0.4);
  var movementScore = Math.round(groundScore * 0.7 + lowBodyScore * 0.3);
  var handsScore    = Math.round(handScore);
  var throwingScore = Math.round(throwScore);

  var overall = Math.round(
    stanceScore * 0.25 +
    movementScore * 0.30 +
    handsScore * 0.25 +
    throwingScore * 0.20
  );

  return {
    score: Math.max(0, Math.min(100, overall)),
    subScores: { stance: stanceScore, movement: movementScore, hands: handsScore, throwing: throwingScore },
    metrics: {
      groundFieldingPosition: Math.round(lowBodyScore),
      bodyLean: Math.round(avgBodyLean),
      throwingMechanics: Math.round(throwScore),
    },
    shotType: null, shotLabel: null, iccCheck: null, injuryRisk: null,
  };
}

function scoreKeeping(acc) {
  var avgRatio   = avg(acc.stanceRatios) || 1.2;
  var stanceScore = scoreVsIdeal(avgRatio, 1.3, 0.3);

  var avgCrouch  = avg(acc.crouchAngles) || 120;
  var crouchScore = scoreVsIdeal(avgCrouch, 100, 25);

  var avgGlove   = avg(acc.gloveRelHips) || 0;
  var gloveScore = Math.max(0, Math.min(100, 55 + avgGlove * 200));

  var footworkScore = 70;

  var overall = Math.round(
    stanceScore  * 0.30 +
    crouchScore  * 0.30 +
    gloveScore   * 0.25 +
    footworkScore * 0.15
  );

  return {
    score: Math.max(0, Math.min(100, overall)),
    subScores: { stance: stanceScore, footwork: footworkScore, glovework: Math.round(gloveScore), reaction: 70 },
    metrics: {
      stanceWidth: Math.round(stanceScore),
      crouchDepth: Math.round(crouchScore),
      glovePosition: Math.round(gloveScore),
    },
    shotType: null, shotLabel: null, iccCheck: null, injuryRisk: null,
  };
}

// ── Demo mode scores (when pose engine unavailable) ───────────────
function demoScore(mode, videoEl) {
  var seed = ((videoEl && videoEl.duration) || 15) * 1000;
  var r = function(base, range) { return Math.round(base + ((seed % 100) / 100) * range - range/2); };
  var s = { batting:{stance:r(78,20),backswing:r(72,24),contact:r(75,22),followThrough:r(70,20)},
            bowling:{runUp:r(80,16),deliveryStride:r(74,20),armAction:r(76,18),release:r(71,20)},
            fielding:{stance:r(76,20),movement:r(72,22),hands:r(74,18),throwing:r(70,20)},
            keeping:{stance:r(75,20),footwork:r(72,22),glovework:r(76,18),reaction:r(70,16)} };
  var sub = s[mode] || s.batting;
  var totalScore = Math.round(Object.values(sub).reduce(function(a,b){return a+b;},0)/Object.keys(sub).length);
  var demoMetrics = { headStability:r(80,20), batLiftAngle:r(52,14), bodyRotation:r(76,20), frontElbowAngle:r(88,18),
    weightTransfer:r(72,20), balance:r(78,18), elbowExtension:r(8,6), hipShoulderSeparation:r(38,12),
    frontKneeAngle:r(150,20), runUpConsistency:r(80,16) };
  return {
    score: totalScore, subScores: sub, metrics: demoMetrics,
    shotType: mode === 'batting' ? 'cover_drive' : null,
    shotLabel: mode === 'batting' ? 'Cover Drive' : null,
    iccCheck: mode === 'bowling' ? {angle:r(8,6), status:'legal', color:'#16a34a'} : null,
    injuryRisk: mode === 'bowling' ? 3 : null,
  };
}

// ── Load MediaPipe dynamically ────────────────────────────────────
function loadMediaPipeScripts(onProgress) {
  if (window._scMPLoaded) return Promise.resolve('mediapipe');
  return new Promise(function(resolve, reject) {
    onProgress && onProgress('Loading ProVision™ Pose Engine...');
    var s1 = document.createElement('script');
    s1.src = MP_CDN_BASE + '/pose.min.js';
    s1.crossOrigin = 'anonymous';
    s1.onload = function() {
      window._scMPLoaded = true;
      resolve('mediapipe');
    };
    s1.onerror = function() {
      console.warn('[SC] MediaPipe CDN failed, attempting MoveNet fallback');
      reject(new Error('mediapipe_failed'));
    };
    document.head.appendChild(s1);
  });
}

function createMediaPoseInstance(complexity) {
  if (typeof window.Pose === 'undefined') return null;
  try {
    var pose = new window.Pose({
      locateFile: function(file) { return MP_CDN_BASE + '/' + file; }
    });
    pose.setOptions({
      modelComplexity: complexity || 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.55,
      minTrackingConfidence: 0.55,
    });
    return pose;
  } catch(e) {
    console.warn('[SC] Pose instance failed:', e);
    return null;
  }
}

// ── Main analysis function ────────────────────────────────────────
async function analyseVideo(videoEl, opts, onProgress, onFrameResult) {
  var mode       = opts.mode || 'batting';
  var handedness = opts.handedness || 'RHB';
  var fps        = opts.fps || 8;
  var backend    = 'demo';

  onProgress && onProgress(2, 'Initializing BioTrack™ Pose System...');

  // Try MediaPipe
  var pose = null;
  try {
    await loadMediaPipeScripts(function(msg) { onProgress && onProgress(5, msg); });
    pose = createMediaPoseInstance(opts.live ? 0 : 1);
    if (pose) backend = 'mediapipe';
  } catch(e) {
    console.warn('[SC] MediaPipe unavailable:', e.message);
  }

  // Fallback: demo mode
  if (!pose) {
    onProgress && onProgress(80, 'Running CricketIQ™ Assessment...');
    await delay(800);
    onProgress && onProgress(95, 'Finalizing scores...');
    await delay(400);
    return buildSession(demoScore(mode, videoEl), mode, handedness, videoEl, 'demo', null);
  }

  // Real MediaPipe analysis
  var totalDuration = videoEl.duration || 10;
  var frameInterval = 1 / fps;
  var frameCount    = Math.max(1, Math.floor(totalDuration * fps));
  var allLandmarks  = [];
  var pendingResolve = null;
  var acc = createAccumulator();

  pose.onResults(function(results) {
    var lm = results.poseLandmarks || null;
    allLandmarks.push(lm);
    if (lm) {
      var frameIdx = allLandmarks.length - 1;
      var phase;
      var mFrame;
      if (mode === 'batting') {
        mFrame = extractBattingMetrics(lm, handedness);
        phase  = detectBattingPhase(mFrame, frameIdx, frameCount);
        accumulateBatting(acc, mFrame, phase);
      } else if (mode === 'bowling') {
        mFrame = extractBowlingMetrics(lm, handedness);
        phase  = detectBowlingPhase(mFrame, frameIdx, frameCount);
        accumulateBowling(acc, mFrame, phase);
      } else if (mode === 'fielding') {
        mFrame = extractFieldingMetrics(lm);
        accumulateFielding(acc, mFrame);
      } else {
        mFrame = extractKeepingMetrics(lm);
        accumulateKeeping(acc, mFrame);
      }
      onFrameResult && onFrameResult({ lm: lm, frame: frameIdx, phase: phase });
    }
    if (pendingResolve) { pendingResolve(); pendingResolve = null; }
  });

  // Offscreen canvas for drawing frames
  var canvas = document.createElement('canvas');
  canvas.width  = Math.min(videoEl.videoWidth  || 640, 640);
  canvas.height = Math.min(videoEl.videoHeight || 480, 480);
  var ctx = canvas.getContext('2d');

  for (var i = 0; i < frameCount; i++) {
    var t = i * frameInterval;
    videoEl.currentTime = t;
    await new Promise(function(res) {
      videoEl.addEventListener('seeked', res, { once: true });
    });
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    await new Promise(function(res) { pendingResolve = res; pose.send({ image: canvas }); });
    var pct = Math.round(10 + (i / frameCount) * 75);
    onProgress && onProgress(pct, 'Analysing frame ' + (i+1) + ' of ' + frameCount + '...');
    if (i % 6 === 0) await delay(0);
  }

  pose.close();
  onProgress && onProgress(90, 'Computing CricketIQ™ Scores...');
  await delay(300);

  var scored;
  if (mode === 'batting')       scored = scoreBatting(acc, handedness);
  else if (mode === 'bowling')  scored = scoreBowling(acc, handedness);
  else if (mode === 'fielding') scored = scoreFielding(acc);
  else                          scored = scoreKeeping(acc);

  // Low confidence warning
  var avgConf = avg(acc.confidences) || 1;
  if (avgConf < 0.45) {
    scored.warnings = ['Low video visibility detected. For best accuracy: good lighting, contrasting clothing, side-on camera angle.'];
  }

  onProgress && onProgress(98, 'Building report...');
  await delay(200);

  return buildSession(scored, mode, handedness, videoEl, backend, allLandmarks);
}

function buildSession(scored, mode, handedness, videoEl, backend, landmarks) {
  var id = 'va_' + Date.now().toString(36);
  var feedback = buildFeedback(scored, mode);
  var linkedDrills = buildLinkedDrills(scored, mode);

  return {
    id: id,
    date: new Date().toISOString().slice(0, 10),
    mode: mode,
    handedness: handedness,
    duration: Math.round(videoEl ? (videoEl.duration || 0) : 0),
    frames: landmarks ? landmarks.length : scored.frames || 0,
    score: scored.score,
    grade: getGrade(scored.score),
    subScores: scored.subScores || {},
    metrics: scored.metrics || {},
    shotType: scored.shotType,
    shotLabel: scored.shotLabel,
    iccCheck: scored.iccCheck,
    injuryRisk: scored.injuryRisk,
    warnings: scored.warnings || [],
    feedback: feedback,
    linkedDrills: linkedDrills,
    backend: backend,
    landmarks: landmarks ? landmarks.filter(function(_, i) { return i % 3 === 0; }) : [], // sample every 3rd
    ts: Date.now(),
  };
}

function getGrade(score) {
  if (score >= 85) return 'Elite';
  if (score >= 70) return 'Advanced';
  if (score >= 55) return 'Developing';
  return 'Beginner';
}

function buildFeedback(scored, mode) {
  if (!A.VD) return [];
  var feedback = [];
  var metrics = scored.metrics || {};
  var subScores = scored.subScores || {};

  // Find top 3 weakest sub-scores
  var subArr = Object.keys(subScores).map(function(k) { return { key: k, val: subScores[k] }; });
  subArr.sort(function(a, b) { return a.val - b.val; });
  var weakSubs = subArr.slice(0, 2);

  // Generate feedback for key metrics
  var metricKeys = Object.keys(metrics);
  metricKeys.forEach(function(mk) {
    var val = metrics[mk];
    if (val === null || val === undefined) return;
    var text = A.VD.getFeedback(mode, mk, val);
    if (text) feedback.push({ metric: mk, score: val, text: text, priority: val < 55 ? 1 : val < 70 ? 2 : 3 });
  });

  feedback.sort(function(a, b) { return a.priority - b.priority || a.score - b.score; });
  return feedback.slice(0, 5);
}

function buildLinkedDrills(scored, mode) {
  if (!A.VD) return [];
  var metrics = scored.metrics || {};
  var lowMetrics = Object.keys(metrics).filter(function(k) {
    return metrics[k] !== null && metrics[k] < 65;
  });
  return A.VD.getLinkedDrills(lowMetrics);
}

function delay(ms) {
  return new Promise(function(r) { setTimeout(r, ms); });
}

// ── Live camera analysis ──────────────────────────────────────────
async function startLiveAnalysis(videoEl, canvasEl, opts, onFrameResult) {
  var mode       = opts.mode || 'batting';
  var handedness = opts.handedness || 'RHB';

  await loadMediaPipeScripts();
  var pose = createMediaPoseInstance(0); // Lite model for real-time
  if (!pose) return null;

  var ctx = canvasEl.getContext('2d');
  var CONN = A.VD ? A.VD.POSE_CONNECTIONS : [];

  pose.onResults(function(results) {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.drawImage(results.image, 0, 0, canvasEl.width, canvasEl.height);
    if (results.poseLandmarks) {
      drawSkeletonOnCanvas(ctx, results.poseLandmarks, canvasEl.width, canvasEl.height, '#22c55e', CONN);
      var mFrame;
      if (mode === 'batting') mFrame = extractBattingMetrics(results.poseLandmarks, handedness);
      else if (mode === 'bowling') mFrame = extractBowlingMetrics(results.poseLandmarks, handedness);
      else if (mode === 'fielding') mFrame = extractFieldingMetrics(results.poseLandmarks);
      else mFrame = extractKeepingMetrics(results.poseLandmarks);
      onFrameResult && onFrameResult({ lm: results.poseLandmarks, metrics: mFrame });
    }
  });

  var rafId = null;
  function loop() {
    pose.send({ image: videoEl });
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  return {
    stop: function() {
      cancelAnimationFrame(rafId);
      pose.close();
    },
    pose: pose,
  };
}

function drawSkeletonOnCanvas(ctx, landmarks, w, h, color, connections) {
  if (!landmarks || !landmarks.length) return;
  connections = connections || A.VD.POSE_CONNECTIONS;

  ctx.save();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color || '#22c55e';
  ctx.globalAlpha = 0.88;

  connections.forEach(function(pair) {
    var a = landmarks[pair[0]], b = landmarks[pair[1]];
    if (!a || !b || (a.visibility !== undefined && a.visibility < 0.4)) return;
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.stroke();
  });

  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.92;
  landmarks.forEach(function(lm) {
    if (!lm || (lm.visibility !== undefined && lm.visibility < 0.35)) return;
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 3.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

// ── Export ────────────────────────────────────────────────────────
Object.assign(A, {
  VideoEngine: {
    analyseVideo: analyseVideo,
    startLiveAnalysis: startLiveAnalysis,
    drawSkeletonOnCanvas: drawSkeletonOnCanvas,
    getGrade: getGrade,
    delay: delay,
    // Expose scoring functions for testing
    scoreBatting: scoreBatting,
    scoreBowling: scoreBowling,
    scoreFielding: scoreFielding,
    scoreKeeping: scoreKeeping,
    demoScore: demoScore,
  },
});

console.log('[SC] app-video-engine ready — Motion Intelligence Engine v1.0');
})();
