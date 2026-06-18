#!/usr/bin/env python3
"""
Validateur de la couche sémantique des composants bpm.*.

Source de vérité :
  - lib/generated/bpm-components.json  → LISTE CANONIQUE du catalogue (dérivée du
                                         barrel bpm.tsx en PR1). C'est elle qui dit
                                         quels composants existent — PAS bpm/_doc_components.py.
  - lib/semantics/bpm-semantics.json   → couche sémantique curée (valeurs proposées par la boucle)
  - lib/semantics/types.ts             → schéma typé (les énums ci-dessous le reflètent)
  - public/llms.txt                    → noms bpm.* valides pour pairWith/relations
  - lib/generated/mcp-registry.json    → câblage MCP (la couche doit y être présente)

PRINCIPE (CAT-4) : on valide la FORME des sémantiques présentes sur les 154
composants, et on LISTE le backlog de curation (composants sans sémantique) de
façon visible mais NON bloquante. On distingue donc deux choses :
  - « forme invalide » (status=malformed) → BLOQUANT : une sémantique existe mais
    viole le schéma (rôle/frame/indicator/guidance/relations/hints/status/câblage).
  - « pas encore curé » (status=uncurated) → INFORMATIF : aucun bloc sémantique.
    C'est du backlog honnête, pas une erreur. On le compte, on ne le force pas.

Checks par composant (uniquement si une sémantique est présente) :
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

Statut par composant :
  - uncurated       : aucune sémantique (backlog) — informatif, NON bloquant
  - malformed       : sémantique présente mais un check structurel échoue — BLOQUANT
  - proposed        : forme valide, valeurs proposées en attente de curation
  - needs-curation  : forme valide, question posée au curateur
  - done            : forme valide et valeurs curées par l'humain (status "curated")

Exit code :
  - défaut          : exit 1 SSI au moins un composant est `malformed` (forme invalide)
                      ou une sémantique est orpheline (slug hors catalogue). Le backlog
                      `uncurated` ne bloque JAMAIS. → utilisable tel quel dans le gate.
  - --strict        : en plus, exit 1 s'il reste des `uncurated` (exige une couverture
                      complète). OPT-IN, non utilisé par le gate.

Usage :
  python3 scripts/validate-semantics.py                  # rapport + exit 1 si forme invalide
  python3 scripts/validate-semantics.py --strict          # + exit 1 si backlog non vide
  python3 scripts/validate-semantics.py --write-ledger    # écrit docs/automation/semantique.json
  python3 scripts/validate-semantics.py --write-curation  # écrit docs/automation/semantique-curation.md
"""
import argparse
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).parent.parent
CATALOGUE = REPO / "lib" / "generated" / "bpm-components.json"
SEMANTICS = REPO / "lib" / "semantics" / "bpm-semantics.json"
REGISTRY = REPO / "lib" / "generated" / "mcp-registry.json"
LLMS = REPO / "public" / "llms.txt"
LEDGER = REPO / "docs" / "automation" / "semantique.json"
CURATION = REPO / "docs" / "automation" / "semantique-curation.md"

# Énums — miroir de lib/semantics/types.ts (le schéma TS reste la référence).
ROLES = {"indicateur", "affichage", "saisie", "action", "conteneur", "navigation", "feedback", "composite"}
FRAMES = {"kpi", "entity", "workflow", "rule", "event", "section", "ai", "connector", "permission", "meta"}
INDICATOR_TYPES = {"scalaire-kpi", "ratio", "taux", "compte", "monetaire", "statut",
                   "progression", "tendance", "distribution"}
DIRECTIONALITIES = {"hausse=bon", "hausse=mauvais", "neutre", "borne-cible", "contextuel"}
TEMPORALITIES = {"instantane", "cumule", "serie", "periode-sur-periode", "contextuel"}
RELATION_TYPES = {"compose-dans", "derive-de", "contraste-avec"}
STATUSES = {"proposed", "needs-curation", "curated"}

# Statuts NON curés / invalides (vs. statuts de forme valide).
BACKLOG = "uncurated"   # aucune sémantique — informatif
MALFORMED = "malformed"  # sémantique présente mais forme invalide — bloquant
CHECK_KEYS = ["present", "role", "frame", "indicator", "guidance", "relations", "hints", "status", "wired"]


def load_catalogue() -> list[dict]:
    """Liste canonique du catalogue (154) — dérivée du barrel en PR1. Source de
    vérité de « quels composants existent ». bpm/_doc_components.py n'intervient plus."""
    return json.loads(CATALOGUE.read_text(encoding="utf-8"))["components"]


def known_bpm_names(catalogue: list[dict]) -> set:
    """Noms bpm.* valides pour pairWith/relations : catalogue (154) + sections de
    llms.txt (inclut les sous-composants internes documentés)."""
    names = {c["name"].lower() for c in catalogue}
    if LLMS.exists():
        for m in re.finditer(r"^## (bpm\.\w+)\s*$", LLMS.read_text(encoding="utf-8", errors="ignore"), re.M):
            names.add(m.group(1).lower())
    return names


