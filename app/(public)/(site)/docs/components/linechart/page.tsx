"use client";

import Link from "next/link";
import { LineChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const sampleData = [{ x: "Jan", y: 10 }, { x: "Fév", y: 20 }, { x: "Mar", y: 15 }, { x: "Avr", y: 28 }, { x: "Mai", y: 22 }];

export default function DocLineChartPage() {
  const { prev, next } = getPrevNext("linechart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.linechart</div>
        <h1>bpm.linechart</h1>
        <p className="doc-description">Graphique en courbes (ligne). Données : liste de {`{ x, y }`}.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Graphiques</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 400, height: 200 }}>
            <LineChart data={sampleData} width={400} height={200} />
          </div>
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.linechart(data=[{"x": "Jan", "y": 10}, {"x": "Fév", "y": 20}, ...])'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Défaut</th></tr></thead>
        <tbody>
          <tr><td>data</td><td>{`Array<{ x: string | number, y: number }>`}</td><td>—</td></tr>
          <tr><td>width</td><td>number</td><td>400</td></tr>
          <tr><td>height</td><td>number</td><td>200</td></tr>
          <tr><td>color</td><td>string</td><td>var(--bpm-accent-cyan)</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={'bpm.linechart("Jan,10;Fév,20;Mar,15;Avr,28;Mai,22")  # format sandbox'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
