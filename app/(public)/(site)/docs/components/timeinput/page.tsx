"use client";

import { useState } from "react";
import Link from "next/link";
import { TimeInput, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocTimeInputPage() {
  const [value, setValue] = useState<string>("09:00");
  const [label, setLabel] = useState("Heure");
  const [disabled, setDisabled] = useState(false);

  const handleChange = (d: Date | null) => {
    setValue(d ? d.toTimeString().slice(0, 5) : "");
  };

  const pythonCode = "bpm.timeinput(label=\"" + label.replace(/"/g, '\\"') + "\", value=\"" + value + "\", disabled=" + disabled + ")";
  const { prev, next } = getPrevNext("timeinput");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.timeinput</div>
        <h1>bpm.timeinput</h1>
        <p className="doc-description">Saisie d&apos;une heure (HH:MM).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Saisie</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <TimeInput
            label={label || undefined}
            value={value || null}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Heure" />
          </div>
          <div className="sandbox-control-group">
            <label>value (HH:MM)</label>
            <input type="time" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              Désactivé
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Libellé au-dessus du champ.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>value</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date | string | null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Heure (ex. &quot;09:00&quot; ou Date).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onChange</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Callback (value: Date | null).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Désactive le champ.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={"bpm.timeinput(label=\"Heure\", value=\"09:00\")"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
