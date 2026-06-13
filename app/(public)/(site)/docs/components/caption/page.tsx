"use client";

import { useState } from "react";
import Link from "next/link";
import { Caption, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Légende ou texte secondaire.",
  category: "Affichage de données",
  demoContent: "Légende ou texte secondaire.",
  placeholder: "Légende…",
  copy: "Copier",
  params: "Paramètres",
  paramCol: "Paramètre",
  default: "Défaut",
  required: "Requis",
  descriptionCol: "Description",
  yes: "Oui",
  example: "Exemple",
  descChildren: "Légende ou texte secondaire (sous un graphique, une image).",
};
const en: typeof fr = {
  components: "Components",
  description: "Caption or secondary text.",
  category: "Data display",
  demoContent: "Caption or secondary text.",
  placeholder: "Caption…",
  copy: "Copy",
  params: "Parameters",
  paramCol: "Parameter",
  default: "Default",
  required: "Required",
  descriptionCol: "Description",
  yes: "Yes",
  example: "Example",
  descChildren: "Caption or secondary text (below a chart or an image).",
};
const L = { fr, en } as const;

export default function DocCaptionPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [content, setContent] = useState(t.demoContent);

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = `bpm.caption("${escapedContent}")`;
  const { prev, next } = getPrevNext("caption");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.caption</div>
        <h1>bpm.caption</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Caption>{content || " "}</Caption>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t.placeholder} />
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.params}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.paramCol}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.default}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.required}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descriptionCol}</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string | ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.yes}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descChildren}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={'bpm.caption("Sous un graphique ou une image")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
