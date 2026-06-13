"use client";

import { useState } from "react";
import Link from "next/link";
import { Container, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Conteneur de mise en page (wrapper).",
  category: "Mise en page",
  defaultContent: "Contenu dans le conteneur.",
  contentPlaceholder: "Contenu…",
  copy: "Copier",
  parameters: "Paramètres",
  thParam: "Paramètre",
  thType: "Type",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  childrenDesc: "Contenu du conteneur (texte, blocs, etc.).",
  example: "Exemple",
};

const en: typeof fr = {
  components: "Components",
  description: "Layout container (wrapper).",
  category: "Layout",
  defaultContent: "Content inside the container.",
  contentPlaceholder: "Content…",
  copy: "Copy",
  parameters: "Parameters",
  thParam: "Parameter",
  thType: "Type",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  childrenDesc: "Container content (text, blocks, etc.).",
  example: "Example",
};

const L = { fr, en } as const;

export default function DocContainerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [content, setContent] = useState(t.defaultContent);

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = "bpm.container(bpm.text(\"" + escapedContent + "\"))";
  const { prev, next } = getPrevNext("container");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.container</div>
        <h1>bpm.container</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Container>
            <span className="text-sm" style={{ color: "var(--bpm-text-primary)" }}>{content || " "}</span>
          </Container>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t.contentPlaceholder} />
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
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParam}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thType}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDescription}</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.yes}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.childrenDesc}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.example}</h2>
      <CodeBlock code={"bpm.container(bpm.text(\"Contenu\"))"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
