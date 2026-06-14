"use client";

import Link from "next/link";
import { AreaChart, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

// Utilisateurs actifs hebdomadaires — 12 semaines, croissance avec bruit léger
const WEEKLY_USERS = [1240, 1310, 1295, 1420, 1505, 1480, 1610, 1720, 1695, 1840, 1930, 2050];

const L = {
  fr: {
    breadcrumb: "Composants",
    descBefore: "Graphique en aires (courbe remplie). Données : liste de ",
    descAfter: ". Démo : utilisateurs actifs hebdomadaires sur 12 semaines.",
    category: "Graphiques",
    thDefault: "Défaut",
    example: "Exemple",
    weekPrefix: "S",
  },
  en: {
    breadcrumb: "Components",
    descBefore: "Area chart (filled line). Data: a list of ",
    descAfter: ". Demo: weekly active users over 12 weeks.",
    category: "Charts",
    thDefault: "Default",
    example: "Example",
    weekPrefix: "W",
  },
} as const;

export default function DocAreaChartPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const sampleData = WEEKLY_USERS.map((y, i) => ({ x: `${t.weekPrefix}${i + 1}`, y }));
  const { prev, next } = getPrevNext("areachart");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.areachart</div>
        <h1>bpm.areachart</h1>
        <p className="doc-description">{t.descBefore}{`{ x, y }`}{t.descAfter}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
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
        <thead><tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th></tr></thead>
        <tbody>
          <tr><td>data</td><td>{`Array<{ x: string | number, y: number }>`}</td><td>—</td></tr>
          <tr><td>width</td><td>number</td><td>400</td></tr>
          <tr><td>height</td><td>number</td><td>200</td></tr>
          <tr><td>color</td><td>string</td><td>var(--bpm-accent-cyan)</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={'bpm.areachart("S1,1240;S2,1310;S3,1295;S4,1420;S5,1505;S6,1480;S7,1610;S8,1720;S9,1695;S10,1840;S11,1930;S12,2050")  # utilisateurs actifs hebdo, format sandbox'} language="python" />
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
