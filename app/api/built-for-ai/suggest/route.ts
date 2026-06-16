/**
 * Route interne de la page « Built for AI » — démo read-only de suggest_composition.
 *
 * Cette route N'INVENTE PAS de logique : elle appelle exactement les fonctions du
 * connecteur MCP (lib/mcp/registry.suggestComposition + getComponent), celles que le
 * serveur MCP (app/api/mcp/route.ts) expose. L'exécution est in-process — donc fiable
 * et sans dépendance au réseau externe (l'hôte mcp.blueprint-modular.com peut être
 * inatteignable depuis le serveur). Aucune capacité d'écriture : strictement read-only.
 *
 * Vérification de cohérence : chaque suggestion est confirmée par get_component
 * (verified) — la composition renvoyée ne référence que des composants réels du barrel.
 *
 * En cas d'erreur inattendue, on renvoie le snapshot pré-capturé (source:"fallback")
 * pour que la démo ne casse jamais. Les erreurs de validation (besoin vide) restent
 * des 400 structurés et actionnables.
 */
import { NextResponse } from "next/server";
import {
  suggestComposition,
  getComponent,
  RegistryError,
  SUGGEST_DEFAULT,
  SUGGEST_MAX,
} from "@/lib/mcp/registry";
import { FALLBACK_RESULT, type DemoResult, type SuggestResponse } from "@/lib/built-for-ai/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Exécute la vraie logique d'outil et enrichit chaque suggestion (slug + vérification barrel). */
function runSuggest(need: string, limit: number): DemoResult {
  const r = suggestComposition(need, limit);
  return {
    need: r.need,
    count: r.count,
    suggestions: r.suggestions.map((s) => ({
      name: s.name,
      slug: s.name.replace(/^bpm\./, "").toLowerCase(),
      category: s.category,
      description: s.description,
      why: s.why,
      // Vérification de cohérence : get_component confirme l'existence dans le barrel.
      verified: Boolean(getComponent(s.name)),
      meaning: s.meaning ?? null,
    })),
  };
}

export async function POST(req: Request): Promise<Response> {
  let need = "";
  let limit = SUGGEST_DEFAULT;

  try {
    const body = (await req.json()) as { need?: unknown; limit?: unknown };
    if (typeof body?.need === "string") need = body.need.trim();
    if (typeof body?.limit === "number" && Number.isInteger(body.limit)) {
      limit = Math.min(SUGGEST_MAX, Math.max(1, body.limit));
    }
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Corps de requête invalide.",
        hint: "Envoyez un JSON { need: string, limit?: number }.",
      },
      { status: 400 },
    );
  }

  try {
    const result = runSuggest(need, limit);
    const payload: SuggestResponse = {
      ok: true,
      source: "mcp-registry",
      tool: "suggest_composition",
      request: { need, limit },
      result,
    };
    return NextResponse.json(payload);
  } catch (err) {
    // Erreur de validation (besoin vide…) : 400 structuré, actionnable.
    if (err instanceof RegistryError) {
      return NextResponse.json(
        { ok: false, error: err.message, hint: err.hint },
        { status: 400 },
      );
    }
    // Erreur inattendue : la démo ne casse pas — snapshot pré-capturé.
    const payload: SuggestResponse = {
      ok: true,
      source: "fallback",
      tool: "suggest_composition",
      request: { need: need || FALLBACK_RESULT.need, limit },
      result: FALLBACK_RESULT,
    };
    return NextResponse.json(payload);
  }
}
