"use client";

import dynamic from "next/dynamic";
import {
  Title,
  Tabs,
  Metric,
  LineChart,
  Progress,
  Badge,
  Table,
  Panel,
  Grid,
  Column,
} from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { DEMO_ANSWERS } from "./demo-answers";
import { STR } from "./strings";

const AssistantPanel = dynamic(
  () => import("@/components/bpm").then((m) => ({ default: m.AssistantPanel })),
  { ssr: false }
);

type MetricsData = {
  globalTRS: number;
  bestLine: { name: string; trs: number };
  worstLine: { name: string; trs: number };
  totalProduction: number;
  totalRejects: number;
  globalLossRate: number;
  trsEvolution: { date: string; trs: number }[];
  trsTarget: number;
} | null;

type LineData = {
  id: string;
  name: string;
  code: string;
  status: string;
  todayTRS: number;
  todayAvailability: number;
  todayPerformance: number;
  todayQuality: number;
  activeSessions: number;
  activeAlerts: number;
};

type AlertData = {
  id: string;
  type: string;
  severity: string;
  message: string;
  line: { name: string; code: string };
};

type DemoData = {
  metrics: MetricsData;
  lines: LineData[];
  alerts: AlertData[];
};

export function DemoProductionDashboard({ data }: { data: DemoData }) {
  const { locale } = useI18n();
  const t = STR[locale];
  const metrics = data?.metrics ?? null;
  const lines = Array.isArray(data?.lines) ? data.lines : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

  const vueGlobale = (
    <div className="space-y-6">
      <Title level={1}>{t.dashboardTitle}</Title>
      {metrics && (
        <>
          <Grid cols={4}>
            <Column>
              <Metric
                label={t.metricGlobalTRS}
                value={`${Number(metrics.globalTRS) || 0} %`}
                border
              />
            </Column>
            <Column>
              <Metric
                label={t.metricBestLine}
                value={metrics.bestLine?.name ?? "—"}
                subtext={metrics.bestLine != null ? `${metrics.bestLine.trs} %` : undefined}
                border
              />
            </Column>
            <Column>
              <Metric
                label={t.metricLineToWatch}
                value={metrics.worstLine?.name ?? "—"}
                subtext={metrics.worstLine != null ? `${metrics.worstLine.trs} %` : undefined}
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
            max={Number(metrics.trsTarget) || 100}
            label={t.trsTargetLabel(metrics.trsTarget ?? 80)}
            showValue
          />
          {Array.isArray(metrics.trsEvolution) && metrics.trsEvolution.length > 0 && (
            <div style={{ minHeight: 240 }}>
              <Title level={2}>{t.trsEvolution30d}</Title>
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
        </>
      )}
      {!metrics && (
        <p style={{ color: "var(--bpm-text-secondary)" }}>
          {t.noProductionData} <code>npm run seed:production</code>
        </p>
      )}
    </div>
  );

  const lignesContent = (
    <div className="space-y-6">
      <Title level={2}>{t.productionLines}</Title>
      {lines.length > 0 ? (
        <>
          <div className="flex flex-wrap gap-3">
            {lines.map((line) => (
              <Badge
                key={line.id}
                variant={line.todayTRS >= 70 ? "success" : "warning"}
              >
                {line.name}
              </Badge>
            ))}
          </div>
          <Table
            columns={[
              { key: "name", label: t.colLine },
              { key: "todayTRS", label: t.colTRS },
              { key: "todayAvailability", label: t.colAvailShort },
              { key: "todayPerformance", label: t.colPerfShort },
              { key: "todayQuality", label: t.colQuality },
              { key: "status", label: t.colStatus },
            ]}
            data={lines.map((l) => ({
              name: l.name,
              todayTRS: `${l.todayTRS} %`,
              todayAvailability: `${l.todayAvailability} %`,
              todayPerformance: `${l.todayPerformance} %`,
              todayQuality: `${l.todayQuality} %`,
              status: l.status,
            }))}
          />
        </>
      ) : (
        <p style={{ color: "var(--bpm-text-secondary)" }}>{t.noLine}</p>
      )}
    </div>
  );

  const alertesContent = (
    <div className="space-y-6">
      <Title level={2}>{t.activeAlertsTitle}</Title>
      {alerts.length > 0 ? (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Panel
              key={a.id}
              title={`${a.type} — ${a.line.name}`}
              variant="warning"
            >
              {a.message}
            </Panel>
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--bpm-text-secondary)" }}>{t.noActiveAlert}</p>
      )}
    </div>
  );

  const tabs = [
    { label: t.navOverview, content: vueGlobale },
    { label: t.navLines, content: lignesContent },
    { label: t.navAlerts, content: alertesContent },
  ];

  return (
    <div className="demo-production-dashboard">
      <Tabs tabs={tabs} defaultTab={0} />
      <AssistantPanel title={t.assistantTitle} demoAnswers={DEMO_ANSWERS} />
    </div>
  );
}
