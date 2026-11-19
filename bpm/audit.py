"""Append and query application audit events in the same transaction as the business operation."""
import csv
from datetime import datetime, timezone
import io
import json
from uuid import uuid4

from ._module_store import connect

SCHEMA = """
CREATE TABLE IF NOT EXISTS module_audit (
 seq INTEGER PRIMARY KEY, event_id TEXT NOT NULL UNIQUE, at TEXT NOT NULL, actor TEXT NOT NULL,
 action TEXT NOT NULL, entity TEXT NOT NULL, source TEXT NOT NULL, detail TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS module_audit_entity ON module_audit(entity,seq);
CREATE TRIGGER IF NOT EXISTS module_audit_no_update BEFORE UPDATE ON module_audit
 BEGIN SELECT RAISE(ABORT,'audit events are immutable'); END;
CREATE TRIGGER IF NOT EXISTS module_audit_no_delete BEFORE DELETE ON module_audit
 BEGIN SELECT RAISE(ABORT,'audit events are immutable'); END;
"""
ACTIONS = ("creation", "modification", "suppression", "connexion")


def open_store(path):
    return connect(path, SCHEMA)


def record(db, actor, action, entity, detail, *, source="application", event_id=None):
    """Use a trusted actor from the host session. An optional stable ID makes delivery replayable."""
    identifier = str(uuid4()) if event_id is None else event_id
    if action not in ACTIONS or not all(isinstance(x, str) and x.strip() for x in (actor, entity, source, identifier)):
        raise ValueError("Expected actor, supported action, entity, source and event identifier")
    data = json.dumps(detail, ensure_ascii=False, allow_nan=False, separators=(",", ":"), sort_keys=True)
    fields = (actor, action, entity, source, data)
    added = db.execute("INSERT INTO module_audit(event_id,at,actor,action,entity,source,detail) VALUES(?,?,?,?,?,?,?) "
                       "ON CONFLICT(event_id) DO NOTHING",
                       (identifier,datetime.now(timezone.utc).isoformat(),*fields)).rowcount
    if not added:
        old = db.execute("SELECT actor,action,entity,source,detail FROM module_audit WHERE event_id=?", (identifier,)).fetchone()
        if tuple(old) != fields:
            raise ValueError("An event ID already identifies another operation")
    return identifier


def events(db, *, entity=None, actor=None, action=None, after=0, limit=100):
    """Keyset pagination in insertion order. Timestamps are UTC, set by the writer."""
    if not (isinstance(limit,int) and 1 <= limit <= 5000 and isinstance(after,int) and after >= 0):
        raise ValueError("Invalid page size or cursor")
    conditions, params = ["seq>?"], [after]
    for column, value in (("entity",entity),("actor",actor),("action",action)):
        if value is not None:
            conditions.append(column + "=?")
            params.append(value)
    query = "SELECT * FROM module_audit WHERE " + " AND ".join(conditions) + " ORDER BY seq LIMIT ?"
    return [dict(row, detail=json.loads(row["detail"])) for row in db.execute(query, (*params,limit))]


def export_csv(db, **filters):
    """Export all matching events that existed when the export began."""
    buffer = io.StringIO(newline="")
    writer = csv.writer(buffer)
    names = ["seq", "event_id", "at", "actor", "action", "entity", "source", "detail"]
    writer.writerow(names)
    ceiling = db.execute("SELECT COALESCE(MAX(seq),0) FROM module_audit").fetchone()[0]
    cursor = 0
    while cursor < ceiling:
        page = events(db, after=cursor, **filters)
        if not page:
            break
        for event in page:
            if event["seq"] > ceiling:
                return buffer.getvalue()
            event["detail"] = json.dumps(event["detail"], ensure_ascii=False, sort_keys=True)
            values = [str(event[name]) for name in names]
            writer.writerow(["'" + x if x.lstrip().startswith(("=", "+", "-", "@")) else x for x in values])
        cursor = page[-1]["seq"]
    return buffer.getvalue()
