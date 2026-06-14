"use client";

import { useState } from "react";
import Link from "next/link";
import { DiffViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const DEFAULT_ORIGINAL = "function hello() {\n  return 'world';\n}";
const DEFAULT_MODIFIED = "function hello() {\n  return 'world!';\n}";

const fr = {
  components: "Composants",
  description: "Visualisation de diff texte/code (split ou unified).",
  category: "IA & Spécialisés",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_original: "Texte ou code original.",
  d_modified: "Texte ou code modifié.",
  d_language: "Langage pour la coloration (optionnel).",
  d_mode: "Affichage côte à côte ou unifié.",
  d_title: "Titres des colonnes (mode split).",
  d_className: "Classes CSS.",
};

const en: typeof fr = {
  components: "Components",
  description: "Text/code diff viewer (split or unified).",
  category: "AI & Specialized",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_original: "Original text or code.",
  d_modified: "Modified text or code.",
  d_language: "Language for syntax highlighting (optional).",
  d_mode: "Side-by-side or unified display.",
  d_title: "Column titles (split mode).",
  d_className: "CSS classes.",
};

const L = { fr, en } as const;

export default function DocDiffViewerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [original, setOriginal] = useState(DEFAULT_ORIGINAL);
  const [modified, setModified] = useState(DEFAULT_MODIFIED);
  const [mode, setMode] = useState<"split" | "unified">("split");
  const [titleOriginal, setTitleOriginal] = useState("Avant");
  const [titleModified, setTitleModified] = useState("Après");

  const pyMode = mode !== "split" ? `, mode="${mode}"` : "";
  const pyTitle = (titleOriginal !== "Avant" || titleModified !== "Après") ? `, title={"original": "${titleOriginal.replace(/"/g, '\\"')}", "modified": "${titleModified.replace(/"/g, '\\"')}"}` : "";
  const pythonCode = `bpm.diffViewer(original=old_text, modified=new_text${pyMode}${pyTitle})`;
  const { prev, next } = getPrevNext("diffviewer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.diffViewer</div>
        <h1>bpm.diffViewer</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <DiffViewer
            original={original}
            modified={modified}
            mode={mode}
            title={{ original: titleOriginal, modified: titleModified }}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as "split" | "unified")}>
              <option value="split">split</option>
              <option value="unified">unified</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>title.original</label>
            <input type="text" value={titleOriginal} onChange={(e) => setTitleOriginal(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>title.modified</label>
            <input type="text" value={titleModified} onChange={(e) => setTitleModified(e.target.value)} />
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
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>original</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_original}</td></tr>
          <tr><td><code>modified</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_modified}</td></tr>
          <tr><td><code>language</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.d_language}</td></tr>
          <tr><td><code>mode</code></td><td><code>&quot;split&quot; | &quot;unified&quot;</code></td><td>split</td><td>{t.no}</td><td>{t.d_mode}</td></tr>
          <tr><td><code>title</code></td><td><code>{'{ original?: string; modified?: string }'}</code></td><td>—</td><td>{t.no}</td><td>{t.d_title}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.d_className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.diffViewer(original=old_code, modified=new_code)'} language="python" />
      <CodeBlock code={'bpm.diffViewer(original=old_code, modified=new_code, mode="unified")'} language="python" />
      <CodeBlock code={'bpm.diffViewer(original=a, modified=b, title={"original": "v1", "modified": "v2"})'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
