"use client";

import { useState } from "react";
import Link from "next/link";
import { Rating, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Size = "small" | "medium" | "large";

export default function DocRatingPage() {
  const [value, setValue] = useState(3);
  const [max, setMax] = useState(5);
  const [disabled, setDisabled] = useState(false);
  const [size, setSize] = useState<Size>("medium");

  const pythonCode = `bpm.rating(value=${value}, max=${max}, size="${size}", disabled=${disabled})`;
  const { prev, next } = getPrevNext("rating");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.rating</div>
        <h1>bpm.rating</h1>
        <p className="doc-description">Notation par étoiles.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">Interaction</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Rating
            value={value}
            max={max}
            size={size}
            disabled={disabled}
            onChange={(v) => setValue(v)}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input
              type="number"
              min={0}
              max={max}
              value={value}
              onChange={(e) => setValue(Number(e.target.value) || 0)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>max</label>
            <input
              type="number"
              min={1}
              max={10}
              value={max}
              onChange={(e) => setMax(Math.max(1, Number(e.target.value) || 5))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as Size)}>
              <option value="small">small</option>
              <option value="medium">medium</option>
              <option value="large">large</option>
            </select>
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
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>value</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>number</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>0</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Nombre d&apos;étoiles affichées.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>max</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>number</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>5</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Nombre maximum d&apos;étoiles.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>size</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>small | medium | large</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>medium</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Taille des étoiles.</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Lecture seule (pas de clic).</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onChange</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Non</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Callback (value: number).</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemple</h2>
      <CodeBlock code={"bpm.rating(value=3, max=5)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
