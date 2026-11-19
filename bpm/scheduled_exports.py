"""Persistent scheduled report delivery. Run with python -m bpm.scheduled_exports."""
import argparse
import csv
import email.utils
from importlib import import_module
import io
import json
import os
import re
import smtplib
import sqlite3
from ._module_store import connect, transaction as write
import ssl
import sys
import time
import uuid
from datetime import datetime, time as civil_time, timedelta
from email.message import EmailMessage
from pathlib import Path
from zoneinfo import ZoneInfo

MAX_REPORT_BYTES = 10 * 1024 * 1024
KEY = re.compile(r"[a-z0-9][a-z0-9_-]{0,79}")
ADDRESS = re.compile(r"[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+")
SCHEMA = """
CREATE TABLE IF NOT EXISTS schedule (
 id TEXT PRIMARY KEY, report TEXT NOT NULL, format TEXT NOT NULL,
 frequency TEXT NOT NULL, hour TEXT NOT NULL, zone TEXT NOT NULL,
 recipients TEXT NOT NULL, due INTEGER NOT NULL, active INTEGER NOT NULL DEFAULT 1,
 deleted INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS run (
 id TEXT PRIMARY KEY, schedule_id TEXT NOT NULL REFERENCES schedule(id),
 due INTEGER NOT NULL, kind TEXT NOT NULL, artifact BLOB, created INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS run_by_schedule ON run(schedule_id, created);
CREATE TABLE IF NOT EXISTS delivery (
 run_id TEXT NOT NULL REFERENCES run(id), recipient TEXT NOT NULL, status TEXT NOT NULL,
 attempts INTEGER NOT NULL DEFAULT 0, retry_at INTEGER NOT NULL DEFAULT 0,
 detail TEXT, updated INTEGER NOT NULL, PRIMARY KEY(run_id,recipient)
);
CREATE INDEX IF NOT EXISTS delivery_due ON delivery(status,retry_at);
"""


def next_due(after, frequency, hour, zone):
    """Return the next strictly future occurrence, Monday weekly or first of month."""
    if frequency not in ("daily", "weekly", "monthly") or not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", hour):
        raise ValueError("invalid frequency or local time")
    tz = ZoneInfo(zone)
    day = datetime.fromtimestamp(after, tz).date()
    for offset in range(33):
        current = day + timedelta(days=offset)
        if frequency == "weekly" and current.weekday() != 0:
            continue
        if frequency == "monthly" and current.day != 1:
            continue
        # Earlier occurrence at autumn overlap. At a spring gap shift by the gap.
        stamp = int(datetime.combine(current, civil_time.fromisoformat(hour), tzinfo=tz).timestamp())
        if stamp > after:
            return stamp
    raise ValueError("next occurrence unavailable")


def open_store(path):
    return connect(path, SCHEMA)


def add(db, report, fmt, frequency, hour, zone, recipients, now):
    if not KEY.fullmatch(report) or fmt not in ("csv", "pdf"):
        raise ValueError("invalid report or format")
    addresses = list(dict.fromkeys(r.strip() for r in recipients))
    if not 1 <= len(addresses) <= 100 or any(not ADDRESS.fullmatch(r) or not r.isascii() for r in addresses):
        raise ValueError("invalid recipients")
    due = next_due(now, frequency, hour, zone)
    identifier = uuid.uuid4().hex
    db.execute("INSERT INTO schedule(id,report,format,frequency,hour,zone,recipients,due) VALUES(?,?,?,?,?,?,?,?)",
               (identifier, report, fmt, frequency, hour, zone, json.dumps(addresses), due))
    return identifier


def enqueue(db, schedule, identifier, due, kind, now):
    db.execute("INSERT INTO run(id,schedule_id,due,kind,created) VALUES(?,?,?,?,?)",
               (identifier, schedule["id"], due, kind, now))
    db.executemany("INSERT INTO delivery(run_id,recipient,status,updated) VALUES(?,?,'pending',?)",
                   [(identifier, address, now) for address in json.loads(schedule["recipients"])])


def collect_due(db, now):
    with write(db):
        for row in db.execute("SELECT * FROM schedule WHERE active=1 AND deleted=0 AND due<=?", (now,)).fetchall():
            identifier = row["id"] + "-" + str(row["due"])
            enqueue(db, row, identifier, row["due"], "scheduled", now)
            # A recovery sends one current snapshot, not one identical report per missed day.
            due = next_due(now, row["frequency"], row["hour"], row["zone"])
            db.execute("UPDATE schedule SET due=? WHERE id=?", (due, row["id"]))


