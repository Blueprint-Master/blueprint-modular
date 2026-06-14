"use client";

import { useState } from "react";
import Link from "next/link";
import { LabelValue, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type OrientationOption = "horizontal" | "vertical";
type SizeOption = "sm" | "md" | "lg";
type ValueStyleOption = "default" | "bold" | "accent" | "muted";

const fr = {
  components: "Composants",
  description: "Paire label / valeur pour vues détail (orientation, taille, copyable).",
  category: "Affichage de données",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_label: "Libellé.",
  d_value: "Valeur affichée.",
  d_orientation: "Disposition.",
  d_size: "Taille du texte.",
  d_valueStyle: "Style de la valeur.",
  d_copyable: "Bouton copier la valeur.",
};

const en: typeof fr = {
  components: "Components",
  description: "Label / value pair for detail views (orientation, size, copyable).",
  category: "Data display",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_label: "Label.",
  d_value: "Displayed value.",
  d_orientation: "Layout.",
  d_size: "Text size.",
  d_valueStyle: "Value style.",
  d_copyable: "Copy-value button.",
};

const L = { fr, en } as const;

export default function DocLabelValuePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("Email");
  const [value, setValue] = useState("contact@example.com");
  const [orientation, setOrientation] = useState<OrientationOption>("horizontal");
  const [size, setSize] = useState<SizeOption>("md");
  const [valueStyle, setValueStyle] = useState<ValueStyleOption>("default");
  const [copyable, setCopyable] = useState(false);

  const escapedLabel = label.replace(/"/g, '\\"');
  const escapedValue = value.replace(/"/g, '\\"');
  const pyOrientation = orientation !== "horizontal" ? `, orientation="${orientation}"` : "";
  const pySize = size !== "md" ? `, size="${size}"` : "";
  const pyValueStyle = valueStyle !== "default" ? `, value_style="${valueStyle}"` : "";
  const pyCopyable = copyable ? ", copyable=True" : "";
  const pythonCode = `bpm.labelValue(label="${escapedLabel}", value="${escapedValue}"${pyOrientation}${pySize}${pyValueStyle}${pyCopyable})`;
  const { prev, next } = getPrevNext("labelvalue");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.labelValue</div>
        <h1>bpm.labelValue</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <LabelValue
            label={label}
            value={value}
            orientation={orientation}
            size={size}
            valueStyle={valueStyle}
            copyable={copyable}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>orientation</label>
            <select value={orientation} onChange={(e) => setOrientation(e.target.value as OrientationOption)}>
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <select value={size} onChange={(e) => setSize(e.target.value as SizeOption)}>
              <option value="sm">sm</option>
              <option value="md">md</option>
              <option value="lg">lg</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>valueStyle</label>
            <select value={valueStyle} onChange={(e) => setValueStyle(e.target.value as ValueStyleOption)}>
              <option value="default">default</option>
              <option value="bold">bold</option>
              <option value="accent">accent</option>
              <option value="muted">muted</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>copyable</label>
            <select value={copyable ? "true" : "false"} onChange={(e) => setCopyable(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
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
          <tr><td><code>label</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_label}</td></tr>
          <tr><td><code>value</code></td><td><code>string | number | ReactNode</code></td><td>—</td><td>{t.yes}</td><td>{t.d_value}</td></tr>
          <tr><td><code>orientation</code></td><td><code>horizontal | vertical</code></td><td>horizontal</td><td>{t.no}</td><td>{t.d_orientation}</td></tr>
          <tr><td><code>size</code></td><td><code>sm | md | lg</code></td><td>md</td><td>{t.no}</td><td>{t.d_size}</td></tr>
          <tr><td><code>valueStyle</code></td><td><code>default | bold | accent | muted</code></td><td>default</td><td>{t.no}</td><td>{t.d_valueStyle}</td></tr>
          <tr><td><code>copyable</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.d_copyable}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.labelValue(label="Email", value="user@example.com", copyable=True)'} language="python" />
      <CodeBlock code={'bpm.labelValue(label="Statut", value="Actif", value_style="accent")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
