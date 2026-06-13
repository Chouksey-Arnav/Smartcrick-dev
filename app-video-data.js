// ================================================================
// SmartCrick ProVision™ — Video Analysis Data Layer
// app-video-data.js  v1.0
// Elite Benchmark Database™ · Coaching Feedback Library · Shot Templates
// ================================================================
(function () {
'use strict';
var A = window.SC_APP;

// ── MediaPipe Pose Landmark Index Reference ───────────────────────
// 0:nose  1:L-eye-inner  2:L-eye  3:L-eye-outer  4:R-eye-inner
// 5:R-eye  6:R-eye-outer  7:L-ear  8:R-ear
// 9:mouth-L  10:mouth-R
// 11:L-shoulder  12:R-shoulder  13:L-elbow  14:R-elbow
// 15:L-wrist  16:R-wrist  17:L-pinky  18:R-pinky
// 19:L-index  20:R-index  21:L-thumb  22:R-thumb
// 23:L-hip  24:R-hip  25:L-knee  26:R-knee
// 27:L-ankle  28:R-ankle  29:L-heel  30:R-heel
// 31:L-foot-index  32:R-foot-index

// ── Elite Benchmark Database™ ─────────────────────────────────────
var ELITE_BENCHMARKS = {

  batting: {
    stanceScore: {
      label: 'Stance',
      unit: 'score',
      elite: { min: 80, max: 100 },
      good:  { min: 60, max: 80 },
      fair:  { min: 40, max: 60 },
      poor:  { min: 0,  max: 40 },
    },
    headStability: {
      label: 'Head Stability',
      unit: 'score',
      elite: { min: 85, max: 100 },
      good:  { min: 65, max: 85 },
      fair:  { min: 45, max: 65 },
      poor:  { min: 0,  max: 45 },
      description: 'Head movement during the shot. Minimal movement = better tracking of the ball.',
    },
    shoulderAlignment: {
      label: 'Shoulder Alignment',
      unit: 'degrees',
      ideal: 88,
      range: 15,
      elite: { min: 80, max: 100 },
      description: 'Side-on shoulder angle to the pitch. 85-95° is ideal for a closed, compact stance.',
    },
    batLiftAngle: {
      label: 'Bat Lift Angle',
      unit: 'degrees',
      ideal: 57,
      range: 12,
      elite: { min: 75, max: 100 },
      description: 'Angle of bat lift from vertical. 50-65° = textbook backswing. Too flat = power loss. Too high = timing issues.',
    },
    topElbowHeight: {
      label: 'Top Elbow',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Top elbow position during backswing. Should be level with or above the shoulder for full power generation.',
    },
    hipRotation: {
      label: 'Hip Rotation',
      unit: 'degrees',
      ideal: 85,
      range: 20,
      elite: { min: 80, max: 100 },
      description: 'Hip rotation angle at point of contact. >80° rotation generates maximum bat speed.',
    },
    frontElbowAngle: {
      label: 'Front Elbow',
      unit: 'degrees',
      ideal: 92,
      range: 20,
      elite: { min: 75, max: 100 },
      description: 'Front elbow angle at contact. Roughly 90° indicates proper arm drive and bat path.',
    },
    weightTransfer: {
      label: 'Weight Transfer',
      unit: 'score',
      elite: { min: 78, max: 100 },
      description: 'How effectively weight shifts from back foot to front foot through the shot.',
    },
    followThrough: {
      label: 'Follow-Through',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Completeness of the bat swing arc post-contact. Full extension = maximum power transfer.',
    },
    balance: {
      label: 'Balance',
      unit: 'score',
      elite: { min: 82, max: 100 },
      description: 'Body balance at completion of shot. Ankle and hip stability measured across final frames.',
    },
  },

  bowling: {
    runUpConsistency: {
      label: 'Run-Up Consistency',
      unit: 'score',
      elite: { min: 85, max: 100 },
      description: 'Regularity of hip landmark path during run-up. Consistent run-up = repeatable action.',
    },
    boundTiming: {
      label: 'Bound Timing',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Optimal position and timing of delivery stride bound. Critical for power and rhythm.',
    },
    frontKneeAngle: {
      label: 'Front Knee Brace',
      unit: 'degrees',
      ideal: 155,
      range: 20,
      elite: { min: 75, max: 100 },
      description: 'Front knee extension at delivery. Near-straight knee (140-170°) = maximum energy transfer upward.',
    },
    elbowExtension: {
      label: 'Elbow Extension',
      unit: 'degrees',
      ideal: 8,
      range: 7,
      elite: { min: 0, max: 15 },
      iccLegal: true,
      description: 'ICC elbow flexion-extension angle. Must be < 15° to be legal. Fast bowlers average ~8°.',
    },
    hipShoulderSeparation: {
      label: 'Hip-Shoulder Sep.',
      unit: 'degrees',
      ideal: 42,
      range: 10,
      elite: { min: 35, max: 50 },
      description: 'Separation between hip axis and shoulder axis at release. 35-50° = elite pace generation. Key to bowling speed.',
    },
    shoulderHeight: {
      label: 'Shoulder Height',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Bowling shoulder elevation at release point. High release = better bounce extraction.',
    },
    wristPosition: {
      label: 'Wrist Position',
      unit: 'score',
      elite: { min: 78, max: 100 },
      description: 'Wrist alignment at release. Upright for seam movement, cocked for swing.',
    },
    followThroughLine: {
      label: 'Follow-Through',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Whether the follow-through stays on the delivery line. Deviating = erratic line and length.',
    },
    loadScore: {
      label: 'Load Index',
      unit: 'score',
      elite: { min: 0, max: 40 },
      description: 'Cumulative biomechanical load. Lower = better for injury prevention. Monitor across sessions.',
    },
  },

  fielding: {
    catchingStance: {
      label: 'Catching Stance',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Hand position and body setup before catch. Fingers pointing down for low catches, up for high.',
    },
    groundFieldingPosition: {
      label: 'Ground Position',
      unit: 'score',
      elite: { min: 78, max: 100 },
      description: 'Body height and posture during approach to the ball. Lower = faster hands.',
    },
    longBarrierForm: {
      label: 'Long Barrier',
      unit: 'score',
      elite: { min: 75, max: 100 },
      description: 'Proper long-barrier technique: knee down, body behind the ball. Essential safety-net fielding skill.',
    },
    throwingMechanics: {
      label: 'Throwing Mechanics',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Arm path, shoulder alignment, and follow-through of throwing action. Mirrors bowling mechanics.',
    },
    diveForm: {
      label: 'Dive Form',
      unit: 'score',
      elite: { min: 75, max: 100 },
      description: 'Dive angle, reach, and landing technique. Proper form prevents injury and increases range.',
    },
  },

  keeping: {
    stanceWidth: {
      label: 'Stance Width',
      unit: 'score',
      elite: { min: 80, max: 100 },
      description: 'Ankle width relative to shoulder width. Optimal = 1.2-1.5x shoulder width for balance.',
    },
    crouchDepth: {
      label: 'Crouch Depth',
      unit: 'score',
      elite: { min: 82, max: 100 },
      description: 'Hip height relative to knee height. Lower crouch = better for pace bowling; mid-height for spin.',
    },
    glovePosition: {
      label: 'Glove Position',
      unit: 'score',
      elite: { min: 85, max: 100 },
      description: 'Pre-take glove height and angle. In front of body, fingers up = best position.',
    },
    legSideFootwork: {
      label: 'Leg Side Footwork',
      unit: 'score',
      elite: { min: 78, max: 100 },
      description: 'Cross-step technique for leg side takes. Efficient foot movement is critical for stumpings.',
    },
    offSideFootwork: {
      label: 'Off Side Footwork',
      unit: 'score',
      elite: { min: 78, max: 100 },
      description: 'Shuffle technique for off side takes. Must maintain low centre of gravity throughout.',
    },
  },
};

// ── Shot Classification Angle Signatures ─────────────────────────
// Each shot has a biomechanical signature used for classification
// Signatures are approximate angle ranges from pose landmarks
var SHOT_SIGNATURES = {
  batting: [
    {
      id: 'cover_drive',
      label: 'Cover Drive',
      description: 'Off-side drive through the covers — the most elegant shot in cricket.',
      hipRotation: [70, 95],
      frontElbow: [80, 110],
      weightForward: true,
      headPosition: 'forward',
      drills: ['bat_cover_drive', 'bat_front_foot'],
    },
    {
      id: 'straight_drive',
      label: 'Straight Drive',
      description: 'Driven back past the bowler down the ground.',
      hipRotation: [75, 100],
      frontElbow: [85, 110],
      weightForward: true,
      headPosition: 'forward',
      drills: ['bat_straight_drive', 'bat_front_foot'],
    },
    {
      id: 'on_drive',
      label: 'On Drive',
      description: 'Driven through mid-on — requires excellent footwork and head position.',
      hipRotation: [80, 105],
      frontElbow: [90, 120],
      weightForward: true,
      headPosition: 'forward',
      drills: ['bat_on_drive', 'bat_footwork'],
    },
    {
      id: 'off_drive',
      label: 'Off Drive',
      description: 'Driven through extra-cover — requires a high front elbow.',
      hipRotation: [65, 90],
      frontElbow: [75, 105],
      weightForward: true,
      headPosition: 'forward',
      drills: ['bat_off_drive', 'bat_elbow_position'],
    },
    {
      id: 'pull_shot',
      label: 'Pull Shot',
      description: 'Played to a short-pitched delivery, pulling through mid-wicket.',
      hipRotation: [85, 115],
      frontElbow: [70, 100],
      weightForward: false,
      headPosition: 'back',
      drills: ['bat_pull_hook', 'bat_back_foot'],
    },
    {
      id: 'hook_shot',
      label: 'Hook Shot',
      description: 'Aggressive pull to a very short ball — requires excellent judgment.',
      hipRotation: [90, 120],
      frontElbow: [65, 95],
      weightForward: false,
      headPosition: 'back',
      drills: ['bat_pull_hook', 'bat_back_foot'],
    },
    {
      id: 'cut_shot',
      label: 'Cut Shot',
      description: 'Square cut to a wide short ball — punched through point.',
      hipRotation: [55, 80],
      frontElbow: [80, 110],
      weightForward: false,
      headPosition: 'back',
      drills: ['bat_cut_shot', 'bat_back_foot'],
    },
    {
      id: 'sweep',
      label: 'Sweep',
      description: 'Played on one knee to spin bowling — horizontal bat through square leg.',
      hipRotation: [60, 90],
      frontElbow: [60, 95],
      weightForward: true,
      headPosition: 'forward',
      drills: ['bat_sweep_shot', 'bat_footwork'],
    },
    {
      id: 'forward_defensive',
      label: 'Forward Defensive',
      description: 'Dead-bat forward defence — soft hands absorb pace.',
      hipRotation: [30, 60],
      frontElbow: [85, 115],
      weightForward: true,
      headPosition: 'forward',
      drills: ['bat_defensive', 'bat_front_foot'],
    },
    {
      id: 'backward_defensive',
      label: 'Backward Defensive',
      description: 'Back-foot defence — played late with a straight bat.',
      hipRotation: [20, 50],
      frontElbow: [80, 110],
      weightForward: false,
      headPosition: 'back',
      drills: ['bat_defensive', 'bat_back_foot'],
    },
  ],

  bowling: [
    {
      id: 'outswinger',
      label: 'Out-Swinger',
      description: 'Ball moving away from a right-handed batsman in the air.',
      wristAngle: [0, 25],
      deliveryType: 'seam',
      handedness: 'right',
    },
    {
      id: 'inswinger',
      label: 'In-Swinger',
      description: 'Ball moving into a right-handed batsman in the air.',
      wristAngle: [30, 60],
      deliveryType: 'seam',
      handedness: 'right',
    },
    {
      id: 'straight_seam',
      label: 'Straight Delivery',
      description: 'Upright seam, minimal movement — accuracy-focused.',
      wristAngle: [5, 30],
      deliveryType: 'seam',
    },
    {
      id: 'off_spin',
      label: 'Off-Spin',
      description: 'Turning from off to leg (for RHB). Index finger does the work.',
      wristAngle: [70, 100],
      deliveryType: 'spin',
    },
    {
      id: 'leg_spin',
      label: 'Leg-Spin',
      description: 'Turning from leg to off (for RHB). Third finger snaps through.',
      wristAngle: [80, 115],
      deliveryType: 'spin',
    },
    {
      id: 'googly',
      label: 'Googly',
      description: 'Leg-spinner\'s wrong-un — turns the opposite way to leg-spin.',
      wristAngle: [50, 85],
      deliveryType: 'spin',
    },
  ],
};

// ── Coaching Feedback Text Library (200+ items) ───────────────────
var FEEDBACK_LIBRARY = {

  batting: {
    headStability: {
      elite: [
        'Outstanding head stability — your head barely moves through the shot. This is what separates elite batters from the rest.',
        'Head position is rock solid. You\'re seeing the ball all the way onto the bat face. Textbook.',
      ],
      good: [
        'Good head stability with only minor movement. A few more reps with a tennis ball on a string would iron this out completely.',
        'Solid head position overall. Focus on keeping your chin down through contact to reduce the remaining movement.',
      ],
      fair: [
        'Some head movement detected during the shot. This will reduce your ability to pick up the seam and line of delivery early.',
        'Head is moving slightly before contact. Practice the "eyes on the ball" drill — keep your chin pointing at the bowler through release.',
      ],
      poor: [
        'Significant head movement is limiting your shot quality. A stationary head is the foundation of batting technique.',
        'The BioTrack™ sensor detected excessive head movement. This is your #1 priority fix — without a still head, consistent stroke play is impossible.',
      ],
    },

    batLiftAngle: {
      elite: [
        'Perfect bat lift angle — high backswing with the face pointing to slip. Elite technique that generates maximum bat speed.',
        'Backswing angle is in the elite zone. You\'re coiling the bat correctly to generate power through the shot.',
      ],
      good: [
        'Good bat lift. Minor adjustment: try to ensure the face points slightly toward second slip at the top of your backswing.',
        'Solid backswing. To generate more power, focus on getting the handle slightly higher at the peak.',
      ],
      fair: [
        'Bat lift is a little flat. A higher, fuller backswing will give you more time and power to play your shots.',
        'Your backswing could be more pronounced. Practice the shadow-bat drill with a focus on a high initial lift.',
      ],
      poor: [
        'Very flat bat lift detected. You\'re severely limiting your power by not loading the bat properly. Work on this before anything else.',
        'The backswing is too low. Without a proper load, you\'re relying only on arm strength. The whole body should drive the shot.',
      ],
    },

    hipRotation: {
      elite: [
        'Exceptional hip rotation — you\'re using your whole body to drive through the ball. This is how elite batters generate consistent power.',
        'Hip drive is outstanding. Full rotation means maximum bat speed at contact.',
      ],
      good: [
        'Good hip rotation with room to push further. Focus on leading with your left hip (for RHB) to initiate the drive.',
        'Solid body rotation. To unlock more power, think about turning your belt buckle toward the bowler through contact.',
      ],
      fair: [
        'Limited hip rotation — you\'re playing mostly with arms. Hip drive is what separates power hitters from touch players.',
        'The hips are not clearing enough through the shot. This leads to wristy, inconsistent timing. Focus on hip-first rotation.',
      ],
      poor: [
        'Minimal hip rotation detected. The body is static — this will severely limit both power and consistency. Rotational drills are essential.',
        'Almost no hip drive recorded. This shot is all arms and wrists, making it impossible to replicate consistently under pressure.',
      ],
    },

    followThrough: {
      elite: [
        'Beautiful complete follow-through — bat goes all the way through to the finish. Shows total commitment to the shot.',
        'Full follow-through with great balance at the end. This tells us you\'re hitting through the ball, not at it.',
      ],
      good: [
        'Good follow-through with just a slight restriction at the end. Let the bat flow freely past your ear on drives.',
        'Solid completion of the shot. Try to hold the final position for a beat — it trains balance and commitment.',
      ],
      fair: [
        'Follow-through is cut off early. This often happens when a player decelerates before contact, reducing power.',
        'Incomplete follow-through detected. The bat should reach shoulder height on the follow-through of any drive shot.',
      ],
      poor: [
        'The follow-through stops almost immediately after contact. This is a technique fault that bleeds into your timing. Fix this urgently.',
        'Abrupt stop in the swing detected. A proper follow-through is not optional — it determines power and bat speed at contact.',
      ],
    },

    balance: {
      elite: [
        'Exceptional balance throughout — you\'re a statue at the crease. Great balance enables more shots and better positioning.',
        'Balance is elite level. Your base is rock-solid, which means every shot has a stable platform to launch from.',
      ],
      good: [
        'Good balance with minor wobble at the end of the shot. Focus on landing softly and grounding both feet.',
        'Solid overall balance. To improve further, practice one-legged shadow batting for 5 minutes daily.',
      ],
      fair: [
        'Some balance issues detected at shot completion. This often stems from the backlift weight transfer — check your trigger movement.',
        'Slight instability at the finish. Make sure your head stays over the base at all times through the shot.',
      ],
      poor: [
        'Significant balance issues detected. Without a stable base, shot selection and consistency will always be compromised.',
        'Balance is the foundation of everything. Without it, you\'re guessing at the crease. Footwork and core drills are essential.',
      ],
    },

    weightTransfer: {
      elite: [
        'Weight transfer is fluid and powerful — full commitment forward on drives, all the way back on pulls. Textbook.',
        'Elite weight shift detected. You move your mass decisively into each shot type — this is what generates effortless power.',
      ],
      good: [
        'Good weight transfer overall. Fine-tune by making your commitment earlier — the decision to go forward or back should happen at the bowler\'s crease.',
        'Solid weight movement. To improve, focus on being on your toes during the bowler\'s delivery stride, ready to explode.',
      ],
      fair: [
        'Incomplete weight transfer detected. You\'re not fully committing to the shot — half-forward is the most dangerous position in batting.',
        'Inconsistent weight shift — sometimes forward, sometimes back on the same delivery type. This leads to mis-hits and edges.',
      ],
      poor: [
        'Almost no weight transfer detected. Static footwork leads to poor shot selection and easy dismissals.',
        'The body is not moving into or away from the ball. All batting power comes from footwork. This is the root cause of most technical issues.',
      ],
    },
  },

  bowling: {
    elbowExtension: {
      legal: [
        'Action is FULLY LEGAL under ICC regulations. Elbow extension is well within the 15° tolerance. No concerns whatsoever.',
        'ICC-compliant action detected. Your elbow extension is clean — you can bowl with confidence in any level of cricket.',
      ],
      borderline: [
        'Estimated elbow extension is approaching the 15° ICC limit. We recommend a specialist coach review before a formal assessment.',
        'Action is in the caution zone based on this clip. While not necessarily illegal, this level of extension will attract scrutiny at higher levels — corrective technique work is advised.',
      ],
      illegal: [
        'Estimated elbow extension exceeds the ICC 15° threshold for this clip. This is a 2D estimate, not an official ruling — have a specialist bowling coach review your action.',
        'This clip suggests elbow extension above the ICC guideline. Treat this as a prompt to get a coach\'s opinion and, if needed, a formal biomechanical assessment — not as a final verdict.',
      ],
    },

    hipShoulderSeparation: {
      elite: [
        'Outstanding hip-shoulder separation — this is a major source of your bowling pace and movement. Elite fast bowlers typically show 40-50° of separation.',
        'Excellent coil position. Maximum HSS means you\'re generating pace from the body, not just the arm — the most sustainable and effective method.',
      ],
      good: [
        'Good hip-shoulder separation. Increasing this by another 5-8° through core rotation drills would unlock more pace without added stress.',
        'Solid coil. To maximise HSS, focus on leading strongly with the non-bowling hip through the delivery stride.',
      ],
      fair: [
        'Below-average hip-shoulder separation — you\'re losing pace by bowling with your shoulders, not your whole body.',
        'Insufficient coil detected. This forces you to compensate with a longer arm swing, which increases injury risk. Core rotation is key.',
      ],
      poor: [
        'Minimal hip-shoulder separation. You\'re essentially throwing with only your arm — this limits pace and significantly increases injury risk.',
        'Critical: near-zero body coil detected. This is a major technical fault. Both pace and injury risk are severely affected.',
      ],
    },

    runUpConsistency: {
      elite: [
        'Run-up consistency is excellent — your approach is metronomically regular. This means a repeatable action and consistent release point.',
        'Approach pattern is elite-level. A consistent run-up is the prerequisite for a consistent action. You\'ve nailed this.',
      ],
      good: [
        'Good run-up consistency. Minor rhythm variations detected in mid-run. Focus on maintaining even stride length throughout.',
        'Solid approach rhythm. Small improvements in the last three strides before the crease would make your action even more repeatable.',
      ],
      fair: [
        'Run-up inconsistency detected. Variation in stride pattern before the crease leads to a different delivery position every ball.',
        'The approach has irregular rhythm. This makes it hard to bowl the same action twice. Practise your run-up marker discipline.',
      ],
      poor: [
        'Very inconsistent run-up detected. This is the root cause of many bowling problems — no consistent delivery position is possible.',
        'Run-up is erratic. Start with a fixed marker system and build a repeatable 10-stride approach before working on action mechanics.',
      ],
    },

    frontKneeAngle: {
      elite: [
        'Front knee brace is excellent — a stiff front leg is the piston that transfers run-up energy into the ball. Elite technique.',
        'Outstanding front leg drive. Near-straight front knee at delivery is the hallmark of pace bowlers who take wickets at every level.',
      ],
      good: [
        'Good front knee extension. Stiffening the brace by another 10-15° through targeted gym work would increase pace significantly.',
        'Solid front leg. Focus on "stamping down" on the crease rather than collapsing the knee — think of driving the heel into the ground.',
      ],
      fair: [
        'Front knee is collapsing through delivery — you\'re losing energy that should go into the ball. This is a common fault that\'s very fixable.',
        'Insufficient front knee brace detected. Flex training and deliberate practice of a stiffer front leg will unlock more pace.',
      ],
      poor: [
        'Front knee collapsing significantly at delivery. This dramatically reduces ball speed and puts stress on the lower back.',
        'Critical front-leg issue: the knee is buckling, dissipating energy before it reaches the ball. Must be corrected for both performance and injury prevention.',
      ],
    },

    followThroughLine: {
      elite: [
        'Follow-through is perfectly on the delivery line — straight down the pitch. Shows full commitment and excellent finishing mechanics.',
        'Outstanding finish. Your body follows the ball down the pitch — this is the sign of a bowler fully using momentum to generate pace.',
      ],
      good: [
        'Good follow-through with minor deviation at the end. Focus on keeping the bowling shoulder pointing down the pitch as you finish.',
        'Solid follow-through. To improve further, make sure your chest faces the batsman before you pull out of the action.',
      ],
      fair: [
        'Follow-through deviates off-line. This causes erratic line and length — your body isn\'t completing the delivery direction.',
        'Inconsistent follow-through path detected. This suggests the body is "bailing out" mid-delivery, which affects both accuracy and pace.',
      ],
      poor: [
        'Follow-through is severely off-line. This is causing serious inconsistency in line and length and may be contributing to back stress.',
        'Critical follow-through fault: the action is not completing down the pitch. This compounds other technical issues and creates injury risk.',
      ],
    },
  },

  fielding: {
    catchingStance: {
      elite: [
        'Catching stance is excellent — hands in the right position, body square and ready. You look like you\'re expecting every ball.',
        'Outstanding catching setup. Hands are below the ball\'s flight path and fingers are pointing correctly. This is how international fielders catch.',
      ],
      good: [
        'Good catching position. Slightly adjust your hand position — for chest-height catches, keep the fingers pointing up with thumbs together.',
        'Solid stance. To improve, focus on watching the ball into your hands rather than looking at the fielder who hit it.',
      ],
      fair: [
        'Catching stance needs adjustment. Hands are not in the optimal position for the catch you\'re attempting.',
        'Stance is slightly off — this is causing you to snatch at the ball rather than catch it softly. Relax the hands and let the ball come to you.',
      ],
      poor: [
        'Catching mechanics need significant work. This position makes a clean take very difficult — full retraining of the catching stance is recommended.',
        'Critical catching technique issue. Incorrect hand position is the number-one cause of dropped catches. Start with stationary catch drills to rebuild.',
      ],
    },

    throwingMechanics: {
      elite: [
        'Throwing mechanics are excellent — strong arm path, shoulder alignment, and a complete follow-through. This is direct-hit territory.',
        'Outstanding throw mechanics. Your shoulder, elbow, and wrist are sequencing perfectly for maximum velocity and accuracy.',
      ],
      good: [
        'Good throw mechanics with minor areas to improve. Focus on a higher elbow at release to improve carry and accuracy.',
        'Solid arm action. To add more pace, ensure the non-throwing arm pulls down sharply through the throw — this rotates the core more powerfully.',
      ],
      fair: [
        'Throwing mechanics need work. The arm path is inconsistent, leading to variable accuracy on long throws.',
        'Throw mechanics show some fundamental issues. Building a consistent, high arm path through the ball will improve both speed and accuracy dramatically.',
      ],
      poor: [
        'Throwing mechanics need significant corrective work. Current mechanics are limiting both distance and accuracy and may pose injury risk.',
        'Critical throwing fault detected. This level of mechanics will make it very hard to perform in the field under match pressure.',
      ],
    },
  },

  keeping: {
    crouchDepth: {
      elite: [
        'Outstanding crouch depth — you\'re perfectly positioned to take any delivery. Elite keepers adjust depth by bowling type; you\'re nailing this.',
        'Crouch is textbook. Low centre of gravity means you can move laterally and vertically without compromising your take.',
      ],
      good: [
        'Good crouch with room to go slightly lower. Lower hips = better range, especially for deliveries that stay low.',
        'Solid keeping crouch. For pace bowling, consider deepening the crouch another 5-10cm to improve low-ball takes.',
      ],
      fair: [
        'Crouch is a touch too high — this limits your ability to take deliveries that stay low without diving forward.',
        'Not quite low enough. A higher crouch creates a "catching down" motion for low balls, which leads to drops.',
      ],
      poor: [
        'Significantly upright position detected. This will cause you problems with any delivery below knee height.',
        'Critical: keeping stance is too upright. This is the most common fault in junior keepers. Rebuild from the ground up with a deep squat position.',
      ],
    },

    glovePosition: {
      elite: [
        'Glove position is perfect — hands in front of the body, relaxed, ready to move in any direction. This is how Test keepers set up.',
        'Outstanding glove setup. Pre-take position is exactly right — you can adjust to any line without compromising the take.',
      ],
      good: [
        'Good glove position. Minor tweak: keep the hands just slightly more in front of the eyes so the ball comes to the gloves rather than the gloves going to the ball.',
        'Solid take position. Slightly relax the tension in the hands — softer hands absorb the ball better and reduce the chance of spilling a take.',
      ],
      fair: [
        'Gloves are slightly behind the optimal position. This forces reactive movement rather than anticipatory positioning.',
        'Glove setup needs adjustment. Your hands are slightly too wide or too high — this will cause problems when the ball deviates off the pitch.',
      ],
      poor: [
        'Glove position is significantly off — this is making every take harder than it needs to be.',
        'Critical keeping fault: glove position does not allow efficient movement to either side or up/down. Full technique review needed.',
      ],
    },
  },
};

// ── Drill Linkage Map ─────────────────────────────────────────────
// Maps metric deficiencies to existing SmartCrick drill IDs
var DRILL_LINKAGE = {
  headStability:          { label: 'Head Still Drill', category: 'batting' },
  batLiftAngle:           { label: 'Backswing & Bat Lift Drill', category: 'batting' },
  hipRotation:            { label: 'Hip Drive Power Drill', category: 'batting' },
  followThrough:          { label: 'Full Follow-Through Drill', category: 'batting' },
  balance:                { label: 'Balance & Stability Drill', category: 'batting' },
  weightTransfer:         { label: 'Weight Transfer Footwork', category: 'batting' },
  shoulderAlignment:      { label: 'Stance Setup Drill', category: 'batting' },
  frontElbowAngle:        { label: 'High Elbow Drive Drill', category: 'batting' },
  runUpConsistency:       { label: 'Run-Up Marker Drill', category: 'bowling' },
  elbowExtension:         { label: 'Legal Action Remediation', category: 'bowling' },
  hipShoulderSeparation:  { label: 'Core Coil & Separation Drill', category: 'bowling' },
  frontKneeAngle:         { label: 'Front Leg Brace Drill', category: 'bowling' },
  followThroughLine:      { label: 'Delivery Line Follow-Through', category: 'bowling' },
  catchingStance:         { label: 'Soft Hands Catch Drill', category: 'fielding' },
  groundFieldingPosition: { label: 'Ground Fielding Basics', category: 'fielding' },
  throwingMechanics:      { label: 'Throw Mechanics Clinic', category: 'fielding' },
  crouchDepth:            { label: 'Keeping Stance Rebuild', category: 'keeping' },
  glovePosition:          { label: 'Glove Positioning Drill', category: 'keeping' },
};

// ── Pace Category Thresholds ──────────────────────────────────────
var PACE_CATEGORIES = [
  { label: 'Fast',        min: 85, max: 200, color: '#ef4444' },
  { label: 'Medium-Fast', min: 75, max: 85,  color: '#f59e0b' },
  { label: 'Medium',      min: 65, max: 75,  color: '#22c55e' },
  { label: 'Medium-Slow', min: 55, max: 65,  color: '#3b82f6' },
  { label: 'Slow',        min: 0,  max: 55,  color: '#8b5cf6' },
];

// ── Skeleton Drawing Connections ──────────────────────────────────
// Pairs of landmark indices to draw as bones
var POSE_CONNECTIONS = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21], [17, 19],
  // Right arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22], [18, 20],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

// Key joints to highlight with angle labels (per mode)
var KEY_JOINTS = {
  batting:  [13, 14, 15, 16, 11, 12, 23, 24, 25, 26], // elbows, shoulders, hips, knees
  bowling:  [11, 12, 13, 14, 15, 16, 23, 24, 25, 26],
  fielding: [11, 12, 13, 14, 15, 16, 23, 24],
  keeping:  [27, 28, 25, 26, 23, 24, 15, 16],
};

// ── Score Tier Definitions ────────────────────────────────────────
var SCORE_TIERS = [
  { min: 88, max: 100, label: 'Elite',     color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { min: 72, max: 88,  label: 'Advanced',  color: '#22c55e', bg: 'rgba(34,197,94,0.15)'  },
  { min: 55, max: 72,  label: 'Developing',color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { min: 0,  max: 55,  label: 'Beginner',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)'  },
];

function getScoreTier(score) {
  for (var i = 0; i < SCORE_TIERS.length; i++) {
    if (score >= SCORE_TIERS[i].min) return SCORE_TIERS[i];
  }
  return SCORE_TIERS[SCORE_TIERS.length - 1];
}

// Get feedback text for a metric and score
function getFeedback(mode, metric, score) {
  var lib = FEEDBACK_LIBRARY[mode];
  if (!lib || !lib[metric]) return null;
  var bank = lib[metric];
  var tier;
  if (score >= 85) tier = 'elite';
  else if (score >= 68) tier = 'good';
  else if (score >= 48) tier = 'fair';
  else tier = 'poor';
  var items = bank[tier];
  if (!items || !items.length) return null;
  return items[Math.floor(Math.random() * items.length)];
}

// Get elite benchmark range for a metric
function getBenchmark(mode, metric) {
  var bm = ELITE_BENCHMARKS[mode];
  if (!bm || !bm[metric]) return null;
  return bm[metric];
}

// Get linked drill recommendations for low-scoring metrics
function getLinkedDrills(lowMetrics) {
  var drills = [];
  lowMetrics.forEach(function(m) {
    if (DRILL_LINKAGE[m]) drills.push(Object.assign({ metric: m }, DRILL_LINKAGE[m]));
  });
  return drills.slice(0, 3);
}

// Classify a batting shot based on hip rotation and elbow angle
function classifyShot(hipRotation, frontElbowAngle, weightForward) {
  var shots = SHOT_SIGNATURES.batting;
  var best = null, bestScore = Infinity;
  shots.forEach(function(s) {
    var hipMid = (s.hipRotation[0] + s.hipRotation[1]) / 2;
    var elbowMid = (s.frontElbow[0] + s.frontElbow[1]) / 2;
    var dist = Math.abs(hipRotation - hipMid) + Math.abs(frontElbowAngle - elbowMid);
    var weightMatch = (s.weightForward === weightForward) ? 0 : 15;
    if (dist + weightMatch < bestScore) {
      bestScore = dist + weightMatch;
      best = s;
    }
  });
  return best;
}

// Classify a bowling delivery based on wrist angle
function classifyDelivery(wristAngle, deliveryType) {
  var deliveries = SHOT_SIGNATURES.bowling.filter(function(d) {
    return !deliveryType || d.deliveryType === deliveryType;
  });
  var best = null, bestScore = Infinity;
  deliveries.forEach(function(d) {
    if (!d.wristAngle) return;
    var mid = (d.wristAngle[0] + d.wristAngle[1]) / 2;
    var dist = Math.abs(wristAngle - mid);
    if (dist < bestScore) { bestScore = dist; best = d; }
  });
  return best;
}

// Export to SC_APP
Object.assign(A, {
  VD: {
    ELITE_BENCHMARKS: ELITE_BENCHMARKS,
    SHOT_SIGNATURES: SHOT_SIGNATURES,
    FEEDBACK_LIBRARY: FEEDBACK_LIBRARY,
    DRILL_LINKAGE: DRILL_LINKAGE,
    PACE_CATEGORIES: PACE_CATEGORIES,
    POSE_CONNECTIONS: POSE_CONNECTIONS,
    KEY_JOINTS: KEY_JOINTS,
    SCORE_TIERS: SCORE_TIERS,
    getScoreTier: getScoreTier,
    getFeedback: getFeedback,
    getBenchmark: getBenchmark,
    getLinkedDrills: getLinkedDrills,
    classifyShot: classifyShot,
    classifyDelivery: classifyDelivery,
  },
});

console.log('[SC] app-video-data ready — ProVision™ Data Layer v1.0');
})();
