# Backlog vitrine — plan d'exécution (Chantier 0)

> **Statut : plan soumis à validation humaine. Aucun code dans cette PR.**
> Source : audit produit du 12/06/2026 (site en « v0.1.60 ») + comparatif Streamlit.
> Chaque item ci-dessous = **une PR** sur branche `fix/vitrine-<item>`, base `master`,
> tag `Implements:` dans la description, squash, CI verte, revue humaine obligatoire.

## 0. Faits vérifiés dans le code (12/06/2026, master `3a1c0ca`)

Le plan repose sur des constats re-vérifiés dans le dépôt et les registres publics,
pas seulement sur l'audit :

| Constat | Vérification |
|---|---|
| `package.json` racine = **0.1.60** → `lib/version.ts` (`APP_VERSION`) → footers site & app, llms.txt, `/api/blueprint/info`, démo JsonViewer de `/components` | `grep APP_VERSION` : 5 surfaces d'affichage |
| `pyproject.toml` = **0.1.52** ; **PyPI publié = 0.1.53** (le dépôt est derrière le paquet publié) | `curl pypi.org/pypi/blueprint-modular/json` |
| `packages/core/package.json` = **0.2.0** ; **npm publié = 0.3.0** (idem) ; un `0.1.60` existe sur npm comme *ancienne* version, ce qui entretient la confusion | `npm view @blueprint-modular/core versions` |
| Changelog : tableau `ENTRIES` **codé en dur** dans `docs/changelog/page.tsx`, dernière entrée **0.1.22 (2025-02-27)**, page non i18n (FR uniquement) | lecture du fichier |
| **Zéro tag git** dans le dépôt — « générer depuis les tags » suppose d'instaurer la discipline de tags d'abord | `git tag | wc -l` = 0 |
| Registre `lib/generated/bpm-components.json` = **104** ; `mcp-registry.json` (parse de llms.txt) = **101** → la divergence 104/101 vient de composants présents au registre mais absents/mal appariés dans llms.txt | comptage des deux JSON |
| Segmented control de `/components#button` : `onClick={() => {}}` — décoratif, non interactif (d'autres `COMPOSITIONS —` de la même page sont dans le même cas) | lecture de `components/page.tsx` |
| `/components` (galerie) : **aucune recherche** (ancres de catégorie seulement). ⚠️ Correction de l'audit : `/docs/components` (catalogue) **a déjà** un champ de recherche (`Input type="search"` + filtre par titre/description) | lecture des deux pages |
| Galerie `/components` : pas de code copiable par carte (`DemoCard` = label + rendu). Le « source + copier » existe sur la vitrine d'accueil (PR #35) et sur les fiches, pas en galerie | lecture de `DemoCard` |
| Déploiement : seule trace = carte « Prérequis production » du hub docs → **lien externe** vers `docs/DATABASE.md` sur GitHub. `DEPLOY.md`, `DEPLOIEMENT_DOMAINE.md` existent à la racine du dépôt (hors site) | lecture du hub |
| Cheat sheet : inexistante | recherche dans `app/` |
| Footer site : **aucun lien GitHub/dépôt/issues/roadmap** | `grep github SiteFooter.tsx` : 0 |
| Simulateur wiki : `"use client"` avec imports top-level de `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-highlight` + CSS highlight.js — aucun `next/dynamic`, tout pèse sur le chargement initial | lecture de `simulateur/page.tsx` |
| `/docs` (hub) et `/resources` : 6 cartes vs 9 cartes, **5 destinations communes** (démarrage, catalogue, galerie, changelog, llms.txt) | lecture des deux pages |

**Dépendance transverse — PR #44 ouverte.** La PR #44 (non mergée) déplace toute
l'arborescence `/docs` de `app/(app)/docs` vers `app/(public)/(site)/docs` et ajoute
`/presentation`. Les items 2, 4, 6, 7 et 9 touchent ces chemins. **Décision requise
avant le chantier 2 : merger (ou fermer) la PR #44** pour figer les chemins ; le plan
ci-dessous suppose qu'elle est mergée et utilise les chemins `(public)/(site)`.

---

## 1. Ordre d'exécution proposé

| # | Chantier | Branche | Impact | Effort | Dépend de |
|---|---|---|---|---|---|
| 0 | Plan (ce document) | `fix/vitrine-00-plan` | — | — | — |
| 1 | Cohérence de version | `fix/vitrine-01-versions` | **Élevé** | Moyen | — |
| 2 | Chiffres : 104 vs 101 | `fix/vitrine-02-compteurs` | Moyen | Faible | — |
| 3 | Changelog généré | `fix/vitrine-03-changelog` | **Élevé** | Moyen | 1 (discipline de version/tags) |
| 4 | Démos figées `/components` | `fix/vitrine-04-demos-interactives` | **Élevé** | Faible | — |
| 5 | Code copiable en galerie | `fix/vitrine-05-code-galerie` | Moyen | Faible-moyen | 4 (même fichier — éviter les conflits) |
| 6 | Recherche/filtre galerie | `fix/vitrine-06-recherche` | Moyen-élevé | Moyen | 5 (même fichier) |
| 7 | Signaux de vivacité | `fix/vitrine-07-vivacite` | Moyen | Faible | 3 (le changelog à jour est le 1er signal) |
| 8 | Page Déploiement | `fix/vitrine-08-deploiement` | **Élevé** | Moyen | PR #44 (chemins docs) |
| 9 | Cheat sheet | `fix/vitrine-09-cheatsheet` | Moyen | Faible-moyen | 1 (version juste dans l'en-tête) |
| 10 | Consolidation /docs + /resources & profondeur | `fix/vitrine-10-consolidation-docs` | **Élevé** | **Élevé** | 8, 9 (la nouvelle IA les intègre) |
| 11 | Perf : lazy-load simulateurs | `fix/vitrine-11-perf-simulateurs` | Moyen | Moyen | — (parallélisable à tout moment) |

Justification de l'ordre : d'abord la **vérité des chiffres** (1, 2, 3) — c'est le
déficit de confiance pointé par l'audit (versions fantômes, changelog gelé) ; puis les
**correctifs à fort ratio** sur la galerie (4, 5, 6, regroupés car ils éditent le même
fichier, dans l'ordre qui minimise les rebases) ; puis la **réassurance** (7) ; enfin les
**chantiers de contenu** (8, 9, 10) qui rapprochent la densité de Streamlit, le 10
absorbant les pages créées en 8 et 9 dans la nouvelle arborescence. Le 11 est
indépendant et peut s'intercaler.

---

## 2. Détail par item

### Item 1 — Cohérence de version (priorité 1)
`Implements: vitrine-01-versions`

**Problème.** Quatre numéros divergent : site/llms.txt 0.1.60, PyPI 0.1.53 (pyproject
local 0.1.52), npm 0.3.0 (packages/core local 0.2.0), changelog 0.1.22. Le « 0.1.60 »
affiché ne correspond à aucun paquet installable actuel : c'est la version de
l'application Next.js, pas celle des produits.

**Principe retenu.** Une version **par surface livrable**, affichée là où elle est
pertinente, dérivée au build — plus aucun numéro saisi à la main :
- **Surface Python** : `pyproject.toml` (source) → affichée sur getting-started,
  cartes PyPI, cheat sheet.
- **Surface npm/React** : `packages/core/package.json` (source) → affichée partout où
  `@blueprint-modular/core` est mentionné.
- **Site/app** : `package.json` racine reste la version interne de l'app (footer app),
  mais **cesse d'être présentée comme la version du produit**.
- **llms.txt** : en-tête avec les deux versions de surface (Python + core), pas la
  version du site.

**Périmètre (fichiers).**
- `lib/version.ts` : étendre en module `lib/versions.ts` exposant
  `{ app, python, core }` (lecture de `pyproject.toml` et `packages/core/package.json`
  au build — import JSON pour core, petit parse TOML pour pyproject).
- `scripts/sync-version.js` : inverser la logique (il écrase aujourd'hui pyproject
  depuis package.json racine — c'est la cause racine de la confusion) ou le retirer.
- `scripts/generate-llms-txt.py` (`get_version()` lit package.json racine → corriger).
- Affichages : `components/site/SiteFooter.tsx`, `components/AppLayoutClient.tsx`,
  `app/(public)/(site)/components/page.tsx` (démo JsonViewer),
  `app/api/blueprint/info/route.ts`, pages getting-started/resources qui citent une
  version.
- CI/garde-fou : un check `scripts/gate.cjs` (existant) qui échoue si une version
  codée en dur réapparaît (regex `0\.\d+\.\d+` hors fichiers sources de version).

**Option à trancher (humain).** Version produit unifiée pour le lancement (ex.
`1.0.0` partout : PyPI + npm + site). Recommandation : **oui au moment du lancement
commercial**, mais ce chantier-ci rend d'abord les versions *vraies* ; l'unification
est un simple « bump » coordonné ensuite (publier PyPI 1.0.0 + npm 1.0.0 le même
jour). Ne pas bloquer le chantier sur cette décision.

**Validation.** Build vert ; le site n'affiche plus que des versions correspondant à
des paquets réellement installables (vérif `npm view` / `curl pypi`) ; grep « version
en dur » vide ; parité FR/EN des libellés.

---

### Item 2 — Chiffres : un seul compte de composants
`Implements: vitrine-02-compteurs`

**Problème.** Registre 104, MCP/llms.txt 101. Trois composants du registre n'ont pas
d'entrée appariée dans llms.txt (casse ou absence). Le site affiche 104, le serveur
MCP annonce 101 : un agent qui compare perd confiance.

**Périmètre.**
- Diagnostiquer l'écart : script ponctuel comparant les slugs de
  `lib/generated/bpm-components.json` aux sections `## bpm.*` de `public/llms.txt`.
- Corriger à la source : soit les 3 composants manquent de doc TS (les documenter),
  soit le parse de `scripts/generate-mcp-registry.mjs` les rate (corriger le parse).
- Garde-fou : `generate-mcp-registry.mjs` **échoue** si `registre ≠ llms.txt ≠ MCP`
  (aujourd'hui il logge le total sans comparer).
- Aucun chiffre en dur : déjà le cas côté site (`COMPONENT_COUNT` dérivé) — vérifier
  les textes i18n qui disent « dix familles » et le README.

**Validation.** Les trois sources (registre, llms.txt, mcp-registry) donnent le même
nombre ; le build échoue en cas de divergence future.

---

### Item 3 — Changelog généré, à jour
`Implements: vitrine-03-changelog`

**Problème.** Tableau codé en dur, gelé à 0.1.22 (février 2025), FR uniquement.
~38 versions non documentées : pire signal de vivacité possible.

**Contrainte découverte.** Le dépôt n'a **aucun tag git**. « Générer depuis les
tags » n'est donc pas possible immédiatement.

**Approche en deux temps.**
1. *Rattrapage* : générer l'historique depuis les **merges de PR sur master**
   (`git log --merges` / titres `#NN`, majoritairement en conventional commits) groupés
   par version à partir des commits qui modifient `package.json` (chaque bump de
   version est traçable dans l'historique). Script `scripts/generate-changelog.mjs` →
   `lib/generated/changelog.json`.
2. *Discipline pérenne* : tagger `vX.Y.Z` à chaque publication (documenté dans
   `COMMIT_DEPLOY.md`) ; le script préfère les tags quand ils existent.

**Périmètre.**
- `scripts/generate-changelog.mjs` (nouveau) + entrée `package.json` scripts +
  intégration au build (comme `generate:components`).
- `app/(public)/(site)/docs/changelog/page.tsx` : rendu depuis le JSON généré,
  i18n FR/EN (libellés de page ; les entrées restent dans la langue du commit),
  en-tête aligné sur le langage typographique du site (PR #44).
- Filtrage : ne retenir que les changements visibles produit (feat/fix), pas les
  chores internes — règle simple par préfixe conventional commit.

**Validation.** `/docs/changelog` affiche une entrée correspondant à la version
courante de chaque surface ; plus aucun tableau en dur ; FR+EN 200.

---

### Item 4 — Démos figées de la galerie `/components`
`Implements: vitrine-04-demos-interactives`

**Problème.** La page promet « rendu réel » ; plusieurs compositions sont décoratives
(`onClick={() => {}}`), dont le segmented control épinglé par l'audit.

**Périmètre.** `app/(public)/(site)/components/page.tsx` uniquement.
- **Audit systématique** des ~120 cartes : inventorier tout handler vide / état
  non câblé (`onClick={() => {}}`, `onChange={() => {}}`, valeurs figées).
- Politique : **interactiver** quand c'est un `useState` de plus (segmented → état
  sélection ; toolbars → état actif/aria-pressed ; etc.) ; **étiqueter** « aperçu
  statique » (badge discret sur `DemoCard`, libellé i18n) pour les rares cas où
  l'interactivité n'a pas de sens (compositions purement illustratives).
- Le ColorPicker à valeur fixe et les démos volontairement contrôlées sont à câbler
  aussi (un état chacun).

**Validation.** Aucune carte cliquable sans effet ; chaque carte est soit interactive,
soit étiquetée ; mobile OK (les nouvelles interactions ne cassent pas le layout).

---

### Item 5 — Code copiable dans les cartes de la galerie
`Implements: vitrine-05-code-galerie`

**Problème.** En galerie, l'utilisateur voit le rendu mais doit naviguer vers la fiche
pour obtenir le code.

**Périmètre.**
- Réutiliser le pattern existant de la vitrine d'accueil (`ShowcaseSource`, PR #35) :
  bouton « Code » / « Copier » par carte, snippet replié par défaut (la page est déjà
  très longue).
- `DemoCard` (dans `components/page.tsx`) : prop optionnelle `code?: string` ;
  alimenter en priorité les cartes des composants les plus consultés, avec l'exemple
  canonique du registre (`bpm-components.json` contient déjà `example` pour chaque
  composant — pas de snippets à écrire à la main).
- i18n : réutiliser `home.showcase.copy/copied`.

**Décision de périmètre proposée.** Snippet = l'`example` du registre (déjà généré
depuis les sources TS) plutôt que le JSX exact de la démo — cohérent « source unique
de vérité » et zéro maintenance. À valider.

**Validation.** Copier fonctionne sur échantillon ; pas de régression du live render ;
poids de page stable (snippets en texte, pas de coloration lourde par carte).

---

### Item 6 — Recherche/filtre dans la galerie (et catalogue)
`Implements: vitrine-06-recherche`

**Correction d'audit.** `/docs/components` **a déjà** un champ de recherche
fonctionnel. Le manque réel : la galerie `/components`, et la visibilité de la
recherche du catalogue.

**Périmètre.**
- `/components` : champ de recherche dans la barre de catégories collante (filtre les
  cartes par nom `bpm.*` + libellé de section ; masque les sections vides ; compteur
  de résultats ; bouton effacer). Données : labels des `DemoCard` déjà présents.
- `/docs/components` : conserver la recherche existante ; ajouter le **filtre par
  catégorie** (chips) et l'ancrer dans l'en-tête collant pour la visibilité.
- Objectif mesurable : composant trouvé en < 3 interactions depuis chaque page.
- i18n : placeholders/aria FR-EN.

**Validation.** Recherche au clavier (focus, échap pour vider), mobile OK, aucune
carte orpheline (toute carte porte un nom matchable).

---

### Item 7 — Signaux de vivacité
`Implements: vitrine-07-vivacite`

**Problème.** Aucun lien dépôt/issues/roadmap sur le site ; impossible de juger la
maintenance (projet Apache-2.0).

**Périmètre.**
- `components/site/SiteFooter.tsx` : colonne « Projet » — dépôt GitHub, issues,
  changelog, roadmap.
- Page `/roadmap` légère (ou section de `/presentation`) : 3 horizons (livré / en
  cours / envisagé), contenu i18n, **alimentée à la main mais courte** (la roadmap
  est une décision produit, pas un artefact généré).
- `/mcp` et `/docs` : lien « contribuer / signaler un problème ».
- Pré-requis humain : confirmer que le dépôt est public (sinon pointer la page GitHub
  org) — à trancher en revue.

**Validation.** Liens 200, FR/EN, footer mobile OK.

---

### Item 8 — Page « Déploiement » intégrée
`Implements: vitrine-08-deploiement`

**Problème.** Principal écart vs Streamlit : aucun récit « du `bpm run` à la prod »
sur le site ; seul un renvoi externe vers `DATABASE.md`.

**Périmètre.**
- Nouvelle page `app/(public)/(site)/docs/deployment/page.tsx` (chemin post-PR #44),
  dans le langage docs du site. Contenu **réel, vérifié contre le dépôt** :
  1. Local → production en 4 étapes (`bpm run` → `next build` standalone →
     `Dockerfile`/`docker-compose.yml` existants → nginx + HTTPS via les
     `nginx-bpm-domain*.conf.example` existants) ;
  2. Prérequis base de données (intégrer la substance de `docs/DATABASE.md` plutôt
     qu'y renvoyer) ;
  3. Variables d'environnement minimales ;
  4. Honnêteté produit : pas de « 1-clic » à la Streamlit Cloud — le dire, et donner
     le chemin Docker le plus court.
- Référencement : carte du hub docs (remplace la carte externe « Prérequis
  production »), carte `/resources`, lien getting-started « Et ensuite ? ».
- i18n FR/EN complet.

**Validation.** Chaque commande de la page testée (build Docker au minimum lancé en
local), 200 FR+EN, mobile OK.

---

### Item 9 — Cheat sheet générée
`Implements: vitrine-09-cheatsheet`

**Périmètre.**
- `scripts/generate-cheatsheet.mjs` : depuis `bpm-components.json` (+ blocs props de
  llms.txt déjà parsés par `generate-mcp-registry.mjs` — réutiliser ce parse) →
  `lib/generated/cheatsheet.json` : une ligne par composant (signature minimale +
  exemple court), groupée par famille.
- Page `app/(public)/(site)/docs/cheatsheet/page.tsx` : une page dense, imprimable
  (CSS `@media print`), recherche navigateur suffisante.
- Liens : hub docs, `/resources`, footer.
- i18n : chrome de page FR/EN (le contenu API est en code, non traduit).

**Validation.** Génération au build (échec si registre absent), impression A4 lisible,
200 FR+EN.

---

### Item 10 — Consolidation /docs + /resources & profondeur de contenu
`Implements: vitrine-10-consolidation-docs`

**Problème.** Hub `/docs` et `/resources` se chevauchent (5 destinations communes) ;
la doc manque de pages de fond (concepts, patterns, recettes) face aux dizaines de
pages Streamlit.

**Cartographie cible (à valider en revue de cette PR-ci — c'est la décision la plus
structurante du backlog).**
- **`/docs` devient l'unique hub d'apprentissage**, organisé en 4 rubriques :
  *Démarrer* (getting-started, déploiement [item 8]) ; *Comprendre* (concepts :
  architecture Python→React, le registre & llms.txt, theming/accessibilité — 3 pages
  nouvelles) ; *Construire* (catalogue, cheat sheet [item 9], recettes : « un
  dashboard en 20 lignes », « un CRUD complet », « brancher un module » — 3 recettes
  nouvelles s'appuyant sur les modules existants) ; *Suivre* (changelog, roadmap).
- **`/resources` se recentre** sur les liens sortants et machine : PyPI, npm, llms.txt,
  llms-core.txt, MCP, dépôt — et cesse de dupliquer les cartes du hub docs.
- Redirections : aucune URL existante ne casse (les pages bougent peu, ce sont les
  hubs qui changent).
- Contenu nouveau : ~6 pages **réellement utiles** (concepts + recettes), chacune avec
  code exécuté/vérifié, i18n FR/EN. C'est l'essentiel de l'effort.

**Découpage interne.** Si la PR devient trop grosse : 10a (hubs + redirections),
10b (concepts), 10c (recettes) — même branche de base, trois PR successives.

**Validation.** Zéro lien cassé (crawl interne), zéro doublon de carte entre les deux
hubs, parité i18n, mobile.

---

### Item 11 — Perf : lazy-load des simulateurs lourds
`Implements: vitrine-11-perf-simulateurs`

**Problème.** `/modules/wiki` (et simulateurs similaires) importent markdown +
highlight.js en top-level d'un client component : blocages de rendu observés à
l'audit.

**Périmètre.**
- Inventaire des imports lourds dans `app/(app)/modules/*/simulateur/page.tsx` et
  `simulator/` (react-markdown, rehype-highlight, plotly, éditeurs).
- `next/dynamic` (`ssr: false` + squelette `bpm.skeleton`) pour les blocs lourds ;
  CSS highlight.js chargé avec le composant, pas globalement.
- Mesure avant/après : taille du chunk de page (`next build` affiche les tailles) —
  objectif : première peinture de `/modules/wiki` sans le bundle markdown.
- Étendre au cas vu sur `/components` si pertinent (Plotly est déjà le plus lourd de
  la page galerie).

**Validation.** `next build` : chunks des pages simulateurs en nette baisse (chiffres
dans la PR) ; comportement identique après chargement ; pas de flash de layout.

---

## 3. Gouvernance (rappel opposable à chaque PR)

- Une PR = un item. Branches `fix/vitrine-<item>`. Squash. Jamais de push direct
  master. Revue humaine avant merge. Arrêt après chaque PR.
- Parité i18n FR/EN stricte (le type `Dictionary` la garantit à la compilation —
  toute clé ajoutée à `fr.ts` doit exister dans `en.ts`).
- Tokens `--bpm-*` et classes `site-*` uniquement ; pas de régression mobile.
- Validation par PR : `npm run build` vert, `tsc --noEmit` à 0, pages concernées en
  200 FR+EN, vérification mobile.
- Déploiement : manuel sur bpm-prod, jamais Vercel.

## 4. Décisions demandées au valideur (avant chantier 1)

1. **PR #44** : merger (recommandé) ou fermer — fige les chemins `/docs` pour les
   items 3, 6, 8, 9, 10.
2. **Version produit unifiée 1.0.0 au lancement** : oui/non/plus tard (item 1 n'en
   dépend pas).
3. **Snippet de galerie = `example` du registre** (item 5) : ok ?
4. **Cartographie cible de l'item 10** (rubriques + 6 pages nouvelles) : valider ou
   amender la liste.
5. **Dépôt public** pour les liens de vivacité (item 7) : confirmer.
