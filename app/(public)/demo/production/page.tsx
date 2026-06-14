// @ts-nocheck
import Link from "next/link";
import { getCachedDemoProductionData } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import { getLocale } from "@/lib/i18n/server";
import { DemoErrorBoundary } from "./DemoErrorBoundary";
import { STR } from "./strings";
import {
  Title,
  Metric,
  LineChart,
  Progress,
  Table,
  Panel,
  Grid,
  Column,
  Button,
} from "@/components/bpm";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

function parsePeriod(s: string | null): DemoPeriod {
  if (s === "7d" || s === "30d" || s === "90d") return s;
  return "30d";
}

function DemoUnavailableFallback({ t }: { t: (typeof STR)["fr"] }) {
  return (
    <div
      className="min-h-[40vh] flex items-center justify-center px-4"
      style={{ background: "var(--bpm-bg-primary, #ffffff)" }}
    >
      <div
        className="rounded-lg border p-6 max-w-md w-full text-center"
        style={{
          borderColor: "var(--bpm-border)",
          background: "var(--bpm-bg-primary)",
          color: "var(--bpm-text-primary)",
        }}
      >
        <h2 className="text-lg font-semibold mb-2">{t.unavailableTitle}</h2>
        <p className="text-sm mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
          {t.unavailableBody}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/demo/production"
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.retry}
          </Link>
          <Link
            href="/"
            className="px-4 py-2 rounded text-sm font-medium underline"
            style={{ color: "var(--bpm-accent-cyan)" }}
          >
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function DemoProductionPage({
  searchParams,
}: {
  searchParams?: Promise<{ period?: string }> | { period?: string };
}) {
  const locale = await getLocale();
  const t = STR[locale];
  let period: DemoPeriod = "30d";
  let data: Awaited<ReturnType<typeof getCachedDemoProductionData>>;

  try {
    const raw = searchParams != null
      ? typeof (searchParams as Promise<unknown>).then === "function"
        ? await (searchParams as Promise<{ period?: string }>)
        : (searchParams as { period?: string })
      : {};
    period = parsePeriod(raw?.period ?? null);
    data = await getCachedDemoProductionData(period);
  } catch {
    return <DemoUnavailableFallback t={t} />;
  }

  const metrics = data.metrics;
  const lines = data.lines ?? [];
  const alerts = data.alerts ?? [];
  const criticalAlerts = alerts.filter((a: any) => a.severity === "critical").slice(0, 3);

  return (
    <DemoErrorBoundary>
      <div className="space-y-6">
        <Title level={1}>{t.overviewTitle}</Title>

        {metrics ? (
          <>
            <Grid cols={4}>
              <Column>
                <Metric
                  label={t.metricGlobalTRS}
                  value={`${Number(metrics.globalTRS) ?? 0} %`}
                  border
                />
              </Column>
              <Column>
                <Metric
                  label={t.metricRejectRate}
                  value={
                    metrics.totalProduction > 0
                      ? `${((Number(metrics.totalRejects) / metrics.totalProduction) * 100).toFixed(2)} %`
                      : "0 %"
                  }
                  border
                />
              </Column>
              <Column>
                <Metric
                  label={t.metricMaterialLoss}
                  value={`${Number(metrics.globalLossRate) ?? 0} %`}
                  border
                />
              </Column>
              <Column>
                <Metric
                  label={t.metricPartsProduced}
                  value={Number(metrics.totalProduction).toLocaleString(locale === "en" ? "en-GB" : "fr-FR")}
                  border
                />
              </Column>
            </Grid>

            <Progress
              value={Number(metrics.globalTRS) || 0}
              max={Number(metrics.trsTarget) || 80}
              label={t.trsObjective(Number(metrics.globalTRS).toFixed(2), metrics.trsTarget ?? 80)}
              showValue
            />
            {Number(metrics.globalTRS) < 80 && (
              <p className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
                {t.trsBelowObjective}
              </p>
            )}

            {Array.isArray(metrics.trsEvolution) && metrics.trsEvolution.length > 0 && (
              <div style={{ minHeight: 240 }}>
                <Title level={2}>{t.trsEvolution}</Title>
                <div style={{ width: "100%", maxWidth: 700, height: 220 }}>
                  <LineChart
                    data={metrics.trsEvolution.map((d) => ({
                      x: typeof d.date === "string" ? d.date.slice(5) : String(d.date),
                      y: Number(d.trs) || 0,
                    }))}
                    width={700}
                    height={220}
                  />
                </div>
              </div>
            )}

            <Title level={2}>{t.linesSummary}</Title>
            <Table
              columns={[
                { key: "name", label: t.colLine },
                { key: "code", label: t.colCode },
                { key: "todayTRS", label: t.colTRS },
                { key: "status", label: t.colStatus },
                {
                  key: "action",
                  label: t.colAction,
                  render: (_, row) => (
                    <Link
                      href={`/demo/production/lines/${row.code}?period=${period}`}
                      className="text-sm underline"
                      style={{ color: "var(--bpm-accent-cyan)" }}
                    >
                      {t.seeDetail}
                    </Link>
                  ),
                },
              ]}
              data={lines.map((l) => ({
                name: l.name,
                code: l.code,
                todayTRS: `${l.todayTRS} %`,
                status: l.status,
                action: null,
              }))}
              minWidth={500}
            />

            {criticalAlerts.length > 0 && (
              <>
                <Title level={2}>{t.activeCriticalAlerts}</Title>
                <div className="space-y-3">
                  {criticalAlerts.map((a) => (
                    <Panel key={a.id} title={`${a.type} — ${a.line?.name ?? "—"}`} variant="warning">
                      {a.message}
                    </Panel>
                  ))}
                </div>
                <Link href={`/demo/production/alerts?period=${period}`}>
                  <Button variant="secondary" size="small">
                    {t.seeAllAlerts}
                  </Button>
                </Link>
              </>
            )}
          </>
        ) : (
          <p style={{ color: "var(--bpm-text-secondary)" }}>
            {t.noProductionData}{" "}
            <code>npm run seed:production</code>
          </p>
        )}
      </div>
    </DemoErrorBoundary>
  );
}
