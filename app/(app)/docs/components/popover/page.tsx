"use client";

import { useState } from "react";
import Link from "next/link";
import { Popover, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Placement = "top" | "bottom" | "left" | "right";

export default function DocPopoverPage() {
  const [triggerLabel, setTriggerLabel] = useState("Ouvrir");
  const [content, setContent] = useState("Contenu du popover");
  const [placement, setPlacement] = useState<Placement>("bottom");

  const escapedTrigger = triggerLabel.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = "bpm.popover(trigger=bpm.button(\"" + escapedTrigger + "\"), content=bpm.text(\"" + escapedContent + "\"), placement=\"" + placement + "\")";
  const { prev, next } = getPrevNext("popover");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.popover</div>
        <h1>bpm.popover</h1>
        <p className="doc-description">Contenu au clic sur un déclencheur (trigger).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Mise en page</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Popover
            placement={placement}
            trigger={<Button size="small">{triggerLabel || "Ouvrir"}</Button>}
          >
            <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{content || " "}</span>
          </Popover>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>trigger (label)</label>
            <input type="text" value={triggerLabel} onChange={(e) => setTriggerLabel(e.target.value)} placeholder="Ouvrir" />
          </div>
          <div className="sandbox-control-group">
            <label>children (contenu)</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenu…" />
          </div>
          <div className="sandbox-control-group">
            <label>placement</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>trigger</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Oui</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Élément déclencheur (ex. bouton).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Oui</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Contenu affiché au clic.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>placement</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>top | bottom | left | right</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>bottom</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Position du popover.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={"bpm.popover(trigger=bpm.button(\"Ouvrir\"), content=bpm.text(\"Contenu\"))"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
