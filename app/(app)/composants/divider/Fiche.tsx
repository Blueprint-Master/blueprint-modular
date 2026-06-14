"use client";

import { useState } from "react";
import Link from "next/link";
import { Divider, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Séparateur horizontal ou vertical, optionnellement avec un libellé au centre.",
  category: "Mise en page",
  above: "Au-dessus",
  below: "En dessous",
  labelPlaceholder: "ex. ou",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  d_label: "Texte affiché au centre du séparateur (horizontal uniquement).",
  d_orientation: "Orientation de la ligne.",
  d_thickness: "Épaisseur de la ligne en pixels.",
  d_color: "Couleur de la ligne (CSS : variable, hex, rgb, etc.).",
  d_className: "Classes CSS additionnelles.",
};

const en: typeof fr = {
  components: "Components",
  description: "Horizontal or vertical separator, optionally with a label in the center.",
  category: "Layout",
  above: "Above",
  below: "Below",
  labelPlaceholder: "e.g. or",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  d_label: "Text displayed in the center of the separator (horizontal only).",
  d_orientation: "Orientation of the line.",
  d_thickness: "Line thickness in pixels.",
  d_color: "Line color (CSS: variable, hex, rgb, etc.).",
  d_className: "Additional CSS classes.",
};

const L = { fr, en } as const;

export default function DocDividerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("");
  const [orientation, setOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [thickness, setThickness] = useState(1);
  const [color, setColor] = useState("var(--bpm-border)");

  const parts: string[] = [];
  if (label.trim() !== "") parts.push(`label="${label.trim().replace(/"/g, '\\"')}"`);
  if (orientation !== "horizontal") parts.push(`orientation="${orientation}"`);
  if (thickness !== 1) parts.push(`thickness=${thickness}`);
  if (color !== "var(--bpm-border)") parts.push(`color="${color.replace(/"/g, '\\"')}"`);
  const pythonCode = parts.length ? `bpm.divider(${parts.join(", ")})` : "bpm.divider()";
  const { prev, next } = getPrevNext("divider");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.divider
        </div>
        <h1>bpm.divider</h1>
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
          <div className="w-full" style={orientation === "vertical" ? { display: "flex", gap: "1rem", alignItems: "stretch", minHeight: 80 } : undefined}>
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.above}</span>
            <Divider label={label.trim() || undefined} orientation={orientation} thickness={thickness} color={color} />
            <span className="text-sm" style={{ color: "var(--bpm-text-secondary)" }}>{t.below}</span>
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>orientation</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "horizontal" | "vertical")}
            >
              <option value="horizontal">horizontal</option>
              <option value="vertical">vertical</option>
            </select>
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
            <label>thickness</label>
            <input
              type="number"
              min={1}
              max={20}
              value={thickness}
              onChange={(e) => setThickness(Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1)))}
            />
          </div>
          <div className="sandbox-control-group">
            <label>color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="var(--bpm-border)"
            />
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
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>label</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_label}</td>
          </tr>
          <tr>
            <td><code>orientation</code></td>
            <td><code>&quot;horizontal&quot; | &quot;vertical&quot;</code></td>
            <td>horizontal</td>
            <td>{t.no}</td>
            <td>{t.d_orientation}</td>
          </tr>
          <tr>
            <td><code>thickness</code></td>
            <td><code>number</code></td>
            <td>1</td>
            <td>{t.no}</td>
            <td>{t.d_thickness}</td>
          </tr>
          <tr>
            <td><code>color</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-border)</td>
            <td>{t.no}</td>
            <td>{t.d_color}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code="bpm.divider()" language="python" />
      <CodeBlock code='bpm.divider(label="ou")' language="python" />
      <CodeBlock code={'bpm.divider(thickness=3, color="var(--bpm-accent)")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
