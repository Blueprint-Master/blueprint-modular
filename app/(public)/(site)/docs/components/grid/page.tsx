"use client";

import { useState } from "react";
import Link from "next/link";
import { Grid, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Grille responsive : disposition en colonnes avec espacement configurable.",
  category: "Mise en page",
  cell: "Cellule",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  gapPlaceholder: "ex. 1rem ou 16",
  d_cols: "Nombre de colonnes (ou objet responsive xs, sm, md, lg).",
  d_gap: "Espacement entre les cellules (px si number, sinon valeur CSS).",
  d_children: "Contenu des cellules de la grille.",
  d_className: "Classes CSS additionnelles.",
};

const en: typeof fr = {
  components: "Components",
  description: "Responsive grid: column layout with configurable spacing.",
  category: "Layout",
  cell: "Cell",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  gapPlaceholder: "e.g. 1rem or 16",
  d_cols: "Number of columns (or responsive object xs, sm, md, lg).",
  d_gap: "Spacing between cells (px if number, otherwise CSS value).",
  d_children: "Grid cell content.",
  d_className: "Additional CSS classes.",
};

const L = { fr, en } as const;

export default function DocGridPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [cols, setCols] = useState(3);
  const [gap, setGap] = useState("1rem");

  const gapNum = gap.trim() ? (Number(gap) || undefined) : undefined;
  const gapVal = gapNum != null ? gapNum : gap.trim() || "1rem";
  const gapStr = typeof gapVal === "number" ? `${gapVal}px` : String(gapVal);
  const pythonCode =
    `bpm.grid(cols=${cols}` +
    (gapVal !== "1rem" ? (typeof gapVal === "number" ? `, gap=${gapVal}` : `, gap="${String(gapVal).replace(/"/g, '\\"')}"`) : "") +
    ")";
  const { prev, next } = getPrevNext("grid");

  const placeholders = ["1", "2", "3", "4", "5", "6"].slice(0, Math.max(cols * 2, 4));

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.grid
        </div>
        <h1>bpm.grid</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full">
            <Grid cols={cols} gap={typeof gapVal === "number" ? gapVal : gapStr}>
              {placeholders.map((label) => (
                <div
                  key={label}
                  className="rounded border p-3 text-center text-sm"
                  style={{
                    borderColor: "var(--bpm-border)",
                    background: "var(--bpm-bg-secondary)",
                    color: "var(--bpm-text-secondary)",
                  }}
                >
                  {t.cell} {label}
                </div>
              ))}
            </Grid>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>cols</label>
            <select value={cols} onChange={(e) => setCols(Number(e.target.value))}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>gap</label>
            <input
              type="text"
              value={gap}
              onChange={(e) => setGap(e.target.value)}
              placeholder={t.gapPlaceholder}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              {t.copy}
            </button>
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
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>cols</code></td>
            <td><code>number | object</code></td>
            <td>1</td>
            <td>{t.no}</td>
            <td>{t.d_cols}</td>
          </tr>
          <tr>
            <td><code>gap</code></td>
            <td><code>number | string</code></td>
            <td>1rem</td>
            <td>{t.no}</td>
            <td>{t.d_gap}</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_children}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.grid(cols=2)\nbpm.grid(cols=3, gap=24)'} language="python" />
      <CodeBlock code={'bpm.grid(cols=4, gap="1.5rem")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