def check_component(slug: str, name: str, sem: dict | None, known: set,
                    indicator_names: set, registry_sem: set) -> dict:
    checks = {}
    notes = []

    # 1. present — absence de sémantique = backlog (uncurated), PAS une erreur de forme.
    checks["present"] = sem is not None
    if sem is None:
        for k in CHECK_KEYS[1:]:
            checks[k] = None  # non applicable : rien à valider tant que non curé
        return {"slug": slug, "bpm": name, "checks": checks, "status": BACKLOG,
                "gap": "pas encore curé (aucune sémantique)", "curationQuestion": ""}

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

    # Forme valide ? (tous les checks applicables passent)
    form_ok = all(v for v in checks.values() if v is not None)
    if not form_ok:
        ledger_status = MALFORMED
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

    # Backlog de curation : composants sans sémantique, listés pour visibilité.
    backlog = [r for r in results if r["status"] == BACKLOG]
    lines += ["", f"## Backlog de curation — {len(backlog)} composants sans sémantique", ""]
    if backlog:
        lines.append(", ".join(r["bpm"] for r in backlog))
    else:
        lines.append("_Couverture complète._")

    lines += [
        "",
        "## Valeurs proposées par composant (sémantique présente)",
        "",
        "| Composant | Rôle | Frame Ω | Type d'indicateur | Direction | Temporalité | Relations d'indicateurs | Statut |",
        "|---|---|---|---|---|---|---|---|",
    ]
    for r in results:
        sem = sem_map.get(r["slug"])
        if not sem:
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
    ap.add_argument("--strict", action="store_true",
                    help="exit 1 aussi si le backlog (uncurated) n'est pas vide (couverture complète)")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--write-ledger", action="store_true")
    ap.add_argument("--write-curation", action="store_true")
    args = ap.parse_args()

    catalogue = load_catalogue()
    sem_map = json.loads(SEMANTICS.read_text(encoding="utf-8"))["components"]
    known = known_bpm_names(catalogue)
    indicator_names = {s for s, v in sem_map.items() if v.get("semanticRole") == "indicateur"}
    registry_sem = set()
    if REGISTRY.exists():
        reg = json.loads(REGISTRY.read_text(encoding="utf-8"))
        registry_sem = {c["slug"] for c in reg.get("components", []) if c.get("semantics")}

    # Itération sur le catalogue CANONIQUE (154), pas sur _doc_components.py.
    results = [
        check_component(c["slug"], c["name"], sem_map.get(c["slug"]), known, indicator_names, registry_sem)
        for c in catalogue
    ]

    # Sémantiques orphelines : un bloc existe pour un slug hors catalogue → forme
    # invalide (câblage cassé), bloquant. Doit être vide post-PR1.
    catalogue_slugs = {c["slug"] for c in catalogue}
    orphans = sorted(s for s in sem_map if s not in catalogue_slugs)
    for s in orphans:
        results.append({"slug": s, "bpm": f"bpm.{s}", "checks": {k: None for k in CHECK_KEYS},
                        "status": MALFORMED, "gap": "sémantique orpheline (slug hors catalogue)",
                        "curationQuestion": ""})

    tally = {}
    for r in results:
        tally[r["status"]] = tally.get(r["status"], 0) + 1

    malformed = [r for r in results if r["status"] == MALFORMED]
    backlog = [r for r in results if r["status"] == BACKLOG]
    valid_form = len(results) - len(malformed) - len(backlog)  # done + proposed + needs-curation

    if args.json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print("=== Validateur couche sémantique — forme + backlog ===")
        print(f"Catalogue canonique (lib/generated/bpm-components.json) : {len(catalogue)}")
        for k in ("done", "proposed", "needs-curation"):
            print(f"  {k:16s}: {tally.get(k, 0)}")
        print(f"  {'uncurated':16s}: {tally.get(BACKLOG, 0)}   (backlog — informatif, non bloquant)")
        print(f"  {'malformed':16s}: {tally.get(MALFORMED, 0)}   (forme invalide — BLOQUANT)")
        print(f"Couverture sémantique : {valid_form}/{len(catalogue)} "
              f"({100 * valid_form // max(1, len(catalogue))}%)")

        # Taux par check sur les composants QUI ONT une sémantique (qualité de forme).
        with_sem = [r for r in results if r["checks"].get("present")]
        print(f"\nTaux par check (sur {len(with_sem)} composants avec sémantique) :")
        for k in CHECK_KEYS:
            n = sum(1 for r in with_sem if r["checks"].get(k))
            print(f"  {k:10s} {n:3d}/{len(with_sem)}")

        if malformed:
            print("\n--- FORME INVALIDE (bloquant) ---")
            for r in malformed:
                print(f"  {r['bpm']:24s} {r['gap']}")

        # Backlog visible mais non bloquant.
        print(f"\n--- Backlog curation (uncurated, non bloquant) : {len(backlog)} composants ---")
        if backlog:
            names = [r["bpm"] for r in backlog]
            head = ", ".join(names[:20])
            print(f"  {head}{' …' if len(names) > 20 else ''}")

    if args.write_ledger:
        ledger = {
            "mission": "couche-semantique",
            "standard": "9 checks (cf. scripts/validate-semantics.py) ; forme bloquante, backlog informatif",
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

    # Exit : la FORME bloque (malformed/orphelins) ; le backlog ne bloque pas
    # (sauf --strict, opt-in pour exiger une couverture complète).
    fail = len(malformed) > 0 or (args.strict and len(backlog) > 0)
    if fail:
        if malformed:
            print(f"\n❌ {len(malformed)} sémantique(s) de forme invalide — corriger avant merge.")
        if args.strict and backlog:
            print(f"\n❌ --strict : {len(backlog)} composant(s) non curés (couverture incomplète).")
        sys.exit(1)
    print(f"\n✅ Forme valide ({valid_form} sémantiques) ; backlog de curation : {len(backlog)} (non bloquant).")


if __name__ == "__main__":
    main()
