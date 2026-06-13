"use client";

import { useState } from "react";
import Link from "next/link";
import { Skeleton, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type SkeletonVariant = "rectangular" | "circular" | "text";

const fr = {
  breadcrumb: "Composants",
  description: "Placeholder de chargement (skeleton) avec variantes rectangulaire, circulaire ou texte.",
  category: "Affichage de données",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  exampleHint: "ex. ",
  descVariant: "Forme du skeleton (rectangle, cercle, ligne de texte).",
  descWidth: "Largeur (px si number, sinon valeur CSS).",
  descHeight: "Hauteur (px si number, sinon valeur CSS).",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Loading placeholder (skeleton) with rectangular, circular or text variants.",
  category: "Data display",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  exampleHint: "e.g. ",
  descVariant: "Skeleton shape (rectangle, circle, text line).",
  descWidth: "Width (px if a number, otherwise a CSS value).",
  descHeight: "Height (px if a number, otherwise a CSS value).",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocSkeletonPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [variant, setVariant] = useState<SkeletonVariant>("rectangular");
  const [width, setWidth] = useState<string>("200");
  const [height, setHeight] = useState<string>("24");

  const wNum = width.trim() ? Number(width) || undefined : undefined;
  const hNum = height.trim() ? Number(height) || undefined : undefined;
  const parts: string[] = [];
  if (wNum != null) parts.push(`width=${wNum}`);
  if (hNum != null) parts.push(`height=${hNum}`);
  if (variant !== "rectangular") parts.push(`variant="${variant}"`);
  const pythonCode = `bpm.skeleton(${parts.join(", ")})`;
  const { prev, next } = getPrevNext("skeleton");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/docs/components">{t.breadcrumb}</Link> → bpm.skeleton
        </div>
        <h1>bpm.skeleton</h1>
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
          <Skeleton variant={variant} width={wNum} height={hNum} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as SkeletonVariant)}>
              <option value="rectangular">rectangular</option>
              <option value="circular">circular</option>
              <option value="text">text</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>width (px)</label>
            <input
              type="text"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder={t.exampleHint + "200"}
            />
          </div>
          <div className="sandbox-control-group">
            <label>height (px)</label>
            <input
              type="text"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder={t.exampleHint + "24"}
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
            <td><code>variant</code></td>
            <td><code>rectangular | circular | text</code></td>
            <td>rectangular</td>
            <td>{t.no}</td>
            <td>{t.descVariant}</td>
          </tr>
          <tr>
            <td><code>width</code></td>
            <td><code>number | string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descWidth}</td>
          </tr>
          <tr>
            <td><code>height</code></td>
            <td><code>number | string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descHeight}</td>
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
      <CodeBlock code={'bpm.skeleton(width=200, height=24)\nbpm.skeleton(variant="circular", width=48, height=48)'} language="python" />
      <CodeBlock code={'# Lignes de texte (chargement)\nfor _ in range(3):\n    bpm.skeleton(variant="text", width=180, height=16)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
