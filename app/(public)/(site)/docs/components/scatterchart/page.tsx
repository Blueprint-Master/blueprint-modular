"use client";

import Link from "next/link";
import { ScatterChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const sampleData = [{ x: 10, y: 20 }, { x: 30, y: 40 }, { x: 50, y: 35 }, { x: 70, y: 60 }, { x: 90, y: 45 }];

export default function DocScatterChartPage() {
  const { prev, next } = getPrevNext("scatterchart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.scatterchart</div>
        <h1>bpm.scatterchart</h1>
        <p className="doc-description">Graphique en nuage de points. Données : liste de {`{ x, y }`} (nombres).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Graphiques</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 400, height: 200 }}>
            <ScatterChart data={sampleData} width={400} height={200} />
          </div>
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.scatterchart(data=[{"x": 10, "y": 20}, {"x": 30, "y": 40}, ...])'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Défaut</th></tr></thead>
        <tbody>
          <tr><td>data</td><td>{`Array<{ x: number, y: number }>`}</td><td>—</td></tr>
          <tr><td>width</td><td>number</td><td>400</td></tr>
          <tr><td>height</td><td>number</td><td>200</td></tr>
          <tr><td>color</td><td>string</td><td>var(--bpm-accent-cyan)</td></tr>
          <tr><td>radius</td><td>number</td><td>4</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={'bpm.scatterchart(data=[{"x": 10, "y": 20}, {"x": 30, "y": 40}, {"x": 50, "y": 35}])'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
