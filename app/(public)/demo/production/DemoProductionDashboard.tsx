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
import { DEMO_ANSWERS } from "./demo-answers";

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
  const metrics = data?.metrics ?? null;
  const lines = Array.isArray(data?.lines) ? data.lines : [];
  const alerts = Array.isArray(data?.alerts) ? data.alerts : [];

  const vueGlobale = (
    <div className="space-y-6">
      <Title level={1}>Dashboard Production</Title>
      {metrics && (
        <>
          <Grid cols={4}>
            <Column>
              <Metric
                label="TRS global"
                value={`${Number(metrics.globalTRS) || 0} %`}
                border
              />
            </Column>
            <Column>
              <Metric
                label="Meilleure ligne"
                value={metrics.bestLine?.name ?? "—"}
                subtext={metrics.bestLine != null ? `${metrics.bestLine.trs} %` : undefined}
                border
              />
            </Column>
            <Column>
              <Metric
                label="Ligne à surveiller"
                value={metrics.worstLine?.name ?? "—"}
                subtext={metrics.worstLine != null ? `${metrics.worstLine.trs} %` : undefined}
                border
              />
            </Column>
            <Column>
              <Metric
                label="Pièces produites"
                value={Number(metrics.totalProduction).toLocaleString("fr-FR")}
                border
              />
            </Column>
          </Grid>
          <Progress
            value={Number(metrics.globalTRS) || 0}
            max={Number(metrics.trsTarget) || 100}
            label={`Objectif TRS : ${metrics.trsTarget ?? 80} %`}
            showValue
          />
          {Array.isArray(metrics.trsEvolution) && metrics.trsEvolution.length > 0 && (
            <div style={{ minHeight: 240 }}>
              <Title level={2}>Évolution TRS (30 jours)</Title>
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
          Aucune donnée production. Lancez le seed : <code>npm run seed:production</code>
        </p>
      )}
    </div>
  );

  const lignesContent = (
    <div className="space-y-6">
      <Title level={2}>Lignes de production</Title>
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
              { key: "name", label: "Ligne" },
              { key: "todayTRS", label: "TRS %" },
              { key: "todayAvailability", label: "Dispo %" },
              { key: "todayPerformance", label: "Perf %" },
              { key: "todayQuality", label: "Qualité %" },
              { key: "status", label: "Statut" },
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
        <p style={{ color: "var(--bpm-text-secondary)" }}>Aucune ligne.</p>
      )}
    </div>
  );

  const alertesContent = (
    <div className="space-y-6">
      <Title level={2}>Alertes actives</Title>
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
        <p style={{ color: "var(--bpm-text-secondary)" }}>Aucune alerte active.</p>
      )}
    </div>
  );

  const tabs = [
    { label: "Vue globale", content: vueGlobale },
    { label: "Lignes", content: lignesContent },
    { label: "Alertes", content: alertesContent },
  ];

  return (
    <div className="demo-production-dashboard">
      <Tabs tabs={tabs} defaultTab={0} />
      <AssistantPanel title="Assistant Production" demoAnswers={DEMO_ANSWERS} />
    </div>
  );
}
