# Audit UX 360° — Vitrine Blueprint Modular

> **Run** : nocturne autonome (2026-06-15). **Périmètre** : vitrine (site public `app/(public)/(site)/*`) + coquille app (`app/(app)/composants`, `app/(app)/modules`, `app/(app)/connecteurs`). **Hors périmètre** : moteur Maker, câblage sandbox/proxy (`lib/sandbox/*`), contrat Zod connecteurs (`ConnectorDescriptor`), et le **rendu libre** des simulateurs (corps de démo) — on n'audite que le *chrome / gabarit / mise en page*.
>
> **Statut** : read-only sauf le pattern mécanique livré (voir §6). Aucun merge, aucun déploiement. Décisions de catégorie C laissées à Rémi.

---

## 1. Synthèse exécutive

La vitrine est **déjà nettement plus homogène et mieux construite que ne le laisse supposer le brief**. Les trois exigences dures du commanditaire se vérifient ainsi sur le terrain :

1. **Minimiser `bpm.panel`** — *Quasi atteint dans le chrome.* Tous les `<Panel>` du chrome vitrine portent une sémantique d'alerte/notice/empty-state légitime (`variant="warning|info|success"` + `title`), ce qui est exactement le rôle documenté de `bpm.panel` (« bloc d'information, alerte ou résumé encadré »). Les usages de `Panel` comme **conteneur générique** (le vrai anti-pattern) vivent dans le **rendu libre** des simulateurs et les pages fonctionnelles de modules (asset-manager CRUD) — **hors périmètre**. → *Pas de PR P-PANEL mécanique justifiée sur le chrome ; voir §4 P-PANEL.*

2. **Dogfooding `bpm.*`** — *Partiel.* Les **conteneurs** sont en `bpm.*` (`Card`, `Badge`, `Input`…), mais les **contenus** (titres de section, paragraphes, légendes, liens) sont fréquemment en HTML brut + styles inline `var(--bpm-*)` plutôt qu'en `bpm.Title/Text/Caption`. C'est le vrai gisement de dogfooding — mais il est **catégorie B/C** (change le rendu, exige validation visuelle). Voir §4 P-DOGFOOD.

3. **Schéma Simulateur / Documentation** — *Établi pour les modules, absent pour les connecteurs.* 32/32 modules ont une page `documentation/` ; 28/32 ont une page `simulateur/`. Les **connecteurs n'ont ni simulateur ni doc** structurés (liste + fiche descriptive seulement). C'est la généralisation la plus à fort levier — mais c'est de la **création de contenu/feature** (catégorie C). Voir §4 P-GABARIT.

**Posture sécurité : saine.** Aucun finding P0/P1. Les usages de `dangerouslySetInnerHTML` sont soit des chaînes développeur statiques (`monitor/documentation`), soit des patterns standard sûrs (JSON-LD, script anti-FOUC). Le rendu de texte utilisateur (`wiki/HighlightedText.tsx`) **évite délibérément** `dangerouslySetInnerHTML`.

**Toolchain : vert.** `tsc --noEmit` passe sans erreur (baseline). La **parité i18n FR/EN est garantie par le typage** (`en: typeof fr` dans `lib/i18n/en.ts` et dans chaque `strings.ts`/dict co-localisé) — il n'y a donc pas de risque de désynchronisation de clés tant que le code compile.

**Fragmentation des gabarits = le vrai problème d'homogénéité.** Trois systèmes de mise en page coexistent (voir §3.1). C'est la racine de la majorité des findings « gabarit divergent ».

