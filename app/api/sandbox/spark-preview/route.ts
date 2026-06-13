/**
 * POST /api/sandbox/spark-preview
 *
 * Route éphémère appelée par la sandbox IA du site Modular. Lance le flux
 * Sketch OFF (plan-first → code bpm.*) EN MÉMOIRE et renvoie uniquement le code
 * généré + un seed d'exemple. Mode strictement éphémère :
 *   - accepte { prompt } SEUL (aucun upload, aucun BYOK, aucun plan injecté),
 *   - NE crée AUCUN enregistrement (pas de GeneratedApp.create/update),
 *   - NE déploie pas, NE renvoie AUCUNE voie d'export/download,
 *   - le plan (Spec) reste interne et n'est pas exposé.
 *
 * NE réutilise PAS /api/generate (qui, lui, porterait session NextAuth +
 * billing + brouillon DB). Ici : clé LLM serveur (via getProvider, jamais
 * fournie par le client), rate-limit par IP, allowlist d'origine (site Modular).
 */
import { NextResponse } from "next/server";
import {
  parseSparkPreviewBody,
  isRequestAllowed,
  checkSparkRateLimit,
  runSparkPreview,
} from "@/lib/sandbox/spark-preview";

export const dynamic = "force-dynamic";
/** La génération IA (plan + code) peut prendre 30–60s. */
export const maxDuration = 60;

export async function POST(req: Request) {
  // 1. Allowlist d'origine / jeton serveur.
  if (!isRequestAllowed(req)) {
    return NextResponse.json({ error: "origin not allowed" }, { status: 403 });
  }

  // 2. Rate-limit par IP.
  const rl = checkSparkRateLimit(req);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  // 3. Contrat strict { prompt } seul (refuse tout upload / champ superflu).
  const raw = await req.json().catch(() => null);
  const parsed = parseSparkPreviewBody(raw);
  if (!parsed.prompt) {
    return NextResponse.json(
      { error: parsed.error ?? "prompt required" },
      { status: 400 }
    );
  }

  // 4. Flux éphémère jusqu'au point no-persist : code + seed en mémoire.
  try {
    const result = await runSparkPreview(parsed.prompt);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
