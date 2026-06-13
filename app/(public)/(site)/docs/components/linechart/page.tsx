"use client";

import Link from "next/link";
import { LineChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Chiffre d'affaires mensuel 2025 (k€) — saisonnalité avec creux en août
const REVENUE = [82, 85, 93, 98, 105, 112, 104, 88, 117, 124, 131, 138];

const L = {
  fr: {
    breadcrumb: "Composants",
    descBefore: "Graphique en courbes (ligne). Données : liste de ",
    descAfter: ". Démo : chiffre d'affaires mensuel 2025 (k€).",
    category: "Graphiques",
    thDefault: "Défaut",
    example: "Exemple",
    months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
  },
  en: {
    breadcrumb: "Components",
    descBefore: "Line chart. Data: a list of ",
    descAfter: ". Demo: monthly revenue 2025 (€k).",
    category: "Charts",
    thDefault: "Default",
    example: "Example",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
} as const;

export default function DocLineChartPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const sampleData = t.months.map((m, i) => ({ x: m, y: REVENUE[i] }));
  const { prev, next } = getPrevNext("linechart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.linechart</div>
        <h1>bpm.linechart</h1>
        <p className="doc-description">{t.descBefore}{`{ x, y }`}{t.descAfter}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ width: 400, height: 200 }}>
            <LineChart data={sampleData} width={400} height={200} />
          </div>
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.linechart(data=[{"x": "Jan", "y": 82}, {"x": "Fév", "y": 85}, ..., {"x": "Déc", "y": 138}])  # CA 2025 (k€)'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th></tr></thead>
        <tbody>
          <tr><td>data</td><td>{`Array<{ x: string | number, y: number }>`}</td><td>—</td></tr>
          <tr><td>width</td><td>number</td><td>400</td></tr>
          <tr><td>height</td><td>number</td><td>200</td></tr>
          <tr><td>color</td><td>string</td><td>var(--bpm-accent-cyan)</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={'bpm.linechart("Jan,82;Fév,85;Mar,93;Avr,98;Mai,105;Juin,112;Juil,104;Août,88;Sep,117;Oct,124;Nov,131;Déc,138")  # CA mensuel 2025 (k€), format sandbox'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
