"use client";

import { useState } from "react";
import Link from "next/link";
import { PlotlyChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Trafic du site — sessions par jour (semaine en cours vs semaine précédente)
const SESSIONS_CURRENT = [3420, 3680, 3550, 3890, 4120, 2150, 1840];
const SESSIONS_PREVIOUS = [3180, 3410, 3290, 3620, 3850, 1980, 1720];

const L = {
  fr: {
    breadcrumb: "Composants",
    description: "Graphique Plotly (iframe ou placeholder). Démo : trafic du site — sessions par jour, semaine en cours vs semaine précédente.",
    category: "Graphiques",
    copy: "Copier",
    widthPlaceholder: "100% ou nombre",
    thDefault: "Défaut",
    thRequired: "Requis",
    no: "Non",
    descData: "Tableau de traces Plotly (ex. [{type:'bar', x:[], y:[]}]).",
    descLayout: "Config layout Plotly (title, xaxis, yaxis, etc.).",
    descConfig: "Config Plotly (responsive, displayModeBar, etc.).",
    descHeight: "Hauteur en pixels.",
    descWidth: "Largeur.",
    descIframe: "URL iframe (compatibilité ascendante).",
    descClassName: "Classes CSS.",
    examples: "Exemples",
    days: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    traceCurrent: "Semaine en cours",
    tracePrevious: "Semaine précédente",
  },
  en: {
    breadcrumb: "Components",
    description: "Plotly chart (iframe or placeholder). Demo: site traffic — sessions per day, current week vs previous week.",
    category: "Charts",
    copy: "Copy",
    widthPlaceholder: "100% or a number",
    thDefault: "Default",
    thRequired: "Required",
    no: "No",
    descData: "Array of Plotly traces (e.g. [{type:'bar', x:[], y:[]}]).",
    descLayout: "Plotly layout config (title, xaxis, yaxis, etc.).",
    descConfig: "Plotly config (responsive, displayModeBar, etc.).",
    descHeight: "Height in pixels.",
    descWidth: "Width.",
    descIframe: "Iframe URL (backward compatibility).",
    descClassName: "CSS classes.",
    examples: "Examples",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    traceCurrent: "Current week",
    tracePrevious: "Previous week",
  },
} as const;

export default function DocPlotlyChartPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [height, setHeight] = useState(380);
  const [width, setWidth] = useState<number | string>("100%");

  const days = [...t.days];
  const sampleData = [
    { x: days, y: SESSIONS_CURRENT, type: "scatter", name: t.traceCurrent },
    { x: days, y: SESSIONS_PREVIOUS, type: "scatter", name: t.tracePrevious },
  ];

  const pyHeight = height !== 380 ? `, height=${height}` : "";
  const pyWidth = width !== "100%" ? (typeof width === "number" ? `, width=${width}` : `, width="${width}"`) : "";
  const pythonCode = `bpm.plotlyChart(data=[{"x": ["Lun","Mar","Mer"], "y": [3420,3680,3550], "type": "scatter", "name": "Semaine en cours"}]${pyHeight}${pyWidth})`;
  const { prev, next } = getPrevNext("plotlychart");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.plotlyChart</div>
        <h1>bpm.plotlyChart</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PlotlyChart data={sampleData} height={height} width={width} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 380)} />
          </div>
          <div className="sandbox-control-group">
            <label>width</label>
            <input type="text" value={width} onChange={(e) => setWidth(e.target.value === "" ? "100%" : e.target.value)} placeholder={t.widthPlaceholder} />
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
          <tr><td><code>data</code></td><td><code>object[]</code></td><td>—</td><td>{t.no}</td><td>{t.descData}</td></tr>
          <tr><td><code>layout</code></td><td><code>object</code></td><td>—</td><td>{t.no}</td><td>{t.descLayout}</td></tr>
          <tr><td><code>config</code></td><td><code>object</code></td><td>—</td><td>{t.no}</td><td>{t.descConfig}</td></tr>
          <tr><td><code>height</code></td><td><code>number</code></td><td>380</td><td>{t.no}</td><td>{t.descHeight}</td></tr>
          <tr><td><code>width</code></td><td><code>number | string</code></td><td>100%</td><td>{t.no}</td><td>{t.descWidth}</td></tr>
          <tr><td><code>iframeSrc</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descIframe}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
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
