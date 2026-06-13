"use client";

import { useState } from "react";
import Link from "next/link";
import { PdfViewer } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocPdfPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Visualiseur PDF (iframe).",
    category: "Média",
    srcLabel: "src (URL PDF)",
    copy: "Copier",
    propsHead: { prop: "Prop", type: "Type", desc: "Description" },
    rows: {
      src: "URL du PDF.",
      width: "Largeur (défaut 100%).",
      height: "Hauteur (défaut 600px).",
    },
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "PDF viewer (iframe).",
    category: "Media",
    srcLabel: "src (PDF URL)",
    copy: "Copy",
    propsHead: { prop: "Prop", type: "Type", desc: "Description" },
    rows: {
      src: "PDF URL.",
      width: "Width (default 100%).",
      height: "Height (default 600px).",
    },
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [src, setSrc] = useState("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf");
  const pythonCode = "bpm.pdf(src=\"" + src + "\")";
  const { prev, next } = getPrevNext("pdf");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.pdf</div>
        <h1>bpm.pdf</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">{t.category}</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PdfViewer src={src} height={400} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.srcLabel}</label>
            <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>{t.propsHead.prop}</th><th>{t.propsHead.type}</th><th>{t.propsHead.desc}</th></tr></thead>
        <tbody>
          <tr><td><code>src</code></td><td>string</td><td>{t.rows.src}</td></tr>
          <tr><td><code>width</code></td><td>string | number</td><td>{t.rows.width}</td></tr>
          <tr><td><code>height</code></td><td>string | number</td><td>{t.rows.height}</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
