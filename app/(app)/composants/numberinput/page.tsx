"use client";

import { useState } from "react";
import Link from "next/link";
import { NumberInput, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocNumberInputPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Champ numérique avec min, max et step.",
    disabledLabel: "Désactivé",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      label: "Label au-dessus du champ.",
      value: "Valeur affichée.",
      onChange: "Callback au changement.",
      min: "Valeur minimale.",
      max: "Valeur maximale.",
      step: "Pas d’incrément.",
      disabled: "Désactive le champ.",
    },
    examples: "Exemples",
    demoLabel: "Quantité",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Numeric field with min, max and step.",
    disabledLabel: "Disabled",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      label: "Label above the field.",
      value: "Displayed value.",
      onChange: "Callback on change.",
      min: "Minimum value.",
      max: "Maximum value.",
      step: "Increment step.",
      disabled: "Disables the field.",
    },
    examples: "Examples",
    demoLabel: "Quantity",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [label, setLabel] = useState(t.demoLabel);
  const [value, setValue] = useState<number | null>(42);
  const [min, setMin] = useState<number>(0);
  const [max, setMax] = useState<number>(100);
  const [step, setStep] = useState<number>(1);
  const [disabled, setDisabled] = useState(false);

  const escapedLabel = label.replace(/"/g, '\\"');
  const pythonCode = `bpm.number_input(label="${escapedLabel}", value=${value}, min=${min}, max=${max}, step=${step}, disabled=${disabled})`;
  const { prev, next } = getPrevNext("numberinput");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.numberinput</div>
        <h1>bpm.numberinput</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Interaction</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <NumberInput
            label={label}
            value={value}
            onChange={setValue}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>min</label>
            <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value) || 0)} />
          </div>
          <div className="sandbox-control-group">
            <label>max</label>
            <input type="number" value={max} onChange={(e) => setMax(Number(e.target.value) || 100)} />
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
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.label}</td>
          </tr>
          <tr>
            <td><code>value</code></td>
            <td><code>number | null</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.value}</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>(value: number | null) =&gt; void</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.onChange}</td>
          </tr>
          <tr>
            <td><code>min</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.min}</td>
          </tr>
          <tr>
            <td><code>max</code></td>
            <td><code>number</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.max}</td>
          </tr>
          <tr>
            <td><code>step</code></td>
            <td><code>number</code></td>
            <td><code>1</code></td>
            <td>{t.no}</td>
            <td>{t.rows.step}</td>
          </tr>
          <tr>
            <td><code>disabled</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>{t.no}</td>
            <td>{t.rows.disabled}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.number_input(label="Age", value=25, min=0, max=120)'} language="python" />
      <CodeBlock code={'bpm.number_input(label="Prix", value=9.99, step=0.01, min=0)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