**Livrable de code de cette run** : un seul pattern **mécanique, sûr, sans changement visuel** — P-A11Y/I18N sur le chrome partagé `components/fiche/*` (aria-labels FR codés en dur → dict bilingue). Tout le reste (P-DOGFOOD, P-GABARIT, dédup fiches, simulateur connecteurs) est **documenté en recommandations** (catégorie B/C) car ces changements modifient le rendu et exigent l'arbitrage / la validation visuelle de Rémi.

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
| **P-A11Y/I18N (chrome fiche)** | `components/fiche/*` (5 fichiers) | **A** | Moyen | Très faible | ✅ **PR livrée (§6)** |
| **P-PANEL** | chrome vitrine | — | — | — | ❌ Non actionnable : déjà conforme (voir ci-dessous) |
| **P-DEDUP (doublons fiches)** | 8 dossiers `composants/*` | B | Moyen | Faible-moyen | 📋 Recommandation (§4.3) |
| **P-GABARIT (convergence + simulateur connecteurs)** | 3 systèmes ; connecteurs | C | **Élevé** | Élevé | 📋 Recommandation (§5) |
| **P-DOGFOOD (contenu HTML→bpm.*)** | fiches, catalogues, connecteurs | B/C | Élevé | Moyen | 📋 Recommandation (§5) |
| **P-PITCH (mise en avant)** | composants, modules, connecteurs | C | Moyen | — | 📋 Recommandation (§5) |
| **P-SECU (durcissement rendu)** | `monitor/documentation` | B | Faible | Faible | 📋 Recommandation (§4.5) |
| **P-PERF (lazy charts)** | fiches charts/map | A | Faible | Faible | 📋 Voir §4.6 (largement déjà géré) |

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

### 4.2 P-PANEL — *déjà conforme dans le chrome (non actionnable mécaniquement)*

**Constat (FAIT)** : les 11 `<Panel>` du chrome vitrine sont tous des alertes/notices/empty-states légitimes :

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

**Fix proposé (B)** : pour chaque paire, déterminer le slug canonique (celui présent au registre `bpm-components.json`) et transformer l'alias en **redirection** (`redirect()` Next) vers le canonique, plutôt que deux fiches divergentes — sur le modèle déjà retenu pour `wiki/simulator → wiki/simulateur`. **Risque** : supprimer du contenu indexé (SEO) ; à valider que l'alias ne porte pas de contenu unique. **Généralisable=O** (pattern de redirection d'alias). Non livré : exige de trancher le canonique par paire (jugement) + impact SEO.

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

## 6. Livrable de code : PR-pattern P-A11Y/I18N

**Un seul pattern mécanique, catégorie A**, propagé à tous les éléments concernés (les 5 composants de `components/fiche/*`). Voir le commit dédié. Caractéristiques :

- **Aucun composant `bpm.*` nouvellement introduit** → pas de risque de signature/props inventée.
- **Parité i18n préservée** (clés ajoutées dans `fr` et `en`, typage `en: typeof fr`).
- **Aucun changement visuel** (seuls des attributs `aria-*` et un fallback texte changent de source).
- **Validations** : `tsc --noEmit` vert (baseline conservée).

### À valider de visu par Rémi
- Les libellés EN des aria-labels (« Breadcrumb », « End of page navigation », « Loading card », « Not set ») sont des traductions proposées — ajuster si une terminologie produit existe.
- Rien d'autre : ce pattern ne modifie pas la mise en page.

---

## 7. Ce qui reste (prochaines PR suggérées, par levier décroissant)

1. **P-GABARIT** — convergence des gabarits (C, fort levier, fort risque) — *gabarit par gabarit*.
2. **P-DOGFOOD** — contenu HTML→`bpm.*` (B/C) — *surface par surface*.
3. **P-GABARIT connecteurs** — simulateur + doc (C).
4. **P-DEDUP** — redirections d'alias de fiches (B).
5. **P-SECU** — `monitor/documentation` → `bpm.markdown` (B).
6. **P-PITCH** — blocs de mise en avant (C, éditorial).

> **Rappel** : harness vert ≠ validé fonctionnellement. Toute PR de catégorie B/C ci-dessus exige une validation visuelle sur rendu déployé avant merge.
