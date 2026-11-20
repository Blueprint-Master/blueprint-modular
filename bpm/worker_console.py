"""Web adapter to an installation's existing worker databases. Never sends over the network."""
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import sys
import time
from zoneinfo import ZoneInfoNotFoundError

from . import scheduled_exports as exports
from . import webhooks
from ._module_store import transaction


def rows(db, query):
    return [dict(row) for row in db.execute(query)]


def snapshot(db, module):
    if module == "webhooks":
        return {
            "items": rows(db, """SELECT h.name AS id,h.event,h.paused,h.failures,
                count(CASE WHEN d.status='pending' THEN 1 END) AS queued,
                count(CASE WHEN d.status='sending' THEN 1 END) AS sending,
                CASE WHEN h.paused=0 THEN min(CASE WHEN d.status='pending' THEN d.due END) END AS due
                FROM hook h LEFT JOIN dispatch d ON d.hook=h.name AND d.status IN ('pending','sending')
                WHERE h.deleted=0 GROUP BY h.name ORDER BY h.name"""),
            "history": rows(db, """SELECT a.id,a.hook,a.event_id,a.started,a.outcome,a.http_code,
                CASE WHEN d.status='pending' AND h.paused=0 AND a.id=(
                  SELECT last.id FROM attempt last WHERE last.hook=a.hook AND last.event_id=a.event_id
                  ORDER BY last.started DESC,last.rowid DESC LIMIT 1) THEN d.due END AS retry
                FROM attempt a JOIN dispatch d ON d.hook=a.hook AND d.event_id=a.event_id
                JOIN hook h ON h.name=a.hook ORDER BY a.started DESC,a.rowid DESC LIMIT 100"""),
        }
    items = rows(db, """SELECT id,report,format,frequency,hour,zone,recipients,due,active
        FROM schedule WHERE deleted=0 ORDER BY due,id""")
    for item in items:
        item["recipients"] = ", ".join(json.loads(item["recipients"]))
    return {"items": items, "history": rows(db, """SELECT r.id AS run_id,s.report,s.format,d.recipient,
        d.status,d.detail,d.updated,d.attempts,CASE WHEN d.status='pending' AND d.attempts>0
        THEN d.retry_at END AS retry FROM delivery d JOIN run r ON r.id=d.run_id
        JOIN schedule s ON s.id=r.schedule_id ORDER BY d.updated DESC,d.rowid DESC LIMIT 100""")}


def command(db, module, data, reports, now):
    action = data["action"]
    if action == "snapshot":
        db.execute("BEGIN")
        try:
            return snapshot(db, module)
        finally:
            db.rollback()
    if action in ("pause", "resume"):
        if module == "webhooks":
            webhooks.change(db, data["id"], action)
        else:
            exports.control(db, action, data["id"], now)
        return {"ok": True}
    if module != "export-planifie" or action not in ("add", "send"):
        raise ValueError("invalid command")
    # Store the receipt atomically with the schedule or run, including concurrent retries.
    key = data["requestId"]
    fingerprint = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()
    with transaction(db):
        db.execute("CREATE TABLE IF NOT EXISTS console_receipt (id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, result TEXT NOT NULL)")
        previous = db.execute("SELECT fingerprint,result FROM console_receipt WHERE id=?", (key,)).fetchone()
        if previous:
            if previous["fingerprint"] != fingerprint:
                raise ValueError("request changed")
            return {"id": previous["result"]}
        if action == "add":
            if data["file"] not in reports:
                raise ValueError("unknown report")
            report, fmt = data["file"].rsplit(".", 1)
            result = exports.add(db, report, fmt, data["frequency"], data["hour"], data["zone"], data["recipients"], now)
        else:
            schedule = db.execute("SELECT * FROM schedule WHERE id=? AND deleted=0", (data["id"],)).fetchone()
            if not schedule:
                raise ValueError("unknown schedule")
            result = key
            exports.enqueue(db, schedule, result, now, "manual", now)
        db.execute("INSERT INTO console_receipt VALUES(?,?,?)", (key, fingerprint, result))
        return {"id": result}


def main():
    module, filename = sys.argv[1:]
    path = Path(filename)
    if module not in ("webhooks", "export-planifie") or not path.is_absolute():
        raise ValueError("configuration")
    # mode=rw prevents silently creating a disconnected store when the configured path is wrong.
    db = sqlite3.connect(path.as_uri() + "?mode=rw", uri=True, timeout=5, isolation_level=None)
    try:
        db.row_factory = sqlite3.Row
        db.execute("PRAGMA foreign_keys=ON")
        reports = sorted({entry.strip() for entry in os.environ.get("BPM_EXPORT_REPORTS", "").split(",") if entry.strip()})
        data = json.load(sys.stdin)
        reply = command(db, module, data, reports, int(time.time()))
        if data["action"] == "snapshot" and module == "export-planifie":
            reply["reports"] = reports
        print(json.dumps(reply, ensure_ascii=False))
    finally:
        db.close()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, ZoneInfoNotFoundError):
        sys.exit(2)
