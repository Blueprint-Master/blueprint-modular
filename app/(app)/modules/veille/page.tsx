"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Tabs,
  CodeBlock,
  Card,
  Table,
  Badge,
  Button,
  Input,
  Selectbox,
  Metric,
  MetricRow,
  ActivityFeed,
  AnomalyAlert,
} from "@/components/bpm";
import { ModulePageHeader } from "@/components/site/ModulePageHeader";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import {
  STR,
  type Localized,
  type RelTimeKey,
  type ActivityActionKey,
} from "./strings";

type SourceStatus = "active" | "warning" | "paused";

interface Source {
  id: string;
  nom: Localized;
  type: string;
  statut: SourceStatus;
  derniere: RelTimeKey;
  articles: number;
}

interface ActivityEntry {
  id: string;
  action: ActivityActionKey;
  target: Localized;
  timestamp: string;
  color: "success" | "warning" | "info";
}

const STATUS_VARIANT: Record<SourceStatus, "success" | "warning" | "default"> = {
  active: "success",
  warning: "warning",
  paused: "default",
};

const INITIAL_SOURCES: Source[] = [
  { id: "s1", nom: { fr: "Journal Officiel — marchés publics", en: "Official Journal — public procurement" }, type: "RSS", statut: "active", derniere: "min12", articles: 8 },
  { id: "s2", nom: { fr: "Concurrent A — blog produit", en: "Competitor A — product blog" }, type: "RSS", statut: "active", derniere: "h1", articles: 3 },
  { id: "s3", nom: { fr: "API prix matières premières", en: "Raw materials price API" }, type: "API", statut: "warning", derniere: "h6", articles: 0 },
  { id: "s4", nom: { fr: "Veille réglementaire RGPD", en: "GDPR regulatory watch" }, type: "Page", statut: "paused", derniere: "yesterday", articles: 0 },
];

const INITIAL_ACTIVITY: ActivityEntry[] = [
  { id: "a1", action: "collected", target: { fr: "8 articles — Journal Officiel", en: "8 articles — Official Journal" }, timestamp: new Date(Date.now() - 12 * 60_000).toISOString(), color: "success" },
  { id: "a2", action: "spikeDetected", target: { fr: "API prix matières premières", en: "Raw materials price API" }, timestamp: new Date(Date.now() - 6 * 3_600_000).toISOString(), color: "warning" },
  { id: "a3", action: "alertPublished", target: { fr: "Nouvel appel d'offres — secteur BTP", en: "New call for tenders — construction sector" }, timestamp: new Date(Date.now() - 26 * 3_600_000).toISOString(), color: "info" },
];

const PYTHON_SNIPPET = `import bpm

bpm.metricRow([
    bpm.metric("Sources suivies", 4),
    bpm.metric("Alertes 24 h", 2, delta=1),
    bpm.metric("Articles collectés", 11, delta=8),
])

bpm.table(
    columns=[("nom", "Source"), ("type", "Type"), ("statut", "Statut")],
    data=sources,
)`;

function DocTab() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="prose-sm">
      <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.aboutHeading}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.about1}
        <code>bpm.*</code>
        {s.about2}
      </p>
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.componentsHeading}
      </h3>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
        <code>bpm.metricRow</code>, <code>bpm.table</code>{s.componentsStatusNote}<code>bpm.badge</code>{"), "}
        <code>bpm.anomalyAlert</code>, <code>bpm.activityFeed</code>, <code>bpm.selectbox</code>,{" "}
        <code>bpm.input</code>{s.componentsAnd}<code>bpm.button</code>.
      </p>
      <CodeBlock code={PYTHON_SNIPPET} language="python" />
      <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configHeading}
      </h3>
      <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.config1}
        <code>npm install</code>
        {s.configThen}
        <code>npm run dev</code>
        {s.config2}
        <code>DATABASE_URL</code>
        {s.configIn}
        <code>.env</code>
        {s.config3}
        <Link href="/modules/veille/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
          {s.configDocLink}
        </Link>
        {s.config4}
      </p>
    </div>
  );
}

