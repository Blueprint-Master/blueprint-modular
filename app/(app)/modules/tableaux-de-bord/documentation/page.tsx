"use client";

import Link from "next/link";
import { CodeBlock, Table, type TableColumn } from "@/components/bpm";
import { useI18n } from "@/lib/i18n/LocaleProvider";
import { STR } from "../strings";

// Snippet JSON inchangé quelle que soit la locale (les ids sont stables).
const LAYOUT_SNIPPET = `[
  { "id": "metric-ca",         "size": 1 },
  { "id": "metric-commandes",  "size": 1 },
  { "id": "line-ventes",       "size": 2 },
  { "id": "bar-regions",       "size": 1 },
  { "id": "table-top-produits","size": 1 }
]`;

// Types techniques des widgets (identiques dans les deux langues).
const CATALOG_TYPES: Record<string, string> = {
  "metric-ca": "Metric",
  "metric-commandes": "Metric",
  "metric-panier": "Metric",
  "line-ventes": "LineChart",
  "bar-regions": "BarChart",
  "table-top-produits": "Table",
  "ring-objectif": "ProgressRing",
  "feed-commandes": "ActivityFeed",
};

// Taille par défaut de chaque widget (2 = pleine largeur).
const CATALOG_SIZES: Record<string, 1 | 2> = {
  "metric-ca": 1,
  "metric-commandes": 1,
  "metric-panier": 1,
  "line-ventes": 2,
  "bar-regions": 1,
  "table-top-produits": 1,
  "ring-objectif": 1,
  "feed-commandes": 2,
};

export default function TableauxDeBordDocumentationPage() {
  const { locale } = useI18n();
  const s = STR[locale];

  const catalogColumns: TableColumn[] = [
    { key: "id", label: s.colId, noWrap: true, render: (value) => <code>{String(value)}</code> },
    { key: "type", label: s.colType, noWrap: true },
    { key: "titre", label: s.colWidget },
    { key: "taille", label: s.colDefaultSize, align: "center" },
  ];

  const catalogData = Object.entries(s.catalogRows).map(([id, titre]) => ({
    id,
    type: CATALOG_TYPES[id],
    titre,
    taille: CATALOG_SIZES[id] === 2 ? s.twoColumns : s.oneColumn,
  }));

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <nav className="doc-breadcrumb">
          <Link href="/modules">{s.breadcrumbModules}</Link> →{" "}
          <Link href="/modules/tableaux-de-bord">{s.moduleTitle}</Link> → {s.tabDocumentation}
        </nav>
        <h1>{s.docPageTitle}</h1>
        <p className="doc-description">{s.docPageDescription}</p>
      </div>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.catalogTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.catalogIntroBeforeCode}
        <code>bpm.*</code>
        {s.catalogIntroAfterCode}
      </p>
      <Table columns={catalogColumns} data={catalogData} keyColumn="id" density="compact" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.configTitle}
      </h2>
      <p className="mb-4" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.configBody1}
        <code>md:grid-cols-2</code>
        {s.configBody2}
        <code>size</code>
        {s.configBody3}
      </p>
      <CodeBlock code={LAYOUT_SNIPPET} language="json" />

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.opsTitle}
      </h2>
      <ul className="mb-4 list-disc pl-5 text-sm space-y-1" style={{ color: "var(--bpm-text-secondary)" }}>
        {s.opsItems.map((item) => (
          <li key={item.strong}>
            <strong>{item.strong}</strong>
            {item.before}
            {item.code ? (
              <>
                <code>{item.code}</code>
                {item.after}
              </>
            ) : null}
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--bpm-text-primary)" }}>
        {s.persistTitle}
      </h2>
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.persist1a}
        <code>localStorage</code>
        {s.persist1b}
        <code>bpm.tableaux-de-bord.layout.v1</code>
        {s.persist1c}
        <code>useEffect</code>
        {s.persist1d}
      </p>
      <CodeBlock code={s.persistSnippet} language="typescript" />
      <p className="mb-4 text-sm" style={{ color: "var(--bpm-text-secondary)", maxWidth: "62ch" }}>
        {s.persist2a}
        <code>localStorage</code>
        {s.persist2b}
        <code>dashboard_layouts</code>
        {s.persist2c}
        <code>user_id</code>
        {s.persist2d}
        <code>layout</code>
        {s.persist2e}
        <code>updated_at</code>
        {s.persist2f}
        <code>.v1</code>
        {s.persist2g}
      </p>

      <p className="mt-6 text-sm" style={{ color: "var(--bpm-text-secondary)" }}>
        <Link
          href="/modules/tableaux-de-bord/simulateur"
          className="font-medium underline"
          style={{ color: "var(--bpm-accent-cyan)" }}
        >
          {s.openSimulator}
        </Link>
      </p>
    </div>
  );
}
