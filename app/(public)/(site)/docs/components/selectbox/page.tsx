"use client";

import { useState } from "react";
import Link from "next/link";
import { Selectbox, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const OPTS = [{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }, { value: "c", label: "Option C" }];

const fr = {
  breadcrumb: "Composants",
  description: "Liste déroulante pour choisir une valeur.",
  category: "Interaction",
  disabledLabel: "Désactivé",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  defaultLabel: "Choisir",
  defaultPlaceholder: "Sélectionner...",
  descLabel: "Label.",
  descOptions: "Options.",
  descValue: "Valeur sélectionnée.",
  descOnChange: "Callback.",
  descPlaceholder: "Texte par défaut.",
  descDisabled: "Désactive.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Dropdown list to choose a value.",
  category: "Interaction",
  disabledLabel: "Disabled",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  defaultLabel: "Choose",
  defaultPlaceholder: "Select...",
  descLabel: "Label.",
  descOptions: "Options.",
  descValue: "Selected value.",
  descOnChange: "Callback.",
  descPlaceholder: "Default text.",
  descDisabled: "Disables the field.",
};
const L = { fr, en } as const;

export default function DocSelectboxPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("Choisir");
  const [placeholder, setPlaceholder] = useState("Selectionner...");
  const [value, setValue] = useState<string | null>("b");
  const [disabled, setDisabled] = useState(false);

  const escapedLabel = label.replace(/"/g, '\\"');
  const escapedPlaceholder = placeholder.replace(/"/g, '\\"');
  const pythonCode = `bpm.selectbox(label="${escapedLabel}", placeholder="${escapedPlaceholder}", disabled=${disabled})`;
  const { prev, next } = getPrevNext("selectbox");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.selectbox</div>
        <h1>bpm.selectbox</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Selectbox label={label} placeholder={placeholder} options={OPTS} value={value} onChange={setValue} disabled={disabled} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
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
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>{t.copy}</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descLabel}</td></tr>
          <tr><td><code>options</code></td><td><code>SelectOption[]</code></td><td>—</td><td>{t.yes}</td><td>{t.descOptions}</td></tr>
          <tr><td><code>value</code></td><td><code>string | null</code></td><td>—</td><td>{t.yes}</td><td>{t.descValue}</td></tr>
          <tr><td><code>onChange</code></td><td><code>function</code></td><td>—</td><td>{t.yes}</td><td>{t.descOnChange}</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>Selectionner...</td><td>{t.no}</td><td>{t.descPlaceholder}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descDisabled}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.selectbox(label="Region", options=[{"value": "fr", "label": "France"}], value=region, onChange=set_region)'} language="python" />
      <CodeBlock code={'bpm.selectbox(options=["A", "B", "C"], placeholder="Choix")'} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
