/**
 * Sandbox IA — aperçu éphémère « Spark » (flux Sketch OFF, no-persist).
 *
 * Lance le flux plan-first du Builder (Spec interne → code bpm.*) jusqu'au point
 * de coupure EN MÉMOIRE et renvoie uniquement le code généré (+ un seed de
 * données d'exemple dérivé du plan). Aucune persistance, aucun déploiement,
 * aucun export :
 *   - AUCUN import Prisma / GeneratedApp.create|update,
 *   - AUCUN appel deploy / export / download,
 *   - le plan (Spec) est généré en interne et N'EST PAS exposé.
 *
 * Sécurité côté appelant (cf. route) : clé LLM serveur (jamais BYOK depuis le
 * body), rate-limit par IP, allowlist d'origine (site Modular). Aucun upload
 * accepté en entrée (contrat strict { prompt } seul).
 */
import { builderAI, type BuilderOutput, type BuilderSpec } from "@/lib/ai/builder";
import { clientIp } from "@/lib/mcp/rateLimit";

export const MAX_PROMPT_LENGTH = 4000;

/** Sous-ensemble du Builder utilisé ici — facilite l'injection en test. */
export interface SparkBuilder {
  buildFromPrompt(
    prompt: string
  ): Promise<{ output: BuilderOutput; spec: BuilderSpec }>;
  generate(prompt: string): Promise<BuilderOutput>;
}

/** Réponse renvoyée au client : code bpm.* + seed. Rien d'autre. */
export interface SparkPreviewResult {
  code: string;
  title: string;
  components: string[];
  /** Données d'exemple en mémoire dérivées du plan (jamais persistées). */
  seed: Record<string, Array<Record<string, string | number | boolean>>>;
}

// ── Validation d'entrée (contrat strict { prompt } seul) ──────────────────────

/** Soit `{ prompt }` (valide), soit `{ error }` (rejeté). */
export interface ParsedBody {
  prompt?: string;
  error?: string;
}

/**
 * N'accepte qu'un objet `{ prompt: string }`. Toute autre clé (file, upload,
 * image, apiKey, provider, designer, palette, plan, deploy, export…) est
 * refusée : pas d'upload en entrée, pas de BYOK, pas d'override du plan.
 */
export function parseSparkPreviewBody(raw: unknown): ParsedBody {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { error: "body must be a JSON object" };
  }
  const keys = Object.keys(raw as Record<string, unknown>);
  const extra = keys.filter((k) => k !== "prompt");
  if (extra.length > 0) {
    return { error: `unexpected field(s): ${extra.join(", ")}` };
  }
  const prompt = (raw as { prompt?: unknown }).prompt;
  if (typeof prompt !== "string" || !prompt.trim()) {
    return { error: "prompt required" };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { error: `prompt too long (max ${MAX_PROMPT_LENGTH})` };
  }
  return { prompt: prompt.trim() };
}

// ── Allowlist d'origine (site Modular) ────────────────────────────────────────

const DEFAULT_ALLOWED_ORIGINS = [
  "https://blueprint-modular.com",
  "https://www.blueprint-modular.com",
  "http://localhost:3000",
];

