# AUDIT — Divergence de complétude : llms.txt vs catalogue MCP vs barrel `bpm.tsx`

- **Date** : 2026-06-17
- **Repo** : `Blueprint-Master/blueprint-modular` (master = source de vérité)
- **Branche d'audit** : `claude/audit-catalogue-completude-7tv2d5`
- **Nature** : audit **READ-ONLY**. Aucun fichier de production modifié, aucune régénération de dérivés, aucun bump de version. Seul ce fichier de rapport est écrit.
- **Versions au moment de l'audit** : npm `@blueprint-modular/core` 0.3.1 — PyPI `blueprint-modular` 0.1.54.

---

## TL;DR (verdict)

| Compte canonique | Valeur | Source |
|---|---|---|
| **A** — exports réels sur l'objet `bpm` (barrel) | **154** | `packages/core/src/bpm.tsx` |
| **B** — blocs `## bpm.*` dans llms.txt | **160** (dont **150** avec `@component`, **101** avec couche sémantique `status=`) | `public/llms.txt` |
| **C** — `total` du catalogue MCP | **104** | `lib/generated/bpm-components.json` → `lib/generated/mcp-registry.json` |

**L'écart documenté ↔ catalogue est de 56 composants (B \ C = 56) et se décompose proprement, sans reste :**

- **50 composants** (`A \ C`) : **réellement exportés sur le barrel public** ET documentés dans llms.txt, mais **absents du catalogue MCP**. → **H2 (désynchronisation de pipelines)**.
- **6 composants** (`B \ A`) : documentés dans llms.txt mais **non exportés sur le barrel** — sous-composants internes / variantes. → **H3 (sur-comptage de sous-composants internes)**.
- `50 + 6 = 56` = `B \ C`. La décomposition est exacte (ensembles disjoints).

- **H1 (filtre délibéré status / public / internal) : REJETÉE.** Aucun filtre de ce type n'existe dans le code de génération du catalogue. L'exclusion n'est pas un *filtre sur un flag*, elle est **structurelle** : le catalogue MCP est alimenté par une source **distincte** (un registre Python tenu à la main) qui ne suit pas le code TypeScript.

> La page d'accueil affirme (`lib/i18n/fr.ts:219`) : *« Le site, le catalogue et llms.txt sont générés depuis le code TypeScript. Aucune divergence possible entre la doc et le composant. »*
> **Cette affirmation est fausse pour le catalogue.** Le catalogue MCP n'est PAS généré depuis le code TypeScript : sa racine est `bpm/_doc_components.py` (liste Python tenue à la main). Seuls le barrel et llms.txt proviennent du TS. C'est la cause racine de la divergence.

---

## Étape 0 — Cartographie (les 3 chemins)

### 1. Barrel exporté `bpm.*` (compte A)
- **`packages/core/src/bpm.tsx`** — objet `export const bpm = { … }` (lignes 387–543). Généré/maintenu côté TypeScript ; c'est la **surface publique réelle** du package npm.

### 2. Générateur de llms.txt (compte B)
- **`scripts/generate-llms-txt.py`** → écrit **`public/llms.txt`** (et `llms-core.txt`).
- Sources déclarées : `packages/core/src/bpm.tsx` (interfaces + JSDoc) + `components/bpm/*.tsx` + couche sémantique `lib/semantics/bpm-semantics.json`.
- **Pipeline TypeScript** (lit les `.tsx`).

### 3. Générateur / source du catalogue MCP (compte C)
Chaîne à **deux étages**, et c'est le point clé :
- **`bpm/_doc_components.py`** — `COMPONENT_DOC : list[ComponentDoc]` : **liste Python tenue à la main** (104 entrées, littéral statique, aucune logique de filtrage). En-tête du fichier : *« Single source of truth: used to generate lib/generated/bpm-components.json »*.
- **`scripts/generate-bpm-components-json.py`** — importe `COMPONENT_DOC` et le sérialise tel quel dans **`lib/generated/bpm-components.json`** (104). Aucun filtre.
- **`scripts/generate-mcp-registry.mjs`** — fusionne `bpm-components.json` (liste **canonique**) + `public/llms.txt` (détail props/exemple) + `bpm-semantics.json` (sémantique) → **`lib/generated/mcp-registry.json`**. `total = components.length`. Il **mappe sur la liste de `bpm-components.json`** : llms.txt n'est utilisé que comme **détail**, jamais comme liste source. Tout bloc `## bpm.*` de llms.txt absent de `bpm-components.json` est donc **silencieusement ignoré**.
- **`lib/mcp/registry.ts`** — lit `mcp-registry.json` ; expose `TOTAL`, `listComponents`, `getComponent`, `searchComponents`, `suggestComposition`. Servi par `app/api/mcp/route.ts`.

