from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from pathlib import Path
import tempfile
import unittest

from bpm import forms

PURCHASE = {"id":"orders","fields":[
    {"id":"amount","type":"number","required":True},
    {"id":"approval","type":"select","required":True,"options":[{"value":"cfo"}],
     "visibleIf":{"field":"amount","operator":"greaterThan","value":1000}},
    {"id":"start","type":"date"},{"id":"end","type":"date"}],"dateRange":{"start":"start","end":"end"}}


class FormsTest(unittest.TestCase):
    def test_validation_uses_visible_fields_choices_threshold_and_dates(self):
        self.assertEqual(forms.validate(PURCHASE, {"amount":"1000","approval":"old"}), {"amount":"1000"})
        for payload in [{"amount":1001},{"amount":1001,"approval":"unknown"},{"amount":False},{"amount":"NaN"},
                        {"amount":10,"start":"2026-11-19","end":"2026-11-12"},{"amount":1,"unexpected":True}]:
            with self.assertRaises(ValueError):
                forms.validate(PURCHASE,payload)

    def test_pinned_definition_and_single_review_after_restart(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/"application.sqlite"
            with closing(forms.open_store(path)) as db:
                self.assertEqual(forms.publish(db,PURCHASE,expected_version=0),1)
                for _ in range(2):
                    forms.submit(db,"orders",1,{"amount":1200,"approval":"cfo"},requester="sales",request_id="p42")
                self.assertEqual(forms.publish(db,dict(PURCHASE,title="Order"),expected_version=1),2)
            def review(status):
                with closing(forms.open_store(path)) as db:
                    try:
                        forms.review(db,"p42",status,reviewer="finance")
                        return 1
                    except ValueError:
                        return 0
            with ThreadPoolExecutor(max_workers=2) as pool:
                self.assertEqual(sum(pool.map(review,["approved","rejected"])),1)
            with closing(forms.open_store(path)) as db:
                self.assertEqual(forms.get(db,"p42")["version"],1)
                self.assertEqual(forms.definition(db,"orders",1),PURCHASE)
                self.assertEqual(len(forms.audit.events(db,entity="submission/p42")),2)
