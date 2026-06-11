#!/usr/bin/env python3
"""
Validateur de la couche sémantique des composants bpm.*.

Source de vérité :
  - lib/semantics/bpm-semantics.json   → couche sémantique curée (valeurs proposées par la boucle)
  - lib/semantics/types.ts             → schéma typé (les énums ci-dessous le reflètent)
  - bpm/_doc_components.py             → liste canonique des 101 composants
  - public/llms.txt                    → noms bpm.* valides pour pairWith/relations
  - lib/generated/mcp-registry.json    → câblage MCP (la couche doit y être présente)

Checks par composant :
  1. present       — entrée présente dans bpm-semantics.json
  2. role          — semanticRole dans l'énum
  3. frame         — frame Ω dans l'énum (instance du seed AppSpec)
  4. indicator     — bloc indicator présent SSI semanticRole == "indicateur", énums valides
  5. guidance      — use/avoid non vides, pairWith = noms bpm.* connus
  6. relations     — indicatorRelations : réservées aux indicateurs, types valides,
                     cibles = composants-indicateurs connus
  7. hints         — contextHints non vide
  8. status        — proposed | needs-curation | curated ; curationQuestion SSI needs-curation
  9. wired         — la couche est présente dans mcp-registry.json (régénéré)

Statut ledger par composant :
  - pending         : au moins un check structurel KO
  - proposed        : schéma valide, valeurs proposées en attente de curation
  - needs-curation  : schéma valide, question posée au curateur
  - done            : schéma valide et valeurs curées par l'humain (status "curated")

Usage :
  python3 scripts/validate-semantics.py                  # rapport console
  python3 scripts/validate-semantics.py --strict          # exit 1 si un check structurel échoue
  python3 scripts/validate-semantics.py --write-ledger    # écrit docs/automation/semantique.json
  python3 scripts/validate-semantics.py --write-curation  # écrit docs/automation/semantique-curation.md
"""
import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).parent.parent
SEMANTICS = REPO / "lib" / "semantics" / "bpm-semantics.json"
REGISTRY = REPO / "lib" / "generated" / "mcp-registry.json"
LLMS = REPO / "public" / "llms.txt"
LEDGER = REPO / "docs" / "automation" / "semantique.json"
CURATION = REPO / "docs" / "automation" / "semantique-curation.md"

sys.path.insert(0, str(REPO))
from bpm._doc_components import COMPONENT_DOC  # noqa: E402

# Énums — miroir de lib/semantics/types.ts (le schéma TS reste la référence).
ROLES = {"indicateur", "affichage", "saisie", "action", "conteneur", "navigation", "feedback", "composite"}
FRAMES = {"kpi", "entity", "workflow", "rule", "event", "section", "ai", "connector", "permission", "meta"}
INDICATOR_TYPES = {"scalaire-kpi", "ratio", "taux", "compte", "monetaire", "statut",
                   "progression", "tendance", "distribution"}
DIRECTIONALITIES = {"hausse=bon", "hausse=mauvais", "neutre", "borne-cible", "contextuel"}
TEMPORALITIES = {"instantane", "cumule", "serie", "periode-sur-periode", "contextuel"}
RELATION_TYPES = {"compose-dans", "derive-de", "contraste-avec"}
STATUSES = {"proposed", "needs-curation", "curated"}


def known_bpm_names() -> set:
    """Noms bpm.* valides : catalogue canonique + sections de llms.txt (extras du barrel)."""
    names = {c["name"].lower() for c in COMPONENT_DOC}
    if LLMS.exists():
        for m in re.finditer(r"^## (bpm\.\w+)\s*$", LLMS.read_text(encoding="utf-8", errors="ignore"), re.M):
            names.add(m.group(1).lower())
    return names


