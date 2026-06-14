"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Variant = "primary" | "secondary" | "outline";
type Size = "small" | "medium" | "large";

const fr = {
  components: "Composants",
  description: "Bouton avec variantes primary, secondary, outline et tailles.",
  category: "Interaction",
  demoLabel: "Valider",
  alertClicked: "Cliqué",
  fallbackButton: "Bouton",
  disabledLabel: "Désactivé",
  copy: "Copier",
  default: "Défaut",
  required: "Requis",
  descriptionCol: "Description",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  descChildren: "Contenu du bouton.",
  descVariant: "Style.",
  descSize: "Taille.",
  descDisabled: "Désactivé.",
  descOnClick: "Callback clic.",
};
const en: typeof fr = {
  components: "Components",
  description: "Button with primary, secondary, outline variants and sizes.",
  category: "Interaction",
  demoLabel: "Submit",
  alertClicked: "Clicked",
  fallbackButton: "Button",
  disabledLabel: "Disabled",
  copy: "Copy",
  default: "Default",
  required: "Required",
  descriptionCol: "Description",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  descChildren: "Button content.",
  descVariant: "Style.",
  descSize: "Size.",
  descDisabled: "Disabled.",
  descOnClick: "Click callback.",
};
const L = { fr, en } as const;

export default function DocButtonPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [variant, setVariant] = useState<Variant>("primary");
  const [size, setSize] = useState<Size>("medium");
  const [disabled, setDisabled] = useState(false);
  const [label, setLabel] = useState(t.demoLabel);

  const escapedLabel = label.replace(/"/g, "\\\"");
  const pythonCode = "bpm.button(\"" + escapedLabel + "\", variant=\"" + variant + "\", size=\"" + size + "\", disabled=" + String(disabled) + ")";
  const { prev, next } = getPrevNext("button");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.button</div>
        <h1>bpm.button</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Button
            key={`${variant}-${size}-${disabled}`}
            variant={variant}
            size={size}
            disabled={disabled}
            onClick={() => alert(t.alertClicked)}
          >
            {label || t.fallbackButton}
          </Button>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
              <option value="primary">primary</option>
              <option value="secondary">secondary</option>
              <option value="outline">outline</option>
            </select>
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

      <table className="props-table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.default}</th>
            <th>{t.required}</th>
            <th>{t.descriptionCol}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.yes}</td><td>{t.descChildren}</td></tr>
          <tr><td><code>variant</code></td><td><code>primary | secondary | outline</code></td><td>primary</td><td>{t.no}</td><td>{t.descVariant}</td></tr>
          <tr><td><code>size</code></td><td><code>small | medium | large</code></td><td>medium</td><td>{t.no}</td><td>{t.descSize}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descDisabled}</td></tr>
          <tr><td><code>onClick</code></td><td><code>function</code></td><td>—</td><td>{t.no}</td><td>{t.descOnClick}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'if bpm.button("Valider"):\n    bpm.write("Validé !")'} language="python" />
      <CodeBlock code={'bpm.button("Annuler", variant="outline")'} language="python" />
      <CodeBlock code={'bpm.button("Petit", size="small")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
