# Audit — Garde d'origine `spark-preview` + état de l'art des surfaces de preview IA

**Date** : 2026-06-15 · **Mode** : read-only · **Code modifié** : aucun · `git status` : 0 fichier

> Rapport décisionnel. Aucune modification de code applicatif. Le correctif est
> **proposé**, pas appliqué.

---

## PARTIE 1 — Diagnostic de la garde d'origine (V0)

### 1.1 Localisation

| Élément | Fichier |
|---|---|
| Route HTTP (entrée) | `app/api/sandbox/spark-preview/route.ts` |
| Logique (garde + rate-limit + proxy) | `lib/sandbox/spark-preview.ts` |
| Appelant (client UI) | `app/(app)/sandbox/page.tsx:1515` (`fetch("/api/sandbox/spark-preview")`) |
| Helper IP | `lib/mcp/rateLimit.ts:15` (`clientIp`) |
| Config attendue | `.env.example:25-39` |
| Routage prod | `deploy/nginx-blueprint-modular.conf:79-82` |

### 1.2 La garde d'origine — comment elle fonctionne

`isRequestAllowed(req)` (`lib/sandbox/spark-preview.ts:94-103`) :

1. **Voie jeton** : si `SANDBOX_PREVIEW_TOKEN` est défini ET que l'en-tête
   `x-sandbox-preview-token` correspond → autorisé (sert aux appels
   serveur→serveur). Le client navigateur ne l'utilise pas.
2. **Voie origine** : lit l'en-tête `Origin`. Si **absent → `return false`**
   (rejet strict). Sinon : `allowedOrigins().includes(origin)`.

Caractéristiques de la comparaison :
- **Match exact de chaîne** via `Array.includes` — pas de regex, pas de
  normalisation. `https://app.blueprint-modular.com` ≠ `https://blueprint-modular.com`.
- **Aucune gestion des variations** : `www`/apex/sous-domaine, `http`/`https`,
  port — tout écart = rejet.
- **Origin absent = rejet** (pas de fallback permissif).

### 1.3 Liste autorisée — codée en dur + override par env

`allowedOrigins()` (`:77-86`) lit la variable d'env
**`SANDBOX_PREVIEW_ALLOWED_ORIGINS`** (CSV). Si vide/non définie → fallback sur
`DEFAULT_ALLOWED_ORIGINS` (`:71-75`) :

```
https://blueprint-modular.com
https://www.blueprint-modular.com
http://localhost:3000
```

**Origines actuellement autorisées (défaut) :**

| Origine | Dans l'allowlist ? |
|---|---|
| `https://blueprint-modular.com` (apex / vitrine) | ✅ |
| `https://www.blueprint-modular.com` | ✅ |
| `http://localhost:3000` (dev) | ✅ |
| **`https://app.blueprint-modular.com` (où vit RÉELLEMENT la sandbox)** | ❌ **ABSENT** |

### 1.4 🔴 Cause racine du « origin not allowed »

La sandbox n'est **pas** servie sur l'apex. D'après
`deploy/nginx-blueprint-modular.conf:79-82` :

```
# App Next.js (Wiki, modules, sandbox, doc composants)
server_name app.blueprint-modular.com;
```

et `.env.example:3` → `NEXTAUTH_URL=https://app.blueprint-modular.com`.

