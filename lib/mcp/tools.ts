/**
 * Source unique de vérité (côté UI) pour l'identité des 4 outils du connecteur MCP :
 * endpoint public + nom et signature de chaque outil.
 *
 * Les outils eux-mêmes sont définis et exécutés dans app/api/mcp/route.ts (transport)
 * et lib/mcp/registry.ts (logique). Ce module NE redéfinit PAS leur comportement : il
 * expose seulement les métadonnées d'affichage (nom + signature), pour que la page /mcp
 * et la page /built-for-ai n'en gardent pas chacune une copie divergente.
 *
 * Les DESCRIPTIONS des outils restent dans le dictionnaire i18n (dict.mcp.tools) — une
 * seule source, partagée par les deux pages.
 */

/** Endpoint public du connecteur MCP (Streamable HTTP, read-only, sans auth). */
export const MCP_ENDPOINT = "https://mcp.blueprint-modular.com/api/mcp";

/** Les 4 outils read-only exposés. Signatures = paramètres réels (cf. inputSchema dans route.ts). */
export const MCP_TOOLS = [
  { name: "list_components", sig: "category?, cursor?" },
  { name: "search_components", sig: "query, cursor?" },
  { name: "get_component", sig: "name" },
  { name: "suggest_composition", sig: "need, limit?" },
] as const;

export type McpToolName = (typeof MCP_TOOLS)[number]["name"];
