#!/usr/bin/env python3
"""
app-root-patch.py
=================
Surgical patch for app-root.js.  Run from your project root:

    python3 app-root-patch.py

Creates app-root.js.bak before modifying.

Changes applied
---------------
1.  Title / branding: "SmartCrick AI" → "SmartCrick" everywhere in root
2.  pageMap: remove AICoach entry, add CricketDNA → A.CricketDNAPage
3.  Bottom nav: replace AICoach tab with CricketDNA tab
4.  AppShell mount: add A.initDailyChallenge() and A.CricketDNAPage init guard
5.  sc_open_reward_modal listener added to AppShell (for home-page re-open)
"""

import re, shutil, sys, os

TARGET = "app-root.js"

if not os.path.exists(TARGET):
    print(f"ERROR: {TARGET} not found in current directory.")
    sys.exit(1)

shutil.copy(TARGET, TARGET + ".bak")
print(f"Backed up to {TARGET}.bak")

with open(TARGET, "r", encoding="utf-8") as f:
    src = f.read()

original = src  # keep for diff summary
changes = []

# ── 1. Branding: remove "AI" from display strings ─────────────────
patterns_branding = [
    # Loading splash text
    (r"'SmartCrick AI'",             "'SmartCrick'"),
    (r'"SmartCrick AI"',             '"SmartCrick"'),
    # Any remaining AI coach references in strings
    (r"'SmartCrick AI Member'",      "'SmartCrick Member'"),
    (r'"SmartCrick AI Member"',      '"SmartCrick Member"'),
]
for old, new in patterns_branding:
    if old in src:
        src = src.replace(old, new)
        changes.append(f"Branding: {old!r} → {new!r}")

# ── 2. pageMap — remove AICoach, add CricketDNA ───────────────────
# Pattern A: explicit AICoach: AICoachPage line
ai_coach_line_re = re.compile(
    r"[ \t]+AICoach\s*:\s*[A-Za-z_.]+\s*(?:,\s*//[^\n]*)?\n", re.MULTILINE
)
if ai_coach_line_re.search(src):
    src = ai_coach_line_re.sub("", src)
    changes.append("pageMap: removed AICoach entry")

# Pattern B: AICoach inside an object literal (fallback)
ai_coach_obj_re = re.compile(
    r",?\s*AICoach\s*:\s*[A-Za-z_.]+\s*(?=,|\})", re.MULTILINE
)
if ai_coach_obj_re.search(src):
    src = ai_coach_obj_re.sub("", src)
    changes.append("pageMap: removed AICoach (object form)")

# Add CricketDNA to pageMap — insert after the last known page entry
# Strategy: find "Progress : " or "Badges :" line and append after it
insert_dna_re = re.compile(
    r"((?:Progress|Badges|Schedule)\s*:\s*[A-Za-z_A-Z0-9.]+\s*,)", re.MULTILINE
)
dna_entry = "\n      CricketDNA: A.CricketDNAPage || (function(){return null;}),"
if "CricketDNA" not in src:
    m = insert_dna_re.search(src)
    if m:
        src = src[:m.end()] + dna_entry + src[m.end():]
        changes.append("pageMap: added CricketDNA entry")
    else:
        changes.append("WARN: could not locate pageMap insert point for CricketDNA — add manually")

# ── 3. Bottom nav — replace AICoach tab with CricketDNA ───────────
# The nav items are typically defined as an array of objects
# Find patterns like { page:'AICoach', ... } or { label:'AI Coach', ... }
ai_coach_nav_re = re.compile(
    r"\{[^}]*(?:page\s*:\s*['\"]AICoach['\"]|label\s*:\s*['\"]AI Coach['\"])[^}]*\}",
    re.DOTALL
)
cricket_dna_nav = "{ page: 'CricketDNA', label: 'DNA', icon: '🧬', emoji: '🧬' }"
if ai_coach_nav_re.search(src):
    src = ai_coach_nav_re.sub(cricket_dna_nav, src)
    changes.append("Bottom nav: replaced AICoach tab with CricketDNA tab")
else:
    changes.append("WARN: AICoach nav tab not found in expected format — check manually")