La page `/sandbox` (groupe de routes `(app)`) est donc servie sur
**`app.blueprint-modular.com`**. Quand le navigateur exécute le `fetch` POST
same-origin (`page.tsx:1515`), il joint `Origin: https://app.blueprint-modular.com`.
Cette valeur **n'est pas** dans l'allowlist par défaut (qui ne contient que
l'apex + `www` + localhost) → `includes()` renvoie `false` → **403 « origin not
allowed »**.

> Le commentaire `page.tsx:1513` (« Même origine que le site Modular → autorisé
> par l'allowlist ») reflète l'**intention**, pas la réalité : l'allowlist
> whiteliste l'apex, mais l'app tourne sur le sous-domaine `app.` — jamais
> ajouté. C'est un angle mort apex-vs-sous-domaine, pas un bug de logique de la
> garde.

**Pourquoi en prod et pas en test ?** Le test
(`tests/sandbox-spark-preview.test.ts:78`) vérifie l'apex
`https://blueprint-modular.com`, qui passe. Le sous-domaine réel `app.` n'est
couvert par aucun test → la régression est invisible côté CI.

### 1.5 Les autres verrous (état)

| Verrou | Implémentation | État |
|---|---|---|
| **Rate-limit IP** | `checkSparkRateLimit` (`:120-140`) — fenêtre glissante 60 s en mémoire, défaut 10 req/min/IP (`SANDBOX_PREVIEW_RATE_LIMIT`), clé = `clientIp` (`x-forwarded-for[0]`) | ✅ Fonctionnel. ⚠️ En-mémoire → réinitialisé à chaque restart pm2, non partagé entre instances. |
| **No-store** | En-tête `Cache-Control: no-store` sur la réponse (`route.ts:57`) | ✅ |
| **Éphémère / no-persist** | Aucune écriture DB / déploiement / export ; vérifié statiquement par test (`:287-302`, tokens interdits `prisma`, `GeneratedApp`, `.create(`, `/api/export`…) | ✅ |
| **Anti-export / contrat strict** | `parseSparkPreviewBody` (`:50-67`) — rejette tout champ ≠ `prompt` (pas d'upload, BYOK, plan, deploy) ; renvoie `{ html, degraded }`, jamais la source | ✅ |
| **Anti-fuite secret/URL** | Messages d'erreur FR génériques ; `INTERNAL_API_SECRET`/`MAKER_INTERNAL_URL` jamais dans le payload (`:184-194`, `:215-217`) | ✅ |

### 1.6 Côté proxy (→ API interne Maker)

`runSparkPreview` (`:180-232`) : POST serveur→serveur vers
`${MAKER_INTERNAL_URL}/api/internal/spark-preview`,
`Authorization: Bearer ${INTERNAL_API_SECRET}`, body `{ prompt, tier: "spark" }`,
timeout 120 s, `cache: "no-store"`.

- **Seconde vérification d'origine côté proxy ?** **Non** — et c'est correct :
  l'`Origin` navigateur n'a aucun sens sur le hop serveur→serveur. La confiance
  repose sur le **secret Bearer partagé** + le fait que `MAKER_INTERNAL_URL` est
  une URL interne (ex. `http://localhost:3001`, non exposée publiquement). La
  garde d'origine ne protège que le **premier** hop (navigateur → Next.js).
- Le secret et l'URL restent strictement côté serveur (variables d'env, jamais
  renvoyés au client).

### 1.7 Correctif PROPOSÉ (⚠️ non appliqué)

Le blocage = `app.blueprint-modular.com` absent de l'allowlist effective. Deux
scénarios selon l'état de `SANDBOX_PREVIEW_ALLOWED_ORIGINS` en prod :

**Scénario A — la variable n'est PAS définie en prod (le plus probable ;
`.env.example:27` la montre vide).**
Les défauts codés en dur s'appliquent → `app.` manque. **Deux options de fix :**

- **A1 (recommandé, sans redéploiement de code) — définir l'env sur bpm-prod :**
  ```
  SANDBOX_PREVIEW_ALLOWED_ORIGINS=https://app.blueprint-modular.com,http://localhost:3000
  ```
  dans le fichier d'env de l'app (celui chargé par pm2), puis **recharger** :
  `pm2 restart <app> --update-env` (ou `pm2 reload`). Aucun build, aucun merge.

- **A2 — corriger le défaut codé en dur (1 ligne, nécessite build+déploiement) :**
  ajouter `"https://app.blueprint-modular.com"` à `DEFAULT_ALLOWED_ORIGINS`
  (`lib/sandbox/spark-preview.ts:71-75`). Plus durable (le défaut reflète enfin
  la réalité de prod) mais passe par le pipeline de déploiement.

**Scénario B — la variable EST définie en prod mais sans `app.`.**
Éditer sa valeur pour y inclure `https://app.blueprint-modular.com`, puis
recharger pm2 (`--update-env`).

> **Reco de fix immédiat** : **A1** pour débloquer en minutes sans toucher au
> code, **+ A2** en suivi pour que le défaut intègre durablement le sous-domaine
> (sinon la dépendance à l'env reste un piège). Ajouter aussi un test couvrant
> `https://app.blueprint-modular.com` pour fermer l'angle mort CI.

**Vérification avant d'appliquer** (read-only, sur bpm-prod) :
```bash
pm2 env <id> | grep SANDBOX_PREVIEW_ALLOWED_ORIGINS   # voir si défini, et sa valeur
# Repro du rejet :
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://app.blueprint-modular.com/api/sandbox/spark-preview \
  -H "Content-Type: application/json" -H "Origin: https://app.blueprint-modular.com" \
  -d '{"prompt":"test"}'   # attendu actuellement : 403
```

---

## PARTIE 2 — État de l'art & recommandation (V1 + V2)

> **Légende sources** : **[D]** documenté publiquement (docs officielles / posts
> d'ingénierie connus) · **[I]** inféré (déduction d'architecture, non confirmé
> par source primaire). Connaissance arrêtée à janv. 2026.

### 2.1 Comment des produits comparables sécurisent une surface de preview IA

| Produit | Où s'exécute le preview | Isolation | Note |
|---|---|---|---|
| **v0 (Vercel)** | Rendu serveur + sandbox côté Vercel, preview en **iframe** | Iframe + déploiements préviews jetables **[D]** ; egress contrôlé par l'infra Vercel **[I]** | Le code généré EST le produit (exportable) — modèle inverse de spark (anti-export). |
| **bolt.new / StackBlitz** | **WebContainers** — Node tourne **dans le navigateur** (WASM), zéro code serveur | Bac à sable navigateur natif : pas de filesystem hôte, réseau proxifié par StackBlitz **[D]** | Élimine le SSRF côté serveur par construction (rien ne s'exécute sur leur backend). |
| **Lovable** | Génère un vrai projet + preview iframe | Iframe sandboxée + build isolé **[I]** | Orienté export/ownership du code. |
| **Replit** | VM/conteneur par workspace (Nix) | Conteneur fort + egress filtré **[D/I]** | Isolation la plus lourde (exécution arbitraire d'utilisateur). |
| **CodeSandbox** | MicroVM (Firecracker) ou navigateur | MicroVM Firecracker pour le cloud **[D]** | Isolation niveau VM pour code non fiable. |

**Spark-preview est volontairement à l'opposé** de v0/Lovable : il **ne rend que
du HTML statique** (composants `bpm.*` pré-rendus par le Maker), **n'exécute
aucun code utilisateur**, et **n'expose jamais la source**. Sa surface d'attaque
est donc bien plus petite — la plupart des protections « lourdes » (microVM,
conteneur jetable) sont **sans objet** ici.

### 2.2 Tableau de décision des patterns

| Pattern | Retenu pour spark-preview ? | Raison |
|---|---|---|
| **Allow-list d'origine** (vs CORS ouvert) | ✅ **Retenu** | Approprié : restreint l'appelant à un petit ensemble connu. Le bug actuel est une **omission de données** (`app.`), pas un défaut du pattern. |
| **Same-origin proxy** (cacher l'API Maker derrière Next) | ✅ **Retenu, central** | Le secret/URL Maker ne fuient jamais ; le navigateur ne parle qu'à same-origin. Bonne pratique standard. |
| **CORS « propre »** (`Access-Control-Allow-Origin` + préflight) | ⚖️ **Partiellement pertinent** | L'appel actuel étant **same-origin**, CORS n'est pas requis. Utile seulement si on veut autoriser un *autre* domaine (ex. vitrine apex → app). Recommandé en complément, pas en remplacement. |
| **Iframe `sandbox` + CSP** pour afficher le HTML généré | ✅ **Déjà partiellement en place / à durcir** | Le HTML Maker est injecté en `iframe srcdoc` (`page.tsx:749`). Le HTML provenant d'un LLM doit être traité comme **non fiable** → l'attribut `sandbox` (sans `allow-same-origin`) + une CSP stricte sur l'iframe sont la défense clé. **À vérifier/durcir** (point d'évolution). |
| **CSP `frame-ancestors`** (anti-clickjacking de la sandbox elle-même) | ⚖️ **À vérifier** (probablement géré globalement, non audité ici) | Empêche l'embedding hostile de la page sandbox. |
| **Isolation éphémère / no-persist** | ✅ **Retenu** | Aucun enregistrement, no-store, réponse jetable. Aligné état de l'art pour un preview « démo ». |
| **Anti-SSRF sur l'egress** | ✅ **Implicitement géré** | Le proxy ne fait **pas** d'egress piloté par l'utilisateur : il appelle une **URL fixe** (`MAKER_INTERNAL_URL`), jamais une URL issue du prompt. Pas de surface SSRF côté spark. ⚠️ À garantir côté **Maker** (c'est lui qui exécute le pipeline). |
| **Rate-limiting** | ✅ **Retenu** | Présent (par IP). Limite : en-mémoire mono-instance (cf. 2.3). |
| **Anti-extraction du code généré** | ✅ **Retenu, distinctif** | Contrat `{ html, degraded }` seul, jamais de TSX/plan/source. C'est le **cœur du modèle** spark (vs v0/Lovable qui exportent). |

### 2.3 Limites identifiées (au-delà du bug d'origine)

- **Rate-limit en mémoire** : remis à zéro à chaque restart pm2, non partagé
  multi-instances. Sous pm2 cluster (>1 worker), la limite réelle = N × seuil.
  → envisager un store partagé (Redis) si montée en charge.
- **Iframe `srcdoc`** : injecter du HTML issu d'un LLM exige `sandbox` strict +
  CSP ; à confirmer dans l'audit de rendu (hors scope code ici).
- **Couverture de test** : aucun test sur le sous-domaine `app.` → l'angle mort
  qui a produit le bug n'est pas verrouillé.

### 2.4 Recommandation (V2)

**Le modèle actuel (allow-list d'origine + same-origin proxy Maker + réponse
éphémère sans export) est aligné avec l'état de l'art** pour une surface de
preview *qui n'exécute pas de code utilisateur et n'expose pas la source*. Il n'y
a **pas** lieu de basculer vers une architecture lourde (microVM/conteneur
jetable type Replit/CodeSandbox) : ces protections répondent à l'exécution de
code arbitraire, que spark **n'autorise pas**. Le pattern est bon ; c'est sa
**donnée de configuration** qui est incomplète.

**À séparer nettement :**

- 🔧 **Correctif immédiat (débloquer la sandbox)** — purement opérationnel,
  aucun changement d'archi :
  1. Ajouter `https://app.blueprint-modular.com` à l'allowlist effective (env A1
     sur bpm-prod + reload pm2 ; en suivi, corriger le défaut codé en dur A2).
  2. Ajouter un test couvrant le sous-domaine `app.`.

- 🛠️ **Évolution éventuelle (durcissement aligné état de l'art, à arbitrer plus
  tard)** — pas urgent :
  1. Durcir l'iframe d'affichage : attribut `sandbox` (sans `allow-same-origin`)
     + CSP stricte sur le HTML LLM.
  2. Rate-limit partagé (Redis) si pm2 cluster / multi-instances.
  3. Confirmer l'absence de surface SSRF **côté Maker** (l'egress réel y vit).
  4. CORS explicite seulement si un cross-domain légitime apparaît (ex. vitrine
     apex appelant l'app).

---

### Annexe — Validation de l'audit

- `git status` : **0 fichier de code modifié** — aucun code touché, fix
  **proposé** et non appliqué. Seul ce document d'audit est ajouté.
- `npx tsc --noEmit` : erreurs **uniquement** dans `tests/*` et
  `vitest.config.ts`, toutes dues à `node_modules` absent dans le conteneur frais
  (`@types/node`, `vitest`, `react` non installés). **Pré-existantes et
  environnementales**, sans lien avec la mission. Le code applicatif
  `lib/sandbox/spark-preview.ts` et la route ne produisent aucune erreur.
