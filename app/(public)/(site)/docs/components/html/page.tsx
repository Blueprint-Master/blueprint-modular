"use client";

import { useState } from "react";
import Link from "next/link";
import { Html, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const DEFAULT_HTML = "<p>Hello <strong>world</strong>.</p>\n<p><em>Contenu HTML</em> rendu ici.</p>";

const fr = {
  components: "Composants",
  description: "Contenu HTML brut (à n’utiliser qu’avec du contenu de confiance ou sanitized).",
  category: "Média",
  empty: "(vide)",
  copy: "Copier",
  parameters: "Paramètres",
  thParameter: "Paramètre",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  examples: "Exemples",
  d_html: "HTML brut à afficher (contenu de confiance uniquement).",
};

const en: typeof fr = {
  components: "Components",
  description: "Raw HTML content (use only with trusted or sanitized content).",
  category: "Media",
  empty: "(empty)",
  copy: "Copy",
  parameters: "Parameters",
  thParameter: "Parameter",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  examples: "Examples",
  d_html: "Raw HTML to render (trusted content only).",
};

const L = { fr, en } as const;

export default function DocHtmlPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [html, setHtml] = useState(DEFAULT_HTML);

  const escapedHtml = html.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
  const pythonCode = "bpm.html(\"" + escapedHtml + "\")";
  const { prev, next } = getPrevNext("html");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.components}</Link> → bpm.html</div>
        <h1>bpm.html</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <div className="w-full rounded border p-4 min-h-[80px]" style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)" }}>
            <Html html={html || `<p>${t.empty}</p>`} />
          </div>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>html</label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<p>...</p>"
              rows={6}
              className="w-full px-3 py-2 rounded border text-sm font-mono"
              style={{ borderColor: "var(--bpm-border)", background: "var(--bpm-bg-primary)", color: "var(--bpm-text-primary)" }}
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

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.parameters}</h2>
      <table className="props-table w-full border-collapse text-sm">
        <thead><tr><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thParameter}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Type</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thDefault}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.thRequired}</th><th className="text-left p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>Description</th></tr></thead>
        <tbody>
          <tr><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}><code>html</code></td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>string</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>—</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.yes}</td><td className="p-2 border-b" style={{ borderColor: "var(--bpm-border)" }}>{t.d_html}</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.html("<p>Texte <strong>gras</strong>.</p>")'} language="python" />
      <CodeBlock code={'bpm.html("<ul><li>Item 1</li><li>Item 2</li></ul>")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
