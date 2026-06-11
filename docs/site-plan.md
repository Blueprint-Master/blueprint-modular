# Plan de refonte du site public — blueprint-modular.com

> Phase 0 de la mission « site overhaul ». Audit de l'existant, architecture
> d'information cible, stratégie i18n et plan de design. Aucun code dans cette phase.

## 1. Audit de l'existant

### 1.1 Inventaire des pages publiques

| Route | État | Problèmes relevés |
| --- | --- | --- |
| `/` | Redirection brute vers `/dashboard` (middleware + `app/page.tsx`) | **Aucune page d'accueil.** Le domaine atterrit dans l'app sans pitch, sans contexte produit. |
| `/components` | Showcase complet (PR #12), FR seul | Compteur codé en dur (`COMPONENT_COUNT = 104` vs 101 au registre, 150 exports barrel). Pas de nav site, pas d'EN. À **intégrer**, pas remplacer. |
| `/docs` | Index minimal | Trois paragraphes, renvoie vers un site externe. Pas de hiérarchie, pas vendeur. |
| `/docs/getting-started` | Wizard 3 étapes | Tutoiement (« Choisis ton cas d'usage ») incohérent avec le reste du site (vouvoiement). Le « code adapté au cas d'usage » est le même pour les 4 cas — promesse non tenue. |
| `/docs/components` | Index registry-driven avec aperçus live | Bon socle : données issues de `lib/generated/bpm-components.json`. FR seul. |
| `/docs/components/[slug]` | Page dynamique registry-driven | Très mince (titre + description + pagination). |
| `/docs/components/<name>` ×~100 | Pages statiques écrites à la main | **Redondance majeure** : descriptions dupliquées à la main (violation de la règle « zéro duplication »), masquent la route dynamique. Certaines ont des sandboxes interactives de valeur. |
| `/docs/changelog` | Page changelog | Hors périmètre prioritaire. |

### 1.2 Source de vérité — état réel

- `packages/core/src/bpm.tsx` : **présent** (garde OK), ~150 exports.
- `public/llms.txt` : généré (v0.1.60), 80 Ko de référence machine. Réel et différenciant.
- `lib/generated/bpm-components.json` : 101 entrées `{slug, name, description, category}`, descriptions **FR uniquement**, généré depuis le registre Python (`bpm/_doc_components.py`).
- **Écart factuel** : la mission mentionne « 26 instruments au standard jugement
  (`interpret(v,c)`) ». Cette API **n'existe nulle part dans le code**
  (grep exhaustif : 0 occurrence). Ce qui existe réellement : des composants
  métier à seuils et états intégrés (`liveGauge` avec `warningAbove`/`criticalAbove`,
  `anomalyAlert`, `statusTracker`, `flowDiagram`, `approvalFlow`…).
  **Décision copy : ne pas survendre.** Le positionnement s'appuie sur ce qui est
  vérifiable : composants métier avec états/seuils intégrés + docs lisibles par
  les agents (`llms.txt`).

### 1.3 i18n — état réel

Aucune infrastructure i18n. `<html lang="fr">` figé, toutes les chaînes en dur en FR,
OpenGraph `fr_FR`, JSON-LD `inLanguage: "fr"`.

## 2. Architecture d'information cible

```
/                      Accueil — pitch produit (nouvelle page, groupe (public))
/components            Showcase intégral (PR #12, intégré : nav site + i18n chrome)
/docs                  Hub documentation — réécrit (vue d'ensemble, liens structurés)
/docs/getting-started  Parcours d'installation — réécrit (vouvoiement, code réel)
/docs/components       Catalogue registry-driven (existant, chrome i18n)
/docs/components/*     Fiches composants (statiques conservées + [slug] enrichi)
```

- Le pitch (`/`) remplace la redirection vers `/dashboard`. L'app reste accessible
  via un CTA « Ouvrir l'app » → `/dashboard`. Le middleware ne redirige plus `/`.
- `/components` garde son URL et son contenu (contrainte PR #12) ; il gagne la
  nav site commune, un compteur dérivé du registre et un en-tête bilingue.
- Les ~100 pages statiques de docs composants sont **conservées** dans cette passe
  (elles portent des sandboxes interactives) ; leur dé-duplication vers un template
  unique registry-driven est listée comme dette dans `site-report.md`.

## 3. Stratégie i18n

**Choix : module i18n maison, locale par cookie, sans dépendance nouvelle.**

Justification face aux deux options de la spec :

- *Segments de locale app-router* (`/fr/...`, `/en/...`) : casserait les URLs
  existantes (`/components` de la PR #12, `/docs/*` indexés) — contrainte explicite.
- *next-intl* : dépendance externe + configuration requestConfig pour un besoin
  couvert par ~80 lignes ; l'installation réseau est un risque dans cet environnement.

Mécanique retenue :

- `lib/i18n/` : `fr.ts` + `en.ts` (dictionnaires typés, parité vérifiable par le
  type system — la clé manquante ne compile pas), `index.ts` (résolution),
  `LocaleProvider.tsx` (contexte client + bascule).
- Locale lue depuis le cookie `bpm-locale` (`fr` par défaut — marché historique),
  posée par un commutateur FR/EN dans la nav site. `<html lang>` suit le cookie
  (lecture server-side dans le root layout).
- **Règle de parité** : chaque clé existe dans `fr.ts` ET `en.ts` ; le type
  `Dictionary` est dérivé de `fr.ts`, donc une clé absente d'`en.ts` est une
  erreur TypeScript. Aucune chaîne du site en dur dans les pages refondues.
- Données composants (noms, descriptions du registre) : affichées telles quelles
  depuis `bpm-components.json` (FR à la source). Les traduire à la main violerait
  la non-redondance ; la voie propre — champ `description_en` dans
  `bpm/_doc_components.py` puis régénération — est notée comme suite dans le rapport.

## 4. Plan de design

**Référentiel : shadcn/ui, Radix, Vercel. Anti-référentiel : template Streamlit générique.**

- **Socle** : tokens `--bpm-*` existants (accent `#048dc3`, light/dark) — le site
  utilise le même système que les composants qu'il vend.
- **Signature** : « le site est construit avec ses propres composants ». Le hero
  de l'accueil rend de vrais composants bpm.* en situation (pas de captures, pas
  d'illustrations stock). Les noms de composants en mono (`bpm.metric`),
  le reste en system stack soignée.
- **Typographie** : hiérarchie nette — display serré (-0.02em) pour les titres,
  corps 15–16px/1.6, mono réservé au code et aux identifiants `bpm.*`.
- **Retenue** : un seul accent (le bleu existant), pas de dégradés décoratifs,
  pas d'emoji structurants, ombres faibles, beaucoup de blanc. Les sections de
  l'accueil alternent par le rythme typographique, pas par des fonds colorés.
- **A11y** : `:focus-visible` systématique, `prefers-reduced-motion` respecté,
  contrastes AA, skip-nav déjà présent conservé.

## 5. Phasage et commits

1. **Socle** — `lib/i18n` + dictionnaires, nav/footer site (`SiteNav`, `SiteFooter`),
   tokens site dans `globals.css`, `<html lang>` dynamique. 1 commit.
2. **Accueil** — pitch FR+EN, hero composants réels, sections : positionnement,
   exemples, llms.txt/agents, CTA install. 1 commit.
3. **/components intégré** — nav site, compteur dérivé du registre, chrome i18n,
   contenu démo inchangé. 1 commit.
4. **Docs** — hub `/docs` + `/docs/getting-started` réécrits FR+EN (vouvoiement,
   code honnête). 1 commit.
5. **Catalogue** — chrome i18n de `/docs/components` (+ `[slug]` enrichi). 1 commit.
6. **Finition** — passe cohérence (terminologie, redondances), responsive, a11y,
   `docs/site-report.md` avec auto-critique. 1 commit.

Prise de recul toutes les deux pages : terminologie commune (voir §6), pas de
redondance de contenu entre accueil, /components et docs.

## 6. Terminologie commune (FR / EN)

| Concept | FR | EN |
| --- | --- | --- |
| Le produit | Blueprint Modular | Blueprint Modular |
| L'API | l'objet `bpm` | the `bpm` object |
| Un composant | composant métier | business component |
| Le différenciateur | docs lisibles par les agents (`llms.txt`) | agent-readable docs (`llms.txt`) |
| Le showcase | la galerie de composants | the component gallery |
| Le catalogue docs | le catalogue | the catalog |
| Démarrer | Démarrage | Getting started |

Ton : vouvoiement en FR, voix active, phrases courtes. Pas de superlatifs invérifiables.
