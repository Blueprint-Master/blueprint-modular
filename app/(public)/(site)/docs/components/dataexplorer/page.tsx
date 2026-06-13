"use client";

import { useState } from "react";
import Link from "next/link";
import { DataExplorer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Explorateur de données (table, recherche, tri, pagination, export CSV).",
  category: "IA & Spécialisés",
  defaultTitle: "Participants",
  keyName: "nom",
  titlePlaceholder: "Titre optionnel",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descData: "Données à afficher (tableau d'objets).",
  descColumns: "Définition des colonnes (key, label, type?, sortable?, filterable?). Inférées si absentes.",
  descTitle: "Titre au-dessus du tableau.",
  descSearchable: "Afficher le champ recherche.",
  descExportable: "Afficher le bouton Exporter CSV.",
  descPageSize: "Nombre de lignes par page.",
  descClassName: "Classes CSS.",
  examples: "Exemples",
};

const en: typeof fr = {
  components: "Components",
  description: "Data explorer (table, search, sort, pagination, CSV export).",
  category: "AI & Specialized",
  defaultTitle: "Participants",
  keyName: "name",
  titlePlaceholder: "Optional title",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descData: "Data to display (array of objects).",
  descColumns: "Column definitions (key, label, type?, sortable?, filterable?). Inferred if omitted.",
  descTitle: "Title above the table.",
  descSearchable: "Show the search field.",
  descExportable: "Show the Export CSV button.",
  descPageSize: "Number of rows per page.",
  descClassName: "CSS classes.",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocDataExplorerPage() {
  const { locale } = useI18n();
  const t = L[locale];

  const SAMPLE_DATA = [
    { id: 1, [t.keyName]: "Alice", score: 85, date: "2024-01-15" },
    { id: 2, [t.keyName]: "Bob", score: 72, date: "2024-02-20" },
    { id: 3, [t.keyName]: "Claire", score: 91, date: "2024-03-10" },
  ];

  const [title, setTitle] = useState(t.defaultTitle);
  const [searchable, setSearchable] = useState(true);
  const [exportable, setExportable] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const pyTitle = title ? `, title="${title.replace(/"/g, '\\"')}"` : "";
  const pySearchable = !searchable ? ", searchable=False" : "";
  const pyExportable = exportable ? ", exportable=True" : "";
  const pyPageSize = pageSize !== 20 ? `, pageSize=${pageSize}` : "";
  const pythonCode = `bpm.dataExplorer(data=rows${pyTitle}${pySearchable}${pyExportable}${pyPageSize})`;
  const { prev, next } = getPrevNext("dataexplorer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.dataExplorer</div>
        <h1>bpm.dataExplorer</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <DataExplorer
            data={SAMPLE_DATA}
            title={title || undefined}
            searchable={searchable}
            exportable={exportable}
            pageSize={pageSize}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titlePlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>searchable</label>
            <select value={searchable ? "true" : "false"} onChange={(e) => setSearchable(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>exportable</label>
            <select value={exportable ? "true" : "false"} onChange={(e) => setExportable(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>pageSize</label>
            <input type="number" min={5} value={pageSize} onChange={(e) => setPageSize(Number(e.target.value) || 20)} />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>{t.thDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>data</code></td><td><code>Record&lt;string, unknown&gt;[]</code></td><td>—</td><td>{t.yes}</td><td>{t.descData}</td></tr>
          <tr><td><code>columns</code></td><td><code>ColumnDef[]</code></td><td>—</td><td>{t.no}</td><td>{t.descColumns}</td></tr>
          <tr><td><code>title</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descTitle}</td></tr>
          <tr><td><code>searchable</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.descSearchable}</td></tr>
          <tr><td><code>exportable</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descExportable}</td></tr>
          <tr><td><code>pageSize</code></td><td><code>number</code></td><td>20</td><td>{t.no}</td><td>{t.descPageSize}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.dataExplorer(data=rows)'} language="python" />
      <CodeBlock code={'bpm.dataExplorer(data=rows, title="Export", searchable=True, exportable=True)'} language="python" />
      <CodeBlock code={'bpm.dataExplorer(data=rows, columns=[{"key": "name", "label": "Nom", "type": "text", "sortable": True}]}'} language="python" />
      <CodeBlock code={'bpm.dataExplorer(data=rows, pageSize=10)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
