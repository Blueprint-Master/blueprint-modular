"use client";

import { useState } from "react";
import Link from "next/link";
import { Empty, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Bloc vide ou placeholder (min-height).",
  category: "Mise en page",
  childrenLabel: "children (optionnel)",
  childrenPlaceholder: "Vide ou —",
  copy: "Copier",
  parameters: "Paramètres",
  thParameter: "Paramètre",
  thDefault: "Défaut",
  thRequired: "Requis",
  no: "Non",
  examples: "Exemples",
  d_children: "Message ou contenu optionnel (ex. tiret, icône).",
};

const en: typeof fr = {
  components: "Components",
  description: "Empty block or placeholder (min-height).",
  category: "Layout",
  childrenLabel: "children (optional)",
  childrenPlaceholder: "Empty or —",
  copy: "Copy",
  parameters: "Parameters",
  thParameter: "Parameter",
  thDefault: "Default",
  thRequired: "Required",
  no: "No",
  examples: "Examples",
  d_children: "Optional message or content (e.g. dash, icon).",
};

const L = { fr, en } as const;

export default function DocEmptyPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [content, setContent] = useState("—");

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = content.trim() ? "bpm.empty(bpm.text(\"" + escapedContent + "\"))" : "bpm.empty()";
  const { prev, next } = getPrevNext("empty");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.empty</div>
        <h1>bpm.empty</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Empty>
            {content.trim() ? (
              <span className="text-sm opacity-70" style={{ color: "var(--bpm-text-secondary)" }}>{content}</span>
            ) : null}
          </Empty>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>{t.childrenLabel}</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t.childrenPlaceholder} />
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.parameters}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParameter}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_children}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.empty()"} language="python" />
      <CodeBlock code={"bpm.empty(bpm.text(\"—\"))"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
