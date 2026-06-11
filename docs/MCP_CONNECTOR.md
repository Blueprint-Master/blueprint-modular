# Connecteur MCP — Blueprint Modular

Serveur **MCP read-only** qui expose le catalogue de composants
`@blueprint-modular/core` à Claude, ChatGPT (developer mode) et tout hôte MCP
via un endpoint **Streamable HTTP**, conçu pour passer une review de directory
sans retouche.

- **Endpoint** : `POST /api/mcp` (prod : `https://mcp.blueprint-modular.com`)
- **Transport** : Streamable HTTP (sans état). SSE désactivé (déprécié par la spec MCP).
- **Auth** : aucune — le catalogue de composants est une donnée **publique**.
- **Accès** : **read-only strict**. Aucune écriture, aucune action, aucune exposition de `bpm-prod`.
- **Hébergement** : route handler Next.js (`app/api/mcp/route.ts`). Un seul déploiement
  sert le site **et** le connecteur, déployable tel quel sur Vercel.
- **Page doc publique** : `/mcp` · **Confidentialité** : `/privacy` · **Santé** : `GET /api/health`.

## Source de vérité

Les réponses proviennent exclusivement du registre **généré** — jamais de données
saisies à la main :

```
lib/generated/bpm-components.json   ┐
public/llms.txt                     ┘─► scripts/generate-mcp-registry.mjs ─► lib/generated/mcp-registry.json
                                                                                      │
                                                                          lib/mcp/registry.ts ─► app/api/mcp/route.ts
```

Régénérer le registre après toute mise à jour des composants ou des docs :

```bash
npm run generate:mcp-registry
```

## Outils exposés (4, read-only)

Chaque outil porte `readOnlyHint: true` et `openWorldHint: false`, un schéma
d'entrée typé, et une description « ce que fait l'outil ET quand l'utiliser ».

| Outil | Entrée | Retour |
|-------|--------|--------|
| `list_components` | `category?`, `cursor?` | Noms + description courte, **paginés par curseur** (`nextCursor`), filtrables par catégorie. Max 25/page. |
| `search_components` | `query`, `cursor?` | Composants pertinents (match nom/description/catégorie/tags), triés. Paginé par curseur, max 15/page. |
| `get_component` | `name` (`bpm.metric` ou `metric`) | Détail borné : description, **props/types**, exemple, associés/parents. |
| `suggest_composition` | `need`, `limit?` (défaut 8, plafonné 12) | Composants répondant à un besoin en langage naturel. Réponse bornée. |

### Conformité directory

- **Hygiène des sorties** : uniquement de la donnée catalogue. Aucun ID interne
  (slug), chemin de fichier, timestamp ou champ debug n'est exposé.
- **Pagination + plafond de tokens** : curseur opaque sur `list`/`search`,
  réponses bornées partout.
- **Erreurs structurées** : jamais de 500/400 nu. Nom/catégorie inconnu →
  message + indication de l'outil à utiliser. Entrée vide → message de
  validation clair. (`isError: true` avec `error` + `hint`.)
- **Robustesse** : timeout d'exécution borné (`maxDuration` 30 s + garde interne
  10 s) et **rate-limiting basique par IP** (120 req/min → 429 + `Retry-After`).

## Tester en local

```bash
npm run dev          # démarre Next.js (http://localhost:3000)
```

Puis, dans un autre terminal :

```bash
URL=http://localhost:3000/api/mcp
HDR=(-H "Content-Type: application/json" -H "Accept: application/json, text/event-stream")

# handshake
curl -s "${HDR[@]}" -X POST "$URL" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"cli","version":"1.0"}}}'

# lister les outils (voir annotations.readOnlyHint)
curl -s "${HDR[@]}" -X POST "$URL" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# appeler un outil
curl -s "${HDR[@]}" -X POST "$URL" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_component","arguments":{"name":"metric"}}}'
```

### MCP Inspector

```bash
npx @modelcontextprotocol/inspector
# Transport: Streamable HTTP — URL: http://localhost:3000/api/mcp — Auth: none
```

## Ajouter le connecteur

### Claude

1. **Settings → Connectors → Add custom connector**.
2. **Name** : `Blueprint Modular`
3. **Remote MCP server URL** : `https://mcp.blueprint-modular.com`
   (en local : `http://localhost:3000/api/mcp`).
4. Pas d'authentification à configurer.

### ChatGPT (developer mode)

1. **Settings → Connectors → Advanced → Developer mode**.
2. **Create / Add custom connector**.
3. **MCP Server URL** : `https://mcp.blueprint-modular.com`, **Auth : None**.

## Détails techniques

- **Adaptateur** : [`mcp-handler`](https://www.npmjs.com/package/mcp-handler) (adaptateur MCP de Vercel)
  + `@modelcontextprotocol/sdk` + `zod`.
- **Stateless** : chaque requête POST crée un transport éphémère — aucun Redis,
  aucune session persistée.
- **Endpoint dérivé** de `basePath: "/api"` → `/api/mcp`. `disableSse: true`.
- `runtime = "nodejs"`, `dynamic = "force-dynamic"`, SSR-safe.
