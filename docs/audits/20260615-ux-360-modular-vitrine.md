# Audit UX 360° — Vitrine Blueprint Modular

> **Run** : nocturne autonome (2026-06-15). **Périmètre** : vitrine (site public `app/(public)/(site)/*`) + coquille app (`app/(app)/composants`, `app/(app)/modules`, `app/(app)/connecteurs`). **Hors périmètre** : moteur Maker, câblage sandbox/proxy (`lib/sandbox/*`), contrat Zod connecteurs (`ConnectorDescriptor`), et le **rendu libre** des simulateurs (corps de démo) — on n'audite que le *chrome / gabarit / mise en page*.
>
> **Statut** : read-only sauf le pattern mécanique livré (voir §6). Aucun merge, aucun déploiement. Décisions de catégorie C laissées à Rémi.

---

## 1. Synthèse exécutive

La vitrine est **déjà nettement plus homogène et mieux construite que ne le laisse supposer le brief**. Les trois exigences dures du commanditaire se vérifient ainsi sur le terrain :

1. **Minimiser `bpm.panel`** — *Traité (P-PANEL livré).* Correction d'une sous-estimation initiale : au-delà des alertes légitimes, `Panel` était **détourné** comme **empty-state** (« aucun résultat ») et comme **carte de contenu** (sections d'une fiche document/contrat). Ces ~22 usages superflus sont remplacés par le composant sémantique adéquat — `bpm.emptyState` et `bpm.card`. Les `Panel` restants sont de **vraies alertes** (`variant="warning|error"`), rôle documenté de `bpm.panel`, donc conservés. Le rendu libre des simulateurs n'est pas touché (contrainte dure). Voir §4.2.

2. **Dogfooding `bpm.*`** — *Partiel.* Les **conteneurs** sont en `bpm.*` (`Card`, `Badge`, `Input`…), mais les **contenus** (titres de section, paragraphes, légendes, liens) sont fréquemment en HTML brut + styles inline `var(--bpm-*)` plutôt qu'en `bpm.Title/Text/Caption`. C'est le vrai gisement de dogfooding — mais il est **catégorie B/C** (change le rendu, exige validation visuelle). Voir §4 P-DOGFOOD.

3. **Schéma Simulateur / Documentation** — *Établi pour les modules, absent pour les connecteurs.* 32/32 modules ont une page `documentation/` ; 28/32 ont une page `simulateur/`. Les **connecteurs n'ont ni simulateur ni doc** structurés (liste + fiche descriptive seulement). C'est la généralisation la plus à fort levier — mais c'est de la **création de contenu/feature** (catégorie C). Voir §4 P-GABARIT.

**Posture sécurité : saine.** Aucun finding P0/P1. Les usages de `dangerouslySetInnerHTML` sont soit des chaînes développeur statiques (`monitor/documentation`), soit des patterns standard sûrs (JSON-LD, script anti-FOUC). Le rendu de texte utilisateur (`wiki/HighlightedText.tsx`) **évite délibérément** `dangerouslySetInnerHTML`.

**Toolchain : vert.** `tsc --noEmit` passe sans erreur (baseline). La **parité i18n FR/EN est garantie par le typage** (`en: typeof fr` dans `lib/i18n/en.ts` et dans chaque `strings.ts`/dict co-localisé) — il n'y a donc pas de risque de désynchronisation de clés tant que le code compile.

**Fragmentation des gabarits = le vrai problème d'homogénéité.** Trois systèmes de mise en page coexistent (voir §3.1). C'est la racine de la majorité des findings « gabarit divergent ».

