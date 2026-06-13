"use client";

import { useState } from "react";
import Link from "next/link";
import { Progress, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocProgressPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Barre de progression avec valeur, maximum optionnel et affichage du pourcentage.",
    category: "Affichage de données",
    labelPlaceholder: "ex. Avancement",
    showValueTrue: "true (afficher %)",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    no: "Non",
    rows: {
      value: "Valeur courante (avancement).",
      max: "Valeur maximale (pourcentage = value / max × 100).",
      label: "Libellé affiché au-dessus de la barre.",
      showValue: "Afficher le pourcentage à droite.",
      className: "Classes CSS additionnelles.",
    },
    examples: "Exemples",
    demoLabel: "Avancement",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Progress bar with a value, optional maximum and percentage display.",
    category: "Data display",
    labelPlaceholder: "e.g. Progress",
    showValueTrue: "true (show %)",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    no: "No",
    rows: {
      value: "Current value (progress).",
      max: "Maximum value (percentage = value / max × 100).",
      label: "Label shown above the bar.",
      showValue: "Show the percentage on the right.",
      className: "Additional CSS classes.",
    },
    examples: "Examples",
    demoLabel: "Progress",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [value, setValue] = useState(65);
  const [max, setMax] = useState(100);
  const [label, setLabel] = useState(t.demoLabel);
  const [showValue, setShowValue] = useState(true);

  const pythonCode =
    `bpm.progress(value=${value}, max=${max}` +
    (label ? `, label="${label.replace(/"/g, '\\"')}"` : "") +
    (!showValue ? ", show_value=False" : "") +
    ")";
  const { prev, next } = getPrevNext("progress");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.progress
        </div>
        <h1>bpm.progress</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-md">
            <Progress
              value={value}
              max={max}
              label={label || undefined}
              showValue={showValue}
            />
          </div>
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
              value={max}
              onChange={(e) => setMax(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
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
            <label>showValue</label>
            <select value={showValue ? "true" : "false"} onChange={(e) => setShowValue(e.target.value === "true")}>
              <option value="true">{t.showValueTrue}</option>
              <option value="false">false</option>
            </select>
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              {t.copy}
            </button>
          </div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>

      <table className="props-table">
        <thead>
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>value</code></td>
            <td><code>number</code></td>
            <td>0</td>
            <td>{t.no}</td>
            <td>{t.rows.value}</td>
          </tr>
          <tr>
            <td><code>max</code></td>
            <td><code>number</code></td>
            <td>1</td>
            <td>{t.no}</td>
            <td>{t.rows.max}</td>
          </tr>
          <tr>
            <td><code>label</code></td>
            <td><code>string | null</code></td>
            <td>null</td>
            <td>{t.no}</td>
            <td>{t.rows.label}</td>
          </tr>
          <tr>
            <td><code>showValue</code></td>
            <td><code>boolean</code></td>
            <td>true</td>
            <td>{t.no}</td>
            <td>{t.rows.showValue}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.progress(value=50, max=100)\nbpm.progress(value=0.65, max=1, label="Avancement")'} language="python" />
      <CodeBlock code={'bpm.progress(value=8, max=10, label="Étapes", show_value=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
