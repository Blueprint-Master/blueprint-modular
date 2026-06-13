"use client";

import { useState } from "react";
import Link from "next/link";
import { Rating, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Size = "small" | "medium" | "large";

export default function DocRatingPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Notation par étoiles.",
    category: "Interaction",
    disabledLabel: "Désactivé",
    copy: "Copier",
    paramsTitle: "Paramètres",
    head: { param: "Paramètre", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    no: "Non",
    rows: {
      value: (<>Nombre d&apos;étoiles affichées.</>),
      max: (<>Nombre maximum d&apos;étoiles.</>),
      size: "Taille des étoiles.",
      disabled: "Lecture seule (pas de clic).",
      onChange: "Callback (value: number).",
    },
    exampleTitle: "Exemple",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Star rating.",
    category: "Interaction",
    disabledLabel: "Disabled",
    copy: "Copy",
    paramsTitle: "Parameters",
    head: { param: "Parameter", type: "Type", def: "Default", req: "Required", desc: "Description" },
    no: "No",
    rows: {
      value: (<>Number of stars shown.</>),
      max: (<>Maximum number of stars.</>),
      size: "Star size.",
      disabled: "Read-only (no click).",
      onChange: "Callback (value: number).",
    },
    exampleTitle: "Example",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [value, setValue] = useState(3);
  const [max, setMax] = useState(5);
  const [disabled, setDisabled] = useState(false);
  const [size, setSize] = useState<Size>("medium");

  const pythonCode = `bpm.rating(value=${value}, max=${max}, size="${size}", disabled=${disabled})`;
  const { prev, next } = getPrevNext("rating");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.rating</div>
        <h1>bpm.rating</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
              {t.disabledLabel}
            </label>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.paramsTitle}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.param}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.type}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.def}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.req}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.head.desc}</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>value</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>number</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>0</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.value}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>max</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>number</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>5</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.max}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>size</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>small | medium | large</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>medium</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.size}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.disabled}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onChange</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.rows.onChange}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.exampleTitle}</h2>
      <CodeBlock code={"bpm.rating(value=3, max=5)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