def control(db, action, identifier, now):
    with write(db):
        row = db.execute("SELECT * FROM schedule WHERE id=? AND deleted=0", (identifier,)).fetchone()
        if not row:
            raise ValueError("unknown schedule")
        if action == "send":
            run_id = uuid.uuid4().hex
            enqueue(db, row, run_id, now, "manual", now)
            return run_id
        if action == "resume":
            if not row["active"]:
                due = next_due(now, row["frequency"], row["hour"], row["zone"])
                db.execute("UPDATE schedule SET active=1,due=? WHERE id=?", (due, identifier))
        elif action in ("pause", "delete"):
            db.execute("UPDATE schedule SET active=0,deleted=? WHERE id=?", (int(action == "delete"), identifier))
            db.execute("""UPDATE delivery SET status='cancelled',updated=? WHERE status='pending'
                          AND run_id IN (SELECT id FROM run WHERE schedule_id=?)""", (now, identifier))
            clear_finished(db)
        else:
            raise ValueError("invalid action")


def report_file(directory, report, fmt):
    """Load the operator-published attachment. Producers publish by atomic rename."""
    with (Path(directory) / (report + "." + fmt)).open("rb") as source:
        data = source.read(MAX_REPORT_BYTES + 1)
    if not data or len(data) > MAX_REPORT_BYTES:
        raise ValueError("report empty or too large")
    if fmt == "pdf":
        if not data.startswith(b"%PDF-") or b"%%EOF" not in data[-1024:]:
            raise ValueError("invalid PDF")
    else:
        rows = csv.reader(io.StringIO(data.decode("utf-8-sig"), newline=""), strict=True)
        header = next(rows, [])
        if not header or not any(header) or any(len(row) != len(header) for row in rows):
            raise ValueError("invalid CSV")
    return data


def clear_finished(db):
    db.execute("""UPDATE run SET artifact=NULL WHERE artifact IS NOT NULL AND NOT EXISTS
                  (SELECT 1 FROM delivery WHERE run_id=run.id AND status IN ('pending','sending','uncertain'))""")


def tick(db, load_report, deliver, now=None, limit=100):
    """Deliver one recipient at a time. Pass a fresh timestamp in tests only."""
    clock = (lambda: int(time.time())) if now is None else (lambda: now)
    collect_due(db, clock())
    for _ in range(limit):
        with write(db):
            instant = clock()
            # The SMTP deadline must be well below this interval. An ambiguous send
            # is reviewed explicitly instead of risking an automatic duplicate.
            db.execute("UPDATE delivery SET status='uncertain',detail='worker interrupted',updated=? "
                       "WHERE status='sending' AND updated<=?", (instant, instant - 900))
            row = db.execute("""SELECT d.*,r.artifact,s.report,s.format FROM delivery d
                JOIN run r ON r.id=d.run_id JOIN schedule s ON s.id=r.schedule_id
                WHERE d.status='pending' AND d.retry_at<=? ORDER BY r.created,r.id,d.recipient LIMIT 1""", (instant,)).fetchone()
            if not row:
                return
            key = (row["run_id"], row["recipient"])
            try:
                artifact = row["artifact"]
                if artifact is None:
                    artifact = load_report(row["report"], row["format"])
                    if not isinstance(artifact, bytes) or not 0 < len(artifact) <= MAX_REPORT_BYTES:
                        raise ValueError("invalid attachment")
                    db.execute("UPDATE run SET artifact=? WHERE id=?", (artifact, row["run_id"]))
            except (OSError, ValueError, csv.Error) as exc:
                db.execute("""UPDATE delivery SET attempts=attempts+1,retry_at=?,updated=?,detail=?
                              WHERE run_id=? AND recipient=?""", (instant + 300, instant, type(exc).__name__, *key))
                continue
            db.execute("UPDATE delivery SET status='sending',attempts=attempts+1,updated=?,detail=NULL "
                       "WHERE run_id=? AND recipient=?", (instant, *key))
        # The transaction has committed before the SMTP side effect.
        try:
            deliver(row["run_id"], row["report"], row["format"], row["recipient"], artifact)
            status, detail = "sent", None
        except BeforeSubmission as exc:
            status, detail = "pending", type(exc.__cause__).__name__
        except smtplib.SMTPResponseException as exc:
            status = "pending" if 400 <= exc.smtp_code < 500 else "failed"
            detail = "SMTP " + str(exc.smtp_code)
        except smtplib.SMTPRecipientsRefused as exc:
            code = next(iter(exc.recipients.values()))[0]
            status, detail = ("pending" if 400 <= code < 500 else "failed"), "SMTP " + str(code)
        except (OSError, smtplib.SMTPException):
            status, detail = "uncertain", "delivery acknowledgment unavailable"
        with write(db):
            db.execute("""UPDATE delivery SET status=?,detail=?,updated=?,retry_at=?
                          WHERE run_id=? AND recipient=? AND status='sending'""",
                       (status, detail, clock(), clock() + 300, *key))
            clear_finished(db)


class BeforeSubmission(Exception):
    """The transport failed before starting the SMTP submission."""


