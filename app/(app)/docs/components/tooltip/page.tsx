"use client";

import { useState } from "react";
import Link from "next/link";
import { Tooltip, Button, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";

type Placement = "top" | "bottom" | "left" | "right";

export default function DocTooltipPage() {
  const [content, setContent] = useState("Aide au survol");
  const [placement, setPlacement] = useState<Placement>("top");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [textColor, setTextColor] = useState("");

  const pyBg = backgroundColor.trim() ? ", background_color=\"" + backgroundColor.replace(/"/g, "\\\"") + "\"" : "";
  const pyText = textColor.trim() ? ", text_color=\"" + textColor.replace(/"/g, "\\\"") + "\"" : "";
  const pythonCode = "bpm.tooltip(content=\"" + content.replace(/"/g, "\\\"") + "\", placement=\"" + placement + "\"" + pyBg + pyText + ")";
  const { prev, next } = getPrevNext("tooltip");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">Composants</Link> → bpm.tooltip</div>
        <h1>bpm.tooltip</h1>
        <p className="doc-description">Info-bulle au survol.</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">Feedback</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>
      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Tooltip
            text={content}
            position={placement}
            backgroundColor={backgroundColor.trim() || undefined}
            textColor={textColor.trim() || undefined}
          >
            <Button>Survoler pour le tooltip</Button>
          </Tooltip>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>content</label>
            <input type="text" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>placement</label>
            <select value={placement} onChange={(e) => setPlacement(e.target.value as Placement)}>
              <option value="top">top</option>
              <option value="bottom">bottom</option>
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>backgroundColor (optionnel)</label>
            <input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="ex. #1d1d1f, #048dc3"
            />
          </div>
          <div className="sandbox-control-group">
            <label>textColor (optionnel)</label>
            <input
              type="text"
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              placeholder="ex. #fff, var(--bpm-bg-primary)"
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header"><span>Python</span><button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>Copier</button></div>
          <pre><code>{pythonCode}</code></pre>
        </div>
      </div>
      <table className="props-table">
        <thead><tr><th>Prop</th><th>Type</th><th>Defaut</th><th>Requis</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>content</code></td><td><code>string</code></td><td>—</td><td>Oui</td><td>Texte du tooltip.</td></tr>
          <tr><td><code>children</code></td><td><code>ReactNode</code></td><td>—</td><td>Oui</td><td>Element declencheur.</td></tr>
          <tr><td><code>placement</code></td><td><code>top|bottom|left|right</code></td><td>top</td><td>Non</td><td>Position.</td></tr>
          <tr><td><code>backgroundColor</code></td><td><code>string</code></td><td>var(--bpm-text-primary)</td><td>Non</td><td>Couleur de fond du tooltip (hex, rgb ou nom CSS).</td></tr>
          <tr><td><code>textColor</code></td><td><code>string</code></td><td>var(--bpm-bg-primary)</td><td>Non</td><td>Couleur du texte du tooltip.</td></tr>
        </tbody>
      </table>
      <h2 className="text-lg font-semibold mt-8 mb-2">Exemples</h2>
      <CodeBlock code={'bpm.tooltip(content="Aide", placement="top", trigger=bpm.button("?"))'} language="python" />
      <CodeBlock code={'bpm.tooltip(content="Aide", background_color="#048dc3", text_color="#fff")'} language="python" />
      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
