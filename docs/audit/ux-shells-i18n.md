# P0 — Audit de l'existant : shells UX & bilinguisme

> **Phase P0 — read-only.** Ce document cartographie ce qui *est* (état du dépôt sur
> `master` / branche `claude/ux-shells-i18n-y046wo`, le 2026-06-13). Aucune écriture de
> code applicatif. Il alimente P1 (benchmark) et P2 (schéma cible).
> Baseline outillage à l'instant de l'audit : `npx tsc --noEmit` **propre (exit 0)**.

---

## 1. Méthode & périmètre

- Recensement de chaque `layout.tsx` et `page.tsx` non-API sous `app/`.
- Pour chaque surface : groupe de routes, layout hérité, **shell effectif** (sidebar /
  bascule FR-EN / barre mobile présents O-N), indexation (`robots`/`canonical`).
- Relevé ciblé des points demandés par le brief : doublon `/docs/components` vs
  `/composants`, état réel de `/connecteurs` (grep `SiteNav` + `Sidebar`), auth du groupe
  `(app)`, routes à chaînes en dur hors i18n.
- Croisement avec les **branches distantes** et **PR ouvertes** (cluster `wb816k`,
  chantier `connecteurs`) pour la garde de gel.

---

## 2. Les deux chrome (shells) — sources de vérité

| Shell | Layout racine du groupe | Composant chrome | Sidebar | Bascule FR/EN | Barre mobile | Cloche |
|---|---|---|---|---|---|---|
| **Vitrine** (« site ») | `app/(public)/(site)/layout.tsx` | `components/site/SiteNav.tsx` + `SiteFooter` | ❌ | ✅ (header) | ❌ (burger plein écran) | ❌ |
| **App** | `app/(app)/layout.tsx` → `components/AppLayoutClient.tsx` | `Sidebar` + header app | ✅ | ✅ (header app) | ✅ (`bpm-mobile-nav-bar`) | ✅ (`NotificationBell`) |
| **Public nu** | `app/(public)/layout.tsx` | — (styles inline seuls) | ❌ | ❌ | ❌ | ❌ |
| **Auth** | `app/(auth)/…` (pas de layout de groupe) | hérite racine | ❌ | ❌ | ❌ | ❌ |

Notes structurelles vérifiées :
- `app/layout.tsx` est bien un **Server Component** (pas de `'use client'`), pose
  `<LocaleProvider>` global, lit le cookie `bpm-locale` via `getLocale()`. ✔ contrainte respectée.
- `app/(app)/layout.tsx` (Server) délègue tout l'interactif à `AppLayoutClient` (`'use client'`). ✔
- La bascule FR/EN existe en **deux implémentations distinctes mais visuellement identiques** :
  `SiteNav` (`.site-locale-switch`) et `AppLocaleSwitch` dans `AppLayoutClient` (réutilise les
  mêmes classes `.site-locale-*`). Même cookie `bpm-locale`, même `useI18n`. Cohérent.

### Imbrication des groupes (la cause racine)

```
app/
 ├─ (public)/                 layout nu (styles inline)
 │   ├─ (site)/               ← SHELL VITRINE (SiteNav + footer)
 │   │   ├─ page.tsx          /                (accueil)
 │   │   ├─ presentation, mcp, resources, docs, docs/getting-started, docs/changelog
 │   │   ├─ components/        /components      (catalogue, indexable)
 │   │   ├─ docs/components/   /docs/components  (catalogue) + 112 fiches + [slug]
 │   │   └─ legal, privacy, terms
 │   └─ demo/production/…     public, chrome propre (hors (site))
 ├─ (app)/                    ← SHELL APP (Sidebar + cloche + barre mobile)
 │   ├─ dashboard, demo, settings, sandbox
 │   ├─ composants/           /composants      (MÊME catalogue, shell app)
 │   └─ modules/ + 30 modules + fiches/simulateur/documentation
 ├─ (auth)/                   login, register, forgot-password (sans chrome)
 └─ transitions/              /transitions (page de démo, sans chrome)
```

Le split actuel **n'est pas sémantique** : il résulte de l'historique des groupes de
routes. Une même *nature* de contenu (le catalogue de composants) existe **dans les deux
shells** à la fois.

---

## 3. Cartographie par surface (shell effectif & indexation)

Les fiches/sous-pages héritent du shell de leur groupe ; regroupées pour lisibilité.

