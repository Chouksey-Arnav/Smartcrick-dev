#!/usr/bin/env python3
"""
Build script: merges yuhonas/free-exercise-db + exercemus/exercises into
SmartCrick's exercise schema, dedupes against the native 200, normalizes
category/equipment/muscle/difficulty, and generates cricket-flavoured
coaching content from templates.

Usage:
  python3 scripts/build-exercise-library.py [fedb_dir] [exercemus_dir]

Inputs:
  <fedb_dir>/dist/exercises.json        (clone of yuhonas/free-exercise-db, default ./vendor/free-exercise-db)
  <exercemus_dir>/exercises.json        (clone of exercemus/exercises, default ./vendor/exercises)
  Native exercise names are extracted live from app-exercise-db.js (no separate file needed).

Outputs:
  data/exercise-library.json
  data/extended_youtube_ids.json

To refresh the library when either upstream repo updates:
  git clone --depth 1 https://github.com/yuhonas/free-exercise-db.git vendor/free-exercise-db
  git clone --depth 1 https://github.com/exercemus/exercises.git vendor/exercises
  python3 scripts/build-exercise-library.py
"""
import json, re, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FEDB_DIR = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'vendor', 'free-exercise-db')
EXM_DIR  = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, 'vendor', 'exercises')

FEDB = json.load(open(os.path.join(FEDB_DIR, 'dist', 'exercises.json')))
EXM  = json.load(open(os.path.join(EXM_DIR, 'exercises.json')))['exercises']

# Extract the native exercise names directly from app-exercise-db.js so this
# script always dedupes against whatever is currently shipping.
_src = open(os.path.join(ROOT, 'app-exercise-db.js'), encoding='utf-8').read()
NATIVE = re.findall(r"name:'([^']*)'", _src)

def norm(name):
    n = name.lower()
    n = re.sub(r'[^a-z0-9]+', ' ', n)
    n = re.sub(r'\s+', ' ', n).strip()
    # crude singularize of trailing 's' for common words
    return n

NATIVE_NORM = set(norm(n) for n in NATIVE)

# ─── Mapping tables ────────────────────────────────────────────
MUSCLE_PRIMARY_MAP = {
    'abdominals': 'core', 'abs': 'core', 'obliques': 'core',
    'quadriceps': 'legs', 'quads': 'legs', 'hamstrings': 'legs',
    'calves': 'legs', 'soleus': 'legs', 'adductors': 'legs', 'abductors': 'legs',
    'glutes': 'glutes',
    'chest': 'chest', 'serratus anterior': 'chest',
    'back': 'back', 'lats': 'back', 'middle back': 'back', 'lower back': 'back',
    'traps': 'back', 'neck': 'back',
    'shoulders': 'shoulders',
    'biceps': 'arms', 'triceps': 'arms', 'forearms': 'arms', 'brachialis': 'arms',
}

MUSCLE_DETAIL_RENAME = {
    'abdominals': 'abs', 'quadriceps': 'quads',
}

EQUIPMENT_MAP = {
    'body only': 'none', 'none': 'none',
    'dumbbell': 'dumbbells', 'dumbbells': 'dumbbells',
    'barbell': 'barbell', 'ez curl bar': 'barbell', 'e-z curl bar': 'barbell',
    'bands': 'resistance band', 'resistance band': 'resistance band',
    'kettlebells': 'kettlebell', 'kettlebell': 'kettlebell',
    'cable': 'cable', 'machine': 'machine',
    'pull-up bar': 'pull-up bar',
    'medicine ball': 'medicine ball', 'exercise ball': 'exercise ball',
    'gym mat': 'gym mat', 'foam roll': 'foam roll',
    'bench': 'bench', 'incline bench': 'incline bench',
    'other': 'other',
}

LEVEL_MAP = {'beginner': 'beginner', 'intermediate': 'intermediate', 'expert': 'advanced'}

SETUP = {
    'none':            'Find a clear patch of floor, brace your core, and settle into the starting position with good posture before you move.',
    'dumbbells':       'Pick up the dumbbells with a firm grip, set your feet shoulder-width apart, and brace your core before the first rep.',
    'barbell':         'Load the bar to a manageable weight, set your feet and grip, and brace your core hard before unracking.',
    'cable':           'Set the cable pulley to the right height, take a stable athletic stance, and keep tension on the cable throughout.',
    'machine':         'Adjust the machine seat and pads to fit your body, and keep tension on the weight throughout the movement.',
    'pull-up bar':     'Take a firm overhand or neutral grip on the bar, hang with arms extended, and brace your core before pulling.',
    'dip-bars':        'Grip the bars firmly, support your bodyweight with arms extended, and keep your shoulders down and back.',
    'kettlebell':      'Pick up the kettlebell with a firm grip, hinge at the hips, and brace your core before you start the movement.',
    'resistance band': 'Anchor or step on the band securely, find your stance, and keep tension on the band throughout the movement.',
    'bench':           'Set up on the bench with stable foot placement, grip securely, and brace your core before the first rep.',
    'incline bench':   'Set the bench to the correct angle, plant your feet, and brace your core before the first rep.',
}
SETUP_DEFAULT = 'Get into the starting position on a clear, stable surface, brace your core, and keep good posture throughout.'

