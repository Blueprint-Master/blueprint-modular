"""Local persistent storage for Modular workers."""
from contextlib import contextmanager
import os
import sqlite3


def connect(path, schema):
    # Explicit mode also covers applications calling the SDK without the CLI.
    if path != ":memory:":
        fd = os.open(path, os.O_CREAT | os.O_RDWR, 0o600)
        os.close(fd)
    db = sqlite3.connect(path, timeout=15, isolation_level=None)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    db.executescript(schema)
    return db


@contextmanager
def transaction(db):
    db.execute("BEGIN IMMEDIATE")
    try:
        yield
        db.commit()
    except BaseException:
        db.rollback()
        raise
