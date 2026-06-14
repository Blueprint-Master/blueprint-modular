"use client";

import { useState } from "react";
import Link from "next/link";
import { Text, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  description: "Texte simple (niveau corps).",
  category: "Affichage de données",
  monoLabel: "Monospace",
  placeholder: "Texte…",
  copy: "Copier",
  params: "Paramètres",
  thParam: "Paramètre",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  descChildren: "Texte ou contenu à afficher.",
  descMono: "Police monospace (ex. code inline).",
  examples: "Exemples",
};
const en: typeof fr = {
  breadcrumb: "Components",
  description: "Plain text (body level).",
  category: "Data display",
  monoLabel: "Monospace",
  placeholder: "Text…",
  copy: "Copy",
  params: "Parameters",
  thParam: "Parameter",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  descChildren: "Text or content to display.",
  descMono: "Monospace font (e.g. inline code).",
  examples: "Examples",
};
const L = { fr, en } as const;

export default function DocTextPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [content, setContent] = useState("Texte corps");
  const [mono, setMono] = useState(false);

  const escapedContent = content.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const pythonCode = mono
    ? "bpm.text(\"" + escapedContent + "\", mono=True)"
    : "bpm.text(\"" + escapedContent + "\")";
  const { prev, next } = getPrevNext("text");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.text</div>
        <h1>bpm.text</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Text mono={mono}>{content || " "}</Text>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>children</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} placeholder={t.placeholder} />
          </div>
          <div className="sandbox-control-group">
            <label>mono</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={mono} onChange={(e) => setMono(e.target.checked)} />
              {t.monoLabel}
            </label>
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
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParam}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>children</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string | ReactNode</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.yes}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descChildren}</td></tr>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>mono</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>boolean</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>false</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.no}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.descMono}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.text(\"Texte corps\")"} language="python" />
      <CodeBlock code={"bpm.text(\"Code inline\", mono=True)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
