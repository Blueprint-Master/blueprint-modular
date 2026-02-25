"use client";

import { useState } from "react";
import Link from "next/link";
import { DateRangePicker, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

export default function DocDateRangePickerPage() {
  const [start, setStart] = useState<string | null>("2025-01-01");
  const [end, setEnd] = useState<string | null>("2025-01-31");
  const [label, setLabel] = useState("Période");
  const [disabled, setDisabled] = useState(false);

  const handleChange = (s: Date | null, e: Date | null) => {
    setStart(s ? s.toISOString().split("T")[0] : null);
    setEnd(e ? e.toISOString().split("T")[0] : null);
  };

  const pythonCode = "bpm.daterangepicker(label=\"" + label.replace(/"/g, '\\"') + "\", start=\"" + (start || "") + "\", end=\"" + (end || "") + "\", disabled=" + disabled + ")";
  const { prev, next } = getPrevNext("daterangepicker");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.daterangepicker</div>
        <h1>bpm.daterangepicker</h1>
        <p className="doc-description">Sélection d&apos;une plage de dates (début – fin).</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Saisie</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <DateRangePicker
            label={label || undefined}
            start={start}
            end={end}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Période" />
          </div>
          <div className="sandbox-control-group">
            <label>start</label>
            <input type="date" value={start || ""} onChange={(e) => setStart(e.target.value || null)} />
          </div>
          <div className="sandbox-control-group">
            <label>end</label>
            <input type="date" value={end || ""} onChange={(e) => setEnd(e.target.value || null)} />
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Libellé au-dessus des champs.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>start</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date | string | null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date de début (ISO ou Date).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>end</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date | string | null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date de fin.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onChange</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Callback (start, end).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Désactive les champs.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={"bpm.daterangepicker(label=\"Période\", start=\"2025-01-01\", end=\"2025-01-31\")"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
