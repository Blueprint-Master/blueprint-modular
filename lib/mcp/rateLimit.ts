/**
 * Rate-limiting basique par IP — fenêtre glissante en mémoire.
 *
 * Best-effort : l'état vit dans l'instance serverless (non partagé entre instances).
 * Suffisant pour protéger un endpoint catalogue public read-only contre les abus
 * triviaux, sans dépendance externe (pas de Redis). Stateless côté données : aucune
 * donnée de conversation n'est stockée — uniquement des compteurs IP éphémères.
 */
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 120; // par IP et par fenêtre

const hits = new Map<string, number[]>();

/** Extrait l'IP cliente des en-têtes de proxy (Vercel / nginx). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  ok: boolean;
  /** Secondes avant de pouvoir réessayer (si bloqué). */
  retryAfter: number;
  remaining: number;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  const timestamps = (hits.get(ip) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000);
    hits.set(ip, timestamps);
    return { ok: false, retryAfter: Math.max(1, retryAfter), remaining: 0 };
  }

  timestamps.push(now);
  hits.set(ip, timestamps);

  // Purge opportuniste pour borner la mémoire.
  if (hits.size > 5000) {
    for (const [key, ts] of hits) {
      if (ts.every((t) => t <= cutoff)) hits.delete(key);
    }
  }

  return { ok: true, retryAfter: 0, remaining: MAX_REQUESTS - timestamps.length };
}

export { WINDOW_MS, MAX_REQUESTS };
