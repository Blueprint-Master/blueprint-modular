# CONTRE-VÉRIFICATION — Canonicité de `master` après le re-rootage du 17/06

- **Date** : 2026-06-18
- **Repo** : `Blueprint-Master/blueprint-modular` — `master` @ `42b5fcf` (avancé depuis `8ed6517` :
  +1 commit = merge de l'audit #1, PR #165).
- **Nature** : **contre-vérification INDÉPENDANTE** de l'audit #1 (`CANONIQUE`). Recalcul à froid,
  sans réutiliser les chiffres de l'audit #1 comme entrées. Le rapport #1 n'a été lu qu'en **Phase 3**
  (réconciliation), après production de mes propres mesures. **READ-ONLY** : aucune écriture sur
  `master`, aucun reset/force-push/merge/rebase/suppression de ref.

---

## VERDICT : **CANONIQUE CONFIRMÉ** ✅

Deux mesures indépendantes **convergent**. Recalculé à froid : master est un **re-root par squash
content-preserving** de l'ancien lignage (94,3 % de fichiers identiques, 0 entrée sémantique
perdue, 2 suppressions intentionnelles), et la **prod tourne sur la lignée master** (empreinte
`total=154` + champ `status`, qui **distingue** master `154` de l'ancien tip `104`). Tous les
chiffres décisifs de l'audit #1 sont reproduits ; les rares écarts sont **expliqués** (master a
avancé d'un commit entre les deux audits) avec **une nuance méthodologique** relevée dans l'audit #1
(comptage des commits depuis `ffe2a68` plutôt que depuis le vrai tip `12b8f18`).

→ **Aucune remédiation requise.** Le déblocage de CAT-3 est fondé.

---

## Phase 0 — Isolation & faits (recalcul indépendant)

```
$ git rev-parse origin/master            → 42b5fcf  (head courant)
$ git rev-list --max-parents=0 origin/master   → 1c9cf9e  refactor(ui): P-PANEL … (#114)
```

**Détermination indépendante du tip ancien** (sans reprendre un SHA d'un rapport non lu) :
parcours de `refs/remotes/origin/`, classement par le **test de disjonction**
`git merge-base origin/master <branch>` (échec = aucun ancêtre commun = ancien lignage), puis tip =
le plus récent par **date de commit** :

| Lignée | Branches | Méthode |
|---|---|---|
| ANCIENNE (disjointe) | **112** | `git merge-base origin/master <b>` échoue |
| COMMUNE (master) | **51** | ancêtre commun existe |
| **Total** | **163** | — |

→ **Tip ancien retenu = `12b8f18`** (`origin/claude/audit-ux-360-modular-p4`, 2026-06-15 14:02),
racine `d2fb7a0`, **disjoint de master confirmé** (`merge-base origin/master 12b8f18` → vide).

**Comptage des commits (depuis le vrai tip `12b8f18`)** :
```
$ git rev-list --count 12b8f18 ^origin/master   → 312   (ancien lignage hors master)
$ git rev-list --count origin/master ^12b8f18   →  54   (master hors ancien)
# (depuis ffe2a68, ancêtre de 12b8f18, on retrouve les 218 de l'audit #1 — cf. Phase 3)
$ git rev-list --count ffe2a68  ^origin/master   → 218
```

---

## Phase 1 — Mesure de contenu (recalculée)

### 1.a — Ratio squash : racine master `1c9cf9e` vs tip ancien `12b8f18`
```
$ git diff --name-status 1c9cf9e 12b8f18   → 38 M, 0 A, 0 D
$ git ls-tree -r --name-only 1c9cf9e | wc -l   → 1380
```
**38 / 1380 fichiers diffèrent → ≈ 97 % identiques**, 0 ajout/suppression. Signature d'un re-root
par squash, pas d'une bascule de projet.

### 1.b — Diff ancien tip `12b8f18` → master HEAD `42b5fcf` (A/M/D + ratio CALCULÉ)
```
A(ajoutés master)=52   M(modifiés)=78   D(supprimés)=2
master=1430 fichiers · ancien-tip=1380 · communs=1378 · IDENTIQUES=1300
→ ratio identiques/communs = 94,3 %   |   identiques/union = 90,8 %
```
> 90 % identiques = content-preserving (seuil de la spec franchi).

### 1.c — Suppressions (D) — liste NOMINATIVE + statut
| Fichier | Présent ancien-tip, absent master | Statut |
|---|---|---|
| `bpm/ollama.py` | oui | **intentionnel** — `41325a5 … purger la surface Ollama (#150)` |
| `bpm/setup.py` | oui | **intentionnel** — remplacé par `pyproject.toml` (présent dans master) |

→ **0 suppression = perte.** Les deux sont des décisions explicites du nouveau lignage.

### 1.d — Artefacts à enjeu — verdict par artefact
| Artefact | Ancien-tip | Master | Verdict |
|---|---|---|---|
| `components/bpm/FunnelChart.tsx` | présent | présent | **IDENTIQUE** |
| `components/bpm/RadarChart.tsx` | présent | présent | **IDENTIQUE** |
| `components/bpm/Treemap.tsx` | présent | présent | **IDENTIQUE** |
| `InterpretContext` (fichiers) | 28 | 29 | master **⊇** (master ahead ; +1 = le rapport d'audit #1 lui-même, mergé via #165) |
| `STRUCTURAL` (occurrences, arbre entier) | 65 | 69 | master **⊇** (declass plus complète) |
| `lib/semantics/bpm-semantics.json` | **101 entrées** | **101 entrées** | **BYTE-IDENTIQUE** — 0 clé perdue, 0 contenu divergent |
| `scripts/validate-semantics.py` | `COMPONENT_DOC` (pré-CAT-4) | `bpm-components.json` (CAT-4) | master **plus avancé** |

→ La couche sémantique Ω (101 entrées) existait **déjà dans l'ancien lignage** et a été transportée
**à l'identique** dans master ; master n'est en avance que sur l'outillage (validateur CAT-4). **Aucun
contenu unique perdu.**

---

## Phase 2 — Quelle lignée est en prod (recalculée)

`curl` direct → `HTTP 403 Host not in allowlist` (artefact d'accès egress, pas un down). Preuve via
le connecteur **MCP_Blueprint** (même artefact déployé) :

| Sonde prod (live) | Résultat |
|---|---|
| `list_components.total` | **154** |
| `get_component('bpm.accordion')` | `status:"curated"`, `semantics{semanticRole:"conteneur", frame:"section", status:"proposed"}` |
| `get_component('bpm.pivotTable')` | `status:"uncurated"`, `semantics:null` |

**Empreinte distinctive (le test qui tranche la lignée)** — accordion/pivotTable seuls ne suffisent
pas (sémantique identique des deux côtés). Le différenciateur est le **catalogue** :

| | Ancien-tip `12b8f18` | Master | **PROD** |
|---|---|---|---|
| `bpm-components.json` total | **104** | **154** | **154** |
| champ `status` (curated/uncurated) | **absent** | **présent** | **présent** |

→ La prod expose `154` + champ `status` = **signature CAT-1+CAT-4**, exclusive au **nouveau lignage**.
L'ancien tip est à `104` sans `status`. **Prod = lignée master, prouvé** (et `pivotTable:null` confirme
l'état pré-CAT-3, cohérent avec master).

---

## Phase 3 — Réconciliation avec l'audit #1

| Mesure | Audit #1 (`@8ed6517`) | Contre-vérif (`@42b5fcf`) | Concordance |
|---|---|---|---|
| Racine master | `1c9cf9e` (#114) | `1c9cf9e` (#114) | ✅ identique |
| Racine ancien lignage | `d2fb7a0` | `d2fb7a0` | ✅ identique |
| Disjonction | aucun ancêtre commun | aucun ancêtre commun | ✅ identique |
| Tip ancien | `12b8f18` | `12b8f18` (redéterminé indépendamment) | ✅ identique |
| Branches anciennes | **112** | **112** | ✅ identique |
| Branches nouvelles / total | 50 / 162 | 51 / 163 | ⚠️ **+1** = branche `audit/lignage-master-replatform` poussée depuis |
| Ratio squash (root) | 38 / 1380 | 38 / 1380 | ✅ identique |
| A / M / D (tip→master) | 51 / 78 / 2 | **52** / 78 / 2 | ⚠️ **A +1** = le rapport d'audit #1 mergé (#165) |
| Suppressions | ollama.py, setup.py | ollama.py, setup.py | ✅ identique |
| Candidats funnel/radar/treemap | identiques | identiques | ✅ identique |
| Prod (total / accordion / pivot) | 154 / curated / null | 154 / curated / null | ✅ identique |
| **Verdict** | **CANONIQUE** | **CANONIQUE** | ✅ **convergent** |

### Écarts relevés — tous expliqués, aucun n'affecte le verdict
1. **Branches 51 vs 50, A 52 vs 51, master^ancien 54 vs 53** : `master` a avancé d'**un commit**
   entre les deux audits (merge de l'audit #1, PR #165). Le rapport `.md` lui-même est le fichier
   ajouté (+1 A) et fait même monter `InterpretContext` de 28→29 (il cite le terme). Auto-cohérent.
2. **Comptage commits — nuance méthodologique de l'audit #1** : l'audit #1 a compté **218** commits
   « ancien lignage hors master » **depuis `ffe2a68`**, mais a fait son **diff de contenu depuis le
   vrai tip `12b8f18`** (plus récent, dont `ffe2a68` est ancêtre). Mesuré de façon **cohérente depuis
   `12b8f18`**, le compte est **312**, pas 218. Ce n'est pas une erreur de contenu — c'est un choix de
   point de référence : « 218 » sous-évalue la divergence d'historique totale de l'ancien lignage
   (réelle = **312** depuis son tip). **Le verdict de contenu est inchangé** (94,3 % identiques, 0 perte).
3. **`STRUCTURAL`** : l'audit #1 a grepé `components/bpm/*.tsx` (→ 0=0) ; j'ai grepé l'arbre entier
   (→ 65 ancien / 69 master). Différence de **portée**, pas de contenu ; master ⊇ dans les deux cas.

### Apport de la contre-vérification (au-delà de la simple reproduction)
- **Preuve `bpm-semantics.json` byte-identique** (101=101, 0 perte) — l'audit #1 ne l'avait pas
  établi nominativement ; renforce « 0 contenu sémantique perdu ».
- **Empreinte distinctive `104` vs `154` + champ `status`** — l'audit #1 prouvait `prod=master` via
  accordion/pivotTable, mais ces deux-là ont une sémantique **identique** des deux côtés, donc ne
  distinguaient pas à eux seuls les lignées. Le différenciateur `catalogue 104↔154` **ferme ce trou**
  et rend la preuve `prod=master` **décisive**.

---

## VALIDATION — intégrité (aucune ref modifiée)
```
$ git rev-parse --short origin/master     → 42b5fcf   (INCHANGÉ pendant l'audit)
$ git branch --show-current               → audit/contre-verif-lignage-master  (jetable, jamais master)
$ git status --short                       → seul ce rapport (sur la branche audit/)
```
- Chiffres indépendants : 112 branches anciennes · tip `12b8f18` · 312 commits (depuis tip) / 218
  (depuis `ffe2a68`) · ratio identiques **94,3 %** · A/M/D **52/78/2** · 2 suppressions intentionnelles
  · sémantique **101=101 byte-identique** · prod **154+status**. ✅
- Verdict : **CANONIQUE CONFIRMÉ** (convergence indépendante avec l'audit #1). ✅
- Aucune opération destructive ; aucune branche modifiée/supprimée ; CAT-3 non livré ici. ✅
