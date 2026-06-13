"use client";

import { useState } from "react";
import Link from "next/link";
import { PromptInput, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

export default function DocPromptInputPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Champ de saisie pour prompt IA (auto-resize, Cmd+Enter, tokens).",
    category: "IA & Spécialisés",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      value: "Valeur contrôlée.",
      onChange: "Callback à chaque changement.",
      onSubmit: (<>Callback à l&apos;envoi (Cmd+Enter).</>),
      placeholder: "Placeholder du textarea.",
      showTokenCount: "Affiche indicateur de tokens.",
    },
    examples: "Exemples",
    demoPlaceholder: "Posez votre question...",
    defaultPlaceholder: "Écrivez votre message...",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "Input field for an AI prompt (auto-resize, Cmd+Enter, tokens).",
    category: "AI & Specialized",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      value: "Controlled value.",
      onChange: "Callback on every change.",
      onSubmit: (<>Callback on submit (Cmd+Enter).</>),
      placeholder: "Textarea placeholder.",
      showTokenCount: "Shows the token indicator.",
    },
    examples: "Examples",
    demoPlaceholder: "Ask your question...",
    defaultPlaceholder: "Write your message...",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState(t.demoPlaceholder);
  const [showTokenCount, setShowTokenCount] = useState(false);

  const pyPlaceholder = placeholder !== t.defaultPlaceholder ? `, placeholder="${placeholder.replace(/"/g, '\\"')}"` : "";
  const pyToken = showTokenCount ? ", show_token_count=True" : "";
  const pythonCode = `bpm.promptInput(value=state_value, onChange=set_value, onSubmit=handle_submit${pyPlaceholder}${pyToken})`;
  const { prev, next } = getPrevNext("promptinput");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.promptInput</div>
        <h1>bpm.promptInput</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <PromptInput
            value={value}
            onChange={setValue}
            onSubmit={() => setValue("")}
            placeholder={placeholder}
            showTokenCount={showTokenCount}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>showTokenCount</label>
            <select value={showTokenCount ? "true" : "false"} onChange={(e) => setShowTokenCount(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
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
          <tr><th>{t.head.prop}</th><th>{t.head.type}</th><th>{t.head.def}</th><th>{t.head.req}</th><th>{t.head.desc}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.value}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.onChange}</td></tr>
          <tr><td><code>onSubmit</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.onSubmit}</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>{t.defaultPlaceholder}</td><td>{t.no}</td><td>{t.rows.placeholder}</td></tr>
          <tr><td><code>showTokenCount</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.rows.showTokenCount}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"bpm.promptInput(value=val, onChange=set_val, onSubmit=send)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
