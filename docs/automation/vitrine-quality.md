# Grille de convergence — Vitrine publique Blueprint Modular

Boucle de raffinage de la vitrine publique (`app/(public)/(site)/` + pages légales
+ chrome `components/site/`). Statuts : 🔴 rouge (écart bloquant) · 🟠 orange
(partiel / à améliorer) · 🟢 vert (critère atteint, mesuré).

Mesures **empiriques** : `npm run build` (vert obligatoire), grep texte en dur,
diff clés FR/EN, analyse des points de rupture CSS, vérification des routes.

Périmètre « vitrine » = accueil, `/components`, `/mcp`, `/resources`, `/privacy`,
`/terms`, `/legal` + nav/footer. Les pages `app/(app)/` (`/docs`, `/modules`) sont
hors périmètre cœur (shell applicatif distinct) mais ne doivent pas régresser.

---

## Passe 1 — Audit initial (baseline empirique)

Légende colonnes : Axe · Critère · Statut · Note (preuve).

### Axe 1 — Comparaison aux pairs (Streamlit, Gradio, Reflex…)
| Critère | Statut | Note |
|---|---|---|
| Accroche code→UI + snippet en hero | 🟢 | `Hero.tsx` : panneau code sombre `app.py` → rendu réel des composants bpm. |
| Galerie / démos live | 🟢 | `/components` monte 101 composants réels en direct. |
| Doc & référence API | 🟢 | `/resources` + `/docs` + llms.txt (référence machine). |
| Histoire de déploiement | 🟠 | Étapes install (`GetStarted`) ; pas de récit « déployer en prod » dédié. |
| Templates / showcase | 🟠 | Showcase composants OK ; pas de templates d'apps clés-en-main. |
| Angle agents/IA (MCP = différenciateur) | 🟢 | `/mcp` complet + teaser home + connecteur public. |
| Communauté / GitHub / PyPI | 🟠 | PyPI dans footer ; **pas de lien GitHub** ni section communauté. |
| Intention commerciale claire | 🟠 | CTAs présents ; offre (open-source/entreprise/contact) implicite, pas explicitée. |
| Ressources / blog | 🟢 | `/resources` agrège tout (blog optionnel, non requis). |

### Axe 2 — Pédagogique
| Critère | Statut | Note |
|---|---|---|
| Qu'est-ce que bpm, pour qui, pourquoi | 🟢 | Hero + `ValueProps` + `WhyBpm` sans jargon. |
| Modèle mental Python→composants→UI | 🟢 | Snippet hero + section `codeDemo`. |
| Démarrage pas-à-pas (install→1re app) | 🟢 | `GetStarted` 3 étapes + `/docs/getting-started`. |
| Exemples / cas d'usage concrets | 🟢 | Showcase + modules métier. |
| Liens tutoriels (/docs, /resources) | 🟢 | Nav + footer + teasers. |

### Axe 3 — Légal
| Critère | Statut | Note |
|---|---|---|
| Mentions légales / éditeur | 🔴 | **Absent** : aucune page éditeur/mentions légales. |
| /privacy | 🟠 | Existe mais **FR uniquement, hors shell** (pas de nav/footer/switch). |
| /terms | 🔴 | **Stub vide** « Contenu à compléter », lien mort vers `/login`. |
| Licence de @blueprint-modular/core | 🔴 | Apache-2.0 dans le package, **non exposée** sur le site. |
| RGPD / cookies | 🟠 | Privacy dit « aucun cookie » mais pas de mention RGPD/cookies dédiée et claire. |
| Pages légales en parité FR/EN | 🔴 | Textes en dur FR, **aucune version EN**. |

### Axe 4 — Commercial
| Critère | Statut | Note |
|---|---|---|
| Proposition de valeur + bénéfices | 🟢 | Hero + `ValueProps`. |
| CTAs clairs (démarrer, démo, app, contact) | 🟠 | Démarrer/Voir composants/Ouvrir l'app OK ; **pas de CTA contact**. |
| Différenciateurs (MCP, 1 codebase Python, 101 composants) | 🟢 | Mis en avant (compteurs réels depuis le registre). |
| Preuve (catalogue réel, démo live) | 🟢 | 101 composants montés en direct. |
| Intention d'offre explicite | 🔴 | Open-source ? entreprise ? contact ? **non dit**. |

### Axe 5 — Technique
| Critère | Statut | Note |
|---|---|---|
| Catalogue 101 + galerie | 🟢 | `registry.components.length` = compteur réel. |
| API/usage bpm avec code réel | 🟢 | Snippets hero/mcp réels. |
| MCP (/mcp, endpoint, 4 outils) | 🟢 | Page `/mcp` complète. |
| Doc / référence, modules | 🟢 | `/resources`, llms.txt, `/docs`. |
| Install / exécution + prérequis | 🟢 | `GetStarted` + FAQ (DB/env). |

