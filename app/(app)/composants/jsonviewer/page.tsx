"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { JsonViewer, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const DEFAULT_JSON = `{
  "user": {
    "name": "Marie Dupont",
    "email": "marie@example.com",
    "active": true,
    "tags": ["admin", "editor"]
  },
  "stats": { "views": 1250, "likes": 42 },
  "items": [1, 2, 3]
}`;

const fr = {
  components: "Composants",
  description: "Affichage JSON formaté et repliable.",
  category: "Affichage de données",
  enterJson: "Saisissez du JSON",
  invalidJson: "JSON invalide : ",
  enterJsonLeft: "Saisissez du JSON à gauche.",
  levelZero: "0 (tout replié)",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_data: "Objet JavaScript ou chaîne JSON à afficher.",
  d_defaultExpandedLevel: "Nombre de niveaux ouverts par défaut (0 = tout replié).",
  d_maxHeight: "Hauteur max en px (scroll si dépassement).",
  d_className: "Classes CSS additionnelles.",
};

const en: typeof fr = {
  components: "Components",
  description: "Formatted, collapsible JSON display.",
  category: "Data display",
  enterJson: "Enter JSON",
  invalidJson: "Invalid JSON: ",
  enterJsonLeft: "Enter JSON on the left.",
  levelZero: "0 (all collapsed)",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_data: "JavaScript object or JSON string to display.",
  d_defaultExpandedLevel: "Number of levels expanded by default (0 = all collapsed).",
  d_maxHeight: "Max height in px (scrolls if exceeded).",
  d_className: "Additional CSS classes.",
};

const L = { fr, en } as const;

export default function DocJsonViewerPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
  const [defaultExpandedLevel, setDefaultExpandedLevel] = useState(1);
  const [maxHeight, setMaxHeight] = useState(400);

  const { parsed, error } = useMemo(() => {
    const txt = jsonInput.trim();
    if (!txt) return { parsed: null, error: t.enterJson };
    try {
      const p = JSON.parse(txt);
      return { parsed: p, error: null };
    } catch (e) {
      return { parsed: null, error: (e as Error).message };
    }
  }, [jsonInput, t]);

  const pythonCode = `bpm.jsonviewer(data=${JSON.stringify(parsed ?? {})}, default_expanded_level=${defaultExpandedLevel}, max_height=${maxHeight})`;

  const { prev, next } = getPrevNext("jsonviewer");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb">
          <Link href="/composants">{t.components}</Link> → bpm.jsonviewer
        </div>
        <h1>bpm.jsonviewer</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview" style={{ minHeight: 120 }}>
          {error ? (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                background: "var(--bpm-bg-secondary)",
                border: "1px solid var(--bpm-accent)",
                color: "var(--bpm-text-primary)",
              }}
            >
              {t.invalidJson}{error}
            </div>
          ) : parsed !== null ? (
            <JsonViewer
              data={parsed}
              defaultExpandedLevel={defaultExpandedLevel}
              maxHeight={maxHeight}
            />
          ) : (
            <span style={{ color: "var(--bpm-text-secondary)" }}>{t.enterJsonLeft}</span>
          )}
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>data (JSON)</label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={12}
              className="font-mono text-sm"
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid var(--bpm-border)",
                borderRadius: 6,
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
              }}
              spellCheck={false}
            />
          </div>
          <div className="sandbox-control-group">
            <label>defaultExpandedLevel</label>
            <select
              value={defaultExpandedLevel}
              onChange={(e) => setDefaultExpandedLevel(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid var(--bpm-border)",
                borderRadius: 6,
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
              }}
            >
              <option value={0}>{t.levelZero}</option>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>maxHeight (px)</label>
            <input
              type="number"
              value={maxHeight}
              onChange={(e) => setMaxHeight(Number(e.target.value) || 400)}
              min={100}
              max={800}
              step={50}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid var(--bpm-border)",
                borderRadius: 6,
                background: "var(--bpm-surface)",
                color: "var(--bpm-text-primary)",
              }}
            />
          </div>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button type="button" onClick={() => navigator.clipboard.writeText(pythonCode)}>
              {t.copy}
            </button>
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
          <tr>
            <td><code>data</code></td>
            <td><code>object | string</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_data}</td>
          </tr>
          <tr>
            <td><code>defaultExpandedLevel</code></td>
            <td><code>number</code></td>
            <td><code>1</code></td>
            <td>{t.no}</td>
            <td>{t.d_defaultExpandedLevel}</td>
          </tr>
          <tr>
            <td><code>maxHeight</code></td>
            <td><code>number</code></td>
            <td><code>400</code></td>
            <td>{t.no}</td>
            <td>{t.d_maxHeight}</td>
          </tr>
          <tr>
            <td><code>className</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.d_className}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={'bpm.jsonviewer(data={"user": {"name": "Alice"}, "count": 42})'} language="python" />
      <CodeBlock code="bpm.jsonviewer(data=my_dict, default_expanded_level=0, max_height=300)" language="python" />

      <nav className="doc-pagination mt-12">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
