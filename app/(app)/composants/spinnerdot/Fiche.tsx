"use client";

import { useState } from "react";
import Link from "next/link";
import { SpinnerDot, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type SizeOption = "small" | "medium" | "large";

const fr = {
  breadcrumb: "Composants",
  description: "Indicateur de chargement compact (points / cercle tournant), pour usage inline (ex. bulle assistant).",
  category: "Feedback",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  descSize: "Taille du spinner (16px, 24px, 32px).",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Compact loading indicator (dots / spinning circle), for inline use (e.g. assistant bubble).",
  category: "Feedback",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  descSize: "Spinner size (16px, 24px, 32px).",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocSpinnerDotPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [size, setSize] = useState<SizeOption>("medium");

  const pySize = size !== "medium" ? `, size="${size}"` : "";
  const pythonCode = `bpm.spinnerDot()${pySize}`;
  const { prev, next } = getPrevNext("spinnerdot");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.spinnerDot</div>
        <h1>bpm.spinnerDot</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <SpinnerDot size={size} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as SizeOption)}>
              <option value="small">small (16px)</option>
              <option value="medium">medium (24px)</option>
              <option value="large">large (32px)</option>
            </select>
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>size</code></td><td><code>small | medium | large</code></td><td>medium</td><td>{t.no}</td><td>{t.descSize}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.spinnerDot()  # medium par défaut"} language="python" />
      <CodeBlock code={'bpm.spinnerDot(size="small")'} language="python" />
      <CodeBlock code={'bpm.spinnerDot(size="large")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
