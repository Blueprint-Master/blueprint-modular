"use client";

import { useState } from "react";
import Link from "next/link";
import { Empty, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocEmptyPage() {
  const [content, setContent] = useState("—");

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = content.trim() ? "bpm.empty(bpm.text(\"" + escapedContent + "\"))" : "bpm.empty()";
  const { prev, next } = getPrevNext("empty");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.empty</div>
        <h1>bpm.empty</h1>
        <p className="doc-description">Bloc vide ou placeholder (min-height).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Mise en page</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Empty>
            {content.trim() ? (
              <span className="text-sm opacity-70" style={{ color: "var(--bpm-text-secondary)" }}>{content}</span>
            ) : null}
          </Empty>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children (optionnel)</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Vide ou —" />
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Message ou contenu optionnel (ex. tiret, icône).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.empty()"} language="python" />
      <CodeBlock code={"bpm.empty(bpm.text(\"—\"))"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
