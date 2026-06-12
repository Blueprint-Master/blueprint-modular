"use client";

import Link from "next/link";
import { AreaChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

// Utilisateurs actifs hebdomadaires — 12 semaines, croissance avec bruit léger
const sampleData = [
  { x: "S1", y: 1240 }, { x: "S2", y: 1310 }, { x: "S3", y: 1295 }, { x: "S4", y: 1420 },
  { x: "S5", y: 1505 }, { x: "S6", y: 1480 }, { x: "S7", y: 1610 }, { x: "S8", y: 1720 },
  { x: "S9", y: 1695 }, { x: "S10", y: 1840 }, { x: "S11", y: 1930 }, { x: "S12", y: 2050 },
];

export default function DocAreaChartPage() {
  const { prev, next } = getPrevNext("areachart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.areachart</div>
        <h1>bpm.areachart</h1>
        <p className="doc-description">Graphique en aires (courbe remplie). Données : liste de {`{ x, y }`}. Démo : utilisateurs actifs hebdomadaires sur 12 semaines.</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Graphiques</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 400, height: 200 }}>
            <AreaChart data={sampleData} width={400} height={200} />
          </div>
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.areachart(data=[{"x": "S1", "y": 1240}, {"x": "S2", "y": 1310}, ..., {"x": "S12", "y": 2050}])  # utilisateurs actifs hebdo'}</code></pre>
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
      <CodeBlock code={'bpm.areachart("S1,1240;S2,1310;S3,1295;S4,1420;S5,1505;S6,1480;S7,1610;S8,1720;S9,1695;S10,1840;S11,1930;S12,2050")  # utilisateurs actifs hebdo, format sandbox'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
