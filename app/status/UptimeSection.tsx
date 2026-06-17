import type { ServiceRow, StatusLevel } from "@/lib/status/types";

/**
 * Barre d'uptime 90 jours d'un service. Composant de présentation pur (rendu
 * serveur, aucune interactivité) : le survol utilise l'attribut HTML `title`,
 * donc pas de directive 'use client'. Couleurs via tokens var(--bpm-*).
 */

export interface UptimeLabels {
  name: string;
  ninetyDaysAgo: string;
  today: string;
  uptimeSuffix: string;
  none: string;
  collectingNote: string;
  level: Record<StatusLevel | "no_data", string>;
}

function barColor(status: StatusLevel | "no_data"): string {
  switch (status) {
    case "operational":
      return "var(--bpm-success)";
    case "degraded":
      return "var(--bpm-accent-amber)";
    case "outage":
      return "var(--bpm-error)";
    default:
      return "var(--bpm-border)";
  }
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

const EMPTY_90: ServiceRow["uptime90"] = Array.from({ length: 90 }, (_, i) => ({
  date: `no-data-${i}`,
  status: "no_data" as const,
  uptime: null,
}));

export function UptimeSection({ row, labels }: { row: ServiceRow; labels: UptimeLabels }) {
  const uptime90 = row.uptime90.length === 90 ? row.uptime90 : EMPTY_90;
  const uptimePct =
    row.uptimePct90 != null ? `${row.uptimePct90.toFixed(1)}` : labels.none;
  const hasData = row.uptime90.some((d) => d.uptime != null);

  return (
    <section style={{ marginBottom: 40 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontWeight: 600 }}>{labels.name}</span>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: "var(--bpm-radius-sm, 6px)",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: levelChipColor(row.status),
            color: "var(--bpm-text-inverse, #fff)",
          }}
        >
          {labels.level[row.status]}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3, height: 32, alignItems: "stretch", marginTop: 6 }}>
        {uptime90.map((d) => {
          const tip = `${d.date} — ${labels.level[d.status]}${d.uptime != null ? ` ${d.uptime}%` : ""}`;
          return (
            <div
              key={d.date}
              title={tip}
              style={{
                flex: 1,
                minWidth: 0,
                height: 32,
                borderRadius: 3,
                background: barColor(d.status),
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          color: "var(--bpm-text-secondary)",
          marginTop: 6,
          width: "100%",
        }}
      >
        <span style={{ flex: 1, textAlign: "left" }}>{labels.ninetyDaysAgo}</span>
        <span style={{ flex: 0, textAlign: "center", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
          {uptimePct}
          {uptimePct === labels.none ? "" : labels.uptimeSuffix}
        </span>
        <span style={{ flex: 1, textAlign: "right" }}>{labels.today}</span>
      </div>
      {!hasData ? (
        <div style={{ fontSize: "0.75rem", color: "var(--bpm-text-muted)", marginTop: 6 }}>
          {labels.collectingNote}
        </div>
      ) : null}
    </section>
  );
}
