"use client";

import { useState } from "react";
import Link from "next/link";
import { AltairChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

// Spec Vega-Lite : ventes par trimestre 2025 (k€)
const SAMPLE_SPEC: Record<string, unknown> = {
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description: "Ventes par trimestre 2025 (k€)",
  data: { values: [
    { trimestre: "T1 2025", ventes: 260 },
    { trimestre: "T2 2025", ventes: 315 },
    { trimestre: "T3 2025", ventes: 309 },
    { trimestre: "T4 2025", ventes: 393 },
  ]},
  mark: "bar",
  encoding: {
    x: { field: "trimestre", type: "nominal", title: "Trimestre" },
    y: { field: "ventes", type: "quantitative", title: "Ventes (k€)" },
  },
};

export default function DocAltairChartPage() {
  const [width, setWidth] = useState<number | string>("100%");
  const [height, setHeight] = useState<number | string>(400);

  const pyWidth = width !== "100%" ? (typeof width === "number" ? `, width=${width}` : `, width="${width}"`) : "";
  const pyHeight = height !== 400 ? (typeof height === "number" ? `, height=${height}` : `, height="${height}"`) : "";
  const pythonCode = `bpm.altairChart(spec=spec_ventes_trimestre${pyWidth}${pyHeight})  # ventes par trimestre 2025 (k€)`;
  const { prev, next } = getPrevNext("altairchart");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.altairChart</div>
        <h1>bpm.altairChart</h1>
        <p className="doc-description">Graphique Altair / Vega-Lite. Démo : ventes par trimestre 2025 (k€) en barres Vega-Lite.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Graphiques</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 200 }}>
          <AltairChart spec={SAMPLE_SPEC} width={width} height={height} />
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
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Requis</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>spec</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>—</td><td>Non</td><td>Spécification Vega-Lite / Altair (JSON).</td></tr>
          <tr><td><code>iframeSrc</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>URL d&apos;un fichier JSON ou d&apos;une vue compilée.</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>Non</td><td>Largeur.</td></tr>
          <tr><td><code>height</code></td><td><code>number | string</code></td><td>400</td><td>Non</td><td>Hauteur.</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
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