function SimuContent() {
  const { locale } = useI18n();
  const s = STR[locale];
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [nom, setNom] = useState("");
  const [type, setType] = useState<string | null>("RSS");

  const stats = useMemo(() => {
    const total = sources.length;
    const articles = sources.reduce((sum, src) => sum + src.articles, 0);
    const alerts = sources.filter((src) => src.statut === "warning").length;
    return { total, articles, alerts };
  }, [sources]);

  const columns = [
    { key: "nom", label: s.colSource },
    { key: "type", label: s.colType },
    {
      key: "statut",
      label: s.colStatus,
      render: (value: unknown) => {
        const status = value as SourceStatus;
        return <Badge variant={STATUS_VARIANT[status]}>{s.statusLabels[status]}</Badge>;
      },
    },
    { key: "derniere", label: s.colLast },
    { key: "articles", label: s.colArticles, align: "right" as const },
  ];

  // Données stockées structurées (clés + libellés bilingues), résolues au render.
  const rows = sources.map((src) => ({
    id: src.id,
    nom: src.nom[locale],
    type: src.type,
    statut: src.statut,
    derniere: s.relTime[src.derniere],
    articles: src.articles,
  }));

  const feedItems = activity.map((entry) => ({
    id: entry.id,
    actor: s.activityActor,
    action: s.activityActions[entry.action],
    target: entry.target[locale],
    timestamp: entry.timestamp,
    color: entry.color,
  }));

  const addSource = () => {
    const trimmed = nom.trim();
    if (!trimmed) return;
    const id = `s${Date.now()}`;
    setSources((prev) => [
      { id, nom: { fr: trimmed, en: trimmed }, type: type ?? "RSS", statut: "active", derniere: "justNow", articles: 0 },
      ...prev,
    ]);
    setActivity((prev) => [
      { id, action: "sourceAdded", target: { fr: trimmed, en: trimmed }, timestamp: new Date().toISOString(), color: "success" as const },
      ...prev,
    ]);
    setNom("");
  };

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label={s.metricSources} value={String(stats.total)} />
        <Metric label={s.metricAlerts} value={String(stats.alerts)} />
        <Metric label={s.metricArticles} value={String(stats.articles)} />
      </MetricRow>

      <AnomalyAlert
        title={s.anomalyTitle}
        expected={s.anomalyExpected}
        actual={s.anomalyActual}
        severity="warning"
      />

      <Card variant="outlined" title={s.panelSourcesTitle}>
        <Table columns={columns} data={rows as unknown as Record<string, unknown>[]} striped hover />
      </Card>

      <Card variant="outlined" title={s.panelAddTitle}>
        <div className="flex flex-wrap gap-3 items-end">
          <div style={{ minWidth: 240, flex: 1 }}>
            <Input label={s.sourceNameLabel} placeholder={s.sourceNamePlaceholder} value={nom} onChange={setNom} />
          </div>
          <div style={{ minWidth: 180 }}>
            <Selectbox label={s.typeLabel} options={s.typeOptions} value={type} onChange={setType} placeholder={s.typePlaceholder} />
          </div>
          <Button onClick={addSource}>{s.addButton}</Button>
        </div>
      </Card>

      <Card variant="outlined" title={s.panelActivityTitle}>
        <ActivityFeed activities={feedItems} maxItems={6} compact />
      </Card>
    </div>
  );
}

export default function VeilleModulePage() {
  const { locale } = useI18n();
  const s = STR[locale];
  return (
    <div className="doc-page">
      <ModulePageHeader
        modulesLabel={s.breadcrumbModules}
        breadcrumbCurrent={s.moduleName}
        title={s.moduleName}
        description={s.moduleDescription}
        category={s.categoryBadge}
        links={[{ href: "/modules/veille/documentation", label: s.openDocumentation }]}
      />
      <Tabs
        tabs={[
          { label: s.tabDocumentation, content: <DocTab /> },
          { label: s.tabSimulator, content: <SimuContent /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
