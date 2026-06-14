"use client";

import { useState } from "react";
import Link from "next/link";
import { Expander, CodeBlock } from "@/components/bpm";
import { getPrevNext } from "@/lib/docPages";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const fr = {
  components: "Composants",
  description: "Bloc repliable pour afficher/masquer du contenu.",
  category: "Mise en page",
  demoContent: "Contenu démo : paragraphe, liste, ou tout composant BPM.",
  openByDefault: "Ouvert par défaut",
  copy: "Copier",
  thDefault: "Défaut",
  thRequired: "Requis",
  yes: "Oui",
  no: "Non",
  examples: "Exemples",
  d_title: "Titre du bloc repliable.",
  d_children: "Contenu affiché quand ouvert.",
  d_defaultExpanded: "Ouvert par défaut.",
  d_className: "Classes CSS.",
};

const en: typeof fr = {
  components: "Components",
  description: "Collapsible block to show/hide content.",
  category: "Layout",
  demoContent: "Demo content: paragraph, list, or any BPM component.",
  openByDefault: "Open by default",
  copy: "Copy",
  thDefault: "Default",
  thRequired: "Required",
  yes: "Yes",
  no: "No",
  examples: "Examples",
  d_title: "Title of the collapsible block.",
  d_children: "Content shown when open.",
  d_defaultExpanded: "Open by default.",
  d_className: "CSS classes.",
};

const L = { fr, en } as const;

export default function DocExpanderPage() {
  const { locale } = useI18n();
  const t = L[locale];
  const [title, setTitle] = useState("Voir les détails");
  const [defaultExpanded, setDefaultExpanded] = useState(false);

  const escapedTitle = title.replace(/"/g, '\\"');
  const pythonCode = `bpm.expander(title="${escapedTitle}", default_open=${defaultExpanded}, content=...)`;
  const { prev, next } = getPrevNext("expander");

  return (
    <div className="doc-page">
      <div className="doc-page-header">
        <div className="doc-breadcrumb"><Link href="/composants">{t.components}</Link> → bpm.expander</div>
        <h1>bpm.expander</h1>
        <p className="doc-description">{t.description}</p>
        <div className="doc-meta">
          <span className="doc-badge doc-badge-stable">Stable</span>
          <span className="doc-badge doc-badge-category">{t.category}</span>
          <span className="doc-reading-time">⏱ 2 min</span>
        </div>
      </div>

      <div className="sandbox-container">
        <div className="sandbox-preview">
          <Expander title={title} defaultExpanded={defaultExpanded}>
            <p className="text-sm">{t.demoContent}</p>
          </Expander>
        </div>
        <div className="sandbox-controls">
          <div className="sandbox-control-group">
            <label>title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="sandbox-control-group">
            <label>defaultOpen</label>
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={defaultExpanded} onChange={(e) => setDefaultExpanded(e.target.checked)} />
              {t.openByDefault}
            </label>
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
          <tr>
            <td><code>title</code></td>
            <td><code>string</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_title}</td>
          </tr>
          <tr>
            <td><code>children</code></td>
            <td><code>ReactNode</code></td>
            <td>—</td>
            <td>{t.yes}</td>
            <td>{t.d_children}</td>
          </tr>
          <tr>
            <td><code>defaultExpanded</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>{t.no}</td>
            <td>{t.d_defaultExpanded}</td>
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
      <CodeBlock code={'bpm.expander(title="Configuration avancée", default_open=False, content=bpm.panel(...))'} language="python" />
      <CodeBlock code={'bpm.expander(title="FAQ", content=bpm.write("Réponse..."))'} language="python" />

      <nav className="doc-pagination">
        {prev ? <Link href={"/composants/" + prev}>← bpm.{prev}</Link> : <span />}
        {next ? <Link href={"/composants/" + next}>bpm.{next} →</Link> : <span />}
      </nav>
    </div>
  );
}
