#!/usr/bin/env python3
"""Convert HTML/CSS/JS in frontend/static from Windows-1252 (CP1252) to UTF-8.

The doc site declares <meta charset="UTF-8"> but many files were saved as CP1252,
so browsers show replacement characters () for accented letters.
This script re-encodes those files to true UTF-8.
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / "frontend" / "static"
SUFFIXES = (".html", ".css", ".js", ".json", ".md")
ENCODING_SOURCE = "cp1252"
ENCODING_TARGET = "utf-8"


def needs_fix(data: bytes) -> bool:
    """True if file is likely CP1252 (invalid UTF-8 or replacement chars when decoded as UTF-8)."""
    try:
        text = data.decode("utf-8")
        return "\ufffd" in text  # replacement character
    except UnicodeDecodeError:
        return True


def main() -> None:
    converted = 0
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file() or path.suffix.lower() not in SUFFIXES:
            continue
        raw = path.read_bytes()
        if not needs_fix(raw):
            continue
        try:
            text = raw.decode(ENCODING_SOURCE)
        except (UnicodeDecodeError, LookupError):
            print(f"Skip (decode failed): {path.relative_to(ROOT)}")
            continue
        path.write_text(text, encoding=ENCODING_TARGET)
        converted += 1
        print(path.relative_to(ROOT))
    print(f"Converted {converted} files to {ENCODING_TARGET}.")


if __name__ == "__main__":
    main()
