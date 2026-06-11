#!/usr/bin/env python3
"""
Rapport de couverture JSDoc pour les composants bpm.*
Usage: python3 scripts/coverage-report.py
"""
import re
import json
import subprocess
from pathlib import Path

REPO = Path(__file__).parent.parent
COMP_DIR = REPO / "components" / "bpm"
BPM_TSX = REPO / "packages/core/src/bpm.tsx"

ALIAS_MAP = {
    "titleBpm": "Title", "title1": "Title", "title2": "Title",
    "title3": "Title", "title4": "Title",
    "crud": "CrudPage", "selectbox": "Selectbox", "nfcBadge": "NfcBadge",
    "qrCode": "QRCode", "fab": "FAB", "html": "Html", "empty": "Empty",
    "aiQueryBar": "AIQueryBar", "plcConnector": "PLCConnector",
}

def get_barrel_keys():
    src = BPM_TSX.read_text(encoding="utf-8", errors="ignore")
    keys = []
    for m in re.finditer(r"^\s+(\w+):\s*wrap(?:<[^>]+>)?\s*\(", src, re.MULTILINE):
        keys.append(m.group(1))
    for s in ["spinner", "tabs", "title", "chat", "page"]:
        if s not in keys:
            keys.append(s)
    return sorted(set(keys))

def has_jsdoc_before_props(source):
    m = re.search(r"export\s+(?:interface|type)\s+\w+Props\b", source)
    if not m:
        return False
    before = source[:m.start()]
    return bool(re.search(r"/\*\*(.+?)\*/\s*$", before, re.DOTALL))

def main():
    keys = get_barrel_keys()
    done = []
    skipped = []
    missing = []
    
    for key in keys:
        if key in ("chat", "page", "toast"):
            skipped.append(key)
            continue
        stem = ALIAS_MAP.get(key, key[0].upper() + key[1:])
        tsx = COMP_DIR / f"{stem}.tsx"
        if not tsx.exists():
            missing.append(f"{key} (no file {stem}.tsx)")
            continue
        src = tsx.read_text(encoding="utf-8", errors="ignore")
        if has_jsdoc_before_props(src):
            done.append(key)
        else:
            missing.append(key)
    
    total = len(keys)
    print(f"=== Couverture JSDoc ===")
    print(f"Total barrel: {total}")
    print(f"Done (JSDoc ✓): {len(done)}")
    print(f"Skipped (local/special): {len(skipped)}")
    print(f"Missing JSDoc: {len(missing)}")
    print(f"\nCoverage: {len(done)}/{total - len(skipped)} = {100*len(done)//(total - len(skipped))}%")
    if missing:
        print(f"\n=== Missing JSDoc ===")
        for m in missing:
            print(f"  - bpm.{m}")
    
    # Generator verbose check
    print(f"\n=== Generator MIN check ===")
    r = subprocess.run(
        ["python3", "scripts/generate-llms-txt.py", "--verbose"],
        cwd=REPO, capture_output=True, text=True
    )
    mins = [l for l in r.stdout.splitlines() if "[MIN]" in l]
    if mins:
        print(f"[MIN] components: {len(mins)}")
        for m in mins:
            print(f"  {m}")
    else:
        print("All components: [OK] ✓")

if __name__ == "__main__":
    main()
