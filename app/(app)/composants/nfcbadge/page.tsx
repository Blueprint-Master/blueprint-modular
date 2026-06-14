"use client";

import { useState } from "react";
import Link from "next/link";
import { NfcBadge, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type NfcVariant = "default" | "primary" | "success";

export default function DocNfcBadgePage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: (
      <>
        Badge visuel pour statut NFC (Scannable, etc.). Indication que l&apos;élément est lié à un tag NFC.
      </>
    ),
    category: "Identification & traçabilité",
    copy: "Copier",
    propsTitle: "Props",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    no: "Non",
    rows: {
      label: "Texte du badge (statut affiché).",
      variant: "Style et couleur du badge.",
      className: "Classes CSS additionnelles.",
    },
    examples: "Exemples",
    demoLabel: "Scannable",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: (
      <>
        Visual badge for NFC status (Scannable, etc.). Indicates the element is linked to an NFC tag.
      </>
    ),
    category: "Identification & traceability",
    copy: "Copy",
    propsTitle: "Props",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    no: "No",
    rows: {
      label: "Badge text (status shown).",
      variant: "Badge style and color.",
      className: "Additional CSS classes.",
    },
    examples: "Examples",
    demoLabel: "Scannable",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [label, setLabel] = useState(t.demoLabel);
  const [variant, setVariant] = useState<NfcVariant>("default");
  const { prev, next } = getPrevNext("nfcbadge");

  const pyVariant = variant !== "default" ? `, variant="${variant}"` : "";
  const pythonCode = `bpm.nfcbadge("${label.replace(/"/g, '\\"')}"${pyVariant})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.nfcbadge
        </div>
        <h1>bpm.nfcbadge</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <NfcBadge label={label} variant={variant} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>label</label>
            <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t.demoLabel} />
          </div>
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as NfcVariant)}>
              <option value="default">default</option>
              <option value="primary">primary</option>
              <option value="success">success</option>
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.propsTitle}</h2>
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
            <td>Scannable</td>
            <td>{t.no}</td>
            <td>{t.rows.label}</td>
          </tr>
          <tr>
            <td><code>variant</code></td>
            <td><code>&quot;default&quot; | &quot;primary&quot; | &quot;success&quot;</code></td>
            <td>default</td>
            <td>{t.no}</td>
            <td>{t.rows.variant}</td>
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
      <CodeBlock code={'bpm.nfcbadge()'} language="python" />
      <CodeBlock code={'bpm.nfcbadge("Scannable", variant="primary")'} language="python" />
      <CodeBlock code={'bpm.nfcbadge("Lu", variant="success")'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
