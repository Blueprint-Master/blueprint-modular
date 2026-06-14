"use client";

import { useState } from "react";
import Link from "next/link";
import { RadioGroup, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const LAYOUTS = ["vertical", "horizontal"] as const;

export default function DocRadioGroupPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Groupe de boutons radio : une seule option sélectionnable parmi une liste.",
    category: "Interaction",
    optionsLabel: "options (séparés par des virgules)",
    disabledLabel: "Désactivé",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    no: "Non",
    rows: {
      name: "Attribut name des inputs radio.",
      label: "Label au-dessus du groupe.",
      options: "Liste d’options (chaînes ou objets value/label).",
      value: "Valeur sélectionnée.",
      onChange: "Callback au changement.",
      layout: "Disposition des options.",
      disabled: "Désactive tout le groupe.",
      className: "Classes CSS additionnelles.",
    },
    examples: "Exemples",
    demoLabel: "Choix",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Radio button group: a single option selectable from a list.",
    category: "Interaction",
    optionsLabel: "options (comma-separated)",
    disabledLabel: "Disabled",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    no: "No",
    rows: {
      name: "name attribute of the radio inputs.",
      label: "Label above the group.",
      options: "List of options (strings or value/label objects).",
      value: "Selected value.",
      onChange: "Callback on change.",
      layout: "Option layout.",
      disabled: "Disables the whole group.",
      className: "Additional CSS classes.",
    },
    examples: "Examples",
    demoLabel: "Choice",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [label, setLabel] = useState(t.demoLabel);
  const [optionsStr, setOptionsStr] = useState("Option A, Option B, Option C");
  const [value, setValue] = useState("Option B");
  const [layout, setLayout] = useState<(typeof LAYOUTS)[number]>("vertical");
  const [disabled, setDisabled] = useState(false);

  const options = optionsStr.split(",").map((s) => s.trim()).filter(Boolean);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (options.length) parts.push(`options=[${options.map((o) => `"${o.replace(/"/g, '\\"')}"`).join(", ")}]`);
  if (value && options.includes(value)) parts.push(`value="${value.replace(/"/g, '\\"')}"`);
  if (layout !== "vertical") parts.push(`layout="${layout}"`);
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.radiogroup(${parts.join(", ")})` : "bpm.radiogroup()";
  const { prev, next } = getPrevNext("radiogroup");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.radiogroup
        </div>
        <h1>bpm.radiogroup</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full max-w-sm">
            <RadioGroup
              label={label.trim() || undefined}
              options={options.length ? options : ["A", "B", "C"]}
              value={value}
              onChange={setValue}
              layout={layout}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.demoLabel} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.optionsLabel}</label>
            <input type="text" value={optionsStr} onChange={(e) => setOptionsStr(e.target.value)} placeholder="A, B, C" />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Option B" />
          </div>
          <div className="sandbox-control-group">
            <label>layout</label>
            <select value={layout} onChange={(e) => setLayout(e.target.value as (typeof LAYOUTS)[number])}>
              {LAYOUTS.map((l) => <option key={l} value={l}>{l}</option>)}
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

      <table className="props-table">
        <thead>
          <tr><th>{t.head.prop}</th><th>{t.head.type}</th><th>{t.head.def}</th><th>{t.head.req}</th><th>{t.head.desc}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>name</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.name}</td></tr>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.label}</td></tr>
          <tr><td><code>options</code></td><td><code>string[] | &#123; value, label? &#125;[]</code></td><td>[]</td><td>{t.no}</td><td>{t.rows.options}</td></tr>
          <tr><td><code>value</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.value}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.rows.onChange}</td></tr>
          <tr><td><code>layout</code></td><td><code>&quot;vertical&quot; | &quot;horizontal&quot;</code></td><td>vertical</td><td>{t.no}</td><td>{t.rows.layout}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.rows.disabled}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.radiogroup(label="Taille", options=["S", "M", "L"], value="M")'} language="python" />
      <CodeBlock code={'bpm.radiogroup(options=["Oui", "Non"], layout="horizontal")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
