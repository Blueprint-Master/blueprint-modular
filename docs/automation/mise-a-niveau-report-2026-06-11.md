# Rapport — Mise à niveau Blueprint Modular (2026-06-11)

> Routine « tout à niveau » sur la branche `claude/blueprint-modular-upgrade-5jqiah`,
> base `master`. **On code, on complète, on vérifie** — pas d'audit. Chaque lot passe
> le gate (`node scripts/gate.cjs` : tsc + vite build + doc-sync + 230 tests), le
> validateur 8-checks et un smoke fonctionnel (`next start` + curl + assertions DOM)
> avant d'être marqué *done*. **Source `.tsx` = vérité ; aucune prop/API inventée.**

## 0. Outils créés (reproductibles, repris à chaque run)

| Outil | Rôle |
| --- | --- |
| `scripts/validate-components.py` | Validateur **8 checks** par composant (source, jsdoc, props, relations, sémantique, exemple, présence llms.txt, présence catalogue) + scan modules + écriture du ledger. `--write-ledger`, `--strict`, `--json`. |
| `docs/automation/mise-a-niveau.json` | Ledger reprenable : 101 composants + 32 modules, statut réel + écart précis. |
| `scripts/_add_relations.py` / `_add_examples.py` | Générateurs d'édition idempotents (relations, exemples) — contenu authoré, fidèle au rôle réel. |

## 1. Composants — matrice à niveau (avant → après)

| Critère (check) | Avant | Après |
| --- | --- | --- |
| source `.tsx` + interface `*Props` | 80/101* | **101/101** |
| JSDoc composant | 101/101 | **101/101** |
| props documentées | 91/101 | **101/101** |
| relations (PARENT/ASSOCIATED/FORBIDDEN) | 15/101 | **101/101** |
| couche sémantique (description) | 101/101 | **101/101** |
| exemple fonctionnel (`@example`) | 73/101 | **101/101** |
| présence `llms.txt` | 78/101* | **101/101** |
| présence `bpm-components.json` | 101/101 | **101/101** |
| **À NIVEAU (8/8)** | **35/101** | **101/101** ✅ |

\* Les scores « avant » `source` et `in_llms` étaient gonflés par un **bug de casse
du catalogue** (voir §1.1) qui faisait diverger les noms annoncés de l'API réelle.

### 1.1 Correctif de vérité — casse de l'API (23 composants)

