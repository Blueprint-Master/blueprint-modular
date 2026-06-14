/**
 * Sandbox IA — aperçu éphémère « Spark » : PROXY serveur→serveur vers l'API
 * interne du Maker.
 *
 * Le moteur de génération ne vit plus ici : il est porté par le Maker
 * (`POST /api/internal/spark-preview`, pipeline prompt → AppSpec → bpm.*). Cette
 * couche ne fait plus que :
 *   - valider le contrat strict { prompt } seul (aucun upload / BYOK / plan),
 *   - appliquer le bord de sécurité (allowlist d'origine, rate-limit par IP),
 *   - relayer le prompt au Maker avec le secret interne (Bearer),
 *   - mapper la réponse Maker vers le contrat public { code, title, components, seed }.
 *
 * No-persist : aucune écriture DB, aucun déploiement, aucun export ici ; le Maker
 * lui-même n'expose qu'un rendu éphémère en mémoire (pas de GeneratedApp, pas de
 * Docker). Le secret interne et l'URL Maker ne transitent jamais vers le client.
 *
 * Sécurité côté appelant (cf. route) : rate-limit par IP, allowlist d'origine
 * (site Modular), contrat strict { prompt } seul. Le secret/URL Maker restent
 * strictement côté serveur (variables d'environnement).
 */
import { clientIp } from "@/lib/mcp/rateLimit";

export const MAX_PROMPT_LENGTH = 4000;

/** Réponse renvoyée au client : code bpm.* + métadonnées. Rien d'interne. */
export interface SparkPreviewResult {
  code: string;
  title: string;
  components: string[];
  /**
   * Données d'exemple en mémoire. Le Maker n'expose pas le plan (anti-extraction),
   * donc ce champ reste vide côté proxy ; conservé pour la compatibilité du contrat.
   */
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

// ── Proxy vers l'API interne Maker ────────────────────────────────────────────

/** Le rendu Maker (spec → build) peut prendre plusieurs dizaines de secondes. */
const MAKER_TIMEOUT_MS = 120_000;

/** Forme attendue de la réponse Maker `/api/internal/spark-preview`. */
interface MakerSparkResponse {
  rendered?: Record<string, string>;
  meta?: { appName?: string | null; tier?: string };
  error?: string;
}

/**
 * URL interne du Maker (serveur→serveur, jamais publique). Lue depuis
 * `MAKER_INTERNAL_URL` (ex. http://localhost:3001 sur bpm-prod). Jamais hardcodée.
 */
function makerBaseUrl(): string {
  const url = process.env.MAKER_INTERNAL_URL?.trim();
  if (!url) {
    throw new Error("MAKER_INTERNAL_URL non configurée côté serveur.");
  }
  return url.replace(/\/+$/, "");
}

/** Extrait le rendu bpm.* principal de la map de fichiers renvoyée par le Maker. */
function pickRenderedCode(rendered: Record<string, string> | undefined): string {
  if (!rendered) return "";
  return rendered["app/_page-content.tsx"] ?? rendered["app/page.tsx"] ?? "";
}

/** Liste best-effort des composants bpm.* référencés dans le code rendu. */
function extractComponents(code: string): string[] {
  const set = new Set<string>();
  const re = /\bbpm\.(\w+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(code)) !== null) set.add(m[1]);
  return [...set];
}

/**
 * Relaie le prompt à l'API interne du Maker et renvoie le rendu bpm.* mappé sur
 * le contrat public. Aucune persistance, aucun déploiement, aucun export ; le
 * secret interne et l'URL Maker ne fuient jamais vers le client (messages FR
 * neutres en cas d'erreur).
 */
export async function runSparkPreview(prompt: string): Promise<SparkPreviewResult> {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (!secret) {
    throw new Error("Service de génération mal configuré.");
  }

  let res: Response;
  try {
    res = await fetch(`${makerBaseUrl()}/api/internal/spark-preview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ prompt, tier: "spark" }),
      signal: AbortSignal.timeout(MAKER_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Le générateur a mis trop de temps à répondre. Réessayez.");
    }
    throw new Error("Service de génération indisponible. Réessayez dans un instant.");
  }

  if (!res.ok) {
    // Jamais de fuite d'URL/secret/stack : message FR neutre.
    throw new Error("La génération a échoué. Réessayez dans un instant.");
  }

  let data: MakerSparkResponse;
  try {
    data = (await res.json()) as MakerSparkResponse;
  } catch {
    throw new Error("Réponse invalide du générateur.");
  }

  const code = pickRenderedCode(data.rendered);
  return {
    code,
    title: (data.meta?.appName ?? "").toString(),
    components: extractComponents(code),
    seed: {},
  };
}
