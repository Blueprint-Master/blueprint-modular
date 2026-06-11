/**
 * Connecteur MCP « Blueprint Modular » — endpoint Streamable HTTP, public, READ-ONLY.
 *
 * Expose le catalogue de composants (@blueprint-modular/core) à Claude et à tout
 * hôte MCP via 4 outils en lecture seule. Aucune écriture, aucune authentification
 * (le catalogue est public). Aucune donnée ne provient de bpm-prod.
 *
 * Transport : Streamable HTTP (SSE désactivé — déprécié par la spec MCP).
 * Hébergement : route handler Next.js, déployable tel quel sur Vercel.
 *
 * Source de vérité : lib/generated/mcp-registry.json (généré, voir lib/mcp/registry.ts).
 */
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  CATEGORIES,
  TOTAL,
  getComponent,
  componentDetail,
  listComponents,
  searchComponents,
  suggestComposition,
} from "@/lib/mcp/registry";

export const runtime = "nodejs";
// Endpoint public en lecture seule : pas de cache de réponse côté CDN par défaut.
export const dynamic = "force-dynamic";

/** Emballe une valeur structurée en réponse MCP texte (JSON lisible). */
function json(data: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }],
  };
}

const handler = createMcpHandler(
  (server) => {
    // 1) list_components — noms + une ligne de description, paginé, filtrable par catégorie.
    server.tool(
      "list_components",
      "Liste les composants Blueprint Modular (nom + description courte). " +
        "Filtrable par catégorie et paginé pour garder des réponses scopées. " +
        `Catégories disponibles : ${CATEGORIES.join(", ")}.`,
      {
        category: z
          .string()
          .optional()
          .describe("Catégorie pour filtrer (ex. 'Graphiques', 'Mise en page'). Optionnel."),
        page: z.number().int().min(1).optional().describe("Numéro de page (défaut 1)."),
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe("Composants par page (défaut 30, max 100)."),
      },
      async ({ category, page, pageSize }) => json(listComponents({ category, page, pageSize })),
    );

    // 2) search_components — recherche pertinente sur nom / description / catégorie / tags.
    server.tool(
      "search_components",
      "Recherche les composants pertinents pour une requête (match sur nom, description, " +
        "catégorie et tags). Réponse scopée et triée par pertinence.",
      {
        query: z.string().min(1).describe("Termes de recherche (ex. 'tableau triable', 'graphique')."),
        limit: z.number().int().min(1).max(50).optional().describe("Nombre max de résultats (défaut 10)."),
      },
      async ({ query, limit }) => json(searchComponents(query, limit ?? 10)),
    );

    // 3) get_component — détail complet d'un composant depuis le registre.
    server.tool(
      "get_component",
      "Retourne le détail d'un composant : description, props/types, exemple d'usage, " +
        "composants associés. Le nom accepte 'bpm.metric' ou 'metric'.",
      {
        name: z.string().min(1).describe("Nom du composant (ex. 'bpm.metric' ou 'metric')."),
      },
      async ({ name }) => {
        const c = getComponent(name);
        if (!c) {
          return json({
            error: `Composant introuvable : "${name}".`,
            hint: "Utilisez search_components ou list_components pour trouver le nom exact.",
          });
        }
        return json(componentDetail(c));
      },
    );

    // 4) suggest_composition — composants répondant à un besoin décrit en langage naturel.
    server.tool(
      "suggest_composition",
      "Suggère une liste de composants Blueprint Modular répondant à un besoin décrit " +
        "en langage naturel (ex. 'un tableau de bord avec métriques et graphiques').",
      {
        need: z.string().min(1).describe("Description du besoin / de l'écran à construire."),
        limit: z.number().int().min(1).max(20).optional().describe("Nombre max de suggestions (défaut 8)."),
      },
      async ({ need, limit }) => json(suggestComposition(need, limit ?? 8)),
    );
  },
  {
    // Métadonnées du serveur exposées au handshake MCP (initialize).
    serverInfo: {
      name: "blueprint-modular",
      version: "1.0.0",
    },
    instructions:
      "Catalogue read-only des composants Blueprint Modular (@blueprint-modular/core). " +
      `${TOTAL} composants. Utilise list_components/search_components pour explorer, ` +
      "get_component pour les props/exemples, suggest_composition pour partir d'un besoin.",
  },
  {
    // Le handler dérive l'endpoint Streamable HTTP de basePath → "/api/mcp".
    basePath: "/api",
    // SSE déprécié + nécessite Redis : on ne garde que le Streamable HTTP (sans état).
    disableSse: true,
    verboseLogs: process.env.NODE_ENV !== "production",
    maxDuration: 60,
  },
);

export { handler as GET, handler as POST, handler as DELETE };
