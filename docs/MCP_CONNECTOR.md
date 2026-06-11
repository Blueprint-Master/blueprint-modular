# Connecteur MCP — Blueprint Modular

Serveur **MCP read-only** qui expose le catalogue de composants
`@blueprint-modular/core` à Claude (et à tout hôte MCP) via un endpoint
**Streamable HTTP**.

- **Endpoint** : `POST /api/mcp`
- **Transport** : Streamable HTTP (sans état). SSE désactivé (déprécié par la spec MCP).
- **Auth** : aucune — le catalogue de composants est une donnée **publique**.
- **Accès** : **read-only strict**. Aucune écriture, aucune action, aucune exposition de `bpm-prod`.
- **Hébergement** : route handler Next.js (`app/api/mcp/route.ts`). Un seul déploiement
  sert le site **et** le connecteur, déployable tel quel sur Vercel.

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

| Outil | Paramètres | Retour |
|-------|-----------|--------|
| `list_components` | `category?`, `page?`, `pageSize?` (défaut 30, max 100) | Noms + description courte, **paginés** et filtrables par catégorie. |
| `search_components` | `query`, `limit?` (défaut 10) | Composants pertinents (match nom/description/catégorie/tags), triés par pertinence. |
| `get_component` | `name` (`bpm.metric` ou `metric`) | Détail : description, **props/types**, exemple d'usage, composants associés/parents. |
| `suggest_composition` | `need`, `limit?` (défaut 8) | Liste de composants répondant à un besoin décrit en langage naturel. |

Toutes les réponses sont **scopées et paginées** : pas de payload géant
(exigence du directory MCP).

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

# lister les outils
curl -s "${HDR[@]}" -X POST "$URL" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'

# appeler un outil
curl -s "${HDR[@]}" -X POST "$URL" \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"get_component","arguments":{"name":"metric"}}}'
```

## Ajouter le connecteur dans Claude

1. **Settings → Connectors → Add custom connector**.
2. **Name** : `Blueprint Modular`
3. **Remote MCP server URL** :
   - en local : `http://localhost:3000/api/mcp`
   - en preview Vercel : `https://<deployment>.vercel.app/api/mcp`
4. Pas d'authentification à configurer (connecteur public).
5. Valider, puis dans une conversation vérifier que les 4 outils répondent
   (`list_components`, `search_components`, `get_component`, `suggest_composition`).

> Note : un accès custom connector par URL nécessite un plan le permettant
> (Claude Pro/Max/Team/Enterprise selon l'offre en vigueur).

## Détails techniques

- **Adaptateur** : [`mcp-handler`](https://www.npmjs.com/package/mcp-handler) (adaptateur MCP de Vercel)
  + `@modelcontextprotocol/sdk` + `zod`.
- **Stateless** : chaque requête POST crée un transport éphémère — aucun Redis,
  aucune session persistée.
- **Endpoint dérivé** de `basePath: "/api"` → `/api/mcp`. `disableSse: true`.
- `runtime = "nodejs"`, `dynamic = "force-dynamic"`.
