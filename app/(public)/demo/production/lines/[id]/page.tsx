import Link from "next/link";
import { getCachedDemoLineDetail } from "@/lib/demo-production-data";
import type { DemoPeriod } from "@/lib/demo-production-data";
import { getLocale } from "@/lib/i18n/server";
import { STR } from "../../strings";
import {
  Title,
  Metric,
  LineChart,
  BarChart,
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

export default async function DemoLineDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ period?: string }> | { period?: string };
}) {
  const locale = await getLocale();
  const t = STR[locale];
  const { id: lineCode } = await params;
  const rawSp = searchParams != null
    ? typeof (searchParams as Promise<unknown>).then === "function"
      ? await (searchParams as Promise<{ period?: string }>)
      : (searchParams as { period?: string })
    : {};
  const period = parsePeriod(rawSp?.period ?? null);
  let detail;
  try {
    detail = await getCachedDemoLineDetail(lineCode, period);
  } catch {
    detail = null;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <p style={{ color: "var(--bpm-text-secondary)" }}>
          {t.lineNotFound(lineCode)}
        </p>
        <Link href={`/demo/production/lines?period=${period}`}>
          <Button variant="secondary">{t.backToLines}</Button>
        </Link>
      </div>
    );
  }

  const { line, trsHistory, lossHistory, sessions, alerts } = detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Title level={1}>{line.name}</Title>
          <p className="text-sm mt-1" style={{ color: "var(--bpm-text-secondary)" }}>
            {t.lineMeta(line.code, line.status, line.theoreticalRate)}
          </p>
        </div>
        <Link href={`/demo/production/lines?period=${period}`}>
          <Button variant="secondary">{t.backToLines}</Button>
        </Link>
      </div>

      <Grid cols={4}>
        <Column>
          <Metric
            label={t.metricTRS}
            value={
              trsHistory.length
                ? `${(trsHistory.reduce((a, x) => a + x.trs, 0) / trsHistory.length).toFixed(1)} %`
                : "—"
            }
            border
          />
        </Column>
        <Column>
          <Metric
            label={t.metricAvailability}
            value="—"
            border
          />
        </Column>
        <Column>
          <Metric label={t.metricPerformance} value="—" border />
        </Column>
        <Column>
          <Metric label={t.metricQuality} value="—" border />
        </Column>
      </Grid>

      {trsHistory.length > 0 && (
        <div style={{ minHeight: 220 }}>
          <Title level={2}>{t.trsEvolution}</Title>
          <div style={{ width: "100%", maxWidth: 600, height: 200 }}>
            <LineChart
              data={trsHistory.map((d) => ({
                x: typeof d.date === "string" ? d.date.slice(5) : String(d.date),
                y: d.trs,
              }))}
              width={600}
              height={200}
            />
          </div>
        </div>
      )}

      {lossHistory.length > 0 && (
        <div style={{ minHeight: 220 }}>
          <Title level={2}>{t.materialLossPeriod}</Title>
          <div style={{ width: "100%", maxWidth: 600, height: 200 }}>
            <BarChart
              data={lossHistory.map((d) => ({
                x: typeof d.date === "string" ? d.date.slice(5) : String(d.date),
                y: d.loss,
              }))}
              width={600}
              height={200}
            />
          </div>
        </div>
      )}

      <Title level={2}>{t.lastSessions}</Title>
      <Table
        columns={[
          { key: "startedAt", label: t.colDate },
          { key: "shift", label: t.colShift },
          { key: "operatorName", label: t.colOperator },
          { key: "trs", label: t.colTRS },
          { key: "parts", label: t.colGoodTotal },
          { key: "rawMaterialLost", label: t.colLossesKg },
          { key: "notes", label: t.colNotes },
        ]}
        data={sessions.map((s) => ({
          startedAt: new Date(s.startedAt).toLocaleString(locale === "en" ? "en-GB" : "fr-FR", { dateStyle: "short", timeStyle: "short" }),
          shift: s.shift ?? "—",
          operatorName: s.operatorName ?? "—",
          trs: `${s.trs} %`,
          parts: `${s.goodParts} / ${s.totalParts}`,
          rawMaterialLost: s.rawMaterialLost,
          notes: (s.notes ?? "").slice(0, 30),
        }))}
        minWidth={700}
      />

      {alerts.length > 0 && (
        <>
          <Title level={2}>{t.lineAlerts}</Title>
          <div className="space-y-2">
            {alerts.map((a) => (
              <Panel key={a.id} title={a.type} variant="warning">
                {a.message}
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
