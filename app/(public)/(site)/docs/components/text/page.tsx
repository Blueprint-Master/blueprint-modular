"use client";

import { useState } from "react";
import Link from "next/link";
import { Text, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTextPage() {
  const [content, setContent] = useState("Texte corps");
  const [mono, setMono] = useState(false);

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = mono
    ? "bpm.text(\"" + escapedContent + "\", mono=True)"
    : "bpm.text(\"" + escapedContent + "\")";
  const { prev, next } = getPrevNext("text");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.text</div>
        <h1>bpm.text</h1>
        <p className="doc-description">Texte simple (niveau corps).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Affichage de données</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Text mono={mono}>{content || " "}</Text>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Texte…" />
          </div>
          <div className="sandbox-control-group">
            <label>mono</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={mono} onChange={(e) => setMono(e.target.checked)} />
              Monospace
            </label>
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string | ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Oui</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Texte ou contenu à afficher.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>mono</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Police monospace (ex. code inline).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.text(\"Texte corps\")"} language="python" />
      <CodeBlock code={"bpm.text(\"Code inline\", mono=True)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