export function allowedOrigins(): string[] {
  const env = process.env.SANDBOX_PREVIEW_ALLOWED_ORIGINS;
  if (env && env.trim()) {
    return env
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return DEFAULT_ALLOWED_ORIGINS;
}

/**
 * Autorise l'accès si :
 *  - un jeton serveur partagé est configuré (SANDBOX_PREVIEW_TOKEN) et fourni
 *    via l'en-tête `x-sandbox-preview-token` (appels serveur-à-serveur), OU
 *  - l'en-tête Origin appartient à l'allowlist (fetch depuis le site Modular).
 */
export function isRequestAllowed(req: Request): boolean {
  const token = process.env.SANDBOX_PREVIEW_TOKEN;
  if (token && token.trim()) {
    const provided = req.headers.get("x-sandbox-preview-token");
    if (provided && provided === token) return true;
  }
  const origin = req.headers.get("origin");
  if (!origin) return false;
  return allowedOrigins().includes(origin);
}

// ── Rate-limit dédié (fenêtre glissante en mémoire, par IP) ───────────────────

const RL_WINDOW_MS = 60_000;
function rlMax(): number {
  const env = Number(process.env.SANDBOX_PREVIEW_RATE_LIMIT);
  return Number.isFinite(env) && env > 0 ? Math.floor(env) : 10;
}
const rlHits = new Map<string, number[]>();

export interface RateLimitResult {
  ok: boolean;
  retryAfter: number;
  remaining: number;
}

export function checkSparkRateLimit(req: Request): RateLimitResult {
  const ip = clientIp(req);
  const max = rlMax();
  const now = Date.now();
  const cutoff = now - RL_WINDOW_MS;
  const timestamps = (rlHits.get(ip) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= max) {
    const retryAfter = Math.ceil((timestamps[0] + RL_WINDOW_MS - now) / 1000);
    rlHits.set(ip, timestamps);
    return { ok: false, retryAfter: Math.max(1, retryAfter), remaining: 0 };
  }
  timestamps.push(now);
  rlHits.set(ip, timestamps);
  if (rlHits.size > 5000) {
    for (const [key, ts] of rlHits) {
      if (ts.every((t) => t <= cutoff)) rlHits.delete(key);
    }
  }
  return { ok: true, retryAfter: 0, remaining: max - timestamps.length };
}

/** Réinitialise l'état du rate-limit — réservé aux tests. */
export function __resetSparkRateLimit(): void {
  rlHits.clear();
}

// ── Seed déterministe dérivé du plan (jamais persisté) ────────────────────────

function sampleValue(
  fieldName: string,
  fieldType: string,
  row: number
): string | number | boolean {
  const type = (fieldType || "").toLowerCase();
  if (/bool/.test(type)) return row % 2 === 0;
  if (/int|number|float|decimal|num/.test(type)) return (row + 1) * 10;
  if (/date|time/.test(type)) {
    const d = new Date(Date.UTC(2025, 0, row + 1));
    return d.toISOString().slice(0, 10);
  }
  return `${fieldName} ${row + 1}`;
}

/**
 * Construit un seed de données d'exemple (3 lignes par entité) à partir des
 * entités du plan. Pur et déterministe : aucun appel LLM, aucune écriture.
 */
export function buildSeedFromSpec(
  spec: BuilderSpec | null
): SparkPreviewResult["seed"] {
  const seed: SparkPreviewResult["seed"] = {};
  if (!spec || !Array.isArray(spec.entities)) return seed;
  for (const entity of spec.entities) {
    if (!entity?.name || !Array.isArray(entity.fields)) continue;
    const rows: Array<Record<string, string | number | boolean>> = [];
    for (let r = 0; r < 3; r++) {
      const row: Record<string, string | number | boolean> = {};
      for (const field of entity.fields) {
        if (!field?.name) continue;
        row[field.name] = sampleValue(field.name, field.type, r);
      }
      rows.push(row);
    }
    seed[entity.name] = rows;
  }
  return seed;
}

// ── Orchestrateur éphémère ────────────────────────────────────────────────────

/**
 * Exécute le flux Sketch OFF jusqu'au point no-persist et renvoie code + seed.
 *
 * Plan-first : `buildFromPrompt` génère la Spec (plan) puis le code, le tout en
 * mémoire. En cas d'échec de génération du plan (JSON invalide…), repli sur le
 * `generate()` one-shot — sans plan, donc sans seed. Le plan n'est jamais
 * renvoyé. Aucune persistance, aucun déploiement, aucun export.
 */
export async function runSparkPreview(
  prompt: string,
  builder: SparkBuilder = builderAI
): Promise<SparkPreviewResult> {
  let output: BuilderOutput;
  let spec: BuilderSpec | null = null;
  try {
    const built = await builder.buildFromPrompt(prompt);
    output = built.output;
    spec = built.spec;
  } catch {
    output = await builder.generate(prompt);
  }
  return {
    code: output.code,
    title: output.title,
    components: output.components,
    seed: buildSeedFromSpec(spec),
  };
}