BREATHING_DYNAMIC = 'Exhale forcefully through the hardest part of the rep, inhale on the controlled return — never hold your breath.'
BREATHING_HOLD    = 'Breathe slowly and steadily through the nose for the entire hold — do not hold your breath, even when it burns.'

CRICKET_BENEFIT_BY_CATEGORY = {
    'mobility': 'joint mobility and injury resilience for bowling and fielding',
    'cardio':   'match fitness and stamina to stay sharp through a full innings',
}
CRICKET_BENEFIT_BY_MUSCLE = {
    'chest':     'batting power and upper-body drive for big hits',
    'back':      'posterior-chain and pulling strength for bowling speed and fielding throws',
    'shoulders': 'throwing power and shoulder durability for long days in the field',
    'arms':      'grip and arm strength for bat control and faster throws',
    'legs':      'explosive sprinting power between the wickets and stronger drives off the crease',
    'glutes':    'hip drive for sprinting, jumping, and powerful bowling actions',
    'core':      'rotational power and stability for batting shots and bowling control',
}
CRICKET_BENEFIT_DEFAULT = 'all-round athleticism that carries over to every part of your game'

# ─── Step 1: merge fedb + exercemus by normalized name ─────────
fedb_by_norm = {}
for e in FEDB:
    fedb_by_norm[norm(e['name'])] = e

merged = {}
for e in EXM:
    key = norm(e['name'])
    rec = dict(e)
    rec['_source'] = 'exercemus'
    fmatch = fedb_by_norm.get(key)
    if fmatch:
        if not rec.get('images') and fmatch.get('images'):
            rec['images'] = [fmatch['id'] + '/' + img.split('/', 1)[1] if '/' in img else img for img in fmatch['images']]
            rec['_fedb_id'] = fmatch['id']
        if not rec.get('equipment') and fmatch.get('equipment'):
            rec['equipment'] = [fmatch['equipment']]
        rec['_level'] = fmatch.get('level')
        rec['_mechanic'] = fmatch.get('mechanic')
        rec['_force'] = fmatch.get('force')
        del fedb_by_norm[key]
    merged[key] = rec

# remaining fedb-only exercises
for key, e in fedb_by_norm.items():
    rec = {
        'name': e['name'],
        'category': e['category'],
        'equipment': [e['equipment']] if e['equipment'] else [],
        'primary_muscles': e['primaryMuscles'],
        'secondary_muscles': e['secondaryMuscles'],
        'instructions': e['instructions'],
        'images': [e['id'] + '/' + img.split('/', 1)[1] if '/' in img else img for img in e.get('images', [])],
        '_fedb_id': e['id'],
        '_level': e['level'], '_mechanic': e['mechanic'], '_force': e['force'],
        '_source': 'free-exercise-db',
    }
    merged[key] = rec

print(f'Merged pool before dedup against native: {len(merged)}')

# ─── Step 2: drop anything duplicating SmartCrick native exercises ──
for key in list(merged.keys()):
    if key in NATIVE_NORM:
        del merged[key]

print(f'Merged pool after dropping {len(NATIVE_NORM)} native dupes: {len(merged)}')

# ─── Step 3: normalize + enrich ─────────────────────────────────
def primary_coarse(primary_muscles):
    for m in primary_muscles:
        c = MUSCLE_PRIMARY_MAP.get(m)
        if c:
            return c
    return 'core'

def classify_category(primary_c, force, src_category):
    if src_category == 'stretching':
        return 'mobility'
    if src_category in ('cardio', 'plyometrics'):
        return 'cardio'
    if primary_c in ('legs', 'glutes'):
        return 'legs'
    if primary_c == 'core':
        return 'core'
    if primary_c in ('chest', 'shoulders'):
        return 'push'
    if primary_c == 'back':
        return 'pull'
    if primary_c == 'arms':
        return 'pull' if force != 'push' else 'push'
    if force == 'push':
        return 'push'
    if force == 'pull':
        return 'pull'
    return 'core'

def difficulty_for(level, category):
    if level and level in LEVEL_MAP:
        return LEVEL_MAP[level]
    if category == 'mobility':
        return 'beginner'
    return 'intermediate'

