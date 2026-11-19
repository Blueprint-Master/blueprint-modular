"""Deliver business events to operator-configured HTTPS integrations."""
import argparse
from hashlib import sha256
import hmac
from http.client import HTTPSConnection, HTTPException
import json
import os
import re
import sqlite3
from ._module_store import connect, transaction
import sys
import time
from urllib.parse import urlsplit
import uuid

BACKOFF = (60, 300, 1800, 7200, 43200)
SCHEMA = """
CREATE TABLE IF NOT EXISTS hook(
 name TEXT PRIMARY KEY, event TEXT NOT NULL, paused INTEGER NOT NULL DEFAULT 0,
 deleted INTEGER NOT NULL DEFAULT 0, failures INTEGER NOT NULL DEFAULT 0, failed_since INTEGER
);
CREATE TABLE IF NOT EXISTS publication(
 id TEXT PRIMARY KEY, event TEXT NOT NULL, body BLOB NOT NULL
);
CREATE TABLE IF NOT EXISTS dispatch(
 hook TEXT NOT NULL REFERENCES hook(name), event_id TEXT NOT NULL REFERENCES publication(id),
 due INTEGER NOT NULL, status TEXT NOT NULL DEFAULT 'pending', lease TEXT, until_at INTEGER,
 PRIMARY KEY(hook,event_id)
);
CREATE INDEX IF NOT EXISTS dispatch_due ON dispatch(status,due);
CREATE TABLE IF NOT EXISTS attempt(
 id TEXT PRIMARY KEY, hook TEXT NOT NULL, event_id TEXT NOT NULL, started INTEGER NOT NULL,
 outcome TEXT NOT NULL DEFAULT 'sending', http_code INTEGER, elapsed_ms INTEGER
);
CREATE INDEX IF NOT EXISTS attempt_by_hook ON attempt(hook,started);
CREATE TABLE IF NOT EXISTS hook_alert(
 hook TEXT NOT NULL, at INTEGER NOT NULL, reason TEXT NOT NULL
);
"""


def open_store(path):
    return connect(path, SCHEMA)


def subscribe(db, name, event):
    if not re.fullmatch(r"[A-Z][A-Z0-9_]{0,47}", name):
        raise ValueError("invalid configured integration name")
    if not re.fullmatch(r"[a-z][a-z0-9_.-]{0,79}", event):
        raise ValueError("invalid event name")
    db.execute("INSERT INTO hook(name,event) VALUES(?,?)", (name, event))


def publish(db, event_id, event, data, now):
    """Use inside the producer's transaction if business data shares this SQLite database."""
    if not db.in_transaction:
        raise ValueError("publish requires a transaction")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}", event_id):
        raise ValueError("invalid event id")
    if not re.fullmatch(r"[a-z][a-z0-9_.-]{0,79}", event) or not isinstance(data, dict):
        raise ValueError("invalid business event")
    body = json.dumps({"id": event_id, "type": event, "data": data}, separators=(",", ":"), sort_keys=True,
                      allow_nan=False, ensure_ascii=False).encode()
    if len(body) > 256 * 1024:
        raise ValueError("event exceeds 256 KiB")
    existing = db.execute("SELECT body FROM publication WHERE id=?", (event_id,)).fetchone()
    if existing:
        if existing["body"] != body:
            raise ValueError("event id already used for another payload")
        return
    db.execute("INSERT INTO publication(id,event,body) VALUES(?,?,?)", (event_id, event, body))
    db.execute("""INSERT INTO dispatch(hook,event_id,due)
                  SELECT name,?,? FROM hook WHERE event=? AND deleted=0""", (event_id, now, event))


def change(db, name, action):
    with transaction(db):
        if action == "resume":
            changed = db.execute("UPDATE hook SET paused=0,failures=0,failed_since=NULL WHERE name=? AND deleted=0", (name,))
        elif action in ("pause", "delete"):
            changed = db.execute("UPDATE hook SET paused=1,deleted=? WHERE name=? AND deleted=0", (int(action == "delete"), name))
            if action == "delete":
                db.execute("UPDATE dispatch SET status='cancelled' WHERE hook=? AND status='pending'", (name,))
        else:
            raise ValueError("invalid action")
        if not changed.rowcount:
            raise ValueError("unknown integration")


def digest(secret, timestamp, body):
    return hmac.new(secret, str(timestamp).encode("ascii") + b"." + body, sha256).hexdigest()


def verify(secrets, timestamp, body, signature, now):
    if not isinstance(timestamp, str) or not re.fullmatch(r"[0-9]{1,12}", timestamp):
        return False
    if abs(now - int(timestamp)) > 300 or not isinstance(signature, str) or not re.fullmatch(r"[a-f0-9]{64}", signature):
        return False
    return any(secret and hmac.compare_digest(digest(secret, timestamp, body), signature) for secret in secrets)


def https_send(name, event_id, body, timestamp, context=None):
    prefix = "BPM_HOOK_" + name
    url = urlsplit(os.environ[prefix + "_URL"])
    secret = os.environ[prefix + "_SECRET"].encode()
    if url.scheme != "https" or not url.hostname or url.username or url.password or url.fragment or len(secret) < 32:
        raise ValueError("invalid integration configuration")
    connection = HTTPSConnection(url.hostname, url.port or 443, timeout=10, context=context)
    target = url.path or "/"
    if url.query:
        target += "?" + url.query
    try:
        connection.request("POST", target, body=body, headers={
            "Content-Type": "application/json", "X-Webhook-Timestamp": str(timestamp),
            "X-Webhook-Signature": digest(secret, timestamp, body), "Idempotency-Key": event_id,
        })
        return connection.getresponse().status
    finally:
        connection.close()


