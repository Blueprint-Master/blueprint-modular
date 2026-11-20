"""Create durable quotes, issue immutable invoices and record payment references."""
from datetime import date
from decimal import Decimal, ROUND_HALF_UP
from hashlib import sha256
import json
import re
import time

from . import audit, webhooks
from ._module_store import connect, transaction

SCHEMA = """
CREATE TABLE IF NOT EXISTS commercial_sequence (
 kind TEXT, year INTEGER, last INTEGER NOT NULL, PRIMARY KEY(kind,year)
);
CREATE TABLE IF NOT EXISTS quotes (
 number TEXT PRIMARY KEY, request_id TEXT NOT NULL UNIQUE, original TEXT NOT NULL, document TEXT NOT NULL,
 status TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, delivery_event TEXT
);
CREATE TABLE IF NOT EXISTS invoices (
 number TEXT PRIMARY KEY, quote TEXT UNIQUE NOT NULL REFERENCES quotes(number), issued TEXT NOT NULL,
 due TEXT NOT NULL, document TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS invoice_payments (
 reference TEXT PRIMARY KEY, invoice TEXT NOT NULL REFERENCES invoices(number), amount INTEGER NOT NULL,
 paid_on TEXT NOT NULL, actor TEXT NOT NULL
);
"""


def open_store(path):
    return connect(path, audit.SCHEMA + webhooks.SCHEMA + SCHEMA)


def encode(data):
    return json.dumps(data, sort_keys=True, ensure_ascii=False, allow_nan=False, separators=(",", ":"))


def next_number(db, kind, day):
    year = date.fromisoformat(day).year
    db.execute("INSERT INTO commercial_sequence VALUES(?,?,1) ON CONFLICT(kind,year) DO UPDATE SET last=last+1",(kind,year))
    value = db.execute("SELECT last FROM commercial_sequence WHERE kind=? AND year=?",(kind,year)).fetchone()[0]
    return f"{kind}-{year}-{value:05d}"


