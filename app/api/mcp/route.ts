/**
 * Connecteur MCP « Blueprint Modular » — endpoint Streamable HTTP, public, READ-ONLY.
 *
 * Expose le catalogue de composants (@blueprint-modular/core) à Claude, ChatGPT
 * (developer mode) et tout hôte MCP via 4 outils en lecture seule. Aucune écriture,
 * aucune authentification (le catalogue est public). Aucune donnée ne provient de
 * bpm-prod, aucune donnée de conversation n'est stockée.
 *
 * Conformité directory :
 *  - readOnlyHint:true + openWorldHint:false sur chaque outil.
 *  - Descriptions « ce que fait l'outil ET quand l'utiliser ».
 *  - Sorties nettoyées : uniquement la donnée catalogue (pas d'ID interne/chemin/
 *    timestamp/champ debug).
 *  - Pagination par curseur + plafond de tokens sur list/search ; get_component borné.
 *  - Erreurs structurées et actionnables (jamais 500/400 nu).
 *  - Timeout borné + rate-limiting basique par IP.
 *
 * Transport : Streamable HTTP sans état (SSE désactivé). Déployable sur Vercel.
 * Source de vérité : lib/generated/mcp-registry.json (généré, voir lib/mcp/registry.ts).
 */
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  CATEGORIES,
  TOTAL,
  RegistryError,
  getComponent,
  componentDetail,
  listComponents,
  searchComponents,
  suggestComposition,
} from "@/lib/mcp/registry";
import { CONNECTOR_NAME, CONNECTOR_VERSION } from "@/lib/mcp/meta";
import { checkRateLimit, clientIp } from "@/lib/mcp/rateLimit";

export const runtime = "nodejs";
// Endpoint public en lecture seule : pas de cache CDN par défaut.
export const dynamic = "force-dynamic";

/** Borne dure d'exécution d'une requête (s). Couplée au timeout interne par outil. */
const MAX_DURATION_S = 30;
/** Timeout interne par exécution d'outil (ms) — défense en profondeur. */
const TOOL_TIMEOUT_MS = 10_000;

const READ_ONLY = { readOnlyHint: true, openWorldHint: false } as const;

/** Emballe une valeur structurée en réponse MCP texte (JSON lisible). */
function ok(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

/** Réponse d'erreur MCP structurée et actionnable (isError:true, jamais un throw nu). */
function fail(message: string, hint?: string) {
  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: JSON.stringify({ error: message, ...(hint ? { hint } : {}) }, null, 2),
      },
    ],
  };
}

