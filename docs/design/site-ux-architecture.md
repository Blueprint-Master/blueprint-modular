# P2 — Schéma cible du site sous B (shells sémantiques + bilinguisme)

> **Phase P2 — conception, AUCUN code applicatif.** Ce document fixe la cible, la justifie
> (à partir de P0 « existant » et P1 « état de l'art »), et en dérive le DELTA = backlog de P3.
> **⛔ GATE HUMAIN** : après push, **STOP** — aucun code P3 avant validation explicite de Rémi.
> Principe directeur **B** (split narratif/référence) = décidé, non rediscuté ; ce qui se
> décide ici est sa **déclinaison fine**.

---

## 1. Inventaire des parties du site — ce que chaque partie *permet* à l'utilisateur

| Partie | Route(s) | Ce qu'elle permet à l'utilisateur |
|---|---|---|
| Accueil vitrine | `/` | Comprendre la proposition de valeur, entrer dans le produit. |
| Présentation | `/presentation` | Lire le pitch produit détaillé (narratif long). |
| MCP | `/mcp` | Comprendre le connecteur MCP (explainer), copier la config. |
| Ressources | `/resources` | S'orienter : hub de liens vers docs, galerie, modules, MCP. |
| Documentation (hub) | `/docs`, `/docs/getting-started`, `/docs/changelog` | Apprendre à démarrer, suivre les évolutions (narratif). |
| Légal | `/legal`, `/privacy`, `/terms` | Lire les mentions légales / confidentialité / CGU. |
| **Catalogue Composants** | `/composants` (cible) | **Parcourir/chercher** les ~104 composants par catégorie, prévisualiser. |
| **Fiche Composant** | `/composants/<slug>` (cible) | **Consulter** props, exemples, couche sémantique d'**un** composant. |
| **Catalogue Modules** | `/modules` | Parcourir les modules métier prêts à brancher. |
| **Fiche / Simulateur Module** | `/modules/<m>`, `/modules/<m>/documentation`, `/…/simulateur` | Tester un module en ligne, lire sa doc. |
| **Catalogue Connecteurs** *(pilier)* | `/connecteurs` (cible) | **Parcourir** le catalogue curé de descripteurs d'intégrations API. |
| **Fiche Connecteur** | `/connecteurs/<id>` (cible) | Voir champs déclarés, mapping, réponse mock — sans secret. |
| **Sandbox** | `/sandbox` | **Composer/tester** des pages avec les composants (code ou IA), en direct. |
| Tableau de bord app | `/dashboard` | Point d'entrée de l'app (accueil connecté). |
| Démo commerciale | `/demo` (app), `/demo/production/*` (public) | Voir une app d'exemple fonctionnelle. |
| Auth | `/login`, `/register`, `/forgot-password` | S'authentifier (optionnel — app publique). |
| Transitions | `/transitions` | Page de démonstration d'animations (utilitaire interne). |

> Note : le **module d'ingestion** `/modules/connecteurs` (zone gelée) reste **une carte du
> catalogue Modules** — c'est un démonstrateur, **distinct** du *pilier* Connecteurs.

---

## 2. Classification narratif vs référence — le « pourquoi quel UX pour quelle partie »

**Critère (issu de P1, R1).** *Référence* = surface **navigable et structurée** qu'on
**parcourt** (catalogue + fiches, outils) → mérite une **sidebar persistante** (shell App).
*Narratif* = surface **linéaire** qu'on **lit** une fois pour comprendre/s'orienter → respire
**sans** sidebar (shell Vitrine).

| Partie | Classe | Shell cible | Justification (ancrée P1) |
|---|---|---|---|
| Accueil, Présentation | Narratif | Vitrine | Pages de lecture/persuasion ; Tailwind/Stripe gardent le marketing sans sidebar (E5). |
| Documentation (hub, getting-started, changelog) | Narratif | Vitrine | Lecture séquentielle ; **explicitement hors** de la liste des surfaces de référence du brief. |
| MCP | **Narratif** | Vitrine | *Cas limite* : malgré le mot « connecteur », c'est un **explainer** d'une page, pas un catalogue navigable → narratif (cf. §4). |
| Ressources | **Narratif** | Vitrine | *Cas limite* : page d'**orientation** (hub de liens), pas une référence parcourue → narratif (cf. §4). |
| Légal/Privacy/Terms | Narratif | Vitrine | Texte réglementaire linéaire. |
| **Composants** (catalogue + fiches) | **Référence** | **App** | Brief : « composants → shell à sidebar ». État de l'art (Radix/shadcn/Tailwind) : liste **et** fiche sous **la même** sidebar (R1/R2). |
| **Modules** (catalogue + fiches + simulateurs) | **Référence** | **App** | Déjà conforme ; surface parcourue/testée. |
| **Connecteurs** (pilier : catalogue + fiches) | **Référence** | **App** | Brief : « présenté comme /modules et /composants » → même shell qu'eux (App), même rang de nav. |
| **Sandbox** | **Référence/outil** | **App** | *Cas limite* : outil interactif qui **consomme** la référence (composants) ; a besoin du contexte sidebar pour revenir au catalogue/modules → App (déjà le cas). |
| Dashboard, Demo (app) | App/utilitaire | App | Surfaces applicatives ; pas dans l'axe narratif/référence. |
| Demo/production, Auth, Transitions | Utilitaire | Chrome propre / sans chrome | Hors axe B ; conservées telles quelles (note i18n §5). |

### Décision structurante (déclinaison de B) — la référence **Composants** vit dans le shell App

Aujourd'hui (P0 §4) le **même** catalogue est monté dans **deux** shells et les cartes
pointent en dur vers `/docs/components/<slug>` (Vitrine) → **éjection** depuis `/composants`
(App). Conformément à B (« référence → sidebar ») et à P1 (R2 « fiche dans le shell du
catalogue »), **la référence Composants est consolidée dans le shell App** :

- **Canonique** : `/composants` (catalogue) + `/composants/<slug>` (fiches), **shell App**.
- Côté Vitrine, `/docs/components` et `/components` ne **dupliquent plus** la référence :
  ils **redirigent** vers la référence App (R5/E2). Le narratif `/docs` garde un lien
  « Voir les composants » qui *pointe* vers `/composants`.

---

## 3. Arbre de navigation cible & table partie × shell

### 3.1 Diagramme (Mermaid)

```mermaid
graph TD
  ROOT["app/layout.tsx (Server, LocaleProvider, &lt;html lang&gt; dynamique)"]

  ROOT --> VIT["SHELL VITRINE — sans sidebar<br/>(public)/(site) : SiteNav + Footer + bascule FR/EN"]
  ROOT --> APP["SHELL APP — avec sidebar + cloche + barre mobile + bascule FR/EN<br/>(app)"]
  ROOT --> UTIL["Hors axe B : (auth), (public)/demo/production, /transitions"]

  %% --- Vitrine : NARRATIF ---
  VIT --> Home["/ Accueil"]
  VIT --> Pres["/presentation"]
  VIT --> Mcp["/mcp (explainer)"]
  VIT --> Res["/resources (hub orientation)"]
  VIT --> Docs["/docs · getting-started · changelog"]
  VIT --> Legal["/legal · /privacy · /terms"]
  Res -.lien.-> Comp
  Docs -.\"Voir les composants\".-> Comp
  DocsRedir["/docs/components, /components → 308"] -.redirect.-> Comp

  %% --- App : RÉFÉRENCE ---
  APP --> Dash["/dashboard (Accueil)"]
  APP --> Comp["/composants (catalogue)"]
  Comp --> CompF["/composants/&lt;slug&gt; (fiche)"]
  APP --> Mods["/modules (catalogue)"]
  Mods --> ModF["/modules/&lt;m&gt; (fiche · doc · simulateur)"]
  APP --> Conn["/connecteurs (pilier — NOUVELLE entrée nav)"]
  Conn --> ConnF["/connecteurs/&lt;id&gt; (fiche)"]
  APP --> Sbx["/sandbox (outil)"]
  APP --> Demo["/demo"]

  classDef ref fill:#e6f4fb,stroke:#048dc3;
  classDef nar fill:#f3f3f3,stroke:#999;
  class Comp,CompF,Mods,ModF,Conn,ConnF,Sbx,Dash,Demo ref;
  class Home,Pres,Mcp,Res,Docs,Legal nar;
```

### 3.2 Table partie × shell × justification (cible)

| Partie (cible) | Shell | Sidebar | Bascule FR/EN | Indexation | Justification courte |
|---|---|---|---|---|---|
| `/`, `/presentation` | Vitrine | ❌ | ✅ | index | narratif (lecture) |
| `/mcp`, `/resources` | Vitrine | ❌ | ✅ | index | narratif (explainer/orientation) |
| `/docs`, getting-started, changelog | Vitrine | ❌ | ✅ | index | narratif (doc) |
| `/legal`, `/privacy`, `/terms` | Vitrine | ❌ | ✅ | index | narratif (légal) |
| **`/composants` (+ `/<slug>`)** | **App** | ✅ | ✅ | **index, canonical self** | référence (R1/R2) |
| `/docs/components`, `/components` | Vitrine | ❌ | ✅ | **308 → `/composants`** | dédup (R5/E2) |
| **`/modules` (+ `/<m>`…)** | **App** | ✅ | ✅ | index | référence |
| **`/connecteurs` (+ `/<id>`)** | **App** | ✅ | ✅ | index, canonical self | pilier référence |
| **`/sandbox`** | **App** | ✅ | ✅ | index | outil/référence |
| `/dashboard`, `/demo` | App | ✅ | ✅ | index | applicatif |
| `/demo/production`, `/login…`, `/transitions` | propre / nu | ❌ | (à noter §5) | — | hors axe B |

---

## 4. Cas limites — traitement explicite

- **Sandbox (`/sandbox`)** → **Référence/outil, shell App.** Raison : l'utilisateur *compose*
  avec les composants et doit pouvoir revenir au catalogue/modules sans changer de chrome
  (R2). Reste où il est ; **dette i18n** (chaînes en dur) traitée en §5. *Écarté* : le
  basculer en vitrine (le couperait du contexte de référence — E4).
- **`/resources`** → **Narratif, shell Vitrine.** Raison : c'est une page d'**orientation**
  (hub de liens vers docs/galerie/modules/MCP), lue une fois ; pas un catalogue qu'on
  parcourt. Elle **pointe** vers la référence App (`/composants`) plutôt que de l'héberger.
- **`/mcp`** → **Narratif, shell Vitrine.** Raison : malgré le terme « connecteur MCP »,
  c'est un **explainer** d'une seule page (à quoi sert le MCP, comment le brancher), pas une
  surface navigable de référence. Ne pas le confondre avec le **pilier Connecteurs** (API)
  ni avec le **module connecteurs** (ingestion). Trois objets distincts, désambiguïsés par
  le titre de page.
- **Triple homonymie « connecteur »** (consignée pour éviter la confusion en nav) :
  1. **MCP** (`/mcp`, vitrine, narratif) — pont agents/MCP.
  2. **Module d'ingestion** (`/modules/connecteurs`, App, **gelé**) — démonstrateur REST/SFTP/DB.
  3. **Pilier Connecteurs** (`/connecteurs`, App, **cible**) — catalogue curé de descripteurs API.
  ⇒ Au MVP, ces trois noms **ne co-occurrent dans aucune barre de navigation unique** : MCP
  vit dans la SiteNav vitrine ; le pilier `/connecteurs` vit dans la Sidebar App ; le module
  reste une **carte** *dans* `/modules` (pas une entrée de nav). Le renommage du module
  homonyme est **différé** (zone gelée, cf. PLAN §15).

---

## 5. Stratégie i18n cible (bascule partout, parité FR/EN)

**Principe retenu (P1 R3/R4/R6, E1 écarté) :** bilinguisme **par dictionnaire + cookie
`bpm-locale`**, **pas** d'arbre de routes `/fr` `/en`. Bascule **globale dans le chrome**,
présente sur toute surface dotée d'un chrome.

| Sujet | Cible | État P0 | Action |
|---|---|---|---|
| Dictionnaire partagé `lib/i18n/{fr,en}` | parité **imposée au type** (`typeof fr`) | déjà le cas (659/659) | **aucune** clé EN manquante au niveau dict |
| Bascule vitrine | header `SiteNav` | ✅ | aucune |
| Bascule App | header `AppLayoutClient` | ✅ | aucune |
| **Libellés Sidebar App** | **bilingues** | **chaînes en dur FR** ⚠️ | i18n via **`strings.ts` local** (Accueil/Composants/Modules/Connecteurs/Sandbox/Demo), `en` typé sur `fr` |
| **`/sandbox`** | contenu bilingue | chaînes en dur ⚠️ | `strings.ts` local (pattern modules) |
| **`/demo`** | contenu bilingue | chaînes en dur ⚠️ | `strings.ts` local |
| **`/connecteurs`** (cible) | bilingue | inexistant | `strings.ts` local (cf. PLAN §10) |
| Surfaces sans chrome (auth, demo/production, transitions) | hors axe B | pas de bascule | **noter** ; hors périmètre « référence/narratif » (option : bascule au pied de page auth — différée) |

**Garde i18n (P3) :** `lib/i18n/{fr,en}.ts` n'est **pas modifié** par la cible (on passe par
des `strings.ts` locaux) → **insensible au gel wb816k** sur le dict partagé. Si malgré tout
une clé partagée devait bouger **et** qu'une PR `wb816k` ouverte la réécrit → **STOP-ET-
RAPPORTE** + inventaire des clés EN manquantes (différé), les autres sous-tâches continuent.

