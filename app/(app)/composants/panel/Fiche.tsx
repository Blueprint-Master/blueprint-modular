"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type Variant = "info" | "success" | "warning" | "error";

export default function DocPanelPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Panneau informatif avec variantes (info, success, warning, error).",
    category: "Mise en page",
    contentLabel: "Contenu (children)",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    no: "Non",
    rows: {
      variant: "Style et couleur de bordure.",
      title: "Titre du panneau.",
      children: "Contenu du panneau.",
      icon: "Icône personnalisée ou false pour masquer.",
    },
    examples: "Exemples",
    demoTitle: "Titre du panneau",
    demoContent: "Contenu du panneau. Message informatif ou alerte.",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Informational panel with variants (info, success, warning, error).",
    category: "Layout",
    contentLabel: "Content (children)",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    no: "No",
    rows: {
      variant: "Style and border color.",
      title: "Panel title.",
      children: "Panel content.",
      icon: "Custom icon, or false to hide it.",
    },
    examples: "Examples",
    demoTitle: "Panel title",
    demoContent: "Panel content. Informational message or alert.",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [variant, setVariant] = useState<Variant>("info");
  const [title, setTitle] = useState(t.demoTitle);
  const [content, setContent] = useState(t.demoContent);

  const pythonCode = `bpm.panel(title="${title.replace(/"/g, '\\"')}", content="${content.replace(/"/g, '\\"').replace(/\n/g, " ")}", variant="${variant}")`;
  const { prev, next } = getPrevNext("panel");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.panel</div>
        <h1>bpm.panel</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Panel key={variant} variant={variant} title={title}>
            {content}
          </Panel>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>variant</label>
            <select value={variant} onChange={(e) => setVariant(e.target.value as Variant)}>
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>{t.contentLabel}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-2 border rounded text-sm bg-[var(--bpm-surface)] text-[var(--bpm-text-primary)] border-[var(--bpm-border)]"
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
          <tr>
            <th>{t.head.prop}</th>
            <th>{t.head.type}</th>
            <th>{t.head.def}</th>
            <th>{t.head.req}</th>
            <th>{t.head.desc}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>variant</code></td><td><code>info | success | warning | error</code></td><td>info</td><td>{t.no}</td><td>{t.rows.variant}</td></tr>
          <tr><td><code>title</code></td><td><code>string | null</code></td><td>null</td><td>{t.no}</td><td>{t.rows.title}</td></tr>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>{t.no}</td><td>{t.rows.children}</td></tr>
          <tr><td><code>icon</code></td><td><code>string | null | false</code></td><td>null</td><td>{t.no}</td><td>{t.rows.icon}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.panel("Titre", "Contenu du panneau", variant="info")\nbpm.panel("Erreur", "Détail", variant="error")'} language="python" />
      <CodeBlock code={'bpm.panel(title="Succès", content="Opération réussie.", variant="success")'} language="python" />
      <CodeBlock code={'bpm.panel("Attention", "Vérifiez les données.", variant="warning")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
