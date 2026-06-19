#!/usr/bin/env python3
"""
gate-catalogue-convergence.py
Bloque toute divergence entre le catalogue MCP et sa source TS.

Invariant garanti (cf. audit + PR1) :
    set(catalogue)  ==  set(exports publics bpm.*)  −  set(internes connus)

- exports publics bpm.*  : extraits du barrel packages/core/src/bpm.tsx.
- internes connus        : sous-composants non exportés publiquement
                           (popovers, *Leaflet, variantes *Analytics/*Classic…).
- catalogue              : lib/generated/bpm-components.json (dérivé en PR1).

RÉUTILISATION (source unique) : le filtre internes ET l'extracteur du barrel
sont IMPORTÉS de scripts/generate-bpm-components-json.py (le générateur de PR1).
On ne redéfinit AUCUNE liste codée en dur ici — sinon elle pourrait diverger du
générateur, ce qui réintroduirait le bug que ce gate doit empêcher. La
comparaison est strictement TS ↔ catalogue ; le registre Python historique
(_doc_components.py) n'intervient JAMAIS comme source de vérité.

Échec (exit 1) si :
  - un composant public exporté sur bpm.* est absent du catalogue (TS \\ CAT) ;
  - une entrée du catalogue n'a pas de pendant exporté sur le barrel (CAT \\ TS).

Garde optionnelle (warning, jamais d'échec) : alerte si le nombre d'entrées
"curated" du registre MCP a diminué sous une référence — détecte une perte
accidentelle de curation.

Run depuis la racine du repo :
  python scripts/gate-catalogue-convergence.py
"""
import importlib.util
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
GENERATOR = REPO_ROOT / "scripts" / "generate-bpm-components-json.py"
CATALOGUE = REPO_ROOT / "lib" / "generated" / "bpm-components.json"
MCP_REGISTRY = REPO_ROOT / "lib" / "generated" / "mcp-registry.json"

# Compteur de référence de curation (entrées "curated" du registre MCP).
# Garde de NON-RÉGRESSION : warning si on descend en dessous, jamais d'échec.
# À relever volontairement (avec la PR qui ajoute de la curation), jamais à
# baisser pour masquer une perte. 101 après PR1 ; 109 après CAT-3 (curation des
# 8 primitives : metricRow, toggle, gantt, scheduler, heatmap, funnelChart,
# pivotTable, radarChart).
CURATED_BASELINE = 109


def load_generator():
    """Importe le générateur de PR1 (main() gardé par __main__ → sans effet de
    bord) pour réutiliser SON filtre internes et SON extracteur de barrel."""
    spec = importlib.util.spec_from_file_location("_bpm_gen", GENERATOR)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def main() -> int:
    print("── Catalogue convergence (catalogue ⊆ barrel TS) ───")

    gen = load_generator()
    extract_barrel_components = gen.load_barrel_extractor()

    # set_TS = exports publics bpm.* (barrel) − internes connus.
    # On réutilise les MÊMES objets que le générateur (aucune liste dupliquée).
    barrel = extract_barrel_components(gen.BPM_TSX)
    public = [n for n in barrel if n not in gen.INTERNAL_COMPONENTS]
    set_ts = {f"bpm.{n}" for n in public}

    # set_CAT = noms du catalogue dérivé.
    catalogue = json.loads(CATALOGUE.read_text(encoding="utf-8"))["components"]
    set_cat = {c["name"] for c in catalogue}

    missing_from_catalogue = sorted(set_ts - set_cat)  # exporté mais hors catalogue
    orphan_in_catalogue = sorted(set_cat - set_ts)      # catalogue sans source TS

    ok = True

    if missing_from_catalogue:
        ok = False
        print(
            f"  [FAIL] {len(missing_from_catalogue)} composant(s) exporté(s) sur bpm.* "
            f"ABSENT(S) du catalogue (TS \\ CAT) :"
        )
        for name in missing_from_catalogue:
            print(f"         - {name}")

    if orphan_in_catalogue:
        ok = False
        print(
            f"  [FAIL] {len(orphan_in_catalogue)} entrée(s) de catalogue SANS export "
            f"sur le barrel (CAT \\ TS) :"
        )
        for name in orphan_in_catalogue:
            print(f"         - {name}")

    if ok:
        print(
            f"  [OK] catalogue ≡ barrel TS − internes : "
            f"{len(set_cat)} composants (barrel {len(barrel)} − {len(gen.INTERNAL_COMPONENTS)} internes)."
        )

    # ── Garde optionnelle : non-régression de curation (warning only) ──────────
    try:
        registry = json.loads(MCP_REGISTRY.read_text(encoding="utf-8"))
        curated = sum(1 for c in registry["components"] if c.get("status") == "curated")
        if curated < CURATED_BASELINE:
            print(
                f"  [WARN] curation en baisse : {curated} entrées \"curated\" "
                f"< référence {CURATED_BASELINE}. Perte de curation accidentelle ? "
                f"(non bloquant)"
            )
        else:
            print(f"  [OK] curation : {curated} \"curated\" (référence {CURATED_BASELINE}).")
    except (FileNotFoundError, KeyError, ValueError):
        # Registre absent/illisible : la garde de curation est best-effort, on n'échoue pas.
        print("  [WARN] mcp-registry.json absent/illisible — garde de curation ignorée.")

    print("── Catalogue convergence : " + ("PASS" if ok else "FAIL — barrel et catalogue désynchronisés") + " ──")
    if not ok:
        print("     Le catalogue est dérivé du barrel : régénérez puis committez —")
        print("     python scripts/generate-bpm-components-json.py")
        print("     node scripts/generate-mcp-registry.mjs")

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