def tick(db, send=https_send, now=None, limit=100):
    clock = (lambda: int(time.time())) if now is None else (lambda: now)
    for _ in range(limit):
        with transaction(db):
            at = clock()
            overdue = db.execute("SELECT name FROM hook WHERE paused=0 AND failed_since<=?", (at - 72 * 3600,)).fetchall()
            for hook_row in overdue:
                db.execute("UPDATE hook SET paused=1 WHERE name=?", (hook_row["name"],))
                db.execute("INSERT INTO hook_alert VALUES(?,?,?)", (hook_row["name"], at, "auto_paused"))
            expired = db.execute("SELECT lease FROM dispatch WHERE status='sending' AND until_at<=?", (at,)).fetchall()
            for old in expired:
                db.execute("UPDATE attempt SET outcome='interrupted' WHERE id=?", (old["lease"],))
            db.execute("""UPDATE dispatch SET status=CASE WHEN hook IN (SELECT name FROM hook WHERE deleted=1)
                          THEN 'cancelled' ELSE 'pending' END, lease=NULL WHERE status='sending' AND until_at<=?""", (at,))
            row = db.execute("""SELECT d.hook,d.event_id,p.body FROM dispatch d JOIN hook h ON h.name=d.hook
                JOIN publication p ON p.id=d.event_id WHERE d.status='pending' AND d.due<=? AND h.paused=0
                AND NOT EXISTS (SELECT 1 FROM dispatch busy WHERE busy.hook=d.hook AND busy.status='sending')
                ORDER BY d.due,d.rowid LIMIT 1""", (at,)).fetchone()
            if not row:
                return
            hook, event_id, body = row
            lease = uuid.uuid4().hex
            db.execute("UPDATE dispatch SET status='sending',lease=?,until_at=? WHERE hook=? AND event_id=?",
                       (lease, at + 120, hook, event_id))
            db.execute("INSERT INTO attempt(id,hook,event_id,started) VALUES(?,?,?,?)", (lease, hook, event_id, at))
        started = time.monotonic()
        status = None
        try:
            status = send(hook, event_id, body, at)
            result = "accepted" if 200 <= status < 300 else "http_error"
        except (ValueError, KeyError):
            result = "configuration_error"
        except (HTTPException, OSError):
            result = "transport_error"
        elapsed = round((time.monotonic() - started) * 1000)
        with transaction(db):
            current = db.execute("SELECT d.lease,h.failures,h.failed_since,h.deleted FROM dispatch d "
                                 "JOIN hook h ON h.name=d.hook WHERE d.hook=? AND d.event_id=?", (hook, event_id)).fetchone()
            if current["lease"] != lease:
                continue
            at = clock()
            db.execute("UPDATE attempt SET outcome=?,http_code=?,elapsed_ms=? WHERE id=?", (result, status, elapsed, lease))
            if result == "accepted":
                db.execute("UPDATE hook SET failures=0,failed_since=NULL WHERE name=?", (hook,))
                delivery_state, due = "sent", at
            else:
                failures = current["failures"] + 1
                since = at if current["failed_since"] is None else current["failed_since"]
                pause = at - since >= 72 * 3600
                db.execute("UPDATE hook SET failures=?,failed_since=?,paused=CASE WHEN ? THEN 1 ELSE paused END WHERE name=?",
                           (failures, since, pause, hook))
                count = db.execute("SELECT COUNT(*) FROM attempt WHERE hook=? AND event_id=?", (hook, event_id)).fetchone()[0]
                delivery_state = "cancelled" if current["deleted"] else "pending"
                due = at + BACKOFF[min(count - 1, len(BACKOFF) - 1)]
                if failures == 5 or pause:
                    db.execute("INSERT INTO hook_alert VALUES(?,?,?)", (hook, at, "auto_paused" if pause else "five_failures"))
            db.execute("UPDATE dispatch SET status=?,due=?,lease=NULL,until_at=NULL WHERE hook=? AND event_id=?",
                       (delivery_state, due, hook, event_id))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True)
    commands = parser.add_subparsers(dest="action", required=True)
    register = commands.add_parser("subscribe")
    register.add_argument("name")
    register.add_argument("event")
    for action in ("pause", "resume", "delete"):
        commands.add_parser(action).add_argument("name")
    event = commands.add_parser("publish", help="read a JSON business object from standard input")
    event.add_argument("event_id")
    event.add_argument("event")
    for action in ("tick", "history", "alerts", "list"):
        commands.add_parser(action)
    args = parser.parse_args(argv)
    db = open_store(args.db)
    try:
        if args.action == "subscribe":
            subscribe(db, args.name, args.event)
        elif args.action == "publish":
            with transaction(db):
                publish(db, args.event_id, args.event, json.load(sys.stdin), int(time.time()))
        elif args.action == "tick":
            tick(db)
        elif args.action in ("pause", "resume", "delete"):
            change(db, args.name, args.action)
        else:
            sql = {"history": "SELECT * FROM attempt ORDER BY started DESC,rowid DESC",
                   "alerts": "SELECT * FROM hook_alert ORDER BY at DESC,rowid DESC",
                   "list": "SELECT * FROM hook WHERE deleted=0 ORDER BY name"}[args.action]
            for row in db.execute(sql):
                print(json.dumps(dict(row)))
    finally:
        db.close()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, sqlite3.Error) as error:
        sys.exit(str(error))
