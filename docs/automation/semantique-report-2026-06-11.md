# Rapport — Couche sémantique des 101 composants (2026-06-11)

## Mission

Doter les 101 composants Blueprint Modular de leur couche sémantique — ce que chaque
indicateur SIGNIFIE et embarque, au-delà des props de rendu — proposée par la boucle,
curée par l'humain.

## Ontologie Ω trouvée

`lib/schema/app-spec.ts` n'existe pas dans ce repo ; la définition Ω vit dans
**`packages/core/src/schema/app-spec.ts`** (AppSpec : entities, workflows, rules, events,
sections, kpis, aiFeatures, connectors, permissions, meta). La couche composant est une
**instance** de cette ontologie : chaque `frame` référence une tranche de l'AppSpec, avec
câblage typé à la compilation (`FRAME_SOURCE` dans `lib/semantics/types.ts`,
`Record<OmegaFrame, keyof AppSpec>`). Aucune ontologie parallèle n'a été créée.

## Schéma posé (mécanique, sur les 101)

Par composant (`lib/semantics/bpm-semantics.json`, typé par `lib/semantics/types.ts`) :

- `semanticRole` : indicateur / affichage / saisie / action / conteneur / navigation / feedback / composite
- `frame` : frame Ω (kpi, entity, workflow, rule, event, section, ai, connector, permission, meta)
- `indicator` (ssi rôle indicateur) : `indicatorType[]` (scalaire-kpi, ratio, taux, compte,
  monetaire, statut, progression, tendance, distribution), `directionality`
  (hausse=bon, hausse=mauvais, neutre, borne-cible, **contextuel**), `temporality`
  (instantane, cumule, serie, periode-sur-periode, contextuel)
- `agentGuidance` : `use` / `pairWith[]` (associations sémantiques) / `avoid`
- `indicatorRelations` : compose-dans / derive-de / contraste-avec — relations de SENS
  entre indicateurs, distinctes de l'imbrication de composants (associated/parent)
- `contextHints` : contexte/données attendus pour que le composant ait du sens
- `status` : proposed / needs-curation / curated (+ `curationQuestion` si needs-curation)

Écarts assumés vs le schéma de mission (signalés pour curation) :

- `indicatorType` est un **tableau** (du plus typique au moins typique) : les graphiques
  génériques portent plusieurs natures de mesure.
- Valeurs ajoutées : `directionality: contextuel` et `temporality: contextuel` — au niveau
  COMPOSANT, la polarité dépend souvent du KPI affiché (ex. `bpm.metric` la paramètre via
  `deltaType`), pas du composant. Figer une polarité au composant aurait été une décision
  d'ontologie prise en autonomie.
- `frame` est porté par les 101 (pas seulement les indicateurs) : tout composant instancie
  une tranche d'Ω.

## Gouvernance respectée

Toutes les valeurs sont `status: "proposed"` — draftées depuis les descriptions existantes
du registre, jamais arrêtées. **9 composants en `needs-curation`** avec question précise
(frame « acteur » absent d'Ω pour avatar/orgChart ; frame « identification » absent pour
barcode/qrCode/nfcBadge ; statut indicateur de timeline/activityFeed ; sous-typage de
plotlyChart ; rattachement de diffViewer). Aucune entrée `curated` : c'est la décision du
curateur (surface : `docs/automation/semantique-curation.md`).

## Exposition câblée

- **MCP `get_component`** renvoie `semantics` (rôle, frame Ω, indicateur, guidance,
  relations, hints, status) — fusion dans `lib/generated/mcp-registry.json` par
  `scripts/generate-mcp-registry.mjs` (3e source : `lib/semantics/bpm-semantics.json`).
- **MCP `suggest_composition`** raisonne sur le sens : le scoring pèse le texte sémantique
  (poids 4, entre nom et description) et chaque suggestion expose `meaning`
  (role, frame, indicatorType, directionality, use, pairWith, status).
- **llms.txt** : tags `@semantic` + `@guidance` par composant (générés par
  `scripts/generate-llms-txt.py` depuis la source curée).
- **Fiches `/docs/components/[slug]`** : section « Couche sémantique » (type,
  directionnalité, temporalité, frame, guidance, relations, statut, question de curation),
  i18n fr/en.

## Boucle et vérification

- Ledger : `docs/automation/semantique.json` — 101 items, 9 checks chacun
  (present, role, frame, indicator, guidance, relations, hints, status, wired).
- Validateur : `python3 scripts/validate-semantics.py [--strict|--write-ledger|--write-curation]`.

État final :

| Statut | Composants |
|---|---|
| proposed | 92 |
| needs-curation | 9 |
| done (curated) | 0 — en attente de curation humaine |
| pending | 0 |

Vérifications : validateur `--strict` vert (9 checks × 101) ; régénération
llms.txt + mcp-registry sans régression de parsing (props/exemples identiques à l'existant) ;
`npm run build` vert ; smoke test MCP : « suivre la progression d'une commande dans son
workflow » → `bpm.statusTracker` (indicateur/workflow) en première suggestion, avec `meaning`.

## Prochaine étape (humaine)

Curer `docs/automation/semantique-curation.md` : répondre aux 9 questions, corriger les
valeurs dans `lib/semantics/bpm-semantics.json`, passer `status` à `curated`, puis
`npm run generate:llms && npm run generate:mcp-registry && python3 scripts/validate-semantics.py --write-ledger --write-curation`.