**Conséquence architecturale** : le barrel et llms.txt suivent le TypeScript ; le catalogue MCP suit `_doc_components.py` (Python). Deux référentiels indépendants → divergence possible et avérée.

---

## Étape 1 — Trois décomptes canoniques (commandes reproductibles)

### A = exports réels sur l'objet `bpm` (barrel) = **154**

```bash
# Clés de l'objet `export const bpm = {…}` (lignes 388–542), normalisées en bpm.<clé>, minuscules
sed -n '388,542p' packages/core/src/bpm.tsx \
  | grep -oE '^  [a-zA-Z0-9]+:' \
  | sed -E 's/^  ([a-zA-Z0-9]+):/bpm.\1/' \
  | tr 'A-Z' 'a-z' | sort -u | wc -l
# → 154
```

### B = blocs `## bpm.*` et `@component bpm.*` dans llms.txt = **160 / 150**

```bash
# Titres de section (entrées catalogue documentées)
grep -cE '^## bpm\.' public/llms.txt          # → 160
# Tags @component (blocs « complets »)
grep -coE '@component bpm\.[A-Za-z0-9]+' public/llms.txt   # → 150
# Blocs portant la couche sémantique curée (ligne @semantic … status=)
#   → 101  (cf. Étape 3)
```

> Écart 160→150 : 10 titres `## bpm.*` n'ont pas de tag `@component` sur la même ligne (formats hérités : `page`, `title`, `toast`, `crud`, `chat`, + 5 sous-composants internes). 160 reste le décompte d'**entrées catalogue** ; 150 le décompte de **blocs canoniques**. Les deux dépassent largement C=104.

### C = `total` du catalogue MCP = **104**

```bash
# Source canonique du catalogue (liste Python sérialisée)
node -e "const j=require('./lib/generated/bpm-components.json'); console.log(j.components.length)"   # → 104
# Registre MCP effectivement servi
node -e "const j=require('./lib/generated/mcp-registry.json'); console.log(j.total, j.components.length)"   # → 104 104
```

**Vérification contre le serveur MCP en direct** (`list_components`) :
```json
{ "total": 104, "returned": 25, "categories": [10 catégories], "nextCursor": "eyJvIjoyNX0" }
```
`get_component('bpm.gantt')` → `{"error":"Composant introuvable : \"bpm.gantt\"."}`
`get_component('bpm.accordion')` → OK, avec couche sémantique complète (`status: "proposed"`).
Le serveur live confirme C=104 et la disparition de `gantt`.

---

## Étape 2 — Diffs ensemblistes (listes nominatives triées)

Tous les ensembles sont normalisés en minuscules pour la comparaison (le barrel est camelCase, llms.txt et le catalogue mélangent les casses).

```bash
# A_barrel.txt, B_llms.txt, C_mcp.txt construits comme en Étape 1 (sort -u)
comm -23 B_llms.txt   C_mcp.txt    # llms \ MCP   → 56  (CRITIQUE)
comm -13 B_llms.txt   C_mcp.txt    # MCP  \ llms  → 0
comm -23 A_barrel.txt C_mcp.txt    # barrel \ MCP → 50
comm -13 A_barrel.txt C_mcp.txt    # MCP \ barrel → 0
comm -23 A_barrel.txt B_llms.txt   # barrel \ llms → 0
comm -13 A_barrel.txt B_llms.txt   # llms \ barrel → 6
```

### 2a. `llms.txt \ MCP` — **56 composants** (présents dans la doc, absents du catalogue agent) — LISTE CRITIQUE

```
bpm.addressInput      bpm.aiQueryBar        bpm.alarmPanel        bpm.assistantPanel
bpm.breadcrumbs       bpm.changelog         bpm.chat              bpm.commentThread
bpm.comparison        bpm.contextMenu       bpm.dataExplorerAnalytics  bpm.dataExplorerClassic
bpm.datePickerPopover bpm.decisionTree      bpm.drillDown         bpm.emailComposer
bpm.exportButton      bpm.funnelChart       bpm.gantt             bpm.geofence
bpm.gpsMap            bpm.groupedList       bpm.heatmap           bpm.inlineEdit
bpm.invoiceTemplate   bpm.liveChart         bpm.machineStatus     bpm.mapView
bpm.mapViewLeaflet    bpm.metricRow         bpm.offlineIndicator  bpm.page
bpm.pivotTable        bpm.plcConnector      bpm.predictiveChart   bpm.printLayout
bpm.progressRing      bpm.radarChart        bpm.relationGraph     bpm.reportPage
bpm.richTextEditor    bpm.routePlanner      bpm.scheduler         bpm.sensorGrid
bpm.signaturePad      bpm.sparkline         bpm.splitView         bpm.stateMachine
bpm.suggestionCard    bpm.timePickerPopover bpm.title4            bpm.toggle
bpm.tour              bpm.transition        bpm.treemap           bpm.waterfall
```
(6 de cette liste — `dataExplorerAnalytics`, `dataExplorerClassic`, `datePickerPopover`, `gpsMap`, `mapViewLeaflet`, `timePickerPopover` — sont des **sous-composants internes** : voir 2d / Étape 3.)

