/**
 * Agrégation des mesures de la sonde (`status_check`) pour la page /status.
 *
 * Contrairement au modèle Maker (qui RECALCULAIT l'uptime à partir de l'activité
 * applicative et d'un health interne — angle mort : tombe avec le service), on
 * lit ici de VRAIS points de mesure de disponibilité publique persistés par la
 * sonde. La fenêtre 90 jours se remplit donc dès le premier passage du cron.
 *
 * Public, aucune donnée personnelle (uniquement l'état d'endpoints publics).
 */
import { prisma } from "@/lib/prisma";
import type {
  ServiceKey,
  ServiceRow,
  StatusIncident,
  StatusLevel,
  StatusPayload,
  UptimeDay,
} from "./types";

const SERVICES: ServiceKey[] = ["vitrine", "mcp"];
const DAY_MS = 24 * 60 * 60 * 1000;

/** Seuils d'uptime journalier → statut. */
function dayStatus(ratePct: number): StatusLevel {
  if (ratePct >= 99.5) return "operational";
  if (ratePct >= 90) return "degraded";
  return "outage";
}

type CheckRow = {
  service: string;
  ok: boolean;
  latencyMs: number | null;
  checkedAt: Date;
};

/** Construit la barre 90 jours d'un service à partir de ses mesures. */
function buildUptime90(checks: CheckRow[]): UptimeDay[] {
  const now = new Date();
  const out: UptimeDay[] = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    d.setUTCHours(0, 0, 0, 0);
    const next = new Date(d.getTime() + DAY_MS);
    const dateStr = d.toISOString().slice(0, 10);

    const dayChecks = checks.filter((c) => c.checkedAt >= d && c.checkedAt < next);
    if (dayChecks.length === 0) {
      out.push({ date: dateStr, status: "no_data", uptime: null });
      continue;
    }
    const okCount = dayChecks.filter((c) => c.ok).length;
    const rate = (okCount / dayChecks.length) * 100;
    out.push({ date: dateStr, status: dayStatus(rate), uptime: Math.round(rate * 10) / 10 });
  }
  return out;
}

/** Regroupe les mesures en échec consécutives (30 j) en incidents par service. */
function buildIncidents(service: ServiceKey, checks: CheckRow[]): StatusIncident[] {
  const thirtyDaysAgo = Date.now() - 30 * DAY_MS;
  const recent = checks
    .filter((c) => c.checkedAt.getTime() >= thirtyDaysAgo)
    .sort((a, b) => a.checkedAt.getTime() - b.checkedAt.getTime());

  const incidents: StatusIncident[] = [];
  let runStart: Date | null = null;
  let runEnd: Date | null = null;

  const flush = (resolved: boolean) => {
    if (!runStart || !runEnd) return;
    const durationMs = runEnd.getTime() - runStart.getTime();
    const duration =
      durationMs >= 60_000
        ? `${Math.round(durationMs / 60_000)} min`
        : `${Math.max(1, Math.round(durationMs / 1000))} s`;
    incidents.push({
      id: `inc-${service}-${runStart.getTime()}`,
      service,
      date: runStart.toISOString(),
      title: service === "vitrine" ? "Vitrine unreachable" : "MCP endpoint unreachable",
      description:
        service === "vitrine"
          ? "The public site did not respond to the availability probe."
          : "The MCP endpoint did not respond to the availability probe.",
      status: resolved ? "resolved" : "ongoing",
      duration,
    });
  };

  for (const c of recent) {
    if (!c.ok) {
      if (runStart == null) runStart = c.checkedAt;
      runEnd = c.checkedAt;
    } else if (runStart != null) {
      flush(true);
      runStart = null;
      runEnd = null;
    }
  }
  // Séquence d'échec encore ouverte à la fin → incident en cours.
  if (runStart != null) flush(false);

  return incidents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
}

/** Pire statut parmi une liste (no_data ignoré). */
function worst(levels: (StatusLevel | "no_data")[]): StatusLevel | "no_data" {
  const rank: Record<string, number> = { operational: 0, degraded: 1, outage: 2 };
  let acc: StatusLevel | "no_data" = "no_data";
  for (const l of levels) {
    if (l === "no_data") continue;
    if (acc === "no_data" || rank[l] > rank[acc]) acc = l;
  }
  return acc;
}

export async function getStatusPayload(): Promise<StatusPayload> {
  const generatedAt = new Date().toISOString();
  const ninetyDaysAgo = new Date(Date.now() - 90 * DAY_MS);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  try {
    const rows = await prisma.statusCheck.findMany({
      where: { checkedAt: { gte: ninetyDaysAgo } },
      select: { service: true, ok: true, status: true, latencyMs: true, checkedAt: true },
      orderBy: { checkedAt: "asc" },
    });

    const services: ServiceRow[] = SERVICES.map((key) => {
      const checks: CheckRow[] = rows.filter((r) => r.service === key);
      const uptime90 = buildUptime90(checks);
      const measured = uptime90.filter((d) => d.uptime != null);
      const uptimePct90 =
        measured.length > 0
          ? Math.round((measured.reduce((s, d) => s + (d.uptime ?? 0), 0) / measured.length) * 10) / 10
          : null;

      const latest = checks.length > 0 ? checks[checks.length - 1] : null;
      const lastOk = [...checks].reverse().find((c) => c.ok && c.latencyMs != null);
      const checksToday = checks.filter((c) => c.checkedAt >= todayStart).length;

      return {
        key,
        status: latest ? (latest.ok ? "operational" : "outage") : "no_data",
        uptime90,
        uptimePct90,
        lastChecked: latest ? latest.checkedAt.toISOString() : null,
        latencyMs: lastOk?.latencyMs ?? null,
        checksToday,
      } satisfies ServiceRow;
    });

    const incidents = SERVICES.flatMap((key) =>
      buildIncidents(key, rows.filter((r) => r.service === key)),
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      status: worst(services.map((s) => s.status)),
      services,
      incidents,
      generatedAt,
    };
  } catch (err) {
    console.error("[status] getStatusPayload error:", err);
    return {
      status: "no_data",
      services: SERVICES.map((key) => ({
        key,
        status: "no_data",
        uptime90: [],
        uptimePct90: null,
        lastChecked: null,
        latencyMs: null,
        checksToday: 0,
      })),
      incidents: [],
      generatedAt,
    };
  }
}
