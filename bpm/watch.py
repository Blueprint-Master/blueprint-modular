"""Collect configured RSS/Atom feeds, JSON APIs and web pages into a local watch database."""
import argparse
import hashlib
from contextlib import closing
from datetime import datetime, timezone
from decimal import Decimal
from html.parser import HTMLParser
from http.client import HTTPException
import json
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

from ._module_store import connect, transaction


SCHEMA = """
CREATE TABLE IF NOT EXISTS watch_sources (
 name TEXT PRIMARY KEY, kind TEXT NOT NULL, url TEXT NOT NULL, threshold TEXT,
 etag TEXT, modified TEXT, revision INTEGER NOT NULL DEFAULT 0,
 last_check TEXT, last_success TEXT, last_error TEXT, above INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS watch_items (
 source TEXT REFERENCES watch_sources(name), key TEXT, title TEXT NOT NULL,
 url TEXT, collected_at TEXT NOT NULL, PRIMARY KEY(source,key)
);
CREATE TABLE IF NOT EXISTS watch_alerts (
 id INTEGER PRIMARY KEY, source TEXT REFERENCES watch_sources(name),
 value TEXT NOT NULL, time TEXT NOT NULL
);
"""
MAX_BYTES = 2 * 1024 * 1024
KINDS = ("feed", "json", "page")


def open_store(path):
    return connect(path, SCHEMA)


def timestamp():
    return datetime.now(timezone.utc).isoformat()


def digest(content):
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def register(db, name, kind, url, *, threshold=None):
    parsed = urlsplit(url)
    if not name.strip() or kind not in KINDS or parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.username is not None:
        raise ValueError("Expected a source name, type and operator-configured HTTP(S) URL")
    if threshold is not None and (kind != "json" or not Decimal(str(threshold)).is_finite()):
        raise ValueError("A threshold requires a JSON source and a finite number")
    value = None if threshold is None else str(threshold)
    with transaction(db):
        old = db.execute("SELECT kind,url,threshold FROM watch_sources WHERE name=?", (name,)).fetchone()
        if old:
            if tuple(old) != (kind, url, value):
                raise ValueError("This name already identifies a different source")
        else:
            db.execute("INSERT INTO watch_sources(name,kind,url,threshold) VALUES(?,?,?,?)", (name,kind,url,value))


class PageText(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skipped = 0
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "head", "noscript", "template"):
            self.skipped += 1

    def handle_endtag(self, tag):
        if tag in ("script", "style", "head", "noscript", "template"):
            self.skipped = max(0, self.skipped - 1)

    def handle_data(self, text):
        if not self.skipped:
            self.parts.append(text)


def entries(kind, data, url, codec, threshold):
    value = None
    if kind == "feed":
        if b"<!DOCTYPE" in data.replace(b"\x00", b"").upper():
            raise ValueError("Unsupported XML document type")
        root = ET.fromstring(data)
        if root.tag == "rss" and root.find("channel") is not None:
            nodes = root.findall("./channel/item")
        elif root.tag == "{http://www.w3.org/2005/Atom}feed":
            nodes = root.findall("{*}entry")
        else:
            raise ValueError("Expected an RSS or Atom feed")
        items = []
        for node in nodes:
            title = (node.findtext("{*}title") or "").strip()
            link_node = next((child for child in node.findall("{*}link")
                              if child.get("rel", "alternate") == "alternate"), None)
            href = None if link_node is None else link_node.get("href") or link_node.text
            link = urljoin(url, href.strip()) if href and href.strip() else None
            key = node.findtext("{*}guid") or node.findtext("{*}id") or link or title
            if not key:
                raise ValueError("Feed entry has no identifier, link or title")
            items.append((key, title or key, link))
    elif kind == "page":
        parser = PageText()
        parser.feed(data.decode(codec))
        parser.close()
        content = " ".join(" ".join(parser.parts).split())
        if not content:
            raise ValueError("Page has no visible text")
        items = [(digest(content), content[:250], url)]
    else:
        payload = json.loads(data)
        if threshold is not None:
            if not isinstance(payload, dict) or type(payload.get("value")) not in (int, float, str):
                raise ValueError("Expected a JSON object with a numeric value")
            value = Decimal(str(payload["value"]))
            if not value.is_finite():
                raise ValueError("Expected a finite observation")
        records = payload if isinstance(payload, list) else [payload]
        items = []
        for record in records:
            if not isinstance(record, dict):
                raise ValueError("Expected a JSON object or an array of objects")
            content = json.dumps(record, sort_keys=True, ensure_ascii=False, allow_nan=False)
            key = record.get("id")
            title = record.get("title") or content[:250]
            link = record.get("url")
            items.append((digest(content) if key is None else str(key), str(title), urljoin(url, link) if link else None))
    return items, value


