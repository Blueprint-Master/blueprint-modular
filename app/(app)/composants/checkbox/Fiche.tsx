"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Case à cocher avec label et état désactivable.",
  category: "Interaction",
  copy: "Copier",
  checked: "Coché",
  disabled: "Désactivé",
  examples: "Exemples",
  defaultLabel: "Accepter les conditions",
  labelPlaceholder: "ex. Accepter",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descLabel: "Texte ou contenu à côté de la case.",
  descChecked: "État coché (Python :",
  descOnChange: "Callback au changement.",
  descDisabled: "Désactive la case.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  components: "Components",
  description: "Checkbox with a label and a disabled state.",
  category: "Interaction",
  copy: "Copy",
  checked: "Checked",
  disabled: "Disabled",
  examples: "Examples",
  defaultLabel: "Accept the terms",
  labelPlaceholder: "e.g. Accept",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descLabel: "Text or content next to the box.",
  descChecked: "Checked state (Python:",
  descOnChange: "Callback on change.",
  descDisabled: "Disables the box.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocCheckboxPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState(t.defaultLabel);
  const [checked, setChecked] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (checked) parts.push("value=True");
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.checkbox(${parts.join(", ")})` : "bpm.checkbox()";
  const { prev, next } = getPrevNext("checkbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.checkbox
        </div>
        <h1>bpm.checkbox</h1>
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
          <div className="w-full">
            <Checkbox
              label={label.trim() || undefined}
              checked={checked}
              onChange={setChecked}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t.labelPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>checked</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              {t.checked}
            </label>
          </div>
          <div className="sandbox-control-group">
            <label>disabled</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
              {t.disabled}
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>{t.thDescription}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.no}</td><td>{t.descLabel}</td></tr>
          <tr><td><code>checked</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descChecked} <code>value</code>).</td></tr>
          <tr><td><code>onChange</code></td><td><code>(checked: boolean) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.descOnChange}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descDisabled}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code="bpm.checkbox()" language="python" />
      <CodeBlock code={'bpm.checkbox(label="Accepter les CGU", value=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
