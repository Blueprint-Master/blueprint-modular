"use client";

import { useState } from "react";
import Link from "next/link";
import { Container, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocContainerPage() {
  const [content, setContent] = useState("Contenu dans le conteneur.");

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = "bpm.container(bpm.text(\"" + escapedContent + "\"))";
  const { prev, next } = getPrevNext("container");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.container</div>
        <h1>bpm.container</h1>
        <p className="doc-description">Conteneur de mise en page (wrapper).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Mise en page</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Container>
            <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{content || " "}</span>
          </Container>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu…" />
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Oui</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Contenu du conteneur (texte, blocs, etc.).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={"bpm.container(bpm.text(\"Contenu\"))"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