### Axe 6 — Responsive (priorité)
| Critère | Statut | Note |
|---|---|---|
| Aucun débordement horizontal | 🟠 | Grilles auto-fit OK ; nav links en `overflow-x:auto` (scroll horizontal). |
| Pas de texte / carte coupé | 🟢 | Cartes `minmax()` + `1fr` qui s'effondrent. |
| Grilles auto-fit qui s'effondrent | 🟢 | `@media 900/640` : points/steps/split/footer → 1 col. |
| Nav mobile (burger) fonctionnelle | 🔴 | **Pas de burger** : liens scrollent horizontalement, CTA app caché < 640px. |
| Cibles tactiles ≥ 44px | 🟠 | Liens nav ~30px de haut (`padding:6px 10px`), locale btn ~26px. |
| Tableaux scrollables si besoin | 🟠 | `.component-showcase` ; à confirmer sur `/components`. |
| Hero / showcase / footer corrects mobile | 🟢 | Vérifié via points de rupture. |

### Axe 7 — Bilingue FR/EN
| Critère | Statut | Note |
|---|---|---|
| Chaque texte FR ET EN dans le dict | 🟢 | 295 clés FR = 295 clés EN, diff vide. |
| Aucun texte en dur (vitrine) | 🟠 | Vitrine `(site)` propre ; **légales en dur** ; `/components` = données de démo FR (décision). |
| Bascule langue OK sur toutes les pages | 🔴 | KO sur légales (hors shell, pas de switch). |
| generateMetadata localisé + OG locale | 🟢 | Home/mcp/resources : `generateMetadata` localisé, OG locale. |
| alternates / hreflang par locale | 🟠 | Locale par cookie → 1 URL/page ; hreflang non applicable tel quel (à documenter). |
| Pas de mélange de langues dans une vue | 🟢 | Une vue = une locale (dict). |

---

## Synthèse passe 1
- **Build** : 🟢 vert (exit 0, Next 16.1.6).
- **Rouge** : mentions légales absentes ; `/terms` vide + lien mort ; licence non exposée ;
  pages légales non bilingues ; bascule langue KO sur légales ; pas de burger mobile ;
  intention d'offre non explicite.
- **Orange** : cibles tactiles nav, lien GitHub/communauté, CTA contact, hreflang à documenter,
  histoire déploiement/templates, tableaux scrollables à confirmer.

Cibles des passes suivantes : Axe 3 (légal) + Axe 7 (bascule légales) → passe 2 ;
Axe 6 (burger + tactile) → passe 3 ; Axe 1/4 (commercial/pairs) + sitemap/robots → passe 4.

---

## Passe 2 — Corrections (légal, responsive mobile, commercial) + re-mesure

Changements appliqués puis **mesurés empiriquement** (`npm run build` exit 0,
`next start` + `curl`, diff clés FR/EN).

### Avant → Après par axe (deltas)
| Axe · Critère | Avant | Après | Preuve empirique |
|---|---|---|---|
| Légal · Mentions légales / éditeur | 🔴 | 🟢 | `/legal` 200 ; rend « Mentions légales / Éditeur du site / Licence du package ». |
| Légal · /privacy bilingue + shell | 🟠 | 🟢 | `/privacy` 200 dans le shell ; FR « RGPD et vos droits », EN « GDPR and your rights ». |
| Légal · /terms complet | 🔴 | 🟢 | `/terms` 200 ; FR « Limitation de responsabilité », EN « Limitation of liability » (plus de stub). |
| Légal · Licence Apache-2.0 exposée | 🔴 | 🟢 | Présente sur `/legal` et `/terms`. |
| Légal · RGPD / cookies | 🟠 | 🟢 | Section cookies dédiée (cookie technique `bpm-locale`) + section RGPD. |
| Légal · Parité FR/EN légales | 🔴 | 🟢 | Rendu FR par défaut, EN via cookie `bpm-locale=en`. |
| Bilingue · Bascule sur toutes les pages | 🔴 | 🟢 | Pages légales = server components `getDict()` re-rendues par `router.refresh()`. |
| Bilingue · Chaque texte FR ET EN | 🟢 | 🟢 | 341 clés FR = 341 clés EN, diff vide. |
| Responsive · Nav mobile (burger) | 🔴 | 🟢 | Markup `site-nav-burger` + `site-mobile-menu` présent ; CSS burger < 768px, nav inline ≥ 768px. |
| Responsive · Cibles tactiles ≥ 44px | 🟠 | 🟢 | Burger 44×44 ; `.site-locale-btn` min-height 44px < 768px ; liens mobile 52px. |
| Responsive · Aucun débordement horizontal | 🟠 | 🟢 | Liens nav repliés dans le panneau (plus de scroll horizontal sous 768px). |
| Commercial · CTA contact | 🟠 | 🟢 | `mailto:contact@blueprint-modular.com` dans le CTA final. |
| Commercial · Intention d'offre explicite | 🔴 | 🟢 | Ligne « Open-source Apache-2.0 — gratuit, sans verrou… besoin entreprise ? Écrivez-nous. ». |
| Pairs · Intention commerciale claire | 🟠 | 🟢 | idem ci-dessus. |
| Technique · SEO sitemap | n/a | 🟢 | `/legal`, `/privacy`, `/terms` ajoutés à `app/sitemap.ts`. |

