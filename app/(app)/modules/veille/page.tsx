"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Tabs,
  CodeBlock,
  Panel,
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

type SourceStatus = "active" | "warning" | "paused";

interface Source {
  id: string;
  nom: string;
  type: string;
  statut: SourceStatus;
  derniere: string;
  articles: number;
}

const TYPE_OPTIONS = [
  { value: "RSS", label: "Flux RSS" },
  { value: "API", label: "API REST" },
  { value: "Page", label: "Page web (scraping)" },
  { value: "Alerte", label: "Alerte métier" },
];

const STATUS_VARIANT: Record<SourceStatus, "success" | "warning" | "default"> = {
  active: "success",
  warning: "warning",
  paused: "default",
};

const STATUS_LABEL: Record<SourceStatus, string> = {
  active: "Active",
  warning: "À vérifier",
  paused: "En pause",
};

const INITIAL_SOURCES: Source[] = [
  { id: "s1", nom: "Journal Officiel — marchés publics", type: "RSS", statut: "active", derniere: "il y a 12 min", articles: 8 },
  { id: "s2", nom: "Concurrent A — blog produit", type: "RSS", statut: "active", derniere: "il y a 1 h", articles: 3 },
  { id: "s3", nom: "API prix matières premières", type: "API", statut: "warning", derniere: "il y a 6 h", articles: 0 },
  { id: "s4", nom: "Veille réglementaire RGPD", type: "Page", statut: "paused", derniere: "hier", articles: 0 },
];

const INITIAL_ACTIVITY = [
  { id: "a1", actor: "Veille", action: "a collecté", target: "8 articles — Journal Officiel", timestamp: new Date(Date.now() - 12 * 60_000).toISOString(), color: "success" as const },
  { id: "a2", actor: "Veille", action: "a détecté un pic sur", target: "API prix matières premières", timestamp: new Date(Date.now() - 6 * 3_600_000).toISOString(), color: "warning" as const },
  { id: "a3", actor: "Veille", action: "a publié l'alerte", target: "Nouvel appel d'offres — secteur BTP", timestamp: new Date(Date.now() - 26 * 3_600_000).toISOString(), color: "info" as const },
];

const docContent = (
  <div className="prose-sm">
    <h2 className="text-lg font-semibold mt-0 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      À propos
    </h2>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
      Le module Veille centralise vos sources d&apos;information (flux RSS, API, pages web, alertes
      métier), suit leur collecte et remonte les écarts comme des alertes. Le simulateur est un
      assemblage réel de composants <code>bpm.*</code> — métriques, tableau de sources avec statuts,
      détection d&apos;anomalie et flux d&apos;activité — avec des données câblées que vous pouvez
      faire évoluer (ajout d&apos;une source).
    </p>
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Composants utilisés
    </h3>
    <p className="mb-4" style={{ color: "var(--bpm-text-secondary)" }}>
      <code>bpm.metricRow</code>, <code>bpm.table</code> (statut rendu par <code>bpm.badge</code>),{" "}
      <code>bpm.anomalyAlert</code>, <code>bpm.activityFeed</code>, <code>bpm.selectbox</code>,{" "}
      <code>bpm.input</code> et <code>bpm.button</code>.
    </p>
    <CodeBlock
      code={`import bpm

bpm.metricRow([
    bpm.metric("Sources suivies", 4),
    bpm.metric("Alertes 24 h", 2, delta=1),
    bpm.metric("Articles collectés", 11, delta=8),
])

bpm.table(
    columns=[("nom", "Source"), ("type", "Type"), ("statut", "Statut")],
    data=sources,
)`}
      language="python"
    />
    <h3 className="text-base font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
      Paramétrage
    </h3>
    <p className="mb-2 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
      Le module fait partie de l&apos;application Next.js : <code>npm install</code> puis{" "}
      <code>npm run dev</code> suffisent. Définir <code>DATABASE_URL</code> dans <code>.env</code>{" "}
      comme pour le reste de l&apos;app. Voir la{" "}
      <Link href="/modules/veille/documentation" style={{ color: "var(--bpm-accent-cyan)" }}>
        documentation
      </Link>{" "}
      pour les sources, seuils d&apos;alerte et filtres.
    </p>
  </div>
);

