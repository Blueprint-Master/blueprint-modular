"""Maintain application currencies, countries, VAT rates and units with revision checks and usage links."""
from decimal import Decimal, InvalidOperation
import json
import re

from . import audit
from ._module_store import connect, transaction

SCHEMA = """
CREATE TABLE IF NOT EXISTS reference_entries (
 kind TEXT, code TEXT, label TEXT NOT NULL, attributes TEXT NOT NULL, active INTEGER NOT NULL,
 revision INTEGER NOT NULL, PRIMARY KEY(kind,code)
);
CREATE TABLE IF NOT EXISTS reference_tombstones (
 kind TEXT, code TEXT, revision INTEGER NOT NULL, PRIMARY KEY(kind,code)
);
CREATE TABLE IF NOT EXISTS reference_usage (
 kind TEXT, code TEXT, object_id TEXT, PRIMARY KEY(kind,code,object_id),
 FOREIGN KEY(kind,code) REFERENCES reference_entries(kind,code) ON DELETE RESTRICT
);
"""
PATTERNS = {"currency": r"[A-Z]{3}", "country": r"[A-Z]{2}", "vat": r"[A-Z0-9_]{2,10}", "unit": r"[A-Z0-9]{1,6}"}


def open_store(path):
    return connect(path, audit.SCHEMA + SCHEMA)


def validate(kind, code, label, attributes):
    if kind not in PATTERNS or not isinstance(code, str) or not re.fullmatch(PATTERNS[kind], code):
        raise ValueError("Invalid reference kind or code")
    if not isinstance(label, str) or not label.strip() or not isinstance(attributes, dict):
        raise ValueError("Label and attributes are required")
    keys = {"currency": {"symbol","decimals"}, "country": {"eu"}, "vat": {"rate"}, "unit": {"family"}}
    if set(attributes) != keys[kind]:
        raise ValueError(f"Expected attributes {sorted(keys[kind])}")
    if kind == "currency":
        if not isinstance(attributes["symbol"], str) or not attributes["symbol"].strip() or type(attributes["decimals"]) is not int or not 0 <= attributes["decimals"] <= 9:
            raise ValueError("Invalid currency symbol or decimal places")
    elif kind == "country" and type(attributes["eu"]) is not bool:
        raise ValueError("EU membership must be a boolean")
    elif kind == "unit" and attributes["family"] not in ("mass","length","volume","quantity","time"):
        raise ValueError("Unknown unit family")
    elif kind == "vat":
        try:
            rate = Decimal(str(attributes["rate"]))
        except InvalidOperation as exc:
            raise ValueError("Invalid tax rate") from exc
        if not rate.is_finite() or not 0 <= rate <= 100:
            raise ValueError("Invalid tax rate")
        return {"rate": format(rate,"f")}
    return attributes


def get(db, kind, code):
    row = db.execute("SELECT e.*, (SELECT count(*) FROM reference_usage u WHERE u.kind=e.kind AND u.code=e.code) AS uses "
                     "FROM reference_entries e WHERE kind=? AND code=?", (kind,code)).fetchone()
    if row is None:
        raise KeyError((kind,code))
    return dict(row, attributes=json.loads(row["attributes"]), active=bool(row["active"]))


def choices(db, kind, *, include_inactive=False):
    if kind not in PATTERNS:
        raise ValueError("Unknown reference kind")
    return [dict(row) for row in db.execute(
        "SELECT code,label FROM reference_entries WHERE kind=? AND (active=1 OR ?) ORDER BY label,code",
        (kind,int(include_inactive)))]


def save(db, kind, code, label, attributes, *, actor, expected_revision, active=True):
    """Create with expected_revision=0. Edits supply the version last read by the caller."""
    if type(active) is not bool or type(expected_revision) is not int or expected_revision < 0:
        raise ValueError("Invalid active flag or expected revision")
    data = json.dumps(validate(kind, code, label, attributes), ensure_ascii=False, sort_keys=True)
    with transaction(db):
        args = (label.strip(),data,int(active),kind,code)
        if expected_revision == 0:
            added = db.execute("INSERT INTO reference_entries(label,attributes,active,kind,code,revision) VALUES(?,?,?,?,?,1+COALESCE((SELECT revision FROM reference_tombstones WHERE kind=? AND code=?),0)) "
                               "ON CONFLICT(kind,code) DO NOTHING",(*args,kind,code)).rowcount
            previous = None
        else:
            previous = get(db, kind, code)
            added = db.execute("UPDATE reference_entries SET label=?,attributes=?,active=?,revision=revision+1 "
                               "WHERE kind=? AND code=? AND revision=?",(*args,expected_revision)).rowcount
        if not added:
            raise ValueError("Reference revision conflict")
        current = get(db, kind, code)
        audit.record(db,actor,"creation" if previous is None else "modification",f"{kind}/{code}",{"before":previous,"after":current})
        return current


def link(db, kind, code, object_id):
    """Register a host object's use. Existing links survive retirement of the reference."""
    if not isinstance(object_id,str) or not object_id.strip():
        raise ValueError("Object identifier required")
    with transaction(db):
        if db.execute("SELECT 1 FROM reference_usage WHERE kind=? AND code=? AND object_id=?", (kind,code,object_id)).fetchone():
            return
        if not get(db,kind,code)["active"]:
            raise ValueError("Cannot link an inactive reference")
        db.execute("INSERT INTO reference_usage VALUES(?,?,?)", (kind,code,object_id))


def unlink(db, kind, code, object_id):
    db.execute("DELETE FROM reference_usage WHERE kind=? AND code=? AND object_id=?", (kind,code,object_id))


def delete(db, kind, code, *, actor, expected_revision):
    with transaction(db):
        current = get(db,kind,code)
        if current["uses"] or current["revision"] != expected_revision:
            raise ValueError("Reference is in use or has changed")
        db.execute("INSERT INTO reference_tombstones VALUES(?,?,?) ON CONFLICT(kind,code) DO UPDATE SET revision=excluded.revision",
                   (kind,code,current["revision"]))
        db.execute("DELETE FROM reference_entries WHERE kind=? AND code=?", (kind,code))
        audit.record(db,actor,"suppression",f"{kind}/{code}",current)
