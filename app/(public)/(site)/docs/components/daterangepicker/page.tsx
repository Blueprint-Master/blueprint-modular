"use client";

import { useState } from "react";
import Link from "next/link";
import { DateRangePicker, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Sélection d’une plage de dates (début – fin).",
  category: "Saisie",
  disabledLabel: "Désactivé",
  copy: "Copier",
  parameters: "Paramètres",
  thParameter: "Paramètre",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  example: "Exemple",
  d_label: "Libellé au-dessus des champs.",
  d_start: "Date de début (ISO ou Date).",
  d_end: "Date de fin.",
  d_onChange: "Callback (start, end).",
  d_disabled: "Désactive les champs.",
};

const en: typeof fr = {
  components: "Components",
  description: "Select a date range (start – end).",
  category: "Inputs",
  disabledLabel: "Disabled",
  copy: "Copy",
  parameters: "Parameters",
  thParameter: "Parameter",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  example: "Example",
  d_label: "Label above the fields.",
  d_start: "Start date (ISO or Date).",
  d_end: "End date.",
  d_onChange: "Callback (start, end).",
  d_disabled: "Disables the fields.",
};

const L = { fr, en } as const;

export default function DocDateRangePickerPage() {
  const { locale } = useI18n();
  const t = L[locale];
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
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.daterangepicker</div>
        <h1>bpm.daterangepicker</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.parameters}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParameter}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_label}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>start</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date | string | null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_start}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>end</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date | string | null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_end}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onChange</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_onChange}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_disabled}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={"bpm.daterangepicker(label=\"Période\", start=\"2025-01-01\", end=\"2025-01-31\")"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
