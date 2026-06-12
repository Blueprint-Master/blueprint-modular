"use client";

import { useState } from "react";
import Link from "next/link";
import { FAB } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocFABPage() {
  const [position, setPosition] = useState<"bottom-right" | "bottom-left" | "top-right" | "top-left">("bottom-right");
  const pythonCode = "bpm.fab(position=\"" + position + "\", label=\"Action\")";
  const { prev, next } = getPrevNext("fab");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.fab</div>
        <h1>bpm.fab</h1>
        <p className="doc-description">Bouton d&apos;action flottant (FAB).</p>
        <div className="doc-meta"><span className="doc-badge doc-badge-category">Interaction</span></div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 120 }}>
          <FAB position={position} label="Action" onClick={() => alert("FAB cliqué")} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>position</label>
            <select value={position} onChange={(e) => setPosition(e.target.value as typeof position)}>
              <option value="bottom-right">bottom-right</option>
              <option value="bottom-left">bottom-left</option>
              <option value="top-right">top-right</option>
              <option value="top-left">top-left</option>
            </select>
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
          <tr><td><code>icon</code></td><td>ReactNode</td><td>Icône (défaut: +).</td></tr>
          <tr><td><code>label</code></td><td>string</td><td>Accessibilité / title.</td></tr>
          <tr><td><code>onClick</code></td><td>function</td><td>Callback clic.</td></tr>
          <tr><td><code>position</code></td><td>string</td><td>bottom-right | bottom-left | top-right | top-left.</td></tr>
        </tbody>
      </table>
      <nav className="doc-pagination mt-8">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