# ── 4. AppShell mount — add initDailyChallenge and CricketDNA guard ──
# Find the useEffect where initDailyReward is called
# and insert initDailyChallenge call after it
init_reward_re = re.compile(
    r"(A\.initDailyReward\s*&&\s*A\.initDailyReward\([^)]*\)\s*;)"
)
daily_challenge_init = (
    "\n        if (A.initDailyChallenge) A.initDailyChallenge();"
)
if "initDailyChallenge" not in src:
    m = init_reward_re.search(src)
    if m:
        src = src[:m.end()] + daily_challenge_init + src[m.end():]
        changes.append("AppShell: added A.initDailyChallenge() call after initDailyReward")
    else:
        # Fallback: find onboardDone guard
        onboard_re = re.compile(r"(if\s*\(\s*!\s*user\.onboardDone\s*\)\s*return\s*;)")
        m2 = onboard_re.search(src)
        if m2:
            src = (src[:m2.end()]
                   + "\n        if (A.initDailyChallenge) A.initDailyChallenge();"
                   + src[m2.end():])
            changes.append("AppShell: added A.initDailyChallenge() after onboard guard")
        else:
            changes.append("WARN: could not find initDailyChallenge insert point — add manually")

# ── 5. sc_open_reward_modal event listener in AppShell ────────────
# AppShell needs to re-open the DailyRewardModal when home page fires the event
reward_modal_listener = """
      // Re-open reward modal when home page fires sc_open_reward_modal
      var onOpenReward = function() {
        if (A.getRewardState) {
          var st = A.getRewardState();
          var td = new Date().toISOString().slice(0,10);
          if (st.lastClaimed === td && st.weekDay) setShowDailyReward(true);
        }
      };
      window.addEventListener('sc_open_reward_modal', onOpenReward);"""

# Append to the existing daily reward useEffect cleanup
daily_reward_cleanup_re = re.compile(
    r"(window\.removeEventListener\(['\"]sc_update['\"])",
    re.MULTILINE
)
if "sc_open_reward_modal" not in src:
    m = daily_reward_cleanup_re.search(src)
    if m:
        # Insert before the first removeEventListener in the DailyReward effect
        insert_pos = src.rfind("window.addEventListener('sc_update'", 0, m.start())
        if insert_pos == -1:
            insert_pos = src.rfind('window.addEventListener("sc_update"', 0, m.start())
        if insert_pos > 0:
            # Find end of that line
            eol = src.index("\n", insert_pos)
            src = src[:eol] + reward_modal_listener + src[eol:]
            # Add removeEventListener in cleanup
            cleanup_insert = (
                "\n      window.removeEventListener('sc_open_reward_modal', onOpenReward);"
            )
            src = src.replace(
                "window.removeEventListener('sc_update'",
                "window.removeEventListener('sc_open_reward_modal', onOpenReward);\n      window.removeEventListener('sc_update'",
                1
            )
            changes.append("AppShell: added sc_open_reward_modal event listener")
        else:
            changes.append("WARN: could not wire sc_open_reward_modal — add manually")
    else:
        changes.append("WARN: could not find sc_update cleanup in AppShell")

# ── 6. Remove AICoachPage import / stub usage ─────────────────────
# If there is a stub or direct reference: AICoachPage = ...
ai_coach_page_re = re.compile(
    r"var\s+AICoachPage\s*=\s*[^;]+;\s*\n?", re.MULTILINE
)
if ai_coach_page_re.search(src):
    src = ai_coach_page_re.sub("", src)
    changes.append("Removed AICoachPage variable assignment")

# ── Write patched file ─────────────────────────────────────────────
with open(TARGET, "w", encoding="utf-8") as f:
    f.write(src)

print(f"\nPatched {TARGET} successfully.")
print(f"Changes applied ({len(changes)}):")
for c in changes:
    print(f"  {'✅' if not c.startswith('WARN') else '⚠️ '} {c}")

if src == original:
    print("\nNOTE: No bytes changed — all patterns may already be applied or need manual review.")
else:
    added = len(src) - len(original)
    print(f"\nFile size delta: {'+' if added>=0 else ''}{added} bytes")
    print("Run: node --input-type=module < app-root.js")
    print("Expected: ReferenceError: React is not defined  (= success)")
