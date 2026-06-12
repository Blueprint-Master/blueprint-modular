"use client";

import Link from "next/link";
import { BarChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

// Commandes par région — cumul T1 2026
const sampleData = [
  { x: "IDF", y: 1842 },
  { x: "AURA", y: 1276 },
  { x: "PACA", y: 998 },
  { x: "Occitanie", y: 874 },
  { x: "Grand Est", y: 765 },
  { x: "Bretagne", y: 642 },
];

export default function DocBarChartPage() {
  const { prev, next } = getPrevNext("barchart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.barchart</div>
        <h1>bpm.barchart</h1>
        <p className="doc-description">Graphique en barres verticales. Données : liste de {`{ x, y }`}. Démo : commandes par région (T1 2026).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Graphiques</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 400, height: 200 }}>
            <BarChart data={sampleData} width={400} height={200} />
          </div>
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.barchart(data=[{"x": "IDF", "y": 1842}, {"x": "AURA", "y": 1276}, ...])  # commandes par région'}</code></pre>
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
      <CodeBlock code={'bpm.barchart("IDF,1842;AURA,1276;PACA,998;Occitanie,874;Grand Est,765;Bretagne,642")  # commandes par région, format sandbox'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
