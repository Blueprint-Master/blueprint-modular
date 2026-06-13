"use client";

import Link from "next/link";
import { PlotlyChart } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocPlotlyPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Graphiques Plotly (iframe ou placeholder).",
    category: "Visualisation",
    head: { prop: "Prop", type: "Type", def: "Défaut" },
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Plotly charts (iframe or placeholder).",
    category: "Data visualization",
    head: { prop: "Prop", type: "Type", def: "Default" },
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const { prev, next } = getPrevNext("plotly");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.plotly</div>
        <h1>bpm.plotly</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PlotlyChart width="400px" height={300} />
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.plotly(iframe_src="...")  # ou sans iframe_src = placeholder'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>{t.head.prop}</th><th>{t.head.type}</th><th>{t.head.def}</th></tr></thead>
        <tbody>
          <tr><td>iframeSrc</td><td>string</td><td>—</td></tr>
          <tr><td>width</td><td>number | string</td><td>100%</td></tr>
          <tr><td>height</td><td>number | string</td><td>400</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
