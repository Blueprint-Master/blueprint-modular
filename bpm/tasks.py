"""Application task board with durable assignments, due dates and revision-checked transitions."""
from datetime import date
from uuid import uuid4

from . import audit
from ._module_store import connect, transaction

SCHEMA = """
CREATE TABLE IF NOT EXISTS module_tasks (
 id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, assignee TEXT NOT NULL, due TEXT NOT NULL,
 priority TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'todo', revision INTEGER NOT NULL DEFAULT 1, deleted INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS module_task_board ON module_tasks(assignee,status,due);
"""
PRIORITIES = ("high","normal","low")


def open_store(path):
    return connect(path, audit.SCHEMA + SCHEMA)


def fields(title, description, assignee, due, priority):
    if not all(isinstance(v,str) and v.strip() for v in (title,assignee)) or not isinstance(description,str) or priority not in PRIORITIES:
        raise ValueError("Invalid task title, description, assignee or priority")
    return title.strip(),description,assignee.strip(),date.fromisoformat(due).isoformat(),priority


def get(db, identifier):
    row = db.execute("SELECT id,title,description,assignee,due,priority,status,revision FROM module_tasks WHERE id=? AND deleted=0",
                     (identifier,)).fetchone()
    if row is None:
        raise KeyError(identifier)
    return dict(row)


def create(db, title, assignee, due, *, actor, priority="normal", description="", task_id=None):
    identifier = str(uuid4()) if task_id is None else task_id
    if not isinstance(identifier,str) or not identifier.strip():
        raise ValueError("Invalid task ID")
    values = fields(title,description,assignee,due,priority)
    with transaction(db):
        db.execute("INSERT INTO module_tasks(id,title,description,assignee,due,priority) VALUES(?,?,?,?,?,?)",(identifier,*values))
        result = get(db,identifier)
        audit.record(db,actor,"creation","task/"+identifier,result)
        return result


def update(db, identifier, *, actor, revision, title=None, description=None, assignee=None, due=None, priority=None, status=None):
    with transaction(db):
        old = get(db,identifier)
        changes = dict(title=title,description=description,assignee=assignee,due=due,priority=priority)
        data = {key:value if value is not None else old[key] for key,value in changes.items()}
        values = fields(**data)
        if status is None:
            status = old["status"]
        elif status != old["status"] and (old["status"],status) not in (("todo","doing"),("doing","done")):
            raise ValueError("Invalid task transition")
        result = db.execute("UPDATE module_tasks SET title=?,description=?,assignee=?,due=?,priority=?,status=?,revision=revision+1 "
                            "WHERE id=? AND revision=? AND deleted=0",(*values,status,identifier,revision))
        if not result.rowcount:
            raise ValueError("Task revision conflict")
        current = get(db,identifier)
        audit.record(db,actor,"modification","task/"+identifier,{"before":old,"after":current})
        return current


def delete(db, identifier, *, actor, revision):
    with transaction(db):
        previous = get(db,identifier)
        if not db.execute("UPDATE module_tasks SET deleted=1,revision=revision+1 WHERE id=? AND revision=? AND deleted=0",
                          (identifier,revision)).rowcount:
            raise ValueError("Task revision conflict")
        audit.record(db,actor,"suppression","task/"+identifier,previous)


def board(db, *, assignee=None, status=None, overdue_on=None):
    if status is not None and status not in ("todo","doing","done"):
        raise ValueError("Unknown task status")
    clauses = ["deleted=0"]
    args = []
    for column,value in (("assignee",assignee),("status",status)):
        if value is not None:
            clauses.append(column+"=?")
            args.append(value)
    if overdue_on is not None:
        clauses.append("due<? AND status!='done'")
        args.append(date.fromisoformat(overdue_on).isoformat())
    return [dict(row) for row in db.execute("SELECT id,title,description,assignee,due,priority,status,revision FROM module_tasks WHERE "
                                            + " AND ".join(clauses) + " ORDER BY due,id",args)]
