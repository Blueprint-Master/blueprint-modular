"use client";

import Link from "next/link";
import { AltairChart } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  category: "Graphiques",
  description: "Graphique Altair / Vega-Lite (spec ou iframe).",
};

const en: typeof fr = {
  components: "Components",
  category: "Charts",
  description: "Altair / Vega-Lite chart (spec or iframe).",
};

const L = { fr, en } as const;

export default function DocAltairPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const { prev, next } = getPrevNext("altair");
  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.altair</div>
        <h1>bpm.altair</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <AltairChart width={400} height={300} />
        </div>
        <div className="sandbox-code">
          <pre><code>{'bpm.altair(spec=...) ou bpm.altair(iframe_src="...")'}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th></tr></thead>
        <tbody>
          <tr><td>spec</td><td>object (Vega-Lite)</td></tr>
          <tr><td>iframeSrc</td><td>string</td></tr>
          <tr><td>width</td><td>number | string</td></tr>
          <tr><td>height</td><td>number | string</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