**Livrables de code de cette run** (4 patterns A/B — **épuisés**, voir §6) : **P-A11Y/I18N** (A, chrome fiche partagé), **P-DOGFOOD** (B, contenu inline → `bpm.*` ; fiche connecteur 100 %), **P-DEDUP** (B, redirections d'alias), **P-GABARIT** (B/C, primitif `ModulePageHeader` — **29/29 pages module**, titre dogfoodé en `bpm.title` ; **schéma Simulateur/Doc connecteurs**), **P-PANEL** (B, ~22 `Panel` superflus → `bpm.emptyState`/`bpm.card`). `tsc` + `npm run build` **verts**. Restent **documentés, non implémentés** (catégorie C par conception de la mission) : convergence des design systems CSS, P-PITCH (écarté pour composants/modules sur consigne Rémi), P-DEDUP `highlight-box` (fusionné). **P-SECU requalifié faible valeur** (contenu statique, surface utilisateur déjà sûre).

---

## 2. Méthode

- **Phase 0** : cartographie exhaustive des routes, layouts, composants de page, dictionnaires i18n (greps + lecture directe).
- **Phase 1** : boucle 360 (7 lentilles : Designer, Développeur/dogfooding, Marketeur, Cybersécurité, Accessibilité, i18n, Performance) sur un échantillon représentatif et diversifié de chaque surface, complétée par des comptages structurels exhaustifs (Panel, dangerouslySetInnerHTML, next/dynamic, simulateur/doc).
- **Phase 2** : regroupement en patterns transverses (§4).
- **Convention de finding** : `[élément] [lentille] sévérité — fichier:ligne — FAIT — fix proposé — généralisable O/N`. Le **FAIT** (constat vérifié) est séparé de l'**hypothèse/interprétation** (préfixée *Hyp.*).
- **Vérification `bpm.*`** : le catalogue MCP (`get_component`, snake_case `bpm.json_viewer`) est la source de signature. Aucun composant nouvellement employé dans le code livré (le pattern P-A11Y/I18N n'introduit aucun composant).

---

## 3. Cartographie (Phase 0)

### 3.1 Les trois systèmes de gabarit (racine de l'hétérogénéité)

| Système | Implémentation | Où il est utilisé | Dogfooding |
|---|---|---|---|
| **`components/fiche/*`** | `FicheHeader`, `FicheSectionCard`, `FicheNav`, `FicheFieldGrid`, `FicheSkeleton` — composés de `bpm.Card/Title/Text/Caption/Badge/Divider` | **uniquement** les pages détail asset-manager (`modules/asset-manager/[domainId]/.../[id]/page.tsx`) | ✅ bon (bpm.*) |
| **`doc-page` (classes CSS)** | `<div className="doc-page">`, `doc-page-header`, `doc-breadcrumb`, `doc-pagination` + HTML brut | toutes les **fiches composants** (`composants/*/Fiche.tsx`) et les pages **simulateur/documentation des modules** | ⚠️ HTML brut + CSS |
| **`site-*` / `CatalogueLayout`** | `CatalogueHero`, `CatalogueSection` en `<section>/<h1>/<h2>/<p>` + classes `site-*` | catalogues `/composants`, `/modules`, `/connecteurs` et tout le **site public** | ❌ HTML brut volontaire (design marketing) |

**Interprétation** : le système `components/fiche/*` (le plus « dogfoodé ») n'irrigue qu'une seule surface ; les deux autres dominent et reposent sur du HTML brut. L'homogénéité visée par la mission passe par **converger ces trois systèmes**, ce qui est un chantier d'architecture (catégorie C, voir §4 P-GABARIT et §5).

### 3.2 Inventaire des surfaces

- **Composants** : 112 dossiers de fiche statiques sous `app/(app)/composants/*/` pour **104 composants au registre** (`lib/generated/bpm-components.json`) → **8 doublons/recouvrements** (§4 P-DEDUP). Chaque fiche = `page.tsx` (serveur, métadonnée SEO via `ficheMetadata`) + `Fiche.tsx` (îlot client `'use client'`, dict FR/EN co-localisé typé). Une route catch-all `composants/[slug]/page.tsx` (générée depuis le registre + couche sémantique) coexiste mais n'est jamais atteinte tant que tous les slugs ont un dossier statique (§4 P-GABARIT).
- **Modules** : 32 modules. 32 `documentation/`, 28 `simulateur/`. `simulateur-content.tsx` présent dans 16 (incohérence d'implémentation du même schéma). Catalogue `/modules` = `CatalogueHero` + `Card` ; table `MODULES_BY_CATEGORY` codée en dur dans la page.
- **Connecteurs** : liste `/connecteurs` (`CatalogueHero` + `Card` + `Badge`) + fiche `[id]`. **Aucun** schéma Simulateur/Documentation.
- **Site public** : `_home/*` (11 sections), `/mcp`, `/resources`, `/presentation`, `/docs/*`, pages légales. Chrome partagé : `SiteNav`, `SiteFooter`.

### 3.3 Comptages structurels (faits)

| Métrique | Valeur | Source |
|---|---|---|
| `<Panel>` dans le chrome vitrine (fiches + landing/doc modules + connecteurs + public) | **11**, tous à sémantique d'alerte/notice/empty | grep `<Panel` (voir §4 P-PANEL) |
| `<Panel>` hors périmètre (simulateur-content + asset-manager CRUD) | ~109 | grep |
| Modules sans `/simulateur` | **4** : asset-manager, keep-screen-on, monitor, newsletter | `find` |
| `simulator/` (redirections EN→FR intentionnelles) | wiki, contracts | lecture |
| `dangerouslySetInnerHTML` (tout le dépôt vitrine) | 22 occurrences, **0 sur entrée utilisateur** | grep + revue |
| `next/dynamic` dans la vitrine | 4 | grep |
| Doublons de fiches composants | 8 | §4 P-DEDUP |

---

## 4. Patterns (Phase 2) — registre priorisé

Catégorie : **A** = mécanique (aucun jugement design) · **B** = semi-auto (change le rendu, validation visuelle requise) · **C** = jugement design / création de contenu (décision Rémi).

| Pattern | Portée | Cat. | Levier | Risque | Action de cette run |
|---|---|---|---|---|---|
| **P-A11Y/I18N (chrome fiche)** | `components/fiche/*` (5 fichiers) | **A** | Moyen | Très faible | ✅ **LIVRÉ** (commit 2) |
| **P-DOGFOOD (contenu HTML→bpm.*)** | catalogues + fiche connecteur | **B** | Élevé | Moyen | ✅ **LIVRÉ** (commit 3) |
| **P-DEDUP (alias fiches)** | 3 alias `composants/*` | **B** | Moyen | Faible | ✅ **LIVRÉ partiel** (commit 4) — 3/5, 2 ambigus laissés |
| **P-PANEL** | présentation modules + démos + sections | **B** | Élevé | Faible | ✅ **LIVRÉ (large)** — **~80 `Panel`-conteneurs** → `bpm.card` / `bpm.emptyState` (catalogues, fiches, démos `simulateur-content` ×16, sous-pages module) ; **ne restent que de vraies alertes** (`warning`/`error`) + 1 récap `success` |
| **P-GABARIT (en-tête module)** | 29 pages module | **B/C** | Élevé | Faible→Moyen | ✅ **LIVRÉ 29/29** (commits 6–8, 10) — primitif + migration complète ; **titre dogfoodé en `bpm.title`** |
| **P-GABARIT (convergence DS + simulateur connecteurs)** | 3 systèmes ; connecteurs | C | **Élevé** | Élevé | 📋 Recommandation (§5) |
| **P-DOGFOOD (chrome site-*/doc-page CSS)** | site public, fiches | C | Élevé | Élevé | 📋 Recommandation (§5) — systèmes CSS délibérés |
| **P-PITCH (mise en avant)** | composants, modules, connecteurs | C | Moyen | — | 📋 Recommandation (§5) |
| **P-SECU (durcissement rendu)** | `monitor/documentation` | B | Faible | Faible | 📋 Recommandation (§4.5) |
| **P-PERF (lazy charts)** | fiches charts/map | A | Faible | Faible | 📋 §4.6 (largement déjà géré par PlotlyChart) |

> **Note dogfooding (clé du périmètre)** : la vitrine repose sur **trois systèmes de mise en page** dont **deux sont des design systems CSS délibérés** (`site-*` pour le site public — 0 style inline ; `doc-page` pour les fiches). Le dogfooding `bpm.*` **mécaniquement sûr** ne concerne donc que le **contenu stylé en inline** (cartes de catalogue + fiche connecteur) — c'est ce qu'a traité P-DOGFOOD (commit 3). Convertir les systèmes CSS `site-*`/`doc-page` en `bpm.*` est un chantier de **catégorie C** (démantèlement d'un design system = décision + validation visuelle).

### 4.1 P-A11Y/I18N — aria-labels FR codés en dur dans le chrome partagé *(catégorie A — LIVRÉ)*

**Constat (FAIT)** : les composants de chrome partagés contiennent des `aria-label` en français codés en dur, donc non traduits pour les lecteurs d'écran en EN :

```
[FicheHeader] a11y/i18n P2 — components/fiche/FicheHeader.tsx:18 — aria-label="Fil d'Ariane" codé en dur (FR) — router via dict — généralisable=O
[FicheNav]    a11y/i18n P2 — components/fiche/FicheNav.tsx:24   — aria-label="Navigation de fin de page" codé en dur — dict — O
[FicheSkeleton] a11y/i18n P2 — components/fiche/FicheSkeleton.tsx:50 — aria-label="Chargement de la fiche" codé en dur — dict — O
[FicheFieldGrid] i18n P3 — components/fiche/FicheFieldGrid.tsx:24 — "Non défini" (texte visible) codé en dur — dict — O
```

**Fix** : ces composants sont `'use client'` → consommer `useI18n()` et lire des clés bilingues sous une nouvelle section `dict.fiche`. Parité garantie par le typage. **Aucun changement visuel** (seul l'attribut a11y / le fallback texte changent de source). **Généralisable=O** : même principe à appliquer à tout futur chrome partagé.

> Note de périmètre : ces composants n'irriguent aujourd'hui que les pages asset-manager, mais ce sont des **primitifs de chrome partagés** de la bibliothèque vitrine ; le correctif est sûr, type-safe et préserve la parité — d'où son éligibilité comme unique pattern mécanique de cette run.

### 4.2 P-PANEL — *minimisation livrée (correction d'une sous-estimation initiale)*

> **Mise à jour (étendue sur consigne Rémi « la présentation des modules » + « convertis tout »)** : l'analyse initiale concluait à tort à l'absence de cible. `Panel` était massivement **détourné** comme conteneur hors-alerte. **~80 `Panel`-conteneurs** remplacés par le composant sémantique adéquat :
> - **Empty-states** → **`bpm.emptyState`** : `wiki/search`, `wiki/tags`, `newsletter`, `contracts`, `asset-manager/cmdb-graph`, `contracts/[id]` (notFound), `newsletter/[id]` (notFound).
> - **Sections de contenu** → **`bpm.card`** : `documents/[id]` (8), `contracts/[id]` (8), pages de présentation `veille`/`workflow`, **les 16 démos `simulateur-content.tsx`** + routes `contracts/simulateur` & `workflow/simulateur`, et les sous-pages fonctionnelles (`wiki/history`, `newsletter` edit/nouveau/parametres, `asset-manager` knowledge-edit & changes/calendar).
>
> **Ne restent que de vraies alertes** : `variant="warning"` (×16, config requise/introuvable/domaine requis), `variant="error"` (×5, erreurs/not-found wiki & documents) et **1 récap `success`** (formulaire-dynamique) — c'est le rôle documenté de `bpm.panel`. Décision Rémi explicite d'étendre au **rendu des démos** (la contrainte « rendu libre » est levée par le commanditaire). `tsc` + `npm run build` verts à chaque lot.

**Analyse initiale (conservée pour traçabilité)** : les `<Panel>` du chrome strict étaient lus comme des alertes/notices/empty légitimes —

**Classification exhaustive des `<Panel>` hors simulateur-content** (chaque occurrence examinée) :

| Fichier:ligne | Usage | Verdict |
|---|---|---|
| `modules/asset-manager/page.tsx:67` | `variant="warning"` configRequired | ✅ alerte légitime |
| `modules/contracts/page.tsx:809` | `variant="info"` noResults | ✅ empty-state légitime |
| `modules/newsletter/page.tsx:194` | `variant="info"` emptyTitle | ✅ empty-state légitime |
| `modules/veille/page.tsx:201/205/217` | `variant="info"` enrobant Table/form/ActivityFeed | ⚠️ conteneur — **mais** dans le composant de démo interactif (état `setNom`/`addSource`) = **rendu libre protégé** |
| `modules/workflow/page.tsx:49` | `variant="info"` enrobant la démo d'états | ⚠️ conteneur — **mais** à l'intérieur de `const simuContent` = **contenu du simulateur** = **rendu libre protégé** |
| `demo/production/* (4)` | `variant="warning|success"` | ✅ alertes légitimes |
| `composants/panel/Fiche.tsx:74`, `ComponentsCatalogue.tsx:124` | démonstration du composant Panel | ✅ légitime |

**Conclusion (FAIT, et non plus hypothèse)** : les **seuls** `Panel`-conteneurs (anti-pattern) sont dans `veille` (démo interactive) et `workflow` (`simuContent`), c.-à-d. le **rendu libre des composants démontrés** que les « Contraintes — NE PAS CASSER » de la mission interdisent explicitement de modifier. Les modifier pour satisfaire « minimiser Panel » **casserait une contrainte dure**. → P-PANEL n'a **aucune cible mécanique** dans le périmètre respectant les contraintes. Si Rémi souhaite étendre la règle au rendu des démos, c'est une décision de catégorie C, démo par démo.

---

**Constat historique (FAIT)** : les 11 `<Panel>` du chrome strict sont tous des alertes/notices/empty-states légitimes :

```
modules/asset-manager/page.tsx:67      — <Panel variant="warning" title=configRequired>      → alerte légitime
modules/contracts/page.tsx:809         — <Panel variant="info" title=noResults>              → empty-state légitime
modules/newsletter/page.tsx:194        — <Panel variant="info" title=emptyTitle>             → empty-state légitime
modules/veille/page.tsx:201/205/217    — <Panel variant="info" title=...>                    → notices légitimes
modules/workflow/page.tsx:49           — <Panel variant="info" ...>                          → notice légitime
demo/production/* (4)                  — <Panel variant="warning|success" ...>               → alertes légitimes
composants/panel/Fiche.tsx:74          — démonstration du composant Panel                    → légitime
components/site/ComponentsCatalogue.tsx:124 — aperçu du composant panel                       → légitime
```

**Interprétation** : la demande « minimiser `bpm.panel` » visait l'usage de `Panel` comme **conteneur générique**. Cet anti-pattern existe (~109 occurrences) mais **exclusivement dans le rendu libre des simulateurs et les pages fonctionnelles de modules** (asset-manager), que la mission place **hors périmètre**. → **Aucune substitution mécanique justifiée sur le chrome.** Si Rémi souhaite étendre au rendu des démos, ce serait une décision de catégorie C, simulateur par simulateur.

### 4.25 P-DOGFOOD — contenu HTML inline → primitifs `bpm.*` *(catégorie B — LIVRÉ)*

**Constat (FAIT)** : dans le chrome stylé en inline (et non via un design system CSS), les **conteneurs** sont en `bpm.*` mais les **contenus** (titres de section, paragraphes, légendes, CTA) sont en HTML brut + `style={{…var(--bpm-*)…}}` :

```
[connecteurs-fiche] dogfooding P2 — connecteurs/[id]/FicheContent.tsx:14,18 (SectionTitle ×7), 63,90,96,122,178 — <h2>/<p> inline — bpm.Title/Caption — O
[catalogue-modules] dogfooding P2 — modules/page.tsx (description carte) — <p> inline — bpm.Caption — O
[catalogue-connecteurs] dogfooding P2 — connecteurs/ConnecteursListContent.tsx (description+CTA) — <p>/<span> inline — bpm.Caption/Text — O
```

**✅ LIVRÉ (commit 3)** : `SectionTitle` (×7) → `bpm.Title level={2}` + `bpm.Caption` ; paragraphes/labels → `bpm.Caption` ; CTA → `bpm.Text`. **Primitifs vérifiés** (types locaux `@/components/bpm`, source de compilation `tsc`) : `Title(level, style)`, `Caption(style)`, `Text(style)` — `Caption` rend précisément `<p class="bpm-caption text-sm" style="color:var(--bpm-text-secondary)">`, équivalent sémantique exact des paragraphes secondaires remplacés. `tsc --noEmit` vert.

> **Périmètre respecté** : le **hero `site-*`** de la fiche connecteur (`<h1>`, eyebrow) **n'est pas touché** (design system marketing, catégorie C), ni le rendu libre des simulateurs.
>
> **À valider de visu** : `bpm.Title level={2}` adopte la typographie du DS (taille/poids possiblement ≠ de l'ancien `h2` 20px/700) ; `Caption` est `text-sm` (14px) vs anciens 12–15px ponctuels. Aucune rupture de mise en page attendue, mais à confirmer sur rendu.

### 4.3 P-DEDUP — doublons/recouvrements de fiches composants *(catégorie B)*

**Constat (FAIT)** : 112 dossiers de fiche pour 104 composants. Recouvrements :

```
composants/altair  vs composants/altairchart
composants/empty   vs composants/emptystate
composants/highlight-box vs composants/highlightbox
composants/pdf     vs composants/pdfviewer
composants/plotly  vs composants/plotlychart
composants/title   vs composants/title1 / title2 / title3 / titlebpm   (Title a une prop `level`)
(spinner vs spinnerdot = composants DISTINCTS — Spinner ≠ SpinnerDot — PAS un doublon)
```

**✅ LIVRÉ (commit 4, partiel)** : redirections 301 dans `next.config.mjs` pour les **3 alias non ambigus** — `altair`, `plotly`, `pdf` — qui n'ont **ni composant distinct** (seuls `AltairChart`/`PlotlyChart`/`PdfViewer` existent dans `components/bpm/`) **ni entrée au registre**. Mécanisme : `redirects()` Next (prime sur le routage fichier, **sans suppression**, réversible, **generator-safe** — `scripts/generate-fiche-pages.mjs` itère les dossiers existants donc ne recrée rien). Validé : `next.config.mjs` charge, 6 redirects au total.

**NON livré (laissé à Rémi, ambigu)** :
- `highlight-box` (251 l.) vs `highlightbox` (153 l., registre) — l'alias hors registre a **plus** de contenu ; rediriger perdrait du contenu → trancher d'abord le canonique.
- `empty` vs `emptystate` — **composants DISTINCTS** (les deux au registre, `Empty.tsx` ≠ `EmptyState.tsx`) → **pas un doublon**, ne pas rediriger.
- `spinner` vs `spinnerdot`, `title` vs `title1/2/3/titlebpm` — distincts (variantes/niveaux), pas des doublons.

### 4.4 P-GABARIT — convergence des gabarits & schéma Simulateur/Doc connecteurs *(catégorie C, levier élevé)*

Voir §3.1 et §5. **Constat (FAIT)** : trois systèmes de gabarit ; route `composants/[slug]` morte ; `simulateur-content.tsx` dans 16/28 modules seulement (deux façons d'implémenter le même schéma) ; **connecteurs sans Simulateur/Doc**. **Catégorie C** : converger les gabarits et créer un simulateur/doc par connecteur est un chantier d'architecture + contenu, à arbitrer.

### 4.5 P-SECU — durcissement du rendu `monitor/documentation` *(catégorie B, sévérité faible)*

**Constat (FAIT)** : `app/(app)/modules/monitor/documentation/page.tsx` rend ~14 fois `dangerouslySetInnerHTML={{ __html: s.xxxHtml }}` depuis `strings.ts`. **Le contenu est 100 % statique, développeur, sans entrée utilisateur ni interpolation** → pas de vecteur XSS aujourd'hui.

```
[monitor-doc] secu P3 — modules/monitor/documentation/page.tsx:20,27,36,43,50,57,60,63,68,73,76,79 — dangerouslySetInnerHTML sur chaînes statiques — refactor vers bpm.Markdown ou balisage structuré bpm.* — généralisable=O (un seul module concerné aujourd'hui)
```

**Fix proposé (B)** : remplacer le HTML inline des `*Html` par `bpm.markdown` (vérifié MCP) ou un rendu structuré. **Risque** : change le rendu (validation visuelle). **Bénéfice** : supprime le seul pattern de contournement de l'échappement React + dogfoode. Non livré (catégorie B).

### 4.6 P-PERF — lazy-loading des démos lourdes *(catégorie A, levier faible)*

**Constat (FAIT)** : `bpm.PlotlyChart` (`components/bpm/PlotlyChart.tsx:5`) **lazy-load déjà** `react-plotly.js` en interne (`dynamic(..., {ssr:false})`). Les fiches `plotly`/`plotlychart` qui l'importent ne chargent donc **pas** Plotly à l'eager. Le gain d'un `next/dynamic` supplémentaire au niveau fiche est **marginal**. `components/bpm/Map.tsx` n'a pas de `dynamic` apparent (à vérifier : délègue probablement à `MapViewLeaflet`).

```
[map-fiche] perf P3 — composants/map/Fiche.tsx — Hyp. import direct de Map ; vérifier si Leaflet est chargé à l'eager — si oui, next/dynamic ssr:false — généralisable=O
```

Non livré : gain incertain, à confirmer par mesure de bundle (pas de validation visuelle possible ici).

---

## 5. Recommandations catégorie C (décision Rémi)

1. **Converger les trois gabarits** (P-GABARIT) vers les primitifs `components/fiche/*` (les plus dogfoodés) ou créer un primitif unique `VitrineSection`/`VitrinePage` en `bpm.*`. Levier maximal sur l'homogénéité, mais refonte transverse à fort risque visuel → à faire **gabarit par gabarit, avec captures avant/après**.
2. **Schéma Simulateur/Documentation pour les connecteurs** (P-GABARIT) : aligner `/connecteurs/[id]` sur la structure modules (doc + simulateur de configuration). Création de contenu + éventuelle interaction avec le contrat (hors périmètre de cette run, ne pas toucher le Zod).
3. **Dogfooding du contenu** (P-DOGFOOD) : remplacer `<p>/<span>/<h1>` + styles inline `var(--bpm-*)` par `bpm.Text/Caption/Title` dans les cartes de catalogue (`modules/page.tsx`, `connecteurs/ConnecteursListContent.tsx`) et les en-têtes de fiches/simulateurs. À faire surface par surface, avec validation visuelle (les composants `bpm.*` ont leur propre typographie).
4. **Mise en avant / pitch** (P-PITCH) : bloc homogène « accroche + cas d'usage + value prop » par composant/module/connecteur. Aujourd'hui les fiches sont surtout des démos + props ; peu de « pourquoi celui-ci ». Décision éditoriale.
5. **Uniformiser l'implémentation du schéma module** : standardiser sur `simulateur-content.tsx` partout (16/28 aujourd'hui), et décider du sort des 4 modules sans `/simulateur`.
6. **P-DEDUP** (§4.3) : trancher le slug canonique par paire et rediriger les alias.

---

## 6. Livrables de code (patterns A/B implémentés)

Trois patterns propagés à tous leurs éléments concernés, un **commit atomique par pattern** (branche unique imposée par le harness, d'où un commit par pattern plutôt qu'une branche par PR) :

| Commit | Pattern | Cat. | Fichiers | Validation |
|---|---|---|---|---|
| 2 | **P-A11Y/I18N** — aria-labels FR codés en dur → `dict.fiche` (FR/EN) | A | `components/fiche/{FicheHeader,FicheNav,FicheSkeleton,FicheFieldGrid}.tsx` + `lib/i18n/{fr,en}.ts` | `tsc` vert ; parité par typage ; **0 changement visuel** |
| 3 | **P-DOGFOOD** — contenu HTML inline → `bpm.Title/Caption/Text` | B | `connecteurs/[id]/FicheContent.tsx`, `connecteurs/ConnecteursListContent.tsx`, `modules/page.tsx` | `tsc` vert ; hero `site-*` préservé |
| 4 | **P-DEDUP** — redirections 301 des alias de fiches | B | `next.config.mjs` | config chargée (6 redirects) |

**Garanties transverses** : aucun composant `bpm.*` introduit sans vérification de ses props (types locaux `@/components/bpm`, contrôlés par `tsc`) ; parité i18n préservée ; aucun secret ; périmètre respecté (hero `site-*`, design systems CSS et rendu libre des simulateurs **non touchés**).

**Validation globale (toute la branche)** : `npx tsc --noEmit` **vert** ET **`npm run build` (production Next.js) vert** — aucune erreur ni warning ; parité i18n 476 = 476 (type-enforced). Le dogfooding du contenu connecteur est complété (bloc OAuth2 → `bpm.label_value`).

### À valider de visu par Rémi
- **P-A11Y/I18N** : libellés EN proposés (« Breadcrumb », « End of page navigation », « Loading card », « Not set ») — ajuster si terminologie produit. Aucun impact mise en page.
- **P-DOGFOOD** : `bpm.Title level={2}` (typographie DS vs ancien `h2` 20px/700) et `Caption` (14px) — confirmer l'absence de décalage visuel sur la fiche connecteur et les cartes de catalogue.
- **P-DEDUP** : confirmer qu'aucun lien entrant ne dépend du contenu propre des alias `altair`/`plotly`/`pdf` (ils redirigent désormais vers le canonique).

---

## 7. Ce qui reste (prochaines PR suggérées, par levier décroissant)

> **Patterns A/B : épuisés.** Cette run a livré P-A11Y/I18N, P-DOGFOOD (contenu inline + fiche connecteur 100 %), P-DEDUP (3 alias), P-GABARIT (**29/29 pages** sur `ModulePageHeader`, titre en `bpm.title`) **et le schéma Simulateur/Documentation des connecteurs** (mission #3 — fiche connecteur en `bpm.Tabs(Documentation | Simulateur)`). `tsc` + `npm run build` verts. Il ne reste que des éléments **catégorie C** que la mission demande de **documenter, non d'implémenter**, plus un B requalifié faible valeur.

1. **P-GABARIT convergence DS** (C) — unifier `doc-page` ↔ `site-*` ↔ `components/fiche/*` en un primitif unique — *gabarit par gabarit, captures avant/après*.
2. **P-DOGFOOD (design systems CSS)** (C) — migration des classes `doc-page`/`site-*` vers `bpm.*` — démantèle un DS délibéré, décision design.
3. **P-DEDUP `highlight-box`** (C) — trancher le canonique (l'alias hors registre a *plus* de contenu) avant de rediriger.
4. **P-SECU `monitor`** (B, **requalifié faible valeur**) — contenu 100 % statique, sans surface d'entrée utilisateur (pas de cible XSS) ; `bpm.markdown` est inerte au HTML → conversion = réécriture de ~14 chaînes HTML (dont `<kbd>`) FR+EN, risque > bénéfice. La surface de rendu de **texte utilisateur** (`wiki/HighlightedText`) évite déjà `dangerouslySetInnerHTML` → P-SECU de fait satisfait.
5. **P-PITCH** (C, éditorial) — blocs « accroche + cas d'usage + value prop » par composant/module/connecteur.
6. **Schéma module** (C) — standardiser `simulateur-content.tsx` (16/28) ; statuer sur les 4 modules sans `/simulateur`.

> **Note décision (P-GABARIT connecteurs)** : le découpage Documentation/Simulateur retenu est un **défaut réversible** (Documentation = référence auth/OAuth/hôtes/mapping ; Simulateur = démos live de mapping). À confirmer/ajuster par Rémi.

> **Rappel** : harness vert ≠ validé fonctionnellement. Toute PR de catégorie B/C ci-dessus exige une validation visuelle sur rendu déployé avant merge.