def check_component(slug: str, name: str, sem: dict | None, known: set,
                    indicator_names: set, registry_sem: set) -> dict:
    checks = {}
    notes = []

    # 1. present
    checks["present"] = sem is not None
    if sem is None:
        for k in ("role", "frame", "indicator", "guidance", "relations", "hints", "status", "wired"):
            checks[k] = False
        return {"slug": slug, "bpm": name, "checks": checks, "status": "pending",
                "gap": "entrée absente de bpm-semantics.json"}

    # 2. role / 3. frame
    role = sem.get("semanticRole")
    checks["role"] = role in ROLES
    if not checks["role"]:
        notes.append(f"semanticRole invalide: {role!r}")
    frame = sem.get("frame")
    checks["frame"] = frame in FRAMES
    if not checks["frame"]:
        notes.append(f"frame invalide: {frame!r}")

    # 4. indicator — présent SSI rôle indicateur
    ind = sem.get("indicator")
    if role == "indicateur":
        ok = isinstance(ind, dict)
        if ok:
            types = ind.get("indicatorType")
            ok = (isinstance(types, list) and len(types) > 0
                  and all(t in INDICATOR_TYPES for t in types)
                  and ind.get("directionality") in DIRECTIONALITIES
                  and ind.get("temporality") in TEMPORALITIES)
        checks["indicator"] = ok
        if not ok:
            notes.append("bloc indicator manquant ou énums invalides")
    else:
        checks["indicator"] = ind is None
        if ind is not None:
            notes.append("bloc indicator présent sur un non-indicateur")

    # 5. guidance
    g = sem.get("agentGuidance") or {}
    pair = g.get("pairWith") or []
    unknown_pairs = [p for p in pair if p.lower() not in known]
    checks["guidance"] = bool(str(g.get("use", "")).strip()) and bool(str(g.get("avoid", "")).strip()) \
        and isinstance(pair, list) and not unknown_pairs
    if unknown_pairs:
        notes.append("pairWith inconnus: " + ",".join(unknown_pairs))
    elif not checks["guidance"]:
        notes.append("agentGuidance incomplet (use/avoid/pairWith)")

    # 6. relations — réservées aux indicateurs, cibles = indicateurs connus
    rels = sem.get("indicatorRelations") or []
    rel_ok = True
    if rels and role != "indicateur":
        rel_ok = False
        notes.append("indicatorRelations sur un non-indicateur")
    for r in rels:
        if r.get("type") not in RELATION_TYPES:
            rel_ok = False
            notes.append(f"type de relation invalide: {r.get('type')!r}")
        target = str(r.get("target", "")).lower()
        if target not in known:
            rel_ok = False
            notes.append(f"cible de relation inconnue: {r.get('target')!r}")
        elif target.removeprefix("bpm.") not in indicator_names and target not in indicator_names:
            rel_ok = False
            notes.append(f"cible de relation non-indicateur: {r.get('target')!r}")
    checks["relations"] = rel_ok

    # 7. hints
    hints = sem.get("contextHints")
    checks["hints"] = isinstance(hints, list) and len(hints) > 0 and all(str(h).strip() for h in hints)
    if not checks["hints"]:
        notes.append("contextHints vide")

    # 8. status (+ curationQuestion ssi needs-curation)
    status = sem.get("status")
    q = sem.get("curationQuestion")
    checks["status"] = status in STATUSES and ((status == "needs-curation") == bool(str(q or "").strip()))
    if not checks["status"]:
        notes.append("status invalide ou curationQuestion incohérente")

    # 9. wired — couche présente dans le registre MCP régénéré
    checks["wired"] = slug in registry_sem
    if not checks["wired"]:
        notes.append("couche absente de mcp-registry.json (régénérer: npm run generate:mcp-registry)")

    structural = all(checks.values())
    if not structural:
        ledger_status = "pending"
    elif status == "curated":
        ledger_status = "done"
    elif status == "needs-curation":
        ledger_status = "needs-curation"
    else:
        ledger_status = "proposed"

    return {"slug": slug, "bpm": name, "checks": checks, "status": ledger_status,
            "gap": "; ".join(notes), "curationQuestion": q or ""}