---

## 6. Stratégie canonical / SEO cible

| # | Cible | Corrige (P0) |
|---|---|---|
| S1 | **Une seule origine canonique** dérivée de `NEXT_PUBLIC_APP_URL` (*supprimer* les `https://blueprint-modular.com/...` codés en dur des layouts composants). **Choix du host** (apex vs `app.`) = **décision Rémi** (cf. GATE). | §8.1 domaine incohérent |
| S2 | **Un seul canonical Composants = `/composants`** (référence App). `/docs/components` & `/components` → **308** vers `/composants` (et `/docs/components/<slug>` → `/composants/<slug>`). | §4 double catalogue (B/C) |
| S3 | **`/composants`** passe **`index`** + **canonical self** ; suppression du `noindex`+canonical→docs actuel. | §4 |
| S4 | **`generateMetadata` par fiche** (`/composants/<slug>`) : `<title>` = nom du composant, canonical self. Fin des 112 fiches au même titre. | §4 (C) |
| S5 | **Canonical racine non « fourre-tout »** : retirer `alternates.canonical = BASE_URL` global du root layout (qui force tout vers l'accueil) ; canonical **self-référentiel** par section. | §8.3 |
| S6 | `sitemap.ts` : remplacer `/docs/components` + `/components` par **`/composants`** ; ajouter `/connecteurs` **si** le pilier est livré (gate). | §8.4 |

> Pas d'`hreflang` (E1 : bilinguisme par cookie, pas d'URL par langue) — assumé et documenté.

