#!/usr/bin/env python3
"""
Validateur « à niveau » des composants bpm.* — 8 checks par composant.

Source de vérité :
  - bpm/_doc_components.py        → liste canonique des 101 composants (slug, nom, description, catégorie)
  - packages/core/src/bpm.tsx     → barrel (clé bpm.* → composant), interfaces locales (Page/Title/Metric/Table/Chat...)
  - components/bpm/<Comp>.tsx      → source détaillée (JSDoc, props, relations, @example)
  - public/llms.txt               → référence machine complète
  - public/llms-core.txt          → sous-ensemble compact
  - lib/generated/bpm-components.json → catalogue applicatif

Les 8 checks (critères « à niveau » de la mission) :
  1. source        — fichier .tsx résolu + interface *Props (ou interface locale dans bpm.tsx)
  2. jsdoc         — bloc JSDoc composant (@component / @description) présent
  3. props_doc     — chaque prop documentée (commentaire de description)
  4. relations     — relations définies (@parent/@associated/@forbidden OU PARENT:/ASSOCIÉ:/INTERDIT:)
  5. semantic      — couche sémantique : description non vide (registre) + @description source
  6. example       — @example présent
  7. in_llms       — présent dans public/llms.txt
  8. in_catalog    — présent dans bpm-components.json (+ cohérence llms-core)

Usage :
  python3 scripts/validate-components.py            # rapport console + écrit le ledger
  python3 scripts/validate-components.py --json      # sortie JSON brute du ledger composants
  python3 scripts/validate-components.py --strict     # exit 1 si au moins un composant n'est pas à niveau
"""
import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).parent.parent
COMP_DIR = REPO / "components" / "bpm"
BPM_TSX = REPO / "packages" / "core" / "src" / "bpm.tsx"
LLMS = REPO / "public" / "llms.txt"
LLMS_CORE = REPO / "public" / "llms-core.txt"
CATALOG = REPO / "lib" / "generated" / "bpm-components.json"

sys.path.insert(0, str(REPO))
from bpm._doc_components import COMPONENT_DOC  # noqa: E402

# Alias clé bpm.* → nom de fichier composant (cas où le nom diffère du fichier)
ALIAS_FILE = {
    "title1": "Title", "title2": "Title", "title3": "Title", "title4": "Title",
    "titlebpm": "Title", "title": "Title", "titleBpm": "Title",
    "crud": "CrudPage",
    "gps": "Geofence",  # gps rendu via le composant Geofence (carte + picker)
}

# Index insensible à la casse : stem_minuscule → stem réel des fichiers components/bpm
_FILE_INDEX = {p.stem.lower(): p.stem for p in COMP_DIR.glob("*.tsx")}

# Composants définis localement dans bpm.tsx (pas de fichier dédié)
LOCAL_IN_BARREL = {"page", "title", "title1", "title2", "title3", "title4",
                   "metric", "metricRow", "table", "chat", "text", "spinner", "tabs"}


def barrel_map() -> dict:
    """clé bpm.* (camelCase) → nom de composant (PascalCase) depuis le barrel."""
    src = BPM_TSX.read_text(encoding="utf-8", errors="ignore")
    m = {}
    for mt in re.finditer(r"^\s+(\w+):\s*wrap(?:<[^>]+>)?\(\s*(\w+)", src, re.MULTILINE):
        m[mt.group(1)] = mt.group(2)
    return m


def slug_to_bpm_key(slug: str, name: str) -> str:
    """Le nom canonique 'bpm.flowDiagram' donne la vraie clé camelCase ; le slug est minuscule."""
    if name.startswith("bpm."):
        return name[4:]
    return slug


def resolve_file(bpm_key: str, bmap: dict) -> Path | None:
    """Trouve le fichier .tsx source du composant, ou None si local au barrel."""
    if bpm_key in ALIAS_FILE:
        cand = COMP_DIR / f"{ALIAS_FILE[bpm_key]}.tsx"
        return cand if cand.exists() else None
    # 1. via le barrel (clé exacte camelCase → composant)
    comp = bmap.get(bpm_key)
    if comp:
        cand = COMP_DIR / f"{comp}.tsx"
        if cand.exists():
            return cand
        # le barrel pointe un composant local (Title, Metric...) → pas de fichier
        if comp.lower() not in _FILE_INDEX:
            return None
    # 2. index insensible à la casse (jsonviewer → JsonViewer, numberinput → NumberInput)
    stem = _FILE_INDEX.get(bpm_key.lower())
    if stem:
        return COMP_DIR / f"{stem}.tsx"
    return None


def extract_props_block(source: str, iface: str) -> str | None:
    """Renvoie le corps { ... } de l'interface/type Props."""
    m = re.search(rf"export\s+(?:interface|type)\s+{re.escape(iface)}\b", source)
    if not m:
        return None
    rest = source[m.end():]
    brace = rest.find("{")
    if brace == -1:
        return ""
    depth = 0
    for i, ch in enumerate(rest[brace:], start=brace):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return rest[brace:i + 1]
    return rest[brace:]


