"use client";

import { useState } from "react";
import Link from "next/link";
import { QRCode, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocQRCodePage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "QR Code pour URL, vCard ou texte. Scannable par smartphone ou lecteur.",
    category: "Identification & traçabilité",
    valuePlaceholder: "URL ou texte",
    copy: "Copier",
    propsTitle: "Props",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      value: "Données encodées (URL, vCard, texte).",
      size: "Taille en pixels (côté du carré).",
      fgColor: "Couleur des modules (avant-plan).",
      bgColor: "Couleur de fond.",
      className: "Classes CSS additionnelles.",
    },
    examples: "Exemples",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "QR Code for a URL, vCard or text. Scannable by smartphone or reader.",
    category: "Identification & traceability",
    valuePlaceholder: "URL or text",
    copy: "Copy",
    propsTitle: "Props",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      value: "Encoded data (URL, vCard, text).",
      size: "Size in pixels (square side).",
      fgColor: "Module color (foreground).",
      bgColor: "Background color.",
      className: "Additional CSS classes.",
    },
    examples: "Examples",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [value, setValue] = useState("https://blueprint-modular.com");
  const [size, setSize] = useState(128);
  const { prev, next } = getPrevNext("qrcode");

  const pySize = size !== 128 ? `, size=${size}` : "";
  const pythonCode = `bpm.qrcode("${value.replace(/"/g, '\\"')}"${pySize})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.breadcrumb}</Link> → bpm.qrcode
        </div>
        <h1>bpm.qrcode</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <QRCode value={value} size={size} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.valuePlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>size</label>
            <input type="number" value={size} onChange={(e) => setSize(Number(e.target.value) || 128)} min={64} max={256} />
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
            <td><code>value</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.value}</td>
          </tr>
          <tr>
            <td><code>size</code></td>
            <td><code>number</code></td>
            <td>128</td>
            <td>{t.no}</td>
            <td>{t.rows.size}</td>
          </tr>
          <tr>
            <td><code>fgColor</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-text-primary)</td>
            <td>{t.no}</td>
            <td>{t.rows.fgColor}</td>
          </tr>
          <tr>
            <td><code>bgColor</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-bg-primary)</td>
            <td>{t.no}</td>
            <td>{t.rows.bgColor}</td>
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
      <CodeBlock code={'bpm.qrcode("https://example.com")'} language="python" />
      <CodeBlock code={'bpm.qrcode("BEGIN:VCARD\\nFN:Jean Dupont\\nEND:VCARD", size=160)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
