# Rapport d'élévation des composants bpm.* — run du 2026-06-10

Branche : `claude/elevate-bpm-components-18r36d` · Gate final : **VERT (232 tests)** · Aucun rendu existant modifié (additif strict, asserté par tests).

## Ce qui a été fait

### Phase 0 — Classification
154 clés du barrel `packages/core/src/bpm.tsx` classées dans `docs/elevation-ledger.json` :
**25 INSTRUMENT · 47 DATA · 47 STRUCTURAL · 35 INTERACTIF**. Le ledger est la source de vérité reprenable (statuts `done` / `todo`, checkpoints de prise de recul consignés).

### Phase 1 — Socle partagé
- **`components/bpm/interpret.ts`** : primitive pure `interpret(value, context) → Judgment`
  - `value` : scalaire **ou** trajectoire `[{t, v}]` (t numérique ou Date, tri interne) ;
  - `level` : gap orienté par `direction` (zone neutre paramétrable `neutralBand`, défaut ±2 %) ;
  - `trend` : pente par moindres carrés, orientée (improving / flat / worsening) ;
  - `anomaly` : > 2σ du `comparisonFrame` ;
  - `severity` ∈ [0,1] : 0.5×écart-défavorable-normalisé + 0.25×worsening + 0.25×abnormal ;
  - aides partagées : `judgmentColor`, `trendArrow`, `judgmentLabel`, `lastValue`.
  - **15 tests d'assertion** dans `packages/core/gate/interpret.test.ts` (toutes les exigences de la note : valeur ≫ référence & higher_is_better → favorable ; pente < 0 vs higher_is_better → worsening ; orientation inversée ; anomalie 2σ ; bornes de sévérité).
- **Showcase** : registre `components/showcase/registry.tsx` + rendu `ElevationShowcase` ajouté en fin de page `/components` existante (la page historique est intacte ; la section liste chaque composant élevé en états *défaut / déviant / trajectoire*).

### Phase 2 — Élévation (26 composants au standard)

#### Tableau avant → après

| Composant | Classe | Avant | Après (additif) |
|---|---|---|---|
| metric | INSTRUMENT | affiche valeur + delta manuel | `value` accepte v(t) ; `context` → bordure jugée, ligne écart/tendance/anomalie (role=status), sparkline de mouvement |
| progressRing | INSTRUMENT | anneau accent | anneau coloré par verdict, flèche de tendance au centre, `<title>` + aria |
| progress | INSTRUMENT | barre accent | barre colorée par verdict, ligne de verdict, v(t) accepté |
| liveGauge | INSTRUMENT | zones seuil manuelles | valeur colorée par verdict + flèche + ligne de verdict, v(t) accepté |
| sparkline | INSTRUMENT | couleur pilotée à la main (`trend`) | couleur **jugée** par interpret, ligne de repère pointillée, `points` v(t), role=img + aria-label |
| statusBox | INSTRUMENT | statut catégoriel | `value`+`context` → verdict à côté du libellé, bordure jugée |
| highlightBox | INSTRUMENT | bloc éditorial | `measure`+`context` → barre latérale jugée + ligne de verdict |
| labelValue | INSTRUMENT | paire label/valeur | valeur colorée + suffixe ▲/▼/↗/↘/⚠, `trajectory`, jamais de faux jugement sur valeur non numérique |
| anomalyAlert | INSTRUMENT | gravité manuelle | gravité **dérivée** de `interpret().severity` (info/warning/critical), verdict + % sévérité, `history` v(t) |
| machineStatus | INSTRUMENT | LED catégorielle | `value`+`context` → verdict mesuré pouvant diverger de la LED (LED verte mais cadence en chute) |
| lineChart | INSTRUMENT | trace neutre | série jugée comme v(t) : repère pointillé, couleur verdict, aria descriptif |
| areaChart | INSTRUMENT | idem | idem lineChart (aire) |
| barChart | INSTRUMENT | barres uniformes | **chaque barre jugée individuellement** + repère + verdict global |
| scatterChart | INSTRUMENT | points uniformes | points jugés, **anomalies > 2σ cerclées** (data-abnormal), repère |
| liveChart | INSTRUMENT | seuils manuels | fenêtre glissante jugée : courbe verdict, repère, ligne de verdict |
| rating | INSTRUMENT | étoiles accent | étoiles colorées vs note cible, écart + tendance (`history`) |
| loadingBar | INSTRUMENT | barre de chargement | avancement déterminé (iso) jugé vs repère attendu ; indéterminé = jamais jugé |
| sensorGrid | INSTRUMENT | statuts catégoriels | **context par capteur** : bordure jugée, verdict, `history` v(t) |
| predictiveChart | INSTRUMENT | prévision neutre | **la trajectoire prédite est jugée** (verdict sur le futur projeté) |
| comparison | INSTRUMENT | highlightBest | **contexts par dimension** : chaque cellule jugée vs repère, écart en title |
| heatmap | INSTRUMENT | dégradé de valeur | chaque cellule jugée : liseré verdict, anomalies soulignées, infobulle enrichie |
| waterfall | INSTRUMENT | cascade neutre | cumul final jugé, verdict sous la cascade |
| funnelChart | INSTRUMENT | entonnoir neutre | conversion globale jugée vs cible %, verdict sous l'entonnoir |
| treemap | INSTRUMENT | tuiles | tuiles jugées (contour) + verdict global sur le total |
| radarChart | INSTRUMENT | polygone accent | **anneau de repère pointillé**, polygone coloré par verdict de la moyenne |
| table | DATA | tri + empty | hook d'interprétation **par colonne** (`column.context`), états loading (squelettes, aria-busy) / error (role=alert), densité `compact`, aria-sort |

