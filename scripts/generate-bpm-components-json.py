#!/usr/bin/env python3
"""
Génère lib/generated/bpm-components.json — le catalogue consommé par le site
Next.js ET par le connecteur MCP (via scripts/generate-mcp-registry.mjs).

RACINE DE VÉRITÉ = LE BARREL TypeScript (packages/core/src/bpm.tsx).
----------------------------------------------------------------------
La LISTE des composants est dérivée de l'objet `bpm` exporté par le barrel,
EXACTEMENT comme public/llms.txt (on réutilise `extract_barrel_components`
du générateur llms.txt — pas de second extracteur d'AST). Conséquence :
tout composant exporté sur bpm.* apparaît automatiquement au catalogue ; il
n'y a plus de liste de catalogue saisie à la main qui puisse prendre du retard.

ENRICHISSEMENT (curation, sans autorité sur la liste) :
  - bpm/_doc_components.py  → catégorie + description courte curées (overlay).
      • COMPONENT_DOC      : composants historiques (description + catégorie).
      • EXTRA_CATEGORIES   : catégorie des composants nouvellement exposés.
    Cet overlay N'EST PLUS l'autorité du catalogue : un composant absent de
    l'overlay apparaît quand même (catégorie de repli "Utilitaires",
    description issue de llms.txt). Le barrel fait foi.
  - public/llms.txt         → description de repli (première phrase du
      @description, déjà dérivé du TS) pour les composants sans description
      d'overlay.

FILTRE INTERNES (explicite, documenté) : les sous-composants internes non
exportés sur le barrel (popovers, *Leaflet, variantes *Analytics/*Classic,
gpsMap) ne sont PAS des composants publics et n'entrent pas au catalogue.
Ils ne figurent déjà pas dans `extract_barrel_components` ; la liste
INTERNAL_COMPONENTS ci-dessous est une barrière explicite (ceinture +
bretelles) au cas où l'un d'eux serait un jour ajouté au barrel par erreur.

Sortie : { "components": [ { slug, name, description, category }, ... ] }
Le champ `status` (curated / uncurated) est dérivé EN AVAL par
generate-mcp-registry.mjs à partir de la présence d'une couche sémantique —
il n'est pas stocké ici (le catalogue reste minimal et stable).

Lancer depuis la racine du repo :
  python scripts/generate-bpm-components-json.py
  (ou: npm run generate:components)
"""
import importlib.util
import json
import os
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))
os.chdir(REPO_ROOT)

BPM_TSX = REPO_ROOT / "packages" / "core" / "src" / "bpm.tsx"
LLMS_TXT = REPO_ROOT / "public" / "llms.txt"
OUT_DIR = REPO_ROOT / "lib" / "generated"
OUT_FILE = OUT_DIR / "bpm-components.json"

# Overlay curé (catégorie + description). N'a PAS autorité sur la liste.
from bpm._doc_components import COMPONENT_DOC, EXTRA_CATEGORIES

# Catégorie de repli quand ni l'overlay ni EXTRA_CATEGORIES ne renseignent.
FALLBACK_CATEGORY = "Utilitaires"

# Sous-composants internes : jamais au catalogue (cf. docstring). Ils ne sont
# déjà pas exportés sur le barrel ; barrière explicite par sécurité.
INTERNAL_COMPONENTS = {
    "dataExplorerAnalytics",
    "dataExplorerClassic",
    "datePickerPopover",
    "timePickerPopover",
    "gpsMap",
    "mapViewLeaflet",
}


def load_barrel_extractor():
    """Charge `extract_barrel_components` du générateur llms.txt (nom de fichier
    hyphené → import via importlib). On REUTILISE l'extraction TS existante
    plutôt que d'en écrire une seconde."""
    spec = importlib.util.spec_from_file_location(
        "_genllms", REPO_ROOT / "scripts" / "generate-llms-txt.py"
    )
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # main() est gardé par __main__ : aucun effet de bord
    return mod.extract_barrel_components


def llms_short_descriptions():
    """Map { bpm_name(camelCase) → description courte } dérivée de llms.txt.
    On prend la première phrase du @description (déjà généré depuis le TS),
    pour rester sur un libellé catalogue d'une ligne."""
    txt = LLMS_TXT.read_text(encoding="utf-8")
    out = {}
    for m in re.finditer(r"^## bpm\.(\w+)\s*$", txt, re.M):
        name = m.group(1)
        body = txt[m.end():]
        nxt = re.search(r"^## bpm\.", body, re.M)
        block = body[: nxt.start()] if nxt else body
        dm = re.search(r"@description\s+(.*?)(?=\s+@[a-zA-Z]|\n|```)", block, re.S)
        if dm:
            full = dm.group(1).strip()
        else:
            fm = re.search(r"\n\s*([^\n#`@].*)", block)
            full = fm.group(1).strip() if fm else ""
        if not full:
            continue
        # Première phrase, puis nettoyage d'un éventuel suffixe « — props : … ».
        first = re.split(r"\.\s", full)[0].split(" — props")[0].strip().rstrip(".") + "."
        out[name] = first
    return out


def main():
    extract_barrel_components = load_barrel_extractor()
    barrel = extract_barrel_components(BPM_TSX)  # noms camelCase, triés
    public = [n for n in barrel if n not in INTERNAL_COMPONENTS]
    public_slugs = {n.lower() for n in public}

    # Overlay historique : conservé VERBATIM et DANS L'ORDRE (nav docs prev/next).
    overlay = [c for c in COMPONENT_DOC if c["slug"] in public_slugs]
    overlay_slugs = {c["slug"] for c in overlay}

    # Garde-fou : un composant de l'overlay disparu du barrel = anomalie à voir.
    dropped = [c["name"] for c in COMPONENT_DOC if c["slug"] not in public_slugs]
    if dropped:
        print(f"⚠️  Overlay sans pendant sur le barrel (ignorés) : {dropped}", file=sys.stderr)

    # Nouveaux composants exposés : sur le barrel, absents de l'overlay.
    llms_desc = llms_short_descriptions()
    new_names = sorted(n for n in public if n.lower() not in overlay_slugs)
    new_entries = []
    for n in new_names:
        slug = n.lower()
        new_entries.append(
            {
                "slug": slug,
                "name": f"bpm.{n}",
                "description": llms_desc.get(n, ""),
                "category": EXTRA_CATEGORIES.get(slug, FALLBACK_CATEGORY),
            }
        )

    components = overlay + new_entries

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump({"components": components}, f, ensure_ascii=False, indent=2)

    # Vrais replis : ni overlay, ni EXTRA_CATEGORIES ne renseignent la catégorie.
    fallback_used = sum(1 for n in new_names if n.lower() not in EXTRA_CATEGORIES)
    print(
        f"Wrote {OUT_FILE.relative_to(REPO_ROOT)} "
        f"({len(components)} composants = {len(overlay)} overlay + {len(new_entries)} nouveaux ; "
        f"{fallback_used} en catégorie de repli '{FALLBACK_CATEGORY}')"
    )


if __name__ == "__main__":
    main()
