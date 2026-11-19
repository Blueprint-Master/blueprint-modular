from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from pathlib import Path
import tempfile
import unittest
from bpm import products, billing, webhooks


class CommerceTest(unittest.TestCase):
    def test_variants_and_concurrent_last_unit(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/"shop.sqlite"
            with closing(products.open_store(path)) as db:
                gtin = products.ean13("400638133393")
                self.assertEqual(gtin,"4006381333931")
                products.save(db,"CHAIR","Chair","Furniture","EUR",999,actor="ops",ean=gtin)
                products.save(db,"BLUE","Blue chair","Furniture","EUR",1099,parent="CHAIR",actor="ops")
                self.assertEqual(products.search(db,parent="CHAIR")[0]["sku"],"BLUE")
                self.assertEqual(products.adjust(db,"BLUE",1,actor="ops",reason="opening",movement_id="initial"),1)
            def reserve(identifier):
                with closing(products.open_store(path)) as db:
                    try:
                        return products.adjust(db,"BLUE",-1,actor="sales",reason="sale",movement_id=identifier)
                    except ValueError:
                        return None
            with ThreadPoolExecutor(max_workers=2) as pool:
                results=list(pool.map(reserve,["order-a","order-b"]))
            self.assertCountEqual(results,[None,0])
            self.assertEqual(reserve(["order-a","order-b"][results.index(0)]),0)
            with closing(products.open_store(path)) as db:
                self.assertEqual(products.get(db,"BLUE")["stock"],0)
                with self.assertRaises(ValueError):
                    products.save(db,"CHAIR","Chair","Furniture","EUR",999,actor="ops",revision=1,active=False)

    def test_quote_adapter_invoice_and_replayed_partial_payment(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp)/"billing.sqlite"
            args = ({"name":"Seller"},{"name":"Customer & Co"},"EUR",[{"label":"<Line>","quantity":3,"unit_minor":105,"vat_basis_points":2000}])
            with closing(billing.open_store(path)) as db:
                number = billing.quote(db,*args,actor="ops",issued="2026-11-19",request_id="q1")
                self.assertEqual(billing.quote(db,*args,actor="ops",issued="2026-11-19",request_id="q1"),number)
                with self.assertRaises(ValueError):
                    billing.request_delivery(db,number,actor="ops",revision=1)
                webhooks.subscribe(db,"MAIL","quote.delivery")
                billing.request_delivery(db,number,actor="ops",revision=1)
                self.assertEqual(billing.quote_details(db,number)["delivery"],"pending")
                webhooks.tick(db,send=lambda *_: 202)
                self.assertEqual(billing.quote_details(db,number)["delivery"],"sent")
                with self.assertRaises(ValueError):
                    billing.revise(db,number,*args,actor="ops",revision=2)
            def accept(_):
                with closing(billing.open_store(path)) as db:
                    return billing.issue_invoice(db,number,actor="sales",issued="2026-11-20",due="2026-12-20")
            with ThreadPoolExecutor(max_workers=2) as pool:
                self.assertEqual(list(pool.map(accept,range(2))),["FA-2026-00001"]*2)
            with closing(billing.open_store(path)) as db:
                invoice="FA-2026-00001"
                for _ in range(2):
                    billing.payment(db,invoice,200,reference="bank-a",paid_on="2026-11-21",actor="finance")
                self.assertEqual(billing.invoice_details(db,invoice)["due_minor"],178)
                with self.assertRaises(ValueError):
                    billing.payment(db,invoice,179,reference="bank-b",paid_on="2026-11-21",actor="finance")
                billing.payment(db,invoice,178,reference="bank-b",paid_on="2026-11-21",actor="finance")
                self.assertEqual(billing.invoice_details(db,invoice)["due_minor"],0)
                html = billing.printable(db,invoice,currency_decimals=2)
                self.assertIn("3.78 EUR",html)
                self.assertIn("&lt;Line&gt;",html)
