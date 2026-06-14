"use client";

import { useState } from "react";
import Link from "next/link";
import { Breadcrumb, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Fil d’Ariane : liste d’étapes avec liens (sauf la dernière).",
  category: "Navigation",
  demoItems: "Accueil, Produits, Détail produit",
  fallbackHome: "Accueil",
  fallbackCurrent: "Page actuelle",
  itemsLabel: "items (labels séparés par des virgules)",
  itemsPlaceholder: "Accueil, Section, Page actuelle",
  copy: "Copier",
  default: "Défaut",
  required: "Requis",
  descriptionCol: "Description",
  no: "Non",
  examples: "Exemples",
  descItems: "Éléments du fil (dernier = page courante, sans",
  descSeparator: "Caractère entre les éléments.",
  descClassName: "Classes CSS additionnelles.",
};
const en: typeof fr = {
  components: "Components",
  description: "Breadcrumb: a list of steps with links (except the last one).",
  category: "Navigation",
  demoItems: "Home, Products, Product detail",
  fallbackHome: "Home",
  fallbackCurrent: "Current page",
  itemsLabel: "items (labels separated by commas)",
  itemsPlaceholder: "Home, Section, Current page",
  copy: "Copy",
  default: "Default",
  required: "Required",
  descriptionCol: "Description",
  no: "No",
  examples: "Examples",
  descItems: "Trail items (last = current page, without",
  descSeparator: "Character between items.",
  descClassName: "Additional CSS classes.",
};
const L = { fr, en } as const;

export default function DocBreadcrumbPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [itemsStr, setItemsStr] = useState(t.demoItems);
  const [separator, setSeparator] = useState("›");

  const labels = itemsStr.split(",").map((s) => s.trim()).filter(Boolean);
  const items = labels.map((label, i) =>
    i < labels.length - 1 ? { label, href: "#" } : { label }
  );

  const parts: string[] = [];
  if (labels.length) {
    const itemsArg = labels
      .map((l, i) =>
        i < labels.length - 1
          ? `{"label": "${l.replace(/"/g, '\\"')}", "href": "#"}`
          : `{"label": "${l.replace(/"/g, '\\"')}"}`
      )
      .join(", ");
    parts.push(`items=[${itemsArg}]`);
  }
  if (separator !== "›") parts.push(`separator="${separator.replace(/"/g, '\\"')}"`);
  const pythonCode = parts.length ? `bpm.breadcrumb(${parts.join(", ")})` : "bpm.breadcrumb()";
  const { prev, next } = getPrevNext("breadcrumb");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.breadcrumb
        </div>
        <h1>bpm.breadcrumb</h1>
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
          <div className="w-full">
            <Breadcrumb
              items={items.length ? items : [{ label: t.fallbackHome, href: "#" }, { label: t.fallbackCurrent }]}
              separator={separator}
            />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.itemsLabel}</label>
            <input
              type="text"
              value={itemsStr}
              onChange={(e) => setItemsStr(e.target.value)}
              placeholder={t.itemsPlaceholder}
            />
          </div>
          <div className="sandbox-control-group">
            <label>separator</label>
            <input
              type="text"
              value={separator}
              onChange={(e) => setSeparator(e.target.value)}
              placeholder="›"
            />
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
          <tr><th>Prop</th><th>Type</th><th>{t.default}</th><th>{t.required}</th><th>{t.descriptionCol}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>items</code></td><td><code>&#123; label: string, href?: string &#125;[]</code></td><td>[]</td><td>{t.no}</td><td>{t.descItems} <code>href</code>).</td></tr>
          <tr><td><code>separator</code></td><td><code>string</code></td><td>›</td><td>{t.no}</td><td>{t.descSeparator}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.breadcrumb(items=[{"label": "Accueil", "href": "/"}, {"label": "Docs"}])'} language="python" />
      <CodeBlock code={'bpm.breadcrumb(items=[{"label": "A"}, {"label": "B", "href": "#b"}, {"label": "C"}], separator="/")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
