# MCP_LISTING — Fiche canonique de référencement

**Source unique de vérité** pour le référencement du connecteur MCP « Blueprint
Modular » dans les annuaires (mcp.so, smithery.ai, glama.ai,
awesome-mcp-servers). Toute soumission recopie ce fichier — aucune métadonnée
n'est ré-inventée par annuaire. La soumission elle-même est **manuelle**
(action Rémi) : ce document prépare, il ne soumet pas.

> Vérification croisée (2026-06-15) : les 4 outils et leurs schémas décrits
> ci-dessous correspondent **exactement** à la définition du serveur
> (`app/api/mcp/route.ts` + `lib/mcp/registry.ts`) **et** à la réponse du MCP
> live interrogé via le connecteur (`tools/list` → 4 outils, `total: 104`,
> 10 catégories). Détail en fin de fichier (§ Vérification croisée).

---

## 1. Identité

| Champ | Valeur |
|-------|--------|
| **Nom** | `Blueprint Modular` |
| **Une-ligne (tagline, ≤55)** | `Catalogue read-only des composants Blueprint Modular` |
| **Catégorie / positionnement** | Developer Tools — Design system / UI & composants (catalogue de design system pour la génération d'interfaces) |
| **Contact** | contact@blueprint-modular.com |
| **Licence** | MIT |

### Description longue (≤2000 caractères)

> Blueprint Modular est un serveur MCP **public** et **en lecture seule** qui
> expose le catalogue de composants du design system `@blueprint-modular/core`
> (**104 composants**, **10 catégories** : Affichage de données, Mise en page,
> Interaction, Feedback, Navigation, Média, Graphiques, Utilitaires,
> Identification & traçabilité, IA & Spécialisés).
>
> Il aide un modèle à découvrir et à utiliser correctement les composants
> `bpm.*` **avant** de générer du code : lister le catalogue, rechercher par
> mot-clé, obtenir la signature exacte (props, types, exemple) d'un composant,
> et proposer une composition à partir d'un besoin décrit en langage naturel.
> Chaque détail de composant inclut une couche sémantique (rôle, frame Ω, type
> d'indicateur, guidance agent) pour raisonner sur le *sens* d'un composant,
> pas seulement son rendu.
>
> Quatre outils, tous read-only :
> - `list_components(category?, cursor?)` — parcourir le catalogue, paginé.
> - `search_components(query, cursor?)` — trouver des composants pertinents, paginé.
> - `get_component(name)` — props/types/usage/exemple + sémantique, depuis le registre.
> - `suggest_composition(need, limit?)` — briques répondant à une intention d'écran.
>
> Les données proviennent exclusivement d'un registre **généré** à partir des
> sources du package (jamais saisies à la main). Le serveur n'effectue aucune
> écriture, n'accède à aucun système de production, ne demande aucune
> authentification et ne stocke aucune donnée de conversation. Les réponses
> sont nettoyées (uniquement de la donnée catalogue), paginées par curseur avec
> un plafond de taille, et les erreurs sont structurées et actionnables. Un
> rate-limiting basique par IP et des timeouts bornés protègent l'endpoint.
>
> Idéal pour générer des interfaces Next.js/React cohérentes avec Blueprint
> Modular, ou pour explorer le design system depuis Claude ou ChatGPT.

---

## 2. Serveur

| Champ | Valeur |
|-------|--------|
| **Endpoint (canonique)** | `https://mcp.blueprint-modular.com/api/mcp` |
| **Méthode** | `POST` (+ `GET`/`DELETE` gérés par le transport) |
| **Transport** | Streamable HTTP **sans état** (SSE désactivé — déprécié par la spec MCP) |
| **Protocole MCP** | `2025-06-18` |
| **Auth** | **Aucune — read-only, public** (le catalogue de composants est une donnée publique) |
| **Hébergement** | Route handler Next.js (`app/api/mcp/route.ts`), déployable sur Vercel |
| **Santé** | `GET /api/health` → `{ "status": "ok", "version": "1.0.0", ... }` |
| **Confidentialité** | `https://blueprint-modular.com/privacy` |
| **Page doc publique** | `https://blueprint-modular.com/mcp` |
| **Rate limiting** | ~120 req/min par IP → `429` + `Retry-After` |
| **Robustesse** | `maxDuration` 30 s + garde interne 10 s par outil ; erreurs `isError:true` (`error` + `hint`) |

### Exemple de handshake (initialize)

```bash
curl -X POST https://mcp.blueprint-modular.com/api/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-06-18",
      "capabilities": {},
      "clientInfo": { "name": "my-agent", "version": "1.0.0" }
    }
  }'
```

---

## 3. Outils exposés (4, read-only)

Chaque outil porte `annotations.readOnlyHint: true` et `openWorldHint: false`,
un schéma d'entrée typé (zod), et une description « ce que fait l'outil ET quand
l'utiliser ». **Aucun autre outil n'est exposé.**

### `list_components`
Liste les composants du design system (nom + description en une ligne). À
utiliser pour parcourir le catalogue ou découvrir ce qui existe dans une
catégorie donnée. Résultat paginé par curseur (`nextCursor`), max 25/page.

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `category` | string | non | Filtre par catégorie exacte ou partielle (ex. `Graphiques`). |
| `cursor` | string | non | Curseur de pagination renvoyé par un appel précédent (`nextCursor`). |

### `search_components`
Recherche les composants pertinents pour une requête en texte libre (match sur
nom, description, catégorie et tags), triés par pertinence. À utiliser quand on
cherche un composant par fonction ou mot-clé (ex. `tableau triable`,
`graphique`, `upload fichier`). Paginé par curseur, max 15/page.

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `query` | string (min 1) | **oui** | Termes de recherche en langage naturel. |
| `cursor` | string | non | Curseur de pagination (`nextCursor`). |

### `get_component`
Retourne le détail complet d'un composant : description, props/types, exemple
d'usage, composants associés/parents et couche sémantique (rôle, frame Ω, type
d'indicateur, directionnalité, guidance agent). À utiliser après list/search
pour obtenir la signature exacte ET le sens du composant avant de générer du
code. Le nom accepte `bpm.metric` ou `metric`.

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `name` | string (min 1) | **oui** | Nom du composant (ex. `bpm.metric` ou `metric`). |

### `suggest_composition`
Suggère une liste de composants répondant à un besoin décrit en langage
naturel, en raisonnant sur la couche sémantique (rôle, frame Ω, guidance) :
chaque suggestion explicite son sens (`meaning`) et ses associations
(`pairWith`). À utiliser pour partir d'une intention d'écran (ex. `un dashboard
avec des métriques et un graphique`). Réponse bornée.

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `need` | string (min 1) | **oui** | Description du besoin / de l'écran à construire. |
| `limit` | integer (≥1) | non | Nombre max de suggestions (défaut 8 ; plafonné à 12). |

---

## 4. Liens & ressources

| Ressource | URL | État vérif. |
|-----------|-----|-------------|
| **Dépôt (repo)** | https://github.com/Blueprint-Master/blueprint-modular | ✅ `200` |
| **Vitrine (site)** | https://blueprint-modular.com | ⚠️ non vérifiable (egress) |
| **Page connecteur MCP** | https://blueprint-modular.com/mcp | ⚠️ non vérifiable (egress) |
| **Manifeste / positionnement** | https://blueprint-modular.com/presentation | ⚠️ non vérifiable (egress) — *page `/presentation` du site ; pas de page « Manifeste » dédiée (voir TODO)* |
| **Endpoint MCP** | https://mcp.blueprint-modular.com/api/mcp | ⚠️ non vérifiable (egress) — cross-vérifié via le connecteur live |
| **Confidentialité** | https://blueprint-modular.com/privacy | ⚠️ non vérifiable (egress) |
| **Référence LLM** | https://blueprint-modular.com/llms.txt | ⚠️ non vérifiable (egress) |
| **Package npm** | https://www.npmjs.com/package/@blueprint-modular/core | ⚠️ non vérifiable (egress) |
| **Package PyPI** | https://pypi.org/project/blueprint-modular/ | ✅ `200` |
| **Licence** | MIT (`README.md`) | — |

> **Egress** : la sandbox de préparation n'autorise que `github.com` et
> `pypi.org` ; les hôtes `*.blueprint-modular.com` et les annuaires renvoient
> un `403` du proxy (et non du serveur). À la soumission, Rémi doit revalider
> chaque lien `*.blueprint-modular.com` (`curl -I` → 2xx/3xx) depuis un réseau
> non restreint.

### Logo / icône

| Asset | Chemin repo | URL publique attendue |
|-------|-------------|------------------------|
| Icône carrée 512 (recommandée annuaires) | `public/img/icon-pwa-512.png` | `https://blueprint-modular.com/img/icon-pwa-512.png` |
| Icône carrée 192 | `public/img/icon-pwa-192.png` | `https://blueprint-modular.com/img/icon-pwa-192.png` |
| Logo wordmark | `public/img/logo-bpm.png` | `https://blueprint-modular.com/img/logo-bpm.png` |

> **TODO logo** : les annuaires demandent souvent une icône carrée hébergée en
> HTTPS. `icon-pwa-512.png` convient ; confirmer qu'elle est servie publiquement
> à l'URL ci-dessus avant soumission.

---

## 5. Checklist de soumission (NE PAS SOUMETTRE — préparer seulement)

Pré-requis communs à recopier depuis §1–4 : **Nom**, **tagline**,
**description longue**, **endpoint** `https://mcp.blueprint-modular.com/api/mcp`,
**transport** Streamable HTTP, **auth** None, **repo**, **licence MIT**, **icône**.

| # | Annuaire | URL de soumission | Format | Action préparée |
|---|----------|-------------------|--------|-----------------|
| 1 | **mcp.so** | https://mcp.so/submit (bouton « Submit » → issue GitHub) | **Formulaire / issue GitHub** | Recopier §1–3. Champs : name, endpoint, description, tags, repo. |
| 2 | **smithery.ai** | https://smithery.ai/new (« Continue with GitHub ») | **GitHub OAuth + manifeste** (ou CLI `smithery deploy .`) | Connecter le repo ; déclarer serveur **remote HTTP** (endpoint ci-dessus), auth **None**, manifeste (name/description/tools). |
| 3 | **glama.ai** | https://glama.ai/mcp/servers (auto-indexé depuis GitHub, puis « Claim ») | **Fichier `glama.json` dans le repo + flux Claim** (pas de PR externe) | Ajouter `glama.json` (snippet ci-dessous) à la racine du repo, puis lancer le flux « Claim ownership ». |
| 4 | **awesome-mcp-servers** (punkpeye) | https://github.com/punkpeye/awesome-mcp-servers | **Pull Request** | Fork + 1 ligne dans `README.md`, **dans la bonne catégorie, ordre alphabétique**, format existant. Voir [CONTRIBUTING.md](https://github.com/punkpeye/awesome-mcp-servers/blob/main/CONTRIBUTING.md). |

### Snippet `glama.json` (pour l'annuaire glama.ai — à placer à la racine du repo)

```json
{
  "$schema": "https://glama.ai/mcp/schemas/server.json",
  "maintainers": ["<github-username-du-mainteneur>"]
}
```

### Ligne prête pour awesome-mcp-servers (à insérer dans la bonne catégorie, ordre alphabétique)

```markdown
- [Blueprint Modular](https://github.com/Blueprint-Master/blueprint-modular) 📇 ☁️ - Catalogue read-only du design system `@blueprint-modular/core` (104 composants) — list/search/get/suggest, sans auth.
```

> Les emojis de légende (catégorie/langage/scope) doivent suivre la convention
> en vigueur dans `awesome-mcp-servers` au moment de la PR — vérifier la légende
> du README avant de soumettre.

---

## 6. Sécurité — vérifications

- ✅ **Aucun secret / token** dans cette fiche : le connecteur public est
  **sans authentification**. (Le `MCP_BEARER_TOKEN` du dépôt
  `blueprint-mcp-server` concerne un **autre** serveur — l'outil de diagnostic
  d'infra `bpm-prod`, hors périmètre de cette fiche.)
- ✅ **Aucun détail d'auth interne** exposé : pas de DB, pas de variable
  d'environnement, pas de chemin interne.
- ✅ **Hygiène des sorties** côté serveur : uniquement de la donnée catalogue
  (pas d'ID interne `slug`, chemin, timestamp ni champ debug).

---

## 7. Vérification croisée (2026-06-15)

Les 4 outils décrits ici ont été confrontés à **trois** sources, identiques :

1. **Code serveur** — `app/api/mcp/route.ts` (`registerTool` ×4) +
   `lib/mcp/registry.ts` (logique).
2. **MCP live** — interrogé via le connecteur `MCP_Blueprint` :
   - `list_components` (sans filtre) → `total: 104`, 10 catégories, pagination
     curseur (`nextCursor`, 25/page).
   - `list_components(category:"Graphiques")` → `total: 6`
     (`bpm.lineChart`, `bpm.barChart`, `bpm.areaChart`, `bpm.scatterChart`,
     `bpm.plotlyChart`, `bpm.altairChart`).
3. **Registre généré** — `lib/generated/mcp-registry.json` → `total: 104`.

**Outils confirmés :** `list_components`, `search_components`, `get_component`,
`suggest_composition` — et **aucun autre**.

### ⚠️ Divergences à réconcilier dans le repo (hors périmètre de cette PR)

Pour tenir l'objectif « une source unique, aucune divergence », signaler :

- `SUBMISSION.md` et `docs/MCP_CONNECTOR.md` utilisent l'endpoint **apex**
  `https://blueprint-modular.com/api/mcp`, alors que la page vitrine
  (`app/(public)/(site)/mcp/mcp-content.tsx`) et la présente fiche utilisent le
  **sous-domaine** `https://mcp.blueprint-modular.com/api/mcp` (= MCP live).
  → Aligner sur le sous-domaine.
- `SUBMISSION.md` mentionne **« 101 composants »** ; le registre live en compte
  **104**. → Mettre à jour.
