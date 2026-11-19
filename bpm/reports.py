"""Generate and store business reports from application data or a UTF-8 CSV file."""
import argparse
import csv
import hashlib
import io
import json
import sys
from collections import defaultdict
from contextlib import closing
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from pathlib import Path
from uuid import uuid4

from ._module_store import connect, transaction


MODELS = ("monthly-revenue", "regional-orders", "department-headcount")
INPUT_COLUMNS = {
    "monthly-revenue": {"date", "amount"},
    "regional-orders": {"date", "amount", "region"},
    "department-headcount": {"date", "employee", "department", "fte"},
}


def csv_rows(source, model):
    reader = csv.DictReader(source)
    fields = reader.fieldnames or []
    missing = INPUT_COLUMNS[model].difference(fields)
    if missing or len(fields) != len(set(fields)):
        raise ValueError("Invalid CSV header, expected unique columns including " + ", ".join(sorted(INPUT_COLUMNS[model])))
    return reader


SCHEMA = """
CREATE TABLE IF NOT EXISTS generated_reports (
 id TEXT PRIMARY KEY, model TEXT NOT NULL, period_start TEXT NOT NULL, period_end TEXT NOT NULL,
 author TEXT NOT NULL, created_at TEXT NOT NULL, snapshot TEXT NOT NULL, digest TEXT NOT NULL
);
"""


def open_store(path):
    """Use a database dedicated to one application or tenant."""
    return connect(path, SCHEMA)


def number(value, field):
    try:
        result = Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError) as error:
        raise ValueError(f"Invalid {field}: {value}") from error
    if not result.is_finite():
        raise ValueError(f"Invalid {field}: {value}")
    return result


def label(row, field):
    value = row.get(field)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"Missing {field}")
    return value.strip()


def build(model, start, end, rows):
    """Date bounds are inclusive. Each order row represents one order, including its net amount."""
    first, last = date.fromisoformat(start), date.fromisoformat(end)
    if first > last or model not in MODELS:
        raise ValueError("Invalid model or reporting period")
    totals = defaultdict(Decimal)
    counts = defaultdict(int)
    staff = {}
    for row in rows:
        when = date.fromisoformat(label(row, "date"))
        if when > last:
            continue
        if model == "department-headcount":
            # Latest observation at close; zero FTE denotes a leaver.
            person = label(row, "employee")
            obs = (label(row, "department"), number(row.get("fte"), "fte"))
            if obs[1] < 0:
                raise ValueError("Negative FTE")
            previous = staff.get(person)
            if not previous or when > previous[0]:
                staff[person] = (when, obs, False)
            elif when == previous[0] and previous[1] != obs:
                staff[person] = (when, obs, True)
        elif first <= when:
            group = when.strftime("%Y-%m") if model == "monthly-revenue" else label(row, "region")
            totals[group] += number(row.get("amount"), "amount")
            counts[group] += 1
    if model == "department-headcount":
        for person, (when, (department, fte), ambiguous) in staff.items():
            if ambiguous:
                raise ValueError(f"Conflicting observations for {person} on {when}")
            if fte:
                totals[department] += fte
                counts[department] += 1
        return {"columns": ["department", "employees", "fte"], "rows": [
            [key, counts[key], format(amount, "f")] for key, amount in sorted(totals.items())]}
    if model == "monthly-revenue":
        return {"columns": ["month", "net_revenue"], "rows": [
            [key, format(amount, "f")] for key, amount in sorted(totals.items())]}
    return {"columns": ["region", "orders", "net_amount", "average_order"], "rows": [
        [key, counts[key], format(amount, "f"), format(amount / counts[key], ".2f")]
        for key, amount in sorted(totals.items())]}


def generate(db, model, start, end, rows, *, author, request_id=None):
    if not isinstance(author, str) or not author.strip():
        raise ValueError("Author required")
    identifier = str(uuid4()) if request_id is None else request_id
    if not isinstance(identifier, str) or not identifier.strip():
        raise ValueError("Request ID required")
    data = json.dumps(build(model, start, end, rows), ensure_ascii=False, separators=(",", ":"))
    digest = hashlib.sha256(json.dumps([model, start, end, author, data], ensure_ascii=False).encode()).hexdigest()
    with transaction(db):
        old = db.execute("SELECT digest FROM generated_reports WHERE id=?", (identifier,)).fetchone()
        if old:
            if old["digest"] != digest:
                raise ValueError("Request ID already used for another report")
        else:
            db.execute("INSERT INTO generated_reports VALUES(?,?,?,?,?,?,?,?)", (
                identifier, model, start, end, author, datetime.now(timezone.utc).isoformat(), data, digest))
    return identifier


def snapshot(db, identifier):
    row = db.execute("SELECT * FROM generated_reports WHERE id=?", (identifier,)).fetchone()
    if row is None:
        raise KeyError(identifier)
    return {"id": row["id"], "model": row["model"], "start": row["period_start"], "end": row["period_end"],
            "author": row["author"], "created_at": row["created_at"], **json.loads(row["snapshot"])}


def export_csv(db, identifier):
    report = snapshot(db, identifier)
    output = io.StringIO(newline="")
    writer = csv.writer(output, delimiter=";")
    writer.writerow(report["columns"])
    for values in report["rows"]:
        key, *amounts = values
        # Only the grouping label comes from arbitrary text. Preserve signed numeric amounts.
        if key.lstrip().startswith(("=", "+", "-", "@")) or key.startswith(("\t", "\r", "\n")):
            key = "'" + key
        writer.writerow([key, *amounts])
    return output.getvalue().encode("utf-8-sig")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--db", required=True)
    commands = parser.add_subparsers(dest="command", required=True)
    create = commands.add_parser("generate")
    for flag in ("start", "end", "author", "input"):
        create.add_argument("--" + flag, required=True)
    create.add_argument("--model", choices=MODELS, required=True)
    create.add_argument("--request-id")
    export = commands.add_parser("export")
    export.add_argument("id")
    commands.add_parser("list")
    args = parser.parse_args()
    with closing(open_store(args.db)) as db:
        if args.command == "generate":
            with Path(args.input).open(encoding="utf-8-sig", newline="") as source:
                identifier = generate(db, args.model, args.start, args.end, csv_rows(source, args.model),
                                      author=args.author, request_id=args.request_id)
            print(identifier)
        elif args.command == "export":
            sys.stdout.buffer.write(export_csv(db, args.id))
        else:
            for row in db.execute("SELECT id,model,period_start,period_end,author,created_at FROM generated_reports ORDER BY created_at DESC"):
                print(json.dumps(dict(row), ensure_ascii=False))


if __name__ == "__main__":
    main()
