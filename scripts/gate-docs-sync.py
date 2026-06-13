#!/usr/bin/env python3
"""
gate-docs-sync.py
Checks that derived doc files are in sync with bpm.tsx.

Strategy:
  1. Run the generation scripts (they overwrite the committed files).
  2. Use git to detect if the regenerated output differs from what was committed.
  3. Restore the files with git checkout so the working tree stays clean.
  4. Exit 1 if any file differs.

Exit 0 = in sync.
Exit 1 = out of sync or generation error.

Run from repo root:
  python scripts/gate-docs-sync.py
"""

import sys
import subprocess
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

TRACKED_FILES = [
    "public/llms.txt",
    "lib/generated/bpm-components.json",
    "lib/generated/mcp-registry.json",
]

GENERATORS = [
    [sys.executable, str(REPO_ROOT / "scripts" / "generate-llms-txt.py")],
    [sys.executable, str(REPO_ROOT / "scripts" / "generate-bpm-components-json.py")],
    ["node", str(REPO_ROOT / "scripts" / "generate-mcp-registry.mjs")],
]

LABELS = [
    "generate-llms-txt.py → public/llms.txt",
    "generate-bpm-components-json.py → lib/generated/bpm-components.json",
    "generate-mcp-registry.mjs → lib/generated/mcp-registry.json",
]


def git(args: list[str]) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git"] + args,
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
    )


def normalize_for_diff(content: str) -> str:
    """Neutralise les en-têtes volatils (date llms.txt, horodatage de génération JSON)
    pour éviter les faux positifs de drift."""
    import re
    content = re.sub(r"^# Date\s+:.*$", "# Date    : <normalized>", content, flags=re.MULTILINE)
    content = re.sub(r'"generatedAt"\s*:\s*"[^"]*"', '"generatedAt": "<normalized>"', content)
    return content


def restore_files() -> None:
    """Restore tracked files to committed state."""
    for f in TRACKED_FILES:
        r = git(["checkout", "--", f])
        if r.returncode != 0:
            # File might not exist in git (new file) — ignore
            pass


def main() -> int:
    print("── Doc sync check ──────────────────────────────────")

    # Ensure all tracked files are committed (or exist)
    for f in TRACKED_FILES:
        path = REPO_ROOT / f
        if not path.exists():
            print(f"  [SKIP] {f} does not exist — skipping")

    ok = True

    # Run each generator and check diff
    for generator, label, tracked_file in zip(GENERATORS, LABELS, TRACKED_FILES):
        path = REPO_ROOT / tracked_file
        if not path.exists():
            print(f"  [SKIP] {tracked_file} not in repo — skipping")
            continue

        # Save original
        original = path.read_bytes()

        # Run generator
        result = subprocess.run(
            generator,
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            print(f"  [FAIL] Generator failed: {label}")
            print(result.stdout[-500:] if result.stdout else "")
            print(result.stderr[-500:] if result.stderr else "")
            # Restore
            path.write_bytes(original)
            ok = False
            continue

        # Compare normalized content (strip date header to avoid false positives)
        fresh_text = path.read_text(encoding="utf-8", errors="replace")
        orig_text = original.decode("utf-8", errors="replace")

        fresh_cmp = normalize_for_diff(fresh_text)
        orig_cmp = normalize_for_diff(orig_text)

        if fresh_cmp != orig_cmp:
            import difflib
            diff_lines = list(difflib.unified_diff(
                orig_cmp.splitlines(keepends=True),
                fresh_cmp.splitlines(keepends=True),
                fromfile=f"committed {tracked_file}",
                tofile=f"regenerated {tracked_file}",
                n=2,
            ))
            print(f"  [FAIL] {tracked_file} is OUT OF SYNC ({len(diff_lines)} diff lines)")
            for line in diff_lines[:30]:
                print(f"  {line}", end="")
            if len(diff_lines) > 30:
                print(f"\n  ... ({len(diff_lines) - 30} more lines)")
            ok = False
        else:
            print(f"  [OK] {tracked_file} is in sync")

        # Always restore to keep working tree clean
        path.write_bytes(original)

    print("── Doc sync: " + ("ALL PASS" if ok else "FAIL — run generators and commit") + " ──")
    if not ok:
        print("     python scripts/generate-llms-txt.py")
        print("     python scripts/generate-bpm-components-json.py")
        print("     node scripts/generate-mcp-registry.mjs")

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