def write_curation(results: list[dict], sem_map: dict):
    """Surface de curation : tableau des valeurs proposées, à valider/corriger par l'humain."""
    lines = [
        "# Couche sémantique — surface de curation",
        "",
        "> **Décision de moat.** Les valeurs ci-dessous sont des PROPOSITIONS de la boucle",
        "> (draftées depuis les descriptions existantes du registre). L'ontologie reste curée :",
        "> valider ou corriger chaque ligne dans `lib/semantics/bpm-semantics.json`, passer",
        "> `status` à `curated` (ou corriger les valeurs), puis régénérer et valider :",
        "> `npm run generate:llms && npm run generate:mcp-registry && python3 scripts/validate-semantics.py --write-ledger`.",
        ">",
        "> Frames Ω = tranches de l'AppSpec (`packages/core/src/schema/app-spec.ts`),",
        "> câblage typé dans `lib/semantics/types.ts` (FRAME_SOURCE).",
        "",
        "## Questions ouvertes (needs-curation)",
        "",
    ]
    nc = [r for r in results if r["status"] == "needs-curation"]
    if nc:
        for r in nc:
            lines.append(f"- **{r['bpm']}** — {r['curationQuestion']}")
    else:
        lines.append("_Aucune question ouverte._")
    lines += [
        "",
        "## Valeurs proposées par composant",
        "",
        "| Composant | Rôle | Frame Ω | Type d'indicateur | Direction | Temporalité | Relations d'indicateurs | Statut |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for r in results:
        sem = sem_map.get(r["slug"])
        if not sem:
            lines.append(f"| {r['bpm']} | — | — | — | — | — | — | absent |")
            continue
        ind = sem.get("indicator") or {}
        types = ", ".join(ind.get("indicatorType", [])) or "—"
        direction = ind.get("directionality", "—")
        temp = ind.get("temporality", "—")
        rels = "; ".join(f"{x['type']} → {x['target']}" for x in sem.get("indicatorRelations", [])) or "—"
        status = sem.get("status", "?")
        if status == "needs-curation":
            status = "**needs-curation**"
        lines.append(
            f"| {r['bpm']} | {sem.get('semanticRole', '?')} | {sem.get('frame', '?')} "
            f"| {types} | {direction} | {temp} | {rels} | {status} |"
        )
    lines += [
        "",
        "## Légende",
        "",
        "- **Rôle** : indicateur, affichage, saisie, action, conteneur, navigation, feedback, composite.",
        "- **Frame Ω** : kpi, entity, workflow, rule, event, section, ai, connector, permission, meta.",
        "- **Direction `contextuel`** : la polarité dépend du KPI affiché, pas du composant (ex. metric via deltaType).",
        "- **Relations** : compose-dans / derive-de / contraste-avec — relations de SENS entre indicateurs,",
        "  distinctes de l'imbrication de composants (associated/parent du registre).",
        "",
    ]
    CURATION.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {CURATION}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--strict", action="store_true")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--write-ledger", action="store_true")
    ap.add_argument("--write-curation", action="store_true")
    args = ap.parse_args()

    sem_map = json.loads(SEMANTICS.read_text(encoding="utf-8"))["components"]
    known = known_bpm_names()
    indicator_names = {s for s, v in sem_map.items() if v.get("semanticRole") == "indicateur"}
    registry_sem = set()
    if REGISTRY.exists():
        reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
        registry_sem = {c["slug"] for c in reg.get("components", []) if c.get("semantics")}

    results = [
        check_component(c["slug"], c["name"], sem_map.get(c["slug"]), known, indicator_names, registry_sem)
        for c in COMPONENT_DOC
    ]
    orphans = [s for s in sem_map if s not in {c["slug"] for c in COMPONENT_DOC}]

    tally = {}
    for r in results:
        tally[r["status"]] = tally.get(r["status"], 0) + 1

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print("=== Validateur couche sémantique — 9 checks ===")
        print(f"Total canonique : {len(results)}")
        for k in ("done", "proposed", "needs-curation", "pending"):
            print(f"  {k:15s}: {tally.get(k, 0)}")
        keys = ["present", "role", "frame", "indicator", "guidance", "relations", "hints", "status", "wired"]
        print("\nTaux par check :")
        for k in keys:
            n = sum(1 for r in results if r["checks"].get(k))
            print(f"  {k:10s} {n:3d}/{len(results)}")
        bad = [r for r in results if r["status"] == "pending"]
        if bad:
            print("\n--- pending (check structurel KO) ---")
            for r in bad:
                print(f"  {r['bpm']:24s} {r['gap']}")
        if orphans:
            print(f"\nEntrées orphelines (hors catalogue) : {orphans}")

    if args.write_ledger:
        ledger = {
            "mission": "couche-semantique",
            "standard": "9 checks (cf. scripts/validate-semantics.py) ; valeurs proposed/needs-curation/curated",
            "generated_by": "scripts/validate-semantics.py --write-ledger",
            "totals": {"components": {"total": len(results), **tally}},
            "needsCuration": [
                {"slug": r["slug"], "bpm": r["bpm"], "question": r["curationQuestion"]}
                for r in results if r["status"] == "needs-curation"
            ],
            "components": [{k: r[k] for k in ("slug", "bpm", "checks", "status", "gap")} for r in results],
        }
        LEDGER.parent.mkdir(parents=True, exist_ok=True)
        LEDGER.write_text(json.dumps(ledger, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nWrote {LEDGER}")
        print(f"  composants: {ledger['totals']['components']}")

    if args.write_curation:
        write_curation(results, sem_map)

    if args.strict and (any(r["status"] == "pending" for r in results) or orphans):
        sys.exit(1)


if __name__ == "__main__":
    main()
