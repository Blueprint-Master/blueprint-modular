# Rapport — Push commercial Modular (2026-06-11)

> Routine nocturne « site vendable + MCP fonctionnel ». Branche
> `claude/modular-commercial-push-ysti5d`, base `master`. Tout est développé
> (pas d'audit), chaque incrément passe `npm run build` **et** un smoke
> fonctionnel (`next start` + curl + assertions DOM) avant d'être marqué *done*.

## 1. Storefront (P0) — fait et vérifié

| Item | État | Vérif smoke |
| --- | --- | --- |
| Page `/mcp` intégrée au shell du site | ✅ done | 200 FR/EN, marqueurs `list_components`/`suggest_composition`/endpoint, `/api/mcp tools/list` renvoie les 4 outils, `get_component(metric)` OK |
| Page `/resources` (doc + guides + API + MCP) | ✅ done | 200 FR/EN, cartes rendues, liens `/llms-core.txt`, `/mcp` présents |
| SiteNav / SiteFooter enrichis | ✅ done | Nav : Composants · Modules · Documentation · Ressources · MCP ; Footer : Modules, hub Ressources, Connecteur MCP, llms-core.txt |
| i18n FR/EN des nouvelles pages | ✅ done | Bascule vérifiée (FR « Lecture seule » / EN « Read-only » ; titres `/resources`) |
| Doc composants régénérée | ✅ done | `generate-bpm-components-json.py` (101), `generate-llms-txt.py` (160), `generate-mcp-registry.mjs` ; **mcp-registry.json était désynchronisé** du `llms.txt` committé → resynchronisé |
| Sitemap (`/components`, `/resources`, `/mcp`) | ✅ done | `/sitemap.xml` 200, routes ajoutées |

### Détails

- **`/mcp`** : déplacée de `app/mcp/page.tsx` (hors shell, sans nav/footer) vers
  `app/(public)/(site)/mcp/page.tsx`. Server component avec `generateMetadata`
  localisée, i18n FR/EN, composition réelle `bpm.badge` + `bpm.codeBlock`,
  compteur `TOTAL` lu depuis le registre. Sections : endpoint, 4 outils
  read-only, catégories, ajout Claude/ChatGPT, test local, contact.
- **`/resources`** : nouvelle page, 4 groupes (Documentation · Guides & modules ·
  Référence machine · Connecteur MCP). **Liens vérifiés** : toutes les cibles
  internes pointent vers des routes existantes (`/docs`, `/docs/getting-started`,
  `/docs/components`, `/docs/changelog`, `/components`, `/modules`, `/mcp`) ;
  les cibles externes (`/llms.txt`, `/llms-core.txt`, PyPI, `docs/DATABASE.md`
  sur GitHub) sont explicitement marquées « Externe ».

### Écart de source assumé

Le brief mentionnait l'endpoint `https://mcp.blueprint-modular.com/api/mcp`.
Cette forme **n'existe nulle part dans le code** (registry, route, docs, README,
SUBMISSION utilisent tous `https://blueprint-modular.com/api/mcp`). Conformément
à l'invariant « vérité = source », la page expose l'endpoint réel
`https://blueprint-modular.com/api/mcp`. À trancher côté infra si un sous-domaine
`mcp.` doit être ajouté.

## 2. Modules (P1) — triage des 32 modules

Méthode : smoke HTTP de chaque route (`page` / `documentation` / `simulateur`)
puis inspection de la composition `bpm.*` et des marqueurs de stub. **Aucune
route ne renvoie 500** ; tous les modules rendent une UI réelle.

### Développé + vérifié cette nuit

| Module | Avant | Après |
| --- | --- | --- |
| **veille** | Seul **stub** réel : « L'interface détaillée sera enrichie dans une prochaine version », 0 composant `bpm.*`, aucune UI | Page à onglets Documentation + **Simulateur interactif** composant `bpm.metricRow`, `bpm.table` (statut rendu par `bpm.badge`), `bpm.anomalyAlert`, `bpm.activityFeed`, formulaire `bpm.input`+`bpm.selectbox`+`bpm.button` qui **ajoute réellement une source** (état React câblé). Doc nettoyée, entrée d'index réactivée. Build vert, 200, doc rendue, stub supprimé. |

### Déjà au standard (rendent une UI réelle, composent `bpm.*`, doc + simulateur)

Les 31 autres modules respectent déjà le barème. Deux niveaux de richesse :

- **Riches** (UI complète, données câblées) : `contracts` (1393 l.), `wiki`,
  `asset-manager` (parc multi-domaines), `calendrier` (agenda 807 l.),
  `commentaires`, `skeleton`, `tableau-blanc`, `templates`, `notification`,
  `newsletter`, `documents`, `keep-screen-on`, `monitor`, `taches`, `auth`,
  `workflow`, `ia`.
- **Simulateurs légers mais réels** (Panel + champs `bpm.*` + données démo) :
  `rapports`, `catalogue-produits`, `devis-facturation`, `export-planifie`,
  `multi-langue`, `formulaire-dynamique`, `connecteurs`, `reservation-creneaux`,
  `notifications-ciblees`, `webhooks`, `themes`, `audit-log`, `referentiels`,
  `tableaux-de-bord`.

### Gaté « bientôt » / needs-human

**Aucun.** Le seul module qui aurait été gaté (`veille`) a été développé.

## 3. Vérifications globales

- `npm run build` : **vert** (Next 16.1.6, Turbopack).
- Smoke fonctionnel (`next start` + curl) : **tout vert** en FR et EN sur
  `/`, `/components`, `/modules`, `/resources`, `/mcp`, `/docs`,
  `/docs/getting-started`, `/docs/components`, `/modules/veille`.
- Connecteur MCP en direct : `tools/list` (4 outils) et
  `tools/call get_component(metric)` répondent ; `/api/health` 200 (gate déploiement #19).

## 4. Effort résiduel / dette assumée

1. **Descriptions du registre FR uniquement** (dette pré-existante) : en locale
   EN, noms/catégories des composants restent en français. Voie propre :
   `description_en` dans `bpm/_doc_components.py` + régénération.
2. **Simulateurs légers** (14 modules) : fonctionnels mais minimalistes ; on
   pourrait les enrichir en données et interactions à la `veille`.
3. **Endpoint MCP sous-domaine** : décision infra (cf. §1).
4. **Smoke des onglets Simulateur** : `bpm.tabs` ne rend que l'onglet actif ;
   le contenu simulateur est monté côté client au clic. La vérification couvre
   le build typé + route 200 + onglet Documentation ; un smoke navigateur
   (Playwright) confirmerait le rendu au clic — non disponible dans cet env.