def collect(db, name, *, timeout=15):
    """Poll once. Concurrent work is accepted once per observed revision, including failures."""
    current = db.execute("SELECT * FROM watch_sources WHERE name=?", (name,)).fetchone()
    if current is None:
        raise KeyError(name)
    headers = {"User-Agent": "Blueprint-Modular-Watch/1"}
    if current["etag"]:
        headers["If-None-Match"] = current["etag"]
    if current["modified"]:
        headers["If-Modified-Since"] = current["modified"]
    items, value, error = [], None, None
    etag, modified = current["etag"], current["modified"]
    try:
        with urlopen(Request(current["url"], headers=headers), timeout=timeout) as response:
            data = response.read(MAX_BYTES + 1)
            if len(data) > MAX_BYTES:
                raise ValueError("Source exceeds the collection size limit")
            items, value = entries(current["kind"], data, response.geturl(),
                                   response.headers.get_content_charset() or "utf-8", current["threshold"])
            etag, modified = response.headers.get("ETag"), response.headers.get("Last-Modified")
    except HTTPError as exc:
        if exc.code != 304 or not (etag or modified):
            error = f"HTTP {exc.code}"
        exc.close()
    except (URLError, HTTPException, OSError, ValueError, LookupError, ArithmeticError, TypeError, ET.ParseError) as exc:
        error = str(exc)
    now = timestamp()
    added = 0
    with transaction(db):
        changed = db.execute("UPDATE watch_sources SET revision=revision+1,last_check=?,last_error=? WHERE name=? AND revision=?",
                             (now, error, name, current["revision"])).rowcount
        if not changed:
            return {"status": "superseded", "added": 0}
        if error is None:
            for key, title, link in items:
                added += db.execute("INSERT INTO watch_items VALUES(?,?,?,?,?) ON CONFLICT(source,key) DO NOTHING",
                                    (name, key, title, link, now)).rowcount
            above = bool(current["above"])
            if value is not None:
                threshold_reached = value >= Decimal(current["threshold"])
                if threshold_reached and not above:
                    db.execute("INSERT INTO watch_alerts(source,value,time) VALUES(?,?,?)", (name,str(value),now))
                above = threshold_reached
            db.execute("UPDATE watch_sources SET last_success=?,etag=?,modified=?,above=? WHERE name=?",
                       (now,etag,modified,above,name))
    return {"status": "error", "error": error, "added": 0} if error else {"status": "ok", "added": added}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True, help="Database dedicated to this application or tenant")
    commands = parser.add_subparsers(dest="command", required=True)
    add = commands.add_parser("add")
    add.add_argument("name")
    add.add_argument("kind", choices=KINDS)
    add.add_argument("url")
    add.add_argument("--threshold")
    poll = commands.add_parser("poll")
    poll.add_argument("name", nargs="?")
    for name in ("sources", "items", "alerts"):
        commands.add_parser(name)
    args = parser.parse_args()
    with closing(open_store(args.db)) as db:
        if args.command == "add":
            register(db, args.name, args.kind, args.url, threshold=args.threshold)
        elif args.command == "poll":
            names = [args.name] if args.name else [row[0] for row in db.execute("SELECT name FROM watch_sources ORDER BY name")]
            failed = False
            for name in names:
                result = collect(db, name)
                print(json.dumps({"source": name, **result}, ensure_ascii=False))
                failed |= result["status"] == "error"
            return int(failed)
        else:
            tables = {"sources": "watch_sources ORDER BY name", "items": "watch_items ORDER BY collected_at,source,key",
                      "alerts": "watch_alerts ORDER BY id"}
            for row in db.execute("SELECT * FROM " + tables[args.command]):
                print(json.dumps(dict(row), ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
