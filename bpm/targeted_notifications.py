"""Route application events to team members' inboxes and configured e-mail/SMS delivery adapters."""
from decimal import Decimal, InvalidOperation
from hashlib import sha256
import json
import time

from . import webhooks
from ._module_store import connect, transaction

SCHEMA = """
CREATE TABLE IF NOT EXISTS notification_rules (
 name TEXT PRIMARY KEY, topic TEXT NOT NULL, team TEXT NOT NULL, channels TEXT NOT NULL, enabled INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS notification_thresholds (
 name TEXT PRIMARY KEY REFERENCES notification_rules(name) ON DELETE CASCADE, amount TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS targeted_events (id TEXT PRIMARY KEY, content TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS notification_inbox (
 id TEXT PRIMARY KEY, event_id TEXT NOT NULL REFERENCES targeted_events(id), member TEXT NOT NULL,
 title TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL, read_at INTEGER, UNIQUE(event_id,member)
);
CREATE INDEX IF NOT EXISTS notification_by_member ON notification_inbox(member,created);
"""
CHANNELS = {"in-app","email","sms"}


def open_store(path):
    return connect(path, webhooks.SCHEMA + SCHEMA)


def monetary(value):
    try:
        amount = Decimal(str(value))
    except InvalidOperation as exc:
        raise ValueError("Invalid monetary value") from exc
    if not amount.is_finite() or abs(amount.adjusted()) > 32 or len(amount.as_tuple().digits) > 32:
        raise ValueError("Amount must be finite and in range")
    return amount


def configure(db, name, topic, team, channels, *, enabled=True, amount_above=None):
    if not all(isinstance(v,str) and v.strip() for v in (name,topic,team)) or type(enabled) is not bool:
        raise ValueError("Rule name, event topic, team and enabled flag required")
    channels = sorted(set(channels))
    if not channels or not set(channels) <= CHANNELS:
        raise ValueError("Invalid delivery channels")
    threshold = None if amount_above is None else monetary(amount_above)
    # A savepoint also supports hosts configuring a rule inside an existing transaction.
    db.execute("SAVEPOINT configure_notification_rule")
    try:
        db.execute("INSERT INTO notification_rules VALUES(?,?,?,?,?) ON CONFLICT(name) DO UPDATE SET "
                   "topic=excluded.topic,team=excluded.team,channels=excluded.channels,enabled=excluded.enabled",
                   (name,topic,team,json.dumps(channels),int(enabled)))
        db.execute("DELETE FROM notification_thresholds WHERE name=?", (name,))
        if threshold is not None:
            db.execute("INSERT INTO notification_thresholds VALUES(?,?)", (name,str(threshold)))
    except BaseException:
        db.execute("ROLLBACK TO configure_notification_rule")
        raise
    finally:
        db.execute("RELEASE configure_notification_rule")



def route(db, identifier, topic, title, body, *, teams, now=None, amount=None):
    """Resolve trusted team memberships on first delivery. Call inside the producer's transaction."""
    if not db.in_transaction:
        raise ValueError("A producer transaction is required")
    if not all(isinstance(v,str) and v.strip() for v in (identifier,topic,title,body)):
        raise ValueError("Event ID, topic, title and body required")
    number = None if amount is None else monetary(amount)
    payload = [topic, title, body]
    if number is not None:
        # Preserve pre-upgrade event fingerprints and replay equivalent decimal spellings.
        canonical = format(number, "f")
        payload.append((canonical.rstrip("0").rstrip(".") if "." in canonical else canonical) if number else "0")
    content = json.dumps(payload, ensure_ascii=False)
    old = db.execute("SELECT content FROM targeted_events WHERE id=?", (identifier,)).fetchone()
    if old:
        if old["content"] != content:
            raise ValueError("Event ID already used for another notification")
        return
    db.execute("INSERT INTO targeted_events VALUES(?,?)", (identifier,content))
    at = int(time.time()) if now is None else now
    deliveries = set()
    for rule in db.execute("SELECT team,channels,t.amount FROM notification_rules r LEFT JOIN notification_thresholds t "
                           "ON t.name=r.name WHERE enabled=1 AND topic=?", (topic,)):
        if rule["amount"] is not None and (number is None or number <= Decimal(rule["amount"])):
            continue
        if rule["team"] not in teams or not isinstance(teams[rule["team"]],(list,tuple,set)):
            raise ValueError("Missing team membership for " + rule["team"])
        for member in teams[rule["team"]]:
            if not isinstance(member,str) or not member.strip():
                raise ValueError("Invalid team member")
            deliveries.update((member,c) for c in json.loads(rule["channels"]))
    for member,channel in sorted(deliveries):
        key = sha256(json.dumps([identifier,member,channel],ensure_ascii=False).encode()).hexdigest()
        if channel == "in-app":
            db.execute("INSERT INTO notification_inbox VALUES(?,?,?,?,?,?,NULL)", (key,identifier,member,title,body,at))
        else:
            event = "notification." + channel
            if not db.execute("SELECT 1 FROM hook WHERE event=? AND deleted=0", (event,)).fetchone():
                raise ValueError("No configured delivery adapter for " + channel)
            webhooks.publish(db,"notify-"+key,event,{"member":member,"title":title,"body":body,"event":identifier},at)


def inbox(db, member, *, unread_only=False):
    return [dict(r) for r in db.execute("SELECT * FROM notification_inbox WHERE member=? AND (?=0 OR read_at IS NULL) "
                                         "ORDER BY created DESC,id",(member,int(unread_only)))]


def mark_read(db, member, identifier):
    if not db.execute("UPDATE notification_inbox SET read_at=COALESCE(read_at,?) WHERE id=? AND member=?",
                      (int(time.time()),identifier,member)).rowcount:
        raise KeyError(identifier)


def notify(db, *args, **kwargs):
    """Standalone entry point when the host event is already committed."""
    with transaction(db):
        route(db,*args,**kwargs)
