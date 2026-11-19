from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
import csv
import io
from pathlib import Path
import sqlite3
from tempfile import TemporaryDirectory
import unittest

from bpm import audit, reference_data as refs
from bpm._module_store import transaction


class ReferenceAuditTest(unittest.TestCase):
    def test_reference_use_persistence_deletion_and_revision(self):
        with TemporaryDirectory() as tmp:
            path = Path(tmp) / "master.sqlite"
            currency = {"symbol": "€", "decimals": 2}
            def change(db, rev, active=True):
                return refs.save(db,"currency","EUR","Euro",currency,actor="ops",expected_revision=rev,active=active)
            with closing(refs.open_store(path)) as db:
                first = change(db, 0)
                refs.link(db,"currency","EUR","order-1")
                refs.link(db,"currency","EUR","order-1")
                self.assertEqual(refs.get(db,"currency","EUR")["uses"], 1)
                with self.assertRaises(ValueError):
                    refs.delete(db,"currency","EUR",actor="ops",expected_revision=first["revision"])
            def retire(_):
                with closing(refs.open_store(path)) as db:
                    try:
                        return change(db,1,False)["revision"]
                    except ValueError:
                        return None
            with ThreadPoolExecutor(max_workers=2) as workers:
                self.assertCountEqual(workers.map(retire, range(2)), [2,None])
            with closing(refs.open_store(path)) as db:
                self.assertEqual(refs.choices(db,"currency"), [])
                refs.link(db,"currency","EUR","order-1")
                with self.assertRaises(ValueError):
                    refs.link(db,"currency","EUR","order-2")
                refs.unlink(db,"currency","EUR","order-1")
                refs.delete(db,"currency","EUR",actor="ops",expected_revision=2)
                self.assertEqual(change(db,0)["revision"], 3)
                with self.assertRaises(ValueError):
                    change(db,1)
                actions = audit.events(db, entity="currency/EUR")
                self.assertEqual([e["action"] for e in actions], ["creation","modification","suppression","creation"])
                self.assertEqual(actions[1]["detail"]["before"]["uses"], 1)
                self.assertEqual(actions[1]["detail"]["after"]["active"], False)
                for kind,code,attributes in [("country","FR",{"eu":True}),("unit","KG",{"family":"mass"}),("vat","VAT20",{"rate":"20.0"})]:
                    self.assertEqual(refs.save(db,kind,code,code,attributes,expected_revision=0,actor="ops")["revision"],1)
                with self.assertRaises(ValueError):
                    refs.save(db,"vat","VAT20","vat",{"rate":"NaN"},expected_revision=1,actor="ops")
                with self.assertRaises(ValueError):
                    refs.save(db,"unit","H","hour",{"family":"time"},expected_revision=0,actor="")
                self.assertNotIn("H",[x["code"] for x in refs.choices(db,"unit")])

    def test_append_and_replay_csv_and_transaction_rollback(self):
        with closing(audit.open_store(":memory:")) as db:
            args = ("=user","connexion","session",{"result":"ok"})
            audit.record(db,*args,event_id="login-1")
            audit.record(db,*args,event_id="login-1")
            with self.assertRaises(ValueError):
                audit.record(db,"other",*args[1:],event_id="login-1")
            with self.assertRaises(RuntimeError), transaction(db):
                audit.record(db,*args,event_id="login-2")
                raise RuntimeError("host write failed")
            self.assertEqual(len(audit.events(db,actor="=user")),1)
            self.assertEqual(audit.events(db,after=1),[])
            for sql in ("UPDATE module_audit SET actor='other'", "DELETE FROM module_audit"):
                with self.assertRaises(sqlite3.IntegrityError):
                    db.execute(sql)
            rows = list(csv.DictReader(io.StringIO(audit.export_csv(db,action="connexion"))))
            self.assertEqual(rows[0]["actor"],"'=user")
            self.assertEqual(rows[0]["event_id"],"login-1")
