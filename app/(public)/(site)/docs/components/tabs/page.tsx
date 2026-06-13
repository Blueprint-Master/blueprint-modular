"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  breadcrumb: "Composants",
  category: "Mise en page",
  description: "Onglets pour organiser le contenu en sections.",
  copy: "Copier",
  examples: "Exemples",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  activeTabLabel: "Onglet actif :",
  descTabs: "Liste d’onglets (label, content optionnel, key).",
  descDefaultTab: "Index de l’onglet affiché par défaut.",
  descOnChange: "Callback au changement d’onglet.",
  tab1Label: "Vue générale",
  tab1Content: "Contenu de la vue générale : KPIs, graphiques, résumé.",
  tab2Label: "Détails",
  tab2Content: "Contenu des détails : tableau, filtres, export.",
  tab3Label: "Historique",
  tab3Content: "Contenu de l’historique : timeline, événements.",
};
const en: typeof fr = {
  breadcrumb: "Components",
  category: "Layout",
  description: "Tabs to organize content into sections.",
  copy: "Copy",
  examples: "Examples",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  activeTabLabel: "Active tab:",
  descTabs: "List of tabs (label, optional content, key).",
  descDefaultTab: "Index of the tab shown by default.",
  descOnChange: "Callback on tab change.",
  tab1Label: "Overview",
  tab1Content: "Overview content: KPIs, charts, summary.",
  tab2Label: "Details",
  tab2Content: "Details content: table, filters, export.",
  tab3Label: "History",
  tab3Content: "History content: timeline, events.",
};
const L = { fr, en } as const;

export default function DocTabsPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [activeTab, setActiveTab] = useState(0);

  const DEMO_TABS = [
    { label: t.tab1Label, content: <p>{t.tab1Content}</p> },
    { label: t.tab2Label, content: <p>{t.tab2Content}</p> },
    { label: t.tab3Label, content: <p>{t.tab3Content}</p> },
  ];

  const pythonCode = `bpm.tabs([
    {"label": "Vue générale", "content": vue_generale_fn},
    {"label": "Détails", "content": details_fn},
    {"label": "Historique", "content": historique_fn},
], default_tab=${activeTab})`;

  const { prev, next } = getPrevNext("tabs");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/docs/components">{t.breadcrumb}</Link> → bpm.tabs</div>
        <h1>bpm.tabs</h1>
        <p className="doc-description">
          {t.description}
        </p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Tabs
            tabs={DEMO_TABS}
            defaultTab={activeTab}
            onChange={(index) => setActiveTab(index)}
          />
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>defaultTab (0–2)</label>
            <input
              type="number"
              min={0}
              max={2}
              value={activeTab}
              onChange={(e) => setActiveTab(Math.max(0, Math.min(2, Number(e.target.value) || 0)))}
            />
          </div>
          <p className="text-sm mt-2" style={{ color: "var(--bpm-text-secondary)" }}>
            {t.activeTabLabel} {DEMO_TABS[activeTab]?.label ?? activeTab}
          </p>
        </div>
        <div className="sandbox-code">
          <div className="sandbox-code-header">
            <span>Python</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(pythonCode)}
            >
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
            <td><code>tabs</code></td>
            <td><code>(Tab | string)[]</code></td>
            <td><code>[]</code></td>
            <td>{t.yes}</td>
            <td>{t.descTabs}</td>
          </tr>
          <tr>
            <td><code>defaultTab</code></td>
            <td><code>number</code></td>
            <td><code>0</code></td>
            <td>{t.no}</td>
            <td>{t.descDefaultTab}</td>
          </tr>
          <tr>
            <td><code>onChange</code></td>
            <td><code>(index: number) =&gt; void</code></td>
            <td>—</td>
            <td>{t.no}</td>
            <td>{t.descOnChange}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-lg font-semibold mt-8 mb-2">{t.examples}</h2>
      <CodeBlock
        code={`tabs = [
    {"label": "Résumé", "content": bpm.panel("Résumé du rapport...")},
    {"label": "Données", "content": bpm.table(df)},
]
bpm.tabs(tabs, default_tab=0)`}
        language="python"
      />
      <CodeBlock
        code={`# Onglets en chaînes (sans contenu)
bpm.tabs(["Étape 1", "Étape 2", "Étape 3"], default_tab=1)`}
        language="python"
      />

      <nav className="doc-pagination">
        {prev ? (
          <Link href={`/docs/components/${prev}`}>← bpm.{prev}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/docs/components/${next}`}>bpm.{next} →</Link>
        ) : <span />}
      </nav>
    </div>
  );
}