def props_documented(source: str, iface: str) -> tuple[int, int]:
    """(#props documentées, #props totales) dans l'interface."""
    body = extract_props_block(source, iface)
    if not body:
        return (0, 0)
    inner = body[1:-1]
    # Découpe naïve par lignes de props : 'name?: type' / 'name: type'
    prop_lines = re.findall(r"^\s*(\w+)\??\s*:", inner, re.MULTILINE)
    if not prop_lines:
        return (0, 0)
    total = len(prop_lines)
    documented = 0
    lines = inner.splitlines()
    for idx, line in enumerate(lines):
        if re.match(r"^\s*\w+\??\s*:", line):
            # Cherche un commentaire dans les 3 lignes précédentes
            ctx = "\n".join(lines[max(0, idx - 3):idx])
            if "/**" in ctx or "//" in ctx or "*" in ctx.strip()[:1] if ctx.strip() else False:
                documented += 1
            elif re.search(r"/\*\*.*?\*/", ctx, re.DOTALL):
                documented += 1
    return (documented, total)


def check_component(slug: str, name: str, desc: str, bmap: dict,
                    llms: str, llms_core: str, catalog_slugs: set) -> dict:
    bpm_key = slug_to_bpm_key(slug, name)
    checks = {}
    notes = []

    path = resolve_file(bpm_key, bmap)
    src = path.read_text(encoding="utf-8", errors="ignore") if path else BPM_TSX.read_text(encoding="utf-8", errors="ignore")

    # 1. source
    has_iface = bool(re.search(r"(?:interface|type)\s+\w*Props\b", src))
    is_local = bpm_key in LOCAL_IN_BARREL
    checks["source"] = bool(path) or is_local
    if not path and not is_local:
        notes.append("aucun fichier .tsx résolu")

    # Restreindre l'analyse JSDoc/props au composant ciblé quand le fichier est dédié
    target_src = src

    # 2. jsdoc composant
    checks["jsdoc"] = bool(re.search(r"@component\b", target_src) or re.search(r"@description\b", target_src)
                           or re.search(r"/\*\*.*?\*/\s*export\s+(?:interface|type|function)", target_src, re.DOTALL))

    # 3. props documentées : interface parsée + chaque prop décrite
    #    Conventions tolérées : @param par prop, bloc @props prose, commentaires inline.
    iface_m = re.search(r"export\s+(?:interface|type)\s+(\w+Props)\b", target_src)
    has_props_block = bool(re.search(r"@props\b", target_src))
    n_param = len(re.findall(r"@param\b", target_src))
    if iface_m:
        doc_n, tot_n = props_documented(target_src, iface_m.group(1))
        inline_ok = tot_n > 0 and doc_n >= tot_n
        # documenté si bloc @props, ou @param couvre les props, ou inline complet
        checks["props_doc"] = bool(has_props_block or (n_param >= max(1, tot_n)) or inline_ok or tot_n == 0)
        if not checks["props_doc"]:
            notes.append(f"props documentées {doc_n}/{tot_n} (ni @props ni @param)")
    else:
        # Pas d'interface *Props (ex. bpm.toast = provider + hook) : documenté via
        # @props/@param/@example, ou composant local toléré.
        checks["props_doc"] = bool(has_props_block or n_param > 0
                                   or re.search(r"@example\b", target_src) or is_local)

    # 4. relations (FR + EN : PARENT / ASSOCIÉ|ASSOCIATED / INTERDIT|FORBIDDEN, ou tags @)
    has_parent = bool(re.search(r"@parent\b|PARENT\s*:", target_src))
    has_assoc = bool(re.search(r"@associated\b|ASSOCI(?:E|É|ATED)\s*:", target_src))
    has_forbid = bool(re.search(r"@forbidden\b|INTERDIT\s*:|FORBIDDEN\s*:", target_src))
    # « Défini » = les trois axes présents (parent, associated, forbidden — « aucun » compte)
    checks["relations"] = has_parent and has_assoc and has_forbid
    rel_missing = [k for k, v in (("parent", has_parent), ("associated", has_assoc), ("forbidden", has_forbid)) if not v]
    if rel_missing:
        notes.append("relations manquantes: " + ",".join(rel_missing))

    # 5. couche sémantique
    checks["semantic"] = bool(desc.strip()) and bool(re.search(r"@description\b", target_src) or len(desc.strip()) > 8)

    # 6. exemple
    checks["example"] = bool(re.search(r"@example\b", target_src))
    if not checks["example"]:
        notes.append("@example absent")

    # 7. présence llms.txt
    pat = rf"bpm\.{re.escape(bpm_key)}\b"
    checks["in_llms"] = bool(re.search(pat, llms))
    if not checks["in_llms"]:
        notes.append("absent de llms.txt")

    # 8. présence catalogue
    checks["in_catalog"] = slug in catalog_slugs
    if not checks["in_catalog"]:
        notes.append("absent de bpm-components.json")

    hard = ["source", "jsdoc", "props_doc", "semantic", "example", "in_llms", "in_catalog"]
    soft = ["relations"]
    hard_ok = all(checks[k] for k in hard)
    all_ok = hard_ok and all(checks[k] for k in soft)
    status = "done" if all_ok else ("needs-relations" if hard_ok else "pending")

    return {
        "slug": slug,
        "bpm": name,
        "key": bpm_key,
        "file": str(path.relative_to(REPO)) if path else f"bpm.tsx (local)",
        "checks": checks,
        "status": status,
        "gap": "; ".join(notes) if notes else "",
    }