### 2b. `MCP \ llms.txt` — **0** (vide attendu)
Aucune entrée. **MCP ⊆ llms.txt** : tout composant du catalogue est documenté dans llms.txt. Aucune anomalie de nommage côté catalogue.

### 2c. `barrel \ MCP` — **50 composants** (exportés réellement, absents du catalogue)

```
bpm.addressInput   bpm.aiQueryBar      bpm.alarmPanel      bpm.assistantPanel  bpm.breadcrumbs
bpm.changelog      bpm.chat            bpm.commentThread   bpm.comparison      bpm.contextMenu
bpm.decisionTree   bpm.drillDown       bpm.emailComposer   bpm.exportButton    bpm.funnelChart
bpm.gantt          bpm.geofence        bpm.groupedList     bpm.heatmap         bpm.inlineEdit
bpm.invoiceTemplate bpm.liveChart      bpm.machineStatus   bpm.mapView         bpm.metricRow
bpm.offlineIndicator bpm.page          bpm.pivotTable      bpm.plcConnector    bpm.predictiveChart
bpm.printLayout    bpm.progressRing    bpm.radarChart      bpm.relationGraph   bpm.reportPage
bpm.richTextEditor bpm.routePlanner    bpm.scheduler       bpm.sensorGrid      bpm.signaturePad
bpm.sparkline      bpm.splitView       bpm.stateMachine    bpm.suggestionCard  bpm.title4
bpm.toggle         bpm.tour            bpm.transition      bpm.treemap         bpm.waterfall
```
**`MCP \ barrel` = 0** : tout composant du catalogue est aussi exporté sur le barrel (**MCP ⊆ barrel**). Le catalogue est un **sous-ensemble strict** du barrel public, en retard de 50.

### 2d. `barrel \ llms.txt` = **0** ; `llms.txt \ barrel` — **6 sous-composants internes**

`barrel \ llms.txt = 0` : tout export du barrel est documenté (**barrel ⊆ llms.txt**).
`llms.txt \ barrel = 6` (sur-comptage de llms.txt) :

```
bpm.dataExplorerAnalytics   (variante interne de dataExplorer)
bpm.dataExplorerClassic     (variante interne de dataExplorer)
bpm.datePickerPopover       (@parent bpm.dateInput — popover interne)
bpm.gpsMap                  (variante interne de gps/map)
bpm.mapViewLeaflet          (implémentation Leaflet interne de mapView)
bpm.timePickerPopover       (@parent bpm.timeInput — « Usage interne via bpm.timeInput »)
```
Aucun de ces 6 n'est une clé de l'objet `bpm`. Ce sont des `*Analytics` / `*Classic`, `*Popover`, `*Leaflet` — exactement le profil « sous-composant interne non exporté » de H3.

### Récapitulatif des inclusions
```
MCP (104)  ⊂  barrel (154)  ⊂  llms.txt (160 entrées)
   C       ⊆      A         ⊆      B
B \ C (56) = (A \ C : 50, réels)  ⊎  (B \ A : 6, sous-composants internes)
```

---

## Étape 3 — Classification de l'écart (H1 / H2 / H3)

### Test H1 — Filtre délibéré (status / public / internal) → **REJETÉE**

