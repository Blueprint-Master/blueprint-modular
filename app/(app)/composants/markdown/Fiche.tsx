"use client";

import { useState } from "react";
import Link from "next/link";
import { Markdown, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const SAMPLE_MD_FR = "## Titre\n\nParagraphe avec **gras** et *italique*.\n\n- Item 1\n- Item 2\n\n---\n\nFin.";
const SAMPLE_MD_EN = "## Heading\n\nParagraph with **bold** and *italic*.\n\n- Item 1\n- Item 2\n\n---\n\nEnd.";

export default function DocMarkdownPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Rendu Markdown sécurisé.",
    category: "Affichage de données",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      text: (
        <>
          Contenu Markdown. Utilisez <code>---</code> sur une ligne pour une ligne horizontale (hr).
        </>
      ),
      className: "Classes CSS.",
    },
    examples: "Exemples",
    sample: SAMPLE_MD_FR,
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Secure Markdown rendering.",
    category: "Data display",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      text: (
        <>
          Markdown content. Use <code>---</code> on its own line for a horizontal rule (hr).
        </>
      ),
      className: "CSS classes.",
    },
    examples: "Examples",
    sample: SAMPLE_MD_EN,
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [text, setText] = useState(t.sample);

  const pythonCode = `bpm.markdown(text="""${text.slice(0, 50)}${text.length > 50 ? "..." : ""}""")`;
  const { prev, next } = getPrevNext("markdown");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.markdown</div>
        <h1>bpm.markdown</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Markdown text={text} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>text</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} style={{ width: "100%" }} />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(`bpm.markdown(text="""${text.replace(/"/g, '\\"')}""")`)}>{t.copy}</button>
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
          <tr><td><code>text</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.text}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.rows.className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.markdown(text="## Procédure\\n\\n1. Valider le devis\\n2. Envoyer au client.")'} language="python" />
      <CodeBlock code={'bpm.markdown(text=content)'} language="python" />
      <CodeBlock code={'bpm.markdown(text="**Important** : voir la notice.")'} language="python" />
      <CodeBlock code={'bpm.markdown(text="---\\nSection suivante")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
