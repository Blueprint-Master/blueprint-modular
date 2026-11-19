"""Maintain versioned products and variants and post replayable inventory movements."""
import re
from . import audit
from ._module_store import connect, transaction

SCHEMA = """
CREATE TABLE IF NOT EXISTS products (
 sku TEXT PRIMARY KEY, parent TEXT REFERENCES products(sku), name TEXT NOT NULL, category TEXT NOT NULL,
 currency TEXT NOT NULL, price_minor INTEGER NOT NULL, ean TEXT UNIQUE, stock INTEGER NOT NULL DEFAULT 0,
 active INTEGER NOT NULL DEFAULT 1, revision INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS stock_movements (
 id TEXT PRIMARY KEY, sku TEXT NOT NULL REFERENCES products(sku), delta INTEGER NOT NULL,
 actor TEXT NOT NULL, reason TEXT NOT NULL, balance INTEGER NOT NULL
);
"""
MAX_AMOUNT = 10**15


def open_store(path):
    return connect(path, audit.SCHEMA + SCHEMA)


def ean13(prefix):
    if not isinstance(prefix,str) or not re.fullmatch(r"[0-9]{12}",prefix):
        raise ValueError("Expected twelve supplied EAN digits")
    check = -sum(int(v)*(1 if i%2==0 else 3) for i,v in enumerate(prefix))%10
    return prefix+str(check)


def get(db, sku):
    row = db.execute("SELECT * FROM products WHERE sku=?", (sku,)).fetchone()
    if row is None:
        raise KeyError(sku)
    return dict(row, active=bool(row["active"]))


def save(db, sku, name, category, currency, price_minor, *, actor, revision=0, parent=None, ean=None, active=True):
    if not all(isinstance(v,str) and v.strip() for v in (sku,name,category)) or not re.fullmatch(r"[A-Z]{3}",currency):
        raise ValueError("Invalid product identification")
    if type(price_minor) is not int or not 0 <= price_minor <= MAX_AMOUNT or type(active) is not bool:
        raise ValueError("Invalid price or active flag")
    if ean is not None and (not isinstance(ean,str) or len(ean)!=13 or ean13(ean[:12])!=ean):
        raise ValueError("Invalid EAN-13 check digit")
    with transaction(db):
        if parent is not None:
            base = get(db,parent)
            if parent == sku or base["parent"] is not None or not base["active"] or base["currency"] != currency:
                raise ValueError("A variant requires an active parent with matching currency")
        if not active and db.execute("SELECT 1 FROM products WHERE parent=? AND active=1", (sku,)).fetchone():
            raise ValueError("Retire active variants first")
        if revision == 0:
            changed = db.execute("INSERT INTO products(sku,name,category,currency,price_minor,parent,ean,active) VALUES(?,?,?,?,?,?,?,?) "
                                 "ON CONFLICT(sku) DO NOTHING",(sku,name.strip(),category.strip(),currency,price_minor,parent,ean,int(active))).rowcount
        else:
            old = get(db,sku)
            if old["parent"] != parent or old["currency"] != currency:
                raise ValueError("Product parent and currency cannot change")
            changed = db.execute("UPDATE products SET name=?,category=?,price_minor=?,ean=?,active=?,revision=revision+1 WHERE sku=? AND revision=?",
                                 (name.strip(),category.strip(),price_minor,ean,int(active),sku,revision)).rowcount
        if not changed:
            raise ValueError("Product revision conflict")
        result = get(db,sku)
        audit.record(db,actor,"creation" if revision==0 else "modification","product/"+sku,result)
        return result


def adjust(db, sku, delta, *, actor, reason, movement_id):
    if type(delta) is not int or not 0 < abs(delta) <= MAX_AMOUNT or not all(isinstance(x,str) and x.strip() for x in (actor,reason,movement_id)):
        raise ValueError("Expected nonzero integral quantity and movement identification")
    with transaction(db):
        old = db.execute("SELECT * FROM stock_movements WHERE id=?", (movement_id,)).fetchone()
        if old:
            if (old["sku"],old["delta"],old["actor"],old["reason"]) != (sku,delta,actor,reason):
                raise ValueError("Movement ID already used")
            return old["balance"]
        changed = db.execute("UPDATE products SET stock=stock+?,revision=revision+1 WHERE sku=? AND active=1 AND stock+? BETWEEN 0 AND ?",
                             (delta,sku,delta,MAX_AMOUNT)).rowcount
        if not changed:
            raise ValueError("Inactive or missing product, or insufficient stock or capacity")
        balance = get(db,sku)["stock"]
        db.execute("INSERT INTO stock_movements VALUES(?,?,?,?,?,?)", (movement_id,sku,delta,actor,reason,balance))
        audit.record(db,actor,"modification","product/"+sku,{"movement":movement_id,"delta":delta,"balance":balance,"reason":reason})
        return balance


def search(db, *, text="", category=None, parent=None, include_inactive=False):
    return [dict(r) for r in db.execute("SELECT * FROM products WHERE (active=1 OR ?) AND (? IS NULL OR category=?) "
                                       "AND (? IS NULL OR parent=?) AND (INSTR(lower(name),lower(?)) OR INSTR(lower(sku),lower(?)) OR ean=?) "
                                       "ORDER BY name,sku", (int(include_inactive),category,category,parent,parent,text,text,text))]
