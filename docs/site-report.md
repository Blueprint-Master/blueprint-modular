# Rapport de refonte du site public — état réel et auto-critique

> Phase 3 de la mission « site overhaul ». Voir `docs/site-plan.md` pour le plan
> initial. Ce rapport décrit ce qui est livré, ce qui ne l'est pas, et où le
> résultat est le plus faible.

## 1. Livré

### Socle
- **i18n FR/EN sans dépendance nouvelle** : `lib/i18n/` (dictionnaires typés —
  une clé absente d'`en.ts` ne compile pas), locale par cookie `bpm-locale`,
  helpers serveur, `LocaleProvider` client avec bascule instantanée
  (`router.refresh()` pour les pages serveur). `<html lang>` suit la locale.
- **Shell du site** : `SiteNav` (liens, commutateur FR/EN, CTA « Ouvrir l'app »)
  et `SiteFooter`, groupe de routes `(site)` dans `(public)`.
- **Couche design** : classes `site-*` dans `globals.css`, construites sur les
  tokens `--bpm-*` existants. Typographie display resserrée, un seul accent,
  `:focus-visible` sur tous les éléments interactifs du site,
  `prefers-reduced-motion` déjà couvert globalement.

### Pages
- **`/` (nouveau)** : la racine ne redirige plus vers `/dashboard` (la
  redirection existait à trois endroits : `app/page.tsx`, le middleware et
  `next.config.mjs`). Accueil pitch : hero avec composants réels (`bpm.metric`,
  `bpm.statusTracker`, `bpm.liveGauge` à seuils), positionnement métier,
  code Python → rendu côte à côte, section agents/llms.txt, familles du
  catalogue, parcours d'installation. Metadata et OpenGraph localisés.
- **`/components`** : intégré au shell (URL et contenu démo PR #12 intacts),
  compteur dérivé du registre (le « 104 » en dur divergeait), chrome bilingue,
  en-tête collant repositionné sous la nav, fond thémable.
- **`/docs`** : hub en cartes (démarrage, catalogue, galerie, llms.txt,
  changelog, prérequis production) au lieu de trois paragraphes.
- **`/docs/getting-started`** : parcours linéaire honnête — l'ancien wizard
  promettait un « code adapté au cas d'usage » qui était identique pour les
  quatre cas ; supprimé. Vouvoiement aligné (l'ancien tutoyait).
- **`/docs/components`** : chrome bilingue, compte interpolé depuis le registre.
- **`/docs/components/[slug]`** : la fiche dynamique affiche la signature de
  props extraite de `public/llms.txt` (`lib/llmsDoc.ts`) — la même source que
  lisent les agents, rien de saisi à la main.

### Vérifications
- `tsc --noEmit` propre à chaque étape ; `next build` vert ; smoke tests HTTP
  sur `/`, `/components`, `/docs`, `/docs/getting-started`,
  `/docs/components(/statustracker)` en FR et EN (contenu et `lang` vérifiés).

### Décisions de fond
- **Pas de survente** : la mission évoquait « 26 instruments au standard
  jugement (`interpret(v,c)`) » ; cette API n'existe nulle part dans le code.
  La copy s'appuie sur ce qui est vérifiable : composants métier à états et
  seuils intégrés, et référence machine `llms.txt` générée depuis les sources.
- **Compteurs** : tous dérivés de `lib/generated/bpm-components.json`
  (101 entrées). Le barrel `bpm.tsx` exporte ~150 composants ; le registre est
  en retard sur le barrel — voir dette ci-dessous.

## 2. Non livré / dette assumée

1. **~100 fiches composants statiques dupliquées** (`app/(app)/docs/components/<nom>/`).
   Elles violent la règle « zéro duplication » (descriptions recopiées à la
   main) mais portent des sandboxes interactives de valeur. Les supprimer dans
   cette passe aurait été destructif. Voie propre : enrichir le template
   `[slug]` (sandbox générique pilotée par le registre), puis supprimer les
   pages statiques par lots.
2. **Descriptions du registre FR uniquement.** En locale EN, les descriptions
   et catégories des composants restent en français (catalogue, cartes
   familles de l'accueil). Les traduire à la main côté site recréerait une
   duplication ; la voie propre est un champ `description_en` dans
   `bpm/_doc_components.py` + régénération.
3. **Registre (101) en retard sur le barrel (~150).** Les composants récents
   (`liveGauge`, `anomalyAlert`, `approvalFlow`…) manquent au catalogue.
   À corriger dans le générateur Python, pas côté site.
4. **Contenu démo de la galerie en FR** dans les deux locales (données de
   démonstration de la PR #12, conservées telles quelles — contrainte).
5. **Pages hors périmètre non touchées** : `/privacy`, `/terms` (sans nav site),
   `/docs/changelog`, tout le shell app (`/dashboard`, `/modules/*`).
6. **Metadata des pages docs** : seul l'accueil a des metadata localisées ;
   le JSON-LD global garde `inLanguage: "fr"`.

## 3. Auto-critique — où c'est le plus faible

- **Le hero de l'accueil est la partie la plus risquée du design.** Le panneau
  démo (metric + statusTracker + liveGauge) est un vrai différenciateur, mais
  son équilibre visuel dépend du rendu réel des composants à ces tailles ;
  sans passe visuelle dans un navigateur, c'est la section la plus susceptible
  de demander un ajustement (espacements internes, jauge centrée).
- **La section « familles du catalogue » de l'accueil est la plus générique** :
  une grille de compteurs par catégorie reste convenue. Une version plus forte
  montrerait un composant représentatif par famille.
- **Le hub `/docs` est correct mais mince** : six cartes, pas de hiérarchie
  visuelle entre l'essentiel (démarrage) et le secondaire (changelog).
- **La copy EN est une traduction fidèle plutôt qu'une copy native** ; un
  relecteur anglophone resserrerait probablement le hero
  (« Business interfaces, one function call at a time » est correct mais long).
- **La bascule FR/EN recharge les server components via `router.refresh()`** :
  sur les pages docs, le changement de langue n'est pas instantané hors ligne.
