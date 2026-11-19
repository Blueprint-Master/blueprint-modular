"""Version form schemas and validate application submissions in durable storage."""
from datetime import date
from decimal import Decimal, InvalidOperation
import json
from uuid import uuid4

from . import audit
from ._module_store import connect, transaction

SCHEMA = """
CREATE TABLE IF NOT EXISTS form_versions (
 form TEXT, version INTEGER, definition TEXT NOT NULL, PRIMARY KEY(form,version)
);
CREATE TABLE IF NOT EXISTS form_submissions (
 id TEXT PRIMARY KEY, form TEXT NOT NULL, version INTEGER NOT NULL, requester TEXT NOT NULL,
 answers TEXT NOT NULL, status TEXT NOT NULL,
 FOREIGN KEY(form,version) REFERENCES form_versions(form,version)
);
"""
TYPES = ("text", "number", "date", "select", "radio", "checkbox", "textarea")


def open_store(path):
    return connect(path, audit.SCHEMA + SCHEMA)


def dumps(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, allow_nan=False, separators=(",", ":"))


def check_schema(schema):
    if not isinstance(schema, dict) or not isinstance(schema.get("id"),str) or not schema["id"].strip():
        raise ValueError("Form ID required")
    fields = schema.get("fields")
    if not isinstance(fields,list) or not fields:
        raise ValueError("Form fields required")
    seen = {}
    for field in fields:
        key, kind = field["id"], field["type"]
        if not isinstance(key,str) or not key.strip() or key in seen or kind not in TYPES:
            raise ValueError("Invalid or duplicate form field")
        if "required" in field and type(field["required"]) is not bool:
            raise ValueError("Invalid required flag")
        if kind in ("select","radio"):
            values = [item["value"] for item in field["options"]]
            if not values or not all(isinstance(x,str) and x for x in values) or len(set(values)) != len(values):
                raise ValueError("Choices must have distinct non-empty values")
        if "visibleIf" in field:
            check_condition(field["visibleIf"],seen)
        seen[key] = kind
    for item in schema.get("messages",[]):
        check_condition(item["visibleIf"],seen)
    if "dateRange" in schema:
        span = schema["dateRange"]
        if span["start"] == span["end"] or any(seen.get(span[k]) != "date" for k in ("start","end")):
            raise ValueError("Date range must reference two date fields")


def check_condition(rule, seen):
    if rule.get("field") not in seen or rule.get("operator") not in ("equals","greaterThan") or "value" not in rule:
        raise ValueError("Invalid field condition")
    if rule["operator"] == "greaterThan":
        if seen[rule["field"]] != "number" or not as_decimal(rule["value"]).is_finite():
            raise ValueError("A threshold requires a number field")


def as_decimal(value):
    try:
        return Decimal(str(value).strip().replace(",", "."))
    except (InvalidOperation, ValueError) as exc:
        raise ValueError("Invalid number") from exc


def matches(rule, values):
    if rule["field"] not in values:
        return False
    left = values[rule["field"]]
    if rule["operator"] == "greaterThan":
        return as_decimal(left) > as_decimal(rule["value"])
    if type(rule["value"]) in (int,float) and type(left) is not bool:
        try:
            return as_decimal(left) == as_decimal(rule["value"])
        except ValueError:
            return False
    return type(left) is type(rule["value"]) and left == rule["value"]


def validate(schema, answers):
    check_schema(schema)
    if not isinstance(answers,dict) or set(answers).difference(f["id"] for f in schema["fields"]):
        raise ValueError("Unknown submitted field")
    cleaned = {}
    for field in schema["fields"]:
        key, kind = field["id"], field["type"]
        if "visibleIf" in field and not matches(field["visibleIf"],cleaned):
            continue
        value = answers.get(key)
        if value is None or isinstance(value,str) and not value.strip():
            if field.get("required"):
                raise ValueError("Missing field " + key)
            continue
        if kind == "number":
            numeric = as_decimal(value)
            if not numeric.is_finite() or numeric < 0:
                raise ValueError("Expected a nonnegative finite number for " + key)
            value = format(numeric,"f")
        elif kind == "checkbox":
            if type(value) is not bool:
                raise ValueError("Expected a boolean for " + key)
        elif not isinstance(value,str):
            raise ValueError("Expected text for " + key)
        elif kind == "date":
            value = date.fromisoformat(value).isoformat()
        elif kind in ("select","radio") and value not in [o["value"] for o in field["options"]]:
            raise ValueError("Unknown option for " + key)
        cleaned[key] = value
    span = schema.get("dateRange")
    if span and span["start"] in cleaned and span["end"] in cleaned and cleaned[span["start"]] > cleaned[span["end"]]:
        raise ValueError("End date precedes start")
    return cleaned


def publish(db, schema, *, expected_version):
    check_schema(schema)
    content = dumps(schema)
    form = schema["id"]
    with transaction(db):
        last = db.execute("SELECT version,definition FROM form_versions WHERE form=? ORDER BY version DESC LIMIT 1", (form,)).fetchone()
        if last and last["definition"] == content:
            return last["version"]
        current = last["version"] if last else 0
        if current != expected_version:
            raise ValueError("Schema version conflict")
        db.execute("INSERT INTO form_versions VALUES(?,?,?)", (form,current+1,content))
        return current + 1


def definition(db, form, version):
    row = db.execute("SELECT definition FROM form_versions WHERE form=? AND version=?", (form,version)).fetchone()
    if row is None:
        raise KeyError((form,version))
    return json.loads(row[0])


def submit(db, form, version, answers, *, requester, request_id=None):
    identifier = str(uuid4()) if request_id is None else request_id
    if not isinstance(identifier,str) or not identifier.strip():
        raise ValueError("Invalid request identifier")
    values = dumps(validate(definition(db,form,version),answers))
    with transaction(db):
        added = db.execute("INSERT INTO form_submissions VALUES(?,?,?,?,?,'in_review') ON CONFLICT(id) DO NOTHING",
                           (identifier,form,version,requester,values)).rowcount
        if added:
            audit.record(db,requester,"creation","submission/"+identifier,{"form":form,"version":version})
        else:
            previous = db.execute("SELECT form,version,requester,answers FROM form_submissions WHERE id=?",(identifier,)).fetchone()
            if tuple(previous) != (form,version,requester,values):
                raise ValueError("Request ID already used")
    return identifier


def review(db, identifier, status, *, reviewer):
    """The host authorizes the reviewer before calling this method."""
    if status not in ("approved","rejected"):
        raise ValueError("Invalid review decision")
    with transaction(db):
        updated = db.execute("UPDATE form_submissions SET status=? WHERE id=? AND status='in_review'",(status,identifier)).rowcount
        if not updated:
            raise ValueError("No pending submission with this ID")
        audit.record(db,reviewer,"modification","submission/"+identifier,{"status":status})


def get(db, identifier):
    row = db.execute("SELECT * FROM form_submissions WHERE id=?", (identifier,)).fetchone()
    if row is None:
        raise KeyError(identifier)
    return dict(row, answers=json.loads(row["answers"]))
