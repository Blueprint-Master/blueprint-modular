"use client";

import { useState } from "react";
import Link from "next/link";
import { ModelSelector, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const DEMO_MODELS = [
  { id: "gpt-4o", label: "GPT-4o", provider: "OpenAI", capabilities: ["chat", "vision"], contextWindow: 128000 },
  { id: "claude-3", label: "Claude 3", provider: "Anthropic", capabilities: ["chat"], contextWindow: 200000 },
];

export default function DocModelSelectorPage() {
  const { locale } = useI18n();
  const fr = {
    breadcrumb: "Composants",
    description: "Sélecteur de modèle IA (par fournisseur, capacités).",
    category: "IA & Spécialisés",
    copy: "Copier",
    head: { prop: "Prop", type: "Type", def: "Défaut", req: "Requis", desc: "Description" },
    yes: "Oui",
    no: "Non",
    rows: {
      models: "Liste des modèles (id, label, provider, capabilities?, contextWindow?).",
      selected: "ID du modèle sélectionné.",
      onChange: "Callback au changement de modèle.",
      showCapabilities: "Afficher les badges de capacités.",
    },
    examples: "Exemples",
  };
  const en: typeof fr = {
    breadcrumb: "Components",
    description: "AI model selector (by provider, capabilities).",
    category: "AI & Specialized",
    copy: "Copy",
    head: { prop: "Prop", type: "Type", def: "Default", req: "Required", desc: "Description" },
    yes: "Yes",
    no: "No",
    rows: {
      models: "List of models (id, label, provider, capabilities?, contextWindow?).",
      selected: "ID of the selected model.",
      onChange: "Callback when the model changes.",
      showCapabilities: "Show the capability badges.",
    },
    examples: "Examples",
  };
  const L = { fr, en } as const;
  const t = L[locale];

  const [selected, setSelected] = useState("gpt-4o");
  const [showCapabilities, setShowCapabilities] = useState(true);

  const pythonCode = `bpm.modelSelector(\n  models=${JSON.stringify(DEMO_MODELS)},\n  selected="${selected}",\n  onChange=set_selected${!showCapabilities ? ",\n  show_capabilities=False" : ""}\n)`;
  const { prev, next } = getPrevNext("modelselector");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.modelSelector</div>
        <h1>bpm.modelSelector</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <ModelSelector
            models={DEMO_MODELS}
            selected={selected}
            onChange={setSelected}
            showCapabilities={showCapabilities}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>selected</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {DEMO_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>
          <div className="sandbox-control-group">
            <label>showCapabilities</label>
            <select value={showCapabilities ? "true" : "false"} onChange={(e) => setShowCapabilities(e.target.value === "true")}>
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
          <tr><th>{t.head.prop}</th><th>{t.head.type}</th><th>{t.head.def}</th><th>{t.head.req}</th><th>{t.head.desc}</th></tr>
        </thead>
        <tbody>
          <tr><td><code>models</code></td><td><code>ModelOption[]</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.models}</td></tr>
          <tr><td><code>selected</code></td><td><code>string</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.selected}</td></tr>
          <tr><td><code>onChange</code></td><td><code>(modelId: string) =&gt; void</code></td><td>—</td><td>{t.yes}</td><td>{t.rows.onChange}</td></tr>
          <tr><td><code>showCapabilities</code></td><td><code>boolean</code></td><td>true</td><td>{t.no}</td><td>{t.rows.showCapabilities}</td></tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock code={"models = [{\"id\": \"gpt-4o\", \"label\": \"GPT-4o\", \"provider\": \"OpenAI\"}]\nbpm.modelSelector(models=models, selected=current, onChange=set_current)"} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/docs/components/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/docs/components/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
