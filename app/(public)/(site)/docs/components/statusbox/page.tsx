"use client";

import { useState } from "react";
import Link from "next/link";
import { StatusBox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type State = "running" | "complete" | "error";

export default function DocStatusBoxPage() {
  const [label, setLabel] = useState("Traitement en cours");
  const [state, setState] = useState<State>("running");
  const [content, setContent] = useState("Détails ou message additionnel.");
  const [defaultExpanded, setDefaultExpanded] = useState(true);

  const escapedLabel = label.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = "bpm.statusbox(label=\"" + escapedLabel + "\", state=\"" + state + "\", default_expanded=" + defaultExpanded + ")";
  const { prev, next } = getPrevNext("statusbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.statusbox</div>
        <h1>bpm.statusbox</h1>
        <p className="doc-description">Bloc repliable avec état (running, complete, error).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Affichage de données</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <StatusBox
            label={label || "Label"}
            state={state}
            defaultExpanded={defaultExpanded}
          >
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{content || " "}</span>
          </StatusBox>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label" />
          </div>
          <div className="sandbox-control-group">
            <label>state</label>
            <select value={state} onChange={(e) => setState(e.target.value as State)}>
              <option value="running">running</option>
              <option value="complete">complete</option>
              <option value="error">error</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>children (contenu)</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Détails…" />
          </div>
          <div className="sandbox-control-group">
            <label>defaultExpanded</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={defaultExpanded} onChange={(e) => setDefaultExpanded(e.target.checked)} />
              Ouvert par défaut
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Oui</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Libellé du statut (ex. &quot;En cours&quot;, &quot;Terminé&quot;).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>state</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>running | complete | error</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>running</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>État affiché (spinner, checkmark ou erreur).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Détails repliables sous le libellé.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>defaultExpanded</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>true</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Afficher les détails ouverts par défaut.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={"bpm.statusbox(label=\"En cours…\", state=\"running\")"} language="python" />
      <CodeBlock code={"bpm.statusbox(label=\"Terminé\", state=\"complete\")"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
