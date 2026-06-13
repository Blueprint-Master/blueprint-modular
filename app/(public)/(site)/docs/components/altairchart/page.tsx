"use client";

import { useState } from "react";
import Link from "next/link";
import { AltairChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Spec Vega-Lite : ventes par trimestre 2025 (k€) — libellés résolus par locale
const QUARTERLY_SALES = [260, 315, 309, 393];

const L = {
  fr: {
    breadcrumb: "Composants",
    description: "Graphique Altair / Vega-Lite. Démo : ventes par trimestre 2025 (k€) en barres Vega-Lite.",
    category: "Graphiques",
    copy: "Copier",
    thDefault: "Défaut",
    thRequired: "Requis",
    no: "Non",
    descSpec: "Spécification Vega-Lite / Altair (JSON).",
    descIframe: "URL d'un fichier JSON ou d'une vue compilée.",
    descWidth: "Largeur.",
    descHeight: "Hauteur.",
    descClassName: "Classes CSS.",
    examples: "Exemples",
    specDescription: "Ventes par trimestre 2025 (k€)",
    quarters: ["T1 2025", "T2 2025", "T3 2025", "T4 2025"],
    axisX: "Trimestre",
    axisY: "Ventes (k€)",
  },
  en: {
    breadcrumb: "Components",
    description: "Altair / Vega-Lite chart. Demo: quarterly sales 2025 (€k) as Vega-Lite bars.",
    category: "Charts",
    copy: "Copy",
    thDefault: "Default",
    thRequired: "Required",
    no: "No",
    descSpec: "Vega-Lite / Altair specification (JSON).",
    descIframe: "URL of a JSON file or a compiled view.",
    descWidth: "Width.",
    descHeight: "Height.",
    descClassName: "CSS classes.",
    examples: "Examples",
    specDescription: "Quarterly sales 2025 (€k)",
    quarters: ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"],
    axisX: "Quarter",
    axisY: "Sales (€k)",
  },
} as const;

export default function DocAltairChartPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [width, setWidth] = useState<number | string>("100%");
  const [height, setHeight] = useState<number | string>(400);

  const sampleSpec: Record<string, unknown> = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: t.specDescription,
    data: { values: t.quarters.map((q, i) => ({ trimestre: q, ventes: QUARTERLY_SALES[i] })) },
    mark: "bar",
    encoding: {
      x: { field: "trimestre", type: "nominal", title: t.axisX },
      y: { field: "ventes", type: "quantitative", title: t.axisY },
    },
  };

  const pyWidth = width !== "100%" ? (typeof width === "number" ? `, width=${width}` : `, width="${width}"`) : "";
  const pyHeight = height !== 400 ? (typeof height === "number" ? `, height=${height}` : `, height="${height}"`) : "";
  const pythonCode = `bpm.altairChart(spec=spec_ventes_trimestre${pyWidth}${pyHeight})  # ventes par trimestre 2025 (k€)`;
  const { prev, next } = getPrevNext("altairchart");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.altairChart</div>
        <h1>bpm.altairChart</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 200 }}>
          <AltairChart spec={sampleSpec} width={width} height={height} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>width</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value || "100%")} />
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value || 400)} />
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
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>spec</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>—</td><td>{t.no}</td><td>{t.descSpec}</td></tr>
          <tr><td><code>iframeSrc</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descIframe}</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>{t.no}</td><td>{t.descWidth}</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>400</td><td>{t.no}</td><td>{t.descHeight}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'spec_ventes_trimestre = {"data": {"values": [{"trimestre": "T1 2025", "ventes": 260}, {"trimestre": "T2 2025", "ventes": 315}, {"trimestre": "T3 2025", "ventes": 309}, {"trimestre": "T4 2025", "ventes": 393}]}, "mark": "bar", "encoding": {"x": {"field": "trimestre", "type": "nominal"}, "y": {"field": "ventes", "type": "quantitative", "title": "Ventes (k€)"}}}\nbpm.altairChart(spec=spec_ventes_trimestre)'} language="python" />
      <CodeBlock code={'chart = alt.Chart(df_ventes).mark_bar().encode(x="trimestre", y="ventes")\nbpm.altairChart(spec=chart.to_dict())'} language="python" />
      <CodeBlock code={'bpm.altairChart(iframeSrc="/charts/ventes-trimestre-2025.json")'} language="python" />
      <CodeBlock code={'bpm.altairChart(spec=spec_ventes_trimestre, width=600, height=300)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
