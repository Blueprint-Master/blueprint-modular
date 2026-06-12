"use client";

import { useState } from "react";
import Link from "next/link";
import { PdfViewer } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocPdfPage() {
  const [src, setSrc] = useState("https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf");
  const pythonCode = "bpm.pdf(src=\"" + src + "\")";
  const { prev, next } = getPrevNext("pdf");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.pdf</div>
        <h1>bpm.pdf</h1>
        <p className="doc-description">Visualiseur PDF (iframe).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Média</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PdfViewer src={src} height={400} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>src (URL PDF)</label>
            <input type="text" value={src} onChange={(e) => setSrc(e.target.value)} className="w-full p-2 border rounded text-sm" />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>src</code></td><td>string</td><td>URL du PDF.</td></tr>
          <tr><td><code>width</code></td><td>string | number</td><td>Largeur (défaut 100%).</td></tr>
          <tr><td><code>height</code></td><td>string | number</td><td>Hauteur (défaut 600px).</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
