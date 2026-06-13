"use client";

import { useState } from "react";
import Link from "next/link";
import { TimeInput, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description: "Saisie d'une heure (HH:MM).",
  category: "Saisie",
  labelHint: "Heure",
  disabledLabel: "Désactivé",
  copy: "Copier",
  params: "Paramètres",
  thParam: "Paramètre",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  descLabel: "Libellé au-dessus du champ.",
  descValue: "Heure (ex. \"09:00\" ou Date).",
  descOnChange: "Callback (value: Date | null).",
  descDisabled: "Désactive le champ.",
  example: "Exemple",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Time input (HH:MM).",
  category: "Inputs",
  labelHint: "Time",
  disabledLabel: "Disabled",
  copy: "Copy",
  params: "Parameters",
  thParam: "Parameter",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  descLabel: "Label above the field.",
  descValue: "Time (e.g. \"09:00\" or Date).",
  descOnChange: "Callback (value: Date | null).",
  descDisabled: "Disables the field.",
  example: "Example",
};
const L = { fr, en } as const;

export default function DocTimeInputPage() {
  const { locale } = useI18n();
  const t = L[locale];
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
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.timeinput</div>
        <h1>bpm.timeinput</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
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
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.labelHint} />
          </div>
          <div className="sandbox-control-group">
            <label>value (HH:MM)</label>
            <input type="time" value={value} onChange={(e) => setValue(e.target.value)} />
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.params}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParam}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>label</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descLabel}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>value</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Date | string | null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>null</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descValue}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>onChange</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>function</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descOnChange}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>disabled</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descDisabled}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={"bpm.timeinput(label=\"Heure\", value=\"09:00\")"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
