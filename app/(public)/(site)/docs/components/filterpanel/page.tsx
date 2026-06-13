"use client";

import { useState } from "react";
import Link from "next/link";
import { FilterPanel, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Panneau de filtres (select, multiselect, daterange, text, toggle).",
  category: "Interaction",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  f_status: "Statut",
  f_search: "Recherche",
  f_active: "Actif",
  f_inactive: "Inactif",
  d_filters: "Liste des filtres.",
  d_values: "Valeurs courantes.",
  d_onChange: "Callback changement.",
  d_onReset: "Callback reset.",
  d_orientation: "Disposition.",
};

const en: typeof fr = {
  components: "Components",
  description: "Filter panel (select, multiselect, daterange, text, toggle).",
  category: "Interaction",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  f_status: "Status",
  f_search: "Search",
  f_active: "Active",
  f_inactive: "Inactive",
  d_filters: "List of filters.",
  d_values: "Current values.",
  d_onChange: "Change callback.",
  d_onReset: "Reset callback.",
  d_orientation: "Layout.",
};

const L = { fr, en } as const;

export default function DocFilterPanelPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>({});
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const DEMO_FILTERS = [
    { key: "status", label: t.f_status, type: "select" as const, options: [{ value: "actif", label: t.f_active }, { value: "inactif", label: t.f_inactive }] },
    { key: "search", label: t.f_search, type: "text" as const },
  ];
  const pythonCode = "bpm.filterPanel(filters=[...], values={}, onChange=fn, onReset=fn" + (orientation !== "horizontal" ? ', orientation="' + orientation + '"' : "") + ")";
  const { prev, next } = getPrevNext("filterpanel");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.filterPanel</div>
        <h1>bpm.filterPanel</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 3 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <FilterPanel filters={DEMO_FILTERS} values={filterValues} onChange={(key, value) => setFilterValues((p) => ({ ...p, [key]: value }))} onReset={() => setFilterValues({})} orientation={orientation} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>orientation</label>
            <select value={orientation} onChange={(e) => setOrientation(e.target.value as "horizontal" | "vertical")}>
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>filters</code></td><td><code>FilterConfig[]</code></td><td>—</td><td>{t.yes}</td><td>{t.d_filters}</td></tr>
          <tr><td><code>values</code></td><td><code>Record</code></td><td>{"{}"}</td><td>{t.no}</td><td>{t.d_values}</td></tr>
          <tr><td><code>onChange</code></td><td><code>function</code></td><td>—</td><td>{t.yes}</td><td>{t.d_onChange}</td></tr>
          <tr><td><code>onReset</code></td><td><code>function</code></td><td>—</td><td>{t.yes}</td><td>{t.d_onReset}</td></tr>
          <tr><td><code>orientation</code></td><td><code>horizontal | vertical</code></td><td>horizontal</td><td>{t.no}</td><td>{t.d_orientation}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.filterPanel(filters=[...], values={}, onChange=fn, onReset=fn)"} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