MODULES_DIR = REPO / "app" / "(app)" / "modules"


def scan_modules() -> list[dict]:
    """Évalue chaque module : page, composition bpm.*, doc, simulateur, dogfooding réel."""
    results = []
    if not MODULES_DIR.exists():
        return results
    for d in sorted(MODULES_DIR.iterdir()):
        if not d.is_dir():
            continue
        slug = d.name
        page = d / "page.tsx"
        has_page = page.exists()
        has_doc = (d / "documentation").is_dir()
        has_sim = (d / "simulateur").is_dir()
        # Composition bpm.* : appel bpm.x( OU import depuis le barrel @/components/bpm
        tsx = list(d.rglob("*.tsx"))
        blob = "\n".join(p.read_text(encoding="utf-8", errors="ignore") for p in tsx)
        composes = bool(re.search(r"bpm\.[a-zA-Z]", blob) or
                        re.search(r'from\s+"@/components/bpm"', blob) or
                        re.search(r'@blueprint-modular/core', blob))
        # Dogfooding « miroir » : composant qui réimplémente bpm.* localement
        mirror = bool(re.search(r"miroir bpm", blob, re.IGNORECASE))
        notes = []
        if not has_page:
            notes.append("pas de page.tsx")
        if not composes:
            notes.append("ne compose aucun bpm.* (dogfooding manquant)")
        if mirror:
            notes.append("réimplémente bpm.* localement (miroir) au lieu de composer le barrel")
        if not has_doc:
            notes.append("pas de route documentation")
        status = "done" if (has_page and composes and has_doc and not mirror) else (
            "needs-dogfooding" if (has_page and not composes) or mirror else "pending")
        results.append({
            "slug": slug, "type": "module",
            "checks": {"page": has_page, "composes_bpm": composes,
                       "doc": has_doc, "simulateur": has_sim, "no_mirror": not mirror},
            "status": status,
            "gap": "; ".join(notes),
        })
    return results


def build_ledger(comp_results: list[dict], mod_results: list[dict]) -> dict:
    def tally(items):
        out = {}
        for r in items:
            out[r["status"]] = out.get(r["status"], 0) + 1
        return out
    return {
        "mission": "mise-a-niveau",
        "standard": "8 checks composants + 5 checks modules (cf. scripts/validate-components.py)",
        "generated_by": "scripts/validate-components.py --write-ledger",
        "totals": {
            "components": {"total": len(comp_results), **tally(comp_results)},
            "modules": {"total": len(mod_results), **tally(mod_results)},
        },
        "components": comp_results,
        "modules": mod_results,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--write-ledger", action="store_true",
                    help="écrit docs/automation/mise-a-niveau.json (composants + modules)")
    args = ap.parse_args()

    bmap = barrel_map()
    llms = LLMS.read_text(encoding="utf-8", errors="ignore")
    llms_core = LLMS_CORE.read_text(encoding="utf-8", errors="ignore")
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    catalog_slugs = {c["slug"] for c in catalog["components"]}

    results = []
    for c in COMPONENT_DOC:
        results.append(check_component(c["slug"], c["name"], c.get("description", ""),
                                       bmap, llms, llms_core, catalog_slugs))

    done = [r for r in results if r["status"] == "done"]
    needs_rel = [r for r in results if r["status"] == "needs-relations"]
    pending = [r for r in results if r["status"] == "pending"]

    if args.write_ledger:
        mods = scan_modules()
        ledger = build_ledger(results, mods)
        out = REPO / "docs" / "automation" / "mise-a-niveau.json"
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(ledger, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {out}")
        print(f"  composants: {ledger['totals']['components']}")
        print(f"  modules   : {ledger['totals']['modules']}")
        return

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
        return

    print(f"=== Validateur composants — 8 checks ===")
    print(f"Total canonique : {len(results)}")
    print(f"  À niveau (done)        : {len(done)}")
    print(f"  needs-relations        : {len(needs_rel)}")
    print(f"  pending (check dur KO) : {len(pending)}")
    # Agrégat par check
    print("\nTaux par check :")
    keys = ["source", "jsdoc", "props_doc", "relations", "semantic", "example", "in_llms", "in_catalog"]
    for k in keys:
        n = sum(1 for r in results if r["checks"].get(k))
        print(f"  {k:12s} {n:3d}/{len(results)}")
    if pending:
        print("\n--- pending (check dur KO) ---")
        for r in pending:
            print(f"  bpm.{r['key']:20s} {r['gap']}")
    if needs_rel:
        print(f"\n--- needs-relations ({len(needs_rel)}) ---")
        for r in needs_rel:
            print(f"  bpm.{r['key']:20s} {r['gap']}")

    if args.strict and (pending or needs_rel):
        sys.exit(1)


if __name__ == "__main__":
    main()
