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

/**
 * Réponse renvoyée au client : HTML statique rendu par le Maker + indicateur de
 * repli. AUCUNE source app (ni TSX, ni plan) — le Maker rend déjà l'écran bpm.*
 * en HTML autoportant ; le proxy ne fait que relayer.
 */
export interface SparkPreviewResult {
  /** HTML autoportant (markup bpm.* + CSS inline) à injecter en iframe `srcdoc`. */
  html: string;
  /** Vrai si le Maker a servi un rendu de repli (aperçu partiel). */
  degraded: boolean;
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
  "https://app.blueprint-modular.com",
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
  /** HTML statique de l'écran bpm.* rendu côté Maker (jamais de source). */
  html?: string;
  degraded?: boolean;
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

/**
 * Relaie le prompt à l'API interne du Maker et renvoie le HTML rendu mappé sur le
 * contrat public `{ html, degraded }`. Aucune persistance, aucun déploiement,
 * aucun export ; le secret interne et l'URL Maker ne fuient jamais vers le client
 * (messages FR neutres en cas d'erreur). Le Maker garantit déjà l'absence de
 * source dans `html`.
 */
export async function runSparkPreview(prompt: string): Promise<SparkPreviewResult> {
  // Gardes de configuration séparées : on journalise PRÉCISÉMENT côté serveur
  // laquelle des deux variables manque (secret vs URL), mais le message renvoyé
  // au client reste un FR générique identique dans les deux cas — aucune fuite
  // du nom de la variable manquante dans le payload public (cf. bord #94).
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  const makerUrl = process.env.MAKER_INTERNAL_URL?.trim();
  if (!secret) {
    console.error("[spark-preview] config manquante côté serveur: secret (INTERNAL_API_SECRET)");
    throw new Error("Service de génération mal configuré.");
  }
  if (!makerUrl) {
    console.error("[spark-preview] config manquante côté serveur: url (MAKER_INTERNAL_URL)");
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

  const html = typeof data.html === "string" ? data.html : "";
  if (!html) {
    throw new Error("Réponse invalide du générateur.");
  }
  return { html, degraded: data.degraded === true };
}
