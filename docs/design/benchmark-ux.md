# P1 — Benchmark / état de l'art : IA, shells & bilinguisme

> **Phase P1 — read-only.** Étude de sites de référence pour ancrer les décisions
> d'architecture (P2) sur des pratiques éprouvées, pas sur l'intuition. Chaque pattern
> est marqué **RETENU** / **ÉCARTÉ** avec un *pourquoi* rattaché à une référence.
> Le principe directeur B (split sémantique narratif/référence) **n'est pas rediscuté** ;
> le benchmark sert à en régler la *déclinaison*.

---

## 1. Sites étudiés & dimensions extraites

Quatre dimensions, alignées sur le brief :
- **(F)** Où passe la frontière **narratif ↔ référence** (et quel chrome de chaque côté) ?
- **(D)** Les **fiches de détail** partagent-elles le **shell du catalogue** ?
- **(L)** Bascule de **langue** : globale (header) ou par page ?
- **(S)** Comment la **double indexation** (même contenu, deux URL) est-elle évitée ?

| Site | F — frontière narratif/référence | D — fiche dans le shell catalogue ? | L — bascule langue | S — anti-double-indexation |
|---|---|---|---|---|
| **Stripe Docs** (`docs.stripe.com`) | Marketing `stripe.com` = narratif **sans** sidebar ; `docs.*` = référence **avec** sidebar produit (gauche) + « on this page » (droite) | **Oui** — chaque page produit/API vit sous la même sidebar | **Globale**, sélecteur région/langue dans le **header** du site docs | Locales par **préfixe de chemin** + `hreflang`, **un canonical par langue** ; pas deux URL pour un même contenu/langue |
| **Tailwind CSS** (`tailwindcss.com`) | Accueil = narratif **sans** sidebar ; `/docs/*` = référence **avec** sidebar persistante | **Oui** — guides **et** référence d'utilitaires sous la **même** sidebar | Monolingue (EN) → non applicable | Monolingue + **un seul** chemin par page → unicité triviale |
| **Radix UI** (`radix-ui.com`) | Home/marketing = narratif **sans** sidebar ; `/primitives/docs/*` = référence **avec** sidebar | **Oui** — `…/components/accordion` partage la sidebar de la liste | Monolingue (EN) | Monolingue ; pas de montage du même catalogue à deux chemins |
| **shadcn/ui** (`ui.shadcn.com`) | Landing = narratif **sans** sidebar ; `/docs/*` (dont `/docs/components/*`) = **avec** sidebar | **Oui** — liste **et** fiche composant sous la même sidebar | Monolingue (EN) | Monolingue ; un chemin par composant |
| **MUI / Material UI** (`mui.com`) | `mui.com` marketing = narratif ; `/material-ui/*` (composants + API) = référence **avec** sidebar gauche persistante | **Oui** — page démo **et** page API du composant dans le même shell | Quasi-monolingue (EN) | Un chemin canonique par page ; pages « components » vs « API » distinctes (contenus différents, pas doublon) |
| **Astro Starlight** (docs multilingue, `starlight.astro.build`) | Toute la doc = référence **avec** sidebar ; pages d'accueil par langue possibles | **Oui** — tout vit dans le shell doc | **Globale** : *language picker* dans le header ; **locales par préfixe de chemin** (`/fr/…`, `/en/…`) ; **même nom de fichier** associe les pages entre langues | **`hreflang` auto** + **fallback** vers `defaultLocale` si traduction absente → jamais deux URL concurrentes pour la **même** langue |

Observation transversale : **aucune** de ces références ne fait *éjecter* l'utilisateur
hors du shell de référence en cliquant une fiche. Le chrome est **stable** à l'intérieur
d'un domaine (référence) ; la frontière narratif/référence se franchit en **entrant** dans
la doc, jamais *au sein* d'un parcours catalogue→fiche.

---

## 2. Tableau de décision — patterns RETENUS

| # | Pattern | Référence(s) | Décision pour BPM (B) |
|---|---|---|---|
| R1 | **Frontière narratif/référence = entrée dans la référence**, pas un saut interne. Le narratif (accueil, présentation) est *sans* sidebar ; la référence (catalogue + fiches) est *avec* sidebar. | Tailwind `/docs`, Radix, shadcn, Stripe | **Cœur de B.** Home/présentation/mcp/resources/docs-narratif → shell vitrine. Composants/Modules/Connecteurs/Sandbox → shell App (sidebar). |
| R2 | **La fiche partage le shell de son catalogue.** Liste et détail vivent sous la même sidebar ; le chrome ne change jamais entre carte et fiche. | shadcn `/docs/components/*`, Radix, Stripe, MUI | **Corrige le symptôme nº1.** Les fiches composants doivent vivre dans le **même** shell que le catalogue qui les liste ; la cible des cartes doit être **relative au shell** courant. |
| R3 | **Bascule de langue GLOBALE dans le header**, persistante sur tout le site. | Stripe (header région/langue), Starlight (language picker header) | **« Bascule partout ».** Conserver la bascule FR/EN dans les **deux** chrome (vitrine + App), comme aujourd'hui ; l'étendre aux surfaces qui en manquent (sandbox/demo). |
| R4 | **Parité de contenu garantie par construction**, avec fallback explicite si une traduction manque. | Starlight (fallback `defaultLocale`) | BPM impose déjà la parité **au type** (`Dictionary = typeof fr` casse la compilation si une clé EN manque). On **garde** ce mécanisme ; à défaut de traduction d'une *valeur*, la clé FR sert de fallback visible. |
| R5 | **Un seul canonical par contenu/langue** ; les variantes pointent vers le canonical. | Stripe (`hreflang` + canonical/langue), Starlight | **Corrige B/C/G.** Un **unique** canonical pour la référence Composants ; toute autre URL exposant le même catalogue est dédupliquée (canonical → la référence, ou `noindex`). |
| R6 | **Bilinguisme par dictionnaire, pas par duplication d'arbre de fichiers**, quand le rendu est applicatif (React) plutôt que contenu Markdown statique. | Stripe (champs traduits), BPM existant | **On garde** `lib/i18n` partagé + `strings.ts` locaux. On **n'introduit pas** d'arbres `/fr/…` `/en/…` parallèles (lourd pour une app React, justifié seulement pour de la doc-contenu type Starlight). |
| R7 | **Sidebar persistante + repère « page courante »** (état actif) ; collapse optionnel. | shadcn (SidebarProvider/collapsible), Stripe | **Déjà présent** (`Sidebar` avec `aria-current`/actif, collapse). À **étendre** : ajouter l'entrée Connecteurs au même niveau que Composants/Modules. |

