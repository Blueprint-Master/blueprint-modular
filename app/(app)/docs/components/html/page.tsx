"use client";

import { useState } from "react";
import Link from "next/link";
import { Html, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

const DEFAULT_HTML = "<p>Hello <strong>world</strong>.</p>\n<p><em>Contenu HTML</em> rendu ici.</p>";

export default function DocHtmlPage() {
  const [html, setHtml] = useState(DEFAULT_HTML);

  const escapedHtml = html.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const pythonCode = "bpm.html(\"" + escapedHtml + "\")";
  const { prev, next } = getPrevNext("html");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.html</div>
        <h1>bpm.html</h1>
        <p className="doc-description">Contenu HTML brut (à n&apos;utiliser qu&apos;avec du contenu de confiance ou sanitized).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Média</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full rounded border p-4 min-h-[80px]" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
            <Html html={html || "<p>(vide)</p>"} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>html</label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<p>...</p>"
              rows={6}
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Paramètres</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Paramètre</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Défaut</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Requis</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>html</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Oui</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>HTML brut à afficher (contenu de confiance uniquement).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.html("<p>Texte <strong>gras</strong>.</p>")'} language="python" />
      <CodeBlock code={'bpm.html("<ul><li>Item 1</li><li>Item 2</li></ul>")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
