# Audit read-only — Blueprint Modular — état au 16/06/2026

> **Nature** : audit factuel, **read-only**. Aucune modification de code, aucun
> commit/push/merge n'a été effectué dans le cadre de cet audit (hors la création
> de ce rapport). Sources : état du dépôt (branche audit alignée sur `origin/master`
> `7e65867`, #139) + API GitHub (PRs). L'état **réellement déployé sur bpm-prod**
> n'est **pas** vérifiable depuis le dépôt (aucun manifeste de déploiement committé) ;
> les constats « déployé » sont des inférences signalées comme telles.

---

## Synthèse exécutive

| Bloc | Sujet | Verdict |
|------|-------|---------|
| 1 | PRs ouvertes | **1 seule PR ouverte (#140)** — mergeable, CI verte, bloquée par gate humain |
| 2 | Déploiement vs main | `origin/master` HEAD = `7e65867` (#139). Tout #105→#139 mergé ; déploiement prod **non vérifiable depuis le repo** |
| 3 | Roadmap D1–D4 | **D1, D2, D3, D4 : tous présents dans le code et mergés** |
| 4 | Connecteurs (#97→#101) | Cascade **entièrement mergée** ; **4 connecteurs** réels ; surface `/connecteurs` opérationnelle |
| 5 | Sandbox Maker (proxy) | Proxy `spark-preview` mergé (#94), CORS `app.` corrigé (#126), **UI câblée** au proxy |

**Lecture d'ensemble** : la roadmap commerciale D1–D4 + pilier Connecteurs + sandbox IA
est **intégralement présente sur `master`**. L'écart résiduel n'est pas un écart de
code mais un **écart de déploiement/validation** : la quasi-totalité des PRs portent un
gate humain explicite « ⚠️ ne pas merger / ne pas déployer sans validation », et l'état
réel de bpm-prod n'est pas traçable depuis le dépôt.

---

## BLOC 1 — PRs ouvertes (convergence)

**Une seule PR ouverte :**

| PR | Titre | Branche | CI | Mergeable | Auteur |
|----|-------|---------|----|-----------|--------|
| **#140** | `fix(home)` : métadonnées SEO/OG alignées sur le hero + accord « N composants » (i18n) | `claude/modular-meta-and-plural-coherence-9kqf2o` | ✅ `npm run gate` **success** (19:09 UTC) | ✅ `mergeable_state: clean` | remigit55 |

- **Diff** : 4 fichiers, +27/−8 (2 commits). Modifie les meta de la home + ajoute un
  helper `plural()` dans `lib/i18n`. Ne touche **pas** `suggest_composition` ni le serveur MCP.
- **Dépendances / cascade** : **aucune**. PR autonome, basée sur `master` `7e65867` (#139, le hero qu'elle complète, déjà mergé).
- **Blocage** : uniquement le **gate humain** (« ⚠️ ne pas merger, ne pas déployer sans validation » dans le corps). Techniquement mergeable immédiatement.

**Tri** : `bloquante` : aucune · `mergeable maintenant` : **#140** · `conflit` : aucune.

> Les cascades de dépendances mentionnées dans la mission (#97→#101 connecteurs,
> #132→#133→#134 galerie, #94/#126 sandbox) sont **toutes déjà résolues et mergées** —
> voir blocs 3/4/5.

---

## BLOC 2 — Déploiement prod vs code main

### Tête de `master`
`origin/master` HEAD = **`7e65867`** — `feat(home): hero différenciateur IA + lien /built-for-ai…` (**#139**, 2026-06-16).

> ⚠️ **Piège** : la ref locale `master` était **périmée** (pointait sur `c2a7de7` / #104,
> 2026-06-14). La branche d'audit reflète l'état courant d'`origin/master` (#139). Toute
> lecture de `git log master` en local sans `fetch` préalable est trompeuse.

### 20 derniers commits de `master` (du plus récent)
`#139` hero IA · `#138` mobile burger align · `#137` source unique de version · `#136`
MCP suggest_composition sémantique · `#135` sections grises bordées + placeholder galerie ·
`#134` galerie publique + chaîne prompt→spec→app · `#132` contrat endpoint galerie ·
`#131` built-for-ai MCP showcase · `#130` playground props live · `#129` logo data-URI ·
`#128` refonte layout Sandbox · `#127` manifeste · `#126` CORS sandbox `app.` ·
`#125`/`#124`/`#123` UX/layout · `#122` diag spark-preview · `#121` page /manifeste ·
`#120` asset-manager hub · `#119` doc MCP sous-domaine.

### Déploiement
- **Mécanisme** : `deploy/deploy-from-git.sh` (PM2 `blueprint-app`, port 3000, fail-closed,
  health-check `/api/health`, rebuild `@blueprint-modular/core` **avant** l'app). Pas de
  `pm2 restart` seul (conforme CLAUDE.md).
- **Version applicative** : `package.json` app = **`0.1.60`** ; source unique `lib/generated/versions.json` (dérivée au build), exposée via `lib/version.ts` (`APP_VERSION/PYTHON_VERSION/CORE_VERSION`).
- **`git diff HEAD~1 HEAD`** (#139) : `app/(public)/(site)/_home/Hero.tsx`, `lib/i18n/en.ts`, `lib/i18n/fr.ts` (+10/−5) — hero + libellés i18n.

### Mergé sur main mais potentiellement non déployé
**Indéterminable depuis le dépôt** : `deploy-from-git.sh` fait un `git pull` au moment de
son exécution et n'écrit **aucun marqueur de SHA déployé** dans le repo. Le dernier
déploiement connu n'est donc pas horodaté côté code. **Fait objectif** : tout le travail
D1–D4 + connecteurs + sandbox (#94→#139) est sur `master` ; **chaque PR porte un gate
« ne pas déployer sans validation »**, ce qui suggère que les merges précèdent un
déploiement contrôlé groupé. **Recommandation** : ajouter un marqueur de SHA déployé
(fichier ou tag `deployed/*`) pour rendre l'écart main↔prod auditable.

---

## BLOC 3 — Fonctionnalités D1–D4 (roadmap commerciale)

### D1 — Galerie apps (carrousel) ✅ présent (mergé #132→#134)
- **Route** : `/galerie` — `app/(public)/(site)/galerie/page.tsx` (carrousel `AppsCarousel.tsx`, cartes cliquables → détail).
- **Endpoint Maker** : `lib/gallery/curated.ts` lit **`MAKER_GALLERY_URL`** + **`INTERNAL_API_SECRET`** ; mode **fixture** via `GALLERY_USE_FIXTURE` (jamais en prod). Fallback galerie vide si endpoint absent.
- **API interne** : `GET /api/gallery` — n'expose que `{id, title, prompt, screenshotUrl, createdAt, appSpec}` (cache `s-maxage=300`).
- Variables documentées dans `.env.example` (L42–48).

### D2 — Chaîne prompt→AppSpec→app ✅ présent (mergé #133, via #134)
- **Composant** : `GenerationChain` — `app/(public)/(site)/galerie/[id]/GenerationChain.tsx`.
- **3 étapes** : (1) prompt langage naturel, (2) structure AppSpec (entités/modules/KPIs rendus en `bpm.*` — Card/Table/Badge/Chip, **jamais de JSON brut**), (3) capture.
- Dégradation propre : si `appSpec` est `null` → 2 étapes (prompt + capture), pas de section vide.
- Défense en profondeur : `sanitizeAppSpec()` (`lib/gallery/curated.ts`) — validation clé par clé, aucune fuite de donnée sensible.

### D3 — Playground live par composant ✅ présent (mergé #130)
- **Route** : `/playground` — `app/(app)/playground/page.tsx` + îlot client `components/site/Playground.tsx`.
- **Édition live réelle** : `useState` par prop → re-render immédiat, isolé par `ErrorBoundary`. Contrôles générés depuis `public/llms.txt` (`lib/playgroundProps.ts`) — `boolean→toggle`, énumération→`select`, `number→numérique`, etc. **Aucune liste de props codée en dur.**
- Double surface de snippets **React + Python** reflétant les props courantes. UI 100 % `bpm.*`. CTA d'accès depuis le hero `/composants`.

> Distinction importante : `/playground` (D3, éditeur de props) ≠ `/sandbox` (générateur IA, bloc 5). Ce sont **deux surfaces distinctes**.

### D4 — Page « Built for AI » / MCP ✅ présent (mergé #131, lien nav #139)
- **Routes** : `/built-for-ai` (`app/(public)/(site)/built-for-ai/page.tsx`) **et** `/mcp` (`app/(public)/(site)/mcp/page.tsx`).
- **Nav** (`components/site/SiteNav.tsx`) — 7 liens : `/presentation`, `/manifeste`, `/galerie` (apps), `/mcp`, `/built-for-ai` (FR « Conçu pour l'IA », ajouté en #139), `/resources`, `/docs` (+ switcher de langue + CTA « Ouvrir l'app »).

---

## BLOC 4 — Connecteurs (cascade #97→#101)

**Cascade entièrement mergée** (tous sur `master`, mergés le 13/06) :

| PR | Rôle | Statut |
|----|------|--------|
| **#97** | Schéma `ConnectorDescriptor` + garde CI anti-secret | ✅ mergé |
| #98 | Catalogue + 1er connecteur (REST générique, apiKey) | ✅ mergé (base de #99/#101) |
| **#99** | +3 connecteurs (oauth2, webhookSecret, bearer) | ✅ mergé |
| **#101** | Surface vitrine `/connecteurs` (liste + fiche, FR/EN) | ✅ mergé |

- **Schéma** : `lib/connectors/types.ts` (`ConnectorDescriptor`, `CredentialField` = **clé**, jamais valeur), `schema.ts` (zod `.strict()`, refuse tout secret en dur), `mapping.ts` (`applyResponseMapping` pur), `vault.ts` (`showcaseVault` qui **lève**). Garde CI `scripts/check-connector-secrets.mjs` + étapes `gate.cjs` (f/g).
- **Catalogue** : `packages/core/src/connectors/catalog.ts` — **4 connecteurs déclarés**, couvrant les 4 archétypes d'auth :
  1. `restGeneric` (apiKey)
  2. `googleSheets` (oauth2, `readRange`)
  3. `outgoingWebhook` (webhookSecret, `postMessage`)
  4. `stripe` (bearer, `listCharges`, ids `ch_demo_*` — **aucune clé réelle**)
- **Surface** : `/connecteurs` (`app/(app)/connecteurs/page.tsx` + `ConnecteursListContent.tsx`, compteur `CONNECTORS.length` = **4**, groupé par catégorie) ; fiche `/connecteurs/[id]` (champs, OAuth2, hôtes, opérations, mapping, **démo sur fixture — zéro réseau, zéro secret**, `generateStaticParams` + `notFound()`).
- **Note** : la surface vit sous le groupe `(app)` (pas `(public)`), **sans entrée SiteNav** (décision MVP, PLAN §0). À distinguer du **module** `/modules/connecteurs` (simulateur de module, sujet différent).

---

## BLOC 5 — Sandbox Maker (proxy)

| PR | Rôle | Statut |
|----|------|--------|
| **#94** | Route éphémère `POST /api/sandbox/spark-preview` (Sketch OFF, no-persist) | ✅ mergé (13/06) |
| **#126** | Autoriser le sous-domaine `app.` dans le défaut de l'allowlist d'origine (fix 403 CORS) | ✅ mergé (15/06) |

- **Proxy** : `app/api/sandbox/spark-preview/route.ts` + orchestrateur `lib/sandbox/spark-preview.ts`. Relais **serveur→serveur** vers `MAKER_INTERNAL_URL` (`/api/internal/spark-preview`, `Authorization: Bearer INTERNAL_API_SECRET`).
- **Verrous de sécurité** : contrat **strict `{ prompt }` seul** (tout champ superflu → 400, aucun upload/BYOK), **allowlist d'origine** (`SANDBOX_PREVIEW_ALLOWED_ORIGINS`, défauts apex/www/localhost **+ `app.blueprint-modular.com`** depuis #126, match exact — pas de wildcard), jeton optionnel `SANDBOX_PREVIEW_TOKEN`, **rate-limit/IP** (`SANDBOX_PREVIEW_RATE_LIMIT`, défaut 10/min), `Cache-Control: no-store`. **Zéro écriture DB**, zéro export/déploiement. Tests : `tests/sandbox-spark-preview.test.ts` (21 cas, garde statique anti-`prisma`/anti-export).
- **Mode « Par IA » — fonctionnel et câblé** : `app/(app)/sandbox/page.tsx` `generateFromAI` (L1505) POST **vers `/api/sandbox/spark-preview`** (L1516) — donc l'UI consomme bien le **nouveau proxy sécurisé** (le « chantier 2 » de câblage UI évoqué dans #94 a été réalisé). Variables documentées dans `.env.example` (L23–39).
- **Résidu à noter** : un check legacy `fetch("/api/ai/health")` (L808) et un « Ollama hint » subsistent dans la page sandbox — vestige de l'ancien chemin IA local. Sans impact sur le flux `spark-preview`, mais à nettoyer (cohérent avec la consigne Maker « intégrations self-host locales retirées »).

---

## Écarts & recommandations (factuel)

1. **Écart main↔prod non traçable** (Bloc 2) : aucun marqueur de SHA déployé dans le repo
   → ajouter un tag/fichier `deployed/*` mis à jour par `deploy-from-git.sh`.
2. **Gate humain généralisé** : toutes les PRs récentes portent « ne pas déployer sans
   validation » → le code est en avance ; le déploiement effectif dépend d'une décision humaine.
3. **Résidu IA local** dans `app/(app)/sandbox/page.tsx` (`/api/ai/health`, Ollama hint)
   → nettoyage cosmétique recommandé.
4. **#140 prête** : mergeable, CI verte ; n'attend que la validation humaine.
5. **`connection_limit` manquant** dans le `.env` de `blueprint-modular` (rappel CLAUDE.md
   Maker, incident 19/04) — hors périmètre code de cet audit mais à confirmer côté prod.

---

*Audit généré le 2026-06-16. Read-only — aucun code modifié, aucun commit/push/merge.*
