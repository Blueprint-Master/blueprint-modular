"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "error";

const fr = {
  components: "Composants",
  category: "Affichage de données",
  description: "Badge / étiquette avec variantes (default, primary, success, warning, error).",
  labelPlaceholder: "Texte du badge",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descChildren: "Texte ou contenu du badge.",
  descVariant: "Style et couleur du badge.",
  descClassName: "Classes CSS additionnelles.",
  examples: "Exemples",
};

const en: typeof fr = {
  components: "Components",
  category: "Data display",
  description: "Badge / label with variants (default, primary, success, warning, error).",
  labelPlaceholder: "Badge text",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descChildren: "Text or content of the badge.",
  descVariant: "Style and color of the badge.",
  descClassName: "Additional CSS classes.",
  examples: "Examples",
};

const L = { fr, en } as const;

export default function DocBadgePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [label, setLabel] = useState("Affichage de données");
  const [variant, setVariant] = useState<BadgeVariant>("default");

  const escapedLabel = label.replace(/"/g, '\\"');
  const pyVariant = variant !== "default" ? `, variant="${variant}"` : "";
  const pythonCode = `bpm.badge("${escapedLabel}"${pyVariant})`;
  const { prev, next } = getPrevNext("badge");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.badge
        </div>
        <h1>bpm.badge</h1>
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
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant={variant}>{label || "Badge"}</Badge>
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
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as BadgeVariant)}>
              <option value="default">default</option>
              <option value="primary">primary</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
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
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>{t.thDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>children</code> / <code>label</code></td>
            <td><code>string | ReactNode</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descChildren}</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>default | primary | success | warning | error</code></td>
            <td>default</td>
            <td>{t.no}</td>
            <td>{t.descVariant}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descClassName}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.badge("Nouveau")\nbpm.badge("Validé", variant="success")\nbpm.badge("Attention", variant="warning")'} language="python" />
      <CodeBlock code={'bpm.badge("Erreur", variant="error")\nbpm.badge("Info", variant="primary")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
