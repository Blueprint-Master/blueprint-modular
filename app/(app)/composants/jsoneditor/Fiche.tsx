"use client";

import { useState } from "react";
import Link from "next/link";
import { JsonEditor, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const INITIAL_JSON = '{"name": "test", "count": 42}';

const fr = {
  components: "Composants",
  description: "Éditeur JSON avec validation et formatage.",
  category: "Utilitaires",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_value: "Contenu JSON (chaîne).",
  d_onChange: "Callback à chaque modification (valeur + validité).",
  d_readOnly: "Mode lecture seule (affichage CodeBlock).",
  d_height: "Hauteur du textarea.",
  d_showValidation: "Afficher le message de validation JSON.",
  d_className: "Classes CSS.",
};

const en: typeof fr = {
  components: "Components",
  description: "JSON editor with validation and formatting.",
  category: "Utilities",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_value: "JSON content (string).",
  d_onChange: "Callback on each change (value + validity).",
  d_readOnly: "Read-only mode (CodeBlock display).",
  d_height: "Textarea height.",
  d_showValidation: "Show the JSON validation message.",
  d_className: "CSS classes.",
};

const L = { fr, en } as const;

export default function DocJsonEditorPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [value, setValue] = useState(INITIAL_JSON);
  const [readOnly, setReadOnly] = useState(false);
  const [height, setHeight] = useState<string | number>(300);
  const [showValidation, setShowValidation] = useState(true);

  const pyReadOnly = readOnly ? ", readOnly=True" : "";
  const pyHeight = height !== 300 ? (typeof height === "number" ? `, height=${height}` : `, height="${height}"`) : "";
  const pyShowValidation = !showValidation ? ", showValidation=False" : "";
  const pythonCode = `bpm.jsonEditor(value=json_str, onChange=handler${pyReadOnly}${pyHeight}${pyShowValidation})`;
  const { prev, next } = getPrevNext("jsoneditor");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.jsonEditor</div>
        <h1>bpm.jsonEditor</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <JsonEditor
            value={value}
            onChange={(v) => setValue(v)}
            readOnly={readOnly}
            height={height}
            showValidation={showValidation}
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
            <label>showValidation</label>
            <select value={showValidation ? "true" : "false"} onChange={(e) => setShowValidation(e.target.value === "true")}>
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
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>{t.thDefault}</th>
            <th>{t.thRequired}</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><code>value</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.d_value}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(value: string, isValid: boolean) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.d_onChange}</td></tr>
          <tr><td><code>readOnly</code></td><td><code>boolean</code></td><td>false</td><td>{t.no}</td><td>{t.d_readOnly}</td></tr>
          <tr><td><code>height</code></td><td><code>string | number</code></td><td>300</td><td>{t.no}</td><td>{t.d_height}</td></tr>
          <tr><td><code>showValidation</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.d_showValidation}</td></tr>
          <tr><td><code>className</code></td><td><code>string</code></td><td>—</td><td>{t.no}</td><td>{t.d_className}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.jsonEditor(value=json_str, onChange=lambda v, ok: set_state(v))'} language="python" />
      <CodeBlock code={'bpm.jsonEditor(value=config_json, onChange=on_change, readOnly=True)'} language="python" />
      <CodeBlock code={'bpm.jsonEditor(value=json_str, onChange=handler, height=400, showValidation=True)'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
