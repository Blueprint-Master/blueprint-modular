"use client";

import { useState } from "react";
import Link from "next/link";
import { CodeEditor, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Éditeur de code (textarea avec valeur, onChange, readOnly).",
  category: "Utilitaires",
  copy: "Copier",
  placeholderOptional: "Optionnel",
  examples: "Exemples",
  thDefault: "Défaut",
  thRequired: "Requis",
  thDescription: "Description",
  yes: "Oui",
  no: "Non",
  descValue: "Contenu de l'éditeur.",
  descOnChange: "Callback à chaque modification.",
  descLanguage: "Langage (optionnel).",
  descReadOnly: "Mode lecture seule.",
  descHeight: "Hauteur.",
  descPlaceholder: "Placeholder du textarea.",
  descClassName: "Classes CSS.",
};
const en: typeof fr = {
  components: "Components",
  description: "Code editor (textarea with value, onChange, readOnly).",
  category: "Utilities",
  copy: "Copy",
  placeholderOptional: "Optional",
  examples: "Examples",
  thDefault: "Default",
  thRequired: "Required",
  thDescription: "Description",
  yes: "Yes",
  no: "No",
  descValue: "Editor content.",
  descOnChange: "Callback on each change.",
  descLanguage: "Language (optional).",
  descReadOnly: "Read-only mode.",
  descHeight: "Height.",
  descPlaceholder: "Textarea placeholder.",
  descClassName: "CSS classes.",
};
const L = { fr, en } as const;

export default function DocCodeEditorPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [value, setValue] = useState("function hello() {\n  return 'world';\n}");
  const [readOnly, setReadOnly] = useState(false);
  const [height, setHeight] = useState<string | number>(300);
  const [placeholder, setPlaceholder] = useState("");

  const pyReadOnly = readOnly ? ", readOnly=True" : "";
  const pyHeight = height !== 300 ? (typeof height === "number" ? `, height=${height}` : `, height="${height}"`) : "";
  const pyPlaceholder = placeholder.trim() ? `, placeholder="${placeholder.trim().replace(/"/g, '\\"')}"` : "";
  const pythonCode = `bpm.codeEditor(value=code, onChange=handler${pyReadOnly}${pyHeight}${pyPlaceholder})`;
  const { prev, next } = getPrevNext("codeeditor");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.codeEditor</div>
        <h1>bpm.codeEditor</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <CodeEditor
            value={value}
            onChange={setValue}
            readOnly={readOnly}
            height={height}
            placeholder={placeholder || undefined}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>readOnly</label>
            <select value={readOnly ? "true" : "false"} onChange={(e) => setReadOnly(e.target.value === "true")}>
              <option value="false">false</option>
              <option value="true">true</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>height</label>
            <input type="text" value={height} onChange={(e) => setHeight(e.target.value === "" ? 300 : e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>placeholder</label>
            <input type="text" value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} placeholder={t.placeholderOptional} />
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
            <th>{t.thDescription}</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.descValue}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.descOnChange}</td></tr>
          <tr><td><code>language</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descLanguage}</td></tr>
          <tr><td><code>readOnly</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.descReadOnly}</td></tr>
          <tr><td><code>height</code></td><td><code>string | number</code></td><td>300</td><td>{t.no}</td><td>{t.descHeight}</td></tr>
          <tr><td><code>placeholder</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descPlaceholder}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.descClassName}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.codeEditor(value=code, onChange=set_code)'} language="python" />
      <CodeBlock code={'bpm.codeEditor(value=code, onChange=handler, readOnly=True)'} language="python" />
      <CodeBlock code={'bpm.codeEditor(value=code, onChange=handler, height=400, placeholder="Collez du code...")'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