def equipment_for(eq_list):
    if not eq_list:
        return 'none'
    raw = eq_list[0]
    return EQUIPMENT_MAP.get(raw, raw or 'none')

def defaults_for(category, mechanic, equipment):
    if category == 'mobility':
        return dict(sets=1, reps=1, duration_secs=30, rest_secs=10)
    if category == 'cardio':
        return dict(sets=3, reps=None, duration_secs=30, rest_secs=30)
    if mechanic == 'compound':
        return dict(sets=4, reps=8, duration_secs=None, rest_secs=60)
    if mechanic == 'isolation':
        if equipment == 'none':
            return dict(sets=3, reps=15, duration_secs=None, rest_secs=30)
        return dict(sets=3, reps=12, duration_secs=None, rest_secs=45)
    return dict(sets=3, reps=12, duration_secs=None, rest_secs=45)

YT_RE = re.compile(r'(?:v=|youtu\.be/)([A-Za-z0-9_-]{11})')
def youtube_id_from(url):
    if not url:
        return None
    m = YT_RE.search(url)
    return m.group(1) if m else None

CDN_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises'

out = []
yt_map = {}
idx = 0
for key, e in sorted(merged.items()):
    idx += 1
    eid = 'lib_%04d' % idx

    primary_muscles = e.get('primary_muscles', [])
    secondary_muscles = e.get('secondary_muscles', [])
    primary_c = primary_coarse(primary_muscles)
    force = e.get('_force')
    mechanic = e.get('_mechanic')
    src_category = e.get('category', 'strength')

    category = classify_category(primary_c, force, src_category)
    difficulty = difficulty_for(e.get('_level'), category)
    equipment = equipment_for(e.get('equipment', []))
    d = defaults_for(category, mechanic, equipment)

    instructions = e.get('instructions') or []
    tip = (instructions[0].strip() if instructions else
           'Focus on slow, controlled reps and proper form throughout.')

    setup = SETUP.get(equipment, SETUP_DEFAULT)
    breathing = BREATHING_HOLD if d['duration_secs'] else BREATHING_DYNAMIC
    cricket_phrase = CRICKET_BENEFIT_BY_CATEGORY.get(category) or CRICKET_BENEFIT_BY_MUSCLE.get(primary_c, CRICKET_BENEFIT_DEFAULT)
    coaching_cue = (
        f"Setup: {setup} Execution: {tip} "
        f"Breathing: {breathing} "
        f"Cricket cue: On the field, this builds {cricket_phrase}."
    )
    cricket_benefit = cricket_phrase[0].upper() + cricket_phrase[1:]

    muscle_secondary = []
    for m in secondary_muscles:
        renamed = MUSCLE_DETAIL_RENAME.get(m, m)
        if renamed not in muscle_secondary:
            muscle_secondary.append(renamed)

    images = []
    fedb_id = e.get('_fedb_id')
    for img in e.get('images', []) or []:
        images.append(f'{CDN_BASE}/{img}')

    yt = youtube_id_from(e.get('video'))
    if yt:
        yt_map[eid] = yt

    rec = {
        'id': eid,
        'name': e['name'],
        'aliases': e.get('aliases', []),
        'sets': d['sets'], 'reps': d['reps'],
        'duration_secs': d['duration_secs'], 'rest_secs': d['rest_secs'],
        'muscle_primary': primary_c,
        'muscle_secondary': muscle_secondary,
        'muscle_detail': [MUSCLE_DETAIL_RENAME.get(m, m) for m in primary_muscles],
        'equipment': equipment,
        'difficulty': difficulty,
        'category': category,
        'mechanic': mechanic,
        'force': force,
        'instructions': instructions,
        'cricket_benefit': cricket_benefit,
        'tip': tip,
        'coaching_cue': coaching_cue,
        'youtube_id': yt,
        'images': images,
        'source': e['_source'],
    }
    if e.get('license'):
        rec['license'] = e['license']
    if e.get('license_author'):
        rec['license_author'] = e['license_author']

    out.append(rec)

OUT_DIR = os.path.join(ROOT, 'data')
os.makedirs(OUT_DIR, exist_ok=True)
json.dump(out, open(os.path.join(OUT_DIR, 'exercise-library.json'), 'w'), indent=1, ensure_ascii=False)
json.dump(yt_map, open(os.path.join(OUT_DIR, 'extended_youtube_ids.json'), 'w'), indent=2, ensure_ascii=False)

print(f'Wrote {len(out)} exercises, {len(yt_map)} youtube ids')

from collections import Counter
print('category:', Counter(r['category'] for r in out))
print('difficulty:', Counter(r['difficulty'] for r in out))
print('equipment:', Counter(r['equipment'] for r in out))
print('muscle_primary:', Counter(r['muscle_primary'] for r in out))
