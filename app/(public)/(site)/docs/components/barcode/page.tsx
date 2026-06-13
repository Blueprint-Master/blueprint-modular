"use client";

import { useState } from "react";
import Link from "next/link";
import { Barcode, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type BarcodeFormat = "EAN13" | "CODE128";

const fr = {
  components: "Composants",
  description: "Code-barres (EAN-13, Code 128) pour identification et traçabilité.",
  category: "Identification & traçabilité",
  valuePlaceholder: "Valeur du code",
  copy: "Copier",
  default: "Défaut",
  required: "Requis",
  descriptionCol: "Description",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  descValue: "Valeur encodée (ex. EAN-13, Code 128).",
  descFormat: "Type de code-barres.",
  descHeight: "Hauteur en pixels.",
  descWidth: "Épaisseur des barres (px).",
  descLineColor: "Couleur des barres.",
  descBackground: "Couleur de fond.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  components: "Components",
  description: "Barcode (EAN-13, Code 128) for identification and traceability.",
  category: "Identification & traceability",
  valuePlaceholder: "Code value",
  copy: "Copy",
  default: "Default",
  required: "Required",
  descriptionCol: "Description",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  descValue: "Encoded value (e.g. EAN-13, Code 128).",
  descFormat: "Barcode type.",
  descHeight: "Height in pixels.",
  descWidth: "Bar thickness (px).",
  descLineColor: "Bar color.",
  descBackground: "Background color.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocBarcodePage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [value, setValue] = useState("1234567890123");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [height, setHeight] = useState(60);
  const { prev, next } = getPrevNext("barcode");

  const pyFormat = format !== "CODE128" ? `, format="${format}"` : "";
  const pyHeight = height !== 60 ? `, height=${height}` : "";
  const pythonCode = `bpm.barcode("${value.replace(/"/g, '\\"')}"${pyFormat}${pyHeight})`;

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.components}</Link> → bpm.barcode
        </div>
        <h1>bpm.barcode</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container mt-6">
        <div className="sandbox-preview">
          <Barcode value={value} format={format} height={height} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>value</label>
            <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={t.valuePlaceholder} />
          </div>
          <div className="sandbox-control-group">
            <label>format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as BarcodeFormat)}>
              <option value="CODE128">CODE128</option>
              <option value="EAN13">EAN13</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 60)} min={20} max={120} />
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

      <h2 className="text-lg font-semibold mt-8 mb-2">Props</h2>
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
          <tr>
            <td><code>value</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.descValue}</td>
          </tr>
          <tr>
            <td><code>format</code></td>
            <td><code>&quot;EAN13&quot; | &quot;CODE128&quot;</code></td>
            <td>CODE128</td>
            <td>{t.no}</td>
            <td>{t.descFormat}</td>
          </tr>
          <tr>
            <td><code>height</code></td>
            <td><code>number</code></td>
            <td>60</td>
            <td>{t.no}</td>
            <td>{t.descHeight}</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number</code></td>
            <td>2</td>
            <td>{t.no}</td>
            <td>{t.descWidth}</td>
          </tr>
          <tr>
            <td><code>lineColor</code></td>
            <td><code>string</code></td>
            <td>var(--bpm-text-primary)</td>
            <td>{t.no}</td>
            <td>{t.descLineColor}</td>
          </tr>
          <tr>
            <td><code>background</code></td>
            <td><code>string</code></td>
            <td>transparent</td>
            <td>{t.no}</td>
            <td>{t.descBackground}</td>
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
      <CodeBlock code={'bpm.barcode("1234567890123")'} language="python" />
      <CodeBlock code={'bpm.barcode("ABC-123", format="CODE128", height=80)'} language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
