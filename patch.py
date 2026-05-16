#!/usr/bin/env python3
# =================================================================
# SmartCrick Repo Patch v1.0
# Run from repo root:  python3 patch.py
# =================================================================
import os, shutil, sys, re

def ok(msg):   print("  [OK]", msg)
def warn(msg): print("  [!!]", msg)
def info(msg): print("  [->]", msg)

print("\n=== SmartCrick Repo Patch v1.0 ===\n")

# ── 1: Rename files ──────────────────────────────────────────────
print("1. Fixing file naming...")
if os.path.exists('app_onboarding') and not os.path.exists('app-onboard.js'):
    shutil.copy('app_onboarding', 'app-onboard.js')
    ok("app_onboarding -> app-onboard.js (IMPORTANT: git mv this too)")
elif os.path.exists('app-onboard.js'):
    ok("app-onboard.js present")
else:
    warn("MISSING: copy downloaded app-onboard.js into repo")

if os.path.exists('app_assessment.js') and not os.path.exists('app-assessment.js'):
    shutil.copy('app_assessment.js', 'app-assessment.js')
    ok("app_assessment.js -> app-assessment.js")
elif os.path.exists('app-assessment.js'):
    ok("app-assessment.js present")
else:
    warn("MISSING: copy downloaded app-assessment.js into repo")

# ── 2: Fix app-drills.js ─────────────────────────────────────────
print("\n2. Fixing app-drills.js syntax error...")
if not os.path.exists('app-drills.js'):
    warn("app-drills.js not found"); sys.exit(1)

with open('app-drills.js', 'r', encoding='utf-8') as f:
    drills = f.read()

marker = "DB.addSession({id:'sch_'+Date.now(),date:new Date().toISOString().slice(0,10)"
if marker in drills:
    idx = drills.find(marker)
    lookback = drills[max(0, idx-150):idx]
    if "h('button'" not in lookback:
        # Find the end of this broken section
        end_search = drills.find("'s Schedule'),", idx)
        if end_search != -1:
            end_idx = end_search + len("'s Schedule'),")
            # Extract parts
            db_end = drills.find(');', idx) + 2
            db_call = drills[idx:db_end]
            cls_idx = drills.find("className:", idx)
            style_end = drills.find("cursor:'pointer'}}", cls_idx) + len("cursor:'pointer'}}")
            props = drills[cls_idx:style_end]
            fixed = (
                "h('button',{onClick:function(){\n"
                "        if(DB.addSession){" + db_call + "\n"
                "          window.dispatchEvent(new CustomEvent('sc_update'));\n"
                "          alert('Added to today\\'s schedule! ✅');\n"
                "        }\n"
                "      }," + props + "},'\\ud83d\\udcc5 Add to Today\\'s Schedule'),"
            )
            drills = drills[:idx] + fixed + drills[end_idx:]
            with open('app-drills.js', 'w', encoding='utf-8') as f:
                f.write(drills)
            ok("Syntax error fixed: h('button') wrapper added")
        else:
            warn("Could not find end marker -- check manually")
    else:
        ok("h('button') wrapper already present")
else:
    ok("Broken pattern not found (may already be fixed)")

# ── 3: Fix app-profile.js ────────────────────────────────────────
print("\n3. Fixing app-profile.js double navigation...")
if not os.path.exists('app-profile.js'):
    warn("app-profile.js not found"); sys.exit(1)

with open('app-profile.js', 'r', encoding='utf-8') as f:
    profile = f.read()

orig = profile
# Remove from destructuring
for pat in [', BottomNav, TopBar', ', TopBar, BottomNav', ',BottomNav,TopBar',
            ',TopBar,BottomNav', ', BottomNav', ', TopBar', ',BottomNav', ',TopBar']:
    profile = profile.replace(pat, '')

# Remove h(TopBar,...) and h(BottomNav) render calls
profile = re.sub(r"\s*h\(TopBar,\s*\{[^}]*\}\s*\),", '', profile)
profile = re.sub(r"\s*h\(BottomNav\s*\),", '', profile)

if profile != orig:
    with open('app-profile.js', 'w', encoding='utf-8') as f:
        f.write(profile)
    ok("Removed TopBar + BottomNav direct rendering")
else:
    ok("Already clean (no direct TopBar/BottomNav renders found)")

# ── 4: Update index.html ─────────────────────────────────────────
print("\n4. Updating index.html...")
with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

orig_html = html

if 'manifest.json' not in html:
    html = html.replace('</head>', '  <link rel="manifest" href="/manifest.json">\n  <link rel="apple-touch-icon" href="/icon.svg">\n  </head>')
    ok("Added manifest + apple-touch-icon links")
else:
    ok("manifest.json already linked")

sw_snip = '\n  <script>\n    if (\'serviceWorker\' in navigator) {\n      window.addEventListener(\'load\', function() {\n        navigator.serviceWorker.register(\'/sw.js\')\n          .then(function(r){ console.log(\'[SW] Registered\', r.scope); })\n          .catch(function(e){ console.warn(\'[SW] Failed\', e); });\n      });\n    }\n  </script>\n'

if 'sw.js' not in html:
    html = html.replace('</body>', sw_snip + '</body>')
    ok("Added Service Worker registration")
else:
    ok("Service Worker already registered")

if html != orig_html:
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    ok("index.html saved")

# ── 5: Summary ───────────────────────────────────────────────────
print("\n5. New file checklist:")
needed = ['app-onboard.js','app-assessment.js','app-aicoach.js','sw.js','manifest.json','icon.svg']
all_good = True
for f in needed:
    if os.path.exists(f): ok(f)
    else: warn(f + " -- MISSING: copy from downloaded files"); all_good = False

print("\n=== Git Commands ===")
print("git add -A")
print("git commit -m 'fix: blank screen + PWA offline support'")
print("git push origin main")
if not all_good:
    print("\nWARNING: Some files missing. Copy them before committing.")
print()