def smtp_sender():
    host = os.environ["BPM_SMTP_HOST"]
    sender = os.environ["BPM_SMTP_FROM"]
    mode = os.environ.get("BPM_SMTP_MODE", "starttls")
    if not ADDRESS.fullmatch(sender) or mode not in ("starttls", "tls", "loopback"):
        raise ValueError("invalid SMTP configuration")
    if mode == "loopback" and host not in ("127.0.0.1", "::1", "localhost"):
        raise ValueError("plaintext delivery requires a loopback relay")
    port = int(os.environ.get("BPM_SMTP_PORT", "465" if mode == "tls" else "587"))
    def deliver(run_id, report, fmt, recipient, artifact):
        msg = EmailMessage()
        msg["From"], msg["To"], msg["Subject"] = sender, recipient, report
        msg["Date"] = email.utils.formatdate(localtime=False)
        msg["Message-ID"] = "<" + uuid.uuid5(uuid.NAMESPACE_URL, run_id + "/" + recipient).hex + "@" + sender.split("@")[-1] + ">"
        msg.set_content(report)
        msg.add_attachment(artifact, maintype="application" if fmt == "pdf" else "text",
                           subtype=fmt, filename=report + "." + fmt)
        conn = None
        try:
            try:
                if mode == "tls":
                    conn = smtplib.SMTP_SSL(host, port, timeout=30, context=ssl.create_default_context())
                else:
                    conn = smtplib.SMTP(host, port, timeout=30)
                    if mode == "starttls":
                        conn.starttls(context=ssl.create_default_context())
                if os.environ.get("BPM_SMTP_USER"):
                    conn.login(os.environ["BPM_SMTP_USER"], os.environ["BPM_SMTP_PASSWORD"])
            except (OSError, smtplib.SMTPException, KeyError) as exc:
                raise BeforeSubmission() from exc
            conn.send_message(msg)
        finally:
            if conn:
                conn.close()
    return deliver


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True, help="SQLite file on a persistent volume")
    sub = parser.add_subparsers(dest="action", required=True)
    create = sub.add_parser("add")
    create.add_argument("report")
    create.add_argument("format", choices=["csv", "pdf"])
    create.add_argument("frequency", choices=["daily", "weekly", "monthly"])
    create.add_argument("hour")
    create.add_argument("recipients", nargs="+")
    create.add_argument("--zone", default="Europe/Paris")
    for action in ("pause", "resume", "send", "delete"):
        sub.add_parser(action).add_argument("id")
    sub.add_parser("list")
    sub.add_parser("history")
    run = sub.add_parser("tick")
    source = run.add_mutually_exclusive_group(required=True)
    source.add_argument("--reports", help="directory of atomically published reports")
    source.add_argument("--provider", help="installed Python module:function returning current report bytes")
    reconcile = sub.add_parser("reconcile")
    reconcile.add_argument("run_id")
    reconcile.add_argument("recipient")
    reconcile.add_argument("outcome", choices=["sent", "retry"])
    args = parser.parse_args(argv)
    now = int(time.time())
    db = open_store(args.db)
    try:
        if args.action == "add":
            print(add(db, args.report, args.format, args.frequency, args.hour, args.zone, args.recipients, now))
        elif args.action in ("pause", "resume", "send", "delete"):
            result = control(db, args.action, args.id, now)
            if result:
                print(result)
        elif args.action == "tick":
            if args.provider:
                module, separator, name = args.provider.partition(":")
                if not separator or not name.isidentifier():
                    raise ValueError("expected an installed module:function")
                provider = getattr(import_module(module), name)
            else:
                def provider(key, fmt):
                    return report_file(args.reports, key, fmt)
            tick(db, provider, smtp_sender())
        elif args.action == "reconcile":
            with write(db):
                status = "sent" if args.outcome == "sent" else "pending"
                if status == "pending":
                    schedule = db.execute("SELECT s.deleted FROM run r JOIN schedule s ON r.schedule_id=s.id "
                                          "WHERE r.id=?", (args.run_id,)).fetchone()
                    if schedule and schedule["deleted"]:
                        raise ValueError("schedule deleted; create a new schedule to resend")
                changed = db.execute("""UPDATE delivery SET status=?,retry_at=0,updated=?,detail='operator reviewed'
                    WHERE run_id=? AND recipient=? AND status='uncertain'""", (status, now, args.run_id, args.recipient))
                if not changed.rowcount:
                    raise ValueError("no uncertain delivery to reconcile")
                clear_finished(db)
        else:
            sql = ("SELECT * FROM schedule WHERE deleted=0 ORDER BY due" if args.action == "list" else
                   """SELECT r.schedule_id,r.kind,r.due,d.* FROM delivery d JOIN run r ON r.id=d.run_id
                      ORDER BY r.created DESC,r.id,d.recipient""")
            for row in db.execute(sql):
                print(json.dumps(dict(row), ensure_ascii=False))
    finally:
        db.close()


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, sqlite3.Error) as error:
        sys.exit(str(error))