### Mesures empiriques passe 2
- **Build** : 🟢 `✓ Compiled successfully` + `Generating static pages (26/26)`, exit 0.
- **Routes** (curl) : `/`, `/components`, `/mcp`, `/resources`, `/legal`, `/privacy`,
  `/terms`, `/docs`, `/modules` → **tous 200**, aucun 404.
- **i18n** : `<html lang="en">` sous cookie EN ; nav/footer/CTA en anglais, aucune fuite FR.
- **Parité clés** : FR 341 = EN 341, diff vide.

---

## Résiduel pour décision humaine (non-vert assumé)

1. **Identifiants légaux réels** 🟠 — `/legal` est complet et crédible mais ne contient pas
   la raison sociale, le SIRET, l'hébergeur nommé ni le directeur de publication nominatif
   (données non disponibles côté code, à ne pas inventer). À compléter par l'opérateur avant
   lancement commercial. Le contenu actuel reste honnête (projet open-source + contact).
2. **hreflang / alternates par locale** 🟠 — la locale est portée par cookie (`bpm-locale`),
   donc une seule URL par page : un `hreflang` distinct par langue n'est pas applicable en
   l'état. `generateMetadata` est localisé (titre, description, `og:locale`). Décision :
   conserver le modèle cookie OU migrer vers des routes `/fr` `/en` (refonte structurelle).
3. **Lien GitHub / communauté** 🟠 — PyPI est lié ; aucun lien dépôt public n'est ajouté car
   l'URL publique n'est pas confirmée (dépôt potentiellement privé). À ajouter par l'humain
   si un dépôt public existe.
4. **`/components` — données de démo en dur (FR)** 🟠 — décision assumée : la galerie est une
   démo technique qui monte 101 composants réels avec des **données d'exemple** illustratives
   (« Alice », « 142 500 € », libellés de variantes). Le chrome de la page (titre, captions,
   noms de sections) est i18n ; le contenu d'échantillon reste en FR comme une donnée de
   démonstration. Traduire chaque échantillon = gros effort / faible valeur.
5. **Histoire de déploiement / templates d'apps** 🟠 — parité « pairs » : pas de récit dédié
   « déployer en prod » ni de galerie de templates clés-en-main. Couvert partiellement par
   `GetStarted` + FAQ (prérequis DB/env). Amélioration produit possible.

Tout le reste des axes 2 (pédagogique), 5 (technique) et le cœur des axes 1/4/6/7 est **vert**
et mesuré. Build vert à chaque passe ; aucun lien interne 404 ; compteurs toujours dérivés du
registre (101) ; vrais composants bpm et tokens `--bpm-*` préservés.

---

## Passe 3 — Responsive `/components` (anti-débordement) + re-mesure

| Axe · Critère | Avant | Après | Preuve |
|---|---|---|---|
| Responsive · Tableaux scrollables | 🟠 | 🟢 | `.bpm-table-wrapper { overflow-x: auto }` déjà en place (vérifié), tables défilent. |
| Responsive · Aucun débordement / carte coupée (`/components`) | 🟠 | 🟢 | `DEMO_CARD_STYLE` : `minWidth:0` + `overflow-x:auto` → graphiques/médias 400px défilent dans leur carte ; `.site-shell main { overflow-x: clip }` en garde-fou (préserve sticky). Démos non modifiées. |

Build passe 3 : 🟢 `✓ Compiled successfully` + `Generating static pages (26/26)`, exit 0.

Bilan final : **tous les critères des 7 axes sont 🟢** sauf les 5 points de résiduel humain
ci-dessus (identifiants légaux réels, hreflang vs cookie, lien GitHub, données de démo FR de
`/components`, histoire déploiement/templates) — chacun relève d'une décision humaine ou d'une
donnée non disponible côté code, pas d'un défaut d'implémentation.
