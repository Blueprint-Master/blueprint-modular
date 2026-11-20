#!/usr/bin/env python3
"""Regenerate the linked catalogues, compare their content and restore the input bytes."""

import difflib
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GENERATORS = (
    (sys.executable, "generate-llms-txt.py", ("public/llms.txt", "public/llms-core.txt")),
    (sys.executable, "generate-bpm-components-json.py", ("lib/generated/bpm-components.json",)),
    ("node", "generate-mcp-registry.mjs", ("lib/generated/mcp-registry.json",)),
    ("node", "generate-component-examples.mjs", ("lib/generated/component-examples.json",)),
)


def normalize(content: bytes) -> list[str]:
    text = content.decode("utf-8")
    text = re.sub(r"^# Date\s+:.*$", "# Date    : <normalized>", text, flags=re.MULTILINE)
    text = re.sub(r'"generatedAt"\s*:\s*"[^"]*"', '"generatedAt": "<normalized>"', text)
    return text.splitlines(keepends=True)


def main() -> int:
    originals = {}
    for _, _, outputs in GENERATORS:
        for output in outputs:
            path = REPO_ROOT / output
            if not path.is_file():
                print(f"[FAIL] Missing generated file: {output}")
                return 1
            originals[path] = path.read_bytes()

    ok = True
    try:
        for runtime, script, outputs in GENERATORS:
            subprocess.run([runtime, REPO_ROOT / "scripts" / script], cwd=REPO_ROOT, check=True)
            for output in outputs:
                path = REPO_ROOT / output
                previous, generated = normalize(originals[path]), normalize(path.read_bytes())
                if previous != generated:
                    ok = False
                    print(f"[FAIL] {output} differs after running {script}")
                    diff = difflib.unified_diff(previous, generated, fromfile=output, tofile="regenerated", n=2)
                    print("".join(list(diff)[:30]))
                else:
                    print(f"[OK] {output}")
    finally:
        for path, original in originals.items():
            path.write_bytes(original)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