`bpm/_doc_components.py` annonçait 23 composants en minuscules
(`bpm.jsonviewer`, `bpm.linechart`, `bpm.qrcode`, …) alors que l'API réelle du
barrel est en camelCase (`bpm.jsonViewer`, `bpm.lineChart`, `bpm.qrCode`, …).
JS étant sensible à la casse, `bpm.jsonviewer` est `undefined` — un agent lisant
le catalogue générait du code cassé, et la fiche `/docs/components/[slug]` ne
retrouvait pas le bloc de props (`getLlmsPropsBlock` cherchait `## bpm.jsonviewer`,
absent de `llms.txt`). **Corrigé** : 23 noms réalignés sur le barrel, catalogue +
registre MCP régénérés, fiches réparées. (Slugs d'URL inchangés.)

### 1.2 Élévation au standard

- **Relations** ajoutées/complétées sur **65 composants** (`@parent`/`@associated`/`@forbidden`),
  fidèles au rôle réel (ex. `bpm.barChart` → forbidden « série temporelle continue —
  utiliser bpm.lineChart » ; `bpm.html` → forbidden « contenu non sanitisé — risque XSS »).
- **`@example` + `@props`** authorés depuis l'interface réelle sur `stepper`, `timeline`,
  `statusTracker`, `orgChart`, `masterDetail`, `wizardForm`, `notificationCenter`,
  `table`, `filePreview`.
- Régénération `llms.txt` / `llms-core.txt` / `bpm-components.json` / `mcp-registry.json`.
- **Aucun rendu existant modifié** : ajouts strictement additifs (JSDoc), asserté par
  le gate (230 tests verts, dont smoke render de chaque `bpm.*`).

## 2. Modules — 31/32 à niveau

| Statut | Nombre | Détail |
| --- | --- | --- |
| **done** | 31/32 | page réelle, composent `bpm.*` (appel `bpm.x()` ou import du barrel `@/components/bpm`), route documentation, aucun 500 |
| **needs-human** | 1/32 | `monitor` |

### `monitor` — needs-human (écart précis)

La route `/modules/monitor` rend `components/Monitor/Monitor.tsx`, qui
**réimplémente localement** badge/chip/button/spinner/panel/message/tabs/textarea
(commentés `// miroir bpm.*`) au lieu de composer le barrel `@/components/bpm`.
La page rend une UI réelle sans 500, mais **ne dogfoode pas** la bibliothèque.
**Mise à niveau requise** : remplacer les ~10 mirrors locaux par les imports
correspondants de `@/components/bpm` (Badge, Chip, Button, Spinner, Panel, Message,
Tabs, Textarea). Non fait dans cette fenêtre : composant volumineux à styles inline
spécifiques, refactor à risque de régression visuelle — réservé à une passe dédiée
avec vérification de rendu, plutôt qu'un swap aveugle.

## 3. Honnêteté de disponibilité (addendum) — vérifié empiriquement

L'addendum supposait PyPI **non publié** (→ masquer/étiqueter Python « bientôt »).
**Vérification empirique en environnement propre :**

| Surface | Registre | `install` | Runtime |
| --- | --- | --- | --- |
| npm `@blueprint-modular/core` | latest **0.2.0** | `npm i` → exit 0 | objet `bpm`, exposé MCP |
| PyPI `blueprint-modular` | **0.1.36** (12+ releases) | `pip install` → exit 0 | `import bpm` ✓, `bpm run/build/init/setup` ✓ |

**Les deux paquets sont publiés et fonctionnent** — aucune commande affichée
n'échoue si copiée. La prémisse « PyPI 404 » est factuellement fausse. Décision
produit (utilisateur) : **« disponible, React en avant »**.

- CTA d'installation principal (hero + final CTA) → `npm i @blueprint-modular/core`.
- `/docs/getting-started` : piste **React/JSX live mise en avant** (install + usage +
  feuille de style + aperçu rendu), puis piste **Python disponible** (`pip install` +
  `bpm init` + `bpm run`) — chemin réel, **jamais étiqueté « bientôt »**.
- i18n FR/EN : `installCommand` → npm ; `reactTrack`/`pythonTrack` (parité typée).

## 4. Vérifications globales

- `node scripts/gate.cjs` : **VERT** (tsc, vite build, doc-sync, **230 tests**).
- `python3 scripts/validate-components.py` : **101/101 à niveau (8/8)**.
- `npx tsc --noEmit` (app Next) : **0 erreur**.
- `npm run build` : **vert** (Next 16.1.6).
- Smoke `next start` (PORT=3123) : `/`, `/docs/getting-started`, `/components`,
  `/modules`, `/modules/veille` → **HTTP 200, pas d'overlay**, marqueurs `bpm.*` et
  `@blueprint-modular/core` présents ; getting-started montre les deux pistes
  (npm + `pip install` + `bpm run`).

## 5. Reste à faire (honnête — pas de complétude feinte)

1. **`monitor`** : dogfooding (cf. §2) — seul item non *done*.
2. **PyPI 0.1.36 < repo 0.1.60** : surface Python publiée mais en retard ; republier
   alignera la version (hors périmètre de ce run — pas de credentials de publication).
3. **Descriptions du registre FR-only** (dette pré-existante) : noms/catégories restent
   en français en locale EN — `description_en` à ajouter dans `_doc_components.py`.

## 6. Convergence

- Branche `claude/blueprint-modular-upgrade-5jqiah`, commits par lot.
- Condition d'arrêt « tout à niveau » : **composants 101/101 ✅**, **modules 31/32**
  (1 needs-human documenté). Boucle reprenable via le ledger.
- **Aucun merge ni déploiement autonome.** Déploiement humain via
  `deploy/deploy-from-git.sh` (gate #19).
