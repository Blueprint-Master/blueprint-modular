import { getDict } from "@/lib/i18n/server";
import { fmt } from "@/lib/i18n";
import { getStatusPayload } from "@/lib/status/data";
import type { StatusLevel } from "@/lib/status/types";
import { UptimeSection, type UptimeLabels } from "./UptimeSection";

export const dynamic = "force-dynamic";
export const revalidate = 60;

function fmtTime(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-GB", {
      timeZone: "Europe/Paris",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function fmtDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", {
      timeZone: "Europe/Paris",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function bannerStyle(status: StatusLevel | "no_data"): React.CSSProperties {
  switch (status) {
    case "operational":
      return { background: "var(--bpm-success-soft)", color: "var(--bpm-success-text)", border: "1px solid var(--bpm-success)" };
    case "outage":
      return { background: "var(--bpm-error-soft)", color: "var(--bpm-error-text)", border: "1px solid var(--bpm-error)" };
    case "degraded":
      return { background: "var(--bpm-accent-soft)", color: "var(--bpm-accent-amber)", border: "1px solid var(--bpm-accent-amber)" };
    default:
      return { background: "var(--bpm-bg-secondary)", color: "var(--bpm-text-secondary)", border: "1px solid var(--bpm-border)" };
  }
}

function bannerIcon(status: StatusLevel | "no_data"): string {
  return status === "operational" ? "✓" : status === "degraded" ? "⚠" : status === "outage" ? "✕" : "•";
}

function levelChipColor(status: StatusLevel | "no_data"): string {
  switch (status) {
    case "operational":
      return "var(--bpm-success)";
    case "degraded":
      return "var(--bpm-accent-amber)";
    case "outage":
      return "var(--bpm-error)";
    default:
      return "var(--bpm-text-muted)";
  }
}

export default async function StatusPage() {
  const { locale, dict } = await getDict();
  const s = dict.status;
  const payload = await getStatusPayload();

  const levelLabels: Record<StatusLevel | "no_data", string> = {
    operational: s.levelOperational,
    degraded: s.levelDegraded,
    outage: s.levelOutage,
    no_data: s.levelNoData,
  };

  const banner =
    payload.status === "operational"
      ? s.bannerOperational
      : payload.status === "degraded"
        ? s.bannerDegraded
        : payload.status === "outage"
          ? s.bannerOutage
          : s.bannerNoData;

  const labelsFor = (key: "vitrine" | "mcp"): UptimeLabels => ({
    name: s.services[key],
    ninetyDaysAgo: s.ninetyDaysAgo,
    today: s.today,
    uptimeSuffix: s.uptimeSuffix,
    none: s.none,
    collectingNote: s.collectingNote,
    level: levelLabels,
  });

  // Agrégats "Aujourd'hui".
  const checksToday = payload.services.reduce((acc, svc) => acc + svc.checksToday, 0);
  const uptimeVals = payload.services.map((svc) => svc.uptimePct90).filter((v): v is number => v != null);
  const overallUptime =
    uptimeVals.length > 0 ? uptimeVals.reduce((a, b) => a + b, 0) / uptimeVals.length : null;
  const latencyVals = payload.services.map((svc) => svc.latencyMs).filter((v): v is number => v != null);
  const avgLatency =
    latencyVals.length > 0 ? Math.round(latencyVals.reduce((a, b) => a + b, 0) / latencyVals.length) : null;
  const lastChecked = payload.services
    .map((svc) => svc.lastChecked)
    .filter((v): v is string => v != null)
    .sort()
    .at(-1);

  const cellStyle: React.CSSProperties = {
    padding: "16px 24px",
    borderRight: "1px solid var(--bpm-border)",
  };
  const cellLabel: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "var(--bpm-text-secondary)",
    marginBottom: 4,
  };
  const cellValue: React.CSSProperties = {
    fontSize: "1.4rem",
    fontWeight: 700,
    color: "var(--bpm-text-primary)",
  };

  return (
    <div
      style={{
        background: "var(--bpm-bg-primary)",
        fontFamily: "var(--bpm-font-sans, system-ui, sans-serif)",
        color: "var(--bpm-text-primary)",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "48px 24px" }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{s.brand}</span>
            <span style={{ color: "var(--bpm-text-secondary)", fontWeight: 400 }}>{s.suffix}</span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--bpm-text-secondary)" }}>
            {fmt(s.updated, { time: fmtTime(payload.generatedAt, locale) })}
          </span>
        </header>

        <div
          style={{
            minHeight: 52,
            padding: "12px 16px",
            borderRadius: "var(--bpm-radius, 8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: "0.95rem",
            fontWeight: 600,
            marginBottom: 40,
            ...bannerStyle(payload.status),
          }}
        >
          {bannerIcon(payload.status)} {banner}
        </div>

        {payload.services.map((svc) => (
          <UptimeSection key={svc.key} row={svc} labels={labelsFor(svc.key)} />
        ))}

        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--bpm-text-secondary)",
              marginBottom: 16,
            }}
          >
            {s.todayTitle}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              borderTop: "1px solid var(--bpm-border)",
              borderBottom: "1px solid var(--bpm-border)",
            }}
          >
            <div style={{ ...cellStyle, paddingLeft: 0 }}>
              <div style={cellLabel}>{s.metricChecks}</div>
              <div style={cellValue}>{checksToday}</div>
            </div>
            <div style={cellStyle}>
              <div style={cellLabel}>{s.metricUptime}</div>
              <div style={cellValue}>{overallUptime != null ? `${overallUptime.toFixed(1)}%` : s.none}</div>
            </div>
            <div style={cellStyle}>
              <div style={cellLabel}>{s.metricLatency}</div>
              <div style={cellValue}>{avgLatency != null ? `${avgLatency} ms` : s.none}</div>
            </div>
            <div style={{ ...cellStyle, borderRight: "none", paddingRight: 0 }}>
              <div style={cellLabel}>{s.metricLastCheck}</div>
              <div style={{ ...cellValue, fontSize: "0.95rem", color: levelChipColor(payload.status) }}>
                {lastChecked ? fmtTime(lastChecked, locale) : s.none}
              </div>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--bpm-text-secondary)",
              marginBottom: 16,
            }}
          >
            {s.incidentsTitle}
          </h2>
          {payload.incidents.length === 0 ? (
            <div style={{ fontSize: "0.875rem", color: "var(--bpm-text-secondary)" }}>
              ✓ {s.incidentsNone}
            </div>
          ) : (
            <div>
              {payload.incidents.map((inc, i) => (
                <div
                  key={inc.id}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      i < payload.incidents.length - 1 ? "1px solid var(--bpm-border)" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--bpm-text-secondary)" }}>
                      {fmtDate(inc.date, locale)}
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {s.services[inc.service]}
                      {inc.duration ? ` · ${inc.duration}` : ""}
                    </span>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--bpm-radius-sm, 6px)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: inc.status === "resolved" ? "var(--bpm-success)" : "var(--bpm-accent-amber)",
                        color: "var(--bpm-text-inverse, #fff)",
                      }}
                    >
                      {inc.status === "resolved" ? s.incidentResolved : s.incidentOngoing}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--bpm-text-secondary)", marginTop: 4 }}>
                    {inc.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer
          style={{
            marginTop: 48,
            fontSize: "0.75rem",
            color: "var(--bpm-text-secondary)",
            textAlign: "center",
          }}
        >
          {s.footerNote}
        </footer>
      </div>
    </div>
  );
}
