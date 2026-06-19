# AUDIT — Défauts de consommation LLM des composants `bpm.*` contre la version réelle 0.3.x

- **Date** : 2026-06-18
- **Repo** : `Blueprint-Master/blueprint-modular` — `master` @ `d173139`
- **Version mesurée** : **`@blueprint-modular/core` 0.3.1** (`packages/core/package.json`),
  barrel **154 exports** (`packages/core/src/bpm.tsx`), catalogue **154**
  (`lib/generated/bpm-components.json`). **Toute mesure ci-dessous se réfère à cette source 0.3.x**,
  pas au `dist/` ni aux chiffres de la note (0.2.0 / 98 composants vendored).
- **Nature** : audit **READ-ONLY**. Aucun composant / doc / générateur modifié. Seul ce rapport est
  écrit (branche `audit/bpm-consommation-llm`). Aucune correction — les chantiers proposés (Phase D)
  sont des décisions humaines.
- **Convention** : chaque constat est **FAIT** (lu, chemin:ligne cité), **HYPOTHÈSE** ou **INCONNU**.

---

## TL;DR — périmètre réel des défauts en 0.3.x

| Axe | Verdict | Périmètre |
|---|---|---|
| **A — Hardcoding couleur** | **1 vrai défaut** | core `Button.tsx` (table de variantes, 0 token) ; candidat mineur `Tooltip.tsx` (défauts non tokenisés) |
| **B — Contrat de doc** | **2 lacunes réelles** | **91/154 sans exemple** ; **convention booléenne incohérente** (`toggle.value` vs `checkbox.checked`) |
| **B — déjà OK en 0.3.x** | obsolète | type d'arg callback **exposé 14/14** ; versions cohérentes par artefact |
| **C — Cycle de vie conteneurs** | **non documenté** | `tabs` + `wizardForm` + `expander` **démontent** le content inactif ; `accordion` le **préserve** — incohérence + contrainte non spécifiée |

---

## Phase A — Hardcoding couleur

**Méthode** : grep `#[0-9a-fA-F]{3,6}` + `rgb()/hsl()` sur `components/bpm/*.tsx` (153) et
`packages/core/src/components/Button/` (le Button réellement exporté). Classification de **chaque
occurrence** : token-fallback / doc / theme-def / domaine / **naked charte en rendu (DÉFAUT)**.

