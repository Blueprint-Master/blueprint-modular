"use client";

import Link from "next/link";
import { ScatterChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Prix vs surface — 20 annonces immobilières (x : surface en m², y : prix en k€)
const sampleData = [
  { x: 28, y: 132 }, { x: 34, y: 158 }, { x: 41, y: 176 }, { x: 45, y: 198 },
  { x: 52, y: 224 }, { x: 55, y: 240 }, { x: 58, y: 236 }, { x: 63, y: 268 },
  { x: 67, y: 285 }, { x: 72, y: 301 }, { x: 75, y: 322 }, { x: 81, y: 338 },
  { x: 85, y: 362 }, { x: 90, y: 378 }, { x: 94, y: 405 }, { x: 102, y: 431 },
  { x: 108, y: 452 }, { x: 115, y: 489 }, { x: 122, y: 512 }, { x: 130, y: 548 },
];

const L = {
  fr: {
    breadcrumb: "Composants",
    descBefore: "Graphique en nuage de points. Données : liste de ",
    descAfter: " (nombres). Démo : prix vs surface de 20 annonces immobilières (m², k€).",
    category: "Graphiques",
    thDefault: "Défaut",
    example: "Exemple",
  },
  en: {
    breadcrumb: "Components",
    descBefore: "Scatter chart. Data: a list of ",
    descAfter: " (numbers). Demo: price vs floor area for 20 property listings (m², €k).",
    category: "Charts",
    thDefault: "Default",
    example: "Example",
  },
} as const;

export default function DocScatterChartPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const { prev, next } = getPrevNext("scatterchart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.scatterchart</div>
        <h1>bpm.scatterchart</h1>
        <p className="doc-description">{t.descBefore}{`{ x, y }`}{t.descAfter}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 400, height: 200 }}>
            <ScatterChart data={sampleData} width={400} height={200} />
          </div>
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.scatterchart(data=[{"x": 28, "y": 132}, {"x": 34, "y": 158}, ..., {"x": 130, "y": 548}])  # prix (k€) vs surface (m²)'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th></tr></thead>
        <tbody>
          <tr><td>data</td><td>{`Array<{ x: number, y: number }>`}</td><td>—</td></tr>
          <tr><td>width</td><td>number</td><td>400</td></tr>
          <tr><td>height</td><td>number</td><td>200</td></tr>
          <tr><td>color</td><td>string</td><td>var(--bpm-accent-cyan)</td></tr>
          <tr><td>radius</td><td>number</td><td>4</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={'bpm.scatterchart(data=[{"x": 28, "y": 132}, {"x": 52, "y": 224}, {"x": 85, "y": 362}, {"x": 130, "y": 548}])  # annonces immobilières : surface (m²) → prix (k€)'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