---

## 7. DELTA existant → cible = backlog ordonné de P3

> Un **commit par changement logique**. Chaque incrément : `tsc` + `npm run gate` + build +
> `next dev` (routes FR & EN, bascule OK). **Pré-check de gel** avant tout fichier : aucune
> PR `wb816k` ouverte ne le réécrit (sinon STOP-ET-RAPPORTE).

### Lot 1 — Composants : consolidation référence dans le shell App *(résout le symptôme nº1)*
- **D1.1** `ComponentsCatalogue.tsx` : cible des cartes **relative au shell** via prop
  `basePath` (def. `/composants`). *(zéro-dup conservé.)*
- **D1.2** Co-localiser les fiches dans le shell App : déplacer le sous-arbre
  `app/(public)/(site)/docs/components/[slug]/` **et** les 112 fiches statiques `<slug>/`
  vers `app/(app)/composants/`. Mettre à jour les préfixes d'`href` prev/next + breadcrumb
  (`/docs/components/` → `/composants/`). **⚠️ FREEZE : cluster `wb816k` `fiches-*` /
  `i18n-fiches-*` réécrit ces fichiers** → re-vérifier `state=open` juste avant ; si PR
  ouverte → **STOP-ET-RAPPORTE**. *(Décision d'approche = GATE, cf. §8.)*
- **D1.3** `/composants/layout.tsx` : `index` + canonical self (retirer `noindex`+canonical→docs).
- **D1.4** `generateMetadata` par fiche (titre = nom, canonical self).
- **D1.5** Vitrine : `/docs/components` & `/components` → **308** vers `/composants`
  (redirects `next.config.mjs`) ; retirer les montages catalogue vitrine devenus inutiles ;
  `/docs` garde un lien narratif « Voir les composants » → `/composants`.
- **D1.6** `sitemap.ts` : `/composants` à la place de `/docs/components` + `/components`.

### Lot 2 — Connecteurs : pilier visible, même rang que Composants/Modules *(GATE-dépendant)*
- **D2.1** Sidebar App + barre mobile : **ajouter l'entrée « Connecteurs »** (`/connecteurs`),
  au même niveau que Composants/Modules, libellé bilingue (D3.1).
- **D2.2** Surface `/connecteurs` (catalogue) + `/connecteurs/<id>` (fiche) **dans le shell
  App**, `strings.ts` local, démo mock. **Source = portage du travail déjà conçu** sur les
  branches `connecteurs-surface`/`-catalogue`/`-seed` (**non mergées**). **⚠️ scope** :
  « ajout de NOUVEAUX descripteurs » est **hors scope** → cet item suppose **porter les
  descripteurs déjà planifiés**, pas en créer. **Arbitrage GATE obligatoire** (§8).
  - *Note divergence* : `docs/connecteurs/PLAN.md` plaçait le pilier en **Vitrine**
    (`(public)/(site)/connecteurs/`). La cible B le place en **App** (référence → sidebar) ;
    P2 **prévaut** sur le PLAN sur ce point, à confirmer au GATE.

### Lot 3 — i18n : parité & bascule partout
- **D3.1** Libellés **Sidebar** (+ barre mobile) bilingues via `strings.ts` local.
- **D3.2** `/sandbox` : chaînes en dur → `strings.ts` local.
- **D3.3** `/demo` : chaînes en dur → `strings.ts` local.
- **D3.4** *(si lib/i18n gelé par PR wb816k au moment voulu)* : produire l'inventaire des
  clés EN manquantes et **différer** ; les autres items du lot continuent. *(Au niveau dict
  partagé, la parité est déjà tenue par le type → cet item ne devrait pas être nécessaire.)*

### Lot 4 — SEO : origine & canonical
- **D4.1** Retirer le canonical racine fourre-tout ; canonical self par section.
- **D4.2** Origine canonique unique via `NEXT_PUBLIC_APP_URL` (retirer les hosts en dur).
  **Host exact = décision Rémi** (GATE S1).

**Ordre & dépendances :** Lot 1 d'abord (symptôme central, autonome). Lot 3 (i18n) en
parallèle possible sauf D3.1 qui sert D2.1. Lot 2 **bloqué au GATE**. Lot 4 indépendant.

---

## 8. ⛔ GATE — décisions requises de Rémi **avant P3**

1. **Approche fiches Composants (D1.2).** Recommandé : **déplacer** les fiches dans le shell
   App (`/composants/<slug>`) + redirections 308 depuis la vitrine. C'est conforme à B mais
   **touche les 112 fiches** → collision potentielle avec le cluster `wb816k` `fiches-*` /
   `i18n-fiches-*` (aucune PR ouverte **à l'instant**, mais ~10 branches existent).
   **Question :** (a) on procède au déplacement maintenant (et on STOP si une PR wb816k
   s'ouvre) ; ou (b) on attend que le cluster fiches soit mergé/clos ; ou (c) approche
   alternative à moindre churn (ex. route App `[slug]` réutilisant le rendu, fiches statiques
   laissées en place derrière des redirects) ?
2. **Pilier Connecteurs (Lot 2).** La surface + descripteurs **n'existent pas sur master**
   (uniquement branches non mergées) et **« nouveaux descripteurs = hors scope »**.
   **Question :** (a) **porter** la surface + les **4 descripteurs seed déjà conçus** depuis
   `connecteurs-surface/-catalogue/-seed` (interprétés comme « pas nouveaux ») ; ou
   (b) livrer **seulement l'entrée de nav** + une landing `/connecteurs` minimale (sans
   descripteurs) ; ou (c) **différer** entièrement le pilier et ne rien ajouter à la nav ?
   **Et** confirmer le placement **App** (vs Vitrine du PLAN).
3. **Origine canonique (S1/D4.2).** Host unique = **apex `blueprint-modular.com`** ou
   **`app.blueprint-modular.com`** ?
4. **Périmètre « bascule partout »** : inclut-on les surfaces **sans chrome** (auth,
   demo/production, transitions) ou les laisse-t-on hors axe B ?

> Tant que ces points ne sont pas tranchés, **aucun code P3**. La boucle P3⇄P4 (audit du
> résultat vs cette cible) démarre **après** le feu vert.