1. **Aucun filtre dans le code de génération.** `scripts/generate-bpm-components-json.py` sérialise `COMPONENT_DOC` **tel quel** (`json.dump({"components": COMPONENT_DOC})`, aucune condition). `scripts/generate-mcp-registry.mjs` fait `catalogue.map(...)` **sans `filter`**. `lib/mcp/registry.ts` ne filtre que par *catégorie* (paramètre utilisateur), jamais par status/visibilité. `grep -nE 'status|public|internal|filter|exclude' bpm/_doc_components.py` ne renvoie que des occurrences dans les **descriptions** (« Boîte de statut… »), aucune logique.
2. **La couche `status` existe mais n'est jamais utilisée comme filtre.** Dans llms.txt : `status=proposed` (×92) et `status=needs-curation` (×9). Ces valeurs sont *passées au travers* jusqu'à la réponse MCP (`semantics.status`), mais **ne conditionnent aucune inclusion/exclusion**. Un composant `status=needs-curation` (ex. présent dans le catalogue) y figure quand même.
3. **Corrélation révélatrice (mais ce n'est pas un filtre, c'est la signature de H2)** : les 56 manquants n'ont **aucune** ligne sémantique `status=` dans leur bloc llms.txt (ce sont des blocs « nus » `@component`+`@description`+props). Inversement, les 101 blocs *curés* (avec `status=`) sont **tous** dans le catalogue.

```
# llms blocs avec couche sémantique status= : 101
# parmi les 104 du MCP : 101 ont status=  (les 3 sans : anomalyAlert, approvalFlow, liveGauge)
# parmi les 56 manquants : 0 ont status=   → 100 % « nus »
```

→ Ce n'est pas que le MCP *exclut* les `proposed`/`needs-curation` : c'est que les 56 manquants **n'ont jamais reçu de curation sémantique NI d'entrée dans le registre Python**. La frontière du catalogue ≈ frontière de la curation Python, pas un flag filtré au runtime. **H1 = 0 composant.**

### Test H2 — Désynchronisation de pipelines → **CONFIRMÉE (cause primaire, 50 composants)**

- Le catalogue MCP dérive de **`bpm/_doc_components.py`** (registre **Python**, littéral statique tenu à la main, 104 entrées).
- Le barrel (154) et llms.txt (160) dérivent du **TypeScript** (`packages/core/src/bpm.tsx`, `components/bpm/*.tsx`).
- **Deux pipelines indépendants, deux racines différentes.** Le pipeline Python est en retard : 50 composants réellement exportés sur le barrel (et déjà documentés dans llms.txt) **n'ont jamais été ajoutés** à `COMPONENT_DOC`.
- Horodatages : `mcp-registry.json.generatedAt = 2026-06-17T07:20:49Z`, `llms.txt Date = 2026-06-17`. Même *date de génération* : le retard n'est donc **pas temporel** (l'un régénéré après l'autre) mais **structurel** — la régénération du catalogue ne *peut pas* rattraper le barrel car elle ne lit pas le barrel. C'est une désync de **source**, pas de *fraîcheur*.

→ **H2 explique les 50 composants de `A \ C`.**

### Test H3 — Sur-comptage de sous-composants internes par llms.txt → **CONFIRMÉE (6 composants)**

- llms.txt émet **6 blocs `## bpm.*`** pour des entités qui ne sont **pas** des composants publics du barrel : `dataExplorerAnalytics`, `dataExplorerClassic` (variantes), `datePickerPopover`, `timePickerPopover` (popovers internes, `@parent`), `gpsMap`, `mapViewLeaflet` (implémentations internes).
- Le catalogue MCP a **raison** de ne pas les exposer (ils n'ont pas d'API publique appelable). En revanche, llms.txt **gonfle** son compte en les listant comme entrées de premier rang.

→ **H3 explique 6 entrées** du gonflement de B. Ces 6 ne sont **pas** des « composants manquants » : ce sont des entrées en trop côté llms.txt.

### Part de chaque hypothèse dans l'écart B \ C = 56

| Hypothèse | Composants | Détail |
|---|---|---|
| **H1** filtre délibéré | **0** | Aucun filtre dans le code. Rejetée. |
| **H2** désync de pipelines (source Python ≠ TS) | **50** | `A \ C` — réels, exportés, à exposer. |
| **H3** sur-comptage sous-composants internes | **6** | `B \ A` — internes, à retirer de llms.txt (ou marquer hors-catalogue). |
| **Total** | **56** | = `B \ C`, sans reste. |

---

## Étape 4 — Verdict & recommandations

### Verdict
- **La divergence est réelle et l'affirmation « aucune divergence possible » est fausse pour le catalogue.** Cause racine : le catalogue MCP n'est pas généré depuis le code TypeScript mais depuis un **registre Python parallèle tenu à la main** (`bpm/_doc_components.py`), figé à 104 alors que le barrel public en exporte 154.
- **88 % de l'écart (50/56) relève de H2** (désync de source) : ce sont de **vrais composants fonctionnels invisibles à l'agent**.
- **12 % (6/56) relève de H3** : sur-comptage de sous-composants internes par llms.txt — à corriger côté llms.txt, pas côté catalogue.
- **0 % relève de H1** : aucun filtre délibéré.

