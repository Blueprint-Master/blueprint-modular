import io
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from pathlib import Path

from bpm import reports


class ReportsTest(unittest.TestCase):
    def test_snapshots_and_replayed_concurrent_generation(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "reports.sqlite"
            orders = [{"date": "2026-10-01", "amount": "12.35", "region": "=West"},
                      {"date": "2026-10-31", "amount": "-1.25", "region": "=West"},
                      {"date": "2026-11-01", "amount": "100", "region": "Other"}]
            def create(_):
                with closing(reports.open_store(path)) as db:
                    return reports.generate(db, "regional-orders", "2026-10-01", "2026-10-31", orders,
                                            author="Ops", request_id="october")
            with ThreadPoolExecutor(max_workers=2) as pool:
                self.assertEqual(list(pool.map(create, range(2))), ["october", "october"])
            with closing(reports.open_store(path)) as db:
                self.assertEqual(reports.snapshot(db, "october")["rows"], [["=West", 2, "11.10", "5.55"]])
                self.assertIn("'=West;2;11.10;5.55", reports.export_csv(db, "october").decode("utf-8-sig"))
                self.assertEqual(reports.build("monthly-revenue","2026-10-01","2026-10-31",orders)["rows"], [["2026-10","11.10"]])
                with self.assertRaises(ValueError):
                    reports.generate(db,"regional-orders","2026-10-01","2026-10-31",[],author="Ops",request_id="october")
                self.assertEqual(db.execute("SELECT COUNT(*) FROM generated_reports").fetchone()[0], 1)

    def test_headcount_at_close_accounts_for_transfers_and_leavers(self):
        rows = [{"employee": "A", "department": "Ops", "date": "2025-06-12", "fte": 1},
                {"employee": "B", "department": "Ops", "date": "2025-06-12", "fte": 1},
                {"employee": "B", "department": "QA", "date": "2026-05-01", "fte": "0.5"},
                {"employee": "A", "department": "Ops", "date": "2026-05-01", "fte": 0}]
        report = reports.build("department-headcount","2026-01-01","2026-06-30",reversed(rows))
        self.assertEqual(report["rows"], [["QA", 1, "0.5"]])
        with self.assertRaises(ValueError):
            reports.build("department-headcount","2026-01-01","2026-06-30", rows+[dict(rows[-1], fte=1)])

    def test_input_headers_and_superseded_observations(self):
        with self.assertRaises(ValueError):
            reports.csv_rows(io.StringIO("date,amount,amount"), "monthly-revenue")
        with self.assertRaises(ValueError):
            reports.csv_rows(io.StringIO("date,price"), "monthly-revenue")
        self.assertEqual(list(reports.csv_rows(io.StringIO("date,amount"), "monthly-revenue")), [])
        obs = {"date": "2026-05-01", "employee": "A", "department": "Sales", "fte": 1}
        observations = [obs, dict(obs, fte=0), dict(obs, date="2026-05-02")]
        for rows in (observations, reversed(observations)):
            result = reports.build("department-headcount", "2026-01-01", "2026-05-31", rows)
            self.assertEqual(result["rows"], [["Sales", 1, "1"]])
