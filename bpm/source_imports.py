"""Read bounded snapshots over already authenticated REST, SFTP and SQL connections."""
from contextlib import closing
import csv
from datetime import date, datetime
from decimal import Decimal
import io
import json
import re

from ._module_store import connect, transaction

MAX_ROWS = 20_000
MAX_BYTES = 8 * 1024 * 1024
IDENTIFIER = re.compile(r"[A-Za-z_][A-Za-z_0-9]{0,62}")
SCHEMA = """
CREATE TABLE IF NOT EXISTS source_snapshots (
 source TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload TEXT NOT NULL, updated_at TEXT NOT NULL
);
"""


def open_store(path):
    return connect(path, SCHEMA)


def _read(stream):
    data = stream.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("Source exceeds the configured snapshot size")
    return data.decode("utf-8-sig")


def read_rest(response):
    """Read a JSON array from the host's successful HTTP response."""
    if not 200 <= response.status < 300:
        raise ValueError("Source returned an unsuccessful HTTP status")
    rows = json.loads(_read(response))
    if not isinstance(rows, list):
        raise ValueError("Source must contain a JSON array")
    return rows


def read_sftp(sftp, path, *, delimiter=","):
    """Read a UTF-8 CSV through the host's authenticated Paramiko SFTP connection."""
    with sftp.open(path, "rb") as stream:
        reader = csv.DictReader(io.StringIO(_read(stream), newline=""), delimiter=delimiter, strict=True)
        fields = reader.fieldnames
        if not fields or any(not field.strip() for field in fields) or len(set(fields)) != len(fields):
            raise ValueError("CSV source requires unique, nonempty column names")
        rows = []
        for row in reader:
            if len(rows) >= MAX_ROWS or None in row or None in row.values():
                raise ValueError("Invalid or oversized CSV source")
            rows.append(row)
        return rows


def read_table(connection, dialect, table, columns):
    """Read named columns from a host-owned PostgreSQL or MySQL DB-API connection."""
    if dialect not in ("postgresql", "mysql"):
        raise ValueError("Unsupported SQL source")
    if not isinstance(columns, (tuple, list)) or not columns or len(columns) > 128:
        raise ValueError("Specify between 1 and 128 columns")
    if not all(isinstance(key, str) and IDENTIFIER.fullmatch(key) for key in [table, *columns]) or len(set(columns)) != len(columns):
        raise ValueError("Invalid SQL identifier or repeated column")
    quote = '"' if dialect == "postgresql" else chr(96)
    names = ", ".join(quote + name + quote for name in columns)
    with closing(connection.cursor()) as cursor:
        cursor.execute(f"SELECT {names} FROM {quote}{table}{quote} LIMIT {MAX_ROWS + 1}")
        data = cursor.fetchmany(MAX_ROWS + 1)
    if len(data) > MAX_ROWS:
        raise ValueError("Source exceeds the configured row limit")
    return [dict(zip(columns, row)) for row in data]


def _format(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, Decimal) and value.is_finite():
        return str(value)
    raise ValueError("Unsupported value in source")


def snapshot(db, source):
    row = db.execute("SELECT * FROM source_snapshots WHERE source=?", (source,)).fetchone()
    if row is None:
        return None
    return {"revision": row["revision"], "updated_at": row["updated_at"], "rows": json.loads(row["payload"])}


def sync(db, source, primary_key, read_rows, *, expected_revision):
    """Replace one source atomically. Fetch outside the local write transaction."""
    if not isinstance(source, str) or not source.strip() or type(expected_revision) is not int or expected_revision < 0:
        raise ValueError("Invalid source name or expected revision")
    rows = read_rows()
    if not isinstance(rows, list) or len(rows) > MAX_ROWS:
        raise ValueError("Source must be a bounded list of records")
    keys = set()
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError("Invalid record")
        value = row.get(primary_key)
        if type(value) not in (int, str) or value == "" or value in keys:
            raise ValueError("Missing or duplicate primary key")
        keys.add(value)
    payload = json.dumps(rows, ensure_ascii=False, allow_nan=False, default=_format, separators=(",", ":"))
    if len(payload.encode("utf-8")) > MAX_BYTES:
        raise ValueError("Source exceeds the configured snapshot size")
    with transaction(db):
        current = db.execute("SELECT revision FROM source_snapshots WHERE source=?", (source,)).fetchone()
        if (current[0] if current else 0) != expected_revision:
            raise ValueError("Source revision conflict")
        db.execute("INSERT INTO source_snapshots VALUES(?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(source) DO UPDATE SET "
                   "revision=excluded.revision,payload=excluded.payload,updated_at=excluded.updated_at",
                   (source, expected_revision + 1, payload))
    return expected_revision + 1