def document(issuer, customer, currency, lines, *, terms=""):
    if not re.fullmatch(r"[A-Z]{3}",currency) or not isinstance(terms,str) or not isinstance(lines,list) or not lines:
        raise ValueError("Expected a currency and one or more lines")
    for party in (issuer,customer):
        if not isinstance(party,dict) or not isinstance(party.get("name"),str) or not party["name"].strip():
            raise ValueError("Issuer and customer names required")
    frozen = []
    subtotal = tax_total = 0
    for line in lines:
        label,qty,unit,rate = (line[k] for k in ("label","quantity","unit_minor","vat_basis_points"))
        if not isinstance(label,str) or not label.strip() or type(qty) is not int or not 0 < qty <= 10**9:
            raise ValueError("Expected a named line and positive integral quantity")
        if type(unit) is not int or not 0 <= unit <= 10**12 or type(rate) is not int or not 0 <= rate <= 10000:
            raise ValueError("Invalid unit price or tax rate")
        discount = line.get("discount_basis_points",0)
        if type(discount) is not int or not 0 <= discount <= 10000:
            raise ValueError("Invalid line discount")
        net = int((Decimal(qty)*unit*(10000-discount)/10000).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
        tax = int((Decimal(net)*rate/10000).quantize(Decimal("1"),rounding=ROUND_HALF_UP))
        subtotal += net
        tax_total += tax
        frozen.append(dict(label=label.strip(),quantity=qty,unit_minor=unit,vat_basis_points=rate,discount_basis_points=discount,net_minor=net,tax_minor=tax))
    if subtotal+tax_total > 10**15:
        raise ValueError("Document exceeds supported total")
    return dict(issuer=issuer,customer=customer,currency=currency,terms=terms,lines=frozen,net_minor=subtotal,
                tax_minor=tax_total,total_minor=subtotal+tax_total)


def quote(db, issuer, customer, currency, lines, *, actor, request_id, issued, terms=""):
    if not isinstance(request_id,str) or not request_id.strip():
        raise ValueError("Request ID required")
    day = date.fromisoformat(issued).isoformat()
    data = encode(document(issuer,customer,currency,lines,terms=terms))
    original = encode([data,actor,day])
    with transaction(db):
        old = db.execute("SELECT number,original FROM quotes WHERE request_id=?", (request_id,)).fetchone()
        if old:
            if old["original"] != original:
                raise ValueError("Quote request ID conflict")
            return old["number"]
        number = next_number(db,"DV",day)
        db.execute("INSERT INTO quotes(number,request_id,original,document,status) VALUES(?,?,?,?,'draft')",(number,request_id,original,data))
        audit.record(db,actor,"creation",number,{"issued":day})
        return number


def revise(db, number, issuer, customer, currency, lines, *, actor, revision, terms=""):
    data = encode(document(issuer,customer,currency,lines,terms=terms))
    with transaction(db):
        if not db.execute("UPDATE quotes SET document=?, revision=revision+1 WHERE number=? AND status='draft' AND revision=?",
                          (data,number,revision)).rowcount:
            raise ValueError("Quote locked or stale")
        audit.record(db,actor,"modification",number,{"revision":revision+1})


def request_delivery(db, number, *, actor, revision):
    """Queue the document for the operator's delivery adapter. The worker stores its receipt."""
    with transaction(db):
        row = db.execute("SELECT * FROM quotes WHERE number=?", (number,)).fetchone()
        if row is None:
            raise KeyError(number)
        if row["delivery_event"]:
            return row["delivery_event"]
        if row["revision"] != revision or row["status"] != "draft":
            raise ValueError("Quote locked or stale")
        hooks = list(db.execute("SELECT name FROM hook WHERE event='quote.delivery' AND paused=0 AND deleted=0"))
        if len(hooks) != 1:
            raise ValueError("Configure one active quote.delivery adapter")
        event = "quote-" + sha256(number.encode()).hexdigest()
        webhooks.publish(db,event,"quote.delivery",{"number":number,"document":json.loads(row["document"])},int(time.time()))
        db.execute("UPDATE dispatch SET status='cancelled' WHERE event_id=? AND hook!=?",(event,hooks[0]["name"]))
        db.execute("UPDATE quotes SET status='queued',delivery_event=?,revision=revision+1 WHERE number=?",(event,number))
        audit.record(db,actor,"modification",number,{"status":"queued"})
        return event


def issue_invoice(db, number, *, actor, issued, due):
    """Issue on customer acceptance. Shared request retries return the same invoice."""
    day, due_day = date.fromisoformat(issued), date.fromisoformat(due)
    if due_day < day:
        raise ValueError("Invoice due date precedes issue date")
    with transaction(db):
        old = db.execute("SELECT * FROM invoices WHERE quote=?", (number,)).fetchone()
        if old:
            if (old["issued"],old["due"]) != (day.isoformat(),due_day.isoformat()):
                raise ValueError("An invoice with different dates already exists")
            return old["number"]
        row = db.execute("SELECT document,original FROM quotes WHERE number=?", (number,)).fetchone()
        if row is None:
            raise KeyError(number)
        if day < date.fromisoformat(json.loads(row["original"])[2]):
            raise ValueError("Invoice predates quote")
        invoice = next_number(db,"FA",day.isoformat())
        db.execute("INSERT INTO invoices VALUES(?,?,?,?,?)", (invoice,number,day.isoformat(),due_day.isoformat(),row["document"]))
        db.execute("UPDATE quotes SET status='accepted',revision=revision+1 WHERE number=?", (number,))
        audit.record(db,actor,"creation",invoice,{"quote":number,"issued":day.isoformat()})
        return invoice


def invoice_details(db, number):
    row = db.execute("SELECT * FROM invoices WHERE number=?", (number,)).fetchone()
    if not row:
        raise KeyError(number)
    doc = json.loads(row["document"])
    paid = db.execute("SELECT COALESCE(SUM(amount),0) FROM invoice_payments WHERE invoice=?", (number,)).fetchone()[0]
    return dict(row,document=doc,paid_minor=paid,due_minor=doc["total_minor"]-paid)


def payment(db, invoice, amount_minor, *, reference, paid_on, actor):
    day = date.fromisoformat(paid_on).isoformat()
    if type(amount_minor) is not int or amount_minor <= 0 or not isinstance(reference,str) or not reference.strip():
        raise ValueError("Positive payment and reference required")
    with transaction(db):
        old = db.execute("SELECT invoice,amount,paid_on,actor FROM invoice_payments WHERE reference=?", (reference,)).fetchone()
        if old:
            if tuple(old) != (invoice,amount_minor,day,actor):
                raise ValueError("Payment reference conflict")
            return
        details = invoice_details(db,invoice)
        if day < details["issued"] or amount_minor > details["due_minor"]:
            raise ValueError("Payment date or amount outside invoice bounds")
        db.execute("INSERT INTO invoice_payments VALUES(?,?,?,?,?)",(reference,invoice,amount_minor,day,actor))
        audit.record(db,actor,"modification",invoice,{"payment":reference,"amount_minor":amount_minor})


def quote_details(db, number):
    row = db.execute("SELECT number,document,status,revision,delivery_event,original FROM quotes WHERE number=?", (number,)).fetchone()
    if row is None:
        raise KeyError(number)
    delivery = None
    if row["delivery_event"]:
        result = db.execute("SELECT status FROM dispatch WHERE event_id=? AND status!='cancelled'",(row["delivery_event"],)).fetchone()
        delivery = result["status"] if result else "cancelled"
    return {"number":number, "document":json.loads(row["document"]), "status":row["status"], "revision":row["revision"],
            "issued":json.loads(row["original"])[2], "delivery":delivery}


def printable(db, number, *, currency_decimals):
    """Generate UTF-8 HTML for browser printing using the currency precision supplied by the host."""
    from html import escape
    if type(currency_decimals) is not int or not 0 <= currency_decimals <= 9:
        raise ValueError("Expected currency decimal places between 0 and 9")
    record = invoice_details(db,number) if number.startswith("FA-") else quote_details(db,number)
    doc = record["document"]
    def money(amount):
        value = Decimal(amount).scaleb(-currency_decimals)
        return f'{value:.{currency_decimals}f} {doc["currency"]}'
    def party(data):
        return "<br>".join(escape(str(value)) for value in data.values())
    lines = "".join("<tr>"+"".join(f"<td>{escape(str(x))}</td>" for x in
                    (line["label"],line["quantity"],money(line["unit_minor"]),f'{line["discount_basis_points"]/100:.2f}%',money(line["net_minor"]),f'{line["vat_basis_points"]/100:.2f}%',money(line["tax_minor"])))+"</tr>"
                    for line in doc["lines"])
    return (f'<!doctype html><html lang="en"><meta charset="utf-8"><title>{escape(number)}</title><h1>{escape(number)}</h1>'
            f'<p>Issued {record["issued"]}</p>' + (f'<p>Due {record["due"]}</p>' if "due" in record else "")
            + f'<h2>From</h2><p>{party(doc["issuer"])}</p><h2>To</h2><p>{party(doc["customer"])}</p>'
            + f'<table><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Discount</th><th>Net</th><th>VAT</th><th>Tax</th></tr></thead><tbody>{lines}</tbody></table>'
            + f'<p>Net {money(doc["net_minor"])} · Tax {money(doc["tax_minor"])} · Total {money(doc["total_minor"])}</p>'
            + f'<p>{escape(doc["terms"])}</p></html>')