/** Exécute la logique d'un outil avec garde-fous : timeout + conversion des erreurs. */
async function guard<T>(run: () => T): Promise<ReturnType<typeof ok> | ReturnType<typeof fail>> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      Promise.resolve().then(run),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new RegistryError("Délai d'exécution dépassé.", "Réessayez.")),
          TOOL_TIMEOUT_MS,
        );
      }),
    ]);
    return ok(result);
  } catch (err) {
    if (err instanceof RegistryError) return fail(err.message, err.hint);
    // Jamais d'erreur nue exposée : message générique actionnable.
    return fail(
      "Erreur interne lors du traitement de la requête.",
      "Vérifiez les paramètres puis réessayez ; si le problème persiste, contactez le mainteneur.",
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const mcpHandler = createMcpHandler(
  (server) => {
    // 1) list_components --------------------------------------------------
    server.registerTool(
      "list_components",
      {
        title: "Lister les composants",
        description:
          "Liste les composants du design system Blueprint Modular (nom + description en une ligne). " +
          "À UTILISER pour parcourir le catalogue ou découvrir ce qui existe dans une catégorie donnée. " +
          "Résultat paginé par curseur (réutiliser 'nextCursor' pour la page suivante). " +
          `Catégories : ${CATEGORIES.join(", ")}.`,
        inputSchema: {
          category: z
            .string()
            .optional()
            .describe("Filtre par catégorie exacte ou partielle (ex. 'Graphiques'). Optionnel."),
          cursor: z
            .string()
            .optional()
            .describe("Curseur de pagination renvoyé par un appel précédent (nextCursor). Optionnel."),
        },
        annotations: { title: "Lister les composants", ...READ_ONLY },
      },
      async ({ category, cursor }) => guard(() => listComponents({ category, cursor })),
    );

    // 2) search_components ------------------------------------------------
    server.registerTool(
      "search_components",
      {
        title: "Rechercher des composants",
        description:
          "Recherche les composants pertinents pour une requête en texte libre (match sur nom, " +
          "description, catégorie et tags), triés par pertinence. À UTILISER quand on cherche un " +
          "composant par fonction ou mot-clé (ex. 'tableau triable', 'graphique', 'upload fichier'). " +
          "Résultat paginé par curseur.",
        inputSchema: {
          query: z.string().min(1).describe("Termes de recherche en langage naturel."),
          cursor: z
            .string()
            .optional()
            .describe("Curseur de pagination renvoyé par un appel précédent (nextCursor). Optionnel."),
        },
        annotations: { title: "Rechercher des composants", ...READ_ONLY },
      },
      async ({ query, cursor }) => guard(() => searchComponents(query, cursor)),
    );

    // 3) get_component ----------------------------------------------------
    server.registerTool(
      "get_component",
      {
        title: "Détail d'un composant",
        description:
          "Retourne le détail complet d'un composant : description, props/types, exemple d'usage et " +
          "composants associés/parents. À UTILISER après list/search pour obtenir la signature exacte " +
          "avant de générer du code. Le nom accepte 'bpm.metric' ou 'metric'.",
        inputSchema: {
          name: z.string().min(1).describe("Nom du composant (ex. 'bpm.metric' ou 'metric')."),
        },
        annotations: { title: "Détail d'un composant", ...READ_ONLY },
      },
      async ({ name }) =>
        guard(() => {
          const c = getComponent(name);
          if (!c) {
            throw new RegistryError(
              `Composant introuvable : "${name}".`,
              "Utilisez search_components (par mot-clé) ou list_components pour trouver le nom exact.",
            );
          }
          return componentDetail(c);
        }),
    );

    // 4) suggest_composition ---------------------------------------------
    server.registerTool(
      "suggest_composition",
      {
        title: "Suggérer une composition",
        description:
          "Suggère une liste de composants Blueprint Modular répondant à un besoin décrit en langage " +
          "naturel. À UTILISER pour partir d'une intention d'écran (ex. 'un dashboard avec des " +
          "métriques et un graphique') et obtenir les briques pertinentes. Réponse bornée.",
        inputSchema: {
          need: z.string().min(1).describe("Description du besoin / de l'écran à construire."),
          limit: z
            .number()
            .int()
            .min(1)
            .optional()
            .describe("Nombre max de suggestions (défaut 8 ; plafonné à 12). Optionnel."),
        },
        annotations: { title: "Suggérer une composition", ...READ_ONLY },
      },
      async ({ need, limit }) => guard(() => suggestComposition(need, limit)),
    );
  },
  {
    serverInfo: { name: CONNECTOR_NAME, version: CONNECTOR_VERSION },
    instructions:
      "Catalogue read-only des composants Blueprint Modular (@blueprint-modular/core). " +
      `${TOTAL} composants. Flux conseillé : list_components / search_components pour explorer, ` +
      "get_component pour la signature exacte (props/exemple), suggest_composition pour partir d'un besoin. " +
      "Aucune écriture, aucune authentification, aucune donnée personnelle.",
  },
  {
    // Endpoint dérivé de basePath → "/api/mcp". SSE désactivé (déprécié + Redis).
    basePath: "/api",
    disableSse: true,
    verboseLogs: process.env.NODE_ENV !== "production",
    maxDuration: MAX_DURATION_S,
  },
);

/** Wrapper transport : rate-limiting par IP avant délégation au handler MCP. */
async function handler(req: Request): Promise<Response> {
  const { ok: allowed, retryAfter } = checkRateLimit(clientIp(req));
  if (!allowed) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: -32029,
          message: `Trop de requêtes. Réessayez dans ${retryAfter}s.`,
        },
        id: null,
      }),
      {
        status: 429,
        headers: { "content-type": "application/json", "retry-after": String(retryAfter) },
      },
    );
  }
  return mcpHandler(req);
}

export { handler as GET, handler as POST, handler as DELETE };
