"use client";

import { useState } from "react";
import Link from "next/link";
import { PlotlyChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

// Trafic du site — sessions par jour (semaine en cours vs semaine précédente)
const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const SAMPLE_DATA = [
  { x: JOURS, y: [3420, 3680, 3550, 3890, 4120, 2150, 1840], type: "scatter", name: "Semaine en cours" },
  { x: JOURS, y: [3180, 3410, 3290, 3620, 3850, 1980, 1720], type: "scatter", name: "Semaine précédente" },
];

export default function DocPlotlyChartPage() {
  const [height, setHeight] = useState(380);
  const [width, setWidth] = useState<number | string>("100%");

  const pyHeight = height !== 380 ? `, height=${height}` : "";
  const pyWidth = width !== "100%" ? (typeof width === "number" ? `, width=${width}` : `, width="${width}"`) : "";
  const pythonCode = `bpm.plotlyChart(data=[{"x": ["Lun","Mar","Mer"], "y": [3420,3680,3550], "type": "scatter", "name": "Semaine en cours"}]${pyHeight}${pyWidth})`;
  const { prev, next } = getPrevNext("plotlychart");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.plotlyChart</div>
        <h1>bpm.plotlyChart</h1>
        <p className="doc-description">Graphique Plotly (iframe ou placeholder). Démo : trafic du site — sessions par jour, semaine en cours vs semaine précédente.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Graphiques</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PlotlyChart data={SAMPLE_DATA} height={height} width={width} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 380)} />
          </div>
          <div className="sandbox-control-group">
            <label>width</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value === "" ? "100%" : e.target.value)} placeholder="100% ou nombre" />
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
          <tr><td><code>data</code></td><td><code>object[]</code></td><td>—</td><td>Non</td><td>{'Tableau de traces Plotly (ex. [{type:\'bar\', x:[], y:[]}]).'}</td></tr>
          <tr><td><code>layout</code></td><td><code>object</code></td><td>—</td><td>Non</td><td>Config layout Plotly (title, xaxis, yaxis, etc.).</td></tr>
          <tr><td><code>config</code></td><td><code>object</code></td><td>—</td><td>Non</td><td>Config Plotly (responsive, displayModeBar, etc.).</td></tr>
          <tr><td><code>height</code></td><td><code>number</code></td><td>380</td><td>Non</td><td>Hauteur en pixels.</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>Non</td><td>Largeur.</td></tr>
          <tr><td><code>iframeSrc</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>URL iframe (compatibilité ascendante).</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>Non</td><td>Classes CSS.</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.plotlyChart(data=[{"x": ["Lun","Mar","Mer","Jeu","Ven"], "y": [3420,3680,3550,3890,4120], "type": "scatter", "name": "Sessions"}])'} language="python" />
      <CodeBlock code={'bpm.plotlyChart(data=traces, layout={"title": "Trafic du site — sessions par jour"}, height=400)'} language="python" />
      <CodeBlock code={'bpm.plotlyChart(data=[{"x": ["Sam","Dim"], "y": [2150,1840], "type": "bar", "name": "Week-end"}])'} language="python" />
      <CodeBlock code={'bpm.plotlyChart(iframeSrc="https://...")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