function SimuContent() {
  const [sources, setSources] = useState<Source[]>(INITIAL_SOURCES);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [nom, setNom] = useState("");
  const [type, setType] = useState<string | null>("RSS");

  const stats = useMemo(() => {
    const total = sources.length;
    const articles = sources.reduce((sum, s) => sum + s.articles, 0);
    const alerts = sources.filter((s) => s.statut === "warning").length;
    return { total, articles, alerts };
  }, [sources]);

  const columns = [
    { key: "nom", label: "Source" },
    { key: "type", label: "Type" },
    {
      key: "statut",
      label: "Statut",
      render: (value: unknown) => {
        const s = value as SourceStatus;
        return <Badge variant={STATUS_VARIANT[s]}>{STATUS_LABEL[s]}</Badge>;
      },
    },
    { key: "derniere", label: "Dernière collecte" },
    { key: "articles", label: "Articles", align: "right" as const },
  ];

  const addSource = () => {
    const trimmed = nom.trim();
    if (!trimmed) return;
    const id = `s${Date.now()}`;
    setSources((prev) => [
      { id, nom: trimmed, type: type ?? "RSS", statut: "active", derniere: "à l'instant", articles: 0 },
      ...prev,
    ]);
    setActivity((prev) => [
      { id, actor: "Veille", action: "a ajouté la source", target: trimmed, timestamp: new Date().toISOString(), color: "success" as const },
      ...prev,
    ]);
    setNom("");
  };

  return (
    <div className="space-y-6">
      <MetricRow>
        <Metric label="Sources suivies" value={String(stats.total)} />
        <Metric label="Alertes à vérifier" value={String(stats.alerts)} />
        <Metric label="Articles collectés" value={String(stats.articles)} />
      </MetricRow>

      <AnomalyAlert
        title="Pic de prix détecté — matières premières"
        expected="+2 % / sem."
        actual="+11 % / sem."
        severity="warning"
      />

      <Panel variant="info" title="Sources suivies">
        <Table columns={columns} data={sources as unknown as Record<string, unknown>[]} striped hover />
      </Panel>

      <Panel variant="info" title="Ajouter une source">
        <div className="flex flex-wrap gap-3 items-end">
          <div style={{ minWidth: 240, flex: 1 }}>
            <Input label="Nom de la source" placeholder="Ex. Veille concurrentielle — secteur X" value={nom} onChange={setNom} />
          </div>
          <div style={{ minWidth: 180 }}>
            <Selectbox label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} placeholder="Type" />
          </div>
          <Button onClick={addSource}>Ajouter</Button>
        </div>
      </Panel>

      <Panel variant="info" title="Activité récente">
        <ActivityFeed activities={activity} maxItems={6} compact />
      </Panel>
    </div>
  );
}

export default function VeilleModulePage() {
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/modules">Modules</Link> → Veille
        </div>
        <h1>Veille</h1>
        <p className="doc-description">
          Centralisez vos sources (RSS, API, pages, alertes), suivez la collecte et remontez les écarts.
          Testez l&apos;assemblage dans le Simulateur.
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Données &amp; reporting</span>
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
          <Link href="/modules/veille/documentation" className="font-medium underline" style={{ color: "var(--bpm-accent-cyan)" }}>
            Ouvrir la documentation
          </Link>
        </p>
      </div>
      <Tabs
        tabs={[
          { label: "Documentation", content: docContent },
          { label: "Simulateur", content: <SimuContent /> },
        ]}
        defaultTab={0}
      />
    </div>
  );
}
