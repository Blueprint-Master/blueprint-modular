"use client";

import { useState } from "react";
import Link from "next/link";
import { StreamingText, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  category: "IA & Spécialisés",
  description: "Affichage de texte en flux (curseur clignotant, option Markdown).",
  copy: "Copier",
  examples: "Exemples",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  descContent: "Texte courant.",
  descIsStreaming: "Curseur clignotant.",
  descRenderMarkdown: "Rendu via bpm.markdown.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  category: "AI & Specialized",
  description: "Streaming text display (blinking cursor, optional Markdown).",
  copy: "Copy",
  examples: "Examples",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  descContent: "Current text.",
  descIsStreaming: "Blinking cursor.",
  descRenderMarkdown: "Rendered via bpm.markdown.",
};
const L = { fr, en } as const;

export default function DocStreamingTextPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [content, setContent] = useState("Texte avec **Markdown**.");
  const [isStreaming, setIsStreaming] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(true);

  const escapedContent = content.replace(/"/g, '\\"');
  const pyStreaming = isStreaming ? ", is_streaming=True" : "";
  const pyMarkdown = !renderMarkdown ? ", render_markdown=False" : "";
  const pythonCode = `bpm.streamingText(content="${escapedContent}"${pyStreaming}${pyMarkdown})`;
  const { prev, next } = getPrevNext("streamingtext");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.streamingText</div>
        <h1>bpm.streamingText</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <StreamingText content={content} isStreaming={isStreaming} renderMarkdown={renderMarkdown} />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>content</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>isStreaming</label>
            <select value={isStreaming ? "true" : "false"} onChange={(e) => setIsStreaming(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>renderMarkdown</label>
            <select value={renderMarkdown ? "true" : "false"} onChange={(e) => setRenderMarkdown(e.target.value === "true")}>
              <option value="true">true</option>
              <option value="false">false</option>
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
          <tr><th>Prop</th><th>Type</th><th>{t.thDefault}</th><th>{t.thRequired}</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>content</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.descContent}</td></tr>
          <tr><td><code>isStreaming</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descIsStreaming}</td></tr>
          <tr><td><code>renderMarkdown</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.descRenderMarkdown}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.streamingText(content="Reponse...", is_streaming=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