| Route(s) | Groupe | Shell effectif | `robots` | `canonical` | i18n |
|---|---|---|---|---|---|
| `/` (accueil) | (site) | Vitrine | index | racine (`BASE_URL`) | dict partagé ✅ |
| `/presentation` | (site) | Vitrine | index | racine | ✅ |
| `/mcp` | (site) | Vitrine | index | racine | ✅ |
| `/resources` | (site) | Vitrine | index | racine | ✅ |
| `/docs`, `/docs/getting-started`, `/docs/changelog` | (site) | Vitrine | index | racine | ✅ |
| `/components` | (site) | Vitrine | index | **`…/components`** | ✅ (catalogue) |
| `/docs/components` | (site) | Vitrine | index | racine (pas d'override) | ✅ (catalogue) |
| `/docs/components/<slug>` ×112 (statiques) | (site) | Vitrine | index | **aucun par-fiche** | local `fr/en` ✅ |
| `/docs/components/[slug]` (fallback dynamique) | (site) | Vitrine | index | **aucun par-fiche** | dict partagé ✅ |
| `/legal`, `/privacy`, `/terms` | (site) | Vitrine | index | racine | ✅ |
| `/dashboard` | (app) | App | index | racine | (peu de texte) |
| `/composants` | (app) | **App** | **noindex** | **`…/docs/components`** | ✅ (même catalogue) |
| `/modules` + `/modules/<m>` (+ `/documentation`, `/simulateur`) | (app) | App | index | racine | local `strings.ts` ✅ |
| `/modules/connecteurs` (module d'ingestion) | (app) | App | index | racine | ✅ |
| `/sandbox` | (app) | App | index | racine | **chaînes en dur** ⚠️ |
| `/demo` | (app) | App | index | racine | **chaînes en dur** ⚠️ |
| `/settings` | (app) | App | (redirigé → `/dashboard` par middleware) | — | — |
| `/demo/production/…` | (public, hors site) | Public nu | index | racine | — |
| `/login`, `/register`, `/forgot-password` | (auth) | Aucun chrome | index | racine | — |
| `/transitions` | racine | Aucun chrome | index | racine | — |

---

## 4. Problème nº1 — Le catalogue Composants vit dans **deux shells** (croisement carte→fiche)

**Constat de code.** Le composant partagé `components/site/ComponentsCatalogue.tsx`
(zéro-dup, déjà présent sur cette branche depuis #100) est monté **trois** fois :

| URL | Fichier | Shell |
|---|---|---|
| `/components` | `app/(public)/(site)/components/page.tsx` | Vitrine |
| `/docs/components` | `app/(public)/(site)/docs/components/page.tsx` | Vitrine |
| `/composants` | `app/(app)/composants/page.tsx` | **App** |

Or ce composant **code en dur** la cible des cartes :

```tsx
// components/site/ComponentsCatalogue.tsx:262-264
<Link key={item.slug} href={"/docs/components/" + item.slug} … >
```

**Conséquence (le symptôme du brief).** Depuis `/composants` (shell App, avec sidebar),
cliquer une carte navigue vers `/docs/components/<slug>` (shell Vitrine, **sans** sidebar)
→ **éjection inter-shell**. Les fiches ne vivent **pas** dans le shell de leur catalogue
App. C'est la violation directe du principe B (« fiches dans le même shell que leur
catalogue »).

**Double indexation associée.** `/components` (canonical→`/components`, *index*) **et**
`/docs/components` (canonical = racine, *index*) exposent **le même** catalogue, tous deux
indexables → deux URL concurrentes pour un contenu identique. `/composants` est, lui,
correctement neutralisé (`noindex` + canonical→`/docs/components`).

**Fiches : pas de métadonnée par-slug.** Ni les 112 fiches statiques ni le fallback
`[slug]` n'exportent `generateMetadata`/`canonical`. Toutes héritent du titre de layout
« Composants » → **112 fiches au même `<title>`**, sans canonical propre.

**Statique vs dynamique.** Il existe **112 répertoires de fiches statiques** (`button/`,
`card/`, …, dont des quasi-doublons : `highlight-box` vs `highlightbox`, `title1/2/3`,
`altair`/`altairchart`, `plotly`/`plotlychart`) **plus** un fallback `[slug]/page.tsx`
(server, lit `lib/generated/bpm-components.json`). Deux chemins de rendu pour le même
concept (un riche écrit à la main, un générique de repli).

---

## 5. Problème nº2 — `/connecteurs` : le *pilier* public **n'existe pas encore** ; absent de toute nav

Le brief décrit « `/connecteurs` existe (liste + fiche FR/EN) mais SANS entrée de nav ».
**L'audit du code contredit partiellement cette hypothèse** : il faut distinguer **deux
objets homonymes** (cf. `docs/connecteurs/PLAN.md`, validé 2026-06-13) :

| | Module d'ingestion (existe) | Pilier vitrine (cible du brief) |
|---|---|---|
| Route | `/modules/connecteurs` | `/connecteurs` (libre, non créée) |
| Emplacement | `app/(app)/modules/connecteurs/` — **zone gelée** | `app/(public)/(site)/connecteurs/` — **inexistant** |
| Shell | App | (serait Vitrine au plan ; B impose plutôt App, cf. P2) |
| Nature | démonstrateur d'écran | catalogue curé de descripteurs d'API |
| Statut | livré, listé dans `/modules` (carte, ligne 61 de `modules/page.tsx`) | **non livré** |

**État réel sur `master`/branche courante :**
- `lib/connectors/` ne contient que la **couche schéma** (PR1 = #97) :
  `types.ts`, `schema.ts`, `mapping.ts`, `vault.ts`. **Pas** de `catalog.ts`, **pas** de
  `descriptors/`, **pas** de `app/(public)/(site)/connecteurs/`.
- La **surface** `/connecteurs` + ses **descripteurs** vivent uniquement sur des branches
  **non mergées** : `claude/connecteurs-catalogue`, `claude/connecteurs-seed`,
  `claude/connecteurs-surface` (PRs 2-4 du plan, **aucune PR ouverte**).
- `grep SiteNav` : `components/site/SiteNav.tsx` liste `presentation, mcp, resources, docs`.
  **Aucune** entrée Composants / Modules / Connecteurs (choix délibéré documenté l.9-12).
- `grep Sidebar` : `components/Sidebar/Sidebar.tsx` liste `dashboard, composants, modules,
  sandbox, demo`. **Aucune** entrée Connecteurs.

**Synthèse.** Le pilier `/connecteurs` est donc **invisible parce qu'inexistant** sur la
ligne master, pas seulement « sans entrée de nav ». Tout `surfaçage` (P3) suppose soit de
créer la surface + descripteurs (or **« ajout de NOUVEAUX descripteurs » est HORS SCOPE**),
soit de récupérer le travail des branches `connecteurs-*` non mergées. **➜ Point dur à
arbitrer au GATE P2** (cf. §9).

---

## 6. Auth du groupe `(app)` — **public, non gardé**

`middleware.ts` :
- matcher = `["/settings", "/dashboard/:path*", "/docs/:path*", "/modules/:path*"]`.
- Seule règle active : `/settings` → redirect `/dashboard`.
- Commentaire explicite : *« Plus de redirection vers /login : l'app est accessible sans
  authentification. »*

➜ Le groupe `(app)` (donc `/composants`, `/modules`, `/sandbox`, `/dashboard`, `/demo`)
est **entièrement public**. La sidebar affiche un bloc utilisateur **si** `session?.user`
(NextAuth) est présent, mais l'accès ne dépend pas de l'auth. Conséquence pour B : aucun
mur d'auth ne s'oppose à ce que des surfaces de *référence* vivent dans le shell App.

---

## 7. i18n — architecture & lacunes

**Architecture (saine).**
- Dictionnaire **partagé** `lib/i18n/{fr,en}.ts` (659 lignes chacun, symétriques).
  `Dictionary = typeof fr` ⇒ **parité structurelle imposée par TypeScript** : toute clé
  manquante côté `en` casse la compilation. `LOCALES = ["fr","en"]`, défaut `fr`,
  cookie `bpm-locale`, helper `fmt()`.
- `LocaleProvider` global (client) + `getLocale()/getDict()` (server) → bascule SSR-cohérente.
- **Pattern local** : modules (31 `strings.ts`) et fiches composants statiques (consts
  `fr`/`en` in-fichier, `en` typé sur `fr`). Précédent éprouvé, hors dictionnaire partagé.

**Couverture par surface (heuristique grep `useI18n|getDict|strings|dict.`).**
- Vitrine : home, presentation, mcp, resources, docs, changelog, components, fiches →
  **i18n ✅**. (`/docs/components` et `/composants` sont de simples wrappers de
  `ComponentsCatalogue`, lui-même i18n — faux négatif du grep.)
- Modules : **127/131** `page.tsx` consomment i18n/strings.
- **Surfaces à chaînes en dur (⚠️ à traiter)** :
  - `/sandbox` (`app/(app)/sandbox/page.tsx`) — labels de démo FR en dur (« Ouvrir le
    modal », « Contenu du tiroir latéral », …).
  - `/demo` (`app/(app)/demo/page.tsx`) — « Dernières commandes », « Performance des
    commerciaux ce mois », « Demo - Suivi commercial », …
  - `/dashboard`, `/settings` : peu/pas de texte (settings redirige).
  - Quelques `page.tsx` de modules (4/131) sans i18n détecté — à confirmer au cas par cas.

**Bascule présente / absente.**
- Présente : Vitrine (header `SiteNav`) **et** App (header `AppLayoutClient`).
- **Absente** : groupes `(auth)`, `(public)/demo/production`, `/transitions` (hors chrome).
  Hors périmètre B « narratif/référence » mais à noter pour la parité « bascule partout ».

---

## 8. SEO / canonical — incohérences relevées

1. **Domaine incohérent.** `app/layout.tsx` et `app/sitemap.ts` utilisent
   `BASE_URL = NEXT_PUBLIC_APP_URL ?? https://app.blueprint-modular.com`, alors que les
   `canonical` de pages composants pointent vers `https://blueprint-modular.com/...` (sans
   `app.`). Deux origines déclarées comme canoniques selon la surface.
2. **Deux catalogues indexables** : `/components` et `/docs/components` (cf. §4).
3. **Canonical racine global** : `app/layout.tsx` pose `alternates.canonical = BASE_URL`.
   Toute page sans override hérite donc d'un canonical = page d'accueil (ex. `/docs`,
   `/resources`, fiches) — **canonical trop large**.
4. `sitemap.ts` liste `/components` **et** `/docs/components` (les deux), pas `/composants`
   (correct, noindex), pas `/connecteurs` (inexistant).

---

## 9. Branches en vol & garde de gel (état à l'instant de l'audit)

- **PR ouvertes : 0** (`list_pull_requests state=open` → `[]`).
  ➜ À cet instant, **aucune PR `wb816k` n'est “en vol”** ; la condition de gel
  « SI wb816k en vol » sur `lib/i18n/{fr,en}.ts` **n'est pas active**. Mais **~50 branches
  `*-wb816k`** existent (i18n modules, fiches, app-shell…) et peuvent ouvrir des PR à tout
  moment → re-vérifier `state=open` **juste avant** chaque écriture P3 touchant i18n/modules/fiches.
- **Chantier connecteurs** : branches `connecteurs-schema` (mergée = #97),
  `connecteurs-catalogue`, `connecteurs-seed`, `connecteurs-surface`,
  `connecteurs-pillar-yym98q` — **non mergées, aucune PR ouverte**.
- **`components/site/ComponentsCatalogue.tsx`** : déjà sur la branche courante (zéro-dup),
  réutilisable tel quel. Ne pas merger `claude/components-modules-ux-7f1vln`.
- Zones gelées confirmées présentes : `packages/core/src/schema/app-spec.ts`,
  `app/(app)/modules/connecteurs/`, `lib/i18n/{fr,en}.ts` (gel conditionnel).

---

## 10. Synthèse — problèmes ouverts à traiter en P2 (entrées du schéma cible)

| # | Problème (P0) | Nature | À trancher en P2 |
|---|---|---|---|
| A | Catalogue Composants dans 2 shells ; cartes → `/docs/components/<slug>` en dur ⇒ **éjection inter-shell** | Architecture B | Quel shell héberge la *référence* composants (catalogue **et** fiches) ? Rendre la cible des cartes relative au shell. |
| B | `/components` **et** `/docs/components` indexables (double catalogue) | SEO | Un seul canonical composants ; désindexer/rediriger l'autre. |
| C | 112 fiches sans `<title>`/canonical propres ; statiques + fallback `[slug]` redondants | SEO/IA | Métadonnée par-fiche ; clarifier statique vs dynamique. |
| D | Pilier `/connecteurs` **inexistant** sur master (surface + descripteurs sur branches non mergées) ; **absent de SiteNav et Sidebar** | IA / scope | Comment « surfacer » sans créer de NOUVEAUX descripteurs (hors scope) ? Récupérer `connecteurs-surface` ? **Question de GATE.** |
| E | Module `connecteurs` (gelé) ≠ pilier `Connecteurs` : risque de **deux “Connecteurs”** visibles ensemble | IA / nommage | Stratégie de désambiguïsation nav (cf. PLAN §15). |
| F | Bascule FR/EN absente hors chrome (auth, demo/production, transitions) ; `/sandbox` & `/demo` à **chaînes en dur** | i18n | Parité « bascule partout » : périmètre exact (référence vs utilitaire). |
| G | Domaine canonical incohérent (`app.` vs apex) + canonical racine trop large | SEO | Origine canonique unique ; overrides ciblés. |
| H | `(app)` public (non gardé) | Contexte | Confirme que des surfaces de référence peuvent vivre dans le shell App. |

**Aucune décision n'est prise ici.** P1 (benchmark) puis P2 (schéma cible) statueront,
et le **GATE humain** validera avant tout code (P3).