### Composants fonctionnels réellement manquants au catalogue (50, hors sous-composants internes)
Recommandation transverse : **exposer** (les ajouter à `bpm/_doc_components.py` + couche sémantique, puis régénérer). Cas notables à traiter en priorité car ce sont des primitives très utilisées :

- **`bpm.metricRow`** — conteneur direct de `bpm.metric` (déjà dans le catalogue). Son absence casse la guidance officielle (« `bpm.metricRow({ children: bpm.metric(...) })` »). **Exposer en priorité.**
- **`bpm.toggle`** — interrupteur on/off de base, avec une règle critique dédiée dans l'en-tête llms.txt (`prop value, jamais checked`). **Exposer en priorité.**
- **`bpm.page`**, **`bpm.title4`** — primitives de mise en page/typo (le catalogue a `title`/`title1-3` mais pas `title4`). **Exposer** (ou, pour `page`, marquer hors-catalogue si volontairement réservé au core — à trancher par l'humain).

Liste complète à exposer (les 50) :
`addressInput, aiQueryBar, alarmPanel, assistantPanel, breadcrumbs, changelog, chat, commentThread, comparison, contextMenu, decisionTree, drillDown, emailComposer, exportButton, funnelChart, gantt, geofence, groupedList, heatmap, inlineEdit, invoiceTemplate, liveChart, machineStatus, mapView, metricRow, offlineIndicator, page, pivotTable, plcConnector, predictiveChart, printLayout, progressRing, radarChart, relationGraph, reportPage, richTextEditor, routePlanner, scheduler, sensorGrid, signaturePad, sparkline, splitView, stateMachine, suggestionCard, title4, toggle, tour, transition, treemap, waterfall`.

> Note : 3 composants **déjà** dans le catalogue n'ont pas de couche sémantique curée (`anomalyAlert`, `approvalFlow`, `liveGauge` — `status=` absent). À curer pour homogénéité, mais hors périmètre de l'écart de complétude.

### Sous-composants internes (6) — à retirer du compte llms.txt / marquer hors-catalogue
`dataExplorerAnalytics`, `dataExplorerClassic`, `datePickerPopover`, `gpsMap`, `mapViewLeaflet`, `timePickerPopover`.
Recommandation : **marquer hors-catalogue** — ne pas les exposer au MCP (corrects tels quels) ET cesser de les émettre comme blocs `## bpm.*` de premier rang dans llms.txt (les rattacher à leur parent via `@parent`, ou les exclure du décompte). Ne pas « exposer ».

### Recommandation structurelle (pour la PR de remédiation — second prompt)
Le correctif durable n'est pas d'ajouter 50 lignes à la main dans `_doc_components.py` (cela reproduirait la désync). C'est de **dériver `bpm-components.json` de la même racine TypeScript que le barrel et llms.txt** (p.ex. depuis les clés de l'objet `bpm` de `packages/core/src/bpm.tsx`), de sorte que les 3 artefacts aient **une seule source** — ce que la page d'accueil prétend déjà être le cas. À cadrer hors de cet audit read-only.

---

## VALIDATION

- **A / B / C** fournis avec leurs commandes exactes reproductibles : ✔ (Étape 1).
- **Trois listes de diff nominatives** (`llms\MCP`, `MCP\llms`, `barrel\MCP` + `barrel\llms`/`llms\barrel`) : ✔ (Étape 2).
- **Aucun fichier de production modifié** — seul ce rapport est ajouté.

### `git status` final (avant commit du rapport)

```
$ git status --short
?? docs/audits/AUDIT_catalogue_vs_llms_20260617.md
```

> Aucun fichier de production (`bpm.tsx`, `llms.txt`, générateurs, `_doc_components.py`, `*-registry.json`) n'apparaît comme modifié. Audit read-only respecté.

### Commandes potentiellement destructrices NON exécutées (signalées, conformément aux contraintes)
- `python scripts/generate-llms-txt.py` (écrit `public/llms.txt`, `llms-core.txt`) — **non exécutée**.
- `python scripts/generate-bpm-components-json.py` (écrit `lib/generated/bpm-components.json`) — **non exécutée**.
- `node scripts/generate-mcp-registry.mjs` (écrit `lib/generated/mcp-registry.json`) — **non exécutée**.
- `npm run gate` en mode write — **non exécutée**.

Tous les décomptes ci-dessus portent sur les **artefacts versionnés tels qu'ils sont dans le repo**, jamais sur une régénération.