Conventions communes (uniformité) : prop optionnelle `context` (ou `contexts` par dimension/capteur/colonne pour les multi-valeurs), `data-judgment` sur l'élément jugé, `role=status` ou `role=img`+`aria-label` pour la révélation, `judgmentColor/judgmentLabel/trendArrow` partout, repère pointillé pour les représentations spatiales. **Appel inchangé → rendu inchangé**, asserté par `packages/core/gate/elevated.test.tsx` (un test « sans context → aucun marqueur » par composant).

#### Prises de recul (consignées dans le ledger)
- **Après 10** : dérive détectée — duplication du calcul « trier la trajectoire et prendre le dernier point » → helper partagé `lastValue()` ajouté ; convention de nommage de la prop trajectoire consignée (élargir la prop numérique existante quand elle existe, sinon nom sémantique : `measure`, `history`, `trajectory`, `points`).
- **Après 25** : pattern stable ; les représentations multi-valeurs jugent **par élément** (barre, point, cellule, capteur, tuile, colonne) — c'est la forme la plus fidèle au principe « la représentation réagit au type d'écart ».

### Phase 3 — Surface de test
- **Route `/components`** (page existante conservée) : section « Élévation — jugement & états » en fin de page, pilotée par le registre. Chaque composant traité y est rendu en *défaut* (preuve de non-régression visuelle), *déviant* (context fourni → jugement révélé) et *trajectoire* (v(t) → niveau + tendance) quand pertinent. Vérifié en local : `npm run dev` → GET /components 200, les 26 sections `#elevated-*` sont rendues côté serveur.
- Gate final **VERT** : tsc, vite build, doc-sync (llms.txt / bpm-components.json régénérés à chaque commit), 232 tests vitest (156 historiques + 15 interpret + 61 élévation).

## FAILURES
Aucun composant marqué `failed` : tous les composants **traités** ont passé le gate du premier coup (le gate a été exécuté avant chaque commit ; aucun commit n'a été fait sur gate rouge).

## RESTE À FAIRE (rapport honnête — pas de complétude feinte)
- **128 composants `todo`** dans le ledger : 46 DATA (hors table), 47 STRUCTURAL, 35 INTERACTIF. La consigne « instruments d'abord » a été suivie : la valeur centrale de la note technique (porter un jugement) est faite à 100 % (25/25). Les rubriques DATA/STRUCTURAL/INTERACTIF sont gelées dans le ledger ; `table` sert de composant de référence pour la rubrique DATA (états + hook d'interprétation par cellule).
- Reprise : le ledger est idempotent — reprendre la boucle phase 2 sur le premier `todo`, dans l'ordre DATA → STRUCTURAL → INTERACTIF, avec `/tmp` remplacé par les scripts du repo (`npm run gate`, générateurs python, `npx vitest -u`).

## Écarts de process assumés
- Deux commits groupés au lieu d'un par composant : `progressRing + progress` (paire jumelle) et `waterfall + funnelChart + treemap + radarChart` (quatuor de clôture) — les fichiers registre/tests sont partagés et le gate a validé chaque groupe en entier. Tous les autres composants : un commit chacun.

## AUTO-CRITIQUE — composants où je suis le moins sûr que l'élévation respecte l'intention de design
1. **funnelChart** : juger la seule conversion globale (dernière/première étape) est réducteur — l'intention d'un entonnoir est souvent l'écart **par étape** ; en layout horizontal le verdict n'est révélé qu'en title/aria (pas de caption), c'est une révélation faible.
2. **treemap / radarChart** : le « jugement global » (total / moyenne des axes) est une agrégation que la note ne prescrit pas ; pour un radar, juger chaque axe contre son propre repère serait plus fidèle mais demande une API `contexts[]` par axe.
3. **loadingBar** : c'est un indicateur de chargement ; le jugement « avancement vs attendu » n'a de sens que pour le variant déterminé `iso`. La classification INSTRUMENT est discutable (STRUCTURAL-feedback aurait pu se défendre).
4. **highlightBox** : composant éditorial (RTB/Cible) ; la prop `measure` greffe un usage KPI qui n'était peut-être pas l'intention d'origine — la barre latérale colorée par le verdict écrase la sémantique « couleur de marque » quand `barColor` est omis et `context` fourni.
5. **anomalyAlert** : les seuils de dérivation de gravité (0.15 / 0.5 sur severity) sont arbitraires ; documentés dans la JSDoc, mais un designer pourrait vouloir les calibrer.
6. **Metric + sparkline imbriqué** : l'ajout d'un mini-sparkline dans la ligne de verdict densifie le composant ; sur des grilles très denses (`compact`), cela peut surcharger — le sparkline n'apparaît toutefois que si l'appelant passe une trajectoire.

## Route de test
`npm run dev` → http://localhost:3000/components — section « Élévation — jugement & états » en bas de page.
