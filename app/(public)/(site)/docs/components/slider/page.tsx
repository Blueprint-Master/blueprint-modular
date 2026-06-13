"use client";

import { useState } from "react";
import Link from "next/link";
import { Slider, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description: "Curseur (range) avec min, max, step et label.",
  category: "Interaction",
  disabledLabel: "Désactivé",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  descLabel: "Label au-dessus du curseur.",
  descValue: "Valeur courante.",
  descOnChange: "Callback au changement.",
  descMin: "Valeur minimale.",
  descMax: "Valeur maximale.",
  descStep: "Pas d’incrément.",
  descDisabled: "Désactive le curseur.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Range slider with min, max, step and label.",
  category: "Interaction",
  disabledLabel: "Disabled",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  descLabel: "Label above the slider.",
  descValue: "Current value.",
  descOnChange: "Change callback.",
  descMin: "Minimum value.",
  descMax: "Maximum value.",
  descStep: "Increment step.",
  descDisabled: "Disables the slider.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocSliderPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("Volume");
  const [value, setValue] = useState(50);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(100);
  const [step, setStep] = useState(1);
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (value !== 50) parts.push(`value=${value}`);
  if (min !== 0) parts.push(`min=${min}`);
  if (max !== 100) parts.push(`max=${max}`);
  if (step !== 1) parts.push(`step=${step}`);
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.slider(${parts.join(", ")})` : "bpm.slider()";
  const { prev, next } = getPrevNext("slider");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.slider
        </div>
        <h1>bpm.slider</h1>
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
          <div className="w-full max-w-sm">
            <Slider
              label={label.trim() || undefined}
              value={value}
              onChange={setValue}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Volume" />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value) ?? 0)} />
          </div>
          <div className="sandbox-control-group">
            <label>min</label>
            <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value) ?? 0)} />
          </div>
          <div className="sandbox-control-group">
            <label>max</label>
            <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value) ?? 100)} />
          </div>
          <div className="sandbox-control-group">
            <label>step</label>
            <input type="number" value={step} onChange={(e) => setStep(Number(e.target.value) || 1)} />
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
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descLabel}</td></tr>
          <tr><td><code>value</code></td><td><code>number</code></td><td>min</td><td>{t.no}</td><td>{t.descValue}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: number) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.descOnChange}</td></tr>
          <tr><td><code>min</code></td><td><code>number</code></td><td>0</td><td>{t.no}</td><td>{t.descMin}</td></tr>
          <tr><td><code>max</code></td><td><code>number</code></td><td>100</td><td>{t.no}</td><td>{t.descMax}</td></tr>
          <tr><td><code>step</code></td><td><code>number</code></td><td>1</td><td>{t.no}</td><td>{t.descStep}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descDisabled}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code="bpm.slider()" language="python" />
      <CodeBlock code={'bpm.slider(label="Volume", value=50, min=0, max=100)'} language="python" />
      <CodeBlock code={'bpm.slider(label="Pourcentage", value=0.5, min=0, max=1, step=0.01)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