**Chiffres (85 occurrences hex classées)** :
| Catégorie | Occ. | Statut |
|---|---|---|
| `var(--bpm-x, #hex)` (token + fallback) | 25 | **LÉGITIME** (c'est le bon pattern) |
| JSDoc `@param`/`@example` | 13 | LÉGITIME (doc) |
| Définition de palette `"--bpm-bg": "#0f172a"` (`PageLayout.tsx:110-126`) | 12 | LÉGITIME (source des tokens de thème) |
| Domaine/structurel (color picker, charts, canvas signature, marqueur carte, QR) | 6 | LÉGITIME |
| **Naked charte en rendu** | **29** | **DÉFAUT — tous dans `Button.tsx`** |

**139/153 composants lisent déjà `var(--bpm-*)`** (1623 occurrences) — la tokenisation est la norme ;
le défaut est concentré, pas systémique.

### A.6 — Button (FAIT) : la table de variantes est **toujours hardcodée** en 0.3.x
- **Le Button exporté = `packages/core/src/components/Button/Button.tsx`** (barrel `bpm.tsx:8`
  `import { Button } from "./components/Button"` → `bpm.tsx:415 button: wrap(Button)`).
- **0 occurrence de `var(--bpm` dans ce fichier.** Table de variantes en dur (`Button.tsx:49-122`) :
  ```
  primary   : background "#2563eb", color "#ffffff", border "#1d4ed8", hover "#1d4ed8", active "#1e40af"
  secondary : background "#ffffff", color "#111827", border "#c8cdd6", …
  outline   : color "#2563eb", border "#93c5fd", hover bg "#eff6ff" …
  ghost     : color "#6b7280", hover bg "#f4f5f7" …
  destructive: background "#dc2626", border "#b91c1c", hover "#b91c1c", active "#991b1b"
  ```
- **Conséquence LLM/theming (FAIT)** : changer `--bpm-primary` **ne change pas** la couleur des
  boutons (elle est figée à `#2563eb`). Le hook `style`/`className` existe bien en 0.3.x (override
  per-instance), mais la **charte** n'est pas thématisable. → **C'est le défaut #2/#3 de la note,
  CONFIRMÉ pour 0.3.1.**

### A.7 — Périmètre du chantier couleur
- **DÉFAUT à tokeniser** : `packages/core/src/components/Button/Button.tsx` (table de variantes).
- **Candidat mineur** : `Tooltip.tsx:119-120` — `background: backgroundColor ?? "#1a1a1a"`,
  `color: textColor ?? "#ffffff"` : défauts non tokenisés (le user peut surcharger via props, mais le
  défaut pourrait être `var(--bpm-tooltip-bg, #1a1a1a)`). Priorité basse.
- **Hygiène (hors couleur)** : `components/bpm/Button.tsx` (25 hex) est **du code mort** — **aucun
  import** (`grep` sur packages/core, components, app, lib → 0). C'est un doublon legacy du Button ;
  à supprimer dans un chantier séparé (ne change rien au runtime).
- **Non-défauts** : `PageLayout` (définit la palette), color picker / charts / QR / signature / GpsMap
  (couleur de domaine ou structurelle), et tous les `var(--bpm-x, #hex)` (tokenisés avec fallback).

---

## Phase B — Delta du contrat de doc

### B.8 — Type d'arg de callback : **DÉJÀ EXPOSÉ (note obsolète)**
FAIT : sur 14 composants interactifs à `onChange`, **14/14 exposent l'arg typé** dans `props`
(`lib/generated/mcp-registry.json`, dérivé de `public/llms.txt`) :
```
toggle (checked: boolean) · checkbox (checked: boolean) · numberInput (value: number|null)
selectbox (value: string) · radioGroup (value: string) · slider (value: number)
dateInput (value: Date|null) · dateRangePicker (start, end: Date|null) · input/textarea (value: string)
rating (value: number) · autocomplete (value: string) · colorPicker (value: string)
```
→ Le LLM **voit** le type de l'argument (valeur typée, pas un event DOM). **Lacune de la note levée
en 0.3.x.** (fileUploader n'a pas de `onChange` — callbacks `onUpload`/`onFiles`, hors périmètre.)

### B.9 — Exemples : **91/154 sans exemple** (FAIT, lacune réelle)
`lib/generated/mcp-registry.json` : **63/154 ont `example` non-null, 91/154 ont `example: null`**
(59 %). Inclut des primitives très utilisées (toggle, pivotTable, button…). → Un LLM n'a pas de
patron d'appel pour 59 % du catalogue.

### B.10 — Cohérence de version : **non-défaut (note obsolète)**
Trois **artefacts distincts**, chacun sa version, cohérents :
| Surface | Version | Artefact |
|---|---|---|
| `packages/core/package.json` | **0.3.1** | npm `@blueprint-modular/core` |
| `pyproject.toml` | **0.1.54** | PyPI `blueprint-modular` |
| `package.json` (racine) | **0.1.60** | l'app/site (non publiée) |
| `public/llms.txt` (en-tête) | cite **core 0.3.1** + **python 0.1.54** | ✔ les bonnes versions de package |
→ La « divergence 0.2.0 vs 0.1.60 » de la note est **périmée** : le core est passé 0.2.0→**0.3.1**, et
les multiples numéros sont **intentionnels** (3 artefacts), validés par le gate (`generate-versions.mjs
--check`, étape « Version consistency »). **Aucun défaut de version résiduel.**

### B.11 — Convention booléenne **incohérente** (FAIT, piège LLM)
| Composant | Prop contrôlée | Callback |
|---|---|---|
| `bpm.toggle` | **`value?: boolean`** | `onChange?: (checked: boolean)` |
| `bpm.checkbox` | **`checked?: boolean`** | `onChange?: (checked: boolean)` |
(source `mcp-registry.json` / `components/bpm/{Toggle,Checkbox}.tsx`)
→ Deux entrées booléennes, **deux noms de prop contrôlée différents** (`value` vs `checked`). Un LLM
qui a appris `checkbox.checked` câblera `toggle.checked` (ignoré) ou inversement. Les callbacks, eux,
sont cohérents (`(checked: boolean)`). **Piège réel ; FAIT établi, non corrigé.**

### Sortie B — delta chiffré
| Manque au contrat | Mesure | Gravité LLM |
|---|---|---|
| Exemples | **91/154** sans `example` | haute (59 % sans patron) |
| Convention booléenne | `toggle.value` ≠ `checkbox.checked` | haute (mauvaise prop câblée) |
| Type d'arg callback | 0 manquant (14/14 OK) | — (résolu) |
| Cohérence version | 0 divergence (3 artefacts gate-checkés) | — (résolu) |

---

## Phase C — Cycle de vie des conteneurs

**Méthode** : lecture du rendu du content (rendu conditionnel `{cond && …}` / `return null` =
**démontage** ; classe CSS `--open` / `display` sans conditionnel = **monté, préservé**).

| Conteneur | Content inactif | État React préservé | Preuve |
|---|---|---|---|
| **`tabs`** | **DÉMONTÉ** | **NON** | `Tabs.tsx:69` `activeContent = normalizedTabs[activeTab]?.content` ; `:99` `{activeContent}` (seul l'actif est rendu) |
| **`wizardForm`** | **DÉMONTÉ** | **NON** | `WizardForm.tsx:115` `{steps[stepIndex]?.content}` (seule l'étape courante) |
| `expander` | DÉMONTÉ | NON | `Expander.tsx:55` `{isExpanded && (…)}` |
| `modal` | DÉMONTÉ (à la fermeture) | NON (attendu) | pattern `{isOpen && bpm.modal({…})}` (`Modal.tsx:27`) |
| `drawer` | DÉMONTÉ | NON (attendu) | `Drawer.tsx:51` `if (!open) return null` |
| `confirmModal` | DÉMONTÉ | NON (attendu) | `ConfirmModal.tsx:78` `if (!isOpen) return null` |
| **`accordion`** | **MONTÉ** (CSS) | **OUI** | `Accordion.tsx:85-89` content toujours rendu, classe `--open` togglée (pas de `&&`) |
| `splitView` | MONTÉ | OUI | `SplitView.tsx` : 0 `return null`/conditionnel |
| `masterDetail` | MONTÉ | OUI | `MasterDetail.tsx` : 0 `return null` |

### Constats (FAIT)
1. **`bpm.tabs` démonte le content inactif** : un formulaire/état dans l'onglet 2 est **perdu** au
   passage à l'onglet 1 puis retour. **Non spécifié** dans le catalogue (`props` = `tabs` seulement).
2. **Incohérence `tabs` ↔ `accordion`** : deux conteneurs « une section visible à la fois »,
   **comportements opposés** (tabs démonte, accordion préserve). Piège pour un LLM qui suppose l'un
   d'après l'autre.
3. **`wizardForm` démonte les étapes** : l'état d'une étape précédente est perdu sauf si le consommateur
   le remonte (lift). Classique, mais non documenté.

### Sortie C — verdict par conteneur
- **`tabs`, `wizardForm`** : soit **documenter la contrainte** (« content démonté, l'état des onglets/
  étapes non actifs ne survit pas ; lever l'état dans le parent »), soit **changement de comportement
  (`keepMounted`)** — décision humaine. L'audit établit le FAIT, ne tranche pas.
- **`expander`** : documenter (collapse = démontage).
- **`modal`/`drawer`/`confirmModal`** : comportement attendu ; documenter pour mémoire.
- **`accordion`/`splitView`/`masterDetail`** : préservent l'état (les « sûrs ») — rien à faire.

---

## Phase D — Synthèse & chantiers PROPOSÉS (non exécutés)

| Chantier | Périmètre (de cet audit) | Type | Bump |
|---|---|---|---|
| **Couleur** | Tokeniser la table de variantes de `Button.tsx` en `var(--bpm-…, #hex)` (fallback préservé) ; option : Tooltip défauts ; supprimer le Button mort `components/bpm/Button.tsx` | additif visuel | **mineur 0.3.1 → 0.4.0** (changement de thématisation), **PAS 0.3.0** (numéro de la note périmé) |
| **Doc — exemples** | Ajouter un `@example` aux **91** composants sans exemple | additif | patch/mineur |
| **Doc — convention booléenne** | Aligner `toggle` sur `checked` (ou inversement) **ou** documenter l'écart de façon proéminente | aligner = **breaking** ; documenter = additif | mineur (doc) / majeur (si renommage prop) |
| **Conteneurs** | Documenter le cycle de vie (monté/démonté) par conteneur ; décider `keepMounted` pour `tabs`/`wizardForm` au cas par cas | additif (doc) ou mineur (option `keepMounted`) | mineur |

### D.17 — Points de la note **DÉJÀ obsolètes/résolus en 0.3.x** (à NE PAS ré-instruire)
- **`bpm.toggle` existe** (status curated, `value?:boolean` / `onChange (checked:boolean)`) — P0 « composant fantôme » **clos**.
- **`bpm.button` expose `className` ET `style`** — le hook de surcharge absent en 0.2.0 existe ; la question résiduelle est **uniquement** la tokenisation couleur (Phase A), pas l'absence de surcharge.
- **Type d'arg de callback exposé** (14/14) — la lacune « le LLM ne voit pas le type » est **levée**.
- **Versions** : « 0.2.0 vs 0.1.60 » **périmé** (core = 0.3.1 ; 3 artefacts intentionnels, gate-checkés).

---

## VALIDATION
- Phase 0 : core **0.3.1**, barrel **154**, catalogue **154**. ✔
- Phase A : 85 hex classées ; **DÉFAUT = `Button.tsx` (29 naked, 0 token)** ; button **non tokenisé en 0.3.x** confirmé ; dead-code `components/bpm/Button.tsx` signalé. ✔
- Phase B : **91/154 sans exemple** ; callback typé **14/14** ; versions **3 artefacts cohérents** ; **`toggle.value` ≠ `checkbox.checked`**. ✔
- Phase C : `tabs`/`wizardForm`/`expander` **démontent** (code cité) ; `accordion`/`splitView`/`masterDetail` **préservent** ; incohérence tabs↔accordion. ✔
- Phase D : 4 chantiers proposés (bump couleur = **mineur**, pas 0.3.0) + 4 points de note obsolètes. ✔

### Intégrité
```
$ git status --short      → seul docs/audits/AUDIT_bpm_consommation_llm_20260618.md (branche audit/)
$ git rev-parse --short origin/master   → d173139 (inchangé)
```
Aucun composant / doc / générateur modifié. Audit strictement read-only.