---

## 3. Tableau de décision — patterns ÉCARTÉS

| # | Pattern écarté | Référence | Pourquoi écarté pour BPM |
|---|---|---|---|
| E1 | **Locales par préfixe de chemin** (`/fr/composants`, `/en/components`) avec arbre de fichiers dupliqué. | Starlight, Astro i18n routing | BPM est une **app React** dont les libellés viennent de dictionnaires/`strings.ts`, pas de fichiers de contenu par langue. Dupliquer l'arbre de routes multiplierait 112 fiches × 30 modules par 2 et casserait la réutilisation de `ComponentsCatalogue`. La bascule **par cookie `bpm-locale`** (existante) couvre le besoin sans explosion de routes. *Conséquence assumée :* pas d'URL distincte par langue → on s'appuie sur le cookie + `<html lang>` dynamique, pas sur `hreflang`. |
| E2 | **Deux URL indexables pour le même catalogue** (`/components` *et* `/docs/components`). | (anti-pattern observé **dans BPM**, absent des références) | Aucune référence n'expose deux fois le même catalogue indexable. À **supprimer** (R5) : un seul point canonique. |
| E3 | **Sélecteur de langue par page** (au lieu de global). | (anti-pattern) | Aucune référence ne le fait ; rompt la continuité. La bascule reste **dans le chrome** (header), valable pour toute la surface. |
| E4 | **Catalogue de référence sans sidebar** (référence traitée comme du narratif). | (anti-pattern vs Tailwind/Radix/shadcn) | Contredit B et l'état de l'art : une *référence* navigable veut une sidebar persistante. Donc la référence Composants doit **gagner** la sidebar (shell App), pas rester en vitrine nue. |
| E5 | **Marketing et référence dans le même chrome** (tout avec sidebar, ou tout sans). | (anti-pattern vs Stripe/Tailwind) | B est précisément le split ; mélanger nuit à la lisibilité du parcours (le narratif doit respirer sans sidebar). |
| E6 | **Domaine/sous-domaine séparé pour la référence** (`docs.*` distinct du marketing). | Stripe (`stripe.com` vs `docs.stripe.com`) | **Tentant mais hors périmètre** : BPM sert tout depuis une seule origine Next (nginx+pm2) et le déploiement est gelé. On reproduit le bénéfice (split de chrome) **par groupes de routes**, pas par sous-domaine. *Référence notée, déclinaison adaptée.* |

---

## 4. Implications directes pour P2 (à valider au GATE)

1. **Référence Composants = shell App** (R1/R4 état de l'art) : le catalogue *et* les fiches
   sous sidebar. La cible des cartes devient **relative au shell** (R2) → fin de l'éjection.
   ⇒ tension à trancher : que deviennent `/docs/components` et `/components` côté vitrine
   (redirection/canonical vers la référence, ou conservation d'une entrée narrative « voir
   les composants » qui *pointe* vers la référence) ? **Question de conception P2.**
2. **Un seul canonical Composants** (R5/E2) + origine canonique unique (corrige G).
3. **Connecteurs = 3ᵉ pilier de référence** au même rang que Composants/Modules (R7), dans
   le shell App — mais **la surface n'existe pas sur master** (cf. P0 §5) et créer des
   descripteurs est **hors scope**. ⇒ **arbitrage GATE** : récupérer `connecteurs-surface`
   (branche non mergée) vs livrer une entrée de nav pointant vers l'existant.
4. **Bascule FR/EN partout** (R3) : combler sandbox/demo (chaînes en dur) ; garder le
   dictionnaire partagé + `strings.ts` (R6, E1 écarté).
5. **Pas d'arbre de routes par langue** (E1) : on reste sur cookie `bpm-locale`.

---

## 5. Sources

- Stripe Documentation & localisation — https://docs.stripe.com/localization ;
  Stripe Docs (architecture sidebar + sélecteur région/langue header) — https://docs.stripe.com/
- Tailwind CSS Docs (sidebar persistante `/docs`) — https://tailwindcss.com/docs
- Radix UI Primitives Docs — https://www.radix-ui.com/primitives/docs
- shadcn/ui — Sidebar & docs — https://ui.shadcn.com/docs/components/sidebar
- MUI / Material UI Docs — https://mui.com/material-ui/
- Astro Starlight — Internationalization (i18n) — https://starlight.astro.build/guides/i18n/ ;
  Astro i18n routing — https://docs.astro.build/en/guides/internationalization/
