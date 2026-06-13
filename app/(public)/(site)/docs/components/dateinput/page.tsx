"use client";

import { useState } from "react";
import Link from "next/link";
import { DateInput, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Sélecteur de date (input type=“date”) avec label et bornes min/max optionnelles.",
  category: "Interaction",
  disabledLabel: "Désactivé",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  d_label: "Label au-dessus du champ.",
  d_value: "Date affichée (ISO YYYY-MM-DD en Python).",
  d_onChange: "Callback au changement.",
  d_min: "Date minimale.",
  d_max: "Date maximale.",
  d_disabled: "Désactive le champ.",
  d_help: "Texte d’aide (infobulle).",
};

const en: typeof fr = {
  components: "Components",
  description: "Date picker (input type=“date”) with a label and optional min/max bounds.",
  category: "Interaction",
  disabledLabel: "Disabled",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  d_label: "Label above the field.",
  d_value: "Displayed date (ISO YYYY-MM-DD in Python).",
  d_onChange: "Callback on change.",
  d_min: "Minimum date.",
  d_max: "Maximum date.",
  d_disabled: "Disables the field.",
  d_help: "Help text (tooltip).",
};

const L = { fr, en } as const;

function formatDate(d: Date | null): string {
  if (!d) return "";
  return d.toISOString().split("T")[0];
}

export default function DocDateInputPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("Date");
  const [value, setValue] = useState<Date | null>(new Date());
  const [minStr, setMinStr] = useState("");
  const [maxStr, setMaxStr] = useState("");
  const [disabled, setDisabled] = useState(false);

  const min = minStr ? new Date(minStr) : null;
  const max = maxStr ? new Date(maxStr) : null;

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (value) parts.push(`value="${formatDate(value)}"`);
  if (minStr) parts.push(`min="${minStr}"`);
  if (maxStr) parts.push(`max="${maxStr}"`);
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.dateinput(${parts.join(", ")})` : "bpm.dateinput()";
  const { prev, next } = getPrevNext("dateinput");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.dateinput
        </div>
        <h1>bpm.dateinput</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-xs">
            <DateInput
              label={label.trim() || undefined}
              value={value}
              onChange={setValue}
              min={min ?? undefined}
              max={max ?? undefined}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Date" />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input
              type="date"
              value={formatDate(value)}
              onChange={(e) => setValue(e.target.value ? new Date(e.target.value) : null)}
            />
          </div>
          <div className="sandbox-control-group">
            <label>min</label>
            <input type="date" value={minStr} onChange={(e) => setMinStr(e.target.value)} placeholder="YYYY-MM-DD" />
          </div>
          <div className="sandbox-control-group">
            <label>max</label>
            <input type="date" value={maxStr} onChange={(e) => setMaxStr(e.target.value)} placeholder="YYYY-MM-DD" />
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

      <table className="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.d_label}</td></tr>
          <tr><td><code>value</code></td><td><code>Date | string | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_value}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: Date | null) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.d_onChange}</td></tr>
          <tr><td><code>min</code></td><td><code>Date | string | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_min}</td></tr>
          <tr><td><code>max</code></td><td><code>Date | string | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_max}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.d_disabled}</td></tr>
          <tr><td><code>help</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.d_help}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code="bpm.dateinput()" language="python" />
      <CodeBlock code={'bpm.dateinput(label="Date de naissance", value="1990-01-15")'} language="python" />
      <CodeBlock code={'bpm.dateinput(label="Échéance", min="2025-01-01", max="2025-12-31")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
