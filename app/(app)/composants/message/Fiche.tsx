"use client";

import { useState } from "react";
import Link from "next/link";
import { Message, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

type MessageType = "info" | "success" | "warning" | "error";

export default function DocMessagePage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Bandeau avec type info, success, warning ou error.",
    contentLabel: "Contenu",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      type: "Style du message.",
      children: "Contenu du message.",
      className: "Classes CSS.",
    },
    examples: "Exemples",
    sample: "Votre modification a bien été enregistrée.",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Banner with info, success, warning or error type.",
    contentLabel: "Content",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      type: "Message style.",
      children: "Message content.",
      className: "CSS classes.",
    },
    examples: "Examples",
    sample: "Your changes have been saved.",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [type, setType] = useState<MessageType>("info");
  const [content, setContent] = useState(t.sample);

  const escapedContent = content.replace(/"/g, '\\"');
  const pythonCode = `bpm.message(type="${type}", content="${escapedContent}")`;
  const { prev, next } = getPrevNext("message");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.breadcrumb}</Link> → bpm.message</div>
        <h1>bpm.message</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Message type={type}>{content}</Message>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>type</label>
            <select value={type} onChange={(e) => setType(e.target.value as MessageType)}>
              <option value="info">info</option>
              <option value="success">success</option>
              <option value="warning">warning</option>
              <option value="error">error</option>
            </select>
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
          <tr>
            <td><code>type</code></td>
            <td><code>info | success | warning | error</code></td>
            <td><code>info</code></td>
            <td>{t.no}</td>
            <td>{t.rows.type}</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.rows.children}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.rows.className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.message(type="success", content="Sauvegarde OK.")'} language="python" />
      <CodeBlock code={'bpm.message(type="warning", content="Action irreversible.")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
