from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from pathlib import Path
import tempfile
import unittest

from bpm import targeted_notifications as notices, tasks, webhooks


class TasksAndNotices(unittest.TestCase):
    def test_assignment_and_concurrent_transition(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/"workspace.sqlite"
            with closing(tasks.open_store(path)) as db:
                tasks.create(db,"Inspect batch","operations","2026-11-15",actor="lead",task_id="batch")
                self.assertEqual(len(tasks.board(db,assignee="operations",overdue_on="2026-11-16")),1)
                with self.assertRaises(ValueError):
                    tasks.update(db,"batch",actor="lead",revision=1,status="done")
            def accept(_):
                with closing(tasks.open_store(path)) as db:
                    try:
                        return tasks.update(db,"batch",revision=1,actor="ops",status="doing")["revision"]
                    except ValueError:
                        return None
            with ThreadPoolExecutor(max_workers=2) as pool:
                self.assertCountEqual(pool.map(accept,range(2)),[2,None])
            with closing(tasks.open_store(path)) as db:
                tasks.update(db,"batch",revision=2,actor="ops",status="done")
                self.assertEqual(tasks.board(db,overdue_on="2026-11-16"),[])
                tasks.delete(db,"batch",revision=3,actor="lead")
                self.assertEqual(tasks.board(db),[])
                self.assertEqual(len(tasks.audit.events(db,entity="task/batch")),4)

    def test_quote_thresholds_and_event_replay(self):
        with closing(notices.open_store(":memory:")) as db:
            notices.configure(db, "large", "quote", "sales", ["in-app"], amount_above="10000")
            teams = {"sales": ["manager"]}
            for identifier, amount in (("missing", None), ("equal", "10000.00"), ("large", "10000.01")):
                notices.notify(db, identifier, "quote", "Review", "Quote", teams=teams, amount=amount)
            notices.notify(db, "large", "quote", "Review", "Quote", teams=teams, amount="10000.010")
            self.assertEqual([row["event_id"] for row in notices.inbox(db, "manager")], ["large"])
            with self.assertRaises(ValueError):
                notices.notify(db, "large", "quote", "Review", "Quote", teams=teams, amount="10001")
            notices.configure(db, "large", "quote", "sales", ["in-app"])
            notices.notify(db, "unfiltered", "quote", "Review", "Quote", teams=teams)
            self.assertEqual(len(notices.inbox(db, "manager")), 2)

    def test_audience_overlap_replay_isolation_and_delivery_adapters(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/"workspace.sqlite"
            with closing(notices.open_store(path)) as db:
                notices.configure(db,"a","task.changed","finance",["in-app","email"])
                notices.configure(db,"b","task.changed","ops",["in-app","sms"])
                args = ("event-1","task.changed","Review","Please review order 42")
                teams = {"finance":["amy"],"ops":["amy","ian"]}
                with self.assertRaises(ValueError):
                    notices.notify(db,*args,teams=teams)
                self.assertEqual(notices.inbox(db,"amy"),[])
                webhooks.subscribe(db,"MAIL","notification.email")
                webhooks.subscribe(db,"SMS","notification.sms")
                notices.notify(db,*args,teams=teams,now=10)
            with closing(notices.open_store(path)) as db:
                notices.notify(db,*args,teams={"finance":["new"],"ops":[]},now=11)
                self.assertEqual(notices.inbox(db,"new"),[])
                item, = notices.inbox(db,"amy")
                with self.assertRaises(KeyError):
                    notices.mark_read(db,"ian",item["id"])
                notices.mark_read(db,"amy",item["id"])
                self.assertEqual(notices.inbox(db,"amy",unread_only=True),[])
                self.assertEqual(len(notices.inbox(db,"ian")),1)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM dispatch").fetchone()[0],3)
