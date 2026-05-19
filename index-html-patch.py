#!/usr/bin/env python3
"""
index-html-patch.py
===================
Surgical patch for index.html.  Run from your project root:

    python3 index-html-patch.py

Creates index.html.bak before modifying.

Changes applied
---------------
1. <title>SmartCrick AI</title>  →  <title>SmartCrick</title>
2. Meta description update (if present)
3. Insert <script src="app-cricket-dna.js"></script>  before app-root.js
4. Insert <script src="app-daily-challenge.js"></script>  before app-root.js
   (both go in order: app-cricket-dna  →  app-daily-challenge  →  app-root)
5. Remove any lingering app-ai-coach.js script tag
"""

import shutil, sys, os, re

TARGET = "index.html"

if not os.path.exists(TARGET):
    print(f"ERROR: {TARGET} not found in current directory.")
    sys.exit(1)

shutil.copy(TARGET, TARGET + ".bak")
print(f"Backed up to {TARGET}.bak")

with open(TARGET, "r", encoding="utf-8") as f:
    src = f.read()

original = src
changes = []

# ── 1. Title ──────────────────────────────────────────────────────
for old_title in ["SmartCrick AI", "SmartCrick Ai"]:
    if old_title in src:
        src = src.replace(old_title, "SmartCrick")
        changes.append(f"Title: '{old_title}' → 'SmartCrick'")

# ── 2. Meta description ───────────────────────────────────────────
meta_re = re.compile(
    r'(<meta\s+name=["\']description["\']\s+content=["\'])([^"\']*)(SmartCrick\s+AI)([^"\']*["\'])',
    re.IGNORECASE
)
if meta_re.search(src):
    src = meta_re.sub(lambda m: m.group(1) + m.group(2) + "SmartCrick" + m.group(4), src)
    changes.append("Meta description: removed 'AI' suffix")

# ── 3 & 4. Script tag injection ───────────────────────────────────
# Find the app-root.js script tag (it will be the anchor)
app_root_tag_re = re.compile(
    r'(<script\s[^>]*src=["\'][^"\']*app-root\.js["\'][^>]*>\s*</script>)',
    re.IGNORECASE
)
m = app_root_tag_re.search(src)
if not m:
    print("ERROR: Could not find app-root.js script tag in index.html")
    print("       Add these lines manually just before <script src=\"app-root.js\">:")
    print('         <script src="app-cricket-dna.js"></script>')
    print('         <script src="app-daily-challenge.js"></script>')
    sys.exit(1)

app_root_tag = m.group(1)

# Build the lines to inject (only if not already present)
to_inject = []
for script_name in ["app-cricket-dna.js", "app-daily-challenge.js"]:
    if script_name not in src:
        # Match the quoting style of app-root.js tag
        quote = '"' if 'src="' in app_root_tag else "'"
        to_inject.append(f'    <script src={quote}{script_name}{quote}></script>')
        changes.append(f"Injected: <script src={quote}{script_name}{quote}></script> before app-root.js")
    else:
        changes.append(f"Already present: {script_name} (skipped)")

if to_inject:
    injection_block = "\n".join(to_inject) + "\n    "
    src = src[:m.start()] + injection_block + src[m.start():]

# ── 5. Remove app-ai-coach.js if present ─────────────────────────
ai_coach_script_re = re.compile(
    r'\s*<script\s[^>]*src=["\'][^"\']*app-ai-coach\.js["\'][^>]*>\s*</script>',
    re.IGNORECASE
)
if ai_coach_script_re.search(src):
    src = ai_coach_script_re.sub("", src)
    changes.append("Removed app-ai-coach.js script tag")

# ── Verify correct load order ─────────────────────────────────────
def script_pos(html, name):
    idx = html.find(name)
    return idx if idx != -1 else float("inf")

order_ok = (
    script_pos(src, "app-cricket-dna.js") <
    script_pos(src, "app-daily-challenge.js") <
    script_pos(src, "app-root.js")
)
if order_ok:
    changes.append("Load order verified: cricket-dna → daily-challenge → root ✅")
else:
    changes.append("WARN: Load order may be incorrect — expected: cricket-dna → daily-challenge → root")

# ── Write ─────────────────────────────────────────────────────────
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(src)

print(f"\nPatched {TARGET} successfully.")
print(f"Changes applied ({len(changes)}):")
for c in changes:
    print(f"  {'✅' if not c.startswith('WARN') else '⚠️ '} {c}")

if src == original:
    print("\nNOTE: No bytes changed.")
else:
    print(f"\nFile size delta: {len(src)-len(original):+d} bytes")
