"use client";

import { useState } from "react";
import Link from "next/link";
import { ColorPicker, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Sélecteur de couleur (type color) avec affichage du code hex.",
  category: "Interaction",
  copy: "Copier",
  disabled: "Désactivé",
  defaultLabel: "Couleur",
  examples: "Exemples",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  no: "Non",
  descLabel: "Label au-dessus du sélecteur.",
  descValue: "Couleur au format hex (#RRGGBB).",
  descOnChange: "Callback au changement.",
  descHelp: "Texte d’aide (infobulle).",
  descDisabled: "Désactive le sélecteur.",
};
const en: typeof fr = {
  components: "Components",
  description: "Color picker (color input) that displays the hex code.",
  category: "Interaction",
  copy: "Copy",
  disabled: "Disabled",
  defaultLabel: "Color",
  examples: "Examples",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  no: "No",
  descLabel: "Label above the picker.",
  descValue: "Color in hex format (#RRGGBB).",
  descOnChange: "Callback on change.",
  descHelp: "Help text (tooltip).",
  descDisabled: "Disables the picker.",
};
const L = { fr, en } as const;

export default function DocColorPickerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState(t.defaultLabel);
  const [value, setValue] = useState("#3b82f6");
  const [disabled, setDisabled] = useState(false);

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (value !== "#000000") parts.push(`value="${value.replace(/"/g, '\\"')}"`);
  if (disabled) parts.push("disabled=True");
  const pythonCode = parts.length ? `bpm.colorpicker(${parts.join(", ")})` : "bpm.colorpicker()";
  const { prev, next } = getPrevNext("colorpicker");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.colorpicker
        </div>
        <h1>bpm.colorpicker</h1>
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
            <ColorPicker
              label={label.trim() || undefined}
              value={value}
              onChange={setValue}
              disabled={disabled}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.defaultLabel} />
          </div>
          <div className="sandbox-control-group">
            <label>value (hex)</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="#000000" />
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
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descLabel}</td></tr>
          <tr><td><code>value</code></td><td><code>string</code></td><td>#000000</td><td>{t.no}</td><td>{t.descValue}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>{t.no}</td><td>{t.descOnChange}</td></tr>
          <tr><td><code>help</code></td><td><code>string | null</code></td><td>—</td><td>{t.no}</td><td>{t.descHelp}</td></tr>
          <tr><td><code>disabled</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descDisabled}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code="bpm.colorpicker()" language="python" />
      <CodeBlock code={'bpm.colorpicker(label="Couleur de fond", value="#3b82f6")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
